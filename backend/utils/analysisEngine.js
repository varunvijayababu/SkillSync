const Analysis = require("../models/Analysis");
const allSkillsDictionary = require("./skills");

const ROLE_SKILL_BLUEPRINTS = {
  "frontend developer": {
    critical: ["html", "css", "javascript", "react"],
    important: ["git", "node", "express"],
    niceToHave: ["typescript", "tailwind", "docker"],
  },
  "backend developer": {
    critical: ["node", "express", "mongodb", "sql"],
    important: ["javascript", "git", "docker"],
    niceToHave: ["aws", "redis", "kubernetes"],
  },
  "data scientist": {
    critical: ["python", "machine learning", "data analysis"],
    important: ["sql", "git", "docker"],
    niceToHave: ["aws", "tensorflow", "pytorch"],
  },
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const titleCase = (value) =>
  String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getSkillBlueprintForRole = (roleInput) => {
  const normalizedRole = normalize(roleInput);
  const directMatch = ROLE_SKILL_BLUEPRINTS[normalizedRole];
  if (directMatch) return directMatch;
  if (normalizedRole.includes("backend")) return ROLE_SKILL_BLUEPRINTS["backend developer"];
  if (normalizedRole.includes("data")) return ROLE_SKILL_BLUEPRINTS["data scientist"];
  return ROLE_SKILL_BLUEPRINTS["frontend developer"];
};

const toUniqueSkills = (skills) => [...new Set(skills.map((skill) => normalize(skill)))].filter(Boolean);

const detectMatchedSkills = (sourceText, requiredSkills) => {
  const normalizedText = normalize(sourceText);
  const normalizedRequired = toUniqueSkills(requiredSkills);
  const matchedFromText = normalizedRequired.filter((skill) => normalizedText.includes(skill));

  if (matchedFromText.length === 0) {
    return normalizedRequired.slice(0, Math.max(1, Math.floor(normalizedRequired.length / 2)));
  }

  return matchedFromText;
};

const getReadinessBreakdown = (blueprint, matchedSkills) => {
  const sectionScore = (list, weight) => {
    const total = list.length;
    const matched = list.filter((skill) => matchedSkills.includes(skill)).length;
    const score = total > 0 ? matched / total : 0;
    return { matched, total, weight, score };
  };

  const critical = sectionScore(blueprint.critical, 3);
  const important = sectionScore(blueprint.important, 2);
  const niceToHave = sectionScore(blueprint.niceToHave, 1);
  return { critical, important, niceToHave };
};

const getWeightedReadinessScore = (breakdown) => {
  const sections = [breakdown.critical, breakdown.important, breakdown.niceToHave];
  const weightedEarned = sections.reduce((sum, section) => sum + section.score * section.weight, 0);
  const weightedTotal = sections.reduce((sum, section) => sum + section.weight, 0);
  return Math.round((weightedEarned / weightedTotal) * 100);
};

const countOccurrences = (text, keyword) => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = String(text || "").toLowerCase().match(new RegExp(`\\b${escaped}\\b`, "g"));
  return matches ? matches.length : 0;
};

const buildKeywordHeatmap = (text, requiredSkills, matchedSkills) => {
  return requiredSkills.map((keyword) => {
    const count = countOccurrences(text, keyword);
    return {
      keyword: titleCase(keyword),
      status: matchedSkills.includes(keyword) ? "matched" : "missing",
      count,
    };
  });
};

const CAREER_PATH_SKILLS = {
  "Frontend Developer": ["html", "css", "javascript", "react", "typescript"],
  "Backend Developer": ["node", "express", "mongodb", "sql", "docker"],
  "Full Stack Developer": ["javascript", "react", "node", "express", "mongodb"],
  "DevOps Engineer": ["docker", "aws", "git", "kubernetes", "sql"],
  "Data Analyst": ["python", "sql", "data analysis", "machine learning", "excel"],
};

