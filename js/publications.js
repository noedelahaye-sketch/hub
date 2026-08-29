// Le calendrier éditorial — la matière et son rendu, partagés par les espaces.
//
// Construit d'abord pour Yuno, puis extrait ici quand le FC Hermitage a eu le
// même besoin : c'est le même outil, la même table (`publications`, colonne
// `espace`), les mêmes gestes. Seuls changent les réseaux proposés et les
// rubriques de départ, passés en paramètres.
//
// Le principe qui tient tout : **une idée est une publication sans date**.
// Noter une idée prend cinq secondes ; la programmer, c'est lui donner une date.

import { construireFormulaire } from './gabarits.js';
import { depuisDateISO, echeanceLisible, echapper } from './format.js';
import {
  RESEAUX,
  FORMATS,
  CYCLES_PUBLICATION,
  NOMS_STATUTS_BASE,
  cyclePublication,
  nomDuStatut,
  pastilleStatutPublication,
} from './calendrier-commun.js';

// L'ordre du cycle. Chaque statut connaît son suivant ; « publié » n'en a pas.
// Le cycle est un paramètre, parce qu'il n'est pas le même partout : Yuno pose
// une étape « à développer » entre l'idée et le brouillon (une idée qui mérite
// du travail avant d'être écrite), et le FC Hermitage n'a que trois états
// depuis le 25 août 2026 — à préparer, à programmer, publié.
//
// Les cycles eux-mêmes vivent dans `calendrier-commun.js`, avec les réseaux et
// les formats : la tuile du calendrier en a besoin, et c'est ce fichier-ci qui
// importe l'autre. Ils sont réexportés ici pour qui parle d'éditorial.
export const STATUTS = CYCLES_PUBLICATION.formation;
export const STATUTS_YUNO = CYCLES_PUBLICATION.photo;
export const STATUTS_FCH = CYCLES_PUBLICATION.fch;

