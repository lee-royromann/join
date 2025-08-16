/**
 * Build a task board html.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function getTaskTemplate(task) {
    const { total, done, percent } = getSubtaskProgress(task);
    const categoryInfo = getCategoryInfo(task.category);
    const priorityIcon = getPriorityIcon(task.priority);
    const assignedAvatar = renderAssignedAvatars(task);
    const moveTaskTemplate = getMoveTaskTemplate(task);
    return `
        <div id="${task.id}" class="card" draggable="true" ondragstart="startDragging('${task.id}')" onclick="openOverlay('${task.id}')">
                                <div class="card__content">
                                    <div class="card__badgeline">
                                        <div class="card__badge ${categoryInfo.className}">
                                            <span>${categoryInfo.name}</span>
                                        </div>
                                        <div class="card__upanddown-icon" onclick="toggleBoardTaskMenu(event, '${task.id}')">
                                            <img src="../assets/img/icon/up_and_down_arrow.svg" alt="updown-icon">
                                        </div>
                                        <div class="card__burger-menu" id="card-menu-${task.id}">
                                            <div><strong>Move to</strong></div>
                                            ${moveTaskTemplate}
                                        </div>
                                    </div>
                                    <div class="card__header">
                                        <div class="card__header--title">${task.title}</div>
                                        <div class="card__header--description">${task.description}</div>
                                    </div>
                                    <div class="card__subtasks">
                                        <div class="card__subtasks-bar">
                                            <div class="card__subtasks-progress" id="progress-bar" role="progressbar"style="width: ${percent}%;"></div>
                                        </div>
                                        <div class="card__subtasks-text">${done}/${total} Subtasks</div>
                                    </div>
                                    <div class="card__footer">
                                        <div class="card__credentials">
                                            ${assignedAvatar}
                                        </div>
                                        <div class="card__priority">
                                            <img src="${priorityIcon}" alt="priority-icon">
                                        </div>
                                    </div>  
                                </div>
                            </div>
    `;
}


/**
 * Rendering empty card when no cases are available.
 * @param {TaskStatus} status
 * @returns {string} HTML string.
 */
function getEmptyColumnTemplate(status) {
  const statusLabels = {
    "to-do": "To Do",
    "in-progress": "In Progress",
    "await-feedback": "Await Feedback",
    "done": "Done"
  };
  return `<div class="card--notasks"><p>No task ${statusLabels[status]}</p></div>`;
}


/**
 * Build the read-only overlay HTML for a task.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function getOverlayTemplate(task) {
    const categoryInfo = getCategoryInfo(task.category);
    const priorityIcon = getPriorityIcon(task.priority);
    return `
        <div class="overlay__badgeframe">
            <div class="overlay__badge ${categoryInfo.className}">
                <span>${categoryInfo.name}</span>
            </div>
            <div class="overlay__close--button" onclick="closeOverlay()">
                <img src="../assets/img/icon/close.svg" alt="close-icon">
            </div>
        </div>   
        <div class="overlay__title">${task.title}</div>
        <div class="overlay__description">${task.description}</div>

        <div class="overlay__parameters">
            <span>Due date:</span>
            <div>${task.date}</div>
        </div>

        <div class="overlay__parameters">
            <span>Priority:</span>
            <div class="overlay__priority--status">
                <span>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                <img src="${priorityIcon}" alt="priority-icon">
            </div>
        </div>

        <div class="overlay__assigned">
            <span>Assigned to:</span>
            <div class="overlay__credentials">
                    ${renderAssignedContacts(task)}
            </div>
        </div>

        <div class="overlay__subtasks">
            <span>Subtasks</span>
            <div class="overlay__subtasks--frame" id="subtaskFrame">
                ${getSubtask(task.subtask, task.id)}
            </div>
        </div>

        <div class="overlay__action">
            <div class="overlay__action--activate" onclick="handleDeleteTask('${task.id}')">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/>
                </svg>
                <span>Delete</span>
            </div>
            <div class="overlay__action--separator"></div>
            <div class="overlay__action--activate" onclick="openEditOverlay('${task.id}')">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.68213 16.3967H4.08213L12.7071 7.77173L11.3071 6.37173L2.68213 14.9967V16.3967ZM16.9821 6.32173L12.7321 2.12173L14.1321 0.721729C14.5155 0.338395 14.9863 0.146729 15.5446 0.146729C16.103 0.146729 16.5738 0.338395 16.9571 0.721729L18.3571 2.12173C18.7405 2.50506 18.9405 2.96756 18.9571 3.50923C18.9738 4.0509 18.7905 4.5134 18.4071 4.89673L16.9821 6.32173ZM15.5321 7.79673L4.93213 18.3967H0.682129V14.1467L11.2821 3.54673L15.5321 7.79673Z" fill="#2A3647"/>
                </svg>
                <span>Edit</span>
            </div>
        </div>
    `;
}


/**
 * Avatar + name row for overlay assignee list.
 * @param {Contact} contact
 * @param {string} initials
 * @param {string} color
 * @returns {string} HTML string.
 */
