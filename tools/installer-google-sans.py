#!/usr/bin/env python3
"""Rapatrie Google Sans dans `fonts/`, en woff2 sous-réglé.

Comme `telecharger-supabase.py` et `generer-icones.py` : un outil rejouable,
pour que personne n'ait à refaire ces réglages à la main le jour où la police
sera mise à jour.

Google Sans est publiée par Google sous SIL Open Font License (le dossier de
téléchargement porte son `OFL.txt`) : elle vit donc dans le dépôt comme les
trois autres, et le hub n'appelle aucun CDN.

CE QUE L'OUTIL FAIT, et pourquoi chaque étape compte :

  — il FIGE deux axes sur trois. Le fichier d'origine varie en `opsz` (taille
    optique), `GRAD` (graisse optique) et `wght`. Seule la graisse nous sert ;
    garder les deux autres, c'est payer trois dimensions de données de
    variation pour n'en piloter qu'une.
  — il SOUS-RÈGLE au latin. La police couvre 3 281 caractères (grec, cyrillique,
    vietnamien) ; le hub écrit en français. On passe de 7 525 glyphes à 1 073.
  — il COMPLÈTE `gvar` avant de sous-régler : un glyphe sans variation n'y a pas
    d'entrée, et le sous-régleur de fontTools les lit toutes sans vérifier
    (il s'arrête sur `KeyError: 'uni2009'`). Deux lignes, sinon rien ne sort.

Mesuré : 4,8 Mo de TTF donnent 57 Ko de woff2.

    python3 tools/installer-google-sans.py ~/Downloads/Google_Sans
    python3 tools/installer-google-sans.py ~/Downloads/Google_Sans --italique
"""

import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# Latin, latin étendu, ponctuation, devises, flèches et formes géométriques —
# ces dernières pour les signes du calendrier (○ ◐ ◉ ▲ ▸ ↗), qui retombent
# aujourd'hui sur une police de secours choisie par le navigateur.
LATIN = (
    "U+0000-00FF,U+0100-02AF,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,"
    "U+0131,U+0152-0153,U+1E00-1E9F,U+1EF2-1EFF,U+2000-206F,U+2074,U+20A0-20C0,"
    "U+2113,U+2122,U+2190-2199,U+2212,U+2215,U+25A0-25FF,U+2713-2714,U+FEFF,U+FFFD"
)

# LE ROMAN SEUL PAR DÉFAUT. L'italique a été rapatriée le 31 août 2026 pour les
# publications du calendrier, puis retirée le soir même quand elles ont cessé de
# pencher : 60 Ko mis en cache pour rien sur chaque appareil. `--italique` la
# refait le jour où quelque chose la redemande.
FICHIERS = [("roman", "GoogleSans-VariableFont_GRAD,opsz,wght.ttf")]
ITALIQUE = ("italique", "GoogleSans-Italic-VariableFont_GRAD,opsz,wght.ttf")

SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fonts")


def convertir(source, nom, fichier):
    police = TTFont(os.path.join(source, fichier), lazy=False)
    police = instancer.instantiateVariableFont(police, {"opsz": 18, "GRAD": 0}, inplace=True)

    if "gvar" in police:
        variations = police["gvar"].variations
        for glyphe in police.getGlyphOrder():
            if glyphe not in variations:
                variations[glyphe] = []

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True

    sous_regleur = subset.Subsetter(options=options)
    sous_regleur.populate(unicodes=subset.parse_unicodes(LATIN))
    sous_regleur.subset(police)

    chemin = os.path.join(SORTIE, f"GoogleSans-{nom}.woff2")
    police.flavor = "woff2"
    police.save(chemin)
    return chemin, os.path.getsize(chemin)


def main():
    arguments = [a for a in sys.argv[1:] if not a.startswith("--")]
    source = arguments[0] if arguments else os.path.expanduser("~/Downloads/Google_Sans")
    if not os.path.isdir(source):
        sys.exit(f"Dossier introuvable : {source}")

    fichiers = FICHIERS + ([ITALIQUE] if "--italique" in sys.argv else [])
    for nom, fichier in fichiers:
        chemin, taille = convertir(source, nom, fichier)
        print(f"{os.path.basename(chemin)} — {taille // 1024} Ko")


if __name__ == "__main__":
    main()
