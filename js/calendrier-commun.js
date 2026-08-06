// Le calendrier — tout ce qui porte une date, assemblé en une seule liste.
//
// Deux consommateurs : l'espace Calendrier du hub (tous projets) et l'écran
// Calendrier du site Yuno (projet photo seul). Même assemblage, même rendu,
// mêmes filtres — seules les données passées changent.
//
// Les fonctions ne font que fabriquer du HTML à partir de données déjà
// chargées, comme partout dans le hub.

import { depuisDateISO, momentLisible, echapper, NOMS_PROJETS } from './format.js';

export const RESEAUX = { instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn' };
export const FORMATS = { post: 'Post', carrousel: 'Carrousel', reel: 'Réel', story: 'Story' };

// Les types d'éléments datés. Le filtre « objectif » couvre aussi les jalons :
// un jalon daté est une étape d'objectif, pas une espèce à part.
const TYPES = {
  evenement: 'Événement',
  tache: 'Tâche',
  publication: 'Publication',
  objectif: 'Objectif',
  jalon: 'Jalon',
};

export const FILTRES = [
  ['tout', 'Tout'],
  ['publication', 'Publications'],
  ['tache', 'Tâches'],
  ['evenement', 'Événements'],
  ['objectif', 'Objectifs'],
];

// --- Assemblage --------------------------------------------------------------

export function assemblerCalendrier({ evenements = [], taches = [], objectifs = [], publications = [] }) {
  const elements = [];

  for (const evenement of evenements) {
    const date = new Date(evenement.date_debut);
    elements.push({
      type: 'evenement',
      date,
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

  return elements.sort((a, b) => a.date - b.date);
}

// --- Rendu -------------------------------------------------------------------

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
  return element.type === filtre;
}

// `montrerProjet` : sur le hub les projets se mélangent, chaque tuile dit le
// sien ; sur le site Yuno tout est photo, le répéter serait du bruit.
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
