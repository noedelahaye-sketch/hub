# Yuno — cahier des charges de l'espace

**3e version — le système « Terrain », 12 août 2026.** La 1re organisait tout
autour d'un pipeline de reportage ; la 2e a mis le cap et la création au
centre. Celle-ci va plus loin : **l'accueil du site montre le vécu, pas le
social.** Chaque règle s'accompagne de sa raison ; si une règle gêne à l'usage,
on la change en connaissance de cause.

> **Les deux documents fondateurs de « Terrain » ne sont pas dans ce dépôt.**
> `Yuno/brief-v1-1-terrain-yuno.md` (le quoi) et `Yuno/pourquoi-terrain-yuno.md`
> (le pourquoi, qui fait autorité sur l'intention) vivent sur la machine de Noé
> et sont dans le `.gitignore` : ils portent sa stratégie éditoriale, ses cibles
> et une analyse personnelle, et ce dépôt est public. **En cas de doute sur une
> décision, les relire avant de revenir à ce fichier-ci.**

---

## 0. Les cinq principes de « Terrain »

Ils gouvernent toute décision d'interface dans cet espace, et ils priment sur le
confort :

1. **Le succès se mesure en moments vécus** — matchs couverts, rencontres,
   œuvres finies. Les vues sont une donnée, jamais un verdict.
2. **Les réseaux sont une vitrine, pas une résidence** — on dépose l'œuvre, on
   repart. Les stats ont un rendez-vous hebdomadaire, jamais un fil continu.
3. **L'argent est une conséquence, pas un juge.**
4. **L'aller-vers se muscle par micro-doses graduées** — on mesure l'effort
   (les messages envoyés), jamais le résultat (les réponses reçues).
5. **La photo est un pont vers les gens** — les rencontres comptent autant que
   les images.

**Six questions d'arbitrage**, à poser avant d'ajouter quoi que ce soit ici :
est-ce que ça augmente le temps dehors ou le temps dedans ? est-ce que ça
mesure un effort contrôlable ou un résultat subi ? est-ce que ça indexe sa
valeur sur des chiffres ? est-ce que ça pousse vers les gens ou permet de les
éviter ? est-ce que ça ferme un débat mental ou en ouvre un ? est-ce que Noé
reste l'auteur ?

**Conséquences dures, à ne pas défaire :** aucune métrique sociale (vues,
abonnés, portée) hors du rendez-vous stats ; aucun taux de réponse ni compte de
silences nulle part ; pas de streak, pas de rouge, pas de « raté ».

---

## 1. Ce que cet espace est, et n'est pas

**C'est le quartier général de Yuno**, pas un outil de production photo. Noé y
vient pour deux choses : savoir où il va (le plan d'action, les objectifs), et
nourrir la création pour les réseaux (idées, calendrier éditorial).

**Ce n'est pas la vitrine.** yuno_rph se montre sur Instagram. Ici, rien n'est
destiné à être vu par un client ou un club.

**Il ne se visite pas tous les jours — et c'est voulu.** Le rythme quotidien
appartient au dashboard du hub : c'est lui qui rappelle chaque matin les tâches
actives, la progression des objectifs et ce qui arrive cette semaine. L'espace
Yuno est l'atelier où l'on descend une ou deux fois par semaine pour planifier
et créer. Conséquence : tout ce qui doit être vu quotidiennement doit remonter
au dashboard (voir §6), rien ne doit exiger d'ouvrir l'espace « pour vérifier ».

**Il vit dans le hub** (`#photo`), derrière la connexion, avec sa propre
identité visuelle (§3) et ses écrans propres (§4). La philosophie du hub
s'applique : montrer l'accompli d'abord, jamais de compteur de retard.

**Il grandit outil par outil.** Noé le dit lui-même : d'autres besoins ne sont
pas encore identifiés. La structure en sous-adresses (`#photo/<outil>`) permet
d'ajouter un outil sans toucher aux autres. On construit un outil quand le
besoin est constaté, pas avant.

---

## 2. Le principe directeur

**Du cap vers le contenu.** Le gros manque exprimé : « un plan d'action et une
idée assez claire d'où je veux aller », et « un outil pour faciliter la
création d'un calendrier éditorial, m'aider à trouver des idées ». L'espace
répond à ces deux manques, dans cet ordre :

1. **Le cap** — les objectifs de la marque (CAN 2027, pack de presets,
   revenus 2027…) avec leur pourquoi et leurs jalons. C'est ici que la vision
   devient un plan d'action : un objectif sans jalons n'est qu'un vœu.
2. **La création** — la banque d'idées et le calendrier éditorial. C'est
   l'outil phare de l'espace, celui qui justifie d'y descendre chaque semaine.

Les commandes et le carnet réseau existent, mais en second rang : utiles,
pas structurants.

---

## 3. Identité

**Couleurs** — celles du logo (`img/yuno-logo.jpg`, déposé le 7 août 2026 ;
valeurs mesurées sur le fichier) :

| Rôle | Valeur | Note |
|---|---|---|
| Fond (mode sombre) | `#181818` | Le fond du logo. |
| Accent (sombre) | `#e8b000` | Le doré du Y, dominant. |
| Accent (clair) | `#8f6c00` | Le même doré assombri en ocre. |
| Texte fort | `#ffffff` | Le blanc du logotype. |

Règle de contraste : le doré pur vit sur fond sombre ; en mode clair il
s'assombrit en ocre — un doré clair sur fond blanc ne se lit pas. Le logo
(avec la Belhanda manuscrite) s'affiche en tête de l'espace, rond, zoomé sur
le mot.

**Typographie** — l'identité Yuno : **Canela Deck** pour les titres, **Gilroy**
pour le texte, la Belhanda restant dans le logo, en image.

Décision de Noé (7 août 2026) : utiliser les polices commerciales malgré le
repo public, risques compris et acceptés. Fichiers repris de sa machine :
Canela Deck Regular/Bold **et leurs deux italiques** (versions d'essai
« Trial » — noté), Gilroy Regular/Medium/SemiBold, **plus le Bold depuis le
13 août**. Ces familles ne chargent que dans l'espace Yuno ; le reste du hub
garde les siennes.

**Ne jamais supposer qu'une police couvre le français.** Une fonte peut être
installée, valide, et n'avoir aucun accent : le navigateur ne prévient pas, il
va chercher la lettre manquante ailleurs et le mot se retrouve en deux fontes
sans que rien ne le signale. Se le vérifier avec `fontTools`, en lisant la
`cmap`, plutôt qu'à l'œil.

**Gilroy est servi en WOFF2** depuis le 12 août 2026 : 236 Ko de TTF devenus
74 Ko, soit −70 %, à dessin identique — plus 43 Ko pour le Bold du 13 août. Les `.ttf` restent dans `fonts/` comme
sources, ils ne sont plus servis. `python3 tools/convertir-polices.py` régénère
(demande `pip install fonttools brotli`). **Canela reste en OTF** : quatre
fichiers, 222 Ko téléchargés à chaque première visite — le même gain de 70 %
l'attend, c'est la plus grosse économie qui reste.

**Deux familles de secours ajustées** accompagnent `font-display: swap`, pour
que la bascule ne fasse pas sauter la page. Elles ne portent aucun fichier :
elles habillent une police déjà présente sur la machine aux mesures de la vraie.
Les valeurs sont **mesurées, pas devinées** — sur une dizaine de phrases
réellement affichées par le site, et non sur un pangramme : un pangramme n'a pas
la fréquence de lettres du français et ses chiffres pèsent trop lourd. Premier
essai fait ainsi, il aggravait le saut. Une valeur **par graisse et par
posture** : Gilroy est plus large que l'Helvetica en 400, plus étroit en 600.
Écart de largeur après réglage : **0 % sur les quatre**, contre 1,5 à 24,5 %
sans. Tout est à remesurer si l'on change de police.

Les deux italiques ont été ajoutés le 12 août 2026. Sans eux, le navigateur
fabriquait une inclinaison synthétique qui décalait l'espacement après chaque
lettre accentuée — « Banque d'idé es », « Lé opards » — soit, sur un site
français, partout. **Ne jamais demander une graisse ou une posture dont le
fichier n'existe pas** : le navigateur ne refuse pas, il simule, et il simule
mal. La collection complète que Noé a déposée (`fonts/Canela_Collection/`,
3,7 Mo, huit graisses × quatre familles) reste hors du dépôt : seuls les
quatre fichiers réellement servis sont versionnés.

**Les trois leviers typographiques.** Chacun ne dit qu'une chose ; les employer
tous à la fois ne hiérarchise rien — si tout penche, plus rien ne ressort.

- **La police dit la nature.** Canela = ce que le site *est* (ses lieux, ses
  titres, son contenu). Gilroy = ce que le site *fait* (actions, états, dates,
  mesures, précisions). Tout l'utilitaire, sans exception.
- **La posture dit qui parle.** Italique = la voix du site, qui annonce et qui
  nomme un lieu. Romain = la voix de Noé — ce qu'il a vécu, écrit,
  photographié. Le contenu ne penche pas : il n'annonce rien, il est là.
- **La graisse dit l'importance ou l'état**, jamais la décoration.

| Rôle | Police | Posture | Graisse | Taille |
|---|---|---|---|---|
| Titre de section (`h2`) | Canela | italique | 700 | 1,375 rem |
| Onglet actif, porte | Canela | italique | 700 | 1 rem |
| Onglet inactif | Canela | italique | 400 | 1 rem |
| Titre de tuile (contenu) | Canela | romain | 400 | 1,125 rem |
| Sous-titre, libellé fort | Gilroy | romain | 600 | — |
| Barre du calendrier (titre) | Gilroy | romain | 700 | 0,6875 rem |
| Corps, date, statut | Gilroy | romain | 400 | — |
| Chiffre | Geist Mono | — | — | via `.chiffre` |

**Le 700 est né le 13 août**, pour ces barres-là : à 11 px sur un fond teinté,
le 600 restait timide. Il a fallu **ajouter le fichier** (`Gilroy-Bold.woff2`,
tiré des ressources FCH de Noé) — le dépôt n'avait que 400/500/600, et demander
700 sans lui ne faisait rien du tout : le navigateur retombait sur le SemiBold
en silence, mesuré à 358,92 px dans les deux cas. Corollaire de la règle
« ne jamais demander une graisse dont le fichier n'existe pas » : **elle se
vérifie en mesurant une largeur, pas en regardant l'écran.** Une graisse
manquante ne crie pas, contrairement à une italique simulée.

Les titres de section ont perdu la casse haute et l'interlettrage qu'ils
portaient en Gilroy : c'était l'habillage d'une étiquette, illisible sur un
italique de 11 px. Un titre de section est un titre, pas un libellé.

**L'or ne dit qu'une chose** (décision de Noé, 12 août 2026). Il faisait tout —
onglet actif, compteurs, icônes, bordures survolées, barres décoratives,
étiquettes de classement — et quand tout est doré, plus rien ne l'est.

| L'or (`--accent`) | Le gris chaud (`--gris-chaud`, `--gris-chaud-trait`) |
|---|---|
| L'onglet où l'on se trouve | Les icônes de portes |
| Le focus clavier | Les bordures survolées |
| Les chiffres (compteurs, métriques) | Les barres décoratives |
| Le statut d'une publication | Les étiquettes de réseau et de pilier |
| « Œuvre finie » — rare, et c'est ce que le site célèbre | Les liens survolés |

Un gris **chaud** et non neutre : sur un fond aussi sombre, un gris froid tire
au bleu et jure avec le doré du logo. Contrastes mesurés sur la carte : gris
chaud 5,46:1, or 7,85:1 — les deux au-dessus du seuil.

### Les quatre piliers, en couleur

Palette donnée par Noé le 12 août 2026, cinq couleurs mères construites sur le
même axe (une composante à 235) avec leurs déclinaisons. Quatre servent aux
piliers — le classement qui structure tout le site.

| Pilier | Couleur | Encre | Contraste mesuré |
|---|---|---|---|
| 1 · Les Léopards & le foot africain | `#ebb201` | `#241a00` | 8,92:1 |
| 2 · Bord terrain | `#eb7d00` | `#241200` | 6,43:1 |
| 3 · Dans l'œil du photographe | `#002aeb` | blanc | 8,30:1 |
| 4 · Carte blanche | `#5400eb` | blanc | 8,15:1 |

**Pourquoi la couleur ici, et pas ailleurs.** Un pilier est une catégorie, et
une catégorie est exactement ce qu'une couleur sait dire. Quatre pastilles
dorées identiques ne disaient rien ; quatre couleurs font lire l'équilibre de la
banque d'un coup d'œil, sans lire un mot.

**Pourquoi l'aplat, et pas le texte.** La palette impose la forme : sur le fond
sombre, le jaune (8,0:1) et l'orange (5,5:1) se lisent en lettres, mais le bleu
(1,9:1) et le violet (1,9:1) sont sous le seuil. En aplat avec de l'encre
blanche, les deux remontent à 8,3 et 8,2. Une même chose ne pouvant pas avoir
deux formes selon sa couleur, les quatre sont des pastilles pleines. Seul le
*nom* du pilier, dans la boussole, reprend sa couleur en lettres — et seulement
pour le jaune et l'orange, qui le supportent.

**L'or reste à part.** Il ne dit ni une catégorie ni un thème : l'état actif et
les chiffres. Le jaune du pilier 1 (`#ebb201`) lui ressemble beaucoup, et c'est
voulu — ce pilier *est* le cœur doré du projet.

**Non utilisé pour l'instant** : le bronze `#967D32` et ses déclinaisons
(`#EDC54E`, `#C4A341`, `#736026`, `#4A3E18`). C'est le neutre chaud de la
palette ; il pourrait remplacer le `--gris-chaud` actuel, mais il tire vers le
doré — ce que la décision précédente cherchait justement à raréfier. Les
déclinaisons sombres des quatre piliers (`--pilier-N-fond`) sont déclarées et
disponibles pour des fonds de zone, mais aucune n'est employée aujourd'hui.

**Trois niveaux de fond**, et non deux : `#181818` (page) → `#242426` (carte),
la bordure montant à `#3e3e41`. À `#222222` les tuiles flottaient à peine,
faute d'ombre pour les décoller. Un quatrième niveau pour les zones de
regroupement (`#1d1d1e` en fond de section) reste possible si le besoin revient.

**Ton** : carnet d'atelier. Dense, factuel, et le doré réservé à ce qui compte.

### Canela : les fichiers d'essai, et la vraie

**Les 52 fichiers d'essai ne couvrent que 74 caractères.** Vérifié un par un —
les quatre familles (Canela, Text, Deck, Condensed) et les douze graisses ont
exactement le même jeu : `! " ' , - .`, les chiffres, `?`, A-Z, a-z, et quatre
guillemets courbes. **Aucune lettre accentuée**, pas de `«` `»`, pas de tiret
cadratin. Commercial Type ampute volontairement ses fichiers d'essai. Il n'y a
donc pas de famille à trouver dans la collection : il n'y en a pas.

**Mais macOS installe la vraie Canela**, en police système :
`/System/Library/AssetsV2/…/Canela.ttc`, quatre coupes (Regular, Bold, et leurs
italiques), 378 à 386 caractères, tous les accents. C'est elle que Noé voyait
dans son Livre des polices.

D'où la règle : **chaque `@font-face` de Canela commence par un `local()`**
avant son `url()`.

```css
src: local("Canela-Regular"), url("../fonts/CanelaDeck-Regular.otf") …
```

Conséquences, mesurées :

- sur une machine où Canela est installée (le Mac de Noé), le navigateur prend
  la police système : **accents corrects**, et **aucun fichier Canela
  téléchargé** — 222 Ko économisés ;
- ailleurs (le téléphone, sauf si iOS la fournit aussi), il retombe sur le
  fichier d'essai, et les accents viennent de la police de secours. Le mélange
  reste, mais la secours étant ajustée aux mesures de Canela, il se voit
  beaucoup moins qu'avec un `georgia` brut.

Le `local()` cible la coupe **Canela** et non **Canela Deck** : Deck est le
dessin optimisé pour les tailles moyennes, Canela le dessin d'affiche. La
différence est mince à ces tailles, et elle vaut mieux qu'un mot à deux fontes.

**Pour vérifier sur un appareil** : ouvrir Créer et regarder « À venir ». Si le
`À` est incliné comme le reste du mot, la vraie Canela est là ; s'il est droit,
c'est la police de secours.

---

## 4. Les écrans

**Deux surfaces, décision de Noé (7 août 2026).** Il faut avoir l'impression
de *sortir du hub* en entrant chez Yuno :

- **`#photo` — la page Yuno du hub.** Un tableau de bord réduit : le cap en
  lecture, l'aperçu création, une capture d'idée au vol, les victoires, et la
  porte « Entrer sur le site Yuno ». Habillage du hub conservé. Rien ne s'y
  gère.
- **`#yuno` — le site Yuno.** Tout l'habillage du hub disparaît : ni logo Hub,
  ni onglets, ni autres projets. **Plus d'en-tête du tout depuis le 14 août
  2026** (demande de Noé) : la signature (`img/yuno-signature.png`) occupait le
  haut de chaque page pour redire ce qu'on sait déjà — le site s'ouvre sur sa
  barre, le titre de l'onglet dit « Yuno · yuno_rph », et la signature reste à
  la porte d'entrée, sur la page `#photo` du hub. Navigation :
  Accueil · Journal · Créer · Calendrier · Réseau. **Le site est toujours
  sombre**, quel que soit le réglage du téléphone : la signature blanche et or
  ne vit que sur fond sombre, et ça dit « on a quitté le hub ». Fond `#181818`,
  celui du logo. Une seule sortie, discrète, en pied de page : « Quitter le
  site » — nécessaire en plein écran sur téléphone, où il n'y a pas de barre
  d'adresse.

**Cinq entrées dans la barre, et des sous-pages qui n'en ajoutent pas.** La
banque d'idées (`#yuno/banque`), la Passerelle (`#yuno/passerelle`) et le
carnet (`#yuno/carnet`) sont des pages à part entière, atteintes par une tuile
depuis leur palier, et qui gardent allumé l'onglet dont elles dépendent —
Créer pour la première, Réseau pour les deux autres. Une barre de navigation ne
doit pas grandir à chaque écran qu'on ajoute. `ONGLET_DE_LA_VUE`, dans
`js/yuno.js`, dit quel onglet allumer pour quelle vue.

**« Créer » et « Calendrier » sont deux choses (décision du 7 août).**
« Créer » regroupe le calendrier éditorial et les futurs outils d'aide à la
création. « Calendrier » recense tout ce qui porte une date chez Yuno —
publications, tâches, événements, objectifs et jalons — avec des filtres par
nature. Le hub a le même espace Calendrier, tous projets confondus
(`#calendrier`).

### `#yuno` — l'accueil du site

**Elle montre et elle ouvre des portes ; elle ne gère rien** (décision de Noé,
12 août). Dans l'ordre :

1. **Les trois compteurs** — moments vécus · rencontres · œuvres finies. Ils se
   calculent depuis les moments, ne sont stockés nulle part, et **ne peuvent que
   monter** : c'est une réserve de valeur stable, l'anti-portée.
2. **Loguer un moment** — le bouton de capture, en évidence. C'est l'action de
   la page.
3. **Le mur de photos** — sous les compteurs, une **frise sur une seule
   ligne**, tirée au sort une fois par jour parmi tous les moments qui portent
   une photo (décision de Noé, 12 août). Pas de titre au-dessus, pas de fiche
   autour : l'accueil montre ce qui a été vécu, il ne le raconte pas. Un moment
   sans photo n'y figure pas. Le tirage est stable dans la journée — la date
   sert de graine, rien n'est stocké — et change à minuit.

   **Une ligne, toujours.** C'est la règle qui commande le reste : sur deux
   lignes ce n'est plus une frise mais une galerie, et elle pousse les objectifs
   hors de l'écran. Le nombre de colonnes et le nombre de photos vues vont donc
   de pair — **dix** au-delà de 1080 px, **cinq** entre 720 et 1080, **trois**
   en dessous. Le tirage en fabrique toujours dix ; le surplus se cache en CSS,
   rien à recalculer quand on tourne le téléphone.

   **Ce ne sont pas des tuiles** : ni cadre, ni fond, ni coins arrondis. Une
   photo n'est pas un élément d'interface. L'emplacement est en **3:4 — le 4:3
   dans la longueur** : c'est le format des photos de Noé (la première du carnet
   sort en 2160 × 2880) et celui des réseaux où elles finissent. Un emplacement
   couché aurait laissé chaque portrait flotter entre deux bandes vides.
   L'ajustement est `cover` : **une photo d'une autre proportion est recadrée**
   pour remplir son emplacement, jamais déformée et jamais posée entre deux
   bandes. Le mur y gagne sa régularité — une frise trouée n'en est plus une.
   Sur les photos déjà en 3:4, c'est-à-dire presque toutes, rien n'est coupé.

   **Une vignette est un bouton, pas un lien vers le fichier.** Le clic ouvre
   une **fenêtre volante avec le détail du moment** — son type, sa date, son
   lieu, ses rencontres, sa note, et la photo en grand. Ouvrir une image nue
   dans un onglet vide ne disait rien de ce qu'on avait vécu ce jour-là. Le
   retrait y est offert, écrit (« Retirer du carnet ») et non par une croix : la
   croix de fermeture occupe déjà ce coin. Même fenêtre depuis l'accueil et
   depuis le Journal.
4. **Objectifs** — ceux du projet photo, avec pourquoi et jalons.
5. **En création** — seulement ce qui est programmé. Ni banque d'idées, ni
   porte vers Créer, ni porte vers le Journal (décision de Noé, 12 août) : ces
   deux lieux sont dans la barre, et la banque a sa page. L'accueil ne porte
   plus aucune porte.

Pas d'écran CAN 2027 : c'est un objectif parmi les gros, pas un lieu.

**L'invite du calendrier** s'affiche ici (et au Journal) quand un événement
photo est passé : « Tu as couvert [événement] — tu le notes au carnet ? ». Un
clic ouvre la capture, date et lieu déjà remplis. Trois garde-fous pour qu'elle
ne devienne jamais un reproche : sept jours de fenêtre, rien si un moment est
déjà logué ce jour-là, et **elle ne revient pas une fois écartée** (les écartés
vivent dans le `localStorage`). Une seule à la fois.

### `#yuno/journal` — le Carnet de terrain

La page source des moments : tout s'y retrouve, s'y ajoute et s'y retire.
L'accueil n'en montre qu'un tirage.

**Un moment vécu EST un événement** (décision de Noé, 14 août 2026). Depuis que
le bilan d'une préparation créait le moment, celui-ci ne faisait plus que
recopier son événement — même date, même lieu, même type. Deux objets pour une
seule chose. L'événement porte désormais ses deux faces :

- **prévue** : sa date, son lieu, son `type_moment`, sa feuille de préparation ;
- **vécue** : `vecu`, sa photo, sa note, « œuvre finie », ses rencontres.

Trois conséquences, et elles tiennent l'intention :

1. **`vecu` ne se pose que par un geste** — le bilan, l'invite acceptée, ou la
   capture. **Jamais au passage de la date** : un match où Noé n'est pas allé
   compterait, et les compteurs cesseraient de dire du vrai.
2. **« Retirer du carnet » ne supprime plus rien** : la sortie a eu lieu, elle
   reste au calendrier à sa date. Seule sa face vécue s'efface — photo, note,
   œuvre finie, rencontres, et la victoire qui n'en était que le reflet.
3. **Une sortie notée au vol entre au calendrier**, puisqu'elle en est un
   événement. Ce qui a été vécu se retrouve donc là où on cherche les dates.

**Le vocabulaire n'a pas bougé** : l'écran dit toujours « Moments vécus » et
« Carnet de terrain ». C'est la donnée qui a fusionné, pas les mots.

- **Le mur, entier** (décision de Noé, 12 août 2026). Sous les compteurs, le
  même mur qu'à l'accueil — mêmes emplacements en 3:4, même recadrage, mêmes
  colonnes — avec deux différences qui sont tout l'écart entre les deux pages :
  **rien n'est tiré au sort** et **rien n'est caché**. Toutes les photos, de la
  plus récente à la plus ancienne, sur autant de lignes qu'il en faut. On vient
  au Journal chercher une photo qu'on a prise ; on ne s'y laisse pas surprendre.
  La règle du « une seule ligne » appartenait à l'accueil, où ce qui suit la
  frise doit rester sous les yeux.
- **La capture** s'ouvre en **fenêtre volante**, comme au calendrier — le geste
  est le même partout dans le hub. Le bouton « Ajouter un moment » vit à gauche
  des trois compteurs, sur l'accueil comme au Journal : l'action et son résultat
  se répondent. Elle demande une date, un type (match · concert · sortie ·
  autre), le nom de la sortie, et en facultatif le lieu, les rencontres, une
  photo, une note, et la case « œuvre finie ». Deux champs suffisent — elle doit
  se remplir debout, en sortant du stade, en moins de 30 secondes.
  **Venue de l'invite, elle ne demande QUE le vécu** (rencontres, photo, note) :
  la sortie est déjà au calendrier, elle porte son nom et sa date — les
  redemander serait un formulaire pour rien, et changer la date ici écraserait
  l'heure du match.
- **Une fiche s'ouvre en grand au clic**, depuis une vignette du mur comme
  depuis sa carte du carnet — une sortie sans photo n'a pas de vignette, et son
  bilan serait autrement inatteignable. La fenêtre montre le type, la date, le
  nom, le lieu, les rencontres, la note, la photo en grand, **et le bilan de sa
  préparation** avec une porte vers la feuille (demande de Noé, 14 août 2026).
- **La photo se joint, elle ne se décrit pas.** Elle vit dans un bucket
  Supabase **privé** (`moments`) : le site et le dépôt sont publics, un bucket
  ouvert donnerait des liens recopiables par n'importe qui. On n'y accède que
  par une URL signée d'une heure, refabriquée à chaque visite. Retirer une
  sortie du carnet efface son fichier. Le bucket garde son nom (`moments`) :
  c'est un nom de stockage, pas un mot d'interface, et le renommer casserait
  les chemins déjà écrits en base.
- **Le fil, antéchronologique, ne porte que des moments** (13 août 2026). Il a
  d'abord mêlé les victoires nées ailleurs — une tâche terminée, une commande
  livrée, un jalon atteint. Noé les a fait retirer : une ligne « Publier trois
  reels » au milieu des matchs couverts n'est pas du terrain. **Un carnet de
  terrain se remplit dehors.** Ce qui se coche à l'écran continue de créer sa
  victoire en base et remonte au dashboard du hub, qui est fait pour ça — et
  c'est de là qu'elle se retire, le Journal n'offre plus ce geste.
- **Loguer un moment crée une victoire** (`source = 'moment'`), qui remonte au
  dashboard du hub. Dans ce système, une victoire EST un moment vécu.
- **Les rencontres comptent autant que les images.** Un nom déjà au carnet se
  relie tout seul à sa fiche ; un inconnu garde un « + » pour lui en ouvrir une
  (statut `contact_etabli` : ils se sont vus en vrai). La capture ne s'arrête
  jamais pour ça.

### `#yuno/creer` — l'outil phare

Le calendrier éditorial et la banque d'idées, une seule matière à deux états :
**une idée est une publication sans date**. Noter une idée prend cinq
secondes ; la programmer, c'est juste lui donner une date.

- Une publication porte : un titre/l'idée, le réseau (**Instagram d'abord,
  TikTok et LinkedIn aussi** — décision du 7 août), le format (post,
  carrousel, réel, story), une date prévue (ou rien), un statut
  (`idée → brouillon → prêt → publié`), des notes (légende, plan, références).
