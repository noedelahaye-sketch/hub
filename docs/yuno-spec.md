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
   *(« Œuvre finie » est masquée depuis le 15 août 2026 — voir §4. Le principe
   ne change pas ; c'est sa troisième mesure qui s'est révélée futile à
   l'usage.)*
2. **Les réseaux sont une vitrine, pas une résidence** — on dépose l'œuvre, on
   repart. Les stats avaient un rendez-vous hebdomadaire, jamais un fil continu ;
   depuis le 15 août 2026 elles n'ont plus d'écran du tout (§4).
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
abonnés, portée) **nulle part** — le rendez-vous stats qui en était la seule
exception a été retiré le 15 août 2026 ; aucun taux de réponse ni compte de
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
valeurs mesurées sur le fichier), **plus le violet depuis le 15 août 2026** :
c'est la troisième couleur du site (décision de Noé), après le gris foncé du
fond et le doré. Chacune a son rôle, et c'est ce qui les empêche de se marcher
dessus :

| Couleur | Ce qu'elle dit |
|---|---|
| Gris foncé | le fond, le calme, tout ce qui accompagne |
| **Or** `#e8b000` | l'état actif, les chiffres, l'action qui part |
| **Bleu** `#7198f4` | la **matière créative** — les idées, le chemin qui les mène à une date |

Il vit **chez Yuno seulement** (décision de Noé, 15 août 2026) : la variable
est déclarée sur `body[data-espace="yuno"]`, pas dans la racine — le hub et le
FCH gardent leurs deux couleurs. On le voit sur les numéros d'étape du pipeline
de Créer et le filet d'entrée de la banque ; il ne prend jamais la place de
l'or, car un numéro d'étape n'est ni un état actif ni un chiffre qui compte.

**La couleur d'identité et le classement viennent de la même famille** : la
troisième couleur est la tête de l'échelle bleue (222°), les quatre piliers en
sont la queue (§3). Elle est prise assez haut pour **se lire en texte** — 6,34
sur le fond, 5,53 sur une carte ; le violet essayé d'abord plafonnait à 3,7,
sous le seuil pour un texte, ce que les numéros d'étape sont.


| Rôle | Valeur | Note |
|---|---|---|
| Fond | `#181818` | Le fond du logo. |
| Accent | `#e8b000` | Le doré du Y, dominant. |
| Texte fort | `#ffffff` | Le blanc du logotype. |

Règle de contraste : le doré pur vit sur fond sombre — et il n'a plus besoin
d'autre chose. **Le hub est sombre en permanence depuis le 28 août 2026**
(décision de Noé) ; l'ocre `#8f6c00`, qui servait au doré en thème clair, a
disparu avec lui. Le logo (avec la Belhanda manuscrite) s'affiche en tête de
l'espace, rond, zoomé sur le mot.

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

**Les chiffres du site sont en Gilroy Heavy** (15 août 2026, demande de Noé :
« une police un peu plus grasse et qui se marie mieux »). Ils étaient en Geist
Mono — la police du hub, et la seule qui n'appartienne ni à Canela ni à Gilroy :
deux polices se marient, trois se croisent. Le rôle ne change pas, il se
confirme : un compteur est une **mesure**, domaine de Gilroy.

**Le Heavy est plus lourd que le Black**, contrairement à ce que l'ordre des
noms laisse croire — et il a fallu le **mesurer**, les deux fichiers déclarant
`usWeightClass=400` et la même avance. En comptant les pixels encrés d'un même
chiffre à 120 px : Bold 7 916, Black 9 745, **Heavy 10 616**. Il est déclaré en
900 (la graisse la plus lourde que le site sert) et ne pèse que 39 Ko en WOFF2.

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
| Barre du calendrier (titre) | **Google Sans** | romain | 400 (600 pour un événement) | 0,6875 rem |
| Corps, date, statut | Gilroy | romain | 400 | — |
| Chiffre | Geist Mono | — | — | via `.chiffre` |

**LA BARRE DU CALENDRIER A QUITTÉ GILROY LE 1er SEPTEMBRE 2026**, et c'est une
règle du HUB qui l'emporte ici, pas une décision de Yuno : les trois calendriers
partagent `.cal-barre-titre`, et le hub y a posé **Google Sans** — la police
distingue désormais les trois natures par sa seule graisse (événement 600, tâche
400), au lieu du fond coloré qui les distinguait avant. Voir CLAUDE.md et
l'état des lieux. **Le site ne surcharge rien**, et c'est volontaire : un
calendrier qui se lirait autrement selon l'écran obligerait à réapprendre le
même objet deux fois. Gilroy garde tout le reste de l'utilitaire.

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
| « Œuvre finie » — rare, et c'est ce que le site célèbre *(masquée depuis le 15 août 2026)* | Les liens survolés |

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
voulu — ce pilier *est* le cœur doré de l'espace.

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

**Pour vérifier sur un appareil** : ouvrir Créer et regarder « De la matière ».
Si l'accent est incliné comme le reste du mot, la vraie Canela est là ; s'il est
droit, c'est la police de secours. *(Le repère était « À venir » jusqu'au
15 septembre 2026 ; ce bloc a quitté la page.)*

---

## 4. Les écrans

**Deux surfaces, décision de Noé (7 août 2026).** Il faut avoir l'impression
de *sortir du hub* en entrant chez Yuno :

- **`#photo` — la page Yuno du hub.** Un tableau de bord réduit : le cap en
  lecture, l'aperçu création, une capture d'idée au vol, les victoires, et la
  porte « Entrer sur le site Yuno ». Habillage du hub conservé. Rien ne s'y
  gère. *(Elle n'a plus d'onglet depuis le 28 août 2026 : on y entre par le
  grand titre « Yuno » du menu, qui donne aussi ses objectifs, ses projets, ses
  tâches et la porte du site. **Le menu ne perce pas le site** — ni le Carnet,
  ni le Réseau, ni le Vivier n'y figurent : « si je clique sur le hub ce n'est
  pas pour atteindre le site Yuno et tout ce qu'il contient » (Noé). Voir
  `CLAUDE.md`, « La navigation a deux rangs ».)*
- **`#yuno` — le site Yuno.** Tout l'habillage du hub disparaît : ni logo Hub,
  ni onglets, ni autres espaces. **Plus d'en-tête du tout depuis le 14 août
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
banque d'idées (`#yuno/banque`), la Passerelle (`#yuno/passerelle`), le vivier
(`#yuno/vivier`), les modèles de messages (`#yuno/messages`) et le carnet
(`#yuno/carnet`) sont des pages à part entière, atteintes par une tuile depuis
leur palier, et qui gardent allumé l'onglet dont elles dépendent — Créer pour
la première, Réseau pour les autres. La vue s'appelle `messages` et non
`modeles` : ce nom-là était pris par les modèles de préparation, qui gardent
l'onglet Journal. Une barre de navigation ne
doit pas grandir à chaque écran qu'on ajoute. `ONGLET_DE_LA_VUE`, dans
`js/yuno.js`, dit quel onglet allumer pour quelle vue.

### LE MENU DU SITE (15 septembre 2026, demande de Noé)

**LA RÈGLE DES DEUX RANGS, APPLIQUÉE À YUNO.** Le paragraphe ci-dessus dit
comment on n'ajoute pas d'entrée à la barre ; il ne disait pas comment on
retrouve ce qu'elle ne nomme pas. Mesuré : **six entrées pour treize écrans** —
sept pages ne s'atteignaient que par une porte posée en PIED de leur onglet.
Rien ne disait ce que le site contenait.

**Le bouton à trois barres ouvre le second rang**, à gauche de la barre, comme
dans le hub. Quatre rubriques :

| Rubrique | Ses pages |
|---|---|
| **Le journal** (`#yuno/journal`) | Le calendrier · Les préparations · Les modèles de préparation |
| **Créer** (`#yuno/creer`) | La banque d'idées · Le calendrier éditorial |
| **Missions** (`#yuno/missions`) | Les commandes |
| **Réseau** *(un titre seul)* | La Passerelle · Le vivier · Le réseau · Les modèles de messages |

- **LES CINQ ONGLETS NE BOUGENT PAS** : ce sont les cinq gestes quotidiens de
  l'atelier. Le menu ne les remplace pas, il donne le rang du dessous — c'est la
  structure du hub, qui garde trois onglets ET vingt-quatre liens dans son menu.
  Une rubrique porte donc le nom de son onglet et mène à sa page, exactement
  comme « Perso » est à la fois un onglet et une rubrique du hub.
- **« RÉSEAU » EST LA SEULE RUBRIQUE QUI NE MÈNE NULLE PART**, et c'est le
  vocabulaire qui l'impose : « le réseau » désigne la base de fiches
  (`#yuno/carnet`) — « carnet » ne nomme que le Carnet de terrain. Une rubrique
  « Réseau » avec sa page ET une entrée « Le réseau » dessous aurait fait deux
  fois le même mot pour deux écrans. Elle reste un titre, comme « Général » dans
  le hub, et la Passerelle reprend son nom parmi ses quatre pages.
- **LE MÊME COMPOSANT QUE LE HUB, UNE AUTRE PEAU** (`monterLeMenu`, js/menu.js) :
  les plis, la fermeture au fond, Échap et le calage sous la barre sont les mêmes
  des deux côtés — deux mécaniques jumelles auraient fini par ne plus se replier
  pareil. Presque tout l'habillage suit tout seul, le menu étant écrit en
  variables que `body[data-espace="yuno"]` a déjà remplacées ; ne restent que la
  police (Canela) et la pastille d'espace, masquée — le site n'a qu'un espace, et
  quatre points de la même couleur ne distinguent rien.
- **LE MENU DU HUB NE PERCE TOUJOURS PAS LE SITE** : les rubriques de Yuno vivent
  dans `js/yuno.js`, pas dans `js/menu.js`. Le hub ne connaît pas les écrans du
  site ; c'est le site qui déclare les siens et emprunte le composant. La règle
  tient par les données, pas par le code.
- **LE BOUTON EST ÉCRIT DANS LA BARRE, pas posé après coup** : `.yuno-nav` est
  redessinée à chaque vue, et un bouton inséré au montage y disparaîtrait au
  premier changement d'écran. Le composant l'écoute en délégation, et retrouve la
  barre par une FONCTION — un élément gardé en mémoire et détaché du DOM mesure
  zéro, et le panneau se poserait alors en haut de l'écran.
- **IL COLLE AU BORD GAUCHE** (`sticky`), comme la loupe colle à droite : la
  barre défile quand elle déborde, et `centrerActif` la fait défiler d'elle-même
  — mesuré sur le vivier, le bouton sortait de l'écran.
- **CHANGER DE PAGE REFERME LE MENU**, quel que soit le chemin — un onglet, la
  flèche du navigateur, un balayage. *Le défaut ne s'est vu qu'une fois les deux
  menus servis par le même composant : celui du site restait déplié en quittant
  le site et se superposait à celui du hub.*

### LES ÉCRANS DU CAP, EMPRUNTÉS AU HUB (15 septembre 2026, demande de Noé)

**Sa correction, et elle était nette** : *« c'est pas du tout ça le fonctionnement
des objectifs sur le hub — ils ont une page entière juste pour eux. Il faut
également rajouter l'accès aux projets, donc ajouter une page dans le menu
déroulant qui regroupe tout ça. Une page générale avec mes objectifs, mes
projets, mes tâches, à l'image du hub. »* Puis, sur le comment : *« il faut que
ce soit mutualisé, mais avec la forme et la DA de Yuno pour ce qui apparaît dans
le site »*.

> *Ce que ça renverse, deux fois.* Les caps du site se dépliaient sur place — le
> gabarit partagé `construireObjectifs`, qui reste celui du FCH. Ils ont ensuite
> passé une heure en FENÊTRE VOLANTE, au motif que Yuno ne pouvait pas emprunter
> la page du hub sans sortir du site. **Le motif était faux** : on peut monter la
> page du hub DANS le site. La fenêtre est partie, et avec elle six gestionnaires
> devenus morts (ajouter, cocher, retirer un jalon ; marquer atteint ; supprimer)
> — ces gestes vivent maintenant sur la page du cap.

| Adresse | Ce que c'est |
|---|---|
| `#yuno/cap` | « Mon cap » — ses objectifs, ses projets, ses périodes |
| `#yuno/cap/caps` · `#yuno/cap/projets` | un étage à la fois |
| `#yuno/objectif/<id>` | la page entière d'un cap : jalons, **son calendrier**, le rail de ses projets |
| `#yuno/projet/<id>` | la page entière d'un projet : étapes, calendrier, tâches |
| `#yuno/taches` | « Mes tâches », **groupées comme le hub** — une occurrence par série |

**CE SONT LES MODULES DU HUB, MONTÉS DANS LE SITE** — `js/objectifs.js`,
`js/objectif.js`, `js/projet.js`, `js/taches.js`, quatre mille cinq cents lignes
qu'on ne recopie pas. Le site pose sa barre, un hôte (`vueDuCap`), son pied, et
laisse le module écrire dedans (`monterLeCap`). Il n'a fallu que trois choses :

- **`js/cap-adresses.js`** : les dix liens que ces modules écrivaient en dur
  (`#objectif/<id>`, `#objectifs/caps`…) sont devenus des fonctions. Depuis le
  site elles rendent `#yuno/…`, depuis le hub l'inverse.
  - **LA BASE SE DÉDUIT DU HASH, ELLE NE SE DÉCLARE PAS.** C'est la leçon de la
    barre du menu, le même jour : une VARIABLE de module aurait été partagée par
    les deux montages — le hub et le site vivent dans la même page — et le
    dernier monté aurait décidé pour l'autre.
  - **`#yuno` COMPTE AUTANT QUE `#yuno/…`** : l'accueil du site n'a pas de
    seconde partie, et c'est là que vivent ses tuiles de cap. *Mesuré : avec le
    seul préfixe `#yuno/`, elles renvoyaient vers le hub — un lien qui fait
    sortir du site sans le dire.*
- **Une garde sur l'habillage** : `#objectif/<id>` et `#projet/<id>` écrivent
  `document.body.dataset.espace` et le titre de l'onglet, pour prendre la couleur
  de leur espace. Dans le site, **ça faisait revenir tout l'habillage du hub** :
  elles ne touchent donc à rien tant qu'on y est.
- **La DA suit toute seule.** Ces écrans sont écrits en variables, et
  `body[data-espace="yuno"]` les a déjà remplacées par celles du site. Ne restent
  dans css/yuno.css que deux choses qu'aucune variable ne porte :
  - **la pastille d'espace se masque** — « Yuno » sur chaque tuile d'une page où
    tout est Yuno ne distingue rien, c'est le « Film » des fiches de la
    bibliothèque et le « en sommeil » des habitudes ;
  - **rien sur les polices**, et c'est la mesure qui l'a dit : le site habille
    déjà ces pages par ses propres titres (`#vue h1`, `#vue h2` en Canela,
    `#vue h3` en Gilroy). Une règle de plus se battait contre cette grammaire —
    et perdait, `#vue h3` portant un identifiant.
- **La page des tâches ne parle que du site** : montée filtrée sur Yuno, elle y
  perd sa rangée de filtres — offrir « FC Hermitage » depuis le site serait une
  porte vers un ailleurs qu'il n'ouvre jamais — et son sous-titre dit « pour
  Yuno » plutôt que « tous espaces ».

**LE MENU PORTE UNE RUBRIQUE « MON CAP »** — c'est la structure du hub, où ces
écrans sont des pages réunies par le menu. La galerie compare des caps et des
projets ; la page des tâches ne cache rien et range. Les empiler sur un écran en
aurait fait une page qu'on fait défiler.

**TROIS LIGNES DESSOUS DEPUIS LE 15 SEPTEMBRE 2026 AU SOIR** (demande de Noé :
*« dans le menu déroulant mon cap, rajoute les pages mes objectifs, mes
projets »*) : **Mes objectifs · Mes projets · Mes tâches**. Le grand titre mène
toujours à la page entière, les trois galeries d'affilée. Ce sont les noms du
hub, au mot près — un nom par page, des deux côtés.

> *Ce que ça a demandé, et ça renverse une règle écrite le matin même.* La page
> générale du site **n'avait pas de sous-vues** : « le site n'en montre que les
> siens — les trois étages tiennent sur un écran ». Le motif tenait tant que la
> page était seule dans le menu ; **deux entrées qui mèneraient toutes deux à
> `#yuno/cap` seraient deux liens identiques**, et trois liens identiques ne sont
> pas un menu — c'est exactement l'argument qui a découpé `#objectifs` dans le hub
> le 28 août. La page entière reste, à son adresse nue ; les deux étages
> s'ouvrent chacun à la sienne.

- **L'ÉTAGE VIT AU TROISIÈME SEGMENT** (`#yuno/cap/caps`) là où le hub le porte
  au second (`#objectifs/caps`) : le site a déjà consommé le premier pour se
  nommer. Même traduction que pour `#yuno/objectif/<id>`, et `js/cap-adresses.js`
  la fait — les liens « Tous les objectifs » et « Tous les projets » des pages du
  cap y mènent donc, comme dans le hub.
- **RIEN N'EST RECOPIÉ** : c'est la galerie du hub, qui sait découper ses étages
  depuis le 28 août (`route.vue`). Le site ne fait que lui passer l'étage lu dans
  l'adresse. Un nom d'étage inconnu ne casse rien — la galerie retombe sur ses
  trois étages.
- **LA BARRE NOMME L'ÉTAGE**, elle aussi : sans ça, elle aurait dit « Mon cap »
  sur les trois, et ç'aurait été un nom dans le menu et un autre en tête de page.
- **ET LE TITRE NE SE DIT PLUS DEUX FOIS.** *Défaut trouvé en construisant, et
  antérieur : sur `#yuno/taches`, la barre écrivait « Mes tâches » et le module
  monté le réécrivait quarante pixels plus bas.* Le `h1` du module se tait sur les
  deux écrans dont il n'est QUE le nom de la page — la galerie et les tâches. **Les
  deux autres le gardent** : sur `#yuno/objectif/<id>` et `#yuno/projet/<id>`, il
  porte le nom du cap ou du projet, ce que la barre ne dit pas et ce qu'on est venu
  lire.

**CE QUI RESTE À L'ACCUEIL** : les tuiles de cap, inchangées d'allure — titre,
date, marches, prochain jalon —, mais devenues des LIENS vers leur page.

### LES VITRINES DES PORTES (15 septembre 2026, demande de Noé)

**UNE PORTE MONTRE CE QU'IL Y A DERRIÈRE.** C'est la leçon du hall de la
bibliothèque du hub, puis de celui du perso : « Le vivier · Les 97 clubs, par
compétition » était une ligne de menu dessinée en grand — le nom de la page et
son mode d'emploi, deux choses qu'on savait déjà.

| Porte | Sa vitrine | Son compte |
|---|---|---|
| **Le vivier** | six **écussons**, tirés du jour | 97 clubs · 9 contactés |
| **Le réseau** | les **trois dernières fiches**, dans la couleur de leur type | 53 fiches |
| **La banque d'idées** | trois **idées tirées du fonds** | 18 idées à fouiller |
| **Le calendrier éditorial** | les **trois prochaines parutions**, date en tête | Poser sur les jours |
| **Les préparations** | la **feuille de la prochaine sortie**, sa phase, ce qu'il y reste | 3 feuilles, et leurs modèles |

**LE TEST, le même que pour le hall** : une porte doit dire quelque chose qu'on
IGNORE avant de l'ouvrir — quels clubs dorment au vivier, qui vient d'entrer,
quelle idée oubliée remonte, ce qui part cette semaine, quelle feuille attend.

- **CHAQUE VITRINE A LA FORME DE SA PAGE**, et c'est ce qui la distingue d'un
  compteur : des écussons, des visages, des phrases, des dates. Un chiffre de
  plus aurait été plus simple à écrire et n'aurait rien dit que le compte ne
  disait déjà.
- **DEUX VITRINES TIRENT AU SORT** — le vivier et la banque —, avec **la graine
  du jour du mur de photos** : « le tirage est stable dans la journée, la date
  sert de graine, rien n'est stocké ». Par ordre alphabétique on verrait l'AC
  Milan jusqu'à la fin des temps, alors que le vivier compte 97 clubs sur huit
  pays ; et le mot de la banque est « fouiller », ce qu'un tirage fait mieux que
  les trois dernières posées.
- **LES ÉCUSSONS SE CHEVAUCHENT**, comme les couvertures d'un rayon du hub :
  serrés, ils disent « il y en a beaucoup » mieux qu'une rangée espacée.
  **SANS BULLE SOMBRE depuis le 15 septembre 2026 au soir** (demande de Noé :
  *« fais superposer les logos sans qu'ils soient intégrés dans des bulles
  noires »*). Le rond était là pour une raison — les logos sont détourés, et deux
  blasons clairs qui se touchent ne disent plus où finit le premier — mais il
  enfermait chaque club dans une pastille, et la rangée se lisait comme six
  jetons plutôt que comme une pile d'écussons. **Ce qui le remplace : une ombre
  portée**, qui suit la SILHOUETTE du logo au lieu de dessiner un disque autour —
  un contour, pas une bulle. Et le chevauchement passe de 6 à 10 px.
- **UNE VITRINE VIDE SE TAIT** : sans sortie préparée, la porte ne montre que son
  métier. Un « aucune feuille » écrirait un manque là où il n'y a rien à
  reprocher — un vide ouvre une porte, il ne s'excuse pas.
  *L'éditorial fait exception depuis le 15 septembre au soir : sa frise se
  dessine même vide, parce que sept cases vides MONTRENT le trou là où une tuile
  muette ne montrait rien. Voir « La frise de la semaine » plus bas.*
- **LA PORTE EST DEVENUE UNE COLONNE**, et **LA VITRINE PASSE DEVANT LE TITRE
  depuis le 15 septembre 2026 au soir** (demande de Noé : *« mets le titre de la
  tuile en dessous des schémas, logos… »*). **C'est la grammaire d'une légende**,
  et elle dit mieux ce qu'une porte est devenue ce jour-là : on regarde ce qu'il y
  a derrière, puis on lit où ça mène. *Le titre en tête faisait de la vitrine une
  illustration posée sous un libellé — l'ordre exact que la refonte des portes
  voulait renverser, puisqu'une porte doit dire ce qu'on IGNORE avant de
  l'ouvrir ; son nom, on le connaît déjà.*
  L'ordre est donc : la **vitrine**, la **tête** (icône et titre), le **métier**.
  C'est la TÊTE qui porte désormais le `margin-top: auto` : le nom et le métier
  font un bloc collé au bas, la vitrine occupant tout ce qui reste au-dessus —
  sans ce report, une vitrine courte laissait un trou SOUS le titre, et deux
  portes voisines écriraient leur nom à deux hauteurs différentes.
  **Le changement vaut pour les CINQ portes du site** : c'est un seul composant,
  et deux portes de deux dessins n'en feraient plus une grammaire.
- **ET LA TUILE A MAIGRI DANS LA FOULÉE** (demande de Noé, le même soir : *« réduis
  la taille de ces tuiles »*). C'est la vitrine en tête qui l'a permis : **une
  porte n'a plus besoin de respirer autour d'un libellé, elle montre.**
  Rembourrage, écarts et corps descendent d'un cran, rien n'est supprimé, et la
  frise perd 8 px de case. *Mesuré : 134 px de haut, ramenés à 107.* Les portes du
  Réseau et des Missions, qui étaient des liens à filet (`.lien-externe`),
  reprennent cette forme : cinq portes de deux dessins n'en feraient plus une
  grammaire.
- **La phase d'une feuille vient de `phaseDeLaSortie`**, celle qui commande déjà
  la carte de l'accueil : deux façons de dire où en est une sortie finiraient par
  ne plus dire la même chose.

