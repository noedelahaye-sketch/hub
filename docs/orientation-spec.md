# Orientation — la règle du jeu

> Ce document dit **comment le hub oriente Noé** : ce qu'il propose, sur quoi il
> se fonde, quand il parle et ce qu'il ne fera jamais. Il complète `CLAUDE.md`
> (ce que le hub doit être) et `docs/etat-des-lieux.md` (où il en est).
>
> Écrit le 27 août 2026, à partir d'une session de conception entière. Les
> chiffres qui y figurent viennent de Noé ; les règles en découlent.

## 0. Ce que c'est, et ce que ce n'est pas

Le hub **oriente**, il n'ordonnance pas. La différence tient en une phrase :

> **Le hub décide des proportions, Noé décide du contenu.**

Combien de FCH cette semaine, combien de formation, un plancher pour soi : c'est
du cadre, et un cadre soulage. Quelle tâche, quel jour, dans quel ordre : c'est
du choix, et le choix motive. Un plan entièrement reçu se fait moins bien et se
savoure moins — c'est le besoin d'autonomie, et c'est le risque que Noé a nommé
en premier : « que je sois un simple exécutant, j'en perdrais le plaisir ».

Donc, jamais : une semaine pré-remplie, une coupe automatique, un score de
productivité, un rappel de ce qui n'a pas été fait.

Toujours : une forme proposée, un vivier trié, un motif d'une ligne, et la
possibilité de dire non — le non étant une donnée, pas un échec.

## 1. Le vocabulaire et la hiérarchie

Cinq étages, du plus large au plus concret :

| Étage | Ce que c'est | Exemple |
|---|---|---|
| **Mission** | le pourquoi de fond, hors mesure | *(plus tard)* |
| **Objectif** | un cap mesurable, avec une échéance | Atteindre 1 000 abonnés |
| **Jalon** | une étape du cap | 900 abonnés au 31 octobre |
| **Projet** | **le comment** — un travail avec un début, une fin, un volume | L'album du club |
| **Tâche** | une action, une journée au plus | Trier les photos U15 |

Le **projet** est le maillon qui manquait, et son absence explique un fait
mesuré : **1 tâche sur 36 était rattachée à un objectif**. Ce n'était pas de la
négligence, c'était un lien impossible à faire — « trier les photos U15 » ne
sert pas *directement* « 1 000 abonnés », elle sert *l'album du club*, qui sert
l'objectif. On demandait à Noé de sauter deux étages.

**Renommage.** Le mot `projet` désignait jusqu'ici les quatre domaines. Ils
s'appellent désormais **espaces**, et le mot `projet` va à l'étage ci-dessus.
La taxonomie y gagne : **4 espaces** (formation, Yuno, FCH, perso), **4 vues
transverses** (accueil, tâches, objectifs, calendrier), **2 sites**.

## 2. Ce que le schéma doit gagner

### 2.1 `projets` — la nouvelle table

