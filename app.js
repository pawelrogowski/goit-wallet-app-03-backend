require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const connectDB = require('./db/db');
const userRouter = require('./routes/userRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const log4js = require('log4js');
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

// middleware for logging
app.use((req, res, next) => {
  const startTime = new Date();
  const separator = '----------------------------------------\n';
  logger.info(separator);
  logger.info(`Request: ${req.method} ${req.url}`);
  logger.info(`Request Body: ${JSON.stringify(req.body)}`);

  res.on('finish', () => {
    const responseTime = new Date() - startTime;
    logger.info(`Response Status: ${res.statusCode}`);
    logger.info(`Response Time: ${responseTime} ms`);
  });

  next();
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);
app.get('/api/heartbeat', (req, res) => {
  res.json({ status: 'ok' });
});
// Error handling middleware
app.use((err, req, res, next) => {
  // Check if the error is a known Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ errors });
  }

  // Handle other types of errors (including unhandled rejections)
  if (err) {
    logger.error(err.stack);
  }
  // Check if headers have already been sent, and if so, just close the response
  if (res.headersSent) {
    return res.end();
  }

  // Respond with a generic error message for any other type of error
  return res.status(500).json({
    error: 'Something went wrong',
  });
});

const PORT = process.env.PORT || 3000;

async function startApp() {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
  }
}

startApp();
