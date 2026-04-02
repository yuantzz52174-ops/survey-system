const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createSurvey,
  getMySurveys,
  publishSurvey,
  closeSurvey
} = require('../controllers/surveyController');

router.post('/create', authMiddleware, createSurvey);
router.get('/my', authMiddleware, getMySurveys);
router.patch('/:id/publish', authMiddleware, publishSurvey);
router.patch('/:id/close', authMiddleware, closeSurvey);

module.exports = router;