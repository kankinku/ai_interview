const express = require("express");
const router = express.Router();

const {
    receiveInterviewStart,
    receiveInterviewResponse,
    receiveInterviewFinish
} = require("../controllers/interviewController");

// 라우트 등록
router.post("/start", receiveInterviewStart);
router.post("/response", receiveInterviewResponse);
router.post("/finish", receiveInterviewFinish); 

module.exports = router;
