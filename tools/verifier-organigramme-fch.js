// Vérifie la cohérence des sources de l’organigramme sans connexion ni écriture en base.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { PERSONNES, GROUPES } from '../js/organigramme-fch-data.js';
import { MISSIONS_FCH } from '../js/missions-fch.js';
import { construireOrganigramme } from '../js/organigramme-fch.js';
import { construireProjetClub } from '../js/projet-club.js';
const coquille = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.equal(new Set(GROUPES.map(g=>g.id)).size, GROUPES.length, 'Groupes dupliqués');
for (const g of GROUPES) {
  assert.equal(new Set(g.membres).size, g.membres.length, `Doublon dans ${g.id}`);
  assert.ok(g.membres.every(id=>PERSONNES[id]), `Personne absente dans ${g.id}`);
  assert.ok(g.responsables.every(id=>g.membres.includes(id)), `Responsable absent de ${g.id}`);
}
for (const [id,p] of Object.entries(PERSONNES)) {
  assert.equal(p.id,id);
  assert.ok(p.photo && existsSync(new URL('../'+p.photo.src,import.meta.url)), `Portrait absent : ${id}`);
  assert.ok(coquille.includes("'"+p.photo.src+"'"), `Portrait hors cache : ${id}`);
  const [x,y,w,h]=p.photo.cadre;
  // Le cadre est CARRÉ : le portrait est rond à l'écran, et un cadre plus haut
  // que large l'étirerait. Il peut déborder de l'image — le sujet est détouré,
  // donc ce qui dépasse est transparent et laisse voir la carte.
  assert.equal(w,h,`Cadrage non carré : ${id}`);
  assert.ok(w>0 && x<p.photo.largeur && y<p.photo.hauteur && x+w>0 && y+h>0, `Cadrage hors image : ${id}`);
  // La bande du nom reste hors champ : la carte écrit déjà le nom dessous.
  assert.ok(y+h<=p.photo.hauteur, `Le cadre descend sous l'image : ${id}`);
  // LES PORTRAITS D'ORGANIGRAMME passent le même contrôle que le portrait par
  // défaut : ce sont les mêmes fenêtres sur les mêmes exports, et un cadre faux
  // s'y verrait aussi mal. Ils sont FACULTATIFS — une personne absente d'un
  // organigramme garde le portrait qu'elle a.
  for (const [domaine, photo] of Object.entries(p.photos ?? {})) {
    assert.ok(['commissions','sportif'].includes(domaine), `Organigramme inconnu : ${id}/${domaine}`);
    assert.ok(existsSync(new URL('../'+photo.src,import.meta.url)), `Portrait absent : ${id}/${domaine}`);
    assert.ok(coquille.includes("'"+photo.src+"'"), `Portrait hors cache : ${id}/${domaine}`);
    assert.ok(photo.src.includes(`/${domaine}/${id}.`), `Portrait mal rangé : ${id}/${domaine}`);
    const [cx,cy,cw,ch]=photo.cadre;
    assert.equal(cw,ch,`Cadrage non carré : ${id}/${domaine}`);
    assert.ok(cw>0 && cx<photo.largeur && cy<photo.hauteur && cx+cw>0 && cy+ch>0,
      `Cadrage hors image : ${id}/${domaine}`);
    assert.ok(cy+ch<=photo.hauteur, `Le cadre descend sous l'image : ${id}/${domaine}`);
  }
  assert.ok(GROUPES.some(g=>g.membres.includes(id)), `Personne sans groupe : ${id}`);
  for(const key of Object.keys(p.missions)) assert.ok(GROUPES.some(g=>g.id===key&&g.membres.includes(id)), `Mission sans groupe : ${id}/${key}`);
  assert.ok(construireOrganigramme(id).includes(p.nom), `Fiche absente : ${id}`);
}
// --- LES MISSIONS : UNE SEULE SOURCE, DEUX LECTURES -------------------------
// C'est l'exigence de Noé du 20 septembre 2026 : *« si l'un change ça change sur
// l'autre page »*. Elle ne tient que parce que les deux écrans GROUPENT la même
// liste ; ce contrôle vérifie qu'aucun n'en a perdu ni inventé une ligne.
for (const m of MISSIONS_FCH) {
  assert.ok(GROUPES.some((g) => g.id === m.commission), `Commission inconnue : ${m.commission}`);
  assert.ok(m.theme && m.texte, `Mission incomplète : ${m.texte}`);
  assert.ok(m.qui.length, `Mission sans personne : ${m.texte}`);
  for (const qui of m.qui) {
    assert.ok(PERSONNES[qui], `Personne inconnue : ${qui}`);
    // LE DOCUMENT NE PEUT PAS DONNER UNE MISSION À QUELQU'UN QUI N'EST PAS DE LA
    // COMMISSION : si ça arrive, c'est l'organigramme ou la transcription qui a
    // bougé, et il faut le voir tout de suite.
    assert.ok(GROUPES.find((g) => g.id === m.commission).membres.includes(qui),
      `${qui} n'est pas membre de ${m.commission}`);
  }
}
// LA PAGE D'UNE COMMISSION ET CELLE D'UNE PERSONNE DISENT LA MÊME CHOSE : chaque
// mission se retrouve sur le récapitulatif de sa commission ET dans la fiche de
// chacun de ceux qui la portent.
//
// LES RÉCAPITULATIFS VIVENT TOUS SUR UNE PAGE DE PÔLE, sept en tout : les six
// commissions qui ont la leur — un pôle et sa commission sont la même chose
// depuis le 20 septembre — et « Organisation du club », qui rassemble la
// présidence, le secrétariat et la trésorerie. *Ce contrôle est ce qui garantit
// qu'aucune des cent trente-cinq ne tombe entre deux écrans*, et c'est lui qui
// avertira le jour où une commission naîtra sans pôle pour la porter.
const recapitulatifs = ['sportif', 'communication', 'partenaires', 'manifestations',
  'infrastructures', 'buvette', 'organisation']
  .map((id) => construireProjetClub(`pole-${id}`)).join('');
