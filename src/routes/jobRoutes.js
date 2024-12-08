const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth, checkRole } = require('../middlewares/auth');
const { validateJob } = require('../middlewares/validator');
const { apiLimiters } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: 채용공고 관련 API
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: 채용공고 목록 조회
 *     tags: [Jobs]
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
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, salary, views, deadline]
 *           default: latest
 *         description: 정렬 기준
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 순서
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 지역 필터
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [ENTRY, INTERMEDIATE, SENIOR, EXECUTIVE]
 *         description: 경력 수준
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: integer
 *         description: 최소 급여
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: integer
 *         description: 최대 급여
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: 기술스택 (쉼표로 구분)
 *     responses:
 *       200:
 *         description: 채용공고 목록 조회 성공
 */
router.get('/', jobController.getAllJobs);

/**
 * @swagger
 * /api/jobs/search:
 *   get:
 *     summary: 채용공고 검색
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 검색 키워드
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: 회사명
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: 포지션
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 검색 성공
 */
router.get('/search', 
  apiLimiters.search, 
  jobController.searchJobs
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: 채용공고 상세 조회
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 채용공고 ID
 *     responses:
 *       200:
 *         description: 상세 정보 조회 성공
 *       404:
 *         description: 채용공고를 찾을 수 없음
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /api/jobs/{id}/related:
 *   get:
 *     summary: 관련 채용공고 추천
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 채용공고 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: 추천 공고 수
 *     responses:
 *       200:
 *         description: 추천 공고 조회 성공
 */
router.get('/:id/related', jobController.getRelatedJobs);

/**
 * @swagger
 * /api/jobs/filter:
 *   get:
 *     summary: 채용공고 필터링
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: locations
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 지역 목록
 *       - in: query
 *         name: experienceLevels
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 경력 수준 목록
 *       - in: query
 *         name: salaryRange
 *         schema:
 *           type: object
 *           properties:
 *             min:
 *               type: integer
 *             max:
 *               type: integer
 *         description: 급여 범위
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 기술스택 목록
 *     responses:
 *       200:
 *         description: 필터링 성공
 */
router.get('/filter', jobController.filterJobs);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: 채용공고 등록
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - requirements
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: 채용공고 등록 성공
 *       401:
 *         description: 권한 없음
 */
router.post('/',
  auth,
  checkRole('RECRUITER', 'ADMIN'),
  validateJob,
  jobController.createJob
);

/**
 * @swagger
 * /api/jobs/{id}/views:
 *   post:
 *     summary: 채용공고 조회수 증가
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회수 증가 성공
 */
router.post('/:id/views', jobController.increaseViews);

module.exports = router;