- `id` uuid PK · `espace` text NOT NULL (même CHECK que l'ancien `projet`)
- `nom` text NOT NULL
- `resultat` text — **à quoi on reconnaît qu'il est fini.** Sans ce champ, un
  projet ne se termine jamais et pourrit dans la liste.
- `charge_estimee` int — en heures. **La seule maille qui se chiffre** : un
  objectif ne s'estime pas (« 1 000 abonnés », c'est combien d'heures ?), une
  tâche est trop petite pour compter.
- `echeance` date (nullable)
- `statut` text CHECK (idee, actif, en_pause, termine, abandonne)
- `created_at` timestamptz

Et une table de liens, parce qu'un projet peut viser tout, rien, un jalon, un
objectif ou plusieurs (décision de Noé) :

- `projets_cibles` : `projet_id`, `objectif_id` (nullable), `jalon_id` (nullable)

**Règle anti-double-comptage** : la progression d'un objectif reste *jalons
atteints / jalons totaux*, inchangée. Les projets ne calculent aucune
progression — ils portent la **charge** et orientent. Deux caps servis par un
même projet ne le comptent donc pas deux fois.

### 2.2 Les rattachements

`projet_id` sur `taches`, `evenements` et `publications`. Toujours facultatif.

À la création, **le hub propose** le projet le plus probable de l'espace ; un
geste suffit pour passer outre ou ne rien rattacher. La capture rapide ne doit
jamais être bloquée — c'est le geste le plus utilisé du hub.

Une tâche sans projet reste légitime : c'est de l'intendance. Le hub la
propose, elle ne compte dans aucune charge.

### 2.3 Les récurrences deviennent des occurrences réelles

**Changement de modèle.** Aujourd'hui une tâche répétée est *une ligne unique*
qui déplace son échéance ; demain, une **règle de répétition** fabrique des
**occurrences réelles**, chacune une ligne à part : supprimable seule,
modifiable seule, avec un « pour toute la série » quand on le demande.

Ce que ça règle, au-delà de la demande de Noé :
- chaque occurrence porte **sa** durée, donc les publications récurrentes
  deviennent mesurables ;
- le compteur « publications sorties » du bilan FCH les voit enfin passer ;
- **le rythme tenu devient mesurable** — condition absolue du § 5.3.

Ce que ça supprime : la règle « une tâche répétée ne se termine pas ». Chaque
occurrence se termine normalement.

### 2.4 La durée

**Une seule durée**, celle qui existe (`taches.duree`, en minutes), ajustée
après coup. Au moment de cocher, une tuile propose des raccourcis (30 min, 1 h,
2 h…) ou la saisie en minutes ; on peut passer outre.

Contrepartie assumée : sans trace de l'estimation d'origine, le hub ne saura
jamais que Noé sous-estime. Il calcule avec les chiffres qu'on lui donne.

Les **événements** portent déjà leur durée (`date_fin`) : une séance de 2 h est
2 h de charge, sans rien saisir.

### 2.5 Les périodes

- `periodes` : `nom`, `debut`, `fin`, et une intention par espace —
  *au ralenti · normal · intense*, qui multiplie les quotas de base.

> **Rentrée du club** — 1er → 30 septembre
> FCH *intense* · formation *normale* · Yuno *au ralenti* · perso *plancher tenu*

**Déclarer une période, c'est déjà arbitrer.** Deux espaces *intenses* sur le
même mois font 45 h par semaine : le hub pose sa question **trois semaines
avant le mur**, à froid, quand la réponse coûte encore peu. C'est le meilleur
usage possible de son droit d'arbitrage.

### 2.6 La famille d'un moment perso

Colonne `famille` sur les événements et tâches d'espace perso :
*corps · calme · lien*. Voir § 5.4.

## 3. Les deux budgets

Il n'y a pas un budget de temps, il y en a deux — et c'est là que le
déséquilibre se fabrique.

- **35 h d'alternance**, partagées entre FCH (20 h visées) et formation (~15 h).
  Jeu à somme nulle : une heure de plus au club est une heure de moins sur un
  dossier.
- **Le reste** — soirs et week-ends — où vivent Yuno et le perso.

**Le mécanisme de dégât**, à connaître par cœur : quand le FCH déborde, il ne
mange pas d'abord Yuno, il mange **la formation**. Et la formation ne disparaît
pas : elle a une date de dépôt. Elle se rattrape donc le soir — et c'est *là*
que Yuno et le perso s'effacent, deux crans plus loin, sans qu'on ait rien
décidé. **Un débordement au club se paie en soirées perso trois semaines plus
tard.**

D'où la question que le hub pose chaque semaine, et qui n'est pas « as-tu assez
travaillé » : **ce que tu as pris en trop, à qui l'as-tu pris ?**

### 3.1 Les fenêtres de la journée

Le FCH tire le soir (entraînements, réunions), la formation se veut le matin —
et c'est juste : rédiger un dossier demande une attention fraîche, une soirée
qui rentre du club n'en a plus. **Les deux priorités occupent donc les deux
extrémités de la journée**, et le perso se retrouve pris en étau.

| Fenêtre | Ce qui s'y propose |
|---|---|
| Matin | formation (travail de fond) |
| Milieu de journée | atelier FCH, appels partenaires (heures ouvrées) |
| Fin d'après-midi, soir | terrain FCH |
| **Au moins un soir sans club** | le lien — amis, ciné, sortie |

Ce dernier point n'est pas décoratif : sans lui, les moments de lien n'ont
matériellement nulle part où se poser.

### 3.2 Reportable ou périssable

Le terrain n'est **pas** contraint — Noé n'a aucune obligation d'y aller. La
bonne distinction est ailleurs :

- **reportable** : un visuel non fait mardi se fait mercredi ;
- **périssable** : un entraînement non couvert mardi n'existera jamais.

Aucun des deux n'est moins important. Ils ne se paient pas dans la même
monnaie — un délai d'un côté, une matière définitivement perdue de l'autre. Le
hub le dit quand il propose une coupe ; il ne tranche pas à la place de Noé.

### 3.3 Le terrain fabrique l'atelier

Une soirée au bord du terrain, ce sont 200 photos à trier, une publication à
monter, des gens rencontrés à relancer. **Le terrain se paie deux fois** — une
fois sur place, une fois à la maison, avec quelques jours de décalage, quand la
semaine est déjà pleine.

    traitement_engendré ≈ 1 h 30 par séance      (chiffre de Noé, ajusté au volume)

**Par séance, et non au prorata des heures** : le tri dépend du volume de
photos, pas du temps passé au bord du terrain — une séance de 4 h ne produit pas
deux fois plus de tri qu'une de 2 h. Et il se fait **en une fois**, au plus près
de la séance (§ 5.1 bis).

C'est la règle la plus **prédictive** du système : le dimanche, le hub sait déjà
ce que la semaine coûtera vraiment. Trois entraînements, ce sont **4 h 30** de
travail que personne n'a écrites. Le chiffre se corrigera tout seul quand un
mois de durées aura été saisi.

**Attention à ce que ce ratio ne dit pas.** Il couvre le *traitement* du terrain
— trier, retoucher, livrer. Il ne couvre **pas** le reste du travail de com,
qui a son propre rythme et n'a rien à voir avec le nombre de séances : la
programmation hebdomadaire, les présentations de catégories, les appels
partenaires, les documents, la préparation des réunions. Confondre les deux
reviendrait à croire qu'une semaine sans terrain est une semaine légère au
club. Voir § 5.1.

Corollaire pour septembre : *ce qu'on pose en septembre revient chercher
octobre.*

## 4. Le compte courant du FCH

Cible **20 h par semaine**. L'écart s'inscrit à un solde.

    solde ← solde + (heures_faites − 20)
    quota_semaine = 20 − borne(solde, −3, +3)

Trois garde-fous, et chacun a sa raison :

- **restitution plafonnée à 3 h par semaine** — Noé l'a demandé : « pas
  obligatoirement la semaine d'après » ;
- **solde borné à ±10 h** — au-delà, il écrase au lieu d'orienter ;
- **oubli d'1 h par semaine** — un solde qui ne s'efface jamais est un compteur
  de dette, exactement ce que le hub s'interdit. Et un +8 h de septembre n'a
  rien à réclamer à décembre, qui a ses propres échéances.

## 5. Les quatre régimes

Chaque espace obéit à une mécanique différente. C'est voulu : les traiter pareil
était l'erreur de départ.

### 5.1 FCH — le compte courant, et une charge qui se somme par projet

Voir § 4 pour le compte courant.

**Il n'y a pas de formule unique pour la charge du club**, et c'était l'erreur
de la première version : « terrain + traitement + tâches » traite tout ce qui
n'est pas du terrain comme la conséquence du terrain. C'est faux. Le travail de
com du FCH est fait de **plusieurs travaux qui n'ont ni le même moteur ni le
même rythme** :

| Nature | Ce qui la déclenche | Exemple |
|---|---|---|
| **Le terrain** | le calendrier du club | entraînements, matchs, tournois |
| **Le traitement** | le terrain, × ratio (§ 3.3) | tri, retouche, livraison |
| **L'éditorial** | son propre rythme, indépendant du terrain | programmation hebdo, présentations des catégories, anniversaires |
| **Le développement** | des projets à échéance | partenariats, équipe com, album, réunions |

    charge_FCH = terrain + traitement + Σ (charge hebdomadaire de chaque projet)

**C'est la raison la plus concrète d'avoir l'étage projet** (§ 1) : sans lui, le
club n'est qu'un tas d'heures, et le hub ne peut ni prévoir sa charge, ni dire
ce qui déborde, ni proposer de décaler quelque chose de précis. Une semaine sans
terrain n'est pas une semaine légère au club.

### 5.1 bis La taille de la séance

Une proposition juste, mal découpée, est refusée quand même. Noé l'a dit du
tri : *« je préfère traiter les photos rapidement, et ne pas avoir une session
trop longue avec trop de photos ».*

Deux colonnes sur `projets` :

- `taille_session` (minutes) — la tranche dans laquelle ce travail se fait bien.
- `fraicheur` (jours) — sous quel délai le travail engendré doit être fait.

Le hub **découpe et rapproche** au lieu d'agréger : le tri des photos de mardi
se propose mercredi, en une tranche, pas « le tri de la semaine » le jeudi en
un bloc de 4 h. Un dossier de formation obéit à l'inverse — longues tranches,
fraîcheur indifférente.

**Le principe, plus large que le tri** : le hub propose le travail *à la taille
où Noé aime le faire*. C'est une propriété du travail, pas une préférence
d'affichage, et elle se range donc avec le projet.

Le tri en donne la lecture exacte : **une séance = une session de 1 h 30, au
plus près.** Ni trois séances agrégées en un bloc de 4 h le jeudi, ni une séance
saucissonnée en trois bouts. Découper *entre* les sources, pas *dans* une
source.

### 5.1 ter Les projets du FCH, au 27 août 2026

Inventaire arrêté avec Noé. Il vaut comme exemple de la maille attendue partout
ailleurs.

| Projet | Moteur | Ce qu'on sait |
|---|---|---|
| **Présentation des catégories** | éditorial, ponctuel | 7 publications, ~2 h chacune → **≈ 14 h**, septembre-octobre |
| **Programmation de la semaine** | éditorial, hebdo | regroupe la programmation foot à 5, 8 et entente **et** les visuels de la semaine |
| **Anniversaires du mois** | éditorial, quinzaine | |
| **Album du club** | développement | prises de vue dans toutes les catégories, 13 → 25 septembre, plus le traitement |
| **Équipe com avec Lina** | développement | sert l'objectif « une com qui tourne sans moi », 6 jalons, échéance 15 décembre |
| **Suivi de l'alternance** | développement | les réunions et rendus liés au contrat |

Deux décisions à retenir, moins évidentes qu'elles n'en ont l'air :

**Il n'y a pas de projet « couverture des entraînements ».** Le terrain est une
**source**, pas un travail en soi : chaque séance se rattache au projet qu'elle
sert — l'album, une présentation — et le traitement qu'elle engendre appartient
au même. Sans ça, le tri finirait dans un fourre-tout et personne ne saurait à
quel cap il sert.

**Les réunions ne forment pas un projet non plus** : elles se dispersent dans
les projets et les objectifs qu'elles servent. Seul le *suivi de l'alternance*
en fait un, parce que là, les réunions **sont** le travail.

Les partenariats et les autres réunions restent à définir.

### 5.2 Formation — la courbe d'atterrissage

Pour chaque projet à échéance :

    besoin_hebdo = (charge_estimee − heures_faites) / semaines_restantes

Le hub regarde **douze semaines en avant**, pas seulement la suivante. Quand la
somme des besoins dépasse ce qui rentre, il pose sa question d'arbitrage — dès
que le mur est visible, pas quand on s'y cogne.

**C'est ce calcul, et lui seul, qui sait dire « trop ambitieux ».**

État au 27 août 2026, à 25 h le dossier (chiffre de Noé) :

| Livrable | Pour le | Fenêtre | Rythme nécessaire |
|---|---|---|---|
| Dossier bloc 4 | 15 sept. | 19 j | 9 h/sem |
| Deuxième dossier | 15 oct. | 30 j | 6 h/sem |
| Troisième dossier | 31 oct. | 16 j | **11 h/sem** |
| Quatrième dossier | 15 nov. | 15 j | **12 h/sem** |
| Vidéo | 30 nov. | 15 j | 3 h/sem |
| QCM | 8 déc. | 8 j | 5 h/sem |

**Le volume ne fait pas peur : 112 h sur 14 semaines, soit 8 h par semaine** —
bien en dessous des 15 h visées. Ce qui fait peur, c'est la **forme** du
calendrier : les échéances ne sont pas lissées. Deux dossiers dos à dos **du 15
octobre au 15 novembre** demandent 11 h par semaine, alors que septembre n'en
demande que 6 à 9 et que la fin (vidéo, QCM) est légère.

Conclusion opérationnelle, et c'est la phrase que le hub doit savoir dire :
**toute heure de formation non faite en septembre se retrouve à la mi-novembre.**
Septembre est la fenêtre d'avance ; le débordement FCH est ce qui la referme.

### 5.3 Yuno — le rythme et l'occasion

Pas de quota d'heures : Yuno est du bonus, et c'est aussi ce qui fait du bien.
Mais aucun jalon Yuno n'a de date, donc rien n'y crie jamais tout seul. Trois
déclencheurs à la place :

1. **Le rythme déclaré** — la routine du lundi (contacter les clubs), au moins
   une publication par semaine ;
2. **L'occasion** — un match, une sortie : périssable, ça ne se rattrape pas ;
3. **L'avance ailleurs** — solde FCH positif : le temps rendu va à Yuno plutôt
   qu'à la formation. C'est du temps déjà payé.

Et un **jeûne** : sept jours sans un geste Yuno, il remonte dans le vivier.

### 5.4 Perso — trois familles, trois planchers

Un compteur unique se laisserait remplir par la famille la plus facile — le
sport, celui que Noé tient déjà — et on pourrait passer un mois sans voir
personne avec un compteur au vert. **Une famille n'en remplace pas une autre.**

| Famille | Ce qu'elle contient | Plancher |
|---|---|---|
| **Le corps** | sport, étirements | 3 par semaine |
| **Le calme** | lecture, écriture, balade | 1 par semaine |
| **Le lien et le soin** | amis, ciné, massage, médecin | 1 par semaine |
| **L'intendance** | courses, machine, rangement, administratif | **aucun** |

La quatrième famille n'est pas un oubli : les données du 27 août montrent que
l'espace perso contient autant de corvées (*Courses*, *Machine*, *Ranger ma
chambre*) que de soin de soi. Sans elle, **les planchers se rempliraient de
corvées** et le hub croirait la semaine équilibrée. L'intendance se fait, elle
ne repose de rien.

