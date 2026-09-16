// ÉPROUVE OÙ MÈNENT LES LIENS DES ÉCRANS DU CAP (16 septembre 2026).
//
// POURQUOI IL EXISTE : la galerie du cap, la page d'un objectif et celle d'un
// projet servent le hub ET les deux sites. Un lien qui se tromperait de base
// ferait SORTIR DU SITE sans le dire — ce que les deux cahiers des charges
// interdisent, leur seule porte étant « Quitter le site » en pied de page. Le
// défaut a été mesuré chez Yuno le 15 septembre ; ce banc est là pour ne pas le
// repayer.
//
// LE CAS PIÈGE EST `#hermitagexyz` : le test porte sur le PREMIER SEGMENT du
// hash, pas sur un préfixe — sans quoi une adresse qui commence par les mêmes
// lettres serait prise pour le site.
//
//   node tools/essai-cap-adresses.mjs
import { versLaGalerieDuCap, versLObjectif, versLeProjet, dansUnSite } from '../js/cap-adresses.js';

globalThis.location = { hash: '' };
let ko = 0;
const v = (nom, obtenu, attendu) => {
  const ok = obtenu === attendu;
  if (!ok) ko += 1;
  console.log(`${ok ? '  ok ' : 'ÉCHEC'} ${nom.padEnd(38)} ${obtenu}${ok ? '' : `  ≠ ${attendu}`}`);
};

for (const [hash, base, site] of [
  ['#dashboard', '#objectifs', false],
  ['#objectifs/caps', '#objectifs', false],
  ['#yuno', '#yuno/cap', true],
  ['#yuno/creer', '#yuno/cap', true],
  ['#hermitage', '#hermitage/cap', true],
  ['#hermitage/club', '#hermitage/cap', true],
  ['#hermitagexyz', '#objectifs', false],
]) {
  location.hash = hash;
  v(`${hash} → galerie`, versLaGalerieDuCap(), base);
  v(`${hash} → objectif`, versLObjectif('abc'), site ? `${base.replace('/cap', '')}/objectif/abc` : '#objectif/abc');
  v(`${hash} → dansUnSite`, String(dansUnSite()), String(site));
}

location.hash = '#hermitage';
v('étage de la galerie', versLaGalerieDuCap('projets'), '#hermitage/cap/projets');
v('projet dans le club', versLeProjet('x y'), '#hermitage/projet/x%20y');

console.log(ko ? `\n${ko} ÉCHEC(S).` : '\nTout passe.');
process.exit(ko ? 1 : 0);
