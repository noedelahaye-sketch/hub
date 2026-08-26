-- Le matériel de Yuno, et ce qu'il reste à rembourser (demande de Noé,
-- 26 août 2026).
--
-- L'objectif « Rembourser mon matériel » avait une cible écrite en dur —
-- « 5 000 € » — que rien ne mesurait : la table `commandes` était vide, et
-- aucune table ne disait ce que le matériel avait coûté. Une barre qui ne peut
-- pas bouger n'est pas un objectif, c'est un reproche silencieux.
--
-- Désormais les deux bouts existent en base et l'objectif se calcule :
--   cible        = somme des prix du matériel
--   progression  = somme des montants encaissés (commandes livrées)
--
-- Conséquence voulue : acheter un objectif à 800 € relève la cible tout seul.
-- C'est ce qu'on veut — l'objectif suit l'activité, il ne la précède pas.

create table if not exists materiel (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  -- En euros. `numeric` et non `float` : on additionne de l'argent, et deux
  -- centimes perdus dans un arrondi binaire sont deux centimes de trop.
  prix        numeric(10, 2) not null check (prix >= 0),
  date_achat  date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Pas de colonne `projet` : le matériel est celui de Yuno, comme `commandes`
-- et pour la même raison. Une colonne qui n'aurait jamais qu'une valeur ne
-- documente rien.

alter table materiel enable row level security;

create policy "materiel authentifie" on materiel
  for all to authenticated using (true) with check (true);

-- La politique dit QUI a le droit, le GRANT dit que le rôle peut toucher la
-- table. Les deux sont nécessaires : une table créée en SQL n'hérite pas des
-- privilèges que le tableau de bord Supabase pose tout seul, et sans cette
-- ligne PostgREST répond « permission denied » avant même de lire la
-- politique. Les mêmes droits que `commandes`, ni plus ni moins.
grant select, insert, update, delete on table public.materiel to authenticated;

-- Les trois jalons chiffrés de « Rembourser mon matériel » s'en vont (décision
-- de Noé, 26 août 2026) : la cible bougeant à chaque achat, un palier à
-- 5 000 € cesserait d'être l'arrivée dès le premier objectif acheté. Les euros
-- se disent maintenant par le compteur, toujours juste ; les jalons gardent le
-- chemin — l'offre, le premier client, les terrains testés.
delete from jalons
 where objectif_id in (select id from objectifs where titre = 'Rembourser mon matériel')
   and titre in ('1 000 € cumulés', '2 500 € cumulés', '5 000 € — matériel remboursé');

-- La cible n'est plus une phrase : elle se calcule. On la vide plutôt que de
-- laisser un chiffre qui mentira au premier achat.
update objectifs
   set cible = null
 where titre = 'Rembourser mon matériel';
