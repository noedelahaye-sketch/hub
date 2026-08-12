# Yuno — cahier des charges de l'espace

**3e version — le système « Terrain », 12 août 2026.** La 1re organisait tout
autour d'un pipeline de reportage ; la 2e a mis le cap et la création au
centre. Celle-ci va plus loin : **l'accueil du site montre le vécu, pas le
social.** Chaque règle s'accompagne de sa raison ; si une règle gêne à l'usage,
on la change en connaissance de cause.

> **Les deux documents fondateurs de « Terrain » ne sont pas dans ce dépôt.**
> `Yuno/brief-v1-1-terrain-yuno.md` (le quoi) et `Yuno/pourquoi-terrain-yuno.md`
> (le pourquoi, qui fait autorité sur l'intention) vivent sur la machine de Noé
> et sont dans le `.gitignore` : ils portent sa stratégie éditoriale, ses cibles
> et une analyse personnelle, et ce dépôt est public. **En cas de doute sur une
> décision, les relire avant de revenir à ce fichier-ci.**

---

## 0. Les cinq principes de « Terrain »

Ils gouvernent toute décision d'interface dans cet espace, et ils priment sur le
confort :

1. **Le succès se mesure en moments vécus** — matchs couverts, rencontres,
   œuvres finies. Les vues sont une donnée, jamais un verdict.
2. **Les réseaux sont une vitrine, pas une résidence** — on dépose l'œuvre, on
   repart. Les stats ont un rendez-vous hebdomadaire, jamais un fil continu.
3. **L'argent est une conséquence, pas un juge.**
4. **L'aller-vers se muscle par micro-doses graduées** — on mesure l'effort
   (les messages envoyés), jamais le résultat (les réponses reçues).
5. **La photo est un pont vers les gens** — les rencontres comptent autant que
   les images.

**Six questions d'arbitrage**, à poser avant d'ajouter quoi que ce soit ici :
est-ce que ça augmente le temps dehors ou le temps dedans ? est-ce que ça
mesure un effort contrôlable ou un résultat subi ? est-ce que ça indexe sa
valeur sur des chiffres ? est-ce que ça pousse vers les gens ou permet de les
éviter ? est-ce que ça ferme un débat mental ou en ouvre un ? est-ce que Noé
reste l'auteur ?

**Conséquences dures, à ne pas défaire :** aucune métrique sociale (vues,
abonnés, portée) hors du rendez-vous stats ; aucun taux de réponse ni compte de
silences nulle part ; pas de streak, pas de rouge, pas de « raté ».

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
Canela Deck Regular/Bold **et leurs deux italiques** (versions d'essai
« Trial » — noté), Gilroy Regular/Medium/SemiBold. Servis en OTF/TTF faute de
convertisseur woff2 (75–80 Ko pièce, acceptable). Ces familles ne chargent que
dans l'espace Yuno ; le reste du hub garde les siennes.

Les deux italiques ont été ajoutés le 12 août 2026. Sans eux, le navigateur
fabriquait une inclinaison synthétique qui décalait l'espacement après chaque
lettre accentuée — « Banque d'idé es », « Lé opards » — soit, sur un site
français, partout. **Ne jamais demander une graisse ou une posture dont le
fichier n'existe pas** : le navigateur ne refuse pas, il simule, et il simule
mal. La collection complète que Noé a déposée (`fonts/Canela_Collection/`,
3,7 Mo, huit graisses × quatre familles) reste hors du dépôt : seuls les
quatre fichiers réellement servis sont versionnés.

**Les trois leviers typographiques.** Chacun ne dit qu'une chose ; les employer
tous à la fois ne hiérarchise rien — si tout penche, plus rien ne ressort.

- **La police dit la nature.** Canela = ce que le site *est* (ses lieux, ses
  titres, son contenu). Gilroy = ce que le site *fait* (actions, états, dates,
  mesures, précisions). Tout l'utilitaire, sans exception.
- **La posture dit qui parle.** Italique = la voix du site, qui annonce et qui
  nomme un lieu. Romain = la voix de Noé — ce qu'il a vécu, écrit,
  photographié. Le contenu ne penche pas : il n'annonce rien, il est là.
- **La graisse dit l'importance ou l'état**, jamais la décoration.

| Rôle | Police | Posture | Graisse | Taille |
|---|---|---|---|---|
| Titre de section (`h2`) | Canela | italique | 700 | 1,375 rem |
| Onglet actif, porte | Canela | italique | 700 | 1 rem |
| Onglet inactif | Canela | italique | 400 | 1 rem |
| Titre de tuile (contenu) | Canela | romain | 400 | 1,125 rem |
| Sous-titre, libellé fort | Gilroy | romain | 600 | — |
| Corps, date, statut | Gilroy | romain | 400 | — |
| Chiffre | Geist Mono | — | — | via `.chiffre` |

Les titres de section ont perdu la casse haute et l'interlettrage qu'ils
portaient en Gilroy : c'était l'habillage d'une étiquette, illisible sur un
italique de 11 px. Un titre de section est un titre, pas un libellé.

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
  Accueil · Journal · Créer · Calendrier · Réseau. **Le site est toujours
  sombre**, quel que soit le réglage du téléphone : la signature blanche et or
  ne vit que sur fond sombre, et ça dit « on a quitté le hub ». Fond `#181818`,
  celui du logo. Une seule sortie, discrète, en pied de page : « Quitter le
  site » — nécessaire en plein écran sur téléphone, où il n'y a pas de barre
  d'adresse.

**Cinq entrées dans la barre, et des sous-pages qui n'en ajoutent pas.** La
banque d'idées (`#yuno/banque`), la Passerelle (`#yuno/passerelle`) et le
carnet (`#yuno/carnet`) sont des pages à part entière, atteintes par une tuile
depuis leur palier, et qui gardent allumé l'onglet dont elles dépendent —
Créer pour la première, Réseau pour les deux autres. Une barre de navigation ne
doit pas grandir à chaque écran qu'on ajoute. `ONGLET_DE_LA_VUE`, dans
`js/yuno.js`, dit quel onglet allumer pour quelle vue.

**« Créer » et « Calendrier » sont deux choses (décision du 7 août).**
« Créer » regroupe le calendrier éditorial et les futurs outils d'aide à la
création. « Calendrier » recense tout ce qui porte une date chez Yuno —
publications, tâches, événements, objectifs et jalons — avec des filtres par
nature. Le hub a le même espace Calendrier, tous projets confondus
(`#calendrier`).

### `#yuno` — l'accueil du site

**Elle montre et elle ouvre des portes ; elle ne gère rien** (décision de Noé,
12 août). Dans l'ordre :

1. **Les trois compteurs** — moments vécus · rencontres · œuvres finies. Ils se
   calculent depuis les moments, ne sont stockés nulle part, et **ne peuvent que
   monter** : c'est une réserve de valeur stable, l'anti-portée.
2. **Loguer un moment** — le bouton de capture, en évidence. C'est l'action de
   la page.
3. **Le mur de photos** — sous les compteurs, **dix photos en 4:3, côte à
   côte**, tirées au sort une fois par jour parmi tous les moments qui en
   portent une (décision de Noé, 12 août). Pas de titre au-dessus, pas de fiche
   autour : l'accueil montre ce qui a été vécu, il ne le raconte pas. Un moment
   sans photo n'y figure pas. Le tirage est stable dans la journée — la date
   sert de graine, rien n'est stocké — et change à minuit. Puis la porte
   « Ouvrir le journal », où vivent les fiches complètes.
4. **Objectifs** — ceux du projet photo, avec pourquoi et jalons.
5. **En création** — aperçu, plus la porte vers Créer.

Pas d'écran CAN 2027 : c'est un objectif parmi les gros, pas un lieu.

**L'invite du calendrier** s'affiche ici (et au Journal) quand un événement
photo est passé : « Tu as couvert [événement] — tu le notes au carnet ? ». Un
clic ouvre la capture, date et lieu déjà remplis. Trois garde-fous pour qu'elle
ne devienne jamais un reproche : sept jours de fenêtre, rien si un moment est
déjà logué ce jour-là, et **elle ne revient pas une fois écartée** (les écartés
vivent dans le `localStorage`). Une seule à la fois.

### `#yuno/journal` — le Carnet de terrain

La page source des moments : tout s'y retrouve, s'y ajoute et s'y retire.
L'accueil n'en montre que les derniers.

- **La capture** s'ouvre en **fenêtre volante**, comme au calendrier — le geste
  est le même partout dans le hub. Le bouton « Ajouter un moment » vit à gauche
  des trois compteurs, sur l'accueil comme au Journal : l'action et son résultat
  se répondent. Elle demande une date, un type (match · concert · sortie ·
  autre), et en facultatif l'événement ou le lieu, les rencontres, une photo,
  une note, et la case « œuvre finie ». Deux champs suffisent — elle doit se
  remplir debout, en sortant du stade, en moins de 30 secondes.
- **La photo se joint, elle ne se décrit pas.** Elle vit dans un bucket
  Supabase **privé** (`moments`) : le site et le dépôt sont publics, un bucket
  ouvert donnerait des liens recopiables par n'importe qui. On n'y accède que
  par une URL signée d'une heure, refabriquée à chaque visite. Supprimer un
  moment efface son fichier. L'ancienne colonne `photo_fiere` reste affichée si
  elle porte une phrase écrite avant que la pièce jointe existe.
- **Le fil**, antéchronologique, **EST le mur des victoires** : les moments et
  les victoires d'avant le carnet s'y mêlent. Les victoires nées d'un moment en
  sont écartées — le moment est déjà là, et plus riche que son reflet.
- **Loguer un moment crée une victoire** (`source = 'moment'`), qui remonte au
  dashboard du hub. Dans ce système, une victoire EST un moment vécu.
- **Les rencontres comptent autant que les images.** Un nom déjà au carnet se
  relie tout seul à sa fiche ; un inconnu garde un « + » pour lui en ouvrir une
  (statut `contact_etabli` : ils se sont vus en vrai). La capture ne s'arrête
  jamais pour ça.

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
  facile que partir de zéro.
- Publier = passer en `publié`, avec le lien. Chaque publication publiée est
  une victoire ? — non : ce serait du bruit à raison de plusieurs par semaine.
  Les victoires restent manuelles ou liées aux jalons et aux moments.

**Les quatre piliers** ouvrent l'écran, en encart : 1. Les Léopards & le foot
africain (la portée) · 2. Bord terrain (le portfolio) · 3. Dans l'œil du
photographe (la conversion) · 4. Carte blanche (la différence). Avec le test —
« ça rentre dans un pilier ? oui → je crée » — le plancher de 2 publications
par semaine, et le rappel que les stories restent une zone franche.

**Ils sont là pour FERMER un débat, pas pour ajouter une contrainte.** Le vrai
frein à la régularité n'était pas le manque d'idées : c'était de re-décider la
stratégie avant chaque publication. Les piliers rendent la question binaire.

Une idée porte donc aussi son **pilier**, sa **preuve** (ce qui montre que le
format marche déjà) et son **« pourquoi chez moi »**. La banque se filtre sur
le pilier et sur le statut. Le titre suffit toujours : noter une idée reste une
affaire de cinq secondes.

**La banque se parcourt en aperçus** (décision de Noé, 12 août 2026). Une tuile
de la banque ne montre que l'essentiel — le réseau, le format, le pilier, le
titre, le statut — dans une colonne étroite (16 rem, quatre de front sur
1240 px, une sur téléphone). Le titre se replie sur autant de lignes qu'il veut.
Une banque est un fonds où l'on fouille : quarante idées qui déballent chacune
leur preuve et leur « pourquoi » ne se parcourent pas du regard.

**Toute la fiche est dans une fenêtre volante**, ouverte au clic sur la tuile
(ou à l'Entrée, la tuile est un bouton) : la preuve, le « pourquoi chez moi »,
les notes, la checklist du carrousel, et **tous les gestes** — avancer le
statut, programmer une date, supprimer. L'aperçu ne porte aucun bouton : la
tuile entière est la cible, et rien ne se déclenche par erreur.

Dans la fenêtre, la suppression **s'écrit** (« Supprimer l'idée ») au lieu de
se dire par une croix : la croix de fermeture est au même bord, et deux « × »
l'un au-dessus de l'autre, dont l'un est irréversible, est un piège.

Les étiquettes (réseau, format, pilier) sont volontairement **très petites** :
ce sont des mentions de classement, pas des titres. Elles doivent se lire quand
on les cherche et disparaître quand on lit le reste.

`construirePublication` (la tuile complète) sert toujours à « À venir » et au
site du FCH : la banque et « Publiées » sont seules à passer par
`construireApercuPublication`.

**Le tirage de la semaine** répond les jours de panne : « Je ne sais pas quoi
poster » pose une seule question — y a-t-il un match cette semaine ? — puis
propose une idée. Avec match, le terrain est là, on le montre (piliers 1 et 2) ;
sans match, l'éducatif ne dépend d'aucun calendrier et passe devant (pilier 3).
Une idée sans pilier reste tirable : proposer vaut mieux que renvoyer à un
classement pas fait.

**La checklist carrousel** s'affiche repliée sur les publications au format
carrousel — hook de 5 à 8 mots, slides 1 ET 2 fortes, tension → développement →
appel à l'action, légende courte. Sans IA : un aide-mémoire, pas un outil qui
écrit à la place de Noé.

**Le cycle des statuts est un paramètre du module partagé** (`publications.js`) :
Yuno pose une étape `à développer` entre l'idée et le brouillon, le FC Hermitage
garde son cycle à quatre. Même chose pour la checklist et les piliers — ils ne
débordent pas sur le club.

### `#yuno/creer` — le rendez-vous stats (en bas de l'écran)

**On ne supprime pas un réflexe, on le remplace par un rituel.** Les chiffres
des réseaux n'existent nulle part ailleurs dans le site.

- **Six jours sur sept, la section ne montre AUCUN chiffre** : ni courbe, ni
  aperçu, ni total. Un compte à rebours (« Rendez-vous dimanche — dans 4 jours »)
  et le réglage du jour, rien d'autre. Le verrou est côté client, et c'est
  assumé : le système n'empêche pas la triche, il assèche le réflexe.
- **Le jour J** : un formulaire de cinq minutes — abonnés, portée de la semaine,
  top post — qui **ne s'enregistre pas sans la question rituelle** : « est-ce que
  ça change quelque chose à mes actions cette semaine ? ». « Non » est une
  réponse acceptée ; l'absence de réponse, non. C'est elle qui transforme la
  surveillance en pilotage.
- **L'historique n'est visible que pendant le rendez-vous.** Une courbe par
  mesure — **jamais deux échelles sur un même axe**, des abonnés et une portée
  hebdomadaire ne se comparent pas. Trait fin, points discrets, pas de
  quadrillage, et les chiffres écrits en encre plutôt qu'en couleur de série.
  La courbe se dessine à partir du deuxième rendez-vous.
- Le jour du rendez-vous vit dans le `localStorage` (défaut : dimanche), comme
  l'ordre des colonnes. C'est un réglage personnel, pas une donnée.

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

**L'échelle de relation s'est allongée** (12 août) sans rien perdre :
`pas de contact → message envoyé → relancé → répondu → contact établi →
bon contact → opportunité`. « Bon contact » est conservé — on ne remplace pas
ce qui marche.

### `#yuno/passerelle` — la Passerelle *(sa page)*

**Elle a quitté le carnet le 12 août, à la demande de Noé.** `#yuno/reseau` est
devenu un palier avec deux portes : le carnet est un **fonds où l'on cherche**,
la Passerelle une **file où l'on agit**. Les mêler sur un écran obligeait à
basculer entre les deux pour rien. Les deux pages gardent l'onglet Réseau
allumé, et les commandes restent sur le palier.

Elles partagent la même base — `baseContacts()` filtre, cherche et trie pour
les deux. Noé avait déjà construit son pipeline relationnel sans le nommer ; on
ajoute la couche qui pousse à l'action.

- **La file d'action de la semaine**, groupée par micro-dose : **1 Répondre**
  (des messages reçus qui attendent), **2 Relancer** (des relations vivantes à
  entretenir), **3 Ouvrir** (des portes à pousser). La peur du rejet ne se
  contourne pas, elle s'entraîne — d'où la gradation. Un contact entre dans la
  file quand on lui donne un niveau, depuis la colonne « Niveau » du tableau.
- **Dans la file, une case vide passe DEVANT**, au rebours du tableau :
  « jamais écrit » est ce qui attend le plus, pas ce qui est le plus ancien.
- **La seule métrique : les messages envoyés** — cumul et « cette semaine »,
  déduits d'un journal (une ligne = un envoi). **La table `journal_envois` n'a
  pas de colonne « répondu », et c'est délibéré** : si le compteur dépendait des
  réponses, chaque silence deviendrait un rejet mesuré. Ne jamais afficher de
  taux de réponse ni de compte de non-réponses.
- **« Envoyé ✓ »** enregistre l'envoi, date la fiche et fait avancer la
  relation. **Une relation vivante ne redescend jamais** : écrire à quelqu'un
  qui a répondu ne le ramène pas à « relancé ».
- **L'objectif doux** (défaut 1 envoi/semaine, réglable, dans le
  `localStorage`) se dit une fois atteint — « C'est fait pour cette semaine » —
  et se tait en dessous. Un plancher rassurant, jamais une dette.
