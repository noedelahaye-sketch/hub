-- Les réunions du FCH (demande de Noé, 21 août 2026).
--
-- Une réunion est une FACE de l'événement, pas une table : le précédent est
-- `type_moment` (Yuno) et la fusion moments/événements. `reunion_objet` non
-- nul dit « cet événement est une réunion » — l'objet EST le marqueur, comme
-- `date_prevue` NULL dit « cette publication est une idée ».
--
-- Les préparations réutilisent les tables de Yuno TELLES QUELLES : une feuille
-- se rattache déjà à n'importe quel événement. Les modèles gagnent trois
-- colonnes : leur projet (ceux de Noé photographe restent chez Yuno), et le
-- couple objet/anime qui permet de proposer d'office le bon modèle — animer un
-- conseil d'administration et y assister sont deux préparations différentes.
--
-- Le bilan d'une réunion n'est PAS le compte-rendu officiel (décision de Noé) :
-- c'est ce qui LE concerne — à retenir, à faire — plus, s'il animait, un regard
-- sur le déroulé. D'où `bilan_animation`, troisième question qui ne s'offre
-- qu'à l'animateur. Les deux premières réutilisent bilan_bien/bilan_mieux, les
-- libellés vivent à l'écran.

alter table public.evenements add column reunion_objet text
  check (reunion_objet in ('ca', 'alternance', 'communication', 'partenariat', 'autre'));
alter table public.evenements add column reunion_animee boolean not null default false;

comment on column public.evenements.reunion_objet is
  'FCH seulement : non nul = cet événement est une réunion, et voilà son objet.';
comment on column public.evenements.reunion_animee is
  'Noé anime la réunion (true) ou y participe (false).';

alter table public.modeles_preparation add column projet text not null default 'photo'
  check (projet in ('formation', 'photo', 'fch', 'perso'));
alter table public.modeles_preparation add column objet text
  check (objet in ('ca', 'alternance', 'communication', 'partenariat', 'autre'));
alter table public.modeles_preparation add column anime boolean;

comment on column public.modeles_preparation.projet is
  'Chaque site ne montre que ses modèles. Les modèles nés avec Yuno restent à photo.';
comment on column public.modeles_preparation.objet is
  'FCH : l''objet de réunion auquel ce modèle répond. Sert à proposer le bon modèle d''office.';
comment on column public.modeles_preparation.anime is
  'FCH : modèle pour l''animateur (true), le participant (false), ou peu importe (null).';

alter table public.preparations add column bilan_animation text;

comment on column public.preparations.bilan_animation is
  'Réunion animée seulement : comment le déroulé s''est passé, ce que j''améliore.';

-- ---------------------------------------------------------------------------
-- Les modèles de départ, semés en dur : la préparation de réunion est un
-- savoir-faire, pas une liste vide. Noé les corrige ensuite dans l'interface,
-- comme les modèles de Yuno — modifier un modèle ne réécrit jamais les
-- feuilles passées, elles ont copié leurs items.

with m as (
  insert into public.modeles_preparation (nom, projet, objet, anime)
  values ('CA · j''anime', 'fch', 'ca', true)
  returning id
)
insert into public.modeles_preparation_items (modele_id, phase, texte, ordre)
select id, phase, texte, ordre from m, (values
  ('avant', 'Écrire l''objectif : les décisions attendues, en une phrase', 1),
  ('avant', 'Construire l''ordre du jour minuté, le plus important d''abord', 2),
  ('avant', 'Envoyer convocation, ordre du jour et documents une semaine avant', 3),
  ('avant', 'Repérer les points sensibles, et qui les portera', 4),
  ('avant', 'Préparer la salle ou le lien visio, tester le matériel', 5),
  ('pendant', 'Ouvrir par l''objectif et l''heure de fin — et s''y tenir', 1),
  ('pendant', 'Tenir le minutage, ramener les digressions à l''ordre du jour', 2),
  ('pendant', 'Faire parler ceux qui ne se sont pas exprimés', 3),
  ('pendant', 'Reformuler chaque décision à voix haute avant de passer', 4),
  ('pendant', 'Noter chaque décision : quoi, qui, pour quand', 5),
  ('apres', 'Envoyer le relevé de décisions sous 48 h', 1),
  ('apres', 'Vérifier que chaque action a un responsable et une date', 2),
  ('apres', 'Écrire le bilan pendant que c''est chaud', 3)
) as items(phase, texte, ordre);

