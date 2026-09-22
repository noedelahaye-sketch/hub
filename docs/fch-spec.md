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

#### REFONDU LE 16 SEPTEMBRE 2026 : une carte, un bloc, trois portes, le cap

**LA DEMANDE DE NOÉ** : *« pour l'accueil du FCH, il faut réorganiser les infos
qui doivent y être et la forme. Pour cela il faut s'appuyer sur ce qu'on a fait
sur le hub et yuno. »*

**LE DÉFAUT, MESURÉ AVANT DE TOUCHER À QUOI QUE CE SOIT.** La page faisait
**2 018 px** et empilait cinq blocs fixes :

| Bloc | Hauteur | Ce qu'il valait |
|---|---|---|
| Le temps fort | 179 px | utile — et le seul qui bouge d'un jour à l'autre |
| **À faire (13)** | **644 px** | un tiers de la page pour un mur de lignes |
| La com' à venir | 376 px | trois lignes |
| Le cap | 358 px | **huit jalons, aucun atteint** — trois rangées de points vides |
| Les victoires | 186 px | replié |

Deux de ces cinq sont du **bilan** sur un écran dont le §1 dit qu'il est
l'**atelier**. Et pendant ce temps, l'accueil ne disait **rien** de ce que le
site charge déjà à l'ouverture : **65 engagements partenaires sur 69** restaient
à tenir, **7 partenaires sur 20** n'avaient pas viré, et les **54 parutions
posées devant étaient toutes encore « à préparer »**, zéro en « à programmer ».
La chaîne éditoriale était bouchée à son premier cran et la page l'ignorait.

**C'EST LE DÉFAUT QUE YUNO AVAIT LE 15 SEPTEMBRE**, et la réponse est la sienne :

> **L'accueil n'a qu'UN bloc fixe — le travail à faire. Tout le reste est un
> CLASSEMENT : une carte chaude tirée d'une cascade, trois portes tirées d'une
> réserve, et le cap en pied.**

La page ne change pas de **forme**, elle change de **contenu**. *Mesuré après :
**927 px** sur ordinateur, 1 566 sur téléphone.*

#### LA CASCADE — le premier rang satisfait gagne, et il est SEUL

C'est la mécanique du bandeau de l'après du hub (« un seul à la fois ») : deux
cartes chaudes empilées, ce sont deux interruptions.

| Rang | Elle apparaît quand | Ce qu'elle montre |
|---|---|---|
| 1 | une **réunion** est en cours, finie depuis < 24 h, ou à venir | sa phase, les trois points qui restent, la feuille |
| 2 | un **temps fort** à cinq semaines | le lieu, et ce qui est déjà posé ce jour-là |
| 3 | une **parution sort dans 48 h** et est encore « à préparer » | son réseau, sa rubrique, et combien suivent |
| 4 | des **virements partenaires** sont attendus | la somme, et qui n'a pas encore viré |
| 5 | repli | **où en est la chaîne éditoriale** sur quinze jours |

- **L'ORDRE EST CELUI QUE NOÉ A CHOISI**, entre trois propositions : **le moment
  d'abord**. Ce qui a une heure passe devant, puis ce qui part, puis l'argent.
  *« La com' d'abord » a été proposée et écartée : la spec dit « la communication
  d'abord » du SITE entier (§2), pas de sa carte du jour — et le jour d'un
  conseil d'administration, ce n'est pas la story du week-end qui compte.*
- **LES 48 H DU RANG 3 NE S'INVENTENT PAS** : c'est `AVANT_MONTE_A`, le seuil du
  site depuis le 26 août, celui à partir duquel une chose qui vient devient une
  chose à faire. **Seul le premier cran déclenche** : une parution « à
  programmer » a son visuel, il ne reste qu'à poser la date — ce n'est pas une
  interruption. Une parution « à préparer » la veille de sa sortie, si.
- **SON BOUTON MÈNE À LA PAGE DE L'ÉVÈNEMENT** (16 septembre 2026, demande de
  Noé : *« le lien de préparer sa com doit mener à la page de l'évènement »*), et
  non plus au calendrier éditorial : **c'est là que vit sa com** — son calendrier,
  ses idées à poser, ses publications écrites. L'éditorial, lui, montre TOUT le
  club ; il fallait y retrouver son évènement à la main.

  **CE SONT DEUX CHOSES, et c'est ce qui rend le rapprochement nécessaire** : le
  TEMPS FORT est une ligne de `evenements` — elle porte `temps_fort`, elle a un
  créneau, elle vit au calendrier ; la FICHE est une entrée du planning officiel,
  écrite dans le dépôt, et c'est elle qui porte la communication.

  **LE TITRE EST EXCLU COMME CLÉ, et il a fallu le MESURER** :

  | Temps fort (base) | Fiche (planning) |
  |---|---|
  | « Tournoi **de** pétanque » · 26 sept. | « Concours **de** pétanque » · 26 sept. |
  | « Tournoi **R**ose » · 17 oct. | « Tournoi **r**ose » · 17 oct. |
  | « Goûter de Noël… » · **18 déc.** | « Goûter de Noël… » · **19 déc.** |

  *Deviner sur un titre libre est ce que le hub refuse* — la règle posée pour
  `temps_fort` le 30 août, et celle des écussons de clubs : **un rapprochement
  rejoué à chaque exécution peut changer une destination dans le dos de Noé.**

  - **LA DATE EXACTE D'ABORD.** Aucune fiche de la saison ne partage son jour avec
    une autre — *vérifié sur les neuf* —, donc c'est une clé sûre.
  - **PUIS UNE FENÊTRE DE TROIS JOURS, MAIS SEULEMENT SI ELLE NE TROUVE QU'UNE
    SEULE FICHE.** Le goûter de Noël est au **18** en base et au **19** au
    planning ; le bouton ne doit pas attendre qu'on tranche cet écart pour
    marcher. **La garde d'unicité est ce qui empêche de deviner** : les deux
    tournois futsal tombent les 9 et 10 janvier, et un temps fort posé entre eux
    trouverait DEUX candidates — on rend alors `null` plutôt que de choisir à la
    place de Noé.
  - **LE REPLI RESTE L'ÉDITORIAL** quand rien ne se rapproche : un bouton qui ne
    mène nulle part serait pire que celui qui mène un cran trop haut.
  - *Onze cas éprouvés hors écran (`tools/essai-fiche-evenement.mjs`), dont les
    deux qui doivent REFUSER.*

- **LE RANG 4 NE PARLE QUE DES VIREMENTS, et c'est ce qui le rend tenable.** Les
  65 engagements qui restent sont une vérité **permanente** : une carte qui les
  afficherait tous les jours pendant six mois deviendrait un meuble, et elle
  mangerait à jamais le rang du dessous — c'est l'écueil que Yuno a documenté
  avec sa fournée du lundi. **Un virement, lui, arrive** : la carte disparaît
  quand l'argent est là. Les engagements gardent leur **porte**, qui est leur
  juste place — une liste se parcourt, elle n'interrompt pas.
  **Elle ne compte aucun retard** : un engagement n'a pas d'échéance, seulement
  un moment de saison. Le club n'a pas de mauvais payeurs, il a des virements qui
  n'ont pas encore été faits.
- **LE RANG 5 N'EST JAMAIS MUET**, et c'est sa fonction — le dernier rang d'une
  cascade ne peut pas se taire, sinon l'accueil se tait aussi. C'est le rôle que
  « l'idée du jour » tient chez Yuno. **Ce qu'il dit est le fait du club**, et il
  a fallu le mesurer pour le voir : le calendrier éditorial montre les parutions
  une à une, il ne dit jamais que la chaîne est bouchée à son premier cran.
  *Aucun reproche, aucune couleur : « 6 posées, aucune encore prête » est un
  constat.*
- **Le dessin est écrit UNE fois** (`carteChaude`) : il vivait en double, mot
  pour mot, dans la réunion du moment et le temps fort ; il sert cinq rangs
  maintenant.
- **SA PORTE EST UNE TUILE** (demande de Noé, en deux temps : « un bouton de
  couleur pour la tuile dynamique du haut », puis « non, un bouton sous forme de
  tuile dans le même style que ce qu'on fait chez Yuno »). C'est le dessin des
  **portes du site** (`.fch-hall-porte`), en compact — celui des deux halls et
  des trois portes du jour, quarante pixels plus bas : *une porte ne se dessine
  pas deux fois*, et la rangée du dessous l'aurait sinon contredite à l'écran.
  Elle est **un cran plus claire que la carte** — deux surfaces `--fond-carte` ne
  se distinguent pas, c'est la règle du hub pour une tuile posée dans une autre.
  *Ce qu'elle remplace : un `lien-externe` pleine largeur, son filet, son titre et
  sa ligne de service — **trois lignes et 70 px pour un seul geste, soit autant
  que la carte qu'elle ferme**. Un aplat d'accent a été essayé et écarté par Noé :
  une pastille jaune pleine criait plus fort que la carte qui la porte.* Le
  service part dans le `title`, où il ne coûte pas une ligne.
- *La cascade est exportée (`carteDuMoment`) et **ses neuf cas sont éprouvés hors
  écran**, avec des états factices : cinq rangs qui se bousculent, c'est
  exactement le genre de règle qu'on ne croit pas sur parole.*

#### LES TROIS PORTES DU JOUR

**LE DESSIN EST CELUI DES DEUX HALLS DU SITE** (`porte`, js/partenaires-suivi.js)
et il n'est **pas recopié** : une porte ne se dessine pas deux fois.

| Porte | Elle monte quand | Ce qu'elle montre |
|---|---|---|
| **Nos engagements** | il en reste à tenir | « 65 à faire », et les trois chantiers qui pèsent le plus |
| **La com' de la semaine** *(le trou)* | **rien n'est programmé à 7 jours** | la frise des sept jours |
| **Les réunions** | une réunion approche, ou une action attend | la prochaine, et ce qui reste à tenir |
| **Les évènements** | un évènement de saison à six semaines | le prochain, son lieu, sa com écrite |
| **La com' de la semaine** *(ce qui part)* | la semaine porte des parutions | la même frise |
| **Les évènements** | *toujours* | *idem* |

- **Une porte qui n'a rien à dire ne monte pas** : la rangée du jour est un
  classement, pas un inventaire. **Le test porte sur les DONNÉES, jamais sur la
  vitrine** — la frise se dessine même vide, c'est tout son intérêt, elle ne peut
  donc pas servir de test à la porte qu'elle habille.
- **Jamais deux portes de la même rubrique**, sinon un jour chargé aux
  partenaires mangerait la rangée.
- **Les évènements ferment la réserve** : la saison en compte neuf, c'est la
  seule porte qui ait toujours quelque chose à montrer, donc celle qui ne doit
  jamais passer devant une urgence.
- **La com' figure deux fois, et les deux s'excluent** : une semaine SANS rien de
  programmé est une information qui passe devant presque tout — c'est le trou
  qu'un calendrier éditorial est fait pour montrer —, une semaine pleine n'est
  qu'un rappel. Même porte, deux rangs.
- **LA FRISE VIENT DE `js/gabarits.js`**, empruntée à l'accueil Yuno et **non
  recopiée** — elle y a déménagé le même jour. Elle se peint à `--accent` sans
  rien savoir de son site : doré chez Yuno, **le jaune du club ici**. *Mesuré :
  lit à 7 %, marque pleine, aujourd'hui à 16 %.*
- **LA DATE D'UN ÉVÈNEMENT DE SAISON SE LIT, ELLE N'EST PAS STOCKÉE DEUX FOIS**
  (`dateDeLEvenement`, js/evenements-club.js). La table les écrit en toutes
  lettres — c'est la forme du planning officiel et c'est ainsi qu'elles
  s'affichent ; l'accueil a besoin de savoir laquelle approche, on lit donc la
  chaîne plutôt que d'ajouter une colonne ISO à côté. **Deux écritures d'une même
  date finissent toujours par se contredire.** Une date incertaine prend son
  **premier** jour : se tromper d'une semaine en avance sur un loto est sans
  conséquence, l'annoncer une semaine trop tard l'est. *Les neuf dates sont
  vérifiées hors écran.*
- *`portesDuJour` est exportée et son classement est éprouvé hors écran, pour la
  même raison que la cascade.*

#### « À FAIRE » RESTE UN BLOC, ET IL RESTE COCHABLE

**Décision de Noé**, là où Yuno en a fait une porte. C'est juste : le site est
l'**atelier** du club, et cocher une tâche en sortant du stade est le geste pour
lequel on l'ouvre.

**TROIS LIGNES AU LIEU DE SEPT.** Mesuré, il occupait 644 px — un tiers d'une
page qui en faisait 2 018 : c'était le mur que l'espace Tâches a appris à ne pas
dresser. **Le reste se déplie, rien n'est caché** ; c'est la place qui change de
propriétaire. La règle d'**une seule occurrence par série** (`separerLesSeries`,
27 août) ne bouge pas, ni le geste — `cocherDepuisTableauDeBord`, qui ouvre la
fenêtre de durée et écrit la victoire.

**LA TUILE ENTIÈRE MÈNE AUX TÂCHES** (demande de Noé : « simplement appuyer sur
la tuile des tâches pour aller à toutes les tâches »), et le `lien-externe` qui
la fermait est parti avec — il pesait trois lignes pour dire ce qu'elle fait
désormais d'un doigt.

- **PAS un lien qui enveloppe** : elle porte une quinzaine de contrôles, et un
  `<button>` dans un `<a>` n'est ni valide ni cliquable. C'est un **écouteur qui
  se retire** dès que le clic a touché quelque chose qui fait déjà quelque chose,
  et `GESTES_TUILE` est une liste **explicite** — un sélecteur deviné sur le
  curseur marcherait ce soir et avalerait silencieusement le prochain contrôle
  posé sur la tuile. *C'est la mécanique de la tuile d'un partenaire et de celle
  d'« Aujourd'hui » sur l'accueil du hub ; elle est désormais générale au site
  (`data-tuile-vers`).*
- **Le titre porte le lien**, sans en avoir l'air : un écouteur ne se tabule pas,
  et le clavier doit atteindre ce que la souris atteint.
- **Une sélection de texte en cours ne navigue pas** : copier un titre n'est pas
  cliquer dessus.
- *Vérifié à l'écran : la tuile mène à `#hermitage/taches`, et le rond d'une
  tâche ouvre la fenêtre de durée **sans** naviguer.*

#### LE CAP EN PIED, ET IL NOMME LA MARCHE SUIVANTE

**POURQUOI EN PIED** : c'est la leçon que le hub a tranchée deux fois — le cap
passé sous la journée le 13 août, les périodes qui ferment `#objectifs` le 28 —
*« on relit ce qui cadre quand on lève la tête, pas en ouvrant l'application »*.
Yuno l'a fait le 15 septembre ; le club suit.

**CE QUI TUE LA FORME D'AVANT, mesuré** : les trois caps du club portent **huit
jalons dont aucun n'est atteint**. Trois rangées de points éteints, c'est un
accueil qui s'ouvre sur trois zéros. **La marche à venir s'allume au jaune du
club et se lit en toutes lettres** (`marquerSuivant`, js/objectifs-commun.js) :
l'œil tombe sur ce qu'il y a à faire, pas sur ce qui manque. C'est la
philosophie n° 1 du hub appliquée à un cap qui n'a encore rien franchi.

- **Le compte ne s'écrit que lorsqu'il a quelque chose à dire** — dès qu'une
  marche est franchie. « 0 sur 4 » ne dirait qu'un manque, et la règle du hub est
  qu'une série à zéro ne s'affiche pas.
- **Il mène à `#objectifs/fch`** et non à `#objectifs` : on reste dans le filtre
  du club — sortir vers les quatre espaces depuis l'accueil du site serait
  quitter le site pour voir moins précis.
- **L'option est facultative** : rien ne bouge au tableau de bord du hub ni sur
  les pages espace, où le cap se lit en balayant quatre espaces d'un coup.
  *Vérifié : `#dashboard` et `#fch` sont inchangés, aucune marche allumée.*

#### LES VICTOIRES ONT QUITTÉ CET ÉCRAN

Elles étaient du **bilan** sur l'**atelier**, et elles ont déjà deux pages qui
les portent : **`#fch`**, la page bilan du hub, et **« Le chemin »**, faite pour
les regarder. C'est la division que le §1 pose lui-même, et Yuno n'en montre pas
davantage à son accueil. *Décidé sans qu'il le demande, à dire à Noé.*

#### LES LIENS VERS UNE PAGE PÈSENT UN CRAN DE MOINS

**Demande de Noé** : *« les liens vers page ne doivent pas être aussi gros. »*
Le titre d'un `lien-externe` passe du corps courant à 0,875 rem et sa flèche
suit : ce sont des **sorties de tuile**, pas des titres de section, et à taille
égale ils pesaient autant que le contenu qu'ils ferment.

