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

**Quatre espaces, six vues transverses, une page par objectif et par projet,
deux sites**, servis par un routeur à deux niveaux (`#espace/vue/id`). *Ces deux
pages rangent leur identifiant au NIVEAU DE LA VUE — `#objectif/<id>`,
`#projet/<id>` — parce qu'il n'y a rien d'autre à nommer sur ces écrans :
`#projet/fiche/<id>` aurait mis un mot vide entre l'adresse et son sujet. Le
SINGULIER dit la page, le pluriel dit la galerie : `#objectifs` les compare,
`#objectif/<id>` en ouvre un.* La distinction compte : un **espace** est un
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

| **Général** | Objectifs · Projets · Tâches · Périodes · Ma semaine · Le chemin |
| **FC Hermitage** | Ses objectifs · Ses projets · Ses tâches · Le site |
| **Formation** | Ses objectifs · Ses projets · Ses tâches |
| **Yuno** | Ses objectifs · Ses projets · Ses tâches · Le site |
| **Perso** | Les intentions · Les rendez-vous · L'humeur · Les victoires · Mes journées |
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
  - **LA TUILE OUVRE SA PAGE** (`#objectif/<id>`) depuis le 2 septembre 2026 : le pourquoi, la cible, la frise des jalons, les projets, les tâches du cap sans projet et — pour « Rembourser mon matériel » — les prestations et le matériel, tout cela vit là-bas. *Ce que ça remplace : un dépliage sur place, où la tuile pressée prenait toute la largeur. La règle des deux rangs tranche dès qu'il y a une page — la galerie est à deux gestes et ne dit que ce qui se COMPARE, la page est à trois et dit tout.*
  - **les séries se replient** : quinze « Visuels de la semaine » font UNE ligne, avec leur rythme, ce qu'il en reste et la prochaine date. Sans cette coupe, un projet récurrent redressait le mur que l'espace Tâches a appris à ne pas dresser.
  - **ajouter et modifier ouvrent la tuile volante**, avec tous les détails (`construireFormulaire`) ; la galerie ne garde que les gestes d'un doigt — cocher un jalon, terminer une tâche, ouvrir un cap. Ce qui est irréversible (supprimer, marquer atteint) demande confirmation **sur place**, dans le menu à trois points : pas de fenêtre pour ça, mais un objectif qui emporte ses jalons mérite le second appui.
  - **une SECONDE GALERIE sous la première : les projets** (28 août 2026, demande de Noé). Même forme, un étage plus bas — un projet se compare à un projet comme un cap se compare à un cap. **Presser une tuile OUVRE SA PAGE** (`#projet/<id>`) depuis le 2 septembre 2026 : elle ne se déplie plus sur place, à la différence d'un cap. Voir « La page d'un projet » plus bas. Ce qu'elle montre et que le dépliage d'un cap ne montrait pas : **les projets qui ne servent aucun cap** (« Album du club », « Suivi de l'alternance ») — ils existaient et étaient invisibles, donc oubliés. Un projet posé ici n'a pas de cap et c'est légitime : de l'intendance, ça existe. **L'AVANCÉE SE LIT DANS LA FORME DE SA JAUGE** — des marches s'il a des étapes, une barre s'il n'a qu'une charge, un pointillé s'il n'a rien déclaré. Voir « L'avancée d'un projet » plus bas : ce n'est plus une proportion de tâches faites.
  - **les périodes ferment la page**, en deux lignes et en encre discrète, avec leur tuile d'ajout à côté d'elles. Voir « les périodes » plus bas.
  - **Elle n'a plus d'onglet** : elle est au second rang, dans le menu, sous « Général » et ses trois vues. Elle en a eu un (une boussole, du 27 au 28 août) — ce qui avait déjà renversé la décision du 26. La règle des deux rangs tranche : ouvrir le cap, c'est déjà avoir décidé quelque chose. La tuile « Le cap » du tableau de bord y mène toujours.
- `#calendrier` — tout ce qui porte une date, tous espaces confondus, filtres par nature (tâches, événements, publications, objectifs)
  - **CE QU'ON POSE EST UNE TÂCHE PAR DÉFAUT** (30 août 2026, décision de Noé), partout où la tuile de capture s'ouvre depuis un calendrier. C'était un événement, sans raison écrite ; or ce qu'on note le plus souvent est une chose à faire — l'espace Tâches et l'accueil posaient déjà une tâche, le calendrier était le seul à ne pas le faire. **La règle du filtre passe avant** : quand une seule nature est cochée, c'est elle qu'on vient poser, et le défaut ne s'applique pas.
- `#objectif/<id>` — **la page d'un objectif** (2 septembre 2026, demande de Noé) : tous ses détails, ses jalons qu'on pose au calendrier, et les projets qui le servent avec un lien vers chacun. Voir « La page d'un objectif » plus bas.
- `#habitude/<id>` — **la page d'une habitude** (2 septembre 2026, demande de Noé) : depuis quand elle existe, ses chiffres, ses paliers, et le calendrier de ce qui a été fait. Voir « La page d'une habitude » plus bas.
- `#projet/<id>` — **la page d'un projet** (2 septembre 2026, demande de Noé) : tous ses détails, son calendrier en vue mois et semaine, et la colonne de ce qui attend un jour. Voir « La page d'un projet » plus bas.
- `#semaine` — **« Ma semaine » : le rendez-vous du dimanche soir, devenu une page** (30 août 2026, demande de Noé). Le bilan de la semaine passée en quelques chiffres, la grille de la semaine qui vient, et à côté d'elle les tâches sans jour, qu'on **glisse dessus** pour les programmer. Voir « Ma semaine » plus bas.
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

### `#perso` EST UN TABLEAU DE BORD, pas une page qu'on fait défiler (30 août 2026)

**La demande de Noé** : « choisir ce qui doit rester dans la page perso et sous
quelle forme — les critères sont un peu les mêmes que pour la page d'accueil,
des données qui évoluent sur lesquelles on a une action à faire. »

**Ce critère trie dans les deux sens, et c'est ce qui le rend utile** :

| Restent | Partent, chacune vers sa page |
|---|---|
| l'humeur du jour (elle change, elle se répond d'un doigt) | les intentions |
| les habitudes du jour (elles se cochent) | la bibliothèque entière |
| le livre en cours (des pages se notent) | l'historique des journées |
| le prochain rendez-vous · le mot du jour | la courbe des 30 jours, les victoires |

C'est **le même mouvement que l'accueil le 29 août**, quand les objectifs l'ont
quitté : ils avaient leur page à deux gestes, et l'accueil répond à « qu'est-ce
que je fais maintenant », pas à « où je vais ». Les intentions sont le cap de
perso ; elles partent pour la même raison.

**MAIS UNE INTENTION REVIENT, RELUE** — une seule, celle du jour, en pied de
page. C'est ce qui distingue ce tableau de bord d'un second accueil : on vient
ici pour se recentrer, et une phrase qu'on relit vaut mieux qu'une liste qu'on
gère. Elle vient de `relecture` (js/orientation.js), la même qui ferme une
journée.

**SEPT SOUS-PAGES dans le menu**, contre quatre avant : les habitudes, la
bibliothèque et les journées sont assez grandes pour avoir leur écran. Les
laisser dans la page en aurait fait une liste de sept blocs qu'on fait défiler —
l'inverse d'un lieu où l'on vient se recentrer.

**Ce que `#perso` seul ne montre plus** : les six autres blocs. Ils existent
toujours dans la même page et se donnent un à un par le menu — ni second écran,
ni second chargement, et les écouteurs posés sur la section survivent.

> *Ce que cette structure a remplacé.* Du 29 au 30 août, `#perso` montrait tout
> à la suite : la galerie d'intentions pleine largeur, puis deux colonnes — ce
> qui vient à gauche, ce qui est passé à droite. C'était juste tant qu'il n'y
> avait que quatre blocs ; les habitudes, la bibliothèque et les journées l'ont
> fait passer à sept, et la page est devenue un défilement.

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

### Les habitudes (29 août 2026)

**LA DEMANDE, en deux temps.** D'abord : « garder une routine et me motiver à la
garder, mais sans être trop strict — il y aura forcément des jours où je ne
pourrai pas. » Puis, devant une première maquette qui montrait les sept derniers
jours en points gris : *« ça ne me donne pas envie de les faire… propose-moi des
stats comme si j'étais dans un jeu, mais en restant sain pour que ça ne
s'écroule pas à la première fois que j'en saute une. »*

Les deux moitiés ne se contredisent pas. **Ce qui écroule une habitude, ce n'est
pas l'enjeu, c'est le TOUT OU RIEN** : un compteur qui remet à zéro efface trois
semaines pour une soirée. D'où trois mesures, dont aucune ne peut s'effondrer —
elles vivent dans `js/orientation.js`, donc éprouvables hors écran :

| Mesure | Ce qu'elle fait | Pourquoi elle ne s'effondre pas |
|---|---|---|
| **l'élan** (0–100) | monte à chaque pratique, perd 2 par jour | une pratique répare trois jours ; une semaine vide coûte 14 points |
| **la série** | compte les JOURS ou les SEMAINES tenus, selon la cadence | un manque la fait **reculer d'un cran**, jamais tomber à zéro |
| **le cumul** et ses paliers | 10, 25, 50, 100, 200, 365 | il ne redescend jamais, et le prochain palier est toujours proche |

- **Tenir sa cadence rapporte +14 par semaine, quelle qu'elle soit** : le gain
  d'une pratique vaut 28 / cadence. Sans cette division, une habitude
  quotidienne monterait deux fois plus vite qu'une hebdomadaire alors que les
  deux demandent le même effort — tenir ce qu'on a dit. *(Vérifié : cadence 3 et
  cadence 5 tenues douze semaines donnent toutes deux 98.)*
### DEUX NATURES D'HABITUDE : quotidienne et hebdomadaire (30 août 2026)

Demande de Noé : *« je préfère que le compte des habitudes soit quotidien plutôt
qu'hebdomadaire, lorsque je loupe un jour ça fait -1 à la série comme c'était
prévu pour la semaine. Il faut simplement séparer les habitudes journalières et
les habitudes hebdo. »*

**UNE HABITUDE EST QUOTIDIENNE QUAND SA CADENCE VAUT 7.** Pas de colonne
nouvelle : le formulaire écrit déjà « Tous les jours » sur cette valeur, et deux
champs qui disent la même chose finissent toujours par se contredire. Sept fois
par semaine EST tous les jours.

| Cadence | Unité de la série | Un manque coûte |
|---|---|---|
| 7 | des **jours** tenus | −1 jour |
| 1 à 6 | des **semaines** tenues | −1 semaine |
| aucune | pas de série | rien à tenir |

**Le recul d'un cran ne change pas** — c'est le réglage qui fonde ces mesures.
Il est simplement transposé du jour à la semaine. *(Vérifié : 29 jours dont 2
manqués donnent une série de 25, et non 8 comme le ferait un compteur qui remet
à zéro.)*

**La série s'arrête AVANT aujourd'hui**, comme elle s'arrêtait avant la semaine
en cours : la journée n'est pas finie, et compter un jour non encore vécu comme
manqué ferait reculer la série chaque matin.

**MAIS AUJOURD'HUI COMPTE DÈS QU'IL EST COCHÉ** (2 septembre 2026, demande de
Noé : *« il doit y avoir l'évolution en direct — si je coche une case, je dois
voir que la série a avancé »*).

**La règle ci-dessus ne bouge pas d'un pouce, elle se complète** : ce qu'elle
protège, c'est le SILENCE d'une journée en cours, pas le fait accompli. Un jour
non coché ne compte jamais comme manqué tant qu'il n'est pas fini ; une fois le
rond plein, il n'y a plus rien d'incertain.

*Ce que ça répare* : le seul geste quotidien de la page ne produisait **aucun
retour sur la mesure qu'il sert** — on cochait, et le chiffre attendait le
lendemain. C'est déjà ainsi que la flamme se compte
(`joursDAffileeDeLHabitude`) : d'aujourd'hui s'il est coché, d'hier sinon.

**LA SEMAINE EN COURS SUIT LA MÊME RÈGLE**, un cran plus haut : elle compte dès
que sa cadence est atteinte, et **elle ne peut que faire monter la série** — une
cadence pas encore atteinte n'est pas une semaine manquée, c'est une semaine qui
n'est pas finie. *(Vérifié : 2 pratiques sur 3 laissent la série à 0, la
troisième la porte à 1.)*

**Les chiffres se redessinent au clic** : `rendreTableau` recalcule
`etatDesHabitudes` depuis `etat.faits`, qui vient de changer. Rien à câbler de
plus — les mesures ne sont stockées nulle part, elles se déduisent des faits.
*Mesuré à l'écran : cocher « Lire un peu » fait passer ses deux chiffres de 3 à
4 sur-le-champ, décocher les ramène.*

**LES TROIS NATURES SE SÉPARENT À L'ÉCRAN** — « Tous les jours », « Chaque
semaine », « Quand ça vient ». Elles ne se comptent plus dans la même unité :
les aligner sans le dire ferait lire « 25 » et « 9 » comme deux valeurs
comparables, alors que 9 semaines valent 63 jours de rythme. Sur le tableau de
bord, où la place est comptée, un simple filet remplace les titres.

**LA MEILLEURE SÉRIE SE COMPARE EN JOURS, ET S'AFFICHE DANS SON UNITÉ.** Mesuré
avant correction : une série de 25 jours s'affichait « 25 semaines » et passait
devant une vraie série de 9 semaines. Le classement se fait sur la durée réelle,
l'écran rend l'unité que l'habitude compte.

- **La série recule d'un cran**, et c'est LE réglage demandé. Mesuré sur douze
  semaines dont une sautée : la série affiche **9** là où une série classique
  dirait 3, et l'élan passe de 98 à 95.
- **« QUAND ÇA VIENT » N'EXISTE PLUS** (30 août 2026, décision de Noé : « quand
  ça vient ne doit pas exister, c'est pas une habitude »). Et il a raison sur le
  fond : sans cadence, il n'y a ni élan ni série — rien à tenir, donc rien qui
  puisse se tenir. C'était un compteur, pas une habitude. **La cadence est
  désormais obligatoire.**
  *Ce que ça remplace : l'option valait NULL et se disait « la cadence des
  choses qu'on veut noter sans se les imposer ». L'idée était juste, l'endroit
  non — une chose qu'on note sans se l'imposer est une victoire ou un
  rendez-vous.*
  **Les habitudes qui portent encore NULL ne disparaissent pas** : la page les
  range dans un groupe « À régler » qui invite à leur donner un rythme. Les
  cacher les rendrait impossibles à corriger, ce qui est le pire des deux maux.
- **Aucun rouge, aucun taux de réussite, aucun jour manqué compté.** Les mots de
  l'élan vont de « solide » à « en sommeil » — une habitude en sommeil n'est pas
  un échec, c'est une habitude qui attend.
- **Une série à zéro ne s'affiche pas.** « 0 semaine tenue » était la première
  chose que voyait une habitude neuve.
- **Franchir un palier écrit une victoire** (`source = 'habitude'`), et c'est le
  SEUL moment où une habitude parle dans « Le chemin » : la cocher tous les
  jours y écrirait du bruit, franchir la cinquantième est un fait.

**ON LES COCHE DANS PERSO, ET NULLE PART AILLEURS** (30 août 2026, décision de
Noé : « finalement les habitudes n'ont pas besoin d'être sur l'écran d'accueil,
uniquement dans la page perso »). Elles ont vécu une journée sur l'accueil, en
bande de jetons ronds entre la tête et la journée.

C'est le même mouvement que les objectifs la veille : l'accueil répond à
« qu'est-ce que j'ai à faire », et **une habitude n'est posée nulle part — elle
revient**. Elle se coche donc là où vivent déjà son élan, sa série et ses
paliers : un seul endroit pour la voir et pour la tenir. **Celles qui sont
faites restent visibles**, pleines — une bande qui se vide serait un compteur de
ce qui manque.

### La forme dans perso : UNE COLONNE, UNE LIGNE PAR HABITUDE

Demande de Noé (30 août 2026) : *« une colonne pour les habitudes, une ligne =
une habitude, une ou deux stats à voir facilement chaque jour pour donner envie
de faire l'habitude »*. Elle remplace une bande horizontale de jetons ronds, née
la veille POUR L'ACCUEIL — où la place était comptée et où elle devait tenir en
56 px. Les habitudes ayant quitté l'accueil, la contrainte est tombée avec lui.

**LE ROND EN PREMIER, TOUT À GAUCHE** (même demande) : c'est le geste qu'on vient
faire. Il tombe sous le pouce dès l'ouverture, et l'œil ne traverse pas la ligne
pour l'atteindre. Le nom et les mesures suivent — on les lit APRÈS avoir vu où
cocher.

**32 px PAR HABITUDE**, contre 64 au départ. La cible est chiffrée par Noé :
« il doit pouvoir y avoir 10 sans que ce soit trop long » — dix lignes font donc
320 px, un tiers d'écran de téléphone au lieu de 640. Aucun écart entre elles :
ce qui les distingue est le voile d'une habitude faite, pas du vide. Les corps
ont suivi (nom 13 px, chiffres 11, points 6), Noé l'ayant autorisé dans la même
phrase.

**LA HAUTEUR DE LA CIBLE CÈDE À LA DENSITÉ**, et c'est un arbitrage assumé : le
hub demande 44 px, la colonne doit tenir dix habitudes. Ce qui rend le compromis
tenable, c'est que la LARGEUR reste à 44 et surtout qu'il n'y a **aucune autre
cible sur la ligne** — rien à côté de quoi tomber. Seul le voisin du dessus ou du
dessous est proche. Si l'usage dit le contraire, c'est cette décision qu'il faut
rouvrir.

**ELLES SONT HORS DE TOUTE TUILE** (demande de Noé : « détache-les de la tuile ce
qui a compté aujourd'hui »), posées à même le fond. C'est la MÊME correction
qu'il avait faite le matin sur l'accueil, et pour la même raison : une tuile
porte ce qui est POSÉ — une lecture du jour, un mot qu'on écrit —, et **une
habitude n'est posée de rien, elle revient**. Les mettre dedans, c'était dire
qu'elles sont de la même nature.

**ELLES OUVRENT UN DUO : Habitudes | Ta lecture** (demande de Noé, la seconde
colonne étant à trouver). Pourquoi la lecture, et pas les rendez-vous ni le mot
du jour : c'est le **second geste quotidien** de cette page — on coche une
habitude, on note des pages ; les deux se font en trois secondes et font avancer
quelque chose, tandis qu'un rendez-vous se lit. Et surtout, **les deux sont déjà
liées** : noter des pages coche l'habitude de lecture. Les poser côte à côte,
c'est mettre ensemble ce que la base relie déjà.

*Sans livre en cours — le cas au 30 août 2026 — la colonne porte une tuile
pointillée qui invite, et non une phrase perdue à côté de dix habitudes.*

> **Piège de nommage, payé une seconde fois.** Ces colonnes se sont d'abord
> appelées `.perso-colonne` — un nom DÉJÀ PRIS par la mise en page des
> sous-vues, que le script masque quand elle ne porte aucun `[data-vue]`. Les
> deux colonnes disparaissaient donc entières. Leur titre était un `<h2>`, et le
> script masque le premier `h2` d'une vue affichée seule : il attrapait le
> mien. Deux collisions pour un nom non vérifié. Elles s'appellent `.duo-*` et
> leur titre est un `<h3>`. **Le grep de trois secondes n'est pas facultatif.**

**DEUX MESURES, ET PAS TROIS.** Le hub en calcule trois ; trois chiffres alignés
font un tableau. **Ce sont LES DEUX SÉRIES depuis le 2 septembre 2026** (demande
de Noé : *« les stats présentes doivent être série en cours et série max, avec le
code couleur »*) :

1. **la série en cours**, dans la couleur de son rang — vert, bleu, jaune, ou
   l'or de l'égalité ;
2. **la série max**, en orange — et **en or elle aussi quand les deux sont
   égales**, comme sur la page : une même égalité ne peut pas se lire en or d'un
   côté et en orange de l'autre.

**LES DEUX CHIFFRES SONT TOUJOURS LÀ, ZÉRO COMPRIS** (2 septembre 2026, deux
corrections de Noé : *« je ne vois pas la série max là »*, et *« si la série en
cours est 0 mets 0 »*). Ce sont **deux règles qui tombent**, et il a raison sur
les deux :
- le record se taisait à égalité, au motif que l'or le disait déjà. Mais on ne
  lit pas une couleur qu'on n'a pas encore apprise, et **une colonne vide ne se
  lit pas comme « c'est pareil », elle se lit comme « il n'y a rien »** ;
- **« une série à zéro ne s'affiche pas »** datait du 30 août et protégeait une
  habitude neuve d'un « 0 » en guise d'accueil. Dans DEUX COLONNES ALIGNÉES, la
  case vide était pire : elle décalait le regard, et on ne savait plus lequel des
  deux chiffres manquait. **Un zéro dans une colonne qui en compte une autre
  n'est pas un reproche, c'est une case remplie.** *(La règle tient toujours là
  où un chiffre est seul — sur la page d'une habitude, le record ne s'affiche pas
  à zéro.)*

**EN GOOGLE SANS, PAS EN GEIST MONO** (même jour, demande de Noé). C'est
l'exception déjà faite au décompte des heures du bilan de « Ma semaine », et pour
la même raison : la chasse fixe donne à chaque glyphe la même largeur, et à 13 px
deux chiffres seuls s'y étalent au lieu de se lire. **Ces deux-là ne s'alignent
avec rien d'autre** — c'est la colonne qui les cale, pas la police. *La graisse
se redit dans la même règle : `.chiffre` pose 500 sur l'élément lui-même, ce qui
bat le 600 hérité de la ligne.*

> *Ce que ça remplace, et le motif n'a pas changé — c'est le CHOIX des deux qui
> change.* La ligne portait **les points de la semaine** et **le chiffre du
> prochain palier** (30 août 2026). Une série est ce qu'on ne veut pas perdre, et
> c'est ce qui fait cocher un soir où l'on n'en a pas envie ; un palier à dix
> jours de là ne pousse personne.

**LA FLAMME SUIT LA SÉRIE EN COURS** (2 septembre 2026, demande de Noé), à
cinq jours sans un trou — le même dessin et le même seuil que sur la page d'une
habitude. Elle ne dit pas la même chose que le chiffre : la série RECULE d'un
cran quand un jour manque, donc « 7 » peut avoir deux trous dedans ; la flamme
dit cinq jours **sans** trou. **L'une protège, l'autre récompense.**
- **Elle prend la couleur du rang** — elle brûle en vert, en bleu, en jaune ou
  dans l'or de l'égalité. Dessinée et non en émoji, donc `currentColor` suffit
  (`flammeDeSerie`, js/gabarits.js — posée là parce que la page d'une habitude
  importe déjà js/perso.js, et que l'inverse ferait un cycle).
- **Le chiffre et sa flamme ne font qu'UN BLOC, CENTRÉ** (demande de Noé).
  Alignés à droite, le groupe poussait son chiffre vers la gauche : « 5 🔥 » et
  « 4 » ne tombaient plus sur la même verticale, et le feu se lisait comme s'il
  appartenait à la colonne d'à côté. Centré, le groupe se pose autour du même axe
  qu'un chiffre seul. *Mesuré : le centre du contenu tombe au même pixel sur
  toutes les lignes, avec flamme comme sans.*
- **Elle colle au chiffre** (2 px) : `.hab-mesure` pose 8 px entre ses enfants —
  un écart fait pour séparer deux choses, or le feu et le nombre n'en sont
  qu'une, c'est la série.
- **`affilee` vit dans `etatDesHabitudes`** : la colonne du tableau de bord n'a
  pas les faits bruts sous la main, et un second chemin qui recompte à côté
  finirait par ne plus compter pareil.

**LES MOTS ET LES COULEURS SONT CEUX DE SA PAGE** (`rangDeLaSerie`,
js/orientation.js — la règle à seuils vit là, donc éprouvable hors écran, et
*dix cas y sont vérifiés*). **Une même mesure ne change ni de nom ni de teinte
d'un écran à l'autre** : deux copies d'une règle de couleur finissent par ne plus
colorer pareil, et ça ne se voit qu'à côté. Ici il n'y a la place ni pour les
mots ni pour la flamme — ils partent dans la bulle et le nom accessible, la
parade de cette ligne depuis le premier jour.

**AUCUN TEXTE, QUE DES CHIFFRES** (demande de Noé : « le texte n'est pas
nécessaire une fois que je sais à quoi les chiffres correspondent »). La ligne a
perdu ses mots en trois passes, et chacun coûtait de la place au NOM :
« 0 sur 5 cette semaine » répétait en dix-huit caractères ce que trois points
disent déjà ; « encore » n'apprenait plus rien à quelqu'un qui lit cet écran
tous les jours ; « quand ça vient » disait une absence de cadence que l'absence
de points dit mieux. **Résultat mesuré : tous les noms tiennent en entier sur
grand écran**, là où trois sur cinq étaient tronqués.

Le sens n'est pas perdu, il est **déplacé** : `title` porte la phrase complète,
`aria-label` la donne au lecteur d'écran — qui, lui, ne sait pas à quoi le
chiffre correspond.

**LE ROND FAIT 16 px**, la cible 44. Il est passé de 34 à 26 le matin, de 26 à
16 le soir (« le rond doit être beaucoup moins gros ») ; le bouton n'a jamais
bougé. C'est cette séparation — le rond est ce qu'on VOIT, le bouton ce qu'on
TOUCHE — qui permet de le réduire autant sans rien perdre au doigt.

**L'ÉLAN A QUITTÉ LE HUB** (2 septembre 2026, décision de Noé en deux temps :
*« supprime les petits ronds et en sommeil »* sur la page d'une habitude, puis
*« enlève alors en sommeil et les petits points »* sur les cartes). Il n'existe
plus nulle part à l'écran.

Ce qui l'a tué n'est pas son calcul mais son MOT : « en sommeil » s'affichait sur
les neuf habitudes à la fois — elles ont toutes commencé le même jour —, et un
mot identique partout ne distingue rien. **Une mesure qui ne sépare pas est une
mesure qui occupe de la place.** Les seuils (`elanDeLHabitude`, `motDeLElan`)
restent dans js/orientation.js, éprouvés : y remettre un affichage est l'affaire
de trois lignes si l'usage le redemande.

**Ce qui reste, c'est « sans cadence »** : une habitude qui n'a rien à tenir. Ce
n'est pas un élan, c'est un réglage qui manque — et il faut le voir pour le
corriger.

- **Une cadence nulle n'a pas de semaine** : « 0 sur 0 » lui poserait la cible
  qu'on a justement refusé de lui poser. Elle dit « quand ça vient ».
- **Une habitude neuve dit « encore 10 », pas « encore 10 avant 10 »** : quand
  rien n'a été fait, reste et palier valent le même nombre — juste, et illisible.
- **La grille est portée par la COLONNE, pas par chaque ligne** (`subgrid`) :
  sinon chaque ligne se cale seule et les mesures ne tombent pas sur la même
  verticale. Là où `subgrid` manque, la ligne perd son alignement et rien
  d'autre.
- **Rien ne se masque sur téléphone**, et c'est le texte retiré qui l'a permis.
  Tant que la ligne écrivait ses mesures en toutes lettres, elle ne tenait pas
  sur 375 px — « Bouger » y tombait à « B… » — et l'on masquait le palier. Une
  fois réduites à des points et à un chiffre, les deux tiennent partout : mieux
  vaut une ligne courte pour tout le monde qu'une ligne longue qu'on ampute
  selon l'écran.

**UN ÉMOJI PAR HABITUDE** (même jour), facultatif — il précède le nom et le rend
reconnaissable sans qu'on ait à le lire.

### IL SE PREND DANS UN CARRÉ, À GAUCHE DU NOM (2 septembre 2026)

**Demande de Noé**, Notion en référence : *« ajouter un émoji ne fonctionne pas
pour l'instant. Fais comme sur Notion : à gauche du texte, avant le texte, un
petit carré cliquable qui mène directement sur les émojis et qui s'affiche dès
qu'on l'a sélectionné. »*

**LA PANNE ÉTAIT EN DEUX MORCEAUX, ET LE PREMIER ÉTAIT MUET** : le formulaire
demandait l'émoji depuis le 30 août, la base a sa colonne — et l'objet
`valeurs` de l'enregistrement ne le reprenait pas. **La valeur partait à la
poubelle sans erreur ni signe.** C'est le genre de défaut qui ne se voit qu'en
relisant la ligne d'à côté.

**LE SECOND ÉTAIT LE CHAMP LUI-MÊME** : un `type: 'text'` étiqueté « Émoji
(facultatif) », au milieu du formulaire. Il demandait d'en TAPER un —
c'est-à-dire de connaître ⌃⌘Espace. **Un champ qui exige un raccourci système
n'est pas un champ.**

**IL NE DESCEND PAS DANS LA RANGÉE DE PASTILLES**, et c'est la seule exception à
la règle du 30 août (« tout ce qui se règle devient une pastille ») : **l'émoji
est l'image de la chose qu'on est en train de nommer, il appartient à son nom**,
pas aux réglages. D'où un CARRÉ et non une pastille — une pastille dit « choisis
une valeur », ce carré dit « pose une image ici ». Il porte le signe d'un visage
TRACÉ tant qu'il est vide : proposer un émoji par défaut, ce serait en poser un
qu'on n'a pas choisi.

**LE CLAVIER D'APPLE NE S'OUVRE PAS DEPUIS UNE PAGE WEB** (demande de Noé : « ça
doit ouvrir le clavier des émojis Apple »). ⌃⌘Espace est un raccourci du système,
aucune API du navigateur ne le déclenche, et il n'existe pas d'`inputmode="emoji"`.
**Ce qu'on peut faire, c'est donner le FOCUS à un vrai champ de texte**, en tête
du panneau :
- **sur iPhone, le clavier monte de lui-même** — parce que le focus part d'un
  geste, la même mécanique que la vedette d'une tuile d'ajout ;
- **sur Mac, le raccourci de Noé écrit dedans**, avec accès à tous les émojis.

**LA PALETTE RESTE, en dessous** : soixante-quatre émojis choisis, qui répondent
en un geste au doigt et sans clavier. Elle est dessinée comme tous les menus du
hub depuis le 13 août 2026 — il n'y a pas de sélecteur du système à appeler, et
une dépendance externe est exclue. **Elle ne sera jamais un clavier complet, et
elle n'a pas à l'être** : on nomme des habitudes, pas des drapeaux.

- **ON NE GARDE QUE L'ÉMOJI de ce qui est tapé** (`emojiDeLaSaisie`,
  js/gabarits.js) : le champ accepte n'importe quel texte, et « course à pied 🏃 »
  collé s'y retrouverait en entier. On lit la dernière suite pictographique,
  **modificateurs de teinte et jointures comprises** — sans quoi une famille ou un
  pouce coloré ressortirait coupé en deux. *Vérifié sur sept cas.*
