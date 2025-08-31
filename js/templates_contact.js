/**
 * Generates a contact list item shown on the contacts page.
 * 
 * @param {Object} contact - The contact object.
 * @param {string} initials - Initials to show in the avatar.
 * @returns {string} - HTML string for the contact list entry.
 */
function showUserInformation(contact, initials) {
    return `
        <div class="contact" id="contact${contact.id}" onclick="chooseContact(${contact.id}); showRespUserInfo()">
            <div class="avatar flex-box-center-center" style="background-color: ${contact.color}">${initials}</div>
            <div class="contact-info">
                <strong>${contact.username}</strong>
                <p class="accessibility">${contact.email}</p>
            </div>
        </div>
        `;
}


/**
 * Displays the full contact details panel.
 * * @param {Object} individualContact - The selected contact object.
 * @returns {string} - HTML string for the contact detail panel.
 */
function showContact(individualContact) {
    // Teilt den Namen in einzelne Wörter
    const nameParts = individualContact.username.trim().split(' ').filter(Boolean);
    let initials = '';

    if (nameParts.length > 0) {
        // Nimmt den ersten Buchstaben des ersten Wortes
        initials = nameParts[0].charAt(0).toUpperCase();
        // Wenn es mehr als ein Wort gibt, wird der erste Buchstabe des letzten Wortes hinzugefügt
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }
    }

    return `
        <div id="slide" class="user-slide-in">
            <div class="user-info-header">
                <div class="info-initial-2 flex-box-center-center" style="background-color: ${individualContact.color}">${initials}</div>
                <div class="info-name">
                    <h4 class="info-name__text">${individualContact.username}</h4>
                    <div class="container-editing-tools">
                        <div class="dpl-fl-al-cetr tools" onclick="editContact(${individualContact.id})"><img class="icon tools-edit" src="../assets/img/icon/edit.svg" alt=""><span>Edit</span></div>
                        <div class="dpl-fl-al-cetr tools" onclick="deleteContact(event, ${individualContact.id})"><img class="icon tools-delete" src="../assets/img/icon/delete.svg" alt=""><span>Delete</span></div>
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <p class="user-contact-info">Contact Information</p>
                </div>
                <div class="contact-box">
                    <div class="contact-info-box">
                        <p class="accessibility-description">Email</p>
                        <a class="accessibility" href="mailto:${individualContact.email}"> ${individualContact.email}</a>
                    </div>
                    <div class="contact-info-box">
                        <p class="accessibility-description">Phone</p>
                        <a class="accessibility" href="tel:${individualContact.phone}">${individualContact.phone}</a>
                    </div>
                </div>
            </div>
        </div>
        <div id="toolsRespContainer" class="tools-overlay-Container d-none" onclick="closeToolsresp()">
            <div id="toolsResp" class="editing-tools-resp d-none">
                <div class="dpl-fl-al-cetr tools tools-resp" onclick="editRespContact(${individualContact.id})"><img class="icon tools-edit" src="../assets/img/icon/edit.svg" alt=""><span>Edit</span></div>
                <div class="dpl-fl-al-cetr tools tools-resp" onclick="deleteContact(event, ${individualContact.id})"><img class="icon tools-delete" src="../assets/img/icon/delete.svg" alt=""><span>Delete</span></div>
            </div>
        </div>
    `;
}


/**
 * Returns the HTML for the overlay used to add a new contact.
 * * @returns {string} - HTML string for the add contact overlay.
 */
function showOverlayAddContact() {
    return `
        <div id="overlay" class="overlay-contact flex-box-center-center d-none" onclick="eventBubbling(event)">
            <div class="close-container" onclick="closeOverlay(event)">
                <img class="close-btn" id="closeBtnBlack" src="../assets/img/icon/close.svg" alt="">
                <img class="close-btn" id="closeBtnWhite" src="../assets/img/icon/close_white.svg" alt="" hidden>
            </div>
            <div class="overlay-cover">
                <img class="logo-img" src="../assets/img/logo/cover_join_white.svg" alt="">
                <div class="card-title">
                    <h5>Add contact</h5>
                    <p class="motivation-text">Tasks are better with a Team!</p>
                </div>
            </div>
            <div class="overlay-main-container flex-box-center-center">
                <div class="profil-img-container flex-box-center-center"><img class="profil-img" src="../assets/img/icon/person.svg" alt=""></div>
                
                <form onsubmit="createNewContact(); return false"> 
                    <div class="dpl-fl-colu input-container">
                        <label id="labelContactname" class="input-field">
                            <div class="input-content">
                                <input id="contactname" type="text" placeholder="Name" required>
                                <img class="input-icon" src="../assets/img/icon/person.svg" alt="">
                            </div>
                        </label>
                        <label id="labelEmail" class="input-field">
                            <div class="input-content">
                                <input id="email" type="email" placeholder="E-mail" required>
                                <img class="input-icon" src="../assets/img/icon/mail.svg" alt="">
                            </div>
                        </label>
                        <label id="labelPhone" class="input-field">
                            <div class="input-content">
                                <input id="phone" type="tel" placeholder="Phone" required
                                       minlength="6"
                                       maxlength="15"
                                       pattern="[0-9+ ]+"
                                       oninput="validatePhoneInput()">
                                <img class="input-icon" src="../assets/img/icon/call.svg" alt="">
                            </div>
                        </label>
                        <div id="phoneError" class="error-message d-none">Please enter a valid phone number (6-20 digits).</div>
                    </div>
                    <div class="submit-container">
                        <button class="blue-white-btn cancel" type="button" onclick="closeOverlay(event)">Cancel</button>
                        <button class="white-blue-btn create-contact-btn">Create contact</button>
                    </div>
                </form>
            </div>
        </div>`;
}


