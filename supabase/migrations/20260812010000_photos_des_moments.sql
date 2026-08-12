-- La photo d'un moment, jointe plutôt que décrite
--
-- `photo_fiere` gardait une phrase ou un lien. Noé veut joindre l'image
-- elle-même : elle vit dans le stockage Supabase, et la colonne ci-dessous
-- retient son chemin. L'ancienne colonne reste — elle sert de légende pour ce
-- qui a été écrit avant, et rien ne se perd.

alter table public.moments add column photo_chemin text;

comment on column public.moments.photo_chemin is
  'Chemin de la photo dans le bucket « moments ». NULL si aucune image jointe.';

-- Un bucket PRIVÉ : ce sont ses photos, et le dépôt comme le site sont
-- publics. On n'y accède que par une URL signée, générée à la lecture pour une
-- session connectée.
insert into storage.buckets (id, name, public)
values ('moments', 'moments', false)
on conflict (id) do nothing;

-- Mêmes politiques que le reste du hub : tout réservé au rôle authenticated,
-- rien pour anon.
create policy "moments_lire_authenticated" on storage.objects
  for select to authenticated using (bucket_id = 'moments');

create policy "moments_deposer_authenticated" on storage.objects
  for insert to authenticated with check (bucket_id = 'moments');

create policy "moments_remplacer_authenticated" on storage.objects
  for update to authenticated using (bucket_id = 'moments') with check (bucket_id = 'moments');

create policy "moments_effacer_authenticated" on storage.objects
  for delete to authenticated using (bucket_id = 'moments');
