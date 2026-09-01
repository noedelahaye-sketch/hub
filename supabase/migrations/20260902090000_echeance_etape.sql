-- UNE ÉTAPE PEUT PORTER UNE DATE (2 septembre 2026, décision de Noé).
--
-- CE QUE ÇA RENVERSE, ET IL FAUT LE DIRE. Le 29 août, la table est née SANS
-- échéance, et pour une raison écrite : « une étape découpe le TRAVAIL, pas le
-- calendrier ; ce sont les tâches qui portent les dates ». C'était la
-- différence entre une étape et un jalon.
--
-- La page d'un projet demande de POSER ses étapes et ses tâches sur un
-- calendrier, en les glissant. Deux façons de répondre : glisser une étape crée
-- une tâche qui la porte, ou l'étape reçoit elle-même un jour. Noé a tranché
-- pour la seconde — la plus directe, celle où ce qu'on glisse est ce qu'on
-- retrouve.
--
-- Ce qui NE change pas : l'étape reste le découpage du travail, elle se franchit
-- et elle s'ordonne. Elle gagne un jour ; elle ne gagne ni durée, ni heure, ni
-- statut. Et elle reste FACULTATIVE — un découpage qui n'a pas encore de jour
-- est un découpage, pas un retard.
alter table public.projets_etapes add column if not exists echeance date;

comment on column public.projets_etapes.echeance is
  'Le jour où l''on compte s''y mettre. Facultatif, et posé le plus souvent en glissant l''étape sur le calendrier de son projet (2 septembre 2026).';
