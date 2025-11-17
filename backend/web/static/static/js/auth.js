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
