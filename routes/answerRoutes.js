const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSurveyForFill,
  submitSurvey
} = require('../controllers/answerController');

router.get('/:accessCode', authMiddleware, getSurveyForFill);
router.post('/:accessCode/submit', authMiddleware, submitSurvey);

module.exports = router;