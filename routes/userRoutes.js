const express = require('express');
const router = express.Router();
const { register, login, getUserProfile, logout } = require('../controllers/userController');
const { validateRegister, validateLogin, validate } = require('../utils/validators');
const auth = require('../middlewares/authMiddleware');

router.post('/register', validateRegister, validate, register);

router.post('/login', validateLogin, validate, login);

router.get('/profile', auth, getUserProfile);

router.get('/logout', auth, logout);

module.exports = router;
