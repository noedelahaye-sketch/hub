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
// Le cycle est un paramètre, parce qu'il n'est pas le même partout : Yuno pose
// une étape « à développer » entre l'idée et le brouillon (une idée qui mérite
// du travail avant d'être écrite), le FC Hermitage n'en a pas demandé.
export const STATUTS = ['idee', 'brouillon', 'pret', 'publie'];
export const STATUTS_YUNO = ['idee', 'a_developper', 'brouillon', 'pret', 'publie'];

export const NOMS_STATUTS = {
  idee: 'idée',
  a_developper: 'à développer',
  brouillon: 'brouillon',
  pret: 'prêt',
  publie: 'publié',
};

// Le rappel de ce qui fait tenir un carrousel. Sans IA : c'est un aide-mémoire
// qui ferme un débat mental, pas un outil qui écrit à la place de Noé.
const CHECKLIST_CARROUSEL = [
  'Un hook de 5 à 8 mots sur la slide 1.',
  'Les slides 1 ET 2 fortes — la 2 retient autant que la 1.',
  'Tension, puis développement, puis appel à l’action.',
  'Légende courte.',
];

function checklistCarrousel() {
  return `
    <details class="checklist-carrousel">
      <summary>Checklist carrousel</summary>
      <ul class="liste-checklist">
        ${CHECKLIST_CARROUSEL.map((point) => `<li>${point}</li>`).join('')}
      </ul>
    </details>`;
}

export function etiquettes(pub) {
  return `
    <span class="etiquette etiquette-reseau">${echapper(RESEAUX[pub.reseau] ?? pub.reseau)}</span>
    <span class="etiquette">${echapper(FORMATS[pub.format] ?? pub.format)}</span>`;
}

// L'en-tête d'une publication : ce qu'elle est, où elle se range, et quand.
// Partagé par l'aperçu et la fiche complète — les deux montrent la même chose
// en tête, seule la suite diffère.
function entetePublication(pub, piliers) {
  const datee = Boolean(pub.date_prevue);

  return `
    <span class="tuile-entete">
      ${etiquettes(pub)}
      ${
        piliers && pub.pilier
          ? `<span class="etiquette etiquette-pilier" data-pilier="${echapper(
              String(pub.pilier),
            )}">${echapper(`${pub.pilier}. ${piliers[pub.pilier]?.nom ?? ''}`)}</span>`
          : ''
      }
      ${pub.rubrique ? `<span class="pub-rubrique">${echapper(pub.rubrique)}</span>` : ''}
      ${
        datee
          ? `<span class="discret quand">${echapper(
              echeanceLisible(depuisDateISO(pub.date_prevue)),
            )}</span>`
          : ''
      }
    </span>`;
}

// L'aperçu : ce qu'elle est, ce qu'elle dit, où elle en est. Rien d'autre. La
// preuve, le « pourquoi chez moi », les notes, la checklist et les gestes
// vivent dans la fenêtre — une banque se parcourt du regard, et quarante-trois
// tuiles qui déballent tout ne se parcourent pas.
// La tuile entière est le bouton : role et tabindex la rendent ouvrable au
// clavier, comme les cases du calendrier.
export function construireApercuPublication(pub, options = {}) {
  const { piliers = null } = options;

  return `
    <li class="tuile-apercu" role="button" tabindex="0"
      ${pub.pilier ? `data-pilier="${echapper(String(pub.pilier))}"` : ''}
      data-ouvrir-pub="${echapper(pub.id)}"
      aria-label="Ouvrir « ${echapper(pub.titre)} »">
      ${entetePublication(pub, piliers)}
      <span class="pub-titre">${echapper(pub.titre)}</span>
      <span class="pub-statut">statut : <strong>${NOMS_STATUTS[pub.statut]}</strong></span>
    </li>`;
}

// Le contenu complet, sans son enveloppe : la tuile de « À venir » l'enferme
// dans un <li>, la fenêtre d'une idée le pose tel quel.
// `options` porte ce qui change d'un projet à l'autre : le cycle des statuts,
// et l'aide à la création (les piliers et la checklist sont à Yuno).
export function corpsPublication(pub, options = {}) {
  const { cycle = STATUTS, checklist = false, piliers = null, fenetre = false } = options;
  const suivant = cycle[cycle.indexOf(pub.statut) + 1];
  const datee = Boolean(pub.date_prevue);

  return `
      ${entetePublication(pub, piliers)}
      <span class="pub-titre">${echapper(pub.titre)}</span>
      ${
        // La preuve dit pourquoi le format marche déjà ; le « pourquoi moi »,
        // pourquoi il est à sa place chez Noé. Les deux ferment le débat qui
        // revenait à chaque publication.
        pub.preuve
          ? `<span class="discret pub-preuve"><strong>Preuve</strong> ${echapper(pub.preuve)}</span>`
          : ''
      }
      ${
        pub.pourquoi_moi
          ? `<span class="discret pub-preuve"><strong>Pourquoi chez moi</strong> ${echapper(
              pub.pourquoi_moi,
            )}</span>`
          : ''
      }
      ${pub.notes ? `<span class="discret pub-notes">${echapper(pub.notes)}</span>` : ''}
      ${
        // `post` reste reconnu à côté de `carrousel` : les deux formats ont
        // fusionné le 15 août 2026, et d'anciennes lignes peuvent encore
        // porter l'un ou l'autre.
        checklist && ['carrousel', 'post'].includes(pub.format) ? checklistCarrousel() : ''
      }
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
        ${
          // Dans une fenêtre, la croix de suppression tomberait sous celle qui
          // ferme, au même bord : deux « × » l'un au-dessus de l'autre, dont
          // l'un est irréversible. Ici le geste s'écrit.
          fenetre
            ? `<button type="button" class="lien-discret bouton-mini bouton-retirer"
                 data-supprimer-pub="${echapper(pub.id)}"
                 aria-label="Supprimer « ${echapper(pub.titre)} »">Supprimer l'idée</button>`
            : `<button type="button" class="lien-discret bouton-mini bouton-retirer"
                 data-supprimer-pub="${echapper(pub.id)}"
                 title="Supprimer"
                 aria-label="Supprimer « ${echapper(pub.titre)} »">×</button>`
        }
      </span>`;
}

// La tuile complète, telle qu'elle sert encore à « À venir » et au site du FCH.
// `ouvrable` : la tuile s'ouvre au clic (le site FCH édite ses publications en
// fenêtre volante, 24 août 2026) — sauf sur ses propres contrôles, c'est le
// gestionnaire de l'espace qui fait le tri.
export function construirePublication(pub, options = {}) {
  const porte = options.ouvrable ? ` data-ouvrir-pub="${echapper(pub.id)}"` : '';
  return `<li${porte}>${corpsPublication(pub, options)}</li>`;
}

export function construireAVenir(publications, options = {}) {
  const datees = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));

  if (!datees.length) {
    return `<p class="vide">Rien de programmé. Une idée de la banque n'attend qu'une date.</p>`;
  }
  return `<ul>${datees.map((pub) => construirePublication(pub, options)).join('')}</ul>`;
}

export function construireBanque(publications, options = {}) {
  const idees = publications
    // Une publiée sans date n'est plus une idée : elle vit dans « Publiées »,
    // et la banque ne doit pas la garder en double.
    .filter((pub) => !pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (!idees.length) {
    return `<p class="vide">Ta banque d'idées démarre ici. Note tout, trie ensuite.</p>`;
  }
  return `<ul>${idees.map((pub) => construireApercuPublication(pub, options)).join('')}</ul>`;
}

