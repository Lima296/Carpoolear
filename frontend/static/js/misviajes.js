document.addEventListener('DOMContentLoaded', function() {
    const misViajesContainer = document.getElementById('mis-viajes-container');
    const accessToken = localStorage.getItem('access');

    // Modales de viaje
    const editViajeModalEl = document.getElementById('editViajeModal');
    const editViajeModal = new bootstrap.Modal(editViajeModalEl);
    const editViajeForm = document.getElementById('edit-viaje-form');
    const deleteViajeModalEl = document.getElementById('deleteViajeModal');
    const deleteViajeModal = new bootstrap.Modal(deleteViajeModalEl);
    const deleteViajeForm = document.getElementById('delete-viaje-form');
    let currentViajeId = null;

    // --- Función para formatear precios ---
    function formatPriceWithDot(price) {
        if (price === null || isNaN(parseFloat(price))) {
            return 'N/A';
        }
        const number = Math.round(parseFloat(price));
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // --- Creación de filas de viaje ---
    function crearFilaViaje(viaje) {
        const origen = (viaje.origen && viaje.origen.nombre) ? viaje.origen.nombre : 'N/A';
        const destino = (viaje.destino && viaje.destino.nombre) ? viaje.destino.nombre : 'N/A';
        const fecha = viaje.fecha || 'N/A';
        const hora = viaje.hora ? viaje.hora.substring(0, 5) + ' HS' : 'N/A';
        const precio = viaje.precio ? `$${formatPriceWithDot(viaje.precio)}` : 'N/A';
        const asientos = viaje.asientos_disponibles !== undefined ? viaje.asientos_disponibles : 'N/A';

        const hoy = new Date();
        const fechaViaje = new Date(viaje.fecha);
        let estado = 'Creado';

        hoy.setHours(0, 0, 0, 0);
        fechaViaje.setHours(0, 0, 0, 0);

        if (fechaViaje < hoy) {
            estado = 'Finalizado';
        } else if (fechaViaje.getTime() === hoy.getTime()) {
            estado = 'En Curso';
        }

        return `
            <li class="list-group-item list-group-item-action" data-viaje-id="${viaje.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${origen} → ${destino}</h5>
                    <small class="text-muted">${fecha}</small>
                </div>
                <p class="mb-1">Hora: ${hora} - Precio: <span class="fw-bold text-success">${precio}</span></p>
                <p class="mb-1">Estado: <span class="fw-bold">${estado}</span></p>
                <small>Asientos disponibles: ${asientos}</small>
                <div class="viaje-actions">
                    <button class="btn btn-edit edit-viaje-btn" data-viaje-id="${viaje.id}">Editar</button>
                    <button class="btn btn-delete delete-viaje-btn" data-viaje-id="${viaje.id}">Eliminar</button>
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

            if (response.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/';
                return;
            }

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

    // --- Lógica para Editar y Eliminar Viajes (MODIFICADO) ---
    misViajesContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const viajeId = target.dataset.viajeId;

        if (target.classList.contains('edit-viaje-btn')) {
            currentViajeId = viajeId;

            // 1. Obtener datos del viaje y de las localidades en paralelo
            const [viajeResponse, localidadesResponse] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                fetch('http://127.0.0.1:8000/api/localidad/')
            ]);

            if (!viajeResponse.ok || !localidadesResponse.ok) {
                console.error("Error al obtener los datos para editar.");
                return;
            }

            const viaje = await viajeResponse.json();
            const localidades = await localidadesResponse.json();

            // 2. Poblar los campos del formulario
            document.getElementById('edit-viaje-id').value = viaje.id;
            document.getElementById('edit-fecha').value = viaje.fecha;
            document.getElementById('edit-hora').value = viaje.hora;
            document.getElementById('edit-asientos').value = viaje.asientos_disponibles;
            document.getElementById('edit-precio').value = viaje.precio;

            // 3. Poblar los <select> de origen y destino
            const origenSelect = document.getElementById('edit-origen');
            const destinoSelect = document.getElementById('edit-destino');
            origenSelect.innerHTML = ''; // Limpiar opciones previas
            destinoSelect.innerHTML = ''; // Limpiar opciones previas

            localidades.forEach(localidad => {
                const option = document.createElement('option');
                option.value = localidad.id;
                option.textContent = localidad.nombre;
                origenSelect.appendChild(option.cloneNode(true));
                destinoSelect.appendChild(option);
            });

            // 4. Seleccionar la opción correcta
            origenSelect.value = viaje.origen.id;
            destinoSelect.value = viaje.destino.id;

            editViajeModal.show();
        }

        if (target.classList.contains('delete-viaje-btn')) {
            currentViajeId = viajeId;
            deleteViajeModal.show();
        }
    });

    // --- Evento para guardar los cambios del viaje ---
    editViajeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const viajeId = document.getElementById('edit-viaje-id').value;
        
        // Los .value de los <select> ya nos dan el ID correcto
        const updatedData = {
            origen: document.getElementById('edit-origen').value,
            destino: document.getElementById('edit-destino').value,
            fecha: document.getElementById('edit-fecha').value,
            hora: document.getElementById('edit-hora').value,
            asientos_disponibles: document.getElementById('edit-asientos').value,
            precio: document.getElementById('edit-precio').value,
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`, {
                method: 'PATCH', // Usamos PATCH para actualizaciones parciales
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al actualizar:', errorData);
                throw new Error('Error al actualizar el viaje');
            }

            editViajeModal.hide();
            loadMisViajes(); // Recargar la lista de viajes
        } catch (error) {
            console.error(error);
        }
    });

    // --- Evento para confirmar la eliminación del viaje ---
    deleteViajeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/viajes/${currentViajeId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) throw new Error('Error al eliminar el viaje');

            deleteViajeModal.hide();
            loadMisViajes();
        } catch (error) {
            console.error(error);
        }
    });


    if (accessToken) {
        loadMisViajes();
    }
});
