const mongoose = require('mongoose');

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

const questionSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
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
    minSelect: {
      type: Number,
      default: null
    },
    maxSelect: {
      type: Number,
      default: null
    },
    exactSelect: {
      type: Number,
      default: null
    },
    minLength: {
      type: Number,
      default: null
    },
    maxLength: {
      type: Number,
      default: null
    },
    minValue: {
      type: Number,
      default: null
    },
    maxValue: {
      type: Number,
      default: null
    },
    isInteger: {
      type: Boolean,
      default: false
    }
  },
  jumpLogic: {
    type: [jumpRuleSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);