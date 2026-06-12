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
/* le pop up entre le se conecter et deja une compte*/
