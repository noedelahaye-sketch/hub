-- La répétition devient une GÉNÉRATION, plus une ligne qui avance.
--
-- Avant : une tâche répétée était UNE ligne dont on déplaçait l'échéance à
-- chaque coche, dépliée à l'affichage. Conséquences : on ne pouvait ni en
-- supprimer une occurrence, ni en modifier une seule, ni savoir ce qui avait
-- réellement été fait — la ligne ne gardait aucune trace de ses passages.
--
-- Après : une SÉRIE porte la règle et le modèle ; chaque occurrence est une
-- vraie ligne, indépendante, qu'on supprime et modifie seule. Demande de Noé,
-- 27 août 2026. Voir docs/orientation-spec.md § 2.3.
--
-- `genere_jusqu_au` est la pièce qui fait tenir l'ensemble : on ne génère
-- qu'APRÈS ce curseur, donc une occurrence supprimée ne repousse jamais. C'est
-- la version simple des EXDATE d'iCalendar, et elle suffit ici.

create table if not exists public.series (
  id               uuid primary key default gen_random_uuid(),
  nature           text not null check (nature in ('tache', 'evenement', 'publication')),
  espace           text not null check (espace in ('formation', 'photo', 'fch', 'perso')),
  recurrence       text not null check (recurrence in ('hebdo', 'quinzaine', 'mensuel')),
  depart           date not null,
  recurrence_fin   date,
  genere_jusqu_au  date not null,
  modele           jsonb not null default '{}'::jsonb,
  arretee          boolean not null default false,
  created_at       timestamptz not null default now()
);

comment on table public.series is
  'Règle de répétition + modèle d''une série. Les occurrences sont de vraies lignes dans taches / evenements / publications, reliées par serie_id.';
comment on column public.series.genere_jusqu_au is
  'Dernière date matérialisée. On ne génère qu''après : une occurrence supprimée ne repousse pas.';
comment on column public.series.modele is
  'Les champs recopiés dans chaque occurrence. Le modifier change les occurrences À VENIR, jamais celles déjà posées.';

alter table public.taches
  add column if not exists serie_id uuid references public.series(id) on delete set null;
alter table public.evenements
  add column if not exists serie_id uuid references public.series(id) on delete set null;
alter table public.publications
  add column if not exists serie_id uuid references public.series(id) on delete set null;

create index if not exists taches_serie_idx       on public.taches(serie_id);
create index if not exists evenements_serie_idx   on public.evenements(serie_id);
create index if not exists publications_serie_idx on public.publications(serie_id);

-- Conversion des séries existantes. La ligne en place devient la PREMIÈRE
-- occurrence de sa série : son échéance sert de départ et de curseur, si bien
-- que la génération reprendra exactement au pas suivant.
do $$
declare r record; s uuid;
begin
  for r in select * from public.taches where recurrence is not null loop
    insert into public.series (nature, espace, recurrence, depart, recurrence_fin, genere_jusqu_au, modele)
    values ('tache', r.espace, r.recurrence, r.echeance, r.recurrence_fin, r.echeance,
            to_jsonb(r) - 'id' - 'created_at' - 'echeance' - 'date_fait' - 'statut'
                        - 'recurrence' - 'recurrence_fin' - 'serie_id')
    returning id into s;
    update public.taches set serie_id = s where id = r.id;
  end loop;

  for r in select * from public.publications where recurrence is not null loop
    insert into public.series (nature, espace, recurrence, depart, recurrence_fin, genere_jusqu_au, modele)
    values ('publication', r.espace, r.recurrence, r.date_prevue, r.recurrence_fin, r.date_prevue,
            to_jsonb(r) - 'id' - 'created_at' - 'date_prevue' - 'lien_publie' - 'statut'
                        - 'recurrence' - 'recurrence_fin' - 'serie_id')
    returning id into s;
    update public.publications set serie_id = s where id = r.id;
  end loop;

  for r in select * from public.evenements where recurrence is not null loop
    insert into public.series (nature, espace, recurrence, depart, recurrence_fin, genere_jusqu_au, modele)
    values ('evenement', r.espace, r.recurrence, r.date_debut::date, r.recurrence_fin, r.date_debut::date,
            to_jsonb(r) - 'id' - 'created_at' - 'date_debut' - 'date_fin' - 'vecu' - 'photo_chemin'
                        - 'note' - 'oeuvre_finie' - 'recurrence' - 'recurrence_fin' - 'serie_id'
            || jsonb_build_object('duree_minutes',
                 case when r.date_fin is null then null
                      else round(extract(epoch from (r.date_fin - r.date_debut)) / 60) end,
               'heure', to_char(r.date_debut, 'HH24:MI'))) 
    returning id into s;
    update public.evenements set serie_id = s where id = r.id;
  end loop;
end $$;

-- La règle ne vit plus qu'à un endroit : la série.
alter table public.taches       drop column recurrence, drop column recurrence_fin;
alter table public.evenements   drop column recurrence, drop column recurrence_fin;
alter table public.publications drop column recurrence, drop column recurrence_fin;

alter table public.series enable row level security;
create policy "series_select_authenticated" on public.series
  for select to authenticated using (true);
create policy "series_insert_authenticated" on public.series
  for insert to authenticated with check (true);
create policy "series_update_authenticated" on public.series
  for update to authenticated using (true) with check (true);
create policy "series_delete_authenticated" on public.series
  for delete to authenticated using (true);

grant select, insert, update, delete on public.series to authenticated;
