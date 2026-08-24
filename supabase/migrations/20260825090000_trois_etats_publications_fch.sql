-- Le calendrier éditorial du FC Hermitage passe à TROIS états (demande de Noé,
-- 25 août 2026) : à préparer, à programmer, publié.
--
-- Aucun changement de schéma. Les trois états réutilisent des valeurs que la
-- colonne accepte déjà — `idee`, `pret`, `publie` — et ce sont les mots
-- affichés qui changent (voir `nomDuStatut`, js/calendrier-commun.js). Le CHECK
-- reste tel quel : il s'élargit, il ne se resserre jamais, et `brouillon` sert
-- toujours à Yuno.
--
-- Reste à ranger les lignes du club qui portaient `brouillon` : elles sont « à
-- préparer », le travail n'était pas fini.
update publications
   set statut = 'idee'
 where projet = 'fch'
   and statut in ('brouillon', 'a_developper');
