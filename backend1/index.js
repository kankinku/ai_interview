// backend/index.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = 3000;

// ✅ CORS 설정 및 JSON 파싱 미들웨어 적용
app.use(cors({
    origin: "http://localhost:8080", // 프론트 주소
    credentials: true
}));
app.use(express.json());

// ✅ DB 연결 확인용 라우트
app.get("/", async (req, res) => {
    const [rows] = await db.execute("SELECT 1 + 1 AS result");
    res.send(`DB 연결 성공! 결과: ${rows[0].result}`);
});

// ✅ 로그인 라우트
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await db.execute(
            `SELECT li.user_id, li.password_hash, u.user_name
             FROM login_info li
             JOIN user_info u ON li.user_id = u.user_id
             WHERE li.user_identifier = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "사용자를 찾을 수 없습니다." });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
        }

        const token = jwt.sign({ userId: user.user_id }, "SECRET_KEY", {
            expiresIn: "1d"
        });

        res.json({
            token,
            user: {
                id: user.user_id,
                name: user.user_name,
                email
            }
        });
    } catch (err) {
        console.error("로그인 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
});

// ✅ 회원가입 라우트
app.post("/api/signup", async (req, res) => {
    console.log("받은 요청 body:", req.body); // 디버깅용 로그

    const { name, email, password, learning_field, preferred_language } = req.body;

    // 필수 값 확인
    if (!name || !email || !password) {
        return res.status(400).json({ error: "이름, 이메일, 비밀번호는 필수 항목입니다." });
    }

    try {
        // 이메일 중복 확인
        const [existing] = await db.execute(
            "SELECT * FROM login_info WHERE user_identifier = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: "이미 존재하는 이메일입니다." });
        }

        // 1. user_info 저장 (phone 제거, 나머지는 null 허용)
        const [userResult] = await db.execute(
            `INSERT INTO user_info (user_name, email, learning_field, preferred_language)
             VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                learning_field ?? null,
                preferred_language ?? null
            ]
        );
        const userId = userResult.insertId;

        // 2. 비밀번호 해싱 후 login_info 저장
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            `INSERT INTO login_info (user_id, user_identifier, password_hash)
             VALUES (?, ?, ?)`,
            [userId, email, hashedPassword]
        );

        res.status(201).json({ message: "회원가입 성공", user_id: userId });
    } catch (err) {
        console.error("회원가입 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
});


// ✅ 서버 시작
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
