-- L'ACCUEIL VOIT ENFIN CE QU'IL A PROVOQUÉ (demande de Noé, 29 août 2026).
--
-- Le hub savait qu'un match avait eu lieu la veille, qu'une réunion se tenait
-- lundi, qu'une séance avait été photographiée — et il n'en disait rien. Ce
-- travail-là était réel, jamais écrit, donc jamais vu.
--
-- LA RÈGLE qui range les trois cas, et qui vient de Noé :
--
--     Ce qu'il a DÉCLARÉ devient une tâche.
--     Ce que le hub DÉDUIT devient un message.
--
-- Il coche « photos » à la création d'un événement : le tri est donc du travail
-- attendu, une tâche. Un modèle de préparation existe : la préparation est du
-- travail attendu, une tâche. Personne en revanche ne déclare qu'un match
-- mérite un carnet — c'est une question, donc un bandeau auquel on répond.

-- --- 1. Une tâche peut naître d'un événement ---------------------------------
--
-- La préparation (à J−2) et le tri des photos (à J+1) sont de VRAIES tâches et
-- non des lignes d'affichage : elles se cochent, se reportent, se rattachent à
-- un projet, portent une durée, apparaissent au calendrier et dans l'espace
-- Tâches. Une fausse tâche incapable de ces gestes serait une exception à
-- expliquer sur chaque écran.
--
-- CASCADE : l'événement supprimé emporte sa préparation et son tri. Ils n'ont
-- aucun sens sans lui, et les laisser orphelins ferait deux fantômes qu'on ne
-- saurait plus rattacher à rien.

alter table public.taches
  add column if not exists evenement_id uuid
    references public.evenements(id) on delete cascade;

create index if not exists taches_evenement_id_idx
  on public.taches(evenement_id) where evenement_id is not null;

comment on column public.taches.evenement_id is
  'L''événement qui a fait naître cette tâche : sa préparation (posée à J-2) ou le tri de ses photos (à J+1). Sert aussi à ne pas la créer deux fois.';

-- --- 2. Un événement peut annoncer qu'il produit des photos ------------------
--
-- Tous les événements n'en produisent pas, et le hub ne peut pas le deviner :
-- une réunion n'est pas une séance, une sortie n'est pas toujours un shooting.
-- C'est donc une DÉCLARATION, faite à la création, exactement comme
-- `reunion_objet` dit qu'un événement est une réunion.
--
-- Offerte au FCH et à Yuno, décochée par défaut des deux côtés. JAMAIS au
-- perso : l'espace perso ne mesure rien, et une sortie avec des amis n'a pas de
-- tri à rendre. Jamais à la formation non plus, qui n'a aucun événement.
--
-- Chez Yuno elle ne remplace pas `oeuvre_finie` et ne la contredit pas : la
-- TÂCHE est le geste, la COLONNE est l'état. Cocher « Trier les photos de
-- Clermont - Sochaux » pose `oeuvre_finie`, comme terminer une tâche écrit sa
-- victoire.

alter table public.evenements
  add column if not exists avec_photos boolean not null default false;

comment on column public.evenements.avec_photos is
  'Cet événement produit des photos à trier. Déclaré à la création (FCH et Yuno seulement, jamais perso ni formation) ; fait naître une tâche de tri à J+1.';

-- --- 3. Le bandeau de l'après, et ses deux refus -----------------------------
--
-- Après coup, le hub DÉDUIT qu'il manque quelque chose : un match qui n'est pas
-- au carnet, une réunion sans bilan. Il le dit en un message, un seul à la
-- fois, le plus récent d'abord — un bilan s'écrit à chaud, `js/hermitage.js` le
-- répète depuis le 21 août.
--
-- DEUX REFUS QUI NE DISENT PAS LA MÊME CHOSE, et c'est tout l'intérêt :
--
--   `refusee_le`  « pas maintenant » — vaut pour la journée, revient demain.
--                 Même nom et même mécanique que sur `taches` et `projets`,
--                 où c'est le « pas aujourd'hui » des pistes du matin.
--   `sans_suite`  la croix — cet événement n'a besoin de rien, et on ne le
--                 redemandera jamais. Certains matchs ne méritent pas de
--                 carnet, certaines réunions n'ont rien produit.
--
-- Sans le second, une suite qu'on ne veut pas faire deviendrait un reproche
-- permanent — exactement ce que ce hub s'interdit.

alter table public.evenements
  add column if not exists refusee_le date;

alter table public.evenements
  add column if not exists sans_suite boolean not null default false;

comment on column public.evenements.refusee_le is
  'Le jour où Noé a dit « pas maintenant » au message de cet événement. Vaut pour la journée : le message revient le lendemain.';

comment on column public.evenements.sans_suite is
  'Cet événement n''appelle aucune suite : pas de carnet, pas de bilan. Posé par la croix du bandeau, définitif — le hub ne redemande plus.';

-- --- 4. Ce qui a fait naître une tâche automatiquement -----------------------
--
-- Deux natures peuvent naître d'un même événement — sa préparation (J-2) et le
-- tri de ses photos (J+1) — et `evenement_id` seul ne les distingue pas. La
-- colonne le dit, et l'index unique garantit qu'on ne les pose qu'UNE fois :
-- c'est ce qui rend le rattrapage rejouable à chaque ouverture, comme celui
-- des séries (`rafraichirLesSeries`).
--
-- NULL pour tout ce que Noé a écrit lui-même, et c'est le cas ordinaire. La
-- ligne s'en sert pour dire d'où elle vient — « Préparation », « Après
-- l'événement » — sans quoi une tâche apparue toute seule ressemblerait à une
-- erreur.

alter table public.taches
  add column if not exists origine text
    check (origine is null or origine in ('preparation', 'tri'));

comment on column public.taches.origine is
  'Ce qui a fait naître la tâche automatiquement : preparation (posée à J-2 d''un événement) ou tri (posée à J+1 quand l''événement portait des photos). NULL pour tout ce que Noé a écrit lui-même.';

-- L'index est COMPLET et non partiel, et c'est une contrainte de PostgREST :
-- `ON CONFLICT` ne sait viser un index partiel que si la requête répète son
-- prédicat, ce que l'upsert de supabase-js ne peut pas exprimer — il répondait
-- « there is no unique or exclusion constraint matching the ON CONFLICT
-- specification ». Le complet est aussi sûr : dans un index unique, deux NULL
-- ne se heurtent jamais, donc les tâches écrites à la main — qui ont les deux
-- colonnes vides — ne s'y gênent pas.
create unique index if not exists taches_origine_par_evenement_idx
  on public.taches(evenement_id, origine);
