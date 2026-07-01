const Survey = require('../models/Survey');

function generateAccessCode(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.createSurvey = async (req, res) => {
  try {
    const { title, description, isAnonymous, deadline } = req.body;
    if (!title) return res.status(400).json({ message: '问卷标题不能为空' });

    let accessCode = generateAccessCode();
    while (await Survey.findOne({ accessCode })) { accessCode = generateAccessCode(); }

    const survey = await Survey.create({
      title, description, isAnonymous, deadline,
      ownerId: req.user.userId, accessCode, questions: []
    });

    res.status(201).json({ message: '问卷创建成功', survey });
  } catch (error) {
    res.status(500).json({ message: '创建失败', error: error.message });
  }
};

exports.getMySurveys = async (req, res) => {
  const surveys = await Survey.find({ ownerId: req.user.userId })
                              .populate('questions.questionId');
  res.json(surveys);
};

exports.publishSurvey = async (req, res) => {
  const survey = await Survey.findById(req.params.id);
  survey.isPublished = true;
  await survey.save();
  res.json(survey);
};

exports.closeSurvey = async (req, res) => {
  const survey = await Survey.findById(req.params.id);
  survey.isClosed = true;
  await survey.save();
  res.json(survey);
};

exports.addExistingQuestionToSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { questionId } = req.body;

    const survey = await Survey.findOne({ _id: surveyId, ownerId: req.user.userId });
    if (!survey || survey.isPublished) {
      return res.status(403).json({ message: '问卷不存在或已发布，无法添加题目' });
    }

    const order = survey.questions.length + 1;
    survey.questions.push({ questionId, order, jumpLogic: [] });
    await survey.save();

    res.json({ message: '引入题目成功', survey });
  } catch (error) {
    res.status(500).json({ message: '引入题目失败', error: error.message });
  }
};

exports.updateJumpLogicInSurvey = async (req, res) => {
  try {
    const { surveyId, questionId } = req.params;
    const { jumpLogic } = req.body;

    if (!Array.isArray(jumpLogic)) {
      return res.status(400).json({ message: 'jumpLogic 必须是数组' });
    }

    const survey = await Survey.findOne({ _id: surveyId, ownerId: req.user.userId });
    if (!survey) return res.status(404).json({ message: '问卷不存在' });
    if (survey.isPublished) return res.status(400).json({ message: '已发布的问卷无法修改跳转逻辑' });

    const questionWrapper = survey.questions.find(q => q.questionId.toString() === questionId);
    if (!questionWrapper) return res.status(404).json({ message: '该题目不在本问卷中' });

    for (const rule of jumpLogic) {
      const targetWrapper = survey.questions.find(q => q.questionId.toString() === rule.targetQuestionId);
      if (!targetWrapper) return res.status(400).json({ message: '目标跳转题目不在当前问卷中' });
      if (targetWrapper.order <= questionWrapper.order) {
        return res.status(400).json({ message: '只允许向后跳转' });
      }
    }

    questionWrapper.jumpLogic = jumpLogic;
    await survey.save();

    res.json({ message: '跳转逻辑更新成功', survey });
  } catch (error) {
    res.status(500).json({ message: '更新跳转逻辑失败', error: error.message });
  }
};