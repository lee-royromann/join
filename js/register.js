/**
 * Stores registered users.
 * @type {Array<Object>}
 */
let userFirebase = [];


/**
 * Password mismatch error text.
 * @type {string}
 */
let textPasswdError = "Ups! your password don't match!";


/**
 * Email already exists error text.
 * @type {string}
 */
let textEmailError = "The e-mail already exists!";


/**
 * Adds a new user from the sign-up form, saves to Firebase, and shows success overlay.
 */
async function addUser() {
    if (checkValueInput()) return;
    spinningLoaderStart();
    const userInput = getFormElements();
    if (!checkSamePasswd(userInput.password.value, userInput.confirm.value)) return;
    if (await checkUserExists(userInput.email.value)) return;
    const newUser = createUserObject(userInput.username.value, userInput.email.value, userInput.password.value);
    userFirebase.push(newUser);
    await saveUsersToFirebase();
    await addUserToContacts(userInput.username, userInput.email);
    spinningLoaderEnd();
    showOverlaySuccessful();
}


/**
 * Retrieves form field elements.
 * @returns {{username: HTMLElement, email: HTMLElement, password: HTMLElement, confirm: HTMLElement}}
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
 * Adds a new user also to the contacts list.
 * @param {HTMLElement} username - Username field element.
 * @param {HTMLElement} email - Email field element.
 */
async function addUserToContacts(username, email) {
    await loadContactsFromFirebase();
    createUserForContacts(username, email);
    await saveContactsToFirebase();
    contactsFirebase = [];
}


/**
 * Pushes new contact data into contactsFirebase array.
 * @param {HTMLElement} n - Username field.
 * @param {HTMLElement} e - Email field.
 */
function createUserForContacts(n, e) {
    let newContact = {
        id: contactsFirebase.length,
        username: n.value,
        email: e.value,
        phone: "",
        color: "brown"
    };
    contactsFirebase.push(newContact);
}


/**
 * Checks if the password and confirmation match.
 * @param {string} a - Password.
 * @param {string} b - Password confirmation.
 * @returns {boolean} True if match, false otherwise.
 */
function checkSamePasswd(a, b) {
    let labelPassw = document.getElementById('labelPasswordConf');
    let poppinError = document.getElementById('errorPoppin');
    labelPassw.classList.remove('error-border');
    poppinError.classList.add('opacity');
    if (a !== b) {
        spinningLoaderEnd();
        labelPassw.classList.add('error-border');
        poppinError.classList.remove('opacity');
        poppinError.innerHTML = textPasswdError;
        return false;
    }
    return true;
}


/**
 * Checks if an email is already in use in Firebase.
 * @param {string} email - Email address to check.
 * @returns {Promise<boolean>} True if user exists.
 */
async function checkUserExists(email) {
    prepareEmailValidationUI();
    try {
        const data = await loadUsersFromFirebase();
        userFirebase = Object.values(data || {});
        return checkIfEmailExists(data, email);
    } catch (error) {
        console.error("Fehler beim Prüfen der E-Mail:", error);
        resetUserArray();
        return true;
    }
}


/**
 * Clears previous email validation errors.
 */
function prepareEmailValidationUI() {
    document.getElementById('labelEmailSignUp').classList.remove('error-border');
    document.getElementById('errorPoppin').classList.add('opacity');
}

/**
 * Loads all users from Firebase.
 * @returns {Promise<Object>} Parsed users object.
 */
async function loadUsersFromFirebase() {
    const response = await fetch(BASE_URL + "/join/users.json");
    return await response.json();
}


/**
 * Checks if the email already exists in user data.
 * @param {Object} data - All user data from Firebase.
 * @param {string} email - Email to check.
 * @returns {boolean} True if email exists.
 */
function checkIfEmailExists(data, email) {
    for (const id in data) {
        if (data[id].email === email) {
            spinningLoaderEnd();
            showEmailExistsError();
            resetUserArray();
            return true;
        }
    }
    return false;
}


/**
 * Displays an error when email already exists.
 */
function showEmailExistsError() {
    const label = document.getElementById('labelEmailSignUp');
    const errorMsg = document.getElementById('errorPoppin');
    label.classList.add('error-border');
    errorMsg.classList.remove('opacity');
    errorMsg.innerHTML = textEmailError;
}


/**
 * Creates a new user object.
 * @param {string} username - The username.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {{username: string, email: string, password: string}} New user object.
 */
function createUserObject(username, email, password) {
    return { username, email, password };
}


/**
 * Shows success overlay and redirects after registration.
 */
function showOverlaySuccessful() {
    let overlay = document.getElementById('success');
    overlay.classList.remove('d-none');
    overlay.classList.add('overlay-successful');
    setTimeout(() => {
        window.location.href = '../index.html?msg=You have successfully registered.';
    }, 1500);
}


/**
 * Resets the `userFirebase` array.
 */
function resetUserArray() {
    userFirebase = [];
}