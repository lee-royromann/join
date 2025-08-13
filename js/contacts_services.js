/**
 * Verhindert die Event-Weitergabe in der Bubbling-Phase.
 * @param {Event} event Das Event-Objekt.
 */
function eventBubbling(event) {
	event.stopPropagation();
}


/** Leert die Kontaktliste im HTML. */
function cleanContactsList() {
	document.getElementById("contactList").innerHTML = "";
}


/** Gruppiert Kontakte nach Initialen und rendert die HTML-Liste. */
function groupInitials() {
	let group = {};
	contactsFirebase.forEach((contact) => {
		if (contact && contact.username.trim() !== "") {
			const initial = contact.username.trim()[0].toUpperCase();
			if (!group[initial]) {
				group[initial] = [];
			}
			group[initial].push(contact);
		}
	});
	createHTML(group);
}


/**
 * Erstellt die HTML-Elemente für jede Buchstabengruppe.
 * @param {Object} list Die gruppierte Kontaktliste.
 */
function createHTML(list) {
	let containerList = document.getElementById("contactList");
	Object.keys(list)
		.sort()
		.forEach((letter) => {
			const section = document.createElement("div");
			section.classList.add("tab");
			section.innerHTML = `<h3>${letter}</h3><hr>`;
			userData(list, letter, section);
			containerList.appendChild(section);
		});
}


/**
 * Fügt die Benutzerdaten-HTML zu einer Sektion hinzu.
 * @param {Object} list Die gruppierte Kontaktliste.
 * @param {string} letter Der Buchstabe der Gruppe.
 * @param {HTMLElement} section Die Sektion, zu der hinzugefügt wird.
 */
function userData(list, letter, section) {
	list[letter].forEach((contact) => {
		const initials = contact.username
			.split(" ")
			.map((n) => n[0])
			.join("");
		section.innerHTML += showUserInformation(contact, initials);
	});
}


/**
 * Hebt einen ausgewählten Kontakt hervor.
 * @param {string|number} id Die ID des Kontakts.
 */
function setClassChoooseContact(id) {
	document.getElementById(`contact${id}`)?.classList.add("choose-contact");
}


/** Entfernt die Hervorhebung von allen Kontakten. */
function resetClassChooseContact() {
	document.querySelectorAll(".contact").forEach((element) => {
		element.classList.remove("choose-contact");
	});
}


/**
 * Findet ein Kontakt-Objekt anhand der ID.
 * @param {string|number} id Die ID des Kontakts.
 * @returns {Object|undefined} Der gefundene Kontakt.
 */
function findContact(id) {
	return contactsFirebase.find((c) => c.id == id);
}


/** Leert den Bereich für die Kontaktinformationen. */
function clearMainContact() {
	document.getElementById("contactInformation").innerHTML = "";
}


/**
 * Zeigt die Detailinformationen für einen Kontakt an.
 * @param {string|number} id Die ID des Kontakts.
 */
function userInfo(id) {
	let individualContact = findContact(id);
	document.getElementById("contactInformation").innerHTML += showContact(individualContact);
	slideIn();
}


/** Animiert das Hereinschieben der Kontaktdetails. */
function slideIn() {
	setTimeout(() => document.getElementById("slide")?.classList.add("active"), 10);
}


/** Öffnet das Kontakt-Overlay mit einer Animation. */
function openOverlay() {
	document.getElementById("overlayContact").classList.remove("d-none");
	const overlay = document.getElementById("overlay");
	overlay.classList.remove("d-none");
	setTimeout(() => overlay.classList.add("slide"), 10);
}


/**
 * Schließt das Kontakt-Overlay.
 * @param {Event} event Das zu unterdrückende Event.
 */
function closeOverlay(event) {
	suppressActionEvent(event);
	const overlay = document.getElementById("overlay");
	overlay.classList.remove("slide");
	setTimeout(() => overlay.classList.add("d-none"), 200);
	setTimeout(() => document.getElementById("overlayContact").classList.add("d-none"), 100);
}


/**
 * Verhindert die Standardaktion eines Events.
 * @param {Event} event Das Event-Objekt.
 */
function suppressActionEvent(event) {
	if (event) {
		event.preventDefault();
	}
}


/** Leert den Inhalt des Kontakt-Overlays. */
function clerOverlay() {
	document.getElementById("overlayContact").innerHTML = "";
}


/** Zeigt das "Kontakt hinzufügen"-Formular im Overlay an. */
function openAddContact() {
	document.getElementById("overlayContact").innerHTML = showOverlayAddContact();
}


/**
 * Zeigt das "Kontakt bearbeiten"-Formular im Overlay an.
 * @param {string|number} id Die ID des Kontakts.
 */
function openEditContact(id) {
	let contact = findContact(id);
	document.getElementById("overlayContact").innerHTML = overlayEditContact(contact);
}


/** Zeigt das responsive "Kontakt hinzufügen"-Formular an. */
function openAddRespContact() {
	document.getElementById("overlayContact").innerHTML = showOverlayAddResp();
}


