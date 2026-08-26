-- Une tâche peut dire combien de temps elle prend (demande de Noé,
-- 26 août 2026).
--
-- En MINUTES, et non par une date de fin comme l'événement : on pense « ça me
-- prend une heure », pas « de 15 h à 16 h ». C'est déjà ainsi que la tuile
-- demandait sa durée à un événement (`DUREES`, js/format.js) — la colonne
-- garde simplement la forme de la question.
--
-- Facultative, et elle ne vaut qu'avec une heure : sans heure, une tâche
-- arrive dans la journée sans occuper de créneau, et une durée n'aurait rien
-- à mesurer. Ce qu'elle change à l'écran : en vue semaine, la barre de la
-- tâche prend la hauteur de sa durée, comme celle d'un événement — deux
-- heures de dossier se voient deux fois plus grandes qu'un coup de fil.

alter table public.taches
  add column if not exists duree int
    check (duree is null or duree between 5 and 1440);

comment on column public.taches.duree is
  'Combien de temps la tâche prend, en minutes. Nul = pas de durée déclarée. '
  'Ne vaut qu''avec une heure.';
