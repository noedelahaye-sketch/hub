-- L'objectif du jour d'une préparation (demande de Noé) : ce que la sortie doit
-- rapporter, écrit en tête de la feuille, après le rappel du dernier bilan.
-- Facultatif.
alter table public.preparations
  add column if not exists objectif_jour text;

comment on column public.preparations.objectif_jour is
  'L''objectif du jour : ce que cette sortie doit rapporter. Texte libre, facultatif.';
