const User = require('../models/User');
const { jwt: jwtConfig, userRoles } = require('../config/constants');
const { generateToken } = require('../utils/jwt');
const { encodeBase64 } = require('../utils/encryption');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name, role = userRoles.JOB_SEEKER } = req.body;

      // 이메일 중복 체크
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          code: 'DUPLICATE_EMAIL',
          message: '이미 존재하는 이메일입니다.'
        });
      }

      // 비밀번호 인코딩 (Base64)
      const encodedPassword = encodeBase64(password);

      // 사용자 생성
      const user = await User.create({
        email,
        password: encodedPassword,
        name,
        role
      });

      // JWT 토큰 생성
      const token = generateToken({ userId: user._id });

      res.status(201).json({
        status: 'success',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 사용자 찾기
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      // 비밀번호 확인
      if (user.password !== encodeBase64(password)) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      // JWT 토큰 생성
      const token = generateToken({ userId: user._id });

      res.json({
        status: 'success',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const userId = req.user.id;
      const token = generateToken({ userId });

      res.json({
        status: 'success',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      delete updates.password; // 비밀번호는 별도 엔드포인트로 처리

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true }
      ).select('-password');

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;