- **La bibliothèque de modèles** : la friction du premier message est le
  principal mur de l'aller-vers. Titres et corps s'éditent en place, un bouton
  copie le texte pour le coller ailleurs. Quatre modèles de départ, chargés en
  base : accréditation concert, premier contact club, proposition à un média,
  relance courtoise.

Champs ajoutés à une fiche, tous facultatifs : `objectif` (pourquoi ce contact),
`niveau` (1–3), `date_dernier_envoi` — **distinct de `dernier_echange`** : un
envoi est un effort à soi, un échange est bidirectionnel — `prochaine_action` et
`prochaine_action_date`, qui portent la relance au calendrier.

**Les contacts eux-mêmes ne sont pas dans ce dépôt.** Ce sont des données
personnelles réelles (numéros, comptes) et le dépôt est public : elles vivent
uniquement dans Supabase, derrière la connexion. Seul le schéma est versionné.

### `#yuno/reseau` — les commandes *(section, plus un onglet)*

**Une commande naît d'une relation** : elle n'a pas besoin d'un onglet à elle,
et le sien a disparu le 12 août. Titre, client (relié à une fiche du carnet
quand le nom y figure), statut, échéance, montant facultatif, lien du livrable,
notes.

Le cycle va du devis au paiement : `devis → en cours → livrée → payée`.
**Livrer crée une victoire ; encaisser n'en crée pas une seconde** — c'est le
même travail, et l'argent est une conséquence, pas un juge. Les livrées et
payées se replient en bas, comme le backlog. Une commande à échéance apparaît
au calendrier (Yuno et hub).

