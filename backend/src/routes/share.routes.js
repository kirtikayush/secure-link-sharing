const express = require("express");
const router = express.Router();

const {
  createShareLink,
  accessViaLink,
} = require("../controllers/share.controller");

const auth = require("../middleware/auth.middleware");
const fileAccess = require("../middleware/fileAccess.middleware");

// OWNER creates share link
router.post("/files/:id/share/link", auth, createShareLink);

// Logged-in users access shared file via link
router.get("/share/:token", auth, accessViaLink, fileAccess, (req, res) => {
  res.redirect(`/files/${req.params.id}/download`);
});

module.exports = router;
