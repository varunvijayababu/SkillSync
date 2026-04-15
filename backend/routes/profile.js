const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getLatestProfile, saveLatestProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/profile/latest", authMiddleware, getLatestProfile);
router.post("/profile/latest", authMiddleware, saveLatestProfile);

module.exports = router;