export function construirePubliees(publications, options = {}) {
  const publiees = publications
    .filter((pub) => pub.statut === 'publie')
    .sort((a, b) => (b.date_prevue ?? '').localeCompare(a.date_prevue ?? ''));

  if (!publiees.length) return '';
  return `
    <details class="backlog">
      <summary>Publiées <span class="chiffre">${publiees.length}</span></summary>
      <ul>${publiees.map((pub) => construireApercuPublication(pub, options)).join('')}</ul>
    </details>`;
}

// L'aperçu d'accueil : de quoi savoir où en est la création sans ouvrir
// l'outil — trois programmées, trois idées fraîches.
// `idees: false` retire la moitié « banque » de l'aperçu : il ne reste que ce
// qui est programmé. L'accueil de Yuno s'en sert — la banque y a sa page, elle
// n'a pas à déborder sur l'accueil. Les trois autres espaces gardent les deux.
export function construireApercuCreation(publications, { idees: avecIdees = true } = {}) {
  const prochaines = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))
    .slice(0, 3);
  const idees = avecIdees
    ? publications
        .filter((pub) => !pub.date_prevue)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 3)
    : [];

  const lignes = [...prochaines, ...idees];
  if (!lignes.length) {
    return avecIdees
      ? `<p class="vide">Tes prochaines publications et idées s'afficheront ici.</p>`
      : `<p class="vide">Tes prochaines publications s'afficheront ici.</p>`;
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

// `champsEnPlus` laisse un projet ajouter ce qui lui est propre — chez Yuno le
// pilier, la preuve et le « pourquoi chez moi ». Le titre suffit toujours :
// noter une idée doit rester une affaire de cinq secondes.
// `avecPli: false` sort le formulaire de son dépliant : c'est ce qu'il faut
// dans une fenêtre volante, où le titre est déjà dit par la fenêtre.
export function formulaireIdee({
  id = 'pub',
  publications,
  rubriquesDepart,
  reseaux = RESEAUX,
  champsEnPlus = [],
  avecPli = true,
}) {
  return construireFormulaire({
    id,
    libelle: 'Noter une idée',
    action: 'noter-idee',
    avecPli,
    champs: [
      { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true },
      { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: reseaux },
      { nom: 'format', libelle: 'Format', type: 'choix', options: FORMATS },
      ...champsEnPlus,
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
        nom: 'heure',
        libelle: 'À quelle heure (vide = dans la journée)',
        type: 'time',
      },
      {
        nom: 'notes',
        libelle: 'Notes — légende, plan, références (facultatif)',
        type: 'textarea',
      },
    ],
  });
}
