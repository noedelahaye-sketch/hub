#!/usr/bin/env python3
"""Importe les portraits du club, un organigramme à la fois.

    python3 tools/importer-portraits-fch.py commissions
    python3 tools/importer-portraits-fch.py sportif

LE CLUB EXPORTE UN DOSSIER PAR ORGANIGRAMME — bureau, commissions, sportif —, et
la pastille y prend la couleur de l'organigramme : rouge au bureau, bleue aux
commissions, or au sportif. Une même personne a donc PLUSIEURS portraits, et
c'est ce que l'écran demande depuis le 20 septembre 2026 : chaque affichage
montre le portrait de SON organigramme.

LE NOM DU FICHIER NE FAIT PAS FOI, et ça s'est payé huit fois à l'import du
16 septembre — « Franck » est Stéphane Coissard, « Jon » Stéphane Fetter,
« Olivier » Grégory Mellarin, « Sandrine » Emma Liconnet. La table ci-dessous
est donc ÉCRITE, vérifiée visage par visage, et jamais déduite du prénom. Une
correspondance rejouée à chaque exécution peut changer un visage dans le dos de
Noé — c'est la leçon déjà écrite pour les écussons des clubs et pour les
affiches de films.

LE CADRE EST UNE FENÊTRE, PAS UNE DÉCOUPE : le hub n'altère aucune image, il
regarde à travers. Voir `cadrer` plus bas pour ce qu'il vise.
"""
import json
import shutil
import struct
import sys
import unicodedata
import zlib
from collections import Counter
from pathlib import Path

# macOS RANGE SES NOMS DE FICHIERS EN NFD : « Céd » y est un C, un e et un accent
# séparé, quand ce fichier-ci l'écrit en NFC. Les deux chaînes s'affichent pareil
# et ne sont PAS égales — *mesuré : six portraits accentués écartés en silence,
# « identité non tranchée » alors que la table les nommait.* On compare donc des
# formes normalisées, des deux côtés.
cle = lambda nom: unicodedata.normalize('NFC', nom)

RACINE = Path(__file__).resolve().parent.parent
SOURCE = Path.home() / 'Documents/FCH/Communication/Photo indiv'
PORTRAITS = RACINE / 'img/organigramme/portraits'

# Les correspondances vérifiées, fichier par fichier. Une entrée à None est une
# identité que je ne sais pas trancher : mieux vaut pas de portrait qu'un visage
# posé sous le nom de quelqu'un d'autre.
TABLES = {
    'commissions': {
        'Benoit': 'benoit',
        'Christophe copie': 'christophe',
        'Djamel': 'djamel',
        'Emma': 'emma-liconnet',
        'Florian': 'florian',
        'Hicham s copie': 'hicham',
        'Lina copie 2': 'lina',
        'Lionel': 'lionel',
        'Loic': 'loic',
        # L'HOMME BLOND EN VESTE D'ENTRAÎNEMENT EST BIEN LORENZO (20 septembre
        # 2026, confirmé par Noé). Il fallait le demander : `Bureau/Loïc.png` et
        # `Bureau/Lorenzo.png` sont DEUX RECADRAGES DU MÊME CLICHÉ, donc le
        # portrait par défaut de Lorenzo montre aujourd'hui le visage de Loïc —
        # et ce fichier-ci montre un troisième homme. Le portrait des commissions
        # est le seul du dossier qui soit vraiment lui.
        'Lorenzo': 'lorenzo',
        'Noe sponsors': 'noe',
        'Sandy': 'sandy',
        'Thibault': 'thibaut',
        'sandrine copie': 'sandrine',
    },
    'sportif': {
        'Aleandre': 'alexandre',
        'Alyssa': 'alyssa',
        'Alyssa-1': 'tom',
        'Anais': 'anais',
        'Aurelien': 'aurelien',
        'Axel': 'axel',
        'Benoit': 'benoit',
        'Cedric': 'elliot',
        'Chadi': 'chadi',
        # LES DEUX CHRISTOPHE SONT LE MÊME (20 septembre 2026, tranché par Noé :
        # « Christophe à mettre dans les U13 »). La question était ouverte depuis
        # le 16 septembre — deux portraits très différents portent son nom, et le
        # hub ne pouvait pas choisir seul. Il garde celui du bureau partout
        # ailleurs ; celui-ci est sa photo de l'organigramme sportif, où il
        # encadre les U13.
        'Chris': 'christophe',
        'Clément': 'clement',
        'Cyril': 'cyril',
        'Céd': 'cedric',
        'Franck': 'stephane-c',
        'Hubert': 'hubert',
        'JC': 'jean-christophe',
        'Jon': 'stephane-f',
        'Jules': 'jules',
        'Julien': 'julien',
        'Lilian': 'lilian',
        'Lionel': 'lionel',
        'Léo': 'leo',
        'Léo-1': 'antoine',
        'Mahé': 'mahe',
        'Melvin': 'melvin',
        'Melvin-1': 'gregory-b',
        'Mounir': 'mounir',
        'Nordine': 'nordine',
        'Olivier': 'gregory-m',
        'Phillipe': 'philippe',
        'Quentin': 'quentin',
        'Robin': 'robin',
        'Rémy': 'remy',
        'Sandrine': 'emma-liconnet',
    },
}


