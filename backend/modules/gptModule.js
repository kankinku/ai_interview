require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function createEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small", // OpenAI의 최신 임베딩 모델
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("❌ Embedding 생성 실패:", error);
        return null;
    }
}

async function getGPTFeedback(combinedData) {
    const prompt = `
 당신은 IT 회사의 CTO 역할의 면접관입니다. 당신의 목표는 지원자의 답변 내용, 그리고 답변 중의 감정 변화를 종합적으로 분석하여 날카롭고 객관적인 피드백을 제공하는 것입니다. 최종 결과물은 반드시 하나의 JSON 객체로만 반환해야 하며, 다른 부가 설명은 일절 포함하지 마세요.

---
[면접 데이터]
${JSON.stringify(combinedData, null, 2)}
---

위 면접 데이터를 바탕으로, 다음 두 가지 형식에 맞춰 평가를 진행해주세요.

1.  **질문별 상세 평가 (questionEvaluations)**: 각 질문과 답변, 그리고 해당 질문에 대한 감정 분석 데이터를 종합하여 개별적으로 평가합니다.
2.  **종합 평가 (totalEvaluation)**: 모든 질문별 평가를 바탕으로 면접 전체를 종합적으로 평가합니다.

아래의 JSON 구조를 엄격하게 지켜서 응답해주세요:
{
  "totalEvaluation": {
    "totalScore": "면접 전체에 대한 총점 (0-100 사이 숫자)",
    "eachScore": {
      "verbal": "언어 구사력 점수 (논리성, 명확성 등)",
      "technical": "기술 전문성 점수 (답변의 깊이, 정확성 등)",
      "attitude": "면접 태도 및 적극성 점수 (감정 분석 결과, 자신감 등)",
      "vitality": "문제 해결 능력 및 성장 가능성 점수"
    },
    "strengths": ["지원자의 핵심 강점 2~3개를 요약한 문자열 배열"],
    "weaknesses": ["지원자의 핵심 개선점 2~3개를 요약한 문자열 배열"],
    "finalFeedback": "면접 전체에 대한 상세하고 종합적인 피드백 (3~4문장)"
  },
  "questionEvaluations": [
    {
      "question": "실제 질문 내용",
      "answer": "지원자의 답변 내용",
      "score": "해당 답변에 대한 점수 (0-100)",
      "feedback": "답변 내용과 감정 분석 결과를 종합한 구체적인 피드백",
      "strengths": ["해당 답변에서 드러난 강점 1~2개"],
      "improvements": ["해당 답변에서 개선할 점 1~2개"]
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
    model: "gpt-4-turbo", // 모델 업그레이드
    messages: [
    { role: "system", content: "당신은 IT 회사의 CTO 역할의 면접관이며, 평가 결과를 JSON 형식으로 반환해야 합니다." },
    { role: "user", content: prompt },
    ],
    temperature: 0.5, // 좀 더 일관적인 답변을 위해 온도 조절
    response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;

    try {
        const parsed = JSON.parse(content);
        return parsed;
    } catch (err) {
        console.error("❌ GPT 응답 파싱 실패:", err);
        // 반환하는 기본값의 구조를 새로운 JSON 구조에 맞게 수정합니다.
        return {
            totalEvaluation: {
                totalScore: 70,
                eachScore: { verbal: 70, technical: 70, problemSolving: 70, attitude: 70 },
                strengths: ["분석 실패"],
                weaknesses: ["분석 실패"],
                finalFeedback: "GPT 응답 형식이 잘못되어 기본 값으로 대체되었습니다.",
            },
            questionEvaluations: [],
        };
    }
}

module.exports = { getGPTFeedback, createEmbedding };
