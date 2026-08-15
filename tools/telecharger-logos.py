#!/usr/bin/env python3
"""Rapatrie les écussons des clubs du vivier.

    python3 tools/telecharger-logos.py

Les logos sont RAPATRIÉS, jamais appelés à distance : c'est la règle du dépôt
(les polices sont dans `fonts/`, supabase-js dans `js/vendor/`). Un écusson
chargé depuis un CDN, ce serait une dépendance externe de plus, une requête que
la coquille hors ligne ne pourrait pas garantir, et l'adresse IP de Noé envoyée
à un tiers à chaque ouverture du vivier.

Deux sources publiques, sans clé :

- **ESPN** (`a.espncdn.com`) pour les 79 clubs de ses championnats — Ligue 1,
  Ligue 2, Belgique, Suisse, Allemagne, Italie, Espagne.
- **TheSportsDB** pour les 18 clubs du National, qu'ESPN ne couvre pas.

La table ci-dessous est ÉCRITE, pas devinée. Elle a été bâtie une fois par
appariement de noms puis relue club par club (le nom de la source est en
commentaire au bout de chaque ligne). Un rapprochement automatique rejoué à
chaque exécution pourrait changer un écusson dans le dos de Noé : ici, ce qui
change doit être écrit ici.

Les images sont réduites à 64 px : elles s'affichent en 20 px, 64 couvre les
écrans à forte densité, et 97 écussons pèsent alors ~400 Ko au lieu de 3 Mo.
`sips` est livré avec macOS — même dépendance que `tools/generer-icones.py`.

La sortie : `img/clubs/<slug>.png`, plus `js/logos-clubs.js` qui relie le nom
exact du club à son fichier. Un fichier généré plutôt qu'un slug recalculé en
JS : deux fonctions de normalisation dans deux langages finissent toujours par
diverger, et un club sans écusson doit se savoir, pas se deviner.
"""

import json
import pathlib
import subprocess
import sys
import tempfile
import urllib.request

RACINE = pathlib.Path(__file__).resolve().parent.parent
CLUBS_IMG = RACINE / 'img' / 'clubs'
MODULE = RACINE / 'js' / 'logos-clubs.js'
TAILLE = 64

ESPN = 'https://a.espncdn.com/i/teamlogos/soccer/500/{}.png'

