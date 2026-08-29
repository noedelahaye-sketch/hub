// Le SITE FC Hermitage (docs/fch-spec.md).
//
// À l'adresse #hermitage, tout l'habillage du hub disparaît (voir styles.css).
// La page FCH DU hub vit dans js/fch.js (#fch).
//
//   #hermitage              l'accueil : objectifs, la com' à venir, victoires
//   #hermitage/creer        le calendrier éditorial du club
//   #hermitage/calendrier   tout ce qui a une date au FCH, avec filtres
//   #hermitage/partenaires  les partenaires du club
//   #hermitage/club         l'organisation du club — attend son contenu
//
// Ce site est fait pour grandir : Noé ne sait pas encore tout ce qu'il y
// mettra. Chaque écran est une sous-adresse indépendante, on en ajoute un sans
// toucher aux autres.

import * as api from './api.js';
import {
  modifierAussitot,
  retirerAussitot,
  identifiantProvisoire,
  estProvisoire,
} from './ecriture.js';
import {
  construireFormulaire,
  construireFenetre,
  construireObjectifs,
  construireVictoires,
} from './gabarits.js';
import {
  STATUTS_FCH,
  construireAVenir,
  construireBanque,
  construirePubliees,
  construireApercuCreation,
  formulaireIdee,
  rubriquesProposees,
} from './publications.js';
import {
  depuisDateISO,
  echeanceLisible,
  momentLisible,
  echapper,
  versDateISO,
  RECURRENCES,
} from './format.js';
import { finDeLaSortie, phaseDeLaSortie } from './preparations-commun.js';
import { REPERES, MISSION, VALEURS, COMMISSIONS, CRENEAUX } from './club-fch.js';
import {
  trierTaches,
  construireLignesTaches,
  cocherDepuisTableauDeBord,
  separerLesSeries,
} from './taches.js';
import { construireCapGrave } from './objectifs-commun.js';

import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  construireBarrePeriode,
  construireGrille,
  fenetreDetail,
  fenetreJour,
  elementsDuJour,
  finDeLEvenement,
  passageDePublication,
  brancherEtatPublication,
  brancherSelection,
  brancherClavier,
  brancherDeplacement,
  appliquerAuCalendrier,
  champsApresDeplacement,
  deplacerAncre,
  natureParDefaut,
  centrerActif,
  ongletCalendrier,
  fenetreCreation,
  brancherCapture,
  poserAuCalendrier,
  REUNION_OBJETS,
  FORMATS,
} from './calendrier-commun.js';

const ESPACE = 'fch';

// Les réseaux du club. Facebook d'abord : c'est celui des clubs amateurs, des
// parents et des bénévoles, avant Instagram.
const RESEAUX_FCH = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

// LES RUBRIQUES RÉELLES DU CLUB (29 août 2026). Elles ne sont plus proposées à
// l'aveugle : elles viennent de l'arborescence `Communication/Réseaux/` du
// dossier FCH, éprouvée sur trois saisons, puis corrigée par Noé.
//
// Ce qu'elles remplacent, et pourquoi c'est important : six rubriques
// inventées le 7 août faute de mieux — avant-match, portrait de joueur,
// coulisses… — dont AUCUNE ne correspondait à ce qu'il publie. Résultat
// mesuré le 29 août : 42 des 44 publications du club ne portaient aucune
// rubrique. On ne remplissait pas le champ parce qu'on ne lui proposait pas
// les bons mots.
//
// Trois sorties de la liste, toutes de Noé (29 août) :
//   — les ANNIVERSAIRES sont des storys, elles ne passent pas au calendrier
//     éditorial. Elles restent un vrai travail : le projet « Anniversaires du
//     mois » et sa tâche à la quinzaine ne bougent pas.
//   — le JOUEUR DE LA SEMAINE désignait autre chose, hors réseaux, et pas
//     cette saison.
//   — le MPP (MonPetitProno × FCH) n'est pas décidé pour cette saison.
const RUBRIQUES_DEPART = [
  'Programmation du week-end',
  'Résultats du week-end',
  'Présentation des catégories',
  'Trombinoscopes',
  'Reprises',
  'Licences',
  'Calendrier',
  'Saison & plannings',
  'Bilans de saison',
  'Recrutement',
  'Entente',
];

// CE QUI REVIENT CHAQUE SEMAINE, et seulement ça. Les autres rubriques
// ci-dessus reviennent chaque SAISON, à un moment (les licences en été, les
// bilans en juin) : ce ne sont pas des séries, et leur poser une récurrence
// hebdomadaire mentirait. Elles restent des suggestions du formulaire.
const SAISON_HEBDO = ['Programmation du week-end', 'Résultats du week-end'];

// Les partenaires sont des contacts de type 'marque' : même table que le
// réseau de Yuno, c'est la même matière (docs/fch-spec.md, §5).
const TYPE_PARTENAIRE = 'marque';

const VUES = ['accueil', 'creer', 'reunions', 'calendrier', 'partenaires', 'club'];

// Les natures que le calendrier du site assemble — ni relance ni commande,
// elles vivent chez Yuno. La liste sert aux filtres (pas de case sans effet)
// et à l'état initial des cases cochées.
const NATURES_FCH = ['evenement', 'tache', 'publication', 'objectif'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  // Le calendrier n'est plus dans cette liste : il va en bout de barre, en
  // icône (voir `ongletCalendrier`). « Partenaires » y gagne la place qui lui
  // manquait sur 375 px.
  //
  // Plus de logo en tête de page (demande de Noé, 24 août 2026) : il DEVIENT
  // l'onglet Accueil — le dessin entier en une seule encre, par un masque CSS
  // teinté par `currentColor`, qui suit donc les couleurs des autres onglets :
  // blanc plein quand il est actif, bleu-gris adapté sinon.
  const liens = [
    ['creer', 'Créer', '#hermitage/creer'],
    ['reunions', 'Réunions', '#hermitage/reunions'],
    ['partenaires', 'Partenaires', '#hermitage/partenaires'],
    ['club', 'Club', '#hermitage/club'],
  ];

  return `
    <nav class="fch-nav" aria-label="Le site FC Hermitage">
      <a href="#hermitage" class="${vueActive === 'accueil' ? 'actif' : ''}"
        ${vueActive === 'accueil' ? 'aria-current="page"' : ''}
        title="Accueil" aria-label="Accueil">
        <span class="fch-logo-onglet" aria-hidden="true"></span>
      </a>
      ${liens
        .map(
          ([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === vueActive ? 'actif' : ''}"
          ${vue === vueActive ? 'aria-current="page"' : ''}>${libelle}</a>`,
        )
        .join('')}
      ${ongletCalendrier('#hermitage/calendrier', vueActive === 'calendrier')}
    </nav>`;
}

// La seule mention du hub sur tout le site, tout en bas.
function pied() {
  return `
    <footer class="fch-pied">
      <a class="lien-discret" href="#fch">Quitter le site</a>
    </footer>`;
}

export function construirePartenaires(partenaires) {
  if (!partenaires.length) {
    return `<p class="vide">Les partenaires du club s'ajouteront ici.</p>`;
  }

  return `<ul>${partenaires
    .map((partenaire) => {
      const liens = [
        partenaire.email
          ? `<a href="mailto:${encodeURIComponent(partenaire.email)}">${echapper(partenaire.email)}</a>`
          : null,
        partenaire.telephone
          ? `<a href="tel:${echapper(partenaire.telephone.replace(/\s/g, ''))}">${echapper(partenaire.telephone)}</a>`
          : null,
      ].filter(Boolean);

      return `
        <li>
          <span class="tuile-entete">
            <span class="etiquette">Partenaire</span>
            ${
              partenaire.structure
                ? `<span class="contact-structure">${echapper(partenaire.structure)}</span>`
                : ''
            }
            <button type="button" class="lien-discret bouton-mini bouton-retirer"
              data-supprimer-partenaire="${echapper(partenaire.id)}"
              title="Retirer"
              aria-label="Retirer ${echapper(partenaire.nom)}">×</button>
          </span>
          <span class="partenaire-nom">${echapper(partenaire.nom)}</span>
          ${liens.length ? `<span class="partenaire-liens">${liens.join('<span class="discret"> · </span>')}</span>` : ''}
          ${partenaire.notes ? `<span class="discret partenaire-notes">${echapper(partenaire.notes)}</span>` : ''}
          <span class="contact-echange">
            <label class="discret">Dernier échange
              <input type="date" class="pub-programmer" data-echange="${echapper(partenaire.id)}"
                value="${echapper(partenaire.dernier_echange ?? '')}">
            </label>
          </span>
        </li>`;
    })
    .join('')}</ul>`;
}

// --- Les réunions --------------------------------------------------------------
// Une réunion est un ÉVÉNEMENT fch dont `reunion_objet` est posé (demande de
// Noé, 21 août 2026). Elle se note au calendrier — le « + », nature Événement,
// pastille Réunion — et se prépare ici, sur une FICHE structurée par le guide
// « Réunions efficaces » du club (refonte du 21 août au soir : la feuille à
// cases de Yuno listait des gestes, le guide demande une structure).
//
//   AVANT — le contrat : le type de réunion, l'objectif formulé « à la fin,
//   nous devons avoir… », les participants utiles, ce qui s'envoie avant, et
//   l'ordre du jour orienté action — chaque point commence par un verbe,
//   annonce sa sortie attendue et son temps. Trois gros sujets maximum.
//
//   PENDANT — tenir le cadre : le déroulé sous les yeux, chaque point clos
//   par « traité » ou un report EXPLICITE, et le kit d'animation si j'anime.
//
//   APRÈS — le compte-rendu court : décisions prises, actions (quoi, qui,
//   pour quand), points en attente, prochain suivi. Les actions entrent au
//   TABLEAU DES ACTIONS — la mémoire du club, qui survit aux fiches — et la
//   réunion suivante s'ouvre en le relisant. Une action « pour moi » devient
//   aussi une tâche fch : ce qui se décide entre dans le circuit.
//
// La présentation et le compte-rendu vivent sur le Drive du club : la fiche
// ouvre les portes (copier le dernier document garde les couleurs du club) et
// garde les liens une fois les documents créés.

const estReunion = (evenement) => Boolean(evenement.reunion_objet);

// Les types du guide : le type commande la méthode — une réunion d'information
// est courte, une décision finit par un choix écrit, une coordination par un
// tableau de rôles.
const TYPES_REUNION = {
  information: 'Information',
  decision: 'Décision',
  coordination: 'Coordination',
  probleme: 'Problème à résoudre',
  ideation: 'Idées',
  bilan: 'Bilan',
  gouvernance: 'Gouvernance',
};

// Les types d'un point d'ordre du jour, dits en verbes : un point efficace
// commence par un verbe d'action et annonce un résultat, pas un thème.
const TYPES_POINT = {
  decision: 'Décider',
  information: 'Informer',
  coordination: 'Répartir',
  probleme: 'Résoudre',
  ideation: 'Chercher des idées',
  bilan: 'Faire le bilan',
  suivi: 'Suivre',
};

const STATUTS_ACTION = { a_faire: 'À faire', en_cours: 'En cours', fait: 'Fait' };
const ACTION_SUIVANT = { a_faire: 'en_cours', en_cours: 'fait', fait: 'a_faire' };

// Les portes vers le Drive du club. « Créer » = copier le dernier document en
// date : la copie Google garde le thème et les couleurs, il ne reste qu'à la
// renommer (le bouton « copier le titre » évite de le retaper). Ces
// identifiants n'ouvrent rien à qui n'a pas accès au Drive.
const DRIVE_REUNIONS = {
  dossier: 'https://drive.google.com/drive/folders/1TZqniACN90sCX6vyEQdP5_cMUvlZtGlM',
  modelePresentation:
    'https://docs.google.com/presentation/d/16L4xcnL97JUBNupp4TQLSui7NYjRVFvl_KKBakwDjIA/copy',
  modeleCompteRendu:
    'https://docs.google.com/document/d/1c_HWckFwqnCGqtPENBViVRygGB0GqhRO5D4hyJrVfM4/copy',
};

// Le nom attendu sur le Drive — la convention du dossier : « Réunion CA - 08/06/26 ».
export function titreDrive(fiche) {
  if (!fiche.date) return fiche.titre;
  const [annee, mois, jour] = fiche.date.split('-');
  return `${fiche.titre} - ${jour}/${mois}/${annee.slice(2)}`;
}

function ficheDeLaReunion(fiches, evenementId) {
  return fiches.find((fiche) => fiche.evenement_id === evenementId) ?? null;
}

// PAS de checklist sur les fiches de réunion (24 août 2026 au soir, après un
// aller-retour complet le jour même) : l'avant et l'après doublonnaient « Ta
// préparation » et « Conclure », le pendant a suivi, puis « ce principe »
// entier. Les feuilles à cases restent l'outil des SORTIES Yuno. Ne pas
// ramener les checklists de réunion sans une demande explicite.
//
// Les MODÈLES, eux, ont survécu sous une autre forme (dernier mot de Noé, le
// même soir) : un menu dépliant en haut à droite de la fiche. Choisir un
// modèle VERSE ses lignes en TEXTE dans « Les questions et points / Tes
// notes » — pas des cases, de la matière à retravailler. Un modèle par type
// (la case « J'anime » choisit la version), les lignes déjà présentes ne se
// doublent pas, et rien ne se redessine : le champ se complète sous les yeux,
// une frappe en cours n'est jamais perdue.

function versionDuModele(modeles, objet, animee) {
  const memeObjet = modeles.filter((modele) => modele.objet === objet);
  return (
    memeObjet.find((modele) => modele.anime === animee) ??
    memeObjet.find((modele) => modele.anime === null) ??
    memeObjet[0] ??
    null
  );
}

// Une entrée par type de réunion, nommée comme lui (« CA », « Alternance »…),
// portant la version qui suit le rôle. Un modèle sans objet garde son entrée.
function modelesParType(modeles, animee) {
  const entrees = [];
  const objetsVus = new Set();

  for (const modele of modeles) {
    if (modele.objet === null) {
      entrees.push({ nom: modele.nom, version: modele });
      continue;
    }
    if (objetsVus.has(modele.objet)) continue;
    objetsVus.add(modele.objet);
    const version = versionDuModele(modeles, modele.objet, animee);
    if (version) {
      entrees.push({ nom: REUNION_OBJETS[modele.objet] ?? version.nom, version });
    }
  }
  return entrees;
}

