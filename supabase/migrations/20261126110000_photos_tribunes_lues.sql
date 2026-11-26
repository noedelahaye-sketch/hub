-- « DEPUIS TRIBUNES » SE POSE D'OFFICE, UNE SEULE FOIS (26 novembre 2026) : une
-- étiquette que Noé retire ne doit pas revenir à la visite suivante.
alter table photos add column if not exists tribunes_lues boolean not null default false;
comment on column photos.tribunes_lues is 'La règle « depuis tribunes » est passée sur cette photo : on ne repose pas une étiquette retirée.';
