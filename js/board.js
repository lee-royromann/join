// Achtung: hier die genaue ID ermitteln und als Parameter mitgeben
function openOverlay()
{
    // Achtung: hier aktuellen index ermitteln
    
    const overlay = document.getElementById("overlay");
    overlay.classList.add("overlay--visible");
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("overlay--visible");
    document.body.style.overflow = '';
}