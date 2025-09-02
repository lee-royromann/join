/**
 * The base URL for the Firebase Realtime Database.
 * @type {string}
 */
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";

// Global variables in case other scripts need them.
// However, it is better if functions obtain the data directly from the loading functions.
let usersFirebase = [];
let contactsFirebase = [];

// =================================================================================
// GENERIC API FUNCTION
// =================================================================================

/**
 * Sends a request to the Firebase Realtime Database.
 * @param {string} path - The path to the resource (e.g. '/join/users').
 * @param {string} [method='GET'] - The HTTP method.
 * @param {Object|null} [body=null] - The body to send (will be converted to JSON).
 * @returns {Promise<any>} The result of the request.
 */
async function firebaseRequest(path, method = 'GET', body = null) {
    // The central firewall for guest mode
    const isWriteOperation = method !== 'GET';
    const isCreatingContact = method === 'PUT' && path.startsWith('/join/contacts/');
    const isDeletingContact = method === 'DELETE' && path.startsWith('/join/contacts/');

    /*if (isGuest() && isWriteOperation && !isCreatingContact && !isDeletingContact) {
        // console.log(`%c[GUEST MODE] Blocked a "${method}" request to "${path}".`, 'color: orange; font-weight: bold;');
        // The request is stopped here and never reaches Firebase.
        return Promise.resolve({ success: false, reason: "Guest mode is read-only" });
    }*/

    // Ensures that the path does not start with a slash...
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
            // Throws an error if the response was not successful.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Return null for DELETE or empty content (204).
        if (method === 'DELETE' || response.status === 204) {
            return null;
        }
        // Attempts to parse the response as JSON.
        return await response.json();
    } catch (error) {
        console.error(`Firebase request to '${path}' failed.`, error);
        // Rethrows the error so the calling function can handle it.
        throw error;
    }
}

// =================================================================================
// ID MANAGEMENT
// =================================================================================

/**
 * Determines the next available numeric ID for a given path.
 * This function is robust and provides a safe fallback value in case of errors.
 * @param {string} path - The Firebase path (e.g. '/join/users').
 * @returns {Promise<number>} The next available ID.
 */
async function getNextId(path) {
    let nextId; // Variable to store the result

    try {
        const data = await firebaseRequest(path);

        if (!data) {
            nextId = 0; // If the path does not exist, the first ID is 0
        } else {
            const items = Object.values(data);
            if (items.length === 0) {
                nextId = 0; // If the path is empty, the first ID is 0
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
        console.error(`Error while determining the next ID for '${path}':`, error);
        nextId = 0; // Safe fallback value in case of an error
    }

    // FINAL SAFETY NET: Ensures that 'undefined' is never returned.
    if (nextId === undefined || nextId === null || isNaN(nextId)) {
        const errorMsg = `FATAL: getNextId for path '${path}' could not determine a valid ID. Result was: ${nextId}`;
        console.error(errorMsg);
        return 0; // Returns a guaranteed safe value to prevent a crash.
    }

    // console.log(`[getNextId] Successfully determined ID for path '${path}': ${nextId}`);
    return nextId;
}

// =================================================================================
// USER FUNCTIONS
// =================================================================================

/**
 * Loads all users from Firebase and stores them in a global variable.
 * @returns {Promise<Array<Object>>} An array with the user objects.
 */
async function loadUsers() {
    try {
        const data = await firebaseRequest("/join/users");
        const loadedUsers = data ? Object.values(data) : [];
        usersFirebase = loadedUsers;
        return loadedUsers;
    } catch (error) {
        console.error("Error while loading users:", error);
        usersFirebase = [];
        return [];
    }
}

/**
 * Adds a new user with a specific ID.
 * Throws an error if the ID is invalid.
 * @param {Object} user - The user object.
 * @param {number|string} id - The ID under which the user will be saved.
 * @returns {Promise<any>} The result of the Firebase request.
 */
async function addUser(user, id) {
    if (id === undefined || id === null) {
        const errorMsg = `FATAL: addUser was called with an invalid ID: ${id}`;
        console.error(errorMsg, user);
        throw new Error(errorMsg);
    }
    return firebaseRequest(`/join/users/${id}`, 'PUT', user);
}

// =================================================================================
// CONTACT FUNCTIONS
// =================================================================================

/**
 * Loads all contacts from Firebase.
 * In guest mode, sensitive data such as email and phone number will be masked.
 * @returns {Promise<Array<Object>>} An array with the processed contact objects.
 */
async function loadContacts() {
    try {
        const data = await firebaseRequest("/join/contacts");
        let loadedContacts = data ? Object.values(data) : [];

        // If guest mode is active, mask the data
        /*
        if (isGuest()) {
            loadedContacts = loadedContacts.map(contact => {
                if (!contact) return null; // Skip empty entries
                return {
                    ...contact,
                    email: 'guest@example.com', // Valid but useless format
                    phone: '0123 45678910' // Valid but useless format
                };
            }).filter(Boolean); // Removes possible null entries
        }
        */
        const contactsWithUsername = loadedContacts
            .filter(contact => contact)
            .map(contact => ({
                ...contact,
                username: `${contact.prename || ''} ${contact.surname || ''}`.trim()
            }));

        contactsFirebase = contactsWithUsername;
        return contactsWithUsername;

    } catch (error) {
        console.error("Error while loading contacts:", error);
        contactsFirebase = [];
        return [];
    }
}

/**
 * Adds a new contact with a specific ID.
 * Throws an error if the ID is invalid.
 * @param {Object} contactData - The contact object.
 * @param {number|string} id - The ID under which the contact will be saved.
 * @returns {Promise<any>} The result of the Firebase request.
 */
async function addContact(contactData, id) {
    if (id === undefined || id === null) {
        const errorMsg = `FATAL: addContact was called with an invalid ID: ${id}`;
        console.error(errorMsg, contactData);
        throw new Error(errorMsg);
    }
    return firebaseRequest(`/join/contacts/${id}`, 'PUT', contactData);
}

/**
 * Checks whether guest mode is active in sessionStorage.
 * @returns {boolean} True if the user is a guest.
 */
function isGuest() {
    return sessionStorage.getItem('userMode') === 'guest';
}
