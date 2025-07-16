/**
 * Base URL for Firebase Realtime Database.
 * @type {string}
 */
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * Loaded contacts stored in Firebase.
 * @type {Array<Object>}
 */
let contactsFirebase = [];


/**
 * Lädt Kontakte aus Firebase und weist sie `contactsFirebase` zu.
 * Diese Version filtert 'null'-Einträge heraus, die in Firebase existieren könnten.
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
  let response = await fetch(BASE_URL + "/join/contacts.json");
  if (response.ok) {
    let data = await response.json();
    let loadedContacts = Object.values(data || {});
    
    // Transformiert die geladenen Daten, um der lokalen Datenstruktur zu entsprechen.
    contactsFirebase = loadedContacts
      // WICHTIG: Diese Zeile filtert alle 'null'-Einträge heraus.
      .filter(contact => contact) 
      .map(contact => {
        // Dieser Code wird nur noch für gültige Kontakt-Objekte ausgeführt.
        const username = `${contact.prename || ''} ${contact.surename || ''}`.trim();
        
        return {
          ...contact,
          username: username
        };
      });

    renderAvatar();
  } else {
    contactsFirebase = [];
  }
}

/**
 * Renders avatar initials from usernames into `contactsFirebase` objects.
 */
function renderAvatar() {
 contactsFirebase.forEach(contact => {
  if (!contact.username){
  contact.avatar = "";
  return;
}

contact.avatar = contact.username
  .split(" ")
  .filter(name => name.length > 0)
  .map(name => name[0].toUpperCase())
  .join("");
});
} 

/**
 * Speichert `contactsFirebase` in Firebase mit einer spezifischen Struktur.
 * Es transformiert das lokale Kontaktobjekt vor dem Speichern.
 * Annahme: Das lokale Kontaktobjekt hat die Felder 'username', 'email', 'phone', 'mobile'.
 * @returns {Promise<void>}
 */
async function saveContactsToFirebase() {
  const contactsToSave = {};

  contactsFirebase.forEach((contact, index) => {
    // Teilt den vollen Benutzernamen in Vor- und Nachnamen auf.
    const nameParts = contact.username ? contact.username.split(" ") : [];
    const prename = nameParts[0] || ""; // Der erste Teil wird zum Vornamen
    const surname = nameParts.slice(1).join(" ") || ""; // Der Rest wird zum Nachnamen

    // Erstellt das neue Objekt mit der gewünschten Struktur.
    // Es ordnet die Felder aus dem lokalen `contact`-Objekt zu.
    const newContactObject = {
      id: index, // Verwendet den Array-Index als ID
      prename: prename,
      surname: surname,
      email: contact.email || "", // Annahme: 'email' existiert im lokalen Kontakt
      phone: contact.phone || "", // Annahme: 'phone' existiert im lokalen Kontakt
      mobile: contact.mobile || "" // Annahme: 'mobile' existiert im lokalen Kontakt
    };
    
    contactsToSave[index] = newContactObject;
  });

  // Verwendet PUT, um die gesamte Kontaktsammlung mit der neuen Struktur zu ersetzen.
  await fetch(BASE_URL + "/join/contacts.json", {
    method: 'PUT',
    body: JSON.stringify(contactsToSave),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


/**
 * Lädt Kontakte aus Firebase und weist sie `contactsFirebase` zu.
 * Es rekonstruiert das Feld `username` aus `prename` und `surename`
 * für die lokale Verwendung innerhalb der Anwendung.
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
  let response = await fetch(BASE_URL + "/join/contacts.json");
  if (response.ok) {
    let data = await response.json();
    let loadedContacts = Object.values(data || {});
    
    // Transformiert die geladenen Daten, um der lokalen Datenstruktur zu entsprechen.
    contactsFirebase = loadedContacts.map(contact => {
      // Rekonstruiert den Benutzernamen aus Vor- und Nachname
      const username = `${contact.prename || ''} ${contact.surename || ''}`.trim();
      
      // Gibt ein neues Objekt zurück, das den rekonstruierten Benutzernamen
      // und alle anderen Eigenschaften aus Firebase enthält.
      return {
        ...contact, // Beinhaltet id, prename, surename, email, phone, mobile
        username: username // Fügt das username-Feld für die lokale Logik hinzu
      };
    });

    renderAvatar(); // Diese Funktion wird nun wie erwartet funktionieren
  } else {
    contactsFirebase = [];
  }
}


/**
 * Saves user data from `userFirebase` to Firebase.
 * Falls back to `resetUserArray` on failure.
 * @returns {Promise<void>}
 */
async function saveUsersToFirebase() {
  const usersAsObject = {};
  userFirebase.forEach((user, index) => {
    usersAsObject[index] = { ...user };
  });
  try {
    await fetch(BASE_URL + "/join/users.json", {
      method: 'PUT',
      body: JSON.stringify(usersAsObject),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error when saving:", error.message);
    resetUserArray();
  }
}


/**
 * Sends a new or updated task to Firebase using PUT.
 * @param {string} path - Firebase path.
 * @param {Object} data - Task object to store.
 * @returns {Promise<void>}
 */
async function putDataToServer(path = "", data) {
  try {
    const response = await fetch(BASE_URL + path + ".json", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    successfulAddedTask();
  } catch (error) {
    showErrorAddedTask();
  }
  userFeedback();
}


/**
 * Sends partial updates to a task object using PATCH.
 * @param {string} path - Firebase path.
 * @param {Object} data - Data to patch.
 * @returns {Promise<void>}
 */
async function patchDataToServer(path = "", data) {
  try {
    await fetch(BASE_URL + path + ".json", {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('There was an error updating the data:', error);
  }
}


//  Get Data //
//ANCHOR - Get Data

/**
 * Loads tasks from server, parses them, and updates the task list.
/**
 * Loads data from a specified Firebase path.
 * @async
 * @param {string} [path=""] - The path to the data in Firebase.
 * @returns {Promise<Object|null>} The JSON data from Firebase, or null if the request fails.
 */
async function getDataFromServer(path = "") {
  try {
    let response = await fetch(BASE_URL + path + ".json");
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Could not fetch data from:", path);
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

/**
 * Constructs a task object from Firebase response data.
 * @param {number} index - Task index.
 * @param {Object} responseToJson - Parsed Firebase response.
 * @param {Array<string>} tasksKeysArray - Array of task keys.
 * @returns {Object} The constructed task object.
 */
function firbaseObject(index, responseToJson, tasksKeysArray) {
  return {
    title: responseToJson[tasksKeysArray[index]].title,
    descripton: responseToJson[tasksKeysArray[index]].descripton,
    date: responseToJson[tasksKeysArray[index]].date,
    category: responseToJson[tasksKeysArray[index]].category,
    priority: responseToJson[tasksKeysArray[index]].priority,
    subtask: arraySubtasks(index, responseToJson, tasksKeysArray),
    assignedTo: arrayAssignedTo(index, responseToJson, tasksKeysArray),
    id: tasksKeysArray[index],
    condition: responseToJson[tasksKeysArray[index]].condition
  };
}


/**
 * Deletes user entries from Firebase that no longer exist locally.
 * @async
 */
async function deleteNotFoundedUserFromTask() {
  for (let del of usersToDeleteFromFirebase) {
    await fetch(`${BASE_URL}/join/tasks/${del.taskKey}/assignedTo/${del.userKey}.json`, {
      method: "DELETE"
    });
  }
}

