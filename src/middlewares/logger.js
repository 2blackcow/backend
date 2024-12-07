const morgan = require('morgan');
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Winston 로거 설정
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // 에러 로그
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d'
    }),
    // 전체 로그
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d'
    })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Morgan 미들웨어 설정
const morganMiddleware = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }
);

// 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user.id : null,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
};

// 응답 로깅 미들웨어
const responseLogger = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    logger.info({
      type: 'response',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      userId: req.user ? req.user.id : null,
      responseData: data
    });
    originalSend.call(this, data);
  };
  next();
};

module.exports = {
  logger,
  morganMiddleware,
  requestLogger,
  responseLogger
};