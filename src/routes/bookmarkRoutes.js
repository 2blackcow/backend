const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { auth } = require('../middlewares/auth');

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     tags: [Bookmarks]
 *     summary: 북마크 목록 조회
 */
router.get('/',
  auth,
  bookmarkController.getMyBookmarks
);

/**
 * @swagger
 * /api/bookmarks/jobs/{jobId}:
 *   post:
 *     tags: [Bookmarks]
 *     summary: 북마크 토글
 */
router.post('/jobs/:jobId',
  auth,
  bookmarkController.toggleBookmark
);

/**
 * @swagger
 * /api/bookmarks/jobs/{jobId}/status:
 *   get:
 *     tags: [Bookmarks]
 *     summary: 북마크 상태 확인
 */
router.get('/jobs/:jobId/status',
  auth,
  bookmarkController.checkBookmarkStatus
);

module.exports = router;