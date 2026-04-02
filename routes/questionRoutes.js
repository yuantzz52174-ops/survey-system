const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addQuestion,
  getQuestionsBySurvey
} = require('../controllers/questionController');

router.post('/:surveyId', authMiddleware, addQuestion);
router.get('/:surveyId', authMiddleware, getQuestionsBySurvey);

module.exports = router;