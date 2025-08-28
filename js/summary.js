let tasks = [];
let tasksFirebase = [];
let isGreetingShown = false;

async function initSummary() {
    try {
        await loadTasksFromFirebase();
        
        // Check if we're on mobile and should show greeting first
        if (shouldShowMobileGreeting()) {
            // Hide main content initially on mobile
            hideMainContent();
            showMobileGreeting();
        } else {
            // Desktop behavior - show dashboard immediately
            showMainContent();
            updateDashboardCounters(tasksFirebase);
            initGreeting();
        }
    } catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
    }
}

function shouldShowMobileGreeting() {
    const isGreetingAlreadyShown = localStorage.getItem("greetingShown") === "true";
    return window.innerWidth <= 1040 && !isGreetingAlreadyShown;
}

function showMobileGreeting() {
    const username = localStorage.getItem("username") || "Guest";
    const isGuest = !username || username === "Guest";
    
    const greetingOverlay = createMobileGreetingOverlay(username, isGuest);
    document.body.appendChild(greetingOverlay);
    
    localStorage.setItem("greetingShown", "true");
    
    if (isGuest) {
        setTimeout(() => {
            hideMobileGreeting(greetingOverlay);
        }, 2000);
        return;
    }
    
    
    setTimeout(() => {
        hideMobileGreeting(greetingOverlay);
    }, 3000);
}

function createMobileGreetingOverlay(username, isGuest) {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-greeting-overlay';
    
    const greetingText = getGreetingText();
    overlay.innerHTML = getMobileGreetingTemplate(greetingText, username, isGuest);
    
    return overlay;
}

function hideMobileGreeting(overlay) {
    
    showMainContent();
    
    updateDashboardCounters(tasksFirebase);
    initGreeting();
    
    overlay.classList.add('fade-out');
    
    setTimeout(() => {
        overlay.remove();
    }, 500);
}


function getGreetingText() {
    const now = new Date();
    const hours = now.getHours();
    const username = localStorage.getItem("username") || "Guest";
    const isGuest = !username || username === "Guest";
    
    if (hours >= 5 && hours < 12) {
        return isGuest ? "Good morning" : "Good morning,";
    } else if (hours >= 12 && hours < 18) {
        return isGuest ? "Good afternoon" : "Good afternoon,";
    } else {
        return isGuest ? "Good evening" : "Good evening,";
    }
}

async function loadTasksFromFirebase() {
    const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";
    let response = await fetch(BASE_URL + "join/tasks.json");
    let responseToJson = await response.json();
    
    if (responseToJson) {
        tasksFirebase = Object.values(responseToJson).filter(task => task != null);
    } else {
        tasksFirebase = [];
    }
}

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
 * Zählt die geladenen Tasks
 * @param {Array<Object>} tasks - Array aller geladenen Tasks aus Firebase.
 */
function updateDashboardCounters(tasks) {
    if (!tasks || !Array.isArray(tasks)) {
        console.warn("Keine Tasks verfügbar für Dashboard-Update");
        return;
    }

    const todo = tasks.filter(t => t.status === "to-do").length;
    const done = tasks.filter(t => t.status === "done").length;
    const urgent = tasks.filter(t => t.priority === "urgent").length;
    const all = tasks.length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const feedback = tasks.filter(t => t.status === "await-feedback").length;

    const upcomingDeadline = findUpcomingUrgentDeadline(tasks);

    // Check if elements exist before updating
    const elements = {
        'count-todo': todo,
        'count-done': done,
        'count-urgent': urgent,
        'count-board': all,
        'count-progress': inProgress,
        'count-feedback': feedback
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    const deadlineElement = document.getElementById("upcoming-deadline-date");
    if (deadlineElement && upcomingDeadline) {
        deadlineElement.textContent = upcomingDeadline;
    } else if (deadlineElement) {
        deadlineElement.textContent = "No urgent deadlines";
    }
}

/**
 * Findet die nächste Deadline von urgent Tasks
 * @param {Array<Object>} tasks - Array aller Tasks
 * @returns {string|null} - Formatiertes Datum oder null
 */
function findUpcomingUrgentDeadline(tasks) {
    const urgentTasks = tasks.filter(t => t.priority === "urgent" && t.date);
    
    if (urgentTasks.length === 0) return null;

    const dates = urgentTasks.map(task => {
        const [day, month, year] = task.date.split('.');
        return {
            date: new Date(year, month - 1, day),
            original: task.date
        };
    }).filter(d => d.date >= new Date());

    if (dates.length === 0) return null;

    dates.sort((a, b) => a.date - b.date);
    
    const nextDate = dates[0].date;
    return nextDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function hideMainContent() {
    const content = document.querySelector('.content');
    if (content) {
        content.style.visibility = 'hidden';
    }
}

function showMainContent() {
    const content = document.querySelector('.content');
    if (content) {
        content.style.visibility = 'visible';
    }
}

// Handle window resize to reset greeting state if needed
window.addEventListener('resize', () => {
    if (window.innerWidth > 1040) {
        isGreetingShown = false;
    }
});