- **ENTRÉE FERME LE PANNEAU, elle n'envoie pas le formulaire.** Un champ de texte
  dans un `<form>` le soumet à la touche Entrée : sans cette garde, choisir un
  émoji au clavier enregistrait l'habitude à moitié remplie.
- **Un clic DANS le panneau ne le referme plus** : le champ y vit, et se faire
  fermer le menu en cliquant dedans serait un piège.
- **« Sans émoji » ferme la liste**, hors de la grille : c'est la seule option qui
  n'est pas une image, et l'y mettre en aurait fait une case vide qu'on
  confondrait avec un trou.

**ET UN PANNEAU NE SE RETOURNE PLUS QUE SI ÇA AIDE** (`placerLePanneau`,
js/gabarits.js). La règle d'avant basculait vers le haut dès que le panneau
dépassait EN BAS, sans regarder s'il y avait plus de place au-dessus : le panneau
des émojis, ouvert au PREMIER champ d'une tuile, se retournait pour aller se
faire couper par le haut — huit rangées d'images, dont une seule visible.
**Un retournement qui ne gagne rien est un retournement qui perd tout.** Et ce
qui ne tient toujours pas se met à DÉFILER plutôt qu'à déborder. *Le défaut
touchait tous les panneaux du hub, pas seulement celui-ci.*
- **Sur la page qui les GÈRE aussi**, devant le nom : on y vient lire une
  cadence, un pourquoi, un palier — les mots y sont nécessaires des deux côtés.
- Le nom passe dans `aria-label` : au lecteur d'écran, « 🏃 » ne dit rien.
- **Huit caractères au plus** : un émoji composé en occupe plusieurs — une
  famille tient sur huit unités UTF-16, une teinte de peau sur quatre.

**Les quatre familles ont enfin une couleur** (corps, calme, lien, intendance).
Elles étaient collectées depuis le 27 août et n'apparaissaient nulle part.

**Les cinq amorcées sortent de SES intentions**, pas d'une liste générique :
bouger (3×), lire un peu (5×), poser le téléphone avant de dormir (5×), un vrai
repas à midi (5×), prendre des nouvelles de quelqu'un (sans cadence). « Vivre de
la joie, de l'espoir, de la simplicité » n'en est PAS une et ne doit pas le
devenir : c'est l'intention-mère, celle qui juge les autres — en faire une case
à cocher la détruirait.

### La page des habitudes : un tableau de bord (30 août 2026)

Demande de Noé : *« revois la forme d'affichage des habitudes, et il faut qu'il
y ait des stats globales, des graphiques d'évolution »*.

**CE QUE ÇA RENVERSE, ET IL FAUT LE DIRE.** La page avait un PLI — une habitude
ouverte montrait tout, les autres tenaient en une ligne : *« sans ce pli, cinq
habitudes feraient un tableau de bord, et un tableau de bord ne donne envie de
rien »*. La règle était juste tant que la page ne portait que des chiffres nus.
Noé demande maintenant des stats et des courbes : il VEUT ce tableau de bord. Le
pli disparaît, et chaque habitude devient une CARTE qui montre son histoire.

**QUATRE CHIFFRES EN TÊTE**, choisis pour ce qu'ils donnent envie de faire :
ce qui reste à tenir cette semaine (le seul qui parle du jour même et qui puisse
encore bouger avant dimanche), les pratiques de la semaine, la meilleure série
en cours avec son habitude, et le cumul depuis le début. **Aucun ne peut baisser
à cause d'un oubli** : trois ne font que monter.

**DEUX GRAPHIQUES**, tous deux en barres, tous deux sur douze semaines — un
trimestre : assez pour voir une habitude s'installer ou s'endormir, assez court
pour tenir sur un téléphone.
- **la courbe globale**, toutes habitudes confondues ;
- **une sparkline par carte**, dans la couleur de sa famille, où une semaine
  TENUE est pleine et une semaine entamée en creux.

**LA CONTRAINTE QUI TIENT, et c'est elle qui a dessiné le reste** : aucune de ces
mesures ne compte un manque. La toute première maquette des habitudes montrait
les sept derniers jours en points gris, et Noé l'avait écartée d'une phrase —
« ça ne me donne pas envie de les faire ». Elle DÉCRIVAIT sans rien mettre en
jeu. Ici : pas de rouge, pas de taux de réussite, pas de jour manqué. **Une
semaine sans pratique est une barre courte, jamais une alerte.**

- **Une barre à zéro garde 6 % de hauteur** : à zéro elle disparaîtrait, et la
  courbe aurait des trous là où elle doit avoir des creux.
- **La semaine en cours se distingue** — elle n'est pas finie. La comparer aux
  autres sans le dire ferait lire une baisse tous les lundis.
- **Sans cadence, aucune semaine ne se « tient »** : il n'y a pas de cible, et
  lui en inventer une contredirait la règle de « quand ça vient ».
- **Une habitude neuve ne dit ni « 0 au total » ni « encore 10 avant 10 »** :
  le premier ressemble à un constat d'échec, le second est juste et illisible.

Les calculs vivent dans `js/orientation.js` (`bilanDesHabitudes`,
`historiqueDeLHabitude`) : comme le reste, ils ne touchent ni au réseau ni au
DOM et se vérifient avec des faits factices.

> **Deux défauts trouvés le 30 août en refaisant cette page, et le second était
> le vrai.** Noé : « je ne peux plus modifier une habitude ». Le menu à trois
> points répondait pourtant au clic — mesuré, `opacity: 0` et pourtant
> cliquable : la liste des conteneurs qui le révèlent au survol ne connaît que
> les tuiles du cap, et la nouvelle carte n'y était pas. **Sur cette page il est
> désormais visible en permanence** : ailleurs le menu est un geste de second
> plan, ici modifier une cadence est la raison même de venir.
>
> Mais le formulaire s'ouvrait, et **cliquer « 4 fois » laissait la cadence à
> 3** — puis s'enregistrait proprement avec l'ancienne valeur, sans erreur ni
> signe. **`perso.js` n'appelait `brancherChoix` nulle part** : ses champs de
> type « choix » sont un input caché doublé d'un bouton et d'un panneau, et
> sans ce branchement la valeur ne se pose jamais. Le défaut touchait aussi la
> famille d'une habitude et le statut d'un livre. Perso n'ayant pas de tuile de
> capture, l'appel y est seul — sans le double traitement qui a fait retirer ce
> même appel du site FCH.

### La bibliothèque (29 août 2026)

**La demande** : « un espace qui m'encourage à lire — une bibliothèque où mes
livres sont recensés, un bouton qui me permet de rajouter rapidement un nombre
de pages lues sur mon livre en cours, pouvoir noter le livre. » Le mot est
*encourager*, pas mesurer, et il commande tout ce qui suit.

**Trois tables.** `livres`, `livres_seances` (le journal de lecture) et
`livres_citations`. La deuxième est celle qui compte : **les pages lues d'un
livre sont la SOMME de ses séances, jamais une colonne à part** — deux endroits
pour un même nombre finissent toujours par se contredire. Elle donne aussi le
rythme, et servira la page du jour.

- **PAS d'objectif annuel, PAS de quota de livres.** « 24 livres cette année »
  transforme la lecture en course et pousse à choisir des livres courts. Le hub
  montre où l'on en est et à quel rythme on avance, jamais un reste à faire.
- **Le rythme se compte PAR JOUR DE LECTURE**, pas par jour de calendrier :
  sauter trois jours ne doit pas faire chuter un chiffre, sinon c'est un
  reproche déguisé.
- **« Reposé » et non « abandonné »** (`statut`) : un livre qu'on lâche n'est pas
  un échec, et le mot compte. Ses pages sont gardées, on peut le reprendre.
- **Un livre déclaré lu est fini**, même si le compte des pages ne tombe pas
  juste : c'est la décision qui dit la vérité, pas l'arithmétique — même règle
  que l'état posé d'un projet.
- **Les citations gardées** sont l'ajout que Noé n'avait pas demandé et qui sert
  le plus sa première phrase (« une page qui me permet de me recentrer ») : c'est
  ce qui reste d'un livre six mois après, plus que la note.
- **Finir un livre écrit une victoire**, au même rang que le reste.

### LA COUVERTURE, ET L'ÉTAGÈRE (2 septembre 2026)

**Demande de Noé** : *« j'aimerais pouvoir rajouter la couverture du livre, ce
qui permettrait d'avoir un aperçu visuel dans la bibliothèque »*.

**UNE PHOTO QU'ON PREND, ET NON UN LIEN COLLÉ** (choix de Noé entre les deux) :
l'image vit dans le hub, elle ne peut pas disparaître, et regarder sa
bibliothèque ne prévient personne. **Rien n'était à écrire** — le hub a la
machinerie depuis le 21 août pour le Carnet de terrain : réduction avant envoi,
bucket privé, adresses signées gardées un mois dans le `localStorage`.

- **LE BUCKET EST DEVENU UN PARAMÈTRE** (`televerserImage`, `urlsDesPhotos`,
  `supprimerImage`, js/api.js) plutôt qu'une seconde copie : deux machineries
  auraient fini par ne plus réduire de la même façon. Un second bucket
  **`livres`** — une couverture n'est pas un moment vécu, et le jour où l'on
  videra l'un on ne touchera pas à l'autre.
- **La clé du garde-manger porte sa réserve** : deux buckets peuvent contenir un
  même nom de fichier, et un lien signé ne vaut que pour le sien. *Conséquence
  assumée : les adresses déjà gardées pour « moments » se resignent une fois.*
- **Les couvertures arrivent APRÈS le reste** : signer une poignée d'adresses ne
  doit pas retarder la page, et l'étagère se redessine quand elles sont là. Sans
  couverture, aucune requête.
- **L'envoi d'un fichier n'est pas optimiste**, et c'est l'exception déjà écrite
  dans les conventions : on ne peut pas afficher une image qu'on n'a pas encore.
- **Un champ vide n'efface rien** : ne rien redonner, c'est garder ce qui est là.
  Une couverture remplacée fait partir l'ancienne — un fichier que plus personne
  ne référence est payé sans jamais être revu.

**L'ÉTAGÈRE** remplace la liste de lignes : une liste de titres se parcourt mot à
mot, une étagère se balaie du regard. **C'est le seul écran du hub où l'image
passe devant le texte.** Une grille qui se remplit d'elle-même, le rapport **2/3**
d'un livre de poche pour que les vignettes tiennent la même boîte — sans quoi
l'étagère ferait des marches d'escalier.

**6,5 REM PAR COUVERTURE** (2 septembre 2026, demande de Noé : *« je préférerais,
comme souvent dans le site, que les tuiles soient plus compactes, plus longues
que larges, de manière à pouvoir en mettre côte à côte — on optimise mieux la
place comme ça »*). Elles faisaient 9 rem. **C'est la mesure d'un DOS DE LIVRE
sur une étagère, pas d'une affiche** : on reconnaît une couverture à sa couleur
et à sa forme bien avant d'en lire le titre, et c'est ce qu'on vient chercher
ici. *Mesuré sur une étagère de sept : quatre de front dans une colonne de
523 px, contre trois avant.* L'écart tombe à 12 px et les corps d'un cran —
16 px entre des vignettes de 114 rendraient en blanc ce que la compacité vient de
gagner.

- **UN LIVRE SANS COUVERTURE GARDE SA PLACE**, en tuile pointillée avec son
  titre : le pointillé est déjà le signe du hub pour « déclaré, pas encore
  rempli », et une étagère à trous se lirait comme une bibliothèque incomplète.
- **LA COUVERTURE S'ÉTEINT VERS LE BAS, ET LE TEXTE Y REMONTE** (2 septembre
  2026, demande de Noé). Le fondu enlève au rectangle son bord net : la vignette
  ne s'arrête plus, elle se dissout dans la page, et le titre vient s'asseoir
  dans ce qu'elle laisse. **L'étagère y gagne une allure de rayon plutôt que de
  catalogue** — et vingt pixels de hauteur par tuile.
  - **Un MASQUE et non un dégradé par-dessus** : posé en calque, il faudrait lui
    donner la couleur du fond, et il se trahirait partout où ce fond change. Le
    masque, lui, efface — c'est la page qui reparaît, quelle qu'elle soit.
  - **Il ne s'applique pas à la tuile pointillée** : son cadre est le signe de ce
    qui manque, et un cadre à moitié effacé se lirait comme un défaut
    d'affichage.
  - *Conséquence assumée : une couverture dont le bas porte du texte le perd.
    C'est la nature de l'effet.*
- **LE TITRE EST EN CLASH DISPLAY** (2 septembre 2026, demande de Noé : « je ne
  la trouve pas assez imposante par rapport au reste »). C'est la police des
  TITRES du hub, et c'en est un : **le nom du livre est ce qu'on lit une fois la
  couverture reconnue**, tout le reste de la tuile — thème, état, auteur — n'est
  que du service. En police de texte à 700, il pesait le même poids qu'eux. C'est
  aussi celle du titre écrit dans une tuile pointillée : les deux disent le nom
  d'un livre, ils ne peuvent pas le dire dans deux polices.
- **LES INFOS S'ALIGNENT D'UNE TUILE À L'AUTRE** (même jour, demande de Noé).
  Chaque bloc **réserve sa hauteur** — deux lignes pour le titre, une pastille
  pour le thème —, si bien qu'un titre court et un titre long laissent l'état et
  la note sur la même horizontale.
  - **`subgrid` a été essayé et il se bat avec le retrait du titre** : une marge
    NÉGATIVE réduit ce que l'élément demande à sa rangée, et la rangée du titre
    tombait à zéro — le texte débordait sous la couverture. *Deux mécanismes qui
    se disputent la même hauteur, c'est un de trop.*
  - *Prix assumé : la tuile passe de 221 à 236 px. Une place réservée coûte de la
    place, même quand elle sert à un titre d'une seule ligne.*
- **Le livre EN COURS porte sa couverture en grand**, à gauche de tout le reste :
  c'est celui qu'on ouvre ce soir. Les autres tiennent en vignette.
- **Le menu à trois points se pose SUR la couverture** : sous le texte il aurait
  ajouté une ligne à chaque tuile, et l'étagère aurait grandi d'un tiers pour un
  geste de second plan.

> **LE LIVRE EN COURS N'AVAIT PAS DE MENU**, et les couvertures l'ont révélé :
> c'est le livre qu'on voudrait illustrer en premier, et il était **le seul
> qu'on ne pouvait ni modifier ni retirer sans le finir d'abord**. Tous les
> autres l'ont depuis le 29 août.

**ON NOTE AUSSI LE NOMBRE EXACT DE PAGES DEPUIS `#perso`** (même jour, demande de
Noé). Le bouton « autre » existait sur la bibliothèque depuis le premier jour et
manquait sur le tableau de bord — c'est-à-dire sur l'écran où l'on note vraiment
ses pages tous les soirs. **+10 et +25 ne sont que des raccourcis, et une lecture
fait rarement un compte rond.**

### DEUX VUES : L'ÉTAGÈRE ET LA LISTE (2 septembre 2026)

**Demande de Noé**, une capture de sa base Notion à l'appui : *« il faudrait que
je puisse avoir une vue de ce type également pour pouvoir chercher un livre
précis et filtrer selon la note, l'état ou le type de livre »*.

**DEUX VUES POUR DEUX QUESTIONS, et c'est ce qui justifie la bascule** :
l'étagère répond à « qu'est-ce que j'ai lu » — on la balaie du regard, sans rien
chercher ; la liste répond à « où est CE livre » — on y vient avec un nom ou un
critère en tête. **Une seule vue aurait mal servi les deux.** La bascule reprend
`.affichages`, le groupe de boutons du calendrier : même geste, même dessin.

**LES THÈMES sont la donnée qui manquait** (`livres.themes`, un `text[]`). Un
tableau et non une colonne texte : un livre en porte plusieurs — « The good
life » est psycho ET relation humaine —, et une colonne unique aurait obligé à
choisir. **La base n'impose rien** : pas de CHECK, pas de table ; un thème est un
mot qu'on se donne, et la liste offerte à la saisie (`THEMES_LIVRE`, js/perso.js)
s'allonge sans migration.

- **ON N'OFFRE QUE CE QUI EXISTE** : les filtres se déduisent des livres, avec
  leur compte. Un filtre « Biographie » sur une bibliothèque qui n'en compte
  aucune est une porte sur une pièce vide.
- **La recherche vit dans LES DEUX vues** : chercher un titre qu'on a en tête n'a
  pas à commencer par changer de vue. Les filtres, eux, n'existent que dans la
  liste — c'est là qu'on trie, pas là qu'on regarde.
- **Elle filtre à la lettre, sans bouton** : une bibliothèque tient en mémoire,
  il n'y a rien à demander au réseau. Le curseur revient **au bout du mot** — on
  redessine à chaque frappe, et sans ça le champ perdait le focus au premier
  caractère.
- **Elle cherche le titre ET l'auteur** : on cherche « Marc Levy » aussi souvent
  qu'un titre, et demander lequel des deux serait une question de plus.
**LES LIVRES EN COURS OUVRENT LES DEUX VUES** (2 septembre 2026, demande de
Noé : *« les livres en cours doivent apparaître au-dessus de l'étagère et la
liste ; ils réapparaissent dans l'étagère et dans la liste sous la forme de
chacune »*). C'est le seul endroit de la page où l'on AGIT — noter des pages,
garder une phrase, déclarer fini —, et ce sont les seuls livres sur lesquels ces
gestes aient un sens : les mettre en tête, c'est mettre le geste avant
l'inventaire.

- **ILS NE SORTENT PLUS DU RANG** : ils reparaissent plus bas, dans la forme de
  leur vue. *Ce que ça renverse : la vedette EXCLUAIT le livre en cours de
  l'étagère, et j'avais écrit que la liste ne devait mettre personne en avant.
  Noé a tranché autrement, et il a raison — une bibliothèque doit être COMPLÈTE
  là où on la parcourt : chercher « L'homme-dé » et ne pas le trouver dans la
  liste parce qu'il est en haut, c'est un livre manquant.*
- **PLUSIEURS, et non un seul** : `livreEnCours` n'en désigne qu'un — celui de ce
  soir, pour le tableau de bord. Ici on lit vraiment plusieurs livres à la fois,
  et c'est l'état posé qui le dit. Le plus récemment lu passe devant.
- **Ils suivent la recherche et les filtres**, comme le reste : montrer une carte
  qu'on vient d'exclure serait un filtre qui ne filtre pas.
- **ILS PASSENT DEVANT LA BARRE** (correction de Noé, le même jour) : la barre
  est un RÉGLAGE — comment je veux voir mes livres —, les cartes sont ce qu'on
  vient FAIRE. **On ne met pas le mode d'emploi avant l'objet.**

**LA BASCULE ET LA RECHERCHE SE DONNENT LA MÊME HAUTEUR**, elles ne se la
négocient pas (demande de Noé : « aligne étagère/liste avec la barre de
recherche »). Deux essais avant celui-là, et chacun apprend quelque chose :
- `align-items: stretch` fait PIRE — la bascule est un flex dans un flex, ses
  boutons s'étirent avec elle, et la rangée gonflait à 55 px pendant que le champ
  restait à 34 ;
- **l'étiquette qui enveloppait le champ était l'élément de la rangée**, donc
  c'est ELLE qui s'alignait. Le champ est maintenant l'élément lui-même, et son
  nom accessible le nomme.
- **Et le champ portait une marge héritée** : la règle générale des `input` du
  hub pose 15 px sous chacun, faite pour des formulaires empilés. Elle gonflait
  sa boîte à 53 px et posait le cadre sept pixels trop haut, à hauteurs pourtant
  égales. **Une marge héritée d'un autre contexte est une mesure qu'on n'a pas
  choisie.**
- **Le tri : l'état, puis la note, puis le titre.** On cherche rarement un livre
  par sa date de saisie.

**LE THÈME SE LIT SUR LA TUILE ET SUR LA FICHE** (2 septembre 2026, demande de
Noé). Sur la tuile il passe **avant l'état et l'auteur** : c'est ce qui distingue
deux livres qu'on balaie du regard — on cherche « un roman », rarement « un livre
à lire ». **Un seul s'y affiche quand il y en a plusieurs**, avec leur compte
(« Roman +1 ») : la tuile fait 109 px, et deux pastilles y tiendraient à peine
l'une des deux ; le reste se lit sur la fiche, qui les dit tous.
- **Ils ne se règlent PAS sur la fiche**, à la différence de l'état et de la
  note : on change l'état d'un livre à chaque étape de sa lecture, on ne
  reclasse un thème qu'une fois. Sa place est dans la fenêtre de modification,
  avec le titre et l'auteur.

**LE MENU À TROIS POINTS SE VOIT** (même jour, défaut rapporté par Noé : *« les
3 petits points pour modifier ou retirer ne sont pas visibles »*). Les quatre
conteneurs de la bibliothèque manquaient à la liste de ceux qui le révèlent au
survol — le bouton répondait au clic, il était seulement INVISIBLE. **C'est la
seconde fois que ce piège se paie** (la carte d'une habitude, 30 août) : cette
liste ne se devine pas, elle s'allonge.
- **Sur la FICHE il est visible en permanence**, comme sur la carte d'une
  habitude : ailleurs le menu est un geste de second plan ; ici, corriger un
  titre ou un nombre de pages est une des raisons d'y venir.
- **Sur une COUVERTURE il porte un disque sombre** : il est posé sur une image
  dont on ne connaît pas la couleur, et un gris discret disparaît sur un ciel
  clair comme sur une nuit.

### LA FICHE D'UN LIVRE — `#livre/<id>` (2 septembre 2026)

**Demande de Noé** : *« il faut que je puisse cliquer sur chaque livre pour avoir
une fiche avec tous les détails, et où je peux modifier l'état et la note »*.

**C'est le même mouvement que les caps, les projets et les habitudes** : la
galerie compare, la page dit tout. L'étagère ne montre qu'une couverture et un
titre — ce qui se compare d'un livre à l'autre ; le reste vit ici.

**CE QU'ELLE AJOUTE, ET QUI N'EXISTAIT NULLE PART : le JOURNAL DE LECTURE.** Les
séances sont en base depuis le premier jour — ce sont elles qui donnent les pages
lues et le rythme — et **on ne les voyait jamais**. Une lecture, c'est d'abord une
suite de soirs. Une séance s'y **retire** : c'est le seul moyen de corriger un
« +25 » touché deux fois, et le compte se refait tout seul puisque les pages sont
la SOMME des séances.

**L'ÉTAT ET LA NOTE SE RÈGLENT SUR PLACE**, sans ouvrir la fenêtre de
modification : ce sont les deux choses qu'on vient changer, et les enfermer
derrière un formulaire de six champs leur donnerait le coût d'une correction
alors que ce sont des gestes.
- **La pastille d'état est celle d'un PROJET**, au trait près : deux gestes
  identiques ne portent pas deux dessins. Ses couleurs disent une vie de livre —
  gris tant qu'il attend, bleu quand il est ouvert, vert quand il est fini — et
  **le gris revient pour un livre reposé** : « reposé » n'est pas un échec, il ne
  prendra donc jamais une couleur d'alerte.
- **Passer à « lu » écrit une victoire**, parce que c'est `terminerLivre` qui le
  sait — passer par `modifierLivre` la ferait manquer. Et le hub pose les dates
  qu'il peut poser : commencer un livre écrit son `commence_le`, le finir son
  `fini_le`.
- **La même étoile retouchée efface la note** : une note posée par erreur doit
  pouvoir se retirer, et un bouton « enlever la note » coûterait une ligne pour un
  cas rare. **Aucune note n'est basse** — les cinq étoiles portent la même encre,
  seule leur forme change.

**LES PHRASES GARDÉES SE RELISENT TOUTES ICI.** La bibliothèque n'en montrait que
la dernière ; c'est pourtant « ce qui reste d'un livre six mois après, plus que la
note » (règle du 29 août).

**On note ses pages d'ici aussi** : c'est l'écran où l'on regarde son avancée, et
devoir retourner à la bibliothèque pour la faire bouger serait un aller-retour
pour trois secondes de geste.

**NOTER DES PAGES COCHE L'HABITUDE DE LECTURE.** C'est la preuve qu'on a lu :
redemander de cocher « lire un peu » juste après serait demander deux fois la
même chose. L'habitude concernée se DÉCLARE elle-même (`habitudes.automatique`),
donc rien n'est câblé sur un nom — et la colonne accueillera les suivantes.

### Mes journées (29 août 2026)

**La demande** : « un outil qui me permet de faire un bilan quotidien, avec une
page par jour qui est construite et sur laquelle on peut revenir, où l'on voit
l'humeur du jour, les habitudes faites, les tâches, événements… »

**ELLE SE LIT PLUS QU'ELLE NE SE REMPLIT**, et c'est ce qui la rend tenable. Le
hub connaît déjà l'humeur, les tâches terminées avec leur date, les événements,
les victoires, et depuis le même jour les habitudes et les pages lues. Rien
n'est à ressaisir : la page les rassemble, elle ne les redemande pas. **Une
seule chose s'y écrit** — « ce qui a compté » —, parce que c'est la seule à
laquelle le hub ne peut pas répondre à la place de Noé.

**ELLE S'APPELLE « MES JOURNÉES »** (1er septembre 2026, mot choisi par Noé) —
dans son `<h1>`, dans le menu et dans la porte du tableau de bord. Elle disait
« Tes journées » ; c'est la leçon de « Général » et de « Ma semaine », un seul
nom par page.

### SON CALENDRIER (1er septembre 2026)

**La demande** : *« intègre un calendrier en vue mois et semaine où je peux
cliquer sur un jour et voir le détail de chaque jour — habitudes, tâches
terminées, journaling du jour, événements, humeur… »*

**CE QU'IL RÉPARE.** La page n'avait que deux flèches, un jour à la fois : pour
retrouver le mardi d'il y a trois semaines il fallait cliquer vingt fois, et
surtout **on ne voyait pas ce qu'il y avait à retrouver**. Une page qui regarde
en arrière a besoin d'un dessus.

**CE N'EST PAS `construireGrille`, ET C'EST VOULU** : la grille du calendrier
dessine des BARRES — ce qui est posé, ce qui arrive. Ici on ne pose rien, on
CHOISIT un jour ; la case porte donc des **signes** et non des lignes. Deux
besoins, deux dessins.

**Les signes d'une case, et rien de plus** : la **frimousse** de l'humeur quand
elle a été notée — le seul signe qui dise comment la journée a été vécue, et
celui qu'on cherche ; un **point par espace qui a bougé**, la couleur disant
lequel, si bien qu'on lit la forme d'un mois sans lire un mot ; un point creux
de plus si un **mot** a été écrit. **Aucun compte, aucun score** : un jour sans
rien reste une case sobre qui se clique comme les autres.

- **Un jour à venir ne s'ouvre pas** : la flèche du détail refuse déjà le
  lendemain, et une case qui ouvrirait une journée vide dirait la même chose
  autrement. Elle reste dessinée — le mois doit garder sa forme.
- **Changer de mois ne change pas le jour ouvert** : on regarde ailleurs sans
  perdre ce qu'on lisait. C'est ce qui distingue une navigation d'un choix.
- **La bascule Mois / Semaine reprend `.affichages`** (forme montrée par Noé le
  1er septembre 2026), le groupe de boutons du calendrier : une piste arrondie,
  l'actif en pastille pleine et l'encre inversée. C'est le MÊME geste — choisir
  ce que la grille montre —, et « Ma semaine » l'avait déjà repris pour la même
  raison. **Écrire un troisième dessin pour un geste qui en a déjà un, c'est
  fabriquer la divergence qu'on passe ensuite à rattraper.**
- **Le calendrier suit le jour choisi sans sauter pour rien** : il ne se recale
  que si le jour sort de ce qu'il montre.
- **Une requête par table, jamais par jour** : `journeeDe` en coûte sept, un mois
  en aurait coûté deux cents. `resumeDesJournees` lit l'intervalle d'un coup et
  groupe côté client, et les résumés se gardent par intervalle.

**LE DÉTAIL EST UNE TUILE VOLANTE** (même jour, correction de Noé : « ça doit
ouvrir une tuile volante »). Il vivait à demeure sous la grille, et l'un
poussait l'autre hors de l'écran. **Un calendrier sert à CHOISIR ; ce qu'on a
choisi n'a pas à occuper la page en permanence.** Le gabarit est celui de tout le
hub — `.ajout-volant`, son fond assombri, sa croix —, et `app.js` tient déjà ses
trois fermetures. Refermer oublie le jour, sans quoi rouvrir une autre case
rendrait d'abord l'ancienne.

- **`#perso/journee/2026-08-29`** : le jour vit dans l'adresse, donc une journée
  se retrouve et se partage. Les flèches vont d'un jour à l'autre ; celle du
  lendemain se désactive sur aujourd'hui — une flèche qui ne mène nulle part est
  un bouton qui ment.
  - **L'adresse était LUE et jamais ÉCRITE**, et ça se corrige le 1er septembre
    2026 : le routeur posait le jour venu de l'URL, mais ni les flèches ni le
    calendrier ne le réécrivaient — on arrivait sur un jour par un lien, on n'en
    repartait pas avec. `replaceState` et non `location.hash` : celui-ci
    relancerait le routeur pour un jour qu'on vient d'ouvrir, et chaque case
    cliquée empilerait une entrée d'historique. **Et une adresse qui porte un
    jour l'OUVRE** — coller `#perso/journee/2026-08-20` depuis la page changeait
    l'état sans rien redessiner : le lien menait au bon jour et montrait l'autre.
  - **LA TUILE D'UNE JOURNÉE N'EST PAS UNE TUILE D'AJOUT**, et ça se paie cher
    si on l'oublie (1er septembre 2026, défaut rapporté par Noé : « les flèches
    pour changer de jour sont dysfonctionnelles »). Le gestionnaire de clic de
    `#perso` abandonne au premier `.ajout-volant` rencontré — une garde posée
    quand une tuile volante ne contenait qu'un FORMULAIRE, qui se gère par son
    `submit`. Depuis que le détail d'une journée y vit, elle **avalait ses
    flèches ET ses frimousses** : tout ce qui s'y cliquait passait à la trappe,
    sans un mot. La tuile est donc exclue par sa classe, et **ne porte pas
    `data-ajout`** — la branche suivante y aurait vu une demande d'ouvrir un
    formulaire « journee » qui n'existe pas.
  - **`#perso/journee` seul ne montre que son calendrier** et attend qu'on
    choisisse : ouvrir une tuile en arrivant serait une fenêtre que personne n'a
    demandée. **Charger n'est pas ouvrir** — le tableau de bord a besoin de la
    journée d'aujourd'hui, c'est de là que vient le mot du jour.
