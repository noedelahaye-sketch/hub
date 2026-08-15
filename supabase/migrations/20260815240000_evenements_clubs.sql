-- Un match relie deux clubs du vivier (demande de Noé, 15 août 2026).
--
-- Le besoin : poser « Sochaux – Guingamp » au calendrier sans écrire les deux
-- noms, et sans que le titre devienne prisonnier du lien. La réponse tient en
-- une règle, déjà éprouvée ici par les préparations : **le titre est COPIÉ à la
-- création, pas dérivé**. Il naît de l'affiche choisie, puis il vit sa vie —
-- « Sochaux, ma première accréditation L2 » reste relié aux deux clubs, et
-- corriger un lien ne réécrit jamais le titre.
--
-- Deux colonnes plutôt qu'une table de liaison : un match a exactement deux
-- clubs, et Noé n'a pas d'autre besoin en vue (les concerts n'ont pas de club).
-- Le jour où une salle ou un festival devra être relié, la table de liaison
-- restera possible — elle ne coûtera que la reprise de ces deux colonnes.
--
-- ON DELETE SET NULL : retirer un club du vivier ne doit pas emporter les
-- matchs qu'on a couverts. L'événement survit, il perd son lien.

alter table public.evenements
  add column club_recevant uuid references public.pistes(id) on delete set null,
  add column club_visiteur uuid references public.pistes(id) on delete set null;

comment on column public.evenements.club_recevant is
  'Le club qui reçoit, quand l''événement est un match. NULL partout ailleurs.';
comment on column public.evenements.club_visiteur is
  'Le club qui se déplace. NULL partout ailleurs.';

-- La lecture fréquente : les matchs d'un club, dans sa fiche.
create index evenements_club_recevant_idx on public.evenements (club_recevant);
create index evenements_club_visiteur_idx on public.evenements (club_visiteur);
