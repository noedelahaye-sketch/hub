// Espace tableau de bord — la page de Noé.
// À venir, dans cet ordre : en-tête du jour + question d'humeur, victoires
// récentes, progression des objectifs, semaine, puis tâches actives en bas.

export default {
  monter(section) {
    section.innerHTML = `
      <h1>Accueil</h1>
      <p class="discret">Le tableau de bord arrive bientôt.</p>
    `;
  },
};
