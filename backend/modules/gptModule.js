const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getGPTFeedback(prompt) {
    const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
    { role: "system", content: "당신은 AI 면접 평가 전문가입니다. 사용자 응답을 평가해 주세요." },
    { role: "user", content: prompt },
    ],
    });

    return response.choices[0].message.content.trim();
}

module.exports = { getGPTFeedback };
