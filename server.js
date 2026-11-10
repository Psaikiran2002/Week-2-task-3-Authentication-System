// Entry point: sets up Express, security headers, routes and the database.
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./auth/authRoutes');
const { protect, protectPage } = require('./auth/authMiddleware');

// Stop immediately if the secret is missing, a weak setup would be unsafe
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Missing JWT_SECRET or MONGO_URI. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // needed behind a hosting proxy (Render, Railway) so rate limiting sees real IPs

app.use(helmet());                          // sets safe HTTP security headers
app.use(express.json({ limit: '10kb' }));   // read JSON bodies, reject huge ones
app.use(cookieParser());                    // read cookies (to get the token)

// Public files: login.html, register.html, css, js
app.use(express.static(path.join(__dirname, 'public')));

// Auth endpoints
app.use('/api/auth', authRoutes);

// Protected API example
app.get('/api/dashboard', protect, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}!`,
    user: { username: req.user.username, email: req.user.email, memberSince: req.user.createdAt },
  });
});

// Protected page: only reachable when logged in, otherwise redirected to login
app.get('/dashboard', protectPage, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/', (req, res) => res.redirect('/login.html'));

// Unknown API URL
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

// Catch-all error handler (never leak internal details to the client)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error.' });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
