# État des lieux — 12 août 2026

> Reprise : voir **§ 4 bis, « Par où reprendre »**. Trois chantiers de démarrage
> attendent, et ils sont décrits là.

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
| Calendrier global | `#calendrier` | grille mois/semaine + agenda ; on y pose, modifie et supprime |
| Formation | `#formation` | complet, avec la progression lue dans le gist Bac-3 |
| Page Yuno du hub | `#photo` | complète |
| **Site Yuno** | `#yuno` | Accueil · Journal · Créer · Calendrier · Réseau — le système « Terrain » v1.1 |
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

**La vue semaine a ses heures** : un bandeau pour ce qui n'a pas d'heure, puis
une grille de 24 h où un événement occupe sa vraie durée et où deux blocs qui se
chevauchent se partagent la largeur. **Les événements peuvent se répéter**
(chaque semaine, quinzaine, mois) — les occurrences ne sont pas stockées, elles
se déduisent à la lecture.

**La semaine ne fait qu'un cadre** (12 août, à la demande de Noé, sur le modèle
de Google Agenda). C'étaient trois boîtes bordées l'une sous l'autre — en-têtes,
bandeau du jour entier, grille horaire — et surtout mal alignées : la grille
horaire porte une gouttière d'heures à gauche que les deux autres n'avaient pas,
si bien que « MER. 12 » ne tombait pas au-dessus de la colonne du mercredi. La
gouttière (`--cal-gouttiere`) est maintenant portée par le cadre, les deux blocs
du haut s'en écartent d'autant, et les sept colonnes tombent en face du haut en
bas — vérifié à 0 px d'écart aux trois étages. Attention au pixel de
compensation : la bordure des blocs du haut EST le trait de la gouttière, d'où
le `calc(var(--cal-gouttiere) - 1px)`.

**Les cases ont été allongées** : une heure passe de 3 à 3,75 rem (45 → 56 px),
une case de mois de 5,5 à 7 rem (83 → 105 px).

**Les tâches et les publications portent une heure** (12 août, migrations
`taches_heure` et `publications_heure`). Colonne `heure time` nullable dans les
deux tables : avec heure, l'élément descend dans la grille horaire ; sans, il
reste dans le bandeau du jour entier. Le champ est offert dans le formulaire de
tâche, dans celui d'idée, et dans la fenêtre « Poser au calendrier ».
**« Quand » remplace « Échéance »** pour une tâche — une échéance est une date
qu'on subit, c'est le mot des objectifs et des commandes.

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

**Données réelles en base** : les 44 contacts du carnet (dont trois portent un
niveau de Passerelle), les 15 idées de départ avec leur pilier, et les 4 modèles
de messages. Tout le reste est vide — aucun moment, aucun événement, aucune
tâche. Noé n'a pas encore commencé à s'en servir pour de bon. **Conséquence
directe : le mur de photos de l'accueil affiche son écran vide**, et ne montrera
quelque chose qu'au premier moment logué avec une photo.

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
- **Ce qui reste non vérifié** : le glisser-déposer des colonnes, les chemins
  d'écriture des autres espaces (formation, FCH, perso), et **le cochage d'une
  tâche depuis le calendrier** — il n'y a aucune tâche `photo` datée en base, et
  en créer une écrirait une tâche puis une victoire dans les vraies données. Le
  rendu du cercle et le routage du clic sont vérifiés, pas le clic réel.

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

**Yuno / « Terrain »** (`docs/yuno-spec.md`, §9) :
7. Le cycle éditorial dit « publié » ; le brief disait « posté ». Gardé
   « publié » pour la cohérence du hub — à trancher à l'usage.
8. **Deux cartes de Passerelle manquent, faute de noms réels** : la ou les
   salles de concert visées (objectif : une première accréditation), et les
   clubs à cibler à froid. Les quatre clubs déjà au carnet sont des contacts
   établis, donc du niveau 2, pas du 3 : ils n'ont pas été mis dans la file
   sans son avis.
9. L'onglet « Carnet » de l'accueil a été renommé « Accueil » quand le Journal
   est né. Le mot « carnet » désigne donc deux choses — le Carnet de terrain et
   le carnet réseau. À surveiller à l'usage.

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

## 4 bis. Par où reprendre (fin de session du 12 août 2026)

Dans cet ordre, du plus rentable au moins pressé.

1. **Les trois chantiers du démarrage**, demandés par Noé et **non faits** —
   volontairement laissés plutôt qu'entamés en fin de session : ils réécrivent
   `monter()`, la partie qui décide si le site s'ouvre.
   1. **Cache de session** : garder le dernier état en `sessionStorage` et
      l'afficher pendant que les données fraîches arrivent. Le plus gros effet
      ressenti pour le moins de risque — rouvrir l'app devient instantané.
   2. **Charger par vue** : `stats`, `envois`, `modeles`, `commandes` ne servent
      qu'au Réseau et à la Passerelle. L'accueil n'a besoin que des moments,
      objectifs, publications et victoires. Aujourd'hui les 11 requêtes partent
      ensemble.
   3. **Chrome avant les données** : rendre l'en-tête, la nav et des blocs
      squelettes, puis injecter. Aujourd'hui tout attend derrière
      « Un instant… ».
2. **Les trois photos déjà en base pèsent 5 Mo chacune.** Les nouvelles sont
   réduites à l'envoi ; les anciennes non. Les rejoindre à la main via
   « Remplacer la photo » suffit à les faire passer à la moulinette.
3. **Vérifier Canela sur le téléphone.** Le `local("Canela-…")` marche sur le
   Mac ; iOS ne fournit probablement pas la police. Le test tient en un
   regard : ouvrir Créer, regarder « À venir » — si le `À` est droit au lieu
   d'être incliné, c'est la police de secours.
4. **Éprouver le cochage d'une tâche depuis le calendrier.** Le rendu et le
   routage sont vérifiés, le clic réel jamais — il n'y avait aucune tâche
   `photo` datée. Il y en a maintenant trois (faites), donc c'est testable :
   décocher puis recocher.
5. **Le bronze de la palette** (`#967D32`, `#EDC54E`, `#C4A341`…) n'est employé
   nulle part. Il pourrait remplacer le `--gris-chaud` inventé (`#a2988a`),
   mais il tire vers le doré — ce que la discipline de l'or cherchait à
   raréfier. À trancher à l'œil.

---

## 5. Décisions à ne pas défaire sans raison

Celles qui ne sont pas déjà dans `CLAUDE.md` ou les cahiers des charges :

**Les données personnelles n'entrent pas dans le dépôt.** Le dépôt est public.
Les 43 contacts (numéros, comptes Instagram) sont allés directement dans
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
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH — ce qui diffère passe en paramètre (cycle, checklist, piliers) |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date, les trois vues, les fenêtres, le glissement et le clavier |
| `js/yuno.js` | Le site Yuno : le Carnet, la base du carnet réseau, la Passerelle, le rendez-vous stats |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
