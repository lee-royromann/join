// ===================================================================
// NOTE:
// This file has been adapted to work with the new, clean `db.js`.
// It requires access to: `loadContacts()`, `addContact()`, `getNextId()`
// ===================================================================

/**
 * Initializes the contacts page, loads contact data, and renders the UI.
 */
async function initContactsPage() {
    // isUserLoged(); // Assumption: This function exists in another file.
    
    // Calls the new central load function
    await loadContacts(); 
    
    // renderContacts() and init() remain unchanged
    await renderContacts();
    // init('contact_page'); // Assumption: This function exists in another file.
}

/**
 * Renders all contacts grouped by initials.
 */
async function renderContacts() {
    cleanContactsList(); // Assumption: This function exists
    groupInitials();     // Assumption: This function exists
}

// In contacts_controllers.js

async function createNewContact() {
    // Validate before saving
    if (!validatePhoneInput()) {
        return; // Stops the function if the phone number is invalid
    }
    // ... existing code to create the contact
}

async function saveContact(contactId) {
    // Validate before saving
    if (!validatePhoneInput()) {
        return; // Stops the function if the phone number is invalid
    }
    // ... existing code to save changes
}

/**
 * Saves changes to an existing contact.
 * @param {string|number} id - The ID of the contact to save.
 */
async function saveContact(id) {
    if (checkEditValueInput()) return;

    // 1. Update local data in the 'contactsFirebase' array
    updateUserData(id); // Updates the contact in the local array

    // 2. Find the updated contact to save it
    const contactToSave = findContact(id);
    if (!contactToSave) {
        console.error(`Could not find contact with ID ${id} to save.`);
        return;
    }

    try {
        // 3. Overwrite the individual contact in Firebase by its ID
        await firebaseRequest(`/join/contacts/${id}`, 'PUT', contactToSave);

        // 4. Update UI
        await renderContacts();
        clearMainContact();
        closeOverlay();

        // 5. Display success message
        clearSuccessfulContainer();
        successfulAddContact(); // Shows "Contact successfully created"
        successChange();

    } catch (error) {
        console.error("Error saving the contact:", error);
        alert("The contact could not be saved. Please try again.");
    }
}

/**
 * Deletes a contact and, if it is the current user's own account, also deletes the user account.
 * Securely retrieves the user ID from localStorage.
 * @param {Event} event - The triggering event.
 * @param {string} contactId - The ID of the contact to delete.
 */
