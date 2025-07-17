const db = require("../db");

exports.getAllCompanies = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT company_id, company_name, talent_url FROM company ORDER BY company_name");
        res.status(200).json({ companies: rows });
    } catch (err) {
        console.error("❌ 회사 목록 조회 실패:", err);
        res.status(500).json({ error: "서버 오류" });
    }
}; 