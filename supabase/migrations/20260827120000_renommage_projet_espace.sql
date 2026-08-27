-- Renommage : la colonne `projet` devient `espace`.
--
-- Pourquoi : le mot « projet » change de sens dans le hub. Il désignait les
-- quatre domaines (formation, photo, fch, perso) ; ceux-ci s'appellent
-- désormais des ESPACES, et « projet » est réservé au nouvel étage entre le
-- jalon et la tâche — le comment on atteint un cap (l'album du club, l'équipe
-- com avec Lina, le deuxième dossier). Voir docs/orientation-spec.md § 1.
--
-- Sans ce renommage, `tache.projet` (l'espace) et `tache.projet_id` (le projet)
-- cohabiteraient : une confusion permanente, dans 400 endroits.
--
-- Les valeurs ne bougent pas, les CHECK non plus. Seuls les noms changent.

alter table objectifs            rename column projet to espace;
alter table taches               rename column projet to espace;
alter table evenements           rename column projet to espace;
alter table victoires            rename column projet to espace;
alter table publications         rename column projet to espace;
alter table modeles_preparation  rename column projet to espace;

alter table objectifs            rename constraint objectifs_projet_check            to objectifs_espace_check;
alter table taches               rename constraint taches_projet_check               to taches_espace_check;
alter table evenements           rename constraint evenements_projet_check           to evenements_espace_check;
alter table victoires            rename constraint victoires_projet_check            to victoires_espace_check;
alter table publications         rename constraint publications_projet_check         to publications_espace_check;
alter table modeles_preparation  rename constraint modeles_preparation_projet_check  to modeles_preparation_espace_check;

alter index publications_projet_date_idx rename to publications_espace_date_idx;

comment on table objectifs is
  'Objectifs par espace. Pour espace = ''perso'', il s''agit d''intentions : cible et echeance vides, aucune progression.';
comment on table taches is
  'Tâches des quatre espaces. ''perso'' est autorisé depuis le 13 août 2026.';