- **Une seule table, `journees`** (jour, mot). Tout le reste se déduit.
- **L'ÉCRITURE EST L'ÉLÉMENT PRINCIPAL, ET LE RELEVÉ SE REPLIE** (1er septembre
  2026, demande de Noé : *« l'espace pour écrire du texte doit être plus grand,
  et pouvoir conserver un texte long, ça doit être l'élément principal de la
  page ; les autres — habitudes, tâches… — sont des détails qui doivent
  s'afficher en haut, et qu'on peut masquer si envie »*).
  **Ce que ça renverse** : l'écriture FERMAIT la page, après six blocs de
  relevés. Elle était donc la dernière chose qu'on voyait, alors que c'est la
  **seule que le hub ne puisse pas remplir à la place de Noé** — tout le reste,
  il le sait déjà. Le rang disait l'inverse de la règle de la page.
  - **La colonne n'a jamais eu de limite** (`journees.mot` est du texte libre, et
    l'écriture l'envoie entière) : ce qui bridait, c'était le CHAMP — deux
    lignes, et une invite qui disait « une ligne, si tu veux ». **On n'écrit pas
    un bilan dans un champ qui annonce qu'il n'en attend pas.** Il fait
    maintenant 16 rem de haut au minimum, en corps de texte courant.
  - **Un `details` natif, ouvert par défaut** : le repli est un geste rare et
    n'a pas besoin d'un état à tenir — la tuile se redessine à l'ouverture d'un
    jour, pas pendant qu'on la lit.
  - **UNE ICÔNE, SANS LIBELLÉ NI FLÈCHE** (1er septembre 2026, demande de Noé).
    « Ce que dit la journée » nommait un tiroir dont le contenu se voit dès
    qu'il est ouvert — et il l'est par défaut. L'icône dit « il y a un relevé
    ici » sans occuper une ligne de titre, et son nom accessible garde la
    phrase. La flèche disait le sens du geste ; **l'icône s'ALLUME quand le
    tiroir est ouvert**, ce qui le dit aussi bien avec un signe de moins.
  - **LES HABITUDES SONT SORTIES DU REPLI** (même demande : « elles apparaissent
    constamment sur la page »), et c'est la bonne place : **le repli contient ce
    que le hub RELÈVE — des faits déjà écrits ailleurs, qu'on regarde ; les
    habitudes sont la seule chose de ce bloc qu'on vient COCHER.** Les ranger
    avec ce qui se lit, c'était demander un geste avant d'ouvrir un tiroir.
    **Sans titre** (1er septembre 2026) : neuf pastilles qui se cochent n'ont pas
    besoin qu'on annonce que ce sont des habitudes — c'est le quatrième titre qui
    tombe dans cette tuile, et pour la même raison. **Ce qui se montre n'a pas à
    se nommer.**
  - **UN FILET SOUS LA LIGNE DU JOUR** (même jour, demande de Noé). Le jour et sa
    note sont l'EN-TÊTE de la tuile ; tout ce qui suit est le contenu de cette
    journée-là. Le filet dit cette coupure d'un trait, là où un blanc plus large
    la laissait deviner. Il reprend `--bordure-douce`, celui du relevé juste en
    dessous : **deux filets dans la même tuile ne peuvent pas avoir deux
    forces.**
  - **LA NOTE DU JOUR EST SUR LA LIGNE DU JOUR** (même demande). Elle a eu sa
    ligne, puis son bloc : deux rangs pour cinq frimousses. **Le jour et la note
    qu'on lui donne sont la même information** — quel jour, et comment il était —
    et ils se lisent ensemble. Ça rend une ligne entière au journal.
  - **AUCUN TITRE AU-DESSUS DES TROIS CHAMPS** (1er septembre 2026, demande de
    Noé). La note du jour, la gratitude et le journal n'annoncent plus ce qu'ils
    sont : cinq frimousses en haut d'une journée ne demandent pas qu'on explique
    ce qu'elles sont, et un libellé au-dessus d'une invite qui dit la même chose
    ne dit rien de plus — il coûtait une ligne à chacun des deux champs. **C'est
    l'invite qui reste**, dans le champ, à l'endroit exact où l'on va écrire :
    « Une chose dont je suis reconnaissant », « Ma journée en quelques mots ».
    - **`aria-label` prend le relais, et ce n'est pas optionnel** : le libellé
      était le nom accessible du champ, et une invite disparaît dès qu'on tape.
      Sans lui, un lecteur d'écran annoncerait deux zones de texte anonymes.
  - **PAS DE RECTANGLE AUTOUR DU JOURNAL** (1er septembre 2026, demande de Noé,
    référence à l'appui : « pas de rectangle visible dans lequel mettre le
    texte »). **Un champ encadré dit « remplis ce formulaire »** ; on n'écrit pas
    sa journée dans un formulaire. Le `textarea` reste — donc tout ce qu'un champ
    sait faire —, il n'en porte plus l'habit : ni fond, ni contour, le texte posé
    comme dans un carnet. **Le focus ne disparaît pas pour autant** : il se dit
    par un filet à gauche, la marge d'un cahier, parce que le hub ne supprime
    jamais l'anneau de focus.
  - **La tuile passe à 56 rem** : 34 est la mesure d'un FORMULAIRE, six champs
    l'un sous l'autre. Ici c'est un carnet, et un texte qui se replie tous les
    huit mots ne se lit pas. *Elle est passée par 44 rem une heure plus tôt ;
    c'est la mise en colonnes du relevé qui a demandé les douze de plus — à
    44 rem, chaque colonne tombait sous 20 rem et les titres de tâches s'y
    repliaient mot à mot.*
  - **LES HABITUDES SE COCHENT ET SE DÉCOCHENT** (1er septembre 2026, demande de
    Noé : « lorsque je fais mon bilan du jour je puisse également noter les
    habitudes que j'ai faites ou non aujourd'hui »). Le bloc ne montrait que les
    habitudes DÉJÀ cochées, en pastilles muettes : il disait ce qui avait été
    fait sans permettre de le corriger, et surtout **il ne disait rien de ce qui
    restait**. On ne fait pas un bilan sur une liste qui cache la moitié de ses
    lignes. Toutes y sont maintenant, et **la coche vaut pour CE jour-là** — le
    bouton porte sa date, donc on rattrape hier sans mentir sur aujourd'hui.
    *Vérifié : cocher depuis le 11 août écrit au 11 août, et décocher retire la
    ligne.* Les faits viennent d'`etat.faits`, la MÊME source que la page des
    habitudes — deux sources pour une coche se contredisent au premier clic.
    - **ELLES SONT UNE LIGNE, AU-DESSUS DES COLONNES** (1er septembre 2026,
      demande de Noé : « les habitudes ne doivent pas être dans le même bloc de
      colonnes que les tâches, événements et publications »). Et c'est plus
      juste : **les habitudes sont une CHECK-LIST qu'on parcourt en entier, les
      autres blocs des RELEVÉS qu'on lit**. Deux natures, deux mises en page — la
      ligne prend la largeur dont ses neuf pastilles ont besoin, les colonnes se
      partagent le reste. *Elles ont eu leur propre colonne pendant une heure :
      elle bridait la largeur des pastilles à la moitié de la tuile, pour rien.*
    - **LES FAITES D'ABORD, ET LE TRI EST DYNAMIQUE** (même jour) : décocher une
      habitude la renvoie à la fin, avec celles qui n'ont pas été faites. Un tri
      figé au rendu — essayé une heure — laissait une pastille « faite » en tête
      alors qu'elle ne l'était plus, ce qui est pire que de perdre sa place. Le
      tri est **stable** : deux habitudes faites gardent l'ordre où Noé les a
      posées. **Seul le bandeau se redessine**, jamais la tuile.
    - **DU VERT, SANS CONTOUR** (même jour) : `--famille-corps` à 30 %, LE vert
      du hub — celui de la famille « corps » et de la coche d'une tâche terminée
      juste à côté. Un second vert dans la même tuile ferait deux verts. Il ne
      juge rien : il dit « tenu », pas « bien ». *Ce que ça remplace :
      `--accent-doux`, un fond de SECTION — un violet presque noir fait pour
      passer sous du texte, qui sur une pastille de 24 px ne se distinguait
      quasiment pas du fond.* **Pas de filet** : une pastille se distingue par sa
      surface, comme les tuiles depuis le 30 août, et neuf filets sur une ligne
      la quadrillent.
  - **LES TÂCHES ET LES ÉVÉNEMENTS SONT DES LIGNES, PAS DES TUILES** (même
    demande : « ils doivent prendre moins de place »). Chaque ligne était une
    carte — `.bloc li` habille toutes les listes du hub, et la règle « une tuile
    dans une tuile porte un filet » lui en remettait un. Cinq tâches faisaient
    cinq cartes empilées dans un relevé qu'on ne fait que PARCOURIR.
  - **LE RELEVÉ EST EN DEUX COLONNES** (1er septembre 2026, demande de Noé :
    « organisé en plusieurs colonnes pour que ça prenne moins de place en
    longueur et que ce soit plus lisible »). Six blocs empilés faisaient une page
    à eux seuls et repoussaient l'écriture sous la ligne de flottaison. Ce sont
    des RELEVÉS — de courtes listes qu'on parcourt du regard, exactement ce qui
    se met côte à côte. Une seule colonne sur téléphone.
    - **Un flux `columns`, une fois les habitudes sorties** : le nombre de blocs
      varie d'un jour à l'autre — une journée sans lecture ni victoire n'en a que
      deux —, et un flux se remplit de lui-même là où une grille laisserait des
      cases vides. Le reproche qu'on lui faisait quand il portait AUSSI les
      habitudes — c'est la hauteur du contenu qui décide de ce qui bascule à
      droite — n'a plus d'objet : il n'a plus à garantir la place d'un bloc en
      particulier.

**LA NOTE DE LA JOURNÉE OUVRE LA TUILE** (1er septembre 2026, demande de Noé :
*« il manque l'humeur du jour, et cette humeur doit être notée en fin de journée
plutôt qu'au début — une note de la journée en quelque sorte »*, puis, une heure
plus tard : *« la note du jour doit être en haut »*).

**CE QUI CHANGE, C'EST LA QUESTION, PAS LE RANG.** Une humeur demandée le matin
dit comment on se réveille ; posée dans la tuile d'une journée qu'on est en train
de relire, elle la RÉSUME. Le même chiffre, une autre question. Elle a fermé la
tuile pendant une heure, au motif que « en fin de journée » voulait dire « en bas
de la page » — c'était confondre le moment et l'endroit : **on ne fait pas
défiler une page entière pour répondre d'un doigt**, et on répond du même endroit
qu'on relit.

- **Elle remplace une ligne muette** : l'humeur se LISAIT dans le relevé sans
  pouvoir s'y écrire, alors que c'est le seul relevé de la tuile que Noé pose
  lui-même. Tout le reste, le hub le sait déjà.
- **LE JOUR EST PORTÉ PAR CHAQUE BOUTON**, et c'est ce qui permet de noter une
  journée passée : `enregistrerHumeur` prenait déjà une date, seul l'écran ne
  savait parler que d'aujourd'hui. *Sans ça, noter hier soir écrivait sur la
  date du jour — un défaut qui ne se voit qu'en relisant la courbe. Vérifié :
  noter le 31 août n'a créé aucune ligne au 1er septembre.*
- **Seule la note se redessine, pas la tuile** : le journal vient peut-être de
  s'enregistrer sur son `blur`, et l'écriture est encore en vol — redessiner
  remettrait le texte d'avant dans le champ. Même précaution pour les habitudes.
- **La frimousse choisie ne se dit pas par une couleur** — le hub n'en a pas pour
  juger une journée — mais par un fond doux et sa pleine opacité, les autres
  s'effaçant. **Aucune note n'est « mauvaise »** : les cinq restent offertes, et
  rien ne relance un jour sans réponse.

**UNE CHOSE DONT JE SUIS RECONNAISSANT** (1er septembre 2026, demande de Noé :
« un espace je suis reconnaissant de… comme sur l'exemple »), colonne
`journees.gratitude`.

**POURQUOI UNE COLONNE À PART et non une ligne de plus dans `mot`** : ce ne sont
pas deux façons d'écrire la même chose. `mot` est libre — ce qu'on veut garder du
jour, long ou court, ou rien. La gratitude est une **question posée**, toujours la
même, à laquelle on répond en une phrase. Les mêler rendrait impossible de les
relire séparément, et c'est justement ce qu'on voudra faire un jour : remonter
une année de gratitudes est une chose, relire une année de journal en est une
autre.

- **Elle vient AVANT le journal**, comme dans l'exemple : on répond mieux à une
  question précise avant d'avoir écrit dix lignes.
- **Elle GARDE son cadre**, à la différence du journal : c'est une case à
  remplir, et une case doit se voir. Un aplat chaud plutôt qu'un contour — le
  doré de Yuno à 12 %, la dose des tuiles de `#objectifs` : à ce niveau la teinte
  ne se nomme pas, elle se sent. C'est le seul endroit du hub qui **invite** au
  lieu de ranger.
- **Elle reste facultative**, comme le mot : pas de relance, pas de jours
  manqués comptés, pas de série. C'est la règle de tout l'espace perso.
- **Un seul chemin d'écriture pour les deux** (`noterLaJournee(jour, colonne,
  valeur)`), et l'upsert ne pose QUE la colonne donnée : répondre à l'une
  n'efface pas l'autre. Deux fonctions jumelles auraient fini par diverger sur
  le `onConflict`, et ça ne se voit qu'une fois qu'un des deux champs a cessé de
  s'enregistrer.
- **Le mot s'enregistre quand on quitte le champ**, sans bouton : c'est une
  ligne qu'on écrit en passant, et lui demander un geste de plus la ferait ne
  jamais s'écrire.
- **Les journées se gardent en mémoire** une fois lues : on remonte souvent
  plusieurs jours d'affilée, et chaque aller-retour coûterait sept requêtes.
- **Les victoires nées d'une tâche ne s'y répètent pas.** Elles sont déjà dans
  « Terminé », mot pour mot — restent celles qui disent autre chose : un jalon,
  une étape, un palier d'habitude, une victoire écrite à la main.
- **Aucun compte, aucun total, aucune comparaison avec hier.** Une journée n'a
  pas de score : elle a eu lieu. Et un jour vide le dit sans reproche — « rien
  de noté ce jour-là, ça arrive, et ce n'est pas grave ».

**LA RELECTURE ferme la page** (la seule des trois idées du 29 août que Noé ait
retenue). Le hub remontre une victoire d'il y a un mois, trois, six ou un an —
sinon une intention. **Elle ne tire pas au sort** : un choix aléatoire changerait
à chaque rendu, et une phrase qui bouge pendant qu'on la lit ne se lit pas. Le
jour détermine le choix (`relecture`, js/orientation.js).

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
- `echeance` date — **exigée par le formulaire depuis le 30 août 2026** (décision de Noé). La colonne reste nullable, et les lignes anciennes sans date restent lisibles ; mais on n'en pose plus. Un cap sans date n'est pas un cap : c'est une intention, et les intentions ont leur page dans perso, où justement rien ne se mesure. Un JALON, lui, garde son échéance facultative — il découpe un objectif qui porte déjà la date.
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
  - **DEUX LISTES DE RACCOURCIS, ET C'EST VOULU** (`DUREES_PROPOSEES` et `DUREES_FAITES`, js/format.js) : ce sont deux questions différentes. À la capture on RÉSERVE un créneau — de 1 h à 3 h, et l'on ne se réserve pas cinq minutes dans une journée. Au moment de COCHER on dit ce qui a été fait : **5 min · 30 min · 1 h · 2 h · 3 h** depuis le 2 septembre 2026 (demande de Noé). Le pas court manquait — un message envoyé, une relance, une case administrative ne durent pas une demi-heure, et sans lui ces tâches-là repartaient **sans durée**, ce que la première ligne de `#temps` compte déjà. « 1 h 30 » cède la place parce que cinq propositions tiennent sur une ligne et six non : c'est le pas dont l'absence coûte le moins — il tombe pile entre deux voisins qui restent, et il se tape toujours à la main.
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
- `temps_fort` boolean NOT NULL default false — **ce rassemblement est un temps fort du club** (30 août 2026) : tournoi, loto, goûter, journée du club. Une DÉCLARATION, faite à la pastille « Temps fort » de la tuile de capture, comme `reunion_objet` et `avec_photos` — et il a fallu la mesurer pour s'en convaincre : les sept événements FCH à venir ce jour-là, trois entraînements et trois temps forts compris, étaient **indistinguables en base**. Ni série, ni photos, ni créneau ne les séparaient ; ne restait que le titre. **FCH seulement.** L'accueil du site l'annonce cinq semaines avant (`blocTempsFort`, js/hermitage.js).
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

**Il ouvre le dimanche à 20 h et reste jusqu'à la fin du lundi**, ou jusqu'à ce qu'il soit validé (choix de Noé). Passé ce délai il se tait : le hub ne relance pas et ne compte pas les rendez-vous manqués. **Depuis le 30 août 2026, l'accueil n'en porte plus qu'une PORTE** — un bandeau à une seule sortie, dans la même fenêtre horaire ; le rendez-vous lui-même vit sur `#semaine`.

**LA LIGNE VALIDÉE EST CELLE DE LA SEMAINE QUI VIENT, et c'était un défaut** (corrigé le 30 août 2026). `semaineDe(maintenant)` rend « la semaine où l'on est » : le dimanche à 20 h, celle qui s'achève. On validait donc le lundi PASSÉ, et le rendez-vous revenait le lendemain matin comme s'il ne s'était rien dit. `pivotDeLaSemaine` (js/orientation.js) fait la bascule : le dimanche, la semaine qui vient commence demain.

**DES CARTES, PAS DES PARAGRAPHES** (31 août 2026, Noé : *« leur forme est
catastrophique, elles prennent trop de place, il n'y a rien de visuel qui
permette de comprendre sans lire — quel espace, quelle info importante »*).
Chaque constat tient en **deux lignes**, dans une grille qui se remplit d'elle-même
— quatre colonnes sur un écran de 1500 px, une sur un téléphone :

    ▌ 16 h 30 / 26 h          →
      Le club, 3 séances

- le **bord gauche** porte la couleur de l'espace — la grammaire d'une tâche au
  calendrier ;
- le **chiffre** est ce qu'on vient chercher : en Geist Mono, dans la couleur de
  son espace ;
- le **mot** dit de quoi il s'agit en trois mots, jamais en trois phrases.

**Le constat complet n'est pas perdu, il est DÉPLACÉ** : la phrase entière, sa
précision et son « d'après » passent dans le `title` et le nom accessible. C'est
la parade déjà employée sur la ligne d'une habitude — un écran qu'on ouvre chaque
dimanche n'a pas besoin qu'on lui réexplique ses propres chiffres.

**Toute la carte porte le geste**, et c'est ce qui fait tenir les deux lignes :
un libellé de bouton (« Bloquer un créneau ») coûtait une troisième ligne à lui
seul. *Mesuré : 7 constats en 131 px, contre une colonne de paragraphes qui
repoussait la grille hors de l'écran.*

**Aucun constat sans proposition, sans exception** (`js/rendez-vous.js`) : chaque ligne porte son geste — une proposition ouvre la tuile de capture déjà remplie, ou mène à l'écran où le réglage se fait. Une ligne sans porte de sortie est un reproche déguisé.

### UNE PHRASE, ET LE DÉTAIL AU CLIC (1er septembre 2026)

**La demande de Noé** : *« je n'aime pas la forme des propositions, on ne comprend
pas vraiment ce que ça veut dire ; il ne faut pas avoir un titre et un petit
descriptif, plutôt une petite phrase, et quand on clique dessus on voit un détail
de la proposition avec l'action proposée associée. »* Puis, dans la foulée :
*« trie par espace, des phrases plus courtes, on voit l'explication — une phrase
plus longue — en appuyant dessus. »*

> *Ce que ça renverse.* Depuis le 31 août, la carte tenait en deux lignes : un
> chiffre en gros, trois mots dessous. **La forme était juste sur un point — elle
> se comprenait d'un REGARD.** Mais un regard ne dit pas ce qu'il faut en faire :
> « 2 · moments sans famille » ne veut rien dire pour qui ne connaît pas déjà la
> règle des familles, et le constat qui l'explique était rangé dans un `title`
> que personne n'ouvre. **On avait déplacé le sens jusqu'à le perdre.**

**DEUX TEXTES, ET PAS UN** : `court` sur la carte, `constat` dans le détail. Le
premier tient sur une ligne (« 3 sorties, 1 tri posé. »), le second explique
(« 3 sorties terrain d'ici deux semaines, et seulement 1 tri posé. »). Chaque
ligne du rendez-vous porte les deux, y compris les inférences —
`orientation.js` les écrit toutes les deux.

**LE DÉTAIL DIT CE QUE LA CARTE NE DIT PLUS**, dans cet ordre : le constat
entier, ce qu'il implique, **d'où il sort**, puis l'action. Le « d'après » n'est
pas de la coquetterie : c'est ce qui rend le constat vérifiable — un hub qui
affirme sans dire d'où il tient ce qu'il affirme finit par être cru, ou ignoré,
et aucun des deux ne vaut mieux que l'autre.

**ACCEPTER COÛTE UN GESTE DE PLUS**, et c'est le prix assumé de la demande. La
règle ne bouge pas d'un pouce, elle change d'endroit : le geste n'est plus la
carte, il est **le bouton du détail**, où on le lit en toutes lettres au lieu de
le deviner derrière une flèche.

**TRIÉES PAR ESPACE** — l'ordre des journées de Noé, celui de la galerie des caps
et du calendrier (`rangDEspace`). Sans lui, les lignes sortaient dans l'ordre où
le diagnostic les avait trouvées. **Un ordre qui ne veut rien dire est un ordre
qu'on relit à chaque fois** ; avec, la liste se lit par blocs. Le tri est
**stable** : à espace égal, la charge reste avant la formation et le plancher
perso avant ses inférences — on range les espaces sans mélanger ce qu'ils
contiennent.

**ELLES PRENNENT MOINS DE PLACE, ET LA GRILLE EXISTE ENFIN** (même jour,
première demande de Noé). `.rdv-cartes` posait `display: grid` et
`grid-template-columns` **sans effet depuis le 31 août** : `.bloc ul` met toutes
les listes du hub en flex-colonne et pèse une balise de plus. Les sept constats
s'empilaient donc en pleine largeur — *468 px de haut là où trois colonnes en
font 165* —, et ils repoussaient hors de l'écran la grille qu'ils sont là pour
éclairer, c'est-à-dire exactement ce que la refonte du 31 août prétendait
corriger. **Une spécificité qu'on n'égale pas est une règle qu'on n'écrit pas** —
c'est le quatrième piège de ce type payé sur cette page.
- **La phrase est en Google Sans** (demande de Noé), **trois lignes au plus**.
  Ce qui dépasse s'arrête à l'ellipse et attend dans le détail — ce n'est plus
  un `title` qu'on n'ouvre jamais, c'est un écran.
- **TOUTES LES TUILES ONT LA MÊME TAILLE** (1er septembre 2026, demande de Noé),
  et il a fallu **deux** réglages, pas un :
  - `grid-auto-rows: 1fr` — une grille donne à chaque RANG la hauteur de sa
    carte la plus haute, et deux rangs voisins tombaient à 32 et 49 px ;
  - **`align-items: stretch`, qui SE REDIT** — une règle plus générale pose
    `start` sur les listes du hub. Le rang faisait bien 65 px, mais les cartes
    s'y calaient en haut, chacune à sa propre hauteur. *Le rang était juste,
    l'alignement non*, et c'est ce que Noé voyait encore sur grand écran. Ce
    qu'on ne redit pas reste : cinquième fois sur cette page.
- **`auto-fit` ET NON `auto-fill`, ET 18 REM** (1er septembre 2026, Noé : « cette
  page doit être optimisée pour un affichage ordinateur »). **`auto-fill`
  FABRIQUE des colonnes vides** : à 1920 px il en posait NEUF pour sept cartes,
  chacune tenait dans 196 px, ses phrases se repliaient sur trois lignes — et
  deux colonnes de vide restaient à droite. `auto-fit` replie les pistes que
  personne n'occupe et rend leur largeur aux autres.
  *Mesuré à 1920 px : six colonnes de 297 px, toutes les cartes à 49 px, et le
  bloc tombe de 212 px à 106. Quatre colonnes à 1440 et 1200, trois à 1000, deux
  à 800, une sur un téléphone — la même taille partout, à chaque largeur.*

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

**LE LIEN SE POSE DEPUIS LA TUILE DU PROJET** (30 août 2026, demande de Noé) — une **pastille « Objectifs servis »**, juste après celle de l'espace, où l'on en coche un ou plusieurs. Elle existe à la création comme à la modification.
- *Ce qu'elle répare* : le lien existait en base depuis le 27 août et ne se posait QUE d'un endroit — poser un projet **depuis un cap déjà ouvert**. Un projet créé depuis la galerie ne pouvait donc plus jamais être rattaché, et six des dix projets de Noé ne servaient aucun cap.
- **Le panneau ne se referme pas** entre deux options : un menu qui se referme à chaque coche obligerait à le rouvrir autant de fois qu'on veut de liens. C'est le seul choix du hub qui se comporte ainsi (`type: 'choix-multiple'`, js/gabarits.js).
- **La pastille dit LEQUEL quand il n'y en a qu'un**, et les compte au-delà (« 2 objectifs ») : trois titres d'objectifs dans une pastille feraient une phrase. Chaque option porte la **pastille de son espace**.
- **Elle N'OFFRE QUE LES OBJECTIFS DE L'ESPACE CHOISI** (demande de Noé) : un projet du club ne sert pas un cap de la formation. Changer la pastille d'espace **refiltre le menu ET DÉCOCHE ce qui vient d'en sortir** — un lien coché qu'on ne voit plus s'enregistrerait sans que personne l'ait voulu. C'est la règle de la tuile de capture, où « un projet devenu incohérent s'efface ». Un espace sans objectif le dit (« Aucun dans cet espace ») : un panneau vide se lit comme une panne.
  - C'est **la seule dépendance entre deux champs d'un formulaire**, d'où un branchement nommé dans `poserLeChoix` plutôt qu'un mécanisme général : un formulaire n'a pas de dépendances, il en a UNE.
- **L'icône est une CIBLE**, pas un maillon de chaîne : un projet *vise* un cap — le mot du hub pour ce qu'on vise — et le dessin doit le dire.
- **L'enregistrement ACCORDE, il ne réécrit pas** (`accorderLesCibles`, js/objectifs.js) : il retire ce qui a été décoché, ajoute ce qui a été coché, et laisse le reste tranquille. **Les liens vers un JALON ne sont jamais touchés** — la pastille ne parle que des objectifs, et effacer ce qu'un écran n'offre pas serait le pire des défauts : invisible au moment où il se produit.

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
- `echeance` date (nullable) — **le jour où l'on compte s'y mettre** (2 septembre 2026)
- `atteint` boolean NOT NULL default false · `date_atteint` date · `created_at` timestamptz

**ELLE PORTE UN JOUR DEPUIS LE 2 SEPTEMBRE 2026** (décision de Noé), et c'est un
renversement qu'il faut dire. Elle n'en avait pas — *« une étape découpe le
TRAVAIL, pas le calendrier ; ce sont les tâches qui portent les dates »* —, et
c'était sa différence avec un jalon. La page d'un projet demande de poser ses
étapes sur un calendrier en les glissant : l'autre réponse possible était de
fabriquer une tâche au passage, et Noé a préféré que **ce qu'on glisse soit ce
qu'on retrouve**.
- Elle reste **facultative** : un découpage sans jour est un découpage, pas un
  retard.
- Elle ne gagne **ni durée, ni heure, ni statut** — une étape se franchit, elle
  ne s'occupe pas.
- Elle n'a d'échéance qu'ici : **`#objectifs` ne la demande plus du tout**, la
  machinerie des étapes ayant suivi la page du projet.

**Pas de durée ni d'heure, à la différence d'une tâche** : une étape marque un
passage, elle n'occupe pas de créneau.

### L'ORDRE EST CHRONOLOGIQUE (2 septembre 2026)

**Demande de Noé** : *« pour les jalons et étapes des projets et objectifs, il
faut qu'ils soient dans l'ordre chronologique, donc que leur position s'adapte en
fonction de la date qui leur est attribuée »*.

**Ce que ça répare** : un jalon glissé au calendrier sur une date plus lointaine
que son voisin restait devant lui dans la frise. **Les deux moitiés de la même
page se contredisaient** — le calendrier disait une chose, la colonne d'à côté
une autre.

**SEULES LES MARCHES DATÉES BOUGENT, ET SEULEMENT LES UNES PAR RAPPORT AUX
AUTRES** (`rangerParEcheance`, js/format.js) : elles se rangent dans les PLACES
qu'elles occupaient déjà ; ce qui n'a pas de date ne bouge pas d'un rang.

> *Le tri global par date était le premier réflexe, et il est faux ici.* **Un
> découpage n'est pas une galerie, c'est un CHEMIN.** Mesuré sur les données de
> Noé : « Laisser une com qui tourne sans moi » porte cinq jalons sans date puis
> un daté au 15 décembre, qui en est la CONCLUSION. Un tri « datés d'abord,
> indatés ensuite » l'aurait mis **en tête** — l'arrivée avant le départ. La
> convention « ce qui n'a pas de date ferme la marche » vaut pour des tuiles
> qu'on COMPARE, pas pour une suite qu'on LIT.

- **`ordre` garde le squelette**, la date range ce qui, dedans, se compare.
- **Le tri est stable** : deux marches du même jour gardent l'ordre où Noé les a
  posées.
- **La liste est prise telle quelle, jamais retriée par `ordre`** : après un
  déplacement à la main, le tableau porte déjà le bon ordre et la colonne ne le
  rattrapera qu'à l'aller-retour suivant. La retrier ferait sauter la ligne en
  arrière sous les yeux.
- **DEUX MARCHES DATÉES NE S'ÉCHANGENT PLUS À LA MAIN** : « Monter » et
  « Descendre » disparaissent entre deux voisines qui portent toutes deux un
  jour — c'est leur date qui les range, et le rendu suivant les remettrait où
  elles étaient. **Un bouton dont l'effet s'annule tout seul est un bouton qui
  ment.** Pour changer leur ordre, on change une date, d'un glissement sur le
  calendrier d'à côté.
- **On déplace dans l'ordre AFFICHÉ**, pas dans celui du tableau : les deux ne
  coïncident plus, et « Monter » aurait échangé la marche avec une voisine que
  Noé ne voit pas à côté d'elle.

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
- **LES JALONS D'UN CAP ONT LE MÊME GESTE**, le même menu et la même écriture
  optimiste : les deux étages portent la même colonne `ordre`. Ils ne partagent
  plus la même fonction depuis le 2 septembre 2026 — chacun se réordonne sur sa
  page, `#objectif/<id>` et `#projet/<id>`. Ce qui reste commun est ce qui compte : `reordonnerJalons` et
  `reordonnerEtapes` (js/api.js) renumérotent de la même façon. C'est le genre
  d'écart qu'on ne voit qu'une
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
2. **La porte du dimanche** — conditionnelle, dans sa fenêtre (dimanche à
   partir de 20 h, et le lundi) et tant que la semaine n'est pas validée. **Un
   bouton, et rien d'autre** : « Programmer ma semaine », en pastille d'accent,
   qui mène à `#semaine`. Elle ne dit aucun constat, et c'est le point — un
   constat sur l'accueil appellerait un geste que l'accueil ne peut pas offrir,
   poser une tâche sur un jour.
   *Ce que ça remplace, le même jour :* un bandeau complet — titre « Ta semaine
   qui vient », intervalle de dates, phrase expliquant ce qu'il y avait
   derrière, puis le bouton. Trois lignes au-dessus de la journée pour un seul
   geste (correction de Noé). Le nom du bouton dit ce que la phrase disait, et
   les dates s'écrivent en tête de la page qui s'ouvre.
3. **La porte du soir** — conditionnelle, **tous les jours à partir de 20 h**
   (1er septembre 2026, demande de Noé). Un bouton, « Faire le bilan du jour »,
   qui mène à `#perso/journee/<aujourd'hui>`.
   - **La même heure que le rendez-vous du dimanche**, et ce n'est pas un
     hasard : c'est l'heure où la journée est finie. Un seul nombre pour les deux
     portes — deux heures d'ouverture finiraient par se contredire, et rien ne
     justifie qu'un dimanche soir commence plus tôt qu'un mardi.
   - **Pas de borne haute** : elle reste jusqu'à minuit, puis la journée change
     et c'est celle du lendemain qu'elle ouvrira. Le rendez-vous du dimanche
     déborde sur le lundi parce qu'une semaine se programme encore le lendemain
     matin ; un bilan du jour, non.
   - **Elle mène au jour NOMMÉ**, pas à `#perso/journee` : l'adresse porte la
     date, si bien qu'ouvrir la porte à 23 h 50 et écrire à 00 h 05 écrit
     toujours dans la journée qu'on est en train de fermer.
   - **Elle s'efface dès que le bilan est écrit** — le journal ou la gratitude,
     pas la note du jour : celle-ci se répond d'un doigt depuis trois écrans, et
     l'atteindre ne veut pas dire qu'on a fait son bilan. **Une seule requête**,
     et seulement dans sa fenêtre : le reste du temps elle ne demande rien.
   - **Elle porte la couleur du perso** (`data-espace="perso"`, jamais un code
     écrit dans la feuille) : le dimanche soir les deux portes coexistent, et
     deux boutons identiques ne se distingueraient que par leur libellé.
4. **Le bandeau de l'après** — conditionnel, **un seul à la fois, le plus
   récent** : un bilan s'écrit à chaud (`js/hermitage.js` le dit depuis le
   21 août). Deux natures seulement — une sortie Yuno hors carnet, une réunion
   FCH sans bilan. Trois portes : y aller, « pas maintenant » (revient demain),
   la croix (jamais). **Jamais de ligne perso** : un rendez-vous avec soi ne
   doit ni bilan ni tri. Il remonte à **quinze jours** au plus — au-delà, un
   bilan qu'on n'a pas écrit ne s'écrira pas, et le redemander devient un
   reproche. **La porte du dimanche passe devant, et elle le fait vraiment
   depuis le 30 août** : la règle était écrite depuis le 29 et le code ne la
   tenait pas — les deux bandeaux pouvaient s'empiler, ce qui fait deux
   interruptions. Le bilan qu'on ne réclame pas ce soir revient demain.
