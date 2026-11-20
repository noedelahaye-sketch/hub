-- LES PHOTOS D'UNE PARUTION (20 novembre 2026, photothèque, étape 4).
--
-- C'est le but final de la photothèque, dans les mots de Noé : « il faut
-- pouvoir sélectionner des photos pour un post parmi toutes celles du site ».
-- Une table de liens et non un tableau sur la publication : c'est elle qui
-- compte combien de fois une photo est PARTIE — une photo vaut « publiée N
-- fois » quand N parutions qui la portent sont à l'état `publie`. Le compteur
-- ne se stocke pas, il se déduit : il ne peut pas mentir sur ce qui est parti.
--
-- `ordre` : l'ordre du post, qui compte pour un carrousel (la slide 1 n'est pas
-- la slide 7).
create table if not exists publications_photos (
  publication_id uuid not null references publications(id) on delete cascade,
  photo_id uuid not null references photos(id) on delete cascade,
  ordre int not null default 0,
  primary key (publication_id, photo_id)
);
create index if not exists publications_photos_photo on publications_photos (photo_id);

alter table publications_photos enable row level security;
drop policy if exists "photos de parution authentifiees" on publications_photos;
create policy "photos de parution authentifiees" on publications_photos
  for all to authenticated using (true) with check (true);
grant select, insert, update, delete on publications_photos to authenticated;
