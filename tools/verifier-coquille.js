// La coquille du service worker contient-elle tout ce dont l'app a besoin ?
//
// `sw.js` précharge une liste écrite à la main. Un fichier ajouté au dépôt et
// oublié dans cette liste ne casse rien EN LIGNE — il entre au cache à la
// première visite, par la revalidation — mais il manque à l'ouverture HORS
// LIGNE d'un appareil qui ne l'a jamais chargé, et l'application ne démarre
// pas. C'est arrivé le 13 août avec `ecriture.js` et `mouvements.js`, nés après
// `sw.js` : rien ne l'a signalé, et la vérification hors ligne du jour même
// était passée parce que le navigateur d'essai les avait déjà en cache.
//
//     node tools/verifier-coquille.js
//
// Ce qu'il vérifie : ce qui est RÉELLEMENT référencé — les trois pages
// d'entrée, ce qu'elles chargent, ce que les modules importent de proche en
// proche, et les polices que le CSS appelle. Pas le contenu du dossier : les
// originaux de Canela dorment dans `fonts/`, ils ne sont demandés par personne.
//
// Sa limite, connue : il ne lit pas les adresses écrites À L'INTÉRIEUR d'un
// gabarit JS (`<img src="img/…">` dans une chaîne). Elles sont dans la coquille
// aujourd'hui ; une nouvelle passerait sous le radar. Le jour où ça arrive, la
// bonne réponse est de lui apprendre à lire ces chaînes, pas de revenir à un
// parcours du dossier — c'est ce qui produisait cinquante faux positifs.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, normalize, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const lire = (chemin) => readFileSync(join(RACINE, chemin), 'utf8');

const ENTREES = ['index.html', 'yuno.html', 'hermitage.html'];

// Résout « ../fonts/X.woff2 » vu depuis « css/styles.css » en « fonts/X.woff2 ».
const resoudre = (depuis, cible) =>
  normalize(posix.join(dirname(depuis), cible)).split('\\').join('/');

const requis = new Set(ENTREES);
const aVoir = [...ENTREES];

while (aVoir.length) {
  const fichier = aVoir.pop();
  if (!existsSync(join(RACINE, fichier))) continue;
  const source = lire(fichier);
  const cibles = [];

  if (fichier.endsWith('.html')) {
    // href/src de la page : styles, modules, manifeste, icônes.
    for (const [, cible] of source.matchAll(/(?:href|src)="([^"#:]+)"/g)) cibles.push(cible);
  } else if (fichier.endsWith('.css')) {
    for (const [, cible] of source.matchAll(/url\("([^"]+)"\)/g)) cibles.push(cible);
  } else if (fichier.endsWith('.js')) {
    // Les imports relatifs seulement : un import distant n'a rien à faire ici,
    // et c'est justement la règle « aucune dépendance externe ».
    for (const [, cible] of source.matchAll(/from\s*'(\.[^']+)'/g)) cibles.push(cible);
  } else if (fichier.endsWith('.json')) {
    for (const [, cible] of source.matchAll(/"src"\s*:\s*"([^"]+)"/g)) cibles.push(cible);
  }

  for (const cible of cibles) {
    const chemin = resoudre(fichier, cible);
    if (requis.has(chemin)) continue;
    requis.add(chemin);
    aVoir.push(chemin);
  }
}

const coquille = lire('sw.js');
const manquants = [...requis].filter((nom) => !coquille.includes(`'${nom}'`)).sort();

if (manquants.length) {
  console.error(`Absents de la coquille de sw.js (${manquants.length}) :`);
  for (const nom of manquants) console.error(`  ${nom}`);
  console.error("\nHors ligne, un appareil qui ne les a jamais chargés ne démarrera pas.");
  process.exit(1);
}

console.log(`Coquille complète : ${requis.size} fichiers référencés, aucun oubli.`);
