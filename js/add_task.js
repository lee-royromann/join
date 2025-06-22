// The following code is initially used for optical designing.
// The code will be optimized, once the design is finalized.

const priorities = ['urgent', 'medium', 'low'];


function initAddTask() {
    loadSidebar();
    populateContactsToDropdown();
}

function loadSidebar() {
    console.log("Loading sidebar...");
}

function setPriority(priority) {
    
    let buttons = document.querySelectorAll('.form__button-prio');

    buttons.forEach(button => {
        priorities.forEach(prio => {
            button.classList.remove(`form__button-prio--${prio}`);
        });
    });

    let button = document.getElementById(`btn-${priority}`);

    if (!button) {
        console.error(`Button with ID btn-${priority} not found.`);
        return;
    }

    button.classList.add(`form__button-prio--${priority}`);
}

function populateContactsToDropdown() {
    console.log("Populating contacts...");
}

function stopEventPropagation(event) {
    event.stopPropagation();
}

function showDropdown(dropdown) {
    dropdown.classList.remove('d_none');
}

function hideDropdown(dropdown) {
    dropdown.classList.add('d_none');
}

function toggleDropdown(event, inputId, dropdownId) {
    stopEventPropagation(event);

    const dropdownElement = document.getElementById(dropdownId);
	const isHidden = dropdownElement.classList.contains('d_none');

    if (isHidden) {
        showDropdown(dropdownElement);
    } else {
        hideDropdown(dropdownElement);
    }
}

function selectContact(id) {
    const checkbox = document.getElementById(`contact-checkbox-${id}`);
    
    if (!checkbox) {
        console.error(`Checkbox with ID contact-checkbox-${id} not found.`);        
        return;
    }
    checkbox.checked ? unhighlightContact(checkbox) : highlightContact(checkbox);
    checkbox.checked = !checkbox.checked;
}

function highlightContact(checkbox) {
    if (checkbox) {
        checkbox.parentElement.classList.add('form__contact-checkbox--checked');
    }
}

function unhighlightContact(checkbox) {
    if (checkbox) {
        checkbox.parentElement.classList.remove('form__contact-checkbox--checked');
    }
}

function filterDropdown(inputId, listSelector) {
    const value = document.getElementById(inputId).value.toLowerCase();
    document.querySelectorAll(listSelector).forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(value) ? 'flex' : 'none';
    });
}

function selectCategory(id) {
    const item = document.getElementById(`category-id-${id}`);
    const input = document.getElementById('category-input');
    const dropdown = document.getElementById('category-list');

    if (item && input) {
        const category = item.getAttribute('data-category');
        input.value = category;
    }

    if (dropdown && !dropdown.classList.contains('d_none')) {
        dropdown.classList.add('d_none');
    }
}

function addSubtask() {
    console.log("Adding subtask...");
    
}

function clearForm() {  
    uncheckAllContacts();    
}

function uncheckAllContacts() {
    const contactItems = document.querySelectorAll('.form__contact');

    contactItems.forEach((item) => {
        const checkbox = item.querySelector('.form__contact-checkbox');

        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            item.classList.remove('form__contact-checkbox--checked');
        }
    });
}

function getDatasetInfos() {
    const items = document.querySelectorAll('.form__contact');
    const contacts = [];

    items.forEach(item => {
        const contact = {
            id: parseInt(item.dataset.id, 10),
            shortname: item.dataset.shortname,
            fullname: item.dataset.fullname,
            color: item.dataset.color,
            selected: item.querySelector('.form__contact-checkbox')?.checked || false
        };

        contacts.push(contact);
    });

    console.log(contacts);
    return contacts;
}

const taskStructure = {
  "id": "1",
  "title": "Erstelle eine Task-Struktur",
  "description": "Enthält alle notwendigen Werte für eine Aufgabe.",
  "date": "2025-06-25",
  "category": "Funktionalität",
  "priority": "urgent",
  "assignedTo": [
    {
        "name": "Lee-Roy Romann",
        "email": "lee-roy@example.com",
        "color": "#0044cc",
        "initials": "LR"
    },
    {
        "name": "Philipp Novak",
        "email": "philipp@example.com",
        "color": "#00ccaa",
        "initials": "PN"
    }
  ],
  "subtask": [
    {
        "title": "Zahlen aktualisieren",
        "done": false
    },
    {
        "title": "CI-Folien integrieren",
        "done": true
    }
  ],
  "status": "open" 
}
