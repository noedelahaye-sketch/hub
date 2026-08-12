#!/usr/bin/env python3
"""Convertit une police TTF/OTF en WOFF2, dans fonts/.

Le site sert ses polices lui-même : chaque kilo-octet est un kilo-octet que le
téléphone de Noé télécharge avant de pouvoir lire quoi que ce soit. Le WOFF2
compresse les mêmes contours de 50 à 65 % sans rien perdre — c'est le même
dessin, dans un emballage plus serré.

    pip install fonttools brotli
    python3 tools/convertir-polices.py fonts/Gilroy-Regular.ttf

Sans argument, il reprend tous les .ttf et .otf de fonts/ qui n'ont pas encore
leur .woff2 à côté. Le fichier d'origine est conservé : c'est lui la source, on
ne le régénère pas depuis le WOFF2.
"""

import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "fonts"

try:
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit(
        "fontTools est absent. Installe-le d'abord :\n"
        "    python3 -m pip install fonttools brotli"
    )


def convertir(source: Path) -> None:
    cible = source.with_suffix(".woff2")
    police = TTFont(source)
    police.flavor = "woff2"
    police.save(cible)

    avant, apres = source.stat().st_size, cible.stat().st_size
    gain = 100 - apres * 100 // avant
    print(f"{source.name} → {cible.name}  {avant // 1024} Ko → {apres // 1024} Ko  (−{gain} %)")


def main() -> None:
    if len(sys.argv) > 1:
        sources = [Path(chemin) for chemin in sys.argv[1:]]
    else:
        sources = [
            fichier
            for motif in ("*.ttf", "*.otf")
            for fichier in sorted(DOSSIER.glob(motif))
            if not fichier.with_suffix(".woff2").exists()
        ]

    if not sources:
        print("Rien à convertir : chaque police a déjà son WOFF2.")
        return

    for source in sources:
        convertir(source)


if __name__ == "__main__":
    main()
