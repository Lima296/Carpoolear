document.addEventListener('DOMContentLoaded', function () {
    const verMiViajeModal = document.getElementById('verMiViajeModal');

    if (verMiViajeModal) {
        verMiViajeModal.addEventListener('show.bs.modal', async function (event) {
            const button = event.relatedTarget;
            const viajeId = button.getAttribute('data-viaje-id');

            const feedbackContainer = document.getElementById('modal-mi-viaje-feedback');
            const contenidoContainer = document.getElementById('modal-mi-viaje-contenido');
            const pasajerosContainer = document.getElementById('lista-pasajeros-container');
            
            // Resetear modal
            feedbackContainer.innerHTML = '';
            pasajerosContainer.innerHTML = '<p class="text-muted">Cargando pasajeros...</p>';

            try {
                // Cargar detalles del viaje y pasajeros en paralelo
                const [viajeData, pasajerosData] = await Promise.all([
                    fetchViaje(viajeId),
                    fetchPasajeros(viajeId)
                ]);

                // Poblar detalles del viaje
                document.getElementById('mi-viaje-origen').textContent = viajeData.origen;
                document.getElementById('mi-viaje-destino').textContent = viajeData.destino;
                document.getElementById('mi-viaje-fecha').textContent = viajeData.fecha;
                document.getElementById('mi-viaje-hora').textContent = viajeData.hora.substring(0, 5);

                const hoy = new Date();
                const fechaViaje = new Date(viajeData.fecha);
                let estado = 'Creado';

                hoy.setHours(0, 0, 0, 0);
                fechaViaje.setHours(0, 0, 0, 0);

                if (fechaViaje < hoy) {
                    estado = 'Finalizado';
                } else if (fechaViaje.getTime() === hoy.getTime()) {
                    estado = 'En Curso';
                }
                document.getElementById('mi-viaje-estado').textContent = estado;

                // Poblar lista de pasajeros
                renderPasajeros(pasajerosData, pasajerosContainer);

            } catch (error) {
                feedbackContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
            }
        });

        // Listener para quitar pasajeros (usando delegación de eventos)
        const pasajerosContainer = document.getElementById('lista-pasajeros-container');
        pasajerosContainer.addEventListener('click', async function(event) {
            if (event.target.classList.contains('quitar-pasajero-btn')) {
                const boton = event.target;
                const reservaUuid = boton.getAttribute('data-reserva-uuid');
                
                boton.disabled = true;
                boton.textContent = 'Quitando...';

                try {
                    await deleteReserva(reservaUuid);
                    // Eliminar el elemento de la lista en la UI
                    boton.closest('.list-group-item').remove();

                    // Si no quedan pasajeros, mostrar mensaje
                    if (pasajerosContainer.children.length === 0) {
                        pasajerosContainer.innerHTML = '<p class="text-muted">No hay pasajeros confirmados en este viaje.</p>';
                    }

                } catch (error) {
                    alert(`Error al quitar el pasajero: ${error.message}`);
                    boton.disabled = false;
                    boton.textContent = 'Quitar';
                }
            }
        });
    }
});

async function fetchViaje(viajeId) {
    const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`);
    if (!response.ok) throw new Error('No se pudieron cargar los detalles del viaje.');
    return await response.json();
}

async function fetchPasajeros(viajeId) {
    const token = localStorage.getItem('access');
    const response = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/reservas/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudieron cargar los pasajeros.');
    return await response.json();
}

function renderPasajeros(pasajeros, container) {
    container.innerHTML = '';
    if (pasajeros.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay pasajeros confirmados en este viaje.</p>';
        return;
    }

    const lista = document.createElement('ul');
    lista.className = 'list-group';

    pasajeros.forEach(reserva => {
        const pasajero = reserva.usuario;
        const item = document.createElement('li');
        item.className = 'list-group-item text-white d-flex justify-content-between align-items-center';
        item.style.backgroundColor = '#024873';
        item.innerHTML = `
            <div>
                <strong>${pasajero.nombre} ${pasajero.apellido} (${reserva.cantidad_asientos} ${reserva.cantidad_asientos > 1 ? 'cupos' : 'cupo'})</strong>
                <br>
                <small>Tel: ${pasajero.telefono || 'No especificado'}</small>
            </div>
            <button class="btn btn-danger btn-sm quitar-pasajero-btn" data-reserva-uuid="${reserva.uuid}">Quitar</button>
        `;
        lista.appendChild(item);
    });

    container.appendChild(lista);
}

async function deleteReserva(reservaUuid) {
    const token = localStorage.getItem('access');
    const response = await fetch(`http://127.0.0.1:8000/api/reservas/${reservaUuid}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        // Intenta parsear el error del cuerpo si es posible
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Error del servidor: ${response.status}`);
    }
    // No se espera contenido en una respuesta 204, así que no se parsea JSON
    return true;
}
