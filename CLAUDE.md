# Hub — Tableau de bord multi-espaces de Noé

> **À lire en premier : [docs/etat-des-lieux.md](docs/etat-des-lieux.md).**
> Ce fichier-ci dit ce que le hub *doit être* ; l'état des lieux dit où il en
> est, ce qui a été vérifié, ce qui ne l'a pas été, et ce qui attend une
> réponse de Noé. Le mettre à jour en fin de session.
>
> Les sites ont leur propre cahier des charges :
> [docs/yuno-spec.md](docs/yuno-spec.md) et [docs/fch-spec.md](docs/fch-spec.md).
> L'authentification est décrite dans [supabase/AUTH.md](supabase/AUTH.md).
>
> **La façon dont le hub oriente Noé** — ce qu'il propose, sur quoi il se fonde,
> quand il parle — est décrite dans
> [docs/orientation-spec.md](docs/orientation-spec.md).

## Contexte

Application web personnelle centralisant l'organisation de 3 espaces professionnels et une dimension personnelle, avec un tableau de bord global recentré sur Noé (pas sur les espaces). Utilisateur unique : Noé. Usage quotidien (check-in de 5 min le matin), sur ordinateur et mobile.

Les 3 espaces + l'espace perso :
- **formation** : validation d'un Bac+3 marketing/communication (Studi) en parallèle d'une alternance. 4 dossiers + 1 vidéo à rendre pour début décembre.
- **photo** : activité de photographe sportif, affichée « Yuno » dans l'interface (marque yuno_rph). La clé reste `photo` en base : c'est la valeur de la contrainte CHECK. Objectifs long terme : CAN 2027, source de revenus début 2027.
- **fch** : alternance au FC Hermitage (communication, partenariats) jusqu'à fin décembre. 4 objectifs de fin d'alternance.
- **perso** : la vie hors espaces — sport, sorties, temps pour soi. Ce n'est PAS un espace : aucune mécanique de productivité ne s'y applique (voir philosophie).

## Philosophie du produit (IMPORTANT — guide toutes les décisions d'UI)

Priorités de l'utilisateur, dans l'ordre :
1. **Voir ses progrès et rester motivé** — le dashboard est d'abord un miroir de ce qui a été accompli, pas une liste de ce qui reste.
2. **Garder la vision long terme** — les objectifs et leur "pourquoi" toujours visibles.
3. **Réduire la charge mentale** — maximum 3 tâches actives affichées par espace ; le reste vit en backlog, jamais imposé au regard.
4. **Savoir quoi faire maintenant** — présent mais discret, en fin de page.

Conséquences concrètes :
- Le haut du dashboard montre les victoires récentes et la progression des objectifs (barres, pourcentages), jamais un compteur de retard.
- Chaque objectif affiche son champ "pourquoi" au survol ou au clic.
- Ton neutre et encourageant. Jamais de rouge culpabilisant, pas de "en retard !" agressif — une échéance proche est signalée sobrement.
- Terminer une tâche ou atteindre un jalon crée automatiquement une entrée dans la table `victoires`.

### La dimension perso (règles spécifiques)

Le hub existe pour servir Noé, pas l'inverse. Pour éviter que le professionnel n'engloutisse tout :
- Le dashboard est SA page : il l'accueille par son prénom et s'ouvre sur lui (humeur, victoires), les espaces viennent ensuite.
- L'espace perso n'a NI jalons, NI barres de progression, NI backlog, NI notion de retard. Jamais.
- **Une TÂCHE peut être perso** (décision de Noé, 13 août 2026), et c'est la seule entorse. Elle se crée et se lit dans l'espace Tâches, au calendrier et dans « Aujourd'hui » — **pas dans `#perso`**, qui continue de n'afficher que des intentions, des rendez-vous et des victoires. Le principe tient : l'espace perso ne mesure rien ; une tâche perso est une chose à faire notée là où on note les choses à faire.
- Il contient uniquement : des événements (rendez-vous avec soi-même : séances de sport, sorties, temps photo plaisir), des victoires perso, et des intentions (objectifs sans mesure ni date, ex. « prendre soin de mon sommeil », simplement relues).
- Les victoires perso apparaissent dans le dashboard au même rang que les victoires pro : une belle séance de course compte autant qu'un post Instagram réussi.
- Suivi d'humeur : une question par jour sur le dashboard (« Comment tu te sens ? », échelle 1–5 en un clic, note facultative). Réponse en 3 secondes, jamais de relance culpabilisante si un jour est manqué.

## Architecture

