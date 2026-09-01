-- LES BLOCS SE GARDENT D'UNE VISITE À L'AUTRE (1er septembre 2026, demande de
-- Noé : « il faut que la disposition des blocs soit sauvegardée entre 2
-- chargements de page ; si je modifie, ajoute ou retire un bloc, ce doit être
-- sauvegardé à la prochaine visite »).
--
-- CE QUE ÇA RENVERSE, et il faut le dire : depuis le 31 août, « un bloc ne
-- s'enregistre pas — les blocs ne doivent être que de l'affichage ». Le motif
-- était juste (rien à maintenir, rien qui périme) mais il avait un prix que
-- l'usage a révélé : une semaine réorganisée à la main se retrouvait reproposée
-- telle quelle au rechargement, et le travail d'arrangement était perdu.
--
-- UNE LIGNE PAR SEMAINE, ET SEULEMENT SI NOÉ A ARRANGÉ QUELQUE CHOSE. Tant
-- qu'il n'a rien touché, il n'y a pas de ligne et le hub propose : la table dit
-- ce qu'il a DÉCIDÉ, jamais ce que l'algorithme a calculé. « Reproposer les
-- blocs » efface la ligne — c'est exactement ce que ce bouton veut dire.
--
-- UNE TABLE À PART, ET SURTOUT PAS UNE COLONNE DE `semaines` : là-bas,
-- l'existence d'une ligne SIGNIFIE que la semaine est validée (`etat.validee`
-- et le bandeau du dimanche s'y fient tous les deux). Y écrire des blocs
-- fermerait le rendez-vous du dimanche sans que personne l'ait demandé.
create table if not exists public.semaines_blocs (
  debut date primary key,
  blocs jsonb not null,
  posee_le timestamptz not null default now()
);

alter table public.semaines_blocs enable row level security;

create policy "semaines_blocs authentifie"
  on public.semaines_blocs for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public.semaines_blocs to authenticated;