- **Les deux grandes portes**, côte à côte au milieu de Créer (décision de Noé,
  12 août 2026) : « Calendrier éditorial » vers `#yuno/editorial`, « Banque
  d'idées » vers `#yuno/banque`. Une icône de 32 px à gauche, le titre sur deux
  lignes voulues (un `<br>` dans le balisage, pas un repli de hasard : les deux
  portes se répondent alors exactement). **Ni titre de section au-dessus, ni
  sous-titre dedans** — un libellé qui répète le nom de la porte n'apprend rien.
  Sur téléphone étroit l'icône passe au-dessus du titre.
- **Vue « À venir »** : les publications datées, dans l'ordre. Le trou de la
  semaine prochaine se voit — c'est le but d'un calendrier éditorial.
- **Vue « Banque d'idées »** : les sans-date, les plus récentes d'abord.
  C'est le backlog créatif ; il ne se vide jamais et ne culpabilise pas.
- **Aide à la création** : des rubriques récurrentes, pré-remplies avec celles
  de Noé — *Raw to edit*, *Raw vs edit*, *No accreditation, no problem*
  (photos depuis les tribunes), *Un mois en tant que photographe sportif* —
  et libres pour la suite : proposer une idée dans une rubrique est plus
  facile que partir de zéro.
- Publier = passer en `publié`, avec le lien. Chaque publication publiée est
  une victoire ? — non : ce serait du bruit à raison de plusieurs par semaine.
  Les victoires restent manuelles ou liées aux jalons et aux moments.

