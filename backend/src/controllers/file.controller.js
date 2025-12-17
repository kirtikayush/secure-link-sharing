const db = require("../db");
const path = require("path");
const { logAction } = require("../utils/audit");

exports.uploadFiles = async (req, res) => {
  try {
    const files = req.files;

    for (const file of files) {
      const [result] = await db.query(
        `INSERT INTO files 
         (owner_id, original_name, stored_name, mime_type, size, path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
          file.path,
        ]
      );

      await db.query(
        `INSERT INTO file_access (file_id, user_id, role)
         VALUES (?, ?, 'owner')`,
        [result.insertId, req.user.id]
      );
      await logAction(req.user.id, result.insertId, "UPLOAD");
    }

    res.json({ message: "Files uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.getMyFiles = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        f.id,
        f.original_name,
        f.mime_type,
        f.size,
        f.created_at,
        fa.role
      FROM file_access fa
      JOIN files f ON f.id = fa.file_id
      WHERE fa.user_id = ?
      `,
      [req.user.id]
    );

    res.json({ files: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};

exports.shareWithUsers = async (req, res) => {
  const { userEmails } = req.body;
  const fileId = req.params.id;

  if (!Array.isArray(userEmails) || userEmails.length === 0) {
    return res.status(400).json({ message: "User email required" });
  }

  // Ensure requester is owner
  const [[file]] = await db.query(
    "SELECT * FROM files WHERE id = ? AND owner_id = ?",
    [fileId, req.user.id]
  );

  if (!file) {
    return res.status(403).json({ message: "Not owner of file" });
  }

  // Convert emails → user IDs
  const [users] = await db.query("SELECT id FROM users WHERE email IN (?)", [
    userEmails,
  ]);

  if (users.length === 0) {
    return res.status(404).json({ message: "User does not exist" });
  }

  for (const user of users) {
    await db.query(
      `INSERT IGNORE INTO file_access (file_id, user_id, role)
       VALUES (?, ?, 'viewer')`,
      [fileId, user.id]
    );
  }

  // Audit log
  await logAction(req.user.id, fileId, "SHARE");

  res.json({ message: "File shared successfully" });
};

exports.downloadFile = async (req, res) => {
  const fileId = req.params.id;

  const [[file]] = await db.query("SELECT * FROM files WHERE id = ?", [fileId]);

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }
  await logAction(req.user.id, file.id, "DOWNLOAD");

  res.download(path.resolve(file.path), file.original_name);
};
