-- Hub — schéma initial
-- 6 tables : objectifs, jalons, taches, evenements, victoires, humeur
--
-- Convention : la colonne `projet` porte une contrainte CHECK limitant les valeurs
-- aux 4 espaces du hub. `jalons` n'a pas de colonne `projet` : il hérite du projet
-- de son objectif.
--
-- Cas particulier : 'perso' n'est PAS autorisé dans `taches` (ni dans `jalons`, par
-- construction côté applicatif). L'espace perso n'a ni tâches ni jalons ni notion de
-- retard — cette règle est encodée ici dans la contrainte plutôt que laissée à l'UI.

-- ---------------------------------------------------------------------------
-- objectifs
-- Dans l'espace perso, un objectif est une « intention » : cible et echeance
-- restent vides et aucune progression n'est affichée.
-- ---------------------------------------------------------------------------
create table public.objectifs (
  id           uuid primary key default gen_random_uuid(),
  projet       text not null check (projet in ('formation', 'photo', 'fch', 'perso')),
  titre        text not null,
  pourquoi     text,
  cible        text,
  echeance     date,
  statut       text not null default 'actif' check (statut in ('actif', 'atteint', 'abandonne')),
  date_atteint date,
  created_at   timestamptz not null default now()
);

comment on table public.objectifs is
  'Objectifs par projet. Pour projet = ''perso'', il s''agit d''intentions : cible et echeance vides, aucune progression.';
comment on column public.objectifs.pourquoi is
  'Le sens de l''objectif, relu les jours sans motivation. Affiché au survol ou au clic.';

-- ---------------------------------------------------------------------------
-- jalons
-- La progression d'un objectif = jalons atteints / jalons totaux, calculée
-- côté client et jamais stockée.
-- ---------------------------------------------------------------------------
create table public.jalons (
  id           uuid primary key default gen_random_uuid(),
  objectif_id  uuid not null references public.objectifs(id) on delete cascade,
  titre        text not null,
  echeance     date,
  atteint      boolean not null default false,
  date_atteint date,
  ordre        int,
  created_at   timestamptz not null default now()
);

create index jalons_objectif_id_idx on public.jalons (objectif_id);

comment on column public.jalons.ordre is 'Position du jalon dans la séquence de l''objectif.';

-- ---------------------------------------------------------------------------
-- taches
-- Règle métier : maximum 3 tâches en statut 'actif' par projet. Non contrainte
-- ici (elle demanderait un trigger) : l'UI doit empêcher d'en activer une 4ème.
-- ---------------------------------------------------------------------------
create table public.taches (
  id          uuid primary key default gen_random_uuid(),
  projet      text not null check (projet in ('formation', 'photo', 'fch')),
  objectif_id uuid references public.objectifs(id) on delete set null,
  jalon_id    uuid references public.jalons(id) on delete set null,
  titre       text not null,
  statut      text not null default 'backlog' check (statut in ('backlog', 'actif', 'fait')),
  echeance    date,
  date_fait   timestamptz,
  created_at  timestamptz not null default now()
);

create index taches_objectif_id_idx on public.taches (objectif_id);
create index taches_jalon_id_idx on public.taches (jalon_id);

comment on table public.taches is
  'Tâches des 3 projets. ''perso'' est volontairement exclu du CHECK : l''espace perso n''a pas de tâches.';
comment on column public.taches.titre is 'Toujours une action concrète commençant par un verbe.';

-- ---------------------------------------------------------------------------
-- evenements
-- Côté perso : les « rendez-vous avec soi-même » (sport, sorties, photo plaisir).
-- ---------------------------------------------------------------------------
create table public.evenements (
  id         uuid primary key default gen_random_uuid(),
  projet     text not null check (projet in ('formation', 'photo', 'fch', 'perso')),
  titre      text not null,
  date_debut timestamptz not null,
  date_fin   timestamptz,
  lieu       text,
  notes      text,
  created_at timestamptz not null default now()
);

create index evenements_date_debut_idx on public.evenements (date_debut);

-- ---------------------------------------------------------------------------
-- victoires
-- Alimentées automatiquement (tâche terminée, jalon ou objectif atteint) ou
-- ajoutées à la main. Les victoires perso comptent autant que les victoires pro.
-- ---------------------------------------------------------------------------
create table public.victoires (
  id         uuid primary key default gen_random_uuid(),
  projet     text not null check (projet in ('formation', 'photo', 'fch', 'perso')),
  titre      text not null,
  date       date not null default current_date,
  source     text not null default 'manuel' check (source in ('tache', 'jalon', 'objectif', 'manuel')),
  source_id  uuid,
  created_at timestamptz not null default now()
);

create index victoires_date_idx on public.victoires (date desc);

comment on column public.victoires.source_id is
  'Id de la tâche, du jalon ou de l''objectif d''origine. Nul pour une victoire manuelle.';

-- ---------------------------------------------------------------------------
-- humeur
-- Une seule entrée par jour ; répondre à nouveau met à jour la valeur.
-- ---------------------------------------------------------------------------
create table public.humeur (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique default current_date,
  niveau     int not null check (niveau between 1 and 5),
  note       text,
  created_at timestamptz not null default now()
);

comment on column public.humeur.note is 'Un mot ou une phrase, facultatif.';
