// Transfer to db.js

let tasksFirebase = [];

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

function init() {
    renderTasks();
}

function renderTasks() {
    let contentRef = document.getElementById("in-progress");
    contentRef.innerHTML = '';
    //contentredf.innerHTML += getTaskTemplate(tasksFirebase[0], 0);
    contentRef.innerHTML += getTaskTemplate();
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
