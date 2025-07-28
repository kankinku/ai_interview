const db = require('../db');
const { getGPTFeedback } = require('./gptModule');
const { createEmbedding } = require('./gptModule'); // createEmbedding 추가

async function evaluateInterview(interviewId, io, userSockets) {
    const connection = await db.getConnection();
    try {
        console.log(`[${interviewId}] 최종 평가 프로세스 시작`);
        
        // 1. 답변 및 감정 점수 데이터 조회
        const [answers] = await connection.query(
            "SELECT question_number, question_text, answer_text FROM answer_score WHERE interview_id = ? ORDER BY question_number",
            [interviewId]
        );
        const [emotions] = await connection.query(
            "SELECT question_number, score_reason, total_score FROM emotion_score WHERE interview_id = ? ORDER BY question_number",
            [interviewId]
        );

        if (answers.length === 0) {
            console.log(`[${interviewId}] 평가할 답변이 없습니다. 평가를 종료합니다.`);
            return;
        }

        // 2. 질문 번호 기준으로 데이터 합치기
        const combinedData = answers.map(answer => {
            const relatedEmotions = emotions.filter(e => e.question_number === answer.question_number);
            return {
                question: answer.question_text,
                answer: answer.answer_text,
                emotions: relatedEmotions.map(e => ({
                    reason: e.score_reason,
                    score: e.total_score
                }))
            };
        });

        console.log(`[${interviewId}] 총 ${combinedData.length}개의 답변 및 감정 데이터 취합 완료. GPT 평가를 진행합니다.`);
        
        const evaluationResult = await getGPTFeedback(combinedData);

        if (!evaluationResult) {
            console.error(`[${interviewId}] GPT-4로부터 평가 결과를 받지 못했습니다.`);
            // 실패 시 total_result에 기록을 남길 수 있습니다.
            return;
        }

        console.log(`[${interviewId}] GPT-4 평가 완료. 점수 및 피드백 DB 저장 시작`);

        const { totalEvaluation, questionEvaluations } = evaluationResult;
        const { totalScore, eachScore, strengths, weaknesses, finalFeedback } = totalEvaluation;
        
        // 1. total_result 테이블에 종합 평가 결과 저장
        await connection.query(
            `INSERT INTO total_result (interview_id, verbal_score, voice_score, visual_score, vital_score, total_score, final_feedback, strengths, reason_summary)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                interviewId,
                eachScore.verbal,
                eachScore.attitude,
                eachScore.technical,
                eachScore.vitality,
                totalScore,
                finalFeedback,
                JSON.stringify(strengths), // strengths를 JSON 문자열로 저장
                weaknesses.join(', ')
            ]
        );

        // 2. answer_score 테이블에 질문별 상세 평가 업데이트
        const updatePromises = questionEvaluations.map(q_eval => {
            return connection.query(
                    `UPDATE answer_score SET
                        score = ?,
                        feedback = ?,
                        strengths = ?,
                        improvements = ?
                    WHERE interview_id = ? AND question_text = ?`,
                    [
                        q_eval.score,
                        q_eval.feedback,
                        JSON.stringify(q_eval.strengths),
                        JSON.stringify(q_eval.improvements),
                        interviewId,
                        q_eval.question
                    ]
                );
        });

        await Promise.all(updatePromises);

        console.log(`✅ Interview ${interviewId} 평가 완료 및 저장 성공`);

        // 3. 평가 완료 이벤트 전송
        const [sessionRows] = await connection.query(
            "SELECT user_id FROM interview_session WHERE interview_id = ?",
            [interviewId]
        );
        if (sessionRows.length > 0) {
            const userId = sessionRows[0].user_id;
            const userSocketId = userSockets[userId];
            if (io && userSocketId) {
                io.to(userSocketId).emit('evaluation-complete', { interviewId });
                console.log(`[${interviewId}] ✅ 평가 완료 이벤트 전송 to user ${userId} (${userSocketId})`);
            }
        }

    } catch (error) {
        console.error(`❌ Interview ${interviewId} 평가 중 오류 발생:`, error);
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { evaluateInterview };
