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
  assert.ok(x>=0 && y>=0 && w>0 && h>0 && x+w<=p.photo.largeur && y+h<=p.photo.hauteur, `Cadrage hors image : ${id}`);
  assert.ok(GROUPES.some(g=>g.membres.includes(id)), `Personne sans groupe : ${id}`);
  for(const key of Object.keys(p.missions)) assert.ok(GROUPES.some(g=>g.id===key&&g.membres.includes(id)), `Mission sans groupe : ${id}/${key}`);
  assert.ok(construireOrganigramme(id).includes(p.nom), `Fiche absente : ${id}`);
}
assert.ok(PERSONNES['emma-liconnet'].missions.partenaires);
assert.ok(GROUPES.find(g=>g.id==='u15').membres.includes('emma-liconnet'));
assert.ok(!PERSONNES.emma, 'Emma doit avoir une seule fiche');
console.log(`${Object.keys(PERSONNES).length} fiches et ${GROUPES.length} groupes vérifiés : photos, cadrages, rôles et cache.`);
