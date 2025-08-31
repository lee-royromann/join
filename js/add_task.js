// Global variables
const FIREBASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";
let firebaseContacts = [];
const priorities = ['urgent', 'medium', 'low'];
let currentOpenDropdown = null;
let subtaskCount = 0;
let subtaskIdCount = 0;
let choosenPriority = "";
const categories = [
    "technical-task",
    "user-story"
];
let flatpickrInstance = null;


/** 
 * Function to initialize the Add Task page.
 */
async function initAddTask() {
    initFlatpickr();
    setDefaultTaskPriority();
    await loadFirebaseContacts();
    populateCategoriesToDropdown();
    getUsernameInitals();
    preventFormSubmitOnEnter('form-add-task');
}


/**
 * Function to set the selected task priority.
 * Resets all priority buttons and applies the specifically chosen priority CSS class to it.
 * @param {string} priority - The priority level to set.
 */
function setPriority(priority) {
    resetPriorityButtons();
    let button = document.getElementById(`btn-${priority}`);
    button.classList.add(`form__button-prio--${priority}`);
    choosenPriority = priority;    
}


/**
 * Function to load the contacts from Firebase.
 * It uses the Firebase URL to fetch the contacts data from the "/join/contacts.json" endpoint.
 * It handles the response and ensures that the contacts are sorted by their prenames.
 * After loading is finished, the contacts are getting populated to the dropdown.
 * It also handles the case where the response is not OK, setting an empty array in that case.
 */
async function loadFirebaseContacts() {
    let response = await fetch(FIREBASE_URL + "/join/contacts.json");
    let loadedContacts = [];
    if (response.ok) {
        let data = await response.json();
        loadedContacts = data ? Object.values(data) : []; 
        firebaseContacts = sortContactsByPrename(loadedContacts); 
        populateContactsToDropdown(firebaseContacts);
    } else {
        firebaseContacts = [];
    }
}


/**
 * Function to create a new task.
 * It validates the inputs and adds the task to DB if everything is valid.
 * It also checks the origin, where the function get called from.
 * -> When function call comes from the board-page, then it will close the overlay
 * and reloads the page, to display the new added task.
 * -> When the funtction call comes from another page than board-page it redirects to the board-page.
 * OPTIMIZATION: Maybee better to refresh the page by fetching tasks from DB instead of reloading the page.
 * @param {Event} event - The event object from the form submission.
 * @param {string} taskStatus - The status of the task (e.g., "todo", "in-progress", "done").
 * @param {string} origin - The origin of the task creation (e.g., "board-page", "modal").
 * @returns {Promise<void>}
 */
async function createTask(event, taskStatus, origin) {
    event.preventDefault();
    const validation = validateFormData();
    if (!validation.isValid) {
        return;
    }
    try {
        const task = await getTaskData(taskStatus);
        await addTaskToDB(task);
    } catch (error) {
    }
    if (origin === 'board-page') {
        closeTaskOverlay();
        showBoardTaskNotification('add');
        // window.location.reload();
    } else {
        // window.location.href = './board.html';
    }
}


/**
 * Function to display the add-task overlay for creating a new task.
 * Gets the reference container by it's ID to load a template in it.
 * Gets the overlay template and renders it into the templateContainer.
 * Next it's going eas-in the backdrop and roundabout one cycle later it slides-in the template from the right side.
 * After that it's going to preset the priority and populates all the data to the dropdowns.
 * Finally it's initalizing the datepicker and shows the overlay after all is done.
 * @param {string} taskStatus - The status of the task to be created (e.g., "todo", "in-progress", "done").
 */
function showTaskOverlay(taskStatus) {
    const templateContainer = document.getElementById('task__overlay');
    let taskTemplate = getAddTaskOverlayTemplate(taskStatus);
    templateContainer.innerHTML = taskTemplate;
    templateContainer.style.display = 'flex';
    templateContainer.classList.add('task__overlay--visible');
    setTimeout(() => {
        templateContainer.classList.add('task__overlay--slide-in');
    }, 15);
    setDefaultTaskPriority();
    loadFirebaseContacts();
    populateCategoriesToDropdown();
    initFlatpickr();
}


/**
 * Function to simply close the overlay by clicking on the cross icon.
 * First it's going to slide-out the template to right side (out of viewport).
 * Shortly after it removes the visibility of the backdrop,
 * empties the innerHTML of the overlay container
 * and finally hides the overlay container completely.
 */
function closeTaskOverlay() {
    const taskOverlay = document.getElementById('task__overlay');
    taskOverlay.classList.remove('task__overlay--slide-in');
    setTimeout(() => {
        taskOverlay.classList.remove('task__overlay--visible');
        taskOverlay.innerHTML = "";
        taskOverlay.style.display = 'none';
    }, 150);
}


/**
 * Function to add a new subtask to the list based on user input.
 * Reads the value from the subtask input field. If the input is not empty,
 * it generates a new subtask element using a template, appends it to the subtask list,
 * clears the input field, and updates the subtask counters.
 */
