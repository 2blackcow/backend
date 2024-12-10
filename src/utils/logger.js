const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// 로그 디렉토리 설정
const logDir = path.join(__dirname, '../../logs');

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// 로그 레벨 색상 정의
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// 로그 포맷 정의
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// logs 디렉토리 생성
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 파일 설정
const transports = [
  // 에러 로그
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
  }),

  // 전체 로그
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  })
];

// 개발 환경에서는 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports
});

// 로그 래퍼 함수
const log = {
  error: (message, meta = {}) => {
    logger.error(message, { meta });
  },
  warn: (message, meta = {}) => {
    logger.warn(message, { meta });
  },
  info: (message, meta = {}) => {
    logger.info(message, { meta });
  },
  http: (message, meta = {}) => {
    logger.http(message, { meta });
  },
  debug: (message, meta = {}) => {
    logger.debug(message, { meta });
  }
};

module.exports = log;