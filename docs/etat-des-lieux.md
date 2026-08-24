# État des lieux — 24 août 2026

> **Reprise : § 4 bis, « Par où reprendre ».**
>
> Ce document dit **où en est le hub** — `CLAUDE.md` dit ce qu'il doit être, et
> les deux cahiers des charges (`yuno-spec.md`, `fch-spec.md`) font autorité sur
> leurs sites. À relire au début d'une session, à mettre à jour à la fin.
>
> **§ 0 raconte la dernière session** (24 août : les réunions du FCH trouvent
> leur forme, et l'aller-retour qui l'a produite), **§ 0 ante celle d'avant**
> (21 août : l'egress, la semaine qui tourne, la loupe, le Réseau de Yuno
> refondu), **§ 0 ante bis** le 15 août, **§ 0 ante ter** les 14–15. Les § 1 et
> suivants décrivent l'état stable et les chantiers antérieurs.

## 0. La session du 24 août — les réunions trouvent leur forme

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

## 0 ante. La session du 21 août — l'egress, la semaine, et les réunions du FCH

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
  quand le projet choisi est fch — le motif exact de `type_moment`/photo ;
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
   projet dont `--couleur-projet` est un **dégradé** (ses deux couleurs) ; or
   le calendrier s'en servait pour des **bordures** et des `color-mix()`, qui
   exigent une couleur. CSS jette la déclaration entière sans un mot : les
   barres du club sortaient sans fond ET sans bordure (`border-left-width: 0`,
   vérifié au navigateur), seules de tous les projets.

   Deux corrections. La variable de couleur pleine s'appelait
   `--couleur-projet-texte` — **un nom qui mentait**, et c'est lui qui a piégé
   le calendrier : elle est renommée **`--couleur-projet-pleine`**, avec la
   vraie règle écrite au-dessus des définitions (dégradé = `background` et
   rien d'autre ; pleine = partout où une couleur est exigée). Les trois
   règles fautives (`.cal-barre-element`, `.cal-type-tache`,
   `.cal-journee-ligne`) l'utilisent désormais.

   **La couleur pleine du FCH est le ROUGE, pas le bleu** (choix de Noé, qui a
   demandé de trancher selon la ressemblance — mesuré plutôt qu'estimé à
   l'œil). Écart perceptuel du bleu du club au perso : **26 en clair, 18 en
   sombre**, quand les deux projets les plus proches du hub sont déjà à 55 et
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
   règle vit dans `#bloc-semaine [data-projet="fch"]` et
   `#espace-calendrier [data-projet="fch"]` : là, et là seulement, les deux
   variables prennent `--club-fch-bleu`. Partout ailleurs — l'espace Tâches,
   les pastilles, les fiches, les deux sites — la couleur double et son rouge
   ne bougent pas. La mesure ci-dessus reste vraie (le bleu du club est la
   couleur la plus proche du perso) ; dans une grille, la colonne et
   l'étiquette disent le projet avant la couleur.

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
     Noé) : `preparationsToutes` embarque le projet de l'événement lié, Yuno
     filtre photo (une feuille sans événement est à lui), et les modèles sur
     `projet = 'photo'`.

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

## 0 ante bis. La session du 15 août — Yuno passe au réseau

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
  deux : c'est la méthode du projet, et elle vaut ici plus qu'ailleurs.

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

## 0 ante ter. La session des 14–15 août, en un coup d'œil

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
   (§ 3). Yuno, lui, a occupé toute la session du 15 (§ 0).

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

Le hub est **déployé et fonctionnel** :
https://noedelahaye-sketch.github.io/hub/

| Surface | Adresse | État |
|---|---|---|
| Tableau de bord | `#dashboard` | complet |
| Tâches | `#taches` | toutes les tâches, datées ou non, faites ou non — priorité 1 à 4 |
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

**Les événements peuvent se répéter** (chaque semaine, quinzaine, mois) — les
occurrences ne sont pas stockées, elles se déduisent à la lecture.

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
| Événement | Nature · Quand (heure, jusqu'au) · Projet · Durée · Répétition · Lieu et notes |
| Tâche | Nature · Quand (heure) · Projet · **Priorité** |
| Publication | Nature · Quand (heure) · Projet · Réseau · Format |
| Objectif | Nature · Quand (échéance seule) · Projet · Le pourquoi |

**Un choix se fait dans une LISTE, jamais dans un `<select>` natif.** C'était
l'erreur de la première version, et Noé l'a dite sans détour : « le rectangle
bleu avec un menu déroulant, c'est très laid et pas agréable ». Un menu du
système, avec son cadre bleu et son chevron, au milieu d'une tuile dessinée — et
surtout pénible au doigt : viser un contrôle de 30 px, puis une ligne dans une
roue. Chaque option est maintenant une ligne pleine largeur, avec son drapeau de
priorité ou sa pastille de projet, **exactement comme dans l'espace Tâches**.
La valeur voyage dans un champ caché : les espaces lisent toujours le formulaire
avec `FormData`, ils n'ont pas à savoir comment on l'a saisie. Vérifié en posant
une tâche dont le projet et la priorité viennent des listes : les deux sont en
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
projet (fonction payante). Piège vérifié : `createSignedUrls(..., { transform:
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

- **Il ne cache rien** — datées ou non, faites ou non, tous projets. C'est sa
  raison d'être : ailleurs le hub trie (le dashboard ne montre que les actives,
  un espace projet replie son backlog), ici on vient voir l'ensemble et ranger.
- **`priorite` int 1–4, défaut 4.** Convention de Todoist : 1 le plus urgent, 4
  le cas ordinaire. Le défaut n'est pas 1, et c'est le point — une tâche n'est
  pas prioritaire parce qu'elle existe, et une liste où tout est en 1 ne classe
  plus rien. Entier borné par un CHECK plutôt qu'un texte : une priorité se
  trie, et l'ordre alphabétique de « haute » et « basse » ne veut rien dire.
- **`priorite` ne remplace pas `statut`** : l'un dit combien la tâche compte,
  l'autre où elle en est. La règle des 3 actives par projet reste entière, et
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
  projet comprise : vingt tâches en vingt cartes feraient un mur, et la barre
  ferait double emploi avec le nom du projet.
- **Une ligne s'ouvre pour se corriger** (13 août, demande de Noé) : appuyer sur
  la tâche rouvre la tuile, remplie de ce qu'elle contient, et la flèche
  enregistre au lieu de créer. C'est un vrai `<button>`, pas une ligne qui écoute
  les clics — au clavier comme au lecteur d'écran, une tâche s'ouvre. Après une
  correction la tuile se referme : on n'enchaîne pas des corrections comme on
  enchaîne des notes.
- **La ligne de service ne dit plus la priorité**, seulement la date **et le
  projet, juste à côté d'elle** : le cercle dit déjà la priorité par sa couleur,
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
directement, et **une rangée de pastilles** — date, projet, priorité — ouvre
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
  suite : confirmer l'abandon de rien serait une question pour rien. Le projet
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
  projet. Les quatre endroits qui créent une tâche posent `statut: 'actif'` :
  la capture des Tâches, les deux calendriers, l'espace projet.

  **Ce que ça coûte, et c'est assumé** : le plafond de **3 actives par projet**
  n'est plus jamais exercé — rien n'appelle `changerStatutTache`, et `creerTache`
  ne l'a jamais vérifié. Le bloc « Aujourd'hui » du dashboard ne filtre donc
  plus : il montre les 9 premières tâches, plus « les 3 chantiers de chaque
  projet ». C'était le mécanisme central de la règle « réduire la charge
  mentale » de `CLAUDE.md` ; il est en sommeil, pas supprimé.

  **Rien n'a été jeté** : la colonne, `MAX_TACHES_ACTIVES`, `changerStatutTache`
  et son message de refus sont tous en place. Réafficher la pastille suffit à
  tout rallumer. Le backlog reste lisible dans les espaces projet s'il contient
  encore quelque chose d'ancien — il se replie tout seul quand il est vide,
  c'est-à-dire toujours désormais.
- **La capture reste ouverte après l'envoi**, vidée, projet et priorité gardés :
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
« Faites » repliée et à l'envers, filtre par projet, couleur des cercles), puis
**le vrai chemin d'écriture** — créer, changer la priorité en ligne, renvoyer au
backlog, cocher (victoire créée en base, relue en SQL), décocher (victoire
retirée), supprimer. Puis quatre tâches pour éprouver le refus des 3 actives.
Puis la capture refaite : ouverture, saisie, les trois pastilles une à une, deux
tâches créées d'affilée. Tout a été défait à chaque fois : la base est revenue à
**0 tâche et 1 victoire**, son état exact de départ. Zéro erreur en console, pas
de débordement horizontal à 375 px, cercles à 43 px de cible tactile.

**Le dashboard a été refondu sur trois points** (13 août, demande de Noé) :

- **« Ta semaine » est devenu un aperçu du calendrier hebdomadaire**, à la place
  de sa liste : la vraie grille, tous projets ET toutes natures confondus —
  événements, tâches, publications, objectifs, jalons, commandes, relances.
  C'est `construireGrille` en vue semaine, la même fonction que l'espace
  Calendrier : **une seule façon de dessiner une semaine dans tout le hub**.
  `assemblerSemaine`, qui fusionnait trois sources à la main pour ce seul bloc,
  a disparu — la grille assemble elle-même.
- **« Aujourd'hui » a pris la forme exacte de l'espace Tâches** : cercle coloré
  par priorité, titre, date et projet. `ligneTache` est devenue empruntable
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

**Ce qu'il reste à faire** : `perso.js`, `espace-projet.js`, `fch.js`,
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
paramètre `valeurs` — le titre dans le champ, le projet et la priorité sur leurs
pastilles. La tuile ne sait toujours pas si elle crée ou si elle corrige : c'est
l'espace qui le sait, à l'envoi, en regardant si `etat.creation` porte un `id`.

**L'écriture est optimiste**, comme le reste : la ligne change à l'écran, et
revient si le serveur refuse. Mesuré : **89 ms** entre l'envoi et la tuile
refermée, liste à jour.

**Ce qui n'a pas changé, et c'est voulu** : une tâche ne se SUPPRIME toujours
pas depuis l'accueil. Effacer n'a rien à faire dans un check-in du matin, et le
geste existe deux onglets plus loin.

**Vérifié** : la tuile s'ouvre remplie (titre, date, projet, priorité) ; un
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
   `fermerLesChoix`) vit dans `espace-projet.js`, à côté du constructeur de
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

Demandé par Noé le 13 août 2026. Jusque-là, `taches.projet` n'acceptait que les
trois projets professionnels — au niveau de la BASE, pas seulement de l'écran :
la contrainte CHECK les listait un par un. Migration
`20260813010000_taches_perso.sql`.

**Ce qui change** : `perso` apparaît dans le filtre de l'espace Tâches, dans la
pastille de projet de la tuile, et pour la nature « tâche » de la tuile du
calendrier. Une tâche perso porte la couleur mauve de l'espace, comme partout
ailleurs — `[data-projet="perso"]` existait déjà en CSS.

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
perso créée depuis l'espace Tâches (relue en base : `projet = 'perso'`), une
autre depuis le « + » de l'accueil — elle arrive dans « Aujourd'hui » et dans la
semaine, en mauve ; les listes de projets relevées pour les quatre natures de la
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
projets. C'est sa raison d'être — ailleurs le hub trie, ici on vient voir
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

**Deux points nés le 15 août :**
- **Le FCH perd le format « Post »** — `FORMATS` est commun aux deux sites, et
  « post » a fusionné avec « carrousel » chez Yuno. Sans effet aujourd'hui (le
  FCH n'a aucune publication) ; à trancher le jour où il en aura.
- **Les 47 menus « Niveau » du CRM** restent les derniers `select` natifs du
  site. Noé ne les a pas demandés — à proposer s'il repasse par le réseau.


**FC Hermitage — le chantier s'est rouvert** les 21 et 24 août (réunions,
calendrier, habillage, idées modifiables) ; « mis de côté » n'est plus vrai.
Trois des quatre questions du 13 août restent néanmoins sans réponse, et
aucune ne gêne le reste du hub :
1. Les rubriques éditoriales proposées (avant-match, résultats, portrait,
   coulisses, partenaire, vie du club) correspondent-elles à ce qu'il publie ?
2. Ses 4 objectifs de fin d'alternance — nommés nulle part.
3. Le contenu de l'écran « Club » — toujours volontairement vide, il dit ce
   qu'il attend.

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
11. **Plus un seul menu déroulant natif dans le hub** (13 août, § 2 nonies) :
    le formulaire de modification du calendrier d'abord, puis les quatre autres
    à la demande de Noé — le moment, la fiche réseau, la commande et l'idée.

---

## 4. Ce qui manque encore

Rien d'ouvert dans les cahiers des charges. Restent des conforts :

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
- **Modifier une tâche, un événement, une publication** : les objectifs, les
  moments (avec leur photo) et les contacts se modifient désormais. Le reste se
  supprime et se recrée — jugé plus rapide.

---

## 4 bis. Par où reprendre (fin de session du 24 août 2026)

Dans cet ordre, du plus pressé au moins pressé.

**⚠ D'abord : il y a du travail NON COMMITÉ dans l'arbre.**

Une session antérieure du 24 août (avec le skill *Impeccable*, installé ce
jour-là) a laissé des corrections d'**accessibilité** en attente dans
`css/styles.css`, `js/dashboard.js` et `js/taches.js` — relues, elles sont
bonnes et documentées ligne à ligne :

- le cercle de **priorité 4** passait sous le seuil de contraste de 3:1
  (2,53 sur carte) : il est assombri à `#8c867d` ;
- la priorité était dite par la **seule couleur** : elle l'est maintenant
  aussi par l'**épaisseur du trait** (4 / 3 / 2 / 1,5 px, écarts vérifiés en
  niveaux de gris) et par le nom accessible du bouton ;
- le champ de la tuile ne montrait **plus aucun focus** (`:focus { outline:
  none }` l'emportait en spécificité sur `input:focus-visible`) ;
- l'étiquette du mot d'humeur est **hors écran, pas absente**.

**À faire en premier : les relire, les essayer, et les commiter** — ou les
défaire si Noé n'en veut pas. Tant qu'elles traînent, chaque `git status` est
bruyant et le prochain commit risque de les emporter sans les nommer. Le
dossier `.impeccable/` (une critique de l'accueil, 8 Ko, non suivi) est à
ignorer ou à ranger : `.claude/` et `PRODUCT.md` l'ont été le 24 août pour
que rien de cet outil ne parte sur GitHub Pages.

**Ensuite, ce qui est périssable :**

1. **Le CA du 24 août au soir A EU LIEU — demander comment ça s'est passé.**
   C'était le premier vrai test de la fiche de réunion, et Noé l'a préparée
   pour de bon : participants nommés, une quinzaine de questions et points
   écrits, le modèle « CA · j'y assiste » versé dessous. Ce qu'il faut
   regarder maintenant, dans l'ordre du guide : le compte-rendu est-il parti
   (le champ « Conclure » de la fiche est-il rempli) ; les actions décidées
   sont-elles entrées au **tableau des actions** ; et à la prochaine réunion,
   ce tableau sera-t-il relu en ouverture — c'est l'habitude que le guide
   place en priorité absolue, et la seule qui dira si l'outil sert.
   **Écouter avant d'ajouter quoi que ce soit.**
2. **Vérifier l'egress Supabase** (Settings → Usage) : les corrections du
   21 août (photos recompressées, liens signés un mois) devaient diviser la
   courbe par ~80. Trois jours ont passé, le verdict est lisible maintenant.
   Si la courbe ne s'aplatit pas, le diagnostic était incomplet — § 0 ante.
3. **La sauvegarde des 26 photos originales** (43 Mo) vivait dans le dossier
   temporaire de la session du 21 août : **il a très probablement été nettoyé
   depuis**. Ne pas s'en inquiéter — les versions recompressées sont en ligne
   et vérifiées, et les fichiers de boîtier restent chez Noé.

**Ensuite, écouter l'usage :**

4. **Les réunions, après une ou deux vraies.** Le menu « Modèles » verse du
   texte : est-ce que Noé retravaille vraiment ces lignes, ou est-ce qu'elles
   restent telles quelles ? Si elles restent telles quelles, le modèle est à
   corriger, pas l'outil. Et la case « J'anime » n'a jamais servi en vrai — le
   premier CA qu'il anime dira si la bascule tombe juste.
5. **La Passerelle après une vraie semaine de rituel** — la fournée se vide
   toute seule au lundi depuis le 21 : regarder si ce vidage tombe bien, ou
   s'il faudrait un rappel des clubs non contactés de la semaine passée.
6. **Les Missions, jamais exercées en vrai.** Le tableau de bord existe
   (« À préparer » sur 30 jours, pipeline des commandes, commande liée à un
   événement) mais aucune commande n'y est passée. À regarder dès qu'une
   vraie commande arrive : le lien commande → événement se pose-t-il
   naturellement ?
7. **Poser les objectifs.** Toujours d'actualité, et de plus en plus pressé :
   la table `objectifs` reste quasi vide alors que **décembre approche** (4
   dossiers Studi + la vidéo, fin de l'alternance FCH). C'est la priorité n° 2
   du produit, et le seul chantier de cette liste qui ne dépend d'aucun usage.
8. **Le premier vrai bilan de préparation Yuno** (bilan → moment au carnet,
   photo et rencontres) n'a toujours pas eu lieu après une vraie sortie.
9. **Vérifier sur le vrai iPhone** : la tuile avec un clavier réel, le service
   worker en application d'écran d'accueil, Canela, le poids d'une visite du
   Journal (les photos doivent venir du cache à la deuxième visite) — et
   maintenant **le dégradé du FCH** et **la loupe sticky** sur un écran
   étroit.
10. **Les chantiers de fond inchangés** : conversion des espaces projet à
    `js/ecriture.js`, démarrage par morceaux à porter aux petits espaces. Rien
    de pressé.

**En veille, sans suite pour l'instant** : une erreur console
`JWT issued at future` (PGRST303) vue les 15, 21 et 24 août au chargement — un
décalage d'horloge entre la machine et Supabase, sans effet visible à l'usage.
Si des chargements se mettent à échouer pour de vrai, commencer par là.

**Ce qui est clos et n'a plus à figurer ici** : le cochage d'une tâche depuis
le calendrier, les onze requêtes de Yuno tombées à six, l'alignement des menus
déroulants, le mot « carnet » qui ne désigne plus deux choses, la table
`moments` qui n'existe plus, les 47 menus « Niveau » du CRM — et, depuis le
24 août, **l'idée de la banque du FCH qui ne s'ouvrait pas** (ouverte depuis le
13) et **la lisibilité du logo sur le bleu** (ouverte depuis le 7).

### Les outils du dépôt, à connaître

- **`node tools/verifier-gabarits.js`** — *écrit le 15 août, le plus important
  des trois.* Un accent grave **nu** dans un commentaire HTML, à l'intérieur
  d'un gabarit JS, ferme la chaîne : le fichier reste valide pour
  `node --check`, et le module casse au chargement en emportant tout l'écran.
  Le piège s'est produit **quatre fois** entre le 13 et le 15 août. L'outil lit
  chaque fichier en machine à états et sort en erreur avec le fichier et la
  ligne ; les accents graves **échappés** sont acceptés (c'est la façon
  correcte d'en écrire un, et `js/app.js` le fait depuis toujours).
- `node tools/verifier-coquille.js` — la liste du service worker contient-elle
  tout ce qui est référencé ? Sort en erreur sinon. À lancer après avoir ajouté
  un module, une police ou une icône.
- `python3 tools/telecharger-supabase.py [version]` — rapatrie supabase-js dans
  `js/vendor/`. À relancer pour changer de version, jamais autrement.

### Une méthode qui a tenu deux jours, et qu'il faut garder

**Exercer, relire, défaire, relire à nouveau.** Il n'y a pas de base de bac à
sable : chaque essai touche les vraies données de Noé. Tout ce qui a été écrit
cette session l'a été sur des lignes créées pour l'occasion, relues après coup,
puis supprimées — et la base a été recomptée à chaque fois. Deux fois une ligne
de Noé a été touchée par erreur ; les deux fois, elle a été rendue à l'identique
dans la minute.

**Et le navigateur tranche, pas la lecture du code.** Trois pannes de la session
ont été trouvées comme ça et par aucun autre moyen : un import oublié en silence
(l'espace FCH montait vide), un `<select>` sans valeur qui préselectionnait sa
première option alors que les pastilles ne préselectionnaient rien, et un
`releasePointerCapture` qui levait et emportait le report avec lui.

---

## 5. Décisions à ne pas défaire sans raison

Celles qui ne sont pas déjà dans `CLAUDE.md` ou les cahiers des charges :

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
et du projet, et elle ouvre un menu déroulant dessiné (`reglageStatut`,
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

---

## 6. Les pièges rencontrés, pour ne pas les revivre

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
| `js/espace-projet.js` | La fabrique d'espace projet (formation) + gabarits partagés |
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH — ce qui diffère passe en paramètre (cycle, checklist, piliers) |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date, les trois vues, le glissement et le clavier — **et la tuile « Poser au calendrier » avec `poserAuCalendrier` / `brancherCapture`, partagées par le hub, l'accueil et les deux sites** |
| `js/yuno.js` | Le site Yuno : le Carnet de terrain, le réseau, la Passerelle, le rendez-vous stats |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
