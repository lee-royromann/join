// Global variables
const priorities = ['urgent', 'medium', 'low'];
let currentOpenDropdown = null;


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


// Test array for rendering contacts
const contacts = [
    {
        id: 0,
        prename: 'alice',
        surname: 'wonderland',
        email: 'alice.wonderland@example.com',
        phone: '+41319876543',
        mobile: '+41769876543',
        color: '#FF7A00'
    },
    {
        id: 1,
        prename: 'john',
        surname: 'doe',
        email: 'john.doe@example.com',
        phone: '+41311234567',
        mobile: '+41761234567',
        color: '#FFE62B'
    },
    {
        id: 2,
        prename: 'danny',
        surname: 'mensing',
        email: 'danny.mensing@example.com',
        phone: '+41312345678',
        mobile: '+41762345678',
        color: '#c3624a'
    },
    {
        id: 3,
        prename: 'lee-roy',
        surname: 'romann',
        email: 'lee-roy.romann@example.com',
        phone: '+41314567890',
        mobile: '+41764567890',
        color: '#00BCD4'
    },
    {
        id: 4,
        prename: 'mechthild',
        surname: 'rölfing',
        email: 'mechthild.roelfing@example.com',
        phone: '+41312345678',
        mobile: '+41762345678',
        color: '#FF5EB3'
    },
    {
        id: 5,
        prename: 'philipp',
        surname: 'novak',
        email: 'philipp.novak@example.com',
        phone: '+41311223344',
        mobile: '+41761223344',
        color: '#1FD7C1'
    },
    {
        id: 6,
        prename: 'satoshi',
        surname: 'nakamoto',
        email: 'satoshi.nakamoto@example.com',
        phone: '+41310987654',
        mobile: '+41760987654',
        color: '#FFA35E'
    },
];


// Test array for rendering categories
const categories = [
    "technical-task",
    "user-story",
    "foo"
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
        "status": "in progress" // "to-do", "in progress", "await feedback", "done"
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
        "status": "await feedback" // "to-do", "in progress", "await feedback", "done"
    }
]


/** 
 * Function to initialize the Add Task page.
 */
function initAddTask() {
    setDefaultTaskPriority();
    populateContactsToDropdown();
    populateCategoriesToDropdown();
}


/** 
 * Function to populate the contacts to the assignee dropdown list.
 * This function will finally interact with data from the Firebase DB. (coming soon..)
 * At the moment this function is using a local test array.
 */
function populateContactsToDropdown() {
    console.log("Populating contacts...");
    let contactsRef = document.getElementById("contact-list-ul");
    contactsRef.innerHTML = "";
    for (let index = 0; index < contacts.length; index++) {
        const contact = contacts[index];
        let contactTemplate = renderContactListItems(contact);
        contactsRef.innerHTML += contactTemplate;
    }
}

/** 
 * Function to populate the categories to the category dropdown list.
 * This function will finally interact with data from the Firebase DB. (coming soon..)
 * At the moment this function is using a local test array.
 */
function populateCategoriesToDropdown() {
    console.log("Populating categories...");
    let categoriesRef = document.getElementById("category-list-ul");
    categoriesRef.innerHTML = "";
    for (let index = 0; index < categories.length; index++) {
        const category = categories[index];
        let categoryTemplate = renderCategoryListItem(index, category);
        categoriesRef.innerHTML += categoryTemplate;
    }
};


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
    resetSearchFilter(listSelector);
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
    for (let index = 0; index < contacts.length; index++) {
        const contact = contacts[index];
        if (contact.id == id) {
            let contactBadgeTemplate = renderSelectedContactBadge(contact);
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
 * Function to add a new task. 
 */
function addSubtask() {
    console.log("Adding subtask...");
}


/**
 * Function to reset the task form to its initial state.
 * Unchecks all selected contacts.
 * Resets the priority state of all buttons.
 * Sets the default task priority.
 */
function clearForm() {  
    uncheckAllContacts();
    resetPriorityButtons();
    setDefaultTaskPriority();
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



// korrigiertes Dataset - jedes Task ein Objekt nicht Array
//  "tasks": {
//       "0": {
//         "title": "Task 1",
//         "description": "Beschreibung 1",
//         "date": "2025-06-25",
//         "category": "User Story",
//         "priority": "medium",
//         "assignedTo": [0, 2, 3],
//         "subtask": [
//           {
//             "title": "Zahlen aktualisieren",
//             "done": false
//           },
//           {
//             "title": "CI-Folien integrieren",
//             "done": true
//           }
//         ],
//         "status": "in progress"
//       },
//       "1": {
//         "title": "Task 2",
//         "description": "Beschreibung 2",
//         "date": "2025-06-25",
//         "category": "Technical Task",
//         "priority": "urgent",
//         "assignedTo": [0],
//         "subtask": [
//           {
//             "title": "Zahlen aktualisieren",
//             "done": false
//           },
//           {
//             "title": "CI-Folien integrieren",
//             "done": true
//           }
//         ],
//         "status": "await feedback"
//       }
//     }