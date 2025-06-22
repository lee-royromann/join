// Achtung: hier die genaue ID ermitteln und als Parameter mitgeben
function openOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    document.body.style.overflow = 'hidden';
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
}