---

## 5. Les données

Les tables du hub servent déjà : `objectifs`, `taches`, `evenements`,
`victoires` (projet `photo`). Le schéma complet, colonne par colonne, vit dans
`supabase/migrations/` — **ce dépôt est le gardien unique du schéma Supabase**,
et ce paragraphe ne fait que dire à quoi sert chaque table.

| Table | Ce qu'elle porte |
|---|---|
| `publications` | le calendrier éditorial. `date_prevue` NULL = banque d'idées. Colonnes Yuno : `pilier`, `preuve`, `pourquoi_moi` (NULL pour le FCH) |
| `contacts` | le carnet réseau, et la couche Passerelle (`objectif`, `niveau`, `date_dernier_envoi`, `prochaine_action`, `prochaine_action_date`) |
| `commandes` | le suivi, du devis au paiement. `client_id` relie au carnet |
| `moments` | le Carnet de terrain — un moment vécu = une ligne. `photo_chemin` pointe le fichier dans le bucket privé `moments` |
| `rencontres` | qui a été rencontré, à quel moment. `contact_id` facultatif |
| `journal_envois` | un envoi = une ligne. **Aucune colonne « répondu »** |
| `stats_hebdo` | un rendez-vous = une ligne. `reponse_rituelle` est NOT NULL |
| `modeles_messages` | la bibliothèque de messages à personnaliser |

