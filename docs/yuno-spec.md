# Yuno — cahier des charges de l'espace

**BROUILLON, 2e version** — réécrit après les réponses de Noé du 6 août 2026.
La première version organisait tout autour d'un pipeline de reportage ; c'était
à côté : l'espace sert d'abord **le cap et la création**, les commandes viennent
après. Les points encore ouverts sont en §7. Chaque règle s'accompagne de sa
raison ; si une règle gêne à l'usage, on la change en connaissance de cause.

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

**Couleurs** — celles du logo : gris très foncé, doré, blanc.

| Rôle | Valeur | Note |
|---|---|---|
| Fond (mode sombre) | `#1a1a1a` env. | Relevé sur le logo — à ajuster sur le fichier source. |
| Accent | `#e6a71c` env. | Le doré du Y. Relevé approximatif, idem. |
| Texte fort | `#ffffff` | Le blanc du logotype. |

Règle de contraste : le doré pur vit sur fond sombre. En mode clair, il
s'assombrit en ocre (`#8a6a10` env.) pour rester lisible — un doré clair sur
fond blanc ne se lit pas. Le logo lui-même (avec la Belhanda manuscrite) est
utilisé comme image, en tête de l'espace.

> **À faire** : déposer le fichier du logo dans `img/` (SVG ou PNG). Il servira
> d'affichage et de source exacte pour les codes couleur.

**Typographie** — l'identité Yuno utilise Canela Deck (titres), Gilroy
(texte) et Belhanda (script, le « style »). Deux réalités à concilier :

- Canela et Gilroy sont des polices commerciales. **Le repo du hub est
  public** : y déposer les fichiers reviendrait à les redistribuer à quiconque
  — à ne pas faire, même licence en poche.
- La Belhanda n'a pas besoin d'être une police du site : elle vit dans le
  logo, en image. C'est là qu'elle fait son effet.

Proposition (à trancher, §7) : des équivalentes libres proches, auto-hébergées
comme les polices du hub — **Cormorant** ou **Fraunces** pour le rôle Canela
(serif élégant, éditorial), **Figtree** pour le rôle Gilroy (sans géométrique
sobre). L'espace Yuno serait le seul du hub à charger ces deux familles.

**Ton** : carnet d'atelier. Dense, factuel, et le doré réservé à ce qui compte
— si tout est doré, plus rien ne l'est.

---

## 4. Les écrans

### `#photo` — l'accueil : le cap

1. **Objectifs** — ceux du projet photo, avec pourquoi et jalons. En premier :
   c'est la réponse à « où je veux aller ».
2. **En création** — les 3 prochaines publications prévues et les dernières
   idées notées, avec la porte vers le calendrier. Un aperçu, pas l'outil.
3. **Victoires** — livraisons, jalons de la marque, accréditations.
4. Les portes vers les outils : Calendrier · Réseau · Commandes.

Pas d'écran CAN 2027 : c'est un objectif parmi les gros, pas un lieu.

### `#photo/calendrier` — l'outil phare

Le calendrier éditorial et la banque d'idées, une seule matière à deux états :
**une idée est une publication sans date**. Noter une idée prend cinq
secondes ; la programmer, c'est juste lui donner une date.

- Une publication porte : un titre/l'idée, le réseau, le format (post,
  carrousel, réel, story), une date prévue (ou rien), un statut
  (`idée → brouillon → prêt → publié`), des notes (légende, plan, références).
- **Vue « À venir »** : les publications datées, dans l'ordre. Le trou de la
  semaine prochaine se voit — c'est le but d'un calendrier éditorial.
- **Vue « Banque d'idées »** : les sans-date, les plus récentes d'abord.
  C'est le backlog créatif ; il ne se vide jamais et ne culpabilise pas.
- **Aide à la création** : des rubriques récurrentes (séries — ex. « coulisses
  de match », « avant/après retouche ») que l'on définit une fois ; proposer
  une idée dans une rubrique est plus facile que partir de zéro.