### LES TUILES N'ONT PLUS DE CONTOUR (15 septembre 2026, demande de Noé)

La règle du hub, posée le 30 août : **une tuile posée dans la page se distingue
par sa SURFACE.** `--fond-carte` (#242426) sur `--fond` (#181818) est un écart
franc ; le filet ne fait que redire ce que la couleur dit déjà, et dix filets
sur un écran finissent par le quadriller. Cinq familles le perdent : les grandes
portes, les piliers, la métrique de la Passerelle, les tuiles de préparation et
l'invite à loguer un moment.

**Ce qui garde son trait**, et chaque cas a sa raison : les tuiles de la fiche
d'un club, posées DANS une fenêtre où deux surfaces se ressemblent trop pour se
séparer seules (l'exception du hub) ; `.carte-jour`, dont le contour est DORÉ —
ce n'est pas le trait neutre que la règle vise, c'est un accent qui dit la
vedette de l'écran ; les contrôles et les étiquettes, dont le contour EST le
dessin ; les filets de séparation, qui ne cernent rien mais coupent.

**« Créer » et « Calendrier » sont deux choses (décision du 7 août).**
« Créer » regroupe le calendrier éditorial et les futurs outils d'aide à la
création. « Calendrier » recense tout ce qui porte une date chez Yuno —
publications, tâches, événements, objectifs et jalons — avec des filtres par
nature. Le hub a le même espace Calendrier, tous espaces confondus
(`#calendrier`).

### `#yuno` — l'accueil du site

**Elle montre et elle ouvre des portes ; elle ne gère rien** (décision de Noé,
12 août).

#### REFONDUE LE 15 SEPTEMBRE 2026 : deux blocs fixes, et un classement

**LA DEMANDE DE NOÉ** : *« repense à comment elle doit être organisée, quelles
informations doivent y être, quels liens il doit y avoir… ça peut être des
tuiles / des informations dynamiques, qui changent en fonction de ce qui est le
plus pertinent à tel moment. »*

**LE DÉFAUT, MESURÉ AVANT DE TOUCHER À QUOI QUE CE SOIT.** Ce jour-là, la page
affichait : **pas de sortie du moment** (aucune sortie à venir, la dernière
remontant au 28 août), le mur, deux tuiles de cap, et un titre « En création »
**au-dessus du vide** (zéro publication programmée). *Deux blocs sur quatre
étaient vides* — pendant que le site portait 18 idées, 16 tâches ouvertes, trois
feuilles de préparation et 88 clubs jamais contactés sur 97, dont l'accueil ne
disait rien.

**Le défaut n'était pas un oubli, il était STRUCTUREL** : la page était dessinée
autour du terrain, or **Yuno vit par PICS** — une sortie, le tri, le post, puis
trois semaines de silence. `sortieDuMoment` ne regarde que 48 h devant. Les
jours de pic, l'accueil était excellent ; les autres jours, c'est-à-dire la
plupart, il ne disait rien.

> **LA RÈGLE : l'accueil n'a que DEUX blocs fixes — le mur et le cap. Tout le
> reste est un CLASSEMENT.**

Une **carte chaude** en tête, tirée d'une cascade ; **trois portes** choisies
dans une réserve, selon ce que les données disent. La page ne change pas de
forme, elle change de contenu — c'est ce que faisait déjà la sortie du moment,
seule à porter tout le mouvement de l'écran. **Et elle n'est jamais muette** :
le dernier rang de la cascade a toujours quelque chose à dire.

**CE QUE ÇA RENVERSE, et il faut le dire** : *« l'accueil ne porte plus aucune
porte »* (12 août 2026), au motif que « ces deux lieux sont dans la barre ». Le
motif était juste quand la barre nommait tout le site. Depuis le menu du matin
même, **le site compte dix-sept écrans pour cinq onglets** — et l'accueil est le
seul endroit d'où l'on puisse dire lequel des douze autres compte aujourd'hui.
**Les portes qu'il ouvre sont justement celles que la barre ne nomme pas.**

**LA CASCADE — le premier rang satisfait gagne, et il est SEUL** (la mécanique
du bandeau de l'après du hub : « un seul à la fois »). Deux cartes chaudes
empilées, ce sont deux interruptions.

| Rang | Elle apparaît quand | Ce qu'elle montre |
|---|---|---|
| 1 | une sortie est **en cours**, ou finie depuis < 24 h | *(inchangé)* la phase, les trois lignes qui restent, cochables |
| 2 | une sortie **dans les 48 h** | sa feuille, ou « Préparer » |
| 3 | une **commande** non livrée à échéance ≤ 7 j | le livrable qui attend, et pour qui |
| 4 | un **post né d'un match**, encore en « idée », < 7 j | « il attend son texte » |
| 5 | **la fournée de la semaine n'est pas faite** | trois clubs · « 9 sur 97 contactés » |
| 6 | sinon | **un match à couvrir** |
| 7 | repli | **l'idée du jour** |

- **LES 48 H DU RANG 2 NE BOUGENT PAS** (décision de Noé, le jour même — sept
  jours avaient été proposés, il a maintenu le seuil). C'est `AVANT_MONTE_A`, le
  seuil du site depuis le 26 août : **la carte de préparation reste le signal du
  JOUR du match**, et ce sont les rangs du dessous qui portent les jours creux.
- **LE RANG 5 OUVRE DÈS LE LUNDI ET NE SE FERME QUE QUAND C'EST FAIT** (règle de
  Noé : *« chaque lundi ça doit être la fournée de la semaine tant que c'est pas
  fait, l'objectif de la semaine non-atteint »*). Le test est celui de la
  Passerelle, au mot près — les envois de la semaine contre l'objectif doux —, et
  son bandeau dit déjà « C'est fait pour cette semaine » dessus. **Aucune borne
  haute, aucune semaine manquée comptée** : le lundi suivant, le compteur repart
  et la carte revient.
- **CONSÉQUENCE ASSUMÉE, ET ELLE EST BELLE** : la fournée est le rang le plus
  souvent vrai, donc **le match à couvrir ne se montre qu'une fois le rituel
  passé**. Ce n'est pas un défaut de l'ordre que Noé a posé, c'est ce qu'il
  produit — **le terrain devient la récompense du rituel**, et l'accueil ne
  propose de sortir que quand la semaine a ouvert ses portes. *Si le rang 6 ne se
  voit jamais à l'usage, c'est ce classement-là qu'il faut rouvrir, pas la règle
  du lundi.*
- **LE RANG 6 EST CELUI QUI N'EXISTAIT PAS.** La table `matchs_pistes` porte
  3 314 matchs ; ils ne servaient qu'à décorer une carte du vivier. Or la
  **première** question d'arbitrage de « Terrain » est *« est-ce que ça augmente
  le temps dehors ou le temps dedans ? »* — et un accueil qui, un jour creux,
  propose un match à aller shooter est la seule chose de ce site qui y réponde oui
  sans réserve. **C'est aussi ce qui remplace, sans jamais l'écrire, le « 18 jours
  sans sortie » qu'on s'interdit d'afficher : on ne compte pas le creux, on
  l'ouvre.** **Les Léopards d'abord** (l'accroche éditoriale du vivier, le pont
  vers la CAN 2027), puis le tirage du jour. Un match **déjà au calendrier** ne se
  propose pas, et il se reconnaît au club et à la date, jamais au titre.
  Son geste est celui de la fiche d'un club, au trait près (`data-poser-match`) :
  la tuile s'ouvre déjà remplie, Noé corrige le jour et l'heure avant de poser —
  un match du calendrier officiel n'a souvent pas d'horaire.
  - **PLUS DE SEPT JOURS DEVANT — J+8 à J+21** (règle de Noé, 15 septembre 2026
    au soir : *« il faut que ce soit un match plus loin dans le temps, au moins
    + de 7 jours »*). Trois jours, le réglage d'origine, ne laissaient pas le
    temps de ce qu'une sortie demande : écrire au club, demander une place, poser
    le déplacement. **Une proposition qu'on ne peut pas saisir n'est pas une
    proposition.** La borne haute recule d'autant (14 → 21) : sans elle, la
    fenêtre serait tombée à une seule semaine de candidats.
  - **ELLE A CHANGÉ DE SOURCE AU PASSAGE, et c'est la mesure qui l'a dit.** La
    carte lisait `piste.prochain`, servi par `prochain_match_par_piste` — LE match
    le plus proche de chaque club. Or **un club joue chaque week-end** : passée à
    J+8, la fenêtre ne trouvait plus **aucun** candidat, les « prochains » tombant
    tous dans les sept jours. Elle lit donc `api.matchsEntre`, un match par
    affiche, **chargé avec les pistes** — une requête de plus dans une salve déjà
    parallèle, donc aucun aller-retour supplémentaire, et un match ne se lit
    jamais sans son club.
  - **UNE CROIX REFUSE LA PROPOSITION** (même demande : *« avoir la possibilité de
    refuser la proposition pour que ça affiche le cran d'après »*) : le tirage en
    rend un autre, et **quand le vivier n'en offre plus, la cascade descend d'un
    rang** toute seule. Elle n'écarte rien d'autre — le match reste au calendrier
    du club, la piste au vivier, et la fiche du club continue de le proposer :
    c'est une place à l'écran qu'on reprend, pas un match qu'on raye. D'où le
    `localStorage` plutôt que la base, comme la croix de la sortie du moment.
    **La clé porte la DATE** (`<piste>:<jour>`) et non le seul club : refuser un
    match ne refuse pas le club pour toujours, et la ligne **se périme d'elle-même**
    quand le jour est passé — le ménage se fait à la lecture, ce qui évite qu'une
    liste de refus grossisse sans fin dans le navigateur.
- **LE RANG 7 EST LE MÊME TIRAGE QUE CRÉER**, et c'est ce qui autorise les deux
  écrans à le montrer : `ideeDuJour` est UNE fonction, avec la date pour graine.
  Les deux cartes ne peuvent pas dire deux idées différentes. Celle de l'accueil
  est un aperçu qui ouvre la page ; les gestes vivent là-bas.

**LES TROIS PORTES DU JOUR**, choisies dans une réserve de sept. Les vitrines
sont **celles des paliers, empruntées et non recopiées**.

| Porte | Elle monte quand |
|---|---|
| **Préparations** | une feuille attend pour une sortie à venir |
| **Mes tâches** | il reste des tâches ouvertes |
| **Calendrier éditorial** *(le trou)* | **rien n'est programmé à 7 jours** |
| **Le vivier** | des clubs n'ont jamais été contactés |
| **Missions** | une commande est ouverte |
| **Calendrier éditorial** *(ce qui part)* | la semaine porte des parutions |
| **Banque d'idées** · **Le réseau** | *toujours* |

- **Une porte qui n'a rien à dire ne monte pas** : la rangée du jour est un
  classement, pas un inventaire. **Le test porte sur les DONNÉES, jamais sur la
  vitrine** — depuis que la frise se dessine même vide, elle ne peut plus servir
  de test à la porte qu'elle habille.
- **Jamais deux portes de la même rubrique**, sinon un jour chargé au Réseau
  mangerait la rangée.
- **La banque et le réseau ferment la réserve** : ce sont les deux qui ont
  toujours quelque chose à montrer, donc les deux qui ne doivent jamais passer
  devant une urgence.
- **Le calendrier éditorial figure DEUX FOIS, et les deux s'excluent** : une
  semaine SANS rien de programmé est une information qui passe devant presque
  tout — c'est le trou qu'un calendrier éditorial est fait pour montrer —, une
  semaine pleine n'est qu'un rappel. Même porte, deux rangs.
- **Pas d'icônes**, à la différence des portes de Créer : la vitrine EST le
  visuel de la tuile.
- **La vitrine des tâches replie les séries** — une occurrence par série, la plus
  proche (règle de l'espace Tâches du hub, 27 août). *Elle se paie comptant :
  mesuré sur les données de Noé, le compte disait « 16 ouvertes » là où c'est
  **une** chose qui revient seize fois.*

**LA FRISE DE LA SEMAINE** (15 septembre 2026 au soir, demande de Noé : *« j'aime
pas trop ces tuiles, dans la forme et dans le contenu pour mes tâches et
calendrier éditorial qui sont trop vides ; je ne sais pas trop comment améliorer
mais que ce ne soit pas que du texte, à l'image du vivier »*).

**Il a raison, et le pire des deux se voyait le mieux** : une porte dont la
vitrine est faite de LIGNES DE TEXTE n'a plus rien à montrer dès qu'il n'y a
qu'une ligne — ou zéro. L'éditorial n'affichait rien du tout, et la règle « une
vitrine vide se tait » le laissait comme une boîte d'air sous son titre.
*Se taire est juste quand il reste autre chose à regarder ; ici il ne restait
rien.*

**LA FRISE DESSINE LE VIDE AU LIEU DE SE TAIRE** : sept cases, les sept jours qui
viennent, une marque par chose posée. Une semaine sans rien n'est plus une tuile
vide, c'est **un calendrier à remplir dont le trou se voit** — ce qu'un
calendrier éditorial est précisément fait pour montrer.

- **LES DEUX PORTES LA PARTAGENT**, et c'est assumé : elles répondent à la MÊME
  question — qu'est-ce qui est posé sur les jours qui viennent. **Ce qui les
  distingue est la MARQUE, pas le dessin** : dorée pour une tâche, à la couleur
  de son pilier pour une parution. *Ça infléchit la règle des vitrines (« chaque
  vitrine a la forme de sa page ») : la page des tâches est une liste, pas un
  calendrier. Mais elle se range par échéance, et une semaine en est une lecture
  juste — tandis qu'une liste de titres dans une tuile de cette taille n'était
  qu'une phrase de plus.*
- **UNE MARQUE REMPLIT SA CASE**, et se partage quand il y en a plusieurs : un
  jour qui porte quelque chose est PLEIN, ça se voit avant d'être lu, et les
  subdivisions disent combien. *Un trait de 5 px au fond d'une case de 30,
  essayé d'abord, se perdait.* Trois au plus : au-delà, la case est pleine et un
  trait de plus ne se compte plus du regard.
- **Aujourd'hui se repère sans se nommer** — sa case est un cran plus claire.
  Sept cases identiques ne diraient pas où l'on se tient dans la semaine.
- **La MÊME vitrine sert la porte de Créer** : une porte ne se dessine pas deux
  fois.
- **ELLE VIT DANS `js/gabarits.js` DEPUIS LE 16 SEPTEMBRE 2026**, et non plus dans
  `js/yuno.js` : l'accueil du site du club la reprend pour ses propres portes, et
  **une vitrine ne se dessine pas deux fois**. Rien n'a changé de son dessin — elle
  se peint à `--accent`, doré ici, jaune du club là-bas, *sans rien savoir de son
  site*. Le nom de la fonction ne bouge pas (`friseDeLaSemaine`) ; seul son import
  change.
- **Elle s'appelle `.porte-frise` et non `.porte-semaine`**, et ce nom-là a été
  payé comptant : `.porte-semaine` EST DÉJÀ le bouton doré « Programmer ma
  semaine » de l'accueil du hub, dans une feuille chargée sur les trois pages.
  *Mesuré : un bandeau doré plein, les sept cases écrasées à 6 px et les
  initiales par-dessus.*

**LE CAP EN PIED, EN GRAVURES** (décision de Noé, le même jour : *« le cap en
pied, change un peu la forme par rapport à actuellement pour que ce soit plus
visuel »*).

**POURQUOI EN PIED** : la leçon que le hub a tranchée deux fois — le cap passé
sous la journée le 13 août, les périodes qui ferment `#objectifs` le 28 — *« on
relit ce qui cadre quand on lève la tête, pas en ouvrant l'application »*. Et
depuis le matin même, le cap a sa PAGE dans le site : l'accueil n'en garde que la
gravure. **Ça ne contredit pas « du cap vers le contenu » (§2)** : cette règle
dit ce que l'espace sert en premier, pas ce qui est en haut de l'écran.

**CE QUI TUE LA FORME D'AVANT, mesuré** : les deux caps de Yuno portent **sept
jalons dont aucun n'est atteint**, et aucun n'est daté. Deux rangées de marches
vides l'une sous l'autre, c'est un accueil qui s'ouvre sur deux zéros. **La
gravure ne montre donc jamais un pourcentage : elle nomme la marche suivante et
l'allume.**

Trois choses en font une gravure plutôt qu'une tuile :

- **le titre en Clash Display** — la police des noms de créations du site ;
- **une seule marche en or à la fois, la suivante** — celle que la légende nomme
  juste en dessous (`marquerSuivant`, js/objectifs-commun.js, une option pour que
  rien ne bouge dans le hub ni au FCH). L'or est déjà « l'état actif, l'action qui
  part » chez Yuno : l'œil tombe sur la marche à faire, pas sur les trois qui
  manquent ;
- **et RIEN D'AUTRE** : ni pourquoi, ni cible, ni description.

**LE POURQUOI A VÉCU UNE HEURE ICI**, et il est reparti le soir même (Noé :
*« trop de texte pour les objectifs, pas besoin du texte descriptif, réduis un
peu la taille globale »*). Le motif d'origine se tenait — il est écrit en base et
ne se lit nulle part ailleurs sur le site — **mais il se trompait d'écran** :
quatre lignes de prose en pied d'un tableau de bord, c'est un paragraphe qu'on ne
relit jamais et qui pousse le reste hors de vue. *Un pourquoi se relit les jours
sans motivation, c'est-à-dire sur SA page, où l'on est venu exprès.* La gravure
ne garde que ce qui se **compare** d'un cap à l'autre : le nom, l'horizon, la
marche suivante, et l'argent quand il y en a.

**ELLE A MAIGRI D'AUTANT** : titre d'un cran plus bas (1,125 rem — à 1,375 il
pesait autant qu'un `h1` de page), rangs serrés, marches à 10 px au lieu de 12.
*Mesuré : 286 px de haut à 151.*

**PAS DE COMPTE À REBOURS** : « juin 2027 » cadre, « dans 288 jours » presse.

**L'ARGENT EST DANS LA GRAVURE** (demande de Noé, le même jour) : « 1 115 € sur
5 155 € », avec sa jauge. C'est la seule mesure du cap de Yuno qui ait bougé, et
une gravure muette à côté d'une gravure chiffrée aurait été bancale. Le texte
vient de `mesuresDuCap` — celui que la page `#photo` du hub affiche déjà, mot
pour mot — et la part du même calcul : deux comptes pour un même remboursement
finiraient par ne plus dire le même reste. **La jauge ne se dessine pas à zéro**
(règle du hub : une série à zéro ne s'affiche pas) — une barre vide se lit comme
un reproche là où le texte dit simplement où en est le compte.

**RIEN NE S'Y RÈGLE, et c'est un retour à la règle de la page.** Le menu discret
(modifier · marquer atteint · supprimer) et la tuile « Ajouter un objectif » sont
partis avec les tuiles : **ces gestes vivent sur `#yuno/cap`**, la galerie du hub
montée dans le site le matin même, qui les porte tous. *Et ça répare un défaut
qu'on ne voyait pas : ces écouteurs étaient posés sur la SECTION, donc ils
attrapaient aussi les clics venus des écrans du cap montés dedans — un menu à
trois points pressé sur `#yuno/cap` déclenchait le rendu de Yuno, qui réécrit la
section et remonte le module sous les doigts.*

**CE QUE ÇA COÛTE** : quatre lectures de plus à l'accueil — `pistes`, `envois`,
`taches`, `materiel` —, **et elles servent toutes à DÉCIDER de ce que la page
montre**, aucune n'est décorative. Trois des quatre étaient déjà lues par
d'autres écrans du site, et le cache de session vaut pour tout le site : les
payer à l'accueil, c'est les rendre gratuites ensuite.

**L'ACCUEIL NE GÈRE TOUJOURS RIEN**, à l'entorse près qui existait déjà : cocher
une ligne de préparation au bord du terrain.

**CE QUI A DISPARU** : le bloc « En création » comme bloc fixe (il redevient la
porte du calendrier éditorial, qui se tait quand elle n'a rien à dire, au lieu
d'un titre au-dessus du vide) et le titre « Objectifs » (deux gravures de cap
n'ont pas besoin qu'on annonce que ce sont des caps).

**LES SEPT RANGS ET LE CLASSEMENT SE VÉRIFIENT HORS ÉCRAN** : `carteDuMoment`,
`portesDuJour`, `rituelAFaire`, `clubsDuRituel`, `matchACouvrir` et
`tachesEnTete` sont exportées et ne touchent ni au réseau ni à la session. Sept
rangs qui se bousculent, c'est exactement le genre de règle qu'on ne croit pas
sur parole.

#### Le détail des blocs


**Ni compteurs, ni bouton de capture depuis le 14 août 2026** (demande de Noé) :
les compteurs — moments vécus · rencontres, et « œuvres finies » jusqu'au
15 août 2026 — et
« Ajouter une sortie » vivent désormais **au Journal seulement**, qui est la
page du carnet. L'accueil s'ouvre directement sur le mur. La capture s'y
atteint toujours par l'invite, ou par le « + » flottant dont la tuile porte la
nature Moment.

0. **La carte du moment** — en tête, avant le mur (demande de Noé, 14 août
   2026). Elle **change avec l'heure**, et c'est ce qu'on lui demande : le jour
   d'un match, ce qui compte n'est ni le mur ni les objectifs, c'est ce qu'il
   reste à faire. *Depuis le 15 septembre 2026, la sortie du moment n'en est que
   les deux premiers rangs : la cascade en compte sept, et le dernier a toujours
   quelque chose à dire — voir plus haut.* Ce qui suit décrit ces deux rangs-là.

   Il montre la sortie **en cours**, celle qui **vient de finir** (moins de
   24 h) ou la **prochaine** — dans cet ordre, qui est celui du temps : une
   sortie commencée passe devant une sortie à venir, y compris le lendemain
   d'un match, parce que pendant ces 24 h le travail c'est trier et retoucher.
   Passé ce délai, **le rang suivant de la cascade prend la place** : le carnet a
   pris le relais de la sortie, et l'accueil a autre chose à dire.

   Avec lui, **la phase courante de sa feuille de préparation** — Avant ·
   Pendant · Après — et **les trois premières lignes qui restent à faire**,
   plus le compte s'il y en a davantage. Tout coché, il le dit une fois et se
   tait. Un lien ouvre la feuille ; si la sortie n'en a pas encore, le bloc
   porte « Préparer » à la place.

   **Une croix le retire de l'accueil** (demande de Noé, 15 août au soir),
   **juste après la date et sur sa ligne d'écriture** — un mot de plus au bout
   de la phrase, séparé par un seul blanc. Petite à l'œil, 44 px au doigt : sa
   zone tactile déborde en transparent, sans pousser la date d'un pixel. Elle ne supprime RIEN : la feuille reste entière à
   sa page, la sortie reste au calendrier — c'est la place à l'écran qu'on
   reprend, pas le travail qu'on efface. Le choix vaut pour cette sortie-là ; la
   suivante reprendra la tête de l'accueil. Comme le « Plus tard » de l'invite,
   il vit dans le `localStorage` (clé `yuno-prepas-ecartees`, distincte de celle
   des invites : écarter une préparation ne veut pas dire écarter une invite) et
   non en base — c'est un choix d'écran, pas un fait sur la sortie. Discrète au
   repos, franche au survol : elle est là quand on la cherche, elle n'appelle
   pas.

   **Les lignes se cochent depuis l'accueil** (demande de Noé, 14 août 2026).
   C'est la seule entorse à « l'accueil ne gère rien », et elle se défend : au
   bord du terrain, on n'ouvre pas une page pour dire qu'on a chargé les
   batteries. Le cercle est le même bouton que partout — même coche dessinée,
   même cible de 44 px — et l'écriture part derrière, comme ailleurs.

   La fin d'une sortie, quand la colonne ne la dit pas, suit deux conventions
   déjà posées ailleurs plutôt que d'en inventer : minuit veut dire « pas
   d'heure » (la sortie tient alors jusqu'au soir), et un événement qui porte
   une heure dure deux heures — la valeur que propose la tuile.

1. **Le mur de photos** — sous elle, une **frise sur une seule
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

   **Les trois paliers ont été rétablis le 14 août 2026** (demande de Noé), et
   **pour la frise de l'accueil seulement**. Le 12 août, le CSS était passé à
   cinq sur téléphone — la frise tombait à 87 px de haut au lieu de 149, elle en
   montrait plus et prenait moins de place. À l'usage, cinq vignettes de 65 px
   de large sont trop petites pour qu'on reconnaisse la photo : une frise
   illisible ne montre rien, quel que soit le nombre d'images qu'elle aligne. Le
   palier des cinq reste pour la tablette. **Le mur du Journal, lui, garde ses
   cinq colonnes sur téléphone** (voir plus bas) : les deux murs ne comptent
   plus pareil, et c'est voulu.

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
   une **fenêtre volante avec le détail de la sortie**. Ouvrir une image nue
   dans un onglet vide ne disait rien de ce qu'on avait vécu ce jour-là. Même
   fenêtre depuis l'accueil et depuis le Journal.

   **Son ordre, arrêté le 15 août 2026** (demande de Noé) : l'en-tête (type,
   date, et le crayon rangé près de la croix de fermeture), **la photo**, puis
   le titre, le lieu, les rencontres, la note et le bilan. La photo passe devant
   parce que c'est elle qu'on vient revoir ; la faire attendre sous trois lignes
   de texte revenait à la traiter comme une pièce jointe.

   **On n'y retire plus rien** (même jour) : la fiche se lit et se corrige, le
   **carnet** est l'écran où l'on range.
4. **Les trois portes du jour** — voir le classement plus haut.
5. **Le cap, en gravures** — en pied : le nom, l'horizon, la marche suivante en
   or, et l'argent du matériel. Voir plus haut.

> *Ce que les points 4 et 5 remplacent, depuis le 15 septembre 2026 :* un bloc
> « Objectifs » en tuiles au milieu de la page, et un bloc « En création » qui ne
> montrait que le programmé — donc, ce jour-là, un titre au-dessus du vide. La
> phrase « l'accueil ne porte plus aucune porte » (12 août) est tombée avec eux :
> elle valait quand la barre nommait tout le site.

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

### Un match fait naître son post (29 août 2026)

Demande de Noé : *« après chaque évènement match yuno, il faut programmer un post
sur le match à J+1. »* C'est la troisième chose que le hub pose lui-même à partir
d'un événement, après la préparation à J−2 et le tri des photos à J+1 — et **la
première qui ne soit pas une tâche** : une parution n'est pas du travail à
cocher, elle vit au calendrier éditorial avec son réseau, son format et son cycle
d'états.

- **La pastille « match » est une DÉCLARATION**, comme « photos » l'est pour le
  tri. Le hub ne devine pas qu'une sortie est un match : un concert et une séance
  n'appellent pas le même post.
- **Elle naît en `idee`, sur Instagram et en carrousel.** Le hub programme la
  parution, il n'écrit pas à la place de Noé — et le carrousel parce qu'un match
  donne plusieurs images.
- **APRÈS COUP, comme le tri**, et c'est la même règle que `vecu` juste au-dessus
  : un post posé d'avance sur un match où Noé n'ira pas est une promesse fausse.
  Conséquence assumée — la parution naît le jour même où elle est prévue. Si
  l'anticipation manque à l'usage, c'est cette décision-là qu'il faudra rouvrir,
  pas la date.
- **Supprimer un match ne supprime pas son post** : `publications.evenement_id`
  est en `ON DELETE SET NULL` là où celui des tâches est en CASCADE. Une
  préparation n'a aucun sens sans son événement ; une publication en a un — elle
  peut être partie, porter son lien, compter dans un bilan.
- **Yuno seulement.** Le club a son propre calendrier éditorial, nourri par sa
  chaîne à trois états ; rien n'a demandé qu'un entraînement y fasse naître une
  parution.

Le mécanisme vit dans `poserCeQuUnEvenementFaitNaitre` (js/api.js) — voir
CLAUDE.md pour les trois automatismes réunis.

- **Le mur, entier** (décision de Noé, 12 août 2026). Sous les compteurs, le
  même mur qu'à l'accueil — mêmes emplacements en 3:4, même recadrage — avec
  deux différences qui sont tout l'écart entre les deux pages : **rien n'est
  tiré au sort** et **rien n'est caché**. Toutes les photos, de la plus récente
  à la plus ancienne, sur autant de lignes qu'il en faut. On vient au Journal
  chercher une photo qu'on a prise ; on ne s'y laisse pas surprendre. La règle
  du « une seule ligne » appartenait à l'accueil, où ce qui suit la frise doit
  rester sous les yeux.

  **Les colonnes, elles, ne sont plus les mêmes** (demande de Noé, 14 août
  2026) : le Journal en garde **cinq sur téléphone** quand l'accueil est passé
  à trois — dix au-delà de 1080 px pour les deux. La raison est celle qui
  sépare les deux pages : l'accueil MONTRE trois photos qu'on n'a pas
  demandées, elles doivent se reconnaître d'un regard ; le Journal est
  l'archive où l'on CHERCHE une photo précise, et on la balaie d'autant mieux
  qu'il y en a plus à l'écran. En CSS, deux familles de règles séparées
  (`:not(.mur-complet)` d'un côté, `.mur-complet` de l'autre) plutôt qu'une
  base commune : à spécificité mêlée, un palier de l'une écrasait celui de
  l'autre.
- **La capture** s'ouvre en **fenêtre volante**, comme au calendrier — le geste
  est le même partout dans le hub. **Elle pose une TÂCHE par défaut depuis le
  31 août 2026** — décision prise pour tout le hub ; la vue éditoriale garde
  « Publication », et si les SORTIES devaient rester le défaut du site, c'est
  une ligne dans le seul appel de `natureParDefaut` de `js/yuno.js`.
  **C'est le « + » flottant qui l'ouvre**
  (demande de Noé, 14 août 2026) : sur cette page il ne pose pas une date, il
  ouvre « Ajouter une sortie » directement — comme sur les pages du réseau, où
  il ouvre une fiche. Le bouton dédié qui vivait à gauche des compteurs a
  disparu : le « + » est là où le pouce arrive, et il ne bouge pas quand la
  page défile. **Il se retire dès qu'une fenêtre est ouverte** (demande de Noé,
  15 août au soir) : son gros rond doré flottait par-dessus la fiche d'un club,
  au coin où l'on ne peut rien en faire. Une fenêtre est un moment où l'on
  regarde UNE chose ; rien n'a à s'ajouter par-dessus. Elle demande une date, un type (match · concert · sortie ·
  autre), le nom de la sortie, et en facultatif le lieu, les rencontres, une
  photo, une note. Deux champs suffisent — elle doit
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
  par une URL signée. Retirer une sortie du carnet efface son fichier.

  **Les URL sont signées UN MOIS et réutilisées 25 jours** (décision de Noé,
  21 août 2026 — le mail de Supabase : la bande passante du plan gratuit
  partait presque toute dans les photos). Elles duraient une heure et se
  refabriquaient à chaque visite : des adresses neuves à chaque fois, donc un
  navigateur incapable de resservir son cache — il retéléchargeait des photos
  qu'il avait déjà. Le garde-manger vit dans le `localStorage`
  (`yuno-photos-signees`, dans `api.urlsDesPhotos`) ; les 5 jours de marge
  couvrent l'onglet resté ouvert, et `SIGNATURE_UTILE` (le cache d'écran de
  Yuno) pointe sur la même constante pour ne jamais diverger. Le coût, assumé :
  un lien qui fuirait vivrait un mois au lieu d'une heure — les photos restent
  privées, sans lien le bucket ne répond pas.

  **La photo est réduite AVANT l'envoi** (`reduirePourLeCarnet`, resserrée le
  21 août 2026 : 1600 px de côté long, JPEG 0,82 — elle était à 2400 px/0,85).
  1600 px couvrent un plein écran de téléphone Retina ; le hub montre le
  souvenir, le fichier de boîtier reste chez Noé. Une image déjà sous la barre
  mais au-dessus de 500 Ko est ré-encodée quand même : un JPEG peu compressé de
  1500 px pesait 2 Mo et partait tel quel — c'est lui qui coûtait, pas les
  grandes images. Sous la barre ET légère, elle passe intacte. Le bucket garde son nom (`moments`) :
  c'est un nom de stockage, pas un mot d'interface, et le renommer casserait
  les chemins déjà écrits en base.
- **Le fil est une LISTE, plus des cartes** (demande de Noé, 14 août 2026) :
  le carnet est fait pour s'allonger, et cinquante sorties en cinquante cartes
  deviennent un mur qu'on ne parcourt plus. Une ligne dit la date, le nom de la
  sortie et trois marques minuscules — le type, une photo jointe, le nombre de
  rencontres, plus « Œuvre » quand il y en a une. **La date s'écrit en toutes
  lettres pour l'année en cours** (« 05 août ») **et en chiffres pour les années
  d'avant** (« 31/12/25 ») : dans l'année courante l'année ne dit rien et une
  date lisible vaut mieux ; passé le 31 décembre elle devient l'information
  principale, et la forme chiffrée la porte sans allonger la ligne. La police
  suit les trois leviers — Geist Mono est pour ce qui se lit comme un code, pas
  pour « 05 août », qui reste en Gilroy. Le titre se coupe plutôt que
  de passer à la ligne : une liste qu'on parcourt garde une hauteur constante.
  **Le clic ouvre la fiche entière**, comme la banque d'idées et le réseau ; le
  crayon y vit. **La croix de retrait, elle, est sur la ligne** (15 août 2026) —
  à côté d'elle et non dedans, la ligne étant déjà un bouton et deux boutons ne
  s'imbriquant pas. C'est le seul endroit du site où l'on retire une sortie du
  carnet : on range là où l'on voit ce qu'on retire, au milieu du reste. Rappel
  de ce que le geste veut dire depuis la fusion — la face vécue s'efface,
  **l'événement reste au calendrier**. Sur téléphone l'étiquette de type
  s'efface : la place manque, et la fiche la redit.
- **« Œuvre finie » est masquée** (15 août 2026, décision de Noé : « l'utilisation
  me paraît très futile »). Elle comptait le travail d'atelier mené jusqu'au
  bout — une série triée, retouchée, achevée — et venait de la distinction
  fondatrice entre l'écran-atelier et l'écran-refuge. Ce qui l'a tuée à l'usage
  se lit dans ses chiffres : **0 sur treize sorties**. C'était la seule des
  trois mesures qui demandait de revenir cocher une case des jours après la
  sortie, quand le tri et la retouche étaient finis — le geste n'arrivait
  jamais. Le drapeau `OEUVRE_VISIBLE` de `js/yuno.js` commande d'un seul endroit
  le compteur, les deux formulaires, l'étiquette de la fiche et la marque du
  carnet ; **la colonne `oeuvre_finie` garde ses valeurs**, et le repasser à
  `true` rallume tout. Même façon de faire que `VICTOIRES_VISIBLES` au hub.
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
  relie tout seul à sa fiche ; un inconnu garde un « + » à côté de son nom. La
  capture ne s'arrête jamais pour ça.
- **Le « + » OUVRE la fiche complète, il ne l'écrit plus** (demande de Noé,
  14 août 2026). Il posait une fiche qui ne portait qu'un nom, et il fallait
  aller la retrouver dans le réseau pour dire qui était cette personne. Il
  ouvre maintenant le formulaire du réseau, **le nom déjà écrit**, la relation
  sur **« contact établi »** (ils se sont vus en vrai) et le **dernier échange
  au jour de la sortie** — pas au jour où l'on remplit la fiche. Tout se
  renseigne donc au moment où l'on s'en souvient : type, rattachement,
  Instagram, mail, téléphone, notes. La fenêtre ne se ferme qu'une fois la
  fiche écrite : un échec réseau garde la saisie, comme tout formulaire.

### `#yuno/creer` — l'atelier d'inspiration

Le calendrier éditorial et la banque d'idées, une seule matière à deux états :
**une idée est une publication sans date**. Noter une idée prend cinq
secondes ; la programmer, c'est juste lui donner une date.

#### UNE IDÉE EST UN FORMAT, PAS UN CONTENU À FAIRE UNE FOIS (16 septembre 2026)

**La règle, posée par Noé** : *« une idée doit être reproductible, ce n'est pas
seulement un contenu à faire une fois — par exemple le avant/après est
reproductible plusieurs fois, donc une fois qu'il a été fait il ne doit pas
disparaître. Cependant il peut y avoir des publications qui sont moins
répétables, par exemple mon histoire, mon matériel. »*

**CE QUE ÇA RÉPARE, ET C'ÉTAIT UNE CONFUSION DE MODÈLE.** Programmer une idée
posait sa date **sur sa propre ligne** : l'idée DEVENAIT la parution, donc elle
quittait la banque, et une fois publiée elle n'y revenait jamais. « How I edited
this pic : avant / après » se refait dix fois ; il sortait de la réserve à la
première. *La phrase « une idée est une publication sans date » reste vraie de
ce qu'on ÉCRIT — elle était fausse de ce qu'on FAIT.*

**LA RÉPONSE EST CELLE DES SÉRIES DU HUB** (27 août 2026) : *« les occurrences
sont de VRAIES lignes »*. Programmer un format fabrique une **parution** — une
publication datée, ordinaire, qui vit au calendrier, compte dans les bilans et
porte son lien — et **le format reste dans la banque, intact**. `idee_mere_id`
relie les deux.

- **POURQUOI PAS UNE TABLE DE PARUTIONS À PART** : le calendrier éditorial, le
  bilan du dimanche et « Mon temps » lisent tous `publications.date_prevue`. Une
  seconde table aurait demandé de les réécrire tous pour un gain nul — **une
  parution EST une publication, elle a juste une mère.**
- **REPRODUCTIBLE PAR DÉFAUT**, et c'est l'ordre des mots de Noé : une idée EST
  un format ; celle qui ne se refait pas est l'exception qu'on déclare. Les
  lignes existantes passent donc toutes à `true` — sans effet, le drapeau ne se
  lisant que sur une ligne SANS date.
- **SEULE L'EXCEPTION PORTE UN MOT** — une étiquette creuse « une seule fois ».
  Écrire « reproductible » sur dix-huit idées ne distinguerait rien : c'est la
  leçon d'« en sommeil », qui s'affichait sur les neuf habitudes à la fois.
- **LE RÉGLAGE VIT DANS LA FICHE**, pas sur la ligne de la banque : on le pose
  en écrivant l'idée et on n'y revient presque jamais. Il ne s'offre pas sur une
  ligne DATÉE — une parution n'est pas un format.
- **LA PARUTION NAÎT EN « IDÉE »**, jamais au statut de sa mère : le format peut
  être rodé, la photo de la semaine reste à faire. C'est la règle du post d'un
  match — *« le hub programme la parution, il n'écrit pas à la place de Noé »*.
- **ELLE PORTE `reproductible = false`.** Sans ça, la déprogrammer la renverrait
  dans la banque comme un second format, jumeau du premier, et **la banque
  doublerait à chaque aller-retour.** *Conséquence assumée : « Repasser en idée »
  sur une parution la ramène bien en banque, marquée « une seule fois », à côté
  de son format. Elle s'y supprime.*
- **UN SEUL CHEMIN POUR LES TROIS GESTES** qui datent une idée — le coin de la
  carte du jour, le champ de sa fiche, le glissement dans le calendrier
  éditorial. Trois copies auraient fini par ne plus dupliquer de la même façon,
  et c'est dans la copie oubliée qu'un format se remettrait à disparaître.
- **PARUE ET PROGRAMMÉE NE SE COMPTENT PAS ENSEMBLE**, et c'est le premier
  défaut qu'a montré l'essai : une parution posée au 24 septembre se disait
  « 1 fois parue · la dernière le 24 sept. », **au futur**. La trace dit donc
  « 3 fois parue · la prochaine le 24 sept. », et elle se tait tant qu'un format
  n'a rien donné — *« 0 fois parue » serait la première chose qu'on lirait d'une
  idée neuve.*
#### LA BANQUE SE TRIE ET SE FILTRE (16 septembre 2026)

**Demande de Noé** : *« rajoute un mode de tri et de filtre comme on a fait
ailleurs, par rapport aux différents paramètres. »*

**C'EST LA BARRE DE LA BIBLIOTHÈQUE, au trait près** — une recherche, deux
icônes, et la rangée de critères qui se déplie. *Écrire un troisième dessin pour
un geste qui en a déjà un, c'est fabriquer la divergence qu'on passe ensuite à
rattraper.* Les classes restent `.livres-*` : ce sont celles de la BARRE, pas
celles d'un livre — même argument que `.livre-*` gardé pour l'étagère des films.

**CE QUE ÇA REMPLACE** : deux menus natifs, « Pilier » et « Statut », à choix
**unique**. « Les réels ET les stories » est une question qu'on se pose, et un
choix unique ne savait pas y répondre ; **le réseau, le format et la nature d'une
idée n'étaient filtrables nulle part.**

| Critère | Ce qu'il retient |
|---|---|
| **État** | idée · à développer · brouillon · prêt |
| **Pilier** | les quatre axes, plus « sans pilier » |
| **Réseau** | Instagram, TikTok… |
| **Format** | carrousel · réel · story |
| **Nature** | reproductible · contenu unique |

Et cinq tris : **par défaut · titre · pilier · état · format**.

- **ON N'OFFRE QUE CE QUI EXISTE**, avec son compte : un critère à une seule
  valeur ne filtre rien et ne s'affiche pas. *Au 16 septembre, la banque ne
  montre que trois critères — les vingt idées sont toutes sur Instagram, toutes
  au statut « idée » et toutes reproductibles.* Un filtre « TikTok » sur une
  banque qui n'en a aucun serait une porte sur une pièce vide.
- **« PAR DÉFAUT » EST UN ORDRE**, pas une absence de tri : la dernière notée en
  tête, parce qu'une idée fraîche est celle qu'on vient d'avoir et qu'on veut
  retrouver.
- **LE MÊME TRI RETOUCHÉ SE RETOURNE** — le geste d'un en-tête de colonne, qui
  évite un second bouton pour le sens.
- **LA RECHERCHE COURT SUR LE TITRE, LES NOTES ET LA PREUVE** : on cherche
  « presets » aussi souvent qu'un titre exact. Elle filtre à la lettre, sans
  bouton, et **le curseur revient au bout du mot** — on redessine à chaque
  frappe, et sans ça le champ perdrait le focus au premier caractère.
- **LE COMPTE RESTE DEHORS, sur l'icône** : *vérifié — un filtre posé puis la
  rangée refermée, l'icône porte toujours son « 1 ».* Un filtre qu'on ne voit
  plus est une banque qui ment sur ce qu'elle contient.
- **UN PIÈGE PAYÉ EN ROUTE** : `construireBanque` reclassait la liste par date
  juste après le tri choisi. **Le tri par titre ne se voyait pas du tout**, et le
  geste paraissait sans effet. Une option `ordreDonne` dit désormais que
  l'appelant a déjà trié.

#### LA TUILE D'UNE IDÉE SE LIT DU HAUT VERS LE BAS (16 septembre 2026)

**Demande de Noé** : *« je préférerais que les pastilles des piliers, du réseau
et du type de publication soient en dessous du titre, et que la pastille d'état
soit au-dessus, avec un bouton pour programmer — et lorsque c'est programmé ça
affiche la date. »*

    « How I edited this pic »           ← ce qu'elle EST
    Instagram · Carrousel               ← ce qui la CLASSE
    (3) Dans l'œil du photographe
    programmée le 25 sept.
    [Idée]  [Programmer]                ← ce qui se RÈGLE

**ET ÇA RANGE LA TUILE PAR CE QU'ON EN FAIT.** Avant, les trois mentions de
classement ouvraient la tuile et repoussaient le titre : **on lisait « INSTAGRAM
CARROUSEL 3. DANS L'ŒIL… » avant de savoir de quelle idée il s'agissait.**

- **LE BOUTON ANNONCE ET REND COMPTE** : vide il dit « Programmer », posé il dit
  le jour. C'est **la pastille de date de la fiche**, partagée — un même geste ne
  se dessine pas de deux façons. Le champ natif est transparent par-dessus, donc
  le sélecteur s'ouvre partout sans `showPicker()`.
- **ET IL FABRIQUE UNE PARUTION** quand l'idée est un format : *vérifié depuis la
  tuile — la parution part au 25 septembre, le format reste en banque et affiche
  « programmée le 25 sept. ».*
- **LA CASSE SUIT CELLE DE L'ÉTAT** — bas-de-casse, sans écartement. Noé n'a
  demandé que l'état ; mais les deux sont des CONTRÔLES posés côte à côte, et
  deux casses voisines pour deux boutons de même rang seraient le défaut qu'on
  vient de corriger. **Les étiquettes du bas gardent leurs capitales** : on les
  lit, on ne les presse pas.
- **LE CLASSEMENT COLLE AU TITRE** (correction de Noé, le même jour) : il dit ce
  que cette idée EST, et ça se lit dans la foulée du nom. *Poussé au bas de la
  tuile, il devenait un pied de page dont on ne savait plus qu'il qualifiait le
  titre — cette place-là revient aux RÉGLAGES.* Huit pixels l'en séparent — à quatre, la première étiquette se collait
  à la dernière ligne du titre et se lisait comme un mot de plus.
- **PLUS DE ROUGE SUR « IDÉE »** (16 septembre 2026, demande de Noé : « j'aime
  pas que idée soit en rouge, change le dégradé de couleur de l'état »). La rampe
  passe de **rouge → ambre → vert** à **indigo → cyan → vert** : cinq crans chez
  Yuno (indigo, bleu, cyan, teal, vert), trois au club.
  - **CE QUE ÇA RENVERSE** : la raison d'alors était écrite — *« ces couleurs ne
    jugent pas une échéance et ne bougent pas toutes seules, elles disent une
    étape de fabrication »*. Elle tenait pour le MÉCANISME ; **elle ne tenait pas
    pour le premier cran.** Une banque d'idées est une réserve, pas un retard, et
    dix-huit idées en rouge font un écran qui s'ouvre sur dix-huit alertes.
  - **LE HUB AVAIT DÉJÀ TRANCHÉ CE POINT**, mot pour mot, sur l'état d'un PROJET
    (28 août 2026) : *« pas le rouge → ambre → vert d'une publication, essayé
    d'abord et écarté — un projet pas commencé n'est pas en défaut, il attend son
    tour »*. **Une idée non plus.**
  - **LE VERT D'ARRIVÉE NE BOUGE PAS** : c'est la seule couleur du hub qui dise
    « c'est fait », et elle le dit partout.
- **PLUS DE TROIS CADRES GRIS** (16 septembre 2026, retour de Noé : *« j'aime
  pas la forme de ces pastilles en fait, elles ne donnent pas d'info assez
  rapidement, on s'ennuie en les voyant, ça ne donne pas vie à l'idée »*).

  **CE QUE ÇA RENVERSE, ET IL FAUT LE DIRE** : le 15 septembre, les trois
  étiquettes ont été rendues HOMOGÈNES — *« réseau, format et pilier se
  présentent enfin de la même façon, contour fin et encre discrète, là où la
  troisième criait au-dessus des deux autres »*. La correction était juste contre
  le bruit ; **elle a coûté toute la vie de la rangée.**

  Trois défauts, et le troisième est le pire : trois cadres de même dessin, donc
  rien ne distingue ce qu'on regarde ; des capitales espacées, qui se lisent
  lettre à lettre ; et surtout **« INSTAGRAM » est vrai de dix-neuf idées sur
  vingt** — un mot identique partout ne distingue rien, c'est la leçon d'« en
  sommeil » sur les habitudes et de « Film » dans la bibliothèque.

  **LA RÉPONSE : ce qui se RÉPÈTE passe en service, ce qui STRUCTURE prend la
  couleur.** « Instagram · Carrousel » devient du texte gris sans cadre ; le
  pilier prend la **pastille ronde de son rang**, celle que la page « Tes quatre
  piliers » emploie déjà. **Un chiffre coloré se reconnaît avant d'être lu ; un
  contour gris, jamais.** Et le nom du pilier se lit enfin en entier, en
  bas-de-casse.
  - **LA COULEUR S'ÉCLAIRCIT, sans quoi la pastille ne se VOIT PAS** : les quatre
    piliers sont quatre bleus de plus en plus sombres, choisis pour porter de
    l'encre blanche en grand aplat. *Mesuré sur le fond d'une tuile : 1,03:1 pour
    le quatrième, 1,29 pour le troisième — invisibles.* `color-mix` leur rend de
    la clarté sans toucher à leur teinte, comme le font déjà les barres des axes,
    et l'encre passe au sombre — la règle du hub pour tout aplat clair.
  - **PAS D'APLAT SUR LE NOM** en revanche : en lettres sur le fond, le plus
    clair des quatre plafonne à 1,8:1. **C'est la pastille du rang qui porte la
    couleur, et sur ce point la règle du 15 septembre n'est pas renversée.**
  - **La rubrique rejoint le service** (« Instagram · Carrousel · Raw to edit ») :
    c'en est une, et elle n'a plus à ouvrir une ligne à elle.
- **DEUX RANGS, ET PAS UN** : le réseau et le format côte à côte — ce sont les
  deux moitiés d'une même décision, « où je poste » et « sous quelle forme » —,
  puis **le pilier SEUL en dessous**, où il a toute la largeur. C'est ce qui lui
  permet de se lire en entier là où, partagé avec deux voisines, il s'arrêtait à
  « 3. DANS L'ŒIL… ».
- **LE TITRE RESSORT, PAR LES DEUX BOUTS** (*« le titre de l'idée doit ressortir
  un peu plus, donc agrandis-le ou diminue un peu les pastilles »*) : il monte de
  15 à 17 px, les pastilles de tête descendent de 10,3 à 9,4. **L'écart passe de
  1,45× à 1,8×** — c'est le RAPPORT qui fait ressortir un titre, pas sa taille
  seule. Les étiquettes du bas ne bougent pas : elles sont déjà les plus
  discrètes, et 9 px est le plancher en dessous duquel un mot n'est plus qu'une
  trace. *Prix assumé : à corps plus grand, la coupe à deux lignes tombe plus
  tôt — « Reel-diaporama "fierté Léopards" sur musique… ». Le titre entier se lit
  sur la fiche.*
- **LES DEUX RÉGLAGES FERMENT LA TUILE** (correction de Noé, le même jour :
  « repasse l'état et programmer en bas de tuile, en dessous des détails en tout
  cas »). En tête, ils étaient **la première chose lue de chaque tuile, alors
  qu'ils disent la même chose sur dix-huit d'entre elles** — « Idée ·
  Programmer », vingt fois. *Ce qu'on lit d'abord doit être ce qui distingue.*
  Collés au bas de la hauteur commune, ils alignent en plus leurs vingt paires
  sur une seule ligne — **c'est la seule chose qui justifie le vide que
  `grid-auto-rows: 1fr` laisse dans les tuiles courtes.**
- **LES DEUX PASTILLES DE RÉGLAGE SONT ALIGNÉES**, et il a fallu rattraper deux
  écarts. Le premier est invisible dans le code : les éléments de la ligne ne
  sont pas les pastilles mais leurs CONTENEURS (`.choix-champ`), et celui-ci
  porte 12 px de marge basse — la respiration des formulaires. Celui de l'état
  l'annule depuis toujours, celui de la date non : centrée, sa boîte de 35 px
  remontait la pastille de six pixels. *Mesuré : deux bords hauts à 205 et 211.*
  Le second est une question de corps — 8,4 px contre 10,3 : **deux boutons de
  même rang posés côte à côte ne se lisent pas dans deux tailles.**
- **SANS LA PASTILLE, L'ANCIEN EN-TÊTE REVIENT** : c'est le même gabarit pour
  deux sites, et l'un ne dicte pas la forme de l'autre. Le FCH ne l'a pas
  demandée.

#### LES TUILES DE LA BANQUE FONT TOUTES LA MÊME TAILLE (16 septembre 2026)

**Demande de Noé** : *« pour ces tuiles, elles doivent toutes faire la même
taille, pas d'espace vide plus grand par moment. Le statut doit être modifiable
directement depuis cette vue, sous forme de pastille. »*

**DEUX RÉGLAGES, ET IL FAUT LES DEUX.** `align-items: start` laissait chaque
tuile prendre la hauteur de son titre — une ligne ici, deux là —, et le trou se
voyait entre les rangs. `stretch` égalise les tuiles d'un MÊME rang ;
`grid-auto-rows: 1fr` égalise les rangs entre eux. *Mesuré : 124 px partout, sur
ordinateur comme sur téléphone.*

- **ET C'EST ICI QUE `grid-auto-rows: 1fr` EST JUSTE**, là où il était faux dans
  le hall de `#perso` : là-bas les quatre tuiles portaient des choses de natures
  différentes — sept frimousses de 40 px sous une pile de couvertures de 280 —,
  **ici ce sont vingt tuiles de la même nature**, et c'est justement leur
  comparaison qui compte.
- **LE TITRE S'ARRÊTE À DEUX LIGNES**, sans quoi une idée de trois lignes
  imposerait sa hauteur aux dix-neuf autres : `grid-auto-rows: 1fr` cale TOUS les
  rangs sur le plus grand. C'est la règle de l'étagère de la bibliothèque, où
  chaque bloc réserve sa hauteur. Le titre entier se lit sur la fiche.
- **LA TUILE DEVIENT UNE COLONNE**, et sa pastille d'état descend au bas de la
  hauteur commune (`margin-top: auto`) : c'est ce qui fait que vingt pastilles
  tombent sur la même ligne quelle que soit la longueur des titres.

**L'ÉTAT SE RÈGLE DEPUIS LA GALERIE** : c'est la pastille du calendrier et de la
fiche, dessinée une seule fois. Elle remplace « statut : idée », qui DISAIT sans
laisser rien faire — et faisait ouvrir une fiche pour un geste d'un doigt.
**LA PASTILLE D'ÉTAT SE LIT EN BAS-DE-CASSE, ET ELLE RESPIRE** (16 septembre
2026, demande de Noé : *« plus de place à droite et à gauche du texte dans la
pastille, et texte en minuscule sauf la 1re lettre »*).

C'est l'argument des en-têtes de colonnes de la bibliothèque, au mot près : *« les
capitales et leur écartement sont le dessin d'un LIBELLÉ DE SECTION dans le hub,
or ce n'en est pas un »*. Une pastille d'état n'est pas une mention de classement
qu'on balaie comme « INSTAGRAM » ou « CARROUSEL » — **on la PRESSE**, et ce qu'on
presse se lit comme un mot. *Ses voisines gardent leurs capitales : ce sont des
étiquettes qu'on lit, pas des boutons.*
- **PORTÉE : la pastille d'état, PARTOUT** — le calendrier, le FCH, la banque, la
  fiche. C'est un seul objet ; deux casses pour une même pastille serait
  exactement le défaut qu'on corrige. *Vérifié : le club dit toujours « À
  préparer » et « À programmer », avec ses mots à lui.*
- **LA MAJUSCULE VIENT DU JS** : `::first-letter` ne s'applique pas à un
  `inline-flex`, et `capitalize` mettrait une majuscule à chaque mot — « À
  Développer ». Les noms restent en minuscules dans `NOMS_STATUTS_BASE`, où ils
  s'écrivent au fil du texte ailleurs (« Passer en à développer »).
- **LE PIÈGE DE SPÉCIFICITÉ, PAYÉ UNE FOIS DE PLUS** : `body[data-espace="yuno"]
  .etiquette` vaut (0,2,1) et écrase `.etiquette.cal-statut-pastille` (0,2,0) de
  `styles.css` — **à poids égal, c'est le dernier fichier chargé qui gagne, et
  `yuno.css` vient après**. Le rembourrage et l'écartement se redisent donc dans
  `yuno.css`.

**ET LE MENU S'EST RETROUVÉ ÉTIRÉ** (*« moins d'espace entre les états ici »*),
régression du même jour : depuis que la pastille se règle sur la tuile, **son
menu est une liste DANS la banque** — il recevait donc la grille de 16 rem et,
pire, le `grid-auto-rows: 1fr` qui venait d'égaliser les tuiles. *Chaque option
s'étirait à la hauteur d'une tuile : 139 px entre « idée » et « à développer »,
ramenés à 46.* `:not(.choix-capture)` l'exclut, comme `:not(.liste-checklist)` le
fait depuis toujours pour la checklist d'un carrousel. **Une règle qui vise « les
listes de ce bloc » finit toujours par attraper une liste qu'on n'avait pas
prévue.**

- **LA TUILE PORTE DÉSORMAIS UN CONTRÔLE**, donc le clic qui le touche ne doit
  pas ouvrir la fiche par-dessus. La garde liste les rôles natifs, **et non « tout
  ce qui a l'air cliquable »** : un sélecteur deviné avalerait silencieusement le
  prochain contrôle posé ici. C'est la garde de la tuile « Aujourd'hui » du hub,
  au mot près. *Vérifié : choisir « brouillon » écrit en base et n'ouvre pas la
  fiche.*

#### LA RANGÉE DE GESTES D'UNE IDÉE : TROIS PASTILLES ET UN LIEN (16 septembre 2026)

**La demande de Noé**, capture à l'appui : *« cette partie n'est pas bonne et ne
correspond pas aux critères qu'on s'était fixés pour les boutons, les tuiles. »*

**CE QUI CLOCHAIT : cinq objets de cinq natures dans la même rangée** —
« statut : idée » en texte nu, un bouton doré plein « Passer en à développer »,
un champ de date natif encadré (« jj/mm/aaaa »), un lien « Une seule fois », et
« Supprimer l'idée ». *Mesuré : 18, 30, 27, 30 et 30 px de haut, et le dernier à
16,9 px de corps contre 12,2 pour tous les autres — **le geste le plus
irréversible de la rangée en était le plus gros**.*

**LA GRAMMAIRE DU HUB EST ÉCRITE DEPUIS LE 30 AOÛT** : *tout ce qui se RÈGLE
devient une pastille ; un champ de texte reste un champ de texte.* Ce qui se
règle ici, c'est l'état, la date et la nature du contenu — trois pastilles.

| | avant | après |
|---|---|---|
| l'état | « statut : idée » + un bouton doré | **la pastille d'état**, celle du calendrier |
| la date | un champ natif encadré | **une pastille** à icône de calendrier, le champ transparent par-dessus |
| le format | un lien « Une seule fois » | **une pastille** à deux valeurs |
| supprimer | un lien de 16,9 px | un lien discret, **au corps de ses voisines** |

- **LA RÉFÉRENCE EST LA PASTILLE D'ÉTAT**, parce qu'elle vient du calendrier et
  qu'elle était déjà là : petites capitales, 1,5 rem de haut, un filet fin, pas
  de chevron. Les deux autres s'y calent. *Mesuré après : 23 px pour les trois.*
- **YUNO PASSE À `pastille: true`**, l'option que le FCH activait seul. Le bouton
  « Passer en à développer » disparaît avec : le menu sait ce que le bouton ne
  savait pas — sauter un cran, et revenir en arrière.
- **LA PASTILLE DU FORMAT N'A PAS DE TEINTE**, et c'est voulu : reproductible et
  « une seule fois » ne sont pas deux étapes d'un cycle, ce sont deux NATURES.
  Le rouge → ambre → vert de l'état dit un chemin ; inventer ici un cinquième
  vocabulaire de couleur pour une opposition sans progression ferait une couleur
  à apprendre pour rien.
- **ELLE AFFICHE LA VALEUR, PAS LE GESTE.** Un lien qui dit « Une seule fois »
  quand l'idée est reproductible annonce ce qui va se passer — c'est le rôle
  d'un bouton, pas d'un réglage.
- **DEUX OPTIONS DANS UN MENU, et non une bascule au clic** : c'est la convention
  du 29 août 2026, *« une pastille booléenne se fait avec un champ de choix à
  deux options »*. On voit les deux valeurs avant de choisir.
- **L'ÉTIQUETTE « UNE SEULE FOIS » NE S'AFFICHE PLUS DANS LA FENÊTRE** : la
  pastille le dit déjà, et le règle. Elle reste sur l'aperçu de la banque, où
  rien ne se règle.

#### LA TUILE PORTE TOUS LES PARAMÈTRES D'UNE IDÉE (16 septembre 2026)

**Demande de Noé** : *« modifie la tuile qui permet d'ajouter une idée, pas
besoin que ça tienne sur 2 lignes seulement, et ajoute tous les paramètres
importants (reproductible ou non…) »*, puis *« il faut que ce soit aligné,
supprimer doit être une icône, et il doit y avoir une icône pour pouvoir
modifier »*.

**LA BANDE DE PASTILLES SE REPLIE, ELLE NE DÉFILE PLUS** — chez Yuno seulement.
Le dépôt sait depuis le 30 août qu'*« une pastille en queue n'existe pas »* ;
avec sept pastilles c'était tendu, avec neuf la moitié des réglages d'une idée
vivaient hors de l'écran. **On ne peut pas à la fois demander qu'une tuile porte
tous ses paramètres et les cacher derrière un défilement.** Ailleurs le
défilement reste juste : une tuile qui grandit sous le pouce au calendrier du hub
serait une régression.

**CINQ PASTILLES, PUIS UN CHAMP** (forme arrêtée le 16 septembre 2026 par Noé,
en quatre corrections) :

    L'idée, en une phrase
    [Instagram] [Carrousel] [Pilier] [Reproductible] [Quand]
    Ce qu'il faut se rappeler de l'idée

**LA TUILE SE LIT EN TROIS TEMPS** : ce qu'on écrit, ce qu'on règle, ce qu'on
précise.

- **LA NATURE DISPARAÎT** des trois écrans de l'atelier (*« le type non plus —
  publication obligatoirement, donc pas besoin de pouvoir changer »*) : on n'y
  pose qu'une publication, et **une pastille qui n'offre qu'un chemin est un
  choix qui n'en est pas un.** Le champ caché reste — c'est lui que l'envoi lit.
