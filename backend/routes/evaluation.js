// routes/evaluation.js
const express = require("express");
const router = express.Router();
const evaluationController = require("../controllers/evaluationController");

router.get("/history/:userId", evaluationController.getEvaluationHistory);
router.get("/result/:interview_id", evaluationController.getEvaluationResult);
router.get("/result/:interviewId/questions", evaluationController.getQuestionAnalysis);


module.exports = router;
