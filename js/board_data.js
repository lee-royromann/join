/**
 * Die Basis-URL für die Firebase Realtime Database.
 * @type {string}
 */
const BASE_URL = "https://join472-86183-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * Load all tasks from Firebase into memory and build an ID->key map.
 * Supports legacy structures where the Firebase key differs from task.id.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Propagates network/parse errors from fetch/json()
 */
async function loadTasksFromFirebase() {
    const res = await fetch(BASE_URL + "join/tasks.json");
    const data = await res.json() || {};
    tasksFirebase = [];
    idToKey = {};
    for (const [key, task] of Object.entries(data)) {
        if (!task) continue;
            tasksFirebase.push(task);
        if (task.id != null) {
            idToKey[String(task.id)] = key; 
        }
    }
}


/**
 * Load and sort contacts from Firebase; falls back to [] on non-OK responses.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Propagates network/parse errors from fetch/json() on OK responses.
 */
async function loadContactsFromFirebase() {
    let response = await fetch(BASE_URL + "/join/contacts.json");
    let unsortedContacts = [];
    if (response.ok) {
        let data = await response.json();
        unsortedContacts = Object.values(data || {});
        contactsFirebase = sortContactsByPrename(unsortedContacts);     
    } else {
        contactsFirebase = [];
    }
}


/**
 * Reload tasks from Firebase and re-render the board.
 */
async function refreshTasks() {
    await loadTasksFromFirebase();
    renderTasks();
}


/**
 * Close any overlay content panel by ID, optionally resetting the global currentTask.
 * Also refreshes data and re-renders the board.
 * @async
 * @param {Object} options
 * @param {string} options.contentId - DOM id of the content wrapper to hide (e.g., "story" or "edit").
 * @param {boolean} [options.resetCurrentTask=false] - If true, clears the global current task.
 * @returns {Promise<void>}
 */
async function closeAnyOverlay({ contentId, resetCurrentTask = false }) {
    const overlay = document.getElementById('overlay');
    const content = document.getElementById(contentId);
    if (!overlay || !content) return;
    await hideOverlay(overlay);
    content.classList.add('d-none');
    if (resetCurrentTask) {
      window.currentTask = null;
    }
    await refreshTasks();
}


/**
 * Close the read-only task overlay.
 * @returns {Promise<void>}
 */
async function closeOverlay() {
    return closeAnyOverlay({ contentId: 'story' });
}


/**
 * Close the edit overlay and reset currentTask.
 * @returns {Promise<void>}
 */
async function closeEditOverlay() {
    return closeAnyOverlay({ contentId: 'edit', resetCurrentTask: true });
}


/**
 * Initialize the board: load tasks & contacts, render, and show username initials.
 * @async
 * @returns {Promise<void>}
 */
async function boardInit() {
    await loadTasksFromFirebase();
    await loadContactsFromFirebase();
    renderTasks();
    getUsernameInitals();
}


/**
 * Persist a single task to Firebase using its `id` as the node key.
 * @async
 * @param {Task} task
 * @returns {Promise<void>}
 * @throws {Error} If the PUT request fails.
 */
async function saveTaskToFirebase(task) {
    if (!task || task.id == null) {
        console.warn("saveTaskToFirebase: task oder task.id fehlt");
        return;
    }
    const url = `${BASE_URL}join/tasks/${encodeURIComponent(String(task.id))}.json`;
    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Firebase PUT fehlgeschlagen (${res.status}): ${text}`);
    }
}


/**
 * Delete a task from Firebase, handling legacy key mapping if necessary.
 * Also removes the task from local state and mapping.
 * @async
 * @param {string|number} taskId
 * @returns {Promise<void>}
 * @throws {Error} If the DELETE request fails.
 */
async function deleteTaskFromFirebase(taskId) {
    const key = idToKey[String(taskId)] || String(taskId); // Altfall abfangen
    const url = `${BASE_URL}join/tasks/${encodeURIComponent(key)}.json`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Firebase DELETE fehlgeschlagen (${res.status}): ${text}`);
    }
    const idx = tasksFirebase.findIndex(t => String(t.id) === String(taskId));
    if (idx !== -1) tasksFirebase.splice(idx, 1);
    delete idToKey[String(taskId)];
}


/**
 * Controller for deleting a task via UI.
 * Ensures deletion, reload, overlay close, and re-render.
 * @async
 * @param {string|number} taskId
 * @returns {Promise<void>}
 */
async function handleDeleteTask(taskId) {
    try {
        await deleteTaskFromFirebase(taskId); 
        tasksFirebase = []; 
        await loadTasksFromFirebase();        
        closeOverlay();                       
        renderTasks();                        
    } catch (error) {
        console.error("Fehler beim Löschen der Aufgabe:", error);
    }
}


/**
 * Move the currently dragged task to a new status and persist the change.
 * @async
 * @param {TaskStatus} status
 * @returns {Promise<void>}
 */
async function moveTo(status) {
    const idx = tasksFirebase.findIndex(t => String(t.id) === String(currentDraggedID));
    if (idx === -1) return;
    const updatedTask = { ...tasksFirebase[idx], status };
    tasksFirebase[idx] = updatedTask;
    renderTasks();
    await saveTaskToFirebase(updatedTask); 
}


/**
 * Toggle a subtask's done state for a given task and persist to Firebase.
 * Updates corresponding checkbox icons in the DOM.
 * @async
 * @param {number} index - Subtask index within the task.
 * @param {string|number} taskId
 * @returns {Promise<void>}
 */
async function toggleSubtaskStatus(index, taskId) {
    const task = tasksFirebase.find(t => t.id === taskId);
    if (!task || !task.subtask || !task.subtask[index]) {
        console.warn("Task oder Subtask nicht gefunden");
        return;
    }
    task.subtask[index].done = !task.subtask[index].done;
    const checkEl = document.getElementById(`check-${taskId}-${index}`);
    const uncheckEl = document.getElementById(`uncheck-${taskId}-${index}`);
    if (task.subtask[index].done) {
        checkEl.classList.remove("d-none");
        uncheckEl.classList.add("d-none");
    } else {
        checkEl.classList.add("d-none");
        uncheckEl.classList.remove("d-none");
    }
    await saveTaskToFirebase(task);
}


/**
 * Validate edit form, update task model, persist to Firebase, and close overlay.
 * @async
 * @returns {Promise<void>}
 */
async function saveEditTask() {
    if (!validateEditForm()) return;
    updateEditBoardData();
    await saveTaskToFirebase(currentTask);;
    await closeEditOverlay();
}


/**
 * Move a task to a new status via the card's burger menu, persist, and re-render.
 * @async
 * @param {string|number} taskId
 * @param {TaskStatus} newStatus
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */
async function moveEditStatus(taskId, newStatus, event) {
    event.stopPropagation();
    const idx = tasksFirebase.findIndex(t => String(t.id) === String(taskId));
    if (idx === -1) return;
    const updatedTask = { ...tasksFirebase[idx], status: newStatus };
    tasksFirebase[idx] = updatedTask;
    await saveTaskToFirebase(updatedTask); 
    const userMenu = document.getElementById('card-menu-' + taskId);
      if (userMenu) {
          userMenu.classList.remove('card__burger-menu--visible');
      }
    renderTasks();
}