const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { auth, checkRole } = require('../middlewares/auth');
const { validateApplication } = require('../middlewares/validator');

/**
 * @swagger
 * /api/applications/jobs/{jobId}:
 *   post:
 *     tags: [Applications]
 *     summary: 채용공고 지원
 */
router.post('/jobs/:jobId',
  auth,
  checkRole('JOB_SEEKER'),
  validateApplication,
  applicationController.apply
);

/**
 * @swagger
 * /api/applications:
 *   get:
 *     tags: [Applications]
 *     summary: 내 지원 내역 조회
 */
router.get('/',
  auth,
  applicationController.getMyApplications
);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     tags: [Applications]
 *     summary: 지원 취소
 */
router.delete('/:id',
  auth,
  applicationController.cancelApplication
);

/**
 * @swagger
 * /api/applications/jobs/{jobId}:
 *   get:
 *     tags: [Applications]
 *     summary: 채용공고별 지원자 조회
 */
router.get('/jobs/:jobId',
  auth,
  checkRole('RECRUITER', 'ADMIN'),
  applicationController.getApplicationsByJob
);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     tags: [Applications]
 *     summary: 지원 상태 변경
 */
router.put('/:id/status',
  auth,
  checkRole('RECRUITER', 'ADMIN'),
  applicationController.updateApplicationStatus
);

module.exports = router;