// ./routes/TransactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTransaction,
  deleteTransaction,
  filterTransactions,
} = require('../controllers/transactionController');
const auth = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Transaction details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', auth, createTransaction);
/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get transactions for user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:month/:year', auth, filterTransactions);
/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TransactionId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DeleteSuccess'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', auth, deleteTransaction);

module.exports = router;
