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
    const mensajeElement = document.getElementById("mensajeLogin");
    
    if (response.ok) {
      mensajeElement.innerText = "Login exitoso";
      mensajeElement.style.display = "block";
      mensajeElement.className = "alert alert-success";
      // Guardar tokens en localStorage
      localStorage.setItem("access", data.access);  
      localStorage.setItem("refresh", data.refresh);
    } else {
      mensajeElement.innerText = "Error: " +
        (data.detail || data.non_field_errors || "credenciales inválidas");
      mensajeElement.style.display = "block";
      mensajeElement.className = "alert alert-danger";
    }
  } catch (error) {
    const mensajeElement = document.getElementById("mensajeLogin");
    mensajeElement.innerText = "Error de conexión al backend";
    mensajeElement.style.display = "block";
    mensajeElement.className = "alert alert-danger";
  }
});