5. **Les habitudes ont QUITTÉ l'accueil** (30 août 2026, décision de Noé le
   soir même où elles y étaient arrivées). Elles vivent dans perso, seul écran
   qui les montre — voir « Les habitudes » plus haut. L'accueil porte ce qui est
   POSÉ ; une habitude n'est posée nulle part, elle revient.
6. **Aujourd'hui, dans une TUILE** — **et toute la tuile mène à `#taches`**
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
7. **Ta semaine** — la grille du calendrier, **CINQ ÉLÉMENTS AU PLUS PAR JOUR**
   (30 août 2026, demande de Noé), **jours passés estompés** (0,42) et
   **titres sur deux lignes** avec points de suspension.
   - Le plafond est un réglage de l'APPELANT (`maxParJour`), pas de la vue : au
     delà de cinq lignes, une journée chargée écrase les six autres et la grille
     cesse de se lire d'un coup d'œil. **Le calendrier plein écran continue de
     tout montrer** — on y va pour voir, pas pour jeter un œil.
   - **Le « +N » ouvre le jour**, comme celui de la vue mois : un compte qui
     annonce une information et refuse de la donner serait pire que pas de
     compte du tout.
   - **ET LA SEMAINE RACCOURCIT D'AUTANT** (remarque de Noé) : le plancher de
     20 rem de `.cal-ligne` datait du temps où la grille montrait tout, et il ne
     produisait plus que du vide — 133 px sous la dernière pile, mesurés. Sur
     l'accueil il tombe à 11 rem, assez pour qu'une semaine vide reste une
     surface où l'on glisse ; au-delà, c'est le contenu qui décide. **332 px →
     201.** La règle est portée par `#bloc-semaine` : le calendrier plein écran
     garde ses 20 rem, il ne plafonne rien et sa grille doit rester une surface
     où l'on pose.
   - **LE JOUR OUVERT SEUL N'A PAS DE LIMITE** — il affiche tout, et le « +N »
     s'efface. Ce n'est PAS réglé en JavaScript, et la raison est mécanique :
     ouvrir un jour **ne redessine pas la grille**, il n'en change que les
     largeurs de colonnes, pour que le navigateur anime le passage. Un
     `innerHTML` à ce moment-là couperait l'animation net. **Tout est donc posé
     dans le DOM dès le départ**, et deux règles CSS décident de ce qu'on en
     voit (`.cal-au-dela`). Vérifié : 5 visibles en semaine, 10 une fois le jour
     ouvert. Rien n'est effacé : le
   hub ne compte pas les retards, mais il ne les cache pas non plus.
8. **Projets en cours**, en colonne de droite — voir plus bas.

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

## La page d'une habitude — `#habitude/<id>` (2 septembre 2026)

**La demande de Noé** : *« chaque habitude doit avoir une page dédiée également,
avec toutes les stats intéressantes et les détails (dont depuis quand je l'ai
ajoutée/commencée) + un calendrier qui permet de voir quand l'habitude a été
faite ou non (vue mois, 3 mois). »*

**C'EST LE MÊME MOUVEMENT QUE LES CAPS ET LES PROJETS** — la galerie compare, la
page dit tout — **mais la NATURE de ce qu'on regarde change tout le reste** : un
cap a des jalons à POSER, une habitude n'a rien à poser, **elle REVIENT**. Son
calendrier ne sert donc pas à programmer mais à REGARDER EN ARRIÈRE, et c'est la
seule grille du hub où l'on coche un jour passé au lieu d'y déposer quelque
chose.

**LA CARTE RESTE**, et le nom devient la porte. Ce n'est pas le cas des caps et
des projets, dont le dépliage a disparu : ici la carte est un TABLEAU DE BORD —
on la lit tous les jours pour cocher —, pas un index dupliqué. La page ajoute ce
que la carte ne peut pas porter : la naissance, les paliers, le rythme, le
calendrier.

**ET LA CARTE MAIGRIT D'AUTANT** (2 septembre 2026, demande de Noé : *« sur cet
affichage il doit donc y avoir moins d'infos, seulement l'essentiel, avec le voc
qu'on a corrigé ; pas de graphique ici »*). C'est la conséquence directe de la
page : ce qui restait sur la carte y était **parce qu'il n'y avait nulle part où
le poser**. Il reste le rond, le nom, l'élan et **deux chiffres**.
- **PAS DE SPARKLINE.** Elle répond à « comment ça a évolué » — une question
  qu'on se pose sur UNE habitude, pas sur neuf d'affilée. Elle prenait deux
  hauteurs de texte par carte, sa légende comprise, pour douze barres de 3 px.
  *Mesuré : une carte passe de 300 px à 137.*
- **LES MOTS SONT CEUX DE LA PAGE** : « série en cours » et non « jours tenus »,
  qui demandait de deviner de quoi on parlait. **Une même mesure ne change pas de
  nom d'un écran à l'autre** ; l'unité part dans la bulle.
- **« 2/10 vers le palier » remplace « encore 8 avant 10 · 2 au total »** — la
  règle de la page appliquée ici le même jour : ce qui a été fait, pas ce qui
  reste, et **le total EST le numérateur**, donc un item au lieu de deux.
- **UNE QUOTIDIENNE NE DIT PLUS SA JOURNÉE** : « pas encore aujourd'hui »
  comptait un manque, et le rond, à trois centimètres de là, dit déjà si elle est
  faite. Une hebdomadaire garde son « 2/3 cette semaine » : son rond ne sait pas
  le dire.

### Ce qu'elle montre

**LES CHIFFRES OUVRENT LA PAGE, ET RIEN NE LES PRÉCÈDE** (2 septembre 2026, deux
corrections de Noé : *« supprime "où elle en est" »*, puis *« supprime les petits
ronds et en sommeil »*). C'est la même coupe que sur la tuile d'une journée la
veille — **ce qui se montre n'a pas à se nommer** : cinq tuiles chiffrées sous le
nom d'une habitude ne demandent pas qu'on annonce que c'est son état. Le titre
reste hors écran pour les lecteurs d'écran, qui n'ont pas la mise en page.

**L'ÉLAN QUITTE CETTE PAGE**, avec sa jauge de dix crans et son mot (« en
sommeil », « solide »). Il n'y a pas de contradiction avec la règle du 30 août —
« l'élan reste sur la page des habitudes » : c'est là qu'il est, sur les cartes,
et il y reste. Ici il faisait un sixième chiffre, sous une autre forme et dans
une autre unité, **au-dessus de cinq qui se comparent** ; et son mot le plus
fréquent est un constat de creux, ce qui est la dernière chose à lire en ouvrant.

**Cinq chiffres**, et un seul compte un manque :

| | |
|---|---|
| **2/7 cette semaine** | le seul qui parle du jour même, et le seul qui puisse encore bouger |
| **2 · série en cours** | le chiffre **change de couleur avec elle** (voir plus bas) |
| **2 · série max** | le chiffre en **orange** |
| **67 % · complétée** | ce qu'elle a tenu depuis sa première fois |
| **2/10 vers le palier** | ce qui a été fait, et le palier visé |

**ILS SONT EN CLASH DISPLAY** (2 septembre 2026, demande de Noé : *« les chiffres
des dashboards doivent être en Clash Display »*), ici et sur le tableau de bord
des habitudes. C'est la règle déjà posée sur `.chiffre-cle` et sur le bilan de
« Ma semaine » : **un chiffre qu'on vient VOIR se donne du poids ; un chiffre
qu'on vient COMPARER garde sa chasse fixe.** Ces cinq-là ne s'alignent en colonne
avec rien. *La règle s'écrit APRÈS `.chiffre`, qui pose Geist Mono à spécificité
égale — l'ordre tranche.*

### LE POURCENTAGE DE FOIS COMPLÉTÉES

**Demande de Noé** : *« il faut rajouter aussi comme stat le pourcentage de fois
où elle a été complétée, en prenant comme date référence la 1ère fois où elle a
été faite »* — `tauxDeLHabitude` (js/orientation.js), éprouvable hors écran.

**C'EST LE SEUL CHIFFRE DU HUB QUI COMPTE UN MANQUE**, et il faut le dire : la
règle des habitudes l'interdit depuis le 30 août — « aucun taux de réussite ».
Noé le redemande, donc il existe ; **ce qui le rend tenable, c'est qu'il est un
parmi cinq**, à côté de quatre qui ne peuvent que monter, et qu'il ne porte ni
rouge ni seuil.

- **La référence est la PREMIÈRE PRATIQUE**, comme la moyenne : les semaines
  d'avant le premier jour ne sont pas des semaines ratées, ce sont des semaines
  où l'habitude n'existait pas. *Sans ça, une habitude posée en janvier et
  commencée en août afficherait 12 %.*
- **L'attendu se déduit de la cadence** — `jours × cadence / 7` —, si bien qu'une
  habitude à trois fois par semaine n'est pas jugée comme une quotidienne.
- **Il est PLAFONNÉ à 100 %** : tenir mieux que sa cadence n'écrit pas 140 %, un
  pourcentage au-delà de son plein ne veut rien dire.
- **Une habitude jamais pratiquée n'en a pas** : elle n'a pas de référence, et
  « 0 % » serait la première chose qu'elle dirait.

**LES DEUX SÉRIES, ET EN COULEUR** (demande de Noé : *« je dois pouvoir voir la
série en cours et la série max — comme on avait dit, avec -1 sur la série en
cours lorsqu'un jour n'est pas tenu, pas une remise à 0 — avec de la couleur »*).
- **Le record était DÉJÀ CALCULÉ et ne s'affichait nulle part** :
  `serieDeLHabitude` le rend depuis le premier jour, sous le même réglage que la
  série en cours — un jour manqué coûte UN, jamais tout. Il n'y avait rien à
  recalculer, seulement à le montrer.
- **LES MOTS DISENT CE QUE C'EST, pas ce qu'on compte** (correction de Noé) :
  « 2 jours tenus » et « 2 au mieux » demandaient de deviner que la seconde était
  un record. « Série en cours » et « série max » se lisent sans rien savoir, et
  **l'unité part dans la bulle**, où elle ne coûte pas une ligne.
- **SEUL LE CHIFFRE PORTE LA COULEUR** (correction de Noé) : les deux tuiles ont
  porté un fond teinté et un liseré. La tuile reste une tuile — c'est ce qui la
  garde comparable aux deux autres, qui n'ont rien à mettre en jeu.
### L'ÉCHELLE DE LA SÉRIE EN COURS

**Règle de Noé** : *« la série max en orange, la série en cours en vert au début,
puis bleu après 3 jours, une flamme lorsque l'habitude a été cochée 5 jours
d'affilé, et jaune lorsque l'on est à 2 jours près de la série max »* — puis
*« lorsque série max et série en cours sont égales, la même couleur »*, et enfin
*« un dégradé qui rend le chiffre couleur or »*.

| | |
|---|---|
| **vert** | moins de trois — ça commence |
| **bleu** | trois et plus — ça tient |
| **jaune** | à deux crans du record — ça chauffe |
| **or (dégradé)** | série et record à ÉGALITÉ — **les deux tuiles** le prennent |
| **orange** | le record, quand il n'est pas atteint |

**L'ORDRE DES TESTS EST LA RÈGLE**, et il règle tout seul un cas idiot : au tout
début, série et record valent 1, donc « à 2 près du record » serait vrai — un
jaune « tu approches ton meilleur » sur une habitude d'un jour ne veut rien dire.
L'égalité passe devant, puis le vert en dessous de trois. *Dix cas vérifiés hors
écran, comme le reste de l'orientation.*

**L'ÉGALITÉ EST UN DÉGRADÉ, PAS UNE COULEUR.** Un aplat de plus n'aurait été
qu'un cinquième cran ; l'or MÉTALLIQUE dit autre chose — c'est un sommet, et le
seul endroit du hub où un chiffre brille. *L'or plat reste en secours : un
`background-clip: text` non pris en charge laisserait un chiffre transparent,
c'est-à-dire invisible.*

**ET PAS DE MOT POUR LE DIRE** (correction de Noé : *« c'est les couleurs qui me
le disent »*). La tuile a porté « série max — tu y es » ; **un mot qui redit ce
qu'une couleur montre est un mot de trop.** Il ne reste que là où la couleur ne
va pas : dans la bulle et pour le lecteur d'écran.

**UNE FLAMME À CINQ JOURS D'AFFILÉE**, à côté du chiffre — dessinée et non en
émoji, donc **elle prend la couleur de la série** : elle brûle en vert, en bleu
ou en jaune selon où l'on en est.
- **CE N'EST PAS LA SÉRIE, et c'est tout l'intérêt.** La série recule d'un cran
  quand un jour manque, elle ne tombe pas : on peut donc afficher « 7 jours
  tenus » avec deux trous dedans — c'est exactement le réglage demandé pour
  qu'elle ne s'écroule pas. La flamme, elle, dit **cinq jours SANS TROU**. Deux
  mesures, deux signes : **l'une protège, l'autre récompense.**
- **Elle part d'aujourd'hui s'il est coché, d'hier sinon** : sans ça elle
  s'éteindrait chaque matin, avant qu'on ait eu le temps de cocher. Même
  précaution que la série, qui s'arrête avant le jour en cours.
  (`joursDAffileeDeLHabitude`, js/orientation.js — éprouvable hors écran.)

**PAS DE VIOLET** (règle de Noé), et c'est ce qui écarte la couleur de famille
autant que l'accent du perso : « calme » EST un violet. **Aucune de ces couleurs
n'est une alerte, et il n'y en aura pas** : elles disent où l'on en est, jamais
ce qui manque.

**Le record ne s'affiche pas à zéro**, comme la série : « 0 » sur une habitude
neuve serait la première chose qu'on lirait.

