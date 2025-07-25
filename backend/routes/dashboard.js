const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// TODO: 인증 미들웨어 추가하여 특정 사용자만 접근 가능하도록 해야 함
router.get('/stats/:userId', getDashboardStats);

module.exports = router; 