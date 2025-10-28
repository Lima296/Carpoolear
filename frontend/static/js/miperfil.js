document.addEventListener('DOMContentLoaded', function() {
    const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
    const accessToken = localStorage.getItem('access');

    // --- Elementos del DOM ---
    const nombreDisplay = document.getElementById('display-nombre');
    const apellidoDisplay = document.getElementById('display-apellido');
    const correoDisplay = document.getElementById('display-correo');
    const telefonoDisplay = document.getElementById('display-telefono');
    const misViajesContainer = document.getElementById('mis-viajes-container');

    if (!accessToken) {
        window.location.href = '/';
        return;
    }

    // --- Carga de datos del perfil ---
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
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/';
                return;
            }
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const data = await response.json();
            
            nombreDisplay.textContent = data.nombre || 'N/A';
            apellidoDisplay.textContent = data.apellido || 'N/A';
            correoDisplay.textContent = data.correo || 'N/A';
            telefonoDisplay.textContent = data.telefono || 'N/A';
        } catch (error) {
            console.error('Error al cargar los datos del perfil:', error);
        }
    }

    // --- Creación de filas de viaje ---
    function crearFilaViaje(viaje) {
        const origen = viaje.origen || 'N/A';
        const destino = viaje.destino || 'N/A';
        const fecha = viaje.fecha || 'N/A';
        const hora = viaje.hora ? viaje.hora.substring(0, 5) + ' HS' : 'N/A';
        const precio = viaje.precio ? `$${parseFloat(viaje.precio).toFixed(2)}` : 'N/A';
        const asientos = viaje.asientos_disponibles !== undefined ? viaje.asientos_disponibles : 'N/A';

        return `
            <li class="list-group-item list-group-item-action" data-viaje-id="${viaje.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${origen} → ${destino}</h5>
                    <small class="text-muted">${fecha}</small>
                </div>
                <p class="mb-1">Hora: ${hora} - Precio: <span class="fw-bold text-success">${precio}</span></p>
                <small>Asientos disponibles: ${asientos}</small>
                <div class="btn-group float-end" role="group">
                    <button class="btn btn-info btn-sm detalles-viaje-btn" data-bs-toggle="modal" data-bs-target="#verMiViajeModal" data-viaje-id="${viaje.id}">Detalles</button>
                    <button class="btn btn-primary btn-sm edit-viaje-btn">Editar</button>
                    <button class="btn btn-danger btn-sm delete-viaje-btn">Eliminar</button>
                </div>
            </li>
        `;
    }

    // --- Carga de los viajes del usuario ---
    async function loadMisViajes() {
        const misViajesUrl = 'http://127.0.0.1:8000/api/mis-viajes/';
        
        if (!misViajesContainer) return;

        misViajesContainer.innerHTML = '<li class="list-group-item text-center">Cargando mis viajes...</li>';

        try {
            const response = await fetch(misViajesUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            const viajes = await response.json();
            misViajesContainer.innerHTML = '';

            if (viajes.length === 0) {
                misViajesContainer.innerHTML = '<li class="list-group-item text-center">Aún no has creado ningún viaje.</li>';
                return;
            }

            viajes.forEach(viaje => {
                const filaHTML = crearFilaViaje(viaje);
                misViajesContainer.insertAdjacentHTML('beforeend', filaHTML);
            });

        } catch (error) {
            console.error('Error al cargar mis viajes:', error);
            misViajesContainer.innerHTML = '<li class="list-group-item list-group-item-danger text-center">No se pudieron cargar tus viajes.</li>';
        }
    }

    // --- Inicialización ---
    loadProfileData();
    loadMisViajes();
});
