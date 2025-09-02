// ===================================================================
// NOTE:
// This file requires access to functions from `db.js`.
// Required functions: `loadUsers()`, `addUser()`, `addContact()`, `getNextId()`
// ===================================================================

let textPasswdError = "Oops! Your passwords don't match!";
let textEmailError = "The e-mail address already exists!";


/**
 * Registers a new user asynchronously.
 * This function processes the inputs from the registration form,
 * validates the data, checks for duplicate email addresses,
 * creates a new user and a corresponding contact, and saves them
 * in the database.
 */
async function registerUser() {
    // Prevents the form from reloading the page
    if (event) {
        event.preventDefault();
    }

    if (checkValueInput()) return;
    spinningLoaderStart();

    const userInput = getFormElements();
    const emailValue = userInput.email.value;
    const usernameValue = userInput.username.value;
    const passwordValue = userInput.password.value;
    const confirmValue = userInput.confirm.value;

    if (!checkSamePasswd(passwordValue, confirmValue)) return;

    try {
        await loadUsers();
        const emailExists = usersFirebase.some(user => user && user.email === emailValue);

        if (emailExists) {
            spinningLoaderEnd();
            showEmailExistsError();
            return;
        }

        // Get the next available ID for users.
        const newUserId = await getNextId('/join/users');
        
        // Final safety check
        if (newUserId === undefined || newUserId === null) {
            console.error("Could not retrieve a valid user ID. Process aborted.");
            spinningLoaderEnd();
            return;
        }

        const nameParts = usernameValue.trim().split(' ');
        const prename = nameParts.shift() || '';
        const surname = nameParts.join(' ') || '';
        const userColor = getUniqueAvatarColor();

        const newUser = {
            id: newUserId,
            prename: prename,
            surname: surname,
            email: emailValue,
            password: passwordValue,
            phone: "",
            color: userColor
        };

        await addUser(newUser, newUserId);

        // Do the same for the contact entry
        const newContactId = await getNextId('/join/contacts');
        
        if (newContactId === undefined || newContactId === null) {
            console.error("Could not retrieve a valid contact ID. Process aborted.");
            spinningLoaderEnd();
            return;
        }

        const newContact = { ...newUser, id: newContactId };
        await addContact(newContact, newContactId);

        spinningLoaderEnd();
        showOverlaySuccessful();

    } catch (error) {
        console.error("An error occurred during the registration process:", error);
        spinningLoaderEnd();
    }
}


// ===================================================================
// HELPER FUNCTIONS 
// ===================================================================


/**
 * Generates a random bright hex color code for user avatars.
 * Uses only characters that lead to lighter shades.
 * @returns {string} A hex color code in the format '#RRGGBB'.
 */
function getUniqueAvatarColor() {
    const letters = '89ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}


/**
 * Collects the DOM elements of the registration form.
 * @returns {object} An object containing references to the form input elements.
 */
function getFormElements() {
    return {
        username: document.getElementById('username'),
        email: document.getElementById('emailSignUp'),
        password: document.getElementById('passwordReg'),
        confirm: document.getElementById('passwordConf')
    };
}


/**
 * Checks whether two passwords match and updates the UI accordingly.
 * @param {string} a - The first password.
 * @param {string} b - The second password for confirmation.
 * @returns {boolean} Returns `true` if the passwords match, otherwise `false`.
 */
function checkSamePasswd(a, b) {
    let labelPassw = document.getElementById('labelPasswordConf');
    let poppinError = document.getElementById('errorPoppin');
    labelPassw.classList.remove('error-border');
    if (poppinError) poppinError.classList.add('opacity');

    if (a !== b) {
        spinningLoaderEnd();
        labelPassw.classList.add('error-border');
        if (poppinError) {
            poppinError.classList.remove('opacity');
            poppinError.innerHTML = textPasswdError;
        }
        return false;
    }
    return true;
}


/**
 * Displays an error message in the UI when the email address already exists.
 * Highlights the email field and shows a corresponding message.
 */
function showEmailExistsError() {
    const label = document.getElementById('labelEmailSignUp');
    const errorMsg = document.getElementById('errorPoppin');
    label.classList.add('error-border');
    if (errorMsg) {
        errorMsg.classList.remove('opacity');
        errorMsg.innerHTML = textEmailError;
    }
}


/**
 * Displays an overlay for a successful registration and redirects
 * the user to the start page after a short delay.
 */
function showOverlaySuccessful() {
    let overlay = document.getElementById('success');
    if (overlay) {
        overlay.classList.remove('d-none');
        overlay.classList.add('overlay-successful');
        setTimeout(() => {
            window.location.href = '../index.html?msg=You have successfully registered.';
        }, 1500);
    }
}
