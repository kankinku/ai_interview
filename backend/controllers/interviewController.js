const db = require("../db");
const multer = require("multer");
const path = require("path");
const {
    extractTextFromPdf,
    extractKeywordsFromUrl,
    generateInterviewQuestions,
} = require("../modules/interview-helper");
const { evaluateInterview } = require("../modules/interviewEvaluation");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    },
});

const upload = multer({ storage: storage });

exports.upload = upload;

exports.generateQuestions = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { url, user_id, company_name } = req.body;
        const resume = req.file;

        if (!url || !resume || !user_id || !company_name) {
            return res.status(400).json({ error: "URL, 이력서 파일, 사용자 ID, 회사 이름이 모두 필요합니다." });
        }
        
        await connection.beginTransaction();
        
        // 회사 정보 저장 또는 업데이트
        await connection.query(
            `INSERT INTO company (company_name, talent_url) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE talent_url = VALUES(talent_url)`,
            [company_name, url]
        );

        const keywords = await extractKeywordsFromUrl(url);
        const resumeText = await extractTextFromPdf(resume.path);
        const questions = await generateInterviewQuestions(resumeText, keywords);

        const insertPromises = questions.map((question) => {
            return connection.query(
                "INSERT INTO user_question (user_id, question_text, is_custom) VALUES (?, ?, ?)",
                [user_id, question, true]
            );
        });

        await Promise.all(insertPromises);
        
        await connection.commit();

        res.status(200).json({ questions });
    } catch (error) {
        await connection.rollback();
        console.error("❌ 질문 생성 및 저장 실패:", error);
        res.status(500).json({ error: "서버 오류" });
    } finally {
        connection.release();
    }
};

exports.getQuestions = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "user_id가 필요합니다." });
    }

    try {
        const [rows] = await db.query(
            "SELECT question_text FROM user_question WHERE user_id = ? ORDER BY RAND() LIMIT 10",
            [user_id]
        );

        if (rows.length === 0) {
            // 질문이 없는 경우, 빈 배열과 함께 성공 응답을 보내 프론트에서 처리하도록 합니다.
            return res.status(200).json({ questions: [] });
        }
        
        const questions = rows.map(row => row.question_text);
        res.status(200).json({ questions });

    } catch (err) {
        console.error("❌ 질문 조회 실패:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};

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
        // 1. GPT 평가 수행
        const evaluationResult = await evaluateInterview([
            { question, answer }
        ]);

        // 2. 평가 결과 DB 저장
        await db.query(
            `INSERT INTO content_evaluation (
                user_id,
                question,
                answer,
                gpt_score,
                gpt_feedback
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                user_id,
                question,
                answer,
                evaluationResult.totalScore,
                evaluationResult.finalFeedback
            ]
        );

        console.log("✅ GPT 분석 및 DB 저장 완료");

        res.status(200).json({
            message: "응답 및 GPT 평가 저장 완료",
            evaluation: evaluationResult
        });

    } catch (err) {
        console.error("❌ GPT 평가 또는 DB 저장 실패:", err);
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
            ORDER BY start_time DESC 
            LIMIT 1`,
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "인터뷰 세션을 찾을 수 없습니다." });
        }

        const interview_id = rows[0].interview_id;
        const endTime = new Date(); // 현재 시간

        // status 제거하고 end_time만 갱신
        await db.query(
            `UPDATE interview_session 
            SET end_time = ?
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
