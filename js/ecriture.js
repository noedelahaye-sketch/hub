// L'écran d'abord, le réseau ensuite — la mécanique, en un seul endroit.
//
// Le motif est toujours le même : on change l'état, on redessine, on écrit, et
// si l'écriture échoue on remet exactement ce qu'il y avait avant en le disant.
// Il était recopié vingt fois dans le hub et les deux sites, chaque copie avec
// sa façon d'oublier le retour en arrière — d'où ce fichier.
//
// Ce qui n'est PAS ici, volontairement : les écritures dont l'échec ne se
// rattrape pas d'un coup (loguer un moment, qui envoie une photo avant
// d'écrire) et celles qui créent une ligne dont on ne connaît pas encore
// l'identifiant. Elles ont leur propre traitement là où elles vivent.

// Le message par défaut. Chaque appelant peut le préciser, aucun ne doit se
// taire : un geste défait en silence ressemble à une panne.
const MESSAGE = "Ça n'a pas pu être enregistré.";

// En console, le message est le même partout : c'est la PILE qui dit quel
// geste a échoué, et elle le dit mieux qu'une étiquette à recopier vingt fois.
function noter(erreur) {
  console.error('Écriture impossible', erreur);
}

// Modifier UNE ligne déjà en base. La photographie d'avant sert de retour en
// arrière — clés supprimées comprises, d'où le vidage avant la remise.
//
//   await modifierAussitot(pub, { statut: 'pret' }, () =>
//     api.modifierPublication(pub.id, { statut: 'pret' }), { rendre });
export async function modifierAussitot(ligne, champs, ecrire, { rendre, echouer } = {}) {
  const avant = { ...ligne };
  Object.assign(ligne, champs);
  rendre?.();

  try {
    const confirmee = await ecrire();
    // Le serveur a le dernier mot sur ce qu'il a écrit (horodatages compris),
    // mais il ne redessine rien : l'écran a déjà raison.
    if (confirmee) Object.assign(ligne, confirmee);
    return confirmee ?? ligne;
  } catch (erreur) {
    noter(erreur);
    for (const cle of Object.keys(ligne)) delete ligne[cle];
    Object.assign(ligne, avant);
    rendre?.();
    echouer?.(MESSAGE);
    return null;
  }
}

// Retirer une ligne d'une liste. Elle revient À SA PLACE si l'écriture échoue :
// une ligne qui réapparaît ailleurs ferait douter de ce qui a été supprimé.
//
// La liste est modifiée SUR PLACE (`splice`) et non remplacée : l'état garde la
// même référence, et rien n'a besoin de savoir d'où elle vient.
export async function retirerAussitot(liste, ligne, ecrire, { rendre, echouer } = {}) {
  const rang = liste.indexOf(ligne);
  if (rang === -1) return false;

  liste.splice(rang, 1);
  rendre?.();

  try {
    await ecrire();
    return true;
  } catch (erreur) {
    noter(erreur);
    liste.splice(rang, 0, ligne);
    rendre?.();
    echouer?.(MESSAGE);
    return false;
  }
}

// Ajouter une ligne qui n'existe pas encore en base. Elle s'affiche avec un
// identifiant provisoire, remplacé par le vrai quand le serveur répond.
//
// `estProvisoire` dit à l'appelant ce qu'il doit refuser en attendant : agir
// sur une ligne que le serveur ne connaît pas encore n'a pas de sens, et
// l'écriture partirait sur un identifiant inventé.
export async function ajouterAussitot(liste, provisoire, ecrire, { rendre, echouer } = {}) {
  const ligne = { ...provisoire, id: identifiantProvisoire(), enVol: true };
  liste.unshift(ligne);
  rendre?.();

  try {
    const creee = await ecrire();
    // Remplacée EN PLACE plutôt que réordonnée : la ligne ne doit pas bouger
    // sous les yeux au moment où le serveur répond.
    const rang = liste.indexOf(ligne);
    if (rang !== -1) liste[rang] = creee;
    rendre?.();
    return creee;
  } catch (erreur) {
    noter(erreur);
    const rang = liste.indexOf(ligne);
    if (rang !== -1) liste.splice(rang, 1);
    rendre?.();
    echouer?.(MESSAGE);
    return null;
  }
}

let compteur = 0;

export function identifiantProvisoire() {
  compteur += 1;
  return `provisoire-${compteur}`;
}

export function estProvisoire(id) {
  return typeof id === 'string' && id.startsWith('provisoire-');
}
