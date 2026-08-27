-- « À L'ANNÉE » : un second état d'« en cours » (demande de Noé, 28 août 2026).
--
-- Certains projets ne finissent pas. « Programmation de la semaine »,
-- « Anniversaires du mois » : ce sont des rythmes, pas des chantiers — ils
-- portent une charge HEBDOMADAIRE (`charge_hebdo`) et non une charge totale, et
-- la table le sait depuis sa création. Il leur manquait le mot pour le dire.
--
-- C'est un état d'AVANCEMENT, pas une catégorie à part : quand Noé cherche ce
-- qui est en cours, « à l'année » en fait partie. Les deux se rangent donc au
-- même rang dans le tri, portent la même couleur (le bleu), et ne se
-- distinguent que par leur mot.
--
-- Un CHECK s'élargit, il ne se resserre jamais : les cinq valeurs d'avant
-- restent acceptées. `en_pause` et `abandonne` ne sont plus offerts à l'écran
-- depuis le 28 août, mais rien n'oblige la base à l'oublier.

alter table public.projets drop constraint if exists projets_statut_check;

alter table public.projets add constraint projets_statut_check
  check (statut in ('idee', 'actif', 'annuel', 'en_pause', 'termine', 'abandonne'));

comment on column public.projets.statut is
  'Où en est le projet. Quatre valeurs offertes à l''écran : idee (pas commencé), actif (en cours), annuel (à l''année — un rythme qui ne finit pas, second état d''« en cours »), termine. en_pause et abandonne restent acceptés mais ne sont plus écrits.';
