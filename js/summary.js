/**
 * Globale Tasks-Variable für Dashboard-Zähler und Board.
 * Muss VOR Nutzung deklariert werden.
 */
let tasks = [];

/**
 * Initialisiert das Dashboard (Summary) mit Firebase-Daten und passt Layout an.
 * Lädt echte Tasks, aktualisiert Zähler, setzt Begrüßung und Wrapper-Höhe.
 */
async function initSummary() {
    try {
        await getDataFromServer("/join/tasks"); // Tasks aus Firebase laden
        updateDashboardCounters(tasks);          // Zähler mit echten Daten aktualisieren
    } catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
    }

    initGreeting();
    adjustContentWrapperHeight();
}

/**
 * Passt Wrapper-Höhe an die Viewport-Höhe abzüglich Header und Footer an,
 * um Footer-Kollisionen zu vermeiden.
 */
function adjustContentWrapperHeight() {
    const wrapper = document.getElementById('content-wrapper');
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');

    if (wrapper && footer && header) {
        const viewportHeight = window.innerHeight;
        const headerHeight = header.offsetHeight;
        const footerHeight = footer.offsetHeight;
        const desiredHeight = viewportHeight - headerHeight - footerHeight;
        wrapper.style.minHeight = `${desiredHeight}px`;
    }
}

/**
 * Initialisiert die dynamische Begrüßung abhängig von der Tageszeit
 * und lädt den Benutzernamen aus dem Local Storage.
 */
function initGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Hello";

    if (hours >= 5 && hours < 12) {
        greeting = "Good morning,";
    } else if (hours >= 12 && hours < 18) {
        greeting = "Good afternoon,";
    } else {
        greeting = "Good evening,";
    }

    const greetingText = document.getElementById("greeting-text");
    const username = document.getElementById("greeting-username");

    if (greetingText) greetingText.textContent = greeting;

    const name = localStorage.getItem("username") || "Guest";
    if (username) username.textContent = name;
}

/**
 * Zählt die geladenen Tasks für die Dashboard-Elemente und zeigt sie an.
 * @param {Array<Object>} tasks - Array aller geladenen Tasks aus Firebase.
 */
function updateDashboardCounters(tasks) {
    const todo = tasks.filter(t => t.condition === "todo").length;
    const done = tasks.filter(t => t.condition === "done").length;
    const urgent = tasks.filter(t => t.priority === "urgent").length;
    const all = tasks.length;
    const inProgress = tasks.filter(t => t.condition === "in_progress").length;
    const feedback = tasks.filter(t => t.condition === "feedback").length;

    document.getElementById("count-todo").textContent = todo;
    document.getElementById("count-done").textContent = done;
    document.getElementById("count-urgent").textContent = urgent;
    document.getElementById("count-board").textContent = all;
    document.getElementById("count-progress").textContent = inProgress;
    document.getElementById("count-feedback").textContent = feedback;
}

/**
 * Passt die Sidebar-Breite an die Main-Breite an (nur bei 1305px und kleiner)
 */
function adjustSidebarToMainWidth() {

    if (window.innerWidth <= 1305) {
        const sidebar = document.querySelector('.sidebar');
        const mainElement = document.querySelector('.main');

        if (sidebar && mainElement) {
            const mainWidth = mainElement.offsetWidth;
            const mainRect = mainElement.getBoundingClientRect();

            sidebar.style.width = `${mainWidth}px`;

            const mainLeft = mainRect.left + window.scrollX;
            const mainCenter = mainLeft + (mainWidth / 2);
            const viewportCenter = window.innerWidth / 2;
            const offsetFromCenter = mainCenter - viewportCenter;

            sidebar.style.left = '50%';
            sidebar.style.transform = `translateX(calc(-50% + ${offsetFromCenter}px))`;
        }
    } else {
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.width = '';
            sidebar.style.left = '';
            sidebar.style.transform = '';
        }
    }
}

window.addEventListener('resize', () => {
    adjustContentWrapperHeight();
    adjustSidebarToMainWidth();
});

// Initialisiert das Dashboard nach dem Laden des DOMs
document.addEventListener("DOMContentLoaded", () => {
    initSummary();
    adjustSidebarToMainWidth();
});

// Fügt aktiven Zustand für Sidebar-Elemente hinzu
document.querySelectorAll('.sidebar__item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar__item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

