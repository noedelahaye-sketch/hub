// Le calendrier — tout ce qui porte une date, assemblé en une seule liste.
//
// Deux consommateurs : l'espace Calendrier du hub (tous projets) et l'écran
// Calendrier du site Yuno (projet photo seul). Même assemblage, même rendu,
// mêmes filtres — seules les données passées changent.
//
// Les fonctions ne font que fabriquer du HTML à partir de données déjà
// chargées, comme partout dans le hub.

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

// Les types d'éléments datés. Le filtre « objectif » couvre aussi les jalons :
// un jalon daté est une étape d'objectif, pas une espèce à part.
const TYPES = {
  evenement: 'Événement',
  tache: 'Tâche',
  publication: 'Publication',
  objectif: 'Objectif',
  jalon: 'Jalon',
  commande: 'Commande',
  relance: 'Relance',
};

// Un seul filtre pour ce que le carnet réseau met à l'agenda : une relance
// promise et une commande à livrer sont deux façons de tenir un engagement
// envers quelqu'un.
export const FILTRES = [
  ['tout', 'Tout'],
  ['publication', 'Publications'],
  ['tache', 'Tâches'],
  ['evenement', 'Événements'],
  ['objectif', 'Objectifs'],
  ['relance', 'Relances/Commandes'],
];

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
      type: 'evenement',
      date,
      // Le dernier jour occupé, s'il y en a plusieurs. La liste n'en fait rien
      // — elle dirait trois fois la même chose ; la grille s'en sert pour
      // étaler l'événement sur toute sa durée.
      jusqua: evenement.date_fin ? versDateISO(new Date(evenement.date_fin)) : null,
      projet: evenement.projet,
      titre: evenement.titre,
      detail: evenement.lieu,
      quand: momentLisible(date),
    });
  }

  for (const tache of taches) {
    elements.push({
      type: 'tache',
      date: depuisDateISO(tache.echeance),
      projet: tache.projet,
      titre: tache.titre,
      detail: tache.statut === 'backlog' ? 'backlog' : null,
    });
  }

  for (const objectif of objectifs) {
    if (objectif.echeance) {
      elements.push({
        type: 'objectif',
        date: depuisDateISO(objectif.echeance),
        projet: objectif.projet,
        titre: objectif.titre,
      });
    }
    for (const jalon of objectif.jalons ?? []) {
      if (jalon.echeance && !jalon.atteint) {
        elements.push({
          type: 'jalon',
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
      type: 'publication',
      date: depuisDateISO(pub.date_prevue),
      projet: 'photo',
      titre: pub.titre,
      detail: `${RESEAUX[pub.reseau] ?? pub.reseau} · ${FORMATS[pub.format] ?? pub.format}`,
    });
  }

  for (const commande of commandes) {
    elements.push({
      type: 'commande',
      date: depuisDateISO(commande.echeance),
      projet: 'photo',
      titre: commande.titre,
      detail: commande.client ? `à livrer à ${commande.client}` : 'à livrer',
    });
  }

  // Les prochaines actions datées du carnet réseau. Elles disent ce qu'on a
  // promis à quelqu'un, pas ce qu'on attend de lui.
  for (const contact of relances) {
    elements.push({
      type: 'relance',
      date: depuisDateISO(contact.prochaine_action_date),
      projet: 'photo',
      titre: contact.prochaine_action || `Reprendre contact avec ${contact.nom}`,
      detail: contact.nom,
    });
  }

  return elements.sort((a, b) => a.date - b.date);
}

// --- Les périodes ------------------------------------------------------------
// Trois façons de regarder la même liste. L'agenda était la seule ; le mois et
// la semaine sont venus après, parce qu'un trou dans un planning se voit sur
// une grille et pas dans une liste.

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

// Décaler l'ancre d'une période, dans le sens demandé.
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

  return `${premier.getDate()}${memeMois ? '' : ` ${premier.toLocaleDateString('fr-FR', { month: 'short' })}`} – ${dernier.toLocaleDateString(
    'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )}`;
}

// --- Rendu -------------------------------------------------------------------

