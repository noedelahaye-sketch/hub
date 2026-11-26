-- LA PART DE PELOUSE D'UNE PHOTO (26 novembre 2026) : lue une fois sur sa vignette,
-- elle sert à reconnaître les photos prises depuis les tribunes.
alter table photos add column if not exists vert real check (vert is null or (vert >= 0 and vert <= 1));
comment on column photos.vert is 'Part de pelouse dans la vignette (0 à 1), lue une fois. NULL : pas encore lue.';