- Publier = passer en `publié`, avec le lien. Chaque publication publiée est
  une victoire ? — non : ce serait du bruit à raison de plusieurs par semaine.
  Les victoires restent manuelles ou liées aux jalons.

### `#photo/reseau` — le carnet réseau

Un CRM sans le mot : des fiches (club, média, marque, photographe, autre)
avec les liens (Instagram, mail, téléphone), des notes libres, et la date du
dernier échange. Pas de relances automatiques, pas d'étapes de vente — un
carnet d'adresses qui se souvient de ce qu'on s'est dit.

### `#photo/commandes` — le suivi des commandes

Volontairement simple, et en dernier : titre, client, statut
(`en cours → livrée`), échéance éventuelle, lien du livrable, notes. Livrer
une commande crée une victoire. On l'étoffera si l'activité le réclame —
pas avant.

---

## 5. Les données

Les tables du hub servent déjà : `objectifs`, `taches`, `evenements`,
`victoires` (projet `photo`). S'ajoutent trois tables, par migration versionnée
dans ce repo (gardien unique du schéma Supabase) :

### publications
- `id` uuid PK
- `titre` text NOT NULL — l'idée, en une phrase
- `reseau` text default 'instagram'
- `format` text CHECK (format IN ('post','carrousel','reel','story'))
- `statut` text default 'idee' CHECK (statut IN ('idee','brouillon','pret','publie'))
- `date_prevue` date — NULL = banque d'idées
- `rubrique` text — la série récurrente, libre
- `notes` text — légende, plan, références
- `lien_publie` text
- `created_at` timestamptz default now()

### contacts
- `id` uuid PK
- `nom` text NOT NULL
- `type` text CHECK (type IN ('club','media','marque','photographe','autre'))
- `instagram` text · `email` text · `telephone` text
- `notes` text
- `dernier_echange` date
- `created_at` timestamptz default now()

### commandes
- `id` uuid PK
- `titre` text NOT NULL · `client` text
- `statut` text default 'en_cours' CHECK (statut IN ('en_cours','livree'))
- `echeance` date · `lien_livrable` text · `notes` text
- `created_at` timestamptz default now()

RLS et politiques identiques aux six tables existantes : tout réservé au rôle
`authenticated`.

---

## 6. Ce que le hub montre de Yuno

Le rappel quotidien vit sur le dashboard, pas ici :

- les tâches actives et la progression des objectifs photo — déjà en place ;
- les victoires Yuno — déjà en place ;
- **les publications datées de la semaine**, dans « Ta semaine », au même rang
  que les événements — à brancher quand la table `publications` existera.

---

## 7. Ce qu'on ne construit pas (encore)

- **Compta** : le jour où les revenus arrivent, ce sera une vraie question.
- **Suivi automatique des abonnés Instagram** : techniquement possible
  (compte créateur relié à une Page Facebook, app Meta, jeton longue durée à
  renouveler ~60 jours, Edge Function Supabase pour garder le jeton hors du
  site public). De la tuyauterie réelle pour un chiffre : différé tant que le
  besoin n'est pas net.
- **Gestion de fichiers photo** : les photos vivent dans Lightroom et sur les
  disques ; ici, des liens et des états.
- **Le pipeline détaillé de reportage** (v1 de ce document) : les commandes
  simples suffisent pour commencer.

---

## 8. Questions restantes

1. **Polices** : équivalentes libres (Cormorant ou Fraunces + Figtree) — ou
   autre chose ? Les originales ne peuvent pas entrer dans un repo public.
2. **Le logo en fichier** : à déposer dans `img/` (les codes hex exacts en
   sortiront aussi).
3. **Calendrier** : Instagram seul pour commencer, ou d'autres réseaux dès
   maintenant ? Les formats proposés (post, carrousel, réel, story) suffisent ?
4. **Rubriques récurrentes** : lesquelles existent déjà dans ta tête ?
   (Elles seront pré-remplies à la création de l'outil.)
5. **Réseau** : qui doit y entrer en premier — et qu'as-tu besoin de
   retrouver en trois secondes sur une fiche ?
