-- Le lien dur entre le vécu et le prévu (demande de Noé, 14 août 2026).
--
-- 1. Un événement Yuno porte le TYPE du moment qui en naîtra (match, concert,
--    sortie, autre) — choisi à la création de l'événement, par une pastille
--    offerte quand le projet est photo. NULL partout ailleurs, et NULL aussi
--    pour les événements photo d'avant cette migration : le site retombe
--    alors sur « match », le cas ordinaire de Noé.
-- 2. Un moment peut pointer son événement. C'est ce qui permet au bilan d'une
--    préparation de créer LE moment de la sortie sans jamais faire de doublon,
--    et à l'invite du carnet de se taire quand le moment existe déjà.
--    SET NULL : supprimer l'événement ne retire rien du carnet — le vécu ne
--    dépend pas de l'agenda.

alter table public.evenements add column type_moment text
  check (type_moment in ('match', 'concert', 'sortie', 'autre'));

comment on column public.evenements.type_moment is
  'Yuno seulement : le type du moment qui naîtra de cette sortie. NULL = match par défaut à la création du moment.';

alter table public.moments add column evenement_id uuid
  references public.evenements(id) on delete set null;

comment on column public.moments.evenement_id is
  'L''événement vécu, quand le moment en vient — posé par le bilan d''une préparation ou par l''invite du carnet.';

create index moments_evenement_idx on public.moments (evenement_id);
