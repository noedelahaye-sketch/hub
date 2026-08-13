#!/usr/bin/env python3
"""Rapatrie supabase-js dans le dépôt, en un paquet autonome.

Le hub n'appelle aucun CDN — c'est la règle qui vaut déjà pour les polices, et
elle vaut d'autant plus depuis que la coquille tient en cache : un fichier
distant est le seul morceau que le service worker ne peut pas garantir, et une
version « @2 » qui suit la dernière publiée peut casser l'application un matin
sans que personne n'ait rien poussé.

esm.sh sert un paquet déjà assemblé (une seule dépendance : deux polyfills
Node). On le télécharge, on suit ses imports, et on réécrit les chemins pour
qu'ils pointent les uns vers les autres dans `js/vendor/`.

    python3 tools/telecharger-supabase.py [version]

Relancer avec une nouvelle version met tout à jour ; le numéro figure dans
`js/vendor/VERSION` et dans l'en-tête de chaque fichier.
"""

import re
import sys
import urllib.request
from pathlib import Path

VERSION = sys.argv[1] if len(sys.argv) > 1 else "2.112.3"
RACINE = Path(__file__).resolve().parent.parent
DESTINATION = RACINE / "js" / "vendor"

DEPART = f"https://esm.sh/@supabase/supabase-js@{VERSION}/es2022/supabase-js.bundle.mjs"

# Les chemins d'esm.sh (« /node/buffer.mjs ») deviennent des noms plats :
# le dossier est déjà le paquet, une arborescence n'apporterait rien. Le point
# d'entrée garde un nom lisible — c'est le seul que le reste du code écrit.
#
# Extension `.js` et non `.mjs`, en connaissance de cause : tous les serveurs ne
# connaissent pas `.mjs`, et celui qui l'ignore répond « application/octet-stream »,
# ce qu'un navigateur REFUSE de charger comme module. Rencontré tout de suite
# avec `tools/static-server.js`. Ici l'extension ne décide de rien — c'est la
# balise `type="module"` qui compte.
def nom_local(url: str) -> str:
    if url == DEPART:
        return "supabase-js.js"
    nom = re.sub(r"[^a-zA-Z0-9.]+", "-", url.split("esm.sh/")[-1]).strip("-")
    return nom.removesuffix(".mjs") + ".js"


def telecharger(url: str) -> str:
    with urllib.request.urlopen(url) as reponse:
        return reponse.read().decode("utf-8")


def main() -> None:
    DESTINATION.mkdir(parents=True, exist_ok=True)
    a_faire = [DEPART]
    faits: dict[str, str] = {}

    while a_faire:
        url = a_faire.pop()
        if url in faits:
            continue
        source = telecharger(url)
        faits[url] = source
        # `from "/node/events.mjs"` — tout ce qui commence par « / » est un
        # autre fichier d'esm.sh, à rapatrier lui aussi.
        for chemin in re.findall(r'from\s*"(/[^"]+)"', source):
            a_faire.append("https://esm.sh" + chemin)

    for url, source in faits.items():
        for chemin in set(re.findall(r'from\s*"(/[^"]+)"', source)):
            source = source.replace(f'"{chemin}"', f'"./{nom_local(chemin)}"')
        cible = DESTINATION / nom_local(url)
        cible.write_text(source, encoding="utf-8")
        print(f"{cible.relative_to(RACINE)} — {len(source)} octets")

    (DESTINATION / "VERSION").write_text(f"{VERSION}\n", encoding="utf-8")
    print(f"\nsupabase-js {VERSION} — {len(faits)} fichiers dans js/vendor/")
    print(f"Point d'entrée : js/vendor/{nom_local(DEPART)}")


if __name__ == "__main__":
    main()
