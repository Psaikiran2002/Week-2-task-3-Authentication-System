// Sends the registration form to the backend and shows the result.
const form = document.getElementById('registerForm');
const messageBox = document.getElementById('message');

function showMessage(text, type) {
  messageBox.textContent = text;          // textContent (not innerHTML) so nothing can inject HTML
  messageBox.className = 'message ' + type;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    email: document.getElementById('email').value,
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
  };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      showMessage(data.message, 'success');
      form.reset();
      setTimeout(() => (window.location.href = '/login.html'), 1500);
    } else {
      showMessage(data.message, 'error'); // e.g. duplicate email, weak password
    }
  } catch (err) {
    showMessage('Cannot reach the server.', 'error');
  }
});
