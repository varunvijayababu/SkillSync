const express = require("express");
const multer = require("multer");
const { uploadResume, getHistory } = require("../controllers/uploadController");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/history", getHistory);

module.exports = router;
