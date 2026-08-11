// Espace Calendrier du hub — tout ce qui porte une date, tous projets
// confondus : événements, tâches à échéance, publications programmées,
// objectifs et jalons datés. Des filtres par nature, la couleur et le nom du
// projet sur chaque tuile.
//
// En lecture seule : on agit sur un élément là où il vit (son espace, le site
// Yuno). Le calendrier répond à une seule question — « qu'est-ce qui arrive,
// et quand ? »

import * as api from './api.js';
import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  centrerActif,
} from './calendrier-commun.js';

export default {
  async monter(section) {
    const etat = { elements: [], filtre: 'tout' };

    function rendre() {
      section.innerHTML = `
        <h1>Calendrier</h1>
        <p class="discret sous-titre">Tout ce qui a une date, tous projets confondus.</p>
        ${construireFiltres(etat.filtre)}
        <div data-bloc="liste">
          ${construireCalendrier(etat.elements, etat.filtre, { montrerProjet: true })}
        </div>`;

      centrerActif(section.querySelector('.filtres'));
    }

    try {
      const [evenements, taches, objectifs, publications, commandes, contacts] = await Promise.all([
        api.evenementsDepuis(new Date().toISOString()),
        api.tachesDatees(),
        api.objectifsActifs(),
        api.publicationsDatees(),
        api.commandesToutes(),
        api.contactsTous(),
      ]);

      etat.elements = assemblerCalendrier({
        evenements,
        taches,
        // Les intentions perso n'ont pas de date par principe ; le filtre est
        // une ceinture de plus au cas où l'une en recevrait une un jour.
        objectifs: objectifs.filter((objectif) => objectif.projet !== 'perso'),
        publications,
        commandes: commandes.filter(
          (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
        ),
        relances: contacts.filter((contact) => contact.prochaine_action_date),
      });
      rendre();
    } catch (erreur) {
      console.error('Chargement du calendrier impossible', erreur);
      section.innerHTML = `
        <h1>Calendrier</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    section.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('[data-filtre]');
      if (!bouton) return;
      etat.filtre = bouton.dataset.filtre;
      rendre();
    });
  },
};
