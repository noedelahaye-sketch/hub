# État des lieux — 2 septembre 2026

> **Reprise : § 4 bis, « Par où reprendre ».**
>
> Ce document dit **où en est le hub** — `CLAUDE.md` dit ce qu'il doit être, et
> les deux cahiers des charges (`yuno-spec.md`, `fch-spec.md`) font autorité sur
> leurs sites. La façon dont le hub **oriente** Noé a le sien :
> [orientation-spec.md](orientation-spec.md). À relire au début d'une session,
> à mettre à jour à la fin.
>
> **§ 0 raconte la dernière session** (2 septembre : **CHAQUE PROJET, CHAQUE CAP
> ET CHAQUE HABITUDE ONT LEUR PAGE** — `#projet/<id>` et `#objectif/<id>`, en trois
> colonnes : son découpage, son calendrier en mois et semaine, et l'étage en
> dessous. Tout se glisse d'une colonne au calendrier et revient. Les deux
> dépliages sur place ont disparu de `#objectifs`, leurs machineries ont suivi,
> et **une étape porte désormais un jour**).
>
> **§ 0 ante** le 1er septembre après-midi et soir (l'algorithme des blocs tient
> ses quotas ; « Ma semaine » garde ce qu'on y arrange ; « Mes journées » devient
> un journal). **Son § 0.9 liste les décisions qui ont fait un aller-retour** —
> il y en a beaucoup : **à lire avant de « corriger » quoi que ce soit dans la
> tuile d'une journée ou dans les blocs.**
>
> **§ 0 ante bis** le 31 août – 1er septembre au matin (le calendrier change de
> grammaire, les blocs de « Ma semaine » naissent), **§ 0 ante ter** le 30–31
> août au soir (« Ma semaine » naît, les tuiles d'ajout passent en pastilles),
> **§ 0 ante quater** le 30 dans la journée (le FCH prend sa charte, perso refond
> ses habitudes), **§ 0 ante quinquies** le 29 au soir (perso devient un espace
> vivant), **§ 0 ante sexies** le 29 dans la journée (l'accueil refondu),
> **§ 0 ante septies** le 28 au soir (la navigation à deux rangs), **§ 0 ante
> octies** le 28 dans la journée, **§ 0 ante nonies** le 27 après-midi,
> **§ 0 ante decies** le 27 au matin, **§ 0 ante undecies** le 26, **§ 0 ante
> duodecies** les 24–25, **§ 0 ante terdecies** le 24, **§ 0 ante quaterdecies**
> le 21, **§ 0 ante quindecies** le 15, **§ 0 ante sexdecies** les 14–15. Les
> § 1 et suivants décrivent l'état stable et les chantiers antérieurs.

## 0. La session du 2 septembre 2026 — CHAQUE PROJET, CHAQUE CAP, CHAQUE HABITUDE A SA PAGE

**UNE MIGRATION, appliquée à la base réelle** :

| | |
|---|---|
| `20260902090000_echeance_etape.sql` | colonne `projets_etapes.echeance` |

**DEUX FICHIERS NEUFS** : `js/projet.js` et `js/objectif.js`, les espaces
`projet` et `objectif` du routeur. **`js/objectifs.js` est passé de 2 295 à
1 423 lignes** : les deux dépliages sur place et toutes leurs machineries l'ont
quitté. Il ne lui reste que ce pour quoi il est fait — **trois galeries qui
comparent** (les caps, les projets, les périodes) et les formulaires du hub.

### 0.1 La demande, et les deux choix que Noé a tranchés

> « Pour les projets, chacun d'eux doit avoir sa propre page (à ouvrir depuis la
> page projet) dans laquelle un calendrier en vue mois et semaine et une colonne
> pour les tâches et étapes que l'on pourra glisser dans le calendrier pour les
> programmer. La page doit contenir tous les détails du projet également. »

Deux questions se posaient avant d'écrire une ligne, et les deux étaient les
siennes :

1. **Glisser une ÉTAPE sur un jour — qu'est-ce que ça écrit ?** Une étape n'avait
   pas de date, et c'était une règle écrite : *« elle découpe le TRAVAIL, pas le
   calendrier »* (29 août). Deux réponses possibles — fabriquer une tâche qui la
   porte, ou donner un jour à l'étape. **Noé a choisi la seconde** : ce qu'on
   glisse doit être ce qu'on retrouve.
2. **Que fait la tuile de la galerie ?** **Elle ouvre la page** : deux endroits
   qui montrent la même chose finissent par se contredire.

Puis, devant la première version, **deux corrections qui ont refait la page** :

3. *« Plutôt qu'une répétition des étapes et des tâches, faisons une colonne à
   gauche du calendrier pour les étapes comme elles sont affichées actuellement,
   et que l'on peut glisser-déposer à une date du calendrier ; et à droite
   pareil, une colonne pour les tâches que l'on peut filtrer. »* La page portait
   TROIS listes — une colonne « À poser », puis la frise entière et la liste
   entière sous le calendrier : une étape sans date s'affichait **deux fois, à
   deux endroits qui ne se ressemblaient pas**. Elle en porte deux, une de chaque
   côté du calendrier, et **chaque chose n'y est qu'une fois**.
4. *« Plutôt que "à faire" pour le filtre des tâches, c'est les tâches
   programmées. »* Et c'est plus juste : « à faire » CONTENAIT « à poser », si
   bien que passer de l'un à l'autre ne retirait rien. Les trois filtres sont
   maintenant **disjoints** — à poser · programmées · faites — et, mis bout à
   bout, ils font exactement le projet.

### 0.1 bis La page d'un objectif, dans la foulée

**La demande** : *« on va faire pareil pour les objectifs : une page indépendante
pour chacun avec tous les détails, un calendrier qui permet de poser les jalons.
Et une vue (et un lien vers la page détail) des projets qui lui sont
rattachés. »*

**C'EST LA PAGE D'UN PROJET, UN ÉTAGE PLUS HAUT** — mêmes trois colonnes, même
geste, mêmes mots.

**MAIS LES PROJETS NE SONT PAS DANS UNE COLONNE**, et c'est Noé qui l'a vu :
*« les projets ne sont pas à "poser" »*. **Les deux colonnes qui encadrent un
calendrier sont une RÉSERVE : ce qu'elles portent se glisse sur un jour.** Un
projet n'a pas d'échéance qu'on déplace du doigt — il a une page. Les y mettre
promettait un geste qui n'existe pas. Ils forment donc **un rail pleine largeur
SOUS le calendrier** — celui de l'accueil, tuile pour tuile, avec un lien vers
la page de chacun ; la colonne de droite ne garde que les tâches accrochées au
cap **sans projet**, qui elles se posent. *Le rail a été demandé au-dessus du
calendrier, puis corrigé en dessous dans la foulée.*

**UN JALON N'A EU BESOIN D'AUCUNE MIGRATION** : il porte une `echeance` depuis le
premier jour, et le calendrier savait déjà le lire, le déplacer, le corriger et
le supprimer. **C'est la seule différence avec l'étape d'un projet**, qu'il a
fallu doter d'une colonne le matin même — et elle dit quelque chose de vrai : un
jalon a toujours été un point du calendrier, une étape un morceau de travail.

**L'argent de « Rembourser mon matériel » a suivi l'écran** : il ferme la page du
cap.

**PUIS LA PAGE A PERDU SA TROISIÈME COLONNE** (*« supprime la colonne de
droite »*) : un cap n'a qu'une chose à poser sur son calendrier, ses jalons. Les
tâches accrochées au cap sans projet ne s'affichent donc plus ici — **conséquence
assumée**, elles vivent dans l'espace Tâches et au calendrier quand elles ont une
date. Le calendrier prend la place rendue, et les deux colonnes arrivent dès
1000 px.

### 0.1 ter Une vue « 3 mois », et sa forme à elle

**La demande** : *« rajoute une vue 3 mois au calendrier »* — puis, devant trois
grilles de mois empilées : *« les 3 mois doivent être 3 colonnes, ça ne doit pas
avoir la même forme que les mois de la vue mois, c'est trop long »*.

**IL A RAISON, ET C'EST UNE QUESTION DE NATURE.** Une grille de mois est faite
pour qu'on LISE un jour ; le trimestre répond à « où sont les échéances, où sont
les creux ». Sa case porte donc son numéro et des POINTS — le choix du calendrier
de « Mes journées », pour le même motif. *Mesuré à 1210 px : 295 px pour les trois
mois, contre 1 700 pour trois grilles empilées.*

**CE QU'ON GARDE, ET C'EST LE PLUS UTILE** : la case reste un `.cal-jour` avec sa
date, donc **un jalon se glisse à deux mois sans changer de vue**. Aucune autre
vue ne le permettait.

**PUIS LES TROIS MOIS SE SONT COLLÉS** (*« les mois doivent être collés côte à
côte, le L de lundi, M de mardi… ne doit pas y être, seulement le mois doit être
inscrit à cette place »*). Un seul cadre pour les trois — trois `.cal-grille`
voisines gardaient chacune son contour et ses coins arrondis au milieu du
trimestre —, et le nom du mois prend le rang des initiales, qui ne servaient à
rien : on ne vise pas un mardi dans cette vue. *Mesuré : 274 px pour les trois
mois, et les colonnes se touchent au pixel.*

### 0.1 quater Et une vue « Année », par semaines

**La demande** : *« crée une vue par année, par 12 mois plutôt (mais appelée
année) ; tu ne référence pas tous les jours, seulement les semaines… Quand on
déplace un jalon dedans, ça se place au lundi de la semaine choisie. »* Puis :
*« les numéros doivent dire le numéro de la semaine plutôt que le numéro du
lundi »*, et *« quand j'appuie sur une semaine ça doit me mener à sa vue semaine,
et quand je clique sur le nom du mois ça doit m'amener vers sa vue mois »*.

**MÊME MOUVEMENT QUE LE TRIMESTRE, D'UN CRAN ENCORE** : des barres dans un jour,
puis des points dans un jour, puis des points dans une SEMAINE. *Mesuré : 398 px,
la hauteur d'une vue mois, pour douze mois.*

**DEUX DÉFAUTS TROUVÉS EN LE CONSTRUISANT** :
1. **Une semaine rangée par son LUNDI laissait un TROU.** La semaine du 31 août
   n'était d'aucun des douze mois d'une année ouverte en septembre, **et les
   échéances du 2 et du 3 septembre ne se voyaient nulle part**. La règle est
   celle d'ISO 8601 — le mois du JEUDI : aucune semaine deux fois, aucune
   oubliée.
2. **Le numéro de semaine se trompait en fin d'année.** Compter depuis « le jeudi
   de la semaine du 1er janvier » échoue quand celui-ci appartient à l'année
   d'avant : le 4 janvier 2027 sortait en semaine 2 au lieu de 1. *Dix cas de
   bord vérifiés depuis, dont les semaines 53.*

**C'EST UNE VUE OÙ L'ON ZOOME**, la seule du hub où un appui n'ouvre pas la tuile
de capture : on ne pose pas une chose « dans une semaine », on descend d'un cran
pour voir où.

**`#calendrier`, le site Yuno et celui du club gardent leurs trois vues** : la
barre sait déplacer et nommer le trimestre comme l'année, mais c'est l'option
`vues` qui décide page par page.

**LA FENÊTRE GLISSE D'UN MOIS, elle ne se tourne pas comme une page.** J'avais
posé un pas de TROIS mois — septembre-novembre sautait à décembre-février — et
Noé l'a corrigé deux fois, la seconde avec un exemple : *« la période actuelle
est septembre-novembre ; si j'appuie sur la flèche qui va vers la droite, la
période doit être octobre-décembre »*. **Une fenêtre de trois mois n'est pas une
page de trois mois** : on la fait glisser pour suivre une échéance qui arrive au
bord. *Vérifié à la vraie souris : sept–nov → oct–déc → nov–janv, et retour.*

**UN DÉFAUT ANCIEN TROUVÉ EN VÉRIFIANT CE PAS.** `deplacerAncre` déplaçait
l'ancre avec `setMonth`, **qui déborde quand le mois d'arrivée est plus court que
le jour de départ** : depuis le 31 janvier, « mois suivant » donnait le 3 mars —
**février était sauté**, et ça touchait le calendrier plein écran depuis
toujours, un mois sur sept. L'ancre repart maintenant du 1er du mois.

### 0.1 quinquies Et une page par HABITUDE

**La demande** : *« chaque habitude doit avoir une page dédiée également, avec
toutes les stats intéressantes et les détails (dont depuis quand je l'ai
ajoutée/commencée) + un calendrier qui permet de voir quand l'habitude a été
faite ou non (vue mois, 3 mois). »*

**MÊME MOUVEMENT, AUTRE NATURE.** Un cap a des jalons à POSER ; une habitude n'a
rien à poser, **elle revient**. Son calendrier regarde donc en arrière, et c'est
**la seule grille du hub où l'on coche un jour passé** au lieu d'y déposer
quelque chose.

**LA CARTE RESTE**, à la différence des caps et des projets dont le dépliage a
disparu : elle est un tableau de bord qu'on lit tous les jours pour cocher, pas
un index dupliqué. Son nom devient la porte.

**Ce que la page ajoute** : **la première fois** (et non la date de création —
*« la date où l'on a TAPÉ une habitude ne dit rien »*), **les deux séries en
couleur** — celle en cours et le record, sous le même réglage du −1 —, tous ses
paliers, son rythme, et le calendrier.

**HUIT CORRECTIONS DE NOÉ, ET DEUX SONT DES RÈGLES DU HUB QUE J'AVAIS
OUBLIÉES** :
1. *« Plutôt que "8 avant 10", montre ce que j'ai fait, donc 2/10. »* C'est la
   **philosophie n° 1** — le hub est un miroir de ce qui a été accompli, pas une
   liste de ce qui reste. Les deux tuiles n'en font plus qu'une : le total EST le
   numérateur.
2. *« Enlève le "posé le…", la donnée 1ère fois est plus intéressante. »*
3. *« La vue mois doit prendre toute la largeur, comme les autres vues mois
   utilisées sur le site, la même forme. »* Elle empruntait la grille compacte du
   trimestre — une forme que le hub n'a nulle part ailleurs.
4. *« La case des initiales des jours doit être plus fine. »* `grid-auto-rows`
   vaut pour tous les rangs implicites, en-tête compris : la rangée faisait 48 px
   comme un jour. *Mesuré après : 14 px.*
5. *« Pour les séries journalières, le graphique doit être par jour et non par
   semaine, montre les 14 derniers jours »*, puis *« avec le dernier jour à
   gauche »*. **La maille doit suivre ce que l'habitude COMPTE** : une quotidienne
   compte des jours depuis le 30 août, et sa courbe le disait en semaines — « 7
   sur 7 » et « 4 sur 7 » y faisaient deux barres pleines. *Une barre qui ne peut
   pas montrer un écart ne montre rien.* Et on lit de gauche à droite : la
   première chose lue doit être aujourd'hui.
6. *« Supprime "où elle en est" »*, puis *« supprime les petits ronds et en
   sommeil »*. **Ce qui se montre n'a pas à se nommer** — la coupe de la tuile
   d'une journée, la veille. L'élan faisait ici un sixième chiffre, dans une
   autre unité et sous une autre forme, au-dessus de cinq qui se comparent ; il
   reste où il vit, sur les cartes.
7. *« Remets la 1ère fois à la place qu'elle était au début, en dessous des
   stats, en petit comme dernière fois. »* Elle était montée en tête, en corps de
   texte, où **elle pesait autant que le pourquoi de l'habitude** — alors que
   c'est un fait de même nature que les deux qui la suivent.
8. *« Les chiffres des dashboards doivent être en Clash Display. »* La règle de
   `.chiffre-cle` et du bilan de « Ma semaine » : un chiffre qu'on vient VOIR se
   donne du poids, un chiffre qu'on vient COMPARER garde sa chasse fixe.

**UN CINQUIÈME CHIFFRE, ET C'EST LE SEUL DU HUB QUI COMPTE UN MANQUE** : *« il
faut rajouter aussi comme stat le pourcentage de fois où elle a été complétée, en
prenant comme date référence la 1ère fois où elle a été faite. »* La règle des
habitudes l'interdit depuis le 30 août — « aucun taux de réussite » — et Noé le
redemande, donc il existe ; **ce qui le rend tenable, c'est qu'il est un parmi
cinq**, à côté de quatre qui ne peuvent que monter, sans rouge ni seuil.
L'attendu se déduit de la cadence (`jours × cadence / 7`), le taux est plafonné à
100 %, et une habitude jamais pratiquée n'en a pas. *Vérifié hors écran : 5 jours
sur 7 en quotidienne donnent 71 %, 6 pratiques pour 6 attendues donnent 100 %.*

**LE RECORD DE SÉRIE ÉTAIT DÉJÀ CALCULÉ** et ne s'affichait nulle part —
`serieDeLHabitude` le rend depuis le premier jour, sous le même réglage du −1. Il
n'y avait rien à recalculer, seulement à le montrer.

**LES DEUX SÉRIES ONT DEMANDÉ CINQ PASSES DE PLUS**, et chacune corrige une
erreur de ma part : les mots (« jours tenus » / « au mieux » demandaient de
deviner qu'il s'agissait d'un record → « série en cours » / « série max »), la
forme (la tuile entière était teintée → **seul le chiffre**), la couleur (la MÊME
des deux côtés → **pas de violet, et une par mesure**), puis **une ÉCHELLE** —
vert au début, bleu après trois, jaune à deux crans du record, **or en dégradé
quand les deux sont à égalité**, orange pour le record — et enfin le retrait de
« tu y es », *« c'est les couleurs qui me le disent »*.

**UNE FLAMME À CINQ JOURS D'AFFILÉE**, et ce n'est PAS la série : celle-ci recule
d'un cran quand un jour manque, donc « 7 jours tenus » peut avoir deux trous
dedans. La flamme dit cinq jours SANS trou. **L'une protège, l'autre récompense**
(`joursDAffileeDeLHabitude`, js/orientation.js).

**L'échelle est vérifiée hors écran** — dix cas, dont ceux qui piègent : série et
record à 1 le premier jour (or, pas jaune), série 2 sur record 5 (vert, pas
jaune).

**ET LA CARTE A MAIGRI D'AUTANT** (*« moins d'infos, seulement l'essentiel, avec
le voc qu'on a corrigé ; pas de graphique ici »*) : plus de sparkline ni de
légende, « série en cours » au lieu de « jours tenus », « 2/10 vers le palier »
au lieu de « encore 8 avant 10 · 2 au total », et une quotidienne ne dit plus
« pas encore aujourd'hui » — son rond le dit, et ce mot comptait un manque.
*Mesuré : une carte passe de 300 px à 137.* **C'est la conséquence directe de la
page** : ce qui traînait sur la carte y était parce qu'il n'y avait nulle part où
le poser.

**L'ÉLAN A QUITTÉ LE HUB**, en deux temps (« supprime les petits ronds et en
sommeil », puis « enlève alors en sommeil et les petits points ») : il n'existe
plus nulle part à l'écran. **Ce qui l'a tué n'est pas son calcul mais son mot** —
« en sommeil » s'affichait sur les neuf habitudes à la fois, et un mot identique
partout ne distingue rien. Les seuils restent dans js/orientation.js ; y remettre
un affichage est l'affaire de trois lignes.

**LA LIGNE DU TABLEAU DE BORD PERSO PORTE LES DEUX SÉRIES** (« les stats
présentes doivent être série en cours et série max, avec le code couleur »), aux
mots et aux couleurs de la page. La règle à seuils est sortie de l'écran pour
`rangDeLaSerie` (js/orientation.js), **vérifiée sur dix cas** : deux copies d'une
règle de couleur finissent par ne plus colorer pareil, et ça ne se voit qu'à
côté.

**LES DEUX CHIFFRES SONT TOUJOURS LÀ, ZÉRO COMPRIS** (« je ne vois pas la série
max là », « si la série en cours est 0 mets 0 ») : le record se taisait à égalité
et la série se taisait à zéro. **Une colonne vide ne se lit pas comme "c'est
pareil", elle se lit comme "il n'y a rien"** — et dans deux colonnes alignées, on
ne savait plus lequel des deux chiffres manquait. En **Google Sans**, comme le
décompte des heures du bilan : à 13 px, deux chiffres seuls s'étalent en chasse
fixe au lieu de se lire.

### 0.1 ter L'émoji d'une habitude ne s'enregistrait pas

*« Ajouter un émoji ne fonctionne pas pour l'instant. »* **La panne était en deux
morceaux, et le premier était MUET** : le formulaire le demandait depuis le
30 août, la base a sa colonne, et l'objet `valeurs` de l'enregistrement ne le
reprenait pas — la valeur partait à la poubelle sans erreur ni signe.

**Le second était le champ lui-même** : un `text` étiqueté « Émoji (facultatif) »,
qui demandait d'en TAPER un, c'est-à-dire de connaître ⌃⌘Espace. Il devient un
**carré cliquable à gauche du nom** (forme demandée, Notion en référence), qui
ouvre un panneau : un champ de texte qui prend le focus — sur iPhone le clavier
monte de lui-même, sur Mac le raccourci d'Apple écrit dedans — et **soixante-quatre
émojis choisis** en dessous, pour le doigt.

**Aucune API du navigateur n'ouvre le sélecteur du système** ; c'est ce qui a
décidé de cette forme. `emojiDeLaSaisie` ne garde que la dernière suite
pictographique de ce qui est tapé, **jointures et teintes de peau comprises** —
sinon une famille ressortirait coupée en deux. *Vérifié sur sept cas.*

**ET UN PANNEAU NE SE RETOURNE PLUS QUE SI ÇA AIDE** (`placerLePanneau`) : la
règle basculait vers le haut dès qu'il dépassait en bas, sans regarder la place
au-dessus — le panneau des émojis, ouvert au premier champ d'une tuile, allait se
faire couper par le haut. Ce qui ne tient toujours pas DÉFILE au lieu de
déborder. *Le défaut touchait tous les panneaux du hub.*

**UNE SEULE REQUÊTE DE PLUS EN BASE** : `faitsDeLHabitude` lit tous les faits
d'une habitude, sans fenêtre. Le cumul depuis toujours et un calendrier qu'on
peut remonter mentiraient tous les deux sur soixante jours.

### 0.1 quater Deux réglages de la fin de session

**LES DURÉES PROPOSÉES EN COCHANT** : *« ajoute une option 5 min dans les
propositions de durée lorsque je finis une tâche, et enlève 1 h 30 »* —
`DUREES_FAITES` passe à **5 min · 30 min · 1 h · 2 h · 3 h**. Le pas court
manquait : beaucoup de ce qu'on coche là ne dure pas une demi-heure, et ces
tâches repartaient **sans durée**, ce que la première ligne de `#temps` compte
déjà. *J'ai d'abord modifié `DUREES_PROPOSEES`, la liste de la tuile de capture —
il y en a deux, et ce sont deux questions : l'une réserve un créneau, l'autre dit
ce qui a été fait. Vérifié à l'écran avant de conclure.*

**L'ORDRE CHRONOLOGIQUE DES JALONS ET DES ÉTAPES** : *« il faut qu'ils soient
dans l'ordre chronologique, donc que leur position s'adapte en fonction de la
date qui leur est attribuée »*. Un jalon glissé au calendrier sur une date plus
lointaine que son voisin restait devant lui dans la frise — **les deux moitiés de
la même page se contredisaient**.

`rangerParEcheance` (js/format.js) ne fait bouger que **les marches datées, et
seulement les unes par rapport aux autres** : elles se rangent dans les places
qu'elles occupaient déjà, ce qui n'a pas de date ne bouge pas d'un rang.

> *Le tri global par date était mon premier réflexe, et il est faux ici.* Un
> découpage n'est pas une galerie, c'est un CHEMIN — mesuré sur les données de
> Noé : « Laisser une com qui tourne sans moi » porte cinq jalons sans date puis
> un daté au 15 décembre qui en est la **conclusion**, et le tri « datés
> d'abord » l'aurait mis en tête.

**Vérifié à l'écran** : le cap aux quatre jalons datés se range par date (une
date poussée à janvier renvoie « 900 abonnés » en fin de frise, puis remise) ; le
cap aux cinq indatés garde son ordre ; « Monter/Descendre » disparaît entre deux
marches datées et reste à la frontière avec une indatée. *La base a été remise
dans son état.*

### 0.2 Ce qui est parti de `#objectifs`

- le dépliage d'un PROJET : `detailProjet`, `friseEtapes`, `surQuoiIlSeMesure`,
  `capsServis`, `etat.projetGalerie` et les gestes qui les ouvraient ;
- le dépliage d'un CAP : `detail`, `frise`, `tuileProjet`, `ligneTache`,
  `blocDesFaites`, `construireArgent` ;
- **les deux machineries** — franchir un jalon ou une étape, les ordonner, les
  poser, les modifier, les supprimer ; cocher une tâche, la rattacher, relire ce
  qui est fait ; les prestations et le matériel. Rien de tout cela n'y était
  atteignable autrement que par un dépliage.

**Les galeries gardent tout ce qui se COMPARE** : les tuiles, leurs marches et
leurs jauges, la pastille d'état d'un projet, les menus — modifier, marquer
atteint, supprimer — et les périodes. **Quatre requêtes au chargement au lieu de
six.**

### 0.3 Ce qui a été mis en commun plutôt que recopié

| Ce qui a bougé | Où | Pourquoi |
|---|---|---|
| `construireMenuDiscret` | `js/objectifs.js` → `js/gabarits.js` | les deux pages en portent un sur chaque ligne |
| `FORMULAIRES`, `grouperLesTaches`, `jaugeDuProjet`, `motDeLAvancee`, `motDuMouvement`, `pastilleEtat`, `marches`, `ETATS_PROJET*` | exportés de `js/objectifs.js` | une jauge ou des marches qui diraient deux choses selon l'écran feraient croire celui qu'on regarde le plus |
| `.semaine-en-main` → `.en-main` | `css/styles.css` | deux pages s'en servent ; le nom ne pouvait plus dire « semaine » |
| `.semaine-programmation`, `.semaine-grille`, `.semaine-vivier` | `.projet-page-*` ajouté par une virgule | même geste, mêmes règles, une seule déclaration |

**`construireBarrePeriode` prend une option `vues`** : la page d'un projet
n'offre que le mois et la semaine. Un agenda y répéterait la liste de ses
tâches, qui vit juste en dessous.

**`etape` est un TYPE du calendrier, jamais une NATURE** — exactement le statut
du « bloc » de « Ma semaine ». Le reste s'est branché tout seul :
`champsApresDeplacement` range déjà toute date inconnue dans `echeance`, et
`champsDeModification` demande un titre et une échéance à ce qui n'est ni un
événement ni une publication. Il n'a fallu ajouter que l'écriture
(`appliquerAuCalendrier`, `effacerDepuisLeCalendrier`) et trois entrées de
vocabulaire (`TYPES`, `SIGNES`, `VERBE_SUPPRESSION`).

### 0.4 Trois défauts trouvés en vérifiant dans le navigateur

1. **`deprogrammer` recevait un objet, `zone.quand` passe une CHAÎNE.** Ramener
   une barre dans la colonne levait une `TypeError` sans un mot à l'écran : le
   geste ne faisait simplement rien. Trouvé en le mesurant, pas en le lisant.
2. **Le titre de l'onglet et la couleur de la page repassaient au neutre après
   coup.** `app.js` les écrit dans `afficherEspace`, et il l'appelle **une
   seconde fois au démarrage** — Supabase rend un événement de session juste
   après qu'on s'y abonne. Les deux se REPOSENT donc à chaque passage du routeur,
   `naviguer` compris, même quand le projet n'a pas changé.
3. **Le nom `.projet-tete` était DÉJÀ PRIS** par la tuile de projet du tableau de
   bord : la tête de la page héritait d'un `display: flex` et se rangeait sur une
   seule ligne, titre compris. `.fiche-tete`, essayé ensuite, était pris lui aussi
   — par `css/fch.css`, **qui est chargée sur les trois pages d'entrée**. Elles
   s'appellent `.projet-page-*`. *Sixième fois que ce piège se paie ; la
   convention dit maintenant explicitement de greper les TROIS feuilles.*
4. **Une spécificité qu'on n'égale pas est une règle qu'on n'écrit pas**, et
   c'est la SEPTIÈME fois. Les deux colonnes portent les listes de `#objectifs`
   telles quelles, mais elles vivent dans une `.bloc` — et au-delà de 60 rem,
   `.bloc ul:not(.liste-jalons)` (0-2-1) passe toutes les listes du hub en
   GRILLE. Écrite `.projet-page-colonne .cap-taches` (0-2-0), ma règle perdait :
   la liste restait une grille, où chaque ligne garde `min-width: auto` et refuse
   de descendre sous la largeur de son contenu. *Mesuré à 1500 px : des lignes de
   315 px dans une colonne de 270, le menu à trois points 45 px hors de l'écran.*
   Il a fallu écrire `ul.cap-taches`.

### 0.5 Ce qui a été vérifié dans le navigateur, sur les vraies données

- la galerie ouvre la page, l'onglet prend le nom du projet, la page prend la
  couleur de son espace (mesuré : `fch` → `#7ba5dc`, `formation` → teal) ;
- **glisser une étape depuis la colonne de gauche** et **une tâche depuis celle
  de droite** écrit leur échéance (vérifié en base) ; **les ramener dans une
  colonne** l'efface, et les deux colonnes déprogramment ;
- **toucher le titre puis toucher un jour** — le chemin du doigt, et le seul que
  le clavier puisse suivre — pose la même chose ;
- **les trois filtres** : 11 à poser, 1 programmée, 2 faites, et **rien de fait
  ne se glisse** (aucune ligne prenable sous « Faites ») ;
- **le cap servi se lit à côté du titre**, en petit et en gris (12,2 px contre
  22,5), sous le titre en dessous de 720 px ; la ligne « CE QU'IL SERT » qui
  disait la même chose plus bas est partie avec ;
- **la date d'une étape a la forme de celle d'une tâche** — 11,25 px en encre
  discrète contre 13,125 px en encre pleine pour son titre. *Elle est arrivée
  nue dans la frise et héritait du corps de la page : `.cap-tache-date` n'a aucun
  style à lui, tout vient de `.cap-tache-service` qui l'entoure ailleurs.* ;
- **la mise en page à trois colonnes** : 82 px par jour à 1200 px, une seule
  colonne en dessous, **aucun débordement de 375 à 1500 px** ;
- ouvrir une étape depuis le calendrier, changer sa date, la franchir (une
  victoire `source = 'etape'` est écrite), revenir dessus (elle est retirée),
  la supprimer ;
- poser une étape avec sa date, poser une tâche par le « + » (elle arrive
  **déjà rattachée au projet**), la supprimer par son menu ;
- réordonner les étapes, le menu restant ouvert ;
- le formulaire du projet, dont la pastille « Objectifs servis » n'offre que les
  caps de son espace ;
- **la page d'une habitude** : ses **cinq chiffres** en Clash Display 700 — dont
  **les deux séries en couleur** et « 67 % complétée » —, sa ligne de rythme
  (« Première fois le 31 août 2026 · Dernière fois hier · 2 par semaine en
  moyenne »), ses six paliers en pastilles, son calendrier en vue mois (forme du
  site, pleine largeur) et en 3 mois (compacte) ; **cocher le 2 septembre à la
  souris** fait passer « 2/7 » à « 3/7 » et « 2/10 » à « 3/10 », décocher les
  ramène. **Ni titre de section, ni jauge d'élan.** Sa sparkline compte
  **14 barres pour une quotidienne** (la plus récente à gauche : « mer. 2 sept. »
  en premier, « jeu. 20 août » en dernier) et **12 pour une hebdomadaire**, la
  légende suivant la maille ;
- **la vue Année** : 52 semaines et 8 cases muettes, numéros ISO, un jalon lâché
  sur la semaine 46 s'est posé **au 9 novembre, son lundi** ; presser une semaine
  ouvre sa vue Semaine (« 14 – 20 septembre 2026 »), presser « oct. 26 » ouvre sa
  vue Mois — les deux à la vraie souris ;
- **la page d'un cap** : sa tuile l'ouvre, l'onglet prend son nom, la page prend
  la couleur de son espace ; glisser un jalon sur un jour écrit son échéance et
  le ramener l'efface — **y compris depuis la vue 3 mois, à deux mois de
  distance** ; **le rail des projets glisse** (six tuiles, 1 594 px de contenu
  dans 1 170) et chaque tuile mène bien à `#projet/<id>` ; une
  tâche posée « sans projet » naît accrochée au cap et se supprime par son menu ;
  l'argent de « Rembourser mon matériel » s'affiche entier (1 255 € sur 5 195 €,
  ses 18 lignes) ;
- **`#objectifs` et ses trois vues, `#semaine`, `#dashboard`, `#taches`,
  `#calendrier`, `#perso`, `#chemin`, `#temps` intacts** ; le menu d'un cap dans
  la galerie garde ses trois entrées et son formulaire ses huit champs ;
- **mobile 375 px : aucun débordement horizontal.**

**Toutes les données d'essai ont été remises comme elles étaient.**

### 0.6 Ce qui reste ouvert

- **La page n'est pas dans le menu**, et c'est voulu : on y entre par la galerie
  ou par un projet déplié dans son cap. Si Noé veut un accès direct à un projet
  précis, c'est une décision à prendre, pas un oubli.
- **Le calendrier de la page n'a pas de vue « jour »** ni de bloc : elle
  n'existe pas ailleurs non plus, et rien ne l'a demandée.
- **Rien n'empêche encore de dater une étape déjà franchie.** Ce n'est pas faux
  — on peut noter après coup quand on l'a faite — mais ce n'est pas non plus
  décidé.

## 0 ante. La session du 1er septembre 2026 (après-midi et soir) — LES BLOCS TIENNENT, ET « MES JOURNÉES » DEVIENT UN JOURNAL

**Vingt-deux commits poussés, tout est sur `main`, et l'arbre de travail est
propre** — c'est la première chose à savoir : contrairement à la session
précédente, il n'y a rien en attente.

**UNE MIGRATION, ET UNE COLONNE** — les deux appliquées à la base réelle :

| | |
|---|---|
| `20260901120000_blocs_de_la_semaine.sql` | table `semaines_blocs` (+ `grant`) |
| `20260901180000_gratitude_du_jour.sql` | colonne `journees.gratitude` |

### 0.1 L'algorithme des blocs, corrigé trois fois

**Le reproche de Noé** : *« ce n'est pas normal qu'on n'atteigne pas le quota
pour la formation, quelle règle fait que ce n'est pas atteint ? Il faut que les
jours soient équilibrés, là il y a beaucoup de déséquilibre. »*

Trois règles étaient en cause, et **chacune a été corrigée là où elle vit** :

1. **Le repli sur la journée entière était collé à toute pose.** Le club, servi
   le premier, débordait donc sur le MATIN — la seule plage que la formation
   puisse prendre, puisqu'elle s'arrête à 20 h. *Mesuré : le club posait
   10 h–11 h le mardi, la formation tombait à 1 h 30 ce jour-là, et c'était
   exactement l'heure qui manquait au total.* **On sert chacun chez soi d'abord,
   on ne déborde qu'ensuite**, en deux tours qui parcourent chacun la semaine
   entière.
2. **La part d'un jour ignorait ce qu'il portait déjà** : le mardi recevait ses
   4 h de club EN PLUS des 4 h de son entraînement. *Mesuré : 9 h le lundi,
   9 h 30 le mardi, 2 h 30 le samedi, rien le dimanche.*
3. **La part était plafonnée à 4 h**, ce qui confondait « un BLOC fait 4 h au
   plus » et « un espace reçoit 4 h par jour ». 26 h sur six jours font 4 h 20.

**Le reliquat va au jour le moins chargé**, le classement refait à chaque pas ;
**et ce qui reste sous l'heure RALLONGE un bloc existant** au lieu d'être perdu
(demande de Noé : *« tu peux mettre 3 h au lendemain, quelle règle t'en
empêche ? »* — aucune, sinon une que le hub s'était posée à lui-même).

*Mesuré après correction : club 26 h sur 26 visées, formation 15 h sur 15, six
jours entre 6 h 30 et 7 h 30.*

**LA PAUSE DU MIDI EST DEVENUE PUBLIQUE** (`pauseDuMidi`, js/orientation.js).
Elle n'existait que dans l'algorithme ; la grille, qui glisse dans les vides
d'une journée ce qui n'a pas d'heure, y voyait un trou comme un autre et y
posait une tâche perso. **Une heure gardée libre qu'un autre écran remplit n'est
plus une heure gardée libre.**

**L'HEURE POSÉE PASSE AVANT TOUT** (règle de Noé). Une tâche qu'aucun bloc ne
porte se dessine **à son heure** ; dans un bloc, elle reste une liste. Yuno et le
perso n'ayant aucun bloc, **aucune de leurs tâches n'était jamais à l'heure
prévue** — la tâche Yuno de 13 h se dessinait à 16 h 42.

### 0.2 « Ma semaine » garde ce qu'on y arrange

**Renversement de la règle du 31 août** (« un bloc ne s'enregistre pas, les blocs
ne doivent être que de l'affichage »). Le motif tenait — rien à maintenir, rien
qui périme — mais son PRIX est apparu à l'usage : une semaine réorganisée à la
main se retrouvait reproposée telle quelle au rechargement.

- **Une table à part, `semaines_blocs`**, et surtout PAS une colonne de
  `semaines` : là-bas, **l'existence d'une ligne signifie que la semaine est
  validée** (`etat.validee` et le bandeau du dimanche s'y fient tous les deux).
- **Elle ne garde que ce que Noé a touché.** Sans ligne, le hub propose.
- **« Reproposer les blocs » EFFACE la ligne** au lieu d'en écrire une neuve :
  sans ligne, le hub reproposera — donc *mieux* si les données ont bougé.
- **Un seul chemin pour les quatre gestes**, et **sans retour en arrière si
  l'écriture échoue** : défaire le geste de Noé parce que le réseau a hoqueté
  serait pire que de le lui dire.

*Cycle vérifié de bout en bout : bloc retiré → 14 en base → rechargement, il ne
revient pas → « Reproposer » → 15 blocs et la ligne effacée.*

### 0.3 Le bilan de la semaine passée

- **Les victoires en sortent** : terminer une tâche en écrit une, si bien que
  « 18 victoires » et « 17 tâches terminées » recopiaient presque la même chose.
- **Les heures mesurées disent OÙ elles sont parties**, une pastille et un
  chiffre par espace, sur un seul rang. *Le NOM de l'espace imposait une ligne
  par espace, donc une tuile plus haute, donc ses voisines étirées : dans une
  grille, tout un rang prend la hauteur du plus grand. Mesuré : 106 px ramenés à
  87, zéro écart avec ou sans le détail.*
- **Une tuile de plus : les projets traités** — ceux pour qui une tâche a été
  faite **ou un événement a eu lieu**. « 17 tâches terminées » dit combien, pas
  sur quoi.
- **C'est une galerie de tuiles**, et les chiffres sont en **Clash Display 700**,
  la police du titre. Les heures du détail, elles, sont passées en **Google
  Sans** : la chasse fixe étalait « 1 h 55 » sur 47 px, ramenés à 27.

### 0.4 Les propositions du dimanche — une phrase, et le détail au clic

**Demande de Noé** : *« on ne comprend pas vraiment ce que ça veut dire ; plutôt
une petite phrase, et quand on clique dessus on voit un détail avec l'action
proposée. »*

**Ce que ça renverse, et il faut le dire** : la forme du 31 août se comprenait
d'un REGARD — un chiffre en gros, trois mots dessous. Mais un regard ne dit pas
ce qu'il faut en faire, et le constat qui l'expliquait dormait dans un `title`
que personne n'ouvre. **On avait déplacé le sens jusqu'à le perdre.**

- **Deux textes** : `court` sur la carte, `constat` dans le détail. Les
  inférences d'`orientation.js` écrivent les deux.
- **Accepter coûte un geste de plus**, et c'est le prix assumé : la règle
  « aucun constat sans proposition » ne bouge pas, elle change d'endroit.
- **Triées par espace**, tri stable.
- **LA GRILLE DES CONSTATS N'AVAIT JAMAIS EXISTÉ** : `.rdv-cartes` posait
  `display: grid` sans effet depuis le 31 août — `.bloc ul` met toutes les
  listes du hub en flex-colonne et pèse une balise de plus. *468 px de haut là
  où trois colonnes en font 165.* `auto-fit` remplace `auto-fill`, qui
  FABRIQUAIT neuf colonnes vides pour sept cartes à 1920 px.
- **Toutes les tuiles ont la même taille** : `grid-auto-rows: 1fr` **et**
  `align-items: stretch`, qui se redit — une règle plus générale pose `start`.

### 0.5 « Mes journées » devient un journal

C'est le gros morceau de la session. La page s'appelle désormais **« Mes
journées »** partout (h1, menu, porte).

- **UN CALENDRIER, MOIS ET SEMAINE.** Ce n'est **pas** `construireGrille` : la
  grille du calendrier dessine des barres — ce qui est posé, ce qui arrive. Ici
  on ne pose rien, on CHOISIT un jour ; la case porte des **signes** — la
  frimousse de l'humeur, un point par espace qui a bougé, un point creux si un
  mot a été écrit. Aucun compte, aucun score. Un jour à venir ne s'ouvre pas.
- **Une requête par table, jamais par jour** (`resumeDesJournees`) : `journeeDe`
  en coûte sept, un mois en aurait coûté deux cents.
- **Le détail s'ouvre en TUILE VOLANTE**, pas sous la grille : un calendrier sert
  à choisir, et ce qu'on a choisi n'a pas à occuper la page en permanence.
- **L'écriture est l'élément principal** : le champ passe de 2 lignes à 16 rem,
  **sans rectangle** — un champ encadré dit « remplis ce formulaire ».
- **UNE GRATITUDE**, colonne `journees.gratitude`. Colonne à part et non ligne de
  plus dans `mot` : `mot` est libre, la gratitude est une **question posée**, et
  on voudra les relire séparément.
- **UNE NOTE DU JOUR**, sur la ligne du jour. `enregistrerHumeur` prenait déjà
  une date ; seul l'écran ne savait parler que d'aujourd'hui.
- **LES HABITUDES SE COCHENT, pour ce jour-là.** Le bloc ne montrait que les
  cochées, en pastilles muettes : il ne disait rien de ce qui restait.
- **Le relevé se replie derrière une icône** ; les habitudes en sont sorties,
  parce que **le repli contient ce que le hub RELÈVE, et les habitudes sont la
  seule chose qu'on vient COCHER**.

### 0.6 Une porte du soir sur l'accueil

Tous les jours **à partir de 20 h**, « Faire le bilan du jour » → la journée du
jour. Même heure que le rendez-vous du dimanche — c'est l'heure où la journée est
finie. **Pas de borne haute** : elle s'arrête à minuit, la journée change.
**Elle mène au jour NOMMÉ** : ouvrir à 23 h 50 et écrire à 00 h 05 écrit toujours
dans la journée qu'on ferme. **Elle s'efface dès que le journal ou la gratitude
est écrit** — pas sur la note du jour, qui se répond d'un doigt depuis trois
écrans.

### 0.7 Ce qui a été vérifié, et comment

- **Les blocs, hors écran** (`node`, sur un instantané des données réelles) :
  quotas atteints, jours équilibrés, cas limites — semaine vide, régime intense
  des deux côtés, échéance qui pousse le plafond.
- **Dans le navigateur, à quatre largeurs** (1920, 1440, 1000, 800, 375) : les
  colonnes des constats, la grille des blocs, la tuile d'une journée.
- **En base** : l'arrangement des blocs écrit puis effacé ; **cocher une habitude
  depuis le 11 août écrit au 11 août** (vérifié sur une habitude sans historique,
  pour ne pas risquer une victoire de palier), puis décoché — **les données de
  Noé sont revenues à leur état d'origine**.
- **Ce qui n'a PAS été vérifié** : rien n'a été écrit dans le journal ni dans la
  gratitude de Noé — le chemin d'écriture n'a pas changé, seul le champ a grandi.

### 0.8 Trois défauts d'outillage, trouvés en chemin

1. **`tools/verifier-gabarits.js` ÉTAIT AVEUGLE, et il a été corrigé.** Il
   suivait un simple drapeau « dans un gabarit », qui basculait à l'envers au
   premier gabarit IMBRIQUÉ dans une interpolation — `${x ? \`…\` : ''}`. À
   partir de là il lisait le HTML comme du CODE, la première apostrophe française
   y ouvrait une fausse chaîne, et **tous les commentaires du fichier échappaient
   au contrôle**. Il a dit « sains » pendant que la page ne se chargeait plus. Il
   tient maintenant une PILE. *Un outil qui rassure à tort est pire que pas
   d'outil.* **Et un accent grave PAR PAIRES est tout aussi dangereux** : un
   commentaire HTML n'existe pas pour JavaScript.
2. **Un nom de FONCTION déjà pris** (`construireHabitudesDuJour`, deux fois dans
   js/perso.js) : le module s'est chargé sur « Identifier has already been
   declared » et a emporté tout l'écran. `node --check` passe. La règle du dépôt
   sur les classes CSS vaut pour les fonctions.
3. **`getBoundingClientRect` MENT sur un `<details>` fermé** : Chrome masque le
   contenu par `content-visibility`, ce qui laisse une géométrie périmée. J'ai
   cru à un bug du repli pendant dix minutes. Le signal juste est
   `getComputedStyle(details, '::details-content').contentVisibility` — ou une
   capture d'écran.

### 0.9 LES ALLERS-RETOURS — à lire avant de « corriger » quoi que ce soit

Cette session en compte beaucoup, et **plusieurs portent sur des règles que
j'avais défendues avant que Noé ne les renverse**. Ne pas les rétablir sans
rouvrir la question.

| Ce que j'avais posé | Ce que Noé a tranché, et pourquoi |
|---|---|
| La note du jour **ferme** la tuile (« en fin de journée » = en bas) | **En haut**, sur la ligne du jour. *Ce qui change, c'est la QUESTION, pas le rang : on ne fait pas défiler une page pour répondre d'un doigt.* |
| Le tri des habitudes **figé** au rendu (« une pastille qui saute fait perdre sa place ») | **Dynamique** : décocher renvoie à la fin. *Un tri figé laisse une pastille « faite » en tête alors qu'elle ne l'est plus — pire que de perdre sa place.* |
| Les habitudes en **colonne** dans le relevé | **Une ligne au-dessus des colonnes**, puis **hors du repli**. *Les habitudes sont une CHECK-LIST qu'on parcourt ; le reste, des relevés qu'on lit.* |
| Le relevé en flux `columns` à deux colonnes | Flux **conservé** pour les relevés, mais **jamais pour garantir la place d'un bloc** : c'est la hauteur du contenu qui décide de ce qui bascule à droite. |
| `--accent-doux` pour une habitude faite | **Vert `--famille-corps` à 30 %, sans contour.** *Le vert du hub, celui de la coche d'une tâche ; il dit « tenu », pas « bien ».* |
| Les libellés au-dessus des champs | **Aucun titre** : la note, la gratitude, le journal, les habitudes. *Ce qui se montre n'a pas à se nommer* — mais `aria-label` prend le relais, sans quoi les champs n'ont plus de nom accessible. |
| « Un bloc ne s'enregistre pas » (31 août) | **L'arrangement se garde.** *Le motif tenait ; c'est son prix que l'usage a révélé.* |
| Le chiffre d'un constat en Geist Mono | **Google Sans**, comme les barres du calendrier — la chasse fixe est pour ce qui se COMPARE. |

**Et une correction que je dois à Noé** : j'ai annoncé « vérifié, noter le
31 août n'a créé aucune ligne au 1er septembre » alors que **le clic était avalé**
par une garde de `#perso` (`.ajout-volant` → `return`) et que la valeur était
déjà la bonne. La vérification ne valait rien. **Une mesure qui ne peut pas
échouer ne prouve rien.**

## 0 ante bis. La session du 31 août – 1er septembre (matin) — LE CALENDRIER, ET LES BLOCS DE LA SEMAINE

**Deux commits poussés, et un chantier NON COMMITÉ** — c'est la première chose à
savoir en reprenant. Aucune migration : rien de cette session ne touche au
schéma.

| | |
|---|---|
| `922a009` | le calendrier se lit d'un regard, « Ma semaine » a la place de poser |
| `b13da70` | le hub propose une forme de semaine, les constats tiennent en deux lignes |
| *(non commité)* | **l'échelle horaire, les deux cases à cocher, le placement dans les blocs, l'algorithme refondu** — `js/orientation.js`, `js/semaine.js`, `js/calendrier-commun.js`, `css/styles.css`, `CLAUDE.md` |

**`sw.js` est passé en `v11`** (commit `922a009`) : Google Sans y est ajoutée.
Le téléphone servira une fois la version précédente au premier lancement —
**ouvrir deux fois** si l'écran semble d'hier.

### 0.1 LA GRILLE DE « MA SEMAINE » EST PLUS GRANDE — et ce que ça a appris

Ligne à **23 rem**, titre de barre à **11,25 px**, hauteur minimale à **29 px**,
titres sur **trois lignes**. Porté par `.semaine-grille` seule, au-delà de
720 px : le calendrier plein écran et l'aperçu de l'accueil ne bougent pas, et
sept colonnes à 375 px ne gagneraient rien à écrire plus gros.

**Un premier essai est allé trop loin et a été ramené d'un cran** (28 rem,
12,2 px). Ce qu'il a appris, et qui resservira : **les corps ne peuvent pas
rendre 15 à 20 %** — 12,2 px moins 17 %, c'est la taille d'avant. Entre « trop
gros » et « comme avant », il n'y a qu'un cran.

Le **retrait du titre derrière le rond est passé en `em`** (`1.745em`) : à la
taille commune il rend les 18 px d'avant au centième près, mais le rond grandit
avec le texte et un retrait figé lui laissait 3,2 px d'air au lieu de 4,6.

La colonne « À poser » rend **une tuile de plus** (30 rem contre 26) : le plafond
n'a jamais été un chiffre pour lui-même, il dit « ne dépasse pas la semaine ».
Mesuré : la colonne finit à 450 px, la grille à 452.

### 0.2 LE CALENDRIER CHANGE DE GRAMMAIRE — la couleur dit l'espace, la forme dit la nature

**Sur les trois calendriers à la fois** (hub, Yuno, FC Hermitage), par une seule
règle : les sites n'en surchargeaient aucune.

| | sa forme | son titre |
|---|---|---|
| **événement** | tuile **pleine**, encre sombre, sans trait, **hauteur = sa durée** | **gras** (600) |
| **publication** | ligne, trait à gauche, **voile à 10 %** | normal |
| **tâche** | ligne, trait à gauche, **rien** | normal |

**Ce que ça renverse** : depuis le 13 août, une tâche n'était qu'un trait de
couleur — « une chose à faire, pas une chose qui arrive » —, l'aplat étant
réservé à ce qui ARRIVE. La distinction était juste ; c'est le MOYEN qui change.
Trois natures et quatre espaces se lisaient sur un seul canal ; ils en ont deux.

**Une tâche est une LIGNE, pas une tuile** :

    | ○ 13:00 Mind-Map résumé 1

- **elle est en FLUX, surtout pas en flex** : un conteneur flex donne à chaque
  enfant son propre alignement transversal, et trois réglages faisaient trois
  hauteurs. Noé l'a renvoyé d'une phrase — « rien n'est aligné ».
- **l'heure est écrite DANS le titre**, avec une **vraie espace** : deux `<span>`
  collés sont un seul mot pour le navigateur, qui ne peut pas couper entre eux.
- **rayon à 6 px**. Il est monté à 10 (`--rayon-controle`) pendant une heure,
  puis Noé a demandé de revenir : à 22 px de haut, l'angle mange la première
  lettre. **Ne pas y retourner sans regarder une semaine chargée.**

**L'ordre d'une journée : l'heure, puis l'ESPACE.** Le second tri départage tout
ce qui tombe à la même heure — et surtout ce qui n'en a pas : une journée sans
horaire s'affichait dans l'ordre où les tables avaient été lues. L'ordre est
celui des journées de Noé (club, formation, Yuno, soi) et vit désormais dans
`js/format.js` (`ORDRE_ESPACES`, `rangDEspace`) : « Le chemin » et « Le temps »
le récitaient chacun de leur côté.

### 0.3 GOOGLE SANS ENTRE DANS LE HUB

Noé l'a reconnue sur Google Agenda et l'a apportée. **Elle est sous SIL Open
Font License** — je l'avais annoncée propriétaire, c'était faux, et la licence
est gardée à côté d'elle (`fonts/GoogleSans-OFL.txt`).

- **`tools/installer-google-sans.py`** la rapatrie et l'allège, comme les autres
  outils du dépôt : deux axes figés sur trois (seule la graisse sert),
  sous-réglage latin — **4,8 Mo de TTF donnent 57 Ko**.
- **Elle porte le titre ET l'heure des barres**, et le compteur d'heures de
  « Ma semaine ». Gilroy quitte les barres ; il ne lui reste que les onglets.
- **L'italique n'a pas été gardée** : elle ne servait qu'aux publications, qui
  ne penchent plus. `--italique` la refait en une commande.

### 0.4 « CE QUE JE VOIS » — des cartes, plus des paragraphes

Sept constats en **131 px sur quatre colonnes**, entre le bilan et la grille.

    ▌ 16 h 30 / 26 h          →
      Le club, 3 séances

Bord gauche à la couleur de l'espace, **chiffre** en évidence, **mot** en trois
mots. La phrase entière passe dans le `title` et le nom accessible — la parade
des habitudes. **Toute la carte porte le geste** : un libellé de bouton coûtait
une troisième ligne. Chaque constat et chaque inférence portent désormais un
`espace`, un `chiffre` et un `mot` (js/orientation.js, js/rendez-vous.js).

**Ils sont passés ENTRE le bilan et la grille** : ils servent à décider de ce
qu'on va poser, ils doivent être sous les yeux au moment où l'on pose.

### 0.5 LES BLOCS DE « MA SEMAINE » — le gros morceau

**La demande** : *« je fonctionne beaucoup en bloc par jour — 3 h le matin sur la
formation, 4 h l'après-midi pour le FCH. J'aimerais que le site me propose une
organisation comme ça. »*

**UN BLOC NE S'ENREGISTRE PAS** (décision de Noé) : pas de table, pas de
migration. Ils se recalculent à chaque ouverture, et **ce qui reste d'une
programmation, ce sont les TÂCHES qu'on a posées dedans**. Le bloc est
l'échafaudage, pas le mur.

**L'ALGORITHME, dans sa forme finale** (`blocsDeLaSemaine`, js/orientation.js —
éprouvable hors écran comme le reste) :

1. **Le club et la formation SEULS** reçoivent des blocs. Ce sont les deux
   espaces à quota — un contrat, des heures dues. Yuno et le perso vivent en
   dehors : leur temps ne se planifie pas, il se prend. Mais **leurs événements
   occupent la journée** : aucun bloc ne vient se poser dessus.
2. **Ce qui est déjà posé commande** : un événement du club fait naître un bloc
   qui l'ENGLOBE — « il ne déduit pas ce que j'ai déjà posé, il dit bien que
   c'est un bloc de 4 h ». Le quota s'y verse en entier.
3. **Six jours sur sept**, un jour de repos sans club ni formation. La part d'un
   jour se calcule sur le budget de DÉPART divisé par six, pas sur ce qui reste :
   sinon les premiers jours se servent et les derniers restent vides.
4. **Une heure de pause entre 12 h et 14 h**, réservée en FIN de tranche
   (13 h–14 h) : placée à 12 h, elle coupait le matin à 2 h et la formation
   plafonnait à 12 h en cinq jours.
5. **Plusieurs blocs par jour et par espace**, **jamais moins d'une heure**,
   **pas de formation après 20 h**, quatre heures au plus.
6. **Regroupement** : deux blocs du même espace séparés par un seul bloc de
   l'autre s'échangent, pour ne pas entrelacer.
7. **Les échéances passent devant le quota** : quand le prochain livrable de la
   formation demande plus, c'est lui qui commande — un quota est une moyenne,
   une échéance est une date.

*Mesuré au dernier état : 6 jours utilisés, 26 h / 26 h de club, 13 h 30 / 15 h
de formation, zéro entrelacement, zéro bloc sous 1 h, zéro chevauchement.*

**L'AFFICHAGE : deux cases à cocher, pas trois vues.** « Les blocs » et « Ce qui
est posé » s'activent indépendamment. Quand les deux sont cochées :

- **les blocs perdent tout leur texte** (heure, espace, durée) et redeviennent
  des cadres ;
- **les tâches entrent DANS le cadre**, en vraies barres — pas en texte : une
  liste écrite n'a ni rond à cocher, ni menu, ni ouverture. Elles ne peuvent pas
  être *enfants* du bloc (un bouton ne s'imbrique pas dans un bouton) : c'est
  leur position qui les met dedans, **6 px de marge, centrées en largeur** ;
- **une ligne par élément**, et ce qui ne tient pas est **caché et compté**
  (« +2 ») ;
- **ni rond ni heure** : cette grille sert à programmer, pas à faire.

**L'HEURE D'UNE TÂCHE EST UNE ÉCHÉANCE, PAS UN CRÉNEAU** — la clé de tout :

> *« L'horaire que je mets à mes tâches, c'est l'heure à laquelle je souhaite les
> avoir finies… elles appartiennent à ce bloc, c'est une LISTE dans le bloc, je
> peux les faire dans l'ordre que je veux. Il y a juste les événements et les
> publications qui respectent un horaire strict. »*

Une tâche « avant 13 h » appartient donc au bloc qui se termine **à 13 h ou
avant**, et non à celui qui contiendrait 13 h.

**Les tâches Yuno et perso**, qui n'ont plus de bloc à elles : avec un horaire et
un bloc qui le contient, elles y entrent quel que soit son espace ; avec un
horaire sans bloc, elles se placent à leur horaire ; **sans horaire, dans les
VIDES de la journée** — ce qu'aucun bloc n'occupe.

**LA COLONNE EST LA JOURNÉE, DE 10 H À 22 H**, graduée, deux rem par heure. Le
vide a la taille du temps qu'il dure. La hauteur d'un bloc est **exactement** sa
durée, posée en style inline : le plancher de 24 px — une taille de cible — le
faisait mordre sur le suivant, et la cascade ne suffisait pas à le défaire.
*Ce que ça coûte : sur cette grille, un bloc court n'est plus une cible de
24 px. Acceptable parce qu'on programme à la souris ; à rouvrir si le doigt s'en
mêle.*

**LES GESTES** : on glisse un bloc, **on choisit l'heure où il tombe** (arrondie
à l'heure ronde, avec un repère qui l'écrit), et **ce qu'il rencontre est poussé
derrière lui** — la durée ne bouge jamais, deux blocs ne se superposent jamais.
On règle un bloc par une fenêtre aux **pastilles du hub**
(`construireFormulaire` + `brancherChoix`), on en **ajoute** un soi-même (les
quatre espaces y sont offerts), et « Reproposer les blocs » ramène tout.

**UN COMPTEUR** dit les heures placées, sur une seule ligne, avec un rond de
couleur et sans le nom de l'espace — et **sans le perso** : l'espace perso ne
mesure rien, en compter les heures en ferait un quatrième chantier.

### 0.6 CE QUI A ÉTÉ VÉRIFIÉ, ET COMMENT

**Tout ce qui suit a été mesuré dans le navigateur, sur les données réelles de
Noé**, jamais déduit du code :

- l'agrandissement et sa réduction (hauteurs de ligne, corps, largeurs) ;
- les contrastes des barres du calendrier — 8,4 à 9 pour le texte ordinaire,
  6,94 pour l'encre sombre sur le bleu du club, 4,43 pour une tâche faite ;
- le tri par espace, journée par journée ;
- l'algorithme des blocs, **d'abord hors écran** sur des faits factices
  (`node --input-type=module`), puis sur les vraies données : jours couverts,
  totaux par espace contre les quotas, doublons, entrelacements ;
- le placement : chevauchements, débordements de cadre, marges aux quatre côtés,
  tâches rangées dans un bloc d'un autre espace ;
- les gestes : glisser un bloc d'un jour à l'autre et **dans** sa journée, régler
  par la fenêtre, ajouter, déposer une tâche dans un bloc — ce dernier testé sur
  une vraie tâche (« Photos U7 »), **remise ensuite dans son état d'origine**.

**Ce qui n'a PAS été vérifié** : rien au doigt, et le rendez-vous du dimanche
n'a toujours jamais été validé pour de bon.

### 0.7 LES PIÈGES PAYÉS — six défauts MUETS

Cette session a été une leçon sur les défauts qui ne disent rien :

1. **`const MARGE` déclarée après son premier usage** — zone morte : la fonction
   levait une ReferenceError au premier bloc, six barres gardaient l'ancien
   placement, **rien à l'écran**.
2. **`max-height` ignoré** : en CSS, un `min-height` l'emporte sur lui. L'
   événement dépassait de 6 px — exactement la marge qu'on venait de poser.
3. **`position: relative` oubliée** : `left`/`right` ne font alors que DÉCALER
   la barre sans la rétrécir. 12 px de marge à gauche, 12 px de débordement à
   droite.
4. **`brancherDeplacement` refusait le dépôt sur le jour d'origine** — la garde
   est juste partout ailleurs (décaler une tâche de zéro jour écrirait ce
   qu'elle porte déjà), mais l'essentiel du geste des blocs se passe DANS une
   colonne.
5. **`champsApresDeplacement` mourait sur un bloc**, qui n'a ni colonne ni
   table : le glissement « ne marchait pas » alors qu'il était branché.
6. **Le rattrapage ignorait les tâches FAITES** : le lundi de Noé n'avait aucun
   bloc perso ni Yuno, et pour cause — toutes ses tâches de ce jour-là étaient
   cochées. Trouvé **en instrumentant**, pas en relisant.

**Et la spécificité CSS, cinq fois** : `.bloc li[data-espace]` (une classe, un
type, un attribut), `.bloc ul` et son `flex-direction: column` qu'il faut
redire, `.cal-semaine .cal-barre-element:not(…) .cal-barre-titre` à quatre
classes. **Le compte des sélecteurs se fait, il ne se devine pas.**

### 0.8 LES DÉCISIONS QUI ONT FAIT UN ALLER-RETOUR — NE PAS LES « CORRIGER »

| Ce qui a été essayé | Ce qui a été retenu, et pourquoi |
|---|---|
| rayon des barres à 10 px | **6 px** — à 22 px de haut, l'angle mange la première lettre |
| publications en **italique** | **plus d'italique** — le remplissage distingue déjà les trois natures ; la police italique a été retirée de `fonts/` |
| tâches en **aplat teinté** | **rien** — « une chose à faire, pas une chose qui arrive » (le motif du 13 août tient) |
| tâches avec une **pastille ronde** en tête | **le trait à gauche** — il tient la colonne sans rien coûter à la ligne |
| **trois vues** (blocs / posé / les deux) | **deux cases à cocher** — la troisième combinaison n'a pas à être nommée |
| **texte écrit** dans les blocs | **les vraies barres**, qui gardent leurs gestes |
| barres posées **à leur heure** par-dessus les blocs | **rangées dans le cadre** — deux systèmes de placement ne tiennent pas dans 130 px |
| **un seul bloc** par espace et par jour | **plusieurs** — un seul de 4 h plafonnait la semaine à 24 h, sous les 26 h visées |
| blocs **perso partout**, puis un dimanche entier | **aucun bloc perso ni Yuno** — ils n'ont pas de quota |
| marge des événements à **12 px** | **6 px**, comme les tâches — les 12 masquaient le vrai défaut (la position relative) |
| compteur en **Geist Mono** | **Google Sans** — exception de VOISINAGE : il touche la grille, et deux polices qui se touchent se voient |

**Deux règles se contredisent encore**, et c'est Noé qui tranchera : « un seul
bloc par jour » (retiré) et « les quotas doivent être tenus » ne peuvent pas être
vraies ensemble. Aujourd'hui le club atteint 26 h / 26 h, la formation reste à
13 h 30 / 15 h — il lui manque 1 h 30 que les créneaux libres de cette semaine ne
peuvent pas absorber.

## 0 ante ter. La session du 30–31 août 2026 (soir et nuit) — MA SEMAINE, ET LA FORME DES TUILES D'AJOUT

**Six commits, tous poussés, aucune migration** : rien de ce qui a été fait ici
ne touche au schéma — tout écrit dans des colonnes qui existaient déjà.
`sw.js` passe en **v10** (`js/semaine.js` y est ajouté) : le téléphone servira
une fois la version précédente au premier lancement, puis basculera.

| | |
|---|---|
| `afeb669` | la page « Ma semaine », la largeur, les tuiles sans contour, les choix en pastilles |
| `157d8a7` | la grille de « Ma semaine » sait ajouter, et le « + » revient |
| `3e674b9` | la ligne du vivier tient dans sa colonne |
| `c796c52` | une tâche posée se rouvre, et `corriger` ne vit plus qu'en un endroit |
| `c6e2bb1` | l'horaire se corrige, sur une tâche comme sur une publication |
| `8a9a16b` | ce qu'on pose depuis un calendrier est une tâche par défaut |

**LA SESSION S'EST JOUÉE EN DEUX MOUVEMENTS**, et le second est né du premier :
d'abord **une page** — le rendez-vous du dimanche, qui disait la semaine sans
permettre d'y rien poser, devient l'écran où on la programme ; ensuite **une
forme** — en la construisant, Noé a repris une à une les tuiles d'ajout du hub
entier, et elles se lisent maintenant comme la tuile de capture.

**Le rythme compte pour comprendre le document** : la seconde moitié s'est faite
en une quinzaine de corrections successives, souvent d'une phrase, et **plusieurs
se sont renversées**. Le § 0.7 les liste — à lire avant de « corriger » quoi que
ce soit dans les tuiles d'ajout.

### 0.1 « MA SEMAINE » — le rendez-vous du dimanche devient une page

**La demande de Noé**, le soir : une page pour les propositions du dimanche,
atteinte par un bouton d'accueil qui apparaît aux mêmes horaires, montrant la
**semaine qui arrive** avec les **tâches non programmées sur le côté**, qu'on
**glisse dans le calendrier**, plus un **bilan de la semaine passée en quelques
chiffres**. « Je ferai cette programmation essentiellement sur ordinateur. »

**Ce que ça répare, et c'est le vrai sujet.** Le rendez-vous vivait en bandeau
sur l'accueil : il DISAIT la semaine et ne permettait de rien poser. Le constat
était au bon endroit, le geste nulle part.

**Trois décisions prises avec lui avant d'écrire** : le bouton **remplace** le
bandeau (il ne s'y ajoute pas) ; le vivier porte les tâches **sans date ET
celles restées ouvertes** — sinon elles restent coincées dans la semaine d'avant
et disparaissent de la programmation ; le bilan tient en **victoires, tâches
terminées, heures mesurées, humeur, habitudes**.

**Trois ajouts en cours de route**, demandés pendant l'écriture : la colonne se
limite à **huit tuiles et défile** (dix-sept tâches faisaient une colonne trois
fois plus haute que la grille d'en face) ; chaque tuile porte une **croix
« pas cette semaine »** ; et **la porte de l'accueil se réduit à un bouton**.

**LA COLONNE AUSSI, dans la même passe** : plus de sous-titre, plus de titres de
groupe, une seule liste où **ce qui était posé et n'a pas été fait passe
devant**, avec **la date de son ancien jour à droite de la tuile**. Cette date
remplace les deux titres qu'elle rendait inutiles, et c'est une vraie date — un
relatif (« il y a 4 jours ») compterait les jours perdus.

**LA PORTE A MAIGRI LE SOIR MÊME.** Elle était née bandeau — titre « Ta semaine
qui vient », intervalle de dates, phrase expliquant ce qu'il y avait derrière,
puis le bouton. Noé : *« le bouton doit simplement dire "Programmer ma semaine"
et être dans la forme du bouton actuel »*. Trois lignes au-dessus de la journée
pour un seul geste : le nom du bouton dit ce que la phrase disait, et les dates
s'écrivent en tête de la page qui s'ouvre.

**ET LA PAGE A CHANGÉ DE NOM dans la foulée** : « Programmer la semaine » est
devenu **« Ma semaine »** — `<h1>`, onglet du navigateur et menu, un seul nom
pour une page (la leçon de « Général »). Le verbe reste sur le bouton de
l'accueil, où il est à sa place.

**UN DÉFAUT DE FOND TROUVÉ EN CHEMIN — le rendez-vous validait la MAUVAISE
semaine.** `semaineDe(maintenant)` rend « la semaine où l'on est » : le dimanche
à 20 h, celle qui s'achève. Le bandeau s'appelait « Ta semaine qui vient » et
affichait la charge de celle qui finissait ; pire, `validerLaSemaine` écrivait
le lundi PASSÉ — le rendez-vous revenait donc le lendemain matin comme s'il ne
s'était rien dit. `pivotDeLaSemaine` (js/orientation.js) fait la bascule.

**UN SECOND, plus petit** : « la porte du dimanche passe devant » était écrit
dans `CLAUDE.md` depuis le 29 août et le code ne l'avait jamais tenu — les deux
bandeaux pouvaient s'empiler. La porte est passée au-dessus dans le balisage, et
le bandeau de l'après se tait tant qu'elle est ouverte.

**UN TROISIÈME, trouvé en mesurant** : les écouteurs de la page étaient branchés
APRÈS `await charger()`, donc absents pendant les treize requêtes. La page
s'affichait, les tâches étaient visibles, et les toucher ne faisait rien.
Squelette, écouteurs, données — dans cet ordre.

**Ce qui a été mis en commun plutôt que recopié** : `jourSousLePoint`,
`prendreEnMain`, `suivreLaMain` et `viserLeJour` sortent de
`brancherDeplacement` et sont exportés ; le glissement vers le vivier passe par
une option `zones` de cette même fonction, pas par une seconde mécanique.

*Ce qui a été vérifié de cette page, et ce qui ne l'a pas été : § 0.8, qui
couvre la session entière.*

### 0.2 LA GRILLE DE « MA SEMAINE » SAIT AUSSI AJOUTER, ET CE QUI EST POSÉ SE ROUVRE

Deux demandes, à quelques minutes d'intervalle, et elles renversent toutes deux
une décision de la veille au soir.

**« Depuis la page ma semaine je dois pouvoir ajouter (événement, publication et
tâche) via le calendrier, et tu peux mettre le plus de bas de page aussi. »** La
tuile de capture s'ouvre donc en touchant un jour, et le **« + » flottant** est
là comme sur l'accueil et les tâches. Le « + » ouvre sur le **lundi de la
semaine programmée** et non sur aujourd'hui : ce qu'on pose ici appartient à la
semaine qu'on remplit.

**« Il faut que je puisse modifier aussi en appuyant sur une tâche posée. »** La
grille était une **pure surface de placement** — c'était écrit noir sur blanc
dans `CLAUDE.md` la veille : « on n'y modifie pas ce qui est déjà posé, le
calendrier est à un clic ». La règle était défendable et elle est tombée pour
une raison simple : **une page où l'on programme sa semaine doit pouvoir
corriger ce qu'on vient d'y poser.** Toucher une barre ouvre désormais la même
fenêtre de détail qu'à l'accueil et au calendrier.

**UN JOUR TOUCHÉ FAIT DEUX CHOSES, JAMAIS LES DEUX À LA FOIS** : il POSE la
tâche qu'on a en main s'il y en a une, sinon il OUVRE la tuile. Les deux passent
par le geste du calendrier (`brancherSelection`), et ce n'est pas qu'une
question de cohérence — la sélection appelle `preventDefault` au poser du doigt,
ce qui **avale le clic** sur lequel un second chemin se serait appuyé. Le
placement au clic, qui existait depuis la veille, a donc été retiré au profit de
ce chemin unique.

### 0.3 CORRIGER ET EFFACER NE VIVENT PLUS QU'EN UN ENDROIT — ET L'HORAIRE SE RATTRAPE

**En branchant la fenêtre de détail, j'ai trouvé `corriger` et `effacer` en
double, MOT POUR MOT**, dans `js/dashboard.js` et `js/calendrier.js` — la table
qui dit dans quelle colonne chaque nature range sa date. « Ma semaine » en
aurait fait une troisième copie. Elles vivent maintenant dans
`calendrier-commun.js` (`corrigerDepuisLeCalendrier`, `effacerDepuisLeCalendrier`),
comme `poserAuCalendrier` avant elles, et pour la même raison : **c'est dans la
copie oubliée qu'un champ finit par manquer.** Bilan : 181 lignes retirées, 91
posées.

**ET C'EST EXACTEMENT CE QU'IL MANQUAIT.** Demande de Noé dans la foulée :
*« dans les modifications, il faut que je puisse modifier ou rajouter
l'horaire »*. Une tâche et une publication **portent une heure en base** et la
posent à la capture ; aucune fenêtre de modification ne la redemandait. Une
heure mise de travers ne se rattrapait donc nulle part.
- **Pas sur un jalon** : il marque une étape, il n'occupe pas d'heure — et sa
  table n'a pas la colonne. L'écriture ne pose le champ que si le formulaire l'a
  offert (`champs.heure !== undefined`) ; lui écrire une colonne qu'il n'a pas
  ferait échouer la ligne.
- **Vidée, elle repasse à `NULL`** : minuit n'existe pas dans le hub.

**ET CE QU'ON POSE DEPUIS UN CALENDRIER EST UNE TÂCHE PAR DÉFAUT** (dernière
demande de la session). C'était un événement, sans raison écrite nulle part,
alors que l'espace Tâches et l'accueil posaient déjà une tâche. **La règle du
filtre passe avant** : quand une seule nature est cochée, c'est elle qu'on vient
poser. Le changement vaut aussi pour le calendrier du site FCH et pour Yuno hors
vue éditoriale — *si Yuno doit rester sur « Événement », c'est une ligne, et
c'est une question ouverte.*

### 0.4 LA PAGE PREND TOUTE LA LARGEUR DE L'ÉCRAN

Demande de Noé, en une phrase : *« sur ordinateur, le site doit utiliser toute
la largeur »*. Le hub portait un plafond de **1240 px** hérité de Bac-3 : sur un
écran de 1728 px, cela laissait **488 px de vide** de part et d'autre.

**Ce que ça ne change pas, et c'est ce qui rend la suppression possible** : la
règle « la mise en page prend toute la largeur, le texte jamais » était déjà
écrite, et c'est le plafond qui la contredisait. Les listes savaient déjà se
ranger en colonnes (`repeat(auto-fill, minmax(21rem, 1fr))`) ; elles en prennent
simplement quatre ou cinq au lieu de trois.

**Ce qui a été ajouté pour que ça tienne** :
- **une mesure sur le texte courant** — `.espace > p`, `.sous-titre`, `.vide`
  s'arrêtent à 68 caractères. Sans elle, un sous-titre aurait couru sur 1600 px
  et l'œil aurait perdu la ligne en revenant à gauche ;
- **un quatrième palier de marge** (48 px au-delà de 100 rem) : toute la largeur
  ne veut pas dire bord à bord ;
- **le voile du menu ne recentre plus rien** — il refaisait le calcul
  `(100vw - --colonne-max) / 2` pour aligner son panneau sur le bouton, calcul
  qui n'a plus d'objet ; il reprend la marge.

`--colonne-max` **reste défini** et vaut `none` : les trois conteneurs qui s'y
alignaient (`.entete`, `.barre-onglets`, `#vue`) n'ont pas bougé, et y remettre
une valeur suffit à revenir en arrière.

**Mesuré à 1728 px** : `#vue` occupe 1728, le contenu 1632 (marges de 48), aucun
débordement horizontal sur les dix écrans du hub ni sur les deux sites. À
1440 px, la grille de `#semaine` passe de 780 à 1052 px et le sous-titre reste à
642. **Vu à l'écran** : l'accueil, `#semaine`, le site Yuno et celui du club.

> **Piège d'outillage à connaître** : au-delà de ~1440 px de viewport émulé, les
> captures d'écran du panneau ne sont plus fiables — le contenu y paraît occuper
> 40 % de la largeur alors que le DOM le mesure plein. C'est le même repère
> faussé que les coordonnées de clic. **Mesurer, ne pas juger sur la capture.**

### 0.5 LES TUILES PERDENT LEUR CONTOUR, LES CHOIX DEVIENNENT DES PASTILLES

Deux demandes de Noé, à la suite, et elles vont ensemble : une forme doit dire
ce qu'on fait avec.

**LES CONTOURS.** *« Sur les tuiles, j'aime pas trop avoir des contours
(uniquement pour des tuiles à l'intérieur d'une tuile). »* La règle est juste :
une tuile posée dans la page se distingue par sa surface — `--fond-carte` sur
`--fond` —, le filet ne fait que redire ce que la couleur dit déjà. Il ne
redevient utile qu'entre deux surfaces voisines, c'est-à-dire quand une tuile
est dans une autre. Fait en un seul endroit, par `border-color: transparent`
(le fond est peint sous la bordure : rien ne bouge d'un pixel, et la barre
d'espace de `.bloc li`, calée sur ce 1 px, ne bouge pas non plus).

**La tuile du vivier a dû changer de surface** : sur `--fond-doux`, elle
n'existait que par son filet. Passée sur `--fond-carte`.

**LES CHOIX.** *« Les menus déroulants doivent être des pastilles… et elles
doivent toutes être côte à côte »*, puis *« sans leur titre »*. Le déclencheur
avait l'allure d'un champ, au motif écrit dans le code que « dans un formulaire,
un choix est un champ comme un autre ». Ce motif tombe : on n'écrit pas dans un
choix, on y prend. Les dix-sept formulaires du hub sont servis d'un coup —
`construireFormulaire` sort les choix du fil et les range en une bande, à la fin,
comme la tuile de capture.

**Puis trois corrections de Noé, dans l'ordre où elles sont venues** : *« sans
leur titre »* (les libellés au-dessus des pastilles ont disparu, déplacés dans
le `title` et le nom accessible) ; *« sans la flèche sur le côté, et avec des
couleurs »* (le chevron retiré, la pastille teintée de la couleur que le hub
emploie déjà pour cette valeur — espace, priorité, famille, déduite des options
et non déclarée) ; enfin, en voyant le point de couleur des régimes : *« t'as
rajouté le rond de couleur donc on peut enlever le titre aussi pour déclarer une
période »* — la seule exception envisagée est tombée d'elle-même.

**Deux derniers réglages, à la capture d'écran près** : Noé a montré la pastille
« P1 » de la tuile de capture — *« la couleur de la pastille, comme celle-là »* —
et le fond teinté a laissé place au **contour seul**, encre et filet de couleur
sur fond vide ; puis *« les pastilles doivent être en haut plutôt qu'en bas »*,
ce qui renverse l'analogie avec la tuile de capture au profit de ce que les
formulaires faisaient déjà : « Espace » ouvrait celui d'un objectif. **Ce qui
cadre se pose avant ce qu'on écrit.**

**Puis deux vocabulaires de couleur propres aux habitudes** : la **cadence** se
lit en **sept bleus différents**, du plus pâle (une fois) au plus franc (tous les
jours) — la teinte marche de 202° à 227°, la clarté de 78 à 64 %. *Un unique
bleu mêlé au gris avait été fait d'abord ; Noé l'a écarté — « là c'est juste la
saturation qui est modifiée » — et il avait raison : mélanger une couleur à du
gris n'en change pas la teinte.* Et **« Sans famille » et « intendance » ont
échangé leur couleur** — le vide prenait l'accent de la page et ressemblait à un choix fait,
la vraie famille portait le gris. Le gris va à l'absence de choix.

*Ce que ça a demandé au passage* : une teinte qui pose son attribut **même sans
valeur** (`vide: true`), sans quoi « Sans famille » n'avait aucune accroche CSS
à lui et retombait sur l'accent.

**PUIS LES DATES SONT DEVENUES DES PASTILLES**, à la suite des choix, avec le
logo du calendrier : elles disent le nom de leur champ tant qu'elles sont vides
(« Échéance », « Du »), puis la date en court. Le champ natif reste, invisible,
par-dessus la pastille — c'est lui qu'on touche, donc le sélecteur du navigateur
s'ouvre sans une ligne de JavaScript, et un champ requis reste focusable (un
champ requis inatteignable bloque l'envoi en silence).

**La parenthèse d'un libellé ne monte pas dans la pastille** : « Jusqu'au (vide
= un seul jour) » tenait une ligne à lui seul dans la fenêtre de modification du
calendrier. Elle part vers le `title`. Résultat mesuré : cette fenêtre, qui
demandait de faire défiler, tient maintenant d'un seul tenant.

**ET L'ÉCHÉANCE D'UN OBJECTIF EST DEVENUE OBLIGATOIRE** (décision de Noé). La
colonne reste nullable — rien ne casse pour les lignes anciennes — mais le
formulaire l'exige. Un cap sans date n'est pas un cap. Le jalon garde la sienne
facultative.

**PUIS LA TUILE A PRIS SA FORME DÉFINITIVE**, en trois demandes : le **texte
principal perd son cadre et son étiquette** — une invite en gris qui s'efface
dès qu'on écrit, comme « Nom de la tâche » ; **le curseur y va à l'ouverture**,
clavier compris ; et **le bouton de fin perd son contour**.

**L'ORDRE A ÉTÉ CHERCHÉ EN TROIS ESSAIS**, tous le même soir : la rangée de
pastilles en pied (après tous les champs), puis en tête (avant le texte), puis
enfin **sous le texte, séparée de lui par un blanc plus large**. C'est celui de
la tuile de capture, et il ne tenait pas sans ce blanc — la vedette se noyait
dans la rangée, et c'est exactement ce qui avait fait remonter les pastilles au
tour d'avant. **Le blanc n'est donc pas du confort : c'est lui qui rend cet
ordre possible.**

*Le piège du clavier sur iPhone, et comment il est contourné* : un `focus()`
programmé hors d'un geste de l'utilisateur ne lève pas le clavier sur iOS, or
l'événement `toggle` d'un `<details>` est mis en file — donc tiré du geste. On
intercepte le clic sur le sommaire, on ouvre soi-même, on donne le focus dans la
foulée. Un second chemin (`toggle` en capture, il ne remonte pas) rattrape les
tuiles qu'un espace ouvre lui-même, comme « Déclarer une période ».

**ET UN VRAI MANQUE A ÉTÉ COMBLÉ AU PASSAGE** : depuis la tuile d'un projet, on
peut enfin le **rattacher à un ou plusieurs objectifs** — une pastille juste
après celle de l'espace. Le lien existait en base depuis le 27 août et ne se
posait que d'un endroit : poser un projet depuis un cap déjà ouvert. Un projet
créé depuis la galerie ne pouvait donc plus jamais être rattaché — et six des dix
projets de Noé ne servent aucun cap.

*Quatre précautions dans l'écriture* : le panneau **ne se referme pas** entre
deux coches (`type: 'choix-multiple'`, le seul du hub) ; l'enregistrement
**accorde** au lieu de réécrire — il retire les décochés, ajoute les cochés, et
ne touche jamais aux liens vers un JALON, que la pastille n'offre pas ; la
pastille dit **lequel** quand il n'y en a qu'un, les compte au-delà ; et le menu
**ne montre que les objectifs de l'espace choisi**, en décochant ce qui sort de
l'espace quand on en change (sinon un lien invisible s'enregistrerait). C'est la
seule dépendance entre deux champs d'un formulaire du hub.

**Vérifié dans les deux sens sur ses vraies données** : « Suivi de l'alternance »
rattaché à « Laisser une com qui tourne sans moi », relu en base, puis détaché et
relu à zéro. Le projet est revenu dans l'état où il était.

**La règle qui commande tout ça, dans ses mots** : *« cette tuile d'ajout [la
capture] est ma référence, où tout ce qui peut être une pastille l'est pour
simplifier la tuile, mais en respectant ce qui nécessite un espace de texte. »*
Mesuré sur « Déclarer une période » : cinq pastilles sur une rangée et **un seul
champ de texte**, là où il y avait six champs empilés.

**Et le filet des pastilles a maigri** : l'encre garde la couleur pleine, le
contour la porte à 70 %. Il tenait déjà le minimum géométrique — 1 px —, donc
c'est la couleur qui recule ; sous 1 px, le trait disparaîtrait sur un écran non
retina.

**Deux défauts trouvés en le faisant, et corrigés :**
- **le panneau se faisait couper.** Les choix étant désormais en bas du
  formulaire, le dernier ouvrait son menu dans le bord de la tuile, qui défile.
  Mesuré sur « Déclarer une période » : la troisième option restait invisible.
  `placerLePanneau` le retourne vers le haut, ou vers la gauche.
- **trois pastilles disaient « Normal ».** Sans titre au-dessus d'elles, les
  régimes d'une période ne se distinguaient plus. Elles portent la couleur de
  leur espace (`marqueEspace`) — une couleur, pas un mot revenu par la fenêtre.
- **la couleur ne suivait pas la valeur.** `poserLeChoix` réécrit le contenu du
  déclencheur sans redessiner le formulaire : il emportait le point de couleur
  et laissait la teinte de l'ancienne valeur. Changer une priorité laissait donc
  la pastille dans la couleur de la précédente.

**L'étiquette d'un choix ne pointait sur rien** depuis le début : `<label for>`
visait un id que le déclencheur ne portait pas. Réparé au passage, même si
l'étiquette a disparu ensuite.

**Vérifié à l'écran** : les formulaires objectif, période, habitude, et la
fenêtre de modification du calendrier ; l'accueil, `#semaine`, `#objectifs`,
`#perso`, les deux sites. Aucune erreur de console sur les dix écrans.

### 0.6 UN PROJET SE RATTACHE ENFIN À SES OBJECTIFS

Demande de Noé : *« depuis la création ou modification d'un projet on doit
pouvoir lier à un ou plusieurs objectifs, donc une pastille qui permet de
sélectionner les objectifs concernés, après la pastille de l'espace. »*

**CE QUE ÇA RÉPARE, ET C'EST UN VRAI TROU.** Le lien existait en base depuis le
27 août — `projets_cibles`, plusieurs objectifs par projet — et ne se posait QUE
d'un endroit : poser un projet **depuis un cap déjà ouvert**. Un projet créé
depuis la galerie ne pouvait donc **plus jamais** être rattaché. Six des dix
projets de Noé ne servent aucun cap.

- **`type: 'choix-multiple'`**, le seul du hub : le panneau **ne se referme
  pas** entre deux coches — un menu qui se referme à chaque option obligerait à
  le rouvrir autant de fois qu'on veut de liens.
- **La pastille dit LEQUEL quand il n'y en a qu'un**, et les compte au-delà
  (« 2 objectifs ») : trois titres dans une pastille feraient une phrase.
- **Le menu ne montre que les objectifs de l'espace choisi** (correction de Noé)
  et **décoche ce qui sort de l'espace** quand on en change — sinon un lien
  invisible s'enregistrerait. C'est la règle de la tuile de capture, où « un
  projet devenu incohérent s'efface ». **C'est la seule dépendance entre deux
  champs d'un formulaire du hub**, d'où un branchement nommé dans `poserLeChoix`
  plutôt qu'un mécanisme général.
- **L'icône est une CIBLE** et non un maillon (correction de Noé) : un projet
  *vise* un cap.
- **L'enregistrement ACCORDE, il ne réécrit pas** (`accorderLesCibles`) : il
  retire les décochés, ajoute les cochés, et **ne touche jamais aux liens vers un
  JALON**, que la pastille n'offre pas. Effacer ce qu'un écran ne montre pas
  serait le pire des défauts : invisible au moment où il se produit.

**ET L'ÉCHÉANCE D'UN OBJECTIF EST DEVENUE OBLIGATOIRE** (décision de Noé, même
moment). La colonne reste nullable — rien ne casse pour les lignes anciennes —
mais le formulaire l'exige. Un cap sans date n'est pas un cap : c'est une
intention, et les intentions ont leur page dans perso, où justement rien ne se
mesure. **Le jalon garde la sienne facultative** : il découpe un objectif qui
porte déjà la date.

### 0.7 LES DÉCISIONS QUI ONT FAIT UN ALLER-RETOUR — NE PAS LES « CORRIGER »

C'est la section à lire avant de toucher aux tuiles d'ajout. Chacune de ces
formes a été essayée, puis renversée par Noé ; la remettre serait refaire le
chemin à l'envers.

| Ce qui a été essayé | Ce qui a été retenu, et pourquoi |
|---|---|
| La rangée de pastilles **en pied** de formulaire | **Sous le titre**, séparée par un blanc plus large. Elle est passée par le pied, puis par la tête (avant le texte), avant de se poser là. **Le blanc n'est pas du confort** : sans lui la vedette se noyait dans la rangée, et c'est ce qui l'avait fait remonter au tour d'avant. |
| Un **titre au-dessus** de chaque pastille | **Aucun titre.** Le libellé vit dans le `title` et le nom accessible — la parade déjà employée sur la ligne d'une habitude. |
| **Garder le titre** pour les trois régimes d'une période (ils disent tous « Normal ») | **Un point de couleur** à la place. Noé l'a tranché en le voyant : « t'as rajouté le rond de couleur, donc on peut enlever le titre aussi ». |
| Une pastille à **fond teinté** (14 %) | **Contour seul, fond vide** — le dessin de la pastille « P1 » de la capture, que Noé a montrée en photo. Cinq pastilles remplies font cinq taches ; cinq contours font une rangée. |
| Un **seul bleu mêlé au gris** pour la cadence d'une habitude | **Sept bleus différents** (202° → 227°, clarté 78 → 64 %). « Là c'est juste la saturation qui est modifiée » : mélanger une couleur à du gris n'en change pas la teinte. |
| Un **bandeau complet** sur l'accueil (titre, dates, phrase, bouton) | **Un bouton, et rien d'autre** : « Programmer ma semaine ». Trois lignes pour un seul geste. |
| La page nommée **« Programmer la semaine »** | **« Ma semaine »** — un seul nom dans le `<h1>`, l'onglet et le menu. Le verbe reste sur le bouton : un bouton dit ce qui va se passer, un titre nomme ce qu'on regarde. |
| La grille de « Ma semaine », **pure surface de placement** | **On y rouvre ce qui est posé** (§ 0.2). |
| Le vivier en **deux groupes titrés** (« Sans date », « Restées ouvertes ») | **Une seule liste**, les glissées en tête, **la date de leur ancien jour à droite** — elle dit ce que les titres disaient, sans coûter deux lignes. |
| **« Sans famille » en accent, « intendance » en gris** | **Inversé.** Le gris va à l'absence de choix, la couleur au choix. |

### 0.8 CE QUI A ÉTÉ VÉRIFIÉ, ET COMMENT

Tout dans le navigateur, **sur ses vraies données**, et remis dans l'état
d'avant à chaque fois — il n'y a pas de base de bac à sable.

- **Le glissement d'une tâche du vivier vers un jour** (elle atterrit dans la
  bonne colonne), **le glissement inverse** qui la déprogramme, et **la croix**
  qui la range sous « mises de côté » — celle-ci **survit à un rechargement**,
  donc elle est bien écrite. Le « Remettre » la rend au vivier.
- **La fenêtre de détail** sur « Ma semaine » : ouverture, « Modifier »,
  formulaire pré-rempli, enregistrement — la fenêtre se referme et la base garde
  les mêmes valeurs. **Et sur le calendrier**, sur un ÉVÉNEMENT, qui passe par
  la branche la plus fournie de `corriger` — c'est le test qui valide le
  déménagement du § 0.3.
- **L'horaire, en aller-retour complet** : 18:00 posé sur une tâche → écrit
  `18:00:00`, la barre affiche l'heure devant le titre ; rouvert → pré-rempli ;
  vidé → `NULL`.
- **Le rattachement d'un projet**, dans les deux sens : « Suivi de l'alternance »
  lié à « Laisser une com qui tourne sans moi », relu en base, puis délié et
  relu à zéro.
- **La largeur**, mesurée à 1728 px : `#vue` occupe 1728, le contenu 1632,
  **aucun débordement** sur les dix écrans du hub ni sur les deux sites.
- **La colonne du vivier** : `scrollWidth === clientWidth`, et les dix-sept
  croix tombent toutes à l'intérieur de la colonne, à 1400 px comme à 375.
- **Aucune erreur de console** sur les dix écrans, après chaque changement.

**CE QUI N'A PAS ÉTÉ VÉRIFIÉ, et il faut le dire :**
- **« C'est ma semaine » n'a jamais été pressé.** Il écrit une ligne dans
  `semaines` et **aucun écran ne permet de la retirer** : la presser en essai
  aurait supprimé la porte du dimanche soir de Noé. Le chemin d'écriture est
  inchangé, seule la date passée diffère.
- **Rien au doigt.** Le chemin tactile — choisir la tâche, puis toucher le jour —
  n'a été éprouvé qu'à la souris. C'est la leçon du 29 août sur le balayage : un
  geste tactile ne se vérifie pas en simulant des événements.
- **Les tuiles d'ajout des deux sites n'ont pas été ouvertes une à une.** Leurs
  ACCUEILS, eux, ont été regardés après la disparition des contours et après la
  suppression du plafond de largeur : les lignes du club et les tuiles
  d'objectif de Yuno se lisent bien. Mais les formulaires eux-mêmes — qui
  passent par le même `construireFormulaire` que le hub — n'ont été couverts que
  par le balayage d'erreurs.

### 0.9 LES PIÈGES PAYÉS, ET CEUX QUI SE REPRÉSENTERONT

- **`minmax(0, 1fr)` — quatrième fois.** La liste du vivier est une grille ; sa
  piste implicite vaut `auto`, c'est-à-dire la largeur MINIMALE du contenu :
  **315 px mesurés pour une colonne qui en fait 296**. La croix, au bout de la
  ligne, tombait hors du champ. Symptôme rapporté par Noé, pas vu par moi : ça ne
  se voit jamais sur l'écran large où l'on travaille.
- **`.bloc ul` et `.bloc li` habillent TOUTES les listes du hub** — colonne,
  carte, cadre, barre de couleur. Deux listes neuves s'y sont fait prendre le
  même soir : les chiffres du bilan s'empilaient (et leur `flex-basis` de 7 rem
  devenait une HAUTEUR de 105 px), les tuiles du vivier portaient deux cadres.
  **L'annulation se scope au type** (`.bloc li.vivier-tache`) : `.bloc
  li[data-espace]` pèse deux classes ET un type, et l'emporte sur deux classes
  nues.
- **Les écouteurs branchés APRÈS `await charger()`** n'existent pas pendant les
  treize requêtes de la page : elle s'affichait, les tâches étaient visibles, et
  les toucher ne faisait rien. **Squelette, écouteurs, données — dans cet ordre.**
- **Un `<summary>` ouvert par le navigateur ne lève pas le clavier sur iPhone** :
  l'événement `toggle` est mis en file, donc tiré du geste. On intercepte le clic,
  on ouvre soi-même, on donne le focus dans la foulée.
- **Le panneau d'un menu se faisait couper** par le bord de la tuile depuis que
  les choix sont en bas du formulaire. Il se retourne (`placerLePanneau`).
- **Extraire une fonction commune : vérifier l'ORDRE des deux copies.** `corriger`
  précédait `effacer` dans l'accueil, l'inverse dans le calendrier ; une découpe
  identique dans les deux fichiers a dupliqué du code mort dans le second.
  Rattrapé par relecture, `git checkout`, et une seconde passe.
- **Outillage — deux pièges qui font accuser le code à tort** : les coordonnées
  de clic du panneau ne sont **pas** dans le repère de la capture d'écran dès
  qu'une taille est émulée (facteur 2,27 mesuré) ; et **`navigate` vers la même
  URL avec un simple changement de `#` ne recharge pas** le document — les
  modules restent ceux d'avant, et l'on croit que le code ne marche pas. Les deux
  sont notés dans ma mémoire de travail.

## 0 ante quater. La session du 30 août (jour) — LE FCH PREND SA CHARTE, PERSO REFOND SES HABITUDES

**Trois commits poussés** — `94954d8` (le FCH), `69f8147` (les habitudes),
`9b37534` (la doc). Deux migrations appliquées en base :
`20260830120000_temps_fort_fch`, `20260830140000_emoji_habitude`.

La session s'est jouée en deux temps sans rapport l'un avec l'autre : d'abord la
**lecture du dossier FCH de Noé et de son Drive**, qui a fourni la plupart des
réponses que le site cherchait depuis le 7 août ; ensuite une **refonte des
habitudes** menée par petites corrections successives, dont plusieurs se sont
renversées en cours de route (le § 0.7 CI-DESSOUS — celui de cette
section-ci, pas celui du § 0 — à lire avant d'y toucher).

*La soirée du même jour a sa section à elle, § 0 : elle n'a rien à voir avec
celle-ci.*

### 0.1 LE DOSSIER FCH RÉPOND AUX QUESTIONS OUVERTES DU CAHIER DES CHARGES

Noé a donné accès à son dossier `~/Documents/FCH` (15 180 fichiers) et à son
Drive. Trois des quatre questions ouvertes de `fch-spec.md` § 7 y avaient leur
réponse. **Le club avait déjà écrit ce que le site essayait de deviner.**

**LES RUBRIQUES ÉDITORIALES.** Le spec proposait « avant-match, portrait de
joueur, coulisses… » — six rubriques inventées faute de mieux. L'arborescence
`Communication/Réseaux/` en donne d'autres, éprouvées sur trois saisons :
Programmation du week-end, Résultats du week-end, Présentation des catégories,
Trombinoscopes, Reprises, Licences, Calendrier, Saison & plannings, Bilans de
saison, Recrutement, Entente.

**Le chiffre qui justifiait le changement : 42 des 44 publications FCH ne
portaient AUCUNE rubrique.** Le champ n'était pas rempli parce qu'on ne
proposait pas les bons mots.

*Trois sorties, toutes de Noé* : les **anniversaires** sont des storys et ne
passent pas au calendrier éditorial (le projet et sa tâche à la quinzaine
restent — ~13 visuels par mois, la charge est réelle) ; le **joueur de la
semaine** désignait autre chose, hors réseaux ; le **MPP** (MonPetitProno × FCH)
n'est pas décidé pour cette saison.

**LE CALENDRIER DE LA SAISON**, neuf dates fermes, tirées de son affiche « Nos
Évènements 2026/2027 » : pétanque 26 sept · Tournoi Rose 17 oct · **goûter de
Noël 19 déc** · futsal 9–10 janv · loto 13 ou 20 févr · matinée saucisses 11 ou
18 avr · pétanque 12 juin · journée du club 26 juin. **Le goûter a été posé** —
c'était la seule des trois dates de son alternance absente de la base, et elle
tombe quatre jours après son objectif « laisser une com qui tourne sans moi ».

**LES PARTENAIRES.** Le Google Sheet « Listing entreprise 2026-2027 » (modifié
le jour même) porte **288 entreprises**, un tableau de bord à six états, et
**12 050 € sur les 26 000 visés** — cible chiffrée corrigée par Noé, le document
d'objectifs d'alternance du Drive étant celui de l'an dernier, donc obsolète.

**RECADRAGE DE NOÉ, et il est important** : *« les partenaires ne sont pas ma
mission principale au FCH »*. Son document de responsabilités le confirme —
la commission Partenaires est celle de **Lorenzo** ; Noé y tient **une seule
ligne** (« contribuer à leur visibilité »), tandis que la **Communication est SA
commission**, cinq axes et une quinzaine de missions. Ce qui reste son travail,
ce sont les **contreparties** — et Noé a précisé qu'elles se déduisent du
**pack** (le dossier partenaires en définit cinq), pas des notes du Sheet.

### 0.2 LA CHARTE OFFICIELLE REMPLACE LES COULEURS RELEVÉES À L'ŒIL

`CharteGraphiqueFCH.pdf` donne **trois rampes de cinq** — bleu, rouge, or — et
non trois couleurs. Le site travaillait depuis le 7 août sur des valeurs
relevées sur le logo, et devait donc **inventer** tous ses bleus intermédiaires
(`#1e47a8`, `#16337d`, `#3a5cba`, `#23499f`, `#0a102c`), dont aucun n'existe au
club. C'est ça le vrai gain : **on ne devine plus un bleu foncé, on prend celui
du club.**

Mesuré : la tuile passe au 3e barreau (`#324c8f`) et **se détache MIEUX** qu'avant
— 1,30:1 contre le fond en haut du dégradé au lieu de 1,18 ; 1,95:1 au pied au
lieu de 1,66.

**Gilroy remplace Clash Display et Instrument Sans sur le site**, et ne coûte
aucun octet : elle était déjà chargée par `css/yuno.css` en 400/500/600/700/900
— les cinq graisses de la charte — et son fichier Bold vient des ressources du
FCH depuis le 13 août. Geist Mono garde les compteurs (la charte ne donne pas de
chasse fixe). Bellandha reste dehors : c'est une anglaise de logo.

**`--erreur` ne bouge pas, et ce n'est pas un oubli** : ce n'est pas un jeton
d'identité, la charte n'en dit rien, et l'aligner sur le rouge du club ferait
tomber un message de formulaire de 4,7:1 à 2,0:1.

### 0.3 « LA SAISON » — la com du club est CYCLIQUE, et l'outil ne le savait pas

C'est le fait que le dossier a révélé : l'essentiel de la charge éditoriale du
club revient. Un bloc en tête de `#hermitage/creer` répond à « est-ce que ma com
tourne ? », question que le calendrier ne posait jamais.

**Il ne crée rien qu'il ne sache déjà** : deux séries hebdomadaires tournaient
depuis le 9 septembre — « Programmation de la semaine » (15 parutions) et
« Programmation foot à 5, 8 et entente » (13) — **sans qu'aucune ne porte de
rubrique**. Le mécanisme marchait, il était invisible.

**UNE RUBRIQUE PORTE PLUSIEURS RYTHMES**, tranché par Noé : les deux séries
ci-dessus sont toutes deux de la « Programmation du week-end ». La rubrique est
l'étage du dessus, les séries sont sa mécanique.

**LE HUB NE DIT PAS CE QU'IL NE SAIT PAS**, et c'est l'écran qui l'a montré : la
première version proposait de poser « Programmation du week-end » alors qu'elle
tournait déjà sous un autre nom. Le rapprochement ne peut se faire que sur la
RUBRIQUE — un titre libre ne se compare pas. Tant qu'une série est sans
rubrique, « ce qui manque » est une devinette : le bloc se tait et montre le
geste qui débloque.

`rubriquerSerie` (js/api.js) **écrit aux deux étages** — le modèle de la série ET
les occurrences à venir. Sans ça, 28 parutions déjà générées seraient restées
orphelines pendant seize semaines. Ce qui est passé ne bouge pas.

### 0.4 LES TUILES D'IDÉES, ET L'ACCUEIL DU SITE QUI REDEVIENT UN ATELIER

Trois demandes de Noé sur `#hermitage/creer`, **toutes en options et non en
règles communes** — `.pub-*`, `corpsPublication` et `construireAVenir` servent
aussi à Yuno, qui n'a rien demandé (vérifié à l'écran : son écran Créer est
identique) :

- **l'état devient un menu déroulant** — LA pastille du calendrier, extraite en
  `pastilleStatutPublication` et partagée. Elle sait ce que le bouton ne savait
  pas : sauter un cran, revenir en arrière ;
- **elle passe EN CREUX ici, et c'est une question de NOMBRE** : onze pastilles
  d'affilée, toutes au rouge de début de cycle, se lisent comme onze alertes ;
- **une seule parution par série** (39 tuiles → 11) ;
- **118 px → 77** par tuile.

**L'ACCUEIL DU SITE ÉTAIT À L'ENVERS**, et c'est la spec qui le disait : *« le
site est l'ATELIER, la page du hub est le BILAN — c'est la seule division qui
justifie deux écrans »*. Or le site n'affichait **aucune tâche**, ouvrait sur
trois tuiles d'objectifs et un formulaire d'ajout, et fermait sur les victoires.
Deux blocs de bilan, zéro travail — tandis que la page `#fch` du hub, elle,
avait un panneau « À faire ».

Nouvel ordre : ce qui approche · **à faire** · la com · le cap en tuile-porte ·
victoires repliées. **« Ajouter un objectif » a quitté l'écran** : un objectif
de fin d'alternance se décide trois fois par an, le formulaire pesait tous les
jours. Et la coupe par série ramène **25 tâches à 3**.

### 0.5 `#hermitage/club` ET LE TEMPS FORT

L'écran attendait son contenu depuis le 7 août, et c'était juste. Le dossier l'a
donné : les neuf commissions et leurs porteurs, la mission et les six valeurs,
les 16 créneaux d'entraînement, les huit chiffres du club. **En lecture seule.**

Les données vivent dans **`js/club-fch.js`, pas en base** : rien n'y change plus
d'une fois par an, une table aurait demandé une migration et un écran d'édition
pour des lignes que personne ne modifie. Même choix que `js/logos-clubs.js`.
*(`verifier-coquille.js` a attrapé l'oubli du fichier dans le cache — l'outil
sert.)* **Les événements n'y sont pas** : ils sont en base, les redire ferait
deux sources pour une date.

**`evenements.temps_fort` est une DÉCLARATION, et il a fallu le MESURER.** Les
sept événements FCH à venir — trois entraînements, une séance photo, trois temps
forts — étaient **indistinguables en base** : ni série, ni `avec_photos`, ni
présence d'un créneau ne les séparaient. Ne restait que le titre, et deviner sur
un titre libre est ce que le hub refuse. D'où la colonne, sur le motif exact de
`reunion_objet`.

**La pastille passe par un DRAPEAU de l'appelant** (`tempsFort: true`), comme
`reunion` — pas par `espaceInitial`, qui vaut `null` sur un site (un seul
espace, donc pas de choix d'espace). Mesuré : la pastille n'apparaissait jamais.
**C'est le site qui sait qu'il est le club.**

*Au passage : la pastille « Photos » teste `espaceInitial === 'photo'` et
n'apparaît donc pas non plus sur `#hermitage`, alors que le `CLAUDE.md` la dit
offerte au FCH. Défaut préexistant, non corrigé.*

### 0.6 PERSO — LES HABITUDES, REFONDUES EN SIX PASSES

Cette moitié n'est **pas commitée**. Elle s'est faite par corrections
successives de Noé, chacune arrivant pendant que la précédente était en cours.

**L'ÉMOJI** (migration `20260830140000`, 8 caractères au plus — un émoji composé
en occupe plusieurs). Facultatif. Sur le tableau de bord il **remplace** le nom ;
sur la page de gestion il le **précède**, parce qu'on y vient lire une cadence et
un pourquoi.

**LES HABITUDES ONT QUITTÉ L'ACCUEIL** — décision prise le soir même où elles y
étaient arrivées (§ 0 ante bis). Même mouvement que les objectifs la veille :
l'accueil porte ce qui est POSÉ, et **une habitude n'est posée de rien, elle
revient**.

**LA COLONNE DANS PERSO** : une ligne par habitude, le rond en premier tout à
gauche, **32 px par ligne** — la cible chiffrée par Noé est « 10 sans que ce soit
trop long », soit 320 px au lieu de 640. Deux mesures seulement (la semaine en
points, le prochain palier), **et aucun texte** : « le texte n'est pas nécessaire
une fois que je sais à quoi les chiffres correspondent ». Gain non prévu — **tous
les noms tiennent enfin en entier**, y compris sur 375 px.

**LA PAGE DES HABITUDES DEVIENT UN TABLEAU DE BORD** : quatre chiffres globaux,
une courbe de douze semaines, une sparkline par carte. `bilanDesHabitudes` et
`historiqueDeLHabitude` vivent dans `js/orientation.js`, éprouvées hors écran.

**LE COMPTE DEVIENT QUOTIDIEN pour les habitudes quotidiennes.** Une habitude
est quotidienne **quand sa cadence vaut 7** — pas de colonne nouvelle, le
formulaire écrit déjà « Tous les jours » sur cette valeur. La série compte alors
des JOURS, et un jour manqué fait −1. *Vérifié hors écran : 29 jours dont 2
manqués donnent 25, là où un compteur classique dirait 8.*

**« QUAND ÇA VIENT » N'EXISTE PLUS** : sans cadence, ni élan ni série — rien à
tenir, donc rien qui puisse se tenir. La cadence est obligatoire. Les habitudes
qui portent encore `NULL` ne disparaissent pas : elles vont dans un groupe **« À
régler »**, parce que les cacher les rendrait impossibles à corriger.

### 0.7 LES DÉCISIONS QUI ONT FAIT UN ALLER-RETOUR — NE PAS LES « CORRIGER »

C'est la section à lire avant de toucher à quoi que ce soit de ci-dessus.

| Ce qui a bougé | L'état final, et pourquoi |
|---|---|
| **Le dégradé du site FCH** | Passé à la rampe de la charte le matin, **remis à l'ancien** (`#0039a6 → #16337d → #0a102c`) le soir. **C'est la troisième fois qu'on y touche et qu'on le remet.** Cohérent : c'est le seul endroit du site où la couleur ne DÉSIGNE rien — elle éclaire. La charte nomme des aplats, et ce sont eux qui ont bougé. |
| **Les habitudes sur l'accueil** | Arrivées la veille au soir, **parties le lendemain soir**. Ne pas les y remettre. |
| **L'émoji** | Demandé « pour la page d'accueil » — l'accueil a perdu les habitudes entre-temps, l'émoji sert donc dans perso. La demande tient, sa destination a changé. |
| **La taille du rond** | 34 → 26 (matin) → **16** (soir). Le bouton, lui, n'a jamais bougé de 44 de large : le rond est ce qu'on VOIT, le bouton ce qu'on TOUCHE. |
| **Les stats de la colonne** | Phrase complète → « encore 9 avant 10 » → **chiffre nu**. Le sens est déplacé dans `title` et `aria-label`, pas perdu. |
| **Le pli de la page habitudes** | La règle disait *« sans ce pli, cinq habitudes feraient un tableau de bord, et un tableau de bord ne donne envie de rien »*. **Renversée** : Noé demande des stats et des courbes, il VEUT ce tableau de bord. La règle était juste tant que la page ne portait que des chiffres nus. |
| **« Quand ça vient »** | Conçu le 29 comme une cadence légitime, **supprimé le 30**. Ne pas le réintroduire. |

**Un arbitrage assumé, à rouvrir si l'usage le dit** : la cible tactile d'une
ligne d'habitude passe de 44 px de haut à **32**, au profit de la densité
demandée. Ce qui rend le compromis tenable : la largeur reste à 44 et **il n'y a
aucune autre cible sur la ligne**. Si Noé rate des lignes au doigt, c'est cette
décision-là qu'il faut rouvrir, pas la densité.

### 0.8 CE QUI A ÉTÉ VÉRIFIÉ, ET COMMENT

**Tout au navigateur, service worker vidé avant chaque contrôle** — sans ça on
teste la version d'avant, et le piège s'est présenté à chaque itération.

- **Onze vues parcourues** à chaque étape (les six du site FCH, les huit
  sous-vues de perso, l'accueil, `#taches`, `#calendrier`, Yuno, `#chemin`) :
  zéro erreur console **nouvelle**, la page ne déborde jamais horizontalement.
- **Deux tailles** : 375 px et 1100 px.
- **Les calculs éprouvés hors écran**, avec des faits factices — la série
  quotidienne, le bilan, la comparaison des unités.
- **Les gestes éprouvés de bout en bout, puis annulés** : une publication passée
  en « à programmer » et remise ; une habitude cochée puis décochée ; une cadence
  passée de 5 à 4 et **remise à 5**. *Les données de Noé sont exactement dans
  leur état de départ.*
- **Un rendu d'essai en DOM pur** pour juger la forme des graphiques : ses
  données sont à zéro, donc l'écran réel ne montrait que des barres minimales.
  **Rien n'a été écrit en base**, un rechargement l'efface.

### 0.9 LES PIÈGES PAYÉS, ET CEUX QUI SE REPRÉSENTERONT

**`.bloc ul` et `.bloc li` GAGNENT — trois fois de suite.** Ils habillent toutes
les listes d'un bloc et pèsent (0,1,1) ; une classe seule pèse (0,1,0) et **perd
en silence** — la règle s'écrit, se relit sans faute, et n'a aucun effet. Trois
symptômes : une tuile dont tout partait sur une ligne, une grille qui restait en
colonne, un filet collé au texte (0 px mesuré au lieu de 28). **Toute classe
posée sur un `ul` ou un `li` d'un `.bloc` s'écrit `.bloc ul.<classe>`** — la
convention existait (`.bloc ul.chiffres-cles`) mais n'était écrite nulle part.
Consignée dans `fch-spec.md`.

**`.perso-colonne` était un nom PRIS**, et il m'a coûté deux collisions : c'est
la colonne des sous-vues, que le script masque quand elle ne porte aucun
`[data-vue]` — mes colonnes disparaissaient entières ; et leur titre était un
`<h2>`, or le script masque le premier `h2` d'une vue seule. Renommées `.duo-*`,
titre en `<h3>`. **Le grep de trois secondes n'est pas facultatif.**

**Un champ « choix » ne se remplit pas en posant sa valeur** : il porte un input
caché doublé d'un bouton et d'un panneau. Écrire dans l'input laissait l'ancien
libellé à l'écran. On **clique l'option**, comme le ferait un doigt.

**`perso.js` n'appelait `brancherChoix` NULLE PART** — défaut préexistant, révélé
par le rapport de Noé « je ne peux plus modifier une habitude ». Conséquence :
cliquer « 4 fois » laissait la cadence à 3, **et le formulaire s'enregistrait
proprement avec l'ancienne valeur, sans erreur ni signe**. Touchait aussi la
famille d'une habitude et le statut d'un livre.

**Le menu à trois points était à `opacity: 0`** sur les nouvelles cartes : la
liste des conteneurs qui le révèlent au survol ne connaît que les tuiles du cap.
Il répondait au clic, on ne le voyait pas. **Sur la page des habitudes il est
désormais visible en permanence** — ailleurs c'est un geste de second plan, ici
modifier une cadence est la raison de venir.

**Mes propres coupes, deux fois trop larges.** Un remplacement par tranche a
emporté six définitions voisines (`construireBibliotheque`, `porte`,
`pointsDeLaSemaine`…), une regex en a emporté une autre (`fermerLaDuree`). Les
deux fois, le navigateur l'a dit tout de suite et git a permis de récupérer.
**Comparer l'ensemble des définitions avant/après est le contrôle qui manquait.**

**Les accents graves dans un commentaire HTML d'un gabarit — deux fois.**
`verifier-gabarits.js` les a attrapés les deux fois ; `node --check` ne les voit
pas. L'outil sert, il faut le lancer.

**Une leçon d'outillage** : j'ai deux fois failli conclure à tort depuis une
capture d'écran. Les sections des espaces déjà montés restent dans le DOM (il
faut filtrer sur la visibilité), et la fenêtre du navigateur intégré faisait
342 px alors que la capture en montrait 800 — un empilement que je croyais fautif
était correct. **Mesurer, pas regarder.**

### 0.10 UNE ÉTUDE DE MARCHÉ, HORS CODE

Noé a demandé une étude des applications comparables (habitudes, journal,
lecture). Publiée en artefact : **[Le marché du suivi de
soi](https://claude.ai/code/artifact/f43567a1-9ca5-41e2-a02f-431dd16dba0c)**.

**Le résultat qui compte pour la suite** : sur le point le plus délicat, le hub
est **devant le marché**. Tous les concurrents résolvent la série cassée par le
*gel de série* — un stock de jokers, tout ou rien. L'élan qui décroît et la série
qui recule d'un cran sont plus fins, et cette mécanique n'apparaît nulle part
ailleurs. **Ne pas aller chercher chez les autres ce qui est déjà mieux ici.**

Et la **grille annuelle façon GitHub**, forme dominante du marché, confirme le
refus de Noé : elle affiche les manques avec la même précision que les faits.

Quatre pistes en sortent, classées dans l'artefact — la première étant de
**croiser l'humeur et les habitudes** (les trois ingrédients existent déjà, rien
à stocker).

## 0 ante quinquies. La session du 29 août (soir) — PERSO DEVIENT UN ESPACE VIVANT

**Quatorze commits, tous poussés et déployés.** Cinq migrations appliquées
(`etapes_projet`, `post_de_match` et son correctif d'index, `habitudes`,
`bibliotheque`, `journees`). `CLAUDE.md`, `docs/yuno-spec.md`,
`docs/orientation-spec.md` et cet état des lieux mis à jour. La coquille est
passée en **v9**.

**La session s'est jouée en deux moitiés.** La première a corrigé le hub là où
il mesurait faux ou se laissait mal prendre en main ; la seconde a construit,
sur demande de Noé, tout ce qui manquait à l'espace perso pour qu'il serve à
autre chose qu'à ranger.

### 0.1 L'AVANCÉE D'UN PROJET NE SE COMPTE PLUS EN TÂCHES

La phrase de Noé : *« l'avancée des projets ne doit pas être complètement liée
aux tâches, ce n'est pas ça qui dit que c'est fini ou non car des tâches
s'ajoutent petit à petit. »*

**Ses données ont réglé la question, et le défaut mentait dans les DEUX sens** :

| Projet | Ce qui s'affichait | Ce qui était vrai |
|---|---|---|
| Deuxième dossier | **100 %** (3 tâches sur 3) | actif, 25 h annoncées — il commençait à peine |
| Album du club | 7 % (1 sur 14) | il **reculait** à chaque tâche écrite |

Un dénominateur qui grandit à l'usage ne mesure rien, et celui-là punissait le
geste même que le hub veut encourager : noter ce qu'on a à faire.

**D'où une CASCADE** (`avanceeDuProjet`, js/orientation.js) : les étapes
franchies, sinon la charge consommée, sinon un pointillé. Les deux premières ont
le même mérite — **leur dénominateur s'écrit une fois, à la création**. Le
dessin dit laquelle on regarde : des marches se franchissent, une barre se
remplit. Les deux écrans qui la montrent (galerie de `#objectifs`, rail de
l'accueil) la lisent pareil.

Trois garde-fous portés par le calcul, pas par l'écran :
- **l'état posé passe devant tout** — un projet `termine` a sa jauge pleine ;
- **un projet « à l'année » ne se mesure pas**, même avec des étapes : il n'a pas
  de ligne d'arrivée ;
- **le silence des durées n'est pas un zéro** — une charge dont aucune tâche
  faite ne porte de durée retombe sur le pointillé et dit « 25 h, aucune durée
  notée ». Afficher « 0 h sur 25 h » prétendrait que rien n'a été fait.

**Table neuve : `projets_etapes`**, aux colonnes de `jalons` — c'est le même
motif un étage plus bas. Sans échéance en revanche : une étape découpe le
TRAVAIL, pas le calendrier. Franchir une étape écrit une victoire.

**Le mouvement vit à côté de l'avancée**, jamais à sa place : « 3 faites cette
semaine », « rien depuis 12 j ». Et **la naissance n'est pas du mouvement** —
« Posé il y a 2 j » ne s'affiche que dans le détail, jamais sur une tuile ni sur
le rail (correction de Noé : six de ses dix projets l'affichaient, et une ligne
identique partout ne dit plus rien).

### 0.2 UN MATCH DE YUNO PROGRAMME SON POST

Demande de Noé : *« après chaque évènement match yuno, il faut programmer un post
sur le match à J+1. »* C'est la troisième chose que le hub pose lui-même à partir
d'un événement — et **la première qui ne soit pas une tâche**.

**La règle du 29 août au matin s'élargit d'un mot** : « ce qu'il a DÉCLARÉ
devient une VRAIE LIGNE » (et non plus « une TÂCHE »), qui prend la forme de ce
qu'elle est. Du travail à cocher devient une tâche, une parution devient une
publication. Le partage ne bouge pas : une déclaration donne une ligne qu'on
manipule, une déduction donne une phrase à laquelle on répond.

`poserLesTachesDEvenement` s'appelle désormais **`poserCeQuUnEvenementFaitNaitre`**
— elle ne pose plus seulement des tâches, et un nom qui ment est un défaut à part
entière. Détail complet dans `yuno-spec.md`.

**Un piège de schéma, à retenir** : l'index unique qui rend le rattrapage
rejouable doit être **COMPLET et non partiel**. Un index partiel semblait plus
propre — les publications manuelles portent toutes un `evenement_id` nul — mais
`ON CONFLICT` ne peut pas s'y appuyer sans en reprendre le prédicat (Postgres
répond 42P10), et il n'y avait rien à protéger : dans un index unique, NULL
n'entre jamais en conflit avec NULL.

### 0.3 L'ORDRE DES MARCHES SE CHANGE — ÉTAPES ET JALONS

Demande de Noé, d'abord pour les étapes puis pour les jalons. « Monter » et
« Descendre » vivent dans le menu discret, **pas dans un glisser-déposer** : le
geste se fait au doigt comme à la souris, s'atteint au clavier, et réordonner
est rare — on le fait quand on pose le découpage.

- **Le menu reste ouvert** après un déplacement : trois rangs = trois appuis, pas
  neuf. Il est attaché à l'identifiant, pas à la position, donc il suit.
- **`reordonnerEtapes` RENUMÉROTE la liste entière** au lieu d'échanger deux
  valeurs : `ordre` naît de la longueur de la liste, donc une suppression laisse
  un trou et deux lignes peuvent porter le même numéro — un échange de deux
  valeurs jumelles n'aurait alors rien changé.
- **Une seule mécanique pour les deux étages** (`deplacerDans`, js/objectifs.js).

### 0.4 LE BALAYAGE ENTRE ONGLETS — quatre passes, et une leçon de méthode

Demande de Noé : *« pouvoir slider, essentiellement sur téléphone, pour passer
d'un onglet à un autre, EN PLUS de la possibilité d'appuyer sur leur boutons. »*
Le geste s'ajoute, il ne remplace rien.

**Il a fallu quatre corrections, et chacune a appris quelque chose** :

1. **« Un slide me fait sauter deux crans. »** Entre le relâchement et la
   navigation s'écoule l'animation ; un second balayage repartait du MÊME onglet.
   Le verrou se lève APRÈS la navigation.
2. **« Le slide n'est pas fluide du tout. »** La page ne suivait pas le doigt —
   et **c'est ça qu'on lit comme « pas fluide », pas la durée de l'animation,
   l'absence de prise.** L'écran suit maintenant à 90 %, plafonné à 26 %, et
   s'estompe à mesure qu'il s'éloigne.
3. **« Que je puisse slider depuis partout, actuellement ce n'est que aux
   extrémités. »** C'était ma propre garde : elle refusait le geste dès qu'un
   défileur horizontal se trouvait sous le doigt, or le rail des projets et la
   grille de la semaine occupent le milieu de l'écran. **La règle juste est celle
   des carrousels imbriqués** : un défileur ne garde le geste que s'il peut
   ENCORE défiler de ce côté-là.
4. **« Ça ne fonctionne pas sur téléphone. »** Il avait raison, et **mes essais
   avaient tort** : ils simulaient les événements en JavaScript, donc le
   navigateur n'y participait pas — or c'est lui qui décidait de tout. Sans
   `touch-action: pan-y`, il annule le pointeur dès qu'il croit à un défilement.

> **LEÇON À NE PAS REPERDRE : un geste tactile ne se vérifie pas en dispatchant
> des PointerEvent.** Neuf cas étaient « au vert » sur une preuve qui n'en était
> pas une.

Deux défauts trouvés en cherchant celui-là :
- le verrou se levait par `requestAnimationFrame`, **qui ne s'exécute pas quand
  la page est masquée** — écran verrouillé, application en arrière-plan : il
  serait resté posé pour toujours. Il se lève par un délai ;
- un `pointercancel` sur un geste déjà franc le mène désormais à son terme.

**Et la barre d'onglets colle enfin.** Elle était `position: sticky` depuis
toujours et ne collait pas : **un élément collant est borné par son PARENT**, et
elle était enfermée dans `.haut`, haut d'une centaine de pixels. Mesuré : à
600 px de défilement, elle se trouvait à −553. Enfant direct de `#app`, elle
colle sur toute la page.

### 0.5 LES HABITUDES — trois mesures dont aucune ne peut s'écrouler

Demande de Noé, en deux temps. D'abord : *« garder une routine et me motiver à la
garder, mais sans être trop strict — il y aura forcément des jours où je ne
pourrai pas. »* Puis, **devant une première maquette qu'il a écartée** (sept
points gris, les sept derniers jours) : *« ça ne me donne pas envie de les
faire… propose-moi des stats comme si j'étais dans un jeu, mais en restant sain
pour que ça ne s'écroule pas à la première fois que j'en saute une. »*

**Les deux moitiés ne se contredisent pas** : ce qui écroule une habitude, ce
n'est pas l'enjeu, c'est le TOUT OU RIEN.

| Mesure | Pourquoi elle ne s'effondre pas |
|---|---|
| **l'élan** (0–100) | monte à chaque pratique, perd 2 par jour : une pratique répare trois jours, une semaine vide coûte 14 points |
| **la série** | compte les SEMAINES tenues, et **recule d'un cran** au lieu de tomber à zéro |
| **le cumul** et ses paliers | ne redescendent jamais, et le prochain est toujours proche |

**Éprouvé hors écran avant tout écran**, sur le cas qui décide de tout : douze
semaines dont une sautée donnent une série de **9** là où une série classique
dirait **3**, et l'élan passe de 98 à 95. Cadences 3 et 5 tenues aussi longtemps
donnent toutes deux 98 — la normalisation tient (le gain vaut 28 / cadence).

- **Une cadence NULLE veut dire « quand ça vient »** : ni élan ni série, seulement
  le cumul.
- **Aucun rouge, aucun taux, aucun jour manqué compté.** Les mots vont de
  « solide » à « en sommeil ».
- **Les cinq amorcées sortent de SES intentions**, pas d'une liste générique.
  « Vivre de la joie, de l'espoir, de la simplicité » n'en est PAS une et ne doit
  pas le devenir : c'est l'intention-mère, celle qui juge les autres.

### 0.6 LA BIBLIOTHÈQUE, LES JOURNÉES

**La bibliothèque** (`livres`, `livres_seances`, `livres_citations`) : *« un
espace qui m'encourage à lire »*. Le mot est ENCOURAGER, pas mesurer — donc **pas
d'objectif annuel, pas de quota**. « 24 livres cette année » transforme la
lecture en course et pousse à choisir des livres courts. Le rythme se compte **par
jour de lecture**, jamais par jour de calendrier. « Reposé » et non
« abandonné ». Les pages lues sont la SOMME des séances, jamais une colonne à
part. **Noter des pages coche l'habitude de lecture**, et l'habitude concernée se
déclare elle-même (`habitudes.automatique`).

**Les journées** (`journees` : jour, mot) : *« un bilan quotidien, avec une page
par jour qui est construite et sur laquelle on peut revenir ».* Elle **se lit
plus qu'elle ne se remplit** — le hub connaît déjà tout ce qu'elle montre. Une
seule chose s'y écrit, « ce qui a compté », et elle s'enregistre quand on quitte
le champ : lui demander un bouton la ferait ne jamais s'écrire. **La relecture**
la ferme — une victoire d'il y a un mois, trois, six ou un an, sinon une
intention ; **elle ne tire pas au sort**, le jour détermine le choix.

### 0.7 PERSO DEVIENT UN TABLEAU DE BORD

Demande de Noé : *« les critères sont un peu les mêmes que pour la page
d'accueil, des données qui évoluent sur lesquelles on a une action à faire. »*

**Ce critère trie dans les deux sens** : restent l'humeur, les habitudes, le
livre en cours, le prochain rendez-vous, le mot du jour. **Partent les
intentions**, la bibliothèque entière, l'historique des journées, la courbe des
30 jours, les victoires — chacune vers sa page. Le menu passe de quatre à **sept
sous-pages**.

C'est le même mouvement que l'accueil la veille, quand les objectifs l'ont
quitté. **Mais une intention revient, RELUE**, une seule, en pied : c'est ce qui
distingue ce tableau de bord d'un second accueil.

### 0.8 LES DERNIÈRES CORRECTIONS DE FORME

- **Les habitudes sortent de la tuile « Aujourd'hui »** (*« elles ne doivent pas
  être dans la tuile des tâches, évènements… et là ça prend trop de place »*).
  Deux défauts en un : **le rangement** — cette tuile porte ce qui est POSÉ au
  calendrier, or une habitude n'est datée de rien, elle revient — et **la
  place**. Elles deviennent des **jetons ronds posés à même le fond**, sans
  carte : rien d'autre dans le hub ne ressemble à ça, et c'est ce qui dit sans un
  mot qu'elles ne sont pas de la même nature. 110 px → 56. Ronds ramenés de 34 à
  26 px à sa demande ; la cible tactile reste portée par le jeton entier.
- **Cinq éléments au plus par jour dans « Ta semaine »**, avec un « +N » qui
  ouvre le jour. **Le jour ouvert seul n'a pas de limite** — et ce n'est PAS
  réglé en JavaScript : ouvrir un jour ne redessine pas la grille, il n'en change
  que les largeurs de colonnes pour que le navigateur anime le passage. Tout est
  dans le DOM, et deux règles CSS décident (`.cal-au-dela`).
- **La semaine raccourcit de 131 px** (332 → 201). Le plancher de 20 rem de
  `.cal-ligne` datait du temps où la grille montrait tout ; il ne produisait plus
  que du vide. Onze rem sur l'accueil, le contenu décide au-delà. **Le calendrier
  plein écran garde ses 20 rem** : il ne plafonne rien, on y va pour voir.

### 0.9 CE QUI A CHANGÉ D'AVIS EN COURS DE ROUTE — à ne pas « corriger »

- **Le lendemain qui va avec** (réserver un temps calme après une sortie) a été
  proposé et **refusé** : *« je ne pense pas que je noterai mes sorties perso,
  j'ai envie que ça reste quelque chose de facile. »* Ne pas le reproposer.
- **Le carnet d'avant-séance** (noter ce qu'on veut aborder au rendez-vous psy) :
  **refusé pour le moment**, sans fermer la porte.
- **La première forme des habitudes** (sept points gris) a été écartée pour une
  raison précise — elle décrivait sans rien mettre en jeu. Ne pas y revenir en
  croyant simplifier.
- **La série classique** a été explicitement rejetée : c'est le tout ou rien qui
  écroule, pas l'enjeu.

### 0.10 CE QUI A ÉTÉ VÉRIFIÉ, ET COMMENT

- **Hors écran** : la cascade d'avancée, l'élan, la série, le cumul, la
  relecture — sur des jeux de données construits, avec les chiffres recalculables
  à la main. L'algorithme de déplacement des marches sur ses six cas.
- **Dans le navigateur, en vrai** : les étapes (poser, franchir, réordonner,
  supprimer), le post de match (né en base, puis refusé une seconde fois par la
  contrainte), les habitudes (cocher depuis les deux surfaces, écriture en base),
  la bibliothèque (livre, +10, citation, rythme), les journées (navigation, mot,
  relecture), les huit vues de perso, le plafond de la semaine (5 puis 10 une
  fois le jour ouvert), la hauteur de la grille.
- **Le balayage** : onze cas, dont les deux sens, les deux bords, le rail au
  début et au bout, le menu ouvert, la tuile de capture. **Mais tous simulés** —
  voir la leçon du § 0 ante ter, point 4.
- **Toutes les données d'essai ont été retirées** : `habitudes_faits`,
  `livres`, `livres_seances`, `livres_citations`, `journees` sont vides, les
  étapes d'essai supprimées, l'ordre des jalons de « Laisser une com » remis
  comme il était (1 à 6, relu en base).

## 0 ante sexies. La session du 29 août (jour) — L'ACCUEIL REFONDU

**Un commit, poussé.** Deux migrations appliquées (`accueil_suites`,
`taches_origine`, plus un correctif d'index). `CLAUDE.md`,
`docs/orientation-spec.md` et cet état des lieux mis à jour.

**La session est partie d'une question, pas d'une liste** : *« il faut qu'on
repense la page d'accueil dans son ensemble »*, avec sept défauts nommés et un
objectif. Elle s'est jouée sur **deux pages visuelles publiées et corrigées
quatre fois** avant qu'une ligne de code soit écrite, puis en implémentation
guidée à l'œil — Noé regardait, disait « trop clair », « trop d'espace », « pas
fonctionnel », et la forme se refaisait.

### 0.1 LA RÈGLE, et elle vaut plus que tout le reste

Noé l'a formulée en corrigeant ma proposition de « suites » — un bloc unique qui
mélangeait préparations et bilans :

> **Ce qu'il a DÉCLARÉ devient une TÂCHE. Ce que le hub DÉDUIT devient un MESSAGE.**

Ce n'étaient pas une chose mais deux, qui ne se traitent pas pareil. **Avant**
l'événement, la préparation est du travail — donc une tâche. **Après**, le bilan
est une question — donc un message auquel on répond. Aucun mot ne pouvait
couvrir les deux, et c'est pour ça que « Les suites » ne marchait pas.

Trois conséquences qui ne se défont pas sans la défaire :

- **Un cercle se coche, une porte emmène.** Deux gestes ne portent jamais le
  même signe.
- **La préparation naît à J−2, le tri à J+1**, en VRAIES lignes de `taches` —
  elles se cochent, se reportent, portent une durée, et « Le temps » les compte.
- **L'espace perso n'en produit jamais.** « RDV Psy » est passé sans être marqué
  vécu, exactement comme le match, et il ne doit rien.

### 0.2 Ce que la page porte maintenant

Dans l'ordre : **ligne de tête** (salutation contextuelle + humeur, 126 px → 47)
· **bandeau de l'après** (un seul, le plus récent, trois portes) · **tuile
Aujourd'hui** (à faire · à publier · rendez-vous · ce que je te propose) ·
**Ta semaine** (jours passés estompés, titres sur deux lignes) · **Projets en
cours** en colonne de droite, en tuiles qu'on fait glisser.

Le détail de chaque bloc est dans `CLAUDE.md`, § « L'accueil ». Ce qui suit ne
garde que ce qui ne s'y lit pas.

### 0.3 LES DÉCISIONS QUI ONT FAIT UN ALLER-RETOUR

**Ces sept-là ont été posées puis renversées dans la journée.** Une session
future qui les « corrigerait » referait un chemin déjà parcouru.

**1. « Réduire le nombre de pages » — mon erreur, inversée par Noé.** Ma
première proposition compressait le hub. Il a retourné le raisonnement : *« je
veux continuer d'être riche en page… mais ces pages-là doivent être plus
difficiles d'accès car elles sont le fruit d'une envie »*. C'est la règle des
deux rangs, née la veille et confirmée ici.

**2. La ligne de capture « Noter une tâche » : ajoutée, retirée.** Noé : *« il
n'est pas fonctionnel selon moi »*. **J'ai diagnostiqué faux** — j'ai affirmé
qu'un formulaire à un seul champ ne se soumet pas à Entrée, alors que la règle
HTML dit l'inverse (elle ne s'annule qu'à partir de DEUX champs sans bouton
d'envoi). Noé : *« si entrée marche mais ça ne me servira pas »*. Elle part donc
pour son inutilité, pas pour un défaut. **Ne pas la remettre.**

**3. Les propositions : à droite, puis sous la journée.** Elles gênaient en tête
de page, je les ai passées en colonne de droite le matin ; Noé les a ramenées
dans le fil, *« à la suite des tâches à faire, à publier, évènements »*. C'est
leur vraie place : une candidate se lit une fois qu'on a vu ce qui est déjà posé.

**4. Le fond de la tuile : trois valeurs.** `#121415` (plus sombre que la page —
elle s'enfonçait), `#1c1f20` (trop clair), enfin **`#191c1d`**. La borne à ne
jamais franchir : *elle reste plus claire que la page*.

**5. Les deux colonnes de la journée : supprimées, rendues.** Elles débordaient
à 1000 px ; j'ai repoussé le point de rupture, ce qui les faisait fusionner. Noé
a refusé — **je réglais l'étroitesse en supprimant le vis-à-vis, or c'est le
vis-à-vis qu'on voulait.** La bonne variable était la largeur de la colonne des
projets (300 → 220 px entre 960 et 1200), pas le moment où elle apparaît.

**6. Le nom de l'espace sur une tuile de projet : réduit trois fois**, jusqu'à
0,5 rem avec l'écartement monté à 0,14 em. C'est le plancher : en dessous, la
bonne réponse sera de retirer le mot et de garder la pastille.

**7. « Ce que je te proposerais » → « Ce que je te propose ».** Le hub propose.

### 0.4 LE FCH EST BLEU — l'exception devenue règle

Noé : *« la couleur du fch doit être le bleu, non le rouge »*. C'était la
**quatrième** demande : le calendrier et « Ta semaine » le 25 août, `#objectifs`
le 27, ici le 29 — toujours pour la même raison, *posé en aplat, le rouge du
club se lit comme une alerte, or le hub n'en a pas*. J'ai retourné la
déclaration de base et supprimé les trois surcharges.

**Ce que ça coûte** : le rouge était la seule couleur de ce nom dans la palette.
En bleu, la paire la plus proche devient FCH (212°) et perso (256°) — 44°
d'écart. `--club-fch-rouge` reste défini **sans aucun emploi**, comme seconde
couleur du club.

### 0.5 Ce qui a été vérifié, et comment

- **Les deux tâches automatiques**, sur trois événements créés puis supprimés :
  « Préparer » à J−2, « Trier les photos » à J+1, et **rien pour le perso** bien
  qu'il ait « photos » coché. **Trois ouvertures d'affilée : toujours une seule
  de chaque** — le rattrapage est rejouable.
- **Le bandeau** : « Clermont – Sochaux » puis, après « pas maintenant »,
  « Réunion CA » avec sa propre phrase et sa propre porte. Le lien suivi jusqu'à
  la fiche.
- **Le report et le menu**, sur une tâche créée pour ça : échéance au lendemain
  en base, priorité passée à 1, puis suppression.
- **La pastille « Photos »** sur les quatre espaces : visible au FCH et chez
  Yuno, cachée pour la formation et le perso.
- **Le glissement du rail** : la tuile centrée passe de la première à la
  troisième, le point actif suit.
- **`projetsEnCours` hors écran**, sur des projets fictifs : actif avec tâches,
  actif sans tâche, à l'année, idée, terminé — seuls les actifs sortent, et un
  projet créé le 1er juillet remonte en tête à 59 j.
- **Les largeurs**, à 375, 1000 et 1466 px, à chaque changement de mise en page.

### 0.6 Les défauts trouvés en chemin

- **`.barre` était déjà pris** par la barre de progression de la formation :
  la barre d'onglets héritait de `height: 6px` et `.barre span` peignait les
  trois traits du menu en un bloc. Deux défauts pour une collision de nom.
- **`min-width: auto` sur un élément de grille — TROIS FOIS** : la bande
  d'onglets, la colonne des projets (580 px dans un parent de 343), les deux
  colonnes de la journée (83 px hors de la tuile). Consigné en convention.
- **`ON CONFLICT` ne vise pas un index partiel** : PostgREST ne sait pas répéter
  le prédicat. L'index est passé en complet — deux NULL ne se heurtent jamais.
- **Une case à cocher ne peut pas être la source d'une pastille** : elle vaut
  « oui » cochée ou non, et le libellé affichait « oui » en permanence.
- **`data-si-espace` ne comprenait qu'une valeur** ; « Photos » en vaut deux.
- **Retirer `.bloc` d'un conteneur casse les listes de tâches** : elles sont
  habillées par `.bloc .liste-taches-pleine`. La tuile de la journée le garde.
- **Les deux portes du bandeau ne marchaient pas telles quelles** : le FCH
  attendait l'id d'une fiche, Yuno envoyait l'id vers `feuilleOuverte`. Les deux
  sites résolvent maintenant un id d'événement.

### 0.7 Ce qui a été écrit dans SES données

**Une seule chose reste** : l'humeur du jour (niveau 4), posée en vérifiant le
repli de la ligne de tête. Tout le reste a été nettoyé — trois événements
d'essai, deux tâches d'essai, un refus de bandeau. **90 tâches au départ,
90 à l'arrivée.**


## 0 ante septies. La session du 28 août (soir) — la navigation à DEUX RANGS

**Rien n'était commité en arrivant** : l'état des lieux du matin et
`yuno-spec.md` attendaient encore. Ils partent avec cette session.

**Le point de départ n'était pas une demande de forme, c'était une question de
structure** : « beaucoup d'informations en lien, beaucoup de données — comment
faciliter le lien entre les choses sans surcharger les pages ». La réponse a été
cherchée à trois, sur une page visuelle publiée et corrigée quatre fois avant
qu'une ligne de code soit écrite.

### 0.1 LA RÈGLE, et elle vaut plus que tout le reste de la session

C'est Noé qui l'a formulée, en corrigeant une première proposition qui
réduisait le nombre de pages :

> *« L'objectif n'est pas de réduire au maximum le nombre de pages, au
> contraire. Je veux continuer d'être riche en page, avec beaucoup de détails.
> Mais ces pages-là doivent être plus difficiles d'accès car elles sont le fruit
> d'une envie, d'un besoin ressenti, tandis que ce qui doit se voir tout de
> suite est le fruit de rien. »*

**Le coût d'accès d'une page est proportionnel à l'intention qu'il faut pour la
vouloir.** Quatre rangs :

| Coût | Ce qu'on y met |
|---|---|
| 0 geste | l'accueil — la journée, les pistes, la semaine, le cap gravé |
| 1 geste | les onglets — accueil, perso, calendrier |
| 2 gestes | le menu — six grands titres |
| 3 gestes | la flèche — les sous-pages, en accès direct |

**Ce que ça débloque, et c'est le point que la première proposition avait
manqué** : ce n'est pas une économie, c'est de la place. L'accueil portait tout
parce qu'il n'y avait nulle part où poser le reste. Dès qu'un second rang
existe, les pages du dessus peuvent maigrir **et** les pages du dessous peuvent
être aussi denses qu'on veut.

**Une chose que le menu ne fait PAS, et qu'il ne faut pas lui ajouter.** La
première version perçait les deux sites — « Le vivier » de Yuno à deux clics au
lieu de quatre. Noé l'a retirée :

> *« C'est normal qu'il soit long à accéder depuis le hub car ce n'est pas
> l'objectif, c'est indépendant. Si je clique sur le hub ce n'est pas pour
> atteindre le site Yuno et tout ce qu'il contient. »*

Chaque espace n'offre donc que **sa porte**, jamais les écrans qu'il y a
derrière. C'est aussi ce qui a fait sortir « son éditorial » du menu : les
38 idées du FCH et les 18 de Yuno vivent sur leurs sites.

### 0.2 La barre — trois onglets centrés, le menu à gauche

`Accueil · Perso · ▦` au milieu, les **trois barres horizontales** tout à
gauche. Les trois bilans d'espace et « Le cap » ont quitté la barre : les
ouvrir, c'est déjà avoir décidé quelque chose.

**Perso reste, et il est aussi dans le menu.** C'est voulu : on l'ouvre sans y
avoir pensé, mais ses quatre pages doivent s'atteindre comme celles des autres
espaces. Le hub existe pour servir Noé — la vie hors espaces ne passe pas après
les espaces.

**La barre est une GRILLE À TROIS COLONNES**, pas un rang. La troisième est vide
et fait exactement la largeur de la première : sans ce contrepoids, les onglets
seraient centrés dans la place qui *reste*, donc décalés vers la droite de la
largeur du bouton. C'est un centrage optique, il se paie en grille. Mesuré :
422 contre 423 à 845 px, 188 contre 188 à 375 px.

**Le bouton vit HORS de la bande qui défile.** C'est la leçon de la pastille
famille, apprise le 28 au matin : une chose en queue de bande n'existe pas.

### 0.3 LE DÉFAUT QUI EXPLIQUAIT « elle est pas belle » — une collision de nom

Noé : *« refais-moi la barre d'onglets, là elle est pas belle, trop petite, et
mets bien 3 barres horizontales »*. Il ne réagissait pas à un choix de forme,
**il voyait un bug** :

`.barre` était **déjà pris** — c'est la barre de PROGRESSION de la formation
(`js/formation.js`), déclarée plus bas dans la feuille, donc gagnante. La barre
d'onglets héritait de `height: 6px`, du fond `--accent-doux` et d'un
`overflow: hidden` ; et `.barre span` peignait les trois traits du menu en un
seul bloc d'accent haut de 100 %. **Deux défauts pour une seule collision.**

Elle s'appelle `.barre-onglets`, et le commentaire de `.bouton-menu span` garde
la trace pour qu'on ne refasse pas le chemin.

**Un second piège du même genre, trouvé en mesurant** : `aspect-ratio: 1` sur
l'onglet du calendrier déduisait sa hauteur de sa LARGEUR, donc du rembourrage
horizontal des onglets. Passé celui-ci à 24 px, l'icône a pris 66 px de côté et
a poussé toute la rangée avec elle. Elle a maintenant une largeur fixe, et le
sélecteur est **scopé à `.navigation`** — donc au hub seul : `ongletCalendrier`
sert aussi aux barres de Yuno et du FCH, qui ont leurs propres règles.

### 0.4 Les onglets — quatre signes pour dire lequel est actif

Réglé en quatre allers-retours avec Noé, chacun corrigeant le précédent :

1. plus grands (24 px de rembourrage) → **trop d'espace entre les onglets**
2. écart de la bande 8 → 4 px → **toujours trop**
3. le vrai coupable était le rembourrage resté à 24 px sur grand écran → 12 px
4. la graisse : 500 au repos → **« un peu plus gras »** → 600

État final : **Gilroy**, actif 17 px / 700, repos 14 px / 600, plus le fond
plein et l'encre inversée. **Quatre signes à la fois**, et ils glissent ensemble
en 180 ms.

**Pourquoi Gilroy et pas Instrument Sans** : celle-ci est déclarée de 400 à 600,
demander 700 la faisait clamper — l'écart plafonnait à 500/600 et ne se voyait
pas. Gilroy porte un vrai 700, et ses deux fichiers sont déjà déclarés
(`css/yuno.css`) et en cache : aucun fichier de plus.

**LE CENTRAGE VERTICAL — un réglage optique, pas une erreur.** Noé : *« le texte
bien centré au milieu de la pastille, actuellement il paraît un peu plus vers le
haut »*. La cause est réelle : `align-items: center` centre la LIGNE, or une
ligne réserve sous elle la place des jambages — et aucun de ces mots n'en a.
D'où `padding: 0.24em … 0` : le contenu descend de la moitié, soit 0,12 em.
**En em et non en pixels**, pour que la correction grandisse avec l'onglet
actif. Vérifié en agrandissant la pastille cinq fois avec son axe tracé en
rouge ; l'axe passait dans le tiers supérieur du mot, il passe maintenant au
milieu de l'encre.

Deux pièges écartés là aussi : la règle du grand écran utilisait le raccourci
`padding`, qui remettait le haut à zéro — elle est passée en `padding-inline`,
sinon le mot serait remonté **sur ordinateur seulement**, le genre de défaut
qu'on ne voit jamais en testant sur téléphone. Et l'onglet du calendrier garde
0 : une icône n'a ni ligne de base ni jambage.

### 0.5 Le menu — une colonne, six grands titres

Forme arrêtée par Noé après une première version en deux colonnes avec des
sous-textes : *« enlève les sous-textes, garde juste le titre, tout doit être
sur la même colonne »*. Le mot mène à la page, **la flèche** déplie ses
sous-pages. Une rubrique sans sous-page n'a pas de flèche — une flèche qui ne
s'ouvrirait sur rien serait un mensonge de forme.

Il **vole au-dessus d'un fond assombri**, avec `--rayon-tuile` : c'est la
grammaire de la tuile de capture, donc le même geste pour le refermer (le
bouton, le fond, Échap). Il tombe **à gauche, sous son bouton** — il s'ouvrait à
droite au début, ce qui obligeait l'œil à retraverser la barre.

Son bord haut se cale sur la hauteur **réelle** de la barre, posée par
`monterLeMenu` dans `--sous-la-barre` : le nombre en dur écrit d'abord a vieilli
dès le premier changement de taille d'onglet. La mesure est stable parce que le
fond est figé au haut de la page à l'ouverture (`figerLeFond`, dont le sélecteur
a été élargi au menu).

La rubrique de l'espace où l'on est **se déplie d'elle-même** : ouvrir le menu
depuis Yuno doit montrer les pages de Yuno, pas les faire chercher.

**Le nom des catégories, choisi par Noé.** La première proposition les rangeait
par question — « Ce qu'il y a à faire », « Où je vais », « Ce qui vient », « Ce
qui est fait ». Il a préféré **un grand titre transverse plus un par espace**,
et l'a nommé **« Général »** :

| Général | Objectifs · Projets · Tâches · Périodes · Le chemin |
| FC Hermitage | Ses objectifs · Ses projets · Ses tâches · Le site |
| Formation | Ses objectifs · Ses projets · Ses tâches |
| Yuno | Ses objectifs · Ses projets · Ses tâches · Le site |
| Perso | Les intentions · Les rendez-vous · L'humeur · Les victoires |
| Le temps | *(pas de sous-page)* |

**Perso n'a ni objectifs ni projets, et n'en aura pas** : l'espace perso ne
mesure rien, jamais. Ses tâches se lisent dans l'espace Tâches comme les autres.

**« Ce qui revient » a quitté le menu à la demande de Noé** — *« ce qui revient
doit être dans la page tâches »* — et il avait raison : 40 des 60 tâches à faire
sont des occurrences de séries. Les séries ne sont pas un sujet à part, c'est
**l'explication de la liste**. Les mettre ailleurs, c'était séparer les effets
de leur cause.

### 0.6 « Ses objectifs », « ses tâches » — la même page, son filtre posé

Ce ne sont **pas** de nouveaux écrans : c'est la page transverse avec son filtre
porté par l'adresse — `#objectifs/projets/fch`, `#taches/photo`. Un seul écran à
tenir, plusieurs portes pour y entrer ; cinq listes de tâches finiraient par ne
plus dire la même chose.

- **`#objectifs` se coupe en trois vues** (`caps`, `projets`, `periodes`), plus
  un espace en troisième niveau. Sans ce découpage, « Objectifs », « Projets » et
  « Périodes » auraient été trois liens vers le même écran.
- **La page s'appelle « Général »**, `<h1>` et titre du navigateur compris. Elle
  disait « Le cap » dans son `<h1>`, « Objectifs » dans l'onglet et « Général »
  dans le menu : trois noms pour une page, c'est un défaut, pas un choix. **« Le
  cap » reste le nom de l'ÉTAGE des objectifs**, qui a maintenant sa page.
- **`#taches/<espace>`** repose le filtre existant ; **`#perso/<vue>`** cache
  trois blocs sur quatre sans rien recharger ni rebrancher.

### 0.7 Deux pages neuves

**`#chemin` — Le chemin.** Le miroir de ce qui a été accompli, groupé par mois :
**47 victoires depuis décembre 2025** (Yuno 31, FCH 9, formation 4, perso 3). La
philosophie n° 1 dit que le hub est d'abord ce miroir ; il avait quitté
l'accueil le 13 août et n'existait plus nulle part. Au second rang, il est à sa
place : on l'ouvre quand on en a besoin, pas tous les matins.

**La source est UNIQUE — la table `victoires`.** Recompter les tâches faites à
côté donnerait deux chiffres pour un seul fait. *(À savoir : 30 tâches sont
faites mais 23 seulement ont une victoire, et 24 victoires viennent d'une source
`moment` que `CLAUDE.md` ne documente pas — le CHECK a été élargi sans que la
doc suive.)*

**`#temps` — Le temps.** Où partent les heures. **Il ne calcule rien lui-même** :
tout vient de `js/orientation.js`, qui reste éprouvable hors écran. Ce qu'il
affichait ce soir :

| FC Hermitage | 16 h 10 — sur place 7 h · traitement 3 h · rythmes 4 h 30 · ligne à ligne 1 h 40 · attendu 26 h · 8 sans durée |
| Formation | 0 h chiffré · attendu 15 h · 3 sans durée |
| Yuno | 4 h · 5 sans durée · **Perso** 1 h · 3 sans durée |

**Sa raison d'être tient dans sa première ligne : « 3 des 35 choses terminées
portent une durée ».** La fenêtre « combien de temps ça a pris ? » existe depuis
le 27 août et **rien n'a jamais rien fait de la réponse**. Une question dont la
réponse ne sert à rien finit par ne plus recevoir de réponse ; cette page est ce
à quoi elle sert. Sans ce chiffre en tête, un total bas se lirait comme une
semaine légère alors qu'il ne dit que le silence des durées.

**Aucun rouge, aucun seuil, aucun « trop ».** Le hub a retiré le 28 au matin la
question du dépassement d'une période — *« c'est LE BUT d'une période
d'intensité »* — et cette page ne la remet pas par la fenêtre. Elle montre la
mesure ; c'est le reproche qui était parti, pas le calcul.

> **`CLAUDE.md` disait « plus aucun écran ne l'affiche aujourd'hui ». Ce n'est
> plus vrai depuis ce soir**, et la phrase a été corrigée.

### 0.8 Ce qui a été vérifié, et comment

Le volet du navigateur a passé la moitié de la session à 41 px de haut : les
captures ne servaient à rien, **tout a été mesuré**.

- **Les 26 entrées du menu**, une par une, deux fois — après le menu, puis après
  la refonte de la barre. Toutes mènent quelque part, le titre du navigateur
  suit, aucun écran vide ni message d'erreur.
- **Les quatre routes de `#objectifs`** : 6 caps / 12 projets / 1 période,
  séparément et ensemble. **Les filtres** : `#taches/fch` → 50 tâches toutes
  FCH, `#taches/photo` → 24, `#objectifs/projets/formation` → 6, `/fch` → 6,
  `/photo` → **0**.
- **Le glissement des onglets joue vraiment** : à mi-course les deux mots sont à
  13,95 et 15,11 px — entre leur départ (15,94 / 13,13) et leur arrivée. Une
  bascule sèche aurait déjà donné l'arrivée.
- **Les cibles tactiles** : 2,75 rem partout. Les sous-pages du menu étaient à
  2,5 rem, soit 40 px — sous la règle des 44.
- **À 375 px** : aucun débordement, aucun défilement de travers, centrage exact,
  et ce sur les **trois** onglets actifs (l'actif étant le plus large, c'est le
  pire cas).
- **La barre de progression de la formation** a retrouvé ses 6 px et son fond
  teal après le renommage.

**Un piège d'outillage, à retenir** : `[data-projet]` compte quatre boutons par
tuile. Une première mesure a fait croire que le filtre des projets ne marchait
pas — il marchait. *Compter les tuiles, pas les éléments qui portent l'attribut.*

### 0.9 Un écran vide qui manquait

`#objectifs/projets/photo` n'affichait que « Poser un projet », sans un mot —
alors que c'est le vide le plus parlant du hub. Il dit maintenant : *« Aucun
projet pour Yuno. Un projet dit COMMENT on atteint un cap — et il peut n'en
servir aucun : de l'intendance, ça existe. »*

### 0.10 Ce qui a été retiré

Les **pochoirs** FCH et Yuno quittent `js/app.js` et `css/styles.css` : plus
d'onglet à habiller. Le mécanisme reste décrit dans `CLAUDE.md`, et git en garde
la trace — dans le menu, chaque espace porte sa pastille ronde, celle du FCH
coupée en deux comme partout ailleurs dans le hub.


## 0 ante octies. La session du 28 août (jour) — « Le cap », la barre en signes, le hub sombre

**Deux commits, tous deux poussés** — `00303b2` et `1854b55`. **Une migration**
appliquée : `projet_annuel`. `CLAUDE.md`, `docs/orientation-spec.md` et
`docs/yuno-spec.md` mis à jour. L'arbre est propre, `main` est au même point
qu'`origin/main`.

**La session a été conduite par l'œil de Noé, pas par une liste.** Une seule
demande a été posée au départ (la pastille famille) ; tout le reste est né d'un
échange serré — il regardait, il disait « trop gros », « trop de place », « plus
discret », et la forme se refaisait. D'où beaucoup d'allers-retours, et une § 0 ante ter, point 1
plus longue que d'habitude : ce sont eux qui portent le sens.

### 0.1 Les décisions qui ont fait un ALLER-RETOUR

**Ces six-là ont été posées puis renversées dans la même journée.** Une session
future qui les « corrigerait » en croyant bien faire referait un chemin déjà
parcouru.

**1. La question de la période : posée le 27, retirée le 28.** Déclarer deux
espaces *intenses* sur un mois faisait 45 h par semaine, et le hub demandait
« lequel des deux cède ? » — au moment où on l'écrivait, trois semaines avant le
mur. Le raisonnement tenait ; la prémisse, non. Noé : *« ça ne me sert à rien,
c'est LE BUT d'une période d'intensité, j'en fais plus que d'habitude ».* Une
troisième porte (« C'est voulu ») a été essayée pour permettre de l'assumer,
puis retirée avec le reste : **si la réponse est toujours la même, la question
ne valait pas d'être posée.** Elle a quitté ses DEUX écrans — `#objectifs` et le
rendez-vous du dimanche — parce que la laisser à l'un des deux, c'eût été la
déplacer et non la retirer. `tensionDeLaPeriode` reste entière dans
`js/orientation.js` : c'est la mesure qu'on garde, c'est le reproche qui part.

**2. Les périodes : en tête, puis en pied ; en tuiles, puis en deux lignes.**
Elles ouvraient `#objectifs` en cartes. Noé : « l'affichage de la période doit
être plus discret », puis « tout doit être sur 2 lignes max », puis « met la
période en dessous des objectifs ». Elles ferment donc la page, en encre
discrète, sans carte ni bordure — comme « Le cap » du tableau de bord est passé
sous la journée le 13 août, et pour la même raison : **on relit ce qui cadre
quand on lève la tête, pas en ouvrant l'application.**

**3. Les pistes du matin : trois formes en une heure.** Cartes à barre de
couleur (la grammaire que `.bloc li` pose sur toute liste), puis tuiles de la
galerie du cap, puis **une ligne chacune**. Les tuiles disaient juste mais
coûtaient trois cents pixels : *« on met trop de temps à arriver au
calendrier »*. Une piste n'est pas un cap — c'est une suggestion qu'on prend ou
qu'on écarte en un geste. Les mots des boutons sont devenus des signes (« + »,
calendrier, croix), leur phrase vivant dans `title` et `aria-label`.

**4. L'état d'un projet : trois places, deux jeux de couleurs.** D'abord une
étiquette pleine dans le pied de la tuile, puis en haut à droite, enfin **à côté
du nom de l'espace** — les deux signes qui CLASSENT un projet se lisent d'un même
regard, et le titre garde sa ligne. Les couleurs ont suivi le même chemin : le
rouge → ambre → vert d'une publication d'abord, puis **gris, bleu, vert** à la
demande de Noé. La raison vaut d'être gardée : une publication traverse un cycle
de fabrication où le rouge dit « rien n'est encore fait » ; **un projet pas
commencé n'est pas en défaut, il attend son tour.**

**5. La teinte de fond des tuiles : 11 %, 7 %, puis 5 %.** Noé a regardé les
trois. À 5 % la teinte ne se nomme pas, elle se sent — deux tuiles voisines ne se
ressemblent plus tout à fait, et rien n'a l'air coloré. **Ne pas la remonter en
la croyant timide.**

**6. Le filtre par espace de la galerie : ajouté, puis retiré une heure plus
tard.** Il remplaçait le groupement de l'ancienne page. Dès que le tri par espace
est arrivé (FCH → formation → Yuno), il ne cachait plus rien qu'on ne voyait
déjà : six tuiles s'embrassent du regard.

### 0.2 La pastille famille — le premier trou de l'orientation, bouché

C'était le point 9 de la reprise précédente, et le plus urgent : la colonne
`famille` existait depuis le 27 et **rien ne l'écrivait**, donc le plancher perso
comptait zéro partout et le rendez-vous disait « Rien pour toi cette semaine »
même quand c'était faux.

La pastille n'apparaît que lorsque l'espace choisi est perso, et **juste derrière
la pastille d'espace** — la bande défile, une pastille en queue n'existe pas
(c'est la leçon de la durée d'une tâche, apprise le 27). Quatre valeurs : *le
corps · le calme · le lien · l'intendance*, la quatrième étant la plus
importante — sans elle les planchers se rempliraient de corvées.

**Quatre portes l'écrivent**, toutes essayées et relues en SQL : la tuile de
l'espace Tâches (création et réouverture), la tuile du calendrier et du « + » de
l'accueil (tâche **et** événement), le formulaire « Ajouter un rendez-vous » de
`#perso`, et le formulaire de modification du calendrier. Les propositions du
dimanche arrivent déjà rangées (`creer: { famille: 'corps' }` existait depuis le
27, sans destinataire). Hors perso, l'écriture l'efface — même règle que le type
de moment chez Yuno.

**Un défaut trouvé en passant** : dans « Aujourd'hui », rouvrir une tâche et
l'enregistrer **perdait le projet choisi** — `projet_id` était absent de la liste
des champs modifiés, alors que la tuile offrait la pastille. Choisi à l'écran,
jeté à l'écriture.

### 0.3 La barre passe aux signes, et le hub devient sombre

**Trois mots, puis des signes.** Accueil, Tâches et Perso gardent leur mot — ce
sont les vues du quotidien, et un mot se vise mieux qu'un signe à reconnaître.
Les cinq autres sont des signes : boussole (Le cap), calendrier, chapeau
(formation), et **les deux marques en POCHOIR** — `fch-logo-pochoir.png` et
`yuno-signature.png` posés en `mask`, l'encre venant de `currentColor`. Un logo
prend donc la couleur de son onglet, discret au repos et inversé quand il est
actif, au lieu de traîner un fond de sticker. C'est la mécanique que le site FCH
utilisait déjà pour son onglet d'accueil.

**Le hub n'a plus de thème clair** (décision de Noé). Les six blocs
`prefers-color-scheme` ont été fondus dans les valeurs de base : il n'en reste
aucun dans `css/styles.css`. Une seule palette à tenir au lieu de deux, celle du
soir — qui est l'heure où le hub s'ouvre. Deux corrections que ça imposait :
l'accent par défaut était resté celui du jour, et « Se connecter » écrivait en
blanc sur un accent devenu clair.

**Trois écritures de forme, notées parce qu'elles se reperdent :** un `color-mix`
qui reçoit un dégradé jette la déclaration entière (d'où
`--couleur-espace-pleine` et non `--couleur-espace` pour la teinte des tuiles —
le piège avait déjà coûté une soirée au calendrier le 21 août) ; `.choix-champ`
traîne la marge basse des formulaires, qui décalait l'état d'une tuile de douze
pixels ; et `.cap-tuile` porte `display: flex` en fin de feuille, donc toute
règle de même spécificité écrite plus haut perd.

### 0.4 « Le cap » — l'espace Objectifs remplacé par deux galeries

Né d'un **échantillon** monté sur deux caps réels (`Atteindre 1 000 abonnés`,
`Être accrédité à la CAN 2027`), validé, puis **retiré une fois généralisé** :
deux copies de la même forme finissent par diverger, et git garde la trace.
L'adresse n'a pas bougé — `#objectifs` — parce qu'un favori se casse et pas un
nom. Le titre de la page, lui, dit « Le cap ».

Ce que la page tient, en trois niveaux jamais quatre :

- **La galerie ne dit que ce qui se compare** : espace, titre, une rangée de
  marches (un segment par jalon), les comptes, l'échéance. Le titre porte seul le
  poids (Clash 700) ; l'espace passe en encre discrète, et sa couleur se dit par
  la pastille et par le fond teinté. Tri **FCH → formation → Yuno**, l'ordre des
  journées de Noé, puis le plus proche d'abord.
- **On n'ouvre pas une autre page** : la tuile pressée prend toute la largeur et
  se déplie sur place, comme un jour de « Ta semaine » s'ouvre en grand.
- **Les séries se replient** : les 8 occurrences d'« Anniversaires du mois » font
  UNE ligne — *toutes les deux semaines · 8 fois à venir · demain*.
- **Une seconde galerie dessous : les projets.** Elle montre ce que le dépliage
  d'un cap ne montrait pas — ceux qui ne servent aucun cap (« Album du club »,
  « Suivi de l'alternance »), invisibles depuis leur création donc oubliés. Leur
  détail le dit sans reproche : *« Aucun cap déclaré — c'est de l'intendance, et
  c'est légitime. »*
- **Ajouter et modifier ouvrent la tuile volante du hub**, avec tous les détails
  (`construireFormulaire`) ; ce qui est irréversible demande confirmation **sur
  place**, dans le menu à trois points.

**L'avancée n'a pas la même forme aux deux étages, et c'est voulu** : un cap
franchit des MARCHES (un segment par jalon, on les compte du regard) ; un projet
avance tâche après tâche, d'où une barre unique — quinze segments seraient du
bruit. Un projet **à l'année** ou **terminé** échappe aux deux : le premier n'a
pas de ligne d'arrivée (trait pointillé), le second a sa barre pleine même s'il
reste des tâches — c'est l'état posé qui dit la vérité, pas le décompte.

**Quatre états de projet**, dont un nouveau : *Pas commencé* (`idee`) · *En
cours* (`actif`) · **À l'année** (`annuel`, migration du jour) · *Terminé*
(`termine`). « À l'année » est un **second état d'en cours** : certains projets
ne finissent pas — « Programmation de la semaine », « Anniversaires du mois »
sont des rythmes, et la table le savait déjà (`charge_hebdo` et non
`charge_minutes`) ; il leur manquait le mot. Même rang au tri, même bleu, seul le
mot change. `en_pause` et `abandonne` restent acceptés par le CHECK mais ne sont
plus offerts.

**Ce qui a été porté sans rien perdre de l'ancienne page** : les périodes (avec
leur modification, qui n'existait pas), les projets et leurs trois chemins de
rattachement, l'argent de « Rembourser mon matériel » (prestations + matériel),
et tous les gestes de jalon. **Un geste a été ajouté et a demandé une fonction
d'API** : `supprimerVictoireDuJalon` — la galerie permet de **revenir** sur un
jalon, ce que l'ancienne page ne savait pas faire, et une victoire pour une
marche non franchie serait fausse.

### 0.5 Ce qui a été vérifié, et comment

Tout a été essayé dans le navigateur **et relu en SQL** — la base est celle de
Noé, il n'y a pas de bac à sable :

- la **famille** écrite et corrigée sur les quatre chemins (tâche `calme` puis
  `lien` ; événement `corps` puis `calme`), puis les lignes d'essai supprimées ;
- un **jalon** coché puis décoché : `atteint`/`date_atteint` posés puis remis à
  nul, victoire créée puis retirée ;
- un **projet** posé depuis la galerie **sans cap** (`cibles: 0`), puis supprimé ;
- les **états** changés depuis la tuile, y compris « à l'année » ;
- la **barre** vérifiée sur les trois entrées, en 390, 800 et 1160 px.

**Les données de Noé sont revenues à leur état d'origine** partout où j'avais
écrit pour essayer. Deux exceptions, et ce sont ses gestes à lui, faits pendant
la session : un arbitrage « c'est voulu » sur « La rentrée » (avant que la
question ne disparaisse — la trace reste sans effet), et « Équipe com avec Lina »
passé en *pas commencé*.

**`tools/verifier-coquille.js` a trouvé cinq oublis** : `img/fch-logo-pochoir.png`
(que la nouvelle barre exige) et quatre modules absents depuis la veille —
`objectifs.js`, `objectifs-commun.js`, `orientation.js`, `rendez-vous.js`. La
coquille est passée en **v3**.

## 0 ante nonies. La session du 27 août (après-midi et soir) — l'orientation, de bout en bout

**Onze commits, tous poussés** — de `a98a9c2` à `df51a4f`. **Huit migrations**
appliquées : `renommage_projet_espace`, `series_occurrences`, `projets`,
`periodes`, `famille_perso`, `semaines`, `refus_propositions`, `arbitrages`
(plus `publications_duree`, appliquée sans fichier puis reprise dans
`taches_duree`). `CLAUDE.md` mis à jour, **`docs/orientation-spec.md` créé** —
il fait désormais autorité sur la façon dont le hub oriente Noé, comme les deux
cahiers des charges sur leurs sites. L'arbre est propre, `main` est au même
point qu'`origin/main`.

**La session a commencé par une conversation, pas par du code.** Noé voulait
que le hub l'oriente chaque jour et chaque semaine vers ce qui sert ses
objectifs, en équilibrant le professionnel et le personnel, et en disant si un
objectif est trop ambitieux — **sans le transformer en exécutant** : « le piège
serait que l'IA me fasse tout mon programme de tâches et que je sois un simple
exécutant, j'en perdrais le plaisir ». Trois tours de questions ont produit la
spec ; les huit étapes de son § 12 ont ensuite été faites dans l'ordre.

| # | Étape | Ce qu'elle a donné |
|---|---|---|
| 0 | Renommer `projet` → `espace` | 477 lignes, 6 tables, `js/espace-projet.js` devient `js/gabarits.js` |
| 1 | Occurrences réelles des récurrences | table `series`, `serie_id`, curseur `genere_jusqu_au`, 67 occurrences posées |
| 2 | La durée au moment de cocher | fenêtre à confirmer, `publications.duree` |
| 3 | La table `projets` | `projets`, `projets_cibles`, `projet_id` sur trois tables |
| 4 | Les périodes | `periodes`, régimes, et l'arbitrage **au moment où on déclare** |
| 5 | Le calcul, sans écran | `js/orientation.js` — ne touche ni au réseau, ni à la session, ni au DOM |
| 6 | Le rendez-vous du dimanche | `js/rendez-vous.js`, table `semaines` |
| 7 | Le vivier et les trois propositions | `propositionsDuMatin`, `refusee_le` |
| 8 | L'arbitrage et sa trace | table `arbitrages`, portée, « Revenir dessus » |

Plus, en fin de session : le calendrier qui **cesse de dessiner les durées**, et
les **trois chemins de rattachement** d'une tâche à un projet.

### 0.1 Les décisions qui ont fait un ALLER-RETOUR

**Ces trois-là ont été posées puis renversées dans la même journée.** Une
session future qui les « corrigerait » en croyant bien faire referait un chemin
déjà parcouru.

**1. La répétition : la ligne qui avance est morte.** Le matin même, une tâche
répétée était *une ligne unique* dont la coche faisait glisser l'échéance — et
c'était juste dans son modèle, sinon « Courir » aurait été fait à jamais après
une seule course. Noé a demandé l'inverse l'après-midi : « il faut qu'ils soient
indépendants les uns des autres, pas avancé lorsque l'une est faite, je dois
pouvoir en supprimer un sans que ça supprime les autres ». **Chaque occurrence
est maintenant une vraie ligne.** Ne pas remettre l'avancement : ce n'était pas
la règle qui était fausse, c'était le modèle — rien ne gardait la trace de ce
qui avait été fait, donc aucun rythme n'était mesurable.

**2. La durée : de l'incrustation discrète à la fenêtre à confirmer.** Première
version : une bande sans fond, sans bouton, qui s'effaçait au bout de dix
secondes. Noé : « la tuile doit avoir le même mécanisme que lorsque l'on ouvre
une tuile en appuyant sur le plus. Le fond s'assombrit et on doit confirmer pour
que la tâche soit considérée comme faite ». **Cocher est devenu une intention**,
pas un fait acquis. Puis, dans le même mouvement : « on doit garder l'option
passer quand même, ne pas avoir l'obligation d'ajouter une durée » — d'où trois
issues et non deux. Ne pas revenir à l'incrustation, ne pas retirer « Passer ».

**3. Le calendrier ne dessine plus les durées.** La hauteur proportionnelle des
barres avait été posée le matin même (« la barre de la tâche prend la hauteur de
sa durée »). Le soir : « supprime l'affichage de la durée dans le calendrier, il
faut pas qu'il y ait trop d'info ». C'était **la seule façon** dont le calendrier
montrait un temps — pas un texte, une hauteur — et en vue semaine un
entraînement de quatre heures mangeait la colonne. **Ne pas la remettre.** La
durée reste sur la ligne et alimente le compte des heures.

### 0.2 Les décisions qui posent une règle

- **Le mot « projet » a changé de sens.** Les quatre domaines s'appellent des
  **espaces** ; « projet » nomme l'étage entre le jalon et la tâche. La raison
  est un fait mesuré : **une tâche sur trente-six** était rattachée à un
  objectif — on demandait un lien impossible à faire, « trier les photos U15 »
  ne sert pas *directement* « 1 000 abonnés ».
- **Une seule colonne de durée**, prévue et réalisée confondues, ajustée après
  coup (« j'ajuste en fonction du temps réel que ça m'a pris si j'avais déjà
  noté un temps prévu »). **Ne pas en ajouter une seconde.** Contrepartie
  assumée : sans trace de l'estimation d'origine, le hub ne saura jamais que
  Noé sous-estime.
- **L'humeur reste seulement observée.** Elle ne module aucune charge — Noé l'a
  choisi contre trois autres options. **Ne pas la brancher sur le calcul** : le
  jour où répondre « 2 » allège la journée, la réponse cesse d'être honnête.
  Conséquence : le seul signal qui reste sur l'état du jour est **le refus**,
  d'où « Pas aujourd'hui » et la colonne `refusee_le`.
- **Il pose la question, Noé tranche.** Choisi contre « il peut décaler », « il
  signale sans proposer » et « il peut mettre en pause ». Le hub propose **deux
  portes**, jamais une décision.
- **Quotas + vivier à piocher**, contre une semaine pré-remplie : « le hub
  décide des proportions, Noé décide du contenu ». C'est la parade au piège de
  l'exécutant, et elle explique la forme de tout le reste.
- **Le suivi de l'alternance est en espace FCH**, pas formation : ses heures
  pèsent donc sur le quota de 20 h du club, pas sur la courbe des dossiers.
- **Le terrain est PÉRISSABLE, pas contraint** (correction de Noé : « le terrain
  FCH est modifiable également, je n'ai pas d'obligations »). Un visuel non fait
  mardi se fait mercredi ; un entraînement non couvert mardi n'existera jamais.
- **Et le terrain FABRIQUE l'atelier.** Sa précision sur septembre a démoli une
  règle que j'avais posée à l'envers : une soirée d'entraînement, ce sont des
  photos à trier et des gens à relancer. **Le terrain se paie deux fois**, la
  seconde avec quelques jours de décalage. C'est la règle la plus prédictive du
  système.
- **La charge du club se SOMME PAR PROJET**, pas par une formule. Sa remarque
  — « je n'aime pas la vision trop simpliste du FCH » — a montré que « terrain +
  traitement + tâches » traitait tout ce qui n'est pas du terrain comme sa
  conséquence. Faux : la programmation, les présentations, les appels ont leur
  propre moteur.
- **Ajouter du contenu ouvre une tuile volante** — les dix-sept formulaires du
  site d'un coup, écrit dans `construireFormulaire`.

### 0.3 Les chiffres de Noé

Tous donnés par lui, tous inscrits dans `js/orientation.js` ou en base. **Ce ne
sont pas des estimations à recalculer.**

| Ce que c'est | Valeur |
|---|---|
| Quota FCH | **20 h/semaine**, avec compte courant (le surplus se rend, pas forcément la semaine d'après) |
| Quota formation | **~15 h/semaine** — pour remplir les 35 h d'alternance |
| Capacité d'alternance | **35 h** — la seule enveloppe fermée : club et formation y jouent à somme nulle |
| Yuno | **aucun quota** — « surtout du bonus », mais « quelque chose qui me fait du bien » |
| Perso | **3 séances de corps**, 1 de calme, 1 de lien par semaine — un **plancher**, jamais un quota |
| Traitement d'une séance terrain | **1 h 30, par séance** et non au prorata des heures — le tri dépend du volume de photos |
| Dossier de formation | **25 h** (×4) · vidéo **6 h** · QCM **6 h** — soit 112 h sur 14 semaines |
| Programmation de la semaine (FCH) | **4 h/semaine** |
| Anniversaires du mois (FCH) | **1 h par quinzaine** (stocké 30 min/semaine, moyenne hebdomadaire) |
| Présentation d'une catégorie | **2 h** (×7 = 14 h) |
| Tri d'une séance | **1 h 30, en une fois** — « tout dépend du volume » |

**Ce que ces chiffres disent**, et que le hub sait maintenant dire tout seul :
le volume de la formation ne fait pas peur — **112 h sur 14 semaines, soit 8 h
par semaine**. C'est la *forme* du calendrier qui coince : deux dossiers dos à
dos du 15 octobre au 15 novembre. **Toute heure de formation non faite en
septembre se retrouve à la mi-novembre.**

### 0.4 Les six projets du FCH, arrêtés avec Noé

Inventaire fait avec lui, à partir d'une liste déduite des données qu'il a
corrigée : **Présentation des catégories · Programmation de la semaine**
(regroupe la programmation foot à 5/8/entente **et** les visuels de la semaine)
**· Anniversaires du mois · Album du club · Équipe com avec Lina · Suivi de
l'alternance.**

Deux décisions moins évidentes qu'elles n'en ont l'air :
- **pas de projet « couverture des entraînements »** — le terrain est une
  *source*, pas un travail : chaque séance se rattache au projet qu'elle sert ;
- **les réunions ne forment pas un projet** — elles se dispersent dans ceux
  qu'elles servent. Seul le suivi de l'alternance en fait un, parce que là les
  réunions **sont** le travail.

*Partenariats et autres réunions : à définir plus tard, décision de Noé.*

### 0.5 Ce qui a été vérifié, et comment

**Hors ligne, sur ses vraies données** — c'est la règle posée pour tout ce qui
oriente : un diagnostic qu'on ne peut pas éprouver hors écran est un diagnostic
qu'on croit sur parole.

- `node tools/essai-diagnostic.mjs <fixture.json> [date]` fait tourner le
  diagnostic d'une semaine sur un instantané. **Pour la semaine du 31 août il
  sort 17 h de club et 11 h 42 de formation — exactement les chiffres établis à
  la main avec Noé en début de session.** C'était le seul test qui comptait.
- la génération des séries (cadences, aucun doublon sur le jour de départ), la
  traduction d'une occurrence en colonnes, la tension d'une période sur cinq
  régimes, la trace d'arbitrage sur quatre cas (avant, dans la portée, hors
  portée, autre question), la coupe du vivier, la séparation des séries dans
  « À faire ».

**À l'écran, dans son hub**, et à chaque fois remis en état après :
- cocher l'occurrence du 14 décembre laisse les quinze autres intactes ;
- annuler la fenêtre de durée n'écrit rien, confirmer écrit statut + durée +
  victoire, **passer termine en laissant la durée déjà notée** ;
- déclarer une période intense fait apparaître la question, prendre la porte
  fait redescendre le régime **et écrit la trace**, « Revenir dessus » rend la
  question posable ;
- le rendez-vous du dimanche (soir simulé) : sept lignes, sept gestes,
  « Caler une séance » ouvre la tuile remplie, « C'est ma semaine » le referme ;
- « Pas aujourd'hui » écarte la proposition et la suivante prend sa place.

### 0.6 Les défauts trouvés et réparés en passant

- **La substitution `projet → espace` a mordu à l'intérieur d'un mot** : la
  règle « ce projet → cet espace » transformait « espa**ce projet** » en
  « espacet espace ». Sept commentaires, tous corrigés.
- **Deux inférences fausses** : le hub annonçait « 850 abonnés » comme un
  maillon à l'abandon alors que **trois projets le servaient** — il ne regardait
  que les projets visant le *jalon*, pas ceux visant l'*objectif*. Une
  inférence fausse coûte plus cher qu'une inférence manquante.
- **Le filtre du refus s'était posé dans la mauvaise boucle** — celle des
  inférences au lieu du vivier, deux boucles identiques dans le même fichier.
  Le refus n'avait aucun effet, et ça ne se voyait qu'en cliquant.
- **Les menus dessinés de l'espace Objectifs n'étaient branchés nulle part** :
  `brancherChoix` n'y était pas appelé, les boutons d'intensité existaient et
  n'écoutaient rien. Même défaut que les ronds de publication en août, même
  cause : un composant qui se dessine sans demander s'il sera écouté.
- **`.bloc li` a repris la main sur trois grilles** (projets, rendez-vous,
  périodes) : à spécificité égale c'est elle qui gagne, et les gestes se
  retrouvaient à droite de leur texte. Parade : préfixer par la liste.
- **L'instantané d'orientation restait périmé après un refus**, ce qui faisait
  revenir la proposition écartée.

### 0.7 Ce qui a été écrit dans SES données

Tout ce qui suit est réel, pas du test. Ce qui était du test a été retiré
(périodes d'essai, arbitrages d'essai, semaine validée d'essai, refus d'essai,
durées d'essai, tâche « ESSAI »).

- **67 occurrences de séries** posées par la conversion des cinq séries qui
  existaient. L'espace Tâches est passé de 36 à 72 lignes — c'est le coût
  visible du modèle, et il a fallu la coupe de « À faire » pour le rendre
  supportable.
- **Six projets FCH**, quatre cibles (les trois éditoriaux vers « 1 000
  abonnés », l'équipe com vers « une com qui tourne sans moi ») et **62 lignes
  rattachées par correspondance de nom**. Ce sont des **propositions**, pas des
  faits : *Album du club* et *Suivi de l'alternance* ne servent aucun cap
  déclaré, faute d'avoir voulu deviner.
- **Six projets formation** chiffrés (25 h par dossier, 6 h la vidéo, 6 h le
  QCM), chacun relié à son jalon. Sans charge, la courbe d'atterrissage n'avait
  rien à calculer.
- **Un rattachement laissé en démonstration** : « Trier les photos U15 et
  seniors » → **Album du club**. Il est juste, mais il vient de moi.

**Un fait non attribué, à lui demander** : la tâche « Contacter l'entreprise de
Cedric Facebook » porte une **durée de 5 minutes**, statut actif, sans heure.
Elle n'a pas été écrite volontairement et Noé pilotait le hub en parallèle —
il a d'ailleurs terminé « Terminer résumé 4 et faire mind-map » en cours de
session, ce qui a un moment fait croire à un défaut.


## 0 ante decies. La session du 27 août (matin) — la répétition partout, la journée entière, un geste unique

**Quatre commits, tous poussés** : `d069884` (publications répétées + durée des
tâches), `bde6e7a` (`graphify-out` ignoré), `3c4591d` (« Aujourd'hui » porte la
journée + la durée sous l'heure), `c821aad` (Gilroy dans la grille). **Deux
migrations** appliquées : `publications_recurrentes`, `taches_duree`.
`CLAUDE.md`, `yuno-spec.md` et `fch-spec.md` mis à jour en fin de session.
L'arbre est propre, `main` est au même point qu'`origin/main`.

La session a commencé sur une demande simple — « la répétition pour les
publications aussi » — et **sept demandes de plus** l'ont conduite ailleurs,
chacune venue après avoir vu la précédente à l'écran. C'est son mode de travail :
il regarde, il essaie, il change d'avis. Ce qui suit dit où l'on est arrivé,
**et par où l'on est passé** — trois formes de « Aujourd'hui » ont été proposées
avant la bonne, et une session future qui reproposerait les deux premières
referait un chemin déjà fait.

**Les huit demandes, dans l'ordre où elles sont venues** — l'écart entre la
première et la dernière dit tout de la méthode :

| # | Demande | Ce qu'elle a donné |
|---|---|---|
| 1 | « la répétition pour les publications » | § 1 |
| 2 | « et la durée pour les tâches » | § 1 |
| 3 | « la durée à la main en minutes, propositions de 1 h à 3 h » | § 1 |
| 4 | « pour les événements : pas de 30 min, 1 h à 4 h, ou toute la journée » | § 1 |
| 5 | « Aujourd'hui : aussi les événements et les publications » | § 2 |
| 6 | « la durée doit être disponible partout » | § 3 |
| 7 | « l'état d'une publication : pareil sur les trois calendriers » | § 4 |
| 8 | « les titres des barres en Gilroy » | § 5 |

### 1. Les publications se répètent, et les tâches ont une durée

Quatre demandes enchaînées (1 à 4 du tableau), la troisième et la quatrième
venues APRÈS avoir vu les deux premières à l'écran.

**La répétition des publications.** Mêmes colonnes que la tâche et l'événement,
même dépliage. La règle importante est celle qui vient de la tâche, et elle vaut
qu'on ne la « corrige » pas : une publication porte **un seul** `statut`, donc
**une publication répétée ne se termine pas** — la faire partir avance sa
`date_prevue` d'une occurrence et la ramène au **premier état de son cycle**
(« à préparer » au club, « idée » chez Yuno). La rubrique du lundi suivant
attend déjà sur son jour. Écrite **une seule fois**, dans `passageDePublication`
(`js/calendrier-commun.js`) : quatre écrans font avancer une publication, et
quatre copies de la règle se seraient contredites.

*Conséquence assumée* : une publication récurrente ne reste jamais en « publié »,
donc **le compteur « publications sorties » du bilan FCH ne la voit pas passer**.
Le hub ne garde pas la trace des parutions d'une série, comme il ne garde pas
celle des occurrences d'une tâche répétée. Si Noé veut ce compte un jour, il
faudra une trace — pas un changement de la règle.

**La durée d'une tâche.** Colonne `duree` en **minutes**, facultative, et qui ne
vaut qu'avec une heure. Noé a explicitement demandé de **la taper à la main** :
les propositions (1 h → 3 h) ne sont qu'un raccourci, pas la liste des valeurs
possibles. Le champ est bâti **une fois**, dans `champDuree` (`js/gabarits.js`),
et les deux tuiles qui le posent — l'espace Tâches et le calendrier — s'en
servent telles quelles. Ce qu'elle change à l'écran : en vue semaine, la barre
d'une tâche prend la hauteur de sa durée, comme celle d'un événement.

**Les durées d'un événement ont changé** (demande de Noé) : plus de 30 minutes,
de **1 h à 4 h**, plus **« Toute la journée » qui vaut 9 h**. Neuf heures parce
qu'il faut un nombre — c'est la hauteur de la barre. À ne pas confondre avec un
événement **sans heure**, qui tient le jour sans occuper de créneau : celui-là ne
passe pas par les durées.

Les défauts trouvés en chemin sont rassemblés en fin de section.

### 2. « Aujourd'hui » porte la journée entière

Le bloc ne montrait que les tâches ; il montre aussi ce qui doit **partir** et
les **rendez-vous** (demande de Noé). Trois allers-retours pour trouver la
forme, et c'est la troisième qui tient — les deux premières sont écrites ici
pour qu'on ne les repropose pas :

1. une seule liste dans l'ordre des heures → écartée ;
2. trois groupes empilés → écartée ;
3. **deux colonnes** : les tâches à gauche, seules ; **à publier** puis
   **rendez-vous** à droite. Sur téléphone tout s'empile dans le même ordre.

Ce que chaque groupe retient, et pourquoi les bornes diffèrent : une
**publication** compte si elle est prévue aujourd'hui **ou l'était déjà** et
n'est pas partie — c'est la règle des tâches, mot pour mot. Un **rendez-vous**
ne compte que s'il **couvre** aujourd'hui : un événement passé n'est pas en
attente, il a eu lieu, et le traîner en tête de page serait le reproche que ce
hub ne fait jamais.

Les gestes suivent la nature : le rond d'une publication **avance d'un cran**
(le même attribut qu'au calendrier, donc rien à rebrancher), un rendez-vous
porte son **heure** à la place de la marque et **ne se coche pas**. Un groupe
vide disparaît en entier, titre compris ; une colonne vide aussi, et l'autre
prend toute la largeur.

**Le recoupement avec « Ta semaine » est volontaire** : la journée en cours
figure aux deux endroits. Le bloc dit *ce qu'on fait* et porte les gestes ; la
grille dit *la forme de la semaine* et se glisse. Ce n'est pas un doublon à
corriger.

Un détail qui a demandé un second endroit : une publication **en retard** est
dans le bloc du jour mais **pas** dans la grille de la semaine — l'ouverture de
sa tuile cherche donc dans les deux listes, sinon elle ne s'ouvrait pas.

### 3. La durée d'une tâche, là où on la cherche

Noé ne la trouvait que dans l'espace Tâches. Elle était pourtant offerte
partout — mais **sixième pastille sur six**, dans une bande qui DÉFILE : hors
de l'écran, donc inexistante. Elle est descendue dans le panneau « Quand », sous
l'heure, comme dans l'espace Tâches : même question, même endroit, et la
dépendance devient évidente puisqu'une durée ne vaut qu'avec une heure. La
pastille dit désormais le créneau entier — « aujourd'hui, 14:30 · 1 h 30 ».

Leçon générale, pour la prochaine pastille : **une bande qui défile n'est pas
une liste, c'est une file d'attente.** Ce qui compte se met dans un panneau
qu'on ouvre déjà, pas au bout de la bande.

### 4. L'état d'une publication : le même geste sur les trois calendriers

Le rond et la pastille d'état ne marchaient que sur le hub. Sur les deux
**sites**, le rond était pourtant DESSINÉ — la barre est commune, et
`signeEnHtml` ne demande à personne s'il sera écouté — mais rien ne l'écoutait :
l'appui traversait jusqu'à la barre et ouvrait la tuile. Un bouton mort qui
avait l'air vivant. La pastille d'état, elle, n'était même pas offerte
(`statutModifiable` restait à faux).

Le geste est désormais écrit **une seule fois**, dans `brancherEtatPublication`
(js/calendrier-commun.js), et les quatre écrans l'empruntent : accueil, espace
Calendrier, site Yuno, site du club. Deux copies ont disparu au passage.

**En phase de CAPTURE, et c'est la condition pour que ça tienne.** Le rond vit
dans la barre, qui porte `data-element` et ouvre le détail. En bulle, lequel des
deux gagne dépend de qui a posé son écouteur en premier — c'est exactement
l'erreur qui avait laissé le rond inerte dans l'espace Calendrier du hub. En
capture, celui-ci passe d'abord partout, quel que soit l'ordre de montage.

Au passage : l'espace Calendrier n'avait **aucun moyen de dire qu'une écriture
avait échoué** — le retour en arrière se faisait en silence, ce qui fait de
l'affichage optimiste un mensonge (js/ecriture.js). Il a maintenant sa ligne,
distincte de celle de l'échec de chargement : l'une annonce une page vide,
l'autre un geste revenu en arrière.

### 5. Gilroy dans la grille du calendrier

Le **titre d'une barre** — et lui seul — est en Gilroy 700, dans les trois
calendriers. Ce qui a décidé de la portée exacte : **les signes** (○ ◐ ◉ ▲ △ ▸
↗) vivent dans le même conteneur que le titre, et **Gilroy ne les dessine pas**.
Les y faire passer aurait fait retomber chaque glyphe, un par un, sur une police
de secours choisie par le navigateur — avec sa taille et son aplomb : le rond
d'une tâche aurait changé de forme selon la machine. La règle est donc posée sur
`.cal-barre-titre`, jamais sur `.cal-barre-element`. **Ne pas la remonter.**
L'heure reste en Geist Mono ; elle situe, elle ne se lit pas comme un texte.

Aucun fichier de plus : Gilroy est déclarée dans `css/yuno.css` — chargée par
les trois pages d'entrée — et son Bold est déjà dans la liste du service worker.
Mesuré : seul le poids 700 se charge, les quatre autres restent `unloaded`.

**Le site du club suit, et c'est voulu** : `css/fch.css` dit explicitement qu'il
« reprend les polices du hub ». Il change donc par sa propre règle, pas par
débordement. Yuno ne bouge pas — son corps de texte est déjà Gilroy, ses barres
l'étaient par héritage ; la règle ne fait que l'écrire.

### Ce qui a été vérifié, et comment

**Tout au navigateur, sur les vraies données** — il n'y a pas de base de bac à
sable. Chaque écriture d'essai a été relue en SQL puis supprimée, et la base
recomptée à zéro à la fin (`taches`, `publications`, `victoires`). Aucune ligne
de Noé n'a été touchée cette session.

Vérifiés de bout en bout :

- **La série d'une publication** : posée hebdomadaire depuis la tuile, dépliée
  cinq fois au mois suivant, avancée d'un cran par son rond, puis publiée — sa
  date a glissé du 26 août au 2 puis au 9 septembre, et son état est revenu à
  « à préparer » à chaque fois.
- **La durée d'une tâche** par ses deux chemins : la proposition (2 h) et la
  saisie libre (105 min, qui éteint la proposition allumée), relue en base, dans
  la pastille, dans la ligne de service, et en hauteur de barre en vue semaine
  (`--duree: 3.75rem` pour 1 h 30, à côté d'un événement de 2 h à 5 rem).
- **La durée offerte partout** : accueil, espace Calendrier (ouvert au pointeur,
  la case ne répond pas à un `.click()`), pages FCH / Yuno / formation, et les
  deux sites. Tous montrent le champ dans le panneau « Quand ».
- **L'état d'une publication sur les quatre écrans**, en vue mois ET semaine :
  le rond avance sans ouvrir la tuile, la pastille sait revenir en arrière, le
  menu se referme à chaque choix.
- **« Aujourd'hui »** avec une publication du jour et une en retard : les deux
  colonnes, l'ordre des groupes, la disparition d'un groupe vide, l'ouverture de
  la tuile d'une publication en retard (celle qui n'est PAS dans la semaine), et
  l'empilement sur 375 px.
- Les huit espaces du hub et les deux sites montent sans erreur console.

**Le piège d'outillage de la session, à connaître** : le service worker et le
cache de session servent l'**ancien JavaScript** après une modification. On
accuse alors le code d'un défaut qui n'existe plus — c'est arrivé deux fois,
dont une qui a coûté de longues minutes à chercher un bug inexistant dans
l'ordre des branches d'un écouteur. Avant de conclure qu'un geste ne marche
pas : désinscrire les service workers, vider `caches` et `sessionStorage`, puis
recharger **avec une adresse différente** (`index.html?v=…`) — sans la query, le
module reste en mémoire malgré tout le reste.

### Quatre défauts trouvés en chemin, tous antérieurs à la session

Aucun n'a été introduit ici ; tous dormaient depuis un ou deux jours.

1. **Le rond d'une publication n'avançait pas dans l'espace Calendrier.** Sa
   branche était écrite **après** celle qui ouvre le détail, et le rond est
   *dans* la barre : `[data-element]` l'attrapait le premier. Corrigé d'abord
   par un déplacement de branche, puis proprement par la phase de capture (§ 4).
2. **La tuile ne pré-remplissait pas le champ « Heure ».** Rouvrir une tâche de
   18 h et l'enregistrer sans y toucher lui **retirait son heure**.
3. **La répétition d'une tâche disparaissait à la réouverture**, dans l'espace
   Tâches comme sur l'accueil : la tuile revenait vide, et enregistrer effaçait
   la série.
4. **Le site Yuno n'écrivait pas la répétition d'une tâche** créée depuis sa
   propre tuile : la pastille était offerte, la colonne restait nulle. C'est
   exactement la copie oubliée dont `poserAuCalendrier` met en garde — Yuno est
   le seul espace qui garde sa propre version de la création.

**Un cinquième, non corrigé et laissé à Noé** : le titre d'une tâche sort en
graisse **400** alors que le corps du hub est en **500**. `.tache-corps` est un
`<button>` : il reprend `font-family: inherit` mais pas la graisse, et le
navigateur lui remet son 400 par défaut. Les titres de tâches sont donc
légèrement plus maigres que le reste de la page, partout. Une ligne de CSS suffit
— Noé n'a pas dit s'il le voulait.

---

## 0 ante undecies. La session du 26 août — les objectifs posés, et les pages espace refaites

**Neuf commits, tous poussés** : `e4bcca3` (forme des objectifs), `850a637`
(cap gravé + espace `#objectifs`), `e8aca73` (page Yuno), `0fffce4` (page FCH),
`d11dca7` (page formation + tâches cochables), `c0fb4f5` (densité), `a5e1340`
(tâches répétées), `b5fe4bc` (frais de déplacement), `ca1fe94` (fiche de sortie
Yuno). **Trois migrations** appliquées : `materiel`, `taches_recurrentes`,
`commandes_frais`.

La journée a commencé par une **conversation**, pas par du code : Noé voulait
clarifier ses objectifs. Elle s'est terminée par une refonte des trois pages
espace. Entre les deux, **une quinzaine de redirections** — c'est son mode de
travail : il regarde, il essaie, il change d'avis. Ce qui suit dit où l'on est
arrivé, et surtout **ce qui a été essayé puis abandonné**, pour qu'une session
future ne le remette pas en croyant améliorer.

### 1. Les objectifs, enfin posés — et ce qu'ils disent de Noé

**Dix objectifs, trente jalons, deux tâches** écrits en base après une longue
conversation. La table `objectifs` était vide depuis la création du hub ; c'était
la priorité n° 11 du dernier état des lieux, elle est close.

| Espace | Objectif | Échéance |
|---|---|---|
| formation | Valider le Bac+3 | 8 déc. |
| fch | Laisser une com qui tourne sans moi | 15 déc. |
| fch | Atteindre 1 000 abonnés sur l'Instagram du FCH | 31 déc. |
| fch | Participer à ramener un nouveau partenaire | 31 déc. |
| photo | Être accrédité à la CAN 2027 | 30 juin 2027 *(provisoire)* |
| photo | Rembourser mon matériel | 30 juin 2027 *(provisoire)* |
| perso | 4 intentions, sans cible ni date | — |

**Ce qui a été écarté, et pourquoi — à ne pas « rajouter » plus tard.** Noé
avait d'abord énoncé quatre chantiers au FCH. Deux ont été **supprimés** en
cours de conversation, à sa demande et pour une raison qui tient :

- **« l'outillage partenariats »** — il existe déjà (dossier, tableur de suivi) ;
- **« le socle documentaire »** — il existe aussi, et n'est pas utilisé.

Le problème du FCH n'est pas la production, c'est l'adoption. Or Noé refuse
explicitement d'en être responsable : il part fin décembre, il a porté l'espace
club seul l'an dernier et en est sorti éprouvé. Un objectif « accompagner la
mise en place » aurait affiché une barre de progression sur quelque chose dont
il refuse d'être le moteur — et la lui aurait redonnée chaque matin.
**Trois objectifs au FCH, pas quatre. Ce n'est pas un oubli.**

Deuxième principe posé ce jour-là : **mesurer ce qu'il livre, pas ce que le club
en fait**. Les 26 000 € de revenus partenaires sont l'objectif du club ; celui
de Noé est « participer à ramener un nouveau partenaire ». Même logique pour le
sentiment d'appartenance, qui est le *pourquoi* des 1 000 abonnés et non leur
cible.

Deux décisions tranchées dans la conversation, à connaître :
- **Canva, pas Photoshop**, pour la passation à Lina — l'objectif est son
  autonomie *après* le départ, pas la qualité maximale pendant la présence.
- **Les échéances Yuno au 30 juin 2027 sont PROVISOIRES** : les dates de la CAN
  ne sont pas connues. À ajuster le jour où elles le seront.

### 2. Le cap est GRAVÉ, et il ne se règle qu'à un endroit

Trois demandes successives de Noé, dans cet ordre — et c'est la troisième qui
compte :

1. « Les objectifs, ce ne doit pas être des tuiles » → forme gravée : du texte
   posé, ni carte ni bordure, une colonne par objectif, les jalons réduits à des
   points.
2. « On doit y accéder en cliquant » → chaque titre devint un lien.
3. **« C'est la TUILE qui doit mener au détail, pas les titres, et les titres ne
   doivent pas être soulignés »** → un seul lien, étendu à tout le panneau par
   un calque invisible ; au survol, **seul le contour prend l'encre de l'espace**.

**Conséquence structurelle, à ne pas défaire** : une tuile-bouton ne peut
contenir aucun autre contrôle — il passerait sous le calque. C'est pour ça que
le compteur d'euros a été sorti du panneau « Le cap ». Le calque est délibéré
plutôt qu'un `<a>` autour de la section : un lien enveloppant interdirait d'y
remettre un jour le moindre bouton.

**L'espace `#objectifs` est né** : tous les objectifs groupés par espace, avec
pourquoi, cible, jalons **et la gestion complète** — dont le *retrait d'un
jalon*, qui n'existait nulle part. Pas d'entrée dans la barre de navigation
(demande de Noé) : on y vient par la tuile.

### 3. Les trois pages espace, refaites

Noé a ouvert le sujet ainsi : « elles ne me sont pas utiles, je n'y vais
jamais ». Le diagnostic était simple — **elles étaient une copie maigre du
site**, sans rien que le site n'ait déjà, et elles ne montraient même pas les
tâches de l'espace.

Le principe posé : **le site est l'atelier, la page du hub est le bilan.**
Détail de chaque page dans les deux cahiers des charges ; ce qui compte ici,
c'est ce qui a été **écarté volontairement** :

- **Pas de bande d'images au FCH ni en formation** : ils n'ont pas de photos, et
  on ne leur en invente pas une.
- **Pas de bloc partenaires au FCH** : aucun partenaire en base, ils vivent dans
  le tableur du club. Un panneau vide en permanence vaut moins que pas de
  panneau.
- **Pas d'histogramme au FCH ni en formation** : trois publications sorties ne
  font pas une courbe de douze mois.
- **Pas de bloc « À venir » en formation** : elle n'a aucun événement en base,
  ses échéances sont ses jalons et ils vivent dans le cap.

**`js/gabarits.js` n'est plus une fabrique** : `creerEspaceEspace` a été
supprimée (350 lignes) — la formation était sa dernière utilisatrice. Il ne
reste que les gabarits partagés.

**Quatre allers-retours sur la forme**, dans l'ordre, pour qu'aucun ne soit
défait par erreur :

1. *« Ce n'est pas assez propre, la séparation entre les blocs n'est pas
   évidente, ce ne sont que des lignes »* → passage en **grille à deux colonnes
   de panneaux**. Ce n'est pas un retour aux tuiles : la tuile était la forme du
   *contenu*, ici c'est le contenant d'une section, et ce qu'elle porte reste
   varié — chiffres nus, histogramme, texte gravé, lignes, barre d'entonnoir.
2. *« Un seul bloc avec tous les boutons, et le rythme ne doit pas sortir en
   premier »* → ordre final : **Le cap | À faire**, puis la matière propre |
   le bilan.
3. *« Les boutons n'ont pas besoin d'être dans une tuile, mets-les en bas »* →
   pied de page, hors panneau.
4. *« Des pastilles plus arrondies, et de couleur »* → et **c'était le fond, pas
   la couleur** : dans un panneau, une pastille teintée se fondait dans la
   carte ; sur le fond nu de la page, l'encre de l'espace la détache.

Puis **une passe de densité** (« j'ai une bonne vision, je préfère plus
d'informations sur moins d'espace ») : textes d'un ou deux crans plus petits,
panneaux resserrés de 24 à 16 px, et **les cibles tactiles scindées — 44 px sur
téléphone, 32 px sur grand écran avec un pointeur fin**. La règle des 44 px
protège un doigt ; sous une souris elle ne fait que pousser le reste vers le
bas. Le nom de l'espace a aussi quitté les lignes de tâches **des pages espace
seulement** : ailleurs les espaces se mêlent, il y reste indispensable.

### 4. L'argent de Yuno

L'objectif « Rembourser mon matériel » avait une cible écrite en dur — 5 000 € —
que rien ne mesurait. Il se calcule maintenant :

> **cible** = somme des prix du matériel **+** somme des frais de déplacement
> **progression** = somme des montants encaissés

**Table `materiel` créée** ; Noé y a saisi ses dix pièces — **4 612 €** — pendant
la session. Les **trois jalons chiffrés** de l'objectif (1 000 / 2 500 / 5 000 €)
ont été **supprimés** : la cible bougeant à chaque achat, un palier fixe cessait
d'être l'arrivée. Les trois jalons qualitatifs restent, et disent le chemin.

**Les frais s'ajoutent à la cible, ils ne se retranchent pas des revenus** —
Noé a demandé les deux formes, dans cet ordre, et c'est la seconde qui reste.
Même arithmétique, meilleure lecture : ce qu'on a gagné reste ce qu'on a gagné,
c'est la dette qui grossit de l'essence.

**Une prestation se saisit depuis deux écrans mais n'existe qu'une fois** : la
fiche d'une sortie sur le site Yuno (reliée par `commandes.evenement_id`) et le
détail de l'objectif dans `#objectifs`. Deux tables en feraient deux comptes.
Vider les deux champs d'argent sur une sortie **retire** la prestation — sans
quoi une saisie erronée resterait à zéro dans le compte, sans moyen de la
reprendre.

**La fiche d'une sortie Yuno a trois états** désormais : l'aperçu (qui raconte —
photo, nom, rencontres), **les détails** (qui récapitulent champ par champ, y
compris l'heure, les clubs et l'argent), et l'édition (48 rem, deux colonnes,
trois groupes).

### 5. Les tâches se répètent

Mêmes colonnes, mêmes mots, même pastille que pour un événement. L'arithmétique
des dates est descendue dans `js/format.js` — `js/api.js` en a besoin, et
`js/calendrier-commun.js` aussi, or celui-ci importe l'API : l'inverse aurait
fait un cycle.

**La règle qui n'a pas d'équivalent chez l'événement, et qu'il ne faut pas
« corriger »** : une tâche porte **un seul** `statut`. La cocher marquerait toute
la série faite pour toujours. **Une tâche répétée ne se termine donc pas : elle
glisse à l'occurrence suivante** et écrit sa victoire au passage. Passé la fin
déclarée, la série s'arrête et la tâche se termine pour de bon. L'annulation la
ramène à l'occurrence d'avant.

Conséquence assumée : dans l'espace Tâches, une tâche répétée n'apparaît jamais
comme faite, donc son cercle ne la « décoche » pas — il avance encore d'un cran.
L'annulation vit sur l'accueil, avec sa ligne de six secondes.

### 6. Le calendrier, en vue semaine

Deux réglages demandés en cours de route :

- **Le titre commence à la suite du rond** et repasse **sous lui** au retour à
  la ligne. La solution évidente — faire flotter le rond — ne marche pas : un
  titre coupé à trois lignes est un bloc `-webkit-box`, et un tel bloc établit
  son propre contexte et **refuse de contourner un flottant** (mesuré : il se
  rangeait à droite). Le rond est donc **sorti du flux** et le titre indenté sur
  sa première ligne. C'est la seule façon de garder les deux.
- **Les événements gardent leur heure au-dessus du titre** — Noé l'a redemandée
  après coup. Le partage se fait tout seul : une barre à heure ou à durée reste
  en colonne, les autres passent en ligne. Utile à savoir : **le calendrier ne
  donne un rond qu'aux tâches et aux publications**, jamais aux événements.
- Sur téléphone, la semaine à sept colonnes rend sa ligne au rond : à 40 px de
  large, une première ligne amputée ne tiendrait que deux lettres. Le **jour
  ouvert en grand** garde la lecture en ligne.

### 7. La préparation Yuno n'apparaît qu'à 48 h

Sur l'accueil du site Yuno, une sortie ne monte plus qu'à **deux jours** de son
début. Sans cette borne, un match posé trois semaines plus tôt occupait le haut
de l'écran pendant trois semaines — et une préparation qu'on ne peut pas encore
faire n'est pas un rappel, c'est du décor. **La feuille, elle, n'attend pas** :
elle se crée et se remplit quand on veut. C'est l'accueil qui se tait. Une
sortie en cours ou qui vient de finir n'est pas soumise à la borne.

### Ce qui a été vérifié, et comment

**Tout au navigateur, sur les vraies données** — il n'y a pas de base de bac à
sable. Chaque écriture d'essai a été relue puis supprimée, et la base recomptée.
Deux fois une ligne de Noé a été touchée (une prestation inventée sur un vrai
match) ; les deux fois elle a été retirée dans la minute.

Vérifiés : les huit espaces du hub montent sans erreur, dans les deux thèmes et
en mobile ; l'aller-retour complet de chaque écriture (objectif, jalon,
matériel, prestation, tâche répétée cochée puis annulée, réunion FCH) ; les
sept cas de la borne des 48 h ; les trois états de la fiche de sortie.

**Cinq défauts que seul le navigateur a révélés**, tous corrigés :

1. **La table `materiel` n'avait pas ses privilèges.** Une politique RLS ne
   suffit pas : une table créée en SQL n'hérite pas des `GRANT` que le tableau
   de bord Supabase pose tout seul, et PostgREST répond « permission denied »
   avant même de lire la politique. Le `GRANT` est dans la migration.
2. **Les cercles des tâches étaient des boutons morts** sur les pages Yuno et
   FCH — le gabarit produit le cercle, aucune page ne traitait le clic. Le geste
   est maintenant posé **une seule fois** dans `js/taches.js`.
3. **Au-delà de 60 rem, `.bloc ul:not(.liste-jalons)` passe toute liste en
   grille de colonnes de 21 rem.** Dans un panneau de 440 px elle n'en trouvait
   qu'une, et `flex` n'avait plus prise. Trois listes en sortent explicitement.
4. **Une règle CSS écrite 60 lignes trop haut** : à spécificité égale c'est la
   dernière qui gagne, et la densité était ignorée en silence.
5. **Le cap se hachait en trois colonnes de 130 px** dans un panneau de 490 :
   sa bascule regarde la largeur de la *fenêtre*, pas celle de son contenant.

**Un défaut d'usage, aussi** : presser « + Une réunion » au FCH créait un
événement sans objet — donc pas une réunion — qui disparaissait sitôt noté.
L'objet est posé d'avance, et le filtre compare désormais à la **fin** de la
réunion (une réunion notée aujourd'hui sans heure tombe à minuit et se croyait
passée).

---

## 0 ante duodecies. La session du 24–25 août — la journée dans la semaine, et le FCH à trois états

**Deux commits, poussés** : `03c8a9a` (la journée, les icônes de la tuile, le
bleu du FCH au calendrier, les trois états des publications) et `cf4db78` (le
trait sous le champ de la tuile, retiré). Plus une **migration de données**,
`20260825090000_trois_etats_publications_fch.sql`, appliquée en base.
`fch-spec.md` et `CLAUDE.md` ont été tenus à jour au fil de l'eau.

La session a commencé sur une demande d'une ligne — « supprime la phrase sous
le calendrier de la semaine » — et **chaque réponse en a appelé une autre**.
Sept demandes, dont quatre corrigent la précédente. C'est le mode de travail de
Noé : il regarde, il essaie, il redirige. Ce qui suit dit **où l'on est
arrivé**, et surtout **ce qui a été essayé puis abandonné**, pour qu'une
session future ne le remette pas en croyant améliorer.

### 1. La journée s'ouvre DANS la semaine (accueil)

Presser le titre d'un jour de « Ta semaine » (« mar. 25 ») lui donne toute la
largeur ; represser ce même titre rouvre la semaine. Deux flèches passent au
jour voisin, éteintes aux deux bouts — au-delà du dimanche il faudrait changer
de semaine, et « Ta semaine » ne serait plus la semaine.

**Ce n'est PAS un autre écran, et c'est le cœur de la chose.** C'est la même
grille dont les sept colonnes changent de largeur : les traits entre les jours
glissent jusqu'aux bords, puis s'effacent. D'où trois contraintes, à ne pas
défaire :

- `--cal-colonnes` porte **sept valeurs écrites une à une**, jamais
  `repeat(7, 1fr)` : entre les deux formes, le navigateur n'a rien à
  interpoler et le mouvement redevient un saut.
- **Ouvrir ou fermer ne redessine rien** : `viserLeJour` (js/dashboard.js) ne
  touche qu'au style de la grille. Un `innerHTML` couperait l'animation net,
  faute d'un état de départ.
- Une colonne à zéro garde son contenu (il rétrécit avec elle, c'est ce qui
  rend le mouvement lisible), mais ses titres passent en `nowrap` : à 0 px de
  large, un texte qui se replie ferait grandir la ligne pendant qu'on la
  resserre.

L'animation demande un navigateur qui interpole `grid-template-columns`
(Chrome 107+, Safari 16+). Ailleurs le passage se fait d'un coup — c'est-à-dire
comme avant, jamais cassé.

**Trois formes essayées avant celle-là**, dans l'ordre : (a) une fenêtre-liste
par jour, (b) une grille d'un seul jour rendue à part, (c) celle qui reste.
La (b) a échoué sur un détail qui vaut d'être connu : `segmentsDeLaSemaine`
lisait `jours[6]` pour son bord droit, ce qui valait `undefined` pour une ligne
d'un seul jour — donc, par le défaut de `versDateISO`, **aujourd'hui**. Une
journée ouverte sur demain se dessinait vide. La fonction lit maintenant le
dernier jour de la ligne, quelle qu'en soit la longueur.

**Et l'entrée a changé une fois** : d'abord le fond du jour (« clique sur un
jour »), puis **le titre du jour** — la case reste le fond qu'on glisse et sur
lequel on dépose une barre, elle ne pouvait pas porter les deux gestes.

**La phrase d'aide sous la grille ne se dit plus sur l'accueil**
(`aide: false`) : les gestes s'apprennent une fois, dans l'espace Calendrier,
où elle reste.

### 2. Les publications du FCH ont TROIS états

`à préparer → à programmer → publié`. « Brouillon » et « prêt » disaient deux
fois la même chose pour le club, et aucun des deux ne disait ce qu'il restait à
faire.

**Aucun changement de schéma, et c'est délibéré** : les trois réutilisent des
valeurs que le CHECK accepte déjà — `idee`, `pret`, `publie` —, ce sont les
**mots** qui changent (`nomDuStatut`, js/calendrier-commun.js). Les cycles
vivent dans `CYCLES_PUBLICATION`, à côté des réseaux et des formats, **et pas
dans publications.js** : la tuile du calendrier en a besoin, et c'est
publications.js qui importe calendrier-commun, jamais l'inverse. Yuno garde ses
cinq étapes. La seule ligne du club qui portait `brouillon` est passée en « à
préparer » (migration ci-dessus).

**Deux gestes pour changer d'état, et ils ne font pas la même chose :**

- **le rond de la barre avance d'un cran** (`data-avancer-pub`) — le geste
  rapide, sans quitter la grille, arrêté au dernier état ;
- **la pastille de la tuile ouvre un menu** — le geste complet : n'importe quel
  état, y compris en arrière.

**Une case à cocher a été proposée et écartée** (Noé demandait un avis) : elle
ne dit que fait/pas fait, et ferait sauter « à programmer » — le seul état qui
distingue un visuel qui attend sa date d'un visuel qui n'existe pas encore, et
c'est justement ce qu'on vient voir le matin.

**La forme de ce réglage a bougé trois fois dans la tuile** : trois boutons
alignés, puis un menu déroulant à droite de la ligne des gestes, puis **une
pastille dans l'en-tête**, à la suite de la nature et de l'espace — les trois
disent ce qu'EST la publication, elles se lisent ensemble. Le menu est dessiné,
jamais le `<select>` du système (règle du 14 août), **et sans chevron** : à
cette taille il pesait autant que le mot.

**La couleur change de TEINTE, pas d'intensité** (deuxième demande de Noé,
après un premier essai en dégradé d'accent) : rouge → ambre → vert
(`TEINTES_ETAPE`, interpolées si le cycle compte plus de trois pas). Seule la
teinte part du JS ; saturation et clarté sont réglées dans le CSS, une fois par
thème — la même pastille doit se lire sur fond clair comme sur fond sombre.
**Ce rouge et ce vert ne rouvrent pas la porte aux couleurs d'alerte** : ils ne
jugent aucune échéance, ne bougent jamais seuls, et disent une étape de
fabrication que Noé a posée lui-même. C'est écrit à côté de la règle, § 5.

**Une publication se lit désormais comme une TÂCHE au calendrier** : plus
d'aplat de couleur (l'aplat reste aux choses qui *arrivent*), un trait à gauche,
et **un rond, pas un losange** — creux « à préparer », à moitié plein « à
programmer », coché « publié », titre barré.

**Conséquence assumée : le calendrier du hub garde les publiées.**
`api.publicationsDatees()` ne les écarte plus. Sans ça le troisième état était
invisible et irréversible depuis la tuile, et une publication partie aurait
disparu du planning là où une tâche faite y reste, barrée. Les deux sites, eux,
continuent de ranger les publiées sous leur pli.

### 3. La tuile de détail, et le bleu du FCH

- **« Modifier » et « Supprimer » sont devenus un crayon et une corbeille**,
  puis **réduits à 32 px** (ils restent au-dessus du seuil d'une cible isolée,
  24 px), **la corbeille en rouge**. Le mot survit dans `title` et
  `aria-label`. `.bouton-icone` a quitté yuno.css pour styles.css à cette
  occasion : la fenêtre de détail est commune au hub et aux deux sites.
- **Le FCH est BLEU dans le calendrier du hub**, et là seulement. La demande a
  été resserrée deux fois par Noé : « tout ce qui concerne le FCH », puis
  « uniquement dans le calendrier », puis « le calendrier du hub ». Ailleurs
  (espace Tâches, pastilles, fiches, les deux sites), la couleur double du club
  et son rouge ne bougent pas. La mesure du 21 août qui avait fait choisir le
  rouge reste vraie et reste écrite : le bleu du club est la couleur d'espace
  la plus proche du perso. Dans une grille, la colonne et l'étiquette disent le
  espace avant la couleur.
- **Le champ de la tuile de capture n'a plus AUCUNE décoration de focus**
  (demande en deux temps : d'abord la couleur, puis le trait lui-même). C'est
  la seule exception du hub à « le focus clavier jamais supprimé », et elle est
  écrite au-dessus de la règle dans styles.css : la tuile n'existe que pour ce
  champ, elle s'ouvre avec le curseur dedans et le clavier levé. Les pastilles
  gardent le leur.

### Ce qui a été vérifié, et comment

Tout au navigateur, sur les vraies données — il n'y a pas de bac à sable :

- la journée s'ouvre, les flèches avancent et s'éteignent aux deux bouts, le
  titre referme ; les colonnes interpolent (mesuré à mi-course :
  `44px … 166px … 44px`) ;
- l'espace Calendrier garde sa phrase d'aide, ses titres non ouvrants et ses
  sept colonnes égales — la journée est un ajout de l'accueil, pas une
  modification du calendrier ;
- le rond avance d'un cran **sans ouvrir la tuile** (`stopPropagation`), la
  pastille pose n'importe quel état, le menu se referme même quand on choisit
  l'état déjà posé ;
- l'écriture arrive bien en base (relue en SQL), et **tout ce que les essais
  ont changé a été rendu à l'identique** — sauf une ligne, ci-dessous ;
- les neuf espaces montent sans erreur console après tous ces changements.

**Un point d'honnêteté** : « Résultat CDF » (24 août) est resté en **publié**
en fin de session. Mes essais l'avaient remis en « à préparer » ; il est
repassé en publié après cette remise à zéro, très probablement sous les doigts
de Noé, qui suivait l'aperçu en direct. Une pastille suffit à le corriger.

**Un artefact d'outillage, pas du site** : dans l'onglet d'aperçu, le service
worker a fini par refuser de se réenregistrer, après une dizaine de vidages de
cache forcés. `sw.js` n'a pas été touché et se sert correctement (200,
`text/javascript`) ; un onglet neuf le réenregistre.

---

## 0 ante terdecies. La session du 24 août — les réunions trouvent leur forme

**Cinq commits, tous poussés** : `d99062e` (tuiles de préparation), `bac89a8`
(habillage FCH), `0e3fdf3` (modèle depuis la feuille Yuno), `b15af2b` (fiche
selon le rôle, modèles, logo dans l'onglet), `d990410` (modèles échangeables,
idées FCH modifiables). Plus `087bd4f`, qui écarte `.claude/` et `PRODUCT.md`
du dépôt — un skill tiers installé ce jour-là pesait des centaines de fichiers
qui seraient partis sur GitHub Pages avec le site.

`fch-spec.md` fait autorité sur le détail des réunions ; il a été tenu à jour
au fil de l'eau, y compris pour les revirements.

### L'aller-retour de la journée — à lire avant de toucher aux réunions

**La préparation des réunions a changé de forme quatre fois dans la journée.**
L'ordre compte, parce que chaque étape a une raison, et qu'une session future
risquerait de « réparer » ce qui a été retiré exprès :

1. **Le matin — la fiche s'adapte au RÔLE.** Quand Noé anime, le contrat
   complet du guide (type, objectif collectif, participants, envois, ordre du
   jour, présentation, kit). Quand il **y assiste**, la fiche se réduit à ce
   qui lui appartient : *son* objectif, les participants, **ses questions et
   points à aborder** — « sans que ce soit moi qui décide du type de réunion,
   des docs à envoyer, de l'ordre du jour, la présentation ». Plus le
   compte-rendu, entier dans les deux cas. Garde-fou posé au passage :
   l'enregistrement n'écrit que les champs que le formulaire portait, donc une
   fiche de participant n'efface pas un type déjà en base.
2. **Puis les six modèles semés reviennent** en checklist Avant · Pendant ·
   Après sur la fiche (« le modèle par défaut peut ne pas être le bon »).
3. **Puis un modèle par TYPE** dans la liste : « CA · j'anime » et « CA · j'y
   assiste » sont deux **versions** du même modèle, pas deux entrées — et une
   **case « J'anime la réunion »**, sous la date de la fiche, décide de la
   version. Elle écrit `reunion_animee` sur l'ÉVÉNEMENT : la cocher bascule la
   fiche entière.
4. **Le soir — les checklists partent.** D'abord l'avant et l'après (doublons
   de « Ta préparation » et de « Conclure »), puis le pendant, puis « ce
   principe » entier. **Les feuilles de réunion ont été supprimées de la
   base** ; les feuilles à cases restent l'outil des SORTIES Yuno.
5. **Mais les modèles survivent** sous une autre forme (« on a perdu la
   possibilité de changer de modèle ») : un **menu dépliant « Modèles » en
   haut à droite de la fiche**. Choisir un modèle **verse ses lignes en TEXTE**
   dans « Les questions et points / Tes notes » — de la matière à
   retravailler, pas des cases. Et **changer de modèle ÉCHANGE ces lignes** :
   toute ligne correspondant mot pour mot à une ligne d'un des modèles cède la
   place ; une ligne écrite ou retouchée par Noé n'y correspond plus, elle
   reste, en tête. Rien ne se redessine — une frappe en cours n'est jamais
   perdue.

**Ne pas ramener les checklists de réunion sans une demande explicite.**

### Le reste de la journée

| Chantier | Où |
|---|---|
| **Le logo EST l'onglet Accueil** — plus de logo en tête de page, un pochoir teinté par `currentColor` : blanc plein quand actif, bleu-gris sinon | `hermitage.js`, `fch.css`, `img/fch-logo-pochoir.png` |
| **Une idée de « Créer » s'ouvre au clic et se modifie** — fenêtre volante : titre, réseau, format, rubrique, date, notes ; vider la date la renvoie à la banque | `#hermitage/creer` |
| **Le modèle se change depuis la feuille** — un pli sur la feuille Yuno : les lignes manquantes s'ajoutent, rien de coché ne bouge | `#yuno/preparations/<id>` |
| **Les feuilles en tuiles compactes**, plus hautes que larges, côte à côte | `#yuno/preparations` |
| **Le fond du site FCH en dégradé radial** depuis le coin haut droit, l'onglet actif en blanc | `fch.css` |

**Le pochoir du logo** est un fichier à part : le PNG d'origine porte un épais
contour blanc de sticker qui, en masque direct, rendait une tache pleine. Il a
été fabriqué depuis le logo **sans Pillow** (absent de la machine), en
réutilisant le lecteur PNG maison de `tools/generer-icones.py` — 37 Ko.

**Le dégradé du FCH a demandé six essais** (linéaire haut→bas, inversé, deux
couches, radial, plus large, moins large). Valeur finale : radial depuis le
coin haut droit, `#0039a6 → #16337d (58 %) → #0a102c`, avec
`min-height: 100vh` sur le body — sans quoi une page courte arrêtait la pente
et laissait une bande unie dessous. **Le 58 % a été réglé à l'œil** (50 trop
serré, 65 trop large) : ne pas « arrondir ».

### Ce qui a été corrigé en passant

- **Une idée de la banque du FCH ne s'ouvrait pas** — ouvert depuis le 13 août,
  clos aujourd'hui : les tuiles portaient `data-ouvrir-pub` sans que
  `hermitage.js` n'écoute jamais l'attribut. Le clic ouvre désormais une
  fenêtre d'édition (et « À venir » a gagné la même porte).
- **La lisibilité du logo sur le bleu** — question ouverte depuis le 7 août,
  close par le pochoir : le logo est monochrome dans l'onglet, il ne peut plus
  se perdre dans le fond.

### Vérifié comment

Au navigateur à chaque étape, et en base pour tout ce qui écrit. Deux
précautions qui ont servi :

- **la fiche du CA était en cours de remplissage par Noé pendant la session** —
  le champ a été sauvegardé avant tout test de versement, l'échange de modèles
  éprouvé (45 lignes → CA → Autre → CA), puis l'état voulu remis ;
- **la déduplication a été prouvée en base** : appliquer à une feuille son
  propre modèle n'ajoute rien (11 lignes → 11).

## 0 ante quaterdecies. La session du 21 août — l'egress, la semaine, et les réunions du FCH

**Cinq commits, tous poussés** (`ee372bf` et `c1dc1ad` ferment la soirée du
15 ; `1dd9bda`, `60f17d6` et `8762577` sont du 21). Les cahiers des charges
font autorité sur le détail : `yuno-spec.md` et `fch-spec.md`, mis à jour au
fil de l'eau.

### La fin de soirée du 15 (après le dernier état des lieux)

| Chantier | Où |
|---|---|
| La vue Week-end filtrée **par compétition**, tuiles élargies | `#yuno/calendrier` |
| La fiche d'un club : **« Matchs couverts »** à droite, **3 matchs proposés** en tuiles | `#yuno/vivier` |
| **Relier un événement à ses clubs** — partout : tuile, modification, les deux formulaires du Carnet | `calendrier-commun`, `yuno.js` |
| La carte de la fournée refaite : tout à gauche, croix au coin, bouton bleu, **4 de front** | `#yuno/passerelle` |
| **Les écussons des 97 clubs**, partout où un club se nomme | `img/clubs/`, `js/logos-clubs.js` |
| Le « + » flottant **se retire** quand une fenêtre est ouverte ; croix pour écarter la préparation de l'accueil | `yuno.js` |

Les écussons sont **dans le dépôt** (804 Ko, 64 px), rapatriés par
`tools/telecharger-logos.py` — ESPN pour 79 clubs, TheSportsDB pour les 18 du
National ; la table nom → fichier est ÉCRITE dans l'outil, jamais rejouée. La
coquille précharge la table, pas les images.

### Le 21 août, premier chantier : la bande passante (mail de Supabase)

Supabase a écrit : le **cached egress** dépassait les 5 Go du plan gratuit.
Diagnostic vérifié : 26 photos quasi pleine taille (43 Mo), servies par des
liens signés UNE HEURE refabriqués à chaque visite — des adresses toujours
neuves, donc un navigateur qui retéléchargeait ce qu'il avait déjà.

Deux réponses (commit `1dd9bda`) :

- **la réduction à l'envoi resserrée** : 1600 px / JPEG 0,82 (au lieu de
  2400/0,85), et une image déjà petite mais au-dessus de 500 Ko est ré-encodée
  quand même — c'était le trou. Les 26 photos en ligne ont été repassées au
  même moulin, chacune vérifiée décodable et plus légère avant d'écraser :
  **43 Mo → 8,6 Mo** ;
- **les liens signés durent UN MOIS et se réutilisent 25 jours** depuis un
  garde-manger `localStorage` (`yuno-photos-signees`, dans `api.urlsDesPhotos`).
  `SIGNATURE_UTILE` (yuno.js) pointe sur la même constante.

Attendu : l'egress mensuel divisé par ~80. **À vérifier dans quelques jours**
sur le tableau de bord Supabase (Settings → Usage).

### Le 21 août, deuxième chantier : la semaine qui tourne, et la loupe

- **La fournée est hebdomadaire pour de vrai** (migration
  `20260821120000_fournee_semaine.sql`) : la spec le promettait, rien ne le
  faisait — le commentaire SQL de `en_fournee` disait même l'inverse.
  `fournee_semaine` garde le lundi du choix, posé dans le même geste ; au
  chargement des pistes, les fournées d'une semaine passée retournent au
  vivier (le site n'a pas de minuit à lui — c'est la première visite de la
  semaine qui fait le ménage). Les propositions tournaient déjà (graine =
  lundi, « passer » effacé avec la semaine).
- **Une loupe sur Réseau, Passerelle et vivier** : la barre se déploie à
  gauche de la loupe, sur la ligne du titre — la loupe ne bouge pas d'un
  pixel, pas d'anneau doré ; rien ne s'affiche tant que rien n'est tapé ; les
  résultats sont des lignes à filets (la ligne du vivier, sans le prochain
  match) ; le « + » ajoute à la fournée sans changer de page, sans perdre le
  curseur.

### Le 21 août, troisième chantier : les réunions du FC Hermitage

Le gros morceau (commit `60f17d6`), spécifié avec Noé avant d'être construit.
`fch-spec.md` fait autorité ; en bref :

- **une réunion est une FACE de l'événement** : `reunion_objet` (CHECK ca ·
  alternance · communication · partenariat · autre — libellé « CA » tel quel,
  demande de Noé) en est le marqueur, plus `reunion_animee`. Pastille
  « Réunion » sur la tuile : toujours offerte sur le site FCH, révélée au hub
  quand l'espace choisi est fch — le motif exact de `type_moment`/photo ;
- **le site FCH a gagné le « + » flottant** (tuile commune, nature Événement
  d'abord) et un onglet **Réunions** ; son accueil ouvre sur **la réunion du
  moment** (phase + 3 lignes cochables) ;
- **la feuille de préparation est un module commun** désormais
  (`js/preparations-commun.js`, CSS déménagé dans `styles.css`) — la leçon du
  calendrier : un deuxième site, un module, jamais une copie. Yuno vérifié
  intact ;
- **six modèles semés** en migration (`20260821150000_reunions_fch.sql`), du
  vrai savoir-faire de conduite de réunion : CA en deux versions (« CA ·
  j'anime » / « CA · j'y assiste » — animer et assister sont deux métiers),
  point alternance, réunion communication, rendez-vous partenaire, les
  essentiels. **Le bon modèle se propose d'office** (objet + rôle) ;
- **le bilan n'est pas le compte-rendu officiel** : deux questions pour soi,
  une troisième pour l'animateur seulement (`bilan_animation`), et **chaque
  ligne « à faire » devient une tâche fch** à la première écriture — jamais
  aux suivantes.

Testé de bout en bout sur le vrai site (création → préparation → coche →
bilan → tâche), puis nettoyé. Deux bugs attrapés en route : la **liste
blanche** de `creerEvenement` qui jetait les colonnes nouvelles en silence, et
le **double branchement** `brancherChoix` + `brancherCapture` qui refermait
les menus de formulaire du FCH sitôt ouverts (commit `8762577`).

### Le 21 août au soir : le calendrier du FCH, puis la refonte des réunions

**Pas encore commité en fin de session.** Trois chantiers, dans cet ordre :

1. **Le calendrier du site FCH a ses trois vues** — mois (par défaut),
   semaine, agenda, avec la barre de période. Tout vient de
   `calendrier-commun.js` ; seul `hermitage.js` a changé. Sont venues avec :
   la fenêtre de détail (modifier, supprimer), le glissement pour poser, le
   report d'une barre, le « +N », le cercle d'une tâche cochable, Échap. Les
   **grilles montrent le passé**, l'agenda garde sa règle (ce qui vient).
   Réparé au passage : la **pastille de nature de la tuile ne faisait rien**
   sur ce site — aucun gestionnaire pour `data-nature-creation`, on ne pouvait
   donc y noter qu'un événement.
2. **La case « Relances/Commandes » a quitté ses filtres** (demande de Noé) :
   le site n'assemble ni l'une ni l'autre. `construireFiltres` accepte une
   option `offertes` ; le hub et Yuno gardent leurs cinq cases.
3. **Les réunions, entièrement refaites** (demande de Noé, avec le guide
   « Réunions efficaces » du club en pièce jointe) : la feuille à cases
   listait des gestes, le guide demande une **structure**. Voir `fch-spec.md`,
   qui fait autorité — en bref : trois tables neuves
   (`20260821200000_fiches_reunion.sql`, **appliquée**), une fiche en six
   blocs (contrat, ordre du jour orienté action, présentation, suivi, kit
   d'animation si j'anime, conclure), et un **tableau des actions** qui
   survit aux fiches et jumelle une action « pour moi » avec une tâche fch.
   Les **portes vers le Drive** en font le point d'entrée unique : « créer »
   copie le dernier document (le thème du club suit), un bouton copie le nom
   attendu par la convention du dossier, et le lien se colle sur la fiche.

Testé sur le vrai site (fiche → point → traité → action → tâche jumelle),
vérifié en base, puis nettoyé. **Une fiche vide subsiste volontairement** :
celle de la « Réunion CA » du 24 août — la prochaine, autant qu'elle attende
déjà. Les six modèles de préparation du matin restent en base sans servir.

4. **Le FCH n'avait aucune couleur dans le calendrier du hub** — signalé par
   Noé, et c'était un vrai bug, pas un oubli de goût. Le FCH est le seul
   espace dont `--couleur-espace` est un **dégradé** (ses deux couleurs) ; or
   le calendrier s'en servait pour des **bordures** et des `color-mix()`, qui
   exigent une couleur. CSS jette la déclaration entière sans un mot : les
   barres du club sortaient sans fond ET sans bordure (`border-left-width: 0`,
   vérifié au navigateur), seules de tous les espaces.

   Deux corrections. La variable de couleur pleine s'appelait
   `--couleur-espace-texte` — **un nom qui mentait**, et c'est lui qui a piégé
   le calendrier : elle est renommée **`--couleur-espace-pleine`**, avec la
   vraie règle écrite au-dessus des définitions (dégradé = `background` et
   rien d'autre ; pleine = partout où une couleur est exigée). Les trois
   règles fautives (`.cal-barre-element`, `.cal-type-tache`,
   `.cal-journee-ligne`) l'utilisent désormais.

   **La couleur pleine du FCH est le ROUGE, pas le bleu** (choix de Noé, qui a
   demandé de trancher selon la ressemblance — mesuré plutôt qu'estimé à
   l'œil). Écart perceptuel du bleu du club au perso : **26 en clair, 18 en
   sombre**, quand les deux espaces les plus proches du hub sont déjà à 55 et
   53 — le bleu était deux à trois fois trop près. Le rouge se pose à 53 et
   54, l'écart de tout le monde, et rien d'autre n'est rouge dans la palette.

   **Ce rouge n'est pas une couleur d'alerte, et le hub n'en a toujours pas.**
   Il est posé sur *tout* ce qui vient du club, quel que soit l'état de la
   ligne : une couleur qui ne bouge jamais ne peut rien signaler. Ne pas la
   « corriger » plus tard en croyant appliquer la règle du § philosophie.
   Le dégradé, lui, reste partout où un fond l'accepte (pastilles, trait de
   l'agenda) : les deux couleurs du club continuent de s'y voir.

   **AMENDÉ le 25 août 2026 : dans le calendrier du hub, le FCH est BLEU**
   (demande de Noé, en trois temps — « tout ce qui concerne le FCH en bleu »,
   puis « uniquement dans le calendrier », puis « le calendrier du hub »). La
   règle vit dans `#bloc-semaine [data-espace="fch"]` et
   `#espace-calendrier [data-espace="fch"]` : là, et là seulement, les deux
   variables prennent `--club-fch-bleu`. Partout ailleurs — l'espace Tâches,
   les pastilles, les fiches, les deux sites — la couleur double et son rouge
   ne bougent pas. La mesure ci-dessus reste vraie (le bleu du club est la
   couleur la plus proche du perso) ; dans une grille, la colonne et
   l'étiquette disent l'espace avant la couleur.

5. **La refonte du Réseau chez Yuno**, en deux passes le même soir : proposée
   dans le chat, validée, construite avec une sous-navigation en pastilles —
   puis **corrigée sur les retours de Noé** (« pas trop fan des pastilles »).
   `yuno-spec.md` fait autorité ; l'état final :

   - **le palier `#yuno/reseau` est mort** — l'onglet Réseau ouvre la
     Passerelle (bandeau + fournée), `#yuno/passerelle` reste un alias, les
     relances du lundi se lèvent aussi sur `reseau` ;
   - **pas de sous-navigation** : la famille se relie par des **tuiles de fin
     de page** (CRM et Le vivier côte à côte sous la Passerelle) et par le
     **bandeau cliquable** — « clubs contactés » ouvre le vivier, « entrés au
     réseau » ouvre le CRM. Le bandeau est **centré**, le titre « La
     Passerelle » a disparu (la loupe reste au bord droit), et « Propositions
     de la semaine » fait **la même largeur** que la tuile du club proposé ;
   - **nouvel onglet MISSIONS** (⚠ nom provisoire, choisi par moi — à valider
     par Noé) entre Créer et Réseau : il ouvre `#yuno/preparations` et
     regroupe préparations, leurs modèles et les **commandes**
     (`#yuno/commandes`, leur page) — tuiles croisées Préparations ↔
     Commandes. « Nouvelle commande » depuis une fiche du CRM pré-remplit le
     client (`etat.prefillCommande`, effacé en quittant la page). Pas de
     total encaissé — tranché, « pas pour le moment » ;
   - **les modèles de messages sont une arrière-boutique** : plus d'entrée de
     navigation, un lien discret en bas de la Passerelle et du CRM ;
   - **les feuilles et modèles du FCH n'entrent plus dans Yuno** (demande de
     Noé) : `preparationsToutes` embarque l'espace de l'événement lié, Yuno
     filtre photo (une feuille sans événement est à lui), et les modèles sur
     `espace = 'photo'`.

   Vérifié au navigateur : arrivée par l'onglet, alias, chiffres-portes,
   Missions (liste sans le FCH), Commandes, fiche → Nouvelle commande ; rien
   créé en base.

6. **La loupe est montée dans la barre d'onglets** (demande de Noé, dernier
   geste de la session) : visible sur TOUTES les pages du site, tout à droite
   — sa marge automatique centre les onglets en pendant de celle du premier —
   et **sticky au bord droit sur téléphone**, où la barre déborde et défile.
   Ouverte, la barre de recherche prend la ligne des onglets (ils s'effacent,
   Échap les ramène) et les résultats se posent dessous ; les pages qui ne
   lisent pas le vivier le **chargent au premier clic**. Elle ne cherche que
   les clubs du vivier — extension à d'autres fonds envisageable plus tard.
   `enTete(vue, etat)` porte tout ; `squelette` la montre fermée. La liste
   `.recherche-clubs` vit hors `.bloc` et porte son propre habit. À savoir :
   sur 375 px, **l'icône calendrier passe hors écran** (5 onglets + 2 icônes) —
   la barre défile pour l'atteindre ; si ça gêne Noé, resserrer les onglets ou
   rendre le calendrier sticky aussi.

7. **Les Missions réorganisées — l'événement pivot** (option A, proposée à
   l'écrit et validée par Noé, nom « Missions » confirmé). `yuno-spec.md`
   fait autorité ; en bref : `commandes.evenement_id` en base (migration
   `20260821220000`, **appliquée**) ; l'onglet ouvre **`#yuno/missions`**, un
   tableau de bord — « À préparer » (les événements des 30 prochains jours,
   commandes puis sorties, avec l'état de leur feuille), « Les commandes »
   (pipeline, l'événement visé affiché), tuile → Préparations (page à part
   entière avec les modèles, `#yuno/commandes` restant un alias). La
   **commande s'ajoute en fenêtre volante** (le « + » des pages Missions ; le
   formulaire plié a disparu), l'événement se relie par son titre exact
   (datalist des événements à venir). « Nouvelle commande » d'une fiche CRM
   ouvre cette fenêtre sur Missions, client pré-rempli. **La porte
   Préparations du Journal est partie.** Tout vérifié au navigateur, rien
   créé en base.

8. **Deux retouches de forme pour finir** : les feuilles de préparation en
   **tuiles compactes** (plus hautes que larges, côte à côte — titre en tête,
   date en pied, « Bilan écrit » quand il l'est ; les modèles restent en
   lignes), et **l'habillage du site FCH** — un dégradé **radial depuis le
   coin haut droit** (bleu vif `#0039a6` → bleu nuit `#0a102c`, médian à
   58 % réglé à l'œil par Noé après plusieurs allers-retours : ne pas
   « arrondir »), `min-height: 100vh` contre la bande unie des pages
   courtes, et **l'onglet actif écrit en blanc** (la pastille jaune est
   partie). `fch-spec.md` porte le détail.

## 0 ante quindecies. La session du 15 août — Yuno passe au réseau

**Vingt-trois commits, tous poussés.** Toute la session a porté sur **la
Passerelle et ce qu'elle a fait naître** : un vivier de clubs, leurs
calendriers, et les liens entre clubs, contacts et événements. Le hub n'a pas
été touché ; `calendrier-commun.js`, partagé avec lui, l'a été une fois (voir
plus bas). Le cahier des charges fait autorité sur le détail :
`yuno-spec.md`, §§ `#yuno/passerelle`, `#yuno/vivier`, `#yuno/messages`.

### Ce qui a été construit

| Chantier | Où |
|---|---|
| **La Passerelle v2** — le rituel hebdomadaire, à la place de la file par niveaux | `#yuno/passerelle` |
| **Le vivier** — 97 clubs, filtrés par compétition, avec la fiche de chacun | `#yuno/vivier` |
| **Les modèles de messages**, sortis de la Passerelle | `#yuno/messages` |
| **Les calendriers** — 3 314 lignes, les 97 clubs ont leur prochain match | `matchs_pistes` |
| **La vue « Week-end »** — les rencontres à couvrir, 3 colonnes colorées | `#yuno/calendrier` |
| **« À relancer »** — un message sans suite revient le lundi | `contacts.statut` |
| **Les liens** — fiche ↔ club (« rattaché à »), événement ↔ clubs (un match) | `pistes`, `evenements` |

**Six migrations, toutes appliquées** : `20260815160000` (le vivier, données
incluses), `20260815200000` (matchs, Ligue 1 incluse), `20260815210000`
(journal des chargements web), `20260815220000` (Ligue 3 et Belgique, données
incluses), `20260815230000` (statut `a_relancer`), `20260815240000`
(`evenements.club_recevant` / `club_visiteur`).

### Trois règles posées cette session, qui ne se défont pas sans la défaire

1. **Le titre d'un match est COPIÉ, jamais dérivé.** Il naît de l'affiche du
   calendrier officiel, puis vit sa vie — le réécrire ne touche pas aux liens,
   et corriger un lien ne le réécrit jamais. Un match posé se reconnaît **à sa
   date et à son club, pas à son texte**. C'est la règle des préparations,
   étendue ; elle a été vérifiée en renommant un événement en base.
2. **On n'invente pas une heure.** Le calendrier publié donne la journée et
   l'affiche à coup sûr, jamais l'horaire : « Poser au calendrier… » **ouvre la
   tuile pré-remplie** au lieu d'écrire, et Noé corrige avant de valider.
3. **« À relancer » est le seul état qui change avec le temps** dans ce dépôt.
   Il ne prétend rien de ce que Noé aurait fait — il lève un rappel — et ne
   bascule jamais sans date d'envoi connue.

### L'état de la base, au soir du 15 août

| | |
|---|---|
| Vivier | **97 clubs** · 1 contacté (Sochaux) · 1 en fournée |
| Calendriers | **3 314 lignes**, les 97 clubs ont leur prochain match |
| Envois | **1** — le premier vrai de Noé |
| Réseau | **50 fiches** (35 contact établi, 7 bon contact, 7 pas de contact, 1 message envoyé) |
| Événements | **16**, dont **1 relié à des clubs** (Torino – Milan, posé par Noé) |
| Objectifs · commandes | **0** — toujours jamais exercés |

### Ce qui reste ouvert

- **Les objectifs sont à zéro**, et c'est le point le plus important de cette
  liste. Le bas du dashboard existe pour eux, décembre approche (4 dossiers
  Studi + la vidéo, fin de l'alternance FCH) et rien n'est posé. Le cap long
  terme est la priorité n° 2 du produit ; il est vide.
- **La Suisse s'arrête à la J22** — seules journées publiées à la mi-août. Les
  douze dernières restent à charger ; en profiter pour re-vérifier les dates
  des autres championnats si des reports se sont accumulés.
- **Les mentions Léopard sont figées au 15 août**, mercato encore ouvert :
  Stroeykens (Anderlecht) et M.-A. Balikwisha (Antwerp) n'ont pas été inscrits
  faute de certitude. À revérifier après la fermeture.
- **Les trois autres chantiers** discutés avec Noé — concerts/événements,
  accréditation Vélodrome, médias congolais tous les mois — attendent que la
  forme Clubs soit éprouvée à l'usage. Le premier à faire serait **les médias
  congolais** : c'est le seul qui a un rythme (mensuel), donc le seul qui ait
  besoin d'un outil qui s'en souvienne.
- **La Passerelle n'a servi qu'une fois.** Noé a fait son premier envoi le
  15 août. Avant d'ajouter quoi que ce soit, la laisser tourner une semaine ou
  deux : c'est la méthode de l'espace, et elle vaut ici plus qu'ailleurs.

### Pièges rencontrés cette session

- **`node --check` ne voit pas tout.** Un backtick de trop dans un gabarit de
  `calendrier-commun.js` est passé : le fichier restait valide, la barre aurait
  affiché du code. `node tools/verifier-gabarits.js` **et l'écran** sont les
  seuls juges.
- **Un import manquant ne dit rien à l'écran.** `dateLongue` absent des imports
  de `yuno.js` dessinait un bloc vide, compteur et titre corrects — seule la
  console parlait.
- **Un élément de grille ne rétrécit pas tout seul** : sans `min-width: 0`, les
  tuiles du week-end débordaient sur la colonne voisine.
- **Une règle CSS écrite pour un bouton disparu peut survivre à sa cible** : le
  fond bleu du « + » venait d'un sélecteur par attribut resté en place.
- **Noé pilote l'aperçu en même temps.** Un état qui change sous les tests n'est
  pas forcément un bug — vérifier la base avant de conclure, et préférer les
  `ref` de `read_page` aux clics par coordonnées.
- **`calendrier-commun.js` a été touché une fois**, pour `vuesEnPlus` (la vue
  Week-end). Même contrat que `naturesEnPlus` : le hub ne voit rien de nouveau.
  Le calendrier éditorial partage `vueCal` et retombe sur le mois.

---

## 0 ante sexdecies. La session des 14–15 août, en un coup d'œil

**Vingt-quatre commits, tous poussés.** Le site Yuno a été refondu en
profondeur ; le hub n'a été touché qu'aux endroits qu'il partage.

### Ce qui a été construit

| Chantier | Où le lire |
|---|---|
| **Les Préparations** — feuilles avant/pendant/après, modèles éditables, bilan | § 0 bis |
| **La fusion moments ↔ événements** : une sortie, deux faces (prévue, vécue) | § 0 ter |
| **Créer refondue** : le pipeline d'une idée, et sa forme | § 0 quater |
| **L'identité de Yuno** : trois couleurs, Gilroy Heavy, titres réduits | § 0 quinquies |
| **Ce qui a été retiré** : rendez-vous stats, « Œuvre finie », doublons | § 0 sexies |

### Cinq choses à savoir avant de continuer

1. **`node tools/verifier-gabarits.js` avant de pousser du HTML dans un
   gabarit.** Un accent grave nu dans un commentaire HTML ferme la chaîne :
   `node --check` passe, le module casse au chargement. Le piège s'est produit
   **quatre fois** en trois jours ; l'outil le voit, rien d'autre ne le voyait.
2. **La coquille en cache sert l'ancienne version un rechargement durant.**
   Mesurer ou juger APRÈS deux rechargements, sinon on regarde la version
   d'avant — piège rencontré plusieurs fois par jour.
3. **Une graisse ou une couleur se vérifie en MESURANT.** Une police absente ne
   se signale pas (le navigateur retombe sur la plus proche), deux attributs
   `class` sur un élément et le second est ignoré en silence. Trois défauts
   invisibles à l'œil ont été trouvés ainsi cette session.
4. **L'écran passe devant le réseau** partout où le geste tient en un clic
   (`js/ecriture.js` — ne pas la recopier). Les formulaires font exception.
5. **Le FCH reste mis de côté** par Noé — ne pas l'entamer par petites touches
   (§ 3). Yuno, lui, a occupé toute la session du 15 (§ 0 ante undecies).

### L'état de la base, au soir du 15 août

| | |
|---|---|
| Événements | **15**, dont **13 vécus** (le Carnet de terrain) |
| Publications | **18 idées**, aucune datée, aucune publiée |
| Réseau | **47 fiches**, 7 rencontres (3 sans fiche) |
| Préparations | **1 feuille** (Red Star - Sochaux), **1 modèle** (« Match », 9 lignes) |
| Tâches · victoires · humeurs | 8 · 21 · 3 |
| Objectifs · commandes | **0** — jamais exercés avec de la matière |

**Toutes les migrations sont appliquées**, y compris
`20260815100000_publications_post_unique` (passée en fin de session : la
conversion des données avait été faite par l'API, le commentaire de colonne
attendait).

### Ce qui reste ouvert

- **« En chantier » est vide, et c'est le point à observer.** Les statuts
  intermédiaires (à développer, brouillon, prêt) n'ont jamais servi ; le bloc
  existe maintenant pour leur donner un lieu. Si dans une semaine il est encore
  vide, c'est le pipeline qui ne correspond pas à la façon de travailler de
  Noé — pas le bloc.
- **Aucune publication programmée.** Le plancher de 2/semaine n'est pas exercé.
- **Le FCH perd « Post »** : `FORMATS` est commun aux deux sites, et le format
  a fusionné avec « Carrousel ». Sans effet aujourd'hui (aucune publication
  FCH), à trancher le jour où il en aura.
- **Un décalage d'horloge** fait apparaître par intermittence
  `JWT issued at future` (PGRST303) au chargement : l'horloge de la machine
  contre celle de Supabase. Sans rapport avec le code, jamais reproduit sur le
  téléphone.

---

## 0 bis. Les Préparations (14–15 août)

Préparer une sortie — match, concert, commande — avec des modèles. Le cahier des
charges est dans `yuno-spec.md` (§4, `#yuno/preparations`) ; ici, l'état.

- **Quatre tables** (migration `20260814100000_preparations`) : modèles et leurs
  items, feuilles et les leurs. **Créer une feuille COPIE le modèle** — le bilan
  d'octobre doit refléter ce qui était prévu en octobre.
- **Trois phases** (avant · pendant · après), cases cochables à la forme des
  tâches, ajout d'une ligne en cours de route avec l'option « aussi au modèle »
  (la boucle d'apprentissage). **Un item non coché n'est jamais un raté** :
  aucun compteur de manqués nulle part.
- **Les modèles s'éditent depuis le site** (`#yuno/modeles/<id>`) : nom et items
  se corrigent en place, comme les modèles de messages.
- **Le bilan inscrit le moment au carnet** : deux questions, plus la photo et
  les rencontres, et une case « Noter ce moment au carnet » cochée d'avance —
  Noé reste l'auteur. Le moment naît lié à l'événement, son **type hérité** de
  la pastille posée à la création.
- **L'accueil montre la sortie du moment** et la phase courante de sa feuille
  (avant / pendant / après jusqu'à 24 h), avec les trois lignes qui restent —
  **cochables depuis l'accueil**.

**Vérifié en réel** sur le match du 14 août : feuille créée, items cochés et
décochés, bilan écrit puis effacé, moment lié généré avec sa victoire, tout
défait. **Reste à faire** : un seul modèle existe (« Match ») ; le choix entre
modèles est écrit mais n'a jamais servi en usage réel.

---

## 0 ter. La fusion des moments et des événements (14 août)

**La table `moments` a disparu** (migration `20260814125118`). Un événement
porte désormais **deux faces** : ce qui est *prévu* (date, lieu, `type_moment`,
sa préparation) et ce qui a été *vécu* (`vecu`, `photo_chemin`, `note`,
`oeuvre_finie`, ses rencontres). Le vocabulaire n'a pas bougé : l'interface dit
toujours « Moments vécus » et « Carnet de terrain ».

- **`vecu` se pose par un GESTE, jamais par le temps qui passe** : un match où
  Noé n'est pas allé ne doit pas compter.
- **« Retirer du carnet » efface la face vécue** — l'événement reste au
  calendrier. Le geste vit **sur la ligne du carnet**, plus dans la fiche.
- **Le carnet est passé en lignes** : 13 sorties tiennent en 548 px. Date en
  toutes lettres pour l'année en cours, en chiffres pour les précédentes.
- **Le « + » d'une rencontre ouvre la fiche complète** du réseau, pré-remplie
  (nom, « contact établi », dernier échange au jour de la sortie).

---

## 0 quater. Créer, refondue (15 août)

**Le constat qui a tout commandé** : 18 idées, toutes en statut « idée », zéro
programmée, zéro publiée. La page savait collecter, rien n'y faisait avancer.

**Elle raconte maintenant le chemin d'une idée** : `01` la carte du jour (avec
le geste de programmer dans son coin) → `02` Cette semaine → `03` En chantier →
les deux portes → les piliers repliés. Détail complet dans `yuno-spec.md`.

- **Trois familles de formes** : la carte pour le contenu, la **ligne** pour le
  flux, la tuile pour les portes.
- **Les vides montrent leur lieu** (l'icône du bloc, grande et pâle).
- **Le « + » de Créer et de la banque s'ouvre sans date** : une idée est une
  publication sans date.
- **La tuile de capture a gagné pilier et notes** — elle est le seul endroit où
  une idée s'écrit depuis que « Noter une idée » a disparu.

---

## 0 quinquies. L'identité visuelle (15 août)

- **Trois couleurs, trois rôles** : le gris foncé (le fond), l'**or** (l'état
  actif, les chiffres, l'action qui part), le **bleu** `#7198f4` (la matière
  créative). Le bleu vit **chez Yuno seulement**.
- **Les quatre piliers sont les quatre dernières nuances de la même échelle
  bleue** — identité et classement dans la même famille. Encre blanche mesurée
  à 7,21 · 9,26 · 11,97 · 14,99. Le coût est connu et accepté par Noé : en barre
  de 3 px sur une carte, les rangs 3 et 4 tombent à 1,29 et 1,03.
- **Les chiffres sont en Gilroy Heavy** — plus lourd que le Black, ce que les
  métadonnées ne disaient pas : trouvé en comptant les pixels encrés.
- **Les titres du site ont baissé d'un cran**, l'en-tête à signature a disparu,
  et **les liens nus prennent l'accent de leur espace** (il n'existait aucune
  règle : c'était le bleu du navigateur).
- **Plus aucun menu natif** dans le CRM (filtres, relation) ni dans la banque —
  sauf les 47 « Niveau ».

---

## 0 sexies. Ce qui a été retiré (15 août)

Toujours sur décision de Noé, et **jamais en détruisant des données** :

- **Le rendez-vous stats** : ~5 400 caractères de JS et 2 000 de CSS. La table
  `stats_hebdo` reste en base. Conséquence heureuse : « aucune métrique sociale
  nulle part » devient vrai sans exception.
- **« Œuvre finie »** : masquée par le drapeau `OEUVRE_VISIBLE` (cinq points
  d'un coup), la colonne garde ses valeurs. Elle était à 0 sur 13 sorties —
  c'était la seule mesure qui demandait de revenir cocher des jours après.
- **Le tirage « Je ne sais pas quoi poster »**, le formulaire « Noter une
  idée », le pli « Ajouter au réseau » du CRM : trois doublons de gestes qui
  existaient ailleurs, mieux placés.
- **Du code mort emporté avec eux** : `carteMoment`, `construireAVenir` chez
  Yuno, `boutonCapture`, `--pilier-N-fond` (déclaré depuis le 12 août, jamais
  lu), les deux fonctions d'API des stats.

---

## 1. Ce qui existe

> **Mis à jour le 27 août 2026 (seconde session).** Ce qui a changé ce jour-là
> et qui touche la structure : la colonne `projet` s'appelle **`espace`** dans
> les six tables qui la portaient, et **`js/espace-projet.js` est devenu
> `js/gabarits.js`** ; six tables sont nées — **`series`** (la répétition
> fabrique de vraies lignes), **`projets`** et **`projets_cibles`** (l'étage
> entre le jalon et la tâche), **`periodes`**, **`semaines`**, **`arbitrages`** ;
> et trois modules purs sont apparus — **`js/orientation.js`** (le calcul, qui
> ne touche ni au réseau ni au DOM) et **`js/rendez-vous.js`**.
>
> *Rappel du 26 août :* l'espace `#objectifs` est né, les trois pages espace
> sont des bilans à deux colonnes, la table `materiel` et la colonne
> `commandes.frais` sont apparues. **Le 28 août, `#objectifs` est devenu
> « Le cap »** — deux galeries de tuiles, les périodes en pied de page — et il a
> pris son onglet dans la barre (§ 0 ante ter, point 4).
>
> **Le 29 août au soir, six tables sont nées** — `projets_etapes` (le découpage
> déclaré d'un projet), `habitudes` et `habitudes_faits`, `livres`,
> `livres_seances` et `livres_citations`, plus `journees` (la ligne libre d'un
> jour). Deux colonnes se sont ajoutées à `publications` (`evenement_id`,
> `origine`) et une à `habitudes` (`automatique`). `victoires.source` accepte
> désormais `etape` et `habitude`.
>
> **Le 1er septembre au soir, deux ajouts au schéma** : la table
> **`semaines_blocs`** (l'arrangement des blocs d'une semaine, gardé d'une visite
> à l'autre) et la colonne **`journees.gratitude`**. Aucune table renommée,
> aucune colonne retirée.
>
> `CLAUDE.md` porte le détail à jour, et `docs/orientation-spec.md` la règle du
> jeu de l'orientation. **Les deux cahiers des charges des sites
> (`yuno-spec.md`, `fch-spec.md`) sont à jour** : ils ont reçu la nouvelle
> grammaire des barres du calendrier — Google Sans, la nature dite par la
> graisse — au matin du 1er septembre, et **rien de la session du soir ne touche
> à Yuno ni au FC Hermitage**. Ils restent l'autorité sur le détail de leurs
> écrans ; ce document n'en recopie rien.

Le hub est **déployé et fonctionnel** :
https://noedelahaye-sketch.github.io/hub/

| Surface | Adresse | État |
|---|---|---|
| Tableau de bord | `#dashboard` | complet |
| Tâches | `#taches` | toutes les tâches, datées ou non, faites ou non — priorité 1 à 4 |
| **Le cap** | `#objectifs` | deux galeries — les objectifs, puis les projets —, le détail se déplie sur place, les périodes ferment la page |
| **Perso** | `#perso` | **tableau de bord** : humeur, habitudes du jour, livre en cours, mot du jour, une intention relue |
| Ses habitudes | `#perso/habitudes` | élan, série en semaines, paliers de cumul |
| Sa bibliothèque | `#perso/bibliotheque` | le livre en cours et ses gestes, la pile, les citations |
| **Mes journées** | `#perso/journee` | **un calendrier mois/semaine** pour choisir un jour ; le détail s'ouvre en tuile volante — note du jour, habitudes cochables, relevé repliable, gratitude, journal |
| Calendrier global | `#calendrier` | grille mois/semaine + agenda ; on y pose, modifie et supprime |
| Formation | `#formation` | complet, avec la progression lue dans le gist Bac-3 |
| Page Yuno du hub | `#photo` | complète |
| **Site Yuno** | `#yuno` | Accueil · Journal · Créer · Calendrier · Réseau — plus les **Préparations** (`#yuno/preparations`, `#yuno/modeles`), sous l'onglet Journal |
| Page FCH du hub | `#fch` | complète |
| **Site FC Hermitage** | `#hermitage` | Accueil · Créer · Calendrier · Partenaires — « Club » attend son contenu |
| Perso | `#perso` | complet |

Trois applications installables (`index.html`, `yuno.html`, `hermitage.html`),
chacune avec son icône et son ouverture directe.

**Le site Yuno a été refondu les 11 et 12 août** selon le système « Terrain »
(voir `docs/yuno-spec.md`, réécrit) : l'accueil montre le vécu et non le
social, le Journal a remplacé le mur des victoires, la Passerelle muscle
l'aller-vers, les commandes ont rejoint Réseau, et les stats des réseaux
n'existent plus qu'un jour par semaine.

**Cinq entrées dans la barre, plus de sous-pages.** La navigation ne grandit
pas à chaque écran ajouté : la banque d'idées (`#yuno/banque`) garde l'onglet
Créer allumé, la Passerelle (`#yuno/passerelle`) et le carnet (`#yuno/carnet`)
gardent celui de Réseau. `ONGLET_DE_LA_VUE`, dans `js/yuno.js`, dit quel onglet
allumer pour quelle vue.

**Le calendrier est devenu une grille** (12 août) : mois, semaine, agenda. Un
événement de plusieurs jours est une barre continue, titrée une fois, placée en
couloirs. Glisser sur des jours ouvre une fenêtre volante pour y poser un
événement, une tâche, une publication ou un objectif ; cliquer une barre ouvre
son détail, d'où elle se modifie et se supprime ; la glisser la reporte. Les
filtres se cochent, et le « +N » déplie la journée.

**Les événements peuvent se répéter** (chaque semaine, quinzaine, mois).
*Depuis le 27 août, les occurrences sont de VRAIES LIGNES* reliées par
`serie_id` — elles ne se déduisent plus à la lecture, et chacune se termine,
se modifie et se supprime seule (§ 0 ante quater.1, point 1).

**La grille de 24 h a été retirée de la vue semaine** (13 août, demande de Noé).
Elle datait du 12 août et coûtait cher : vingt-quatre cases par jour, une
gouttière d'heures à aligner au pixel, un cadre commun pour rattraper le
décalage, et il fallait faire défiler pour trouver ce qu'on cherchait — une
semaine à trois rendez-vous, c'était vingt-et-une cases vides pour trois pleines.

**Ce qui la remplace**, et qui dit la même chose en une ligne :

- **La semaine est un mois d'une seule ligne** : sept cases, tout dedans, plus de
  bandeau séparé pour ce qui n'a pas d'heure.
- **L'heure s'écrit devant le titre** (`.cal-barre-heure`, en Geist Mono et plus
  pâle), dans les DEUX vues — mois compris. En semaine elle passe au-dessus du
  titre : quand, puis quoi.
- **L'ordre est chronologique.** `segmentsDeLaSemaine` trie sur trois clés dans
  cet ordre : le jour de départ, puis la longueur décroissante, puis l'heure.
  La deuxième garde la règle d'avant — une barre de trois jours mérite le
  couloir du haut, et son heure de départ ne veut rien dire ; la troisième range
  les éléments d'un même jour, 9 h au-dessus de 15 h.
- **La hauteur d'une barre est sa durée**, en semaine seulement : 2,5 rem par
  heure (`HAUTEUR_PAR_HEURE`). C'est tout ce qui reste de la grille horaire —
  non plus une échelle où tout se place, une simple proportion. En `min-height`
  et non `height` : un titre qui passe à la ligne peut dépasser, une barre ne
  coupe jamais son texte pour tenir dans sa durée. Pas en vue mois, où une case
  fait 7 rem : un match de deux heures y écraserait sa journée.
- **Le titre passe en 700.** À 11 px sur fond teinté, le poids normal se devinait
  plus qu'il ne se lisait, et le 600 restait timide. L'heure devant lui reste en
  400 et plus pâle.

**Et pour cela, Gilroy a reçu son Bold** (`fonts/Gilroy-Bold.woff2`, 43 Ko, tiré
des ressources FCH de Noé où la famille est complète, converti par
`tools/convertir-polices.py`). Le dépôt ne portait que 400, 500 et 600 — et
c'est un piège à connaître : **demander 700 ne faisait strictement rien**. Le
navigateur retombait sur le SemiBold en silence. Mesuré avant : « Red Star -
Sochaux » en 40 px faisait 358,92 px en 600 comme en 700. Après : 358,92 contre
359,48 — deux dessins différents, donc un vrai fichier. C'est le même piège que
les italiques de Canela en juin, en plus discret : là le navigateur inventait
une pente, ici il ignorait la demande sans rien signaler. **Vérifier une graisse
en mesurant, pas en la regardant.**

**Un piège de mise en page, mesuré.** Une barre haute comme sa durée doit écrire
son texte EN HAUT. Un `<button>` centre son contenu, et **ni `display: block`,
ni `flow-root`, ni `align-content: start` ne le défont** — les trois laissent le
texte à 58 px du haut d'une barre de 150. Seul un flex explicite
(`display: flex; flex-direction: column; justify-content: flex-start`) reprend
la main.

**Les tâches et les publications portent une heure** (12 août, migrations
`taches_heure` et `publications_heure`). Colonne `heure time` nullable dans les
deux tables. La convention à connaître : **minuit veut dire « pas d'heure »**
(`heureDe` ne regarde que ça), parce qu'une tâche sans heure part de
`depuisDateISO`. Le champ est offert dans le formulaire de tâche, dans celui
d'idée, et dans la fenêtre « Poser au calendrier ».
**« Quand » remplace « Échéance »** pour une tâche — une échéance est une date
qu'on subit, c'est le mot des objectifs et des commandes.

**Tâches est le deuxième onglet du hub**, entre Accueil et Perso (13 août,
demande de Noé) : c'est l'écran où l'on va le plus souvent après le check-in, il
n'avait pas à se gagner au bout de la rangée. Il fermait la rangée avec le
calendrier au titre des « vues transverses » — un raisonnement juste sur le
papier, démenti par l'usage. Le calendrier, lui, n'a pas bougé.

**L'onglet Calendrier est une icône, en dernière place** (13 août, demande de
Noé), dans les trois barres — le hub, Yuno et le FCH. Il ne nomme pas un lieu,
il ouvre la vue qui les traverse tous. **Dernier, mais DANS la rangée** : une
première version le poussait au bord opposé, Noé l'a fait revenir — une barre
avec un élément à part se lit comme deux barres. Le lien tout fait est
`ongletCalendrier`, dans `calendrier-commun.js`.

**« Poser au calendrier » est devenu la même tuile que la capture des Tâches**
(13 août, demande de Noé), et c'est la seule façon d'ajouter au calendrier —
hub, site Yuno et calendrier éditorial compris.

**Les pastilles s'adaptent à la nature**, c'est tout l'objet :

| Nature | Pastilles |
|---|---|
| Événement | Nature · Quand (heure, jusqu'au) · Espace · Durée · Répétition · Lieu et notes |
| Tâche | Nature · Quand (heure) · Espace · **Priorité** |
| Publication | Nature · Quand (heure) · Espace · Réseau · Format |
| Objectif | Nature · Quand (échéance seule) · Espace · Le pourquoi |

**Un choix se fait dans une LISTE, jamais dans un `<select>` natif.** C'était
l'erreur de la première version, et Noé l'a dite sans détour : « le rectangle
bleu avec un menu déroulant, c'est très laid et pas agréable ». Un menu du
système, avec son cadre bleu et son chevron, au milieu d'une tuile dessinée — et
surtout pénible au doigt : viser un contrôle de 30 px, puis une ligne dans une
roue. Chaque option est maintenant une ligne pleine largeur, avec son drapeau de
priorité ou sa pastille d'espace, **exactement comme dans l'espace Tâches**.
La valeur voyage dans un champ caché : les espaces lisent toujours le formulaire
avec `FormData`, ils n'ont pas à savoir comment on l'a saisie. Vérifié en posant
une tâche dont l'espace et la priorité viennent des listes : les deux sont en
base.

Conséquence sur le découpage : la **durée** sort du panneau « Quand » et le
**format** du panneau « Réseau ». Une liste de six durées ou neuf lignes
réseau+format empilées dépasseraient l'écran — et « où je poste » n'est pas
« sous quelle forme », ce sont deux décisions. Seules les dates et les heures
restent des champs natifs : là, le sélecteur du téléphone est ce qui se fait de
mieux.

Le titre change d'invite avec elle : « Nom de l'événement », « L'idée, en une
phrase », « L'objectif, formulé de façon mesurable ». « Quoi » convenait à tout
et ne disait rien.

**Le contrat avec les espaces n'a pas bougé** : les champs gardent leurs `name`,
le formulaire son `data-action`, les natures leur `data-nature-creation`. Ni
`calendrier.js` ni `yuno.js` n'ont eu à changer leur façon de LIRE ce qui est
posé — c'est la présentation qui a été refaite, pas les données. Ils gagnent
seulement deux lignes : `brancherCapture(section)` au montage, et un appel après
chaque rendu.

**Les panneaux sont tous dans le DOM, masqués.** Les valeurs vivent donc dans
leurs champs et non dans un état à part : ouvrir une pastille ne redessine rien,
rien de saisi ne se perd, et `fenetreCreation` reste la fonction pure que les
espaces appellent au rendu. Ils sont rendus **hors de la bande qui défile** —
son débordement masqué les découperait net.

**Le calendrier éditorial pose une publication par défaut**, plus un événement :
cette page ne montre QUE des publications, elle ne saurait même pas afficher ce
qu'on venait d'y créer.

**Deux bugs corrigés au passage :**

- **Le calendrier du hub jetait l'heure et la priorité d'une tâche.** Le
  formulaire demandait « à quelle heure », et `poser()` ne la transmettait pas —
  même chose pour la publication. Yuno, lui, les faisait suivre. Vérifié en
  posant une tâche à 18:30 en priorité 1 : les deux sont en base.
- **Toutes les fenêtres volantes du site Yuno étaient mal placées.**
  `.vue-entre` porte `animation: … both` sur `transform`, et un élément dont la
  transformation est animée devient le **repère** de ses descendants en
  `position: fixed` — le `fill-mode: both` faisant durer l'effet indéfiniment.
  Mesuré : une tuile censée être centrée à 391 px se calait à 496, et le fond
  assombri ne couvrait que la section au lieu de l'écran. La classe est
  maintenant retirée à `animationend`. Ça valait pour la fiche d'un moment,
  celle d'un contact, la note d'idée — pas seulement pour la tuile.

**Une tâche faite reste au calendrier**, barrée et en retrait, avec son cercle
coché (`◉`). `tachesDatees` ne filtre plus les faites : ce site ne fait pas
disparaître ce qui a été accompli, et c'est aussi ce qui permet de revenir sur
une case cochée par erreur.

**Le cercle d'une tâche se coche depuis le calendrier**, sans ouvrir son détail.
Impossible d'y mettre un vrai `<button>` — la barre en est déjà un, et deux
boutons ne s'imbriquent pas : c'est le gestionnaire de clics qui reconnaît la
cible, et il passe AVANT l'ouverture du détail. Au clavier, la fenêtre de détail
reste le chemin.

**Le calendrier se tient au clavier** : une tabulation pour y entrer, les
flèches pour s'y déplacer, Entrée pour poser. La grille est un groupe nommé, pas
un `role="grid"` — les barres sont des sœurs des cases, pas des cellules, et un
faux tableau vaut moins qu'un groupe honnête. Voir
[docs/calendriers-etude-ux.md](calendriers-etude-ux.md) pour le raisonnement
complet et ce qui reste ouvert.

**La forme du site Yuno a été reprise le 12 août**, sur quatre points :

- **Les portes** (`.lien-externe`) perdent leur barre d'accent à gauche et leur
  flèche à droite — dans le hub elles disaient « tu quittes le hub », à
  l'intérieur du site elles ne disaient plus rien. Elles font 15 rem de large,
  hautes et étroites, plus jamais toute la ligne.
- **L'accueil montre un mur de photos** à la place des trois dernières fiches :
  une frise sur **une seule ligne** sous les compteurs, tirée au sort une fois
  par jour (la date sert de graine — stable dans la journée, change à minuit,
  rien n'est stocké). Dix photos au-delà de 1080 px, cinq en dessous.
  Emplacements en 3:4 (le format des photos de Noé), sans cadre ni coins
  arrondis, et `cover` : une autre proportion est recadrée, jamais déformée ni
  posée entre deux bandes. Plus de titre « Derniers moments ». Un moment sans
  photo n'y figure pas.
- **Le carnet de terrain ne porte plus que des moments** (13 août, demande de
  Noé). Il mêlait aussi les victoires nées ailleurs — une tâche terminée, une
  commande livrée, un jalon atteint : « Publier trois reels » au milieu des
  matchs couverts, ce n'est pas du terrain. Ce qui se coche à l'écran continue
  de créer sa victoire en base et remonte au dashboard du hub ; c'est de là
  qu'elle se retire, le Journal n'offre plus ce geste. `etat.victoires` et le
  bouton `×` sont partis avec — Yuno ne lisait plus cette table que pour ça,
  d'où **une requête de moins** au Journal.
- **Le Journal porte le même mur, entier** : rien de tiré au sort, rien de
  caché, toutes les photos du plus récent au plus ancien, sur autant de lignes
  qu'il en faut. Les fiches complètes restent en dessous.
- **Une vignette ouvre son moment en fenêtre volante** (type, date, lieu,
  rencontres, note, photo en grand), et non plus l'image nue dans un onglet.
  Même fenêtre depuis les deux murs. La fiche du carnet ne répète plus la
  photo — la frise est juste au-dessus.
- **Un moment se corrige** depuis sa fenêtre : un bouton crayon retourne la
  fenêtre en formulaire (date, type, lieu, note, œuvre finie, **et la photo,
  qui se remplace**). Pas les rencontres — elles vivent dans leur propre table
  et demanderont leur geste. `api.modifierMoment` met à jour le titre de la
  victoire au passage, sinon le dashboard du hub garderait l'ancien nom. La
  nouvelle photo part avant l'écriture, l'ancienne n'est effacée du stockage
  qu'après : une suppression ne se rattrape pas.
- **Nouvelle page `#yuno/editorial`** : la grille du calendrier réduite aux
  seules publications, la banque d'idées en colonne à droite, et **glisser une
  idée sur un jour la programme** (souris seulement). Une porte à icône, en bas
  de Créer, y mène.
- **Créer perd deux titres de section et son formulaire déplié** : deux grandes
  portes à icône côte à côte (calendrier éditorial, banque d'idées), et « Noter
  une idée » devient un bouton à côté de « Je ne sais pas quoi poster », qui
  ouvre une fenêtre volante.
- **Le CRM ouvre ses fiches**, en tuile comme en ligne de tableau : une fenêtre
  volante avec structure, moyens de contact, dernier échange, objectif,
  prochaine action et notes, et un crayon qui la retourne en formulaire (nom,
  type, structure, statut, Instagram, e-mail, téléphone, notes). Le clic ouvre
  la fiche **sauf** sur un lien, un bouton, une liste ou un champ — sinon
  changer un statut dans le tableau ouvrirait une fenêtre par-dessus.
- **L'accueil ne porte plus aucune porte** : ni vers le Journal, ni vers Créer,
  et la banque d'idées n'y déborde plus. Ces lieux sont dans la barre.
- **La typographie a un système de rôles** : la police dit la nature, la posture
  dit qui parle, la graisse dit l'importance. Le tableau complet est dans
  `yuno-spec.md` — c'est lui qui fait autorité.
- **Les deux italiques de Canela Deck ont été installés.** Sans fichier
  italique, le navigateur simulait la pente et cassait l'espacement après chaque
  accent. Règle retenue : ne jamais demander une graisse ou une posture dont le
  fichier n'existe pas.

**Données réelles en base, au soir du 14 août** : 45 fiches au réseau (dont
trois portent un niveau de Passerelle), 15 idées avec leur pilier, 4 modèles de
messages, 1 moment avec sa photo, 2 événements, 3 humeurs, et **8 tâches
saisies par Noé lui-même**. Aucun objectif, aucune commande : ces deux-là n'ont
toujours jamais été exercés avec de la matière.

**Noé s'en sert pour de bon.** Il a coché une tâche depuis son téléphone, noté
son humeur (« Fatigué mais excité, content de ce qui m'attend — match ce soir »)
et posé quatre tâches pour aujourd'hui. Les écrans ne se jugent plus à vide, et
c'est ce qui a fait remonter la plupart des demandes de ces deux jours.

---

## 2. Ce qui a été vérifié, et comment

**Le 28 août** : la famille écrite et corrigée sur ses quatre chemins, un jalon
coché puis décoché (victoire créée puis retirée), un projet posé sans cap puis
supprimé, les quatre états changés depuis la tuile — chaque fois relu en SQL, et
chaque ligne d'essai retirée ensuite. Le détail est en § 0 ante ter, point 5.

**Les chemins d'écriture de Yuno l'ont été, en conditions réelles** (12 août) :
une session était ouverte dans le navigateur de travail. Ont été exercés puis
défaits, avec vérification en SQL que la base revenait à son état exact :
loguer et retirer un moment (avec ses rencontres et sa victoire), donner un
niveau à un contact, « Envoyé ✓ », les champs vifs de la Passerelle, le cycle
complet d'une commande, la création et l'édition d'un modèle, une idée menée
jusqu'à publiée, un rendez-vous stats, et l'invite du calendrier jusqu'au
moment inscrit.

La méthode reste la même pour l'affichage, et elle vaut d'être reprise :

- Les fonctions `construire*` ne fabriquent que du HTML à partir de données
  déjà chargées. Elles s'importent et s'appellent seules dans le navigateur,
  avec des données factices.
- La logique pure se teste de la même façon : tri, filtres, recherche, ordre
  des colonnes, calculs du gist, et depuis « Terrain » — le tirage de la
  semaine, le décompte des jours avant le rendez-vous, la fenêtre de l'invite,
  la progression d'une relation après un envoi, l'ordre de la file.
- **Ce qui reste non vérifié** : le glisser-déposer des colonnes, et les chemins
  d'écriture de `formation` et `perso`. (Le 13 août a levé le reste : le cochage
  d'une tâche a été exercé pour de vrai — créée, cochée, décochée, supprimée,
  base relue en SQL à chaque étape — et le calendrier du FCH aussi, ce qui a
  d'ailleurs révélé qu'il ne s'affichait pas du tout, cf. § 2 bis bis.)

**Les deux murs de photos ont été vérifiés ainsi** (12 août), avec de faux
moments et des images SVG en 3:4 comme en 3:2, sans rien écrire en base :

- **L'accueil** (`construireMurPhotos`) : dix vignettes montées, les moments
  sans photo écartés, tirage identique pour le 12 août et différent pour le 13,
  et **une seule ligne à toutes les largeurs** — cinq vues en 375 px (65 × 87),
  dix en 1280 (114 × 152). La photo réelle du carnet (2160 × 2880, du 3:4 pile)
  remplit son emplacement au pixel près ; une image en 3:2 s'y recadre.
- **Le Journal** (`construireMurComplet`) : 24 faux moments, **24 visibles**,
  aucun caché, ordre du plus récent au plus ancien vérifié un par un, cinq par
  ligne en 375 px et dix en 1280. Pas de débordement horizontal.

**Deux chemins d'écriture ont été exercés sur les vraies données** (12 août),
avec relecture en base avant et après :

- **Corriger un moment** : le formulaire renvoyé **sans rien changer**. La ligne
  est identique champ par champ après coup, rencontres comprises. Le chemin est
  donc éprouvé sans que la donnée bouge.
- **Corriger un contact** : même méthode, sur la fiche d'Aaron Wan Bissaka.
  Identique champ par champ après coup.
- **Programmer une idée au glissement** : deux idées déposées sur des jours,
  `date_prevue` vérifiée en base, puis **remises à `null`**. État final relu :
  quinze idées, aucune datée — exactement l'état de départ.

**Un piège de forme, trouvé là.** `.bouton-retirer` est en `opacity: 0` et ne se
révèle qu'au survol d'un `.bloc li` (styles.css). Déplacé dans une fenêtre
volante, cet ancêtre n'existe plus : le bouton y était **invisible pour de
bon**, sans que rien ne le signale — ni erreur, ni boîte vide, il occupait sa
place. Mesurer `getBoundingClientRect` ne suffit pas : il faut lire l'opacité
calculée.

**La tuile sautait à chaque pastille touchée, sur téléphone** (13 août, signalé
par Noé : « ça donne mal au cœur »). Il avait le bon diagnostic — « il faut
garder le texte constamment ouvert même quand je choisis les paramètres ».

**La chaîne, du symptôme à la cause** : toucher une pastille redessinait la
tuile → le champ du titre était détruit → **le clavier se refermait** → la
fenêtre visuelle redevenait grande → `--bas-clavier` retombait à zéro → la tuile
se replaçait au milieu d'un écran plus grand → elle sautait, puis re-sautait
quand le clavier revenait. Un déplacement par pastille.

**Trois corrections, dans cet ordre d'importance :**

1. **Les panneaux ne redessinent plus rien.** Les trois vivent en permanence
   dans le DOM, masqués ; ouvrir une pastille ne fait que basculer un `hidden`,
   et choisir une valeur réécrit l'étiquette en place. Le champ du titre n'est
   jamais détruit. (La tuile du calendrier fonctionnait déjà ainsi — c'est celle
   des Tâches qui a été alignée dessus.) L'envoi aussi se vide en place : entre
   deux notes enchaînées, le clavier ne cligne plus.
2. **Une pastille ne prend jamais le focus.** `pointerdown` annulé sur les
   pastilles, les choix et la flèche d'envoi : c'est le moment où le navigateur
   décide de déplacer le curseur, l'annuler suffit et le clic suit son cours.
   Les champs de date et d'heure ne sont pas dans la liste — eux en ont besoin.
3. **La page derrière ne défile plus** (`body:has(.capture) { overflow: hidden }`).
   Un fond qui glisse sous une tuile fixe donne le tournis. En `:has()` plutôt
   qu'une classe posée en JS : la tuile s'ouvre depuis quatre endroits, et
   quatre endroits où penser à poser ET retirer une classe, c'est trois oublis
   en puissance.

**Il reste UN déplacement, et il est voulu** : à l'ouverture, quand le clavier
monte. Il est passé en transition (`transition: top 220ms`) — la tuile **monte**
au lieu de sauter, ce que Noé demandait. `prefers-reduced-motion` l'annule avec
le reste.

**Mesuré, clavier simulé à 336 px** : cinq allers-retours dans les pastilles,
**0 px de déplacement** ; le champ est le même objet du début à la fin, le focus
ne le quitte jamais, le titre est conservé. Idem sur la tuile du calendrier
ouverte depuis le « + » de l'accueil.

**Un piège que `node --check` ne voit pas** (13 août, rencontré deux fois dans
la même session). Un accent grave dans un commentaire HTML, à l'intérieur d'un
gabarit JS, **ferme la chaîne** : `pas un \`<li>\` qui écoute` devient
`"…" < li > "…"`, une comparaison. C'est du JavaScript **valide** — la
vérification syntaxique passe, et l'erreur ne tombe qu'à l'exécution
(`li is not defined`), en cassant tout l'écran. Ne pas écrire de nom de balise
entre accents graves dans un commentaire de gabarit ; et se rappeler que
`node --check` ne remplace pas un chargement dans le navigateur.

**Un piège de vérification, rencontré deux fois.** Les outils de navigation ne
rechargent pas le document quand seul le fragment (`#…`) change : le module JS
et l'état en mémoire restent ceux d'avant l'édition. Deux fausses alertes en
sont venues. Forcer un vrai `location.reload()` avant de conclure.

Pour vérifier localement : `node tools/static-server.js` puis
http://localhost:4173 (`file://` ne marche pas, les modules ES sont bloqués).

---

## 2 bis. Le poids des photos — le vrai frein

**Une photo de moment pèse 5,3 Mo.** Mesuré le 12 août sur la première du
carnet (2160 × 2880). Le mur de l'accueil en monte dix : **environ 53 Mo par
visite**, largement devant tout le reste — les 11 requêtes Supabase du démarrage
ne pèsent rien à côté.

**Les transformations d'image de Supabase ne sont pas disponibles** sur ce
espace (fonction payante). Piège vérifié : `createSignedUrls(..., { transform:
{ width: 400 } })` **ne renvoie aucune erreur** — le SDK accepte l'option, rend
une URL `/object/sign/` ordinaire au lieu de `/render/image/sign/`, et sert
l'original. Poids mesuré avec et sans : identique, 5 452 Ko. Ne pas conclure
d'un appel qui réussit que la transformation a eu lieu ; vérifier la forme de
l'URL, ou peser la réponse.

**C'est réglé pour les photos à venir** (choix de Noé, 12 août 2026) :
`reduirePourLeCarnet` ramène toute photo à **2400 px de côté long, qualité 85**
avant l'envoi. Mesuré sur la sienne : 5 452 Ko → **819 Ko, ÷7**, en 1800 × 2400.
Invisible à l'usage — la photo n'est jamais affichée à plus de 1158 × 900, même
sur un écran à trois pixels par point ; la comparaison à l'écran, y compris
agrandie 3×, ne montre rien. **L'original n'est pas conservé** : le hub n'est pas
l'archive de Noé.

Trois précautions dans la fonction, chacune vérifiée : la rotation EXIF est
appliquée (`imageOrientation: 'from-image'`, sans quoi un portrait de téléphone
repartirait couché) ; une image déjà sous la barre ressort **intacte**, sans
ré-encodage ; un décodage impossible (un HEIC que le navigateur ne lit pas)
renvoie le fichier d'origine plutôt que de perdre la photo.

**Les trois photos déjà envoyées restent lourdes.** Pour elles, il faudrait soit
les renvoyer à la main, soit **activer les transformations Supabase** (plan
payant).

En attendant, les vignettes portent `loading="lazy"` et `decoding="async"`, et
l'`aspect-ratio: 3/4` du CSS empêche déjà tout saut de mise en page. **Ne pas
ajouter d'attributs `width`/`height`** : essayé, ils cassent la mise en page —
le `height` l'emporte sur l'`aspect-ratio` et la vignette part à 113 × 400 au
lieu de 113 × 150.

**L'espace Tâches est né le 13 août**, à la demande de Noé, sur la forme de
Todoist (capture à l'appui) : `#taches`, migration `taches_priorite`.

- **Il ne cache rien** — datées ou non, faites ou non, tous espaces. C'est sa
  raison d'être : ailleurs le hub trie (le dashboard ne montre que les actives,
  un espace replie son backlog), ici on vient voir l'ensemble et ranger.
- **`priorite` int 1–4, défaut 4.** Convention de Todoist : 1 le plus urgent, 4
  le cas ordinaire. Le défaut n'est pas 1, et c'est le point — une tâche n'est
  pas prioritaire parce qu'elle existe, et une liste où tout est en 1 ne classe
  plus rien. Entier borné par un CHECK plutôt qu'un texte : une priorité se
  trie, et l'ordre alphabétique de « haute » et « basse » ne veut rien dire.
- **`priorite` ne remplace pas `statut`** : l'un dit combien la tâche compte,
  l'autre où elle en est. La règle des 3 actives par espace reste entière, et
  `api.changerStatutTache` la tient toujours.
- **Le tri** : priorité, puis date, puis ancienneté — et **à priorité égale, une
  tâche datée passe avant une tâche sans date**. C'est le seul endroit du hub où
  l'absence de date fait reculer quelque chose ; assumé, cette page sert à
  choisir quoi faire.
- **Décocher une tâche retire sa victoire** (`api.supprimerVictoireDeLaTache`).
  Le dashboard le faisait déjà, mais il gardait l'identifiant sous la main — il
  venait de la créer. Ici on rouvre des tâches terminées il y a des jours, il
  faut la retrouver par sa source.
- **Ce qui NE vient pas de Todoist : la date passée n'est pas rouge.** Todoist
  écrit « Hier » en rouge ; le hub n'a pas de couleur d'alerte et n'en aura pas.
  Une échéance dépassée se dit du même gris que les autres, et le cercle ne
  change pas de couleur avec le temps qui passe. Les quatre couleurs de priorité
  disent une **intensité choisie par Noé**, pas un jugement de l'application —
  d'où une rampe chaude qui descend jusqu'au gris, et une terre cuite (`--prio-1`)
  volontairement distincte de `--erreur`.
- **Le refus des 3 actives se dit en ligne**, pas dans une boîte native : c'est
  la règle qui parle et propose une sortie, pas une panne. Il s'efface au geste
  suivant — le laisser traîner en ferait un reproche permanent — et **il n'est
  pas journalisé en `console.error`** : ce qui s'y trouve doit mériter d'être
  regardé.
- **La croix de retrait ne se cache pas derrière le survol** ici. Ailleurs elle
  est en `opacity: 0` et se révèle à la souris ; sur un téléphone il n'y a pas
  de survol, et supprimer une tâche deviendrait impossible.
- **Une liste, pas des tuiles.** `.bloc li` est annulé pour cette liste, barre de
  espace comprise : vingt tâches en vingt cartes feraient un mur, et la barre
  ferait double emploi avec le nom de l'espace.
- **Une ligne s'ouvre pour se corriger** (13 août, demande de Noé) : appuyer sur
  la tâche rouvre la tuile, remplie de ce qu'elle contient, et la flèche
  enregistre au lieu de créer. C'est un vrai `<button>`, pas une ligne qui écoute
  les clics — au clavier comme au lecteur d'écran, une tâche s'ouvre. Après une
  correction la tuile se referme : on n'enchaîne pas des corrections comme on
  enchaîne des notes.
- **La ligne de service ne dit plus la priorité**, seulement la date **et le
  espace, juste à côté d'elle** : le cercle dit déjà la priorité par sa couleur,
  et les deux autres disent où et quand se situe la tâche — ils vont ensemble.
  Les sélecteurs en ligne ont disparu avec elle : tout se corrige dans la tuile.
- **Le bouton « nouvelle tâche » flotte en bas à droite**, dans un rond plein.
  Il est là où le pouce arrive et ne bouge pas quand la liste défile. Pas de
  `z-index` : le fond assombri de la tuile est à 40, il passe donc devant dès
  qu'on ouvre — ce qui est juste, on n'ajoute pas une tâche pendant qu'on en
  écrit une. L'espace gagne 5,5 rem de marge basse pour que la dernière ligne
  reste lisible dessous.

**La capture a été refaite le même jour**, sur un deuxième puis un troisième jeu
de captures de Noé : un « + » ouvre une **tuile volante**, on écrit le nom
directement, et **une rangée de pastilles** — date, espace, priorité — ouvre
chacune son choix en menu flottant. Le formulaire à six champs empilés a
disparu.

- **La tuile flotte au-dessus de la page assombrie**, et pas au même endroit
  selon l'écran (état arrêté le 13 août, après trois formulations de Noé) :
  **collée au clavier sur téléphone** — en bas au repos, elle remonte
  exactement de sa hauteur quand il apparaît — et **au milieu sur ordinateur**,
  où il n'y a pas de clavier auquel se coller et où une tuile posée en bas
  laisserait un vide au-dessus d'elle. Elle réutilise `.fenetre-fond`, le fond
  des autres fenêtres.
  Une tuile posée sur le clavier, c'est la place d'un champ qu'on remplit : le
  pouce n'a pas à traverser l'écran entre le mot et la touche.
- **Connaître la hauteur du clavier**, c'est `visualViewport` et rien d'autre :
  `innerHeight` ne bouge pas quand il monte, seule la fenêtre visuelle
  rétrécit, et la différence entre les deux EST sa hauteur. Le résultat sort en
  variable CSS (`--bas-clavier`) plutôt qu'en style direct — c'est la feuille de
  style qui décide quoi en faire, et sur grand écran elle n'en fait rien.
  **Vérifié** avec un clavier simulé à 336 px : la tuile passe de 16 px à
  352 px du bas, soit **336 px de montée au pixel près**, et le panneau de date
  tient entier au-dessus (haut à 92 px). Sur ordinateur, centrée à 0 px près.
- **Attention à l'ordre dans la feuille** : le `@media` qui centre sur grand
  écran doit venir APRÈS `.capture` et `.capture-popover`. À spécificité égale
  c'est la position qui tranche, et placé avant, il ne s'appliquait pas.
- **Le fond ne bouge plus d'un pixel** (13 août, captures de Noé à l'appui : la
  page descendait à chaque appui sur « + »). La cause : sur iPhone, ouvrir le
  clavier fait défiler **le document** pour « amener le champ à la vue » — même
  quand ce champ vit dans un élément `position: fixed` déjà visible. Safari ne
  regarde pas où le champ est réellement affiché.
  **`overflow: hidden` sur le corps ne suffit pas sur iOS** : il faut sortir le
  document du flux. On retient la position, on fixe le corps décalé d'autant
  (`body.fond-fige`, `top: -Ypx`) — l'écran ne bronche pas au moment de la
  bascule — et on rend la position en refermant.
  **Le déclenchement est dans `app.js`**, par un `MutationObserver` qui regarde
  `.capture` apparaître, et non dans les quatre espaces qui ouvrent une tuile :
  quatre endroits où penser à figer ET à libérer, c'est trois oublis en
  puissance.
  **Vérifié**, page en haut et page défilée à 300 px : le titre reste au même
  pixel avant, pendant et après ; la position est rendue exactement ; le bouton
  flottant ne bouge pas malgré le corps devenu fixe ; et la navigation entre
  espaces ne laisse jamais le corps figé derrière elle.
- **Ni `overflow`, ni `max-height` sur la tuile** : les menus se posent au-dessus
  d'elle, donc hors de sa boîte, et un conteneur de défilement les découperait.
  Piège rencontré en écrivant la règle.
- **Plus arrondie que les cartes** (demande de Noé, 13 août) : `--rayon-tuile`,
  26 px contre 16. C'est un quatrième rôle et non une exception — une carte se
  pose dans la page, la tuile vole au-dessus d'un fond assombri. Ses panneaux
  partagent le rayon : c'est le même objet, ce sont les mêmes coins. Un seul
  jeton, donc partout où elle apparaît d'un coup — l'accueil, les Tâches, les
  deux calendriers, les deux sites ; rien dans `yuno.css` ni `fch.css` ne
  redéfinit `.capture`.
- **Sans contour**, à la demande de Noé : sur un fond obscurci, l'ombre suffit à
  la détacher, un trait de plus ne dirait rien de nouveau.
- **Le fond de cette fenêtre-là est à 65 %, pas 45 %.** Le réglage commun
  suffit pour une fiche qu'on consulte ; ici l'onglet actif et le filtre choisi
  sont des aplats d'accent clair sur thème sombre, et ils **traversaient** —
  constaté sur capture, corrigé, revérifié. Le sélecteur est
  `.fenetre-fond.capture-fond` et pas `.capture-fond` seul : à égalité de
  spécificité c'est l'ordre du fichier qui tranche, et `.fenetre-fond` est
  déclarée plus bas. Une demi-heure perdue à regarder une règle appliquée qui
  ne s'applique pas.
- **Le « + » reste en place** quand la tuile s'ouvre : sans lui, la liste
  remonterait d'un cran à l'ouverture et redescendrait à la fermeture.
- **Les menus flottent AU-DESSUS de la tuile**, jamais en dessous : elle est
  collée au bas de l'écran, un panneau déplié vers le bas sortirait de la vue.
- **Le menu de priorité suit le modèle de près** : un drapeau plein et coloré de
  1 à 3, vide pour la 4, le libellé en toutes lettres, et un filet entre les
  lignes qui **commence après l'icône**. La couleur est sur le drapeau, pas sur
  le libellé — quatre lignes de texte coloré se liraient comme quatre états
  actifs, alors qu'un seul est choisi.
- **La rangée ne passe jamais à la ligne, et l'envoi prime** (demande de Noé) :
  les pastilles vivent dans une bande qui **défile latéralement**, le bouton
  garde sa taille et sa place quoi qu'il arrive. Une tuile dont la hauteur
  change selon le nombre de pastilles se déplacerait sous les doigts.
  La ligne qui fait tout est **`min-width: 0` sur la bande** : sans elle, un
  conteneur flex refuse de rétrécir sous la largeur de son contenu
  (`min-width: auto` par défaut) et les pastilles pousseraient le bouton hors de
  la tuile au lieu de défiler. **Vérifié** en gonflant les libellés et en
  ajoutant une pastille : 421 px de débordement, et le bouton n'a pas bougé d'un
  pixel — même position, même taille, rangée toujours à 34 px de haut.
  Un fondu marque le côté vers lequel il reste à défiler, posé en JS et
  recalculé au redimensionnement : une pastille estompée alors que tout tient
  serait un mensonge.
- **L'envoi est une flèche dans un rond plein**, en bout de rangée (demande de
  Noé, sur le modèle) : la tuile n'a qu'une action, la nommer était redondant, et
  le mot « Ajouter » prenait la place d'une pastille. **Éteinte tant qu'il n'y a
  pas de titre** — c'est la seule chose que la tâche exige, et un bouton qui
  refuse en silence vaut moins qu'un bouton éteint. Elle s'allume sur `input`,
  pas au redessin : redessiner à chaque lettre ferait perdre le curseur.
- **Il n'y a plus de bouton « Annuler ».** On quitte en appuyant hors de la
  tuile, et **une question s'affiche alors dans la tuile** : « Abandonner cette
  tâche ? · Continuer · Abandonner ». Elle vit là, pas dans une boîte native :
  c'est le hub qui parle, du même ton que partout.
  **Elle ne se pose que s'il y a quelque chose à perdre** — un titre commencé,
  une date, une priorité. Sur une tuile intacte, l'appui dehors ferme tout de
  suite : confirmer l'abandon de rien serait une question pour rien. L'espace
  ne compte pas dans ce calcul : il a un défaut, le laisser tel quel n'est pas
  un travail commencé.
- **Échap referme en trois temps** : d'abord le menu ouvert, puis — s'il y a de
  quoi — la question, et Échap sur la question vaut « non ». Le geste
  d'annulation ne peut pas être celui qui détruit. Le fond déclenche la même
  question ; un clic dans la tuile hors menu ne referme que le menu. Les six
  chemins sont vérifiés.

- **Le nom suffit à créer.** Le reste se pose quand on en a envie, et se voit
  d'un coup d'œil : une pastille renseignée affiche sa valeur au lieu de son
  libellé, et celle de priorité prend sa couleur.
- **La date offre les raccourcis de la capture** : aujourd'hui, demain, ce
  week-end, la semaine prochaine, chacun avec son jour à droite — puis un champ
  libre et une heure. « Ce week-end » veut dire samedi, **sauf le samedi et le
  dimanche où c'est aujourd'hui** : un samedi, personne n'entend « samedi
  prochain ».
- **Ce panneau a dû maigrir** : à 365 px, clavier ouvert, il sortait par le haut
  et « Aujourd'hui » — le raccourci le plus utile — devenait invisible, donc
  intouchable. Ramené à **253 px** : lignes à 2,5 rem au lieu de 2,75, et les
  champs jour et heure **côte à côte** au lieu d'empilés (70 px gagnés). Il est
  en plus borné à la place réellement disponible au-dessus de la tuile, clavier
  déduit — `calc(100vh - var(--bas-clavier) - 13rem)` sur téléphone,
  `calc(50vh - 6rem)` sur ordinateur où la tuile est centrée. **Vérifié avec un
  clavier simulé à 336 px** : le panneau commence à 33 px du haut, « Aujourd'hui »
  est entier à l'écran, et rien n'a besoin de défiler.
- **Le réglage backlog / active est masqué, et toute tâche naît active**
  (13 août 2026, décision de Noé — « pour le moment »). La pastille de statut a
  disparu des lignes, et le « ↓ » qui renvoyait au backlog a disparu des espaces
  espace. Les quatre endroits qui créent une tâche posent `statut: 'actif'` :
  la capture des Tâches, les deux calendriers, les pages d'espace.

  **Ce que ça coûte, et c'est assumé** : le plafond de **3 actives par espace**
  n'est plus jamais exercé — rien n'appelle `changerStatutTache`, et `creerTache`
  ne l'a jamais vérifié. Le bloc « Aujourd'hui » du dashboard ne filtre donc
  plus : il montre les 9 premières tâches, plus « les 3 chantiers de chaque
  espace ». C'était le mécanisme central de la règle « réduire la charge
  mentale » de `CLAUDE.md` ; il est en sommeil, pas supprimé.

  **Rien n'a été jeté** : la colonne, `MAX_TACHES_ACTIVES`, `changerStatutTache`
  et son message de refus sont tous en place. Réafficher la pastille suffit à
  tout rallumer. Le backlog reste lisible dans les espaces s'il contient
  encore quelque chose d'ancien — il se replie tout seul quand il est vide,
  c'est-à-dire toujours désormais.
- **La capture reste ouverte après l'envoi**, vidée, espace et priorité gardés :
  on en note rarement une seule.
- **Trois pièges de redessin, tous rencontrés :**
  1. Le titre vit dans le champ, pas dans l'état, tant qu'on tape. `rendreCapture`
     le relit avant de réécrire — sinon ouvrir la pastille de date effacerait ce
     qu'on vient d'écrire.
  2. Conséquence directe : après un envoi, **vider l'état ne suffit pas**, il
     faut vider le champ AVANT de redessiner, sans quoi la relecture réécrit
     l'ancien titre. Vu à l'essai, le champ gardait le titre de la tâche créée.
  3. Les champs date et heure du panneau **ne redessinent pas le panneau** :
     recréer un `<input type="date">` pendant qu'on s'en sert referme le
     sélecteur natif du téléphone. Seule l'étiquette de la pastille est réécrite.
- **Deux règles de forme rattrapées à la mesure**, pas à l'œil : le champ du nom
  est en **17 px en dur** — `1,0625rem` tombait à 15,94 px avec la racine à
  15 px, juste sous la barre des 16 en dessous de laquelle Safari iOS zoome au
  focus ; et les pastilles font 2,25 rem, la hauteur des filtres. Pas 2,75 :
  trois pastilles à 44 px feraient de la capture un formulaire, alors qu'elle
  doit rester une ligne qu'on remplit debout.

**Vérifié en conditions réelles** (13 août), la table `taches` étant vide au
départ : le dessin d'abord avec six tâches factices (ordre du tri, section
« Faites » repliée et à l'envers, filtre par espace, couleur des cercles), puis
**le vrai chemin d'écriture** — créer, changer la priorité en ligne, renvoyer au
backlog, cocher (victoire créée en base, relue en SQL), décocher (victoire
retirée), supprimer. Puis quatre tâches pour éprouver le refus des 3 actives.
Puis la capture refaite : ouverture, saisie, les trois pastilles une à une, deux
tâches créées d'affilée. Tout a été défait à chaque fois : la base est revenue à
**0 tâche et 1 victoire**, son état exact de départ. Zéro erreur en console, pas
de débordement horizontal à 375 px, cercles à 43 px de cible tactile.

**Le dashboard a été refondu sur trois points** (13 août, demande de Noé) :

- **« Ta semaine » est devenu un aperçu du calendrier hebdomadaire**, à la place
  de sa liste : la vraie grille, tous espaces ET toutes natures confondus —
  événements, tâches, publications, objectifs, jalons, commandes, relances.
  C'est `construireGrille` en vue semaine, la même fonction que l'espace
  Calendrier : **une seule façon de dessiner une semaine dans tout le hub**.
  `assemblerSemaine`, qui fusionnait trois sources à la main pour ce seul bloc,
  a disparu — la grille assemble elle-même.
- **« Aujourd'hui » a pris la forme exacte de l'espace Tâches** : cercle coloré
  par priorité, titre, date et espace. `ligneTache` est devenue empruntable
  (`construireLignesTaches`), avec deux réglages en moins ici — pas de tuile
  pour corriger sur cette page, et supprimer une tâche n'a rien à faire dans un
  check-in du matin. Le cercle est un bouton et non plus une case : le
  gestionnaire du dashboard a suivi.
  Ce qu'il montre : les tâches **à faire aujourd'hui ou qui l'étaient déjà**
  (`tachesEcheanceJusqua(aujourd'hui)`, sans borne basse — le hub ne compte pas
  les retards, il ne les efface pas non plus).
- **Les deux blocs ont été inversés** : « Aujourd'hui » passe avant « Ta
  semaine ». Ce qui se fait dans la journée vient avant ce qui se prépare, et
  « Aujourd'hui » n'est plus le bloc discret du bas. `CLAUDE.md` a été mis à
  jour — c'était son ordre 4/5.

- **Le « + » du dashboard** (13 août, demande de Noé) : le même bouton flottant
  que l'espace Tâches, au même endroit, mais il ouvre **la tuile du calendrier**
  — donc tout ce qui a une date, pas seulement une tâche. Il s'ouvre **sur une
  tâche** : depuis l'accueil, neuf fois sur dix ce qu'on note est une chose à
  faire, et les autres natures restent à une pastille. Ce qui vient d'être posé
  se relit aussitôt : la semaine et « Aujourd'hui » se rechargent, sinon on
  écrirait dans le vide.

**Les espaces se relisent quand on y revient** (13 août, demande de Noé). Un
espace n'était monté qu'une fois : une tâche posée depuis le calendrier restait
invisible sur l'accueil jusqu'au prochain rechargement de la page.

Chaque espace pose maintenant un **`rafraichir()` facultatif**, comme il pose
déjà `naviguer()`, et le routeur l'appelle quand on revient dessus. Les sept en
sont équipés : accueil, tâches, calendrier, formation, perso, la page Yuno et
la page FCH, plus les deux sites.

**Il ne fallait surtout pas remonter l'espace.** Ses écouteurs sont posés sur la
section, qui survit à `innerHTML` : un second `monter()` les aurait tous
doublés, et chaque clic aurait compté double. `rafraichir` ne relit que les
données et redessine.

Cas particulier de Yuno : « relire » y veut dire **oublier**. `fraiches` est ce
qui empêche de redemander deux fois la même table pendant une visite, c'est donc
lui qu'on vide ; `affichables` n'est pas touché, l'écran ne clignote pas et se
met à jour quand les données reviennent.

**Vérifié dans les deux sens** : une tâche créée dans l'espace Tâches apparaît
sur l'accueil au retour (« Aujourd'hui » et la grille de la semaine), et une
tâche cochée sur l'accueil se retrouve dans « Faites » au retour sur les Tâches.
Les six espaces parcourus deux fois de suite, sans une erreur.

**`poserAuCalendrier` est passé en commun** à cette occasion. La fonction qui
écrit ce que la tuile a saisi vivait dans l'espace Calendrier, et une troisième
copie allait naître avec ce « + » — trois endroits où oublier de faire suivre un
champ. **C'est exactement ce qui s'était produit** avec l'heure et la priorité
d'une tâche : offertes à l'écran, jetées à l'écriture, dans une copie seulement.

**Mesuré** : le dashboard fait 922 px sur un écran de 812, soit 1,1 écran — la
règle des « 5 minutes sans scroll excessif » tient. **Vérifié** de bout en bout
avec une tâche d'essai datée du jour : cochée depuis le dashboard, elle quitte
« Aujourd'hui », arrive en tête des victoires, la ligne d'annulation s'affiche ;
« Annuler » la fait revenir et retire la victoire. Puis supprimée.

---

## 2 bis bis. Cinq bugs antérieurs, trouvés en passant et réparés

Aucun ne venait des chantiers du jour : tous dormaient depuis des jours, et
tous étaient invisibles **faute d'avoir été exercés**. C'est la leçon de la
session — le code qui a l'air juste ne l'est pas toujours, et seul un clic
réel le dit.

**Le calendrier du site FCH n'avait jamais pu s'afficher.** `vueCalendrier` de
`hermitage.js` passait `etat.filtre` — la chaîne `'tout'`, qui est le filtre des
publications — là où le calendrier attend un `Set` de natures. L'écran levait
`natures.has is not a function`, et comme `rendre()` affecte `section.innerHTML`
en une seule expression, **la page gardait simplement le contenu précédent** :
on cliquait « Calendrier » et l'accueil restait, sans rien qui signale l'erreur
ailleurs que dans la console. La régression datait de la refonte du calendrier
du 12 août, où `construireFiltres` et `construireCalendrier` ont pris un Set en
paramètre sans que le FCH suive. Corrigé : `etat.natures = toutesLesNatures()`,
et les cases se cochent maintenant comme dans l'espace Calendrier du hub.
Leçon : `§ 2` notait que les chemins du FCH n'avaient pas été vérifiés — c'était
exact, et voilà ce qui s'y cachait.

**La barre d'onglets du hub ne défilait pas.** `overflow-x: auto` et
`scrollbar-width: none` étaient écrits **dans le `@media (min-width: 45rem)` mais
hors de tout sélecteur** : deux déclarations orphelines, donc appliquées à rien.
Conséquence sur téléphone : ce n'était pas la barre qui glissait mais **la page
entière**, de travers, alors que le commentaire juste au-dessus annonçait
l'inverse. Les deux lignes sont remontées sur `.navigation`, hors du `@media` —
c'est à 375 px qu'on en a besoin, pas au-delà. Vérifié : la page ne déborde
plus, la barre glisse.

**Toutes les fenêtres volantes du site Yuno étaient mal placées.** `.vue-entre`
porte `animation: … both` sur `transform`, et un élément dont la transformation
est animée devient le **repère** de ses descendants en `position: fixed` — le
`fill-mode: both` faisant durer l'effet indéfiniment. Mesuré : une tuile censée
être centrée à 391 px se calait à 496, et le fond assombri ne couvrait que la
section au lieu de l'écran. La classe est retirée à `animationend`. Ça valait
pour la fiche d'un moment, celle d'un contact, la note d'idée — pas seulement
pour la tuile de création.

**Le calendrier du hub jetait l'heure et la priorité d'une tâche.** Le
formulaire demandait « à quelle heure », `poser()` ne la transmettait pas ;
même chose pour la publication. Yuno, lui, les faisait suivre — la fonction
était recopiée dans deux espaces, et une seule copie avait été tenue à jour.
C'est ce qui a décidé de mettre `poserAuCalendrier` en commun (§ 2 quater).

**La flèche d'envoi se rallumait sur un champ vide**, juste après une création :
un `disabled = false` sec dans un `finally`, qui défaisait l'extinction voulue.
Trouvé en vérifiant autre chose.

---

## 2 ter. Le démarrage — les trois chantiers, faits sur Yuno

Faits le 13 août, **sur le site Yuno seulement**, en échantillon : c'est lui qui
partait avec onze requêtes. Les autres espaces n'ont pas bougé. Le mécanisme est
écrit pour se reprendre ailleurs — voir « ce qu'il reste à faire », plus bas.

**1. Le cache de session** (`js/cache-session.js`, nouveau fichier). Le dernier
état de l'espace est gardé en `sessionStorage` et affiché immédiatement à la
réouverture, pendant que les données fraîches arrivent.

- **C'est du papier peint, jamais une source.** Rien n'est lu pour décider quoi
  que ce soit ; tout est réécrit dès la première réponse du serveur. **Vérifié** :
  cache chaud + réseau branché, l'accueil redemande quand même ses cinq tables.
  Un cache qui « épargnerait » une requête deviendrait une source de vérité, et
  Noé verrait un jour des données d'hier sans le savoir.
- **`sessionStorage` et non `localStorage`**, en connaissance de cause : ce sont
  les contacts de Noé, avec leurs numéros. Fermer l'onglet les efface, et
  `viderLesCaches()` part aussi à la déconnexion (appelé depuis `app.js`, à côté
  du vidage des espaces).
- **Les photos ont leur propre horloge.** Leurs adresses sont signées une heure
  (`api.urlsDesPhotos`). Le cache retient l'instant de la signature
  (`photosLe`) : au-delà de 45 minutes, **les moments partent avec leurs
  photos**. Des moments sans adresses valides, ce serait le mur vide affiché à
  tort — pire que le squelette. C'est le seul piège non évident de ce chantier.
- Écrit après chaque chargement, **et à l'effacement de la page**
  (`pagehide`/`visibilitychange`) : l'état bouge entre deux chargements, et sur
  iOS une app ajoutée à l'écran d'accueil n'est jamais fermée, seulement mise de
  côté.
- **Mesuré** : 30 Ko pour les 13 clés (45 contacts, 15 idées, 7 envois). Le
  module refuse au-delà de 1 Mo et oublie un cache de plus de 6 h, sans jamais
  lever — quota plein ou navigation privée ne cassent rien, on repasse par le
  squelette.

**2. Le chargement par vue.** `SOURCES` dit où chaque morceau se cherche,
`BESOINS` ce que chaque vue demande. Une clé n'est demandée qu'une fois par
visite ; deux vues qui la partagent ne la redemandent pas.

Compté au `fetch` intercepté, en parcourant les neuf vues à la suite :

| Vue | Requêtes |
|---|---|
| Accueil (ouverture) | **6** — moments, événements, objectifs, publications, contacts, + signature des photos |
| Journal | **0** — depuis que le carnet ne montre plus les victoires |
| Créer | 1 (stats) |
| Banque · Éditorial | **0** |
| Calendrier | 2 (tâches, commandes) |
| Réseau | 1 (envois) |
| Passerelle | 1 (modèles) |
| Carnet | 0 |
| Retour à l'accueil | **0** |

**11 requêtes pour tout visiter** (12 au relevé, moins celle des victoires
retirée depuis), contre 11 à la seule ouverture avant. Une vue
qui gagne un bloc doit relire sa ligne dans `BESOINS` : une clé oubliée, c'est un
écran vide affiché à la place de données qui existent. Le filet est que toutes
les clés de l'état partent d'un tableau vide — un oubli affiche trop peu, il ne
casse rien.

**3. Le chrome avant les données.** `monter()` dessine la signature, la barre,
le pied et deux blocs en attente, puis charge. **Mesuré : 2,5 ms**, réseau
coupé, avant qu'une seule requête soit partie. Le squelette suit la convention
du reste du hub (`dashboard.js`, `perso.js`) : `<p class="vide">…</p>`.

Trois conséquences de ce chantier, toutes voulues :

- **Le premier rendu est passé à la fin de `monter()`**, après le branchement
  des écouteurs — sinon un clic pendant le chargement tomberait dans le vide.
- **Le fondu d'entrée attend le vrai contenu.** L'animer sur le squelette puis
  le refuser au contenu ferait entrer une page vide et apparaître l'autre d'un
  coup, exactement l'inverse de ce qu'on cherche.
- **L'écran d'échec est devenu une ligne sous la barre**, avec « Réessayer », au
  lieu d'une page qui remplace tout. Le chrome reste, et ce qui était déjà
  affiché reste affiché. **Vérifié** : réseau coupé sur le carnet → chrome
  intact + la ligne ; réseau rendu, clic → les 45 fiches, la ligne disparaît.

**Comment tout cela a été vérifié** (navigateur, session ouverte, sans rien
écrire en base) : les cinq chemins du cache un par un (relecture, péremption,
cache illisible, cache trop gros, vidage sélectif), le premier jet lu **avant le
moindre `await`**, le comptage des requêtes au `fetch` intercepté, le parcours
des neuf vues avec relevé des écrans vides et des repères (45 contacts, 15
idées, 42 cases de calendrier, 5 lignes de carnet), et zéro erreur en console.

**Ce qu'il reste à faire** : `perso.js`, `gabarits.js`, `fch.js`,
`photo.js` font le chrome d'abord, mais **n'ont ni cache ni chargement par
morceaux**. `hermitage.js` et `calendrier.js` n'ont même pas le squelette. Ce
sont les moins pressés : ce ne sont pas eux qu'on ouvre le matin.

---

## 2 ter bis. Le même démarrage, porté au hub

Fait le 13 août, à la demande de Noé, sur `dashboard.js` — l'ouverture du hub,
la page du check-in. La mécanique de Yuno s'y transpose telle quelle ; ce qui
change, c'est le découpage, parce qu'un tableau de bord n'a qu'une vue.

**Le découpage se fait par BLOC, pas par vue.** `SOURCES` dit où chacun va
chercher, `DONNEES` ce que chacun pose dans l'état, et **un bloc se dessine dès
que les siennes arrivent** — l'humeur et les victoires sont là pendant que la
semaine interroge encore ses quatre tables. Mesuré, réseau ralenti d'une seconde
et demie et cache vidé : humeur à 1581 ms, tâches 1598, objectifs 1610, semaine
1618, victoires 1625. Cinq apparitions distinctes, plus un seul bloc à la fin.

**Le cache de session met la page entière à 20 ms.** Même mesure, cache chaud :
les cinq blocs sont remplis **à 23 ms — six millisecondes avant que la première
requête ne parte**, et le réseau peut prendre son temps. C'est du papier peint
comme dans Yuno : les huit requêtes partent quand même, tout est réécrit dès la
première réponse.

**Le piège de ce cache-là, c'est l'humeur.** Elle est datée du jour : un cache
écrit hier soir, relu ce matin (moins de six heures, donc valide) afficherait
« Noté, merci » pour une question qui n'a pas encore été posée — et la question
du matin serait perdue pour de bon. Le cache porte donc son `jour`, et l'humeur
seule repart du serveur quand il a changé. **Vérifié** en datant le cache de la
veille : les quatre autres blocs sortent du cache à 18 ms, l'humeur attend la
réponse à 1612 ms. C'est l'équivalent exact des photos signées de Yuno — une
donnée qui périme plus vite que le reste ne voyage pas avec lui.

**Neuf requêtes sont devenues huit.** Le dashboard demandait à la fois toutes
les tâches datées (pour la semaine) et les tâches d'échéance passée (pour
« Aujourd'hui ») — la seconde étant un sous-ensemble de la première. Elle se
déduit maintenant côté client. **Conséquence visible, et c'était le but
secondaire** : cocher une tâche sur l'accueil la barre aussi dans la semaine,
deux blocs plus bas, ce qui n'arrivait pas avant — les deux listes viennent de
la même.

**« Aujourd'hui » a gagné un tri.** Il affichait les tâches dans l'ordre de la
base — indécis entre deux tâches du même jour, donc changeant d'un chargement à
l'autre. Il reprend `trierTaches` de l'espace Tâches (priorité, date,
ancienneté) : cette liste en avait déjà la forme, elle en a maintenant l'ordre.

**L'échec de chargement est devenu une ligne** sous l'en-tête, avec
« Réessayer », au lieu d'une page qui remplaçait tout — le contenu du cache
reste donc affiché quand le réseau tombe. **Vérifié** réseau coupé, cache
chaud : la page est entière et la ligne apparaît. Elle met **sept secondes** à
venir, et ce n'est pas nous : supabase-js réessaie tout seul à 1 s, 2 s puis
4 s. Ce délai existait avant, il était simplement invisible — la page restait
blanche pendant ce temps.

**Les écouteurs se branchent avant le premier rendu**, comme dans Yuno : ils
étaient posés après le chargement, donc un clic pendant celui-ci tombait dans le
vide. Avec un cache chaud, la page est complète en 20 ms : c'est devenu un vrai
risque, pas une hypothèse.

**Le chemin d'écriture a été exercé en entier**, sur une tâche créée pour
l'occasion puis supprimée : posée depuis le « + » (elle apparaît dans les deux
blocs), cochée (elle quitte « Aujourd'hui », se barre dans la semaine, la
victoire monte en tête, la ligne d'annulation s'affiche), annulée (tout revient,
la victoire part), puis supprimée depuis l'espace Tâches — et au retour sur
l'accueil, elle a disparu des deux blocs. Base relue en SQL au départ et à
l'arrivée : **4 tâches, 2 victoires**, son état exact.

**Un piège de vérification, à retenir** : vider `sessionStorage` depuis la
console PUIS recharger ne vide rien. En quittant la page, `pagehide` réécrit le
cache avec l'état encore vivant. Il faut vider au chargement de la page
suivante, avant que les modules ne tournent.

---

## 2 ter ter. La fluidité — l'écran avant le réseau, la coquille avant tout

Deux chantiers du 13 août, après une analyse demandée par Noé sur « la fluidité
réelle et visuelle », surtout sur téléphone. Ce sont les deux qui changent la
*nature* de la sensation ; le reste de l'analyse (fondu de navigation, squelette
du calendrier, insertion locale après création) attend son tour — voir § 4 bis.

### 1. Cocher une tâche ne passe plus par le réseau

**Le geste du matin attendait deux requêtes en séquence** : l'update de la
tâche, puis l'insertion de la victoire. Sur téléphone, 300 à 800 ms de cercle
grisé avant que rien ne bouge. C'était le motif de TOUTES les écritures du hub —
désactiver le bouton, attendre, redessiner.

**L'écran change maintenant au moment du doigt** ; l'écriture part derrière. Sur
l'accueil comme dans l'espace Tâches. Mesuré : **3 et 4 ms** entre le clic et la
liste redessinée, réseau volontairement ralenti d'1,5 s — la tâche quitte
« Aujourd'hui », se barre dans la semaine, la victoire monte en tête et la ligne
d'annulation s'affiche, tout cela avant que la première requête ne réponde.

**Ce qui rend la chose tenable, c'est le retour en arrière.** Si l'écriture
échoue, l'état d'avant est remis et une ligne le dit — « Ça n'a pas pu être
enregistré ». Sans ce filet, l'affichage optimiste est un mensonge.

Cinq points de conception, chacun payé par un cas de figure :

- **`avant` et pas l'objet mis à jour.** `api.terminerTache` relit le statut
  pour décider quoi faire : lui passer l'état que l'écran a pris de l'avance,
  c'est lui faire terminer une tâche déjà « faite ».
- **Une écriture à la fois par tâche** (`ecrituresEnVol`). Deux appuis pendant
  le vol enverraient deux ordres contraires sur la même ligne, et c'est le
  dernier arrivé qui gagnerait — pas forcément le dernier voulu.
- **La victoire a un identifiant provisoire** (`provisoire-<id>`), remplacé par
  le vrai quand l'écriture répond. Sa croix « retirer » refuse de partir tant
  qu'elle le porte : supprimer une victoire qui n'existe pas encore côté serveur
  n'a pas de sens. L'attente est d'une seconde au plus.
- **Annuler attend l'écriture, sans jamais faire attendre l'écran.**
  `annulation.ecriture` est la promesse de la coche ; annuler la rejoue à
  l'envers seulement si elle a abouti (`confirmee`). Annuler pendant le vol ne
  fait donc rien de plus : il n'y a rien à défaire.
- **Une coche annulée puis échouée ne dit rien.** Si l'écriture échoue APRÈS que
  Noé a annulé, l'écran montre exactement ce qu'il voulait — une tâche active —
  et un message d'erreur serait du bruit. `annulation.annulee` sert à ça.

**Vérifié, réseau simulé lent puis coupé** : le cas nominal (l'identifiant
provisoire devient réel), le double appui (ignoré), l'annulation en plein vol
(rien ne se défait, la tâche reste active — relu en SQL), l'échec pur (tout
revient : liste, semaine, victoires, et la ligne le dit), et le décochage depuis
l'espace Tâches. Base relue en SQL à la fin : **4 tâches, 2 victoires**, son
état de départ.

**Ce qui n'est PAS encore optimiste**, et pourrait l'être si ça se ressent :
poser une tâche depuis la tuile, l'humeur du matin, retirer une victoire,
supprimer une tâche. La coche était le geste le plus fréquent — c'est
l'échantillon, comme le veut la méthode.

### 2. La coquille en cache — un service worker

`sw.js`, à la racine, enregistré par `app.js` après le démarrage. HTML, CSS, JS,
polices et icônes sont servis depuis l'appareil ; l'ouverture ne dépend plus du
réseau, et les trois applications se lancent hors ligne.

- **Les données ne passent jamais par lui.** Tout ce qui va vers Supabase
  (tables, auth, photos signées) et vers l'API GitHub est laissé au réseau, par
  un simple test d'origine. Un service worker qui garderait des données
  deviendrait une seconde source de vérité — exactement ce que le cache de
  session s'interdit déjà (§ 2 ter).
- **La stratégie s'inverse en local.** En production : le cache d'abord, la
  version fraîche en arrière-plan pour l'ouverture suivante. Sur `localhost` :
  le réseau d'abord, le cache en secours. Sans cette inversion, chaque session
  de travail verrait une fois ses modifications ignorées — le piège classique.
- **La coquille se vérifie maintenant toute seule** : `node tools/verifier-coquille.js`
suit ce qui est réellement référencé — les trois entrées, ce qu'elles chargent,
ce que les modules importent de proche en proche, les polices du CSS — et
compare à la liste de `sw.js`. Écrit le 13 août après avoir constaté que
`ecriture.js` et `mouvements.js`, nés dans la journée, n'y avaient jamais été
ajoutés. **Mesuré** : l'application démarrait hors ligne quand même, les deux
modules étant entrés au cache par la revalidation dès la première visite en
ligne — la liste n'est donc pas la seule garantie, mais c'est la seule qui ne
dépende de rien. L'outil est prouvé : en retirant un module de la liste, il le
nomme et sort en erreur.

**Le prix, assumé** : après un déploiement, le téléphone peut montrer UNE FOIS
  la version précédente. La fraîche se télécharge pendant ce temps et sera là à
  l'ouverture d'après. C'est le même marché que le cache de session, à l'échelle
  du code. En cas de doute sur un déploiement, fermer et rouvrir deux fois.
- **Le cache porte un numéro** (`hub-coquille-v1`) : le changer jette l'ancien à
  l'activation. À incrémenter si un jour le contenu de la coquille change de
  nature.
- **Le chemin est calculé, pas écrit** : `new URL('../sw.js', import.meta.url)`.
  Depuis un module, `'sw.js'` chercherait `js/sw.js` — et sur GitHub Pages le
  site vit sous `/hub/`, donc rien ne peut être écrit en absolu.

**Vérifié en pilotant un vrai Chrome** (CDP par le WebSocket natif de Node, sans
dépendance — les outils du navigateur intégré ne savent pas enregistrer un
service worker) : profil neuf, `index.html` ouvert une fois → enregistré,
**activé, 54 entrées en cache** (49 avant que supabase-js entre au dépôt), dont
les six fichiers de `js/vendor/` et **aucun CDN**. Puis réseau coupé :
`index.html` s'ouvre entier — titre, écran de connexion, les 7 onglets, et
Instrument Sans (donc les polices viennent bien du cache) —, `yuno.html` et
`hermitage.html` aussi, chacune avec son titre et son `data-entree`.

Le script de pilotage vit dans le bac à sable de la session, pas dans le dépôt.
Il tient en cinquante lignes : lancer Chrome avec `--remote-debugging-port`,
ouvrir son WebSocket, `Page.navigate`, `Runtime.evaluate`. À refaire au besoin —
c'est le seul moyen de vérifier un service worker ici.

### 3. Le reste des écritures, et ce qui les entoure

Suite de la même analyse, dans la foulée. Cinq chantiers, du plus sensible au
plus discret.

**Toutes les écritures fréquentes sont passées optimistes.** Le motif est celui
du cochage (plus haut) : l'écran change, l'écriture part derrière, l'échec
remet l'état d'avant et le dit.

| Geste | Ce qui change à l'écran | Mesuré |
|---|---|---|
| Poser une tâche (tuile de l'accueil) | la tuile se referme | **65 ms** |
| Poser une tâche (espace Tâches) | la ligne apparaît, le champ se vide, le curseur reste | **55 ms** |
| Corriger une tâche | la ligne change, la tuile se referme | immédiat |
| Supprimer une tâche | la ligne part | **1 ms** |
| Répondre à l'humeur | « Noté, merci » | **1 ms** |
| Retirer une victoire | la tuile part | immédiat |

Réseau ralenti d'1,5 s à chaque mesure : c'est bien l'écran qui part devant.

**Deux mécaniques nouvelles, et leurs raisons :**

- **La ligne d'une tâche créée existe avant d'exister en base.** Elle porte un
  identifiant provisoire, et `trouver()` — la fonction par laquelle passent
  cocher, ouvrir et supprimer — **ignore les tâches en vol**. Sans ça, on
  pourrait cocher une tâche que le serveur ne connaît pas encore, et l'écriture
  partirait sur un identifiant inventé. L'attente dure un aller-retour.
- **Ce qui revient après un échec revient à SA place**, pas en tête : une tâche
  supprimée par erreur reprend son rang, une victoire son ordre chronologique.
  Une ligne qui réapparaît ailleurs ferait douter de ce qui a été défait.

**Une création depuis l'accueil coûte une requête, contre neuf.** Elle en
lançait huit de relecture après l'écriture — alors qu'on connaît la réponse,
c'est ce qu'on vient d'écrire. `rangerLaCreation` range la ligne rendue par
`poserAuCalendrier` dans la liste dont elle vient, et les blocs se redessinent
de là. **Mesuré : 1 requête**, la tâche est dans « Aujourd'hui » et dans la
semaine.

**Le calendrier a enfin son squelette et son cache.** C'est le deuxième écran le
plus visité et il attendait ses six requêtes avant d'afficher quoi que ce soit,
alors que sa moitié fixe — titre, barre de période, filtres, les 42 cases — ne
dépend d'aucune donnée. Le découpage qui rend le cache possible : `etat.sources`
garde les six tables **telles qu'elles arrivent**, `etat.elements` la grille
qu'on en tire. Seules les premières se rangent en cache — les secondes portent
des objets `Date` et des barres calculées, que `JSON.stringify` aplatirait.
19 Ko, et l'échec s'y dit désormais sur une ligne sous le titre, la grille
restant affichée.

**Le hub a son fondu de navigation.** Changer d'onglet était un `hidden` qui
bascule : l'écran claquait d'un état à l'autre, et c'est ce que l'œil lit comme
« pas fluide ». 130 ms, 4 px, seulement au changement d'ESPACE — `afficherEspace`
est aussi appelé quand on navigue à l'intérieur d'un espace, et faire respirer
la page entière à chaque écran ouvert serait pire que rien. La classe est
retirée à la fin de l'animation, jamais laissée en `both` : un élément dont la
transformation est animée devient le repère de ses descendants en
`position: fixed`, et c'est le bug qui décalait toutes les fenêtres de Yuno.

**Et les lignes qui arrivent respirent** (`js/mouvements.js`) : une tâche créée,
une victoire qui monte. Les listes se redessinant en entier, rien ne distingue
la ligne neuve des autres — d'où une mémoire des identifiants déjà vus, et
l'animation sur la seule différence. **Seule l'arrivée est animée, pas le
départ** : un élément retiré n'existe plus au moment où il faudrait l'animer, et
le garder pour le voir partir demanderait de tenir les nœuds un à un.

**supabase-js est rentré dans le dépôt** (`js/vendor/`, 280 Ko, six fichiers,
rapatriés par `tools/telecharger-supabase.py`). Deux raisons, pas une seule :
c'était le seul morceau que le service worker ne pouvait pas garantir hors
ligne, et le « @2 » d'avant suivait la dernière version publiée — donc pouvait
casser l'application un matin sans que personne n'ait rien poussé. La version
est **figée à 2.112.3**, écrite dans `js/vendor/VERSION`. Le hub n'appelle plus
aucun CDN, comme pour les polices.

**Un piège, tout de suite rencontré** : les fichiers rapatriés étaient en
`.mjs`, et `tools/static-server.js` ne connaissait pas l'extension — il répondait
`application/octet-stream`, qu'un navigateur **refuse** de charger comme module.
Ils sont donc en `.js`, où aucun serveur ne se trompe ; et le serveur local a
appris `.mjs` au passage, pour le prochain.

**Les deux polices du premier écran sont préchargées** dans les trois entrées —
Instrument Sans et Clash Display pour le hub, Gilroy pour les sites. Sans ça, le
navigateur ne les découvre qu'après avoir lu le CSS, et le texte s'affiche un
instant dans la police du système. `crossorigin` est obligatoire même pour nos
propres fichiers : une police est toujours demandée en mode anonyme, et sans lui
le préchargement est jeté puis refait.

**Vérifié** : les six fichiers `vendor` chargés et **aucune requête hors de
`localhost` et de Supabase** ; le fondu posé puis retiré sur chaque changement
d'espace, et jamais à l'intérieur d'un espace ; les neuf espaces parcourus sans
un écran en échec ni un pixel de débordement à 375 px ; le cycle complet d'une
tâche d'essai (créée, identifiant provisoire remplacé, supprimée) avec la base
relue en SQL avant et après — **4 tâches, 3 victoires**, son état exact.

### 4. Les écritures des deux sites

Dernier morceau de l'analyse, et le plus étendu : Yuno et le FC Hermitage
attendaient encore le réseau à chaque geste. **La mécanique est passée dans un
module commun** — `js/ecriture.js` — plutôt que d'être recopiée une vingt-et-
unième fois.

**Trois fonctions, une par forme de geste**, et rien d'autre :

| | Ce qu'elle fait | Le retour en arrière |
|---|---|---|
| `modifierAussitot` | change une ligne déjà en base | la photographie d'avant, clés supprimées comprises |
| `retirerAussitot` | sort une ligne d'une liste | elle revient **à son rang**, jamais en tête |
| `ajouterAussitot` | pose une ligne qui n'existe pas encore | elle disparaît, et rien n'a été écrit |

**Les listes sont modifiées SUR PLACE** (`splice`, `unshift`) et jamais
remplacées. C'est ce qui rend le retour en arrière sûr : l'état garde la même
référence pendant tout l'aller-retour, et une autre écriture qui passerait
entre-temps ne laisse pas un tableau orphelin derrière elle.

**Converti — trente-cinq gestes**, tous ceux qui se font en un clic : cocher une
tâche du calendrier Yuno, avancer une publication, la déprogrammer, la
programmer (au sélecteur comme au glissement), la supprimer ; le statut et le
niveau d'un contact, les champs vifs de la Passerelle, « Envoyé ✓ », faire
avancer une commande, cocher un jalon, marquer un objectif atteint, retirer une
victoire, supprimer un contact, un modèle, une commande, un objectif, un moment,
un partenaire ; plus, côté hub, la création et la suppression d'une tâche,
reprises sur le module commun.

**Non converti, et c'est un choix : les formulaires.** Créer un contact, une
commande, un modèle, une idée, loguer un moment — ces écritures-là passent par
une fenêtre à plusieurs champs. Un formulaire a un endroit où dire « ça n'a pas
marché », juste sous ce qu'on vient de taper, et il garde la saisie ; un geste
optimiste effacerait le tout pour n'afficher qu'une ligne d'excuse. **Le geste
d'un clic gagne à devancer le réseau, la saisie d'un formulaire non.**

**Deux compteurs demandaient un soin particulier**, parce qu'ils ne peuvent que
monter (§ 5) : « Envoyé ✓ » et les victoires d'un jalon. L'envoi et la victoire
s'affichent tout de suite, avec un identifiant provisoire — et **partent si
l'écriture échoue**. Sans ça, un réseau coupé laisserait un message envoyé qui
ne l'a pas été, ou un accomplissement qui n'a pas eu lieu.

**Un piège d'ordre, évité de justesse.** « Envoyé ✓ » fait avancer le statut du
contact ; `modifierAussitot` ayant DÉJÀ changé la fiche quand la requête part,
relire `contact.statut` à l'intérieur ferait avancer d'un cran de trop —
« message envoyé » deviendrait « relance » sans qu'on ait relancé. Le statut
suivant se calcule donc avant. Même précaution partout où l'API relit la ligne
pour décider (`terminerTache`, `atteindreJalon`, `avancerCommande`) : c'est
`avant` qu'on leur passe, pas la ligne que l'écran a devancée.

**Chaque site dit ses échecs au même endroit** : une ligne sous la barre de
navigation, comme l'échec de chargement, effacée au bout de six secondes. Elle
vit dans l'état (`etat.souci`), donc les fonctions de vue n'ont rien à en
savoir.

**Vérifié en conditions réelles**, sur des lignes créées pour l'occasion (une
idée Yuno, une idée FCH, un contact) puis supprimées :

- réseau ralenti d'1,5 s — avancer une publication Yuno **65 ms**, le statut
  d'un contact **82 ms**, « Envoyé ✓ » **64 ms** (compteur 7 → 8 dans l'instant),
  avancer une publication FCH **68 ms** ;
- base relue en SQL après chaque geste : le statut est bien passé à
  `a_developper`, l'envoi bien inscrit, la date du dernier échange posée ;
- réseau coupé — le statut revient à sa valeur d'avant et la ligne d'excuse
  s'affiche ; le compteur d'envois remonte à 8 puis **redescend à 8** en
  retirant l'envoi fantôme ; une publication supprimée revient à sa place ;
- les 18 vues des deux sites et du hub parcourues sans un écran en échec, sans
  débordement horizontal ;
- base relue à la fin : **45 contacts, 7 envois, 15 publications, 4 tâches,
  3 victoires, 4 modèles, 1 moment** — son état exact de départ.

**Une trouvaille au passage, non corrigée** : sur le site du FCH, **une idée de
la banque ne s'ouvre pas**. Les tuiles portent bien `data-ouvrir-pub` et se
présentent comme des boutons, mais `hermitage.js` n'écoute jamais cet attribut —
Yuno, si. Conséquence : sur le FCH, une idée sans date n'a aucun moyen d'être
avancée ou supprimée. Ça ne vient pas de cette session, et ça touche la forme de
l'écran « Créer » du FCH : à voir avec Noé plutôt qu'à trancher seul.

---

## 2 undecies. Une tâche de l'accueil se corrige en la touchant

Demandé par Noé le 14 août 2026. Dans l'espace Tâches, appuyer sur une ligne la
rouvre depuis le 13 ; sur l'accueil, elle ne répondait pas — `construireLignesTaches`
y était appelée avec `ouvrable: false`, faute de tuile pour corriger.

**C'est la tuile du « + » qui sert**, pré-remplie. `fenetreCreation` a gagné un
paramètre `valeurs` — le titre dans le champ, l'espace et la priorité sur leurs
pastilles. La tuile ne sait toujours pas si elle crée ou si elle corrige : c'est
l'espace qui le sait, à l'envoi, en regardant si `etat.creation` porte un `id`.

**L'écriture est optimiste**, comme le reste : la ligne change à l'écran, et
revient si le serveur refuse. Mesuré : **89 ms** entre l'envoi et la tuile
refermée, liste à jour.

**Ce qui n'a pas changé, et c'est voulu** : une tâche ne se SUPPRIME toujours
pas depuis l'accueil. Effacer n'a rien à faire dans un check-in du matin, et le
geste existe deux onglets plus loin.

**Vérifié** : la tuile s'ouvre remplie (titre, date, espace, priorité) ; un
titre et une priorité changés, relus en base, le reste intact ; le « + » crée
toujours (il s'ouvre vide) ; le cercle coche toujours sans ouvrir la tuile ;
réseau coupé, la correction ne reste pas à l'écran et la ligne d'excuse
s'affiche ; l'espace Tâches n'a pas bougé. Tâche d'essai supprimée — **8 tâches
en base**, celles de Noé.

---

## 2 decies. Glisser une barre depuis l'accueil, et voir ce qu'on tient

Deux demandes de Noé, le 14 août 2026.

### Le geste marche depuis la semaine de l'accueil

La grille de « Ta semaine » est **la même fonction** que celle de l'espace
Calendrier ; seul le brancheur manquait. `brancherDeplacement` est maintenant
posé sur le tableau de bord aussi, et l'écriture y est **optimiste** comme le
reste : la barre change de jour tout de suite, et revient si le serveur refuse.

**`appliquerAuCalendrier` est passée en commun** à cette occasion. Elle était
recopiée à l'identique dans l'espace Calendrier et dans le site Yuno, et une
troisième copie allait naître pour l'accueil — exactement l'histoire de
`poserAuCalendrier`, et la même leçon : c'est dans la copie oubliée qu'un champ
finit par manquer.

### On voit ce qu'on a dans la main

Avant, un déplacement n'était qu'une barre pâlie et une case teintée : on
devinait qu'il se passait quelque chose, on ne voyait pas QUOI on déplaçait.

**Une copie de la barre suit le pointeur** (`.cal-fantome`), en `position:
fixed`, dans le `body`. Une copie et non l'originale : l'originale occupe une
colonne et une ligne de la grille, la sortir du flux ferait sauter tout le
reste. Elle garde le décalage de la prise — la barre reste sous le doigt là où
on l'a saisie, pas centrée dessus — et c'est ce détail qui donne l'impression de
tenir l'objet.

**`pointer-events: none` sur la copie est vital** : sans lui, elle serait
toujours sous le doigt, et `elementsFromPoint` ne verrait jamais le jour
survolé — donc plus aucune cible, et aucun report.

### Le glissement marche au doigt, ce qui n'était pas le cas

`brancherDeplacement` commençait par `if (evenement.pointerType === 'touch')
return` : **le déplacement n'existait pas sur téléphone**, c'est-à-dire là où
Noé s'en sert. Il fallait le lever pour que la demande ait un sens.

La règle qui rend ça possible sans casser le défilement : `touch-action: pan-y`
sur les barres, et la même règle dans le code — **au doigt, seul un mouvement
franchement horizontal saisit la barre**. Le vertical appartient à la page. En
vue semaine, où les sept jours sont côte à côte, tout déplacement est
horizontal ; **en vue mois, changer de semaine au doigt ne se fait donc pas au
glissement**, et c'est assumé.

**Un piège trouvé en exerçant** : `setPointerCapture` et surtout
`releasePointerCapture` **lèvent** quand le pointeur n'est plus valide. La
seconde était la première ligne du relâchement : quand elle levait, le report
lui-même ne se faisait pas, **et rien ne le disait**. Les deux sont sous `try`.

**Vérifié** : un vrai glissement à la souris depuis l'accueil (jeudi → samedi),
relu en base ; la copie visible en cours de geste, avec la barre d'origine pâlie
et le jour d'arrivée allumé (capture à l'appui) ; l'annulation qui ne laisse ni
copie ni surbrillance ni écriture ; au doigt, un mouvement vertical qui ne
saisit rien et un mouvement horizontal qui reporte (relu en base) ; et le même
geste, inchangé, dans l'espace Calendrier et sur le site Yuno. Le détail ne
s'ouvre pas derrière un glissement — l'avalement du clic tient toujours.

**Un piège de vérification, coûteux** : le serveur local du port 4173
appartenait à une autre session de travail et servait des fichiers **périmés**.
Trois essais ont conclu « le glissement ne marche pas » alors que le code était
juste — la page ne l'avait jamais reçu. `curl` sur le fichier servi l'a montré
en une seconde. **Quand un comportement neuf ne se produit pas, vérifier
d'abord que le serveur sert bien le fichier qu'on vient d'écrire.**

---

## 2 nonies. Deux points en attente, tranchés

Les deux seuls du § 3 qui demandaient du travail plutôt qu'une réponse.

### Le mot « carnet » ne désigne plus qu'une chose

Il en désignait deux : le **Carnet de terrain** (les moments) et le **carnet
réseau** (les contacts). Décision de Noé : la base de contacts s'appelle
désormais **le réseau**, tout court.

Ce qui a changé de mot : le titre de la page (« Le carnet » → « Le réseau »), la
recherche, le formulaire et sa fenêtre (« Ajouter au réseau »), la croix de
retrait, l'écran vide (« Ton réseau démarre ici »), le renvoi depuis la
Passerelle, et le « + » posé sur une rencontre.

Ce qui garde « carnet » : tout ce qui parle des moments — « Le carnet de
terrain », « Inscrire au carnet », « Retirer du carnet », l'invite après un
match, et les noms de code (`construireCarnet`, `.liste-carnet`).

**L'adresse `#yuno/carnet` n'a pas bougé.** Renommer une adresse casse un favori
et le bouton retour ; celle-ci ne se lit pas, et le mot n'y trompe personne.

**Vérifié** en parcourant les quatre pages du réseau et le Journal : plus une
occurrence de « carnet » hors du Carnet de terrain.

### Le formulaire de modification n'a plus de menu déroulant

L'ajout était passé en listes de choix le matin même — « le rectangle bleu avec
un menu déroulant, c'est très laid et pas agréable » —, la modification les
avait gardés. Quatre champs restaient : la durée et la récurrence d'un
événement, le réseau et le format d'une publication.

**Un type de champ de plus, `choix`**, dans `construireFormulaire` : la valeur
voyage dans un champ caché, le formulaire se lit toujours avec `FormData` — il
n'a pas à savoir comment on a saisi. C'est la même mécanique que la tuile, et le
même principe qu'ailleurs : **un seul endroit qui sait le faire**.

**Un menu déroulant DESSINÉ, pas une rangée d'options.** Première version
refusée par Noé (14 août) : elle alignait toutes les options en pastilles
visibles. « Il faut que ce soit un menu déroulant mais pas natif, comme pour les
priorités dans la tuile nouvelle tâche ». Il a raison — un formulaire de dix
champs serait devenu un mur d'options, alors qu'on ne change qu'un réglage à la
fois.

La forme est donc exactement celle de la pastille « Priorité » : un contrôle qui
montre la valeur choisie, de la hauteur et du cadre des autres champs, et qui
ouvre au toucher un panneau de lignes pleine largeur. Le panneau se pose
PAR-DESSUS ce qui suit plutôt que de pousser le formulaire — un menu qui déplace
les champs sous le doigt fait perdre ce qu'on visait. Choisir referme et réécrit
le libellé du contrôle : on relit tout le formulaire sans ouvrir un seul menu.

**Un détail qui aurait mordu** : `brancherCapture` écoutait déjà `[data-choix]`
pour la tuile, et allait chercher le champ caché dans `.capture`. Les choix d'un
formulaire vivent ailleurs et portent le leur dans leur propre groupe : sans la
distinction, ils auraient marqué le bon bouton **sans changer la valeur** — le
formulaire aurait enregistré l'ancienne, en silence.

**Vérifié en écriture réelle** : sur l'événement « Red Star - Sochaux », durée
passée de 4 h à 2 h par la nouvelle liste — `date_fin` relue en base à 19:00 au
lieu de 21:00, tout le reste identique — puis remise à 4 h par le même chemin,
base revenue à l'exact. Et sur une publication d'essai, réseau et format changés
(instagram/post → tiktok/reel), relus en base, puis la ligne supprimée.

### Et les quatre autres formulaires (demande de Noé, dans la foulée)

**Il ne reste plus un seul `<select>` dans le hub.** Onze champs convertis : le
type d'un moment (création et correction), le type / la relation / le niveau
d'une fiche du réseau (création et correction), le statut d'une commande, le
réseau / le format / le pilier d'une idée.

**Trois pièges, tous rencontrés, tous mesurés :**

1. **Le site du FCH n'a pas de tuile de capture** — donc personne ne branchait
   ses menus. La mécanique (`poserLeChoix`, `basculerChoixDeFormulaire`,
   `fermerLesChoix`) vit dans `gabarits.js`, à côté du constructeur de
   formulaires qui produit ces menus, et `brancherChoix(section)` s'appelle une
   fois par espace qui en a besoin. `brancherCapture` s'en charge pour les
   autres — c'est le même écouteur de clics qui reçoit les deux sortes.
2. **Un `<select>` sans valeur préselectionne sa première option ; mes pastilles
   ne préselectionnaient rien.** « Noter une idée » repartait donc avec un
   réseau vide, et la base refusait la ligne. Le champ prend maintenant la
   première option à défaut de valeur — avec un `??` et non un `||` : une valeur
   explicitement vide (« Sans pilier ») est un choix, pas une absence.
3. **JavaScript énumère les clés numériques avant les autres**, quel que soit
   l'ordre d'écriture : `{ '': 'Sans pilier', 1: … }` ressortait « 1, 2, 3, 4,
   Sans pilier », la valeur par défaut en queue. Invisible dans un menu
   déroulant, voyant dès que les options s'alignent. Le choix vide repasse
   devant.

**Et un piège de méthode, pas de code** : le remplacement qui a posé l'appel à
`brancherChoix` dans `hermitage.js` a réussi, celui qui devait poser son import
a échoué **en silence** — le motif ne correspondait pas, et rien ne l'a dit.
L'espace FCH s'est monté vide, et c'est le parcours en navigateur qui l'a
attrapé (`brancherChoix is not defined`). Toute substitution doit lever quand
son motif est absent ; celle-là ne le faisait pas.

**Vérifié** : les vingt vues du hub et des deux sites parcourues — aucune vide,
aucun échec, **zéro `<select>` dans tout le document** ; un contact d'essai
modifié par les pastilles (type et relation), relu en base, puis supprimé ; une
idée créée avec réseau, format et pilier choisis aux pastilles, relue en base
(tiktok / reel / pilier 2), puis supprimée. Base revenue à son état exact.

---

## 2 octies. La barre d'une tâche au calendrier

Trois réglages demandés par Noé le 13 août 2026, tous dans la même phrase.

**Un trait à gauche, plus de cadre.** Une tâche portait un cadre complet et un
bord gauche épais ; il ne reste que le trait de couleur. L'événement garde son
aplat — c'est ce qui distingue une chose qui arrive d'une chose à faire, et le
cadre en faisait une étiquette de plus dans une grille déjà pleine de traits.

**Le rond est plus gros** : 1,3 em au lieu de 0,9. C'est la seule chose de la
barre sur laquelle on appuie, et un rond de 9 px se vise mal au doigt. La cible
passe à **29 × 33 px**.

**Piège d'ordre, le quatrième de la journée** : la règle du rond, écrite AVANT
`.cal-signe`, ne s'appliquait pas — même spécificité, c'est l'ordre du fichier
qui tranche. Mesuré à 9,28 px alors qu'on demandait 13. Déplacée après, elle
vaut. *Quand une règle « devrait » marcher et ne marche pas, regarder où elle
est écrite avant de douter de ce qu'elle dit.*

### La hauteur d'une barre ne dépend plus des autres jours

C'est le vrai morceau. Noé : « ma 1ʳᵉ tâche fait la même taille que l'événement
du lendemain alors qu'il n'y a aucun lien ». Il avait exactement raison, et la
cause est une propriété par défaut de CSS : **les barres sont posées dans une
grille, et un élément de grille s'étire à la hauteur de sa ligne**. Une tâche du
jeudi placée dans le même couloir qu'un match de deux heures du vendredi prenait
donc 150 px de haut. Deux choses sans aucun rapport, rendues jumelles par la
mise en page.

**Deux corrections, et il fallait les deux :**

1. `align-self: start` sur les barres : la hauteur d'une barre est la sienne.
   Seul, ce réglage laissait un TROU — la tâche gardait sa taille mais restait
   posée sur une ligne haute de 150 px, et les tâches suivantes commençaient
   sous le vide.
2. **Chaque jour empile ce qui lui appartient.** Les barres d'un seul jour
   sortent de la grille et vont dans une pile par jour (`.cal-pile`), l'une sous
   l'autre. Restent en couloirs celles qui traversent plusieurs jours : elles
   n'ont pas le choix, il leur faut des colonnes. Les couloirs sont recalculés
   entre ces seules barres, sans quoi les piles démarreraient après des rangs
   vides.

**Deux détails qui se paient sinon :**

- **La pile ne reçoit aucun clic** (`pointer-events: none`, rendus aux barres).
  Le vide entre deux barres appartient au jour, et c'est le fond du jour qu'on
  glisse pour poser quelque chose.
- **Dans une pile, une barre reprend `align-self: stretch`.** En colonne, l'axe
  transversal est l'horizontale : sans ça, chaque barre se rétractait à la
  largeur de son texte.

**Vérifié** : en semaine, la tâche du jeudi mesure 42 px et l'événement du
vendredi 150, dans le même couloir de départ (avant : 150 pour les deux) ; les
quatre tâches du jeudi s'enchaînent sans trou ; la vue mois est inchangée (aucune
pile, cinq barres de 19 px) ; le détail d'une barre s'ouvre toujours au clic, le
glissement sur un jour vide ouvre toujours la tuile, et le rond reste cochable
dans sa pile. Même vérification sur la semaine de l'accueil et sur les
calendriers des deux sites.

---

## 2 septies. Le « + » de Yuno, et l'accueil réordonné

Deux demandes de Noé, le 13 août 2026.

### Le « + » flottant du site Yuno

Yuno a **le même « + » que le hub**, sur ses neuf vues, et il ouvre **la même
tuile** : événement, tâche, publication, objectif. Première version corrigée par
Noé dans la foulée — elle n'ouvrait que la fenêtre du moment : « il faut garder
le même système de tuile que pour le hub […] pas que les moments ».

**Le moment est la cinquième nature**, et il ne se comporte pas comme les
quatre autres : le choisir **ferme la tuile et ouvre la fenêtre du carnet**, qui
demande une photo, des rencontres et une note — rien qui tienne dans une rangée
de pastilles. C'est une porte dans la liste, pas une ligne de plus à écrire. Ce
qui a déjà été saisi la traverse : le titre devient le lieu, la date suit.

`fenetreCreation` a gagné pour cela un paramètre `naturesEnPlus`, propre à
l'appelant. Le moment n'a rien à faire dans le calendrier du hub — ce n'est pas
une date qu'on pose, c'est un vécu qu'on raconte — et tout à faire dans le « + »
de Yuno.

**Le bouton, la tuile et la fenêtre du moment sont posés une seule fois, dans
`rendre()`**, et non dans les neuf gabarits de vue. La tuile était écrite par
les deux vues du calendrier, la fenêtre du moment par deux autres : neuf
endroits à tenir à jour, c'est huit oublis en puissance. **Jamais sur le
squelette** : un bouton qui ouvrirait une fenêtre sur des données absentes ne
mènerait à rien.

**Une création ne relit plus six tables.** Le site rechargeait tout le
calendrier après chaque envoi ; la ligne rendue par le serveur prend maintenant
sa place dans l'état — les listes sont modifiées sur place, comme partout depuis
`js/ecriture.js`. **Mesuré : 1 requête** pour poser un événement, 1 pour une
tâche, contre 7 avant.

**Vérifié de bout en bout** : le « + » sur les neuf vues ; les cinq natures dans
la liste ; la porte « Moment » qui emporte le titre et la date ; un événement et
une tâche posés depuis l'accueil, retrouvés au calendrier **sans rechargement**,
relus en base puis supprimés. Et, avant la correction, la fenêtre du moment
elle-même exercée depuis la vue Réseau — celle qui ne montre aucun moment — avec
une vraie photo fabriquée sur place (900 × 1200, du 3:4), une note, une
rencontre et l'œuvre finie : ligne, `photo_chemin` et rencontre relus en base,
puis tout retiré depuis le Journal, **photo du stockage comprise**.

**Le « + » ne propose pas la même chose selon la page** (deuxième précision de
Noé). Le bouton est au même endroit partout ; ce qu'il ouvre, non — sur une page
on vient poster, sur une autre on vient noter un nom :

| Page | Ce que le « + » ouvre |
|---|---|
| Accueil, Journal | la tuile, sur **Tâche** |
| Créer, banque, éditorial | la tuile, sur **Publication**, la pastille de nature **en dernier** |
| Calendrier | la tuile, sur **Événement** |
| Réseau, Passerelle, carnet | la **fiche du carnet**, seule — « toutes les autres possibilités sont cachées » |

`PLUS_PAR_VUE` dit tout cela en dix lignes. **Les sous-pages suivent leur
onglet**, comme la barre le fait déjà : la banque et l'éditorial appartiennent à
Créer, la Passerelle et le carnet à Réseau.

**La nature en dernier**, sur Créer : on y vient pour poster, et le réglage
qu'on change le moins n'a pas à occuper la première place — ce sont la date, le
réseau et le format qui comptent. `fenetreCreation` a gagné `natureEnDernier`
pour ça.

**La fiche du carnet est la même** que le pli du bas de la page — un seul jeu de
champs (`CHAMPS_CONTACT`), deux façons de l'afficher. Les identifiants des
champs diffèrent (`contact-` et `contact-nouveau-`) : deux mêmes `id` sur une
page, ce sont des étiquettes qui désignent le mauvais champ.

**Un piège au passage** : créer une fiche ne redessinait que la LISTE des
contacts (`rendreContacts`), ce qui suffisait au pli mais laissait la fenêtre
affichée par-dessus. Elle ne se referme que si la vue entière est redessinée.

**Vérifié** : les neuf vues ouvertes une à une, avec le relevé de ce que le
« + » propose et de l'ordre des pastilles ; une fiche créée depuis le « + » du
carnet — fenêtre refermée, contact dans la liste, pli du bas intact — puis
supprimée. Base relue : **45 contacts**, son état exact.

**L'ancien bouton « + Ajouter un moment » reste** à sa place sur l'Accueil et le
Journal. Il double maintenant la porte « Moment » de la tuile — c'est une
question posée à Noé, pas un oubli : retirer ce qu'il a validé demande son avis.

### L'accueil : victoires masquées, objectifs en bas

**Les victoires quittent l'accueil** (« pour le moment »), et **les objectifs
passent après la semaine**. L'ordre affiché devient : en-tête et humeur,
« Aujourd'hui », « Ta semaine », « Tes objectifs ».

**Un seul drapeau commande le masquage** : `VICTOIRES_VISIBLES`, dans
`dashboard.js`. Il retire le bloc du squelette, la source de la liste des
requêtes, et fait taire le rendu. Le repasser à `true` rallume tout — c'est la
même façon de faire que le réglage backlog/actif mis en sommeil le matin même
(§ 2 quater).

**Ce qui continue de vivre sans lui, et qu'il fallait vérifier** : cocher une
tâche crée toujours sa victoire en base, l'espace perso et le site du FCH les
affichent, et la ligne « Annuler » sait toujours la retirer — tout ce chemin
touche `etat.victoires` alors que le bloc n'existe plus. **Exercé** : une tâche
cochée depuis l'accueil puis annulée, sans une erreur en console, la base
revenue à son état (aucune victoire de trop).

**L'accueil est passé à sept requêtes** au lieu de huit : le bloc masqué ne
demande plus rien.

---

## 2 sexies. Trois mouvements de plus, et le fond qui montre sa tête

Demandés par Noé le 13 août 2026, après l'analyse de fluidité.

**Un éclair sous le doigt, sur tous les boutons.** Le `scale(0.97)` disait déjà
« c'est pressé » ; celui-ci dit « c'est parti », et se voit là où l'enfoncement
passe inaperçu. Posé une seule fois, dans `app.js`, sur `pointerdown` en
capture — tous les boutons du hub ET des deux sites vivent dans ce document.

**Il passe par `background-image`, et c'est tout le truc** : une image se pose
PAR-DESSUS la couleur du bouton au lieu de la remplacer. Un bouton plein garde
son aplat, un transparent reste transparent, une ligne de liste s'éclaire sans
changer de nature. Les deux autres voies ont été écartées pour de bonnes
raisons : `box-shadow` aurait effacé l'ombre portée du « + » flottant pendant
l'animation, et un pseudo-élément serait entré en collision avec ceux qui
existent déjà — à commencer par le cercle d'une tâche, qui en a deux.

Le cercle d'une tâche en est exclu : il a désormais mieux à montrer.

**La coche se dessine.** Le disque se remplit (260 ms) pendant qu'un « v » se
pose dedans (200 ms, à partir de 70 ms), avec un très court rebond à l'arrivée.
Le « v » est **dessiné, pas écrit** : deux bords d'une boîte vide tournés d'un
huitième de tour, qui gardent leur épaisseur quelle que soit la police. Disque
et coche occupent la **même case de grille** — ils se superposent sans qu'on ait
à positionner quoi que ce soit en absolu, et la cible tactile de 44 px reste
intacte.

**Et la ligne attend d'être vue avant de partir.** Une tâche cochée quitte sa
liste dans l'instant : sans pause, l'animation ne serait jamais vue. La pause
est de **600 ms**, mesurée et non choisie — le dessin prend 270 ms, restent
330 ms où la coche est simplement là. À 300 ms (le premier réglage), la ligne
partait à l'instant précis où le « v » finissait : on voyait la coche se FAIRE,
jamais posée. **Relevé toutes les 100 ms** : coche à 0,56 puis 1,00, disque
plein à 300 ms, ligne partie à 700 ms. L'écriture, elle, n'attend pas — elle
part pendant que l'œil finit.

`prefers-reduced-motion` supprime la pause entièrement : qui a demandé moins de
mouvement ne doit pas attendre pour rien.

**Le fond montre maintenant le haut de la page** (demande de Noé) : ouvrir la
tuile fige la page **au sommet** et non plus là où l'on était. Derrière le
voile, on continue de voir « Hub » et les onglets — c'est ce qui dit où l'on est
en train d'écrire. La première version gardait la position pour que rien ne
bouge d'un pixel ; mais l'en-tête n'est pas collant, et depuis le milieu d'une
liste on ne voyait qu'un morceau de liste sombre : l'application semblait vidée
de sa tête le temps qu'on écrive. Refermer rend sa place à Noé. **Vérifié**
depuis un défilement de 400 px : en-tête à 0, onglets à 47, et retour à 400 en
refermant.

---

## 2 quinquies. La tâche perso — une entorse, bornée

Demandé par Noé le 13 août 2026. Jusque-là, `taches.espace` n'acceptait que les
trois espaces professionnels — au niveau de la BASE, pas seulement de l'écran :
la contrainte CHECK les listait un par un. Migration
`20260813010000_taches_perso.sql`.

**Ce qui change** : `perso` apparaît dans le filtre de l'espace Tâches, dans la
pastille d'espace de la tuile, et pour la nature « tâche » de la tuile du
calendrier. Une tâche perso porte la couleur mauve de l'espace, comme partout
ailleurs — `[data-espace="perso"]` existait déjà en CSS.

**Ce qui ne change pas, et il faut le savoir avant d'y toucher** :

- **`#perso` n'affiche toujours aucune tâche.** Il garde ses intentions, ses
  rendez-vous et ses victoires. Une tâche perso se lit dans l'espace Tâches, au
  calendrier et dans « Aujourd'hui ». C'était la lecture la plus fidèle de la
  demande — Noé a demandé de pouvoir ASSIGNER une tâche à perso, pas de faire de
  son espace un tableau de bord. À rouvrir avec lui si l'usage le contredit.
- **Un jalon reste sans perso** : un jalon mesure une progression, et l'espace
  perso n'en affiche aucune. Une publication non plus : perso ne publie pas, et
  sa table refuse la valeur.
- **La tuile du calendrier offre perso pour un événement ET une tâche**, jamais
  pour une publication ni un objectif — un objectif perso est une INTENTION,
  sans mesure ni date, donc rien qu'on pose sur un calendrier. La règle est
  écrite une fois, dans `NATURES_PERSO`.

**Vérifié** : les quatre choix dans le filtre et dans la pastille ; une tâche
perso créée depuis l'espace Tâches (relue en base : `espace = 'perso'`), une
autre depuis le « + » de l'accueil — elle arrive dans « Aujourd'hui » et dans la
semaine, en mauve ; les listes d'espaces relevées pour les quatre natures de la
tuile (perso présent pour tâche et événement, absent pour publication et
objectif). Les deux tâches d'essai supprimées, base relue : son état exact.

**Un bug trouvé en passant, et réparé.** La capture des Tâches **reste ouverte
après un envoi** — c'est voulu, on en note rarement une seule. Son élément
survivait donc dans le DOM en changeant d'onglet, et l'observateur d'`app.js`,
qui cherchait `.capture` n'importe où, gardait **la page entière figée sur tous
les autres espaces** : plus moyen de faire défiler l'accueil après avoir noté
une tâche. Deux lignes : le sélecteur devient `.espace:not([hidden]) .capture`,
et l'observateur regarde aussi l'attribut `hidden` — changer d'espace ne crée ni
ne détruit de tuile, ça bascule un `hidden`, et c'est justement ce qui doit
libérer le fond. **Vérifié** dans les quatre états : au départ, tuile ouverte,
sur l'accueil tuile restée ouverte, et au retour.

---

## 2 quater. L'espace Tâches et la tuile de capture — la session du 13 août

Le morceau le plus lourd de la journée, et celui qui a le plus bougé : six
formulations successives de Noé, chacune corrigeant la précédente à l'usage.
Ce qui suit est l'état d'arrivée.

**L'espace `#taches` ne cache rien** : datées ou non, faites ou non, tous
espaces. C'est sa raison d'être — ailleurs le hub trie, ici on vient voir
l'ensemble et ranger. Le détail (priorité, tri, couleurs, victoires) est plus
haut, dans la section qui l'a vu naître.

**La tuile de capture est devenue le seul geste de création daté du hub.** Un
« + » flottant en bas à droite l'ouvre, sur l'accueil comme dans les Tâches ;
le calendrier l'ouvre en touchant un jour. Elle sert aussi à CORRIGER une tâche
qu'on rouvre depuis la liste.

**Ce qu'il faut savoir avant d'y toucher** — elle est partagée par quatre
écrans, et chacune de ces règles a été payée par un aller-retour :

- **Les panneaux vivent en permanence dans le DOM, masqués.** On ne redessine
  jamais la tuile pour ouvrir une pastille : cela détruirait le champ du titre,
  ce qui referme le clavier, ce qui replace la tuile. C'est LA règle.
- **Un bouton qui ne doit pas voler le focus annule son `pointerdown`.**
  Pastilles, choix, flèche d'envoi. Les champs de date et d'heure en sont
  exclus : eux en ont besoin.
- **La position dépend de l'écran** : collée au clavier sur téléphone (en bas
  au repos, elle remonte de sa hauteur exacte), centrée sur ordinateur.
  `--bas-clavier` est mesurée sur `visualViewport` — la fenêtre de mise en page
  ne bougeant pas, c'est le seul moyen de connaître la hauteur du clavier.
- **Le fond est figé** pendant qu'elle est ouverte (`body.fond-fige`), déclenché
  par un observateur dans `app.js` et non par les quatre appelants.
- **Les valeurs voyagent dans des champs cachés** pour la tuile du calendrier :
  les espaces lisent toujours le formulaire avec `FormData` et n'ont pas à
  savoir comment la saisie s'est faite. C'est ce qui a permis de tout refaire
  sans toucher à leur code de lecture.
- **`poserAuCalendrier` écrit, en un seul endroit.** Elle était recopiée, et
  c'est ce qui avait fait perdre l'heure et la priorité d'une tâche dans une
  copie sur deux.

**Les espaces se relisent quand on y revient**, par un `rafraichir()` facultatif
que le routeur appelle. **Ne jamais remonter un espace** pour le rafraîchir :
ses écouteurs sont sur la section, qui survit à `innerHTML`, et un second
montage les doublerait tous.

**Vérifié** : chaque chemin d'écriture exercé pour de vrai sur la base réelle
(créer, corriger, cocher, décocher, supprimer, refuser), puis **défait**, avec
relecture SQL à chaque fois. Aucune trace d'essai ne subsiste, et les tâches que
Noé a ajoutées pendant la session n'ont jamais été touchées : chaque suppression
a visé un titre exact plutôt qu'une ligne repérée à l'écran.

Il n'y a **pas de base de bac à sable** : tout essai touche les vraies données.
La méthode qui a tenu toute la journée — exercer, relire en SQL, défaire, relire
à nouveau — est la seule qui rende cela acceptable.

---

## 3. Ce qui attend une réponse de Noé

**Ce que la session du 30–31 août (soir) a CLOS ici** — ne plus le reposer :
- **« Le rendez-vous du dimanche dit la semaine et ne permet d'y rien poser »** —
  c'était le trou le plus visible de l'orientation, il est bouché : « Ma
  semaine » (§ 0.1).
- **Le rendez-vous validait la MAUVAISE semaine** — il écrivait le lundi passé
  et revenait le lendemain matin. Corrigé par `pivotDeLaSemaine`.
- **« La porte du dimanche passe devant »** — la règle était écrite depuis le
  29 août et le code ne la tenait pas. Il la tient.
- **Un projet créé depuis la galerie ne pouvait plus JAMAIS être rattaché à un
  cap** — la pastille « Objectifs servis » le fait (§ 0.6). Six des dix projets
  de Noé n'en servent aucun : c'est maintenant réparable.
- **L'heure d'une tâche ou d'une publication ne se corrigeait nulle part** —
  elle se posait à la capture et ne se rattrapait pas (§ 0.3).
- **`corriger` et `effacer` vivaient en double** dans l'accueil et le
  calendrier — ils vivent dans `calendrier-commun.js`.
- **Le plafond de largeur de 1240 px** — retiré sur décision de Noé (§ 0.4). La
  règle « la mise en page prend toute la largeur, le texte jamais » reste, et
  c'est elle qui rend la suppression possible.
- **Ce qu'on pose depuis un calendrier** — c'est une **tâche** par défaut, plus
  un événement (§ 0.3).
- **L'échéance d'un objectif** — **obligatoire** au formulaire. Le jalon garde
  la sienne facultative.

**Ce que la session du 28 août a CLOS ici** — ne plus le reposer :
- **La colonne `famille` était vide et rien ne l'écrivait** — c'était le premier
  trou de l'orientation, il est bouché (§ 0 ante ter, point 2). Le plancher perso peut compter.
- **La question de la période** (« 45 h pour 35, qu'est-ce qui cède ? ») —
  **retirée des deux écrans**, sur décision de Noé (§ 0 ante ter, point 1, point 1). Ne pas la
  remettre : elle a été posée, essayée avec une troisième porte, puis retirée.
- **L'espace Objectifs empilé** — remplacé par « Le cap » et ses deux galeries.
- **Un projet ne se modifiait pas une fois créé**, et **une période non plus** :
  les deux se corrigent maintenant. C'était la moitié du point 20 de la reprise
  précédente.
- **Les cinq oublis de la coquille** (`verifier-coquille.js`).

**Ce que la seconde session du 27 août avait CLOS**, toujours valable : la
demande de fond « le hub doit m'orienter » ; le fil tâche → objectif rompu ; la
règle « une tâche répétée ne se termine pas » ; le compteur « publications
sorties » aveugle aux séries ; les menus déroulants morts de l'espace Objectifs.

**Ce que la session du 30 août a CLOS ici** — ne plus le reposer :
- **Les rubriques éditoriales du club** (question n° 1 de `fch-spec.md` § 7) —
  **répondue** par l'arborescence du dossier FCH, puis corrigée par Noé. Ne pas
  réinventer « avant-match, portrait, coulisses ».
- **La cible de revenus partenaires** — c'est **26 000 €**, donnée par Noé. Le
  document « Objectifs et planification Alternance FCH 2025/2026 » du Drive est
  celui de l'AN DERNIER : **obsolète, ne pas s'en servir.**
- **La place des partenaires dans le travail de Noé** — tranchée : ce n'est PAS
  sa mission principale (§ 0.1). Le hub n'est qu'un **affichage** du Google
  Sheet, rien ne s'y modifie, et une porte mène au fichier.
- **« L'organisation club attend son contenu »** — `#hermitage/club` est rempli
  (§ 0.5). La ligne correspondante a été retirée de `fch-spec.md` § 6.
- **Le hub ne savait pas reconnaître un temps fort du club** — il ne le devine
  toujours pas, et c'est voulu : `temps_fort` est une déclaration.
- **« Quand ça vient » comme cadence d'habitude** — supprimé, sur décision de
  Noé. Ne pas le réintroduire (§ 0 ante ter, 0.7).
- **« Je ne peux plus modifier une habitude »** — deux causes, les deux
  corrigées : le menu invisible, et surtout `brancherChoix` absent de `perso.js`
  (§ 0.9). Ce second défaut **préexistait** et touchait aussi la famille d'une
  habitude et le statut d'un livre.

**Ce que la session du 29 août au soir a CLOS ici** — ne plus le reposer :
- **« Deux projets sont des candidats évidents à à l'année »** — tranché : Noé
  les a passés lui-même, et le rail les écarte (un rythme ne se classe pas par
  dormance).
- **« Deux projets qui ne devraient plus être en cours »** (Deuxième dossier à
  3 sur 3, Présentation des catégories sans tâche) — la question ne se pose plus
  dans ces termes : **c'était la mesure qui mentait**, pas le classement. La
  cascade l'a corrigée (§ 0 ante ter, point 1).
- **« Un projet ne se mesurait que par ses tâches »** — remplacé par la cascade.
- **L'ordre des jalons et des étapes** ne pouvait pas se changer ; il se change.
- **Perso n'avait ni habitudes, ni lecture, ni bilan quotidien** — les trois
  existent.

**Nées du 28 août, et sans réponse** :
- **Plus aucun écran n'écrit d'arbitrage.** La table `arbitrages`, son API et
  `tensionDeLaPeriode` sont intactes, mais la seule question qui s'en servait a
  été retirée. Les garder pour le jour où une autre question mérite une trace,
  ou les retirer ? *(Posé à Noé, sans réponse.)*
- **Deux projets sont des candidats évidents à « à l'année »** — ce sont les
  seuls qui portent une charge hebdomadaire plutôt qu'un total, la signature d'un
  rythme : « Programmation de la semaine » (4 h/sem) et « Anniversaires du mois »
  (30 min/sem). Laissés *en cours* : c'est son classement, pas le mien.
- **Sur une tuile du FCH, la pastille de l'espace et le point de l'état sont
  tous deux bleus.** Le bleu « en cours » a été pris plus saturé que celui du
  club pour les séparer ; à l'usage, ça peut ne pas suffire. Deux sorties
  possibles : un autre bleu, ou pas de point quand l'état est le cas ordinaire.

**Nées du 27 août, et toujours sans réponse** :
- **D'où vient la durée de 5 minutes** sur « Contacter l'entreprise de Cedric
  Facebook » ? Elle n'a pas été écrite volontairement (§ 0 ante quater.7).
- **Les trois lots écrits dans ses données** sont-ils justes : les cibles des
  projets FCH, les 62 rattachements par nom, les six livrables formation
  chiffrés 25/6/6 h ? Ce sont des propositions.
- **Les projets de Yuno** — trois ont été nommés en conversation (tester un
  événement de basket, lancer les presets, publier l'offre) mais aucun n'existe
  en base. Sans eux, l'orientation ne peut jamais proposer Yuno. **La galerie des
  projets rend le manque visible** : la colonne Yuno y est vide.
- **L'horizon de seize semaines** des séries convient-il, maintenant que
  l'espace Tâches porte 72 lignes ?

**Un point né le 15 août, encore ouvert :**
- **Les 47 menus « Niveau » du CRM** restent les derniers `select` natifs du
  site. Noé ne les a pas demandés — à proposer s'il repasse par le réseau.

*(Le format « Post » du FCH, ouvert le 15 août, est clos : le club publie
depuis, et carrousel, réel et story ont suffi. Le CHECK accepte toujours
`post`, plus rien ne l'écrit.)*

**Le cycle éditorial du club est tranché** (25 août) : trois états — à
préparer, à programmer, publié — sur les valeurs que la base connaissait déjà.
Ce qui reste à observer n'est pas une question ouverte mais un usage à
regarder : l'étape du milieu sert-elle ? Voir § 4 bis, « Ensuite, écouter
l'usage ».


**FC Hermitage — le chantier s'est rouvert** les 21, 24, 25 et 26 août
(réunions, calendrier, habillage, idées modifiables, trois états éditoriaux,
page du hub refaite) ; « mis de côté » n'est plus vrai.
Deux des quatre questions du 13 août restent sans réponse, et aucune ne gêne le
reste du hub :
1. Les rubriques éditoriales proposées (avant-match, résultats, portrait,
   coulisses, partenaire, vie du club) correspondent-elles à ce qu'il publie ?
2. Le contenu de l'écran « Club » — toujours volontairement vide, il dit ce
   qu'il attend.

*(La question des **4 objectifs de fin d'alternance** est close depuis le
26 août — et la réponse a été **trois**, pas quatre : voir § 0 ante quater, point 1, pour
la raison. Ne pas en « rajouter » un quatrième.)*

(La quatrième, les statuts de relation des partenaires, s'est réglée d'
elle-même : les partenaires sont des contacts, ils ont l'échelle du CRM.)

**Yuno** — deux lectures de captures, **confirmées justes par Noé le 13 août** :
le type des deux agences (« Agence ») et la fiche de « Nouhou Tolo »
(`@salvadorebanouh`, club « Sounders »). Rien à corriger.

**Yuno / la Passerelle** : la refonte annoncée le 13 août **a eu lieu** — le
vivier de 97 clubs le 15, le Réseau réorganisé le 21 (l'onglet ouvre le
rituel, tuiles de fin de page, bandeau cliquable). Restent sans réponse les
deux cartes qui manquaient déjà : les **salles de concert** visées (objectif :
une première accréditation) et les **clubs à cibler à froid**. Elles
attendent des noms réels, pas du code.

**Le mot « carnet » ne désigne plus qu'une chose** (tranché le 13 août) : le
Carnet de terrain. La base de contacts s'appelle **le réseau** (§ 2 nonies).

**Le bouton « + Ajouter un moment » de Yuno reste** (décision de Noé, 13 août
2026). Il double la porte « Moment » de la tuile sur l'Accueil et le Journal,
et c'est assumé : sur les deux pages du carnet, le geste le plus fréquent
mérite d'être nommé en toutes lettres plutôt que caché derrière une pastille.

**Ouvertes par la session du 13 août** — aucune ne bloque, toutes attendent
l'usage :

9. **Le plafond de 3 tâches actives dort, et il continue** (Noé, 13 août :
    « laisse tel quel »). Le réglage backlog/active est masqué, donc rien
    n'exerce plus le plafond, et « Aujourd'hui » ne filtre plus — il montre les
    9 premières tâches. Le jour où ce bloc devient une liste qu'on subit, c'est
    le signe qu'il faut rallumer la pastille : tout le code est en place.
10. **« Aujourd'hui » ignore les tâches sans date — confirmé** (Noé, 13 août :
    « laisse tel quel »). Une tâche notée sans échéance n'y apparaît jamais, et
    c'est voulu : sinon le bloc du matin se remplirait de tout ce qui traîne.
    **Depuis le 27 août, ces tâches-là ont trouvé leur porte ailleurs** : ce sont
    elles que « Ce que je te propose » va chercher, précisément parce que ce
    qui n'est jamais daté n'est jamais fait. La règle ne bouge pas ; ce qu'elle
    laissait dehors n'est plus perdu.
11. **Plus un seul menu déroulant natif dans le hub** (13 août, § 2 nonies) :
    le formulaire de modification du calendrier d'abord, puis les quatre autres
    à la demande de Noé — le moment, la fiche réseau, la commande et l'idée.

---

## 4. Ce qui manque encore

Rien d'ouvert dans les deux cahiers des charges des sites. **`orientation-spec.md`
a ses huit étapes faites** ; ce qui lui manque est de la matière, pas du code —
voir § 4 bis, « Les quatre manques ». Restent des conforts :

- **Le site FCH grandira** : Noé annonce « beaucoup d'usages » et ne sait pas
  encore ce que contiendront marketing et organisation club. Ne rien inventer
  à sa place — chaque écran est une sous-adresse indépendante, on en ajoute un
  quand le besoin est constaté.
- **Les outils d'aide à la création du FCH** attendent, comme ceux de Yuno
  attendaient : ceux de Yuno existent maintenant (piliers, tirage, checklist),
  et pourraient servir de modèle si le club en veut l'équivalent.
- **La base et ses affichages** n'existent que pour le carnet réseau — qui a
  gagné une troisième vue, la Passerelle, sans rien changer aux deux autres :
  la preuve que le mécanisme tient. Le même s'appliquerait aux commandes, aux
  publications et aux partenaires : c'est du branchement, pas de la
  construction.
- **L'assistant IA de « Créer »** (hooks, bases de légende) est la v2 annoncée
  du système Terrain. Règle posée d'avance : il propose, Noé choisit et
  retravaille — jamais générer à sa place.
- **Suivi automatique des abonnés Instagram** : possible mais coûteux en
  tuyauterie (app Meta, jeton à renouveler tous les 60 jours, fonction
  serveur). Différé.
- ~~**Modifier une tâche, un événement, une publication**~~ — **plus rien à
  faire ici** : tout se modifie désormais. Les tâches par leur tuile (rouvertes
  depuis l'espace Tâches, « Aujourd'hui » ou « Le cap »), les événements et les
  publications par le formulaire du calendrier, les objectifs, jalons, projets
  et périodes par « Le cap », les moments et les contacts chez Yuno. La règle
  « on supprime et on recrée » n'a plus cours.

---

## 4 bis. Par où reprendre (fin de la session du 2 septembre 2026)

Dans cet ordre, du plus pressé au moins pressé.

### 0. CE QUI ATTEND DANS L'ARBRE DE TRAVAIL

**La page d'un projet n'est PAS commitée.** Le travail est entier et vérifié
dans le navigateur (§ 0.5), mais il faut le relire et le pousser :

    js/projet.js  js/objectif.js  js/habitude.js     (nouveaux)
    supabase/migrations/20260902090000_echeance_etape.sql   (nouveau, DÉJÀ APPLIQUÉ)
    js/objectifs.js  js/gabarits.js  js/calendrier-commun.js
    js/api.js  js/app.js  js/semaine.js  css/styles.css  sw.js
    CLAUDE.md  docs/etat-des-lieux.md

**La migration est déjà appliquée à la base réelle** — la colonne
`projets_etapes.echeance` existe. Le fichier SQL est là pour la trace ; ne pas
la rejouer en croyant qu'elle manque (elle est en `if not exists`, mais autant
le savoir).

**`sw.js` passe en `v14`**, parce que TROIS fichiers neufs entrent dans la
coquille : `js/projet.js`, `js/objectif.js` et `js/habitude.js`. Sans ce changement de version, un appareil déjà installé
n'aurait jamais rapatrié la liste. Conséquence connue et assumée — **il
affichera une fois la version d'avant** ; ouvrir deux fois si l'écran semble
d'hier. *En local, la stratégie est inverse (réseau d'abord) — mais si un écran
d'avant apparaît quand même pendant une session de travail, vider le cache et
désinscrire le service worker.*

**Un piège d'outillage réparé pendant la session, à connaître** :
`tools/verifier-gabarits.js` disait « sains » alors que la page ne se chargeait
plus (§ 0.8). Il est corrigé — mais **la leçon vaut pour le prochain outil qu'on
croira sur parole**.

### Ce qui est périssable

0 pre. **LES DEUX PAGES, À L'USAGE.** Elle a été éprouvée geste par geste,
   jamais vécue. Trois questions : **le glissement se fait-il sans viser** — les
   colonnes encadrent la grille au-delà de 1200 px et s'empilent en dessous, et
   c'est là que le geste peut manquer ; **le filtre par défaut est-il le bon**
   (« À poser » ; « Programmées » serait l'autre candidat si Noé vient surtout
   relire sa semaine) ; **et les étapes datées servent-elles à quelque chose**,
   ou continue-t-il de tout passer par des tâches. Si la troisième réponse est
   « rien », c'est la décision du 2 septembre qu'il faut rouvrir, pas la page.

0 bis. **LE RENDEZ-VOUS DU DIMANCHE, LE 6 SEPTEMBRE AU SOIR — et cette fois avec
   les BLOCS.** C'est la première fois que « Ma semaine » servira à ce pour quoi
   elle est faite, et la première fois que la proposition d'emploi du temps sera
   jugée sur une vraie semaine. Les questions, dans l'ordre : **la forme
   proposée ressemble-t-elle à ce qu'il fait** (six jours, formation le matin,
   club l'après-midi, une pause à 13 h) ; **les gestes se font-ils sans
   réfléchir** (glisser un bloc, y déposer une tâche) ; et **« C'est ma semaine »
   écrit-il bien sa ligne** — le bouton n'a **jamais été pressé**, parce
   qu'aucun écran ne permet de retirer ce qu'il écrit.
   *Ce rappel a changé le 1er septembre au soir : l'arrangement des blocs SE
   GARDE maintenant (§ 0.2). Ce qui est déplacé, ajouté ou retiré revient à la
   visite suivante, et « Reproposer les blocs » efface la ligne pour redonner la
   main au calcul. Les quotas, eux, tombent juste — club 26 h / 26, formation
   15 h / 15 — ce qui n'était pas le cas au matin.*
0 ter. **LE PREMIER BILAN DU SOIR, dès ce soir après 20 h.** Rien de « Mes
   journées » n'a été vécu : le journal de Noé est **vide**, la gratitude aussi,
   et la porte du soir n'a jamais été vue à son heure — elle a été éprouvée en
   forçant l'horloge, pas en attendant 20 h. Les questions : **la porte se
   remarque-t-elle** au milieu de l'accueil ; **le champ sans rectangle invite-t-il
   à écrire** ou a-t-il l'air d'un texte à lire ; et **la porte disparaît-elle**
   une fois le bilan écrit (elle regarde le journal ou la gratitude, pas la note
   du jour).
0 quater. **LA GRILLE AU DOIGT, toujours pas éprouvée** — et elle a changé deux
   fois depuis. Deux points neufs à surveiller : **un bloc court n'est plus une
   cible de 24 px** (sa hauteur vaut sa durée, décision assumée du § 0.5), et le
   chemin tactile de la programmation (choisir la tâche, puis toucher le jour)
   n'a jamais été essayé. **Un geste tactile ne se vérifie pas en simulant des
   événements** — la leçon du 29 août tient.
1. **LE CLAVIER D'UNE TUILE D'AJOUT sur iPhone**, jamais vérifié : un `focus()`
   programmé hors d'un geste ne lève pas le clavier sur iOS, et c'est pour ça que
   la tuile l'appelle depuis le clic sur son sommaire.
2. **UN VRAI MATIN AVEC LES HABITUDES — toujours, et maintenant sur une forme
   qui a changé six fois.** Rien n'a encore été vécu : les cinq habitudes de Noé
   sont à **zéro pratique**. Trois questions, dans l'ordre : la ligne de 32 px
   se coche-t-elle **au pouce sans viser** (l'arbitrage assumé du § 0 ante ter, 0.7) ;
   les **deux chiffres nus** se lisent-ils sans effort maintenant qu'aucun mot ne
   les explique ; et l'**émoji** rend-il vraiment la ligne reconnaissable.
3. **DONNER UNE CADENCE À « Prendre des nouvelles de quelqu'un ».** C'est la
   seule habitude qui porte encore `cadence = NULL`, et elle attend dans le
   groupe « À régler ». Tant qu'elle y est, elle n'a ni élan ni série.
4. **LE PREMIER PALIER FRANCHI**, toujours jamais vu. Personne n'a encore
   regardé une victoire « Bouger — 10 fois » arriver dans « Le chemin ».
5. **LES GRAPHIQUES AVEC DE VRAIES DONNÉES.** La courbe des douze semaines et
   les sparklines n'ont été jugées que sur un **rendu d'essai en DOM**
   (§ 0 ante ter, 0.8) — à zéro pratique, l'écran réel ne montre que des barres minimales.
   La question à se poser : est-ce que ça **donne envie**, ou est-ce que c'est la
   maquette en points gris que Noé a déjà rejetée une fois ?
6. **LA BIBLIOTHÈQUE EST VIDE, et la colonne de droite de `#perso` avec elle.**
   Aucun livre en base : le duo « Habitudes | Ta lecture » ne montre pour
   l'instant qu'une tuile pointillée. Le choix de la lecture comme seconde
   colonne se juge avec un livre en cours, pas sans.
7. **LE SITE FCH SUR LE TÉLÉPHONE, en Gilroy et à la charte.** Le service worker
   sert la version précédente au premier lancement — **il faudra sans doute
   ouvrir deux fois** pour voir la bascule. Et c'est la première fois que Noé
   verra sa charte à l'écran plutôt qu'en PDF.
8. **LE GOÛTER DE NOËL A ÉTÉ POSÉ SANS HEURE ET SANS « PHOTOS ».** L'heure
   n'était pas connue ; la case « Photos » est une déclaration qui appartient à
   Noé — or « présentation des équipes » est manifestement un moment photo. À
   trancher quand il ouvrira l'événement.
9. **LES HUIT AUTRES DATES DE LA SAISON FCH ne sont pas en base** (§ 0 ante ter, 0.1). Deux
   d'entre elles portent un « ou » (loto 13 **ou** 20 février, matinée saucisses
   11 **ou** 18 avril) : ce sont des décisions du club, pas des dates à
   recopier.

### Ce qui attend une action de Noé

10. **LE COMPTE DE SERVICE GOOGLE**, pour `#hermitage/partenaires`. C'est la
   seule étape du plan FCH qui ne peut pas avancer sans lui : créer un compte de
   service (gratuit), partager le Sheet en lecture avec son adresse, et poser sa
   clé en variable d'environnement Supabase — **jamais dans le dépôt**, qui est
   public.
   *Le choix technique est arrêté et documenté : une Edge Function Supabase, pas
   une publication du Sheet sur le web ni un Apps Script — parce que le dépôt
   est public et que le Sheet porte 288 contacts d'entreprises.*
11. **« Résultats du week-end » reste à poser.** C'est la seule rubrique
    hebdomadaire qui ne tourne pas. Le bouton « Poser ce rythme » ouvre le
    formulaire déjà rempli ; il manque le titre et le jour de départ, qui sont
    des décisions.
12. **LES CONTREPARTIES DES PACKS**, quand les partenaires seront branchés.
    C'est la part de Noé dans les partenariats (§ 0 ante ter, 0.1), et elle se déduit du
    pack. Chaîne à tenir : les vignettes et encarts partent dans le dossier de
    l'album, qui se boucle **six semaines avant la livraison**.

### Ensuite

13. **La piste n° 1 de l'étude de marché** : croiser l'humeur et les habitudes.
    Les trois ingrédients existent (humeur du jour, habitudes cochées, famille de
    chacune), rien à stocker, et personne ne les croise. § 0 ante ter, 0.10.
14. **La régression de la barre d'onglets sur les deux sites** — une tâche de
    fond a été proposée et lancée par Noé pendant la session. Vérifier où elle
    en est avant d'y retoucher : la barre du hub reste visible sur `#hermitage`
    et `#yuno`, alors que les deux specs l'interdisent.
15. **La pastille « Photos » ne s'affiche pas sur les sites** (§ 0 ante ter, 0.5), défaut
    préexistant repéré en posant celle du temps fort. Une ligne, même motif.
16. **`#hermitage/club` à l'usage.** Il ne sert à rien tant que Noé n'a pas
    besoin d'y chercher quelque chose — mais il sert l'objectif du 15 décembre.
17. **LES TROIS CHOSES QUE LE HUB POSE LUI-MÊME, sur de vrais événements** :
    préparation à J−2, tri à J+1, post d'un match. *(Inchangé.)*
18. **Une vraie semaine avec la pastille famille**, **le balayage sur le
    téléphone**, **le rendez-vous du dimanche un vrai dimanche soir**,
    **l'horizon de seize semaines**, **la tuile volante sur téléphone**, **« Le
    chemin » et « Le temps » après une vraie semaine** — tous inchangés, tous en
    attente d'un vrai usage.

19. **CE QUE LA SESSION DU 31 A LAISSÉ OUVERT.** Trois points, tous petits :
    - **la nature par défaut sur les DEUX SITES.** « Une tâche par défaut »
      (§ 0 ante ter, 0.3) vaut maintenant aussi pour le calendrier du FCH et pour Yuno hors
      vue éditoriale. Chez Yuno, les sorties sont la matière du site : si
      « Événement » y était le bon défaut, c'est une ligne dans le seul appel de
      `js/yuno.js`.
    - **les tuiles d'ajout des deux sites n'ont pas été ouvertes une à une.**
      Elles passent par le même `construireFormulaire` que le hub, et le
      balayage d'erreurs est propre — mais leur mise en page n'a pas été
      regardée depuis la refonte en pastilles.
    - **le vivier ne montre que les tâches.** Une publication sans date est une
      idée de la banque, et elle ne se programme donc pas depuis cette page. Ça
      se défend ; à rouvrir si l'éditorial se programme aussi le dimanche.

20. **CE QUE LE 1er SEPTEMBRE AU MATIN A LAISSÉ OUVERT — deux points sur cinq
    ont été TRANCHÉS l'après-midi**, et il faut le savoir avant de les rouvrir :
    - ~~l'arbitrage entre « un bloc par jour » et « les quotas tenus »~~ →
      **RÉGLÉ.** Il n'y avait pas d'arbitrage à faire : c'étaient **trois
      défauts** de l'algorithme, pas une contradiction entre deux règles de Noé
      (§ 0.1). Mesuré après correction : **club 26 h / 26, formation 15 h / 15**,
      six jours entre 6 h 30 et 7 h 30. **Ne pas rouvrir cette question comme un
      arbitrage.**
    - ~~les blocs ne s'enregistrent pas~~ → **RENVERSÉ par Noé** le soir même.
      L'arrangement se garde dans `semaines_blocs` (§ 0.2). Le motif d'origine
      (« rien à maintenir ») tenait ; c'est son prix que l'usage a révélé.
    - **l'algorithme ne connaît que le club et la formation.** Yuno et perso
      n'ont pas de blocs proposés (décision de Noé) : leurs tâches se rangent
      dans les vides — et depuis le 1er septembre au soir, **celles qui portent
      une heure se dessinent à leur heure**. À l'usage, vérifier que ça se lit.
    - **le jour de repos est choisi par l'algorithme**, jamais par Noé. Personne
      n'a encore regardé si le jour qu'il retient est celui qu'on aurait choisi.
    - **le second tri des barres est celui de `ORDRE_ESPACES`** — FCH,
      formation, Yuno, perso — après l'heure. C'est l'ordre des journées de Noé,
      pris de `js/format.js` et désormais partagé par quatre écrans. Rien ne dit
      qu'il soit le bon dans une colonne de calendrier ; c'est le seul qui
      existait.

21. **CE QUE LA SESSION DU 1er SEPTEMBRE (SOIR) LAISSE OUVERT.** Six points,
    aucun bloquant :
    - **LE REPLI DU RELEVÉ NE SE GARDE PAS d'un jour à l'autre.** La tuile est
      redessinée à chaque ouverture, avec le tiroir ouvert. C'est assumé — « le
      repli est un geste rare, il n'a pas besoin d'un état à tenir » — mais si
      Noé le referme tous les soirs, c'est cette décision qu'il faut rouvrir.
    - **LA NOTE DU JOUR EST DEMANDÉE À DEUX ENDROITS.** Noé a dit qu'elle doit
      se noter « en fin de journée plutôt qu'au début » ; l'accueil continue de
      la demander le matin, en tête de page. Je ne l'ai pas retirée — la
      salutation de l'accueil s'appuie sur « humeur non notée », et la retirer
      touche un autre écran. **À lui de dire s'il veut qu'elle quitte
      l'accueil.**
    - **LA GRATITUDE NE SE RELIT NULLE PART.** La colonne existe et se remplit ;
      aucun écran ne la ressort. C'est pourtant l'argument qui a justifié d'en
      faire une colonne à part — remonter une année de gratitudes. Le candidat
      naturel est la relecture qui ferme la journée (`relecture`,
      js/orientation.js), qui ne connaît aujourd'hui que les victoires et les
      intentions.
    - **LE POINT DU CALENDRIER NE DIT PAS LES PUBLICATIONS.** `resumeDesJournees`
      lit les tâches faites, les événements, les habitudes et les mots — pas les
      parutions. Un jour où seule une publication est partie n'a donc aucun
      point. À voir à l'usage : ça peut être juste (une parution n'est pas du
      temps passé) comme ce peut être un oubli.
    - **LES PROJETS TRAITÉS COMPTENT LES ÉVÉNEMENTS RATTACHÉS**, pas les
      publications. Même question, même arbitrage.
    - **LA PORTE DU SOIR ET CELLE DU DIMANCHE COEXISTENT** le dimanche à partir
      de 20 h. Elles ne se distinguent que par leur libellé et leur couleur —
      violet pour le perso, accent pour la semaine. Personne ne les a encore vues
      côte à côte.

### Sans urgence

21. **Vérifier sur le vrai iPhone** ce qui ne l'a jamais été : la tuile avec un
    clavier réel, le service worker en application d'écran d'accueil, le poids
    d'une visite du Journal.
22. **Le FCH en bleu, à l'usage.** La paire la plus proche est FCH (212°) et
    perso (256°). Si les deux se confondent, c'est le perso qu'il faudra
    déplacer, pas le club.
23. **Une incohérence de données**, relevée le 28 et toujours là : 30 tâches
    faites pour 23 victoires `tache`.
24. **Une classe CSS morte** : `.liste-projets .projet-nom` n'a plus aucun usage
    en JS.
25. **Les chantiers de fond inchangés** : conversion des espaces à
    `js/ecriture.js`, démarrage par morceaux à porter aux petits espaces, le
    geste « détacher » une tâche de son projet, les inférences une par une.
26. **Le thème clair est parti, et avec lui une vérification** : plus personne ne
    regarde ce que donnent les écrans en plein jour.

### CE QUE LA SESSION DU 1er SEPTEMBRE A REFERMÉ

Retiré de cette liste, et dit explicitement pour qu'une session future ne le
rouvre pas en croyant bien faire :

- **« La forme d'une barre de calendrier »**, qui attendait depuis l'étude UX
  des calendriers. Tranchée : trois natures, trois dessins, une seule police
  (§ 0.2). Ne pas y remettre d'italique pour les publications — Noé l'a demandé
  puis retiré le même soir.
- **« Quelle police pour les barres »**. Instrument Sans avait été essayée,
  Gilroy régnait : c'est **Google Sans** qui l'emporte, sur les titres, les
  heures et le décompte (§ 0.3). *La question « Gilroy sur le site du club »
  était déjà close (§ 0 ante ter, 0.2) et ne bouge pas : Gilroy garde les
  onglets, Google Sans prend les barres.*
- **« Comment le hub propose-t-il une organisation de la semaine ? »**, posée
  depuis la naissance de « Ma semaine » et jamais traitée. Elle a maintenant une
  réponse entière : `blocsDeLaSemaine` (§ 0.5). Ce qui reste ouvert n'est plus
  la question mais son réglage — voir le point 20.
- **« Les cartes de "Ce que je vois" prennent trop de place »** : refondues en
  cartes de deux lignes, en colonnes, remontées entre le bilan et la grille
  (§ 0.4).
- **La graisse du titre d'une tâche** (400 contre 500), qui traînait « en
  attente d'une décision de Noé ». La question n'a plus d'objet : le titre d'une
  barre est en Google Sans 400, celui d'une tuile du vivier dans la même police,
  et les deux se ressemblent enfin. Si quelque chose gêne encore, ce sera une
  nouvelle question, pas celle-là.

## 5. Décisions à ne pas défaire sans raison

Celles qui ne sont pas déjà dans `CLAUDE.md` ou les cahiers des charges :

**Ce que la session du 29 août au soir a posé, et qui se défera facilement par
mégarde** :

- **Une habitude ne se mesure JAMAIS par une série classique.** Le tout ou rien
  est ce qui écroule, pas l'enjeu. La série compte les semaines et **recule d'un
  cran** ; l'élan descend de 2 par jour, jamais d'un coup ; le cumul ne descend
  pas. Une session qui « simplifierait » en remettant un compteur de jours
  d'affilée referait le défaut que Noé a rejeté nommément.
- **L'avancée d'un projet ne se déduit jamais de ses tâches.** Le dénominateur
  doit être DÉCLARÉ (étapes, ou charge). Le remettre sur les tâches ferait
  revenir les deux mensonges mesurés : 100 % sur un projet qui commence, et une
  barre qui recule quand on note du travail.
- **La lecture n'a pas de quota.** Ni objectif annuel, ni nombre de livres. Le
  rythme se compte par jour de lecture, jamais par jour de calendrier.
- **« Vivre de la joie, de l'espoir, de la simplicité » n'est pas une
  habitude** et ne doit pas le devenir : c'est l'intention-mère, celle qui juge
  les autres.
- **Le tableau de bord perso ne porte que ce qui évolue et se coche.** Les
  intentions en sont sorties comme les objectifs sont sortis de l'accueil — sauf
  UNE, relue, qui est ce qui empêche la page d'être un second accueil.

**Les données personnelles n'entrent pas dans le dépôt.** Le dépôt est public.
Les contacts (numéros, comptes Instagram) sont allés directement dans
Supabase via SQL, jamais dans un fichier versionné. Seul le schéma l'est. Toute
reprise d'un tableau Notion suit cette règle.

**La règle s'est élargie le 12 août : la stratégie non plus n'entre pas.** Les
deux documents fondateurs de « Terrain » vivent dans `Yuno/`, qui est dans le
`.gitignore` — le brief porte les cibles et la ligne éditoriale, le « pourquoi »
une analyse personnelle. Les 15 idées et les 4 modèles de messages ont suivi le
même chemin que les contacts : chargés en SQL, absents du dépôt.

**Les compteurs ne sont stockés nulle part**, et c'est un choix de fond, pas
une optimisation : les trois du Carnet et les deux de la Passerelle se déduisent
de faits accumulés, donc ils ne peuvent que monter. Les stocker ouvrirait la
porte à un compteur qui redescend.

**`journal_envois` n'a pas de colonne « répondu ».** Ne pas en ajouter une.
Toute la Passerelle tient sur ce point : on mesure ce que Noé envoie, jamais ce
qu'on lui répond. Un taux de réponse ferait de chaque silence un rejet mesuré.

**Les chiffres des réseaux ne s'affichent qu'au rendez-vous stats.** Nulle part
ailleurs, à aucune condition — c'est la règle la plus facile à franchir par
inadvertance en ajoutant « juste un petit indicateur » sur l'accueil.

**Le bucket `moments` est privé, et doit le rester.** Ce sont les photos de
Noé ; le site et le dépôt sont publics. Les images ne s'affichent que par des
URL signées d'une heure, refabriquées à chaque visite. Rendre le bucket public
« pour simplifier » donnerait des liens recopiables par n'importe qui.

**Les occurrences d'un événement récurrent ne sont pas stockées.** Une ligne en
base, autant de dates que le calendrier en montre — c'est ce qui permet de
changer l'heure d'un entraînement hebdomadaire d'un seul geste. Conséquence
assumée : on ne peut pas décaler une seule occurrence. Le glissement est donc
refusé sur une barre récurrente. Y toucher demandera une table d'exceptions.

**La taille du texte se règle en un seul endroit** : `html { font-size }` dans
`css/styles.css`. Tout le site est en rem et suit. Deux exceptions à ne pas
« harmoniser » — l'espacement reste en px, et les champs de saisie sont tenus à
16 px, faute de quoi Safari sur iPhone zoome à chaque fois qu'on entre dans un
champ.

**Aucune dépendance n'est appelée à distance.** Les polices ET supabase-js
vivent dans le dépôt. Ce n'est plus seulement une question de sobriété : depuis
le service worker, un fichier distant est le seul morceau que l'ouverture hors
ligne ne peut pas garantir. Et une version qui « suit la dernière publiée » est
une panne qui attend son jour. Rapatrier, figer, noter le numéro.

**Les polices commerciales sont dans le dépôt public**, en connaissance de
cause : Canela Deck et Gilroy (versions d'essai), décision explicite de Noé du
7 août. À ne pas « corriger » sans le lui redemander.

**L'ordre des colonnes vit dans le navigateur** (`localStorage`), pas en base :
c'est une préférence d'affichage. Conséquence connue — il ne suit pas d'un
appareil à l'autre. Le passer en base est un choix ouvert, pas un oubli.

**Les deux sites imposent leur fond** quel que soit le réglage du téléphone
(Yuno sombre, FCH bleu), avec `color-scheme: dark` — sans quoi les contrôles
natifs se dessinent en clair.

**Le hub n'a pas de couleur d'alerte et n'en aura pas.** Le rouge du FCH, le
doré de Yuno, les statuts du carnet sont des couleurs d'identité ou d'état,
jamais des signaux de retard. C'est la ligne la plus facile à franchir par
inadvertance.

**Une publication se lit comme une TÂCHE au calendrier, pas comme un
événement** (demande de Noé, 25 août 2026) : plus d'aplat de couleur, un trait
à gauche et c'est tout — l'aplat reste aux seules choses qui *arrivent*. Elle a
même le ROND d'une tâche, et il dit où elle en est : creux tant qu'elle est à
préparer, à moitié plein quand elle est prête à partir, coché une fois publiée
— et le titre barré, comme une tâche faite. C'est la seule chose que la grille
dit sans qu'on ouvre la tuile.

**Et le rond s'appuie : il avance d'un cran** (`data-avancer-pub`). Les deux
gestes cohabitent pour la même raison que chez les tâches : le rond fait le pas
suivant sans quitter la grille, la tuile fait tout le reste — sauter un état,
revenir en arrière. Au dernier état, le rond ne bouge plus. Écouté par
l'accueil et par l'espace Calendrier ; ailleurs (les deux sites), l'appui ouvre
la tuile, comme avant.

**Dans la tuile, l'état est une PASTILLE**, à la suite de celles de la nature
et de l'espace, et elle ouvre un menu déroulant dessiné (`reglageStatut`,
js/calendrier-commun.js). La forme a bougé trois fois le 25 août avant de se
poser là : trois boutons alignés, puis un menu déroulant à droite de la ligne
des gestes, puis cette pastille — c'est celle qui se lit avec les deux autres
mentions plutôt que de peser comme un contrôle.

**Sa couleur change de TEINTE, pas d'intensité** : rouge → ambre → vert
(`TEINTES_ETAPE`, interpolées si le cycle compte plus de trois pas — Yuno en a
cinq). Seule la teinte part du JS ; saturation et clarté sont réglées dans le
CSS, une fois par thème. Ce rouge et ce vert ne contredisent pas la règle
ci-dessus : ils ne jugent aucune échéance et ne bougent pas tout seuls, ils
disent une étape de fabrication que Noé a posée.

Conséquence assumée : **le calendrier du hub garde les publiées** —
`api.publicationsDatees()` ne les écarte plus. Sans ça, le troisième état
n'aurait été ni lisible ni réversible depuis la tuile, et une publication
partie aurait disparu du planning là où une tâche faite y reste barrée. Les
deux sites, eux, continuent de ranger les publiées sous leur pli.

*Une seule exception, posée le 25 août 2026 :* la **corbeille** de la fenêtre
de détail est rouge (`--erreur`), à la demande de Noé. Elle ne dit pas un
retard ni un jugement — elle dit ce que fait le bouton : il efface, et ça ne
se défait pas. Aucune date, aucun compteur, aucune ligne de liste ne prend
cette couleur.

**Le champ de la tuile de capture n'a AUCUNE décoration de focus** (demande de
Noé, 25 août 2026, en deux temps : d'abord la couleur du trait, puis le trait
lui-même). C'est la seule entorse du hub à « le focus clavier jamais
supprimé », et elle est bornée à ce champ : la tuile n'existe que pour lui,
elle s'ouvre avec le curseur dedans et le clavier levé, et le curseur qui
clignote dit où l'on écrit. Les pastilles de la tuile gardent le leur — on y
arrive au clavier, et rien d'autre ne dirait laquelle a la main. Ne pas
« réparer » : la raison est écrite au-dessus de la règle dans `css/styles.css`,
et `outline: none` y est nécessaire, sinon `input:focus-visible` redessine le
cadre que cette règle retire.

---

## 6. Les pièges rencontrés, pour ne pas les revivre

**UN GESTE TACTILE NE SE VÉRIFIE PAS EN DISPATCHANT DES PointerEvent** (29 août
au soir). Onze cas « au vert » et le balayage ne marchait pas sur le téléphone de
Noé : mes essais simulaient les événements, donc le navigateur n'y participait
pas — or c'est lui qui décide de tout. Sans `touch-action: pan-y`, il annule le
pointeur dès qu'il croit à un défilement, et `pointerup` n'arrive jamais. **Le
seul juge d'un geste tactile est un doigt sur un vrai écran.**

**Un élément `position: sticky` est borné par son PARENT.** La barre d'onglets
était collante depuis toujours et ne collait pas : enfermée dans `.haut`, haut
d'une centaine de pixels, elle ne pouvait coller que sur cette hauteur. Mesuré :
à 600 px de défilement, elle se trouvait à −553.

**`requestAnimationFrame` ne s'exécute pas quand la page est masquée.** Un verrou
levé par rAF reste posé pour toujours si l'écran se verrouille au mauvais moment.
Pour lever un verrou, un `setTimeout`.

**`ON CONFLICT` ne peut pas s'appuyer sur un index PARTIEL** sans en reprendre le
prédicat (Postgres répond 42P10). Et il n'y a le plus souvent rien à protéger :
dans un index unique, NULL n'entre jamais en conflit avec NULL.

**Une assertion qui échoue en fin de script d'édition annule TOUT ce que ce
script avait modifié avant.** Deux fois dans la même session : un champ caché
disparu sans que je m'en aperçoive, et quatre remplacements perdus d'un coup.
Après une édition en lot, relire ce qu'on croit avoir écrit.

**Les accents graves dans un commentaire HTML d'un gabarit, encore** — deux fois
en deux jours. `node --check` ne les voit pas ; `node tools/verifier-gabarits.js`
les pointe à la ligne, et `node --input-type=module --check` aussi.

**Les listes blanches d'`api.js` jettent les colonnes nouvelles en silence.**
Deuxième morsure le 21 août : `creerEvenement` insère des colonnes NOMMÉES, et
`reunion_objet` offert à l'écran arrivait `null` en base — le piège exact de
l'heure et de la priorité des tâches, déjà documenté. Toute colonne ajoutée à
une table doit être ajoutée À LA MAIN dans le `creer…`/`modifier…` d'api.js
concerné ; le test de bout en bout (écrire puis RELIRE la base) est le seul
filet qui l'attrape.

**`brancherChoix` et `brancherCapture` ne cohabitent jamais** dans un même
espace : le second branche AUSSI les menus déroulants des formulaires. Les
deux ensemble traitent chaque clic deux fois — et un panneau basculé deux fois
reste fermé (les menus du FCH, 21 août). La règle : un espace avec tuile de
capture appelle `brancherCapture` seul ; sans tuile, `brancherChoix` seul.

**`document.querySelector` attrape aussi les sections MASQUÉES du hub.** Les
espaces montés restent dans le DOM ; « le premier `.ouvrir-capture` du
document » peut être celui d'un autre espace, invisible. Dans les tests
navigateur comme dans le code : viser depuis la section de l'espace, jamais
depuis `document`.

**Un accent grave nu dans un commentaire de gabarit ferme la chaîne.** QUATRE
fois entre le 13 et le 15 août — c'est le piège le plus coûteux du dépôt. Le
fichier reste du JavaScript valide (`node --check` passe), et le module casse
au **chargement** : l'écran garde la page précédente, ou les trois écrans de
l'application s'affichent ensemble. Symptôme énorme, cause d'un caractère.
**`node tools/verifier-gabarits.js` le voit maintenant** — le lancer avant de
pousser du HTML dans un gabarit.

**Une graisse absente ne se signale jamais** : le navigateur retombe sur la
plus proche, en silence. Vérifier en MESURANT la largeur d'une même chaîne dans
les deux graisses — deux valeurs identiques veulent dire que le fichier
n'existe pas. (Vaut aussi pour les italiques, piège rencontré en juin.)

**Deux attributs `class` sur un même élément : le second est ignoré.** Les
couleurs de statut du CRM se sont éteintes comme ça en passant du `<select>` à
la liste — aucune erreur, juste une couleur qui disparaît. Fusionner les
classes dans l'attribut qu'on écrit, jamais en ajouter un second.

**Une variable CSS peut exister sans que rien ne l'allume.** La palette des
piliers était complète depuis le 12 août ; les pastilles restaient grises parce
que le HTML n'écrivait pas `data-pilier`. Un système de couleurs a un
interrupteur — vérifier qu'on l'appuie.

**`gap` vaut pour les DEUX axes.** Un `gap: 0` posé pour coller des filets
verticalement a supprimé l'espace entre les colonnes quand la liste est passée
en trois colonnes sur grand écran. Utiliser `row-gap` quand on ne parle que du
vertical.

**`flex-wrap: wrap` hérité fait descendre ce qu'on croyait à côté.** Une croix
posée à côté d'une ligne se retrouvait dessous : 83 px de haut au lieu de 44.

**Un rendu optimiste masque l'erreur qui le suit.** Un import manquant faisait
lever `rendre()` **après** que l'état ait été posé et **avant** l'appel réseau :
l'écran semblait ignorer le geste, la base restait intacte, et rien n'apparaissait
sur le moment. Trouvé en relisant la base après le geste, pas en relisant le code.

**Mes propres tests produisent des faux positifs.** Une fenêtre restée ouverte
d'un essai précédent faisait croire qu'une croix ouvrait une fiche ; un nœud
détaché par `rendre()` donnait une hauteur de 0. Repartir d'un état propre avant
de conclure — et se méfier d'une mesure qui contredit ce que le code dit.

**Un tirage se vérifie par sa DISTRIBUTION, pas en le regardant une fois.** La
graine du mur de photos donnait des jours voisins très corrélés : sur quinze
jours et cinq idées, deux ne sortaient jamais. À l'œil, « ça change bien d'un
jour à l'autre » était vrai et masquait tout. Compté sur 100 tirages, corrigé
par un brassage à vide du générateur.

**Une substitution automatique qui ne trouve pas son motif ne dit rien.** Le
script qui a posé l'appel à `brancherChoix` dans `hermitage.js` a réussi ; celui
qui devait poser son import a échoué en silence, et l'espace FCH s'est monté
vide. Toute substitution doit LEVER quand son motif est absent — et ce qui a
attrapé la panne, ce n'est pas `node --check`, c'est le parcours en navigateur.

**Un `<select>` sans valeur préselectionne sa première option.** Des formulaires
comptaient dessus sans le dire : en les remplaçant par des pastilles qui ne
préselectionnaient rien, « Noter une idée » repartait avec un réseau vide, et la
base refusait la ligne. Remplacer un contrôle natif, c'est hériter de ses
défauts implicites.

**JavaScript énumère les clés numériques avant les autres**, quel que soit
l'ordre d'écriture : `{ '': 'Sans pilier', 1: … }` ressort « 1, 2, 3, 4, Sans
pilier ». Invisible dans un menu déroulant, voyant dès que les options
s'alignent.

**`setPointerCapture` et `releasePointerCapture` lèvent** quand le pointeur
n'est plus valide. La seconde était la première ligne du relâchement d'un
glissement : quand elle levait, le report ne se faisait pas, sans un mot.

**Un élément de grille s'étire à la hauteur de sa ligne.** Une tâche du jeudi
placée dans le même couloir qu'un match de deux heures du vendredi prenait sa
hauteur — deux choses sans rapport, rendues jumelles par la mise en page.
`align-self: start` coupe le lien, mais il faut ALORS empiler chaque jour à
part, sinon la tâche garde sa taille et laisse un trou.

**Le serveur local peut servir des fichiers périmés.** Celui du port 4173
appartenait à une autre session de travail : trois essais ont conclu « le
glissement ne marche pas » alors que la page n'avait jamais reçu le code. Un
`curl` sur le fichier servi le dit en une seconde.

**L'ordre dans la feuille de style décide, trois fois dans la même journée.** À
spécificité égale, c'est la dernière règle écrite qui gagne — et trois bugs de
la session n'avaient pas d'autre cause : `.capture-fond` déclarée avant
`.fenetre-fond` ne s'appliquait pas ; le `@media` qui centre la tuile sur grand
écran, placé avant `.capture`, non plus ; et deux déclarations orphelines dans
un `@media` (`overflow-x` sans sélecteur) ne s'appliquaient à rien du tout,
faisant défiler la page entière au lieu de la barre d'onglets. **Quand une règle
« devrait » marcher et ne marche pas, regarder où elle est écrite avant de
douter de ce qu'elle dit.**

**Un accent grave dans un commentaire HTML, à l'intérieur d'un gabarit JS,
ferme la chaîne.** `pas un \`<li>\` qui écoute` devient `"…" < li > "…"` — une
comparaison. C'est du JavaScript **valide** : `node --check` passe, et l'erreur
ne tombe qu'à l'exécution (`li is not defined`), en cassant tout l'écran.
Rencontré deux fois. **La vérification syntaxique ne remplace pas un chargement
dans le navigateur.**

**Un élément dont la transformation est animée devient le repère de ses
descendants en `position: fixed`.** Dans Yuno, `.vue-entre` porte
`animation: … both` sur `transform` : le `fill-mode` faisait durer l'effet
indéfiniment, et TOUTES les fenêtres volantes du site étaient mal placées — une
tuile censée être centrée à 391 px se calait à 496, et le fond assombri ne
couvrait que la section. La classe est retirée à `animationend`.

**Sur iPhone, ouvrir le clavier fait défiler le document**, même quand le champ
vit dans un élément fixe déjà visible : Safari ne regarde pas où il est
réellement affiché. `overflow: hidden` sur le corps **ne suffit pas** — il faut
sortir le document du flux (`position: fixed` + décalage compensatoire).

**Redessiner un formulaire referme le clavier**, ce qui change la hauteur
visible, ce qui replace tout ce qui en dépend. C'est ce qui faisait sauter la
tuile à chaque pastille touchée. Deux règles en découlent : les panneaux
restent dans le DOM et se bornent à basculer un `hidden`, et un bouton qui ne
doit pas voler le focus annule son `pointerdown`.

**GitHub Pages.** Un déploiement relancé à la main pendant qu'un autre était en

**GitHub Pages.** Un déploiement relancé à la main pendant qu'un autre était en
file a bloqué toute la chaîne une nuit entière : le run fantôme gardait le
verrou, et chaque déploiement suivant s'annulait (« Deployment cancelled »).
**Ne pas relancer un run Pages à la main.** En cas de blocage, un build peut
être demandé hors workflow :
`gh api -X POST repos/noedelahaye-sketch/hub/pages/builds`.

**Les identifiants de section.** Les `<section>` des espaces portent des `id`
préfixés (`espace-photo`) parce que `#photo` dans la barre d'adresse faisait
défiler le navigateur jusqu'à l'élément homonyme, écrasant la position
restaurée par le routeur. Ne pas « simplifier » ces id.

---

## 7. Où regarder dans le code

| Fichier | Rôle |
|---|---|
| `js/app.js` | Routeur, session, coquille commune des trois entrées, **fond figé sous une tuile** |
| `js/taches.js` | L'espace Tâches : la liste, la tuile de capture, la ligne de tâche empruntée par le dashboard |
| `js/dashboard.js` | L'accueil : humeur, les tâches du jour (cochables, ouvrables), la semaine du calendrier (déplaçable), les objectifs. Victoires masquées |
| `js/cache-session.js` | Le dernier état d'un espace, gardé le temps de l'onglet (§ 2 ter) |
| `js/mouvements.js` | Ce qui vient d'apparaître dans une liste, et rien d'autre (§ 2 ter ter) |
| `js/ecriture.js` | L'écran d'abord, le réseau ensuite — les trois formes de geste, et leur retour en arrière |
| `sw.js` | La coquille en cache — HTML, CSS, JS, polices. **Jamais les données** : Supabase et GitHub lui échappent par un test d'origine (§ 2 ter ter) |
| `js/vendor/` | supabase-js figé, rapatrié par `tools/telecharger-supabase.py`. Aucun CDN |
| `tools/verifier-coquille.js` | La liste de `sw.js` contient-elle tout ce qui est référencé ? |
| `js/api.js` | **Tous** les appels Supabase, une fonction par usage |
| `js/gabarits.js` | Les gabarits partagés (fut la fabrique des pages d'espace) — dont `construireFormulaire`, la tuile volante des dix-sept formulaires |
| `js/objectifs.js` | **« Le cap »** : la galerie des objectifs, celle des projets, les périodes en pied. Tout ce qui se règle du cap passe par là |
| `js/orientation.js` | Le calcul de l'orientation — ni réseau, ni session, ni DOM. **`tensionDeLaPeriode` n'est plus affichée nulle part** (§ 0 ante ter, point 1), elle reste vraie |
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH — ce qui diffère passe en paramètre (cycle, checklist, piliers) |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date, les trois vues, le glissement et le clavier — **et la tuile « Poser au calendrier » avec `poserAuCalendrier` / `brancherCapture`, partagées par le hub, l'accueil et les deux sites** |
| `js/yuno.js` | Le site Yuno : le Carnet de terrain, le réseau, la Passerelle, le rendez-vous stats |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
