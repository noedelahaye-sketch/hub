// LA FICHE D'UN FILM OU D'UNE SÉRIE — `#film/<id>` (5 septembre 2026).
//
// Elle ne fait que nommer son rayon : tout ce qu'elle montre vit dans
// js/fiche-oeuvre.js, partagé avec `#livre/<id>`.
import fabriquerFiche from './fiche-oeuvre.js';
import { RAYONS } from './bibliotheque.js';

export default fabriquerFiche(RAYONS.films);
