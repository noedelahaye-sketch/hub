// Espace Calendrier du hub — tout ce qui porte une date, tous projets
// confondus : événements, tâches à échéance, publications programmées,
// objectifs et jalons datés, relances et commandes.
//
// Trois vues : mois, semaine, agenda. La grille répond à une question que la
// liste ne rendait pas — « où est le trou ? ». L'agenda reste : il dit le
// détail, et se lit mieux au pouce.
//
// Ce qui se pose d'ici : un événement, une tâche, une publication ou un
// objectif, en glissant sur un jour ou une série de jours. Ce qui s'en
// supprime : la même chose, depuis le détail. Le reste se MODIFIE là où il vit
// — un calendrier dit quand, pas comment.

import * as api from './api.js';
import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  construireBarrePeriode,
  construireGrille,
  fenetreCreation,
  fenetreDetail,
  brancherSelection,
  deplacerAncre,
  toutesLesNatures,
  centrerActif,
} from './calendrier-commun.js';

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
      natures: toutesLesNatures(),
      vue: 'mois',
      ancre: new Date(),
      creation: null,
      detail: null,
      edition: false,
    };

    function rendre() {
      section.innerHTML = `
        <h1>Calendrier</h1>
        <p class="discret sous-titre">Tout ce qui a une date, tous projets confondus.</p>
        ${construireBarrePeriode(etat.vue, etat.ancre)}
        ${construireFiltres(etat.natures)}
        <div data-bloc="liste">
          ${
            etat.vue === 'agenda'
              ? construireCalendrier(etat.elements, etat.natures, { montrerProjet: true })
              : construireGrille(etat.elements, etat.natures, etat.vue, etat.ancre, {
                  montrerProjet: true,
                  selection: etat.creation,
                })
          }
        </div>
        ${etat.creation ? fenetreCreation({ ...etat.creation, projets: PROJETS }) : ''}
        ${
          etat.detail
            ? fenetreDetail(etat.detail, { montrerProjet: true, edition: etat.edition })
            : ''
        }`;

      centrerActif(section.querySelector('.filtres'));
    }

    async function charger() {
      const [evenements, taches, objectifs, publications, commandes, contacts] = await Promise.all([
        // Tous les événements, pas seulement l'à-venir : une grille se promène
        // dans le passé, et un événement posé sur aujourd'hui à minuit
        // disparaissait au rechargement.
        api.evenementsTous(),
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

    const fermerFenetres = () => {
      etat.creation = null;
      etat.detail = null;
      etat.edition = false;
      rendre();
    };

    brancherSelection(section, ({ debut, fin }) => {
      etat.detail = null;
      etat.creation = { debut, fin, nature: 'evenement' };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });

    // Échap ferme la fenêtre — c'est le geste attendu partout ailleurs.
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && (etat.creation || etat.detail)) fermerFenetres();
    });

    section.addEventListener('click', async (evenement) => {
      if (evenement.target.closest('[data-fermer-fenetre]')) {
        fermerFenetres();
        return;
      }

      const nature = evenement.target.closest('[data-nature-creation]');
      if (nature) {
        etat.creation = { ...etat.creation, nature: nature.dataset.natureCreation };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      const ouvrir = evenement.target.closest('[data-element]');
      if (ouvrir) {
        const [type, id] = ouvrir.dataset.element.split(':');
        etat.creation = null;
        etat.edition = false;
        etat.detail = etat.elements.find(
          (element) => element.type === type && String(element.id) === id,
        );
        rendre();
        return;
      }

      if (evenement.target.closest('[data-modifier-element]')) {
        etat.edition = true;
        rendre();
        section.querySelector('#cal-edition-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-annuler-edition]')) {
        etat.edition = false;
        rendre();
        return;
      }

      const supprimer = evenement.target.closest('[data-supprimer-element]');
      if (supprimer) {
        const [type, id] = supprimer.dataset.supprimerElement.split(':');
        if (!confirm(`Supprimer « ${etat.detail?.titre} » ?`)) return;
        supprimer.disabled = true;
        try {
          await effacer(type, id);
          etat.detail = null;
          await charger();
          rendre();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimer.disabled = false;
        }
        return;
      }

      const filtreNature = evenement.target.closest('[data-filtre-nature]');
      if (filtreNature) {
        const cle = filtreNature.dataset.filtreNature;
        const suite = new Set(etat.natures);
        if (suite.has(cle)) suite.delete(cle);
        else suite.add(cle);
        etat.natures = suite;
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
      }
    });

    // Chaque nature se supprime là où elle vit. Une relance n'est pas une ligne
    // à effacer : c'est une date qu'on retire d'une fiche du carnet.
    async function effacer(type, id) {
      if (type === 'evenement') return api.supprimerEvenement(id);
      if (type === 'tache') return api.supprimerTache(id);
      if (type === 'publication') return api.supprimerPublication(id);
      if (type === 'objectif') return api.supprimerObjectif(id);
      if (type === 'jalon') return api.supprimerJalon(id);
      if (type === 'commande') return api.supprimerCommande(id);
      if (type === 'relance') {
        return api.modifierContact(id, { prochaine_action_date: null });
      }
      throw new Error(`Nature inconnue : ${type}`);
    }

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      const action = formulaire.dataset.action;
      if (action !== 'creer-depuis-calendrier' && action !== 'modifier-depuis-calendrier') return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        if (action === 'creer-depuis-calendrier') await poser(champs);
        else await corriger(champs);

        etat.creation = null;
        etat.detail = null;
        etat.edition = false;
        await charger();
        rendre();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    // Corriger sur place. Chaque nature range sa date dans sa propre colonne :
    // `debut` est le nom du champ à l'écran, pas celui de la base.
    async function corriger(champs) {
      const { type, id } = champs;
      const titre = champs.titre.trim();

      if (type === 'evenement') {
        const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
        const fin = champs.fin && champs.fin !== champs.debut ? new Date(`${champs.fin}T23:59`) : null;
        return api.modifierEvenement(id, {
          titre,
          date_debut: debut.toISOString(),
          date_fin: fin ? fin.toISOString() : null,
          lieu: champs.lieu?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
      }

      if (type === 'publication') {
        return api.modifierPublication(id, {
          titre,
          date_prevue: champs.debut,
          reseau: champs.reseau,
          format: champs.format,
        });
      }

      if (type === 'objectif') {
        return api.modifierObjectif(id, {
          titre,
          echeance: champs.debut,
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
        });
      }

      if (type === 'commande') {
        return api.modifierCommande(id, {
          titre,
          echeance: champs.debut,
          client: champs.client?.trim() || null,
        });
      }

      if (type === 'relance') {
        return api.modifierContact(id, {
          prochaine_action: titre,
          prochaine_action_date: champs.debut,
        });
      }

      if (type === 'jalon') return api.modifierJalon(id, { titre, echeance: champs.debut });
      return api.modifierTache(id, { titre, echeance: champs.debut });
    }

    async function poser(champs) {
      const titre = champs.titre.trim();
      const projet = champs.projet ?? 'photo';

      if (champs.nature === 'tache') {
        return api.creerTache({ projet, titre, echeance: champs.debut });
      }

      if (champs.nature === 'publication') {
        return api.creerPublication({
          projet,
          titre,
          reseau: champs.reseau,
          format: champs.format,
          date_prevue: champs.debut,
        });
      }

      if (champs.nature === 'objectif') {
        return api.creerObjectif({
          projet,
          titre,
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.debut,
        });
      }

      // Sans heure, l'événement tient le jour entier : minuit local, et
      // `momentLisible` s'abstient alors d'afficher 00:00.
      const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
      const fin = champs.fin === champs.debut ? null : new Date(`${champs.fin}T23:59`);

      return api.creerEvenement({
        projet,
        titre,
        date_debut: debut.toISOString(),
        date_fin: fin ? fin.toISOString() : null,
        lieu: champs.lieu?.trim() || null,
        notes: champs.notes?.trim() || null,
      });
    }
  },
};
