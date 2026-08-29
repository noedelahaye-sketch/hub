# FC Hermitage — cahier des charges du site

Écrit le 7 août 2026, à partir des réponses de Noé. Même méthode que
`yuno-spec.md` : chaque règle porte sa raison, et si une règle gêne à l'usage,
on la change en connaissance de cause.

**Ce document assume son inachèvement.** Noé le dit : « il va y avoir beaucoup
d'usages, certainement beaucoup de choses qui vont être rajoutées au fur et à
mesure », et « je ne sais pas trop encore vraiment ce qu'il y aura à
l'intérieur » des parties marketing et organisation club. On construit donc ce
qui est certain, et on prépare les portes du reste — voir §6.

---

## 1. Ce que ce site est

**L'outil de travail de l'alternance au FC Hermitage** : communication,
partenariats, organisation. Il tient jusqu'à fin décembre 2026 au moins.

**Ce n'est pas le site du club.** Rien ici n'est destiné aux licenciés, aux
parents ou aux partenaires : c'est le poste de travail de Noé, derrière sa
connexion.

**Il vit dans le hub**, en deux surfaces, comme Yuno :

- **`#fch` — la page FCH du hub.** *(Elle n'a plus d'onglet depuis le 28 août
  2026 : on y entre par le grand titre « FC Hermitage » du menu, qui donne aussi
  ses objectifs, ses projets, ses tâches et la porte du site. Voir
  `CLAUDE.md`, « La navigation a deux rangs ».)*
  **Un bilan**, refait le 26 août 2026 sur le
  même principe que celle de Yuno mais avec la matière du club : deux colonnes
  de panneaux — *Le cap* (tuile-bouton vers `#objectifs`) et *À faire* (les
  tâches, plus la prochaine réunion) d'abord, puis *La com'* (le calendrier
  éditorial en chaîne — à préparer, à programmer, publié — et les prochaines
  publications) et *Le bilan* (publications sorties, tâches faites, victoires
  qu'on déplie). Les raccourcis — tâche, publication, réunion — et la porte
  vers le site ferment la page. **Ni titre ni écusson** : la barre le dit déjà.
  Habillage du hub conservé.

  **Pas de bloc partenaires** : il n'y en a aucun en base, ils vivent dans le
  tableur du club, et un panneau toujours vide vaut moins que pas de panneau.
  Pas d'histogramme non plus — trois publications sorties ne font pas une
  courbe de douze mois.
- **`#hermitage` — le site.** L'habillage du hub disparaît : ni « Hub », ni
  onglets, ni autres espaces. Chrome propre, identité du club, une seule
  sortie discrète en pied de page.

---

## 2. Le principe directeur

**La communication d'abord, le reste autour.** Le seul besoin nommé
précisément est « un outil qui m'aide dans mon organisation pour la
communication, avec un calendrier éditorial ». C'est donc lui l'outil phare,
et c'est par lui qu'on commence — exactement comme chez Yuno.

Marketing et organisation club existent comme espaces, mais leur contenu
viendra de l'usage. Un espace vide qui ouvre une porte vaut mieux qu'un outil
inventé à la place de Noé.

---

## 3. Identité

### LA CHARTE OFFICIELLE A REMPLACÉ LES COULEURS RELEVÉES À L'ŒIL (29 août 2026)

Demande de Noé — *« aligne le bleu et les autres couleurs et passe en
gilroy »* —, après lecture de `CharteGraphiqueFCH.pdf` (dossier FCH,
`Communication/Ressources/Charte graphique`).

**Ce que le document donne, et qui change tout : TROIS RAMPES DE CINQ**, pas
trois couleurs. Le site travaillait depuis le 7 août sur trois valeurs relevées
sur le logo — proches, jamais exactes — et devait donc **inventer** tous ses
bleus intermédiaires : `#1e47a8` pour les tuiles, `#16337d` et `#0a102c` pour le
dégradé, `#3a5cba` pour les filets, `#23499f` pour l'accent doux. Cinq bleus
qui n'existaient nulle part au club. La charte les fournit, et c'est le vrai
gain : **on ne devine plus un bleu foncé, on prend celui du club.**

| Rampe | Valeurs, du clair au foncé |
|---|---|
| Bleu | `#4d75db` · **`#113693`** · `#324c8f` · `#243666` · `#15213d` |
| Rouge | `#db4d4d` · **`#cc1919`** · `#8f3232` · `#662424` · `#3d1515` |
| Or | **`#f4c900`** · `#d1ab00` · `#a88900` · `#7f6800` · `#574700` |

Les jetons vivent dans `css/styles.css` (`--club-bleu-1` à `-5`, etc.), nommés
**par leur rang** : c'est ainsi que la charte les pose, et rien d'autre ne les
distingue. Le bleu principal `#113693` **ne bouge pas** — `--fond` le portait
déjà, c'était la seule valeur juste.

Ce que l'alignement a donné, mesuré :

- **La tuile passe de `#1e47a8` au 3e barreau `#324c8f`** et se détache
  DAVANTAGE du fond (1,30:1 en haut du dégradé contre 1,18:1 ; 1,95:1 au pied
  contre 1,66) — elle gagne en présence en devenant plus sobre. Blanc à 8,2:1
  dessus.
- **LE DÉGRADÉ DE FOND NE CHANGE PAS** (`#0039a6 → #16337d → #0a102c`), et
  c'est la seule chose du site restée hors charte. Il est passé à la rampe du
  club le matin du 29 ; Noé a regardé et demandé de **garder celui d'avant**.
  C'est cohérent : le dégradé est le seul endroit du site où la couleur ne
  DÉSIGNE rien — elle éclaire. La charte nomme des aplats (tuile, accent,
  liseré), et ce sont eux qui ont bougé. Une pente réglée à l'œil sur
  plusieurs allers-retours est un dessin, pas un jeton : la refaire avec des
  valeurs « justes » l'aurait rendue plus conforme et moins bonne.
  **Ne pas la « corriger » : c'est la troisième fois qu'on y touche et qu'on
  la remet.**
- **`--erreur` (`#ffb0a8`) NE BOUGE PAS, et ce n'est pas un oubli.** Ce n'est
  pas un jeton d'identité, la charte n'en dit rien, et c'est l'encre d'un
  message de formulaire : l'aligner sur le rouge du club l'assombrirait —
  `#db4d4d` tombe à 2,0:1 sur la tuile, contre 4,7:1 aujourd'hui.

**Le rouge et l'or ne signalent toujours jamais une alerte.** La règle du hub
tient : ce sont des couleurs d'identité, elles ne jugent aucune échéance.

### GILROY, la police du club (même jour, même demande)

La charte donne **Gilroy** (Heavy, Bold, Medium, Thin) et **Bellandha**. Le site
écrivait en Clash Display / Instrument Sans, les polices de Bac-3 — un choix de
commodité, jamais une décision d'identité.

**Elle ne coûte pas un octet de plus** : Gilroy est déclarée dans `css/yuno.css`
(chargée sur les trois pages) en 400/500/600/700/900 — exactement les cinq
graisses de la charte —, et le fichier Bold **vient des ressources du FCH**
depuis le 13 août. Le site override donc `--police-titre` et `--police-texte`
sur `body[data-espace="hermitage"]`.

- **Geist Mono garde les compteurs** : la charte ne donne pas de chasse fixe, et
  Gilroy n'aligne pas ses chiffres en colonne.
- **Bellandha reste dehors** : c'est une anglaise de logo, illisible en
  interface.

---

**Couleurs** — le tableau ci-dessous décrit les RÔLES ; les valeurs viennent
désormais des rampes ci-dessus. Il était mesuré sur `img/fch-logo.png` :

| Rôle | Valeur | Note |
|---|---|---|
| Fond du site | radial `#0039a6 → #16337d (58 %) → #0a102c`, depuis le coin haut droit | **Le mot final de Noé** (21 août 2026 au soir, après plusieurs allers-retours — linéaire, deux couches, puis ceci) : le bleu vif du club rayonne du coin HAUT DROIT et s'assombrit vers le coin opposé, jusqu'au bleu nuit presque noir. Palette de sa première image ; `farthest-corner` en ellipse épouse les proportions de la page. `min-height: 100vh` sur le body, sans quoi une page courte arrêtait le dégradé avec elle et laissait une bande unie dessous. `--fond` reste `#113693`, dans la pente, pour les rares aplats qui la peignent. |
| Tuiles | `#324c8f` | Se détachent sur toute la hauteur du dégradé — discrètes en haut, très nettes vers le pied, et c'est assumé. |
| Accent | `#f4c900` | Le jaune. Seule couleur du club qui ressorte sur ce bleu. |
| Rouge du club | `#cc1919` | Seconde couleur d'identité, dans le liseré. |
| Texte | blanc | |

**Le site FCH est bleu**, quel que soit le réglage du téléphone — comme le
site Yuno est toujours sombre. Deux conséquences assumées :

- **L'accent est jaune, pas bleu.** Un accent bleu sur fond bleu ne
  signalerait rien. Le jaune porte les barres de progression et les
  étiquettes — et ne signale jamais une alerte, la règle du hub tient.
  **L'onglet actif, lui, s'écrit en BLANC depuis le 21 août au soir**
  (demande de Noé — la pastille jaune est partie) : les autres onglets
  restent dans le bleu-gris adapté au fond, et un voile blanc très léger
  garde à l'actif sa forme de pastille.
- **Le logo n'est plus en tête de page : il EST l'onglet Accueil** (demande
  de Noé, 24 août 2026). Le dessin entier en une seule encre, par un masque
  CSS teinté par `currentColor` — blanc plein quand l'onglet est actif, le
  bleu-gris des autres onglets sinon. Le pochoir est un fichier à part
  (`img/fch-logo-pochoir.png`, alpha = l'encre, fabriqué depuis le logo sans
  Pillow — le PNG d'origine porte son épais contour blanc de sticker, qui en
  masque direct rendait une tache pleine).

Le liseré sous la navigation est rouge, plein et fin (2 px), sur toute la
largeur de la barre.

`color-scheme: dark` est déclaré sur le site — sans lui, les contrôles natifs
(sélecteur de date, listes déroulantes) se dessineraient en clair, icône noire
sur fond bleu.

Le rouge et le jaune ne signalent jamais une alerte ni un retard — ce sont des
couleurs d'identité. La règle du hub tient ici comme ailleurs.

**Typographie** — celles du site Bac-3, décision de Noé : Clash Display
(titres), Instrument Sans (texte), Geist Mono (compteurs). Ce sont déjà celles
du hub : le site FCH n'a donc aucune police à charger. Sa différence tient à
la couleur, à la mise en page et au logo.

---

## 4. Les écrans

### `#hermitage` — l'accueil

0. **La réunion du moment** (21 août 2026) — en tête quand une réunion est en
   cours, vient de finir (moins de 24 h) ou approche : sa phase (Avant ·
   Pendant · Après), jusqu'à trois lignes de sa préparation encore à faire,
   cochables d'ici, et la porte vers la feuille. Le pendant de « la sortie du
   moment » chez Yuno : le jour d'un conseil, ce qui compte n'est ni la com'
   ni les objectifs.
0 bis. **LE TEMPS FORT QUI APPROCHE** (30 août 2026) — juste sous la réunion.
   Le club tient huit à neuf temps forts par saison ; ils portent l'essentiel
   de la com événementielle, et l'accueil ne les voyait pas venir — ils
   dormaient au calendrier, à deux gestes de là.

   **Il SITUE, il ne réclame pas** : pas de compte à rebours, pas de « plus que
   3 jours ! », pas de liste de ce qui n'est pas fait. Il dit ce qui vient, le
   lieu, et **ce qui est déjà posé pour ce jour-là** — la seule question qui
   vaille devant un temps fort. « Rien de posé » s'écrit dans la MÊME encre que
   le reste : cinq semaines avant, c'est un fait ordinaire, et le distinguer
   même en plus pâle en aurait fait un reproche silencieux.

   **Horizon de cinq semaines**, et il reste jusqu'au SOIR du jour : la com
   d'un temps fort se fait aussi pendant. Plus loin, il n'appelle encore aucun
   geste et deviendrait un meuble qu'on ne lit plus.

   **`temps_fort` est une DÉCLARATION, et il a fallu le MESURER.** Au 30 août,
   les sept événements FCH à venir — trois entraînements, une séance photo,
   trois temps forts — étaient rigoureusement **indistinguables en base** : ni
   série, ni `avec_photos`, ni présence d'un créneau ne les séparaient. Ne
   restait que le titre, et deviner sur un titre libre est ce que le hub
   refuse. D'où la colonne et sa pastille, sur le motif exact de
   `reunion_objet` et d'`avec_photos`. Les trois déjà posés sont marqués depuis
   le calendrier officiel du club, « Nos Évènements 2026/2027 », qui est aussi
   la source de leurs dates.

   **La pastille passe par un DRAPEAU de l'appelant** (`tempsFort: true`),
   comme `reunion` et `typeMoment` — pas par `espaceInitial`. Sur un SITE il
   n'y a qu'un espace : `espacesOfferts` est nul et `espaceInitial` avec lui.
   Tester `espaceInitial === 'fch'` ne donnait rien, mesuré — la pastille
   n'apparaissait jamais. **C'est le site qui sait qu'il est le club.**
   *(Au passage : « Photos » teste `espaceInitial === 'photo'` et n'apparaît
   donc pas non plus sur `#hermitage`, alors que le CLAUDE.md la dit offerte au
   FCH. Défaut préexistant, non corrigé ici.)*

1. **À FAIRE** — les tâches du club, cochables ici (30 août 2026).
2. **La com' à venir** — les prochaines publications programmées, avec la
   porte vers Créer.
3. **Le cap** — les objectifs en version GRAVÉE (`construireCapGrave`) et une
   porte vers `#objectifs/fch`. On les relit, on ne les règle pas ici.
4. **Victoires** — repliées, avec la porte vers « Le chemin ».

#### CE QUE LA RESTRUCTURATION DU 30 AOÛT A CORRIGÉ

Demande de Noé : « restructure la page d'accueil du site fch ». Le défaut était
structurel, et c'est **la spec elle-même qui le disait** (§1) : *« le site est
l'ATELIER — il répond à "qu'est-ce que je fais maintenant" ; la page du hub est
le BILAN — elle répond à "où j'en suis". C'est la seule division qui justifie
deux écrans. »*

**Les deux rôles étaient inversés sur les deux points qui comptent** :

| | Avant | Après |
|---|---|---|
| Le site (l'atelier) | **aucune tâche**, ouvrait sur trois grosses tuiles d'objectifs + un formulaire d'ajout, fermait sur les victoires | ce qui approche · **à faire** · la com · le cap en porte · victoires repliées |
| La page `#fch` (le bilan) | avait, elle, un panneau « À faire » | inchangée |

L'accueil du HUB avait tranché la même question la veille : « Les objectifs ont
quitté l'accueil. Ils ont leur page à deux gestes, et l'accueil répond à
"qu'est-ce que j'ai à faire", pas à "où je vais". » Le site suit, pour la même
raison.

**« Ajouter un objectif » a quitté cet écran.** Un objectif de fin d'alternance
se décide trois fois dans une année : le formulaire pesait tous les jours pour
un geste triennal. Il vit dans `#objectifs`, là où l'on décide.

**UNE SEULE OCCURRENCE PAR SÉRIE dans « À faire »**, la règle de l'espace Tâches
(`separerLesSeries`, 27 août). Mesuré : **25 tâches s'affichaient d'affilée**,
dont l'essentiel était la même poignée de rythmes répétés seize semaines devant.
Après la coupe : **3**. Le plafond de sept, posé par précaution, n'est même pas
atteint — et au-delà le reste se déplie, rien n'est caché.

**Le cochage est branché**, et c'est le geste du hub — `cocherDepuisTableauDeBord`,
qui ouvre la fenêtre de durée et écrit la victoire. Attention au piège :
`construireLignesTaches` émet `data-cocher`, alors que le calendrier du site
écoute `data-cocher-tache`. Deux attributs voisins, deux gestes distincts — sans
le nouvel écouteur, les cercles auraient été des boutons morts.

Le site a gagné **le « + » flottant** le même jour (décision de Noé) : la
tuile du hub, ouverte sur la nature Événement — une réunion se note en sortant
de la salle. La pastille « Réunion » y est toujours offerte.

### `#hermitage/creer` — l'outil phare

Le calendrier éditorial du club, **le même outil que chez Yuno** : une idée
est une publication sans date, la banque d'idées, les rubriques récurrentes.

**L'état d'une publication se règle depuis le calendrier du site** (27 août
2026), exactement comme sur le hub : le rond de la barre avance d'un cran à
l'appui, la tuile porte sa pastille d'état pour sauter un cran ou revenir en
arrière. En vue mois comme en vue semaine. Le rond était dessiné depuis le
25 août mais n'écoutait rien — le geste est maintenant branché une seule fois
pour les trois calendriers (`brancherEtatPublication`).

**Une rubrique peut se répéter pour de vrai** depuis le 26 août 2026 : la fiche
d'une idée porte « Se répète » et sa fin facultative, comme une tâche ou un
événement. La règle qui en découle vient de la tâche répétée et ne se
« corrige » pas : une publication n'a qu'un `statut`, donc **une publication
répétée ne se termine pas** — la passer en **publié** avance sa date d'une
occurrence et la ramène à **à préparer**. Le lundi suivant attend déjà sur son
jour. Conséquence assumée : elle ne reste jamais en « publié », donc le
compteur « publications sorties » du bilan ne la voit pas passer.

**TROIS états, et non quatre** (demande de Noé, 25 août 2026) :
`à préparer → à programmer → publié`. « Brouillon » et « prêt » disaient deux
fois la même chose pour le club, et aucun des deux ne disait ce qu'il restait à
faire. Les trois réutilisent des valeurs que la base connaît déjà — `idee`,
`pret`, `publie` : le CHECK ne bouge pas, ce sont les mots affichés qui
changent (`nomDuStatut`, js/calendrier-commun.js). La seule ligne du club qui
portait `brouillon` est passée en « à préparer »
(migration `20260825090000`). Yuno garde ses cinq étapes.

**L'état se règle aussi depuis le calendrier du hub** — accueil et
`#calendrier` — de deux façons : le **rond de la barre avance d'un cran** à
l'appui, et la **tuile porte une pastille d'état**, à la suite de celles de la
nature et de l'espace, qui ouvre un menu déroulant — pour sauter un état ou
revenir en arrière. La couleur de la pastille dit l'étape : **rouge** tant que
rien n'est fait, **ambre** quand c'est prêt à programmer, **vert** une fois
publié.

Pas de case à cocher : elle aurait fait sauter « à programmer » — le seul état
qui distingue un visuel qui attend sa date d'un visuel qui n'existe pas encore,
et c'est justement ce qu'on vient voir le matin.

**Une publication s'ouvre au clic et se modifie en fenêtre volante** (demande
de Noé, 24 août 2026) : titre, réseau, format, rubrique (les rubriques déjà
posées en suggestions), date et notes — **vider la date renvoie l'idée à la
banque**, comme « Repasser en idée ». La fenêtre porte aussi **« Supprimer
l'idée »**, écrit en toutes lettres (pas une croix : la fenêtre en a déjà une
pour se fermer, deux « × » superposés dont l'un est irréversible, c'est le
piège que Yuno évite déjà). Le clic n'ouvre PAS depuis un contrôle de la
tuile — avancer un statut ou poser une date garde son geste, la règle de la
fiche du CRM.

