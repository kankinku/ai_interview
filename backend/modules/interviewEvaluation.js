const { getGPTFeedback } = require("./gptModule");

async function evaluateInterview(answers) {
  const joinedAnswers = answers.join("\n");

  // GPT API 호출
  const gptFeedback = await getGPTFeedback(joinedAnswers);

  return {
    totalScore: 80,
    eachScore: {
      technical: 80,
      communication: 75,
      problemSolving: 85,
      leadership: 78,
    },
    strengths: [
      "논리적이고 체계적인 답변 구성",
      "자신감 있는 발표",
      "적극적인 태도",
    ],
    weaknesses: [
      "답변에 구체적인 수치 부족",
      "표현 방식의 다양성 부족",
      "업계 트렌드 연계 부족",
    ],
    gptFeedback // GPT로부터 받은 결과 포함
  };
}

module.exports = { evaluateInterview };
