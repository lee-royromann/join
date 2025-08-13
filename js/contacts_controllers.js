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
 * NEU & ROBUST: Löscht einen Kontakt und den zugehörigen User-Account.
 * Holt alle benötigten Daten direkt aus Firebase, um Fehler zu minimieren.
 * Enthält Diagnose-Logs zur Fehlersuche.
 * @param {Event} event - Das auslösende Event.
 * @param {number|string} contactId - ID des zu löschenden Kontakts.
 */
async function deleteContact(event, contactId) {
    suppressActionEvent(event);
    console.log(`--- deleteContact gestartet für contactId: ${contactId} ---`);

    try {
        // Schritt 1: E-Mail des eingeloggten Benutzers holen
        const loggedInUserEmail = getLoggedInUserEmail();
        console.log('Diagnose 1: E-Mail des eingeloggten Benutzers:', loggedInUserEmail);

        if (!loggedInUserEmail) {
            console.error('Fehler: E-Mail des eingeloggten Benutzers konnte nicht aus dem localStorage gelesen werden.');
            alert('Sicherheitsfehler: Ihre Sitzung ist ungültig. Bitte neu anmelden.');
            return;
        }

        // Schritt 2: Kontaktdaten direkt aus Firebase holen, um die E-Mail zu bekommen
        console.log(`Diagnose 2: Rufe Kontaktdaten für ID ${contactId} aus Firebase ab...`);
        const contactToDelete = await firebaseRequest(`/join/contacts/${contactId}`, 'GET');
        console.log('Diagnose 3: Antwort von Firebase für den Kontakt:', contactToDelete);

        if (!contactToDelete || !contactToDelete.email) {
            console.error(`Fehler: Kontakt mit ID ${contactId} oder dessen E-Mail wurde in Firebase nicht gefunden.`);
            await loadContacts();
            await renderContacts();
            return;
        }
        const contactEmail = contactToDelete.email;
        console.log(`Diagnose 4: E-Mail des zu löschenden Kontakts ist "${contactEmail}"`);

        // Schritt 3: Den Kontakt-Eintrag löschen
        await firebaseRequest(`/join/contacts/${contactId}`, 'DELETE');
        console.log(`Diagnose 5: Kontakt-Eintrag mit ID ${contactId} wurde in Firebase gelöscht.`);

        // Schritt 4: Prüfen, ob der Benutzer sich selbst löscht (Vergleich der E-Mails)
        console.log(`Diagnose 6: Vergleiche "${loggedInUserEmail}" mit "${contactEmail}"`);
        if (loggedInUserEmail === contactEmail) {
            console.log('%cDiagnose 7: Selbst-Löschung ERKANNT! User-Account wird jetzt gesucht und gelöscht.', 'color: orange; font-weight: bold;');

            const userIdToDelete = await findUserIdByEmail(contactEmail);

            if (userIdToDelete) {
                await firebaseRequest(`/join/users/${userIdToDelete}`, 'DELETE');
                console.log(`%cDiagnose 8: User-Account mit ID ${userIdToDelete} wurde gelöscht.`, 'color: green; font-weight: bold;');
            } else {
                console.warn(`Diagnose 8: Kein passender User-Account für E-Mail ${contactEmail} gefunden.`);
            }

            console.log('Diagnose 9: Führe Logout durch und leite zur Login-Seite weiter.');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserId');
            window.location.href = '/index.html'; // <-- WICHTIG: PFAD ANPASSEN!
            return;
        }

        console.log('Diagnose 7: Keine Selbst-Löschung. Aktualisiere nur die Kontaktliste.');
        await loadContacts();
        await renderContacts();
        clearMainContact();
        successfulDeleteContact();
        successChange();

    } catch (error) {
        console.error('FATALER FEHLER im deleteContact-Prozess:', error);
        alert("Ein unerwarteter Fehler ist aufgetreten. Der Vorgang wurde abgebrochen.");
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


/**
 * HILFSFUNKTION: Findet eine User-ID in der `/join/users` Collection basierend auf der E-Mail-Adresse.
 */
async function findUserIdByEmail(email) {
    console.log(`--- findUserIdByEmail gestartet für E-Mail: ${email} ---`);
    try {
        const users = await firebaseRequest('/join/users', 'GET');
        if (!users) {
            console.warn('Antwort von /join/users war leer oder null.');
            return null;
        }
        console.log('Gefundene User-Daten:', users);
        for (const userId in users) {
            if (users[userId].email === email) {
                console.log(`Passender User gefunden! ID: ${userId}`);
                return userId;
            }
        }
        console.warn('Kein User mit passender E-Mail in den Daten gefunden.');
        return null;
    } catch (error) {
        console.error("Fehler bei der Suche nach dem Benutzer via E-Mail:", error);
        return null;
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


