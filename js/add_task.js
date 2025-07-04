// The following code is initially used for optical designing.
// The code will be optimized, once the design is finalized.

const priorities = ['urgent', 'medium', 'low'];
let currentOpenDropdown = null;

function initAddTask() {
    loadSidebar();
    populateContactsToDropdown();
}

document.addEventListener('click', function (event) {
    if (currentOpenDropdown) {
        const { dropdown, arrow } = currentOpenDropdown;
        if (!dropdown.contains(event.target) &&
            !arrow.contains(event.target) &&
            !event.target.closest('.form__input')) {
            dropdown.classList.add('d_none');
            arrow.classList.remove('arrow-icon-rotated');
            currentOpenDropdown = null;
        }
    }
});

function loadSidebar() {
    console.log("Loading sidebar...");
}

function setPriority(priority) {
    resetPriorityButtons();
    let button = document.getElementById(`btn-${priority}`);
    button.classList.add(`form__button-prio--${priority}`);
}

function resetPriorityButtons() {
    const buttons = document.querySelectorAll('.form__button-prio');
    buttons.forEach(button => {
        priorities.forEach(prio => {
            button.classList.remove(`form__button-prio--${prio}`);
        });
    });
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

function toggleDropdown(event, dropdownId, arrowIconId) {
    event.stopPropagation();
    const dropdown = document.getElementById(dropdownId);
    const arrow = document.getElementById(arrowIconId);
    const isOpen = !dropdown.classList.contains('d_none');

    if (isOpen) {
        dropdown.classList.add('d_none');
        arrow.classList.remove('arrow-icon-rotated');
        currentOpenDropdown = null;
    } else {
        if (currentOpenDropdown) {
            currentOpenDropdown.dropdown.classList.add('d_none');
            currentOpenDropdown.arrow.classList.remove('arrow-icon-rotated');
        }
        dropdown.classList.remove('d_none');
        arrow.classList.add('arrow-icon-rotated');
        currentOpenDropdown = { dropdown, arrow };
    }
}

function selectContact(id) {
    const checkbox = document.getElementById(`contact-checkbox-${id}`);
    const listItem = document.getElementById(`contact-id-${id}`);
    if (!checkbox || !listItem) return;
    const iconChecked = listItem.querySelector('.form__contact-checkbox-icon-checked');
    const iconUnchecked = listItem.querySelector('.form__contact-checkbox-icon-unchecked');
    if (!iconChecked || !iconUnchecked) return;
    const isChecked = checkbox.checked = !checkbox.checked;
    if (isChecked) {
        iconChecked.classList.remove('d_none');
        iconUnchecked.classList.add('d_none');
        highlightContact(checkbox);
    } else {
        iconChecked.classList.add('d_none');
        iconUnchecked.classList.remove('d_none');
        unhighlightContact(checkbox);
    }
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

function selectCategory(id, arrowIconId) {
    const item = document.getElementById(`category-id-${id}`);
    const input = document.getElementById('category-input');
    const dropdown = document.getElementById('category-list');
    const arrowIcon = document.getElementById(arrowIconId);

    if (item && input) {
        const category = item.getAttribute('data-category');
        input.value = category;
    }

    if (dropdown && !dropdown.classList.contains('d_none')) {
        dropdown.classList.add('d_none');
    }

    arrowIcon.classList.remove('arrow-icon-rotated');
}

function addSubtask() {
    console.log("Adding subtask...");
    
}

function clearForm() {  
    uncheckAllContacts();
    resetPriorityButtons();
}

function uncheckAllContacts() {
    const contactItems = document.querySelectorAll('.form__contact');

    contactItems.forEach((item) => {
        const checkbox = item.querySelector('.form__contact-checkbox');
        const iconChecked = item.querySelector('.form__contact-checkbox-icon-checked');
        const iconUnchecked = item.querySelector('.form__contact-checkbox-icon-unchecked');
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            item.classList.remove('form__contact-checkbox--checked');
            iconChecked.classList.add('d_none');
            iconUnchecked.classList.remove('d_none');
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

// Example dataset for tasks
let tasksArray = [
    {
        "id": 0,
        "title": "Task 1",
        "description": "Beschreibung 1",
        "date": "2025-06-25",
        "category": "User Story",
        "priority": "medium",
        "assignedTo": [0,2,3],
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
        "status": "in progress" // "to-do", "in progress", "await feedback", "done"
    },
    {
        "id": 1,
        "title": "Task 2",
        "description": "Beschreibung 2",
        "date": "2025-06-25",
        "category": "Technical Task",
        "priority": "urgent",
        "assignedTo": [0,4,5],
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
        "status": "await feedback" // "to-do", "in progress", "await feedback", "done"
    }
]


// korrigiertes Dataset - jedes Task ein Objekt nicht Array
 "tasks": {
      "0": {
        "title": "Task 1",
        "description": "Beschreibung 1",
        "date": "2025-06-25",
        "category": "User Story",
        "priority": "medium",
        "assignedTo": [0, 2, 3],
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
        "status": "in progress"
      },
      "1": {
        "title": "Task 2",
        "description": "Beschreibung 2",
        "date": "2025-06-25",
        "category": "Technical Task",
        "priority": "urgent",
        "assignedTo": [0],
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
        "status": "await feedback"
      }
    }