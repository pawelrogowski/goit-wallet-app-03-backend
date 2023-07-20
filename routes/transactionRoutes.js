const express = require('express');
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  getStats,
} = require('../controllers/transactionController');

const auth = require('../middlewares/authMiddleware');

// Create a new transaction
router.post('/', auth, createTransaction);

// Get transactions for logged in user
router.get('/', auth, getTransactions);

// Get aggregate stats for user
router.get('/stats', auth, getStats);

module.exports = router;
