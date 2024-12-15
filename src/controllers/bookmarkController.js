const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');
const { pagination } = require('../config/constants');

const bookmarkController = {
  async toggleBookmark(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;
  
      // Job을 직접 찾거나 Company를 통해 Job을 찾음
      const job = await Job.findOne({
        $or: [
          { _id: jobId },                  // Job의 ID로 직접 검색
          { companyId: jobId },            // Company ID로 검색
          { originalPostingUrl: jobId }     // 원본 URL로 검색
        ]
      });
  
      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }
  
      // 북마크 존재 확인
      const existingBookmark = await Bookmark.findOne({
        jobId: job._id,
        userId
      });
  
      if (existingBookmark) {
        // 북마크 제거
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        res.json({
          status: 'success',
          message: '북마크가 제거되었습니다.',
          data: { bookmarked: false }
        });
      } else {
        // 북마크 추가
        const bookmark = await Bookmark.create({
          jobId: job._id,
          userId,
          status: 'INTERESTED',
          isNotificationEnabled: true
        });
        res.status(201).json({
          status: 'success',
          message: '북마크가 추가되었습니다.',
          data: { bookmarked: true, bookmark }
        });
      }
    } catch (error) {
      next(error);
    }
  },
  async searchBookmarks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;
      const { keyword, company, position } = req.query;
  
      // 검색 조건 구성
      const searchQuery = {
        userId: req.user.id
      };
  
      if (keyword) {
        searchQuery.$or = [
          { 'note': { $regex: keyword, $options: 'i' } }
        ];
      }
  
      // 북마크 검색
      const bookmarks = await Bookmark.find(searchQuery)
        .populate({
          path: 'jobId',
          match: {
            $or: [
              { title: { $regex: position || '', $options: 'i' } },
              { 'companyId.companyName': { $regex: company || '', $options: 'i' } }
            ]
          },
          populate: {
            path: 'companyId',
            select: 'companyName location'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      // null jobId 필터링 (삭제된 채용공고)
      const validBookmarks = bookmarks.filter(bookmark => bookmark.jobId);
      const total = validBookmarks.length;
  
      res.json({
        status: 'success',
        data: { bookmarks: validBookmarks },
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
  
  async filterBookmarks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;
      const { locations, experienceLevels, salaryRange, skills } = req.query;
  
      const filter = {
        userId: req.user.id
      };
  
      // 북마크 필터링
      const bookmarks = await Bookmark.find(filter)
        .populate({
          path: 'jobId',
          match: {
            $and: [
              locations ? { 'location.city': { $in: locations } } : {},
              experienceLevels ? { experienceLevel: { $in: experienceLevels } } : {},
              skills ? { skills: { $in: skills } } : {},
              salaryRange ? {
                $and: [
                  salaryRange.min ? { 'salary.min': { $gte: parseInt(salaryRange.min) } } : {},
                  salaryRange.max ? { 'salary.max': { $lte: parseInt(salaryRange.max) } } : {}
                ]
              } : {}
            ]
          },
          populate: {
            path: 'companyId',
            select: 'companyName location'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      // null jobId 필터링 (삭제된 채용공고)
      const validBookmarks = bookmarks.filter(bookmark => bookmark.jobId);
      const total = validBookmarks.length;
  
      res.json({
        status: 'success',
        data: { bookmarks: validBookmarks },
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

  async getMyBookmarks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || pagination.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || pagination.DEFAULT_LIMIT;
      const skip = (page - 1) * limit;

      const bookmarks = await Bookmark.find({ userId: req.user.id })
        .populate({
          path: 'jobId',
          select: 'title companyId status deadline',
          populate: {
            path: 'companyId',
            select: 'companyName location'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Bookmark.countDocuments({ userId: req.user.id });

      res.json({
        status: 'success',
        data: { bookmarks },
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

  async checkBookmarkStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      const bookmark = await Bookmark.findOne({ jobId, userId });

      res.json({
        status: 'success',
        data: { bookmarked: !!bookmark }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookmarkController;