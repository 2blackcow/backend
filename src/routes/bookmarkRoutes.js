const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { auth } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: 채용공고 북마크 관련 API
 */

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: 북마크 목록 조회
 *     tags: [Bookmarks]
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
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 지역 필터
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [ENTRY, INTERMEDIATE, SENIOR, EXECUTIVE]
 *         description: 경력 수준 필터
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: integer
 *         description: 최소 급여
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: integer
 *         description: 최대 급여
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: 기술스택 (쉼표로 구분)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, salary, experience]
 *           default: createdAt
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
 *         description: 북마크 목록 조회 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/',
  auth,
  bookmarkController.getMyBookmarks
);

/**
 * @swagger
 * /api/bookmarks/search:
 *   get:
 *     summary: 북마크된 채용공고 검색
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 검색 키워드
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: 회사명
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: 포지션
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 검색 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/search',
  auth,
  bookmarkController.searchBookmarks
);

/**
 * @swagger
 * /api/bookmarks/{jobId}:
 *   post:
 *     summary: 북마크 추가/제거
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: 채용공고 ID
 *     responses:
 *       200:
 *         description: 북마크 토글 성공
 *       401:
 *         description: 인증되지 않은 사용자
 *       404:
 *         description: 채용공고를 찾을 수 없음
 */
router.post('/:jobId',
  auth,
  bookmarkController.toggleBookmark
);

/**
 * @swagger
 * /api/bookmarks/filter:
 *   get:
 *     summary: 북마크 필터링
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: locations
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 지역 목록
 *       - in: query
 *         name: experienceLevels
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 경력 수준 목록
 *       - in: query
 *         name: salaryRange
 *         schema:
 *           type: object
 *         description: 급여 범위
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 기술스택 목록
 *     responses:
 *       200:
 *         description: 필터링 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/filter',
  auth,
  bookmarkController.filterBookmarks
);

/**
 * @swagger
 * /api/bookmarks/{jobId}/status:
 *   get:
 *     summary: 채용공고 북마크 상태 확인
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: 채용공고 ID
 *     responses:
 *       200:
 *         description: 상태 확인 성공
 *       401:
 *         description: 인증되지 않은 사용자
 */
router.get('/:jobId/status',
  auth,
  bookmarkController.checkBookmarkStatus
);

module.exports = router;