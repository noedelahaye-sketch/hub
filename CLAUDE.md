# Hub — Tableau de bord multi-projets de Noé

## Contexte

Application web personnelle centralisant l'organisation de 3 projets professionnels et une dimension personnelle, avec un tableau de bord global recentré sur Noé (pas sur les projets). Utilisateur unique : Noé. Usage quotidien (check-in de 5 min le matin), sur ordinateur et mobile.

Les 3 projets + l'espace perso :
- **formation** : validation d'un Bac+3 marketing/communication (Studi) en parallèle d'une alternance. 4 dossiers + 1 vidéo à rendre pour début décembre.
- **photo** : activité de photographe sportif (marque yuno_rph). Objectifs long terme : CAN 2027, source de revenus début 2027.
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
  - **URL du gist** : https://gist.github.com/noedelahaye-sketch/2b1ea392e8d1cea8b601e574d4100aa5
    (id `2b1ea392e8d1cea8b601e574d4100aa5`, fichier `studi-suivi-sync.json`, description « Suivi Studi — synchronisation »).
  - L'identifiant n'est écrit nulle part dans le code source : `js/app.js` appelle `GET /gists` avec un token personnel et retient le premier gist contenant `studi-suivi-sync.json` (`findOrCreateGist`), puis garde l'id dans le `localStorage` du navigateur sous la clé `studi-sync-gist-id`. L'id ci-dessus a été retrouvé via l'API GitHub le 6 août 2026.
  - Structure du JSON : `status` (état par question, ex. `"b1-Q1": "todo"`), `checks` (cases cochées par question), `notes`, `fiche`, `journal`, `box` (niveau de révision par flashcard, pour la répétition espacée), et `_ts` (horodatage servant à arbitrer entre local et distant).
  - **Le gist est privé (`public: false`) — point à trancher avant de coder l'espace formation.** Un gist privé ne se lit pas sans token GitHub, et aucun token ne doit figurer dans le repo public du hub. Trois options : rendre le gist public (le contenu n'est qu'un état de révision, sans donnée sensible) et le lire en anonyme ; passer la lecture par une Edge Function Supabase qui garde le token côté serveur ; ou faire écrire au site Bac-3 sa progression directement dans une table Supabase du hub. Tant que ce point n'est pas tranché, l'espace formation ne peut pas afficher la progression des révisions.

## Structure du site

4 espaces accessibles par navigation :
- `/` ou `#dashboard` — tableau de bord global (tous projets)
- `#formation` — espace formation (thème : teal)
- `#photo` — espace photo (thème : corail)
- `#fch` — espace FC Hermitage (thème : couleurs du club)
- `#perso` — espace perso (thème : doux, apaisé, distinct des espaces projet)

Chaque espace projet affiche : ses objectifs avec progression, ses jalons, ses tâches (3 actives max + backlog repliable), ses événements à venir, ses victoires.

L'espace perso affiche uniquement : ses intentions, ses prochains rendez-vous avec soi-même, ses victoires, et la courbe d'humeur des 30 derniers jours.

## Connexion Supabase

- Project URL : https://dpkyealzuabwchccdqcv.supabase.co
- Clé publique (anon) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwa3llYWx6dWFid2NoY2NkcWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjUwNzcsImV4cCI6MjEwMTU0MTA3N30.dJxWsuKZlvyc8uoCLhJVm80TfUg_BLX7IEdwe6VxMf4

Ces deux valeurs peuvent figurer dans le code public. Le token d'accès personnel et les clés secrètes ne doivent JAMAIS apparaître dans le repo (ni en clair, ni dans l'historique git).

## Schéma de base de données

6 tables. Les tables concernées portent une colonne `projet` de type text avec contrainte CHECK (projet IN ('formation', 'photo', 'fch', 'perso')), sauf `jalons` qui hérite du projet via son objectif.

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
- `echeance` date (nullable)
- `date_fait` timestamptz
- `created_at` timestamptz default now()

Règle métier : maximum 3 tâches en statut 'actif' par projet. L'UI doit empêcher d'en activer une 4ème (proposer d'en terminer ou repasser une en backlog).

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

## Sécurité (à faire dès la création des tables)

1. Activer Row Level Security sur les 6 tables.
2. Mettre en place Supabase Auth par email/mot de passe, un seul compte (celui de Noé). Pas d'inscription publique : désactiver les signups après création du compte.
3. Politiques RLS : toutes les opérations (select/insert/update/delete) réservées au rôle `authenticated`.
4. Le site affiche un écran de connexion simple si la session est absente ; la session persiste entre les visites.

## Dashboard — contenu et ordre

1. **En-tête du jour** : « Bonjour Noé », date, et la question du matin (« Comment tu te sens ? », 5 boutons, réponse en un clic) — remplacée par un remerciement discret une fois répondue.
2. **Victoires récentes** : les 5 dernières, tous projets perso inclus, avec pastille couleur du projet.
3. **Progression des objectifs** : chaque objectif actif avec sa barre de progression et son échéance. Clic → le pourquoi + les jalons.
4. **Semaine** : événements et échéances des 7 prochains jours, tous projets.
5. **Aujourd'hui** (discret, en bas) : les tâches actives (max 9 = 3×3), cochables directement.

Check-in matinal : le dashboard doit se lire en moins de 5 minutes, sans scroll excessif sur mobile.

## Conventions de développement

- Code simple et lisible : HTML/CSS/JS vanilla, un fichier js/api.js pour tous les appels Supabase, un fichier par espace.
- Mobile-first : l'usage matinal se fera souvent sur téléphone.
- Migrations : toute évolution du schéma passe par un fichier SQL dans supabase/migrations/, versionné dans git.
- Déploiement : branche main → GitHub Pages. Vérifier que le site fonctionne en local (ouvrir index.html) avant de pousser.
- Langue : toute l'interface en français.
