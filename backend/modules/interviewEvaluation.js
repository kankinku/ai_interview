const { getGPTFeedback } = require("./gptModule");

async function evaluateInterview(answers) {
  const joinedAnswers = answers.map(
    (item, idx) => `질문${idx + 1}: ${item.question}\n답변: ${item.answer}`
  ).join("\n\n");

  const gptResult = await getGPTFeedback(joinedAnswers);

  return {
    totalScore: gptResult.totalScore,
    eachScore: gptResult.eachScore,
    strengths: gptResult.strengths,
    weaknesses: gptResult.weaknesses,
    finalFeedback: gptResult.finalFeedback
  };
}

module.exports = { evaluateInterview };
