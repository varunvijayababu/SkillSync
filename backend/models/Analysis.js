const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: String,
  role: String,
  versionNumber: Number,
  versionLabel: String,
  score: Number,
  weightedReadinessScore: Number,
  roleReadinessPercentage: Number,
  readinessBreakdown: {
    critical: {
      matched: Number,
      total: Number,
      weight: Number,
      score: Number,
    },
    important: {
      matched: Number,
      total: Number,
      weight: Number,
      score: Number,
    },
    niceToHave: {
      matched: Number,
      total: Number,
      weight: Number,
      score: Number,
    },
  },
  totalRequiredSkills: Number,
  matchedSkills: [String],
  missingSkills: [String],
  suggestions: [String],
  skillPriority: {
    critical: [String],
    important: [String],
    niceToHave: [String],
  },
  keywordHeatmap: [
    {
      keyword: String,
      status: String,
      count: Number,
    },
  ],
  careerPathSuggestions: [
    {
      role: String,
      matchScore: Number,
      reason: String,
    },
  ],
  interviewReadiness: {
    overallScore: Number,
    topics: [String],
    questions: [String],
    preparationRoadmap: [String],
  },
  ethicalAts: {
    stuffingDetected: Boolean,
    repeatedKeywordCount: Number,
    warning: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Analysis", analysisSchema);