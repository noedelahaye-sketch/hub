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

**Quatre espaces, quatre vues transverses, deux sites**, servis par un routeur à
deux niveaux (`#espace/vue/id`). La distinction compte : un **espace** est un
domaine de la vie de Noé et porte une couleur ; une **vue transverse** les
regarde tous et n'en porte aucune.
- `/` ou `#dashboard` — tableau de bord global (tous espaces)
- `#taches` — **toutes** les tâches, tous espaces : datées ou non, faites ou non. La seule page du hub qui ne cache rien — mais elle range. On y crée une tâche, on y change sa priorité (1 à 4) et son statut. Ailleurs le hub trie pour Noé ; ici on vient voir l'ensemble.
  - **« À faire » ne montre qu'UNE occurrence par série** (27 août 2026, demande de Noé) : la plus proche, retard compris. Les suivantes descendent dans **« Ce qui revient »**, repliées par série, avec leur rythme et leur nombre. Sans cette coupe, trois rubriques hebdomadaires noyaient les quatre choses qu'il y avait vraiment à faire — 44 lignes au lieu de 8. Rien n'est caché : tout se déplie.
- `#objectifs` — **« Le cap » : la GALERIE des objectifs** (27 août 2026, demande de Noé, après un échantillon validé). C'est le seul endroit du hub où le cap se règle, et la page qui cache le plus. Elle tient en trois niveaux, jamais quatre :
  - **la galerie ne dit que ce qui se compare** — une tuile compacte par objectif : son espace, son titre, une rangée de marches (un segment par jalon, plein quand il est atteint), « 3 projets · 23 tâches » et son échéance. **Le titre porte seul le poids** (Clash Display 700) ; le nom de l'espace passe en encre discrète, et sa couleur se dit deux fois sans jamais reprendre l'œil : la pastille, et **le fond de la tuile teinté à 5 %** de la couleur de son espace (Noé a regardé 11 %, puis 7, puis choisi 5). À cette dose la teinte ne se nomme pas, elle se sent : deux tuiles voisines ne se ressemblent plus tout à fait, et rien n'a l'air coloré. Le texte garde son contraste (18:1 sur le titre, 6,6:1 sur le service). Ni pourcentage, ni barre continue : un cap se lit en marches franchies. Le tri suit **l'ordre des journées de Noé — FCH, formation, Yuno** (demande du 28 août 2026) ; à l'intérieur d'un espace, le plus proche d'abord, et ce qui n'a pas de date ferme la marche. Une seule liste (`ESPACES`, js/objectifs.js) porte cet ordre : elle range les tuiles, les choix du formulaire et les régimes d'une période. **Pas de filtre par espace** : il a existé une heure, entre le groupement de l'ancienne page et le tri — depuis que les caps arrivent groupés, il ne cachait rien qu'on ne voyait déjà, et six tuiles s'embrassent du regard.
  - **on n'ouvre pas une autre page** : la tuile pressée prend toute la largeur et se déplie sur place, comme un jour de « Ta semaine » s'ouvre en grand. Elle montre le pourquoi, la cible, la frise des jalons, les projets (qui se déplient à leur tour sur leurs tâches), les tâches rattachées au cap sans projet, et — pour « Rembourser mon matériel » seulement — les prestations et le matériel qui le mesurent.
  - **les séries se replient** : quinze « Visuels de la semaine » font UNE ligne, avec leur rythme, ce qu'il en reste et la prochaine date. Sans cette coupe, un projet récurrent redressait le mur que l'espace Tâches a appris à ne pas dresser.
  - **ajouter et modifier ouvrent la tuile volante**, avec tous les détails (`construireFormulaire`) ; la galerie ne garde que les gestes d'un doigt — cocher un jalon, terminer une tâche, ouvrir un cap. Ce qui est irréversible (supprimer, marquer atteint) demande confirmation **sur place**, dans le menu à trois points : pas de fenêtre pour ça, mais un objectif qui emporte ses jalons mérite le second appui.
  - **une SECONDE GALERIE sous la première : les projets** (28 août 2026, demande de Noé). Même forme, un étage plus bas — un projet se compare à un projet comme un cap se compare à un cap, et on y entre du même geste. Ce qu'elle montre et que le dépliage d'un cap ne montrait pas : **les projets qui ne servent aucun cap** (« Album du club », « Suivi de l'alternance ») — ils existaient et étaient invisibles, donc oubliés. Un projet posé ici n'a pas de cap et c'est légitime : de l'intendance, ça existe. **L'avancée n'y a pas la même forme** : un cap franchit des marches (un segment par jalon, on les compte du regard) ; un projet avance tâche après tâche, d'où une barre unique remplie à la proportion faite — quinze segments seraient du bruit.
  - **les périodes ferment la page**, en deux lignes et en encre discrète, avec leur tuile d'ajout à côté d'elles. Voir « les périodes » plus bas.
  - **Il a son onglet — une boussole, « Le cap »** : c'est la page qui regroupe le plus d'informations cachées, elle doit s'atteindre d'un geste. Cela renverse la décision du 26 août, qui l'avait laissée sans entrée dans la barre ; la tuile « Le cap » du tableau de bord y mène toujours.
- `#calendrier` — tout ce qui porte une date, tous espaces confondus, filtres par nature (tâches, événements, publications, objectifs)
- `#formation` — espace formation (thème : teal)
- `#photo` — la page Yuno du hub (thème : doré) — tableau de bord réduit et porte vers le site
- `#yuno` — le SITE Yuno : l'habillage du hub disparaît entièrement, chrome et identité propres (voir docs/yuno-spec.md)
- `#fch` — la page FC Hermitage du hub (thème : bleu du club) — tableau de bord réduit et porte vers le site
- `#hermitage` — le SITE FC Hermitage : l'habillage du hub disparaît, chrome et identité propres, fond bleu du club (voir docs/fch-spec.md)
- `#perso` — espace perso (thème : doux, apaisé, distinct des trois autres)

**Les trois pages espace du hub sont des BILANS** (refonte du 26 août 2026), et
elles ont la même forme sans avoir le même contenu :

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
- `created_at` timestamptz default now()

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
- `created_at` timestamptz default now()

**Un événement porte deux faces depuis le 14 août 2026** (fusion des moments et des événements) : ce qui est *prévu* (date, lieu, type, sa préparation) et ce qui a été *vécu* (les quatre colonnes ci-dessus, plus ses `rencontres`). La table `moments` a disparu — elle ne faisait que recopier son événement. Le vocabulaire, lui, ne bouge pas : l'interface dit toujours « Moments vécus » et « Carnet de terrain ». Voir docs/yuno-spec.md.

### victoires
- `id` uuid PK
- `espace` text NOT NULL
- `titre` text NOT NULL
- `date` date default current_date
- `source` text default 'manuel' CHECK (source IN ('tache', 'jalon', 'objectif', 'manuel'))
- `source_id` uuid (nullable — id de la tâche/du jalon/de l'objectif d'origine)
- `created_at` timestamptz default now()

Alimentation automatique : passer une tâche en 'fait', un jalon en atteint ou un objectif en 'atteint' insère une victoire correspondante. L'utilisateur peut aussi en ajouter manuellement (ex. "Première accréditation obtenue").

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

**Le calcul, lui, reste entier** — `tensionDeLaPeriode` (js/orientation.js), la table `arbitrages` et son API. C'est la règle du jeu de l'orientation, éprouvable hors écran, et le diagnostic de la semaine s'en sert. **Ce qui a disparu, c'est le reproche, pas la mesure** ; plus aucun écran ne l'affiche aujourd'hui.

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

## Dashboard — contenu et ordre

1. **En-tête du jour** : « Bonjour Noé », date, et la question du matin (« Comment tu te sens ? », 5 boutons, réponse en un clic) — remplacée par un remerciement discret une fois répondue.
2. **Victoires récentes** : les 5 dernières, tous espaces perso inclus, avec pastille couleur de l'espace.
   **Masquées depuis le 13 août 2026** (décision de Noé, « pour le moment ») : le drapeau `VICTOIRES_VISIBLES` de `js/dashboard.js` commande le bloc, sa source et son rendu. Cocher une tâche crée toujours sa victoire en base, et l'espace perso comme le site du FCH continuent de les afficher — seul l'accueil se tait.
3. **Le cap** : **gravé, et non en tuiles** (26 août 2026). Du texte posé sur la page — ni carte, ni bordure, ni dépliage — **une colonne par espace**, qui ne dit que l'objectif à l'échéance la plus proche : son nom, son titre, une rangée de points (un par jalon, pleins quand ils sont atteints), son échéance. **Rien ne s'y modifie** : presser la zone mène à `#objectifs`, où le cap se règle. Un lien unique, pas un par objectif — le geste est le même partout : aller voir. **En BAS de page depuis le 13 août 2026** (décision de Noé) : ils disent le cap, pas la journée — on les relit quand on lève la tête, pas en ouvrant l'application.
3 bis. **Ce que je te proposerais** : au plus **trois candidates**, **jamais deux du même espace**, tirées de ce qui n'a **pas de date** — ce qui, faute d'être jamais planifié, n'est jamais fait. Chacune porte **sa raison** : une proposition sans raison est un ordre déguisé, on l'exécute ou on l'ignore mais on ne peut pas la juger. **UNE LIGNE CHACUNE** (28 août 2026) : pastille de l'espace, titre, raison à sa suite en encre discrète, et **deux signes** — un « + » (poser une tâche) ou un calendrier (mettre à aujourd'hui), puis une **croix** pour écarter. Les deux ont le même poids : écarter doit rester aussi facile que prendre. Leur phrase vit dans `title` et `aria-label` — un bouton dit ce qui va se passer, même quand il ne l'écrit plus.

> *Deux formes essayées et abandonnées le même jour.* Des cartes à barre de couleur (la grammaire de `.bloc li`), puis des tuiles empruntées à la galerie du cap : elles disaient juste, mais coûtaient trois cents pixels avant d'arriver au calendrier — « on met trop de temps à arriver au calendrier » (Noé). Une piste n'est pas un cap : c'est une suggestion qu'on prend ou qu'on écarte en un geste, et elle n'a pas besoin d'une carte pour ça. Ne pas les leur rendre. Deux gestes : la prendre (elle passe à aujourd'hui, ou sa première tâche s'ouvre) ou **« Pas aujourd'hui »** — un refus est une **donnée**, pas un échec, et c'est le seul signal qui reste au hub sur l'état du jour puisque l'humeur n'est qu'observée. Il vaut pour la journée : demain la proposition peut revenir, et elle le doit. Le calcul est dans `propositionsDuMatin` (js/orientation.js).

4. **Aujourd'hui** : la journée entière, et plus seulement les tâches (27 août 2026). **Deux colonnes** sur grand écran, empilées sur téléphone dans le même ordre :
   - à gauche, **À faire** — les tâches à faire aujourd'hui (ou qui l'étaient déjà : pas de borne basse, le hub ne compte pas les retards mais ne les efface pas), max 9, **dans la forme exacte de l'espace Tâches**. Cochables directement, et **ouvrables** : appuyer sur une tâche la rouvre dans la tuile, pré-remplie (14 août 2026). Elle ne s'y supprime pas — ce geste vit dans l'espace Tâches.
   - à droite, **À publier** puis **Rendez-vous**. Une publication compte si elle est prévue aujourd'hui ou l'était déjà et n'est pas partie — la règle des tâches, mot pour mot. Un **rendez-vous ne compte que s'il couvre aujourd'hui** : un événement passé n'est pas en attente, il a eu lieu, et le traîner en tête de page serait le reproche que ce hub ne fait jamais.
   - Le rond d'une publication **avance d'un cran** ici comme partout ; un rendez-vous porte son **heure** à la place de la marque et ne se coche pas — c'est un point fixe, pas une chose à faire. Un groupe vide disparaît en entier, titre compris ; une colonne vide aussi, et l'autre prend toute la largeur.
5. **Ta semaine** : un **aperçu du calendrier hebdomadaire**, tous espaces et toutes natures confondus — la même grille que `#calendrier` en vue semaine.
   **Un jour s'y ouvre en grand** (demande de Noé, 24 août 2026) : presser le
   titre d'un jour (« lun. 24 ») lui donne toute la largeur, deux flèches
   passent au jour voisin dans la semaine, et represser ce même titre rouvre la
   semaine. Ce n'est pas un autre écran : c'est la MÊME grille dont les sept
   colonnes changent de largeur, pour que les traits entre les jours se voient
   glisser (`--cal-colonnes`, sept valeurs déclarées une à une — `repeat(7, 1fr)`
   n'aurait rien à interpoler). Ouvrir ou fermer une journée ne redessine donc
   rien : `viserLeJour` ne touche qu'au style, sans quoi l'animation serait
   coupée. La phrase d'aide sous la grille, elle, ne se dit qu'au calendrier
   (`aide: false` sur l'accueil).

Ordre 4 avant 5 depuis le 13 août 2026 (demande de Noé) : ce qui se fait dans la journée vient avant ce qui se prépare. « Aujourd'hui » n'est donc plus le bloc discret du bas.

**L'ordre réellement affiché aujourd'hui**, après les deux décisions du 13 août : en-tête et humeur, « Aujourd'hui », « Ta semaine », « Tes objectifs ». Les victoires sont masquées.

« Aujourd'hui » et « Ta semaine » se recoupent volontairement sur la journée en cours, et ce n'est pas un doublon à corriger : le premier dit **ce qu'on fait**, avec les gestes qui vont avec ; la seconde dit **la forme de la semaine**, et on y glisse des barres.

Un **bouton « + » flottant en bas à droite** ouvre la tuile du calendrier — donc n'importe quelle nature datée — **par défaut sur une tâche**.

Check-in matinal : le dashboard doit se lire en moins de 5 minutes, sans scroll excessif sur mobile.

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

**La barre de navigation : trois mots, puis des signes** (demande de Noé,
27 août 2026). Accueil, Tâches et Perso gardent leur mot — ce sont les vues du
quotidien, et un mot se vise mieux qu'un signe à reconnaître. Les cinq autres
sont des signes : la boussole du cap, le calendrier, le chapeau de la formation,
et **les deux marques en POCHOIR** — `fch-logo-pochoir.png` et
`yuno-signature.png` posés en `mask`, l'encre venant de `currentColor`. Un logo
prend donc la couleur de son onglet, discret au repos et inversé quand il est
actif, au lieu de traîner un fond de sticker et un cadre qui ne sont à personne.
C'est la mécanique que le site FCH utilise déjà pour son onglet d'accueil.

**Une quatrième dans le calendrier : Gilroy** (demande de Noé, 27 août 2026).
Le **titre d'une barre** — et lui seul — est en Gilroy 700, dans les trois
calendriers. La règle est posée sur `.cal-barre-titre` et non sur la barre :
les signes (○ ◐ ◉ ▲ ↗) sont dans le même conteneur et Gilroy ne les dessine
pas — ils retomberaient, glyphe par glyphe, sur une police choisie par le
navigateur. L'heure reste en Geist Mono. Gilroy est déclarée dans `css/yuno.css`
(chargée sur les trois pages) et son Bold est déjà en cache : aucun fichier de
plus.

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
