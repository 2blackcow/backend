const Company = require('../models/Company');
const Job = require('../models/Job');
const { pagination } = require('../config/constants');

const companyController = {
  async createCompany(req, res, next) {
    try {
      const company = await Company.create(req.body);
      
      res.status(201).json({
        status: 'success',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompanyDetails(req, res, next) {
    try {
      const company = await Company.findById(req.params.id);
      
      if (!company) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '회사를 찾을 수 없습니다.'
        });
      }

      // 회사의 채용공고 목록도 함께 조회
      const jobs = await Job.find({ 
        companyId: company._id,
        status: 'ACTIVE'
      }).select('title deadline');

      res.json({
        status: 'success',
        data: { 
          company,
          activeJobs: jobs
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCompany(req, res, next) {
    try {
      const company = await Company.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!company) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '회사를 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllCompanies(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;
  
      const companies = await Company.find()
        .skip(skip)
        .limit(limit);
  
      // 각 회사의 채용공고 정보도 함께 가져오기
      const companiesWithJobs = await Promise.all(companies.map(async company => {
        const companyObj = company.toObject();
        const job = await Job.findOne({ companyId: company._id });
        return {
          ...companyObj,
          id: companyObj._id,
          mongoId: companyObj._id,
          jobId: job ? job._id : null  // 채용공고 ID 추가
        };
      }));
  
      const total = await Company.countDocuments();
  
      res.json({
        status: 'success',
        data: { companies: companiesWithJobs },
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

  async getCompanyStats(req, res, next) {
    try {
      const companyId = req.params.id;

      // 통계 데이터 수집
      const stats = {
        totalJobs: await Job.countDocuments({ companyId }),
        activeJobs: await Job.countDocuments({ companyId, status: 'ACTIVE' }),
        recentJobs: await Job.countDocuments({
          companyId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      };

      res.json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = companyController;