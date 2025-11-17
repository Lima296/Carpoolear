// ⚠️ IMPORTANTE: Define la URL base de tu API de Django aquí
// Asegúrate de que este endpoint devuelve una LISTA de viajes.
const API_LIST_URL = 'http://localhost:8000/api/viajes/';

// Elementos del DOM
const contenedorViajes = document.querySelector('.contenedor_viajes');

// --- Función de retraso para pruebas ---
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Función para formatear precios ---
function formatPriceWithDot(price) {
    if (price === null || isNaN(parseFloat(price))) {
        return 'N/A';
    }
    const number = Math.round(parseFloat(price));
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Función para crear el HTML de una tarjeta de viaje.
 * @param {Object} viaje - Objeto JSON de un solo viaje de la API.
 * @returns {string} - Cadena de HTML de la tarjeta.
 */
function crearTarjetaViaje(viaje) {
    const getStaticUrl = (path) => `${STATIC_URL_BASE}img/${path}`;

    // Lógica para determinar la clase de color de los asientos
    const asientosClaseColor = viaje.asientos_disponibles >= 3 ? 'asientos-disponibles-verde' : 'asientos-disponibles-naranja';

    // --- Generación Condicional de HTML ---
    const fechaHTML = viaje.fecha ? `
        <div class="info-item">
            <img src="${getStaticUrl('calendar.svg')}" class="info-icon" alt="Fecha">
            <span>${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(viaje.fecha + 'T00:00:00')).replace('.', '')}</span>
        </div>
    ` : '';

    const horaSalidaHTML = viaje.hora ? `
        <div class="info-item">
            <img src="${getStaticUrl('time-1.svg')}" class="info-icon" alt="Salida">
            <span>${viaje.hora.substring(0, 5)} hs</span>
        </div>
    ` : '';

    const horaLlegadaHTML = viaje.horario_llegada ? `
        <div class="info-item">
            <img src="${getStaticUrl('reloj2.svg')}" class="info-icon" alt="Llegada">
            <span>${viaje.horario_llegada.substring(0, 5)} hs</span>
        </div>
    ` : '';

    const precioHTML = viaje.precio ? `
        <div class="info-item precio">
            <img src="${getStaticUrl('money.svg')}" class="info-icon" alt="Precio">
            <div class="precio-texto">
                <span>$${formatPriceWithDot(viaje.precio)}</span>
                <small>por asiento</small>
            </div>
        </div>
    ` : `
        <div class="info-item precio">
            <img src="${getStaticUrl('money.svg')}" class="info-icon" alt="Precio">
            <div class="precio-texto">
                <span>Gratis</span>
            </div>
        </div>
    `;

    const conductorNombre = viaje.conductor?.nombre
        ? `${viaje.conductor.nombre} ${viaje.conductor.apellido || ''}`.trim()
        : 'Conductor';

    const conductorHTML = viaje.conductor ? `
        <div class="conductor-info">
            <img src="${viaje.conductor.avatar || getStaticUrl('default-avatar.svg')}" alt="Avatar" class="conductor-avatar">
            <a href="/perfil/usuario/${viaje.conductor.id}/" class="conductor-nombre">${conductorNombre}</a>
        </div>
    ` : '';

    // --- Estructura HTML Principal ---
    return `
        <div class="viaje-card-v3">
            <div class="card-header">
                <div class="origen">
                    <span class="ciudad">${viaje.origen?.nombre + (viaje.origen?.provincia?.nombre ? ' (' + viaje.origen.provincia.nombre + ')' : '') || 'Origen'}</span>
                </div>
                <div class="icono-trayecto icono-flecha-derecha">
                    <img src="${getStaticUrl('flecha.svg')}" alt="hacia">
                </div>
                <div class="destino">
                    <span class="ciudad">${viaje.destino?.nombre + (viaje.destino?.provincia?.nombre ? ' (' + viaje.destino.provincia.nombre + ')' : '') || 'Destino'}</span>
                </div>
            </div>

            <div class="card-body">
                ${fechaHTML}
                ${horaSalidaHTML}
                ${horaLlegadaHTML}
                ${precioHTML}
            </div>

            <div class="card-footer">
                ${conductorHTML}
                <div class="actions">
                    <div class="asientos-disponibles ${asientosClaseColor}">
                        <img src="${getStaticUrl('asiento.svg')}" alt="Asientos">
                        <span>${viaje.asientos_disponibles ?? '0'}</span>
                    </div>
                    <button class="btn btn-reservar-v3" data-bs-toggle="modal" data-bs-target="#reservarViajeModal" data-viaje-id="${viaje.id}">
                        Reservar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Función principal para obtener los datos de la API y renderizarlos.
 */
async function cargarViajes(filters = {}) {
    const mensajeCarga = document.getElementById('mensaje-carga');
    const autoAnimado = document.querySelector('.auto-animado');
    
    // Limpiar viajes anteriores y mostrar el mensaje de carga
    contenedorViajes.innerHTML = '';
    mensajeCarga.style.display = 'block';
    autoAnimado.classList.add('animar');

    // Construir la URL con los filtros
    const url = new URL(API_LIST_URL);
    if (filters.origen && filters.origen.trim() !== '') {
        url.searchParams.append('origen', filters.origen);
    }
    if (filters.destino && filters.destino.trim() !== '') {
        url.searchParams.append('destino', filters.destino);
    }
    if (filters.fecha && filters.fecha.trim() !== '') {
        url.searchParams.append('fecha', filters.fecha);
    }

    try {
        // Añadimos un retraso de 2 segundos para simular la carga
        await delay(2000);

        // 2. Realizar la solicitud Fetch
        const response = await fetch(url);

        // 3. Verificar si la respuesta es OK (200-299)
        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error("API Error: 404 Not Found. Revisa la URL del endpoint.");
            }
            // Error de conexión o servidor
            throw new Error(`Error HTTP: ${response.status}. Revisa el servidor Django y CORS.`);
        }

        // 4. Parsear los datos a JSON
        let listaDeViajes = await response.json();
        
        // Filtrar viajes: solo mostrar los que NO estén 'Finalizado'
        listaDeViajes = listaDeViajes.filter(viaje => viaje.estado !== 'Finalizado');

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
    } finally {
        // Ocultar el mensaje de carga al finalizar
        mensajeCarga.style.display = 'none';
        autoAnimado.classList.remove('animar');
    }
}

// Iniciar la carga de viajes al finalizar la carga del DOM
document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        // Si no hay token, redirigir al inicio
        window.location.href = '/'; 
        return; // Detener la ejecución del script
    }
    cargarViajes();
});
