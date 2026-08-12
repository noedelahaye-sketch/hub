// Le calendrier — tout ce qui porte une date, assemblé en une seule liste, puis
// dessiné de trois façons : en mois, en semaine, ou en agenda.
//
// Deux consommateurs : l'espace Calendrier du hub (tous projets) et l'écran
// Calendrier du site Yuno (projet photo seul). Même assemblage, même rendu,
// mêmes filtres — seules les données passées changent.
//
// Les fonctions ne font que fabriquer du HTML à partir de données déjà
// chargées, comme partout dans le hub. Seul `brancherSelection` touche au DOM,
// et il ne fait que poser des écouteurs.

import { construireFormulaire } from './espace-projet.js';
import {
  depuisDateISO,
  versDateISO,
  momentLisible,
  echapper,
  NOMS_PROJETS,
} from './format.js';

export const RESEAUX = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
};
export const FORMATS = { post: 'Post', carrousel: 'Carrousel', reel: 'Réel', story: 'Story' };

// Les types d'éléments datés.
const TYPES = {
  evenement: 'Événement',
  tache: 'Tâche',
  publication: 'Publication',
  objectif: 'Objectif',
  jalon: 'Jalon',
  commande: 'Commande',
  relance: 'Relance',
};

// Les natures, c'est-à-dire ce qui se coche dans les filtres. Un jalon daté est
// une étape d'objectif, pas une espèce à part ; une commande à livrer et une
// relance promise sont deux façons de tenir un engagement envers quelqu'un.
export const NATURES = {
  evenement: 'Événements',
  tache: 'Tâches',
  publication: 'Publications',
  objectif: 'Objectifs',
  relance: 'Relances/Commandes',
};

export function natureDe(element) {
  if (element.type === 'jalon') return 'objectif';
  if (element.type === 'commande') return 'relance';
  return element.type;
}

export function toutesLesNatures() {
  return new Set(Object.keys(NATURES));
}

// --- Assemblage --------------------------------------------------------------

export function assemblerCalendrier({
  evenements = [],
  taches = [],
  objectifs = [],
  publications = [],
  commandes = [],
  relances = [],
}) {
  const elements = [];

  for (const evenement of evenements) {
    const date = new Date(evenement.date_debut);
    elements.push({
      id: evenement.id,
      type: 'evenement',
      source: evenement,
      date,
      // Le dernier jour occupé, s'il y en a plusieurs. L'agenda n'en fait rien
      // — il dirait trois fois la même chose ; la grille s'en sert pour tirer
      // une barre continue sur toute la durée.
      jusqua: evenement.date_fin ? versDateISO(new Date(evenement.date_fin)) : null,
      projet: evenement.projet,
      titre: evenement.titre,
      detail: evenement.lieu,
      notes: evenement.notes,
      quand: momentLisible(date),
    });
  }

  for (const tache of taches) {
    elements.push({
      id: tache.id,
      type: 'tache',
      source: tache,
      date: depuisDateISO(tache.echeance),
      projet: tache.projet,
      titre: tache.titre,
      detail: tache.statut === 'backlog' ? 'backlog' : null,
    });
  }

  for (const objectif of objectifs) {
    if (objectif.echeance) {
      elements.push({
        id: objectif.id,
        type: 'objectif',
        source: objectif,
        date: depuisDateISO(objectif.echeance),
        projet: objectif.projet,
        titre: objectif.titre,
        detail: objectif.cible,
      });
    }
    for (const jalon of objectif.jalons ?? []) {
      if (jalon.echeance && !jalon.atteint) {
        elements.push({
          id: jalon.id,
          type: 'jalon',
          source: jalon,
          date: depuisDateISO(jalon.echeance),
          projet: objectif.projet,
          titre: jalon.titre,
          detail: objectif.titre,
        });
      }
    }
  }

  for (const pub of publications) {
    elements.push({
      id: pub.id,
      type: 'publication',
      source: pub,
      date: depuisDateISO(pub.date_prevue),
      projet: pub.projet ?? 'photo',
      titre: pub.titre,
      detail: `${RESEAUX[pub.reseau] ?? pub.reseau} · ${FORMATS[pub.format] ?? pub.format}`,
    });
  }

  for (const commande of commandes) {
    elements.push({
      id: commande.id,
      type: 'commande',
      source: commande,
      date: depuisDateISO(commande.echeance),
      projet: 'photo',
      titre: commande.titre,
      detail: commande.client ? `à livrer à ${commande.client}` : 'à livrer',
    });
  }

  for (const contact of relances) {
    elements.push({
      id: contact.id,
      type: 'relance',
      source: contact,
      date: depuisDateISO(contact.prochaine_action_date),
      projet: 'photo',
      titre: contact.prochaine_action || `Reprendre contact avec ${contact.nom}`,
      detail: contact.nom,
    });
  }

  return elements.sort((a, b) => a.date - b.date);
}