**CE QUI A ÉTÉ FAIT, PAS CE QUI RESTE** (correction de Noé : *« plutôt que
"8 avant 10", montre ce que j'ai fait, donc 2/10 »*). C'est **la philosophie n° 1
appliquée là où je l'avais oubliée** — *le hub est d'abord un miroir de ce qui a
été accompli, pas une liste de ce qui reste*. « 8 avant 10 » comptait un manque ;
« 2/10 » compte un acquis et dit le palier au passage. **Les deux tuiles n'en
font plus qu'une** : le total EST le numérateur, et l'afficher à côté aurait
écrit deux fois le même chiffre.

**LE RYTHME, en une ligne d'encre discrète, SOUS LES CHIFFRES** : la première
fois, la dernière fois, la moyenne par semaine.

**LA PREMIÈRE FOIS, ET NON LA DATE DE CRÉATION** (correction de Noé : *« enlève
le "posé le…", la donnée 1ère fois est plus intéressante »*). Et il a raison :
**la date où l'on a TAPÉ une habitude ne dit rien** — on peut la poser un
dimanche soir et ne commencer que trois semaines plus tard. La première pratique
date le début réel. *Sa demande disait « depuis quand je l'ai ajoutée/commencée » ;
entre les deux réponses, c'est la seconde qui compte.*

**ELLE VIT ICI, PAS EN TÊTE** (2 septembre 2026, correction de Noé : *« remets la
1ère fois à la place qu'elle était au début, en dessous des stats, en petit comme
dernière fois »*). Elle est montée dans la tête pendant une heure, en corps de
texte : **elle y pesait autant que le pourquoi de l'habitude**, alors que c'est
un fait de même nature que les deux qui la suivent. Trois dates de rythme, une
seule ligne, une seule taille.

**La moyenne se compte depuis la PREMIÈRE PRATIQUE et non depuis la naissance de
l'habitude**, pour la raison qui vaut aussi pour le pourcentage.

**TOUS LES PALIERS, ET CEUX QUI SONT FRANCHIS.** C'est le seul endroit du hub où
on les voit tous — ailleurs on ne lit que le prochain. Ils ne redescendent
jamais, et c'est tout leur intérêt. Un palier à venir n'est pas un manque : il
est simplement pâle.

### LA SPARKLINE, ET SA MAILLE

**Celle de la carte**, à la fonction près (`sparkline`, js/perso.js) : deux
dessins pour une seule mesure auraient fini par ne plus compter pareil.

**UNE HABITUDE QUOTIDIENNE SE LIT EN JOURS** (2 septembre 2026, demande de Noé :
*« pour les séries journalières, le graphique doit être par jour et non par
semaine, montre les 14 derniers jours »*), **les autres restent en semaines**.
- **La maille suit ce que l'habitude COMPTE**, exactement comme sa série : une
  quotidienne compte des jours tenus depuis le 30 août, et sa courbe le disait en
  semaines — « 7 sur 7 » et « 4 sur 7 » y faisaient deux barres pleines. **Une
  barre qui ne peut pas montrer un écart ne montre rien.**
- **Quatorze jours et non douze semaines** : à l'échelle du jour, un trimestre
  ferait 84 barres de 2 px. Deux semaines suffisent à voir un trou, et c'est la
  fenêtre qu'on habite.
- **Un jour est PLEIN ou vide** — il n'y a pas de demi-journée —, là où une
  semaine tenue est pleine et une semaine entamée en creux.

**LE PLUS RÉCENT À GAUCHE** (correction de Noé : *« avec le dernier jour qui
s'affiche à gauche, actuellement c'est à droite »*), pour les deux mailles : on
lit de gauche à droite, donc **la première chose lue doit être aujourd'hui**, pas
il y a trois mois. *Conséquence assumée : le temps y coule à rebours, et c'est
pourquoi la légende le dit en toutes lettres — « d'aujourd'hui à il y a deux
semaines ».*

**Et la légende suit la maille**, sur la page comme sur la carte : douze barres
et quatorze barres côte à côte sans un mot laisseraient deviner pourquoi elles ne
comptent pas la même chose.

### Le calendrier des faits

**MOIS ET 3 MOIS**, c'est ce que Noé a demandé. Pas de semaine — sept cases ne
disent rien d'une habitude ; pas d'année — une case par semaine ne saurait pas
dire « faite ou non », qui est la question de cette page.

**LA VUE MOIS EST CELLE DU SITE, à la lettre, et elle prend toute la largeur**
(correction de Noé : *« la vue mois doit prendre toute la largeur… comme les
autres vues mois utilisées sur le site, la même forme »*). Mêmes classes, même
géométrie, mêmes en-têtes que `#calendrier` — cases de 7 rem, numéro en haut.
> *Ce que ça remplace.* Le mois empruntait la grille COMPACTE du trimestre,
> bornée à 24 rem pour que la case ne change pas de taille d'une vue à l'autre.
> Le motif se tenait, mais il faisait de la vue mois une chose que le hub n'a
> nulle part ailleurs — et une page qui a de la place n'a aucune raison de la
> laisser vide.

**LA VUE 3 MOIS reste la grille compacte du trimestre**, mais la case n'y porte
plus des points : **elle est PLEINE ou vide**, dans la couleur de la famille.

- **LES INITIALES DES JOURS REVIENNENT ICI, et seulement ici.** Le trimestre les
  a perdues parce qu'on n'y vise pas un mardi ; sur une habitude, au contraire,
  **c'est la question** — « est-ce que je la tiens le week-end ? ».
- **Et leur rang SE DÉCLARE** (demande de Noé : *« la case des initiales des
  jours doit être plus fine, moins longue »*) : `grid-auto-rows` vaut pour tous
  les rangs IMPLICITES, en-tête compris — la rangée faisait donc 48 px comme un
  jour, et se lisait comme une première ligne du mois. Un premier rang `auto` la
  laisse tenir sur son texte. *Mesuré : 14 px contre 50 pour une case.*
- **ET LA CASE SE COCHE.** Un calendrier de coches qu'on ne pourrait pas corriger
  serait une frustration à chaque oubli, et le hub sait déjà rattraper un jour
  passé — c'est ce que fait la tuile d'une journée depuis le 1er septembre. La
  coche vaut pour CE jour-là : le bouton porte sa date.
- **TROIS ÉTATS, ET AUCUN N'EST UN REPROCHE** : faite, pas faite, et hors de
  portée — avant qu'elle existe, ou après aujourd'hui. Les jours hors de portée
  ne se cochent pas : **on ne tient pas une habitude avant de l'avoir posée, et
  on ne coche pas demain.**

**AUCUN ROUGE, AUCUN TAUX DE RÉUSSITE, AUCUN JOUR MANQUÉ COMPTÉ.** C'est la
contrainte de toutes les mesures d'habitude depuis le 30 août, et c'est elle qui
interdit d'inventer ici une couleur pour « pas faite ». *La toute première
maquette des habitudes montrait les sept derniers jours en points gris, et Noé
l'avait écartée d'une phrase : « ça ne me donne pas envie de les faire ».* Une
case vide est du vide.

## La page d'un objectif — `#objectif/<id>` (2 septembre 2026)

**La demande de Noé** : *« on va faire pareil pour les objectifs : une page
indépendante pour chacun avec tous les détails, un calendrier qui permet de
poser les jalons. Et une vue (et un lien vers la page détail) des projets qui lui
sont rattachés. »*

**C'EST LA PAGE D'UN PROJET, UN ÉTAGE PLUS HAUT**, et volontairement : mêmes
trois colonnes, même geste, mêmes mots. Un cap se découpe en jalons comme un
projet se découpe en étapes. Ce qui change, c'est ce que porte la colonne de
droite — **un projet y montre ses TÂCHES, un cap y montre ses PROJETS**, parce
que c'est l'étage en dessous de lui. Réapprendre un geste en montant d'un étage
aurait été le pire des deux mondes.

| | à gauche | au centre | à droite | sous le calendrier |
|---|---|---|---|---|
| `#objectif/<id>` | ses **jalons** | son calendrier | — | le **rail de ses projets** |
| `#projet/<id>` | ses **étapes** | son calendrier | ses **tâches**, filtrables | — |

**UNE COLONNE EST UNE RÉSERVE : ce qu'elle porte SE POSE.** C'est Noé qui l'a vu
et c'est la règle qui range cette page — *« les projets ne sont pas à
"poser" »*. Un projet n'a pas d'échéance qu'on déplace du doigt : il a une page.
Le mettre dans une colonne promettait un geste qui n'existe pas.

**LA PAGE D'UN CAP N'A DONC QUE DEUX COLONNES** (décision de Noé : *« supprime la
colonne de droite »*). Un cap n'a qu'une chose à poser sur son calendrier — ses
jalons —, et une seconde réserve de l'autre côté ne disait rien. **Le calendrier
prend la place qu'elle rend, et les deux colonnes arrivent plus tôt** : à
1000 px et non 1200, une colonne de moins étant 18 rem de moins à trouver.
*Mesuré à 1000 px : 89 px par jour ; à 1210 px : 126 px.*
- **Conséquence assumée** : les tâches accrochées au cap SANS projet ne
  s'affichent plus sur cette page — seulement au calendrier, quand elles ont une
  date. Il n'y a plus non plus de geste pour en poser une d'ici. Elles vivent
  dans l'espace Tâches, où rien n'est caché. *Si elles manquent à l'usage, leur
  place est sous les jalons, pas dans une colonne à elles.*

### Ce qu'elle montre

**La tête** : son espace, son échéance, ce qu'il porte (« 3 projets · 23 tâches »),
ses **marches** — un cap se lit en jalons franchis, jamais en pourcentage —, son
**pourquoi** et sa **cible**, et le menu à trois points qui modifie, marque
atteint ou supprime.

**Le calendrier** montre **le cap à son échéance, ses jalons, et le TRAVAIL qui
le sert** : les tâches, événements et parutions de ses projets, plus les tâches
accrochées au cap sans projet. C'est la réponse à « quand ce cap avance-t-il »,
et elle n'existait nulle part.
- **Les jalons se posent à la main et non par `assemblerCalendrier`** : celui-ci
  écarte les jalons ATTEINTS — juste au calendrier plein écran, où ce qui est
  fait n'a plus à occuper le regard ; faux ici, où l'on vient voir le chemin
  entier. Même choix que les étapes d'un projet.

**LES PROJETS SONT UN RAIL, SOUS LE CALENDRIER** (demande de Noé, en deux
temps : *« côte à côte sur une même ligne, dans une forme similaire à comment
sont affichés les projets dans la page d'accueil ; ça peut en afficher plus
qu'un, c'est juste que s'il y a trop de projets on voit la suite en slide sur le
côté »*, puis *« finalement en dessous du calendrier »*).

**C'est le rail de l'accueil, repris tel quel** : même tuile, même glissement,
même fondu sur les bords. Ne change que la LARGEUR d'une tuile — sur l'accueil le
rail vit dans une colonne étroite et en montre une à la fois ; ici il a toute la
page et en montre autant qu'il y a de place. *Mesuré à 1210 px : quatre tuiles
entières et la cinquième qui dépasse.*
- **TOUTE LA TUILE MÈNE À SA PAGE** (« et un lien vers la page détail ») : c'est
  là que vivent ses étapes, ses tâches et son calendrier, et les redire ici en
  ferait deux endroits à tenir d'accord.
- **La jauge vient de `#objectifs`** (`jaugeDuProjet`) et non du rail de
  l'accueil, qui dessine la sienne : une avancée doit se dessiner pareil sur tous
  les écrans.
- **PAS DE POINTS SOUS LE RAIL**, à la différence de l'accueil : là-bas une seule
  tuile se voit, et sans compteur on ne saurait pas où l'on est dedans. Ici la
  tuile suivante dépasse — c'est ce qui dit qu'il y en a d'autres, mieux qu'une
  rangée de points, et c'est déjà l'argument de la colonne « À poser ».

### L'ANNÉE — douze mois, une case par SEMAINE (2 septembre 2026)

**La demande de Noé** : *« crée une vue par année, par 12 mois plutôt (mais
appelée année) ; tu ne référence pas tous les jours, seulement les semaines, pour
pouvoir intégrer 12 mois dans un espace similaire que les autres vues. Quand on
déplace un jalon dedans, ça se place au lundi de la semaine choisie. »*

**C'EST LE MÊME MOUVEMENT QUE LE TRIMESTRE, D'UN CRAN ENCORE.** Le mois montre
des barres dans un JOUR, le trimestre des points dans un JOUR, l'année des points
dans une SEMAINE. À chaque fois la maille grossit et la question change — de
« qu'y a-t-il ce jour-là » à « où sont les échéances de l'année ». Trois cent
soixante-cinq cases n'auraient jamais tenu ; cinquante-deux, oui. *Mesuré :
398 px, la hauteur d'une vue mois.*

**« Année » est le mot de Noé, mais ce n'est pas l'année civile** : ce sont les
douze mois qui VIENNENT, l'ancre en tête — comme le trimestre, et pour la même
raison. Un cap dont l'échéance tombe en juin prochain veut voir juin.

**UNE SEMAINE APPARTIENT AU MOIS DE SON JEUDI**, et à lui seul — la règle
d'ISO 8601, c'est-à-dire le mois dont elle a le plus de jours. Deux propriétés à
la fois, et il faut les deux :
- **aucune semaine n'est dessinée deux fois** — le défaut payé sur le trimestre,
  où le 31 octobre tombait dans deux grilles ;
- **et aucune n'est oubliée.** C'est ce qui a fait changer de règle : rangée par
  son LUNDI, la semaine du 31 août n'était d'aucun des douze mois d'une année
  ouverte en septembre, **et les deux échéances du 2 et du 3 septembre ne se
  voyaient nulle part**. *Mesuré : zéro semaine oubliée avec le jeudi, une avec
  le lundi.*

Le prix, assumé : la première case de septembre peut porter la semaine 36, qui
commence le 31 août. La bulle donne l'intervalle en toutes lettres.

**Quatre ou cinq semaines par mois, jamais plus** (vérifié sur huit ans) : c'est
ce qui donne à la grille ses **cinq colonnes**, plus celle du nom du mois. Les
mois à quatre laissent une case muette — sans elle, les semaines ne tomberaient
plus les unes sous les autres d'une ligne à l'autre.

**LA CASE PORTE LE NUMÉRO DE SA SEMAINE** (demande de Noé) et non le jour de son
lundi : dans une grille dont la maille EST la semaine, un numéro de jour se
lisait comme une date et laissait croire à une case-jour. Le numéro est celui
d'ISO 8601 — la même règle du jeudi que l'appartenance au mois, si bien qu'une
case ne peut pas porter un numéro qui contredirait sa ligne.
- **On compte depuis le 1er janvier, en UTC.** Compter depuis « le jeudi de la
  semaine du 1er janvier » se trompe les années où celui-ci appartient à l'année
  d'AVANT : *mesuré, le 4 janvier 2027 sortait en semaine 2 au lieu de 1, et le
  4 janvier 2021 aussi.* L'UTC écarte l'autre piège du genre — une différence de
  dates en heures locales n'est pas un multiple de 24 h les nuits de changement
  d'heure. *Dix cas de bord vérifiés, dont les semaines 53.*

**LE LUNDI RESTE DANS `data-jour`**, et c'est lui que le glissement écrit : la
case est un `.cal-jour` comme les autres, donc `jourSousLePoint`,
`brancherSelection` et le dépôt d'un jalon marchent sans une ligne de plus.
*Vérifié : « QCM des blocs » lâché sur la semaine 46 s'est posé au 9 novembre,
son lundi.*

**C'EST UNE VUE OÙ L'ON ZOOME** (demande de Noé) : **une semaine pressée ouvre la
vue SEMAINE, le nom d'un mois ouvre la vue MOIS**. C'est la seule vue du hub où
un appui n'ouvre pas la tuile de capture, et c'est cohérent — **on ne pose pas
une chose « dans une semaine », on descend d'un cran pour voir où**. Le nom du
mois est un vrai `<button>`, pas un `<p>` cliquable : il se tabule, et le hub ne
fabrique pas de faux boutons.
- **Zoomer déplace l'ancre**, donc revenir à l'année la fait commencer au mois où
  l'on était. C'est voulu : l'ancre suit le regard, comme partout ailleurs.

### LE TRIMESTRE — une vue « 3 mois » (2 septembre 2026, demande de Noé)

**Les deux pages offrent SEMAINE · MOIS · 3 MOIS**, dans cet ordre : c'est la
progression naturelle, du plus près au plus loin. Elle existe parce que **les
jalons d'un cap et les étapes d'un projet tombent à des mois de distance** — les
six jalons du Bac+3 vont du 15 septembre au 8 décembre — et qu'une vue mois n'en
montrait jamais que le premier.

**TROIS COLONNES, ET SA FORME À LUI** (correction de Noé, dans la foulée :
*« les 3 mois doivent être 3 colonnes, ça ne doit pas avoir la même forme que les
mois de la vue mois, c'est trop long »*).

> *Ce que ça remplace, et il a raison.* La première version empilait trois
> grilles de MOIS, l'une sous l'autre. **C'était trois mois de longueur** —
> 1 700 px mesurés à 1210 px de large — et personne ne fait défiler un trimestre
> pour le lire.

**C'EST UNE QUESTION DE NATURE, PAS DE MISE EN PAGE.** Une grille de mois est
faite pour qu'on LISE ce qu'il y a dans un jour : des barres titrées, une case de
sept rem. Le trimestre répond à une autre question — **« où sont les échéances,
où sont les creux »** —, c'est-à-dire la FORME du trimestre et non le contenu
d'un jour. Sa case porte donc **son numéro et des POINTS, un par chose**.

C'est exactement le choix du calendrier de « Mes journées » (1er septembre 2026),
et le même motif : *« on ne pose rien, on CHOISIT un jour ; la case porte donc
des signes et non des lignes »*.

- **CE QU'ON PERD, ET QUI EST ASSUMÉ** : on ne lit pas un titre dans cette vue.
  Il est dans le `title` de la case et dans son nom accessible ; et la vue Mois
  est à un clic, juste à gauche.
- **CE QU'ON GARDE, ET C'EST LE PLUS UTILE** : la case reste un `.cal-jour` avec
  sa date. Tout ce qui vise un jour — poser ce qu'on tient, y lâcher un jalon,
  l'atteindre au clavier — marche sans une ligne de plus. **Un jalon se glisse à
  deux mois sans changer de vue**, ce qu'aucune autre vue ne permettait.
  *Vérifié : « QCM des blocs » posé au 20 novembre depuis la colonne, en une
  fois.*
- **Quatre points, puis un compte** : au-delà, une rangée de points ne se compte
  plus du regard — c'est ce qu'un chiffre fait mieux.
- **PAS D'INITIALES DE JOURS, ET LE MOIS PREND LEUR PLACE** (troisième demande de
  Noé : *« le L de lundi, M de mardi… ne doit pas y être, seulement le mois doit
  être inscrit à cette place »*). Elles ne servaient à rien — **on ne vise pas un
  mardi dans cette vue, on repère une grappe et un creux** ; le nom du mois, lui,
  est ce qu'il faut savoir pour lire la colonne, et il volait un rang au-dessus
  de la grille. Il occupe donc celui des initiales, à leur corps et sous leur
  trait, et le trimestre gagne une ligne par mois.
- **LES TROIS MOIS SONT COLLÉS, DANS UN SEUL CADRE** (même demande). Trois
  `.cal-grille` voisines gardaient chacune son contour et ses angles arrondis :
  au milieu du trimestre, deux traits et quatre coins ronds là où il ne devrait
  rien y avoir. **C'est le trimestre qui porte le cadre** ; les mois n'ont plus
  que leurs traits intérieurs, et le bord droit d'un mois DEVIENT la couture avec
  le suivant — titre compris, pour que le trait descende d'un seul tenant.
  *Mesuré à 1210 px : 297–590, 590–884, 884–1177, et les trois finissent à la
  même ligne.*
- **Un mois de cinq lignes s'étire à la hauteur de celui de six** : un cadre au
  bord inférieur en dents de scie se lirait comme un défaut d'alignement.
- **RIEN SUR UN JOUR QUI N'EST PAS DE CE MOIS-LÀ.** La grille garde la traîne des
  mois voisins pour rester rectangulaire, mais elle ne la remplit pas : un jalon
  du 31 octobre tombait sinon dans la grille d'octobre **et** dans la première
  ligne de celle de novembre. Le même point à deux endroits se lit comme un
  défaut, même quand il n'en est pas un — et ici, pas de titre pour dire que
  c'est le même.
- **Une case fait 2,75 rem**, et pas un pixel de plus : c'est la hauteur qui
  décide si un trimestre tient sous les yeux. *Mesuré à 1210 px : 274 px pour les
  trois mois, contre 1 700 pour trois grilles empilées.*
- **Les trois colonnes s'empilent en dessous de 60 rem** : sept colonnes dans un
  tiers de 375 px feraient 18 px par jour, soit moins qu'un chiffre.
- **LA FENÊTRE GLISSE D'UN MOIS, elle ne se tourne pas comme une page** (règle
  de Noé, avec son exemple : *« la période actuelle est septembre-novembre ; si
  j'appuie sur la flèche qui va vers la droite, la période doit être
  octobre-décembre »*).
  > *J'avais compris l'inverse et posé un pas de trois mois — la fenêtre sautait
  > de septembre-novembre à décembre-février.* **Une FENÊTRE de trois mois n'est
  > pas une PAGE de trois mois** : on la fait glisser pour suivre une échéance
  > qui arrive au bord, et un saut de trimestre la ferait justement disparaître
  > d'un coup. Le pas est donc celui du mois ; c'est ce que la fenêtre MONTRE qui
  > change, pas ce dont elle avance.
- **ET L'ANCRE REPART DU 1er DU MOIS**, ce qui n'est pas de la coquetterie
  (trouvé en vérifiant ce pas). `setMonth` DÉBORDE quand le mois d'arrivée est
  plus court que le jour de départ : **depuis le 31 janvier, « mois suivant »
  donnait le 31 février, c'est-à-dire le 3 mars — février était sauté.** Le jour
  de l'ancre ne sert à rien dans ces deux vues — `grilleDuMois` et
  `moisDuTrimestre` ne lisent que l'année et le mois —, on le pose donc au 1er.
  **Le défaut touchait le calendrier plein écran depuis toujours**, un mois sur
  sept.
- **L'ancre est en TÊTE du trimestre**, pas au milieu : on regarde devant soi.
- **`#calendrier` et les deux sites gardent leurs trois vues.** La barre sait
  déplacer et nommer le trimestre comme l'année, mais c'est l'option `vues` qui
  décide page par page — deux boutons de plus sur l'écran le plus visité du hub
  seraient un rang de plus pour des vues qu'on n'y demande pas.

**L'ARGENT DE « REMBOURSER MON MATÉRIEL » FERME LA PAGE**, sous les trois
colonnes : c'est le seul cap du hub qui se mesure autrement qu'en jalons, et il
le dit après tout le reste. Les prestations et le matériel s'y corrigent, comme
avant — ils ont simplement suivi l'écran.

### UN JALON N'A EU BESOIN DE RIEN

Il porte une `echeance` depuis le premier jour, facultative, et le calendrier
sait déjà le lire, le déplacer, le corriger et le supprimer. **C'est la seule
différence avec l'étape d'un projet**, qu'il a fallu doter d'une colonne le même
jour — et elle dit quelque chose de vrai : *un jalon a toujours été un point du
calendrier, une étape un morceau de travail.*

**CE QUI EST ATTEINT NE SE GLISSE PAS** : sa ligne dit encore son échéance, mais
la déplacer réécrirait une date que le cap a déjà dépassée. Même règle que pour
une étape franchie et une tâche faite.

### Ce que `#objectifs` a perdu, et pourquoi

Le dépliage d'un cap est parti, et **toute la machinerie qu'il portait avec lui**
— franchir un jalon, l'ordonner, le poser, le modifier, le supprimer ; cocher une
tâche, la rattacher, relire ce qui est fait ; les prestations et le matériel. Elle
n'y était atteignable que depuis ce dépliage, et la garder aurait fait du code
mort qu'on recopie.

**La galerie garde tout ce qui se compare** : ses tuiles, leurs marches, leur
menu — modifier, marquer atteint, supprimer — et les deux autres étages, les
projets et les périodes. **Elle charge quatre tables au lieu de six** : les
prestations et le matériel ne servaient qu'à l'argent d'un cap déplié.

## La page d'un projet — `#projet/<id>` (2 septembre 2026)

**LA DEMANDE, dans les mots de Noé** :

> « Pour les projets, chacun d'eux doit avoir sa propre page (à ouvrir depuis la
> page projet) dans laquelle un calendrier en vue mois et semaine et une colonne
> pour les tâches et étapes que l'on pourra glisser dans le calendrier pour les
> programmer. La page doit contenir tous les détails du projet également. »

**CE QU'ELLE REMPLACE, ET IL FAUT LE DIRE.** Un projet se dépliait SUR PLACE
dans la galerie de `#objectifs/projets` — la tuile prenait toute la largeur et
montrait ses étapes, ses tâches, ce qu'il sert. La règle des deux rangs tranche
autrement dès qu'il y a une page : **la galerie est à deux gestes et ne dit que
ce qui se COMPARE ; la page est à trois, et elle dit tout.** Deux endroits qui
montrent la même chose finissent par se contredire, et c'est toujours celui
qu'on regarde le moins qui ment. Le dépliage est donc parti — git en garde la
trace. *Un CAP, lui, continue de se déplier sur place : il n'a pas de page à
lui, et sa règle du 27 août ne bouge pas.*

**CE QU'ELLE AJOUTE, et qui n'existait nulle part : le TEMPS d'un projet.** Le
hub savait qu'un projet portait quatorze tâches ; il ne montrait ni quand elles
tombaient, ni les trous entre elles. Le calendrier de la page ne montre que ce
qui sert ce projet-là — ses tâches, ses événements, ses parutions, ses étapes.

### Ce qu'elle montre, dans l'ordre où on la lit

1. **la porte de retour** vers la galerie — on entre ici depuis elle, et la
   barre d'onglets n'en dit rien : cette page est au troisième rang ;
2. **tous ses détails** : son espace, son état (qui se change sur place), **le
   cap qu'il sert, à côté de son titre**, sa charge, son échéance, son
   mouvement, sa jauge et **ce qui la mesure**, son résultat attendu, et le menu
   à trois points ;

**LE CAP SE LIT À CÔTÉ DU TITRE** (2 septembre 2026, demande de Noé : « j'aimerais
que l'objectif que sert le projet soit noté à côté du titre du projet, en plus
petite police et gris »). Les deux réponses à « où je suis » se lisent alors d'un
seul regard : ce projet-ci, et ce vers quoi il pousse.
- **Il est DANS le `h1`**, donc il en hérite tout — la police d'affichage, la
  graisse 700, la chasse serrée, la hauteur de ligne d'un titre. On lui rend
  celle du texte courant : sans quoi le cap aurait crié aussi fort que le nom du
  projet, ce qui est l'inverse de ce qui est demandé.
- **« Sert : » est HORS ÉCRAN, pas supprimé** : à l'œil, deux textes voisins de
  deux tailles se comprennent sans mot de liaison ; à l'oreille, « Album du club
  1 000 abonnés » n'en aurait aucun.
- **SOUS le titre sur téléphone**, à côté de lui dès 720 px. *Mesuré à 375 px :
  « Équipe com avec Lina  Laisser » puis « une com qui tourne sans moi » au ras
  de la marge — la phrase se coupait en deux et sa suite se lisait comme un
  second titre.*
- *Ce que ça remplace : une ligne « CE QU'IL SERT » sous le résultat attendu.
  Elle disait la même chose un écran plus bas.* **Conséquence assumée : un projet
  qui ne sert AUCUN cap ne dit plus rien à cet endroit** — son absence est
  l'information, et elle est légitime : de l'intendance, ça existe. Il se
  rattache par le menu à trois points, dont la pastille « Objectifs servis ».

3. **TROIS COLONNES : ses étapes, son calendrier, ses tâches.**

### Trois colonnes, et chaque liste n'existe qu'une fois

**La demande de Noé** (2 septembre 2026) : *« plutôt qu'une répétition des étapes
et des tâches, faisons une colonne à gauche du calendrier pour les étapes comme
elles sont affichées actuellement, et que l'on peut glisser-déposer à une date du
calendrier ; et à droite pareil, une colonne pour les tâches que l'on peut
filtrer par les tâches à poser, celles à faire, celles faites. »*

> *Ce que ça remplace, et il a raison.* La page a porté TROIS listes pendant une
> heure : une colonne « À poser » qui ne montrait que ce qui n'avait pas de jour,
> puis, SOUS le calendrier, la frise entière des étapes et la liste entière des
> tâches. Une étape sans date s'affichait donc **deux fois, à deux endroits qui
> ne se ressemblaient pas**. La réserve et le découpage étaient la même chose vue
> sous deux angles.

**CE QUE ÇA CHANGE POUR LE GESTE** : on ne glisse plus seulement ce qui n'a pas
de jour. **N'importe quelle étape, n'importe quelle tâche ouverte se pose ou se
REPOSE d'un glissement**, depuis la liste même où on la relit.

