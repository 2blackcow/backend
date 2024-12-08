const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 프로필 정보 수정
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phone:
 *                 type: string
 *                 description: 전화번호
 *               address:
 *                 type: string
 *                 description: 주소
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: 생년월일
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 보유 기술
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증되지 않은 사용자
 *       400:
 *         description: 잘못된 입력값
 */
router.put('/profile',
  auth,
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: 비밀번호 변경
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: 현재 비밀번호
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 현재 비밀번호가 일치하지 않음
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.put('/password',
  auth,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     summary: 사용자 활동 내역 조회
 *     tags: [Users]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [VIEW_JOB, APPLY_JOB, SAVE_JOB, UPDATE_PROFILE]
 *         description: 활동 유형 필터
 *     responses:
 *       200:
 *         description: 활동 내역 조회 성공
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
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserActivity'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/activity',
  auth,
  userController.getUserActivity
);

/**
 * @swagger
 * /api/users/applications/stats:
 *   get:
 *     summary: 지원 통계 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 지원 통계 조회 성공
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         reviewed:
 *                           type: integer
 *                         accepted:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 */
router.get('/applications/stats',
  auth,
  userController.getApplicationStats
);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.delete('/',
  auth,
  userController.deleteAccount
);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [JOB_SEEKER, RECRUITER, ADMIN]
 *         profile:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             birthDate:
 *               type: string
 *               format: date
 *             skills:
 *               type: array
 *               items:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UserActivity:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [VIEW_JOB, APPLY_JOB, SAVE_JOB, UPDATE_PROFILE]
 *         targetId:
 *           type: string
 *         metadata:
 *           type: object
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