-- Le carnet réseau reçoit le statut de la relation
--
-- Repris du tableau Notion de Noé (7 août 2026), qui servait de carnet avant le
-- hub. C'est la colonne qui manquait pour en faire un vrai CRM : savoir où en
-- est la relation, pas seulement qui est la personne.
--
-- L'ordre des valeurs est celui d'une progression :
--   pas_de_contact -> message_envoye -> contact_etabli -> bon_contact
--
-- Ce n'est pas un cycle contraint : on peut sauter des étapes, et un statut ne
-- redescend pas tout seul. Aucune de ces valeurs ne signale une alerte — la
-- règle du hub tient ici comme ailleurs.

alter table public.contacts
  add column statut text not null default 'pas_de_contact'
    check (statut in ('pas_de_contact', 'message_envoye', 'contact_etabli', 'bon_contact'));

comment on column public.contacts.statut is
  'Où en est la relation. Progression : pas_de_contact -> message_envoye -> contact_etabli -> bon_contact.';

-- Le carnet se lit surtout trié ou filtré par statut et par structure.
create index contacts_statut_idx on public.contacts (statut);
