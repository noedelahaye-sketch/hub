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

**Couleurs** — celles du logo (`img/yuno-logo.jpg`, déposé le 7 août 2026 ;
valeurs mesurées sur le fichier) :

| Rôle | Valeur | Note |
|---|---|---|
| Fond (mode sombre) | `#181818` | Le fond du logo. |
| Accent (sombre) | `#e8b000` | Le doré du Y, dominant. |
| Accent (clair) | `#8f6c00` | Le même doré assombri en ocre. |
| Texte fort | `#ffffff` | Le blanc du logotype. |

Règle de contraste : le doré pur vit sur fond sombre ; en mode clair il
s'assombrit en ocre — un doré clair sur fond blanc ne se lit pas. Le logo
(avec la Belhanda manuscrite) s'affiche en tête de l'espace, rond, zoomé sur
le mot.

**Typographie** — l'identité Yuno : **Canela Deck** pour les titres, **Gilroy**
pour le texte, la Belhanda restant dans le logo, en image.

Décision de Noé (7 août 2026) : utiliser les polices commerciales malgré le
repo public, risques compris et acceptés. Fichiers repris de sa machine :
Canela Deck Regular/Bold (versions d'essai « Trial » — noté), Gilroy
Regular/Medium/SemiBold. Servis en OTF/TTF faute de convertisseur woff2
(75–80 Ko pièce, acceptable). Ces familles ne chargent que dans l'espace Yuno ;
le reste du hub garde les siennes.

**Ton** : carnet d'atelier. Dense, factuel, et le doré réservé à ce qui compte
— si tout est doré, plus rien ne l'est.

---

## 4. Les écrans

**Deux surfaces, décision de Noé (7 août 2026).** Il faut avoir l'impression
de *sortir du hub* en entrant chez Yuno :

- **`#photo` — la page Yuno du hub.** Un tableau de bord réduit : le cap en
  lecture, l'aperçu création, une capture d'idée au vol, les victoires, et la
  porte « Entrer sur le site Yuno ». Habillage du hub conservé. Rien ne s'y
  gère.
- **`#yuno` — le site Yuno.** Tout l'habillage du hub disparaît : ni logo Hub,
  ni onglets, ni autres projets. En-tête : la signature seule
  (`img/yuno-signature.png`, PNG transparent déposé par Noé le 7 août) — ni
  « Yuno » en texte, ni sous-titre. Navigation :
  Accueil · Créer · Calendrier · Réseau · Commandes. **Le site est toujours
  sombre**, quel que soit le réglage du téléphone : la signature blanche et or
  ne vit que sur fond sombre, et ça dit « on a quitté le hub ». Fond `#181818`,
  celui du logo. Une seule sortie, discrète, en pied de page : « Quitter le
  site » — nécessaire en plein écran sur téléphone, où il n'y a pas de barre
  d'adresse.

**« Créer » et « Calendrier » sont deux choses (décision du 7 août).**
« Créer » regroupe le calendrier éditorial et les futurs outils d'aide à la
création. « Calendrier » recense tout ce qui porte une date chez Yuno —
publications, tâches, événements, objectifs et jalons — avec des filtres par
nature. Le hub a le même espace Calendrier, tous projets confondus
(`#calendrier`).

### `#yuno` — l'accueil du site : le cap

1. **Objectifs** — ceux du projet photo, avec pourquoi et jalons. En premier :
   c'est la réponse à « où je veux aller ».
2. **En création** — les 3 prochaines publications prévues et les dernières
   idées notées, avec la porte vers le calendrier. Un aperçu, pas l'outil.
3. **Victoires** — livraisons, jalons de la marque, accréditations.
4. Les portes vers les outils : Calendrier · Réseau · Commandes.

Pas d'écran CAN 2027 : c'est un objectif parmi les gros, pas un lieu.

### `#yuno/creer` — l'outil phare

Le calendrier éditorial et la banque d'idées, une seule matière à deux états :
**une idée est une publication sans date**. Noter une idée prend cinq
secondes ; la programmer, c'est juste lui donner une date.

- Une publication porte : un titre/l'idée, le réseau (**Instagram d'abord,
  TikTok et LinkedIn aussi** — décision du 7 août), le format (post,
  carrousel, réel, story), une date prévue (ou rien), un statut
  (`idée → brouillon → prêt → publié`), des notes (légende, plan, références).
