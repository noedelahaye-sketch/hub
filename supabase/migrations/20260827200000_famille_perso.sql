-- La famille d'un moment perso. Quatre valeurs, et la quatrième est la plus
-- importante : sans « intendance », les planchers se rempliraient de corvées et
-- le hub croirait la semaine équilibrée. Les données du 27 août 2026 le montrent
-- — « Courses », « Machine », « Ranger ma chambre » côtoyaient « Courir » et un
-- rendez-vous psy dans le même espace.
--
-- Un compteur unique se laisserait remplir par la famille la plus facile — le
-- sport, celui que Noé tient déjà — et il pourrait passer un mois sans voir
-- personne avec un compteur au vert. D'où un plancher PAR famille.

alter table public.taches
  add column if not exists famille text
  check (famille is null or famille in ('corps', 'calme', 'lien', 'intendance'));

alter table public.evenements
  add column if not exists famille text
  check (famille is null or famille in ('corps', 'calme', 'lien', 'intendance'));

comment on column public.taches.famille is
  'Espace perso seulement : corps (sport, étirements), calme (lecture, écriture, balade), lien (amis, ciné, soin), intendance (courses, machine, rangement — ne compte dans aucun plancher).';

-- Les livrables de la formation deviennent des projets : ce sont eux qui portent
-- la charge, et sans charge la courbe d'atterrissage n'a rien à calculer.
-- Chiffres donnés par Noé : 25 h par dossier, 6 h la vidéo, 6 h le QCM.
with livrables(titre_jalon, nom, heures) as (values
  ('Dossier du bloc 4', 'Dossier du bloc 4', 25),
  ('Deuxième dossier',  'Deuxième dossier',  25),
  ('Troisième dossier', 'Troisième dossier', 25),
  ('Quatrième dossier', 'Quatrième dossier', 25),
  ('Vidéo',             'La vidéo',           6),
  ('QCM des blocs',     'Le QCM des blocs',   6)
), poses as (
  insert into public.projets (espace, nom, resultat, charge_minutes, echeance, statut)
  select 'formation', l.nom, 'Rendu', l.heures * 60, j.echeance, 'actif'
  from livrables l
  join public.jalons j on j.titre = l.titre_jalon
  join public.objectifs o on o.id = j.objectif_id and o.espace = 'formation'
  returning id, nom
)
insert into public.projets_cibles (projet_id, jalon_id, objectif_id)
select p.id, j.id, j.objectif_id
from poses p
join livrables l on l.nom = p.nom
join public.jalons j on j.titre = l.titre_jalon
join public.objectifs o on o.id = j.objectif_id and o.espace = 'formation';
