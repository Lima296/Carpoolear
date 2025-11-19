document.addEventListener('DOMContentLoaded', async function() { // Make it async
    
    // 1. Cargar localidades desde la API
    let todasLasLocalidades = [];
    try {
        todasLasLocalidades = await getLocalidades(); // getLocalidades() viene de localidad.js
        if (!todasLasLocalidades) {
            throw new Error('La lista de localidades está vacía o es nula.');
        }
    } catch (error) {
        console.error("No se pudieron cargar las localidades. El autocompletado no funcionará.", error);
        // Opcional: Mostrar un mensaje al usuario en la UI
    }

    // --- FUNCIÓN GENÉRICA PARA EL AUTOCOMPLETADO (MODIFICADA) ---
    function setupAutocomplete(inputId, dropdownId, localidades) {
        const inputElement = document.getElementById(inputId);
        const dropdownContainer = document.getElementById(dropdownId);
        
        if (!inputElement || !dropdownContainer) {
            console.error(`Error: No se encontró el input o dropdown con ID: ${inputId} o ${dropdownId}`);
            return;
        }

        const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu');
        
        dropdownMenu.innerHTML = '<h6 class="dropdown-header">Seleccione una ciudad</h6>';
        localidades.forEach(localidad => {
            const item = document.createElement('a');
            item.classList.add('dropdown-item');
            item.href = '#';
            item.textContent = localidad.nombre;
            item.setAttribute('data-id', localidad.id); // Guardar el ID
            item.setAttribute('data-value', localidad.nombre);
            dropdownMenu.appendChild(item);
        });

        const items = dropdownMenu.querySelectorAll('.dropdown-item');
        const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(inputElement);

        inputElement.addEventListener('input', function() {
            // Al escribir, se anula cualquier selección previa de la lista
            inputElement.removeAttribute('data-selected-id');
            
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

            const isVisible = dropdownMenu.classList.contains('show');

            if (filter.length > 0 && hasVisibleItems) {
                if (!isVisible) {
                    dropdownInstance.show();
                }
            } else {
                if (isVisible) {
                    dropdownInstance.hide();
                }
            }
        });

        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); 
                inputElement.value = this.getAttribute('data-value');
                inputElement.setAttribute('data-selected-id', this.getAttribute('data-id')); // <-- CLAVE
                dropdownInstance.hide();
            });
        });
        
        dropdownMenu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

// ------------------------------------------------------------------
// --- INICIALIZACIÓN DE LOS CAMPOS (ORIGEN Y DESTINO) ---
// ------------------------------------------------------------------
    
    setupAutocomplete('input-origen', 'dropdown-origen', todasLasLocalidades); 
    setupAutocomplete('input-destino', 'dropdown-destino', todasLasLocalidades); 
    
// ------------------------------------------------------------------
// --- LÓGICA DEL BOTÓN DE BÚSQUEDA (CORREGIDA) ---
// ------------------------------------------------------------------
    
    const btnBuscar = document.getElementById('btn-buscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const origenInput = document.getElementById('input-origen');
            const destinoInput = document.getElementById('input-destino');
            const fechaInput = document.getElementById('input-fecha');

            const filters = {};
            const origenId = origenInput.getAttribute('data-selected-id');
            const destinoId = destinoInput.getAttribute('data-selected-id');
            const origenName = origenInput.value;
            const destinoName = destinoInput.value;
            const fecha = fechaInput.value;

            if (origenId) {
                filters.origen = origenId;
            } else if (origenName) {
                filters.origen = origenName;
            }

            if (destinoId) {
                filters.destino = destinoId;
            } else if (destinoName) {
                filters.destino = destinoName;
            }
            if (fecha && fecha.trim() !== '') {
                filters.fecha = fecha;
            }

            console.log(`Búsqueda iniciada con filtros (IDs):`, filters);
            
            cargarViajes(filters);
        });
    }

// ------------------------------------------------------------------
// --- LÓGICA DEL BOTÓN DE LIMPIAR FILTROS ---
// ------------------------------------------------------------------
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function(e) {
            e.preventDefault();

            const origenInput = document.getElementById('input-origen');
            const destinoInput = document.getElementById('input-destino');
            const fechaInput = document.getElementById('input-fecha');

            // Limpiar los valores de los inputs
            origenInput.value = '';
            destinoInput.value = '';
            fechaInput.value = '';

            // Limpiar los IDs seleccionados
            origenInput.removeAttribute('data-selected-id');
            destinoInput.removeAttribute('data-selected-id');

            console.log('Filtros limpiados. Cargando todos los viajes...');
            
            // Cargar todos los viajes (sin filtros)
            cargarViajes({});
        });
    }

});