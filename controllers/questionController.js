const Survey = require('../models/Survey');
const Question = require('../models/Question');

exports.addQuestion = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const {
      order,
      type,
      title,
      options,
      required,
      rules,
      jumpLogic
    } = req.body;

    const survey = await Survey.findOne({
      _id: surveyId,
      ownerId: req.user.userId
    });

    if (!survey) {
      return res.status(404).json({ message: '问卷不存在或无权限操作' });
    }

    if (!order || !type || !title) {
      return res.status(400).json({ message: 'order、type、title 不能为空' });
    }

    if (!['single', 'multiple', 'text', 'number'].includes(type)) {
      return res.status(400).json({ message: '题目类型不合法' });
    }

    if ((type === 'single' || type === 'multiple') && (!options || options.length < 2)) {
      return res.status(400).json({ message: '单选题或多选题至少需要两个选项' });
    }

    if ((type === 'text' || type === 'number') && options && options.length > 0) {
      return res.status(400).json({ message: '填空题不应包含 options' });
    }

    const existingQuestion = await Question.findOne({ surveyId, order });
    if (existingQuestion) {
      return res.status(400).json({ message: '该问卷中题目顺序不能重复' });
    }

    const question = await Question.create({
      surveyId,
      order,
      type,
      title,
      options: options || [],
      required: required || false,
      rules: rules || {},
      jumpLogic: jumpLogic || []
    });

    res.status(201).json({
      message: '题目添加成功',
      question
    });
  } catch (error) {
    res.status(500).json({
      message: '添加题目失败',
      error: error.message
    });
  }
};

exports.getQuestionsBySurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findOne({
      _id: surveyId,
      ownerId: req.user.userId
    });

    if (!survey) {
      return res.status(404).json({ message: '问卷不存在或无权限查看' });
    }

    const questions = await Question.find({ surveyId }).sort({ order: 1 });

    res.json({
      message: '获取题目成功',
      questions
    });
  } catch (error) {
    res.status(500).json({
      message: '获取题目失败',
      error: error.message
    });
  }
};