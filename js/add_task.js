// Global variables
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";
let contactsFirebase = [];
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
 * Function (eventlistener) to wait, till the hole DOM content is loaded before calling init function.
 */
document.addEventListener('DOMContentLoaded', () => {
    initAddTask();
});


/** 
 * Function to initialize the Add Task page.
 */
function initAddTask() {
    initFlatpickr();
    setDefaultTaskPriority();
    loadContactsFromFirebase();
    populateCategoriesToDropdown();
}


/**
 * Function to initialize the Flatpickr instance for the due date input field.
 * This setup includes localization, date formatting, and ISO output handling.
 * This code snippet I found on https://flatpickr.js.org/
 */
function initFlatpickr() {
    const input = document.getElementById('task-due-date');
    flatpickrInstance = flatpickr(input, {
        locale: 'de',
        dateFormat: 'd.m.Y',
        disableMobile: true,
        minDate: 'today',
        allowInput: true
    });
}


/**
 * Function to open the Flatpickr calendar when triggered via icon or inputfield
 */
function pickDate(event) {
    stopEventPropagation(event);
    if (flatpickrInstance) {
        flatpickrInstance.open();
        flatpickrInstance.input.focus();
    }
}


/** 
 * Function to populate the contacts to the assignee dropdown list.
 * This function will finally interact with data from the Firebase DB. (coming soon..)
 * At the moment this function is using a local test array.
 */
function populateContactsToDropdown(contacts) {
    let contactsRef = document.getElementById("contact-list-ul");
    contactsRef.innerHTML = "";
    
    // Check if logged in or guest -> add (You)

    for (let index = 0; index < contacts.length; index++) {
        const contact = contacts[index];
        let contactTemplate = getContactListItem(contact);
        contactsRef.innerHTML += contactTemplate;
    }
}


/** 
 * Function to populate the categories to the category dropdown list.
 * This function will finally interact with data from the Firebase DB. (coming soon..)
 * At the moment this function is using a local test array.
 */
function populateCategoriesToDropdown() {
    let categoriesRef = document.getElementById("category-list-ul");
    categoriesRef.innerHTML = "";
    for (let index = 0; index < categories.length; index++) {
        const category = categories[index];
        let categoryTemplate = getCategoryListItem(index, category);
        categoriesRef.innerHTML += categoryTemplate;
    }
};


/**
 * This function is loading the contacts from Firebase.
 * After loading is finished, the contacts are getting populated to the dropdown.
 */
async function loadContactsFromFirebase() {
  let response = await fetch(BASE_URL + "/join/contacts.json");
  if (response.ok) {
    let data = await response.json();
    contactsFirebase = Object.values(data || {});
    populateContactsToDropdown(contactsFirebase);
  } else {
    contactsFirebase = [];
  }
}


/** 
 * Function to avoid the unwant bubbling effect 
 */
function stopEventPropagation(event) {
    event.stopPropagation();
}


/**
 * Function to close the dropdown when clicking outside of it.
 * This function checks if the clicked element is outside the currently open dropdown.
 * If it is, it closes the dropdown and resets the currentOpenDropdown variable.
 * If no dropdown is open, it does nothing.
 * This prevents the dropdown from remaining open when clicking outside of it.
 * It also checks if the clicked element is not a part of the form input to avoid closing it when interacting with the form.
 */
document.addEventListener('click', function (event) {
    if (currentOpenDropdown) {
        const { dropdown, arrow } = currentOpenDropdown;
        if (!dropdown.contains(event.target) && !arrow.contains(event.target) && !event.target.closest('.form__input')) {
            dropdown.classList.add('d_none');
            arrow.classList.remove('arrow-icon-rotated');
            currentOpenDropdown = null;
            emptySearchField("contact-search", "#contact-list .form__contact")
        }
    }
});


/**
 * Function to set the selected task priority.
 * Resets all priority buttons and applies the specifically choosen priority css class to it.
 */
