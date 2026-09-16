// ÉPROUVE L'ACCUEIL DU SITE FC HERMITAGE HORS ÉCRAN — la cascade de sa carte
// chaude et le classement de ses portes (16 septembre 2026).
//
// POURQUOI IL EXISTE : cinq rangs qui se bousculent et six portes qui se
// disputent trois places, c'est exactement le genre de règle qu'on ne croit pas
// sur parole — et qu'on ne peut pas vérifier en regardant l'écran d'un jour
// particulier, puisqu'un seul rang y parle à la fois. C'est le motif de
// `tools/essai-diagnostic.mjs` et des essais de l'accueil Yuno.
//
//   node tools/essai-accueil-fch.mjs
//
// ATTENTION AU NOM DE L'ÉTAT : les partenaires DE LA SAISON (avec leur offre,
// leur montant et leurs engagements) sont dans `partenairesSuivi` ; `partenaires`
// sont les CONTACTS de type partenaire. Un banc qui se trompe de nom passe au
// vert en ne testant rien.
import { carteDuMoment, portesDuJour } from '../js/hermitage.js';

const LE_JOUR = new Date('2026-09-16T10:00:00');
const iso = (d) => new Date(LE_JOUR.getTime() + d * 864e5).toISOString().slice(0, 10);
const inst = (d, h = 18) => {
  const x = new Date(LE_JOUR); x.setDate(x.getDate() + d); x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

const vide = {
  evenements: [], publications: [], taches: [], objectifs: [], fiches: [],
  actionsClub: [], partenairesSuivi: [],
};

const etiquette = (html) => (html.match(/class="etiquette">([^<]*)</) || [, '—'])[1];
const titre = (html) => (html.match(/class="tf-titre">([^<]*)</) || [, '—'])[1].trim();
const noms = (html) => [...html.matchAll(/class="fch-hall-nom">([^<]*)</g)].map((m) => m[1]);

let echecs = 0;
const verifier = (nom, obtenu, attendu) => {
  const ok = obtenu === attendu;
  if (!ok) echecs += 1;
  console.log(`${ok ? '  ok ' : 'ÉCHEC'} ${nom.padEnd(34)} ${obtenu}${ok ? '' : `   ≠ ${attendu}`}`);
};

const reunion = { id: 'r', titre: 'CA de rentrée', date_debut: inst(1), reunion_objet: 'ca' };
const tempsFort = { id: 't', titre: 'Tournoi de pétanque', date_debut: inst(10), temps_fort: true, lieu: 'Beaumont' };
const attendus = [
  { nom: 'MG+', statut: 'virement_attendu', montant: 600, engagements: [] },
  { nom: 'NEVIM', statut: 'virement_attendu', montant: 250, engagements: [] },
];

console.log('\n=== LA CASCADE : le premier rang satisfait gagne, et il est SEUL ===');
const carte = (etat) => {
  const html = carteDuMoment(etat, LE_JOUR);
  return html ? `[${etiquette(html)}] ${titre(html)}` : 'RIEN';
};

verifier('rang 1 · une réunion', carte({ ...vide, evenements: [reunion] }),
  '[À préparer] CA de rentrée');
verifier('rang 1 passe devant le 2', carte({ ...vide, evenements: [reunion, tempsFort] }),
  '[À préparer] CA de rentrée');
verifier('rang 2 · un temps fort', carte({ ...vide, evenements: [tempsFort] }),
  '[Temps fort] Tournoi de pétanque');
verifier('rang 3 · parution à préparer', carte({ ...vide,
  publications: [{ id: 'p', titre: 'Résultat du weekend', date_prevue: iso(1), statut: 'idee', reseau: 'facebook' }] }),
  '[À préparer] Résultat du weekend');
verifier('… mais pas si elle est prête', carte({ ...vide,
  publications: [{ id: 'p', titre: 'Résultat du weekend', date_prevue: iso(1), statut: 'pret' }] }),
  '[La com’] 1 parution sur les quinze jours');
verifier('… ni si elle est à 5 jours', carte({ ...vide,
  publications: [{ id: 'p', titre: 'Loin', date_prevue: iso(5), statut: 'idee' }] }),
  '[La com’] 1 parution sur les quinze jours');
verifier('rang 4 · virements attendus', carte({ ...vide, partenairesSuivi: attendus }),
  '[Partenaires] 850 € attendent');
verifier('… se tait si tout est encaissé', carte({ ...vide,
  partenairesSuivi: [{ nom: 'ATOL', statut: 'partenaire', montant: 900, engagements: [] }] }),
  '[La com’] Rien de posé sur les quinze jours');
verifier('rang 5 · jamais muet', carte(vide),
  '[La com’] Rien de posé sur les quinze jours');

console.log('\n=== LES PORTES : trois au plus, jamais deux de la même rubrique ===');
const avecEngagements = [{ nom: 'MG+', statut: 'partenaire',
  engagements: [{ cle: 'panneau-stade' }, { cle: 'vignette-album' }] }];
const uneParution = [{ id: 'p', date_prevue: iso(2), statut: 'idee', titre: 'x' }];

verifier('rien à dire : deux portes', noms(portesDuJour(vide, LE_JOUR)).join(' | '),
  'La com’ de la semaine | Les évènements');
verifier('engagements en tête', noms(portesDuJour({ ...vide, partenairesSuivi: avecEngagements }, LE_JOUR)).join(' | '),
  'Nos engagements | La com’ de la semaine | Les évènements');
verifier('semaine pleine : la com descend',
  noms(portesDuJour({ ...vide, partenairesSuivi: avecEngagements, publications: uneParution }, LE_JOUR)).join(' | '),
  'Nos engagements | Les évènements | La com’ de la semaine');
verifier('trois au plus', String(noms(portesDuJour({ ...vide,
  partenairesSuivi: avecEngagements, publications: uneParution, evenements: [reunion],
  actionsClub: [{ id: 'a', titre: 'Relancer', statut: 'a_venir' }] }, LE_JOUR)).length), '3');
verifier('jamais deux fois la com’', String(new Set(noms(portesDuJour({ ...vide,
  publications: uneParution }, LE_JOUR))).size),
  String(noms(portesDuJour({ ...vide, publications: uneParution }, LE_JOUR)).length));

console.log(echecs ? `\n${echecs} ÉCHEC(S).` : '\nTout passe.');
process.exit(echecs ? 1 : 0);