Deux règles impératives :

- **Compté en interne, jamais affiché** (décision de Noé). Le compte change ce
  que le hub propose ; aucun compteur, aucune barre, aucun score n'entre dans
  `#perso`. Il agit sans jamais noter.
- **Asymétrie** : quand la semaine déborde, le hub rogne ailleurs ou propose de
  décaler un projet — **jamais le plancher perso**. Sans cette asymétrie, le
  perso restera ce qu'on délaisse, puisque c'est ce que Noé en fait.

### 5.5 Le rythme n'est pas une note

Les rythmes sont le socle : posés une fois, le hub les **protège** au lieu de
les redécider chaque semaine. Mais un rythme n'est pas toujours tenable.

> **Le hub ne mesure pas si Noé a tenu son rythme, il mesure si son rythme le
> tient.**

Trois semaines que la routine clubs saute : ce n'est pas une faute qu'on
renvoie, c'est une information sur le calibrage. Le hub propose de passer en
quinzaine plutôt que de la laisser mourir en silence.

## 6. Le score du vivier

Sept signaux, pondérés. Le score **ne s'affiche jamais** — seul le motif
dominant est dit, en une ligne.

| Signal | Ce qu'il mesure |
|---|---|
| Urgence | échéance de la tâche, sinon de son projet, sinon du jalon |
| Pression | `besoin_hebdo` du projet (§ 5.2) |
| Négligence | jours depuis le dernier geste **sur ce projet** |
| Péremption | le geste est-il périssable (§ 3.2) |
| Équilibre | écart au quota de l'espace |
| Fenêtre | la tâche colle-t-elle au moment de la journée (§ 3.1) |
| Refus | une tâche refusée deux fois redescend |

