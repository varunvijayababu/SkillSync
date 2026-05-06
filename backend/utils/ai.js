const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateAI = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
  });

  const content = completion?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI provider returned an empty response");
  }

  return content;
};

module.exports = { generateAI };
