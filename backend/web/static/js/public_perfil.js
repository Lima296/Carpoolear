document.addEventListener('DOMContentLoaded', function() {
    // --- URL de la API ---
    const userProfileUrl = `http://127.0.0.1:8000/api/usuarios/${USER_ID}/`;

    // --- Carga de Datos del Perfil ---
    async function loadProfileData() {
        try {
            const response = await fetch(userProfileUrl);
            if (!response.ok) throw new Error('Error al cargar el perfil');
            const data = await response.json();

            document.getElementById('nav-display-name').textContent = `${data.nombre} ${data.apellido}`;
            document.getElementById('display-nombre').textContent = data.nombre || 'N/A';
            document.getElementById('display-apellido').textContent = data.apellido || 'N/A';
            document.getElementById('display-telefono').textContent = data.telefono || 'N/A';
            document.getElementById('display-correo').textContent = data.correo || 'N/A';
        } catch (error) {
            console.error(error);
        }
    }

    // --- Inicialización ---
    function initialize() {
        loadProfileData();
    }

    initialize();
});