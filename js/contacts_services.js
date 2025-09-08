/**
 * Prevents event propagation during the bubbling phase.
 * @param {Event} event The event object.
 */
function eventBubbling(event) {
    event.stopPropagation();
}

/** Clears the contact list in the HTML to re-render it. */
function cleanContactsList() {
    document.getElementById("contactList").innerHTML = "";
}

/** 
 * Groups the global `contactsFirebase` list by the first letter of the username
 * and then calls the function to create the HTML.
 */
function groupInitials() {
    let group = {};
    contactsFirebase.forEach((contact) => {
        if (contact && contact.username.trim() !== "") {
            const initial = contact.username.trim()[0].toUpperCase();
            if (!group[initial]) {
                group[initial] = [];
            }
            group[initial].push(contact);
        }
    });
    createHTML(group);
}

/**
 * Creates the HTML structure for the grouped contact list.
 * @param {Object} list An object where keys are initials and values are arrays of contacts.
 */
function createHTML(list) {
    let containerList = document.getElementById("contactList");
    Object.keys(list)
        .sort()
        .forEach((letter) => {
            const section = document.createElement("div");
            section.classList.add("tab");
            section.innerHTML = `<h3>${letter}</h3><hr>`;
            userData(list, letter, section);
            containerList.appendChild(section);
        });
}

/**
 * Adds the HTML representation of individual users to a letter section.
 * @param {Object} list The grouped contact list.
 * @param {string} letter The current group's letter.
 * @param {HTMLElement} section The HTML section element to add contacts to.
 */
function userData(list, letter, section) {
    list[letter].forEach((contact) => {
        const nameParts = contact.username.trim().split(' ').filter(Boolean);
        let initials = '';

        if (nameParts.length > 0) {
            initials = nameParts[0].charAt(0).toUpperCase();
            if (nameParts.length > 1) {
                initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            }
        }
        section.innerHTML += showUserInformation(contact, initials);
    });
}

/**
 * Visually highlights a selected contact in the list.
 * @param {string|number} id The ID of the contact to highlight.
 */
function setClassChoooseContact(id) {
    document.getElementById(`contact${id}`)?.classList.add("choose-contact");
}

/** Removes the highlight from all contacts in the list. */
function resetClassChooseContact() {
    document.querySelectorAll(".contact").forEach((element) => {
        element.classList.remove("choose-contact");
    });
}

/**
 * Finds a contact object in the global `contactsFirebase` array by ID.
 * @param {string|number} id The ID of the contact to find.
 * @returns {Object|undefined} The found contact object or undefined.
 */
function findContact(id) {
    return contactsFirebase.find((c) => c.id == id);
}

/** Clears the area displaying detailed contact information. */
function clearMainContact() {
    document.getElementById("contactInformation").innerHTML = "";
}

/**
 * Displays detailed information for a selected contact.
 * @param {string|number} id The ID of the contact to display.
 */
function userInfo(id) {
    let individualContact = findContact(id);
    document.getElementById("contactInformation").innerHTML = showContact(individualContact);
    slideIn();
}

/** Starts the slide-in animation for contact details. */
function slideIn() {
    setTimeout(() => document.getElementById("slide")?.classList.add("active"), 10);
}

/** Opens the contact overlay (for "Add" or "Edit") with an animation. */
function openOverlay() {
    document.getElementById("overlayContact").classList.remove("d-none");
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("d-none");
    setTimeout(() => overlay.classList.add("slide"), 10);
}

/**
 * Closes the contact overlay with an animation.
 * @param {Event} event The triggering event to prevent default behavior.
 */
function closeOverlay(event) {
    suppressActionEvent(event);
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("slide");
    setTimeout(() => overlay.classList.add("d-none"), 200);
    setTimeout(() => document.getElementById("overlayContact").classList.add("d-none"), 100);
}

/**
 * Prevents the default action of an event (e.g., form submission).
 * @param {Event} event The event object.
 */
function suppressActionEvent(event) {
    if (event) {
        event.preventDefault();
    }
}

