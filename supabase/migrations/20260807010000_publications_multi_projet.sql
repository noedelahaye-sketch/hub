-- Le calendrier éditorial devient multi-projet
--
-- La table `publications` a été créée pour Yuno seul. Le FC Hermitage a le même
-- besoin — un calendrier éditorial pour la communication du club — et c'est le
-- même outil : plutôt qu'une seconde table identique, on ajoute la colonne
-- `projet`, comme sur les six tables d'origine.
--
-- Les lignes existantes sont toutes des publications Yuno : le DEFAULT les
-- rattache sans avoir à les toucher. 'perso' est volontairement exclu du CHECK,
-- comme pour `taches` : l'espace perso ne publie pas.

alter table public.publications
  add column projet text not null default 'photo'
    check (projet in ('formation', 'photo', 'fch'));

comment on column public.publications.projet is
  'Le projet à qui appartient la publication. Défaut ''photo'' : la table est née pour Yuno.';

-- Les réseaux d'un club de foot ne sont pas ceux d'un photographe : le FCH
-- publie aussi sur Facebook (le réseau des clubs amateurs) et YouTube.
alter table public.publications
  drop constraint publications_reseau_check;

alter table public.publications
  add constraint publications_reseau_check
    check (reseau in ('instagram', 'tiktok', 'linkedin', 'facebook', 'youtube'));

-- Le calendrier et le hub filtrent par projet et par date : cet index sert les
-- deux lectures les plus fréquentes.
create index publications_projet_date_idx
  on public.publications (projet, date_prevue);
