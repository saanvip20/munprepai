document.addEventListener("DOMContentLoaded", () => {

  const supabaseUrl = "YOUR_SUPABASE_URL";
  const supabaseAnonKey = "YOUR_ANON_PUBLIC_KEY";

  const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

  const form = document.getElementById("signup-form");
  const status = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    status.textContent = "Creating account...";
    status.style.color = "black";

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      status.textContent = error.message;
      status.style.color = "red";
      return;
    }

    status.textContent = "✅ Sign-up successful! Please check your email for confirmation.";
    status.style.color = "green";

    setTimeout(() => {
      window.location.href = "/login/login.html";
    }, 1500);
  });

});
