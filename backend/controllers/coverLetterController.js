const generateCoverLetter = require("../utils/coverLetter");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const createCoverLetter = (req, res) => {
  try {
    const { name, role, skills } = req.body;

    if (!name || !role) {
      return sendError(res, "Name and role are required", 400);
    }

    const safeSkills = Array.isArray(skills) ? skills : [];
    const letter = generateCoverLetter(name, role, safeSkills);

    return sendSuccess(
      res,
      { letter },
      "Cover letter generated"
    );
  } catch (error) {
    console.error("COVER LETTER ERROR:", error);
    return sendError(res, "Cover letter generation failed", 500);
  }
};

module.exports = {
  createCoverLetter,
};
