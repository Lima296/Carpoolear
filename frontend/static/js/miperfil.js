document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        window.location.href = '/';
        return;
    }

    // --- URLs de la API ---
    const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
    const vehiclesUrl = 'http://127.0.0.1:8000/api/vehiculos/';
    const calificacionesUrl = 'http://127.0.0.1:8000/api/calificaciones/';
    const changePasswordUrl = 'http://127.0.0.1:8000/api/change-password/';

    // --- Almacenamiento de datos ---
    let userVehicles = [];
    let currentUserId = null;

    // --- Elementos del DOM ---
    const navLinks = document.querySelectorAll('.profile-nav .nav-link');
    const contentPanes = document.querySelectorAll('.content-pane');
    const vehicleListContainer = document.getElementById('vehicle-list-container');
    const calificacionesListContainer = document.getElementById('calificaciones-list-container');

    // Modales
    const addVehicleModal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
    const editVehicleModal = new bootstrap.Modal(document.getElementById('editVehicleModal'));
    const deleteVehicleModal = new bootstrap.Modal(document.getElementById('deleteVehicleModal'));
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    const genericSuccessModal = new bootstrap.Modal(document.getElementById('genericSuccessModal')); // Referencia al modal de éxito genérico
    const genericErrorModal = new bootstrap.Modal(document.getElementById('genericErrorModal'));   // Referencia al modal de error genérico

    // Funciones para mostrar modales de mensajes
    function showSuccessModal(message) {
        document.getElementById('generic-success-message').textContent = message;
        genericSuccessModal.show();
    }

    function showErrorModal(message) {
        document.getElementById('generic-error-message').textContent = message;
        genericErrorModal.show();
    }

    // Formularios
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const editVehicleForm = document.getElementById('edit-vehicle-form');
    const deleteVehicleForm = document.getElementById('delete-vehicle-form');
    const editProfileForm = document.getElementById('edit-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');

    // --- Navegación del Perfil ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            contentPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                    // Si el panel de calificaciones es el objetivo, cargarlas
                    if (targetId === 'calificaciones-content') {
                        loadCalificaciones();
                    }
                }
            });
        });
    });

    // --- Carga de Datos del Perfil ---
    async function loadProfileData() {
        try {
            const response = await fetch(userProfileUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error('Error al cargar el perfil');
            const data = await response.json();
            
            currentUserId = data.id; // Guardamos el ID del usuario

            document.getElementById('nav-display-name').textContent = `${data.nombre} ${data.apellido}`;
            document.getElementById('display-nombre').textContent = data.nombre || 'N/A';
            document.getElementById('display-apellido').textContent = data.apellido || 'N/A';
            document.getElementById('display-telefono').textContent = data.telefono || 'N/A';
            document.getElementById('display-correo').textContent = data.correo || 'N/A';
            document.getElementById('display-password').textContent = '********';

            // Llenar modal de edición de perfil
            document.getElementById('edit-nombre').value = data.nombre || '';
            document.getElementById('edit-apellido').value = data.apellido || '';
            document.getElementById('edit-telefono').value = data.telefono || '';
            document.getElementById('edit-correo').value = data.correo || '';
        } catch (error) {
            console.error(error);
        }
    }

    // --- Carga y Renderizado de Vehículos ---
    async function loadVehicleData() {
        try {
            const response = await fetch(vehiclesUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error('Error al cargar vehículos');
            userVehicles = await response.json();
            renderVehicleList();
        } catch (error) {
            console.error(error);
            vehicleListContainer.innerHTML = '<p class="text-center text-muted">No se pudieron cargar los vehículos.</p>';
        }
    }

    function renderVehicleList() {
        vehicleListContainer.innerHTML = '';
        if (userVehicles.length === 0) {
            vehicleListContainer.innerHTML = '<p class="text-center text-muted">No tienes vehículos registrados.</p>';
            return;
        }

        userVehicles.forEach(vehicle => {
            const vehicleItem = document.createElement('div');
            vehicleItem.className = 'vehicle-item';
            vehicleItem.innerHTML = `
                <div class="vehicle-info">
                    <h6>${vehicle.marca} ${vehicle.modelo} (${vehicle.año})</h6>
                    <p>Patente: ${vehicle.patente} | Color: ${vehicle.color} | Asientos: ${vehicle.asientos}</p>
                </div>
                <div class="vehicle-actions">
                    <button class="btn btn-brand-secondary-outline btn-sm btn-edit-vehicle" data-id="${vehicle.id}">Editar</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete-vehicle" data-id="${vehicle.id}">Eliminar</button>
                </div>
            `;
            vehicleListContainer.appendChild(vehicleItem);
        });
    }

    // --- Carga y Renderizado de Calificaciones ---
    function renderCalificaciones(calificaciones) {
        calificacionesListContainer.innerHTML = '';
        if (calificaciones.length === 0) {
            calificacionesListContainer.innerHTML = '<p class="text-center text-muted">Aún no has recibido calificaciones.</p>';
            return;
        }

        calificaciones.forEach(calif => {
            const fecha = new Date(calif.fecha_creacion).toLocaleDateString();
            const calificacionIcono = calif.tipo === 'like' ? '👍' : '👎';
            
            const calificacionItem = document.createElement('div');
            // Añadimos una clase dinámica para el estilo condicional
            calificacionItem.className = `calificacion-item calificacion-${calif.tipo}`;

            calificacionItem.innerHTML = `
                <div class="calificacion-header">
                    <span class="calificacion-autor-group">
                        <span class="calificacion-autor">${calif.calificador.nombre} ${calif.calificador.apellido}</span> <span class="comento-text">comentó:</span>
                    </span>
                    <span class="calificacion-fecha">${fecha}</span>
                </div>
                <div class="calificacion-body">
                    <span class="calificacion-icono">${calificacionIcono}</span>
                    <p class="calificacion-comentario">${calif.comentario || '<em>Sin comentario.</em>'}</p>
                </div>
            `;
            calificacionesListContainer.appendChild(calificacionItem);
        });
    }

    async function loadCalificaciones() {
        if (!currentUserId) {
            console.error('ID de usuario no disponible.');
            calificacionesListContainer.innerHTML = '<p class="text-center text-danger">No se pudo obtener el ID del usuario.</p>';
            return;
        }

        calificacionesListContainer.innerHTML = '<p class="text-center text-muted">Cargando calificaciones...</p>';

        try {
            const response = await fetch(`${calificacionesUrl}?calificado_id=${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('Error al cargar las calificaciones');
            const data = await response.json();
            renderCalificaciones(data);
        } catch (error) {
            console.error(error);
            calificacionesListContainer.innerHTML = '<p class="text-center text-danger">No se pudieron cargar las calificaciones.</p>';
        }
    }

    // --- Acciones de Vehículos (Agregar, Editar, Eliminar) ---
    document.getElementById('add-vehicle-btn').addEventListener('click', () => addVehicleModal.show());

    vehicleListContainer.addEventListener('click', (e) => {
        const target = e.target;
        const vehicleId = target.dataset.id;
        if (!vehicleId) return;

        if (target.classList.contains('btn-edit-vehicle')) {
            const vehicle = userVehicles.find(v => v.id == vehicleId);
            if (vehicle) {
                editVehicleForm.dataset.vehicleId = vehicle.id;
                document.getElementById('edit-marca').value = vehicle.marca;
                document.getElementById('edit-modelo').value = vehicle.modelo;
                document.getElementById('edit-patente').value = vehicle.patente;
                document.getElementById('edit-color').value = vehicle.color;
                document.getElementById('edit-año').value = vehicle.año; // Añadir el campo año aquí
                document.getElementById('edit-asientos').value = vehicle.asientos;
                editVehicleModal.show();
            }
        } else if (target.classList.contains('btn-delete-vehicle')) {
            deleteVehicleForm.dataset.vehicleId = vehicleId;
            deleteVehicleModal.show();
        }
    });

    addVehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Evento 'submit' del formulario de agregar vehículo capturado.");

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log("Datos del vehículo a enviar:", data);
        
        try {
            const response = await fetch(vehiclesUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            console.log("Respuesta del servidor recibida:", response);

            if (!response.ok) {
                // Leer la respuesta de error como texto para obtener el mensaje exacto de Django
                const errorText = await response.text();
                console.error('Cuerpo de la respuesta de error del servidor:', errorText);
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log("Vehículo agregado exitosamente:", responseData);

            addVehicleModal.hide();
            e.target.reset();
            loadVehicleData();
        } catch (error) {
            console.error('Fallo al procesar la petición de agregar vehículo:', error);
            // Opcional: Mostrar un mensaje de error al usuario en la UI
            alert('No se pudo guardar el vehículo. Revisa la consola para más detalles.');
        }
    });

    editVehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicleId = e.target.dataset.vehicleId;
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${vehiclesUrl}${vehicleId}/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al actualizar vehículo');
            editVehicleModal.hide();
            loadVehicleData();
        } catch (error) {
            console.error(error);
        }
    });

    deleteVehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicleId = e.target.dataset.vehicleId;
        try {
            const response = await fetch(`${vehiclesUrl}${vehicleId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = (errorData.non_field_errors && errorData.non_field_errors[0]) || 'Error al eliminar el vehículo.';
                throw new Error(errorMessage);
            }

            deleteVehicleModal.hide();
            loadVehicleData();

        } catch (error) {
            deleteVehicleModal.hide();
            showErrorModal(error.message);
            console.error(error);
        }
    });
    
    // --- Acciones de Perfil ---
    document.getElementById('edit-profile-btn').addEventListener('click', () => editProfileModal.show());

    // document.getElementById('show-calificaciones-btn').addEventListener('click', () => { // Eliminado
    //     loadCalificaciones();
    //     calificacionesModal.show();
    // });

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = { 
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            telefono: formData.get('telefono')
        };

        try {
            const response = await fetch(userProfileUrl, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al actualizar perfil');
            editProfileModal.hide();
            loadProfileData();
        } catch (error) {
            console.error(error);
        }
    });

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const current_password = document.getElementById('current-password').value;
        const new_password = document.getElementById('new-password').value;
        const confirm_password = document.getElementById('confirm-password').value;

        if (new_password !== confirm_password) {
            alert('Las nuevas contraseñas no coinciden.');
            return;
        }

        if (!current_password || !new_password) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await fetch(changePasswordUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ current_password, new_password, confirm_password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al cambiar la contraseña.');
            }

            showSuccessModal(data.mensaje || 'Contraseña actualizada con éxito.');
            changePasswordModal.hide();
            changePasswordForm.reset();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    // --- Inicialización ---
    function initialize() {
        loadProfileData();
        loadVehicleData();
    }

    initialize();
});
