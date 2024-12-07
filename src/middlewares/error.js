const { errorCodes } = require('../config/constants');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    }
  });

  // MongoDB 중복 키 에러
  if (err.code === 11000) {
    return res.status(400).json({
      status: 'error',
      code: errorCodes.DUPLICATE_ENTRY,
      message: '중복된 데이터가 존재합니다.'
    });
  }

  // MongoDB Validation 에러
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(err => err.message);
    return res.status(400).json({
      status: 'error',
      code: errorCodes.VALIDATION_ERROR,
      message: '입력값이 올바르지 않습니다.',
      errors: messages
    });
  }

  // 캐스팅 에러 (잘못된 ObjectId 등)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      code: errorCodes.VALIDATION_ERROR,
      message: '잘못된 데이터 형식입니다.'
    });
  }

  // JWT 에러
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: errorCodes.INVALID_TOKEN,
      message: '유효하지 않은 토큰입니다.'
    });
  }

  // 기본 에러 응답
  res.status(err.status || 500).json({
    status: 'error',
    code: errorCodes.SERVER_ERROR,
    message: process.env.NODE_ENV === 'production' 
      ? '서버 오류가 발생했습니다.' 
      : err.message
  });
};

module.exports = errorHandler;