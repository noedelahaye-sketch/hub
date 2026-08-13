# État des lieux — 13 août 2026

> **Reprise : § 4 bis, « Par où reprendre ».**
>
> La session du 13 août a ouvert **l'espace Tâches** (§ 2 quater), refait
> **toute la capture** du hub — une tuile volante unique pour poser une tâche
> comme n'importe quoi au calendrier —, allégé **le démarrage** de Yuno
> (§ 2 ter) et réparé **cinq bugs antérieurs** trouvés en exerçant le code
> (§ 2 bis bis).
>
> Trois choses valent d'être sues avant de continuer :
> le **plafond de 3 tâches actives est en sommeil** (§ 2 quater), les trois
> chantiers du démarrage ne sont **faits que sur Yuno**, et la **tuile de
> capture** est maintenant le seul endroit où l'on crée quoi que ce soit de
> daté — la toucher, c'est toucher quatre écrans à la fois.

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

**Données réelles en base, au soir du 13 août** : 45 contacts au carnet (dont
trois portent un niveau de Passerelle), 15 idées avec leur pilier, 4 modèles de
messages, 1 moment avec sa photo, 2 événements, 2 humeurs, et **4 tâches
saisies par Noé lui-même** — les premières.

C'est le changement du jour, et il compte : **Noé a commencé à s'en servir pour
de bon.** Les écrans ne se jugent plus à vide. Aucun objectif, aucune commande
en revanche : ces deux-là n'ont encore jamais été exercés avec de la matière.

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

**Ce qu'il reste à faire** : `dashboard.js`, `perso.js`, `espace-projet.js`,
`fch.js`, `photo.js` font déjà le chrome d'abord, mais **aucun n'a le cache ni
le chargement par vue**. `hermitage.js` et `calendrier.js` n'ont même pas le
squelette. Le dashboard est le plus rentable des suivants : c'est la page du
check-in matinal, et elle part sur sept requêtes.

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

**Ouvertes par la session du 13 août** — aucune ne bloque, toutes attendent
l'usage :

10. **Le plafond de 3 tâches actives dort.** Noé a demandé de masquer le réglage
    backlog/active « pour le moment ». Conséquence assumée : « Aujourd'hui » ne
    filtre plus, il montre les 9 premières tâches. Le jour où ce bloc redevient
    une liste, c'est le signe qu'il faut rallumer la pastille — tout le code est
    en place.
11. **« Aujourd'hui » ignore les tâches sans date.** Il montre ce qui est daté
    d'aujourd'hui ou d'avant. Une tâche notée sans échéance n'y apparaîtra
    jamais : à confirmer que c'est bien ce qu'il veut.
12. **Le formulaire de MODIFICATION d'un élément du calendrier garde ses menus
    déroulants natifs.** Seul l'ajout est passé en listes de choix. Noé n'a parlé
    que de l'ajout ; l'incohérence se verra peut-être à l'usage.
13. **Le fondu au bord de la bande de pastilles** est une addition de ma part,
    pas une demande : il signale qu'il reste à défiler. Trois lignes de CSS à
    retirer s'il gêne.

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

## 4 bis. Par où reprendre (fin de session du 13 août 2026)

Dans cet ordre, du plus rentable au moins pressé.

1. **Vivre avec l'espace Tâches quelques jours avant d'y toucher.** Il est né
   aujourd'hui et a changé six fois dans la journée. Trois décisions y attendent
   l'usage plutôt qu'un arbitrage à froid : le sommeil du plafond de 3 actives,
   ce que « Aujourd'hui » montre (les tâches datées du jour ou avant, jamais les
   sans-date), et le tri qui fait passer une tâche datée avant une tâche sans
   date à priorité égale.
2. **Porter les trois chantiers du démarrage aux autres espaces.** Faits sur
   Yuno seulement (§ 2 ter). Le dashboard est le plus rentable : c'est la page
   du check-in matinal, elle part sur **neuf** requêtes depuis qu'elle assemble
   la semaine du calendrier, et elle n'a ni cache ni chargement par vue.
3. **Vérifier la tuile sur le vrai iPhone.** Tout a été mesuré avec un clavier
   *simulé* (`--bas-clavier` posée à la main) : la montée de 336 px, les 0 px de
   déplacement entre pastilles, le fond figé. Le comportement réel de Safari
   avec un vrai clavier reste à confirmer — c'est le seul point de la session
   dont la vérification est une imitation, pas la chose même.
4. **Les trois photos déjà en base pèsent 5 Mo chacune.** Les nouvelles sont
   réduites à l'envoi ; les anciennes non. Les rejoindre à la main via
   « Remplacer la photo » suffit à les faire passer à la moulinette.
5. **Vérifier Canela sur le téléphone.** Le `local("Canela-…")` marche sur le
   Mac ; iOS ne fournit probablement pas la police. Le test tient en un
   regard : ouvrir Créer, regarder « À venir » — si le `À` est droit au lieu
   d'être incliné, c'est la police de secours.
6. **Un espace n'est monté qu'une fois, et se relit au retour.** C'est neuf
   (§ 2 quater). Si un écran affiche quelque chose de périmé, c'est que son
   `rafraichir()` manque ou oublie un bloc — chercher là avant d'accuser le
   cache de session, qui ne vit que dans Yuno.
7. **Le bronze de la palette** (`#967D32`, `#EDC54E`, `#C4A341`…) n'est employé
   nulle part. Il pourrait remplacer le `--gris-chaud` inventé (`#a2988a`),
   mais il tire vers le doré — ce que la discipline de l'or cherchait à
   raréfier. À trancher à l'œil.

**Deux chantiers sont clos et n'ont plus à figurer ici** : le cochage d'une
tâche depuis le calendrier a été exercé pour de vrai (créée, cochée, décochée,
supprimée, base relue en SQL), et les onze requêtes de l'ouverture de Yuno sont
tombées à six.

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

## 6. Les pièges rencontrés, pour ne pas les revivre

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
| `js/dashboard.js` | L'accueil : humeur, victoires, objectifs, les tâches du jour, la semaine du calendrier |
| `js/cache-session.js` | Le dernier état d'un espace, gardé le temps de l'onglet (§ 2 ter) |
| `js/api.js` | **Tous** les appels Supabase, une fonction par usage |
| `js/espace-projet.js` | La fabrique d'espace projet (formation) + gabarits partagés |
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH — ce qui diffère passe en paramètre (cycle, checklist, piliers) |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date, les trois vues, le glissement et le clavier — **et la tuile « Poser au calendrier » avec `poserAuCalendrier` / `brancherCapture`, partagées par le hub, l'accueil et les deux sites** |
| `js/yuno.js` | Le site Yuno : le Carnet, la base du carnet réseau, la Passerelle, le rendez-vous stats |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
