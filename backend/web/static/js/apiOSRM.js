// apiOSRM.js

const apiOSRM = {
    /**
     * Obtiene la distancia y duración de una ruta entre dos puntos usando la API de OSRM.
     * @param {number} originLat Latitud del origen.
     * @param {number} originLon Longitud del origen.
     * @param {number} destLat Latitud del destino.
     * @param {number} destLon Longitud del destino.
     * @returns {Promise<{distance: number, duration: number}|null>} Objeto con distancia (km) y duración (min), o null si falla.
     */
    getRouteData: async function(originLat, originLon, destLat, destLon) {
        try {
            // Construir la URL de la API de OSRM con los parámetros de origen y destino
            const apiUrl = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            // Verificar si la ruta es válida
            if (data.code !== 'Ok' || data.routes.length === 0) {
                console.error('Error al calcular la ruta:', data.code);
                return null;
            }

            const route = data.routes[0];
            
            // Obtener valores
            const distanciaMetros = route.distance;
            const duracionSegundos = route.duration;
            
            // Conversiones
            const distanciaKM = distanciaMetros / 1000;
            const duracionMinutos = duracionSegundos / 60; // Convertir a minutos

            console.log(`✅ ¡Recorrido Calculado!`);
            console.log(`Distancia: ${distanciaKM.toFixed(2)} km`);
            console.log(`Tiempo Aprox.: ${duracionMinutos.toFixed(2)} minutos`);

            return {
                distance: distanciaKM,
                duration: duracionMinutos
            };
        } catch (error) {
            console.error('Ocurrió un error en la conexión con OSRM:', error);
            return null;
        }
    }
};