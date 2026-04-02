const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSurveyStats,
  getQuestionStats
} = require('../controllers/statsController');

router.get('/survey/:surveyId', authMiddleware, getSurveyStats);
router.get('/question/:questionId', authMiddleware, getQuestionStats);

module.exports = router;