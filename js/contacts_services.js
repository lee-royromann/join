// join/js/contacts_services.js

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

/** * Groups the global `contactsFirebase` list by the first letter of the prename
 * and then calls the function to create the HTML.
 */
function groupInitials() {
    let group = {};
    contactsFirebase.forEach((contact) => {
        if (contact && contact.prename && contact.prename.trim() !== "") {
            const initial = contact.prename.trim()[0].toUpperCase();
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
        const prenameInitial = contact.prename ? contact.prename.charAt(0) : '';
        const surnameInitial = contact.surname ? contact.surname.charAt(0) : '';
        const initials = (prenameInitial + surnameInitial).toUpperCase();

        // KORRIGIERTER AUFRUF: Verwendet die Funktion aus der Template-Datei
        section.innerHTML += getContactListEntryTemplate(contact, initials);
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
    const container = document.getElementById("contactInfoContainer");
    if(container) container.innerHTML = "";
}

/** Starts the slide-in animation for contact details. */
function slideIn() {
    setTimeout(() => document.getElementById("slide")?.classList.add("active"), 10);
}

/** Opens the contact overlay (for "Add" or "Edit") with an animation. */
function openOverlay() {
    const overlayContainer = document.getElementById("overlayContact");
    if(overlayContainer) overlayContainer.classList.remove("d-none");
    
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.classList.remove("d-none");
        setTimeout(() => overlay.classList.add("slide"), 10);
    }
}

/**
 * Closes the contact overlay with an animation.
 * @param {Event} event The triggering event to prevent default behavior.
 */
function closeOverlay(event) {
    if (event) suppressActionEvent(event);
    const overlay = document.getElementById("overlay");
    if(overlay) {
        overlay.classList.remove("slide");
        setTimeout(() => {
            overlay.classList.add("d-none");
            const overlayContainer = document.getElementById("overlayContact");
            if(overlayContainer) overlayContainer.classList.add("d-none");
        }, 200);
    }
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

/**
 * Updates the data of a contact in the `contactsFirebase` array based on the form fields.
 * @param {string|number} id The ID of the contact to update.
 */
function updateUserData(id) {
    let contact = findContact(id);
    if (contact) {
        let nameValue = document.getElementById("contactname").value;
        let nameParts = nameValue.trim().split(/\s+/);
        contact.prename = nameParts[0] || '';
        contact.surname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        contact.email = document.getElementById("email").value;
        contact.phone = document.getElementById("phone").value;
    }
}

/** Runs the animation for a success message (e.g., "Contact created"). */
function successChange() {
    setTimeout(() => {
        let success = document.getElementById("success");
        let succContainer = document.getElementById("successContainer");
        if (success && succContainer) {
            success.classList.remove("d-none");
            succContainer.classList.remove("d-none");
            setTimeout(() => success.classList.add("show-successful"), 10);
            setTimeout(() => success.classList.remove("show-successful"), 1510);
            setTimeout(() => {
                success.classList.add("d-none");
                succContainer.classList.add("d-none");
            }, 1730);
        }
    }, 500);
}

/** Clears the container for success messages. */
function clearSuccessfulContainer() {
    document.getElementById("success").innerHTML = "";
}

/** Displays a success message for creating a contact. */
function successfulAddContact() {
    document.getElementById("success").innerHTML = getSuccessCreatedTemplate();
}

/** Displays a success message for deleting a contact. */
function successfulDeleteContact() {
    document.getElementById("success").innerHTML = getSuccessDeletedTemplate();
}

/** Clears the container for the responsive button. */
function cleanContainerBtn() {
    document.getElementById("addBtnResp").innerHTML = "";
}

/** Changes the responsive button to a "More" button (e.g., for additional options). */
function changeOfMoreBtn() {
    document.getElementById("addBtnResp").innerHTML = getMoreButtonTemplate();
}

/** Opens the responsive tools overlay (menu for mobile view). */
function openToolsResp() {
    let toolOverlay = document.getElementById("toolsRespContainer");
    let toolcontainer = document.getElementById("toolsResp");
    if (toolOverlay && toolcontainer) {
        toolOverlay.classList.remove("d-none");
        toolcontainer.classList.remove("d-none");
        setTimeout(() => toolcontainer.classList.add("tools-resp-active"), 10);
    }
}

/** Closes the responsive tools overlay. */
function closeToolsresp() {
    let toolcontainer = document.getElementById("toolsResp");
    if (toolcontainer) {
        toolcontainer.classList.remove("tools-resp-active");
        setTimeout(() => {
            toolcontainer.classList.add("d-none");
            if (toolcontainer.parentElement) {
                toolcontainer.parentElement.classList.add("d-none");
            }
        }, 200);
    }
}

/** Shows the responsive "Back" button. */
function setBackBtn() {
    document.querySelector(".back-btn-resp")?.classList.add("d-opacity");
}

/** Hides the responsive "Back" button. */
function removeBackBtn() {
    document.querySelector(".back-btn-resp")?.classList.remove("d-opacity");
}

/** Changes the button text to "Add Person". */
function changeOfAddPersoneBtn() {
    document.getElementById("addBtnResp").innerHTML = getAddPersonButtonTemplate();
}

/**
 * Selects a random color from a predefined list for avatars.
 * @returns {string} A hex color code as a string.
 */
function getUniqueAvatarColor() {
    const colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
    return colors[Math.floor(Math.random() * colors.length)];
}