const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addQuestion,
  getQuestionsBySurvey,
  updateQuestionJumpLogic
} = require('../controllers/questionController');

router.post('/:surveyId', authMiddleware, addQuestion);
router.get('/:surveyId', authMiddleware, getQuestionsBySurvey);
router.patch('/:questionId/jump-logic', authMiddleware, updateQuestionJumpLogic);

module.exports = router;