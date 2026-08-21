-- Une commande vise un événement (décision de Noé, 21 août 2026 au soir —
-- l'option A de la réorganisation des Missions).
--
-- « Ce sera souvent lié à des matchs ou des événements concrets, pas des
-- projets sur de longs mois » : le travail payé d'un photographe de terrain a
-- presque toujours une date et un lieu — un match à couvrir, un concert. Le
-- lien fait de l'ÉVÉNEMENT le pivot : la préparation se rattache à lui, la
-- commande vient avec, et le Journal en garde le vécu.
--
-- SET NULL : une commande sans événement reste possible (retouche pure, un
-- tirage), et supprimer l'événement ne supprime pas le travail commandé.

alter table public.commandes add column evenement_id uuid
  references public.evenements(id) on delete set null;

comment on column public.commandes.evenement_id is
  'L''événement que la commande vise (match, concert). NULL = commande hors événement.';

create index commandes_evenement_idx on public.commandes (evenement_id);