function getContactTemplate(contact, initials, color) {
  return `
    <div class="overlay__credentials--individual">
      <div class="overlay__credential--icon" style="background-color: ${color};">${initials}</div>
      <span>${contact.prename} ${contact.surname}</span>
    </div>
  `;
}


/**
 * Render subtask list inside the overlay for a given task.
 * @param {Subtask[]|undefined} subtasks
 * @param {string|number} taskId
 * @returns {string|undefined} HTML string or undefined if no subtasks.
 */
function getSubtask(subtasks, taskId) {
  if (!subtasks || subtasks.length === 0) {
    return ;
  }
  return subtasks.map((sub, index) => `
    <div class="overlay__subtask" data-index="${index}">
      <img src="../assets/img/icon/checkbox_checked.svg" class="${sub.done ? '' : 'd-none'}" alt="checked" id="check-${taskId}-${index}" onclick="toggleSubtaskStatus(${index}, '${taskId}')">
      <img src="../assets/img/icon/checkbox.svg" class="${sub.done ? 'd-none' : ''}" alt="unchecked" id="uncheck-${taskId}-${index}" onclick="toggleSubtaskStatus(${index}, '${taskId}')">
      <span>${sub.title}</span>
    </div>
  `).join("");
}


/**
 * Build the edit overlay HTML for a task (form fields, priority, assignees, subtasks).
 * @param {Task} task
 * @returns {string} HTML string.
 */
