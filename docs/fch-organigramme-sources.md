# Qui fait quoi — sources et organisation

## Lecture proposée

- **Bureau et référents** : coprésidence, administration, responsables des commissions.
- **Commissions** : regroupement par besoin, avec rôle lisible sous chaque portrait.
- **Équipes sportives** : responsables des pôles puis équipes de la saison 2026–2027.
- **Recherche transversale** : nom, catégorie, rôle ou mot des missions ; résultats uniques par personne.
- **Une fiche par personne**, à `#hermitage/commissions/<id>` : toutes ses missions et ses rôles sportifs, avec liens vers ses collègues.

44 personnes, 23 groupes dans les données. Une même personne peut apparaître
plusieurs fois dans les organigrammes, mais possède une seule fiche.

## Documents retenus

Dans `/Users/noedelahaye/Documents/FCH/Communication/Club/` :

| Source | Utilisation |
| --- | --- |
| `Responsabilités FCH.pdf`, pages 1–3 | Répartition individuelle et synthèse fidèle des missions, sans attribuer toutes les missions d’une commission à chacun de ses membres |
| `Organigrammes/Le bureau copie.jpg` | Bureau et référents 2026–2027 ; identités et portraits |
| `Organigrammes/Les commissions.jpg` | Commissions 2026–2027 ; photo de Lina, membres supplémentaires et identités |
| `Organigrammes/Sportif/Le bureau copie.jpg` | Responsables sportif et de pôles |
| `Organigrammes/Sportif/2cole de foot.jpg` | U7, U9, U11 et U13, 2026–2027 |
| `Organigrammes/Sportif/FCH-COC.jpg` | U15, U17 et U20 de l’entente, 2026–2027 |
| `Organigrammes/Séniors et loisirs.jpg` | Séniors, Mam’s, vétérans et entraîneurs des gardiens, 2026–2027 |

Les **portraits** viennent des exports individuels, un fichier par personne, dans
`/Users/noedelahaye/Documents/FCH/Communication/Photo indiv/` (`Bureau/`,
`Commissions/`, `Sportif/`). Ils remplacent depuis le 16 septembre 2026 les
fenêtres découpées dans les photos de groupe.

**Le nom du fichier ne dit pas qui est dessus** : chaque portrait porte son nom
écrit en dur sous la pastille, et c'est LUI qui fait foi — `Sportif/Franck.png`
est Stéphane Coissard, `Sportif/Jon.png` Stéphane Fetter, `Sportif/Olivier.png`
Grégory Mellarin, `Sportif/Cedric.png` Elliot Chardon, `Sportif/Alyssa-1.png`
Tom Heriaud, `Sportif/Léo-1.png` Antoine Barral, `Sportif/Melvin-1.png` Gregory
Balayn, `Sportif/Sandrine.png` Emma Liconnet. *Les rapprocher par le prénom du
fichier donne huit portraits faux sur quarante-quatre.*

Quand une personne figure dans plusieurs dossiers, **c'est la version du bureau
qui est retenue** : sa pastille est la plus grande (128 px contre 100), et la
fiche l'affiche à 150 px. La couleur de la pastille varie donc d'une carte à
l'autre — c'est celle de l'organigramme d'origine, pas un choix du hub.

Les anciens organigrammes 2025–2026 ont été consultés puis écartés lorsque les
exports 2026–2027 du bureau et des commissions ont été retrouvés.

## Résolutions et limites

- Noé a confirmé le 16 septembre 2026 qu’**Emma = Emma Liconnet**. Sa fiche réunit Partenaires, Manifestations et U15.
- **Lina Amine** : photo retrouvée dans `Les commissions.jpg`, version 2026–2027.
- Noé a confirmé le 16 septembre 2026 que **Kepo = Thibault Carteron**. Une seule fiche, celle de Thibault, qui reprend les missions attribuées à Kepo aux manifestations. Le prénom s'écrit **Thibault**, comme sur les deux portraits du club.
- Le PDF ajoute des contributions qui n’apparaissent pas toutes dans l’affiche des commissions (Sandy aux infrastructures, Thibault aux manifestations). Elles sont conservées, avec les membres figurant sur les affiches (Florian, Thibault).
- Pour les éducateurs, Florian et Thibault, aucune liste de missions individuelles n’est inventée : la fiche expose le rôle documenté et précise l’absence de détail individuel dans le PDF.
- **Deux portraits différents portent le nom « Christophe Lucchetta »** : celui du bureau et des commissions (cheveux courts et sombres) et celui du sportif (barbe et cheveux blancs). Le hub retient celui du bureau, qui est aussi celui que montrait la découpe précédente. À faire trancher par le club.
- Les responsables de catégories sportives sont ceux entourés de rouge sur les affiches. Les couleurs des groupes ne constituent pas à elles seules le libellé du rôle.

