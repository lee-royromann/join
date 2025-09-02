// ===================================================================
// Global Variables and Initialization
// ===================================================================

/**
 * Initializes the page on every load. Retrieves URL parameters to 
 * display success messages (e.g., after registration) and 
 * starts a small animation for the logo.
 */
const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');
let info = document.getElementById('poppin');
let isPasswordVisible = false;

setTimeout(() => {
    document.getElementById('logoImg').classList.remove('d-none');
}, 1060);

if (msg) {
    info.classList.remove('opacity');
    info.classList.add('poppins-success');
    info.innerHTML = msg;
} else {
    info.classList.add('opacity');
    info.classList.remove('poppins-success');
}


// ===================================================================
// LOGIN FUNCTIONS
// ===================================================================


/**
 * Asynchronous function to handle user login.
 * Validates inputs, matches them against loaded user data,
 * and stores user information in localStorage on success
 * before redirecting.
 */
async function login() {
    // Ensures that any guest status is removed.
    sessionStorage.removeItem('userMode');

    if (checkValueInput()) return;
    spinningLoaderStart();

    let emailInput = document.getElementById('email');
    let passwordInput = document.getElementById('password');

    try {
        const users = await loadUsers();
        spinningLoaderEnd();

        let user = users.find(
            u => u && u.email === emailInput.value && u.password === passwordInput.value
        );

        if (user) {
            // Successful login
            const username = `${user.prename || ''} ${user.surname || ''}`.trim();
            localStorage.setItem("username", username);
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("currentUserEmail", user.email);
            localStorage.setItem("currentUserId", user.id);

            localStorage.removeItem("greetingShown");

            window.location.href = `html/summary.html?name=${encodeURIComponent(username)}&login=true`;
        } else {
            displayErrorLogin();
        }
    } catch (error) {
        console.error("An error occurred during login:", error);
        spinningLoaderEnd();
        displayErrorLogin();
    }
}


/**
 * Displays a general error message for a failed login.
 * Highlights the password field and shows a corresponding message.
 */
function displayErrorLogin() {
    document.getElementById('labelPassword').classList.add('error-border');
    info.classList.remove('opacity');
    info.innerHTML = "Check your e-mail and password.<br> Please try again.";
}


/**
 * Logs in a user as guest by setting a flag in sessionStorage
 * and then redirects to the overview page.
 * @param {Event} event - The click event to prevent the default form action.
 */
function guestLogin(event) {
    event.preventDefault();
    // console.log("Guest mode is being activated...");
    sessionStorage.setItem('userMode', 'guest');

    localStorage.removeItem("greetingShown");

    window.location.href = 'html/summary.html';
}


// ===================================================================
// HELPER FUNCTIONS
// ===================================================================


/**
 * Updates the icon in the password field based on its content 
 * and visibility status.
 * Shows a lock icon for an empty field, otherwise an eye (visible/hidden).
 */
function updatePasswdIcon() {
    const passwdInput = document.getElementById('password');
    const passwdIcon = document.getElementById('passwdIcon');
    if (passwdInput.value.length > 0) {
        passwdIcon.src = isPasswordVisible
            ? '../assets/img/icon/visibility.svg'
            : '../assets/img/icon/visibility_off.svg';
    } else {
        passwdIcon.src = '../assets/img/icon/lock.svg';
    }
}


/**
 * Toggles the visibility of the password input (text vs. password)
 * and updates the corresponding icon.
 */
function togglePasswordVisibility() {
    const passwdInput = document.getElementById('password');
    const passwdIcon = document.getElementById('passwdIcon');
    isPasswordVisible = !isPasswordVisible;
    passwdInput.type = isPasswordVisible ? 'text' : 'password';
    passwdIcon.src = isPasswordVisible
        ? '../assets/img/icon/visibility.svg'
        : '../assets/img/icon/visibility_off.svg';
}


/**
 * Checks form inputs for validity. If an error is found, 
 * an error message is displayed.
 * @returns {boolean} `true` if there is an input error, otherwise `false`.
 */
function checkValueInput() {
    let input = checkValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}


/**
 * Validates the values from the input fields.
 * @returns {string|undefined} The name of the field ("Email" or "Password") if an error is found, otherwise `undefined`.
 */
function checkValues() {
    let { email, password } = readsTheInputValues();
    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email";
    if (checkEmptyInput(password)) return "Password";
}


/**
 * Reads the current values from the email and password input fields.
 * @returns {object} An object containing the values for `email` and `password`.
 */
function readsTheInputValues() {
    return {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
}


/**
 * Checks whether a given string is empty or consists only of whitespace.
 * @param {string} value - The string to check.
 * @returns {boolean} `true` if the string is empty, otherwise `false`.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}


/**
 * Displays an error message and marks the invalid input field.
 * @param {string} inputLabel - The name of the field that caused the error (e.g., "Email").
 */
function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}


/**
 * Returns a predefined error message based on a key.
 * @param {string} key - The error key ("Email" or "Password").
 * @returns {string} The corresponding error message.
 */
function errorMessage(key) {
    const messages = {
        "Email": "Please check your email entry!",
        "Password": "Please check your password!"
    };
    return messages[key] || "Unknown error!";
}


/**
 * Adds a CSS class to a form label to visually mark it as invalid.
 * @param {string} inputLabel - The name of the label (e.g., "Email") to be marked.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}
