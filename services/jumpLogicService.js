function isEmptyAnswer(value) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function matchCondition(condition, answerValue) {
  if (!condition) return false;
  if (isEmptyAnswer(answerValue)) return false;

  const { operator, value } = condition;

  switch (operator) {
    case 'equals':
      return answerValue === value;

    case 'notEquals':
      return answerValue !== value;

    case 'includes':
      return Array.isArray(answerValue) && answerValue.includes(value);

    case 'notIncludes':
      return Array.isArray(answerValue) && !answerValue.includes(value);

    case 'greaterThan':
      return typeof answerValue === 'number' && answerValue > value;

    case 'greaterThanOrEqual':
      return typeof answerValue === 'number' && answerValue >= value;

    case 'lessThan':
      return typeof answerValue === 'number' && answerValue < value;

    case 'lessThanOrEqual':
      return typeof answerValue === 'number' && answerValue <= value;

    default:
      return false;
  }
}

function getNextByOrder(currentQuestion, allQuestions) {
  return allQuestions.find(q => q.order === currentQuestion.order + 1) || null;
}

function getNextQuestion(currentQuestion, answerValue, allQuestions) {
  const jumpLogic = currentQuestion.jumpLogic || [];

  for (const rule of jumpLogic) {
    if (matchCondition(rule.condition, answerValue)) {
      const target = allQuestions.find(
        q => q._id.toString() === rule.targetQuestionId.toString()
      );

      if (target) {
        return target;
      }
    }
  }

  return getNextByOrder(currentQuestion, allQuestions);
}

module.exports = {
  isEmptyAnswer,
  matchCondition,
  getNextByOrder,
  getNextQuestion
};