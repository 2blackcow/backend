const Resume = require('../models/Resume');
const { pagination } = require('../config/constants');

const resumeController = {
  async createResume(req, res, next) {
    try {
      const resume = await Resume.create({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json({
        status: 'success',
        data: { resume }
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyResumes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const resumes = await Resume.find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Resume.countDocuments({ userId: req.user.id });

      res.json({
        status: 'success',
        data: { resumes },
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

  async getResumeById(req, res, next) {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!resume) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '이력서를 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { resume }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateResume(req, res, next) {
    try {
      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { 
          $set: req.body,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!resume) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '이력서를 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { resume }
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteResume(req, res, next) {
    try {
      const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!resume) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '이력서를 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        message: '이력서가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = resumeController;