const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth, checkRole } = require('../middlewares/auth');

/**
 * @swagger
 * /api/companies:
 *   get:
 *     tags: [Companies]
 *     summary: 회사 목록 조회
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     tags: [Companies]
 *     summary: 회사 상세 정보 조회
 */
router.get('/:id', companyController.getCompanyDetails);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     tags: [Companies]
 *     summary: 회사 등록
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
 *     tags: [Companies]
 *     summary: 회사 정보 수정
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
 *     tags: [Companies]
 *     summary: 회사 통계 정보 조회
 */
router.get('/:id/stats',
  auth,
  checkRole('ADMIN', 'RECRUITER'),
  companyController.getCompanyStats
);

module.exports = router;