# --- Lecture PNG, sans dépendance -------------------------------------------
# Le dépôt n'appelle aucune bibliothèque externe, et un outil qui tourne une fois
# par saison n'est pas une raison d'en ajouter une.
def lire(chemin):
    d = chemin.read_bytes()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', chemin
    i, idat, pal = 8, b'', None
    largeur = hauteur = profondeur = couleur = None
    while i < len(d):
        n = struct.unpack('>I', d[i:i + 4])[0]
        typ, data = d[i + 4:i + 8], d[i + 8:i + 8 + n]
        if typ == b'IHDR':
            largeur, hauteur, profondeur, couleur = struct.unpack('>IIBB', data[:10])
        elif typ == b'IDAT':
            idat += data
        elif typ == b'PLTE':
            pal = data
        i += 12 + n
    assert profondeur == 8, f'profondeur {profondeur} : {chemin}'
    canaux = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[couleur]
    brut = zlib.decompress(idat)
    ligne_octets = largeur * canaux
    sortie, precedente, pos = bytearray(), bytearray(ligne_octets), 0
    for _ in range(hauteur):
        filtre = brut[pos]
        pos += 1
        ligne = bytearray(brut[pos:pos + ligne_octets])
        pos += ligne_octets
        for x in range(ligne_octets):
            a = ligne[x - canaux] if x >= canaux else 0
            b = precedente[x]
            c = precedente[x - canaux] if x >= canaux else 0
            if filtre == 1:
                ligne[x] = (ligne[x] + a) & 255
            elif filtre == 2:
                ligne[x] = (ligne[x] + b) & 255
            elif filtre == 3:
                ligne[x] = (ligne[x] + (a + b) // 2) & 255
            elif filtre == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                ligne[x] = (ligne[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        sortie += ligne
        precedente = ligne
    px = bytes(sortie)

    def pixel(x, y):
        o = (y * largeur + x) * canaux
        if couleur == 3:
            k = px[o]
            return (pal[k * 3], pal[k * 3 + 1], pal[k * 3 + 2], 255)
        if couleur == 6:
            return tuple(px[o:o + 4])
        if couleur == 2:
            return (*px[o:o + 3], 255)
        if couleur == 4:
            return (px[o], px[o], px[o], px[o + 1])
        return (px[o], px[o], px[o], 255)

    return largeur, hauteur, [[pixel(x, y) for x in range(largeur)] for y in range(hauteur)]


# --- Le cadrage --------------------------------------------------------------
def cadrer(largeur, hauteur, grille, marge=0.07):
    """La fenêtre carrée que l'écran regarde : la pastille, et la tête qui en déborde.

    LA BANDE DU NOM PORTE LA MÊME COULEUR QUE LA PASTILLE — c'est le piège de ce
    format, et il fausse toute mesure prise sans y penser : la tache colorée
    descend alors jusqu'en bas de l'image, le disque en ressort trop large et son
    centre trop bas. Les deux sont séparés par des lignes ENTIÈREMENT
    TRANSPARENTES : on coupe là, et la bande n'existe plus pour la suite.

    LE DISQUE DONNE LA LARGEUR, LA TÊTE DONNE LE HAUT. On ne peut pas prendre la
    boîte des pixels colorés : les épaules mangent le bas du cercle et la tête en
    couvre le sommet. La largeur du disque, elle, se lit franchement — c'est le
    diamètre. Le haut du cadre, lui, part du SOMMET DE LA TÊTE, qui déborde de la
    pastille : c'est le dessin du club, et le rogner le décapiterait.

    LE CADRE EST CARRÉ, parce que le portrait est rond à l'écran : un cadre plus
    haut que large l'étirerait. Il peut déborder de l'image — le sujet est
    détouré, donc ce qui dépasse est transparent et laisse voir la carte.
    """
    # Là où la silhouette s'arrête et où la bande commence.
    occupee = [any(grille[y][x][3] >= 40 for x in range(largeur)) for y in range(hauteur)]
    bas = hauteur
    vue = False
    for y in range(hauteur):
        if occupee[y]:
            vue = True
        elif vue:
            bas = y
            break

    comptes = Counter()
    for y in range(bas):
        for x in range(largeur):
            r, g, b, a = grille[y][x]
            if a < 250 or (r > 235 and g > 235 and b > 235):
                continue
            comptes[(r, g, b)] += 1
    teinte = comptes.most_common(1)[0][0]
    pastille = lambda c: c[3] >= 250 and sum(abs(c[i] - teinte[i]) for i in range(3)) <= 24

    colonnes = [x for x in range(largeur) if any(pastille(grille[y][x]) for y in range(bas))]
    # Le rebord anticrénelé n'atteint pas la teinte pleine : deux pixels de
    # chaque côté lui reviennent.
    diametre = colonnes[-1] - colonnes[0] + 1 + 4
    centre_x = colonnes[0] - 2 + diametre / 2

    sommet = min(y for y in range(bas) for x in range(largeur) if grille[y][x][3] >= 40)
    m = diametre * marge
    cote = round(diametre + 2 * m)
    return [round(centre_x - diametre / 2 - m), round(sommet - m), cote, cote], teinte


def main():
    domaine = sys.argv[1] if len(sys.argv) > 1 else ''
    if domaine not in TABLES:
        sys.exit('Usage : importer-portraits-fch.py commissions|sportif')
    dossier = SOURCE / domaine.capitalize()
    cible = PORTRAITS / domaine
    cible.mkdir(parents=True, exist_ok=True)

    table = {cle(nom): qui for nom, qui in TABLES[domaine].items()}
    vus = set(table)
    presents = {cle(f.stem) for f in dossier.glob('*.png')}
    if vus != presents:
        print(f'  ⚠ table et dossier ne coïncident pas : '
              f'en trop {sorted(vus - presents)} · manquants {sorted(presents - vus)}')

    fiches = {}
    for fichier in sorted(dossier.glob('*.png')):
        qui = table.get(cle(fichier.stem))
        if not qui:
            print(f'  — {fichier.name} : identité non tranchée, laissé de côté')
            continue
        largeur, hauteur, grille = lire(fichier)
        cadre, teinte = cadrer(largeur, hauteur, grille)
        src = f'img/organigramme/portraits/{domaine}/{qui}.png'
        shutil.copyfile(fichier, RACINE / src)
        fiches[qui] = {'src': src, 'largeur': largeur, 'hauteur': hauteur, 'cadre': cadre}
        print(f'  {qui:16} {fichier.name:22} {largeur}x{hauteur} pastille={teinte} cadre={cadre}')

    # L'OUTIL ÉCRIT LA DONNÉE, il ne rend pas un fichier à recopier : une étape à
    # la main entre les deux, c'est une occasion de se tromper de personne, et
    # c'est précisément ce qu'on cherche à éviter ici. Il est REJOUABLE — une
    # seconde exécution réécrit les mêmes entrées.
    data = RACINE / 'js/organigramme-fch-data.js'
    texte = data.read_text(encoding='utf-8')
    debut = texte.index('export const PERSONNES = ') + len('export const PERSONNES = ')
    fin = texte.index('\n};', debut) + 2
    gens = json.loads(texte[debut:fin])
    for qui, photo in fiches.items():
        gens[qui].setdefault('photos', {})[domaine] = photo
    texte = texte[:debut] + json.dumps(gens, indent=2, ensure_ascii=False) + texte[fin:]
    data.write_text(texte, encoding='utf-8')
    print(f'{len(fiches)} portraits importés dans {cible.relative_to(RACINE)} '
          f'et inscrits dans {data.relative_to(RACINE)}.')
    print('  Pense à la coquille : chaque src doit figurer dans sw.js '
          '(node tools/verifier-coquille.js).')


if __name__ == '__main__':
    main()
