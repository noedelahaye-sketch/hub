// Le calendrier éditorial — la matière et son rendu, partagés par les projets.
//
// Construit d'abord pour Yuno, puis extrait ici quand le FC Hermitage a eu le
// même besoin : c'est le même outil, la même table (`publications`, colonne
// `projet`), les mêmes gestes. Seuls changent les réseaux proposés et les
// rubriques de départ, passés en paramètres.
//
// Le principe qui tient tout : **une idée est une publication sans date**.
// Noter une idée prend cinq secondes ; la programmer, c'est lui donner une date.

import { construireFormulaire } from './espace-projet.js';
import { depuisDateISO, echeanceLisible, echapper } from './format.js';
import { RESEAUX, FORMATS } from './calendrier-commun.js';

// L'ordre du cycle. Chaque statut connaît son suivant ; « publié » n'en a pas.
export const STATUTS = ['idee', 'brouillon', 'pret', 'publie'];
export const NOMS_STATUTS = {
  idee: 'idée',
  brouillon: 'brouillon',
  pret: 'prêt',
  publie: 'publié',
};

export function etiquettes(pub) {
  return `
    <span class="etiquette etiquette-reseau">${echapper(RESEAUX[pub.reseau] ?? pub.reseau)}</span>
    <span class="etiquette">${echapper(FORMATS[pub.format] ?? pub.format)}</span>`;
}

export function construirePublication(pub) {
  const suivant = STATUTS[STATUTS.indexOf(pub.statut) + 1];
  const datee = Boolean(pub.date_prevue);

  return `
    <li>
      <span class="tuile-entete">
        ${etiquettes(pub)}
        ${pub.rubrique ? `<span class="pub-rubrique">${echapper(pub.rubrique)}</span>` : ''}
        ${
          datee
            ? `<span class="discret quand">${echapper(
                echeanceLisible(depuisDateISO(pub.date_prevue)),
              )}</span>`
            : ''
        }
      </span>
      <span class="pub-titre">${echapper(pub.titre)}</span>
      ${pub.notes ? `<span class="discret pub-notes">${echapper(pub.notes)}</span>` : ''}
      <span class="pub-actions">
        <span class="pub-statut">statut : <strong>${NOMS_STATUTS[pub.statut]}</strong></span>
        ${
          suivant
            ? `<button type="button" class="bouton-secondaire bouton-mini"
                 data-avancer="${echapper(pub.id)}">Passer en ${NOMS_STATUTS[suivant]}</button>`
            : pub.lien_publie
              ? `<a class="discret" href="${echapper(pub.lien_publie)}" target="_blank" rel="noopener">voir ↗</a>`
              : ''
        }
        ${
          datee
            ? pub.statut !== 'publie'
              ? `<button type="button" class="lien-discret bouton-mini"
                   data-deprogrammer="${echapper(pub.id)}"
                   title="Retirer la date : la publication redevient une idée">Repasser en idée</button>`
              : ''
            : `<input type="date" class="pub-programmer" data-programmer="${echapper(pub.id)}"
                 title="Programmer cette idée" aria-label="Programmer « ${echapper(pub.titre)} »">`
        }
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-supprimer-pub="${echapper(pub.id)}"
          title="Supprimer"
          aria-label="Supprimer « ${echapper(pub.titre)} »">×</button>
      </span>
    </li>`;
}

export function construireAVenir(publications) {
  const datees = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));

  if (!datees.length) {
    return `<p class="vide">Rien de programmé. Une idée de la banque n'attend qu'une date.</p>`;
  }
  return `<ul>${datees.map(construirePublication).join('')}</ul>`;
}

export function construireBanque(publications) {
  const idees = publications
    .filter((pub) => !pub.date_prevue)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (!idees.length) {
    return `<p class="vide">Ta banque d'idées démarre ici. Note tout, trie ensuite.</p>`;
  }
  return `<ul>${idees.map(construirePublication).join('')}</ul>`;
}

export function construirePubliees(publications) {
  const publiees = publications
    .filter((pub) => pub.statut === 'publie')
    .sort((a, b) => (b.date_prevue ?? '').localeCompare(a.date_prevue ?? ''));

  if (!publiees.length) return '';
  return `
    <details class="backlog">
      <summary>Publiées <span class="chiffre">${publiees.length}</span></summary>
      <ul>${publiees.map(construirePublication).join('')}</ul>
    </details>`;
}

// L'aperçu d'accueil : de quoi savoir où en est la création sans ouvrir
// l'outil — trois programmées, trois idées fraîches.
export function construireApercuCreation(publications) {
  const prochaines = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))
    .slice(0, 3);
  const idees = publications
    .filter((pub) => !pub.date_prevue)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3);

  const lignes = [...prochaines, ...idees];
  if (!lignes.length) {
    return `<p class="vide">Tes prochaines publications et idées s'afficheront ici.</p>`;
  }

  return `<ul>${lignes
    .map(
      (pub) => `
      <li>
        <span class="tuile-entete">
          ${etiquettes(pub)}
          <span class="discret quand">${
            pub.date_prevue
              ? echapper(echeanceLisible(depuisDateISO(pub.date_prevue)))
              : 'idée'
          }</span>
        </span>
        <span class="pub-titre">${echapper(pub.titre)}</span>
      </li>`,
    )
    .join('')}</ul>`;
}

// Les rubriques proposées : celles du projet, plus celles déjà écrites. La
// saisie reste libre — la liste n'est qu'un appui.
export function rubriquesProposees(publications, rubriquesDepart) {
  return [
    ...new Set([
      ...rubriquesDepart,
      ...publications.map((pub) => pub.rubrique).filter(Boolean),
    ]),
  ];
}

export function formulaireIdee({ id = 'pub', publications, rubriquesDepart, reseaux = RESEAUX }) {
  return construireFormulaire({
    id,
    libelle: 'Noter une idée',
    action: 'noter-idee',
    champs: [
      { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true },
      { nom: 'reseau', libelle: 'Réseau', type: 'select', options: reseaux },
      { nom: 'format', libelle: 'Format', type: 'select', options: FORMATS },
      {
        nom: 'rubrique',
        libelle: 'Rubrique (libre)',
        type: 'text',
        suggestions: rubriquesProposees(publications, rubriquesDepart),
      },
      {
        nom: 'date_prevue',
        libelle: 'Date prévue (facultative — sans date, ça reste une idée)',
        type: 'date',
      },
      {
        nom: 'notes',
        libelle: 'Notes — légende, plan, références (facultatif)',
        type: 'textarea',
      },
    ],
  });
}
