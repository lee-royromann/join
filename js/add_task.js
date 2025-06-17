// The following code is initially used for optical designing.
// The code will be optimized, once the design is finalized.

function initAddTask() {
    loadSidebar();
    populateContactsToDropdown();
}

function loadSidebar() {
    console.log("Loading sidebar...");
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
    const checkbox = document.getElementById('contact-checkbox-' + id);

    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.parentElement.classList.toggle('task-form__dropdown-checkbox--checked', checkbox.checked);
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