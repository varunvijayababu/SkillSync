require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { sendError, sendSuccess } = require("./utils/apiResponse");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const roadmapRoutes = require("./routes/roadmap");
const coverLetterRoutes = require("./routes/coverLetter");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("SkillSync Backend Running");
});

app.get("/api/test", (req, res) => {
  return sendSuccess(res, { message: "Backend is connected successfully" }, "API online");
});

app.use("/api", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", roadmapRoutes);
app.use("/api", coverLetterRoutes);

app.use((req, res) => {
  return sendError(res, "Route not found", 404);
});

app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  return sendError(res, "Internal server error", 500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