**CE QUI EST FAIT NE SE GLISSE PAS** — une étape franchie, une tâche terminée. Ce
n'est pas une prudence : leur ligne n'affiche plus `echeance` mais le jour où
c'est arrivé, et un glissement écrirait une date qu'on ne verrait pas changer.
**Un geste dont on ne voit pas l'effet est pire qu'un geste absent.** *(Une
occurrence de série repliée ne se glisse pas non plus : décaler l'une décalerait
ce que la ligne représente — c'est déjà la règle du calendrier.)*

**LE TITRE EST LA POIGNÉE, et c'est un vrai `<button>`** : le glissement est un
geste de souris, et sans lui le clavier n'aurait aucun moyen de prendre une ligne
en main. Un `role` posé sur un `span` aurait fait un faux bouton, ce que le hub
ne fabrique pas. Le CSS lui retire tout ce qu'un navigateur ajoute à un bouton —
mais **pas sa taille de texte**, qui vient de sa propre classe : un `font:
inherit` la lui aurait volée.

**DEUX ÉTATS DE MISE EN PAGE, ET PAS TROIS.** En dessous de 1200 px tout s'empile
dans l'ordre du document ; au-dessus, les trois colonnes se rangent de gauche à
droite **dans ce même ordre**. Un arrangement intermédiaire — les deux colonnes
côte à côte au-dessus du calendrier — a été écarté : il aurait fallu déplacer la
grille par la mise en page, et **le clavier serait alors passé dans un ordre que
l'œil ne voit pas**. *Mesuré : 82 px par jour à 1200 px, aucun débordement de 375
à 1500.*

- **`en-main`** — les jours qui s'allument quand on tient quelque chose — vient
  de « Ma semaine » et a perdu son préfixe pour servir les deux pages. Les
  réglages de taille de la grille (`.semaine-grille`) sont partagés par une
  virgule ; la mise en page, elle, est propre à cette page.
- **Les colonnes ne dépassent pas le calendrier** : leur liste défile dans la
  colonne, pas dans la page — sinon on perd de vue les jours où poser pendant
  qu'on cherche quoi poser. C'est le réglage du vivier de « Ma semaine ». En
  dessous de 1200 px il tombe : rien ne leur fait plus face.

### La colonne de gauche : ses étapes

**La MÊME frise que les jalons d'un cap**, telle qu'elle était — c'est ce que Noé
a demandé. Le point qu'on presse pour franchir, le menu qui ordonne et modifie,
« Poser une étape » en pied, hors de la liste qui défile.

**SA DATE A LA FORME DE CELLE D'UNE TÂCHE** (correction de Noé, le même jour), et
il a fallu la lui donner : `.cap-tache-date` n'a **aucun style à lui** — son
corps et son encre discrète viennent entièrement de `.cap-tache-service`, qui
l'entoure sur une ligne de tâche. Posée nue dans la frise, elle héritait du corps
de la page, donc **1 rem en encre pleine — plus grosse que le titre de l'étape**,
qui vaut 0,875 rem. Elle porte maintenant le même conteneur, et les deux colonnes
disent une date de la même façon.

### La colonne de droite : ses tâches

**TROIS FILTRES, ET UN SEUL À LA FOIS** — *à poser · programmées · faites*. Ce
sont trois QUESTIONS différentes, pas trois cases à combiner. Le dessin est celui
des `.affichages` du calendrier : c'est le MÊME geste — choisir ce qu'une liste
montre —, et écrire un troisième dessin pour un geste qui en a déjà un, c'est
fabriquer la divergence qu'on passe ensuite à rattraper.

**« PROGRAMMÉES » ET NON « À FAIRE »** (correction de Noé, le même jour). Et
c'est plus juste : « à faire » CONTENAIT « à poser », si bien que passer de l'un
à l'autre ne retirait rien — on ne voyait pas ce que le filtre faisait. Les trois
sont maintenant **disjoints** : ce qui n'a pas de jour, ce qui en a un, ce qui est
fait. Mis bout à bout, ils font exactement le projet.

**« À poser » est le défaut** : c'est la page où l'on place, et c'est la seule des
trois listes dont chaque ligne appelle un geste. Les deux autres se relisent.

**Changer de filtre REPOSE ce qu'on tenait** : garder en main une chose qu'on ne
voit plus est un piège.

- **SEMAINE, MOIS, 3 MOIS, ANNÉE — PAS D'AGENDA** : un agenda répéterait la
  liste de ses tâches, qui vit dans la colonne d'à côté. C'est l'option `vues` de
  `construireBarrePeriode`. Le trimestre et l'année sont arrivés le 2 septembre
  2026 : voir « La page d'un objectif », où ils sont décrits — les deux pages les
  offrent.
- **AUCUN FILTRE DE NATURE.** La page ne montre qu'un projet ; cacher une part
  de si peu n'ajouterait qu'une rangée de cases à cocher.
- **LA PAGE PORTE LA COULEUR DE SON ESPACE.** « projet » est le nom d'un ÉCRAN,
  pas d'un espace de Noé — un projet, lui, appartient à un espace, et c'est celui
  qu'on doit sentir, comme dans la galerie d'où l'on vient. Le nom de la page est
  le nom du projet, dans l'onglet du navigateur.
  - **Les deux se REPOSENT à chaque passage du routeur**, et pas seulement au
    chargement : `app.js` les écrit dans `afficherEspace`, qu'il appelle une
    seconde fois au démarrage — Supabase rend un événement de session juste
    après qu'on s'y abonne. *Mesuré : l'onglet repassait à « Projet — Hub » et
    l'accent au gris neutre une fois la page déjà affichée, sans que rien à
    l'écran ne bouge.*
- **« Ouvrir sa page » s'ajoute sous un projet déplié dans son cap** : sans ce
  lien, la page ne s'atteindrait que depuis la galerie.

### Les trois gestes, repris de « Ma semaine » au trait près

| Geste | Ce qu'il écrit |
|---|---|
| une ligne d'une colonne **sur un jour** | `echeance` = ce jour |
| une barre **d'un jour à l'autre** | le décalage habituel du calendrier |
| une barre **ramenée dans une colonne** | `echeance` à `null` — elle se déprogramme |

**LES DEUX COLONNES DÉPROGRAMMENT**, et c'est voulu qu'elles le fassent toutes
les deux : **ce qui décide est la CHOSE qu'on lâche, pas l'endroit où on la
lâche.** Une étape ramenée sur la colonne des tâches perd son jour comme si elle
était rentrée chez elle — se tromper de colonne ne doit pas annuler le geste.

**AU DOIGT, ON NE GLISSE PAS** : sur une liste verticale, un glissement ne se
distingue pas d'un défilement. On touche le titre, puis on touche le jour, et les
jours s'allument tant qu'on tient quelque chose.

### UNE ÉTAPE PORTE UN JOUR (décision de Noé, entre deux options)

**CE QUE ÇA RENVERSE.** Le 29 août, `projets_etapes` est née SANS échéance, et
pour une raison écrite : *« une étape découpe le TRAVAIL, pas le calendrier ; ce
sont les tâches qui portent les dates »*. C'était la différence entre une étape
et un jalon.

Glisser une étape sur un calendrier demandait de trancher : **fabriquer une
tâche qui la porte** (l'étape aurait gardé sa règle), ou **donner un jour à
l'étape**. Noé a choisi la seconde — la plus directe, celle où **ce qu'on glisse
est ce qu'on retrouve**.

- **Ce qui NE change pas** : l'étape reste le découpage du travail, elle se
  franchit et elle s'ordonne. Elle gagne un jour ; elle ne gagne ni durée, ni
  heure, ni statut.
- **Elle reste FACULTATIVE** : un découpage qui n'a pas encore de jour est un
  découpage, pas un retard.
- **Elle devient une barre du calendrier**, du même dessin qu'un jalon — ce sont
  deux échéances, et leur inventer une forme à elles ferait un alphabet à
  retenir. Son signe est le carré creux : les deux triangles sont pris par
  l'objectif et son jalon.
- **`etape` est un TYPE du calendrier, jamais une NATURE** : elle n'existe que
  sur cette page, qui l'ajoute elle-même à l'ensemble qu'elle passe. Une case à
  cocher au calendrier plein écran promettrait ce qui n'y est pas. C'est
  exactement le statut du « bloc » de « Ma semaine ».
- **Le reste s'est branché tout seul** : `champsApresDeplacement` range déjà
  toute date inconnue dans `echeance`, et `champsDeModification` demande un titre
  et une échéance à ce qui n'est ni un événement ni une publication. Il n'a fallu
  ajouter que l'écriture (`appliquerAuCalendrier`, `effacerDepuisLeCalendrier`).

### Ce qui a été mis en commun plutôt que recopié

- **`construireMenuDiscret`** (js/gabarits.js) : la page en porte un sur le
  projet, sur chacune de ses étapes et sur chacune de ses tâches. Le gabarit est
  PUR — on lui dit ce qui est ouvert et ce qui attend confirmation —, ce qui
  permet à deux écrans de tenir leur menu chacun de leur côté.
- **`FORMULAIRES`, `grouperLesTaches`, `jaugeDuProjet`, `motDeLAvancee`,
  `motDuMouvement`, `pastilleEtat`** viennent de `js/objectifs.js` : deux listes
  de champs auraient fini par ne plus demander la même chose, et une jauge qui
  dirait deux choses selon l'écran ferait croire celui qu'on regarde le plus.

**LA MACHINERIE DES ÉTAPES A QUITTÉ `#objectifs`** — franchir, ordonner, poser,
modifier, supprimer : elle n'y était atteignable que depuis le dépliage qui a
disparu, et la garder aurait fait du code mort qu'on recopie.

**`brancherCapture` SEUL, jamais avec `brancherChoix`** : les deux écoutent
`[data-ouvrir-choix]`, et un menu ouvert puis refermé dans le même clic ne
s'ouvre jamais. C'est le double traitement qui avait fait retirer l'appel du site
FCH.

> **Le piège de nommage, payé une sixième fois.** Les classes de la page se sont
> d'abord appelées `.projet-tete`, `.projet-service` — deux noms DÉJÀ PRIS par la
> tuile de projet du tableau de bord. La tête de la page héritait donc d'un
> `display: flex` et se rangeait sur une seule ligne, titre compris. `.fiche-tete`,
> essayé ensuite, était pris lui aussi — par `css/fch.css`, **qui est chargée sur
> les trois pages d'entrée**. Elles s'appellent `.projet-page-*`. *Le grep de
> trois secondes n'est toujours pas facultatif, et il doit couvrir les trois
> feuilles.*
>
> **Et le piège de la spécificité, payé dans la foulée.** Les deux colonnes
> portent les listes de `#objectifs` telles quelles, mais elles vivent dans une
> `.bloc` — et au-delà de 60 rem, `.bloc ul:not(.liste-jalons)` passe TOUTES les
> listes du hub en grille (spécificité 0-2-1). Écrite `.projet-page-colonne
> .cap-taches` (0-2-0), ma règle perdait : la liste restait une grille, où chaque
> ligne garde `min-width: auto` et refuse de descendre sous la largeur de son
> contenu. *Mesuré à 1500 px : des lignes de 315 px dans une colonne de 270, le
> menu à trois points 45 px hors de l'écran.* Il a fallu écrire
> `ul.cap-taches`. **Une spécificité qu'on n'égale pas est une règle qu'on
> n'écrit pas.**

## Ma semaine — `#semaine` (30 août 2026)

**LA DEMANDE, dans les mots de Noé** :

> « Pour les propositions de la semaine du dimanche soir, on va créer une
> nouvelle page (je ferai cette programmation essentiellement sur ordinateur)
> qui sera accessible via un bouton sur la page d'accueil qui apparaîtra avec
> les mêmes horaires que les propositions qui apparaissent le dimanche
> actuellement. Cette nouvelle page doit afficher la page de la semaine qui
> arrive, avec la liste des tâches à faire (non programmé) sur le côté que l'on
> peut glisser dans le calendrier pour les programmer. Il me faut également un
> bilan de la semaine qui est passée en quelques chiffres. »

**CE QU'ELLE RÉPARE.** Le rendez-vous du dimanche vivait sur l'accueil, en
bandeau : il DISAIT la semaine — le club à 26 h, la formation en grappe, rien
pour toi — et ne permettait de rien poser. Il fallait sortir de l'accueil,
ouvrir le calendrier, retrouver la tâche, lui donner un jour, recommencer. Le
constat était au bon endroit, le geste nulle part.

**ELLE S'APPELLE « MA SEMAINE »**, du même nom dans son `<h1>`, dans l'onglet du
navigateur et dans le menu — c'est la leçon de « Général » : trois noms pour une
page est un défaut, pas un choix. Elle a porté « Programmer la semaine » pendant
une heure, le nom du GESTE plutôt que celui de la chose ; le verbe reste sur le
bouton de l'accueil, où il est à sa place — un bouton dit ce qui va se passer,
un titre nomme ce qu'on regarde. *À ne pas confondre avec « Ta semaine », le
bloc de l'accueil : celui-là est un aperçu du calendrier, celle-ci est la page
où l'on décide.*

**LA RÈGLE DES DEUX RANGS la sort de l'accueil**, qui n'en garde qu'une
**porte** — un simple bouton « Programmer ma semaine », dans la même fenêtre
horaire (dimanche à partir de 20 h, et le lundi). Programmer sa semaine est une
décision, pas un réflexe. Ce que ça débloque n'est pas une économie, c'est de la
place : la page peut porter une grille, un vivier et un bilan, ce qu'un bandeau
ne pouvait pas. **L'accueil y gagne aussi une requête contre huit** : il n'a
plus à calculer le diagnostic pour l'afficher, seulement à savoir si la semaine
a déjà été validée.

### Ce qu'elle montre, dans l'ordre où on la lit

1. **le bilan de la semaine passée**, en quelques chiffres — le miroir d'abord,
   c'est la philosophie n° 1 ;
2. **la grille de la semaine qui vient**, et à côté d'elle **le vivier** : les
   tâches qui attendent un jour ;
3. **ce que le hub voit** — les constats du diagnostic, chacun avec son geste.
   **Ils sont passés ENTRE le bilan et la grille le 31 août 2026** (demande de
   Noé) : ils servent à décider de ce qu'on va poser, ils doivent donc être sous
   les yeux AU MOMENT où l'on pose, pas après ;
4. **« C'est ma semaine »**, qui ferme le rendez-vous.

**LA GRILLE EST PLUS GRANDE ICI QU'AILLEURS** (31 août 2026, demande de Noé).
C'est la page où l'on POSE : on y vise une case avec une tâche en main, et on
relit ce qu'on vient d'y mettre. Un aperçu peut se contenter d'être petit —
celui-ci est l'outil. La ligne passe de 20 à **23 rem**, le titre d'une barre de
10,3 à **11,25 px**, sa hauteur minimale de 24 à **29 px**, et un titre se
replie sur **trois lignes** au lieu de deux — ce que le corps vient de prendre,
la troisième ligne le rend.

- **La règle est portée par `.semaine-grille`**, comme l'accueil porte la sienne
  par `#bloc-semaine` : une même grille, trois usages, trois tailles. Le
  calendrier plein écran et l'aperçu de l'accueil ne bougent pas.
- **Au-delà du téléphone seulement** (720 px). Sept colonnes à 375 px font 40 px
  par jour : y écrire plus gros ne donnerait pas à lire, ça replierait les
  titres lettre par lettre. Et Noé programme sa semaine sur ordinateur.
- **Un premier essai est allé trop loin et a été ramené d'un cran** le même jour
  (28 rem, 12,2 px). Ce qu'il a appris : **les corps ne peuvent pas rendre 15 à
  20 %** — 12,2 px moins 17 %, c'est exactement la taille d'avant. Entre « trop
  gros » et « comme avant », il n'y a qu'un cran, et c'est celui qui est posé.
- **Le retrait du titre derrière le rond est passé en `em`** (`1.745em`) : à la
  taille commune il rend les 18 px d'avant au centième près, mais le rond
  grandit avec le texte, et un retrait figé lui laissait 3,2 px d'air au lieu
  de 4,6.

**La grille et le vivier sont CÔTE À CÔTE**, et c'est tout l'objet de la page :
la chose à poser et l'endroit où la poser doivent se voir ensemble, parce que
c'est un geste et non une lecture. Sur téléphone ils s'empilent, la grille
d'abord — c'est pour elle qu'on est venu.

### Le bilan : quatre chiffres, et aucun ne peut baisser

Tâches terminées · heures mesurées · humeur moyenne · habitudes tenues
(`bilanDeLaSemaine`, js/orientation.js — éprouvable hors écran comme le reste).

**LES VICTOIRES ONT QUITTÉ LE BILAN** (1er septembre 2026, demande de Noé).
Elles n'y disaient pas grand-chose : terminer une tâche en écrit une, si bien
que « 18 victoires » et « 17 tâches terminées » se lisaient côte à côte comme
deux mesures alors que la première recopiait presque la seconde. Elles gardent
**« Le chemin »**, la page faite pour les regarder.

**C'EST UNE GALERIE DE TUILES** (1er septembre 2026, demande de Noé : *« la
semaine passée, ce n'est pas bien, il faut que ce soit sous la forme de
tuiles »*). Les chiffres étaient posés à même le fond, séparés par un filet
vertical : ils flottaient — rien ne disait où finissait l'un et où commençait
l'autre, sinon un trait d'un pixel qui disparaissait dès que la ligne se
repliait. **Une tuile le dit par sa surface**, et c'est la grammaire de tout le
reste du hub.
- **C'est la tuile de `.bloc li`**, qu'on avait annulée ici et qu'on redit
  simplement. **Sans contour** : une tuile posée dans la page se distingue par sa
  surface (règle du 30 août) — et `.bloc` n'est qu'une section, pas une carte,
  donc celles-ci sont bien posées sur le fond de la page.
- **Une grille qui se remplit d'elle-même** (`auto-fit`), et non un nombre de
  colonnes : le bilan en compte quatre aujourd'hui, il en comptait cinq hier.
  Quatre de front sur grand écran, deux sur un téléphone.
- **LE CHIFFRE EST EN CLASH DISPLAY 700** (1er septembre 2026, demande de Noé :
  « les chiffres doivent être dans une police plus grasse, essaie la même police
  que celle du titre Ma semaine »). C'est la police du `<h1>`, et c'est déjà ce
  que fait `.chiffre-cle` sur la page des habitudes : **un chiffre qu'on vient
  VOIR se donne du poids ; un chiffre qu'on vient COMPARER garde sa chasse
  fixe** — d'où le détail par espace, qui reste en Geist Mono parce que ses
  durées s'alignent en colonne. 700 et pas davantage : le dépôt n'a que 600 et
  700, demander plus ferait clamper sans que l'écart se voie. La règle s'écrit
  APRÈS `.chiffre`, qui pose Geist Mono à spécificité égale — l'ordre tranche.

**LES HEURES MESURÉES DISENT OÙ ELLES SONT PARTIES** (même demande), une ligne
par espace **dans la tuile du total**, avec la pastille du décompte — la même
grammaire à trois pixels de là. Un total répond à « combien » ; le dimanche soir, on se
demande « où ». Le détail reprend exactement la place que les victoires
libèrent.
- **Dans l'ordre des journées de Noé**, et **sans les espaces à zéro** : « Yuno
  0 h » se lirait comme un reproche là où ce n'est qu'un silence.
**LES PROJETS TRAITÉS ONT LEUR TUILE** (1er septembre 2026, demande de Noé :
« une tuile pour dire les projets qui ont été traités — pour qui une tâche a été
faite ou un événement »). C'est le chiffre qui manquait au miroir : « 17 tâches
terminées » dit COMBIEN on a fait, il ne dit pas SUR QUOI — un projet qui a vu
passer trois tâches et un autre qui n'a rien vu se ressemblaient comme deux
gouttes d'eau.
- **Le compte en vedette, les NOMS en dessous** : c'est pour eux qu'on regarde
  cette tuile. Ils reprennent la grammaire du détail des heures — la pastille de
  l'espace et le texte — et s'arrêtent à l'ellipse, leur nom entier dans `title`.
- **UN ÉVÉNEMENT COMPTE MÊME S'IL N'EST PAS « TERMINÉ »** : il a eu lieu, c'est
  du temps passé sur ce projet. C'est la règle que Noé pose dans sa demande, et
  elle est juste — un entraînement photographié fait avancer l'album du club sans
  qu'aucune case ne se coche.
- **Dans l'ordre des journées de Noé**, et un projet supprimé depuis est ignoré
  plutôt qu'affiché sous son identifiant.

- **LA PASTILLE ET LE CHIFFRE, SUR UN SEUL RANG — PAS LE NOM** (1er septembre
  2026, demande de Noé : *« pas besoin du titre des espaces pour les heures de la
  semaine passée, et intègre-les mieux pour que les autres tuiles voisines ne
  soient pas impactées par leur ajout »*).
  **LES DEUX MOITIÉS DE CETTE DEMANDE N'EN FONT QU'UNE** : c'était le NOM qui
  imposait une ligne par espace, donc une tuile plus haute — et dans une grille,
  tout un rang prend la hauteur du plus grand. Deux tuiles voisines s'étiraient
  pour un détail qui ne les concernait pas. *Mesuré : 106 px le rang, ramené à
  87 — exactement ce qu'il vaut SANS le détail, zéro pixel d'écart.*
  - **Aucune marge au-dessus** : le détail prend la place de `.bilan-precision`
    — « 7 jours notés » sous l'humeur —, donc le seul écart de 2 px que la tuile
    pose déjà. Quatre pixels de plus, et elle dépassait encore ses voisines.
  - **La couleur suffit** parce que c'est la MÊME pastille que le décompte des
    heures. Le sens n'est pas perdu, il est **déplacé** : `title` porte le nom au
    survol, `aria-label` le donne au lecteur d'écran — qui, lui, ne voit pas la
    couleur. C'est la parade de la ligne d'une habitude.
  - **EN GOOGLE SANS, PAS EN GEIST MONO** (même jour, correction de Noé :
    « l'espace entre les lettres doit être moins important pour les heures »).
    La chasse fixe donne à chaque glyphe la même largeur : à 11 px, « 1 h 55 »
    s'étalait et le « h » flottait entre deux blancs égaux. C'est exactement
    l'exception déjà faite au décompte des heures de la grille — **le hub met en
    chasse fixe les chiffres qui se COMPARENT**, et deux durées côte à côte dans
    une tuile ne se comparent pas, elles se lisent. *Le gros chiffre, lui, garde
    Clash Display : il est serré, c'est le mono qui s'étalait.*
  - **`flex-direction: row` se redit**, et c'est la troisième fois que ce piège
    se paie sur cette page : `.bloc ul` pose toutes les listes du hub en COLONNE,
    et ce qu'on ne redit pas reste. *Mesuré : les deux durées s'empilaient
    encore, chacune sur 185 px.* **Nulle part un taux de réussite, une tâche non faite comptée, ou une
comparaison avec la semaine d'avant** : un bilan qui note la semaine passée
transformerait le rendez-vous du dimanche en examen, et on cesserait très vite
de l'ouvrir.

- **Un zéro ne s'affiche pas.** « 0 victoire » est la première chose qu'on
  lirait d'une semaine calme : un constat d'échec pour une information nulle.
  C'est la règle des habitudes, appliquée ici — une série à zéro se tait.
- **Le seul chiffre qui dise un manque dit ce que le HUB ignore** : « 6 des 24
  choses terminées portent une durée ». Sans lui, « 3 h 55 » se lirait comme une
  semaine légère alors qu'il ne dit que le silence des durées. Même précaution
  que la première ligne de `#temps`.

### Les blocs : ce que le hub propose comme forme de semaine (31 août 2026)

**La demande de Noé** : *« je fonctionne beaucoup en bloc par jour — 3 h le matin
sur la formation, 1 h pour Yuno, 4 h l'après-midi pour le FCH ; ça pour le lundi,
une organisation un peu différente le mardi. J'aimerais que le site me propose
une organisation comme ça pour ma semaine en fonction de mes objectifs, des
heures prévues. »*

**L'ARRANGEMENT SE GARDE D'UNE VISITE À L'AUTRE** (1er septembre 2026, demande
de Noé : *« il faut que la disposition des blocs soit sauvegardée entre 2
chargements de page ; si je modifie, ajoute ou retire un bloc, ce doit être
sauvegardé à la prochaine visite »*). Une table, `semaines_blocs`, une ligne par
semaine.

> *Ce que ça renverse.* Le 31 août, la règle était l'inverse — **« un bloc ne
> s'enregistre pas, les blocs ne doivent être que de l'affichage »** : pas de
> table, rien qui périme, et ce qu'on leur faisait subir mourait avec la page.
> Le motif était juste ; c'est son PRIX que l'usage a révélé — une semaine
> réorganisée à la main se retrouvait reproposée telle quelle au rechargement,
> et le travail d'arrangement était perdu. La conséquence était écrite noir sur
> blanc comme « assumée » ; elle ne l'était pas.

**UN BLOC RESTE UNE PROPOSITION, PAS UNE DONNÉE**, et c'est ce qui n'a pas
changé. On n'enregistre pas un bloc : on enregistre **la forme que Noé a donnée à
sa semaine**.
- **La table ne garde QUE ce qu'il a touché.** Tant qu'il n'a rien arrangé, il
  n'y a pas de ligne et le hub propose. Elle dit ce qu'il a DÉCIDÉ, jamais ce que
  l'algorithme a calculé.
- **« Reproposer les blocs » EFFACE la ligne** au lieu d'en écrire une neuve —
  c'est exactement ce que ce bouton veut dire. Sans ligne, le hub reproposera :
  si les données ont bougé d'ici la prochaine visite, il proposera *mieux*. Y
  figer la proposition du jour serait le contraire du filet.
- **UNE TABLE À PART, et surtout pas une colonne de `semaines`** : là-bas,
  l'existence d'une ligne SIGNIFIE que la semaine est validée — `etat.validee` et
  le bandeau du dimanche s'y fient tous les deux. Y écrire des blocs fermerait le
  rendez-vous du dimanche sans que personne l'ait demandé.
- **Un seul chemin pour les quatre gestes** — glisser, régler, ajouter, retirer
  (`garderLesBlocs`, js/semaine.js). Quatre appels recopiés auraient fini par ne
  plus enregistrer la même chose, et c'est dans la copie oubliée qu'un geste
  cesse d'être gardé.
- **L'écran d'abord, le réseau ensuite — mais SANS retour en arrière**, et c'est
  une exception assumée à la règle de `js/ecriture.js` : l'arrangement est déjà à
  l'écran et vaut pour la session entière. Défaire le geste de Noé parce que le
  réseau a hoqueté serait pire que de le lui dire. **On le lui dit.**
- **Ce qui reste d'une programmation, ce sont toujours les TÂCHES qu'on a posées
  dedans** — leur jour et leur heure. Le bloc est l'échafaudage ; l'échafaudage
  se garde maintenant, le mur n'a pas changé.

**UN BLOC ENGLOBE CE QUI EST DÉJÀ POSÉ, IL NE LE DÉDUIT PAS** — et c'est LA
règle du modèle (correction de Noé, le jour même) :

> *« Si j'ai un événement de 3 h prévu le mardi soir pour le FCH, le site peut me
> proposer un bloc de 4 h sur cet horaire-là. Il ne déduit pas ce que j'ai déjà
> posé : il dit bien que c'est un bloc de 4 h, et lorsqu'on regarde la vue “ce
> qui est posé”, on voit que ce bloc comprend un événement déjà posé. »*

**Ce que ça renverse** : la première version soustrayait le posé du quota, puis
répartissait le reliquat. Elle produisait des blocs qui **fuyaient** les
événements — et un total qui ne valait plus le quota, puisque le terrain n'était
compté nulle part. **Le bloc est un CONTENANT** : le quota s'y verse en entier,
et ce qui est déjà là se retrouve dedans.
- Un bloc né d'un événement **suit son horaire et non les plages** : une plage
  est un défaut, un événement est un fait. Il lui ajoute une heure de marge — le
  temps qui ne se voit pas : arriver, s'installer, ranger, envoyer.
- **Son titre dit ce qu'il englobe** (« FC Hermitage · 4 h · avec Entraînement
  U13 »), sans quoi il ressemblerait à 4 h de travail en plus.
- *Vérifié sur les données de Noé : 26 h de club proposées pour 26 h visées,
  15 h de formation pour 15 h. « Les blocs ne respectent pas les quotas
  d'heures » était le premier reproche ; c'est cette règle qui y répond.*

**LES ÉCHÉANCES PASSENT DEVANT LE QUOTA** (« les blocs doivent être construits en
fonction de ce qui est déjà posé, des quotas d'heure, et des échéances des
objectifs »). Quand le prochain livrable de la formation demande plus que son
quota, c'est lui qui commande : **un quota est une moyenne, une échéance est une
date**. *Mesuré : un livrable à 20 h fait passer la formation de 15 h à 17 h 30 —
tout ce que ses matins peuvent porter.*

**LE HUB INVENTE DEPUIS LES QUOTAS** (choix de Noé entre trois options — un
rythme type déclaré, la déduction, ou la recopie de la semaine passée). Il ne
demande rien et n'apprend rien : `blocsDeLaSemaine` (js/orientation.js) part des
heures visées par espace (20 h club, 15 h formation, × le régime de la période),
retire **tout ce que la semaine porte déjà** — terrain, traitement, forfaits,
durées notées — et répartit le reste dans les plages libres. *Conséquence que
Noé a acceptée en choisissant : la première proposition tombe à côté d'un vrai
emploi du temps — cours, présence à l'entreprise — et se corrige à la main.*

**Trois plages, et un PLAN qui dit qui les occupe** : matin **10 h**–12 h 30,
après-midi 14 h–18 h, soir 20 h–22 h. Dix heures et non neuf (« mes journées
commencent plutôt à 10 h ») : ce ne sont pas des horaires imposés, ce sont **ceux
que Noé a donnés**, et un défaut doit ressembler à ce qu'on fait déjà, sinon on
le corrige chaque semaine.

**DEUX SORTES DE JOURNÉES, ET PAS TROIS** (correction de Noé : *« utilise le
samedi aussi pour les 3 espaces qui ne sont pas perso, enfin il me faut qu'un
jour de repos où ce n'est que perso »*) :

| | matin | après-midi | soir |
|---|---|---|---|
| **travail** (six jours, samedi compris) | formation | club | Yuno |
| **repos** (un seul) | *un seul bloc perso, de 10 h à 22 h* | | |

Le week-end n'est plus une catégorie : six jours portent le travail, un le repos.

**LE JOUR DE REPOS EST UN SEUL BLOC, DU MATIN AU SOIR** (« il doit remplir
l'entièreté de la colonne du jour, un bloc perso sur tout le jour »). Il ne se
découpe pas en plages, et **il échappe au plafond de quatre heures** : celui-ci
protège d'une session de travail trop longue, or un jour de repos n'est pas du
travail.

**IL N'EST PAS LE DIMANCHE PAR PRINCIPE** (correction de Noé :
*« dans l'idée c'est d'avoir un jour de repos dans la semaine, et potentiellement
un peu de Yuno, mais pas forcément le dimanche »*). C'est **le jour le plus
libre** de la semaine — celui qui ne porte rien, donc celui où poser du travail
coûterait le plus. À égalité, le dimanche reste le repos par défaut.

- **LES SEPT JOURS SONT COUVERTS** (31 août 2026, demande de Noé : « il faut que
  ça occupe tous les jours »). La première version remplissait au plus vite :
  elle donnait quatre journées pleines et trois vides, parce qu'elle vidait le
  reste du club dès qu'elle trouvait de la place. **On répartit maintenant AVANT
  de placer** : chaque jour ouvré reçoit sa part du quota, et ce qui n'a pas pu
  se poser revient à la fin sur le jour le moins chargé. Diviser par les sept
  jours donnait une part trop maigre, et il restait des heures que personne ne
  plaçait.

**LA PART D'UN JOUR TIENT COMPTE DE CE QU'IL PORTE DÉJÀ** (1er septembre 2026,
demande de Noé : *« ce n'est pas normal qu'on n'atteigne pas le quota pour la
formation… il faut que les jours soient équilibrés, là il y a beaucoup de
déséquilibre »*). C'est la pièce qui manquait, et elle explique les deux moitiés
de la plainte d'un coup. **Trois règles étaient en cause, et chacune se corrige
là où elle vit** :

1. **Le repli sur la journée entière ne s'ajoute plus à toute pose.** Il était
   collé au fond de `poser`, donc le club — servi le premier — débordait sur le
   MATIN, la seule plage que la formation puisse prendre : elle s'arrête à 20 h,
   et l'après-midi comme le soir lui passent devant. **On sert donc chacun chez
   soi d'abord, et l'on ne déborde qu'ensuite**, en deux tours qui parcourent
   chacun la semaine entière — sans quoi le club du lundi déborderait avant que
   la formation du mardi n'ait vu son matin. *Mesuré sur la semaine du 31 août :
   le club posait 10 h–11 h le mardi, la formation tombait à 1 h 30 ce jour-là,
   et c'était exactement l'heure qui manquait au total — 14 h pour 15 visées.*
2. **La part d'un jour se calcule MOINS ce que le jour porte déjà.** Elle
   ignorait les blocs nés d'un événement : le mardi recevait ses 4 h de club EN
   PLUS des 4 h de son entraînement, pendant que le budget s'épuisait le
   vendredi et que le samedi restait vide. *Mesuré : 9 h le lundi, 9 h 30 le
   mardi, 2 h 30 le samedi, rien le dimanche.*
3. **La part n'est plus plafonnée à quatre heures.** Le plafond dit qu'un BLOC
   ne dépasse pas 4 h — pas qu'un espace ne reçoit que 4 h dans la journée. Les
   confondre rendait le quota inatteignable dès qu'un régime le monte : 26 h sur
   six jours font 4 h 20 par jour, et la part était rabotée avant de commencer.

**LE RELIQUAT VA AU JOUR LE MOINS CHARGÉ**, un bloc à la fois, le classement
refait après chacun. C'est ce qui remplit le quota SANS ramener le déséquilibre :
ce qu'une journée pleine n'a pas pu prendre retombe sur celle qui porte le moins,
et non sur la première venue.

*Mesuré après correction, sur les mêmes données : club 26 h sur 26 visées,
formation 15 h sur 15, et six jours entre 6 h 30 et 7 h 30 au lieu de 9 h / 2 h 30
/ rien.*

**CE QUI RESTE SOUS L'HEURE RALLONGE UN BLOC** (1er septembre 2026, demande de
Noé : *« dans ce cas-là tu peux mettre 3 h au lendemain, quelle règle t'en
empêche ? »* — aucune, sinon une que le hub s'était posée à lui-même).

**« Un bloc fait une heure au moins » ne veut pas dire qu'un reste de 30 minutes
est perdu** : ça veut dire qu'on n'en CRÉE pas un de 30 minutes. On allonge donc
celui d'un autre jour — le matin de la formation passe de 2 h 30 à 3 h — et le
quota tombe juste. **Le jour le moins chargé d'abord**, le classement refait à
chaque pas : c'est la règle du reliquat, et elle protège l'équilibre qu'il vient
d'établir.

*Ce que ça répare, mesuré sur les données réelles du 31 août : trois tâches
posées à 13 h ce lundi-là poussent la pause de midi à 12 h, le matin s'arrête à
12 h, et la formation affichait 14 h 30 pour 15 visées sans aucun recours. Elle
prend maintenant 10 h–13 h le mardi. Un plafond monté par une échéance en profite
de la même façon : 19 h 30 visées, 19 h 30 posées, là où il en manquait une
demi-heure.*

- **Un bloc né d'un ÉVÉNEMENT ne se rallonge pas** : sa durée est celle de ce
  qu'il englobe, elle ne se négocie pas.
- **Il ne s'allonge que par l'APRÈS, et jamais au-delà de quatre heures** ni du
  butoir de son espace — la formation s'arrête toujours à 20 h.
- **Ni au-delà de la pause du midi**, qui est réservée avant lui : c'est ce qui
  arrête le matin du mardi à 13 h et non à 14 h.

**L'HEURE QU'ON A POSÉE PASSE AVANT TOUT** (1er septembre 2026, règle de Noé :
*« le critère n° 1 des tâches, c'est l'horaire fixé lorsqu'elle a été posée — les
blocs le prennent en compte en plus ; puis si elles n'ont pas d'horaire elles
doivent être placées dans les espaces vides, mais en respectant les règles de
l'algorithme »*).

| Ce qu'elle porte | Où elle se dessine |
|---|---|
| une heure, **et un bloc la porte** | en liste dans son bloc, sans horaire |
| une heure, **et aucun bloc ne la porte** | **à son heure**, sur l'échelle |
| pas d'heure | dans un vide de la journée |

**Ce que ça répare** : un événement et une publication restaient à leur heure,
une tâche non — elle était glissée dans un trou. Yuno et le perso n'ayant AUCUN
bloc, aucune de leurs tâches n'était jamais à l'heure prévue : la tâche Yuno de
13 h se dessinait à 16 h 42.

**Ça ne contredit pas « l'heure d'une tâche est une échéance, pas un créneau »**
(31 août) : cette règle vaut DANS un bloc, où la tâche est une liste qu'on fait
dans l'ordre qu'on veut. Hors de tout bloc, il n'y a plus de contenant pour dire
quand ; il ne reste que l'heure, et l'effacer serait perdre la seule chose que
Noé ait dite.

**RIEN NE S'APPUIE SUR UN SEUL BORD** (1er septembre 2026, correction de Noé :
*« l'événement perso n'est pas placé correctement, trop à droite, pas centré »*).
Ce qui est DANS un cadre porte la même marge des deux côtés depuis le 31 août ;
ce qui est DEHORS n'a pas de cadre, donc pas de marge. Il portait
`left: 10px; right: 0` — dix pixels d'un côté et rien de l'autre —, si bien
qu'un événement perso ou une tâche Yuno, qui n'ont jamais de bloc, ne tombaient
pas sur la même verticale que le reste de leur colonne.

**UN VIDE EST CE QUE RIEN N'OCCUPE** — les blocs, la pause du midi, et ce qui
vient d'être posé à son heure. Sans cette dernière part, une tâche sans heure se
glisserait par-dessus la tâche Yuno de 13 h.

**L'ÉCHELLE VAUT DEUX REM PAR HEURE, ANCRÉE EN HAUT — JAMAIS LA HAUTEUR MESURÉE
DE LA PILE** (1er septembre 2026). C'est ce que dit le CSS : la graduation se
répète toutes les 4 rem depuis le haut, et la hauteur d'un bloc vaut sa durée en
rem. Or la LIGNE a un plancher de 25 rem quand l'échelle en fait 24 — **une pile
mesure 376 px là où la journée en vaut 360**. Lire l'échelle dans la mesure
décalait donc tout de 4 % : la pause de midi tombait 4 px trop bas, et
`heureSousLePoint` — l'heure à laquelle on lâche un bloc ou une tâche — se
trompait jusqu'à une demi-heure au bas de la journée. Sur la page dont le seul
objet est de placer, c'est le genre d'erreur qu'on ne voit jamais parce qu'elle
est petite en haut.

**UNE HEURE DE PAUSE ENTRE 12 H ET 14 H, ET C'EST LA DERNIÈRE LIBRE DE LA
TRANCHE.** À 12 h, elle coupait le matin en deux et la formation plafonnait à 2 h
par jour ; repoussée, elle laisse le matin aller jusqu'à elle. Si ce qui est posé
occupe toute la tranche, il n'y a rien à réserver — **le posé commande**.

**ELLE EST CONNUE DE LA GRILLE AUTANT QUE DE L'ALGORITHME** (1er septembre 2026,
défaut trouvé par Noé : *« étant donné qu'il doit y avoir 1 h de libre entre 12 h
et 14 h, la tâche perso du mardi 1 ne peut pas être ici »*). C'est la règle qui
n'avait pas été mise à jour. `pauseDuMidi` (js/orientation.js) est **exportée**,
et les deux écrans s'en servent :

- l'algorithme n'y pose aucun bloc ;
- **la grille ne l'appelle plus un vide.** Depuis le 31 août, ce qui n'a pas
  d'heure « se glisse dans les espaces vides » d'une journée — et pour ce
  calcul-là, une heure gardée libre ressemblait à un trou comme un autre. Une
  tâche perso venait donc s'y loger. **Une heure gardée libre qu'un autre écran
  remplit n'est plus une heure gardée libre.**

