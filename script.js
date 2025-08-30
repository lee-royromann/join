/**
 * Initialisiert das grundlegende Layout der Anwendung, indem Header und Navbar geladen werden.
 * Löst zusätzlich die Begrüßungsfunktionalität aus, wenn sich der Benutzer auf der Übersichtsseite befindet.
 * @async
 * @param {string} page - Die ID der aktuellen Seite (z.B. 'summary_page').
 */
async function init(page) {
    await loadHTML("header.html", "header-placeholder");
    await loadHTML("navbar.html", "navbar-section");
    activePageHiglight(page);
    setUserCircleInitials();

    if (page === 'summary_page') {
        initGreeting();
        initGreetingRepeat();
    }
}


/**
 * Überprüft den im localStorage gespeicherten Anmeldestatus.
 * Leitet den Benutzer zur Index- (Login-) Seite weiter, wenn er nicht angemeldet ist.
 */
function isUserLoged() {
    let isLoggedIn = localStorage.getItem("loggedIn");
    if (isLoggedIn !== "true") {
        window.location.href = "../index.html";
    } else {
        setUserCircleInitials();
    }
}


/**
 * Meldet den Benutzer ab, indem die Anmelde- und Layoutinformationen im localStorage zurückgesetzt werden.
 * Leitet anschließend zur Index- (Login-) Seite weiter.
 */
function logOut() {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("layout");
    localStorage.removeItem("username");
    window.location.href = "../index.html";
}


/**
 * Lädt eine externe HTML-Datei und fügt deren Inhalt in ein angegebenes Container-Element auf der Seite ein.
 * @async
 * @param {string} file - Der Pfad zur HTML-Datei.
 * @param {string} elementId - Die ID des Ziel-Container-Elements.
 */
async function loadHTML(file, elementId) {
    let response = await fetch(file);
    let html = await response.text();
    let container = document.getElementById(elementId);
    if (container) container.innerHTML = html;
}


/**
 * Hebt die aktuell aktive Seite hervor, indem dem entsprechenden Navigationselement
 * eine "active-menu"-Klasse hinzugefügt und von allen anderen entfernt wird.
 * @param {string} page - Die ID der aktuell aktiven Seite.
 */
function activePageHiglight(page) {
    let ids = ["summary_page", "add_task_page", "board_page", "contact_page", "help_page"];
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.classList.remove("active-menu");
    });
    let current = document.getElementById(page);
    if (current) current.classList.add("active-menu");
}


/**
 * Schaltet das Burger-Menü mit einer Einblendanimation ein oder aus.
 */
function burgerMenuSliding() {
    let menu = document.getElementById("burger_menu");
    menu.classList.toggle("visible");
}


/**
 * Schließt das Burger-Menü, wenn außerhalb davon geklickt wird.
 */
document.addEventListener("click", function(event) {
    let menu = document.getElementById("burger_menu");
    let userLogo = document.querySelector(".user-logo");

    if (!menu || !menu.classList.contains("visible")) return;

    let clickedInsideMenu = menu.contains(event.target);
    let clickedUserLogo = userLogo && userLogo.contains(event.target);

    if (!clickedInsideMenu && !clickedUserLogo) {
        menu.classList.remove("visible");
    }
});


/**
 * Speichert den Layout-Typ (intern oder extern) im localStorage
 * und leitet den Benutzer zu einer angegebenen URL weiter.
 * @param {string} layout - Der Layout-Typ ('intern' oder 'extern').
 * @param {string} url - Die Ziel-URL, zu der der Benutzer weitergeleitet wird.
 */
function setLayoutAndRedirect(layout, url) {
    localStorage.removeItem('layout');
    localStorage.setItem('layout', layout);
    window.location.href = url;
}


/**
 * Lädt den internen Header und die Navbar für authentifizierte Benutzer.
 * Hebt auch die aktuelle Seite für Rechts- und Datenschutzseiten hervor.
 * @async
 */
async function loadHeaderNavbarIntern() {
    await Promise.all([
        loadHTML("/html/header.html", "header-placeholder"),
        loadHTML("/html/navbar.html", "navbar-section")
    ]);
    markLegalPrivacyActiveLink();
    setUserCircleInitials();
}


/**
 * Lädt den externen Header und die Navbar für Gastbenutzer (nicht authentifiziert).
 * @async
 */
async function loadHeaderNavbarExtern() {
    await Promise.all([
        loadHTML("/html/header_extern.html", "header-placeholder"),
        loadHTML("/html/navbar_extern.html", "navbar-section")
    ]);
}


