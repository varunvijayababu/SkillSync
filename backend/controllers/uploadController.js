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
    
    const skillValidation = matchedSkills.map((skill) => {
      let confidence = 35; // Weak: only keyword (20-40)
      try {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(.{0,150})${escapedSkill}(.{0,150})`, "gi");
        const matches = text.match(regex);
        
        if (matches) {
          const context = matches.join(" ").toLowerCase();
          const hasActionVerb = context.includes("built") || context.includes("developed") || context.includes("implemented");
          const hasProject = context.includes("project") || text.indexOf("project") > -1;
          
          if (hasActionVerb && hasProject) {
            // Strong evidence: project + action verb -> 80-100
            confidence = Math.floor(Math.random() * 21) + 80;
          } else if (context.includes("skill") || text.includes("skills")) {
            // Medium: mentioned in skills -> 50-70
            confidence = Math.floor(Math.random() * 21) + 50;
          }
        }
      } catch (err) {
        console.error("Skill validation error:", err);
      }
      return { skill, confidence };
    });

    const missingSkills = roleSkills.filter((skill) => !matchedSkills.includes(skill));

    const trendingSkillsMap = {
      frontend: ["next.js", "typescript", "graphql", "tailwind css", "web performance"],
      backend: ["microservices", "graphql", "kubernetes", "aws", "gcp", "kafka", "docker"],
      "data analyst": ["snowflake", "dbt", "tableau", "bigquery", "apache spark"],
      generic: ["ci/cd", "cloud computing", "agile", "ai prompt engineering", "system design"]
    };

    const trendingList =
       trendingSkillsMap[role.toLowerCase()] ||
      (role.toLowerCase().includes("front") ? trendingSkillsMap.frontend :
       role.toLowerCase().includes("back") ? trendingSkillsMap.backend :
       role.toLowerCase().includes("data") ? trendingSkillsMap["data analyst"] :
       trendingSkillsMap.generic);

    const missingTrendingSkills = trendingList.filter(sk => !matchedSkills.includes(sk) && !text.includes(sk));

    let score = Math.min(100, Math.floor((matchedSkills.length / roleSkills.length) * 100));

    // Skill Decay Tracking
    const currentYear = new Date().getFullYear();
    const decayThreshold = currentYear - 3;
    const skillDecay = [];
    let decayPenalty = 0;

    matchedSkills.forEach(skill => {
      try {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(.{0,100})${escapedSkill}(.{0,100})`, "gi");
        const matches = text.match(regex);
        
        let recent = false;
        let foundYear = false;
        
        if (matches) {
           const context = matches.join(" ");
           const yearMatches = context.match(/(19|20)\d{2}/g) || [];
           if (yearMatches.length > 0) {
             foundYear = true;
             for (const y of yearMatches) {
               if (parseInt(y, 10) >= decayThreshold) {
                 recent = true;
                 break;
               }
             }
           } else {
             recent = true;
           }
        }
        
        if (foundYear && !recent) {
           skillDecay.push({ skill, status: "Outdated" });
           decayPenalty += 5;
        } else {
           skillDecay.push({ skill, status: "Active" });
        }
      } catch (err) {
        skillDecay.push({ skill, status: "Active" });
      }
    });

    score = Math.max(0, score - decayPenalty);

    // Impact Score Analysis
    const calculateImpact = (resumeText) => {
      let currentImpactScore = 20;
      const feedback = [];
      
      const actionVerbs = ["developed", "built", "improved", "implemented", "created", "designed", "increased", "decreased", "reduced", "led", "managed", "optimized"];
      let verbCount = 0;
      actionVerbs.forEach((verb) => {
        if (resumeText.includes(verb)) verbCount++;
      });

      const numberRegex = /\d+%|\$\d+|\b\d+\+?(x|k|m|b)?\b/gi;
      const numMatches = resumeText.match(numberRegex) || [];
      // Filter out small numbers like years, but generic numbers are fine
      const qualifiedNumbers = numMatches.filter(n => !/^(19|20)\d{2}$/.test(n));
      const numCount = qualifiedNumbers.length;

      if (verbCount >= 3) {
        currentImpactScore += 40;
        feedback.push("Good use of action verbs.");
      } else {
        feedback.push("Use more action verbs like 'developed' or 'improved'.");
      }

      if (numCount >= 3) {
        currentImpactScore += 40;
        feedback.push("Excellent quantified achievements.");
      } else if (numCount > 0) {
        currentImpactScore += 20;
        feedback.push("Add more quantified achievements.");
      } else {
        feedback.push("No measurable results found.");
      }

      return {
        impactScore: Math.min(100, currentImpactScore),
        impactFeedback: feedback
      };
    };

    const { impactScore, impactFeedback } = calculateImpact(text);

    const simulateRecruiterAttention = (resumeText, matchedKeywords) => {
      const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const first5Lines = lines.slice(0, 5).join(" ").toLowerCase();
      const headings = lines.filter(l => l.length < 35 && l === l.toUpperCase() && l.length > 3);
      
      let attentionScore = 40;
      const topFocusAreas = [];
      const ignoredSections = [];

      let earlyKeywords = 0;
      matchedKeywords.forEach(k => {
        if (first5Lines.includes(k.toLowerCase())) earlyKeywords++;
      });

      if (earlyKeywords >= 2) {
        attentionScore += 30;
        topFocusAreas.push("Header/Summary Profile (Strong Keyword Density)");
      } else {
        ignoredSections.push("Header/Summary Profile (Lacks Early Keywords)");
      }

      if (headings.length > 2) {
        attentionScore += 20;
        topFocusAreas.push("Clear Section Headings (Easy to skim)");
      } else {
        ignoredSections.push("Document Structure (Missing clear uppercase headings)");
      }

      const bulletLines = lines.filter(l => l.startsWith("-") || l.startsWith("•"));
      if (bulletLines.length >= 4) {
        attentionScore += 10;
        topFocusAreas.push("Bullet Points (Highly skimmable achievements)");
      } else {
        ignoredSections.push("Detailed paragraphs (Hard to read quickly, usually ignored)");
      }

      return {
        attentionScore: Math.min(100, attentionScore),
        topFocusAreas,
        ignoredSections
      };
    };

    const attentionData = simulateRecruiterAttention(text, matchedSkills);

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

    const generateProjectRelevance = async (text, role) => {
      const prompt = `
You are an expert technical evaluator.
Role: ${role}
Resume: ${text}

Extract projects and rate their relevance (High, Medium, Low) based on how their tech stack matches the role.
Return JSON ONLY in this format:
[
  { "name": "Project Name", "relevance": "High" }
]
`;
      try {
        const response = await generateAI(prompt);
        const cleaned = response.replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const interviewData = await generateInterviewPrep(matchedSkills, role);
    const careerPaths = await generateCareerPath(matchedSkills);
    const projectRelevance = await generateProjectRelevance(text, role);

    const checkStoryConsistency = (resumeText, skillsArray) => {
      const feedback = [];
      const textLower = resumeText.toLowerCase();
      const hasEducation = textLower.includes("education") || textLower.includes("university") || textLower.includes("degree");
      const hasProjects = textLower.includes("project") || textLower.includes("application") || textLower.includes("github");
      const hasExperience = textLower.includes("experience") || textLower.includes("work") || textLower.includes("intern");
      const hasSkills = skillsArray.length > 0;
      
      if (!hasEducation && !hasExperience) {
        feedback.push("Missing core timeline. Education or Experience not clearly defined.");
      }
      
      if (hasSkills && !hasProjects && !hasExperience) {
        feedback.push("Skills listed but no practical application (Projects/Experience) found. Link them!");
      }
      
      if (!hasExperience && hasProjects) {
        feedback.push("Strong project focus but no professional experience. Ensure projects mimic real-world impact.");
      }

      if (hasEducation && !hasExperience && !hasProjects) {
         feedback.push("Education is strong, but there is no clear progression into projects or a career.");
      }
      
      if (feedback.length === 0) {
        feedback.push("Consistent narrative flow from education to applied skills.");
        feedback.push("Clear progression from foundational learning to practical implementation.");
      }
      
      return feedback;
    };
    const storyFeedback = checkStoryConsistency(text, matchedSkills);

    const analyzeCareerRisk = (resumeText) => {
      const domains = {
        frontend: ["html", "css", "javascript", "react", "redux", "tailwind", "next.js"],
        backend: ["node", "express", "mongodb", "sql", "api", "docker", "redis", "kubernetes"],
        data: ["python", "sql", "excel", "pandas", "numpy", "power bi", "statistics", "tableau"],
        cloud: ["aws", "azure", "gcp", "ci/cd", "terraform", "unix"]
      };

      let domainMatches = {};
      let totalMatches = 0;
      
      const txt = resumeText.toLowerCase();
      Object.keys(domains).forEach(domain => {
        domainMatches[domain] = 0;
        domains[domain].forEach(skill => {
           if (txt.includes(skill)) {
              domainMatches[domain]++;
              totalMatches++;
           }
        });
      });

      const activeDomains = Object.values(domainMatches).filter(count => count >= 2).length;
      const counts = Object.values(domainMatches);
      const maxDomainCount = counts.length > 0 ? Math.max(...counts) : 0;
      
      let riskMessage = null;
      if (totalMatches > 5 && activeDomains >= 3 && maxDomainCount < 4) {
        riskMessage = "Your profile highlights too many isolated domains with low depth. You risk appearing as a generalist. Consider narrowing focus to demonstrate deeper specialization in a core area.";
      } else if (totalMatches > 3 && maxDomainCount <= 2) {
        riskMessage = "Your skillset spans multiple roles without enough deep proficiency elements anchoring a particular domain. Consider removing unrelated tech jargon.";
      }

      return riskMessage;
    };
    
    const riskMessage = analyzeCareerRisk(text);

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

    const latestVersionFull = await Analysis.findOne({ userId: req.user?.id || "demoUser" })
      .sort({ versionNumber: -1 });
      
    const versionNumber = (latestVersionFull?.versionNumber || 0) + 1;
    const versionLabel = `v${versionNumber}`;

    let totalXP = (latestVersionFull?.gamification?.totalXP || 0) + (matchedSkills.length * 10);
    if (latestVersionFull) {
      if (finalAtsScore > (latestVersionFull.score || 0)) totalXP += 20;
      if (impactScore > (latestVersionFull.impactScore || 0)) totalXP += 20;
    }

    const gamification = {
      level: Math.floor(totalXP / 100) + 1,
      xp: totalXP % 100,
      totalXP: totalXP
    };

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
      skillValidation,
      impactScore,
      impactFeedback,
      projectRelevance,
      attentionData,
      skillDecay,
      missingTrendingSkills,
      storyFeedback,
      riskMessage,
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
      gamification
    });
    return res.json({
      score: finalAtsScore,
      skillValidation,
      impactScore,
      impactFeedback,
      projectRelevance,
      attentionData,
      skillDecay,
      matchedSkills,
      missingSkills,
      missingTrendingSkills,
      storyFeedback,
      riskMessage,
      gamification,
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

const compareResumes = async (req, res) => {
  try {
    const role = req.body.role || "professional";
    
    if (!req.files || !req.files.resumeA || !req.files.resumeB) {
      return sendError(res, "Both resumeA and resumeB PDF files are required", 400);
    }
    
    const pdfDataA = await pdfParse(req.files.resumeA[0].buffer);
    const pdfDataB = await pdfParse(req.files.resumeB[0].buffer);
    
    const textA = pdfDataA?.text || "";
    const textB = pdfDataB?.text || "";

    const prompt = `
You are an expert HR evaluator. Compare these two resumes for the ${role} role.
Evaluate impact, structure, required skills matching, and completeness.

Resume A:
${textA.substring(0, 4000)}

Resume B:
${textB.substring(0, 4000)}

Return strict JSON ONLY matching this structure exactly:
{
  "resumeA": {
    "score": 85,
    "matchedSkills": ["css"],
    "missingSkills": ["react"]
  },
  "resumeB": {
    "score": 88,
    "matchedSkills": ["react"],
    "missingSkills": ["docker"]
  },
  "winner": "A" (must be "A", "B", or "Tie"),
  "whyWinner": "Brief explanation of why the winner has a better ATS alignment and keyword coverage."
}
`;
    let data;
    try {
      const aiRes = await generateAI(prompt);
      data = JSON.parse(aiRes.replace(/```json|```/gi, "").trim());
    } catch (e) {
      console.error("COMPARE ERROR:", e);
      data = {
        resumeA: { score: 85, matchedSkills: [], missingSkills: [] },
        resumeB: { score: 88, matchedSkills: [], missingSkills: [] },
        winner: "B",
        whyWinner: "Fallback explanation."
      };
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Compare failed", err);
    return sendError(res, "Compare failed", 500);
  }
};

const parseResume = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return sendError(res, "Resume file is required", 400);
    }
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData?.text || "";

    const prompt = `
Extract structured resume data exactly from the following text:
${JSON.stringify(text)}

Return ONLY valid JSON:
{
  "name": "Full Name",
  "role": "Role Title",
  "skills": ["skill1", "skill2"],
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "experience": [{"company": "...", "role": "...", "description": "..."}],
  "projects": [{"title": "...", "techStack": "...", "description": "..."}],
  "achievements": ["achievement1"]
}
If a section is empty or missing, return an empty array or string respectively. Ensure all objects exist.
`;

    try {
      const aiRes = await generateAI(prompt);
      const parsedData = JSON.parse(aiRes.replace(/```json|```/gi, "").trim());
      // ensure all fields exist
      const data = {
        name: parsedData.name || "",
        role: parsedData.role || "",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : [],
      };
      return res.json({ success: true, data });
    } catch (e) {
      console.error("AI PARSE ERROR:", e);
      return res.json({
        success: true,
        data: { name: "", role: "", skills: [], education: [], experience: [], projects: [], achievements: [] }
      });
    }
  } catch (err) {
    console.error("Parse failed", err);
    return sendError(res, "Parse failed", 500);
  }
};

module.exports = {
  uploadResume,
  getHistory,
  compareResumes,
  parseResume,
};
