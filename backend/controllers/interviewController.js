const db = require("../db");

// 인터뷰 시작
exports.receiveInterviewStart = async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "user_id가 필요합니다." });
    }

    try {
        const [userRows] = await db.query(
            "SELECT learning_field, preferred_language FROM user_info WHERE user_id = ?",
            [user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: "해당 유저를 찾을 수 없습니다." });
        }

        const { learning_field, preferred_language } = userRows[0];

        const now = new Date(); // 현재 시간

        await db.query(
            `INSERT INTO interview_session (user_id, learning_field, preferred_language, start_time)
             VALUES (?, ?, ?, ?)`,
            [user_id, learning_field, preferred_language, now]
        );

        console.log("📍 면접 시작 정보 DB 저장 완료");
        res.status(200).json({ message: "면접 시작 저장 완료" });
    } catch (err) {
        console.error("❌ 면접 시작 저장 실패:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};

// 인터뷰 응답
exports.receiveInterviewResponse = async (req, res) => {
    const { question, answer, user_id } = req.body;

    if (!question || !answer || !user_id) {
        return res.status(400).json({ error: "필수 데이터 누락" });
    }

    try {
        await db.query(
            `INSERT INTO content_evaluation (user_id, question, answer)
             VALUES (?, ?, ?)`,
            [user_id, question, answer]
        );

        console.log("✅ 면접 응답 DB 저장 완료");
        res.status(200).json({ message: "응답 저장 완료" });
    } catch (err) {
        console.error("❌ DB 저장 실패:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};

// 인터뷰 종료
exports.receiveInterviewFinish = async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "user_id가 필요합니다." });
    }

    try {
        const [rows] = await db.query(
            `SELECT interview_id FROM interview_session 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "인터뷰 세션을 찾을 수 없습니다." });
        }

        const interview_id = rows[0].interview_id;
        const endTime = new Date(); // 현재 시간

        await db.query(
            `UPDATE interview_session 
             SET status = 'completed', end_time = ?
             WHERE interview_id = ?`,
            [endTime, interview_id]
        );

        console.log("✅ 면접 종료 처리 완료");
        res.status(200).json({ message: "면접 종료 저장 완료" });
    } catch (err) {
        console.error("❌ 면접 종료 처리 실패:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};
