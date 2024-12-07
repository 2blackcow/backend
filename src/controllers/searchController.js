const Job = require('../models/Job');
const SearchHistory = require('../models/SearchHistory');
const { pagination } = require('../config/constants');

const searchController = {
  async searchJobs(req, res, next) {
    try {
      const {
        query,
        location,
        experienceLevel,
        employmentType,
        minSalary,
        maxSalary,
        skills,
        page = pagination.DEFAULT_PAGE,
        limit = pagination.DEFAULT_LIMIT
      } = req.query;

      const skip = (page - 1) * limit;

      // 검색 조건 구성
      const searchQuery = {
        status: 'ACTIVE'
      };

      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }

      if (location) searchQuery['location.city'] = { $regex: location, $options: 'i' };
      if (experienceLevel) searchQuery.experienceLevel = experienceLevel;
      if (employmentType) searchQuery.jobType = employmentType;
      if (skills) searchQuery.skills = { $in: skills.split(',') };

      if (minSalary || maxSalary) {
        searchQuery.salary = {};
        if (minSalary) searchQuery.salary.$gte = parseInt(minSalary);
        if (maxSalary) searchQuery.salary.$lte = parseInt(maxSalary);
      }

      // 검색 실행
      const jobs = await Job.find(searchQuery)
        .populate('companyId', 'companyName location industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(searchQuery);

      // 검색 기록 저장
      if (req.user) {
        await SearchHistory.create({
          userId: req.user.id,
          query,
          filters: {
            location,
            experienceLevel,
            employmentType,
            salary: { min: minSalary, max: maxSalary },
            skills: skills ? skills.split(',') : []
          },
          resultCount: total
        });
      }

      res.json({
        status: 'success',
        data: { jobs },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getSearchHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const searchHistory = await SearchHistory.find({ userId: req.user.id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SearchHistory.countDocuments({ userId: req.user.id });

      res.json({
        status: 'success',
        data: { searchHistory },
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

  async getPopularSearches(req, res, next) {
    try {
      const popularSearches = await SearchHistory.aggregate([
        {
          $group: {
            _id: '$query',
            count: { $sum: 1 },
            lastSearched: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        status: 'success',
        data: { popularSearches }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = searchController;