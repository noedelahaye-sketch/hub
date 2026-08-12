-- Les événements qui reviennent
--
-- Une saison de football, ce sont des entraînements hebdomadaires et des matchs
-- réguliers. Les saisir un par un est le genre de friction qui fait abandonner
-- un outil.
--
-- Le modèle est volontairement pauvre : un pas et une date de fin, pas de règle
-- RRULE complète. Les occurrences ne sont PAS stockées — elles se déduisent à
-- la lecture. Une ligne en base, autant d'occurrences que le calendrier en
-- affiche. Conséquence assumée : on ne peut pas encore décaler une seule
-- occurrence sans décaler la série. Le jour où ce besoin se présente, il
-- faudra une table d'exceptions.

alter table public.evenements
  add column recurrence text
    check (recurrence in ('hebdo', 'quinzaine', 'mensuel')),
  add column recurrence_fin date;

comment on column public.evenements.recurrence is
  'Le pas de répétition. NULL = un événement unique.';
comment on column public.evenements.recurrence_fin is
  'Dernier jour où la répétition vaut. NULL = sans fin déclarée.';
