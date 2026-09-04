-- LA COUVERTURE D'UN LIVRE (2 septembre 2026, demande de Noé : « j'aimerais
-- pouvoir rajouter la couverture du livre, ce qui permettrait d'avoir un aperçu
-- visuel dans la bibliothèque »).
--
-- UNE PHOTO QU'ON PREND, ET NON UN LIEN COLLÉ (choix de Noé entre les deux) :
-- l'image vit dans le hub, elle ne peut pas disparaître, et regarder sa
-- bibliothèque ne prévient personne. Le hub a déjà toute la machinerie — la
-- réduction avant envoi, le bucket privé, les liens signés gardés un mois : elle
-- sert le Carnet de terrain de Yuno depuis le 21 août.
--
-- UN SECOND BUCKET, et non un dossier dans « moments » : une couverture n'est
-- pas un moment vécu. Deux natures, deux réserves — et le jour où l'on voudra
-- vider l'une, on ne touchera pas à l'autre.
alter table public.livres add column if not exists couverture text;

comment on column public.livres.couverture is
  'Chemin de la couverture dans le bucket « livres ». NULL = pas de couverture, '
  'et la bibliothèque pose alors une tuile pointillée avec le titre.';

insert into storage.buckets (id, name, public)
values ('livres', 'livres', false)
on conflict (id) do nothing;

-- Les mêmes quatre politiques que « moments », au nom du bucket près : un seul
-- compte, celui de Noé, et rien de public. Sans lien signé, le bucket ne répond
-- pas.
drop policy if exists livres_lire_authenticated on storage.objects;
create policy livres_lire_authenticated on storage.objects
  for select to authenticated using (bucket_id = 'livres');

drop policy if exists livres_deposer_authenticated on storage.objects;
create policy livres_deposer_authenticated on storage.objects
  for insert to authenticated with check (bucket_id = 'livres');

drop policy if exists livres_remplacer_authenticated on storage.objects;
create policy livres_remplacer_authenticated on storage.objects
  for update to authenticated using (bucket_id = 'livres') with check (bucket_id = 'livres');

drop policy if exists livres_effacer_authenticated on storage.objects;
create policy livres_effacer_authenticated on storage.objects
  for delete to authenticated using (bucket_id = 'livres');
