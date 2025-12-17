const db = require("../db");

exports.logAction = async (userId, fileId, action) => {
  await db.query(
    `INSERT INTO audit_logs (user_id, file_id, action)
     VALUES (?, ?, ?)`,
    [userId, fileId, action]
  );
};
