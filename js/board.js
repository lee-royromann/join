/**
 * Global Array and Variables for board menue incl. overlay and edit
 */
let tasksFirebase = [];
let contactsFirebase = [];
let currentDraggedID; 
let currentTask; 
let idToKey = {};
const searchInput = document.getElementById("search-task");
const noResults = document.getElementById("no-results");


/**
 * Render the entire board: clear columns, render tasks, and placeholders for empty columns.
 */
function renderTasks() {
    clearAllColumns();
    const taskCounts = renderAllTasks();
    renderEmptyColumns(taskCounts);
}


/**
 * Clear all four status columns.
 */
function clearAllColumns() {
    ["to-do", "in-progress", "await-feedback", "done"]
      .forEach(id => document.getElementById(id).innerHTML = "");
}


/**
 * Render all tasks into their respective status columns.
 * @returns {StatusCounts} Count of tasks per status.
 */
function renderAllTasks() {
    const counts = { "to-do": 0, "in-progress": 0, "await-feedback": 0, "done": 0 };
    tasksFirebase.forEach(task => {
        const column = document.getElementById(task.status);
        if (column) {
            column.innerHTML += getTaskTemplate(task); 
            counts[task.status]++;
        }
    });
    return counts;
}


/**
 * Insert "empty column" placeholders where no tasks exist.
 * @param {StatusCounts} counts
 */
function renderEmptyColumns(counts) {
    Object.entries(counts).forEach(([status, count]) => {
        if (count === 0) {
        document.getElementById(status).innerHTML = getEmptyColumnTemplate(status);
        }
    });
}


/**
 * Search tasks by title/description using the current input value.
 * Clears warning when input is empty, otherwise shows "no results" if none match.
 */
function searchTask() {
    const searchTerm = document.getElementById("search-task").value.trim();
    const warning = document.getElementById("no-results");
    if (searchTerm === "") {
        renderTasks();  
        warning.style.display = "none";
        return;
    }
    const filtered = filterTasks(searchTerm);
    updateTaskDisplay(filtered, warning);
}


/**
 * Function to confirm Input value with "Enter" key. Used on field search, board edit - subtasks
 * It prevents default behavior to avoid form submission, when key is pressed down.
 * @param {KeyboardEvent} event - The keyboard event triggered by the key press.
 */
function handleEnterEvent(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const { action, id } = event.currentTarget.dataset; 
    switch (action) {
        case 'search-task':
            searchTask();
            break;
        case 'confirm-add-subtask':
            addEditSubtask();
            break;
}}


/**
 * Apply filtered results to the UI, or show warning if empty.
 * @param {Record<string, Task>} filtered
 * @param {HTMLElement} warning
 */
function updateTaskDisplay(filtered, warning) {
    if (Object.keys(filtered).length > 0) {
        renderFilteredTasks(filtered);
        warning.style.display = "none";
    } else {
        renderTasks();
        warning.style.display = "block";
    }
}


/**
 * Filter tasks by search term (case-insensitive) over title and description.
 * @param {string} searchTerm
 * @returns {Record<string, Task>} A map of index->Task for matches.
 */
function filterTasks(searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return Object.entries(tasksFirebase)
        .filter(([_, task]) =>
            task.title.toLowerCase().includes(lowerSearchTerm) ||
            task.description.toLowerCase().includes(lowerSearchTerm)
        )
        .reduce((acc, [id, task]) => {
            acc[id] = task;
            return acc;
        }, {});
}


/**
 * Render only the filtered set of tasks and update empty columns.
 * @param {Record<string, Task>} filteredTasks
 */
function renderFilteredTasks(filteredTasks) {
    clearAllColumns();
    const counts = { "to-do": 0, "in-progress": 0, "await-feedback": 0, "done": 0 };
    Object.values(filteredTasks).forEach(task => {
    const column = document.getElementById(task.status);
        if (column) {
          column.innerHTML += getTaskTemplate(task);
          counts[task.status]++;
        }
    });
    renderEmptyColumns(counts);
}


/**
 * Steers to get the right description and layout for user-story / technical task.
 * @param {string} category 
 * @returns {{name: string, className: string|undefined}}
 */
