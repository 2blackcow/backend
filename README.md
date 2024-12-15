# 구인구직 백엔드 서버

사람인 데이터를 활용한 구인구직 백엔드 서버 프로젝트입니다. 이 서버는 채용 정보 크롤링, REST API 제공, JWT 기반 인증 시스템을 제공합니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Documentation**: Swagger
- **Authentication**: JWT
- **Logging**: Winston
- **Security**: Helmet, Rate Limiting
- **Testing**: Jest (설정됨)

## 필수 요구사항
- **Node.js v14이상**
- **MongoDB v4.4이상**
- **NPM or Yarn**
  
## 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/2blackcow/backend.git
cd backend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
- `.env.example`을 `.env`로 복사
- 필요한 환경 변수 값 설정
```

4. 실행 방법
```bash
npm start
```


## API 엔드포인트 목록/설명

### 인증 관련 API (Auth)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/refresh | Access 토큰 갱신 |
| GET | /api/auth/profile | 회원 정보 조회 |
| PUT | /api/auth/profile | 회원 정보 수정 |
| PUT | /api/auth/password | 비밀번호 변경 |
| POST | /api/auth/logout | 로그아웃 |

### 채용공고 관련 API (Jobs)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/jobs | 채용공고 목록 조회 |
| POST | /api/jobs | 채용공고 등록 |
| GET | /api/jobs/search | 채용공고 검색 |
| GET | /api/jobs/{id} | 채용공고 상세 조회 |
| GET | /api/jobs/{id}/related | 관련 채용공고 추천 |
| GET | /api/jobs/filter | 채용공고 필터링 |
| POST | /api/jobs/{id}/views | 채용공고 조회수 증가 |

### 지원 관련 API (Applications)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/applications/{jobId} | 채용공고 지원하기 |
| GET | /api/applications | 지원 내역 조회 |
| DELETE | /api/applications/{id} | 지원 취소하기 |
| PATCH | /api/applications/status | 지원 상태 변경 (채용담당자용) |

### 북마크 관련 API (Bookmarks)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/bookmarks | 북마크 목록 조회 |
| GET | /api/bookmarks/search | 북마크된 채용공고 검색 |
| POST | /api/bookmarks/{jobId} | 북마크 추가/제거 |
| GET | /api/bookmarks/filter | 북마크 필터링 |
| GET | /api/bookmarks/{jobId}/status | 채용공고 북마크 상태 확인 |

### 회사 관련 API (Companies)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/companies | 회사 목록 조회 |
| POST | /api/companies | 회사 등록 |
| GET | /api/companies/{id} | 회사 상세 정보 조회 |
| PUT | /api/companies/{id} | 회사 정보 수정 |
| GET | /api/companies/{id}/stats | 회사 통계 정보 조회 |

### 이력서 관련 API (Resumes)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/resumes | 내 이력서 목록 조회 |
| POST | /api/resumes | 새 이력서 작성 |
| GET | /api/resumes/{id} | 이력서 상세 조회 |
| PUT | /api/resumes/{id} | 이력서 수정 |
| DELETE | /api/resumes/{id} | 이력서 삭제 |

### 검색 관련 API (Search)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/search/jobs | 채용공고 검색 |
| GET | /api/search/history | 검색 기록 조회 |
| GET | /api/search/popular | 인기 검색어 조회 |

### 사용자 관리 API (Users)
| Method | Endpoint | 설명 |
|--------|----------|------|
| PUT | /api/users/profile | 프로필 정보 수정 |
| PUT | /api/users/password | 비밀번호 변경 |
| GET | /api/users/activity | 사용자 활동 내역 조회 |
| GET | /api/users/applications/stats | 지원 통계 조회 |
| DELETE | /api/users | 회원 탈퇴 |

### 인증 관련 참고사항
- 모든 인증이 필요한 API는 요청 헤더에 Bearer 토큰이 필요합니다.
- 토큰 만료 시 `/api/auth/refresh`를 통해 새로운 액세스 토큰을 발급받을 수 있습니다.

### 페이지네이션 관련 참고사항
- 목록 조회 API는 기본적으로 페이지네이션을 지원합니다.
- 기본값: page=1, limit=20
- 응답에는 현재 페이지, 전체 페이지 수, 전체 아이템 수가 포함됩니다.
### 크롤러 실행 방법

1. 크롤러 설정
- `.env` 파일에서 크롤러 관련 설정 확인
```
CRAWLER_ENABLED=true
CRAWLER_SCHEDULE="0 2 * * *"
CRAWLER_KEYWORDS=개발자,프론트엔드,백엔드
```

2. 수동 실행
```bash
node src/utils/crawler/saraminCrawler.js
```

## 환경 변수 설정

주요 환경 변수 목록:

```
# 서버 설정
PORT=3000
NODE_ENV=development
API_PREFIX=/api

# 데이터베이스
MONGODB_URI=mongodb://localhost:27017/job-search-db

# JWT 설정
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# 크롤링 설정
CRAWLER_ENABLED=true
CRAWLER_SCHEDULE="0 2 * * *"
CRAWLER_KEYWORDS=개발자,프론트엔드,백엔드
```

## 보안 기능

- JWT 기반 인증
- Rate Limiting
- Helmet 보안 헤더
- CORS 설정
- 입력값 검증
- 에러 핸들링

## API 문서

Swagger UI를 통해 API 문서 확인 가능:
- 개발 환경: http://localhost:3000/api-docs
- 배포 환경: https://113.198.66.75:17220/api-docs/#/

## 로깅

- 로그 파일 위치: `/logs`
- 로그 레벨: error, warn, info, http, debug
- 일별 로그 로테이션 설정

## 에러 처리

모든 API는 일관된 에러 응답 형식을 따름:
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "에러 메시지"
}
```

## JCloud 배포 설정

#### 1. 서버 요구사항
- Node.js v14+
- MongoDB v4.4+
- PM2
---
**특이사항**
```
openssl req -nodes -new -x509 -keyout server.key -out server.crt -days 365
```
다음의 ssl 인증서를 생성하는 명령어를 사용하여 서버에 https 설정을 적용했습니다.


#### 2. 포트포워딩
----
#### 백엔드 서버
- 포트번호 443번으로 포트포워딩

#### DB
- 포트번호 3000번으로 포트포워딩
- MongoDB Compass를 이용해 관리
- 데이터베이스 접속: [MongoDB Atlas](mongodb://blackcow:4408@113.198.66.75:13220/job-search-db)
 

---
## 프로젝트 구조
```
src/
├── config/         # 설정 파일
├── controllers/    # 컨트롤러
├── middlewares/    # 미들웨어
├── models/        # 데이터베이스 모델
├── routes/        # API 라우트
├── utils/         # 유틸리티 함수
└── app.js         # 메인 애플리케이션
```