**Les quatre piliers** ouvrent l'écran, en encart : 1. Les Léopards & le foot
africain (la portée) · 2. Bord terrain (le portfolio) · 3. Dans l'œil du
photographe (la conversion) · 4. Carte blanche (la différence). Avec le test —
« ça rentre dans un pilier ? oui → je crée » — le plancher de 2 publications
par semaine, et le rappel que les stories restent une zone franche.

**Ils sont là pour FERMER un débat, pas pour ajouter une contrainte.** Le vrai
frein à la régularité n'était pas le manque d'idées : c'était de re-décider la
stratégie avant chaque publication. Les piliers rendent la question binaire.

Une idée porte donc aussi son **pilier**, sa **preuve** (ce qui montre que le
format marche déjà) et son **« pourquoi chez moi »**. La banque se filtre sur
le pilier et sur le statut. Le titre suffit toujours : noter une idée reste une
affaire de cinq secondes.

**La banque se parcourt en aperçus** (décision de Noé, 12 août 2026). Une tuile
de la banque ne montre que l'essentiel — le réseau, le format, le pilier, le
titre, le statut — dans une colonne étroite (16 rem, quatre de front sur
1240 px, une sur téléphone). Le titre se replie sur autant de lignes qu'il veut.
Une banque est un fonds où l'on fouille : quarante idées qui déballent chacune
leur preuve et leur « pourquoi » ne se parcourent pas du regard.

