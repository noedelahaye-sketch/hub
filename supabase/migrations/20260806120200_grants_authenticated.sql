-- Hub — privilèges de table
--
-- RLS et privilèges Postgres sont deux couches distinctes : une politique RLS ne
-- s'applique que si le rôle a déjà le privilège correspondant. Les tables créées
-- par la migration initiale n'ont hérité d'aucun GRANT pour `authenticated` ;
-- sans ces GRANT, le site échouerait en « permission denied » même une fois Noé
-- connecté.
--
-- `anon` reste volontairement sans aucun privilège : un visiteur non connecté ne
-- doit rien pouvoir lire ni écrire, même avec la clé publique du projet.

grant select, insert, update, delete on public.objectifs  to authenticated;
grant select, insert, update, delete on public.jalons     to authenticated;
grant select, insert, update, delete on public.taches     to authenticated;
grant select, insert, update, delete on public.evenements to authenticated;
grant select, insert, update, delete on public.victoires  to authenticated;
grant select, insert, update, delete on public.humeur     to authenticated;
