// Logic for register, login, logout and "who am I".
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const { validateRegistration, validateLogin } = require('./validators');

const SALT_ROUNDS = 12; // higher = slower for attackers (and a bit slower for us)

// A fake hash used when the email does not exist. We still run bcrypt.compare
// so the response takes about the same time (prevents guessing which emails exist).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', SALT_ROUNDS);

// Settings for the cookie that carries the JWT.
function cookieOptions() {
  return {
    httpOnly: true,                                   // JavaScript cannot read it (protects from XSS theft)
    secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
    sameSite: 'strict',                               // not sent on cross-site requests (protects from CSRF)
    maxAge: 60 * 60 * 1000,                           // 1 hour, same as the token
  };
}

// POST /api/auth/register
async function register(req, res) {
  const { errors, clean } = validateRegistration(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    // Friendly duplicate check
    const existing = await User.findOne({
      $or: [{ email: clean.email }, { username: clean.username }],
    });
    if (existing) {
      const field = existing.email === clean.email ? 'Email' : 'Username';
      return res.status(409).json({ message: `${field} is already registered.` });
    }

    // Hash the password, then store only the hash
    const hash = await bcrypt.hash(clean.password, SALT_ROUNDS);
    await User.create({ email: clean.email, username: clean.username, password: hash });

    return res.status(201).json({ message: 'Registration successful. Please log in.' });
  } catch (err) {
    // 11000 = duplicate key error (two people registering at the same moment)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or username is already registered.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { errors, clean } = validateLogin(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0] });
  }

  try {
    // .select('+password') because the password hash is hidden by default
    const user = await User.findOne({ email: clean.email }).select('+password');

    // Compare against the real hash, or the dummy one if the user does not exist
    const isMatch = await bcrypt.compare(clean.password, user ? user.password : DUMMY_HASH);

    // Same message for "no such user" and "wrong password" so attackers learn nothing
    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create the JWT. "jwtid" gives every token a unique id (needed for logout).
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      jwtid: crypto.randomUUID(),
    });

    // Send the token in an HttpOnly cookie
    res.cookie('token', token, cookieOptions());
    return res.json({ message: 'Login successful.', user: { username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/logout  (route is protected, so req.tokenData exists)
async function logout(req, res) {
  try {
    // Blacklist the token so it stops working immediately, not only when it expires
    await BlacklistedToken.create({
      jti: req.tokenData.jti,
      expiresAt: new Date(req.tokenData.exp * 1000), // exp is in seconds
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
  // Remove the cookie from the browser (options must match how it was set)
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  return res.json({ message: 'Logged out successfully.' });
}

// GET /api/auth/me
function me(req, res) {
  return res.json({ user: { username: req.user.username, email: req.user.email } });
}

module.exports = { register, login, logout, me };
