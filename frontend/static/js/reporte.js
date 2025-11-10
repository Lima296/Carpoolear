document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        window.location.href = '/';
        return;
    }

    const misViajesUrl = 'http://127.0.0.1:8000/api/mis-viajes/';

    async function loadReportData() {
        try {
            const response = await fetch(misViajesUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error('Error al cargar los viajes');
            const viajes = await response.json();

                        const viajesFinalizados = viajes.filter(viaje => viaje.estado === 'Finalizado');
                        const cantidadViajesRealizados = viajesFinalizados.length;
                        const kilometrosRecorridos = viajesFinalizados.reduce((total, viaje) => total + parseFloat(viaje.distancia || 0), 0);
                        const tiempoViajado = viajesFinalizados.reduce((total, viaje) => total + (viaje.tiempo || 0), 0);

                        // Convertir minutos a un formato más legible (ej. "Xh Ym")
                        const horas = Math.floor(tiempoViajado / 60);
                        const minutos = tiempoViajado % 60;
                        const tiempoFormateado = `${horas}h ${minutos}m`;
                        const reportItem = document.querySelector('.report-item');

                        if (reportItem) {
                            reportItem.querySelector('p:nth-child(2) span').textContent = cantidadViajesRealizados;
                            reportItem.querySelector('p:nth-child(3) span').textContent = `${kilometrosRecorridos.toFixed(1)} km`;
                            reportItem.querySelector('p:nth-child(4) span').textContent = tiempoFormateado;
                        }
        } catch (error) {
            console.error(error);
        }
    }
    function initialize() {
        loadReportData();
    }

    initialize();
});
