document.addEventListener('DOMContentLoaded', () => {

  const sessionString = localStorage.getItem('session');

  if (!sessionString) {
    return window.location.href = '/learn/plslogin.html';
  }

  let session;

  try {
    session = JSON.parse(sessionString);
  } catch (error) {
    localStorage.removeItem('session');
    return window.location.href = '/learn/plslogin.html';
  }

  if (!session || !session.user || !session.access_token) {
    localStorage.removeItem('session');
    return window.location.href = '/learn/plslogin.html';
  }

  // Show email directly from stored session
  const emailEl = document.getElementById('user-email');
  if (emailEl) {
    emailEl.textContent = session.user.email;
  }

  // Dropdown toggle
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

  // Sign out
  const signoutLink = document.getElementById('signout-link');
  if (signoutLink) {
    signoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('session');
      window.location.href = '/login/login.html';
    });
  }

});
