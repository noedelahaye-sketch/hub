-- Les PÉRIODES : l'arbitrage qui a lieu en amont.
--
-- Une période dit ce qu'on attend d'un mois, espace par espace : au ralenti,
-- normal, intense. Elle multiplie les quotas de base (20 h de club, 15 h de
-- formation) sur son intervalle.
--
-- Sa vraie fonction n'est pas de régler des chiffres : DÉCLARER UNE PÉRIODE,
-- C'EST DÉJÀ ARBITRER. Poser « FCH intense » et « formation intense » sur le
-- même mois, c'est 41 h par semaine — et le hub le dit AU MOMENT OÙ ON L'ÉCRIT,
-- trois semaines avant le mur, quand la réponse coûte encore peu. Pas un
-- dimanche soir où il ne reste que de mauvaises options.
--
-- Voir docs/orientation-spec.md § 4 et § 9.3.

create table if not exists public.periodes (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  debut      date not null,
  fin        date not null,
  regimes    jsonb not null default '{}'::jsonb,
  notes      text,
  created_at timestamptz not null default now(),
  constraint periodes_fin_apres_debut check (fin >= debut)
);

comment on column public.periodes.regimes is
  'Un régime par espace : { "fch": "intense", "formation": "normal", "photo": "ralenti" }. Valeurs : ralenti, normal, intense. L''espace perso n''y figure PAS — son plancher ne se négocie jamais, c''est toute sa raison d''être.';

create index if not exists periodes_intervalle_idx on public.periodes(debut, fin);

alter table public.periodes enable row level security;

create policy "periodes_select_authenticated" on public.periodes
  for select to authenticated using (true);
create policy "periodes_insert_authenticated" on public.periodes
  for insert to authenticated with check (true);
create policy "periodes_update_authenticated" on public.periodes
  for update to authenticated using (true) with check (true);
create policy "periodes_delete_authenticated" on public.periodes
  for delete to authenticated using (true);

grant select, insert, update, delete on public.periodes to authenticated;
