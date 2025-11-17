document.addEventListener("DOMContentLoaded", function() {
    // 1. Obtenemos el token de acceso desde localStorage
    const accessToken = localStorage.getItem('access');

    // Si no hay token, no podemos continuar.
    if (!accessToken) {
        console.error('Error: No se encontró el token de acceso. El usuario debe iniciar sesión.');
        // Opcionalmente, podrías redirigir al login.
        // window.location.href = '/login'; 
        return;
    }

    // 2. Preparamos los datos de la reserva. 
    //    Ya no es necesario enviar 'pasajero', el backend lo identificará con el token.
    const reservaData = {
        viaje: 1, // ID del viaje al que te quieres unir
        asientos_reservados: 1 // Cantidad de asientos a reservar
    };

    // 3. Realizamos la petición POST con el token en la cabecera
    fetch('http://127.0.0.1:8000/api/reservas/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Añadimos la cabecera de autorización con el token
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(reservaData)
    })
    .then(response => {
        if (response.status === 401) {
            // Manejo de token expirado o inválido
            console.error('Error de autorización: El token puede haber expirado.');
            // Aquí podrías implementar la lógica para refrescar el token si tienes un endpoint para ello.
            throw new Error('No autorizado');
        }
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Reserva solicitada con éxito:', data);
    })
    .catch(error => {
        console.error('Error al crear la reserva:', error);
    });
});