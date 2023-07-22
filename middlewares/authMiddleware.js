const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken'); // Import the BlacklistedToken model
const { TokenExpiredError } = require('jsonwebtoken'); // Import the TokenExpiredError class

const auth = async (req, res, next) => {
  try {
    let token;

    // Extract the token from the "Authorization" header, if present and in the correct format
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token is missing or in an incorrect format
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    // Verify if the token is blacklisted
    const isBlacklisted = await BlacklistedToken.exists({ token });
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Authentication token has expired' });
    }

    // Verify the token using the secret key and enable expiration check
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: false });

    // Find the user associated with the decoded token's user ID
    const user = await User.findById(decoded.id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    // Initialize the tokens array if it's missing
    if (!user.tokens) {
      user.tokens = [];
    }

    // Attach the user object to the request for later use in other middleware/routes
    req.token = token;
    req.user = user;

    // Proceed to the next middleware/route
    next();
  } catch (error) {
    // Handle different types of token validation errors
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Authentication token has expired' });
    } else {
      console.log(error);
      res.status(401).json({ error: 'Invalid authentication token' });
    }
  }
};

module.exports = auth;
