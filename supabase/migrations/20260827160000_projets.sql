-- Les PROJETS : l'étage qui manquait entre le jalon et la tâche.
--
-- Constat mesuré le 27 août 2026 : UNE tâche sur trente-six était rattachée à
-- un objectif. Ce n'était pas de la négligence, c'était un lien impossible à
-- faire — « trier les photos U15 » ne sert pas *directement* « 1 000 abonnés »,
-- elle sert *l'album du club*, qui sert l'objectif. On demandait de sauter deux
-- étages.
--
-- Hiérarchie complète : mission → objectif → jalon → PROJET → tâche.
-- Voir docs/orientation-spec.md § 1 et § 2.1.

create table if not exists public.projets (
  id             uuid primary key default gen_random_uuid(),
  espace         text not null check (espace in ('formation', 'photo', 'fch', 'perso')),
  nom            text not null,
  resultat       text,
  charge_minutes int check (charge_minutes is null or charge_minutes > 0),
  charge_hebdo   int check (charge_hebdo is null or charge_hebdo > 0),
  echeance       date,
  statut         text not null default 'actif'
                 check (statut in ('idee', 'actif', 'en_pause', 'termine', 'abandonne')),
  created_at     timestamptz not null default now()
);

comment on column public.projets.resultat is
  'À quoi on reconnaît qu''il est fini. Sans ce champ, un projet ne se termine jamais et pourrit dans la liste.';
comment on column public.projets.charge_minutes is
  'La charge TOTALE, en minutes. Pour un projet qui finit. Minutes et non heures : c''est l''unité de taches.duree et de evenements, et deux unités dans une même somme finissent toujours par se croiser.';
comment on column public.projets.charge_hebdo is
  'La charge par SEMAINE, en minutes, pour un projet qui ne finit pas (une rubrique, un rythme). Une heure par quinzaine s''y écrit 30 : c''est une moyenne hebdomadaire, faite pour être additionnée.';

-- Un projet peut viser tout, rien, un jalon, un objectif, ou plusieurs
-- (décision de Noé). D'où une table de liens plutôt qu'une colonne.
create table if not exists public.projets_cibles (
  id          uuid primary key default gen_random_uuid(),
  projet_id   uuid not null references public.projets(id) on delete cascade,
  objectif_id uuid references public.objectifs(id) on delete cascade,
  jalon_id    uuid references public.jalons(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint projets_cibles_vise_quelque_chose
    check (objectif_id is not null or jalon_id is not null)
);

create index if not exists projets_cibles_projet_idx   on public.projets_cibles(projet_id);
create index if not exists projets_cibles_objectif_idx on public.projets_cibles(objectif_id);

-- RÈGLE ANTI-DOUBLE-COMPTAGE : la progression d'un objectif reste
-- « jalons atteints / jalons totaux », inchangée. Les projets ne calculent
-- aucune progression — ils portent la CHARGE et orientent. Deux caps servis
-- par un même projet ne le comptent donc pas deux fois.

alter table public.taches
  add column if not exists projet_id uuid references public.projets(id) on delete set null;
alter table public.evenements
  add column if not exists projet_id uuid references public.projets(id) on delete set null;
alter table public.publications
  add column if not exists projet_id uuid references public.projets(id) on delete set null;

create index if not exists taches_projet_idx       on public.taches(projet_id);
create index if not exists evenements_projet_idx   on public.evenements(projet_id);
create index if not exists publications_projet_idx on public.publications(projet_id);

alter table public.projets         enable row level security;
alter table public.projets_cibles  enable row level security;

create policy "projets_select_authenticated" on public.projets
  for select to authenticated using (true);
create policy "projets_insert_authenticated" on public.projets
  for insert to authenticated with check (true);
create policy "projets_update_authenticated" on public.projets
  for update to authenticated using (true) with check (true);
create policy "projets_delete_authenticated" on public.projets
  for delete to authenticated using (true);

create policy "projets_cibles_select_authenticated" on public.projets_cibles
  for select to authenticated using (true);
create policy "projets_cibles_insert_authenticated" on public.projets_cibles
  for insert to authenticated with check (true);
create policy "projets_cibles_update_authenticated" on public.projets_cibles
  for update to authenticated using (true) with check (true);
create policy "projets_cibles_delete_authenticated" on public.projets_cibles
  for delete to authenticated using (true);

grant select, insert, update, delete on public.projets        to authenticated;
grant select, insert, update, delete on public.projets_cibles to authenticated;

-- --- Amorçage : l'inventaire FCH arrêté avec Noé le 27 août 2026 -------------
--
-- Les cibles et les rattachements ci-dessous sont des PROPOSITIONS tirées des
-- noms : « Visuels de la semaine » va dans « Programmation de la semaine »,
-- « Présentation U17 » dans « Présentation des catégories ». Noé corrige.

insert into public.projets (espace, nom, resultat, charge_minutes, charge_hebdo, echeance, statut) values
 ('fch','Présentation des catégories','Chaque catégorie a eu sa publication de présentation', 7*120, null, '2026-10-31','actif'),
 ('fch','Programmation de la semaine',null, null, 240, null,'actif'),
 ('fch','Anniversaires du mois',null, null, 30, null,'actif'),
 ('fch','Album du club','Les photos de toutes les catégories sont prises et triées', null, null, null,'actif'),
 ('fch','Équipe com avec Lina','Un référent par catégorie jusqu''aux U13, outillé sur Canva', null, null, '2026-12-15','actif'),
 ('fch','Suivi de l''alternance',null, null, null, null,'actif');

insert into public.projets_cibles (projet_id, objectif_id)
select p.id, o.id from public.projets p, public.objectifs o
where p.espace='fch' and o.espace='fch'
  and ((p.nom in ('Présentation des catégories','Programmation de la semaine','Anniversaires du mois')
        and o.titre like 'Atteindre 1 000 abonnés%')
    or (p.nom = 'Équipe com avec Lina' and o.titre like 'Laisser une com%'));

update public.taches t set projet_id = p.id from public.projets p
where p.espace='fch' and t.espace='fch' and t.projet_id is null
  and ((t.titre = 'Visuels de la semaine'              and p.nom='Programmation de la semaine')
    or (t.titre = 'Les anniversaires du prochain mois' and p.nom='Anniversaires du mois')
    or (t.titre = 'Répondre Album du Club'             and p.nom='Album du club'));

update public.publications q set projet_id = p.id from public.projets p
where p.espace='fch' and q.espace='fch' and q.projet_id is null
  and ((q.titre like 'Présentation %'  and p.nom='Présentation des catégories')
    or (q.titre like 'Programmation %' and p.nom='Programmation de la semaine'));

update public.evenements e set projet_id = p.id from public.projets p
where p.espace='fch' and e.espace='fch' and e.projet_id is null
  and e.titre = 'Photos album du club' and p.nom='Album du club';
