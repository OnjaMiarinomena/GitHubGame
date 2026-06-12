/*pop up entre le connexion et l'inscription */
const connexion_btn = document.getElementById("connexionBtn");
const inscription_btn = document.getElementById("inscriptionBtn");
const login_form_container = document.getElementById("LoginFormContainer");
const register_form_container = document.getElementById(
  "RegisterFormContainer",
);

connexion_btn.addEventListener("click", () => {
  login_form_container.style.display = "block";
  register_form_container.style.display = "none";
});

inscription_btn.addEventListener("click", () => {
  login_form_container.style.display = "none";
  register_form_container.style.display = "block";
});
/*les mode dark et wite du page*/

// Theme toggle: dark / light with persistence
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(mode) {
  if (mode === "light") {
    document.body.classList.add("light-theme");
    if (themeIcon) themeIcon.className = "fa-solid fa-sun";
  } else {
    document.body.classList.remove("light-theme");
    if (themeIcon) themeIcon.className = "fa-solid fa-moon";
  }
  try {
    localStorage.setItem("theme", mode);
  } catch (e) {}
}

function toggleTheme() {
  const isLight = document.body.classList.contains("light-theme");
  applyTheme(isLight ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

// Apply saved theme on load (default: dark)
let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (e) {}
applyTheme(savedTheme === "light" ? "light" : "dark");
