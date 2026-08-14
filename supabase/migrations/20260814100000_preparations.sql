-- Préparations (Yuno) — préparer une sortie : match, concert, commande.
--
-- Une PRÉPARATION est la feuille d'une sortie : trois phases (avant, pendant,
-- après) de cases à cocher, puis un bilan en deux questions. Elle se crée
-- depuis un MODÈLE — « Match », « Concert »… — dont elle COPIE les items :
-- modifier le modèle ensuite ne réécrit pas les feuilles passées, le bilan
-- d'octobre doit refléter ce qui était prévu en octobre.
--
-- La phase « pendant » est la liste des plans photo ; un item non coché n'est
-- pas un raté, et rien ici ne compte les manqués — le bilan dit d'abord
-- l'obtenu (philosophie du hub, et « Terrain » : on mesure l'effort choisi,
-- jamais un résultat subi).

create table public.modeles_preparation (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

comment on table public.modeles_preparation is
  'Un modèle de préparation : « Match », « Concert »… Ses items se copient dans chaque feuille.';

create table public.modeles_preparation_items (
  id uuid primary key default gen_random_uuid(),
  modele_id uuid not null references public.modeles_preparation(id) on delete cascade,
  phase text not null check (phase in ('avant', 'pendant', 'apres')),
  texte text not null,
  ordre int,
  created_at timestamptz not null default now()
);

comment on column public.modeles_preparation_items.phase is
  'avant = la veille et le jour J · pendant = les plans photo · apres = le retour (trier, retoucher…).';

create table public.preparations (
  id uuid primary key default gen_random_uuid(),
  modele_id uuid references public.modeles_preparation(id) on delete set null,
  -- Une feuille se rattache à un événement OU à une commande, ou à rien.
  -- SET NULL : supprimer l'événement ne supprime pas ce qui a été préparé.
  evenement_id uuid references public.evenements(id) on delete set null,
  commande_id uuid references public.commandes(id) on delete set null,
  -- Titre et date sont copiés à la création : la feuille se lit seule, sans
  -- jointure, et survit à la disparition de son événement.
  titre text not null,
  date date,
  bilan_bien text,
  bilan_mieux text,
  bilan_date date,
  created_at timestamptz not null default now()
);

comment on table public.preparations is
  'Une feuille de préparation par sortie. Le bilan (deux questions) vit dessus.';
comment on column public.preparations.bilan_bien is
  'Ce qui a marché.';
comment on column public.preparations.bilan_mieux is
  'À refaire autrement la prochaine fois.';

create table public.preparations_items (
  id uuid primary key default gen_random_uuid(),
  preparation_id uuid not null references public.preparations(id) on delete cascade,
  phase text not null check (phase in ('avant', 'pendant', 'apres')),
  texte text not null,
  fait boolean not null default false,
  ordre int,
  created_at timestamptz not null default now()
);

comment on table public.preparations_items is
  'Les cases d''une feuille — copiées du modèle, plus celles ajoutées sur le moment.';

-- Les lectures fréquentes : les items d'une feuille, les items d'un modèle,
-- « cet événement a-t-il déjà sa feuille ? ».
create index modeles_preparation_items_modele_idx on public.modeles_preparation_items (modele_id);
create index preparations_items_preparation_idx   on public.preparations_items (preparation_id);
create index preparations_evenement_idx           on public.preparations (evenement_id);

-- ---------------------------------------------------------------------------
-- Sécurité : même modèle que toutes les tables — RLS activée, tout réservé à
-- `authenticated`, aucun privilège pour `anon`.

alter table public.modeles_preparation       enable row level security;
alter table public.modeles_preparation_items enable row level security;
alter table public.preparations              enable row level security;
alter table public.preparations_items        enable row level security;

create policy "modeles_preparation_select_authenticated" on public.modeles_preparation
  for select to authenticated using (true);
create policy "modeles_preparation_insert_authenticated" on public.modeles_preparation
  for insert to authenticated with check (true);
create policy "modeles_preparation_update_authenticated" on public.modeles_preparation
  for update to authenticated using (true) with check (true);
create policy "modeles_preparation_delete_authenticated" on public.modeles_preparation
  for delete to authenticated using (true);

create policy "modeles_preparation_items_select_authenticated" on public.modeles_preparation_items
  for select to authenticated using (true);
create policy "modeles_preparation_items_insert_authenticated" on public.modeles_preparation_items
  for insert to authenticated with check (true);
create policy "modeles_preparation_items_update_authenticated" on public.modeles_preparation_items
  for update to authenticated using (true) with check (true);
create policy "modeles_preparation_items_delete_authenticated" on public.modeles_preparation_items
  for delete to authenticated using (true);

create policy "preparations_select_authenticated" on public.preparations
  for select to authenticated using (true);
create policy "preparations_insert_authenticated" on public.preparations
  for insert to authenticated with check (true);
create policy "preparations_update_authenticated" on public.preparations
  for update to authenticated using (true) with check (true);
create policy "preparations_delete_authenticated" on public.preparations
  for delete to authenticated using (true);

create policy "preparations_items_select_authenticated" on public.preparations_items
  for select to authenticated using (true);
create policy "preparations_items_insert_authenticated" on public.preparations_items
  for insert to authenticated with check (true);
create policy "preparations_items_update_authenticated" on public.preparations_items
  for update to authenticated using (true) with check (true);
create policy "preparations_items_delete_authenticated" on public.preparations_items
  for delete to authenticated using (true);

grant select, insert, update, delete on public.modeles_preparation       to authenticated;
grant select, insert, update, delete on public.modeles_preparation_items to authenticated;
grant select, insert, update, delete on public.preparations              to authenticated;
grant select, insert, update, delete on public.preparations_items        to authenticated;
