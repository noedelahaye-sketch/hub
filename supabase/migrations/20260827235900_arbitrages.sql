-- LA TRACE D'UN ARBITRAGE.
--
-- Le hub pose la question, Noé tranche (son choix, 27 août 2026). Sans trace,
-- il la reposerait le dimanche suivant, et le suivant — et une question qu'on
-- repose après y avoir répondu n'est plus une question.
--
-- Ce qui est gardé, ce n'est pas seulement la réponse : c'est la QUESTION avec
-- elle. Relire « la formation porte novembre » six semaines plus tard ne vaut
-- que si l'on se rappelle ce qui était en balance.
--
-- Une réponse a une PORTÉE, pas une durée de vie : elle vaut sur l'intervalle
-- où la question se posait. Passé cet intervalle, elle n'empêche plus rien —
-- une décision prise pour septembre n'engage pas décembre.

create table if not exists public.arbitrages (
  id            uuid primary key default gen_random_uuid(),
  cle           text not null,
  question      text not null,
  portee_debut  date not null,
  portee_fin    date not null,
  espace_retenu text check (espace_retenu is null or espace_retenu in ('formation', 'photo', 'fch', 'perso')),
  espace_cede   text check (espace_cede is null or espace_cede in ('formation', 'photo', 'fch', 'perso')),
  reponse       text not null,
  created_at    timestamptz not null default now(),
  constraint arbitrages_portee check (portee_fin >= portee_debut)
);

comment on column public.arbitrages.cle is
  'Ce qui identifie LA MÊME question d''une fois sur l''autre — « periode:<id> » pour la tension d''une période. Tant qu''un arbitrage porte cette clé et couvre le jour, le hub ne repose pas la question.';
comment on column public.arbitrages.reponse is
  'Ce que Noé a répondu, en toutes lettres. C''est ce qu''il relira, pas la clé.';

create index if not exists arbitrages_cle_idx on public.arbitrages(cle, portee_debut, portee_fin);

alter table public.arbitrages enable row level security;

create policy "arbitrages_select_authenticated" on public.arbitrages
  for select to authenticated using (true);
create policy "arbitrages_insert_authenticated" on public.arbitrages
  for insert to authenticated with check (true);
create policy "arbitrages_update_authenticated" on public.arbitrages
  for update to authenticated using (true) with check (true);
create policy "arbitrages_delete_authenticated" on public.arbitrages
  for delete to authenticated using (true);

grant select, insert, update, delete on public.arbitrages to authenticated;
