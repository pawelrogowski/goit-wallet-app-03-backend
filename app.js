require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const connectDB = require('./db/db');
const userRouter = require('./routes/userRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const selfPing = require('./utils/selfPing');
const log4js = require('log4js'); // Import Log4js
const app = express();

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: 'logs.log',
      maxLogSize: 3 * 1024 * 1024,
      backups: 3,
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
  },
});

const logger = log4js.getLogger();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Custom middleware for logging HTTP requests
app.use((req, res, next) => {
  const startTime = new Date();
  logger.info(`Request: ${req.method} ${req.url}`);
  logger.info(`Request Headers: ${JSON.stringify(req.headers)}`);
  logger.info(`Request Body: ${JSON.stringify(req.body)}`);

  res.on('finish', () => {
    const responseTime = new Date() - startTime;
    logger.info(`Response Status: ${res.statusCode}`);
    logger.info(`Response Time: ${responseTime} ms`);
    logger.info(`Response Body: ${JSON.stringify(res.locals.data)}`);
  });

  next();
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  // Check if the error is a known Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ errors });
  }

  // Handle other types of errors
  logger.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
  });
});

const PORT = process.env.PORT || 3000;
const deployedServerURL = 'https://wallet-lzvg.onrender.com';
async function startApp() {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Start self-pinging after the app has started
    const pingInterval = 6000;
    setInterval(() => selfPing(deployedServerURL), pingInterval);
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
  }
}

startApp();
