const express = require("express");
const { generateResume, rewriteBullet } = require("../controllers/resumeBuilderController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/resume-builder", authMiddleware, generateResume);
router.post("/rewrite", authMiddleware, rewriteBullet);

module.exports = router;
