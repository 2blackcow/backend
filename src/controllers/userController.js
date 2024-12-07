const User = require('../models/User');
const Application = require('../models/Application');
const UserActivity = require('../models/UserActivity');
const { pagination } = require('../config/constants');
const { encodeBase64 } = require('../utils/encryption');

const userController = {
  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      delete updates.password; // 비밀번호 변경은 별도 API로 처리

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { 
          $set: updates,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      // 활동 기록 저장
      await UserActivity.create({
        userId: req.user.id,
        type: 'UPDATE_PROFILE',
        metadata: { updatedFields: Object.keys(updates) }
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

      // 새 비밀번호 업데이트
      user.password = encodeBase64(newPassword);
      user.updatedAt = new Date();
      await user.save();

      res.json({
        status: 'success',
        message: '비밀번호가 변경되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserActivity(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const activities = await UserActivity.find({ userId: req.user.id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UserActivity.countDocuments({ userId: req.user.id });

      res.json({
        status: 'success',
        data: { activities },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getApplicationStats(req, res, next) {
    try {
      const stats = await Application.aggregate([
        { $match: { userId: req.user.id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = stat.count;
        return acc;
      }, {
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0
      });

      res.json({
        status: 'success',
        data: { stats: formattedStats }
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      // 사용자 계정 삭제
      await User.findByIdAndDelete(req.user.id);

      // 관련된 데이터 삭제
      await Promise.all([
        Application.deleteMany({ userId: req.user.id }),
        UserActivity.deleteMany({ userId: req.user.id })
      ]);

      res.json({
        status: 'success',
        message: '계정이 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;