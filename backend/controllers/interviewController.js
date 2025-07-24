const db = require("../db");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

const emotionScores = {
    'happy': 5,
    'surprise': 2,
    'neutral': 1,
    'sad': -3,
    'angry': -5,
    'disgust': -5,
    'fear': -6
};

const {
    extractTextFromPdf,
    extractKeywordsFromUrl,
    generateInterviewQuestions,
} = require("../modules/interview-helper");

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

exports.analyzeFrame = async (req, res) => {
    const { image, interviewId, questionNumber, userId } = req.body;

    if (!image || !interviewId || questionNumber === undefined || !userId) {
        return res.status(400).json({ error: "image, interviewId, questionNumber, userId가 모두 필요합니다." });
    }

    try {
        const analysisResponse = await axios.post('http://localhost:5001/analyze', { image });
        const { score_delta, contributors } = analysisResponse.data;

        if (score_delta === 0) {
            return res.status(200).json({ message: "No significant change." });
        }

        const [sessionRows] = await db.query(
            'SELECT sentiment_score FROM interview_session WHERE interview_id = ?',
            [interviewId]
        );

        if (sessionRows.length === 0) {
            return res.status(404).json({ error: 'Interview session not found.' });
        }

        let currentScore = parseFloat(sessionRows[0].sentiment_score);
        let newScore = Math.max(0, Math.min(100, currentScore + score_delta));
        
        const reasonParts = [];
        for (const [emotion, percent] of Object.entries(contributors)) {
            const score = emotionScores[emotion] || 0;
            reasonParts.push(`${emotion}(${percent.toFixed(1)}%): (${score > 0 ? '+' : ''}${score})`);
        }
        const score_reason = reasonParts.join(', ');

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            await connection.query(
                'UPDATE interview_session SET sentiment_score = ? WHERE interview_id = ?',
                [newScore, interviewId]
            );
            
            await connection.query(
                `INSERT INTO emotion_score (interview_id, question_number, score_reason, total_score)
                 VALUES (?, ?, ?, ?)`,
                [interviewId, questionNumber, score_reason, newScore]
            );

            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError; // re-throw to be caught by outer catch block
        } finally {
            connection.release();
        }

        const io = req.app.get('io');
        const userSocketId = req.app.get('userSockets')[userId];
        if (io && userSocketId) {
            io.to(userSocketId).emit('sentiment-update', { newScore: newScore.toFixed(2) });
        }

        res.status(200).json({ success: true, newScore });

    } catch (error) {
        console.error("❌ 감정 분석 프레임 처리 실패:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "감정 분석 중 서버 오류가 발생했습니다." });
    }
};

exports.resetSentimentScore = async (req, res) => {
    const { interviewId } = req.body;

    if (!interviewId) {
        return res.status(400).json({ error: "interviewId가 필요합니다." });
    }

    try {
        await db.query(
            'UPDATE interview_session SET sentiment_score = 100.00 WHERE interview_id = ?',
            [interviewId]
        );

        const io = req.app.get('io');
        const userSocketId = Object.keys(req.app.get('userSockets')).find(key => req.app.get('userSockets')[key] === req.body.socketId);

        if (io && userSocketId) {
            io.to(userSocketId).emit('sentiment-update', { newScore: '100.00' });
        }
        
        res.status(200).json({ success: true, message: "Score has been reset." });

    } catch (error) {
        console.error("❌ 감정 점수 초기화 실패:", error);
        res.status(500).json({ error: "점수 초기화 중 서버 오류가 발생했습니다." });
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
        const now = new Date();

        const [result] = await db.query(
            `INSERT INTO interview_session (user_id, learning_field, preferred_language, start_time, sentiment_score)
             VALUES (?, ?, ?, ?, 100.00)`,
            [user_id, learning_field, preferred_language, now]
        );

        const interviewId = result.insertId;
        console.log("📍 면접 시작 정보 DB 저장 완료, interview_id:", interviewId);
        res.status(200).json({ message: "면접 시작 저장 완료", interview_id: interviewId });

    } catch (err) {
        console.error("❌ 면접 시작 저장 실패:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};

// 인터뷰 응답
exports.receiveInterviewResponse = async (req, res) => {
    const { interviewId, questionNumber, questionText, answerText } = req.body;

    if (!interviewId || !questionNumber || !questionText || answerText === undefined) {
        return res.status(400).json({ error: "필수 데이터(interviewId, questionNumber, questionText, answerText) 누락" });
    }

    try {
        await db.query(
            `INSERT INTO answer_score (interview_id, question_number, question_text, answer_text)
             VALUES (?, ?, ?, ?)`,
            [interviewId, questionNumber, questionText, answerText]
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
