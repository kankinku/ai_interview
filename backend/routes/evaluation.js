// routes/evaluation.js
const express = require("express");
const router = express.Router();
const { 
    getEvaluationResult,
    getEvaluationHistory 
} = require("../controllers/evaluationController");

router.get("/result/:interview_id", getEvaluationResult);
router.get("/history/:userId", getEvaluationHistory);

module.exports = router;
