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

getUsernameInitals();