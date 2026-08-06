// Espace formation — Bac+3 Studi.
//
// Structure commune des espaces projet, plus un bloc qui lui est propre : la
// progression des révisions, lue dans le gist public du site Bac-3.

import { creerEspaceProjet } from './espace-projet.js';
import { progressionRevisions } from './revisions.js';

const SITE_REVISION = 'https://noedelahaye-sketch.github.io/Bac-3/';

const pluriel = (nombre, singulier, plurielMot) => (nombre > 1 ? plurielMot : singulier);

export function construireRevisions(revisions) {
  if (revisions === null) {
    return `<p class="vide">La progression des révisions n'a pas pu être lue.</p>`;
  }

  const pourcentage = Math.round((revisions.livrables / revisions.totalLivrables) * 100);

  // Pas de dénominateur pour les cartes ni les résumés : leur total vit dans le
  // contenu généré de Bac-3, pas dans le gist. Inventer une base donnerait un
  // chiffre différent de celui affiché là-bas.
  const chiffres = [
    [revisions.cartesVues, pluriel(revisions.cartesVues, 'carte vue', 'cartes vues')],
    [revisions.cartesMaitrisees, pluriel(revisions.cartesMaitrisees, 'maîtrisée', 'maîtrisées')],
    [revisions.resumesLus, pluriel(revisions.resumesLus, 'résumé lu', 'résumés lus')],
    [revisions.serie, pluriel(revisions.serie, "jour d'affilée", "jours d'affilée")],
  ];

  const enPlus = [
    revisions.resumesEnCours
      ? `${revisions.resumesEnCours} ${pluriel(
          revisions.resumesEnCours,
          'résumé en cours',
          'résumés en cours',
        )}`
      : null,
    revisions.scoreQuiz !== null ? `score quiz moyen ${revisions.scoreQuiz}&nbsp;%` : null,
  ].filter(Boolean);

  return `
    <div class="barre" role="img"
      aria-label="${revisions.livrables} livrables sur ${revisions.totalLivrables}">
      <span style="width: ${pourcentage}%"></span>
    </div>
    <p class="discret progression-legende"><span class="chiffre">${revisions.livrables}/${revisions.totalLivrables}</span> livrables rédigés</p>

    <ul class="chiffres-cles">
      ${chiffres
        .map(
          ([valeur, libelle]) => `
        <li><span class="chiffre chiffre-cle">${valeur}</span> <span class="discret">${libelle}</span></li>`,
        )
        .join('')}
    </ul>

    ${enPlus.length ? `<p class="discret note-regle">${enPlus.join(' · ')}</p>` : ''}`;
}

export default creerEspaceProjet({
  projet: 'formation',
  titre: 'Formation',
  sousTitre: 'Bac+3 marketing et communication · Studi',

  blocEnTete: {
    titre: 'Réviser',
    html: `
      <a class="lien-externe" href="${SITE_REVISION}" target="_blank" rel="noopener">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Ouvrir le site Bac+3</span>
          <span class="discret">Dossiers, cours, flashcards et quiz</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
      <div id="bloc-revisions"><p class="vide">…</p></div>`,

    // Les révisions viennent d'ailleurs (GitHub) : leur échec ne doit pas
    // emporter le reste de la page.
    apresMontage(section) {
      const cible = section.querySelector('#bloc-revisions');
      progressionRevisions()
        .then((revisions) => {
          cible.innerHTML = construireRevisions(revisions);
        })
        .catch((erreur) => {
          console.error('Lecture des révisions impossible', erreur);
          cible.innerHTML = construireRevisions(null);
        });
    },
  },
});
