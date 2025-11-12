document.addEventListener('DOMContentLoaded', async function() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        window.location.href = '/';
        return;
    }

    let todasLasLocalidades = [];

    // --- Contenedores ---
    const misViajesContainer = document.getElementById('mis-viajes-container');
    const misReservasContainer = document.getElementById('mis-reservas-container');
    const solicitudesContainer = document.getElementById('solicitudes-container');

    // --- Pestañas ---
    const reservasTab = document.getElementById('pills-reservas-tab');
    const solicitudesTab = document.getElementById('pills-solicitudes-tab');
    let reservasLoaded = false;
    let solicitudesLoaded = false;

    // --- Modales de Viaje ---
    const editViajeModalEl = document.getElementById('editViajeModal');
    const editViajeModal = new bootstrap.Modal(editViajeModalEl);
    const editViajeForm = document.getElementById('edit-viaje-form');
    const deleteViajeModalEl = document.getElementById('deleteViajeModal');
    const deleteViajeModal = new bootstrap.Modal(deleteViajeModalEl);
    const deleteViajeForm = document.getElementById('delete-viaje-form');
    const verPasajerosModalEl = document.getElementById('verPasajerosModal');
    const verPasajerosModal = new bootstrap.Modal(verPasajerosModalEl);
    let currentViajeId = null;

    // --- Función para formatear precios ---
    function formatPriceWithDot(price) {
        if (price === null || isNaN(parseFloat(price))) {
            return 'N/A';
        }
        const number = Math.round(parseFloat(price));
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // --- Creación de filas y tarjetas ---
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

        return (
            `<li class="list-group-item list-group-item-action d-flex flex-column" data-viaje-id="${viaje.id}">
                <div class="d-flex w-100 justify-content-between align-items-start flex-grow-1">
                    <div class="trip-details">
                        <h5 class="mb-1">${origen} → ${destino}</h5>
                        <div class="mt-2">
                            <div class="d-flex gap-3 mb-1">
                                <div class="d-flex align-items-center gap-1">
                                    <img src="/static/img/fecha2.svg" alt="Fecha" width="16">
                                    <span class="mb-1">${fecha}</span>
                                </div>
                                <div class="d-flex align-items-center gap-1">
                                    <img src="/static/img/reloj2.svg" alt="Hora" width="16">
                                    <span class="mb-1">${hora}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-1 mb-1">
                                <img src="/static/img/money2.svg" alt="Precio" width="16">
                                <span class="fw-bold text-success">${precio}</span>
                            </div>
                            <div class="d-flex align-items-center gap-1 mb-1">
                                <img src="/static/img/asiento.svg" alt="Asientos" width="16">
                                <span class="mb-1">${asientos} asientos</span>
                            </div>
                        </div>
                        <p class="mb-1 mt-2">Estado: <span class="fw-bold">${estado}</span></p>
                    </div>
                </div>
                <div class="d-flex mt-auto justify-content-end gap-2">
                    <button class="btn btn-brand-secondary-outline edit-viaje-btn" data-viaje-id="${viaje.id}">Editar</button>
                    <button class="btn btn-brand-secondary-outline ver-pasajeros-btn" data-viaje-id="${viaje.id}">Ver Pasajeros</button>
                    <button class="btn btn-outline-danger delete-viaje-btn" data-viaje-id="${viaje.id}">Eliminar</button>
                </div>
            </li>`
        );
    }

    function crearFilaReserva(reserva) {
        const viaje = reserva.viaje;
        if (!viaje) return '';

        const origen = (viaje.origen && viaje.origen.nombre) ? viaje.origen.nombre : 'N/A';
        const destino = (viaje.destino && viaje.destino.nombre) ? viaje.destino.nombre : 'N/A';
        const fecha = viaje.fecha || 'N/A';
        const hora = viaje.hora ? viaje.hora.substring(0, 5) + ' HS' : 'N/A';
        const precioTotal = reserva.cantidad_asientos * viaje.precio;
        const precioFila = ` $${formatPriceWithDot(precioTotal)} (${reserva.cantidad_asientos} asiento/s)`;

        let estadoClass = '';
        switch (reserva.estado) {
            case 'CONFIRMADA': estadoClass = 'text-success'; break;
            case 'PENDIENTE': estadoClass = 'text-warning'; break;
            case 'CANCELADA': estadoClass = 'text-danger'; break;
            default: estadoClass = 'text-muted';
        }

        return (
            `<li class="list-group-item list-group-item-action d-flex flex-column" data-reserva-uuid="${reserva.uuid}">
                <div class="d-flex w-100 justify-content-between align-items-start flex-grow-1">
                    <div class="trip-details">
                        <h5 class="mb-1">${origen} → ${destino}</h5>
                        <p class="mb-1 mt-2">Conductor: <span class="fw-bold">${viaje.conductor.nombre} ${viaje.conductor.apellido}</span></p>
                        <div class="mt-2">
                            <div class="d-flex gap-3 mb-1">
                                <div class="d-flex align-items-center gap-1">
                                    <img src="/static/img/fecha2.svg" alt="Fecha" width="16">
                                    <span class="mb-1">${fecha}</span>
                                </div>
                                <div class="d-flex align-items-center gap-1">
                                    <img src="/static/img/reloj2.svg" alt="Hora" width="16">
                                    <span class="mb-1">${hora}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-1 mb-1">
                                <img src="/static/img/money2.svg" alt="Precio" width="16">
                                <span class="fw-bold text-success">${precioFila}</span>
                            </div>
                        </div>
                        <p class="mb-1 mt-2">Estado de la reserva: <span class="fw-bold ${estadoClass}">${reserva.estado}</span></p>
                    </div>
                </div>
                ${reserva.estado !== 'CANCELADA' ? (
                `<div class="d-flex mt-auto justify-content-end gap-2">
                    <button class="btn btn-outline-danger btn-cancelar-reserva" data-reserva-uuid="${reserva.uuid}">Cancelar Reserva</button>
                </div>`
                ) : ''}
            </li>`
        );
    }

    function crearCardSolicitud(solicitud) {
        const viaje = solicitud.viaje;
        const pasajero = solicitud.usuario;
        if (!viaje || !pasajero) return '';

        return `
            <div class="list-group-item" id="solicitud-${solicitud.uuid}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Solicitud para: ${viaje.origen} → ${viaje.destino}</h5>
                    <small>${viaje.fecha}</small>
                </div>
                <p class="mb-1">Pasajero: <span class="fw-bold">${pasajero.nombre} ${pasajero.apellido}</span></p>
                <small>Asientos solicitados: <span class="fw-bold">${solicitud.cantidad_asientos}</span></small>
                <div class="d-flex justify-content-end gap-2 mt-3">
                    <button class="btn btn-success btn-sm btn-aceptar-solicitud" data-reserva-uuid="${solicitud.uuid}">Aceptar</button>
                    <button class="btn btn-danger btn-sm btn-rechazar-solicitud" data-reserva-uuid="${solicitud.uuid}">Rechazar</button>
                </div>
            </div>
        `;
    }

    // --- Carga de Datos ---
    async function loadMisViajes() {
        const url = 'http://127.0.0.1:8000/api/mis-viajes/';
        if (!misViajesContainer) return;
        misViajesContainer.innerHTML = '<li class="list-group-item text-center">Cargando mis viajes...</li>';

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const viajes = await response.json();

            misViajesContainer.innerHTML = '';
            if (viajes.length === 0) {
                misViajesContainer.innerHTML = '<li class="list-group-item text-center">Aún no has creado ningún viaje.</li>';
                return;
            }
            viajes.forEach(viaje => {
                misViajesContainer.insertAdjacentHTML('beforeend', crearFilaViaje(viaje));
            });
        } catch (error) {
            console.error('Error al cargar mis viajes:', error);
            misViajesContainer.innerHTML = '<li class="list-group-item list-group-item-danger text-center">No se pudieron cargar tus viajes.</li>';
        }
    }

    async function loadMisReservas() {
        const url = 'http://127.0.0.1:8000/api/mis-reservas/';
        if (!misReservasContainer) return;
        misReservasContainer.innerHTML = '<li class="list-group-item text-center">Cargando mis reservas...</li>';

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const reservas = await response.json();

            misReservasContainer.innerHTML = '';
            if (reservas.length === 0) {
                misReservasContainer.innerHTML = '<li class="list-group-item text-center">No has hecho ninguna reserva.</li>';
                return;
            }
            reservas.forEach(reserva => {
                misReservasContainer.insertAdjacentHTML('beforeend', crearFilaReserva(reserva));
            });
        } catch (error) {
            console.error('Error al cargar mis reservas:', error);
            misReservasContainer.innerHTML = '<li class="list-group-item list-group-item-danger text-center">No se pudieron cargar tus reservas.</li>';
        }
    }

    async function loadSolicitudes() {
        const url = 'http://127.0.0.1:8000/api/reservas/pendientes/';
        if (!solicitudesContainer) return;
        solicitudesContainer.innerHTML = '<div class="list-group-item text-center">Cargando solicitudes...</div>';

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const solicitudes = await response.json();

            solicitudesContainer.innerHTML = '';
            if (solicitudes.length === 0) {
                solicitudesContainer.innerHTML = '<div class="list-group-item text-center">No tienes solicitudes pendientes.</div>';
                return;
            }
            solicitudes.forEach(solicitud => {
                solicitudesContainer.insertAdjacentHTML('beforeend', crearCardSolicitud(solicitud));
            });
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            solicitudesContainer.innerHTML = '<div class="list-group-item list-group-item-danger text-center">No se pudieron cargar las solicitudes.</div>';
        }
    }

    // --- Lógica de Pestañas ---
    reservasTab.addEventListener('shown.bs.tab', function () {
        if (!reservasLoaded) {
            loadMisReservas();
            reservasLoaded = true;
        }
    });

    solicitudesTab.addEventListener('shown.bs.tab', function () {
        if (!solicitudesLoaded) {
            loadSolicitudes();
            solicitudesLoaded = true;
        }
    });

    // --- Lógica de Acciones de Viaje (Editar/Eliminar) ---
    misViajesContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const viajeId = target.closest('[data-viaje-id]')?.dataset.viajeId;
        if (!viajeId) return;

        if (target.classList.contains('edit-viaje-btn')) {
            currentViajeId = viajeId;
            const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            const viaje = await response.json();

            document.getElementById('edit-viaje-id').value = viaje.id;
            document.getElementById('edit-fecha').value = viaje.fecha;
            document.getElementById('edit-hora').value = viaje.hora;
            document.getElementById('edit-asientos').value = viaje.asientos_disponibles;
            document.getElementById('edit-precio').value = viaje.precio;

            // Poblar los nuevos campos de input y sus IDs ocultos
            const origenInput = document.getElementById('edit-origen-input');
            const origenIdInput = document.getElementById('edit-origen-id');
            const destinoInput = document.getElementById('edit-destino-input');
            const destinoIdInput = document.getElementById('edit-destino-id');

            if (viaje.origen) {
                origenInput.value = viaje.origen.nombre;
                origenIdInput.value = viaje.origen.id;
            } else {
                origenInput.value = '';
                origenIdInput.value = '';
            }

            if (viaje.destino) {
                destinoInput.value = viaje.destino.nombre;
                destinoIdInput.value = viaje.destino.id;
            } else {
                destinoInput.value = '';
                destinoIdInput.value = '';
            }

            editViajeModal.show();
        }

        if (target.classList.contains('delete-viaje-btn')) {
            currentViajeId = viajeId;
            deleteViajeModal.show();
        }

        if (target.classList.contains('ver-pasajeros-btn')) {
            const pasajerosList = document.getElementById('pasajeros-list');
            pasajerosList.innerHTML = '<li class="list-group-item text-center">Cargando...</li>';
            verPasajerosModal.show();

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/reservas/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                if (!response.ok) throw new Error('Error al cargar los pasajeros.');
                const pasajeros = await response.json();

                pasajerosList.innerHTML = '';
                if (pasajeros.length === 0) {
                    pasajerosList.innerHTML = '<li class="list-group-item text-center">No hay pasajeros confirmados para este viaje.</li>';
                } else {
                    pasajeros.forEach(reserva => {
                        const pasajero = reserva.usuario;
                        const item = document.createElement('li');
                        item.className = 'list-group-item d-flex justify-content-between align-items-center';
                        item.innerHTML = `
                            <span>${pasajero.nombre} ${pasajero.apellido} (${reserva.cantidad_asientos} asiento/s)</span>
                            <button class="btn btn-sm btn-outline-danger eliminar-pasajero-btn" data-reserva-uuid="${reserva.uuid}">Eliminar</button>
                        `;
                        pasajerosList.appendChild(item);
                    });
                }
            } catch (error) {
                console.error(error);
                pasajerosList.innerHTML = '<li class="list-group-item list-group-item-danger text-center">No se pudieron cargar los pasajeros.</li>';
            }
        }
    });

    document.getElementById('pasajeros-list').addEventListener('click', async (e) => {
        if (e.target.classList.contains('eliminar-pasajero-btn')) {
            const reservaUuid = e.target.dataset.reservaUuid;
            if (!reservaUuid) return;

            if (confirm('¿Estás seguro de que quieres eliminar a este pasajero del viaje?')) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/reservas/${reservaUuid}/`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });

                    if (!response.ok) {
                        // Si el backend devuelve un mensaje de error, lo mostramos
                        const errorData = await response.json().catch(() => ({})); // Intenta parsear JSON, si falla, devuelve objeto vacío
                        throw new Error(errorData.detail || 'Error al eliminar al pasajero.');
                    }

                    // Eliminar el elemento de la lista visualmente
                    e.target.closest('.list-group-item').remove();
                    
                    // Opcional: si la lista queda vacía, mostrar un mensaje
                    const pasajerosList = document.getElementById('pasajeros-list');
                    if (pasajerosList.children.length === 0) {
                        pasajerosList.innerHTML = '<li class="list-group-item text-center">No hay pasajeros confirmados para este viaje.</li>';
                    }
                    
                    // Recargar la lista de viajes para actualizar el número de asientos disponibles
                    loadMisViajes();

                } catch (error) {
                    console.error('Error:', error);
                    alert(`No se pudo eliminar al pasajero. ${error.message}`);
                }
            }
        }
    });

    editViajeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const viajeId = document.getElementById('edit-viaje-id').value;
        
        // Obtener los IDs de origen y destino de los campos ocultos
        const origenId = document.getElementById('edit-origen-id').value;
        const destinoId = document.getElementById('edit-destino-id').value;

        // Validar que se haya seleccionado una localidad para origen y destino
        if (!origenId) {
            alert('Por favor, selecciona un Origen válido de la lista.');
            return;
        }
        if (!destinoId) {
            alert('Por favor, selecciona un Destino válido de la lista.');
            return;
        }

        const updatedData = {
            origen: origenId,
            destino: destinoId,
            fecha: document.getElementById('edit-fecha').value,
            hora: document.getElementById('edit-hora').value,
            asientos_disponibles: parseInt(document.getElementById('edit-asientos').value, 10),
            precio: parseFloat(document.getElementById('edit-precio').value),
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Intenta leer el JSON, si falla, devuelve un objeto vacío.
                const errorMessage = Object.values(errorData).flat().join('\n'); // Concatena todos los mensajes de error.
                throw new Error(errorMessage || 'Error al actualizar el viaje. Por favor, revisa los datos.');
            }

            editViajeModal.hide();
            loadMisViajes(); // Recargar la lista de viajes
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            alert(`No se pudieron guardar los cambios:\n${error.message}`);
        }
    });

    deleteViajeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/viajes/${currentViajeId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('Error al eliminar el viaje');
            deleteViajeModal.hide();
            loadMisViajes();
        } catch (error) {
            console.error(error);
        }
    });

    // --- Lógica de Acciones de Reserva (Cancelar) ---
    misReservasContainer.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('btn-cancelar-reserva')) {
            const reservaUuid = target.dataset.reservaUuid;
            if (!reservaUuid) return;

            if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/reservas/${reservaUuid}/`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ estado: 'CANCELADA' })
                    });

                    if (!response.ok) throw new Error('Error al cancelar la reserva');
                    
                    // Recargar solo la lista de reservas
                    loadMisReservas();
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudo cancelar la reserva.');
                }
            }
        }
    });

    // --- Lógica de Acciones de Solicitud (Aceptar/Rechazar) ---
    async function actualizarEstadoReserva(uuid, nuevoEstado, cardElement) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/reservas/${uuid}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error al actualizar la reserva a ${nuevoEstado}`);
            }
            
            cardElement.style.transition = 'opacity 0.5s ease';
            cardElement.style.opacity = '0';
            setTimeout(() => {
                cardElement.remove();
                if (solicitudesContainer.children.length === 0) {
                    solicitudesContainer.innerHTML = '<div class="list-group-item text-center">No tienes solicitudes pendientes.</div>';
                }
            }, 500);

        } catch (error) {
            console.error('Error:', error);
            alert(`No se pudo ${nuevoEstado === 'CONFIRMADA' ? 'aceptar' : 'rechazar'} la solicitud. Razón: ${error.message}`);
        }
    }

    solicitudesContainer.addEventListener('click', function(e) {
        const target = e.target;
        const uuid = target.dataset.reservaUuid;
        if (!uuid) return;

        const cardElement = target.closest('.list-group-item');

        if (target.classList.contains('btn-aceptar-solicitud')) {
            actualizarEstadoReserva(uuid, 'CONFIRMADA', cardElement);
        }

        if (target.classList.contains('btn-rechazar-solicitud')) {
            actualizarEstadoReserva(uuid, 'CANCELADA', cardElement);
        }
    });

    // --- Inicialización ---
    async function initializeMisViajes() {
        if (accessToken) {
            try {
                // Cargar localidades primero
                todasLasLocalidades = await window.getLocalidades();
                console.log('Localidades cargadas en misviajes.js:', todasLasLocalidades);

                // Inicializar los campos de localidad para el modal de edición
                window.initializeLocalityInput('edit-origen-input', '#editViajeModal .dropdown-menu[aria-labelledby="edit-origen-input"]');
                window.initializeLocalityInput('edit-destino-input', '#editViajeModal .dropdown-menu[aria-labelledby="edit-destino-input"]');

            } catch (error) {
                console.error('Error al inicializar las localidades en misviajes.js:', error);
                // Opcional: mostrar un error al usuario
            }
            
            // Luego cargar los viajes
            loadMisViajes();
        }
    }

    initializeMisViajes();
});