function menuModeles(etat, evenement, animee) {
  if (!etat.modelesPrepa.length) return '';

  const entrees = modelesParType(etat.modelesPrepa, animee);

  return `
    <details class="fiche-menu">
      <summary title="Verser un modèle dans tes notes">Modèles</summary>
      <div class="fiche-menu-panneau">
        <p class="discret">Verse ses lignes dans « ${
          animee ? 'Tes notes' : 'Les questions et points'
        } » — ce qui y est déjà ne se double pas.</p>
        <ul class="liste-choix-modeles">
          ${entrees
            .map(
              ({ nom, version }) => `
            <li><button type="button" class="choix-modele"
              data-appliquer-modele="${echapper(version.id)}">
              <span>${echapper(nom)}${
                version.objet !== null && version.objet === evenement?.reunion_objet
                  ? ' · conseillé'
                  : ''
              }</span>
              <span class="discret"><span class="chiffre">${version.items.length}</span> lignes</span>
            </button></li>`,
            )
            .join('')}
        </ul>
      </div>
    </details>`;
}

function boutonFiche(fiche, evenement) {
  return fiche
    ? `<button type="button" class="bouton-secondaire bouton-mini"
         data-ouvrir-fiche="${echapper(fiche.id)}">Ouvrir la fiche</button>`
    : `<button type="button" class="bouton-secondaire bouton-mini"
         data-creer-fiche="${echapper(evenement.id)}">Préparer</button>`;
}

function etiquettesReunion(evenement) {
  return `<span class="etiquette">${echapper(
    REUNION_OBJETS[evenement.reunion_objet] ?? 'Réunion',
  )}</span>${evenement.reunion_animee ? `<span class="etiquette">J'anime</span>` : ''}`;
}

function ligneReunion(evenement, fiches) {
  const fiche = ficheDeLaReunion(fiches, evenement.id);

  return `
    <li>
      <span class="tuile-entete">
        ${etiquettesReunion(evenement)}
        ${
          fiche?.type_reunion
            ? `<span class="etiquette">${TYPES_REUNION[fiche.type_reunion]}</span>`
            : ''
        }
        <span class="discret quand">${echapper(
          momentLisible(new Date(evenement.date_debut)),
        )}</span>
      </span>
      <span class="reunion-titre">${echapper(evenement.titre)}</span>
      ${
        fiche?.objectif
          ? `<span class="discret reunion-objectif">${echapper(fiche.objectif)}</span>`
          : ''
      }
      ${
        fiche?.cr_date
          ? `<span class="discret">Compte-rendu écrit ${echapper(
              echeanceLisible(depuisDateISO(fiche.cr_date)),
            )}</span>`
          : ''
      }
      ${boutonFiche(fiche, evenement)}
    </li>`;
}

// Une ligne du tableau des actions : le statut se change d'un clic (à faire →
// en cours → fait → à faire), l'action se retire d'une croix. Une action faite
// reste visible sur sa fiche — elle raconte la réunion — mais quitte le
// tableau, qui ne montre que ce qui reste à tenir.
function ligneAction(action) {
  return `
    <li>
      <span class="tuile-entete">
        <button type="button" class="etiquette action-statut"
          data-action-statut="${echapper(action.id)}"
          title="Changer le statut"
          aria-label="Statut : ${STATUTS_ACTION[action.statut]} — changer">${
            STATUTS_ACTION[action.statut]
          }</button>
        ${action.responsable ? `<span class="action-responsable">${echapper(action.responsable)}</span>` : ''}
        ${
          action.echeance
            ? `<span class="discret quand">${echapper(
                echeanceLisible(depuisDateISO(action.echeance)),
              )}</span>`
            : ''
        }
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-retirer-action="${echapper(action.id)}"
          title="Retirer" aria-label="Retirer « ${echapper(action.texte)} »">×</button>
      </span>
      <span class="${action.statut === 'fait' ? 'action-faite' : ''}">${echapper(action.texte)}${
        action.tache_id ? ` <span class="discret">· aussi une tâche</span>` : ''
      }</span>
    </li>`;
}

// --- Les blocs de la fiche ---------------------------------------------------

// AVANT — deux préparations selon le rôle (précision de Noé, 24 août 2026) :
//
//   J'ANIME : le contrat complet du guide — le type de réunion, l'objectif
//   collectif, les participants, ce qui s'envoie avant. C'est moi qui tiens
//   le cadre, ces décisions m'appartiennent.
//
//   J'Y ASSISTE : « la préparation est davantage sur les questions et points
//   que je souhaite aborder ou régler » — le type, les envois, l'ordre du
//   jour et la présentation ne sont PAS mes décisions. Restent : mon objectif
//   de fin de réunion, les participants, et mes notes.
function blocContrat(fiche, animee) {
  if (!animee) {
    return `
    <section class="bloc">
      <h2>Ta préparation</h2>
      ${construireFormulaire({
        id: 'fiche-contrat',
        libelle: 'Ta préparation',
        action: 'preparer-reunion',
        bouton: 'Enregistrer',
        avecPli: false,
        extra: `<input type="hidden" name="id" value="${echapper(fiche.id)}">`,
        champs: [
          {
            nom: 'objectif',
            libelle: 'Ton objectif — à la fin de la réunion, tu dois avoir…',
            type: 'textarea',
            valeur: fiche.objectif ?? '',
          },
          {
            nom: 'participants',
            libelle: 'Les participants',
            type: 'text',
            valeur: fiche.participants ?? '',
          },
          {
            nom: 'notes_avant',
            libelle: 'Les questions et points que tu veux aborder ou régler',
            type: 'textarea',
            valeur: fiche.notes_avant ?? '',
          },
        ],
      })}
    </section>`;
  }

  return `
    <section class="bloc">
      <h2>Le contrat</h2>
      <p class="discret">Si personne ne peut compléter « à la fin, nous devons
        avoir… », la réunion n'est pas encore prête.</p>
      ${construireFormulaire({
        id: 'fiche-contrat',
        libelle: 'Le contrat',
        action: 'preparer-reunion',
        bouton: 'Enregistrer',
        avecPli: false,
        extra: `<input type="hidden" name="id" value="${echapper(fiche.id)}">`,
        champs: [
          {
            nom: 'type_reunion',
            libelle: 'Le type de réunion — il commande la méthode',
            type: 'choix',
            options: { '': 'À choisir', ...TYPES_REUNION },
            valeur: fiche.type_reunion ?? '',
          },
          {
            nom: 'objectif',
            libelle: 'À la fin de la réunion, nous devons avoir…',
            type: 'textarea',
            valeur: fiche.objectif ?? '',
          },
          {
            nom: 'participants',
            libelle: 'Les participants nécessaires — les personnes utiles, pas tout le monde',
            type: 'text',
            valeur: fiche.participants ?? '',
          },
          {
            nom: 'infos_avant',
            libelle: 'À envoyer avant : documents, chiffres, options',
            type: 'textarea',
            valeur: fiche.infos_avant ?? '',
          },
          {
            nom: 'notes_avant',
            libelle: 'Tes notes : points sensibles, et qui les portera',
            type: 'textarea',
            valeur: fiche.notes_avant ?? '',
          },
        ],
      })}
    </section>`;
}

// L'ordre du jour orienté action : des résultats à produire, pas des thèmes.
function blocOrdreDuJour(fiche) {
  const total = fiche.points.reduce((somme, point) => somme + (point.minutes ?? 0), 0);

  const lignes = fiche.points
    .map(
      (point) => `
    <li>
      <span class="tuile-entete">
        ${
          point.type_point
            ? `<span class="etiquette">${TYPES_POINT[point.type_point] ?? ''}</span>`
            : ''
        }
        ${point.minutes ? `<span class="discret"><span class="chiffre">${point.minutes}</span> min</span>` : ''}
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-retirer-point="${echapper(point.id)}"
          title="Retirer" aria-label="Retirer « ${echapper(point.titre)} »">×</button>
      </span>
      <span class="reunion-titre">${echapper(point.titre)}</span>
      ${
        point.sortie
          ? `<span class="discret">Sortie attendue : ${echapper(point.sortie)}</span>`
          : ''
      }
      <span class="odj-statuts">
        <button type="button" class="lien-discret bouton-mini ${point.statut === 'traite' ? 'actif' : ''}"
          data-point-statut="${echapper(point.id)}:traite"
          aria-pressed="${point.statut === 'traite'}">${
            point.statut === 'traite' ? '✓ Traité' : 'Traité'
          }</button>
        <button type="button" class="lien-discret bouton-mini ${point.statut === 'reporte' ? 'actif' : ''}"
          data-point-statut="${echapper(point.id)}:reporte"
          aria-pressed="${point.statut === 'reporte'}">${
            point.statut === 'reporte' ? '→ Reporté' : 'Reporté'
          }</button>
      </span>
    </li>`,
    )
    .join('');

  return `
    <section class="bloc">
      <h2>L'ordre du jour</h2>
      <p class="discret">Chaque point commence par un verbe et annonce sa sortie.
        Pendant la réunion, chaque point se clôt : traité, ou reporté — explicitement.${
          total ? ` <span class="chiffre">${total}</span> min prévues.` : ''
        }</p>
      ${
        fiche.points.length
          ? `<ul class="liste-reunions">${lignes}</ul>`
          : `<p class="vide">Le premier point donne le ton : « Décider… », « Répartir… », « Valider… »</p>`
      }
      ${
        fiche.points.length > 3
          ? `<p class="discret">Plus de trois sujets : le guide conseille d'en garder trois —
               lesquels peuvent attendre ?</p>`
          : ''
      }
      ${construireFormulaire({
        id: 'fiche-point',
        libelle: 'Ajouter un point',
        action: 'ajouter-point-reunion',
        bouton: 'Ajouter',
        extra: `<input type="hidden" name="fiche_id" value="${echapper(fiche.id)}">`,
        champs: [
          {
            nom: 'titre',
            libelle: 'Le point — un verbe d\'action : décider, valider, répartir…',
            type: 'text',
            requis: true,
          },
          { nom: 'type_point', libelle: 'Pour quoi faire', type: 'choix', options: { '': '—', ...TYPES_POINT } },
          { nom: 'minutes', libelle: 'Temps prévu (minutes)', type: 'number' },
          { nom: 'sortie', libelle: 'La sortie attendue — un résultat, pas un thème', type: 'text' },
        ],
      })}
    </section>`;
}

// La CHECKLIST de la fiche (demande de Noé, 24 août 2026) : les modèles de
// préparation — CA j'anime / j'y assiste, point alternance, réunion
// communication, rendez-vous partenaire, les essentiels — reviennent sur la
// fiche. La refonte les avait écartés ; or « le modèle par défaut peut ne pas
// être le bon », et une checklist ajoute les détails que la structure ne dit
// pas. Un pli propose les modèles (le bon d'office, selon objet et rôle) ;
// appliquer fait naître la feuille à cases — les tables de Yuno, rattachées à
// l'événement — ou AJOUTE les lignes manquantes à celle qui existe : rien de
// coché ne bouge, une ligne en trop se retire de sa croix.
// Le suivi : la réunion s'ouvre en relisant ce qui était prévu. « Qu'est-ce qui
// était prévu ? Qu'est-ce qui a été fait ? Qu'est-ce qui bloque ? »
function blocSuivi(actionsOuvertes) {
  if (!actionsOuvertes.length) return '';

  return `
    <section class="bloc">
      <h2>Ouvrir par le suivi</h2>
      <p class="discret">Ce qui était prévu aux réunions d'avant — fait, en cours, bloqué ?</p>
      <ul class="liste-reunions">${actionsOuvertes.map(ligneAction).join('')}</ul>
    </section>`;
}

// La présentation, sur le Drive du club.
function blocPresentation(fiche) {
  return `
    <section class="bloc">
      <h2>La présentation</h2>
      ${
        fiche.lien_presentation
          ? `<a class="lien-externe" href="${echapper(fiche.lien_presentation)}"
               target="_blank" rel="noopener">
               <span class="lien-externe-texte">
                 <span class="lien-externe-titre">Ouvrir la présentation</span>
                 <span class="discret">${echapper(titreDrive(fiche))}</span>
               </span>
               <span class="lien-externe-fleche" aria-hidden="true">→</span>
             </a>`
          : `<p class="discret">Copier la dernière garde les couleurs du club. Renomme la
               copie « ${echapper(titreDrive(fiche))} » —
               <button type="button" class="lien-discret bouton-mini"
                 data-copier-titre="${echapper(titreDrive(fiche))}">copier le titre</button></p>`
      }
      <p class="reunion-portes">
        <a class="bouton-secondaire bouton-mini" href="${DRIVE_REUNIONS.modelePresentation}"
          target="_blank" rel="noopener">Créer la présentation (copie de la dernière)</a>
        <a class="lien-discret bouton-mini" href="${DRIVE_REUNIONS.dossier}"
          target="_blank" rel="noopener">Ouvrir le dossier Réunions</a>
      </p>
      ${construireFormulaire({
        id: 'fiche-lien-pres',
        libelle: fiche.lien_presentation ? 'Changer le lien' : 'Coller le lien de la présentation',
        action: 'lien-presentation',
        bouton: 'Garder le lien',
        extra: `<input type="hidden" name="id" value="${echapper(fiche.id)}">`,
        champs: [
          { nom: 'lien', libelle: 'Le lien du document', type: 'url', valeur: fiche.lien_presentation ?? '' },
        ],
      })}
    </section>`;
}

// Le kit d'animation — les phrases du guide, sous la main pendant la réunion.
const KIT_ANIMATION = [
  ['Recentrer', '« Je note le sujet, mais il n\'est pas dans l\'objectif — on le met au parking. »'],
  ['Faire trancher', '« On valide l\'option A, l\'option B, ou il manque une information pour décider ? »'],
  ['Clarifier', '« Quand tu dis que ça ne marche pas, tu penses à quel fait concret ? »'],
  ['Responsabiliser', '« Qui prend cette action ? Pour quelle date ? De quoi as-tu besoin ? »'],
  ['Éviter le flou', '« On est d\'accord sur l\'intention. Quelle est la première action visible ? »'],
  ['Conclure', '« Je reformule : la décision est…, le responsable est…, l\'échéance est… »'],
];

function blocKitAnimation() {
  return `
    <section class="bloc">
      <details class="ajout">
        <summary>Le kit d'animation</summary>
        <p class="discret">L'animateur n'est pas celui qui parle le plus : il protège
          l'objectif, le temps, la parole et la décision.</p>
        <ul class="kit-animation">
          ${KIT_ANIMATION.map(
            ([situation, phrase]) => `
            <li><span class="etiquette">${situation}</span>
              <span class="discret">${echapper(phrase)}</span></li>`,
          ).join('')}
        </ul>
      </details>
    </section>`;
}

