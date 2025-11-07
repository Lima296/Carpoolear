// Paso 1: Definir las coordenadas (Lng, Lat)
const origen = '-60.6393,-32.9468'; // Rosario
const destino = '-64.1887,-31.4167'; // Córdoba

// Paso 2: Construir la URL
const apiUrl = 'http://router.project-osrm.org/route/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?overview=false'

// Paso 3: Hacer la solicitud y procesar la respuesta
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Verificar si la ruta es válida
    if (data.code !== 'Ok' || data.routes.length === 0) {
      console.error('Error al calcular la ruta:', data.code);
      return;
    }

    const route = data.routes[0];
    
    // Obtener valores
    const distanciaMetros = route.distance;
    const duracionSegundos = route.duration;
    
    // Conversiones
    const distanciaKM = (distanciaMetros / 1000).toFixed(1);
    const duracionHoras = (duracionSegundos / 3600).toFixed(1);

    console.log(`✅ ¡Recorrido Calculado!`);
    console.log(`Distancia: ${distanciaKM} km`);
    console.log(`Tiempo Aprox.: ${duracionHoras} horas`);
  })
  .catch(error => {
    console.error('Ocurrió un error en la conexión:', error);
  });