- **LA RÉPÉTITION DISPARAÎT des deux écrans qui ouvrent SANS DATE** (*« le "une
  seule fois" n'est pas nécessaire ici »*), Créer et la banque : une idée n'a pas
  de jour qui revienne, et `creerPublication` l'écartait déjà d'elle-même.
  **Promettre un réglage sans effet est pire que de ne rien proposer.**
  *L'éditorial la garde : on y pose sur un jour.*
- **LA DATE FERME LA RANGÉE** (*« la date doit être en dernier »*), et c'est
  `sansDate` qui le décide, pas l'écran : **là où la tuile s'ouvre sans jour, une
  date est rare et facultative** — la plupart des idées restent en réserve, et la
  mettre en tête donnait le premier rang au réglage qu'on pose le moins. Là où la
  tuile s'ouvre SUR un jour, elle reste en tête : c'est ce qu'on vient poser.
- **« REPRODUCTIBLE » EST UN INTERRUPTEUR** (*« je dois simplement devoir appuyer
  sur le bouton pour activer, pas sélectionner reproductible ou contenu
  unique »*). **Ça renverse la convention du 29 août 2026** — *« une pastille
  booléenne se fait avec un champ de choix à deux options »* —, qui avait sa
  raison : une pastille affiche la VALEUR de sa source, et une case à cocher vaut
  « oui » qu'elle soit cochée ou non, donc le libellé disait « oui » en
  permanence. **Ce défaut-là se règle autrement** : le libellé ne bouge pas,
  c'est l'ÉTAT de la pastille qui dit tout — allumée, elle reprend le dessin
  d'une pastille remplie. **Un mot pour nommer, une apparence pour dire.** La
  convention reste juste là où les deux valeurs ont chacune un nom qu'on doit
  lire, comme l'état d'une publication.
- **L'ICÔNE SEULE, SANS LE MOT** (*« pour le reproductible ou non, mets que
  l'icône, pas de texte »*), **des deux côtés** — la tuile de capture et la fiche
  d'une idée. Un réglage qui se pose à deux endroits ne peut pas s'y dessiner de
  deux façons, et c'est ce qui a fait exporter l'icône plutôt que d'en redessiner
  une. Le mot part dans le `title` et dans le nom accessible, comme pour le
  crayon et la corbeille de la même rangée. *Gain mesuré : la rangée de la tuile
  repasse sur UNE ligne.*
  - **Une pastille sans mot se carre**, elle ne s'étire pas : le rembourrage
    d'un libellé laissait deux blancs autour d'un dessin de douze pixels. Elle
    garde en revanche la hauteur de ses voisines — c'est ce qui la maintient dans
    la rangée. *Mesuré : 34 px comme les quatre autres dans la tuile, 23 px comme
    les deux autres sur la fiche.*
  - **Ce qui reste pour la lire** : l'état allumé/éteint dit si le réglage est
    posé, l'infobulle dit lequel. *Risque assumé : une icône seule s'apprend, et
    celle-ci ne se devine pas au premier regard.*
- **UN SEUL CHAMP, ET C'EST « NOTES »** (*« fais qu'un champ notes ici
  finalement »*). La preuve et le « pourquoi chez moi » ont vécu vingt minutes en
  champs nus sous les pastilles : trois invites empilées dans une tuile qu'on
  ouvre pour noter une idée en cinq secondes, **c'était un formulaire déguisé**.
  Les deux colonnes restent en base et se lisent sur la fiche ; ce qui change,
  c'est qu'on ne les demande plus au moment de la capture, quand on ne les a pas
  encore. *Conséquence à connaître : elles ne se saisissent plus depuis l'écran —
  à rouvrir si l'usage les réclame.*
