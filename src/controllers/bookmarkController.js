const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');
const { pagination } = require('../config/constants');

const bookmarkController = {
  async toggleBookmark(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      // 채용공고 존재 확인
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '채용공고를 찾을 수 없습니다.'
        });
      }

      // 북마크 존재 확인
      const existingBookmark = await Bookmark.findOne({ jobId, userId });

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
        const bookmark = await Bookmark.create({ jobId, userId });
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