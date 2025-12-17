const db = require("../db");

module.exports = (requiredRole) => {
  return async (req, res, next) => {
    const fileId = req.params.id;
    const userId = req.user.id;

    const [[access]] = await db.query(
      `SELECT role FROM file_access
       WHERE file_id = ? AND user_id = ?`,
      [fileId, userId]
    );

    if (!access) {
      return res.status(403).json({ message: "No access" });
    }

    if (requiredRole === "owner" && access.role !== "owner") {
      return res.status(403).json({ message: "Owner role required" });
    }

    next();
  };
};
