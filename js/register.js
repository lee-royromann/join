// ⚠️ WICHTIGER SICHERHEITSHINWEIS:
// Dieser Code speichert Passwörter im Klartext. Das ist ein hohes Sicherheitsrisiko.
// Es wird dringend empfohlen, auf Firebase Authentication umzusteigen, um Passwörter sicher zu verwalten.

let textPasswdError = "Ups! your password don't match!";
let textEmailError = "The e-mail already exists!";

/**
 * NEU & BEHOBEN: Erzeugt eine zufällige, helle Farbe für den Avatar.
 * @returns {string} Ein Hex-Farbcode, z.B. "#A0C4FF".
 */
function getUniqueAvatarColor() {
    const letters = '89ABCDEF'; // Helle Farben für bessere Lesbarkeit
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

/**
 * Holt die nächste verfügbare, fortlaufende ID aus Firebase.
 * @param {string} counterName - Der Name des Zählers (z.B. 'users' oder 'contacts').
 * @returns {Promise<number|null>} Die neue ID oder null bei einem Fehler.
 */
async function getNextId(counterName) {
    try {
        const response = await fetch(`${BASE_URL}/counters/${counterName}.json`);
        const currentId = await response.json();
        const nextId = (currentId === null) ? 0 : Number(currentId) + 1;
        await fetch(`${BASE_URL}/counters/${counterName}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextId),
        });
        return nextId;
    } catch (error) {
        console.error(`Fehler beim Abrufen der nächsten ID für ${counterName}:`, error);
        return null;
    }
}

/**
 * Hauptfunktion: Registriert einen neuen Benutzer mit der gleichen Struktur wie ein Kontakt.
 */
async function addUser() {
    if (checkValueInput()) return;
    spinningLoaderStart();

    const userInput = getFormElements();
    const emailValue = userInput.email.value;
    const usernameValue = userInput.username.value;

    if (!checkSamePasswd(userInput.password.value, userInput.confirm.value)) return;
    if (await checkUserExists(emailValue)) return;

    try {
        const newUserId = await getNextId('users');
        if (newUserId === null) throw new Error("Konnte keine neue Benutzer-ID erstellen.");

        const nameParts = usernameValue.trim().split(' ');
        const prename = nameParts.shift() || '';
        const surname = nameParts.join(' ') || '';

        const newUser = {
            id: newUserId,
            prename: prename,
            surname: surname,
            email: emailValue,
            password: userInput.password.value,
            phone: "",
            mobile: "",
            color: getUniqueAvatarColor() // Dieser Aufruf funktioniert jetzt
        };

        await fetch(`${BASE_URL}/join/users/${newUserId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

        await addUserToContacts(prename, surname, emailValue, newUser.phone, newUser.color);

        spinningLoaderEnd();
        showOverlaySuccessful();

    } catch (error) {
        // Hier wurde der Fehler vorher ausgelöst
        console.error("Ein Fehler ist während des Registrierungsprozesses aufgetreten:", error);
        spinningLoaderEnd();
        alert("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
}

/**
 * Fügt den neuen Benutzer als separaten Eintrag zur Kontaktliste hinzu.
 */
async function addUserToContacts(prename, surname, email, phone, color) {
    const newContactId = await getNextId('contacts');
    if (newContactId === null) throw new Error("Konnte keine neue Kontakt-ID erstellen.");
    
    const newContact = {
        id: newContactId,
        prename: prename,
        surname: surname,
        email: email,
        phone: phone,
        mobile: "",
        color: color
    };
    
    await fetch(`${BASE_URL}/join/contacts/${newContactId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
    });
}

/**
 * Prüft effizient, ob eine E-Mail bereits existiert.
 */
async function checkUserExists(email) {
    prepareEmailValidationUI();
    const encodedEmail = encodeURIComponent(email);
    const queryUrl = `${BASE_URL}/join/users.json?orderBy="email"&equalTo="${encodedEmail}"`;
    try {
        const response = await fetch(queryUrl);
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
            spinningLoaderEnd();
            showEmailExistsError();
            return true;
        }
        return false;
    } catch (error) {
        console.error("FEHLER bei der E-Mail-Prüfung:", error);
        spinningLoaderEnd();
        return true;
    }
}

// ===================================================================
// UNVERÄNDERTE HILFSFUNKTIONEN
// ===================================================================
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

function prepareEmailValidationUI() {
    document.getElementById('labelEmailSignUp').classList.remove('error-border');
    document.getElementById('errorPoppin').classList.add('opacity');
}

function showEmailExistsError() {
    const label = document.getElementById('labelEmailSignUp');
    const errorMsg = document.getElementById('errorPoppin');
    label.classList.add('error-border');
    errorMsg.classList.remove('opacity');
    errorMsg.innerHTML = textEmailError;
}

function showOverlaySuccessful() {
    let overlay = document.getElementById('success');
    overlay.classList.remove('d-none');
    overlay.classList.add('overlay-successful');
    setTimeout(() => {
        window.location.href = '../index.html?msg=You have successfully registered.';
    }, 1500);
}
