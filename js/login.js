// ===================================================================
// Globale Variablen und Initialisierung
// ===================================================================

/**
 * Initialisiert die Seite bei jedem Laden. Holt URL-Parameter, um
 * Erfolgsmeldungen (z.B. nach der Registrierung) anzuzeigen und
 * startet eine kleine Animation für das Logo.
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
// LOGIN-FUNKTIONEN
// ===================================================================


/**
 * Asynchrone Funktion zur Abwicklung des Benutzer-Logins.
 * Validiert die Eingaben, gleicht sie mit den geladenen Benutzerdaten ab
 * und speichert bei Erfolg die Benutzerinformationen im localStorage,
 * bevor eine Weiterleitung erfolgt.
 */
async function login() {
    // Stellt sicher, dass ein eventueller Gast-Status entfernt wird.
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
            // Erfolgreicher Login
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
        console.error("Ein Fehler ist beim Login aufgetreten:", error);
        spinningLoaderEnd();
        displayErrorLogin();
    }
}


/**
 * Zeigt eine allgemeine Fehlermeldung für einen fehlgeschlagenen Login an.
 * Hebt das Passwortfeld hervor und blendet eine entsprechende Nachricht ein.
 */
function displayErrorLogin() {
    document.getElementById('labelPassword').classList.add('error-border');
    info.classList.remove('opacity');
    info.innerHTML = "Check your e-mail and password.<br> Please try again.";
}


/**
 * Loggt einen Benutzer als Gast ein, indem ein Flag im sessionStorage gesetzt wird,
 * und leitet ihn dann zur Übersichtsseite weiter.
 * @param {Event} event - Das Klick-Event, um die Standard-Formularaktion zu verhindern.
 */
function guestLogin(event) {
    event.preventDefault();
    // console.log("Gastmodus wird aktiviert...");
    sessionStorage.setItem('userMode', 'guest');

    localStorage.removeItem("greetingShown");

    window.location.href = 'html/summary.html';
}


// ===================================================================
// HILFSFUNKTIONEN
// ===================================================================


/**
 * Aktualisiert das Icon im Passwortfeld basierend auf dem Inhalt und Sichtbarkeitsstatus.
 * Zeigt ein Schloss-Icon bei leerem Feld, ansonsten ein Auge (sichtbar/unsichtbar).
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
 * Schaltet die Sichtbarkeit des Passworts im Eingabefeld um (Text vs. Passwort)
 * und aktualisiert das zugehörige Icon.
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
 * Prüft die Formulareingaben auf Gültigkeit. Wenn ein Fehler gefunden wird,
 * wird eine Fehlermeldung angezeigt.
 * @returns {boolean} `true`, wenn ein Eingabefehler vorliegt, andernfalls `false`.
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
 * Validiert die Werte aus den Eingabefeldern.
 * @returns {string|undefined} Den Namen des Feldes ("Email" oder "Password") bei einem Fehler, sonst `undefined`.
 */
function checkValues() {
    let { email, password } = readsTheInputValues();
    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email";
    if (checkEmptyInput(password)) return "Password";
}


/**
 * Liest die aktuellen Werte aus den E-Mail- und Passwort-Eingabefeldern.
 * @returns {object} Ein Objekt mit den Werten für `email` und `password`.
 */
function readsTheInputValues() {
    return {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
}


/**
 * Überprüft, ob ein übergebener String leer oder nur aus Leerzeichen besteht.
 * @param {string} value - Der zu prüfende String.
 * @returns {boolean} `true`, wenn der String leer ist, sonst `false`.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}


/**
 * Zeigt eine Fehlermeldung an und markiert das fehlerhafte Eingabefeld.
 * @param {string} inputLabel - Der Name des Feldes, das den Fehler verursacht hat (z.B. "Email").
 */
function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}


/**
 * Gibt eine vordefinierte Fehlermeldung basierend auf einem Schlüssel zurück.
 * @param {string} key - Der Schlüssel der Fehlermeldung ("Email" oder "Password").
 * @returns {string} Die entsprechende Fehlermeldung.
 */
function errorMessage(key) {
    const messages = {
        "Email": "Please check your email entry!",
        "Password": "Please check your password!"
    };
    return messages[key] || "Unknown error!";
}


/**
 * Fügt einem Formular-Label eine CSS-Klasse hinzu, um es visuell als fehlerhaft zu markieren.
 * @param {string} inputLabel - Der Name des Labels (z.B. "Email"), das markiert werden soll.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}