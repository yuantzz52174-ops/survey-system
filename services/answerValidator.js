function isEmptyAnswer(value) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function validateSingle(question, value) {
  if (typeof value !== 'string') {
    return '单选题答案必须是字符串';
  }

  if (!question.options.includes(value)) {
    return '单选题答案不在可选项中';
  }

  return null;
}

function validateMultiple(question, value) {
  if (!Array.isArray(value)) {
    return '多选题答案必须是数组';
  }

  const invalidOption = value.find(item => !question.options.includes(item));
  if (invalidOption) {
    return '多选题答案中包含非法选项';
  }

  const selectedCount = value.length;
  const rules = question.rules || {};

  if (rules.exactSelect !== null && rules.exactSelect !== undefined) {
    if (selectedCount !== rules.exactSelect) {
      return `多选题必须选择 ${rules.exactSelect} 项`;
    }
  } else {
    if (rules.minSelect !== null && rules.minSelect !== undefined && selectedCount < rules.minSelect) {
      return `多选题至少选择 ${rules.minSelect} 项`;
    }

    if (rules.maxSelect !== null && rules.maxSelect !== undefined && selectedCount > rules.maxSelect) {
      return `多选题最多选择 ${rules.maxSelect} 项`;
    }
  }

  return null;
}

function validateText(question, value) {
  if (typeof value !== 'string') {
    return '文本题答案必须是字符串';
  }

  const length = value.length;
  const rules = question.rules || {};

  if (rules.minLength !== null && rules.minLength !== undefined && length < rules.minLength) {
    return `文本长度不能少于 ${rules.minLength}`;
  }

  if (rules.maxLength !== null && rules.maxLength !== undefined && length > rules.maxLength) {
    return `文本长度不能超过 ${rules.maxLength}`;
  }

  return null;
}

function validateNumber(question, value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '数字题答案必须是数字';
  }

  const rules = question.rules || {};

  if (rules.isInteger && !Number.isInteger(value)) {
    return '该题答案必须为整数';
  }

  if (rules.minValue !== null && rules.minValue !== undefined && value < rules.minValue) {
    return `数字不能小于 ${rules.minValue}`;
  }

  if (rules.maxValue !== null && rules.maxValue !== undefined && value > rules.maxValue) {
    return `数字不能大于 ${rules.maxValue}`;
  }

  return null;
}

function validateAnswer(question, value) {
  if (question.required && isEmptyAnswer(value)) {
    return '该题为必答题';
  }

  if (!question.required && isEmptyAnswer(value)) {
    return null;
  }

  switch (question.type) {
    case 'single':
      return validateSingle(question, value);
    case 'multiple':
      return validateMultiple(question, value);
    case 'text':
      return validateText(question, value);
    case 'number':
      return validateNumber(question, value);
    default:
      return '未知题型';
  }
}

module.exports = {
  validateAnswer
};