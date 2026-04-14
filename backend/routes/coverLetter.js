const express = require("express");
const { createCoverLetter } = require("../controllers/coverLetterController");

const router = express.Router();

router.post("/cover-letter", createCoverLetter);

module.exports = router;
