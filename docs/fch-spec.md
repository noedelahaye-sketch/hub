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

- **`#fch` — la page FCH du hub.** Tableau de bord réduit : le cap en lecture,
  l'aperçu de la communication à venir, une capture d'idée au vol, les
  victoires, et la porte vers le site. Habillage du hub conservé.
- **`#hermitage` — le site.** L'habillage du hub disparaît : ni « Hub », ni
  onglets, ni autres projets. Chrome propre, identité du club, une seule
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

**Couleurs** — mesurées sur `img/fch-logo.png` :

| Rôle | Valeur | Note |
|---|---|---|
| Fond du site | `#113693` | Le bleu du club porte tout le site (choix de Noé). |
| Tuiles | `#1e47a8` | Assez au-dessus du fond pour se détacher sans cerne appuyé. |
| Accent | `#f2b705` | Le jaune. Seule couleur du club qui ressorte sur ce bleu. |
| Rouge du club | `#df0000` | Seconde couleur d'identité, dans le liseré. |
| Texte | blanc | |

**Le site FCH est bleu**, quel que soit le réglage du téléphone — comme le
site Yuno est toujours sombre. Deux conséquences assumées :

- **L'accent est jaune, pas bleu.** Un accent bleu sur fond bleu ne
  signalerait rien. Le jaune porte les barres de progression, l'onglet actif,
  les étiquettes — et ne signale jamais une alerte, la règle du hub tient.
- **Le logo reste en PNG transparent**, à même le fond bleu, sans plaque
  (choix de Noé du 7 août : la plaque blanche a été essayée puis retirée).
  Ses traits noirs et bleus se lisent moins qu'ils ne le feraient sur clair —
  c'est assumé.

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

0. **La réunion du moment** (21 août 2026) — en tête quand une réunion est en
   cours, vient de finir (moins de 24 h) ou approche : sa phase (Avant ·
   Pendant · Après), jusqu'à trois lignes de sa préparation encore à faire,
   cochables d'ici, et la porte vers la feuille. Le pendant de « la sortie du
   moment » chez Yuno : le jour d'un conseil, ce qui compte n'est ni la com'
   ni les objectifs.
1. **Objectifs** — les 4 objectifs de fin d'alternance, avec pourquoi et
   jalons. Le cap avant tout, comme partout dans le hub.
2. **La com' à venir** — les prochaines publications programmées, avec la
   porte vers Créer.
3. **Victoires** — partenariats signés, publications qui ont marché, jalons.

Le site a gagné **le « + » flottant** le même jour (décision de Noé) : la
tuile du hub, ouverte sur la nature Événement — une réunion se note en sortant
de la salle. La pastille « Réunion » y est toujours offerte.

### `#hermitage/creer` — l'outil phare

Le calendrier éditorial du club, **le même outil que chez Yuno** : une idée
est une publication sans date, le cycle `idée → brouillon → prêt → publié`,
la banque d'idées, les rubriques récurrentes.

Ce qui change du côté FCH :

- **Les réseaux** : Instagram, Facebook (le réseau des clubs amateurs et des
  parents), TikTok. LinkedIn et YouTube restent disponibles.
- **Les rubriques de départ** : avant-match, résultats, portrait de joueur,
  coulisses, partenaire à l'honneur, vie du club. À corriger par Noé dès qu'il
  aura son idée du rythme réel.

Techniquement : la table `publications` a reçu une colonne `projet` — c'est le
même outil et la même table, filtrés. Un second tableau identique aurait été
une duplication sans raison.

### `#hermitage/reunions` — préparer, tenir, retenir

