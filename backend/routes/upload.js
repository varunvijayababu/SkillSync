const express = require("express");
const multer = require("multer");
const { uploadResume, getHistory, compareResumes, parseResume } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.get("/history", authMiddleware, getHistory);
router.post("/compare", authMiddleware, upload.fields([{ name: "resumeA", maxCount: 1 }, { name: "resumeB", maxCount: 1 }]), compareResumes);
router.post("/parse", authMiddleware, upload.single("resume"), parseResume);

module.exports = router;