/** Clears the content of the contact overlay. */
function clerOverlay() {
    document.getElementById("overlayContact").innerHTML = "";
}

/** Shows the "Add Contact" form in the overlay. */
function openAddContact() {
    document.getElementById("overlayContact").innerHTML = showOverlayAddContact();
}

/**
 * Shows the "Edit Contact" form in the overlay, prefilled with contact data.
 * @param {string|number} id The ID of the contact to edit.
 */
function openEditContact(id) {
    let contact = findContact(id);
    document.getElementById("overlayContact").innerHTML = overlayEditContact(contact);
}

/** Shows the responsive "Add Contact" form. */
function openAddRespContact() {
    document.getElementById("overlayContact").innerHTML = showOverlayAddResp();
}

/**
 * Shows the responsive "Edit Contact" form.
 * @param {string|number} id The ID of the contact to edit.
 */
function openEditRespContact(id) {
    let contact = findContact(id);
    document.getElementById("overlayContact").innerHTML = overlayEditContact(contact);
}

// ===================================================================
// NEW VALIDATION FUNCTIONS
// ===================================================================

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
        console.error("Error creating new contact:", error);
        alert("An error occurred. Please try again.");
    }
}

/**
 * Validates the input fields of the contact form.
 * @returns {Array<string>} An array of the names of all invalid fields.
 */