/**
 * Zeigt das responsive "Kontakt bearbeiten"-Formular an.
 * @param {string|number} id Die ID des Kontakts.
 */
function openEditRespContact(id) {
	let contact = findContact(id);
	document.getElementById("overlayContact").innerHTML = showOverlayEditResp(contact);
}


/**
 * Aktualisiert die Daten eines Kontakts basierend auf den Formularfeldern.
 * @param {string|number} id Die ID des Kontakts.
 */
function updateUserData(id) {
	let contact = findContact(id);
	if (contact) {
		let nameValue = document.getElementById("contactname").value;
		let nameParts = nameValue.trim().split(/\s+/);
		contact.prename = nameParts[0];
		contact.surname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
		contact.username = nameValue.trim();
		contact.email = document.getElementById("email").value;
		contact.phone = document.getElementById("phone").value;
	}
}


/**
 * Holt die Farbe eines Kontakts anhand seiner ID.
 * @param {string|number} id Die ID des Kontakts.
 * @returns {string} Die Farbe als String oder 'brown' als Standard.
 */
function getContactColorById(id) {
	const contact = contactsFirebase.find((c) => c.id === id);
	return contact ? contact.color : "brown";
}


/**
 * Löscht einen Kontakt aus dem lokalen Array anhand der ID.
 * @param {number} id Die ID des zu löschenden Kontakts.
 */
function deleteUserData(id) {
	contactsFirebase = contactsFirebase.filter((user) => user.id !== id);
}


/** Ordnet die IDs der Kontakte neu, um sie sequenziell zu halten. */
function reSortUser() {
	contactsFirebase.forEach((user, index) => {
		user.id = index;
	});
}


/** Erstellt einen neuen Kontakt aus den Formularfeldern und fügt ihn zum Array hinzu. */
function pushNewContact() {
	let nameValue = document.getElementById("contactname").value;
	let nameParts = nameValue.trim().split(/\s+/);
	let newContact = {
		id: contactsFirebase.length,
		prename: nameParts[0],
		surname: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
		username: nameValue.trim(),
		email: document.getElementById("email").value,
		phone: document.getElementById("phone").value,
		color: getUniqueAvatarColor(),
	};
	contactsFirebase.push(newContact);
}


/** Animiert das Erfolgs-Feedback. */
function successChange() {
	setTimeout(() => {
		let success = document.getElementById("success");
		let succContainer = document.getElementById("successContainer");
		success.classList.remove("d-none");
		succContainer.classList.remove("d-none");
		setTimeout(() => success.classList.add("show-successful"), 10);
		setTimeout(() => success.classList.remove("show-successful"), 1510);
		setTimeout(() => {
			success.classList.add("d-none");
			succContainer.classList.add("d-none");
		}, 1730);
	}, 500);
}


/** Leert den Container für Erfolgsmeldungen. */
function clearSuccessfulContainer() {
	document.getElementById("success").innerHTML = "";
}


/** Zeigt eine Erfolgsmeldung für das Erstellen von Kontakten. */
function successfulAddContact() {
	document.getElementById("success").innerHTML = showSuccessfulCreated();
}


/** Zeigt eine Erfolgsmeldung für das Löschen von Kontakten. */
function successfulDeleteContact() {
	document.getElementById("success").innerHTML = showSuccessfulDeleted();
}


/** Leert den Container für den responsiven Button. */
function cleanContainerBtn() {
	document.getElementById("addBtnResp").innerHTML = "";
}


/** Ändert den responsiven Button zu "Mehr". */
function changeOfMoreBtn() {
	document.getElementById("addBtnResp").innerHTML = changeBtnMore();
}


/** Öffnet das responsive Tools-Overlay. */
function openToolsResp() {
	let toolOverlay = document.getElementById("toolsRespContainer");
	let toolcontainer = document.getElementById("toolsResp");
	toolOverlay.classList.remove("d-none");
	toolcontainer.classList.remove("d-none");
	setTimeout(() => toolcontainer.classList.add("tools-resp-active"), 10);
}


/** Schließt das responsive Tools-Overlay. */
function closeToolsresp() {
	let toolcontainer = document.getElementById("toolsResp");
	if (toolcontainer) {
		toolcontainer.classList.remove("tools-resp-active");
		setTimeout(() => {
			toolcontainer.classList.add("d-none");
			document.getElementById("toolsRespContainer").classList.add("d-none");
		}, 200);
	}
}


/** Zeigt den responsiven Zurück-Button an. */
function setBackBtn() {
	document.querySelector(".back-btn-resp").classList.add("d-opacity");
}


/** Versteckt den responsiven Zurück-Button. */
function removeBackBtn() {
	document.querySelector(".back-btn-resp").classList.remove("d-opacity");
}


/** Ändert den Button zu "Person hinzufügen". */
function changeOfAddPersoneBtn() {
	document.getElementById("addBtnResp").innerHTML = changeAddBtnPerson();
}


/**
 * Generiert eine zufällige Farbe für Avatare.
 * @returns {string} Ein Hex-Farbcode.
 */
function getUniqueAvatarColor() {
	const colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
	return colors[Math.floor(Math.random() * colors.length)];
}
