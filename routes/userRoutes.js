// ./routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { register, login, getUserProfile, logout } = require('../controllers/userController');
const { validateRegister, validateLogin, validate } = require('../utils/validators');
const auth = require('../middlewares/authMiddleware');

// Register a new user
router.post('/register', validateRegister, validate, register);

// Login an existing user
router.post('/login', validateLogin, validate, login);

// Get profile of logged-in user
router.get('/profile', auth, getUserProfile);

// Logout user
router.get('/logout', auth, logout);

module.exports = router;
