const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const fileController = require("../controllers/file.controller");
const fileAccess = require("../middleware/fileAccess.middleware");
const roleCheck = require("../middleware/roles.middleware");

router.post(
  "/upload",
  authMiddleware,
  upload.array("files"),
  fileController.uploadFiles
);

router.get("/", authMiddleware, fileController.getMyFiles);

router.get(
  "/:id/download",
  authMiddleware,
  fileAccess,
  fileController.downloadFile
);

router.get(
  "/:id/download",
  authMiddleware,
  fileAccess,
  fileController.downloadFile
);

router.post("/:id/share/users", authMiddleware, fileController.shareWithUsers);

router.post(
  "/:id/share/users",
  authMiddleware,
  roleCheck("owner"),
  fileController.shareWithUsers
);

module.exports = router;
