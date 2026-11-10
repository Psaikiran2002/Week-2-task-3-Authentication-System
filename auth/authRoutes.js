// URL routes for the auth module: /api/auth/...
const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout, me } = require('./authController');
const { protect } = require('./authMiddleware');

const router = express.Router();

// Allow only 10 attempts per 15 minutes per IP on register/login (slows brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
