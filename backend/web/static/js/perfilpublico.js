document.addEventListener('DOMContentLoaded', function() {
    // El USUARIO_ID es una constante global definida en el template perfil_publico.html
    if (typeof USUARIO_ID === 'undefined') {
        console.error('El ID del usuario no está definido.');
        return;
    }

    const accessToken = localStorage.getItem('access'); // Necesario para las llamadas a la API

    // --- URLs de la API ---
    const userProfileUrl = `http://127.0.0.1:8000/api/usuarios/${USUARIO_ID}/`;
    const calificacionesUrl = 'http://127.0.0.1:8000/api/calificaciones/';

    // --- Elementos del DOM ---
    const navLinks = document.querySelectorAll('.profile-nav .nav-link');
    const contentPanes = document.querySelectorAll('.content-pane');
    const calificacionesListContainer = document.getElementById('calificaciones-list-container');

    // --- Navegación del Perfil ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            contentPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                    // Si el panel de calificaciones es el objetivo, cargarlas
                    if (targetId === 'calificaciones-content') {
                        loadCalificaciones();
                    }
                }
            });
        });
    });

    // --- Carga de Datos del Perfil Público ---
    async function loadPublicProfileData() {
        try {
            const response = await fetch(userProfileUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('Error al cargar el perfil público');
            const data = await response.json();

            document.getElementById('nav-display-name').textContent = `${data.nombre} ${data.apellido}`;
            document.getElementById('display-nombre').textContent = data.nombre || 'N/A';
            document.getElementById('display-apellido').textContent = data.apellido || 'N/A';
            
            // Ocultamos campos que no queremos mostrar en el perfil público
            const telefonoLi = document.getElementById('display-telefono')?.closest('li');
            const correoLi = document.getElementById('display-correo')?.closest('li');
            if(telefonoLi) telefonoLi.style.display = 'none';
            if(correoLi) correoLi.style.display = 'none';

        } catch (error) {
            console.error(error);
            document.getElementById('nav-display-name').textContent = 'Error';
        }
    }

    // --- Carga y Renderizado de Calificaciones (copiado y adaptado de miperfil.js) ---
    function renderCalificaciones(calificaciones) {
        calificacionesListContainer.innerHTML = '';
        if (calificaciones.length === 0) {
            calificacionesListContainer.innerHTML = '<p class="text-center text-muted">Este conductor aún no ha recibido calificaciones.</p>';
            return;
        }

        calificaciones.forEach(calif => {
            const fecha = new Date(calif.fecha_creacion).toLocaleDateString();
            const calificacionIcono = calif.tipo === 'like' ? '👍' : '👎';
            
            const calificacionItem = document.createElement('div');
            calificacionItem.className = `calificacion-item calificacion-${calif.tipo}`;

            calificacionItem.innerHTML = `
                <div class="calificacion-header">
                    <span class="calificacion-autor-group">
                        <span class="calificacion-autor">${calif.calificador.nombre} ${calif.calificador.apellido}</span> <span class="comento-text">comentó:</span>
                    </span>
                    <span class="calificacion-fecha">${fecha}</span>
                </div>
                <div class="calificacion-body">
                    <span class="calificacion-icono">${calificacionIcono}</span>
                    <p class="calificacion-comentario">${calif.comentario || '<em>Sin comentario.</em>'}</p>
                </div>
            `;
            calificacionesListContainer.appendChild(calificacionItem);
        });
    }

    async function loadCalificaciones() {
        calificacionesListContainer.innerHTML = '<p class="text-center text-muted">Cargando calificaciones...</p>';

        try {
            const response = await fetch(`${calificacionesUrl}?calificado_id=${USUARIO_ID}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('Error al cargar las calificaciones');
            const data = await response.json();
            renderCalificaciones(data);
        } catch (error) {
            console.error(error);
            calificacionesListContainer.innerHTML = '<p class="text-center text-danger">No se pudieron cargar las calificaciones.</p>';
        }
    }

    // --- Inicialización ---
    function initialize() {
        loadPublicProfileData();
    }

    initialize();
});