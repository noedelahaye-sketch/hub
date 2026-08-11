-- Terrain v1.1 — le schéma du système « Terrain » de Yuno
-- (le quoi : Yuno/brief-v1-1-terrain-yuno.md ; le pourquoi, qui fait autorité
-- sur l'intention : Yuno/pourquoi-terrain-yuno.md)
--
-- Tout le chantier en une migration : cinq tables nouvelles, quatre tables
-- étendues. Aucune donnée existante n'est touchée — les CHECK s'élargissent,
-- ils ne se resserrent jamais.

-- ---------------------------------------------------------------------------
-- Le Carnet de terrain : les moments vécus.
--
-- Un moment est un fait accompli — un match couvert, un concert, une sortie.
-- Les compteurs de l'accueil (moments, rencontres, œuvres finies) se CALCULENT
-- depuis ces lignes, ils ne sont stockés nulle part : des faits accumulés ne
-- peuvent que monter, c'est la réserve de valeur stable du système.

create table public.moments (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  type text not null default 'match'
    check (type in ('match', 'concert', 'sortie', 'autre')),
  lieu text,
  photo_fiere text,
  note text,
  oeuvre_finie boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.moments is
  'Le Carnet de terrain Yuno. Un moment vécu = une ligne ; les compteurs s''en déduisent.';
comment on column public.moments.lieu is
  'L''événement ou le lieu, en toutes lettres.';
comment on column public.moments.photo_fiere is
  'La photo dont je suis fier : un lien ou une description.';

-- Qui j'ai rencontré. Une ligne par personne et par moment ; le lien vers le
-- carnet réseau est facultatif — on peut noter « le photographe de l'OM »
-- sans lui ouvrir une fiche. La photo est un pont vers les gens : les
-- rencontres comptent au même rang que les images.
create table public.rencontres (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  nom text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.rencontres is
  'Les rencontres d''un moment. contact_id relie au carnet réseau, s''il y a une fiche.';

-- Le rendez-vous stats hebdomadaire. Une ligne par rendez-vous, jamais plus
-- (UNIQUE sur la date). La réponse rituelle est NOT NULL : le formulaire ne
-- vaut que terminé par « est-ce que ça change quelque chose à mes actions
-- cette semaine ? » — « non » est une réponse acceptée, l'absence non.
create table public.stats_hebdo (
  id uuid primary key default gen_random_uuid(),
  date date not null unique default current_date,
  abonnes int,
  reach int,
  top_post text,
  reponse_rituelle text not null,
  created_at timestamptz not null default now()
);

comment on table public.stats_hebdo is
  'Le rendez-vous stats. Hors du jour choisi, rien de tout cela ne s''affiche.';

-- La bibliothèque de modèles de messages : la friction du premier message est
-- le principal mur de l'aller-vers, un modèle à personnaliser abaisse le coût
-- d'entrée. Le contenu vit en base, pas dans le dépôt (public).
create table public.modeles_messages (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  corps text not null,
  ordre int,
  created_at timestamptz not null default now()
);

-- Le journal des envois : LA métrique de la Passerelle. Une ligne = un message
-- envoyé — un effort, contrôlable. Le cumul et « cette semaine » s'en
-- déduisent. On ne compte jamais les réponses ni les silences : c'est pourquoi
-- cette table n'a pas de colonne « répondu ». ON DELETE SET NULL : supprimer
-- une fiche du carnet ne fait pas redescendre le compteur.
create table public.journal_envois (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Les lectures fréquentes : la timeline antéchronologique du Carnet, les
-- rencontres d'un moment, les envois de la semaine.
create index moments_date_idx        on public.moments (date);
create index rencontres_moment_idx   on public.rencontres (moment_id);
create index journal_envois_date_idx on public.journal_envois (date);

-- ---------------------------------------------------------------------------
-- Sécurité : même modèle que les neuf tables existantes — RLS activée, tout
-- réservé à `authenticated`, aucun privilège pour `anon`.

alter table public.moments          enable row level security;
alter table public.rencontres       enable row level security;
alter table public.stats_hebdo      enable row level security;
alter table public.modeles_messages enable row level security;
alter table public.journal_envois   enable row level security;

create policy "moments_select_authenticated" on public.moments
  for select to authenticated using (true);
create policy "moments_insert_authenticated" on public.moments
  for insert to authenticated with check (true);
create policy "moments_update_authenticated" on public.moments
  for update to authenticated using (true) with check (true);
create policy "moments_delete_authenticated" on public.moments
  for delete to authenticated using (true);

create policy "rencontres_select_authenticated" on public.rencontres
  for select to authenticated using (true);
create policy "rencontres_insert_authenticated" on public.rencontres
  for insert to authenticated with check (true);
create policy "rencontres_update_authenticated" on public.rencontres
  for update to authenticated using (true) with check (true);
create policy "rencontres_delete_authenticated" on public.rencontres
  for delete to authenticated using (true);

create policy "stats_hebdo_select_authenticated" on public.stats_hebdo
  for select to authenticated using (true);
create policy "stats_hebdo_insert_authenticated" on public.stats_hebdo
  for insert to authenticated with check (true);
create policy "stats_hebdo_update_authenticated" on public.stats_hebdo
  for update to authenticated using (true) with check (true);
create policy "stats_hebdo_delete_authenticated" on public.stats_hebdo
  for delete to authenticated using (true);

create policy "modeles_messages_select_authenticated" on public.modeles_messages
  for select to authenticated using (true);
create policy "modeles_messages_insert_authenticated" on public.modeles_messages
  for insert to authenticated with check (true);
create policy "modeles_messages_update_authenticated" on public.modeles_messages
  for update to authenticated using (true) with check (true);
create policy "modeles_messages_delete_authenticated" on public.modeles_messages
  for delete to authenticated using (true);

create policy "journal_envois_select_authenticated" on public.journal_envois
  for select to authenticated using (true);
create policy "journal_envois_insert_authenticated" on public.journal_envois
  for insert to authenticated with check (true);
create policy "journal_envois_update_authenticated" on public.journal_envois
  for update to authenticated using (true) with check (true);
create policy "journal_envois_delete_authenticated" on public.journal_envois
  for delete to authenticated using (true);

grant select, insert, update, delete on public.moments          to authenticated;
grant select, insert, update, delete on public.rencontres       to authenticated;
grant select, insert, update, delete on public.stats_hebdo      to authenticated;
grant select, insert, update, delete on public.modeles_messages to authenticated;
grant select, insert, update, delete on public.journal_envois   to authenticated;

-- ---------------------------------------------------------------------------
-- contacts : la couche Passerelle.
--
-- L'échelle de relation s'allonge — les valeurs existantes ne bougent pas, et
-- « bon contact » reste (on ne remplace pas ce qui marche) :
--   pas_de_contact -> message_envoye -> relance -> repondu -> contact_etabli
--   -> bon_contact -> opportunite

alter table public.contacts drop constraint contacts_statut_check;
alter table public.contacts add constraint contacts_statut_check
  check (statut in ('pas_de_contact', 'message_envoye', 'relance', 'repondu',
                    'contact_etabli', 'bon_contact', 'opportunite'));

comment on column public.contacts.statut is
  'Où en est la relation. Progression : pas_de_contact -> message_envoye -> relance -> repondu -> contact_etabli -> bon_contact -> opportunite.';

alter table public.contacts
  add column objectif text,
  add column niveau int check (niveau between 1 and 3),
  add column date_dernier_envoi date,
  add column prochaine_action text,
  add column prochaine_action_date date;

comment on column public.contacts.objectif is
  'Pourquoi ce contact (« accréditation Vélodrome »).';
comment on column public.contacts.niveau is
  'La micro-dose d''aller-vers : 1 Répondre · 2 Relancer · 3 Ouvrir.';
comment on column public.contacts.date_dernier_envoi is
  'Distinct de dernier_echange : un envoi est un effort à soi, un échange est bidirectionnel.';
comment on column public.contacts.prochaine_action_date is
  'Datée, la prochaine action apparaît au calendrier (Relances).';

-- ---------------------------------------------------------------------------
-- publications : la banque d'idées enrichie. « Une idée est une publication
-- sans date » tient toujours ; l'idée gagne son pilier, sa preuve (ce qui
-- montre que le format marche) et son « pourquoi chez moi ». Colonnes propres
-- à Yuno, NULL pour le FCH.

alter table public.publications drop constraint publications_statut_check;
alter table public.publications add constraint publications_statut_check
  check (statut in ('idee', 'a_developper', 'brouillon', 'pret', 'publie'));

alter table public.publications
  add column pilier int check (pilier between 1 and 4),
  add column preuve text,
  add column pourquoi_moi text;

comment on column public.publications.pilier is
  'Yuno : 1 Léopards & foot africain · 2 Bord terrain · 3 Dans l''œil du photographe · 4 Carte blanche.';

-- ---------------------------------------------------------------------------
-- commandes : la fusion dans Réseau. Le cycle s'allonge de part et d'autre
-- (devis avant, payée après), et le client peut pointer une fiche du carnet —
-- la colonne texte `client` reste pour les clients sans fiche.

alter table public.commandes drop constraint commandes_statut_check;
alter table public.commandes add constraint commandes_statut_check
  check (statut in ('devis', 'en_cours', 'livree', 'payee'));

alter table public.commandes
  add column montant numeric,
  add column client_id uuid references public.contacts(id) on delete set null;

-- ---------------------------------------------------------------------------
-- victoires : une victoire, dans ce système, EST un moment vécu. Loguer un
-- moment au Carnet en crée une, qui remonte au dashboard du hub.

alter table public.victoires drop constraint victoires_source_check;
alter table public.victoires add constraint victoires_source_check
  check (source in ('tache', 'jalon', 'objectif', 'manuel', 'moment'));
