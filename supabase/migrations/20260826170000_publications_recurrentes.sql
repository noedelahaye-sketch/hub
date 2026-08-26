-- Les publications se répètent, comme les tâches et les événements
-- (demande de Noé, 26 août 2026).
--
-- Mêmes colonnes, mêmes valeurs, même dépliage au calendrier
-- (`occurrencesEntre`, js/format.js) : il n'y a qu'une seule façon de dire
-- « chaque semaine » dans tout le hub, et c'est celle-là.
--
-- CE QUE ÇA CHANGE POUR UNE PUBLICATION, et qui la rapproche de la tâche plus
-- que de l'événement : elle porte un `statut`, un seul. Le passer à « publié »
-- marquerait toute la série pour toujours — « Le portrait du lundi » serait
-- publié à jamais après un seul lundi. Une publication récurrente ne se
-- termine donc PAS : la faire partir avance sa `date_prevue` d'une occurrence
-- et la ramène au PREMIER état de son cycle — à préparer chez le club, idée
-- chez Yuno. La rubrique suivante attend déjà sur son jour.
--
-- Passé `recurrence_fin`, la série s'arrête et la publication se termine pour
-- de bon. Rien ne compte les parutions manquées : c'est la règle du hub
-- partout ailleurs (voir `passageDePublication`, js/calendrier-commun.js).
--
-- Une répétition n'a de sens qu'avec une date : une idée sans jour reste dans
-- la banque, et l'écriture écarte la récurrence d'elle-même quand
-- `date_prevue` est nulle.

alter table public.publications
  add column if not exists recurrence text
    check (recurrence in ('hebdo', 'quinzaine', 'mensuel')),
  add column if not exists recurrence_fin date;

comment on column public.publications.recurrence is
  'Répétition : hebdo, quinzaine ou mensuel. Nul = une publication unique.';
comment on column public.publications.recurrence_fin is
  'Dernier jour où la répétition vaut. Nul = sans fin déclarée.';
