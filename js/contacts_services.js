/**
 * Verhindert die Event-Weitergabe in der Bubbling-Phase.
 * @param {Event} event Das Event-Objekt.
 */
function eventBubbling(event) {
    event.stopPropagation();
}


/** Leert die Kontaktliste im HTML, um sie neu zu rendern. */
function cleanContactsList() {
    document.getElementById("contactList").innerHTML = "";
}


/** * Gruppiert die globale `contactsFirebase`-Liste nach dem Anfangsbuchstaben des Benutzernamens
 * und ruft dann die Funktion zum Erstellen des HTML auf.
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
 * Erstellt die HTML-Struktur für die gruppierte Kontaktliste.
 * @param {Object} list Ein Objekt, bei dem die Schlüssel die Initialen und die Werte Arrays von Kontakten sind.
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
 * Fügt die HTML-Darstellung der einzelnen Benutzer zu einer Buchstabensektion hinzu.
 * @param {Object} list Die gruppierte Kontaktliste.
 * @param {string} letter Der Buchstabe der aktuellen Gruppe.
 * @param {HTMLElement} section Das HTML-Element der Sektion, zu der die Kontakte hinzugefügt werden.
 */
function userData(list, letter, section) {
    list[letter].forEach((contact) => {
        // Teilt den Namen in einzelne Wörter
        const nameParts = contact.username.trim().split(' ').filter(Boolean);
        let initials = '';

        if (nameParts.length > 0) {
            // Nimmt den ersten Buchstaben des ersten Wortes
            initials = nameParts[0].charAt(0).toUpperCase();
            // Wenn es mehr als ein Wort gibt, wird der erste Buchstabe des letzten Wortes hinzugefügt
            if (nameParts.length > 1) {
                initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            }
        }
        section.innerHTML += showUserInformation(contact, initials);
    });
}

/**
 * Hebt einen ausgewählten Kontakt in der Liste visuell hervor.
 * @param {string|number} id Die ID des zu markierenden Kontakts.
 */
function setClassChoooseContact(id) {
    document.getElementById(`contact${id}`)?.classList.add("choose-contact");
}


/** Entfernt die Hervorhebung von allen Kontakten in der Liste. */
function resetClassChooseContact() {
    document.querySelectorAll(".contact").forEach((element) => {
        element.classList.remove("choose-contact");
    });
}


/**
 * Findet ein Kontakt-Objekt im globalen `contactsFirebase`-Array anhand seiner ID.
 * @param {string|number} id Die ID des gesuchten Kontakts.
 * @returns {Object|undefined} Das gefundene Kontaktobjekt oder undefined.
 */
function findContact(id) {
    return contactsFirebase.find((c) => c.id == id);
}


/** Leert den Bereich, in dem die detaillierten Kontaktinformationen angezeigt werden. */
function clearMainContact() {
    document.getElementById("contactInformation").innerHTML = "";
}


/**
 * Zeigt die Detailinformationen für einen ausgewählten Kontakt an.
 * @param {string|number} id Die ID des anzuzeigenden Kontakts.
 */
function userInfo(id) {
    let individualContact = findContact(id);
    document.getElementById("contactInformation").innerHTML = showContact(individualContact);
    slideIn();
}


/** Startet die Animation zum Hereinschieben der Kontaktdetails. */
function slideIn() {
    setTimeout(() => document.getElementById("slide")?.classList.add("active"), 10);
}


/** Öffnet das Kontakt-Overlay (für "Hinzufügen" oder "Bearbeiten") mit einer Animation. */
function openOverlay() {
    document.getElementById("overlayContact").classList.remove("d-none");
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("d-none");
    setTimeout(() => overlay.classList.add("slide"), 10);
}


/**
 * Schließt das Kontakt-Overlay mit einer Animation.
 * @param {Event} event Das auslösende Event, um die Standardaktion zu unterdrücken.
 */
function closeOverlay(event) {
    suppressActionEvent(event);
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("slide");
    setTimeout(() => overlay.classList.add("d-none"), 200);
    setTimeout(() => document.getElementById("overlayContact").classList.add("d-none"), 100);
}


