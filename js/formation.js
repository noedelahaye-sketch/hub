// Espace formation — Bac+3 Studi.
// À venir : objectifs et progression, jalons, tâches (3 actives + backlog),
// événements, victoires, et la progression des révisions lue dans le gist public.

// Le site de révision reste indépendant du hub : on y renvoie, on ne l'intègre
// pas. Voir CLAUDE.md, « Cas particulier formation ».
const SITE_REVISION = 'https://noedelahaye-sketch.github.io/Bac-3/';

export default {
  monter(section) {
    section.innerHTML = `
      <h1>Formation</h1>

      <section class="bloc">
        <h2>Réviser</h2>
        <a class="lien-externe" href="${SITE_REVISION}" target="_blank" rel="noopener">
          <span class="lien-externe-texte">
            <span class="lien-externe-titre">Ouvrir le site Bac+3</span>
            <span class="discret">Dossiers, cours, flashcards et quiz</span>
          </span>
          <span class="lien-externe-fleche" aria-hidden="true">↗</span>
        </a>
      </section>

      <p class="vide">Le reste de cet espace arrive bientôt.</p>
    `;
  },
};
