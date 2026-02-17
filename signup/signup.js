const API_URL = "https://munprepai.onrender.com";
const status = document.getElementById('status');

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      status.textContent = 'Sign-up successful! Check your email.';
      status.style.color = 'green';

      // Optional: store user info locally
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to login page after signup
      window.location.href = '/login.html';
    } else {
      status.textContent = `Error: ${data.error}`;
      status.style.color = 'red';
    }
  } catch (err) {
    console.error('Signup fetch error:', err);
    status.textContent = 'Error: Could not connect to server';
    status.style.color = 'red';
  }
});
