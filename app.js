// ./app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const connectDB = require('./db/db');
const userRouter = require('./routes/userRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const app = express();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
  });
});

const PORT = process.env.PORT || 3000;

async function startApp() {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

startApp();
