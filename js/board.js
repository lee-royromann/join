/**
 * Global Array and Variables for board menue incl. overlay and edit
 */
let tasksFirebase = [];
let contactsFirebase = [];
let currentDraggedID; 
let currentTask; 
let idToKey = {};
const searchInput = document.getElementById("search-task");
const noResults = document.getElementById("no-results");


/**
 * Open the task detail overlay for a given task ID.
 * Locks body scrolling and triggers slide-in animation.
 * @param {number} taskId 
 */
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
    console.log("Aktueller Task:", taskId); 
}


/**
 * Hide the overlay and wait for its CSS transition to finish.
 * @param {HTMLElement} overlay
 * @returns {Promise<void>} Resolves after the transition (or a short fallback timeout).
 */
function hideOverlay(overlay) {
    overlay.classList.remove('overlay--slide-in');
    return new Promise(resolve => {
        const onEnd = (e) => {
            if (e.target !== overlay) return;
            overlay.removeEventListener('transitionend', onEnd);
            resolve();
        };
        overlay.addEventListener('transitionend', onEnd, { once: true });
        setTimeout(resolve, 200);
    }).then(() => {
        overlay.classList.remove('overlay--visible');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    });
}


/**
 * Open the edit overlay for the given task.
 * @param {number} taskId
 * @returns {void}
 */
function openEditOverlay(taskId) {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    const taskIndex = tasksFirebase.findIndex(t => t.id === taskId);
    story.classList.add("d-none");
    edit.classList.remove("d-none");
    currentTask = tasksFirebase[taskIndex];
    currentTask.index = taskIndex;  
    if (!currentTask) return;
    renderEditTask(taskId); 
    console.log("Aktueller Task:", currentTask); 
    console.log("Aktuelle Task-ID:", taskId); 
}



/**
 * Controller for deleting a task via UI.
 * Ensures deletion, reload, overlay close, and re-render.
 * @async
 * @param {string|number} taskId
 * @returns {Promise<void>}
 */
async function handleDeleteTask(taskId) {
    try {
        await deleteTaskFromFirebase(taskId); 
        tasksFirebase = []; 
        await loadTasksFromFirebase();        
        closeOverlay();                       
        renderTasks();                        
    } catch (error) {
        console.error("Fehler beim Löschen der Aufgabe:", error);
    }
}


/**
 * Render the entire board: clear columns, render tasks, and placeholders for empty columns.
 */
function renderTasks() {
    clearAllColumns();
    const taskCounts = renderAllTasks();
    renderEmptyColumns(taskCounts);
}


/**
 * Clear all four status columns.
 */
function clearAllColumns() {
    ["to-do", "in-progress", "await-feedback", "done"]
      .forEach(id => document.getElementById(id).innerHTML = "");
}


/**
 * Render all tasks into their respective status columns.
 * @returns {StatusCounts} Count of tasks per status.
 */
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


/**
 * Insert "empty column" placeholders where no tasks exist.
 * @param {StatusCounts} counts
 */
function renderEmptyColumns(counts) {
    Object.entries(counts).forEach(([status, count]) => {
        if (count === 0) {
        document.getElementById(status).innerHTML = getEmptyColumnTemplate(status);
        }
    });
}


/**
 * Search tasks by title/description using the current input value.
 * Clears warning when input is empty, otherwise shows "no results" if none match.
 */
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


/**
 * Function to find a Task when the "Enter" key is pressed inside the input field.
 * It prevents default behavior to avoid form submission, when key is pressed down.
 * @param {KeyboardEvent} event - The keyboard event triggered by the key press.
 */
function handleEnterToFindSubtask(event) {   
    if (event.key === 'Enter') {
        event.preventDefault();
        searchTask();
    }
};


/**
 * Apply filtered results to the UI, or show warning if empty.
 * @param {Record<string, Task>} filtered
 * @param {HTMLElement} warning
 */
