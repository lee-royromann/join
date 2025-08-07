/**
 * Die Basis-URL für die Firebase Realtime Database.
 * @type {string}
 */
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";

// Globale Variablen für den Fall, dass andere Skripte sie benötigen.
// Es ist jedoch besser, wenn Funktionen die Daten direkt von den Ladefunktionen erhalten.
let usersFirebase = [];
let contactsFirebase = [];

// =================================================================================
// GENERISCHE API-FUNKTION
// =================================================================================

/**
 * Sendet eine Anfrage an die Firebase Realtime Database.
 * @param {string} path - Der Pfad zur Ressource (z.B. '/join/users').
 * @param {string} [method='GET'] - Die HTTP-Methode.
 * @param {Object|null} [body=null] - Der zu sendende Body (wird in JSON umgewandelt).
 * @returns {Promise<any>} Das Ergebnis der Anfrage.
 */
async function firebaseRequest(path, method = 'GET', body = null) {
    // Stellt sicher, dass der Pfad nicht mit einem Slash beginnt, um doppelte Slashes zu vermeiden.
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const url = `${BASE_URL}${cleanPath}.json`;

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // Wirft einen Fehler, wenn die Antwort nicht erfolgreich war.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Bei DELETE oder leerem Inhalt (204) null zurückgeben.
        if (method === 'DELETE' || response.status === 204) {
            return null;
        }
        // Versucht, die Antwort als JSON zu parsen.
        return await response.json();
    } catch (error) {
        console.error(`Firebase-Anfrage an '${path}' fehlgeschlagen.`, error);
        // Wirft den Fehler weiter, damit die aufrufende Funktion ihn behandeln kann.
        throw error;
    }
}

// =================================================================================
// ID-VERWALTUNG (PRODUKTIVE VERSION MIT SICHERHEITSNETZ)
// =================================================================================

/**
 * Ermittelt die nächste freie numerische ID für einen gegebenen Pfad.
 * Diese Funktion ist jetzt maximal robust und kann kein 'undefined' zurückgeben.
 * @param {string} path - Der Firebase-Pfad (z.B. '/join/users').
 * @returns {Promise<number>} Die nächste verfügbare ID.
 */
async function getNextId(path) {
    let nextId; // Variable, um das Ergebnis zu speichern

    try {
        const data = await firebaseRequest(path);

        if (!data) {
            nextId = 0; // Wenn der Pfad nicht existiert, ist die erste ID 0
        } else {
            const items = Object.values(data);
            if (items.length === 0) {
                nextId = 0; // Wenn der Pfad leer ist, ist die erste ID 0
            } else {
                const maxId = items.reduce((max, item) => {
                    if (typeof item === 'object' && item !== null && typeof item.id !== 'undefined') {
                        const currentId = parseInt(item.id, 10);
                        if (!isNaN(currentId) && currentId > max) {
                            return currentId;
                        }
                    }
                    return max;
                }, -1);
                nextId = maxId + 1;
            }
        }
    } catch (error) {
        console.error(`Fehler beim Ermitteln der nächsten ID für '${path}':`, error);
        nextId = 0; // Sicherer Fallback-Wert bei einem Fehler
    }

    // FINALES SICHERHEITSNETZ: Stellt sicher, dass niemals 'undefined' zurückgegeben wird.
    if (nextId === undefined || nextId === null || isNaN(nextId)) {
        const errorMsg = `FATAL: getNextId für Pfad '${path}' konnte keine gültige ID ermitteln. Ergebnis war: ${nextId}`;
        console.error(errorMsg);
        return 0; // Gibt einen absolut sicheren Wert zurück, um einen Absturz zu verhindern.
    }

    console.log(`[getNextId] Erfolgreich ID für Pfad '${path}' ermittelt: ${nextId}`);
    return nextId;
}


// =================================================================================
// BENUTZER-FUNKTIONEN (MIT ID-PRÜFUNG)
// =================================================================================

/**
 * Lädt alle Benutzer aus Firebase.
 * @returns {Promise<Array<Object>>} Ein Array mit den Benutzerobjekten.
 */
async function loadUsers() {
    try {
        const data = await firebaseRequest("/join/users");
        const loadedUsers = data ? Object.values(data) : [];
        usersFirebase = loadedUsers;
        return loadedUsers;
    } catch (error) {
        console.error("Fehler beim Laden der Benutzer:", error);
        usersFirebase = [];
        return [];
    }
}

/**
 * Fügt einen neuen Benutzer mit einer spezifischen ID hinzu.
 * @param {Object} user - Das Benutzerobjekt.
 * @param {number|string} id - Die ID, unter der der Benutzer gespeichert wird.
 */
async function addUser(user, id) {
    if (id === undefined || id === null) {
        const errorMsg = `FATAL: addUser wurde mit einer ungültigen ID aufgerufen: ${id}`;
        console.error(errorMsg, user);
        throw new Error(errorMsg);
    }
    return firebaseRequest(`/join/users/${id}`, 'PUT', user);
}

// =================================================================================
// KONTAKT-FUNKTIONEN (MIT ID-PRÜFUNG)
// =================================================================================

/**
 * Lädt alle Kontakte aus Firebase.
 * @returns {Promise<Array<Object>>} Ein Array mit den Kontaktobjekten.
 */
async function loadContacts() {
    try {
        const data = await firebaseRequest("/join/contacts");
        const loadedContacts = data ? Object.values(data) : [];

        const contactsWithUsername = loadedContacts
            .filter(contact => contact)
            .map(contact => ({
                ...contact,
                username: `${contact.prename || ''} ${contact.surname || ''}`.trim()
            }));

        contactsFirebase = contactsWithUsername;
        return contactsWithUsername;

    } catch (error) {
        console.error("Fehler beim Laden der Kontakte:", error);
        contactsFirebase = [];
        return [];
    }
}

/**
 * Fügt einen neuen Kontakt mit einer spezifischen ID hinzu.
 * @param {Object} contactData - Das Kontaktobjekt.
 * @param {number|string} id - Die ID, unter der der Kontakt gespeichert wird.
 */
async function addContact(contactData, id) {
    if (id === undefined || id === null) {
        const errorMsg = `FATAL: addContact wurde mit einer ungültigen ID aufgerufen: ${id}`;
        console.error(errorMsg, contactData);
        throw new Error(errorMsg);
    }
    return firebaseRequest(`/join/contacts/${id}`, 'PUT', contactData);
}