export const NOMS_STATUTS = NOMS_STATUTS_BASE;
export { nomDuStatut };

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
      <span class="pub-statut">statut :
        <strong>${nomDuStatut(pub.espace, pub.statut)}</strong></span>
    </li>`;
}

// Le contenu complet, sans son enveloppe : la tuile de « À venir » l'enferme
// dans un <li>, la fenêtre d'une idée le pose tel quel.
// `options` porte ce qui change d'un espace à l'autre : le cycle des statuts,
// et l'aide à la création (les piliers et la checklist sont à Yuno).
export function corpsPublication(pub, options = {}) {
  const {
    cycle = cyclePublication(pub.espace),
    checklist = false,
    piliers = null,
    fenetre = false,
    pastille = false,
  } = options;
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
        ${
          // L'ÉTAT EST UN MENU DÉROULANT (demande de Noé, 29 août 2026), et
          // c'est LA MÊME pastille que celle du calendrier — dessinée une seule
          // fois dans `calendrier-commun.js`. Elle remplace un trio qui pesait
          // trois lignes : « statut : à préparer », un bouton « Passer en à
          // programmer » et « Repasser en idée ». Elle sait en plus ce que le
          // bouton ne savait pas : sauter un cran, et revenir en arrière.
          //
          // `pastille: false` par défaut — Yuno garde son bouton, personne ne
          // l'a demandé là-bas.
          pastille
            ? pastilleStatutPublication(pub)
            : `<span class="pub-statut">statut :
                 <strong>${nomDuStatut(pub.espace, pub.statut)}</strong></span>
               ${
                 suivant
                   ? `<button type="button" class="bouton-secondaire bouton-mini"
                        data-avancer="${echapper(pub.id)}">Passer en ${nomDuStatut(
                          pub.espace,
                          suivant,
                        )}</button>`
                   : ''
               }`
        }
        ${
          !suivant && pub.lien_publie
            ? `<a class="discret" href="${echapper(pub.lien_publie)}" target="_blank" rel="noopener">voir ↗</a>`
            : ''
        }
        ${
          datee
            ? pub.statut !== 'publie' && !pastille
              // Avec la pastille, le retour en arrière vit DANS le menu : garder
              // « Repasser en idée » à côté ferait deux gestes pour la même
              // chose, dont l'un efface la date sans le dire.
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

// UNE SEULE PARUTION PAR SÉRIE DANS « À VENIR » (29 août 2026, demande de Noé :
// « les publications régulières ne doivent pas toutes être visibles dans à
// venir, comme pour les tâches récurrentes »).
//
// C'est la règle de l'espace Tâches, mot pour mot (`separerLesSeries`,
// js/taches.js, 27 août) : sans elle, les 28 parutions des deux séries
// hebdomadaires du club noyaient les quelques publications qu'il y avait
// vraiment à préparer. Rien n'est caché — tout se déplie.
//
// « Prochaine » veut dire la plus proche, pas la première à venir : une
// parution dont le jour est passé reste devant. Le hub ne compte pas les
// retards, mais il ne les efface pas non plus.
//
// Exportée pour être vérifiable seule, avec des publications factices.
export function separerLesSeriesPub(publications) {
  const seules = [];
  const parSerie = new Map();

  for (const pub of publications) {
    if (!pub.serie_id) {
      seules.push(pub);
      continue;
    }
    const deja = parSerie.get(pub.serie_id);
    if (deja) deja.push(pub);
    else parSerie.set(pub.serie_id, [pub]);
  }

  const prochaines = [];
  const series = [];

  for (const occurrences of parSerie.values()) {
    const triees = [...occurrences].sort((a, b) =>
      String(a.date_prevue ?? '').localeCompare(String(b.date_prevue ?? '')),
    );
    prochaines.push(triees[0]);
    if (triees.length > 1) series.push(triees.slice(1));
  }

  return { aVenir: [...seules, ...prochaines], series };
}

function blocDUneSeriePub(occurrences, options) {
  const [premiere] = occurrences;
  return `
    <details class="backlog serie-repliee">
      <summary>
        <span class="serie-titre">${echapper(premiere.titre)}</span>
        <span class="serie-rythme">qui revient</span>
        <span class="chiffre">${occurrences.length}</span>
      </summary>
      <ul>${occurrences.map((pub) => construirePublication(pub, options)).join('')}</ul>
    </details>`;
}

export function construireAVenir(publications, options = {}) {
  // `series: false` par défaut — Yuno n'a rien demandé, et sa banque d'idées
  // se lit autrement. Le FCH l'active.
  const { series: replier = false } = options;

  const datees = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));

  if (!datees.length) {
    return `<p class="vide">Rien de programmé. Une idée de la banque n'attend qu'une date.</p>`;
  }

  if (!replier) {
    return `<ul>${datees.map((pub) => construirePublication(pub, options)).join('')}</ul>`;
  }

  const { aVenir, series } = separerLesSeriesPub(datees);
  const triees = aVenir.sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));
  const repliees = series.reduce((total, lot) => total + lot.length, 0);

  return `
    <ul>${triees.map((pub) => construirePublication(pub, options)).join('')}</ul>
    ${
      series.length
        ? `<p class="discret sous-titre">La prochaine fois de chaque série est restée
             au-dessus. Voici ce qui suit — <span class="chiffre">${repliees}</span> parutions.</p>
           ${series
             .sort((a, b) => a[0].date_prevue.localeCompare(b[0].date_prevue))
             .map((lot) => blocDUneSeriePub(lot, options))
             .join('')}`
        : ''
    }`;
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

// Les rubriques proposées : celles de l'espace, plus celles déjà écrites. La
// saisie reste libre — la liste n'est qu'un appui.
export function rubriquesProposees(publications, rubriquesDepart) {
  return [
    ...new Set([
      ...rubriquesDepart,
      ...publications.map((pub) => pub.rubrique).filter(Boolean),
    ]),
  ];
}

// `champsEnPlus` laisse un espace ajouter ce qui lui est propre — chez Yuno le
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
