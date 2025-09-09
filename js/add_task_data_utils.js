let assignedContacts = [];


/**
 * This function controls the logic and calls the new render function.
 * Updates the selection state of a contact and redraws the badges.
 * @param {string} id - The ID of the contact.
 * @param {HTMLElement} checkbox - The checkbox element.
 * @param {HTMLElement} listItem - The list item element.
 * @param {boolean} isSelected - The new selection state.
 */
function updateContactSelectionState(id, checkbox, listItem, isSelected) {
    const iconChecked = listItem.querySelector(".form__contact-checkbox-icon-checked");
    const iconUnchecked = listItem.querySelector(".form__contact-checkbox-icon-unchecked");
    iconChecked.classList.toggle("d_none", !isSelected);
    iconUnchecked.classList.toggle("d_none", isSelected);
    if (isSelected) {
        highlightContact(checkbox);
        const contact = firebaseContacts.find((c) => c && c.id == id);
        if (contact && !assignedContacts.some((ac) => ac.id == id)) {assignedContacts.push(contact);}
    } else {
        unhighlightContact(checkbox);
        assignedContacts = assignedContacts.filter((contact) => contact.id != id);
    }
    renderContactBadges();
}


/**
 * This function handles the entire display of the badges.
 * Redraws all badges of the assigned contacts.
 * Displays a maximum of 3 badges and summarizes the rest in a "+X" badge.
 */
function renderContactBadges() {
    const container = document.getElementById("contact-badges");
    if (!container) {console.error("Badge container with ID 'contact-badges' was not found."); return;}
    container.innerHTML = "";
    const maxVisibleBadges = 5;
    const totalContacts = assignedContacts.length;
    for (let i = 0; i < Math.min(totalContacts, maxVisibleBadges); i++) {
        const contact = assignedContacts[i];
        container.innerHTML += getSelectedContactBadge(contact);
    }
    if (totalContacts > maxVisibleBadges) {
        const remainingCount = totalContacts - maxVisibleBadges;
        container.innerHTML += `<div class="form__contact-badge more-badge">+${remainingCount}</div>`;
    }
}


/**
 * Function to visually highlight a selected contact.
 * Adds a CSS class to the parent element of the given checkbox to indicate the selected state.
 * @param {HTMLElement} checkbox - The checkbox element for the contact.
 */
function highlightContact(checkbox) {
    if (checkbox) {
        checkbox.parentElement.classList.add("form__contact-checkbox--checked");
    }
}


/**
 * Function to remove the visual highlight from a deselected contact.
 * Removes the CSS class from the parent element of the given checkbox to indicate the unselected state.
 * @param {HTMLElement} checkbox - The checkbox element for the contact.
 */
function unhighlightContact(checkbox) {
    if (checkbox) {
        checkbox.parentElement.classList.remove("form__contact-checkbox--checked");
    }
}


/**
 * Function to add a subtask when the "Enter" key is pressed inside the input field.
 * It prevents default behavior to avoid form submission when the key is pressed down.
 * @param {KeyboardEvent} event - The keyboard event triggered by the key press.
 */
function handleEnterToAddSubtask(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask();
    }
}


/**
 * Function to save an edited subtask when the "Enter" key is pressed inside the input field in edit-mode.
 * It prevents default behavior to avoid form submission when the key is pressed down.
 * @param {KeyboardEvent} event - The keyboard event triggered by the key press.
 * @param {number} id - The ID of the subtask being edited.
 */
function handleEnterToSaveEditedSubtask(event, id) {
    if (event.key === "Enter") {
        event.preventDefault();
        saveSubtask(id);
    }
}


/**
 * Function to convert an HTML string into a real DOM element.
 * Creates a <template> element to parse the string,
 * then returns the first element inside it. Useful when dynamic
 * HTML needs to be inserted into the DOM as a real node.
 * @param {string} htmlString - The HTML string to convert.
 * @returns {HTMLElement} - The resulting DOM element.
 */
function convertHtmlStringToDomElement(htmlString) {
    const template = document.createElement("template");
    template.innerHTML = htmlString.trim();
    return template.content.firstElementChild;
}


