// LA FICHE D'UN LIVRE — `#livre/<id>`.
//
// Elle ne fait que nommer son rayon : tout ce qu'elle montre vit dans
// js/fiche-oeuvre.js, partagé avec `#film/<id>` depuis le 5 septembre 2026. Deux
// copies auraient fini par ne plus montrer les mêmes chiffres.
import fabriquerFiche from './fiche-oeuvre.js';
import { RAYONS } from './bibliotheque.js';

export default fabriquerFiche(RAYONS.livres);