function getCategoryInfo(category) { 
    const formattedName = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const badgeClassMap = {
        "user-story": "card__badge-user-story",
        "technical-task": "card__badge-technical-task"
    };
    const badgeClass = badgeClassMap[category];
    return {
        name: formattedName,
        className: badgeClass
    };
}

/**
 * Compute subtask progress stats.
 * @param {Task} task
 * @returns {{ total: number, done: number, percent: number }}
 */
function getSubtaskProgress(task) {
    const total = task.subtask?.length || 0;
    const done = task.subtask?.filter(st => st.done).length || 0;
    const percent = total > 0 ? (done / total) * 100 : 0;
    return { total, done, percent };
}


/**
 * Map priority to icon URL.
 * @param {TaskPriority} priority
 * @returns {string|undefined} icon URL
 */
function getPriorityIcon(priority) {
    const iconMap = {
        low: "../assets/img/icon/low_green.svg",
        medium: "../assets/img/icon/medium_yellow.svg",
        urgent: "../assets/img/icon/urgent_red.svg"
    };
    return iconMap[priority];
}

/**
 * Get checkbox icon path for subtask status.
 * @param {boolean} status
 * @returns {string} Icon URL.
 */
function getSubtaskIcon(status) {
    return status 
        ? "../assets/img/icon/checkbox_checked.svg" 
        : "../assets/img/icon/checkbox.svg";
}


/**
 * Render overlay subtasks into the container with id "subtaskFrame".
 * @param {Task} task
 * @returns {void}
 */
function renderSubtask(task) {
    const container = document.getElementById("subtaskFrame"); // z. B. <div id="subtaskFrame"></div>
    container.innerHTML = getSubtask(task.subtask);
}


/**
 * Map assigned contact IDs to rendered content using a supplied renderer.
 * @param {Task} task
 * @param {(contact: Contact, initials: string, color: string) => string} renderFn
 * @returns {string} Concatenated HTML string.
 */
function mapAssignedContacts(task, renderFn) {
    return task.assignedTo.map(userId => {
        const contact = contactsFirebase.find(c => c.id === userId);
        if (!contact) return '';
        const prenameInitial = contact.prename?.charAt(0).toUpperCase() || '';
        const surnameInitial = contact.surname?.charAt(0).toUpperCase() || '';
        const initials = `${prenameInitial}${surnameInitial}`;
        const color = contact.color || "#cccccc";
        return renderFn(contact, initials, color);
    }).join('');
}


/**
 * Render small circular avatar badges for assigned contacts.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function renderAssignedAvatars(task) {
    return mapAssignedContacts(task, (contact, initials, color) =>
        `<div class="card__credential" style="background-color: ${color};">${initials}</div>`
    );
}


/**
 * Render assigned contacts (avatar + full name) for overlay.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function renderAssignedContacts(task) {
    return mapAssignedContacts(task, (contact, initials, color) =>
        getContactTemplate(contact, initials, color)
    );
}


/**
 * Start drag operation for a task card.
 * @param {string|number} id
 */
function startDragging(id) {
    currentDraggedID = String(id);  
    document.getElementById(id).classList.add("card-transform")  // achtung muss noch irgendwo removed werden
}


/**
 * Allow drop on droppable targets.
 * @param {DragEvent} event
 * @returns {void}
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * Highlights the potential droparea by adding futher class to the column
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}


/**
 * Remove the highlight of a droparea when column is not chosen
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}


/**
 * Render the edit overlay for a given task.
 * @param {string|number} taskId
 * @returns {void}
 */
function renderEditTask(taskId) {
    overrideEmptySearchField();
    const task = findTaskById(taskId);
    if (!task) return;
    prepareEditOverlay();
    insertEditContent(task);
    initializeEditComponents(task);
}


/**
 * No-op override for a global `emptySearchField` if present.
 * Prevents side effects while edit overlay is open.
 */
function overrideEmptySearchField() {
    window.emptySearchField = () => {};
}


/**
 * Find a task in memory by ID.
 * @param {string|number} id
 * @returns {Task|undefined}
 */
function findTaskById(id) {
    return tasksFirebase.find(t => t.id === id);
}