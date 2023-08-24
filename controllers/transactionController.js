const Transaction = require('../models/Transaction');
const { convertToDDMMYYYY } = require('../utils/dateUtils');
const mongoose = require('mongoose');
const categories = require('../utils/transactionCategories');
const validCategories = require('../utils/validCategories');

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

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

  if (!validCategories.includes(finalCategory)) {
    return res
      .status(400)
      .json({ error: 'Invalid category provided. Please choose a valid category.' });
  }

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

const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  // Validate if the ID is in the correct format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid transaction ID format' });
  }

  try {
    const transaction = await Transaction.findById(id);

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or already deleted' });
    }

    // Verify user owns transaction
    if (transaction.user && transaction.user.toString() !== req.user._id.toString()) {
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

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    let transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Ensure user owns the transaction
    if (!transaction.user.equals(req.user._id)) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Format the date to "DD-MM-YYYY" using convertToDDMMYYYY
    if (req.body.date) {
      req.body.date = convertToDDMMYYYY(req.body.date);
      if (req.body.date === 'Invalid date') {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    if (req.body.category && !validCategories.includes(req.body.category)) {
      return res
        .status(400)
        .json({ error: 'Invalid category provided. Please choose a valid category.' });
    }

    // Update fields
    transaction = await Transaction.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server Error' });
  }
};

const getCategoryTotals = async (req, res) => {
  // Allowed categories

  try {
    // Calculate total income
    const totalIncomeResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: 'Income',
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
        },
      },
    ]);

    const totalIncome = totalIncomeResult.length ? totalIncomeResult[0].totalIncome : 0;

    const totalExpensesResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: { $ne: 'Income' },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalExpenses: 1,
        },
      },
    ]);

    const totalExpenses = totalExpensesResult.length ? totalExpensesResult[0].totalExpenses : 0;

    const difference = totalIncome - totalExpenses;

    const results = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
        },
      },
    ]);

    // Add console log to check all categories found in the transactions
    const foundCategories = results.map(result => result.category);

    // fix response array
    const totals = categories.map(category => {
      const categoryTotal = results.find(c => c.category === category.name)?.total;

      return {
        category: category.name,
        sum: Math.abs(categoryTotal || 0), // Make total positive or 0
        color: category.color,
      };
    });

    // Add the total income, total expenses, and difference at the start of the response
    const response = {
      totalIncome: Math.abs(totalIncome), // Make total income positive
      totalExpenses: Math.abs(totalExpenses), // Make total expenses positive
      difference,
      totals,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFilteredCategoryTotals = async (req, res) => {
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
    // Calculate total income
    const totalIncomeResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: 'Income',
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
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
        },
      },
    ]);

    const totalIncome = totalIncomeResult.length ? totalIncomeResult[0].totalIncome : 0;

    // Calculate total expenses
    const totalExpensesResult = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          category: { $ne: 'Income' }, // Match all categories except 'Income'
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
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalExpenses: 1,
        },
      },
    ]);

    const totalExpenses = totalExpensesResult.length ? totalExpensesResult[0].totalExpenses : 0;

    // Calculate the difference between income and expenses
    const difference = totalIncome - totalExpenses;

    const results = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
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
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
        },
      },
    ]);

    // fix response array
    const totals = categories.map(category => {
      const categoryTotal = results.find(c => c.category === category.name)?.total;

      return {
        category: category.name,
        sum: Math.abs(categoryTotal || 0), // Make total positive or 0
        color: category.color,
      };
    });

    // Add the total income, total expenses, and difference at the start of the response
    const response = {
      totalIncome: Math.abs(totalIncome), // Make total income positive
      totalExpenses: Math.abs(totalExpenses), // Make total expenses positive
      difference,
      totals,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  filterTransactions,
  updateTransaction,
  getCategoryTotals,
  getFilteredCategoryTotals,
};
