const { evaluateInterview } = require("../modules/interviewEvaluation");
const pool = require("../db");

// (1) 면접 평가 및 저장
exports.handleEvaluation = async (req, res) => {
  try {
    const { interview_id, answers } = req.body;
    const result = await evaluateInterview(answers);

    // deltaScore 계산
    const [prevRow] = await pool.query(`
      SELECT total_score
      FROM total_result
      JOIN interview_session USING (interview_id)
      WHERE user_id = (
        SELECT user_id FROM interview_session WHERE interview_id = ?
      )
      AND interview_id < ?
      ORDER BY interview_id DESC
      LIMIT 1
    `, [interview_id, interview_id]);

    let deltaScore = null;
    if (prevRow.length > 0) {
      deltaScore = result.totalScore - prevRow[0].total_score;
    }

    // 결과 저장
    await pool.query(
      `INSERT INTO total_result (
        interview_id,
        verbal_score,
        voice_score,
        visual_score,
        vital_score,
        total_score,
        final_feedback,
        reason_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        interview_id,
        result.eachScore.communication,
        result.eachScore.voice || 80,
        result.eachScore.visual || 78,
        result.eachScore.problemSolving,
        result.totalScore,
        result.strengths.join(", "),
        result.weaknesses.join(", ")
      ]
    );

    res.status(200).json({
      message: "평가 완료 및 저장 성공",
      data: result,
    });

  } catch (error) {
    console.error("GPT 평가 처리 오류:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

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
  try {
    const [rows] = await pool.query(`
      SELECT verbal_score, voice_score, visual_score, vital_score, total_score, final_feedback, reason_summary
      FROM total_result
      WHERE interview_id = ?
    `, [interviewId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "결과 없음" });
    }

    res.status(200).json({ message: "결과 조회 성공", data: rows[0] });
  } catch (error) {
    console.error("평가 결과 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};
