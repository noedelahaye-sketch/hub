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

**La préparation est la feuille de Yuno**, trois phases et des cases : le
module a déménagé dans `preparations-commun.js` (même leçon que le
calendrier — un deuxième site, un module commun, jamais une copie). Ce qui
change, c'est le contenu : la préparation d'une réunion est un savoir-faire,
et **six modèles semés en migration** le portent — CA en deux versions
(j'anime / j'y assiste : animer et assister sont deux métiers), point
alternance, réunion communication, rendez-vous partenaire, et les essentiels.
**Le bon modèle se propose d'office** : même objet et même rôle d'abord, puis
même objet, puis les essentiels. Le bon réflexe ne doit rien coûter. La boucle
d'apprentissage de Yuno vaut ici : « aussi au modèle » enrichit le modèle
depuis le terrain.

**Le bilan n'est PAS le compte-rendu officiel** (décision de Noé) : c'est ce
qui LE concerne. Deux questions pour tous — « Ce qu'il faut retenir — pour
toi », « Ce que ça te donne à faire » — et une troisième pour l'animateur
seulement : « Comment la réunion s'est déroulée », relue en préparant la
suivante (le rappel du dernier bilan la ressert). **Chaque ligne « à faire »
devient une tâche fch à l'enregistrement** — une ligne, une tâche, le contrat
est écrit sous le champ — et seulement à la PREMIÈRE écriture : corriger un
bilan ne recrée rien. Ce qui se décide en réunion entre dans le circuit
(« Aujourd'hui », l'espace Tâches), au lieu de dormir dans une note.

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

Aucune table nouvelle — et les réunions n'en ont pas créé non plus (21 août
2026) : `evenements` a gagné `reunion_objet` (CHECK ca · alternance ·
communication · partenariat · autre, non nul = réunion) et `reunion_animee` ;
`modeles_preparation` a gagné `projet`, `objet` et `anime` (le couple qui
propose le bon modèle d'office) ; `preparations` a gagné `bilan_animation`,
la troisième question de l'animateur. Les feuilles, elles, se rattachaient
déjà à n'importe quel événement.

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
