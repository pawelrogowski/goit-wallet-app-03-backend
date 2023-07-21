// ./routes/TransactionRoutes.js
const express = require('express');
const router = express.Router();

const {
  createTransaction,
  deleteTransaction,
  filterTransactions,
} = require('../controllers/transactionController');

const auth = require('../middlewares/authMiddleware');

// Existing routes

router.post('/', auth, createTransaction);

router.get('/:month/:year', auth, filterTransactions);

// New routes

router.delete('/:id', auth, deleteTransaction);

module.exports = router;
