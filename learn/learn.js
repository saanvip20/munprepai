document.addEventListener('DOMContentLoaded', async () => {
  const session = JSON.parse(localStorage.getItem('session'));
  if (!session?.access_token) return window.location.href = '/learn/plslogin.html';

  try {
    // Verify user session
    const res = await fetch('http://localhost:3000/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: session.access_token }),
    });
    const data = await res.json();
    if (!res.ok || !data.user) return window.location.href = '/learn/plslogin.html';

    // Display email
    const emailEl = document.getElementById('user-email');
    if (emailEl) emailEl.textContent = data.user.email;

    // Sign out
    document.getElementById('signout-link').addEventListener('click', () => {
      localStorage.removeItem('session');
      window.location.href = '/login/login.html';
    });

  } catch (err) {
    console.error(err);
    window.location.href = '/learn/plslogin.html';
  }
});
