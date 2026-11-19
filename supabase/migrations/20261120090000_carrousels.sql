-- LE CARROUSEL D'APRÈS-MATCH, GARDÉ D'UN APPAREIL À L'AUTRE (20 novembre 2026,
-- demande de Noé : « j'ai besoin que ce soit gardé d'un appareil à un autre, au
-- moins jusqu'à ce que les photos soient téléchargées, pour pouvoir faire la
-- sélection sur ordi et télécharger sur téléphone »).
--
-- LES FICHIERS NE SONT PAS ICI : ils vivent chez Cloudflare R2, sur le compte à
-- part des photos du hub (cloudflare/photos). Cette base garde ce qui se
-- CLASSE — quels fichiers composent quel carrousel, et dans quel ordre.

create table if not exists carrousels (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  -- Un carrousel PEUT servir un match, sans y être obligé (Noé : « l'outil doit
  -- être disponible au cas où j'ai besoin pour une autre utilisation »).
  -- `set null` : supprimer la sortie ne jette pas le carrousel.
  evenement_id uuid references evenements(id) on delete set null,
  -- L'ORDRE DU POST, une liste d'identifiants de `carrousels_medias`. Un
  -- tableau et non une colonne `ordre` sur chaque média : l'ordre change à
  -- chaque geste — échanger deux photos réécrirait deux lignes, glisser la
  -- vingtième en tête en réécrirait vingt. Ici, c'est une seule écriture.
  selection uuid[] not null default '{}',
  created_at timestamptz default now(),
  modifie_le timestamptz default now()
);

create table if not exists carrousels_medias (
  -- L'identifiant est choisi PAR LE NAVIGATEUR au moment de l'import : la
  -- photo entre dans la sélection avant même d'avoir fini de partir, et son
  -- identifiant ne doit pas changer en route.
  id uuid primary key,
  carrousel_id uuid not null references carrousels(id) on delete cascade,
  -- La clé du fichier dans R2 (`originaux/2026/11/…`). Sa vignette se range à
  -- côté, sous `vignettes/…jpg` : le Worker la déduit, elle n'est pas stockée.
  cle text not null,
  nom text not null,
  genre text not null check (genre in ('photo', 'video')),
  type text,
  taille bigint,
  created_at timestamptz default now()
);

create index if not exists carrousels_medias_carrousel
  on carrousels_medias (carrousel_id);

alter table carrousels enable row level security;
alter table carrousels_medias enable row level security;

drop policy if exists "carrousels authentifies" on carrousels;
create policy "carrousels authentifies" on carrousels
  for all to authenticated using (true) with check (true);

drop policy if exists "medias de carrousel authentifies" on carrousels_medias;
create policy "medias de carrousel authentifies" on carrousels_medias
  for all to authenticated using (true) with check (true);

-- RLS filtre des lignes, le GRANT ouvre la table : sans lui, « permission
-- denied » avant même la politique.
grant select, insert, update, delete on carrousels to authenticated;
grant select, insert, update, delete on carrousels_medias to authenticated;
