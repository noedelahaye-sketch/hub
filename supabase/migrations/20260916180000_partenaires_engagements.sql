-- LE SUIVI DES ENGAGEMENTS PARTENAIRES (16 septembre 2026, demande de Noé) :
-- « pour un partenaire qui a pris un pack esprit collectif, avoir la liste des
-- choses que l'on doit faire de notre côté (vignette album, panneau…) pour
-- assurer un bon suivi ».
--
-- POURQUOI EN BASE ET PAS DANS LE DÉPÔT, et il y a DEUX raisons qui vont dans
-- le même sens :
--   1. ÇA SE COCHE. C'est le critère du hub depuis `js/club-fch.js` : ce qui ne
--      change pas et ne se coche pas vit dans le dépôt, le reste en base. Un
--      engagement se fait, à une date, et c'est tout l'objet de l'écran.
--   2. LE DÉPÔT EST PUBLIC. Les montants, les CERFA, les notes de négociation
--      et les coordonnées ne le sont pas. Le CATALOGUE des offres, lui, reste
--      dans le dépôt (`js/partenaires-fch.js`) : c'est le dossier qu'on envoie
--      aux entreprises, il est public par nature.
--
-- POURQUOI UNE TABLE À PART DE `contacts`. Un contact est une PERSONNE ou une
-- structure du carnet, partagée avec Yuno ; un partenariat est un ENGAGEMENT
-- d'une saison, avec son montant et sa liste de choses à faire. La même
-- entreprise peut être partenaire deux saisons de suite, avec deux offres
-- différentes — une ligne par saison, et le contact reste le même. D'où le lien
-- facultatif vers `contacts` plutôt qu'une fusion.

create table if not exists partenaires (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  -- La fiche du réseau, quand elle existe. `on delete set null` : perdre le
  -- contact ne doit pas effacer un partenariat signé.
  contact_id uuid references contacts(id) on delete set null,
  saison text not null default '2026-2027',
  -- La clé du catalogue (`esprit-collectif`, `mecenat`…). Pas de contrainte sur
  -- les valeurs : le catalogue vit dans le dépôt et change chaque année, un
  -- CHECK en base vieillirait au premier nouveau pack.
  offre text,
  nature text not null default 'pack'
    check (nature in ('pack', 'panneau', 'maillot', 'mecenat', 'autre')),
  -- Le montant RÉELLEMENT convenu, qui n'est pas toujours celui de l'offre :
  -- La Milanaise donne 650 € pour un pack à 800, Le BM 500 € pour un pack à
  -- 250. C'est la somme négociée qui compte, pas le tarif du dossier.
  montant numeric(10,2),
  statut text not null default 'virement_attendu'
    check (statut in ('virement_attendu', 'partenaire')),
  cerfa text,
  referents text,
  commune text,
  -- « ne souhaite pas être mentionné » : deux mécènes du tableau le demandent.
  -- Sans cette colonne, l'écran proposerait de leur faire une publication et
  -- une vignette, c'est-à-dire exactement ce qu'ils ont refusé.
  discret boolean not null default false,
  notes text,
  created_at timestamptz default now()
);

-- UN ENGAGEMENT EST UNE CHOSE À FAIRE DE NOTRE CÔTÉ, et une seule.
create table if not exists partenaires_engagements (
  id uuid primary key default gen_random_uuid(),
  partenaire_id uuid not null references partenaires(id) on delete cascade,
  -- La clé du catalogue quand il en vient, libre sinon (« naming du tournoi
  -- futsal jeunes » pour MAX ELEC, qui n'existe dans aucun pack).
  cle text,
  -- LE LIBELLÉ EST STOCKÉ, pas déduit du catalogue. Un engagement doit pouvoir
  -- se relire dans dix mois tel qu'il a été pris : si le dossier de la saison
  -- suivante reformule ses lignes, ce qu'on a promis cette année ne doit pas
  -- changer de mots dans le dos de Noé.
  libelle text not null,
  detail text,
  -- `offre` : la ligne vient du pack, elle est dans le dossier signé.
  -- `ajout` : elle a été négociée — MG+ prend le pack Ambition et obtient en
  -- plus le naming du Tournoi Rose. Les distinguer, c'est savoir ce qu'on peut
  -- justifier par le dossier et ce qui ne vit que dans les notes.
  origine text not null default 'offre' check (origine in ('offre', 'ajout')),
  fait_le date,
  created_at timestamptz default now()
);

create index if not exists partenaires_engagements_partenaire
  on partenaires_engagements (partenaire_id);

alter table partenaires enable row level security;
alter table partenaires_engagements enable row level security;

drop policy if exists "partenaires authentifies" on partenaires;
create policy "partenaires authentifies" on partenaires
  for all to authenticated using (true) with check (true);

drop policy if exists "engagements authentifies" on partenaires_engagements;
create policy "engagements authentifies" on partenaires_engagements
  for all to authenticated using (true) with check (true);

-- LA POLITIQUE NE SUFFIT PAS : RLS filtre des LIGNES, le GRANT ouvre la TABLE.
-- Sans lui, Postgres refuse avant même de regarder la politique — « permission
-- denied for table partenaires », et l'écran entier ne se charge plus. Les
-- autres tables du hub l'ont depuis leur création, c'est pour ça que le piège
-- ne s'était encore jamais vu. `anon` n'a rien, comme partout ailleurs.
grant select, insert, update, delete on table partenaires to authenticated;
grant select, insert, update, delete on table partenaires_engagements to authenticated;
