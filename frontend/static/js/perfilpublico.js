document.addEventListener('DOMContentLoaded', function() {
    // USUARIO_ID se inyecta desde el template de Django
    if (typeof USUARIO_ID === 'undefined') {
        console.error('La variable USUARIO_ID no está definida.');
        return;
    }

    const API_URL = `http://localhost:8000/api/usuarios/${USUARIO_ID}/`;

    // --- Elementos del DOM ---
    const navDisplayName = document.getElementById('nav-display-name');
    const displayNombre = document.getElementById('display-nombre');
    const displayApellido = document.getElementById('display-apellido');
    const displayTelefono = document.getElementById('display-telefono');
    const displayCorreo = document.getElementById('display-correo');

    // --- Función para obtener y mostrar el perfil ---
    async function cargarPerfil() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const usuario = await response.json();
            
            renderizarPerfil(usuario);

        } catch (error) {
            console.error('Error al cargar el perfil del conductor:', error);
            // Manejar el error en la UI
            if(navDisplayName) navDisplayName.textContent = 'Error';
            if(displayNombre) displayNombre.textContent = 'No se pudo cargar la información.';
            if(displayApellido) displayApellido.textContent = '';
            if(displayTelefono) displayTelefono.textContent = '';
            if(displayCorreo) displayCorreo.textContent = '';
        }
    }

    // --- Función para renderizar los datos del perfil ---
    function renderizarPerfil(usuario) {
        const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Nombre no disponible';
        
        if (navDisplayName) {
            navDisplayName.textContent = nombreCompleto;
        }
        if (displayNombre) {
            displayNombre.textContent = usuario.nombre || 'No disponible';
        }
        if (displayApellido) {
            displayApellido.textContent = usuario.apellido || 'No disponible';
        }
        if (displayTelefono) {
            displayTelefono.textContent = usuario.telefono || 'No disponible';
        }
        if (displayCorreo) {
            displayCorreo.textContent = usuario.correo || 'No disponible';
        }
    }

    // --- Iniciar la carga del perfil ---
    cargarPerfil();
});