function validateContactInput() {
    const errors = [];
    const name = document.getElementById('contactname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (checkEmptyInput(name)) errors.push("Contactname");
    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email");
    if (checkEmptyInput(phone)) errors.push("Phone");

    return errors;
}

/**
 * Displays a list of error messages and highlights the corresponding input fields.
 * @param {Array<string>} errorLabels An array of field names with errors.
 */
function displayAllContactErrors(errorLabels) {
    const info = document.getElementById('poppin');
    const errorMessages = errorLabels.map(label => errorMessage(label));
    errorLabels.forEach(label => errorInputField(label));
    info.classList.remove('opacity');
    info.innerHTML = errorMessages.join('<br>');
}

/**
 * Removes all error highlights and clears the error message display.
 */
function clearAllContactErrors() {
    const fields = ["Contactname", "Email", "Phone"];
    const info = document.getElementById('poppin');

    fields.forEach(field => {
        const label = document.getElementById('label' + field);
        if (label) label.classList.remove('error-border');
    });

    if (info) {
        info.classList.add('opacity');
        info.innerHTML = "";
    }
}

// ===================================================================
// HELPER FUNCTIONS (partially reused from login.js)
// ===================================================================

/**
 * Checks if a string is empty.
 * @param {string} value The string to check.
 * @returns {boolean} True if the string is empty.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}

/**
 * Returns an appropriate error message for a given field.
 * @param {string} key The field name ("Contactname", "Email", "Phone").
 * @returns {string} The error message.
 */
function errorMessage(key) {
    const messages = {
        "Contactname": "Please enter a name.",
        "Email": "Please provide a valid email.",
        "Phone": "Please enter a valid phone number.",
        "Password": "Please check your password!"
    };
    return messages[key] || "An unknown error occurred.";
}

/**
 * Visually marks an input field as having an error.
 * @param {string} inputLabel The name of the field (e.g., "Contactname").
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) label.classList.add('error-border');
}

// ===================================================================
// EXISTING FUNCTIONS (unchanged)
// ===================================================================


/**
 * Updates the data of a contact in the `contactsFirebase` array based on the form fields.
 * @param {string|number} id The ID of the contact to update.
 */
function updateUserData(id) {
    let contact = findContact(id);
    if (contact) {
        let nameValue = document.getElementById("contactname").value;
        let nameParts = nameValue.trim().split(/\s+/);
        contact.prename = nameParts[0];
        contact.surname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        contact.username = nameValue.trim();
        contact.email = document.getElementById("email").value;
        contact.phone = document.getElementById("phone").value;
    }
}

/**
 * Retrieves a contact's avatar color by their ID.
 * @param {string|number} id The contact's ID.
 * @returns {string} The color as a hex string or 'brown' as a default.
 */
function getContactColorById(id) {
    const contact = contactsFirebase.find((c) => c.id === id);
    return contact ? contact.color : "brown";
}

/**
 * Deletes a contact from the local `contactsFirebase` array by ID.
 * @param {number} id The ID of the contact to delete.
 */
function deleteUserData(id) {
    contactsFirebase = contactsFirebase.filter((user) => user.id !== id);
}

/** Reassigns sequential IDs to all contacts in the array (e.g., after deletion). */
function reSortUser() {
    contactsFirebase.forEach((user, index) => {
        user.id = index;
    });
}

/** Creates a new contact object from form fields and adds it to the `contactsFirebase` array. */
function pushNewContact() {
    let nameValue = document.getElementById("contactname").value;
    let nameParts = nameValue.trim().split(/\s+/);
    let newContact = {
        id: contactsFirebase.length,
        prename: nameParts[0],
        surname: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
        username: nameValue.trim(),
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        color: getUniqueAvatarColor(),
    };
    contactsFirebase.push(newContact);
}

/** Runs the animation for a success message (e.g., "Contact created"). */
function successChange() {
    setTimeout(() => {
        let success = document.getElementById("success");
        let succContainer = document.getElementById("successContainer");
        success.classList.remove("d-none");
        succContainer.classList.remove("d-none");
        setTimeout(() => success.classList.add("show-successful"), 10);
        setTimeout(() => success.classList.remove("show-successful"), 1510);
        setTimeout(() => {
            success.classList.add("d-none");
            succContainer.classList.add("d-none");
        }, 1730);
    }, 500);
}

/** Clears the container for success messages. */
function clearSuccessfulContainer() {
    document.getElementById("success").innerHTML = "";
}

/** Displays a success message for creating a contact. */
function successfulAddContact() {
    document.getElementById("success").innerHTML = showSuccessfulCreated();
}

/** Displays a success message for deleting a contact. */
function successfulDeleteContact() {
    document.getElementById("success").innerHTML = showSuccessfulDeleted();
}

/** Clears the container for the responsive button. */
function cleanContainerBtn() {
    document.getElementById("addBtnResp").innerHTML = "";
}

/** Changes the responsive button to a "More" button (e.g., for additional options). */
function changeOfMoreBtn() {
    document.getElementById("addBtnResp").innerHTML = changeBtnMore();
}

/** Opens the responsive tools overlay (menu for mobile view). */
function openToolsResp() {
    let toolOverlay = document.getElementById("toolsRespContainer");
    let toolcontainer = document.getElementById("toolsResp");
    toolOverlay.classList.remove("d-none");
    toolcontainer.classList.remove("d-none");
    setTimeout(() => toolcontainer.classList.add("tools-resp-active"), 10);
}

/** Closes the responsive tools overlay. */
function closeToolsresp() {
    let toolcontainer = document.getElementById("toolsResp");
    if (toolcontainer) {
        toolcontainer.classList.remove("tools-resp-active");
        setTimeout(() => {
            toolcontainer.classList.add("d-none");
            // Korrigierte Zeile:
            toolcontainer.parentElement.classList.add("d-none"); 
        }, 200);
    }
}

/** Shows the responsive "Back" button. */
function setBackBtn() {
    document.querySelector(".back-btn-resp").classList.add("d-opacity");
}

/** Hides the responsive "Back" button. */
function removeBackBtn() {
    document.querySelector(".back-btn-resp").classList.remove("d-opacity");
}

/** Changes the button text to "Add Person". */
function changeOfAddPersoneBtn() {
    document.getElementById("addBtnResp").innerHTML = changeAddBtnPerson();
}

/**
 * Selects a random color from a predefined list for avatars.
 * @returns {string} A hex color code as a string.
 */
function getUniqueAvatarColor() {
    const colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
    return colors[Math.floor(Math.random() * colors.length)];
}
