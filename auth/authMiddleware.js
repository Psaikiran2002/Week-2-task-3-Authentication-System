// Middleware that checks the JWT before letting a request reach a protected route.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

/**
 * Verifies the token from the cookie.
 * Returns the user and token data, or null if anything is wrong.
 */
async function checkToken(req) {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;

  try {
    // Throws an error if the signature is wrong or the token is expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Was this token logged out?
    const revoked = await BlacklistedToken.findOne({ jti: decoded.jti });
    if (revoked) return null;

    // Does the user still exist?
    const user = await User.findById(decoded.id);
    if (!user) return null;

    return { user, decoded };
  } catch (err) {
    return null;
  }
}

// For API routes: respond with 401 JSON if not logged in
async function protect(req, res, next) {
  const result = await checkToken(req);
  if (!result) {
    return res.status(401).json({ message: 'Not authenticated. Please log in.' });
  }
  req.user = result.user;
  req.tokenData = result.decoded;
  next();
}

// For HTML pages: redirect to the login page if not logged in
async function protectPage(req, res, next) {
  const result = await checkToken(req);
  if (!result) return res.redirect('/login.html');
  req.user = result.user;
  req.tokenData = result.decoded;
  next();
}

module.exports = { protect, protectPage };
