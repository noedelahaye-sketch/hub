// node tools/essai-tri-photos.mjs — les propositions de la pile, hors écran.
import assert from 'node:assert/strict';
import { propositionsPour, personnesDuMatch, rafaleDe, estUnFile, mesurerLesGris } from '../js/tri-photos.js';
const ph = (id, s, o = {}) => ({ id, evenement_id: 'm', prise_le: new Date(1e12 + s * 1000).toISOString(),
  etiquettes: new Set(), personnes: new Set(), evenement: { titre: 'Samuel Kotto contre Pau' }, ...o });
const etiquettes = [{ id: 'duel', famille: 'recit', nom: 'Duel' }, { id: 'frappe', famille: 'recit', nom: 'Frappe' },
  { id: 'nb', famille: 'style', nom: 'Noir et blanc' }, { id: 'flou', famille: 'style', nom: 'Flou de mouvement' }];
const personnes = [{ id: 'k', nom: 'Samuel Kotto' }, { id: 'x', nom: 'Autre Joueur' }];
const dit = (p, photos) => propositionsPour(p, { photos, etiquettes, personnes }).map((s) => `${s.id}${s.arme ? '!' : '?'}`).join(' ');
let a = ph('a', 0), b = ph('b', 2, { etiquettes: new Set(['duel', 'nb']), personnes: new Set(['x']) });
assert.equal(dit(a, [a, b]), 'duel! x!');                                  // deux secondes : la rafale parle, sans le noir et blanc
let c = ph('c', 3, { etiquettes: new Set(['duel']), personnes: new Set(['x']) });
assert.equal(dit(a, [a, c]), 'x? k?');                                     // trois secondes : plus qu'une piste
assert.equal(dit(a, [a, ph('d', 1, { evenement_id: 'autre', etiquettes: new Set(['duel']) })]), 'k?'); // autre match
let e = ph('e', 1, { etiquettes: new Set(['frappe']) });
assert.equal(dit(a, [a, b, e]), 'frappe! x!');                             // la plus proche l'emporte
a = ph('a', 0, { etiquettes: new Set(['frappe']), personnes: new Set(['k']) });
assert.equal(dit(a, [a, b]), '');                                          // déjà dit : on se tait
assert.equal(dit(ph('f', 0, { flou_mouvement: true, evenement: null }), []), 'flou!');
assert.equal(dit(ph('g', 0, { prise_le: null, evenement: null }), [b]), 'x?');
assert.deepEqual(personnesDuMatch('m', 'Samuel Kotto contre Pau', [b], personnes), ['x', 'k']);
assert.equal(rafaleDe(ph('h', 0), [ph('i', 9)]).length, 0);
// Des traits horizontaux doux font un filé ; du bruit, non.
const W = 240, H = 240, raies = new Float32Array(W * H), bruit = new Float32Array(W * H);
let g = 7; const alea = () => ((g = (g * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let i = 0; i < W * H; i++) { raies[i] = 128 + 80 * Math.sin(((i / W) | 0) / 6); bruit[i] = alea() * 255; }
assert.ok(estUnFile(mesurerLesGris(raies, W, H)));
assert.ok(!estUnFile(mesurerLesGris(bruit, W, H)));
console.log('12 cas : les propositions tiennent.');