// APRÈS — le compte-rendu court : quelqu'un qui n'était pas là doit comprendre
// ce qui a été décidé et ce qu'il faut faire. Pas trois pages de discussion.
function blocConclure(fiche, animee, actionsDeLaFiche) {
  return `
    <section class="bloc">
      <h2>Conclure</h2>
      <p class="discret">À chaud, sous 48 h — c'est l'après-réunion qui transforme
        la discussion en fonctionnement du club.</p>

      <h3 class="reunion-sous-titre">Les actions décidées</h3>
      ${
        actionsDeLaFiche.length
          ? `<ul class="liste-reunions">${actionsDeLaFiche.map(ligneAction).join('')}</ul>`
          : `<p class="vide">Chaque action décidée s'inscrit ici : quoi, qui, pour quand.</p>`
      }
      ${construireFormulaire({
        id: 'fiche-action',
        libelle: 'Ajouter une action',
        action: 'ajouter-action-club',
        bouton: 'Ajouter',
        extra: `<input type="hidden" name="fiche_id" value="${echapper(fiche.id)}">`,
        champs: [
          { nom: 'texte', libelle: 'L\'action — concrète et visible', type: 'text', requis: true },
          { nom: 'responsable', libelle: 'Qui s\'en charge', type: 'text' },
          { nom: 'echeance', libelle: 'Pour quand', type: 'date' },
          {
            nom: 'pour_moi',
            libelle: 'C\'est pour moi — en faire aussi une tâche FCH',
            type: 'checkbox',
          },
        ],
      })}

      <h3 class="reunion-sous-titre">Le compte-rendu</h3>
      ${construireFormulaire({
        id: 'fiche-cr',
        libelle: 'Le compte-rendu',
        action: 'conclure-reunion',
        bouton: 'Enregistrer le compte-rendu',
        avecPli: false,
        extra: `<input type="hidden" name="id" value="${echapper(fiche.id)}">`,
        champs: [
          {
            nom: 'cr_decisions',
            libelle: 'Les décisions prises — une par ligne',
            type: 'textarea',
            valeur: fiche.cr_decisions ?? '',
          },
          {
            nom: 'cr_en_attente',
            libelle: 'Points en attente : reportés, arbitrages à venir',
            type: 'textarea',
            valeur: fiche.cr_en_attente ?? '',
          },
          {
            nom: 'cr_suivi',
            libelle: 'Prochain point de contrôle',
            type: 'date',
            valeur: fiche.cr_suivi ?? '',
          },
          {
            nom: 'bilan_retenu',
            libelle: 'Pour toi : ce que tu retiens',
            type: 'textarea',
            valeur: fiche.bilan_retenu ?? '',
          },
          ...(animee
            ? [
                {
                  nom: 'bilan_animation',
                  libelle: 'L\'animation : à refaire autrement la prochaine fois',
                  type: 'textarea',
                  valeur: fiche.bilan_animation ?? '',
                },
              ]
            : []),
        ],
      })}
      ${
        fiche.cr_date
          ? `<p class="discret">Compte-rendu écrit ${echapper(
              echeanceLisible(depuisDateISO(fiche.cr_date)),
            )}.</p>`
          : ''
      }

      <h3 class="reunion-sous-titre">Sur le Drive</h3>
      ${
        fiche.lien_compte_rendu
          ? `<a class="lien-externe" href="${echapper(fiche.lien_compte_rendu)}"
               target="_blank" rel="noopener">
               <span class="lien-externe-texte">
                 <span class="lien-externe-titre">Ouvrir le compte-rendu</span>
                 <span class="discret">${echapper(titreDrive(fiche))}</span>
               </span>
               <span class="lien-externe-fleche" aria-hidden="true">→</span>
             </a>`
          : animee
            ? `<p class="reunion-portes">
               <a class="bouton-secondaire bouton-mini" href="${DRIVE_REUNIONS.modeleCompteRendu}"
                 target="_blank" rel="noopener">Créer le compte-rendu (copie du dernier)</a>
             </p>`
            : `<p class="discret">Le compte-rendu officiel n'est pas le tien ici —
                 colle son lien quand il arrive.</p>`
      }
      ${construireFormulaire({
        id: 'fiche-lien-cr',
        libelle: fiche.lien_compte_rendu ? 'Changer le lien' : 'Coller le lien du compte-rendu',
        action: 'lien-compte-rendu',
        bouton: 'Garder le lien',
        extra: `<input type="hidden" name="id" value="${echapper(fiche.id)}">`,
        champs: [
          { nom: 'lien', libelle: 'Le lien du document', type: 'url', valeur: fiche.lien_compte_rendu ?? '' },
        ],
      })}
    </section>`;
}

// Le dernier regard sur l'animation d'une réunion du même objet : la boucle
// d'apprentissage — le bilan paie quand on le relit en préparant la suivante.
function dernierRegardAnimation(etat, fiche, evenement) {
  if (!evenement) return null;
  return (
    etat.fiches.find(
      (autre) =>
        autre.id !== fiche.id &&
        autre.bilan_animation &&
        etat.evenements.find((e) => e.id === autre.evenement_id)?.reunion_objet ===
          evenement.reunion_objet,
    ) ?? null
  );
}

function vueFicheReunion(etat, fiche) {
  const evenement = etat.evenements.find((e) => e.id === fiche.evenement_id) ?? null;
  const animee = Boolean(evenement?.reunion_animee);
  const actionsDeLaFiche = etat.actionsClub.filter((action) => action.fiche_id === fiche.id);
  const suivi = etat.actionsClub.filter(
    (action) => action.fiche_id !== fiche.id && action.statut !== 'fait',
  );
  const precedent = animee && !fiche.bilan_animation
    ? dernierRegardAnimation(etat, fiche, evenement)
    : null;

  return `
    ${enTete('reunions')}
    <div class="fiche-tete">
      <h2 class="titre-page">${echapper(fiche.titre)}</h2>
      ${menuModeles(etat, evenement, animee)}
    </div>
    <p class="discret prepa-date">
      ${fiche.date ? echapper(echeanceLisible(depuisDateISO(fiche.date))) : ''}
      ${evenement ? `· ${echapper(REUNION_OBJETS[evenement.reunion_objet] ?? 'Réunion')}` : ''}
    </p>
    ${
      // La case qui commande TOUT le rôle (demande de Noé, 24 août 2026) :
      // elle écrit `reunion_animee` sur l'événement, et la fiche bascule dans
      // l'autre version — contrat complet ou préparation de participant, et
      // la version du modèle qui va avec.
      evenement
        ? `<label class="champ-case fiche-anime">
             <input type="checkbox" data-fiche-anime ${animee ? 'checked' : ''}>
             <span>J'anime la réunion</span>
           </label>`
        : ''
    }
    ${
      precedent
        ? `<p class="discret prepa-rappel">Ton dernier regard sur l'animation —
             à refaire autrement : « ${echapper(precedent.bilan_animation)} »</p>`
        : ''
    }
    ${blocContrat(fiche, animee)}
    ${
      // L'ordre du jour et la présentation appartiennent à qui TIENT la
      // réunion (précision de Noé, 24 août 2026) : quand il y assiste, ce ne
      // sont pas ses décisions — la fiche ne les lui demande pas.
      animee ? blocOrdreDuJour(fiche) : ''
    }
    ${animee ? blocPresentation(fiche) : ''}
    ${blocSuivi(suivi)}
    ${animee ? blocKitAnimation() : ''}
    ${blocConclure(fiche, animee, actionsDeLaFiche)}
    <p><button type="button" class="lien-discret" data-supprimer-fiche="${echapper(fiche.id)}">
      Supprimer la fiche</button></p>
    ${pied()}`;
}

function vueReunions(etat) {
  if (etat.reunionOuverte) {
    const fiche = etat.fiches.find((f) => f.id === etat.reunionOuverte);
    if (fiche) return vueFicheReunion(etat, fiche);
  }

  const reunions = etat.evenements.filter(estReunion);
  const maintenant = new Date();
  const aVenir = reunions
    .filter((e) => finDeLaSortie(e) >= maintenant)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
  const passees = reunions
    .filter((e) => finDeLaSortie(e) < maintenant)
    .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut));

  // Le tableau permanent des actions — la mémoire du club. Il ne montre que ce
  // qui reste à tenir ; les actions faites racontent leur réunion sur sa fiche.
  const ouvertes = etat.actionsClub.filter((action) => action.statut !== 'fait');

  return `
    ${enTete('reunions')}

    <section class="bloc">
      <h2>À préparer</h2>
      ${
        aVenir.length
          ? `<ul class="liste-reunions">${aVenir.map((e) => ligneReunion(e, etat.fiches)).join('')}</ul>`
          : `<p class="vide">Ta prochaine réunion se note au calendrier : le « + »,
              nature Événement, pastille Réunion.</p>`
      }
    </section>

    <section class="bloc">
      <h2>Le tableau des actions</h2>
      <p class="discret">Ce qui a été décidé, qui s'en charge, pour quand — le suivi
        rend les engagements visibles, il n'est pas là pour culpabiliser.</p>
      ${
        ouvertes.length
          ? `<ul class="liste-reunions">${ouvertes.map(ligneAction).join('')}</ul>`
          : `<p class="vide">Les actions décidées en réunion s'inscriront ici.</p>`
      }
    </section>

    ${
      passees.length
        ? `<section class="bloc">
             <h2>Passées</h2>
             <ul class="liste-reunions">${passees.map((e) => ligneReunion(e, etat.fiches)).join('')}</ul>
           </section>`
        : ''
    }
    ${pied()}`;
}

// LE TEMPS FORT QUI APPROCHE (30 août 2026), sous la réunion du moment.
//
// CE QU'IL RÉPOND. Le club tient huit à neuf temps forts par saison — pétanque,
// Tournoi Rose, goûter de Noël, loto, tournois, journée du club. Ils portent
// l'essentiel de la communication événementielle, et l'accueil ne les voyait pas
// venir : ils dormaient au calendrier, à deux gestes de là.
//
// IL NE RÉCLAME RIEN, IL SITUE. Pas de compte à rebours, pas de « plus que
// 3 jours ! », pas de liste de ce qui n'est pas fait — le hub ne compte pas les
// retards. Il dit ce qui vient et ce qui est déjà posé pour ce jour-là ; s'il
// n'y a rien de posé, il le dit sans reproche.
//
// L'HORIZON EST DE CINQ SEMAINES. Plus loin, un temps fort n'appelle encore
// aucun geste et le bandeau deviendrait un meuble qu'on ne lit plus ; plus
// près, on découvrirait la pétanque la veille. Il reste jusqu'au SOIR du jour :
// la com d'un temps fort se fait aussi pendant.
const HORIZON_TEMPS_FORT_JOURS = 35;

function blocTempsFort(etat) {
  const maintenant = new Date();
  const horizon = new Date(maintenant);
  horizon.setDate(horizon.getDate() + HORIZON_TEMPS_FORT_JOURS);

  // La fin du jour, et non l'instant : un temps fort sans créneau tombe à
  // minuit, et une borne à l'heure courante l'aurait fait disparaître le matin
  // même. C'est la précaution déjà prise dans js/fch.js.
  const finDuJour = (evenement) => {
    const jour = new Date(evenement.date_debut);
    jour.setHours(23, 59, 59, 999);
    return jour;
  };

  const evenement = etat.evenements
    .filter((e) => e.temps_fort && !estReunion(e))
    .filter((e) => finDuJour(e) >= maintenant && new Date(e.date_debut) <= horizon)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0];

  if (!evenement) return '';

  const jour = new Date(evenement.date_debut);
  const cEstAujourdhui = jour.toDateString() === maintenant.toDateString();

  // CE QUI EST DÉJÀ POSÉ POUR CE JOUR-LÀ : les publications datées du jour de
  // l'événement. C'est la seule question qui vaille devant un temps fort qui
  // approche — « est-ce que j'ai prévu quelque chose ? » —, et le hub y répond
  // sans rien demander de plus.
  const jourISO = versDateISO(jour);
  const posees = etat.publications.filter((pub) => pub.date_prevue === jourISO);

  const quoi = posees.length
    ? `<span class="tf-posees"><span class="chiffre">${posees.length}</span>
         ${posees.length > 1 ? 'publications posées' : 'publication posée'} ce jour-là</span>`
    // Un vide ouvre une porte, il ne s'excuse pas — et surtout il n'accuse pas :
    // rien de posé cinq semaines avant est parfaitement normal.
    : '<span class="tf-posees tf-rien">Rien de posé ce jour-là pour l’instant</span>';

  return `
    <section class="bloc">
      <span class="tuile-entete">
        <span class="etiquette">${cEstAujourdhui ? "C'est aujourd'hui" : 'Temps fort'}</span>
        <span class="discret quand">${echapper(echeanceLisible(jour))}</span>
      </span>
      <h2 class="tf-titre">${echapper(evenement.titre)}</h2>
      <p class="tf-service">
        ${evenement.lieu ? `<span>${echapper(evenement.lieu)}</span>` : ''}
        ${quoi}
      </p>
      <a class="lien-externe" href="#hermitage/creer">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Préparer sa com</span>
          <span class="discret">Poser ce qui sortira avant, pendant et après</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>`;
}

// La réunion du moment, en tête de l'accueil (demande de Noé, 21 août 2026) —
// le pendant de « la sortie du moment » chez Yuno : le jour d'un conseil, ce
// qui compte n'est ni la com' ni les objectifs, c'est la fiche.
const PHASES_REUNION = { avant: 'À préparer', pendant: 'En ce moment', apres: 'À conclure' };

function blocReunionDuMoment(etat) {
  const maintenant = new Date();
  const reunions = etat.evenements.filter(estReunion);

  const enCours = reunions
    .filter((e) => {
      const phase = phaseDeLaSortie(e, maintenant);
      return phase === 'pendant' || phase === 'apres';
    })
    .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))[0];
  const prochaine = reunions
    .filter((e) => new Date(e.date_debut) > maintenant)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0];

  const reunion = enCours ?? prochaine;
  if (!reunion) return '';

  const phase = phaseDeLaSortie(reunion, maintenant) ?? 'avant';
  const fiche = ficheDeLaReunion(etat.fiches, reunion.id);
  // Ce que le moment demande : avant, le contrat ; pendant, l'ordre du jour
  // sous les yeux ; après, le compte-rendu à chaud.
  const restants = fiche
    ? fiche.points.filter((point) => point.statut === 'a_venir').slice(0, 3)
    : [];

  return `
    <section class="bloc">
      <span class="tuile-entete">
        <span class="etiquette">${PHASES_REUNION[phase]}</span>
        ${etiquettesReunion(reunion)}
        <span class="discret quand">${echapper(
          momentLisible(new Date(reunion.date_debut)),
        )}</span>
      </span>
      <h2 class="reunion-moment-titre">${echapper(reunion.titre)}</h2>
      ${
        fiche?.objectif
          ? `<p class="discret reunion-objectif">À la fin : ${echapper(fiche.objectif)}</p>`
          : ''
      }
      ${
        phase === 'apres' && fiche && !fiche.cr_date
          ? `<p class="discret">Le compte-rendu s'écrit à chaud — sous 48 h il devient
               une habitude.</p>`
          : restants.length
            ? `<ul class="liste-reunions accueil-odj">${restants
                .map(
                  (point) => `
              <li><span class="reunion-titre">${echapper(point.titre)}</span>${
                point.minutes
                  ? ` <span class="discret"><span class="chiffre">${point.minutes}</span> min</span>`
                  : ''
              }</li>`,
                )
                .join('')}</ul>`
            : ''
      }
      ${boutonFiche(fiche, reunion)}
    </section>`;
}

// --- Les vues ----------------------------------------------------------------

// L'ACCUEIL DU SITE : L'ATELIER (restructuré le 30 août 2026, demande de Noé).
//
// CE QUI N'ALLAIT PAS, et c'est la spec elle-même qui le dit : « le site est
// l'ATELIER — il répond à "qu'est-ce que je fais maintenant" ; la page du hub
// est le BILAN — elle répond à "où j'en suis". C'est la seule division qui
// justifie deux écrans. »
//
// Or les deux rôles étaient inversés sur les deux points qui comptent :
//   — le site — l'atelier — n'affichait AUCUNE tâche, ouvrait sur trois grosses
//     tuiles d'objectifs suivies d'un formulaire « Ajouter un objectif », et
//     fermait sur les victoires. Deux blocs de bilan, zéro travail ;
//   — la page `#fch` du hub — le bilan — avait, elle, un panneau « À faire ».
//
// L'accueil du HUB a tranché la même question le 29 août : « Les objectifs ont
// quitté l'accueil. Ils ont leur page à deux gestes, et l'accueil répond à
// "qu'est-ce que j'ai à faire", pas à "où je vais". » Le site suit, avec un
// retard d'un jour et pour la même raison.
//
// L'ORDRE, du plus urgent au plus lointain :
//   1. ce qui approche — une réunion, un temps fort ;
//   2. À FAIRE — le travail, qui manquait ;
//   3. la com à venir ;
//   4. le cap, en tuile-PORTE : on le relit, on ne le règle pas ici ;
//   5. les victoires, repliées.
//
// AJOUTER UN OBJECTIF A QUITTÉ CET ÉCRAN. Un objectif de fin d'alternance se
// décide trois fois dans une année : le formulaire pesait tous les jours pour
// un geste triennal, et il vit dans `#objectifs`, là où l'on décide.

