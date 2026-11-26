-- L'ORIGINAL GARDÉ 14 JOURS (26 novembre 2026, demande de Noé) : à l'import,
-- on choisit de compresser tout de suite (comme avant) ou de garder le fichier
-- de l'appareil en pleine qualité pendant 14 jours. Passé ce jour, le hub le
-- remplace par la version compressée (2160 px).
--
-- NULL = la photo est déjà compressée : toutes les photos d'avant, et ce qui
-- arrive en mode « compressée ».
alter table photos add column if not exists originale_jusqu_au timestamptz;
comment on column photos.originale_jusqu_au is 'Le fichier stocké est l''original jusqu''à cette date ; ensuite le hub le compresse. NULL = déjà compressée.';
create index if not exists photos_originale on photos (originale_jusqu_au) where originale_jusqu_au is not null;
