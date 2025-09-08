/**
 * Initializes the basic layout of the application by loading the header and navbar.
 * Additionally, triggers the greeting functionality if the user is on the summary page.
 * @async
 * @param {string} page - The ID of the current page (e.g., 'summary_page').
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
 * Checks the login status stored in localStorage.
 * Redirects the user to the index (login) page if they are not logged in.
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
 * Logs the user out by resetting the login and layout information in localStorage.
 * Subsequently redirects to the index (login) page.
 */
function logOut() {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("layout");
    localStorage.removeItem("username");
    window.location.href = "../index.html";
}


/**
 * Loads an external HTML file and inserts its content into a specified container element on the page.
 * @async
 * @param {string} file - The path to the HTML file.
 * @param {string} elementId - The ID of the target container element.
 */
async function loadHTML(file, elementId) {
    let response = await fetch(file);
    let html = await response.text();
    let container = document.getElementById(elementId);
    if (container) container.innerHTML = html;
}


/**
 * Highlights the currently active page by adding an "active-menu" class
 * to the corresponding navigation element and removing it from all others.
 * @param {string} page - The ID of the currently active page.
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
 * Toggles the burger menu on or off with a slide-in animation.
 */
function burgerMenuSliding() {
    let menu = document.getElementById("burger_menu");
    menu.classList.toggle("visible");
}


/**
 * Closes the burger menu when a click occurs outside of it.
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
 * Saves the layout type (internal or external) in localStorage
 * and redirects the user to a specified URL.
 * @param {string} layout - The layout type ('intern' or 'extern').
 * @param {string} url - The target URL to which the user is redirected.
 */
function setLayoutAndRedirect(layout, url) {
    localStorage.removeItem('layout');
    localStorage.setItem('layout', layout);
    window.location.href = url;
}


/**
 * Loads the internal header and navbar for authenticated users.
 * Also highlights the current page for legal and privacy pages.
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
 * Loads the external header and navbar for guest users (not authenticated).
 * @async
 */
async function loadHeaderNavbarExtern() {
    await Promise.all([
        loadHTML("/html/header_extern.html", "header-placeholder"),
        loadHTML("/html/navbar_extern.html", "navbar-section")
    ]);
}


/**
 * Adds the 'active-menu' class to the correct navigation element
 * on the legal notice and privacy policy pages.
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
 * Accepts cookies, stores the acceptance timestamp in localStorage,
 * hides the cookie banner, and enables the login buttons.
 */
function acceptCookies() {
    let now = new Date().getTime();
    localStorage.setItem("cookiesAcceptedAt", now);
    document.getElementById("cookieBanner").classList.add("d-none");
    enableLogin();
    enableLoginButtons();
}


/**
 * Checks if the user's cookie consent is still valid by verifying
 * if it was given within the last year. This function is modified to always return true.
 * @returns {boolean} Always returns true to bypass the cookie check.
 */
function cookiesStillValid() {
    return true; // <-- ÄNDERUNG: Gibt immer 'true' zurück, um die Cookie-Abfrage zu umgehen.
}


/**
 * Makes the login area visible.
 */
function enableLogin() {
    let loginArea = document.getElementById("loginArea");
    if (loginArea) loginArea.classList.remove("d-none");
}


/**
 * Disables both the standard login and guest login buttons.
 */
function disableLoginButtons() {
    let logInBtn = document.getElementById("logIn");
    let guestBtn = document.getElementById("guestLogIn");
    if (logInBtn) logInBtn.disabled = true;
    if (guestBtn) guestBtn.disabled = true;
}


/**
 * Enables both the standard login and guest login buttons.
 */
function enableLoginButtons() {
    let logInBtn = document.getElementById("logIn");
    let guestBtn = document.getElementById("guestLogIn");
    if (logInBtn) logInBtn.disabled = false;
    if (guestBtn) guestBtn.disabled = false;
}


/**
 * Executes as soon as the DOM is fully loaded.
 * Initializes the rotation warning, layout loading, cookie logic, and the back button.
 */
window.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadRotateWarning();
    } catch (err) {
        console.warn("⚠️ Could not load rotate_warning.html:", err);
    }

    initCookies();
    initBackButton();
    checkOrientation();
});


/**
 * Loads the rotation warning overlay into the DOM.
 * @async
 */
async function loadRotateWarning() {
    await loadHTML("/html/rotate_warning.html", "rotate-warning-placeholder");
}


/**
 * Initializes the layout based on the login status and the current page.
 * Resets the layout value each time to ensure a clean state.
 */
async function initLayout() {
    await loadHeaderNavbarIntern();
    localStorage.removeItem("layout");
}


/**
 * Controls the visibility of the cookie banner and the state of the login buttons.
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
 * Adds functionality to the back arrow to navigate to the previous page.
 */
function initBackButton() {
    let backClick = document.getElementById("backArrow");
    if (backClick) {
        backClick.addEventListener("click", () => history.back());
    }
}


/**
 * Checks the user's current device orientation.
 * Displays a full-screen warning overlay on a mobile device in landscape mode.
 */
function checkOrientation() {
    let warning = document.getElementById("rotateWarning");
    if (!warning) return;

    let isLandscape = window.matchMedia("(orientation: landscape)").matches;
    let isMobile = /Mobi|Android/i.test(navigator.userAgent);
    let smallScreen = Math.min(window.innerWidth, window.innerHeight) <= 800;

    warning.style.display = /*(isMobile && smallScreen && isLandscape) ? "flex" : */ "none";
}


window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);


/**
 * Displays the full-screen loading spinner overlay.
 */
function spinningLoaderStart() {
    let spinner = document.getElementById('spinnerOverLay');
    spinner.classList.remove('d-none');
}


/**
 * Hides the full-screen loading spinner overlay.
 */
function spinningLoaderEnd() {
    let spinner = document.getElementById('spinnerOverLay');
    spinner.classList.add('d-none');
}


/**
 * Sets the user's initials in the header circle.
 * If the user is a guest, it displays "G".
 * This function should be called after the header has been inserted into the DOM.
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
 * Returns a set of regular expressions used for validating input fields.
 * @returns {Object} An object containing validation regex for username, email, password, and phone number.
 */
function inputValidations() {
    return {
        username: /^[a-zA-Z\s]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,15}$/,
        phoneNumber: /^\d+$/,
    };
}


/**
 * Validates the input value based on its ID and updates the label's style accordingly.
 * Removes the error class and adds a success class if validation passes.
 * @param {string} labelID - The ID of the label element to be styled.
 * @param {string} inputID - The ID of the input element to be validated.
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
 * Determines the validation type (e.g., username, email, etc.) based on the input ID.
 * @param {string} inputID - The ID of the input element to analyze.
 * @returns {string} The corresponding key for the validation type.
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
 * Removes the success styling from a label to reset its state after the input has been corrected.
 * @param {string} labelID - The ID of the label element to reset.
 */
function finishTheCorrection(labelID) {
    let label = document.getElementById(labelID);
    if (label.classList.contains("correct-input")) {
        label.classList.remove("correct-input");
    }
}