-- La fusion des moments et des événements (décision de Noé, 14 août 2026).
--
-- Depuis que le bilan d'une préparation crée le moment, un moment n'était plus
-- qu'une copie du vécu de son événement : même date, même lieu, même type.
-- Deux objets pour une seule chose. L'ÉVÉNEMENT devient donc l'objet unique, à
-- deux faces :
--   — la face PRÉVUE : date, lieu, type_moment, sa préparation ;
--   — la face VÉCUE : `vecu`, la photo, la note, « œuvre finie », ses
--     rencontres.
--
-- Ce qui NE change pas, et ne doit pas changer :
--   — le vocabulaire : l'interface dit toujours « Moments vécus », « Carnet de
--     terrain ». La donnée fusionne, les mots restent (CLAUDE.md) ;
--   — `vecu` ne se pose JAMAIS tout seul au passage de la date (décision de
--     Noé) : un match où l'on n'est pas allé compterait, et le compteur
--     cesserait de dire du vrai. Il se pose par un geste — le bilan d'une
--     préparation, l'invite du carnet, ou la capture d'une sortie ;
--   — les victoires gardent `source = 'moment'` : cette colonne dit la NATURE
--     du geste (un moment vécu), pas la table d'où il vient. Seul `source_id`
--     change de cible — il pointe désormais `evenements`.

-- 1. La face vécue, sur l'événement.

alter table public.evenements
  add column vecu boolean not null default false,
  add column photo_chemin text,
  add column note text,
  add column oeuvre_finie boolean not null default false;

comment on column public.evenements.vecu is
  'Cette sortie a été vécue. Posé par un geste (bilan, invite, capture) — jamais par le temps qui passe.';
comment on column public.evenements.photo_chemin is
  'La photo dont je suis fier : le fichier dans le bucket privé `moments`.';

-- 2. Les rencontres suivent : elles appartiennent à l'événement vécu.

alter table public.rencontres
  add column evenement_id uuid references public.evenements(id) on delete cascade;

-- 3. Les moments déjà liés à un événement versent leur face vécue dedans.

update public.evenements e
set vecu = true,
    photo_chemin = m.photo_chemin,
    note = m.note,
    oeuvre_finie = m.oeuvre_finie,
    type_moment = coalesce(e.type_moment, m.type)
from public.moments m
where m.evenement_id = e.id;

-- 4. Les moments SANS événement en deviennent un — passé, et vécu. La
--    correspondance est gardée le temps de repointer rencontres et victoires.

create table public._corr_moments (
  moment_id uuid primary key,
  evenement_id uuid not null
);

-- Un par un, et non par une jointure sur (titre, date) : deux sorties du même
-- jour au même lieu se ressemblent trop pour qu'on les rapproche à l'aveugle,
-- et un rapprochement faux mêlerait leurs rencontres.
do $$
declare
  m record;
  nouvel_id uuid;
begin
  for m in select * from public.moments where evenement_id is null loop
    insert into public.evenements
      (projet, titre, date_debut, lieu, type_moment, vecu,
       photo_chemin, note, oeuvre_finie, created_at)
    values (
      'photo',
      -- Le titre de l'événement : le lieu quand il y en a un (« RDC - Danemark
      -- à Liège »), sinon le type en toutes lettres — le type garde sa colonne.
      coalesce(nullif(trim(m.lieu), ''), initcap(m.type)),
      -- Minuit LOCAL, pas minuit UTC : la convention du hub veut que minuit
      -- dise « pas d'heure », et `date::timestamptz` donnerait 02:00 à l'écran.
      (m.date::timestamp) at time zone 'Europe/Paris',
      m.lieu,
      m.type,
      true,
      m.photo_chemin,
      m.note,
      m.oeuvre_finie,
      m.created_at
    )
    returning id into nouvel_id;

    insert into public._corr_moments (moment_id, evenement_id) values (m.id, nouvel_id);
  end loop;
end $$;

-- 5. Rencontres et victoires repointent vers l'événement.

update public.rencontres r
set evenement_id = coalesce(m.evenement_id, c.evenement_id)
from public.moments m
left join public._corr_moments c on c.moment_id = m.id
where r.moment_id = m.id;

update public.victoires v
set source_id = coalesce(m.evenement_id, c.evenement_id)
from public.moments m
left join public._corr_moments c on c.moment_id = m.id
where v.source = 'moment' and v.source_id = m.id;

comment on column public.victoires.source_id is
  'La ligne d''origine. Pour source = ''moment'', c''est un evenements.id depuis la fusion du 14 août 2026.';

-- 6. Une rencontre sans événement n'existe plus : la colonne devient
--    obligatoire, et l'ancienne disparaît.

delete from public.rencontres where evenement_id is null;

alter table public.rencontres
  drop column moment_id,
  alter column evenement_id set not null;

create index rencontres_evenement_idx on public.rencontres (evenement_id);

comment on table public.rencontres is
  'Les rencontres d''une sortie vécue. contact_id relie au réseau, s''il y a une fiche.';

-- 7. La table `moments` a fini son travail.

drop table public._corr_moments;
drop table public.moments;

-- `preparations.evenement_id` et `moments.evenement_id` visaient le même but ;
-- il n'en reste qu'un. Rien à faire sur les préparations : elles pointaient
-- déjà l'événement.
