-- « Pas aujourd'hui » est une DONNÉE, pas un échec.
--
-- Puisque l'humeur n'est qu'observée (choix de Noé), le refus est le seul
-- signal qu'il reste au hub sur l'état du jour. Trois refus dans la semaine sur
-- le même espace en disent plus long qu'un chiffre d'humeur — et le hub cesse
-- de proposer ce qu'on vient d'écarter.
--
-- Une DATE, pas un compteur : le refus vaut pour la journée. Demain, la
-- proposition peut revenir, et elle le doit — refuser une fois n'est pas
-- renoncer.

alter table public.taches  add column if not exists refusee_le date;
alter table public.projets add column if not exists refusee_le date;

comment on column public.taches.refusee_le is
  'Le jour où la tâche a été écartée d''une proposition du matin. Elle ne revient pas ce jour-là, et revient le lendemain.';
comment on column public.projets.refusee_le is
  'Même règle que pour une tâche : un projet écarté ne revient pas ce jour-là.';