Deux copies de ce calcul auraient fini par ne plus dire la même heure : la pause
dépend de ce qui est posé ET des blocs nés d'un événement, donc elle se calcule,
elle ne se devine pas. *Vérifié : le mardi, le bloc s'arrête à 13 h, la tranche
13 h–14 h reste vide, et la tâche perso descend à 14 h ; le lundi, où trois
tâches occupent 13 h–14 h, la pause est 12 h–13 h et rien ne s'y pose.*
- **LE PERSO EN FAIT PARTIE** (même demande : « ça doit intégrer aussi perso,
  par exemple tout un dimanche perso ou un créneau d'1 h sur 3/4 jours »), et
  c'est un renversement de la règle posée le matin même — « rien pour le
  perso ». **Il ne contredit pas la philosophie** : un bloc perso ne mesure rien
  et ne juge rien, c'est du temps GARDÉ, pas un chantier. Le hub ne demandera
  jamais si ce temps a été tenu.
  - **Il n'a pas de budget à épuiser**, et c'est ce qui le distingue des trois
    autres : son temps ne se déduit d'aucun objectif. Le plan lui donne ses
    créneaux, un point.
  - **Le jour de repos est le seul qu'aucun espace de travail ne peut
    réclamer.** C'est la traduction, dans l'algorithme, de la règle qui dit que
    le plancher perso ne se négocie jamais.
- **Un espace À QUOTA qui a atteint son compte ne reçoit plus de bloc** : le hub
  ne remplit pas une semaine pour la remplir. Yuno, qui n'a pas de quota, reçoit
  son enveloppe tant qu'il lui reste des tâches ouvertes — et rien s'il n'en a
  aucune.
- **Les créneaux déjà pris sont retirés** : un entraînement de 17 h 15 coupe la
  plage du soir, une tâche à 13 h avec sa durée aussi. Un événement **sans
  heure** ne bloque rien — c'est la règle du hub, et sinon une simple date
  fermerait la journée.

**QUATRE HEURES AU PLUS** (« finalement t'avais raison, les blocs peuvent faire
4 h max ») — pour tout ce qui est du travail. Seul le jour de repos y échappe.

**DEUX BLOCS QUI SE SUIVENT N'EN FONT QU'UN**, tant que le total tient sous ces
quatre heures. Un après-midi de club prolongé par l'entraînement du soir n'est
pas « 2 h puis 2 h » : la coupure ne venait que de la mécanique — une plage d'un
côté, un événement de l'autre — et elle ne disait rien de vrai sur la journée.
- La tolérance est d'une **demi-heure** : mesuré, un après-midi s'arrêtait à
  17 h 00 et l'entraînement commençait à 17 h 15 ; ce quart d'heure suffisait à
  couper la journée en deux blocs qui disaient la même chose.
- **Un VRAI trou les laisse séparés** — entre le matin et l'après-midi il y a un
  déjeuner —, **et le plafond aussi** : deux après-midi de trois heures qui se
  touchent restent deux blocs, parce que personne ne tient six heures d'affilée.
  C'est exactement ce que le plafond dit.

**LA COLONNE EST LA JOURNÉE, DE 10 H À 22 H** (31 août 2026, Noé : « quand il y
a des espaces vides il faut qu'on le comprenne ou l'indiquer ; on va dire qu'une
journée démarre à 10 h et se finit à 22 h max »).

**Ce que ça remplace** : les blocs s'empilaient les uns sous les autres, dans
l'ordre des heures mais sans distance entre eux — un trou d'une heure et un trou
de quatre se ressemblaient trait pour trait, et l'après-midi vide d'un jour sans
rien à faire ne se voyait pas. **Le vide a maintenant la taille du temps qu'il
dure.** Douze heures, deux rem chacune : la même échelle que la hauteur des
blocs, qui vaut déjà deux rem par heure. *Mesuré : une colonne de 360 px, un
bloc de 14 h posé à 8 rem du haut.*

- **La graduation dit les heures sans les écrire** : un filet toutes les deux
  heures, assez pâle pour qu'on le lise seulement quand on le cherche. Écrire
  « 12 h », « 14 h », « 16 h » dans sept colonnes aurait ajouté quarante-deux
  nombres à une page qui en compte déjà beaucoup — et chaque bloc porte déjà son
  heure de début.
- **LA JOURNÉE A UNE FIN, et l'algorithme la respecte** : un bloc né d'une
  réunion de 20 h à 23 h s'arrête à 22 h — il couvre ce qu'il peut, et l'échelle
  de la colonne reste vraie. Le recalage après un déplacement obéit à la même
  borne.
- **Seule la vue des blocs est graduée** : dans l'autre, les barres s'empilent
  comme partout ailleurs dans le hub. Une même grille, deux lectures.

**SA HAUTEUR EST SA DURÉE** (demande de Noé : « la taille des blocs doit
correspondre à la durée en heure ») — deux rem par heure. C'est la variable
`--duree` que le CSS confronte déjà à un minimum : elle existait pour les
événements et ne servait plus depuis que leur hauteur est fixe (27 août 2026).
Elle reprend du service **ici et ici seulement** : un bloc est un contenant, sa
taille est ce qu'il contient. *Mesuré : 3 h = 90 px, 7 h 15 = 218 px.*

**UN BLOC SE DESSINE COMME UNE BARRE**, et c'est ce qui l'a rendu compatible avec
la grille sans rien réécrire : elle range ses barres par heure, un bloc de 9 h se
pose donc de lui-même avant une tâche de 13 h. Ni axe horaire, ni calque — la
question que Noé posait (« à voir si c'est compatible avec le calendrier
actuel ») se règle là. **Son contour est en pointillé et son fond vide** : tout
le reste du calendrier est plein ou teinté — un événement arrive, une publication
part, une tâche se fait ; un bloc est une INTENTION de temps, et le pointillé est
déjà le signe du hub pour ça.

**DEUX INTERRUPTEURS, ET PAS TROIS VUES** (31 août 2026, Noé : *« c'est le
foutoir complet ; plutôt que d'avoir trois options, donne-moi l'option d'activer
la vision des blocs et la vision de ce qui est posé, du style case à cocher »*).
Deux cases indépendantes — **Les blocs**, **Ce qui est posé** — reprennent
`.cal-coche`, le filtre du calendrier. Elles disent la même chose que trois
boutons sans avoir à nommer la troisième combinaison.

**UNE TROISIÈME CASE : « SÉPARÉS »** (1er septembre 2026, demande de Noé :
*« j'aimerais avoir la possibilité d'avoir un affichage avec le calendrier des
blocs et le calendrier de ce qui est posé, mais pas superposé »*). Les deux
couches, mais **chacune sur sa grille** — les blocs au-dessus, ce qui est posé en
dessous, chacune avec sa légende.

**Il n'y a rien de neuf à dessiner** : ce sont les deux vues à UNE couche que la
page sait déjà faire, rendues l'une sous l'autre. La première est graduée et
porte le texte de ses blocs ; la seconde empile ses barres comme partout ailleurs
dans le hub. **Ni `poserDansLesBlocs` ni `rangerSousLEchelle` ne tournent** :
ces deux passes n'existent que pour faire tenir deux couches dans une colonne,
et c'est justement ce qu'on ne fait plus.
- **Elle reste visible quand elle n'a rien à séparer** — une case qui apparaît
  et disparaît réorganiserait la ligne autour d'elle, ce qu'on refuse depuis le
  31 août.
- **La seconde grille porte son PROPRE identifiant** (`#bloc-grille-pose`), et
  ce n'est pas cosmétique : `heureSousLePoint`, `poserDansLesBlocs` et
  `rangerSousLEchelle` cherchent tous les piles de `#bloc-grille`. Un même
  identifiant leur donnerait quatorze colonnes pour sept jours — et les gestes
  (glisser un bloc, viser une heure) restent ainsi sur la première, la seule qui
  porte des blocs.
- **L'un SOUS l'autre, pas côte à côte** : la grille partage déjà sa largeur avec
  le vivier ; deux grilles de sept jours côte à côte feraient 50 px par jour.

*Ce que ça remplace :* une bascule à trois positions, dont la troisième
superposait les barres à leurs blocs et devenait illisible.

**L'HEURE D'UNE TÂCHE EST UNE ÉCHÉANCE, PAS UN CRÉNEAU** — et c'est la clé de
tout ce qui suit (31 août 2026, Noé explique sa logique) :

> *« L'horaire que je mets à mes tâches, c'est l'heure à laquelle je souhaite les
> avoir finies — je ne veux pas que ce soit trop rigide, j'ai juste ces tâches-là
> à faire avant cette heure, ce bloc. Donc ça n'a pas forcément de sens de
> respecter l'horaire dans l'affichage : elles appartiennent à ce bloc, c'est une
> LISTE dans le bloc, je peux les faire dans l'ordre que je veux. Il y a juste
> les événements et les publications qui respectent un horaire strict. »*

**Deux natures de temps, donc deux dessins** :

| | où ça se dessine | pourquoi |
|---|---|---|
| **tâche** | **en liste dans son bloc**, sans horaire | son heure est une limite, pas un moment |
| **événement, publication** | **à son heure**, en barre par-dessus | un horaire strict est un fait |

- **Une tâche « avant 13 h » appartient au bloc qui se termine à 13 h ou
  avant** — le dernier —, et non à celui qui contiendrait 13 h. C'est ce qui
  manquait : le hub la cherchait DANS un créneau, et une tâche du matin notée
  « 13 h » ne tombait dans aucun.
- **SANS HEURE, C'EST L'ESPACE QUI RATTACHE** (« les tâches qui n'ont pas
  d'horaire doivent être associées au bloc de leur espace présent dans cette
  journée »). C'est le seul lien qui reste quand le temps ne dit rien — et il
  dit quelque chose de vrai : une tâche du club se fera pendant les heures du
  club.
- **CE SONT LES VRAIES BARRES QUI ENTRENT DANS LE CADRE**, pas du texte. Une
  liste écrite disait ce qu'il y avait, mais on ne pouvait rien en faire : pas
  de rond à cocher, pas de menu, pas d'ouverture. Les barres ne peuvent pas être
  ENFANTS du bloc — un bouton ne s'imbrique pas dans un bouton —, elles restent
  ses voisines dans la pile et c'est leur position qui les met dedans.
- **Entre les pointillés, pas collées à eux, et centrées** : une marge
  intérieure de 6 px, et le groupe centré dans ce qui reste du cadre. Un cadre
  dont le contenu touche les bords ne se lit plus comme un cadre.
- **LES BLOCS PERDENT TOUT LEUR TEXTE** — heure, espace, durée — dès que « ce
  qui est posé » est coché, et pour TOUS les blocs, qu'ils portent quelque chose
  ou non. Ils redeviennent ce qu'ils sont, un cadre ; leur nom reste au survol.
- **UNE TÂCHE RANGÉE DANS UN BLOC NE DIT PLUS SON HEURE** : le bloc la dit déjà,
  et la répéter sur chaque ligne vole la place au titre. Au calendrier plein
  écran, où aucun bloc ne la porte, l'heure reste.
- **CENTRÉ EN LARGEUR, PAS EN HAUTEUR** : une marge identique des deux côtés, et
  chacun garde sa place verticale selon son horaire.
- **UN ÉVÉNEMENT OCCUPE SA DURÉE** : un match de deux heures se voit comme deux
  heures. C'est la seule chose de cette grille qui prenne un vrai créneau — la
  hauteur proportionnelle avait été retirée de TOUS les calendriers le 27 août
  2026, elle revient ici et ici seulement, sur une journée à l'échelle.
- **RIEN NE TOUCHE LE POINTILLÉ** — ni sur les côtés, ni en haut, ni en bas
  (6 px). Un événement plus long que son cadre est **borné**, quitte à ce qu'il
  ne colle plus exactement à son horaire : Noé l'a tranché — « quitte à
  descendre de quelques pixels ». On borne sa position et sa hauteur VISIBLE,
  jamais sa durée : c'est le cadre qu'on respecte, pas le fait qu'on rogne.
  - *Deux défauts muets pour y arriver, et tous deux invisibles en lisant le
    code.* `const MARGE` déclarée après son premier usage : zone morte, la
    fonction levait une ReferenceError au premier bloc et six barres gardaient
    l'ancien placement, sans un mot à l'écran. Puis `max-height` ignoré : en
    CSS, un `min-height` l'emporte sur lui, et celui de la barre valait sa
    durée — l'événement dépassait encore de 6 px, exactement la marge qu'on
    venait de lui poser.
- **UNE SEULE LIGNE PAR ÉLÉMENT, ET RIEN NE DÉPASSE DU CADRE** : dans un bloc de
  90 px, un titre qui se replie sur trois lignes chasse tout ce qui suit. Ce
  qu'on lit ici, c'est COMBIEN de choses et lesquelles — l'intitulé entier
  s'ouvre d'un appui. Ce qui ne tient pas est **caché et compté** (« +2 »),
  comme le « +N » d'un jour trop chargé au calendrier : un aperçu qui tronque
  sans le dire ment sur ce qu'il montre.
- **NI ROND NI HEURE dans cette grille** : cette vue sert à PROGRAMMER, pas à
  faire. Cocher une tâche, avancer une publication — les deux gestes existent
  partout ailleurs, et ici même dès qu'on décoche « Les blocs ». Le retrait du
  titre part avec le rond, sans quoi chaque ligne commençait par 21 px de vide.
- **Sous l'échelle, ce qui n'appartient à aucun bloc** : un jour sans bloc de
  cet espace. Elles n'ont ni moment ni cadre, elles ont un jour.

> *Trois essais avant celui-ci, et ils disent tous la même chose.* Poser les
> tâches à leur heure comme les blocs les faisait se couvrir entre elles (trois
> tâches de 13 h), puis déborder sur le bloc suivant une fois décalées. Puis les
> ranger toutes sous l'échelle a fait perdre l'intérêt de la vue mêlée — « on
> perd tout l'intérêt d'avoir les 2 sur une même vue s'il ne superpose pas ».
> **Ce n'était pas un problème de placement mais de MODÈLE** : une tâche n'a pas
> d'horaire, elle a une appartenance. Une fois ça dit, le dessin va de soi.

- **La colonne n'est graduée que si l'on montre les blocs** : sans eux, il n'y a
  pas d'échelle à tenir, et les barres reprennent l'empilement de partout
  ailleurs dans le hub.
- **Les blocs seuls ne portent pas leur contenu** : ils montrent la FORME de la
  semaine, et y écrire ce qu'ils contiennent répondrait à une question qu'on n'a
  pas posée.
- **UNE SEULE LIGNE DE COMMANDES** (31 août 2026, demande de Noé) : le titre, le
  décompte des heures, les cases et les deux gestes. Les séparer en deux rangs
  laissait croire à deux étages de réglage là où il n'y en a qu'un.
  - **ET SES TROIS RANGS SE SERRENT** (1er septembre 2026, demande de Noé :
    « moins d'espace entre la ligne du décompte des heures, jour par jour et le
    calendrier »). Le titre, le décompte et la grille ne sont qu'une seule
    chose ; 8 px puis 12 px les faisaient lire comme trois blocs empilés.
    *Mesuré : 64 px du haut du titre au haut de la grille, ramenés à 52.*
  - **Le décompte se cale sur la même ligne que les cases**, et il a fallu écrire
    `ul.semaine-compteur` pour ça : la règle existait et ne gagnait pas —
    `.bloc ul.semaine-compteur` pose une marge basse et pèse une balise de plus.
    Les douze pixels restaient sous la liste, le conteneur faisait 29 px de haut
    pour 17 de contenu, et le décompte se calait en haut de sa boîte pendant que
    les cases se centraient. **Une spécificité qu'on n'égale pas est une règle
    qu'on n'écrit pas.**
- **RIEN NE DISPARAÎT QUAND ON DÉCOCHE** (« ce n'est pas une page différente,
  c'est juste du contenu qui est ajouté ou enlevé ; seul l'affichage du
  calendrier doit être modifié »). Le décompte reste — il compte les heures des
  blocs proposés, qui existent que la grille les montre ou non —, et les deux
  gestes aussi. Les faire disparaître faisait bouger la page autour d'une case
  à cocher.

**On règle un bloc d'un appui** : jour, début, durée, espace — quatre champs
natifs dans une fenêtre, plus « Retirer ce bloc ». Pas de confirmation, et ça
reste vrai depuis que l'arrangement se garde : « Reproposer les blocs » ramène
tout.

**ET ON Y POSE UNE TÂCHE** : la lâcher sur un bloc lui donne son jour **et son
heure**, là où la lâcher sur le jour ne donne que le jour. Le bloc est une cible
plus fine dans la même surface, pas un second geste — au doigt comme à la souris.
C'est le seul moment où un bloc laisse une trace.

### Le vivier : ce qui attend un jour

**UNE SEULE LISTE, ET CE QUI A GLISSÉ EN TÊTE.** Elle contient les tâches
**sans date** — ce que Noé a demandé — et celles dont la date est **passée sans
être faites**, qui restent autrement coincées dans la semaine d'avant :
invisibles à la grille de la semaine qui vient, donc absentes de la
programmation. Ces dernières **passent devant** (30 août 2026, demande de Noé) :
ce sont elles qu'on reprogramme en premier.

**LA DATE OÙ ELLE ÉTAIT POSÉE S'ÉCRIT À DROITE DE LA TUILE**, et c'est elle qui
remplace les titres de groupe — « Sans date » et « Restées ouvertes » ont existé
une heure et disaient ce que cette date dit déjà, au prix de deux lignes dans
une colonne qui n'en montre que huit. **Une vraie date, jamais un relatif** :
« il y a 4 jours » compterait les jours perdus, ce que le hub ne fait pas, et on
reprogramme mieux en sachant quel jour on avait choisi. Encre discrète, aucun
mot de retard, aucune couleur d'alerte.

**LA COLONNE N'A QUE SON TITRE** — « À poser », rien dessous. Elle a porté une
phrase d'aide (« glisse une tâche sur un jour ; au doigt, touche-la puis touche
le jour ») : deux lignes en permanence pour un geste qu'on n'apprend qu'une
fois. Elle vit désormais dans le nom accessible de chaque tuile, où elle ne
prend aucune place. *Conséquence assumée : le chemin tactile ne s'annonce plus
nulle part à l'écran.*

**LA LIGNE TIENT DANS LA LARGEUR DE LA COLONNE, ET LA CROIX AVEC ELLE** (30 août
2026, symptôme rapporté par Noé : « la croix est difficile d'accès sur ordi, il
faut glisser la colonne sur le côté »). La liste est une grille dont la piste
doit s'écrire `minmax(0, 1fr)` : la piste implicite vaut `auto`, c'est-à-dire la
largeur MINIMALE du contenu — mesuré, 315 px pour une colonne qui en fait 296.
La croix, tout au bout de la ligne, tombait donc hors du champ. C'est le piège
documenté dans les conventions, celui qui ne se voit jamais sur l'écran large où
l'on travaille — et il se paie ici pour la quatrième fois.

**NEUF TUILES, ET LE RESTE DÉFILE DANS LA COLONNE** (demande de Noé). Dix-sept
tâches sans date faisaient une colonne trois fois plus haute que la grille d'en
face : on ne voyait plus les jours où les poser. Le défilement est **dans la
colonne**, pas dans la page — la grille reste sous les yeux pendant qu'on
cherche. La dernière tuile est coupée en deux : c'est ce qui dit qu'il y en a
d'autres, mieux qu'une ombre ou une flèche.

**Le plafond n'a jamais été un chiffre pour lui-même** : il dit « ne dépasse pas
la semaine ». Il valait huit tuiles (26 rem) jusqu'au 31 août 2026 ; la grille
d'en face ayant grandi ce jour-là, il en rend une de plus (30 rem, soit un pas
de tuile). Mesuré : la colonne finit à 450 px, la grille à 452. **Il suit le
même palier que l'agrandissement** — sur téléphone les deux blocs s'empilent,
la colonne ne vole rien à personne, et 26 rem gardent tout leur sens.

**LA CROIX MET DE CÔTÉ POUR LA SEMAINE** (demande de Noé : « elle ne sera pas
traitée cette semaine »). C'est `refusee_le` qui la porte, la **même colonne**
que le « pas aujourd'hui » des pistes du matin : dans les deux cas elle dit la
date POUR LAQUELLE on a dit non. L'accueil la lit au jour, cet écran la lit à la
semaine — d'où la comparaison au lundi.
- **Elle expire d'elle-même** : dimanche prochain, le lundi aura avancé et la
  tâche reviendra dans le vivier. Une mise de côté définitive serait une
  suppression déguisée.
- **Ce qu'on écarte se retrouve**, replié sous « 3 mises de côté cette
  semaine », et se remet d'un geste. Un × sans retour serait un piège, et le hub
  ne cache rien — il range.

### Les trois glissements

| Geste | Ce qu'il écrit |
|---|---|
| une tuile du vivier **sur un jour** | `echeance` = ce jour |
| une barre **d'un jour à l'autre** | le décalage habituel du calendrier |
| une barre **ramenée dans le vivier** | `echeance` et `heure` à `null` — elle se déprogramme |

Le troisième est le geste inverse du premier, et il se devine parce qu'il est
symétrique. Il passe par une option de `brancherDeplacement` (`zones`) plutôt
que par une seconde mécanique : les deux glissements partagent le fantôme qu'on
tient en main et la case qu'on vise (`prendreEnMain`, `jourSousLePoint`,
`viserLeJour`, js/calendrier-commun.js). **Seule une tâche se déprogramme** :
un événement sans date n'existe pas, et une publication sans date rejoindrait la
banque d'idées, où le vivier ne va pas la chercher.

**ON Y AJOUTE AUSSI** (30 août 2026, demande de Noé) — un événement, une tâche,
une publication, un objectif : la tuile de capture s'ouvre en touchant un jour
de la grille, et le **« + » flottant** est là comme ailleurs. Une page où l'on
programme sa semaine doit permettre d'y ajouter, pas seulement d'y ranger ce qui
existe : le rendez-vous dont on se souvient en regardant le jeudi n'a pas à
faire changer de page. Le « + », lui, ouvre sur le **lundi de la semaine
programmée** et non sur aujourd'hui — ce qu'on pose ici appartient à la semaine
qu'on remplit.

**UN JOUR TOUCHÉ FAIT DEUX CHOSES, jamais les deux à la fois** : il POSE la tâche
qu'on a en main s'il y en a une, sinon il OUVRE la tuile. Les deux passent par le
même geste que le calendrier (`brancherSelection`), et ce n'est pas seulement une
question de cohérence : la sélection appelle `preventDefault` au poser du doigt,
ce qui peut avaler le clic sur lequel un second chemin se serait appuyé.

**AU DOIGT, ON NE GLISSE PAS.** Sur une liste verticale, un glissement ne se
distingue pas d'un défilement — c'est la même prudence qui fait n'accepter, sur
les barres du calendrier, qu'un mouvement franchement horizontal. Le toucher a
donc son chemin à lui : **on choisit la tâche, puis on touche le jour**, et les
jours s'allument tant qu'elle est en main. Un second appui la repose — un choix
qu'on ne peut pas défaire est un piège.

### Ce qu'elle ne fait pas

- **Elle ne calcule rien elle-même** : le diagnostic et le bilan viennent de
  `js/orientation.js`, qui ne touche ni au réseau ni au DOM.
- **Ce qui est posé se rouvre.** Toucher une barre ouvre **la même fenêtre de
  détail qu'ailleurs** — lire, modifier, supprimer — et non une fenêtre à elle
  (30 août 2026, demande de Noé : « il faut que je puisse modifier aussi en
  appuyant sur une tâche posée »). *La grille a été une pure surface de
  placement pendant une journée ; c'était une page de moins à tenir, mais une
  page où l'on programme sa semaine doit pouvoir corriger ce qu'on vient d'y
  poser.*
  - **Sauf quand une tâche est en main** : le geste veut alors dire « pose-la
    ici », et c'est la sélection du jour qui répond. Ouvrir une fenêtre
    par-dessus ferait deux réponses pour un seul appui.
  - **`corriger` et `effacer` ont déménagé dans `calendrier-commun.js`** le
    même jour (`corrigerDepuisLeCalendrier`, `effacerDepuisLeCalendrier`) : ils
    vivaient en double, mot pour mot, dans l'accueil et dans l'espace
    Calendrier, et cette page en aurait fait une troisième copie. C'est le motif
    de `poserAuCalendrier`, et la même leçon — c'est dans la copie oubliée qu'un
    champ finit par manquer. **Bilan : 181 lignes retirées, 91 posées.**
- **Treize requêtes à l'ouverture, et c'est assumé** : la page s'ouvre une fois
  par semaine, sur décision, devant un ordinateur. Elle a le droit de coûter ce
  qu'un check-in de mardi matin n'a pas le droit de coûter.
- **Elle reste atteignable hors de sa fenêtre**, par le menu (« Général ›
  Ma semaine ») : la porte de l'accueil est l'invitation, le menu est le
  chemin. Une semaine qu'on veut reprendre le mercredi doit pouvoir l'être.

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
| Google Sans | *(pas de jeton)* | **Les barres du calendrier, et elles seules** — titre et heure. Deux fichiers, roman et italique, variables de 400 à 700. |

**Google Sans est entrée le 31 août 2026** (apportée par Noé, qui l'avait
reconnue sur Google Agenda). Publiée sous **SIL Open Font License** — sa licence
est gardée à côté d'elle (`fonts/GoogleSans-OFL.txt`) —, elle vit dans le dépôt
comme les autres et n'est jamais appelée à un CDN.
- **Son italique a vécu deux heures** : rapatriée pour les publications — c'est
  la seule police du hub qui en ait une vraie —, puis retirée avec elles le soir
  même. Le fichier ne reste pas dans `fonts/` : 60 Ko mis en cache sur chaque
  appareil pour rien. `tools/installer-google-sans.py --italique` le refait.
- **Elle n'a pas de jeton** et ne s'applique nulle part ailleurs : un jeton
  inviterait à l'étendre, et rien ne l'a demandé.
- **`tools/installer-google-sans.py`** la rapatrie et l'allège : deux axes figés
  sur trois (`opsz`, `GRAD` — seule la graisse nous sert), sous-réglage latin,
  **4,8 Mo de TTF réduits à 57 Ko**. Il complète `gvar` avant de sous-régler,
  sans quoi fontTools s'arrête sur un glyphe sans variation.


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
- **LA BARRE RESTE QUAND ON DESCEND, ET ELLE VIT HORS DE L'EN-TÊTE** (29 août
  2026, demande de Noé). Elle était déjà `position: sticky; top: 0` — et elle ne
  collait pas : **un élément collant est borné par son PARENT.** Enfermée dans
  `.haut`, haut d'une centaine de pixels, elle ne pouvait coller que sur cette
  hauteur, puis sortait de l'écran avec lui. Mesuré : à 600 px de défilement,
  elle se trouvait à −553. Enfant direct de `#app`, elle colle sur toute la
  page. Le titre « Hub » et « Se déconnecter », eux, défilent — ce sont les
  onglets qu'on veut sous le pouce, pas l'en-tête.
- **UN GESTE À LA FOIS** (même jour, symptôme rapporté par Noé : « être sur le
  calendrier et en un slide vers la gauche me retrouver sur l'accueil »). Entre
  le relâchement et la navigation s'écoule le temps de l'animation ; un second
  balayage lancé dans cet intervalle repartait du MÊME onglet — `routeCourante`
  n'avait pas encore changé — et faisait sauter deux crans. Le verrou se lève
  APRÈS la navigation, sur l'image suivante.
- **La garde des couches regarde ce qui est DÉPLIÉ**, et non `body.fond-fige` :
  celui-ci reste posé tant qu'une tuile de capture existe dans l'espace courant,
  même repliée, et il coupait donc le balayage sur des écrans entiers — le
  calendrier le premier.
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
  - **`touch-action: pan-y` SUR LES ESPACES, et c'est ce qui le fait marcher sur
    un vrai téléphone** (29 août 2026, après un rapport de Noé : « ça ne
    fonctionne pas sur téléphone alors »). Avec `touch-action: auto`, le
    navigateur décide seul de ce qu'il fait du doigt : dès qu'il croit à un
    défilement, il ANNULE le pointeur et le script ne reçoit jamais son
    relâchement. `pan-y` lui dit — le vertical est à toi, l'horizontal est à
    moi. **Elle ne casse pas les défileurs internes** : la chaîne des
    `touch-action` s'arrête au conteneur de défilement le plus proche, donc le
    rail des projets garde son `auto` et son geste.
    *Leçon de méthode : tous les essais qui simulaient les événements en
    JavaScript passaient — le navigateur n'y participait pas. Un geste tactile
    ne se vérifie pas en dispatchant des PointerEvent.*
  - **Un `pointercancel` sur un geste DÉJÀ FRANC le mène à son terme.** Le
    navigateur peut nous couper en plein mouvement ; laisser la page revenir en
    arrière sous le doigt serait pire que d'achever ce qui était clairement
    engagé. `pan-y` rend le cas rare, ce filet le rend inoffensif.
  - **Le verrou d'un geste à la fois se lève par un DÉLAI, jamais par
    `requestAnimationFrame`** : celui-ci ne s'exécute pas quand la page est
    masquée — écran verrouillé, application en arrière-plan —, et le verrou
    serait resté posé pour toujours, tuant tous les balayages suivants jusqu'au
    rechargement. Trouvé en mesurant, parce que le panneau d'essai était caché.
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

**Gilroy ne sert plus qu'un endroit** — **les onglets**, 600 au repos et 700
actif (28 août 2026). C'est ce qu'Instrument Sans ne pouvait pas donner :
déclarée de 400 à 600, demander 700 la faisait clamper, et l'écart plafonnait à
500/600 sans se voir.

*Elle a aussi porté le titre des barres du calendrier, du 27 août au 31, au
motif qu'on VISE une barre plutôt qu'on ne la lit. Ce motif est tombé le jour où
la forme du titre s'est mise à dire la nature de ce qu'on regarde — voir « Une
barre de calendrier » ci-dessous.*

Gilroy est déclarée dans `css/yuno.css` (chargée sur les trois pages) en 400,
500, 600, 700 et 900 ; les quatre premiers sont dans la coquille : aucun fichier
de plus.

### Une barre de calendrier : la couleur dit l'espace, la police dit la nature

**L'ORDRE D'UNE JOURNÉE : l'heure, puis l'ESPACE** (31 août 2026, demande de
Noé). Le second tri départage tout ce qui tombe à la même heure — et surtout
tout ce qui n'en a pas : sans lui, une journée sans horaire s'affichait dans
l'ordre où les tables avaient été lues, donc les événements d'abord, puis les
tâches, puis les objectifs. **Un ordre qui ne veut rien dire est un ordre qu'on
relit à chaque fois.** Avec, une journée se lit par blocs : le club, la
formation, Yuno, soi.

C'est **l'ordre des journées de Noé**, celui de la galerie des caps depuis le
28 août, et il vit désormais dans `js/format.js` (`ORDRE_ESPACES`,
`rangDEspace`) : « Le chemin », « Le temps » et le calendrier le récitaient
chacun de son côté. `#objectifs` garde la sienne, à trois espaces — perso n'a
pas d'objectifs, et cette liste-là peuple aussi des formulaires.

Règle posée par Noé le 31 août 2026, et elle vaut pour **tous les calendriers** —
le hub, l'accueil, « Ma semaine », le site Yuno, celui du FC Hermitage.

**TOUT CE QUI EST AU CALENDRIER EST UNE TUILE COLORÉE**, à la couleur de son
espace. **La nature se dit par la POLICE, et par elle seule** :

| | sa forme | son titre | ce que c'est |
|---|---|---|---|
| **événement** | tuile **pleine**, encre sombre, sans trait | **gras** (600) | ce qui ARRIVE, à l'heure dite |
| **publication** | une ligne, trait à gauche, **voile à 10 %** | normal | ce qui PART |
| **tâche** | une ligne, trait à gauche, **rien** | normal | le cas ordinaire — ce qu'on fait |

**LES TROIS SE LISENT SUR UNE SEULE ÉCHELLE, celle de la présence** : plein pour
l'événement, un voile pour la publication, rien pour la tâche. **Une publication
prend la MÊME DISPOSITION qu'une tâche** (31 août 2026, demande de Noé) et ne
garde qu'un fond très léger — 10 % au lieu de 22 (« diminue l'opacité de la
couleur de fond »). À cette dose la teinte ne se nomme pas, elle se sent : c'est
la règle du fond des tuiles de `#objectifs`, et il n'en faut pas plus pour la
séparer d'une tâche.

