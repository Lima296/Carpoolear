


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

async function getConductorDNI() {
    const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
    const accessToken = localStorage.getItem('access');
    console.log('Access Token:', accessToken);

    if (!accessToken) {
            console.log('No access token found. User not logged in.');
         // 2. Mostrar el modal de iniciar sesion
            const successModalElement2 = document.getElementById('successModal2');
            const successBootstrapModal2 = new bootstrap.Modal(successModalElement2);
            successBootstrapModal2.show();
        return null;
    }

    try {
        const response = await fetch(userProfileUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        });
        console.log('Profile API Response Status:', response.status);
        console.log('Profile API Response OK:', response.ok);

        if (response.status === 401) {
            console.error('Access token expired or invalid.');
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            // Optionally redirect to login
            return null;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile API Data:', data);
        return data.id; // Using 'id' as 'dni' is not available in profile data
    } catch (error) {
        console.error('Error fetching conductor DNI:', error);
        return null;
    }
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
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Cargar localidades para el autocompletado
    let todasLasLocalidades = [];
    try {
        // Asumiendo que getLocalidades() viene de otro script y devuelve {id, nombre}
        const response = await fetch('http://localhost:8000/api/localidad/');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las localidades.');
        }
        todasLasLocalidades = await response.json();
    } catch (error) {
        console.error("Error al cargar localidades:", error);
    }

    // 2. Función de autocompletado MODIFICADA
    function setupAutocomplete(inputId, dropdownId, localidades) {
        const inputElement = document.getElementById(inputId);
        const dropdownContainer = document.getElementById(dropdownId);
        
        if (!inputElement || !dropdownContainer) {
            console.error(`Error: No se encontró el input o dropdown con ID: ${inputId} o ${dropdownId}`);
            return;
        }

        const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu');
        
        dropdownMenu.innerHTML = '<h6 class="dropdown-header">Ciudades Sugeridas</h6>';
        localidades.forEach(localidad => {
            const item = document.createElement('a');
            item.classList.add('dropdown-item');
            item.href = '#';
            item.textContent = localidad.nombre;
            // Guardamos el ID en data-id y el nombre en data-value
            item.setAttribute('data-id', localidad.id);
            item.setAttribute('data-value', localidad.nombre);
            dropdownMenu.appendChild(item);
        });

        const items = dropdownMenu.querySelectorAll('.dropdown-item');
        const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(inputElement);

        inputElement.addEventListener('keyup', function() {
            const filter = inputElement.value.toLowerCase();
            let hasVisibleItems = false;
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(filter)) {
                    item.style.display = 'block';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            if (filter.length > 0 && hasVisibleItems) {
                 dropdownInstance.show();
            } else {
                 dropdownInstance.hide();
            }
        });

        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                // Mostramos el nombre en el input
                inputElement.value = this.getAttribute('data-value');
                // Guardamos el ID seleccionado en un atributo data del input
                inputElement.setAttribute('data-selected-id', this.getAttribute('data-id'));
                dropdownInstance.hide();
            });
        });
        
        dropdownMenu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // 3. Inicializar autocompletado en el formulario de publicar viaje
    setupAutocomplete('origen-publicar', 'dropdown-origen-publicar', todasLasLocalidades);
    setupAutocomplete('destino-publicar', 'dropdown-destino-publicar', todasLasLocalidades);

    // 4. Lógica existente del formulario (validación y envío) MODIFICADA
    const form = document.getElementById('form-publicar-viaje');
    if (form) {
        // --- TRADUCCIÓN DE MENSAJES DE VALIDACIÓN (CORREGIDO) ---
        const inputs = form.querySelectorAll('input[required]');

        inputs.forEach(input => {
            input.addEventListener('invalid', () => {
                if (input.validity.valueMissing) {
                    input.setCustomValidity('Por favor, completa este campo.');
                } else if (input.validity.typeMismatch) {
                    let message = 'Por favor, introduce un valor válido.';
                    if (input.type === 'date') message = 'Por favor, introduce una fecha válida.';
                    else if (input.type === 'time') message = 'Por favor, introduce una hora válida.';
                    input.setCustomValidity(message);
                } else if (input.validity.rangeUnderflow) {
                    input.setCustomValidity(`El valor debe ser como mínimo ${input.min}.`);
                }
            });

            input.addEventListener('input', () => {
                input.setCustomValidity('');
            });
        });

        // --- LISTENER PARA EL ENVÍO DEL FORMULARIO ---
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            try {
                const origenInput = document.getElementById('origen-publicar');
                const destinoInput = document.getElementById('destino-publicar');

                const datosDelViaje = {
                    // Leemos el ID guardado en el atributo data-selected-id
                    origen: origenInput.getAttribute('data-selected-id'),
                    destino: destinoInput.getAttribute('data-selected-id'),
                    fecha: document.getElementById('fecha-publicar').value,
                    hora: document.getElementById('hora-publicar').value,
                    asientos_disponibles: parseInt(document.getElementById('asientos-publicar').value, 10),
                    precio: parseFloat(document.getElementById('precio-publicar').value),
                    detalle_viaje: document.getElementById('detalle_viaje').value,
                    conductor: await getConductorDNI()
                };

                // Verificación simple para asegurar que se ha seleccionado un ID
                if (!datosDelViaje.origen || !datosDelViaje.destino) {
                    alert('Por favor, selecciona un origen y un destino de la lista de sugerencias.');
                    return;
                }

                console.log("Enviando los siguientes datos a la API:", datosDelViaje);
                const nuevoViaje = await publicarViaje(datosDelViaje);
                console.log('Viaje publicado con éxito:', nuevoViaje);

                const publicarViajeModalElement = document.getElementById('publicarViajeModal');
                const publicarViajeBootstrapModal = bootstrap.Modal.getInstance(publicarViajeModalElement);
                if (publicarViajeBootstrapModal) {
                    publicarViajeBootstrapModal.hide();
                }

                const successModalElement = document.getElementById('successModal');
                const successBootstrapModal = new bootstrap.Modal(successModalElement);
                successBootstrapModal.show();

                // Actualizar la lista de viajes en el dashboard
                if (typeof cargarViajes === 'function') {
                    cargarViajes();
                }

                form.reset();
                setTimeout(() => {
                    successBootstrapModal.hide();
                }, 2000);

            } catch (error) {
                console.log('Ocurrió un error al publicar el viaje:', error);
            }
        });
    }
});
