const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken'); // Import the BlacklistedToken model
const { generateToken } = require('../utils/token.js');
const validator = require('validator');

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
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

    // Generate JWT token for a new user
    const token = generateToken(user._id);

    // Give a response with user and the token
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

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Users
 *     requestBody:
 *       $ref: '#/components/requestBodies/LoginRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AuthSuccess'
 *       400:
 *         $ref: '#/components/responses/AuthError'
 */
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

/**
 * Get user profile
 *
 * @returns {User} 200 - Success
 * @returns {Error} 404 - User not found
 */
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

/**
 * Logout a user
 *
 * @returns {SuccessMessage} 200 - Success
 */
const logout = async (req, res) => {
  try {
    const tokenToBlacklist = req.token; // Get the token to be blacklisted

    // Add the token to the BlacklistedToken collection
    await BlacklistedToken.create({ token: tokenToBlacklist });

    // Filter out the token from the user's tokens (optional but recommended)
    req.user.tokens = req.user.tokens.filter(token => token.token !== tokenToBlacklist);

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
