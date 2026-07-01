// models/Survey.js
const mongoose = require('mongoose');

// 从 Question 中迁移过来的跳转逻辑
const jumpRuleSchema = new mongoose.Schema(
  {
    condition: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    targetQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    }
  },
  { _id: false }
);

// 问卷内部的题目包装器（管理本问卷特有的顺序和跳题逻辑）
const surveyQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    jumpLogic: {
      type: [jumpRuleSchema],
      default: []
    }
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date,
    default: null
  },
  accessCode: {
    type: String,
    required: true,
    unique: true
  },
  // 新增：记录该问卷使用的所有题目（具体到某个版本）
  questions: {
    type: [surveyQuestionSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Survey', surveySchema);