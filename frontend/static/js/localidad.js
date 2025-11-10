// Define la URL de la API para localidades
const API_LOCALIDAD_URL = 'http://127.0.0.1:8000/api/localidades/';

/**
 * Función para obtener la lista de localidades desde la API.
 */
async function getLocalidades() {
    console.log('Iniciando la carga de localidades...');

    try {
        // Realiza la solicitud Fetch a la API
        const response = await fetch(API_LOCALIDAD_URL);

        // Verifica si la respuesta de la red es exitosa (código 2xx)
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
        }

        // Convierte la respuesta a formato JSON
        const localidades = await response.json();

        // Muestra los datos en la consola para verificar
        console.log('Localidades cargadas exitosamente:', localidades);

        // Aquí podrías agregar código para poblar un <select> o cualquier otro elemento del DOM
        // Ejemplo:
        // const selectOrigen = document.getElementById('origen-publicar');
        // localidades.forEach(localidad => {
        //     const option = document.createElement('option');
        //     option.value = localidad.nombre;
        //     option.textContent = localidad.nombre;
        //     selectOrigen.appendChild(option);
        // });

        return localidades;

    } catch (error) {
        // Muestra un error en la consola si algo falla
        console.error('Hubo un problema al obtener las localidades:', error);
    }
}

