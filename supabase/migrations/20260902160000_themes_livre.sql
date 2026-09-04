-- LES THÈMES D'UN LIVRE (2 septembre 2026, demande de Noé : « filtrer selon la
-- note, l'état ou le type de livre », une capture de sa base Notion à l'appui).
--
-- UN TABLEAU ET NON UNE COLONNE TEXTE : un livre en porte plusieurs — « The good
-- life » est psycho ET relation humaine. Une colonne texte aurait obligé à
-- choisir, et on aurait choisi mal.
--
-- LA BASE N'IMPOSE RIEN : pas de CHECK, pas de table de référence. Un thème est
-- un mot qu'on se donne ; la liste offerte à la saisie vit dans js/perso.js
-- (THEMES_LIVRE) et s'allonge sans migration.
alter table public.livres add column if not exists themes text[] not null default '{}';

comment on column public.livres.themes is
  'Les thèmes d''un livre, plusieurs possibles. Vocabulaire libre : la liste offerte vit dans js/perso.js, la base n''impose rien.';

-- Un index GIN : c'est celui qui sert « themes @> {roman} ». Le filtre se fait
-- côté client aujourd'hui — la bibliothèque tient en mémoire —, mais l'index ne
-- coûte rien et sera là le jour où elle ne tiendra plus.
create index if not exists livres_themes_idx on public.livres using gin (themes);
