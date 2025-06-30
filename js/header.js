function generateHeaderUser(username) {
  if (!username || username.toLowerCase() === 'gast') {
    return 'G';
  }

  const parts = username.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  } else {
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  }
}


const username = localStorage.getItem("username") || "Gast";
document.getElementById('header__user').textContent = generateHeaderUser(username);