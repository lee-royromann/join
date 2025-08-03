let tasks = [];
let tasksFirebase = [];

async function initSummary() {
    try {
        
        await loadTasksFromFirebase();
        updateDashboardCounters(tasksFirebase);
    } catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
    }

    initGreeting();
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
    console.log("Tasks loaded for summary:", tasksFirebase);
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

    document.getElementById("count-todo").textContent = todo;
    document.getElementById("count-done").textContent = done;
    document.getElementById("count-urgent").textContent = urgent;
    document.getElementById("count-board").textContent = all;
    document.getElementById("count-progress").textContent = inProgress;
    document.getElementById("count-feedback").textContent = feedback;

    const deadlineElement = document.getElementById("upcoming-deadline-date");
    if (deadlineElement && upcomingDeadline) {
        deadlineElement.textContent = upcomingDeadline;
    } else if (deadlineElement) {
        deadlineElement.textContent = "No urgent deadlines";
    }

    console.log("Dashboard counters updated:", {
        todo, done, urgent, all, inProgress, feedback
    });
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

document.addEventListener("DOMContentLoaded", () => {
    initSummary();
});