// --- Les périodes ------------------------------------------------------------

export const VUES_CALENDRIER = { mois: 'Mois', semaine: 'Semaine', agenda: 'Agenda' };

const JOURS_COURTS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

export function debutDeLaSemaine(date) {
  const jour = new Date(date);
  jour.setHours(0, 0, 0, 0);
  // La semaine commence le lundi : getDay() rend 0 pour dimanche.
  jour.setDate(jour.getDate() - ((jour.getDay() + 6) % 7));
  return jour;
}

function suiteDeJours(debut, nombre) {
  return Array.from({ length: nombre }, (_, ecart) => {
    const jour = new Date(debut);
    jour.setDate(jour.getDate() + ecart);
    return jour;
  });
}

// La grille d'un mois va du lundi qui précède le 1er au dimanche qui suit le
// dernier jour : cinq ou six semaines pleines, jamais de case coupée.
export function grilleDuMois(ancre) {
  const premier = new Date(ancre.getFullYear(), ancre.getMonth(), 1);
  const dernier = new Date(ancre.getFullYear(), ancre.getMonth() + 1, 0);
  const debut = debutDeLaSemaine(premier);
  const fin = debutDeLaSemaine(dernier);
  fin.setDate(fin.getDate() + 6);

  return suiteDeJours(debut, Math.round((fin - debut) / 86400000) + 1);
}

export function grilleDeLaSemaine(ancre) {
  return suiteDeJours(debutDeLaSemaine(ancre), 7);
}

export function deplacerAncre(ancre, vue, sens) {
  const suite = new Date(ancre);
  if (vue === 'semaine') suite.setDate(suite.getDate() + 7 * sens);
  else suite.setMonth(suite.getMonth() + sens);
  return suite;
}