function setPriority(priority) {
    resetPriorityButtons();
    let button = document.getElementById(`btn-${priority}`);
    button.classList.add(`form__button-prio--${priority}`);
    choosenPriority = priority;    
}


/**
 * Function to show an element by its ID.
 */
function showElement(id) {
    let element = document.getElementById(id);
    element.classList.remove('d_none');
}


/** 
 * Function to hide an element by its ID.
 */
function hideElement(id) {
    let element = document.getElementById(id);
    element.classList.add('d_none');
}


/**
 * Function to empty the search field and reset the search filter.
 * @param {string} id - The ID of the input field to be emptied.
 * @param {string} listSelector - The CSS selector for the list items to be reset.
 */
function emptySearchField(id, listSelector) {
    const inputField = document.getElementById(id);
    inputField.value = "";
    if (listSelector) {
        resetSearchFilter(listSelector);
    }
}


/** 
 * Function to reset the filtered view.
 * It is going to display all choosable items. 
 */
function resetSearchFilter(listSelector) {
    document.querySelectorAll(listSelector).forEach(item => {
        item.style.display = 'flex';
    });
}


/** 
 * Function to rotate the arrow icon in on of the dropdown-fields.
 * It's going to toggle a specific css-class which rotates the icon.
 */
function rotateArrowIcon(arrowIconId) {
    const arrowIcon = document.getElementById(arrowIconId);
    arrowIcon.classList.toggle('arrow-icon-rotated');
}


/**
 * Function to toggle the visibility of a dropdown menu and rotate its arrow icon.
 * If another dropdown is currently open, it will be closed before opening the new one.
 * Keeps track of the currently open dropdown to ensure only one is open at a time.
 */
function toggleDropdown(event, dropdownId, arrowIconId) {
    stopEventPropagation(event);
    const dropdown = document.getElementById(dropdownId);
    const arrow = document.getElementById(arrowIconId);
    const isOpen = !dropdown.classList.contains('d_none');
    if (isOpen) {
        hideElement(dropdownId);
        rotateArrowIcon(arrowIconId);
        currentOpenDropdown = null;
    } else {
        if (currentOpenDropdown) {
            currentOpenDropdown.dropdown.classList.add('d_none');
            currentOpenDropdown.arrow.classList.remove('arrow-icon-rotated');
        }
        showElement(dropdownId);
        rotateArrowIcon(arrowIconId);
        currentOpenDropdown = { dropdown, arrow };
    }
}


/**
 * Function to toggle the selection state of a contact.
 * Updates the checkbox -> switching the checked/unchecked icons.
 * Highlights or unhighlights the contact visually.
 * Adds or removes the corresponding badge.
 * Clears the search input after each selection change.
 */
function selectContact(id) {
    const checkbox = document.getElementById(`contact-checkbox-${id}`);
    const listItem = document.getElementById(`contact-id-${id}`);
    const iconChecked = listItem.querySelector('.form__contact-checkbox-icon-checked');
    const iconUnchecked = listItem.querySelector('.form__contact-checkbox-icon-unchecked');
    const isChecked = checkbox.checked = !checkbox.checked;
    if (isChecked) {
        iconChecked.classList.remove('d_none');
        iconUnchecked.classList.add('d_none');
        highlightContact(checkbox);
        displayBadgeOfSelectedContact(id);
    } else {
        iconChecked.classList.add('d_none');
        iconUnchecked.classList.remove('d_none');
        unhighlightContact(checkbox);
        deleteContactBadge(id);
    }
    emptySearchField('contact-search');
}


/**
 * Function to display the badge of a selected contact.
 * Appends the corresponding badge using the rendered template.
 */
function displayBadgeOfSelectedContact(id) {
    let contactBadgesRef = document.getElementById("contact-badges");
    for (let index = 0; index < contactsFirebase.length; index++) {
        const contact = contactsFirebase[index];
        if (contact == null) {
            continue;
        }
        if (contact.id == id) {
            let contactBadgeTemplate = getSelectedContactBadge(contact);
            contactBadgesRef.innerHTML += contactBadgeTemplate;
            return;
        }
    }
};


