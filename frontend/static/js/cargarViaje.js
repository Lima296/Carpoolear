// ⚠️ IMPORTANTE: Define la URL base de tu API de Django aquí
// Asegúrate de que este endpoint devuelve una LISTA de viajes.
const API_LIST_URL = 'http://localhost:8000/api/viajes/';

// Elementos del DOM
const contenedorViajes = document.querySelector('.contenedor_viajes');

/**
 * Función para crear el HTML de una tarjeta de viaje.
 * @param {Object} viaje - Objeto JSON de un solo viaje de la API.
 * @returns {string} - Cadena de HTML de la tarjeta.
 */
function crearTarjetaViaje(viaje) {
    // Los paths a las imágenes estáticas deben ser manejados por el template de Django
    // pero aquí, para el DEMO dinámico, asumimos que Django ya las procesará.
    // Usaremos un placeholder simplificado para las rutas estáticas.
    
    // Función de ayuda para obtener la ruta estática (simulación en JS)
    const getStaticUrl = (path) => `${STATIC_URL_BASE}img/${path}`; 

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString + 'T00:00:00'); // Forzar a que se interprete como local
        
        const options = { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            timeZone: 'UTC' // Usar UTC para evitar corrimientos de día
        };

        // Capitalizar el resultado y ajustar formato
        let formattedDate = new Intl.DateTimeFormat('es-ES', options).format(date);
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        
        return formattedDate.replace('.', ''); // Eliminar el punto final del día de la semana si existe
    };


    // Aseguramos que los valores sean seguros y formateados
    const origen = viaje.origen || 'Origen Desconocido';
    const destino = viaje.destino || 'Destino Desconocido';
    const fecha = formatDate(viaje.fecha);
    const hora = viaje.hora ? viaje.hora.substring(0, 5) + ' HS' : 'N/A';
    const precio = viaje.precio ? `$ ${parseFloat(viaje.precio).toFixed(3)}` : 'N/A'; // Usamos toFixed(3) por si es un precio grande
    const asientos_disponibles = viaje.asientos_disponibles !== undefined ? viaje.asientos_disponibles : 'N/A';
    const conductorNombre = (viaje.conductor && viaje.conductor.first_name) ? `${viaje.conductor.first_name} ${viaje.conductor.last_name}` : 'No disponible';

    return `
        <div class="custom-card-template">
            <!-- 1. ZONA SVG/ICONO (Origen y Destino) -->
            <div class="card-header-svg">
                <span style="font-size: 15px;">
                    <img src="${getStaticUrl('ubiAzul.svg')}" alt="Ubicación" style="width: 25px;"> Origen: <span style="color: #024873 ; font-size: 18px;"> ${origen}</span> <br>
                    <img src="${getStaticUrl('ubiVerde.svg')}" alt="Ubicación" style="width: 25px;"> Destino: <span style="color: #024873; font-size: 18px;"> ${destino}</span>
                </span>
            </div>
            <!-- 2. CUERPO DE DETALLES -->
            <div class="card-body-content">
                
                <!-- Fecha y Hora -->
                <div class="detail-row">
                    <span class="detail-label">
                        <img src="${getStaticUrl('fecha2.svg')}" alt="Fecha" style="width: 23px; margin-right: 5px;"> Fecha:
                    </span>
                    <span class="detail-value">${fecha}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">
                        <img src="${getStaticUrl('reloj2.svg')}" alt="Hora" style="width: 23px; margin-right: 5px;"> Hora:
                    </span>
                    <span class="detail-value">${hora}</span>
                </div>

                <!-- Costo -->
                <div class="detail-row mb-3">
                    <span class="detail-label">
                        <img src="${getStaticUrl('money2.svg')}" alt="Costo" style="width: 23px; margin-right: 5px;"> Costo:
                    </span>
                    <span class="detail-value text-success fw-bolder">${precio}</span>
                </div>
                
                <!-- Lugares Disponibles -->
                <div class="places-available mt-auto">
                    <p class="mb-1 text-secondary fw-semibold"><img src="${getStaticUrl('asiento.svg')}" alt="Costo" style="width: 23px; margin-right: 5px;">LUGARES DISPONIBLES:</p>
                    <p class="lead fw-bolder text-primary">${asientos_disponibles} 
                </div>
                
                <!-- Botón -->
                <button class="btn btn-primary mt-3" 
                        data-bs-toggle="modal" 
                        data-bs-target="#reservarViajeModal"
                        data-viaje-id="${viaje.id}">VER</button>
             </div>
        </div>
    `;  
}

/**
 * Función principal para obtener los datos de la API y renderizarlos.
 */
async function cargarViajes() {
    // 1. Limpiar contenedor y mostrar mensaje de carga/spinner
    contenedorViajes.innerHTML = '<p class="text-center text-secondary p-4">Cargando viajes disponibles...</p>';

    try {
        // 2. Realizar la solicitud Fetch
        const response = await fetch(API_LIST_URL);

        // 3. Verificar si la respuesta es OK (200-299)
        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error("API Error: 404 Not Found. Revisa la URL del endpoint.");
            }
            // Error de conexión o servidor
            throw new Error(`Error HTTP: ${response.status}. Revisa el servidor Django y CORS.`);
        }

        // 4. Parsear los datos a JSON
        const listaDeViajes = await response.json();
        
        // 4.1. Ordenar los viajes por el campo 'actualizado' (más recientes primero)
        listaDeViajes.sort((a, b) => new Date(b.actualizado) - new Date(a.actualizado));

        // 5. Renderizar los viajes o el mensaje de no hay resultados
        contenedorViajes.innerHTML = ''; // Limpiar mensaje de carga

        if (listaDeViajes.length === 0) {
             contenedorViajes.innerHTML = '<p class="text-center text-secondary p-5">No se encontraron viajes disponibles con los filtros actuales.</p>';
             return;
        }

        listaDeViajes.forEach(viaje => {
            const tarjetaHTML = crearTarjetaViaje(viaje);
            // Insertamos el HTML de la tarjeta al contenedor
            contenedorViajes.insertAdjacentHTML('beforeend', tarjetaHTML);
        });

    } catch (error) {
        // 6. Mostrar error en la interfaz y en la consola
        console.error("Error en la carga de viajes:", error);
        contenedorViajes.innerHTML = `
            <div class="alert alert-danger p-4" role="alert">
                <h4 class="alert-heading">¡Error de Conexión o Servidor!</h4>
                <p>No se pudo obtener la lista de viajes. El error más común es **Falló la conexión o CORS**.</p>
                <hr>
                <p class="mb-0">Asegúrate de que el **servidor Django esté corriendo** y que la configuración de **CORS** sea correcta para permitir solicitudes desde el navegador. Detalle: ${error.message}</p>
            </div>
        `;
    }
}

// Iniciar la carga de viajes al finalizar la carga del DOM
document.addEventListener('DOMContentLoaded', cargarViajes);
