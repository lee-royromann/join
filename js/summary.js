let tasks = [];
let tasksFirebase = [];
let isGreetingShown = false;


/**
 * Initializes the summary dashboard by loading tasks and handling greeting display
 * Shows mobile greeting on small screens or goes directly to dashboard on desktop
 */
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


/**
 * Determines if the mobile greeting should be shown
 * @returns {boolean} True if on mobile screen size and greeting hasn't been shown yet
 */
function shouldShowMobileGreeting() {
    const isGreetingAlreadyShown = localStorage.getItem("greetingShown") === "true";
    return window.innerWidth <= 1040 && !isGreetingAlreadyShown;
}


/**
 * Displays the mobile greeting overlay with appropriate timing
 * Creates and shows greeting overlay, then auto-hides after timeout
 */
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


/**
 * Creates the mobile greeting overlay element
 * @param {string} username - The current username
 * @param {boolean} isGuest - Whether the user is a guest
 * @returns {HTMLElement} The created overlay element
 */
function createMobileGreetingOverlay(username, isGuest) {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-greeting-overlay';
    
    const greetingText = getGreetingText();
    overlay.innerHTML = getMobileGreetingTemplate(greetingText, username, isGuest);
    
    return overlay;
}


/**
 * Hides the mobile greeting overlay and shows main content
 * Displays main dashboard content and removes overlay with fade animation
 * @param {HTMLElement} overlay - The greeting overlay element to hide
 */
function hideMobileGreeting(overlay) {
    showMainContent();
    updateDashboardCounters(tasksFirebase);
    initGreeting();
    
    overlay.classList.add('fade-out');
    
    setTimeout(() => {
        overlay.remove();
    }, 500);
}


/**
 * Gets time-based greeting text based on current hour
 * @returns {string} Appropriate greeting message for current time of day
 */
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


/**
 * Loads all tasks from Firebase database
 * Fetches task data and filters out null values
 */
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


/**
 * Initializes the greeting text based on current time and user
 * Sets greeting message and username in the DOM elements
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
 * Updates the counter elements in the DOM
 * @param {Object} counts - Object containing task counts
 */
function updateCounterElements(counts) {
    const elements = {
        'count-todo': counts.todo,
        'count-done': counts.done,
        'count-urgent': counts.urgent,
        'count-board': counts.all,
        'count-progress': counts.inProgress,
        'count-feedback': counts.feedback
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}


/**
 * Updates the upcoming deadline display
 * @param {Array<Object>} tasks - Array of tasks
 */
function updateDeadlineDisplay(tasks) {
    const upcomingDeadline = findUpcomingUrgentDeadline(tasks);
    const deadlineElement = document.getElementById("upcoming-deadline-date");
    
    if (deadlineElement && upcomingDeadline) {
        deadlineElement.textContent = upcomingDeadline;
    } else if (deadlineElement) {
        deadlineElement.textContent = "No urgent deadlines";
    }
}

/**
 * Calculates the number of tasks in different categories.
 * @param {Array<Object>} tasks - Array of all tasks.
 * @returns {Object} - Object containing the counts of different task types.
 */
function calculateTaskCounts(tasks) {
    const counts = {
        todo: 0,
        done: 0,
        urgent: 0,
        all: tasks.length,
        inProgress: 0,
        feedback: 0
    };

    tasks.forEach(task => {
        // Zähle Aufgaben nach Status
        if (task.status === 'todo') {
            counts.todo++;
        } else if (task.status === 'done') {
            counts.done++;
        } else if (task.status === 'inProgress') {
            counts.inProgress++;
        } else if (task.status === 'feedback') {
            counts.feedback++;
        }

        // Zähle dringende Aufgaben
        if (task.priority === 'urgent') {
            counts.urgent++;
        }
    });

    return counts;
}
/**
 * Updates all dashboard counters and deadline display
 * @param {Array<Object>} tasks - Array of all loaded tasks from Firebase
 */
function updateDashboardCounters(tasks) {
    if (!tasks || !Array.isArray(tasks)) {
        console.warn("Keine Tasks verfügbar für Dashboard-Update");
        return;
    }

    const counts = calculateTaskCounts(tasks);
    updateCounterElements(counts);
    updateDeadlineDisplay(tasks);
}


/**
 * Find the next deadline of urgent tasks
 * @param {Array<Object>} tasks - Array of all tasks
 * @returns {string|null} - Formatted date or null
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


/**
 * Hides the main content by setting visibility to hidden
 */
function hideMainContent() {
    const content = document.querySelector('.content');
    if (content) {
        content.style.visibility = 'hidden';
    }
}


/**
 * Shows the main content by setting visibility to visible
 */
function showMainContent() {
    const content = document.querySelector('.content');
    if (content) {
        content.style.visibility = 'visible';
    }
}


/**
 * Handle window resize to reset greeting state if needed
 * Resets greeting state when switching from mobile to desktop view
 */
window.addEventListener('resize', () => {
    if (window.innerWidth > 1040) {
        isGreetingShown = false;
    }
});