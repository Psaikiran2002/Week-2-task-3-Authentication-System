// Stores tokens that were logged out, so they cannot be used again
// even though a JWT is otherwise valid until it expires.
const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true }, // unique id of the token
  // MongoDB deletes the document automatically once this date passes
  // (the token would be expired by then anyway), so the list stays small.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
