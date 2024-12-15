const Job = require('../models/Job');
const { pagination } = require('../config/constants');

const jobController = {
  async getAllJobs(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;
  
      const jobs = await Job.find()
        .populate({
          path: 'companyId',
          select: 'companyName location industry'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      // ID 정보를 명시적으로 포함
      const jobsWithIds = jobs.map(job => ({
        ...job.toObject(),
        _id: job._id,  // MongoDB의 실제 _id를 포함
        jobId: job._id // 클라이언트용 id도 함께 제공
      }));
  
      const total = await Job.countDocuments();
  
      res.json({
        status: 'success',
        data: { jobs: jobsWithIds },
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
  // jobController에 추가할 함수들
async getRelatedJobs(req, res, next) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 5;
  
      const currentJob = await Job.findById(id);
      if (!currentJob) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }
  
      const relatedJobs = await Job.find({
        _id: { $ne: id },
        status: 'ACTIVE',
        $or: [
          { skills: { $in: currentJob.skills } },
          { 'location.city': currentJob.location.city },
          { experienceLevel: currentJob.experienceLevel }
        ]
      })
      .populate('companyId', 'companyName location industry')
      .limit(limit);
  
      res.json({
        status: 'success',
        data: { relatedJobs }
      });
    } catch (error) {
      next(error);
    }
  },
  
  async filterJobs(req, res, next) {
    try {
      const { locations, experienceLevels, salaryRange, skills } = req.query;
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;
  
      const filter = { status: 'ACTIVE' };
  
      if (locations) filter['location.city'] = { $in: locations };
      if (experienceLevels) filter.experienceLevel = { $in: experienceLevels };
      if (skills) filter.skills = { $in: skills };
      if (salaryRange) {
        filter.salary = {};
        if (salaryRange.min) filter.salary.$gte = parseInt(salaryRange.min);
        if (salaryRange.max) filter.salary.$lte = parseInt(salaryRange.max);
      }
  
      const jobs = await Job.find(filter)
        .populate('companyId', 'companyName location industry')
        .sort({ createdAt: -1 })
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
  
  async increaseViews(req, res, next) {
    try {
      const job = await Job.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );
  
      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }
  
      res.json({
        status: 'success',
        data: { viewCount: job.viewCount }
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
  },
  async getJobsByCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const jobs = await Job.find({ 
        companyId,
        status: 'ACTIVE'
      })
        .populate('companyId', 'companyName location industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments({ companyId, status: 'ACTIVE' });

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

  async getSimilarJobs(req, res, next) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);

      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }

      const similarJobs = await Job.find({
        _id: { $ne: job._id },
        status: 'ACTIVE',
        $or: [
          { skills: { $in: job.skills } },
          { experienceLevel: job.experienceLevel },
          { 'location.city': job.location.city }
        ]
      })
        .populate('companyId', 'companyName location')
        .limit(5);

      res.json({
        status: 'success',
        data: { similarJobs }
      });
    } catch (error) {
      next(error);
    }
  },

  async getRecentJobs(req, res, next) {
    try {
      const jobs = await Job.find({ status: 'ACTIVE' })
        .populate('companyId', 'companyName location industry')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        status: 'success',
        data: { jobs }
      });
    } catch (error) {
      next(error);
    }
  },

  async getFeaturedJobs(req, res, next) {
    try {
      const jobs = await Job.find({ 
        status: 'ACTIVE',
        isFeatured: true 
      })
        .populate('companyId', 'companyName location industry')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        status: 'success',
        data: { jobs }
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleJobStatus(req, res, next) {
    try {
      const job = await Job.findOne({ 
        _id: req.params.id,
        companyId: req.user.companyId
      });

      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없거나 권한이 없습니다.'
        });
      }

      job.status = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
      await job.save();

      res.json({
        status: 'success',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

};

module.exports = jobController;