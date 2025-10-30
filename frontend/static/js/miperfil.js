document.addEventListener('DOMContentLoaded', function() {
    // --- Función para formatear precios ---
    function formatPriceWithDot(price) {
        if (price === null || isNaN(parseFloat(price))) {
            return 'N/A';
        }
        const number = Math.round(parseFloat(price));
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
    const accessToken = localStorage.getItem('access');

    // --- Elementos del DOM ---
    const nombreDisplay = document.getElementById('display-nombre');
    const apellidoDisplay = document.getElementById('display-apellido');
    const correoDisplay = document.getElementById('display-correo');
    const telefonoDisplay = document.getElementById('display-telefono');
    const misViajesContainer = document.getElementById('mis-viajes-container');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModalEl = document.getElementById('editProfileModal');
    const editProfileModal = new bootstrap.Modal(editProfileModalEl);
    const editProfileForm = document.getElementById('edit-profile-form');
    const editNombreInput = document.getElementById('edit-nombre');
    const editApellidoInput = document.getElementById('edit-apellido');
    const editTelefonoInput = document.getElementById('edit-telefono');
    const editCorreoInput = document.getElementById('edit-correo');

    // Modales de viaje
    const editViajeModalEl = document.getElementById('editViajeModal');
    const editViajeModal = new bootstrap.Modal(editViajeModalEl);
    const editViajeForm = document.getElementById('edit-viaje-form');
    const deleteViajeModalEl = document.getElementById('deleteViajeModal');
    const deleteViajeModal = new bootstrap.Modal(deleteViajeModalEl);
    const deleteViajeForm = document.getElementById('delete-viaje-form');
    let currentViajeId = null;

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

            // Llenar el formulario de edición
            editNombreInput.value = data.nombre || '';
            editApellidoInput.value = data.apellido || '';
            editTelefonoInput.value = data.telefono || '';
            editCorreoInput.value = data.correo || '';
        } catch (error) {
            console.error('Error al cargar los datos del perfil:', error);
        }
    }

    // --- Evento para abrir el modal de edición de perfil ---
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileModal.show();
        });
    }

    // --- Evento para guardar los cambios del perfil ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!editNombreInput.value || !editApellidoInput.value || !editTelefonoInput.value) {
                alert('Por favor, complete todos los campos.');
                return;
            }

            const updatedData = {
                nombre: editNombreInput.value,
                apellido: editApellidoInput.value,
                telefono: editTelefonoInput.value,
            };

            try {
                const response = await fetch(userProfileUrl, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

                const responseData = await response.json();
                nombreDisplay.textContent = responseData.nombre || 'N/A';
                apellidoDisplay.textContent = responseData.apellido || 'N/A';
                telefonoDisplay.textContent = responseData.telefono || 'N/A';

                editProfileModal.hide();
            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
            }
        });
    }

    // --- Evento para resetear el formulario al cerrar el modal de perfil ---
    if (editProfileModalEl) {
        editProfileModalEl.addEventListener('hidden.bs.modal', () => {
            loadProfileData();
        });
    }

    // --- Creación de filas de viaje ---
    function crearFilaViaje(viaje) {
        const origen = viaje.origen || 'N/A';
        const destino = viaje.destino || 'N/A';
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
                    <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#verMiViajeModal" data-viaje-id="${viaje.id}">Detalles</button>
                    <button class="btn btn-edit edit-viaje-btn">Editar</button>
                    <button class="btn btn-delete delete-viaje-btn">Eliminar</button>
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

    // --- Carga de datos del vehículo ---
    async function loadVehicleData() {
        const miVehiculoUrl = 'http://127.0.0.1:8000/api/mi-vehiculo/';
        try {
            const response = await fetch(miVehiculoUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 404) {
                document.getElementById('display-marca').textContent = 'No registrado';
                document.getElementById('display-modelo').textContent = 'No registrado';
                document.getElementById('display-patente').textContent = 'No registrado';
                document.getElementById('display-color').textContent = 'No registrado';
                return;
            }

            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            const vehiculo = await response.json();
            document.getElementById('display-marca').textContent = vehiculo.marca;
            document.getElementById('display-modelo').textContent = vehiculo.modelo;
            document.getElementById('display-patente').textContent = vehiculo.patente;
            document.getElementById('display-color').textContent = vehiculo.color;

        } catch (error) {
            console.error('Error al cargar los datos del vehículo:', error);
        }
    }

    // --- Lógica para Editar y Eliminar Viajes ---
    misViajesContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const viajeLi = target.closest('.list-group-item');
        if (!viajeLi) return;

        const viajeId = viajeLi.dataset.viajeId;

        if (target.classList.contains('edit-viaje-btn')) {
            currentViajeId = viajeId;
            const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const viaje = await response.json();

            document.getElementById('edit-viaje-id').value = viaje.id;
            document.getElementById('edit-origen').value = viaje.origen;
            document.getElementById('edit-destino').value = viaje.destino;
            document.getElementById('edit-fecha').value = viaje.fecha;
            document.getElementById('edit-hora').value = viaje.hora;
            document.getElementById('edit-asientos').value = viaje.asientos_disponibles;
            document.getElementById('edit-precio').value = viaje.precio;

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
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Error al actualizar el viaje');

            editViajeModal.hide();
            loadMisViajes();
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

    // --- Inicialización ---
    Promise.all([loadProfileData(), loadVehicleData()]).then(() => {
        equalizeCardHeights();
    });
    loadMisViajes();

    function equalizeCardHeights() {
        const userCard = document.querySelector('.col-lg-6:nth-child(1) .profile-card');
        const vehicleCard = document.querySelector('.col-lg-6:nth-child(2) .profile-card');

        if (userCard && vehicleCard) {
            userCard.style.height = 'auto';
            vehicleCard.style.height = 'auto';

            const userCardHeight = userCard.offsetHeight;
            const vehicleCardHeight = vehicleCard.offsetHeight;

            if (userCardHeight > vehicleCardHeight) {
                vehicleCard.style.height = `${userCardHeight}px`;
            } else {
                userCard.style.height = `${vehicleCardHeight}px`;
            }
        }
    }
});