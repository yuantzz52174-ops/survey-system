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

    if (!title) {
      return res.status(400).json({ message: '问卷标题不能为空' });
    }

    let accessCode = generateAccessCode();

    while (await Survey.findOne({ accessCode })) {
      accessCode = generateAccessCode();
    }

    const survey = await Survey.create({
      title,
      description,
      isAnonymous,
      deadline,
      ownerId: req.user.userId,
      accessCode
    });

    res.status(201).json({
      message: '问卷创建成功',
      survey
    });
  } catch (error) {
    res.status(500).json({ message: '创建失败', error: error.message });
  }
};

exports.getMySurveys = async (req, res) => {
  const surveys = await Survey.find({ ownerId: req.user.userId });
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