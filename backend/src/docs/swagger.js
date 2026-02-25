import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransitEquity API',
      version: '1.0.0',
      description: 'Transportation Service Gap Analyzer API',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;