const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const { encodeBase64 } = require('../utils/encryption');
const jwtUtil = require('../utils/jwt');
const crypto = require('crypto');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name, role = 'JOB_SEEKER' } = req.body;

      // 이메일 중복 체크
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          code: 'DUPLICATE_EMAIL',
          message: '이미 등록된 이메일입니다.'
        });
      }

      // 비밀번호 암호화 (Base64)
      const encodedPassword = encodeBase64(password);

      // 사용자 생성
      const user = await User.create({
        email,
        password: encodedPassword,
        name,
        role
      });

      // 활동 기록
      await UserActivity.create({
        userId: user._id,
        type: 'REGISTER',
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      });

      res.status(201).json({
        status: 'success',
        data: {
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

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          status: 'error',
          code: 'AUTH_FAILED',
          message: '이메일 또는 비밀번호가 일치하지 않습니다.'
        });
      }

      // 비밀번호 검증
      const encodedPassword = encodeBase64(password);
      if (user.password !== encodedPassword) {
        return res.status(401).json({
          status: 'error',
          code: 'AUTH_FAILED',
          message: '이메일 또는 비밀번호가 일치하지 않습니다.'
        });
      }

      // 토큰 생성
      const token = jwtUtil.generateToken({
        userId: user._id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomBytes(16).toString('hex')
      });

      // 리프레시 토큰 생성
      const refreshToken = jwtUtil.generateRefreshToken({
        userId: user._id
      });

      // 리프레시 토큰 저장
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      // 로그인 활동 기록
      await UserActivity.create({
        userId: user._id,
        type: 'LOGIN',
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      });

      res.json({
        status: 'success',
        data: {
          token,
          refreshToken,
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
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_REQUEST',
          message: '리프레시 토큰이 필요합니다.'
        });
      }
  
      try {
        // 리프레시 토큰 검증
        const decoded = jwtUtil.verifyRefreshToken(refreshToken);
        
        // 사용자 조회 및 토큰 검증
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
          return res.status(401).json({
            status: 'error',
            code: 'INVALID_REFRESH_TOKEN',
            message: '유효하지 않은 리프레시 토큰입니다.'
          });
        }
  
        // 새로운 액세스 토큰 발급
        const newToken = jwtUtil.generateToken({
          userId: user._id,
          email: user.email,
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomBytes(16).toString('hex')
        });
  
        res.json({
          status: 'success',
          data: { token: newToken }
        });
      } catch (error) {
        // JWT 검증 실패 시 에러 처리
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: 'error',
            code: 'INVALID_REFRESH_TOKEN',
            message: '유효하지 않은 리프레시 토큰입니다.'
          });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      // 리프레시 토큰 제거
      await User.findByIdAndUpdate(req.user.id, {
        $unset: { refreshToken: 1 }
      });

      // 로그아웃 활동 기록
      await UserActivity.create({
        userId: req.user.id,
        type: 'LOGOUT',
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      });

      res.json({
        status: 'success',
        message: '로그아웃되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id).select('-password -refreshToken');
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

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
      const updates = { ...req.body };
      delete updates.password;
      delete updates.email;
      delete updates.role;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true }
      ).select('-password -refreshToken');

      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      // 프로필 업데이트 활동 기록
      await UserActivity.create({
        userId: req.user.id,
        type: 'UPDATE_PROFILE',
        metadata: {
          updatedFields: Object.keys(updates)
        }
      });

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      // 현재 비밀번호 확인
      if (user.password !== encodeBase64(currentPassword)) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_PASSWORD',
          message: '현재 비밀번호가 일치하지 않습니다.'
        });
      }

      // 새 비밀번호 설정
      user.password = encodeBase64(newPassword);
      user.updatedAt = new Date();
      await user.save();

      // 비밀번호 변경 활동 기록
      await UserActivity.create({
        userId: user._id,
        type: 'CHANGE_PASSWORD',
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      });

      res.json({
        status: 'success',
        message: '비밀번호가 변경되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;