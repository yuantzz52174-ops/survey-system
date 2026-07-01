const Survey = require('../models/Survey');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

function buildSingleStats(question, relatedAnswers) {
  const optionCounts = {};
  question.options.forEach(option => { optionCounts[option] = 0; });
  let answeredCount = 0;
  relatedAnswers.forEach(item => {
    if (typeof item.value === 'string') {
      answeredCount++;
      if (optionCounts[item.value] !== undefined) optionCounts[item.value]++;
    }
  });
  return { questionId: question._id, title: question.title, type: question.type, totalAnswered: answeredCount, optionCounts };
}

function buildMultipleStats(question, relatedAnswers) {
  const optionCounts = {};
  question.options.forEach(option => { optionCounts[option] = 0; });
  let answeredCount = 0;
  relatedAnswers.forEach(item => {
    if (Array.isArray(item.value)) {
      answeredCount++;
      item.value.forEach(selected => {
        if (optionCounts[selected] !== undefined) optionCounts[selected]++;
      });
    }
  });
  return { questionId: question._id, title: question.title, type: question.type, totalAnswered: answeredCount, optionCounts };
}

function buildTextStats(question, relatedAnswers) {
  const textAnswers = [];
  relatedAnswers.forEach(item => {
    if (typeof item.value === 'string') textAnswers.push(item.value);
  });
  return { questionId: question._id, title: question.title, type: question.type, totalAnswered: textAnswers.length, answers: textAnswers };
}

function buildNumberStats(question, relatedAnswers) {
  const numberAnswers = [];
  relatedAnswers.forEach(item => {
    if (typeof item.value === 'number' && !Number.isNaN(item.value)) numberAnswers.push(item.value);
  });
  const totalAnswered = numberAnswers.length;
  const average = totalAnswered > 0 ? numberAnswers.reduce((sum, num) => sum + num, 0) / totalAnswered : null;
  return { questionId: question._id, title: question.title, type: question.type, totalAnswered, answers: numberAnswers, average };
}

function buildQuestionStats(question, allAnswerDocs) {
  const relatedAnswers = [];
  allAnswerDocs.forEach(doc => {
    doc.answers.forEach(item => {
      if (item.questionId.toString() === question._id.toString()) relatedAnswers.push(item);
    });
  });

  switch (question.type) {
    case 'single': return buildSingleStats(question, relatedAnswers);
    case 'multiple': return buildMultipleStats(question, relatedAnswers);
    case 'text': return buildTextStats(question, relatedAnswers);
    case 'number': return buildNumberStats(question, relatedAnswers);
    default: return { questionId: question._id, title: question.title, type: question.type, totalAnswered: 0 };
  }
}

exports.getSurveyStats = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findOne({ _id: surveyId, ownerId: req.user.userId });
    if (!survey) return res.status(404).json({ message: '问卷不存在或无权限查看统计' });

    const questions = await Question.find({ surveyId }).sort({ order: 1 });
    const answerDocs = await Answer.find({ surveyId });

    const stats = questions.map(question => buildQuestionStats(question, answerDocs));
    res.json({
      message: '获取问卷统计成功',
      survey: { id: survey._id, title: survey.title, totalSubmissions: answerDocs.length },
      stats
    });
  } catch (error) {
    res.status(500).json({ message: '获取问卷统计失败', error: error.message });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: '题目不存在' });

    const survey = await Survey.findOne({ _id: question.surveyId, ownerId: req.user.userId });
    if (!survey) return res.status(404).json({ message: '无权限查看该题统计' });

    const answerDocs = await Answer.find({ surveyId: question.surveyId });
    const stats = buildQuestionStats(question, answerDocs);
    res.json({ message: '获取题目统计成功', stats });
  } catch (error) {
    res.status(500).json({ message: '获取题目统计失败', error: error.message });
  }
};

// 新增：跨问卷全局统计
exports.getGlobalQuestionStats = async (req, res) => {
  try {
    const { originalId } = req.params;

    const latestQuestion = await Question.findOne({ originalId }).sort({ version: -1 });
    if (!latestQuestion) return res.status(404).json({ message: '未找到该题目的任何版本' });

    const allVersions = await Question.find({ originalId }).select('_id');
    const versionIds = allVersions.map(q => q._id);

    const globalAnswerDocs = await Answer.find({ 'answers.questionId': { $in: versionIds } });
    const globalStats = buildQuestionStats(latestQuestion, globalAnswerDocs);

    res.json({
      message: '跨问卷全局统计获取成功',
      originalId: originalId,
      totalInvolvedSurveys: globalAnswerDocs.length,
      stats: globalStats
    });
  } catch (error) {
    res.status(500).json({ message: '获取全局统计失败', error: error.message });
  }
};