for (const m of MISSIONS_FCH) {
  assert.ok(recapitulatifs.includes(m.texte), `Mission absente du récapitulatif : ${m.texte}`);
  for (const qui of m.qui) {
    assert.ok(construireOrganigramme(qui).includes(m.texte),
      `Mission absente de la fiche de ${qui} : ${m.texte}`);
  }
}
// Rien n'est écrit deux fois dans la source : deux cartes identiques dans une
// même commission seraient une ligne recopiée par erreur.
const empreintes = MISSIONS_FCH.map((m) => `${m.commission}|${m.texte}`);
assert.equal(new Set(empreintes).size, empreintes.length, 'Deux missions identiques');

assert.ok(PERSONNES['emma-liconnet'].missions.partenaires);
assert.ok(GROUPES.find(g=>g.id==='u15').membres.includes('emma-liconnet'));
assert.ok(!PERSONNES.emma, 'Emma doit avoir une seule fiche');
// Kepo est Thibault Carteron : une seule fiche, qui porte les missions des deux.
assert.ok(!PERSONNES.kepo, 'Kepo doit être fondu dans Thibault');
assert.ok(PERSONNES.thibaut.missions.manifestations, 'Thibault garde les missions de Kepo');
assert.ok(!GROUPES.some(g=>g.membres.includes('kepo')), 'Kepo reste membre d’un groupe');
// Un portrait par personne : plus aucun cadrage dans une photo de groupe.
assert.equal(new Set(Object.values(PERSONNES).map(p=>p.photo.src)).size, Object.keys(PERSONNES).length,
  'Deux personnes partagent un portrait');
// LA MÊME EXIGENCE PAR ORGANIGRAMME : deux visages identiques dans un onglet se
// verraient côte à côte, ce qu'un fichier par personne ne dit pas tout seul.
for (const domaine of ['commissions','sportif']) {
  const srcs = Object.values(PERSONNES).map(p=>p.photos?.[domaine]?.src).filter(Boolean);
  assert.equal(new Set(srcs).size, srcs.length, `Deux personnes partagent un portrait : ${domaine}`);
}
// CE QUE L'ÉCRAN MONTRE VRAIMENT : l'onglet des commissions et celui du sportif
// tirent le portrait de LEUR organigramme, et le bureau garde le sien. Sans
// cette vérification, un paramètre oublié dans la chaîne des appels laisserait
// les trois onglets sur le même visage — c'est exactement le défaut corrigé.
for (const [domaine, id] of [['commissions','lina'], ['sportif','alyssa']]) {
  assert.ok(construireOrganigramme(domaine).includes(PERSONNES[id].photos[domaine].src),
    `L'onglet ${domaine} ne montre pas ses portraits`);
}
assert.ok(construireOrganigramme('bureau').includes(PERSONNES.lionel.photo.src),
  'Le bureau ne montre plus ses portraits');
assert.ok(construireOrganigramme('lionel').includes(PERSONNES.lionel.photo.src),
  'La fiche d’une personne ne montre plus son portrait par défaut');
console.log(`${Object.keys(PERSONNES).length} fiches, ${GROUPES.length} groupes et ${MISSIONS_FCH.length} missions vérifiés :\n  photos, cadrages, rôles, cache, et les deux lectures des missions.`);
