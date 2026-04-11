const generateCoverLetter = (name, role, skills) => {
  return `
Dear Hiring Manager,

I am excited to apply for the position of ${role}. I have a strong interest in this field and have developed skills such as ${skills.join(", ")}.

Through my experience and continuous learning, I have built a solid foundation that aligns with the requirements of this role. I am eager to contribute my abilities and grow within your organization.

I am confident that my dedication and skills will make me a valuable addition to your team.

Thank you for considering my application.

Sincerely,  
${name}
`;
};

module.exports = generateCoverLetter;