// Sends login details to the backend. The server stores the token in an HttpOnly cookie,
// so this file never touches the token.
const form = document.getElementById('loginForm');
const messageBox = document.getElementById('message');

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = 'message ' + type;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      window.location.href = '/dashboard';
    } else {
      showMessage(data.message, 'error'); // "Invalid email or password." etc.
    }
  } catch (err) {
    showMessage('Cannot reach the server.', 'error');
  }
});
