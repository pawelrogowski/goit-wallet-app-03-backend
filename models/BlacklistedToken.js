const mongoose = require('mongoose');

const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.JWT_EXPIRES_IN, // same as JWT expiration, makes the token delete itself from database after it would expire anywyay
  },
});

module.exports = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
