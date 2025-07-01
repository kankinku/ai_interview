// routes/interview.js
const express = require("express");
const router = express.Router();

// ✅ 면접 시작 요청 수신
router.post("/start", (req, res) => {
    const { timestamp } = req.body;
    console.log("📍 면접 시작 요청 수신됨:", timestamp);
    res.status(200).json({ message: "면접 시작 수신 완료" });
});

// ✅ 면접 응답 수신
router.post("/response", (req, res) => {
    const { question, answer } = req.body;
    console.log("📥 면접 응답 수신:");
    console.log("질문:", question);
    console.log("응답:", answer);
    res.status(200).json({ message: "응답 수신 완료" });
});

module.exports = router;
