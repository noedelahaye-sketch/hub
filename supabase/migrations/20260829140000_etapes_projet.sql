-- L'AVANCÉE D'UN PROJET NE SE DÉDUIT PLUS DES TÂCHES (29 août 2026, Noé).
--
-- Sa phrase : « l'avancée des projets ne doit pas être complètement liée aux
-- tâches, ce n'est pas ça qui dit que c'est fini ou non car des tâches
-- s'ajoutent petit à petit. »
--
-- Ce que la mesure a confirmé sur ses données, le jour même :
--
--   « Deuxième dossier »           3 tâches sur 3 faites → barre PLEINE,
--                                  alors que le projet est actif et annonce
--                                  25 h de travail. Il commence à peine.
--   « Album du club »              1 sur 14 → 7 %. Il a RECULÉ à chaque tâche
--                                  écrite : le dénominateur punissait le geste
--                                  même que le hub veut encourager.
--
-- Le défaut est structurel, pas de réglage : un dénominateur qui grandit à
-- l'usage ne mesure rien. D'où une CASCADE, dans cet ordre (choix de Noé) :
--
--   1. les ÉTAPES déclarées   — des marches, comme les jalons d'un cap
--   2. sinon la CHARGE        — minutes faites / charge annoncée
--   3. sinon rien             — le trait pointillé, et le mouvement à côté
--
-- Les deux premières ont le même mérite : leur dénominateur est écrit UNE FOIS,
-- à la création. Ajouter dix tâches ne le bouge plus.

-- Les mêmes colonnes que `jalons`, volontairement : c'est le même motif un
-- étage plus bas. Un jalon découpe un objectif, une étape découpe un projet.
create table if not exists public.projets_etapes (
  id           uuid primary key default gen_random_uuid(),
  projet_id    uuid not null references public.projets(id) on delete cascade,
  titre        text not null,
  ordre        int,
  atteint      boolean not null default false,
  date_atteint date,
  created_at   timestamptz not null default now()
);

create index if not exists projets_etapes_projet_idx on public.projets_etapes(projet_id);

comment on table public.projets_etapes is
  'Les étapes d''un projet : le découpage QU''ON DÉCLARE, et qui ne bouge pas quand on ajoute une tâche. C''est la mesure prioritaire de l''avancée d''un projet (29 août 2026).';
comment on column public.projets_etapes.ordre is
  'Position dans la séquence, comme jalons.ordre. Une étape se franchit dans l''ordre où on l''a posée.';

-- Franchir une étape écrit une victoire, comme un jalon atteint et une tâche
-- terminée. Un CHECK s'élargit, il ne se resserre jamais.
alter table public.victoires drop constraint if exists victoires_source_check;
alter table public.victoires add constraint victoires_source_check
  check (source in ('tache', 'jalon', 'objectif', 'manuel', 'moment', 'etape'));

alter table public.projets_etapes enable row level security;

create policy "projets_etapes_select_authenticated" on public.projets_etapes
  for select to authenticated using (true);
create policy "projets_etapes_insert_authenticated" on public.projets_etapes
  for insert to authenticated with check (true);
create policy "projets_etapes_update_authenticated" on public.projets_etapes
  for update to authenticated using (true) with check (true);
create policy "projets_etapes_delete_authenticated" on public.projets_etapes
  for delete to authenticated using (true);

grant select, insert, update, delete on public.projets_etapes to authenticated;
