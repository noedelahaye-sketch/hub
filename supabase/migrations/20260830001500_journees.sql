-- LA PAGE DU JOUR (29 août 2026, demande de Noé) : « un outil qui me permet de
-- faire un bilan quotidien, avec une page par jour qui est construite et sur
-- laquelle on peut revenir, où l'on voit l'humeur du jour, les habitudes
-- faites, les tâches, événements... »
--
-- ELLE SE CONSTRUIT TOUTE SEULE, et c'est le point : le hub connaît déjà
-- l'humeur, les tâches terminées avec leur date, les événements, les victoires,
-- et depuis aujourd'hui les habitudes et les pages lues. Rien de tout cela n'est
-- à ressaisir — la page les rassemble, elle ne les redemande pas.
--
-- Une seule chose s'y écrit, d'où cette table : la ligne libre. « Ce qui a
-- compté aujourd'hui » est la seule question à laquelle le hub ne peut pas
-- répondre à la place de Noé.
--
-- Pas de colonne `espace` : c'est SA journée, tous espaces confondus — le pro
-- et le perso au même rang, comme « Le chemin ».

create table if not exists public.journees (
  jour       date primary key,
  mot        text,
  created_at timestamptz not null default now()
);

comment on table public.journees is
  'La ligne libre d''une journée. Tout le reste de la page du jour se déduit des autres tables : rien n''y est recopié.';

alter table public.journees enable row level security;

create policy "journees_select_authenticated" on public.journees for select to authenticated using (true);
create policy "journees_insert_authenticated" on public.journees for insert to authenticated with check (true);
create policy "journees_update_authenticated" on public.journees for update to authenticated using (true) with check (true);
create policy "journees_delete_authenticated" on public.journees for delete to authenticated using (true);

grant select, insert, update, delete on public.journees to authenticated;
