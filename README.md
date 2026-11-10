# Authentication System

A secure registration / login / logout system built with **Node.js, Express, MongoDB, bcrypt and JWT**.
The frontend is plain HTML, CSS and JavaScript (Fetch API).

## Features
- Register with email, username and password (validated and sanitized)
- Passwords hashed with bcrypt (12 salt rounds), never stored in plain text
- Login checks credentials against the database; the JWT is sent in an HttpOnly cookie
- Protected API route (`/api/dashboard`) and protected page (`/dashboard`)
- Logout blacklists the token so it cannot be reused
- Clear error messages (invalid credentials, duplicate email, weak password)

## Project structure
```
auth-system/
├── server.js                # starts Express, security headers, routes
├── config/db.js             # MongoDB connection
├── models/
│   ├── User.js              # user schema (stores password hash)
│   └── BlacklistedToken.js  # logged-out tokens (auto-deleted after expiry)
├── auth/                    # separate authentication module
│   ├── authRoutes.js        # /api/auth/* routes + rate limiting
│   ├── authController.js    # register, login, logout, me
│   ├── authMiddleware.js    # token verification (protect routes)
│   └── validators.js        # input validation / sanitization
├── public/                  # login.html, register.html, css, js
├── views/dashboard.html     # protected page
└── docs/API.md              # endpoint documentation
```

## Setup
1. Install **Node.js** (v18+) and **MongoDB** (local) or use a free MongoDB Atlas cluster.
2. Install packages:
   ```
   npm install
   ```
3. Create your environment file:
   ```
   cp .env.example .env
   ```
   Then set `JWT_SECRET` to a long random value and check `MONGO_URI`.
4. Start the server:
   ```
   npm start
   ```
5. Open http://localhost:3000

## Security notes
| Threat | What this project does |
|---|---|
| Stolen database | Passwords hashed with bcrypt + salt; hash column hidden from queries by default |
| Brute-force login | Rate limit of 10 attempts / 15 min; bcrypt is deliberately slow |
| Username enumeration | Same "Invalid email or password." message and similar timing for both failures |
| NoSQL injection | Inputs must be plain strings; strict format checks |
| XSS | Username limited to safe characters; frontend uses `textContent`; Helmet security headers; token in HttpOnly cookie so scripts cannot read it |
| CSRF | Cookie uses `SameSite=Strict` |
| Token reuse after logout | Token id (`jti`) stored in a blacklist until it expires |
| Token sniffing | `Secure` cookie flag turns on when `NODE_ENV=production` (use HTTPS) |
| Oversized requests | JSON body limited to 10 KB |
| Leaking secrets | `.env` is git-ignored; server refuses to start without `JWT_SECRET` |

Why HttpOnly cookie instead of localStorage? Any script on the page can read localStorage, so one XSS
bug would leak the token. An HttpOnly cookie cannot be read by JavaScript.

## Test checklist (edge cases)
- [ ] Register with a valid email, username and password -> success
- [ ] Register the same email again -> "Email is already registered."
- [ ] Register the same username again -> "Username is already registered."
- [ ] Weak password / invalid email / bad username -> validation message
- [ ] Login with wrong password -> "Invalid email or password."
- [ ] Login with unknown email -> same message
- [ ] Open `/dashboard` without logging in -> redirected to login
- [ ] Call `/api/dashboard` without logging in -> 401
- [ ] Login -> dashboard opens
- [ ] Logout -> back to login; `/dashboard` redirects again
- [ ] Copy a token before logout, reuse it after logout -> 401 (blacklisted)
- [ ] 11 quick login attempts -> "Too many attempts"

## Demo video outline
1. Show the register page, create an account (also show a duplicate error)
2. Login with a wrong password (error), then the correct one
3. Show the protected dashboard
4. Open `/dashboard` in a private window -> redirected to login
5. Logout, then try the dashboard again

## Documentation
See [docs/API.md](docs/API.md) for every endpoint.

## Deploying (free: GitHub + MongoDB Atlas + Render)
1. Push this folder to a GitHub repo (`.env` and `node_modules` are git-ignored).
2. Create a free MongoDB Atlas cluster, add a database user, allow access from `0.0.0.0/0`
   under Network Access, and copy the connection string (add your database name at the end).
3. On Render, create a **Web Service** from the repo:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `MONGO_URI`, `JWT_SECRET` (long random value), `NODE_ENV=production`
4. Open the `.onrender.com` URL Render gives you. The free tier sleeps when idle, so the first
   load can take 30-60 seconds.

## PROJECT LIVE LINK
  https://claude.ai/artifact/Pg5acAFqg2j5qt9tUENarp.