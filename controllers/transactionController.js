const Transaction = require('../models/Transaction');

// Create a new transaction
const createTransaction = async (req, res) => {
  const { amount, category, date } = req.body;

  try {
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      category,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Get transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get aggregate stats for a user
const getStats = async (req, res) => {
  const { month, year } = req.query;

  try {
    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-31`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getStats,
};