**Toute la fiche est dans une fenêtre volante**, ouverte au clic sur la tuile
(ou à l'Entrée, la tuile est un bouton) : la preuve, le « pourquoi chez moi »,
les notes, la checklist du carrousel, et **tous les gestes** — avancer le
statut, programmer une date, supprimer. L'aperçu ne porte aucun bouton : la
tuile entière est la cible, et rien ne se déclenche par erreur.

Dans la fenêtre, la suppression **s'écrit** (« Supprimer l'idée ») au lieu de
se dire par une croix : la croix de fermeture est au même bord, et deux « × »
l'un au-dessus de l'autre, dont l'un est irréversible, est un piège.

Les étiquettes (réseau, format, pilier) sont volontairement **très petites** :
ce sont des mentions de classement, pas des titres. Elles doivent se lire quand
on les cherche et disparaître quand on lit le reste.

`construirePublication` (la tuile complète) sert toujours à « À venir » et au
site du FCH : la banque et « Publiées » sont seules à passer par
`construireApercuPublication`.

**Les deux façons d'attaquer, côte à côte** (12 août 2026) : « Noter une idée »
quand on en a une, « Je ne sais pas quoi poster » quand on n'en a pas. Elles se
valent, donc même taille et même allure. Noter passe par une **fenêtre
volante** — le geste est celui de la capture d'un moment, il est le même partout
dans le site.