**La règle est portée par le SITE**, jamais par `.lien-externe` : celui-ci sert
aussi le hub, où rien n'a demandé à rétrécir. *Les deux liens Drive des fiches de
réunion — « Ouvrir la présentation », « Ouvrir le compte-rendu » — gardent leur
ligne de service : ils nomment un fichier, ce que leur titre ne dit pas.*

#### LES TUILES DE L'ACCUEIL FLOTTENT

**Demande de Noé** (16 septembre 2026) : *« diminue un peu l'opacité des fonds de
tuiles dans la page d'accueil, et rajoute une légère ombre portée vers le bas à
droite. »*

**CE QUE ÇA CHANGE.** Le fond du site est un **dégradé** — il rayonne du bleu vif
au coin haut droit vers le bleu nuit au coin opposé (§3). Une tuile opaque le
masque ; une tuile qui le laisse passer **en prend la pente**, et deux tuiles
éloignées sur l'écran ne se ressemblent plus tout à fait. *C'est le motif du fond
des tuiles de `#objectifs` teinté à 5 % : à cette dose la nuance ne se nomme pas,
elle se sent.*

**L'OMBRE EST CE QUI LES DÉCOLLE.** Sans elle, une tuile translucide se lit comme
un voile POSÉ SUR le fond, pas comme un objet DEVANT lui — c'est exactement
l'argument de la pastille du dock, la seule autre ombre portée du dépôt : *elle ne
sépare pas une carte de la page, elle décolle un objet d'un autre.* **Vers le bas
à droite** parce que la lumière du site vient du coin haut droit, et qu'une ombre
qui contredit sa source se voit comme une erreur.

- **82 %, et c'est le plus haut des deux crans essayés.** À 72 %, le bleu nuit du
  pied de page traversait assez pour que deux tuiles d'une même rangée n'aient
  plus la même valeur — *la page se lisait en diagonale*.
- **LE CONTRASTE S'AMÉLIORE, et il a été mesuré** : le dégradé qui passe au
  travers est plus sombre que la tuile, donc l'encre ressort mieux.

  | | texte blanc | encre discrète |
  |---|---|---|
  | avant (opaque) | 8,18:1 | 4,72:1 |
  | après, haut de page | 8,69:1 | **5,01:1** |
  | après, pied de page | 9,74:1 | **5,62:1** |

- **LE SURVOL EST UNE VITRE, ET IL ASSOMBRIT** — `rgb(255 255 255 / 7%)` : le
  fond bleu de la tuile **s'efface entièrement**, et il ne reste qu'un voile blanc
  sur le dégradé de la page. C'est le geste que les portes du site ont toujours
  porté, et celui que Noé a reconnu : *« j'aime que ça fasse cet effet lorsque
  l'on passe le doigt dessus. »*
  - **Il assombrit parce que le dégradé est plus sombre que `--fond-carte`** :
    une tuile qui le laisse voir ENTIÈREMENT descend en clarté. *Mesuré au milieu
    de page : 0,0591 contre 0,0709 au repos.*
  - ⚠️ **UN VOILE POSÉ PAR-DESSUS FAIT L'INVERSE, et le prix est mesurable.** En
    passant la translucidité, le survol a été réécrit en voile blanc SUR la tuile
    à 82 % : elle montait à 0,0944 et **l'encre discrète tombait à 4,20:1**, sous
    le seuil AA. Le survol d'origine la porte à **5,55:1**. *Ne pas le
    « corriger » : c'est le fond qui s'efface, pas un voile qui s'ajoute.*
  - **L'ombre reste au survol** : la tuile devient une vitre, l'ombre dit qu'elle
    est toujours devant la page. Les deux ne se contredisent pas.
- **LA PORTE D'UNE CARTE CHAUDE N'AJOUTE PAS SON OMBRE** : elle vit dans une tuile
  déjà translucide, et deux ombres emboîtées à trois pixels l'une de l'autre font
  une tache, pas un relief. Elle garde son cran d'écart, opaque.
- **PORTÉE : TOUT LE SITE** (17 septembre 2026, demande de Noé : *« applique ce
  style aux autres tuiles du site »*). Né à l'accueil la veille, l'effet a été
  étendu le lendemain — *les portes de l'accueil et celles des halls ne peuvent
  pas avoir deux apparences.*

  **LE CRITÈRE EST CELUI DU 30 AOÛT** — *une tuile posée dans la page se distingue
  par sa SURFACE ; le filet ne redevient utile que lorsqu'une tuile est posée DANS
  une autre* —, et il tranche ici pour une raison mécanique :

  | | ce qu'il y a derrière | ce qu'on fait |
  |---|---|---|
  | une tuile **sur la page** | le dégradé | elle le laisse passer, l'ombre la décolle |
  | une tuile **dans une autre** | sa parente | rien : la transparence ne montrerait rien de plus, et l'ombre ferait une tache à trois pixels d'une autre |

  **Sont retenues** : `.fch-tuile`, `.fch-hall-porte`, `.suivi-bilan-tuile`,
  `.suivi-chantier`, `.suivi-partenaire`, `.suivi-offre-carte`, `.orga-groupe`,
  `#orga-resultats`. *Inventorié à l'écran sur les dix-sept pages du site, en
  comparant chaque surface à celle de son parent.*

  **Sont écartées** : `.ajout-tuile`, la tuile de CAPTURE — *elle ne se pose pas
  dans la page, elle vole au-dessus d'un fond assombri, et sa présence vient de
  là* ; les contrôles (`.affichages`, `.cal-fleche`, les champs, les panneaux de
  choix) ; `.fch-portes .lien-externe`, une navigation de pied ; et tout ce qui
  vit dans une autre surface.

  - **UNE TUILE DANS UNE TUILE REDEVIENT OPAQUE ET PERD SON OMBRE.** La règle vise
    des classes, pas des positions : `.fch-tuile` peut vivre dans une `.fch-tuile`,
    et **deux translucidités superposées donnent une valeur qu'aucune des deux n'a
    choisie.**
  - ⚠️ **`#orga-resultats.orga-personnes` ET NON `.orga-personnes`.** La classe est
    portée par TOUS les conteneurs de portraits d'un organigramme — des flex NUS,
    sans fond —, et l'écrire seule leur en donnait un : *c'est le rectangle que
    Noé a vu apparaître entre la tuile d'un groupe et ses photos.* Seul le
    conteneur des résultats de recherche est une tuile, et il se nomme par son id.
  - ⚠️ **DEUX SÉLECTEURS PORTENT UNE SPÉCIFICITÉ QU'IL FAUT ÉGALER**, et les deux
    se sont vus à l'écran — *la tuile portait l'ombre SANS la transparence* :
    `.bloc li.suivi-partenaire` (0-2-1) et `#orga-resultats` (1-0-0). Chacun a été
    trouvé en demandant au navigateur quelle règle gagnait, pas « au cas où ».

  *Vérifié : **98 tuiles sur 21 pages**, aucune sans sa transparence, aucun
  conteneur de photos avec un fond, aucun débordement, aucune erreur console.*

#### LA MISE EN PAGE

Sur ordinateur, la carte chaude et le cap prennent **les deux colonnes**, et pour
des raisons opposées : la première est la seule **interruption** de la page —
elle se lit avant qu'on ait choisi de regarder quoi que ce soit ; le second
**ferme**, et un pied qui ne tiendrait qu'une moitié d'écran ne fermerait rien.
Entre les deux, **le travail à gauche et les propositions à droite**. Tout
s'empile sur téléphone, dans cet ordre.

### LE SITE MONTE LES ÉCRANS DU CAP — `#hermitage/cap`, `/objectif/<id>`, `/projet/<id>`, `/taches`

**Demande de Noé** (16 septembre 2026) : *« il faut d'ailleurs créer une page
tâches dans le site FCH comme c'est fait sur Yuno, et une page objectif, et
projet, comme chez Yuno. »*

**CE SONT LES MODULES DU HUB, PAS DES COPIES** — `js/objectifs.js`,
`js/objectif.js`, `js/projet.js`, `js/taches.js`, soit 4 400 lignes qu'on ne
recopie pas. Et surtout : **deux galeries de caps finiraient par ne plus montrer
la même chose**, et c'est toujours celle qu'on regarde le moins qui ment. Le site
ne redessine RIEN — il pose sa barre, un hôte, son pied, et laisse le module
écrire dedans. C'est exactement ce que Yuno a fait la veille.

**LA DA SUIT TOUTE SEULE.** Ces pages sont écrites en variables (`--fond-carte`,
`--accent`, `--police-titre`), et `body[data-espace="hermitage"]` les a déjà
remplacées par celles du club. *Vérifié : sur `#hermitage/projet/<id>`, le fond
des tuiles vaut `#324c8f`, l'accent `#f4c900`, la police Gilroy — le bleu du
club, son jaune, sa typo, sans une ligne de CSS en plus.*

| Adresse | Ce qu'on y trouve |
|---|---|
| `#hermitage/cap` | les trois étages — caps, projets, périodes |
| `#hermitage/cap/caps` · `/projets` | un seul étage |
| `#hermitage/objectif/<id>` | la page d'un cap : ses jalons, son calendrier, ses projets |
| `#hermitage/projet/<id>` | la page d'un projet : ses étapes, son calendrier, ses tâches |
| `#hermitage/taches` | toutes les tâches du club |

- **L'IDENTIFIANT VIT UN CRAN PLUS BAS.** Le hub range le sien au niveau de la
  vue (`#objectif/<id>`) ; le site a déjà consommé le premier segment pour se
  nommer. C'est le routeur du site qui traduit, **plutôt que d'apprendre une
  seconde forme d'adresse à quatre modules qui n'ont pas à connaître le site.**
- **LES LIENS NE SORTENT JAMAIS DU SITE** (`js/cap-adresses.js`). La base se
  déduit de l'adresse courante et ne se déclare pas : une VARIABLE de module
  serait partagée par les deux montages — le hub et les sites vivent dans la même
  page —, et le dernier monté déciderait pour l'autre. *Vérifié : les dix liens de
  la galerie montée dans le club pointent tous `#hermitage/…`, et la page d'un
  projet revient sur `#hermitage/cap/projets`.*
- **LE TEST PORTE SUR LE PREMIER SEGMENT**, pas sur un préfixe : `#hermitagexyz`
  n'est pas le site. *Éprouvé hors écran (`tools/essai-cap-adresses.mjs`), avec le
  hub, les deux sites et ce cas piège.*
- **DEUX GARDES, ET LA SECONDE EST LA PLUS IMPORTANTE** (`dansUnSite`). La page
  d'un objectif et celle d'un projet posent le titre du navigateur **et**
  `body.dataset.espace`, pour prendre la couleur de leur espace. Depuis un site,
  la seconde remplacerait `hermitage` par `fch` : **le site perdrait son bleu, sa
  police et son dock d'un coup**, au milieu d'une navigation. *Mesuré avant
  correction : `--fond-carte` retombé à `#212426`, le sombre du hub.* La garde
  existait pour Yuno seul depuis le 15 septembre ; une seule fonction la porte
  maintenant, pour que le troisième site n'ait rien à réapprendre.
- **LA PAGE DES TÂCHES NE PARLE QUE DU CLUB** : « Tout ce qu'il y a à faire pour
  FC Hermitage », sans la rangée de filtres par espace — offrir « Yuno » depuis le
  site du club serait une porte vers un ailleurs qu'il n'ouvre jamais. **Le nom
  vient de l'espace filtré**, il ne s'écrit pas en dur : une phrase qui nommerait
  Yuno depuis le club est le genre de faute qu'on ne voit que sur l'écran qu'on
  regarde le moins.
- **LE CAP NE REDIT PAS SON ESPACE** : « Mon cap — FC Hermitage » répétait ce que
  la barre, le fond et la couleur disent déjà.

#### LES NOMS, DANS LE MENU ET DANS LA BARRE

**Quatre entrées sous « Accueil »** — *Le cap · Ses objectifs · Ses projets ·
Ses tâches* —, avant « Le calendrier ». Les deux étages sont deux entrées, comme
chez Yuno : **deux liens qui mèneraient tous deux à `#hermitage/cap` seraient
deux liens identiques**, et trois liens identiques ne sont pas un menu.

- **LA BARRE NOMME L'ÉTAGE** (`ETAGES_DU_CAP`) : sans cela, « Ses objectifs » et
  « Ses projets » ouvriraient deux écrans coiffés du même « Le cap » — le défaut
  des *trois noms pour une page*, corrigé dans le hub le 28 août. **Ce sont les
  mots du menu, à la lettre.**
- **LES DEUX PAGES À IDENTIFIANT N'ONT PAS D'ENTRÉE DE MENU** : un menu ne nomme
  pas une page dont l'adresse porte un identifiant. On y entre depuis la galerie
  ou depuis le cap gravé de l'accueil, et la barre les dit génériquement — *Un
  objectif*, *Un projet*. **Le `h1` du module, juste en dessous, porte le nom du
  cap ou du projet, et lui n'est pas masqué** : un nom précis dans la barre le
  redirait quarante pixels plus haut.
- **LE `h1` EST TU SUR LA GALERIE ET SUR LES TÂCHES**, où il n'est QUE le nom de
  la page — la barre le dit déjà. C'est la règle de Yuno, et **sa feuille de style
  la porte déjà pour les deux sites** : rien à réécrire.
- **LE CAP GRAVÉ DE L'ACCUEIL MÈNE À `#hermitage/cap`** et non plus à
  `#objectifs/fch` : depuis que le site a sa galerie, sortir pour la voir serait
  quitter le site pour montrer ce que le site montre.

#### CE QUE LA RESTRUCTURATION DU 30 AOÛT A CORRIGÉ

> **Historique.** La colonne « Après » de son tableau décrit la page telle qu'elle
> a vécu du 30 août au 16 septembre. Ce qu'elle a posé n'a pas été défait — les
> tâches sur l'atelier, les objectifs qui s'en vont, la coupe des séries : tout
> cela tient. C'est la FORME qui a changé, et le §ci-dessus fait foi.

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

**Ce qu'il pose par défaut est une TÂCHE depuis le 31 août 2026** (décision de
Noé, prise pour tout le hub) : c'était un événement, sans raison écrite, alors
que l'espace Tâches et l'accueil posaient déjà une tâche. La règle du filtre
passe avant — une seule nature cochée, c'est elle qu'on vient poser.

Le site a gagné **le « + » flottant** le même jour (décision de Noé) : la
tuile du hub, ouverte sur la nature Événement — une réunion se note en sortant
de la salle. La pastille « Réunion » y est toujours offerte.

### `#hermitage/creer` — un HALL (refondu le 16 septembre 2026)

**Demande de Noé** : *« fais une refonte de la page communication du FCH, en
ajoutant un lien ou une page pour gérer la communication des évènements. »*

**LE DÉFAUT.** La page portait trois prochaines publications, puis **quatre
rectangles avec un nom et une flèche** — La saison, Le calendrier éditorial, La
banque d'idées, Les publications parues. *Quatre lignes de menu redessinées, et
le menu est déjà à un geste.* C'est ce que les deux autres halls du site ont
corrigé le matin même, et la règle du hall de `#perso` vaut ici mot pour mot :
**une porte doit dire quelque chose qu'on IGNORE avant de l'ouvrir.**

**LES CHIFFRES ONT DONNÉ SA FORME À LA PAGE**, et ils se remesurent. Sur
**79 publications** :

| Ce qui a été mesuré | Ce que ça décide |
|---|---|
| **zéro idée sans date** | la banque est STRUCTURELLEMENT vide — sa porte ouvrait sur rien sans le dire |
| **56 programmées, toutes « à préparer », zéro « à programmer »** | la chaîne est bouchée à son premier cran |
| **3 séries hebdomadaires portent 48 des 79** | la com du club est CYCLIQUE — le fait que le dossier FCH avait révélé |
| **27 sans rubrique**, une sur trois | ce qui empêche de compter par rubrique, et que « La saison » corrige |
| **un seul évènement sur neuf a de la com** | et **rien ne menait de la communication vers eux** — le manque que Noé a nommé |

**LE BILAN EN TÊTE, PUIS LE HALL.** Garder le tableau de bord au-dessus des
portes est la décision que Noé a déjà prise pour les partenaires — *« on garde le
dashboard de haut de page, c'est très bien »*. On regarde, puis on entre. Le
dessin est celui du bilan des partenaires (`suivi-bilan`), **emprunté et non
recopié** : deux tableaux de chiffres dans le même site ne peuvent pas avoir deux
dessins.

**Quatre chiffres** : les parutions de la semaine · les rythmes qui tournent ·
les publications parues · ce qui reste sans rubrique. *Le dernier est le seul qui
compte un manque, et il est là parce qu'il appelle un geste précis — « La
saison » le range. Aucune couleur, aucun seuil.*

