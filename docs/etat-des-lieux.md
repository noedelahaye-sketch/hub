# État des lieux — 7 août 2026

Point de reprise. `CLAUDE.md` dit **ce que le hub doit être** ; ce document dit
**où il en est**, ce qui a été vérifié, ce qui ne l'a pas été, et ce qui attend
une réponse de Noé. À relire au début d'une session, et à mettre à jour à la
fin. Les deux cahiers des charges (`yuno-spec.md`, `fch-spec.md`) restent la
référence pour leurs sites respectifs.

---

## 1. Ce qui existe

Le hub est **déployé et fonctionnel** :
https://noedelahaye-sketch.github.io/hub/

| Surface | Adresse | État |
|---|---|---|
| Tableau de bord | `#dashboard` | complet |
| Calendrier global | `#calendrier` | complet |
| Formation | `#formation` | complet, avec la progression lue dans le gist Bac-3 |
| Page Yuno du hub | `#photo` | complète |
| **Site Yuno** | `#yuno` | Accueil · Créer · Calendrier · Réseau · Commandes — les cinq écrans |
| Page FCH du hub | `#fch` | complète |
| **Site FC Hermitage** | `#hermitage` | Accueil · Créer · Calendrier · Partenaires — « Club » attend son contenu |
| Perso | `#perso` | complet |

Trois applications installables (`index.html`, `yuno.html`, `hermitage.html`),
chacune avec son icône et son ouverture directe.

**Seule donnée réelle en base : les 42 contacts du carnet réseau.** Tout le
reste est vide — Noé n'a pas encore rempli le hub.

---

## 2. Ce qui n'a jamais été vérifié, et pourquoi

**Aucune écriture n'a été exercée en conditions réelles.** Claude ne saisit pas
les identifiants de Noé : sans session, RLS bloque tout (401 sur les 9 tables,
ce qui est le comportement voulu et a été vérifié).

Conséquence sur la méthode de vérification, à reprendre telle quelle :

- Les fonctions `construire*` ne fabriquent que du HTML à partir de données
  déjà chargées. Elles s'importent et s'appellent seules dans le navigateur,
  avec des données factices — c'est ainsi que tout l'affichage a été vérifié.
- La logique pure (tri, filtres, recherche, ordre des colonnes, calculs du
  gist) se teste de la même façon, et elle l'a été.
- **Ce qui reste non vérifié** : chaque chemin qui écrit dans Supabase, et le
  glisser-déposer des colonnes. Le premier vrai test viendra de Noé.

Pour vérifier localement : `node tools/static-server.js` puis
http://localhost:4173 (`file://` ne marche pas, les modules ES sont bloqués).

---

## 3. Ce qui attend une réponse de Noé

**FC Hermitage** (`docs/fch-spec.md`, §7) :
1. Les rubriques éditoriales proposées (avant-match, résultats, portrait,
   coulisses, partenaire, vie du club) correspondent-elles à ce qu'il publie ?
2. Ses 4 objectifs de fin d'alternance — nommés nulle part.
3. Des statuts de relation pour les partenaires, ou trop tôt ?
4. Le contenu de l'écran « Club ».

**Yuno** — deux lectures de captures à confirmer :
5. Le type des deux agences était tronqué (« Agence … ») ; « Agence » a été
   retenu.
6. « Nouhou Tolo » était coupé en bas de capture : lu `@salvadorebanouh`,
   club « Sounders ».

**Sur le fond bleu du FCH** : le logo y perd en lisibilité (traits noirs et
bleus). Noé a demandé de retirer la plaque blanche qui corrigeait cela ; c'est
assumé, mais à rouvrir s'il le trouve gênant à l'usage.

---

## 4. Ce qui manque encore

Rien d'ouvert dans les cahiers des charges. Restent des conforts :

- **Le site FCH grandira** : Noé annonce « beaucoup d'usages » et ne sait pas
  encore ce que contiendront marketing et organisation club. Ne rien inventer
  à sa place — chaque écran est une sous-adresse indépendante, on en ajoute un
  quand le besoin est constaté.
- **Les outils d'aide à la création** dans « Créer » (Yuno et FCH) : ils
  attendent l'analyse du marché que Noé fera lui-même.
- **La base et ses affichages** n'existent que pour le carnet réseau. Le même
  mécanisme (colonnes qui savent se comparer, se chercher, se dessiner, se
  filtrer) s'appliquerait aux commandes, aux publications et aux partenaires :
  c'est du branchement, pas de la construction.
- **Suivi automatique des abonnés Instagram** : possible mais coûteux en
  tuyauterie (app Meta, jeton à renouveler tous les 60 jours, fonction
  serveur). Différé.
- **Modifier une tâche, un événement, une publication** : seuls les objectifs
  se modifient. Le reste se supprime et se recrée — jugé plus rapide.

---

## 5. Décisions à ne pas défaire sans raison

Celles qui ne sont pas déjà dans `CLAUDE.md` ou les cahiers des charges :

**Les données personnelles n'entrent pas dans le dépôt.** Le dépôt est public.
Les 42 contacts (numéros, comptes Instagram) sont allés directement dans
Supabase via SQL, jamais dans un fichier versionné. Seul le schéma l'est. Toute
reprise d'un tableau Notion suit cette règle.

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

---

## 6. Deux pièges rencontrés, pour ne pas les revivre

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
| `js/app.js` | Routeur, session, coquille commune des trois entrées |
| `js/api.js` | **Tous** les appels Supabase, une fonction par usage |
| `js/espace-projet.js` | La fabrique d'espace projet (formation) + gabarits partagés |
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date |
| `js/yuno.js` | Le site Yuno, dont la base du carnet réseau |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
