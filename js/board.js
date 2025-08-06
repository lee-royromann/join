// Transfer to db.js

let tasksFirebase = [];
let contactsFirebase = [];

let currentDraggedID; 
let currentTask; 

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
  }

//Achtung, diese Funktion gibt es schon in db.js kann final einfach gelöscht werden
/**
 * Loads contacts from Firebase and assigns them to `contactsFirebase`.
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
  let response = await fetch(BASE_URL + "/join/contacts.json");
  let unsortedContacts = [];
  if (response.ok) {
    let data = await response.json();
    unsortedContacts = Object.values(data || {});
    contactsFirebase = sortContactsByPrename(unsortedContacts);     //prüfen, wann sortierung sinnvoll ist
  } else {
    contactsFirebase = [];
  }
  console.log(contactsFirebase);
}


function openOverlay(taskId) {
    const overlay = document.getElementById("overlay");
    const story = document.getElementById("story");
    overlay.style.display = "flex";
    overlay.classList.add("overlay--visible");
    setTimeout(() => {
        overlay.classList.add('overlay--slide-in');
    }, 15);
    document.body.style.overflow = 'hidden';
    story.classList.remove("d-none");
    renderOverlayTask(taskId);
}

async function closeOverlay() {
    const overlay = document.getElementById("overlay");
    const story = document.getElementById("story");
    overlay.style.display = "none";
    overlay.classList.remove("overlay--visible");
    overlay.classList.remove('overlay--slide-in');

    document.body.style.overflow = '';
    await loadTasksFromFirebase(); // Neu laden, um Änderungen zu reflektieren
    story.classList.add("d-none");
    renderTasks(); // Tasks neu rendern
}

async function closeEditOverlay() {
    const overlay = document.getElementById("overlay");
    const edit = document.getElementById("edit");
    overlay.style.display = "none";
    overlay.classList.remove("overlay--visible");
    overlay.classList.remove('overlay--slide-in');

    document.body.style.overflow = '';
    await loadTasksFromFirebase(); // Neu laden, um Änderungen zu reflektieren
    edit.classList.add("d-none");
    currentTask = null; // Aktuellen Task zurücksetzen
    renderTasks(); // Tasks neu rendern
    
}

function openEditOverlay(taskId) {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    const taskIndex = tasksFirebase.findIndex(t => t.id === taskId);
    story.classList.add("d-none");
    edit.classList.remove("d-none");
    currentTask = tasksFirebase[taskIndex];
    currentTask.index = taskIndex;  // wenn du später noch speichern willst
    if (!currentTask) return;

    renderEditTask(taskId); 
    console.log("Aktueller Task:", currentTask); // Debugging
    console.log("Aktuelle Task-ID:", taskId); // Debugging
}


async function boardInit() {
    await loadTasksFromFirebase();
    await loadContactsFromFirebase();
    renderTasks();
    getUsernameInitals();
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
    contentRef.innerHTML = getOverlayTemplate(task);
}

function renderEditTask(taskId) {
    overrideEmptySearchField();
    const task = findTaskById(taskId);
    if (!task) return;

    prepareEditOverlay();
    insertEditContent(task);
    initializeEditComponents(task);
}

function overrideEmptySearchField() {
    window.emptySearchField = () => {};
}

function findTaskById(id) {
    return tasksFirebase.find(t => t.id === id);
}

function prepareEditOverlay() {
    const contentRef = document.getElementById("edit");
    if (!contentRef) return;

    contentRef.innerHTML = '';

    const ghostInput = document.getElementById('contact-search');
    if (ghostInput) ghostInput.remove();

    const ghostList = document.getElementById('contact-list');
    if (ghostList) ghostList.remove();
}

function insertEditContent(task) {
    const contentRef = document.getElementById("edit");
    contentRef.innerHTML = getEditTemplate(task);
}

function initializeEditComponents(task) {
    initFlatpickrEdit();
    setInitialTaskPriority(task);
    populateContactsToEditDropdown(contactsFirebase, task.assignedTo);

    const badgeContainer = document.querySelector('.edit__contact-badges');
    if (badgeContainer) {
        badgeContainer.innerHTML = renderAssignedEditAvatars(task);
    }
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
function setPriorityEdit(priority) {
    resetPriorityButtonsEdit();
    let button = document.getElementById(`edit__btn-${priority}`);
    let icon = document.getElementById(`edit__btn-${priority}-icon`);
    button.classList.add(`edit__button-prio--${priority}`);
    icon.classList.add(`icon-white`);
    choosenPriority = priority;    //speichert die gewählte Priorität in der globalen Variable
}


function setInitialTaskPriority(task) {
    const taskPriority = task.priority.toLowerCase();
    setPriorityEdit(taskPriority);
}

 
/**
 * Function to reset all priority buttons to their default state.
 * Removes any applied priority-specific modifier classes from each button.
 */
