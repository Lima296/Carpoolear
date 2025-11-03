const registroForm = document.getElementById("registroForm");
if (registroForm) {
  // Limpiar mensaje de error cuando el usuario empiece a escribir en el correo
  const correoInput = document.getElementById("reg_email");
  const correoCheckInput = document.getElementById("reg_check_email");
  
  function limpiarMensajeError() {
    const mensajeElement = document.getElementById("mensaje");
    if (mensajeElement && mensajeElement.classList.contains("alert-danger")) {
      mensajeElement.style.display = "none";
      mensajeElement.innerText = "";
      mensajeElement.className = "alert";
    }
  }
  if (correoInput) {
    correoInput.addEventListener("input", limpiarMensajeError);
  }
  
  if (correoCheckInput) {
    correoCheckInput.addEventListener("input", limpiarMensajeError);
  }

  registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = document.getElementById("reg_email").value;
  const check_correo = document.getElementById("reg_check_email").value;
  const nombre = document.getElementById("reg_nombre").value;
  const apellido = document.getElementById("reg_apellido").value;
  const caracteristica = document.getElementById("reg_caracteristica").value;
  const telefono_numero = document.getElementById("reg_telefono").value;
  const telefono = caracteristica + telefono_numero;
  const password = document.getElementById("reg_password").value;
  const check_password = document.getElementById("reg_check_password").value;


  if (correo !== check_correo) {
    const mensajeElement = document.getElementById("mensaje");
    mensajeElement.className = "alert alert-danger";
    mensajeElement.innerText = "Los correos no coinciden";
    mensajeElement.style.display = "block";
    return;
  }
  if (password !== check_password) {
    const mensajeElement = document.getElementById("mensaje");
    mensajeElement.className = "alert alert-danger";
    mensajeElement.innerText = "Las contraseñas no coinciden";
    mensajeElement.style.display = "block";
    return;
  }

  // Log para ver qué datos se están enviando
  console.log("Datos a enviar:", { nombre, correo, password });
  
  try {
    const response = await fetch("http://127.0.0.1:8000/api/usuarios/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, apellido, correo, telefono, password}),
    });

    const data = await response.json();
    
    // Log para ver la respuesta del servidor
    console.log("Respuesta del servidor:", data);
    console.log("Status:", response.status);
    console.log("Errores recibidos:", data.errores);
    console.log("Error recibido:", data.error);

    if (response.ok) {
      // Mostrar mensaje de éxito
      const mensajeElement = document.getElementById("mensaje");
      mensajeElement.className = "alert alert-success";
      mensajeElement.innerText = "¡Registro exitoso! Ya podés iniciar sesión";
      mensajeElement.style.display = "block";
      
      // Limpiar el formulario después del registro exitoso
      registroForm.reset();
      
      // Cerrar el modal después de  2 segundos
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistro'));
        if (modal) {
          modal.hide();
        }
        mensajeElement.style.display = "none";
      }, 3000);
    } else {
      // Manejar diferentes tipos de errores
      let mensajeError = "Error al registrar usuario";
      
      if (data.errores) {
        // Si hay errores específicos de campos
        if (data.errores.correo) {
          mensajeError = data.errores.correo[0]; // Mostrar el primer error del correo
        } else if (data.errores.nombre) {
          mensajeError = data.errores.nombre[0];
        } else if (data.errores.password) {
          mensajeError = data.errores.password[0];
        } else if (data.errores.non_field_errors) {
          mensajeError = data.errores.non_field_errors[0];
        }
      } else if (data.error) {
        mensajeError = data.error + (data.detalle ? `: ${data.detalle}` : '');
      } else if (data.detail) {
        mensajeError = data.detail;
      }
      
      // Traducir mensajes comunes de Django al español
      if (mensajeError.includes("already exists") || mensajeError.includes("ya existe")) {
        mensajeError = "Este correo electrónico ya está registrado. Por favor, utiliza otro correo.";
      } else if (mensajeError.includes("This field is required")) {
        mensajeError = "Todos los campos son obligatorios.";
      } else if (mensajeError.includes("Enter a valid email address")) {
        mensajeError = "Por favor, ingresa un correo electrónico válido.";
      } else if (mensajeError.includes("This password is too short")) {
        mensajeError = "La contraseña debe tener al menos 8 caracteres.";
      }
      
      // Mostrar mensaje de error
      const mensajeElement = document.getElementById("mensaje");
      mensajeElement.className = "alert alert-danger";
      mensajeElement.innerText = mensajeError;
      mensajeElement.style.display = "block";
    }
  } catch (error) {
    const mensajeElement = document.getElementById("mensaje");
    mensajeElement.className = "alert alert-danger";
    mensajeElement.innerText = "Error de conexión al servidor. Inténtalo de nuevo.";
    mensajeElement.style.display = "block";
    console.error("Error de conexión:", error);
  }
  });
} else {
  console.error("No se encontró el formulario de registro");
}

