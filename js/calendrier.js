// Espace Calendrier du hub — tout ce qui porte une date, tous projets
// confondus : événements, tâches à échéance, publications programmées,
// objectifs et jalons datés, relances et commandes. Des filtres par nature, la
// couleur et le nom du projet sur chaque tuile.
//
// Trois vues : mois, semaine, agenda. La grille répond à une question que la
// liste ne rendait pas — « où est le trou ? ». L'agenda reste : sur téléphone
// il se lit mieux, et c'est lui qui dit le détail.
//
// **Une seule chose s'y crée** : un événement, en glissant sur un jour ou une
// série de jours. Le reste s'agit là où il vit (son espace, le site Yuno) — un
// calendrier répond d'abord à « qu'est-ce qui arrive, et quand ? ».

import * as api from './api.js';
import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  construireBarrePeriode,
  construireGrille,
  formulaireEvenement,
  brancherSelection,
  deplacerAncre,
  centrerActif,
} from './calendrier-commun.js';

// 'perso' en fait partie : un rendez-vous avec soi-même a autant sa place au
// calendrier qu'un match. Ce sont les tâches et les jalons qu'il n'a pas.
const PROJETS = {
  photo: 'Yuno',
  fch: 'FC Hermitage',
  formation: 'Formation',
  perso: 'Perso',
};

export default {
  async monter(section) {
    const etat = {
      elements: [],
      filtre: 'tout',
      vue: 'mois',
      ancre: new Date(),
      creation: null,
    };

    function rendre() {
      section.innerHTML = `
        <h1>Calendrier</h1>
        <p class="discret sous-titre">Tout ce qui a une date, tous projets confondus.</p>
        ${construireBarrePeriode(etat.vue, etat.ancre)}
        ${construireFiltres(etat.filtre)}
        <div data-bloc="liste">
          ${
            etat.vue === 'agenda'
              ? construireCalendrier(etat.elements, etat.filtre, { montrerProjet: true })
              : construireGrille(etat.elements, etat.filtre, etat.vue, etat.ancre, {
                  montrerProjet: true,
                  selection: etat.creation,
                })
          }
        </div>
        ${etat.creation ? formulaireEvenement({ ...etat.creation, projets: PROJETS }) : ''}`;

      centrerActif(section.querySelector('.filtres'));
    }

    async function charger() {
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
    }

    try {
      await charger();
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

    // Glisser sur les jours ouvre le formulaire, rempli de la plage choisie.
    brancherSelection(section, ({ debut, fin }) => {
      etat.creation = { debut, fin };
      rendre();
      section.querySelector('#evenement-cal-titre')?.focus();
    });

    section.addEventListener('click', (evenement) => {
      const filtre = evenement.target.closest('[data-filtre]');
      if (filtre) {
        etat.filtre = filtre.dataset.filtre;
        rendre();
        return;
      }

      const vue = evenement.target.closest('[data-vue-cal]');
      if (vue) {
        etat.vue = vue.dataset.vueCal;
        rendre();
        return;
      }

      const periode = evenement.target.closest('[data-periode]');
      if (periode) {
        const sens = Number(periode.dataset.periode);
        // 0 = « Aujourd'hui » : on ne se perd jamais longtemps dans un calendrier.
        etat.ancre = sens === 0 ? new Date() : deplacerAncre(etat.ancre, etat.vue, sens);
        rendre();
        return;
      }

      if (evenement.target.closest('[data-annuler-creation]')) {
        etat.creation = null;
        rendre();
      }
    });

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="creer-evenement-cal"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        // Sans heure, l'événement tient le jour entier : minuit local, et
        // `momentLisible` s'abstient alors d'afficher 00:00.
        const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
        const fin = champs.fin === champs.debut ? null : new Date(`${champs.fin}T23:59`);

        await api.creerEvenement({
          projet: champs.projet,
          titre: champs.titre.trim(),
          date_debut: debut.toISOString(),
          date_fin: fin ? fin.toISOString() : null,
          lieu: champs.lieu?.trim() || null,
          notes: champs.notes?.trim() || null,
        });

        etat.creation = null;
        await charger();
        rendre();
      } catch (souci) {
        console.error("Création de l'événement impossible", souci);
        erreur.textContent = souci.message ?? "L'événement n'a pas pu être posé.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });
  },
};
