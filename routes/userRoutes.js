const express = require('express');
const router = express.Router();
const { register, login, getUserProfile, logout } = require('../controllers/userController');
const { validateRegister, validateLogin, validate } = require('../utils/validators');
const auth = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     description: Endpoint to register a new user. Requires user details in the request body.
 *     requestBody:
 *       description: User details to register. The request body must contain the user's name, email, and password.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registration successful. Returns an authentication token and user information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

router.post('/register', validateRegister, validate, register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Users]
 *     description: Endpoint to log in an existing user. Requires user login details in the request body.
 *     requestBody:
 *       description: User login details. The request body must contain the user's email and password.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User login successful. Returns an authentication token and user information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccess'
 *       400:
 *         $ref: '#/components/responses/AuthFailed'
 */

router.post('/login', validateLogin, validate, login);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get profile of authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Endpoint to retrieve the profile of the authenticated user. Requires a valid JWT token in the request header.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully. Returns the user's name and email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

router.get('/profile', auth, getUserProfile);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout an authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Endpoint to log out an authenticated user. Requires a valid JWT token in the request header.
 *     responses:
 *       200:
 *         description: User logout successful. The JWT token will be invalidated, and the user will be logged out.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/LogoutSuccess'
 */

router.get('/logout', auth, logout);

module.exports = router;
