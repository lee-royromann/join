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
 * Function to prevent a form submission by pressing the enter key
 * It adds a eventlistener to every inputfield by a keydown event (enter) it prevents the default behavior
 * @param {string} formId 
 * @returns 
 */
function preventFormSubmitOnEnter(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const inputs = form.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });
    }
}


/**
 * Function to get the username initials for the header logo
 * It's going to load the username from the local storage.
 * If it's a guest login it going to display "G" by default, if user is logged in it splits the fullname into first- and surname.
 * After that it's going to grab the first letter of each name. Finally it puts them together and writes it in the element.
 * @returns {void}
 */
function getUsernameInitals() {
    const element = document.getElementById('header__user');
    const username = localStorage.getItem('username');
    if (!username || username === "Guest") {
        element.innerHTML = "G";
        return;
    }
    const nameParts = username.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) {
        element.innerHTML = "G";
        return;
    }
    let initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    element.innerHTML = initials;
}


/**
 * Function to initialize the Flatpickr date picker.
 * It sets up the date picker with specific options such as locale, date format,
 * disabling mobile view, setting minimum date to today, and allowing input.
 * It assigns the Flatpickr instance to a global variable for later use.
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
 * It stops the event propagation to prevent any unwanted bubbling effects.
 * If the Flatpickr instance is initialized, it opens the calendar and focuses the input field.
 * This function is typically called when a user clicks on a date picker icon or the date input field.
 * @param {Event} event - The event object representing the click event.
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
 * It iterates through the contacts and appends each user to the dropdown list.
 * If the contact's full name matches the currently logged-in user, a "(You)" label will be added to the logged in user.
 * This function is called after loading the contacts from Firebase.
 * It uses a helper function to move the logged-in user to the top of the list.
 * Each contact object should have properties like 'prename', 'surname', and 'id'.
 * The function generates HTML list items for each contact and appends them to the dropdown.
 * @param {Array} contacts - An array of contact objects to be displayed in the dropdown.
 */
function populateContactsToDropdown(contacts) {
    const contactsRef = document.getElementById("contact-list-ul");
    contactsRef.innerHTML = "";
    const loggedInUser = localStorage.username;
    const sortedContacts = moveLoggedInUserToTop(contacts, loggedInUser);
    for (let i = 0; i < sortedContacts.length; i++) {
        const contact = sortedContacts[i];
        const isLoggedIn = `${contact.prename} ${contact.surname}` === loggedInUser;
        const contactTemplate = getContactListItem(contact, isLoggedIn ? "(You)" : "");
        contactsRef.innerHTML += contactTemplate;
    }
}


/**
 * Function to move the logged-in user to the top of the contacts array.
 * It searches through the contact list for a contact match (pre- & fullname)
 * If no logged-in contact is found, it does nothing and returns the original array.
 * If logged-in user found and not at index 0, it moves the contact to the beginning of the array and returns reordered array.
 * @param {Array} contacts - The array of contact objects.
 * @param {string} loggedInUser - The full name of the logged-in user.
 * @returns {Array} - The reordered array with the logged-in user at the top.
 */
function moveLoggedInUserToTop(contacts, loggedInUser) {
    let index = -1;
    for (let i = 0; i < contacts.length; i++) {
        let fullName = contacts[i].prename + " " + contacts[i].surname;
        if (fullName === loggedInUser) {
            index = i;
            break;
        }
    }
    if (index <= 0) {
        return contacts;
    }
    let reordered = [];
    reordered.push(contacts[index]);
    for (let i = 0; i < contacts.length; i++) {
        if (i !== index) {
            reordered.push(contacts[i]);
        }
    }
    return reordered;
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
 * Function to sort the contacts by their prenames
 * It filters out invalid entries first, ensuring that only valid contact objects are processed.
 * Valid contacts are defined as objects that are not null.
 * It then sorts the valid contacts by their 'prename' property in a case-insensitive manner.
 * This function uses the `localeCompare` method to ensure proper sorting according to the German locale.
 * @param {Array} contacts - The array of contact objects.
 * @returns {Array} - The sorted array of contact objects.
 */
function sortContactsByPrename(contacts) {
    const validContacts = contacts.filter(contact => contact && typeof contact === 'object');
    return validContacts.sort((a, b) => {
        const prenameA = a.prename?.toLowerCase() || '';
        const prenameB = b.prename?.toLowerCase() || '';
        return prenameA.localeCompare(prenameB, 'de');
    });
}


/**
 * Function to stop event propagation.
 * This is useful to prevent events from bubbling up the DOM tree.
 * @param {Event} event - The event object to stop propagation for.
 */
function stopEventPropagation(event) {
    event.stopPropagation();
}


/**
 * Function to show an element by its ID.
 * @param {string} id - The ID of the element to show.
 */
function showElement(id) {
    let element = document.getElementById(id);
    element.classList.remove('d_none');
}


/**
 * Function to hide an element by its ID.
 * @param {string} id - The ID of the element to hide.
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
 * @param {string} listSelector - The CSS selector for the list items to be reset.
 */
function resetSearchFilter(listSelector) {
    document.querySelectorAll(listSelector).forEach(item => {
        item.style.display = 'flex';
    });
}


/**
 * Function to rotate the arrow icon in one of the dropdown-fields.
 * It's going to toggle a specific css-class which rotates the icon.
 * @param {string} arrowIconId - The ID of the arrow icon to rotate.
 */
function rotateArrowIcon(arrowIconId) {
    const arrowIcon = document.getElementById(arrowIconId);
    arrowIcon.classList.toggle('arrow-icon-rotated');
}


/**
 * Function to toggle the visibility of a dropdown menu and rotate its arrow icon.
 * If another dropdown is currently open, it will be closed before opening the new one.
 * Keeps track of the currently open dropdown to ensure only one is open at a time.
 * @param {Event} event - The event object from the click event.
 * @param {string} dropdownId - The ID of the dropdown menu to toggle.
 * @param {string} arrowIconId - The ID of the arrow icon to rotate.
 */
function toggleDropdown(event, dropdownId, arrowIconId) {
    event.stopPropagation();
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
 * Function to filter dropdown list items based on user input.
 * Compares the lowercase search value with the text content of each list item and toggles their visibility accordingly.
 * @param {string} inputId - The ID of the input element.
 * @param {string} listSelector - The selector for the list items to filter.
 */
function filterDropdown(inputId, listSelector) {
    const value = document.getElementById(inputId).value.toLowerCase();
    document.querySelectorAll(listSelector).forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(value) ? 'flex' : 'none';
    });
}


