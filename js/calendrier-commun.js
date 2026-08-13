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

import * as api from './api.js';
import { construireFormulaire, construireFenetre } from './espace-projet.js';
import {
  depuisDateISO,
  versDateISO,
  ajouterJours,
  momentLisible,
  echeanceLisible,
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
      // Avec une heure, la barre du calendrier l'écrit devant le titre ; sans,
      // elle ne dit que le jour. C'est `heureDe` qui tranche, et il ne regarde
      // que ça : minuit = pas d'heure.
      date: tache.heure
        ? new Date(`${tache.echeance}T${tache.heure}`)
        : depuisDateISO(tache.echeance),
      faite: tache.statut === 'fait',
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
      // Comme une tâche : avec une heure, elle l'affiche. L'heure de parution
      // est une décision éditoriale, pas un détail.
      date: pub.heure
        ? new Date(`${pub.date_prevue}T${pub.heure}`)
        : depuisDateISO(pub.date_prevue),
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

// --- L'onglet du calendrier ---------------------------------------------------
// Le calendrier n'est pas un lieu comme les autres : c'est l'outil qui regarde
// tous les autres. Dans les trois barres il porte donc une icône plutôt qu'un
// mot, et il se tient à part, en bout de rangée. Décision de Noé, 13 août 2026.
//
// Un dessin et non un émoji — le hub n'écrit qu'en × ↗ ‹ ›, et un émoji
// arriverait avec sa couleur et sa police à lui. `currentColor` le laisse
// suivre l'encre de l'onglet, actif comme au repos.

const ICONE_CALENDRIER = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
  <path d="M3 10h18M8 3v4M16 3v4"></path>
</svg>`;

// Le lien tout fait, pour les trois barres. Sans texte, l'onglet perdrait son
// nom : `aria-label` le lui rend, et `title` le montre au survol.
export function ongletCalendrier(adresse, actif) {
  return `
    <a href="${adresse}" class="nav-calendrier${actif ? ' actif' : ''}"
      data-nav="calendrier" title="Calendrier" aria-label="Calendrier"
      ${actif ? 'aria-current="page"' : ''}>${ICONE_CALENDRIER}</a>`;
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
    // Trois clés, dans cet ordre. Le jour de départ. Puis les plus longues :
    // une barre de trois jours mérite le couloir du haut, sinon elle se faufile
    // sous des barres d'un jour — et une barre qui traverse la semaine n'a pas
    // d'heure qui veuille dire quelque chose. Puis l'heure : entre deux
    // éléments d'un même jour, celui de 9 h passe au-dessus de celui de 15 h.
    .sort(
      (a, b) =>
        a.depuis - b.depuis ||
        b.jusqua - b.depuis - (a.jusqua - a.depuis) ||
        a.element.date - b.element.date,
    );

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

// L'heure d'un élément, quand elle veut dire quelque chose. Deux réserves :
// minuit veut dire « pas d'heure » (c'est la convention d'`assemblerCalendrier`,
// où une tâche sans heure part de `depuisDateISO`), et une barre qui traverse
// plusieurs jours n'a pas d'heure à annoncer — « 19:00 » sur un trait qui court
// du lundi au jeudi ne dirait rien de vrai.
function heureDe(element) {
  const date = element.date;
  if (date.getHours() === 0 && date.getMinutes() === 0) return null;
  if (element.jusqua && element.jusqua !== versDateISO(date)) return null;
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// La hauteur d'une barre en vue semaine : sa durée, à raison de 2,5 rem par
// heure. C'est ce qui reste de la grille horaire — non plus une échelle de 24 h
// où tout se place, mais une simple proportion : un match de deux heures est
// deux fois plus haut qu'un rendez-vous d'une heure, et ça se voit sans compter.
// Seul un événement a une fin déclarée ; une tâche arrive à un moment, elle
// garde donc sa hauteur de ligne.
const HAUTEUR_PAR_HEURE = 2.5;

function hauteurSelonLaDuree(element) {
  const fin = element.source?.date_fin ? new Date(element.source.date_fin) : null;
  if (!fin) return null;

  const minutes = (fin - element.date) / 60000;
  if (!(minutes > 0)) return null;
  return (minutes / 60) * HAUTEUR_PAR_HEURE;
}

function barre(segment, { montrerProjet = false, proportionnel = false } = {}) {
  const { element, deborde } = segment;
  const projet = montrerProjet ? ` data-projet="${echapper(element.projet)}"` : '';
  const heure = heureDe(element);
  // `min-height` et non `height` : la durée pose un plancher, un titre qui
  // passe à la ligne peut le dépasser. Une barre ne coupe jamais son texte
  // pour tenir dans sa durée.
  const hauteur = proportionnel && heure ? hauteurSelonLaDuree(element) : null;
  // Une tâche faite garde sa place et le dit : cercle coché, titre barré. La
  // faire disparaître effacerait ce qu'on a accompli, ce que ce site ne fait
  // jamais.
  const signe = element.faite ? '◉' : SIGNES[element.type];
  const classes = [
    'cal-barre-element',
    `cal-type-${element.type}`,
    element.faite ? 'cal-faite' : '',
    deborde.avant ? 'deborde-avant' : '',
    deborde.apres ? 'deborde-apres' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<button type="button" class="${classes}"${projet}
    style="grid-column: ${segment.depuis + 1} / ${segment.jusqua + 2}; grid-row: ${
      segment.couloir + 2
    };${hauteur ? ` min-height: ${hauteur.toFixed(2)}rem;` : ''}"
    ${element.recurrent ? 'data-recurrent' : ''}
    data-element="${echapper(element.type)}:${echapper(element.id)}"
    aria-label="${echapper(
      [
        TYPES[element.type],
        element.titre,
        element.quand ?? versDateISO(element.date),
        // `quand` porte déjà l'heure pour un événement ; une tâche et une
        // publication n'ont que leur date, l'heure se dit alors à part.
        element.quand ? null : heure,
      ]
        .filter(Boolean)
        .join(' · '),
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
             ${element.type === 'tache' ? `title="${element.faite ? 'Faite' : 'Marquer comme faite'}"` : ''}
             aria-hidden="true">${signe}</span>`
        : ''
    }${
      // L'heure devant le titre, en chiffres et en retrait : c'est ce qui
      // remplace la grille horaire. Elle est déjà dans l'étiquette lue à voix
      // haute, d'où l'`aria-hidden`.
      heure ? `<span class="cal-barre-heure" aria-hidden="true">${echapper(heure)}</span>` : ''
    }${echapper(element.titre)}</button>`;
}

function ligneDeSemaine(jours, elements, options) {
  const { montrerProjet, proportionnel, maximum, mois, aujourdhui, selection } = options;
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
      ${visibles.map((segment) => barre(segment, { montrerProjet, proportionnel })).join('')}
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
    // Une barre haute comme sa durée : seulement en semaine. En mois, une case
    // fait 7 rem — un match de deux heures y prendrait les trois quarts de sa
    // journée et écraserait tout le reste.
    proportionnel: vue === 'semaine',
    // En vue mois une ligne ne peut pas tout montrer : trois couloirs, puis un
    // reste. La semaine n'a qu'une ligne et toute la hauteur : on montre tout.
    maximum: vue === 'semaine' ? 0 : 3,
    mois: vue === 'semaine' ? null : ancre.getMonth(),
    aujourdhui: versDateISO(new Date()),
    selection,
  };

  // La semaine est un mois d'une seule ligne (décision de Noé, 13 août 2026).
  // Elle a porté une grille de 24 h où chaque élément occupait sa vraie durée ;
  // c'était beaucoup de hauteur pour peu de choses — une semaine à trois
  // rendez-vous, c'est vingt-quatre cases vides pour trois pleines, et il
  // fallait faire défiler pour trouver ce qu'on cherchait. Une case par jour,
  // l'heure écrite devant le titre, l'ordre chronologique : la même information
  // se lit d'un coup d'œil.
  if (vue === 'semaine') {
    return `
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
        ${ligneDeSemaine(jours, retenus, options)}
      </div>
      <p class="discret cal-aide">Touche un jour — ou glisse sur une série de jours —
        pour y poser quelque chose. Clique une barre pour la voir en détail.</p>`;
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

// Quand un événement finit, selon ce que le formulaire a reçu. Trois cas :
//   — une date de fin plus tardive : l'événement tient plusieurs jours, sa
//     barre les traverse et il finit au soir du dernier ;
//   — une heure et une durée : la fin s'en déduit, et la fiche de détail la dit ;
//   — ni l'un ni l'autre : il tient la journée, sans fin déclarée.
export function finDeLEvenement(debut, champs) {
  if (champs.fin && champs.fin !== champs.debut) return new Date(`${champs.fin}T23:59`);
  if (!champs.heure) return null;

  const minutes = Number(champs.duree) || 60;
  return new Date(debut.getTime() + minutes * 60000);
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

// --- Poser au calendrier : la tuile ------------------------------------------
//
// Même mécanique que la capture de l'espace Tâches (13 août 2026, demande de
// Noé) : une tuile volante sur fond assombri, le titre écrit directement, une
// bande de pastilles qui défile sans jamais passer à la ligne, et la flèche
// d'envoi qui garde sa place.
//
// Ce qui change ici, et c'est tout l'objet : **les pastilles s'adaptent à la
// nature** de ce qu'on pose. Un événement a une durée et se répète ; une tâche
// a une priorité ; une publication a un réseau et un format ; un objectif a un
// pourquoi. Chacun ne montre que ce qu'il demande.
//
// Le contrat avec les espaces qui l'appellent n'a pas bougé d'un pouce : les
// champs gardent leurs `name`, le formulaire son `data-action`, et les natures
// leur `data-nature-creation`. Ni `calendrier.js` ni `yuno.js` n'ont eu à
// changer leur façon de lire ce qui est posé — c'est la présentation qui a été
// refaite, pas les données.
//
// Les panneaux sont TOUS dans le DOM, masqués : les valeurs vivent donc dans
// leurs champs, pas dans un état à part, et ouvrir une pastille ne redessine
// rien. C'est ce qui permet de garder la fenêtre de création telle qu'elle
// était côté espaces — une fonction pure appelée au rendu.

const ICONE = {
  nature: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"></path>
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"></circle></svg>`,
  quand: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>`,
  projet: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10 3 8 21M16 3l-2 18M3.5 8.5h17M3 15.5h17"></path></svg>`,
  priorite: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 22V3"></path><path d="M5 3.5h13l-2.4 4.6L18 13H5z"></path></svg>`,
  repetition: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17 2l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
  reseau: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"></path></svg>`,
  texte: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h10"></path></svg>`,
  duree: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>`,
  format: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <path d="M3 15l5-5 4 4 3-3 6 6"></path></svg>`,
};

