function initSummary() {
  const tasks = loadTasks();
  updateDashboardCounters(tasks);
  initGreeting();
  adjustContentWrapperHeight(); // Passt Wrapper-Höhe direkt beim Laden an
}

function loadTasks() {
  return [
    { title: "Task 1", status: "todo", priority: "normal" },
    { title: "Task 2", status: "in_progress", priority: "urgent" },
    { title: "Task 3", status: "feedback", priority: "urgent" },
    { title: "Task 4", status: "done", priority: "normal" },
    { title: "Task 5", status: "todo", priority: "urgent" },
  ];
}

function updateDashboardCounters(tasks) {
  const todo = tasks.filter(t => t.status === "todo").length;
  const done = tasks.filter(t => t.status === "done").length;
  const urgent = tasks.filter(t => t.priority === "urgent").length;
  const all = tasks.length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const feedback = tasks.filter(t => t.status === "feedback").length;

  document.getElementById("count-todo").textContent = todo;
  document.getElementById("count-done").textContent = done;
  document.getElementById("count-urgent").textContent = urgent;
  document.getElementById("count-board").textContent = all;
  document.getElementById("count-progress").textContent = inProgress;
  document.getElementById("count-feedback").textContent = feedback;
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


// Passt den Wrapper der Content-Höhe an, um Footer-Kollision zu vermeiden
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

// Bei Fenstergrößenänderung Wrapper-Höhe erneut anpassen
window.addEventListener('resize', adjustContentWrapperHeight);

document.addEventListener("DOMContentLoaded", initSummary);
