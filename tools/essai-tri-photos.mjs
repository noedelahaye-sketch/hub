// node tools/essai-tri-photos.mjs — les propositions de la pile, hors écran.
import assert from 'node:assert/strict';
import { depuisLesTribunes, partDeVertDesPixels, propositionsPour, personnesDuMatch, rafaleDe, estUnFile, mesurerLesGris, rafalesDe, empiler, priseEnClair, regleDe, filtresDe, memeRegle, dansLaPeriode } from '../js/tri-photos.js';
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
// Les piles : 0, 2, 4 s se chaînent ; 9 s est seule ; un autre match ne s'y mêle pas.
const suite = [ph('p0', 0), ph('p2', 2, { note: 4 }), ph('p4', 4), ph('p9', 9), ph('q4', 4, { evenement_id: 'z' })];
assert.equal(rafalesDe(suite).get('p4').length, 3);
assert.ok(!rafalesDe(suite).has('p9') && !rafalesDe(suite).has('q4'));
assert.deepEqual(empiler(suite, new Set()).map((x) => x.p.id), ['p2', 'p9', 'q4']);       // repliée : la mieux notée
assert.equal(empiler(suite, new Set(['p0'])).length, 5);                                   // ouverte : tout revient
assert.deepEqual(empiler([...suite].reverse(), new Set()).map((x) => x.p.id), ['q4', 'p9', 'p2']);
assert.deepEqual(priseEnClair({ vitesse: 0.001, ouverture: 2.8, iso: 5000, focale: 28, appareil: 'ILCE-7M3' }), ['1/1000 s · f/2,8 · ISO 5000 · 28 mm', 'ILCE-7M3']);
assert.deepEqual(priseEnClair(null), []);
const r0 = { etiquettes: ['b', 'a'], note: 4, jamais: true };
assert.deepEqual(regleDe(filtresDe(r0)), { etiquettes: ['a', 'b'], note: 4, jamais: true });
assert.ok(memeRegle(r0, { jamais: true, note: 4, etiquettes: ['a', 'b'] }) && !memeRegle(r0, { note: 4 }));
assert.deepEqual(regleDe(filtresDe(r0, (f, id) => id !== 'a')), { etiquettes: ['b'], note: 4, jamais: true });
const le25 = new Date(2026, 10, 25);
assert.ok(dansLaPeriode(new Date(2026, 10, 1, 9).toISOString(), 'mois', le25));
assert.ok(!dansLaPeriode(new Date(2026, 9, 31).toISOString(), 'mois', le25) && dansLaPeriode(new Date(2026, 9, 31).toISOString(), 'j30', le25));
assert.ok(!dansLaPeriode(null, 'an', le25) && dansLaPeriode(null, null, le25));
console.log('25 cas : les propositions tiennent.');

// Depuis les tribunes : verte, et une voisine verte parmi les deux d'avant et d'après.
const v = (id, s, vert, o = {}) => ph(id, s, { vert, ...o });
const serie = [v('t0', 0, 0.9), v('t1', 60, 0.1), v('t2', 120, 0.2), v('t3', 180, 0.8), v('t4', 240, 0.1), v('t5', 300, 0.1), v('t6', 360, 0.1), v('t7', 420, 0.7)];
assert.ok(depuisLesTribunes(serie[0], serie) === false);                    // t1, t2 pas vertes : seule
assert.ok(!depuisLesTribunes(serie[7], serie));                             // t5, t6 pas vertes
assert.ok(depuisLesTribunes(serie[3], [...serie, v('t3b', 200, 0.6)]));      // une voisine verte suffit
assert.ok(!depuisLesTribunes(serie[3], [...serie, v('x', 200, 0.9, { evenement_id: 'autre' })])); // pas du même match
const tri = [...etiquettes, { id: 'trib', famille: 'style', nom: 'Depuis tribunes' }];
const u = v('u', 0, 0.9), w2 = v('w', 30, 0.8);
assert.ok(!propositionsPour(u, { photos: [u, w2], etiquettes: tri, personnes }).some((s) => s.id === 'trib')); // posée d'office, plus proposée
assert.equal(partDeVertDesPixels(new Uint8ClampedArray([20, 120, 30, 255, 120, 120, 120, 255])), 0.5);
console.log('Tribunes : la règle tient.');
