// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // 核心溯源字段：同一道题的所有版本，originalId 保持一致
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    default: function() { return this._id; }
  },
  // 版本号
  version: {
    type: Number,
    default: 1
  },
  // 题目所有权与共享
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isShared: {
    type: Boolean,
    default: false
  },

  // 移除了原有的 surveyId 和 order
  type: {
    type: String,
    enum: ['single', 'multiple', 'text', 'number'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    default: []
  },
  required: {
    type: Boolean,
    default: false
  },
  rules: {
    minSelect: { type: Number, default: null },
    maxSelect: { type: Number, default: null },
    exactSelect: { type: Number, default: null },
    minLength: { type: Number, default: null },
    maxLength: { type: Number, default: null },
    minValue: { type: Number, default: null },
    maxValue: { type: Number, default: null },
    isInteger: { type: Boolean, default: false }
  },
  // 原有的 jumpLogic 被移至 Survey 模型中

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);