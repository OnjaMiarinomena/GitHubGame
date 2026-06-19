//les augmentation des session et la diminution de machine disponible
// pour les boutton commencer
let compteurActuel1 = 20;
let compteurActuel2 = 0;
let compteurActuel3 = 0;
let compteurActuel4 = 0;
const affichageMachines = document.getElementById("affichageMachines");
const affichageSession = document.getElementById("affichageSession");
const affichageClients = document.getElementById("affichageClients");
const affichageRevenu = document.getElementById("affichageRevenu");
function commencer() {
  compteurActuel1 = compteurActuel1 - 1;
  compteurActuel2 = compteurActuel2 + 1;
  compteurActuel3 = compteurActuel3 + 1;
  compteurActuel4 = compteurActuel4 + 2500;
  affichageMachines.textContent = compteurActuel1;
  affichageSession.textContent = compteurActuel2;
  affichageClients.textContent = compteurActuel3;
  affichageRevenu.textContent = compteurActuel4;
}

//pour les bouttons arreter

function arreter() {
  compteurActuel1 = compteurActuel1 + 1;
  compteurActuel2 = compteurActuel2 - 1;
  compteurActuel3 = compteurActuel3 - 1;
  affichageMachines.textContent = compteurActuel1;
  affichageSession.textContent = compteurActuel2;
  affichageClients.textContent = compteurActuel3;
}
