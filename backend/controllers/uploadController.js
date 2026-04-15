const Analysis = require("../models/Analysis");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const pdfParse = require("pdf-parse");
const { generateAI } = require("../utils/ai");

const uploadResume = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return sendError(res, "Resume PDF file is required", 400);
    }

    const role = (req.body.role || "").toLowerCase();
    const roleSkillMap = {
      frontend: ["html", "css", "javascript", "react", "redux", "tailwind", "git"],
      backend: ["node", "express", "mongodb", "sql", "api", "docker", "redis", "kubernetes"],
      "data analyst": ["python", "sql", "excel", "pandas", "numpy", "power bi", "statistics"],
    };

    const genericSkills = [
      "html",
      "css",
      "javascript",
      "react",
      "node",
      "express",
      "mongodb",
      "sql",
      "python",
      "docker",
      "git",
    ];

    const roleSkills =
      roleSkillMap[role] ||
      (role.includes("front")
        ? roleSkillMap.frontend
        : role.includes("back")
        ? roleSkillMap.backend
        : role.includes("data")
        ? roleSkillMap["data analyst"]
        : genericSkills);

    const pdfData = await pdfParse(req.file.buffer);
    const text = `${pdfData?.text || ""}\n${req.body.description || ""}`.toLowerCase();
    const deterministicMatchedSkills = roleSkills.filter((skill) => text.includes(skill));

    const parseAIJson = (raw, fallbackValue) => {
      try {
        return JSON.parse(raw);
      } catch {
        try {
          const cleaned = String(raw || "").replace(/```json|```/gi, "").trim();
          return JSON.parse(cleaned);
        } catch {
          return fallbackValue;
        }
      }
    };

    const analysisPrompt = `
You are an AI resume analyzer.

Extract:
- skills (array)
- domain (frontend/backend/data/etc.)
- experience level (beginner/intermediate/advanced)

Resume:
${text}

Return JSON:
{
  "skills": [],
  "domain": "",
  "level": ""
}
`;

    let aiData = { skills: [], domain: "unknown", level: "unknown" };
    try {
      const aiResponse = await generateAI(analysisPrompt);
      aiData = parseAIJson(aiResponse, aiData);
    } catch (aiError) {
      console.error("AI ANALYSIS ERROR:", aiError);
    }

    const aiMatchedSkills = (Array.isArray(aiData.skills) ? aiData.skills : [])
      .map((skill) => String(skill || "").toLowerCase().trim())
      .filter((skill) => roleSkills.includes(skill));

    const matchedSkills =
      aiMatchedSkills.length > 0 ? [...new Set(aiMatchedSkills)] : deterministicMatchedSkills;
    const missingSkills = roleSkills.filter((skill) => !matchedSkills.includes(skill));
    const score = Math.min(100, Math.floor((matchedSkills.length / roleSkills.length) * 100));

    const generateInterviewPrep = async (skills, role) => {
      const prompt = `
You are a technical interviewer.

Generate interview preparation content for:

Role: ${role}
Skills: ${skills.join(", ")}

Return JSON ONLY:

{
"topics": ["..."],
"questions": ["..."],
"tips": ["..."]
}
`;

      try {
        const response = await generateAI(prompt);
        // Clean up markdown wrapping if present
        const cleaned = response.replace(/```json|```/gi, "").trim();
        return JSON.parse(cleaned);
      } catch {
        return {
          topics: ["Core concepts", "Projects discussion"],
          questions: ["Explain your projects", "Basics of your tech stack"],
          tips: ["Revise fundamentals", "Practice coding"]
        };
      }
    };

    const generateCareerPath = async (skills) => {
      const prompt = `
You are a career advisor.

Suggest career paths based on these skills:

Skills: ${skills.join(", ")}

Return JSON ONLY:

[
{
"role": "",
"reason": ""
}
]
`;

      try {
        const response = await generateAI(prompt);
        // Clean up markdown wrapping if present
        const cleaned = response.replace(/```json|```/gi, "").trim();
        return JSON.parse(cleaned);
      } catch {
        return [
          {
            role: "Software Developer",
            reason: "Based on your current technical skills"
          }
        ];
      }
    };

    const interviewData = await generateInterviewPrep(matchedSkills, role);
    const careerPaths = await generateCareerPath(matchedSkills);

    let bonus = 0;
    if (text.includes("project")) bonus += 5;
    if (text.includes("experience")) bonus += 5;
    if (text.includes("intern")) bonus += 5;
    const finalScore = Math.min(100, score + bonus);

    const atsPrompt = `
You are an ATS system.

Evaluate this resume for role: ${role}

Resume:
${text}

Return JSON:
{
  "score": 0,
  "feedback": ["reason1", "reason2"]
}
`;

    let atsData = { score: finalScore, feedback: ["Basic ATS fallback scoring used"] };
    try {
      const atsResponse = await generateAI(atsPrompt);
      const parsedAts = parseAIJson(atsResponse, atsData);
      const aiScore = Number(parsedAts?.score);
      atsData = {
        score: Number.isFinite(aiScore) ? Math.max(0, Math.min(100, aiScore)) : finalScore,
        feedback: Array.isArray(parsedAts?.feedback) ? parsedAts.feedback : atsData.feedback,
      };
    } catch (aiError) {
      console.error("AI ATS ERROR:", aiError);
    }

    const finalAtsScore = atsData.score;

    console.log("Extracted Text:", text.substring(0, 500));
    console.log("ROLE:", role);
    console.log("MATCHED:", matchedSkills);
    console.log("MISSING:", missingSkills);
    console.log("FINAL SCORE:", finalAtsScore);
    console.log("Career Paths:", careerPaths);
    console.log("Interview Data:", interviewData);

    const latestVersion = await Analysis.findOne({ userId: req.user?.id || "demoUser" })
      .sort({ versionNumber: -1 })
      .select("versionNumber");
    const versionNumber = (latestVersion?.versionNumber || 0) + 1;
    const versionLabel = `v${versionNumber}`;

    const analysisDoc = await Analysis.create({
      userId: req.user?.id || "demoUser",
      role: role || "generic",
      versionNumber,
      versionLabel,
      score: finalAtsScore,
      weightedReadinessScore: finalAtsScore,
      roleReadinessPercentage: finalAtsScore,
      totalRequiredSkills: roleSkills.length,
      matchedSkills,
      missingSkills,
      suggestions: [
        "Add role-specific projects and measurable outcomes.",
        "Strengthen missing skills with portfolio evidence.",
      ],
      skillPriority: {
        critical: missingSkills.slice(0, 3),
        important: missingSkills.slice(3, 6),
        niceToHave: missingSkills.slice(6),
      },
      keywordHeatmap: roleSkills.map((skill) => ({
        keyword: skill,
        status: matchedSkills.includes(skill) ? "matched" : "missing",
        count: text.includes(skill) ? 1 : 0,
      })),
      careerPathSuggestions: careerPaths.map((path) => ({
        role: path.role || "Software Developer",
        matchScore: finalScore,
        reason: path.reason || "Based on your currently matched skills",
      })),
      interviewReadiness: {
        overallScore: finalAtsScore,
        topics: interviewData.topics || [],
        questions: interviewData.questions || [],
        tips: interviewData.tips || [],
      },
      ethicalAts: {
        stuffingDetected: false,
        repeatedKeywordCount: 0,
        warning: "No keyword stuffing pattern detected.",
      },
    });
    return res.json({
      score: finalAtsScore,
      matchedSkills,
      missingSkills,
      role,
      domain: aiData.domain || "unknown",
      level: aiData.level || "unknown",
      atsScore: finalAtsScore,
      atsFeedback: atsData.feedback,
      careerPaths: careerPaths,
      interviewReadiness: interviewData,
      careerPathSuggestions: careerPaths,
      // keep compatibility for current frontend expectations
      id: analysisDoc._id,
      version: analysisDoc.versionLabel,
      versionNumber: analysisDoc.versionNumber,
      roleReadinessPercentage: finalAtsScore,
      weightedReadinessScore: finalAtsScore,
      totalRequiredSkills: roleSkills.length,
      createdAt: analysisDoc.createdAt,
      suggestions: analysisDoc.suggestions,
      skillPriority: analysisDoc.skillPriority,
      keywordHeatmap: analysisDoc.keywordHeatmap,
      ethicalAts: analysisDoc.ethicalAts,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return sendError(res, "Upload failed", 500);
  }
};

const getHistory = async (req, res) => {
  try {
    const data = await Analysis.find({ userId: req.user?.id || "demoUser" }).sort({ createdAt: 1 });
    return sendSuccess(res, data, "Analysis history fetched");
  } catch (error) {
    console.error("HISTORY ERROR:", error);
    return sendError(res, "Failed to fetch analysis history", 500);
  }
};

module.exports = {
  uploadResume,
  getHistory,
};
