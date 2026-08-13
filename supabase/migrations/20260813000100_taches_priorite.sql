-- Une tâche porte une priorité, de 1 à 4.
--
-- Demandée par Noé le 13 août 2026, sur le modèle de Todoist : 1 est le plus
-- urgent, 4 le cas ordinaire. C'est pour ça que le défaut est 4 et non 1 — une
-- tâche n'est pas prioritaire parce qu'elle existe, et une liste où tout est
-- en priorité 1 ne classe plus rien.
--
-- Pourquoi un entier borné plutôt qu'un texte ('haute', 'basse'…) : la priorité
-- se trie, et un ordre alphabétique sur des mots ne veut rien dire. La
-- contrainte CHECK dit la borne à la base, pas seulement à l'écran.
--
-- Cette colonne ne remplace PAS `statut` (backlog / actif / fait), qui répond à
-- une autre question. `statut` dit où en est la tâche, `priorite` dit combien
-- elle compte. La règle des 3 tâches actives par projet reste entière : une
-- priorité 1 ne dispense pas de choisir.

alter table public.taches
  add column if not exists priorite int not null default 4;

do $$
begin
  alter table public.taches
    add constraint taches_priorite_bornee check (priorite between 1 and 4);
exception
  when duplicate_object then null;
end $$;

comment on column public.taches.priorite is
  'Priorité de 1 (le plus urgent) à 4 (le cas ordinaire, par défaut).';