/**
 * Function to increment the current number of subtasks by one.
 * Should be called whenever a new subtask is added to keep the subtask count in sync.
 */
function increaseSubtaskCount() {
    subtaskCount++;
}


/**
 * Function to decrease the subtask count by one, but not below zero.
 */
function decreaseSubtaskCount() {
    if (subtaskCount > 0) {
        subtaskCount--;
    }
}


/**
 * Function to increment the subtask ID counter by one.
 * Ensures that each new subtask gets a unique identifier.
 * Should be called after creating a new subtask.
 */
function increaseSubtaskIdCount() {
    subtaskIdCount++;
}


/**
 * Function to collect all assigned contact IDs.
 * The array will be returned to the calling function.
 * @returns {Array<string>} - An array of selected contact IDs.
 */
function getSelectedContactIds() {
    return assignedContacts.map((contact) => contact.id);
}


/**
 * Function to collect all created subtasks from below the subtask input field.
 * The array will be returned to the calling function.
 * @returns {Array<Object>} - An array of subtask objects, each containing a title and done status.
 */
function getSubtasks() {
    const listItems = document.querySelectorAll("#subtask-list .form__subtask-item");
    const subtasks = [];
    listItems.forEach((subtask) => {
        const title = subtask.dataset.text?.trim();
        const done = false;
        if (title) {
            subtasks.push({title, done});
        }
    });
    return subtasks;
}


/**
 * Function to convert the selected category name into the database format.
 * Example: Technical Task -> technical-task
 * It uses a regular expression to convert the string.
 * @param {string} category - The category name to convert.
 * @returns {string} - The converted category name in database format.
 */
function convertCategoryTextToDbFormat(category) {
    return category.toLowerCase().replace(/\s+/g, "-");
}


/**
 * Function to get the last Firebase task ID from the provided data.
 * The ID is needed to generate the next higher ID for creating a new task.
 * If there is no task in the DB or something is invalid, the function returns "-1".
 * @param {Object} data - The Firebase data object containing tasks.
 * @returns {string} - The last task ID as a string, or "-1" if not found.
 */
function getLastFirebaseTaskId(data) {
    if (!data || typeof data !== "object") {
        return "-1";
    }
    const numericKeys = Object.keys(data)
        .map((key) => parseInt(key, 10))
        .filter((id) => !isNaN(id));
    if (numericKeys.length === 0) {
        return "-1";
    }
    const maxId = Math.max(...numericKeys);
    return maxId.toString();
}


/**
 * Function to deselect all contacts in the dropdown list.
 * Resets each contact's checkbox state, removes visual highlighting, and switches the checkbox icons back to unchecked.
 */
function uncheckAllContacts() {
    const contactItems = document.querySelectorAll(".form__contact");
    contactItems.forEach((item) => {
        const checkbox = item.querySelector(".form__contact-checkbox");
        const iconChecked = item.querySelector(".form__contact-checkbox-icon-checked");
        const iconUnchecked = item.querySelector(".form__contact-checkbox-icon-unchecked");
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            item.classList.remove("form__contact-checkbox--checked");
            iconChecked.classList.add("d_none");
            iconUnchecked.classList.remove("d_none");
        }
    });
    assignedContacts = [];
    renderContactBadges();
}


/**
 * Function to set the default priority button.
 */
function setDefaultTaskPriority() {
    const defaultPriority = "medium";
    resetPriorityButtons();
    setPriority(defaultPriority);
}


/**
 * Function to reset all priority buttons to their default state.
 * Removes any applied priority-specific modifier classes from each button.
 */
function resetPriorityButtons() {
    const buttons = document.querySelectorAll(".form__button-prio");
    buttons.forEach((button) => {
        priorities.forEach((prio) => {
            button.classList.remove(`form__button-prio--${prio}`);
        });
    });
}


/**
 * Function to remove all contact badges below the assigned-to field.
 * Clears the inner HTML of the badge container.
 */
