/**
 * Function to toggle the visibility of the user menu in the header for mobile mode
 * It toggles the class 'header__burger-menu--visible' on the element with id 'burger-menu'.
 * This class controls the visibility of the user menu.
 */
function toggleBoardTaskMenu(event, taskId) {
    event.stopPropagation();
    document.querySelectorAll('.card__burger-menu--visible')
        .forEach(menu => menu.classList.remove('card__burger-menu--visible'));
    const userMenu = document.getElementById('card-menu-' + taskId);
    userMenu.classList.toggle('card__burger-menu--visible');
}

/**
 * Close burger menue when clicking somewhere else
 */
document.addEventListener('click', function () {
    document.querySelectorAll('.card__burger-menu--visible')
        .forEach(menu => menu.classList.remove('card__burger-menu--visible'));
});
