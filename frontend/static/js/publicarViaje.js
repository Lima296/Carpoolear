/**
 * Función para obtener el valor de una cookie por su nombre.
 * Esencial para la protección CSRF de Django.
 * @param {string} name - El nombre de la cookie (ej. 'csrftoken').
 * @returns {string|null} - El valor de la cookie o null si no se encuentra.
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // ¿Comienza esta cadena de cookie con el nombre que queremos?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Envía los datos de un nuevo viaje a la API a través de una solicitud POST.
 * @param {object} viajeData - Objeto con los datos del viaje.
 *   Ej: {
 *     origen: "Ciudad Origen",
 *     destino: "Ciudad Destino",
 *     fecha: "2025-12-31",
 *     hora: "14:30",
 *     asientos_disponibles: 3,
 *     precio: 5000.00,
 *     conductor: 1 // ID del usuario conductor
 *   }
 * @returns {Promise<object>} - La promesa resuelve con los datos del viaje creado.
 */
async function publicarViaje(viajeData) {
    const csrfToken = getCookie('csrftoken');
    
    const response = await fetch('http://localhost:8000/api/viajes/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(viajeData)
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            // Si es un error JSON, lo procesamos como tal
            const errorData = await response.json();
            throw new Error(`Error (${response.status}): ${JSON.stringify(errorData)}`);
        } else {
            // Si NO es JSON (probablemente HTML), leemos como texto
            const errorText = await response.text();
            console.error("La respuesta del servidor no es JSON. Contenido:", errorText);
            throw new Error(`Error (${response.status}). El servidor devolvió una respuesta no válida. Revisa la consola para más detalles.`);
        }
    }

    return await response.json();
}

// --- Ejemplo de Uso ---
// El siguiente código se ejecutará cuando el DOM esté completamente cargado.
// Espera encontrar un formulario con el id "form-publicar-viaje".
document.addEventListener('DOMContentLoaded', () => {
    // Cuando crees tu formulario, asígnale el id "form-publicar-viaje"
    const form = document.getElementById('form-publicar-viaje');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevenimos el envío tradicional del formulario

            try {
                // Aquí recolectarías los datos de tus inputs.
                // Asegúrate de que los IDs de tus inputs coincidan.
                const datosDelViaje = {
                    origen: document.getElementById('origen-publicar').value,
                    destino: document.getElementById('destino-publicar').value,
                    fecha: document.getElementById('fecha-publicar').value,
                    hora: document.getElementById('hora-publicar').value,
                    asientos_disponibles: parseInt(document.getElementById('asientos-publicar').value, 10),
                    precio: parseFloat(document.getElementById('precio-publicar').value),
                    
                    // ¡IMPORTANTE! Debes obtener el ID del usuario que ha iniciado sesión.
                    // Esto es solo un ejemplo. No dejes el valor "1" fijo.
                    conductor: 1 
                };

                console.log("Enviando los siguientes datos a la API:", datosDelViaje);

                const nuevoViaje = await publicarViaje(datosDelViaje);
                
                console.log('Viaje publicado con éxito:', nuevoViaje);
                alert('¡Tu viaje ha sido publicado exitosamente!');
                
                // Opcional: limpiar el formulario o redirigir al usuario.
                // form.reset();
                // window.location.href = '/dashboard/'; // Por ejemplo

            } catch (error) {
                console.error('Ocurrió un error al publicar el viaje:', error);
                alert(`No se pudo publicar el viaje. Error: ${error.message}`);
            }
        });
    }
});
