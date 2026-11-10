// Loads protected data and handles logout.
const messageBox = document.getElementById('message');

async function loadDashboard() {
  const res = await fetch('/api/dashboard');

  // Not logged in (or token expired): go back to login
  if (res.status === 401) {
    window.location.href = '/login.html';
    return;
  }

  const data = await res.json();
  document.getElementById('welcome').textContent = data.message;
  document.getElementById('email').textContent = 'Email: ' + data.user.email;
  document.getElementById('since').textContent =
    'Member since: ' + new Date(data.user.memberSince).toLocaleDateString();
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (res.ok) {
    window.location.href = '/login.html';
  } else {
    messageBox.textContent = 'Logout failed. Please try again.';
    messageBox.className = 'message error';
  }
});

loadDashboard();