## La largeur d'une tuile suit ce qu'elle porte

Une grille à deux colonnes donnait la même largeur à tout le monde : les trois
référents de pôle, une personne chacun, y prenaient une demi-page et se
répartissaient sur deux rangs. Les tuiles sont désormais une **rangée flexible**,
chacune partant d'une base calculée sur son effectif.

- **La base est ce qu'il faut pour tenir le groupe sur UN rang** — un portrait
  fait 110 px, l'écart au voisin 10, la tuile 14 de chaque côté, d'où
  `120 × n + 18`. Une base plus courte promettrait un groupe qu'elle ne sait pas
  montrer : *mesuré avant correction, U9 et ses trois éducateurs se repliaient en
  deux rangs plus un.* Elle s'arrête à cinq — au-delà, la tuile prend la ligne
  entière et ses rangs se justifient d'eux-mêmes.
- **Un plancher de 220 px**, qui est celui du titre : « Pôle école de foot » ne
  se coupe pas en deux, et trois tuiles à une personne tiennent encore de front
  sur un écran de 800 px.
- **C'est une base, pas une largeur** : les tuiles d'une même ligne se partagent
  le reste, donc une ligne se remplit toujours jusqu'au bord. Une grille à
  colonnes fixes aurait laissé des trous.
- **Une tuile seule sur sa ligne ne s'étale pas sans fin** (plafond à 1,7 fois sa
  base) : deux portraits dans 750 px seraient deux visages perdus. Passé cette
  borne la ligne ne se remplit plus et les tuiles se centrent.
- **Les trois référents de pôle forment un RANG à eux**, parce qu'ils encadrent
  les catégories qui suivent et qu'une équipe assise à côté d'eux brouillerait la
  lecture. C'est un conteneur, pas un saut de ligne : un élément de pleine largeur
  et de hauteur nulle finit bien la ligne, mais fabrique deux écarts au lieu d'un,
  et sa marge négative ne les rattrape pas — elle déplace l'élément, pas la ligne.
- **Sur téléphone, une tuile par ligne** : sept colonnes de portraits ne tiennent
  pas sur 375 px, et les trois pôles s'y empilent comme le reste.

*Mesuré à 800 px comme à 1210 : chaque groupe tient sur un seul rang dans sa
tuile, sur les trois vues, sans débordement horizontal ni titre tronqué.*

## Réalisation

`js/organigramme-fch-data.js` contient les données ; `js/organigramme-fch.js`
construit l’organigramme, les fiches et la recherche. Les photos sont des fenêtres
SVG sur les exports originaux copiés dans `img/organigramme/portraits` : aucune
génération ni retouche de visage. Les actifs sont listés dans la coquille du
service worker (1,6 Mo pour les quarante-quatre).

**Le cadre est CARRÉ et le portrait rond** : l'export du club est une pastille
ronde, qu'un cadre ovale aurait étirée. Il part du sommet de la tête — qui
déborde de la pastille, c'est le dessin du club — et s'arrête avant la bande du
nom, que la carte écrit déjà dessous. Il est élargi de 7 % sur les quatre bords :
tangent au sommet du crâne, le cercle rognait les cheveux sur les côtés. Ce qui
dépasse de l'image est transparent et laisse voir la carte.

Vérification reproductible : `node tools/verifier-organigramme-fch.js`.
Elle contrôle les personnes, appartenances, responsables, cadrages, portraits,
cache et rendu de chaque fiche. Vérifications navigateur : bureau, sportif,
recherche par mission, fiches Benoit et Lina, fiche unique Emma, mobile à 375 px
sans débordement horizontal.
