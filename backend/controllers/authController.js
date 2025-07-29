const db = require("../db");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT li.user_id, li.password_hash, u.user_name, u.target_company_id
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

        // 사용자의 질문 보유 여부 확인
        const [questionRows] = await db.execute(
            'SELECT COUNT(*) as questionCount FROM user_question WHERE user_id = ?',
            [user.user_id]
        );
        const hasQuestions = questionRows[0].questionCount > 0;

        res.json({
            token,
            user: {
                id: user.user_id,
                name: user.user_name,
                email,
                targetCompanyId: user.target_company_id
            },
            hasQuestions
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

        // user_info 테이블에 사용자 정보 추가
        const newUserInfo = {
            user_name: name,
            email: email,
            learning_field: req.body.learning_field || '리액트', // 기본값 설정
            preferred_language: req.body.preferred_language || '자바스크립트' // 기본값 설정
        };

        const [userInfoResult] = await db.execute(
            `INSERT INTO user_info (user_name, email, learning_field, preferred_language)
            VALUES (?, ?, ?, ?)`,
            [newUserInfo.user_name, newUserInfo.email, newUserInfo.learning_field, newUserInfo.preferred_language]
        );

        const userId = userInfoResult.insertId;
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

const parseCareerYears = (careerString) => {
    if (!careerString) return 0;
    if (careerString.includes('신입')) return 0;
    const match = careerString.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
};

const parseSalary = (salaryString) => {
    if (!salaryString) return null;
    const match = salaryString.match(/(\d+)/);
    return match ? parseInt(match[0], 10) * 10000 : null;
};


exports.updateProfile = async (req, res) => {
    const { userId, name, email, position, experience, targetCompany, targetSalary, targetCompanyId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    const career_years = parseCareerYears(experience);
    const desired_salary = parseSalary(targetSalary);

    try {
        const [result] = await db.execute(
            `UPDATE user_info 
             SET user_name = ?, email = ?, learning_field = ?, career_years = ?, desired_salary = ?, target_company_id = ?
             WHERE user_id = ?`,
            [name, email, position, career_years, desired_salary, targetCompanyId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }

        // 업데이트된 사용자 정보를 클라이언트에 다시 보내줍니다.
        const updatedUser = {
            id: userId,
            name: name,
            email: email,
            targetCompanyId: targetCompanyId
        };

        res.json({ message: "프로필이 성공적으로 업데이트되었습니다.", user: updatedUser });
    } catch (err) {
        console.error("프로필 업데이트 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};

exports.getProfile = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    try {
        const [rows] = await db.execute(
            `SELECT u.user_name, u.email, u.learning_field, u.career_years, u.desired_salary, u.target_company_id, c.company_name as target_company_name
             FROM user_info u
             LEFT JOIN company c ON u.target_company_id = c.company_id
             WHERE u.user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }

        const userProfile = rows[0];

        // 연봉 데이터를 문자열로 변환 (예: 60000000 -> "5000-7000만원")
        const formatSalary = (salary) => {
            if (!salary) return "";
            const sal = salary / 10000;
            if (sal <= 3000) return "3000만원 이하";
            if (sal <= 4000) return "3000-4000만원";
            if (sal <= 5000) return "4000-5000만원";
            if (sal <= 7000) return "5000-7000만원";
            return "7000만원 이상";
        };
        
        // 경력 데이터를 문자열로 변환 (예: 4 -> "3-5년")
        const formatExperience = (years) => {
            if (years === 0) return "신입";
            if (years >= 1 && years < 3) return "1-3년";
            if (years >= 3 && years < 5) return "3-5년";
            if (years >= 5 && years < 10) return "5-10년";
            if (years >= 10) return "10년 이상";
            return "신입";
        };


        res.json({
            name: userProfile.user_name,
            email: userProfile.email,
            position: userProfile.learning_field,
            experience: formatExperience(userProfile.career_years),
            targetSalary: formatSalary(userProfile.desired_salary),
            targetCompany: userProfile.target_company_name
        });

    } catch (err) {
        console.error("프로필 조회 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};