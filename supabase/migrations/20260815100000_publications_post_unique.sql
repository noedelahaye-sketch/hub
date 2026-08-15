-- « Post et carrousel, c'est la même chose pour moi » (Noé, 15 août 2026), et
-- c'est CARROUSEL qui reste.
--
-- Une image ou sept, c'est le même geste et la même préparation : le format
-- `post` n'est plus offert à l'écran, et les publications qui le portaient
-- deviennent des carrousels. La checklist carrousel, elle, vaut désormais pour
-- toutes les publications de ce format — c'est-à-dire pour presque toutes.
--
-- **Le CHECK n'est PAS resserré**, et c'est la règle de ce dépôt : un CHECK
-- s'élargit, il ne se resserre jamais. `post` reste donc une valeur acceptée
-- par la base — simplement plus personne ne l'écrit. Resserrer casserait toute
-- ligne oubliée, ici comme dans une sauvegarde restaurée.
--
-- Rejouable sans risque : passé le premier passage, elle ne trouve plus rien.

update public.publications set format = 'carrousel' where format = 'post';

comment on column public.publications.format is
  'carrousel (une image ou sept, c''est le même geste) · reel · story. « post » reste accepté pour les lignes d''avant le 15 août 2026, mais n''est plus proposé.';