- **LE CHAMP EST DES CHAMPS, PAS UNE PASTILLE**, et c'est la règle du 30 août lue
  dans le bon sens : *« tout ce qui se RÈGLE devient une pastille, en respectant
  ce qui nécessite un espace de texte »*. Une note s'ÉCRIT — l'enfermer derrière
  une pastille demandait d'ouvrir un panneau pour taper une phrase, et une
  pastille grise ne disait pas si quelque chose avait été écrit dedans.
- **QUATORZE PIXELS CONTRE DIX-SEPT** (*« la police doit être plus petite »*). À
  seize contre dix-sept, l'écart ne se voyait pas — deux champs de même taille se
  lisent comme deux champs de même rang, alors que l'un porte l'idée et l'autre
  ce qu'on veut s'en rappeler. **PRIX ASSUMÉ : sous 16 px, Safari iOS zoome quand
  le champ prend le focus**, ce qui est le piège qui fait écrire le titre en
  17 px durs. Il ne s'agit que d'un champ facultatif, ouvert après le titre ; si
  le zoom gêne à l'usage, c'est cette ligne qu'il faut rouvrir.

**LA FICHE D'UNE IDÉE SE FERME SUR DEUX ICÔNES** — le crayon et la corbeille du
détail d'un élément du calendrier, repris tels quels. « Supprimer l'idée » était
le seul texte long de la rangée et la déséquilibrait ; *mesuré à 16,9 px de corps
contre 12,2 pour tout le reste, le geste le plus irréversible en était le plus
gros*. Le mot reste dans `title` et dans le nom accessible.

**MODIFIER, C'EST ROUVRIR LA TUILE OÙ L'IDÉE A ÉTÉ ÉCRITE.** C'est la mécanique
de l'espace Tâches du hub — *« rouvrir une tâche : la tuile revient avec son
projet »* — et elle vaut d'autant plus ici que la tuile porte désormais TOUS les
paramètres. Un second formulaire aurait été un second endroit où une idée
s'écrit, donc deux listes de champs à tenir d'accord.
- **`modifie` distingue la correction de la création** : la tuile ne sait pas ce
  qu'elle fait, c'est l'espace qui le sait à l'envoi. *C'était prévu depuis le
  premier jour — « la tuile ne sait pas si elle crée ou si elle corrige ».*
- **LA DATE ET LA RÉPÉTITION NE SONT PAS RÉÉCRITES** par une correction : elles
  se règlent sur la fiche, où vit la pastille de date, et les reprendre depuis la
  tuile déprogrammerait une idée qu'on venait seulement renommer.
- **LES PASTILLES REPRENNENT CE QUE LA LIGNE PORTE DÉJÀ** (réseau, format,
  pilier, notes, preuve, pourquoi, format d'idée) — sans quoi rouvrir une idée
  l'aurait remise à Instagram / carrousel / sans pilier.

**LES TROIS PASTILLES DE LA FICHE SONT ALIGNÉES.** Deux réglages y concouraient :
la pastille d'ÉTAT porte le rembourrage serré des étiquettes de Yuno — fait pour
des mentions de classement qu'on ne touche pas —, et `.choix-champ` porte 12 px
de marge basse, la respiration des FORMULAIRES. *Mesuré : trois bords hauts à
429, 423 et 422 ; après, trois centres au même pixel.* C'est le piège de la marge
héritée d'un autre contexte, payé une seconde fois après `.cap-etat`.

#### L'ÉTIQUETTE D'UN PILIER TIENT SUR UNE LIGNE (16 septembre 2026)

**Demande de Noé** : *« cet espace sur les tuiles des idées ne rend pas bien, ça
prend trop de place en haut et en bas ; juste le numéro si c'est trop grand, ou
mettre … »*

« 3. DANS L'ŒIL DU PHOTOGRAPHE » fait vingt-cinq caractères en capitales
espacées : sur une tuile de banque il se repliait sur **trois lignes** et
poussait le titre d'autant. *Mesuré : l'en-tête passe de 45 px à 15, et la tuile
de 120 à 97.*

- **L'ELLIPSE PLUTÔT QUE LE NUMÉRO SEUL**, entre les deux que Noé propose :
  « 3. » ne dit rien sans la légende des quatre piliers, qui n'est pas sur cet
  écran, tandis que « 3. DANS L'ŒIL… » se reconnaît. Le nom entier part dans le
  `title` et dans le nom accessible — la parade de la ligne d'une habitude.
- **DIX-HUIT CARACTÈRES, ET C'EST MESURÉ** : à onze, « 3. DA… » ne se
  reconnaissait plus. Il faut que le premier mot du pilier survive à la coupe.
- **LE MOT EST DANS UN SPAN**, et ce n'est pas décoratif : dans un conteneur
  flex, un nœud de texte nu devient un élément anonyme, et `text-overflow` posé
  sur le conteneur ne l'atteint pas. Le point de couleur, lui, reste HORS de ce
  span : c'est lui qui dit le pilier quand le mot est coupé, il ne doit jamais
  être rogné.

- **LE SITE DU FCH N'EN SAIT RIEN**, et c'est volontaire : il partage les mêmes
  gabarits mais n'a pas le geste qui fabrique une parution. `formats` est une
  OPTION, activée chez Yuno seulement — lui montrer le signe d'un format serait
  une promesse qu'il ne tient pas. **C'est l'échantillon : à généraliser quand
  Noé le demandera.**

#### ELLE NE GÈRE PLUS RIEN : ELLE INSPIRE, ET ELLE OUVRE (15 septembre 2026)

**La demande de Noé** : *« je déteste la page Créer de Yuno, repense-la plus
intelligemment par rapport aux modifications qu'on a faites sur les autres pages
(Yuno et le Hub) pour la forme. Elle doit me servir à donner de l'inspiration,
avoir un lien vers le calendrier éditorial. »*

**CE QUE LES DONNÉES DISAIENT, ET C'EST ÇA QUI TRANCHE.** Vingt publications :
**dix-huit idées sans date, deux parues, zéro programmée, zéro en chantier.** La
page portait trois blocs numérotés — *01 l'idée du jour · 02 cette semaine ·
03 en chantier* — et **deux sur trois étaient vides à l'écran**. Le troisième
l'était **structurellement** : « En chantier » lit les statuts intermédiaires (à
développer, brouillon, prêt), et **aucune publication n'en a jamais porté un
seul** depuis l'ouverture du site. *La page racontait un chemin que personne ne
parcourt, et elle le racontait en le numérotant.*

