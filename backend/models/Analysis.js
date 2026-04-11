const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: String,
  score: Number,
  matchedSkills: [String],
  missingSkills: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Analysis", analysisSchema);