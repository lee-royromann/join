// ===================================================================
// Globale Variablen und Initialisierung
// ===================================================================

// HINWEIS: Die `userFirebase`-Variable wurde hier entfernt, um Konflikte zu vermeiden.
// Wir holen die Daten direkt von der `loadUsers()`-Funktion.

const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');
let info = document.getElementById('poppin');
let isPasswordVisible = false;

// UI-Initialisierung...
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
// LOGIN-FUNKTIONEN (KORRIGIERT)
// ===================================================================

async function login() {
    if (checkValueInput()) return;
    spinningLoaderStart();

    let emailInput = document.getElementById('email');
    let passwordInput = document.getElementById('password');

    try {
        // KORREKTUR: Die geladenen Benutzer werden in einer lokalen Konstante gespeichert.
        const users = await loadUsers();
        spinningLoaderEnd();

        console.log("Benutzerdaten, die für den Login-Check bereitstehen:", users);

        // Wir verwenden die lokale `users`-Konstante für die Prüfung.
        let user = users.find(
            u => u && u.email === emailInput.value && u.password === passwordInput.value
        );

        if (user) {
            const username = `${user.prename || ''} ${user.surname || ''}`.trim();
            console.log("Login erfolgreich für Benutzer:", username);
            localStorage.setItem("username", username);
            localStorage.setItem("loggedIn", "true");
            window.location.href = `html/summary.html?name=${encodeURIComponent(username)}&login=true`;
        } else {
            console.error("Login fehlgeschlagen. E-Mail oder Passwort falsch.");
            displayErrorLogin();
        }
    } catch (error) {
        console.error("Ein Fehler ist beim Login aufgetreten:", error);
        spinningLoaderEnd();
        displayErrorLogin();
    }
}

function displayErrorLogin() {
    document.getElementById('labelPassword').classList.add('error-border');
    info.classList.remove('opacity');
    info.innerHTML = "Check your e-mail and password.<br> Please try again.";
}

// ===================================================================
// HILFSFUNKTIONEN (unverändert)
// ===================================================================

function guestLogin(event) {
    event.preventDefault();
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
    if (checkEmptyInput(password)) return "Password";
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
        "Password": "Please check your password!"
    };
    return messages[key] || "Unknown error!";
}

function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}
