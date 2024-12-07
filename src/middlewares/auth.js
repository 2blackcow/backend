const jwt = require('jsonwebtoken');
const { errorCodes } = require('../config/constants');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: errorCodes.AUTH_FAILED,
        message: '인증이 필요합니다.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          code: errorCodes.AUTH_FAILED,
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          code: errorCodes.TOKEN_EXPIRED,
          message: '토큰이 만료되었습니다.'
        });
      }
      
      return res.status(401).json({
        status: 'error',
        code: errorCodes.INVALID_TOKEN,
        message: '유효하지 않은 토큰입니다.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// 특정 역할을 가진 사용자만 접근 가능하도록 하는 미들웨어
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: errorCodes.AUTH_FAILED,
        message: '인증이 필요합니다.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        code: errorCodes.FORBIDDEN,
        message: '접근 권한이 없습니다.'
      });
    }

    next();
  };
};

module.exports = { auth, checkRole };