**CINQ PORTES, dans l'ordre de ce qu'on vient faire** — ce qui part, puis les
deux chantiers, puis ce qu'on relit :

| Porte | Ce qu'elle montre |
|---|---|
| **Le calendrier éditorial** | la **frise de la semaine** et les deux prochains titres, avec leur réseau |
| **Les évènements** | le prochain de la saison, sa date, son lieu, et **combien de publications lui sont écrites** |
| **La saison** | les rubriques du club, en pastilles |
| **La banque d'idées** | les deux dernières idées — ou son vide, en toutes lettres |
| **Les publications parues** | leur nombre, et la dernière parue |

- **LA PORTE DES ÉVÈNEMENTS EST LA DEMANDE**, et son compte est un rapport —
  « 1/9 » : combien d'évènements ont une com écrite. Ils vivaient sous « Le
  club », où l'on va voir ce que le club EST ; leur **communication** est un
  chantier, et elle se prend d'ici.
  - **C'est une porte du hall, PAS une entrée de menu** : le menu garde « Les
    évènements » sous « Le club », son rangement du 16 septembre. Deux entrées de
    menu pour une page, ce seraient deux endroits à tenir d'accord ; une porte
    dans un hall, c'est justement ce que le second rang permet.
  - **Elle porte le nom de sa page** — « Les évènements » et non « La com des
    évènements » : un nom sur la porte et un autre en tête de page, ce sont deux
    noms pour une page. **C'est le contexte qui dit de quoi on parle** — elle vit
    dans le hall de la Communication, et son aperçu ne parle que de com.
  - *Conséquence assumée : on arrive sur une page dont l'onglet du dock est
    « Club » et dont le retour dit « ← Le club ». C'est son rangement vrai, et le
    dock dit toujours où l'on EST, pas d'où l'on vient.*
- **LA FRISE EST CELLE DE L'ACCUEIL** (`vitrineDeLaCom`), empruntée : une vitrine
  ne se dessine pas deux fois. Elle dit la **forme** de la semaine — où sont les
  trous —, les deux titres disent **quoi**. Deux lignes au plus : au-delà, la
  porte redirait la page qu'elle ouvre.
- **LA SAISON NE COMPTE QUE LES RUBRIQUES ÉDITORIALES.** Une rubrique d'évènement
  (« Évènement · Concours de pétanque · 26 septembre 2026 ») n'en est pas une :
  c'est le marqueur qui relie une publication à son évènement, et la porte d'à
  côté le dit déjà. *Mesuré : elle s'affichait en toutes lettres sur trois lignes
  et faisait compter quatre rubriques au lieu de trois.* `estRubriqueEvenement`
  existe exactement pour ça.
- **LA BANQUE DIT SON VIDE** — « Rien en réserve. Une idée notée ici attend son
  jour. » C'est une information (elle n'a jamais rien contenu) et une invitation :
  un vide ouvre une porte, il ne s'excuse pas.

**CE QUI EST PARTI** : l'aperçu des trois prochaines publications et la rangée de
liens. Le premier disait ce que la porte du calendrier éditorial montre désormais
— la semaine, ses trous et ses deux prochains titres —, et **deux endroits pour
une même chose finissent par se contredire**. `portesDuMenu` part avec, faute
d'appelant ; `portes()` reste, les réunions s'en servent.

*Les quatre sous-pages ne changent pas — elles gardent leur formulaire et leur
retour « ← Communication ».*

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

##### D'OÙ ELLE VIENT, ET SI ELLE EST FAITE (20 septembre 2026)

Demande de Noé : *« pour le suivi des actions, je dois savoir de quelle réunion
elles proviennent et pouvoir noter si elle a été faite. »*

**LES DEUX EXISTAIENT EN BASE ET MANQUAIENT À L'ÉCRAN** — `actions_club` porte
`fiche_id` et `statut` depuis le premier jour.

- **La réunion d'origine ne s'écrivait nulle part.** Sur le tableau permanent,
  qui mélange les réunions, « Créer le compte LinkedIn FCH » ne disait pas d'où
  il sortait — et c'est la première question qu'on se pose devant un engagement
  qu'on ne se rappelle plus avoir pris. **Elle est un LIEN** : savoir d'où vient
  une action et pouvoir y retourner sont la même envie.
- **Elle ne s'affiche que là où elle apprend quelque chose** : le tableau
  permanent et « Ouvrir par le suivi ». Sur la fiche d'une réunion, ses propres
  actions ne répètent pas son titre.
- **Noter qu'elle est faite se faisait DÉJÀ**, en pressant l'étiquette de
  statut — mais **une étiquette ne se présente pas comme un geste**. Elle a la
  forme d'un libellé, et Noé ne l'a pas trouvée. Le hub a pourtant UN signe pour
  « c'est fait », qu'il emploie partout : **le rond d'une tâche**. C'est
  celui-là, au trait près, comme les feuilles de préparation l'ont repris avant.
- **Les deux gestes coexistent, et ce n'est pas un doublon** : le ROND fait
  l'aller-retour « fait / pas fait », qui est le geste quotidien ; l'ÉTIQUETTE
  garde son cycle à trois crans, seul chemin vers « en cours ». C'est déjà la
  grammaire d'une publication au calendrier.
- **Décocher rend « à faire » et non « en cours »** : on rouvre ce qu'on avait
  fermé par erreur, on ne devine pas où ça en était.
- *Ce qui ne change pas : une action cochée quitte le tableau permanent — il ne
  montre que ce qui reste à tenir — et reste sur sa fiche, barrée, où elle
  raconte sa réunion.*

#### LA CHAÎNE DES RÉUNIONS — `cr_suivi` POSE LA SUIVANTE (20 septembre 2026)

Demande de Noé : *« dans le compte rendu, lorsque je mets une date de prochaine
réunion, il faut que ça crée l'évènement à cette date avec le même nom que la
dernière réunion + le numéro — pour la réunion Lina du 18 septembre, j'ai mis
que la prochaine serait le 25, donc au 25 un évènement "Réunion Lina 2" doit
être créé, et donc être lié à la réunion du 18 pour que ma préparation soit
aidée par le compte-rendu de la dernière réunion. »*

**C'EST LA RÈGLE DU HUB À LA LETTRE** — *ce qu'il a DÉCLARÉ devient une vraie
ligne*. Poser une date de prochain point de contrôle est une déclaration :
elle donne donc un VRAI évènement, qui se déplace, se prépare, porte sa fiche
et apparaît au calendrier. `cr_suivi` garde son sens ; ce qui change, c'est
qu'elle POSE ce rendez-vous au lieu de l'annoncer.

- **LE NUMÉRO VIENT DE LA CHAÎNE, JAMAIS DU TITRE**, et c'est ce qui rend la
  règle sûre. Lire le nombre écrit à la fin d'un nom marche sur « Réunion
  Lina 2 » et se trompe sur « Réunion CA 2026 », qui deviendrait « Réunion CA
  2027 » — une année prise pour un rang, invisible avant d'ouvrir le
  calendrier. On remonte donc les maillons : le titre de la **racine** porte le
  nom, la **longueur** porte le rang, et aucun texte n'est interprété.
- **LE LIEN EST SUR `evenements.suite_de_id`, PAS SUR LA FICHE** : au moment où
  la suite naît, elle n'a pas encore de fiche — celle-ci se créera quand Noé
  appuiera sur « Préparer ». Une chaîne accrochée aux fiches aurait un maillon
  manquant précisément là où on en a besoin. Et elle survit à la suppression
  d'une fiche : la suite des réunions est une histoire du club.
- **L'HEURE ET LA DURÉE SONT CELLES DE LA PRÉCÉDENTE**, comme l'objet et
  l'animation : un cycle garde son créneau, et le compte-rendu ne demande qu'un
  JOUR. Lui inventer 9 h du matin serait poser un horaire que personne n'a dit.
- **REJOUABLE** : réenregistrer un compte-rendu ne pose pas une seconde
  réunion, et changer la date **déplace** celle qui existe — sans quoi une fiche
  déjà préparée se retrouverait accrochée à un fantôme. **Le titre ne se
  réécrit pas en déplaçant** : Noé a pu le corriger.
- **ON NE SUPPRIME JAMAIS** : effacer la date laisse la réunion au calendrier.
  Elle a pu recevoir une fiche, des actions, une préparation — *« le hub ne
  supprime pas ce que Noé pourrait vouloir voir »*. Il la retire lui-même au
  calendrier, où ce geste demande confirmation.
- **Sans évènement, pas de suite** : une fiche sans réunion n'a ni heure, ni
  objet, ni chaîne à prolonger.

**CE QUE DISAIT LA PRÉCÉDENTE**, sur la fiche de la suite : ses **points en
attente** d'abord — ce sont eux qui appellent une suite —, puis ses
**décisions**, et un lien vers elle. *C'est le guide qui le demandait déjà —
« chaque réunion s'ouvre par le suivi du précédent » — et il n'y avait rien pour
le faire : le tableau des actions suivait les engagements, mais le compte-rendu
restait enfermé dans la fiche d'avant.* Le rapprochement se fait **par la
chaîne**, à la différence du « dernier regard sur l'animation » juste au-dessus,
qui cherche une réunion du même OBJET — un rapprochement flou qui rend
n'importe quelle réunion « communication ». Les deux coexistent parce qu'ils ne
répondent pas à la même question.

#### LA FICHE SE LIT EN BLOCS, PAS EN COLONNE (20 septembre 2026)

Demande de Noé : *« pour la préparation, sur ordinateur il doit y avoir des
blocs côte à côte plutôt que tout ligne par ligne. Le récap de la dernière
réunion et les tâches du suivi doivent être en haut côte à côte et facilement
masquables. Le contrat et l'ordre du jour côte à côte, le reste on est bon. »*

**CE QUE ÇA RANGE** : la fiche était une colonne de sept blocs — un écran et
demi de défilement avant d'atteindre le contrat, sur un écran qui a de la
largeur à revendre. Les deux blocs du haut sont de la RELECTURE (ce qui s'est
dit, ce qui reste à tenir), les deux suivants du TRAVAIL (ce qu'on se donne,
comment on le mène) : les apparier deux à deux, c'est mettre ensemble ce qui se
lit ensemble.

**« CE QUI VIENT D'AVANT » EST UNE SEULE GRANDE TUILE, AVEC UN SEUL PLI**
(correction de Noé, le même jour : *« les 2 blocs doivent être une grande
tuile, et je dois pouvoir les masquer ensemble, pas l'un puis l'autre »*).
*Ils ont eu un pli chacun pendant une heure, au motif qu'ils ne servent pas au
même moment — le récap se lit avant, le suivi se coche pendant. Mais ce ne sont
pas deux blocs qu'on range l'un après l'autre : c'est UNE chose, ce qui vient
de la réunion d'avant, et on la range d'un geste pour atteindre le travail.*

- **LE TITRE DE LA TUILE EST LE SEUL** (correction de Noé, le même jour : *« enlève
  les titres "ce que disait la précédente" et "ouvrir par le suivi" »*). Les deux
  colonnes en ont porté un pendant une heure ; **ce qui se montre n'a pas à se
  nommer** — la règle qui a fait tomber quatre titres de la tuile d'une journée,
  le 1er septembre. Chaque colonne se dit déjà toute seule : à gauche le NOM de
  la réunion d'avant, en lien et en tête ; à droite la phrase qui demande
  « fait, en cours, bloqué ? ».
- **Le suivi a changé de rang au passage** : il vivait en cinquième position,
  sous la présentation — donc après tout le travail de préparation, alors que le
  guide demande qu'une réunion « s'ouvre par le suivi du précédent ».
- **L'ÉTAT DU PLI VIT DANS L'ÉTAT DE LA PAGE**, et ce n'est pas un luxe : on
  coche une action DANS le bloc du suivi, et cocher redessine la fiche entière.
  Un `<details>` rouvert à chaque coche serait insupportable au moment précis où
  l'on s'en sert. *C'est la différence avec le relevé d'une journée, qui s'en
  passe parce qu'il ne se redessine pas pendant qu'on le lit.* De l'état
  d'INTERFACE : il ne va pas au cache.
- **`toggle` NE BULLE PAS** — l'écouteur est en CAPTURE, posé une fois sur la
  section plutôt que sur chaque `<details>`, qui sont recréés à chaque rendu.
- **UN DUO NE SE FORME QU'À DEUX** : un seul bloc présent reste pleine largeur.
  Une réunion à laquelle on N'ASSISTE PAS n'a pas d'ordre du jour, et une
  première réunion n'a pas de précédente — les deux cas arrivent.
- **Le seuil est à 60 rem**, celui des deux colonnes du hub : en dessous, deux
  colonnes de moins de 30 rem replieraient les lignes d'action mot à mot.
- **`minmax(0, 1fr)` et non `1fr`** — le piège des conventions, qui ne se voit
  jamais sur l'écran large où l'on travaille.

**LE CONTRAT ET L'ORDRE DU JOUR SONT DES TUILES, TOUJOURS** (demande de Noé, le
même jour). Ils étaient **les deux seuls blocs de la fiche à ne pas l'être** —
la présentation, le kit d'animation et « Conclure » portaient déjà
`.fch-tuile`. Ils l'empruntent donc plutôt que d'en dessiner une seconde, et
« toujours » veut dire à toutes les largeurs : une tuile dit par sa surface où
elle commence, et c'est vrai côte à côte comme empilé.

**LES LIGNES DU SUIVI SE SERRENT** (demande de Noé, le même jour : *« réduis la
taille des tuiles des tâches dans ce qui était prévu »*). *Mesuré avant : 91 px
par ligne* — la taille d'une tâche qu'on vient FAIRE, alors que celles-ci sont
un RELEVÉ qu'on parcourt en ouvrant la fiche. C'est le précédent des feuilles de
préparation, au mot près : « une checklist qu'on parcourt d'un œil ».
**Seulement ici** : le tableau permanent (`#hermitage/actions`) est la page où
l'on vient les TRAITER, ses lignes gardent leur air.

- **LE NOM DE LA TÂCHE RESTE CE QU'ON VOIT LE PLUS** (correction de Noé, dans la
  foulée). *Ce que le resserrement avait cassé : le titre était descendu à
  12,2 px pendant que le responsable restait à 13 px EN GRAISSE 600 — le service
  criait plus fort que le sujet.* **On ne remonte pas le titre, on descend le
  service** : le remonter défaisait le resserrement qu'on venait de demander.
  C'est la règle de la tuile d'un livre — le titre porte seul le poids.
- **LA CIBLE DU ROND RESTE À 44 px**, alors que son glyphe descend à 16 : elle
  vit dans le rembourrage, pas dans le dessin. *Mesuré sans cette part : 39 px,
  sous le minimum du hub.* Et `.tache-cercle` est en `rem`, pas en `em` — il ne
  suit donc PAS le corps du texte, il faut le régler.

**LA HIÉRARCHIE FINALE D'UNE LIGNE DU SUIVI** (demande de Noé, dans la
foulée : *« augmente la taille du nom des tâches et réduis un peu l'état »*) :

| | |
|---|---|
| le nom de la tâche | **14,1 px**, graisse 500 |
| la réunion, le responsable, la date | 10,3 px |
| l'état | **9,4 px** |

**9,4 px EST LE PLANCHER, et il est connu** : c'est la mesure à laquelle le dock
s'est arrêté le 16 septembre — *« à un cran de moins, "Calendrier" tombait à
8,4 px, où ce n'est plus un mot mais une trace »*. On n'ira pas plus bas, et
l'étiquette garde ses capitales, qui se lisent mieux en petit.

**LES PHRASES D'AIDE DE LA FICHE SONT PARTIES** (demandes de Noé, captures à
l'appui) — « si personne ne peut compléter "à la fin, nous devons avoir…" »,
« chaque point commence par un verbe », « le premier point donne le ton », « à
chaud, sous 48 h — c'est l'après-réunion qui transforme la discussion en
fonctionnement du club ». Elles expliquaient des champs dont l'invite dit déjà
la même chose deux lignes plus bas. C'est la coupe déjà faite sur la tuile
d'une journée.

##### LA TUILE D'UN POINT DE L'ORDRE DU JOUR (20 septembre 2026)

Demande de Noé, capture à l'appui : *« le nom doit être davantage mis en avant,
le temps estimé plus petit, la sortie attendue en dessous du titre (pas de texte
"sortie attendue", juste la sortie elle-même), pas de bouton traité et reporté,
moins d'espace entre le nom et la pastille "décider" »*.

| | avant | après |
|---|---|---|
| le nom du point | 15 px / 400 | **17,8 px / 600** |
| le temps estimé | 15 px, dans l'en-tête | **13 px, à droite, sur la ligne du titre, en jaune et en italique** |
| la sortie attendue | « Sortie attendue : … », à la suite | sous le titre, sans libellé |
| la pastille de type | 10,3 px | 9,4 px |
| la croix | après la durée, à gauche | à droite de la tuile |
| l'écart pastille → titre | 12 px | 4 px |
| l'écart titre → sortie | 12 px | **0 px** |

