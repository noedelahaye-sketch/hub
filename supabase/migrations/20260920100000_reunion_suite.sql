-- LA CHAÎNE DES RÉUNIONS (20 septembre 2026, demande de Noé : « dans le compte
-- rendu, lorsque je mets une date de prochaine réunion, il faut que ça crée
-- l'évènement à cette date avec le même nom que la dernière réunion + le numéro
-- — pour la réunion Lina du 18 septembre, j'ai mis que la prochaine serait le
-- 25, donc au 25 un évènement "Réunion Lina 2" doit être créé, et donc être lié
-- à la réunion du 18 pour que ma préparation soit aidée par le compte-rendu de
-- la dernière réunion »).
--
-- C'EST LA RÈGLE DU HUB APPLIQUÉE À LA LETTRE : « ce qu'il a DÉCLARÉ devient
-- une vraie ligne, ce que le hub DÉDUIT devient un message ». Poser une date de
-- prochain point de contrôle est une DÉCLARATION — personne ne la devine —,
-- elle donne donc un vrai évènement, qui se déplace, se prépare, porte sa fiche
-- et apparaît au calendrier. Pas une ligne d'affichage qui saurait faire aucune
-- de ces choses.
--
-- CE QUE `cr_suivi` DEVIENT : elle disait déjà « quand vérifie-t-on que les
-- décisions vivent ? » et ne servait qu'à être relue. Elle garde son sens ; ce
-- qui change, c'est qu'elle POSE désormais ce rendez-vous au lieu de l'annoncer.

-- LE LIEN EST PORTÉ PAR L'ENFANT, comme partout ailleurs dans le hub
-- (`taches.evenement_id`, `publications.evenement_id`, `fiches_reunion
-- .evenement_id`) : la suite pointe vers ce dont elle est la suite.
--
-- SUR `evenements` ET NON SUR `fiches_reunion`, et c'est ce qui le rend
-- solide : au moment où la suite naît, elle n'a PAS ENCORE de fiche — sa fiche
-- se créera plus tard, quand Noé appuiera sur « Préparer ». Une chaîne accrochée
-- aux fiches aurait donc un maillon manquant précisément là où on en a besoin.
-- Et elle survit à la suppression d'une fiche : la suite des réunions est une
-- histoire du club, pas une annexe de ses feuilles.
--
-- `on delete set null` : supprimer la réunion de septembre ne supprime pas
-- celle d'octobre. Elle perd sa mère, elle reste au calendrier — c'est le
-- raisonnement de `publications.evenement_id`, au mot près.
alter table evenements
  add column if not exists suite_de_id uuid references evenements(id) on delete set null;

comment on column public.evenements.suite_de_id is
  'Réunions FCH : l''évènement dont celui-ci est la suite, né de son `cr_suivi`. Porte la chaîne — c''est elle qui donne le numéro du titre et qui remonte au compte-rendu précédent.';

-- On remonte la chaîne à chaque rendu d'une fiche (pour retrouver le
-- compte-rendu précédent) et à chaque enregistrement d'un compte-rendu (pour
-- savoir si la suite existe déjà). L'index évite un parcours complet.
create index if not exists evenements_suite_de_idx
  on evenements (suite_de_id) where suite_de_id is not null;

-- UNE RÉUNION NE PEUT PAS ÊTRE SA PROPRE SUITE. Le cas n'arrive pas par
-- l'écran — la suite est créée après sa mère —, mais une contrainte qui ne
-- coûte rien vaut mieux qu'une boucle infinie à déboguer six mois plus tard.
-- Elle ne protège QUE du cycle à un maillon ; la remontée de la chaîne porte sa
-- propre borne, parce qu'un CHECK ne sait pas voir un cycle plus long.
alter table evenements drop constraint if exists evenements_suite_non_soi;
alter table evenements
  add constraint evenements_suite_non_soi check (suite_de_id is distinct from id);
