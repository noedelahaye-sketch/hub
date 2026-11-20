-- LE CARROUSEL PIOCHE DANS LA PHOTOTHÈQUE (20 novembre 2026, étape 4b).
--
-- Un média de carrousel peut désormais être une photo de la photothèque : il
-- en reprend le fichier (même clé R2), il n'en fait pas de copie. `photo_id`
-- dit à qui appartient le fichier :
--   — renseigné, le fichier est à la PHOTOTHÈQUE — supprimer le carrousel ne
--     doit jamais l'effacer ;
--   — vide, il est au carrousel seul, comme avant.
-- `on delete cascade` : retirer une photo de la photothèque efface son fichier,
-- le média qui la montrait n'a plus rien à montrer et part avec elle.
alter table carrousels_medias
  add column if not exists photo_id uuid references photos(id) on delete cascade;
create index if not exists carrousels_medias_photo on carrousels_medias (photo_id);
