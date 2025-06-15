// The following code is initially used for optical designing.
// The code will be optimized, once the design is finalized.

const contactSelector = document.getElementById('contact-selector');
const contactDropdown = document.getElementById('contact-dropdown');
const contactSearch = document.getElementById('contact-search');
const contactList = document.getElementById('contact-list');
const contacts = document.querySelectorAll('.task-form__dropdown-contact');

function initAddTask() {
    loadSidebar();
    populateContactsToDropdown();
}

function loadSidebar() {
    console.log("Loading sidebar...");
}

function populateContactsToDropdown() {
    console.log("Populating contacts to dropdown...");
}

function toggleContactDropdown(event) {
	contactDropdown.classList.toggle('d_none');
}

function filterContacts() {
	const input = document.getElementById('contact-search').value.toLowerCase();
	const contacts = document.querySelectorAll('.task-form__dropdown-contact');
	
	contacts.forEach(item => {
		const name = item.querySelector('.task-form__dropdown-name').textContent.toLowerCase();
		item.style.display = input === '' || name.includes(input) ? 'flex' : 'none';
	});
}

function selectContact(id) {
	let checkbox = document.getElementById(`contact-checkbox-${id}`);
	if (checkbox) {
		checkbox.checked = !checkbox.checked;
	}
	if (checkbox.checked) {
		checkbox.parentElement.classList.add('task-form__dropdown-checkbox--checked');
	} else {
		checkbox.parentElement.classList.remove('task-form__dropdown-checkbox--checked');
	}
}