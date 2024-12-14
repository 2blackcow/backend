const swaggerJsdoc = require('swagger-jsdoc');

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
        url: process.env.API_URL || 'http://localhost:3000/api-docs',
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
    './src/routes/*.js',
    './src/models/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;