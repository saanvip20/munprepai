document.addEventListener('DOMContentLoaded', async () => {

  // 1️⃣ Safely get session
  const sessionString = localStorage.getItem('session');

  if (!sessionString) {
    return window.location.href = '/learn/plslogin.html';
  }

  let session;
  try {
    session = JSON.parse(sessionString);
  } catch (error) {
    console.error("Invalid session format:", error);
    localStorage.removeItem('session');
    return window.location.href = '/learn/plslogin.html';
  }

  if (!session.access_token) {
    localStorage.removeItem('session');
    return window.location.href = '/learn/plslogin.html';
  }

  try {
    // 2️⃣ Verify session with backend
    const res = await fetch('https://munprepai.onrender.com/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: session.access_token }),
    });

    const data = await res.json();

    if (!res.ok || !data.user) {
      localStorage.removeItem('session');
      return window.location.href = '/learn/plslogin.html';
    }

    // 3️⃣ Show email
    const emailEl = document.getElementById('user-email');
    if (emailEl) emailEl.textContent = data.user.email;

    // 4️⃣ Dropdown toggle
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdown = document.getElementById('dropdown');

    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', () => {
        dropdown.classList.toggle('show');
      });

      window.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== dropdownToggle) {
          dropdown.classList.remove('show');
        }
      });
    }

    // 5️⃣ Sign out
    const signoutLink = document.getElementById('signout-link');
    if (signoutLink) {
      signoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('session');
        window.location.href = '/login/login.html';
      });
    }

  } catch (err) {
    console.error("Session verification failed:", err);
    localStorage.removeItem('session');
    window.location.href = '/learn/plslogin.html';
  }

});
