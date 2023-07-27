const jwt = require('jsonwebtoken');

const User = require('../models/User');

const BlacklistedToken = require('../models/BlacklistedToken');

const { TokenExpiredError } = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get only the access token from header
    const accessToken = req.header('Authorization').split(' ')[1];

    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Get user from decoded id
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    // Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.exists({ token: accessToken });

    if (isBlacklisted) {
      return res.status(401).json({ error: 'Access token blacklisted' });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    // Expired access token
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Access token expired' });
    }

    // Invalid signature
    else {
      return res.status(401).json({ error: 'Invalid access token' });
    }
  }
};

module.exports = auth;
