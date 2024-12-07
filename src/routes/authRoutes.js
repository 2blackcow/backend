const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { validateRegister } = require('../middlewares/validator');
const { apiLimiters } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인
 */
router.post('/login', apiLimiters.auth, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: 토큰 갱신
 */
router.post('/refresh', auth, authController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: 프로필 조회
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: 프로필 수정
 */
router.put('/profile', auth, authController.updateProfile);

module.exports = router;