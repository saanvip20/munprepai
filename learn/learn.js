document.addEventListener('DOMContentLoaded', async () => {
  // 1️⃣ Get session from localStorage
  const session = JSON.parse(localStorage.getItem('session'));
  if (!session?.access_token) {
    // Not logged in
    return window.location.href = '/learn/plslogin.html';
  }

  try {
    // 2️⃣ Verify user session with backend
    const res = await fetch('https://munprepai.onrender.com/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: session.access_token }),
    });

    const data = await res.json();

    if (!res.ok || !data.user) {
      // Invalid session
      return window.location.href = '/learn/plslogin.html';
    }

    // 3️⃣ Display user email
    const emailEl = document.getElementById('user-email');
    if (emailEl) emailEl.textContent = data.user.email;

    // 4️⃣ Dropdown toggle functionality
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdown = document.getElementById('dropdown');

    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', () => {
        dropdown.classList.toggle('show');
      });

      // Close dropdown if clicked outside
      window.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== dropdownToggle) {
          dropdown.classList.remove('show');
        }
      });
    }

    // 5️⃣ Sign out button
    const signoutLink = document.getElementById('signout-link');
    if (signoutLink) {
      signoutLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent <a href="#"> jump
        localStorage.removeItem('session');
        window.location.href = '/login/login.html';
      });
    }

  } catch (err) {
    console.error('Session verification error:', err);
    // Redirect to login if any error
    window.location.href = '/learn/plslogin.html';
  }
});

