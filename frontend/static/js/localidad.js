// Define la URL de la API para localidades
const API_LOCALIDAD_URL = 'http://127.0.0.1:8000/api/localidades/';

/**
 * Función para obtener la lista de localidades desde la API.
 */
async function getLocalidades(query = '') {
    console.log(`Iniciando la carga de localidades con query: "${query}"`);

    try {
        // Construir la URL con el parámetro de búsqueda si existe
        const url = new URL(API_LOCALIDAD_URL);
        if (query) {
            url.searchParams.append('q', query);
        }

        // Realiza la solicitud Fetch a la API
        const response = await fetch(url);

        // Verifica si la respuesta de la red es exitosa (código 2xx)
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
        }

        // Convierte la respuesta a formato JSON
        const localidades = await response.json();

        // Muestra los datos en la consola para verificar
        console.log('Localidades cargadas exitosamente:', localidades);

        return localidades;

    } catch (error) {
        // Muestra un error en la consola si algo falla
        console.error('Hubo un problema al obtener las localidades:', error);
        return []; // Retorna un array vacío en caso de error
    }
}

/**
 * Rellena un menú desplegable de Bootstrap con localidades.
 * @param {HTMLElement} dropdownMenuElement - El elemento del menú desplegable (div con clase dropdown-menu).
 * @param {Array} localidades - Array de objetos de localidad.
 * @param {HTMLInputElement} inputElement - El input asociado al dropdown.
 */
function populateLocalidadDropdown(dropdownMenuElement, localidades, inputElement) {
    // Limpiar completamente el menú desplegable
    dropdownMenuElement.innerHTML = '';

    // Si hay localidades para mostrar, añadir un encabezado
    if (localidades.length > 0) {
        const header = document.createElement('h6');
        header.classList.add('dropdown-header');
        header.textContent = 'Localidades Sugeridas';
        dropdownMenuElement.appendChild(header);
    }

    // Si no se encuentran localidades, mostrar un mensaje y salir
    if (localidades.length === 0) {
        const noResultsItem = document.createElement('li');
        // Bootstrap espera que los items de texto estén dentro de un <a> o <button> para el estilo
        const noResultsLink = document.createElement('span');
        noResultsLink.classList.add('dropdown-item-text', 'text-muted');
        noResultsLink.textContent = 'No se encontraron localidades.';
        noResultsItem.appendChild(noResultsLink);
        dropdownMenuElement.appendChild(noResultsItem);
        return;
    }

    // Rellenar el menú con las localidades encontradas
    localidades.forEach(localidad => {
        const item = document.createElement('a');
        item.classList.add('dropdown-item');
        item.href = '#';
        item.textContent = localidad.nombre;
        item.setAttribute('data-id', localidad.id);

        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Establecer el valor del input visible con el nombre de la localidad
            inputElement.value = localidad.nombre;

            // Guardar el ID de la localidad en el atributo data-selected-id del input
            inputElement.setAttribute('data-selected-id', localidad.id);

            // Ocultar el menú desplegable después de la selección
            const dropdownInstance = bootstrap.Dropdown.getInstance(inputElement);
            if (dropdownInstance) {
                dropdownInstance.hide();
            }
        });
        dropdownMenuElement.appendChild(item);
    });
}
            
            /**
             * Inicializa la funcionalidad de autocompletado y filtrado para un campo de localidad.
             * @param {string} inputId - El ID del input de texto (ej. 'origen-publicar').
             * @param {string} dropdownMenuSelector - El selector CSS del menú desplegable (ej. '#dropdown-origen-publicar .dropdown-menu').
             */
            async function initializeLocalityInput(inputId, dropdownMenuSelector) {
    const inputElement = document.getElementById(inputId);
    const dropdownMenuElement = document.querySelector(dropdownMenuSelector);

    if (!inputElement || !dropdownMenuElement) {
        console.warn(`Elementos no encontrados para inicializar localidad: Input ID '${inputId}', Dropdown Selector '${dropdownMenuSelector}'`);
        return;
    }

    const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(inputElement);

    inputElement.addEventListener('input', async () => {
        const searchTerm = inputElement.value;
        const localidades = await getLocalidades(searchTerm);
        populateLocalidadDropdown(dropdownMenuElement, localidades, inputElement);

        if (searchTerm.length > 0 && localidades.length > 0) {
            bsDropdown.show();
        } else {
            bsDropdown.hide();
        }
    });

    inputElement.addEventListener('focus', async () => {
        const searchTerm = inputElement.value;
        const localidades = await getLocalidades(searchTerm);
        populateLocalidadDropdown(dropdownMenuElement, localidades, inputElement);
        bsDropdown.show();
    });

    inputElement.addEventListener('blur', () => {
        // Se usa un timeout para permitir que el evento 'click' en un item del dropdown se registre antes de que se oculte.
        setTimeout(() => {
            bsDropdown.hide();
        }, 150);
    });
}
            
            // Exportar funciones para que puedan ser usadas en otros módulos
            // (Esto es una forma común en JS moderno, si no se usa un bundler, se pueden adjuntar al objeto window)
            window.getLocalidades = getLocalidades;
            window.populateLocalidadDropdown = populateLocalidadDropdown;
            window.initializeLocalityInput = initializeLocalityInput;            