La négligence se mesure **par projet**, jamais par objectif : « 12 jours sans
rien sur l'album du club » appelle une action, « 12 jours sans rien sur
l'objectif 1 000 abonnés » n'en appelle aucune.

## 7. Aucun constat sans proposition

**Règle de forme, sans exception.** Le hub ne dit jamais une chose sans offrir
le geste qui va avec. « Rien pour toi cette semaine » tout seul est un
reproche ; suivi de « caler tes trois séances lundi, mercredi et samedi matin »,
c'est une aide.

La forme canonique d'une ligne du hub :

> **le constat** — factuel, une ligne, aucun jugement
> **la proposition** — précise, chiffrée, déjà remplie
> **[Accepter] [Modifier] [Pas maintenant]**

Et le critère qui tranche : **accepter doit coûter un seul geste.** Si la
proposition oblige à ouvrir un formulaire et à tout ressaisir, ce n'est pas une
proposition, c'est encore un constat. Accepter crée la tâche, pose la date,
réserve le créneau — pré-rempli, modifiable.

« Pas maintenant » se garde, et compte parmi les refus du § 6.

## 8. Les inférences — voir ce que Noé ne voit pas

Le diagnostic ne se fonde pas seulement sur ce qui est **posé au calendrier** —
sinon il ne fait que relire ce que Noé a déjà en tête. Il se fonde aussi sur le
passé, sur les objectifs, et surtout sur **ce qui manque**. Quatre familles.