**DEUX ÉCARTS, ET PAS UN** (demande de Noé : *« l'espace entre la sortie
attendue et le titre doit être moins important qu'entre la pastille décider et
le titre »*) — et c'est juste : **la sortie est la PRÉCISION du titre**, elle
lui colle ; la pastille est d'une autre nature, elle respire.

- **Un `gap` ne sait pas faire ça** : il vaut pour tous les rangs à la fois. Le
  `row-gap` tombe à zéro et la marge de l'en-tête porte seule l'écart du haut ;
  le `column-gap` reste, il sépare le titre de la durée sur leur ligne commune.
- **ET LES DEUX DEMANDES TIRENT EN SENS CONTRAIRE** : ajouter quatre pixels
  AU-DESSUS du titre le faisait descendre d'autant, alors qu'on venait de le
  centrer. On les rend en dessous, par un rembourrage déséquilibré — *au-dessus
  8 + 16 + 4, en dessous 16 + 12 : les deux font 28.* **Mesuré : écart au
  centre, 0 px.**

**ON MODIFIE UN POINT EN TOUCHANT SA TUILE** (demande de Noé), et **la tuile
VOLANTE de la création se rouvre, remplie** — pas un second formulaire posé à
côté, qui finirait par ne plus demander les mêmes champs. Elle change de mots
(« Modifier le point », « Enregistrer ») et reçoit l'identifiant ; **c'est
l'ENVOI qui décide** s'il pose ou s'il corrige. C'est la mécanique de la tuile
de capture du hub, au mot près.

- **`ouvert: true` AURAIT FAIT L'INVERSE** : dans `construireFormulaire`,
  `volant = !ouvert` — cette option sert aux formulaires qui vivent DÉJÀ dans
  une fenêtre. *Mesuré : le formulaire se dépliait dans le flux, sous la liste.*
  On le laisse volant, et **c'est le geste qui l'ouvre**.
- **LE NOM EST UN VRAI `<button>`, LA TUILE UN ÉCOUTEUR** : l'un pour le
  clavier, l'autre pour le doigt — *« un écouteur ne se tabule pas »*. La croix
  est exclue de l'écouteur, sinon retirer un point ouvrirait d'abord son
  édition.
- **ON REFERME L'ÉDITION À L'ENREGISTREMENT**, sans quoi le formulaire
  reviendrait ouvert et rempli au rendu suivant, par-dessus ce qu'on vient
  d'écrire. C'est le défaut que `#objectifs` a rencontré le premier.

> **9,4 px EST LE PLANCHER, ET JE L'AI FRANCHI UNE FOIS** : le réglage de
> l'étiquette de Yuno (0,5625 rem), repris tel quel, descend à **8,44 px** sur
> ce site — exactement la valeur que le dock a refusée le 16 septembre. *Mesuré,
> puis remonté d'un cran.* Un réglage copié d'un site à l'autre se mesure dans
> celui où on le pose.

- **« SORTIE ATTENDUE : » DISPARAÎT, PAS LA SORTIE** : le libellé expliquait un
  champ dont le contenu se comprend seul. C'est la règle qui vient de faire
  tomber quatre phrases d'aide de cette page.
- **L'ÉCART VENAIT DE DEUX SOURCES** : `.tuile-entete` pose 4 px sous elle, et
  le `gap` du `<li>` en ajoute 8. La marge tombe, le gap suffit. *Et il a fallu
  écrire `.bloc li.odj-point` pour que le gap réduit gagne — `.bloc li` pèse
  0-1-1, la douzième fois que ce piège se paie ici.*

> **CE QUE LES DEUX BOUTONS EMPORTENT EN PARTANT**, et il faut le dire :
> `fiches_reunion_points.statut` ne se change plus nulle part. La colonne reste,
> et la carte de l'accueil du club continue de la lire — elle montre « les trois
> points qui restent », donc elle montrera désormais les trois PREMIERS, pour
> toujours. Le guide du club demandait ce geste (« chaque point se clôt : traité,
> ou reporté — explicitement ») ; **si le geste manque à l'usage, sa place est le
> menu discret de la ligne, pas deux boutons dans la tuile.** Le gestionnaire est
> parti avec eux : plus rien ne l'appelait, et le garder aurait fait du code mort.

**LA MÊME PHRASE RESTE SUR LA CARTE DE L'ACCUEIL**, et ce n'est pas un oubli :
là-bas (« le compte-rendu s'écrit à chaud — sous 48 h il devient une
habitude ») elle ne s'affiche QUE dans la phase « après » d'une réunion sans
compte-rendu. Elle n'explique pas un champ, elle dit pourquoi y aller
maintenant.

> **LE TOTAL DES MINUTES RESTE, et il a failli partir avec** : il vivait À LA
> FIN de la phrase de conseil — « chaque point commence par un verbe… 25 min
> prévues » —, et retirer la phrase l'aurait emporté. Ce n'est pas du conseil :
> c'est ce que la réunion pèse. Il a désormais sa ligne. *Vérifié en posant un
> point de 25 minutes.*

> **L'ÉCRAN VIDE DE L'ORDRE DU JOUR EST PARTI AUSSI** : « le premier point donne
> le ton : Décider…, Répartir…, Valider… » était un EXEMPLE, pas une porte. Le
> bouton « Ajouter un point » juste en dessous EST la porte, et *« un espace
> vide ouvre une porte, il ne s'excuse pas »* — il n'a pas besoin qu'on lui
> explique ce qu'on écrira dedans.

> **La tuile garde `bloc` EN PLUS de `fch-tuile`, et c'est mesuré** : c'est
> `.bloc ul` (styles.css) qui remet à zéro les listes du hub — marge, retrait et
> puces. Sortie de `.bloc` une première fois, la liste du suivi retrouvait ses
> puces de navigateur et quarante pixels de retrait.

**LA CARTE DE L'ACCUEIL SE TAIT QUAND LE COMPTE-RENDU EST ÉCRIT** (même jour,
demande de Noé). C'est la règle du bandeau du hub, corrigé la veille — *la
question se tait quand elle a sa réponse* —, et les deux écrans la tiennent
désormais par la même colonne, `fiches_reunion.cr_date`. Deux écrans qui
poseraient la même question et cesseraient de la poser à des moments différents,
ce sont deux écrans dont un ment. **La réunion sort de « en cours », elle ne
vide pas la carte** : la cascade retombe sur la prochaine réunion, ou sur le
rang suivant — l'accueil n'est jamais muet.
Cochée « c'est pour moi », l'action devient **aussi une tâche fch** — les deux
restent reliées par `tache_id`, et ce qui se décide en réunion entre dans le
circuit (« Aujourd'hui », l'espace Tâches) au lieu de dormir dans une note.

##### LES DEUX PORTES DU DRIVE (20 septembre 2026)

Demande de Noé : *« aligne les 2 boutons, enlève leur ligne blanche en dessous
du texte, change "copier le titre" par une icône, réduis un peu l'espace entre
les 2 boutons et le texte du dessus »*.

- **ELLES N'ÉTAIENT PAS ALIGNÉES À CAUSE D'UNE MARGE HÉRITÉE** :
  `.bouton-secondaire` porte `margin-top: 15px`, faite pour un bouton posé SOUS
  un formulaire. Dans une rangée, elle poussait le premier de quinze pixels et
  gonflait la ligne à 45 px pour des boutons de 30. *Mesuré : 8 px d'écart.*
  C'est le piège déjà payé sur la barre de recherche de la bibliothèque —
  **une marge héritée d'un autre contexte est une mesure qu'on n'a pas
  choisie.**
- **LE SOULIGNEMENT PART** : ce sont des BOUTONS, l'un plein, l'autre discret.
  Le trait est celui d'un lien de texte.
- **« COPIER LE TITRE » DEVIENT UNE ICÔNE** : trois mots pour un geste qu'un
  dessin dit mieux, au bout d'une phrase déjà longue. Le mot part dans `title`
  et dans le nom accessible. *Le dessin vivait dans js/yuno.js, pour ses
  modèles de messages ; il est passé dans js/gabarits.js — pour une icône dont
  le sujet EST la copie, en faire une seconde aurait été presque drôle.*
- **ET C'EST LA MARGE DU DESSUS QU'IL FAUT RÉDUIRE**, pas celle de la rangée :
  des marges verticales adjacentes FUSIONNENT, donc la plus grande gagne — la
  rangée pouvait descendre à 4 px, l'écart restait à 14. *Mesuré, puis corrigé
  sur le paragraphe qui précède : 14 px → 4.*

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

**Ses barres suivent la grammaire du hub depuis le 1er septembre 2026** — un
événement en tuile pleine et grasse, une tâche en simple filet latéral, une
publication en aplat léger, toutes en **Google Sans** : la nature se lit à la
graisse et au dessin, plus à la couleur seule. Le site **ne surcharge rien**, et
c'est volontaire : un calendrier qui se lirait autrement selon l'écran
obligerait à réapprendre le même objet trois fois. Gilroy garde tout le reste du
site.

### `#hermitage/partenaires` — les partenaires

Le seul contenu certain de la « partie marketing » : les partenariats sont
l'un des quatre objectifs de fin d'alternance.

**CE N'EST PLUS UN ANNUAIRE depuis le 16 septembre 2026, c'est un SUIVI
D'ENGAGEMENTS** — voir « Le suivi des engagements partenaires » plus bas, qui
fait autorité. *Ce que ça remplace : une fiche par partenaire (nom, contact,
statut de la relation, notes), tirée de la table `contacts` du carnet réseau de
Yuno. Le carnet n'a pas disparu — ces contacts y vivent toujours ; ce qui change
est la question que cette page pose : non plus « qui sont-ils » mais « qu'est-ce
qu'on leur doit, et qu'est-ce qui reste à faire ».*

### `#hermitage/club` — L'AIDE-MÉMOIRE (rempli le 29 août 2026)

Il a attendu son contenu du 7 au 29 août, et c'était juste : « Noé ne sait pas
encore ce qu'il y mettra », inventer à sa place aurait été le pire service. Le
dossier FCH a donné la réponse — on ne l'invente pas, on le range.

**IL NE FAIT QUE LIRE, et c'est ce qui le justifie.** Rien ne s'y coche, rien ne
s'y compte, aucune donnée n'y est saisie. Il sert l'objectif du 15 décembre —
« laisser une com qui tourne sans moi » : celui qui reprend doit savoir à qui
s'adresser et sur quoi s'aligner.

### LA PAGE EST UN TABLEAU DE BORD (22 septembre 2026, demande de Noé)

> *« Plutôt qu'une page qui regroupe tous les liens possibles, il faudrait
> davantage que ce soit un dashboard dans lequel on voit les infos principales
> et importantes, qui lorsque l'on clique dessus nous mène vers une page plus
> complète. Et les pages non référencées ici le sont dans le menu dépliant. »*

**Ce qui fait autorité ci-dessous jusqu'à « Derrière ces portes » est
DÉPASSÉ pour le hall** : les six portes sont parties. Elles disaient où aller ;
la page dit maintenant ce qui se passe.

**LE RAIL DES SEPT OBJECTIFS DE LA SAISON RESTE EN TÊTE** (correction de Noé le
même jour : *« je préfère quand c'est davantage comme avant, en haut de page et
les tuiles côte à côte qu'on peut slider, 3 objectifs visibles minimum en vue
ordinateur »*). Il a passé une heure en liste compacte dans le tableau — trois
priorités et « et 4 autres ». Ce qui en reste : **les trois priorités votées à
l'AG passent devant**, puisqu'on n'en voit que trois de front.
- **Trois tuiles et un quart dès 48 rem** : la largeur se déduit de la colonne
  (`(100% − 3 écarts) / 3,25`) au lieu d'être fixée à 19 rem, qui n'en montrait
  que deux et demie à 800 px. Le quart qui dépasse dit qu'il y en a d'autres.
  Calage au bord gauche, et non au centre, qui coupait une tuile de chaque côté.
- *Défaut trouvé en rétrécissant les tuiles, et il dormait sur tous les rails :*
  la grille d'une tuile répartit sur ses rangées la hauteur que le rail lui
  impose, le titre s'étirait de 8 px et son `line-clamp` laissait voir le haut
  d'une troisième ligne. Il se cale désormais en haut de sa rangée.

Sous le rail, **trois tuiles** : l'agenda à gauche sur toute sa hauteur, les
actions et les créneaux empilés à droite.

| Tuile | Ce qu'elle montre | Où mène un clic |
|---|---|---|
| **À venir au club** | les 4 prochains rendez-vous — réunions (en base) et évènements (planning officiel) mêlés, par date ; un évènement porte l'état de sa com | la fiche de la réunion (sinon la liste), la fiche de l'évènement |
| **Ce qui reste à tenir** | les actions ouvertes des réunions, avec leur responsable | le suivi des actions |
| **Aujourd'hui / Demain / <jour> à l'entraînement** | les créneaux du prochain jour qui en porte | le planning |

- **DEUX RÈGLES** : une tuile montre une INFORMATION et c'est elle qu'on presse
  (« Réunion Lina 2 · ven. 25 », pas « Les réunions ») ; **ce qui ne bouge pas
  n'est pas ici** — mission, valeurs, chiffres, organigramme se relisent, ils
  vivent dans le menu.
- **CE N'EST PAS L'ACCUEIL DU SITE** : l'accueil montre le travail de Noé, le
  Club la vie du club — son agenda, les engagements de tout le monde, son cap.
- **L'ÉVÈNEMENT N'A PAS DE TUILE À LUI** : il est déjà dans « À venir », et
  l'état de sa com — la seule chose qu'une tuile propre aurait ajoutée — s'écrit
  sur sa ligne.
- **LES TEMPS FORTS EN BASE N'Y SONT PAS** : ils doublent les évènements du
  planning sous un autre titre, et la même date deux fois se lirait comme deux
  rendez-vous.
- **Une tuile à plusieurs destinations n'est pas un lien** : ses lignes le sont,
  et elle perd la vitre du survol, qui dirait « tout ceci s'ouvre ».
- **Deux colonnes déclarées**, une sur téléphone, où la date passe au-dessus du
  titre.
- **LE MENU RECENSE, LA PAGE CHOISIT** (même jour, suite de la même demande).
  Ça renverse la règle du 20 septembre (« le menu reprend exactement le hall ») :
  la page ne listant plus rien, c'est le menu qui doit tout nommer. Sept lignes
  repliées, et **deux groupes à flèche** — les deux seules pages qui en ouvrent
  d'autres :

  ```
  Le club
     Le projet du club ▾  La mission · Les valeurs · Les axes · Les objectifs · Les projets
     Les organigrammes
     Les commissions
     Les réunions ▾       Le suivi des actions · Les réunions passées
     Les évènements
     Les entraînements
     Le club en chiffres
  ```

  - **« Les commissions » est le mot qui reste** (décision de Noé) : la page
    `#hermitage/projet-club/poles` s'intitule ainsi, et ses libellés visibles
    ont suivi. L'adresse ne bouge pas — un favori se casse, pas un nom.
  - **Le chemin déplie aussi le groupe** : depuis le suivi des actions ou une
    fiche de réunion, le menu s'ouvre sur « Les réunions » dépliées. Une entrée
    nommée telle quelle passe avant le préfixe : les commissions vivent sous
    l'adresse du projet, et ne doivent pas déplier le projet.
  - `PAGES_DU_SITE` n'ajoute plus rien au menu : elle ne fait qu'aplatir ses
    groupes pour le titre de page et l'onglet allumé.
- *Défaut trouvé en passant : la porte des réunions de l'accueil lisait
  `action.titre`, colonne qui n'existe pas — la ligne s'écrivait vide. C'est
  `action.texte`.*

**LE CAP DE LA SAISON OUVRE LA PAGE** (20 septembre 2026, demande de Noé :
*« dans la page "club" on doit avoir en haut les objectifs de la saison à venir à
pouvoir slider »*), dans le rail qui sert déjà les projets et les pôles. **Le
hall dit où aller, ce rail dit vers quoi** : la page ne portait que six portes,
et pas une seule des choses que le club s'est données à faire cette saison —
elles étaient à trois gestes, derrière la porte du projet puis sa galerie.
**Sept objectifs sur dix-huit**, ceux de N+1 ; les onze autres visent trois ou
cinq ans et se comparent sur la page des objectifs et sur celle d'un axe.
L'horizon ne s'écrit pas sur ces tuiles — elles sont toutes de la même saison, et
le titre du bloc le dit.

