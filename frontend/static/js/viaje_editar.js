document.addEventListener('DOMContentLoaded', function() {
    const viajeId = JSON.parse(document.getElementById('viaje_id').textContent);
    const viajeUrl = `http://127.0.0.1:8000/api/viajes/${viajeId}/`;
    const localidadesUrl = 'http://127.0.0.1:8000/api/localidad/';
    const accessToken = localStorage.getItem('access');

    const origenSelect = document.getElementById('origen');
    const destinoSelect = document.getElementById('destino');
    const fechaInput = document.getElementById('fecha');
    const horaInput = document.getElementById('hora');
    const precioInput = document.getElementById('precio');
    const asientosInput = document.getElementById('asientos');
    const form = document.getElementById('edit-viaje-form');

    if (!accessToken) {
        window.location.href = '/';
        return;
    }

    async function loadViajeData() {
        try {
            // 1. Obtener datos del viaje y de las localidades en paralelo
            const [viajeResponse, localidadesResponse] = await Promise.all([
                fetch(viajeUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                fetch(localidadesUrl)
            ]);

            if (!viajeResponse.ok || !localidadesResponse.ok) {
                throw new Error('Error al cargar los datos necesarios para la edición.');
            }

            const viaje = await viajeResponse.json();
            const localidades = await localidadesResponse.json();

            // 2. Poblar los campos de texto del formulario
            fechaInput.value = viaje.fecha;
            horaInput.value = viaje.hora;
            precioInput.value = viaje.precio;
            asientosInput.value = viaje.asientos_disponibles;

            // 3. Poblar los <select> de origen y destino
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

        } catch (error) {
            console.error(error);
            // Manejar el error en la UI si es necesario
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        const updatedViaje = {
            origen: origenSelect.value,
            destino: destinoSelect.value,
            fecha: fechaInput.value,
            hora: horaInput.value,
            precio: precioInput.value,
            asientos_disponibles: asientosInput.value
        };

        try {
            const response = await fetch(viajeUrl, {
                method: 'PUT', // o PATCH si la API lo permite
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(updatedViaje)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al guardar:', errorData);
                throw new Error('Error al guardar los cambios');
            }

            window.location.href = '/misviajes/'; // Redirigir a la página de mis viajes
        } catch (error) {
            console.error(error);
        }
    }

    loadViajeData();
    form.addEventListener('submit', handleFormSubmit);
});