function removeAllContactBadges() {
    let contactBadgesRef = document.getElementById("contact-badges");
    contactBadgesRef.innerHTML = "";
    assignedContacts = [];
}


/**
 * Function to reset the subtask count and the subtask ID counter to zero.
 * Used to clear or reinitialize the form to ensure all counters are set to default.
 */
function resetAllCounters() {
    subtaskCount = 0;
    subtaskIdCount = 0;
}


/**
 * Function to remove all subtasks from the subtask list in the DOM.
 */
function deleteAllSubtasks() {
    let subtasks = document.getElementById("subtask-list");
    subtasks.innerHTML = "";
}


/**
 * Function to fetch specific data from the server based on the chosen path.
 * @param {string} path - The path to the specific data in the Firebase database.
 * @returns {Promise<Object|null>} - A promise that resolves to the fetched data or null if not found.
 */
async function getDataFromServer(path) {
    try {
        let response = await fetch(FIREBASE_URL + path + ".json");
        if (response.ok) {
            return await response.json();
        } else {
            console.error("Could not fetch data from:", path);
            return null;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}


/**
 * Function to get task data for a specific status.
 * It returns a structured task object.
 * @param {string} status - The status of the task (e.g., "todo", "in-progress", "done").
 * @returns {Promise<Object>} - A promise that resolves to the task data object.
 */
async function getTaskData(status) {
    const inputs = collectFormInputs();
    const processedData = processFormData(inputs);
    try {
        const id = await generateTaskId();
        return {
            title: processedData.title,
            description: processedData.description,
            date: processedData.date,
            category: processedData.category,
            priority: processedData.priority,
            assignedTo: processedData.assignedTo,
            subtask: processedData.subtask,
            status: status,
            id: id,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


/**
 * Function to collect form input values from the DOM elements.
 * @returns {Object} - An object containing the collected form inputs.
 */
function collectFormInputs() {
    return {
        title: document.getElementById("task-title").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: document.getElementById("task-due-date").value,
        category: document.getElementById("category-input").value,
        priority: choosenPriority,
        rawAssignedTo: getSelectedContactIds(),
        rawSubtasks: getSubtasks(),
    };
}


/**
 * Function to preprocess raw form data.
 * It converts the selected category to the team's internal defined format.
 * It makes sure that empty arrays have a default text -> "_empty".
 * The Firebase DB does not save empty arrays for some reason.
 * It uses ternary operators to keep the function size small.
 * Uses the object spread operator (...inputs) to include all input fields and overrides specific keys with normalized values.
 * @param {Object} inputs - The raw form data collected from the input fields.
 * @returns {Object} - An object containing the processed form data with normalized values.
 */
function processFormData(inputs) {
    const categoryRaw = inputs.category ? convertCategoryTextToDbFormat(inputs.category) : "no category";
    const assignedTo = Array.isArray(inputs.rawAssignedTo) && inputs.rawAssignedTo.length > 0 ? inputs.rawAssignedTo : ["_empty"];
    const subtask = Array.isArray(inputs.rawSubtasks) && inputs.rawSubtasks.length > 0 ? inputs.rawSubtasks : ["_empty"];
    return {
        ...inputs,
        category: categoryRaw,
        assignedTo,
        subtask,
    };
}


/**
 * Function to generate the next available Task ID.
 * It checks the ID of the last added task and takes the next higher ID.
 * If there is no task so far, it will start with id -> 0.
 * @returns {Promise<string>} - A promise that resolves to the new task ID as a string.
 */
async function generateTaskId() {
    const data = await getDataFromServer("/join/tasks");
    const lastId = getLastFirebaseTaskId(data);
    const numericId = parseInt(lastId, 10);
    const newId = isNaN(numericId) ? "0" : (numericId + 1).toString();
    if (!newId) {
        throw new Error("newId could not be identified!");
    }
    return newId;
}


/**
 * Function to handle an unsuccessfully added task -> error.
 * It logs a message to the console so far.
 * The next step will be to implement some visible user feedback.
 * @param {Error} error - The error object containing error details.
 */
function handleTaskCreationError(error) {
    console.error("Error adding the task:", error.message);
}