**UNE TÂCHE EST UNE LIGNE, PAS UNE TUILE** (forme demandée par Noé, reprise de
Google Agenda) :

    | ○ 17:30 Story reprise U11

Le **trait** dit l'espace, le **rond** se coche, l'**heure** situe, le **titre**
se lit — et tout coule dans une seule ligne de texte.

- **ELLE EST EN FLUX, ET SURTOUT PAS EN FLEX.** C'est la leçon d'un essai que
  Noé a renvoyé d'une phrase : « rien n'est aligné, l'heure est en haut alors
  que le rond de couleur est centré, le rond cochable est en haut ». Un
  conteneur flex donne à chaque enfant son propre alignement transversal, et
  trois réglages faisaient trois hauteurs. Le flux de texte les pose tous sur la
  MÊME ligne de base sans qu'on règle quoi que ce soit.
- **L'HEURE EST ÉCRITE DANS LE TITRE** (« intégrer l'heure de manière fluide et
  sans qu'elle utilise une ligne à elle seule »), et non à côté — **pour les
  DEUX natures en ligne**, la tâche et la publication (`EN_LIGNE`,
  js/calendrier-commun.js). Une publication a bien une heure : c'est une
  décision éditoriale, et l'oublier lui remettait son rond par-dessus — le
  premier défaut de cette forme, rapporté par Noé. C'est la seule
  façon qu'elle coule avec le texte — le titre se replie derrière elle — **et**
  que la coupe à trois lignes tienne : cette coupe vit sur le titre, qui est un
  `-webkit-box` ; la monter d'un cran, sur la barre, fait de CHAQUE enfant une
  ligne de la boîte — mesuré sur téléphone, le premier mot du titre disparaissait
  sous une ellipse à lui seul.
- **L'écart heure/titre est une VRAIE ESPACE**, écrite dans le texte, pas une
  marge : deux éléments collés ne s'écartent que visuellement — le navigateur
  les traite comme un seul mot et ne peut pas couper entre eux. Mesuré :
  « 13:00Mind- » tenait sur la première ligne et « Map résumé 1 » passait
  dessous.
- **L'heure d'un ÉVÉNEMENT reste dehors**, dans son propre élément : sa barre
  est en colonne — quand, puis quoi —, la mise en page que Noé a redemandée
  telle quelle le 26 août. C'est la seule nature dans ce cas, d'où une liste
  nommée plutôt qu'un test sur « tâche » : le jour où une troisième s'écrit en
  ligne, elle s'ajoute à un seul endroit.
- **EN VUE MOIS, PAS DE ROND**, sur ordinateur comme sur téléphone. Une case de
  mois porte une ligne tronquée à l'ellipse : on y lit ce qui vient, on ne coche
  pas. Le geste existe partout ailleurs — la semaine, le jour ouvert, l'espace
  Tâches, l'accueil.
- **Le rond fait 1,15 em**, contre 1,3 avant le 31 août : il avait été grossi
  quand il était seul devant le titre, et depuis que l'heure le suit sur la même
  ligne, il la dominait. Sa CIBLE n'a pas bougé — elle vit dans le rembourrage,
  pas dans le glyphe.
- **Sur téléphone, en vue semaine, la tâche reprend la colonne commune** : le
  rond revient dans le flux et son retrait tombe. Sept colonnes à 375 px font
  47 px par jour, et les 21 px de retrait ne laissaient plus la place d'écrire
  l'heure. Attention au sélecteur : la règle générale s'appuie sur
  `:not(:has(.cal-barre-heure))`, qui ne reconnaît plus une tâche depuis que
  l'heure est dans son titre.

**C'EST LE REMPLISSAGE QUI PORTE LES TROIS NATURES** — trois degrés de présence,
du plus posé au plus léger —, et le gras vient renforcer l'événement. La grammaire
s'est cherchée en une soirée et a fini là, chaque pas ayant sa raison :

- **La tâche a cherché sa forme en cinq pas ce soir-là** : l'aplat teinté donné
  le matin, repris le soir (« une chose à faire, pas une chose qui arrive » — le
  motif du 13 août, qui tient toujours) ; le trait de couleur à gauche ; ce même
  trait arrondi en tuile ; une pastille ronde en tête de ligne, portée par un
  flex qui désalignait tout ; et enfin le trait de nouveau, avec la ligne en
  flux. Le mouvement va toujours dans le même sens — **une tâche pèse moins
  qu'un événement** — et ce qui a été gagné en route, c'est que **le trait tient
  la colonne sans rien coûter à la ligne** : il est À CÔTÉ du texte, pas dedans.
- **Plus d'italique pour les publications** (dernière correction). Elle n'avait
  plus rien à dire : le remplissage distinguait déjà les trois, et la pente
  coûtait la seule lettre qu'on lit de travers dans une colonne étroite.

**Le titre ET l'heure sont en Google Sans** (« pour l'horaire aussi »).
L'heure était en Geist Mono comme tous les chiffres du hub, et la règle disait
qu'elle y resterait ; elle tombe **ici et ici seulement** — une heure collée à
son titre n'est pas un compteur qu'on aligne en colonne, c'est le premier mot de
la ligne. Les chiffres qui se COMPARENT gardent leur chasse fixe.

**UN ÉVÉNEMENT EST UNE TUILE PLEINE** (même jour, demande de Noé : « remplie
complètement, sans barre sur le côté, quitte à inverser la couleur du texte ») —
c'est le second signe de sa nature, avec le gras : ce qui ARRIVE se pose dans la
semaine, ça ne se coche pas.
- **L'encre s'inverse, et c'est la règle du hub**, pas une exception : « l'encre
  posée sur un aplat d'accent est SOMBRE, jamais blanche ». Les quatre couleurs
  d'espace sont claires — du blanc dessus se lirait à peine. Mesuré : 6,94 sur
  le bleu du club.
- **Pas de trait à gauche** : il redirait la couleur que la tuile entière dit
  déjà, et il rognerait un angle qu'on vient d'arrondir.
- **L'heure passe à l'encre du titre, moins appuyée** : `--texte-discret` est un
  gris pensé pour le fond sombre, il disparaîtrait sur un aplat clair.

**LE RAYON D'UNE BARRE PASSE DE 3 À 6 px** (même jour, « les tuiles un peu plus
arrondies »). Ce sont des tuiles depuis ce jour-là, et 3 px était le rayon d'une
étiquette. **Pas `--rayon-controle` (10 px), essayé et repris dans la foulée** :
à 22 px de haut, l'angle mange la première lettre et la tuile se met à ressembler
à une pastille. Ne pas y retourner sans regarder une semaine chargée.

**CE QUE ÇA RENVERSE, ET IL FAUT LE DIRE.** Depuis le 13 août, une tâche n'était
qu'un **trait de couleur à gauche** — « une chose à faire, pas une chose qui
arrive » —, l'aplat étant réservé à ce qui ARRIVE ; une publication l'avait
rejointe le 25 août pour la même raison. La distinction était juste ; c'est le
MOYEN qui change. **Trois natures et quatre espaces se lisaient sur un seul
canal ; ils en ont deux maintenant**, chacun avec son travail. Ne pas remettre un
fond transparent sur les tâches sans rouvrir cette question-là.

- **Le titre a quitté Gilroy**, d'abord pour la police de texte de son écran
  (`--police-texte`), puis pour **Google Sans** quelques heures plus tard : une
  graisse comme une italique se lisent mieux dans une famille de texte courant,
  et celle-ci a l'italique que les autres n'ont pas. `--police-texte` reste en
  second, pour les glyphes que le sous-réglage latin ne couvre pas.
- **600 et non 700 pour le gras** : Instrument Sans est déclarée de 400 à 600 et
  clamperait au-delà, sans que l'écart se voie.
- **La règle reste posée sur `.cal-barre-titre`**, jamais sur la barre : les
  signes (○ ◐ ◉ ▲ ↗) sont dans le même conteneur et n'ont rien à annoncer ;
  l'heure est en Geist Mono et le restera — elle situe.
- **Le reste — objectif, jalon, commande, relance — garde le normal de la
  tâche** : ce sont des échéances, ni un rendez-vous ni une parution, et leur
  inventer une quatrième forme ferait un alphabet à retenir.
- **Une tâche faite voit sa TUILE pâlir** (6 % au lieu de 22). Effet de bord
  mesuré le jour même : en encre discrète SUR de la couleur, son contraste
  tombait de 5,53 à 3,29 — sous le seuil, et pour la seule chose qu'on relit
  après coup. Le retrait se dit par le fond, plus par l'encre seule.

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

## La forme d'une tuile, et celle d'un choix (30 août 2026)

Deux décisions de Noé le même soir, et elles vont ensemble : elles disent qu'une
forme doit dire ce qu'on fait avec, pas décorer.

### LES TUILES N'ONT PLUS DE CONTOUR

> *« Sur les tuiles, j'aime pas trop avoir des contours (uniquement pour des
> tuiles à l'intérieur d'une tuile). »*

**Une tuile posée dans la page se distingue par sa SURFACE** — `--fond-carte`
sur `--fond`, un écart franc. Le filet ne fait que redire ce que la couleur dit
déjà, et vingt filets sur un écran finissent par le quadriller. Il ne redevient
utile que **lorsqu'une tuile est posée DANS une autre** : là, les deux surfaces
se ressemblent trop pour se séparer seules.

- La règle vaut pour toute la famille : `.bloc li` (l'unité), la tuile de la
  journée, les projets de l'accueil, les objectifs, les habitudes, les
  intentions, les livres, les journées, les caps, les cartes de statistiques,
  les tuiles du vivier.
- **L'exception, mot pour mot** : `.tuile-jour li`, `.fenetre li`,
  `.ajout-tuile li`, et `.cap-projet` dans un cap déplié.
- **`border-color: transparent` plutôt que `border: 0`** : le fond d'un élément
  est peint SOUS sa bordure, un filet transparent ne laisse donc rien voir — et
  rien ne bouge d'un pixel. C'est ce qui permet de le faire en un endroit sans
  reprendre douze géométries, dont la barre d'espace de `.bloc li`, calée sur ce
  1 px. Y remettre une couleur suffit à revenir en arrière.
- **La tuile du vivier a changé de surface** : elle vivait sur `--fond-doux`,
  2 % plus clair que la page, ce que seul son filet rendait visible. La nuance
  qu'elle disait (« pas encore posée dans la semaine ») ne valait pas une tuile
  qu'on ne voit pas.

### UN MENU DÉROULANT EST UNE PASTILLE, PAS UN CHAMP

> *« Les menus déroulants doivent être des pastilles de manière à être
> différentes de l'espace qui note du texte, et elles doivent toutes être côte à
> côte s'il y en a plusieurs sur la tuile. »* Puis, dans la foulée : *« sans
> leur titre »*.

**LA TUILE DE CAPTURE EST LA RÉFÉRENCE** (30 août 2026, Noé en la montrant) :
*« tout ce qui peut être une pastille l'est, pour simplifier la tuile — mais en
respectant ce qui nécessite un espace de texte, donc [on] ne peut pas tout
mettre sous forme de pastille, et en variant les formes et la place si
nécessaire. »* Un champ de texte reste un champ de texte ; **tout ce qui se
RÈGLE devient une pastille**, et la tuile se lit alors d'un regard : une bande
de réglages, puis ce qu'on écrit.

**LA FORME D'UNE TUILE D'AJOUT, dans l'ordre** (30 août 2026) :

1. **le texte principal, SANS CADRE NI ÉTIQUETTE** — une invite en gris qui
   s'efface dès qu'on écrit, comme le « Nom de la tâche » de la capture. C'est
   le premier champ de texte EXIGÉ qui joue ce rôle : le titre d'un objectif, le
   nom d'un projet, celui d'une période. Un formulaire qui n'en a pas garde tous
   ses champs étiquetés — mieux vaut pas de vedette qu'une vedette tirée au
   hasard.
2. **un blanc plus large que les autres**, et il n'est pas décoratif : c'est lui
   qui ISOLE la vedette (« un espace un peu plus important pour que le texte
   soit un peu isolé »). Sans lui, le titre se noyait dans la rangée qui le suit.
3. **la rangée de pastilles** — tout ce qui se RÈGLE : les choix, puis les
   dates.
4. **le reste des champs**, étiquetés comme avant : ce qui demande vraiment un
   espace de texte (un « pourquoi », des notes) ne se met pas en pastille.
5. **le bouton, sans contour** : il porte déjà un aplat, et c'est le seul bouton
   de la tuile — rien à côté de quoi se démarquer.

> *Trois ordres ont été essayés le même soir : la rangée en pied (après tous les
> champs), la rangée en tête (avant le texte), puis celui-ci. Le troisième est
> celui de la tuile de capture, et il ne tenait pas sans le blanc du point 2 —
> c'est justement ce qui avait fait remonter les pastilles au tour d'avant.
> Ne pas les redéplacer sans rouvrir cette question-là.*

**LE CURSEUR EST DANS LE TEXTE À L'OUVERTURE**, et le clavier avec lui (« comme
pour les tâches »). Deux chemins, et le premier est le seul qui marche sur
iPhone : un `focus()` programmé HORS d'un geste ne lève pas le clavier sur iOS,
or l'événement `toggle` d'un `<details>` est mis en file, donc tiré du geste. On
intercepte donc le clic sur le sommaire, on ouvre soi-même, et on donne le focus
dans la foulée. Le second chemin — `toggle` en capture, car il ne remonte pas —
rattrape les tuiles qu'un espace ouvre lui-même : là le clavier attendra le
doigt, mais le curseur est au bon endroit.

**Ce que ça renverse** : le déclencheur d'un `type: 'choix'` avait l'allure des
autres champs — même hauteur, même cadre, même rayon —, au motif que « dans un
formulaire, un choix est un champ comme un autre ». C'est ce motif qui tombe, et
Noé a raison : **on n'ÉCRIT pas dans un choix, on y prend.** Un rectangle à fond
de carte dit « écris ici » ; une pastille dit « choisis ».

- **C'est le dessin de `.pastille-capture`**, au trait près : il n'y a aucune
  raison qu'un choix se présente d'une façon dans la tuile de capture et d'une
  autre dans un formulaire.
- **TOUS LES CHOIX D'UN FORMULAIRE DANS UNE SEULE RANGÉE, EN TÊTE**
  (`.formulaire-choix`, js/gabarits.js — les dix-sept formulaires à la fois).
  « Côte à côte » ne se fait pas si chacun reste coincé entre deux champs de
  texte pleine largeur. *La rangée a passé une heure en PIED, par analogie avec
  la tuile de capture où l'on écrit d'abord et où l'on règle ensuite ; Noé a
  tranché l'inverse, et c'est cohérent avec ce que les formulaires faisaient
  déjà — « Espace » ouvrait celui d'un objectif. Ce qui CADRE se pose avant ce
  qu'on écrit.*
- **AUCUN TITRE AU-DESSUS D'ELLES.** C'est le geste déjà fait sur la ligne d'une
  habitude — « le texte n'est pas nécessaire une fois que je sais à quoi les
  chiffres correspondent » —, et la parade est la même : le sens n'est pas
  perdu, il est **déplacé**. `title` le donne au survol, `aria-label` au lecteur
  d'écran, qui ne sait pas de quoi « Normal » est la valeur.
- **LE POINT DE COULEUR, quand plusieurs pastilles partagent leurs options.**
  Les trois régimes d'une période disent tous « Normal » : sans titre, ils ne se
  distinguaient plus. `marqueEspace` leur pose la couleur de leur espace — celle
  de sa pastille partout ailleurs. Une couleur, pas un mot revenu par la
  fenêtre. *La règle a failli être « on garde le titre dans ce cas-là » ; Noé
  l'a retirée en voyant le point : « t'as rajouté le rond de couleur, donc on
  peut enlever le titre aussi ».*
- **PAS DE CHEVRON** (« sans la flèche sur le côté »). La flèche disait « ceci
  s'ouvre » à un contrôle qui avait l'allure d'un champ ; une pastille pleine
  le dit par sa forme.
- **LA PASTILLE PORTE LA COULEUR DE SA VALEUR** (« avec des couleurs »), et pas
  une teinte décorative : celle que le hub emploie déjà pour cette valeur-là —
  l'espace, la priorité, la famille. Elle se **déduit des options** et ne se
  déclare pas (`teinteDuChoix`) : un champ qui offre les quatre espaces se
  reconnaît à ses clés, et les dix-sept formulaires n'ont pas un réglage de
  plus à apprendre. Sans vocabulaire connu, la pastille garde l'accent de
  l'espace courant. **La couleur suit la valeur** : changer une priorité
  reteinte la pastille sur-le-champ — une couleur qui ment est pire que pas de
  couleur.
- **DEUX VOCABULAIRES DE PLUS, propres aux habitudes** (30 août 2026, demande de
  Noé) : **la cadence se lit en SEPT BLEUS DIFFÉRENTS**, du plus pâle (une fois
  par semaine) au plus franc (tous les jours) — une habitude quotidienne se voit
  avant d'être lue, et la couleur dit l'exigence qu'on se donne, pas un
  jugement. **La teinte marche vraiment** : 202° au premier cran, 227° au
  dernier, la clarté descendant de 78 à 64 %. *Un unique bleu mêlé au gris a été
  essayé d'abord et écarté par Noé — « là c'est juste la saturation qui est
  modifiée » : mélanger une couleur à du gris n'en change ni la teinte ni
  vraiment la clarté, et les sept crans se ressemblaient.* Les deux bornes sont
  choisies, pas trouvées : en deçà de 200° on entre dans le teal de la
  formation, au-delà de 230° dans le violet de perso et de `--famille-calme`,
  qui vit dans la MÊME rangée. Et **« Sans famille » et
  « intendance » ont échangé leur couleur** : elles étaient à l'envers — l'option
  VIDE prenait l'accent de la page et ressemblait donc à un choix fait, tandis
  qu'« intendance », qui est une vraie famille, portait le gris neutre. Le gris
  va à l'absence de choix, la couleur va au choix. *C'est ce qui a rendu
  nécessaire `vide: true` : une teinte qui pose son attribut MÊME sans valeur,
  sans quoi le vide n'a pas d'accroche à lui.*
- **UNE HEURE AUSSI**, avec une horloge au lieu du calendrier : ce sont les deux
  moitiés d'une même question — *quand*. Elle se corrige désormais sur une
  **tâche** et sur une **publication** (30 août 2026, demande de Noé : « dans
  les modifications, il faut que je puisse modifier ou rajouter l'horaire ») ;
  les deux la portaient en base, la posaient à la capture, et ne la
  rattrapaient nulle part. **Pas sur un jalon** : il marque une étape, il
  n'occupe pas d'heure — et sa table n'a pas la colonne. Vidée, elle repasse à
  `NULL` : minuit n'existe pas dans le hub.
- **UNE DATE EST UNE PASTILLE, ELLE AUSSI** (« la date sur ces tuiles peut se
  mettre à la suite des pastilles, sous la forme d'une pastille aussi, avec le
  logo calendrier »). Elle porte le calendrier, dit le nom de son champ tant
  qu'elle est vide — « Échéance », « Du » — puis la date choisie, en court
  (« 15 déc. »). **Elle suit les choix dans la même rangée** : une date se
  règle, elle ne s'écrit pas.
  - **Le champ natif reste, invisible, PAR-DESSUS la pastille** : c'est lui
    qu'on touche, donc le navigateur ouvre son sélecteur sans qu'on l'appelle,
    `FormData` le lit comme avant, et **un champ requis reste focusable** — un
    champ requis que le navigateur ne peut pas atteindre bloque l'envoi en
    silence, sans un mot.

### CE PIÈGE S'EST PAYÉ POUR DE VRAI, DANS LA TUILE DE CAPTURE (2 septembre 2026)

**Défaut rapporté par Noé depuis son téléphone** : *« je ne peux pas modifier la
date lorsque je crée une tâche/un événement ; depuis le + de bas de page je peux
cliquer sur la tuile, sélectionner une date, mais après je suis bloqué, je ne
peux pas enregistrer. »*

**Le champ « debut » est EXIGÉ et vit dans un panneau REPLIÉ** — pas invisible
par-dessus une pastille comme celui d'un formulaire, mais dans un
`.capture-popover[hidden]`. Vide, il rend le formulaire invalide ; et comme sa
bulle ne peut pas s'ouvrir sur un champ que le navigateur ne peut pas atteindre,
**celui-ci refuse d'envoyer SANS RIEN DIRE** : le bouton ne répond pas,
l'événement `submit` ne part même pas, aucun message n'apparaît. *Mesuré :
`checkValidity()` faux, la ligne d'erreur restant masquée.*

**Et l'écran mentait doublement** : la pastille garde son libellé par défaut, qui
est le JOUR D'OUVERTURE de la tuile — à l'œil, la date avait l'air posée.

**LA VALIDATION EST REPRISE À LA MAIN** : le formulaire porte `novalidate`, et
`brancherCapture` (js/calendrier-commun.js) écoute `submit` **en capture** —
avant l'écriture de l'espace. Le premier champ fautif fait **ouvrir son
panneau**, prend le focus, et sa bulle a enfin où se poser.
- **En capture, et une seule fois** : dix écrans écoutent ce formulaire, et une
  garde recopiée dix fois manquerait dans la copie oubliée.
- **Les dix appellent `brancherCapture`** — vérifié : sans lui, `novalidate`
  laisserait passer une écriture sans date.

**Deux autres silences du même genre, corrigés dans la foulée** (js/taches.js) :
retirer la date écrivait **`0`** dans le champ de durée, qui porte `min="5"` —
donc invalide, dans un panneau replié, donc le même refus muet ; et un titre vide
repartait par un `return` nu, sans un mot. Le curseur revient maintenant dans le
champ avec « Il lui manque son nom. »
  - **La parenthèse d'un libellé ne monte pas dans la pastille** :
    « Jusqu'au (vide = un seul jour) » tenait une ligne à lui seul. C'est une
    explication, pas un nom — elle part vers le `title`. Fait une fois dans le
    gabarit, pas dans les huit formulaires qui écrivent une date.
- **LE FOND RESTE VIDE, ET LE FILET EST FIN** : l'encre porte la couleur pleine,
  le filet la porte à 70 %, l'intérieur laisse voir la page. Le trait se lit
  ainsi comme un filet et non comme un cadre (demande de Noé : « le contour des
  pastilles un peu moins large ») — il tenait déjà le minimum géométrique,
  1 px, et descendre sous ce chiffre disparaîtrait sur un écran non retina. C'est le dessin de la pastille « P1 » de la tuile de
  capture, que Noé a montrée en disant « la couleur de la pastille, comme
  celle-là ». Un aplat teinté a été essayé et pesait trop : cinq pastilles
  remplies font cinq taches là où cinq contours font une rangée.
- **Le panneau se retourne plutôt que de se faire couper** (`placerLePanneau`) :
  les choix étant désormais en bas du formulaire, le dernier ouvrait son menu
  dans le bord de la tuile. Il bascule vers le haut, ou vers la gauche, selon la
  place qui reste.

## Conventions de développement

- Code simple et lisible : HTML/CSS/JS vanilla, un fichier js/api.js pour tous les appels Supabase, un fichier par espace.
- **`min-width: 0` sur tout élément de grille ou de flex qui contient une chose
  qui ne s'enroule pas.** Un élément de grille garde `min-width: auto` : il
  refuse de descendre sous la largeur MINIMALE de son contenu, et déborde son
  parent au lieu de rétrécir. Le piège s'est produit **trois fois le 28 et le
  29 août** — la bande d'onglets, la colonne des projets, les deux colonnes de
  la journée — et il ne se voit jamais sur l'écran large où l'on travaille. Pour
  une piste de grille, la même chose s'écrit `minmax(0, 1fr)` et non `1fr`.
- **Avant de nommer une classe CSS OU UNE FONCTION, vérifier que le nom est libre — ET DANS LES TROIS FEUILLES.** `index.html` charge `css/styles.css`, `css/yuno.css` ET `css/fch.css` : un nom pris par la feuille d'un site s'applique au hub. Le 2 septembre 2026, `.projet-tete` (déjà pris par la tuile de projet du tableau de bord) a mis la tête de la page d'un projet sur une seule ligne, titre compris ; `.fiche-tete`, essayé ensuite, était pris par `css/fch.css`. Deux collisions pour une même tête. Le 1er septembre 2026, `construireHabitudesDuJour` a été écrite une seconde fois dans js/perso.js : le module s'est chargé sur « Identifier has already been declared » et a emporté tout l'écran. `node --check` passe — c'est un fichier valide —, seul le chargement tombe. La leçon est la même que pour `.barre` : un `grep` de trois secondes. `.barre`
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
- **LA PAGE N'A PLUS DE PLAFOND DE LARGEUR** (30 août 2026, demande de Noé : « sur ordinateur, le site doit utiliser toute la largeur »). Elle en a eu un de 1240 px, hérité de Bac-3 ; sur un écran de 1728 px il laissait 488 px de vide de part et d'autre. Marges de **16/24/32/48 px** (le quatrième palier est né avec la suppression du plafond : toute la largeur ne veut pas dire bord à bord), ruptures à 720 et 1080 px.
  - **La règle, elle, n'a pas changé — et c'est elle qui rend la suppression possible** : **la mise en page prend toute la largeur, le texte jamais.** Sur grand écran les listes passent en colonnes plutôt que de s'étirer (quatre ou cinq au lieu de trois), et le **texte courant porte sa mesure** : sous-titres, phrases d'aide et écrans vides s'arrêtent à 68 caractères (`.espace > p`, `.sous-titre`, `.vide`). Ce qui empêche une ligne de devenir illisible, ce sont ces deux règles, pas une largeur de page.
  - `--colonne-max` **existe toujours** et vaut `none` : tout ce qui s'alignait dessus — l'en-tête, la barre d'onglets, le voile du menu — continue de s'aligner, et y remettre une valeur suffit à revenir en arrière. Le voile du menu, lui, refaisait le calcul de centrage de cette largeur ; il reprend simplement la marge.
- Migrations : toute évolution du schéma passe par un fichier SQL dans supabase/migrations/, versionné dans git.
- Déploiement : branche main → GitHub Pages. Vérifier que le site fonctionne en local avant de pousser : `node tools/static-server.js`, puis http://localhost:4173 (ouvrir `index.html` en `file://` ne marche pas, les modules ES sont bloqués).
- **`node tools/verifier-gabarits.js` avant de pousser du HTML dans un gabarit.** Un accent grave nu dans un commentaire HTML, à l'intérieur d'un gabarit JS, ferme la chaîne : le fichier reste valide pour `node --check`, et le module casse au chargement en emportant tout l'écran. Le piège s'est produit quatre fois entre le 13 et le 15 août 2026 ; cet outil le voit, `node --check` non. (Un accent grave échappé, lui, est correct.)
  - **Y COMPRIS PAR PAIRES** : un commentaire HTML n'existe pas pour JavaScript, et le PREMIER accent grave referme la chaîne — écrire `` `textarea` `` n'est pas plus sûr qu'un accent grave seul.
  - **L'OUTIL A LUI-MÊME ÉTÉ AVEUGLE, et il a fallu le corriger le 1er septembre 2026.** Il suivait un simple drapeau « dans un gabarit », qui basculait à l'envers au premier gabarit IMBRIQUÉ dans une interpolation — `${rien ? \`<p>… ce n'est pas grave</p>\` : ''}`. À partir de là il lisait le HTML comme du CODE, la première apostrophe française y ouvrait une fausse chaîne, et **tous les commentaires du fichier échappaient au contrôle**. Mesuré sur js/perso.js : l'outil disait « sains » pendant que la page ne se chargeait plus. Il tient maintenant une PILE — `${` empile du code, `}` le dépile —, et il sait distinguer un gabarit d'un autre. *Un outil qui rassure à tort est pire que pas d'outil.*
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
