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

import { construireFormulaire, construireFenetre } from './espace-projet.js';
import {
  depuisDateISO,
  versDateISO,
  ajouterJours,
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

// --- La récurrence -----------------------------------------------------------
// Les occurrences ne sont pas stockées : une ligne en base, autant de dates que
// le calendrier en montre. C'est ce qui permet de changer l'heure d'un
// entraînement hebdomadaire d'un seul geste.

export const RECURRENCES = {
  '': 'Une seule fois',
  hebdo: 'Chaque semaine',
  quinzaine: 'Toutes les deux semaines',
  mensuel: 'Chaque mois',
};

const PAS_EN_JOURS = { hebdo: 7, quinzaine: 14 };

// La fenêtre d'expansion est large mais bornée : un an en arrière, trois ans
// devant. Sans borne, un événement hebdomadaire sans fin déclarée produirait
// une liste infinie.
function occurrencesDe(evenement) {
  const debut = new Date(evenement.date_debut);
  if (!evenement.recurrence) return [debut];

  const aujourdhui = new Date();
  const plancher = ajouterJours(aujourdhui, -365);
  const plafond = evenement.recurrence_fin
    ? depuisDateISO(evenement.recurrence_fin)
    : ajouterJours(aujourdhui, 365 * 3);

  const pas = PAS_EN_JOURS[evenement.recurrence];
  const dates = [];
  const curseur = new Date(debut);

  // La borne de tours est une ceinture : une date de fin aberrante ne doit pas
  // faire tourner la boucle sans fin.
  for (let tour = 0; tour < 400 && curseur <= plafond; tour += 1) {
    if (curseur >= plancher) dates.push(new Date(curseur));
    if (pas) curseur.setDate(curseur.getDate() + pas);
    else curseur.setMonth(curseur.getMonth() + 1);
  }

  return dates;
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
    const origine = new Date(evenement.date_debut);
    // La durée est portée par la série, pas par chaque occurrence : on la
    // mesure une fois et on la reporte.
    const duree = evenement.date_fin ? new Date(evenement.date_fin) - origine : null;

    for (const date of occurrencesDe(evenement)) {
      elements.push({
        id: evenement.id,
        type: 'evenement',
        source: evenement,
        date,
        recurrent: Boolean(evenement.recurrence),
        // Le dernier jour occupé, s'il y en a plusieurs. L'agenda n'en fait
        // rien — il dirait trois fois la même chose ; la grille s'en sert pour
        // tirer une barre continue sur toute la durée.
        jusqua: duree === null ? null : versDateISO(new Date(date.getTime() + duree)),
        projet: evenement.projet,
        titre: evenement.titre,
        detail: evenement.lieu,
        notes: evenement.notes,
        quand: momentLisible(date),
      });
    }
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

// La nature se lit à l'œil, pas seulement à la couleur — un projet et une
// nature sont deux informations, et la couleur n'en porte qu'une. Un événement
// n'a pas de signe : c'est le cas ordinaire, la barre pleine le dit déjà.
const SIGNES = {
  tache: '○',
  publication: '◆',
  objectif: '▲',
  jalon: '△',
  commande: '▸',
  relance: '↗',
};

function barre(segment, montrerProjet) {
  const { element, deborde } = segment;
  const projet = montrerProjet ? ` data-projet="${echapper(element.projet)}"` : '';
  const signe = SIGNES[element.type];
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
    ${element.recurrent ? 'data-recurrent' : ''}
    data-element="${echapper(element.type)}:${echapper(element.id)}"
    aria-label="${echapper(
      `${TYPES[element.type]} · ${element.titre} · ${element.quand ?? versDateISO(element.date)}`,
    )}"
    title="${echapper(`${TYPES[element.type]} · ${element.titre}`)}">${
      // Le signe est décoratif : le titre de l'infobulle dit déjà la nature en
      // toutes lettres, pour qui n'y voit rien.
      // Sauf pour une tâche : son cercle se coche. On ne peut pas y mettre un
      // vrai <button> — la barre en est déjà un, et deux boutons ne s'imbriquent
      // pas —, alors c'est le gestionnaire de clics qui reconnaît la cible.
      // Au clavier, la barre s'ouvre et la fenêtre de détail porte le geste.
      signe
        ? `<span class="cal-signe${element.type === 'tache' ? ' cal-signe-cochable' : ''}"
             ${element.type === 'tache' ? `data-cocher-tache="${echapper(element.id)}"` : ''}
             ${element.type === 'tache' ? 'title="Marquer comme faite"' : ''}
             aria-hidden="true">${signe}</span>`
        : ''
    }${echapper(element.titre)}</button>`;
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

      return `<div class="${classes}" data-jour="${cle}" role="button" tabindex="-1"
        aria-label="${echapper(
          jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        )}"
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

  // Le « +N » s'ouvre. Un compte qui annonce une information et refuse de la
  // donner est pire que pas de compte du tout.
  const restes = reste
    .map((nombre, index) =>
      nombre
        ? `<button type="button" class="cal-reste"
             style="grid-column: ${index + 1}; grid-row: ${couloirs + 2};"
             data-jour-complet="${versDateISO(jours[index])}"
             aria-label="Voir les ${nombre} autres">+${nombre}</button>`
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

// --- La vue semaine, avec ses heures -----------------------------------------
// La vue mois écrase la durée : un appel de trente minutes et un match de deux
// heures y occupent la même case. C'est la raison d'être de la semaine — elle
// montre où les choses se tassent, et ce qui reste entre deux blocs.

const HAUTEUR_HEURE = 3; // en rem, cf. --cal-heure dans la feuille de style

// Un élément est horaire s'il porte une heure et tient dans sa journée. Tout le
// reste — les sans-heure, les sur plusieurs jours, les tâches, les échéances —
// vit dans le bandeau du haut : ça n'a pas de place dans le temps, seulement
// un jour.
function estHoraire(element) {
  if (element.type !== 'evenement') return false;
  const debut = element.date;
  if (debut.getHours() === 0 && debut.getMinutes() === 0) return false;
  return !element.jusqua || element.jusqua === versDateISO(debut);
}

// Deux blocs qui se chevauchent se partagent la largeur du jour. On regroupe
// par grappes de chevauchement, puis on assigne une colonne dans chaque grappe.
function placerDansLaJournee(elements) {
  const blocs = elements
    .map((element) => {
      const debut = element.date;
      const minutesDebut = debut.getHours() * 60 + debut.getMinutes();
      const fin = element.source?.date_fin ? new Date(element.source.date_fin) : null;
      // Sans fin déclarée, une heure de principe : mieux vaut un bloc lisible
      // qu'un trait sans épaisseur.
      const minutesFin = fin ? fin.getHours() * 60 + fin.getMinutes() : minutesDebut + 60;

      return {
        element,
        depuis: minutesDebut,
        jusqua: Math.max(minutesFin, minutesDebut + 20),
      };
    })
    .sort((a, b) => a.depuis - b.depuis || b.jusqua - a.jusqua);

  const grappes = [];
  let grappe = [];
  let borne = -1;

  for (const bloc of blocs) {
    if (bloc.depuis >= borne && grappe.length) {
      grappes.push(grappe);
      grappe = [];
    }
    grappe.push(bloc);
    borne = Math.max(borne, bloc.jusqua);
  }
  if (grappe.length) grappes.push(grappe);

  for (const membres of grappes) {
    const colonnes = [];
    for (const bloc of membres) {
      let rang = colonnes.findIndex((colonne) => colonne <= bloc.depuis);
      if (rang < 0) {
        colonnes.push(bloc.jusqua);
        rang = colonnes.length - 1;
      } else {
        colonnes[rang] = bloc.jusqua;
      }
      bloc.colonne = rang;
    }
    for (const bloc of membres) bloc.colonnes = colonnes.length;
  }

  return blocs;
}

function blocHoraire(bloc, montrerProjet) {
  const { element, depuis, jusqua, colonne, colonnes } = bloc;
  const haut = (depuis / 60) * HAUTEUR_HEURE;
  const hauteur = Math.max(((jusqua - depuis) / 60) * HAUTEUR_HEURE, 1.1);
  const largeur = 100 / colonnes;

  return `<button type="button" class="cal-bloc"
    ${montrerProjet ? `data-projet="${echapper(element.projet)}"` : ''}
    style="top: ${haut}rem; height: ${hauteur}rem;
      left: ${colonne * largeur}%; width: ${largeur}%;"
    ${element.recurrent ? 'data-recurrent' : ''}
    data-element="${echapper(element.type)}:${echapper(element.id)}"
    title="${echapper(`${element.quand} · ${element.titre}`)}">
    <span class="cal-bloc-heure">${echapper(
      element.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    )}</span>
    <span class="cal-bloc-titre">${echapper(element.titre)}</span>
  </button>`;
}

function grilleHoraire(jours, elements, options) {
  const horaires = elements.filter(estHoraire);

  const colonnes = jours
    .map((jour) => {
      const cle = versDateISO(jour);
      const blocs = placerDansLaJournee(
        horaires.filter((element) => versDateISO(element.date) === cle),
      );
      return `<div class="cal-colonne-jour" data-jour="${cle}" role="button" tabindex="-1"
        aria-label="${echapper(
          jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        )} — poser à une heure">
        ${blocs.map((bloc) => blocHoraire(bloc, options.montrerProjet)).join('')}
      </div>`;
    })
    .join('');

  const heures = Array.from({ length: 24 }, (_, heure) =>
    `<span class="cal-heure-libelle">${String(heure).padStart(2, '0')}:00</span>`,
  ).join('');

  return `
    <div class="cal-heures">
      <div class="cal-colonne-heures">${heures}</div>
      <div class="cal-heures-jours" style="height: ${24 * HAUTEUR_HEURE}rem;">${colonnes}</div>
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
    // reste. Dans le bandeau de la semaine il y a la place, on montre tout.
    maximum: vue === 'semaine' ? 0 : 3,
    mois: vue === 'semaine' ? null : ancre.getMonth(),
    aujourdhui: versDateISO(new Date()),
    selection,
  };

  if (vue === 'semaine') {
    // Le bandeau ne porte que ce qui n'a pas d'heure : le reste descend dans
    // la grille horaire, où il occupe sa vraie durée.
    const sansHeure = retenus.filter((element) => !estHoraire(element));

    // Un seul cadre pour toute la semaine : les en-têtes, le bandeau du jour
    // entier et la grille horaire étaient trois boîtes bordées l'une sous
    // l'autre, et leurs colonnes ne tombaient pas en face — la grille horaire
    // porte une gouttière d'heures à gauche que les deux autres n'avaient pas.
    // Ici la gouttière est prise en charge par le cadre, en retrait à gauche
    // des deux premiers, et les sept jours s'alignent d'un bout à l'autre.
    return `
      <div class="cal-semaine-cadre">
        <div class="cal-grille cal-semaine" role="group"
          aria-label="${echapper(`Calendrier, semaine du ${titreDePeriode(ancre, 'semaine')}`)}">
          <div class="cal-entetes" aria-hidden="true">
            ${jours
              .map(
                (jour) =>
                  `<span>${JOURS_COURTS[(jour.getDay() + 6) % 7]} ${jour.getDate()}</span>`,
              )
              .join('')}
          </div>
          ${ligneDeSemaine(jours, sansHeure, options)}
        </div>
        ${grilleHoraire(jours, retenus, options)}
      </div>
      <p class="discret cal-aide">Le bandeau du haut porte ce qui n'a pas d'heure.
        Clique dans la grille pour poser un événement à cette heure-là.</p>`;
  }

  const lignes = [];
  for (let debut = 0; debut < jours.length; debut += 7) {
    lignes.push(ligneDeSemaine(jours.slice(debut, debut + 7), retenus, options));
  }

  return `
    <div class="cal-grille cal-mois" role="group"
      aria-label="${echapper(`Calendrier, ${titreDePeriode(ancre, 'mois')}`)}">
      <div class="cal-entetes" aria-hidden="true">
        ${JOURS_COURTS.map((nom) => `<span>${nom}</span>`).join('')}
      </div>
      ${lignes.join('')}
    </div>
    <p class="discret cal-aide">Touche un jour — ou glisse sur une série de jours —
      pour y poser quelque chose. Clique une barre pour la voir en détail.</p>`;
}

// Quand un événement finit, selon ce que le formulaire a reçu. Trois cas, et
// c'est tout ce que la grille horaire a besoin de savoir :
//   — une date de fin plus tardive : l'événement tient plusieurs jours, il vit
//     dans le bandeau du haut et finit au soir du dernier ;
//   — une heure et une durée : il occupe sa tranche, et la grille la dessine ;
//   — ni l'un ni l'autre : il tient la journée, sans fin déclarée.
export function finDeLEvenement(debut, champs) {
  if (champs.fin && champs.fin !== champs.debut) return new Date(`${champs.fin}T23:59`);
  if (!champs.heure) return null;

  const minutes = Number(champs.duree) || 60;
  return new Date(debut.getTime() + minutes * 60000);
}

// Poser dans la grille horaire : le Y du clic dit l'heure. On arrondit au
// quart d'heure — personne ne cale un match à 15 h 07.
export function heureSousLePoint(colonne, y) {
  const cadre = colonne.getBoundingClientRect();
  const proportion = Math.min(Math.max((y - cadre.top) / cadre.height, 0), 0.999);
  const minutes = Math.round((proportion * 24 * 60) / 15) * 15;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// La grille s'ouvre sur les heures qu'on vit, pas sur minuit.
export function cadrerLesHeures(section) {
  const cadre = section.querySelector('.cal-heures');
  if (!cadre) return;

  const premier = cadre.querySelector('.cal-bloc');
  const cible = premier ? premier.offsetTop - 24 : 7 * HAUTEUR_HEURE * 16;
  cadre.scrollTop = Math.max(cible, 0);
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
    // Une barre se clique pour son détail ou se glisse pour changer de jour ;
    // un « +N » déplie sa journée. Ni l'un ni l'autre n'ouvre une sélection.
    if (evenement.target.closest('.cal-barre-element, .cal-reste')) return;
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

// --- Le clavier --------------------------------------------------------------
// Une seule tabulation entre dans la grille, puis les flèches s'y déplacent :
// c'est le motif d'un composant à plusieurs cases. Quarante-deux arrêts de
// tabulation pour un mois, personne ne veut ça.
//
// La grille n'est PAS déclarée `role="grid"`, et c'est délibéré : les barres
// sont des sœurs des cases, pas des cellules d'une ligne. Annoncer un tableau
// puis n'en fournir la structure qu'à moitié est pire que ne rien annoncer.

export function brancherClavier(section, quandJourChoisi) {
  const cases = () => [...section.querySelectorAll('.cal-jour')];

  // Une case porte la tabulation, une seule : aujourd'hui si elle est là,
  // sinon la première du mois affiché.
  const poserLEntree = () => {
    const toutes = cases();
    if (!toutes.length) return;
    if (toutes.some((cellule) => cellule.tabIndex === 0)) return;

    const entree =
      toutes.find((cellule) => cellule.classList.contains('cal-aujourdhui')) ??
      toutes.find((cellule) => !cellule.classList.contains('cal-hors-mois')) ??
      toutes[0];
    entree.tabIndex = 0;
  };

  const DEPLACEMENTS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

  section.addEventListener('keydown', (evenement) => {
    const cellule = evenement.target.closest?.('.cal-jour');
    if (!cellule) return;

    if (evenement.key === 'Enter' || evenement.key === ' ') {
      evenement.preventDefault();
      quandJourChoisi(cellule.dataset.jour);
      return;
    }

    const pas = DEPLACEMENTS[evenement.key];
    if (!pas) return;

    const toutes = cases();
    const suivante = toutes[toutes.indexOf(cellule) + pas];
    if (!suivante) return;

    evenement.preventDefault();
    cellule.tabIndex = -1;
    suivante.tabIndex = 0;
    suivante.focus();
  });

  // Après chaque redessin, la grille a perdu son point d'entrée.
  return poserLEntree;
}

// --- Le déplacement d'une barre ----------------------------------------------
// Reporter est l'action la plus fréquente après créer. Un glissement plutôt que
// quatre gestes par le formulaire.
//
// À la souris seulement : au doigt, capturer le glissement obligerait à
// neutraliser le défilement de la page sur chaque barre, et une grille en est
// couverte. Sur téléphone, on passe par « Modifier ».

// La barre est posée PAR-DESSUS les cases : `closest` ne trouverait rien. On
// regarde donc ce qu'il y a sous le point, et on prend la première case.
function jourSousLePoint(x, y) {
  return document
    .elementsFromPoint(x, y)
    .find((element) => element.classList?.contains('cal-jour'))?.dataset.jour;
}

export function brancherDeplacement(section, quandDeplace) {
  let prise = null;

  const viser = (cle) => {
    for (const cellule of section.querySelectorAll('.cal-jour')) {
      cellule.classList.toggle('cal-cible', Boolean(cle) && cellule.dataset.jour === cle);
    }
  };

  const lacher = () => {
    prise?.barre.classList.remove('en-deplacement');
    viser(null);
    prise = null;
  };

  section.addEventListener('pointerdown', (evenement) => {
    if (evenement.pointerType === 'touch') return;
    const barre = evenement.target.closest('.cal-barre-element');
    // Une série ne se déplace pas au glissement : décaler une occurrence
    // décalerait toutes les autres, ce que personne n'attend d'un geste.
    if (!barre || barre.hasAttribute('data-recurrent')) return;

    const jour = jourSousLePoint(evenement.clientX, evenement.clientY);
    if (!jour) return;

    // Sans ça, le navigateur sélectionne le texte des barres traversées.
    evenement.preventDefault();
    prise = { barre, jour, x: evenement.clientX, y: evenement.clientY, bouge: false };
  });

  section.addEventListener('pointermove', (evenement) => {
    if (!prise) return;

    // Quelques pixels de tolérance : un clic tremblant reste un clic.
    if (!prise.bouge) {
      if (Math.hypot(evenement.clientX - prise.x, evenement.clientY - prise.y) < 5) return;
      prise.bouge = true;
      prise.barre.classList.add('en-deplacement');
    }

    viser(jourSousLePoint(evenement.clientX, evenement.clientY));
  });

  section.addEventListener('pointerup', (evenement) => {
    if (!prise) return;

    const { barre, jour, bouge } = prise;
    const arrivee = jourSousLePoint(evenement.clientX, evenement.clientY);
    lacher();

    if (!bouge) return;

    // Un vrai glissement ne doit pas ouvrir le détail derrière lui : on avale
    // le clic qui suit, et lui seul. Le désarmement différé est une ceinture :
    // si aucun clic ne vient — relâchement hors fenêtre, geste avorté — le
    // piège ne doit pas rester tendu pour le clic d'après.
    const avaler = (clic) => {
      clic.stopPropagation();
      clic.preventDefault();
    };
    section.addEventListener('click', avaler, { capture: true, once: true });
    setTimeout(() => section.removeEventListener('click', avaler, { capture: true }), 400);

    if (!arrivee || arrivee === jour) return;

    const ecart = Math.round(
      (depuisDateISO(arrivee) - depuisDateISO(jour)) / 86400000,
    );
    quandDeplace({ element: barre.dataset.element, ecart });
  });

  section.addEventListener('pointercancel', lacher);
}

// Ce qu'un déplacement change, par nature. Un événement garde sa durée et son
// heure : on décale ses deux bornes du même nombre de jours.
export function champsApresDeplacement(element, ecart) {
  const ligne = element.source ?? {};
  const decaler = (iso) => versDateISO(ajouterJours(depuisDateISO(iso), ecart));

  if (element.type === 'evenement') {
    const champs = {
      date_debut: new Date(
        new Date(ligne.date_debut).setDate(new Date(ligne.date_debut).getDate() + ecart),
      ).toISOString(),
    };
    if (ligne.date_fin) {
      champs.date_fin = new Date(
        new Date(ligne.date_fin).setDate(new Date(ligne.date_fin).getDate() + ecart),
      ).toISOString();
    }
    return champs;
  }

  if (element.type === 'publication') return { date_prevue: decaler(ligne.date_prevue) };
  if (element.type === 'relance') {
    return { prochaine_action_date: decaler(ligne.prochaine_action_date) };
  }

  // Tâche, jalon, objectif, commande : tous rangent leur date dans `echeance`.
  return { echeance: decaler(ligne.echeance) };
}

// --- Les fenêtres volantes ---------------------------------------------------
// Une fenêtre par-dessus la grille, comme dans un agenda : on pose une chose
// sans quitter la vue d'ensemble, et on la referme d'un geste.

// Ce qu'une nature sait recevoir depuis le calendrier. L'espace perso n'a ni
// tâches, ni jalons, ni publications : il n'apparaît que pour un événement —
// un rendez-vous avec soi-même a toute sa place au calendrier.
// Une durée en minutes plutôt que deux sélecteurs d'heure : on pense « un match
// dure deux heures », pas « de 15 h à 17 h ». Elle ne sert que si une heure est
// donnée — sans heure, l'événement tient la journée.
export const DUREES = {
  30: '30 minutes',
  60: '1 heure',
  90: '1 h 30',
  120: '2 heures',
  180: '3 heures',
  240: '4 heures',
};

const CHAMPS_PAR_NATURE = {
  evenement: [
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

export function fenetreCreation({ debut, fin, nature = 'evenement', heure = '', projets = null }) {
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
      extra: `<input type="hidden" name="nature" value="${echapper(nature)}">`,
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
        // Les dates se montrent et se corrigent. Le glissement les pré-remplit,
        // il ne les impose pas : sans ça, un événement de plusieurs jours ne
        // pouvait naître que d'un geste de souris — impossible au doigt.
        ...(nature === 'evenement'
          ? [
              { nom: 'debut', libelle: 'Du', type: 'date', requis: true, valeur: debut },
              {
                nom: 'heure',
                libelle: 'À quelle heure (vide = toute la journée)',
                type: 'time',
                valeur: heure,
              },
              {
                nom: 'duree',
                libelle: 'Combien de temps (si une heure est donnée)',
                type: 'select',
                options: DUREES,
                valeur: '120',
              },
              {
                nom: 'fin',
                libelle: "Jusqu'au (vide = un seul jour)",
                type: 'date',
                valeur: memeJour ? '' : fin,
              },
              {
                nom: 'recurrence',
                libelle: 'Se répète',
                type: 'select',
                options: RECURRENCES,
                valeur: '',
              },
              {
                nom: 'recurrence_fin',
                libelle: 'Se répète jusqu\'au (facultatif)',
                type: 'date',
              },
            ]
          : [{ nom: 'debut', libelle: 'Quand', type: 'date', requis: true, valeur: debut }]),
        ...CHAMPS_PAR_NATURE[nature],
      ],
    })}`;

  return construireFenetre('Poser au calendrier', contenu);
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
      {
        nom: 'duree',
        libelle: 'Combien de temps (si une heure est donnée)',
        type: 'select',
        options: DUREES,
        valeur: String(
          ligne.date_fin && versDateISO(new Date(ligne.date_fin)) === versDateISO(debut)
            ? Math.round((new Date(ligne.date_fin) - debut) / 60000)
            : 120,
        ),
      },
      {
        nom: 'recurrence',
        libelle: 'Se répète',
        type: 'select',
        options: RECURRENCES,
        valeur: ligne.recurrence ?? '',
      },
      {
        nom: 'recurrence_fin',
        libelle: 'Se répète jusqu\'au (facultatif)',
        type: 'date',
        valeur: ligne.recurrence_fin ?? '',
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

// Tout ce qui occupe un jour, y compris ce qui ne fait qu'y passer : un
// événement de trois jours appartient à chacun des trois.
export function elementsDuJour(elements, cle) {
  return elements.filter((element) => {
    const debut = versDateISO(element.date);
    const fin = element.jusqua && element.jusqua > debut ? element.jusqua : debut;
    return cle >= debut && cle <= fin;
  });
}

// La journée dépliée, quand le « +N » est ouvert. Chaque ligne mène au détail
// de son élément — c'est le chemin qu'on cherchait en cliquant.
export function fenetreJour(cle, elements, { montrerProjet = false } = {}) {
  const jour = depuisDateISO(cle);
  const lisible = jour.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const lignes = elements.length
    ? `<ul class="cal-journee">${elements
        .map(
          (element) => `
        <li>
          <button type="button" class="cal-journee-ligne"
            data-element="${echapper(element.type)}:${echapper(element.id)}"
            ${montrerProjet ? `data-projet="${echapper(element.projet)}"` : ''}>
            <span class="etiquette">${TYPES[element.type]}</span>
            <span class="cal-journee-titre">${echapper(element.titre)}</span>
            ${
              element.quand
                ? `<span class="discret cal-journee-quand">${echapper(element.quand)}</span>`
                : ''
            }
          </button>
        </li>`,
        )
        .join('')}</ul>`
    : `<p class="vide">Rien ce jour-là.</p>`;

  return construireFenetre(lisible, `<h3 class="fenetre-titre">${echapper(lisible)}</h3>${lignes}`);
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

    return construireFenetre(`Modifier ${element.titre}`, contenu);
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
    ${
      element.recurrent
        ? `<p class="discret cal-detail-serie">${echapper(
            RECURRENCES[element.source?.recurrence] ?? 'Se répète',
          )} — modifier ou supprimer agit sur toute la série.</p>`
        : ''
    }
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

  return construireFenetre(element.titre, contenu);
}