Trois choix de schéma portent l'intention, et ne se défont pas sans la défaire :

- **Les compteurs ne sont stockés nulle part.** Les trois du Carnet et les deux
  de la Passerelle se déduisent de faits accumulés — qui ne peuvent que monter.
- **`journal_envois` n'a pas de colonne « répondu ».** On mesure l'effort,
  jamais le silence.
- **`stats_hebdo.reponse_rituelle` est NOT NULL.** Un relevé de chiffres sans la
  question qui les remet à leur place n'a pas de valeur.

RLS et politiques identiques aux autres tables : tout réservé au rôle
`authenticated`.

**Les données de Yuno ne sont pas dans ce dépôt** — ni les contacts (données
personnelles réelles), ni les 15 idées de départ, ni les modèles de messages
(la stratégie éditoriale et les cibles). Elles ont été chargées directement
dans Supabase en SQL. Seul le schéma est versionné.

---

## 6. Ce que le hub montre de Yuno

Le rappel quotidien vit sur le dashboard, pas ici :

- les tâches actives et la progression des objectifs photo — déjà en place ;
- les victoires Yuno — déjà en place ;
- **les publications datées de la semaine**, dans « Ta semaine », au même rang
  que les événements — à brancher quand la table `publications` existera.

---

## 7. Ce qu'on ne construit pas (encore)

