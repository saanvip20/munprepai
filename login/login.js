document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "https://munprepai.onrender.com";
  const form = document.getElementById("login-form");
  const status = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    status.textContent = "Logging in...";
    status.style.color = "black";

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        status.textContent = data.error || "Login failed.";
        status.style.color = "red";
        return;
      }

      status.textContent = "✅ Login successful!";
      status.style.color = "green";

      // Optional: store user info
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect after login
      setTimeout(() => {
        window.location.href = "/learn/learn.html";
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      status.textContent = "Could not connect to server.";
      status.style.color = "red";
    }
  });

});

