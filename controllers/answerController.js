const Survey = require('../models/Survey');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { validateAnswer } = require('../services/answerValidator');

exports.getSurveyForFill = async (req, res) => {
  try {
    const { accessCode } = req.params;

    const survey = await Survey.findOne({ accessCode });

    if (!survey) {
      return res.status(404).json({ message: '问卷不存在' });
    }

    if (!survey.isPublished) {
      return res.status(400).json({ message: '问卷尚未发布' });
    }

    if (survey.isClosed) {
      return res.status(400).json({ message: '问卷已关闭' });
    }

    if (survey.deadline && new Date() > new Date(survey.deadline)) {
      return res.status(400).json({ message: '问卷已截止' });
    }

    const questions = await Question.find({ surveyId: survey._id }).sort({ order: 1 });

    res.json({
      message: '获取问卷成功',
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        isAnonymous: survey.isAnonymous,
        accessCode: survey.accessCode,
        questions
      }
    });
  } catch (error) {
    res.status(500).json({
      message: '获取问卷失败',
      error: error.message
    });
  }
};

exports.submitSurvey = async (req, res) => {
  try {
    const { accessCode } = req.params;
    const { answers } = req.body;

    const survey = await Survey.findOne({ accessCode });

    if (!survey) {
      return res.status(404).json({ message: '问卷不存在' });
    }

    if (!survey.isPublished) {
      return res.status(400).json({ message: '问卷尚未发布' });
    }

    if (survey.isClosed) {
      return res.status(400).json({ message: '问卷已关闭' });
    }

    if (survey.deadline && new Date() > new Date(survey.deadline)) {
      return res.status(400).json({ message: '问卷已截止' });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'answers 必须是非空数组' });
    }

    const questions = await Question.find({ surveyId: survey._id });
    const questionMap = new Map();

    questions.forEach(question => {
      questionMap.set(question._id.toString(), question);
    });

    const validationErrors = [];

    for (const item of answers) {
      const question = questionMap.get(item.questionId);

      if (!question) {
        validationErrors.push({
          questionId: item.questionId,
          message: '题目不存在'
        });
        continue;
      }

      const errorMessage = validateAnswer(question, item.value);

      if (errorMessage) {
        validationErrors.push({
          questionId: item.questionId,
          title: question.title,
          message: errorMessage
        });
      }
    }

    for (const question of questions) {
      if (question.required) {
        const hasAnswer = answers.some(
          item => item.questionId === question._id.toString()
        );

        if (!hasAnswer) {
          validationErrors.push({
            questionId: question._id,
            title: question.title,
            message: '必答题未填写'
          });
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: '答案校验失败',
        errors: validationErrors
      });
    }

    const answerDoc = await Answer.create({
      surveyId: survey._id,
      userId: survey.isAnonymous ? null : req.user.userId,
      isAnonymousSubmit: survey.isAnonymous,
      answers
    });

    res.status(201).json({
      message: '问卷提交成功',
      submission: answerDoc
    });
  } catch (error) {
    res.status(500).json({
      message: '问卷提交失败',
      error: error.message
    });
  }
};