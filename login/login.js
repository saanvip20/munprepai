document.addEventListener("DOMContentLoaded", () => {

  const supabaseUrl = "YOUR_SUPABASE_URL";
  const supabaseAnonKey = "YOUR_ANON_PUBLIC_KEY";

  const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

  const form = document.getElementById("login-form");
  const status = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    status.textContent = "Logging in...";
    status.style.color = "black";

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      status.textContent = error.message;
      status.style.color = "red";
      return;
    }

    status.textContent = "✅ Login successful!";
    status.style.color = "green";

    setTimeout(() => {
      window.location.href = "/learn/learn.html";
    }, 800);
  });

});