**L'AUTRE CHIFFRE, ET C'EST LUI QUI DONNE SA FORME À LA NOUVELLE PAGE :
vingt-sept sorties au carnet, toutes avec leur photo, et deux publications en
sont sorties.** La matière est là, elle ne devient rien — et la page qui doit
« donner de l'inspiration » ne montrait pas une seule image.

**Quatre temps, dans l'ordre où l'on décide** :

| | |
|---|---|
| **L'idée du jour** | gardée telle quelle — le seul objet de la page qui marchait, et il marche parce qu'il ne demande rien |
| **De la matière** | trois de ses propres photos, tirées du carnet, dont rien n'est encore sorti |
| **Tes quatre piliers** | ce que la banque porte sur chacun, en barres à échelle commune |
| **Les deux portes** | le calendrier éditorial et la banque — le lien que Noé demande |

**L'ORDRE N'EST PAS INDIFFÉRENT** : la matière passe devant les piliers parce
qu'une photo est CONCRÈTE et qu'un classement est ABSTRAIT — on regarde avant de
ranger.

**LA NUMÉROTATION TOMBE AVEC LE PIPELINE.** « 01 · 02 · 03 » disait un chemin —
l'étincelle, ce qui part, le chantier ; il n'y a plus de chemin, il y a quatre
choses à regarder. Partent avec elle : `partagerLAVenir`, `enChantier`,
`lignePublication`, `construirePiliers`, et leurs styles (`.etape`,
`.liste-flux`, `.pub-ligne`, `.vide-dessine`, `.point-pilier`).

#### DE LA MATIÈRE — ses propres photos

**Pour un photographe, l'inspiration est dans sa carte mémoire avant d'être dans
une liste.** Trois sorties du Carnet de terrain, en vignettes ; **presser en une
ouvre la capture d'une idée, le nom de la sortie déjà écrit dedans**, curseur au
bout. Ce n'est pas le titre de l'idée, c'est son point de départ : on le
complète, ou on l'efface.

- **LE LIEN EXISTAIT DÉJÀ EN BASE.** `publications.evenement_id` porte le match
  qui a fait naître une parution (29 août 2026, le post à J+1) : on sait donc de
  quelles sorties **quelque chose est sorti**, sans colonne nouvelle et sans le
  deviner. `matiereLibre` (js/yuno.js) écarte celles-là, plus celles qui n'ont
  pas de photo — un mur de photos sans photo n'est pas un mur.
- **LE TIRAGE EST CELUI DU MUR DE PHOTOS ET DE L'IDÉE DU JOUR** (`tirageDuJour`) :
  la date sert de graine, rien n'est stocké, l'ordre est stable dans la journée
  et change à minuit. Trois mécaniques de tirage sur une même page finiraient
  par ne plus se ressembler. Et c'est ce qui remonte ce qu'on avait oublié —
  *mesuré : le tirage du 15 septembre sort des sorties de février, mars et
  avril.*
- **TROIS, et c'est la largeur d'une rangée qui le dit** : trois vignettes
  tiennent côte à côte sans qu'aucune descende sous la taille où l'on reconnaît
  une image. Au-delà, le bloc redeviendrait le **mur du Journal**, qui est à un
  geste et qui, lui, ne cache rien. **Deux sur téléphone** : trois y tomberaient
  sous 110 px, et une troisième seule sur un second rang ferait un trou.
- **LE RAPPORT 3/2 D'UNE PHOTO DE REFLEX**, et non un carré : ce sont des images
  de terrain, elles ont été cadrées dans ce format.
- **LE NOM D'UNE SORTIE EST EN CLASH DISPLAY**, comme au carnet : c'est un nom de
  création du site, il ne peut pas changer de police d'un écran à l'autre. Il se
  **coupe** plutôt que de passer à la ligne — trois tuiles côte à côte doivent
  garder la même hauteur, sinon la rangée fait des marches.
- **LE COMPTE DIT L'ACQUIS, JAMAIS LE MANQUE** : « 27 sorties au carnet », et non
  « 25 dont rien n'est sorti ». C'est un gisement, pas un retard — et c'est le
  ton de la banque, « elle ne se vide jamais et ne réclame rien ».
- **TROIS VIDES, ET AUCUN NE S'EXCUSE.** Rien au carnet : la porte est dehors.
  Tout exploité : c'est une victoire, et elle se dit comme telle.

#### TES QUATRE PILIERS — la boussole dit enfin son état

**CE QUE ÇA RENVERSE, ET IL FAUT LE DIRE.** Les piliers ont été **repliés en pied
de page le 15 août 2026**, pour un motif qui se tenait : *« c'est la stratégie de
Noé, il la connaît par cœur ; le tableau des rôles se relit les jours de doute,
pas à chaque visite »*. **Le motif tombe le jour où le bloc cesse de RÉCITER la
stratégie pour en DIRE L'ÉTAT** : combien d'idées chaque axe porte, et combien en
sont parties. Ça, personne ne le connaît par cœur — c'est même la seule chose de
cette page qu'on ne puisse pas deviner. *C'est le test du hall du perso, au mot
près : une tuile doit dire quelque chose qu'on IGNORE avant de l'ouvrir.*

- **L'ÉCHELLE EST COMMUNE aux quatre** — la règle des barres de séries du hall du
  perso —, sans quoi chaque axe se mesurerait à lui-même et les longueurs ne
  voudraient plus rien dire les unes à côté des autres. *Mesuré sur les données
  de Noé : 7 idées pour « Dans l'œil du photographe », 3 pour « Bord terrain ».
  Le déséquilibre se voit avant d'être lu.*
- **LA BARRE EST UNE RÉSERVE, JAMAIS UN MANQUE**, et la phrase au-dessus donne la
  clé de lecture : *« Ce que la banque porte sur chacun. Le plus court est celui
  qui a faim. »* Ni rouge, ni seuil, ni « trop peu » — un axe sans idée n'est pas
  un retard, c'est un axe à ouvrir.
- **LE ZÉRO S'AFFICHE**, et c'est la règle du 2 septembre 2026 : « une série à
  zéro ne s'affiche pas » vaut là où un chiffre est SEUL ; dans une colonne qui
  en aligne quatre, la case vide est pire — elle décale le regard et l'on ne sait
  plus lequel manque. Les **parutions**, elles, se taisent à zéro : elles sont
  seules dans leur coin.
- **UNE PUBLICATION PROGRAMMÉE N'EST NI DANS L'UN NI DANS L'AUTRE.** Le bloc
  compte la BANQUE — les idées sans date — et ce qui est parti. Ce qui est posé
  sur un jour se lit dans la frise de la porte d'à côté, qui est faite pour ça.
- **PRESSER UN PILIER OUVRE LA BANQUE FILTRÉE DESSUS.** Le filtre existait depuis
  le 15 août et ne s'atteignait que par un menu, **une fois la banque déjà
  ouverte**. L'état se pose avant que le lien navigue — un écouteur délégué passe
  avant le comportement par défaut — et `naviguer` ne touche pas à `etat.pilier` :
  la banque s'ouvre donc déjà sur le bon axe, sans second rendu.
- **LES PISTES SONT BORNÉES, ET LA GRILLE SE TASSE À GAUCHE.** Sans plafond, la
  barre prenait **765 px sur un écran de 1280** — mesuré — pour comparer 3 idées
  à 7 : une longueur qui ne se compare plus, et un chiffre à un mètre de son nom.
  Vingt rem suffisent à séparer quatre valeurs. Le filet, lui, reste pleine
  largeur : c'est le lien qui le porte, pas la grille.
- **DEUX RANGS SUR TÉLÉPHONE, UN SEUL AU-DELÀ.** Sur 375 px, le nom prend la
  première ligne, la barre et le compte la seconde — **ensemble**, sur le même
  rang. Les empiler sur trois rangs portait une ligne à 150 px, donc quatre
  piliers à 600, et la page s'ouvrait sur un seul d'entre eux. *Mesuré après
  correction : 82 px par ligne.*
- **LE LIT DE LA BARRE EST `--fond-carte`**, et non le `--fond-doux` du hall du
  perso : ce jeton vaut `#191c1d` dans la palette du hub, et sur le fond du site
  (`#181818`) **il ne se voit pas du tout**, mesuré. La surface « carte » du site
  est le cran juste au-dessus du fond — de quoi montrer la place qui reste sans
  la souligner.
- **LA COULEUR S'ÉCLAIRCIT POUR LA BARRE.** Les quatre piliers sont quatre bleus
  de plus en plus sombres (`#114ad0` à `#08225e`), choisis pour être des **aplats
  avec de l'encre blanche dessus** ; en filet de six pixels sur le fond de la
  page, le quatrième disparaîtrait. `color-mix` lui rend de la clarté sans
  toucher à sa teinte : c'est la même couleur, pas une seconde palette.
- **LE NOM D'UN PILIER NE PREND PLUS SA COULEUR** (défaut corrigé le même jour).
  La règle datait d'une palette où deux des quatre étaient jaune et orange ; avec
  quatre bleus sombres, **le plus clair plafonne à 1,8:1 sur le fond de la page —
  illisible**, et « Les Léopards & le foot africain » s'écrivait ainsi. C'est
  l'argument déjà posé pour `.etiquette-pilier`, et il vaut maintenant pour les
  quatre : **la couleur se dit en aplat, jamais en lettres.** C'est la pastille du
  rang qui la porte.
- **LE TEST ET LE PLANCHER FERMENT LE BLOC**, en une ligne d'encre discrète :
  « Ça rentre dans un pilier ? Oui → je crée. Plancher : 2 publications par
  semaine, et les stories restent une zone franche. »

#### CE QUE LA PAGE COÛTE

**Deux lectures au lieu d'une** : `publications` et `evenements` — celle-ci
apporte les sorties ET signe les adresses de leurs photos dans la foulée. **Et le
cache de session vaut pour tout le site** : venu de l'accueil, qui les lit déjà,
le bloc de la matière ne coûte rien.

- Une publication porte : un titre/l'idée, le réseau (**Instagram d'abord,
  TikTok et LinkedIn aussi** — décision du 7 août), le format (post,
  carrousel, réel, story), une date prévue (ou rien), un statut
  (`idée → brouillon → prêt → publié`), des notes (légende, plan, références).
- **Les deux grandes portes** (décision de Noé, 12 août 2026) : « Calendrier
  éditorial » vers `#yuno/editorial`, « Banque d'idées » vers `#yuno/banque`.
  **Elles FERMENT la page depuis le 15 septembre 2026** — elles en occupaient le
  milieu tant qu'il y avait un pipeline à ouvrir dessous. Ce sont les portes du
  site, à la forme commune : la vitrine d'abord, le nom en légende. **Ni titre de
  section au-dessus, ni sous-titre dedans** — un libellé qui répète le nom de la
  porte n'apprend rien. Sur téléphone elles s'empilent.
  - **La vitrine du calendrier éditorial est la FRISE DE LA SEMAINE**, et c'est
    elle qui porte le lien que Noé demande : sept jours, une pastille par
    parution dans la couleur de son pilier. Elle ne se tait pas quand il n'y a
    rien — sept cases vides disent le trou mieux qu'une tuile muette, et c'est
    exactement ce qu'un calendrier éditorial est fait pour montrer.
  - **La vitrine de la banque est un tirage de trois idées** : le mot de la page
    est « fouiller », et c'est ce que fait un tirage — il remonte ce qu'on avait
    oublié.
- **Vue « À venir »** : les publications datées, dans l'ordre. *Elle a quitté
  Créer le 15 septembre 2026 : elle y était vide, et la frise de la porte dit la
  même chose en sept cases. Le calendrier éditorial reste sa page.*
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

**Les quatre piliers** : 1. Les Léopards & le foot africain (la portée) ·
2. Bord terrain (le portfolio) · 3. Dans l'œil du photographe (la conversion) ·
4. Carte blanche (la différence). Avec le test — « ça rentre dans un pilier ?
oui → je crée » — le plancher de 2 publications par semaine, et le rappel que les
stories restent une zone franche. *Ils ont ouvert l'écran en encart, puis se sont
repliés en pied le 15 août 2026 ; depuis le 15 septembre ils sont un BLOC qui dit
leur état — voir « Tes quatre piliers » plus haut.*

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

`construirePublication` (la tuile complète) sert au calendrier éditorial et au
site du FCH : la banque et « Publiées » sont seules à passer par
`construireApercuPublication`.

> **CE QUE LA PAGE A ÉTÉ DU 15 AOÛT AU 15 SEPTEMBRE 2026, et pourquoi elle ne
> l'est plus.** Elle racontait **le pipeline et non les lieux** : son ordre était
> le chemin d'une idée — *01 l'idée du jour* (l'étincelle), *02 cette semaine*
> (ce qui part à sept jours, le reste du daté replié sous « Plus tard »),
> *03 en chantier* (l'établi : les idées en « à développer », « brouillon » ou
> « prêt », sans date), puis les deux portes, puis les piliers repliés. Trois
> familles de formes s'y répondaient : la carte pour le contenu, la **ligne**
> pour le flux, la tuile pour les portes ; les titres étaient numérotés en gris
> chaud pour que la page dise visuellement qu'elle était un pipeline ; les vides
> montraient leur lieu par une grande icône pâle.
>
> **Le raisonnement était juste et il s'est vérifié faux à l'usage.** Un mois
> plus tard, les statuts intermédiaires n'avaient JAMAIS été employés — zéro
> publication en a porté un —, donc « En chantier » était vide par construction,
> et rien n'était programmé, donc « Cette semaine » l'était aussi. **Deux blocs
> sur trois montraient du vide sous un numéro.** Voir « Elle ne gère plus rien »
> en tête de cette section. Partent avec : `partagerLAVenir`, `enChantier`,
> `lignePublication`, `construirePiliers`, `.etape`, `.liste-flux`,
> `.pub-ligne`, `.vide-dessine` et `.point-pilier`.

Les filtres de la banque (pilier, statut) sont passés **en listes** le 15 août
2026 — les derniers menus natifs de l'atelier, même composant que le CRM.

#### LA CARTE DU JOUR RESSORT PAR SA SURFACE, PLUS PAR SA COULEUR (15 sept. 2026)

**La demande de Noé** : *« la forme de l'idée du jour et globalement des idées de
la banque d'idées est pas à mon goût, j'aime pas que ce soit de couleur, qu'il y
ait un contour (et un rectangle de couleur à gauche sur les idées de la banque).
Mais je veux quand même qu'elle ressorte un peu (l'idée du jour) donc trouve une
solution. »*

> *Ce que ça remplace :* « la seule carte CHAUDE de la page » (15 août 2026) — un
> souffle d'or dans le fond (7 % d'accent) et une bordure dorée à 35 %. *Tout le
> reste était froid, et c'était ce contraste qui disait « c'est ici que ça
> commence ».*

**LA SOLUTION ÉTAIT DÉJÀ DANS LA GRAMMAIRE DU HUB**, et c'est sa règle du 30 août
2026 : **une tuile posée dans la page se distingue par sa SURFACE.** Le hub tient
une échelle de fonds — `--fond`, `--fond-doux`, `--fond-carte` — et il lui
manquait un cran : **`--fond-releve` (#303032)**, le même écart que le précédent
(+12) pour que l'échelle reste régulière. **Une seule chose le porte.**

**TROIS LEVIERS, ET AUCUN N'EST UNE COULEUR** :

| | |
|---|---|
| **la surface** | un cran au-dessus de tout le reste de la page — *mesuré : 1,35:1 contre la page, là où une carte ordinaire rend 1,18* |
| **le titre** | 1,75 rem, la plus grosse chose de l'écran : c'est la carte qu'on vient tirer chaque matin |
| **l'espace** | un cran de rembourrage vertical de plus |

- **PAS D'OMBRE, et ce n'est pas un oubli** : `--ombre` vaut `none` dans tout le
  hub sombre, et pour une raison écrite dans la palette — « à #222222 les tuiles
  flottaient à peine, **surtout sans ombre pour les décoller** ». Une ombre
  portée ne se voit pas sur un fond presque noir. **Sur fond sombre, c'est la
  clarté qui soulève.**
- **LE GRAND CORPS N'EST PAS POUR LE TÉLÉPHONE** (1,375 rem sous 40 rem). À
  375 px, 1,75 rem portait un titre de **cinq lignes et une carte de 530 px** —
  tout le reste de la page passait sous la ligne de flottaison, ce qui est
  l'inverse de « ressortir ». Là-bas **la surface suffit** : la carte prend toute
  la largeur et elle est la seule chose claire de l'écran.
- **LE SÉLECTEUR DU TITRE PORTE `body[data-espace="yuno"]`**, et ce n'est pas
  décoratif : `body[data-espace="yuno"] .pub-titre` pose déjà 1,125 rem à tous
  les titres d'idée (0-2-1), et `.idee-jour-corps .pub-titre` (0-2-0) perdait —
  *mesuré, le titre restait à 16,9 px*. **Huitième fois que ce piège se paie.**
- **LA PREUVE PREND LE GRIS CHAUD SUR CETTE CARTE.** `--texte-discret` est réglé
  pour le fond de la page et pour une carte ordinaire ; sur `--fond-releve` il
  tombe à **4,13:1**, sous le seuil. Le gris chaud du site y rend 4,64 — et c'est
  déjà l'encre des étiquettes juste au-dessus.
- **L'ICÔNE DE PROGRAMMER PERD SON CADRE**, qui était le second contour de la
  carte. **L'or reste** : chez Yuno il dit « l'état actif, l'action qui part », et
  programmer une idée est exactement ça. *Ce que Noé refuse, ce sont les SURFACES
  colorées, pas les signes d'action.*

#### LES IDÉES DE LA BANQUE PERDENT LEUR RECTANGLE DE COULEUR (même jour)

- **LA BARRE GAUCHE DE PILIER EST PARTIE.** Elle portait la couleur du pilier
  depuis le 15 août, au motif qu'on lisait ainsi « la répartition des 18 idées
  entre les quatre axes d'un regard ». **Ce motif a trouvé son écran ailleurs**,
  et c'est ce qui rend le retrait sans perte : le bloc « Tes quatre piliers » de
  Créer dit cette répartition en chiffres et en longueurs, ce qu'une barre par
  tuile ne faisait qu'esquisser.
- **LE PILIER SE DIT EN POINT, PLUS EN APLAT.** Sans cela, l'étiquette pleine
  serait restée **le seul aplat coloré de l'écran** — donc plus criante qu'avant
  le retrait : on n'aurait pas retiré la couleur, on l'aurait concentrée. **Ce
  qui ne change pas** : le pilier garde sa couleur et le classement se voit
  toujours sans se lire ; c'est la FORME qui change, et c'est le dessin que le
  site employait déjà pour ça sur ses lignes de flux — « la couleur sans le mot ».
  **Trois étiquettes homogènes** : réseau, format et pilier se présentent enfin
  de la même façon, là où la troisième criait au-dessus des deux autres.
- **LE POINT S'ÉCLAIRCIT**, comme les barres des axes : à 7 px sur le fond d'une
  carte, le quatrième pilier disparaîtrait.
- **LE SURVOL SE DIT PAR LA SURFACE, PLUS PAR UN CONTOUR.** Une tuile qui se
  cerne au passage de la souris est un contour qui apparaît — justement ce dont
  Noé ne veut pas. Elle s'éclaircit d'un souffle. **Le focus clavier garde son
  anneau** : il doit se voir sans ambiguïté, et le hub ne le supprime jamais.
- *Les tuiles n'avaient déjà plus de contour* (`border-color: transparent` depuis
  la règle du hub du 30 août) : **le seul trait coloré qui restait était cette
  barre**.

**Ce qui tient toujours de la forme du 15 août** :

- **Le coin de la carte porte le geste de programmer** (une icône calendrier avec
  un « + ») : le re-tirage à la main a été retiré le 15 août 2026, et la ligne
  « La programmer » qui traînait dessous a disparu avec lui. L'idée du jour reste
  tirée une fois par jour et change à minuit — c'est une carte qu'on tire, pas
  une roue qu'on tourne. **Toucher la carte ouvre la fiche** de l'idée, comme
  partout ailleurs.

  Le champ date est **transparent par-dessus l'icône**, et non déclenché en JS :
  le clic tombe directement sur lui, donc le sélecteur natif s'ouvre partout —
  sans dépendre de la méthode showPicker, que Safari n'a eue que tard.
- **Les couleurs de piliers partout où un pilier apparaît** — la palette existait
  (`--pilier-1…4` + encres + fonds), c'est `data-pilier` qui l'allume. **En point
  sur les étiquettes** et **en barre sur les quatre axes de Créer** depuis le
  15 septembre : d'un regard, la répartition des 18 idées entre les quatre. De la
  couleur qui dit quelque chose, jamais de la décoration. **Et jamais en
  lettres** — voir « Tes quatre piliers » plus haut.
- **Les liens nus prennent l'accent de leur espace** (règle posée dans
  styles.css, un seul `a { color: var(--accent) }`) : avant elle, c'était le
  bleu-violet du navigateur qui sortait — l'intrus repéré par Noé.

**L'idée du jour ouvre la page** (demande de Noé, 14 août 2026) : une idée de
la banque, tirée au sort une fois par jour, offerte en arrivant. Elle ne demande
rien — elle est là, on la lit, on la garde ou on passe. C'est le pendant du mur
de photos : même tirage à graine (la date), même stabilité dans la journée, même
changement à minuit, rien de stocké. Un petit bouton en tête **en tire une
autre**, sans mémoire — le re-tirage ne survit pas au changement de page, et
demain l'idée du jour reprend sa place. La tuile s'ouvre au clic sur la fiche de
l'idée, comme dans la banque.

Elle ne remplace pas « Je ne sais pas quoi poster », qui répond à une autre
question : celle-là est contextuelle — y a-t-il un match cette semaine ? — et se
déplie quand on la cherche.

**« Noter une idée » et « Je ne sais pas quoi poster » ont disparu**
(15 août 2026, demande de Noé). Le premier ouvrait un formulaire que **la tuile
du « + » sait désormais remplir** : elle a gagné une pastille **pilier** et une
pastille **notes** pour ça — depuis, elle est le seul endroit où une idée
s'écrit, et tout ce qu'on a à en dire doit donc tenir dedans. Le second faisait
doublon avec l'idée du jour, qui est en tête de page et se retire d'un bouton.
Les piliers restent chez Yuno : c'est l'appelant qui les apporte à la tuile, le
hub et le FCH n'en ont pas.

**Le « + » de Créer et de la banque s'ouvre SANS date** (demande de Noé,
14 août 2026). Une idée est une publication sans date : l'ouvrir sur aujourd'hui
la programmait pour le jour même, et il fallait la déprogrammer pour qu'elle
rejoigne la banque. La pastille dit « Quand » au lieu d'un jour que personne n'a
choisi, et le champ n'est plus requis — seul un événement exige sa date, sa
colonne étant NOT NULL. L'éditorial, lui, garde la sienne : c'est un calendrier,
on y pose sur un jour.

