const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSurveyStats,
  getQuestionStats,
  getGlobalQuestionStats
} = require('../controllers/statsController');

// 原有的统计接口
router.get('/survey/:surveyId', authMiddleware, getSurveyStats);
router.get('/question/:questionId', authMiddleware, getQuestionStats);

// --- 新增：跨问卷全局统计 ---
// 通过 originalId 查询该题在所有问卷中的总体分布
router.get('/global/:originalId', authMiddleware, getGlobalQuestionStats);

module.exports = router;