const skillsList = require("./skills");

const analyzeResume = (text, roleSkills) => {
  const lowerText = text.toLowerCase();

  // find matched skills
  const matchedSkills = skillsList.filter(skill =>
    lowerText.includes(skill)
  );

  // missing skills
  const missingSkills = roleSkills.filter(skill =>
    !matchedSkills.includes(skill)
  );

  // ATS score
  const score = Math.round(
    (matchedSkills.length / roleSkills.length) * 100
  );

  return {
    matchedSkills,
    missingSkills,
    score,
  };
};

module.exports = analyzeResume;