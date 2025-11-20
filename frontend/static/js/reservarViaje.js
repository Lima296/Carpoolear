document.addEventListener('DOMContentLoaded', function () {
    // --- Función para formatear precios ---
    function formatPriceWithDot(price) {
        if (price === null || isNaN(parseFloat(price))) {
            return 'N/A';
        }
        const number = Math.round(parseFloat(price));
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // --- Función para formatear tiempo ---
    function formatTime(minutes) {
        if (minutes === null || isNaN(parseInt(minutes))) {
            return 'No disponible';
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        let result = '';
        if (hours > 0) {
            result += `${hours} h `;
        }
        if (mins > 0) {
            result += `${mins} min`;
        }
        return result.trim() || 'Menos de 1 min';
    }

    const reservarViajeModal = document.getElementById('reservarViajeModal');
    
    if (reservarViajeModal) {
        const btnSolicitarAsiento = document.getElementById('btn-solicitar-asiento');
        const inputAsientos = document.getElementById('cantidadAsientos');

        // --- Lógica para obtener datos y poblar el modal ---
        reservarViajeModal.addEventListener('show.bs.modal', async function (event) {
            const modalViajeContenido = document.getElementById('modal-viaje-contenido');
            const modalFeedback = document.getElementById('modal-reserva-feedback');
            modalViajeContenido.style.display = 'block';
            modalFeedback.style.display = 'none';
            btnSolicitarAsiento.disabled = true;
            document.getElementById('modal-conductor-nombre').textContent = 'Cargando...';
            document.getElementById('modal-viaje-origen').textContent = 'Cargando...';
            document.getElementById('modal-viaje-destino').textContent = 'Cargando...';
            document.getElementById('modal-viaje-distancia').textContent = 'Calculando...';
            document.getElementById('modal-viaje-tiempo').textContent = 'Calculando...';
            document.getElementById('modal-viaje-asientos-disponibles').textContent = 'Cargando...'; // Reset available seats

            const button = event.relatedTarget;
            const viajeId = button.getAttribute('data-viaje-id');
            btnSolicitarAsiento.setAttribute('data-viaje-id', viajeId);

            try {
                // 1. Obtener los datos del viaje (que ya incluyen todo)
                const viajeResponse = await fetch(`http://127.0.0.1:8000/api/viajes/${viajeId}/`);
                if (!viajeResponse.ok) throw new Error(`Error al cargar el viaje (${viajeResponse.status})`);
                const viajeData = await viajeResponse.json();

                const conductorId = viajeData.conductor.id;
                if (!conductorId) throw new Error('El viaje no tiene un conductor asignado.');
                // 2. Usar los datos anidados directamente
                const conductorData = viajeData.conductor;
                if (!conductorData) throw new Error('El viaje no tiene un conductor asignado.');

                // 3. Poblar el modal con los datos correctos
                const conductorNombreEl = document.getElementById('modal-conductor-nombre');
                if (conductorNombreEl) {
                    conductorNombreEl.innerHTML = `<a href="/perfil/usuario/${conductorData.id}/" target="_blank">${conductorData.nombre} ${conductorData.apellido}</a>`;
                }

                const origenEl = document.getElementById('modal-viaje-origen');
                if (origenEl) origenEl.textContent = viajeData.origen.nombre;

                const destinoEl = document.getElementById('modal-viaje-destino');
                if (destinoEl) destinoEl.textContent = viajeData.destino.nombre;

                const fechaEl = document.getElementById('modal-viaje-fecha');
                if (fechaEl) fechaEl.textContent = viajeData.fecha;

                const horaEl = document.getElementById('modal-viaje-hora');
                if (horaEl) horaEl.textContent = viajeData.hora ? viajeData.hora.substring(0, 5) + ' HS' : 'N/A';
                
                const distanciaEl = document.getElementById('modal-viaje-distancia');
                if (distanciaEl) {
                    distanciaEl.textContent = viajeData.distancia ? `${parseFloat(viajeData.distancia).toFixed(1)} km` : 'No disponible';
                }

                const tiempoEl = document.getElementById('modal-viaje-tiempo');
                if (tiempoEl) {
                    tiempoEl.textContent = formatTime(viajeData.tiempo);
                }

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
                
                const estadoEl = document.getElementById('modal-viaje-estado');
                if (estadoEl) estadoEl.textContent = estado;

                const precioEl = document.getElementById('modal-viaje-precio');
                if (precioEl) precioEl.textContent = `$ ${formatPriceWithDot(viajeData.precio)}`;

                const detallesEl = document.getElementById('modal-viaje-detalles');
                if (detallesEl) detallesEl.textContent = viajeData.detalle_viaje || 'No hay detalles disponibles.';

                const asientosEl = document.getElementById('modal-viaje-asientos-disponibles');
                if (asientosEl) asientosEl.textContent = viajeData.asientos_disponibles ?? '0'; // Populate available seats

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
            const asientosDisponibles = parseInt(inputAsientos.max, 10); // Get max available seats

            if (asientosSolicitados < 1) {
                mostrarFeedback('Los asientos deben ser 1 o más.', 'danger', false);
                return;
            }

            if (asientosSolicitados > asientosDisponibles) { // New validation
                mostrarFeedback('Supera la cantidad de asientos disponibles.', 'danger', false);
                return;
            }
            
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
            mostrarFeedback('Error: Tenés que iniciar sesión para poder reservar.', 'danger');
            document.getElementById('btn-solicitar-asiento').disabled = false;
            return;
        }

        // Novedad: Obtenemos el ID del usuario logueado
        const usuarioId = await getUsuarioId();
        if (!usuarioId) {
            mostrarFeedback('Error: No se pudo verificar la identidad para realizar la reserva.', 'danger');
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
        .then(async response => {
            if (!response.ok) {
                const err = await response.json();
                let errorMessages = '<ul>';
                for (const key in err) {
                    if (err.hasOwnProperty(key)) {
                        // err[key] es un array de strings de error
                        err[key].forEach(message => {
                            errorMessages += `<li>${message}</li>`;
                        });
                    }
                }
                errorMessages += '</ul>';
                throw new Error(errorMessages);
            }
            return response.json();
        })
        .then(data => {
            const telefonoConductor = data.viaje?.conductor?.telefono;
            let urlWhatsapp = '#'; // URL por defecto

            if (telefonoConductor) {
                const mensaje = `Hola ${data.viaje.conductor.nombre}, te he enviado una solicitud de reserva para tu viaje a ${data.viaje.destino}. Puedes gestionarla desde tu perfil: http://127.0.0.1:5500/miperfil/`;
                urlWhatsapp = `https://wa.me/${telefonoConductor}?text=${encodeURIComponent(mensaje)}`;
            }

            // Mostrar mensaje de éxito con el botón de WhatsApp
            const feedbackHtml = `
                <div class="alert alert-success">¡Reserva realizada con éxito!</div>
                <p class="text-center mt-3">Contactá al conductor para coordinar.</p>
                <button id="btn-enviar-whatsapp" class="btn btn-success w-100 mt-2">Enviar WhatsApp</button>
            `;
            mostrarFeedback(feedbackHtml, 'success');

            // Añadir el listener al nuevo botón
            const btnWhatsapp = document.getElementById('btn-enviar-whatsapp');
            if (btnWhatsapp) {
                if (telefonoConductor) {
                    btnWhatsapp.addEventListener('click', () => {
                        window.location.href = urlWhatsapp;
                    });
                } else {
                    btnWhatsapp.textContent = 'No se pudo obtener contacto';
                    btnWhatsapp.disabled = true;
                }
            }
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