- **Vue « À venir »** : les publications datées, dans l'ordre. Le trou de la
  semaine prochaine se voit — c'est le but d'un calendrier éditorial.
- **Vue « Banque d'idées »** : les sans-date, les plus récentes d'abord.
  C'est le backlog créatif ; il ne se vide jamais et ne culpabilise pas.
- **Aide à la création** : des rubriques récurrentes, pré-remplies avec celles
  de Noé — *Raw to edit*, *Raw vs edit*, *No accreditation, no problem*
  (photos depuis les tribunes), *Un mois en tant que photographe sportif* —
  et libres pour la suite : proposer une idée dans une rubrique est plus
  facile que partir de zéro. L'analyse du marché (ce qui marche déjà sur les
  réseaux) viendra nourrir cette liste plus tard, par Noé.
- Publier = passer en `publié`, avec le lien. Chaque publication publiée est
  une victoire ? — non : ce serait du bruit à raison de plusieurs par semaine.
  Les victoires restent manuelles ou liées aux jalons.

### `#yuno/reseau` — le carnet réseau *(construit)*

Un CRM sans le mot. Qui y entre (réponse du 7 août) : **les joueurs, les gens
des médias, les gens des clubs**, principalement. Ce qu'une fiche doit rendre
en trois secondes : **le contact** (Instagram, mail, téléphone) et **le
rattachement** — à qui/quoi la personne est reliée (FC Lorient, OM,
La Provence…). D'où le champ `structure`, affiché en évidence sur chaque
fiche. Notes libres et date du dernier échange complètent. Pas de relances
automatiques, pas d'étapes de vente — un carnet d'adresses qui se souvient
de ce qu'on s'est dit.

**C'est une base de données, pas une liste** (demande de Noé, 7 août 2026 —
« comme Notion : une base de données est la base, après on varie comment on
l'affiche »). Trois couches séparées :

1. **La base** — `baseContacts()` filtre, cherche et trie. Elle ne sait rien
   de son affichage.
2. **Les colonnes** — chacune sait quatre choses, et rien d'autre : se
   comparer (`valeur`), se chercher (`texte`, quand il diffère du tri), se
   dessiner (`cellule`) et se filtrer (`filtre`, pour celles à valeurs
   limitées). Ajouter une colonne filtrable ne demande donc que de la décrire.
3. **Les affichages** — `Tableau` (colonnes triables au clic, un second clic
   inverse le sens) et `Fiches` (les tuiles). Ajouter une vue plus tard —
   groupée par structure, par exemple — ne demandera que d'ajouter un dessin.

**L'ordre des colonnes se change depuis le site** (demande de Noé, 7 août) :
en tirant un en-tête du tableau — le geste de Notion — ou par le panneau
« Colonnes » et ses flèches, qui sert sur téléphone où l'on ne tire pas un
tableau. Les deux écrivent le même ordre.

C'est une **préférence d'affichage, pas une donnée** : elle est retenue dans le
navigateur (`localStorage`), pas en base. Un ordre qui se perdrait au
rechargement ne servirait à rien, mais il n'a rien à faire dans Supabase.
Toute colonne absente d'un ordre enregistré est ajoutée à la fin : ajouter une
colonne au code ne doit pas la faire disparaître chez qui a déjà réordonné.

**Les filtres, sur le modèle de Notion** (demande de Noé, 7 août) : discrets
tant qu'on ne s'en sert pas, dépliables, et composés à la demande. Trois états
distincts :

