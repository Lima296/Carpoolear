document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('access');

    if (token) {
        cargarReportes(token);
    } else {
        console.error('No se encontró el token de autenticación. Redirigiendo a /inicio/');
        window.location.href = '/inicio/';
    }
});

async function cargarReportes(token) {
    try {
        const [viajesConductor, reservaspasajero] = await Promise.all([
            fetch('http://127.0.0.1:8000/api/mis-viajes/', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(response => response.json()),
            fetch('http://127.0.0.1:8000/api/mis-reservas/', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(response => response.json())
        ]);

        mostrarReporteGeneral(viajesConductor, reservaspasajero);
        mostrarViajesConductor(viajesConductor);
        mostrarViajesAcompanante(reservaspasajero);

    } catch (error) {
        console.error('Error al cargar los reportes:', error);
    }
}

function formatTiempo(minutos) {
    if (!minutos) return '0m';
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
}

function mostrarReporteGeneral(viajesConductor, reservaspasajero) {
    const container = document.getElementById('reportes-todos-container');
    
    const totalViajes = viajesConductor.length + reservaspasajero.length;
    
    let totalKmGeneral = 0;
    let totalTiempoGeneral = 0;

    // Sumar estadísticas de viajes como conductor
    viajesConductor.forEach(viaje => {
        totalKmGeneral += parseFloat(viaje.distancia || 0);
        totalTiempoGeneral += parseInt(viaje.tiempo || 0, 10);
    });

    // Sumar estadísticas de viajes como acompañante
    reservaspasajero.forEach(reserva => {
        const viaje = reserva.viaje;
        totalKmGeneral += parseFloat(viaje.distancia || 0);
        totalTiempoGeneral += parseInt(viaje.tiempo || 0, 10);
    });

    const totalDineroConductor = viajesConductor.reduce((sum, viaje) => sum + parseFloat(viaje.precio || 0), 0);

    container.innerHTML = `
        <div class="report-item">
            <h5>Reporte General</h5>
            <p>Total de viajes: <span>${totalViajes}</span></p>
            <p>Kilómetros recorridos: <span>${totalKmGeneral.toFixed(2)} km</span></p>
            <p>Tiempo viajado: <span>${formatTiempo(totalTiempoGeneral)}</span></p>
            <p>Dinero recaudado: <span>${totalDineroConductor.toFixed(2)}</span></p>
        </div>
    `;
}

function mostrarViajesConductor(viajes) {
    const container = document.getElementById('reportes-conductor-container');
    if (viajes.length === 0) {
        container.innerHTML = '<li class="list-group-item">No has realizado ningún viaje como conductor.</li>';
        return;
    }

    const totalKm = viajes.reduce((sum, viaje) => sum + parseFloat(viaje.distancia || 0), 0);
    const totalTiempo = viajes.reduce((sum, viaje) => sum + parseInt(viaje.tiempo || 0, 10), 0);
    const totalDinero = viajes.reduce((sum, viaje) => sum + parseFloat(viaje.precio || 0), 0);

    let summaryHtml = `
        <div class="report-item mb-4">
            <h5>Resumen como Conductor</h5>
            <p>Total de viajes: <span>${viajes.length}</span></p>
            <p>Kilómetros recorridos: <span>${totalKm.toFixed(2)} km</span></p>
            <p>Tiempo viajado: <span>${formatTiempo(totalTiempo)}</span></p>
            <p>Dinero recaudado: <span>${totalDinero.toFixed(2)}</span></p>
        </div>
        <hr>
    `;

    let listHtml = '';
    viajes.forEach(viaje => {
        listHtml += `
            <li class="list-group-item">
                <strong>${viaje.origen.nombre} → ${viaje.destino.nombre}</strong> - ${viaje.fecha}
                <p>Distancia: ${parseFloat(viaje.distancia || 0).toFixed(2)} km, Tiempo: ${formatTiempo(viaje.tiempo)}, Precio: ${viaje.precio}</p>
            </li>
        `;
    });
    container.innerHTML = summaryHtml + `<ul class="list-group">${listHtml}</ul>`;
}

function mostrarViajesAcompanante(reservas) {
    const container = document.getElementById('reportes-acompanante-container');
    if (reservas.length === 0) {
        container.innerHTML = '<li class="list-group-item">No has participado en ningún viaje como acompañante.</li>';
        return;
    }

    const viajes = reservas.map(r => r.viaje);
    const totalKm = viajes.reduce((sum, viaje) => sum + parseFloat(viaje.distancia || 0), 0);
    const totalTiempo = viajes.reduce((sum, viaje) => sum + parseInt(viaje.tiempo || 0, 10), 0);

    let summaryHtml = `
        <div class="report-item mb-4">
            <h5>Resumen como Acompañante</h5>
            <p>Total de viajes: <span>${reservas.length}</span></p>
            <p>Kilómetros recorridos: <span>${totalKm.toFixed(2)} km</span></p>
            <p>Tiempo viajado: <span>${formatTiempo(totalTiempo)}</span></p>
        </div>
        <hr>
    `;

    let listHtml = '';
    reservas.forEach(reserva => {
        const viaje = reserva.viaje;
        listHtml += `
            <li class="list-group-item">
                <strong>${viaje.origen.nombre} → ${viaje.destino.nombre}</strong> - ${viaje.fecha}
                <p>Conductor: ${viaje.conductor.nombre} ${viaje.conductor.apellido}</p>
            </li>
        `;
    });
    container.innerHTML = summaryHtml + `<ul class="list-group">${listHtml}</ul>`;
}