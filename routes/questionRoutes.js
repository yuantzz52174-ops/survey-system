const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createQuestion,
  updateQuestion
} = require('../controllers/questionController');

// 创建独立题目（可通过 query 参数 ?surveyId=xxx 绑定到特定未发布问卷）
router.post('/', authMiddleware, createQuestion);

// 修改题目（核心：触发 Copy-on-Write 版本控制逻辑）
router.put('/:id', authMiddleware, updateQuestion);

module.exports = router;