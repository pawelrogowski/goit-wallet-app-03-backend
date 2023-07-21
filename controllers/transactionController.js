// ./controllers/transactionController.js
const Transaction = require('../models/Transaction');
const { convertToDDMMYYYY } = require('../utils/dateUtils');
const mongoose = require('mongoose');

// Create new transaction
const createTransaction = async (req, res) => {
  const { amount, category, date, isIncome, comment } = req.body;

  // Check for missing required fields
  if (!date || isIncome === undefined)
    return res.status(400).json({ error: 'Please provide all required fields' });

  // Remove "category" if "isIncome" is true
  if (isIncome) delete req.body.category;

  // Check if the amount is positive
  if (amount <= 0) return res.status(400).json({ error: 'The amount must be positive' });

  // Convert the date to "DD-MM-YYYY" format
  const formattedDate = convertToDDMMYYYY(date);
  if (formattedDate === 'Invalid date')
    return res.status(400).json({ error: 'Invalid date format' });

  // Set the category to "Income" if isIncome is true
  const finalCategory = isIncome ? 'Income' : category;

  // Create the transaction
  try {
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      category: finalCategory,
      date: formattedDate,
      isIncome,
      comment,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id);

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or already deleted' });
    }

    // Verify user owns transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      console.log('Not authorized'); // Log to see if this block is executed
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Delete the transaction
    await Transaction.deleteOne({ _id: id });

    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Filter transactions by month+year
const filterTransactions = async (req, res) => {
  const { month, year } = req.params;

  // Check if month and year are provided
  if (!month || !year) {
    return res.status(400).json({ error: 'Please provide month and year' });
  }

  // Validate req.user._id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Use Mongoose's aggregate method to filter transactions based on month and year
    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id), // Convert user ID to ObjectId
          $expr: {
            $and: [
              // Extract year from "date" field and compare with the specified year
              {
                $eq: [
                  { $year: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(year),
                ],
              },
              // Extract month from "date" field and compare with the specified month
              {
                $eq: [
                  { $month: { $dateFromString: { dateString: '$date', format: '%d-%m-%Y' } } },
                  parseInt(month),
                ],
              },
            ],
          },
        },
      },
    ]);

    // Return filtered transactions as JSON response
    res.json(transactions);
  } catch (error) {
    // Handle errors during the database query
    console.log(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  createTransaction,
  deleteTransaction,
  filterTransactions,
};
