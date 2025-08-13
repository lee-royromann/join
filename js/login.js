// ===================================================================
// Globale Variablen und Initialisierung
// ===================================================================
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
// LOGIN-FUNKTIONEN (KORRIGIERT)
// ===================================================================

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

            // ================================================================
            // NEU: HIER IST DIE ENTSCHEIDENDE ERGÄNZUNG
            // Speichere die E-Mail und die ID des Benutzers für spätere Aktionen.
            localStorage.setItem("currentUserEmail", user.email);
            localStorage.setItem("currentUserId", user.id); // Annahme: Ihr User-Objekt hat eine Eigenschaft 'id'
            // ================================================================

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

function displayErrorLogin() {
    document.getElementById('labelPassword').classList.add('error-border');
    info.classList.remove('opacity');
    info.innerHTML = "Check your e-mail and password.<br> Please try again.";
}

/**
 * Loggt einen Benutzer als Gast ein, indem ein Flag im sessionStorage gesetzt wird,
 * und leitet ihn dann zur Hauptseite weiter.
 * @param {Event} event - Das Klick-Event des Buttons, um die Standard-Formularaktion zu verhindern.
 */
function guestLogin(event) {
    event.preventDefault();
    console.log("Gastmodus wird aktiviert...");
    sessionStorage.setItem('userMode', 'guest');
    window.location.href = 'html/summary.html';
}

// ===================================================================
// HILFSFUNKTIONEN (unverändert)
// ===================================================================

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
