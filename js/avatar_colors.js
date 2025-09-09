/** getUniqueAvatarColor() Everywhere with color brown, add HTML change avatar_colors.js */
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

/**
 * Selects a unique and random color from the global palette.
 * If all colors from the palette have been used, the pool is reset and restarted.
 *
 * @returns {string} A hexadecimal color code (e.g. '#FF7A00').
 */
function getUniqueAvatarColor() {
 
  let availableColors = AVATAR_COLORS.filter(color => !usedColors.has(color));

  if (availableColors.length === 0) {
    resetUsedColors();
    availableColors = [...AVATAR_COLORS]; 
  }

  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const chosenColor = availableColors[randomIndex];

  usedColors.add(chosenColor);

  return chosenColor;
}

/**
 * Resets the pool of used colors.
 * This can be useful when a page or a component list is re-rendered.
 */
function resetUsedColors() {
  usedColors.clear();
}
