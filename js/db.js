// ===================================================================
// HINWEIS:
// Diese Datei benötigt Zugriff auf die Funktionen aus `db.js`.
// Benötigte Funktionen: `loadUsers()`, `addUser()`, `addContact()`, `getNextId()`
// ===================================================================

let textPasswdError = "Ups! Your passwords don't match!";
let textEmailError = "The e-mail address already exists!";

/**
 * Registriert einen neuen Benutzer mit fortlaufender ID.
 */
async function registerUser() {
    // Verhindert, dass das Formular die Seite neu lädt
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

        // Holt die nächste freie ID für Benutzer.
        const newUserId = await getNextId('/join/users');
        
        // Finale Sicherheitsprüfung
        if (newUserId === undefined || newUserId === null) {
            console.error("Konnte keine gültige User-ID erhalten. Der Prozess wird abgebrochen.");
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

        // Dasselbe für den Kontakt-Eintrag
        const newContactId = await getNextId('/join/contacts');
        
        if (newContactId === undefined || newContactId === null) {
            console.error("Konnte keine gültige Kontakt-ID erhalten. Der Prozess wird abgebrochen.");
            spinningLoaderEnd();
            return;
        }

        const newContact = { ...newUser, id: newContactId };
        await addContact(newContact, newContactId);

        spinningLoaderEnd();
        showOverlaySuccessful();

    } catch (error) {
        console.error("Ein Fehler ist während des Registrierungsprozesses aufgetreten:", error);
        spinningLoaderEnd();
    }
}

// ===================================================================
// HILFSFUNKTIONEN 
// ===================================================================

function getUniqueAvatarColor() {
    const letters = '89ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function getFormElements() {
    return {
        username: document.getElementById('username'),
        email: document.getElementById('emailSignUp'),
        password: document.getElementById('passwordReg'),
        confirm: document.getElementById('passwordConf')
    };
}

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

function showEmailExistsError() {
    const label = document.getElementById('labelEmailSignUp');
    const errorMsg = document.getElementById('errorPoppin');
    label.classList.add('error-border');
    if (errorMsg) {
        errorMsg.classList.remove('opacity');
        errorMsg.innerHTML = textEmailError;
    }
}

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







