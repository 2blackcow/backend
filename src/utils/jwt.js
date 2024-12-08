const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/constants');

const jwtUtil = {
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    });
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error('INVALID_TOKEN');
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  },

  decodeToken(token) {
    return jwt.decode(token);
  },

  getExpirationTime(token) {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.exp * 1000 : null;
  }
};

module.exports = jwtUtil;