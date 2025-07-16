// Global variables
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";
let contactsFirebase = [];
const priorities = ['urgent', 'medium', 'low'];
let currentOpenDropdown = null;
let subtaskCount = 0;
let subtaskIdCount = 0;


// Figma color palette for test purposes
const figmaColors = {
    color1: "#FF7A00",
    color2: "#FFE62B",
    color3: "#4C4AC3",
    color4: "#c3624a",
    color5: "#00BCD4",
    color6: "#FF5EB3",
    color7: "#6E52FF",
    color8: "#9327FF",
    color9: "#00BEE8",
    color10: "#1FD7C1",
    color11: "#FF745E",
    color12: "#FFA35E",
    color13: "#FC71FF",
    color14: "#FFC701",
    color15: "#0038FF"
};


// Test array for rendering categories
const categories = [
    "technical-task",
    "user-story"
];


// Example dataset for tasks
let tasks = [
    {
        "id": 0,
        "title": "Task 1",
        "description": "Beschreibung 1",
        "date": "2025-06-25",
        "category": "User Story",
        "priority": "medium",
        "assignedTo": [0,2,3],
        "subtask": [
            {
                "title": "Zahlen aktualisieren",
                "done": false
            },
            {
                "title": "CI-Folien integrieren",
                "done": true
            }
        ],
        "status": "to-do" // "to-do", "in progress", "await feedback", "done"
    },
    {
        "id": 1,
        "title": "Task 2",
        "description": "Beschreibung 2",
        "date": "2025-06-25",
        "category": "Technical Task",
        "priority": "urgent",
        "assignedTo": [0,4,5],
        "subtask": [
            {
                "title": "Zahlen aktualisieren",
                "done": false
            },
            {
                "title": "CI-Folien integrieren",
                "done": true
            }
        ],
        "status": "to-do" // "to-do", "in progress", "await feedback", "done"
    }
]


/** 
 * Function to add a task to the Firebase Realtime Database.
 * Comig soon...
 */
function addTaskToDB(taskObject, status) {
    console.log("Add task to firebase realtime DB");
    // Dieser Funktion einen Parameter übergeben, der definiert, in welchem Status die Aufgabe abgespeichert werden soll...
    // Wichtig für Mechthild -> Board -> Plus Icons oberhalb der Spalten -> onclick die Parameter mitgeben.
    // Per Default werden Tasks im Satus "to do" gespeichert.
}


/** 
 * Function to initialize the Add Task page.
 */
function initAddTask() {
    setDefaultTaskPriority();
    loadContactsFromFirebase();
    // populateContactsToDropdown();
    populateCategoriesToDropdown();
}


/** 
 * Function to populate the contacts to the assignee dropdown list.
 * This function will finally interact with data from the Firebase DB. (coming soon..)
 * At the moment this function is using a local test array.
 */
function populateContactsToDropdown(contacts) {
    let contactsRef = document.getElementById("contact-list-ul");
    contactsRef.innerHTML = "";
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
 * Function to set the default priority button. 
 */
function setDefaultTaskPriority() {
    const defaultPriority = 'medium';
    resetPriorityButtons();
    setPriority(defaultPriority);
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
 * Function to remove all contact badges below the assigned-to field.
 * Clears the inner HTML of the badge container.
 */
function removeAllContactBadges() {
    let contactBadgesRef = document.getElementById("contact-badges");
    contactBadgesRef.innerHTML = "";
}


/**
 * Function to add a new subtask to the list based on user input.
 * Reads the value from the subtask input field. If the input is not empty,
 * it generates a new subtask element using a template, appends it to the subtask list,
 * clears the input field, and updates the subtask counters.
 */
function addSubtask() {
    let inputField = document.getElementById("task-subtask-input");
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
 * Function to reset the task form to its initial state.
 * Unchecks all selected contacts.
 * Resets the priority state of all buttons.
 * Sets the default task priority.
 * Removes all contact badges below the assigned to field.
 * Resets internal subtask counters.
 * Deletes all existing subtasks from the DOM.
 */
function clearForm() {  
    uncheckAllContacts();
    resetPriorityButtons();
    setDefaultTaskPriority();
    removeAllContactBadges();
    resetAllCounters();
    deleteAllSubtasks();
}


/**
 * Function to uncheck all selected contacts in the dropdown list.
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
 * Function to extract contact information from dataset attributes.
 * Actually only for testing purposes
 */
function getDatasetInfos() {
    const items = document.querySelectorAll('.form__contact');
    const contacts = [];
    items.forEach(item => {
        const contact = {
            id: parseInt(item.dataset.id, 10),
            shortname: item.dataset.shortname,
            fullname: item.dataset.fullname,
            color: item.dataset.color,
            selected: item.querySelector('.form__contact-checkbox')?.checked || false
        };
        contacts.push(contact);
    });
    console.log(contacts);
    return contacts;
}