/**
 * Generates an HTML template string for a single contact list item.
 * The function expects preprocessed contact data such as the formatted first name,
 * formatted last name, initials, color, and ID. It then returns a string of HTML markup
 * representing the contact, including badge, name, checkbox, and icons.
 * @param {string} prenameFull - The formatted full first name of the contact (capitalized).
 * @param {string} surnameFull - The formatted full last name of the contact (capitalized).
 * @param {string} initials - The initials of the contact, derived from the prename and surname.
 * @param {string} contactColor - The color associated with the contact (used for the badge background).
 * @param {number|string} contactId - The unique identifier of the contact.
 * @param {string} user - A string suffix to indicate if the contact is the current user (e.g., " (You)").
 * @returns {string} The HTML template string for the contact list item.
 */
function getContactListItem(prenameFull, surnameFull, initials, contactColor, contactId, user) {
    return `
        <li class="form__contact"
            id="contact-id-${contactId}"
            data-id="${contactId}"
            data-shortname="${initials}"
            data-fullname="${prenameFull} ${surnameFull}"
            data-color="${contactColor}"
            onclick="selectContact(${contactId}); emptySearchField('contact-search', '#contact-list .form__contact')">
            <span class="form__contact-badge" style="background-color:${contactColor};">${initials}</span>
            <span class="form__contact-name">${prenameFull} ${surnameFull} ${user}</span>
            <input class="form__contact-checkbox" id="contact-checkbox-${contactId}" type="checkbox" onclick="selectContact(${contactId})" hidden/>
            <svg class="form__contact-checkbox-icon-unchecked" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect stroke="currentColor" stroke-width="2" x="1" y="1" width="16" height="16" rx="3"/>
            </svg>
            <svg class="form__contact-checkbox-icon-checked d_none" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M17 8.96582V14.9658C17 16.6227 15.6569 17.9658 14 17.9658H4C2.34315 17.9658 1 16.6227 1 14.9658V4.96582C1 3.30897 2.34315 1.96582 4 1.96582H12" />
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 9.96582L9 13.9658L17 2.46582"/>
            </svg>
        </li>
    `;
}


/**
 * Function to generate a badge HTML template for a selected contact.
 * It uses the contact's id, color, prename, and surname to create a badge.
 * The badge displays the initials of the contact in uppercase.
 * @param {Object} contact - The contact object containing id, prename, surname, and color.
 * @property {number} contact.id - The unique identifier of the contact.
 * @property {string} contact.prename - The first name of the contact.
 * @property {string} contact.surname - The last name of the contact.
 * @property {string} contact.color - The color associated with the contact.
 * @returns {string} - The HTML template for the selected contact badge.
 */
function getSelectedContactBadge(contact) {
    return `
        <span class="form__contact-badge" id="contact-badge-${contact.id}" data-id="${contact.id}" style="background-color: ${contact.color};">${contact.prename.charAt(0).toUpperCase() + contact.surname.charAt(0).toUpperCase()}</span>
    `
};


/**
 * Function to generate a category list item HTML template.
 * It formats the category string by capitalizing the first letter of each word,
 * and returns a list item with the category name.
 * @param {number} id - The unique identifier for the category.
 * @param {string} category - The category name.
 * @returns {string} - The HTML template for the category list item.
 */
function getCategoryListItem(id, category) {
    const categoryFromated = category.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');        
    return `
        <li class="form__category" id="category-id-${id}" data-id="${id}" data-category="${categoryFromated}" onclick="selectCategory(${id}, 'category-arrow-icon')">${categoryFromated}</li>
    `
};


/**
 * Function to generate a subtask HTML template.
 * @param {number} id - The unique identifier for the subtask.
 * @param {string} text - The text content of the subtask.
 * @returns {string} - The HTML template for the subtask.
 */
function getSubtaskRegularTemplate(id, text) {
    return `
        <li class="form__subtask-item" data-id="${id}" data-text="${text}">
            <span class="form__subtask-label">${text}</span>
            <div class="form__subtask-icons">
                <img class="form__subtask-icon" src="../assets/img/icon/edit.svg" alt="Icon to edit subtask" onclick="editSubtask(${id})">
                <span class="form__icon-separator"></span>
                <img class="form__subtask-icon" src="../assets/img/icon/delete.svg" alt="Icon to delete subtask" onclick="deleteSubtask('', ${id})">
            </div>
        </li>
    `;
}


/**
 * Function to generate a subtask edit HTML template.
 * @param {number} id - The unique identifier for the subtask.
 * @param {string} text - The text content of the subtask.
 * @returns {string} - The HTML template for the subtask edit.
 */
