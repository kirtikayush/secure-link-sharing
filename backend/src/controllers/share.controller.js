const { v4: uuid } = require("uuid");
const db = require("../db");
const { logAction } = require("../utils/audit");

//? Create Shareable Link
exports.createShareLink = async (req, res) => {
  const fileId = req.params.id;

  const [[file]] = await db.query(
    "SELECT * FROM files WHERE id = ? AND owner_id = ?",
    [fileId, req.user.id]
  );

  if (!file) {
    return res.status(403).json({ message: "Not owner" });
  }

  const token = uuid();

  await db.query(
    `INSERT INTO share_links (file_id, token, created_by)
     VALUES (?, ?, ?)`,
    [fileId, token, req.user.id]
  );

  await logAction(req.user.id, fileId, "SHARE");

  res.json({
    link: `http://localhost:5050/share/${token}`,
  });
};

//? Access vis Link with login only
exports.accessViaLink = async (req, res, next) => {
  try {
    const token = req.params.token;

    const [[link]] = await db.query(
      "SELECT * FROM share_links WHERE token = ?",
      [token]
    );

    if (!link) {
      return res.status(404).json({ message: "Invalid link" });
    }

    // Attach fileId so next middleware can use it
    req.params.id = link.file_id;

    next(); // ✅ THIS is what Express was missing
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Share link error" });
  }
};
