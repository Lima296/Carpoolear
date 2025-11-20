/**
 * Muestra un modal de éxito genérico con un mensaje personalizado.
 * @param {string} message - El mensaje que se mostrará en el modal.
 */
function showSuccessModal(message) {
    const modalElement = document.getElementById('genericSuccessModal');
    if (!modalElement) {
        console.error('El modal genérico de éxito no se encontró en el DOM.');
        // Fallback a un alert si el modal no existe
        alert(message);
        return;
    }

    const messageElement = document.getElementById('generic-success-message');
    if (messageElement) {
        messageElement.textContent = message;
    }

    // Asegurarse de que el modal se pueda reutilizar si ya estaba abierto
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement);
    }
    
    modalInstance.show();

    // Ocultar el modal después de 2 segundos
    setTimeout(() => {
        modalInstance.hide();
    }, 2000);
}
