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

let currentDraggedID;

const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";

const searchInput = document.getElementById("search-task");
const noResults = document.getElementById("no-results");

/**
 * Lädt Tasks aus Firebase und speichert sie in `tasksFirebase`.
 * @returns {Promise<void>}
 */
async function loadTasksFromFirebase() {
    // let response = await fetch(BASE_URL + "tasks.json");
    let response = await fetch(BASE_URL + "join/tasks.json");
    let responseToJson = await response.json();
    tasksFirebase = responseToJson;
    console.log(tasksFirebase);
  }

//Achtung, diese Funktion gibt es schon in db.js kann final einfach gelöscht werden
/**
 * Loads contacts from Firebase and assigns them to `contactsFirebase`.
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
//   let response = await fetch(BASE_URL + "contacts.json");
  let response = await fetch(BASE_URL + "/join/contacts.json");
  if (response.ok) {
    let data = await response.json();
    contactsFirebase = Object.values(data || {});
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

async function saveTaskToFirebase(taskId, fullTaskObject) {
    try {
        const response = await fetch(`${BASE_URL}join/tasks/${taskId}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fullTaskObject), // GANZES OBJEKT speichern
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fehler beim Speichern in Firebase:", errorText);
        } else {
            console.log("Task erfolgreich gespeichert:", taskId);
        }
    } catch (error) {
        console.error("Netzwerkfehler beim Speichern des Tasks:", error);
    }
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
  Object.entries(tasksFirebase).forEach(([id, task]) => {
  task.id = id; // falls noch nicht vorhanden
    const column = document.getElementById(task.status);
    if (column) {
      column.innerHTML += getTaskTemplate(task);
      counts[task.status]++;
    }
    console.log(task.id);  //final löschen
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

function searchTask() {
    const searchTerm = document.getElementById("search-task").value.trim();
    const warning = document.getElementById("no-results");

    if (searchTerm === "") {
        renderTasks();  
        warning.style.display = "none";
        return;
    }

    const filtered = filterTasks(searchTerm);
    updateTaskDisplay(filtered, warning);
}

function updateTaskDisplay(filtered, warning) {
  if (Object.keys(filtered).length > 0) {
    renderFilteredTasks(filtered);
    warning.style.display = "none";
  } else {
    renderTasks();
    warning.style.display = "block";
  }
}


function filterTasks(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();

  return Object.entries(tasksFirebase)
    .filter(([_, task]) =>
      task.title.toLowerCase().includes(lowerSearchTerm) ||
      task.description.toLowerCase().includes(lowerSearchTerm)
    )
    .reduce((acc, [id, task]) => {
      acc[id] = task;
      return acc;
    }, {});
}

function renderFilteredTasks(filteredTasks) {
  clearAllColumns();

  const counts = { "to-do": 0, "in-progress": 0, "await-feedback": 0, "done": 0 };

  Object.entries(filteredTasks).forEach(([id, task]) => {
    task.id = id;
    const column = document.getElementById(task.status);
    if (column) {
      column.innerHTML += getTaskTemplate(task);
      counts[task.status]++;
    }
  });

  renderEmptyColumns(counts);
}


function getCategoryInfo(category) {
  
  const formattedName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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
        const prenameInitial = contact.prename?.charAt(0).toUpperCase() || '';
        const surnameInitial = contact.surname?.charAt(0).toUpperCase() || '';
        const initials = `${prenameInitial}${surnameInitial}`;
        const colorKey = contact.id % 10; // letzte Ziffer der ID
        const color = avatarColors[colorKey] || "#cccccc"; // fallback
        return `<div class="card__credential" style="background-color: ${color};">${initials}</div>`;
      }
      return "";
    })
    .join("");
}

function startDragging(id) {
    currentDraggedID = String(id);   //Prüfe ob String oder Number
    document.getElementById(id).classList.add("card-transform")
}

function allowDrop(event) {
    event.preventDefault();
}

async function moveTo(status) {
    tasksFirebase[currentDraggedID]['status'] = status;
    renderTasks();  
    const updatedTask = tasksFirebase[currentDraggedID];
    await saveTaskToFirebase(currentDraggedID, updatedTask);
}

function renderOverlayTask(index) {
    let contentRef = document.getElementById("story");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getOverlayTemplate();
}

function renderEditTask(index) {
    let contentRef = document.getElementById("edit");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getEditTemplate();
}
