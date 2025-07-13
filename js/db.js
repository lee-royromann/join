/**
 * =================================================================================
 * Firebase-Datenbankmodul (db.js) - Vollständige & Sichere Version
 * =================================================================================
 *
 * Dieses Skript ersetzt die ursprüngliche db.js vollständig. Es ist für eine
 * sichere Mehrbenutzer-Anwendung konzipiert und erfordert Firebase Authentication.
 *
 */

/**
 * Basis-URL für Ihre Firebase Realtime Database.
 * @type {string}
 */
const BASE_URL = "https://join-472-default-rtdb.europe-west1.firebasedatabase.app/";


// =================================================================================
// SECTION 1: Kernfunktionen für die Authentifizierung & Datenbank-Interaktion
// Diese Hilfsfunktionen bilden die sichere Grundlage für alle Operationen.
// =================================================================================

/**
 * Ruft die ID des aktuell angemeldeten Benutzers von Firebase Auth ab.
 * Dies ist entscheidend für die Datensicherheit.
 * @returns {string|null} Die UID des Benutzers oder null.
 */
function getCurrentUserId() {
  const user = firebase.auth().currentUser;
  if (user) {
    return user.uid;
  } else {
    console.error("Datenbankoperation fehlgeschlagen: Kein Benutzer angemeldet.");
    return null;
  }
}

/**
 * Holt Daten für den angemeldeten Benutzer von einem bestimmten Pfad.
 * @param {string} path - Der Pfad zur Sammlung (z.B. 'contacts' oder 'tasks').
 * @returns {Promise<Object|null>} Die Daten als Objekt oder null bei einem Fehler.
 */
async function fetchData(path) {
  const userId = getCurrentUserId();
  if (!userId) return null;
  try {
    const response = await fetch(`${BASE_URL}users/${userId}/${path}.json`);
    if (!response.ok) throw new Error(`Server-Fehler: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Fehler beim Laden von '${path}':`, error);
    return null;
  }
}

/**
 * Sendet Daten an die Datenbank, um einen neuen Eintrag mit einer einzigartigen ID zu erstellen.
 * @param {string} path - Der Pfad zur Sammlung (z.B. 'contacts').
 * @param {Object} data - Das zu speichernde Objekt.
 * @returns {Promise<Object|null>} Die Antwort von Firebase.
 */
async function postData(path, data) {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return await fetch(`${BASE_URL}users/${userId}/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * Aktualisiert Teile eines bestehenden Eintrags in der Datenbank.
 * @param {string} path - Der vollständige Pfad zum Eintrag (z.B. 'tasks/TASK_ID').
 * @param {Object} data - Die zu aktualisierenden Felder.
 * @returns {Promise<Object|null>}
 */
async function patchData(path, data) {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return await fetch(`${BASE_URL}users/${userId}/${path}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * Löscht einen Eintrag aus der Datenbank.
 * @param {string} path - Der vollständige Pfad zum Eintrag.
 * @returns {Promise<Object|null>}
 */
async function deleteData(path) {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return await fetch(`${BASE_URL}users/${userId}/${path}.json`, {
    method: 'DELETE'
  });
}


// =================================================================================
// SECTION 2: Anwendungslogik für Kontakte & Aufgaben
// Diese Funktionen verwenden die sicheren Kernfunktionen von oben.
// =================================================================================

// Globale Variablen für die zwischengespeicherten Daten des Benutzers
let userContacts = [];
let userTasks = [];

/**
 * Lädt die Kontakte des angemeldeten Benutzers aus Firebase,
 * konvertiert sie in ein Array und generiert die Avatare.
 * Ersetzt `loadContactsFromFirebase` und `renderAvatar`.
 */
async function loadUserContacts() {
  const contactsData = await fetchData('contacts');
  if (contactsData) {
    // Konvertiert das Firebase-Objekt in ein Array und fügt die ID hinzu
    userContacts = Object.keys(contactsData).map(key => ({
      id: key,
      ...contactsData[key]
    }));
    // Generiert die Avatare für jeden Kontakt
    userContacts.forEach(contact => {
      contact.avatar = contact.username
        .split(" ")
        .map(name => name[0].toUpperCase())
        .join("");
    });
  } else {
    userContacts = [];
  }
  console.log('Benutzerkontakte geladen:', userContacts);
  // Hier können Sie Ihre UI-Rendering-Funktion aufrufen
}

/**
 * Fügt einen neuen Kontakt für den angemeldeten Benutzer hinzu.
 * Ersetzt die unsichere `saveContactsToFirebase`-Funktion.
 * @param {Object} contact - Das Kontaktobjekt (z.B. {username: 'Max Mustermann', ...}).
 */
async function addNewContact(contact) {
  await postData('contacts', contact);
  await loadUserContacts(); // Lädt die Kontaktliste neu, um die UI zu aktualisieren
}


/**
 * Lädt die Aufgaben des angemeldeten Benutzers aus Firebase.
 * Ersetzt `getDataFromServer`.
 */
async function loadUserTasks() {
  const tasksData = await fetchData('tasks');
  if (tasksData) {
    userTasks = Object.keys(tasksData).map(key => {
      const task = tasksData[key];
      // Logik von `firbaseObject` hier integriert:
      return {
        id: key,
        title: task.title,
        descripton: task.descripton,
        date: task.date,
        category: task.category,
        priority: task.priority,
        // Stellt sicher, dass subtask und assignedTo immer Arrays sind
        subtask: task.subtask ? Object.values(task.subtask) : [],
        assignedTo: task.assignedTo ? Object.values(task.assignedTo) : [],
        condition: task.condition
      };
    });
  } else {
    userTasks = [];
  }
  console.log('Benutzeraufgaben geladen:', userTasks);
  // Hier Ihre UI-Rendering-Funktion aufrufen, z.B. renderTaskInToColumn()
}

/**
 * Fügt eine neue Aufgabe hinzu oder aktualisiert eine bestehende.
 * Ersetzt `putDataToServer`.
 * @param {string} taskId - Die ID der Aufgabe. Wenn null, wird eine neue Aufgabe erstellt.
 * @param {Object} data - Die Aufgabendaten.
 */
async function saveTask(taskId, data) {
  try {
    if (taskId) {
      // Aktualisiert eine bestehende Aufgabe
      await patchData(`tasks/${taskId}`, data);
    } else {
      // Erstellt eine neue Aufgabe
      await postData('tasks', data);
    }
    // Optional: Erfolgsfeedback für den Benutzer
    // successfulAddedTask();
    // userFeedback();
  } catch (error) {
    // Optional: Fehlerfeedback für den Benutzer
    // showErrorAddedTask();
    console.error("Fehler beim Speichern der Aufgabe:", error);
  }
  await loadUserTasks(); // Lädt die Aufgabenliste neu
}

/**
 * Löscht einen zugewiesenen Benutzer aus einer Aufgabe.
 * Ersetzt `deleteNotFoundedUserFromTask`.
 * Hinweis: Diese Funktion muss jetzt wissen, aus welcher Aufgabe der Benutzer entfernt werden soll.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} assignedUserKey - Der Schlüssel des zugewiesenen Benutzers, der gelöscht werden soll.
 */
async function removeAssignedUserFromTask(taskId, assignedUserKey) {
  const path = `tasks/${taskId}/assignedTo/${assignedUserKey}`;
  console.log(`Entferne zugewiesenen Benutzer unter Pfad: ${path}`);
  await deleteData(path);
  await loadUserTasks(); // Liste neu laden, um die Änderung widerzuspiegeln
}