export function titreDePeriode(ancre, vue) {
  if (vue !== 'semaine') {
    return ancre.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  const jours = grilleDeLaSemaine(ancre);
  const [premier] = jours;
  const dernier = jours[6];
  const memeMois = premier.getMonth() === dernier.getMonth();

  return `${premier.getDate()}${
    memeMois ? '' : ` ${premier.toLocaleDateString('fr-FR', { month: 'short' })}`
  } – ${dernier.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

// --- Rendu commun ------------------------------------------------------------

export function centrerActif(conteneur, selecteur = '.actif') {
  const actif = conteneur?.querySelector(selecteur);
  if (!actif || conteneur.scrollWidth <= conteneur.clientWidth) return;
  conteneur.scrollLeft = actif.offsetLeft - (conteneur.clientWidth - actif.offsetWidth) / 2;
}

// Les filtres se cochent, ils ne s'excluent plus : voir les publications ET les
// tâches sans les objectifs était impossible avec des onglets.
export function construireFiltres(natures) {
  return `
    <div class="cal-filtres" role="group" aria-label="Ce que le calendrier montre">
      ${Object.keys(NATURES)
        .map(
          (nature) => `
        <label class="cal-coche ${natures.has(nature) ? 'actif' : ''}">
          <input type="checkbox" data-filtre-nature="${nature}"
            ${natures.has(nature) ? 'checked' : ''}>
          <span>${echapper(NATURES[nature])}</span>
        </label>`,
        )
        .join('')}
    </div>`;
}

export function construireBarrePeriode(vue, ancre) {
  return `
    <div class="cal-barre">
      <div class="affichages" role="group" aria-label="Affichage du calendrier">
        ${Object.entries(VUES_CALENDRIER)
          .map(
            ([valeur, libelle]) => `
          <button type="button" data-vue-cal="${valeur}"
            aria-pressed="${valeur === vue}"
            class="${valeur === vue ? 'actif' : ''}">${libelle}</button>`,
          )
          .join('')}
      </div>
      ${
        vue === 'agenda'
          ? ''
          : `<div class="cal-nav">
               <button type="button" class="cal-fleche" data-periode="-1"
                 aria-label="Période précédente">‹</button>
               <span class="cal-titre">${echapper(titreDePeriode(ancre, vue))}</span>
               <button type="button" class="cal-fleche" data-periode="1"
                 aria-label="Période suivante">›</button>
               <button type="button" class="lien-discret bouton-mini"
                 data-periode="0">Aujourd'hui</button>
             </div>`
      }
    </div>`;
}

function retenu(element, natures) {
  return natures.has(natureDe(element));
}

// --- La grille ---------------------------------------------------------------
// Un événement de plusieurs jours est UNE barre continue, titrée une seule
// fois — pas la même étiquette répétée dans chaque case. C'est ce qui distingue
// un calendrier d'une liste par jour, et ça oblige à placer les barres en
// couloirs pour qu'elles ne se chevauchent pas.

function segmentsDeLaSemaine(jours, elements) {
  const bordGauche = versDateISO(jours[0]);
  const bordDroit = versDateISO(jours[6]);
  const colonne = new Map(jours.map((jour, index) => [versDateISO(jour), index]));

  const segments = elements
    .map((element) => {
      const debut = versDateISO(element.date);
      const fin = element.jusqua && element.jusqua > debut ? element.jusqua : debut;
      if (fin < bordGauche || debut > bordDroit) return null;

      return {
        element,
        depuis: colonne.get(debut < bordGauche ? bordGauche : debut),
        jusqua: colonne.get(fin > bordDroit ? bordDroit : fin),
        deborde: { avant: debut < bordGauche, apres: fin > bordDroit },
      };
    })
    .filter(Boolean)
    // Les plus longues d'abord, à départ égal : une barre de trois jours mérite
    // le couloir du haut, sinon elle se faufile sous des barres d'un jour.
    .sort((a, b) => a.depuis - b.depuis || b.jusqua - b.depuis - (a.jusqua - a.depuis));

  const couloirs = [];
  for (const segment of segments) {
    let rang = couloirs.findIndex((couloir) =>
      couloir.every((autre) => segment.jusqua < autre.depuis || segment.depuis > autre.jusqua),
    );
    if (rang < 0) {
      couloirs.push([]);
      rang = couloirs.length - 1;
    }
    couloirs[rang].push(segment);
    segment.couloir = rang;
  }

  return segments;
}

function barre(segment, montrerProjet) {
  const { element, deborde } = segment;
  const projet = montrerProjet ? ` data-projet="${echapper(element.projet)}"` : '';
  const classes = [
    'cal-barre-element',
    `cal-type-${element.type}`,
    deborde.avant ? 'deborde-avant' : '',
    deborde.apres ? 'deborde-apres' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<button type="button" class="${classes}"${projet}
    style="grid-column: ${segment.depuis + 1} / ${segment.jusqua + 2}; grid-row: ${segment.couloir + 2};"
    data-element="${echapper(element.type)}:${echapper(element.id)}"
    title="${echapper(`${TYPES[element.type]} · ${element.titre}`)}">${echapper(element.titre)}</button>`;
}

function ligneDeSemaine(jours, elements, options) {
  const { montrerProjet, maximum, mois, aujourdhui, selection } = options;
  const segments = segmentsDeLaSemaine(jours, elements);
  const visibles = maximum ? segments.filter((segment) => segment.couloir < maximum) : segments;
  const caches = maximum ? segments.filter((segment) => segment.couloir >= maximum) : [];

  // Ce qui ne tient pas se compte par jour : « +2 » sous la dernière barre.
  const reste = new Array(7).fill(0);
  for (const segment of caches) {
    for (let index = segment.depuis; index <= segment.jusqua; index += 1) reste[index] += 1;
  }

  const couloirs = visibles.reduce((haut, segment) => Math.max(haut, segment.couloir + 1), 0);
  const aDuReste = reste.some(Boolean);
  // Les lignes de la grille sont déclarées : le numéro, un rang par couloir,
  // l'éventuel « +N », puis un rang souple qui étire les cases jusqu'en bas.
  // Sans lignes explicites, le fond d'un jour ne s'étirerait sur rien.
  const rangs = couloirs + (aDuReste ? 1 : 0);

  const fonds = jours
    .map((jour, index) => {
      const cle = versDateISO(jour);
      const classes = [
        'cal-jour',
        mois !== null && jour.getMonth() !== mois ? 'cal-hors-mois' : '',
        cle === aujourdhui ? 'cal-aujourdhui' : '',
        selection && cle >= selection.debut && cle <= selection.fin ? 'cal-choisi' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<div class="${classes}" data-jour="${cle}"
        style="grid-column: ${index + 1};"></div>`;
    })
    .join('');

  // Le jour se marque sur son numéro, pas sur toute la case : sans tuiles, un
  // cadre autour d'une case n'aurait rien à border.
  const numeros = jours
    .map((jour, index) => {
      const cle = versDateISO(jour);
      const classes = [
        'cal-numero',
        cle === aujourdhui ? 'cal-numero-aujourdhui' : '',
        mois !== null && jour.getMonth() !== mois ? 'cal-numero-hors-mois' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<span class="${classes}" style="grid-column: ${index + 1}; grid-row: 1;"
        aria-hidden="true">${jour.getDate()}</span>`;
    })
    .join('');

  const restes = reste
    .map((nombre, index) =>
      nombre
        ? `<span class="cal-reste discret"
             style="grid-column: ${index + 1}; grid-row: ${couloirs + 2};">+${nombre}</span>`
        : '',
    )
    .join('');

  return `
    <div class="cal-ligne" style="grid-template-rows: auto repeat(${rangs}, auto) 1fr;">
      ${fonds}${numeros}
      ${visibles.map((segment) => barre(segment, montrerProjet)).join('')}
      ${restes}
    </div>`;
}

export function construireGrille(
  elements,
  natures,
  vue,
  ancre,
  { montrerProjet = false, selection = null } = {},
) {
  const retenus = elements.filter((element) => retenu(element, natures));
  const jours = vue === 'semaine' ? grilleDeLaSemaine(ancre) : grilleDuMois(ancre);

  const options = {
    montrerProjet,
    // En vue mois une ligne ne peut pas tout montrer : trois couloirs, puis un
    // reste. En semaine il y a la place, on montre tout.
    maximum: vue === 'semaine' ? 0 : 3,
    mois: vue === 'semaine' ? null : ancre.getMonth(),
    aujourdhui: versDateISO(new Date()),
    selection,
  };

  const lignes = [];
  for (let debut = 0; debut < jours.length; debut += 7) {
    lignes.push(ligneDeSemaine(jours.slice(debut, debut + 7), retenus, options));
  }

  return `
    <div class="cal-grille cal-${vue}">
      <div class="cal-entetes" aria-hidden="true">
        ${JOURS_COURTS.map((nom) => `<span>${nom}</span>`).join('')}
      </div>
      ${lignes.join('')}
    </div>
    <p class="discret cal-aide">Touche un jour — ou glisse sur une série de jours —
      pour y poser quelque chose. Clique une barre pour la voir en détail.</p>`;
}

// --- L'agenda ----------------------------------------------------------------

export function construireCalendrier(elements, natures, { montrerProjet = false } = {}) {
  const retenus = elements.filter((element) => retenu(element, natures));

  if (!retenus.length) {
    return `<p class="vide">Rien de daté ici pour l'instant.</p>`;
  }

  const groupes = new Map();
  for (const element of retenus) {
    const cle = element.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(element);
  }

  return [...groupes.entries()]
    .map(
      ([mois, liste]) => `
      <section class="bloc bloc-mois">
        <h2>${echapper(mois)}</h2>
        <ul>
          ${liste
            .map(
              (element) => `
            <li ${montrerProjet ? `data-projet="${echapper(element.projet)}"` : ''}>
              <span class="tuile-entete">
                <span class="etiquette">${TYPES[element.type]}</span>
                ${
                  montrerProjet
                    ? `<span class="tuile-projet">${echapper(
                        NOMS_PROJETS[element.projet] ?? element.projet,
                      )}</span>`
                    : ''
                }
                <span class="discret quand">${echapper(
                  element.quand ??
                    element.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                )}</span>
              </span>
              <button type="button" class="semaine-titre cal-lien-detail"
                data-element="${echapper(element.type)}:${echapper(element.id)}">${echapper(
                  element.titre,
                )}</button>
              ${element.detail ? `<span class="discret calendrier-detail">${echapper(element.detail)}</span>` : ''}
            </li>`,
            )
            .join('')}
        </ul>
      </section>`,
    )
    .join('');
}

// --- Le glissement de sélection ----------------------------------------------
// Sur écran tactile, `pointerover` ne visite pas les cases voisines pendant un
// glissement : un doigt choisit donc un seul jour. Ce n'est pas un manque — la
// fenêtre porte les deux dates, une plage reste atteignable partout.

export function brancherSelection(section, quandChoisi) {
  let depuis = null;

  const peindre = (a, b) => {
    const [min, max] = [a, b].sort();
    for (const cellule of section.querySelectorAll('.cal-jour')) {
      cellule.classList.toggle(
        'cal-choisi',
        Boolean(min) && cellule.dataset.jour >= min && cellule.dataset.jour <= max,
      );
    }
  };

  section.addEventListener('pointerdown', (evenement) => {
    // Une barre se clique pour son détail : elle n'ouvre pas une sélection.
    if (evenement.target.closest('.cal-barre-element')) return;
    const cellule = evenement.target.closest('.cal-jour');
    if (!cellule) return;
    // Sans ça, le navigateur sélectionne le texte des cases traversées.
    evenement.preventDefault();
    depuis = cellule.dataset.jour;
    peindre(depuis, depuis);
  });

  section.addEventListener('pointerover', (evenement) => {
    if (!depuis) return;
    const cellule = evenement.target.closest('.cal-jour');
    if (cellule) peindre(depuis, cellule.dataset.jour);
  });

  section.addEventListener('pointerup', (evenement) => {
    if (!depuis) return;
    const jusqua = evenement.target.closest('.cal-jour')?.dataset.jour ?? depuis;
    const [debut, fin] = [depuis, jusqua].sort();
    depuis = null;
    quandChoisi({ debut, fin });
  });

  section.addEventListener('pointercancel', () => {
    depuis = null;
    peindre('', '');
  });
}

// --- Les fenêtres volantes ---------------------------------------------------
// Une fenêtre par-dessus la grille, comme dans un agenda : on pose une chose
// sans quitter la vue d'ensemble, et on la referme d'un geste.

function fenetre(titre, contenu) {
  return `
    <div class="cal-fond" data-fermer-fenetre></div>
    <div class="cal-fenetre" role="dialog" aria-modal="true" aria-label="${echapper(titre)}">
      <button type="button" class="cal-fermer" data-fermer-fenetre
        aria-label="Fermer">×</button>
      ${contenu}
    </div>`;
}

// Ce qu'une nature sait recevoir depuis le calendrier. L'espace perso n'a ni
// tâches, ni jalons, ni publications : il n'apparaît que pour un événement —
// un rendez-vous avec soi-même a toute sa place au calendrier.
const CHAMPS_PAR_NATURE = {
  evenement: [
    { nom: 'heure', libelle: 'À quelle heure (facultatif)', type: 'time' },
    { nom: 'lieu', libelle: 'Où (facultatif)', type: 'text' },
    { nom: 'notes', libelle: 'Notes (facultatif)', type: 'textarea' },
  ],
  tache: [],
  publication: [
    { nom: 'reseau', libelle: 'Réseau', type: 'select', options: RESEAUX, valeur: 'instagram' },
    { nom: 'format', libelle: 'Format', type: 'select', options: FORMATS, valeur: 'post' },
  ],
  objectif: [
    { nom: 'pourquoi', libelle: 'Pourquoi ? (relu les jours sans motivation)', type: 'textarea' },
    { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' },
  ],
};

const NATURES_CREABLES = {
  evenement: 'Événement',
  tache: 'Tâche',
  publication: 'Publication',
  objectif: 'Objectif',
};

// Quand une seule nature est cochée, c'est elle qu'on vient poser : le filtre
// dit déjà ce qu'on est en train de faire, autant ne pas le redemander. Une
// relance fait exception — elle ne se crée pas d'ici, c'est une date qu'on
// pose sur une fiche du carnet — alors on retombe sur l'événement.
export function natureParDefaut(natures) {
  if (natures.size !== 1) return 'evenement';
  const [seule] = natures;
  return seule in NATURES_CREABLES ? seule : 'evenement';
}

export function fenetreCreation({ debut, fin, nature = 'evenement', projets = null }) {
  const memeJour = debut === fin;
  const jourLisible = (cle) =>
    depuisDateISO(cle).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const quand = memeJour
    ? jourLisible(debut)
    : `du ${depuisDateISO(debut).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      })} au ${depuisDateISO(fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;

  // Seul un événement s'étend. Une tâche, une publication ou un objectif porte
  // une date unique : on prend le premier jour, et on le dit.
  const surLePremierJour = !memeJour && nature !== 'evenement';

  const projetsOfferts =
    projets &&
    Object.fromEntries(
      Object.entries(projets).filter(([cle]) => nature === 'evenement' || cle !== 'perso'),
    );

  const contenu = `
    <p class="cal-fenetre-quand">${echapper(quand)}</p>
    <div class="cal-natures" role="group" aria-label="Nature de ce qu'on pose">
      ${Object.entries(NATURES_CREABLES)
        .map(
          ([valeur, libelle]) => `
        <button type="button" data-nature-creation="${valeur}"
          aria-pressed="${valeur === nature}"
          class="${valeur === nature ? 'actif' : ''}">${libelle}</button>`,
        )
        .join('')}
    </div>
    ${
      surLePremierJour
        ? `<p class="discret cal-note-nature">Posé sur le ${echapper(
            jourLisible(debut),
          )} — seul un événement s'étend sur plusieurs jours.</p>`
        : ''
    }
    ${construireFormulaire({
      id: 'cal',
      libelle: `Ajouter — ${NATURES_CREABLES[nature].toLowerCase()}`,
      action: 'creer-depuis-calendrier',
      bouton: 'Poser au calendrier',
      ouvert: true,
      extra: `<input type="hidden" name="debut" value="${echapper(debut)}">
              <input type="hidden" name="fin" value="${echapper(fin)}">
              <input type="hidden" name="nature" value="${echapper(nature)}">`,
      champs: [
        { nom: 'titre', libelle: 'Quoi', type: 'text', requis: true },
        ...(projetsOfferts
          ? [
              {
                nom: 'projet',
                libelle: 'Pour quel projet',
                type: 'select',
                options: projetsOfferts,
                valeur: 'photo',
              },
            ]
          : []),
        ...CHAMPS_PAR_NATURE[nature],
      ],
    })}`;

  return fenetre('Poser au calendrier', contenu);
}

// Ce qu'un élément devient quand on le supprime, dit par son verbe. Une relance
// n'est pas une ligne à effacer : c'est une date qu'on retire d'une fiche.
const VERBE_SUPPRESSION = {
  evenement: "Supprimer l'événement",
  tache: 'Supprimer la tâche',
  publication: 'Supprimer la publication',
  objectif: "Supprimer l'objectif et ses jalons",
  jalon: 'Supprimer le jalon',
  commande: 'Supprimer la commande',
  relance: 'Retirer du calendrier',
};

// Ce qui se corrige depuis le calendrier, par nature. Une date mal posée se
// répare : la supprimer pour la recréer ferait perdre tout le reste de la
// fiche. Les champs qui n'ont pas de sens ici — le statut d'une tâche, le
// pourquoi d'un objectif — restent gérés dans leur espace.
function champsDeModification(element) {
  const ligne = element.source ?? {};

  if (element.type === 'evenement') {
    const debut = new Date(ligne.date_debut);
    const sansHeure = debut.getHours() === 0 && debut.getMinutes() === 0;
    return [
      { nom: 'titre', libelle: 'Quoi', type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'Du', type: 'date', requis: true, valeur: versDateISO(debut) },
      {
        nom: 'heure',
        libelle: 'À quelle heure (vide = toute la journée)',
        type: 'time',
        valeur: sansHeure
          ? ''
          : `${String(debut.getHours()).padStart(2, '0')}:${String(debut.getMinutes()).padStart(2, '0')}`,
      },
      {
        nom: 'fin',
        libelle: "Jusqu'au (vide = un seul jour)",
        type: 'date',
        valeur: ligne.date_fin ? versDateISO(new Date(ligne.date_fin)) : '',
      },
      { nom: 'lieu', libelle: 'Où', type: 'text', valeur: ligne.lieu ?? '' },
      { nom: 'notes', libelle: 'Notes', type: 'textarea', valeur: ligne.notes ?? '' },
    ];
  }

  if (element.type === 'publication') {
    return [
      { nom: 'titre', libelle: "L'idée", type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'Prévue le', type: 'date', requis: true, valeur: ligne.date_prevue },
      { nom: 'reseau', libelle: 'Réseau', type: 'select', options: RESEAUX, valeur: ligne.reseau },
      { nom: 'format', libelle: 'Format', type: 'select', options: FORMATS, valeur: ligne.format },
    ];
  }

  if (element.type === 'objectif') {
    return [
      { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'Échéance', type: 'date', requis: true, valeur: ligne.echeance },
      { nom: 'pourquoi', libelle: 'Pourquoi ?', type: 'textarea', valeur: ligne.pourquoi ?? '' },
      { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text', valeur: ligne.cible ?? '' },
    ];
  }

  if (element.type === 'commande') {
    return [
      { nom: 'titre', libelle: 'Commande', type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'À livrer pour', type: 'date', requis: true, valeur: ligne.echeance },
      { nom: 'client', libelle: 'Client', type: 'text', valeur: ligne.client ?? '' },
    ];
  }

  if (element.type === 'relance') {
    return [
      {
        nom: 'titre',
        libelle: `Prochaine action avec ${ligne.nom ?? ''}`,
        type: 'text',
        requis: true,
        valeur: ligne.prochaine_action ?? '',
      },
      { nom: 'debut', libelle: 'Quand', type: 'date', requis: true, valeur: ligne.prochaine_action_date },
    ];
  }

  // Tâche et jalon : un titre et une échéance, rien de plus ici.
  return [
    { nom: 'titre', libelle: 'Quoi', type: 'text', requis: true, valeur: ligne.titre },
    { nom: 'debut', libelle: 'Échéance', type: 'date', requis: true, valeur: ligne.echeance },
  ];
}

export function fenetreDetail(element, { montrerProjet = false, edition = false } = {}) {
  const enTete = `
    <span class="tuile-entete">
      <span class="etiquette">${TYPES[element.type]}</span>
      ${
        montrerProjet
          ? `<span class="tuile-projet">${echapper(
              NOMS_PROJETS[element.projet] ?? element.projet,
            )}</span>`
          : ''
      }
    </span>`;

  if (edition) {
    const contenu = `
      ${enTete}
      ${construireFormulaire({
        id: 'cal-edition',
        libelle: 'Modifier',
        action: 'modifier-depuis-calendrier',
        bouton: 'Enregistrer',
        ouvert: true,
        extra: `<input type="hidden" name="type" value="${echapper(element.type)}">
                <input type="hidden" name="id" value="${echapper(element.id)}">`,
        champs: champsDeModification(element),
      })}
      <button type="button" class="lien-discret bouton-mini" data-annuler-edition>Annuler</button>`;

    return fenetre(`Modifier ${element.titre}`, contenu);
  }

  const finit =
    element.jusqua && element.jusqua > versDateISO(element.date)
      ? ` — jusqu'au ${depuisDateISO(element.jusqua).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}`
      : '';

  const contenu = `
    ${enTete}
    <h3 class="cal-detail-titre">${echapper(element.titre)}</h3>
    <p class="discret cal-fenetre-quand">${echapper(
      element.quand ??
        element.date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
    )}${echapper(finit)}</p>
    ${element.detail ? `<p class="cal-detail-ligne">${echapper(element.detail)}</p>` : ''}
    ${element.notes ? `<p class="discret cal-detail-ligne">${echapper(element.notes)}</p>` : ''}
    <div class="cal-detail-actions">
      <button type="button" class="bouton-secondaire bouton-mini" data-modifier-element>Modifier</button>
      <button type="button" class="lien-discret bouton-mini"
        data-supprimer-element="${echapper(element.type)}:${echapper(element.id)}">${
          VERBE_SUPPRESSION[element.type] ?? 'Supprimer'
        }</button>
    </div>`;

  return fenetre(element.titre, contenu);
}
