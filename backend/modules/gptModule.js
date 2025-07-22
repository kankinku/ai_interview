require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getGPTFeedback(joinedAnswers) {
    const prompt = `
다음은 면접자의 질문과 답변입니다.

${joinedAnswers}

아래 기준에 따라 100점 만점으로 평가해주세요:

1. technical: 기술적인 전문성 (예: 프로그래밍, 데이터베이스 등)
2. communication: 말의 명확성, 논리성, 전달력
3. problemSolving: 문제 해결에 대한 접근 방식과 사고력
4. leadership: 팀워크, 주도성, 리더십 요소

각 항목은 0~100 사이 숫자로 점수를 부여하고, 다음과 같은 JSON 형식으로 응답하세요:

{
    "totalScore": 숫자 (예: 82),
    "eachScore": {
    "technical": 숫자,
    "communication": 숫자,
    "problemSolving": 숫자,
    "leadership": 숫자
    },
    "strengths": ["면접자의 강점을 한글로 나열"],
    "weaknesses": ["개선이 필요한 점을 한글로 나열"],
    "finalFeedback": "전체적인 종합 평가를 한글로 서술"
}
`;

    const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
    { role: "system", content: "당신은 인사 담당 면접 평가자입니다." },
    { role: "user", content: prompt },
    ],
    temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    try {
    const parsed = JSON.parse(content);
    return parsed;
    } catch (err) {
    console.error("❌ GPT 응답 파싱 실패:", err);
    return {
    totalScore: 70,
    eachScore: {
        technical: 70,
        communication: 70,
        problemSolving: 70,
        leadership: 70,
    },
    strengths: ["분석 실패"],
    weaknesses: ["분석 실패"],
    finalFeedback: "GPT 응답 형식이 잘못되어 기본 값으로 대체됨",
    };
    }
}

module.exports = { getGPTFeedback };