Ce qui change du côté FCH :

- **Les réseaux** : Instagram, Facebook (le réseau des clubs amateurs et des
  parents), TikTok. LinkedIn et YouTube restent disponibles.
#### LES RUBRIQUES SONT CELLES DU CLUB (29 août 2026)

Elles répondent à la question ouverte n° 1 du §7, et elles ne sortent pas d'une
liste plausible : elles viennent de l'arborescence `Communication/Réseaux/` du
dossier FCH, éprouvée sur trois saisons, puis corrigée par Noé.

**Ce que ça remplace, et le chiffre qui le justifie** : six rubriques inventées
le 7 août faute de mieux — avant-match, portrait de joueur, coulisses… — dont
aucune ne correspondait à ce qu'il publie. Au 29 août, **42 des 44 publications
du club ne portaient AUCUNE rubrique**. Le champ n'était pas rempli parce qu'on
ne lui proposait pas les bons mots.

Programmation du week-end · Résultats du week-end · Présentation des catégories ·
Trombinoscopes · Reprises · Licences · Calendrier · Saison & plannings · Bilans
de saison · Recrutement · Entente.

**Trois sorties, toutes de Noé**, et chacune dit quelque chose :

- **Les anniversaires ne sont PAS une rubrique éditoriale** : ce sont des
  storys, elles ne passent pas au calendrier. Elles restent un vrai travail — le
  projet « Anniversaires du mois » et sa tâche à la quinzaine ne bougent pas.
  *(Le dossier en compte ~13 par mois : la charge est réelle, c'est sa forme qui
  n'est pas une parution programmée.)*
- **Le joueur de la semaine** désignait autre chose, hors réseaux, et pas cette
  saison.
- **Le MPP** (MonPetitProno × FCH) n'est pas décidé pour cette saison.

#### « La saison » — le bloc qui dit si la com TOURNE

Nouveau le 29 août 2026, en tête de `#hermitage/creer`. Il répond à une question
que le calendrier éditorial ne posait jamais : le calendrier montre les parutions
une à une, il ne dit pas quel **rythme** est posé ni lequel manque. Or l'essentiel
de la charge du club est cyclique — c'est le fait que le dossier FCH a révélé.

**Il ne crée rien qu'il ne sache déjà.** Deux séries hebdomadaires tournaient
depuis le 9 septembre — « Programmation de la semaine » (15 parutions) et
« Programmation foot à 5, 8 et entente » (13) — **sans qu'aucune ne porte de
rubrique**. Le mécanisme des séries marchait ; il était invisible. Le bloc montre
donc l'existant d'abord, et ne propose que ce qui manque.

**LE HUB NE DIT PAS CE QU'IL NE SAIT PAS**, et c'est l'écran qui l'a montré. La
première version proposait de poser « Programmation du week-end » alors que
« Programmation de la semaine » tourne déjà : le même travail sous deux noms,
offert en doublon. Le rapprochement ne peut se faire que sur la RUBRIQUE — un
titre libre ne se compare pas —, or aucune des deux n'en porte. **Tant qu'une
série est sans rubrique, « ce qui manque » est une devinette** : le bloc se tait
sur ce point et montre le geste qui le débloque — nommer. C'est aussi ce qui rend
les parutions comptables par rubrique, donc les indicateurs du club (publications
Instagram/mois, Facebook/mois) calculables sans rien saisir de plus.

**UNE RUBRIQUE PORTE PLUSIEURS RYTHMES**, et c'est Noé qui l'a tranché :
« Programmation de la semaine » ET « Programmation foot à 5, 8 et entente » sont
toutes deux de la « Programmation du week-end ». La rubrique est l'étage du
dessus, les séries sont sa mécanique. La tuile se déplie **sur place** sur ses
rythmes, comme un cap de `#objectifs` se déplie sur ses projets.

**Le geste : rattacher.** Un rythme sans rubrique s'affiche en retrait, en
pointillé, avec un menu déroulant — accepter coûte UN geste, la règle des
propositions du rendez-vous du dimanche. `rubriquerSerie` (js/api.js) écrit
**aux deux étages** : le modèle de la série pour les occurrences à naître, et
les occurrences déjà posées encore à venir — sans quoi les 28 parutions déjà
générées resteraient orphelines et le compte par rubrique mentirait pendant
seize semaines. Ce qui est PASSÉ ne bouge pas : une parution sortie a eu lieu
sous le nom qu'elle portait. Même borne que `arreterSerie`, même raison.

**Les marches disent la CONTINUITÉ, pas une progression.** Une par semaine sur
huit, pleine si une parution y tombe. Ce n'est pas une jauge d'avancement — une
rubrique ne se termine pas —, c'est la réponse à « est-ce que ça tourne ». Un
rythme qui ne reprend que dans trois semaines laisse ses trois premières
marches vides, et c'est une information juste. Rien de posé : le **pointillé**,
comme la jauge d'un projet qui n'a rien déclaré à mesurer.

**Deux états seulement, jamais trois.** Un projet du hub va de « pas commencé »
à « terminé », d'où son gris → bleu → vert. Une rubrique tourne ou ne tourne
pas : un vert lui promettrait une fin qui n'existe pas.

**POSER UN RYTHME QUI MANQUE : le bouton n'écrit RIEN.** Il ouvre le formulaire
« Noter une idée » déjà rempli — la rubrique et la cadence — et laisse le titre
et le jour de départ, qui sont des décisions. Accepter coûte un geste, mais le
hub ne décide pas à la place de Noé.

- **Il ne passe pas par la tuile du « + »** : celle-ci n'a pas de champ
  rubrique, et lui en ajouter un pour ce seul besoin l'aurait posé aux quatre
  espaces.
- **« Se répète » entre au formulaire de CRÉATION** (`champsEnPlus`), alors
  qu'il n'existait qu'à la modification. Poser une rubrique hebdomadaire
  demandait deux gestes — noter l'idée, puis la rouvrir pour la faire revenir.
  Sur un site dont la com est cyclique, c'est le cas ordinaire, pas l'exception.
  Offert **au FCH seulement**.
- **Un champ « choix » se remplit en CLIQUANT son option**, pas en posant sa
  valeur : il porte un input caché doublé d'un bouton d'affichage et d'un
  panneau. Écrire dans l'input laissait « Une seule fois » à l'écran sur une
  récurrence pourtant posée à `hebdo` — mesuré. On passe par le vrai geste, et
  `poserLeChoix` met à jour l'input, le libellé et l'option active d'un tenant.
- **`construireFormulaire({ id })` n'est qu'un PRÉFIXE de champs** : il n'y a
  pas d'élément `#fch-pub`. On part d'un champ connu et on remonte.

**Seules deux rubriques sont des SÉRIES** (`SAISON_HEBDO`) : Programmation et
Résultats du week-end. Les autres reviennent chaque **saison**, à un moment — les
licences en été, les bilans en juin. Leur poser une récurrence hebdomadaire
mentirait ; elles restent des suggestions du formulaire.

**Aucune couleur ne juge.** Une série sans rubrique tourne très bien, elle ne se
compte simplement pas : le manque se dit en creux — un contour pointillé, de
l'encre discrète —, jamais en rouge. La règle du hub tient ici comme ailleurs.

Techniquement : la table `publications` a reçu une colonne `espace` — c'est le
même outil et la même table, filtrés. Un second tableau identique aurait été
une duplication sans raison.

### `#hermitage/reunions` — préparer, tenir, retenir

**Une réunion est une FACE de l'événement** (demande de Noé, 21 août 2026) :
un événement `fch` dont `reunion_objet` est posé — l'objet EST le marqueur,
comme une publication sans date est une idée. Elle se note au calendrier (le
« + », nature Événement, pastille Réunion : objet + « j'anime »), depuis le
site comme depuis le hub — la pastille s'y révèle quand l'espace choisi est
fch, exactement comme le type de moment avec photo.

Les objets : **CA, alternance, communication, partenariat, autre** — la liste
s'élargira si le besoin vient.

#### La FICHE de réunion (refonte du 21 août 2026 au soir)

La feuille à cases de Yuno a tenu une journée : elle listait des gestes, or
préparer une réunion demande une **structure**. Noé a fourni le guide
« Réunions efficaces » du club (`docs/` n'en garde pas de copie — il vit sur
son Drive), et c'est lui qui commande désormais l'outil. Sa thèse, en une
ligne : *une réunion se prépare par un objectif clair, s'anime avec une
méthode adaptée, et se termine par un plan d'action suivi.*

**Deux fiches selon le rôle** (précision de Noé, 24 août 2026) : la fiche
complète ci-dessous vaut quand il ANIME. Quand il **y assiste**, « la
préparation est davantage sur les questions et points que je souhaite aborder
ou régler » — le type de réunion, les envois, l'ordre du jour et la
présentation ne sont pas ses décisions, la fiche ne les demande pas. Elle se
réduit à : **« Ta préparation »** (son objectif de fin de réunion, les
participants, ses questions et points), le suivi des actions, et **Conclure**
au complet — avec, côté Drive, le collage du lien du compte-rendu reçu mais
pas le bouton d'en créer un (« le compte-rendu officiel n'est pas le tien
ici »). L'enregistrement n'écrit que les champs que le formulaire portait :
une fiche de participant n'efface pas un type ou des envois déjà posés.

La fiche complète (j'anime) suit le déroulé du guide, dans cet ordre :

1. **Le contrat** — le **type** de réunion (information · décision ·
   coordination · problème · idées · bilan · gouvernance : le type commande la
   méthode), l'**objectif** sous la forme imposée par le guide — *« À la fin de
   la réunion, nous devons avoir… »*, les **participants nécessaires** (les
   personnes utiles, pas tout le monde), ce qui **s'envoie avant**, et les
   notes de Noé (libellées selon qu'il anime ou assiste).
2. **L'ordre du jour orienté action** — un point = un verbe (*décider,
   valider, répartir…*), un type, un temps, et sa **sortie attendue** : un
   résultat, pas un thème. Le total des minutes s'affiche ; au-delà de trois
   points, une ligne discrète rappelle la limite du guide — un conseil, jamais
   un blocage. **Pendant** la réunion chaque point se clôt : *traité* ou
   *reporté* — le report explicite est une exigence du guide, pas un oubli.
3. **La présentation** (voir le Drive, plus bas).
4. **Ouvrir par le suivi** — les actions encore ouvertes des réunions
   précédentes. « Qu'est-ce qui était prévu ? Qu'est-ce qui a été fait ?
   Qu'est-ce qui bloque ? » C'est l'habitude que le guide place en priorité.
5. **Le kit d'animation** — les six phrases du guide (recentrer, faire
   trancher, clarifier, responsabiliser, éviter le flou, conclure), repliées.
   **Seulement si Noé anime** : un participant n'a pas à porter ce cadre.
6. **Conclure** — les **actions décidées** (quoi, qui, pour quand), puis le
   **compte-rendu court** : décisions, points en attente, prochain point de
   contrôle. Plus ce qui ne regarde que Noé : ce qu'il retient, et — s'il
   animait — le regard sur l'animation, resservi en préparant la suivante.

**Le tableau des actions est la mémoire du club.** Une action décidée y entre
avec son responsable et son échéance, **survit à sa fiche** (`ON DELETE SET
NULL`) et se suit d'un clic : à faire → en cours → fait. L'écran Réunions le
montre en entier ; une fiche montre les siennes plus le suivi des autres.
Cochée « c'est pour moi », l'action devient **aussi une tâche fch** — les deux
restent reliées par `tache_id`, et ce qui se décide en réunion entre dans le
circuit (« Aujourd'hui », l'espace Tâches) au lieu de dormir dans une note.

**Le Drive porte les documents, la fiche porte les portes.** Les présentations
vivent dans *L'Administratif du FCH › Réunions CA*, les comptes-rendus avec
elles. « Créer » **copie le dernier document en date** : la copie Google garde
le thème, les couleurs et la structure du club — rien à reconstruire. Un
bouton met dans le presse-papiers le nom attendu par la convention du dossier
(« Réunion CA - 08/06/26 »), et le lien du document créé se colle sur la
fiche : elle devient le point d'entrée unique.

**PAS de checklist sur les fiches de réunion** — tranché par Noé le 24 août
2026 au soir, après un aller-retour complet dans la journée : les modèles
étaient revenus le matin à sa demande (« le modèle par défaut peut ne pas
être le bon »), regroupés à midi en un modèle par type ; le soir il a retiré
l'avant et l'après — doublons de « Ta préparation » et de « Conclure » —
puis le pendant, puis « ce principe » entier. Les feuilles à cases restent
l'outil des SORTIES Yuno, et les feuilles de réunion ont été supprimées de
la base. **Ne pas ramener les checklists de réunion sans une demande
explicite.**

Ce qui SURVIT de cette journée, et sous quelle forme :

- La **case « J'anime la réunion »**, sous la date de la fiche. Elle écrit
  `reunion_animee` sur l'ÉVÉNEMENT, et la cocher bascule la fiche entière
  dans l'autre version — contrat complet ou préparation de participant, kit,
  Drive.
- Les **modèles, en menu dépliant « Modèles » en haut à droite de la fiche**
  (dernier mot de Noé, le même soir : « on a perdu la possibilité de changer
  de modèle »). Un modèle par type, la version selon « J'anime »,
  « conseillé » sur celui de l'objet de la réunion. Choisir un modèle **verse
  ses lignes en TEXTE dans « Les questions et points / Tes notes »** — pas
  des cases, de la matière à retravailler — et **changer de modèle ÉCHANGE
  ces lignes** (correction de Noé, le soir même : le simple ajout ne
  permettait pas d'en changer, les modèles s'empilaient) : toute ligne du
  champ qui correspond mot pour mot à une ligne d'un des modèles est tenue
  pour « du modèle » et cède la place à celles du modèle choisi ; une ligne
  écrite ou retouchée par Noé n'y correspond plus — elle est à lui, elle
  reste, toujours en tête. Le versement part du contenu ACTUEL du champ
  (brouillon en cours compris), s'enregistre derrière, et **ne redessine
  rien** — une frappe en cours n'est jamais perdue ; si l'écriture échoue,
  le texte reste dans le champ et « Enregistrer » le garde.

### `#hermitage/calendrier` — tout ce qui porte une date

Publications, tâches, événements, objectifs et jalons de l'espace `fch`, groupés
par mois, filtrables par nature. Même module que le hub et Yuno.

### `#hermitage/partenaires` — les partenaires

Le seul contenu certain de la « partie marketing » : les partenariats sont
l'un des quatre objectifs de fin d'alternance. Une fiche par partenaire —
nom, contact, statut de la relation, notes, date du dernier échange.

**Réutilise la table `contacts`** (créée pour le carnet réseau Yuno) : c'est
la même matière — des gens et des structures avec qui on échange. Le
rattachement (`structure`) et le type suffisent à séparer les deux carnets.

### `#hermitage/club` — L'AIDE-MÉMOIRE (rempli le 29 août 2026)

Il a attendu son contenu du 7 au 29 août, et c'était juste : « Noé ne sait pas
encore ce qu'il y mettra », inventer à sa place aurait été le pire service. Le
dossier FCH a donné la réponse — on ne l'invente pas, on le range.

**IL NE FAIT QUE LIRE, et c'est ce qui le justifie.** Rien ne s'y coche, rien ne
s'y compte, aucune donnée n'y est saisie. Il sert l'objectif du 15 décembre —
« laisser une com qui tourne sans moi » : celui qui reprend doit savoir à qui
s'adresser et sur quoi s'aligner.

Quatre blocs, du plus souvent consulté au plus rare :

1. **Qui fait quoi** — les neuf commissions et leurs porteurs
   (`Responsabilités FCH.pdf`). **Les deux commissions de Noé se distinguent, et
   avec NUANCE** : la Communication est LA SIENNE (cinq axes, ses missions
   écrites en toutes lettres) ; côté Partenaires il ne fait que **contribuer** —
   une seule ligne, « contribuer à leur visibilité ». Sans cette distinction,
   l'écran laisserait croire que la prospection est son travail : elle est à
   Lorenzo. **Aucun filet coloré ne les marque** : le libellé « ta commission »
   en accent, la liste des missions (les autres n'en ont aucune) et la hauteur
   qui en découle suffisent. Un filet d'accent a existé une heure, retiré le
   jour même — un quatrième signe ne distinguait plus rien, il décorait, et une
   bordure de côté simule une hiérarchie que le contenu portait déjà.
2. **Le projet** — la mission « transmettre l'envie de jouer » et les six
   valeurs, avec le comportement de chacune. C'est la référence de la ligne
   éditoriale, et l'une des missions écrites de Noé : elles sont là pour être
   RELUES avant d'écrire.
3. **Les entraînements de la semaine** — 16 créneaux, trois sites. Repliés.
4. **Le club en chiffres** — les huit repères du dossier partenaires. Repliés.

**Les données vivent dans `js/club-fch.js`, PAS en base.** Rien n'y change plus
d'une fois par an, rien ne s'y coche : une table aurait demandé une migration,
un écran d'édition et une API pour des lignes que personne ne modifie. Même
choix que `js/logos-clubs.js`. *(Le fichier doit être ajouté à la coquille de
`sw.js` — `node tools/verifier-coquille.js` l'a attrapé.)*

**Les événements de la saison n'y sont PAS**, volontairement : ils sont en base
et se voient au calendrier. Les redire ici ferait deux sources pour une même
date, et c'est toujours la copie qui vieillit.

#### Les tuiles du calendrier éditorial (29 août 2026)

Trois demandes de Noé le même soir — « les tuiles d'idées sont beaucoup trop
grosses, l'état doit être un menu déroulant, elles doivent être plus compactes,
et les publications régulières ne doivent pas toutes être visibles dans à
venir ». Les trois portent sur `#hermitage/creer`, et **les trois sont des
options, pas des règles communes** : `.pub-*`, `corpsPublication` et
`construireAVenir` servent aussi à Yuno, qui n'a rien demandé. Une demande de
forme vise l'écran qu'on regarde.

**L'ÉTAT EST LA PASTILLE DU CALENDRIER**, pas une seconde. Elle vivait enfermée
dans `reglageStatut` (js/calendrier-commun.js) ; elle en sort en
`pastilleStatutPublication`, exportée, et sert des deux côtés — deux copies
auraient fini par diverger, et c'est le genre d'écart qu'on ne voit qu'une fois
qu'un écran s'est mis à mentir sur l'état d'une parution. Elle remplace un trio
qui pesait une ligne entière (« statut : à préparer », un bouton « Passer en à
programmer », « Repasser en idée ») et **sait ce que le bouton ne savait pas** :
sauter un cran, et revenir en arrière.

- `data-pub` porte l'identifiant sur la pastille : hors du calendrier, il n'y a
  pas d'« élément ouvert » pour dire de quelle publication on parle.
  `brancherEtatPublication` le lit en priorité et retombe sur la tuile ouverte
  quand il est absent — le calendrier ne change pas d'un octet.
- **« Repasser en idée » disparaît quand la pastille est là** : le retour en
  arrière vit dans le menu, et garder les deux ferait deux gestes pour la même
  chose, dont l'un efface la date sans le dire.

**LA PASTILLE PASSE EN CREUX ICI, et c'est une question de NOMBRE.** Sur le
calendrier, une pastille se voit à la fois, dans une tuile ouverte : l'aplat
teinté y est juste. Dans « À venir » il y en a onze d'affilée — et comme le
cycle du club commence à « à préparer », elles sont **toutes** au rouge de début
de cycle. Onze aplats rouge sombre sur du bleu se lisent comme onze alertes,
alors que rien ne va mal : c'est l'état normal d'une publication qu'on vient de
noter. Le contour garde l'information (la teinte dit toujours l'étape), et
retire le cri.

**UNE SEULE PARUTION PAR SÉRIE**, le reste replié dessous — c'est la règle de
l'espace Tâches, mot pour mot (`separerLesSeries`, 27 août). Sans elle, les 28
parutions des deux séries hebdomadaires noyaient les quelques publications qu'il
y avait vraiment à préparer : **39 tuiles là où il y en a 11**. Rien n'est caché,
tout se déplie. « Prochaine » veut dire la plus proche, retard compris.

**La compacité, mesurée : 118 px → 77.** Le titre et l'état passent sur la même
ligne — `.pub-titre` et `.pub-actions` sont en `width: 100%` chez Yuno, fait pour
un écran où une publication porte sa preuve, ses notes et une checklist ; ici il
n'y a qu'un titre et un état.

### Écrire du CSS sur ce site : `.bloc ul` et `.bloc li` GAGNENT

Leçon payée trois fois d'affilée en construisant « La saison » (29 août 2026), et
elle vaut pour tout ce qu'on ajoutera ici.

`css/styles.css` habille toutes les listes d'un bloc — `.bloc ul` donne
`display: flex; flex-direction: column; margin: 0; padding: 0` ; `.bloc li`
donne `display: flex; align-items: baseline`, plus le fond, la bordure et le
rayon. C'est l'habit commun du hub, et il est fait pour une LIGNE qui aligne son
rond, son titre et sa date.

**Ces sélecteurs pèsent (0,1,1). Une classe seule pèse (0,1,0) : elle perd**, et
elle perd EN SILENCE — la règle s'écrit, se relit sans faute, et n'a aucun effet.
Trois symptômes constatés dans l'ordre :

1. une tuile dont l'état, le nom et le service partaient sur la même ligne ;
2. une galerie en grille qui restait en colonne, même sur grand écran ;
3. un filet de séparation collé au texte — 0 px mesuré au lieu de 28.

**La règle : toute classe posée sur un `ul` ou un `li` d'un `.bloc` s'écrit
`.bloc ul.<classe>` ou `.bloc li.<classe>`.** La convention existait déjà dans
le hub (`.bloc ul.chiffres-cles`, `.bloc ul.entonnoir-legende`) ; elle n'était
écrite nulle part.

**Et on s'appuie sur l'habit plutôt que de le combattre** : le fond, la bordure
et le rayon d'une tuile de saison VIENNENT de `.bloc li`, ce qui garantit
qu'elle ressemble exactement aux autres cartes du site. On ne reprend la main
que sur ce qui diffère vraiment.

*Ce n'est pas le même piège que `.barre` (CLAUDE.md, conventions), et les deux se
complètent : là c'était un NOM déjà pris, ici c'est un nom libre battu en
SPÉCIFICITÉ. Un `grep` du nom ne l'aurait pas vu — seul le navigateur le dit.*

---

## 5. Les données

Les réunions n'ont d'abord rien créé (21 août 2026, matin) : `evenements` a
gagné `reunion_objet` (CHECK ca · alternance · communication · partenariat ·
autre, non nul = réunion) et `reunion_animee` ; `modeles_preparation` a gagné
`espace`, `objet` et `anime` ; `preparations` a gagné `bilan_animation`.

**Trois tables sont nées le soir même**, avec la fiche de réunion
(`20260821200000_fiches_reunion.sql`) :

- `fiches_reunion` — une par réunion, rattachée à son événement (SET NULL :
  supprimer l'événement ne perd pas ce qui a été préparé). Elle porte le
  contrat (`type_reunion`, `objectif`, `participants`, `infos_avant`,
  `notes_avant`), les deux liens du Drive, le compte-rendu (`cr_decisions`,
  `cr_en_attente`, `cr_suivi`, `cr_date`) et ce qui ne regarde que Noé
  (`bilan_retenu`, `bilan_animation`). `cr_date` se pose à la première
  écriture et ne bouge plus : elle dit quand le compte-rendu est né.
- `fiches_reunion_points` — l'ordre du jour : titre, `type_point`, `minutes`,
  `sortie`, et le `statut` qui clôt le point (à venir · traité · reporté).
  CASCADE : les points appartiennent à leur fiche.
- `actions_club` — le tableau permanent. `fiche_id` en SET NULL (la mémoire
  survit à la fiche), `tache_id` vers la tâche jumelle quand l'action est pour
  Noé, et un `statut` à trois temps.

La limite de trois points par réunion vit à l'écran, **pas en contrainte** :
un quatrième sujet est un choix assumé, pas une faute que la base refuse.

L'espace `fch` utilise :

- `objectifs`, `jalons`, `taches`, `evenements`, `victoires` — les tables du
  hub, filtrées sur `espace = 'fch'` ;
- `publications` — avec la colonne `espace` ajoutée le 7 août 2026, et le
  CHECK `reseau` élargi à Facebook et YouTube ;
- `evenements.temps_fort` (30 août 2026) — booléen, FCH seulement, `false`
  partout ailleurs. Migration `20260830120000_temps_fort_fch.sql`.
- `contacts` — pour les partenaires ; la table n'a pas de colonne `espace`,
  c'est un carnet unique dont le `type` et la `structure` disent l'usage.

Si un besoin réclame plus tard une table propre au club (effectifs, plannings
d'entraînement, licences…), elle se créera par migration versionnée, comme le
reste.

---

## 6. Ce qu'on ne construit pas encore

- **La partie marketing au-delà des partenaires** : rien n'est nommé, rien ne
  se construit.
- **L'éditeur de modèles de réunion** : les six modèles semés se corrigent
  par la boucle « aussi au modèle » depuis une feuille ; un écran d'édition
  complet (comme `#yuno/modeles/<id>`) attendra que le besoin se montre.
- **Toute idée d'outil non demandée.** La structure en sous-adresses
  (`#hermitage/<outil>`) permet d'ajouter un écran sans toucher aux autres :
  c'est ce qui autorise à attendre.

---

## 7. Questions ouvertes

1. ~~**Les rubriques éditoriales du club**~~ — **RÉPONDU le 29 août 2026**
   par le dossier FCH puis par Noé. Voir §4, « Les rubriques sont celles du
   club ».
2. **Les 4 objectifs de fin d'alternance** : lesquels exactement ? Le
   `CLAUDE.md` les mentionne sans les nommer. *(Le document « Objectifs et
   planification Alternance FCH Noé 2025/2026 » du Drive est celui de l'AN
   DERNIER — obsolète, ne pas s'en servir. Ce qui est acquis : la cible de
   revenus partenaires de la saison est de **26 000 €**, et le Google Sheet
   « Listing entreprise 2026-2027 » en comptait 12 050 au 29 août.)*
3. **Les partenaires** : quels statuts de relation te seraient utiles
   (à contacter, en discussion, signé, à relancer) — ou est-ce trop tôt ?
4. **L'organisation club** : dès que tu sais ce que tu veux y trouver.
