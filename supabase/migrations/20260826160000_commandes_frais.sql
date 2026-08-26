-- Ce qu'une prestation a COÛTÉ, à côté de ce qu'elle a rapporté (demande de
-- Noé, 26 août 2026).
--
-- Un match photographié à 150 € avec 40 € d'essence n'a pas remboursé 150 € de
-- matériel : il en a remboursé 110. Sans cette colonne, l'objectif « Rembourser
-- mon matériel » comptait une somme que Noé n'a jamais eue en poche.
--
-- Conséquence : la progression de l'objectif se calcule désormais en NET
-- (montant − frais), et non plus sur le montant seul (voir `argentDeYuno`,
-- js/photo.js).
--
-- Une sortie non payée qui a coûté un déplacement se note de la même façon :
-- une prestation à 0 € avec ses frais. C'est ce qui évite une seconde colonne
-- sur `evenements` pour dire la même chose.

alter table commandes
  add column if not exists frais numeric(10, 2) check (frais >= 0);

comment on column public.commandes.frais is
  'Ce que la prestation a coûté — déplacement, péage, repas. Le net (montant − frais) est ce qui rembourse le matériel.';
