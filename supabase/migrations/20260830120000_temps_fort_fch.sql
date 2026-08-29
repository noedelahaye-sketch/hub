-- LES TEMPS FORTS DU CLUB (30 août 2026).
--
-- POURQUOI UNE COLONNE ET PAS UNE DÉDUCTION. Le club tient huit à neuf temps
-- forts par saison — concours de pétanque, Tournoi Rose, goûter de Noël,
-- loto, tournois futsal, matinée saucisses, journée du club. Ils portent
-- l'essentiel de la communication événementielle de Noé, et l'accueil du site
-- doit les voir arriver.
--
-- RIEN EN BASE NE PERMETTAIT DE LES RECONNAÎTRE, et c'est mesuré : au
-- 30 août, les sept événements FCH à venir — trois entraînements, une séance
-- photo et trois temps forts — étaient rigoureusement indistinguables. Aucun
-- n'est en série, aucun ne porte `avec_photos`, la présence d'un créneau ne
-- dit rien. Ne restait que le titre, et deviner sur un titre libre est
-- exactement ce que le hub refuse de faire.
--
-- C'est donc une DÉCLARATION, comme `reunion_objet` dit qu'un événement est
-- une réunion et `avec_photos` qu'il produit des photos à trier : le hub ne
-- peut pas deviner qu'un rassemblement est un temps fort, un entraînement
-- n'est pas un tournoi.
--
-- AU FCH SEULEMENT. Yuno a ses sorties et son Carnet ; la formation et le
-- perso n'ont pas de temps forts à annoncer. La colonne vit sur `evenements`
-- comme ses deux voisines, et reste `false` partout ailleurs.

alter table evenements
  add column if not exists temps_fort boolean not null default false;

comment on column evenements.temps_fort is
  'FCH : ce rassemblement est un temps fort du club (tournoi, loto, journée…). Déclaré à la création, jamais déduit.';

-- Les trois temps forts de la saison déjà posés. Ils ne sont pas devinés : ils
-- viennent du calendrier officiel du club, « Nos Évènements 2026/2027 », qui
-- est aussi la source de leurs dates.
update evenements
   set temps_fort = true
 where espace = 'fch'
   and reunion_objet is null
   and titre in (
     'Tournoi de pétanque',
     'Tournoi Rose',
     'Goûter de Noël et présentation des équipes'
   );