**Le tirage de la semaine a été retiré** avec le bouton qui l'ouvrait : l'idée
du jour rend le même service, sans poser de question et sans qu'on ait à la
chercher.

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

**L'état d'une publication se règle aussi depuis le CALENDRIER du site**
(27 août 2026) : le rond de la barre avance d'un cran, la tuile porte sa
pastille d'état. Même geste que sur le hub et au club, en vue mois comme en vue
semaine — il est branché une seule fois, dans `brancherEtatPublication`.

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


### Le rendez-vous stats — retiré le 15 août 2026

Il a existé du 12 au 15 août : un jour par semaine, les chiffres des réseaux
(abonnés, portée, top post) et une question rituelle — « est-ce que ça change
quelque chose à mes actions cette semaine ? » — ; le reste du temps, un compte à
rebours et rien d'autre. **Noé l'a retiré** : « j'en trouve pas le besoin pour
le moment, et surtout pas sur cette forme. »

Ce qui NE change pas : le principe qui l'avait fait naître. Les réseaux sont une
vitrine, pas une résidence ; **aucune métrique sociale n'apparaît nulle part
dans le site**, et c'est maintenant vrai sans exception. La table `stats_hebdo`
reste en base avec ses lignes — le besoin peut revenir sous une autre forme, et
rien ne justifie de détruire des relevés pour retirer un écran.

### `#yuno/carnet` — le carnet réseau *(construit)*

> L'adresse du CRM est `#yuno/carnet` depuis le 12 août ; jusqu'au 21 août,
> `#yuno/reseau` était un palier qui y menait. **Le palier est mort le
> 21 août 2026** (refonte demandée par Noé) : l'onglet Réseau ouvre désormais
> la Passerelle. Le CRM s'atteint depuis elle par deux chemins : le chiffre
> « entrés au réseau » du bandeau, et sa **tuile de fin de page**. (Une
> sous-navigation en pastilles a été essayée le même jour et retirée le soir —
> « pas trop fan » : la famille se relie par des tuiles, pas par une barre.)

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

**Le type et la relation se choisissent dans une LISTE**, jamais dans un menu
du système — la règle du 13 août, appliquée au CRM le 15 août 2026 (demande de
Noé) : les filtres de la barre et la colonne « Relation » gardaient des
`select` natifs. Le composant est celui des formulaires (`choix-champ`), avec
une différence : ici rien n'est saisi pour plus tard, **choisir agit tout de
suite**. Pas de champ caché donc, et chaque option porte l'attribut de son geste
(`data-filtre-colonne-valeur`, `data-statut`) que l'espace écoutait déjà ; le
sujet (la colonne, le contact) voyage sur le conteneur — une option ne peut pas
porter à la fois sa valeur et son sujet.

Types : joueur, **photographe**, club, média, **agence**, marque, autre. Les
agences sont arrivées avec la seconde moitié du carnet : ce ne sont ni des
médias ni des marques, ce sont des intermédiaires. Le photographe est arrivé le
14 août 2026 : ce sont les confrères croisés au bord du terrain, la moitié des
rencontres d'un match, et les ranger en « autre » revenait à ne pas les ranger.

**L'échelle de relation** (12 août, remaniée le 15) :
`pas de contact → message envoyé → à relancer → relancé → contact établi →
bon contact → opportunité`. « Bon contact » est conservé depuis l'origine — on
ne remplace pas ce qui marche.

**« À relancer » est entré le 15 août, « répondu » est sorti** (demande de
Noé). Le premier porte la mécanique de relance décrite plus bas ; le second
faisait double emploi avec « contact établi ». La valeur `repondu` **reste
acceptée en base** — un CHECK s'élargit, il ne se resserre jamais — mais
l'interface ne l'offre plus ; une vieille fiche qui la porterait resterait
lisible (`statutLisible`). Aucune ne la portait au moment du changement.

### `#yuno/reseau` — la Passerelle *(la page de l'onglet Réseau)*

**Elle a quitté le carnet le 12 août, à la demande de Noé** : le carnet est un
**fonds où l'on cherche**, la Passerelle un **rituel où l'on agit**. Et depuis
la refonte du **21 août 2026** (demande de Noé), c'est **elle que l'onglet
Réseau ouvre** : le rituel est la première chose qu'on voit — le bandeau, la
porte à ouvrir, la fournée — plus un couloir à traverser. `#yuno/passerelle`
reste une adresse valide qui montre la même page : on ne casse pas un favori.

La refonte, précisée par Noé le soir même :

- **Plus de titre « La Passerelle »** : le bandeau ouvre la page, il n'a pas
  besoin d'être annoncé. Sans titre, la rangée de la loupe était une **ligne
  vide** (retour de Noé) — réglé en montant la loupe **dans la barre
  d'onglets**, où elle vit désormais pour tout le site (voir plus bas).
- **Le bandeau est centré, et deux de ses chiffres sont des portes** :
  « clubs contactés » ouvre le vivier qu'il compte, « entrés au réseau » ouvre
  le CRM où ils vivent. Le survol souligne le libellé — un bandeau qui crie
  trois liens ne serait plus un bandeau.
- **« Propositions de la semaine » et la tuile du club proposé font la même
  largeur** (moitié-moitié) : deux tuiles de même rang, la géométrie le dit.
- **Deux tuiles de fin de page, CRM et Le vivier, côte à côte** — le motif qui
  remplace la sous-navigation en pastilles, essayée et retirée le même jour.
  Sous elles, un lien discret « Modèles de messages ».

**Réécrite le 15 août 2026 (demande de Noé : « la structure actuelle me
perd »).** La première Passerelle était une file de fiches déjà au réseau,
groupée par niveaux (Répondre · Relancer · Ouvrir) — elle ne savait pas parler
des gens **jamais contactés**, qui sont pourtant l'objectif premier. Elle est
désormais le **rituel hebdomadaire d'ouverture de portes**, construit autour
d'un **vivier de 97 clubs** défini avec Noé (table `pistes`) : Ligue 1, Ligue 2
et Ligue 3 au complet (saison 2026-2027, listes vérifiées), les grands clubs
des pays frontaliers — 8 belges, 5 suisses, 10 italiens, 10 espagnols, et
7 allemands *à moins de 7 h de train de Paris* (critère de Noé ; Wolfsburg et
Hambourg écartés) — plus les clubs où joue un **international congolais**
(colonne `leopard` : Standard de Liège/Epolo, Sion/Fayulu, Augsburg/Mbuku,
Almería/Cipenga — l'accroche éditoriale, et le pont vers le fil rouge
CAN 2027).

La page, de haut en bas :

- **Le bandeau : trois chiffres, trois échelles de temps** (refonte du 15 août
  2026, demande de Noé — le bandeau datait de la v1, quand la Passerelle
  n'était qu'une file de messages).
  1. **« cette semaine »** — les envois des sept derniers jours, déduits de
     `journal_envois` (une ligne = un envoi). Le rituel, la seule chose qui
     appelle une action aujourd'hui. L'**objectif doux** se range dessous, en
     petit : il qualifie ce chiffre, il n'en est pas un. Il tourne d'un
     toucher (1 → 2 → 3 → 5 → 1, `localStorage`) plutôt que de dérouler un
     `select`, banni du site depuis le 13 août. Atteint, il se dit
     (« C'est fait pour cette semaine ») ; en dessous, il se tait.
  2. **« clubs contactés »** — « 12/97 », la saison. Il a remplacé le cumul
     des envois : « 47 messages » ne situe rien, là où une part d'un ensemble
     fini dit le chemin parcouru. Même vertu que le cumul (il ne redescend
     jamais), plus le repère.
  3. **« entrés au réseau »** — les fiches nées de la Passerelle
     (`pistes.contact_id`), le fruit du rituel. **Il n'apparaît qu'à partir
     de 1** : un compteur à zéro serait un reproche.

  **Rien ici ne compte les réponses ni les silences**, et `journal_envois` n'a
  toujours pas de colonne « répondu » : un taux ferait de chaque non-réponse
  un échec mesuré. Les trois chiffres ne mesurent que ce que Noé contrôle.
- **« Ta fournée de la semaine »** : les clubs que Noé a choisis. Chaque carte
  porte ses **quatre portes de recherche en icônes, sans cadre** (demande de
  Noé, 15 août au soir) — calendrier et planète-presse dans le bleu de Yuno,
  **LinkedIn et Instagram avec leur vrai logo et leurs couleurs officielles**,
  dessinés en SVG dans `js/yuno.js` (jamais une image distante). Les adresses
  se fabriquent depuis le nom du club (LinkedIn pré-rempli « responsable
  communication + club ») : le site est statique et sans dépendance,
  **il met le bon endroit à un clic et Noé juge**. Cibles tactiles 44 px, la
  zone déborde en transparent.
  Puis « Noter la personne trouvée » (la fiche du réseau s'ouvre pré-remplie :
  type club, structure, et `piste_id` en champ caché pour relier la piste à la
  fiche) et « Envoyé ✓ ». La croix repose le club au vivier — un choix, jamais
  compté.
  **Le geste d'ajout a deux formes** (demande de Noé, 15 août au soir). Club
  sans personne : un **bouton bleu « Ajouter un contact »**, du volume d'« Envoyé
  ✓ » — c'est ALORS le geste de la carte, et un « + » seul au bout d'une bande
  vide ne se voyait pas. Dès qu'il y a quelqu'un : le **petit « + »** qui
  prolonge la bande, la carte parlant des gens et non du bouton qui les ajoute.
  **Quatre cartes de front** sur un écran d'ordinateur (18 rem de plancher, là
  où les listes du hub en posent 21 et n'en tenaient que trois) ; trois, deux,
  puis une à mesure que l'écran rétrécit — `auto-fill` en met autant que la
  largeur en porte, rien n'est figé.
  **Tout est calé à gauche, sauf la croix** (demande de Noé, 15 août au soir) :
  les gens du club, leur relation, le « + » et « Envoyé ✓ » partent du même bord
  que le nom et le prochain match. Alignés à droite, ils flottaient loin des
  infos qu'ils concernent, et chaque rangée commençait ailleurs selon sa
  longueur. **La croix, elle, tient le coin haut droit de la tuile** : c'est le
  seul geste qui ne parle pas du club mais de la carte — il se range là où l'on
  ferme. Elle y est posée en absolu, ce qui lui évite de s'octroyer une rangée à
  elle seule au milieu de la carte (le coin s'est libéré quand la bande de
  contacts est passée à gauche). **Un seul pas partout, 8 px** : deux écarts
  différents dans une même tuile se voient. **Une exception, 12 px entre les
  portes de recherche et les gens** : c'est le seul endroit où la pile change de
  sujet — au-dessus le club et où le chercher, en dessous les personnes et ce
  qu'on leur a écrit. L'écart le dit sans qu'il faille un trait.
- **« Une porte à ouvrir »** : UN club à la fois, pas une liste (demande de
  Noé, 15 août au soir — dix cartes d'un coup faisaient un mur). La tête de la
  dizaine s'affiche en **ligne compacte** — division, nom, prochain match, un
  « + » et une croix « passer », cibles tactiles 44 px. Ajouter ou passer fait
  apparaître le suivant. « Passer » est un **choix d'écran** : gardé dans le
  `localStorage` pour la semaine, jamais écrit en base — le club reviendra.
  **Le bouton-tuile « Propositions de la semaine » vient EN PREMIER**
  (demande de Noé, 15 août au soir), et la tuile du club **prend toute la
  largeur qui reste** — on choisit d'abord dans quelle liste on pioche, le club
  proposé vient après. Sur téléphone, les deux s'empilent dans cet ordre, en
  pleine largeur. (La liste du club doit y reprendre `grid-template-columns` :
  sur grand écran, une liste du hub se met d'elle-même en colonnes de 21 rem, et
  celle-ci, qui n'a qu'un élément, n'occupait que le premier tiers.) Le bouton
  ouvre la fenêtre volante des dix propositions en lignes, chacune son « + » —
  pour composer d'un coup d'œil.
  Il a **perdu son « Les », gagné du gras, pris le bleu et passé en Canela
  italique gras** le même soir (demande de Noé) : c'est une PORTE, pas une tuile
  de plus — elle mène à la dizaine quand ses voisines parlent d'un club, et elle
  prend donc le traitement des deux portes du pied de page. Ni l'italique ni le
  gras ne sont simulés (`CanelaDeck-BoldItalic.otf` est dans `fonts/`, le site
  s'y refuse). Et le corps est **celui du titre « La Passerelle » et des deux
  autres portes** — 1,125 rem : quatre éléments de même rang, un seul corps. C'est le **seul contrôle du site en Canela** — `#vue button` met
  tous les autres en Gilroy, et il faut reprendre ce sélecteur mot pour mot pour
  l'excepter, un ID pesant plus que n'importe quelle classe. Le bleu est celui d'« Ajouter un
  contact », le seul autre geste du site qui ouvre quelque chose plutôt que
  d'acter un fait ; l'or reste à ce qui est vrai. La fenêtre garde le libellé du
  bouton **au mot près** pour les lecteurs d'écran, puisqu'elle n'affiche aucun
  titre.
  « Proposer d'autres clubs » (dans la fenêtre) tire une nouvelle donne et
  remet les passages à zéro. Dans la tuile, le lien du match est gris — une
  information qui se consulte — et « + » comme « × » sont de petits ronds dont
  la zone tactile garde 44 px (elle déborde en transparent).
- **La dizaine elle-même** se tire du vivier en deux familles (précision de
  Noé, 15 août au soir) : **la France est le fil rouge de la saison,
  l'étranger un objectif second** — aller shooter dehors — qui demande moins de
  régularité. **Environ 70 % de français** (un tour par division, la Ligue 1
  ouvre chaque tour et prend les places restantes : 3 L1 + 2 L2 + 2 L3), le
  solde à l'étranger où l'ordre des pays est lui-même mélangé — trois pays
  différents d'une semaine à l'autre. Tirage SEMÉ qui change chaque lundi.
- **Le prochain match s'affiche** (idée de Noé, 15 août au soir) : « J1 ·
  reçoit LOSC Lille », parce que **c'est le calendrier des matchs qui décide de
  la fournée**. Les appariements d'une saison sont publics et figés dès l'été :
  la table `matchs_pistes` les charge une fois par saison (source fbref.com),
  et la vue `prochain_match_par_piste` en sert un par club. **L'adversaire et
  la journée sont sûrs ; la date est indicative** (elle glisse avec la
  télévision) — elle se lit au survol sur la ligne, en clair sur la carte de
  fournée. Sans calendrier chargé, la ligne retombe sur « Matchs à venir ».
  **Les 97 clubs du vivier ont leur calendrier** (15 août 2026) : Ligue 1,
  Ligue 2, Ligue 3, Bundesliga, Serie A, La Liga, Belgique, Suisse (les
  journées publiées) et l'Almería. Les migrations `20260815210000` et
  `20260815220000` tiennent le journal des chargements et de la méthode —
  fbref.com pour la plupart, le PDF officiel pour la Ligue 3, proleague.be
  pour la Belgique.
- **Deux portes en pied de page** (15 août 2026, demande de Noé), côte à côte
  comme celles du palier Réseau : **Le vivier** et **Les modèles**. Le pli
  « chantier Clubs » et la bibliothèque de modèles ont déménagé dedans — la
  Passerelle ne garde que ce sur quoi on agit aujourd'hui.
  **Côte à côte y compris sur téléphone** (précision de Noé, 15 août au soir) :
  elles ne s'empilent plus. Moitié-moitié, leur texte se replie sur deux ou trois
  lignes. Empilées, elles se lisaient comme deux étapes l'une après l'autre ;
  côte à côte, elles disent ce qu'elles sont — deux portes au même rang. Leur nom
  monte d'un cran le même soir (1,125 rem) : depuis qu'elles partagent la
  largeur, il pesait moins que la ligne qui l'explique.

**Ni titres ni sous-titres depuis le 15 août au soir** (demande de Noé) : le
bandeau ouvre la page, la porte du jour vient dessous, la fournée suit d'elle-
même. Les formes disent ce que les titres disaient — une ligne compacte pour
le club proposé, des cartes pour ceux qu'on a pris.

**« Rattaché à » relie une fiche au vivier** (demande de Noé, 15 août 2026).
Le champ propose les 97 clubs — une `datalist`, donc **la saisie reste libre** :
« La Provence » n'est pas au vivier et doit pouvoir s'écrire. Écrire le nom
exact d'un club (casse et espaces de bord ignorés) pose `pistes.contact_id` :
la personne devient le contact de ce club, la Passerelle la montre sur sa carte
et le bandeau la compte dans « entrés au réseau ».

- **Une piste ne garde qu'une fiche** — sa carte n'en montre qu'une. Un second
  rattaché au même club garde sa structure écrite, sans prendre la place du
  premier.
- Changer le « rattaché à » d'une fiche déjà liée **déplace le lien** : la
  personne a changé de club, l'ancienne piste se libère.
- Les fiches qui portaient déjà le nom exact d'un club ont été reliées au
  passage (OM — service presse, Tuomas Ollila).

**La feuille de préparation est devenue un module commun** (21 août 2026,
`js/preparations-commun.js`) : les réunions du FC Hermitage s'en servent aussi.
Rien ne change à l'écran chez Yuno — phases, items, bilan, boucle « aussi au
modèle » — et ses modèles portent désormais `espace = 'photo'` : chaque site ne
voit que les siens. Le CSS a suivi dans `styles.css`, le site du club ne
chargeant pas `yuno.css`.

**« Week-end », quatrième vue du calendrier** (demande de Noé, 15 août 2026),
à côté de Mois · Semaine · Agenda. Les trois autres montrent ce qui est POSÉ ;
celle-ci montre ce qu'on **pourrait couvrir** : toutes les rencontres du
vendredi au dimanche, tous championnats du vivier confondus, **en trois
colonnes, une par jour**. **Chaque jour porte sa teinte** — bleu, or, violet, les trois couleurs de Yuno :
on sait dans quelle colonne on est sans relire son en-tête. Une rencontre est
**une tuile** d'une ligne, sa tranche gauche à la couleur du jour : sa division
en pastille, l'affiche dans la police du texte (et non celle des titres), la
journée, et **une icône calendrier** au bout qui la pose — vingt matchs par
colonne ne tiennent pas autrement. Elle respire un peu plus depuis que le
filtre existe (demande de Noé, 15 août 2026) : la colonne n'a plus à porter
tout un week-end d'un coup, la tuile peut reprendre son souffle. Posée, l'icône
passe à l'or et perd son geste. Sa zone tactile garde 44 px en débordant en transparent. Les trois colonnes restent même vides — sinon la
grille se décale d'un week-end à l'autre — et s'empilent sur téléphone. C'est
le rythme du football, et celui d'un photographe qui prépare sa semaine.

**Un filtre par compétition** coiffe les trois colonnes (demande de Noé,
15 août 2026) : la forme des filtres du vivier, « Tout » puis une pastille par
championnat, chacune avec son compte. Trente-trois rencontres en un week-end ne
se lisent pas d'un coup ; une division à la fois, oui. Seuls les championnats
qui **jouent ce week-end** sont offerts — plus celui qui est choisi, même à
zéro, sinon on ne pourrait plus le relâcher. Le choix **survit au changement de
week-end** : on suit une division de semaine en semaine, on ne la rechoisit pas
à chaque coup de flèche. Rien ne se relit au clic — les rencontres sont déjà
là, on ne fait que trier ; le compte de la barre suit le filtre.

La vue s'ajoute par `vuesEnPlus`, même contrat que `naturesEnPlus` pour la
tuile : le hub n'a pas de vivier, il ne la voit pas. Le calendrier éditorial
non plus — il partage `vueCal` et retombe sur le mois. Les filtres de nature
disparaissent sur cette vue : elle ne montre rien de posé — celui des
compétitions les remplace. Les flèches passent
d'un week-end à l'autre ; les rencontres ne se chargent **qu'en arrivant sur la
vue**, jamais avec le calendrier. Chaque affiche porte « Poser… », qui ouvre la tuile
pré-remplie comme depuis la fiche d'un club, et celles déjà au calendrier le
disent.

Une seule requête suffit à les avoir toutes sans doublon : `domicile = true`,
puisque la table dénormalisée donne exactement une ligne par match côté club
qui reçoit.

**Une loupe dans la barre d'onglets, sur TOUTES les pages** (demande de Noé,
21 août 2026 — d'abord au bord droit du titre des trois pages « clubs », puis
montée dans la barre le soir même) : chercher un club du vivier et l'ajouter à
la fournée sans changer de page, d'où qu'on soit. Elle ferme la rangée, tout à
droite — c'est sa marge automatique qui centre les onglets, en pendant de
celle du premier — et **reste visible quand la barre déborde et défile sur
téléphone** (`position: sticky` au bord droit, sur le fond de la page). Pour
l'instant elle ne cherche **que les clubs du vivier**.

Le clic **déploie la barre de recherche sur la ligne des onglets** — ils
s'effacent le temps de chercher, Échap ou la loupe les ramènent — jamais dans
une fenêtre, jamais dans une tuile (corrections de Noé). **La loupe ne bouge
pas d'un pixel** : elle reste au bord droit, le champ déployé à sa gauche — un
contrôle qui saute de place au clic ferait chercher des yeux ce qu'on vient de
toucher. Les pages qui ne lisent pas le vivier (Créer, Journal…) **le chargent
au premier clic** ; la liste se remplit quand il arrive, le champ garde son
curseur. **Pas d'anneau doré à l'ouverture** : la barre vient d'apparaître
avec son cadre et son curseur, l'anneau redisait ce qui se voit — le focus se
dit par la bordure qui s'éclaircit (`:focus-within`), le champ étant nu dans la
barre qui porte le cadre. Les résultats se posent **sous la barre, au-dessus
de la page** — leur liste vit hors de tout `.bloc` et porte donc elle-même son
habit (`.recherche-clubs`, lignes à filets du vivier).

Rien ne s'affiche tant que rien n'est tapé — on est venu taper un nom, le
vivier existe pour relire la liste ; dès les premières lettres, les clubs
correspondants apparaissent (sans accents ni casse : « bale » trouve Bâle).
Les résultats sont **des lignes à filets, pas des tuiles** : la ligne du vivier
— pastille, écusson, nom, « + » ou état — sans le prochain match, qui prenait
la place du nom, et en une seule colonne même sur grand écran. Seule la liste
se redessine à la frappe : le champ garde son curseur. Le « + » ajoute à la
fournée et la ligne change d'état sous les yeux ; toucher la ligne ouvre la
fiche du club.

### `#yuno/vivier` — le vivier *(sa page)*

Le pendant du carnet, côté clubs : **la Passerelle est un rituel où l'on agit**
— elle ne sert qu'une porte à la fois — **et le vivier un fonds où l'on
cherche**, les 97 clubs à portée, filtrés par compétition (« Tout 97 »,
« Ligue 1 18 », « Suisse 6 »…). On y va pour prendre un club précis, ou pour
parcourir une division entière avant un déplacement.

Chaque ligne est celle des propositions — division, **écusson**, nom, prochain
match — et son geste dépend de l'état du club : un « + » s'il est libre, « dans
ta fournée » s'il y est déjà, « ✓ contacté » si c'est un fait acquis. Ces deux
derniers ne se rechoisissent pas.

**L'écusson devant le nom** (demande de Noé, 15 août 2026), 20 px : dans une
liste de 97 lignes, l'œil reconnaît un blason avant de lire un nom. Il ne
remplace pas le nom, il l'accroche — d'où sa taille, et son `aria-hidden` : un
lecteur d'écran dirait deux fois le même club.

**Partout où un club se nomme**, le soir même : la ligne du vivier et celles de
la fenêtre des dix (20 px), la ligne du club proposé de la semaine (20 px), et
**28 px** en tête de la fiche du club comme sur les cartes de la fournée — là,
l'écusson ne signale plus dans une liste, il tient compagnie au nom.

**Et le nom descend d'un cran** — 1 rem au lieu de 1,125 — dans les lignes et
sur les cartes (demande de Noé, dans la foulée) : le blason reconnaît le club,
le nom n'a plus à le crier. Ce qu'on perd en corps se regagne en **nom entier** :
sur un écran de 390 px, la liste passe de douze noms coupés à neuf, et
« FC Sochaux-Montbéliard » tient de nouveau sur une ligne avec sa pastille. Le
titre de la fiche, lui, ne bouge pas : c'est le titre d'une fenêtre, pas une
ligne de liste.

**Toute la ligne se cale au MILIEU** (correction du 15 août au soir) : la
pastille, l'écusson, le nom, l'affiche et le geste du bout partagent le centre
de la tuile. `.bloc li` impose `align-items: baseline` et l'emportait en
spécificité ; or la ligne de base d'une image, c'est son bord bas — l'écusson se
posait sur le pied des lettres et flottait au-dessus du centre.

Les 97 images sont **dans le dépôt** (`img/clubs/`, 64 px, ~800 Ko en tout),
jamais appelées à un CDN : c'est la règle du hub, celle des polices et de
supabase-js. Un écusson distant, ce serait une dépendance de plus, une requête
que la coquille hors ligne ne peut pas garantir, et l'adresse IP de Noé envoyée
à un tiers à chaque ouverture du vivier.

`tools/telecharger-logos.py` les rapatrie de deux sources publiques et sans
clé — **ESPN** pour 79 clubs, **TheSportsDB** pour les 18 du National, qu'ESPN
ne couvre pas. La table nom → source y est **écrite et relue club par club**,
jamais rejouée à l'exécution : un rapprochement automatique pourrait changer un
écusson dans le dos de Noé. L'outil écrit `js/logos-clubs.js`, qui relie le nom
EXACT du club à son fichier — un club absent de cette table n'a pas d'écusson,
et l'interface le sait avant de dessiner (pas d'image cassée, pas de requête
pour rien). Ajouter un club au vivier demande donc une ligne dans l'outil et une
exécution ; sans elle, la ligne s'affiche comme avant.

Côté coquille, `js/logos-clubs.js` est préchargé, **les 97 images non** : elles
se mettent en cache toutes seules à la première visite (le service worker garde
ce qui vient de chez nous), là où les précharger allongerait l'installation de
800 Ko — et un seul fichier manquant ferait échouer l'installation entière.

Effet de bord assumé et corrigé le même jour : l'écusson prend 28 px sur la
ligne, et sur téléphone « Real Betis » devenait « Re… ». Le lien du match
**rétrécit désormais huit fois plus vite que le nom** — sa règle disait déjà
qu'il devait céder le premier, mais il était en `flex: none` et c'est le nom qui
se coupait à sa place.

**Toucher une ligne ouvre la fiche du club** (15 août 2026) : ce que les
listes abrègent, sur un écran. Son état (jamais contacté · dans ta fournée ·
écrit tel jour), son prochain match, **les quatre portes en icônes** — la même
rangée que sur une carte de la fournée, quatre lignes titrées prenaient la
moitié de la fiche — et **tous ses contacts — « pas de contact » compris**, au rebours de la carte
de la Passerelle : ici on cherche, on n'agit pas. Chaque contact ouvre sa
propre fiche, qui remplace celle du club — jamais deux fenêtres empilées. Un
« + » y ajoute quelqu'un, et un bouton met le club à la fournée s'il n'y est
pas. Les commandes de la ligne gardent leur geste : le « + » choisit, le lien
du match mène dehors.

**Ses matchs couverts, à droite des infos du club** (demande de Noé, 15 août
2026). **Un seul chiffre** : « au calendrier » et « rencontres » l'ont
accompagné une heure avant d'être retirés le jour même — la fiche dit ce qui a
été fait avec ce club, le reste est déjà plus bas ou ailleurs. Il se pose à
droite, dans la hauteur des deux lignes qu'il longe (les pastilles, le prochain
match), plutôt qu'en rangée sous elles : la fiche dit l'obtenu sans y consacrer
un étage. Il se calcule sur les événements déjà en mémoire, sans une lecture de
plus. Un zéro n'est pas une faute — c'est un club qui attend.

Deux règles tiennent ce chiffre honnête :
- **Un match appartient au club par son LIEN**, `club_recevant` ou
  `club_visiteur` — pas par son titre. Un intitulé n'est pas une preuve : deux
  clubs partagent un mot, et une affiche se réécrit.
- **« Couvert » veut dire VÉCU**, la face vécue de l'événement, posée par un
  geste. Un match posé au calendrier où Noé n'est pas allé ne compte pas.

**Relier un événement à ses clubs, à la main** (demande de Noé, 15 août 2026).
Un match posé depuis le vivier arrive relié tout seul ; un match noté à la main,
ou vécu avant que le lien n'existe, ne l'est pas — et sans lien, il ne compte
nulle part. **Les DEUX formulaires portent donc les deux clubs** : la tuile de
création (pastille « Clubs ») et le formulaire de modification (deux champs de
plus). Le second sans le premier ne servait qu'à rattraper l'oubli ; le premier
permet d'inscrire une sortie passée déjà reliée.

**Et surtout les DEUX formulaires du Carnet** — « Ajouter une sortie » et
« Modifier la sortie » (demande de Noé, 15 août au soir, la vraie place du
besoin) : c'est là qu'une sortie devient le match couvert d'un club, et le lien
doit pouvoir se poser au moment où l'on raconte. « Raconter … », qui se tait sur
tout ce que l'événement sait déjà, les offre quand même : ses clubs sont
justement ce qu'il peut ignorer.

On y **écrit le nom du club**, avec la liste du vivier en appui. Même geste et
même règle que « Rattaché à » sur une fiche du réseau — le nom exact relie,
autre chose délie, un champ vide délie. Le hub n'a pas de vivier et ne voit ni
la pastille (`clubs`) ni les champs (`champsEnPlus`) : même contrat que
`vuesEnPlus`, et un formulaire qui ne les porte pas ne délie rien au passage.

Depuis le vivier, la tuile s'ouvre **pastille remplie** : les deux noms sont
connus, et ce sont ces champs-là qui font foi à l'envoi — Noé peut donc encore
corriger l'affiche avant de poser. Un adversaire absent du vivier laisse son
champ vide, ce qui est la vérité : ce n'est pas un club qu'il suit.

**Ses matchs : trois propositions, pas un calendrier** (demande de Noé, 15 août
2026). La fiche charge les six prochains matchs du club, **écarte ceux qui sont
déjà à ton calendrier** — il n'y a plus rien à en faire ici, et ils occupaient
une place — et **en propose trois au plus**. Chacun est **une tuile**, celle du
week-end : la journée, l'affiche, la date, et **une icône calendrier** au bout.
« Poser au calendrier… » écrivait en toutes lettres ce qu'un symbole dit (même
correction que la vue Week-end). Le geste et l'icône sont les mêmes des deux
côtés — une seule règle CSS, `.poser-match` / `.match-pose`. Quand les trois
prochains sont déjà posés, la fiche le dit plutôt que de se taire : « Ses
prochains matchs sont déjà à ton calendrier. »

