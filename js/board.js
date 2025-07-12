// Transfer to db.js

let tasksFirebase = [];
let contactsFirebase = [];

const avatarColors = {
  1: "#FF7A00",
  2: "#9327FF",
  3: "#6E52FF",
  4: "#FC71FF",
  5: "#FFBB2B",
  6: "#1FD7C1",
  7: "#462F8A",
  8: "#FF4646",
  9: "#00BEE8",
  0: "#0038FF"
};

const BASE_URL = "https://join-472-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Lädt Tasks aus Firebase und speichert sie in `tasksFirebase`.
 * @returns {Promise<void>}
 */
async function loadTasksFromFirebase() {
    let response = await fetch(BASE_URL + "join/tasks.json");
    let responseToJson = await response.json();
    tasksFirebase = Object.values(responseToJson);
    console.log(tasksFirebase);
  }

//Achtung, diese Funktion gibt es schon in db.js kann final einfach gelöscht werden
/**
 * Loads contacts from Firebase and assigns them to `contactsFirebase`.
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
  let response = await fetch(BASE_URL + "/join/contacts.json");
  if (response.ok) {
    let data = await response.json();
    contactsFirebase = Object.values(data || {});
    // renderAvatar();
  } else {
    contactsFirebase = [];
  }
  console.log(contactsFirebase);
}


// Achtung: hier die genaue ID ermitteln und als Parameter mitgeben
function openOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    document.body.style.overflow = 'hidden';
    renderOverlayTask();
}

function closeOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    document.body.style.overflow = '';
}

function openEditOverlay() {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    story.classList.add("d-none");
    edit.classList.remove("d-none");
    renderEditTask();
}

function closeEditOverlay() {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    story.classList.remove("d-none");
    edit.classList.add("d-none");
}

async function boardInit() {
    await loadTasksFromFirebase();
    await loadContactsFromFirebase();
    renderTasks();
}

function renderTasks() {
    clearAllColumns();
    const taskCounts = renderAllTasks();
    renderEmptyColumns(taskCounts);
}

function clearAllColumns() {
  ["to-do", "in-progress", "await-feedback", "done"]
    .forEach(id => document.getElementById(id).innerHTML = "");
}

function renderAllTasks() {
  const counts = { "to-do": 0, "in-progress": 0, "await-feedback": 0, "done": 0 };
  tasksFirebase.forEach(task => {
    const column = document.getElementById(task.status);
    if (column) {
      column.innerHTML += getTaskTemplate(task);
      counts[task.status]++;
    }
  });
  return counts;
}

function renderEmptyColumns(counts) {
  Object.entries(counts).forEach(([status, count]) => {
    if (count === 0) {
      document.getElementById(status).innerHTML = getEmptyColumnTemplate(status);
    }
  });
}


function getCategoryInfo(category) {
  // Formatierte Bezeichnung (z. B. "user-story" → "User Story")
  const formattedName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Klasse für Farbstyling
  const badgeClassMap = {
    "user-story": "card__badge-user-story",
    "technical-task": "card__badge-technical-task"
  };

  const badgeClass = badgeClassMap[category];

  return {
    name: formattedName,
    className: badgeClass
  };
}

function getSubtaskProgress(task) {
  const total = task.subtask?.length || 0;
  const done = task.subtask?.filter(st => st.done).length || 0;
  const percent = total > 0 ? (done / total) * 100 : 0;

  return { total, done, percent };
}

function getPriorityIcon(priority) {
  const iconMap = {
    low: "../assets/img/icon/low_green.svg",
    medium: "../assets/img/icon/medium_yellow.svg",
    urgent: "../assets/img/icon/urgent_red.svg"
  };

  return iconMap[priority];
}

function renderAssignedAvatars(task) {
  return task.assignedTo
    .map(userId => {
      const contact = contactsFirebase.find(c => c.id === userId);
      if (contact) {
        const avatar = contact.avatar || "?";
        const colorKey = contact.id % 10; // letzte Ziffer der ID
        const color = avatarColors[colorKey] || "#cccccc"; // fallback
        return `<div class="card__credential" style="background-color: ${color};">${avatar}</div>`;
      }
      return "";
    })
    .join("");
}

function renderOverlayTask() {
    let contentRef = document.getElementById("story");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getOverlayTemplate();
}

function renderEditTask() {
    let contentRef = document.getElementById("edit");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getEditTemplate();
}




// Erweiterung der Funktion renderTasks, um die Tasks aus Firebase zu laden
// function render Tasks() {
//     const columns = ['to_do', 'in_progress', 'await_feedback', 'done'];
//     columns.forEach(column => {      
//         const contentRef = document.getElementById(column.replace('_', '-')); // Replace _ with - for HTML IDs
//         contentRef.innerHTML = '';   
//         tasksFirebase.forEach(task => {
//             if (task.status === column) {        
//                 // Assuming generateTaskHTML is a function that returns the HTML for a task
//                 // You need to implement this function to generate the HTML for each task
//                 //Brauche ich hier eine for schleife um das i zu füllen oder kann ich mit der ID arbeiten?
//                 // contentRef.innerHTML += getTaskTemplate(task, i);

//             }
//         });
//     });
