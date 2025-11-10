


/**



 * Función para obtener el valor de una cookie por su nombre.



 * Esencial para la protección CSRF de Django.



 */



function getCookie(name) {



    let cookieValue = null;



    if (document.cookie && document.cookie !== '') {



        const cookies = document.cookie.split(';');



        for (let i = 0; i < cookies.length; i++) {



            const cookie = cookies[i].trim();



            if (cookie.substring(0, name.length + 1) === (name + '=')) {



                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));



                break;



            }



        }



    }



    return cookieValue;



}







/**



 * Verifica si el usuario actual tiene vehículos registrados.



 * @returns {Promise<boolean>} - True si tiene vehículos, false si no o en caso de error.



 */



async function checkUserHasVehicles() {



    const accessToken = localStorage.getItem('access');



    if (!accessToken) {



        console.log('No access token found. User not logged in.');



        // Opcional: podrías mostrar un modal para iniciar sesión aquí.



        return false;



    }







    try {



        const response = await fetch('http://localhost:8000/api/mis-vehiculos/', {



            method: 'GET',



            headers: {



                'Authorization': `Bearer ${accessToken}`,



                'Content-Type': 'application/json'



            },



        });







        if (!response.ok) {



            // Si el token está expirado o hay otro error, asumimos que no podemos verificar.



            console.error('Error fetching user vehicles:', response.status);



            return false;



        }







        const vehiculos = await response.json();



        // La API devuelve una lista. Comprobamos si la lista tiene elementos.



        return vehiculos.length > 0;







    } catch (error) {



        console.error('Error en checkUserHasVehicles:', error);



        return false;



    }



}











/**



 * Envía los datos de un nuevo viaje a la API a través de una solicitud POST.



 */



async function publicarViaje(viajeData) {



    const csrfToken = getCookie('csrftoken');



    const accessToken = localStorage.getItem('access');







    const response = await fetch('http://localhost:8000/api/viajes/', {



        method: 'POST',



        headers: {



            'Content-Type': 'application/json',



            'X-CSRFToken': csrfToken,



            'Authorization': `Bearer ${accessToken}`



        },



        body: JSON.stringify(viajeData)



    });







    if (!response.ok) {



        const errorData = await response.json().catch(() => ({ detail: 'Error desconocido al procesar la respuesta del servidor.' }));



        throw errorData;



    }







    return await response.json();



}











document.addEventListener('DOMContentLoaded', () => {







    // --- LÓGICA DE VERIFICACIÓN Y APERTURA DE MODAL ---



    document.body.addEventListener('click', async (event) => {



        if (event.target.matches('.btn-verificar-vehiculo')) {



            const userHasVehicles = await checkUserHasVehicles();







            if (userHasVehicles) {



                const publicarModal = new bootstrap.Modal(document.getElementById('publicarViajeModal'));



                publicarModal.show();



            } else {



                const requiereVehiculoModal = new bootstrap.Modal(document.getElementById('vehiculoRequeridoModal'));



                requiereVehiculoModal.show();



            }



        }



    });











    // --- LÓGICA DEL FORMULARIO DE PUBLICACIÓN ---



    const form = document.getElementById('form-publicar-viaje');



    if (form) {



        form.addEventListener('submit', async (event) => {



            event.preventDefault();







            try {



                const origenInput = document.getElementById('origen-publicar');



                const destinoInput = document.getElementById('destino-publicar');







                const datosDelViaje = {



                    origen: origenInput.getAttribute('data-selected-id'),



                    destino: destinoInput.getAttribute('data-selected-id'),



                    fecha: document.getElementById('fecha-publicar').value,



                    hora: document.getElementById('hora-publicar').value,



                    asientos_disponibles: parseInt(document.getElementById('asientos-publicar').value, 10),



                    precio: parseFloat(document.getElementById('precio-publicar').value),



                    detalle_viaje: document.getElementById('detalle_viaje').value



                };







                if (!datosDelViaje.origen || !datosDelViaje.destino) {



                    alert('Por favor, selecciona un origen y un destino de la lista de sugerencias.');



                    return;



                }







                await publicarViaje(datosDelViaje);







                // Ocultar modal de publicación y mostrar modal de éxito



                const publicarViajeModalElement = document.getElementById('publicarViajeModal');



                const publicarViajeBootstrapModal = bootstrap.Modal.getInstance(publicarViajeModalElement);



                if (publicarViajeBootstrapModal) {



                    publicarViajeBootstrapModal.hide();



                }







                const successModalElement = document.getElementById('successModal');



                const successBootstrapModal = new bootstrap.Modal(successModalElement);



                successBootstrapModal.show();







                // Actualizar la lista de viajes si la función existe



                if (typeof cargarViajes === 'function') {



                    cargarViajes();



                }







                form.reset();



                setTimeout(() => {



                    successBootstrapModal.hide();



                }, 2000);







            } catch (error) {



                console.error('Ocurrió un error al publicar el viaje:', error);



                const errorMessage = error.detail || 'No se pudo publicar el viaje. Por favor, inténtalo de nuevo más tarde.';



                alert(errorMessage);



            }



        });



    }







    // --- LISTENER PARA BOTÓN DE REDIRECCIÓN EN MODAL DE ERROR ---



    const botonIrAPerfil = document.getElementById('btn-ir-a-perfil');



    if (botonIrAPerfil) {



        botonIrAPerfil.addEventListener('click', () => {



            window.location.href = '/miperfil/';



        });



    }



    



    // Aquí podría ir la lógica de autocompletado si es necesaria



});
