
const API_URL = "https://munprepai.onrender.com";
const status = document.getElementById('status');

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      status.textContent = 'Login successful!';
      status.style.color = 'green';
      localStorage.setItem('session', JSON.stringify(data.session));
      window.location.href = '/learn/learn.html';
    } else {
      status.textContent = `Error: ${data.error}`;
      status.style.color = 'red';
    }
  } catch {
    status.textContent = 'Error: Could not connect to server';
    status.style.color = 'red';
  }
});