async function deleteContact(event, contactId) {
    suppressActionEvent(event);
    console.log(`--- deleteContact started for contactId: ${contactId} ---`);

    try {
        const loggedInUserEmail = getLoggedInUserEmail();
        const contactToDelete = await firebaseRequest(`/join/contacts/${contactId}`, 'GET');

        if (!contactToDelete) {
            console.error(`Error: Contact with ID ${contactId} was not found in Firebase.`);
            return;
        }

        // Delete the contact entry
        await firebaseRequest(`/join/contacts/${contactId}`, 'DELETE');

        // Check if the user is deleting themselves
        if (loggedInUserEmail && loggedInUserEmail === contactToDelete.email) {
            const userIdToDelete = localStorage.getItem('currentUserId');

            if (userIdToDelete) {
                // Delete user account
                await firebaseRequest(`/join/users/${userIdToDelete}`, 'DELETE');
            } else {
                console.warn('ERROR: Could not read User ID from localStorage. User account was NOT deleted.');
            }

            // Perform logout
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('username');
            localStorage.removeItem('loggedIn');
            window.location.href = '/index.html'; // Adjust path to login page
            return;
        }

        // Update UI if another contact was deleted
        await loadContacts();
        await renderContacts();
        clearMainContact();
        successfulDeleteContact();
        successChange();

    } catch (error) {
        console.error('FATAL ERROR in deleteContact process:', error);
        alert("An unexpected error occurred.");
    }
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
 * Helper: Gets the email of the currently logged-in user from localStorage.
 * @returns {string|null} The user's email or null if not found.
 */
function getLoggedInUserEmail() {
    return localStorage.getItem('currentUserEmail');
}

// ===================================================================
// Remaining UI and validation functions
// ===================================================================

/**
 * Selects a contact, highlights it, and shows its details.
 * @param {string|number} id - The ID of the selected contact.
 */
function chooseContact(id) {
    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();
    userInfo(id);
}

/**
 * Opens the dialog to create a new contact.
 */
function openNewContactDialog() {
    const overlayContainer = document.getElementById('overlayContact');
    if (!overlayContainer) return;
   
    overlayContainer.innerHTML = showOverlayAddContact();
    openOverlay(); // Make the newly loaded overlay immediately visible
}

/**
 * Opens the dialog to edit an existing contact.
 * @param {string|number} id - The ID of the contact to edit.
 */
function editContact(id) {
    clerOverlay();
    openEditContact(id);
    openOverlay();
}

/**
 * Opens the responsive dialog to add a new contact.
 */
function addRespContact() {
    clerOverlay();
    openAddRespContact();
    openOverlay();
}

/**
 * Opens the responsive dialog to edit a contact.
 * @param {string|number} id - The ID of the contact to edit.
 */
function editRespContact(id) {
    clerOverlay();
    openEditRespContact(id);
    openOverlay();
    closeToolsresp();
}

/**
 * Adjusts the view for mobile devices to show user information.
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
 * Restores the mobile view to show the contact list.
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
 * Checks the input values of the form and shows errors if needed.
 * @returns {boolean} `true` if errors exist, otherwise `false`.
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
 * Displays error messages for all invalid input fields.
 * @param {Array<string>} inputLabels - Array of invalid field names.
 */
function inputError(inputLabels) {
    let info = document.getElementById('poppin');
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
    const info = document.getElementById('poppin');
    info.classList.add('opacity');
    info.innerHTML = "";
    labels.forEach(label => {
        const inputLabel = document.getElementById('label' + label);
        if (inputLabel) {
            inputLabel.classList.remove('error-border');
        }
    });
}

/**
 * Returns a specific error message for a given field.
 * @param {string} key - The field key ("Contactname", "Email", "Phone").
 * @returns {string} The corresponding error message.
 */
function errorMessage(key) {
    const messages = {
        "Contactname": "Please check your name entry!",
        "Email": "Please check your email entry!",
        "Phone": "Please check your phonenumber entry!"
    };
    return messages[key] || "Unknown error!";
}

/**
 * Marks an input field visually as invalid.
 * @param {string} inputLabel - The name of the field to mark.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}

/**
 * Checks if a value is empty or contains only whitespace.
 * @param {string} value - The value to check.
 * @returns {boolean} `true` if empty, otherwise `false`.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}

/**
 * Reads the current values from the form fields.
 * @returns {Object} Object with values for name (n), email (e), and phone (p).
 */
function readsTheInputValues() {
    return {
        n: document.getElementById('contactname').value,
        e: document.getElementById('email').value,
        p: document.getElementById('phone').value
    };
}

/**
 * Validates the form field values when creating a new contact.
 * @returns {Array<string>} Array with invalid field names.
 */
function checkValues() {
    let { n, e, p } = readsTheInputValues();
    const errors = [];

    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(n)) {
        errors.push("Contactname");
    }
    if (checkEmptyInput(e) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        errors.push("Email");
    }
    if (checkEmptyInput(p) || !/^[\d\s()+-]+$/.test(p)) {
        errors.push("Phone");
    }
    return errors;
}

/**
 * Validates form field values when editing a contact.
 * @returns {Array<string>} Array with invalid field names.
 */
function checkEditValues() {
    let { n, e, p } = readsTheInputValues();
    const errors = [];

    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(n)) {
        errors.push("Contactname");
    }
    if (checkEmptyInput(e) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        errors.push("Email");
    }
    if (!checkEmptyInput(p) && !/^[\d\s()+-]+$/.test(p)) {
        errors.push("Phone");
    }
    return errors;
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

// In join/js/contacts_controllers.js

/**
 * Validates the phone number input and enables/disables the submit button.
 */
function validatePhoneInput() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const phoneLabel = document.getElementById('labelPhone');
    
    const submitButton = document.querySelector('.create-contact-btn') || document.querySelector('.save-contact-btn');

    if (phoneInput.checkValidity()) {
        phoneError.classList.add('d-none');
        phoneLabel.classList.remove('invalid');
        if (submitButton) submitButton.disabled = false;
        return true;
    } else {
        phoneError.classList.remove('d-none');
        phoneLabel.classList.add('invalid');
        if (submitButton) submitButton.disabled = true;
        return false;
    }
}