**LA PAGE EST UN HALL** (16 septembre 2026, demande de Noé : *« modifie la forme
des tuiles de la page club pour que ça ressemble davantage à ce style — comme ma
bibliothèque dans perso, ou le vivier dans Yuno »*). Elle portait cinq
rectangles, chacun un nom et une flèche : **cinq lignes de menu redessinées**, et
le menu est déjà à un geste. La règle du hall de `#perso` vaut ici mot pour mot —
**chaque porte doit dire quelque chose qu'on IGNORE avant de l'ouvrir**, et c'est
le test à repasser le jour où une sixième arrive.

| Porte | Son compte | Son aperçu |
|---|---|---|
| **Les organigrammes** | 44 personnes | **une pile de visages**, puis « 4 au bureau, 5 commissions, 14 équipes » |
| **Le projet du club** | 18 objectifs | **la mission en toutes lettres** — « Transmettre l'envie de jouer » —, puis les trois valeurs principales |
| **Les entraînements** | 17 créneaux | **le prochain jour qui en porte**, et ses trois premiers avec leurs horaires |
| **Le club en chiffres** | 8 repères | les trois premiers, leur chiffre à droite |
| **Les réunions** | ce qui reste à tenir | la prochaine réunion — à défaut la dernière tenue —, puis les actions ouvertes |

- **LES VISAGES, ET NON LES NOMS DES GROUPES** (16 septembre 2026, demande de
  Noé : *« pour les organigrammes mets des photos l'une sur l'autre plutôt que
  les pastilles présidence… »*). Et c'est plus juste : « Présidence,
  Secrétariat, Trésorerie » sont les mots du MENU de cette page, pas ce qu'on
  ignore avant de l'ouvrir — **on y vient chercher des gens.** Six portraits qui
  se chevauchent, **le bureau d'abord**, puis le compte de ceux qui restent.
  - **Le portrait se découpe par `portrait()`**, la fonction de l'organigramme :
    une seconde fenêtre SVG écrite à côté finirait par ne plus cadrer les
    visages pareil.
  - **L'anneau est une OMBRE PORTÉE et non une bordure** : elle ne prend pas de
    place dans la boîte, donc le chevauchement se règle au seul `margin-left`.
    Il prend la couleur de la porte, survol compris — sinon la pile garderait un
    liseré de l'ancienne teinte.
- **LE PROCHAIN ENTRAÎNEMENT EST LA SEULE CHOSE QUI CHANGE D'UN JOUR À L'AUTRE**,
  et c'est ce qui fait de cette porte autre chose qu'une étiquette :
  « Aujourd'hui », « Demain », sinon le nom du jour. `prochainEntrainement` prend
  sa date en paramètre, donc elle s'éprouve hors écran — *les sept jours sont
  vérifiés, dimanche compris, qui renvoie au lundi*.
- **LE JOUR SE LIT AVANT SES CRÉNEAUX** : mis en dessous, on lisait trois
  horaires sans savoir de quel jour ils parlaient.
- **UN REPÈRE SE COUPE À SA PREMIÈRE VIRGULE** : « licenciés, des U7 aux
  vétérans » s'arrêterait à une ellipse, ce qui fait lire une phrase inachevée là
  où il y a un fait entier. Sa page les donne en entier.
- **LA PHRASE DE LA MISSION GARDE L'ENCRE PLEINE** : c'est la seule porte du site
  dont l'aperçu soit une phrase, et on vient la relire — pas la balayer.
- **PLUS DE PHRASE D'INTRODUCTION.** « Les personnes, le projet et les repères du
  FC Hermitage » nommait les portes qu'on a juste en dessous ; une porte qui
  montre ce qu'il y a derrière n'a plus besoin qu'on l'annonce.
- **LE HALL EST LA SECTION, et surtout pas le contenu d'une `.bloc`** : au-delà
  de 60 rem, `.bloc ul` passe toute liste en grille de 21 rem et `.bloc li`
  dessine chaque ligne comme une carte — les créneaux et les repères
  s'écartaient et s'indentaient dans leur porte. *Le piège de la spécificité,
  payé une neuvième fois.*

Derrière ces portes, quatre écrans, du plus souvent consulté au plus rare :

1. **Les organigrammes** — les neuf commissions et leurs porteurs
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
2. **Le projet du club** — la mission, les valeurs et les objectifs. C'est la
   référence de la ligne éditoriale, et l'une des missions écrites de Noé :
   elles sont là pour être RELUES avant d'écrire. Voir « Le projet du club »
   plus bas.
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
   revenus partenaires de la saison est de **26 000 €**, et le hub en compte
   **17 330 € engagés** au 16 septembre 2026, soit 67 %.)*
3. ~~**Les partenaires : quels statuts de relation te seraient utiles**~~ —
   **RÉPONDU le 16 septembre 2026.** Le hub n'en garde que DEUX, la fin de la
   chaîne : « virement en attente » et « partenaire du club ». « À relancer »,
   « en discussion » et « refus » restent dans le tableau de Noé, qui est
   l'outil de PROSPECTION — le hub reprend la suite, c'est-à-dire ce qui est
   signé et ce qu'on doit faire pour l'honorer.
4. ~~**L'organisation club : dès que tu sais ce que tu veux y trouver**~~ —
   **RÉPONDU le 16 septembre 2026** par le dossier du projet que Noé a fourni.
   Voir « Le projet du club — mission, valeurs, objectifs ».
5. **Les 13 logos de partenaires qui manquent**, et deux rapprochements que le
   club doit confirmer ou infirmer : « MENELEC » est-il MAX ELEC ? « SOLUVIA »
   est-il SOLUWASTE ? *Des noms voisins ne sont pas le même partenaire, et un
   logo posé sur la mauvaise fiche se verrait au stade.*
6. ~~**Deux portraits différents portent le nom « Christophe Lucchetta »**~~ —
   **TRANCHÉ le 20 septembre 2026 par Noé** : « Christophe à mettre dans les
   U13 ». Ce sont bien deux photos de lui, et chacune est celle de SON
   organigramme — le crâne rasé au bureau, la barbe grise au sportif. La question
   n'avait de sens que tant qu'une personne n'avait qu'un portrait.
6 bis. **Le portrait par défaut de Lorenzo montre le visage de Loïc.** Découvert
   le 20 septembre : `Bureau/Loïc.png` et `Bureau/Lorenzo.png` sont **deux
   recadrages du même cliché**. Noé a confirmé que le vrai Lorenzo est l'homme
   blond du dossier des commissions, où il est désormais juste. **Aux deux autres
   endroits — l'onglet « Bureau et référents » et sa fiche — c'est toujours
   Loïc.** Corriger demande de choisir quelle photo devient son portrait
   principal, ou un export refait par le club. *Non corrigé : ça revient à
   décider à sa place.*
7. **Un partenaire ne se MODIFIE ni ne se SUPPRIME depuis l'écran.** Son ÉTAT se
   change d'un geste depuis le 16 septembre 2026 — c'était la moitié urgente de
   la question, celle d'un virement qui arrive. Le reste ne bouge pas : ni le
   montant, ni l'offre, ni la commune, ni le CERFA, ni les notes, et la ligne ne
   s'efface pas. `modifierPartenaire` et `supprimerPartenaire` existent dans
   `js/api.js` et ne sont appelées nulle part pour ça ; le formulaire de création
   porte déjà tous les champs. **À faire quand l'usage le demandera** — corriger
   un montant négocié est plus fréquent qu'il n'y paraît (l'écart au tarif du
   dossier est déjà affiché sur la fiche, justement parce qu'on l'oublie).
8. **Le hall du club n'a plus de porte vers les partenaires**, depuis qu'ils ont
   pris un onglet du dock : une porte vers un voisin du dock ferait deux chemins
   pour un geste. **Décidé sans que Noé le demande, dit, non contesté — mais non
   confirmé.** La remettre coûte une ligne.

## Navigation — 16 septembre 2026

> **LES DEUX PARAGRAPHES QUI SUIVENT SONT DÉPASSÉS** sur le NOMBRE et le NOM des
> destinations : lire « LE DOCK, REFONDU LE 16 SEPTEMBRE 2026 » plus bas, qui
> fait autorité. Ce qu'ils disent du COMPOSANT de menu, lui, tient toujours.

Le site reprend le composant de menu dépliant de Hub et Yuno. Le bouton est
en tête avec le titre de la page ; les rubriques sont Accueil (calendrier),
Créer, et Le club (réunions, partenaires). Le mot ouvre la page, la flèche
déplie ; la rubrique courante se déplie à l'ouverture du menu.

Les six destinations existantes restent accessibles dans le dock flottant
en bas : Accueil, Créer, Réunions, Partenaires, Club, Calendrier. Elles partagent
les styles du dock de Hub et Yuno, avec l'écusson à l'accueil et l'actif blanc.
Le bouton de capture et le bas du contenu sont décalés pour laisser sa place au dock.

### Découpage des contenus — 16 septembre 2026

Cette répartition remplace celle du premier menu ci-dessus. Le site compte
16 pages. *(Les destinations et les noms ont changé le soir même : voir « LE
DOCK, REFONDU LE 16 SEPTEMBRE 2026 » ci-dessous. Ce qui suit décrit ce que
chaque page CONTIENT, et reste vrai.)*

- Créer : aperçu et portes vers Saison, Calendrier éditorial, Banque d’idées,
  Publications parues. Le formulaire reste disponible sur Saison, Éditorial
  et Banque ; les propositions de rythmes continuent de le préremplir sur Saison.
- Réunions : réunions à préparer ; pages séparées pour Suivi des actions et
  Réunions passées. Les adresses des fiches restent inchangées.
- Club : portes vers Les organigrammes, Projet du club, Entraînements, Chiffres
  et, depuis le soir du 16 septembre, **Les réunions** — *les partenaires, eux,
  sont partis prendre leur propre onglet.* Les entraînements et chiffres sont
  directement visibles sur leur page, sans pli supplémentaire. **Ces portes ne
  sont plus des liens nus mais un HALL** : voir « LA PAGE EST UN HALL » plus
  haut.

Les sous-pages gardent l’onglet parent actif et un lien de retour. Le menu
ouvre leur rubrique automatiquement. Aucun contenu ni opération métier retiré.

### LE DOCK, REFONDU LE 16 SEPTEMBRE 2026 (trois décisions de Noé)

**Accueil · Com’ · Partenaires · Club · Calendrier.** Toujours cinq
destinations, mais ce ne sont plus les mêmes.

1. **« intègre réunions à club »** — les réunions étaient une rubrique à elles,
   donc un onglet. Mais ce que leurs pages disent — qui décide quoi, ce qui a été
   décidé, ce qui reste à tenir — est **de la même nature que l'organigramme et
   le projet : c'est la vie du club**, pas une cinquième destination. Elles
   deviennent une porte du hall, et **leurs deux sous-pages restent derrière
   elles** : le hall à deux gestes, les réunions à trois, les archives à quatre.
2. **« ajoute un onglet pour les partenaires, qui remplace donc réunions »** —
   ils étaient une page du Club et prennent la place libérée. La bascule se
   tient : **le Club est ce que le club EST** — ses gens, son projet, ses
   créneaux, ses décisions ; **les partenaires sont un CHANTIER de Noé**, avec
   ses engagements à tenir et son argent. *Conséquence assumée : le hall du club
   perd sa porte partenaires — une porte vers un voisin du dock ferait deux
   chemins pour un geste, et c'est le dock qui le porte.*
3. **« change créer en communication »**, puis **« Com’ au lieu de
   communication »** — **l'onglet dit « Com’ », la page et le menu disent
   « Communication ».** Ce n'est pas un second nom mais une abréviation, comme
   l'onglet « Club » ouvre la rubrique « Le club ».
   - **ET C'EST CE QUI SAUVE LA RÈGLE DES LARGEURS ÉGALES.** *Mesuré à 375 px :
     cinq onglets reçoivent 67 px chacun, et « Communication » en demandait
     72 — le mot débordait de son onglet et chevauchait « Partenaires ».* Les
     deux seules autres sorties étaient de descendre le corps sous 9 px, où un
     mot n'est plus qu'une trace, ou de laisser chaque onglet prendre la largeur
     de son mot — ce qui aurait sorti ce dock de la grammaire des deux autres.
     *Vérifié après : aucun onglet tronqué, de 375 px à 935.*

### Entraînements — présentation inspirée des affiches, 16 septembre 2026

La page utilise désormais un titre blanc sur bande rouge, des colonnes par jour
avec bandeaux bleu nuit et des cartes de catégories à liseré bleu, rouge ou jaune.
Lieu et horaire sont accompagnés de pictogrammes. Cinq colonnes sur grand écran,
trois sur tablette et deux sur mobile. Les 16 créneaux existants sont conservés ;
la demande porte sur la forme, pas sur la mise à jour des horaires depuis l’affiche.
Rendu vérifié dans le navigateur ; à 375 px, aucun débordement horizontal et
16 cartes présentes. Syntaxe JS et gabarits validés. Modifications non publiées.

### Planning compact et lundi — 16 septembre 2026

Ajout du lundi : Mam’s, Beaumont-Monteux, 19h30–21h, selon l’affiche fournie.
Le planning comporte désormais 17 créneaux du lundi au samedi. Titre, catégories,
cartes et espacements fortement réduits ; six colonnes sur grand écran, trois
sous 900 px et deux sous 560 px. Vérification navigateur : six jours, 17 cartes,
hauteur de carte mesurée à 71 px. Syntaxe et diff validés ; non publié.

Titres de page FCH : Gilroy Heavy (900), approche resserrée à −0,04 em,
appliqués à l’en-tête partagé de toutes les pages (16 septembre 2026).

Les titres de page FCH portent désormais un rectangle rouge ajusté au texte,
comme « Programmation », avec encre blanche et Gilroy Heavy conservé.

### Accueil FCH — tuiles du Hub, 16 septembre 2026

Les tâches, la communication, le cap et les victoires sont regroupés dans des
tuiles sans contour extérieur, avec titres au-dessus. Réunions et temps forts
restent en tête sur toute la largeur. Deux colonnes dès 960 px, une sur mobile.
Les liens de pied de tuile deviennent sobres, sans bande latérale colorée.
Contenus et gestes existants conservés. Vérifié : gabarits, syntaxe, rendu
navigateur, deux colonnes à 1200 px et aucun débordement à 375 px. Non publié.

### Tuiles sur les autres pages FCH — 16 septembre 2026

Le style partagé `.fch-tuile` habille les sections de Communication, du Club et
de leurs sous-pages, dont les fiches de réunion. Les titres restent au-dessus ;
les portes perdent leur bande latérale et leur contour.

**SAUF CELLES QUI NE PORTENT QUE DES CARTES** (`fch-sans-tuile`, 16 septembre
2026) — la galerie des partenaires, le catalogue des offres, les chantiers, et
le hall du club, qui n'est pas dans un `.bloc` du tout. Voir « UNE GALERIE N'A
PAS DE SURFACE SOUS ELLE ».
Le calendrier et le planning des entraînements conservent leurs grilles dédiées.
Les nœuds sont déplacés dans les surfaces après rendu, sans changer les champs
ou les attributs des actions. Les 16 routes ont été parcourues dans le navigateur :
titres présents et aucun identifiant dupliqué. Gabarits et syntaxe validés.
Modifications locales, non commitées et non poussées à ce stade.

### Le suivi des engagements partenaires (16 septembre 2026)

**La demande de Noé** : *« pour un partenaire qui a pris un pack Esprit
Collectif, avoir la liste des choses que l'on doit faire de notre côté (vignette
album, panneau…) pour assurer un bon suivi »*, avec les vingt entreprises notées
« partenaire du club » ou « virement en attente » dans son tableau de
prospection.

**CE QUE ÇA REMPLACE** : un annuaire. La page listait les contacts de type
« marque » avec leur e-mail — elle ne disait rien de ce que le club DOIT à
chacun. Le carnet n'a pas disparu : ces contacts vivent toujours dans le réseau
de Yuno, qui est la même table.

#### La ligne entre le dépôt et la base

- **Le CATALOGUE des offres est dans le dépôt** (`js/partenaires-fch.js`) : il
  change une fois par an avec le dossier, rien ne s'y coche, et il est déjà
  public — c'est le document qu'on envoie aux entreprises.
- **Les PARTENAIRES et leurs engagements sont en base** (`partenaires`,
  `partenaires_engagements`). Deux raisons qui vont dans le même sens : **ça se
  coche**, et **ce dépôt est public** — les montants, les CERFA et les notes de
  négociation ne le sont pas.
- **Une table à part de `contacts`** : un contact est une structure du carnet,
  un partenariat est un engagement d'UNE SAISON. La même entreprise peut revenir
  l'an prochain avec une autre offre sans écraser son histoire.

#### C'est un HALL, pas une page (16 septembre 2026, demande de Noé)

*« Il faut que ce soit mieux organisé, pas tout sur la même page, donc des
tuiles portes… On garde le dashboard de haut de page, c'est très bien. »*

