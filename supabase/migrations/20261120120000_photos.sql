-- LA PHOTOTHÈQUE DE YUNO (20 novembre 2026, demande de Noé : « la réserve de
-- photos doit être le réservoir principal — généralement toutes les photos d'un
-- match y seront importées, et ces photos pourront être utilisées pour mon
-- carrousel et la photo à garder dans le journal »).
--
-- ÉTAPE 1 : la réserve et l'import. Les étiquettes, la note et le compteur de
-- publications viendront avec les étapes suivantes, chacune par sa migration.
--
-- LES FICHIERS NE SONT PAS ICI : ils vivent chez Cloudflare R2, comme ceux du
-- carrousel (cloudflare/photos). Ce qu'on y range est une version ALLÉGÉE —
-- 2 160 px au plus grand côté, assez pour Instagram, qui ramène tout à 1 080.
-- L'original reste sur le disque de Noé.

create table if not exists photos (
  -- Choisi par le navigateur à l'import, comme un média de carrousel : la
  -- photo s'affiche avant d'avoir fini de partir.
  id uuid primary key,
  -- La clé du fichier dans R2. Sa vignette (480 px) se range à côté, sous
  -- `vignettes/…jpg` : le Worker la déduit.
  cle text not null unique,
  nom text not null,
  -- Le match dont elle vient. `set null` : supprimer une sortie ne jette pas
  -- ses photos, elles rejoignent « sans match ».
  evenement_id uuid references evenements(id) on delete set null,
  -- LA DATE DE PRISE DE VUE, lue dans le fichier (EXIF) à l'import. C'est elle
  -- qui permet « mon mois d'octobre » : la date du fichier ne le dit pas, un
  -- export Lightroom les date toutes de la même minute.
  prise_le timestamptz,
  largeur int,
  hauteur int,
  -- LE FORMAT SE DÉDUIT, il ne se saisit pas : une colonne calculée ne peut pas
  -- mentir sur la photo qu'elle décrit. 3 % de tolérance pour le carré.
  format text generated always as (
    case
      when largeur is null or hauteur is null then null
      when abs(largeur - hauteur) <= greatest(largeur, hauteur) * 0.03 then 'carree'
      when hauteur > largeur then 'verticale'
      else 'horizontale'
    end
  ) stored,
  taille bigint,
  created_at timestamptz default now()
);

create index if not exists photos_evenement on photos (evenement_id);
create index if not exists photos_prise_le on photos (prise_le);

alter table photos enable row level security;

drop policy if exists "photos authentifiees" on photos;
create policy "photos authentifiees" on photos
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on photos to authenticated;