function resetPriorityButtonsEdit() {
    const priorities = ['urgent', 'medium', 'low'];

    priorities.forEach(priority => {
        const button = document.getElementById(`edit__btn-${priority}`);
        button.classList.remove(`edit__button-prio--${priority}`);
        const icon = document.getElementById(`edit__btn-${priority}-icon`);
        icon.classList.remove('icon-white');
    });
}

function pickDateEdit(event) {
    event.stopPropagation();
   
    if (flatpickrEditInstance) {
        flatpickrEditInstance.open();
        flatpickrEditInstance.input.focus();
    }
}


function initFlatpickrEdit() {
    const input = document.getElementById('edit-due-date');
    if (!input) return;

    flatpickrEditInstance = flatpickr(input, {
        locale: 'de',
        dateFormat: 'd.m.Y',
        disableMobile: true,
        minDate: 'today',
        allowInput: true
    });
}


function populateContactsToEditDropdown(contacts, assignedIds = []) {
    const contactsRef = document.getElementById("edit-contact-list");
    contactsRef.innerHTML = "";
    const loggedInUser = localStorage.username;
    const sortedContacts = moveLoggedInUserToTop(contacts, loggedInUser);

    for (let contact of sortedContacts) {
        const isLoggedIn = `${contact.prename} ${contact.surname}` === loggedInUser;
        const isAssigned = assignedIds.map(Number).includes(Number(contact.id));
        const youLabel = isLoggedIn ? "(You)" : "";
        contactsRef.innerHTML += getEditContactListItem(contact, youLabel, isAssigned);
    }
}


/** 
 * Function to rotate the arrow icon in on of the dropdown-fields.
 * It's going to toggle a specific css-class which rotates the icon.
 */
function rotateArrowIcon(arrowIconId) {
    const arrowIcon = document.getElementById(arrowIconId);
    arrowIcon.classList.toggle('arrow-icon-rotated');
    console.log(`Arrow icon with ID ${arrowIconId} rotated.`);
}


/**
 * Function to toggle the visibility of a dropdown menu and rotate its arrow icon.
 * If another dropdown is currently open, it will be closed before opening the new one.
 * Keeps track of the currently open dropdown to ensure only one is open at a time.
 * Scrolls the card to the bottom when opening contact drop-down.
 */
function toggleEditDropdown(event, dropdownId, arrowIconId) {
    event.stopPropagation();
    const dropdown = document.getElementById(dropdownId);
    const arrow = document.getElementById(arrowIconId);
    const isOpen = !dropdown.classList.contains('d_none');
    if (isOpen) {
    hideElement('edit-contact-list-wrapper');
    rotateArrowIcon(arrowIconId);
    currentOpenDropdown = null;
    } else {
    if (currentOpenDropdown) {
        currentOpenDropdown.dropdown.classList.add('d_none');
        currentOpenDropdown.arrow.classList.remove('arrow-icon-rotated');
    }
    showElement('edit-contact-list-wrapper');
    rotateArrowIcon(arrowIconId);
    currentOpenDropdown = { dropdown, arrow };
    const search = document.getElementById('edit-contact-search').value.trim().toLowerCase();
    if (search) filterContactsInDropdown(search);
    else populateContactsToEditDropdown(contactsFirebase, currentTask?.assignedTo || []);
  }

    scrollToBottom("edit-scroll-wrapper");
}

function filterContactsInDropdown(searchValue) {
    const filteredContacts = contactsFirebase.filter(contact => {
        const fullName = `${contact.prename} ${contact.surname}`.toLowerCase();
        return fullName.includes(searchValue);
    });

    const listContainer = document.getElementById("edit-contact-list");
    listContainer.innerHTML = "";

    const assignedIds = currentTask?.assignedTo || [];

    for (let contact of filteredContacts) {
        const isAssigned = assignedIds.includes(Number(contact.id));
        const youLabel = (`${contact.prename} ${contact.surname}` === localStorage.username) ? "(You)" : "";
        listContainer.innerHTML += getEditContactListItem(contact, youLabel, isAssigned);
    }
}


function scrollToBottom(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
}


/**
 * Function to toggle the selection state of a contact.
 * Updates the checkbox -> switching the checked/unchecked icons.
 * Highlights or unhighlights the contact visually.
 * Adds or removes the corresponding badge.
 * Clears the search input after each selection change.
 */
