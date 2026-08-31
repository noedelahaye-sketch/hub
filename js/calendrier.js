// Espace Calendrier du hub — tout ce qui porte une date, tous espaces
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
import { echapper } from './format.js';
import { lireCache, ecrireCache } from './cache-session.js';
import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  construireBarrePeriode,
  construireGrille,
  fenetreCreation,
  fenetreDetail,
  fenetreJour,
  elementsDuJour,
  brancherSelection,
  brancherClavier,
  brancherDeplacement,
  appliquerAuCalendrier,
  brancherCapture,
  poserAuCalendrier,
  brancherEtatPublication,
  champsApresDeplacement,
  corrigerDepuisLeCalendrier,
  effacerDepuisLeCalendrier,
  deplacerAncre,
  toutesLesNatures,
  natureParDefaut,
  centrerActif,
} from './calendrier-commun.js';

const CLE_CACHE = 'calendrier';

// Les six tables que la grille assemble. Une clé manquante au cache n'affiche
// rien de faux : elle affiche moins, le temps que le serveur réponde.
const SOURCES_VIDES = {
  evenements: [],
  taches: [],
  objectifs: [],
  publications: [],
  commandes: [],
  contacts: [],
};

const ESPACES = {
  photo: 'Yuno',
  fch: 'FC Hermitage',
  formation: 'Formation',
  perso: 'Perso',
};

