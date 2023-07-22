/**
 * @swagger
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *
 *     Transaction:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         date:
 *           type: string
 *           format: date
 *
 *   parameters:
 *
 *     TransactionId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *
 *   requestBodies:
 *
 *     RegisterRequest:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *
 *   responses:
 *
 *     AuthSuccess:
 *       description: Auth successful
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthResponse'
 */
