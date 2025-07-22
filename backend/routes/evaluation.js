const express = require("express");
const router = express.Router();

const {
    handleEvaluation,
    getEvaluationHistory,
  getEvaluationResult,  // ⬅️ 이거 추가
} = require("../controllers/evaluationController");

// 평가 결과 저장
router.post("/evaluate", handleEvaluation);

// 이전 이력 조회
router.get("/history/:userId", getEvaluationHistory);

// 🔥 여기서 문제가 발생했던 라인!
router.get("/result/:interview_id", getEvaluationResult);

module.exports = router;
