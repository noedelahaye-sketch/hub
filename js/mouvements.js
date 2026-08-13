// Ce qui vient d'apparaître dans une liste, et rien d'autre.
//
// Les listes du hub se redessinent en entier (`innerHTML`) : après le rendu,
// rien ne distingue la ligne qu'on vient de créer de celles qui étaient déjà
// là. On garde donc la trace de ce qui a été vu, et on ne fait respirer que la
// différence.
//
// Sans cette mémoire, deux défauts opposés : animer toute la liste à chaque
// rendu (un clignotement général à chaque case cochée), ou n'animer rien.

// Le temps de voir la coche se dessiner, PUIS de la voir posée. Une tâche
// cochée quitte sa liste dans l'instant — « Aujourd'hui » sur l'accueil, la
// section à faire dans l'espace Tâches — et sans cette pause l'animation ne
// serait jamais vue : la ligne serait déjà partie.
//
// 600 ms, et c'est mesuré plutôt que choisi : le dessin lui-même prend 270 ms
// (le disque se remplit en 260, le v se pose de 70 à 270). À 300 ms, la ligne
// partait donc à l'instant précis où le v finissait — on voyait la coche se
// FAIRE, jamais posée. Les 330 ms restants sont ce temps-là, et l'ensemble
// tient largement sous la seconde.
const DUREE_COCHE = 600;

const sansMouvement = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Dessine la coche sur le cercle qu'on vient de toucher, et rend la main quand
// elle est posée. L'appelant enchaîne alors son écriture optimiste : l'ordre
// est « on voit, puis la ligne s'en va », jamais l'inverse.
//
// L'animation est purement visuelle — elle ne retarde AUCUNE écriture, qui
// part de son côté. Et qui a demandé moins de mouvement n'attend rien du tout.
export function animerLaCoche(cercle) {
  if (!cercle || sansMouvement()) return Promise.resolve();

  cercle.classList.add('coche-vient');
  return new Promise((resoudre) => setTimeout(resoudre, DUREE_COCHE));
}

export function marquerLesEntrantes(conteneur, memoire, { selecteur, cle } = {}) {
  if (!conteneur) return;

  const lignes = [...conteneur.querySelectorAll(selecteur)];
  const vues = new Set();

  for (const ligne of lignes) {
    const identifiant = cle(ligne);
    if (!identifiant) continue;
    vues.add(identifiant);

    // Premier rendu : tout est « nouveau », et tout animer ferait entrer la
    // page par vagues. La mémoire vide vaut donc « on ne sait pas encore ».
    if (memoire.size && !memoire.has(identifiant)) {
      ligne.classList.add('ligne-entre');
      ligne.addEventListener(
        'animationend',
        () => ligne.classList.remove('ligne-entre'),
        { once: true },
      );
    }
  }

  memoire.clear();
  for (const identifiant of vues) memoire.add(identifiant);
}