export default {
  async monter(section) {
    const etat = {
      // Les projets de Noé, pour la pastille de rattachement de la tuile.
      projets: [],
      // Le dernier état de l'onglet, s'il y en a un : la grille se dessine
      // pleine dès le premier rendu, et les données fraîches la réécrivent une
      // fraction de seconde plus tard. Papier peint, jamais source — les six
      // requêtes partent quand même.
      sources: { ...SOURCES_VIDES, ...(lireCache(CLE_CACHE) ?? {}) },
      elements: [],
      echec: false,
      // Ce qu'une écriture ratée a laissé comme mot. L'échec de CHARGEMENT a le
      // sien (`echec`) et ne dit pas la même chose : l'un annonce une page
      // vide, l'autre un geste revenu en arrière.
      message: null,
      natures: toutesLesNatures(),
      vue: 'mois',
      ancre: new Date(),
      creation: null,
      detail: null,
      edition: false,
      jourOuvert: null,
    };

    // Déclarés ici parce que `rendre` s'en sert : les fonctions sont posées
    // plus bas, quand les écouteurs se branchent.
    let poserLEntreeClavier = null;
    let rafraichirLaCapture = null;

    function rendre() {
      section.innerHTML = `
        <h1>Calendrier</h1>
        <p class="discret sous-titre">Tout ce qui a une date, tous espaces confondus.</p>
        ${
          // L'échec se dit sur une ligne, sous le titre : la grille reste, et
          // ce qui venait du cache reste affiché. Une page remplacée par un
          // message perdrait les deux.
          etat.echec
            ? `<p class="vide">Les données n'ont pas pu être chargées.
                 <button type="button" class="lien-discret"
                   data-action="reessayer">Réessayer</button></p>`
            : ''
        }
        ${
          // Un geste revenu en arrière le DIT : sans cette ligne, l'affichage
          // optimiste serait un mensonge (js/ecriture.js).
          etat.message ? `<p class="discret message-regle">${echapper(etat.message)}</p>` : ''
        }
        ${construireBarrePeriode(etat.vue, etat.ancre)}
        ${construireFiltres(etat.natures)}
        <div data-bloc="liste">
          ${
            etat.vue === 'agenda'
              ? construireCalendrier(etat.elements, etat.natures, { montrerEspace: true })
              : construireGrille(etat.elements, etat.natures, etat.vue, etat.ancre, {
                  montrerEspace: true,
                  selection: etat.creation,
                })
          }
        </div>
        ${etat.creation ? fenetreCreation({ ...etat.creation, espaces: ESPACES, projets: etat.projets }) : ''}
        ${
          etat.detail
            ? fenetreDetail(etat.detail, {
                montrerEspace: true,
                edition: etat.edition,
                statutModifiable: true,
              })
            : ''
        }
        ${
          etat.jourOuvert
            ? fenetreJour(etat.jourOuvert, elementsDuJour(etat.elements, etat.jourOuvert), {
                montrerEspace: true,
              })
            : ''
        }`;

      centrerActif(section.querySelector('.filtres'));
      poserLEntreeClavier?.();
      // La tuile vient d'être réécrite : ses pastilles reprennent le libellé de
      // leurs champs, et le curseur va au titre.
      if (etat.creation) rafraichirLaCapture?.();
    }

    // Les six tables telles qu'elles arrivent, gardées à part de la grille
    // qu'on en tire. C'est ce découpage qui permet le cache : `etat.elements`
    // porte des objets `Date` et des barres calculées, `etat.sources` non — et
    // seul ce qui traverse `JSON.stringify` sans y perdre son sens se range en
    // cache.
    function assembler() {
      const { evenements, taches, objectifs, publications, commandes, contacts } = etat.sources;
      etat.elements = assemblerCalendrier({
        evenements,
        taches,
        // Les intentions perso n'ont pas de date par principe ; le filtre est
        // une ceinture de plus au cas où l'une en recevrait une un jour.
        objectifs: objectifs.filter((objectif) => objectif.espace !== 'perso'),
        publications,
        commandes: commandes.filter(
          (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
        ),
        relances: contacts.filter((contact) => contact.prochaine_action_date),
      });
    }

    async function charger() {
      try {
        const [evenements, taches, objectifs, publications, commandes, contacts, projets] =
          await Promise.all([
            // Tous les événements, pas seulement l'à-venir : une grille se
            // promène dans le passé, et un événement posé sur aujourd'hui à
            // minuit disparaissait au rechargement.
            api.evenementsTous(),
            api.tachesDatees(),
            api.objectifsActifs(),
            api.publicationsDatees(),
            api.commandesToutes(),
            api.contactsTous(),
            api.projetsTous(),
          ]);

        etat.sources = { evenements, taches, objectifs, publications, commandes, contacts };
        etat.projets = projets;
        etat.echec = false;
        ecrireCache(CLE_CACHE, etat.sources);
      } catch (erreur) {
        console.error('Chargement du calendrier impossible', erreur);
        etat.echec = true;
      }
      assembler();
      rendre();
    }

    // Revenir sur le calendrier le relit : ce qui a été posé ailleurs doit s'y
    // voir sans recharger la page.
    this.rafraichir = charger;

    // Le chrome d'abord — et, cache en poche, la grille pleine avec lui. Le
    // calendrier attendait ses six requêtes avant d'afficher quoi que ce soit,
    // alors que sa moitié fixe (titre, barre de période, filtres, cases du
    // mois) ne dépend d'aucune donnée. C'est le deuxième écran le plus visité
    // du hub.
    assembler();
    rendre();
    charger();

    const fermerFenetres = () => {
      etat.creation = null;
      etat.detail = null;
      etat.edition = false;
      etat.jourOuvert = null;
      rendre();
    };

    // Les pastilles de la tuile : ouverture, fermeture, libellés. Tout se joue
    // dans le DOM — ouvrir un panneau ne redessine rien, donc rien de saisi ne
    // se perd.
    rafraichirLaCapture = brancherCapture(section, { projets: () => etat.projets });

    // Entrée ou Espace sur une case posée au clavier ouvre la même fenêtre
    // qu'un clic.
    poserLEntreeClavier = brancherClavier(section, (jour) => {
      etat.detail = null;
      etat.creation = { debut: jour, fin: jour, nature: natureParDefaut(etat.natures) };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });
    poserLEntreeClavier();

    brancherSelection(section, ({ debut, fin }) => {
      etat.detail = null;
      etat.creation = { debut, fin, nature: natureParDefaut(etat.natures) };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });

    // Glisser une barre la reporte : c'est l'action la plus fréquente après
    // créer, elle ne mérite pas quatre gestes.
    brancherDeplacement(section, async ({ element: cle, ecart }) => {
      const [type, id] = cle.split(':');
      const element = etat.elements.find(
        (candidat) => candidat.type === type && String(candidat.id) === id,
      );
      if (!element) return;

      try {
        await appliquerAuCalendrier(type, id, champsApresDeplacement(element, ecart));
        await charger();
      } catch (souci) {
        console.error('Déplacement impossible', souci);
      }
    });

    // L'état d'une publication, par son rond ou par la pastille de sa tuile.
    // Le geste vit dans `calendrier-commun.js` — il est le même ici, sur
    // l'accueil, sur le site Yuno et sur celui du club (demande de Noé,
    // 27 août 2026). Posé APRÈS le glissement, pour que le clic avalé après un
    // report reste avalé.
    brancherEtatPublication(section, {
      publications: () => etat.sources.publications,
      ouverte: () => (etat.detail?.type === 'publication' ? etat.detail.source : null),
      rendre: () => {
        assembler();
        rendre();
      },
      echouer: (message) => {
        etat.message = message;
        rendre();
      },
    });

    // Échap ferme la fenêtre — c'est le geste attendu partout ailleurs.
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && (etat.creation || etat.detail || etat.jourOuvert)) {
        fermerFenetres();
      }
    });

    section.addEventListener('click', async (evenement) => {
      if (evenement.target.closest('[data-fermer-fenetre]')) {
        fermerFenetres();
        return;
      }

      if (evenement.target.closest('[data-action="reessayer"]')) {
        etat.echec = false;
        rendre();
        await charger();
        return;
      }

      const nature = evenement.target.closest('[data-nature-creation]');
      if (nature) {
        // Les dates sont éditables : on garde ce qui vient d'être saisi plutôt
        // que de revenir à ce que le glissement avait posé.
        etat.creation = {
          ...etat.creation,
          debut: section.querySelector('#cal-debut')?.value || etat.creation.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creation.fin,
          nature: nature.dataset.natureCreation,
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      const journee = evenement.target.closest('[data-jour-complet]');
      if (journee) {
        etat.creation = null;
        etat.detail = null;
        etat.jourOuvert = journee.dataset.jourComplet;
        rendre();
        return;
      }

      const ouvrir = evenement.target.closest('[data-element]');
      if (ouvrir) {
        const [type, id] = ouvrir.dataset.element.split(':');
        etat.creation = null;
        etat.edition = false;
        etat.jourOuvert = null;
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

    // CORRIGER ET EFFACER VIVENT DANS `calendrier-commun.js` (30 août 2026).
    // Ils étaient ici mot pour mot, et à l'identique dans l'accueil ; « Ma
    // semaine » en aurait fait une troisième copie. C'est le motif de
    // `poserAuCalendrier` — et la même leçon : c'est dans la copie oubliée
    // qu'un champ finit par manquer.
    const effacer = effacerDepuisLeCalendrier;
    const corriger = corrigerDepuisLeCalendrier;

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
        if (action === 'creer-depuis-calendrier') await poserAuCalendrier(champs);
        else await corriger(champs);

        etat.creation = null;
        etat.detail = null;
        etat.edition = false;
        await charger();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });


  },
};
