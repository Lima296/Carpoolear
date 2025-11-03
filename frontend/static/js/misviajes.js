document.addEventListener('DOMContentLoaded', function() {
    const misViajesContainer = document.getElementById('mis-viajes-container');

    // Function to get the JWT token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const accessToken = getCookie('access_token');

    if (accessToken) {
        fetch('/api/misviajes/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                misViajesContainer.innerHTML = '<p>No has creado ningún viaje.</p>';
                return;
            }

            data.forEach(viaje => {
                const viajeCard = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${viaje.origen} a ${viaje.destino}</h5>
                            <p class="card-text">Fecha: ${viaje.fecha}</p>
                            <p class="card-text">Hora: ${viaje.hora}</p>
                            <p class="card-text">Asientos disponibles: ${viaje.asientos_disponibles}</p>
                            <p class="card-text">Precio: ${viaje.precio}</p>
                        </div>
                    </div>
                `;
                misViajesContainer.innerHTML += viajeCard;
            });
        })
        .catch(error => {
            console.error('Error fetching mis viajes:', error);
            misViajesContainer.innerHTML = '<p>Error al cargar los viajes. Por favor, inténtalo de nuevo más tarde.</p>';
        });
    } else {
        misViajesContainer.innerHTML = '<p>Debes iniciar sesión para ver tus viajes.</p>';
    }
});