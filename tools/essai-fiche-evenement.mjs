// ÉPROUVE LE RAPPROCHEMENT « temps fort en base → fiche du planning »
// (16 septembre 2026), celui dont dépend le bouton « Préparer sa com ».
//
// POURQUOI IL EXISTE : le titre est EXCLU comme clé — « Tournoi de pétanque » en
// base contre « Concours de pétanque » au planning —, donc tout repose sur la
// date. Et une tolérance de date est exactement le genre de règle qui se met à
// deviner sans qu'on s'en aperçoive : le cas des deux tournois futsal, à un jour
// d'écart, doit RENDRE NULL plutôt que de choisir.
//
//   node tools/essai-fiche-evenement.mjs
import { EVENEMENTS_CLUB, ficheDeLEvenement } from '../js/evenements-club.js';

let ko = 0;
const v = (nom, obtenu, attendu) => {
  const ok = obtenu === attendu;
  if (!ok) ko += 1;
  console.log(`${ok ? '  ok ' : 'ÉCHEC'} ${nom.padEnd(46)} ${obtenu}${ok ? '' : `  ≠ ${attendu}`}`);
};
const titre = (evenement) => ficheDeLEvenement(evenement)?.titre ?? 'aucune';

console.log('\n=== LES TROIS TEMPS FORTS RÉELS DE NOÉ ===');
v('Tournoi de pétanque · 26 sept. (titre ≠)',
  titre({ date_debut: '2026-09-26T14:00:00' }), 'Concours de pétanque');
v('Tournoi Rose · 17 oct. (casse ≠)',
  titre({ date_debut: '2026-10-17T09:00:00' }), 'Tournoi rose');
v('Goûter de Noël · 18 déc. (1 jour d’écart)',
  titre({ date_debut: '2026-12-18T18:00:00' }), 'Goûter de Noël et présentation des équipes');

console.log('\n=== CE QU’IL DOIT REFUSER ===');
// Les deux tournois futsal sont les 9 et 10 janvier : dans la fenêtre de trois
// jours, un temps fort posé entre eux trouve DEUX candidates.
v('entre les deux futsal (8 janv.) → ambigu',
  titre({ date_debut: '2027-01-08T10:00:00' }), 'aucune');
v('entre les deux futsal (11 janv.) → ambigu',
  titre({ date_debut: '2027-01-11T10:00:00' }), 'aucune');
v('loin de tout (1er mars 2027)',
  titre({ date_debut: '2027-03-01T10:00:00' }), 'aucune');
v('sans date', titre({ date_debut: null }), 'aucune');
v('date illisible', titre({ date_debut: 'pas une date' }), 'aucune');

console.log('\n=== LA DATE EXACTE PASSE DEVANT LA FENÊTRE ===');
// Le 9 janvier est le jour EXACT du futsal séniors : même si le futsal jeunes est
// à un jour, la date exacte tranche sans ambiguïté.
v('9 janv. → séniors, malgré le voisin',
  titre({ date_debut: '2027-01-09T10:00:00' }), 'Tournoi futsal séniors');
v('10 janv. → jeunes, malgré le voisin',
  titre({ date_debut: '2027-01-10T10:00:00' }), 'Tournoi futsal jeunes');

console.log('\n=== AUCUNE FICHE NE PARTAGE SON JOUR (la clé est sûre) ===');
const jours = EVENEMENTS_CLUB.map((e) => e.date);
v('neuf fiches, neuf jours distincts', String(new Set(jours).size), String(jours.length));

console.log(ko ? `\n${ko} ÉCHEC(S).` : '\nTout passe.');
process.exit(ko ? 1 : 0);
