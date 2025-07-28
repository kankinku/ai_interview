const db = require('../db');
const { getGPTFeedback } = require('./gptModule');
const { createEmbedding } = require('./gptModule'); // createEmbedding 추가

async function evaluateInterview(interviewId, io, userSockets) {
    const connection = await db.getConnection();
    try {
        console.log(`[${interviewId}] 최종 평가 프로세스 시작`);
        
        // 1. 답변 및 감정 점수 데이터 조회
        const [answers] = await connection.query(
            "SELECT question_number, question_text, answer_text, answer_time FROM answer_score WHERE interview_id = ? ORDER BY question_number",
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

        // 2. 질문 번호 기준으로 데이터 합치기 및 요약
        const combinedData = answers.map(answer => {
            const relatedEmotions = emotions.filter(e => e.question_number === answer.question_number);
            
            let emotionSummary = "감정 기록 없음";
            if (relatedEmotions.length > 0) {
                const avgScore = relatedEmotions.reduce((acc, e) => acc + e.total_score, 0) / relatedEmotions.length;
                const reasonCounts = relatedEmotions.reduce((acc, e) => {
                    const reason = e.score_reason.split(',')[0].split('(')[0];
                    acc[reason] = (acc[reason] || 0) + 1;
                    return acc;
                }, {});

                let dominantEmotion = "혼합됨";
                if(Object.keys(reasonCounts).length > 0) {
                    dominantEmotion = Object.keys(reasonCounts).reduce((a, b) => reasonCounts[a] > reasonCounts[b] ? a : b);
                }

                emotionSummary = `평균 감정 점수: ${avgScore.toFixed(2)}, 주요 감정: ${dominantEmotion}`;
            }

            return {
                question_number: answer.question_number,
                question: answer.question_text,
                answer: answer.answer_text,
                emotion_summary: emotionSummary
            };
        });

        console.log(`[${interviewId}] 총 ${combinedData.length}개의 답변 데이터 취합 완료. GPT 평가를 시작합니다.`);

        // 3. 데이터를 5개씩 묶어서 순차적으로 처리
        const chunkSize = 5;
        let allQuestionEvaluations = [];
        let finalTotalEvaluation = null;

        for (let i = 0; i < combinedData.length; i += chunkSize) {
            const chunk = combinedData.slice(i, i + chunkSize);
            console.log(`[${interviewId}] ${i / chunkSize + 1}번째 묶음 (질문 ${chunk[0].question_number}~${chunk[chunk.length - 1].question_number}) 평가 요청`);
            
            const evaluationResult = await getGPTFeedback(chunk);

            if (evaluationResult && evaluationResult.questionEvaluations) {
                allQuestionEvaluations.push(...evaluationResult.questionEvaluations);
                finalTotalEvaluation = evaluationResult.totalEvaluation; // 마지막 묶음의 종합 평가를 최종본으로 사용
            } else {
                console.error(`[${interviewId}] GPT-4로부터 ${i / chunkSize + 1}번째 묶음에 대한 평가 결과를 받지 못했습니다.`);
                throw new Error("GPT 평가 중 일부가 실패했습니다.");
            }
        }

        if (!finalTotalEvaluation || allQuestionEvaluations.length === 0) {
            console.error(`[${interviewId}] 최종 평가 데이터가 생성되지 않았습니다.`);
            return;
        }

        console.log(`[${interviewId}] 모든 묶음 평가 완료. 총 ${allQuestionEvaluations.length}개의 질문 평가 확보. DB 저장 시작`);

        const { totalScore, eachScore, strengths, weaknesses, finalFeedback } = finalTotalEvaluation;
        
        // 4. total_result 테이블에 종합 평가 결과 저장
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
                JSON.stringify(strengths),
                weaknesses.join(', ')
            ]
        );

        // 5. answer_score 테이블에 질문별 상세 평가 업데이트
        const updatePromises = allQuestionEvaluations.map(q_eval => {
            const answerData = combinedData.find(d => d.question_number === q_eval.question_number);
            let pacingEvaluation = '적절함';
            if (answerData && answerData.answer && answerData.answer_time) {
                const textLength = answerData.answer.length;
                const expectedTime = Math.round(textLength / 10); // 10글자당 1초로 가정
                const actualTime = answerData.answer_time;

                if (actualTime < expectedTime * 0.5) {
                    pacingEvaluation = '성급함';
                } else if (actualTime > expectedTime * 1.5 && actualTime > 10) { // 너무 짧은 답변은 '느림'으로 판단하지 않도록
                    pacingEvaluation = '느림';
                }
            }
            return connection.query(
                    `UPDATE answer_score SET
                        score = ?,
                        feedback = ?,
                        strengths = ?,
                        improvements = ?,
                        pacing_evaluation = ?
                    WHERE interview_id = ? AND question_number = ?`,
                    [
                        q_eval.score,
                        q_eval.feedback,
                        JSON.stringify(q_eval.strengths),
                        JSON.stringify(q_eval.improvements),
                        pacingEvaluation,
                        interviewId,
                        q_eval.question_number
                    ]
                );
        });

        await Promise.all(updatePromises);

        console.log(`✅ Interview ${interviewId} 평가 완료 및 저장 성공`);

        // 6. 평가 완료 이벤트 전송
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