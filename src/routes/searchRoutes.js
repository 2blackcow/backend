const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { auth } = require('../middlewares/auth');
const { apiLimiters } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: 검색 관련 API
 */

/**
 * @swagger
 * /api/search/jobs:
 *   get:
 *     summary: 채용공고 검색
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 지역
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [ENTRY, INTERMEDIATE, SENIOR, EXECUTIVE]
 *         description: 경력 수준
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *         description: 고용 형태
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: integer
 *         description: 최소 연봉
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: integer
 *         description: 최대 연봉
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: 기술스택 (쉼표로 구분)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       429:
 *         description: 검색 횟수 제한 초과
 */
router.get('/jobs',
  apiLimiters.search,
  searchController.searchJobs
);

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: 검색 기록 조회
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 검색 기록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     searchHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchHistory'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/history',
  auth,
  searchController.getSearchHistory
);

/**
 * @swagger
 * /api/search/popular:
 *   get:
 *     summary: 인기 검색어 조회
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: 인기 검색어 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     popularSearches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: 검색어
 *                           count:
 *                             type: integer
 *                             description: 검색 횟수
 *                           lastSearched:
 *                             type: string
 *                             format: date-time
 *                             description: 마지막 검색 시간
 */
router.get('/popular',
  searchController.getPopularSearches
);

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         query:
 *           type: string
 *         filters:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *             experienceLevel:
 *               type: string
 *             employmentType:
 *               type: string
 *             salary:
 *               type: object
 *               properties:
 *                 min:
 *                   type: integer
 *                 max:
 *                   type: integer
 *             skills:
 *               type: array
 *               items:
 *                 type: string
 *         results:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             jobIds:
 *               type: array
 *               items:
 *                 type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         totalItems:
 *           type: integer
 */

module.exports = router;