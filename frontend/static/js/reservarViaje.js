document.addEventListener('DOMContentLoaded', function () {
    const reservarViajeModal = document.getElementById('reservarViajeModal');
    
    if (reservarViajeModal) {
        const btnSolicitarAsiento = document.getElementById('btn-solicitar-asiento');
        const inputAsientos = document.getElementById('cantidadAsientos');

        // --- Lógica para obtener datos y poblar el modal ---
        reservarViajeModal.addEventListener('show.bs.modal', async function (event) {
            // ... (código para resetear y mostrar "Cargando...")
            const modalViajeContenido = document.getElementById('modal-viaje-contenido');
            const modalFeedback = document.getElementById('modal-reserva-feedback');
            modalViajeContenido.style.display = 'block';
            modalFeedback.style.display = 'none';
            btnSolicitarAsiento.disabled = true;
            document.getElementById('modal-conductor-nombre').textContent = 'Cargando...';
            document.getElementById('modal-viaje-origen').textContent = 'Cargando...';
            document.getElementById('modal-viaje-destino').textContent = 'Cargando...';

            const button = event.relatedTarget;
            const viajeId = button.getAttribute('data-viaje-id');
            btnSolicitarAsiento.setAttribute('data-viaje-id', viajeId);

            try {
                const viajeResponse = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`);
                if (!viajeResponse.ok) throw new Error(`Error al cargar el viaje (${viajeResponse.status})`);
                const viajeData = await viajeResponse.json();

                const conductorId = viajeData.conductor;
                if (!conductorId) throw new Error('El viaje no tiene un conductor asignado.');

                const conductorResponse = await fetch(`http://127.0.0.1:8000/api/usuarios/${conductorId}/`);
                if (!conductorResponse.ok) throw new Error(`Error al cargar el conductor (${conductorResponse.status})`);
                const conductorData = await conductorResponse.json();

                document.getElementById('modal-conductor-nombre').textContent = `${conductorData.nombre} ${conductorData.apellido}`;
                document.getElementById('modal-viaje-origen').textContent = viajeData.origen;
                document.getElementById('modal-viaje-destino').textContent = viajeData.destino;
                document.getElementById('modal-viaje-fecha').textContent = viajeData.fecha;
                document.getElementById('modal-viaje-hora').textContent = viajeData.hora ? viajeData.hora.substring(0, 5) + ' HS' : 'N/A';
                document.getElementById('modal-viaje-precio').textContent = `$ ${parseFloat(viajeData.precio).toFixed(2)}`;

                inputAsientos.value = 1;
                inputAsientos.max = viajeData.asientos_disponibles;
                inputAsientos.min = 1;

                btnSolicitarAsiento.disabled = false;

            } catch (error) {
                console.error("Error al poblar el modal:", error);
                mostrarFeedback(error.message, 'danger', false);
            }
        });

        // --- Listener para el botón de solicitar ---
        btnSolicitarAsiento.addEventListener('click', async function () {
            const viajeId = this.getAttribute('data-viaje-id');
            const asientosSolicitados = parseInt(inputAsientos.value, 10);
            
            this.disabled = true;
            await realizarReserva(viajeId, asientosSolicitados);
        });
    }

    // --- Funciones auxiliares ---

    async function getUsuarioId() {
        const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
        const accessToken = localStorage.getItem('access');
        if (!accessToken) return null;

        try {
            const response = await fetch(userProfileUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error('Error fetching user ID:', error);
            return null;
        }
    }

    async function realizarReserva(viajeId, asientos) {
        const accessToken = localStorage.getItem('access');
        if (!accessToken) {
            mostrarFeedback('Error: Debes iniciar sesión para poder reservar.', 'danger');
            document.getElementById('btn-solicitar-asiento').disabled = false;
            return;
        }

        // Novedad: Obtenemos el ID del usuario logueado
        const usuarioId = await getUsuarioId();
        if (!usuarioId) {
            mostrarFeedback('Error: No se pudo verificar tu identidad para realizar la reserva.', 'danger');
            document.getElementById('btn-solicitar-asiento').disabled = false;
            return;
        }

        const reservaData = {
            viaje: viajeId,
            cantidad_asientos: asientos,
            usuario: usuarioId // <-- CAMPO AÑADIDO
        };

        fetch('http://127.0.0.1:8000/api/reservas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(reservaData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || JSON.stringify(err)); });
            }
            return response.json();
        })
        .then(data => {
            mostrarFeedback('¡Reserva realizada con éxito! El conductor ha sido notificado.', 'success');
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('reservarViajeModal'));
                if (modal) modal.hide();
            }, 2500);
        })
        .catch(error => {
            mostrarFeedback(error.message, 'danger');
            document.getElementById('btn-solicitar-asiento').disabled = false;
        });
    }

    function mostrarFeedback(mensaje, tipo, ocultarContenido = true) {
        const modalViajeContenido = document.getElementById('modal-viaje-contenido');
        const modalFeedback = document.getElementById('modal-reserva-feedback');
        if (ocultarContenido) {
            modalViajeContenido.style.display = 'none';
        }
        modalFeedback.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
        modalFeedback.style.display = 'block';
    }
});
