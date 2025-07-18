function getContactListItem(contact) {   
    if (!contact || !contact.prename || !contact.surname) {
        // console.warn('Incomplete Contact:', contact);
        return '';
    }

    const prenameFull = contact.prename.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-');
    const surnameInitial = contact.surname.charAt(0).toUpperCase();
    const prenameInitial = contact.prename.charAt(0).toUpperCase();
    const surnameFull = surnameInitial + contact.surname.slice(1);
    const initials = prenameInitial + surnameInitial;

    return `
        <li class="form__contact"
            id="contact-id-${contact.id}"
            data-id="${contact.id}"
            data-shortname="${initials}"
            data-fullname="${prenameFull} ${surnameFull}"
            data-color="${contact.color}"
            onclick="selectContact(${contact.id}); emptySearchField('contact-search', '#contact-list .form__contact')">
            <span class="form__contact-badge" style="background-color:${contact.color};">${initials}</span>
            <span class="form__contact-name">${prenameFull} ${surnameFull}</span>
            <input class="form__contact-checkbox" id="contact-checkbox-${contact.id}" type="checkbox" onclick="selectContact(${contact.id})" hidden/>
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


function getSelectedContactBadge(contact) {
    return `
        <span class="form__contact-badge" id="contact-badge-${contact.id}" data-id="${contact.id}" style="background-color: ${contact.color};">${contact.prename.charAt(0).toUpperCase() + contact.surname.charAt(0).toUpperCase()}</span>
    `
};


function getCategoryListItem(id, category) {
    const categoryFromated = category.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');        
    return `
        <li class="form__category" id="category-id-${id}" data-id="${id}" data-category="${categoryFromated}" onclick="selectCategory(${id}, 'category-arrow-icon')">${categoryFromated}</li>
    `
};

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

function getSubtaskEditTemplate(id, text) {
    return `
        <li class="form__subtask-item-edit" data-id="${id}">
            <div class="form__subtask-edit-container">
                <input class="form__subtask-input" type="text" value="${text}"/>
                <div class="form__subtask-icons--editing">
                    <img class="form__subtask-icon" src="../assets/img/icon/delete.svg" alt="Icon to delete subtask" onclick="deleteSubtask('-edit', ${id})">
                    <span class="form__icon-separator"></span>
                    <img class="form__subtask-icon" src="../assets/img/icon/check_subtask.svg" alt="Icon to save subtask" onclick="saveSubtask(${id})">
                </div>
            </div>
        </li>
    `;
}