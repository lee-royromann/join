/**
 * Loads and appends the dashboard summary template into the given container element.
 * - Displays key metrics placeholders such as "To-do", "Done", "Urgent", "Upcoming Deadline",
 *   and task statistics (board, progress, feedback).
 * - Includes sections for greeting the user with a dynamic username and greeting text.
 * - Uses placeholder values (`0`, default date, "Guest") that are expected to be updated dynamically.
 * - Provides navigation via links (`board.html`) from each metric card.
 * @param {HTMLElement} container - The DOM element where the summary template will be appended.
 */
function loadSummaryTemplate(container) {
    container.innerHTML += `
        <main class="main">
          <section class="dashboard">
            <div class="dashboard__header">
              <h1 class="dashboard__title">Join 360</h1>
              <div class="dashboard__seperator"></div>
              <p class="dashboard__subtitle">Key Metrics at a Glance</p>
            </div>
            <div class="card__row">
              <a href="board.html" class="card__link">
                <div class="card">
                  <div class="card__header">
                    <div class="card__icon">
                      <img src="../assets/img/icon/edit_white.svg" alt="Tasks Icon">
                    </div>
                    <div class="card__number-label">
                      <p class="card__number" id="count-todo">0</p>
                      <p class="card__label">To-do</p>
                    </div>
                  </div>
                </div>
              </a>
              <a href="board.html" class="card__link">
                <div class="card">
                  <div class="card__header">
                    <div class="card__icon">
                      <img src="../assets/img/icon/done_white.svg" alt="Done Icon">
                    </div>
                    <div class="card__number-label">
                      <p class="card__number" id="count-done">0</p>
                      <p class="card__label">Done</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div class="card__row">
              <a href="board.html" class="card__link">
                <div class="card__urgent card__urgent-inline">
                  <div class="card__urgent-left">
                    <div class="card__urgent-content">
                      <span class="card__urgent-icon">
                        <img src="../assets/img/icon/urgent_white.svg" alt="Urgent">
                      </span>
                      <div class="card__urgent-number-label">
                        <span class="card__number" id="count-urgent">0</span>
                        <p class="card__label">Urgent</p>
                      </div>
                    </div>
                  </div>
                  <div class="card__urgent-seperator"></div>
                  <div class="card__urgent-right">
                    <p class="card__date" id="upcoming-deadline-date">October 16, 2022</p>
                    <p class="card__deadline">Upcoming Deadline</p>
                  </div>
                </div>
              </a>
              <div class="card__greeting card__greeting-inline">
                <div>
                  <p class="card__greetings-text" id="greeting-text">Good morning,</p>
                  <p class="card__username" id="greeting-username">Guest</p>
                </div>
              </div>
            </div>
            <div class="card__row">
              <a href="board.html" class="card__link">
                <div class="card__overview">
                  <p class="card__number" id="count-board">0</p>
                  <p class="card__label">Tasks in Board</p>
                </div>
              </a>
              <a href="board.html" class="card__link">
                <div class="card__overview">
                  <p class="card__number" id="count-progress">0</p>
                  <p class="card__label">Tasks In Progress</p>
                </div>
              </a>
              <a href="board.html" class="card__link">
                <div class="card__overview">
                  <p class="card__number" id="count-feedback">0</p>
                  <p class="card__label">Awaiting Feedback</p>
                </div>
              </a>
            </div>
          </section>
        </main>
    `;
}


/**
 * Creates the mobile greeting template
 */
function getMobileGreetingTemplate(greetingText, username, isGuest) {
    return `
        <div class="mobile-greeting-content">
            <div class="mobile-greeting-text">${greetingText}</div>
            ${!isGuest ? `<div class="mobile-greeting-username">${username}</div>` : ''}
            ${!isGuest ? '<div class="mobile-greeting-subtitle"></div>' : ''}
        </div>
    `;
}