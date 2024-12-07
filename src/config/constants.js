const constants = {
    // JWT 관련 설정
    jwt: {
      SECRET: process.env.JWT_SECRET,
      EXPIRES_IN: '24h',
      REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      REFRESH_EXPIRES_IN: '7d',
    },
  
    // 페이지네이션 기본값
    pagination: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 20,
      MAX_LIMIT: 100,
    },
  
    // 사용자 역할
    userRoles: {
      JOB_SEEKER: 'JOB_SEEKER',
      RECRUITER: 'RECRUITER',
      ADMIN: 'ADMIN',
    },
  
    // 지원 상태
    applicationStatus: {
      PENDING: 'PENDING',
      REVIEWED: 'REVIEWED',
      ACCEPTED: 'ACCEPTED',
      REJECTED: 'REJECTED',
    },
  
    // 채용공고 상태
    jobStatus: {
      ACTIVE: 'ACTIVE',
      CLOSED: 'CLOSED',
    },
  
    // 경력 레벨
    experienceLevel: {
      ENTRY: 'ENTRY',
      INTERMEDIATE: 'INTERMEDIATE',
      SENIOR: 'SENIOR',
      EXECUTIVE: 'EXECUTIVE',
    },
  
    // 고용 형태
    employmentType: {
      FULL_TIME: 'FULL_TIME',
      PART_TIME: 'PART_TIME',
      CONTRACT: 'CONTRACT',
      INTERN: 'INTERN',
    },
  
    // 에러 코드
    errorCodes: {
      AUTH_FAILED: 'AUTH_FAILED',
      INVALID_TOKEN: 'INVALID_TOKEN',
      TOKEN_EXPIRED: 'TOKEN_EXPIRED',
      NOT_FOUND: 'NOT_FOUND',
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
      SERVER_ERROR: 'SERVER_ERROR',
    },
  
    // API 응답 메시지
    messages: {
      success: {
        CREATED: '생성 완료',
        UPDATED: '수정 완료',
        DELETED: '삭제 완료',
      },
      error: {
        NOT_FOUND: '리소스를 찾을 수 없습니다',
        UNAUTHORIZED: '인증이 필요합니다',
        FORBIDDEN: '권한이 없습니다',
        VALIDATION: '입력값이 올바르지 않습니다',
      },
    },
  
    // 크롤링 설정
    crawler: {
      RETRY_LIMIT: 3,
      RETRY_DELAY: 2000,
      PAGE_DELAY: 1000,
      DEFAULT_PAGES: 5,
    },
  
    // Rate Limiting 설정
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // IP당 최대 요청 수
    },
  };
  
  module.exports = constants;