// Une barre horizontale qui déborde cache ce qui dépasse : si l'élément actif
// est hors champ, on le ramène au centre. Sans toucher au défilement de la
// page — d'où le calcul manuel plutôt que scrollIntoView.
export function centrerActif(conteneur, selecteur = '.actif') {
  const actif = conteneur?.querySelector(selecteur);
  if (!actif || conteneur.scrollWidth <= conteneur.clientWidth) return;
  conteneur.scrollLeft = actif.offsetLeft - (conteneur.clientWidth - actif.offsetWidth) / 2;
}

export function construireFiltres(actif = 'tout') {
  return `<div class="filtres" role="group" aria-label="Filtrer le calendrier">
    ${FILTRES.map(
      ([valeur, libelle]) => `
      <button type="button" data-filtre="${valeur}"
        aria-pressed="${valeur === actif}"
        class="${valeur === actif ? 'actif' : ''}">${libelle}</button>`,
    ).join('')}
  </div>`;
}

function retenu(element, filtre) {
  if (filtre === 'tout') return true;
  if (filtre === 'objectif') return element.type === 'objectif' || element.type === 'jalon';
  // Un filtre pour deux natures : ce que le carnet réseau met à l'agenda.
  if (filtre === 'relance') return element.type === 'relance' || element.type === 'commande';
  return element.type === filtre;
}

// `montrerProjet` : sur le hub les projets se mélangent, chaque tuile dit le
// sien ; sur le site Yuno tout est photo, le répéter serait du bruit.
// La barre de période : les trois vues, et de quoi se déplacer. « Aujourd'hui »
// ramène toujours au présent — dans un calendrier on se perd vite.
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

function pastilleElement(element, montrerProjet) {
  const projet = montrerProjet ? ` data-projet="${echapper(element.projet)}"` : '';
  return `<span class="cal-puce"${projet} title="${echapper(
    `${TYPES[element.type]} · ${element.titre}`,
  )}">${echapper(element.titre)}</span>`;
}

function elementsParJour(elements) {
  const carte = new Map();
  const poser = (cle, element) => {
    if (!carte.has(cle)) carte.set(cle, []);
    carte.get(cle).push(element);
  };

  for (const element of elements) {
    const debut = versDateISO(element.date);
    poser(debut, element);

    if (!element.jusqua || element.jusqua <= debut) continue;

    // Un événement de plusieurs jours occupe chacun d'eux — c'est ce qu'une
    // grille sait montrer et qu'une liste ne sait pas. La borne d'un an évite
    // qu'une date de fin aberrante fasse tourner la boucle sans fin.
    const jour = new Date(element.date);
    jour.setHours(0, 0, 0, 0);
    for (let compte = 0; compte < 366; compte += 1) {
      jour.setDate(jour.getDate() + 1);
      const cle = versDateISO(jour);
      if (cle > element.jusqua) break;
      poser(cle, element);
    }
  }

  return carte;
}

