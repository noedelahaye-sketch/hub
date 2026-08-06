// Espace Yuno — l'activité de photographe sportif.
//
// La clé du projet reste 'photo' en base : c'est la valeur de la contrainte
// CHECK, et la renommer demanderait une migration pour rien. « Yuno » est le
// nom affiché, celui des réseaux.

import { creerEspaceProjet } from './espace-projet.js';

export default creerEspaceProjet({
  projet: 'photo',
  titre: 'Yuno',
  sousTitre: 'Photographe sportif · yuno_rph',
});
