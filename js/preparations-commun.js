// La feuille de préparation — le noyau commun à Yuno et au FCH.
//
// Née chez Yuno pour les sorties photo (14 août 2026), la feuille sert aussi
// aux réunions du FCH depuis le 21 août : trois phases de cases à cocher,
// copiées d'un modèle, puis un bilan. Le précédent est `calendrier-commun.js` :
// quand un deuxième site a besoin du même écran, le code déménage ici plutôt
// que d'être recopié — deux copies divergent toujours.
//
// Ne vivent ici que les FABRIQUES neutres : la ligne, la phase, le bouton
// « Préparer », la feuille d'une sortie, le dernier bilan d'un même modèle.
// Le bilan, lui, reste chez chaque site : deux questions et « inscrire au
// carnet » chez Yuno, deux ou trois questions et « en tirer des tâches » au
// FCH — ce n'est pas le même geste, il n'a pas à faire semblant.
//
// Un item non coché n'est JAMAIS un raté : rien ici ne compte les manqués,
// le bilan dit d'abord l'obtenu (philosophie du hub).

import { echapper } from './format.js';

export const PHASES_PREPA = { avant: 'Avant', pendant: 'Pendant', apres: 'Après' };

// La ligne reprend la forme des tâches — même cercle, même coche : un geste se
// reconnaît sans réfléchir. Pas de priorité ici, le cercle reste gris.
export function lignePreparation(item) {
  return `
    <li class="tache-ligne${item.fait ? ' tache-faite' : ''}">
      <button type="button" class="tache-cercle" data-cocher-prepa="${echapper(item.id)}"
        aria-pressed="${item.fait}"
        aria-label="${item.fait ? 'Décocher' : 'Cocher'} « ${echapper(item.texte)} »"></button>
      <span class="tache-corps"><span class="tache-titre">${echapper(item.texte)}</span></span>
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-retirer-prepa="${echapper(item.id)}"
        title="Retirer cette ligne"
        aria-label="Retirer « ${echapper(item.texte)} »">×</button>
    </li>`;
}

// Une phase vide n'est pas un écran vide : le champ d'ajout est là, il suffit.
// `auModele` : l'item ajouté peut aussi entrer dans le modèle d'origine —
// c'est la boucle d'apprentissage, le modèle s'enrichit du terrain. La case
// n'apparaît que si le modèle existe encore, et repart décochée à chaque
// ajout : entrer au modèle est une décision par item, pas un réglage.
// `invitePendant` : le placeholder de la phase du milieu — les plans photo
// chez Yuno, rien de spécial ailleurs.
export function blocPhase(feuille, phase, { auModele = false, invitePendant = 'Ajouter…' } = {}) {
  const items = feuille.items.filter((item) => item.phase === phase);

  return `
    <section class="bloc prepa-phase">
      <h2>${PHASES_PREPA[phase]}</h2>
      ${
        items.length
          ? `<ul class="liste-taches-pleine prepa-liste">${items
              .map(lignePreparation)
              .join('')}</ul>`
          : ''
      }
      <form data-action="ajouter-item-prepa" data-phase="${phase}" class="prepa-ajout">
        <input type="hidden" name="preparation_id" value="${echapper(feuille.id)}">
        <input type="hidden" name="phase" value="${phase}">
        <input type="text" name="texte" autocomplete="off" required
          aria-label="Ajouter à « ${PHASES_PREPA[phase]} »"
          placeholder="${phase === 'pendant' ? echapper(invitePendant) : 'Ajouter…'}">
        <button type="submit" class="bouton-secondaire bouton-mini">Ajouter</button>
        ${
          auModele
            ? `<label class="prepa-au-modele discret">
                 <input type="checkbox" name="au_modele" value="oui"> aussi au modèle</label>`
            : ''
        }
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </section>`;
}

// Le dernier « à refaire autrement » du même modèle : c'est là que le bilan
// paie — on le relit en préparant la sortie suivante, pas en rangeant.
export function dernierBilan(preparations, feuille) {
  return (
    preparations
      .filter(
        (autre) =>
          autre.id !== feuille.id &&
          autre.modele_id &&
          autre.modele_id === feuille.modele_id &&
          autre.bilan_mieux,
      )
      .sort((a, b) =>
        String(b.date ?? b.created_at).localeCompare(String(a.date ?? a.created_at)),
      )[0] ?? null
  );
}

export function feuilleDeLaSortie(preparations, type, id) {
  return (
    preparations.find((feuille) =>
      type === 'evenement' ? feuille.evenement_id === id : feuille.commande_id === id,
    ) ?? null
  );
}

export function boutonPreparer(feuille, type, id) {
  return feuille
    ? `<button type="button" class="bouton-secondaire bouton-mini"
         data-ouvrir-preparation="${echapper(feuille.id)}">Ouvrir la préparation</button>`
    : `<button type="button" class="bouton-secondaire bouton-mini"
         data-preparer="${echapper(type)}:${echapper(id)}">Préparer</button>`;
}

// La fin d'un événement, quand la colonne ne la dit pas. Deux conventions déjà
// posées ailleurs dans le hub, reprises ici plutôt que réinventées : minuit
// veut dire « pas d'heure », et la tuile propose deux heures par défaut pour
// un événement qui en porte une.
export function finDeLaSortie(sortie) {
  if (sortie.date_fin) return new Date(sortie.date_fin);

  const debut = new Date(sortie.date_debut);
  const sansHeure = debut.getHours() === 0 && debut.getMinutes() === 0;
  if (sansHeure) {
    // Un jour entier : la sortie tient jusqu'à la fin de sa journée.
    const soir = new Date(debut);
    soir.setHours(23, 59, 59, 999);
    return soir;
  }
  return new Date(debut.getTime() + 2 * 60 * 60 * 1000);
}

// Combien de temps « Après » reste la phase courante. Au-delà, l'événement est
// derrière soi : l'accueil n'a plus à en parler.
const APRES_DURE = 24 * 60 * 60 * 1000;

export function phaseDeLaSortie(sortie, reference = new Date()) {
  const debut = new Date(sortie.date_debut);
  const fin = finDeLaSortie(sortie);

  if (reference < debut) return 'avant';
  if (reference <= fin) return 'pendant';
  if (reference - fin <= APRES_DURE) return 'apres';
  return null;
}