**Le tirage de la semaine** répond les jours de panne : « Je ne sais pas quoi
poster » pose une seule question — y a-t-il un match cette semaine ? — puis
propose une idée. Avec match, le terrain est là, on le montre (piliers 1 et 2) ;
sans match, l'éducatif ne dépend d'aucun calendrier et passe devant (pilier 3).
Une idée sans pilier reste tirable : proposer vaut mieux que renvoyer à un
classement pas fait.

**La checklist carrousel** s'affiche repliée sur les publications au format
carrousel — hook de 5 à 8 mots, slides 1 ET 2 fortes, tension → développement →
appel à l'action, légende courte. Sans IA : un aide-mémoire, pas un outil qui
écrit à la place de Noé.

**Le cycle des statuts est un paramètre du module partagé** (`publications.js`) :
Yuno pose une étape `à développer` entre l'idée et le brouillon, le FC Hermitage
garde son cycle à quatre. Même chose pour la checklist et les piliers — ils ne
débordent pas sur le club.

### `#yuno/editorial` — poser le mois

La page où l'on programme (décision de Noé, 12 août 2026). Elle garde l'onglet
Créer allumé : c'est une pièce de l'atelier, pas un lieu de plus.

**La grille ne porte QUE des publications.** Ni tâche, ni objectif, ni relance,
et donc **pas de barre de filtres** : il n'y a rien à filtrer, la page est son
propre filtre. Poser un mois demande de voir les trous, et un trou ne se voit
pas si trois autres natures les bouchent. Mois, semaine et agenda restent
disponibles, comme au calendrier général.

**La banque est à droite**, en colonne collante — on programme en piochant dans
ce qui est déjà noté, pas en inventant. Sur téléphone elle passe dessous.

**Glisser une idée sur un jour la programme** : elle quitte la banque et
apparaît en barre dans la grille. Le geste reprend celui du calendrier — on
suit ce qu'il y a sous le pointeur (`elementsFromPoint`) plutôt que l'API
drag-and-drop du navigateur, qui ne se comporte pas pareil partout et ne dessine
rien de convenable. **À la souris seulement** : au doigt, capturer le glissement
entrerait en conflit avec le défilement de la page ; sur téléphone on consulte,
on programme au bureau.

### `#yuno/creer` — le rendez-vous stats (en bas de l'écran)

