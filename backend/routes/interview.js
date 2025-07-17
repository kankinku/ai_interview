const express = require("express");
const router = express.Router();

const {
    receiveInterviewStart,
    receiveInterviewResponse,
    receiveInterviewFinish,
    generateQuestions,
    getQuestions,
    upload,
} = require("../controllers/interviewController");

// 라우트 등록
router.get("/questions/:user_id", getQuestions);
router.post("/start", receiveInterviewStart);
router.post("/generate-questions", upload.single("resume"), generateQuestions);
router.post("/response", receiveInterviewResponse);
router.post("/finish", receiveInterviewFinish);

module.exports = router;
