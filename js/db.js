/**
 * Die Basis-URL für die Firebase Realtime Database.
 * @type {string}
 */
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";

// HINWEIS: Die globalen Arrays sind für andere Funktionen eventuell noch nützlich,
// aber die Lade-Funktionen sollten die Daten direkt zurückgeben.
let usersFirebase = [];
let contactsFirebase = [];

// =================================================================================
// GENERIC API FUNCTIONS
// =================================================================================

async function firebaseRequest(path, method = 'GET', body = null) {
    const url = `${BASE_URL}${path}.json`;
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (method === 'DELETE' || response.status === 204) return null;
        return await response.json();
    } catch (error) {
        console.error(`Firebase-Anfrage an ${path} fehlgeschlagen.`, error);
        throw error;
    }
}

// =================================================================================
// ID MANAGEMENT
// =================================================================================

async function getNextId(path) {
    try {
        const data = await firebaseRequest(path);
        if (!data) return 0;
        const items = Array.isArray(data) ? data : Object.values(data);
        if (items.length === 0) return 0;
        const maxId = items.reduce((max, item) => (item && item.id > max ? item.id : max), -1);
        return maxId + 1;
    } catch (error) {
        console.error(`Fehler beim Ermitteln der nächsten ID für ${path}:`, error);
        return 0;
    }
}

// =================================================================================
// USER FUNCTIONS (KORRIGIERT)
// =================================================================================

/**
 * Lädt alle Benutzer aus Firebase und GIBT SIE ZURÜCK.
 * @returns {Promise<Array<Object>>} Ein Array mit den Benutzerobjekten.
 */
async function loadUsers() {
    try {
        const data = await firebaseRequest("/join/users");
        console.log("Rohdaten von /join/users empfangen:", data);

        let loadedUsers = [];
        if (Array.isArray(data)) {
            loadedUsers = data.filter(Boolean);
        } else if (data) {
            loadedUsers = Object.values(data);
        }
        
        // Die globale Variable für andere Skripte aktualisieren (optional, aber sicher)
        usersFirebase = loadedUsers;
        // WICHTIG: Die geladenen Daten zurückgeben!
        return loadedUsers;
        
    } catch (error) {
        console.error("Fehler beim Laden der Benutzer:", error);
        usersFirebase = []; // Im Fehlerfall zurücksetzen
        return []; // Leeres Array im Fehlerfall zurückgeben
    }
}

async function addUser(user, id) {
    return firebaseRequest(`/join/users/${id}`, 'PUT', user);
}

// =================================================================================
// CONTACTS FUNCTIONS (KORRIGIERT)
// =================================================================================

/**
 * Lädt alle Kontakte aus Firebase und GIBT SIE ZURÜCK.
 * @returns {Promise<Array<Object>>} Ein Array mit den Kontaktobjekten.
 */
async function loadContacts() {
    try {
        const data = await firebaseRequest("/join/contacts");
        console.log("Rohdaten von /join/contacts empfangen:", data);

        let loadedContacts = [];
        if (data) {
            const items = Array.isArray(data) ? data : Object.values(data);
            loadedContacts = items
                .filter(contact => contact)
                .map(contact => ({
                    ...contact,
                    username: `${contact.prename || ''} ${contact.surname || ''}`.trim()
                }));
        }
        
        contactsFirebase = loadedContacts;
        return loadedContacts;

    } catch (error) {
        console.error("Fehler beim Laden der Kontakte:", error);
        contactsFirebase = [];
        return [];
    }
}

async function addContact(contactData, id) {
    return firebaseRequest(`/join/contacts/${id}`, 'PUT', contactData);
}






