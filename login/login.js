const API_URL = "https://munprepai.onrender.com";
const status = document.getElementById('status');

// LOGIN FORM SUBMISSION
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Login successful
      status.textContent = 'Login successful!';
      status.style.color = 'green';

      // Store only the access token for future API calls
      localStorage.setItem('token', data.session.access_token);

      // Optional: store other info if needed
      localStorage.setItem('user', JSON.stringify(data.session.user));

      window.location.href = '/learn/learn.html';
    } else {
      // ❌ Login failed
      status.textContent = `Error: ${data.error}`;
      status.style.color = 'red';
    }
  } catch (err) {
    console.error('Login fetch error:', err);
    status.textContent = 'Error: Could not connect to server';
    status.style.color = 'red';
  }
});

// EXAMPLE: USING TOKEN IN OTHER API CALLS
async function generateTopic() {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No token found. Please log in first.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/generate-topic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ✅ Only the token
      },
      body: JSON.stringify({ /* any required body */ })
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Generated topic:', data.topic);
    } else {
      console.error('Error generating topic:', data.error);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