/**
 * Function to remove the badge of a deselected contact.
 * Searches for the badge element by contact ID and removes it from the DOM.
 * Logs a warning in the console if the badge element is not found.
 */
function deleteContactBadge(id) {
    const badge = document.getElementById(`contact-badge-${id}`);   
    if (badge) {
        badge.remove();
    } else {
        console.warn(`Badge mit ID contact-badge-${id} nicht gefunden.`);
    }
}


/**
 * Function to visually highlight a selected contact.
 * Adds a CSS class to the parent element of the given checkbox, to indicate the selected state.
 */
function highlightContact(checkbox) {
    if (checkbox) {
        checkbox.parentElement.classList.add('form__contact-checkbox--checked');
    }
}


/**
 * Function to remove the visual highlight from a deselected contact.
 * Removes the CSS class from the parent element of the given checkbox, to indicate the unselected state.
 */
function unhighlightContact(checkbox) {
    if (checkbox) {
        checkbox.parentElement.classList.remove('form__contact-checkbox--checked');
    }
}


/**
 * Function to filter dropdown list items based on user input.
 * Compares the lowercase search value with the text content of each list item and toggles their visibility accordingly.
 */
function filterDropdown(inputId, listSelector) {
    const value = document.getElementById(inputId).value.toLowerCase();
    document.querySelectorAll(listSelector).forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(value) ? 'flex' : 'none';
    });
}


/**
 * Function to select a category from the dropdown.
 * Sets the selected category value into the input field based on the clicked item.
 * Hides the dropdown menu after selection and resets the arrow icon rotation.
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
}


/**
 * Function to add a subtask when the "Enter" key is pressed inside the input field.
 * It prevents default behavior to avoid form submission, when key is pressed down.
 */
function handleEnterToAddSubtask(event) {   
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
};


/**
 * Function to change a subtask from display mode to edit mode.
 * It finds the subtask by its ID, reads the current text from the dataset,
 * generates the editable version using a template, and replaces 
 * the static view with an input-enabled version.
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
 */
function deleteSubtask(element, id) {
    const item = document.querySelector(`.form__subtask-item${element}[data-id="${id}"]`);
    if (item) item.remove();
    decreaseSubtaskCount();
}


/**
 * Funtcion to convert an HTML string into a real DOM element.
 * Creates a <template> element to parse the string,
 * then returns the first element inside it. Useful when dynamic
 * HTML needs to be inserted into the DOM as a real node.
 */