// Une case de la grille. Elle porte sa date en clair : c'est elle que le
// glissement de la souris lit pour savoir ce qu'on a sélectionné.
function caseDuJour(jour, elements, { montrerProjet, mois, maximum, aujourdhui, selection }) {
  const cle = versDateISO(jour);
  const dedans = elements ?? [];
  const montres = maximum ? dedans.slice(0, maximum) : dedans;
  const reste = dedans.length - montres.length;

  const classes = [
    'cal-jour',
    mois !== null && jour.getMonth() !== mois ? 'cal-hors-mois' : '',
    cle === aujourdhui ? 'cal-aujourdhui' : '',
    // La plage choisie reste marquée tant que le formulaire est ouvert : on
    // doit voir sur quoi on est en train de poser quelque chose.
    selection && cle >= selection.debut && cle <= selection.fin ? 'cal-choisi' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <td class="${classes}" data-jour="${cle}">
      <span class="cal-numero">${jour.getDate()}</span>
      <span class="cal-pile">
        ${montres.map((element) => pastilleElement(element, montrerProjet)).join('')}
        ${reste > 0 ? `<span class="cal-reste discret">+${reste}</span>` : ''}
      </span>
    </td>`;
}

// La grille elle-même. Un tableau, parce que c'en est un : sept colonnes de
// jours, une ligne par semaine.
export function construireGrille(
  elements,
  filtre,
  vue,
  ancre,
  { montrerProjet = false, selection = null } = {},
) {
  const retenus = elements.filter((element) => retenu(element, filtre));
  const parJour = elementsParJour(retenus);
  const jours = vue === 'semaine' ? grilleDeLaSemaine(ancre) : grilleDuMois(ancre);
  const aujourdhui = versDateISO(new Date());

  const options = {
    montrerProjet,
    // En vue mois, une case ne peut pas tout montrer : trois puces et un
    // reste. En semaine il y a la place, on montre tout.
    maximum: vue === 'semaine' ? 0 : 3,
    mois: vue === 'semaine' ? null : ancre.getMonth(),
    aujourdhui,
    selection,
  };

  const lignes = [];
  for (let debut = 0; debut < jours.length; debut += 7) {
    const semaine = jours.slice(debut, debut + 7);
    lignes.push(`<tr>${semaine
      .map((jour) => caseDuJour(jour, parJour.get(versDateISO(jour)), options))
      .join('')}</tr>`);
  }

  return `
    <table class="cal-grille cal-${vue}">
      <thead>
        <tr>${JOURS_COURTS.map((nom) => `<th scope="col">${nom}</th>`).join('')}</tr>
      </thead>
      <tbody>${lignes.join('')}</tbody>
    </table>
    <p class="discret cal-aide">Touche un jour — ou glisse sur une série de jours —
      pour y poser un événement.</p>`;
}

// Le glissement de sélection, branché une fois sur le conteneur. Il peint les
// cases au passage et rappelle `quandChoisi` au relâchement.
//
// Sur écran tactile, `pointerover` ne visite pas les cases voisines pendant un
// glissement : un doigt choisit donc un seul jour. Ce n'est pas un manque —
// le formulaire porte les deux dates, une plage reste atteignable partout.
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

  // Relâcher hors de la fenêtre n'a rien choisi du tout.
  section.addEventListener('pointercancel', () => {
    depuis = null;
    peindre('', '');
  });
}

// Ce qu'une plage de jours veut dire : un événement. Une tâche ou une
// publication porte une date unique ; s'étendre sur trois jours, c'est le
// propre de ce qu'on vit. Le projet n'est demandé que sur le calendrier du
// hub — chez Yuno, c'est photo.
export function formulaireEvenement({ debut, fin, projets = null }) {
  const memeJour = debut === fin;
  const quand = memeJour
    ? depuisDateISO(debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : `du ${depuisDateISO(debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${depuisDateISO(
        fin,
      ).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;

  return `
    <div class="cal-creation">
      <p class="cal-creation-quand">Poser quelque chose <strong>${echapper(quand)}</strong></p>
      ${construireFormulaire({
        id: 'evenement-cal',
        libelle: 'Ajouter un événement',
        action: 'creer-evenement-cal',
        bouton: 'Poser au calendrier',
        ouvert: true,
        extra: `<input type="hidden" name="debut" value="${echapper(debut)}">
                <input type="hidden" name="fin" value="${echapper(fin)}">`,
        champs: [
          { nom: 'titre', libelle: 'Quoi', type: 'text', requis: true },
          ...(projets
            ? [{ nom: 'projet', libelle: 'Pour quel projet', type: 'select', options: projets, valeur: 'photo' }]
            : []),
          { nom: 'heure', libelle: 'À quelle heure (facultatif)', type: 'time' },
          { nom: 'lieu', libelle: 'Où (facultatif)', type: 'text' },
          { nom: 'notes', libelle: 'Notes (facultatif)', type: 'textarea' },
        ],
      })}
      <button type="button" class="lien-discret bouton-mini" data-annuler-creation>Annuler</button>
    </div>`;
}

export function construireCalendrier(elements, filtre = 'tout', { montrerProjet = false } = {}) {
  const retenus = elements.filter((element) => retenu(element, filtre));

  if (!retenus.length) {
    return `<p class="vide">Rien de daté ici pour l'instant.</p>`;
  }

  // Groupés par mois : le calendrier se parcourt, il ne s'épluche pas.
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
              <span class="semaine-titre">${echapper(element.titre)}</span>
              ${element.detail ? `<span class="discret calendrier-detail">${echapper(element.detail)}</span>` : ''}
            </li>`,
            )
            .join('')}
        </ul>
      </section>`,
    )
    .join('');
}
