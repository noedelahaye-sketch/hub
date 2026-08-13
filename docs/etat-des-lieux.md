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

**FC Hermitage — mis de côté** (Noé, 13 août : « on met de côté encore »). Les
quatre questions restent ouvertes et attendent que ce chantier s'ouvre ; aucune
ne gêne le reste du hub :
1. Les rubriques éditoriales proposées (avant-match, résultats, portrait,
   coulisses, partenaire, vie du club) correspondent-elles à ce qu'il publie ?
2. Ses 4 objectifs de fin d'alternance — nommés nulle part.
3. Des statuts de relation pour les partenaires, ou trop tôt ?
4. Le contenu de l'écran « Club ». (Plus l'idée de la banque qui ne s'ouvre
   pas, et la lisibilité du logo sur le bleu : tout part avec ce chantier.)

**Yuno** — deux lectures de captures, **confirmées justes par Noé le 13 août** :
le type des deux agences (« Agence ») et la fiche de « Nouhou Tolo »
(`@salvadorebanouh`, club « Sounders »). Rien à corriger.

**Yuno / la Passerelle** : **l'outil sera revu dans son ensemble** (Noé,
13 août). Ne pas y toucher par petites touches en attendant — et donc ne pas
chercher à combler les deux cartes qui manquent (salles de concert, clubs à
cibler à froid) : elles feront partie de la refonte.

**Le mot « carnet » ne désigne plus qu'une chose** (tranché le 13 août) : le
Carnet de terrain. La base de contacts s'appelle **le réseau** (§ 2 nonies).

**Le bouton « + Ajouter un moment » de Yuno reste** (décision de Noé, 13 août
2026). Il double la porte « Moment » de la tuile sur l'Accueil et le Journal,
et c'est assumé : sur les deux pages du carnet, le geste le plus fréquent
mérite d'être nommé en toutes lettres plutôt que caché derrière une pastille.

**Sur le site du FCH, une idée de la banque ne s'ouvre pas** (trouvé le 13 août
en exerçant les écritures, § 2 ter ter). Les tuiles se présentent comme des
boutons et portent `data-ouvrir-pub`, mais `hermitage.js` n'écoute jamais cet
attribut — Yuno, si. Une idée sans date n'a donc aucun moyen d'être avancée ni
supprimée depuis le FCH. Deux sorties : ouvrir la même fenêtre que Yuno, ou
assumer que l'écran « Créer » du FCH ne sert qu'à noter. **Repoussé
volontairement** (Noé, 13 août) : le site du FCH sera repris à part.

**Sur le fond bleu du FCH** : le logo y perd en lisibilité (traits noirs et
bleus). Noé a demandé de retirer la plaque blanche qui corrigeait cela ; c'est
assumé, mais à rouvrir s'il le trouve gênant à l'usage.

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

## 4 bis. Par où reprendre (fin de session du 13 août 2026)

Dans cet ordre, du plus rentable au moins pressé.

1. **Vivre avec l'espace Tâches quelques jours avant d'y toucher.** Il est né
   aujourd'hui et a changé six fois dans la journée. Trois décisions y attendent
   l'usage plutôt qu'un arbitrage à froid : le sommeil du plafond de 3 actives,
   ce que « Aujourd'hui » montre (les tâches datées du jour ou avant, jamais les
   sans-date), et le tri qui fait passer une tâche datée avant une tâche sans
   date à priorité égale.
2. **Ce que l'analyse de fluidité laisse ouvert.** Les deux sites sont faits
   (§ 2 ter ter, 4). Restent : les **espaces projet** (`espace-projet.js` —
   cocher une tâche, un jalon) qui n'ont pas été convertis, et les **gestes du
   calendrier** (déplacer, supprimer) qui relisent encore leurs six tables après
   coup. Plus une chose qu'aucune mécanique simple ne donne : **animer le
   DÉPART** d'une ligne, qui demanderait de tenir les nœuds un à un plutôt que
   de redessiner.
   Le module `js/ecriture.js` est là : convertir un geste tient en dix lignes.
   **Ne pas convertir les formulaires** — c'est un choix, pas un oubli (§ 4).
3. **Porter le démarrage aux espaces qui restent.** Yuno, le dashboard et le
   calendrier l'ont (§ 2 ter, 2 ter bis, 2 ter ter) ; `perso.js`,
   `espace-projet.js`, `fch.js`, `photo.js` et `hermitage.js` ne l'ont pas.
   Aucun n'est pressé — ce ne sont pas eux qu'on ouvre le matin, et le service
   worker leur a déjà retiré l'attente du code.
4. **Vérifier la tuile sur le vrai iPhone.** Tout a été mesuré avec un clavier
   *simulé* (`--bas-clavier` posée à la main) : la montée de 336 px, les 0 px de
   déplacement entre pastilles, le fond figé. Le comportement réel de Safari
   avec un vrai clavier reste à confirmer — c'est le seul point de la session
   dont la vérification est une imitation, pas la chose même. Même occasion :
   **le service worker sur iOS**, où une application ajoutée à l'écran d'accueil
   se comporte différemment d'un onglet.
5. **Vérifier Canela sur le téléphone.** Le `local("Canela-…")` marche sur le
   Mac ; iOS ne fournit probablement pas la police. Le test tient en un
   regard : ouvrir Créer, regarder « À venir » — si le `À` est droit au lieu
   d'être incliné, c'est la police de secours.
6. **Un espace n'est monté qu'une fois, et se relit au retour.** C'est neuf
   (§ 2 quater). Si un écran affiche quelque chose de périmé, c'est que son
   `rafraichir()` manque ou oublie un bloc — chercher là avant d'accuser le
   cache de session, qui ne vit que dans Yuno et sur l'accueil.


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
| `js/mouvements.js` | Ce qui vient d'apparaître dans une liste, et rien d'autre (§ 2 ter ter) |
| `js/ecriture.js` | L'écran d'abord, le réseau ensuite — les trois formes de geste, et leur retour en arrière |
| `js/vendor/` | supabase-js figé, rapatrié par `tools/telecharger-supabase.py`. Aucun CDN |
| `sw.js` | La coquille en cache — HTML, CSS, JS, polices. **Jamais les données** (§ 2 ter ter) |
| `js/api.js` | **Tous** les appels Supabase, une fonction par usage |
| `js/espace-projet.js` | La fabrique d'espace projet (formation) + gabarits partagés |
| `js/publications.js` | Le calendrier éditorial, partagé Yuno/FCH — ce qui diffère passe en paramètre (cycle, checklist, piliers) |
| `js/calendrier-commun.js` | L'assemblage de tout ce qui porte une date, les trois vues, le glissement et le clavier — **et la tuile « Poser au calendrier » avec `poserAuCalendrier` / `brancherCapture`, partagées par le hub, l'accueil et les deux sites** |
| `js/yuno.js` | Le site Yuno : le Carnet, la base du carnet réseau, la Passerelle, le rendez-vous stats |
| `js/hermitage.js` | Le site FC Hermitage |
| `js/revisions.js` | Lecture du gist Bac-3 — chaque calcul cite sa source |
| `tools/generer-icones.py` | Les icônes des trois applications |
