// join/js/contacts_controllers.js

// it´s me Danny Focke 

// ===================================================================
// NOTE:
// This file has been adapted to work with the new, clean `db.js`.
// It requires access to: `loadContacts()`, `addContact()`, `getNextId()`
// ===================================================================

/**
 * Initializes the contacts page by loading contact data from the database
 * and rendering the complete contact list in the UI.
 */
async function initContactsPage() {
    await loadContacts();
    await renderContacts();
}

/**
 * Renders all contacts into the contact list, grouped by their first initial.
 * It first clears the existing list to prevent duplicates.
 */
async function renderContacts() {
    cleanContactsList();
    groupInitials();
}

/**
 * Creates a new contact, validates the input, assigns a unique sequential ID,
 * and saves it to the Firebase database. After creation, it reloads and
 * displays the updated contact list and shows a success notification.
 */
async function createNewContact() {
    if (checkValueInput()) return;

    try {
        const newContactId = await getNextId('/join/contacts');
        const { n: name, e: email, p: phone } = readsTheInputValues();
        const nameParts = name.trim().split(' ');
        const newContact = {
            id: newContactId,
            prename: nameParts.shift() || '',
            surname: nameParts.join(' ') || '',
            email: email,
            phone: phone,
            color: getUniqueAvatarColor()
        };

        await addContact(newContact, newContactId);
        await loadContacts();

        await renderContacts();
        closeOverlay();
        clearSuccessfulContainer();
        successfulAddContact();
        successChange();

    } catch (error) {
        console.error("Error creating a new contact:", error);
        alert("An error occurred. Please try again.");
    }
}

/**
 * Saves changes to an existing contact after validating the input fields.
 * The updated contact data is persisted to the Firebase database.
 * @param {string|number} id - The unique ID of the contact to save.
 */
async function saveContact(id) {
    if (checkEditValueInput()) return;

    updateUserData(id);

    const contactToSave = findContact(id);
    if (!contactToSave) {
        console.error(`Could not find contact with ID ${id} to save.`);
        return;
    }

    try {
        await firebaseRequest(`/join/contacts/${id}`, 'PUT', contactToSave);
        await renderContacts();
        clearMainContact();
        closeOverlay();
        clearSuccessfulContainer();
        successfulAddContact();
        successChange();
    } catch (error) {
        console.error("Error saving the contact:", error);
        alert("The contact could not be saved. Please try again.");
    }
}

/**
 * Deletes a contact from the Firebase database.
 * @param {Event} event - The triggering event object to prevent default actions.
 * @param {string} contactId - The unique ID of the contact to delete.
 */
async function deleteContact(event, contactId) {
    suppressActionEvent(event);
    try {
        const loggedInUserEmail = getLoggedInUserEmail();
        const contactToDelete = await firebaseRequest(`/join/contacts/${contactId}`, 'GET');

        if (!contactToDelete) return;

        await firebaseRequest(`/join/contacts/${contactId}`, 'DELETE');

        if (loggedInUserEmail && loggedInUserEmail === contactToDelete.email) {
            const userIdToDelete = localStorage.getItem('currentUserId');
            if (userIdToDelete) {
                await firebaseRequest(`/join/users/${userIdToDelete}`, 'DELETE');
            }
            localStorage.clear();
            window.location.href = '/index.html';
            return;
        }

        await loadContacts();
        await renderContacts();
        clearMainContact();
        successfulDeleteContact();
        successChange();
    } catch (error) {
        console.error('FATAL ERROR in deleteContact process:', error);
    }
}

/**
 * Retrieves the email of the currently logged-in user from local storage.
 * @returns {string|null} The user's email or null if not found.
 */
function getLoggedInUserEmail() {
    return localStorage.getItem('currentUserEmail');
}

/**
 * Handles the click event on a contact. It highlights the selected contact,
 * and then displays the full information for that contact.
 * @param {string|number} id - The unique ID of the chosen contact.
 */
function chooseContact(id) {
    const contact = findContact(id);
    if (!contact) return;

    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();

    // LOGIC: Calculate initials
    const initials = (contact.prename.charAt(0) + (contact.surname ? contact.surname.charAt(0) : '')).toUpperCase();

    // RENDER: Use the template
    const infoContainer = document.getElementById('contactInfoContainer');
    infoContainer.innerHTML = getContactDetailTemplate(contact, initials);
    slideIn();
}

/**
 * Opens the 'Add New Contact' dialog by rendering the corresponding
 * overlay template and making it visible.
 */
function openNewContactDialog() {
    const overlayContainer = document.getElementById('overlayContact');
    if (!overlayContainer) return;
    overlayContainer.innerHTML = getOverlayAddContactTemplate();
    openOverlay();
}

/**
 * Opens the 'Edit Contact' dialog for a specific contact.
 * @param {string|number} id - The unique ID of the contact to edit.
 */