- `filtresOuverts` — la barre est-elle dépliée ;
- `filtresAjoutes` — quelles colonnes ont leur puce posée dans la barre ;
- `filtres` — la valeur choisie pour chacune (`tout` ne filtre rien).

Un bouton « Filtrer » déplie la barre et porte le nombre de filtres posés.
**Replier n'annule rien** : les filtres restent appliqués et le compte le dit —
sans quoi on cacherait la raison d'une liste courte. « + Filtrer » propose les
colonnes pas encore posées ; retirer une puce **efface aussi sa valeur**, car
laisser agir un filtre invisible serait le meilleur moyen de ne plus rien
comprendre à la liste.

Les choix se déduisent des données présentes et sont comptés (« Lorient (9) ») :
un club que personne ne porte n'a pas à figurer dans la liste. Les filtres se
cumulent (un ET, pas un OU) et se combinent à la recherche.

La recherche porte sur **toutes** les colonnes : taper « lorient » trouve
aussi bien un nom qu'une structure, et « laprovence » trouve par l'e-mail.
Les cases vides finissent toujours en bas, quel que soit le sens du tri — une
fiche sans date n'est pas « la plus ancienne ». Le compte « 4 sur 12 » dit ce
que le filtre a retenu.

**Les colonnes viennent du tableau Notion de Noé** (7 août 2026), qui servait
de carnet avant le hub : Nom, Type, Relation, Rattaché à, Instagram, E-mail,
Téléphone. Le « dernier échange » a été retiré à sa demande.

La colonne qui fait le CRM est **Relation**, avec sa progression :
`Pas de contact → Message envoyé → Contact établi → Bon contact` — gris, bleu,
doré, vert (l'ordre de couleurs de Noé, corrigé le 7 août). Elle se
change dans la cellule même — c'est le geste le plus fréquent d'un CRM, il ne
mérite pas un formulaire — et se **trie sur la progression, pas sur
l'alphabet** : « Bon contact » est un aboutissement, pas un début. Aucun de
ces statuts ne signale une alerte.

Les valeurs portent des **étiquettes colorées** comme dans Notion : une teinte
stable par valeur, calculée sur le texte, pour que « Rennes » garde sa couleur
d'une visite à l'autre. Douze teintes bien réparties — il ne s'agit que de
distinguer.

Contacts cliquables partout (Instagram, `mailto:`, `tel:`). L'identifiant
Instagram est accepté avec ou sans arobase, ou collé en URL entière. **Un
contact peut porter plusieurs comptes ou adresses**, séparés par une barre
oblique — le carnet de Noé en contient — et chacun devient son propre lien.

Types : joueur, club, média, **agence**, marque, autre. Les agences sont
arrivées avec la seconde moitié du carnet : ce ne sont ni des médias ni des
marques, ce sont des intermédiaires.

**Les contacts eux-mêmes ne sont pas dans ce dépôt.** Ce sont des données
personnelles réelles (numéros, comptes) et le dépôt est public : elles vivent
uniquement dans Supabase, derrière la connexion. Seul le schéma est versionné.

### `#yuno/commandes` — le suivi des commandes *(construit)*

Volontairement simple, et en dernier : titre, client, statut
(`en cours → livrée`), échéance éventuelle, lien du livrable, notes. Livrer
une commande crée une victoire. On l'étoffera si l'activité le réclame —
pas avant.

Construit le 7 août 2026 : les livrées se replient en bas, comme le backlog.
Une commande à échéance apparaît dans le calendrier (Yuno et hub).

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
- `type` text CHECK (type IN ('joueur','club','media','marque','autre'))
- `structure` text — le rattachement (FC Lorient, OM, La Provence…)
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

Aucune. Toutes les questions ont été tranchées le 7 août 2026, et les cinq
écrans du site sont construits : Accueil, Créer, Calendrier, Réseau,
Commandes. Prochaine étape : l'usage réel par Noé, qui dira ce qui manque —
et les outils d'aide à la création qui viendront enrichir « Créer », une fois
son analyse du marché faite.
