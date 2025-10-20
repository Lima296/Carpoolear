async function cargarUsuarios() {
    try {
        const response = await fetch ("http://127.0.0.1:8000/api/usuarios/")
        const usuarios = await response.json();

        const tbody = document.querySelector("#tabla_usuarios tbody");
        tbody.innerHTML = "";

        usuarios.forEach(element => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${element.id}</td>
                <td>${element.nombre}</td>
                <td>${element.apellido}</td>
                <td>${element.correo}</td>
            `;
            tbody.appendChild(tr);
            
        });

        
        
    } catch (error) {
        console.error("Error cargando usuarios:", error);

        
    }
}

cargarUsuarios();