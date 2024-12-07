const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { auth, checkRole } = require('../middlewares/auth');

/**
 * @swagger
 * /api/resumes:
 *   get:
 *     tags: [Resumes]
 *     summary: 내 이력서 목록 조회
 */
router.get('/',
  auth,
  resumeController.getMyResumes
);

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     tags: [Resumes]
 *     summary: 이력서 생성
 */
router.post('/',
  auth,
  resumeController.createResume
);

/**
 * @swagger
 * /api/resumes/{id}:
 *   get:
 *     tags: [Resumes]
 *     summary: 이력서 상세 조회
 */
router.get('/:id',
  auth,
  resumeController.getResumeById
);

/**
 * @swagger
 * /api/resumes/{id}:
 *   put:
 *     tags: [Resumes]
 *     summary: 이력서 수정
 */
router.put('/:id',
  auth,
  resumeController.updateResume
);

/**
 * @swagger
 * /api/resumes/{id}:
 *   delete:
 *     tags: [Resumes]
 *     summary: 이력서 삭제
 */
router.delete('/:id',
  auth,
  resumeController.deleteResume
);

module.exports = router;