function getSubtaskEditTemplate(id, text) {
    return `
        <li class="form__subtask-item-edit" data-id="${id}">
            <div class="form__subtask-edit-container">
                <input class="form__subtask-input" type="text" value="${text}" onkeydown="handleEnterToSaveEditedSubtask(event, ${id})"/>
                <div class="form__subtask-icons--editing">
                    <img class="form__subtask-icon" src="../assets/img/icon/delete.svg" alt="Icon to delete subtask" onclick="deleteSubtask('-edit', ${id})">
                    <span class="form__icon-separator"></span>
                    <img class="form__subtask-icon" src="../assets/img/icon/check_subtask.svg" alt="Icon to save subtask" onclick="saveSubtask(${id})">
                </div>
            </div>
        </li>
    `;
}


/**
 * Function to generate the HTML template for the add task overlay.
 * @param {string} status - The status of the task (e.g., "edit" or "add").
 * @returns {string} - The HTML template for the add task overlay.
 */
function getAddTaskOverlayTemplate(status) {
    return `
        <section class="task__overlay-content">
            <div class="task__overlay-header">
                <h2 class="task__overlay-title">Add Task</h2>
                <div class="task__overlay-close" onclick="closeTaskOverlay()">
                    <img src="../assets/img/icon/close.svg" alt="Close Overlay Add Task">
                </div>
            </div>
            <form class="task__overlay-form" id="form-add-task">
                <div class="form__columns">
                    <section class="form__column">
                        <fieldset class="form__group">
                            <label class="form__label" for="task-title">Title<span class="required-asterisk">*</span></label>
                            <input class="form__input" id="task-title" type="text" name="title" placeholder="Enter a title" required/>
                            <p class="required-hint d_none">This field is required</p>
                        </fieldset>
                        <fieldset class="form__group">
                            <label class="form__label" for="description">Description</label>
                            <textarea class="form__textarea" id="description" placeholder="Enter a Description"></textarea>
                            <img src="../assets/img/icon/resize_textarea.svg" alt="Resize Icon für Description" class="form__description-icon">
                        </fieldset>
                        <fieldset class="form__group">
                            <label class="form__label" for="task-due-date">Due date<span class="required-asterisk">*</span></label>
                            <div class="form__wrapper-date">
                                <input class="form__input" id="task-due-date" type="text" name="due-date" placeholder="DD.MM.YYYY" required readonly/>
                                <span class="form__icon-calendar" aria-hidden="true" onclick="pickDate(event)">
                                    <img src="../assets/img/icon/calendar.svg" alt="Calendar icon for Due Date" />
                                </span>
                            </div>
                            <p class="required-hint d_none">This field is required</p>
                        </fieldset>
                    </section>
                    <div class="form__separator"></div>
                    <section class="form__column">
                        <fieldset class="form__group">
                            <div class="form__label">Priority</div>
                            <div class="form__wrapper-priority">
                                <button type="button" class="form__button-prio" id="btn-urgent" data-prio="urgent" onclick="setPriority('urgent')">
                                    <span>Urgent</span>
                                    <svg id="btn-urgent-icon" width="20" height="16" viewBox="0 0 21 16" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="currentColor" d="M19.6528 15.2547C19.4182 15.2551 19.1896 15.1803 19.0007 15.0412L10.7487 8.958L2.49663 15.0412C2.38078 15.1267 2.24919 15.1887 2.10939 15.2234C1.96959 15.2582 1.82431 15.2651 1.68184 15.2437C1.53937 15.2223 1.40251 15.1732 1.27906 15.099C1.15562 15.0247 1.04801 14.927 0.96238 14.8112C0.876751 14.6954 0.814779 14.5639 0.780002 14.4243C0.745226 14.2846 0.738325 14.1394 0.759696 13.997C0.802855 13.7095 0.958545 13.4509 1.19252 13.2781L10.0966 6.70761C10.2853 6.56802 10.5139 6.49268 10.7487 6.49268C10.9835 6.49268 11.212 6.56802 11.4007 6.70761L20.3048 13.2781C20.4908 13.415 20.6286 13.6071 20.6988 13.827C20.7689 14.0469 20.7678 14.2833 20.6955 14.5025C20.6232 14.7216 20.4834 14.9124 20.2962 15.0475C20.1089 15.1826 19.8837 15.2551 19.6528 15.2547Z" />
                                        <path fill="currentColor" d="M19.6528 9.50568C19.4182 9.50609 19.1896 9.43124 19.0007 9.29214L10.7487 3.20898L2.49663 9.29214C2.26266 9.46495 1.96957 9.5378 1.68184 9.49468C1.39412 9.45155 1.13532 9.29597 0.962385 9.06218C0.789449 8.82838 0.716541 8.53551 0.7597 8.24799C0.802859 7.96048 0.95855 7.70187 1.19252 7.52906L10.0966 0.958588C10.2853 0.818997 10.5139 0.743652 10.7487 0.743652C10.9835 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4908 7.66598 20.6286 7.85809 20.6988 8.07797C20.769 8.29785 20.7678 8.53426 20.6955 8.75344C20.6232 8.97262 20.4834 9.16338 20.2962 9.29847C20.1089 9.43356 19.8837 9.50608 19.6528 9.50568Z" />
                                    </svg>
                                </button>
                                <button type="button" class="form__button-prio" id="btn-medium" data-prio="medium" onclick="setPriority('medium')">
                                    <span>Medium</span>
                                    <svg id="btn-medium-icon" width="20" height="8" viewBox="0 0 21 8" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="currentColor" d="M19.1526 7.72528H1.34443C1.05378 7.72528 0.775033 7.60898 0.569514 7.40197C0.363995 7.19495 0.248535 6.91419 0.248535 6.62143C0.248535 6.32867 0.363995 6.0479 0.569514 5.84089C0.775033 5.63388 1.05378 5.51758 1.34443 5.51758H19.1526C19.4433 5.51758 19.722 5.63388 19.9276 5.84089C20.1331 6.0479 20.2485 6.32867 20.2485 6.62143C20.2485 6.91419 20.1331 7.19495 19.9276 7.40197C19.722 7.60898 19.4433 7.72528 19.1526 7.72528Z" />
                                        <path fill="currentColor" d="M19.1526 2.48211H1.34443C1.05378 2.48211 0.775033 2.36581 0.569514 2.1588C0.363995 1.95179 0.248535 1.67102 0.248535 1.37826C0.248535 1.0855 0.363995 0.804736 0.569514 0.597724C0.775033 0.390712 1.05378 0.274414 1.34443 0.274414L19.1526 0.274414C19.4433 0.274414 19.722 0.390712 19.9276 0.597724C20.1331 0.804736 20.2485 1.0855 20.2485 1.37826C20.2485 1.67102 20.1331 1.95179 19.9276 2.1588C19.722 2.36581 19.4433 2.48211 19.1526 2.48211Z" />
                                    </svg>                                    
                                </button>
                                <button type="button" class="form__button-prio" id="btn-low" data-prio="low" onclick="setPriority('low')">
                                    <span>Low</span>
                                    <svg id="btn-low-icon" width="20" height="16" viewBox="0 0 21 16" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="currentColor" d="M10.2485 9.50589C10.0139 9.5063 9.7854 9.43145 9.59655 9.29238L0.693448 2.72264C0.57761 2.63708 0.47977 2.52957 0.405515 2.40623C0.33126 2.28289 0.282043 2.14614 0.260675 2.00379C0.217521 1.71631 0.290421 1.42347 0.463337 1.1897C0.636253 0.955928 0.895022 0.800371 1.18272 0.757248C1.47041 0.714126 1.76347 0.786972 1.99741 0.95976L10.2485 7.04224L18.4997 0.95976C18.6155 0.874204 18.7471 0.812285 18.8869 0.777538C19.0266 0.742791 19.1719 0.735896 19.3144 0.757248C19.4568 0.7786 19.5937 0.82778 19.7171 0.901981C19.8405 0.976181 19.9481 1.07395 20.0337 1.1897C20.1194 1.30545 20.1813 1.43692 20.2161 1.57661C20.2509 1.71629 20.2578 1.86145 20.2364 2.00379C20.215 2.14614 20.1658 2.28289 20.0916 2.40623C20.0173 2.52957 19.9195 2.63708 19.8036 2.72264L10.9005 9.29238C10.7117 9.43145 10.4831 9.5063 10.2485 9.50589Z" />
                                        <path fill="currentColor" d="M10.2485 15.2544C10.0139 15.2548 9.7854 15.18 9.59655 15.0409L0.693448 8.47117C0.459502 8.29839 0.30383 8.03981 0.260675 7.75233C0.217521 7.46485 0.290421 7.17201 0.463337 6.93824C0.636253 6.70446 0.895021 6.54891 1.18272 6.50578C1.47041 6.46266 1.76347 6.53551 1.99741 6.7083L10.2485 12.7908L18.4997 6.7083C18.7336 6.53551 19.0267 6.46266 19.3144 6.50578C19.602 6.54891 19.8608 6.70446 20.0337 6.93824C20.2066 7.17201 20.2795 7.46485 20.2364 7.75233C20.1932 8.03981 20.0376 8.29839 19.8036 8.47117L10.9005 15.0409C10.7117 15.18 10.4831 15.2548 10.2485 15.2544Z" />
                                    </svg>
                                </button>
                            </div>
                        </fieldset>
                        <fieldset class="form__group">
                            <label class="form__label" for="contact-search">Assigned to</label>
                            <div>
                                <div class="form__wrapper-assignee" id="contact-selector">
                                    <input
                                        type="text"
                                        class="form__input"
                                        id="contact-search"
                                        onclick="toggleDropdown(event, 'contact-list', 'contact-arrow-icon')"
                                        oninput="filterDropdown('contact-search', '#contact-list .form__contact')"
                                        placeholder="Select contacts to assign"
                                    />
                                    <div class="form__icon-contact" onclick="toggleDropdown(event, 'contact-list', 'contact-arrow-icon')">
                                        <img id="contact-arrow-icon" src="../assets/img/icon/arrow_drop_down.svg" alt="Dropdown Arrow to open contact list">
                                    </div>
                                </div>
                                <div class="form__wrapper-list d_none" id="contact-list">
                                    <ul class="form__contact-list" id="contact-list-ul"></ul>
                                </div>
                            </div>
                            <div class="form__contact-badges" id="contact-badges"></div>
                        </fieldset>
                        <fieldset class="form__group">
                            <label class="form__label" for="category-input">Category<span class="required-asterisk">*</span></label>
                            <div>
                                <div class="form__wrapper-category" id="category-selector">
                                    <input type="text" class="form__input" id="category-input" onclick="toggleDropdown(event, 'category-list', 'category-arrow-icon')" placeholder="Select task category" readonly/>
                                    <div class="form__icon-category" onclick="toggleDropdown(event, 'category-list', 'category-arrow-icon')">
                                        <img id="category-arrow-icon" src="../assets/img/icon/arrow_drop_down.svg" alt="Dropdown Arrow to open category list">
                                    </div>                                    
                                </div>
                                <div class="form__wrapper-list d_none" id="category-list">
                                    <ul id="category-list-ul"></ul>
                                </div>
                            </div>
                            <p class="required-hint d_none">This field is required</p>
                        </fieldset>
                        <fieldset class="form__group">
                            <label class="form__label" for="subtask-input">Subtasks</label>
                            <div class="form__wrapper-input">
                                <input type="text" class="form__input" id="subtask-input" placeholder="Add new subtask" onkeydown="handleEnterToAddSubtask(event)"/>
                                <div class="form__wrapper-subtask-icons" id="task-subtask-icons-1">
                                    <div class="form__icon-subtask" onclick="addSubtask()">
                                        <img src="../assets/img/icon/plus.svg" alt="Subtask icon to add new subtask">
                                    </div>
                                </div>
                                <div class="form__wrapper-subtask-icons d_none" id="task-subtask-icons-2">
                                    <div class="form__icon-subtask">
                                        <img src="../assets/img/icon/close.svg" alt="Subtask icon to delete subtask">
                                    </div>
                                    <span class="form__icon-separator"></span>
                                    <div class="form__icon-subtask">
                                        <img src="../assets/img/icon/done.svg" alt="Subtask icon to mark subtask as done">
                                    </div>
                                </div>
                            </div>
                            <div class="form__wrapper-subtasks">
                                <ul class="form__subtask-list" id="subtask-list">
                                </ul>
                            </div>
                        </fieldset>
                    </section>
                </div>
                <footer class="task__overlay-footer">
                    <span class="required-text"><span class="required-asterisk">* </span>This field is required</span>
                    <div class="form__action-buttons">
                        <button type="reset" class="form__button-clear" onclick="clearForm()">
                            <span>Clear</span>
                            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.06917 7.00008L12.3122 12.2431M1.82617 12.2431L7.06917 7.00008L1.82617 12.2431ZM12.3122 1.75708L7.06817 7.00008L12.3122 1.75708ZM7.06817 7.00008L1.82617 1.75708L7.06817 7.00008Z"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                        <button type="submit" class="form__button-create" onclick="createTask(event, '${status}', 'board-page')"><span>Create Task</span><img src="../assets/img/icon/done_white.svg" alt="Button to create task"></button>
                    </div>
                </footer>
            </form>
        </section>
    `
}