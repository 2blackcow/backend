const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { auth, checkRole } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Resumes
 *   description: 이력서 관리 API
 */

/**
 * @swagger
 * /api/resumes:
 *   get:
 *     summary: 내 이력서 목록 조회
 *     tags: [Resumes]
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [updatedAt, createdAt]
 *           default: updatedAt
 *         description: 정렬 기준
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 순서
 *     responses:
 *       200:
 *         description: 이력서 목록 조회 성공
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
 *                     resumes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Resume'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/',
  auth,
  resumeController.getMyResumes
);

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     summary: 새 이력서 작성
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - profile
 *             properties:
 *               title:
 *                 type: string
 *                 description: 이력서 제목
 *               profile:
 *                 type: object
 *                 properties:
 *                   summary:
 *                     type: string
 *                     description: 자기소개
 *                   contact:
 *                     $ref: '#/components/schemas/Contact'
 *               education:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Education'
 *               experience:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Experience'
 *               skills:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Skill'
 *     responses:
 *       201:
 *         description: 이력서 생성 성공
 *       400:
 *         description: 잘못된 입력
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.post('/',
  auth,
  resumeController.createResume
);

/**
 * @swagger
 * /api/resumes/{id}:
 *   get:
 *     summary: 이력서 상세 조회
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 이력서 ID
 *     responses:
 *       200:
 *         description: 이력서 조회 성공
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
 *                     resume:
 *                       $ref: '#/components/schemas/Resume'
 *       404:
 *         description: 이력서를 찾을 수 없음
 */
router.get('/:id',
  auth,
  resumeController.getResumeById
);

/**
 * @swagger
 * /api/resumes/{id}:
 *   put:
 *     summary: 이력서 수정
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 이력서 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResumeUpdate'
 *     responses:
 *       200:
 *         description: 이력서 수정 성공
 *       400:
 *         description: 잘못된 입력
 *       404:
 *         description: 이력서를 찾을 수 없음
 */
router.put('/:id',
  auth,
  resumeController.updateResume
);

/**
 * @swagger
 * /api/resumes/{id}:
 *   delete:
 *     summary: 이력서 삭제
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 이력서 ID
 *     responses:
 *       200:
 *         description: 이력서 삭제 성공
 *       404:
 *         description: 이력서를 찾을 수 없음
 */
router.delete('/:id',
  auth,
  resumeController.deleteResume
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       required:
 *         - title
 *         - profile
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         isActive:
 *           type: boolean
 *         profile:
 *           type: object
 *           properties:
 *             summary:
 *               type: string
 *             contact:
 *               $ref: '#/components/schemas/Contact'
 *         education:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Education'
 *         experience:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Experience'
 *         skills:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Skill'
 *         metadata:
 *           type: object
 *           properties:
 *             lastModified:
 *               type: string
 *               format: date-time
 *             version:
 *               type: number
 *             viewCount:
 *               type: number
 *
 *     Contact:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *
 *     Education:
 *       type: object
 *       properties:
 *         school:
 *           type: string
 *         degree:
 *           type: string
 *         field:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *
 *     Experience:
 *       type: object
 *       properties:
 *         company:
 *           type: string
 *         position:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *
 *     Skill:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: string
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
 *
 *     ResumeUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         profile:
 *           type: object
 *         education:
 *           type: array
 *         experience:
 *           type: array
 *         skills:
 *           type: array
 */

module.exports = router;