function updateTaskDisplay(filtered, warning) {
    if (Object.keys(filtered).length > 0) {
        renderFilteredTasks(filtered);
        warning.style.display = "none";
    } else {
        renderTasks();
        warning.style.display = "block";
    }
}


/**
 * Filter tasks by search term (case-insensitive) over title and description.
 * @param {string} searchTerm
 * @returns {Record<string, Task>} A map of index->Task for matches.
 */
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


/**
 * Render only the filtered set of tasks and update empty columns.
 * @param {Record<string, Task>} filteredTasks
 */
function renderFilteredTasks(filteredTasks) {
    clearAllColumns();
    const counts = { "to-do": 0, "in-progress": 0, "await-feedback": 0, "done": 0 };
    Object.values(filteredTasks).forEach(task => {
    const column = document.getElementById(task.status);
        if (column) {
          column.innerHTML += getTaskTemplate(task);
          counts[task.status]++;
        }
    });
    renderEmptyColumns(counts);
}


/**
 * Steers to get the right description and layout for user-story / technical task.
 * @param {string} category 
 * @returns {{name: string, className: string|undefined}}
 */
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

/**
 * Compute subtask progress stats.
 * @param {Task} task
 * @returns {{ total: number, done: number, percent: number }}
 */
function getSubtaskProgress(task) {
    const total = task.subtask?.length || 0;
    const done = task.subtask?.filter(st => st.done).length || 0;
    const percent = total > 0 ? (done / total) * 100 : 0;
    return { total, done, percent };
}


/**
 * Map priority to icon URL.
 * @param {TaskPriority} priority
 * @returns {string|undefined} icon URL
 */
function getPriorityIcon(priority) {
    const iconMap = {
        low: "../assets/img/icon/low_green.svg",
        medium: "../assets/img/icon/medium_yellow.svg",
        urgent: "../assets/img/icon/urgent_red.svg"
    };
    return iconMap[priority];
}

/**
 * Get checkbox icon path for subtask status.
 * @param {boolean} status
 * @returns {string} Icon URL.
 */
function getSubtaskIcon(status) {
    return status 
        ? "../assets/img/icon/checkbox_checked.svg" 
        : "../assets/img/icon/checkbox.svg";
}


/**
 * Render overlay subtasks into the container with id "subtaskFrame".
 * @param {Task} task
 * @returns {void}
 */
function renderSubtask(task) {
    const container = document.getElementById("subtaskFrame"); // z. B. <div id="subtaskFrame"></div>
    container.innerHTML = getSubtask(task.subtask);
}


/**
 * Map assigned contact IDs to rendered content using a supplied renderer.
 * @param {Task} task
 * @param {(contact: Contact, initials: string, color: string) => string} renderFn
 * @returns {string} Concatenated HTML string.
 */
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


/**
 * Render small circular avatar badges for assigned contacts.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function renderAssignedAvatars(task) {
    return mapAssignedContacts(task, (contact, initials, color) =>
        `<div class="card__credential" style="background-color: ${color};">${initials}</div>`
    );
}


/**
 * Render assigned contacts (avatar + full name) for overlay.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function renderAssignedContacts(task) {
    return mapAssignedContacts(task, (contact, initials, color) =>
        getContactTemplate(contact, initials, color)
    );
}


/**
 * Start drag operation for a task card.
 * @param {string|number} id
 */
function startDragging(id) {
    currentDraggedID = String(id);  
    document.getElementById(id).classList.add("card-transform")  // achtung muss noch irgendwo removed werden
}


/**
 * Allow drop on droppable targets.
 * @param {DragEvent} event
 * @returns {void}
 */
function allowDrop(event) {
    event.preventDefault();
}


// *****************************************************************************
// *****************************************************************************

/**
 * Render the read-only task overlay for a given task ID.
 * @param {string|number} taskId
 * @returns {void}
 */
function renderOverlayTask(taskId) {
    const task = tasksFirebase.find(t => t.id === taskId);
    if (!task) return;
    let contentRef = document.getElementById("story");
    contentRef.innerHTML = '';
    contentRef.innerHTML = getOverlayTemplate(task);
}


