const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Redis 클라이언트 생성
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// 기본 rate limiter
const createRateLimiter = (options = {}) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15분
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // IP당 최대 요청 수
    message: {
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

// API 엔드포인트별 rate limiter
const apiLimiters = {
  auth: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1시간
    max: 5, // IP당 최대 5회 시도
    message: {
      status: 'error',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: '로그인 시도가 너무 많습니다. 1시간 후 다시 시도해주세요.'
    }
  }),

  search: createRateLimiter({
    windowMs: 60 * 1000, // 1분
    max: 30, // IP당 최대 30회 검색
    message: {
      status: 'error',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      message: '검색 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    }
  })
};

module.exports = {
  defaultLimiter: createRateLimiter(),
  apiLimiters
};