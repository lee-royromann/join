/**
 * Tracks visibility state of password fields.
 * @type {{passwordReg: boolean, passwordConf: boolean}}
 */
let visiblePasswords = {
    passwordReg: false,
    passwordConf: false,
};


/**
 * Updates the icon for password input fields based on visibility and input content.
 * @param {string} id - The ID of the password input field.
 */
function updateSignupIcon(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (input.value.length > 0) {
        icon.src = visiblePasswords[id] ? '../assets/img/icon/visibility.svg' : '../assets/img/icon/visibility_off.svg';
    } else {
        icon.src = '../assets/img/icon/lock.svg';
    }
}


/**
 * Toggles password visibility for a given input field and updates the icon.
 * @param {string} id - The ID of the password input field.
 */
function toggleSignupVisibility(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    visiblePasswords[id] = !visiblePasswords[id];
    input.type = visiblePasswords[id] ? 'text' : 'password';
    icon.src = visiblePasswords[id] ? '../assets/img/icon/visibility.svg' : '../assets/img/icon/visibility_off.svg';
}


/**
 * Toggles the state of the checkbox and updates its image.
 * @param {Event} event - The triggering event.
 */
function toggleCheckbox(event) {
    event.preventDefault();
    const checkbox = document.getElementById("checkbox");
    const checkboxImage = document.getElementById("checkboxImg");
    let isChecked = checkbox.dataset.checked === "true";
    isChecked = !isChecked;
    checkbox.dataset.checked = isChecked;
    checkbox.checked = isChecked;
    checkboxImage.src = checkbox.checked ? "../assets/img/icon/checked.svg" : "../assets/img/icon/rectangle.svg";
}


/**
 * Handles hover state over the checkbox image and updates the icon accordingly.
 * @param {boolean} isHover - Whether the mouse is over the checkbox.
 * @param {Event} event - The triggering mouse event.
 */
function hoverImage(isHover, event) {
    event.preventDefault();
    const checkbox = document.getElementById("checkbox");
    const checkboxImage = document.getElementById("checkboxImg");
    if (checkbox.dataset.checked) {
        checkboxImage.src = isHover ? "../assets/img/icon/rectangle.svg" : "../assets/img/icon/checked.svg";
    }
    if (!checkbox.checked) {
        checkboxImage.src = isHover ? "../assets/img/icon/checked.svg" : "../assets/img/icon/rectangle.svg";
    }
}


/**
 * Prevents form submission if the checkbox is not checked.
 */
document.getElementById('signup').addEventListener("submit", function (event) {
    const checkbox = document.getElementById("checkbox");
    if (!checkbox.checked) {
        checkbox.reportValidity();
        event.preventDefault();
    }
});


/**
 * Displays an error message and highlights the input field with an error.
 * 
 * @param {string} inputLabel - The key identifying the input field with the error.
 */
function inputError(inputLabel) {
    let info = document.getElementById('errorPoppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}


/**
 * Returns a specific error message based on the input key.
 * 
 * @param {string} key - The key identifying the input type.
 * @returns {string} - The corresponding error message.
 */
function errorMessage(key) {
    const messages = {
        "Username": "Please check your name entry!",
        "EmailSignUp": "Please check your email entry!",
        "PasswordReg": "Please use 6 - 15 characters!",
        "PasswordConf": "Please use 6 - 15 characters!",
        "Checkbox": "Please accept the privacy policy!"
    };
    return messages[key] || "Unknown error!";
}


/**
 * Highlights the label of the input field by adding an error class.
 * 
 * @param {string} inputLabel - The key of the input field to highlight.
 */
function errorInputField(inputLabel) {
    if (inputLabel !== "Checkbox") {
        const label = document.getElementById('label' + inputLabel);
        if (label) {
            label.classList.add('error-border');
        }
    }
}


/**
 * Checks if the input value is empty after trimming whitespace.
 * 
 * @param {string} value - The input value to check.
 * @returns {boolean} - True if the input is empty, otherwise false.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}


/**
 * Reads values from input fields and returns them in an object.
 * 
 * @returns {Object} - An object containing all relevant input values.
 */
function readsTheInputValues() {
    return {
        username: document.getElementById('username').value,
        email: document.getElementById('emailSignUp').value,
        passwdReg: document.getElementById('passwordReg').value,
        passwdConf: document.getElementById('passwordConf').value,
        checkBox: document.getElementById('checkbox').dataset.checked
    };
}


/**
 * Validates all input values according to specified rules.
 * 
 * @returns {string|undefined} - The key of the invalid input or undefined if all are valid.
 */
function checkValues() {
    let { username, email, passwdReg, passwdConf, checkBox } = readsTheInputValues();
    if (checkEmptyInput(username) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(username)) return "Username";
    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "EmailSignUp";
    if (checkEmptyInput(passwdReg) || !/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/.test(passwdReg)) return "PasswordReg";
    if (checkEmptyInput(passwdConf) || !/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/.test(passwdConf)) return "PasswordConf";
    if (checkBox !== "true") return "Checkbox";
}


/**
 * Checks input values and triggers error handling if any input is invalid.
 * 
 * @returns {boolean} - True if an error is found, otherwise false.
 */
function checkValueInput() {
    let input = checkValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}

