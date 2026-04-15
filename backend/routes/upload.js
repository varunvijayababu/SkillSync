const express = require("express");
const multer = require("multer");
const { uploadResume, getHistory } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.get("/history", authMiddleware, getHistory);

module.exports = router;
