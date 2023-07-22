const express = require('express');
const router = express.Router();
const {
  createTransaction,
  deleteTransaction,
  filterTransactions,
  updateTransaction,
} = require('../controllers/transactionController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createTransaction);

router.get('/:month/:year', auth, filterTransactions);

router.delete('/:id', auth, deleteTransaction);

router.patch('/:id', auth, updateTransaction);

module.exports = router;
