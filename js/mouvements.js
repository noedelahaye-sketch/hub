// Ce qui vient d'apparaître dans une liste, et rien d'autre.
//
// Les listes du hub se redessinent en entier (`innerHTML`) : après le rendu,
// rien ne distingue la ligne qu'on vient de créer de celles qui étaient déjà
// là. On garde donc la trace de ce qui a été vu, et on ne fait respirer que la
// différence.
//
// Sans cette mémoire, deux défauts opposés : animer toute la liste à chaque
// rendu (un clignotement général à chaque case cochée), ou n'animer rien.

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
