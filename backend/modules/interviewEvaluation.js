const { getGPTFeedback } = require("./gptModule");
const pool = require("../db");

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

async function conductFinalEvaluation(interview_id) {
    console.log(`🚀 최종 평가를 시작합니다. interview_id: ${interview_id}`);
    
    // 1. Fetch answers for the interview
    const [answers] = await pool.query(
        `SELECT question_text as question, answer_text as answer 
         FROM answer_score 
         WHERE interview_id = ? ORDER BY question_number`,
        [interview_id]
    );
    
    // 2. Fetch final sentiment score
    const [session] = await pool.query(
        `SELECT sentiment_score FROM interview_session WHERE interview_id = ?`,
        [interview_id]
    );
    const visual_score = session.length > 0 ? parseFloat(session[0].sentiment_score) : 70;
    console.log(`- 시각적 요소(감정) 점수: ${visual_score}`);

    let verbal_score = 70, 
        vital_score = 70, 
        final_feedback = "평가 데이터 부족", 
        reason_summary = "답변이 없어 내용 평가를 진행할 수 없습니다.";

    // 3. Get GPT evaluation for content if answers exist
    if (answers && answers.length > 0) {
        console.log(`- ${answers.length}개의 답변을 바탕으로 내용 평가를 진행합니다.`);
        const gptResult = await evaluateInterview(answers);
        
        verbal_score = gptResult.eachScore.communication;
        vital_score = gptResult.eachScore.problemSolving;
        final_feedback = gptResult.finalFeedback;
        reason_summary = gptResult.weaknesses.join(", ");
        console.log(`- 내용 평가 점수: 언어(${verbal_score}), 문제해결(${vital_score})`);
    } else {
        console.log("- 답변이 없어 내용 평가는 스킵합니다.");
    }

    // 4. Calculate final total score with weightings
    const voice_score = 80; // Hardcoded voice score
    const total_score = Math.round((verbal_score * 0.4) + (vital_score * 0.3) + (visual_score * 0.2) + (voice_score * 0.1));
    console.log(`- 최종 종합 점수: ${total_score}`);

    // 5. Save the comprehensive result to the database
    await pool.query(
      `INSERT INTO total_result (
        interview_id, verbal_score, voice_score, visual_score, vital_score, 
        total_score, final_feedback, reason_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        verbal_score = VALUES(verbal_score),
        voice_score = VALUES(voice_score),
        visual_score = VALUES(visual_score),
        vital_score = VALUES(vital_score),
        total_score = VALUES(total_score),
        final_feedback = VALUES(final_feedback),
        reason_summary = VALUES(reason_summary)
      `,
      [
        interview_id,
        verbal_score,
        voice_score,
        visual_score,
        vital_score,
        total_score,
        final_feedback,
        reason_summary
      ]
    );
    
    console.log(`✅ 최종 평가 완료 및 저장. interview_id: ${interview_id}`);
    return { interview_id, total_score };
}

module.exports = { evaluateInterview, conductFinalEvaluation };
