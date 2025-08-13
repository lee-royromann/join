// ===================================================================
// HINWEIS:
// Diese Datei wurde angepasst, um mit der neuen, sauberen `db.js` zu funktionieren.
// Sie benötigt Zugriff auf: `loadContacts()`, `addContact()`, `getNextId()`
// ===================================================================

/**
 * Initializes the contacts page, loading contact data and rendering UI.
 */
async function initContactsPage() {
    // isUserLoged(); // Annahme: Diese Funktion existiert in einer anderen Datei.
    
    // Ruft die neue, zentrale Ladefunktion auf.
    await loadContacts(); 
    
    // renderContacts() und init() bleiben unverändert.
    await renderContacts();
    // init('contact_page'); // Annahme: Diese Funktion existiert in einer anderen Datei.
}


/**
 * Renders all contacts grouped by initials. (Unverändert)
 */
async function renderContacts() {
    cleanContactsList(); // Annahme: Diese Funktion existiert.
    groupInitials();     // Annahme: Diese Funktion existiert.
}


// In contacts_controllers.js

/**
 * KORRIGIERT: Speichert die Änderungen an einem bestehenden Kontakt.
 * Im Gastmodus werden Änderungen nur lokal (temporär) vorgenommen.
 */
async function saveContact(id) {
    // GASTMODUS-LOGIK
    if (isGuest()) {
        updateUserData(id); // Lokale Daten im Array aktualisieren
        renderContacts();
        clearMainContact();
        closeOverlay();
        console.log("GASTMODUS: Änderungen werden nicht gespeichert.");
        return; // Funktion beenden, keine Firebase-Aktion
    }

    // Original-Logik für echte Benutzer
    updateUserData(id); 
    const contactToSave = findContact(id);
    if (!contactToSave) {
        console.error(`Konnte Kontakt mit ID ${id} nicht zum Speichern finden.`);
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
        console.error("Fehler beim Speichern des Kontakts:", error);
        alert("Der Kontakt konnte nicht gespeichert werden.");
    }
}

/**
 * KORRIGIERT: Löscht einen Kontakt.
 * Im Gastmodus wird der Kontakt nur lokal (temporär) aus der Ansicht entfernt.
 */
async function deleteContact(event, id) {
    suppressActionEvent(event);

    // GASTMODUS-LOGIK
    if (isGuest()) {
        deleteUserData(id); // Kontakt nur aus dem lokalen Array löschen
        if (window.innerWidth <= 900) {
            showRespContactList();
        }
        renderContacts();
        clearMainContact();
        console.log("GASTMODUS: Kontakt wird nicht aus der Datenbank gelöscht.");
        return; // Funktion beenden, keine Firebase-Aktion
    }

    // Original-Logik für echte Benutzer
    try {
        await firebaseRequest(`/join/contacts/${id}`, 'DELETE');
        await loadContacts();
        if (window.innerWidth <= 900) {
            showRespContactList();
        }
        renderContacts();
        clearMainContact();
        clearSuccessfulContainer();
        successfulDeleteContact();
        successChange();
    } catch (error) {
        console.error("Fehler beim Löschen des Kontakts:", error);
        alert("Der Kontakt konnte nicht gelöscht werden.");
    }
}

/**
 * KORRIGIERT: Erstellt einen neuen Kontakt.
 * Im Gastmodus wird der Kontakt nur lokal (temporär) hinzugefügt.
 */
async function createNewContact() {
    if (checkValueInput()) return;

    // GASTMODUS-LOGIK
    if (isGuest()) {
        // Die Funktion pushNewContact fügt den Kontakt nur dem lokalen Array hinzu
        pushNewContact(); 
        renderContacts();
        closeOverlay();
        clearSuccessfulContainer();
        successfulAddContact();
        successChange();
        console.log("GASTMODUS: Neuer Kontakt wird nicht in der Datenbank gespeichert.");
        return; // Funktion beenden, keine Firebase-Aktion
    }

    // Original-Logik für echte Benutzer
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
 * Creates a new contact, assigns a sequential ID, and saves it to Firebase.
 * HINWEIS: Diese Funktion sollte vom "Create Contact"-Button im Overlay aufgerufen werden.
 * Beispiel: <button onclick="createNewContact()">Create Contact</button>
 */
async function createNewContact() {
    if (checkValueInput()) return; // Eingabevalidierung (unverändert)

    try {
        // 1. Holt die nächste freie ID von der Datenbank.
        const newContactId = await getNextId('/join/contacts');

        // 2. Holt die Eingabewerte.
        const { n: name, e: email, p: phone } = readsTheInputValues();
        const nameParts = name.trim().split(' ');

        // 3. Erstellt das neue Kontakt-Objekt mit der korrekten ID.
        const newContact = {
            id: newContactId,
            prename: nameParts.shift() || '',
            surname: nameParts.join(' ') || '',
            email: email,
            phone: phone,
            color: getUniqueAvatarColor() // Annahme: Diese Funktion existiert in contacts_services.js
        };

        // 4. Fügt den neuen Kontakt gezielt mit seiner ID hinzu.
        await addContact(newContact, newContactId);

        // 5. Lädt die Kontaktliste neu, um den neuen Eintrag zu erhalten.
        await loadContacts();

        // 6. UI aktualisieren und Erfolgsmeldung anzeigen.
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


// ===================================================================
// Restliche UI- und Validierungsfunktionen (unverändert)
// ===================================================================

function chooseContact(id) {
    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();
    userInfo(id);
}

/**
 * KORRIGIERT: Umbenannt, um Namenskonflikte zu vermeiden.
 * Öffnet das Overlay, um einen neuen Kontakt hinzuzufügen.
 * HINWEIS: Diese Funktion sollte vom "Add contact"-Button aufgerufen werden.
 * Beispiel: <button onclick="openNewContactDialog()">Add contact</button>
 */
function openNewContactDialog() {
    clerOverlay();
    openAddContact();
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
    let input = checkValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}

function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}

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

function errorMessage(key) {
    const messages = {
        "Contactname": "Please check your name entry!",
        "Email": "Please check your email entry!",
        "Phone": "Please check your phonenumber entry!"
    };
    return messages[key] || "Unknown error!";
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
    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(n)) return "Contactname";
    if (checkEmptyInput(e) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email";
    if (checkEmptyInput(p) || !/^[\d\s()+-]+$/.test(p)) return "Phone";
}


