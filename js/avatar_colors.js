/**
 * @file A module for managing and assigning unique avatar colors.
 * Uses a predefined palette to ensure that the colors are visually appealing
 * and do not repeat until the pool is exhausted.
 */

/**
 * A predefined list of appealing and easily readable colors for avatars.
 * @type {string[]}
 */
const AVATAR_COLORS = [
  '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1',
  '#FFC701', '#0038FF', '#C3FF2B', '#FF4646', '#FFBB2B', '#462F8A',
  '#FF4A4A', '#29ABE2', '#FC71FF', '#007CEE'
];

/**
 * A set that stores the colors already used in the current session
 * to avoid duplicates.
 * @type {Set<string>}
 */
let usedColors = new Set();


// --- Hilfsfunktionen zur Kontrastberechnung ---
// Diese sind notwendig, damit die Hauptfunktion die Prüfung durchführen kann.

function getContrastRatio(hexColor1, hexColor2) {
  const getLuminance = (hex) => {
    // Konvertiert Hex zu RGB und berechnet die Luminanz in einer Funktion
    let rgb = parseInt(hex.substring(1), 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;
    
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const lum1 = getLuminance(hexColor1);
  const lum2 = getLuminance(hexColor2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}


/**
 * Selects a unique and random color from the global palette that meets the contrast requirement.
 * If a chosen color fails the contrast check, it picks a new one until a valid color is found.
 * If all colors from the palette have been used, the pool is reset.
 *
 * @returns {string} A hexadecimal color code (e.g. '#FF7A00').
 */
function getUniqueAvatarColor() {
  const colorWhite = '#FFFFFF';
  const requiredRatio = 5.2;

  // Erstellt eine Liste der Farben, die noch nicht verwendet wurden.
  let availableColors = AVATAR_COLORS.filter(color => !usedColors.has(color));

  // Wenn alle Farben verwendet wurden, setze den Pool zurück.
  if (availableColors.length === 0) {
    resetUsedColors();
    availableColors = [...AVATAR_COLORS]; 
  }

  // --- START DER NEUEN PRÜF-LOGIK ---
  // Die Schleife läuft so lange, bis eine passende Farbe gefunden und zurückgegeben wird.
  while (true) {
    // Wenn keine verfügbaren Farben mehr übrig sind (weil alle den Test nicht bestanden haben),
    // breche ab und gib eine sichere Fallback-Farbe zurück, um eine Endlosschleife zu vermeiden.
    if (availableColors.length === 0) {
      console.error("Keine verfügbare Farbe erfüllt das Kontrastverhältnis. Fallback wird genutzt.");
      return '#462F8A'; // Eine bekannte, sichere Farbe aus der Liste
    }

    // 1. Wähle eine zufällige Farbe aus den VERFÜGBAREN.
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const chosenColor = availableColors[randomIndex];

    // 2. PRÜFE, ob die Farbe das Kontrastverhältnis erfüllt.
    if (getContrastRatio(chosenColor, colorWhite) >= requiredRatio) {
      // WENN JA: Farbe ist gut. Speichere sie und gib sie zurück.
      usedColors.add(chosenColor);
      return chosenColor; // Beendet die Funktion und die Schleife
    } else {
      // WENN NEIN: Die Farbe ist nicht geeignet. Entferne sie aus der Liste der
      // verfügbaren Farben für diesen Versuch und die Schleife läuft erneut.
      availableColors.splice(randomIndex, 1);
    }
  }
}

/**
 * Resets the pool of used colors.
 * This can be useful when a page or a component list is re-rendered.
 */
function resetUsedColors() {
  usedColors.clear();
}