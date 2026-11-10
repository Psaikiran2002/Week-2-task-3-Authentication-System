// Input validation and sanitization for the auth endpoints.
const validator = require('validator');

// Only allow letters, numbers and underscore, 3-20 chars (blocks HTML/script characters).
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Cleans and validates registration input.
 * Returns { errors: [...], clean: { email, username, password } }
 */
function validateRegistration(body) {
  const errors = [];
  const { email, username, password } = body || {};

  // Reject anything that is not a plain string. This also blocks NoSQL injection
  // such as { "email": { "$ne": null } }.
  if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    return { errors: ['Email, username and password are required.'], clean: null };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (!validator.isEmail(cleanEmail)) {
    errors.push('Please enter a valid email address.');
  }
  if (!USERNAME_REGEX.test(cleanUsername)) {
    errors.push('Username must be 3-20 characters: letters, numbers and underscore only.');
  }
  // bcrypt only uses the first 72 bytes, so we cap the length at 72.
  if (password.length < 8 || password.length > 72) {
    errors.push('Password must be between 8 and 72 characters.');
  } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must contain an uppercase letter, a lowercase letter and a number.');
  }

  return { errors, clean: { email: cleanEmail, username: cleanUsername, password } };
}

/** Cleans and validates login input. */
function validateLogin(body) {
  const { email, password } = body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return { errors: ['Email and password are required.'], clean: null };
  }
  return { errors: [], clean: { email: email.trim().toLowerCase(), password } };
}

module.exports = { validateRegistration, validateLogin };
