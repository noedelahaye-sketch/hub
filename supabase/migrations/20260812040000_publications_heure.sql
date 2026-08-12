-- Une publication peut porter une heure de parution.
--
-- Même raison que pour les tâches : `date_prevue` ne disait que le jour, donc
-- une publication programmée tombait forcément dans le bandeau du jour entier.
-- Or l'heure de parution est une décision éditoriale — on ne poste pas à 8 h
-- comme à 19 h.
--
-- Nullable, et c'est le point : une publication SANS heure reste normale. Rien
-- de ce qui existe n'est modifié.

alter table public.publications
  add column if not exists heure time;

comment on column public.publications.heure is
  'Heure de parution prévue. NULL = dans la journée, sans heure fixée.';
