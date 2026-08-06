-- Hub — Row Level Security
--
-- Le hub a un seul utilisateur (Noé). Toutes les opérations sont réservées au
-- rôle `authenticated` : RLS activée sans aucune politique pour `anon` suffit à
-- rendre les 6 tables invisibles aux visiteurs non connectés, y compris avec la
-- clé publique du projet.
--
-- La création du compte et la désactivation des inscriptions publiques se font
-- côté Auth (dashboard Supabase), pas en SQL — voir supabase/AUTH.md.

alter table public.objectifs  enable row level security;
alter table public.jalons     enable row level security;
alter table public.taches     enable row level security;
alter table public.evenements enable row level security;
alter table public.victoires  enable row level security;
alter table public.humeur     enable row level security;

-- objectifs
create policy "objectifs_select_authenticated" on public.objectifs
  for select to authenticated using (true);
create policy "objectifs_insert_authenticated" on public.objectifs
  for insert to authenticated with check (true);
create policy "objectifs_update_authenticated" on public.objectifs
  for update to authenticated using (true) with check (true);
create policy "objectifs_delete_authenticated" on public.objectifs
  for delete to authenticated using (true);

-- jalons
create policy "jalons_select_authenticated" on public.jalons
  for select to authenticated using (true);
create policy "jalons_insert_authenticated" on public.jalons
  for insert to authenticated with check (true);
create policy "jalons_update_authenticated" on public.jalons
  for update to authenticated using (true) with check (true);
create policy "jalons_delete_authenticated" on public.jalons
  for delete to authenticated using (true);

-- taches
create policy "taches_select_authenticated" on public.taches
  for select to authenticated using (true);
create policy "taches_insert_authenticated" on public.taches
  for insert to authenticated with check (true);
create policy "taches_update_authenticated" on public.taches
  for update to authenticated using (true) with check (true);
create policy "taches_delete_authenticated" on public.taches
  for delete to authenticated using (true);

-- evenements
create policy "evenements_select_authenticated" on public.evenements
  for select to authenticated using (true);
create policy "evenements_insert_authenticated" on public.evenements
  for insert to authenticated with check (true);
create policy "evenements_update_authenticated" on public.evenements
  for update to authenticated using (true) with check (true);
create policy "evenements_delete_authenticated" on public.evenements
  for delete to authenticated using (true);

-- victoires
create policy "victoires_select_authenticated" on public.victoires
  for select to authenticated using (true);
create policy "victoires_insert_authenticated" on public.victoires
  for insert to authenticated with check (true);
create policy "victoires_update_authenticated" on public.victoires
  for update to authenticated using (true) with check (true);
create policy "victoires_delete_authenticated" on public.victoires
  for delete to authenticated using (true);

-- humeur
create policy "humeur_select_authenticated" on public.humeur
  for select to authenticated using (true);
create policy "humeur_insert_authenticated" on public.humeur
  for insert to authenticated with check (true);
create policy "humeur_update_authenticated" on public.humeur
  for update to authenticated using (true) with check (true);
create policy "humeur_delete_authenticated" on public.humeur
  for delete to authenticated using (true);
