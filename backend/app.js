console.log("APP FILE LOADED");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const connectDB = require("./config/db");

const express = require("express");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const analyzeResume = require("./utils/analyze");
const Analysis = require("./models/Analysis");
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SkillSync Backend Running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected successfully 🚀" });
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "User registered successfully ✅" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // create token
    const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

    res.json({
      message: "Login successful ✅",
      token,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const role = req.body.role || "frontend";

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    const result = analyzeResume(text, jobRoles[role]);

    // 👇 NEW PART (DB SAVE)
    const userId = "demoUser"; // later from JWT

    const newAnalysis = new Analysis({
      userId,
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
    });

    await newAnalysis.save();

    // 👇 RESPONSE
    res.json({
      message: "Analysis complete ✅",
      ...result,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Processing failed" });
  }
});

const jobRoles = {
  "frontend": ["html", "css", "javascript", "react"],
  "backend": ["node", "express", "mongodb", "sql"],
  "data scientist": ["python", "machine learning", "data analysis"]
};

const generateCoverLetter = require("./utils/coverLetter");

app.post("/api/cover-letter", (req, res) => {
  try {
    const { name, role, skills } = req.body;

    const letter = generateCoverLetter(name, role, skills);

    res.json({
      message: "Cover letter generated ✅",
      letter,
    });
  } catch (error) {
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/history", async (req, res) => {
  try {
    const data = await Analysis.find({ userId: "demoUser" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});
