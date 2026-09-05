-- LES FILMS ET LES SÉRIES (5 septembre 2026, demande de Noé : « fais la même
-- chose que les livres mais pour les films/séries, donc dans la page ma
-- bibliothèque mets 2 entrées, 1 pour les livres 1 pour les films/séries »).
--
-- TROIS TABLES, LES MÊMES QUE LA BIBLIOTHÈQUE, et pour les mêmes raisons — le
-- journal des séances est celle qui compte : les épisodes vus d'une série sont
-- la SOMME de ses séances, jamais une colonne à part. Deux endroits pour un même
-- nombre finissent toujours par se contredire.
--
-- POURQUOI UNE SECONDE RÉSERVE ET NON UNE COLONNE `nature` DANS `livres` :
-- c'est l'argument déjà écrit le 2 septembre pour le bucket des couvertures —
-- deux natures, deux réserves. Un film n'est pas un livre : il n'a ni pages ni
-- auteur, sa progression se compte en épisodes ou ne se compte pas du tout, et
-- une table nommée « livres » qui contiendrait des films serait un nom qui ment
-- sur ce qu'il porte. Le CODE, lui, est le même : un seul jeu de fonctions sert
-- les deux rayons (js/bibliotheque.js), de sorte que rien ne peut diverger.
--
-- PAS D'OBJECTIF ANNUEL, PAS DE QUOTA, exactement comme pour les livres : « 30
-- films cette année » transforme le cinéma en course. Le hub montre ce qu'on a
-- vu, jamais un reste à voir.

create table if not exists public.films (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  -- LE RÉALISATEUR, et non « auteur » : le mot du domaine. C'est le seul champ
  -- dont le nom diffère de son jumeau côté livres, avec les trois suivants.
  realisateur  text,
  -- FILM OU SÉRIE, dans la même réserve : ce sont deux formes d'une même chose —
  -- on les regarde, on les note, on les range ensemble. La nature sert à dire
  -- ce que « 8 épisodes » veut dire, et elle se filtre comme un thème.
  nature       text not null default 'film' check (nature in ('film', 'serie')),
  -- Le nombre d'épisodes d'une série. NULL pour un film : il n'a pas d'étapes,
  -- on le voit ou on ne le voit pas — et la jauge disparaît alors, comme pour un
  -- livre dont on ne connaît pas le nombre de pages.
  episodes     int check (episodes is null or episodes > 0),
  -- « Reposé » et non « abandonné » : une série qu'on lâche n'est pas un échec,
  -- et le mot compte. Ses épisodes sont gardés, on peut la reprendre.
  statut       text not null default 'a_voir'
               check (statut in ('a_voir', 'en_cours', 'vu', 'repose')),
  note         int check (note is null or note between 1 and 5),
  commence_le  date,
  fini_le      date,
  notes        text,
  -- L'AFFICHE, pendant de la couverture d'un livre : une image qu'on prend, qui
  -- vit dans le hub et qui ne peut pas disparaître. Chemin dans le bucket
  -- « affiches ».
  affiche      text,
  -- LES GENRES, pendant des thèmes d'un livre. Un tableau : un film en porte
  -- plusieurs, et une colonne texte aurait obligé à choisir. La base n'impose
  -- rien — la liste offerte à la saisie vit dans js/bibliotheque.js.
  genres       text[] not null default '{}',
  created_at   timestamptz not null default now()
);

comment on column public.films.nature is
  'film ou serie. Dit ce que « épisodes » veut dire, et se filtre comme un genre.';
comment on column public.films.affiche is
  'Chemin de l''affiche dans le bucket « affiches ». NULL = pas d''affiche, et l''étagère pose alors une tuile pointillée avec le titre.';
comment on column public.films.genres is
  'Les genres, plusieurs possibles. Vocabulaire libre : la liste offerte vit dans js/bibliotheque.js, la base n''impose rien.';