/**
 * Fügt dem korrekten Navigationselement auf den Seiten für Impressum und Datenschutz
 * die Klasse 'active-menu' hinzu.
 */
function markLegalPrivacyActiveLink() {
    let path = window.location.pathname;
    if (path.includes("privacy_policy.html")) {
        let el = document.getElementById("privacy_page");
        if (el) el.classList.add("active-menu");
    }
    if (path.includes("legal_notice.html")) {
        let el = document.getElementById("legal_notice_page");
        if (el) el.classList.add("active-menu");
    }
}


/**
 * Akzeptiert Cookies, speichert den Zeitstempel der Annahme im localStorage,
 * blendet das Cookie-Banner aus und aktiviert die Anmelde-Buttons.
 */
function acceptCookies() {
    let now = new Date().getTime();
    localStorage.setItem("cookiesAcceptedAt", now);
    document.getElementById("cookieBanner").classList.add("d-none");
    enableLogin();
    enableLoginButtons();
}


/**
 * Überprüft, ob die Cookie-Zustimmung des Benutzers noch gültig ist,
 * indem geprüft wird, ob sie innerhalb des letzten Jahres erfolgte.
 * @returns {boolean} True, wenn noch gültig, andernfalls false.
 */
function cookiesStillValid() {
    let timestamp = localStorage.getItem("cookiesAcceptedAt");
    if (!timestamp) return false;
    let acceptedAt = parseInt(timestamp);
    let now = new Date().getTime();
    let oneYear = 1000 * 60 * 60 * 24 * 365;
    return now - acceptedAt < oneYear;
}


/**
 * Macht den Anmeldebereich sichtbar.
 */
function enableLogin() {
    let loginArea = document.getElementById("loginArea");
    if (loginArea) loginArea.classList.remove("d-none");
}


/**
 * Deaktiviert sowohl den Standard-Login- als auch den Gast-Login-Button.
 */
function disableLoginButtons() {
    let logInBtn = document.getElementById("logIn");
    let guestBtn = document.getElementById("guestLogIn");
    if (logInBtn) logInBtn.disabled = true;
    if (guestBtn) guestBtn.disabled = true;
}


/**
 * Aktiviert sowohl den Standard-Login- als auch den Gast-Login-Button.
 */
function enableLoginButtons() {
    let logInBtn = document.getElementById("logIn");
    let guestBtn = document.getElementById("guestLogIn");
    if (logInBtn) logInBtn.disabled = false;
    if (guestBtn) guestBtn.disabled = false;
}


/**
 * Wird ausgeführt, sobald das DOM vollständig geladen ist.
 * Initialisiert die Rotationswarnung, das Laden des Layouts, die Cookie-Logik und den Zurück-Button.
 */
window.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadRotateWarning();
    } catch (err) {
        console.warn("⚠️ rotate_warning.html konnte nicht geladen werden:", err);
    }

    initCookies();
    initBackButton();
    checkOrientation();
});


/**
 * Lädt das Overlay für die Rotationswarnung in das DOM.
 * @async
 */
async function loadRotateWarning() {
    await loadHTML("/html/rotate_warning.html", "rotate-warning-placeholder");
}


/**
 * Initialisiert das Layout basierend auf dem Anmeldestatus und der aktuellen Seite.
 * Setzt den Layout-Wert jedes Mal zurück, um einen sauberen Zustand zu gewährleisten.
 */
async function initLayout() {
    await loadHeaderNavbarIntern();
    localStorage.removeItem("layout");
}


/**
 * Steuert die Sichtbarkeit des Cookie-Banners und den Zustand der Anmelde-Buttons.
 */
function initCookies() {
    let stillValid = cookiesStillValid();
    let banner = document.getElementById("cookieBanner");
    let loginArea = document.getElementById("loginArea");

    if (!stillValid) {
        if (banner) banner.classList.remove("d-none");
        if (loginArea) loginArea.classList.remove("d-none");
        disableLoginButtons();
    } else {
        if (banner) banner.classList.add("d-none");
        if (loginArea) loginArea.classList.remove("d-none");
        enableLoginButtons();
    }

    let acceptBtn = document.getElementById("acceptCookiesBtn");
    if (acceptBtn) {
        acceptBtn.addEventListener("click", acceptCookies);
    }
}


/**
 * Fügt dem Zurück-Pfeil die Funktionalität hinzu, zur vorherigen Seite zu navigieren.
 */