/**
 * Verhindert die Standardaktion eines Events (z.B. das Absenden eines Formulars).
 * @param {Event} event Das Event-Objekt.
 */
function suppressActionEvent(event) {
    if (event) {
        event.preventDefault();
    }
}


/** Leert den Inhalt des Kontakt-Overlays. */
function clerOverlay() {
    document.getElementById("overlayContact").innerHTML = "";
}


/** Zeigt das "Kontakt hinzufügen"-Formular im Overlay an. */
function openAddContact() {
    document.getElementById("overlayContact").innerHTML = showOverlayAddContact();
}


/**
 * Zeigt das "Kontakt bearbeiten"-Formular im Overlay an, vorausgefüllt mit den Daten des Kontakts.
 * @param {string|number} id Die ID des zu bearbeitenden Kontakts.
 */
function openEditContact(id) {
    let contact = findContact(id);
    document.getElementById("overlayContact").innerHTML = overlayEditContact(contact);
}


/** Zeigt das responsive "Kontakt hinzufügen"-Formular an. */
function openAddRespContact() {
    document.getElementById("overlayContact").innerHTML = showOverlayAddResp();
}


/**
 * Zeigt das responsive "Kontakt bearbeiten"-Formular an.
 * @param {string|number} id Die ID des zu bearbeitenden Kontakts.
 */
function openEditRespContact(id) {
    let contact = findContact(id);
    document.getElementById("overlayContact").innerHTML = overlayEditContact(contact);
}

// ===================================================================
// NEUE VALIDIERUNGSFUNKTIONEN
// ===================================================================

/**
 * Erstellt einen neuen Kontakt, weist eine fortlaufende ID zu und speichert ihn in Firebase.
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
        console.error("Fehler beim Erstellen des neuen Kontakts:", error);
        alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
}

/**
 * Validiert die Eingabefelder des Kontaktformulars.
 * @returns {Array<string>} Ein Array mit den Namen aller fehlerhaften Felder.
 */
