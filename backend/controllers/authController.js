const db = require("../db");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT li.user_id, li.password_hash, u.user_name
            FROM login_info li
            JOIN user_info u ON li.user_id = u.user_id
            WHERE li.user_identifier = ?`,
            [email]
        );

        if (rows.length === 0)
            return res.status(401).json({ error: "사용자를 찾을 수 없습니다." });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch)
            return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });

        const token = generateToken(user.user_id);

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
};

exports.signup = async (req, res) => {
    console.log("회원가입 요청 수신됨:", req.body); // ← 이 줄 추가

    const { name, email, password, learning_field, preferred_language } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ error: "이름, 이메일, 비밀번호는 필수 항목입니다." });

    try {
        const [existing] = await db.execute(
            "SELECT * FROM login_info WHERE user_identifier = ?",
            [email]
        );
        if (existing.length > 0)
            return res.status(400).json({ error: "이미 존재하는 이메일입니다." });

        const [userResult] = await db.execute(
            `INSERT INTO user_info (user_name, email, learning_field, preferred_language)
            VALUES (?, ?, ?, ?)`,
            [name, email, learning_field ?? null, preferred_language ?? null]
        );

        const userId = userResult.insertId;
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO login_info (user_id, user_identifier, password_hash)
            VALUES (?, ?, ?)`,
            [userId, email, hashedPassword]
        );

        res.status(201).json({ message: "회원가입 성공", user_id: userId });
    } catch (err) {
        console.error("회원가입 오류 발생 🔥:", err);  // ← 이 줄 중요!
        res.status(500).json({ error: "서버 오류" });
    }
};