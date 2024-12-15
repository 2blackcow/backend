const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '구인구직 API',
      version: '1.0.0',
      description: '사람인 채용정보 크롤링 기반 구인구직 서비스 API',
    },
    servers: [
      {
	      url: process.env.API_URL || 'https://113.198.66.75:17220',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // API 경로 패턴 설정
  apis: [
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../models/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
