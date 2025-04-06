// Gestion du menu responsive
let toggle_menu = document.querySelector('.responsive-menu');
let menu = document.querySelector('.menu');
toggle_menu.onclick = function () {
    toggle_menu.classList.toggle('active');
    menu.classList.toggle('responsive');
};

// Gestion des boutons "Lire Plus / Lire Moins" pour dérouler ou réduire le texte
// Gestion des boutons "Lire Plus / Lire Moins"
// Gestion des boutons "Lire Plus / Lire Moins"
document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault(); // Empêche le comportement de redirection par défaut
  
      const shortText = this.previousElementSibling.previousElementSibling; // Sélectionne le texte court
      const fullText = this.previousElementSibling; // Sélectionne le texte complet
  
      // Basculer entre afficher et masquer le texte complet
      if (fullText.style.display === 'none') {
        shortText.style.display = 'none'; // Masque le texte court
        fullText.style.display = 'block'; // Affiche le texte complet
        this.textContent = 'Lire moins'; // Change le texte du bouton
      } else {
        shortText.style.display = 'block'; // Réaffiche le texte court
        fullText.style.display = 'none'; // Cache le texte complet
        this.textContent = 'Lire plus'; // Change le texte du bouton
      }
    });
  });
  