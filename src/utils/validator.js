const { errorCodes } = require('../config/constants');

const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;

  const errors = [];

  // 이메일 검증
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 비밀번호 검증
  if (!password || password.length < 8) {
    errors.push('비밀번호는 8자 이상이어야 합니다.');
  }

  // 이름 검증
  if (!name || name.length < 2) {
    errors.push('이름은 2자 이상이어야 합니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      code: errorCodes.VALIDATION_ERROR,
      message: '입력값이 올바르지 않습니다.',
      errors
    });
  }

  next();
};

const validateJob = (req, res, next) => {
  const { title, description, companyId } = req.body;

  const errors = [];

  if (!title || title.length < 5) {
    errors.push('제목은 5자 이상이어야 합니다.');
  }

  if (!description || description.length < 20) {
    errors.push('설명은 20자 이상이어야 합니다.');
  }

  if (!companyId) {
    errors.push('회사 정보는 필수입니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      code: errorCodes.VALIDATION_ERROR,
      message: '입력값이 올바르지 않습니다.',
      errors
    });
  }

  next();
};

const validateApplication = (req, res, next) => {
  const { coverLetter } = req.body;
  const errors = [];

  // 자기소개서 검증 조건 완화
  if (!coverLetter) {
    errors.push('자기소개서는 필수 항목입니다.');
  } else if (coverLetter.length < 10) {
    errors.push('자기소개서는 최소 10자 이상이어야 합니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      code: errorCodes.VALIDATION_ERROR,
      message: '입력값이 올바르지 않습니다.',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateJob,
  validateApplication
};