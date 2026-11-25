-- LES COLLECTIONS INTELLIGENTES (25 novembre 2026, demande de Noé) : un filtre de
-- la photothèque gardé sous un nom. Elle ne contient aucune photo — sa règle les
-- retrouve à chaque fois.
create table if not exists collections_photos (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (length(trim(nom)) between 1 and 60),
  regle jsonb not null,
  created_at timestamptz not null default now()
);
alter table collections_photos enable row level security;
drop policy if exists "collections de photos authentifiees" on collections_photos;
create policy "collections de photos authentifiees" on collections_photos
  for all to authenticated using (true) with check (true);
grant select, insert, update, delete on collections_photos to authenticated;