function getEditTemplate(task) {
    const assignedAvatar = renderAssignedEditAvatars(task);
    const subtasksHTML = renderSubtasks(task.subtask);

    return `
        <div class="overlay__edit--closewrapper">
            <div class="overlay__close--button" onclick="closeEditOverlay()">
                <img src="../assets/img/icon/close.svg" alt="close-icon">
            </div>
        </div>
        <div class="overlay__edit--wrapper">
            <div class="overlay__edit--selections" id="edit-scroll-wrapper">
                <div class="edit__group">
                    <label class="edit__label" for="edit-title">Title</label>
                    <div class="edit__group--input-wrapper">
                        <input class="edit__input edit__input--textblack" id="edit-title" type="text" name="title" value="${task.title}" placeholder="Enter a title" required/>
                        <div class="edit__required-note"></div>
                    </div>
                </div>
                <div class="edit__group">
                    <label class="edit__label" for="edit-description">Description</label>
                    <textarea class="edit__textarea" id="edit-description" placeholder="Enter a description">${task.description}</textarea>
                    <div class="edit__required-note"></div>
                </div>
                <div class="edit__group">
                    <label class="edit__label" for="edit-due-date">Due date</label>
                    <div class="edit__wrapper-date">
                        <input class="edit__input edit__input--textblack" id="edit-due-date" type="text" name="due-date" value="${task.date}" placeholder="dd/mm/yyyy" pattern="\d{2}/\d{2}/\d{4}" required/>
                        <span class="edit__icon-calendar" aria-hidden="true" onclick="pickDateEdit(event)">
                            <img src="../assets/img/icon/calendar.svg" alt="calendar-icon" />
                        </span>
                    </div>
                    <div class="edit__required-note"></div>
                </div>
                <div class="edit__group">
                    <label class="edit__label">Priority</label>
                    <div class="edit__wrapper-priority">
                        <button type="button" class="edit__button-prio" id="edit__btn-urgent" onclick="setPriorityEdit('urgent')">
                            <span>Urgent</span>
                            <svg id="edit__btn-urgent-icon"width="20" height="14.51" viewBox="0 0 21 16" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M19.6528 15.2547C19.4182 15.2551 19.1896 15.1803 19.0007 15.0412L10.7487 8.958L2.49663 15.0412C2.38078 15.1267 2.24919 15.1887 2.10939 15.2234C1.96959 15.2582 1.82431 15.2651 1.68184 15.2437C1.53937 15.2223 1.40251 15.1732 1.27906 15.099C1.15562 15.0247 1.04801 14.927 0.96238 14.8112C0.876751 14.6954 0.814779 14.5639 0.780002 14.4243C0.745226 14.2846 0.738325 14.1394 0.759696 13.997C0.802855 13.7095 0.958545 13.4509 1.19252 13.2781L10.0966 6.70761C10.2853 6.56802 10.5139 6.49268 10.7487 6.49268C10.9835 6.49268 11.212 6.56802 11.4007 6.70761L20.3048 13.2781C20.4908 13.415 20.6286 13.6071 20.6988 13.827C20.7689 14.0469 20.7678 14.2833 20.6955 14.5025C20.6232 14.7216 20.4834 14.9124 20.2962 15.0475C20.1089 15.1826 19.8837 15.2551 19.6528 15.2547Z" />
                                <path fill="currentColor" d="M19.6528 9.50568C19.4182 9.50609 19.1896 9.43124 19.0007 9.29214L10.7487 3.20898L2.49663 9.29214C2.26266 9.46495 1.96957 9.5378 1.68184 9.49468C1.39412 9.45155 1.13532 9.29597 0.962385 9.06218C0.789449 8.82838 0.716541 8.53551 0.7597 8.24799C0.802859 7.96048 0.95855 7.70187 1.19252 7.52906L10.0966 0.958588C10.2853 0.818997 10.5139 0.743652 10.7487 0.743652C10.9835 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4908 7.66598 20.6286 7.85809 20.6988 8.07797C20.769 8.29785 20.7678 8.53426 20.6955 8.75344C20.6232 8.97262 20.4834 9.16338 20.2962 9.29847C20.1089 9.43356 19.8837 9.50608 19.6528 9.50568Z" />
                            </svg>
                        </button>
                        <button type="button" class="edit__button-prio" id="edit__btn-medium" onclick="setPriorityEdit('medium')">
                            <span>Medium</span>
                            <svg id="edit__btn-medium-icon" width="20" height="14.51" viewBox="0 0 21 8" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M19.1526 7.72528H1.34443C1.05378 7.72528 0.775033 7.60898 0.569514 7.40197C0.363995 7.19495 0.248535 6.91419 0.248535 6.62143C0.248535 6.32867 0.363995 6.0479 0.569514 5.84089C0.775033 5.63388 1.05378 5.51758 1.34443 5.51758H19.1526C19.4433 5.51758 19.722 5.63388 19.9276 5.84089C20.1331 6.0479 20.2485 6.32867 20.2485 6.62143C20.2485 6.91419 20.1331 7.19495 19.9276 7.40197C19.722 7.60898 19.4433 7.72528 19.1526 7.72528Z" />
                                <path fill="currentColor" d="M19.1526 2.48211H1.34443C1.05378 2.48211 0.775033 2.36581 0.569514 2.1588C0.363995 1.95179 0.248535 1.67102 0.248535 1.37826C0.248535 1.0855 0.363995 0.804736 0.569514 0.597724C0.775033 0.390712 1.05378 0.274414 1.34443 0.274414L19.1526 0.274414C19.4433 0.274414 19.722 0.390712 19.9276 0.597724C20.1331 0.804736 20.2485 1.0855 20.2485 1.37826C20.2485 1.67102 20.1331 1.95179 19.9276 2.1588C19.722 2.36581 19.4433 2.48211 19.1526 2.48211Z" />
                            </svg>                                    
                        </button>
                        <button type="button" class="edit__button-prio" id="edit__btn-low" onclick="setPriorityEdit('low')">
                            <span>Low</span>
                            <svg id="edit__btn-low-icon" width="20" height="14.51" viewBox="0 0 21 16" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M10.2485 9.50589C10.0139 9.5063 9.7854 9.43145 9.59655 9.29238L0.693448 2.72264C0.57761 2.63708 0.47977 2.52957 0.405515 2.40623C0.33126 2.28289 0.282043 2.14614 0.260675 2.00379C0.217521 1.71631 0.290421 1.42347 0.463337 1.1897C0.636253 0.955928 0.895022 0.800371 1.18272 0.757248C1.47041 0.714126 1.76347 0.786972 1.99741 0.95976L10.2485 7.04224L18.4997 0.95976C18.6155 0.874204 18.7471 0.812285 18.8869 0.777538C19.0266 0.742791 19.1719 0.735896 19.3144 0.757248C19.4568 0.7786 19.5937 0.82778 19.7171 0.901981C19.8405 0.976181 19.9481 1.07395 20.0337 1.1897C20.1194 1.30545 20.1813 1.43692 20.2161 1.57661C20.2509 1.71629 20.2578 1.86145 20.2364 2.00379C20.215 2.14614 20.1658 2.28289 20.0916 2.40623C20.0173 2.52957 19.9195 2.63708 19.8036 2.72264L10.9005 9.29238C10.7117 9.43145 10.4831 9.5063 10.2485 9.50589Z" />
                                <path fill="currentColor" d="M10.2485 15.2544C10.0139 15.2548 9.7854 15.18 9.59655 15.0409L0.693448 8.47117C0.459502 8.29839 0.30383 8.03981 0.260675 7.75233C0.217521 7.46485 0.290421 7.17201 0.463337 6.93824C0.636253 6.70446 0.895021 6.54891 1.18272 6.50578C1.47041 6.46266 1.76347 6.53551 1.99741 6.7083L10.2485 12.7908L18.4997 6.7083C18.7336 6.53551 19.0267 6.46266 19.3144 6.50578C19.602 6.54891 19.8608 6.70446 20.0337 6.93824C20.2066 7.17201 20.2795 7.46485 20.2364 7.75233C20.1932 8.03981 20.0376 8.29839 19.8036 8.47117L10.9005 15.0409C10.7117 15.18 10.4831 15.2548 10.2485 15.2544Z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="edit__group">
                    <label class="edit__label" for="contact-search">Assigned to</label>
                    <div>
                        <div class="edit__wrapper-assignee" id="contact-edit-selector">
                            <input
                                type="text"
                                class="form__input"
                                id="edit-contact-search"
                                onclick="toggleEditDropdown(event, 'edit-contact-list', 'edit-contact-arrow-icon')"
                                oninput="filterDropdown('contact-search', '#edit-contact-list .form__contact')"
                                placeholder="Select contacts to assign"
                            />
                            <div class="edit__icon-contact" onclick="toggleEditDropdown(event, 'edit-contact-list-wrapper', 'edit-contact-arrow-icon')">
                                <img id="edit-contact-arrow-icon" src="../assets/img/icon/arrow_drop_down.svg" alt="Dropdown Arrow to open contact list">
                            </div>
                        </div>
                        <div class="edit__wrapper-list d_none" id="edit-contact-list-wrapper">
                            <ul class="edit__contact-list" id="edit-contact-list">                                
                            </ul>
                        </div>
                    </div>
                    <div class="edit__contact-badges">
                        ${assignedAvatar}
                    </div>
                </div>
                <div class="edit__group">
                    <label class="edit__label" for="task-subtask-input">Subtasks</label>
                    <div class="edit__wrapper-input">
                        <input type="text" class="edit__input edit__input--textgrey" id="task-subtask-input" placeholder="Add new subtask"/>
                        <div class="edit__wrapper-subtask-icons" id="task-subtask-icons-1">
                            <div class="edit__icon-subtask edit__icon-add" onclick="addEditSubtask()">
                                <img src="../assets/img/icon/plus.svg" alt="Subtask icon to add new subtask">
                            </div>
                        </div>
                    </div>   
                    <ul class="edit__subtasklist">
                        ${subtasksHTML}    
                    </ul>   
                </div>
            </div>
        </div>  
        <footer class="edit__action-buttons">
            <button type="submit" class="edit__button-ok" onclick="saveEditTask()">Ok<img src="../assets/img/icon/done_white.svg" alt="Button to confirm edit"></button>
        </footer>
    `;
}


