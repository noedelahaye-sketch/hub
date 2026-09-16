-- UNE IDÉE EST UN FORMAT, PAS UN CONTENU À FAIRE UNE FOIS (16 septembre 2026,
-- règle posée par Noé : « une idée doit être reproductible, ce n'est pas
-- seulement un contenu à faire une fois — par exemple le avant/après est
-- reproductible plusieurs fois, donc une fois qu'il a été fait il ne doit pas
-- disparaître. Cependant il peut y avoir des publications qui sont moins
-- répétables, par exemple mon histoire, mon matériel. »)
--
-- CE QUE ÇA RÉPARE, ET C'ÉTAIT UNE CONFUSION DE MODÈLE : jusqu'ici, programmer
-- une idée posait sa date SUR SA PROPRE LIGNE. L'idée DEVENAIT la parution,
-- donc elle quittait la banque, et une fois publiée elle n'y revenait jamais.
-- « How I edited this pic : avant / après » se refait dix fois ; il sortait de
-- la réserve à la première.
--
-- LA RÉPONSE EST CELLE DES SÉRIES DU HUB (27 août 2026) : « les occurrences
-- sont de VRAIES lignes ». Programmer une idée reproductible fabrique une
-- PARUTION — une publication datée, ordinaire, qui vit au calendrier, compte
-- dans les bilans et porte son lien — et l'idée-mère reste dans la banque,
-- intacte. Ce qui distingue les deux, c'est `idee_mere_id`.
--
-- POURQUOI PAS UNE TABLE DE PARUTIONS À PART : le calendrier éditorial, le
-- bilan du dimanche et « Mon temps » lisent tous `publications.date_prevue`.
-- Une seconde table aurait demandé de les réécrire tous pour un gain nul — une
-- parution EST une publication, elle a juste une mère.

-- REPRODUCTIBLE PAR DÉFAUT, et c'est l'ordre des mots de Noé : une idée est un
-- format ; celle qui ne se refait pas est l'exception qu'on déclare.
--
-- LES LIGNES EXISTANTES PASSENT DONC TOUTES À `true`, parutions déjà sorties
-- comprises. C'est sans effet : le drapeau ne se lit que sur une ligne SANS
-- date, c'est-à-dire sur une idée en banque. Y mettre `false` pour les
-- publications passées aurait demandé de deviner lesquelles étaient des
-- formats — exactement ce que cette colonne existe pour ne plus deviner.
alter table publications
  add column if not exists reproductible boolean not null default true;

-- LA MÈRE D'UNE PARUTION, et `on delete set null` : jeter un format ne jette
-- pas ce qui en est sorti. C'est le raisonnement déjà tenu pour
-- `publications.evenement_id` — « une préparation n'a aucun sens sans son
-- événement ; une publication en a un : elle peut être partie, porter son lien,
-- compter dans un bilan ». Une parution orpheline reste une parution.
alter table publications
  add column if not exists idee_mere_id uuid references publications(id) on delete set null;

-- On remonte d'une parution vers sa mère à chaque rendu de la banque : dix-huit
-- idées, autant de comptes à faire. L'index évite un parcours complet par idée.
create index if not exists publications_idee_mere_idx
  on publications (idee_mere_id) where idee_mere_id is not null;

-- UNE PARUTION NE PEUT PAS ÊTRE SA PROPRE MÈRE. Le cas n'arrive pas par
-- l'écran — la copie est créée après la mère —, mais une contrainte qui ne
-- coûte rien vaut mieux qu'une boucle à déboguer six mois plus tard.
alter table publications drop constraint if exists publications_idee_mere_non_soi;
alter table publications
  add constraint publications_idee_mere_non_soi check (idee_mere_id is distinct from id);
