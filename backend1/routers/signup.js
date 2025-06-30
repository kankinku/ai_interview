const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// POST /api/signup
router.post("/signup", async (req, res) => {
    const { name, email, phone, learning_field, preferred_language, password } = req.body;

    try {
        // 이메일 중복 확인
        const [existing] = await db.execute(
            "SELECT * FROM login_info WHERE user_identifier = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: "이미 존재하는 이메일입니다." });
        }

        // 1. 비밀번호 해시화
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. user_info에 저장
        const [userResult] = await db.execute(
            `INSERT INTO user_info (user_name, email, phone, learning_field, preferred_language)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, learning_field, preferred_language]
        );

        const userId = userResult.insertId;

        // 3. login_info에 저장
        await db.execute(
            `INSERT INTO login_info (user_id, user_identifier, password_hash)
             VALUES (?, ?, ?)`,
            [userId, email, hashedPassword]
        );

        // 4. 응답
        res.status(201).json({ message: "회원가입 성공", user_id: userId });
    } catch (err) {
        console.error("회원가입 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
});

module.exports = router;
