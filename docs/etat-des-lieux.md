# État des lieux — 13 août 2026

> Reprise : voir **§ 4 bis, « Par où reprendre »**. Les trois chantiers du
> démarrage sont faits sur Yuno (§ 2 ter) ; reste à les porter aux autres
> espaces.

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
| Tâches | `#taches` | toutes les tâches, datées ou non, faites ou non — priorité 1 à 4 |
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

**L'onglet Calendrier est une icône, en dernière place** (13 août, demande de
Noé), dans les trois barres — le hub, Yuno et le FCH. Il ne nomme pas un lieu,
il ouvre la vue qui les traverse tous. **Dernier, mais DANS la rangée** : une
première version le poussait au bord opposé, Noé l'a fait revenir — une barre
avec un élément à part se lit comme deux barres. Le lien tout fait est
`ongletCalendrier`, dans `calendrier-commun.js`.

**La fenêtre « Poser au calendrier » a perdu son dépliant** : le bouton
« Ajouter — publication » entre les pastilles de nature et le premier champ
répétait ce que la fenêtre et les pastilles disaient déjà, et son chevron
promettait un repli sans usage. `avecPli: false`, le mécanisme existait déjà.

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
  ferait double emploi avec le nom du projet, déjà coloré à droite.

**La capture a été refaite le même jour**, sur un deuxième puis un troisième jeu
de captures de Noé : un « + » ouvre une **tuile volante**, on écrit le nom
directement, et **une rangée de pastilles** — date, projet, priorité — ouvre
chacune son choix en menu flottant. Le formulaire à six champs empilés a
disparu.

- **La tuile flotte au-dessus de la page assombrie**, et pas au même endroit
  selon l'écran (demande de Noé) : **au milieu sur ordinateur** — il n'y a pas
  de clavier qui monte du bas, et une tuile posée en bas d'un grand écran laisse
  un vide au-dessus d'elle — **collée en bas sur téléphone**, là où arrive le
  pouce. Elle réutilise `.fenetre-fond`, le fond des autres fenêtres du hub.
- **Sur téléphone elle se pose juste au-dessus du clavier.** `visualViewport`
  est le seul moyen fiable de savoir la place qu'il prend : `innerHeight` ne
  bouge pas quand le clavier monte, seule la fenêtre VISUELLE rétrécit, et la
  différence entre les deux EST la hauteur du clavier. Le résultat sort en
  variable CSS (`--bas-clavier`) plutôt qu'en style direct — c'est la feuille de
  style qui décide quoi en faire, et sur grand écran elle n'en fait rien.
  **Vérifié** en posant la variable à 300 px : la tuile monte de 300 px, au
  pixel près.
- **Ni `overflow`, ni `max-height` sur la tuile** : les menus se posent au-dessus
  d'elle, donc hors de sa boîte, et un conteneur de défilement les découperait.
  Piège rencontré en écrivant la règle.
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
- **Une tâche capturée part au backlog**, toujours. Une tâche notée à la volée
  n'est pas un des trois chantiers du moment ; la promouvoir se fait dans la
  liste, en connaissance de la règle des 3 actives.
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

---

## 2 bis bis. Deux bugs trouvés en passant, et réparés

Aucun des deux ne venait des chantiers du jour. Tous deux étaient invisibles
faute d'avoir été exercés.

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

**Ce qu'il reste à faire** : `dashboard.js`, `perso.js`, `espace-projet.js`,
`fch.js`, `photo.js` font déjà le chrome d'abord, mais **aucun n'a le cache ni
le chargement par vue**. `hermitage.js` et `calendrier.js` n'ont même pas le
squelette. Le dashboard est le plus rentable des suivants : c'est la page du
check-in matinal, et elle part sur sept requêtes.

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

1. **Porter les trois chantiers du démarrage aux autres espaces.** Ils sont
   faits sur Yuno (§ 2 ter) et n'attendent qu'un avis à l'usage avant d'être
   généralisés — d'abord au dashboard, la page du check-in matinal, qui part sur
   sept requêtes et n'a ni cache ni chargement par vue.
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
| `js/taches.js` | L'espace Tâches : toutes les tâches, la priorité, la capture |
| `js/cache-session.js` | Le dernier état d'un espace, gardé le temps de l'onglet (§ 2 ter) |
| `js/api.js` | **Tous** les appels Supabase, une fonction par usage |
| `js/espace-projet.js` | La fabrique d'espace projet (formation) + gabarits partagés |
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH — ce qui diffère passe en paramètre (cycle, checklist, piliers) |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date, les trois vues, les fenêtres, le glissement et le clavier |
| `js/yuno.js` | Le site Yuno : le Carnet, la base du carnet réseau, la Passerelle, le rendez-vous stats |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
