-- UN ÉMOJI PAR HABITUDE (30 août 2026, demande de Noé : « pour que sur la page
-- d'accueil ce soit un émoji qui le représente et non un texte »).
--
-- POURQUOI ÇA COMPTE PLUS QU'UN ORNEMENT. Les habitudes du jour vivent sur
-- l'accueil en jetons ronds — un rond de 26 px surmontant son nom en petit. Le
-- nom n'est là que pour RECONNAÎTRE, jamais pour lire : c'est écrit dans le
-- CLAUDE.md depuis le jour où la bande a été posée. Or un mot se lit toujours,
-- même quand on ne le lui demande pas, et cinq mots alignés sous cinq ronds
-- font une ligne de texte à parcourir là où l'on voulait un coup d'œil.
--
-- Un émoji se reconnaît sans se lire. C'est exactement le rôle qu'on donnait au
-- nom, tenu par un signe qui le remplit mieux.
--
-- FACULTATIF, ET IL LE RESTE. Une habitude sans émoji garde son nom sous le
-- rond : elle continue de fonctionner exactement comme avant. Rien ne force à
-- en poser un, et une habitude notée en trois secondes ne doit pas s'arrêter
-- pour être illustrée — même règle que la famille d'une tâche perso.
--
-- HUIT CARACTÈRES, et ce n'est pas « un caractère » : un émoji composé en
-- occupe plusieurs. Une famille (👨‍👩‍👧) tient sur huit unités UTF-16, un émoji
-- avec teinte de peau sur quatre. La borne laisse passer ce qui est légitime et
-- arrête un mot glissé dans le champ.

alter table public.habitudes
  add column if not exists emoji text
    check (emoji is null or char_length(emoji) between 1 and 8);

comment on column public.habitudes.emoji is
  'Le signe qui représente l''habitude sur l''accueil, à la place de son nom. Facultatif : sans lui, le nom reste affiché.';
