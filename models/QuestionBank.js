// models/QuestionBank.js
const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 题库中仅保存题目的 originalId 列表
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuestionBank', questionBankSchema);