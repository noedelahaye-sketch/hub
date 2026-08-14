-- Un photographe n'est ni un média ni une agence (demande de Noé, 14 août 2026).
--
-- Ce sont les confrères croisés au bord du terrain — la moitié des rencontres
-- d'un match. Les ranger en « autre » revenait à ne pas les ranger.
-- `agence` et `autre` existaient déjà (migration du 7 août) : seul le
-- photographe manquait. Le CHECK s'élargit, il ne se resserre jamais.

alter table public.contacts drop constraint contacts_type_check;
alter table public.contacts add constraint contacts_type_check
  check (type in ('joueur', 'photographe', 'club', 'media', 'agence', 'marque', 'autre'));

comment on column public.contacts.type is
  'Qui c''est : joueur · photographe (les confrères du bord terrain) · club · média · agence · marque · autre.';
