/**
 * Function to get the username initials for the header logo
 * It's going to load the username from the local storage.
 * If it's a guest login it going to display "G" by default, if user is logged in it splits the fullname into first- and surname.
 * After that it's going to grab the first letter of each name. Finally it puts them together and writes it in the element.
 * @returns {void}
 */
function getUsernameInitals() {
    const element = document.getElementById('header__user');
    const username = localStorage.getItem('username');
    if (!username || username === "Guest") {
        element.innerHTML = "G";
        return;
    }
    const nameParts = username.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) {
        element.innerHTML = "G";
        return;
    }
    let initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    element.innerHTML = initials;
}


/**
 * Function to toggle the visibility of the user menu in the header
 * It toggles the class 'header__burger-menu--visible' on the element with id 'burger-menu'.
 * This class controls the visibility of the user menu.
 */
function toggleUserMenu(event) {
    event.stopPropagation();
    const userMenu = document.getElementById('burger-menu');
    userMenu.classList.toggle('header__burger-menu--visible');
}


/**
 * Event listener to close the user menu when clicking outside of it
 */
document.addEventListener('click', (event) => {
    const userMenu = document.getElementById('burger-menu');
    if (userMenu.classList.contains('header__burger-menu--visible') && !userMenu.contains(event.target) && event.target.id !== 'burger-button') {
        userMenu.classList.remove('header__burger-menu--visible');
    }
});


/**
 * Initializes the header with the username initials
 */
getUsernameInitals();