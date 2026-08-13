# Hub — Tableau de bord multi-projets de Noé

> **À lire en premier : [docs/etat-des-lieux.md](docs/etat-des-lieux.md).**
> Ce fichier-ci dit ce que le hub *doit être* ; l'état des lieux dit où il en
> est, ce qui a été vérifié, ce qui ne l'a pas été, et ce qui attend une
> réponse de Noé. Le mettre à jour en fin de session.
>
> Les sites ont leur propre cahier des charges :
> [docs/yuno-spec.md](docs/yuno-spec.md) et [docs/fch-spec.md](docs/fch-spec.md).
> L'authentification est décrite dans [supabase/AUTH.md](supabase/AUTH.md).

## Contexte

Application web personnelle centralisant l'organisation de 3 projets professionnels et une dimension personnelle, avec un tableau de bord global recentré sur Noé (pas sur les projets). Utilisateur unique : Noé. Usage quotidien (check-in de 5 min le matin), sur ordinateur et mobile.

Les 3 projets + l'espace perso :
- **formation** : validation d'un Bac+3 marketing/communication (Studi) en parallèle d'une alternance. 4 dossiers + 1 vidéo à rendre pour début décembre.
- **photo** : activité de photographe sportif, affichée « Yuno » dans l'interface (marque yuno_rph). La clé reste `photo` en base : c'est la valeur de la contrainte CHECK. Objectifs long terme : CAN 2027, source de revenus début 2027.
- **fch** : alternance au FC Hermitage (communication, partenariats) jusqu'à fin décembre. 4 objectifs de fin d'alternance.
- **perso** : la vie hors projets — sport, sorties, temps pour soi. Ce n'est PAS un projet : aucune mécanique de productivité ne s'y applique (voir philosophie).

## Philosophie du produit (IMPORTANT — guide toutes les décisions d'UI)

Priorités de l'utilisateur, dans l'ordre :
1. **Voir ses progrès et rester motivé** — le dashboard est d'abord un miroir de ce qui a été accompli, pas une liste de ce qui reste.
2. **Garder la vision long terme** — les objectifs et leur "pourquoi" toujours visibles.
3. **Réduire la charge mentale** — maximum 3 tâches actives affichées par projet ; le reste vit en backlog, jamais imposé au regard.
4. **Savoir quoi faire maintenant** — présent mais discret, en fin de page.

Conséquences concrètes :
- Le haut du dashboard montre les victoires récentes et la progression des objectifs (barres, pourcentages), jamais un compteur de retard.
- Chaque objectif affiche son champ "pourquoi" au survol ou au clic.
- Ton neutre et encourageant. Jamais de rouge culpabilisant, pas de "en retard !" agressif — une échéance proche est signalée sobrement.
- Terminer une tâche ou atteindre un jalon crée automatiquement une entrée dans la table `victoires`.

### La dimension perso (règles spécifiques)

Le hub existe pour servir Noé, pas l'inverse. Pour éviter que le professionnel n'engloutisse tout :
- Le dashboard est SA page : il l'accueille par son prénom et s'ouvre sur lui (humeur, victoires), les projets viennent ensuite.
- L'espace perso n'a NI tâches, NI jalons, NI échéances, NI barres de progression, NI backlog, NI notion de retard. Jamais.
- Il contient uniquement : des événements (rendez-vous avec soi-même : séances de sport, sorties, temps photo plaisir), des victoires perso, et des intentions (objectifs sans mesure ni date, ex. « prendre soin de mon sommeil », simplement relues).
- Les victoires perso apparaissent dans le dashboard au même rang que les victoires pro : une belle séance de course compte autant qu'un post Instagram réussi.
- Suivi d'humeur : une question par jour sur le dashboard (« Comment tu te sens ? », échelle 1–5 en un clic, note facultative). Réponse en 3 secondes, jamais de relance culpabilisante si un jour est manqué.

## Architecture

