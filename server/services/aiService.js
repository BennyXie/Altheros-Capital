const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getResearchAnswer(prompt) { // isolate api call -- can easily change what ai model to use
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return chat.choices[0].message.content.trim();
}

module.exports = { getResearchAnswer };