**On ne supprime pas un réflexe, on le remplace par un rituel.** Les chiffres
des réseaux n'existent nulle part ailleurs dans le site.

- **Six jours sur sept, la section ne montre AUCUN chiffre** : ni courbe, ni
  aperçu, ni total. Un compte à rebours (« Rendez-vous dimanche — dans 4 jours »)
  et le réglage du jour, rien d'autre. Le verrou est côté client, et c'est
  assumé : le système n'empêche pas la triche, il assèche le réflexe.
- **Le jour J** : un formulaire de cinq minutes — abonnés, portée de la semaine,
  top post — qui **ne s'enregistre pas sans la question rituelle** : « est-ce que
  ça change quelque chose à mes actions cette semaine ? ». « Non » est une
  réponse acceptée ; l'absence de réponse, non. C'est elle qui transforme la
  surveillance en pilotage.
- **L'historique n'est visible que pendant le rendez-vous.** Une courbe par
  mesure — **jamais deux échelles sur un même axe**, des abonnés et une portée
  hebdomadaire ne se comparent pas. Trait fin, points discrets, pas de
  quadrillage, et les chiffres écrits en encre plutôt qu'en couleur de série.
  La courbe se dessine à partir du deuxième rendez-vous.
- Le jour du rendez-vous vit dans le `localStorage` (défaut : dimanche), comme
  l'ordre des colonnes. C'est un réglage personnel, pas une donnée.

### `#yuno/reseau` — le carnet réseau *(construit)*

Un CRM sans le mot. Qui y entre (réponse du 7 août) : **les joueurs, les gens
des médias, les gens des clubs**, principalement. Ce qu'une fiche doit rendre
en trois secondes : **le contact** (Instagram, mail, téléphone) et **le
rattachement** — à qui/quoi la personne est reliée (FC Lorient, OM,
La Provence…). D'où le champ `structure`, affiché en évidence sur chaque
fiche. Notes libres et date du dernier échange complètent. Pas de relances
automatiques, pas d'étapes de vente — un carnet d'adresses qui se souvient
de ce qu'on s'est dit.

**Une fiche s'ouvre au clic** (décision de Noé, 12 août 2026), en tuile comme en
ligne de tableau : une **fenêtre volante** avec la structure, les moyens de
contact, le dernier échange, l'objectif, la prochaine action et les notes, et un
**bouton crayon** qui la retourne en formulaire. Le clic ouvre la fiche **sauf**
sur un lien, un bouton, une liste ou un champ : dans le tableau, changer un
statut ne doit pas ouvrir une fenêtre par-dessus, et un lien Instagram doit
mener dehors. La porte du carnet, sur `#yuno/reseau`, s'appelle **CRM**.

**C'est une base de données, pas une liste** (demande de Noé, 7 août 2026 —
« comme Notion : une base de données est la base, après on varie comment on
l'affiche »). Trois couches séparées :

1. **La base** — `baseContacts()` filtre, cherche et trie. Elle ne sait rien
   de son affichage.
2. **Les colonnes** — chacune sait quatre choses, et rien d'autre : se
   comparer (`valeur`), se chercher (`texte`, quand il diffère du tri), se
   dessiner (`cellule`) et se filtrer (`filtre`, pour celles à valeurs
   limitées). Ajouter une colonne filtrable ne demande donc que de la décrire.
3. **Les affichages** — `Tableau` (colonnes triables au clic, un second clic
   inverse le sens) et `Fiches` (les tuiles). Ajouter une vue plus tard —
   groupée par structure, par exemple — ne demandera que d'ajouter un dessin.

**L'ordre des colonnes se change depuis le site** (demande de Noé, 7 août) :
en tirant un en-tête du tableau — le geste de Notion — ou par le panneau
« Colonnes » et ses flèches, qui sert sur téléphone où l'on ne tire pas un
tableau. Les deux écrivent le même ordre.

C'est une **préférence d'affichage, pas une donnée** : elle est retenue dans le
navigateur (`localStorage`), pas en base. Un ordre qui se perdrait au
rechargement ne servirait à rien, mais il n'a rien à faire dans Supabase.
Toute colonne absente d'un ordre enregistré est ajoutée à la fin : ajouter une
colonne au code ne doit pas la faire disparaître chez qui a déjà réordonné.

**Les filtres, sur le modèle de Notion** (demande de Noé, 7 août) : discrets
tant qu'on ne s'en sert pas, dépliables, et composés à la demande. Trois états
distincts :

- `filtresOuverts` — la barre est-elle dépliée ;
- `filtresAjoutes` — quelles colonnes ont leur puce posée dans la barre ;
- `filtres` — la valeur choisie pour chacune (`tout` ne filtre rien).

Un bouton « Filtrer » déplie la barre et porte le nombre de filtres posés.
**Replier n'annule rien** : les filtres restent appliqués et le compte le dit —
sans quoi on cacherait la raison d'une liste courte. « + Filtrer » propose les
colonnes pas encore posées ; retirer une puce **efface aussi sa valeur**, car
laisser agir un filtre invisible serait le meilleur moyen de ne plus rien
comprendre à la liste.

Les choix se déduisent des données présentes et sont comptés (« Lorient (9) ») :
un club que personne ne porte n'a pas à figurer dans la liste. Les filtres se
cumulent (un ET, pas un OU) et se combinent à la recherche.

La recherche porte sur **toutes** les colonnes : taper « lorient » trouve
aussi bien un nom qu'une structure, et « laprovence » trouve par l'e-mail.
Les cases vides finissent toujours en bas, quel que soit le sens du tri — une
fiche sans date n'est pas « la plus ancienne ». Le compte « 4 sur 12 » dit ce
que le filtre a retenu.

**Les colonnes viennent du tableau Notion de Noé** (7 août 2026), qui servait
de carnet avant le hub : Nom, Type, Relation, Rattaché à, Instagram, E-mail,
Téléphone. Le « dernier échange » a été retiré à sa demande.

