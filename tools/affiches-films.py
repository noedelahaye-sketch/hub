#!/usr/bin/env python3
"""Résout l'affiche de chaque film de la bibliothèque, depuis Wikipédia.

    python3 tools/affiches-films.py > /tmp/affiches.json

Il ne TÉLÉVERSE rien : il rend un JSON `[{id, titre, url}, ...]`. Le
téléversement se fait depuis le hub CONNECTÉ (voir « Le second temps » plus
bas), parce que le bucket `affiches` est privé et que RLS ne l'ouvre qu'au rôle
`authenticated` : un outil de terminal aurait eu besoin d'un secret, et le
dépôt n'en porte aucun.

POURQUOI WIKIPÉDIA, ET NON TMDB. TMDB est la meilleure source pour des films
français, mais son API exige une clé — donc un secret à garder hors du dépôt,
et une inscription. Wikipédia répond sans clé, comme ESPN pour les écussons des
clubs (tools/telecharger-logos.py). L'affiche est hébergée sur en.wikipedia au
titre du fair use ; elle finit dans un bucket PRIVÉ, pour cataloguer une
collection personnelle — jamais republiée.

LE CHEMIN EST DÉTERMINISTE, ET C'EST TOUT L'OBJET DE LA TABLE CI-DESSOUS :

    page fr.wikipedia (NOMMÉE ici) -> lien de langue -> en.wikipedia
    -> le paramètre `image` de son infobox -> vignette 500 px

**La table est ÉCRITE, pas devinée.** Un premier essai cherchait la page par
« titre + réalisateur » : il a donné *The Odyssey* pour Oppenheimer, *Guru* pour
Boîte noire et *Vive la France* pour Fatal. Un rapprochement rejoué à chaque
exécution peut changer une affiche dans le dos de Noé — c'est la leçon déjà
écrite pour les écussons, et elle s'est vérifiée du premier coup.

**L'image vient du WIKITEXTE de l'infobox**, jamais d'un filtre sur le nom du
fichier : « poster » n'apparaît pas dans tous les noms, et la page d'Oppenheimer
porte des photos de Nolan et d'un cinéma qu'un filtre aurait pu retenir.

500 px de large : la tuile de l'étagère fait 6,5 rem (~104 px) et la vedette du
livre en cours guère plus ; 500 couvre les écrans à forte densité sans peser.

LE SECOND TEMPS, dans le hub connecté — la console du navigateur :

    const { RAYONS } = await import('/js/bibliotheque.js');
    for (const f of LISTE) {
      const blob = await (await fetch(f.url)).blob();
      const chemin = await RAYONS.films.api.televerserImage(
        new File([blob], 'affiche.jpg', { type: blob.type }));
      await RAYONS.films.api.modifier(f.id, { affiche: chemin });
    }

`televerserImage` réduit et range dans le bucket `affiches` ; `modifier` écrit
`films.affiche`. Ce sont les fonctions du hub, pas des copies : un second chemin
d'écriture finirait par ne plus réduire de la même façon.

UN FILM QUI N'A PAS DE PAGE ANGLAISE N'A PAS D'AFFICHE ICI, et c'est écrit dans
la sortie (`souci`). L'étagère lui garde sa place en tuile pointillée — c'est
déjà sa règle —, et son affiche se pose à la main par le formulaire.
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request

# Wikimedia demande un User-Agent qui identifie l'appelant. UNE ADRESSE DE DÉPÔT
# ET NON UN E-MAIL : ce fichier vit dans un dépôt public, et y écrire l'adresse
# de Noé la donnerait aux moissonneurs. Wikimedia accepte une URL de contact.
UA = {'User-Agent': 'hub-noe/1.0 (+https://github.com/noedelahaye-sketch/hub)'}
LARGEUR = 500

# (identifiant du film dans la base, titre au hub, page fr.wikipedia)
#
# Le titre du hub est en commentaire de contrôle : il permet de relire la table
# sans ouvrir la base. Si un titre change au hub, cette table ne bouge pas —
# c'est l'identifiant qui fait foi.
FILMS = [
    ('b97cd2c3-894c-4515-93d9-38a17279766e', '13 jours, 13 nuits', '13 jours, 13 nuits'),
    ('b32ed446-7808-4adf-a840-880321f135ea', "À l'abordage", "À l'abordage (film, 2020)"),
    ('42c98a39-f477-4475-92c7-70e59cce5d0e', "Anatomie d'une chute", "Anatomie d'une chute"),
    ('77a07e30-0e8c-4146-9ebc-6b6301fbc3ea', 'Boîte noire', 'Boîte noire (film, 2021)'),
    ('12b8b597-5390-4ddf-81e8-5f12a5a59ea9', 'Ce qui nous lie', 'Ce qui nous lie'),
    ('a0f84c45-a96a-4545-8ce6-2a3af8ce98a2', 'Challengers', 'Challengers (film)'),
    ('e8532c30-2787-4be0-b68e-cbc6708df75c', 'Deux moi', 'Deux Moi'),
    ('ad548a68-cec5-4d39-97a7-6500ca5225ab', 'Emilia Perez', 'Emilia Pérez'),
    ('c68de6a3-0374-41bd-bdce-1a6e8316d0a7', 'Fatal', 'Fatal (film)'),
    ('3a82c4da-7500-4d98-b425-1da3f9161528', 'Golo et Ritchie', 'Golo et Ritchie'),
    ('96dd9840-2ed0-49eb-b499-7b5936afa754', 'Il reste encore demain', 'Il reste encore demain'),
    ('06c94b6c-12d3-42ba-b670-26e1b8b12970', 'Jamais plus', 'Jamais plus (film)'),
    ('fc2cbccd-12fc-4dfe-9b96-497c3dd1acc8', 'Je verrai toujours vos visages', 'Je verrai toujours vos visages'),
    ('c773ec66-82b0-4751-bc2a-db4a45de8725', "L'Amour Ouf", "L'Amour ouf"),
    ('f9a8d068-538b-4b42-bd8c-0fd8925fd664', "L'arnacoeur", "L'Arnacœur"),
    ('6ec94f96-4778-486d-b43c-d85c19e8be31', 'La salle des profs', 'La Salle des profs'),
    ('c5b93414-08e8-485b-a00a-4af3dd11ecd5', 'Le comte de Monte Cristo', 'Le Comte de Monte-Cristo (film, 2024)'),
    ('85611c32-e30d-4069-8f52-51227d7d3aaf', 'Le deuxième acte', 'Le Deuxième Acte'),
    ('a79cafc6-5caf-4008-9f7f-da1dcbd3aea4', 'Le Fil', 'Le Fil (film, 2024)'),
    ('5b94bb6e-6ff1-4440-a2b5-650a7ed8e2af', 'Le livre des Solutions', 'Le Livre des solutions'),
    ('44f3a3fa-f194-47fa-9fb7-d4e23cd15cb4', 'Les Petits Princes', 'Les Petits Princes'),
    ('9366a713-0f7f-4dbc-9ec0-9f9a54b5ea2c', 'Nous, les Leroy', 'Nous, les Leroy'),
    ('98053209-b7eb-4712-9316-9a2f9ee9a6fc', 'Novembre', 'Novembre (film)'),
    ('35fbc2eb-204c-402c-bf7a-66154fee8919', 'Oppenheimer', 'Oppenheimer (film)'),
    ('84e84b18-ef22-42e3-b6af-0468ddf62b36', 'Papicha', 'Papicha'),
    ('23053ad1-c830-486a-9a69-1ad28812fadf', 'Pas de vagues', 'Pas de vagues (film)'),
    ('83676e4d-ab18-45c3-b452-da90fe19877e', 'Simone', 'Simone, le voyage du siècle'),
    ('9d270e7c-15e2-4bb9-894a-98cfc519cb0e', "Un p'tit truc en plus", "Un p'tit truc en plus"),
    ('dc273379-f0f8-4bb0-b315-f4401b06c2e9', 'Une année difficile', 'Une année difficile'),
    ('239270f9-a9fd-4dc4-be38-29cfe30af1f5', 'Vice Versa 2', 'Vice-versa 2'),
    ('a7cd18ad-4af8-4945-9c54-6ee99dcecf45', 'Yannick', 'Yannick (film)'),
]

# Le paramètre `image` d'une infobox de film. On lit le wikitexte : c'est la
# seule façon de désigner CELLE de l'infobox, et non une photo de tournage.
IMAGE = re.compile(
    r'^\s*\|\s*image\s*=\s*(?:\[\[)?(?:File:|Image:)?([^|\]\n]+\.(?:jpg|jpeg|png))',
    re.IGNORECASE | re.MULTILINE,
)


def api(hote, params):
    params = {**params, 'format': 'json', 'formatversion': '2'}
    url = f'https://{hote}.wikipedia.org/w/api.php?' + urllib.parse.urlencode(params)
    for essai in range(4):
        try:
            requete = urllib.request.Request(url, headers=UA)
            return json.load(urllib.request.urlopen(requete, timeout=25))
        except Exception:
            # Wikimedia répond 429 quand on appuie trop vite : on attend, on
            # réessaie, et on ne martèle pas.
            if essai == 3:
                raise
            time.sleep(3 + essai * 4)


def resoudre(identifiant, titre, page_fr):
    trouve = {'id': identifiant, 'titre': titre, 'fr': page_fr}

    lien = api('fr', {'action': 'query', 'redirects': 1, 'titles': page_fr,
                      'prop': 'langlinks', 'lllang': 'en'})['query']['pages'][0]
    if 'missing' in lien:
        return {**trouve, 'souci': 'page fr introuvable — corriger la table'}
    liens = lien.get('langlinks') or []
    if not liens:
        return {**trouve, 'souci': 'pas de page anglaise'}
    trouve['en'] = liens[0]['title']
    time.sleep(0.5)

    page = api('en', {'action': 'query', 'redirects': 1, 'titles': trouve['en'],
                      'prop': 'revisions', 'rvprop': 'content',
                      'rvslots': 'main'})['query']['pages'][0]
    revisions = page.get('revisions') or []
    texte = revisions[0]['slots']['main']['content'] if revisions else ''
    trouvee = IMAGE.search(texte)
    if not trouvee:
        return {**trouve, 'souci': "pas d'image dans l'infobox"}
    trouve['fichier'] = trouvee.group(1).strip()
    time.sleep(0.5)

    fichier = api('en', {'action': 'query', 'titles': f"File:{trouve['fichier']}",
                         'prop': 'imageinfo', 'iiprop': 'url|size',
                         'iiurlwidth': LARGEUR})['query']['pages'][0]
    info = (fichier.get('imageinfo') or [None])[0]
    if not info:
        return {**trouve, 'souci': 'fichier illisible'}
    trouve['url'] = info.get('thumburl') or info.get('url')
    return trouve


def main():
    sortie = []
    for identifiant, titre, page_fr in FILMS:
        try:
            trouve = resoudre(identifiant, titre, page_fr)
        except Exception as souci:  # noqa: BLE001 — on veut la ligne, pas la pile
            trouve = {'id': identifiant, 'titre': titre, 'souci': f'erreur : {souci}'}
        sortie.append(trouve)
        etat = trouve.get('fichier') or trouve.get('souci')
        print(f'{titre:34.34} {etat}', file=sys.stderr, flush=True)
        time.sleep(0.4)

    manquants = [t['titre'] for t in sortie if not t.get('url')]
    print(f'\n{len(sortie) - len(manquants)}/{len(sortie)} résolus.', file=sys.stderr)
    if manquants:
        print(f'Sans affiche : {", ".join(manquants)}', file=sys.stderr)

    json.dump(sortie, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
