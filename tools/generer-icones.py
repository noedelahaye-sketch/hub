#!/usr/bin/env python3
"""Fabrique les icônes d'application à partir des logos.

    python3 tools/generer-icones.py

Trois applications, trois icônes : le hub, Yuno, le FC Hermitage. Chacune en
180 px (apple-touch-icon) et 512 px (manifeste).

Deux règles qui expliquent le code :

- **Pas de transparence dans une icône.** iOS pose les icônes transparentes sur
  du noir : le logo du FCH y perdrait ses traits. On compose donc chaque logo
  sur son fond de marque, opaque.
- **Le dessin doit remplir l'icône.** Les fichiers sources gardent de larges
  marges vides ; on recadre sur le dessin avant de réduire, sinon le logo
  flotte au milieu d'un carré de couleur.

Aucune dépendance : PNG lu et écrit à la main (Pillow n'est pas installé), et
`sips` — livré avec macOS — pour convertir le JPEG de Yuno en PNG.
"""

import pathlib
import struct
import subprocess
import sys
import tempfile
import zlib

RACINE = pathlib.Path(__file__).resolve().parent.parent
IMG = RACINE / 'img'
TAILLES = (180, 512)


# --- Lecture et écriture PNG -------------------------------------------------

def lire_png(chemin):
    """Renvoie (largeur, hauteur, pixels RGBA) — sans interlaçage."""
    donnees = chemin.read_bytes()
    position, idat = 8, b''
    largeur = hauteur = couleur = 0

    while position < len(donnees):
        taille = struct.unpack('>I', donnees[position:position + 4])[0]
        type_ = donnees[position + 4:position + 8]
        if type_ == b'IHDR':
            largeur, hauteur, profondeur, couleur, _, _, entrelace = struct.unpack(
                '>IIBBBBB', donnees[position + 8:position + 8 + 13]
            )
            if profondeur != 8 or entrelace:
                raise SystemExit(f'{chemin.name} : PNG 8 bits non entrelacé attendu')
            if couleur not in (2, 6):
                raise SystemExit(f'{chemin.name} : RVB ou RVBA attendu')
        elif type_ == b'IDAT':
            idat += donnees[position + 8:position + 8 + taille]
        position += taille + 12

    octets = 4 if couleur == 6 else 3
    brut = zlib.decompress(idat)
    ligne = largeur * octets
    pixels = bytearray()
    precedente = bytearray(ligne)
    position = 0

    for _ in range(hauteur):
        filtre = brut[position]
        position += 1
        courante = bytearray(brut[position:position + ligne])
        position += ligne

        if filtre == 1:
            for i in range(octets, ligne):
                courante[i] = (courante[i] + courante[i - octets]) & 255
        elif filtre == 2:
            for i in range(ligne):
                courante[i] = (courante[i] + precedente[i]) & 255
        elif filtre == 3:
            for i in range(ligne):
                gauche = courante[i - octets] if i >= octets else 0
                courante[i] = (courante[i] + ((gauche + precedente[i]) >> 1)) & 255
        elif filtre == 4:
            for i in range(ligne):
                a = courante[i - octets] if i >= octets else 0
                b = precedente[i]
                c = precedente[i - octets] if i >= octets else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                predit = a if pa <= pb and pa <= pc else b if pb <= pc else c
                courante[i] = (courante[i] + predit) & 255

        pixels += courante
        precedente = courante

    if octets == 3:  # on normalise en RVBA, opaque
        avec_alpha = bytearray()
        for i in range(0, len(pixels), 3):
            avec_alpha += pixels[i:i + 3] + b'\xff'
        pixels = avec_alpha

    return largeur, hauteur, pixels


def ecrire_png(chemin, largeur, hauteur, pixels_rvb):
    brut = b''.join(
        b'\x00' + bytes(pixels_rvb[y * largeur * 3:(y + 1) * largeur * 3])
        for y in range(hauteur)
    )

    def morceau(type_, donnees):
        return (
            struct.pack('>I', len(donnees))
            + type_
            + donnees
            + struct.pack('>I', zlib.crc32(type_ + donnees) & 0xFFFFFFFF)
        )

    entete = struct.pack('>IIBBBBB', largeur, hauteur, 8, 2, 0, 0, 0)
    chemin.write_bytes(
        b'\x89PNG\r\n\x1a\n'
        + morceau(b'IHDR', entete)
        + morceau(b'IDAT', zlib.compress(brut, 9))
        + morceau(b'IEND', b'')
    )


