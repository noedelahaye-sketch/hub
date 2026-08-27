-- La trace du rendez-vous du dimanche. Sans elle, il reviendrait à chaque
-- ouverture — et un rituel qui redemande ce qu'on vient de lui donner cesse
-- très vite d'être un rituel.
--
-- Une ligne par semaine, identifiée par son LUNDI. La semaine du hub va du
-- lundi au dimanche : le lundi est le jour de la routine des clubs et le
-- premier jour d'alternance ; le dimanche soir est celui où l'on regarde la
-- suivante.

create table if not exists public.semaines (
  debut      date primary key,
  validee_le timestamptz not null default now(),
  notes      text
);

comment on table public.semaines is
  'Les semaines dont le rendez-vous du dimanche a été validé. La clé est le lundi de la semaine concernée.';

alter table public.semaines enable row level security;

create policy "semaines_select_authenticated" on public.semaines
  for select to authenticated using (true);
create policy "semaines_insert_authenticated" on public.semaines
  for insert to authenticated with check (true);
create policy "semaines_update_authenticated" on public.semaines
  for update to authenticated using (true) with check (true);
create policy "semaines_delete_authenticated" on public.semaines
  for delete to authenticated using (true);

grant select, insert, update, delete on public.semaines to authenticated;
