const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
require('dotenv').config();

// 내부 모듈
const connectDB = require('./config/database');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const { auth } = require('./middlewares/auth');
const { morganMiddleware, requestLogger, responseLogger } = require('./middlewares/logger');
const { defaultLimiter } = require('./middlewares/rateLimiter');
const crawlerScheduler = require('./utils/crawler/crawlerScheduler');

// 라우터
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const companyRoutes = require('./routes/companyRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 데이터베이스 연결
connectDB();

// 기본 미들웨어
app.use(helmet());  // 보안 헤더 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(compression());  // 응답 압축
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 로깅 미들웨어
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(morganMiddleware);
app.use(requestLogger);
app.use(responseLogger);

// Rate Limiting
app.use(defaultLimiter);

// API 라우트
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/jobs`, jobRoutes);
app.use(`${apiPrefix}/applications`, auth, applicationRoutes);
app.use(`${apiPrefix}/bookmarks`, auth, bookmarkRoutes);
app.use(`${apiPrefix}/companies`, companyRoutes);
app.use(`${apiPrefix}/resumes`, auth, resumeRoutes);
app.use(`${apiPrefix}/search`, searchRoutes);
app.use(`${apiPrefix}/users`, auth, userRoutes);

// Swagger 문서
if (process.env.SWAGGER_ENABLED === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 크롤러 스케줄러 시작
if (process.env.CRAWLER_ENABLED === 'true') {
  crawlerScheduler.start();
}

// 404 처리
app.use((req, res, next) => {
  const error = new errorHandler.AppError(
    'NOT_FOUND',
    '요청하신 리소스를 찾을 수 없습니다.',
    404
  );
  next(error);
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // MongoDB 에러 처리
  if (err.name === 'ValidationError') {
    err = errorHandler.handleValidationError(err);
  } else if (err.code === 11000) {
    err = errorHandler.handleDuplicateKeyError(err);
  } else if (err.name === 'CastError') {
    err = errorHandler.handleCastError(err);
  }

  res.status(err.status || 500).json({
    status: 'error',
    code: err.code || 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' && err.status === 500
      ? '서버 오류가 발생했습니다.'
      : err.message
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// 프로세스 에러 처리
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // 심각한 에러 발생 시 서버 종료
  // process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // 심각한 에러 발생 시 서버 종료
  // process.exit(1);
});

module.exports = app;