- **Frontend** : site statique (HTML/CSS/JS vanilla, pas de framework), déployé sur GitHub Pages.
- **Données** : Supabase (PostgreSQL), projet `noe-hub-project`.
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

## Structure du site

Neuf espaces, servis par un routeur à deux niveaux (`#espace/vue/id`) :
- `/` ou `#dashboard` — tableau de bord global (tous projets)
- `#taches` — **toutes** les tâches, tous projets : datées ou non, faites ou non. La seule page du hub qui ne cache rien. On y crée une tâche, on y change sa priorité (1 à 4) et son statut. Ailleurs le hub trie pour Noé ; ici on vient voir l'ensemble et ranger.
- `#calendrier` — tout ce qui porte une date, tous projets confondus, filtres par nature (tâches, événements, publications, objectifs)
- `#formation` — espace formation (thème : teal)
- `#photo` — la page Yuno du hub (thème : doré) — tableau de bord réduit et porte vers le site
- `#yuno` — le SITE Yuno : l'habillage du hub disparaît entièrement, chrome et identité propres (voir docs/yuno-spec.md)
- `#fch` — la page FC Hermitage du hub (thème : bleu du club) — tableau de bord réduit et porte vers le site
- `#hermitage` — le SITE FC Hermitage : l'habillage du hub disparaît, chrome et identité propres, fond bleu du club (voir docs/fch-spec.md)
- `#perso` — espace perso (thème : doux, apaisé, distinct des espaces projet)

**Deux formes de projet cohabitent, et c'est voulu :**
- **formation** est un espace projet complet, dans le hub : objectifs avec progression, jalons, tâches (3 actives max + backlog repliable), événements à venir, victoires. C'est `js/espace-projet.js`, une fabrique.
- **photo (Yuno)** et **fch** ont chacun une *page du hub* réduite (le cap en lecture, un aperçu, une capture rapide, les victoires, et la porte) plus un *site* à part entière où toute la gestion vit. Les sites ne réutilisent pas la fabrique : leur structure leur est propre.

L'espace perso affiche uniquement : ses intentions, ses prochains rendez-vous avec soi-même, ses victoires, et la courbe d'humeur des 30 derniers jours.

## Connexion Supabase

- Project URL : https://dpkyealzuabwchccdqcv.supabase.co
- Clé publique (anon) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwa3llYWx6dWFid2NoY2NkcWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjUwNzcsImV4cCI6MjEwMTU0MTA3N30.dJxWsuKZlvyc8uoCLhJVm80TfUg_BLX7IEdwe6VxMf4

Ces deux valeurs peuvent figurer dans le code public. Le token d'accès personnel et les clés secrètes ne doivent JAMAIS apparaître dans le repo (ni en clair, ni dans l'historique git).

## Schéma de base de données

**9 tables.** Les six premières sont celles du hub ; les trois dernières sont nées avec les sites (voir plus bas). Les tables concernées portent une colonne `projet` de type text avec contrainte CHECK (projet IN ('formation', 'photo', 'fch', 'perso')), sauf `jalons` qui hérite du projet via son objectif, et `contacts` / `commandes` qui n'en ont pas.

Usage de la valeur 'perso' : autorisée dans `objectifs` (= intentions : champs cible et echeance laissés vides, aucune progression affichée), `evenements` et `victoires`. Jamais dans `taches` ni `jalons` — l'interface ne doit pas permettre de créer une tâche ou un jalon perso.