with m as (
  insert into public.modeles_preparation (nom, projet, objet, anime)
  values ('CA · j''y assiste', 'fch', 'ca', false)
  returning id
)
insert into public.modeles_preparation_items (modele_id, phase, texte, ordre)
select id, phase, texte, ordre from m, (values
  ('avant', 'Lire les documents envoyés', 1),
  ('avant', 'Noter mes questions, point par point de l''ordre du jour', 2),
  ('avant', 'Préparer ce que je dois présenter ou défendre', 3),
  ('pendant', 'Noter les décisions qui touchent la communication', 1),
  ('pendant', 'Poser mes questions au bon point de l''ordre du jour', 2),
  ('pendant', 'Noter ce qu''on me confie : quoi, pour quand', 3),
  ('apres', 'Relire mes notes à chaud, compléter ce qui manque', 1),
  ('apres', 'Écrire le bilan et en tirer mes tâches', 2)
) as items(phase, texte, ordre);

with m as (
  insert into public.modeles_preparation (nom, projet, objet, anime)
  values ('Point alternance', 'fch', 'alternance', false)
  returning id
)
insert into public.modeles_preparation_items (modele_id, phase, texte, ordre)
select id, phase, texte, ordre from m, (values
  ('avant', 'Préparer le bilan de période : fait, en cours, bloqué', 1),
  ('avant', 'Relire mes objectifs d''alternance et pointer l''avancement', 2),
  ('avant', 'Lister mes questions : missions, école, matériel', 3),
  ('avant', 'Choisir deux réalisations à montrer', 4),
  ('pendant', 'Présenter l''avancement avec les exemples', 1),
  ('pendant', 'Noter les retours tels qu''ils sont dits — matière pour les dossiers', 2),
  ('pendant', 'Clarifier les attentes de la période suivante', 3),
  ('apres', 'Consigner les retours au propre', 1),
  ('apres', 'Mettre à jour jalons et objectifs', 2),
  ('apres', 'Écrire le bilan et en tirer mes tâches', 3)
) as items(phase, texte, ordre);

with m as (
  insert into public.modeles_preparation (nom, projet, objet, anime)
  values ('Réunion communication · j''anime', 'fch', 'communication', true)
  returning id
)
insert into public.modeles_preparation_items (modele_id, phase, texte, ordre)
select id, phase, texte, ordre from m, (values
  ('avant', 'Rassembler les chiffres depuis le dernier point', 1),
  ('avant', 'Préparer le calendrier éditorial à faire valider', 2),
  ('avant', 'Lister les décisions à obtenir', 3),
  ('avant', 'Envoyer l''ordre du jour', 4),
  ('pendant', 'Présenter les résultats simplement, sans jargon', 1),
  ('pendant', 'Faire valider le calendrier, noter les corrections', 2),
  ('pendant', 'Reformuler chaque validation obtenue', 3),
  ('apres', 'Mettre à jour le calendrier éditorial', 1),
  ('apres', 'Envoyer le récapitulatif', 2),
  ('apres', 'Écrire le bilan et en tirer mes tâches', 3)
) as items(phase, texte, ordre);

with m as (
  insert into public.modeles_preparation (nom, projet, objet, anime)
  values ('Rendez-vous partenaire', 'fch', 'partenariat', true)
  returning id
)
insert into public.modeles_preparation_items (modele_id, phase, texte, ordre)
select id, phase, texte, ordre from m, (values
  ('avant', 'Se renseigner : activité, actualités, liens avec le club', 1),
  ('avant', 'Écrire l''objectif du rendez-vous en une phrase', 2),
  ('avant', 'Préparer l''offre : contreparties et montants', 3),
  ('avant', 'Préparer les réponses aux objections probables', 4),
  ('pendant', 'Écouter d''abord : ses enjeux, ses attentes', 1),
  ('pendant', 'Présenter l''offre en la reliant à ce qu''il a dit', 2),
  ('pendant', 'Noter les objections sans les combattre sur-le-champ', 3),
  ('pendant', 'Convenir de la suite avant de se quitter : quoi, qui, quand', 4),
  ('apres', 'Envoyer le récapitulatif sous 24 h', 1),
  ('apres', 'Mettre à jour la fiche partenaire', 2),
  ('apres', 'Écrire le bilan et en tirer mes tâches', 3)
) as items(phase, texte, ordre);

with m as (
  insert into public.modeles_preparation (nom, projet, objet, anime)
  values ('Réunion · les essentiels', 'fch', 'autre', null)
  returning id
)
insert into public.modeles_preparation_items (modele_id, phase, texte, ordre)
select id, phase, texte, ordre from m, (values
  ('avant', 'Clarifier pourquoi j''y vais, et ce que je dois en sortir', 1),
  ('avant', 'Lire ce qui a été envoyé', 2),
  ('avant', 'Noter mes questions', 3),
  ('pendant', 'Noter décisions et engagements : quoi, qui, quand', 1),
  ('pendant', 'Poser mes questions', 2),
  ('apres', 'Relire mes notes à chaud', 1),
  ('apres', 'Écrire le bilan et en tirer mes tâches', 2)
) as items(phase, texte, ordre);
