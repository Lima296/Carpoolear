// Verificar autenticación en cada carga de página
(function() {
    const publicPaths = ['/', '/inicio/'];
    const currentPath = window.location.pathname;

    if (!publicPaths.includes(currentPath)) {
        const accessToken = localStorage.getItem('access');
        if (!accessToken) {
            // No mostrar nada y redirigir
            document.body.style.display = 'none';
            window.location.href = '/';
        } else {
            // Si hay token, asegurarse de que el cuerpo sea visible
            document.body.style.display = 'block';
        }
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout-btn');

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the link from navigating

            // Clear authentication tokens
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');

            // Redirect to the home page
            window.location.href = '/';
        });
    }
});
