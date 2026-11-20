-- LA COMPÉTITION D'UN MATCH (20 novembre 2026, photothèque, étape 3).
--
-- Noé cherche ses photos « à partir d'une compétition aussi ». Elle se pose sur
-- le MATCH et non sur chaque photo : toutes les photos d'un match en héritent,
-- et l'on ne la redit pas cent fois. Un texte libre et non une liste fermée :
-- Ligue 1, Coupe de France, Ligue des champions, un tournoi de jeunes — les
-- valeurs déjà écrites sont proposées à la saisie, ce qui suffit à ne pas en
-- faire deux orthographes.
alter table evenements add column if not exists competition text;