function convertHtmlStringToDomElement(htmlString) {
    const template = document.createElement('template');
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
 * Function to collect all assignes contact ID's and pushes them to the array.
 * The Array will be returned to the calling function.
*/
function getSelectedContactIds() {
    const contactBadges = document.querySelectorAll('#contact-badges .form__contact-badge');
    const contactIDs = [];
    contactBadges.forEach(badge => {
        const idString = badge.dataset.id;
        const id = parseInt(idString, 10);
        if (!isNaN(id)) {
            contactIDs.push(id);
        }
    });
    return contactIDs;
}


/**
 * Function to collect all created subtasks below the subtask inputfield.
 * The Array will be returned to the calling function.
 */
function getSubtasks() {
    const listItems = document.querySelectorAll('#subtask-list .form__subtask-item');
    const subtasks = [];
    listItems.forEach(subtask => {
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
 * It uses a regualar expression to convert the string.
 */
function convertCategoryTextToDbFormat(category) {
    return category.toLowerCase().replace(/\s+/g, '-');
};


/**
 * Function to indentify the highest task ID currently stored in the firebase DB.
 * The ID is needed to generate the next higher ID for creating a new task.
 * If there is no task in the DB or something is invalid, the function returns "-1".
 */
function getLastFirebaseTaskId(data) {
    if (!data || typeof data !== "object") {
        return "-1";
    }
    const numericKeys = Object.keys(data)
        .map(key => parseInt(key, 10))
        .filter(id => !isNaN(id));
    if (numericKeys.length === 0) {
        return "-1";
    }
    const maxId = Math.max(...numericKeys);
    return maxId.toString();
}


/**
 * Function to reset the taskform to its initial state.
 * Unchecks all selected contacts.
 * Resets the priority state of all buttons.
 * Sets the default task priority.
 * Removes all contact badges below the assigned to field.
 * Resets internal subtask counters.
 * Deletes all existing subtasks from the DOM.
 */
function clearForm() {
    const form = document.querySelector('form-add-task');
    uncheckAllContacts();
    resetPriorityButtons();
    setDefaultTaskPriority();
    removeAllContactBadges();
    resetAllCounters();
    deleteAllSubtasks();
    choosenPriority = "";
    clearHighlightetRequiredFields();
    if (form) {
        form.reset();
    }
}



/**
 * Function to selected all contacts in the dropdown list.
 * Resets each contact's checkbox state, removes visual highlighting, switches the checkbox icons back to the unchecked.
 */
function uncheckAllContacts() {
    const contactItems = document.querySelectorAll('.form__contact');
    contactItems.forEach((item) => {
        const checkbox = item.querySelector('.form__contact-checkbox');
        const iconChecked = item.querySelector('.form__contact-checkbox-icon-checked');
        const iconUnchecked = item.querySelector('.form__contact-checkbox-icon-unchecked');
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            item.classList.remove('form__contact-checkbox--checked');
            iconChecked.classList.add('d_none');
            iconUnchecked.classList.remove('d_none');
        }
    });
}


/**
 * Function to reset all priority buttons to their default state.
 * Removes any applied priority-specific modifier classes from each button.
 */
function resetPriorityButtons() {
    const buttons = document.querySelectorAll('.form__button-prio');
    buttons.forEach(button => {
        priorities.forEach(prio => {
            button.classList.remove(`form__button-prio--${prio}`);
        });
    });
}


/** 
 * Function to set the default priority button. 
 */
function setDefaultTaskPriority() {
    const defaultPriority = 'medium';
    resetPriorityButtons();
    setPriority(defaultPriority);
}


/**
 * Function to remove all contact badges below the assigned-to field.
 * Clears the inner HTML of the badge container.
 */
function removeAllContactBadges() {
    let contactBadgesRef = document.getElementById("contact-badges");
    contactBadgesRef.innerHTML = "";
}


/**
 * Function to reset the subtask count and the subtask ID counter to zero.
 * Used to clear or reinitialize the form to ensure all counter are set to default.
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
 * Function to fetch specific data from the server base by the choosen path.
 */
async function getDataFromServer(path) {
    try {
        let response = await fetch(BASE_URL + path + ".json");
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
 * Function to handle the event when the create task buttons gets clicked.
 * It validates the inputs and adds the task to DB if everything is valid.
 */
async function createTask(event, taskStatus) {
    event.preventDefault();
    const validation = validateFormData();
    if (!validation.isValid) {
        console.log("Form incomplete! Please fill out all required fields.");
        return;
    }
    try {
        const task = await getTaskData(taskStatus);
        await addTaskToDB(task);
        handleTaskCreationSuccess(task);
    } catch (error) {
        handleTaskCreationError(error);
    }
}


/**
 * Function to validate the task form inputs.
 * It returns true if valid or false when not.
 */
function validateFormData() {
    const fields = getRequiredInputfieldValues();
    const isTitelValid = highlightRequiredFields('task-title', fields.title);
    const isDueDateValid = highlightRequiredFields('task-due-date', fields.dueDate);
    const isCategoryValid = highlightRequiredFields('category-input', fields.category);
    const isValid = isTitelValid && isDueDateValid && isCategoryValid;
    return { isValid, isTitelValid, isDueDateValid, isCategoryValid };
}



/**
 * Function to validate if the input is empty after trimming.
 * It returns true when field input is not empty.
 */
function isFieldValid(value) {
    return value && value.trim() !== "";
}


/**
 * Adds or removes validation classes and hint visibility based on input validity.
 */
function highlightRequiredFields(inputId, value) {
    const input = document.getElementById(inputId);
    const fieldset = input.closest('fieldset');
    const hint = fieldset.querySelector('.required-hint');
    const isValid = isFieldValid(value);
    if (!isValid) {
        input.classList.add('required-frame');
        if (hint) hint.classList.remove('d_none');
    } else {
        input.classList.remove('required-frame');
        if (hint) hint.classList.add('d_none');
    }
    return isValid;
}


/**
 * Removes all validation hint elements and input highlight frames within the form.
 */
function clearHighlightetRequiredFields() {
    const inputs = document.querySelectorAll('.required-frame');
    inputs.forEach(input => input.classList.remove('required-frame'));

    const hints = document.querySelectorAll('.required-hint');
    hints.forEach(hint => hint.classList.add('d_none'));
}


/**
 * Function to return trimmed values of required input fields.
 */
function getRequiredInputfieldValues() {
    const title = document.getElementById("task-title").value.trim();
    const dueDate = document.getElementById("task-due-date").value.trim();
    const category = document.getElementById("category-input").value.trim();
    return { title, dueDate, category };
}


/**
 * Function to collect task form input data by calling helper functions.
 * It returns a structured task object.
 */
async function getTaskData(status) {
    const inputs = collectFormInputs();
    const processedData = processFormData(inputs);
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
        id: id
    };
}


/**
 * Function to collect form input values from the DOM elements.
 */
function collectFormInputs() {
    return {
        title: document.getElementById("task-title").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: document.getElementById("task-due-date").value,
        category: document.getElementById("category-input").value,
        priority: choosenPriority,
        rawAssignedTo: getSelectedContactIds(),
        rawSubtasks: getSubtasks()
    };
}


/**
 * Function to preprocess raw form data.
 * It converts the selected category to the team internal defined format.
 * It makes sure, that empty arrays have a defaul text -> _empty.
 * Firebase DB is not saving empty arrays for some reason.
 * Its using ternary operators to keep the function size small
 * Uses the object spread operator (...inputs) to include all input fields and overrides specific keys with normalized values.
 */
function processFormData(inputs) {
    const categoryRaw = inputs.category ? convertCategoryTextToDbFormat(inputs.category) : "no category";
    const assignedTo = Array.isArray(inputs.rawAssignedTo) && inputs.rawAssignedTo.length > 0 ? inputs.rawAssignedTo : ["_empty"];
    const subtask = Array.isArray(inputs.rawSubtasks) && inputs.rawSubtasks.length > 0 ? inputs.rawSubtasks : ["_empty"];
    return {
        ...inputs,
        category: categoryRaw,
        assignedTo,
        subtask
    };
}


/**
 * Function to generate the next available Task ID.
 * It checks the ID of the last added task and is taking the next higher id.
 * If there is no task so far, it will start with id -> 0.
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
 * Function to handle a successfully added task.
 * It logs messages to the console so far.
 * Next step will be to implement some visible user feedback.
 */
function handleTaskCreationSuccess(task) {
    console.log("Task created:", task);
    console.log("Added task to DB successfully!");
}


/**
 * Function to handle a unsuccessfully added task -> error.
 * It logs a message to the console so far.
 * Next step will be to implement some visible user feedback.
 */
function handleTaskCreationError(error) {
    console.error("Fehler beim Hinzufügen der Aufgabe:", error.message);
}


/**
 * Adds a task object to the Firebase Realtime Database.
 */
async function addTaskToDB(task) {
    try {
        const response = await fetch(`${BASE_URL}/join/tasks/${task.id}.json`, {
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
        console.log("Added task to DB successfully!");
        clearForm();
    } catch (error) {
        console.error("Failes to add the task to the Firebase DB:", error.message);
    }
}