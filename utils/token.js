const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // import uuid

const generateAccessToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = () => {
  return uuidv4(); // generate a random unique id
};

const generateTokens = id => {
  const accessToken = generateAccessToken(id);
  const refreshToken = generateRefreshToken();

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
};
