const Question = require('../models/Question');
const Survey = require('../models/Survey');

exports.createQuestion = async (req, res) => {
  try {
    const { surveyId } = req.query;
    const { type, title, options, required, rules, isShared } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: 'type 和 title 不能为空' });
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

    const question = await Question.create({
      creatorId: req.user.userId,
      isShared: isShared || false,
      type,
      title,
      options: options || [],
      required: required || false,
      rules: rules || {}
    });

    if (surveyId) {
      const survey = await Survey.findOne({ _id: surveyId, ownerId: req.user.userId });
      if (survey && !survey.isPublished) {
        const order = survey.questions.length + 1;
        survey.questions.push({ questionId: question._id, order: order, jumpLogic: [] });
        await survey.save();
      }
    }

    res.status(201).json({ message: '题目创建成功', question });
  } catch (error) {
    res.status(500).json({ message: '添加题目失败', error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const currentQuestion = await Question.findById(id);
    if (!currentQuestion) {
      return res.status(404).json({ message: '题目不存在' });
    }

    if (currentQuestion.creatorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: '无权限修改该题目' });
    }

    const isUsedInPublishedSurvey = await Survey.exists({
      'questions.questionId': id,
      $or: [{ isPublished: true }, { isClosed: true }]
    });

    if (isUsedInPublishedSurvey) {
      const { _id, createdAt, updatedAt, __v, ...questionBaseData } = currentQuestion.toObject();

      const newVersionData = {
        ...questionBaseData,
        ...updateData,
        version: currentQuestion.version + 1,
        originalId: currentQuestion.originalId
      };

      const newQuestion = await Question.create(newVersionData);
      return res.status(201).json({
        message: '该题已被发布问卷使用，已自动生成新版本以保护历史数据',
        data: newQuestion,
        isNewVersion: true
      });
    } else {
      const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, { new: true });
      return res.status(200).json({
        message: '题目修改成功',
        data: updatedQuestion,
        isNewVersion: false
      });
    }
  } catch (error) {
    res.status(500).json({ message: '修改题目失败', error: error.message });
  }
};