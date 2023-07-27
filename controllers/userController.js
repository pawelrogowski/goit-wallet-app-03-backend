const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const jwt = require('jsonwebtoken');
const { TokenExpiredError } = require('jsonwebtoken');

const { generateTokens } = require('../utils/token.js');
const validator = require('validator');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email is already in use',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

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

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

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

const logout = async (req, res) => {
  try {
    // Get access token from header
    const accessToken = req.header('Authorization').split(' ')[1];

    // Get refresh token from request body
    const refreshToken = req.body.refreshToken;

    // Verify and decode access token
    const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Verify and decode refresh token
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Check token types
    if (decodedAccessToken.type !== 'access' || decodedRefreshToken.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Find user using decoded id
    const user = await User.findById(decodedAccessToken.id);

    // Ensure user exists
    if (!user) {
      throw new Error('No user found');
    }

    // Blacklist access token
    await BlacklistedToken.create({
      token: accessToken,
    });

    // Blacklist refresh token
    await BlacklistedToken.create({
      token: refreshToken,
    });

    // Filter out blacklisted tokens from user document
    user.tokens = user.tokens.filter(token => {
      return token !== accessToken && token !== refreshToken;
    });

    // Save updated user document
    await user.save();

    // Send logout success response
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    // Handle expired tokens
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Handle invalid tokens
    else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};

const refreshTokens = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  try {
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decodedRefreshToken.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(decodedRefreshToken.id);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const isBlacklisted = await BlacklistedToken.exists({ token: refreshToken });

    if (isBlacklisted) {
      throw new Error('Blacklisted refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.refreshToken = newRefreshToken;

    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  logout,
  refreshTokens,
};
