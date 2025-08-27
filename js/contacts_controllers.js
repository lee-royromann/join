// ===================================================================
// HINWEIS:
// Diese Datei wurde angepasst, um mit der neuen, sauberen `db.js` zu funktionieren.
// Sie benötigt Zugriff auf: `loadContacts()`, `addContact()`, `getNextId()`
// ===================================================================


/**
 * Initialisiert die Kontaktseite, lädt die Kontaktdaten und rendert die Benutzeroberfläche.
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
 * Rendert alle Kontakte, gruppiert nach Initialen.
 */
async function renderContacts() {
    cleanContactsList(); // Annahme: Diese Funktion existiert.
    groupInitials();     // Annahme: Diese Funktion existiert.
}


/**
 * Speichert die Änderungen an einem bestehenden Kontakt.
 * @param {string|number} id - Die ID des zu speichernden Kontakts.
 */
async function saveContact(id) {
     if (checkEditValueInput()) return;
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
 * Löscht einen Kontakt und, falls es der eigene Account ist, auch den zugehörigen Benutzer-Account.
 * Holt die User-ID sicher aus dem localStorage.
 * @param {Event} event - Das auslösende Event.
 * @param {string} contactId - Die ID des zu löschenden Kontakts.
 */
async function deleteContact(event, contactId) {
    // NEU: Prüfung, ob der Benutzer ein Gast ist.
    /*if (isGuest()) {
        // Optional: Eine Meldung an den Gast, dass die Aktion nicht erlaubt ist.
        alert('As a guest, you are not permitted to delete contacts.');
        return; // Die Funktion wird hier sofort beendet.
    }*/

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
        // console.log(`Kontakt mit ID ${contactId} wurde gelöscht.`);

        // Prüfen, ob der Benutzer sich selbst löscht
        if (loggedInUserEmail && loggedInUserEmail === contactToDelete.email) {
            // console.log('%cSelbst-Löschung erkannt! Zugehöriger User-Account wird jetzt gelöscht.', 'color: orange; font-weight: bold;');

            const userIdToDelete = localStorage.getItem('currentUserId');
            // console.log(`User-ID aus localStorage geholt: "${userIdToDelete}"`);

            if (userIdToDelete) {
                // User-Account löschen
                await firebaseRequest(`/join/users/${userIdToDelete}`, 'DELETE');
                // console.log(`%cUser-Account mit ID ${userIdToDelete} wurde erfolgreich gelöscht.`, 'color: green; font-weight: bold;');
            } else {
                console.warn('FEHLER: Konnte User-ID nicht aus localStorage lesen. User-Account wurde NICHT gelöscht.');
            }

            // Logout durchführen
            // console.log('Führe Logout durch...');
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
 * Hilfsfunktion: Ruft die E-Mail des aktuell eingeloggten Benutzers aus dem localStorage ab.
 * @returns {string|null} Die E-Mail des Benutzers oder null, wenn nicht gefunden.
 */
function getLoggedInUserEmail() {
    return localStorage.getItem('currentUserEmail');
}


// ===================================================================
// Restliche UI- und Validierungsfunktionen
// ===================================================================


/**
 * Wählt einen Kontakt aus, hebt ihn hervor und zeigt seine Details an.
 * @param {string|number} id - Die ID des ausgewählten Kontakts.
 */
function chooseContact(id) {
    resetClassChooseContact();
    setClassChoooseContact(id);
    clearMainContact();
    userInfo(id);
}


/**
 * Öffnet den Dialog zum Erstellen eines neuen Kontakts.
 */
function openNewContactDialog() {
    const overlayContainer = document.getElementById('overlayContact');
    if (!overlayContainer) return;
   
    overlayContainer.innerHTML = showOverlayAddContact();
    
    // Mache das neu geladene Overlay sofort sichtbar
    openOverlay();
}


/**
 * Öffnet den Dialog zum Bearbeiten eines bestehenden Kontakts.
 * @param {string|number} id - Die ID des zu bearbeitenden Kontakts.
 */
function editContact(id) {
    clerOverlay();
    openEditContact(id);
    openOverlay();
}


/**
 * Öffnet den responsiven Dialog zum Hinzufügen eines neuen Kontakts.
 */
function addRespContact() {
    clerOverlay();
    openAddRespContact();
    openOverlay();
}


/**
 * Öffnet den responsiven Dialog zum Bearbeiten eines Kontakts.
 * @param {string|number} id - Die ID des zu bearbeitenden Kontakts.
 */
function editRespContact(id) {
    clerOverlay();
    openEditRespContact(id);
    openOverlay();
    closeToolsresp();
}


/**
 * Passt die Ansicht für mobile Geräte an, um die Benutzerinformationen anzuzeigen.
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
 * Stellt die Ansicht für mobile Geräte wieder her, um die Kontaktliste anzuzeigen.
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
 * Überprüft die Eingabewerte des Formulars und zeigt bei Bedarf Fehler an.
 * @returns {boolean} `true`, wenn ein Fehler vorliegt, sonst `false`.
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
 * Zeigt eine Fehlermeldung für ein bestimmtes Eingabefeld an.
 * @param {string} inputLabel - Der Name des fehlerhaften Feldes (z.B. "Email").
 */
function inputError(inputLabel) {
    let info = document.getElementById('poppin');
    info.classList.remove('opacity');
    info.innerHTML = errorMessage(inputLabel);
    errorInputField(inputLabel);
}


/**
 * Entfernt alle Fehlermeldungen und Markierungen von den Formularfeldern.
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
 * Gibt eine spezifische Fehlermeldung für ein bestimmtes Feld zurück.
 * @param {string} key - Der Schlüssel des Feldes ("Contactname", "Email", "Phone").
 * @returns {string} Die entsprechende Fehlermeldung.
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
 * Markiert ein Eingabefeld visuell als fehlerhaft.
 * @param {string} inputLabel - Der Name des zu markierenden Feldes.
 */
function errorInputField(inputLabel) {
    const label = document.getElementById('label' + inputLabel);
    if (label) {
        label.classList.add('error-border');
    }
}


/**
 * Überprüft, ob ein Wert leer ist oder nur aus Leerzeichen besteht.
 * @param {string} value - Der zu prüfende Wert.
 * @returns {boolean} `true`, wenn der Wert leer ist, sonst `false`.
 */
function checkEmptyInput(value) {
    return value.trim() === "";
}


/**
 * Liest die aktuellen Werte aus den Formularfeldern.
 * @returns {Object} Ein Objekt mit den Werten für Name (n), E-Mail (e) und Telefon (p).
 */
function readsTheInputValues() {
    return {
        n: document.getElementById('contactname').value,
        e: document.getElementById('email').value,
        p: document.getElementById('phone').value
    };
}


// +++ NEUE FUNKTION HINZUGEFÜGT +++
/**
 * Validiert die Werte aus den Formularfeldern beim Erstellen eines neuen Kontakts.
 * Alle Felder sind erforderlich.
 * @returns {string|undefined} Der Name des ersten ungültigen Feldes oder `undefined`.
 */
function checkValues() {
    let { n, e, p } = readsTheInputValues();
    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(n)) return "Contactname";
    if (checkEmptyInput(e) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email";
    // Stellt sicher, dass das Telefonfeld nicht leer ist und nur gültige Zeichen enthält
    if (checkEmptyInput(p) || !/^[\d\s()+-]+$/.test(p)) return "Phone"; 
}


/**
 * Validiert die Werte aus den Formularfeldern beim Bearbeiten.
 * Die Telefonnummer ist optional, wird aber auf Format geprüft, wenn sie eingegeben wird.
 * @returns {string|undefined} Der Name des ersten ungültigen Feldes oder `undefined`.
 */
function checkEditValues() {
    let { n, e, p } = readsTheInputValues();
    if (checkEmptyInput(n) || !/^[a-zA-ZäöüÄÖÜß\s]+$/.test(n)) return "Contactname";
    if (checkEmptyInput(e) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email";
    if (!checkEmptyInput(p) && !/^[\d\s()+-]+$/.test(p)) return "Phone";
}


/**
 * Prüft die Formulareingaben beim Bearbeiten auf Gültigkeit. Wenn ein Fehler gefunden wird,
 * wird eine Fehlermeldung angezeigt.
 * @returns {boolean} `true`, wenn ein Eingabefehler vorliegt, andernfalls `false`.
 */
function checkEditValueInput() {
    let input = checkEditValues();
    if (input) {
        inputError(input);
        return true;
    }
    return false;
}