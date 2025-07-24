// routes/evaluation.js
const express = require("express");
const router = express.Router();
const { handleEvaluation } = require("../controllers/evaluationController");

router.post("/interview", handleEvaluation);

module.exports = router;
