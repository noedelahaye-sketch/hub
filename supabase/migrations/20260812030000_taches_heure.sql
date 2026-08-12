-- Une tâche peut porter une heure.
--
-- Jusqu'ici `taches.echeance` ne disait que le jour. Une tâche posée au
-- calendrier tombait donc forcément dans le bandeau du haut, avec ce qui n'a
-- pas d'heure — alors qu'une bonne part du travail de Noé se cale à un moment
-- précis (« trier les photos du match à 18 h »).
--
-- La colonne est nullable, et c'est le point : une tâche SANS heure reste
-- normale. Le bandeau du jour entier garde son sens, et rien de ce qui existe
-- n'est modifié.
--
-- Pas de colonne « durée » : une tâche n'occupe pas une tranche, elle arrive à
-- un moment. La grille lui donne une hauteur minimale, comme un rappel.

alter table public.taches
  add column if not exists heure time;

comment on column public.taches.heure is
  'Heure de la tâche, si elle en a une. NULL = elle tient la journée.';
