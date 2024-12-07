const Application = require('../models/Application');
const Job = require('../models/Job');
const { pagination } = require('../config/constants');

const applicationController = {
  async apply(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      // 이미 지원했는지 확인
      const existingApplication = await Application.findOne({ jobId, userId });
      if (existingApplication) {
        return res.status(400).json({
          status: 'error',
          code: 'DUPLICATE_APPLICATION',
          message: '이미 지원한 채용공고입니다.'
        });
      }

      // 채용공고 존재 여부 및 마감 확인
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }

      if (job.status === 'CLOSED' || (job.deadline && new Date(job.deadline) < new Date())) {
        return res.status(400).json({
          status: 'error',
          code: 'JOB_CLOSED',
          message: '마감된 채용공고입니다.'
        });
      }

      // 지원서 생성
      const application = await Application.create({
        jobId,
        userId,
        ...req.body
      });

      res.status(201).json({
        status: 'success',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const filter = { userId: req.user.id };
      if (req.query.status) filter.status = req.query.status;

      const applications = await Application.find(filter)
        .populate('jobId', 'title companyId status')
        .populate('jobId.companyId', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Application.countDocuments(filter);

      res.json({
        status: 'success',
        data: { applications },
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

  async cancelApplication(req, res, next) {
    try {
      const application = await Application.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
        status: 'PENDING'
      });

      if (!application) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '지원내역을 찾을 수 없거나 취소가 불가능한 상태입니다.'
        });
      }

      res.json({
        status: 'success',
        message: '지원이 취소되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  async getApplicationsByJob(req, res, next) {
    try {
      // 채용담당자만 접근 가능
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const applications = await Application.find({ jobId: req.params.jobId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Application.countDocuments({ jobId: req.params.jobId });

      res.json({
        status: 'success',
        data: { applications },
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

  async updateApplicationStatus(req, res, next) {
    try {
      const { status } = req.body;
      
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!application) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '지원내역을 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = applicationController;