/**
 * Build a selectable contact list item for the edit dropdown.
 * @param {Contact} contact
 * @param {string} you - "(You)" label or empty string.
 * @param {boolean} isAssigned
 * @returns {string} HTML string.
 */
function getEditContactListItem(contact, you, isAssigned) {
    if (!contact || !contact.prename || !contact.surname) return '';
    const prenameFull = contact.prename.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-');
    const surnameInitial = contact.surname.charAt(0).toUpperCase();
    const prenameInitial = contact.prename.charAt(0).toUpperCase();
    const surnameFull = surnameInitial + contact.surname.slice(1);
    const initials = prenameInitial + surnameInitial;
    const checkedClass = isAssigned ? "" : "d_none";
    const uncheckedClass = isAssigned ? "d_none" : "";
    const isChecked = isAssigned ? "checked" : "";
    const bgColorClass = isAssigned ? "bg-blue" : "";

    return `
        <li class="form__contact ${bgColorClass}"
            id="contact-id-${contact.id}"
            data-id="${contact.id}"
            data-shortname="${initials}"
            data-fullname="${prenameFull} ${surnameFull}"
            data-color="${contact.color}"
            onclick="selectEditContact(${contact.id})">
            <span class="form__contact-badge" style="background-color:${contact.color};">${initials}</span>
            <span class="form__contact-name">${prenameFull} ${surnameFull} ${you}</span>
            <input class="form__contact-checkbox" id="contact-checkbox-${contact.id}" type="checkbox" ${isChecked} hidden/>
            <svg class="form__contact-checkbox-icon-unchecked ${uncheckedClass}" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect stroke="currentColor" stroke-width="2" x="1" y="1" width="16" height="16" rx="3"/>
            </svg>
            <svg class="form__contact-checkbox-icon-checked ${checkedClass}" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M17 8.96582V14.9658C17 16.6227 15.6569 17.9658 14 17.9658H4C2.34315 17.9658 1 16.6227 1 14.9658V4.96582C1 3.30897 2.34315 1.96582 4 1.96582H12" />
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 9.96582L9 13.9658L17 2.46582"/>
            </svg>
        </li>
    `;
}


