const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSurveyForFill,
  getNextQuestionByAnswer,
  submitSurvey
} = require('../controllers/answerController');

router.get('/:accessCode', authMiddleware, getSurveyForFill);
router.post('/:accessCode/next', authMiddleware, getNextQuestionByAnswer);
router.post('/:accessCode/submit', authMiddleware, submitSurvey);

module.exports = router;