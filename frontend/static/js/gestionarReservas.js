document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('access');
    const reservasContainer = document.getElementById('reservas-pendientes-container');

    if (!token) {
        console.log("Usuario no autenticado. No se pueden cargar las reservas pendientes.");
        return;
    }

    // Función para cargar y mostrar las reservas pendientes
    async function cargarReservasPendientes() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/reservas/pendientes/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener las reservas pendientes.');
            }

            const reservas = await response.json();

            if (reservas.length === 0) {
                reservasContainer.innerHTML = '<p class="text-white-50">No tienes reservas pendientes.</p>';
                return;
            }

            reservasContainer.innerHTML = ''; // Limpiar el contenedor
            reservas.forEach(reserva => {
                const reservaCard = document.createElement('div');
                reservaCard.className = 'card bg-dark text-white mb-3';
                reservaCard.id = `reserva-${reserva.uuid}`;
                
                reservaCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">Viaje a ${reserva.viaje.destino}</h5>
                        <p class="card-text">Pasajero: ${reserva.usuario.nombre} ${reserva.usuario.apellido}</p>
                        <p class="card-text">Asientos solicitados: ${reserva.cantidad_asientos}</p>
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-success btn-sm me-2" data-uuid="${reserva.uuid}" data-action="CONFIRMADA">Aceptar</button>
                            <button class="btn btn-danger btn-sm" data-uuid="${reserva.uuid}" data-action="CANCELADA">Rechazar</button>
                        </div>
                    </div>
                `;
                reservasContainer.appendChild(reservaCard);
            });

        } catch (error) {
            console.error('Error:', error);
            reservasContainer.innerHTML = '<p class="text-danger">No se pudieron cargar las reservas.</p>';
        }
    }

    // Función para gestionar una reserva (aceptar/rechazar)
    async function gestionarReserva(uuid, nuevoEstado) {
        const token = localStorage.getItem('access'); // Asegurarse de tener el token
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/reservas/${uuid}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                throw new Error('No se pudo actualizar la reserva.');
            }

            // Si la actualización fue exitosa, elimina la tarjeta de la vista
            const reservaCard = document.getElementById(`reserva-${uuid}`);
            if (reservaCard) {
                reservaCard.remove();
            }
            
            // Opcional: si no quedan reservas, mostrar el mensaje
            if (reservasContainer.children.length === 0) {
                reservasContainer.innerHTML = '<p class="text-white-50">No tienes reservas pendientes.</p>';
            }

        } catch (error) {
            console.error('Error al gestionar la reserva:', error);
        }
    }

    // Event listener para los botones de aceptar/rechazar
    reservasContainer.addEventListener('click', function (event) {
        const target = event.target;
        if (target.tagName === 'BUTTON' && target.dataset.uuid) {
            const uuid = target.dataset.uuid;
            const action = target.dataset.action;
            gestionarReserva(uuid, action);
        }
    });

    // Cargar las reservas al iniciar
    cargarReservasPendientes();
});
