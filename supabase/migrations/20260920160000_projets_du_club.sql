-- LES PROJETS DU CLUB S'OUVRENT (20 septembre 2026, demande de Noé : « les
-- pages des projets des commissions doivent ressembler aux pages de mes
-- projets, donc avec des jalons, un calendrier sur lequel on peut poser des
-- choses »).
--
-- CE QU'ILS ÉTAIENT : des données DÉCLARÉES, lues dans le projet associatif du
-- club (js/projet-fch.js) — un titre, un horizon, des pôles, parfois une note.
-- Vingt-huit en tout, dont dix-huit rattachés à un objectif. Leur page le disait
-- elle-même : « Responsable, étapes et dates de réalisation restent à préciser ».
-- Rien ne s'y posait, parce qu'il n'y avait aucune ligne où l'écrire.
--
-- UNE TABLE À PART, ET C'EST UNE DÉCISION DE NOÉ, prise entre trois options :
-- *« une table à part pour le club, ça ne s'affichera pas dans mon calendrier,
-- seulement dans le calendrier de la page du projet ».*
--
--   Ce que ça écarte, et pourquoi c'est juste : rangés dans `projets`, les
--   vingt-huit auraient rejoint ses sept projets d'alternance — donc « Mes
--   projets », le rail de son accueil, « Mon temps » et le calcul de sa charge.
--   **Ce sont les projets du CLUB, pas les siens.** Un marqueur dans la même
--   table aurait marché, au prix d'un filtre à ne jamais oublier sur chaque
--   écran qui liste des projets ; deux tables ne s'oublient pas.
--
--   Ce que ça coûte, et il faut le dire : `taches.projet_id` et
--   `evenements.projet_id` pointent vers `projets`. Une tâche du hub ne peut
--   donc PAS se rattacher à un projet du club. C'est exactement ce que Noé
--   demande — son calendrier reste le sien —, et ce que la page du projet pose
--   sur son calendrier, ce sont ses ÉTAPES.
--
-- ON N'EN CRÉE AUCUN D'AVANCE (même décision : « un par un, à la demande »). La
-- table naît vide ; une ligne apparaît le jour où Noé ouvre vraiment ce
-- projet-là. Vingt-huit lignes créées pour rien seraient vingt-huit pages vides
-- à faire défiler, et le projet associatif reste la source des titres.

-- `cle` EST LE PROJET DÉCLARÉ, et c'est ce qui relie la ligne au document : le
-- titre du projet associatif, normalisé par `cleDuProjet` (js/projet-club.js).
-- UNIQUE, donc un projet du club ne peut pas être ouvert deux fois — c'est ce
-- qui rend le geste « ouvrir » rejouable sans y penser.
--
-- LE TITRE EST RECOPIÉ, et ce n'est pas un doublon de la donnée déclarée : c'est
-- ce qui permet de RENOMMER un projet ici sans toucher au document du club, et
-- de garder la page lisible le jour où le projet associatif sera réécrit.
create table if not exists public.projets_club (
  id         uuid primary key default gen_random_uuid(),
  cle        text not null unique,
  titre      text not null,
  -- L'objectif du club qu'il sert, tel que le document le nomme. Du TEXTE et
  -- non une référence : les objectifs du club sont déclarés dans le dépôt, pas
  -- en base, et une clé étrangère vers rien n'est pas une clé.
  objectif   text,
  statut     text not null default 'actif'
               check (statut in ('idee', 'actif', 'annuel', 'en_pause', 'termine', 'abandonne')),
  echeance   date,
  resultat   text,
  notes      text,
  created_at timestamptz not null default now()
);

comment on table public.projets_club is
  'Les projets du CLUB, ouverts un par un depuis le projet associatif (20 septembre 2026). Séparés de `projets`, qui sont ceux de Noé : son calendrier ne doit pas les porter.';
comment on column public.projets_club.cle is
  'Le projet déclaré dont cette ligne est l''ouverture. UNIQUE : ouvrir deux fois le même est sans effet.';

-- LES MÊMES COLONNES QUE `projets_etapes`, volontairement : c'est le même motif,
-- et la page du club reprend le geste du hub — franchir, ordonner, poser sur un
-- jour. Deux découpages qui ne se ressembleraient pas seraient deux gestes à
-- réapprendre.
create table if not exists public.projets_club_etapes (
  id           uuid primary key default gen_random_uuid(),
  projet_id    uuid not null references public.projets_club(id) on delete cascade,
  titre        text not null,
  ordre        int,
  echeance     date,
  atteint      boolean not null default false,
  date_atteint date,
  created_at   timestamptz not null default now()
);

create index if not exists projets_club_etapes_projet_idx on public.projets_club_etapes(projet_id);

comment on table public.projets_club_etapes is
  'Le découpage d''un projet du club. `echeance` est facultative : un découpage sans jour est un découpage, pas un retard.';

alter table public.projets_club enable row level security;
alter table public.projets_club_etapes enable row level security;

create policy "projets_club_select_authenticated" on public.projets_club
  for select to authenticated using (true);
create policy "projets_club_insert_authenticated" on public.projets_club
  for insert to authenticated with check (true);
create policy "projets_club_update_authenticated" on public.projets_club
  for update to authenticated using (true) with check (true);
create policy "projets_club_delete_authenticated" on public.projets_club
  for delete to authenticated using (true);

create policy "projets_club_etapes_select_authenticated" on public.projets_club_etapes
  for select to authenticated using (true);
create policy "projets_club_etapes_insert_authenticated" on public.projets_club_etapes
  for insert to authenticated with check (true);
create policy "projets_club_etapes_update_authenticated" on public.projets_club_etapes
  for update to authenticated using (true) with check (true);
create policy "projets_club_etapes_delete_authenticated" on public.projets_club_etapes
  for delete to authenticated using (true);

grant select, insert, update, delete on public.projets_club to authenticated;
grant select, insert, update, delete on public.projets_club_etapes to authenticated;