/**
 * Function to handle changes in the subtask input field.
 * It checks if the input value is empty or not.
 * If the input is empty, it shows the plus icon and hides the action icons.
 * If the input has a value, it hides the plus icon and shows the action icons.
 * This function is typically called when the user types in the subtask input field to provide visual feedback.
 */
function handleSubtaskInputChange() {
    const subtaskInput = document.getElementById('subtask-input');
    const plusIconContainer = document.getElementById('task-subtask-icons-1');
    const actionIconsContainer = document.getElementById('task-subtask-icons-2'); 
    if (subtaskInput.value.trim() === '') {
        plusIconContainer.classList.remove('d_none');
        actionIconsContainer.classList.add('d_none');
    } else {
        plusIconContainer.classList.add('d_none');
        actionIconsContainer.classList.remove('d_none');
    }
}


/**
 * Event listener to handle input changes in the subtask input field.
 * It listens for both 'input' and 'keyup' events to ensure the icons are updated in real-time.
 * This function is called when the DOM content is fully loaded to set up the initial state.
 */
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('subtask-input')) return;
    const subtaskInput = document.getElementById('subtask-input');
    subtaskInput.addEventListener('input', handleSubtaskInputChange);
    subtaskInput.addEventListener('keyup', handleSubtaskInputChange);
    handleSubtaskInputChange();
});


/**
 * Function to clear the subtask input field and reset the subtask icons.
 * It sets the input value to an empty string, hides the plus icon container,
 * shows the action icons container, and focuses the input field for immediate user interaction.
 * This function is typically called after a subtask is added or when the user wants to clear the input.
 */
function clearSubtaskInput() {
    const subtaskInput = document.getElementById('subtask-input');
    subtaskInput.value = '';
    const plusIconContainer = document.getElementById('task-subtask-icons-1');
    const actionIconsContainer = document.getElementById('task-subtask-icons-2');
    plusIconContainer.classList.remove('d_none');
    actionIconsContainer.classList.add('d_none');
    subtaskInput.focus();
}


/**
 * Function to validate the task form inputs.
 * It checks if the required fields (title, due date, category) are filled out.
 * It highlights the required fields with a red frame and shows a hint if they are empty.
 * It returns an object containing the validation results for each field.
 * @returns {Object} - An object containing validation results for title, due date, and category.
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
 * @param {string} value
 * @returns {boolean}
 */
function isFieldValid(value) {
    return value && value.trim() !== "";
}


/**
 * Function to highlight required fields based on their validity.
 * @param {string} inputId
 * @param {string} value
 * @returns {boolean}
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
 * Function to remove all validation hint elements and input highlight frames within the form.
 */
function clearHighlightetRequiredFields() {
    const inputs = document.querySelectorAll('.required-frame');
    inputs.forEach(input => input.classList.remove('required-frame'));

    const hints = document.querySelectorAll('.required-hint');
    hints.forEach(hint => hint.classList.add('d_none'));
}


/**
 * Function to return trimmed values of required input fields.
 * @returns {Object} - An object containing the trimmed values of title, due date, and category.
 */
function getRequiredInputfieldValues() {
    const title = document.getElementById("task-title").value.trim();
    const dueDate = document.getElementById("task-due-date").value.trim();
    const category = document.getElementById("category-input").value.trim();
    return { title, dueDate, category };
}


/**
 * Function to reset the taskform to its initial state.
 * Unchecks all selected contacts, resets the priority state of all buttons.
 * Sets the default task priority and removes all contact badges below the assigned to field.
 * Resets internal subtask counters and deletes all existing subtasks from the DOM.
 */
function clearForm() {
    const form = document.getElementById('form-add-task');
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