const FLECHE_ENVOI = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>`;

// Ce que le titre demande, selon ce qu'on pose. « Quoi » convenait à tout et ne
// disait rien : le mot juste rappelle à lui seul ce qu'on est en train de créer.
const INVITE_TITRE = {
  evenement: "Nom de l'événement",
  tache: 'Nom de la tâche',
  publication: "L'idée, en une phrase",
  objectif: "L'objectif, formulé de façon mesurable",
};

const PRIORITES_CAL = {
  1: 'Priorité 1',
  2: 'Priorité 2',
  3: 'Priorité 3',
  4: 'Priorité 4',
};

function champCapture({ nom, libelle, type, valeur = '', requis = false }) {
  const id = `cal-${nom}`;
  const controle =
    type === 'textarea'
      ? `<textarea id="${id}" name="${nom}" rows="2">${echapper(valeur)}</textarea>`
      : `<input id="${id}" name="${nom}" type="${type}" value="${echapper(valeur)}" ${
          requis ? 'required' : ''
        }>`;

  return `<label class="champ-capture" for="${id}">${echapper(libelle)}</label>${controle}`;
}

// Le drapeau de priorité, comme dans l'espace Tâches : plein et coloré de 1 à 3,
// vide pour la 4 — le cas ordinaire ne se colore pas.
const DRAPEAU_CAL = (rempli) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M5 22V3"></path>
  <path d="M5 3.5h13l-2.4 4.6L18 13H5z" fill="${rempli ? 'currentColor' : 'none'}"></path>
</svg>`;

