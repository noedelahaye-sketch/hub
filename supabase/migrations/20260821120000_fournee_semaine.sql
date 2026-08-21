-- La fournée devient hebdomadaire pour de vrai (décision de Noé, 21 août 2026).
--
-- La spec du site promettait « la fournée se vide d'elle-même au changement de
-- semaine » ; le commentaire de `en_fournee` disait l'inverse (« jamais par le
-- temps qui passe ») — et c'est lui que le code suivait : rien ne vidait
-- jamais la fournée. Noé a tranché : les clubs choisis en semaine N ne doivent
-- plus s'afficher en semaine N+1.
--
-- D'où cette colonne : le LUNDI de la semaine où le club a été choisi, posée
-- dans le même geste que `en_fournee = true`. Au chargement, le site repère
-- les fournées d'une semaine passée et les repose au vivier — le site est
-- statique, il n'a pas de minuit à lui : c'est la première visite de la
-- semaine qui fait le ménage. Un club contacté sort aussi : sa carte n'était
-- gardée que pour finir la semaine en voyant le chemin parcouru.

alter table public.pistes add column fournee_semaine date;

comment on column public.pistes.fournee_semaine is
  'Le lundi de la semaine où le club a été choisi. Posée avec en_fournee = true ; une semaine passée = la fournée est finie, le site la vide au chargement.';

comment on column public.pistes.en_fournee is
  'Choisie pour la fournée de la semaine. Redevient false si Noé la repose, ou au changement de semaine (via fournee_semaine) — décision du 21 août 2026.';

-- Les clubs déjà en fournée ont été choisis le 15 août 2026 : leur semaine est
-- celle du lundi 10. Ils se videront donc au premier chargement — c'est la
-- demande : on est déjà dans leur semaine N+1.
update public.pistes set fournee_semaine = '2026-08-10' where en_fournee;
