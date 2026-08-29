-- LA BIBLIOTHÈQUE (29 août 2026, demande de Noé) : « un espace qui m'encourage
-- à lire — une bibliothèque où mes livres sont recensés, un bouton qui me
-- permet de rajouter rapidement un nombre de pages lues sur mon livre en cours,
-- pouvoir noter le livre... »
--
-- TROIS TABLES, et la deuxième est celle qui compte : sans le journal des
-- séances, on ne saurait dire ni le rythme (« 11 pages par jour ») ni ce qui a
-- été lu tel jour — or la page du jour en aura besoin, et l'habitude « lire un
-- peu » se coche à partir de là.
--
-- Pas d'objectif annuel, pas de quota de livres : « 24 livres cette année »
-- transforme la lecture en course et pousse à choisir des livres courts. Le hub
-- montre le rythme, jamais un reste à faire.

create table if not exists public.livres (
  id          uuid primary key default gen_random_uuid(),
  titre       text not null,
  auteur      text,
  pages       int check (pages is null or pages > 0),
  -- « reposé » et non « abandonné » : un livre qu'on lâche n'est pas un échec,
  -- et le mot compte. On peut le reprendre, ses pages sont gardées.
  statut      text not null default 'a_lire'
              check (statut in ('a_lire', 'en_cours', 'lu', 'repose')),
  note        int check (note is null or note between 1 and 5),
  commence_le date,
  fini_le     date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- LE JOURNAL DE LECTURE. Les pages lues d'un livre sont la SOMME de ses
-- séances, jamais une colonne à part : deux endroits pour un même nombre
-- finissent toujours par se contredire.
create table if not exists public.livres_seances (
  id         uuid primary key default gen_random_uuid(),
  livre_id   uuid not null references public.livres(id) on delete cascade,
  jour       date not null default current_date,
  pages      int not null check (pages <> 0),
  created_at timestamptz not null default now()
);

create index if not exists livres_seances_livre_idx on public.livres_seances(livre_id);
create index if not exists livres_seances_jour_idx  on public.livres_seances(jour);

-- CE QUI RESTE D'UN LIVRE six mois après, plus que la note : une phrase qu'on a
-- gardée. C'est l'ajout que Noé n'avait pas demandé et qui sert le plus sa
-- première phrase — « une page qui me permet de me recentrer ».
create table if not exists public.livres_citations (
  id         uuid primary key default gen_random_uuid(),
  livre_id   uuid not null references public.livres(id) on delete cascade,
  texte      text not null,
  page       int,
  created_at timestamptz not null default now()
);

create index if not exists livres_citations_livre_idx on public.livres_citations(livre_id);

-- L'HABITUDE QUE LA LECTURE COCHE TOUTE SEULE. Noter des pages EST la preuve
-- qu'on a lu : redemander de cocher « lire un peu » juste après serait demander
-- deux fois la même chose. La colonne dit laquelle des habitudes se coche ainsi
-- — une seule valeur aujourd'hui, mais la forme accueillera les suivantes.
alter table public.habitudes
  add column if not exists automatique text
  check (automatique is null or automatique in ('lecture'));

comment on column public.habitudes.automatique is
  'Ce qui coche cette habitude sans qu''on le demande. NULL pour toutes celles qu''on coche à la main, qui est le cas ordinaire.';

update public.habitudes set automatique = 'lecture' where nom = 'Lire un peu';

alter table public.livres           enable row level security;
alter table public.livres_seances   enable row level security;
alter table public.livres_citations enable row level security;

create policy "livres_select_authenticated" on public.livres for select to authenticated using (true);
create policy "livres_insert_authenticated" on public.livres for insert to authenticated with check (true);
create policy "livres_update_authenticated" on public.livres for update to authenticated using (true) with check (true);
create policy "livres_delete_authenticated" on public.livres for delete to authenticated using (true);

create policy "livres_seances_select_authenticated" on public.livres_seances for select to authenticated using (true);
create policy "livres_seances_insert_authenticated" on public.livres_seances for insert to authenticated with check (true);
create policy "livres_seances_update_authenticated" on public.livres_seances for update to authenticated using (true) with check (true);
create policy "livres_seances_delete_authenticated" on public.livres_seances for delete to authenticated using (true);

create policy "livres_citations_select_authenticated" on public.livres_citations for select to authenticated using (true);
create policy "livres_citations_insert_authenticated" on public.livres_citations for insert to authenticated with check (true);
create policy "livres_citations_update_authenticated" on public.livres_citations for update to authenticated using (true) with check (true);
create policy "livres_citations_delete_authenticated" on public.livres_citations for delete to authenticated using (true);

grant select, insert, update, delete on public.livres           to authenticated;
grant select, insert, update, delete on public.livres_seances   to authenticated;
grant select, insert, update, delete on public.livres_citations to authenticated;
