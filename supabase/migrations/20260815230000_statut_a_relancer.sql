-- « À relancer » entre dans l'échelle des relations (demande de Noé, 15 août
-- 2026, au soir).
--
-- L'idée : un message resté sans suite à la fin de la semaine n'est pas un
-- échec, c'est une relance due. Le statut bascule tout seul le lundi
-- (`message_envoye` → `a_relancer`), et le club revient dans les propositions
-- avec sa pastille « relance ». C'est la première fois qu'un statut change
-- avec le temps dans ce dépôt : ailleurs, un état se pose par un geste. La
-- nuance tient — « à relancer » n'affirme rien de ce que Noé aurait fait, il
-- lève un rappel. Et il se corrige à la main comme n'importe quel statut.
--
-- L'échelle devient :
--   pas de contact → message envoyé → à relancer → relancé
--   → contact établi → bon contact → opportunité
--
-- **`repondu` reste dans le CHECK** alors que l'interface ne l'offre plus : un
-- CHECK s'élargit, il ne se resserre jamais (même règle que `post` pour les
-- publications). Aucune fiche ne le porte aujourd'hui — la vérification a été
-- faite avant d'écrire cette migration —, donc rien à convertir.

alter table public.contacts drop constraint contacts_statut_check;
alter table public.contacts add constraint contacts_statut_check
  check (statut in ('pas_de_contact', 'message_envoye', 'a_relancer', 'relance',
                    'repondu', 'contact_etabli', 'bon_contact', 'opportunite'));

comment on column public.contacts.statut is
  'Où en est la relation. Progression : pas_de_contact -> message_envoye -> a_relancer -> relance -> contact_etabli -> bon_contact -> opportunite. `repondu` n''est plus offert par l''interface (15 août 2026) mais reste accepté.';