### 8.1 Les conséquences non saisies

Ce qui est posé engendre du travail que personne n'a écrit.

- Une sortie terrain sans tri derrière : *douze jours de prises de vue pour
  l'album, et aucun créneau de tri après.*
- Une réunion sans préparation posée.
- Un tournoi sans publication prévue derrière.

C'est l'application directe du § 3.3 : **le terrain se paie deux fois**, et la
seconde fois n'est jamais saisie.

### 8.2 Ce que disent les objectifs

- **Un jalon proche sans rien qui y mène** — aucun projet, aucune tâche.
- **Un jalon mesurable sans relevé** : *850 abonnés au 30 septembre, dernier
  chiffre connu 795 en août.* Sans mesure, le cap est décoratif.
- **Le premier maillon qui dort.** Dans une chaîne ordonnée, un jalon non
  atteint bloque tous les suivants — le hub repère **le premier de chaque
  chaîne** et le met en avant, parce que c'est le seul qui débloque les autres.
- **Le délai incompressible.** Une signature de partenariat au 31 décembre
  suppose un premier rendez-vous des semaines avant : le hub remonte la chaîne
  et dit à partir de quand elle devient injouable.

### 8.3 Ce que dit le passé

- **La capacité réellement observée** contre celle déclarée. Le hub finit par
  savoir ce qu'une semaine de Noé contient vraiment, et le dit quand l'écart
  est net.
