// CE QUE LE HUB PROPOSE POUR UNE PHOTO (25 novembre 2026, demande de Noé : « tri
// automatique… et fais les propositions dans la pile »).
//
// Ce module ne touche ni au réseau, ni au DOM (sauf la toile qui mesure une
// image) : les règles s'éprouvent seules, par tools/essai-tri-photos.mjs.
//
// IL PROPOSE, NOÉ ACCEPTE. Deux degrés :
//   — SÛRE (`arme`) : acceptée en glissant « Trié », sauf si on la touche ;
//   — PISTE : offerte, posée seulement si on la touche.

// --- Le flou de mouvement ------------------------------------------------------------------
//
// Un filé laisse des traits DANS UNE MÊME DIRECTION, sur toute l'image, et peu
// de netteté. Trois mesures par carreaux de 24 px :
//   — `coherence` : dans chaque carreau, les traits vont-ils dans un seul sens ?
//   — `accord`    : ce sens est-il le même d'un carreau à l'autre ?
//   — `nettete`   : les carreaux les plus nets le sont-ils vraiment ?
// Mesuré sur les 216 photos étiquetées : 4 des 5 flous reconnus, aucune fausse
// alerte. Le cinquième n'a pas de direction — un zoom, un tremblé —, et cette
// mesure ne sait pas le voir.
const CARREAU = 24;

export function mesurerLeFlou(source, largeur, hauteur) {
  const k = Math.min(1, 480 / Math.max(largeur, hauteur));
  const w = Math.max(1, Math.round(largeur * k));
  const h = Math.max(1, Math.round(hauteur * k));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const gris = new Float32Array(w * h);
  for (let i = 0; i < gris.length; i++) gris[i] = 0.299 * data[4 * i] + 0.587 * data[4 * i + 1] + 0.114 * data[4 * i + 2];
  return mesurerLesGris(gris, w, h);
}

export function mesurerLesGris(g, w, h) {
  let moyenne = 0;
  for (const v of g) moyenne += v;
  moyenne /= g.length;
  let variance = 0;
  for (const v of g) variance += (v - moyenne) ** 2;
  const contraste = Math.sqrt(variance / g.length);

  const carreaux = [];
  for (let by = 1; by + CARREAU < h - 1; by += CARREAU) {
    for (let bx = 1; bx + CARREAU < w - 1; bx += CARREAU) {
      let a = 0, b = 0, q = 0;
      for (let y = by; y < by + CARREAU; y++) {
        for (let x = bx; x < bx + CARREAU; x++) {
          const i = y * w + x;
          const gx = (g[i + 1] - g[i - 1]) / 2;
          const gy = (g[i + w] - g[i - w]) / 2;
          a += gx * gx;
          b += gy * gy;
          q += gx * gy;
        }
      }
      carreaux.push({
        energie: Math.sqrt((a + b) / (CARREAU * CARREAU)),
        coherence: Math.hypot(a - b, 2 * q) / (a + b + 1e-6),
        angle: 0.5 * Math.atan2(2 * q, a - b),
      });
    }
  }
  if (!carreaux.length) return { coherence: 0, accord: 0, nettete: 1 };
  const utiles = carreaux.filter((x) => x.energie > 2);
  let cx = 0, cy = 0;
  for (const x of utiles) {
    cx += x.coherence * Math.cos(2 * x.angle);
    cy += x.coherence * Math.sin(2 * x.angle);
  }
  const coherences = utiles.map((x) => x.coherence).sort((p, q) => p - q);
  const energies = carreaux.map((x) => x.energie).sort((p, q) => p - q);
  return {
    coherence: coherences[coherences.length >> 1] ?? 0,
    accord: utiles.length ? Math.hypot(cx, cy) / utiles.length : 0,
    nettete: energies[Math.floor(energies.length * 0.95)] / (contraste + 1),
  };
}

export const estUnFile = ({ coherence, accord, nettete }) =>
  coherence >= 0.5 && accord >= 0.39 && nettete <= 0.55;

