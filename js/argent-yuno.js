// L'ARGENT DE YUNO — une règle, un seul endroit (15 septembre 2026).
//
// CE QUE ÇA DÉPLACE : `argentDeYuno`, `enEuros` et `mesuresDuCap` vivaient dans
// js/photo.js, la page Yuno du hub. Trois écrans les lisent maintenant — cette
// page, la page d'un objectif (js/objectif.js) et l'accueil du site Yuno, dont
// le cap gravé porte ses euros depuis ce jour.
//
// POURQUOI UN MODULE À PART, et pas un import de plus vers photo.js : js/photo.js
// importe DÉJÀ js/yuno.js (pour le mur de photos). Un import en retour aurait
// refermé le cycle — c'est la précaution déjà prise pour `flammeDeSerie`, posée
// dans js/gabarits.js « parce que la page d'une habitude importe déjà js/perso.js,
// et que l'inverse ferait un cycle ».
//
// AU PASSAGE, UNE CONSTANTE QUI S'ÉCRIVAIT DEUX FOIS : `OBJECTIF_MATERIEL` était
// recopiée mot pour mot dans js/photo.js et dans js/objectif.js. Deux copies d'un
// titre reconnu par son texte, c'est le genre d'écart qui ne se voit qu'une fois
// que l'un des deux écrans a cessé de reconnaître le cap.

// Le cap se reconnaît à son TITRE, faute d'une colonne qui dirait « celui-ci se
// mesure en euros ». Le jour où un second cap se mesurera autrement qu'en jalons,
// c'est cette ligne qu'il faudra remplacer par une donnée.
export const OBJECTIF_MATERIEL = 'Rembourser mon matériel';

const EUROS = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
export const enEuros = (montant) => `${EUROS.format(Math.round(montant))} €`;

// UNE COMMANDE LIVRÉE EST ENCAISSÉE (15 septembre 2026, décision de Noé :
// « payée et encaissée c'est la même chose pour moi, garde qu'un statut sur les
// 2 »). Le cycle s'arrête donc à `livree`.
//
// `payee` RESTE DANS CETTE LISTE bien que plus rien ne l'écrive : un CHECK
// s'élargit, il ne se resserre jamais, et une ligne ancienne qui le porterait
// encore doit compter comme les autres. C'était exactement le défaut réparé ce
// jour-là — deux commandes à 70 € sortaient du compte au moment même où l'argent
// arrivait, et l'objectif affichait 1 115 € au lieu de 1 255 €.
//
// La liste vit ICI et non dans js/yuno.js, d'où elle vient : c'est le module qui
// dit ce qu'encaissé veut dire, et le site la lui emprunte. Deux définitions de
// « finie » finiraient par ne plus compter le même argent.
export const COMMANDE_FINIE = ['livree', 'payee'];

// Ce qui est encaissé, et ce qu'il reste à rembourser. Une commande sans
// montant ne compte pas : elle existe, elle n'est simplement pas chiffrée.
//
// LES FRAIS S'AJOUTENT À LA CIBLE, ils ne se retranchent pas des revenus
// (demande de Noé, 26 août 2026). L'arithmétique est la même — le point
// d'équilibre ne bouge pas —, la lecture non : ce que Noé a gagné reste ce
// qu'il a gagné, et c'est la dette qui grossit de l'essence. Un match à 150 €
// avec 40 € de route se lit « 150 € encaissés, 40 € de plus à rembourser »,
// et non « 110 € gagnés ».
export function argentDeYuno(commandes, materiel) {
  const livrees = commandes.filter((commande) => COMMANDE_FINIE.includes(commande.statut));

  const encaisse = livrees.reduce((total, c) => total + Number(c.montant ?? 0), 0);
  const frais = livrees.reduce((total, c) => total + Number(c.frais ?? 0), 0);
  const achats = materiel.reduce((total, achat) => total + Number(achat.prix ?? 0), 0);
  const cible = achats + frais;

  return { encaisse, frais, achats, cible, reste: Math.max(0, cible - encaisse) };
}

// Ce qu'un objectif se mesure EN PLUS de ses jalons, par identifiant. Yuno s'en
// sert pour dire les euros de « Rembourser mon matériel » — les jalons y disent
// le chemin, les euros disent l'argent, et les deux se lisent au même endroit
// (demande de Noé, 26 août 2026).
export function mesuresDuCap(objectifs, commandes, materiel) {
  const objectif = objectifs.find((candidat) => candidat.titre === OBJECTIF_MATERIEL);
  if (!objectif) return {};

  const { encaisse, cible } = argentDeYuno(commandes, materiel);
  // Rien encaissé et rien acheté : l'objectif n'a pas encore de chiffre à dire,
  // et « 0 € sur 0 € » n'en est pas un.
  if (!encaisse && !cible) return {};

  const texte = cible
    ? `<span class="chiffre">${enEuros(encaisse)}</span> sur <span class="chiffre">${enEuros(
        cible,
      )}</span>`
    : `<span class="chiffre">${enEuros(encaisse)}</span> encaissés`;

  return { [objectif.id]: texte };
}
