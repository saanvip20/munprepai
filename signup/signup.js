document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "https://munprepai.onrender.com";
  const form = document.getElementById("signup-form");
  const status = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    status.textContent = "Creating account...";
    status.style.color = "black";

    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        status.textContent = data.error || "Signup failed.";
        status.style.color = "red";
        return;
      }

      status.textContent = "✅ Signup successful! Check your email if confirmation is enabled.";
      status.style.color = "green";

      setTimeout(() => {
        window.location.href = "/login/login.html";
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);
      status.textContent = "Could not connect to server.";
      status.style.color = "red";
    }
  });

});

