-- UNE PHOTO NOTÉE EST TRIÉE (21 novembre 2026, règle de Noé : « une photo doit
-- compter comme triée à partir du moment où elle a une note »).
--
-- C'est la NOTE qui fait foi, plus les étiquettes : la migration du matin
-- comptait triée toute photo étiquetée, et c'était une supposition. Les photos
-- étiquetées mais sans note retournent dans la pile — personne ne les avait
-- encore passées par elle (`triee` n'était posé que par cette migration).
-- Le geste « Trié » de la pile garde son sens : une photo sans rien à en dire
-- en sort aussi.
update photos set triee = false where note is null;
