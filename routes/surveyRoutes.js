const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createSurvey,
  getMySurveys,
  publishSurvey,
  closeSurvey,
  addExistingQuestionToSurvey,
  updateJumpLogicInSurvey
} = require('../controllers/surveyController');

// 基础问卷操作 (保持你原有的路径风格)
router.post('/create', authMiddleware, createSurvey);
router.get('/my', authMiddleware, getMySurveys);
router.patch('/:id/publish', authMiddleware, publishSurvey);
router.patch('/:id/close', authMiddleware, closeSurvey);

// --- 以下为新增：问卷内题目与逻辑管理 ---

// 从题库中拉取现有题目关联到当前问卷
router.post('/:surveyId/questions', authMiddleware, addExistingQuestionToSurvey);

// 更新当前问卷中某道题目的跳转逻辑 (沿用你偏好的 PATCH 方法)
router.patch('/:surveyId/questions/:questionId/jump-logic', authMiddleware, updateJumpLogicInSurvey);

module.exports = router;