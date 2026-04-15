const express = require("express");
const { generateResume } = require("../controllers/resumeBuilderController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/resume-builder", authMiddleware, generateResume);

module.exports = router;
