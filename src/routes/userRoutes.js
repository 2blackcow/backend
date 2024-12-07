const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: 프로필 수정
 */
router.put('/profile',
  auth,
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     tags: [Users]
 *     summary: 비밀번호 변경
 */
router.put('/password',
  auth,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     tags: [Users]
 *     summary: 활동 내역 조회
 */
router.get('/activity',
  auth,
  userController.getUserActivity
);

/**
 * @swagger
 * /api/users/applications/stats:
 *   get:
 *     tags: [Users]
 *     summary: 지원 통계 조회
 */
router.get('/applications/stats',
  auth,
  userController.getApplicationStats
);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     tags: [Users]
 *     summary: 회원 탈퇴
 */
router.delete('/',
  auth,
  userController.deleteAccount
);

module.exports = router;