-- Yuno — les trois tables de l'espace (docs/yuno-spec.md, §5)
--
-- Ces tables sont propres au projet photo : pas de colonne `projet`, la clé
-- d'appartenance est l'espace qui les affiche. Même modèle de sécurité que les
-- six tables du hub : RLS activée, tout réservé à `authenticated`, aucun
-- privilège pour `anon`.

-- Le calendrier éditorial et la banque d'idées : une seule matière.
-- Une idée est une publication sans date (`date_prevue` NULL).
create table public.publications (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  reseau text not null default 'instagram'
    check (reseau in ('instagram', 'tiktok', 'linkedin')),
  format text not null default 'post'
    check (format in ('post', 'carrousel', 'reel', 'story')),
  statut text not null default 'idee'
    check (statut in ('idee', 'brouillon', 'pret', 'publie')),
  date_prevue date,
  rubrique text,
  notes text,
  lien_publie text,
  created_at timestamptz not null default now()
);

comment on table public.publications is
  'Calendrier éditorial Yuno. date_prevue NULL = banque d''idées.';

-- Le carnet réseau : joueurs, gens des médias, gens des clubs.
-- `structure` dit à qui la personne est reliée (FC Lorient, OM, La Provence…).
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text not null default 'autre'
    check (type in ('joueur', 'club', 'media', 'marque', 'autre')),
  structure text,
  instagram text,
  email text,
  telephone text,
  notes text,
  dernier_echange date,
  created_at timestamptz not null default now()
);

comment on table public.contacts is
  'Carnet réseau Yuno. structure = le club/média/marque de rattachement.';

-- Le suivi des commandes, volontairement simple.
create table public.commandes (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  client text,
  statut text not null default 'en_cours'
    check (statut in ('en_cours', 'livree')),
  echeance date,
  lien_livrable text,
  notes text,
  created_at timestamptz not null default now()
);

-- Sécurité : même modèle que le reste du hub.
alter table public.publications enable row level security;
alter table public.contacts     enable row level security;
alter table public.commandes    enable row level security;

create policy "publications_select_authenticated" on public.publications
  for select to authenticated using (true);
create policy "publications_insert_authenticated" on public.publications
  for insert to authenticated with check (true);
create policy "publications_update_authenticated" on public.publications
  for update to authenticated using (true) with check (true);
create policy "publications_delete_authenticated" on public.publications
  for delete to authenticated using (true);

create policy "contacts_select_authenticated" on public.contacts
  for select to authenticated using (true);
create policy "contacts_insert_authenticated" on public.contacts
  for insert to authenticated with check (true);
create policy "contacts_update_authenticated" on public.contacts
  for update to authenticated using (true) with check (true);
create policy "contacts_delete_authenticated" on public.contacts
  for delete to authenticated using (true);

create policy "commandes_select_authenticated" on public.commandes
  for select to authenticated using (true);
create policy "commandes_insert_authenticated" on public.commandes
  for insert to authenticated with check (true);
create policy "commandes_update_authenticated" on public.commandes
  for update to authenticated using (true) with check (true);
create policy "commandes_delete_authenticated" on public.commandes
  for delete to authenticated using (true);

grant select, insert, update, delete on public.publications to authenticated;
grant select, insert, update, delete on public.contacts     to authenticated;
grant select, insert, update, delete on public.commandes    to authenticated;