La colonne qui fait le CRM est **Relation**, avec sa progression :
`Pas de contact → Message envoyé → Contact établi → Bon contact` — gris, bleu,
doré, vert (l'ordre de couleurs de Noé, corrigé le 7 août). Elle se
change dans la cellule même — c'est le geste le plus fréquent d'un CRM, il ne
mérite pas un formulaire — et se **trie sur la progression, pas sur
l'alphabet** : « Bon contact » est un aboutissement, pas un début. Aucun de
ces statuts ne signale une alerte.

Les valeurs portent des **étiquettes colorées** comme dans Notion : une teinte
stable par valeur, calculée sur le texte, pour que « Rennes » garde sa couleur
d'une visite à l'autre. Douze teintes bien réparties — il ne s'agit que de
distinguer.

Contacts cliquables partout (Instagram, `mailto:`, `tel:`). L'identifiant
Instagram est accepté avec ou sans arobase, ou collé en URL entière. **Un
contact peut porter plusieurs comptes ou adresses**, séparés par une barre
oblique — le carnet de Noé en contient — et chacun devient son propre lien.

Types : joueur, club, média, **agence**, marque, autre. Les agences sont
arrivées avec la seconde moitié du carnet : ce ne sont ni des médias ni des
marques, ce sont des intermédiaires.

**L'échelle de relation s'est allongée** (12 août) sans rien perdre :
`pas de contact → message envoyé → relancé → répondu → contact établi →
bon contact → opportunité`. « Bon contact » est conservé — on ne remplace pas
ce qui marche.

### `#yuno/passerelle` — la Passerelle *(sa page)*

**Elle a quitté le carnet le 12 août, à la demande de Noé.** `#yuno/reseau` est
devenu un palier avec deux portes : le carnet est un **fonds où l'on cherche**,
la Passerelle une **file où l'on agit**. Les mêler sur un écran obligeait à
basculer entre les deux pour rien. Les deux pages gardent l'onglet Réseau
allumé, et les commandes restent sur le palier.

Elles partagent la même base — `baseContacts()` filtre, cherche et trie pour
les deux. Noé avait déjà construit son pipeline relationnel sans le nommer ; on
ajoute la couche qui pousse à l'action.

- **La file d'action de la semaine**, groupée par micro-dose : **1 Répondre**
  (des messages reçus qui attendent), **2 Relancer** (des relations vivantes à
  entretenir), **3 Ouvrir** (des portes à pousser). La peur du rejet ne se
  contourne pas, elle s'entraîne — d'où la gradation. Un contact entre dans la
  file quand on lui donne un niveau, depuis la colonne « Niveau » du tableau.
- **Dans la file, une case vide passe DEVANT**, au rebours du tableau :
  « jamais écrit » est ce qui attend le plus, pas ce qui est le plus ancien.
- **La seule métrique : les messages envoyés** — cumul et « cette semaine »,
  déduits d'un journal (une ligne = un envoi). **La table `journal_envois` n'a
  pas de colonne « répondu », et c'est délibéré** : si le compteur dépendait des
  réponses, chaque silence deviendrait un rejet mesuré. Ne jamais afficher de
  taux de réponse ni de compte de non-réponses.
- **« Envoyé ✓ »** enregistre l'envoi, date la fiche et fait avancer la
  relation. **Une relation vivante ne redescend jamais** : écrire à quelqu'un
  qui a répondu ne le ramène pas à « relancé ».
- **L'objectif doux** (défaut 1 envoi/semaine, réglable, dans le
  `localStorage`) se dit une fois atteint — « C'est fait pour cette semaine » —
  et se tait en dessous. Un plancher rassurant, jamais une dette.
- **La bibliothèque de modèles** : la friction du premier message est le
  principal mur de l'aller-vers. Titres et corps s'éditent en place, un bouton
  copie le texte pour le coller ailleurs. Quatre modèles de départ, chargés en
  base : accréditation concert, premier contact club, proposition à un média,
  relance courtoise.

Champs ajoutés à une fiche, tous facultatifs : `objectif` (pourquoi ce contact),
`niveau` (1–3), `date_dernier_envoi` — **distinct de `dernier_echange`** : un
envoi est un effort à soi, un échange est bidirectionnel — `prochaine_action` et
`prochaine_action_date`, qui portent la relance au calendrier.

**Les contacts eux-mêmes ne sont pas dans ce dépôt.** Ce sont des données
personnelles réelles (numéros, comptes) et le dépôt est public : elles vivent
uniquement dans Supabase, derrière la connexion. Seul le schéma est versionné.

### `#yuno/reseau` — les commandes *(section, plus un onglet)*

**Une commande naît d'une relation** : elle n'a pas besoin d'un onglet à elle,
et le sien a disparu le 12 août. Titre, client (relié à une fiche du carnet
quand le nom y figure), statut, échéance, montant facultatif, lien du livrable,
notes.

Le cycle va du devis au paiement : `devis → en cours → livrée → payée`.
**Livrer crée une victoire ; encaisser n'en crée pas une seconde** — c'est le
même travail, et l'argent est une conséquence, pas un juge. Les livrées et
payées se replient en bas, comme le backlog. Une commande à échéance apparaît
au calendrier (Yuno et hub).

### `#yuno/preparations` — les Préparations *(construites le 14 août 2026)*

Préparer une sortie — match, concert, commande — avec des modèles. Une
**feuille de préparation** porte trois phases de cases à cocher (**Avant** ·
**Pendant**, la liste des plans photo · **Après**), puis un **bilan** en deux
questions : « Ce qui a marché » et « À refaire autrement ».

- **Elle naît de la sortie** : la fenêtre de détail d'un événement ou d'une
  commande, au calendrier Yuno, porte « Préparer » — ou « Ouvrir la
  préparation » si la feuille existe déjà. La tuile d'une commande, dans
  Réseau, porte le même bouton. C'est là qu'on est la veille d'un match ;
  l'outil vient à soi. La liste des feuilles vit sur `#yuno/preparations`,
  atteinte par une porte discrète au Journal (l'onglet Journal reste allumé :
  préparer et vivre sont les deux faces du même axe terrain).
- **Créer une feuille COPIE le modèle.** Modifier le modèle ensuite ne réécrit
  pas les feuilles passées : le bilan d'octobre doit refléter ce qui était
  prévu en octobre.
- **Avec plusieurs modèles, le choix s'ouvre en fenêtre volante** — une liste,
  jamais un menu natif — qui offre aussi la feuille vierge. Avec un seul
  modèle (ou aucun), pas de question : la feuille se crée tout de suite.
- **Les modèles s'éditent depuis le site** (`#yuno/modeles/<id>`, portes en bas
  de la liste) : le nom et les items se corrigent en place — comme les modèles
  de messages de la Passerelle —, une ligne s'ajoute par phase, se retire à la
  croix. Un champ vidé reprend son texte : une ligne sans texte se retire, elle
  ne se vide pas. Supprimer un modèle laisse les feuilles intactes (copies, et
  `modele_id` en SET NULL).
- **Un item ajouté en cours de feuille peut entrer « aussi au modèle »** : une
  case à côté du champ d'ajout, décochée à chaque fois — entrer au modèle est
  une décision par item, pas un réglage. C'est la boucle d'apprentissage : le
  modèle s'enrichit du terrain.
- **Un item non coché n'est JAMAIS un raté.** Aucun compteur de manqués, aucun
  pourcentage de complétion, nulle part. Le bilan dit d'abord l'obtenu.
- **Le bilan attend la date de la sortie**, puis s'écrit et se réécrit. À la
  feuille suivante du même modèle, le dernier « à refaire autrement » se relit
  en tête — c'est là que le bilan paie. **Cocher toute la feuille ne crée pas
  de victoire** : la victoire d'une sortie, c'est le moment logué au carnet.