/**
 * Build a single subtask list item for the edit overlay.
 * @param {Subtask} subtask
 * @param {number} id - Original subtask index.
 * @returns {string} HTML string.
 */
function getSubtaskTemplate(subtask, id) {
  return `
    <li class="edit__subtask" data-id="${id}">   
      <span class="edit__subtask-text ${subtask.done ? 'done' : ''}">
        ${subtask.title}
      </span>
      <div class="edit__subtask-icons right-padding">
        <div class="edit__icon-subtasklist" onclick="editEditSubtask(${id})">
          <img src="../assets/img/icon/edit.svg" alt="Edit subtask">
        </div>
        <span class="edit__subtask-separator"></span>
        <div class="edit__icon-subtasklist" onclick="deleteEditSubtask(${id})">
          <img src="../assets/img/icon/delete.svg" alt="Mark as done">
        </div>
      </div>   
    </li>
  `;
}


/**
 * Build the "editing" version of a subtask list item (inline input & actions).
 * @param {number} id - Original subtask index.
 * @param {string} text - Current subtask title.
 * @returns {string} HTML string.
 */
function getOverlaySubtaskEditTemplate(id, text) {
  return `
    <li class="edit__subtask is-editing">
      <div class="edit__subtask-edit-container">
        <input 
            class="edit__subtask-input"
            type="text" 
            value="${text}" 
            id="subtaskEdit-${id}"
            onkeydown="handleEnterToSaveEditedSubtask(event, ${id})"
        />
        <div class="edit__subtask-icons">
            <div class="edit__icon-subtasklist" onclick="deleteEditSubtask(${id})">
                <img src="../assets/img/icon/delete.svg" alt="Delete subtask">
            </div>
            <span class="edit__subtask-separator"></span>
            <div class="edit__icon-subtasklist" onclick="saveEditedSubtask(${id})">
                <img src="../assets/img/icon/check_subtask.svg" alt="Save subtask">
            </div>
        </div>
      </div>
    </li>
  `;
}

/**
 * Build the "Move to ..." menu items for a task, excluding its current status.
 * @param {Task} task
 * @returns {string} HTML string.
 */
function getMoveTaskTemplate(task) {
    let status = ['to-do', 'in-progress', 'await-feedback', 'done'];
    status = status.filter(s => s !== task.status);
    return`
        <span class="burger-item" onclick="moveEditStatus('${task.id}', '${status[0]}', event)">${status[0]}</span>
        <span class="burger-item" onclick="moveEditStatus('${task.id}', '${status[1]}', event)">${status[1]}</span>
        <span class="burger-item" onclick="moveEditStatus('${task.id}', '${status[2]}', event)">${status[2]}</span>
    `;
}
