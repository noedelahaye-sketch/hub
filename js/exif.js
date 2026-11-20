// La date de prise de vue d'une photo, lue dans son fichier (EXIF).
//
// Une lecture à la main, sans bibliothèque : seuls trois champs nous servent,
// et ils sont toujours au même endroit — le bloc APP1 d'un JPEG, son répertoire
// principal, puis le sous-répertoire EXIF. On lit les 256 premiers ko, où il vit
// toujours. Partagée par la photothèque et le carrousel (qui peut ranger ce
// qu'il importe dans la photothèque).

export async function lireDatePrise(fichier) {
  try {
    const v = new DataView(await fichier.slice(0, 256 * 1024).arrayBuffer());
    if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return null;
    let o = 2;
    while (o + 10 < v.byteLength) {
      const marqueur = v.getUint16(o);
      if ((marqueur & 0xff00) !== 0xff00) break;
      const longueur = v.getUint16(o + 2);
      if (marqueur === 0xffe1 && v.getUint32(o + 4) === 0x45786966) return lireTiff(v, o + 10);
      if (marqueur === 0xffda) break;
      o += 2 + longueur;
    }
  } catch {
    // Un fichier qu'on ne sait pas lire n'a simplement pas de date.
  }
  return null;
}

function lireTiff(v, t) {
  const petit = v.getUint16(t) === 0x4949;
  const u16 = (p) => v.getUint16(p, petit);
  const u32 = (p) => v.getUint32(p, petit);
  const entree = (ifd, tag) => {
    if (ifd + 2 > v.byteLength) return null;
    const n = u16(ifd);
    for (let i = 0; i < n; i++) {
      const e = ifd + 2 + i * 12;
      if (e + 12 > v.byteLength) return null;
      if (u16(e) === tag) return e;
    }
    return null;
  };
  const texte = (e) => {
    if (e == null) return null;
    const n = u32(e + 4);
    const debut = n > 4 ? t + u32(e + 8) : e + 8;
    let s = '';
    for (let i = 0; i < n - 1 && debut + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(debut + i));
    return s;
  };
  const ifd0 = t + u32(t + 4);
  const pointeur = entree(ifd0, 0x8769);
  const exif = pointeur != null ? t + u32(pointeur + 8) : null;
  const brut = (exif != null && (texte(entree(exif, 0x9003)) || texte(entree(exif, 0x9004))))
    || texte(entree(ifd0, 0x0132));
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(brut ?? '');
  if (!m || m[1] === '0000') return null;
  // L'heure EXIF est celle de l'appareil, sans fuseau : on la lit comme une
  // heure locale, ce qu'elle était au bord du terrain.
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
