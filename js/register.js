// ⚠️ WICHTIGER SICHERHEITSHINWEIS:
// Dieser Code speichert Passwörter im Klartext. Das ist ein hohes Sicherheitsrisiko.
// Es wird dringend empfohlen, auf Firebase Authentication umzusteigen, um Passwörter sicher zu verwalten.

/**
 * Fehlermeldung für nicht übereinstimmende Passwörter.
 * @type {string}
 */
let textPasswdError = "Ups! your password don't match!";

/**
 * Fehlermeldung für bereits existierende E-Mail.
 * @type {string}
 */
let textEmailError = "The e-mail already exists!";


/**
 * Hauptfunktion: Registriert einen neuen Benutzer und fügt ihn zu den Kontakten hinzu.
 */
async function addUser() {
    // Annahme: checkValueInput() ist eine Funktion, die leere Felder prüft.
    if (checkValueInput()) return;
    spinningLoaderStart();

    const userInput = getFormElements();
    const emailValue = userInput.email.value;
    const usernameValue = userInput.username.value;

    // Schritt 1: Passwörter prüfen
    if (!checkSamePasswd(userInput.password.value, userInput.confirm.value)) return;

    // Schritt 2: Prüfen, ob die E-Mail bereits als Benutzer existiert
    if (await checkUserExists(emailValue)) return;

    // Schritt 3: Das neue Benutzer-Objekt erstellen
    const newUser = createUserObject(usernameValue, emailValue, userInput.password.value);

    try {
        // Schritt 4: Den neuen Benutzer in Firebase anlegen (erzeugt einzigartige ID)
        await fetch(BASE_URL + "/join/users.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

        // Schritt 5: Den neuen Benutzer AUCH als neuen Kontakt anlegen (JETZT KORRIGIERT)
        await addUserToContacts(usernameValue, emailValue);

        // Schritt 6: Erfolg anzeigen und weiterleiten
        spinningLoaderEnd();
        showOverlaySuccessful();

    } catch (error) {
        console.error("Ein Fehler ist während des Registrierungsprozesses aufgetreten:", error);
        spinningLoaderEnd();
        alert("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
}


/**
 * Fügt den neuen Benutzer als separaten Eintrag zur Kontaktliste in Firebase hinzu.
 * VERURSACHT KEIN ÜBERSCHREIBEN MEHR.
 * @param {string} username - Der Name des neuen Kontakts.
 * @param {string} email - Die E-Mail des neuen Kontakts.
 */
async function addUserToContacts(username, email) {
    const newContact = {
        username: username,
        email: email,
        phone: "", // Standardwert für das Telefonfeld
        color: getUniqueAvatarColor()  // Standardfarbe
    };

    // Verwendet ebenfalls POST, um einen neuen Kontakt hinzuzufügen, ohne andere zu löschen.
    // Annahme: Dein Pfad für Kontakte ist /join/contacts.json
    await fetch(BASE_URL + "/join/contacts.json", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
    });
}


/**
 * Prüft effizient über eine Firebase-Abfrage, ob eine E-Mail bereits existiert.
 * @param {string} email - Die zu prüfende E-Mail-Adresse.
 * @returns {Promise<boolean>} True, wenn die E-Mail existiert, sonst false.
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

function createUserObject(username, email, password) {
    return { username, email, password };
}

function showOverlaySuccessful() {
    let overlay = document.getElementById('success');
    overlay.classList.remove('d-none');
    overlay.classList.add('overlay-successful');
    setTimeout(() => {
        window.location.href = '../index.html?msg=You have successfully registered.';
    }, 1500);
}
