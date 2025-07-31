const express = require('express');
const router = express.Router();
const learningPlanController = require('../controllers/learningPlanController');

// 개인 맞춤형 학습 계획 생성
router.post('/personalized/:userId', learningPlanController.generatePersonalizedPlan);

// 일반 학습 계획 생성
router.post('/general', learningPlanController.generateGeneralPlan);

// 저장된 학습 계획 조회
router.get('/:userId', learningPlanController.getLearningPlan);

module.exports = router;