// Un choix se fait dans une LISTE, jamais dans un `<select>` natif.
//
// C'était l'erreur de la première version : un menu déroulant du système, avec
// son cadre bleu et son chevron, au milieu d'une tuile dessinée. Laid, et
// surtout pénible — au doigt il faut viser un contrôle de 30 px puis une ligne
// dans une roue. Ici chaque option est une ligne pleine largeur, avec son
// drapeau ou sa pastille de projet, exactement comme dans l'espace Tâches.
//
// La valeur voyage dans un champ caché : les espaces lisent toujours le
// formulaire avec `FormData`, ils n'ont pas à savoir comment on l'a saisie.
function champChoix({ nom, options, valeur, decor = null }) {
  const ligne = ([cle, texte]) => {
    const choisi = String(cle) === String(valeur);
    const signe =
      decor === 'priorite'
        ? `<span class="choix-drapeau">${DRAPEAU_CAL(String(cle) !== '4')}</span>`
        : decor === 'projet'
          ? '<span class="choix-pastille" aria-hidden="true"></span>'
          : '';

    return `
      <li><button type="button" data-choix="${nom}" data-valeur="${echapper(String(cle))}"
        aria-pressed="${choisi}"
        ${decor === 'priorite' ? `data-priorite="${echapper(String(cle))}"` : ''}
        ${decor === 'projet' ? `data-projet="${echapper(String(cle))}"` : ''}
        class="${choisi ? 'actif' : ''}">${signe}<span>${echapper(texte)}</span></button></li>`;
  };

  return `
    <input type="hidden" name="${nom}" value="${echapper(String(valeur))}">
    <ul class="choix-capture">${Object.entries(options).map(ligne).join('')}</ul>`;
}

