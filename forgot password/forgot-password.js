const API_URL = "https://munprepai.onrender.com";

const status = document.getElementById('status');

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;

  try {
    const res = await fetch(`${API_URL}/api/forgotpassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      status.textContent = data.message;
      status.style.color = 'green';
      setTimeout(() => {
        window.location.href = '/login/login.html';
      }, 5000);
    } else {
      status.textContent = `Error: ${data.error}`;
      status.style.color = 'red';
    }
  } catch {
    status.textContent = 'Error: Could not connect to server';
    status.style.color = 'red';
  }
});
