const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getLatestProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select("latestProfile");
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, user.latestProfile || null, "Latest profile fetched");
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return sendError(res, "Failed to fetch latest profile", 500);
  }
};

const saveLatestProfile = async (req, res) => {
  try {
    const { name, role, skills, education, experience, projects, achievements } = req.body;

    const profilePayload = {
      name: name || "",
      role: role || "Frontend Developer",
      skills: Array.isArray(skills) ? skills : [],
      education: Array.isArray(education) ? education : [],
      experience: Array.isArray(experience) ? experience : [],
      projects: Array.isArray(projects) ? projects : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      updatedAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { latestProfile: profilePayload },
      { new: true }
    ).select("latestProfile");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, user.latestProfile, "Latest profile saved");
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    return sendError(res, "Failed to save latest profile", 500);
  }
};

module.exports = {
  getLatestProfile,
  saveLatestProfile,
};
