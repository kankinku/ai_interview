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
