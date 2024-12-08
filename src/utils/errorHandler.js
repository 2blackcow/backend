const logger = require('./logger');
const { errorCodes } = require('../config/constants');

class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = {
  AppError,

  handleError(error, req = null) {
    logger.error(error.message, {
      code: error.code,
      stack: error.stack,
      path: req ? req.path : '',
      method: req ? req.method : '',
      body: req ? req.body : '',
      params: req ? req.params : '',
      query: req ? req.query : ''
    });
  },

  handleValidationError(error) {
    return new AppError(
      errorCodes.VALIDATION_ERROR,
      error.message || '입력값이 올바르지 않습니다.',
      400
    );
  },

  handleDuplicateKeyError(error) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(
      errorCodes.DUPLICATE_ENTRY,
      `${field}가 이미 존재합니다.`,
      400
    );
  },

  handleCastError(error) {
    return new AppError(
      errorCodes.INVALID_ID,
      `잘못된 ${error.path} 형식입니다.`,
      400
    );
  },

  handleTokenError(error) {
    if (error.message === 'TOKEN_EXPIRED') {
      return new AppError(
        errorCodes.TOKEN_EXPIRED,
        '토큰이 만료되었습니다.',
        401
      );
    }
    return new AppError(
      errorCodes.INVALID_TOKEN,
      '유효하지 않은 토큰입니다.',
      401
    );
  },

  isTrustedError(error) {
    return error instanceof AppError;
  },

  createError(code, message, status) {
    return new AppError(code, message, status);
  }
};

module.exports = errorHandler;