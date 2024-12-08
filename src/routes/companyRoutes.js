const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth, checkRole } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: 회사 정보 관리 API
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: 회사 목록 조회
 *     tags: [Companies]
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
 *         name: industry
 *         schema:
 *           type: string
 *         description: 산업 분야 필터
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 위치 필터 (도시)
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *           enum: [1-50, 51-200, 201-1000, 1001-5000, 5000+]
 *         description: 회사 규모
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, employees, foundedYear]
 *         description: 정렬 기준
 *     responses:
 *       200:
 *         description: 회사 목록 조회 성공
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
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: 회사 상세 정보 조회
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 회사 ID
 *     responses:
 *       200:
 *         description: 회사 정보 조회 성공
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
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *                     activeJobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *       404:
 *         description: 회사를 찾을 수 없음
 */
router.get('/:id', companyController.getCompanyDetails);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: 회사 등록
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - industry
 *               - description
 *               - location
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: 회사명
 *               industry:
 *                 type: string
 *                 description: 산업 분야
 *               description:
 *                 type: string
 *                 description: 회사 소개
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *                     default: KR
 *               size:
 *                 type: string
 *                 enum: [1-50, 51-200, 201-1000, 1001-5000, 5000+]
 *               foundedYear:
 *                 type: integer
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 회사 등록 성공
 *       400:
 *         description: 잘못된 입력
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
router.post('/',
  auth,
  checkRole('ADMIN'),
  companyController.createCompany
);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: 회사 정보 수정
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: object
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 회사 정보 수정 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 회사를 찾을 수 없음
 */
router.put('/:id',
  auth,
  checkRole('ADMIN', 'RECRUITER'),
  companyController.updateCompany
);

/**
 * @swagger
 * /api/companies/{id}/stats:
 *   get:
 *     summary: 회사 통계 정보 조회
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 통계 조회 성공
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
 *                         totalJobs:
 *                           type: integer
 *                         activeJobs:
 *                           type: integer
 *                         recentJobs:
 *                           type: integer
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 회사를 찾을 수 없음
 */
router.get('/:id/stats',
  auth,
  checkRole('ADMIN', 'RECRUITER'),
  companyController.getCompanyStats
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - companyName
 *         - industry
 *         - description
 *         - location
 *       properties:
 *         _id:
 *           type: string
 *           description: 회사 고유 ID
 *         companyName:
 *           type: string
 *           description: 회사명
 *         industry:
 *           type: string
 *           description: 산업 분야
 *         description:
 *           type: string
 *           description: 회사 소개
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 *         size:
 *           type: string
 *           enum: [1-50, 51-200, 201-1000, 1001-5000, 5000+]
 *         foundedYear:
 *           type: integer
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         techStack:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;