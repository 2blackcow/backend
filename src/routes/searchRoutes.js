const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { auth } = require('../middlewares/auth');
const { apiLimiters } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /api/search/jobs:
 *   get:
 *     tags: [Search]
 *     summary: 채용공고 검색
 */
router.get('/jobs',
  apiLimiters.search,
  searchController.searchJobs
);

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     tags: [Search]
 *     summary: 검색 기록 조회
 */
router.get('/history',
  auth,
  searchController.getSearchHistory
);

/**
 * @swagger
 * /api/search/popular:
 *   get:
 *     tags: [Search]
 *     summary: 인기 검색어 조회
 */
router.get('/popular',
  searchController.getPopularSearches
);

module.exports = router;