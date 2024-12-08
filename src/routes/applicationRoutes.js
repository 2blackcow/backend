const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { auth, checkRole } = require('../middlewares/auth');
const { validateApplication } = require('../middlewares/validator');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: 채용공고 지원 관련 API
 */

/**
 * @swagger
 * /api/applications/{jobId}:
 *   post:
 *     summary: 채용공고 지원하기
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: 지원할 채용공고 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coverLetter
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 example: "안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요"
 *                 description: 자기소개서
 *               resumeId:
 *                 type: string
 *                 description: 첨부할 이력서 ID (선택)
 *     responses:
 *       201:
 *         description: 지원 성공
 *       400:
 *         description: 중복 지원 또는 유효하지 않은 입력
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.post('/:jobId',
  auth,
  validateApplication,
  applicationController.apply
);

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: 지원 내역 조회
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, REVIEWING, ACCEPTED, REJECTED]
 *         description: 지원 상태별 필터링
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
 *         description: 지원 내역 목록
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/',
  auth,
  applicationController.getMyApplications
);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: 지원 취소하기
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 취소할 지원 내역 ID
 *     responses:
 *       200:
 *         description: 지원 취소 성공
 *       400:
 *         description: 취소할 수 없는 상태
 *       401:
 *         description: 인증되지 않은 사용자
 *       404:
 *         description: 지원 내역을 찾을 수 없음
 */
router.delete('/:id',
  auth,
  applicationController.cancelApplication
);

/**
 * @swagger
 * /api/applications/status:
 *   patch:
 *     summary: 지원 상태 변경 (채용담당자용)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - status
 *             properties:
 *               applicationId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [REVIEWING, ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 *       401:
 *         description: 권한 없음
 *       404:
 *         description: 지원 내역을 찾을 수 없음
 */
router.patch('/status',
  auth,
  checkRole('RECRUITER', 'ADMIN'),
  applicationController.updateApplicationStatus
);

module.exports = router;