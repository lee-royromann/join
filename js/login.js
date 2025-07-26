// ===================================================================
// Globale Variablen und Initialisierung
// ===================================================================

/**
 * Globales Array, das die aus Firebase geladenen Benutzerobjekte speichert.
 * @type {Array<Object>}
 */
let userFirebase = [];

const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');
let info = document.getElementById('poppin');
let isPasswordVisible = false;

// Logo mit Verzögerung einblenden
setTimeout(() => {
    document.getElementById('logoImg').classList.remove('d-none');
}, 1060);

// Erfolgsmeldung von der Registrierung anzeigen, falls vorhanden
if (msg) {
    info.classList.remove('opacity');
    info.classList.add('poppins-success');
    info.innerHTML = msg;
} else {
    info.classList.add('opacity');
    info.classList.remove('poppins-success');
}


// ===================================================================
// KORRIGIERTE LOGIN-FUNKTIONEN
// ===================================================================

/**
 * Versucht, den Benutzer mit den eingegebenen Daten einzuloggen.
 * Die Funktion lädt die neue Datenstruktur und findet den passenden Benutzer.
 */
async function login() {
    // Annahme: checkValueInput() prüft auf leere/falsche Formate
    if (checkValueInput()) return;
    spinningLoaderStart();

    let emailInput = document.getElementById('email');
    let passwordInput = document.getElementById('password');

    // Schritt 1: Lädt alle Benutzer und konvertiert sie in ein Array
    await loadUserData();
    spinningLoaderEnd();

    // DEBUG: Gib das Array aus, um zu sehen, ob die Daten korrekt ankommen
    console.log("Geladene Benutzer für den Login-Check:", userFirebase);

    // Schritt 2: Findet den Benutzer im Array, bei dem E-Mail UND Passwort übereinstimmen
    let user = userFirebase.find(
        u => u.email === emailInput.value && u.password === passwordInput.value
    );

    // Schritt 3: Reaktion auf das Ergebnis
    if (user) {
        // Erfolg! Benutzer gefunden.
        console.log("Login erfolgreich für Benutzer:", user.username);
        localStorage.setItem("username", user.username);
        localStorage.setItem("loggedIn", "true");
        window.location.href = `html/summary.html?name=${encodeURIComponent(user.username)}&login=true`;
        userFirebase = []; // Array zurücksetzen
    } else {
        // Fehler! Kein passender Benutzer gefunden.
        console.error("Login fehlgeschlagen. E-Mail oder Passwort falsch.");
        displayErrorLogin();
    }
}


/**
 * Lädt die Benutzerdaten aus Firebase und wandelt das Objekt in ein nutzbares Array um.
 */
async function loadUserData() {
    try {
        const data = await loadUsersFromFirebase(); // Diese Funktion holen wir uns zurück
        if (data) {
            // Wandelt das Firebase-Objekt ({ "ID1": user1, "ID2": user2 })
            // in ein Array ([user1, user2]) um. Das ist der entscheidende Schritt.
            userFirebase = Object.values(data);
        } else {
            userFirebase = [];
        }
    } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
        userFirebase = []; // Sicherstellen, dass das Array im Fehlerfall leer ist
    }
}


/**
 * Notwendige Hilfsfunktion: Holt die Rohdaten aller Benutzer von Firebase.
 * Diese Funktion muss hier vorhanden sein, damit `loadUserData` funktioniert.
 */
async function loadUsersFromFirebase() {
    // Annahme: BASE_URL ist eine global definierte Variable mit deiner Firebase-URL
    const response = await fetch(BASE_URL + "/join/users.json");
    return await response.json();
}


/**
 * Zeigt eine Fehlermeldung an, wenn der Login fehlschlägt.
 */
function displayErrorLogin() {
    document.getElementById('labelPassword').classList.add('error-border');
    info.classList.remove('opacity');
    info.innerHTML = "Check your e-mail and password.<br> Please try again.";
}

// ===================================================================
// UNVERÄNDERTE HILFSFUNKTIONEN (Guest Login, Passwort-Sichtbarkeit etc.)
// ===================================================================

function guestLogin(event) {
    event.preventDefault();
    document.getElementById('email').removeAttribute('required');
    document.getElementById('password').removeAttribute('required');
    localStorage.setItem("username", "Guest");
    localStorage.setItem("loggedIn", "true");
    window.location.href = "html/summary.html?name=Guest&login=true";
}

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

function togglePasswordVisibility() {
    const passwdInput = document.getElementById('password');
    const passwdIcon = document.getElementById('passwdIcon');
    isPasswordVisible = !isPasswordVisible;
    passwdInput.type = isPasswordVisible ? 'text' : 'password';
    passwdIcon.src = isPasswordVisible
        ? '../assets/img/icon/visibility.svg'
        : '../assets/img/icon/visibility_off.svg';
}

// Die restlichen Validierungsfunktionen bleiben unverändert...
function checkValueInput() {
    let input = checkValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}

function checkValues() {
    let { email, password } = readsTheInputValues();
    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email";
    if (checkEmptyInput(password) || !/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/.test(password)) return "Password";
}

function readsTheInputValues() {
    return {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
}

function checkEmptyInput(value) {
    return value.trim() === "";
}

function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}

function errorMessage(key) {
    const messages = {
        "Email": "Please check your email entry!",
        "Password": "Please use 6 - 15 characters!"
    };
    return messages[key] || "Unknown error!";
}

function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}
