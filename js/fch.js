// La page FC Hermitage DU hub (#fch) — à ne pas confondre avec le site
// (#hermitage, js/hermitage.js), qui masque tout l'habillage du hub.
//
// Ici : un tableau de bord réduit et une action rapide. On lit où en est
// l'alternance, on capture une idée de com' au vol, et on entre sur le site
// pour le reste. Rien ne se gère ici.

import * as api from './api.js';
import { construireFormulaire, construireVictoires } from './espace-projet.js';
import { construireApercuCreation, rubriquesProposees } from './publications.js';
import { construireCap } from './photo.js';

const MAX_VICTOIRES = 3;

// Les mêmes que sur le site, pour que la capture au vol propose les rubriques
// familières (docs/fch-spec.md, §4).
const RUBRIQUES_DEPART = [
  'Avant-match',
  'Résultats',
  'Portrait de joueur',
  'Coulisses',
  'Partenaire à l’honneur',
  'Vie du club',
];

function squelette(etat) {
  return `
    <div class="yuno-tete">
      <span class="fch-pastille" aria-hidden="true"><img src="img/fch-logo.png" alt=""></span>
      <div>
        <h1>FC Hermitage</h1>
        <p class="discret sous-titre">Alternance communication et partenariats</p>
      </div>
    </div>

    <section class="bloc">
      <a class="lien-externe" href="#hermitage">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Entrer sur le site FC Hermitage</span>
          <span class="discret">Calendrier éditorial, partenaires, club</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
    </section>

    <section class="bloc">
      <h2>Le cap</h2>
      <div data-bloc="cap">${construireCap(etat.objectifs)}</div>
    </section>

    <section class="bloc">
      <h2>La com' à venir</h2>
      <div data-bloc="apercu">${construireApercuCreation(etat.publications)}</div>
      ${construireFormulaire({
        id: 'idee-fch',
        libelle: 'Noter une idée au vol',
        action: 'noter-idee',
        champs: [
          { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true },
          {
            nom: 'rubrique',
            libelle: 'Rubrique (facultative)',
            type: 'text',
            suggestions: rubriquesProposees(etat.publications, RUBRIQUES_DEPART),
          },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>Victoires</h2>
      <div data-bloc="victoires">${construireVictoires(etat.victoires)}</div>
    </section>`;
}

export default {
  async monter(section) {
    const etat = { objectifs: [], victoires: [], publications: [] };

    try {
      const [objectifs, victoires, publications] = await Promise.all([
        api.objectifsActifs({ projet: 'fch' }),
        api.victoiresDuProjet('fch', MAX_VICTOIRES),
        api.publicationsToutes('fch'),
      ]);
      Object.assign(etat, { objectifs, victoires, publications });
    } catch (erreur) {
      console.error('Chargement de la page FC Hermitage impossible', erreur);
      section.innerHTML = `
        <h1>FC Hermitage</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    section.innerHTML = squelette(etat);

    const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="noter-idee"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        // Facebook par défaut : c'est le réseau du club.
        const publication = await api.creerPublication({
          projet: 'fch',
          reseau: 'facebook',
          titre: champs.titre.trim(),
          rubrique: champs.rubrique?.trim() || null,
        });
        etat.publications = [publication, ...etat.publications];
        formulaire.reset();
        formulaire.closest('.ajout').open = false;
        bloc('apercu').innerHTML = construireApercuCreation(etat.publications);
      } catch (souci) {
        console.error("Impossible de noter l'idée", souci);
        erreur.textContent = souci.message ?? "L'ajout a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    section.addEventListener('click', async (evenement) => {
      const victoire = evenement.target.closest('[data-victoire]');
      if (!victoire) return;

      victoire.disabled = true;
      try {
        await api.supprimerVictoire(victoire.dataset.victoire);
        etat.victoires = etat.victoires.filter((v) => v.id !== victoire.dataset.victoire);
        bloc('victoires').innerHTML = construireVictoires(etat.victoires);
      } catch (souci) {
        console.error('Suppression de la victoire impossible', souci);
        victoire.disabled = false;
      }
    });
  },
};
