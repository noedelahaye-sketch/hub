// La progression d'un objectif — la même partout : tableau de bord, espace
// projet, caps des pages Yuno et FCH, sites. Un objectif n'avance pas au
// pourcentage mais au jalon franchi : la barre est donc un CHEMIN de cases,
// une par jalon, qui s'allument à la couleur du projet. Sous le chemin, une
// ligne dit où on en est et surtout ce qui vient — le prochain jalon se lit
// sans déplier la tuile.

import { depuisDateISO, echeanceLisible, echapper, NOMS_PROJETS } from './format.js';

export function construireProgression(jalons = []) {
  const tries = [...jalons].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));

  if (!tries.length) {
    return `<p class="discret progression-legende">Pas encore de jalons.</p>`;
  }

  const atteints = tries.filter((jalon) => jalon.atteint).length;
  const cases = tries
    .map((jalon) => `<i${jalon.atteint ? ' class="atteint"' : ''}></i>`)
    .join('');

  const prochain = tries.find((jalon) => !jalon.atteint);
  let legende;
  if (!prochain) {
    legende = 'Tous les jalons sont atteints.';
  } else {
    const quand = prochain.echeance
      ? ` · ${echapper(echeanceLisible(depuisDateISO(prochain.echeance)))}`
      : '';
    const compte = atteints
      ? `<span class="chiffre">${atteints}</span> sur <span class="chiffre">${tries.length}</span> · prochain jalon`
      : 'premier jalon';
    legende = `${compte} : <span class="prochain-jalon">${echapper(prochain.titre)}</span>${quand}`;
  }

  return `
    <div class="jalons-chemin" role="img"
      aria-label="${atteints} jalon${atteints > 1 ? 's' : ''} sur ${tries.length}">${cases}</div>
    <p class="discret progression-legende">${legende}</p>`;
}

// --- Le cap gravé -----------------------------------------------------------
//
// Sur un TABLEAU DE BORD — l'accueil, les pages projet du hub — le cap est
// inscrit dans la page (demande de Noé, 25 août 2026) : ni carte, ni bordure,
// ni dépliage, aucun geste qui le modifie. On le relit, on ne le règle pas.
// Une colonne par objectif, séparées par un filet, et une porte au bas du bloc
// vers #objectifs, seul endroit du hub où il s'écrit.
//
// `montrerProjet` : l'accueil mélange les projets et doit les nommer ; une page
// projet dit déjà le sien dans son titre.

// C'est le CAP ENTIER qui mène au détail des objectifs, pas chaque titre
// (demande de Noé, 26 août 2026) : un lien par objectif faisait autant de
// cibles que de colonnes, là où le geste est le même partout — aller voir. Un
// seul lien, donc, qui enveloppe les colonnes.
//
// Ce qui suit le cap dans un panneau — le compteur d'euros de Yuno — reste
// DEHORS : il se presse pour s'ouvrir, il n'emmène nulle part.
// `mesures` : ce qu'un objectif se mesure EN PLUS de ses jalons, par
// identifiant. Yuno s'en sert pour dire les euros de « Rembourser mon
// matériel » — les jalons y disent le chemin, les euros disent l'argent, et les
// deux se lisent au même endroit (demande de Noé, 26 août 2026).
export function construireCapGrave(objectifs, { montrerProjet = false, mesures = {} } = {}) {
  const colonnes = objectifs
    .map((objectif) => colonne(objectif, montrerProjet, mesures[objectif.id]))
    .join('');
  return `<a class="cap-grave" href="#objectifs" aria-label="Voir tous tes objectifs">${colonnes}</a>`;
}

// Aller voir ses objectifs ne contredit pas le « rien ne s'y touche » du cap
// gravé : y aller n'est pas le modifier. Rien ici ne coche ni n'enregistre.
function colonne(objectif, montrerProjet, mesure) {
  const jalons = [...(objectif.jalons ?? [])].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  const atteints = jalons.filter((jalon) => jalon.atteint).length;

  // Les jalons se réduisent à leur compte : des points, pleins ou vides. Leurs
  // titres et leurs dates appartiennent à #objectifs.
  const points = jalons.length
    ? `<span class="cap-jalons" role="img"
         aria-label="${atteints} jalon${atteints > 1 ? 's' : ''} sur ${jalons.length}">${jalons
           .map((jalon) => `<i${jalon.atteint ? ' class="atteint"' : ''}></i>`)
           .join('')}</span>`
    : '';

  return `
    <div class="cap-projet" data-projet="${echapper(objectif.projet)}">
      ${
        montrerProjet
          ? `<span class="cap-nom">${echapper(
              NOMS_PROJETS[objectif.projet] ?? objectif.projet,
            )}</span>`
          : ''
      }
      <p class="cap-titre">${echapper(objectif.titre)}</p>
      ${points}
      ${mesure ? `<span class="cap-mesure">${mesure}</span>` : ''}
      ${
        objectif.echeance
          ? `<span class="discret cap-echeance">${echapper(
              echeanceLisible(depuisDateISO(objectif.echeance)),
            )}</span>`
          : ''
      }
    </div>`;
}
