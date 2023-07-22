const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet Budgeting App API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
try {
  fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec));
} catch (err) {
  console.error(err);
}
module.exports = swaggerSpec;
