const Job = require('../models/Job');
const { pagination } = require('../config/constants');

const jobController = {
  async getAllJobs(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      // 필터 구성
      const filter = { status: 'ACTIVE' };
      if (req.query.location) filter['location.city'] = req.query.location;
      if (req.query.experienceLevel) filter.experienceLevel = req.query.experienceLevel;
      if (req.query.jobType) filter.jobType = req.query.jobType;
      if (req.query.skills) filter.skills = { $in: req.query.skills.split(',') };

      // 정렬 옵션
      const sort = {};
      if (req.query.sortBy) {
        const [field, order] = req.query.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1;
      }

      const jobs = await Job.find(filter)
        .populate('companyId', 'companyName location industry')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(filter);

      res.json({
        status: 'success',
        data: { jobs },
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

  async searchJobs(req, res, next) {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { 'skills': { $regex: query, $options: 'i' } }
        ],
        status: 'ACTIVE'
      };

      const jobs = await Job.find(searchQuery)
        .populate('companyId', 'companyName location industry')
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(searchQuery);

      res.json({
        status: 'success',
        data: { jobs },
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

  async getJobById(req, res, next) {
    try {
      const job = await Job.findById(req.params.id)
        .populate('companyId', 'companyName location industry description');

      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  async createJob(req, res, next) {
    try {
      const job = await Job.create({
        ...req.body,
        companyId: req.user.companyId
      });

      res.status(201).json({
        status: 'success',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateJob(req, res, next) {
    try {
      const job = await Job.findOneAndUpdate(
        { _id: req.params.id, companyId: req.user.companyId },
        { $set: req.body },
        { new: true }
      );

      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없거나 수정 권한이 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteJob(req, res, next) {
    try {
      const job = await Job.findOneAndDelete({
        _id: req.params.id,
        companyId: req.user.companyId
      });

      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없거나 삭제 권한이 없습니다.'
        });
      }

      res.json({
        status: 'success',
        message: '채용공고가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = jobController;