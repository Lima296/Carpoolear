document.addEventListener('DOMContentLoaded', function() {
    const viajeId = JSON.parse(document.getElementById('viaje_id').textContent);
    const viajeUrl = `http://127.0.0.1:8000/api/viajes/${viajeId}/`;
    const accessToken = localStorage.getItem('access');

    const origenInput = document.getElementById('origen');
    const destinoInput = document.getElementById('destino');
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
            const response = await fetch(viajeUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar los datos del viaje');
            const viaje = await response.json();

            origenInput.value = viaje.origen;
            destinoInput.value = viaje.destino;
            fechaInput.value = viaje.fecha;
            horaInput.value = viaje.hora;
            precioInput.value = viaje.precio;
            asientosInput.value = viaje.asientos_disponibles;
        } catch (error) {
            console.error(error);
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        const updatedViaje = {
            origen: origenInput.value,
            destino: destinoInput.value,
            fecha: fechaInput.value,
            hora: horaInput.value,
            precio: precioInput.value,
            asientos_disponibles: asientosInput.value
        };

        try {
            const response = await fetch(viajeUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(updatedViaje)
            });

            if (!response.ok) throw new Error('Error al guardar los cambios');

            window.location.href = '/miperfil/'; // Redirigir a la página de perfil
        } catch (error) {
            console.error(error);
        }
    }

    loadViajeData();
    form.addEventListener('submit', handleFormSubmit);
});