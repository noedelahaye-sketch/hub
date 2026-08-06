// Lecture de la progression du site de révision Bac-3.
//
// Le site Bac-3 est indépendant du hub : il enregistre son avancée dans un gist
// GitHub public, que le hub lit SANS JAMAIS Y ÉCRIRE. Le gist étant public,
// aucun jeton n'est nécessaire.
//
// L'API GitHub anonyme est limitée à 60 requêtes par heure et par IP : on lit
// une fois par ouverture de l'espace, et on garde le résultat en mémoire pour
// la durée de la visite.

const GIST_ID = '9ffae04009423dd49fe42f39d6a75e75';
const FICHIER = 'studi-suivi-sync.json';

// Le référentiel Studi compte 44 livrables (43 questions + la vidéo du bloc 1).
// Le gist ne stocke que les questions touchées : il ne porte pas ce total.
const TOTAL_LIVRABLES = 44;

// Bac-3 considère un livrable comme fait dès qu'il est rédigé (voir `isDone`
// dans son js/app.js).
const STATUTS_FAITS = new Set(['draft', 'done']);

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
export function resumer(donnees) {
  const statuts = Object.values(donnees.status ?? {});
  const livrables = statuts.filter((statut) => STATUTS_FAITS.has(statut)).length;

  return {
    livrables,
    // Si Bac-3 dépassait un jour 44 livrables, on ne calcule pas un
    // pourcentage supérieur à 100.
    totalLivrables: Math.max(TOTAL_LIVRABLES, livrables),
    resumesLus: Object.keys(donnees.coursLu ?? {}).length,
    cartesVues: Object.keys(donnees.box ?? {}).length,
    quizPasses: (donnees.quiz ?? []).length,
    serie: donnees.streak?.current ?? 0,
    serieRecord: donnees.streak?.max ?? 0,
    depot: donnees.deadline ?? null,
    misAJour: donnees._ts ? new Date(donnees._ts) : null,
  };
}
