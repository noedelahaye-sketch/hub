// Vérifie la cohérence des sources de l’organigramme sans connexion ni écriture en base.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { PERSONNES, GROUPES } from '../js/organigramme-fch-data.js';
import { construireOrganigramme } from '../js/organigramme-fch.js';
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
  assert.ok(GROUPES.some(g=>g.membres.includes(id)), `Personne sans groupe : ${id}`);
  for(const key of Object.keys(p.missions)) assert.ok(GROUPES.some(g=>g.id===key&&g.membres.includes(id)), `Mission sans groupe : ${id}/${key}`);
  assert.ok(construireOrganigramme(id).includes(p.nom), `Fiche absente : ${id}`);
}
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
console.log(`${Object.keys(PERSONNES).length} fiches et ${GROUPES.length} groupes vérifiés : photos, cadrages, rôles et cache.`);