function editContact(id) {
    const individualUser = findContact(id);
    if (!individualUser) return;
    
    clerOverlay();

    // LOGIC: Calculate initials
    const initials = (individualUser.prename.charAt(0) + (individualUser.surname ? individualUser.surname.charAt(0) : '')).toUpperCase();
    
    // RENDER: Use the template
    const overlayContainer = document.getElementById('overlayContact');
    overlayContainer.innerHTML = getOverlayEditContactTemplate(individualUser, initials);
    
    openOverlay();
}

/**
 * Opens the responsive version of the 'Add New Contact' dialog.
 */
function addRespContact() {
    clerOverlay();
    const overlayContainer = document.getElementById('overlayContact');
    overlayContainer.innerHTML = getOverlayAddRespTemplate();
    openOverlay();
}

/**
 * Opens the responsive version of the 'Edit Contact' dialog.
 * @param {string|number} id - The unique ID of the contact to edit.
 */
function editRespContact(id) {
    const individualUser = findContact(id);
    if (!individualUser) return;
    
    clerOverlay();

    // LOGIC: Calculate initials for responsive view
    const initials = (individualUser.prename.charAt(0) + (individualUser.surname ? individualUser.surname.charAt(0) : '')).toUpperCase();
    
    // RENDER: Use the responsive template
    const overlayContainer = document.getElementById('overlayContact');
    overlayContainer.innerHTML = getOverlayEditRespTemplate(individualUser, initials);

    openOverlay();
    closeToolsresp();
}

/**
 * Adjusts the UI for responsive view when a user's information is displayed.
 */
function showRespUserInfo() {
    if (window.innerWidth <= 900) {
        document.getElementById('contactContainer').classList.add('d-none');
        document.getElementById('contactInfoContainer').classList.add('d-block');
        cleanContainerBtn();
        changeOfMoreBtn();
        setBackBtn();
    }
}

/**
 * Reverts the UI from the responsive details view back to the contact list view.
 */
function showRespContactList() {
    let container = document.getElementById('contactContainer');
    if (!container.classList.contains('d-none')) return;
    container.classList.remove('d-none');
    document.getElementById('contactInfoContainer').classList.remove('d-block');
    removeBackBtn();
    cleanContainerBtn();
    changeOfAddPersoneBtn();
}

/**
 * Validates the input fields for a new contact.
 * @returns {boolean} `true` if there are validation errors, otherwise `false`.
 */
function checkValueInput() {
    let errors = checkValues();
    if (errors.length > 0) {
        inputError(errors);
        return true;
    }
    return false;
}

/**
 * Displays validation error messages to the user.
 * @param {Array<string>} inputLabels - An array of field names that have errors.
 */
function inputError(inputLabels) {
    let info = document.getElementById('errorPoppin');
    info.classList.remove('opacity');
    let errorMessages = inputLabels.map(label => errorMessage(label)).join('<br>');
    info.innerHTML = errorMessages;
    inputLabels.forEach(label => {
        errorInputField(label);
    });
}

/**
 * Clears all displayed error messages.
 */
function removeErrorText() {
    const labels = ["Contactname", "Email", "Phone"];
    const info = document.getElementById('errorPoppin');
    if (info) {
        info.classList.add('opacity');
        info.innerHTML = "";
    }
    labels.forEach(label => {
        const inputLabel = document.getElementById('label' + label);
        if (inputLabel) {
            inputLabel.classList.remove('error-border');
        }
    });
}

/**
 * Adds a visual error border to a specified input field's container.
 * @param {string} inputLabel - The name of the field to highlight.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}

/**
 * Checks if a given string value is empty.
 * @param {string} value - The string to check.
 * @returns {boolean} `true` if the string is empty.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}

/**
 * Reads the current values from the contact form input fields.
 * @returns {{n: string, e: string, p: string}} An object with name, email, and phone.
 */
function readsTheInputValues() {
    return {
        n: document.getElementById('contactname').value,
        e: document.getElementById('email').value,
        p: document.getElementById('phone').value
    };
}

/**
 * Performs validation checks on the contact form fields.
 * @returns {Array<string>} An array of field names that failed validation.
 */
function checkValues() {
    let { n, e, p } = readsTheInputValues();
    const errors = [];
    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s-]+$/.test(n)) {
        errors.push("Contactname");
    }
    if (checkEmptyInput(e) || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e)) {
        errors.push("Email");
    }
    if (checkEmptyInput(p) || !/^[\d\s()+-]+$/.test(p) || p.length > 15) {
        errors.push("Phone");
    }
    return errors;
}

/**
 * Performs validation checks specifically for the edit contact form.
 * @returns {Array<string>} An array of field names that failed validation.
 */
function checkEditValues() {
    return checkValues(); // The validation logic is the same, so we reuse the function.
}

/**
 * Checks the form input for validity when editing. Shows errors if found.
 * @returns {boolean} `true` if there are input errors.
 */
function checkEditValueInput() {
    let errors = checkEditValues();
    if (errors.length > 0) {
        inputError(errors);
        return true;
    }
    return false;
}