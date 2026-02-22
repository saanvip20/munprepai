document.addEventListener("DOMContentLoaded", async () => {

  const supabaseUrl = "https://iiopiymqwmrovtkjowpp.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb3BpeW1xd21yb3Z0a2pvd3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTE3NTYsImV4cCI6MjA4MzU4Nzc1Nn0.7dcAoTvBq8-JQ9vqGr9KEs9JZf2IrSc0qb1W4WwjvpA";

  const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/login/login.html";
    return;
  }

  // Show user email
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = session.user.email;

  // Dropdown
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdown = document.getElementById("dropdown");

  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener("click", () => {
      dropdown.classList.toggle("show");
    });
    window.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== dropdownToggle) {
        dropdown.classList.remove("show");
      }
    });
  }

  // Sign out
  const signoutLink = document.getElementById("signout-link");
  if (signoutLink) {
    signoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/login/login.html";
    });
  }

});