function selectEditContact(id) {
    const checkbox = document.getElementById(`contact-checkbox-${id}`);
    const listItem = document.getElementById(`contact-id-${id}`);
    const isChecked = checkbox.checked = !checkbox.checked;
    updateEditContactSelectionState(id, checkbox, listItem, isChecked);
    updateAssignedContacts(currentTask, id, isChecked);
    document.querySelector('.edit__contact-badges').innerHTML = renderAssignedEditAvatars(currentTask);
}

function updateEditContactSelectionState(id, checkbox, listItem, isSelected) {
    const iconChecked = listItem.querySelector('.form__contact-checkbox-icon-checked');
    const iconUnchecked = listItem.querySelector('.form__contact-checkbox-icon-unchecked');
    iconChecked.classList.toggle('d_none', !isSelected);
    iconUnchecked.classList.toggle('d_none', isSelected);
 listItem.classList.toggle('bg-blue', isSelected);

    if (isSelected) {
      highlightContact(checkbox);
    } else {
      unhighlightContact(checkbox);  
    }
}




function updateAssignedContacts(task, contactId, isChecked) {
    if (!Array.isArray(task.assignedTo)) {
        task.assignedTo = [];
    }

    const idNum = Number(contactId); 

    if (isChecked && !task.assignedTo.includes(idNum)) {
        task.assignedTo.push(idNum);
    } else if (!isChecked) {
        task.assignedTo = task.assignedTo.filter(id => id !== idNum);
    }
}

function renderAssignedEditAvatars(task) {
  return mapAssignedContacts(task, (contact, initials, color) =>
    `<div class="edit__contact-badge" style="background-color: ${color};">${initials}</div>`
  );
}


function renderSubtasks(subtasks) {
  
  return subtasks
    .map((subtask, originalIndex) => ({ subtask, originalIndex })) // 1. Index merken
    .filter(({ subtask }) => subtask.done === false)               // 2. Nur unerledigte
    .map(({ subtask, originalIndex }) => 
      getSubtaskTemplate(subtask, originalIndex))                  // 3. Index mitgeben
    .join('');
    
}

function deleteEditSubtask(id) {
    currentTask.subtask.splice(id, 1); 

    const list = document.querySelector('.edit__subtasklist');
    list.innerHTML = renderSubtasks(currentTask.subtask);
}

function editEditSubtask(id) {
  
  const subtask = currentTask.subtask[id];
  if (!subtask) return;
  const text = subtask.title;
  
  const targetElement = document.querySelector(`.edit__subtask[data-id="${id}"]`);
  if (!targetElement) return;

  const editElement = convertHtmlStringToDomElement(getOverlaySubtaskEditTemplate(id, text));
  targetElement.replaceWith(editElement);
 
}

function saveEditedSubtask(id) {
  const input = document.getElementById(`subtaskEdit-${id}`);
  if (!input) return;

  const newTitle = input.value.trim();
  if (newTitle === '') return;

  currentTask.subtask[id].title = newTitle;
  document.querySelector('.edit__subtasklist').innerHTML = renderSubtasks(currentTask.subtask);
}

function addEditSubtask () {
    const input = document.getElementById("task-subtask-input");
    
    if (!input || input.value.trim() === '') return;  //brauche ich hier einen Untertitel?

    const newSubtask = {
        title: input.value.trim(),
        done: false
    };

    currentTask.subtask.push(newSubtask);
    document.querySelector('.edit__subtasklist').innerHTML = renderSubtasks(currentTask.subtask);
    input.value = ''; 
}


async function saveEditTask() {
    if (!validateEditForm()) return;

    updateEditBoardData();
    await saveTaskToFirebase(currentTask.id, currentTask);
    await closeEditOverlay();
}



function validateEditForm() {
    const titleInput = document.getElementById("edit-title");
    const descriptionInput = document.getElementById("edit-description");
    const dateInput = document.getElementById("edit-due-date");

    let isValid = true;

    if (!checkField(titleInput)) isValid = false;
    if (!checkField(descriptionInput)) isValid = false;
    if (!checkField(dateInput)) isValid = false;

    return isValid;
}


function checkField(input, message = "This field is required") {
    const wrapper = input.closest(".edit__group--input-wrapper") || input.parentElement;
    const note = wrapper.querySelector(".edit__required-note");

    if (!input.value.trim()) {
        note.textContent = message;
        note.style.display = "block";
        input.classList.add("field-error");
        return false;
    } else {
        // note.style.display = "none";
        input.classList.remove("field-error");
        return true;
    }
}

function updateEditBoardData() {
    const title = document.getElementById("edit-title").value.trim();
    const description = document.getElementById("edit-description").value.trim();
    const date = document.getElementById("edit-due-date").value.trim();

    currentTask.title = title;
    currentTask.description = description;
    currentTask.date = date;

    if (typeof choosenPriority !== 'undefined' && choosenPriority) {
        currentTask.priority = choosenPriority;
    }
}

