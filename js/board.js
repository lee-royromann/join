// Transfer to db.js

let tasksFirebase = [];
const BASE_URL = "https://join-472-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Lädt Tasks aus Firebase und speichert sie in `tasksFirebase`.
 * @returns {Promise<void>}
 */
async function loadTasksFromFirebase() {
    let response = await fetch(BASE_URL + "join/tasks.json");
    let responseToJson = await response.json();
    tasksFirebase = Object.values(responseToJson);
    console.log(tasksFirebase);
    console.log(tasksFirebase.length);
  }


// Achtung: hier die genaue ID ermitteln und als Parameter mitgeben
function openOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    document.body.style.overflow = 'hidden';
    renderOverlayTask();
}

function closeOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    document.body.style.overflow = '';
}

function openEditOverlay() {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    story.classList.add("d-none");
    edit.classList.remove("d-none");
    renderEditTask();
}

function closeEditOverlay() {
    const story = document.getElementById("story");
    const edit = document.getElementById("edit");
    story.classList.remove("d-none");
    edit.classList.add("d-none");
}

async function init() {
    await loadTasksFromFirebase();
    renderTasks();
}

function renderTasks() {
     // Zuerst alle Container (Spalten) leeren
  document.getElementById("to-do").innerHTML = "";
  document.getElementById("in-progress").innerHTML = "";
  document.getElementById("await-feedback").innerHTML = "";
  document.getElementById("done").innerHTML = "";

  // Jetzt alle Tasks aus dem Array durchgehen
  for (let i = 0; i < tasksFirebase.length; i++) {
    let task = tasksFirebase[i]; // Aktueller Task
    console.log(task);

    // Hole den Status z. B. "in-progress"
    let status = task.status;

    // Hole das passende HTML-Element anhand des Status
    let column = document.getElementById(status);

    // Falls es tatsächlich eine Spalte mit dieser ID gibt:
    if (column) {
      // Füge das generierte HTML des Tasks in die Spalte ein
      column.innerHTML += getTaskTemplate(task);
    }
  }
}

function getSubtaskProgress(task) {
  const total = task.subtask?.length || 0;
  const done = task.subtask?.filter(st => st.done).length || 0;
  const percent = total > 0 ? (done / total) * 100 : 0;

  return { total, done, percent };
}

function renderOverlayTask() {
    let contentRef = document.getElementById("story");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getOverlayTemplate();
}

function renderEditTask() {
    let contentRef = document.getElementById("edit");
    contentRef.innerHTML = '';
    // Hier sollte die Logik zum Rendern der Overlay-Task-Details stehen    
    contentRef.innerHTML += getEditTemplate();
}




// Erweiterung der Funktion renderTasks, um die Tasks aus Firebase zu laden
// function render Tasks() {
//     const columns = ['to_do', 'in_progress', 'await_feedback', 'done'];
//     columns.forEach(column => {      
//         const contentRef = document.getElementById(column.replace('_', '-')); // Replace _ with - for HTML IDs
//         contentRef.innerHTML = '';   
//         tasksFirebase.forEach(task => {
//             if (task.status === column) {        
//                 // Assuming generateTaskHTML is a function that returns the HTML for a task
//                 // You need to implement this function to generate the HTML for each task
//                 //Brauche ich hier eine for schleife um das i zu füllen oder kann ich mit der ID arbeiten?
//                 // contentRef.innerHTML += getTaskTemplate(task, i);

//             }
//         });
//     });
