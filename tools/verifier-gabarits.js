#!/usr/bin/env node
// Cherche les accents graves piégés dans les commentaires HTML des gabarits.
//
// Le piège, rencontré QUATRE fois entre le 13 et le 15 août 2026 : un accent
// grave dans un commentaire HTML, à l'intérieur d'un gabarit JS, **ferme la
// chaîne**. Le fichier reste du JavaScript valide — `node --check` passe — et
// l'erreur ne tombe qu'au chargement du module, en cassant tout l'écran :
//
//     const html = `
//       <!-- la ligne est déjà un `<button>` -->   ← ferme le gabarit ici
//       <div>…</div>`;
//
// Ce que fait cet outil : il lit chaque fichier caractère par caractère, suit
// l'ouverture et la fermeture des gabarits, et signale tout commentaire HTML
// contenant un accent grave à l'intérieur de l'un d'eux. Il ne remplace pas un
// chargement dans le navigateur — il attrape juste ce piège-là, celui qu'aucun
// autre outil du dépôt ne voit.
//
//     node tools/verifier-gabarits.js

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = join(RACINE, 'js');

// Les commentaires HTML ouverts DANS un gabarit, avec un accent grave dedans.
// On avance en machine à états plutôt qu'en expression régulière : il faut
// savoir si l'on se trouve dans un gabarit, dans une chaîne ou dans un
// commentaire JS, et une expression régulière ne le sait pas.
function commentairesPieges(source) {
  const trouves = [];
  let dansGabarit = false;
  let ligne = 1;

  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (c === '\n') ligne += 1;

    // L'échappement passe son tour, quel que soit l'endroit.
    if (c === '\\') {
      i += 1;
      continue;
    }

    if (!dansGabarit) {
      // Un commentaire JS ordinaire n'est pas notre affaire : on le saute,
      // sinon un « ` » écrit dedans nous ferait croire à un gabarit.
      if (c === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i += 1;
        ligne += 1;
        continue;
      }
      if (c === '/' && source[i + 1] === '*') {
        const fin = source.indexOf('*/', i + 2);
        const saut = source.slice(i, fin).split('\n').length - 1;
        ligne += saut;
        i = fin + 1;
        continue;
      }
      // Une chaîne ordinaire non plus.
      if (c === "'" || c === '"') {
        const guillemet = c;
        i += 1;
        while (i < source.length && source[i] !== guillemet) {
          if (source[i] === '\\') i += 1;
          if (source[i] === '\n') ligne += 1;
          i += 1;
        }
        continue;
      }
      if (c === '`') dansGabarit = true;
      continue;
    }

    // Dans un gabarit : le commentaire HTML est le terrain du piège.
    if (c === '<' && source.startsWith('<!--', i)) {
      const fin = source.indexOf('-->', i);
      // Un commentaire non refermé avant la fin du gabarit : on s'arrête là.
      const contenu = source.slice(i, fin === -1 ? source.length : fin);
      // Un accent grave ÉCHAPPÉ (\`) ne ferme rien : c'est même la façon
      // correcte d'en écrire un dans un gabarit, et js/app.js le fait depuis
      // toujours. Seuls les nus sont un piège.
      const nu = /(^|[^\\])`/.test(contenu);
      if (nu) {
        trouves.push({ ligne, extrait: contenu.trim().split('\n')[0].slice(0, 72) });
      }
      ligne += contenu.split('\n').length - 1;
      i = fin === -1 ? source.length : fin + 2;
      continue;
    }

    if (c === '`') dansGabarit = false;
  }

  return trouves;
}

const fichiers = readdirSync(DOSSIER)
  .filter((nom) => nom.endsWith('.js'))
  .map((nom) => join(DOSSIER, nom));

let piegés = 0;

for (const fichier of fichiers) {
  for (const { ligne, extrait } of commentairesPieges(readFileSync(fichier, 'utf8'))) {
    piegés += 1;
    const relatif = fichier.slice(RACINE.length + 1);
    console.error(`${relatif}:${ligne}  accent grave dans un commentaire de gabarit`);
    console.error(`  ${extrait}`);
  }
}

if (piegés) {
  console.error(
    `\n${piegés} commentaire${piegés > 1 ? 's' : ''} referme${piegés > 1 ? 'nt' : ''} ` +
      "son gabarit. Le fichier reste valide pour `node --check`, mais le module " +
      "cassera au chargement.\nÉcris le mot sans accents graves.",
  );
  process.exit(1);
}

console.log(`Gabarits sains : ${fichiers.length} fichiers relus, aucun accent grave piégé.`);
