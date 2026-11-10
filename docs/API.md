# API Documentation

Base URL: `http://localhost:3000`
All request and response bodies are JSON. The JWT is stored in an **HttpOnly cookie** named `token`
(set by the server on login, sent automatically by the browser).

---

## POST /api/auth/register
Create a new account. Rate limited (10 requests / 15 min / IP).

**Body**
```json
{ "email": "sai@example.com", "username": "sai_kiran", "password": "Secret123" }
```

| Status | Meaning | Example response |
|---|---|---|
| 201 | Account created | `{ "message": "Registration successful. Please log in." }` |
| 400 | Validation failed | `{ "message": "Please enter a valid email address.", "errors": [...] }` |
| 409 | Email or username already used | `{ "message": "Email is already registered." }` |
| 429 | Too many attempts | `{ "message": "Too many attempts. ..." }` |

Validation: valid email; username 3-20 chars (letters, numbers, `_`); password 8-72 chars with
uppercase, lowercase and a number.

---

## POST /api/auth/login
Verify credentials. On success sets the `token` cookie. Rate limited.

**Body**
```json
{ "email": "sai@example.com", "password": "Secret123" }
```

| Status | Meaning | Example response |
|---|---|---|
| 200 | Logged in (cookie set) | `{ "message": "Login successful.", "user": { "username": "...", "email": "..." } }` |
| 400 | Missing fields | `{ "message": "Email and password are required." }` |
| 401 | Wrong email or password | `{ "message": "Invalid email or password." }` |

---

## POST /api/auth/logout  (protected)
Blacklists the current token and clears the cookie.

| Status | Meaning |
|---|---|
| 200 | `{ "message": "Logged out successfully." }` |
| 401 | Not logged in |

---

## GET /api/auth/me  (protected)
Returns the logged-in user.

| Status | Meaning |
|---|---|
| 200 | `{ "user": { "username": "...", "email": "..." } }` |
| 401 | `{ "message": "Not authenticated. Please log in." }` |

---

## GET /api/dashboard  (protected)
Example protected API route.

| Status | Meaning |
|---|---|
| 200 | `{ "message": "Welcome, sai_kiran!", "user": { ... } }` |
| 401 | `{ "message": "Not authenticated. Please log in." }` |

## GET /dashboard  (protected page)
Returns the dashboard HTML if logged in; otherwise redirects (302) to `/login.html`.

---

## Testing with Postman
Postman keeps cookies automatically for the same host. Call `/api/auth/login` first, then call the
protected endpoints. After `/api/auth/logout`, the protected endpoints return 401 again.