- **Un rythme qui décroche** (§ 5.5) : il propose de le recalibrer.
- **Un projet silencieux** depuis N jours.
- **La charge mise en regard de l'humeur**, sans jamais en faire un levier
  (§ 10).

### 8.4 Ce qui manque par symétrie

Le hub repère les séries incomplètes : toutes les catégories ont leur
publication de présentation sauf deux ; trois entraînements couverts, aucune
photo publiée pour deux d'entre eux.

**Garde-fou.** Une inférence qui se trompe coûte cher en confiance. Chacune dit
**d'où elle sort** — « parce que l'album occupe douze jours et qu'aucun tri
n'est posé » — pour qu'on puisse la contredire d'un coup d'œil. Et le hub en
sort **trois au plus** par rendez-vous : au-delà, elles deviennent du bruit.

## 9. Les trois moments où le hub parle

### 9.1 Le rendez-vous de la semaine — dimanche 20 h

Une bannière apparaît le dimanche à 20 h et **persiste jusqu'à validation**, au
plus tard le lundi (décision de Noé). Elle porte :

1. **la forme de la semaine** — heures prévues par espace, face aux quotas ;
2. **les tensions** — ce qui déborde, et de combien ;
3. **la question d'arbitrage**, s'il y en a une (§ 9.3) ;
4. **les planchers** — sans les nommer comme des compteurs ;
5. **le vivier**, trié, à piocher.

Validée, elle se tait. C'est le seul moment de la semaine où le hub demande de
décider quelque chose.

### 9.2 Le matin

**Trois propositions au plus**, chacune avec une ligne de motif — « dossier 2
dans 7 semaines, rien de fait dessus depuis 12 jours ». Jamais deux du même
espace d'affilée.

