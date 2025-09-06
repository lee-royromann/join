// join/js/contacts_controllers.js

// ===================================================================
// NOTE:
// This file has been adapted to work with the new, clean `db.js`.
// It requires access to: `loadContacts()`, `addContact()`, `getNextId()`
// ===================================================================

/**
 * Initializes the contacts page, loads contact data, and renders the UI.
 */
async function initContactsPage() {
    await loadContacts(); 
    await renderContacts();
}

/**
 * Renders all contacts grouped by initials.
 */
async function renderContacts() {
    cleanContactsList();
    groupInitials();
}

/**
 * Creates a new contact, assigns a sequential ID, and saves it in Firebase.
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

        renderContacts();
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
 * Saves changes to an existing contact.
 * @param {string|number} id - The ID of the contact to save.
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
 * Deletes a contact and, if it is the current user's own account, also deletes the user account.
 * @param {Event} event - The triggering event.
 * @param {string} contactId - The ID of the contact to delete.
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

function getLoggedInUserEmail() {
    return localStorage.getItem('currentUserEmail');
}

// ===================================================================
// Remaining UI and validation functions
// ===================================================================

function chooseContact(id) {
    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();
    userInfo(id);
}

function openNewContactDialog() {
    const overlayContainer = document.getElementById('overlayContact');
    if (!overlayContainer) return;
    overlayContainer.innerHTML = showOverlayAddContact();
    openOverlay();
}

function editContact(id) {
    clerOverlay();
    openEditContact(id);
    openOverlay();
}

function addRespContact() {
    clerOverlay();
    openAddRespContact();
    openOverlay();
}

function editRespContact(id) {
    clerOverlay();
    openEditRespContact(id);
    openOverlay();
    closeToolsresp();
}

function showRespUserInfo() {
    if (window.innerWidth <= 900) {
        document.getElementById('contactContainer').classList.add('d-none');
        document.getElementById('contactInfoContainer').classList.add('d-block');
        cleanContainerBtn();
        changeOfMoreBtn();
        setBackBtn();
    }
}

function showRespContactList() {
    let container = document.getElementById('contactContainer');
    if (!container.classList.contains('d-none')) return;
    container.classList.remove('d-none');
    document.getElementById('contactInfoContainer').classList.remove('d-block');
    removeBackBtn();
    cleanContainerBtn();
    changeOfAddPersoneBtn();
}

function checkValueInput() {
    let errors = checkValues();
    if (errors.length > 0) {
        inputError(errors);
        return true;
    }
    return false;
}

/**
 * Displays error messages for all invalid input fields.
 * @param {Array<string>} inputLabels - Array of invalid field names.
 */
function inputError(inputLabels) {
    let info = document.getElementById('errorPoppin'); // CHANGED ID
    info.classList.remove('opacity');

    let errorMessages = inputLabels.map(label => errorMessage(label)).join('<br>');
    info.innerHTML = errorMessages;

    inputLabels.forEach(label => {
        errorInputField(label);
    });
}

/**
 * Removes all error messages and visual markers from form fields.
 */
function removeErrorText() {
    const labels = ["Contactname", "Email", "Phone"];
    const info = document.getElementById('errorPoppin'); // CHANGED ID
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



function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}

function checkEmptyInput(value) {
    return value.trim() === "";
}

function readsTheInputValues() {
    return {
        n: document.getElementById('contactname').value,
        e: document.getElementById('email').value,
        p: document.getElementById('phone').value
    };
}

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

function checkEditValues() {
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

function checkEditValueInput() {
    let errors = checkEditValues();
    if (errors.length > 0) {
        inputError(errors);
        return true;
    }
    return false;
}

/**
 * Checks the form input for validity when editing. Shows errors if found.
 * @returns {boolean} `true` if there are input errors, otherwise `false`.
 */
function checkEditValueInput() {
    let errors = checkEditValues();
    if (errors.length > 0) {
        inputError(errors);
        return true;
    }
    return false;
}