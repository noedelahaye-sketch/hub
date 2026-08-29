-- LE POST QUI SUIT UN MATCH (29 août 2026, demande de Noé : « après chaque
-- évènement match yuno, il faut programmer un post sur le match à J+1 »).
--
-- C'est la TROISIÈME chose que le hub pose lui-même à partir d'un événement,
-- après la préparation à J−2 et le tri des photos à J+1 — et la première qui
-- ne soit pas une tâche. La règle du 29 août tient toujours : ce que Noé a
-- DÉCLARÉ devient une vraie ligne. Ici la déclaration est la pastille
-- « match » de la tuile de capture, exactement comme « photos » fait naître le
-- tri : le hub ne devine pas qu'une sortie est un match, on le lui dit.
--
-- Ce n'est pas une tâche parce que ce n'est pas du travail à cocher : c'est une
-- parution, et une parution vit au calendrier éditorial avec son réseau, son
-- format et son cycle d'états.

-- Les mêmes deux colonnes que sur `taches`, et pour la même raison : l'index
-- unique est ce qui rend le rattrapage rejouable à chaque ouverture du hub.
alter table public.publications
  add column if not exists evenement_id uuid references public.evenements(id) on delete set null;

-- ON DELETE SET NULL, là où `taches` est en CASCADE — et l'écart est voulu.
-- Une préparation ou un tri n'a aucun sens sans son événement ; une publication
-- en a un : elle peut être partie, porter son lien, compter dans un bilan.
-- Supprimer un match ne doit pas effacer le post qui en est sorti, seulement le
-- détacher.
comment on column public.publications.evenement_id is
  'L''événement qui a fait naître cette parution. SET NULL et non CASCADE : une publication partie survit à la suppression de son match.';

alter table public.publications
  add column if not exists origine text
  check (origine is null or origine in ('match'));

comment on column public.publications.origine is
  'Ce qui l''a fait naître automatiquement ; NULL pour tout ce que Noé a écrit lui-même, qui est le cas ordinaire.';

-- COMPLET, ET NON PARTIEL, comme celui de `taches`. Un index partiel semblait
-- plus propre — les publications écrites à la main portent toutes un
-- evenement_id nul — mais `ON CONFLICT (evenement_id, origine)` ne peut pas
-- s'appuyer dessus sans en reprendre le prédicat : Postgres répond 42P10, « no
-- unique or exclusion constraint matching the ON CONFLICT specification ».
--
-- Et il n'y avait rien à protéger : dans un index unique, NULL n'entre jamais
-- en conflit avec NULL. Les centaines de publications manuelles y tiennent donc
-- toutes, chacune avec sa paire (null, null).
create unique index if not exists publications_evenement_origine_idx
  on public.publications(evenement_id, origine);