# --- Fabrication -------------------------------------------------------------

def cadre_du_dessin(largeur, hauteur, pixels, fond_clair):
    """Les bornes de ce qui n'est ni transparent ni de la couleur de fond."""
    xmin, xmax, ymin, ymax = largeur, 0, hauteur, 0
    for y in range(0, hauteur, 2):
        base = y * largeur * 4
        for x in range(0, largeur, 2):
            i = base + x * 4
            r, v, b, a = pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]
            if a < 32:
                continue
            if fond_clair and r > 235 and v > 235 and b > 235:
                continue
            xmin, xmax = min(xmin, x), max(xmax, x)
            ymin, ymax = min(ymin, y), max(ymax, y)
    return (0, largeur - 1, 0, hauteur - 1) if xmin > xmax else (xmin, xmax, ymin, ymax)


def fabriquer(source, sortie, fond, marge=0.10, fond_clair=False):
    """Recadre sur le dessin, compose sur `fond`, réduit, écrit les icônes."""
    largeur, hauteur, pixels = lire_png(source)
    xmin, xmax, ymin, ymax = cadre_du_dessin(largeur, hauteur, pixels, fond_clair)

    # Un carré autour du dessin, plus une marge — une icône a besoin de respirer.
    cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
    cote = max(xmax - xmin, ymax - ymin) * (1 + 2 * marge)
    gauche, haut = cx - cote / 2, cy - cote / 2

    for taille in TAILLES:
        final = bytearray(taille * taille * 3)
        for y in range(taille):
            for x in range(taille):
                # Moyenne d'un bloc source par pixel de sortie : réduire en
                # prenant un pixel sur n crénellerait les traits fins du logo.
                x0 = int(gauche + cote * x / taille)
                x1 = max(x0 + 1, int(gauche + cote * (x + 1) / taille))
                y0 = int(haut + cote * y / taille)
                y1 = max(y0 + 1, int(haut + cote * (y + 1) / taille))

                somme = [0, 0, 0]
                compte = 0
                for sy in range(y0, y1):
                    if not 0 <= sy < hauteur:
                        continue
                    for sx in range(x0, x1):
                        if not 0 <= sx < largeur:
                            continue
                        i = (sy * largeur + sx) * 4
                        a = pixels[i + 3] / 255
                        for canal in range(3):
                            # Composition sur le fond, canal par canal.
                            somme[canal] += pixels[i + canal] * a + fond[canal] * (1 - a)
                        compte += 1

                j = (y * taille + x) * 3
                for canal in range(3):
                    final[j + canal] = (
                        int(somme[canal] / compte) if compte else fond[canal]
                    )

        chemin = IMG / f'{sortie}-{taille}.png'
        ecrire_png(chemin, taille, taille, final)
        print(f'  {chemin.relative_to(RACINE)}')


def en_png(source):
    """Convertit si besoin (le logo Yuno est un JPEG) via sips, livré par macOS."""
    if source.suffix.lower() == '.png':
        return source, None
    temporaire = pathlib.Path(tempfile.mkdtemp()) / 'source.png'
    subprocess.run(
        ['sips', '-s', 'format', 'png', str(source), '--out', str(temporaire)],
        check=True, capture_output=True,
    )
    return temporaire, temporaire.parent


if __name__ == '__main__':
    print('Yuno — le logotype sur son fond sombre :')
    source, _ = en_png(IMG / 'yuno-logo.jpg')
    fabriquer(source, 'icone-yuno', fond=(0x18, 0x18, 0x18), marge=0.12)

    print('FC Hermitage — le logo composé sur le bleu du club :')
    fabriquer(IMG / 'fch-logo.png', 'icone-fch', fond=(0x11, 0x36, 0x93), marge=0.08)

    print('Fait.', file=sys.stderr)
