const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  latestProfile: {
    name: String,
    role: String,
    skills: [String],
    education: [String],
    experience: [String],
    projects: [String],
    achievements: [String],
    updatedAt: Date,
  },
});

module.exports = mongoose.model("User", userSchema);