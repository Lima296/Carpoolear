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
        
        // Limpiar sugerencias estáticas y poblar dinámicamente
        dropdownMenu.innerHTML = '<h6 class="dropdown-header">Ciudades Sugeridas</h6>'; // Mantener el encabezado
        localidades.forEach(localidad => {
            const item = document.createElement('a');
            item.classList.add('dropdown-item');
            item.href = '#';
            // Asumimos que la API devuelve un objeto con la propiedad 'nombre'
            item.textContent = localidad.nombre; 
            item.setAttribute('data-value', localidad.nombre);
            dropdownMenu.appendChild(item);
        });

        const items = dropdownMenu.querySelectorAll('.dropdown-item');
        const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(dropdownContainer);

        // 1. FUNCIONALIDAD DE FILTRADO (al escribir en el input)
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

        // 2. FUNCIONALIDAD DE SELECCIÓN (al hacer clic en una opción)
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); 
                
                inputElement.value = this.getAttribute('data-value');
                
                dropdownInstance.hide();
                
                if (inputId === 'input-origen') {
                    const destinoInput = document.getElementById('input-destino');
                    if (destinoInput) {
                        destinoInput.focus();
                    }
                }
            });
        });
        
        // 3. EVITAR QUE EL DROPDOWN SE CIERRE
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
// --- LÓGICA DEL BOTÓN DE BÚSQUEDA (SIN VALIDACIÓN ESTRICTA) ---
// ------------------------------------------------------------------
    
    const btnBuscar = document.getElementById('btn-buscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            // Captura de los 3 valores (vacíos si no se seleccionan)
            const origen = document.getElementById('input-origen').value;
            const destino = document.getElementById('input-destino').value;
            const fecha = document.getElementById('input-fecha').value; 
            
            // VERIFICACIÓN FLEXIBLE: Aseguramos que al menos un campo esté lleno.
            if (!origen && !destino && !fecha) {
                console.warn('Advertencia: Debe ingresar al menos un criterio de búsqueda.');
                // Puedes agregar aquí una alerta visual para el usuario si todos están vacíos.
                return; 
            }
            
            console.log(`Búsqueda iniciada con filtros: Origen='${origen}', Destino='${destino}', Fecha='${fecha}'`);
            
            // Lógica final de búsqueda (ej. enviar formulario o AJAX)
            // Esta lógica ahora acepta cualquier combinación de filtros.
            // Ejemplo de URL:
            // window.location.href = `/viajes/buscar/?origen=${origen}&destino=${destino}&fecha=${fecha}`;
        });
    }

});