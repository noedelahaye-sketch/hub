-- La Passerelle v2 — le vivier de pistes (demande de Noé, 15 août 2026).
--
-- La Passerelle change de sens : elle servait à écrire à des fiches déjà au
-- réseau, elle sert désormais d'abord à contacter des clubs JAMAIS contactés.
-- Une piste = un club du vivier, défini avec Noé : Ligue 1, Ligue 2, Ligue 3
-- (saison 2026-2027, listes vérifiées), et les grands clubs des pays
-- frontaliers — 8 belges, 5 suisses, 7 allemands à moins de 7 h de train de
-- Paris, 10 italiens, 10 espagnols — plus les clubs où joue un international
-- congolais (colonne `leopard` : l'accroche éditoriale, et le pont vers le fil
-- rouge CAN 2027).
--
-- Le cycle d'une piste est fait de faits qui ne redescendent pas :
--   au vivier -> en fournée (choisie une semaine) -> contactée (date posée).
-- « Contactée » est un fait daté, jamais un compteur stocké. Reposer une piste
-- (en_fournee = false) est le seul retour en arrière, et c'est un choix, pas
-- un échec.

create table public.pistes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  division text not null check (division in
    ('ligue1', 'ligue2', 'ligue3', 'belgique', 'suisse', 'allemagne', 'italie', 'espagne')),
  leopard text,
  en_fournee boolean not null default false,
  date_contacte date,
  contact_id uuid references public.contacts(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.pistes is
  'Le vivier de la Passerelle : les clubs à contacter, définis avec Noé le 15 août 2026.';
comment on column public.pistes.leopard is
  'L''international congolais qui y joue — l''accroche, et le pont vers la CAN 2027.';
comment on column public.pistes.en_fournee is
  'Choisie pour la fournée de la semaine. Redevient false si Noé la repose — jamais par le temps qui passe.';
comment on column public.pistes.date_contacte is
  'Le jour du premier message au club. Un fait accompli : ne s''efface pas.';
comment on column public.pistes.contact_id is
  'La fiche du réseau née de cette piste, s''il y en a une.';

-- Sécurité : même modèle que toutes les tables — RLS, tout réservé à
-- `authenticated`, rien pour `anon`.

alter table public.pistes enable row level security;

create policy "pistes_select_authenticated" on public.pistes
  for select to authenticated using (true);
create policy "pistes_insert_authenticated" on public.pistes
  for insert to authenticated with check (true);
create policy "pistes_update_authenticated" on public.pistes
  for update to authenticated using (true) with check (true);
create policy "pistes_delete_authenticated" on public.pistes
  for delete to authenticated using (true);

grant select, insert, update, delete on public.pistes to authenticated;

-- `journal_envois.contact_id` est déjà nullable : un premier message parti au
-- compte d'un club, sans personne nommée, compte comme un envoi — le compteur
-- mesure l'effort, pas le carnet d'adresses.

-- ---------------------------------------------------------------------------
-- Le vivier : 97 clubs. Des données publiques (des noms de clubs), pas des
-- données personnelles — elles peuvent vivre dans le dépôt.

insert into public.pistes (nom, division, leopard) values
  -- Ligue 1 2026-2027 (18)
  ('Paris Saint-Germain', 'ligue1', null),
  ('Olympique de Marseille', 'ligue1', null),
  ('Olympique Lyonnais', 'ligue1', null),
  ('AS Monaco', 'ligue1', null),
  ('LOSC Lille', 'ligue1', null),
  ('OGC Nice', 'ligue1', null),
  ('RC Lens', 'ligue1', null),
  ('Stade Rennais', 'ligue1', null),
  ('RC Strasbourg', 'ligue1', null),
  ('Toulouse FC', 'ligue1', null),
  ('Stade Brestois', 'ligue1', null),
  ('AJ Auxerre', 'ligue1', null),
  ('Angers SCO', 'ligue1', null),
  ('Le Havre AC', 'ligue1', null),
  ('Paris FC', 'ligue1', null),
  ('FC Lorient', 'ligue1', null),
  ('ESTAC Troyes', 'ligue1', null),
  ('Le Mans FC', 'ligue1', null),
  -- Ligue 2 2026-2027 (18)
  ('AS Saint-Étienne', 'ligue2', null),
  ('FC Nantes', 'ligue2', null),
  ('FC Metz', 'ligue2', null),
  ('Stade de Reims', 'ligue2', null),
  ('Montpellier HSC', 'ligue2', null),
  ('EA Guingamp', 'ligue2', null),
  ('Stade Lavallois', 'ligue2', null),
  ('FC Annecy', 'ligue2', null),
  ('Pau FC', 'ligue2', null),
  ('USL Dunkerque', 'ligue2', null),
  ('Grenoble Foot 38', 'ligue2', null),
  ('Clermont Foot 63', 'ligue2', null),
  ('AS Nancy-Lorraine', 'ligue2', null),
  ('US Boulogne', 'ligue2', null),
  ('Rodez AF', 'ligue2', null),
  ('Red Star FC', 'ligue2', null),
  ('Dijon FCO', 'ligue2', null),
  ('FC Sochaux-Montbéliard', 'ligue2', null),
  -- Ligue 3 2026-2027 (18)
  ('Amiens SC', 'ligue3', null),
  ('SC Aubagne Air-Bel', 'ligue3', null),
  ('SC Bastia', 'ligue3', null),
  ('Bourg-en-Bresse 01', 'ligue3', null),
  ('SM Caen', 'ligue3', null),
  ('AS Cannes', 'ligue3', null),
  ('US Concarneau', 'ligue3', null),
  ('FC Fleury 91', 'ligue3', null),
  ('La Roche-sur-Yon VF', 'ligue3', null),
  ('Le Puy Foot 43', 'ligue3', null),
  ('US Orléans', 'ligue3', null),
  ('Paris 13 Atlético', 'ligue3', null),
  ('Quevilly Rouen Métropole', 'ligue3', null),
  ('FC Rouen', 'ligue3', null),
  ('US Thionville Lusitanos', 'ligue3', null),
  ('Valenciennes FC', 'ligue3', null),
  ('FC Versailles', 'ligue3', null),
  ('FC Villefranche-Beaujolais', 'ligue3', null),
  -- Belgique (8)
  ('RSC Anderlecht', 'belgique', null),
  ('Club Bruges', 'belgique', null),
  ('Union Saint-Gilloise', 'belgique', null),
  ('KRC Genk', 'belgique', null),
  ('Royal Antwerp', 'belgique', null),
  ('La Gantoise', 'belgique', null),
  ('Standard de Liège', 'belgique', 'Matthieu Epolo'),
  ('Sporting Charleroi', 'belgique', null),
  -- Suisse (5 + le club Léopard)
  ('BSC Young Boys', 'suisse', null),
  ('FC Bâle', 'suisse', null),
  ('FC Zurich', 'suisse', null),
  ('Servette FC', 'suisse', null),
  ('FC Lugano', 'suisse', null),
  ('FC Sion', 'suisse', 'Timothy Fayulu'),
  -- Allemagne (7 à moins de 7 h de train + le club Léopard)
  ('Bayern Munich', 'allemagne', null),
  ('Borussia Dortmund', 'allemagne', null),
  ('Bayer Leverkusen', 'allemagne', null),
  ('Eintracht Francfort', 'allemagne', null),
  ('VfB Stuttgart', 'allemagne', null),
  ('Borussia Mönchengladbach', 'allemagne', null),
  ('FC Cologne', 'allemagne', null),
  ('FC Augsburg', 'allemagne', 'Nathanaël Mbuku'),
  -- Italie (10)
  ('Inter Milan', 'italie', null),
  ('AC Milan', 'italie', null),
  ('Juventus', 'italie', null),
  ('SSC Naples', 'italie', null),
  ('AS Roma', 'italie', null),
  ('Lazio Rome', 'italie', null),
  ('Atalanta Bergame', 'italie', null),
  ('Fiorentina', 'italie', null),
  ('Bologne FC', 'italie', null),
  ('Torino FC', 'italie', null),
  -- Espagne (10 + le club Léopard, en D2 mais c'est le joueur qui compte)
  ('Real Madrid', 'espagne', null),
  ('FC Barcelone', 'espagne', null),
  ('Atlético de Madrid', 'espagne', null),
  ('Athletic Bilbao', 'espagne', null),
  ('Real Sociedad', 'espagne', null),
  ('Séville FC', 'espagne', null),
  ('Real Betis', 'espagne', null),
  ('Villarreal CF', 'espagne', null),
  ('Valence CF', 'espagne', null),
  ('Celta Vigo', 'espagne', null),
  ('UD Almería', 'espagne', 'Brian Cipenga');
