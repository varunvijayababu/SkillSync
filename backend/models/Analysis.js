const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: String,
  role: String,
  versionNumber: Number,
  versionLabel: String,
  score: Number,
  roleReadinessPercentage: Number,
  totalRequiredSkills: Number,
  matchedSkills: [String],
  missingSkills: [String],
  suggestions: [String],
  skillPriority: {
    critical: [String],
    important: [String],
    niceToHave: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Analysis", analysisSchema);