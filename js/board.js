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
    if (!task.subtask || !Array.isArray(task.subtask) || task.subtask.length === 0) {
        return { total: 0, done: 0, percent: 0 };
    }
    const actualSubtasks = task.subtask.filter(st => st && st !== "_empty");
    const total = actualSubtasks.length;
    const done = actualSubtasks.filter(st => st.done).length;
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
    return iconMap[priority] ?? "";
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
    const container = document.getElementById("subtaskFrame"); // z.B. <div id="subtaskFrame"></div>
    container.innerHTML = getSubtask(task.subtask);
}


/**
 * Maps a task’s assigned contact IDs to rendered markup using a supplied renderer.
 * The function limits by the number of actually rendered contacts (skips missing ones)
 * and can append an overflow indicator if more contacts exist than the limit.
 *
 * @param {Task} task - Task that provides the `assignedTo` contact IDs.
 * @param {(contact: Contact, initials: string, color: string) => string} renderFn
 * Renderer that returns the HTML string for a single contact.
 * @param {{ limit?: number, overflow?: (extra: number) => string }} [options]
 * Rendering options: `limit` (max contacts to render) and `overflow` (factory for a trailing indicator).
 * @returns {string} Concatenated HTML for up to `limit` contacts plus optional overflow.
 */
function mapAssignedContacts(task, renderFn, options={}) {
  const {limit=5, overflow=(n)=>`<div class="form__contact-badge more-badge">+${n}</div>`}=options;
  const ids=Array.isArray(task.assignedTo)?task.assignedTo:[];
  let html='', shown=0, total=0;
  for (const id of ids){
    const c=contactsFirebase.find(x=>x.id===id); if(!c) continue;
    total++;
    if(shown<limit){
      const p=c.prename?.[0]?.toUpperCase()||'', s=c.surname?.[0]?.toUpperCase()||'';
      html+=renderFn(c, `${p}${s}`, c.color||'#ccc'); shown++;
    }
  }
  return total>limit?html+overflow(total-limit):html;
}


/**
 * Render small circular avatar badges for assigned contacts, max 4 avatar will show up.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function renderAssignedAvatars(task, max = 4) {
  return mapAssignedContacts(
    task,
    (contact, initials, color) =>
      getCardBadgeTemplate(initials, color, `${contact.prename} ${contact.surname}`),
    {
      limit: max,
      limitByRendered: true,         
      overflow: (extra) => getCardOverflowText(extra) 
    }
  );
}


/**
 * Render Card BadgesTemplate for assigned contacts.
 */
function getCardBadgeTemplate(text, color, title = '') {
  return `<div class="card__credential" title="${title}" aria-label="${title}" style="background:${color};">${text}</div>`;
}


/**
 * Render overflow text in case of more than 4 assigned contacts.
 * @param {number} extra - Number of additional contacts not shown.
 * @param {boolean} showCount - Whether to show the count of extra contacts.
 * @returns {string} HTML string for overflow indicator.
 */
function getCardOverflowText(extra, showCount = false) {
  const label = showCount ? `+${extra}` : '…';
  return `<span class="card__more" title="+${extra} weitere" aria-label="+${extra} weitere">${label}</span>`;
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


/**
 * Function to show a notification when a task is successfully edited or deleted.
 */
function showBoardTaskNotification(origin) {
    const notificationContainer = document.getElementById('taskNotification');
    let notificationMessage = document.getElementById('taskNotificationMessage');
    if (origin === 'delete') {
        showBoardTaskSpecificNotification(notificationMessage, "Task deleted");
    } else if (origin === 'edit') {
        showBoardTaskSpecificNotification(notificationMessage, "Changes saved");
    } else if (origin === 'add') {
        showBoardTaskSpecificNotification(notificationMessage, "Task added");
    }
    notificationContainer.classList.add('form__notification--show');
    setTimeout(() => {
        notificationContainer.classList.remove('form__notification--show');
    }, 1000);
}


/**
 * Update the notification message content.
 */
function showBoardTaskSpecificNotification(notificationMessage, message) {
    notificationMessage.innerHTML = message;
}