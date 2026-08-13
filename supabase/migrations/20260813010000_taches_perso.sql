-- Une tâche peut être perso (demande de Noé, 13 août 2026).
--
-- Jusqu'ici la contrainte de `taches.projet` n'acceptait que les trois projets
-- professionnels, et c'était voulu : la philosophie du hub tient l'espace perso
-- à l'écart de toute mécanique de productivité — ni tâches, ni jalons, ni
-- retard (CLAUDE.md). Noé demande la tâche perso ; le reste de la règle ne
-- bouge pas.
--
-- Ce qui change, et seulement ça :
--   - `taches.projet` accepte 'perso' ;
--   - l'interface l'offre là où l'on crée ou corrige une tâche.
--
-- Ce qui NE change pas :
--   - `jalons` reste sans perso — un jalon mesure une progression, et l'espace
--     perso n'en affiche aucune ;
--   - l'espace `#perso` ne montre toujours pas de tâches : il garde ses
--     intentions, ses rendez-vous et ses victoires. Une tâche perso se lit dans
--     l'espace Tâches, au calendrier et dans « Aujourd'hui ».

alter table public.taches drop constraint if exists taches_projet_check;

alter table public.taches
  add constraint taches_projet_check
  check (projet in ('formation', 'photo', 'fch', 'perso'));

comment on column public.taches.projet is
  'formation | photo | fch | perso. Perso admis depuis le 13 août 2026 : une '
  'tâche peut appartenir à la vie hors projets, mais l''espace #perso continue '
  'de ne rien afficher de mesuré.';
