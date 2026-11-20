-- LA PILE « À TRIER » ET LE NOIR ET BLANC RECONNU (21 novembre 2026, demande
-- de Noé : « une pile de photos à trier pour être à jour dans le tri », et
-- « reconnaître à l'import une photo en noir et blanc pour la catégoriser
-- directement »).
--
-- `triee` : la photo est passée par la pile — on l'a regardée et dit « c'est
-- bon ». Une DÉCLARATION, pas une déduction : une photo sans note ni étiquette
-- peut très bien être triée (rien à en dire), et c'est ce geste qui la sort de
-- la pile.
alter table photos add column if not exists triee boolean not null default false;

-- `couleurs_lues` : le hub a regardé ses couleurs pour savoir si elle est en
-- noir et blanc. Les photos importées avant le 21 novembre ne l'ont pas été —
-- elles se rattrapent une fois, en arrière-plan, puis plus jamais.
alter table photos add column if not exists couleurs_lues boolean not null default false;

-- Ce que Noé a déjà trié à la main avant la pile ne lui est pas redemandé.
update photos p set triee = true
where p.note is not null
   or exists (select 1 from photos_etiquettes e where e.photo_id = p.id)
   or exists (select 1 from photos_personnes x where x.photo_id = p.id);