// --- Les propositions ------------------------------------------------------------------------
//
// LA RAFALE : deux secondes d'écart au plus, dans le même match. Mesuré sur les
// paires déjà triées : même personne 125 fois sur 129, récit commun 26 sur 29.
// À cinq secondes, le récit tombe à une fois sur quatre : on ne va pas plus loin.
const ECART_RAFALE_MS = 2000;
const PISTES_MONTREES = 3;

const normal = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Les photos de la même rafale, la plus proche d'abord. */
export function rafaleDe(p, photos) {
  const t = Date.parse(p.prise_le ?? '');
  if (Number.isNaN(t)) return [];
  return photos
    .filter((q) => q !== p && (q.evenement_id ?? null) === (p.evenement_id ?? null))
    .map((q) => ({ q, d: Math.abs(Date.parse(q.prise_le ?? '') - t) }))
    .filter(({ d }) => d <= ECART_RAFALE_MS)
    .sort((a, b) => a.d - b.d)
    .map(({ q }) => q);
}

/**
 * Les personnes qu'on peut attendre sur un lot : celles déjà reconnues dans ce
 * match, les plus vues d'abord, puis celle que nomme son titre.
 * UNE PISTE, jamais une certitude : dans un match consacré à un joueur, il n'est
 * que sur la moitié des photos.
 */
export function personnesDuMatch(evenementId, titre, photos, personnes) {
  const vues = new Map();
  if (evenementId) {
    for (const q of photos) {
      if (q.evenement_id !== evenementId) continue;
      for (const id of q.personnes ?? []) vues.set(id, (vues.get(id) ?? 0) + 1);
    }
  }
  const nommees = personnes.filter((c) => c.nom && normal(titre).includes(normal(c.nom))).map((c) => c.id);
  return [...new Set([...[...vues].sort((a, b) => b[1] - a[1]).map(([id]) => id), ...nommees])]
    .filter((id) => personnes.some((c) => c.id === id))
    .slice(0, PISTES_MONTREES);
}

/**
 * @returns {{ quoi: 'etiquettes'|'personnes', id: string, nom: string, arme: boolean, pourquoi: string }[]}
 */
export function propositionsPour(p, { photos, etiquettes, personnes }) {
  const sorties = [];
  const ajouter = (quoi, id, nom, arme, pourquoi) => {
    if (!nom || p[quoi].has(id) || sorties.some((s) => s.quoi === quoi && s.id === id)) return;
    sorties.push({ quoi, id, nom, arme, pourquoi });
  };
  const parId = new Map(etiquettes.map((e) => [e.id, e]));
  const nomDe = (id) => personnes.find((c) => c.id === id)?.nom;
  const deFamille = (q, famille) => [...q.etiquettes].filter((id) => parId.get(id)?.famille === famille);
  const flou = etiquettes.find((e) => e.famille === 'style' && normal(e.nom) === 'flou de mouvement');

  // CE QU'ON A DÉJÀ DIT NE SE REDIT PAS : une photo qui a son récit n'en reçoit
  // pas un second, et pareil pour qui est dessus.
  const rafale = rafaleDe(p, photos);
  if (!deFamille(p, 'recit').length) {
    const source = rafale.find((q) => deFamille(q, 'recit').length);
    for (const id of source ? deFamille(source, 'recit') : []) ajouter('etiquettes', id, parId.get(id).nom, true, 'rafale');
  }
  if (!p.personnes.size) {
    const source = rafale.find((q) => q.personnes.size);
    for (const id of source?.personnes ?? []) ajouter('personnes', id, nomDe(id), true, 'rafale');
  }
  if (p.flou_mouvement && flou) ajouter('etiquettes', flou.id, flou.nom, true, 'image');
  if (!p.personnes.size && !sorties.some((s) => s.quoi === 'personnes')) {
    for (const id of personnesDuMatch(p.evenement_id, p.evenement?.titre, photos, personnes)) {
      ajouter('personnes', id, nomDe(id), false, 'match');
    }
  }
  return sorties;
}
