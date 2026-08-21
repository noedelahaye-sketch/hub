-- La fiche de réunion (demande de Noé, 21 août 2026 au soir).
--
-- La feuille à cases des préparations (tables de Yuno) ne suffit plus pour les
-- réunions : le guide « Réunions efficaces » du club demande une STRUCTURE,
-- pas une liste — un contrat avant (type de réunion, objectif formulé « à la
-- fin, nous devons avoir… », ordre du jour orienté action et minuté), un
-- compte-rendu court après (décisions, actions avec responsable et échéance,
-- points en attente, prochain suivi), et un tableau permanent des actions qui
-- devient la mémoire du club — chaque réunion s'ouvre par le suivi du
-- précédent.
--
-- Trois tables neuves plutôt que des colonnes sur `preparations` : la feuille
-- à cases reste telle quelle pour les sorties Yuno, et une fiche de réunion
-- n'est pas une liste de cases. Les modèles fch semés le 21 août au matin
-- restent en base mais ne servent plus au site — le savoir-faire vit désormais
-- dans la structure de la fiche.

create table public.fiches_reunion (
  id uuid primary key default gen_random_uuid(),
  -- SET NULL : supprimer l'événement ne supprime pas ce qui a été préparé.
  evenement_id uuid references public.evenements(id) on delete set null,
  -- Titre et date copiés à la création : la fiche se lit seule, sans jointure.
  titre text not null,
  date date,

  -- AVANT — le contrat de réunion.
  type_reunion text check (type_reunion in
    ('information', 'decision', 'coordination', 'probleme', 'ideation', 'bilan', 'gouvernance')),
  objectif text,
  participants text,
  infos_avant text,
  notes_avant text,

  -- Les deux documents du Drive, collés une fois créés.
  lien_presentation text,
  lien_compte_rendu text,

  -- APRÈS — le compte-rendu court. Les actions vivent dans `actions_club`.
  cr_decisions text,
  cr_en_attente text,
  cr_suivi date,
  cr_date date,

  -- Et ce qui ne regarde que Noé.
  bilan_retenu text,
  bilan_animation text,

  created_at timestamptz not null default now()
);

comment on table public.fiches_reunion is
  'Une fiche par réunion FCH : le contrat avant, le compte-rendu court après. Structure du guide « Réunions efficaces ».';
comment on column public.fiches_reunion.objectif is
  '« À la fin de la réunion, nous devons avoir… » — si personne ne peut compléter la phrase, la réunion n''est pas prête.';
comment on column public.fiches_reunion.cr_suivi is
  'Le prochain point de contrôle : quand vérifie-t-on que les décisions vivent ?';
comment on column public.fiches_reunion.cr_date is
  'Quand le compte-rendu a été écrit — l''objectif du guide est sous 48 h.';
comment on column public.fiches_reunion.bilan_animation is
  'Réunion animée seulement : le déroulé, à refaire autrement — relu en préparant la suivante.';

-- L'ordre du jour orienté action : chaque point commence par un verbe et
-- annonce sa sortie attendue. Trois gros sujets maximum — la limite vit à
-- l'écran, pas en contrainte : un quatrième sujet est un choix, pas une faute.
create table public.fiches_reunion_points (
  id uuid primary key default gen_random_uuid(),
  fiche_id uuid not null references public.fiches_reunion(id) on delete cascade,
  titre text not null,
  type_point text check (type_point in
    ('information', 'decision', 'coordination', 'probleme', 'ideation', 'bilan', 'suivi')),
  minutes int,
  sortie text,
  -- Le guide : chaque point se clôt par une décision ou un report EXPLICITE.
  statut text not null default 'a_venir' check (statut in ('a_venir', 'traite', 'reporte')),
  ordre int,
  created_at timestamptz not null default now()
);

comment on table public.fiches_reunion_points is
  'L''ordre du jour d''une fiche : sujet (un verbe d''action), type, temps, sortie attendue.';
comment on column public.fiches_reunion_points.sortie is
  'La sortie attendue : « format validé », « tableau des rôles rempli »… — un résultat, pas un thème.';

-- Le tableau permanent des actions — la mémoire du club. Une action décidée en
-- réunion y entre avec son responsable et son échéance ; elle survit à sa
-- fiche (SET NULL), et la réunion suivante s'ouvre en le relisant. Quand le
-- responsable est Noé, l'action devient AUSSI une tâche fch : `tache_id` les
-- relie.
create table public.actions_club (
  id uuid primary key default gen_random_uuid(),
  fiche_id uuid references public.fiches_reunion(id) on delete set null,
  texte text not null,
  responsable text,
  echeance date,
  statut text not null default 'a_faire' check (statut in ('a_faire', 'en_cours', 'fait')),
  tache_id uuid references public.taches(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.actions_club is
  'Le tableau des actions décidées en réunion : quoi, qui, pour quand. Le suivi n''est pas fait pour culpabiliser — il rend les engagements visibles.';

create index fiches_reunion_evenement_idx  on public.fiches_reunion (evenement_id);
create index fiches_reunion_points_fiche_idx on public.fiches_reunion_points (fiche_id);
create index actions_club_fiche_idx        on public.actions_club (fiche_id);

-- ---------------------------------------------------------------------------
-- Sécurité : même modèle que toutes les tables — RLS activée, tout réservé à
-- `authenticated`, aucun privilège pour `anon`.

alter table public.fiches_reunion        enable row level security;
alter table public.fiches_reunion_points enable row level security;
alter table public.actions_club          enable row level security;

create policy "fiches_reunion_select_authenticated" on public.fiches_reunion
  for select to authenticated using (true);
create policy "fiches_reunion_insert_authenticated" on public.fiches_reunion
  for insert to authenticated with check (true);
create policy "fiches_reunion_update_authenticated" on public.fiches_reunion
  for update to authenticated using (true) with check (true);
create policy "fiches_reunion_delete_authenticated" on public.fiches_reunion
  for delete to authenticated using (true);

create policy "fiches_reunion_points_select_authenticated" on public.fiches_reunion_points
  for select to authenticated using (true);
create policy "fiches_reunion_points_insert_authenticated" on public.fiches_reunion_points
  for insert to authenticated with check (true);
create policy "fiches_reunion_points_update_authenticated" on public.fiches_reunion_points
  for update to authenticated using (true) with check (true);
create policy "fiches_reunion_points_delete_authenticated" on public.fiches_reunion_points
  for delete to authenticated using (true);

create policy "actions_club_select_authenticated" on public.actions_club
  for select to authenticated using (true);
create policy "actions_club_insert_authenticated" on public.actions_club
  for insert to authenticated with check (true);
create policy "actions_club_update_authenticated" on public.actions_club
  for update to authenticated using (true) with check (true);
create policy "actions_club_delete_authenticated" on public.actions_club
  for delete to authenticated using (true);

grant select, insert, update, delete on public.fiches_reunion        to authenticated;
grant select, insert, update, delete on public.fiches_reunion_points to authenticated;
grant select, insert, update, delete on public.actions_club          to authenticated;
