const form = document.getElementById("loginForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://127.0.0.1:8000/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, password }),
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("mensaje").innerText = "Login exitoso ✅";
      // Guardar tokens en localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
    } else {
      document.getElementById("mensaje").innerText =
        "Error: " +
        (data.detail || data.non_field_errors || "credenciales inválidas");
    }
  } catch (error) {
    document.getElementById("mensaje").innerText =
      "Error de conexión al backend";
  }
});
