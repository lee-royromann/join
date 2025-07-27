// Transfer to db.js

let tasksFirebase = [];
let contactsFirebase = [];

let currentDraggedID;

const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";

const searchInput = document.getElementById("search-task");
const noResults = document.getElementById("no-results");

/**
 * Lädt Tasks aus Firebase und speichert sie in `tasksFirebase`.
 * @returns {Promise<void>}
 */
async function loadTasksFromFirebase() {
    let response = await fetch(BASE_URL + "join/tasks.json");
    let responseToJson = await response.json();
    tasksFirebase = [];
    tasksFirebase = Object.values(responseToJson).filter(task => task != null);
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


function openOverlay(taskId) {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    overlay.classList.add("overlay--visible");
    setTimeout(() => {
        overlay.classList.add('overlay--slide-in');
    }, 15);
    document.body.style.overflow = 'hidden';
    renderOverlayTask(taskId);
}

async function closeOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    overlay.classList.remove("overlay--visible");
    overlay.classList.remove('overlay--slide-in');

    document.body.style.overflow = '';
    await loadTasksFromFirebase(); // Neu laden, um Änderungen zu reflektieren
    renderTasks(); // Tasks neu rendern
}

function openEditOverlay(taskId) {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    story.classList.add("d-none");
    edit.classList.remove("d-none");
    renderEditTask(taskId);
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

async function deleteTaskFromFirebase(taskId) {
    try {
        const response = await fetch(`${BASE_URL}join/tasks/${taskId}.json`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fehler beim Löschen in Firebase:", errorText);
        } else {
            console.log("Task erfolgreich gelöscht:", taskId);
        }
    } catch (error) {
        console.error("Netzwerkfehler beim Löschen des Tasks:", error);
    }
    console.log("Task gelöscht:", taskId);
    
  }

  async function handleDeleteTask(taskId) {
  if (confirm("Willst du diese Aufgabe wirklich löschen?")) {
    try {
      await deleteTaskFromFirebase(taskId); // Auf das Löschen warten
      tasksFirebase = []; 
      await loadTasksFromFirebase();        // Tasks neu laden
      closeOverlay();                       // Overlay schließen
      renderTasks();                        // Tasks neu rendern
    } catch (error) {
      console.error("Fehler beim Löschen der Aufgabe:", error);
    }
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

function getSubtaskIcon(status) {
  return status 
    ? "../assets/img/icon/checkbox_checked.svg" 
    : "../assets/img/icon/checkbox.svg";
}

function getSubtask(subtasks, taskId) {
  if (!subtasks || subtasks.length === 0) {
    return ;
  }

  return subtasks.map((sub, index) => `
    <div class="overlay__subtask" data-index="${index}">
      <img src="../assets/img/icon/checkbox_checked.svg" class="${sub.done ? '' : 'd-none'}" alt="checked" id="check-${taskId}-${index}" onclick="toggleSubtaskStatus(${index}, '${taskId}')">
      <img src="../assets/img/icon/checkbox.svg" class="${sub.done ? 'd-none' : ''}" alt="unchecked" id="uncheck-${taskId}-${index}" onclick="toggleSubtaskStatus(${index}, '${taskId}')">
      <span>${sub.title}</span>
    </div>
  `).join("");
}


function renderSubtask(task) {
  const container = document.getElementById("subtaskFrame"); // z. B. <div id="subtaskFrame"></div>
  container.innerHTML = getSubtask(task.subtask);
}


function mapAssignedContacts(task, renderFn) {
  return task.assignedTo.map(userId => {
    const contact = contactsFirebase.find(c => c.id === userId);
    if (!contact) return '';

    const prenameInitial = contact.prename?.charAt(0).toUpperCase() || '';
    const surnameInitial = contact.surname?.charAt(0).toUpperCase() || '';
    const initials = `${prenameInitial}${surnameInitial}`;
    const color = contact.color || "#cccccc";

    return renderFn(contact, initials, color);
  }).join('');
}

function renderAssignedAvatars(task) {
  return mapAssignedContacts(task, (contact, initials, color) =>
    `<div class="card__credential" style="background-color: ${color};">${initials}</div>`
  );
}

function renderAssignedContacts(task) {
  return mapAssignedContacts(task, (contact, initials, color) =>
    getContactTemplate(contact, initials, color)
  );
}



function startDragging(id) {
    currentDraggedID = String(id);  
    document.getElementById(id).classList.add("card-transform")  // achtung muss noch irgendwo removed werden
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

function renderOverlayTask(taskId) {
    const task = tasksFirebase.find(t => t.id === taskId);
    if (!task) return;
    let contentRef = document.getElementById("story");
    contentRef.innerHTML = '';
    contentRef.innerHTML += getOverlayTemplate(task);
}

function renderEditTask(taskId) {
    const task = tasksFirebase.find(t => t.id === taskId);
    if (!task) return;
    let contentRef = document.getElementById("edit");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getEditTemplate(task);
    setInitialTaskPriority(task)
}


function selectContact(id) {
    const checkbox = document.getElementById(`contact-checkbox-${id}`);
    const listItem = document.getElementById(`contact-id-${id}`);
    const isChecked = checkbox.checked = !checkbox.checked;
    updateContactSelectionState(id, checkbox, listItem, isChecked);
    emptySearchField('contact-search');
}

async function toggleSubtaskStatus(index, taskId) {
 
  // Task in tasksFirebase finden
  const task = tasksFirebase.find(t => t.id === taskId);
  if (!task || !task.subtask || !task.subtask[index]) {
    console.warn("Task oder Subtask nicht gefunden");
    return;
  }

  // Status umschalten
  task.subtask[index].done = !task.subtask[index].done;

  // DOM aktualisieren
  const checkEl = document.getElementById(`check-${taskId}-${index}`);
  const uncheckEl = document.getElementById(`uncheck-${taskId}-${index}`);

  if (task.subtask[index].done) {
    checkEl.classList.remove("d-none");
    uncheckEl.classList.add("d-none");
  } else {
    checkEl.classList.add("d-none");
    uncheckEl.classList.remove("d-none");
  }

  // Änderungen an Firebase zurückschreiben
  await saveTaskToFirebase(taskId, task);
}


/**
 * Function to set the selected task priority.
 * Resets all priority buttons and applies the specifically choosen priority css class to it.
 */
function setPriority(priority) {
    resetPriorityButtons();
    let button = document.getElementById(`edit__btn-${priority}`);
    let icon = document.getElementById(`edit__btn-${priority}-icon`);
    button.classList.add(`edit__button-prio--${priority}`);
    icon.classList.add(`icon-white`);
    choosenPriority = priority;    //speichert die gewählte Priorität in der globalen Variable
}


function setInitialTaskPriority(task) {
    const taskPriority = task.priority.toLowerCase();
    setPriority(taskPriority);
}

 
/**
 * Function to reset all priority buttons to their default state.
 * Removes any applied priority-specific modifier classes from each button.
 */
function resetPriorityButtons() {
    const priorities = ['urgent', 'medium', 'low'];

    priorities.forEach(priority => {
        const button = document.getElementById(`edit__btn-${priority}`);
        button.classList.remove(`edit__button-prio--${priority}`);
        const icon = document.getElementById(`edit__btn-${priority}-icon`);
        icon.classList.remove('icon-white');
    });
}

