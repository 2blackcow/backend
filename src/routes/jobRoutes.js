const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth, checkRole } = require('../middlewares/auth');
const { validateJob } = require('../middlewares/validator');
const { apiLimiters } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: 채용공고 목록 조회
 */
router.get('/', jobController.getAllJobs);

/**
 * @swagger
 * /api/jobs/search:
 *   get:
 *     tags: [Jobs]
 *     summary: 채용공고 검색
 */
router.get('/search', apiLimiters.search, jobController.searchJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: 채용공고 상세 조회
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: 채용공고 등록
 */
router.post('/', 
  auth, 
  checkRole('RECRUITER', 'ADMIN'),
  validateJob,
  jobController.createJob
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     tags: [Jobs]
 *     summary: 채용공고 수정
 */
router.put('/:id',
  auth,
  checkRole('RECRUITER', 'ADMIN'),
  validateJob,
  jobController.updateJob
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: 채용공고 삭제
 */
router.delete('/:id',
  auth,
  checkRole('RECRUITER', 'ADMIN'),
  jobController.deleteJob
);

module.exports = router;