/**
 * Render the edit overlay for a given task.
 * @param {string|number} taskId
 * @returns {void}
 */
function renderEditTask(taskId) {
    overrideEmptySearchField();
    const task = findTaskById(taskId);
    if (!task) return;
    prepareEditOverlay();
    insertEditContent(task);
    initializeEditComponents(task);
}


/**
 * No-op override for a global `emptySearchField` if present.
 * Prevents side effects while edit overlay is open.
 */
function overrideEmptySearchField() {
    window.emptySearchField = () => {};
}


/**
 * Find a task in memory by ID.
 * @param {string|number} id
 * @returns {Task|undefined}
 */
function findTaskById(id) {
    return tasksFirebase.find(t => t.id === id);
}


/**
 * Prepare the edit overlay DOM container and remove stale ghost elements.
 * @returns {void}
 */
function prepareEditOverlay() {
    const contentRef = document.getElementById("edit");
    if (!contentRef) return;
    contentRef.innerHTML = '';
    const ghostInput = document.getElementById('contact-search');
    if (ghostInput) ghostInput.remove();
    const ghostList = document.getElementById('contact-list');
    if (ghostList) ghostList.remove();
}


/**
 * Insert edit overlay HTML for a task.
 * @param {Task} task
 */
function insertEditContent(task) {
    const contentRef = document.getElementById("edit");
    contentRef.innerHTML = getEditTemplate(task);
}


/**
 * Initialize widgets and populate data inside the editOverlay.
 * @param {Task} task
 * @returns {void}
 */
function initializeEditComponents(task) {
    initFlatpickrEdit();
    setInitialTaskPriority(task);
    populateContactsToEditDropdown(contactsFirebase, task.assignedTo);
    const badgeContainer = document.querySelector('.edit__contact-badges');
    if (badgeContainer) {
        badgeContainer.innerHTML = renderAssignedEditAvatars(task);
    }
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
    choosenPriority = priority;    
}


/**
 * Apply the task's current priority to the edit overlay.
 * @param {Task} task
 */
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


/**
 * Open the date picker (Flatpickr) for the edit due date field.
 * @param {MouseEvent} event
 */
function pickDateEdit(event) {
    event.stopPropagation();
    if (flatpickrEditInstance) {
        flatpickrEditInstance.open();
        flatpickrEditInstance.input.focus();
    }
}


/**
 * Initialize Flatpickr for the edit due date input.
 * Expects global `flatpickr` and `flatpickrEditInstance`.
 * @returns {void}
 */
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


/**
 * Populate the edit contact dropdown list, moving the logged-in user to the top.
 * @param {Contact[]} contacts
 * @param {Array<number|string>} [assignedIds=[]]
 * @returns {void}
 */
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


/**
 * Filter contacts in the edit dropdown list by a search value.
 * @param {string} searchValue
 */
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


/**
 * Smoothly scroll an element to its bottom.
 * @param {string} elementId
 */
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

/**
 * Update visual selection state for a contact row in the edit dropdown.
 * @param {number|string} id
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} listItem
 * @param {boolean} isSelected
 */
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


/**
 * Update the `assignedTo` array of a task after selecting/deselecting a contact.
 * @param {Task} task
 * @param {number|string} contactId
 * @param {boolean} isChecked
 */
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



/**
 * Render assignee badges for the edit overlay.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function renderAssignedEditAvatars(task) {
    return mapAssignedContacts(task, (contact, initials, color) =>
        `<div class="edit__contact-badge" style="background-color: ${color};">${initials}</div>`
    );
}


/**
 * Render list items for all *open* (not done) subtasks.
 * Keeps original indices, so edit/delete continues to work.
 * @param {Subtask[]} subtasks
 * @returns {string} HTML string.
 */
function renderSubtasks(subtasks) {
    return subtasks
        .map((subtask, originalIndex) => ({ subtask, originalIndex })) 
        .filter(({ subtask }) => subtask.done === false)               
        .map(({ subtask, originalIndex }) => 
            getSubtaskTemplate(subtask, originalIndex))                  
        .join(''); 
}


