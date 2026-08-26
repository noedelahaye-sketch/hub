-- Les tâches se répètent, comme les événements (demande de Noé, 26 août 2026).
--
-- Mêmes colonnes et mêmes valeurs que `evenements` : une seule façon de dire
-- « chaque semaine » dans tout le hub, et le calendrier déplie les deux avec le
-- même code.
--
-- CE QUI CHANGE POUR UNE TÂCHE, et qui n'a pas d'équivalent chez l'événement :
-- une tâche porte un `statut`, un seul. La cocher la marquerait « fait » pour
-- toute la série — « Courir » serait fait à jamais après une seule course.
-- Une tâche récurrente ne se termine donc PAS : la cocher fait glisser son
-- échéance à l'occurrence suivante, et écrit sa victoire au passage. Elle
-- revient d'elle-même, et le hub ne compte jamais les fois manquées — c'est la
-- même règle que partout ailleurs : on montre ce qui est fait, pas ce qui
-- manque (voir `terminerTache`, js/api.js).

alter table taches
  add column if not exists recurrence text
    check (recurrence in ('hebdo', 'quinzaine', 'mensuel')),
  add column if not exists recurrence_fin date;

comment on column public.taches.recurrence is
  'Répétition : hebdo, quinzaine ou mensuel. Nul = tâche unique.';
comment on column public.taches.recurrence_fin is
  'Dernier jour où la répétition vaut. Nul = sans fin déclarée.';