- **Le bilan inscrit le moment au carnet** (idée de Noé, 14 août 2026). Au
  premier enregistrement, le formulaire propose la photo, les rencontres, et
  une case « Noter ce moment au carnet » **cochée d'avance** — le chemin normal
  ne demande rien de plus, mais Noé reste l'auteur. Le moment naît **lié à
  l'événement** (`moments.evenement_id`), avec la date et le lieu de la
  feuille, et son **type hérité de l'événement** : un événement photo porte sa
  pastille « type de moment » (match · concert · sortie · autre) à la création
  — dans la tuile du site, et dans celle du hub où elle n'apparaît que si le
  projet choisi est photo. Jamais de doublon : si le moment de la sortie existe
  déjà, la proposition disparaît (« Ce moment est au carnet »), et l'invite du
  Journal se tait par le même lien. Ensuite, le moment se corrige au Journal,
  pas depuis le bilan.

---

## 5. Les données

Les tables du hub servent déjà : `objectifs`, `taches`, `evenements`,
`victoires` (projet `photo`). Le schéma complet, colonne par colonne, vit dans
`supabase/migrations/` — **ce dépôt est le gardien unique du schéma Supabase**,
et ce paragraphe ne fait que dire à quoi sert chaque table.

| Table | Ce qu'elle porte |
|---|---|
| `publications` | le calendrier éditorial. `date_prevue` NULL = banque d'idées. Colonnes Yuno : `pilier`, `preuve`, `pourquoi_moi` (NULL pour le FCH) |
| `contacts` | le carnet réseau, et la couche Passerelle (`objectif`, `niveau`, `date_dernier_envoi`, `prochaine_action`, `prochaine_action_date`) |
| `commandes` | le suivi, du devis au paiement. `client_id` relie au carnet |
| `evenements` | **une sortie, deux faces** — prévue (date, lieu, `type_moment`) et vécue (`vecu`, `photo_chemin`, `note`, `oeuvre_finie`). C'est le Carnet de terrain depuis la fusion du 14 août 2026 ; la table `moments` a disparu |
| `rencontres` | qui a été rencontré, à quelle sortie (`evenement_id`). `contact_id` facultatif |
| `journal_envois` | un envoi = une ligne. **Aucune colonne « répondu »** |
| `stats_hebdo` | un rendez-vous = une ligne. `reponse_rituelle` est NOT NULL |
| `modeles_messages` | la bibliothèque de messages à personnaliser |
| `modeles_preparation` · `modeles_preparation_items` | les modèles de préparation (« Match »…) et leurs items par phase |
| `preparations` · `preparations_items` | une feuille par sortie — items copiés du modèle, bilan en deux questions dessus |

Trois choix de schéma portent l'intention, et ne se défont pas sans la défaire :

- **Les compteurs ne sont stockés nulle part.** Les trois du Carnet et les deux
  de la Passerelle se déduisent de faits accumulés — qui ne peuvent que monter.
- **`journal_envois` n'a pas de colonne « répondu ».** On mesure l'effort,
  jamais le silence.
- **`stats_hebdo.reponse_rituelle` est NOT NULL.** Un relevé de chiffres sans la
  question qui les remet à leur place n'a pas de valeur.

RLS et politiques identiques aux autres tables : tout réservé au rôle
`authenticated`.

**Les données de Yuno ne sont pas dans ce dépôt** — ni les contacts (données
personnelles réelles), ni les 15 idées de départ, ni les modèles de messages
(la stratégie éditoriale et les cibles). Elles ont été chargées directement
dans Supabase en SQL. Seul le schéma est versionné.

---

## 6. Ce que le hub montre de Yuno

Le rappel quotidien vit sur le dashboard, pas ici :

- les tâches actives et la progression des objectifs photo — déjà en place ;
- les victoires Yuno — déjà en place ;
- **les publications datées de la semaine**, dans « Ta semaine », au même rang
  que les événements — à brancher quand la table `publications` existera.

---

## 7. Ce qu'on ne construit pas (encore)

Hors périmètre de « Terrain » v1.1, explicitement :

- **La partie perso** — le chantier contrôle et prise de risque. Il aura son
  espace séparé. Le système actuel n'a pas à jouer ce rôle : il doit juste ne
  rien aggraver.
- **L'assistant IA (API Claude)** pour proposer des hooks et des bases de
  légende — v2 de la Vitrine. Il proposera, Noé choisira et retravaillera.
  **Jamais générer le contenu à sa place** : une IA qui écrirait tout
  nourrirait son doute (« est-ce vraiment moi ? ») au lieu de le réduire.
- **L'API Instagram** et toute automatisation de publication.
- **Les notifications push.**
- **L'export/import JSON global** : le brief le demandait en supposant un
  `localStorage`. Tout vit dans Supabase, qui est déjà la sauvegarde — différé
  faute d'utilité.

Et, de la version précédente, toujours valable :

- **Compta** : le jour où les revenus arrivent, ce sera une vraie question.
- **Suivi automatique des abonnés Instagram** : techniquement possible
  (compte créateur relié à une Page Facebook, app Meta, jeton longue durée à
  renouveler ~60 jours, Edge Function Supabase pour garder le jeton hors du
  site public). De la tuyauterie réelle pour un chiffre — et le rendez-vous
  hebdomadaire vaut justement par le geste de saisie. Différé.
- **Gestion de fichiers photo** : les photos vivent dans Lightroom et sur les
  disques ; ici, des liens et des états.

---

## 8. La direction longue (pour éclairer les choix futurs)

Elle vient du document « pourquoi » et ne se lit nulle part dans le code :

- **Une pratique qui ralentit.** Moins d'œuvres, plus profondes : séries
  documentaires, expositions, tirages, un livre. Le modèle « créateur qui poste
  à vie » est un véhicule vers des objectifs précis, pas la destination.
- **La vidéo viendra par la porte douce.** Le Reel-diaporama est la passerelle
  choisie : techniquement de la vidéo, 100 % de la photo. **Ne jamais pousser
  une fonctionnalité qui présuppose du tournage ou du face-caméra.**
- **Les jalons concrets** : la CAN 2027 (le compte CAF Media Channel existe ;
  une lettre de mission d'un média congolais est la voie d'accréditation d'un
  freelance), l'OM au Vélodrome, une première accréditation concert, un premier
  produit presets quand les contenus « How I edited » généreront des demandes.

---

## 9. Questions restantes

**Deux, ouvertes au 12 août 2026 :**

1. **Le vocabulaire du cycle éditorial.** Le brief dit « posté », le hub dit
   « publié » partout ailleurs. « Publié » a été gardé pour la cohérence, et le
   mot de clôture dit bien « C'est posté ». À trancher à l'usage.
2. **Les cartes de la Passerelle qui manquent encore.** Léopards Leader et
   BoomSportRDC sont en niveau 2, l'OM en niveau 3. Restent à créer, faute de
   noms réels : la ou les salles de concert visées (objectif : une première
   accréditation), et les clubs que Noé veut cibler à froid — les quatre déjà
   au carnet sont des contacts établis, donc du niveau 2, pas du 3.

Le reste a été tranché. Les cinq écrans du site sont construits : Accueil,
Journal, Créer, Calendrier, Réseau. Prochaine étape : l'usage réel.