const getCareerPathSuggestions = (matchedSkills, currentRole) => {
  const normalizedCurrentRole = normalize(currentRole);
  return Object.entries(CAREER_PATH_SKILLS)
    .filter(([role]) => normalize(role) !== normalizedCurrentRole)
    .map(([role, skills]) => {
      const matched = skills.filter((skill) => matchedSkills.includes(skill));
      const score = Math.round((matched.length / skills.length) * 100);
      return {
        role,
        matchScore: score,
        reason:
          matched.length > 0
            ? `You already have ${matched.length}/${skills.length} core skills (${matched.join(", ")})`
            : "You need foundational alignment but this can be a growth path",
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
};

const buildInterviewReadiness = (role, matchedSkills, missingSkills, roleReadinessPercentage) => {
  const baseTopics = matchedSkills.slice(0, 4).map((skill) => `${titleCase(skill)} fundamentals and practical use`);
  const focusTopics = missingSkills.slice(0, 3).map((skill) => `Bridge gap in ${titleCase(skill)}`);
  const topics = [...baseTopics, ...focusTopics];

  const questions = [
    `Explain a project where you used ${titleCase(matchedSkills[0] || "core skills")} end-to-end.`,
    `How would you improve performance, scalability, and maintainability for a ${role} project?`,
    `What trade-offs do you consider when selecting tools in your tech stack?`,
    `How do you test and validate your implementation before release?`,
    `Which missing skill from your profile are you currently improving and how?`,
  ];

  const preparationRoadmap = [
    "Week 1: Revise core concepts and prepare concise project narratives",
    "Week 2: Solve role-specific interview questions and system design basics",
    "Week 3: Build one focused project covering top missing skills",
    "Week 4: Mock interviews + resume refinements based on feedback",
  ];

  return {
    overallScore: roleReadinessPercentage,
    topics,
    questions,
    preparationRoadmap,
  };
};

const detectKeywordStuffing = (text, requiredSkills) => {
  const repeatedKeywordCount = requiredSkills.filter((skill) => countOccurrences(text, skill) >= 5).length;
  const stuffingDetected = repeatedKeywordCount >= 2;
  const warning = stuffingDetected
    ? "Potential keyword stuffing detected. Balance keywords with genuine project context."
    : "No keyword stuffing pattern detected.";

  return {
    stuffingDetected,
    repeatedKeywordCount,
    warning,
  };
};

const computeAndSaveAnalysis = async ({ userId = "demoUser", roleInput, sourceText }) => {
  const role = titleCase(roleInput || "Frontend Developer");
  const blueprint = getSkillBlueprintForRole(roleInput);
  const allRequiredSkills = [...blueprint.critical, ...blueprint.important, ...blueprint.niceToHave];

  const safeSourceText = `${sourceText || ""} ${roleInput || ""} ${allSkillsDictionary.join(" ")}`;
  const matchedSkills = detectMatchedSkills(safeSourceText, allRequiredSkills);
  const missingSkills = allRequiredSkills.filter((skill) => !matchedSkills.includes(skill));
  const totalRequiredSkills = allRequiredSkills.length;
  const roleReadinessPercentage = Math.round((matchedSkills.length / totalRequiredSkills) * 100);
  const readinessBreakdown = getReadinessBreakdown(blueprint, matchedSkills);
  const weightedReadinessScore = getWeightedReadinessScore(readinessBreakdown);
  const score = weightedReadinessScore;

  const skillPriority = {
    critical: blueprint.critical.filter((skill) => missingSkills.includes(skill)),
    important: blueprint.important.filter((skill) => missingSkills.includes(skill)),
    niceToHave: blueprint.niceToHave.filter((skill) => missingSkills.includes(skill)),
  };

  const suggestions = [
    skillPriority.critical.length > 0
      ? `Prioritize critical skills: ${skillPriority.critical.join(", ")}`
      : "Critical skills are in good shape",
    skillPriority.important.length > 0
      ? `Strengthen important skills: ${skillPriority.important.join(", ")}`
      : "Important skills coverage is good",
    "Add one project per missing skill cluster to improve ATS and interview readiness",
  ];

  const latestVersion = await Analysis.findOne({ userId }).sort({ versionNumber: -1 }).select("versionNumber");
  const versionNumber = (latestVersion?.versionNumber || 0) + 1;
  const versionLabel = `v${versionNumber}`;

  const keywordHeatmap = buildKeywordHeatmap(safeSourceText, allRequiredSkills, matchedSkills);
  const careerPathSuggestions = getCareerPathSuggestions(matchedSkills, role);
  const interviewReadiness = buildInterviewReadiness(role, matchedSkills, missingSkills, roleReadinessPercentage);
  const ethicalAts = detectKeywordStuffing(safeSourceText, allRequiredSkills);

  const newAnalysis = new Analysis({
    userId,
    role,
    versionNumber,
    versionLabel,
    score,
    weightedReadinessScore,
    roleReadinessPercentage,
    readinessBreakdown,
    totalRequiredSkills,
    matchedSkills,
    missingSkills,
    suggestions,
    skillPriority,
    keywordHeatmap,
    careerPathSuggestions,
    interviewReadiness,
    ethicalAts,
  });

  await newAnalysis.save();

  return {
    id: newAnalysis._id,
    role,
    version: versionLabel,
    versionNumber,
    score,
    weightedReadinessScore,
    roleReadinessPercentage,
    readinessBreakdown,
    totalRequiredSkills,
    matchedSkills,
    missingSkills,
    suggestions,
    skillPriority,
    keywordHeatmap,
    careerPathSuggestions,
    interviewReadiness,
    ethicalAts,
    createdAt: newAnalysis.createdAt,
  };
};

module.exports = {
  computeAndSaveAnalysis,
};
