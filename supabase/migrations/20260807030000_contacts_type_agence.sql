-- Le carnet réseau accueille les agences
--
-- La suite du tableau Notion de Noé (7 août 2026) fait apparaître un type que
-- le CHECK ne prévoyait pas : les agences (JohaFilms, Akaw Sports). Elles ne
-- sont ni un média ni une marque — ce sont des intermédiaires.

alter table public.contacts
  drop constraint contacts_type_check;

alter table public.contacts
  add constraint contacts_type_check
    check (type in ('joueur', 'club', 'media', 'agence', 'marque', 'autre'));
