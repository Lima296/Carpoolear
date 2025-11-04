document.addEventListener('DOMContentLoaded', () => {
  // Selecciona específicamente el dropdown del perfil de usuario
  const userDropdownElement = document.querySelector('.profile-link');
  if (!userDropdownElement) return;

  const userDropdown = userDropdownElement.closest('.dropdown');
  if (!userDropdown) return;

  const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
  const dropdownInstance = new bootstrap.Dropdown(userDropdownElement);

  let isHiding = false;

  userDropdown.addEventListener('show.bs.dropdown', (event) => {
    if (isHiding) {
      event.preventDefault();
      return;
    }
    // Aplica la animación de entrada
    dropdownMenu.classList.remove('anim-fade-out');
    dropdownMenu.classList.add('anim-fade-in');
  });

  userDropdown.addEventListener('hide.bs.dropdown', (event) => {
    // Previene que Bootstrap oculte el menú inmediatamente
    event.preventDefault();
    if (isHiding) return; // Evita ejecuciones múltiples
    isHiding = true;

    // Aplica la animación de salida
    dropdownMenu.classList.remove('anim-fade-in');
    dropdownMenu.classList.add('anim-fade-out');

    // Espera a que la animación termine para ocultarlo de verdad
    setTimeout(() => {
      // Elimina manualmente la clase que lo mantiene abierto en el layout
      dropdownMenu.classList.remove('show'); 
      isHiding = false;
    }, 300); // Debe coincidir con la duración de la animación en CSS (0.3s)
  });
});
