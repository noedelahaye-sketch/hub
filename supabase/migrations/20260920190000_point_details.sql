-- Le détail d'un point de l'ordre du jour (20 septembre 2026, demande de Noé) :
-- un texte plus long que le titre et la sortie attendue, lu en touchant la
-- tuile du point. Facultatif : un point sans détail reste un point.
alter table public.fiches_reunion_points
  add column if not exists details text;

comment on column public.fiches_reunion_points.details is
  'Le détail du point : contexte, éléments à avoir en tête, ce qu''on veut dire. Texte libre, facultatif.';
