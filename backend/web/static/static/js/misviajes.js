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

    // --- Modales ---
    const editViajeModalEl = document.getElementById('editViajeModal');
    const editViajeModal = new bootstrap.Modal(editViajeModalEl);
    const editViajeForm = document.getElementById('edit-viaje-form');
    const deleteViajeModalEl = document.getElementById('deleteViajeModal');
    const deleteViajeModal = new bootstrap.Modal(deleteViajeModalEl);
    const deleteViajeForm = document.getElementById('delete-viaje-form');
    const verPasajerosModalEl = document.getElementById('verPasajerosModal');
    const verPasajerosModal = new bootstrap.Modal(verPasajerosModalEl);
    const calificarViajeModalEl = document.getElementById('calificarViajeModal');
    const calificarViajeModal = new bootstrap.Modal(calificarViajeModalEl);
    const calificarViajeForm = document.getElementById('calificar-viaje-form');
    let currentViajeId = null;

    // --- Función para formatear precios ---
    function formatPriceWithDot(price) {
        if (price === null || isNaN(parseFloat(price))) {
            return 'N/A';
        }
        const number = Math.round(parseFloat(price));
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // --- Función para formatear fechas ---
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    // --- Creación de filas y tarjetas ---
    function crearFilaViaje(viaje) {
        const origen = (viaje.origen && viaje.origen.nombre) ? viaje.origen.nombre : 'N/A';
        const destino = (viaje.destino && viaje.destino.nombre) ? viaje.destino.nombre : 'N/A';
        const fecha = formatDate(viaje.fecha); // Aplicar formato
        const hora = viaje.hora ? viaje.hora.substring(0, 5) + ' HS' : 'N/A';
        const precio = viaje.precio ? `$${formatPriceWithDot(viaje.precio)}` : 'N/A';
        const asientos = viaje.asientos_disponibles !== undefined ? viaje.asientos_disponibles : 'N/A';
        const estado = viaje.estado || 'N/A';

        let botonesAccion = `
            <button class="btn btn-brand-secondary-outline ver-pasajeros-btn" data-viaje-id="${viaje.id}">Ver Pasajeros</button>
        `;

        if (viaje.estado !== 'Finalizado') {
            botonesAccion += `
                <button class="btn btn-brand-secondary-outline edit-viaje-btn" data-viaje-id="${viaje.id}">Editar</button>
                <button class="btn btn-outline-danger delete-viaje-btn" data-viaje-id="${viaje.id}">Eliminar</button>
            `;
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
                    ${botonesAccion}
                </div>
            </li>`
        );
    }

    function crearFilaReserva(reserva) {
        const viaje = reserva.viaje;
        if (!viaje) return '';

        const origen = (viaje.origen && viaje.origen.nombre) ? viaje.origen.nombre : 'N/A';
        const destino = (viaje.destino && viaje.destino.nombre) ? viaje.destino.nombre : 'N/A';
        const fecha = formatDate(viaje.fecha); // Aplicar formato
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

        const hoy = new Date();
        const fechaViaje = new Date(viaje.fecha);
        hoy.setHours(0, 0, 0, 0);
        fechaViaje.setHours(0, 0, 0, 0);
        const esViajePasado = fechaViaje < hoy;

        let botonesAccion = '';
        
        if (viaje.estado !== 'Finalizado' && reserva.estado !== 'CANCELADA') {
            botonesAccion += `<button class="btn btn-outline-danger btn-cancelar-reserva" data-reserva-uuid="${reserva.uuid}">Cancelar Reserva</button>`;
        }

        if (reserva.estado === 'CONFIRMADA' && esViajePasado) {
            botonesAccion += `<button class="btn btn-primary btn-calificar-viaje" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#calificarViajeModal"
                                    data-viaje-id="${viaje.id}" 
                                    data-conductor-id="${viaje.conductor.id}">
                                Calificar Conductor
                              </button>`;
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
                        <p class="mb-1 mt-2">Estado del viaje: <span class="fw-bold">${viaje.estado}</span></p>
                        <p class="mb-1">Estado de la reserva: <span class="fw-bold ${estadoClass}">${reserva.estado}</span></p>
                    </div>
                </div>
                <div class="d-flex mt-auto justify-content-end gap-2">
                    ${botonesAccion}
                </div>
            </li>`
        );
    }

    function crearCardSolicitud(solicitud) {
        const viaje = solicitud.viaje;
        const pasajero = solicitud.usuario;
        if (!viaje || !pasajero) return '';

        const origenNombre = viaje.origen ? viaje.origen.nombre : 'No especificado';
        const destinoNombre = viaje.destino ? viaje.destino.nombre : 'No especificado';
        const fecha = formatDate(viaje.fecha); // Aplicar formato

        return `
            <div class="list-group-item" id="solicitud-${solicitud.uuid}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Solicitud para: ${origenNombre} → ${destinoNombre}</h5>
                    <small>${fecha}</small>
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
    async function loadCurrentUser() {
        if (currentUser) return currentUser;
        try {
            const response = await fetch('http://127.0.0.1:8000/api/perfil/', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('No se pudo obtener el perfil del usuario.');
            currentUser = await response.json();
            return currentUser;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function loadMisViajes() {
        const url = 'http://127.0.0.1:8000/api/mis-viajes/';
        if (!misViajesContainer) return;
        misViajesContainer.innerHTML = '<li class="list-group-item text-center">Cargando mis viajes...</li>';

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const viajes = await response.json();

            // Ordenar: 'CREADO' primero, luego por fecha descendente
            viajes.sort((a, b) => {
                if (a.estado === 'CREADO' && b.estado !== 'CREADO') {
                    return -1; // a va primero
                }
                if (a.estado !== 'CREADO' && b.estado === 'CREADO') {
                    return 1; // b va primero
                }
                // Para estados iguales (o ambos no son 'CREADO'), ordenar por fecha
                return new Date(b.fecha) - new Date(a.fecha);
            });

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
                origenInput.setAttribute('data-selected-id', viaje.origen.id);
            } else {
                origenInput.value = '';
                origenInput.removeAttribute('data-selected-id');
            }

            if (viaje.destino) {
                destinoInput.value = viaje.destino.nombre;
                destinoInput.setAttribute('data-selected-id', viaje.destino.id);
            } else {
                destinoInput.value = '';
                destinoInput.removeAttribute('data-selected-id');
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
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.detail || 'Error al eliminar al pasajero.');
                    }

                    e.target.closest('.list-group-item').remove();
                    
                    const pasajerosList = document.getElementById('pasajeros-list');
                    if (pasajerosList.children.length === 0) {
                        pasajerosList.innerHTML = '<li class="list-group-item text-center">No hay pasajeros confirmados para este viaje.</li>';
                    }
                    
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
        
        const origenId = document.getElementById('edit-origen-input').getAttribute('data-selected-id');
        const destinoId = document.getElementById('edit-destino-input').getAttribute('data-selected-id');

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
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = Object.values(errorData).flat().join('\n');
                throw new Error(errorMessage || 'Error al actualizar el viaje. Por favor, revisa los datos.');
            }

            editViajeModal.hide();
            loadMisViajes();
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

    misReservasContainer.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.classList.contains('btn-cancelar-reserva')) {
            const reservaUuid = target.dataset.reservaUuid;
            if (!reservaUuid) return;

            if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/reservas/${reservaUuid}/`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'CANCELADA' })
                    });
                    if (!response.ok) throw new Error('Error al cancelar la reserva');
                    loadMisReservas();
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudo cancelar la reserva.');
                }
            }
        }

        if (target.classList.contains('btn-calificar-viaje')) {
            const viajeId = target.dataset.viajeId;
            const conductorId = target.dataset.conductorId;
            
            document.getElementById('calificacion-viaje-id').value = viajeId;
            document.getElementById('calificacion-conductor-id').value = conductorId;
        }
    });

    calificarViajeModalEl.addEventListener('click', function(e) {
        const target = e.target.closest('.calificacion-btn');
        if (target) {
            document.querySelectorAll('.calificacion-btn').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            document.getElementById('calificacion-tipo-input').value = target.dataset.tipo;
        }
    });

    calificarViajeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = await loadCurrentUser();
        if (!user) {
            alert('Error: No se pudo identificar al usuario actual.');
            return;
        }

        const viajeId = document.getElementById('calificacion-viaje-id').value;
        const conductorId = document.getElementById('calificacion-conductor-id').value;
        const tipo = document.getElementById('calificacion-tipo-input').value;
        const comentario = document.getElementById('calificacion-comentario').value;

        if (!tipo) {
            alert('Por favor, selecciona "Like" o "Dislike".');
            return;
        }

        const calificacionData = {
            calificado: conductorId,
            viaje: viajeId,
            tipo: tipo,
            comentario: comentario
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/calificaciones/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(calificacionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.non_field_errors || (errorData.detail && errorData.detail.includes("unique"))) {
                     alert('Ya has calificado este viaje.');
                } else {
                    throw new Error(JSON.stringify(errorData));
                }
            } else {
                alert('¡Gracias por tu calificación!');
            }
            
            calificarViajeModal.hide();
            const botonCalificar = document.querySelector(`.btn-calificar-viaje[data-viaje-id="${viajeId}"]`);
            if (botonCalificar) {
                botonCalificar.textContent = 'Calificado';
                botonCalificar.disabled = true;
            }

        } catch (error) {
            console.error('Error al enviar la calificación:', error);
            alert('No se pudo enviar tu calificación. Inténtalo de nuevo.');
        }
    });


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

    async function initializeMisViajes() {
        if (accessToken) {
            try {
                todasLasLocalidades = await window.getLocalidades();
                console.log('Localidades cargadas en misviajes.js:', todasLasLocalidades);

                window.initializeLocalityInput('edit-origen-input', '#editViajeModal .dropdown-menu[aria-labelledby="edit-origen-input"]');
                window.initializeLocalityInput('edit-destino-input', '#editViajeModal .dropdown-menu[aria-labelledby="edit-destino-input"]');

            } catch (error) {
                console.error('Error al inicializar las localidades en misviajes.js:', error);
            }
            
            loadMisViajes();
        }
    }

    initializeMisViajes();
});