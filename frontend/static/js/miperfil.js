// Este archivo contiene la lógica específica para la página miperfil.html.

document.addEventListener('DOMContentLoaded', function() {
    const userProfileUrl = '/api/perfil/datos/'; 

    async function loadProfileData() {
        // Usa la función 'getCookie' del archivo usuarios.js
        const csrfToken = getCookie('csrftoken'); 
        
        try {
            const response = await fetch(userProfileUrl, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': csrfToken, 
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            
            document.getElementById('display-nombre').textContent = data.nombre || 'N/A';
            document.getElementById('display-correo').textContent = data.correo || 'N/A';
            document.getElementById('display-telefono').textContent = data.telefono || 'N/A';
            document.getElementById('display-dni').textContent = data.dni || 'N/A';
            
            const statusElement = document.getElementById('profile-status');
            if (statusElement) {
                statusElement.style.display = 'none';
            }

        } catch (error) {
            console.error('Error al cargar los datos del perfil:', error);
            const statusElement = document.getElementById('profile-status');
            if (statusElement) {
                statusElement.textContent = 'No se pudieron cargar los datos. ' + error.message;
            }
        }
    }
    
    loadProfileData();
});