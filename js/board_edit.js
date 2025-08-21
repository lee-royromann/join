/**
 * Open the edit overlay for the given task.
 * @param {number} taskId
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
}


/**
 * Prepare the edit overlay DOM container and remove stale ghost elements.
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
 * Function to reset all priority buttons to their default state
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
 * Initialize Flatpickr for the edit due date input.  * Expects global `flatpickr` and `flatpickrEditInstance`.
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
 * Function to rotate the arrow icon on of the dropdown-fields by a specific css class
 */
function rotateArrowIcon(arrowIconId) {
    const arrowIcon = document.getElementById(arrowIconId);
    arrowIcon.classList.toggle('arrow-icon-rotated');
}


/**
 * Function to toggle the visibility of a dropdown menu and rotate its arrow icon.
 * Currently open dropdowns will be closed before opening the new one. Scrolls the card to the bottom when opening contact drop-down.
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
 * Updates the checkbox -> switching the checked/unchecked icons, highlights or 
 * unhighlights the contact visually, adds or removes the corresponding badge, clears the search input after each selection change.
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
 * Render list items for all *open* (not done) subtasks. Keeps original indices, so edit/delete continues to work.
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
 * Add a new subtask to the current edit task and re-render. Ignores empty input.
 * If the value of the first element of the currentTask array is equal to "_empty",
 * the actual array will be emptied and afterwards replaced by the new subtask.
 */
function addEditSubtask () {
    const input = document.getElementById("task-subtask-input");
    if (currentTask.subtask[0] == "_empty") {
        currentTask.subtask = [];
    }
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
        input.classList.remove("field-error");
        return true;
    }
}


/**
 * Sync values from edit form inputs into `currentTask`. Applies selected priority if available.
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