/**
 * Generates the overlay HTML template to edit a specific contact.
 * * @param {Object} individualUser - The contact object to edit.
 * @returns {string} - HTML string for the edit contact overlay.
 */
function overlayEditContact(individualUser) {
    return `
        <div id="overlay" class="overlay-contact flex-box-center-center d-none" onclick="eventBubbling(event)">
            <div class="close-container" onclick="closeOverlay(event)">
                <img class="close-btn" id="closeBtnBlack" src="../assets/img/icon/close.svg" alt="">
                <img class="close-btn" id="closeBtnWhite" src="../assets/img/icon/close_white.svg" alt="" hidden>
            </div>
            <div class="overlay-cover">
                <img class="logo-img" src="../assets/img/logo/cover_join_white.svg" alt="">
                <div class="card-title">
                    <h5>Edit Contact</h5>
                </div>
            </div>
            <div class="overlay-main-container flex-box-center-center">
                <div class="info-initial info-initial-overlay flex-box-center-center" style="background-color: ${individualUser.color}">${individualUser.username.split(" ").map(n => n[0]).join("")}</div>
                <form onsubmit="saveContact(${individualUser.id}); return false">
                    <div class="dpl-fl-colu input-container">
                        <label id="labelContactname" class="input-field">
                            <div class="input-content">
                                <input id="contactname" type="text" value="${individualUser.username}" placeholder="Name" required>
                                <img class="input-icon" src="../assets/img/icon/person.svg" alt="">
                            </div>
                        </label>
                        <label id="labelEmail" class="input-field">
                            <div class="input-content">
                                <input id="email" type="email" value="${individualUser.email}" placeholder="E-mail" required>
                                <img class="input-icon" src="../assets/img/icon/mail.svg" alt="">
                            </div>
                        </label>
                     <label id="labelPhone" class="input-field">
                            <div class="input-content">
                                <input id="phone" type="tel" value="${individualUser.phone}" placeholder="Phone" required
                                       minlength="6"
                                       maxlength="15"
                                       pattern="[0-9+ ]+"
                                       oninput="validatePhoneInput()">
                                <img class="input-icon" src="../assets/img/icon/call.svg" alt="">
                            </div>
                        </label>
                         <div id="phoneError" class="error-message d-none">Please enter a valid phone number (6-15 digits).</div>
                    </div>          
                    <div class="submit-container">
                        <button class="blue-white-btn" type="button" onclick="deleteContact(event, ${individualUser.id}); closeOverlay()">Delete</button>
                        <button class="white-blue-btn save-contact-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>`;
}


/**
 * Displays a message when a contact is successfully created.
 * 
 * @returns {string} - HTML feedback message.
 */
function showSuccessfulCreated() {
    return `<p>Contact successfully created </p>`;
}


/**
 * Displays a message when a contact is successfully deleted.
 * 
 * @returns {string} - HTML feedback message.
 */
function showSuccessfulDeleted() {
    return `<p>Contact successfully deleted </p>`;
}


/**
 * Returns a button with a vertical dot icon to open the responsive tools menu.
 * 
 * @returns {string} - HTML string for the responsive menu button.
 */
function changeBtnMore() {
    return `
        <div class="add-btn-resp" onclick="openToolsResp()">
            <img class="contact-img" src="../assets/img/icon/more_vert.svg" alt="">
        </div>`;
}


/**
 * Returns a button with a person add icon to open the responsive contact form.
 * 
 * @returns {string} - HTML string for the add contact button.
 */
function changeAddBtnPerson() {
    return `
        <div class="add-btn-resp" onclick="addRespContact()">
            <img class="contact-img" src="../assets/img/icon/person_add.svg" alt="">
        </div>`;
}


/**
 * Returns the overlay HTML for adding a contact in responsive view.
 * 
 * @returns {string} - HTML string for the add contact overlay (responsive).
 */
