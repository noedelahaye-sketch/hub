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

// LE SITE DU CLUB FAIT PAREIL DEPUIS LE 16 SEPTEMBRE 2026 (demande de Noé : « il
// faut d'ailleurs créer une page tâches dans le site FCH comme c'est fait sur
// yuno, et une page objectif, et projet, comme chez yuno »). Même mécanique, même
// raison : ses liens ne doivent pas faire sortir du site.
//
// `#hermitage` AUTANT QUE `#hermitage/…` : l'accueil du site porte son cap gravé,
// et avec le seul préfixe `#hermitage/` il aurait renvoyé vers le hub — un lien
// qui fait sortir du site sans le dire. C'est le défaut qui a été mesuré chez
// Yuno ; on ne le repaie pas.
export const dansLeSiteFch = () => /^#hermitage(\/|$)/.test(location.hash);

// LE SITE COURANT, OU RIEN. Une seule lecture de l'adresse pour les trois
// fonctions qui suivent : trois tests répétés finiraient par ne plus s'accorder
// le jour où un troisième site arrive.
const siteCourant = () => {
  if (dansLeSiteYuno()) return '#yuno';
  if (dansLeSiteFch()) return '#hermitage';
  return null;
};

// DANS UN SITE, N'IMPORTE LEQUEL. Les deux GARDES des modules du cap s'en
// servent, et elles ne sont pas cosmétiques :
//
//   — le TITRE du navigateur. « Album du club — Hub » au milieu du site du club
//     est la mention que sa spec interdit partout ailleurs qu'en pied de page ;
//   — `body.dataset.espace`, et c'est la plus importante des deux : la page d'un
//     projet la pose à l'espace du projet pour en prendre la couleur. Depuis un
//     SITE, ça remplacerait `hermitage` par `fch` — **le site perdrait son bleu,
//     sa police et son dock d'un coup**, au milieu d'une navigation.
//
// Elle existait pour Yuno seul depuis le 15 septembre ; le club la reprend le 16,
// et une seule fonction la porte pour que le troisième site n'ait rien à
// réapprendre.
export const dansUnSite = () => siteCourant() !== null;

// La galerie, et son étage. LE SITE A SES SOUS-VUES DEPUIS LE 15 SEPTEMBRE 2026
// au soir (demande de Noé : « dans le menu déroulant mon cap, rajoute les pages
// mes objectifs, mes projets ») : deux entrées de menu qui mèneraient toutes
// deux à `#yuno/cap` seraient deux liens identiques, et **trois liens identiques
// ne sont pas un menu** — c'est l'argument qui a découpé `#objectifs` dans le
// hub le 28 août.
//
// L'étage vit au TROISIÈME segment chez Yuno (`#yuno/cap/caps`) là où le hub le
// porte au second (`#objectifs/caps`) : le site a déjà consommé le premier pour
// se nommer. C'est la même traduction que pour `#yuno/objectif/<id>`.
export function versLaGalerieDuCap(vue = '') {
  const site = siteCourant();
  if (site) return vue ? `${site}/cap/${vue}` : `${site}/cap`;
  return vue ? `#objectifs/${vue}` : '#objectifs';
}

export function versLObjectif(id) {
  const cle = encodeURIComponent(id);
  const site = siteCourant();
  return site ? `${site}/objectif/${cle}` : `#objectif/${cle}`;
}

export function versLeProjet(id) {
  const cle = encodeURIComponent(id);
  const site = siteCourant();
  return site ? `${site}/projet/${cle}` : `#projet/${cle}`;
}
