const User = require('../models/User');
const { generateToken } = require('../utils/token.js');
const validator = require('validator');

// Register a new user
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate email format using validator
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
    });
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email is already in use, choose a different email',
      });
    }

    // If the email is not found in the database, create a new user
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Login an existing user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Log user out
const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  logout,
};
