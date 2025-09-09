/**
 * Open the task detail overlay for a given task ID.
 * Locks body scrolling and triggers slide-in animation.
 * @param {number} taskId 
 */
function openOverlay(taskId) {
    const overlay = document.getElementById("overlay");
    const story = document.getElementById("story");
    overlay.classList.remove("d-none");
    overlay.classList.add("overlay--visible");
    setTimeout(() => {
        overlay.classList.add('overlay--slide-in');
    }, 15);
    document.body.style.overflow = 'hidden';
    story.classList.remove("d-none");
    renderOverlayTask(taskId);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay();
            closeEditOverlay();
        }
    });
}


/**
 * Hide the overlay and wait for its CSS transition to finish.
 * @param {HTMLElement} overlay
 * @returns {Promise<void>} Resolves after the transition (or a short fallback timeout).
 */
function hideOverlay(overlay) {
    overlay.classList.remove('overlay--slide-in');
    return new Promise(resolve => {
        const onEnd = (e) => {
            if (e.target !== overlay) return;
            overlay.removeEventListener('transitionend', onEnd);
            resolve();
        };
        overlay.addEventListener('transitionend', onEnd, { once: true });
        setTimeout(resolve, 200);
    }).then(() => {
        overlay.classList.remove('overlay--visible');
        overlay.classList.add('d-none');
        document.body.style.overflow = '';
    });
}


/**
 * Render the read-only task overlay for a given task ID.
 * @param {string|number} taskId
 * @returns {void}
 */
function renderOverlayTask(taskId) {
    const task = tasksFirebase.find(t => t.id === taskId);
    if (!task) return;
    let contentRef = document.getElementById("story");
    contentRef.innerHTML = '';
    contentRef.innerHTML = getOverlayTemplate(task);
}


/**
 * /** Precomputes all values the overlay template needs (no DOM manipulation here).
 */
export function createOverlayView(task) {
  const { className, name } = getCategoryInfo(task.category);
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    date: task.date,
    categoryClass: className,
    categoryName: name,
    priorityLabel: cap(task.priority),
    priorityIcon: getPriorityIcon(task.priority),
    contactsHtml: renderAssignedContacts(task),
    subtasksHtml: getSubtask(task.subtask, task.id)
  };
}


import { createOverlayView } from './overlay.view.js';
import { overlayTemplate }   from './overlay.template.js';

export function renderOverlay(task) {
  const v = createOverlayView(task);
  return overlayTemplate(v); // ergibt der reine HTML-String
}