**Une réunion est une FACE de l'événement** (demande de Noé, 21 août 2026) :
un événement `fch` dont `reunion_objet` est posé — l'objet EST le marqueur,
comme une publication sans date est une idée. Elle se note au calendrier (le
« + », nature Événement, pastille Réunion : objet + « j'anime »), depuis le
site comme depuis le hub — la pastille s'y révèle quand le projet choisi est
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

La fiche suit ce déroulé, dans cet ordre :

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
Cochée « c'est pour moi », l'action devient **aussi une tâche fch** — les deux
restent reliées par `tache_id`, et ce qui se décide en réunion entre dans le
circuit (« Aujourd'hui », l'espace Tâches) au lieu de dormir dans une note.

**Le Drive porte les documents, la fiche porte les portes.** Les présentations
vivent dans *L'Administratif du FCH › Réunions CA*, les comptes-rendus avec
elles. « Créer » **copie le dernier document en date** : la copie Google garde
le thème, les couleurs et la structure du club — rien à reconstruire. Un
bouton met dans le presse-papiers le nom attendu par la convention du dossier
(« Réunion CA - 08/06/26 »), et le lien du document créé se colle sur la
fiche : elle devient le point d'entrée unique.

Les six modèles de préparation semés le 21 août au matin restent en base mais
ne servent plus au site : le savoir-faire vit désormais dans la structure de
la fiche, pas dans des listes à copier.

### `#hermitage/calendrier` — tout ce qui porte une date

Publications, tâches, événements, objectifs et jalons du projet `fch`, groupés
par mois, filtrables par nature. Même module que le hub et Yuno.

### `#hermitage/partenaires` — les partenaires

Le seul contenu certain de la « partie marketing » : les partenariats sont
l'un des quatre objectifs de fin d'alternance. Une fiche par partenaire —
nom, contact, statut de la relation, notes, date du dernier échange.

**Réutilise la table `contacts`** (créée pour le carnet réseau Yuno) : c'est
la même matière — des gens et des structures avec qui on échange. Le
rattachement (`structure`) et le type suffisent à séparer les deux carnets.

### `#hermitage/club` — l'organisation du club

**Volontairement vide au départ.** Noé ne sait pas encore ce qu'il y mettra.
L'écran existe, dit ce qu'il attend, et se remplira quand l'usage aura parlé.

---

## 5. Les données

Les réunions n'ont d'abord rien créé (21 août 2026, matin) : `evenements` a
gagné `reunion_objet` (CHECK ca · alternance · communication · partenariat ·
autre, non nul = réunion) et `reunion_animee` ; `modeles_preparation` a gagné
`projet`, `objet` et `anime` ; `preparations` a gagné `bilan_animation`.

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

Le projet `fch` utilise :

- `objectifs`, `jalons`, `taches`, `evenements`, `victoires` — les tables du
  hub, filtrées sur `projet = 'fch'` ;
- `publications` — avec la colonne `projet` ajoutée le 7 août 2026, et le
  CHECK `reseau` élargi à Facebook et YouTube ;
- `contacts` — pour les partenaires ; la table n'a pas de colonne `projet`,
  c'est un carnet unique dont le `type` et la `structure` disent l'usage.

Si un besoin réclame plus tard une table propre au club (effectifs, plannings
d'entraînement, licences…), elle se créera par migration versionnée, comme le
reste.

---

## 6. Ce qu'on ne construit pas encore

- **La partie marketing au-delà des partenaires** : rien n'est nommé, rien ne
  se construit.
- **L'organisation club** : l'écran existe, son contenu attend l'usage.
- **L'éditeur de modèles de réunion** : les six modèles semés se corrigent
  par la boucle « aussi au modèle » depuis une feuille ; un écran d'édition
  complet (comme `#yuno/modeles/<id>`) attendra que le besoin se montre.
- **Toute idée d'outil non demandée.** La structure en sous-adresses
  (`#hermitage/<outil>`) permet d'ajouter un écran sans toucher aux autres :
  c'est ce qui autorise à attendre.

---

## 7. Questions ouvertes

1. **Les rubriques éditoriales du club** : celles que je propose
   (avant-match, résultats, portrait, coulisses, partenaire, vie du club)
   correspondent-elles à ce que tu publies ? Lesquelles manquent ?
2. **Les 4 objectifs de fin d'alternance** : lesquels exactement ? Le
   `CLAUDE.md` les mentionne sans les nommer.
3. **Les partenaires** : quels statuts de relation te seraient utiles
   (à contacter, en discussion, signé, à relancer) — ou est-ce trop tôt ?
4. **L'organisation club** : dès que tu sais ce que tu veux y trouver.
