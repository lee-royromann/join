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


/**
 * KORRIGIERT: Speichert die Änderungen an einem bestehenden Kontakt.
 * @param {string|number} id - Die ID des zu speichernden Kontakts.
 */
async function saveContact(id) {
    // 1. Lokale Daten im 'contactsFirebase'-Array aktualisieren.
    updateUserData(id); // Aktualisiert den Kontakt im lokalen Array

    // 2. Den aktualisierten Kontakt finden, um ihn zu speichern.
    const contactToSave = findContact(id);
    if (!contactToSave) {
        console.error(`Konnte Kontakt mit ID ${id} nicht zum Speichern finden.`);
        return;
    }

    try {
        // 3. Den einzelnen Kontakt gezielt in Firebase mit seiner ID überschreiben.
        await firebaseRequest(`/join/contacts/${id}`, 'PUT', contactToSave);

        // 4. UI aktualisieren
        await renderContacts();
        clearMainContact();
        closeOverlay();

        // 5. Erfolgsmeldung anzeigen
        clearSuccessfulContainer();
        successfulAddContact(); // Zeigt "Contact successfully created" an.
        successChange();

    } catch (error) {
        console.error("Fehler beim Speichern des Kontakts:", error);
        alert("Der Kontakt konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.");
    }
}


/**
 * FINAL & KORREKT: Löscht Kontakt & User-Account.
 * Holt die User-ID direkt aus dem localStorage, statt sie unsicher zu suchen.
 * @param {Event} event
 * @param {string} contactId
 */
async function deleteContact(event, contactId) {
    suppressActionEvent(event);
    console.log(`--- deleteContact gestartet für contactId: ${contactId} ---`);

    try {
        const loggedInUserEmail = getLoggedInUserEmail();
        const contactToDelete = await firebaseRequest(`/join/contacts/${contactId}`, 'GET');

        if (!contactToDelete) {
            console.error(`Fehler: Kontakt mit ID ${contactId} wurde in Firebase nicht gefunden.`);
            return;
        }

        // Kontakt-Eintrag löschen
        await firebaseRequest(`/join/contacts/${contactId}`, 'DELETE');
        console.log(`Kontakt mit ID ${contactId} wurde gelöscht.`);

        // Prüfen, ob der Benutzer sich selbst löscht
        if (loggedInUserEmail && loggedInUserEmail === contactToDelete.email) {
            console.log('%cSelbst-Löschung erkannt! Zugehöriger User-Account wird jetzt gelöscht.', 'color: orange; font-weight: bold;');

            // KORREKTUR: ID direkt aus dem Speicher holen, statt zu suchen
            const userIdToDelete = localStorage.getItem('currentUserId');
            console.log(`User-ID aus localStorage geholt: "${userIdToDelete}"`);

            if (userIdToDelete) {
                // User-Account löschen
                await firebaseRequest(`/join/users/${userIdToDelete}`, 'DELETE');
                console.log(`%cUser-Account mit ID ${userIdToDelete} wurde erfolgreich gelöscht.`, 'color: green; font-weight: bold;');
            } else {
                console.warn('FEHLER: Konnte User-ID nicht aus localStorage lesen. User-Account wurde NICHT gelöscht.');
            }

            // Logout durchführen
            console.log('Führe Logout durch...');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('username');
            localStorage.removeItem('loggedIn');
            window.location.href = '/index.html'; // Pfad zur Login-Seite anpassen
            return;
        }

        // UI aktualisieren, wenn ein anderer Kontakt gelöscht wurde
        await loadContacts();
        await renderContacts();
        clearMainContact();
        successfulDeleteContact();
        successChange();

    } catch (error) {
        console.error('FATALER FEHLER im deleteContact-Prozess:', error);
        alert("Ein unerwarteter Fehler ist aufgetreten.");
    }
}


/**
 * Creates a new contact, assigns a sequential ID, and saves it to Firebase.
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
 * HILFSFUNKTION: Ruft die E-Mail des aktuell eingeloggten Benutzers ab.
 */
function getLoggedInUserEmail() {
    return localStorage.getItem('currentUserEmail');
}


// Die Funktion "findUserIdByEmail" wurde entfernt, da sie fehlerhaft und unnötig war.


// ===================================================================
// Restliche UI- und Validierungsfunktionen (unverändert)
// ===================================================================

function chooseContact(id) {
    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();
    userInfo(id);
}

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

