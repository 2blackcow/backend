const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { validateRegister } = require('../middlewares/validator');
const { apiLimiters } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 회원 인증 및 관리 관련 API
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: 비밀번호 (최소 8자)
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               role:
 *                 type: string
 *                 enum: [JOB_SEEKER, RECRUITER]
 *                 default: JOB_SEEKER
 *                 description: 사용자 역할
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 입력값 오류 또는 중복된 이메일
 */
router.post('/register', 
  validateRegister,
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: 인증 실패
 */
router.post('/login',
  apiLimiters.auth,
  authController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access 토큰 갱신
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *       401:
 *         description: 유효하지 않거나 만료된 토큰
 */
router.post('/refresh',
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: 회원 정보 조회
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 정보 조회 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/profile',
  auth,
  authController.getProfile
);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: 회원 정보 수정
 *     tags: [Auth]
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회원 정보 수정 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.put('/profile',
  auth,
  authController.updateProfile
);

/**
 * @swagger
 * /api/auth/password:
 *   put:
 *     summary: 비밀번호 변경
 *     tags: [Auth]
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
 *               newPassword:
 *                 type: string
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
  authController.changePassword
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.post('/logout',
  auth,
  authController.logout
);

module.exports = router;