- **Frontend** : site statique (HTML/CSS/JS vanilla, pas de framework), déployé sur GitHub Pages.
- **Coquille en cache** : `sw.js` (service worker) sert HTML, CSS, JS, polices et icônes depuis l'appareil, pour que l'ouverture ne dépende pas du réseau. **Il ne met jamais de données en cache** — Supabase et l'API GitHub lui échappent par un test d'origine. Conséquence assumée : après un déploiement, un appareil peut afficher une fois la version précédente.
- **Données** : Supabase (PostgreSQL), projet Supabase `noe-hub-project`.
- **Cas particulier formation** : le site de révision Bac+3 existant (https://noedelahaye-sketch.github.io/Bac-3/) reste indépendant. Il sauvegarde son avancée dans un gist GitHub. Le hub LIT ce gist en lecture seule pour afficher la progression des révisions dans l'espace formation. Ne jamais écrire dans ce gist.
  - **URL du gist** : https://gist.github.com/noedelahaye-sketch/9ffae04009423dd49fe42f39d6a75e75
    (id `9ffae04009423dd49fe42f39d6a75e75`, fichier `studi-suivi-sync.json`, description « Suivi Studi — synchronisation »).
  - **Le gist est public**, donc le hub le lit sans aucun token :
    `GET https://api.github.com/gists/9ffae04009423dd49fe42f39d6a75e75`, puis `JSON.parse` du champ `files["studi-suivi-sync.json"].content`. Prévoir le cas `truncated` (le site Bac-3 le gère en relisant `raw_url`). L'API GitHub anonyme est limitée à 60 requêtes/heure et par IP : largement suffisant pour un check-in matinal, mais ne pas interroger le gist en boucle.
  - Historique de ce choix (6 août 2026) : le gist d'origine était privé, illisible depuis un site statique public sans y exposer un token. GitHub ne sachant pas convertir un gist secret en public, un nouveau gist public a été créé avec le même contenu, le site Bac-3 rebasculé dessus via `localStorage`, et l'ancien supprimé. Les deux autres options envisagées — lecture via une Edge Function Supabase, ou écriture directe du site Bac-3 dans une table du hub — restent valables si le besoin change (voir ci-dessous).
  - **Attention si les notes personnelles entrent en jeu.** Les champs `notes`, `fiche` et `journal` sont vides aujourd'hui, mais ils sont prévus pour accueillir du texte écrit par Noé. Le gist étant public, tout ce qui y sera écrit deviendra visible de tous. Le jour où ces champs se remplissent, il faudra basculer sur l'une des deux autres options.
  - L'identifiant n'est écrit nulle part dans le code source de Bac-3 : `js/app.js` appelle `GET /gists` avec un token personnel et retient le premier gist contenant `studi-suivi-sync.json` (`findOrCreateGist`), puis garde l'id dans le `localStorage` du navigateur sous la clé `studi-sync-gist-id`. Conséquence : sur un appareil où Noé révise pour la première fois depuis la bascule, il n'y a rien à faire ; sur un appareil qui gardait l'ancien id en cache, il faut faire `localStorage.removeItem("studi-sync-gist-id")` pour que le site retrouve le bon gist.
  - Structure du JSON (23 clés) : `status` (état par question, ex. `"b1-Q1": "todo"`), `checks` (cases cochées par question), `box` / `due` / `fail` / `cardState` (répétition espacée des flashcards), `quiz` / `quizSeen`, `coursLu` et dérivés, `streak`, `deadline`, `notes` / `fiche` / `journal` (texte libre, vides à ce jour), et `_ts` (horodatage servant à arbitrer entre local et distant).

## Trois applications, un seul code

Trois pages d'entrée, donc trois applications installables sur l'écran
d'accueil du téléphone, chacune avec son icône, son nom et son ouverture
directe :

| Entrée | Application | Ouvre sur |
|---|---|---|
| `index.html` | Hub | le tableau de bord |
| `yuno.html` | Yuno | le site Yuno |
| `hermitage.html` | FCH | le site FC Hermitage |

C'est le manifeste et l'`apple-touch-icon` **de la page ajoutée** qui décident
de l'icône et du nom : d'où trois pages et trois manifestes, et non un seul.
Chaque page ne porte que ce qui la distingue (icône, manifeste, titre) plus
l'écran d'attente ; la coquille commune est bâtie par `js/app.js`, pour que
trois copies du même balisage ne finissent pas par diverger. L'attribut
`data-entree` du `<body>` dit à `app.js` quel espace ouvrir quand l'adresse
ne dit rien, et masque la porte « Quitter le site » — depuis sa propre
application, un site n'a pas de hub à quitter.

Les icônes se régénèrent depuis les logos : `python3 tools/generer-icones.py`.

Les écussons des clubs du vivier vivent dans `img/clubs/` et se rapatrient par
`python3 tools/telecharger-logos.py` — comme les polices, ils sont dans le
dépôt et jamais appelés à un CDN. L'outil réécrit `js/logos-clubs.js`, la table
qui relie le nom exact d'un club à son fichier.

## Structure du site

**Quatre espaces, six vues transverses, deux sites**, servis par un routeur à
deux niveaux (`#espace/vue/id`). La distinction compte : un **espace** est un
domaine de la vie de Noé et porte une couleur ; une **vue transverse** les
regarde tous et n'en porte aucune.

### LA NAVIGATION A DEUX RANGS (28 août 2026, règle posée par Noé)

**Le coût d'accès d'une page est proportionnel à l'intention qu'il faut pour la
vouloir.** C'est la règle qui commande toute la structure, et elle est de Noé :

> *« L'objectif n'est pas de réduire au maximum le nombre de pages, au
> contraire. Je veux continuer d'être riche en page, avec beaucoup de détails.
> Mais ces pages-là doivent être plus difficiles d'accès car elles sont le fruit
> d'une envie, d'un besoin ressenti, tandis que ce qui doit se voir tout de
> suite est le fruit de rien. »*

| Coût | Ce qu'on y met |
|---|---|
| **0 geste** | l'accueil — la journée, les pistes, la semaine, le cap gravé |
| **1 geste** | les onglets — `Accueil · Perso · ▦` |
| **2 gestes** | le menu — six grands titres |
| **3 gestes** | la flèche du menu — les sous-pages, en accès direct |

**Ce que ça débloque n'est pas une économie, c'est de la place** : l'accueil
portait tout parce qu'il n'y avait nulle part où poser le reste. Une page riche
n'est plus un problème dès qu'elle est au bon rang.

**Le menu ne perce PAS les deux sites** (décision de Noé) : *« si je clique sur
le hub ce n'est pas pour atteindre le site Yuno et tout ce qu'il contient »*.
Chaque espace n'offre que **sa porte**, jamais les écrans derrière — d'où
l'absence d'une entrée « son éditorial », qui vit sur les sites.

**Les rubriques** (`RUBRIQUES`, js/menu.js) — le mot mène à la page, la flèche
déplie ses sous-pages ; une rubrique sans sous-page n'a pas de flèche, car une
flèche qui ne s'ouvre sur rien est un mensonge de forme :

| **Général** | Objectifs · Projets · Tâches · Périodes · Le chemin |
| **FC Hermitage** | Ses objectifs · Ses projets · Ses tâches · Le site |
| **Formation** | Ses objectifs · Ses projets · Ses tâches |
| **Yuno** | Ses objectifs · Ses projets · Ses tâches · Le site |
| **Perso** | Les intentions · Les rendez-vous · L'humeur · Les victoires |
| **Le temps** | *(pas de sous-page)* |

**« Ses objectifs », « ses projets », « ses tâches » ne sont pas de nouveaux
écrans** : c'est la page transverse **avec son filtre porté par l'adresse**
(`#objectifs/projets/fch`, `#taches/photo`). Un seul écran à tenir, plusieurs
portes pour y entrer — cinq listes de tâches finiraient par ne plus dire la même
chose. **Perso n'a ni objectifs ni projets, et n'en aura pas** : l'espace perso
ne mesure rien, jamais.

Le menu **vole au-dessus d'un fond assombri**, avec `--rayon-tuile` : c'est la
grammaire de la tuile de capture, donc le même geste pour le refermer. Il tombe
**à gauche, sous son bouton**, et son bord haut se cale sur la hauteur RÉELLE de
la barre (`--sous-la-barre`, posée par `monterLeMenu`) — un nombre écrit en dur
vieillit au premier changement de taille d'onglet. La rubrique de l'espace où
l'on est **se déplie d'elle-même**.

### Les adresses

- `/` ou `#dashboard` — tableau de bord global (tous espaces)
- `#taches` — **toutes** les tâches, tous espaces : datées ou non, faites ou non. La seule page du hub qui ne cache rien — mais elle range. On y crée une tâche, on y change sa priorité (1 à 4) et son statut. Ailleurs le hub trie pour Noé ; ici on vient voir l'ensemble.
  - **« À faire » ne montre qu'UNE occurrence par série** (27 août 2026, demande de Noé) : la plus proche, retard compris. Les suivantes descendent dans **« Ce qui revient »**, repliées par série, avec leur rythme et leur nombre. Sans cette coupe, trois rubriques hebdomadaires noyaient les quatre choses qu'il y avait vraiment à faire — 44 lignes au lieu de 8. Rien n'est caché : tout se déplie.
- `#objectifs` — **« Général » : les trois étages du cap**, en une page ou en trois vues. C'est le seul endroit du hub où le cap se règle, et la page qui cache le plus. Elle tient en trois niveaux, jamais quatre :
  - **Elle s'appelle « Général »** (28 août 2026, mot choisi par Noé pour le grand titre du menu), `<h1>` et titre du navigateur compris. Elle disait « Le cap » dans son `<h1>`, « Objectifs » dans l'onglet et « Général » dans le menu : trois noms pour une page est un défaut, pas un choix. **« Le cap » reste le nom de l'ÉTAGE des objectifs**, qui a sa page à lui. L'adresse ne bouge pas — un favori se casse, pas un nom.
  - **Trois vues, plus un espace en troisième niveau** : `#objectifs/caps`, `/projets`, `/periodes`, chacune ne montrant qu'un étage avec son propre titre ; `#objectifs` seul les garde tous les trois avec leurs titres d'étage. Sans ce découpage, « Objectifs », « Projets » et « Périodes » auraient été **trois liens vers le même écran**, et trois liens identiques ne sont pas un menu. Changer de vue ne relit rien : les trois étages viennent du même chargement, seule change la part qu'on en montre.
  - **la galerie ne dit que ce qui se compare** — une tuile compacte par objectif : son espace, son titre, une rangée de marches (un segment par jalon, plein quand il est atteint), « 3 projets · 23 tâches » et son échéance. **Le titre porte seul le poids** (Clash Display 700) ; le nom de l'espace passe en encre discrète, et sa couleur se dit deux fois sans jamais reprendre l'œil : la pastille, et **le fond de la tuile teinté à 5 %** de la couleur de son espace (Noé a regardé 11 %, puis 7, puis choisi 5). À cette dose la teinte ne se nomme pas, elle se sent : deux tuiles voisines ne se ressemblent plus tout à fait, et rien n'a l'air coloré. Le texte garde son contraste (18:1 sur le titre, 6,6:1 sur le service). Ni pourcentage, ni barre continue : un cap se lit en marches franchies. Le tri suit **l'ordre des journées de Noé — FCH, formation, Yuno** (demande du 28 août 2026) ; à l'intérieur d'un espace, le plus proche d'abord, et ce qui n'a pas de date ferme la marche. Une seule liste (`ESPACES`, js/objectifs.js) porte cet ordre : elle range les tuiles, les choix du formulaire et les régimes d'une période. **Pas de filtre par espace** : il a existé une heure, entre le groupement de l'ancienne page et le tri — depuis que les caps arrivent groupés, il ne cachait rien qu'on ne voyait déjà, et six tuiles s'embrassent du regard.
  - **on n'ouvre pas une autre page** : la tuile pressée prend toute la largeur et se déplie sur place, comme un jour de « Ta semaine » s'ouvre en grand. Elle montre le pourquoi, la cible, la frise des jalons, les projets (qui se déplient à leur tour sur leurs tâches), les tâches rattachées au cap sans projet, et — pour « Rembourser mon matériel » seulement — les prestations et le matériel qui le mesurent.
  - **les séries se replient** : quinze « Visuels de la semaine » font UNE ligne, avec leur rythme, ce qu'il en reste et la prochaine date. Sans cette coupe, un projet récurrent redressait le mur que l'espace Tâches a appris à ne pas dresser.
  - **ajouter et modifier ouvrent la tuile volante**, avec tous les détails (`construireFormulaire`) ; la galerie ne garde que les gestes d'un doigt — cocher un jalon, terminer une tâche, ouvrir un cap. Ce qui est irréversible (supprimer, marquer atteint) demande confirmation **sur place**, dans le menu à trois points : pas de fenêtre pour ça, mais un objectif qui emporte ses jalons mérite le second appui.
  - **une SECONDE GALERIE sous la première : les projets** (28 août 2026, demande de Noé). Même forme, un étage plus bas — un projet se compare à un projet comme un cap se compare à un cap, et on y entre du même geste. Ce qu'elle montre et que le dépliage d'un cap ne montrait pas : **les projets qui ne servent aucun cap** (« Album du club », « Suivi de l'alternance ») — ils existaient et étaient invisibles, donc oubliés. Un projet posé ici n'a pas de cap et c'est légitime : de l'intendance, ça existe. **L'AVANCÉE SE LIT DANS LA FORME DE SA JAUGE** — des marches s'il a des étapes, une barre s'il n'a qu'une charge, un pointillé s'il n'a rien déclaré. Voir « L'avancée d'un projet » plus bas : ce n'est plus une proportion de tâches faites.
  - **les périodes ferment la page**, en deux lignes et en encre discrète, avec leur tuile d'ajout à côté d'elles. Voir « les périodes » plus bas.
  - **Elle n'a plus d'onglet** : elle est au second rang, dans le menu, sous « Général » et ses trois vues. Elle en a eu un (une boussole, du 27 au 28 août) — ce qui avait déjà renversé la décision du 26. La règle des deux rangs tranche : ouvrir le cap, c'est déjà avoir décidé quelque chose. La tuile « Le cap » du tableau de bord y mène toujours.
- `#calendrier` — tout ce qui porte une date, tous espaces confondus, filtres par nature (tâches, événements, publications, objectifs)
- `#chemin` — **« Le chemin » : le miroir de ce qui a été accompli** (28 août 2026). Les victoires groupées par mois, tous espaces, le perso au même rang que le pro. **La source est UNIQUE — la table `victoires`** : terminer une tâche, franchir un jalon, vivre une sortie y écrivent déjà, et recompter les tâches faites à côté donnerait deux chiffres pour un seul fait. **Rien ne s'y modifie** : la page ne fait que regarder en arrière, et sa forme le dit — aucun bouton, aucune coche. Elle existe parce que la philosophie n° 1 dit que le hub est *d'abord un miroir de ce qui a été accompli*, et que ce miroir avait quitté l'accueil le 13 août sans être remplacé.
- `#temps` — **« Le temps » : où partent les heures** (28 août 2026, demande de Noé). La semaine par espace (sur place · traitement · rythmes · ligne à ligne, contre l'attendu de la période), puis projet par projet l'annoncé contre le mesuré. **Il ne calcule rien lui-même** : tout vient de `js/orientation.js`, qui reste éprouvable hors écran. **Sa première ligne est la plus importante** — « 3 des 35 choses terminées portent une durée » : sans elle, un total bas se lirait comme une semaine légère alors qu'il ne dit que le silence des durées. **Sa raison d'être** : la fenêtre « combien de temps ça a pris ? » existe depuis le 27 août et rien n'a jamais rien fait de la réponse ; une question dont la réponse ne sert à rien finit par ne plus recevoir de réponse. **Aucun rouge, aucun seuil, aucun « trop »** : un écart entre l'annoncé et le mesuré est une information, pas une faute.
- `#formation` — espace formation (thème : teal)
- `#photo` — la page Yuno du hub (thème : doré) — tableau de bord réduit et porte vers le site
- `#yuno` — le SITE Yuno : l'habillage du hub disparaît entièrement, chrome et identité propres (voir docs/yuno-spec.md)
- `#fch` — la page FC Hermitage du hub (thème : bleu du club) — tableau de bord réduit et porte vers le site
- `#hermitage` — le SITE FC Hermitage : l'habillage du hub disparaît, chrome et identité propres, fond bleu du club (voir docs/fch-spec.md)
- `#perso` — espace perso (thème : doux, apaisé, distinct des trois autres). **Quatre vues** depuis le 28 août 2026 — `#perso/intentions`, `/rendez-vous`, `/humeur`, `/victoires` — offertes une à une par le menu : c'est la MÊME page dont on cache trois blocs sur quatre. Ni second écran, ni second chargement, et les écouteurs, posés sur la section, survivent.

**Les trois pages espace du hub sont des BILANS** (refonte du 26 août 2026), et
elles ont la même forme sans avoir le même contenu. **Elles n'ont plus d'onglet
depuis le 28 août au soir** : on y entre par le grand titre de leur espace dans
le menu, qui donne aussi leurs pages filtrées et la porte de leur site. Un bilan
répond à « où j'en suis » — c'est une question qu'on se pose, pas un réflexe.

- Le **site** est l'atelier — il répond à « qu'est-ce que je fais maintenant » ;
  la **page du hub** est le bilan — elle répond à « où j'en suis ». C'est la
  seule division qui justifie deux écrans.
- Chacune se lit en **deux colonnes de panneaux** sur grand écran : *Le cap*
  (tuile-bouton vers `#objectifs`) et *À faire* d'abord, la matière propre du
  espace et le bilan ensuite, **les raccourcis en pied de page** — des pastilles
  colorées qui ouvrent la tuile de capture du hub, jamais un formulaire déplié.
- **Aucune ne porte plus son titre ni son logo** : la barre de navigation le dit
  déjà. Le `<h1>` reste hors écran pour les lecteurs d'écran.
- Ce qui les distingue : Yuno ouvre sur une **bande de photos** (le tirage du
  jour du Carnet) et porte l'**argent** ; le FCH montre sa **chaîne éditoriale**
  à trois états et sa prochaine **réunion** ; la formation montre la
  **progression des révisions** lue dans le gist Bac-3.
- **`js/gabarits.js` n'est plus une fabrique** : elle n'avait plus que la
  formation, qui a sa propre page depuis. Il n'en reste que les gabarits que
  tout le monde emprunte — tuiles d'objectif, listes, fenêtres, formulaires.

L'espace perso affiche uniquement : ses intentions, ses prochains rendez-vous avec soi-même, ses victoires, et la courbe d'humeur des 30 derniers jours.

### Sa forme, refondue le 29 août 2026

**LE PRINCIPE, et il commande tout le reste** : perso emprunte la **grammaire**
des écrans récents — la galerie de tuiles comparables, le titre en Clash
Display, le menu discret à trois points, la tuile volante, l'écriture optimiste
— et refuse leur **mesure**. Pas de jauge, pas de marches, pas de pointillé, pas
de pastille d'état, pas de compte, pas de date d'échéance. **Une tuile
d'intention est une tuile de cap à qui l'on a retiré tout ce qui mesure.** La
page cesse ainsi d'être la seule du hub à parler une autre langue, sans rien
céder sur la règle qui la fonde.

**La page se lit en deux temps** : la galerie d'intentions prend **toute la
largeur** — elles sont le cap de perso, ce qu'on relit quand on ne sait plus
pourquoi on fait les choses —, puis deux colonnes : **ce qui vient** à gauche
(les rendez-vous), **ce qui est passé** à droite (l'humeur, les victoires).
C'est la seule division qui tienne ici : il n'y a rien à faire dans cet espace,
donc rien à ranger par urgence. Les quatre blocs empilés pleine largeur
laissaient les deux tiers de l'écran vides.

Ce que la refonte a corrigé, et qui n'était pas que de la forme :
- **une intention se MODIFIE.** Elle ne portait qu'une croix nue : on ne pouvait
  que la jeter et la réécrire. Le menu discret lui donne « Modifier », et la
  confirmation sur place au lieu d'une suppression au premier appui.
- **la FAMILLE d'un rendez-vous s'affiche** (corps · calme · lien · intendance).
  Le formulaire la demandait depuis le 27 août et la page ne la rendait jamais :
  une question dont on ne fait rien finit par ne plus recevoir de réponse. Elle
  ne compte toujours **rien** ici — les planchers qu'elle alimente restent
  internes.
- **l'humeur se répond SUR SA PAGE.** Il fallait passer par l'accueil pour
  ajouter un point à la courbe qu'on regardait. L'échelle est celle de
  l'accueil, au glyphe près : une question posée de deux façons selon l'écran
  deviendrait deux questions.
- **les victoires tiennent en une ligne**, avec leur date à droite comme partout
  ailleurs — elles occupaient trois hauteurs de texte pour un mot. Une porte
  s'ouvre vers **« Le chemin »**, qui n'existait pas quand ce bloc a été écrit.
- **l'écriture est optimiste** (`js/ecriture.js`) : la page attendait
  l'aller-retour Supabase en désactivant son bouton.

**Ce qui NE change pas, et ne changera pas** : ni jalon, ni barre de
progression, ni backlog, ni retard, ni tâche affichée. Une tâche perso continue
de vivre dans l'espace Tâches, au calendrier et dans « Aujourd'hui » — **jamais
ici**.

## Connexion Supabase

- Project URL : https://dpkyealzuabwchccdqcv.supabase.co
- Clé publique (anon) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwa3llYWx6dWFid2NoY2NkcWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjUwNzcsImV4cCI6MjEwMTU0MTA3N30.dJxWsuKZlvyc8uoCLhJVm80TfUg_BLX7IEdwe6VxMf4

Ces deux valeurs peuvent figurer dans le code public. Le token d'accès personnel et les clés secrètes ne doivent JAMAIS apparaître dans le repo (ni en clair, ni dans l'historique git).

## Schéma de base de données

**Onze tables décrites ici** (la base en compte davantage : les sites en ont ajouté, voir leurs cahiers des charges). Les six premières sont celles du hub ; les suivantes sont nées avec les sites. Les tables concernées portent une colonne `espace` de type text avec contrainte CHECK (espace IN ('formation', 'photo', 'fch', 'perso')), sauf `jalons` qui hérite de l'espace via son objectif, et `contacts` / `commandes` qui n'en ont pas.

Usage de la valeur 'perso' : autorisée dans `objectifs` (= intentions : champs cible et echeance laissés vides, aucune progression affichée), `evenements`, `victoires` et — depuis le 13 août 2026 — `taches`. Jamais dans `jalons` : un jalon mesure une progression, et l'espace perso n'en affiche aucune. Jamais dans `publications` non plus : l'espace perso ne publie pas.

### objectifs
- `id` uuid PK default gen_random_uuid()
- `espace` text NOT NULL (check ci-dessus)
- `titre` text NOT NULL — formulation mesurable (ex. "Atteindre 1k abonnés Instagram FCH")
- `pourquoi` text — le sens, relu les jours sans motivation
- `cible` text — la mesure de réussite
- `echeance` date
- `statut` text default 'actif' CHECK (statut IN ('actif', 'atteint', 'abandonne'))
- `date_atteint` date
- `created_at` timestamptz default now()

### jalons
- `id` uuid PK
- `objectif_id` uuid REFERENCES objectifs(id) ON DELETE CASCADE
- `titre` text NOT NULL
- `echeance` date
- `atteint` boolean default false
- `date_atteint` date
- `ordre` int — position dans la séquence du jalon
- `created_at` timestamptz default now()

La progression d'un objectif = jalons atteints / jalons totaux (calculée côté client, pas stockée).

### taches
- `id` uuid PK
- `espace` text NOT NULL
- `objectif_id` uuid REFERENCES objectifs(id) ON DELETE SET NULL (nullable)
- `jalon_id` uuid REFERENCES jalons(id) ON DELETE SET NULL (nullable)
- `titre` text NOT NULL — toujours une action concrète commençant par un verbe
- `statut` text default 'backlog' CHECK (statut IN ('backlog', 'actif', 'fait'))
- `echeance` date (nullable) · `heure` time (nullable — minuit n'existe pas : sans heure, la colonne est NULL)
- `duree` int (nullable) CHECK (5 à 1440) — **combien de temps la tâche prend, en minutes.** Elle se **tape à la main** (demande de Noé) ; les propositions ne sont qu'un raccourci.
  - **Une seule colonne pour le prévu et le réalisé** (décision de Noé, 27 août 2026) : « j'ajuste en fonction du temps réel que ça m'a pris si j'avais déjà noté un temps prévu ». Contrepartie assumée : sans trace de l'estimation d'origine, le hub ne saura jamais que Noé sous-estime — il calcule avec les chiffres qu'on lui donne.
  - **À la création**, elle ne vaut qu'avec une heure : elle réserve un créneau, et en vue semaine la barre prend sa hauteur. Sans heure, l'écriture l'écarte d'elle-même.
  - **Après coup**, elle vaut sans heure : « ça m'a pris 45 minutes » est vrai d'une tâche qui n'occupait aucun créneau. C'est la question posée **au moment où on coche**, dans la fenêtre de `demanderLaDuree` (js/gabarits.js) — la seule source d'heures du hub. Passer sans répondre ne l'efface pas : ne rien dire n'est pas effacer.
- `priorite` int NOT NULL default 4 CHECK (priorite BETWEEN 1 AND 4) — 1 le plus urgent, 4 le cas ordinaire
- `famille` text (nullable) CHECK (corps, calme, lien, intendance) — **espace perso seulement** : ce que ce moment sert. Elle se saisit à la **pastille « Famille »**, qui n'apparaît dans la tuile de capture — celle de l'espace Tâches comme celle du calendrier — que lorsque l'espace choisi est perso, juste derrière la pastille d'espace (la bande défile : une pastille en queue n'existe pas). Facultative, et elle le restera : une soirée notée en trois secondes ne s'arrête pas pour être classée. Écrite `null` dès que l'espace n'est plus perso. Les planchers qu'elle alimente sont **comptés en interne, jamais affichés** (voir `PLANCHER_PERSO`, js/orientation.js).
- `date_fait` timestamptz
- `serie_id` uuid REFERENCES series(id) ON DELETE SET NULL — **l'occurrence d'une série répétée** (27 août 2026). La règle (`recurrence`, `recurrence_fin`) vit dans `series`, plus sur la tâche : voir la table `series` plus bas.
- `evenement_id` uuid REFERENCES evenements(id) ON DELETE **CASCADE** — **l'événement qui a fait naître cette tâche** (29 août 2026). En cascade : une préparation ou un tri n'a aucun sens sans son événement, et les laisser orphelins ferait deux fantômes qu'on ne saurait plus rattacher.
- `origine` text (nullable) CHECK (preparation, tri) — **ce qui l'a fait naître automatiquement**, et `NULL` pour tout ce que Noé a écrit lui-même, qui est le cas ordinaire. Un index unique sur `(evenement_id, origine)` garantit qu'on ne la pose qu'une fois : c'est ce qui rend le rattrapage rejouable à chaque ouverture, comme celui des séries. La ligne s'en sert pour dire d'où elle vient — « Préparation », « Après l'événement » — sans quoi une tâche apparue toute seule ressemblerait à une erreur.
- `created_at` timestamptz default now()

**LES TROIS CHOSES QUE LE HUB POSE LUI-MÊME** (29 août 2026, demandes de Noé) — `poserCeQuUnEvenementFaitNaitre` (js/api.js), appelée par `js/app.js` avant le premier affichage, au même moment et pour la même raison que le rattrapage des séries :

| Ce qui naît | D'où ça vient | Quand | Forme |
|---|---|---|---|
| « Préparer *l'événement* » | une réunion du FCH ou une sortie de Yuno | **J−2** | tâche |
| « Trier les photos de *l'événement* » | `evenements.avec_photos` est coché | **J+1** | tâche |
| « Post *le match* » | `evenements.type_moment` vaut `match`, chez Yuno | **J+1** | **publication** |

**La fonction a changé de nom le jour où la troisième est arrivée** : elle ne pose plus seulement des tâches, et un nom qui ment sur ce qu'il fait est un défaut à part entière.

- **Le seuil de 48 h ne s'invente pas** : il existait déjà chez Yuno (`AVANT_MONTE_A`, js/yuno.js, 26 août) pour révéler la phase « Avant » d'une sortie. Il en sort et devient la règle du hub.
- **Le tri tombe à J+1 et non le soir même** : on ne trie pas en rentrant d'un match à 22 h.
- **Ce sont de VRAIES lignes**, pas des lignes d'affichage : elles se cochent, se reportent, se rattachent à un projet, portent une durée, apparaissent au calendrier et dans l'espace Tâches. Une fausse tâche incapable de ces gestes serait une exception à expliquer sur chaque écran.
- **JAMAIS pour le perso ni la formation.** L'espace perso ne mesure rien : un rendez-vous avec soi ne se prépare pas et ne se trie pas.
- **Cocher un tri pose `oeuvre_finie`** sur la sortie, chez Yuno seulement — la tâche est le GESTE, la colonne est l'ÉTAT, comme terminer une tâche écrit sa victoire. Sans ce lien, le Carnet de terrain et l'accueil suivraient la même chose chacun de son côté.
- **Une préparation non faite reste** après l'événement. Le hub ne supprime pas ce que Noé pourrait vouloir voir, et une préparation non faite dit quelque chose de vrai sur cette semaine-là. Il ne la répète simplement pas.

**LE POST DU MATCH est la seule des trois qui ne soit pas une tâche** (29 août 2026, demande de Noé : « après chaque évènement match yuno, il faut programmer un post sur le match à J+1 »). Ce n'est pas du travail à cocher, c'est une **parution** — elle vit au calendrier éditorial avec son réseau, son format et son cycle d'états. La règle ne bouge pas pour autant : la pastille « match » de la tuile de capture est une DÉCLARATION, exactement comme « photos » déclare le tri. Le hub ne devine pas qu'une sortie est un match — un concert et une séance n'appellent pas le même post.
- **Yuno seulement.** Le club a son propre calendrier éditorial, nourri par sa chaîne à trois états ; rien n'a demandé qu'un entraînement y fasse naître une parution.
- **Elle naît en `idee`**, sur Instagram et en carrousel : le hub programme la parution, il n'écrit pas à la place de Noé. Le carrousel parce qu'un match donne plusieurs images, et que c'est le format qui reste depuis le 15 août.
- **Après coup, comme le tri — pas d'avance comme la préparation.** Un post posé sur un match où Noé n'ira pas est une promesse fausse, et le hub a déjà tranché ce genre de question : `vecu` ne se pose jamais par le temps qui passe. **Conséquence assumée : la parution naît le jour même où elle est prévue.** Elle naît en « idée », donc rien ne part sans lui — mais si l'anticipation manque à l'usage, c'est cette décision-là qu'il faut rouvrir, pas la date.
- **Supprimer un match ne supprime pas son post** : `evenement_id` est en `ON DELETE SET NULL` là où celui des tâches est en CASCADE. Une préparation n'a aucun sens sans son événement ; une publication en a un — elle peut être partie, porter son lien, compter dans un bilan.

**Une tâche répétée se termine comme les autres** (27 août 2026, demande de Noé). Chaque occurrence est une ligne à elle : celle du jour se coche et écrit sa victoire, celle de la semaine prochaine attend son tour. On en supprime une sans toucher aux autres, on en modifie une sans changer la série.

> *Ce que cette règle a remplacé.* Jusqu'au 26 août, une tâche répétée était **une ligne unique** dont la coche faisait glisser l'échéance — faute de quoi « Courir » aurait été fait à jamais après une seule course. La règle était juste dans son modèle ; c'est le modèle qui ne l'était pas : rien ne gardait la trace de ce qui avait été fait, donc aucun rythme n'était mesurable.

Règle métier : maximum 3 tâches en statut 'actif' par espace. L'UI doit empêcher d'en activer une 4ème (proposer d'en terminer ou repasser une en backlog).

> **En sommeil depuis le 13 août 2026.** Noé a demandé de masquer le réglage backlog/active « pour le moment » : toute tâche naît `actif`, et le plafond de 3 n'est donc plus exercé. La règle et son code (`MAX_TACHES_ACTIVES`, `changerStatutTache`) restent en place — réafficher la pastille de statut suffit à tout rallumer. Voir `docs/etat-des-lieux.md`.

`statut` et `priorite` répondent à deux questions différentes et ne se remplacent pas : `statut` dit **où en est** la tâche, `priorite` dit **combien elle compte**. Une priorité 1 ne dispense pas de choisir ses 3 actives.

### evenements
- `id` uuid PK
- `espace` text NOT NULL
- `titre` text NOT NULL
- `date_debut` timestamptz NOT NULL
- `date_fin` timestamptz — la durée de l'événement, portée par sa fin. Ce que la tuile propose va de **1 h à 4 h, plus « Toute la journée » qui vaut 9 h** (demande de Noé, 26 août 2026 : rien de ce qu'on pose au calendrier ne dure trente minutes). À ne pas confondre avec un événement **sans heure**, qui tient le jour sans occuper de créneau — celui-là ne passe pas par les durées (`DUREES`, js/format.js). Depuis le 27 août, la durée d'un événement ne décide plus non plus de la hauteur de sa barre : toutes les barres du calendrier ont la même.
- `lieu` text
- `notes` text
- `type_moment` text (nullable) CHECK (match, concert, sortie, autre) — Yuno seulement : le type de la sortie (pastille à la création quand l'espace est photo).
- `vecu` boolean NOT NULL default false — **la face vécue** : cette sortie a eu lieu et elle est au Carnet de terrain. Posée par un geste (bilan d'une préparation, invite du carnet, capture d'une sortie) — **jamais** par le temps qui passe : un match où Noé n'est pas allé ne doit pas compter.
- `photo_chemin` text · `note` text · `oeuvre_finie` boolean NOT NULL default false — le reste de la face vécue.
- `famille` text (nullable) CHECK (corps, calme, lien, intendance) — espace perso seulement, même colonne et mêmes mots que sur `taches`. Elle se pose à la tuile de capture, au formulaire « Ajouter un rendez-vous » de `#perso`, et se corrige au formulaire de modification du calendrier.
- `reunion_objet` text (nullable) CHECK (ca, alternance, communication, partenariat, autre) — FCH seulement : non nul = cet événement est une réunion (21 août 2026). `reunion_animee` boolean NOT NULL default false — Noé anime ou participe. La préparation et le bilan vivent dans les tables `preparations`/`modeles_preparation` (voir docs/fch-spec.md).
- `avec_photos` boolean NOT NULL default false — **cet événement produit des photos à trier** (29 août 2026). Une DÉCLARATION, faite à la création par la pastille « Photos », exactement comme `reunion_objet` dit qu'un événement est une réunion : le hub ne peut pas le deviner, une réunion n'est pas une séance et une sortie n'est pas toujours un shooting. **Offerte au FCH et à Yuno**, décochée par défaut des deux côtés ; jamais au perso ni à la formation. Elle fait naître la tâche de tri à J+1.
- `refusee_le` date (nullable) · `sans_suite` boolean NOT NULL default false — **les deux refus du bandeau de l'après** (29 août 2026), et ils ne disent pas la même chose. `refusee_le` est le « pas maintenant » : il vaut pour la journée et le message revient demain — même nom et même mécanique que sur `taches` et `projets`, où c'est le « pas aujourd'hui » des pistes du matin. `sans_suite` est la croix : cet événement n'a besoin de rien, et on ne le redemandera jamais. Sans le second, une suite qu'on ne veut pas faire deviendrait un reproche permanent.
- `created_at` timestamptz default now()

**Un événement porte deux faces depuis le 14 août 2026** (fusion des moments et des événements) : ce qui est *prévu* (date, lieu, type, sa préparation) et ce qui a été *vécu* (les quatre colonnes ci-dessus, plus ses `rencontres`). La table `moments` a disparu — elle ne faisait que recopier son événement. Le vocabulaire, lui, ne bouge pas : l'interface dit toujours « Moments vécus » et « Carnet de terrain ». Voir docs/yuno-spec.md.

### victoires
- `id` uuid PK
- `espace` text NOT NULL
- `titre` text NOT NULL
- `date` date default current_date
- `source` text default 'manuel' CHECK (source IN ('tache', 'jalon', 'objectif', 'etape', 'moment', 'manuel'))
- `source_id` uuid (nullable — id de la tâche/du jalon/de l'objectif d'origine)
- `created_at` timestamptz default now()

Alimentation automatique : passer une tâche en 'fait', un jalon en atteint, **une étape de projet en franchie** (29 août 2026) ou un objectif en 'atteint' insère une victoire correspondante. L'utilisateur peut aussi en ajouter manuellement (ex. "Première accréditation obtenue").

### humeur
- `id` uuid PK
- `date` date UNIQUE default current_date
- `niveau` int NOT NULL CHECK (niveau BETWEEN 1 AND 5)
- `note` text (nullable — un mot ou une phrase, facultatif)
- `created_at` timestamptz default now()

Une seule entrée par jour (contrainte UNIQUE sur date). Si le jour est déjà renseigné, le clic met à jour la valeur.

### publications

Le calendrier éditorial. **Une idée est une publication sans date** (`date_prevue` NULL) : même table, deux vues.

- `id` uuid PK
- `espace` text NOT NULL default 'photo' CHECK (espace IN ('formation', 'photo', 'fch')) — pas de 'perso' : l'espace perso ne publie pas
- `titre` text NOT NULL — l'idée, en une phrase
- `reseau` text default 'instagram' CHECK (instagram, tiktok, linkedin, facebook, youtube)
- `format` text default 'post' CHECK (post, carrousel, reel, story) — **seuls `carrousel`, `reel` et `story` sont offerts depuis le 15 août 2026** : « post et carrousel, c'est la même chose » (Noé), et c'est carrousel qui reste. `post` demeure accepté par le CHECK — un CHECK s'élargit, il ne se resserre jamais — mais plus rien ne l'écrit.
- `statut` text default 'idee' CHECK (idee, brouillon, pret, publie) — **le cycle n'est pas le même d'un espace à l'autre**, et il vit dans `CYCLES_PUBLICATION` (js/calendrier-commun.js, avec les réseaux et les formats — la tuile du calendrier en a besoin). Yuno en pose cinq (`a_developper` en plus) ; le **FC Hermitage en a TROIS depuis le 25 août 2026** (demande de Noé) : **à préparer** (`idee`) · **à programmer** (`pret`) · **publié** (`publie`). Ce sont les mots qui changent, pas les valeurs : `nomDuStatut(espace, statut)` les traduit, le CHECK ne bouge pas, et `brouillon` sert toujours à Yuno. L'état se règle **depuis n'importe quel calendrier** — le hub, le site Yuno, celui du FC Hermitage, en vue mois comme en vue semaine (27 août 2026) : c'est le même geste partout, et il est branché **une seule fois**, par `brancherEtatPublication` (js/calendrier-commun.js). En **phase de capture**, et ce n'est pas un détail : le rond vit DANS la barre qui ouvre le détail, et en bulle c'est l'ordre des écouteurs qui déciderait — quatre espaces, quatre occasions de se tromper. Deux façons de régler l'état : le **rond de la barre avance d'un cran** à l'appui (comme le cercle d'une tâche se coche), et la **tuile porte une pastille d'état** — à la suite de celles de la nature et de l'espace, ouvrant un menu déroulant dessiné, pour sauter un état ou revenir en arrière. Sa couleur dit l'étape : **rouge → ambre → vert** (`--teinte`, interpolée sur le cycle ; le CSS règle saturation et clarté par thème). Ce rouge et ce vert ne sont pas des couleurs d'alerte : ils ne jugent aucune échéance et ne bougent pas tout seuls. Pas de case à cocher : elle aurait sauté « à programmer ».
- `date_prevue` date (nullable — NULL = banque d'idées)
- `serie_id` uuid REFERENCES series(id) ON DELETE SET NULL — **la parution d'une série répétée** (27 août 2026). La répétition n'a de sens qu'avec une date : sans jour, l'idée est dans la banque et il n'y a rien qui revienne.

**Une publication répétée se termine comme les autres** — c'est la règle de la tâche répétée, mot pour mot (27 août 2026). Chaque parution est une ligne à elle : celle de lundi part, celle du lundi suivant attend déjà sur son jour. `passageDePublication` (js/calendrier-commun.js) reste le seul endroit qui dit ce qu'un changement d'état écrit — quatre écrans font avancer une publication.

**Le bilan du FCH voit enfin passer les séries.** Avant, une publication récurrente ne restait jamais en 'publie' : elle avançait sa date et revenait au premier état de son cycle, donc le compteur « publications sorties » l'ignorait. Ce n'est plus le cas.
- `duree` int (nullable) CHECK (5 à 1440) — **combien de temps la publication a pris**, demandée au moment où elle part (27 août 2026). C'est la charge éditoriale du club : celle que le terrain n'explique pas, et sans laquelle le quota de 20 h ne compte que les entraînements.
- `evenement_id` uuid REFERENCES evenements(id) ON DELETE **SET NULL** · `origine` text (nullable) CHECK (match) — **le match qui a fait naître cette parution** (29 août 2026), et `NULL` pour tout ce que Noé a écrit lui-même, qui est le cas ordinaire. Un index unique sur `(evenement_id, origine)` rend le rattrapage rejouable à chaque ouverture. **Il est COMPLET et non partiel** : un index partiel semblait plus propre, mais `ON CONFLICT` ne peut pas s'y appuyer sans en reprendre le prédicat (Postgres répond 42P10), et il n'y avait rien à protéger — dans un index unique, NULL n'entre jamais en conflit avec NULL.
- `rubrique` text — la série récurrente, libre
- `notes` text · `lien_publie` text
- `created_at` timestamptz default now()

### semaines

La trace du **rendez-vous du dimanche**. Une ligne par semaine validée, identifiée par son **lundi** — sans elle, le rendez-vous reviendrait à chaque ouverture, et un rituel qui redemande ce qu'on vient de lui donner cesse très vite d'en être un.

- `debut` date PK (le lundi) · `validee_le` timestamptz · `notes` text

**Il ouvre le dimanche à 20 h et reste jusqu'à la fin du lundi**, ou jusqu'à ce qu'il soit validé (choix de Noé). Passé ce délai il se tait : le hub ne relance pas et ne compte pas les rendez-vous manqués. Il s'affiche en tête de l'accueil, **après l'humeur et avant « Aujourd'hui »** — c'est la raison pour laquelle Noé a ouvert le hub ce soir-là, mais sa page s'ouvre toujours sur lui.

**Aucun constat sans proposition, sans exception** (`js/rendez-vous.js`) : chaque ligne porte son geste, et accepter coûte **un** geste — une proposition ouvre la tuile de capture déjà remplie, ou mène à l'écran où le réglage se fait. Une ligne sans porte de sortie est un reproche déguisé.

### arbitrages

**La trace de ce que Noé a tranché** (27 août 2026). Le hub pose la question, Noé décide — mais sans trace il la reposerait le dimanche suivant, et une question qu'on repose après y avoir répondu n'est plus une question.

- `cle` text NOT NULL — ce qui identifie **la même** question d'une fois sur l'autre (`periode:<id>`)
- `question` text NOT NULL — **gardée avec la réponse** : relire « la formation porte novembre » six semaines plus tard ne vaut que si l'on se rappelle ce qui était en balance
- `portee_debut` / `portee_fin` date — une réponse a une **portée**, pas une durée de vie : passé l'intervalle où la question se posait, elle n'empêche plus rien. Une décision prise pour septembre n'engage pas décembre.
- `espace_retenu` / `espace_cede` text · `reponse` text NOT NULL (en toutes lettres, c'est ce qui se relit)

**Trancher n'efface pas le déséquilibre** : la charge reste affichée telle quelle (« 39,5 h pour 35 h »). Décider ne fait pas rentrer les heures — le hub cesse seulement de redemander. Et **« Revenir dessus »** rend la question posable : c'est la seule façon de changer d'avis sans que le hub fasse comme si de rien n'était.

### periodes

**L'arbitrage en amont** (27 août 2026). Une période dit ce qu'on attend d'un mois, espace par espace, et multiplie les quotas de base sur son intervalle.

- `id` uuid PK · `nom` text NOT NULL · `debut` date NOT NULL · `fin` date NOT NULL (CHECK fin ≥ debut)
- `regimes` jsonb — un régime par espace : `{"fch": "intense", "photo": "ralenti"}`. Trois valeurs seulement — `ralenti` (×0,6), `normal` (×1), `intense` (×1,3). **Un espace revenu au normal disparaît de l'objet** : une période qui ne dit rien d'un espace ne doit pas donner l'illusion d'en avoir décidé quelque chose.
- `notes` text · `created_at` timestamptz

**L'espace perso n'y figure pas, et c'est toute sa raison d'être** : son plancher ne se négocie jamais. Quand la semaine déborde, on rogne le club ou on décale un livrable — jamais lui.

**LE HUB NE PRÉVIENT PLUS D'UN DÉPASSEMENT** (28 août 2026, décision de Noé). Il posait la question au moment où l'on déclarait la période — « 41 h pour 35, qu'est-ce qui cède ? » — et proposait deux portes. Noé l'a retirée : *« ça ne me sert à rien, c'est LE BUT d'une période d'intensité, j'en fais plus que d'habitude »*. Un dépassement voulu n'est pas un déséquilibre à signaler, et un outil qui prévient de ce qu'on a décidé exprès finit par se faire ignorer. La question a disparu des **deux** endroits où elle se posait : `#objectifs` et le rendez-vous du dimanche — la laisser à l'un des deux, c'eût été la déplacer et non la retirer.

> *Ce que cette décision a remplacé, et pourquoi elle a tenu une journée.* La question était née le 27 août avec les périodes, sur un raisonnement juste — dire « ça ne tient pas » trois semaines avant vaut mieux qu'un dimanche soir. Une troisième porte, « C'est voulu », a été essayée le lendemain pour permettre d'assumer, puis retirée avec le reste : si la réponse est toujours « c'est voulu », la question ne valait pas d'être posée. Ne pas la remettre.

**Le calcul, lui, reste entier** — `tensionDeLaPeriode` (js/orientation.js), la table `arbitrages` et son API. C'est la règle du jeu de l'orientation, éprouvable hors écran, et le diagnostic de la semaine s'en sert. **Ce qui a disparu, c'est le reproche, pas la mesure.** Et la mesure a retrouvé un écran le 28 août au soir : **`#temps`** l'affiche — la charge visée d'une période y figure comme un « attendu », à côté de ce que la semaine pèse vraiment. Sans seuil, sans couleur, sans question. C'est exactement la nuance : on montre l'écart, on ne demande pas ce qui cède.

**Les périodes FERMENT `#objectifs`, en DEUX LIGNES et en encre discrète** : nom et intervalle, puis ce qu'elles attendent (« FC Hermitage intense · club 26 h · formation 15 h ») — ni carte, ni bordure, ni comparaison à une capacité. Une période *cadre* les caps, elle ne les vaut pas. Toute la ligne ouvre la tuile de modification ; le menu à trois points ne garde que la suppression, et « Déclarer une période » est une tuile pointillée posée **à côté** d'elles, jamais dessous. Elles ouvraient la page le matin du 28 août ; elles la ferment depuis le soir — comme « Le cap » du tableau de bord est passé sous la journée le 13 août, et pour la même raison : on relit ce qui cadre quand on lève la tête, pas en ouvrant l'application.

### projets

**L'étage entre le jalon et la tâche** (27 août 2026) — le *comment* on atteint un cap. Il existe parce qu'une tâche sur trente-six seulement était rattachée à un objectif : on demandait un lien impossible à faire.

- `id` uuid PK · `espace` text NOT NULL (même CHECK que partout)
- `nom` text NOT NULL
- `resultat` text — **à quoi on reconnaît qu'il est fini.** Sans ce champ, un projet ne se termine jamais et pourrit dans la liste.
- `charge_minutes` int — la charge **totale**, pour un projet qui finit.
- `charge_hebdo` int — la charge **par semaine**, pour un projet qui ne finit pas (une rubrique, un rythme). Une heure par quinzaine s'y écrit `30` : c'est une moyenne hebdomadaire, faite pour être additionnée.
- `echeance` date · `statut` text CHECK (idee, actif, annuel, en_pause, termine, abandonne) — **quatre états sont offerts** depuis le 28 août 2026 (demande de Noé) : **Pas commencé** (`idee`) · **En cours** (`actif`) · **À l'année** (`annuel`) · **Terminé** (`termine`). **« À l'année » est un SECOND ÉTAT D'EN COURS** : certains projets ne finissent pas — « Programmation de la semaine », « Anniversaires du mois » sont des rythmes, pas des chantiers, et la table le savait déjà (ils portent `charge_hebdo` et non `charge_minutes`) ; il leur manquait le mot. Chercher ce qui est en cours les prend donc tous les deux : **même rang au tri, même bleu**, seul le mot change — une couleur qui les séparerait en ferait deux familles. Leur barre d'avancée reste en pointillé : une barre qui se remplit promettrait une ligne d'arrivée qui n'existe pas. Les deux autres restent acceptés par le CHECK — un CHECK s'élargit, il ne se resserre jamais, comme le format `post` d'une publication — et se lisent encore si une ligne en porte un ; rien ne les écrit plus. C'est cet état qui **trie la galerie des projets**, après l'espace : ce qui est en cours, ce qui n'a pas commencé, ce qui est fini. Il **se lit et se change sur la tuile**, sans ouvrir la fenêtre de modification : un point de couleur et un mot en encre grise, **à côté du nom de l'espace** — les deux signes qui classent un projet se lisent d'un même regard, et le titre garde sa ligne pour lui seul. Presser ouvre le menu dessiné du hub. **Gris, bleu, vert** (demande de Noé) : pas le rouge → ambre → vert d'une publication, essayé d'abord et écarté — une publication traverse un cycle de fabrication où le rouge dit « rien n'est encore fait », tandis qu'un projet pas commencé n'est pas en défaut, il attend son tour. Le bleu est pris plus saturé que celui du club pour qu'on ne confonde pas, sur une tuile FCH, la pastille de l'espace et le point de l'état. La tête de la tuile vit HORS du bouton d'ouverture : un contrôle dans un bouton n'est ni valide ni cliquable. Un projet déclaré terminé a sa barre pleine même s'il reste des tâches — c'est l'état posé qui dit la vérité, pas le décompte.

**En minutes, et non en heures.** C'est l'unité de `taches.duree` et des événements ; deux unités dans une même somme finissent toujours par se croiser. La saisie, elle, se fait en heures — c'est ainsi qu'on pense un projet.

### projets_cibles

Un projet peut viser tout, rien, un jalon, un objectif ou plusieurs (décision de Noé) : d'où une table de liens plutôt qu'une colonne.

- `projet_id` uuid NOT NULL · `objectif_id` uuid (nullable) · `jalon_id` uuid (nullable), avec un CHECK exigeant au moins l'un des deux.

**Règle anti-double-comptage** : la progression d'un objectif reste *jalons atteints / jalons totaux*, inchangée. **Un projet ne calcule aucune progression** — il porte la charge et il oriente. Deux caps servis par un même projet ne le comptent donc pas deux fois.

`projet_id` est posé sur `taches`, `evenements` et `publications`, **toujours facultatif** : une tâche sans projet reste légitime, c'est de l'intendance, et bloquer la capture pour ça coûterait plus cher que le lien ne rapporte.

**Trois chemins pour rattacher** (27 août 2026) :
- la **pastille « Projet »** de la tuile de capture — celle de l'espace Tâches **et** celle du calendrier, donc aussi le « + » de l'accueil et les deux sites. Elle ne propose que les projets de l'espace choisi, et se redessine quand cet espace change ; un projet devenu incohérent s'efface.
- **rouvrir une tâche** dans l'espace Tâches : la tuile revient avec son projet.
- dans `#objectifs`, sous chaque projet, **« Rattacher une tâche »** liste les orphelines de son espace. C'est la seule façon raisonnable de rattraper des dizaines de tâches écrites avant qu'il existe un étage projet.

**La ligne d'une tâche écrit le projet qu'elle sert**, à la suite de son espace, en encre discrète : sans ça, on ne voit pas d'un coup d'œil ce qui est rattaché de ce qui ne l'est pas. Son absence est une information aussi.

Les projets se lisent et se créent dans `#objectifs` — c'est la page où l'on décide, et un projet est une décision. Chacun dit **ce qu'il porte** (« 8 tâches rattachées ») : sans ce compte, un projet reste une intention, on ne voit pas s'il a commencé.

### projets_etapes

**LE DÉCOUPAGE QU'ON DÉCLARE** (29 août 2026, décision de Noé). Mêmes colonnes
que `jalons`, volontairement : c'est le même motif un étage plus bas — un jalon
découpe un objectif, une étape découpe un projet.

- `id` uuid PK · `projet_id` uuid NOT NULL REFERENCES projets(id) ON DELETE CASCADE
- `titre` text NOT NULL · `ordre` int
- `atteint` boolean NOT NULL default false · `date_atteint` date · `created_at` timestamptz

**Pas d'échéance, à la différence d'un jalon** : une étape découpe le TRAVAIL,
pas le calendrier. Ce sont les tâches qui portent les dates.

**L'ORDRE SE CHANGE — ÉTAPES ET JALONS** (29 août 2026, demande de Noé) : un
découpage ne se pense pas dans le bon ordre du premier coup — on pose les
marches comme elles viennent, puis on les range. « Monter » et « Descendre »
vivent dans le menu discret de la ligne, et non dans un glisser-déposer : le geste se fait au doigt comme à la
souris, s'atteint au clavier sans rien réinventer, et réordonner trois étapes
est un geste rare, qu'on fait au moment où l'on pose le découpage.
- **Le menu RESTE OUVERT** après un déplacement : une étape qui doit remonter de
  trois rangs se déplace en trois appuis et non en neuf. Il est attaché à
  l'identifiant de l'étape et non à sa position, donc il suit celle qui bouge.
- **Les extrémités n'affichent pas l'entrée qui ne mène nulle part** — une
  commande grisée est un bouton qui ment.
- **`reordonnerEtapes` (js/api.js) RENUMÉROTE la liste entière** au lieu
  d'échanger deux valeurs. `ordre` naît de la longueur de la liste au moment où
  l'étape est posée : une étape supprimée au milieu laisse un trou, et deux
  étapes peuvent finir avec le même numéro — un échange de deux valeurs jumelles
  ne changerait alors rien du tout. Seules les lignes qui bougent vraiment sont
  écrites : deux requêtes dans le cas ordinaire, pas dix.
- **LES JALONS D'UN CAP ONT LE MÊME GESTE**, et il passe par la MÊME mécanique
  (`deplacerDans`, js/objectifs.js) : les deux étages portent la même colonne
  `ordre`, le même menu et la même écriture optimiste. Deux copies de ce code
  auraient fini par diverger, et c'est le genre d'écart qu'on ne voit qu'une
  fois qu'un des deux écrans s'est mis à mentir.

**Franchir une étape écrit une victoire** (`source = 'etape'`), et revenir dessus
la retire — comme un jalon. La laisser muette alors que le jalon parle aurait
fait une exception à expliquer.

### L'AVANCÉE D'UN PROJET : une cascade, jamais les tâches

**LA RÈGLE** (29 août 2026, décision de Noé) : *« l'avancée des projets ne doit
pas être complètement liée aux tâches, ce n'est pas ça qui dit que c'est fini ou
non car des tâches s'ajoutent petit à petit. »*

**Ce que ses données disaient ce jour-là, et qui a réglé la question** — le
défaut mentait dans les DEUX sens, pas seulement dans un :

| Projet | Ce qui s'affichait | Ce qui était vrai |
|---|---|---|
| Deuxième dossier | **100 %** (3 tâches sur 3) | actif, 25 h annoncées — il commençait à peine |
| Album du club | 7 % (1 sur 14) | il **reculait** à chaque tâche écrite |

Un dénominateur qui grandit à l'usage ne mesure rien — et il punissait le geste
même que le hub veut encourager : noter ce qu'on a à faire.

**Trois mesures dans un ordre, et le projet est mesuré par la première qu'il a
DÉCLARÉE** (`avanceeDuProjet`, js/orientation.js — la règle vit là pour rester
éprouvable hors écran ; les écrans ne font que la dessiner) :

| Rang | Mesure | Dessin | Ce qui la déclenche |
|---|---|---|---|
| 1 | **les étapes franchies** | des **marches** | il a des `projets_etapes` |
| 2 | **les minutes faites / la charge annoncée** | une **barre** | il a une `charge_minutes` |
| 3 | *rien* | un **pointillé** | il n'a rien déclaré |

Les deux premières ont le même mérite, et c'est tout l'objet de la cascade :
**leur dénominateur s'écrit UNE FOIS**, à la création. Ajouter dix tâches ne le
bouge plus.

- **Le dessin dit laquelle des trois on regarde**, sur les deux écrans qui la
  montrent — la galerie de `#objectifs` et le rail de l'accueil. Des étapes se
  *franchissent* (on les compte du regard) ; des heures se *remplissent*. Deux
  écrans qui mesureraient le même projet de deux façons finiraient par se
  contredire, et c'est l'accueil qu'on croirait.
- **L'état posé passe devant tout** : un projet déclaré `termine` a sa jauge
  pleine même s'il reste des étapes ou des heures. C'est la décision de Noé qui
  dit la vérité, pas le décompte.
- **Un projet « à l'année » ne se mesure pas**, même s'il porte des étapes : il
  n'a pas de ligne d'arrivée, et une jauge qui se remplit lui en promettrait une.
- **LE SILENCE DES DURÉES N'EST PAS UN ZÉRO.** Une charge annoncée dont aucune
  tâche faite ne porte de durée retombe sur le pointillé et dit « 25 h, aucune
  durée notée ». Afficher « 0 h sur 25 h » prétendrait que rien n'a été fait ;
  c'est la même précaution que la première ligne de `#temps`, et pour la même
  raison. *(Au 29 août : 1 tâche sur 47 portait une durée.)*
- **Ce qui reste des tâches** : elles RENSEIGNENT la charge par leurs durées, et
  elles disent le mouvement. Elles ne définissent plus rien.

**LE MOUVEMENT, à côté de l'avancée et jamais à sa place** (même décision).
L'avancée répond à « où j'en suis », le mouvement à « est-ce que ça bouge » — un
projet peut être à 2 étapes sur 5 depuis trois semaines. `mouvementDuProjet`
(js/orientation.js) le calcule sans rien demander de plus : « 3 faites cette
semaine », « Rien depuis 12 j ».

**La naissance n'est PAS du mouvement** : « Posé il y a 2 j » ne s'affiche que
dans le DÉTAIL d'un projet, jamais sur sa tuile (correction de Noé le 29 août —
six de ses dix projets l'affichaient, et une ligne identique partout ne dit plus
rien). La galerie ne montre que ce qui se compare ; un projet qui n'a rien vu se
terminer se tait sur sa tuile, son pointillé le dit déjà. **La règle vaut aussi
pour le rail de l'accueil**, où la trace est un chiffre nu : le « 2 j » d'un
projet qui n'a rien terminé n'était que son âge, et l'âge d'un projet ne dit
rien de ce qu'il faut en faire.

**Le nom de l'espace s'écrit pareil des deux côtés** — « FC Hermitage », pas
« FC HERMITAGE » (demande de Noé, 29 août 2026). C'est le nom d'un espace, pas
un libellé de rubrique. Deux réglages suivent la casse et ne sont pas
décoratifs : l'écartement de 0,14 em était un réglage de capitales et délite un
mot en bas-de-casse, et le corps remonte de 8 à 10 px — à 8 px les minuscules
n'ont plus que 5 px de hauteur d'x là où des capitales en gardaient 8. La
hiérarchie voulue tient, c'est la lisibilité qui est rattrapée.

**LES TÂCHES FAITES SE RELISENT** (29 août 2026, demande de Noé). Le détail d'un
projet n'en donnait que le compte — « 3 faites. » —, ce qui disait qu'il s'était
passé quelque chose sans jamais dire quoi, dans un hub dont la première règle est
d'être un miroir de ce qui a été accompli. **Le compte devient une porte** : il
pèse au repos ce que pesait le paragraphe, et se déplie sur la liste — un projet
de quinze tâches terminées ne doit pas repousser ce qui reste hors de l'écran.
- **Le plus récent d'abord**, à l'inverse de ce qui reste : ce qui reste se lit
  par ce qui arrive, ce qui est fait se relit par ce qu'on vient de finir.
- **Les séries s'y replient pareil**, avec leur mot à elles — « 12 fois faites »
  et non « 12 fois à venir », qui se serait lu sous un titre barré.
- **Les lignes sont les MÊMES** que celles d'en haut : leur cercle décoche, leur
  menu supprime. Rouvrir une tâche depuis là où on la relit est le geste
  attendu, et `ligneTache` le portait déjà.

**Déplié, l'état reste à côté du nom de l'espace** (demande de Noé, 29 août) :
ce sont les deux signes qui classent un projet, et ouvrir sa tuile ne doit pas
les séparer.

### series

La règle de répétition et son modèle. **Les occurrences sont de vraies lignes** dans `taches`, `evenements` et `publications`, reliées par `serie_id` (27 août 2026, demande de Noé).

- `id` uuid PK
- `nature` text NOT NULL CHECK (tache, evenement, publication)
- `espace` text NOT NULL (même CHECK que partout)
- `recurrence` text NOT NULL CHECK (hebdo, quinzaine, mensuel) · `recurrence_fin` date
- `depart` date NOT NULL — la première occurrence
- `genere_jusqu_au` date NOT NULL — **la pièce qui fait tenir l'ensemble** : on ne génère qu'APRÈS ce curseur, donc une occurrence supprimée ne repousse jamais. C'est la version simple des EXDATE d'iCalendar, et elle suffit ici.
- `modele` jsonb NOT NULL — les champs recopiés dans chaque occurrence. Le modifier change les occurrences **à venir**, jamais celles déjà posées, que Noé a pu changer une à une.
- `arretee` boolean NOT NULL default false — une série arrêtée garde ses occurrences passées et ne dit plus aucune répétition.

**L'horizon est de seize semaines** (`HORIZON_SERIE_JOURS`, js/api.js) : il couvre tout ce qui a une échéance ce trimestre, jusqu'au QCM du 8 décembre. Plus loin serait payé au mauvais endroit — l'espace Tâches ne cache rien, et un an devant il afficherait cinquante « Contacter les clubs » d'affilée. Les séries **rattrapent leur retard à l'ouverture** (`rafraichirLesSeries`, appelée par `js/app.js` avant le premier affichage) : la fenêtre se repousse donc toute seule, un jour à la fois.

**Ce que les écrans voient ne change pas** : les lignes portent toujours `recurrence` et `recurrence_fin`, que `verifier` recopie depuis la série au passage. C'est le stockage qui a changé, pas la forme — sans quoi il aurait fallu habiller trente lectures une par une.

### contacts

Carnet unique : le réseau de Yuno **et** les partenaires du FCH. Pas de colonne `espace` — le `type` et la `structure` disent l'usage.

- `id` uuid PK
- `nom` text NOT NULL
- `type` text default 'autre' CHECK (joueur, photographe, club, media, agence, marque, autre)
- `structure` text — le rattachement (FC Lorient, OM, La Provence…)
- `instagram` text · `email` text · `telephone` text — plusieurs valeurs possibles, séparées par une barre oblique
- `statut` text default 'pas_de_contact' CHECK (pas_de_contact, message_envoye, contact_etabli, bon_contact) — la progression de la relation, dans cet ordre
- `notes` text · `dernier_echange` date
- `created_at` timestamptz default now()

### commandes

- `id` uuid PK
- `titre` text NOT NULL · `client` text · `client_id` uuid (fiche du réseau)
- `statut` text default 'en_cours' CHECK (en_cours, livree)
- `montant` numeric(10,2) — ce que la prestation rapporte
- `frais` numeric(10,2) — ce que le déplacement a coûté (26 août 2026)
- `evenement_id` uuid — la sortie à laquelle elle se rattache
- `echeance` date · `lien_livrable` text · `notes` text
- `created_at` timestamptz default now()

Livrer une commande insère une victoire, comme une tâche terminée.

**C'est ici que vit l'argent de Yuno**, et nulle part ailleurs. Une prestation
se saisit depuis deux écrans — la fiche d'une sortie sur le site Yuno, le détail
de l'objectif dans `#objectifs` — mais elle n'existe qu'une fois : deux tables
en feraient deux comptes différents.

### materiel

- `id` uuid PK · `nom` text NOT NULL
- `prix` numeric(10,2) NOT NULL CHECK (prix >= 0) — en euros
- `date_achat` date · `notes` text · `created_at` timestamptz default now()

Pas de colonne `espace` : le matériel est celui de Yuno, comme `commandes` et
pour la même raison — une colonne qui n'aurait jamais qu'une valeur ne
documente rien.

**Elle donne sa cible à l'objectif « Rembourser mon matériel »** (26 août
2026) : cible = somme des prix **plus** somme des `frais` des prestations,
progression = somme des `montant`. Acheter un objectif relève donc la barre au
lieu de la remplir, et c'est voulu — l'objectif suit l'activité, il ne la
précède pas. Les frais s'ajoutent à la cible **au lieu de se retrancher des
revenus** (choix de Noé) : même arithmétique, meilleure lecture — ce qu'on a
gagné reste ce qu'on a gagné, c'est la dette qui grossit de l'essence.

## Sécurité (à faire dès la création des tables)

1. Activer Row Level Security sur **toutes** les tables — les 9 actuelles et celles à venir.
2. Mettre en place Supabase Auth par email/mot de passe, un seul compte (celui de Noé). Pas d'inscription publique : désactiver les signups après création du compte.
3. Politiques RLS : toutes les opérations (select/insert/update/delete) réservées au rôle `authenticated`.
4. Le site affiche un écran de connexion simple si la session est absente ; la session persiste entre les visites.

## L'accueil — refondu le 29 août 2026

**LA QUESTION À LAQUELLE IL RÉPOND**, dans les mots de Noé :

> « Avoir une vision directe sur ce que j'ai à faire sur l'ensemble de mes
> projets et espaces, **que j'ai noté** — mes tâches, publications, événements —
> **et les conséquences de ce que j'ai réalisé** : bilan d'un événement, sa
> préparation, et tout ce qui a provoqué de la même manière. »

Cette seconde moitié n'existait nulle part : le hub savait qu'un match avait eu
lieu la veille, qu'une réunion se tenait lundi, qu'une séance avait été
photographiée — et il n'en disait rien. Du travail réel, jamais écrit, donc
jamais vu.

### LA RÈGLE QUI RANGE TOUT ÇA (formulée par Noé)

> **Ce qu'il a DÉCLARÉ devient une VRAIE LIGNE. Ce que le hub DÉDUIT devient un MESSAGE.**

*La règle disait « une TÂCHE » jusqu'au post du match (29 août 2026) : ce qui naît d'une déclaration prend la forme de ce qu'il est — du travail à cocher devient une tâche, une parution devient une publication. Ce qui n'a pas bougé, c'est le partage : une déclaration donne une ligne qu'on manipule, une déduction donne une phrase à laquelle on répond.*

| Ce qui arrive | D'où ça vient | Forme | Quand |
|---|---|---|---|
| Préparer la réunion | l'événement est une réunion FCH ou une sortie Yuno | tâche | J−2 |
| Trier les photos | Noé a coché « photos » à la création | tâche | J+1 |
| Le carnet, le bilan | le hub le déduit | **message** | après |

Il coche « photos » : le tri est du travail attendu. Personne en revanche ne
déclare qu'un match mérite un carnet — c'est une question, et une question se
pose, elle ne se coche pas. **Un cercle se coche, une porte emmène** : deux
gestes ne doivent jamais porter le même signe.

### L'ordre de la page

1. **La ligne de tête** — une ligne, là où il y en avait trois (126 px → 47).
   La date est partie : « Ta semaine » la dit sept fois plus bas. La salutation
   devient **l'état du jour**, et le signal de la première ouverture n'est pas
   l'heure mais **l'humeur non notée** : le hub salue tant qu'on ne lui a pas
   répondu, puis il dit « Trois choses aujourd'hui », « Il t'en reste une »,
   « Tout est fait », « Rien de posé aujourd'hui ». Aucun réglage, aucune
   mémoire à tenir. L'humeur tient au bout de la même ligne — cinq frimousses,
   puis la seule choisie une fois répondu. Le champ « un mot ? » ne s'ouvre que
   si on le demande : c'est lui qui pesait.
2. **Le bandeau de l'après** — conditionnel, **un seul à la fois, le plus
   récent** : un bilan s'écrit à chaud (`js/hermitage.js` le dit depuis le
   21 août). Deux natures seulement — une sortie Yuno hors carnet, une réunion
   FCH sans bilan. Trois portes : y aller, « pas maintenant » (revient demain),
   la croix (jamais). **Jamais de ligne perso** : un rendez-vous avec soi ne
   doit ni bilan ni tri. Il remonte à **quinze jours** au plus — au-delà, un
   bilan qu'on n'a pas écrit ne s'écrira pas, et le redemander devient un
   reproche. Le rendez-vous du dimanche passe devant : deux bandeaux empilés
   seraient deux interruptions.
3. **Aujourd'hui, dans une TUILE** — **et toute la tuile mène à `#taches`**
   (29 août 2026, demande de Noé : « en gardant tous les autres boutons de la
   tuile »). C'est cette seconde moitié qui décide de la forme : **pas un lien
   qui enveloppe**, comme celui d'une tuile de projet — celle-ci porte une
   vingtaine de contrôles, et un `<button>` dans un `<a>` n'est ni valide ni
   cliquable. C'est un écouteur qui se retire dès que le clic a touché quelque
   chose qui fait déjà quelque chose, et **la liste de ces gestes est
   explicite** (les rôles natifs, plus `[data-avancer-pub]` — le rond d'une
   publication est le seul geste de la tuile qui ne soit pas un bouton) : un
   sélecteur deviné sur le curseur aurait marché ce soir-là et silencieusement
   avalé le geste suivant. **Le titre est un lien** vers la même adresse, sans
   en avoir l'air : un écouteur ne se tabule pas, et le clavier doit atteindre
   ce que la souris atteint. Une sélection de texte en cours ne navigue pas —
   copier un titre n'est pas cliquer dessus. Elle porte à faire · à publier ·
   rendez-vous · **ce que je te propose**, les quatre groupes ensemble. La tuile existe parce que
   « Aujourd'hui » et « À faire » portaient exactement le même habillage et que
   rien ne disait lequel contenait l'autre : **le titre de section** (Clash
   Display, casse normale) se distingue désormais du **libellé de groupe**
   (petites capitales), et le bord finit le travail. Le titre est DEHORS, comme
   celui des projets — il nomme la tuile, il ne vit pas dedans.
4. **Ta semaine** — la grille du calendrier, **jours passés estompés** (0,42) et
   **titres sur deux lignes** avec points de suspension. Rien n'est effacé : le
   hub ne compte pas les retards, mais il ne les cache pas non plus.
5. **Projets en cours**, en colonne de droite — voir plus bas.

**Les objectifs ont quitté l'accueil.** Ils ont leur page à deux gestes, et
l'accueil répond à « qu'est-ce que j'ai à faire », pas à « où je vais ». Ils
avaient déjà reculé deux fois — au bas de la page le 13 août, en lignes plutôt
qu'en colonnes le 28 : c'était le rang qui n'allait pas, pas la forme.

### Les gestes rapides

- **Cocher** une tâche, **avancer** une publication d'un cran, **répondre** à
  l'humeur, **écarter** une piste — inchangés.
- **Reporter, en un geste — `→|`.** Un appui pousse à demain. **Une seule
  signification** : pour une autre date, la ligne s'ouvre déjà d'un doigt sur
  son titre. Un appui long qui ferait autre chose serait invisible.
- **Le menu `⋯`** ne porte que ce qui n'est pas atteignable autrement depuis
  l'accueil : **la priorité** (quatre choix) et **supprimer**. Pas « rattacher à
  un projet » — ce serait un menu qui ouvre la tuile, or la tuile s'ouvre déjà
  en touchant le titre.
- **Reporter est une croix visible, supprimer est rangé dans le menu.** L'un est
  le geste du matin, l'autre est sans retour : ils ne peuvent pas se toucher.
  Supprimer est *disponible*, jamais *offert*.
- **Le « + » flottant reste**, et c'est le modèle à suivre — Noé l'a dit mieux
  que la spec : « ne prend que très peu de place, mais ultra accessible et
  utile ».

> *Une ligne de capture toujours ouverte a été essayée et retirée le même jour.*
> Elle posait une tâche du jour d'un mot. Noé : « ça ne me servira pas » — le
> « + » faisait déjà le travail, en plus complet. Ne pas la remettre.

### Les projets en cours — une tuile qu'on fait GLISSER

Colonne de droite, `scroll-snap` natif : une tuile se lit à la fois, les
voisines dépassent d'un **liseré de 12 px** (Noé a fait réduire le fondu deux
fois). Aucune flèche — écartées au profit du glissement.

**SA COLONNE PÈSE UN TIERS, PAS UN CINQUIÈME** (29 août 2026, demande de Noé :
« ces derniers prennent trop peu de place par rapport à la tuile Aujourd'hui »).
Mesuré avant : à 1100 px, 220 px contre 784 — 21 % de la grille, et 186 px de
contenu dans la tuile. Après : 286 contre 718, et 252 px de contenu.

**La largeur est devenue fluide, et c'est ce qui permet d'élargir sans casser.**
Les deux paliers d'avant sautaient de 220 à 300 d'un coup, donc le chiffre bas
devait tenir à 960 px — la pire largeur — et bridait tout le reste. Un `clamp`
laisse la colonne grandir avec l'écran (250 px à 960, 286 à 1100, 432 à 1440,
plafond à 460) : le plancher ne contraint plus le plafond.

**Ce qui l'a payé : les textes de la journée, d'un cran** — titres 0,9375 rem,
service 0,75 (Noé l'a autorisé dans la même phrase). La contrainte des 290 px
par colonne, sous lesquels un titre de tâche se coupe devant du vide, n'a pas
disparu : elle a été payée. La portée est **la tuile** (`.tuile-jour`), pas les
classes — `.tache-titre` sert aussi l'espace Tâches, le calendrier et les deux
sites, où rien ne demandait à rétrécir. Bénéfice de côté : « Ce que je te
propose » écrivait déjà à ce corps, et les quatre groupes de la journée se
lisent enfin pareil.

**TOUS LES PROJETS `actif`, ET EUX SEULS.** Deux règles, chacune avec sa raison :

- **« À l'année » sort**, alors que le hub le range dans « en cours » depuis le
  28 août. Ce n'est pas une contradiction : le rail classe par **dormance** —
  *depuis quand rien n'a bougé* — et la question n'a aucun sens pour un rythme
  qui revient tout seul chaque semaine.
- **Aucun filtre sur les tâches ouvertes.** Un projet vide est exactement celui
  qu'il faut voir : c'est un projet qui n'a pas commencé, et il n'y a que ce
  rail pour le dire. Il s'affiche avec « Aucune tâche posée ».

**Sa jauge suit LA MÊME CASCADE que la galerie de `#objectifs`** — étapes, puis
charge, puis pointillé (29 août 2026). Voir « L'avancée d'un projet ». La
proportion de tâches faites a disparu des deux écrans le même jour.

**L'ordre : dormance, puis ce qui attend le plus.** La *dernière trace* est la
plus récente entre la dernière tâche terminée et la NAISSANCE du projet — sans
quoi un projet créé la veille serait « jamais touché » et passerait devant. Le
calcul est mesuré : au 29 août les quatre projets vivants avaient tous été créés
le 27, et trier sur la seule dernière action n'aurait rien classé du tout. Et
**ça varie tout seul** : agir sur celui de devant le renvoie au fond — une
rotation par jour aurait tourné sans rien dire.

`projetsEnCours` et `suiteDuJour` vivent dans **js/orientation.js** : comme le
reste, elles ne touchent ni au réseau ni au DOM et se vérifient hors écran.

### Ce que la page ne fera pas

**Pas de compteur d'heures ici.** « Il te reste 4 h de créneaux libres » a été
tenté et écarté : c'est « Le temps », pas l'accueil — et sur cet écran-là, ça
deviendrait vite un reproche.

Check-in matinal : l'accueil doit se lire en moins de 5 minutes, sans scroll
excessif sur mobile.

## Le mot « projet » a changé de sens (27 août 2026)

Il désignait les quatre domaines. Ceux-ci s'appellent désormais des **espaces**,
et la colonne `projet` s'appelle `espace` dans les six tables qui la portaient.

**« Projet » nomme maintenant l'étage entre le jalon et la tâche** — le *comment*
on atteint un cap : l'album du club, l'équipe com avec Lina, le deuxième dossier.
C'est le maillon qui manquait, et son absence expliquait un fait mesuré : une
tâche sur trente-six seulement était rattachée à un objectif. On demandait un
lien impossible à faire — « trier les photos U15 » ne sert pas *directement*
« 1 000 abonnés », elle sert *l'album du club*, qui sert l'objectif.

La hiérarchie complète : **mission → objectif → jalon → projet → tâche**. La
mission attendra ; les quatre autres étages existent depuis le 27 août 2026.
Voir [docs/orientation-spec.md](docs/orientation-spec.md).

## Vocabulaire d'interface

Les mots font partie de la forme. Ils restent identiques d'un bout à l'autre du
site. (Principe repris du site Bac-3, où la table équivalente est respectée.)

| On dit | Jamais |
|---|---|
| Victoires | Accomplissements, Réalisations |
| Objectifs · Jalons | Goals, Milestones, OKR |
| Intentions (perso) | Objectifs perso, Habitudes |
| Ta semaine | Agenda, Planning |
| Aujourd'hui | À faire, Todo, Tâches du jour |
| Backlog | Plus tard, Icebox |
| Le réseau (les fiches de Yuno) | Le carnet, le carnet réseau, le CRM en texte courant |
| Espace (formation, Yuno, FCH, perso) | Projet — le mot a changé de sens |
| Projet (l'album du club, le deuxième dossier) | Chantier, lot, campagne |

Le mot **carnet** ne désigne qu'une chose : le **Carnet de terrain** de Yuno,
celui des moments. La base de contacts, elle, s'appelle **le réseau** (décision
de Noé, 13 août 2026 — le mot en désignait deux). L'adresse `#yuno/carnet` n'a
pas bougé : renommer une adresse casserait un favori, et elle ne se lit pas.

Un bouton dit ce qui va se passer. Phrases à l'infinitif ou à l'impératif.

**Écrans vides.** Un espace vide ouvre une porte, il ne s'excuse pas.
« Tes premières victoires s'afficheront ici. » Jamais « Aucune donnée ».

**Jamais dans l'interface** : « en retard », « retard », un compteur de jours
perdus, une couleur d'alerte sur une échéance. Voir la philosophie du produit.

## Forme : ce qui vient de Bac-3, et ce qui n'en vient pas

Le site de révision Bac-3 (`~/Documents/Bachelor Com et Market/Assistant Exam/`)
a son propre cahier des charges — `design-spec.md` et `brief-navigation.md`. Il
est plus mûr que le hub sur la forme, et sert de référence, **avec une réserve
importante**.

Repris : les trois polices auto-hébergées, l'échelle d'espacement en multiples
de 4 (`--espace-*`), un rayon par rôle (`--rayon-carte` / `--rayon-controle` /
`--rayon-pastille`, plus `--rayon-tuile` né dans le hub pour la capture, qui ne
se pose pas dans la page mais vole au-dessus), le retour tactile sur les
boutons, la cible tactile de
44 px minimum, le focus clavier jamais supprimé, `prefers-reduced-motion`
respecté, le routeur à niveaux avec mémoire de défilement et titre de page, le
manifeste PWA, `tools/static-server.js`.

**Les trois polices, trois rôles** (`fonts/`, 88 Ko, aucune requête externe) :

| Famille | Variable | Emploi |
|---|---|---|
| Clash Display | `--police-titre` | Titres (`h1`, `h2`), « Hub » dans l'en-tête. Graisses 600 et 700 **seulement** — il n'y a pas d'autre fichier. |
| Instrument Sans | `--police-texte` | Tout le corps de texte, les libellés de section, les boutons. |
| Geist Mono | `--police-chiffre` | Compteurs et pourcentages, via la classe `.chiffre`. Pas les dates en toutes lettres (« dans 4 jours » est une phrase, pas un code). |

**Le hub est SOMBRE, toujours** (décision de Noé, 27 août 2026). Il n'a plus de
thème clair : ni réglage à suivre, ni `prefers-color-scheme`, ni deux jeux de
valeurs à tenir d'accord — une seule palette, celle du soir, qui est l'heure où
le hub s'ouvre. Les deux sites l'étaient déjà par identité ; le hub les rejoint
par choix. Conséquence pour qui écrit du CSS : **plus une seule media query de
thème**, et l'encre posée sur un aplat d'accent est SOMBRE (`var(--fond)` ou
`var(--fond-carte)`), jamais blanche — l'accent est clair désormais.

**TROIS NIVEAUX DE SURFACE**, et ils ne se remplacent pas (29 août 2026) :

| Jeton | Valeur | Emploi |
|---|---|---|
| `--fond` | `#17191a` | la page |
| `--fond-doux` | `#191c1d` | **la tuile de la journée** — elle se soulève moins qu'une carte, juste assez pour se détacher, et ne se confond donc pas avec les tuiles de projets à trente centimètres d'elle |
| `--fond-carte` | `#212426` | les cartes, les tuiles de projet, le menu |

`--bordure-douce` (`#262a2b`) va avec `--fond-doux` et **ne s'en sépare pas** :
le filet ordinaire (`--bordure`, `#34383a`) est dessiné pour les cartes, qui
sont claires ; posé sur une surface presque aussi sombre que la page, il criait
plus que ce qu'il entourait.

> *Deux essais avant de trouver.* `#121415` mettait la tuile PLUS SOMBRE que la
> page : elle s'enfonçait, c'était trop. `#1c1f20` était trop clair. La borne à
> ne jamais franchir : **elle reste plus claire que la page.**

**LE FC HERMITAGE EST BLEU** (29 août 2026), `--couleur-espace` comme
`--couleur-espace-pleine`. Il l'était déjà par exception à trois endroits — le
calendrier et « Ta semaine » le 25 août, `#objectifs` le 27 — toujours pour la
même raison : posé en aplat, le rouge du club se lisait comme une alerte, or le
hub n'en a pas. À la quatrième demande, **l'exception est devenue la règle** et
les trois surcharges ont disparu.

Ce que ça coûte, et il faut le savoir : le rouge était la seule couleur de ce
nom dans la palette, un coup d'œil suffisait à reconnaître le club. En bleu, la
paire la plus proche devient **FCH (212°) et perso (256°)** — 44° d'écart, assez
pour se distinguer, moins franc qu'avant. `--club-fch-rouge` reste défini sans
aucun emploi : c'est la seconde couleur du club, et le jour où quelque chose la
redemandera, la valeur exacte sera là. *(Le site du club a la sienne,
`--club-rouge` dans css/fch.css — les deux n'ont jamais été le même jeton.)*

**LA BARRE DE NAVIGATION : trois onglets centrés, le menu à gauche** (28 août
2026). `Accueil · Perso · ▦` au milieu, les **trois barres horizontales** tout à
gauche — aucun mot pour elles. Perso est à la fois onglet et grand titre du
menu, et c'est voulu : on l'ouvre sans y avoir pensé, mais ses pages doivent
s'atteindre comme celles des autres espaces.

- **C'est une GRILLE À TROIS COLONNES**, `.barre-onglets`, pas un rang. La
  troisième est vide et fait exactement la largeur de la première : sans ce
  contrepoids, les onglets seraient centrés dans la place qui *reste*, donc
  décalés vers la droite de la largeur du bouton. Un centrage optique se paie en
  grille.
- **`.barre-onglets` et non `.barre`** : ce nom était pris par la barre de
  PROGRESSION de la formation, déclarée plus bas dans la feuille donc gagnante.
  La barre d'onglets héritait de `height: 6px` et d'un fond `--accent-doux`, et
  `.barre span` peignait les trois traits du menu en un seul bloc d'accent.
  Deux défauts pour une collision de nom.
- **Le bouton du menu vit HORS de la bande qui défile** — une chose en queue de
  bande n'existe pas, c'est la leçon de la pastille famille.
- **L'onglet actif porte QUATRE signes à la fois** : le fond plein et l'encre
  inversée, la taille (17 contre 14 px) et la graisse (700 contre 600). Ils
  glissent ensemble en 180 ms, et comme la rangée est centrée, les voisins
  s'écartent au lieu de sauter. Cela renverse la règle du 27 août — « même
  graisse pour tous, sinon la barre déborde » — qui était juste avec HUIT
  onglets. **C'est le nombre qui a changé, pas le raisonnement : recompter les
  onglets avant de la rétablir.**
- **Le texte descend de 0,12 em dans sa pastille**, par un `padding` haut
  asymétrique. Réglage optique et non erreur : `align-items: center` centre la
  LIGNE, or une ligne réserve sous elle la place des jambages — et aucun de ces
  mots n'en a. En em, pour que la correction grandisse avec l'onglet actif. Le
  palier large doit écrire `padding-inline` et non le raccourci, sinon le mot
  remonte **sur ordinateur seulement**.
- **ON PASSE D'UN ONGLET À L'AUTRE EN BALAYANT** (29 août 2026, demande de Noé :
  « essentiellement sur téléphone… **en plus** de la possibilité d'appuyer sur
  leur boutons »). Le geste s'ajoute, il ne remplace rien : un geste invisible
  ne s'apprend pas tout seul, et les onglets restent la façon dont on change de
  page. Vers la gauche on avance, comme on tourne une page ; **aux deux bouts il
  ne se passe rien** — boucler du calendrier à l'accueil ferait traverser deux
  écrans sans qu'on l'ait demandé.
  - **Le tactile seulement** (`pointerType === 'touch'`) : sur ordinateur, une
    souris qu'on traîne sur 60 px en sélectionnant du texte est un geste
    ordinaire, et le lire comme un changement de page ferait perdre la sélection
    ET la page.
  - **Les trois onglets, et eux seuls.** Depuis `#objectifs` ou `#taches`, un
    balayage ne fait rien : ces pages sont au second rang, on y entre par une
    décision, et en sortir par un geste involontaire annulerait cette décision.
    Les deux sites n'y sont pas non plus, et cela découle de la même liste.
  - **LA PAGE SUIT LE DOIGT** (29 août au soir, seconde demande : « le slide
    n'est pas fluide du tout »). La première version naviguait au relâchement et
    l'écran basculait d'un coup : rien ne suivait la main, donc rien ne disait
    que le geste avait pris. **C'est ça qu'on lit comme « pas fluide » — pas la
    durée de l'animation, l'absence de prise.** L'écran suit à 90 %, plafonné à
    26 % de la largeur, et **s'estompe à mesure qu'il s'éloigne** : ce qu'il
    libère est du vide (on ne montre pas l'écran voisin, qui n'est pas forcément
    monté), et un bord net contre ce vide se lit comme un trou.
  - **On achève le mouvement AVANT de naviguer**, puis l'écran suivant arrive du
    côté d'où le doigt l'a appelé (`espace-entre-gauche` / `-droite`, même
    distance que la sortie). Naviguer aussitôt ferait disparaître la page au
    milieu de son geste ; et le fondu vertical d'origine se contredisait avec
    lui — la page sortait par la droite et la suivante remontait par le bas. Un
    clic d'onglet, lui, garde ce fondu.
  - **AU BOUT DE LA SÉRIE, L'ÉCRAN RÉSISTE** : il suit d'un sixième et revient.
    C'est la seule façon de dire « il n'y a rien de ce côté » sans écrire un mot
    ni bloquer le doigt.
  - **Ce qui défile horizontalement ne garde le geste QUE S'IL PEUT ENCORE
    DÉFILER DE CE CÔTÉ-LÀ** (29 août, correction de Noé : « que je puisse slider
    depuis partout sur l'écran, actuellement ce n'est que aux extrémités »). La
    première version refusait le geste dès qu'un défileur se trouvait sous le
    doigt, quel que soit le sens : sur l'accueil, le rail des projets et la
    grille de la semaine occupent le milieu de l'écran, il ne restait que les
    marges — autant ne pas avoir le geste. **La règle juste est celle des
    carrousels imbriqués** : le rail garde le geste tant qu'il lui reste des
    tuiles de ce côté, et le rend à la page quand il est au bout. C'est ce que
    fait le doigt naturellement. **La décision se prend donc au PREMIER
    MOUVEMENT et non au poser du doigt** — avant, on ne connaît pas le sens.
    La détection regarde ce qu'un ancêtre FAIT (`scrollWidth`, `overflow-x`,
    `scrollLeft`) et non comment il s'appelle : le hub compte sept défileurs, et
    une liste de sélecteurs vieillirait au premier ajout. *(La bande d'onglets
    ne défile plus depuis qu'ils sont trois — balayer dessus change donc
    d'onglet, ce qui est cohérent.)*
  - **Une couche par-dessus garde le geste** : le menu ouvert, une tuile de
    capture. Le signal est `body.fond-fige`, que le hub pose déjà dans ces
    deux cas, plus `.ajout-volant[open]` pour les tuiles de formulaire, qui ne
    figent pas le fond. Sans cette garde, un balayage sur le menu ouvert faisait
    basculer l'écran DERRIÈRE lui.
  - **Un clic issu d'un GLISSEMENT n'est pas un appui**, et c'est la tuile
    « Aujourd'hui » qui l'a exigé : un doigt qui la traverse produit aussi le
    `click` que le navigateur émet après le geste — mesuré, le balayage menait à
    `#perso` et le clic écrasait aussitôt par `#taches`. Deux navigations pour
    un geste. La garde vit dans js/dashboard.js et vaut au-delà de ce cas : un
    scroll vertical amorcé sur la tuile produit le même clic parasite.
- **L'onglet du calendrier est carré par une largeur FIXE**, jamais par
  `aspect-ratio` : le ratio déduisait sa hauteur de sa largeur, donc du
  rembourrage des autres onglets — passé celui-ci à 24 px, l'icône a pris 66 px
  de côté et poussé toute la rangée. Son sélecteur est scopé à `.navigation`,
  donc au hub seul : `ongletCalendrier` sert aussi aux barres des deux sites.

> *Ce que cette barre a remplacé.* Du 27 au 28 août, elle portait **huit
> onglets — trois mots puis cinq signes**, dont les deux marques en POCHOIR
> (`fch-logo-pochoir.png`, `yuno-signature.png` en `mask`, l'encre venant de
> `currentColor`). La mécanique reste celle du site FCH pour son onglet
> d'accueil, et git garde le code ; dans le menu, chaque espace porte sa
> pastille ronde.

**Gilroy sert deux endroits, et ce sont les deux où l'on VISE plutôt qu'on ne
lit** (27 puis 28 août 2026) :

- **le titre d'une barre du calendrier**, en 700, dans les trois calendriers. La
  règle est posée sur `.cal-barre-titre` et non sur la barre : les signes
  (○ ◐ ◉ ▲ ↗) sont dans le même conteneur et Gilroy ne les dessine pas — ils
  retomberaient, glyphe par glyphe, sur une police choisie par le navigateur.
  L'heure reste en Geist Mono.
- **les onglets**, 600 au repos et 700 actif. C'est ce qu'Instrument Sans ne
  pouvait pas donner : déclarée de 400 à 600, demander 700 la faisait clamper, et
  l'écart plafonnait à 500/600 sans se voir.

Gilroy est déclarée dans `css/yuno.css` (chargée sur les trois pages) en 400,
500, 600, 700 et 900 ; les quatre premiers sont dans la coquille : aucun fichier
de plus.

**Non repris, volontairement : le ton.** Bac-3 est un outil de pression, et
c'est justifié — 44 livrables, une date de dépôt. Il a une couleur `--flag`
dédiée au retard, un « verdict » en tête d'accueil, et affiche « 3 livrables de
retard ». Le hub dit l'inverse : il montre ce qui est accompli. Reprendre sa
palette telle quelle importerait `--flag` et l'envie de s'en servir. Le hub n'a
pas de couleur d'alerte et n'en aura pas.

Ne pas ajouter de dépendance externe : les polices sont dans `fonts/` et
supabase-js dans `js/vendor/` (figé, rapatrié par
`tools/telecharger-supabase.py`), jamais appelés à un CDN. Depuis que la
coquille tient en cache, un fichier distant est aussi le seul morceau que
l'ouverture hors ligne ne peut pas garantir.

## Conventions de développement

- Code simple et lisible : HTML/CSS/JS vanilla, un fichier js/api.js pour tous les appels Supabase, un fichier par espace.
- **`min-width: 0` sur tout élément de grille ou de flex qui contient une chose
  qui ne s'enroule pas.** Un élément de grille garde `min-width: auto` : il
  refuse de descendre sous la largeur MINIMALE de son contenu, et déborde son
  parent au lieu de rétrécir. Le piège s'est produit **trois fois le 28 et le
  29 août** — la bande d'onglets, la colonne des projets, les deux colonnes de
  la journée — et il ne se voit jamais sur l'écran large où l'on travaille. Pour
  une piste de grille, la même chose s'écrit `minmax(0, 1fr)` et non `1fr`.
- **Avant de nommer une classe CSS, vérifier que le nom est libre.** `.barre`
  existait déjà (la progression de la formation) et la barre d'onglets l'a repris :
  déclarée plus bas, l'ancienne gagnait, et la nouvelle héritait de `height: 6px`
  — plus `.barre span` qui peignait les trois traits du menu en un seul bloc. Un
  `grep` de trois secondes contre une soirée de forme qu'on croit ratée.
- **Un point de rupture mesure la FENÊTRE, pas le conteneur.** Une règle écrite
  quand un bloc occupait toute la page devient fausse le jour où on le met dans
  une colonne. Le 29 août, les deux colonnes de la journée débordaient à 1000 px
  parce que la page passait à deux colonnes trop tôt : la bonne variable était
  la largeur de la colonne voisine, pas le moment où elle apparaît. **Régler
  l'étroitesse en supprimant le vis-à-vis, c'est supprimer ce qu'on voulait.**
- **Une pastille de capture affiche la VALEUR de sa source** : une case à cocher
  vaut « oui » qu'elle soit cochée ou non, et le libellé disait donc « oui » en
  permanence. Une pastille booléenne se fait avec un `champChoix` à deux
  options, comme « Réunion » (29 août 2026).
- **`node tools/essai-diagnostic.mjs <fixture.json> [date]`** fait tourner le diagnostic d'une semaine hors ligne, sur un instantané des données. C'est la seule façon d'éprouver l'orientation sans y croire sur parole : les chiffres qu'il sort doivent pouvoir se recalculer à la main.
- **`js/orientation.js` ne touche à rien** — ni réseau, ni session, ni DOM. Il ne fait que calculer à partir de données déjà chargées : quotas, régimes, tension d'une période, plancher perso. C'est là que vit la règle du jeu de l'orientation, et elle doit rester éprouvable hors écran — un diagnostic qu'on ne peut pas vérifier seul est un diagnostic qu'on croit sur parole. Tout y est en **minutes**, comme `taches.duree` et `projets.charge_minutes`.
- Un espace n'est **monté qu'une fois** : ses écouteurs sont posés sur la section, qui survit à `innerHTML`, et un second montage les doublerait. Pour se mettre à jour, un espace pose un **`rafraichir()`** — comme il pose `naviguer()` — que le routeur appelle quand on revient dessus. Il relit les données et redessine, il ne rebranche rien.
- Mobile-first : l'usage matinal se fera souvent sur téléphone.
- **Cocher est une intention, pas un fait acquis** (27 août 2026). Terminer une tâche ouvre une **fenêtre** — même mécanique que la tuile du « + » : fond assombri, et **rien n'est écrit tant qu'on n'a pas confirmé**. Elle demande « combien de temps ça a pris ? », reprend la durée déjà connue et la présélectionne, et offre **trois issues qui ne disent pas la même chose** : *Annuler* n'écrit rien (la tâche reste à faire), *Passer* la termine sans toucher à sa durée — on n'est jamais obligé d'en donner une —, la coche la termine avec la durée affichée. Une publication qui part passe par la même fenêtre : elle ne peut pas vouloir dire deux choses selon l'écran.
- **Ajouter du contenu ouvre une tuile volante** (27 août 2026) — un objectif, un projet, une période, un jalon, une intention, une idée : le fond s'assombrit, la tuile se centre, et on la referme par la croix, le fond ou Échap. Déplié sur place, un formulaire de six champs poussait la page vers le bas et faisait perdre de vue ce qu'on regardait. C'est `construireFormulaire` (js/gabarits.js) qui le fait, **pour les dix-sept formulaires à la fois** : le `<details>` reste — il porte l'état, donne au sommaire son rôle de bouton, et les écrans qui referment après enregistrement écrivaient déjà `.closest('.ajout').open = false`. Seuls les formulaires `ouvert: true` restent en place : ils vivent déjà dans une fenêtre, et une tuile par-dessus une fenêtre serait une fenêtre de trop.
- **Un geste répond tout de suite, et se voit.** Toucher un bouton l'éclaire brièvement (`.eclair`, posé par `app.js` sur `pointerdown`) ; cocher une tâche dessine sa coche et la laisse voir 600 ms avant que la ligne ne s'en aille. Un effet de ce genre se pose **une fois, pour tout le monde** — jamais écran par écran — et se coupe sous `prefers-reduced-motion`.
- **L'écran d'abord, le réseau ensuite.** Une action de Noé change l'affichage tout de suite ; l'écriture part derrière. Un geste qui attend l'aller-retour Supabase, ce sont 300 à 800 ms de figement sur téléphone. La contrepartie n'est pas facultative : si l'écriture échoue, l'état d'avant est remis ET une ligne le dit — sans ce retour en arrière, l'affichage optimiste est un mensonge. La mécanique vit dans `js/ecriture.js` (`modifierAussitot`, `retirerAussitot`, `ajouterAussitot`) : ne pas la recopier. **Les listes s'y modifient sur place**, jamais par remplacement, sans quoi le retour en arrière écrirait dans un tableau orphelin. Deux exceptions volontaires : les **formulaires** (ils ont un endroit pour dire l'échec, et gardent la saisie) et les écritures qui envoient un fichier.
- Largeur, marges et points de rupture repris de Bac-3 : contenu à 1240 px, marges de 16/24/32 px, ruptures à 720 et 1080 px. **La mise en page prend toute la largeur, le texte jamais** — sur grand écran les listes passent en colonnes plutôt que de s'étirer.
- Migrations : toute évolution du schéma passe par un fichier SQL dans supabase/migrations/, versionné dans git.
- Déploiement : branche main → GitHub Pages. Vérifier que le site fonctionne en local avant de pousser : `node tools/static-server.js`, puis http://localhost:4173 (ouvrir `index.html` en `file://` ne marche pas, les modules ES sont bloqués).
- **`node tools/verifier-gabarits.js` avant de pousser du HTML dans un gabarit.** Un accent grave nu dans un commentaire HTML, à l'intérieur d'un gabarit JS, ferme la chaîne : le fichier reste valide pour `node --check`, et le module casse au chargement en emportant tout l'écran. Le piège s'est produit quatre fois entre le 13 et le 15 août 2026 ; cet outil le voit, `node --check` non. (Un accent grave échappé, lui, est correct.)
- Langue : toute l'interface en français.

## Méthode de travail

- **Un échantillon d'abord.** Un chantier se construit par un exemple minimal —
  un fichier, un format, un chemin de code — vérifié visuellement dans le
  navigateur, validé par Noé, puis généralisé au reste. Jamais tout d'un coup.
- Chaque règle de forme s'accompagne de sa raison. Si une règle gêne à l'usage,
  on la change en connaissance de cause.
- Ton direct, pas de jargon inutile.
- Les fonctions qui fabriquent du HTML ne font que ça, à partir de données déjà
  chargées : elles restent vérifiables seules, sans session ni réseau.