### objectifs
- `id` uuid PK default gen_random_uuid()
- `projet` text NOT NULL (check ci-dessus)
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
- `projet` text NOT NULL
- `objectif_id` uuid REFERENCES objectifs(id) ON DELETE SET NULL (nullable)
- `jalon_id` uuid REFERENCES jalons(id) ON DELETE SET NULL (nullable)
- `titre` text NOT NULL — toujours une action concrète commençant par un verbe
- `statut` text default 'backlog' CHECK (statut IN ('backlog', 'actif', 'fait'))
- `echeance` date (nullable) · `heure` time (nullable — minuit n'existe pas : sans heure, la colonne est NULL)
- `priorite` int NOT NULL default 4 CHECK (priorite BETWEEN 1 AND 4) — 1 le plus urgent, 4 le cas ordinaire
- `date_fait` timestamptz
- `created_at` timestamptz default now()

Règle métier : maximum 3 tâches en statut 'actif' par projet. L'UI doit empêcher d'en activer une 4ème (proposer d'en terminer ou repasser une en backlog).

> **En sommeil depuis le 13 août 2026.** Noé a demandé de masquer le réglage backlog/active « pour le moment » : toute tâche naît `actif`, et le plafond de 3 n'est donc plus exercé. La règle et son code (`MAX_TACHES_ACTIVES`, `changerStatutTache`) restent en place — réafficher la pastille de statut suffit à tout rallumer. Voir `docs/etat-des-lieux.md`.

`statut` et `priorite` répondent à deux questions différentes et ne se remplacent pas : `statut` dit **où en est** la tâche, `priorite` dit **combien elle compte**. Une priorité 1 ne dispense pas de choisir ses 3 actives.

### evenements
- `id` uuid PK
- `projet` text NOT NULL
- `titre` text NOT NULL
- `date_debut` timestamptz NOT NULL
- `date_fin` timestamptz
- `lieu` text
- `notes` text
- `created_at` timestamptz default now()

### victoires
- `id` uuid PK
- `projet` text NOT NULL
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
- `projet` text NOT NULL default 'photo' CHECK (projet IN ('formation', 'photo', 'fch')) — pas de 'perso' : l'espace perso ne publie pas
- `titre` text NOT NULL — l'idée, en une phrase
- `reseau` text default 'instagram' CHECK (instagram, tiktok, linkedin, facebook, youtube)
- `format` text default 'post' CHECK (post, carrousel, reel, story)
- `statut` text default 'idee' CHECK (idee, brouillon, pret, publie)
- `date_prevue` date (nullable — NULL = banque d'idées)
- `rubrique` text — la série récurrente, libre
- `notes` text · `lien_publie` text
- `created_at` timestamptz default now()

### contacts

Carnet unique : le réseau de Yuno **et** les partenaires du FCH. Pas de colonne `projet` — le `type` et la `structure` disent l'usage.

- `id` uuid PK
- `nom` text NOT NULL
- `type` text default 'autre' CHECK (joueur, club, media, agence, marque, autre)
- `structure` text — le rattachement (FC Lorient, OM, La Provence…)
- `instagram` text · `email` text · `telephone` text — plusieurs valeurs possibles, séparées par une barre oblique
- `statut` text default 'pas_de_contact' CHECK (pas_de_contact, message_envoye, contact_etabli, bon_contact) — la progression de la relation, dans cet ordre
- `notes` text · `dernier_echange` date
- `created_at` timestamptz default now()

### commandes

- `id` uuid PK
- `titre` text NOT NULL · `client` text
- `statut` text default 'en_cours' CHECK (en_cours, livree)
- `echeance` date · `lien_livrable` text · `notes` text
- `created_at` timestamptz default now()

Livrer une commande insère une victoire, comme une tâche terminée.

## Sécurité (à faire dès la création des tables)

1. Activer Row Level Security sur **toutes** les tables — les 9 actuelles et celles à venir.
2. Mettre en place Supabase Auth par email/mot de passe, un seul compte (celui de Noé). Pas d'inscription publique : désactiver les signups après création du compte.
3. Politiques RLS : toutes les opérations (select/insert/update/delete) réservées au rôle `authenticated`.
4. Le site affiche un écran de connexion simple si la session est absente ; la session persiste entre les visites.

## Dashboard — contenu et ordre

1. **En-tête du jour** : « Bonjour Noé », date, et la question du matin (« Comment tu te sens ? », 5 boutons, réponse en un clic) — remplacée par un remerciement discret une fois répondue.
2. **Victoires récentes** : les 5 dernières, tous projets perso inclus, avec pastille couleur du projet.
3. **Progression des objectifs** : chaque objectif actif avec sa barre de progression et son échéance. Clic → le pourquoi + les jalons.
4. **Aujourd'hui** : les tâches à faire aujourd'hui (ou qui l'étaient déjà — pas de borne basse, le hub ne compte pas les retards mais ne les efface pas), max 9, **dans la forme exacte de l'espace Tâches**. Cochables directement.
5. **Ta semaine** : un **aperçu du calendrier hebdomadaire**, tous projets et toutes natures confondus — la même grille que `#calendrier` en vue semaine.

Ordre 4 avant 5 depuis le 13 août 2026 (demande de Noé) : ce qui se fait dans la journée vient avant ce qui se prépare. « Aujourd'hui » n'est donc plus le bloc discret du bas.

Un **bouton « + » flottant en bas à droite** ouvre la tuile du calendrier — donc n'importe quelle nature datée — **par défaut sur une tâche**.

Check-in matinal : le dashboard doit se lire en moins de 5 minutes, sans scroll excessif sur mobile.

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
`--rayon-pastille`), le retour tactile sur les boutons, la cible tactile de
44 px minimum, le focus clavier jamais supprimé, `prefers-reduced-motion`
respecté, le routeur à niveaux avec mémoire de défilement et titre de page, le
manifeste PWA, `tools/static-server.js`.

**Les trois polices, trois rôles** (`fonts/`, 88 Ko, aucune requête externe) :

| Famille | Variable | Emploi |
|---|---|---|
| Clash Display | `--police-titre` | Titres (`h1`, `h2`), « Hub » dans l'en-tête. Graisses 600 et 700 **seulement** — il n'y a pas d'autre fichier. |
| Instrument Sans | `--police-texte` | Tout le corps de texte, les libellés de section, les boutons. |
| Geist Mono | `--police-chiffre` | Compteurs et pourcentages, via la classe `.chiffre`. Pas les dates en toutes lettres (« dans 4 jours » est une phrase, pas un code). |

**Non repris, volontairement : le ton.** Bac-3 est un outil de pression, et
c'est justifié — 44 livrables, une date de dépôt. Il a une couleur `--flag`
dédiée au retard, un « verdict » en tête d'accueil, et affiche « 3 livrables de
retard ». Le hub dit l'inverse : il montre ce qui est accompli. Reprendre sa
palette telle quelle importerait `--flag` et l'envie de s'en servir. Le hub n'a
pas de couleur d'alerte et n'en aura pas.

Ne pas ajouter de dépendance externe : les polices sont dans `fonts/`, jamais
appelées à un CDN.

## Conventions de développement

- Code simple et lisible : HTML/CSS/JS vanilla, un fichier js/api.js pour tous les appels Supabase, un fichier par espace.
- Un espace n'est **monté qu'une fois** : ses écouteurs sont posés sur la section, qui survit à `innerHTML`, et un second montage les doublerait. Pour se mettre à jour, un espace pose un **`rafraichir()`** — comme il pose `naviguer()` — que le routeur appelle quand on revient dessus. Il relit les données et redessine, il ne rebranche rien.
- Mobile-first : l'usage matinal se fera souvent sur téléphone.
- Largeur, marges et points de rupture repris de Bac-3 : contenu à 1240 px, marges de 16/24/32 px, ruptures à 720 et 1080 px. **La mise en page prend toute la largeur, le texte jamais** — sur grand écran les listes passent en colonnes plutôt que de s'étirer.
- Migrations : toute évolution du schéma passe par un fichier SQL dans supabase/migrations/, versionné dans git.
- Déploiement : branche main → GitHub Pages. Vérifier que le site fonctionne en local avant de pousser : `node tools/static-server.js`, puis http://localhost:4173 (ouvrir `index.html` en `file://` ne marche pas, les modules ES sont bloqués).
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
