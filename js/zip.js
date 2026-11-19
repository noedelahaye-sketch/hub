// Un ZIP fabriqué dans le navigateur, sans compression — les JPEG et les MP4 le
// sont déjà, les recompresser coûterait du temps pour rien. Repris du kit Yuno
// (reference/zip.js, site de livraison des joueurs), en module, et nourri de
// FICHIERS déjà sur l'appareil plutôt que d'adresses à télécharger : le
// carrousel travaille sur les photos importées, il n'a rien à aller chercher.

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crcDe(crc, octets) {
  for (let i = 0; i < octets.length; i++) crc = TABLE[(crc ^ octets[i]) & 0xff] ^ (crc >>> 8);
  return crc;
}

function dateDos(d) {
  return {
    heure: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    jour: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

function enteteLocal(nom, crc, taille, dt) {
  const b = new Uint8Array(30 + nom.length);
  const v = new DataView(b.buffer);
  v.setUint32(0, 0x04034b50, true);
  v.setUint16(4, 20, true);
  v.setUint16(6, 0x0800, true); // noms en UTF-8
  v.setUint16(8, 0, true);      // sans compression
  v.setUint16(10, dt.heure, true);
  v.setUint16(12, dt.jour, true);
  v.setUint32(14, crc, true);
  v.setUint32(18, taille, true);
  v.setUint32(22, taille, true);
  v.setUint16(26, nom.length, true);
  b.set(nom, 30);
  return b;
}

function enteteCentral(nom, crc, taille, dt, position) {
  const b = new Uint8Array(46 + nom.length);
  const v = new DataView(b.buffer);
  v.setUint32(0, 0x02014b50, true);
  v.setUint16(4, 20, true);
  v.setUint16(6, 20, true);
  v.setUint16(8, 0x0800, true);
  v.setUint16(10, 0, true);
  v.setUint16(12, dt.heure, true);
  v.setUint16(14, dt.jour, true);
  v.setUint32(16, crc, true);
  v.setUint32(20, taille, true);
  v.setUint32(24, taille, true);
  v.setUint16(28, nom.length, true);
  v.setUint32(42, position, true);
  b.set(nom, 46);
  return b;
}

function fin(nombre, tailleCentrale, positionCentrale) {
  const b = new Uint8Array(22);
  const v = new DataView(b.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, nombre, true);
  v.setUint16(10, nombre, true);
  v.setUint32(12, tailleCentrale, true);
  v.setUint32(16, positionCentrale, true);
  return b;
}

/**
 * @param {{ nom: string, fichier: Blob }[]} entrees — dans l'ordre du ZIP.
 * @param {(lus: number, total: number) => void} [progression]
 * @returns {Promise<Blob>}
 */
export async function construireZip(entrees, progression) {
  const encodeur = new TextEncoder();
  const morceaux = [];
  const central = [];
  const total = entrees.reduce((s, e) => s + e.fichier.size, 0);
  const dt = dateDos(new Date());
  let lus = 0;
  let position = 0;

  for (const { nom, fichier } of entrees) {
    const lecteur = fichier.stream().getReader();
    let crc = 0xffffffff;
    for (;;) {
      const { done, value } = await lecteur.read();
      if (done) break;
      crc = crcDe(crc, value);
      lus += value.length;
      progression?.(lus, total);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const octetsNom = encodeur.encode(nom);
    const tete = enteteLocal(octetsNom, crc, fichier.size, dt);
    // Le fichier lui-même n'est pas recopié : un Blob qui en contient un autre
    // le référence, ce qui garde la mémoire tranquille sur un carrousel lourd.
    morceaux.push(tete, fichier);
    central.push(enteteCentral(octetsNom, crc, fichier.size, dt, position));
    position += tete.length + fichier.size;
  }

  const tailleCentrale = central.reduce((s, c) => s + c.length, 0);
  return new Blob([...morceaux, ...central, fin(entrees.length, tailleCentrale, position)], {
    type: 'application/zip',
  });
}

/** Fait télécharger un Blob sous ce nom. */
export function enregistrer(blob, nom) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 120000);
}