Hors périmètre de « Terrain » v1.1, explicitement :

- **La partie perso** — le chantier contrôle et prise de risque. Il aura son
  espace séparé. Le système actuel n'a pas à jouer ce rôle : il doit juste ne
  rien aggraver.
- **L'assistant IA (API Claude)** pour proposer des hooks et des bases de
  légende — v2 de la Vitrine. Il proposera, Noé choisira et retravaillera.
  **Jamais générer le contenu à sa place** : une IA qui écrirait tout
  nourrirait son doute (« est-ce vraiment moi ? ») au lieu de le réduire.
- **L'API Instagram** et toute automatisation de publication.
- **Les notifications push.**
- **L'export/import JSON global** : le brief le demandait en supposant un
  `localStorage`. Tout vit dans Supabase, qui est déjà la sauvegarde — différé
  faute d'utilité.

Et, de la version précédente, toujours valable :

- **Compta** : le jour où les revenus arrivent, ce sera une vraie question.
- **Suivi automatique des abonnés Instagram** : techniquement possible
  (compte créateur relié à une Page Facebook, app Meta, jeton longue durée à
  renouveler ~60 jours, Edge Function Supabase pour garder le jeton hors du
  site public). De la tuyauterie réelle pour un chiffre — et le rendez-vous
  hebdomadaire vaut justement par le geste de saisie. Différé.
