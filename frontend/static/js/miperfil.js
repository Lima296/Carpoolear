document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        window.location.href = '/';
        return;
    }

    // --- URLs de la API ---
    const userProfileUrl = 'http://127.0.0.1:8000/api/perfil/';
    const vehiclesUrl = 'http://127.0.0.1:8000/api/vehiculos/';

    // --- Almacenamiento de datos ---
    let userVehicles = [];

    // --- Elementos del DOM ---
    const navLinks = document.querySelectorAll('.profile-nav .nav-link');
    const contentPanes = document.querySelectorAll('.content-pane');
    const vehicleListContainer = document.getElementById('vehicle-list-container');

    // Modales
    const addVehicleModal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
    const editVehicleModal = new bootstrap.Modal(document.getElementById('editVehicleModal'));
    const deleteVehicleModal = new bootstrap.Modal(document.getElementById('deleteVehicleModal'));
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));

    // Formularios
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const editVehicleForm = document.getElementById('edit-vehicle-form');
    const deleteVehicleForm = document.getElementById('delete-vehicle-form');
    const editProfileForm = document.getElementById('edit-profile-form');

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

            document.getElementById('nav-display-name').textContent = `${data.nombre} ${data.apellido}`;
            document.getElementById('display-nombre').textContent = data.nombre || 'N/A';
            document.getElementById('display-apellido').textContent = data.apellido || 'N/A';
            document.getElementById('display-telefono').textContent = data.telefono || 'N/A';
            document.getElementById('display-correo').textContent = data.correo || 'N/A';

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
                    <h6>${vehicle.marca} ${vehicle.modelo}</h6>
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
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(vehiclesUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al agregar vehículo');
            addVehicleModal.hide();
            e.target.reset();
            loadVehicleData();
        } catch (error) {
            console.error(error);
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
            if (!response.ok) throw new Error('Error al eliminar vehículo');
            deleteVehicleModal.hide();
            loadVehicleData();
        } catch (error) {
            console.error(error);
        }
    });
    
    // --- Acciones de Perfil ---
    document.getElementById('edit-profile-btn').addEventListener('click', () => editProfileModal.show());

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

    // --- Inicialización ---
    function initialize() {
        loadProfileData();
        loadVehicleData();
    }

    initialize();
});
