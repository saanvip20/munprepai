const API_URL = "https://munprepai.onrender.com";

document.getElementById('sign-up-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const status = document.getElementById('status');

  try {
    const res = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      status.textContent = data.message;
      status.style.color = 'green';
    } else {
      status.textContent = `Error: ${data.error}`;
      status.style.color = 'red';
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Error: Could not connect to server';
    status.style.color = 'red';
  }
});