# (nom au vivier, fichier, source, référence)  # nom chez la source
CLUBS = [
    ('Bayer Leverkusen', 'bayer-leverkusen', 'espn', '131'),  # Bayer Leverkusen
    ('Bayern Munich', 'bayern-munich', 'espn', '132'),  # Bayern Munich
    ('Borussia Dortmund', 'borussia-dortmund', 'espn', '124'),  # Borussia Dortmund
    ('Borussia Mönchengladbach', 'borussia-monchengladbach', 'espn', '268'),  # Borussia Mönchengladbach
    ('Eintracht Francfort', 'eintracht-francfort', 'espn', '125'),  # Eintracht Frankfurt
    ('FC Augsburg', 'fc-augsburg', 'espn', '3841'),  # FC Augsburg
    ('FC Cologne', 'fc-cologne', 'espn', '122'),  # FC Cologne
    ('VfB Stuttgart', 'vfb-stuttgart', 'espn', '134'),  # VfB Stuttgart
    ('Club Bruges', 'club-bruges', 'espn', '570'),  # Club Brugge
    ('KRC Genk', 'krc-genk', 'espn', '938'),  # Racing Genk
    ('La Gantoise', 'la-gantoise', 'espn', '3611'),  # KAA Gent
    ('Royal Antwerp', 'royal-antwerp', 'espn', '17544'),  # Antwerp
    ('RSC Anderlecht', 'rsc-anderlecht', 'espn', '441'),  # Anderlecht
    ('Sporting Charleroi', 'sporting-charleroi', 'espn', '3616'),  # Royal Charleroi SC
    ('Standard de Liège', 'standard-de-liege', 'espn', '559'),  # Standard Liege
    ('Union Saint-Gilloise', 'union-saint-gilloise', 'espn', '5807'),  # Union St.-Gilloise
    ('Athletic Bilbao', 'athletic-bilbao', 'espn', '93'),  # Athletic Club
    ('Atlético de Madrid', 'atletico-de-madrid', 'espn', '1068'),  # Atlético Madrid
    ('Celta Vigo', 'celta-vigo', 'espn', '85'),  # Celta Vigo
    ('FC Barcelone', 'fc-barcelone', 'espn', '83'),  # Barcelona
    ('Real Betis', 'real-betis', 'espn', '244'),  # Real Betis
    ('Real Madrid', 'real-madrid', 'espn', '86'),  # Real Madrid
    ('Real Sociedad', 'real-sociedad', 'espn', '89'),  # Real Sociedad
    ('Séville FC', 'seville-fc', 'espn', '243'),  # Sevilla
    ('UD Almería', 'ud-almeria', 'espn', '6832'),  # Almería
    ('Valence CF', 'valence-cf', 'espn', '94'),  # Valencia
    ('Villarreal CF', 'villarreal-cf', 'espn', '102'),  # Villarreal
    ('AC Milan', 'ac-milan', 'espn', '103'),  # AC Milan
    ('AS Roma', 'as-roma', 'espn', '104'),  # AS Roma
    ('Atalanta Bergame', 'atalanta-bergame', 'espn', '105'),  # Atalanta
    ('Bologne FC', 'bologne-fc', 'espn', '107'),  # Bologna
    ('Fiorentina', 'fiorentina', 'espn', '109'),  # Fiorentina
    ('Inter Milan', 'inter-milan', 'espn', '110'),  # Internazionale
    ('Juventus', 'juventus', 'espn', '111'),  # Juventus
    ('Lazio Rome', 'lazio-rome', 'espn', '112'),  # Lazio
    ('SSC Naples', 'ssc-naples', 'espn', '114'),  # Napoli
    ('Torino FC', 'torino-fc', 'espn', '239'),  # Torino
    ('AJ Auxerre', 'aj-auxerre', 'espn', '172'),  # AJ Auxerre
    ('Angers SCO', 'angers-sco', 'espn', '7868'),  # Angers
    ('AS Monaco', 'as-monaco', 'espn', '174'),  # AS Monaco
    ('ESTAC Troyes', 'estac-troyes', 'espn', '170'),  # Troyes
    ('FC Lorient', 'fc-lorient', 'espn', '273'),  # Lorient
    ('Le Havre AC', 'le-havre-ac', 'espn', '3236'),  # Le Havre AC
    ('Le Mans FC', 'le-mans-fc', 'espn', '2697'),  # Le Mans
    ('LOSC Lille', 'losc-lille', 'espn', '166'),  # Lille
    ('OGC Nice', 'ogc-nice', 'espn', '2502'),  # Nice
    ('Olympique de Marseille', 'olympique-de-marseille', 'espn', '176'),  # Marseille
    ('Olympique Lyonnais', 'olympique-lyonnais', 'espn', '167'),  # Lyon
    ('Paris FC', 'paris-fc', 'espn', '6851'),  # Paris FC
    ('Paris Saint-Germain', 'paris-saint-germain', 'espn', '160'),  # Paris Saint-Germain
    ('RC Lens', 'rc-lens', 'espn', '175'),  # Lens
    ('RC Strasbourg', 'rc-strasbourg', 'espn', '180'),  # Strasbourg
    ('Stade Brestois', 'stade-brestois', 'espn', '6997'),  # Brest
    ('Stade Rennais', 'stade-rennais', 'espn', '169'),  # Stade Rennais
    ('Toulouse FC', 'toulouse-fc', 'espn', '179'),  # Toulouse
    ('AS Nancy-Lorraine', 'as-nancy-lorraine', 'espn', '3267'),  # AS Nancy Lorraine
    ('AS Saint-Étienne', 'as-saint-etienne', 'espn', '178'),  # Saint-Étienne
    ('Clermont Foot 63', 'clermont-foot-63', 'espn', '3171'),  # Clermont Foot
    ('Dijon FCO', 'dijon-fco', 'espn', '3170'),  # Dijon FCO
    ('EA Guingamp', 'ea-guingamp', 'espn', '171'),  # Guingamp
    ('FC Annecy', 'fc-annecy', 'espn', '18066'),  # Annecy
    ('FC Metz', 'fc-metz', 'espn', '177'),  # Metz
    ('FC Nantes', 'fc-nantes', 'espn', '165'),  # Nantes
    ('FC Sochaux-Montbéliard', 'fc-sochaux-montbeliard', 'espn', '272'),  # Sochaux
    ('Grenoble Foot 38', 'grenoble-foot-38', 'espn', '6994'),  # Grenoble
    ('Montpellier HSC', 'montpellier-hsc', 'espn', '274'),  # Montpellier
    ('Pau FC', 'pau-fc', 'espn', '10678'),  # Pau
    ('Red Star FC', 'red-star-fc', 'espn', '11884'),  # Red Star FC 93
    ('Rodez AF', 'rodez-af', 'espn', '7719'),  # Rodez Aveyron
    ('Stade de Reims', 'stade-de-reims', 'espn', '3243'),  # Stade de Reims
    ('Stade Lavallois', 'stade-lavallois', 'espn', '3266'),  # Stade Laval
    ('US Boulogne', 'us-boulogne', 'espn', '7869'),  # Boulogne
    ('USL Dunkerque', 'usl-dunkerque', 'espn', '7732'),  # Dunkerque
    ('Amiens SC', 'amiens-sc', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/nwgget1656423507.png'),  # Amiens
    ('AS Cannes', 'as-cannes', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/1120tb1690570715.png'),  # Cannes
    ('Bourg-en-Bresse 01', 'bourg-en-bresse-01', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/x8q5631690575585.png'),  # Bourg-Péronnas
    ('FC Fleury 91', 'fc-fleury-91', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/b6hmjd1752323430.png'),  # Fleury
    ('FC Rouen', 'fc-rouen', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/6m1fwf1690606286.png'),  # Rouen
    ('FC Versailles', 'fc-versailles', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/j6yb981653309400.png'),  # Versailles
    ('FC Villefranche-Beaujolais', 'fc-villefranche-beaujolais', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/93nv281580244314.png'),  # Villefranche Beaujolais
    ('La Roche-sur-Yon VF', 'la-roche-sur-yon-vf', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/kuu8vv1732583553.png'),  # La Roche-sur-Yon
    ('Le Puy Foot 43', 'le-puy-foot-43', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/uhsmj31781478894.png'),  # Le Puy-en-Velay
    ('Paris 13 Atlético', 'paris-13-atletico', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/t2wpmc1654775914.png'),  # Paris 13 Atletico
    ('Quevilly Rouen Métropole', 'quevilly-rouen-metropole', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/r4vcc71579992042.png'),  # Quevilly-Rouen Métropole
    ('SC Aubagne Air-Bel', 'sc-aubagne-air-bel', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/kpvnep1754277331.png'),  # Aubagne Air Bel
    ('SC Bastia', 'sc-bastia', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/mv09b91754278549.png'),  # Bastia
    ('SM Caen', 'sm-caen', 'sportsdb', 'https://www.thesportsdb.com/images/media/team/badge/416kon1784484564.png'),  # Caen
    ('US Concarneau', 'us-concarneau', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/qscxtc1580238253.png'),  # Concarneau
    ('US Orléans', 'us-orleans', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/d6cu101766702274.png'),  # Orléans
    ('US Thionville Lusitanos', 'us-thionville-lusitanos', 'sportsdb', 'https://r2.thesportsdb.com/images/media/team/badge/rwl7nj1702804979.png'),  # Thionville Lusitanos
    ('Valenciennes FC', 'valenciennes-fc', 'sportsdb', 'https://www.thesportsdb.com/images/media/team/badge/guirg71784504305.png'),  # Valenciennes
    ('BSC Young Boys', 'bsc-young-boys', 'espn', '2722'),  # Young Boys
    ('FC Bâle', 'fc-bale', 'espn', '989'),  # FC Basel
    ('FC Lugano', 'fc-lugano', 'espn', '7672'),  # FC Lugano
    ('FC Sion', 'fc-sion', 'espn', '3076'),  # FC Sion
    ('FC Zurich', 'fc-zurich', 'espn', '3019'),  # FC Zürich
    ('Servette FC', 'servette-fc', 'espn', '20032'),  # Servette
]


def adresse(source, reference):
    return ESPN.format(reference) if source == 'espn' else reference


def telecharger(url, vers):
    """Rapatrie une image et la réduit. Rend False plutôt que de lever :
    un écusson manquant ne doit pas arrêter les 96 autres."""
    requete = urllib.request.Request(url, headers={'User-Agent': 'hub-noe'})
    try:
        with urllib.request.urlopen(requete, timeout=30) as reponse:
            octets = reponse.read()
    except Exception as souci:  # noqa: BLE001
        print(f'    échec : {souci}')
        return False

    if len(octets) < 500:
        print('    échec : réponse trop courte pour être une image')
        return False

    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as brut:
        brut.write(octets)
        chemin_brut = pathlib.Path(brut.name)

    try:
        subprocess.run(
            ['sips', '-Z', str(TAILLE), str(chemin_brut), '--out', str(vers)],
            check=True, capture_output=True,
        )
    except subprocess.CalledProcessError as souci:
        print(f'    échec sips : {souci.stderr.decode()[:120]}')
        return False
    finally:
        chemin_brut.unlink(missing_ok=True)

    return True


def main():
    CLUBS_IMG.mkdir(parents=True, exist_ok=True)
    poses, rates = [], []

    for nom, fichier, source, reference in CLUBS:
        cible = CLUBS_IMG / f'{fichier}.png'
        # Déjà là : on ne retélécharge pas. Effacer le fichier suffit à le
        # rafraîchir, et une exécution de plus ne pilonne pas les deux sources.
        if cible.exists():
            poses.append((nom, fichier))
            continue

        print(f'  {nom}')
        if telecharger(adresse(source, reference), cible):
            poses.append((nom, fichier))
        else:
            rates.append(nom)

    lignes = ',\n'.join(
        f'  {json.dumps(nom, ensure_ascii=False)}: "{fichier}.png"'
        for nom, fichier in sorted(poses)
    )

    MODULE.write_text(
        '// Les écussons des clubs du vivier — FICHIER GÉNÉRÉ.\n'
        '// `python3 tools/telecharger-logos.py` le réécrit ; ne pas le\n'
        '// corriger à la main, la table des sources est dans l\'outil.\n'
        '//\n'
        '// Le nom EXACT du club au vivier mène à son fichier. Un club absent\n'
        '// de cette table n\'a pas d\'écusson, et l\'interface le sait avant\n'
        '// de dessiner — pas d\'image cassée, pas de requête pour rien.\n\n'
        'export const LOGOS_CLUBS = {\n' + lignes + ',\n};\n',
        encoding='utf-8',
    )

    print(f'\n{len(poses)} écussons dans img/clubs/, {MODULE.name} réécrit.')
    if rates:
        print(f'sans écusson ({len(rates)}) : ' + ', '.join(rates))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