Le tableau de bord reste en tête, et trois portes mènent chacune à une question :

| Adresse | Sa question |
|---|---|
| `/liste` puis `/<id>` | qui sont nos partenaires, et que doit-on à celui-ci |
| `/engagements` | qu'est-ce qu'il me reste à faire |
| `/offres` | qu'est-ce qu'on promet, au juste |

**UNE PORTE MONTRE CE QU'IL Y A DERRIÈRE**, c'est la règle du hall de `#perso` :
trois rectangles nommés comme trois lignes de menu seraient un menu dessiné, et
le menu est déjà à un geste. Chacune dit donc quelque chose qu'on **ignore**
avant de l'ouvrir — les logos qu'on a et qui n'a pas encore viré, les trois
chantiers qui pèsent le plus, les offres que personne n'a prises.

**UNE PORTE A TROIS ÉTAGES** (16 septembre 2026, demande de Noé en deux temps :
*« inverse l'illustration/les logos et le texte/titre de la tuile »*, puis *« par
contre le titre de la tuile est au-dessus des autres textes »*) —
**l'illustration, le nom, puis le reste**. C'est l'ordre d'une tuile de livre :
on voit, on lit son nom, on lit le reste.
- **L'ILLUSTRATION EST UN EMPLACEMENT DÉCLARÉ**, pas le premier élément de
  l'aperçu : sans lui, le nom ne pourrait pas se poser ENTRE les deux. Deux
  portes en ont une — les logos des partenaires, les visages du club ; les autres
  n'en ont pas, et se lisent alors nom puis textes.
- **ELLE REMONTE PAR `order`, JAMAIS DANS LE DOM** : le nom accessible d'un lien
  est la suite de son contenu dans l'ordre du DOM, et la porte des partenaires
  s'annoncerait par ses cinq logos avant de dire ce qu'elle ouvre. Rien ne se
  tabule à l'intérieur d'un lien, donc l'écart entre l'ordre lu et l'ordre vu ne
  coûte rien. *Vérifié : « Tous les partenaires 20 ATOL Valence… ».*

**LE DESSIN EST COMMUN AU SITE** (`fch-hall-*`, 16 septembre 2026) : il sert ce
hall-ci et celui du **Club**. Il s'appelait `suivi-porte-*` quand il n'y en avait
qu'un ; un second l'aurait recopié, et c'est toujours la copie qu'on regarde le
moins qui finit par diverger. **La porte des partenaires, elle, se dessine dans
une seule fonction** (`porteDesPartenaires`) dont les deux halls se servent — ce
qu'elle montre ne change pas d'un écran à l'autre, seuls son adresse et son nom.
*À ne pas confondre avec `.fch-portes`, la rangée de liens qui ferme les pages
Créer et Réunions : celle-là est une navigation de pied de page, pas un hall.*

**LA LISTE EST UNE GALERIE DE TUILES** (demande de Noé) : une liste de lignes se
parcourt mot à mot, une galerie de logos se balaie du regard — c'est l'argument
de l'étagère de la bibliothèque, et il vaut ici pour la même raison. **Sans
logo, la tuile garde sa place**, en plaque pointillée avec le nom dedans : le
pointillé est le signe du hub pour « déclaré, pas encore rempli », et une
galerie à trous se lirait comme une liste incomplète.

**LA FICHE EST UNE PAGE**, plus un dépliage : c'est la règle des deux rangs —
la galerie ne dit que ce qui se COMPARE, la page dit tout.

**SA TÊTE MET LE LOGO À GAUCHE ET TOUT LE TEXTE À SA DROITE** (16 septembre
2026, demande de Noé). Empilés, la plaque, le nom, l'offre et l'état
occupaient trois cents pixels de haut **avant le premier engagement** — or
c'est la liste qu'on vient lire. *Mesuré après : 94 px sur ordinateur, 81 sur
téléphone, où la plaque se resserre pour laisser sa place à un nom long.*

**UNE GALERIE N'A PAS DE SURFACE SOUS ELLE** (16 septembre 2026, demande de
Noé : *« enlève la tuile de fond sur cette page, il faut que chaque tuile
d'entreprise soit indépendante »*, puis *« fais pareil pour la page des offres,
pas de tuile globale, une tuile par pack »*, puis *« pareil pour nos
engagements »*).

`habillerLesSections` pose une `.fch-tuile` sous chaque section du site — ce
qui est juste d'une section qui porte du TEXTE, et faux d'une section qui ne
porte que des tuiles : **les deux surfaces sont le même `--fond-carte`**, et
vingt entreprises se lisaient comme un seul bloc. Seul le survol révélait qu'il
y avait des tuiles là-dessous. La section le refuse donc par `fch-sans-tuile`,
et le titre s'habille quand même — il reste le nom de la section, tuile ou pas.
- **LES TROIS PAGES CONCERNÉES SONT CELLES QUI N'ONT QUE DES CARTES** : la
  galerie des partenaires, le catalogue des offres, les chantiers. C'est le
  critère, pas la page : une section qui porte du texte garde sa surface, parce
  qu'un paragraphe a besoin d'être posé sur quelque chose. Le hall, lui, la
  garde aussi — ses portes ne sont pas des cartes, ce sont des portes.
- **Pas d'`overflow: hidden` sur une tuile de partenaire**, et ce n'est pas un
  oubli : son menu d'état s'y faisait couper. La plaque du logo se découpe déjà
  toute seule, et c'est la seule chose qui avait besoin d'être rognée.

**L'ÉTAT SE CHANGE SUR PLACE** (même jour, demande de Noé : « ajoute la
possibilité de modifier l'état ») — sur la tuile de la galerie comme sur la
fiche. Un virement arrive, on le note d'un doigt : ouvrir la fiche pour un seul
mot donnerait à ce geste le coût d'une correction. C'est le raisonnement déjà
tenu pour l'état d'un PROJET, et c'est donc son dessin — le menu dessiné du hub.
- **LA PASTILLE GARDE SON APLAT**, elle ne devient pas le mot gris d'un projet :
  il n'y a ici que DEUX états, et c'est la couleur qui les sépare d'un coup
  d'œil dans une galerie de vingt tuiles. Elle change de nature, pas d'allure.
- **LA TUILE N'EST PLUS UN LIEN QUI ENVELOPPE** : un bouton dans un lien n'est
  ni valide ni cliquable. C'est un écouteur qui se retire dès que le clic a
  touché un contrôle — la mécanique de la tuile « Aujourd'hui » de l'accueil —,
  **et le nom porte le lien** : un écouteur ne se tabule pas.
- **Le menu garde son alignement par défaut**, à gauche : calé à droite, il
  sortait de l'écran sur la fiche, où la pastille est au ras de la marge.
  `placerLePanneau` sait déjà le retourner quand il déborde.
- **L'écriture est optimiste** : la pastille change de mot et les comptes des
  filtres suivent avant que le réseau ait répondu.

**LES ENGAGEMENTS SE RANGENT PAR CHANTIER**, pas par partenaire : *on ne fait
pas les vignettes de l'album une par une en rouvrant chaque fiche, on les fait
toutes le même soir.* Les chantiers sont groupés par moment de la saison — à la
rentrée, avec l'album, dans la saison, au Tournoi Rose, à la soirée.

#### Les logos

**DANS LE DÉPÔT, jamais à un CDN** — c'est la règle des écussons des clubs et
des polices. Ils sont ramenés à 320 px de large et posés sur une **plaque
blanche** : ceux du club sont dessinés pour du papier, fond clair et encre
sombre ; à même le bleu du site, la moitié disparaîtrait.

*Sept sur vingt au 16 septembre 2026.* Deux pièges écartés en les rapprochant :
« MENELEC » n'est pas MAX ELEC et « SOLUVIA » n'est pas SOLUWASTE — des noms
voisins ne sont pas le même partenaire. Et le fichier `STURM.pdf` n'est pas un
logo mais un flyer : il n'a pas été retenu.

#### Ce que la page montre

- **L'OFFRE FAIT NAÎTRE SES ENGAGEMENTS** : prendre un pack, c'est s'engager à
  une liste de choses qu'on n'a pas à retaper.
- **CE QUI A ÉTÉ NÉGOCIÉ SE DISTINGUE** (`origine`) : MG+ prend le pack Ambition
  et obtient en plus le naming du Tournoi Rose ; MAX ELEC échange son jeu de
  maillots contre le naming du tournoi futsal. La mention « négocié » dit ce
  qu'on ne peut pas justifier par le dossier.
- **LE MONTANT CONVENU N'EST PAS CELUI DU TARIF**, et l'écart se dit : La
  Milanaise donne 650 € pour un pack à 800, Le BM 500 € pour un pack à 250. Sans
  un mot, on croit chaque fois à une erreur de saisie.
- **« NE SOUHAITE PAS ÊTRE MENTIONNÉ »** est une colonne (`discret`) : deux
  mécènes le demandent. C'est la seule ligne de la page qui dise ce qu'il ne
  faut PAS faire, et elle se lit avant la liste.
- **RIEN N'EST DÛ À UN MÉCÈNE** : un don est sans contrepartie. Ses engagements
  sont donc toujours des ajouts.
- **AUCUN RETARD N'EST COMPTÉ** : un engagement n'a pas d'échéance, seulement un
  moment de la saison. Un chantier bouclé s'efface, il ne se félicite pas.
- **LE LIBELLÉ EST STOCKÉ, pas déduit du catalogue** : ce qu'on a promis cette
  année ne doit pas changer de mots le jour où le dossier de la saison suivante
  reformule ses lignes.
- **RETIRER DEMANDE UN SECOND APPUI**, et la croix ne s'offre que sur la fiche :
  dans une liste de douze vignettes, un doigt qui dérape effacerait la mauvaise.

*Mesuré : 20 partenaires, 70 engagements, 17 330 € — les chiffres du tableau de
Noé, au centime près. Aucun débordement à 375 px comme à 900.*

**À VENIR** : les logos, que Noé fournira. Ils se poseront comme les écussons
des clubs — rapatriés dans le dépôt, jamais appelés à un CDN.

### Le projet du club — mission, valeurs, objectifs (16 septembre 2026)

**La demande de Noé** : *« pour la page le projet du club, je te joins tous les
docs nécessaires pour que ce soit complet. Chaque valeur doit avoir sa page de
détail. Il doit y avoir un espace par rapport aux objectifs par commissions, en
fonction de la deadline visée (N+1, N+3, N+5…). »*

**TROIS ÉTAGES, ET C'EST LA STRUCTURE DU CLUB LUI-MÊME** : la mission dit
POURQUOI, les valeurs COMMENT on se tient, les objectifs VERS QUOI on va. Le
club les a construits dans cet ordre, en quatre réunions de projet ; l'écran les
rend dans le même. *Ce que ça remplace : une phrase de mission et six lignes de
valeur résumées, tout ce que `js/club-fch.js` en gardait.*

**LES DONNÉES VIVENT DANS `js/projet-fch.js`**, pas en base — c'est l'argument
de `js/club-fch.js` : rien ne change plus d'une fois par an, rien ne se coche.
Chaque bloc porte sa source dans le fichier, dossier `Club/Projet club/`.

#### La mission

La phrase, sa formulation complète, ses **quatre piliers** (le visuel de la
mission), et un repli « pourquoi cette phrase-là » qui donne les quatre critères
que le club s'était fixés et les **trois missions écartées**. Celles-ci disent
ce que la mission a choisi de ne PAS être, et c'est la moitié de son sens.

#### Les six valeurs, et la page de chacune — `#hermitage/projet-club/<id>`

**LA COULEUR NE PORTE PAS L'IDENTITÉ dans la galerie, le rang et le nom la
portent.** Les six couleurs relevées dans les carrousels du club vont par
paires — deux bleus, deux rouges, deux ors : sur Instagram les valeurs passent
une par une, la répétition ne se voit pas ; six tuiles côte à côte, si. La
couleur tient donc le filet du haut et le chiffre, comme la tuile d'un groupe de
l'organigramme. **Seul l'esprit collectif est éclairci** — le club a `#003090`,
plus sombre que le fond du site, où il aurait disparu.

**SUR SA PAGE, LA COULEUR PEUT ÊTRE FRANCHE** : une valeur à la fois, donc rien
à confondre avec sa jumelle de teinte. La page reprend la forme du carrousel —
le rang, le nom en grand sur un bandeau teinté, les trois idées — puis la
définition publique du club, le comportement qu'elle demande, ses mots associés
et la famille de mots dont elle est née. **Les trois valeurs principales sont
marquées** : ce sont celles que la réunion n° 2 a retenues comme portant la
mission.

*La transmission n'a pas de carrousel exporté, à la différence des cinq autres :
sa définition vient de la réunion n° 2. C'est la même parole du club, écrite un
cran plus tôt.*

#### Les objectifs, par horizon et par pôle

**GROUPÉS PAR HORIZON — N+1, N+3, N+5 —, parce que c'est la question qu'on se
pose devant un projet de club** : qu'est-ce qui doit avancer cette année, et
qu'est-ce qui attend. **Le filtre par pôle répond à l'autre question**, celle de
Noé : les objectifs d'une commission donnée.

- **Le filet de gauche dit l'AXE, la pastille dit le PÔLE.** Deux canaux, chacun
  son travail : l'axe est la grande famille (quatre), le pôle est le sujet
  (neuf). Les mêler sur un seul signe aurait demandé treize couleurs.
- **UN PÔLE N'EST PAS UNE COMMISSION**, même s'ils se ressemblent : l'éducatif,
  la cohésion et l'identité n'ont pas de commission ; le secrétariat, la
  trésorerie, la buvette et la présidence n'ont pas de pôle. Les cinq qui portent
  le même nom qu'une commission en reprennent la couleur, pour qu'un pôle se
  reconnaisse d'un écran à l'autre.
- **UN OBJECTIF PEUT PORTER PLUSIEURS HORIZONS**, et sa carte le dit (« aussi à
  N+3 et N+5 ») : « augmenter le nombre de bénévoles » est visé aux trois. C'est
  un objectif qui court, pas trois objectifs.
- **L'INDICATEUR N'EXISTE QUE SUR LES OBJECTIFS DE N+1** — les seuls que le club
  ait outillés. Ne pas en inventer pour les autres : un indicateur non décidé est
  un indicateur que personne ne relèvera.
- **ON N'OFFRE QUE LES PÔLES QUI PORTENT UN OBJECTIF** : un filtre sur une liste
  vide est une porte sur une pièce vide. C'est la règle des filtres de la
  bibliothèque.
- **LES PROJETS SANS OBJECTIF SONT GARDÉS TELS QUELS**, repliés en pied : une
  idée qui attend son objectif est une idée, pas une erreur, et la ranger de
  force sous un objectif serait décider à la place du club.
- **LES TROIS OBJECTIFS DE L'AG SONT AFFICHÉS SUR L'ACCUEIL DU PROJET**, en tuiles
  cliquables vers les objectifs encadrement, bénévoles et sponsors. Le panneau
  dépliant de l'AG a été supprimé à la demande de Noé. Leurs mots ne
  sont pas ceux du tableau (« anticiper davantage nos manifestations » y devient
  « augmenter le nombre de bénévoles et de participants »). On garde les deux —
  l'un est ce qui a été DIT à l'assemblée, l'autre ce qui est SUIVI.

*Mesuré à 375 px comme à 800 : aucun débordement horizontal, aucun titre ni
aucune pastille tronqués.*

### Les organigrammes interactifs, 16 septembre 2026

#### LES AXES ET LES PÔLES ONT LEUR PAGE (20 septembre 2026)

Demande de Noé : *« il faut rajouter une page sur nos 4 axes, puis des pages sur
nos commissions avec les données que tu as déjà, crée les liens nécessaires
entre toutes les pages »*.

**LES PÔLES ET LES COMMISSIONS SONT LA MÊME CHOSE** — décision de Noé, la
question posée : *« il faut fusionner les 2, certaines n'ont pas de responsable
ni de membre mais ce n'est pas grave, ça arrivera plus tard »*.

*Ce que ça renverse : `js/projet-fch.js` disait « les pôles ne sont PAS les
commissions ». C'était vrai des DONNÉES — cinq noms communs sur quatorze — et
Noé tranche sur le SENS : un pôle et sa commission sont le même DOMAINE du
club, vu depuis le projet d'un côté et depuis les gens de l'autre.*

| l'écran | ce qu'il montre |
|---|---|
| `…/axes` | les quatre axes, en tuiles de cap |
| `…/axe-<id>` | ses pôles, ses objectifs, ses projets |
| `…/poles` | les dix domaines, **rangés en quatre blocs, un par axe** |
| `…/pole-<id>` | ce qu'il sert, **qui le porte**, ses objectifs, ses projets |

