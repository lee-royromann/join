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
const info = document.getElementById('poppin'); // kann null sein

setTimeout(() => {
    document.getElementById('logoImg').classList.remove('d-none');
}, 1060);

if (info && msg) {
    info.classList.remove('opacity');
    info.classList.add('poppins-success');
    info.innerHTML = msg;
} else if (info) {
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
    const clientErrors = checkLoginValues();
    if (clientErrors.length > 0) {
        inputErrorLogin(clientErrors);
        return;
    }

    spinningLoaderStart();
    try {
        const usersFromFn = await loadUsers();
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const email = (emailInput && emailInput.value ? emailInput.value : '').trim().toLowerCase();
        const password = (passwordInput && passwordInput.value ? passwordInput.value : '');

        const list = Array.isArray(usersFromFn) ? usersFromFn
                  : (Array.isArray(window.usersFirebase) ? window.usersFirebase : []);

        const user = list.find(u =>
            u &&
            typeof u.email === 'string' &&
            typeof u.password === 'string' &&
            u.email.toLowerCase() === email &&
            u.password === password
        );

        if (!user) {
            inputErrorLogin(['Credentials']);
            return;
        }

        clearLoginErrors();
        const username = `${user.prename || ''} ${user.surname || ''}`.trim();
        if (username) localStorage.setItem("username", username);
        localStorage.setItem("loggedIn", "true");
        if (user.email) localStorage.setItem("currentUserEmail", user.email);
        if (user.id !== undefined && user.id !== null) localStorage.setItem("currentUserId", user.id);
        localStorage.removeItem("greetingShown");

        window.location.href = `html/summary.html?name=${encodeURIComponent(username)}&login=true`;
    } catch (e) {
        console.error('Login error:', e);
        inputErrorLogin(['Credentials']);
    } finally {
        spinningLoaderEnd();
    }
}


/**
 * Displays a general error message for a failed login.
 * Highlights the password field and shows a corresponding message.
 */
function displayErrorLogin() {
    inputErrorLogin(['Credentials']); // zeigt "Invalid email or password." am Passwort-Feld
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
    const input = document.getElementById('password');
    const icon  = document.getElementById('passwdIcon');
    if (!input || !icon) return;
    if (input.value.length === 0) {icon.src = './assets/img/icon/lock.svg'; return;}
    const visible = input.type === 'text';
    icon.src = visible ? './assets/img/icon/visibility.svg' : './assets/img/icon/visibility_off.svg';
}


/**
 * Toggles the visibility of the password input (text vs. password)
 * and updates the corresponding icon.
 */
function togglePasswordVisibility() {
    const input = document.getElementById('password');
    if (!input) return;
    input.type = (input.type === 'password') ? 'text' : 'password';
    updatePasswdIcon();
}


/**
 * Checks form inputs for validity. If an error is found, 
 * an error message is displayed.
 * @returns {boolean} `true` if there is an input error, otherwise `false`.
 */
function checkValueInput() {
    let errors = checkValues();
    if (errors.length > 0) {
        inputError(errors);
        return true;
    }
    return false;
}


/**
 * Validates the values from the input fields.
 * @returns {Array<string>} An array of field names ("Email" or "Password") that have errors.
 */
function checkValues() {
    let { email, password } = readsTheInputValues();
    const errors = [];

    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Email");
    }
    if (checkEmptyInput(password)) {
        errors.push("Password");
    }
    return errors;
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
 * Displays an error message and marks the invalid input fields.
 * @param {Array<string>} inputLabels - The names of the fields that caused the error (e.g., ["Email", "Password"]).
 */
function inputError(inputLabels) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    
    let errorMessages = inputLabels.map(label => errorMessage(label)).join('<br>');
    info.innerHTML = errorMessages;

    inputLabels.forEach(label => {
        errorInputField(label);
    });
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


/**
 * Clears login field errors without removing containers.
 */
function clearLoginErrors() {
    document.querySelectorAll('#labelEmail, #labelPassword').forEach(label => label.classList.remove('error-border'));
    document.querySelectorAll('.input-error-msg').forEach(el => {
        el.textContent = '';
        el.classList.remove('is-visible');
    });
}


/** 
 * Ensures the error container for a given label (inside label first, then sibling).
 */
function ensureLoginErrorContainer(labelId) {
    const label = document.getElementById(labelId);
    if (!label) return null;
    let container = label.querySelector('.input-error-msg');
    if (container) return container;
    if (label.nextElementSibling && label.nextElementSibling.classList?.contains('input-error-msg')) {
        return label.nextElementSibling;
    }
    container = document.createElement('div');
    container.className = 'input-error-msg';
    label.insertAdjacentElement('afterend', container);
    return container;
}


/** 
 * Displays field-specific login errors and marks the label.
 */
function inputErrorLogin(keys) {
    clearLoginErrors();
    keys.forEach(key => {
    const labelId = key === 'Email' ? 'labelEmail' : 'labelPassword';
    const container = ensureLoginErrorContainer(labelId);
    if (container) {
        container.textContent = errorMessageLogin(key);
        container.classList.add('is-visible');
    }
    const label = document.getElementById(labelId);
    if (label) label.classList.add('error-border');
    });
}


/** 
 * Returns login-specific error messages. 
 */
function errorMessageLogin(key) {
    const messages = {
        Email: 'Please check your email entry!',
        Password: 'Please use 6 - 15 characters!',
        Credentials: 'Invalid email or password.'
    };
    return messages[key] || 'Unknown error!';
}


/** 
 * Validates login inputs and returns array of invalid keys. 
 */
function checkLoginValues() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errors = [];
    if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email');
    }
    if (password.trim() === '' || !/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/.test(password)) {
        errors.push('Password');
    }
    return errors;
}