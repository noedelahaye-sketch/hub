-- LA PHOTOTHÈQUE, ÉTAPE 2 : LE TRI (20 novembre 2026).
--
-- Trois façons de trier, chacune à sa place :
--   — la NOTE, de 1 à 5 étoiles, sur la photo elle-même : une seule valeur ;
--   — les ÉTIQUETTES, rangées en familles (le style, ce que ça raconte), que
--     Noé ajoute depuis le site : une table de mots et une table de liens ;
--   — QUI EST DESSUS, relié aux fiches du réseau (décision de Noé) : la fiche
--     d'un joueur pourra montrer toutes ses photos.
-- Le format, lui, se déduit déjà des dimensions (colonne `photos.format`).

alter table photos add column if not exists note smallint
  check (note between 1 and 5);

create table if not exists etiquettes (
  id uuid primary key default gen_random_uuid(),
  -- 'style' : comment la photo est faite. 'recit' : ce qu'elle raconte.
  famille text not null check (famille in ('style', 'recit')),
  nom text not null,
  ordre int not null default 0,
  created_at timestamptz default now()
);
-- Un même mot n'existe qu'une fois par famille, quelle que soit sa casse.
create unique index if not exists etiquettes_uniques on etiquettes (famille, lower(nom));

create table if not exists photos_etiquettes (
  photo_id uuid not null references photos(id) on delete cascade,
  etiquette_id uuid not null references etiquettes(id) on delete cascade,
  primary key (photo_id, etiquette_id)
);
create index if not exists photos_etiquettes_etiquette on photos_etiquettes (etiquette_id);

create table if not exists photos_personnes (
  photo_id uuid not null references photos(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  primary key (photo_id, contact_id)
);
create index if not exists photos_personnes_contact on photos_personnes (contact_id);

alter table etiquettes enable row level security;
alter table photos_etiquettes enable row level security;
alter table photos_personnes enable row level security;

drop policy if exists "etiquettes authentifiees" on etiquettes;
create policy "etiquettes authentifiees" on etiquettes
  for all to authenticated using (true) with check (true);
drop policy if exists "etiquettes de photo authentifiees" on photos_etiquettes;
create policy "etiquettes de photo authentifiees" on photos_etiquettes
  for all to authenticated using (true) with check (true);
drop policy if exists "personnes de photo authentifiees" on photos_personnes;
create policy "personnes de photo authentifiees" on photos_personnes
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on etiquettes to authenticated;
grant select, insert, update, delete on photos_etiquettes to authenticated;
grant select, insert, update, delete on photos_personnes to authenticated;

-- LES ÉTIQUETTES DE DÉPART, proposées à Noé et gardées telles quelles. Elles
-- se complètent depuis le site.
insert into etiquettes (famille, nom, ordre) values
  ('style', 'Noir et blanc', 1),
  ('style', 'Couleur', 2),
  ('style', 'Contre-jour', 3),
  ('style', 'Flou de mouvement', 4),
  ('style', 'Gros plan', 5),
  ('style', 'Plan large', 6),
  ('recit', 'Action', 1),
  ('recit', 'Duel', 2),
  ('recit', 'But', 3),
  ('recit', 'Célébration', 4),
  ('recit', 'Émotion', 5),
  ('recit', 'Portrait', 6),
  ('recit', 'Ambiance et tribunes', 7),
  ('recit', 'Coulisses', 8),
  ('recit', 'Avant-match', 9)
on conflict do nothing;