function addSubtask() {
    let inputField = document.getElementById("subtask-input");
    let subtaskText = inputField.value.trim();
    if (subtaskText === "") return;
    let subtasksRef = document.getElementById("subtask-list");
    const subtaskTemplate = getSubtaskRegularTemplate(subtaskIdCount, subtaskText);
    subtasksRef.innerHTML += subtaskTemplate;
    inputField.value = "";
    increaseSubtaskCount();
    increaseSubtaskIdCount();
    clearSubtaskInput();
}


/**
 * Function to change a subtask from display mode to edit mode.
 * It finds the subtask by its ID, reads the current text from the dataset,
 * generates the editable version using a template, and replaces
 * the static view with an input-enabled version.
 * @param {number} id - The ID of the subtask to edit.
 */
function editSubtask(id) {
    const defaultSubtask = document.querySelector(`.form__subtask-item[data-id="${id}"]`);
    const text = defaultSubtask.dataset.text;
    const editSubtask = convertHtmlStringToDomElement(getSubtaskEditTemplate(id, text));
    defaultSubtask.replaceWith(editSubtask);
}


/**
 * Function to save a subtask that’s currently being edited.
 * It finds the subtask in "edit" mode using its ID, grabs the input text,
 * and if the input isn’t empty, replaces the editable version with
 * the regular/default subtask display element.
 * @param {number} id - The ID of the subtask being saved.
 * @returns {void}
 */
function saveSubtask(id) {
    const editSubtask = document.querySelector(`.form__subtask-item-edit[data-id="${id}"]`);
    const input = editSubtask.querySelector('.form__subtask-input');
    const newText = input.value.trim();
    if (!newText) return;
    const defaultSubtask = convertHtmlStringToDomElement(getSubtaskRegularTemplate(id, newText));
    editSubtask.replaceWith(defaultSubtask);
}


/**
 * Function to delete a specific subtask from the DOM.
 * Locates the subtask element using its ID and a selector suffix,
 * removes it from the DOM if found, and updates the subtask counter.
 * @param {HTMLElement} element - The subtask element to delete.
 * @param {number} id - The ID of the subtask to delete.
 */
function deleteSubtask(element, id) {
    const item = document.querySelector(`.form__subtask-item${element}[data-id="${id}"]`);
    if (item) item.remove();
    decreaseSubtaskCount();
}


/**
 * Function to toggle the selection state of a contact.
 * Updates the checkbox -> switching the checked/unchecked icons.
 * Highlights or unhighlights the contact visually.
 * Adds or removes the corresponding badge.
 * Clears the search input after each selection change.
 * @param {string} id - The ID of the contact to select.
 */
function selectContact(id) {
    const checkbox = document.getElementById(`contact-checkbox-${id}`);
    const listItem = document.getElementById(`contact-id-${id}`);
    const isChecked = checkbox.checked = !checkbox.checked;
    updateContactSelectionState(id, checkbox, listItem, isChecked);
    emptySearchField('contact-search');
}


/**
 * Function to select a category from the dropdown.
 * Sets the selected category value into the input field based on the clicked item.
 * Hides the dropdown menu after selection and resets the arrow icon rotation.
 * @param {string} id - The ID of the category to select.
 * @param {string} arrowIconId - The ID of the arrow icon element to rotate.
 */
function selectCategory(id, arrowIconId) {
    const item = document.getElementById(`category-id-${id}`);
    const input = document.getElementById('category-input');
    const dropdown = document.getElementById('category-list');
    const arrowIcon = document.getElementById(arrowIconId);
    if (item && input) {
        const category = item.getAttribute('data-category');
        input.value = category;
    }
    if (dropdown && !dropdown.classList.contains('d_none')) {
        dropdown.classList.add('d_none');
    }
    arrowIcon.classList.remove('arrow-icon-rotated');
}


/**
 * Function to add a task object to the Firebase realtime database.
 * @param {Object} task - The task object to add.
 */
async function addTaskToDB(task) {
    try {
        const response = await fetch(`${FIREBASE_URL}/join/tasks/${task.id}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
            }
        );
        if (!response.ok) {
            throw new Error(`Serverfehler: ${response.status}`);
        }
        showTaskNotification();
        clearForm();
    } catch (error) {
        console.error("Failes to add the task to the Firebase DB:", error.message);
    }
}


/**
 * Function to show a notification when a task is successfully created.
 */
function showTaskNotification() {
    const notification = document.getElementById('taskNotification');
    if (!notification) return console.warn('Notification element not found.');
    notification.classList.add('form__notification--show');
    setTimeout(() => {
        notification.classList.remove('form__notification--show');
    }, 800);
    setTimeout(() => {
        window.location.href = './board.html';
    }, 950);
}


/**
 * Schliesst das AddTask-Overlay, wenn auf den Hintergrund geklickt wird.
 * Verhält sich wie der Klick auf das 'X'-Icon.
 */
function closeTaskOverlayOnClick(event) {
    if (event.target.id === 'task__overlay') {
        event.stopPropagation();
        closeTaskOverlay();
    }
}