const pool = require("../db");

// (2) 면접 이력 조회
exports.getEvaluationHistory = async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const [rows] = await pool.query(
      `
      SELECT total_score
      FROM total_result
      JOIN interview_session USING (interview_id)
      WHERE user_id = ? AND interview_id < (
          SELECT MAX(interview_id)
          FROM interview_session
          WHERE user_id = ?
      )
      ORDER BY interview_id DESC
      LIMIT 1
      `,
      [userId, userId]
    );

    if (rows.length > 0) {
      res.status(200).json({ message: "이전 이력 조회 완료", data: rows[0] });
    } else {
      res.status(200).json({ message: "이전 이력 없음", data: null });
    }
  } catch (error) {
    console.error("이전 이력 조회 오류:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// backend/controllers/evaluationController.js

exports.getEvaluationResult = async (req, res) => {
  const interviewId = req.params.interview_id;
  const connection = await pool.getConnection();

  try {
    // 1. 현재 면접의 종합 결과 및 세션 정보 조회
    const [resultRows] = await connection.query(`
      SELECT 
        tr.verbal_score, tr.voice_score, tr.visual_score, tr.vital_score, tr.total_score,
        tr.final_feedback, tr.reason_summary, tr.strengths,
        s.user_id, s.start_time, s.duration_minutes, s.learning_field
      FROM total_result tr
      JOIN interview_session s ON tr.interview_id = s.interview_id
      WHERE tr.interview_id = ?
    `, [interviewId]);

    if (resultRows.length === 0) {
      return res.status(404).json({ message: "결과 없음" });
    }
    const currentResult = resultRows[0];

    // 2. 이전 면접 결과 조회
    const [prevResultRows] = await connection.query(`
      SELECT total_score 
      FROM total_result
      WHERE interview_id IN (
        SELECT interview_id FROM interview_session WHERE user_id = ? AND interview_id < ?
      )
      ORDER BY interview_id DESC
      LIMIT 1
    `, [currentResult.user_id, interviewId]);
    
    const prevScore = prevResultRows.length > 0 ? prevResultRows[0].total_score : null;
    const scoreChange = prevScore !== null ? currentResult.total_score - prevScore : null;

    // 3. 질문 개수 조회
    const [questionCountRows] = await connection.query(
      "SELECT COUNT(*) as count FROM answer_score WHERE interview_id = ?",
      [interviewId]
    );
    const questionCount = questionCountRows[0].count;

    // 4. 최종 데이터 조합
    const responseData = {
      verbal_score: currentResult.verbal_score,
      voice_score: currentResult.voice_score,
      visual_score: currentResult.visual_score,
      vital_score: currentResult.vital_score,
      total_score: currentResult.total_score,
      final_feedback: currentResult.final_feedback,
      reason_summary: currentResult.reason_summary,
      strengths: (() => {
        try {
          // DB에 저장된 JSON 문자열을 파싱
          const parsed = JSON.parse(currentResult.strengths);
          // 파싱 결과가 배열인지 확인, 아니면 빈 배열 반환
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // 파싱 실패 시(예: 그냥 문자열인 경우) 빈 배열 반환
          return [];
        }
      })(),
      interview_date: currentResult.start_time,
      interview_duration: `${currentResult.duration_minutes || 0}분`,
      position: currentResult.learning_field,
      question_count: questionCount,
      score_change: scoreChange
    };

    res.status(200).json({
      message: "결과 조회 성공",
      data: responseData
    });

  } catch (error) {
    console.error("평가 결과 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  } finally {
    if (connection) connection.release();
  }
};

exports.getQuestionAnalysis = async (req, res) => {
  const { interviewId } = req.params;

  try {
    const [questionRows] = await pool.query(
      `SELECT
         question_number,
         question_text,
         answer_text,
         score,
         feedback,
         strengths,
         improvements,
         duration_seconds
       FROM answer_score
       WHERE interview_id = ?
       ORDER BY question_number ASC`,
      [interviewId]
    );

    if (questionRows.length === 0) {
      // 아직 답변이 하나도 저장되지 않은 경우 (분석 전)
      return res.status(404).json({ message: '아직 분석이 시작되지 않았습니다.' });
    }

    // 첫 번째 질문의 score가 null이면 아직 분석이 완료되지 않은 것으로 간주
    if (questionRows[0].score === null) {
      return res.status(404).json({ message: 'AI가 현재 결과를 분석 중입니다.' });
    }
    
    // DB에서 가져온 데이터를 프론트엔드가 기대하는 형태로 변환
    const analysisData = questionRows.map(q => {
      const safeParse = (jsonString) => { // 타입 애너테이션 제거
        if (!jsonString) return [];
        try {
          const parsed = JSON.parse(jsonString);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      };

      return {
        question: q.question_text,
        answer: q.answer_text,
        score: q.score,
        duration: `${Math.floor(q.duration_seconds / 60)}분 ${q.duration_seconds % 60}초`,
        feedback: q.feedback,
        strengths: safeParse(q.strengths),
        improvements: safeParse(q.improvements),
      };
    });

    res.status(200).json({
      message: '질문별 분석 데이터 조회 성공',
      data: analysisData,
    });
  } catch (error) {
    console.error('질문별 분석 데이터 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};