**Le geste n'écrit rien tout de suite : il OUVRE la tuile déjà remplie**
(correction demandée par Noé le même jour). Le calendrier publié donne la
journée et l'affiche à coup sûr, mais **le jour exact et l'horaire se précisent
plus tard** : poser directement aurait inventé une heure. La tuile s'ouvre donc
avec le titre, la date approchée, le type « match », le lieu et **les deux
clubs** (`evenements.club_recevant` / `club_visiteur`, portés par l'état, pas
par le formulaire — la tuile est commune au hub et n'a pas à connaître le
vivier), et Noé corrige avant de valider. La fiche le dit en une ligne, plutôt
que de laisser croire à une heure qui n'existe pas.

**Le titre est COPIÉ de l'affiche, jamais dérivé d'elle.** C'est la règle des
préparations, appliquée ici : « Sochaux – Guingamp » naît du calendrier
officiel, puis vit sa vie. Le réécrire en « Ma première accréditation L2 » ne
touche pas aux liens, et corriger un lien ne réécrit jamais le titre. Un match
déjà posé se reconnaît d'ailleurs **à sa date et à son club, pas à son
texte** — c'est ce qui permet de le renommer sans qu'il redevienne à poser.

**Le chemin parcouru s'annonce en tête** (« 12 clubs contactés sur 97 ») : le
chantier a déménagé ici, parce que le chemin et le fonds parlent de la même
chose. Tant qu'il vaut zéro, la page dit « Le premier ouvre la saison ».

### `#yuno/messages` — les modèles de messages *(l'arrière-boutique)*

La bibliothèque a quitté le bas de la Passerelle le 15 août 2026 : **la
friction du premier message se travaille à froid**, en amont du rituel, pas au
bas de l'écran où l'on agit. Titres et corps s'éditent en place, un bouton
copie le texte pour le coller ailleurs. Quatre modèles de départ, chargés en
base : accréditation concert, premier contact club, proposition à un média,
relance courtoise.

#### SA FORME, REFONDUE LE 15 SEPTEMBRE 2026 AU SOIR

**Demande de Noé** : *« fais une refonte de la forme de la page des modèles de
messages pour que ça colle plus à ce que j'attends. »*

**CE QUI N'ALLAIT PAS, ET ÇA SE COMPTAIT.** Le titre était écrit **trois fois** —
la barre du site, un `h2` « Les modèles de messages », et le sommaire d'un pli
« Modèles de messages 4 » — et surtout **la page s'ouvrait REPLIÉE SUR
ELLE-MÊME** : ses quatre modèles dormaient dans un `<details class="backlog">`,
si bien qu'on arrivait sur un écran vide aux quatre cinquièmes.

*Ce n'était pas un choix, c'était un VESTIGE* : ce bloc vivait en bas de la
Passerelle, où un pli est juste — il y était le backlog d'un autre écran. Il a
pris sa page le 15 août, perdu son entrée de navigation le 21, et **personne n'a
jamais redessiné sa forme pour ce qu'il était devenu.** *Une page dont c'est le
seul contenu n'a rien à replier.*

**L'APERÇU NE SE MODIFIE PAS, ET LA FICHE DIT TOUT** (précision de Noé dans la
foulée : *« je préférerais que ce ne soit pas modifiable directement, qu'on doive
appuyer ou activer quelque chose pour modifier ; pour copier il devrait suffire
d'appuyer sur une icône copie plutôt que le bouton avec le texte. Pas besoin
d'avoir le texte en entier du coup, juste un aperçu, et seulement en cliquant sur
la tuile on a le texte complet, la possibilité de modifier et supprimer. »*)

**C'est exactement la grammaire de la banque d'idées**, écrite le 12 août : « la
banque se parcourt en aperçus… toute la fiche est dans une fenêtre volante,
ouverte au clic sur la tuile, avec TOUS les gestes ». *Une page où l'on fouille
montre des aperçus ; ce qu'on a choisi s'ouvre.*

> *Ce que ça reprend à la première passe du soir, faite une heure plus tôt : le
> message entier sur la carte, et l'édition en place. Les deux se défendaient une
> par une et se contredisaient ensemble — **un texte qu'on peut modifier d'un clic
> est un texte qu'on modifie par accident**, et quatre messages entiers font une
> page de 1 600 px qu'on parcourt au lieu de la balayer. Mesuré après la
> correction : **830 px sur un téléphone, les quatre modèles sous les yeux.***

- **LA CARTE MONTRE UN NOM ET TROIS LIGNES.** La coupe est faite par le CSS et non
  par le texte : une troncature en JS aurait posé des points de suspension au
  milieu d'un mot, et surtout elle aurait figé un nombre de signes que la largeur
  de la carte dément. *C'est la leçon de la hauteur mesurée, une heure plus tôt.*
- **L'ICÔNE DE COPIE EST LE GESTE DE LA PAGE**, et il ne demande qu'un appui.
  **C'est l'exception assumée à la règle de la banque** (« l'aperçu ne porte aucun
  bouton, la tuile entière est la cible ») : copier est ce pour quoi on vient ici,
  et devoir ouvrir la fiche pour copier serait deux gestes pour un. Elle vit HORS
  du bouton d'ouverture, posée sur la carte — un bouton dans un bouton n'est ni
  valide ni cliquable.
- **LA FICHE S'OUVRE EN LECTURE**, et le crayon la bascule en formulaire : c'est
  la demande, et c'est déjà la mécanique des fiches d'un moment et d'un contact,
  qui vivent entre l'aperçu et l'édition. *(Cela vaut pour un modèle de MESSAGE,
  dont le corps est un paragraphe qu'on relit. Un modèle de PRÉPARATION, lui, est
  toujours modifiable — voir plus bas : ses lignes sont trop courtes pour qu'un
  clic de trop coûte quelque chose.)*
- **MODIFIER EST UNE ICÔNE, EN HAUT À DROITE** (demande de Noé, le même soir :
  *« pour pouvoir cliquer dessus rapidement »*), **à gauche de la croix de
  fermeture et au même rang** : ce sont les deux gestes qui ne parlent pas du
  contenu de la fiche mais de la fiche elle-même — l'un la corrige, l'autre la
  ferme. Le crayon est celui du site, celui de la fiche d'un moment ; un
  troisième dessin pour un même geste n'apprendrait rien. Le pied ne garde donc
  que « Copier » — le geste qui parle du message — et « Supprimer le modèle ».
- **LES TROIS GESTES SONT SUR LA LIGNE DU NOM** (demande de Noé, le même soir :
  *« aligne les icônes au nom du modèle »*), poussés au bout par le titre qui
  prend la place qui reste. **La fiche n'a donc plus que deux choses : sa ligne de
  tête, et son texte.** **L'ordre est celui de la fréquence** : copier — le geste
  de la page —, puis modifier, puis supprimer, le plus loin de la main qui vise le
  premier.
- **PLUS DE CROIX DE FERMETURE** (même demande : *« enlève la croix, pas besoin si
  lorsqu'on clique à côté ça quitte la tuile »*). Les DEUX autres sorties restent
  — le fond assombri, qui porte `data-fermer-fenetre`, et la touche Échap —, et
  c'est ce qui rend le retrait tenable : une fenêtre sans croix ET sans fond
  cliquable serait un piège. `construireFenetre` prend donc un `fermer: false`,
  **à n'employer que là où la fenêtre ne porte QUE des icônes** : une quatrième
  dans la même rangée aurait fait un signe de plus à lire pour la seule sortie
  qu'on connaît déjà.
- **C'est ce retrait qui a mis les icônes EN FLUX**, là où elles étaient posées en
  absolu dans le coin : il n'y a plus rien à contourner, et le titre n'a plus à se
  réserver leur largeur à la main.
- **LA FENÊTRE EST LARGE** (demande de Noé : *« élargis la tuile »*) — 48 rem au
  lieu de 28, et c'est **la seconde largeur de fenêtre du hub**, pas un troisième
  nombre inventé. Un modèle est un MESSAGE : dans 28 rem il montait au-delà de six
  cents pixels et se lisait en colonne de journal. *Mesuré après : 720 × 510, et
  le message entier tient SANS DÉFILEMENT — du « Bonjour » au « Bien à vous ».*
  **L'édition prend la même largeur** : changer de taille en pressant le crayon
  ferait sauter la fiche sous les doigts.
- **Son formulaire reste en UNE colonne.** Une règle générale range les champs
  d'une `.fenetre-large` en deux colonnes au-delà de 60 rem — juste pour six
  champs courts, faux pour un titre suivi d'un message de douze rangs : la colonne
  de droite aurait porté le message, celle de gauche un champ et du vide.
- **SUPPRIMER NE S'ÉCRIT PLUS**, et la règle qui l'exigeait tient quand même. Elle
  visait la **confusion de dessin** — « la croix de fermeture est au même bord, et
  deux × l'un au-dessus de l'autre, dont l'un est irréversible, est un piège » —,
  pas le fait d'être une icône. **Une CORBEILLE ne se confond avec rien**, la
  confirmation reste posée derrière, et elle est la seule des quatre à se teinter
  de rouge sous la main : c'est le seul geste sans retour de la fenêtre, il doit
  se reconnaître AVANT d'être pressé.
  *Les trois icônes font 2,25 rem, la mesure de `.fenetre-fermer` ailleurs dans le
  site : le hub demande 44 px, mais trois cibles de 44 tiendraient mal sur la
  ligne d'un titre dans une fenêtre de 345 px — et deux tailles d'icône de fenêtre
  selon l'écran seraient pires.*
- **LE TITRE NE SE DIT QU'UNE FOIS**, dans la barre. Le `h2` et la phrase d'aide
  sont partis : « la friction du premier message est le principal mur de
  l'aller-vers » est la raison d'être de la page, pas une chose à relire chaque
  fois qu'on vient y chercher une phrase. Elle reste écrite ici, où elle sert.
- **L'AJOUT EST UNE TUILE POINTILLÉE DANS LA GRILLE** — la règle du hub pour toute
  galerie de tuiles comparables. Ouverte, elle redevient la tuile volante commune
  et perd son pointillé : ce n'est plus une case de la grille, c'est une fenêtre.
- **Le « + » flottant écrit un MODÈLE**, et non plus une tâche : sans ligne dans
  `PLUS_PAR_VUE`, il retombait sur le défaut du site — « poser une tâche », ce qui
  n'a rien à faire sur la page où l'on range ses phrases.
- **`rangs` est né ici** (js/gabarits.js) : un `textarea` de formulaire prenait
  deux lignes, ce qui suffit à une note et pas à un MESSAGE. Sans réglage, rien ne
  bouge ailleurs.
- *Deux défauts corrigés au passage : la confirmation de suppression lisait
  `modele.nom` quand la colonne s'appelle `titre` — elle demandait « Supprimer le
  modèle « undefined » ? » —, et la fiche ne se fermait ni à Échap ni au fond,
  `modeleOuvert` manquant aux deux listes d'états que ces gestes remettent à zéro.*

**Sans entrée de navigation depuis le 21 août 2026** (demande de Noé) : la
page est une arrière-boutique, atteinte par un **lien discret « Modèles de
messages »** posé là où l'on écrit — en bas de la Passerelle et en bas du CRM.
Elle garde l'onglet Réseau allumé, c'est de là qu'on y vient.

**« Envoyé ✓ » d'une piste** enregistre l'envoi et date `date_contacte` — un
fait acquis, qui ne redescend jamais. Avec une fiche reliée, la relation avance
aussi (**une relation vivante ne redescend jamais**) ; sans fiche, le message
est parti au compte du club et l'envoi compte quand même (`journal_envois`
avec `contact_id` NULL).

**Le lundi, un message sans suite devient une relance due** (demande de Noé,
15 août 2026). C'est **le seul état de ce dépôt qui change avec le temps** —
ailleurs, un fait se pose par un geste, jamais par le calendrier. La nuance
tient : « à relancer » n'affirme rien de ce que Noé aurait fait, il lève un
rappel, et il se corrige à la main comme n'importe quel statut.

- La bascule (`message_envoye` → `a_relancer`) se fait **à l'ouverture de la
  Passerelle ou du vivier** : le site est statique, il n'a pas de tâche de
  fond. Une écriture groupée, silencieuse — un rappel n'a pas à s'annoncer.
- Elle ne touche que les fiches **écrites avant la semaine en cours**. Sans
  `date_dernier_envoi`, on ne bascule pas : on ne sait pas quand le message est
  parti, et on n'invente pas un retard.
- **L'écriture précède l'affichage**, au rebours du reste du site : rien ne
  presse, et montrer « à relancer » avant que la base l'ait accepté serait
  afficher un état que personne n'a demandé.
- Le club **revient alors dans les propositions**, avec une pastille
  **« Relance »** — ni alerte ni retard, juste le rappel qu'on ne repart pas de
  zéro. Les relances passent **devant** le tirage (une relance est due, une
  porte neuve est offerte) mais **trois au plus** (`RELANCES_MAX`) : le rituel
  doit continuer d'ouvrir. Au vivier, une relance redevient choisissable.
- Sa carte de fournée retrouve un bouton d'envoi, libellé **« Relancé ✓ »**, et
  `statutApresEnvoi` mène `a_relancer` → `relance`.

**La carte montre TOUT LE MONDE qu'on connaît dans le club** (demande de Noé,
15 août 2026) : au service presse s'ajoutent un joueur, un confrère, un
attaché. Les fiches dont « rattaché à » porte le nom du club — plus celle née
de la piste — s'alignent en une **bande qui défile de gauche à droite**, celle
des pastilles de la tuile de capture, avec un petit **« + » à droite** qui ne
défile pas. **Elle suit l'écran** : courte sur téléphone, elle s'étire sur
ordinateur et montre trois ou quatre personnes d'un coup. Un **fondu** marque
le côté où il reste à voir — posé en JS, jamais quand il n'y a plus rien
après, y compris au redimensionnement. **Les fiches encore à « pas de contact » n'y figurent pas** (15 août 2026) : la
carte montre les gens qu'on a touchés, pas les noms qu'on a notés — ceux-là
vivent au carnet, et le « + » les y rejoint. Le compteur « entrés au réseau »,
lui, les compte : une fiche existe, le nom EST au réseau.

Chaque personne porte **la couleur de son type**, celle-là même que la colonne
« Type » du CRM — le hachage de son libellé (`teinteDuType` appelle la
`teinte` commune) : un joueur est violet des deux côtés du site, une personne
du club turquoise. Pas de table de teintes parallèle, qui divergerait au
premier type ajouté.

**Sous la bande, le menu de la relation** de la personne regardée. Toucher une
autre pastille change la personne, donc le menu ; **toucher celle déjà choisie
ouvre sa fiche** (15 août 2026) — on regarde, puis on veut en savoir plus. La
fiche du carnet s'ouvre alors en fenêtre volante sans quitter la Passerelle,
modification comprise. Ainsi : la carte reste d'un seul
tenant, et un club de cinq personnes n'y prend pas plus de place qu'un club
d'une seule.

**La carte ne disparaît pas de la fournée** (demande de Noé, 15 août 2026) :
elle change de geste. « Envoyé ✓ » cède la place à **l'état de la relation** —
le même menu que la colonne « Relation » du carnet, avec ses sept valeurs et
leurs teintes — qui se fait avancer d'ici, sans passer par le CRM. Sans fiche
reliée, il n'y a pas de relation à suivre : la carte affiche « ✓ écrit
aujourd'hui » et garde son bouton « Noter le contact », pour rattacher
quelqu'un plus tard. La fournée se vide d'elle-même au changement de semaine.