// Une pastille et son panneau, rendus SÉPARÉMENT. La pastille part dans la
// bande qui défile ; le panneau, lui, se pose hors d'elle — sinon l'`overflow`
// de la bande le découperait net. Ils se retrouvent par leur nom.
//
// `source` dit quel champ relire pour écrire le libellé de la pastille : une
// pastille renseignée affiche sa valeur, c'est ce qui permet de relire toute la
// fiche sans ouvrir un seul panneau.
function pastilleCapture({
  nom,
  icone,
  defaut,
  source = null,
  sourceHeure = null,
  // La valeur qui ne compte pas pour renseignée. Une priorité 4 est le cas
  // ordinaire : la pastille doit dire « Priorité », pas « Priorité 4 ».
  neutre = null,
  contenu,
  rempli = false,
}) {
  return {
    pastille: `<button type="button" class="pastille-capture${rempli ? ' remplie' : ''}"
      data-pastille="${nom}" aria-expanded="false"
      ${source ? `data-source="${source}"` : ''}
      ${sourceHeure ? `data-source-heure="${sourceHeure}"` : ''}
      ${neutre !== null ? `data-neutre="${echapper(String(neutre))}"` : ''}
      data-defaut="${echapper(defaut)}">${icone}<span data-libelle>${echapper(defaut)}</span></button>`,
    panneau: `<div class="capture-popover" data-panneau="${nom}" hidden>${contenu}</div>`,
  };
}

