document.addEventListener('DOMContentLoaded', function() {
    
    // --- FUNCIÓN GENÉRICA PARA EL AUTOCOMPLETADO (NO SE MODIFICA) ---
    function setupAutocomplete(inputId, dropdownId) {
        // Obtenemos los elementos por ID de forma directa
        const inputElement = document.getElementById(inputId);
        const dropdownContainer = document.getElementById(dropdownId);
        
        if (!inputElement || !dropdownContainer) {
            console.error(`Error: No se encontró el input o dropdown con ID: ${inputId} o ${dropdownId}`);
            return;
        }

        // Elementos internos
        const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu'); 
        const items = dropdownMenu.querySelectorAll('.dropdown-item');
        
        // Instancia de Bootstrap Dropdown
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
    
    setupAutocomplete('input-origen', 'dropdown-origen'); 
    setupAutocomplete('input-destino', 'dropdown-destino'); 
    
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