-- LE JOURNAL DE VISIONNAGE. Les épisodes vus sont la SOMME des séances : c'est
-- ce qui donne le rythme, et ce qui permet de corriger un « +3 » touché deux
-- fois sans avoir de colonne à rattraper.
create table if not exists public.films_seances (
  id         uuid primary key default gen_random_uuid(),
  film_id    uuid not null references public.films(id) on delete cascade,
  jour       date not null default current_date,
  episodes   int not null check (episodes <> 0),
  created_at timestamptz not null default now()
);

create index if not exists films_seances_film_idx on public.films_seances(film_id);
create index if not exists films_seances_jour_idx on public.films_seances(jour);

-- CE QUI RESTE D'UN FILM six mois après, plus que la note : une réplique qu'on a
-- gardée. Même table que les citations d'un livre, au repère près — une réplique
-- ne se situe pas à une page mais à un moment (« 1 h 12 », « S2E4 »), d'où un
-- texte libre et non un entier.
create table if not exists public.films_citations (
  id         uuid primary key default gen_random_uuid(),
  film_id    uuid not null references public.films(id) on delete cascade,
  texte      text not null,
  repere     text,
  created_at timestamptz not null default now()
);

create index if not exists films_citations_film_idx on public.films_citations(film_id);

-- Un index GIN, comme pour les thèmes d'un livre : il sert « genres @> {drame} ».
-- Le filtre se fait côté client aujourd'hui — l'étagère tient en mémoire —, mais
-- l'index ne coûte rien et sera là le jour où elle n'y tiendra plus.
create index if not exists films_genres_idx on public.films using gin (genres);

-- LA RÉSERVE DES AFFICHES. Un second bucket, et non un dossier dans « livres » :
-- une affiche n'est pas une couverture, et le jour où l'on videra l'une on ne
-- touchera pas à l'autre. Privé, comme les deux autres : sans lien signé, il ne
-- répond pas.
insert into storage.buckets (id, name, public)
values ('affiches', 'affiches', false)
on conflict (id) do nothing;

drop policy if exists affiches_lire_authenticated on storage.objects;
create policy affiches_lire_authenticated on storage.objects
  for select to authenticated using (bucket_id = 'affiches');

drop policy if exists affiches_deposer_authenticated on storage.objects;
create policy affiches_deposer_authenticated on storage.objects
  for insert to authenticated with check (bucket_id = 'affiches');

drop policy if exists affiches_remplacer_authenticated on storage.objects;
create policy affiches_remplacer_authenticated on storage.objects
  for update to authenticated using (bucket_id = 'affiches') with check (bucket_id = 'affiches');

drop policy if exists affiches_effacer_authenticated on storage.objects;
create policy affiches_effacer_authenticated on storage.objects
  for delete to authenticated using (bucket_id = 'affiches');

alter table public.films           enable row level security;
alter table public.films_seances   enable row level security;
alter table public.films_citations enable row level security;

create policy "films_select_authenticated" on public.films for select to authenticated using (true);
create policy "films_insert_authenticated" on public.films for insert to authenticated with check (true);
create policy "films_update_authenticated" on public.films for update to authenticated using (true) with check (true);
create policy "films_delete_authenticated" on public.films for delete to authenticated using (true);

create policy "films_seances_select_authenticated" on public.films_seances for select to authenticated using (true);
create policy "films_seances_insert_authenticated" on public.films_seances for insert to authenticated with check (true);
create policy "films_seances_update_authenticated" on public.films_seances for update to authenticated using (true) with check (true);
create policy "films_seances_delete_authenticated" on public.films_seances for delete to authenticated using (true);

create policy "films_citations_select_authenticated" on public.films_citations for select to authenticated using (true);
create policy "films_citations_insert_authenticated" on public.films_citations for insert to authenticated with check (true);
create policy "films_citations_update_authenticated" on public.films_citations for update to authenticated using (true) with check (true);
create policy "films_citations_delete_authenticated" on public.films_citations for delete to authenticated using (true);

grant select, insert, update, delete on public.films           to authenticated;
grant select, insert, update, delete on public.films_seances   to authenticated;
grant select, insert, update, delete on public.films_citations to authenticated;