« Pas aujourd'hui » est un vrai geste, et il est enregistré. Puisque l'humeur
n'est qu'observée (§ 10), **le refus est le seul capteur de l'état du jour** :
trois refus FCH dans la semaine en disent plus long qu'un chiffre.

### 9.3 L'arbitrage — rare

Déclenché quand la somme des besoins dépasse la capacité sur **deux semaines
consécutives au moins**, ou à la déclaration d'une période impossible.

Forme : **une question, deux issues chiffrées, Noé tranche.** Le hub ne coupe
rien de lui-même — décision de Noé, et elle vaut aussi pour l'atelier FCH, qui
n'est pas moins important que le terrain.

**La réponse se garde** (table `arbitrages` : question, décision, période
couverte). Si Noé tranche « novembre porte la formation », le hub applique et
ne repose pas la question le dimanche suivant. Un arbitrage non tracé serait un
harcèlement hebdomadaire.

## 10. Ce que le hub ne fera jamais

- Remplir la semaine à la place de Noé.
- Couper quoi que ce soit sans le demander.
- Afficher un score, un classement, un taux de complétion.
- Afficher un compteur dans `#perso`.
- Utiliser l'humeur pour modifier la charge. Elle est **observée**, mise en
  regard de la charge, jamais transformée en levier — sans quoi la réponse du
  matin finirait par être choisie pour obtenir la journée qu'on veut.
- Parler de retard, de jours perdus, d'occasions manquées.
- Compter les fois où un rythme a sauté.

## 11. Ce qui reste ouvert

- **Le coût d'une publication.** Le hub doit chiffrer l'atelier FCH, or une
  publication n'a pas de durée. Un forfait par format, corrigible ?
- **Un garde-fou sur les durées aberrantes.** Un événement de 288 h existait en
  base (*Photos album du club*, 13 septembre) : sans borne, il ferait déclarer
  288 h de terrain sur une semaine. Noé découpe ce cas à la main — reste à
  poser une durée plausible maximale pour que l'erreur ne fausse jamais un
  diagnostic.
- **La mission.** Reportée, mais notons à quoi elle servira, sinon on
  l'oubliera : c'est la seule chose capable de **départager deux objectifs de
  même urgence**. Le jour où le hub demandera « lequel des deux », c'est elle
  qui répondra, pas le calendrier.
- **`publications.rubrique` et les projets** se recouvrent partiellement. À
  trancher : une rubrique devient-elle un projet, ou restent-elles distinctes ?
- **Comment se saisit la famille d'un moment perso** sans alourdir la capture.
- **La mesure du temps des publications** : la durée se demande au passage du
  rond, mais seulement une fois les occurrences réelles en place (§ 2.3).

## 12. L'ordre des travaux

Chaque étape est utile seule et vérifiable seule. Aucune ne doit attendre la
suivante pour valoir quelque chose.

| # | Travail | Pourquoi à cette place |
|---|---|---|
| 0 | **Renommer `projet` → `espace`** | Préalable absolu : 413 occurrences en JS, 8 tables. Introduire `projets` avant créerait une confusion permanente. |
| 1 | **Occurrences réelles des récurrences** | Sans elles, aucun rythme n'est mesurable et aucune durée de série n'est saisissable. |
| 2 | **La durée au moment de cocher** | Le système entier compte des heures ; aujourd'hui 0 tâche sur 36 en porte une. |
| 3 | **La table `projets` et les rattachements** | Le fil tâche → projet → jalon → objectif. Rien ne se calcule avant. |
| 4 | **Les périodes** | Le premier arbitrage a lieu ici, en amont. |
| 5 | **Le calcul, sans écran** | Une fonction qui produit un diagnostic vérifiable seul, sans session ni réseau. |
| 6 | **Le rendez-vous du dimanche** | Le premier écran, une fois que le calcul dit vrai. |
| 7 | **Le vivier et les trois propositions du matin** | |
| 7 bis | **Les inférences** (§ 8) | Elles se posent une par une, chacune vérifiable seule. Aucune n'est nécessaire aux autres. |
| 8 | **L'arbitrage et sa trace** | Le plus délicat, donc le dernier. |
