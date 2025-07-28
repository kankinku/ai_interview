const express = require("express");
const router = express.Router();

const {
    generateQuestions,
    getQuestions,
    receiveInterviewStart,
    receiveInterviewResponse,
    receiveInterviewFinish,
    analyzeFrame,
    resetSentimentScore,
    upload,
    getRecentInterviews,
} = require("../controllers/interviewController");

// 라우트 등록
router.get("/questions/:user_id/:company_id", getQuestions);
router.get("/interviews/:userId", getRecentInterviews); // 새로운 라우트
router.post("/start", receiveInterviewStart);
router.post("/generate-questions", upload.single("resume"), generateQuestions);
router.post("/response", receiveInterviewResponse);
router.post("/finish", receiveInterviewFinish);

// 감정 분석을 위한 프레임 처리 라우트
router.post("/analyze-frame", analyzeFrame);

// 감정 점수 초기화 라우트
router.post("/reset-score", resetSentimentScore);


module.exports = router;
