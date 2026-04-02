const Survey = require('../models/Survey');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { validateAnswer } = require('../services/answerValidator');
const {
  isEmptyAnswer,
  getNextByOrder,
  getNextQuestion
} = require('../services/jumpLogicService');

async function getAvailableSurveyAndQuestions(accessCode) {
  const survey = await Survey.findOne({ accessCode });

  if (!survey) {
    return { error: { status: 404, message: '问卷不存在' } };
  }

  if (!survey.isPublished) {
    return { error: { status: 400, message: '问卷尚未发布' } };
  }

  if (survey.isClosed) {
    return { error: { status: 400, message: '问卷已关闭' } };
  }

  if (survey.deadline && new Date() > new Date(survey.deadline)) {
    return { error: { status: 400, message: '问卷已截止' } };
  }

  const questions = await Question.find({ surveyId: survey._id }).sort({ order: 1 });

  return { survey, questions };
}

exports.getSurveyForFill = async (req, res) => {
  try {
    const { accessCode } = req.params;

    const result = await getAvailableSurveyAndQuestions(accessCode);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const { survey, questions } = result;
    const firstQuestion = questions.length > 0 ? questions[0] : null;

    res.json({
      message: '获取问卷成功',
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        isAnonymous: survey.isAnonymous,
        accessCode: survey.accessCode,
        firstQuestion,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      message: '获取问卷失败',
      error: error.message
    });
  }
};

exports.getNextQuestionByAnswer = async (req, res) => {
  try {
    const { accessCode } = req.params;
    const { questionId, value } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: 'questionId 不能为空' });
    }

    const result = await getAvailableSurveyAndQuestions(accessCode);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const { questions } = result;

    const currentQuestion = questions.find(
      q => q._id.toString() === questionId.toString()
    );

    if (!currentQuestion) {
      return res.status(404).json({ message: '当前题目不存在' });
    }

    const validationError = validateAnswer(currentQuestion, value);
    if (validationError) {
      return res.status(400).json({
        message: '当前题答案不合法',
        error: validationError
      });
    }

    let nextQuestion;

    if (isEmptyAnswer(value)) {
      nextQuestion = getNextByOrder(currentQuestion, questions);
    } else {
      nextQuestion = getNextQuestion(currentQuestion, value, questions);
    }

    res.json({
      message: '获取下一题成功',
      completed: !nextQuestion,
      nextQuestion: nextQuestion || null
    });
  } catch (error) {
    res.status(500).json({
      message: '获取下一题失败',
      error: error.message
    });
  }
};

exports.submitSurvey = async (req, res) => {
  try {
    const { accessCode } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'answers 必须是非空数组' });
    }

    const result = await getAvailableSurveyAndQuestions(accessCode);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const { survey, questions } = result;

    if (questions.length === 0) {
      return res.status(400).json({ message: '问卷没有题目，无法提交' });
    }

    const answerMap = new Map();
    const validationErrors = [];

    for (const item of answers) {
      if (!item.questionId) {
        validationErrors.push({
          questionId: null,
          message: '存在未提供 questionId 的答案项'
        });
        continue;
      }

      if (answerMap.has(item.questionId.toString())) {
        validationErrors.push({
          questionId: item.questionId,
          message: '同一题目重复提交答案'
        });
        continue;
      }

      answerMap.set(item.questionId.toString(), item);
    }

    const expectedPath = [];
    const visited = new Set();
    let currentQuestion = questions[0];

    while (currentQuestion && !visited.has(currentQuestion._id.toString())) {
      visited.add(currentQuestion._id.toString());
      expectedPath.push(currentQuestion);

      const currentAnswerItem = answerMap.get(currentQuestion._id.toString());
      const currentValue = currentAnswerItem ? currentAnswerItem.value : undefined;

      const errorMessage = validateAnswer(currentQuestion, currentValue);
      if (errorMessage) {
        validationErrors.push({
          questionId: currentQuestion._id,
          title: currentQuestion.title,
          message: errorMessage
        });
      }

      let nextQuestion = null;

      if (isEmptyAnswer(currentValue)) {
        if (currentQuestion.required) {
          break;
        } else {
          nextQuestion = getNextByOrder(currentQuestion, questions);
        }
      } else {
        nextQuestion = getNextQuestion(currentQuestion, currentValue, questions);
      }

      currentQuestion = nextQuestion;
    }

    const expectedPathIds = new Set(
      expectedPath.map(q => q._id.toString())
    );

    for (const item of answers) {
      if (!expectedPathIds.has(item.questionId.toString())) {
        validationErrors.push({
          questionId: item.questionId,
          message: '该题不在本次有效作答路径中，不能提交其答案'
        });
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
      submission: answerDoc,
      path: expectedPath.map(q => ({
        questionId: q._id,
        title: q.title,
        order: q.order
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: '问卷提交失败',
      error: error.message
    });
  }
};