- **Gestion de fichiers photo** : les photos vivent dans Lightroom et sur les
  disques ; ici, des liens et des états.

---

## 8. La direction longue (pour éclairer les choix futurs)

Elle vient du document « pourquoi » et ne se lit nulle part dans le code :

- **Une pratique qui ralentit.** Moins d'œuvres, plus profondes : séries
  documentaires, expositions, tirages, un livre. Le modèle « créateur qui poste
  à vie » est un véhicule vers des objectifs précis, pas la destination.
- **La vidéo viendra par la porte douce.** Le Reel-diaporama est la passerelle
  choisie : techniquement de la vidéo, 100 % de la photo. **Ne jamais pousser
  une fonctionnalité qui présuppose du tournage ou du face-caméra.**
- **Les jalons concrets** : la CAN 2027 (le compte CAF Media Channel existe ;
  une lettre de mission d'un média congolais est la voie d'accréditation d'un
  freelance), l'OM au Vélodrome, une première accréditation concert, un premier
  produit presets quand les contenus « How I edited » généreront des demandes.

---

## 9. Questions restantes

**Deux, ouvertes au 12 août 2026 :**

1. **Le vocabulaire du cycle éditorial.** Le brief dit « posté », le hub dit
   « publié » partout ailleurs. « Publié » a été gardé pour la cohérence, et le
   mot de clôture dit bien « C'est posté ». À trancher à l'usage.
2. **Les cartes de la Passerelle qui manquent encore.** Léopards Leader et
   BoomSportRDC sont en niveau 2, l'OM en niveau 3. Restent à créer, faute de
   noms réels : la ou les salles de concert visées (objectif : une première
   accréditation), et les clubs que Noé veut cibler à froid — les quatre déjà
   au carnet sont des contacts établis, donc du niveau 2, pas du 3.

Le reste a été tranché. Les cinq écrans du site sont construits : Accueil,
Journal, Créer, Calendrier, Réseau. Prochaine étape : l'usage réel.
