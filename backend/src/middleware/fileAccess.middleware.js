const db = require("../db");

module.exports = async (req, res, next) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  // Owner always allowed
  const [[owner]] = await db.query(
    "SELECT id FROM files WHERE id = ? AND owner_id = ?",
    [fileId, userId]
  );

  if (owner) return next();

  // Explicit user access
  const [[access]] = await db.query(
    `SELECT id FROM file_access
     WHERE file_id = ? AND user_id = ?`,
    [fileId, userId]
  );

  if (access) return next();

  return res.status(403).json({ message: "Access denied" });
};