- **DIX DOMAINES**, et ce sont exactement les dix entrées de l'arborescence de
  Noé : les neuf pôles, plus la **Buvette** — une commission sans pôle, parce
  qu'elle ne porte aucun objectif. Les trois groupes du bureau (présidence,
  secrétariat, trésorerie) n'en sont pas : ce sont des fonctions.
- **LA LISTE SE DÉDUIT DES DEUX SOURCES**, elle ne se recopie pas : une liste
  écrite à la main serait un troisième endroit à tenir d'accord, et c'est
  toujours celui qu'on oublie qui ment le jour où une commission naît. **Les
  deux tables restent séparées** — l'une porte ce qu'on VISE, l'autre QUI le
  porte ; les fondre demanderait de décider aujourd'hui ce que Noé a dit qui
  viendrait plus tard.
- **LA PAGE SE RANGE EN QUATRE BLOCS, UN PAR AXE** (demande de Noé : *« trie
  par axe en rajoutant un petit titre en dehors des tuiles »*). Dix tuiles à la
  suite étaient un inventaire ; quatre blocs de deux ou trois sont une
  STRUCTURE — celle du projet du club, qu'on lit sans avoir à la reconstituer.
  **Le titre est un lien vers l'axe**, et c'est gratuit : la page existe, et
  nommer une famille sans pouvoir l'ouvrir serait une porte peinte. Il porte la
  couleur de l'axe **par le texte et non par un aplat** — les tuiles ont déjà
  chacune leur pastille, et un bandeau coloré ferait deux couleurs qui se
  disputent le même bloc.
