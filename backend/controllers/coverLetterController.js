const generateCoverLetter = require("../utils/coverLetter");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { generateAI } = require("../utils/ai");

const createCoverLetter = async (req, res) => {
  try {
    const { name, role, skills, missingSkills } = req.body;

    if (!name || !role) {
      return sendError(res, "Name and role are required", 400);
    }

    const safeSkills = Array.isArray(skills) ? skills : [];
    const safeMissingSkills = Array.isArray(missingSkills) ? missingSkills : [];
    let letter = "";

    try {
      const prompt = `
Write a professional cover letter.

Name: ${name}
Role: ${role}
Skills: ${safeSkills.join(", ")}
Missing Skills: ${safeMissingSkills.join(", ")}

Keep it concise and personalized.
`;
      letter = await generateAI(prompt);
    } catch (aiError) {
      console.error("COVER LETTER AI ERROR:", aiError);
      letter = generateCoverLetter(name, role, safeSkills);
    }

    return sendSuccess(
      res,
      { letter, coverLetter: letter },
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
