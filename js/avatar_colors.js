/**
 * @file Ein Modul zur Verwaltung und Zuweisung einzigartiger Avatar-Farben.
 * Verwendet eine vordefinierte Palette, um sicherzustellen, dass die Farben ästhetisch ansprechend sind
 * und sich nicht wiederholen, bis der Pool erschöpft ist.
 */

/**
 * Eine vordefinierte Liste von ansprechenden und gut lesbaren Farben für Avatare.
 * @type {string[]}
 */
const AVATAR_COLORS = [
  '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1',
  '#FFC701', '#0038FF', '#C3FF2B', '#FF4646', '#FFBB2B', '#462F8A',
  '#FF4A4A', '#29ABE2', '#FC71FF', '#007CEE'
];

/**
 * Ein Set, das die bereits verwendeten Farben in der aktuellen Sitzung speichert,
 * um Duplikate zu vermeiden.
 * @type {Set<string>}
 */
let usedColors = new Set();

/**
 * Wählt eine einzigartige und zufällige Farbe aus der globalen Palette.
 * Wenn alle Farben aus der Palette verwendet wurden, wird der Pool zurückgesetzt und von vorn begonnen.
 *
 * @returns {string} Ein hexadezimaler Farbcode (z.B. '#FF7A00').
 */
function getUniqueAvatarColor() {
  // Filtere die Farben heraus, die noch nicht verwendet wurden.
  let availableColors = AVATAR_COLORS.filter(color => !usedColors.has(color));

  // Wenn alle Farben aus der Palette bereits verwendet wurden, setze den Pool zurück.
  if (availableColors.length === 0) {
    resetUsedColors();
    availableColors = [...AVATAR_COLORS]; // Kopiere die volle Palette erneut
  }

  // Wähle eine zufällige Farbe aus den verfügbaren Farben.
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const chosenColor = availableColors[randomIndex];

  // Markiere die gewählte Farbe als "verwendet".
  usedColors.add(chosenColor);

  return chosenColor;
}

/**
 * Setzt den Pool der verwendeten Farben zurück.
 * Dies kann nützlich sein, wenn eine Seite oder eine Komponentenliste neu gerendert wird.
 */
function resetUsedColors() {
  usedColors.clear();
}
