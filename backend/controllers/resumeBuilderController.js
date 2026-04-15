const { sendSuccess, sendError } = require("../utils/apiResponse");
const { computeAndSaveAnalysis } = require("../utils/analysisEngine");

const splitItems = (value) =>
  String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const createResumeText = ({ name, role, skills, education, experience, projects, achievements }) => {
  return [
    `${name}`,
    role ? `Target Role: ${role}` : "",
    "",
    "SKILLS",
    ...skills.map((item) => `- ${item}`),
    "",
    "EDUCATION",
    ...education.map((item) => `- ${item}`),
    "",
    "EXPERIENCE",
    ...experience.map((item) => `- ${item}`),
    "",
    "PROJECTS",
    ...projects.map((item) => `- ${item}`),
    "",
    "ACHIEVEMENTS",
    ...achievements.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");
};

const generateResume = async (req, res) => {
  try {
    const { name, role, skills, education, experience, projects, achievements } = req.body;

    if (!name) {
      return sendError(res, "Name is required", 400);
    }

    const structuredResume = {
      name,
      role: role || "Frontend Developer",
      skills: Array.isArray(skills) ? skills : splitItems(skills),
      education: Array.isArray(education) ? education : splitItems(education),
      experience: Array.isArray(experience) ? experience : splitItems(experience),
      projects: Array.isArray(projects) ? projects : splitItems(projects),
      achievements: Array.isArray(achievements) ? achievements : splitItems(achievements),
    };

    const resumeText = createResumeText(structuredResume);

    const analysis = await computeAndSaveAnalysis({
      userId: req.user?.id || "demoUser",
      roleInput: structuredResume.role,
      sourceText: resumeText,
    });

    return sendSuccess(
      res,
      {
        resume: {
          ...structuredResume,
          formattedText: resumeText,
        },
        analysis,
      },
      "Resume generated and analyzed successfully"
    );
  } catch (error) {
    console.error("RESUME BUILDER ERROR:", error);
    return sendError(res, "Resume generation failed", 500);
  }
};

module.exports = {
  generateResume,
};