function initBackButton() {
    let backClick = document.getElementById("backArrow");
    if (backClick) {
        backClick.addEventListener("click", () => history.back());
    }
}


/**
 * Überprüft die aktuelle Ausrichtung des Geräts des Benutzers.
 * Zeigt bei einem mobilen Gerät im Querformat ein bildschirmfüllendes Warn-Overlay an.
 */
function checkOrientation() {
    let warning = document.getElementById("rotateWarning");
    if (!warning) return;

    let isLandscape = window.matchMedia("(orientation: landscape)").matches;
    let isMobile = /Mobi|Android/i.test(navigator.userAgent);
    let smallScreen = Math.min(window.innerWidth, window.innerHeight) <= 800;

    warning.style.display = /*(isMobile && smallScreen && isLandscape) ? "flex" : */"none";
}


window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);


/**
 * Zeigt das bildschirmfüllende Lade-Spinner-Overlay an.
 */
function spinningLoaderStart() {
    let spinner = document.getElementById('spinnerOverLay');
    spinner.classList.remove('d-none');
}


/**
 * Versteckt das bildschirmfüllende Lade-Spinner-Overlay.
 */
function spinningLoaderEnd() {
    let spinner = document.getElementById('spinnerOverLay');
    spinner.classList.add('d-none');
}


/**
 * Setzt die Initialen des Benutzers in den Kreis im Header.
 * Wenn der Benutzer ein Gast ist, wird "G" angezeigt.
 * Diese Funktion sollte aufgerufen werden, nachdem der Header in das DOM eingefügt wurde.
 */
function setUserCircleInitials() {
    let userCircle = document.querySelector('.user-logo-text');
    if (!userCircle) return;

    let name = localStorage.getItem('username') || "Guest";

    if (name && name.toLowerCase() !== "guest") {
        const nameParts = name.trim().split(' ').filter(Boolean);
        let initials = '';

        if (nameParts.length > 0) {
            initials = nameParts[0].charAt(0).toUpperCase();
            if (nameParts.length > 1) {
                initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            }
        }
        userCircle.textContent = initials;
    } else {
        userCircle.textContent = "G";
    }
}


/**
 * Gibt eine Reihe von regulären Ausdrücken zurück, die zur Validierung von Eingabefeldern verwendet werden.
 * @returns {Object} Ein Objekt mit Validierungs-Regex für Benutzername, E-Mail, Passwort und Telefonnummer.
 */
function inputValidations() {
    return {
        username: /^[a-zA-ZäöüÄÖÜß\s]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/,
        phoneNumber: /^\d+$/,
    };
}


/**
 * Validiert den Eingabewert basierend auf seiner ID und aktualisiert den Stil des Labels entsprechend.
 * Entfernt die Fehlerklasse und fügt eine Erfolgsklasse hinzu, wenn die Validierung erfolgreich ist.
 * @param {string} labelID - Die ID des zu ändernden Label-Elements.
 * @param {string} inputID - Die ID des zu validierenden Input-Elements.
 */
function correctedInput(labelID, inputID) {
    let label = document.getElementById(labelID);
    let input = document.getElementById(inputID);
    let validation = inputValidations();

    if (label.classList.contains("error-border")) {
        let validationKey = validationType(inputID);
        let pattern = validation[validationKey];
        if (pattern && pattern.test(input.value)) {
            label.classList.remove("error-border");
            label.classList.add("correct-input");
        }
    }
}


/**
 * Bestimmt den Validierungstyp (z.B. Benutzername, E-Mail usw.) basierend auf der Input-ID.
 * @param {string} inputID - Die ID des zu analysierenden Input-Elements.
 * @returns {string} Der entsprechende Schlüssel für den Validierungstyp.
 */
function validationType(inputID) {
    let validationType = "";
    let lowerID = inputID.toLowerCase();

    if (lowerID.includes("name")) {
        validationType = "username";
    } else if (lowerID.includes("email")) {
        validationType = "email";
    } else if (lowerID.includes("password")) {
        validationType = "password";
    } else if (lowerID.includes("phone")) {
        validationType = "phoneNumber";
    }

    return validationType;
}


/**
 * Entfernt das Erfolgs-Styling von einem Label, um den Zustand nach der Korrektur der Eingabe zurückzusetzen.
 * @param {string} labelID - Die ID des zurückzusetzenden Label-Elements.
 */
function finishTheCorrection(labelID) {
    let label = document.getElementById(labelID);
    if (label.classList.contains("correct-input")) {
        label.classList.remove("correct-input");
    }
}