- **L'AXE D'UN DOMAINE SE DÉCLARE, IL NE SE DÉDUIT PAS** (`AXE_DU_DOMAINE`,
  js/projet-club.js) — correction de Noé : *« buvette fait partie de l'axe vie
  du club »*, puis *« éducatif ne fait pas partie de la vie du club, uniquement
  le terrain, et cohésion l'inverse »*.

  **CE QUE ÇA RÉPARE ÉTAIT UN DÉFAUT DE MODÈLE.** Je déduisais « ce pôle
  appartient à cet axe » en CROISANT les axes et les pôles d'un même objectif.
  Or un objectif porte parfois plusieurs des deux : « Intégrer les éducateurs à
  la vie du club, cohésion Coachs-CA » sert le terrain ET la vie, et relève de
  l'éducatif ET de la cohésion. Le croisement fabriquait donc les QUATRE paires,
  dont deux qui n'existent pas. *Mesuré : onze paires produites, deux fausses —
  exactement celles que Noé a vues.* **Un produit cartésien n'est pas une
  vérité** : que deux listes se croisent dans une même ligne ne dit rien de ce
  qui va avec quoi.

  **L'arborescence de Noé est EXCLUSIVE — un pôle, un axe — et c'est elle qui
  fait foi.** Elle tient en dix lignes et se relit d'un coup d'œil ; la relation
  inverse (les pôles d'un axe) lit la même table, car deux listes séparées
  finiraient par ne plus dire la même chose.

  **UN OBJECTIF, LUI, GARDE SES PLUSIEURS AXES** : la note de `projet-fch.js` le
  dit depuis le premier jour. Ce sont deux relations différentes — celle d'un
  OBJECTIF à ses axes, celle d'un DOMAINE au sien — et les confondre est
  précisément ce qui a produit les paires fausses.
- **L'ÉQUIPE EST CELLE DE L'ORGANIGRAMME**, empruntée et non recopiée
  (`portrait`) : responsables d'abord, et chaque visage mène à sa fiche.
- **LES VISAGES PASSENT DEVANT LE NOM, SUR LA TUILE** (demande de Noé : *« mets
  les photos des personnes qui y participent avec le responsable en 1er et un
  peu plus gros que les autres, puis en dessous le titre de la commission »*).
  La tuile disait un domaine ; elle dit maintenant une ÉQUIPE. *C'est
  l'argument de l'étagère de la bibliothèque — « le seul écran du hub où
  l'image passe devant le texte » — et il vaut ici pour la même raison : on
  cherche « qui s'occupe de ça », et un portrait y répond plus vite qu'un nom
  de pôle.*
  - **LE RESPONSABLE EST PLUS GROS, ET C'EST LE SEUL SIGNE** — 40 px contre 30,
    pas d'étiquette ni de couronne. C'est la mesure du dock, où « les voisins
    maigrissent pendant que l'actif grossit ». *Une commission à deux
    responsables en montre deux gros : c'est ce que disent les données.*
  - **ILS SE CHEVAUCHENT COMME UNE PILE DE JETONS** : six portraits à plat
    prendraient toute la largeur d'une tuile de 18 rem. Chacun garde un liseré
    de la couleur du fond, qui dit où finit l'un et où commence l'autre.
  - **LE RESPONSABLE PASSE DEVANT AU SENS PROPRE** (`z-index`) : la pile se
    peint dans l'ordre du document, et sans lui le premier serait le plus
    enfoui sous son voisin.
  - **SIX AU PLUS, ET LE RESTE SE COMPTE** (« +2 ») : les manifestations en
    réunissent huit, et alignés ils tomberaient à la taille d'un bouton. C'est
    la coupe du « +N » d'un jour trop chargé au calendrier.
  - **LA TUILE S'EST DÉPOUILLÉE AUTOUR D'EUX** (demande de Noé) : « pôle et
    commission » disparaît — neuf tuiles sur dix le disaient, et *ce qui ne
    distingue rien occupe de la place* —, la mission aussi (elle reste sur la
    page du pôle), et **le nombre de personnes** : les visages le disent, et
    mieux, on les compte du regard. **La pastille migre dans le titre** — un
    signe suit ce qu'il qualifie — et le nom monte d'un cran, devenu le seul
    texte de la tuile.
  - **LA RANGÉE GARDE SA PLACE, MÊME VIDE** (demande de Noé : *« garde de
    l'espace pour de potentielles futures personnes »*). C'est la règle de
    l'étagère de la bibliothèque — un bloc réserve sa hauteur —, et le vide dit
    ici quelque chose de vrai : la place attend quelqu'un.

> **DEUX PIÈGES DE MISE EN PAGE, PAYÉS SUR CETTE TUILE, et aucun ne se voyait
> sans mesurer :**
>
> **`align-self` BAT `align-items`.** Une règle générale pose `align-self:
> center` sur toutes les pastilles du hub ; posé sur le conteneur, mon
> `align-items` ne la touchait pas. *Mesuré : sur un titre étiré à 62 px par la
> grille, la pastille se centrait sur 62 et tombait 23 px sous le nom — mais
> seulement sur les tuiles SANS équipe, les seules à être étirées.*
>
> **UNE GRILLE RÉPARTIT SA PLACE EN TROP.** `.cap-tuile-ouvrir` est une grille,
> et les tuiles d'une rangée ont toutes la hauteur de la plus haute : elle
> écartait donc ses rangs pour combler. La Buvette, qui n'a pas de pied (aucun
> objectif), n'en avait que deux à écarter — *son titre tombait 16 px sous celui
> de sa voisine*. `align-content: start` colle les rangs en haut, et chaque
> écart se règle alors à la main : 4 px sous les photos, 2 px sous le nom.
- **AUCUN ZÉRO EN VITRINE** : un domaine sans équipe dit « personne n'y est
  encore nommé — ça viendra », un domaine sans objectif ne dit rien. C'est la
  règle du hub, celle qui fait taire une série à zéro sur une habitude neuve.
- **LES « FILTRES » DE LA PAGE DES OBJECTIFS SONT DEVENUS DES PORTES.**
  `pole-<id>` rechargeait la même page en ne montrant qu'un pôle ; elle ouvre
  maintenant la PAGE du pôle, qui montre les mêmes objectifs **plus** son
  équipe, ses projets et ses axes. *L'adresse ne change pas — un favori se
  casse, pas un nom — et le filtrage a disparu du code : garder les deux aurait
  fait deux écrans pour une même liste.*
- *Vérifié à l'écran : la chaîne axe → pôle → objectif → retour à l'axe, les
  dix domaines, et un domaine sans équipe.*

#### LES TUILES D'OBJECTIF PRENNENT LA FORME D'UN CAP DU HUB (20 septembre 2026)

Demande de Noé : *« ces tuiles objectifs doivent avoir plutôt la forme des
objectifs du hub »*.

**ELLES EMPRUNTENT `.cap-tuile`, ELLES NE LA RECOPIENT PAS** — mêmes classes,
même géométrie, même teinte de fond à 5 %. C'est la règle du site depuis qu'il
monte les écrans du cap : *« ce sont les modules du hub, pas des copies »*.

**CE QUI CHANGE, C'EST CE QUE CHAQUE PLACE PORTE**, parce que les objectifs du
club ne sont pas ceux de la base — ils n'ont ni jalons ni échéance :

| la place | dans le hub | ici |
|---|---|---|
| la pastille | l'espace | **l'AXE** et sa couleur |
| les marches | les jalons franchis | **l'INDICATEUR** — ce qu'on regarde |
| le pied | « 3 projets · 23 tâches » et l'échéance | ses **projets** et son **horizon** |

- **UNE RANGÉE DE MARCHES VIDES AURAIT ÉTÉ UN BRUIT PERMANENT** : c'est déjà
  l'argument du pointillé d'un projet qui n'a rien déclaré — on ne dessine pas
  une jauge pour une mesure qui n'existe pas.
- **LES DEUX VARIABLES DE COULEUR SE POSENT ENSEMBLE** : `--couleur-espace`
  tient la pastille, `--couleur-espace-pleine` la teinte du fond. La seconde
  existe parce que `color-mix` jette la déclaration entière s'il reçoit un
  dégradé — le piège documenté à sa définition.
- **L'HORIZON NE S'ÉCRIT QUE LÀ OÙ IL APPREND QUELQUE CHOSE.** Sur la page
  « Les objectifs », les colonnes SONT les horizons, et le répéter sur chaque
  tuile le dirait deux fois. *Et il le disait FAUX : un objectif porte parfois
  plusieurs horizons, et la tuile prenait toujours le premier — « la saison qui
  vient » s'affichait en colonne N+3.* **Le défaut n'existait pas avant : c'est
  moi qui l'ai introduit en ajoutant cette place, et la mesure l'a montré.**
- *Vérifié : les trois priorités sur un rang à 1280 px, hauteurs égales ; les
  trois colonnes d'horizon sans aucune répétition ; le lien mène toujours à la
  fiche de l'objectif.*

### Mise à jour : projet du club et évènements — 16 septembre 2026

Le projet du club est désormais un résumé (mission, six valeurs et trois
priorités de saison) avec les tuiles communes `fch-hall`. Mission, valeurs,
objectifs et projets ont leurs pages. Les 18 objectifs et 28 projets possèdent
des fiches documentaires reliées ; pas de suivi d'avancement ni d'édition à ce stade.
Le bloc « Pourquoi cette phrase-là » et le panneau dépliant de l'AG sont retirés.

#### LA FICHE D'UN ÉVÈNEMENT PORTE SON CALENDRIER (16 septembre 2026)

**Demande de Noé** : *« pour les évènements, dans leur page, je dois avoir un
calendrier sur lequel je peux prévoir la communication. »*

**CE QU'IL RÉPARE.** La page listait ses publications en trois piles — à venir,
les idées, les parues — et un formulaire pour en ajouter. On y voyait **ce qu'il
y a**, jamais **quand** : or la com d'un évènement est d'abord une affaire de
dates — l'annonce trois semaines avant, le rappel la veille, le bilan le
lendemain. Une date se posait dans un champ, à l'aveugle, sans voir ce qui
l'entoure.

**C'EST LA PAGE D'UN PROJET, appliquée ici** : une colonne de ce qui attend un
jour, un calendrier à côté, et l'on glisse de l'une à l'autre. Même dessin, même
geste, mêmes classes — *un geste qui existe ne se réinvente pas.* Deux colonnes
à partir de 1000 px, comme la page d'un cap et pour la même raison : il n'y en a
que deux, donc 18 rem de moins à trouver.

- **LE CALENDRIER S'OUVRE SUR LE MOIS DE L'ÉVÈNEMENT**, et c'est tout son
  intérêt : la com du Tournoi Rose se prépare autour du 17 octobre, pas autour
  d'aujourd'hui. *Sans ça, on arriverait sur le mois courant et il faudrait
  avancer de trois crans avant de voir la date qu'on vient préparer.* L'ancre ne
  se repose **qu'en changeant d'évènement** : revenir sur la fiche après avoir
  promené la grille ne défait pas ce qu'on regardait.
- **SA VUE ET SON ANCRE SONT À LUI**, jamais celles de la page Calendrier :
  programmer la pétanque ne doit pas déplacer le mois qu'on regardait dans
  l'autre onglet. C'est déjà la règle de la page d'un projet. *Vérifié : après un
  passage sur octobre depuis la fiche, `#hermitage/calendrier` est resté sur
  septembre.*
- **SEMAINE · MOIS · 3 MOIS.** Pas d'année — la com d'un évènement se joue sur
  quelques semaines autour de lui, et une case par semaine ne saurait pas dire
  lequel des trois posts du samedi on regarde. Pas d'agenda non plus : il
  répéterait la liste qui vit juste à côté.
- **LE JOUR DE L'ÉVÈNEMENT EST LE PIVOT**, posé sur sa propre grille en **tuile
  pleine à l'accent**, encre sombre. C'est autour de lui qu'on place tout le
  reste, et il doit se voir avant tout. *Le jaune parce que c'est la seule
  couleur qui ressorte sur ce bleu (§3) — et que la couleur d'espace du club EST
  ce bleu : une tuile bleue sur fond bleu n'aurait rien dit.* **Il ne se coche ni
  ne se glisse** : c'est une date du planning officiel, pas une ligne de base —
  `barreDeLEvenement` ne lui donne pas de `source`, et `brancherDeplacement`
  abandonne sans elle.
  - *Il faut le fabriquer à la main :* `assemblerCalendrier` ne connaît que les
    tables du hub, et un évènement de saison vit dans une table **écrite**
    (`EVENEMENTS_CLUB`). Sans lui, on programmerait autour d'un jour qu'on ne voit
    pas.
- **LA COLONNE NE PORTE QUE LES IDÉES** — celles de cet évènement, sans date. Une
  publication déjà datée est **sur** la grille ; la redire dans la colonne ferait
  deux endroits pour une même chose. **Les idées ont donc quitté la liste du
  bas**, qui ne garde que ce qui est daté et ce qui est paru.
- **DEUX CHEMINS POUR POSER, et c'est la règle du hub** : on **glisse** une tuile
  sur un jour à la souris ; **au doigt on la choisit, puis on touche le jour** —
  sur une liste verticale, un glissement ne se distingue pas d'un défilement. Un
  second appui repose l'idée : *un choix qu'on ne peut pas défaire est un piège.*
  Les jours s'allument tant qu'on tient quelque chose.
- **UN JOUR TOUCHÉ FAIT DEUX CHOSES, jamais les deux à la fois** : il POSE l'idée
  qu'on a en main s'il y en a une, sinon il OUVRE la tuile de capture — en nature
  **publication**, et **déjà rattachée à l'évènement**. C'est la règle de « Ma
  semaine », au mot près, et celle du « + » de la page d'un projet : *ce qu'on
  note depuis la page d'une chose sert cette chose.*
- **LA RUBRIQUE SE POSE À L'ÉCRITURE, PAS DANS LA TUILE.** Celle-ci n'a pas de
  champ rubrique, et lui en ajouter un pour ce seul besoin l'aurait posé aux
  quatre espaces — c'est déjà l'argument qui a tenu « La saison » hors du « + »
  le 29 août. **C'est l'écran qui sait ce qu'il crée.** *Il a fallu ajouter la
  colonne à `poserAuCalendrier` : elle ne recopie que ce qu'on lui nomme, et sans
  cette ligne la rubrique serait partie à la poubelle sans erreur ni signe — le
  piège qui a fait naître une parution rattachée à rien chez Yuno la veille.*
- **L'écriture est optimiste** : l'idée quitte la colonne et apparaît sur la
  grille sans attendre l'aller-retour ; si elle échoue, l'état d'avant revient et
  une ligne le dit.

**LA MÉCANIQUE DU GLISSEMENT A DÉMÉNAGÉ DANS `js/calendrier-commun.js`**
(`brancherPriseEnMain`). Elle était écrite **trois fois**, mot pour mot — « Ma
semaine », la page d'un projet, celle d'un objectif —, et cette page en aurait
fait un quatrième exemplaire : cent cinquante lignes recopiées, c'est-à-dire la
divergence qu'on passe ensuite à rattraper. *Les trois écrans d'origine n'ont pas
été touchés — ils tournent sur leur copie, et les faire basculer est un chantier
à part.*

> **Le piège de nommage, payé une ONZIÈME fois.** La section du calendrier s'est
> d'abord appelée `.evenement-grille` — un nom **déjà pris par la fiche d'un
> moment du site Yuno**, dans `css/yuno.css`, *chargée sur les trois pages*. Elle
> en héritait `grid-template-columns: auto minmax(0, 1fr)` : **mesuré, la barre de
> période écrasée à 145 px dans une section de 743, et son contenu débordant de la
> page de 107 px.** Elle s'appelle `.evenement-calendrier`. *Le grep de trois
> secondes n'est toujours pas facultatif, et il doit couvrir les trois feuilles.*

La rubrique Club inclut `#hermitage/evenements` et neuf fiches de saison issues
du planning fourni. Le loto et la matinée saucisses conservent leurs dates
alternatives. Chaque fiche propose le lien général du rétroplanning Drive et
un formulaire de publication réutilisant les actions du calendrier éditorial.
La rubrique de publication identifie l'évènement et reste protégée en édition.
Les communications se répartissent en idées, prévues et publiées. Les évènements
eux-mêmes restent un catalogue local, sans insertion automatique au calendrier.
Les dates du catalogue ne doivent pas changer sans préserver le rattachement
des publications (actuellement basé sur la rubrique contenant titre et date).

Vérifiés : syntaxe, gabarits et navigation navigateur. Sauvegarde Supabase non
testée par une écriture réelle. Le contrôle de coquille signale uniquement son
faux positif préexistant sur un SVG data URI ; le nouveau module est en cache v25.

### Historique des organigrammes

La liste des neuf commissions est remplacée par trois vues : Bureau et référents,
Commissions, Équipes sportives. Recherche transversale par nom, rôle ou mission.
45 fiches individuelles réunissent les appartenances et missions documentées.
Portraits repris des exports 2026–2027 ; Lina retrouvée ; Emma Liconnet unifiée
après confirmation de Noé. Sources et arbitrages : `docs/fch-organigramme-sources.md`.

Données et rendu dans `js/organigramme-fch-data.js` et `js/organigramme-fch.js`.
Les documents n’attribuant pas de missions individuelles détaillées à tous les
éducateurs, leurs fiches restent limitées aux rôles attestés. Vérification des
45 fiches et 23 groupes via `tools/verifier-organigramme-fch.js`, gabarits sains,
recherche et fiches vérifiées dans le navigateur, pas de débordement à 375 px.
Le vérificateur de coquille conserve son faux positif préexistant sur un SVG
data URI ; les nouveaux modules et portraits sont bien dans la coquille.
Modifications locales, non commitées et non poussées. Aucune écriture en base.

---

## Les visages, les missions, les pôles et les projets — 20 septembre 2026

Huit demandes de Noé dans la même journée, toutes parties d'un défaut vu à
l'écran. Le commit est `4f41788`.

### Un portrait par organigramme

**Le club exporte un dossier par organigramme** — bureau, commissions, sportif —
et la pastille y prend la couleur de l'organigramme : rouge au bureau, bleue aux
commissions, or au sportif. Le hub n'en gardait qu'un par personne, celui du
bureau quand il existait. **Les onglets se contredisaient donc** : on passait aux
commissions et les visages restaient rouges, sauf les quatre personnes qui ne
sont QUE dans les commissions.

- **Chaque affichage montre le portrait de SON organigramme** (`portrait(p,
  domaine)`, js/organigramme-fch.js). *Mesuré : 24 sur 24 aux commissions, 38 sur
  38 au sportif.*
- **Le défaut est le portrait historique**, et c'est ce qui rend le passage sûr :
  une personne absente de l'organigramme regardé garde celui qu'elle avait —
  jamais de trou. C'est aussi ce que lisent la fiche d'une personne et la pile du
  hall, qui n'ont pas d'organigramme à eux.
- **Le nom du fichier ne fait pas foi.** La table de correspondance de
  `tools/importer-portraits-fch.py` est ÉCRITE et vérifiée visage par visage :
  `Sportif/Sandrine.png` est **Emma Liconnet**, `Céd.png` est Cédric,
  `Alyssa-1.png` est Tom. *Un rapprochement deviné avait donné huit portraits
  faux le 16 septembre.*
- **Le cadrage se calcule**, et le piège est que **la bande du nom porte la même
  couleur que la pastille** : prise avec elle, la tache colorée descend jusqu'en
  bas et le disque ressort trop large et trop bas. On coupe sur les lignes
  entièrement transparentes qui les séparent ; le disque donne la largeur, le
  sommet de la tête donne le haut. *Les 48 cadres sont mesurés : disque centré à
  un pixel près, crâne dans le champ.*
- **La coquille passe de 1,6 à 3,2 Mo de portraits.** Un organigramme qui
  perdrait ses visages hors ligne ne serait plus un organigramme, mais c'est un
  vrai téléchargement de plus.

### Les missions : une source, deux lectures

Le document « Responsabilités FCH-2.pdf » (saison 2026–2027) se lit **deux
fois** — par personne (p. 1–3), par commission (p. 4–6) — et ce sont les MÊMES
missions rangées autrement. C'est la demande de Noé : *« un récap des
responsabilités et missions comme dans le document, joint aux missions de chacun
— si l'un change ça change sur l'autre page ».*

- **`js/missions-fch.js` porte les 135 missions en une liste plate** : une
  phrase, un thème, une commission, une ou deux personnes. Les deux écrans ne
  font que la GROUPER — la page d'une commission par thème, la fiche d'une
  personne par commission puis par thème.
- **`PERSONNES[].missions` se DÉRIVE** de cette liste au chargement. Écrites dans
  chaque fiche, elles auraient dû être recopiées dans la page d'une commission —
  et 135 phrases en deux endroits, c'est 135 occasions de diverger.
- **Le thème est neuf** : c'est le titre de colonne du document, et c'est lui qui
  rend le récapitulatif lisible. La version précédente les donnait en phrases
  longues ; celle-ci les découpe en gestes courts (Rémy passe de 6 à 16,
  Christophe de 8 à 20).
- **Le cadre du document ouvre l'onglet des commissions**, replié : *« cette
  répartition est un cadre d'aide… l'objectif n'est pas de rajouter de la
  pression »*. Une liste de 135 missions sans lui se lit comme une liste de
  comptes à rendre — exactement ce que le club a écrit qu'elle n'était pas.
- **Le contrôle le vérifie** (`tools/verifier-organigramme-fch.js`) : chaque
  mission doit apparaître sur le récapitulatif de sa commission ET sur la fiche
  de chacun de ceux qui la portent ; et une mission ne peut pas être donnée à
  quelqu'un qui n'est pas membre de la commission.

### La page d'un pôle EST celle de sa commission

Le récapitulatif a vécu une heure dans l'onglet de l'organigramme avant que Noé
ne le redirige : *« c'est dans ces pages là que je veux que ça apparaisse »*.
L'onglet répond à « qui est où » ; neuf récapitulatifs, même repliés, en
faisaient un sommaire de document. **Ce qui reste là-bas est le CHEMIN** : le
titre d'une commission mène à sa page.

- **La règle du lien est celle des DOMAINES**, pas `type === 'commissions'` :
  « Direction sportive » est un groupe de type *bureau* dans l'organigramme tout
  en ayant sa page de pôle. Les trois groupes du bureau n'en ont pas — ce sont
  des fonctions, pas des domaines.
- **« Organisation du club » rassemble trois commissions** — présidence,
  secrétariat, trésorerie (demande de Noé). Elles portent 42 des 135 missions et
  n'avaient aucune page. On y groupe **par commission d'abord, par thème
  ensuite** : les trois écrivent chacune un thème « Coordonner et déléguer », et
  les fondre mettrait sous un même titre les délégations du président, du
  secrétaire et du trésorier.
- **Deux blocs côte à côte** (demande de Noé) : « Qui le porte » à gauche — une à
  huit personnes, il laissait la moitié droite vide —, et à droite ce que le pôle
  a en tête : **ses objectifs de la saison, puis ses projets**, tous deux en rail
  qui glisse (`.projet-rail`, celui du tableau de bord).
- **LE CAP SE LIT AVANT CE QU'IL MÈNE** (demande de Noé : *« le ou les objectifs
  de l'année doivent apparaître plus haut dans la page »*). Les objectifs
  fermaient la page, sous le récapitulatif des missions — donc à deux écrans de
  défilement, et c'était le cap qu'on lisait en dernier. **Un projet ne se
  comprend qu'une fois qu'on sait vers quoi il pousse.**
- **SEULEMENT L'ÉCHÉANCE N+1 EN HAUT** (même demande) : le club pose ses caps sur
  trois colonnes, et cette page répond à « qu'est-ce qu'on fait cette saison ».
  *Mesuré : le pôle sportif en affichait cinq dont un seul de la saison, et les
  quatre autres repoussaient les projets hors de l'écran.* **L'horizon ne
  s'écrit plus sur ces tuiles** — elles sont toutes de la même saison, et le
  titre du bloc le dit.
- **CE QUI VIENT APRÈS FERME LA PAGE** (demande de Noé : *« les objectifs à plus
  long terme doivent être retrouvés en bas de page comme avant »*), en galerie et
  pleine largeur, chaque tuile disant son horizon. **Aucun objectif n'y figure
  deux fois** : un cap posé à la fois sur N+1 et sur N+5 est sur la table cette
  saison, donc il reste en haut — et sa tuile, qui n'écrit que le PREMIER
  horizon, dirait sinon « la saison qui vient » sous un titre annonçant le
  contraire. Le bloc se tait quand il n'a rien à dire.
- **L'AXE QUE LE PÔLE SERT EST DANS LA TÊTE**, en pastille au filet de sa
  couleur, au-dessus du nom (demande de Noé). Il avait une section à lui — « Ce
  qu'il sert » : un titre de bloc et une respiration de section pour dire un mot,
  qui est de la même nature que le rang. **Et il a remplacé ce rang** (« Pôle et
  commission »), qui nommait l'écran où l'on est — le menu y mène sous ce mot,
  l'onglet le porte — quand l'axe est la seule chose qu'on ignore en arrivant.
  Son fond à 18 % est dessiné pour le fond de la PAGE : sur le bandeau coloré il
  se lisait comme un trou creusé dedans, d'où le filet.
- **Le seuil du duo est 45 rem, soit 675 px** — la racine du site est à 15 px,
  donc 60 rem en faisaient 900 et une fenêtre de 880 retombait sur une colonne.
  Le chiffre vient de ce que les blocs demandent : 285 px pour une porte de
  projet, 640 pour les deux colonnes.
- **Le prochain évènement, sur la page des manifestations et sur elle seule**
  (demande de Noé), au-dessus des projets, avec son jour, son lieu et un lien
  vers sa page. La question « c'est quand le prochain ? » ne se pose pas sur les
  huit autres pôles.

### Les projets du club s'ouvrent, un par un

Les 28 projets du projet associatif étaient des données déclarées ; leur page
l'avouait en pied : *« Responsable, étapes et dates de réalisation restent à
préciser »*. Noé les veut comme les siens : **des jalons, un calendrier sur
lequel on peut poser des choses.**

- **Deux tables à part** — `projets_club`, `projets_club_etapes` — et c'est sa
  décision entre trois options : *« ça ne s'affichera pas dans mon calendrier,
  seulement dans le calendrier de la page du projet »*. Rangés dans `projets`,
  les 28 auraient rejoint ses 7 projets d'alternance, donc « Mes projets », le
  rail de son accueil, « Mon temps » et sa charge.
- **Conséquence assumée, et voulue** : `taches.projet_id` pointe vers `projets`,
  donc **une tâche du hub ne peut pas se rattacher à un projet du club**. Ce
  qu'on pose sur ce calendrier, ce sont ses ÉTAPES. *Noé a confirmé le
  20 septembre : « pas les tâches pour le moment ».*
- **Rien n'est créé d'avance** (même décision : « un par un, à la demande ») :
  tant qu'un projet n'est pas ouvert, la page montre ce que le document en dit et
  un bouton. Le geste est REJOUABLE — `cle` est unique, donc ouvrir deux fois
  rend la ligne qui existe déjà.
- **La page reprend les briques de celle d'un projet du hub** sans les recopier :
  la colonne des étapes (`.cap-jalon`), les quatre vues, la grille, le glissement
  d'une ligne vers un jour. `js/projet-club-page.js` se monte dans un hôte, comme
  les écrans du cap.
- **Ses gestes ne remontent pas au site**, et c'est ce qui la fait marcher :
  `hermitage.js` écoute `data-choisir`, `data-vue-cal`, `data-periode` ET les
  jours du calendrier (`brancherSelection` sur sa section). Sans cette garde,
  choisir une étape faisait redessiner la page du site, qui remontait le module
  et reposait l'étape. *L'écriture partait pourtant — la base recevait
  l'échéance —, mais l'objet modifié n'était plus celui de la liste : rien ne
  bougeait à l'écran, et un rechargement montrait le bon résultat.*

### Le calendrier du club se lit en bleus

La couleur y disait l'ESPACE ; il n'y en a qu'un sur ce site, donc elle ne disait
rien — et comme aucune barre ne porte de `data-espace`, les 63 retombaient sur
`--accent`, c'est-à-dire sur le jaune. **Un écran où tout est d'accent est un
écran où rien n'est mis en avant.**

- **Sur ce site, la couleur dit la NATURE** — ce qu'elle ne peut pas faire au
  hub, où elle est déjà prise. La police continue de la dire aussi : les deux
  signes se renforcent.
- **Trois clartés d'une même teinte, et la clarté monte avec la présence** : la
  tâche (et le jalon, l'objectif, l'étape) n'a qu'un trait ; la parution, un
  trait et un voile ; l'évènement, un aplat plein. *Noé a d'abord gardé le jaune
  pour les évènements, puis l'a retiré aussi : ce qui distingue l'évènement n'a
  jamais été sa couleur, c'est son aplat.*
- **`--club-bleu-1` (#4d75db) est écarté** et il faut le dire, parce qu'il semble
  le choix évident : *mesuré, 2,48:1 sur le fond de page — un trait de 3 px y
  disparaît, un aplat y devient trouble.* Les trois retenus tiennent entre 4,19
  et 5,96.
- **Les trois contrôles suivent** — la vue active, la case cochée, la pastille du
  jour —, avec l'encre du bleu nuit : *3,22:1 contre 6,27.* Le « + » flottant et
  le dock gardent le jaune : ils sont sur tous les écrans, la demande portait sur
  le calendrier.

### Un jour s'ouvre en grand depuis la vue semaine

Demande de Noé, « comme dans la page d'accueil du hub ». Le gabarit savait déjà
le faire : deux options, `titresOuvrants` et `jourSeul`.

**Ouvrir ne redessine rien** — ce sont les largeurs des sept colonnes qui
glissent, de `1fr` à `0fr`. Un `rendre()` couperait l'animation faute d'un état
de départ. On sort par où on est entré ; les flèches passent au jour voisin et
s'éteignent aux deux bouts ; **un jour ouvert ne survit ni au changement de vue
ni au changement de semaine** — il désigne une date, et la semaine d'à côté ne la
contient pas.

### Le menu, la typographie

- **Le menu retrouve son équilibre** : 5 / 4 / 6 / 3 au lieu de 5 / 4 / 8 / 0.
  Les trois pages des partenaires y entrent ; les deux sous-pages des réunions en
  sortent et retrouvent leur rang, derrière leur page mère. **`PAGES_DU_SITE`**
  recense ce qui EXISTE, quand le menu dit ce qu'on OFFRE : le grand titre, la
  pastille du dock et la rubrique dépliée le lisent, et les trois se seraient
  perdues sinon.
- **« Mes objectifs », « Mes projets », « Mes tâches »** (règle de Noé). Ce qui
  change n'est pas la règle mais QUI PARLE : le hub regarde ses espaces de
  l'extérieur, ici on est dedans — le club a ses objectifs à lui, ceux-ci sont
  ceux de Noé.
- **Le site ne parle plus que Gilroy** : les compteurs quittent Geist Mono et le
  dock quitte Inter. L'objection écrite (« Gilroy n'aligne pas ses chiffres en
  colonne ») était fondée sur un fait vrai — *le « 1 » fait 14,2 px contre 25,2
  pour le « 0 »* — mais **Gilroy A des chiffres tabulaires**, simplement pas
  allumés : une ligne les allume, et les colonnes retombent d'aplomb.
- **Les gros chiffres d'un tableau de bord sont en Clash Display**, et ils
  demandent la FAMILLE (`--police-affichage`) et non le RÔLE (`--police-titre`),
  que le club repose sur Gilroy. L'approche négative tombe : réglée pour Gilroy,
  elle **mangeait le séparateur de milliers** — « 17 330 € » se lisait
  « 17330€ ».
- **L'en-tête d'une tuile se replie** sur ce site : trois étiquettes et une date
  ne tiennent pas dans 311 px, et une rangée qui ne se replie pas n'a que deux
  issues — écraser ou sortir du cadre. Elle faisait les deux.