// Ce qu'on montre d'un coup. Au-delà, une colonne d'accueil cesse d'être un
// atelier et devient un mur — celui que l'espace Tâches a appris à ne pas
// dresser. Le reste se déplie : rien n'est caché.
const TACHES_EN_TETE = 7;

function blocAFaire(etat) {
  // UNE SEULE OCCURRENCE PAR SÉRIE, la règle de l'espace Tâches
  // (`separerLesSeries`, 27 août) : mesuré, 25 tâches s'affichaient d'affilée
  // sur cet accueil, dont l'essentiel était la même poignée de rythmes répétés
  // seize semaines devant. La plus proche suffit à dire qu'il y a à faire.
  const { aFaire: candidates } = separerLesSeries(
    etat.taches.filter((tache) => tache.statut !== 'fait'),
  );
  const aFaire = trierTaches(candidates);

  // Ni ouvrable ni supprimable : corriger et supprimer une tâche vivent dans
  // l'espace Tâches. Ici on la coche, et c'est tout — offrir les deux autres
  // gestes sans les traiter ferait des boutons morts. Même règle que la page
  // du hub, et le geste est le MÊME (`cocherDepuisTableauDeBord`).
  const dessiner = (lot) =>
    construireLignesTaches(lot, { ouvrable: false, supprimable: false, espace: false });

  if (!aFaire.length) {
    return `
    <section class="bloc">
      <h2>À faire</h2>
      <div data-bloc="taches">
        <p class="vide">Rien à faire pour le club. Le « + » en bas note la prochaine.</p>
      </div>
    </section>`;
  }

  const tete = aFaire.slice(0, TACHES_EN_TETE);
  const reste = aFaire.slice(TACHES_EN_TETE);

  return `
    <section class="bloc">
      <h2>À faire <span class="chiffre">${aFaire.length}</span></h2>
      <div data-bloc="taches">
        ${dessiner(tete)}
        ${
          reste.length
            ? `<details class="backlog">
                 <summary>Le reste <span class="chiffre">${reste.length}</span></summary>
                 ${dessiner(reste)}
               </details>`
            : ''
        }
      </div>
      <a class="lien-externe" href="#taches/fch">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Toutes les tâches du club</span>
          <span class="discret">Créer, régler la priorité, voir ce qui revient</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>`;
}

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}
    ${blocReunionDuMoment(etat)}
    ${blocTempsFort(etat)}
    ${blocAFaire(etat)}

    <section class="bloc">
      <h2>La com' à venir</h2>
      <div data-bloc="apercu">${construireApercuCreation(etat.publications)}</div>
      <a class="lien-externe" href="#hermitage/creer">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Ouvrir le calendrier éditorial</span>
          <span class="discret">Programmer, piocher dans la banque d'idées</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>

    <section class="bloc">
      <h2>Le cap</h2>
      <div data-bloc="objectifs">${
        etat.objectifs.length
          ? construireCapGrave(etat.objectifs)
          : '<p class="vide">Ton cap s’écrira ici.</p>'
      }</div>
      <a class="lien-externe" href="#objectifs/fch">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Régler le cap</span>
          <span class="discret">Objectifs, jalons, projets du club</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>

    <section class="bloc bloc-discret">
      <details class="backlog">
        <summary>Victoires <span class="chiffre">${etat.victoires.length}</span></summary>
        <div data-bloc="victoires">${construireVictoires(etat.victoires)}</div>
      </details>
      <a class="lien-externe" href="#chemin">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Le chemin</span>
          <span class="discret">Tout ce qui a été accompli, mois par mois</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>
    ${pied()}`;
}


// --- La saison --------------------------------------------------------------
//
// CE QUE CE BLOC RÉPOND, et qui n'était nulle part : « est-ce que ma com
// tourne ? ». Le calendrier éditorial montre les parutions une à une ; il ne
// dit jamais quel RYTHME est posé, ni lequel manque. Or l'essentiel de la
// charge du club est cyclique — c'est le fait que le dossier FCH a révélé.
//
// UNE RUBRIQUE PORTE PLUSIEURS RYTHMES, et c'est Noé qui l'a tranché (29 août
// 2026) : « Programmation de la semaine » ET « Programmation foot à 5, 8 et
// entente » sont toutes deux de la « Programmation du week-end ». La première
// version comptait une série = une rubrique et proposait donc de poser un
// rythme qui tournait déjà, sous un autre nom. La rubrique est l'étage du
// dessus ; les séries sont sa mécanique.
//
// LA FORME EST CELLE DES GALERIES DU HUB (#objectifs) : une tuile compacte par
// rubrique, le titre qui porte seul le poids, le service en encre discrète, une
// rangée de marches, et le dépliage SUR PLACE sur ses rythmes — on n'ouvre pas
// une autre page. Les classes sont préfixées `saison-` : `.projet-tuile` porte
// des règles de rail horizontal qui n'ont rien à faire ici.

// Sur combien de semaines on regarde devant. Huit, soit deux mois : assez pour
// voir un rythme tenir, assez court pour se lire d'un coup d'œil. L'horizon des
// séries est le double (16 semaines, js/api.js), donc une rubrique qui tourne
// remplit toujours la rangée — et c'est bien l'information qu'on vient chercher.
const SEMAINES_DEVANT = 8;

function rubriqueDe(serie) {
  return (serie.modele?.rubrique ?? '').trim();
}

// Deux rubriques se comparent sur leur sens, pas sur leur casse ni leurs
// espaces : « Résultats du week-end » et « resultats du week-end  » sont la
// même, et en afficher deux serait pire que n'en afficher aucune.
function memeRubrique(a, b) {
  const nu = (mot) => (mot ?? '').trim().toLowerCase();
  return nu(a) !== '' && nu(a) === nu(b);
}

// Le lundi de la semaine d'une date : c'est la maille des marches, et la
// semaine du hub commence le lundi partout ailleurs.
function lundiDe(date) {
  const lundi = new Date(date);
  // getDay() rend 0 pour dimanche : il recule de 6, pas de 0.
  lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
  return lundi;
}

// --- Ce que la saison contient, sans une once de HTML -----------------------
// Séparé du dessin pour rester vérifiable seul, comme le reste du hub.

export function saisonDuClub(series, publications, aujourdhui) {
  const vivantes = series.filter(
    (serie) => serie.nature === 'publication' && serie.espace === ESPACE && !serie.arretee,
  );

  const parutionsDe = (lot) => {
    const ids = new Set(lot.map((serie) => serie.id));
    return publications.filter(
      (pub) => ids.has(pub.serie_id) && pub.date_prevue && pub.date_prevue >= aujourdhui,
    );
  };

  // Les rubriques connues : celles qui reviennent chaque semaine, plus celles
  // qu'une série porte déjà. L'union, pour qu'une rubrique écrite à la main
  // apparaisse sans avoir à toucher au code.
  const noms = [];
  for (const nom of [...SAISON_HEBDO, ...vivantes.map(rubriqueDe).filter(Boolean)]) {
    if (!noms.some((connu) => memeRubrique(connu, nom))) noms.push(nom);
  }

  const debutSemaine = lundiDe(depuisDateISO(aujourdhui));

  const rubriques = noms.map((nom) => {
    const lot = vivantes.filter((serie) => memeRubrique(nom, rubriqueDe(serie)));
    const parutions = parutionsDe(lot);

    // Une marche par semaine : pleine si une parution y tombe. C'est le motif
    // des jalons du hub, et il dit ici la CONTINUITÉ du rythme — une série qui
    // s'arrête dans trois semaines laisse les dernières vides.
    const semaines = [];
    for (let i = 0; i < SEMAINES_DEVANT; i += 1) {
      const debut = new Date(debutSemaine);
      debut.setDate(debut.getDate() + i * 7);
      const fin = new Date(debut);
      fin.setDate(fin.getDate() + 7);
      const bornDebut = versDateISO(debut);
      const bornFin = versDateISO(fin);
      semaines.push(
        parutions.some((pub) => pub.date_prevue >= bornDebut && pub.date_prevue < bornFin),
      );
    }

    return {
      nom,
      series: lot,
      parutions: parutions.length,
      prochaine: parutions.map((pub) => pub.date_prevue).sort()[0] ?? null,
      semaines,
      enPlace: lot.length > 0,
    };
  });

  return { rubriques, orphelines: vivantes.filter((serie) => !rubriqueDe(serie)) };
}

// --- Le dessin ---------------------------------------------------------------

function ligneRythme(serie, publications, aujourdhui) {
  const restantes = publications.filter(
    (pub) => pub.serie_id === serie.id && pub.date_prevue && pub.date_prevue >= aujourdhui,
  ).length;
  // `RECURRENCES` écrit « Chaque semaine » avec sa capitale — juste quand le
  // mot ouvre une ligne, faux ici où il ouvre une énumération de service.
  const cadence = (RECURRENCES[serie.recurrence] ?? serie.recurrence)
    .replace(/^./, (lettre) => lettre.toLowerCase());
  return `
    <li class="saison-rythme">
      <span class="saison-rythme-nom">${echapper(serie.modele?.titre || 'Sans titre')}</span>
      <span class="saison-rythme-service">${echapper(cadence)} · <span class="chiffre">${restantes}</span> à venir</span>
    </li>`;
}

function tuileRubrique(rubrique, publications, aujourdhui) {
  const marches = rubrique.enPlace
    ? `<div class="saison-marches">${rubrique.semaines
        .map((pleine) => `<i${pleine ? ' class="tenue"' : ''}></i>`)
        .join('')}</div>`
    // Rien de posé : le pointillé le dit, comme la jauge d'un projet qui n'a
    // rien déclaré. Une rangée vide aurait dit « ça s'est arrêté », ce qui est
    // faux — ça n'a jamais commencé.
    : '<div class="saison-marches saison-marches-vide"></div>';

  const service = rubrique.enPlace
    ? [
        `<span class="chiffre">${rubrique.series.length}</span> rythme${rubrique.series.length > 1 ? 's' : ''}`,
        `<span class="chiffre">${rubrique.parutions}</span> à venir`,
        rubrique.prochaine
          // `echeanceLisible` attend un objet Date, pas la chaîne ISO de la
          // colonne : sans `depuisDateISO`, le montage entier du site tombe.
          ? `prochaine ${echapper(echeanceLisible(depuisDateISO(rubrique.prochaine)))}`
          : null,
      ].filter(Boolean).join(' · ')
    : 'chaque semaine · rien de posé';

  const etat = rubrique.enPlace
    ? '<span class="saison-etat"><i class="tenue"></i>en place</span>'
    : '<span class="saison-etat"><i></i>rien de posé</span>';

  // Le dépliage n'a de sens que s'il y a quelque chose dessous : une tuile qui
  // s'ouvre sur rien est un bouton qui ment (la règle des flèches du menu).
  if (!rubrique.enPlace) {
    return `
      <li class="saison-tuile">
        <div class="saison-tete">${etat}</div>
        <p class="saison-nom">${echapper(rubrique.nom)}</p>
        ${marches}
        <p class="saison-compte">${service}</p>
        <p class="saison-poser">
          <button type="button" class="bouton-secondaire bouton-mini"
            data-poser-rubrique="${echapper(rubrique.nom)}"
            >Poser ce rythme</button>
        </p>
      </li>`;
  }

  return `
    <li class="saison-tuile">
      <details>
        <summary>
          <span class="saison-tete">${etat}</span>
          <span class="saison-nom">${echapper(rubrique.nom)}</span>
          ${marches}
          <span class="saison-compte">${service}</span>
        </summary>
        <ul class="saison-rythmes">${rubrique.series
          .map((serie) => ligneRythme(serie, publications, aujourdhui))
          .join('')}</ul>
      </details>
    </li>`;
}

// Une série sans rubrique : elle tourne, mais rien ne la compte. Le geste tient
// en un menu déroulant — accepter coûte UN geste, comme les propositions du
// rendez-vous du dimanche.
function tuileOrpheline(serie, publications, aujourdhui, rubriques) {
  const restantes = publications.filter(
    (pub) => pub.serie_id === serie.id && pub.date_prevue && pub.date_prevue >= aujourdhui,
  ).length;
  const cadence = (RECURRENCES[serie.recurrence] ?? serie.recurrence)
    .replace(/^./, (lettre) => lettre.toLowerCase());
  const options = rubriques
    .map((nom) => `<option value="${echapper(nom)}">${echapper(nom)}</option>`)
    .join('');
  return `
    <li class="saison-tuile saison-orpheline">
      <p class="saison-nom">${echapper(serie.modele?.titre || 'Sans titre')}</p>
      <p class="saison-compte">${echapper(cadence)} · <span class="chiffre">${restantes}</span> à venir</p>
      <label class="saison-rattacher">
        <span class="saison-rattacher-mot">Rattacher à</span>
        <select data-rubriquer="${echapper(serie.id)}">
          <option value="">choisir une rubrique…</option>
          ${options}
        </select>
      </label>
    </li>`;
}

export function construireLaSaison(series, publications, aujourdhui = versDateISO(new Date())) {
  const { rubriques, orphelines } = saisonDuClub(series, publications, aujourdhui);

  const galerie = rubriques.length
    ? `<ul class="saison-galerie">${rubriques
        .map((rubrique) => tuileRubrique(rubrique, publications, aujourdhui))
        .join('')}</ul>`
    // Un écran vide ouvre une porte, il ne s'excuse pas (vocabulaire d'interface).
    : '<p class="vide">Les rythmes de la saison s’afficheront ici.</p>';

  // Le groupe ne s'affiche QUE s'il y a quelque chose à rattacher : un titre
  // suivi de « rien » est du bruit.
  const aRattacher = orphelines.length
    ? `<p class="saison-groupe">À rattacher</p>
       <p class="vide">${
         orphelines.length === 1
           ? 'Un rythme tourne sans rubrique : rien ne le compte.'
           : `${orphelines.length} rythmes tournent sans rubrique : rien ne les compte.`
       }</p>
       <ul class="saison-galerie">${orphelines
         .map((serie) => tuileOrpheline(serie, publications, aujourdhui, RUBRIQUES_DEPART))
         .join('')}</ul>`
    : '';

  return `${galerie}${aRattacher}`;
}

function vueCreer(etat) {
  return `
    ${enTete('creer')}

    <section class="bloc">
      <h2>La saison</h2>
      <div data-bloc="saison">${construireLaSaison(etat.series, etat.publications)}</div>
    </section>

    <section class="bloc">
      <h2>Calendrier éditorial</h2>
      ${formulaireIdee({
        id: 'fch-pub',
        publications: etat.publications,
        rubriquesDepart: RUBRIQUES_DEPART,
        reseaux: RESEAUX_FCH,
        // « SE RÉPÈTE » DÈS LA CRÉATION (29 août 2026). Il n'existait qu'à la
        // MODIFICATION : poser une rubrique hebdomadaire demandait deux gestes
        // — noter l'idée, puis la rouvrir pour la faire revenir. Sur un site
        // dont la com est cyclique, c'est le cas ordinaire, pas l'exception.
        // Il n'est offert qu'ici : Yuno n'a rien demandé.
        champsEnPlus: [
          { nom: 'recurrence', libelle: 'Se répète', type: 'choix', options: RECURRENCES },
          { nom: 'recurrence_fin', libelle: "Se répète jusqu'au (facultatif)", type: 'date' },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>À venir</h2>
      <div data-bloc="a-venir">${construireAVenir(etat.publications, {
        ouvrable: true,
        // L'état en menu déroulant et les séries repliées : les deux demandes
        // de Noé du 29 août 2026. Options, et non règle commune — Yuno n'a rien
        // demandé, et une demande de forme vise l'écran qu'on regarde.
        pastille: true,
        series: true,
      })}</div>
    </section>

    <section class="bloc">
      <h2>Banque d'idées</h2>
      <div data-bloc="banque">${construireBanque(etat.publications)}</div>
      <div data-bloc="publiees">${construirePubliees(etat.publications)}</div>
    </section>
    ${fenetreIdee(etat)}
    ${pied()}`;
}

// Une publication s'ouvre au clic et se MODIFIE en fenêtre volante (demande de
// Noé, 24 août 2026) : la banque et les publiées portaient déjà la porte sans
// que rien ne l'écoute, « À venir » l'a gagnée. Tout s'y corrige — titre,
// réseau, format, rubrique, date, notes ; vider la date renvoie l'idée à la
// banque, comme « Repasser en idée ».
function fenetreIdee(etat) {
  if (!etat.ideeOuverte) return '';

  const pub = etat.publications.find((candidat) => candidat.id === etat.ideeOuverte);
  if (!pub) return '';

  return construireFenetre(
    pub.titre,
    `<h3 class="fenetre-titre">Modifier</h3>
     ${construireFormulaire({
       id: 'idee-edition',
       libelle: 'Modifier',
       action: 'modifier-idee',
       bouton: 'Enregistrer',
       avecPli: false,
       extra: `<input type="hidden" name="id" value="${echapper(pub.id)}">`,
       champs: [
         { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true,
           valeur: pub.titre },
         { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: RESEAUX_FCH,
           valeur: pub.reseau },
         // `post` a fusionné dans carrousel le 15 août : une vieille ligne se
         // présente sous le format qui reste.
         { nom: 'format', libelle: 'Format', type: 'choix', options: FORMATS,
           valeur: pub.format === 'post' ? 'carrousel' : pub.format },
         { nom: 'rubrique', libelle: 'Rubrique (facultative)', type: 'text',
           valeur: pub.rubrique ?? '',
           suggestions: rubriquesProposees(etat.publications, RUBRIQUES_DEPART) },
         { nom: 'date_prevue', libelle: "Prévue le (vide = banque d'idées)", type: 'date',
           valeur: pub.date_prevue ?? '' },
         // La répétition, pour la rubrique qui revient chaque semaine (demande
         // de Noé, 26 août 2026). Elle ne vaut qu'avec une date : sans jour,
         // l'idée retourne à la banque et la répétition part avec elle.
         { nom: 'recurrence', libelle: 'Se répète', type: 'choix', options: RECURRENCES,
           valeur: pub.recurrence ?? '' },
         { nom: 'recurrence_fin', libelle: "Se répète jusqu'au (facultatif)", type: 'date',
           valeur: pub.recurrence_fin ?? '' },
         { nom: 'notes', libelle: 'Notes', type: 'textarea', valeur: pub.notes ?? '' },
       ],
     })}
     <p><button type="button" class="lien-discret bouton-mini bouton-retirer"
       data-supprimer-pub="${echapper(pub.id)}">Supprimer l'idée</button></p>`,
  );
}

// Tout ce que le calendrier du site assemble. Pas de commande ni de relance :
// elles vivent chez Yuno, le club n'en a pas.
function elementsDuCalendrierFch(etat) {
  return assemblerCalendrier({
    evenements: etat.evenements,
    taches: etat.taches,
    objectifs: etat.objectifs,
    publications: etat.publications.filter(
      (pub) => pub.date_prevue && pub.statut !== 'publie',
    ),
  });
}

function vueCalendrier(etat) {
  const elements = elementsDuCalendrierFch(etat);

  // Les mêmes trois vues que le hub et Yuno : mois, semaine, agenda (demande
  // de Noé, 21 août 2026). Les grilles se promènent — un mois passé doit
  // montrer ses jours — ; l'agenda, lui, continue de ne dire que ce qui vient.
  const aujourdhui = versDateISO(new Date());
  const aVenir = elements.filter(
    (element) =>
      versDateISO(element.date) >= aujourdhui ||
      (element.jusqua && element.jusqua >= aujourdhui),
  );

  return `
    ${enTete('calendrier')}
    ${construireBarrePeriode(etat.vueCal, etat.ancreCal)}
    ${construireFiltres(etat.natures, { offertes: NATURES_FCH })}
    <div data-bloc="calendrier">
      ${
        etat.vueCal === 'agenda'
          ? construireCalendrier(aVenir, etat.natures)
          : construireGrille(elements, etat.natures, etat.vueCal, etat.ancreCal, {
              selection: etat.creationCal,
            })
      }
    </div>
    ${
      etat.detailCal
        ? fenetreDetail(etat.detailCal, {
            edition: etat.editionCal,
            // L'état d'une publication se règle depuis sa tuile, ici comme sur
            // le hub (27 août 2026) : c'est le calendrier qu'on regarde en se
            // demandant si le visuel est prêt.
            statutModifiable: true,
          })
        : ''
    }
    ${
      etat.jourOuvertCal
        ? fenetreJour(etat.jourOuvertCal, elementsDuJour(elements, etat.jourOuvertCal))
        : ''
    }
    ${pied()}`;
}

// Corriger sur place, depuis la fenêtre de détail. Chaque nature range sa date
// dans sa propre colonne : `debut` est le nom du champ à l'écran, pas celui de
// la base. Même circuit que l'espace Calendrier du hub, réduit aux natures que
// le site assemble.
async function corrigerDepuisCalendrier(champs) {
  const { type, id } = champs;
  const titre = champs.titre.trim();

  if (type === 'evenement') {
    const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
    const fin = finDeLEvenement(debut, champs);
    return appliquerAuCalendrier(type, id, {
      titre,
      date_debut: debut.toISOString(),
      date_fin: fin ? fin.toISOString() : null,
      recurrence: champs.recurrence || null,
      recurrence_fin: champs.recurrence_fin || null,
      lieu: champs.lieu?.trim() || null,
      notes: champs.notes?.trim() || null,
      // La face réunion : l'objet — vide = pas une réunion — et qui l'anime.
      // Le checkbox décoché est absent du formulaire ; sans objet, pas
      // d'animation qui tienne.
      ...(champs.reunion_objet !== undefined
        ? {
            reunion_objet: champs.reunion_objet || null,
            reunion_animee: champs.reunion_objet ? champs.reunion_animee === 'oui' : false,
          }
        : {}),
    });
  }

  if (type === 'publication') {
    return appliquerAuCalendrier(type, id, {
      titre,
      date_prevue: champs.debut,
      reseau: champs.reseau,
      format: champs.format,
      recurrence: champs.recurrence || null,
      recurrence_fin: (champs.recurrence && champs.recurrence_fin) || null,
    });
  }

  if (type === 'objectif') {
    return appliquerAuCalendrier(type, id, {
      titre,
      echeance: champs.debut,
      pourquoi: champs.pourquoi?.trim() || null,
      cible: champs.cible?.trim() || null,
    });
  }

  // Tâche et jalon : un titre et une échéance, rien de plus ici.
  return appliquerAuCalendrier(type, id, { titre, echeance: champs.debut });
}

// Chaque nature se supprime là où elle vit — même règle que le hub.
async function effacerDuCalendrier(type, id) {
  if (type === 'evenement') return api.supprimerEvenement(id);
  if (type === 'tache') return api.supprimerTache(id);
  if (type === 'publication') return api.supprimerPublication(id);
  if (type === 'objectif') return api.supprimerObjectif(id);
  if (type === 'jalon') return api.supprimerJalon(id);
  throw new Error(`Nature inconnue : ${type}`);
}

function vuePartenaires(etat) {
  return `
    ${enTete('partenaires')}

    <section class="bloc">
      <h2>Partenaires</h2>
      <div data-bloc="partenaires">${construirePartenaires(etat.partenaires)}</div>
      ${construireFormulaire({
        id: 'partenaire',
        libelle: 'Ajouter un partenaire',
        action: 'creer-partenaire',
        champs: [
          { nom: 'structure', libelle: 'Entreprise', type: 'text', requis: true },
          { nom: 'nom', libelle: 'Interlocuteur', type: 'text', requis: true },
          { nom: 'email', libelle: 'E-mail', type: 'text' },
          { nom: 'telephone', libelle: 'Téléphone', type: 'text' },
          { nom: 'notes', libelle: 'Notes — où en est la discussion', type: 'textarea' },
        ],
      })}
    </section>
    ${pied()}`;
}

// L'ÉCRAN CLUB : L'AIDE-MÉMOIRE (29 août 2026).
//
// Il attendait son contenu depuis le 7 août — « Noé ne sait pas encore ce qu'il
// y mettra », et inventer à sa place aurait été le pire service. Le dossier FCH
// a donné la réponse : le document des responsabilités du club, ses chiffres,
// son projet, ses créneaux. On ne l'invente donc pas, on le range.
//
// IL NE FAIT QUE LIRE, et c'est ce qui le justifie. Il sert l'objectif du
// 15 décembre — « laisser une com qui tourne sans moi » : celui qui reprend
// doit savoir à qui s'adresser et sur quoi s'aligner. Rien ne s'y coche, rien
// ne s'y compte, aucune donnée n'y est saisie.
//
// L'ordre va du plus souvent consulté au plus rarement : qui fait quoi d'abord
// (c'est la question qu'on se pose en semaine), la mission ensuite (on la relit
// avant d'écrire), les créneaux et les chiffres pour finir.

function blocCommission(commission) {
  const gens = commission.gens.join(' · ');
  // La part de Noé se dit, et elle se dit avec NUANCE : la Communication est sa
  // commission, il ne fait que contribuer aux Partenaires. Sans cette
  // distinction, l'écran laisserait croire que la prospection est son travail.
  const marque = commission.noe === 'responsable'
    ? '<span class="club-part club-part-mienne">ta commission</span>'
    : commission.noe === 'contribue'
      ? '<span class="club-part">tu y contribues</span>'
      : '';

  const missions = commission.missions
    ? `<ul class="club-missions">${commission.missions
        .map((mission) => `<li>${echapper(mission)}</li>`)
        .join('')}</ul>`
    : '';

  return `
    <li class="club-commission${commission.noe ? ' club-commission-mienne' : ''}">
      <p class="club-commission-tete">
        <span class="club-commission-nom">${echapper(commission.nom)}</span>
        ${marque}
      </p>
      <p class="club-gens">${echapper(gens)}</p>
      ${missions}
    </li>`;
}

function vueClub() {
  return `
    ${enTete('club')}

    <section class="bloc">
      <h2>Qui fait quoi</h2>
      <p class="discret sous-titre">Les neuf commissions du club, telles que le
        document des responsabilités les pose.</p>
      <ul class="club-commissions">${COMMISSIONS.map(blocCommission).join('')}</ul>
    </section>

    <section class="bloc">
      <h2>Le projet</h2>
      <p class="club-mission">${echapper(MISSION)}</p>
      <ul class="club-valeurs">${VALEURS.map(
        ([nom, comportement]) => `
        <li>
          <span class="club-valeur-nom">${echapper(nom)}</span>
          <span class="club-valeur-mot">${echapper(comportement)}</span>
        </li>`,
      ).join('')}</ul>
    </section>

    <section class="bloc bloc-discret">
      <details class="backlog">
        <summary>Les entraînements de la semaine
          <span class="chiffre">${CRENEAUX.reduce((total, [, lot]) => total + lot.length, 0)}</span>
        </summary>
        <ul class="club-jours">${CRENEAUX.map(
          ([jour, lot]) => `
          <li>
            <p class="club-jour">${echapper(jour)}</p>
            <ul class="club-creneaux">${lot
              .map(
                ([categorie, lieu, heure]) => `
              <li>
                <span class="club-categorie">${echapper(categorie)}</span>
                <span class="club-lieu">${echapper(lieu)}</span>
                <span class="club-heure chiffre">${echapper(heure)}</span>
              </li>`,
              )
              .join('')}</ul>
          </li>`,
        ).join('')}</ul>
      </details>
    </section>

    <section class="bloc bloc-discret">
      <details class="backlog">
        <summary>Le club en chiffres <span class="chiffre">${REPERES.length}</span></summary>
        <ul class="club-reperes">${REPERES.map(
          ([chiffre, quoi]) => `
          <li>
            <span class="club-chiffre chiffre">${echapper(chiffre)}</span>
            <span class="club-quoi">${echapper(quoi)}</span>
          </li>`,
        ).join('')}</ul>
      </details>
    </section>
    ${pied()}`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    const etat = {
      objectifs: [],
      victoires: [],
      publications: [],
      taches: [],
      evenements: [],
      partenaires: [],
      // Les séries du club : c'est ce qui permet à « La saison » de dire quels
      // rythmes tournent. Petite table (4 lignes au 29 août 2026).
      series: [],
      fiches: [],
      actionsClub: [],
      modelesPrepa: [],
      // La publication ouverte en fenêtre d'édition, sur Créer.
      ideeOuverte: null,
      vue: 'accueil',
      // La fiche de réunion ouverte : son id vient de l'adresse
      // (#hermitage/reunions/<id>), jamais d'un état d'interface.
      reunionOuverte: null,
      // La tuile de capture du « + » : le site en a une depuis le 21 août 2026
      // (décision de Noé) — une réunion se note en sortant de la salle.
      creationCal: null,
      // `filtre` est celui des publications ; `natures` celui du calendrier.
      // Les deux ont longtemps été confondus — `vueCalendrier` passait `filtre`
      // (la chaîne « tout ») là où le calendrier attend un Set, et l'écran
      // levait `natures.has is not a function` sans que rien ne s'affiche.
      filtre: 'tout',
      natures: new Set(NATURES_FCH),
      // Le calendrier a ses trois vues depuis le 21 août 2026 (demande de
      // Noé) : la grille du mois d'abord, comme au hub et chez Yuno.
      vueCal: 'mois',
      ancreCal: new Date(),
      detailCal: null,
      editionCal: false,
      jourOuvertCal: null,
      // Le mot dit après une écriture qui a échoué. L'écran est déjà revenu en
      // arrière tout seul ; un geste défait en silence ressemble à une panne.
      souci: null,
    };

    // Déclarés ici parce que `rendre` s'en sert : les fonctions sont posées
    // plus bas, quand les écouteurs se branchent.
    let poserLEntreeClavier = null;
    let rafraichirLaCapture = null;

    let minuteurSouci = null;
    const dire = (message) => {
      etat.souci = message;
      rendre();
      clearTimeout(minuteurSouci);
      minuteurSouci = setTimeout(() => {
        etat.souci = null;
        rendre();
      }, 6000);
    };

    const rendre = () => {
      if (etat.vue === 'creer') section.innerHTML = vueCreer(etat);
      else if (etat.vue === 'reunions') section.innerHTML = vueReunions(etat);
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'partenaires') section.innerHTML = vuePartenaires(etat);
      else if (etat.vue === 'club') section.innerHTML = vueClub();
      else section.innerHTML = vueAccueil(etat);

      // Le « + » flottant suit toutes les vues (décision de Noé, 21 août
      // 2026) : une réunion se note en sortant de la salle, pas en pensant à
      // revenir sur la bonne page. La tuile est celle du hub — nature
      // Événement d'abord, la pastille Réunion toujours offerte.
      section.insertAdjacentHTML(
        'beforeend',
        `<button type="button" class="ouvrir-capture" data-ouvrir-plus
           title="Ajouter" aria-label="Ajouter">+</button>`,
      );
      if (etat.creationCal) {
        section.insertAdjacentHTML(
          'beforeend',
          fenetreCreation({
          ...etat.creationCal,
          reunion: true,
          // Le site EST le club : il offre la pastille qui déclare un temps fort.
          tempsFort: true,
          projets: etat.projets ?? [],
        }),
        );
      }

      if (etat.souci) {
        section
          .querySelector('.fch-nav')
          ?.insertAdjacentHTML('afterend', `<p class="vide">${echapper(etat.souci)}</p>`);
      }

      centrerActif(section.querySelector('.fch-nav'));
      centrerActif(section.querySelector('.filtres'));
      // La grille vient d'être réécrite : elle a perdu son point d'entrée
      // clavier, et la tuile ouverte ses libellés de pastilles.
      poserLEntreeClavier?.();
      if (etat.creationCal) rafraichirLaCapture?.();
    };

    // Une victoire qui n'existe pas encore en base : elle s'affiche pendant
    // l'aller-retour, puis cède la place à la vraie — ou disparaît si
    // l'écriture a échoué. Le mur des victoires ne peut que monter, il ne doit
    // donc jamais garder un accomplissement qui n'a pas eu lieu.
    const victoireProvisoire = (titre) => ({
      id: identifiantProvisoire(),
      espace: ESPACE,
      titre,
      date: versDateISO(),
    });

    const remplacerVictoire = (provisoire, vraie) => {
      const rang = etat.victoires.indexOf(provisoire);
      if (rang !== -1 && vraie) etat.victoires[rang] = vraie;
    };

    const retirerVictoire = (provisoire) => {
      const rang = etat.victoires.indexOf(provisoire);
      if (rang !== -1) etat.victoires.splice(rang, 1);
      rendre();
    };

    const rendrePartenaires = () => {
      const cible = section.querySelector('[data-bloc="partenaires"]');
      if (cible) cible.innerHTML = construirePartenaires(etat.partenaires);
    };

    this.naviguer = (nouvelleRoute) => {
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      // L'adresse porte l'id d'une FICHE — mais le bandeau de l'accueil, lui,
      // ne connaît que l'ÉVÉNEMENT : il n'a pas les préparations sous la main.
      // On accepte donc les deux, et l'événement se résout en sa fiche
      // (29 août 2026). Sans ça, « Écrire le bilan » ouvrirait la liste.
      etat.reunionOuverte =
        etat.vue === 'reunions' ? ficheDeLAdresse(nouvelleRoute?.id ?? null) : null;
      rendre();
    };

    function ficheDeLAdresse(id) {
      if (!id) return null;
      if (etat.fiches.some((fiche) => fiche.id === id)) return id;
      return etat.fiches.find((fiche) => fiche.evenement_id === id)?.id ?? id;
    }

    const charger = async () => {
      const [
        objectifs, victoires, publications, taches, evenements, contacts,
        fiches, actionsClub, modeles, projets, series,
      ] = await Promise.all([
        api.objectifsActifs({ espace: ESPACE }),
        api.victoiresDeLEspace(ESPACE),
        api.publicationsToutes(ESPACE),
        api.tachesDatees({ espace: ESPACE }),
        // TOUS les événements depuis le 21 août 2026, plus seulement ceux à
        // venir : les réunions passées portent leurs fiches. Le calendrier,
        // lui, refiltre l'avenir — son affichage n'a pas bougé.
        api.evenementsTous({ espace: ESPACE }),
        api.contactsTous(),
        api.fichesReunionToutes(),
        api.actionsClubToutes(),
        api.modelesPreparationTous(),
        api.projetsTous(),
        api.chargerLesSeries(),
      ]);
      // Les projets du club, pour la pastille de rattachement de la tuile.
      etat.projets = projets.filter((projet) => projet.espace === ESPACE);

      Object.assign(etat, {
        objectifs,
        victoires,
        publications,
        taches,
        evenements,
        partenaires: contacts.filter((contact) => contact.type === TYPE_PARTENAIRE),
        fiches,
        actionsClub,
        series,
        // Le menu « Modèles » de la fiche ne montre que ceux du club.
        modelesPrepa: modeles.filter((modele) => modele.espace === ESPACE),
      });
    };

    // Revenir sur le site le relit : ce qui a été posé depuis le hub doit s'y
    // voir sans recharger la page.
    this.rafraichir = async () => {
      await charger();
      rendre();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement du site FC Hermitage impossible', erreur);
      section.innerHTML = `
        ${enTete('accueil')}
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section, route));
      return;
    }

    // La tuile de capture : le site a son « + » depuis le 21 août 2026
    // (décision de Noé). `brancherCapture` branche AUSSI les menus déroulants
    // des formulaires — `brancherChoix`, qui servait quand ce site n'avait pas
    // de tuile, est parti avec : les deux ensemble traitaient chaque clic deux
    // fois, et un panneau basculé deux fois reste fermé.
    rafraichirLaCapture = brancherCapture(section, { projets: () => etat.projets ?? [] });

    const fermerFenetres = () => {
      etat.creationCal = null;
      etat.detailCal = null;
      etat.editionCal = false;
      etat.jourOuvertCal = null;
      etat.ideeOuverte = null;
      rendre();
    };

    // Entrée ou Espace sur une case posée au clavier ouvre la même fenêtre
    // qu'un clic.
    poserLEntreeClavier = brancherClavier(section, (jour) => {
      etat.detailCal = null;
      etat.creationCal = { debut: jour, fin: jour, nature: natureParDefaut(etat.natures) };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });
    poserLEntreeClavier();

    // Glisser sur un jour — ou une série de jours — ouvre la tuile, dates déjà
    // posées. Même geste que dans le hub et chez Yuno.
    brancherSelection(section, ({ debut, fin }) => {
      etat.detailCal = null;
      etat.creationCal = { debut, fin, nature: natureParDefaut(etat.natures) };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });

    // Glisser une barre la reporte : l'action la plus fréquente après créer.
    brancherDeplacement(section, async ({ element: cle, ecart }) => {
      const [type, id] = cle.split(':');
      const element = elementsDuCalendrierFch(etat).find(
        (candidat) => candidat.type === type && String(candidat.id) === id,
      );
      if (!element) return;

      try {
        await appliquerAuCalendrier(type, id, champsApresDeplacement(element, ecart));
        await charger();
        rendre();
      } catch (souci) {
        console.error('Déplacement impossible', souci);
        dire("Le report n'a pas pu être enregistré.");
      }
    });

    // COCHER UNE TÂCHE depuis « À faire » (30 août 2026, avec la restructuration
    // de l'accueil). Le geste est celui du hub — `cocherDepuisTableauDeBord`,
    // js/taches.js — et non une copie : il ouvre la fenêtre de durée, écrit la
    // victoire et laisse voir la coche avant que la ligne s'en aille.
    //
    // `construireLignesTaches` émet `data-cocher` ; le calendrier du site, lui,
    // écoute `data-cocher-tache`. Deux attributs voisins, deux gestes distincts
    // — sans cet écouteur, les cercles de « À faire » auraient été des boutons
    // morts, exactement ce que la page du hub prend soin d'éviter.
    section.addEventListener('click', (evenement) => {
      const cercle = evenement.target.closest('[data-cocher]');
      if (!cercle) return;
      cocherDepuisTableauDeBord(cercle, etat.taches, rendre);
    });

    // POSER UN RYTHME QUI MANQUE : le bouton n'écrit RIEN. Il ouvre le
    // formulaire « Noter une idée » déjà rempli — la rubrique et la cadence —
    // et laisse à Noé le titre et le jour de départ, qui sont des décisions.
    // C'est la règle des propositions du rendez-vous du dimanche : accepter
    // coûte un geste, mais le hub ne décide pas à sa place.
    //
    // Il ne passe donc PAS par la tuile de capture du « + » : celle-ci n'a pas
    // de champ rubrique — et lui en ajouter un pour ce seul besoin le poserait
    // aux quatre espaces.
    section.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('[data-poser-rubrique]');
      if (!bouton) return;

      // `construireFormulaire({ id })` se sert de l'id comme PRÉFIXE de ses
      // champs — il ne le pose pas sur le dépliant. On part donc d'un champ
      // connu et on remonte : `#fch-pub` n'existe pas, et le chercher rendait
      // `null`.
      const ancre = section.querySelector('#fch-pub-titre');
      const formulaire = ancre?.closest('form') ?? ancre?.closest('.ajout');
      const pli = ancre?.closest('.ajout');
      if (!formulaire || !pli) return;

      pli.open = true;

      // UN CHAMP « CHOIX » NE SE REMPLIT PAS EN POSANT SA VALEUR : il porte un
      // input CACHÉ doublé d'un bouton qui affiche le libellé et d'un panneau
      // d'options. Écrire dans l'input laissait « Une seule fois » à l'écran
      // sur une récurrence pourtant posée à `hebdo` — mesuré.
      //
      // On clique donc l'option, comme le ferait un doigt : `poserLeChoix`
      // (js/gabarits.js) met alors à jour l'input, le libellé et l'option
      // active, d'un seul tenant. Passer par le vrai geste plutôt que de le
      // simuler à moitié.
      const poser = (nom, valeur) => {
        const option = formulaire.querySelector(
          `[data-choix="${nom}"][data-valeur="${CSS.escape(valeur)}"]`,
        );
        if (option) {
          option.click();
          return;
        }
        const champ = formulaire.querySelector(`[name="${nom}"]`);
        if (champ) champ.value = valeur;
      };

      poser('rubrique', bouton.dataset.poserRubrique);
      poser('recurrence', 'hebdo');

      // Le curseur va où la décision commence : le titre.
      pli.scrollIntoView({ block: 'center', behavior: 'smooth' });
      ancre.focus({ preventScroll: true });
    });

    // RATTACHER UN RYTHME À SA RUBRIQUE, depuis « La saison ». Un menu
    // déroulant, donc un `change` et non un `click` : c'est le seul geste du
    // site qui se fasse au clavier comme au doigt sans rien réinventer.
    //
    // L'écriture est OPTIMISTE (js/ecriture.js) : la tuile change de camp tout
    // de suite et l'aller-retour part derrière. Sans ça, le menu resterait
    // figé 300 à 800 ms sur téléphone — et c'est un geste qu'on fait deux fois
    // de suite, une par rythme.
    section.addEventListener('change', async (evenement) => {
      const menu = evenement.target.closest('[data-rubriquer]');
      if (!menu || !menu.value) return;

      const serie = etat.series.find((une) => une.id === menu.dataset.rubriquer);
      if (!serie) return;
      const rubrique = menu.value;

      // Les occurrences À VENIR suivent leur série à l'écran comme en base :
      // sans ça la tuile se remplirait alors que le compte par rubrique
      // resterait faux jusqu'au prochain chargement.
      const aujourdhui = versDateISO(new Date());
      const touchees = etat.publications.filter(
        (pub) => pub.serie_id === serie.id && pub.date_prevue && pub.date_prevue >= aujourdhui,
      );
      const avant = touchees.map((pub) => pub.rubrique);
      for (const pub of touchees) pub.rubrique = rubrique;

      const ok = await modifierAussitot(
        serie,
        { modele: { ...(serie.modele ?? {}), rubrique } },
        () => api.rubriquerSerie(serie, rubrique),
        { rendre, echouer: dire },
      );
      // `modifierAussitot` rend sa ligne à l'état d'avant, pas les parutions :
      // elles ne sont pas la ligne qu'il surveille, c'est à nous de les rendre.
      if (!ok) {
        touchees.forEach((pub, i) => { pub.rubrique = avant[i]; });
        rendre();
      }
    });

    // L'état d'une publication depuis le calendrier : son rond avance d'un cran,
    // sa tuile règle l'état au doigt. Le geste est le MÊME que sur le hub et
    // chez Yuno (demande de Noé, 27 août 2026) — jusqu'ici le rond était bien
    // dessiné par la barre commune mais n'écoutait personne, et l'appui ouvrait
    // la tuile. Il vit dans `calendrier-commun.js`, une seule fois.
    brancherEtatPublication(section, {
      publications: () => etat.publications,
      ouverte: () => (etat.detailCal?.type === 'publication' ? etat.detailCal.source : null),
      rendre,
      echouer: dire,
      // Une idée notée à l'instant porte un identifiant provisoire : le serveur
      // ne la connaît pas encore, rien ne peut la faire avancer.
      bloque: (pub) => estProvisoire(pub.id),
    });

    // Échap ferme la fenêtre — c'est le geste attendu partout ailleurs.
    document.addEventListener('keydown', (evenement) => {
      if (
        evenement.key === 'Escape' &&
        (etat.creationCal || etat.detailCal || etat.jourOuvertCal || etat.ideeOuverte)
      ) {
        fermerFenetres();
      }
    });

    this.naviguer(route);

    const trouverPub = (id) => etat.publications.find((pub) => pub.id === id);
    const ouvrirObjectif = (id) => {
      const element = section.querySelector(`[data-objectif="${CSS.escape(id)}"]`);
      if (element) element.open = true;
    };

    // --- Formulaires ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        await appliquer(formulaire.dataset.action, champs);
        // La tuile d'ajout se referme quand ce qu'elle portait est enregistré.
        // Seulement la volante : les formulaires posés dans une fenêtre ou dans
        // la page vivent leur vie, et les vider sous les doigts serait brutal.
        const volante = formulaire.closest('.ajout-volant');
        if (volante) {
          formulaire.reset();
          volante.removeAttribute('open');
        }
      } catch (souci) {
        console.error('Action impossible', souci);
        erreur.textContent = souci.message ?? "L'action a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    async function appliquer(action, champs) {
      // La tuile du « + » : tout passe par le circuit commun, espace fch.
      if (action === 'creer-depuis-calendrier') {
        await poserAuCalendrier(champs, { espaceParDefaut: ESPACE });
        etat.creationCal = null;
        await charger();
        rendre();
        return;
      }

      // Le formulaire de la fenêtre de détail : une date mal posée se répare,
      // la supprimer pour la recréer ferait perdre tout le reste de la fiche.
      if (action === 'modifier-depuis-calendrier') {
        await corrigerDepuisCalendrier(champs);
        etat.detailCal = null;
        etat.editionCal = false;
        await charger();
        rendre();
        return;
      }

      // Le contrat de la fiche : type, objectif, participants, envois, notes.
      if (action === 'preparer-reunion') {
        const fiche = etat.fiches.find((f) => f.id === champs.id);
        if (!fiche) return;
        const misAJour = await api.modifierFicheReunion(champs.id, {
          objectif: champs.objectif?.trim() || null,
          participants: champs.participants?.trim() || null,
          notes_avant: champs.notes_avant?.trim() || null,
          // Absents de la fiche d'un participant (24 août 2026) : on n'écrit
          // que ce que le formulaire portait — un champ qui n'existe pas à
          // l'écran ne doit pas effacer ce qui est en base.
          ...(champs.type_reunion !== undefined
            ? { type_reunion: champs.type_reunion || null }
            : {}),
          ...(champs.infos_avant !== undefined
            ? { infos_avant: champs.infos_avant?.trim() || null }
            : {}),
        });
        Object.assign(fiche, misAJour);
        rendre();
        return;
      }

      if (action === 'ajouter-point-reunion') {
        const fiche = etat.fiches.find((f) => f.id === champs.fiche_id);
        if (!fiche) return;
        const point = await api.ajouterPointReunion({
          fiche_id: champs.fiche_id,
          titre: champs.titre.trim(),
          type_point: champs.type_point || null,
          minutes: Number(champs.minutes) || null,
          sortie: champs.sortie?.trim() || null,
          ordre: fiche.points.length + 1,
        });
        fiche.points.push(point);
        rendre();
        return;
      }

      // Une action décidée entre au tableau du club — et, si elle est pour
      // Noé, dans le circuit des tâches : les deux restent reliées.
      if (action === 'ajouter-action-club') {
        let tache_id = null;
        if (champs.pour_moi === 'oui') {
          const tache = await api.creerTache({
            espace: ESPACE,
            titre: champs.texte.trim(),
            statut: 'actif',
            priorite: 4,
            echeance: champs.echeance || null,
          });
          etat.taches.push(tache);
          tache_id = tache.id;
        }
        const actionClub = await api.ajouterActionClub({
          fiche_id: champs.fiche_id,
          texte: champs.texte.trim(),
          responsable: champs.pour_moi === 'oui' ? champs.responsable?.trim() || 'Noé' : champs.responsable?.trim() || null,
          echeance: champs.echeance || null,
          tache_id,
        });
        etat.actionsClub.push(actionClub);
        rendre();
        return;
      }

      // Le compte-rendu court, et ce qui ne regarde que Noé. `cr_date` se pose
      // à la première écriture et ne bouge plus : elle dit quand le CR est né.
      if (action === 'conclure-reunion') {
        const fiche = etat.fiches.find((f) => f.id === champs.id);
        if (!fiche) return;
        const misAJour = await api.modifierFicheReunion(champs.id, {
          cr_decisions: champs.cr_decisions?.trim() || null,
          cr_en_attente: champs.cr_en_attente?.trim() || null,
          cr_suivi: champs.cr_suivi || null,
          cr_date: fiche.cr_date ?? versDateISO(),
          bilan_retenu: champs.bilan_retenu?.trim() || null,
          ...(champs.bilan_animation !== undefined
            ? { bilan_animation: champs.bilan_animation?.trim() || null }
            : {}),
        });
        Object.assign(fiche, misAJour);
        rendre();
        return;
      }

      if (action === 'lien-presentation' || action === 'lien-compte-rendu') {
        const fiche = etat.fiches.find((f) => f.id === champs.id);
        if (!fiche) return;
        const colonne = action === 'lien-presentation' ? 'lien_presentation' : 'lien_compte_rendu';
        const misAJour = await api.modifierFicheReunion(champs.id, {
          [colonne]: champs.lien?.trim() || null,
        });
        Object.assign(fiche, misAJour);
        rendre();
        return;
      }

      if (action === 'modifier-idee') {
        const pub = etat.publications.find((candidat) => candidat.id === champs.id);
        if (!pub) return;
        Object.assign(
          pub,
          await api.modifierPublication(champs.id, {
            titre: champs.titre.trim(),
            reseau: champs.reseau,
            format: champs.format,
            rubrique: champs.rubrique?.trim() || null,
            notes: champs.notes?.trim() || null,
            // Vider la date renvoie l'idée à la banque — et emmène la
            // répétition avec elle : sans jour, il n'y a rien qui revienne.
            date_prevue: champs.date_prevue || null,
            recurrence: (champs.date_prevue && champs.recurrence) || null,
            recurrence_fin:
              (champs.date_prevue && champs.recurrence && champs.recurrence_fin) || null,
          }),
        );
        etat.ideeOuverte = null;
        rendre();
        return;
      }

      if (action === 'noter-idee') {
        const publication = await api.creerPublication({
          espace: ESPACE,
          titre: champs.titre.trim(),
          reseau: champs.reseau,
          format: champs.format,
          rubrique: champs.rubrique?.trim() || null,
          notes: champs.notes?.trim() || null,
          date_prevue: champs.date_prevue || null,
          // Sans date il n'y a rien à répéter : l'idée retourne à la banque, et
          // `creerPublication` écarte la récurrence de lui-même. On la passe
          // quand même — c'est elle qui décide, pas l'écran.
          recurrence: champs.recurrence || null,
          recurrence_fin: champs.recurrence_fin || null,
        });
        etat.publications = [publication, ...etat.publications];
        // Une série vient de naître : « La saison » la lit dans `etat.series`,
        // qu'il faut relire — sans quoi la tuile resterait « rien de posé »
        // jusqu'au prochain chargement complet.
        if (champs.recurrence && champs.date_prevue) etat.series = await api.chargerLesSeries();
        rendre();
        return;
      }

      if (action === 'creer-partenaire') {
        const partenaire = await api.creerContact({
          nom: champs.nom.trim(),
          type: TYPE_PARTENAIRE,
          structure: champs.structure.trim(),
          email: champs.email?.trim() || null,
          telephone: champs.telephone?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.partenaires = [...etat.partenaires, partenaire].sort((a, b) =>
          (a.structure ?? '').localeCompare(b.structure ?? ''),
        );
        rendrePartenaires();
        return;
      }

      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          espace: ESPACE,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        etat.objectifs = [...etat.objectifs, { ...objectif, jalons: objectif.jalons ?? [] }];
        rendre();
        return;
      }

      if (action === 'creer-jalon') {
        const objectif = etat.objectifs.find((o) => o.id === champs.objectif_id);
        const jalon = await api.creerJalon({
          objectif_id: champs.objectif_id,
          titre: champs.titre.trim(),
          echeance: champs.echeance || null,
          ordre: (objectif?.jalons?.length ?? 0) + 1,
        });
        objectif.jalons = [...(objectif.jalons ?? []), jalon];
        rendre();
        ouvrirObjectif(champs.objectif_id);
        return;
      }

      if (action === 'modifier-objectif') {
        const objectif = etat.objectifs.find((o) => o.id === champs.objectif_id);
        Object.assign(
          objectif,
          await api.modifierObjectif(champs.objectif_id, {
            titre: champs.titre.trim(),
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
            echeance: champs.echeance || null,
          }),
        );
        rendre();
        ouvrirObjectif(objectif.id);
      }
    }

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      // Le « + » ouvre la tuile, sur un événement : c'est pour noter une
      // réunion que ce site l'a gagnée. Le fond assombri la referme.
      if (evenement.target.closest('[data-ouvrir-plus]')) {
        etat.detailCal = null;
        etat.editionCal = false;
        etat.jourOuvertCal = null;
        etat.creationCal = { debut: versDateISO(), nature: 'evenement' };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }
      if (evenement.target.closest('[data-fermer-fenetre]')) {
        fermerFenetres();
        return;
      }

      // La pastille de nature de la tuile : la fiche se redessine pour la
      // nature choisie. Les dates sont éditables — on garde ce qui vient
      // d'être saisi plutôt que de revenir à ce que le glissement avait posé.
      const natureCreation = evenement.target.closest('[data-nature-creation]');
      if (natureCreation) {
        etat.creationCal = {
          ...etat.creationCal,
          debut: section.querySelector('#cal-debut')?.value || etat.creationCal?.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creationCal?.fin,
          nature: natureCreation.dataset.natureCreation,
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      // Le « +N » d'une case pleine déplie sa journée.
      const journee = evenement.target.closest('[data-jour-complet]');
      if (journee) {
        etat.creationCal = null;
        etat.detailCal = null;
        etat.jourOuvertCal = journee.dataset.jourComplet;
        rendre();
        return;
      }

      // Le cercle d'une tâche se coche depuis la grille, sans ouvrir son
      // détail : c'est le geste le plus fréquent, il ne mérite pas une
      // fenêtre. Il passe AVANT l'ouverture du détail — le cercle est dans la
      // barre, et sans cette priorité le clic ouvrirait la fenêtre par-dessus.
      const cercle = evenement.target.closest('[data-cocher-tache]');
      if (cercle) {
        evenement.stopPropagation();
        const tache = etat.taches.find((candidat) => candidat.id === cercle.dataset.cocherTache);
        if (!tache || tache.statut === 'fait' || estProvisoire(tache.id)) return;

        const avantTache = { ...tache };
        const provisoire = victoireProvisoire(tache.titre);
        etat.victoires.unshift(provisoire);
        const faite = await modifierAussitot(
          tache,
          { statut: 'fait', date_fait: new Date().toISOString() },
          async () => {
            const { tache: rendue, victoire } = await api.terminerTache(avantTache);
            remplacerVictoire(provisoire, victoire);
            return rendue;
          },
          { rendre, echouer: dire },
        );
        if (!faite) retirerVictoire(provisoire);
        return;
      }

      // Une barre de la grille, une ligne de l'agenda ou de la journée
      // dépliée : toutes mènent au détail.
      const ouvrirDetail = evenement.target.closest('[data-element]');
      if (ouvrirDetail) {
        const [type, id] = ouvrirDetail.dataset.element.split(':');
        etat.creationCal = null;
        etat.editionCal = false;
        etat.jourOuvertCal = null;
        etat.detailCal = elementsDuCalendrierFch(etat).find(
          (element) => element.type === type && String(element.id) === id,
        );
        rendre();
        return;
      }

      if (evenement.target.closest('[data-modifier-element]')) {
        etat.editionCal = true;
        rendre();
        section.querySelector('#cal-edition-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-annuler-edition]')) {
        etat.editionCal = false;
        rendre();
        return;
      }

      const supprimerElement = evenement.target.closest('[data-supprimer-element]');
      if (supprimerElement) {
        const [type, id] = supprimerElement.dataset.supprimerElement.split(':');
        if (!confirm(`Supprimer « ${etat.detailCal?.titre} » ?`)) return;
        supprimerElement.disabled = true;
        try {
          await effacerDuCalendrier(type, id);
          etat.detailCal = null;
          await charger();
          rendre();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerElement.disabled = false;
        }
        return;
      }

      const vueCal = evenement.target.closest('[data-vue-cal]');
      if (vueCal) {
        etat.vueCal = vueCal.dataset.vueCal;
        rendre();
        return;
      }

      const periode = evenement.target.closest('[data-periode]');
      if (periode) {
        const sens = Number(periode.dataset.periode);
        // 0 = « Aujourd'hui » : on ne se perd jamais longtemps dans un calendrier.
        etat.ancreCal = sens === 0 ? new Date() : deplacerAncre(etat.ancreCal, etat.vueCal, sens);
        rendre();
        return;
      }

      // « Préparer » : la fiche naît vide — la structure EST le savoir-faire —
      // et s'ouvre aussitôt. Titre et date sont copiés de l'événement.
      const creerFiche = evenement.target.closest('[data-creer-fiche]');
      if (creerFiche) {
        const reunion = etat.evenements.find((e) => e.id === creerFiche.dataset.creerFiche);
        if (!reunion) return;
        try {
          const fiche = await api.creerFicheReunion({
            evenement_id: reunion.id,
            titre: reunion.titre,
            date: versDateISO(new Date(reunion.date_debut)),
          });
          etat.fiches.unshift(fiche);
          location.hash = `#hermitage/reunions/${fiche.id}`;
        } catch (souci) {
          console.error('Création de la fiche impossible', souci);
          dire("La fiche n'a pas pu être créée.");
        }
        return;
      }

      const ouvrirFiche = evenement.target.closest('[data-ouvrir-fiche]');
      if (ouvrirFiche) {
        location.hash = `#hermitage/reunions/${ouvrirFiche.dataset.ouvrirFiche}`;
        return;
      }

      // Un point de l'ordre du jour se clôt : traité, ou reporté. Recliquer le
      // même statut le retire — un geste se défait par le même geste.
      const pointStatut = evenement.target.closest('[data-point-statut]');
      if (pointStatut) {
        const [id, statut] = pointStatut.dataset.pointStatut.split(':');
        for (const fiche of etat.fiches) {
          const point = fiche.points.find((candidat) => candidat.id === id);
          if (!point) continue;
          const suivant = point.statut === statut ? 'a_venir' : statut;
          await modifierAussitot(
            point,
            { statut: suivant },
            () => api.modifierPointReunion(id, { statut: suivant }),
            { rendre, echouer: dire },
          );
          return;
        }
        return;
      }

      const retirerPoint = evenement.target.closest('[data-retirer-point]');
      if (retirerPoint) {
        const id = retirerPoint.dataset.retirerPoint;
        for (const fiche of etat.fiches) {
          const rang = fiche.points.findIndex((candidat) => candidat.id === id);
          if (rang === -1) continue;
          await retirerAussitot(
            fiche.points,
            fiche.points[rang],
            () => api.supprimerPointReunion(id),
            { rendre, echouer: dire },
          );
          return;
        }
        return;
      }

      // Verser un modèle dans les notes de la fiche (24 août 2026 au soir) :
      // ses lignes arrivent en TEXTE dans le champ — brouillon en cours
      // compris, c'est lui qui sert de base — sans doubler ce qui s'y trouve,
      // et SANS redessin : le champ se complète sous les yeux, puis
      // s'enregistre derrière.
      const appliquerModele = evenement.target.closest('[data-appliquer-modele]');
      if (appliquerModele) {
        const fiche = etat.fiches.find((f) => f.id === etat.reunionOuverte);
        const modele = etat.modelesPrepa.find(
          (candidat) => candidat.id === appliquerModele.dataset.appliquerModele,
        );
        const champ = section.querySelector('#fiche-contrat-notes_avant');
        if (!fiche || !modele || !champ) return;
        section.querySelector('.fiche-menu')?.removeAttribute('open');

        // Changer de modèle ÉCHANGE les lignes de modèle (correction de Noé,
        // 24 août au soir — le simple ajout ne permettait pas d'en changer) :
        // toute ligne du champ qui correspond mot pour mot à une ligne d'UN
        // des modèles est tenue pour « du modèle » et cède la place ; une
        // ligne écrite ou retouchée par Noé n'y correspond plus — elle est à
        // lui, elle reste.
        const normalise = (texte) => texte.replace(/^[-•]\s*/, '').trim().toLowerCase();
        const lignesDesModeles = new Set(
          etat.modelesPrepa.flatMap((m) => m.items.map((item) => normalise(item.texte))),
        );
        const gardees = champ.value
          .split('\n')
          .filter((ligne) => ligne.trim() && !lignesDesModeles.has(normalise(ligne)));
        const dejaLa = new Set(gardees.map(normalise));
        const versees = modele.items
          .map((item) => item.texte.trim())
          .filter((texte) => !dejaLa.has(texte.toLowerCase()))
          .map((texte) => `- ${texte}`);

        const nouveau = [...gardees, ...versees].join('\n');
        if (nouveau === champ.value) return;
        champ.value = nouveau;
        try {
          await api.modifierFicheReunion(fiche.id, { notes_avant: nouveau });
          fiche.notes_avant = nouveau;
        } catch (souci) {
          console.error('Versement du modèle impossible', souci);
          // Le texte reste dans le champ : « Enregistrer » le gardera.
          dire("Le modèle est dans le champ mais n'a pas pu s'enregistrer — touche Enregistrer.");
        }
        return;
      }

      // Le statut d'une action tourne : à faire → en cours → fait → à faire.
      const actionStatut = evenement.target.closest('[data-action-statut]');
      if (actionStatut) {
        const actionClub = etat.actionsClub.find(
          (candidat) => candidat.id === actionStatut.dataset.actionStatut,
        );
        if (!actionClub || estProvisoire(actionClub.id)) return;
        const suivant = ACTION_SUIVANT[actionClub.statut];
        await modifierAussitot(
          actionClub,
          { statut: suivant },
          () => api.modifierActionClub(actionClub.id, { statut: suivant }),
          { rendre, echouer: dire },
        );
        return;
      }

      const retirerAction = evenement.target.closest('[data-retirer-action]');
      if (retirerAction) {
        const actionClub = etat.actionsClub.find(
          (candidat) => candidat.id === retirerAction.dataset.retirerAction,
        );
        if (!actionClub || estProvisoire(actionClub.id)) return;
        await retirerAussitot(
          etat.actionsClub,
          actionClub,
          () => api.supprimerActionClub(actionClub.id),
          { rendre, echouer: dire },
        );
        return;
      }

      // Le titre attendu sur le Drive, dans le presse-papiers : renommer la
      // copie ne demande plus que de coller.
      const copierTitre = evenement.target.closest('[data-copier-titre]');
      if (copierTitre) {
        try {
          await navigator.clipboard.writeText(copierTitre.dataset.copierTitre);
          dire('Titre copié — colle-le en renommant la copie sur le Drive.');
        } catch {
          dire('La copie a été refusée par le navigateur — retape le titre.');
        }
        return;
      }

      const supprimerFiche = evenement.target.closest('[data-supprimer-fiche]');
      if (supprimerFiche) {
        const id = supprimerFiche.dataset.supprimerFiche;
        const fiche = etat.fiches.find((f) => f.id === id);
        if (!confirm(`Supprimer la fiche « ${fiche?.titre} » ? Les actions du tableau sont conservées.`)) {
          return;
        }
        try {
          await api.supprimerFicheReunion(id);
          etat.fiches = etat.fiches.filter((f) => f.id !== id);
          location.hash = '#hermitage/reunions';
        } catch (souci) {
          console.error('Suppression impossible', souci);
          dire("La fiche n'a pas pu être supprimée.");
        }
        return;
      }

      const filtre = evenement.target.closest('[data-filtre]');
      if (filtre) {
        etat.filtre = filtre.dataset.filtre;
        rendre();
        return;
      }

      // Les cases du calendrier : une nature qu'on décoche disparaît de la
      // liste. Même geste que dans l'espace Calendrier du hub.
      const filtreNature = evenement.target.closest('[data-filtre-nature]');
      if (filtreNature) {
        const suite = new Set(etat.natures);
        const cle = filtreNature.dataset.filtreNature;
        if (suite.has(cle)) suite.delete(cle);
        else suite.add(cle);
        etat.natures = suite;
        rendre();
        return;
      }

      const supprimerPartenaire = evenement.target.closest('[data-supprimer-partenaire]');
      if (supprimerPartenaire) {
        const partenaire = etat.partenaires.find(
          (p) => p.id === supprimerPartenaire.dataset.supprimerPartenaire,
        );
        if (!partenaire || estProvisoire(partenaire.id)) return;
        await retirerAussitot(
          etat.partenaires,
          partenaire,
          () => api.supprimerContact(partenaire.id),
          { rendre: rendrePartenaires, echouer: dire },
        );
        return;
      }

      // Une publication s'ouvre au clic — sauf sur ses propres contrôles :
      // avancer un statut ou programmer une date ne doit pas ouvrir une
      // fenêtre par-dessus (la règle de la fiche du CRM, reprise ici).
      const ouvrirIdee = evenement.target.closest('[data-ouvrir-pub]');
      if (
        ouvrirIdee &&
        !evenement.target.closest('a, button, input, select, textarea, label')
      ) {
        etat.ideeOuverte = ouvrirIdee.dataset.ouvrirPub;
        rendre();
        section.querySelector('.fenetre-fermer')?.focus();
        return;
      }

      const avancer = evenement.target.closest('[data-avancer]');
      if (avancer) {
        const pub = trouverPub(avancer.dataset.avancer);
        // Trois états au club depuis le 25 août 2026 : à préparer, à
        // programmer, publié.
        const suivant = STATUTS_FCH[STATUTS_FCH.indexOf(pub.statut) + 1];
        if (!suivant || estProvisoire(pub.id)) return;
        // Une rubrique qui revient ne se termine pas : la publier la repose
        // sur son prochain jour, à préparer (`passageDePublication`).
        const champsStatut = passageDePublication(pub, suivant);
        await modifierAussitot(
          pub,
          champsStatut,
          () => api.modifierPublication(pub.id, champsStatut),
          { rendre, echouer: dire },
        );
        return;
      }

      const deprogrammer = evenement.target.closest('[data-deprogrammer]');
      if (deprogrammer) {
        const pub = trouverPub(deprogrammer.dataset.deprogrammer);
        if (!pub || estProvisoire(pub.id)) return;
        // La date s'en va, la répétition avec : une idée sans jour n'a rien
        // qui revienne.
        const retour = { date_prevue: null, recurrence: null, recurrence_fin: null };
        await modifierAussitot(pub, retour, () => api.modifierPublication(pub.id, retour), {
          rendre,
          echouer: dire,
        });
        return;
      }

      const supprimerPub = evenement.target.closest('[data-supprimer-pub]');
      if (supprimerPub) {
        const pub = trouverPub(supprimerPub.dataset.supprimerPub);
        if (!pub || estProvisoire(pub.id)) return;
        // Depuis la fenêtre d'édition, le geste est écrit en toutes lettres
        // (« Supprimer l'idée ») : on referme d'abord, sinon la fenêtre
        // resterait ouverte sur une ligne qui n'existe plus.
        if (etat.ideeOuverte === pub.id) etat.ideeOuverte = null;
        await retirerAussitot(etat.publications, pub, () => api.supprimerPublication(pub.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      // Cocher un jalon fait deux choses : la barre avance, et la victoire
      // monte. Les deux se voient tout de suite ; la victoire provisoire part
      // si l'écriture échoue, sinon le mur garderait un accomplissement qui
      // n'a pas eu lieu.
      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) {
        const objectif = etat.objectifs.find((candidat) =>
          candidat.jalons?.some((j) => j.id === jalon.dataset.jalon),
        );
        const cible = objectif?.jalons.find((j) => j.id === jalon.dataset.jalon);
        if (!cible || estProvisoire(cible.id)) return;

        const avantJalon = { ...cible };
        const provisoire = victoireProvisoire(cible.titre);
        etat.victoires.unshift(provisoire);

        const atteint = await modifierAussitot(
          cible,
          { atteint: true, date_atteint: versDateISO() },
          async () => {
            const { jalon: fait, victoire } = await api.atteindreJalon(avantJalon, ESPACE);
            remplacerVictoire(provisoire, victoire);
            return fait;
          },
          {
            rendre: () => {
              rendre();
              ouvrirObjectif(objectif.id);
            },
            echouer: dire,
          },
        );
        if (!atteint) retirerVictoire(provisoire);
        return;
      }

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) {
        const objectif = etat.objectifs.find((o) => o.id === atteindre.dataset.atteindre);
        if (!objectif || estProvisoire(objectif.id)) return;
        if (!confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;

        const provisoire = victoireProvisoire(objectif.titre);
        etat.victoires.unshift(provisoire);

        const fait = await retirerAussitot(
          etat.objectifs,
          objectif,
          async () => {
            const { victoire } = await api.atteindreObjectif(objectif);
            remplacerVictoire(provisoire, victoire);
          },
          { rendre, echouer: dire },
        );
        if (!fait) retirerVictoire(provisoire);
        return;
      }

      const supprimerObjectif = evenement.target.closest('[data-supprimer-objectif]');
      if (supprimerObjectif) {
        const objectif = etat.objectifs.find(
          (o) => o.id === supprimerObjectif.dataset.supprimerObjectif,
        );
        if (!objectif) return;
        if (!confirm(`Supprimer « ${objectif.titre} » et ses jalons ? Les tâches liées sont conservées.`)) {
          return;
        }
        if (estProvisoire(objectif.id)) return;
        await retirerAussitot(etat.objectifs, objectif, () => api.supprimerObjectif(objectif.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      const victoire = evenement.target.closest('[data-victoire]');
      if (victoire) {
        const ligne = etat.victoires.find((v) => v.id === victoire.dataset.victoire);
        if (!ligne || estProvisoire(ligne.id)) return;
        await retirerAussitot(etat.victoires, ligne, () => api.supprimerVictoire(ligne.id), {
          rendre,
          echouer: dire,
        });
      }
    });

    section.addEventListener('change', async (evenement) => {
      // « J'anime la réunion » : la case écrit le rôle sur l'ÉVÉNEMENT — la
      // fiche entière bascule dans l'autre version au redessin.
      const ficheAnime = evenement.target.closest('[data-fiche-anime]');
      if (ficheAnime) {
        const coche = ficheAnime.checked;
        const fiche = etat.fiches.find((f) => f.id === etat.reunionOuverte);
        const reunion = etat.evenements.find((e) => e.id === fiche?.evenement_id);
        if (!reunion) return;
        await modifierAussitot(
          reunion,
          { reunion_animee: coche },
          () => api.modifierEvenement(reunion.id, { reunion_animee: coche }),
          { rendre, echouer: dire },
        );
        return;
      }

      const programmer = evenement.target.closest('[data-programmer]');
      if (programmer && programmer.value) {
        const pub = trouverPub(programmer.dataset.programmer);
        if (!pub || estProvisoire(pub.id)) return;
        const jour = programmer.value;
        await modifierAussitot(
          pub,
          { date_prevue: jour },
          () => api.modifierPublication(pub.id, { date_prevue: jour }),
          { rendre, echouer: dire },
        );
        return;
      }

      const echange = evenement.target.closest('[data-echange]');
      if (echange) {
        const partenaire = etat.partenaires.find((p) => p.id === echange.dataset.echange);
        if (!partenaire || estProvisoire(partenaire.id)) return;
        const jour = echange.value || null;
        // Sans redessin : la date est déjà dans le champ, sous les yeux. Le
        // retour en arrière, lui, doit se voir.
        await modifierAussitot(
          partenaire,
          { dernier_echange: jour },
          () => api.modifierContact(partenaire.id, { dernier_echange: jour }),
          { echouer: (message) => { rendrePartenaires(); dire(message); } },
        );
      }
    });
  },
};
