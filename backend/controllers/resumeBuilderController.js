const { sendSuccess, sendError } = require("../utils/apiResponse");
const { computeAndSaveAnalysis } = require("../utils/analysisEngine");
const { generateAI } = require("../utils/ai");

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

const normalizeAiBullet = (value) =>
  String(value || "")
    .replace(/```/g, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/^"|"$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toSentenceCase = (value) => {
  const cleaned = String(value || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const getSectionGuidance = (section) => {
  switch (String(section || "").toLowerCase()) {
    case "projects":
      return [
        "Focus on implementation details, technical choices, architecture, APIs, and shipped functionality.",
        "Highlight technologies only when they support the accomplishment.",
      ].join(" ");
    case "experience":
      return [
        "Focus on responsibilities, ownership, collaboration, operations, optimization, and business impact.",
        "Keep the tone employer-ready and realistic.",
      ].join(" ");
    case "education":
      return [
        "Focus on relevant coursework, academic rigor, specialization, research, capstones, or practical learning outcomes.",
        "Keep it concise and credible.",
      ].join(" ");
    case "achievements":
      return "Focus on recognition, results, competitive standing, or notable accomplishment without exaggeration.";
    default:
      return "Write a polished, ATS-friendly resume bullet that sounds natural, specific, and believable.";
  }
};

const buildLocalRewrite = ({ sourceText, section, role }) => {
  const cleaned = toSentenceCase(sourceText).replace(/[.]+$/, "");
  const normalizedSection = String(section || "").toLowerCase();
  const targetRole = String(role || "professional role").trim();

  if (!cleaned) return "";

  if (normalizedSection === "projects") {
    if (/api|backend|frontend|react|node|mongo|express|full stack|full-stack|dashboard|app|application/i.test(cleaned)) {
      return `Built ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)} with a focus on implementation quality, maintainable architecture, and user-facing functionality.`;
    }
    return `Delivered a project centered on ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}, emphasizing technical execution and practical problem-solving.`;
  }

  if (normalizedSection === "experience") {
    if (/^\d+\s*(year|years|month|months)\b/i.test(cleaned)) {
      return `Contributed in a ${targetRole} capacity over ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}, supporting day-to-day delivery, collaboration, and continuous improvement efforts.`;
    }
    return `Handled ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)} while collaborating across teams and supporting reliable execution of key responsibilities.`;
  }

  if (normalizedSection === "education") {
    return `Built relevant academic foundation through ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}, strengthening knowledge applicable to ${targetRole}.`;
  }

  if (normalizedSection === "achievements") {
    return `Recognized for ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)} through consistent performance and meaningful contribution.`;
  }

  return `Strengthened professional profile through ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)} in alignment with ${targetRole}.`;
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

const rewriteBullet = async (req, res) => {
  try {
    const { text, bullet, role, section, avoidText, variation } = req.body;
    const sourceText = String(text || bullet || "").trim();

    if (!sourceText) {
      return sendError(res, "Resume content is required", 400);
    }

    console.log("REWRITE REQUEST:", {
      section: section || "general",
      role: role || "professional",
      variation: Boolean(variation),
      sourceLength: sourceText.length,
      hasAvoidText: Boolean(String(avoidText || "").trim()),
    });

    const fallbackBullet = buildLocalRewrite({ sourceText, section, role }) || sourceText;

    const prompt = `
You are an expert resume writer.

Rewrite the following resume content into a strong, realistic, ATS-friendly professional bullet point.

Context:
- Resume Section: ${section || "general"}
- Target Role: ${role || "professional"}

Section Guidance:
${getSectionGuidance(section)}

Rules:
- Understand the meaning and intent of the input
- Do NOT invent fake metrics unless truly appropriate from the input
- Avoid generic wording and repetition
- Use strong professional action verbs
- Keep it concise, natural, and believable
- Expand short inputs intelligently
- Make project descriptions technical and implementation-focused
- Make experience descriptions responsibility-focused or impact-focused
- ${variation ? "Produce a noticeably different phrasing style from prior outputs while preserving the same meaning." : "Produce the best first-pass version."}
- ${avoidText ? `Do NOT closely repeat this previous version: "${String(avoidText).trim()}"` : "Do not reuse stale phrasing patterns."}
- Output ONLY the improved bullet point
- Avoid repeating previous output styles

Input:
"${sourceText}"
`;

    let improvedBullet = fallbackBullet;
    let source = "fallback";

    try {
      const aiResponse = await generateAI(prompt);
      console.log("REWRITE AI RAW RESPONSE:", aiResponse);
      const normalized = normalizeAiBullet(aiResponse);
      if (normalized) {
        improvedBullet = normalized;
        source = "ai";
      }
    } catch (error) {
      console.error("REWRITE AI ERROR:", {
        message: error.message,
        stack: error.stack,
      });
    }

    if (!improvedBullet) {
      improvedBullet = sourceText;
      source = "original";
    }

    console.log("REWRITE FINAL BULLET:", improvedBullet);

    return sendSuccess(
      res,
      {
        improvedBullet,
        source,
      },
      "Bullet rewritten successfully"
    );
  } catch (error) {
    console.error("REWRITE ERROR:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    return sendError(res, "Failed to rewrite bullet", 500);
  }
};

module.exports = {
  generateResume,
  rewriteBullet,
};