export function fenetreCreation({ debut, fin, nature = 'evenement', heure = '', projets = null }) {
  const memeJour = debut === fin;
  const jourLisible = (cle) =>
    depuisDateISO(cle).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Seul un événement s'étend. Une tâche, une publication ou un objectif porte
  // une date unique : on prend le premier jour, et on le dit.
  const surLePremierJour = !memeJour && nature !== 'evenement';

  const projetsOfferts =
    projets &&
    Object.fromEntries(
      Object.entries(projets).filter(([cle]) => nature === 'evenement' || cle !== 'perso'),
    );

  const pastilles = [];

  // 1. La nature, toujours en tête : c'est elle qui commande tout le reste.
  pastilles.push(
    pastilleCapture({
      nom: 'nature',
      icone: ICONE.nature,
      defaut: NATURES_CREABLES[nature],
      rempli: true,
      contenu: `<ul class="choix-capture">${Object.entries(NATURES_CREABLES)
        .map(
          ([valeur, libelle]) => `
        <li><button type="button" data-nature-creation="${valeur}"
          aria-pressed="${valeur === nature}"
          class="${valeur === nature ? 'actif' : ''}">${libelle}</button></li>`,
        )
        .join('')}</ul>`,
    }),
  );

  // 2. Quand. Les dates se montrent et se corrigent : le glissement les
  // pré-remplit, il ne les impose pas — sans ça, un événement de plusieurs
  // jours ne pourrait naître que d'un geste de souris, impossible au doigt.
  const champsQuand =
    nature === 'evenement'
      ? `<div class="capture-deux-champs">
           <span>${champCapture({ nom: 'debut', libelle: 'Du', type: 'date', valeur: debut, requis: true })}</span>
           <span>${champCapture({ nom: 'heure', libelle: 'À quelle heure', type: 'time', valeur: heure })}</span>
         </div>
         ${champCapture({ nom: 'fin', libelle: "Jusqu'au (vide = un seul jour)", type: 'date', valeur: memeJour ? '' : fin })}`
      : nature === 'objectif'
        ? champCapture({ nom: 'debut', libelle: 'Échéance', type: 'date', valeur: debut, requis: true })
        : `<div class="capture-deux-champs">
             <span>${champCapture({ nom: 'debut', libelle: 'Quand', type: 'date', valeur: debut, requis: true })}</span>
             <span>${champCapture({ nom: 'heure', libelle: 'Heure', type: 'time' })}</span>
           </div>`;

  pastilles.push(
    pastilleCapture({
      nom: 'quand',
      icone: ICONE.quand,
      defaut: jourLisible(debut),
      source: 'debut',
      sourceHeure: nature === 'objectif' ? null : 'heure',
      rempli: true,
      contenu: `${champsQuand}${
        surLePremierJour
          ? `<p class="discret cal-note-nature">Posé sur le ${echapper(
              jourLisible(debut),
            )} — seul un événement s'étend sur plusieurs jours.</p>`
          : ''
      }`,
    }),
  );

  // 3. Le projet, quand l'espace en offre le choix. Le site Yuno n'en propose
  // pas : on y est déjà chez Yuno.
  if (projetsOfferts) {
    pastilles.push(
      pastilleCapture({
        nom: 'projet',
        icone: ICONE.projet,
        defaut: projetsOfferts.photo ?? Object.values(projetsOfferts)[0],
        source: 'projet',
        rempli: true,
        contenu: champChoix({
          nom: 'projet',
          options: projetsOfferts,
          valeur: 'photo' in projetsOfferts ? 'photo' : Object.keys(projetsOfferts)[0],
          decor: 'projet',
        }),
      }),
    );
  }

  // 4. Ce que cette nature-là demande, et rien d'autre.
  if (nature === 'evenement') {
    pastilles.push(
      pastilleCapture({
        nom: 'duree',
        icone: ICONE.duree,
        defaut: '2 heures',
        source: 'duree',
        contenu: champChoix({ nom: 'duree', options: DUREES, valeur: '120' }),
      }),
      pastilleCapture({
        nom: 'repetition',
        icone: ICONE.repetition,
        defaut: 'Une seule fois',
        source: 'recurrence',
        contenu: `${champChoix({ nom: 'recurrence', options: RECURRENCES, valeur: '' })}
          ${champCapture({ nom: 'recurrence_fin', libelle: "Jusqu'au (facultatif)", type: 'date' })}`,
      }),
      pastilleCapture({
        nom: 'lieu',
        icone: ICONE.texte,
        defaut: 'Lieu et notes',
        source: 'lieu',
        contenu: `${champCapture({ nom: 'lieu', libelle: 'Où', type: 'text' })}
          ${champCapture({ nom: 'notes', libelle: 'Notes', type: 'textarea' })}`,
      }),
    );
  }

  if (nature === 'tache') {
    pastilles.push(
      pastilleCapture({
        nom: 'priorite',
        icone: ICONE.priorite,
        defaut: 'Priorité',
        source: 'priorite',
        neutre: '4',
        contenu: champChoix({
          nom: 'priorite',
          options: PRIORITES_CAL,
          valeur: '4',
          decor: 'priorite',
        }),
      }),
    );
  }

  if (nature === 'publication') {
    pastilles.push(
      // Deux pastilles, pas deux listes dans une : neuf lignes empilées
      // dépasseraient l'écran, et « où je poste » n'est pas « sous quelle
      // forme » — ce sont deux décisions.
      pastilleCapture({
        nom: 'reseau',
        icone: ICONE.reseau,
        defaut: RESEAUX.instagram,
        source: 'reseau',
        rempli: true,
        contenu: champChoix({ nom: 'reseau', options: RESEAUX, valeur: 'instagram' }),
      }),
      pastilleCapture({
        nom: 'format',
        icone: ICONE.format,
        defaut: FORMATS.post,
        source: 'format',
        rempli: true,
        contenu: champChoix({ nom: 'format', options: FORMATS, valeur: 'post' }),
      }),
    );
  }

  if (nature === 'objectif') {
    pastilles.push(
      pastilleCapture({
        nom: 'pourquoi',
        icone: ICONE.texte,
        defaut: 'Le pourquoi',
        source: 'cible',
        contenu: `${champCapture({ nom: 'pourquoi', libelle: 'Pourquoi ? (relu les jours sans motivation)', type: 'textarea' })}
          ${champCapture({ nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' })}`,
      }),
    );
  }

  return `
    <div class="fenetre-fond capture-fond" data-fermer-fenetre></div>
    <form class="capture" data-action="creer-depuis-calendrier" role="dialog" aria-modal="true"
      aria-label="Poser au calendrier">
      <input type="hidden" name="nature" value="${echapper(nature)}">
      <input type="text" id="cal-titre" name="titre" required class="capture-titre"
        placeholder="${echapper(INVITE_TITRE[nature])}" autocomplete="off"
        aria-label="${echapper(INVITE_TITRE[nature])}">

      <div class="capture-pastilles">
        <div class="capture-pastilles-liste">${pastilles.map((p) => p.pastille).join('')}</div>
        <button type="submit" class="capture-envoyer" aria-label="Poser au calendrier"
          title="Poser au calendrier">${FLECHE_ENVOI}</button>
      </div>

      <!-- Les panneaux vivent ici, hors de la bande : elle défile, et son
           débordement masqué les découperait. Ils se posent au-dessus. -->
      ${pastilles.map((p) => p.panneau).join('')}

      <p class="message-erreur" data-erreur hidden></p>
    </form>`;
}

// Le comportement des pastilles, branché une fois par espace. Il ne touche
// qu'au DOM : ouvrir un panneau n'écrit rien dans l'état de l'espace, donc rien
// ne se redessine et aucune saisie ne se perd.
export function brancherCapture(section) {
  const panneaux = () => [...section.querySelectorAll('.capture-popover')];

  const fermerLesPanneaux = () => {
    for (const panneau of panneaux()) {
      panneau.hidden = true;
      section
        .querySelector(`[data-pastille="${panneau.dataset.panneau}"]`)
        ?.setAttribute('aria-expanded', 'false');
    }
  };

  // Le libellé d'une pastille EST la valeur de son champ, quand il y en a une.
  // C'est ce qui permet de relire toute la fiche sans ouvrir un seul panneau.
  const rafraichirLesLibelles = () => {
    for (const pastille of section.querySelectorAll('.capture-pastilles [data-pastille]')) {
      const source = pastille.dataset.source;
      if (!source) continue;

      const champ = section.querySelector(`.capture [name="${source}"]`);
      const libelle = pastille.querySelector('[data-libelle]');
      if (!champ || !libelle) continue;

      // La valeur neutre ne compte pas pour renseignée : la pastille garde son
      // libellé, et son encre discrète.
      const neutre = pastille.dataset.neutre;
      let texte = '';
      if (neutre !== undefined && champ.value === neutre) {
        texte = '';
      } else if (champ.type === 'hidden') {
        // Un champ caché ne porte qu'une clé : son libellé se relit dans la
        // liste de choix, là où il est écrit en toutes lettres. Une valeur vide
        // (« Une seule fois ») vaut le libellé par défaut de la pastille.
        texte = champ.value
          ? section
              .querySelector(
                `[data-choix="${source}"][data-valeur="${CSS.escape(champ.value)}"] span:last-child`,
              )
              ?.textContent.trim() ?? ''
          : '';
      } else if (champ.type === 'date') {
        texte = champ.value ? echeanceLisible(depuisDateISO(champ.value)) : '';
      } else {
        texte = champ.value.trim();
      }

      const heure = pastille.dataset.sourceHeure
        ? section.querySelector(`.capture [name="${pastille.dataset.sourceHeure}"]`)?.value
        : '';
      if (texte && heure) texte = `${texte}, ${heure}`;

      libelle.textContent = texte || pastille.dataset.defaut;
      pastille.classList.toggle('remplie', Boolean(texte));
    }
    marquerLeDebordement();
  };

  // De quel côté la bande a-t-elle encore de la réserve ? La feuille de style
  // pose un fondu du bon côté, et seulement là où il reste à voir.
  const marquerLeDebordement = () => {
    const bande = section.querySelector('.capture-pastilles-liste');
    if (!bande) return;
    bande.classList.toggle('deborde-avant', bande.scrollLeft > 1);
    bande.classList.toggle(
      'deborde-apres',
      bande.scrollLeft + bande.clientWidth < bande.scrollWidth - 1,
    );
  };

  section.addEventListener('click', (evenement) => {
    // Un choix dans une liste : il écrit dans son champ caché, marque la ligne,
    // referme le panneau. Le formulaire n'a jamais su qu'il y avait autre chose
    // qu'un champ derrière.
    const choix = evenement.target.closest('[data-choix]');
    if (choix) {
      const { choix: nom, valeur } = choix.dataset;
      const champ = section.querySelector(`.capture [name="${nom}"]`);
      if (champ) champ.value = valeur;

      for (const frere of section.querySelectorAll(`[data-choix="${nom}"]`)) {
        const actif = frere === choix;
        frere.classList.toggle('actif', actif);
        frere.setAttribute('aria-pressed', String(actif));
      }
      fermerLesPanneaux();
      rafraichirLesLibelles();
      return;
    }

    const pastille = evenement.target.closest('.capture-pastilles [data-pastille]');
    if (pastille) {
      const panneau = section.querySelector(
        `.capture-popover[data-panneau="${pastille.dataset.pastille}"]`,
      );
      const ouvert = !panneau.hidden;
      fermerLesPanneaux();
      panneau.hidden = ouvert;
      pastille.setAttribute('aria-expanded', String(!ouvert));
      if (!ouvert) panneau.querySelector('input, select, textarea')?.focus();
      return;
    }

    // Un clic ailleurs dans la tuile referme le panneau ouvert. Les boutons des
    // panneaux se sont déjà servis — ils portent leurs propres écouteurs dans
    // l'espace, et ce clic-ci arrive après eux.
    if (evenement.target.closest('.capture') && !evenement.target.closest('.capture-popover')) {
      fermerLesPanneaux();
    }
  });

  section.addEventListener('input', rafraichirLesLibelles);
  section.addEventListener('change', rafraichirLesLibelles);
  section.addEventListener(
    'scroll',
    (evenement) => {
      if (evenement.target.closest?.('.capture-pastilles-liste')) marquerLeDebordement();
    },
    true,
  );
  window.addEventListener('resize', marquerLeDebordement);

  // Appelé après chaque rendu de l'espace : la tuile vient d'être réécrite.
  return () => {
    rafraichirLesLibelles();
    section.querySelector('#cal-titre')?.focus();
  };
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

// --- Écrire ce qu'on vient de poser ------------------------------------------
//
// La tuile est la même partout ; ce qu'elle écrit doit l'être aussi. Cette
// fonction était recopiée dans l'espace Calendrier, et une troisième copie
// allait naître avec le « + » du dashboard — trois endroits où oublier de faire
// suivre un champ. (C'est exactement ce qui s'était produit avec l'heure et la
// priorité d'une tâche : offertes à l'écran, jetées à l'écriture.)
//
// `projetParDefaut` sert aux espaces qui ne demandent pas le projet : le site
// Yuno sait qu'il est chez lui.
export async function poserAuCalendrier(champs, { projetParDefaut = 'photo' } = {}) {
  const titre = champs.titre.trim();
  const projet = champs.projet ?? projetParDefaut;

  if (champs.nature === 'tache') {
    return api.creerTache({
      projet,
      titre,
      // Active d'emblée : le réglage backlog / active est masqué depuis le
      // 13 août, une tâche notée est une tâche à faire.
      statut: 'actif',
      echeance: champs.debut,
      heure: champs.heure || null,
      priorite: Number(champs.priorite) || 4,
    });
  }

  if (champs.nature === 'publication') {
    return api.creerPublication({
      projet,
      titre,
      reseau: champs.reseau,
      format: champs.format,
      date_prevue: champs.debut,
      heure: champs.heure || null,
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
  const fin = finDeLEvenement(debut, champs);

  return api.creerEvenement({
    projet,
    titre,
    date_debut: debut.toISOString(),
    date_fin: fin ? fin.toISOString() : null,
    recurrence: champs.recurrence || null,
    recurrence_fin: champs.recurrence_fin || null,
    lieu: champs.lieu?.trim() || null,
    notes: champs.notes?.trim() || null,
  });
}