function showOverlayAddResp() {
    return `
    <div id="overlay" class="overlay-contact overlay-contact-resp d-none" onclick="eventBubbling(event)">
            <div class="overlay-cover-resp">
                <div class="close-resp-overlay" onclick="closeOverlay(event)"><img class="close-btn" src="../assets/img/icon/close_white.svg" alt=""></div>    
                <div class="card-title">
                    <h5>Add contact</h5>
                    <p class="motivation-text">Tasks are better with a Team!</p>
                </div>
            </div>
            <div class="overlay-main-container-resp">
                <div class="profil-img-container flex-box-center-center profil-img-resp"><img class="profil-img" src="../assets/img/icon/person.svg" alt=""></div>
                <form onsubmit="createNewContact(); return false">
                    <div class="dpl-fl-colu input-container-resp">
                        <label id="labelContactname" class="input-field input-field-resp">
                            <div class="input-content-resp">
                                <input id="contactname" type="text" placeholder="Name" onkeyup="correctedInput('labelContactname', 'contactname')" onblur="finishTheCorrection('labelContactname')">
                                <img class="input-icon" src="../assets/img/icon/person.svg" alt="">
                            </div>
                        </label>
                        <label id="labelEmail" class="input-field input-field-resp">
                            <div class="input-content-resp">
                                <input id="email" type="text" placeholder="E-mail" onkeyup="correctedInput('labelEmail', 'email')" onblur="finishTheCorrection('labelEmail')">
                                <img class="input-icon" src="../assets/img/icon/mail.svg" alt="">
                            </div>
                        </label>
                        <label id="labelPhone" class="input-field input-field-resp">
                            <div class="input-content-resp">
                                <input id="phone" type="tel" placeholder="Phone" inputmode="numeric" onkeyup="correctedInput('labelPhone', 'phone')" onblur="finishTheCorrection('labelPhone')">
                                <img class="input-icon" src="../assets/img/icon/call.svg" alt="">
                            </div>
                        </label>
                        <p id="poppin" class="poppins opacity"></p>
                    </div>
                    <div class="submit-container submit-container-resp">    
                        <button class="white-blue-btn white-blue-btn-resp">Create contact</button>
                    </div>
                </form>
            </div>
        </div>`;
}


/**
 * Returns the overlay HTML for editing a contact in responsive view.
 * 
 * @param {Object} individualContact - The contact object to edit.
 * @returns {string} - HTML string for the edit contact overlay (responsive).
 */
function showOverlayEditResp(individualContact) {
    return `
    <div id="overlay" class="overlay-contact overlay-contact-resp" onclick="eventBubbling(event)">
            <div class="overlay-cover-resp">
                <div class="close-resp-overlay" onclick="closeOverlay(event)"><img class="close-btn" src="../assets/img/icon/close_white.svg" alt=""></div>    
                <div class="card-title">
                    <h5>Add contact</h5>
                    <p class="motivation-text">Tasks are better with a Team!</p>
                </div>
            </div>
            <div class="overlay-main-container-resp">
                <div class="profil-img-container flex-box-center-center profil-img-resp" style="background-color: ${individualContact.color}">${individualContact.username.split(" ").map(n => n[0]).join("")}</div>
                <form onsubmit="saveContact(${individualContact.id}); return false" onkeydown="return event.key != 'Enter';">
                    <div class="dpl-fl-colu input-container-resp">
                        <label id="labelContactname" class="input-field input-field-resp">
                            <div class="input-content-resp">
                                <input id="contactname" type="text" value="${individualContact.username}" placeholder="Name" onkeyup="correctedInput('labelContactname', 'contactname')" onblur="finishTheCorrection('labelContactname')">
                                <img class="input-icon" src="../assets/img/icon/person.svg" alt="">
                            </div>
                        </label>
                        <label id="labelEmail" class="input-field input-field-resp">
                            <div class="input-content-resp">
                                <input id="email" type="text" value="${individualContact.email}" placeholder="E-mail" onkeyup="correctedInput('labelEmail', 'email')" onblur="finishTheCorrection('labelEmail')">
                                <img class="input-icon" src="../assets/img/icon/mail.svg" alt="">
                            </div>
                        </label>
                        <label id="labelPhone" class="input-field input-field-resp">
                            <div class="input-content-resp">
                                <input id="phone" type="tel" value="${individualContact.phone}" placeholder="Phone" inputmode="numeric" onkeyup="correctedInput('labelPhone', 'phone')" onblur="finishTheCorrection('labelPhone')">
                                <img class="input-icon" src="../assets/img/icon/call.svg" alt="">
                            </div>
                        </label>
                        <p id="poppin" class="poppins opacity"></p>
                    </div>
                    <div class="submit-container submit-container-resp">
                        <button class="blue-white-btn" onclick="deleteContact(event, ${individualContact.id}); closeOverlay()">Delete</button>
                        <button class="white-blue-btn white-blue-btn-resp">Save</button>
                    </div>
                </form>
            </div>
        </div>`;
}
