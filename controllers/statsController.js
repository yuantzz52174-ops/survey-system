const Survey = require('../models/Survey');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

function buildSingleStats(question, relatedAnswers) {
  const optionCounts = {};
  question.options.forEach(option => {
    optionCounts[option] = 0;
  });

  let answeredCount = 0;

  relatedAnswers.forEach(item => {
    if (typeof item.value === 'string') {
      answeredCount++;
      if (optionCounts[item.value] !== undefined) {
        optionCounts[item.value]++;
      }
    }
  });

  return {
    questionId: question._id,
    title: question.title,
    type: question.type,
    totalAnswered: answeredCount,
    optionCounts
  };
}

function buildMultipleStats(question, relatedAnswers) {
  const optionCounts = {};
  question.options.forEach(option => {
    optionCounts[option] = 0;
  });

  let answeredCount = 0;

  relatedAnswers.forEach(item => {
    if (Array.isArray(item.value)) {
      answeredCount++;
      item.value.forEach(selected => {
        if (optionCounts[selected] !== undefined) {
          optionCounts[selected]++;
        }
      });
    }
  });

  return {
    questionId: question._id,
    title: question.title,
    type: question.type,
    totalAnswered: answeredCount,
    optionCounts
  };
}

function buildTextStats(question, relatedAnswers) {
  const textAnswers = [];

  relatedAnswers.forEach(item => {
    if (typeof item.value === 'string') {
      textAnswers.push(item.value);
    }
  });

  return {
    questionId: question._id,
    title: question.title,
    type: question.type,
    totalAnswered: textAnswers.length,
    answers: textAnswers
  };
}

function buildNumberStats(question, relatedAnswers) {
  const numberAnswers = [];

  relatedAnswers.forEach(item => {
    if (typeof item.value === 'number' && !Number.isNaN(item.value)) {
      numberAnswers.push(item.value);
    }
  });

  const totalAnswered = numberAnswers.length;
  const average =
    totalAnswered > 0
      ? numberAnswers.reduce((sum, num) => sum + num, 0) / totalAnswered
      : null;

  return {
    questionId: question._id,
    title: question.title,
    type: question.type,
    totalAnswered,
    answers: numberAnswers,
    average
  };
}

function buildQuestionStats(question, allAnswerDocs) {
  const relatedAnswers = [];

  allAnswerDocs.forEach(doc => {
    doc.answers.forEach(item => {
      if (item.questionId.toString() === question._id.toString()) {
        relatedAnswers.push(item);
      }
    });
  });

  switch (question.type) {
    case 'single':
      return buildSingleStats(question, relatedAnswers);
    case 'multiple':
      return buildMultipleStats(question, relatedAnswers);
    case 'text':
      return buildTextStats(question, relatedAnswers);
    case 'number':
      return buildNumberStats(question, relatedAnswers);
    default:
      return {
        questionId: question._id,
        title: question.title,
        type: question.type,
        totalAnswered: 0
      };
  }
}

exports.getSurveyStats = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findOne({
      _id: surveyId,
      ownerId: req.user.userId
    });

    if (!survey) {
      return res.status(404).json({ message: '问卷不存在或无权限查看统计' });
    }

    const questions = await Question.find({ surveyId }).sort({ order: 1 });
    const answerDocs = await Answer.find({ surveyId });

    const stats = questions.map(question =>
      buildQuestionStats(question, answerDocs)
    );

    res.json({
      message: '获取问卷统计成功',
      survey: {
        id: survey._id,
        title: survey.title,
        totalSubmissions: answerDocs.length
      },
      stats
    });
  } catch (error) {
    res.status(500).json({
      message: '获取问卷统计失败',
      error: error.message
    });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '题目不存在' });
    }

    const survey = await Survey.findOne({
      _id: question.surveyId,
      ownerId: req.user.userId
    });

    if (!survey) {
      return res.status(404).json({ message: '无权限查看该题统计' });
    }

    const answerDocs = await Answer.find({ surveyId: question.surveyId });
    const stats = buildQuestionStats(question, answerDocs);

    res.json({
      message: '获取题目统计成功',
      stats
    });
  } catch (error) {
    res.status(500).json({
      message: '获取题目统计失败',
      error: error.message
    });
  }
};