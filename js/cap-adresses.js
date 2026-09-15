// OÙ VIVENT LES ÉCRANS DU CAP (15 septembre 2026, demande de Noé : le site Yuno
// veut ses objectifs et ses projets « à l'image du hub », mutualisés, « mais avec
// la forme et la DA de Yuno »).
//
// LES MÊMES ÉCRANS, DEUX ADRESSES. La galerie du cap, la page d'un objectif et
// celle d'un projet (js/objectifs.js, js/objectif.js, js/projet.js — 4 400
// lignes) servent maintenant le hub ET le site. Il ne fallait donc plus écrire
// leurs liens en dur : `#objectif/<id>` mène au hub, et depuis le site il aurait
// fait sortir du site — ce que la spec de Yuno interdit, sa seule porte étant
// « Quitter le site », en pied de page.
//
// LA BASE SE DÉDUIT DE L'ADRESSE COURANTE, elle ne se déclare pas. C'est la
// leçon de la barre du menu, ce matin : une VARIABLE de module aurait été
// partagée par les deux montages — le hub et le site vivent dans la même page —
// et le dernier monté aurait décidé pour l'autre. Une fonction lue au moment du
// rendu dit toujours la vérité de l'écran qu'on est en train de dessiner.
//
// TROIS ADRESSES DANS LE SITE, contre cinq dans le hub : la galerie y est une
// seule page (`#yuno/cap`) là où le hub a trois vues (`#objectifs/caps`,
// `/projets`, `/periodes`). Elles n'y auraient rien découpé — le site n'a que
// deux caps et dix projets, et `#objectifs` seul montre déjà les trois étages.

// `#yuno` AUTANT QUE `#yuno/…` : l'accueil du site n'a pas de seconde partie,
// et c'est là que vivent ses tuiles de cap. Mesuré : avec le seul préfixe
// `#yuno/`, elles renvoyaient vers le hub — un lien qui fait sortir du site
// sans le dire. Le test porte donc sur le PREMIER SEGMENT du hash.
export const dansLeSiteYuno = () => /^#yuno(\/|$)/.test(location.hash);

// La galerie. `vue` ne vaut que pour le hub : le site n'en a qu'une.
export function versLaGalerieDuCap(vue = '') {
  if (dansLeSiteYuno()) return '#yuno/cap';
  return vue ? `#objectifs/${vue}` : '#objectifs';
}

export function versLObjectif(id) {
  const cle = encodeURIComponent(id);
  return dansLeSiteYuno() ? `#yuno/objectif/${cle}` : `#objectif/${cle}`;
}

export function versLeProjet(id) {
  const cle = encodeURIComponent(id);
  return dansLeSiteYuno() ? `#yuno/projet/${cle}` : `#projet/${cle}`;
}
