// User model. Only the HASH of the password is ever stored, never the password itself.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,     // duplicate emails are rejected by the database too
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,    // password hash is NOT returned by queries unless asked for
    },
  },
  { timestamps: true }  // adds createdAt and updatedAt
);

module.exports = mongoose.model('User', userSchema);
