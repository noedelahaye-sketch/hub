// Lecture de la progression du site de révision Bac-3.
//
// Le site Bac-3 est indépendant du hub : il enregistre son avancée dans un gist
// GitHub public, que le hub lit SANS JAMAIS Y ÉCRIRE. Le gist étant public,
// aucun jeton n'est nécessaire.
//
// L'API GitHub anonyme est limitée à 60 requêtes par heure et par IP : on lit
// une fois par ouverture de l'espace, et on garde le résultat en mémoire pour
// la durée de la visite.
//
// RÈGLE : les chiffres affichés ici doivent être identiques à ceux du site
// Bac-3. Chaque calcul ci-dessous reprend la fonction correspondante de son
// `js/app.js`, citée en commentaire. Le gist ne stocke que l'état, pas les
// calculs : compter naïvement ses clés donne de faux chiffres.

const GIST_ID = '9ffae04009423dd49fe42f39d6a75e75';
const FICHIER = 'studi-suivi-sync.json';

// Le référentiel Studi compte 44 livrables (43 questions + la vidéo du bloc 1).
// Le gist ne porte pas ce total : il ne stocke que les questions touchées.
const TOTAL_LIVRABLES = 44;

const JOUR_MS = 86400000;

let enCache = null;

export async function progressionRevisions({ forcer = false } = {}) {
  if (enCache && !forcer) return enCache;

  const reponse = await fetch(`https://api.github.com/gists/${GIST_ID}`);
  if (!reponse.ok) {
    throw new Error(`Lecture du gist impossible (${reponse.status})`);
  }

  const gist = await reponse.json();
  const fichier = gist.files?.[FICHIER];
  if (!fichier) throw new Error(`Le gist ne contient pas ${FICHIER}`);

  // Au-delà d'un mégaoctet, GitHub tronque le contenu et renvoie une URL brute.
  let contenu = fichier.content;
  if (fichier.truncated) {
    contenu = await (await fetch(fichier.raw_url)).text();
  }

  enCache = resumer(JSON.parse(contenu));
  return enCache;
}

// Ne garde du gist que ce que le hub affiche. Chaque champ est défensif : le
// site Bac-3 évolue de son côté, une clé peut manquer.
export function resumer(donnees, maintenant = new Date()) {
  const box = donnees.box ?? {};
  const cardState = donnees.cardState ?? {};
  const coursLu = donnees.coursLu ?? {};
  const quiz = donnees.quiz ?? [];

  // Bac-3, `activeCards` : une carte portant un `cardState` (« revoir » ou
  // « supprime ») est mise de côté et ne compte plus. Puis `renderDashPanel` :
  // vue = box > 0, maîtrisée = box >= 4.
  const active = (identifiant) => !cardState[identifiant];
  const cartesVues = Object.entries(box).filter(
    ([identifiant, niveau]) => niveau > 0 && active(identifiant),
  ).length;
  const cartesMaitrisees = Object.entries(box).filter(
    ([identifiant, niveau]) => niveau >= 4 && active(identifiant),
  ).length;

  // Bac-3, `luEtat` / `luCount` : un résumé passe par nonlu -> wip -> lu.
  // Seul « lu » compte comme lu ; « wip » veut dire en cours.
  const resumesLus = Object.values(coursLu).filter((etat) => etat === 'lu').length;
  const resumesEnCours = Object.values(coursLu).filter((etat) => etat === 'wip').length;

  // Bac-3, `isDone` : un livrable compte dès qu'il est rédigé.
  const livrables = Object.values(donnees.status ?? {}).filter(
    (statut) => statut === 'draft' || statut === 'done',
  ).length;

  // Bac-3, `avgPct` : moyenne des scores de quiz, chacun rapporté à son total.
  const scoreQuiz = quiz.length
    ? Math.round((quiz.reduce((somme, run) => somme + run.s / run.n, 0) / quiz.length) * 100)
    : null;

  return {
    livrables,
    // Si Bac-3 dépassait un jour 44 livrables, on ne calcule pas un
    // pourcentage supérieur à 100.
    totalLivrables: Math.max(TOTAL_LIVRABLES, livrables),
    cartesVues,
    cartesMaitrisees,
    resumesLus,
    resumesEnCours,
    scoreQuiz,
    serie: serieAffichee(donnees.streak, maintenant),
    serieRecord: donnees.streak?.max ?? 0,
    misAJour: donnees._ts ? new Date(donnees._ts) : null,
  };
}

// Bac-3, `streakDisplay` : la série ne vaut que si le dernier jour compté est
// aujourd'hui ou hier. Sinon elle est retombée à zéro, et afficher l'ancienne
// valeur mentirait.
function serieAffichee(streak, maintenant) {
  if (!streak?.lastDate) return 0;
  const minuit = new Date(maintenant);
  minuit.setHours(0, 0, 0, 0);
  const aujourdhui = minuit.getTime();
  const aJour = streak.lastDate === aujourdhui || streak.lastDate === aujourdhui - JOUR_MS;
  return aJour ? (streak.current ?? 0) : 0;
}