/**
 * Delete a subtask by index in the current edit task and re-render the list.
 * @param {number} id - Original subtask index.
 */
function deleteEditSubtask(id) {
    currentTask.subtask.splice(id, 1); 
    const list = document.querySelector('.edit__subtasklist');
    list.innerHTML = renderSubtasks(currentTask.subtask);
}


/**
 * Switch a subtask list item into "editing" mode (inline input).
 * @param {number} id - Original subtask index.
 * @returns {void}
 */
function editEditSubtask(id) {
    const subtask = currentTask.subtask[id];
    if (!subtask) return;
    const text = subtask.title;
    const targetElement = document.querySelector(`.edit__subtask[data-id="${id}"]`);
    if (!targetElement) return;
    const editElement = convertHtmlStringToDomElement(getOverlaySubtaskEditTemplate(id, text));
    targetElement.replaceWith(editElement);
}


/**
 * Persist edited subtask title and re-render the list.
 * @param {number} id - Original subtask index.
 * @returns {void}
 */
function saveEditedSubtask(id) {
    const input = document.getElementById(`subtaskEdit-${id}`);
    if (!input) return;
    const newTitle = input.value.trim();
    if (newTitle === '') return;
    currentTask.subtask[id].title = newTitle;
    document.querySelector('.edit__subtasklist').innerHTML = renderSubtasks(currentTask.subtask);
}


/**
 * Add a new subtask to the current edit task and re-render.
 * Ignores empty input.
 */
function addEditSubtask () {
    const input = document.getElementById("task-subtask-input");
    if (!input || input.value.trim() === '') return;  
    const newSubtask = {
        title: input.value.trim(),
        done: false
    };
    currentTask.subtask.push(newSubtask);
    document.querySelector('.edit__subtasklist').innerHTML = renderSubtasks(currentTask.subtask);
    input.value = ''; 
}


/**
 * Validate required edit fields (title, description, date).
 * @returns {boolean} True if all required fields are filled.
 */
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


/**
 * Check a single input field for non-empty value and show/hide error note.
 * @param {HTMLInputElement|HTMLTextAreaElement} input
 * @param {string} [message="This field is required"]
 * @returns {boolean} True if valid.
 */
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

/**
 * Sync values from edit form inputs into `currentTask`.
 * Applies selected priority if available.
 */
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


/**
 * Function to toggle the visibility of the user menu in the header
 * It toggles the class 'header__burger-menu--visible' on the element with id 'burger-menu'.
 * This class controls the visibility of the user menu.
 */
function toggleBoardTaskMenu(event, taskId) {
    event.stopPropagation();
    document.querySelectorAll('.card__burger-menu--visible')
        .forEach(menu => menu.classList.remove('card__burger-menu--visible'));
    const userMenu = document.getElementById('card-menu-' + taskId);
    userMenu.classList.toggle('card__burger-menu--visible');
}

/**
 * Close any open per-card menu when clicking elsewhere.
 */
document.addEventListener('click', function () {
    document.querySelectorAll('.card__burger-menu--visible')
        .forEach(menu => menu.classList.remove('card__burger-menu--visible'));
});


/**
 * Move a task to a new status via the card's burger menu, persist, and re-render.
 * @async
 * @param {string|number} taskId
 * @param {TaskStatus} newStatus
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */
async function moveEditStatus(taskId, newStatus, event) {
    event.stopPropagation();
    const idx = tasksFirebase.findIndex(t => String(t.id) === String(taskId));
    if (idx === -1) return;
    const updatedTask = { ...tasksFirebase[idx], status: newStatus };
    tasksFirebase[idx] = updatedTask;
    await saveTaskToFirebase(updatedTask); 
    const userMenu = document.getElementById('card-menu-' + taskId);
      if (userMenu) {
          userMenu.classList.remove('card__burger-menu--visible');
      }
    renderTasks();
}