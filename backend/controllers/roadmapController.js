const { sendSuccess, sendError } = require("../utils/apiResponse");
const { generateAI } = require("../utils/ai");

const ROADMAP_TEMPLATES = {
  frontend: {
    beginner: [
      { skill: "HTML & Semantic Structure", estimatedTime: "6-8 hours", difficulty: "Easy", resourceLink: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
      { skill: "CSS Fundamentals & Layout", estimatedTime: "8-10 hours", difficulty: "Easy", resourceLink: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
      { skill: "JavaScript Basics", estimatedTime: "12-15 hours", difficulty: "Medium", resourceLink: "https://javascript.info/" },
    ],
    intermediate: [
      { skill: "React Components & State", estimatedTime: "14-18 hours", difficulty: "Medium", resourceLink: "https://react.dev/learn" },
      { skill: "API Integration", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Fetching_data" },
      { skill: "Git Collaboration Workflow", estimatedTime: "5-7 hours", difficulty: "Easy", resourceLink: "https://www.atlassian.com/git/tutorials" },
    ],
    advanced: [
      { skill: "Performance Optimization", estimatedTime: "10-14 hours", difficulty: "Hard", resourceLink: "https://web.dev/learn/performance/" },
      { skill: "Testing React Applications", estimatedTime: "10-12 hours", difficulty: "Medium", resourceLink: "https://testing-library.com/docs/react-testing-library/intro/" },
      { skill: "System Design Fundamentals", estimatedTime: "12-16 hours", difficulty: "Hard", resourceLink: "https://github.com/donnemartin/system-design-primer" },
    ],
  },
  backend: {
    beginner: [
      { skill: "Node.js Fundamentals", estimatedTime: "10-12 hours", difficulty: "Easy", resourceLink: "https://nodejs.dev/en/learn/" },
      { skill: "Express Routing Basics", estimatedTime: "6-8 hours", difficulty: "Easy", resourceLink: "https://expressjs.com/en/starter/basic-routing.html" },
      { skill: "MongoDB CRUD", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://www.mongodb.com/docs/manual/crud/" },
    ],
    intermediate: [
      { skill: "Authentication with JWT", estimatedTime: "8-12 hours", difficulty: "Medium", resourceLink: "https://jwt.io/introduction" },
      { skill: "SQL Querying Fundamentals", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://www.w3schools.com/sql/" },
      { skill: "REST API Design", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://restfulapi.net/" },
    ],
    advanced: [
      { skill: "Scalability & Caching", estimatedTime: "10-14 hours", difficulty: "Hard", resourceLink: "https://redis.io/learn/" },
      { skill: "Dockerizing Services", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://docs.docker.com/get-started/" },
      { skill: "System Design for APIs", estimatedTime: "12-16 hours", difficulty: "Hard", resourceLink: "https://github.com/donnemartin/system-design-primer" },
    ],
  },
  data: {
    beginner: [
      { skill: "Python for Data", estimatedTime: "10-12 hours", difficulty: "Easy", resourceLink: "https://www.learnpython.org/" },
      { skill: "Data Cleaning Basics", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://pandas.pydata.org/docs/" },
      { skill: "Statistics Essentials", estimatedTime: "10-12 hours", difficulty: "Medium", resourceLink: "https://www.khanacademy.org/math/statistics-probability" },
    ],
    intermediate: [
      { skill: "Machine Learning Fundamentals", estimatedTime: "16-20 hours", difficulty: "Hard", resourceLink: "https://developers.google.com/machine-learning/crash-course" },
      { skill: "Feature Engineering", estimatedTime: "10-12 hours", difficulty: "Hard", resourceLink: "https://www.kaggle.com/learn/feature-engineering" },
      { skill: "SQL for Analytics", estimatedTime: "8-10 hours", difficulty: "Medium", resourceLink: "https://mode.com/sql-tutorial/" },
    ],
    advanced: [
      { skill: "Model Evaluation & Tuning", estimatedTime: "12-16 hours", difficulty: "Hard", resourceLink: "https://scikit-learn.org/stable/model_selection.html" },
      { skill: "MLOps Basics", estimatedTime: "10-14 hours", difficulty: "Hard", resourceLink: "https://ml-ops.org/" },
      { skill: "Portfolio-grade Case Studies", estimatedTime: "20-24 hours", difficulty: "Hard", resourceLink: "https://www.kaggle.com/competitions" },
    ],
  },
};

const inferTrack = (role) => {
  const normalized = String(role || "").toLowerCase();
  if (normalized.includes("backend")) return "backend";
  if (normalized.includes("data")) return "data";
  return "frontend";
};

const createPriorityFocus = (skills) =>
  skills.map((skill) => ({
    skill,
    estimatedTime: "6-10 hours",
    difficulty: "Medium",
    reason: "Missing in current resume analysis",
    resourceLink: "https://roadmap.sh/",
  }));

const mapSection = (title, timeline, items) => ({
  title,
  timeline,
  items,
});

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

const generateSkillExplanations = async (skills) => {
  const prompt = `
Explain why these skills are important for a job role:

Skills: ${skills.join(", ")}

Return JSON ONLY:

[
  {
    "skill": "",
    "importance": "",
    "usage": ""
  }
]
`;

  try {
    const response = await generateAI(prompt);
    const parsed = parseAIJson(response, []);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("SKILL INSIGHTS AI ERROR:", error);
  }

  return skills.map((skill) => ({
    skill,
    importance: "Important for this role",
    usage: "Used in development tasks",
  }));
};

const createTopResources = (track) => {
  const resources = {
    frontend: {
      officialDocs: [
        { title: "MDN Web Docs", url: "https://developer.mozilla.org/", price: "free", level: "beginner" },
        { title: "React Official Docs", url: "https://react.dev/learn", price: "free", level: "intermediate" },
      ],
      youtubePlaylists: [
        { title: "freeCodeCamp Frontend Playlist", url: "https://www.youtube.com/@freecodecamp", price: "free", level: "beginner" },
        { title: "Traversy Media React Series", url: "https://www.youtube.com/@TraversyMedia", price: "free", level: "intermediate" },
      ],
      courses: [
        { title: "Frontend Developer Career Path - Scrimba", url: "https://scrimba.com/learn/frontend", price: "paid", level: "beginner" },
        { title: "Epic React", url: "https://epicreact.dev/", price: "paid", level: "advanced" },
      ],
    },
    backend: {
      officialDocs: [
        { title: "Node.js Docs", url: "https://nodejs.org/en/docs", price: "free", level: "beginner" },
        { title: "Express Docs", url: "https://expressjs.com/", price: "free", level: "intermediate" },
      ],
      youtubePlaylists: [
        { title: "Codevolution Node.js Playlist", url: "https://www.youtube.com/@Codevolution", price: "free", level: "beginner" },
        { title: "Hussein Nasser Backend Concepts", url: "https://www.youtube.com/@hnasr", price: "free", level: "advanced" },
      ],
      courses: [
        { title: "Node.js - The Complete Guide", url: "https://www.udemy.com/course/nodejs-the-complete-guide/", price: "paid", level: "intermediate" },
        { title: "System Design Fundamentals", url: "https://www.educative.io/courses/grokking-the-system-design-interview", price: "paid", level: "advanced" },
      ],
    },
    data: {
      officialDocs: [
        { title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/", price: "free", level: "beginner" },
        { title: "Scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", price: "free", level: "intermediate" },
      ],
      youtubePlaylists: [
        { title: "Krish Naik Data Science", url: "https://www.youtube.com/@krishnaik06", price: "free", level: "intermediate" },
        { title: "StatQuest", url: "https://www.youtube.com/@statquest", price: "free", level: "advanced" },
      ],
      courses: [
        { title: "Machine Learning Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction", price: "paid", level: "intermediate" },
        { title: "Data Science Career Track", url: "https://www.datacamp.com/tracks/data-scientist-with-python", price: "paid", level: "advanced" },
      ],
    },
  };

  return resources[track] || resources.frontend;
};

const generateRoadmap = async (req, res) => {
  try {
    const { role, skills } = req.body;

    const safeRole = role || "Frontend Developer";
    const safeSkills = Array.isArray(skills) ? skills : [];
    const track = inferTrack(safeRole);
    const template = ROADMAP_TEMPLATES[track];

    const fallbackSections = [
      mapSection("Beginner", "Weeks 1-2", template.beginner),
      mapSection("Intermediate", "Weeks 3-6", template.intermediate),
      mapSection("Advanced", "Weeks 7+", template.advanced),
    ];

    const priorityFocus = createPriorityFocus(safeSkills);
    const fallbackRoadmapData = {
      beginner: template.beginner.map((item) => item.skill),
      intermediate: template.intermediate.map((item) => item.skill),
      advanced: template.advanced.map((item) => item.skill),
      projects: [
        `Build a ${safeRole} portfolio starter project`,
        "Create one end-to-end project covering key missing skills",
      ],
    };

    const roadmapPrompt = `
You are a career mentor.

Create a structured learning roadmap for:

Role: ${safeRole}
Missing Skills: ${safeSkills.join(", ")}

Return JSON ONLY:

{
"beginner": ["..."],
"intermediate": ["..."],
"advanced": ["..."],
"projects": ["..."]
}
`;

    let roadmapData = fallbackRoadmapData;
    try {
      const roadmapResponse = await generateAI(roadmapPrompt);
      const parsedRoadmap = parseAIJson(roadmapResponse, fallbackRoadmapData);
      roadmapData = {
        beginner: Array.isArray(parsedRoadmap.beginner) ? parsedRoadmap.beginner : fallbackRoadmapData.beginner,
        intermediate: Array.isArray(parsedRoadmap.intermediate)
          ? parsedRoadmap.intermediate
          : fallbackRoadmapData.intermediate,
        advanced: Array.isArray(parsedRoadmap.advanced) ? parsedRoadmap.advanced : fallbackRoadmapData.advanced,
        projects: Array.isArray(parsedRoadmap.projects) ? parsedRoadmap.projects : fallbackRoadmapData.projects,
      };
    } catch (aiError) {
      console.error("ROADMAP AI ERROR:", aiError);
    }

    const skillInsights = await generateSkillExplanations(safeSkills);
    const sections = [
      { title: "Beginner", timeline: "Weeks 1-2", items: roadmapData.beginner.map((skill) => ({ skill })) },
      {
        title: "Intermediate",
        timeline: "Weeks 3-6",
        items: roadmapData.intermediate.map((skill) => ({ skill })),
      },
      { title: "Advanced", timeline: "Weeks 7+", items: roadmapData.advanced.map((skill) => ({ skill })) },
    ];

    const roadmap = {
      role: safeRole,
      sections: sections.length > 0 ? sections : fallbackSections,
      priorityFocus,
      topResources: createTopResources(track),
      projects: roadmapData.projects,
      skillInsights,
      // Backward-compatible fields for older UI consumers.
      beginner: roadmapData.beginner,
      intermediate: roadmapData.intermediate,
      advanced: roadmapData.advanced,
      missingSkillsFocus: priorityFocus.map((item) => `Master ${item.skill} with projects`),
      resources: template.beginner.concat(template.intermediate, template.advanced).map((item) => item.resourceLink),
    };

    return sendSuccess(res, { roadmap, skillInsights }, "Roadmap generated");
  } catch (error) {
    console.error("ROADMAP ERROR:", error);
    return sendError(res, "Roadmap generation failed", 500);
  }
};

module.exports = {
  generateRoadmap,
};