function validateContactInput() {
    const errors = [];
    const name = document.getElementById('contactname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (checkEmptyInput(name)) {
        errors.push("Contactname");
    }

    if (checkEmptyInput(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Email");
    }

    if (checkEmptyInput(phone)) {
        errors.push("Phone");
    }

    return errors;
}

/**
 * Zeigt eine Liste von Fehlermeldungen an und markiert die entsprechenden Eingabefelder.
 * @param {Array<string>} errorLabels - Ein Array mit den Feldnamen, die Fehler enthalten.
 */
function displayAllContactErrors(errorLabels) {
    const info = document.getElementById('poppin');
    const errorMessages = errorLabels.map(label => errorMessage(label)); // Alle Fehlermeldungen sammeln

    errorLabels.forEach(label => errorInputField(label)); // Alle fehlerhaften Felder markieren

    info.classList.remove('opacity');
    info.innerHTML = errorMessages.join('<br>'); // Alle Meldungen anzeigen
}

/**
 * Entfernt alle Fehlermarkierungen und leert die Fehlermeldungsanzeige.
 */
function clearAllContactErrors() {
    const fields = ["Contactname", "Email", "Phone"];
    const info = document.getElementById('poppin');

    fields.forEach(field => {
        const label = document.getElementById('label' + field);
        if (label) {
            label.classList.remove('error-border');
        }
    });

    if (info) {
        info.classList.add('opacity');
        info.innerHTML = "";
    }
}

// ===================================================================
// HILFSFUNKTIONEN (teilweise aus login.js wiederverwendet)
// ===================================================================

/**
 * Überprüft, ob ein String leer ist.
 * @param {string} value - Der zu prüfende String.
 * @returns {boolean} - True, wenn der String leer ist.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}

/**
 * Gibt eine passende Fehlermeldung für ein bestimmtes Feld zurück.
 * @param {string} key - Der Name des Feldes ("Contactname", "Email", "Phone").
 * @returns {string} - Die Fehlermeldung.
 */
function errorMessage(key) {
    const messages = {
        "Contactname": "Please enter a name.",
        "Email": "Please provide a valid email.",
        "Phone": "Please enter a phone number.",
        "Password": "Please check your password!"
    };
    return messages[key] || "An unknown error occurred.";
}

/**
 * Markiert ein Eingabefeld visuell als fehlerhaft.
 * @param {string} inputLabel - Der Name des Feldes (z.B. "Contactname").
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}

// ===================================================================
// BESTEHENDE FUNKTIONEN (unverändert)
// ===================================================================

/**
 * Aktualisiert die Daten eines Kontakts im `contactsFirebase`-Array basierend auf den Formularfeldern.
 * @param {string|number} id Die ID des zu aktualisierenden Kontakts.
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
 * Ruft die Avatar-Farbe eines Kontakts anhand seiner ID ab.
 * @param {string|number} id Die ID des Kontakts.
 * @returns {string} Die Farbe als Hex-String oder 'brown' als Standardwert.
 */
function getContactColorById(id) {
    const contact = contactsFirebase.find((c) => c.id === id);
    return contact ? contact.color : "brown";
}


/**
 * Löscht einen Kontakt aus dem lokalen `contactsFirebase`-Array anhand seiner ID.
 * @param {number} id Die ID des zu löschenden Kontakts.
 */
function deleteUserData(id) {
    contactsFirebase = contactsFirebase.filter((user) => user.id !== id);
}


/** Ordnet die IDs aller Kontakte im Array neu, um sie sequenziell zu halten (z.B. nach dem Löschen). */
function reSortUser() {
    contactsFirebase.forEach((user, index) => {
        user.id = index;
    });
}


/** Erstellt ein neues Kontaktobjekt aus den Formularfeldern und fügt es zum `contactsFirebase`-Array hinzu. */
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


/** Führt die Animation für eine Erfolgsmeldung aus (z.B. "Kontakt erstellt"). */
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


/** Leert den Container für Erfolgsmeldungen. */
function clearSuccessfulContainer() {
    document.getElementById("success").innerHTML = "";
}


/** Zeigt eine Erfolgsmeldung für das Erstellen eines Kontakts an. */
function successfulAddContact() {
    document.getElementById("success").innerHTML = showSuccessfulCreated();
}


/** Zeigt eine Erfolgsmeldung für das Löschen eines Kontakts an. */
function successfulDeleteContact() {
    document.getElementById("success").innerHTML = showSuccessfulDeleted();
}


/** Leert den Container für den responsiven Button. */
function cleanContainerBtn() {
    document.getElementById("addBtnResp").innerHTML = "";
}


/** Ändert den responsiven Button zu einem "Mehr"-Button (z.B. für weitere Optionen). */
function changeOfMoreBtn() {
    document.getElementById("addBtnResp").innerHTML = changeBtnMore();
}


/** Öffnet das responsive Tools-Overlay (Menü für mobile Ansicht). */
function openToolsResp() {
    let toolOverlay = document.getElementById("toolsRespContainer");
    let toolcontainer = document.getElementById("toolsResp");
    toolOverlay.classList.remove("d-none");
    toolcontainer.classList.remove("d-none");
    setTimeout(() => toolcontainer.classList.add("tools-resp-active"), 10);
}


/** Schließt das responsive Tools-Overlay. */
function closeToolsresp() {
    let toolcontainer = document.getElementById("toolsResp");
    if (toolcontainer) {
        toolcontainer.classList.remove("tools-resp-active");
        setTimeout(() => {
            toolcontainer.classList.add("d-none");
            document.getElementById("toolsRespContainer").classList.add("d-none");
        }, 200);
    }
}


/** Zeigt den responsiven "Zurück"-Button an. */
function setBackBtn() {
    document.querySelector(".back-btn-resp").classList.add("d-opacity");
}


/** Versteckt den responsiven "Zurück"-Button. */
function removeBackBtn() {
    document.querySelector(".back-btn-resp").classList.remove("d-opacity");
}


/** Ändert den Button-Text zu "Person hinzufügen". */
function changeOfAddPersoneBtn() {
    document.getElementById("addBtnResp").innerHTML = changeAddBtnPerson();
}


/**
 * Wählt eine zufällige Farbe aus einer vordefinierten Liste für Avatare.
 * @returns {string} Ein Hex-Farbcode als String.
 */
function getUniqueAvatarColor() {
    const colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
    return colors[Math.floor(Math.random() * colors.length)];
}