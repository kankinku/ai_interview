const express = require("express");
const router = express.Router();
const db = require("./db"); // DB 커넥션 모듈 (mysql2/promise 또는 sequelize 등)

// 최근 면접 정보 API
router.get("/api/interviews", async (req, res) => {
    try {
    const userId = req.user?.id; // 로그인된 사용자 ID (인증 미들웨어에서 세팅되어 있어야 함)

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await db.execute(`
    SELECT 
        isess.interview_id AS id,
        isess.field AS position,
        tr.total_score AS score,
        isess.status,
        tr.created_at AS date,
        isess.duration_minutes,
        u.learning_field,
        u.preferred_language
    FROM interview_session isess
    JOIN total_result tr ON isess.interview_id = tr.interview_id
    JOIN user_info u ON isess.user_id = u.user_id
    WHERE isess.user_id = ?
    ORDER BY tr.created_at DESC
    LIMIT 5
    `, [userId]);

        res.json(rows);
    } catch (err) {
        console.error("면접 정보 조회 오류:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
