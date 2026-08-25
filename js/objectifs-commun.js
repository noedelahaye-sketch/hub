// La progression d'un objectif — la même partout : tableau de bord, espace
// projet, caps des pages Yuno et FCH, sites. Un objectif n'avance pas au
// pourcentage mais au jalon franchi : la barre est donc un CHEMIN de cases,
// une par jalon, qui s'allument à la couleur du projet. Sous le chemin, une
// ligne dit où on en est et surtout ce qui vient — le prochain jalon se lit
// sans déplier la tuile.

import { depuisDateISO, echeanceLisible, echapper } from './format.js';

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
