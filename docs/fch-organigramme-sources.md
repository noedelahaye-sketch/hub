# Qui fait quoi — sources et organisation

## Lecture proposée

- **Bureau et référents** : coprésidence, administration, responsables des commissions.
- **Commissions** : regroupement par besoin, avec rôle lisible sous chaque portrait.
- **Équipes sportives** : responsables des pôles puis équipes de la saison 2026–2027.
- **Recherche transversale** : nom, catégorie, rôle ou mot des missions ; résultats uniques par personne.
- **Une fiche par personne**, à `#hermitage/commissions/<id>` : toutes ses missions et ses rôles sportifs, avec liens vers ses collègues.

45 personnes, 23 groupes dans les données. Une même personne peut apparaître
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
| `Parrainage/Kepo.png` | Portrait de Kepo, partie gauche du fichier ; missions issues du PDF |

Les anciens organigrammes 2025–2026 ont été consultés puis écartés lorsque les
exports 2026–2027 du bureau et des commissions ont été retrouvés.

## Résolutions et limites

- Noé a confirmé le 16 septembre 2026 qu’**Emma = Emma Liconnet**. Sa fiche réunit Partenaires, Manifestations et U15.
- **Lina Amine** : photo retrouvée dans `Les commissions.jpg`, version 2026–2027.
- Le PDF ajoute des contributions qui n’apparaissent pas toutes dans l’affiche des commissions (Sandy aux infrastructures, Kepo aux manifestations). Elles sont conservées, avec les membres figurant sur les affiches (Florian, Thibaut).
- Pour les éducateurs, Florian et Thibaut, aucune liste de missions individuelles n’est inventée : la fiche expose le rôle documenté et précise l’absence de détail individuel dans le PDF.
- Les responsables de catégories sportives sont ceux entourés de rouge sur les affiches. Les couleurs des groupes ne constituent pas à elles seules le libellé du rôle.

## Réalisation

`js/organigramme-fch-data.js` contient les données ; `js/organigramme-fch.js`
construit l’organigramme, les fiches et la recherche. Les photos sont des fenêtres
SVG sur les exports originaux copiés dans `img/organigramme` : aucune génération
ni retouche de visage. Les actifs sont listés dans la coquille du service worker.

Vérification reproductible : `node tools/verifier-organigramme-fch.js`.
Elle contrôle les personnes, appartenances, responsables, cadrages, portraits,
cache et rendu de chaque fiche. Vérifications navigateur : bureau, sportif,
recherche par mission, fiches Benoit et Lina, fiche unique Emma, mobile à 375 px
sans débordement horizontal.
