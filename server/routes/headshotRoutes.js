const express = require("express");
const multer = require("multer");
const { uploadHeadshot } = require("../controllers/headshotController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG files are allowed"));
    }
  },
});

router.post(
  "/headshot",
  verifyToken,
  upload.single("headshot"),
  uploadHeadshot
);

module.exports = router;