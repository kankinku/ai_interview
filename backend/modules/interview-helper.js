const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const pdf = require("pdf-parse");

dotenv.config();

const client = new OpenAI();

async function extractTextFromPdf(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text.trim();
}

function buildUrlPrompt(url) {
  return `
아래는 기업의 인재상 페이지 URL입니다.
이 페이지에 포함된 인재상과 관련된 핵심 개념을 추출해 주세요.

- 각 키워드는 "협업을 중시하는 사람", "기술을 통해 문제를 해결하는 사람"처럼 구체적인 문구여야 합니다.
- 단어 2~3개로 구성된 구체적인 표현으로 인재상 전체를 추출해 주세요.
- 설명 없이 핵심 문구 5가지를 줄바꿈 없이, 쉼표 없이 줄바꿈으로만 구분해서 출력해 주세요.

[URL]
${url}
`;
}

async function extractKeywordsFromUrl(url) {
  const prompt = buildUrlPrompt(url);
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 100,
  });
  return response.choices[0].message.content.trim();
}

function buildInterviewPrompt(resumeText, talentKeywords) {
  return `
다음은 한 지원자의 이력서와 기업의 인재상 키워드입니다.
이 정보를 참고하여 해당 지원자에게 적합한 면접 질문을 생성하세요.

요구사항:
- 질문은 총 10개이며, 아래의 각 유형을 고르게 포함해야 합니다:
  [직무 적합성] : 직무 수행 역량과 연관된 질문
  [경험 기반] : 실제 프로젝트나 협업 경험에 기반한 질문
  [가치관]     : 조직 문화 및 인재상과 관련된 태도나 철학 질문
  [자기소개 연계] : 자기소개서의 특징을 반영한 질문

출력 형식:
- 각 질문은 위 유형 중 하나의 태그를 붙이고, 간결하면서도 깊이 있는 질문으로 작성하세요.
- 모든 질문은 줄바꿈으로만 구분해서 출력하세요.
- 줄바꿈은 무조건 적용해야합니다.

[이력서 내용]
${resumeText}

[기업 인재상 키워드]
${talentKeywords}
`;
}

async function generateInterviewQuestions(resumeText, talentKeywords) {
  const prompt = buildInterviewPrompt(resumeText, talentKeywords);
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 800,
  });
  const result = response.choices[0].message.content.trim();
  return result.split("\n").filter((q) => q.trim());
}

module.exports = {
  extractTextFromPdf,
  extractKeywordsFromUrl,
  generateInterviewQuestions,
}; 