/**
 * Initializes the contacts page, loading contact data and rendering UI.
 * @async
 */
async function initContactsPage() {
    isUserLoged();
    await loadContactsFromFirebase();
    await renderContacts();
    init('contact_page');
}


/**
 * Renders all contacts grouped by initials.
 * @async
 */
async function renderContacts() {
    cleanContactsList();
    groupInitials();
}


/**
 * Highlights the selected contact and displays their information.
 * @param {string|number} id - Contact ID.
 */
function chooseContact(id) {
    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();
    userInfo(id);
}


/**
 * Opens the add contact overlay.
 */
function addContact() {
    clerOverlay();
    openAddContact();
    openOverlay();
}


/**
 * Opens the edit contact overlay.
 * @param {string|number} id - Contact ID.
 */
function editContact(id) {
    clerOverlay();
    openEditContact(id);
    openOverlay();
}


/**
 * Opens the responsible add contact overlay.
 */
function addRespContact() {
    clerOverlay();
    openAddRespContact();
    openOverlay();
}


/**
 * Opens the responsible edit contact overlay.
 * @param {string|number} id - Contact ID.
 */
function editRespContact(id) {
    clerOverlay();
    openEditRespContact(id);
    openOverlay();
    closeToolsresp();
}


/**
 * Saves updated contact data and refreshes UI.
 * @async
 * @param {string|number} id - Contact ID.
 */
async function saveContact(id) {
    if (checkValueInput()) return;
    updateUserData(id);
    await saveContactsToFirebase();
    showRespContactList();
    renderContacts();
    clearMainContact();
    closeOverlay();
    clearSuccessfulContainer();
    successfulAddContact();
    successChange();
}


/**
 * Deletes a contact and updates the interface accordingly.
 * @async
 * @function deleteContact
 * @param {Event} event - The triggering event.
 * @param {number} id - ID of the contact to delete.
 */
async function deleteContact(event, id) {
    suppressActionEvent(event)
    deleteUserData(id);
    reSortUser();
    await saveContactsToFirebase();
    showRespContactList();
    renderContacts();
    clearMainContact();
    clearSuccessfulContainer();
    successfulDeleteContact();
    successChange();
}


/**
 * Creates a new contact and updates Firebase.
 * @async
 * @function createNewContact
 */
async function createNewContact() {
    if (checkValueInput()) return;
    pushNewContact();
    await saveContactsToFirebase();
    renderContacts();
    closeOverlay();
    clearSuccessfulContainer();
    successfulAddContact();
    successChange();
}


/**
 * Switches to responsive contact info view.
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
 * Returns to contact list view in responsive layout.
 */
function showRespContactList() {
    let container = document.getElementById('contactContainer');
    if (!container.classList == 'd-none') return;
    container.classList.remove('d-none');
    document.getElementById('contactInfoContainer').classList.remove('d-block');
    removeBackBtn();
    cleanContainerBtn();
    changeOfAddPersoneBtn();
}


/**
 * Performs overall input validation and triggers error display if necessary.
 * 
 * @returns {boolean} - True if an error was found, otherwise false.
 */
function checkValueInput() {
    let input = checkValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}


/**
 * Displays an error message and highlights the input field with an error.
 * 
 * @param {string} inputLabel - Key of the input field to highlight.
 */
function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}


/**
 * Removes all visible error messages and resets input field highlights.
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
 * Returns the error message for a given input key.
 * 
 * @param {string} key - Input identifier (e.g., "Email", "Phone").
 * @returns {string} - Corresponding error message.
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
 * Adds an error class to the label element of a specified input.
 * 
 * @param {string} inputLabel - Identifier of the input label to highlight.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}


/**
 * Checks whether a given string is empty after trimming whitespace.
 * 
 * @param {string} value - The input string to check.
 * @returns {boolean} - True if empty, false otherwise.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}


/**
 * Reads values from the input fields and returns them.
 * 
 * @returns {{n: string, e: string, p: string}} - Name, email, and phone values.
 */
function readsTheInputValues() {
    return {
        n: document.getElementById('contactname').value,
        e: document.getElementById('email').value,
        p: document.getElementById('phone').value
    };
}


/**
 * Validates each input value and returns the key of the first invalid field.
 * 
 * @returns {string|undefined} - Field key with invalid input, or undefined if all valid.
 */
function checkValues() {
    let { n, e, p } = readsTheInputValues();
    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(n)) return "Contactname";
    if (checkEmptyInput(e) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email";
   if (checkEmptyInput(p) || !/^[\d\s()+-]+$/.test(p)) return "Phone";
}

