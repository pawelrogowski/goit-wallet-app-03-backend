const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

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
    const tokenToBlacklist = req.token;

    await BlacklistedToken.create({ token: tokenToBlacklist });

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

const refreshTokens = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const isBlacklisted = await BlacklistedToken.exists({ token: refreshToken });

  if (isBlacklisted) {
    return res.status(401).json({ error: 'Blacklisted refresh token' });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

  user.refreshToken = newRefreshToken;

  await user.save();

  res.json({
    accessToken,
    refreshToken: newRefreshToken,
  });
};

module.exports = {
  register,
  login,
  getUserProfile,
  logout,
  refreshTokens,
};
