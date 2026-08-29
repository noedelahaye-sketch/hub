-- LES HABITUDES DE L'ESPACE PERSO (29 août 2026, demande de Noé).
--
-- Sa demande tient en une phrase : « garder une routine et me motiver à la
-- garder, mais en même temps sans être trop strict — il y aura forcément des
-- jours où je ne pourrai pas. » Puis, devant une première maquette trop tiède :
-- « propose-moi des stats qui me donnent envie de les faire comme si j'étais
-- dans un jeu, mais en restant sain pour que ça ne s'écroule pas à la première
-- fois que j'en saute une. »
--
-- Les deux moitiés de cette phrase commandent tout le reste, et elles ne sont
-- pas contradictoires : ce qui écroule une habitude, ce n'est pas l'enjeu,
-- c'est le TOUT OU RIEN. Un compteur qui remet à zéro efface trois semaines
-- pour une soirée.
--
-- Trois mesures, et aucune ne peut s'effondrer (voir js/orientation.js) :
--   l'ÉLAN     monte vite, descend de 2 par jour — une pratique répare trois
--              jours d'absence, une semaine vide ne coûte que 14 points
--   la SÉRIE   se compte en SEMAINES tenues, et recule d'un cran au lieu de
--              tomber à zéro : sept deviennent six, pas rien
--   le CUMUL   et ses paliers ne redescendent jamais
--
-- Pas de colonne `espace` : une habitude est perso par nature, comme `materiel`
-- et `commandes` sont de Yuno. Une colonne qui n'aurait jamais qu'une valeur ne
-- documente rien.

create table if not exists public.habitudes (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  -- Les MÊMES familles que `taches.famille` et `evenements.famille` : ce que ce
  -- moment sert. Elles existaient depuis le 27 août et n'étaient affichées
  -- nulle part ; elles trouvent ici leur premier emploi visible.
  famille    text check (famille is null or famille in ('corps', 'calme', 'lien', 'intendance')),
  -- Combien de fois par semaine on vise. NULL = « quand ça vient » : aucune
  -- cible, donc ni élan ni série — seulement le cumul. C'est la cadence des
  -- choses qu'on veut noter sans se les imposer.
  cadence    int check (cadence is null or cadence between 1 and 7),
  pourquoi   text,
  ordre      int,
  -- Une habitude qu'on met de côté ne se supprime pas : son histoire et ses
  -- paliers restent. Le hub ne jette pas ce qui a été fait.
  archivee   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.habitudes_faits (
  id          uuid primary key default gen_random_uuid(),
  habitude_id uuid not null references public.habitudes(id) on delete cascade,
  jour        date not null,
  created_at  timestamptz not null default now(),
  -- Une fois par jour au plus : le geste devient idempotent, et deux appuis ne
  -- comptent pas double.
  unique (habitude_id, jour)
);

create index if not exists habitudes_faits_jour_idx on public.habitudes_faits(jour);

-- Franchir un palier écrit une victoire, comme une étape de projet ou un jalon.
-- Un CHECK s'élargit, il ne se resserre jamais.
alter table public.victoires drop constraint if exists victoires_source_check;
alter table public.victoires add constraint victoires_source_check
  check (source in ('tache', 'jalon', 'objectif', 'manuel', 'moment', 'etape', 'habitude'));

alter table public.habitudes        enable row level security;
alter table public.habitudes_faits  enable row level security;

create policy "habitudes_select_authenticated" on public.habitudes
  for select to authenticated using (true);
create policy "habitudes_insert_authenticated" on public.habitudes
  for insert to authenticated with check (true);
create policy "habitudes_update_authenticated" on public.habitudes
  for update to authenticated using (true) with check (true);
create policy "habitudes_delete_authenticated" on public.habitudes
  for delete to authenticated using (true);

create policy "habitudes_faits_select_authenticated" on public.habitudes_faits
  for select to authenticated using (true);
create policy "habitudes_faits_insert_authenticated" on public.habitudes_faits
  for insert to authenticated with check (true);
create policy "habitudes_faits_update_authenticated" on public.habitudes_faits
  for update to authenticated using (true) with check (true);
create policy "habitudes_faits_delete_authenticated" on public.habitudes_faits
  for delete to authenticated using (true);

grant select, insert, update, delete on public.habitudes       to authenticated;
grant select, insert, update, delete on public.habitudes_faits to authenticated;

-- --- Amorçage : les cinq proposées à Noé, tirées de SES intentions -----------
--
-- Elles ne sortent pas d'une liste générique. « Prendre soin de mon corps —
-- sommeil, assiette, mouvement » donne les trois premières, et il écrit
-- lui-même que ce sont les premières sacrifiées quand la charge monte. « Des
-- temps seuls choisis selon l'état du jour » donne la lecture. « Des moments
-- partagés » donne la dernière, sans cadence — on la note, on ne la vise pas.
--
-- « Vivre de la joie, de l'espoir, de la simplicité » n'y est PAS, et ne doit
-- pas y être : c'est l'intention-mère, celle qui juge les autres. En faire une
-- case à cocher la détruirait.
insert into public.habitudes (nom, famille, cadence, pourquoi, ordre) values
  ('Bouger', 'corps', 3, 'Le foot, une course, une marche — tout compte.', 1),
  ('Lire un peu', 'calme', 5, 'Un temps seul qui ne demande rien à personne.', 2),
  ('Poser le téléphone avant de dormir', 'calme', 5, 'Le levier du sommeil, celui qui se coche vraiment.', 3),
  ('Un vrai repas à midi', 'corps', 5, 'L''assiette, celle qui saute en premier au bureau.', 4),
  ('Prendre des nouvelles de quelqu''un', 'lien', null, 'Sans cadence : on la note, on ne la vise pas.', 5);
