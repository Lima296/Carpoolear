document.addEventListener('DOMContentLoaded', function() {
    const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
    const accessToken = localStorage.getItem('access');

    // Elementos de la página para mostrar datos
    const nombreDisplay = document.getElementById('display-nombre');
    const apellidoDisplay = document.getElementById('display-apellido');
    const correoDisplay = document.getElementById('display-correo');
    const telefonoDisplay = document.getElementById('display-telefono');

    // Formulario del modal
    const form = document.getElementById('editarPerfilForm');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const telefonoInput = document.getElementById('telefono');
    const guardarBtn = document.getElementById('guardarCambiosBtn');
    const errorMessage = document.getElementById('edit-error-message');

    if (!accessToken) {
        // Si no hay token, redirigir al inicio o mostrar mensaje
        window.location.href = '/'; // O la página de login
        return;
    }

    async function loadProfileData() {
        try {
            const response = await fetch(userProfileUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.status === 401) {
                // Token inválido o expirado
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/'; // Redirigir a login
                return;
            }

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            
            // Poblar la vista principal
            nombreDisplay.textContent = data.nombre || 'N/A';
            apellidoDisplay.textContent = data.apellido || 'N/A';
            correoDisplay.textContent = data.correo || 'N/A';
            telefonoDisplay.textContent = data.telefono || 'N/A';

            // Poblar el formulario del modal
            nombreInput.value = data.nombre || '';
            apellidoInput.value = data.apellido || '';
            telefonoInput.value = data.telefono || '';

        } catch (error) {
            console.error('Error al cargar los datos del perfil:', error);
            // Manejar el error en la UI si es necesario
        }
    }

    async function saveProfileData(event) {
        event.preventDefault();
        errorMessage.style.display = 'none';

        const updatedData = {
            nombre: nombreInput.value,
            apellido: apellidoInput.value,
            telefono: telefonoInput.value,
        };

        try {
            const response = await fetch(userProfileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            // Si la actualización fue exitosa, recargar los datos y cerrar el modal
            await loadProfileData();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarPerfilModal'));
            modal.hide();

        } catch (error) {
            errorMessage.textContent = `Error al guardar: ${error.message}`;
            errorMessage.style.display = 'block';
            console.error('Error al guardar los datos del perfil:', error);
        }
    }

    // Cargar los datos cuando la página esté lista
    loadProfileData();

    // Añadir el listener al botón de guardar
    guardarBtn.addEventListener('click', saveProfileData);
});
