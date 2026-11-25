-- LES INFOS DE PRISE DE VUE (25 novembre 2026) : vitesse, ouverture, iso, focale,
-- appareil, objectif — lues dans le fichier d'origine, que l'allègement vide.
alter table photos add column if not exists prise jsonb;