**Le vidage hebdomadaire est réel depuis le 21 août 2026** (décision de Noé —
la phrase ci-dessus était une promesse que rien ne tenait : le commentaire SQL
de `en_fournee` disait même l'inverse). La colonne `fournee_semaine` garde le
LUNDI de la semaine du choix, posée dans le même geste que `en_fournee` ; au
chargement des pistes, le site repère les fournées d'une semaine passée, les
repose au vivier à l'écran et envoie UN update derrière — le site est statique,
il n'a pas de minuit à lui, c'est la première visite de la semaine qui fait le
ménage. Un échec d'écriture ne casse rien : le prochain chargement retente. Un
club contacté sort aussi — sa carte n'était gardée que pour finir la semaine —
et, non contacté, il redevient proposable : il est libre à nouveau. Les
propositions, elles, étaient déjà hebdomadaires (graine = lundi courant, les
« passés » s'effacent avec la semaine) : les deux moitiés de la page tournent
désormais ensemble.

Les autres chantiers évoqués avec Noé — concerts et événements, accréditation
Vélodrome, médias congolais à rythme mensuel — viendront une fois cette forme
validée à l'usage ; le vivier et la carte savent déjà porter le Léopard d'un
club.

Champs d'une fiche hérités de la v1, tous facultatifs : `objectif` (pourquoi ce
contact), `date_dernier_envoi` —
**distinct de `dernier_echange`** : un envoi est un effort à soi, un échange
est bidirectionnel — `prochaine_action` et `prochaine_action_date`, qui portent
la relance au calendrier.

**Les contacts eux-mêmes ne sont pas dans ce dépôt.** Ce sont des données
personnelles réelles (numéros, comptes) et le dépôt est public : elles vivent
uniquement dans Supabase, derrière la connexion. Seul le schéma est versionné.

### `#yuno/missions` — le tableau de bord des Missions *(la page de l'onglet)*

**L'option A, validée par Noé le 21 août 2026 au soir : l'ÉVÉNEMENT est le
pivot.** Une commande le vise (`commandes.evenement_id` — « ce sera souvent
lié à des matchs ou des événements concrets, pas des espaces sur de longs
mois »), une préparation le précède, le Journal en garde le vécu. L'onglet
**Missions** (nom validé) ouvre ce tableau de bord :

1. **« À préparer »** — les événements des **30 prochains jours**, commandes
   en premier puis chronologique, *une seule liste* : chaque ligne dit si
   c'est une commande (étiquette + client) ou une sortie libre (type du
   moment), et porte « Préparer / Ouvrir la préparation ». C'est là que les
   préparations rejoignent les commandes ET les événements sans commande.
2. **« Les commandes »** — le pipeline (devis → livrée, closes repliées),
   chaque commande affichant l'événement qu'elle vise (« Pour X · date »).
3. **Tuile de fin de page → Préparations** — la page à part entière.

`#yuno/commandes` reste une adresse qui montre la même page. Champs d'une
commande : titre, client (relié au carnet quand le nom y figure),
**événement visé** (relié par son titre exact — même règle que « Rattaché à »
pour les clubs, saisie libre), statut, échéance, montant facultatif, lien du
livrable, notes.

**La commande s'ajoute en FENÊTRE VOLANTE** (demande de Noé — « comme
l'ensemble des autres ajouts ») : le « + » flottant des pages Missions
l'ouvre ; le formulaire plié en bas de page a disparu. **« Nouvelle
commande » depuis une fiche du CRM** ouvre la même fenêtre sur la page
Missions, client déjà écrit ; le pré-rempli s'efface en quittant les
Missions, Échap referme.

**Pas de total encaissé** — tranché par Noé le 21 août (« pas pour le
moment ») : l'argent reste une conséquence, pas un juge.

**Le lien au Journal ne demande rien de neuf** : le bilan d'une feuille
inscrit déjà le moment au carnet — Missions tient l'avant, le Journal garde
l'après. La porte « Préparations » du Journal est partie (demande de Noé).

**LE CYCLE VA DU DEVIS À LA LIVRAISON : `devis → en cours → livrée`** — et il
s'arrêtait un cran plus loin, à `payée`, jusqu'au 15 septembre 2026 (décision de
Noé : *« payée et encaissée c'est la même chose pour moi, garde qu'un statut sur
les 2 »*).

**La règle qui fondait ce cran a fini par l'emporter.** Elle était écrite ici
depuis le 21 août : « livrer crée une victoire ; encaisser n'en crée pas une
seconde — c'est le même travail, et l'argent est une conséquence, pas un juge ».
*Si c'est le même travail, c'est le même état.*

**ET LE CRAN DE TROP SE PAYAIT EN EUROS.** `argentDeYuno` ne comptait que les
livrées : une commande passée en « payée » **sortait du compte au moment même où
l'argent arrivait**. Mesuré ce jour-là : deux prestations à 70 €, et l'objectif
« Rembourser mon matériel » affichait **1 115 € au lieu de 1 255 €** sur trois
écrans. *Un cran de plus après la fin, c'est un cran où les choses
disparaissent.*

- **Le CHECK ne se resserre pas** (règle du dépôt : il s'élargit, jamais
  l'inverse — le format `post` d'une publication, l'état `annuel` d'un projet).
  `payee` reste accepté et lisible ; plus rien ne l'écrit, le formulaire ne
  l'offre plus, et `COMMANDE_FINIE` le traite comme une livrée partout.
- **Les deux lignes qui le portaient sont passées à `livree`**
  (`20260915200000_commande_payee_fusionne.sql`). *Ce qui est perdu, et c'est
  assumé : la distinction entre livrée et payée sur ces deux-là.*

**Livrer crée une victoire**, et c'est le dernier cran. Les livrées se replient
en bas, comme le backlog. Une commande à échéance apparaît au calendrier (Yuno
et hub).

### `#yuno/preparations` — les Préparations *(construites le 14 août 2026)*

Préparer une sortie — match, concert, commande — avec des modèles. Une
**feuille de préparation** porte trois phases de cases à cocher (**Avant** ·
**Pendant**, la liste des plans photo · **Après**), puis un **bilan** en deux
questions : « Ce qui a marché » et « À refaire autrement ».

- **Elle naît de la sortie** : la fenêtre de détail d'un événement ou d'une
  commande, au calendrier Yuno, porte « Préparer » — ou « Ouvrir la
  préparation » si la feuille existe déjà. La tuile d'une commande et la liste
  « À préparer » des Missions portent le même bouton. C'est là qu'on est la
  veille d'un match ; l'outil vient à soi. La liste des feuilles vit sur
  `#yuno/preparations` — **une page à part entière, avec les modèles**
  (demande de Noé, 21 août au soir), atteinte par la tuile du tableau de bord
  Missions. Le Journal n'y mène plus. **Les feuilles s'affichent en tuiles
  compactes, plus hautes que larges, côte à côte** (même soir) : titre en
  tête, date en pied, « Bilan écrit » quand il l'est — une rangée se parcourt
  d'un coup d'œil. Les modèles restent en lignes.
- **Les feuilles et modèles du FCH n'apparaissent pas ici** (demande de Noé,
  21 août au soir) : les réunions du club ont leurs propres fiches sur leur
  site. Yuno filtre par l'espace de l'événement lié — une feuille sans
  événement (une commande) est de Yuno par nature — et ne garde que les
  modèles `espace = 'photo'`.
- **Créer une feuille COPIE le modèle.** Modifier le modèle ensuite ne réécrit
  pas les feuilles passées : le bilan d'octobre doit refléter ce qui était
  prévu en octobre.
- **Avec plusieurs modèles, le choix s'ouvre en fenêtre volante** — une liste,
  jamais un menu natif — qui offre aussi la feuille vierge. Avec un seul
  modèle (ou aucun), pas de question : la feuille se crée tout de suite.
- **Les modèles s'éditent depuis le site** (`#yuno/modeles/<id>`) : le nom et les
  items se corrigent en place, une ligne s'ajoute par phase, se retire à la croix.
  Un champ vidé reprend son texte : une ligne sans texte se retire, elle ne se
  vide pas. Supprimer un modèle laisse les feuilles intactes (copies, et
  `modele_id` en SET NULL).

  **ILS ONT PRIS LA FORME DES MODÈLES DE MESSAGES** (15 septembre 2026 au soir,
  demande de Noé : *« reprends à peu près ce modèle pour les modèles de
  préparations : une tuile cliquable, modifiable une fois cliquée, avec la forme
  qu'on a mise à jour ici »*). **C'est la même chose, elle doit se dessiner
  pareil** : deux bibliothèques de modèles dans le même site, l'une en cartes et
  l'autre en lignes, ce sont deux grammaires pour un seul objet. Les classes sont
  donc reprises telles quelles — leur nom dit « modèle », pas « message ».

  - **LA LISTE DEVIENT UNE GRILLE DE CARTES**, et l'aperçu est **la suite de ses
    lignes**, séparées par un point médian : c'est ce qu'on ignore avant d'ouvrir
    — deux modèles nommés « Match » et « Concert » ne se distinguent que par ce
    qu'ils font cocher. Le compte de lignes ferme la carte ; « Créer un modèle »
    est la tuile pointillée de la grille.
  - **PAS D'ICÔNE COPIER**, à la différence d'un message : *on ne colle pas une
    liste de cases à cocher.* La carte ouvre sa PAGE — trois phases d'items ne
    tiennent pas dans une fenêtre, et cette page existe depuis le 21 août.
  - **LA PAGE EST TOUJOURS MODIFIABLE, ET N'A QU'UN SEUL DESSIN** (décision de Noé
    le même soir : *« on va faire plus simple, reprends cette forme, et ça va
    devenir modifiable directement ici, pas besoin d'appuyer sur le bouton en
    plus »*).

    > *Ce que ça reprend, une heure après l'avoir posé : le couple
    > lecture/édition et son crayon. Il venait des modèles de MESSAGES, où il se
    > défend — là-bas le texte est un paragraphe qu'on relit, et un clic mal placé
    > le réécrit. **Ici les deux dessins avaient fini par se ressembler** : à force
    > de retirer les cadres, les filets et l'anneau de focus, l'édition ne se
    > distinguait plus de la lecture que par trois invites grises. **Deux états
    > qu'on ne distingue pas ne sont pas deux états, c'est un geste de trop.***

    **La forme est celle de la lecture** — une puce, le texte, rien autour — et ce
    qui change est que le texte EST un champ : il se corrige là où il se lit, et
    s'enregistre en le quittant, sans bouton. Trois gestes, et c'est tout : la
    **croix** d'une ligne, l'**invite d'ajout** de chaque phase avec son `+`, et la
    **corbeille** du coin pour le modèle entier. Le nom aussi est un champ.
  - **LA CROIX D'UNE LIGNE NE PARAÎT QU'AU SURVOL** (ou au clavier) : onze croix
    alignées feraient une colonne de refus le long d'une liste qu'on vient relire.
  - **LES LIGNES SE TOUCHENT PRESQUE** (demande de Noé : *« resserre les tâches
    entre elles »*) : plus aucun rembourrage, c'est la hauteur de ligne du champ
    qui sépare. **Une liste qu'on relit d'un coup d'œil se lit comme un paragraphe
    de lignes, pas comme onze blocs.** *Mesuré : une ligne passe de 66 px à 30, et
    le modèle entier de 1 047 px à 910 — les trois phases sous les yeux.*
  - **CHAQUE LIGNE PORTE UN ROND À COCHER QUI NE SE COCHE PAS** (demande de Noé :
    *« plutôt que des points de liste à bulle mets des ronds à cocher, mais non
    cochable dans les modèles, juste la forme »*).

    **Et c'est juste** : un modèle est le PATRON d'une feuille, et sur la feuille
    ces lignes-là seront des cases à cocher. Le rond dit donc **ce que la ligne
    deviendra** — on lit le modèle comme on lira la feuille. *Cocher ici n'aurait
    aucun sens : il n'y a rien à faire dans un patron.*

    **C'est un DESSIN, pas un bouton** : un `<span>` décoratif, hors du parcours
    du clavier et muet au lecteur d'écran. Un vrai bouton désactivé se serait
    tabulé pour rien et aurait promis un geste qui n'existe pas. Il reprend le
    trait de `.tache-cercle` — 1,25 rem, le rayon d'une pastille — mais **dans
    l'encre discrète** : la priorité d'une tâche ne veut rien dire ici, et un
    anneau coloré aurait laissé croire à un état. *Il ne coûte pas un pixel à la
    liste : la ligne reste à 30 px.*
    *(Il remplace la puce « · » qui avait tenu une heure, et dont le sélecteur
    avait dû égaler `.bloc .liste-taches-pleine > .tache-ligne::before` — celui-ci
    pose `content: none` sur toutes les lignes pleines du hub. Neuvième fois que
    la spécificité se paie ; le rond, lui, est un vrai élément et n'a plus ce
    problème.)*
  - **NI CADRE, NI FILET, NI ANNEAU DORÉ** (demandes de Noé en trois temps : *« pas
    de contour arrondi pour les zones de texte, le bouton ajouter simplement un +
    et pas de cette couleur, moins gros le texte, moins d'espace entre les
    textes »*, puis *« pas de contour, ni de ligne en dessous… juste le texte en
    gris qui dit ce qu'il y a à marquer ici »*, puis *« pas de rectangle surligné
    en jaune lorsque l'on écrit »*).

    **Un champ encadré dit « remplis ce formulaire »**, et on ne remplit pas un
    formulaire pour corriger une ligne qu'on est en train de relire — c'est mot
    pour mot ce que le hub a tranché le 1er septembre pour le journal d'une
    journée. *Un premier essai a remplacé le cadre par un filet sous le champ ;
    il est tombé aussi, et à raison : onze traits pour dire onze fois la même
    chose.*

    **L'anneau doré apparaissait malgré `:focus-visible`** parce qu'un CHAMP DE
    TEXTE y répond toujours, même pris à la souris — les navigateurs le veulent
    ainsi, un champ devant dire où part la frappe. Il **remettait le cadre qu'on
    venait de retirer**. *C'est la seconde exception du dépôt à WCAG 2.4.7*, et
    elle se justifie comme la première (`.capture-titre`, 13 août 2026) : **le
    curseur qui clignote dit où l'on écrit**. Elle ne vaut QUE pour les champs de
    texte de cette page — **le `+` et la corbeille gardent le leur** : on ne voit
    pas de curseur sur un bouton.
  - **LE BOUTON D'AJOUT EST UN `+`**, à l'encre discrète : le champ dit déjà
    « Ajouter… » dans son invite, et le mot répété au bout de la ligne prenait la
    place de ce qu'on tape. L'aplat d'accent d'un `.bouton-secondaire` faisait du
    geste le plus répété de la page le plus voyant. Le nom accessible garde le mot.
  - **LA PUCE A EXIGÉ SA SPÉCIFICITÉ**, et ça s'est vu à l'écran : `.bloc
    .liste-taches-pleine > .tache-ligne::before` (0-2-2) pose `content: none` sur
    toutes les lignes pleines du hub, et une règle plus faible ne l'écrivait
    jamais. *Mesuré : `content` calculé à « none », la liste sans ses puces.*
    **Neuvième fois que la spécificité se paie dans ce dépôt.**
  - **ET LA FEUILLE A PRIS LA MÊME FORME** (demande de Noé, dans la foulée :
    *« applique cette forme aux préparations également »*). **C'est la même liste
    à un état près** — le modèle est le patron, la feuille l'exemplaire qu'on
    coche —, et elles ne peuvent pas se dessiner autrement l'une que l'autre :
    plus de filet entre les lignes, le même corps de texte, le même champ d'ajout
    nu et le même `+`.

    > *Ce que ça renverse, écrit une heure plus tôt : « rien de tout cela ne touche
    > une feuille de préparation ». Le cadrage était une prudence, pas une règle —
    > et Noé a tranché pour la cohérence.*

    **CE QUE ÇA NE TOUCHE PAS, ET C'EST LA LIMITE** : le rond d'une feuille reste
    un **bouton de 44 px**, visé au pouce au bord d'un terrain. Sa ligne descend
    donc à 6 px de rembourrage et non à zéro comme celle d'un modèle — *deux
    cibles de 44 px sur des lignes de 30 se chevaucheraient, et l'on cocherait la
    voisine.* **Le modèle, lui, n'a rien à viser : c'est ce qui l'autorise à se
    serrer plus.** *Mesuré : la ligne d'une feuille passe de 47 px à 42, sa cible
    reste à 43.*

    **Le FC Hermitage ne bouge pas** : il n'importe de `js/preparations-commun.js`
    que `finDeLaSortie` et `phaseDeLaSortie` — `blocPhase` ne sert qu'à Yuno — et
    tout le reste est sous `body[data-espace="yuno"]`.
  - **LE BOUTON D'AJOUT EST UN `+`**, à l'encre discrète : le champ dit déjà
    « Ajouter… » dans son invite, et le mot répété au bout de la ligne prenait la
    place de ce qu'on tape. L'aplat d'accent d'un `.bouton-secondaire` faisait du
    geste le plus répété de la page le plus voyant ; il s'allume sous la main, et
    c'est assez. Le nom accessible garde le mot.
  - **RIEN DE TOUT CELA NE TOUCHE UNE FEUILLE DE PRÉPARATION**, et c'est vérifié :
    les règles sont cadrées sur ce que seule la page d'un modèle contient
    (`:has(.modele-item)`, `[data-action="ajouter-item-modele"]`). *Une feuille
    qu'on coche au stade garde ses lignes de 47 px, son champ encadré et son
    bouton écrit — resserrer ses cibles tactiles aurait été le contraire du
    service rendu.* Le FC Hermitage, qui passe par les mêmes classes, ne bouge pas
    non plus : tout est sous `body[data-espace="yuno"]`.
- **Un item ajouté en cours de feuille peut entrer « aussi au modèle »** : une
  case à côté du champ d'ajout, décochée à chaque fois — entrer au modèle est
  une décision par item, pas un réglage. C'est la boucle d'apprentissage : le
  modèle s'enrichit du terrain.
- **Le modèle se choisit aussi DEPUIS la feuille** (demande de Noé, 24 août
  2026) : avec un seul modèle, « Préparer » l'applique d'office — il faut
  pouvoir corriger le tir ou compléter. Un pli discret sous le rappel du
  bilan (« Modèle : Match — changer ou compléter ») liste les modèles ;
  **appliquer AJOUTE les lignes manquantes** (même phase et même texte = déjà
  là, on ne double pas), rien de coché ne bouge, une ligne en trop se retire
  de sa croix, et la feuille retient le modèle appliqué (`modele_id` — le
  rappel du dernier bilan et « aussi au modèle » suivent). Pas d'écriture
  optimiste ici : plusieurs insertions, une liste à moitié appliquée serait
  pire qu'une attente.
- **LE BILAN A PRIS LA MÊME FORME** (15 septembre 2026 au soir, demande de Noé :
  *« ça met à jour la forme aussi »*). Ses deux champs s'encadraient en gros
  rectangles arrondis au bas d'une page qui n'en a plus un seul, et son bouton
  portait l'aplat gris d'un contrôle de formulaire. **Un bilan qu'on écrit à chaud
  n'est pas un formulaire** : c'est la suite de la feuille qu'on vient de cocher.
  - **LES DEUX TITRES RESTENT VISIBLES**, et c'est une correction de Noé sur la
    passe précédente (*« garde les titres quand même visibles ici »*). Ils étaient
    passés DANS les champs, par la règle du journal d'une journée du hub — **elle
    ne vaut pas ici** : le journal pose UNE question qu'on connaît par cœur, le
    bilan en pose DEUX, et *une invite disparaît dès qu'on tape*. **Un bilan
    rempli ne disait donc plus à quelle question il répondait**, ce qui est
    précisément ce qu'on vient y relire des mois après. Le titre visible redevient
    le nom accessible du champ ; pas d'invite en double.
  - **Les deux réponses se séparent par un écart** et non par un cadre : sans lui,
    plus rien ne dirait qu'il y a deux questions. Il se pose sur le TITRE de la
    seconde, qui ouvre le bloc — sur le champ, il serait tombé entre une question
    et sa réponse.
  - **Le bouton reste LISIBLE, mais se tait** : c'est un enregistrement, pas
    l'ajout d'une ligne — il ne peut pas se réduire à un signe, on doit le
    trouver. Il perd l'aplat gris d'un contrôle pour l'encre et le voile d'accent
    du site.
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
  espace choisi est photo. Jamais de doublon : si le moment de la sortie existe
  déjà, la proposition disparaît (« Ce moment est au carnet »), et l'invite du
  Journal se tait par le même lien. Ensuite, le moment se corrige au Journal,
  pas depuis le bilan.

---

## 5. Les données

Les tables du hub servent déjà : `objectifs`, `taches`, `evenements`,
`victoires` (espace `photo`). Le schéma complet, colonne par colonne, vit dans
`supabase/migrations/` — **ce dépôt est le gardien unique du schéma Supabase**,
et ce paragraphe ne fait que dire à quoi sert chaque table.

| Table | Ce qu'elle porte |
|---|---|
| `publications` | le calendrier éditorial. `date_prevue` NULL = banque d'idées. `recurrence` / `recurrence_fin` : la rubrique qui revient (26 août 2026) — une publication répétée ne se termine pas, elle repart sur son prochain jour à l'état d'idée. Colonnes Yuno : `pilier`, `preuve`, `pourquoi_moi` (NULL pour le FCH) |
| `contacts` | le carnet réseau, et la couche Passerelle (`objectif`, `date_dernier_envoi`, `prochaine_action`, `prochaine_action_date`). `niveau` reste en base mais plus rien ne l'écrit ni ne le lit depuis le 15 août 2026 |
| `commandes` | le suivi, du devis au paiement. `client_id` relie au carnet, `evenement_id` à l'événement visé (21 août 2026, migration `20260821220000`) |
| `evenements` | **une sortie, deux faces** — prévue (date, lieu, `type_moment`) et vécue (`vecu`, `photo_chemin`, `note`, `oeuvre_finie`). C'est le Carnet de terrain depuis la fusion du 14 août 2026 ; la table `moments` a disparu |
| `rencontres` | qui a été rencontré, à quelle sortie (`evenement_id`). `contact_id` facultatif |
| `journal_envois` | un envoi = une ligne, `contact_id` NULL quand le message est parti au compte d'un club. **Aucune colonne « répondu »** |
| `pistes` | le vivier de la Passerelle : 97 clubs à contacter (division, `leopard`, `en_fournee`, `date_contacte`, `contact_id`) |
| `matchs_pistes` | le calendrier des clubs du vivier, une ligne par match et par piste — chargé par saison, dates indicatives. La vue `prochain_match_par_piste` en sert un par club |
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

Deux surfaces, et une division qui tient en une phrase : **le site est
l'atelier, la page `#photo` du hub est le bilan** (refonte du 26 août 2026).
Le site répond à « qu'est-ce que je fais maintenant », la page à « où j'en
suis ». Elle ne recopie donc rien du site — elle dit ce que le site ne dit pas.

Ce qu'elle porte, de haut en bas :

1. **Une bande de photos**, le tirage du jour du Carnet (`construireMurPhotos`,
   réutilisée telle quelle). Elle ouvre la page **à la place du titre et du
   logo, retirés** : les images disent « Yuno » mieux qu'un mot. Presser une
   vignette mène au Carnet.
2. **Le cap** — les objectifs gravés, en tuile-bouton vers `#objectifs`.
   L'objectif du matériel y porte ses euros.
3. **À faire** — les tâches Yuno, cochables.
4. **Le rythme** — trois chiffres nus (sorties vécues, ce mois-ci, bons
   contacts), le compte des victoires qu'on déplie, et **l'histogramme des
   sorties sur douze mois**. Aucune ligne d'objectif, aucune couleur d'alerte :
   c'est un miroir, pas un juge.
5. **Le réseau** — une barre d'entonnoir en quatre crans d'or.
6. **Les raccourcis en pied de page** — tâche, sortie, publication, prestation,
   matériel — puis la porte vers le site.

**Aucune métrique sociale, sans exception** : la règle du 15 août (§ 4, « Le
rendez-vous stats — retiré ») vaut aussi pour cette page.

**L'argent de Yuno vit dans `commandes`** — `montant` et `frais` — et se
saisit depuis deux endroits qui écrivent la même ligne : la fiche d'une sortie
(ici, sur le site) et le détail de l'objectif dans `#objectifs`.

Sur le dashboard du hub, Yuno garde ce qu'il avait : ses tâches dans
« Aujourd'hui », ses publications datées dans « Ta semaine », et une colonne
dans le cap gravé.

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

Le reste a été tranché. Les six familles du site sont construites : Accueil,
Journal, Créer, Missions (nom provisoire), Réseau, Calendrier. Prochaine
étape : l'usage réel.
