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
import { construireOrganigramme, rechercherOrganigramme, portrait } from './organigramme-fch.js';
import { monterLeMenu, boutonDuMenu } from './menu.js';
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
  COPIE,
  friseDeLaSemaine,
} from './gabarits.js';
import {
  STATUTS_FCH,
  construireAVenir,
  construireBanque,
  construirePubliees,
  formulaireIdee,
  rubriquesProposees,
} from './publications.js';
import {
  depuisDateISO,
  ajouterJours,
  echeanceLisible,
  momentLisible,
  echapper,
  versDateISO,
  RECURRENCES,
} from './format.js';
import { finDeLaSortie, phaseDeLaSortie } from './preparations-commun.js';
import { REPERES, CRENEAUX } from './club-fch.js';
import { GROUPES, PERSONNES } from './organigramme-fch-data.js';
import { MISSION_FCH, VALEURS_FCH, OBJECTIFS_FCH } from './projet-fch.js';
import { construireProjetClub, titreDuProjet, projetDeclare } from './projet-club.js';
import * as pageProjetDuClub from './projet-club-page.js';
import {
  construireEvenementsClub, estRubriqueEvenement, EVENEMENTS_CLUB, prochainEvenementClub,
  dateDeLEvenement, rubriqueEvenement, ficheDeLEvenement,
} from './evenements-club.js';
import {
  construireSuiviPartenaires, titreDuSuivi, porte, mots, parChantier,
} from './partenaires-suivi.js';
import { OFFRES_FCH, ETATS_PARTENAIRE, engagementsDeLOffre, offreDe } from './partenaires-fch.js';
import {
  trierTaches,
  construireLignesTaches,
  cocherDepuisTableauDeBord,
  separerLesSeries,
} from './taches.js';
import { construireCapGrave } from './objectifs-commun.js';

// LES ÉCRANS DU CAP, MONTÉS DANS LE SITE (16 septembre 2026, demande de Noé :
// « il faut d'ailleurs créer une page tâches dans le site FCH comme c'est fait
// sur yuno, et une page objectif, et projet, comme chez yuno »).
//
// CE SONT LES MODULES DU HUB, PAS DES COPIES — 4 400 lignes qu'on ne recopie
// pas, et surtout deux galeries de caps qui finiraient par ne plus montrer la
// même chose. Le site ne redessine RIEN : il pose sa barre, un hôte, son pied, et
// laisse le module écrire dedans. **La DA suit toute seule** : ces pages sont
// écrites en variables (`--fond-carte`, `--accent`, `--police-titre`), et
// `body[data-espace="hermitage"]` les a déjà remplacées par celles du club.
// C'est exactement ce que Yuno a fait la veille.
import pageDuCap from './objectifs.js';
import pageObjectif from './objectif.js';
import pageProjet from './projet.js';
import pageTaches from './taches.js';

import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  construireBarrePeriode,
  construireGrille,
  colonnesDeLaSemaine,
  fenetreDetail,
  fenetreJour,
  elementsDuJour,
  finDeLEvenement,
  passageDePublication,
  brancherEtatPublication,
  brancherSelection,
  brancherClavier,
  brancherDeplacement,
  brancherPriseEnMain,
  appliquerAuCalendrier,
  champsApresDeplacement,
  deplacerAncre,
  natureParDefaut,
  centrerActif,
  fenetreCreation,
  brancherCapture,
  poserAuCalendrier,
  fermerLesChoix,
  REUNION_OBJETS,
  FORMATS,
} from './calendrier-commun.js';

const ESPACE = 'fch';

// Ce qui, sur une tuile de partenaire, fait déjà quelque chose : les rôles
// natifs suffisent ici — la pastille d'état est un bouton, le nom un lien.
const GESTES_TUILE = 'a, button, input, select, textarea, label, [role="button"]';

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
// UNE SEULE SAISON POUR L'INSTANT. Le jour où la suivante arrive, c'est ici
// qu'elle se déclare — les lignes de cette année restent lisibles, et un
// partenaire peut revenir avec une autre offre sans écraser son historique.
const SAISON_PARTENAIRES = '2026-2027';

const VUES = ['accueil', 'creer', 'reunions', 'calendrier', 'partenaires', 'club',
  'saison', 'editorial', 'banque', 'publications', 'actions', 'archives',
  'commissions', 'projet-club', 'entrainements', 'chiffres', 'evenements',
  'cap', 'objectif', 'projet', 'taches'];

// LES QUATRE ÉCRANS QUE LE SITE EMPRUNTE AU HUB. Ils ne demandent RIEN au
// chargement du site : le module qu'ils montent fait ses propres lectures, et
// une liste ici en ferait deux.
const VUES_DU_CAP = ['cap', 'objectif', 'projet', 'taches'];

// L'espace du hub que le site filtre. `photo` chez Yuno, `fch` ici — et c'est la
// clé de la contrainte CHECK, pas le nom affiché.
const ESPACE_DU_HUB = ESPACE;

// Les natures que le calendrier du site assemble — ni relance ni commande,
// elles vivent chez Yuno. La liste sert aux filtres (pas de case sans effet)
// et à l'état initial des cases cochées.
const NATURES_FCH = ['evenement', 'tache', 'publication', 'objectif'];

// --- Fabrication du HTML ----------------------------------------------------

// LES RÉUNIONS SONT DU CLUB (16 septembre 2026, décision de Noé : « intègre
// réunions à club »). C'était une rubrique à elle, donc un onglet du dock ; mais
// ce que ses pages disent — qui décide quoi, ce qui a été décidé, ce qui reste à
// tenir — est de la même nature que l'organigramme et le projet : c'est la VIE
// du club, pas une cinquième destination. Le dock retombe à quatre onglets, et
// c'est l'accueil du site qui porte la réunion du moment, comme avant.
//
// SES DEUX SOUS-PAGES RESTENT DERRIÈRE ELLE, et ne montent pas dans le hall :
// le suivi des actions et les réunions passées se prennent depuis la page des
// réunions. C'est la règle des deux rangs — le hall est à deux gestes, les
// réunions à trois, leurs archives à quatre.
const PAGES_REUNIONS = [
  { nom: 'Le suivi des actions', adresse: '#hermitage/actions' },
  { nom: 'Les réunions passées', adresse: '#hermitage/archives' },
];

export const RUBRIQUES_FCH = [
  // LE CAP ENTRE DANS LE MENU (16 septembre 2026). Ses trois pages sont celles
  // du hub, montées dans le site : la galerie compare, `#hermitage/objectif/<id>`
  // et `#hermitage/projet/<id>` disent tout. **Elles n'ont pas d'entrée de menu**
  // — on y entre depuis la galerie ou depuis le cap gravé de l'accueil, et un
  // menu ne nomme pas une page dont l'adresse porte un identifiant.
  //
  // LES DEUX ÉTAGES SONT DEUX ENTRÉES, comme chez Yuno : deux liens qui
  // mèneraient tous deux à `#hermitage/cap` seraient deux liens identiques, et
  // trois liens identiques ne sont pas un menu.
  // « MES » ET NON « SES » (20 septembre 2026, règle de Noé : « c'est mes
  // objectifs, projets… à l'intérieur des objectifs du club »).
  //
  // CE QUI CHANGE N'EST PAS LA RÈGLE, C'EST QUI PARLE. Dans le menu du HUB, la
  // première personne « s'arrête aux espaces » — sous « FC Hermitage », « Ses
  // objectifs » désigne l'ESPACE et non Noé, parce que le hub regarde ses
  // quatre espaces de l'extérieur. **Ici on est DEDANS**, et le possessif n'a
  // plus le même antécédent : le club a ses objectifs à lui — la mission, les
  // axes, le projet du club, qui vivent sous « Le club » —, et ceux-ci sont
  // ceux que NOÉ se donne pour son alternance. Écrire « Ses » les donnait au
  // club, c'est-à-dire à l'autre liste.
  { nom: 'Accueil', adresse: '#hermitage', pages: [
    { nom: 'Le cap', adresse: '#hermitage/cap' },
    { nom: 'Mes objectifs', adresse: '#hermitage/cap/caps' },
    { nom: 'Mes projets', adresse: '#hermitage/cap/projets' },
    { nom: 'Mes tâches', adresse: '#hermitage/taches' },
    { nom: 'Le calendrier', adresse: '#hermitage/calendrier' },
  ] },
  { nom: 'Communication', adresse: '#hermitage/creer', pages: [
    { nom: 'La saison', adresse: '#hermitage/saison' },
    { nom: 'Le calendrier éditorial', adresse: '#hermitage/editorial' },
    { nom: 'La banque d’idées', adresse: '#hermitage/banque' },
    { nom: 'Les publications parues', adresse: '#hermitage/publications' },
  ] },
  // LE CLUB S'ARRÊTE AUX SIX PORTES DE SON HALL (20 septembre 2026, demande de
  // Noé : « pas 15 pages en dessous de club, et rien en dessous de
  // partenaires »). Les deux sous-pages des réunions — le suivi des actions,
  // les réunions passées — en sortent, et **elles ne perdent pas leur chemin,
  // elles retrouvent leur rang** : la règle écrite au-dessus de
  // `PAGES_REUNIONS` le disait déjà mot pour mot, *« le hall est à deux gestes,
  // les réunions à trois, leurs archives à quatre »*. Le menu, lui, les gardait
  // au même rang que les réunions.
  //
  // CE QUI RESTE EST EXACTEMENT LE HALL, porte pour porte : deux listes qui
  // disent ce qu'il y a derrière « Le club » ne peuvent pas en dire deux choses
  // différentes.
  { nom: 'Le club', adresse: '#hermitage/club', pages: [
    { nom: 'Les organigrammes', adresse: '#hermitage/commissions' },
    { nom: 'Le projet du club', adresse: '#hermitage/projet-club' },
    { nom: 'Les évènements', adresse: '#hermitage/evenements' },
    { nom: 'Les entraînements', adresse: '#hermitage/entrainements' },
    { nom: 'Le club en chiffres', adresse: '#hermitage/chiffres' },
    { nom: 'Les réunions', adresse: '#hermitage/reunions' },
  ] },
  // LES PARTENAIRES SONT UNE DESTINATION (16 septembre 2026, décision de Noé :
  // « ajoute un onglet pour les partenaires, qui remplace donc réunions »). Ils
  // étaient une page du Club ; ils prennent la place que les réunions viennent
  // de libérer dans le dock. La bascule se tient : le Club est ce que le club
  // EST — ses gens, son projet, ses créneaux, ses décisions ; les partenaires
  // sont un CHANTIER de Noé, avec ses engagements à tenir et son argent.
  //
  // ET LEURS TROIS PAGES ENTRENT DANS LE MENU (20 septembre 2026, même
  // demande). Elles existaient depuis le premier jour et n'étaient atteignables
  // QUE par le hall : une rubrique sans flèche, dans un menu où toutes les
  // autres en ont une, se lit comme une destination sans contenu — alors
  // qu'elle en a trois. Leurs noms sont ceux que `titreDuSuivi` écrit en tête de
  // page, au mot près : un nom dans le menu et un autre en tête de page, ce
  // serait deux noms pour une page.
  { nom: 'Partenaires', adresse: '#hermitage/partenaires', pages: [
    { nom: 'Tous les partenaires', adresse: '#hermitage/partenaires/liste' },
    { nom: 'Nos engagements', adresse: '#hermitage/partenaires/engagements' },
    { nom: 'Nos offres', adresse: '#hermitage/partenaires/offres' },
  ] },
];

// CE QUE LE MENU OFFRE N'EST PAS TOUT CE QUI EXISTE, et trois mécaniques
// lisaient pourtant `RUBRIQUES_FCH` comme si ça l'était : le grand titre du
// site, la pastille allumée du dock, et la rubrique que le menu déplie tout
// seul. En sortant les deux sous-pages des réunions du menu, elles auraient
// perdu les trois d'un coup — *`#hermitage/actions` se serait intitulée « FC
// Hermitage » et n'aurait allumé aucun onglet.*
//
// D'OÙ CETTE TABLE, qui est le RECENSEMENT des pages du site : celles que le
// menu nomme, plus celles qu'on n'atteint que par leur page mère. Le menu dit
// ce qu'on OFFRE ; celle-ci dit ce qui EXISTE, et les deux ne se confondent
// plus.
const PAGES_DU_SITE = [
  ...RUBRIQUES_FCH.flatMap((rubrique) =>
    (rubrique.pages ?? []).map((page) => ({ ...page, rubrique: rubrique.adresse }))),
  ...PAGES_REUNIONS.map((page) => ({ ...page, rubrique: '#hermitage/club' })),
];

const ONGLET_FCH = Object.fromEntries(PAGES_DU_SITE.map((page) =>
  [page.adresse.split('/')[1], page.rubrique.split('/')[1] ?? 'accueil']));

function portes(pages, nom = 'Pages') {
  return `<section class="bloc fch-portes" aria-label="${nom}">${pages.map((page) => `
    <a class="lien-externe" href="${page.adresse}">
      <span class="lien-externe-titre">${page.nom}</span>
      <span class="lien-externe-fleche" aria-hidden="true">→</span>
    </a>`).join('')}</section>`;
}

function cheminDuMenu() {
  const adresse = location.hash.split('/').slice(0, 2).join('/');
  const mere = PAGES_DU_SITE.find((page) => page.adresse === adresse)?.rubrique;
  const rubrique = RUBRIQUES_FCH.find((item) => item.adresse === (mere ?? adresse));
  return rubrique ? [rubrique.nom] : [];
}

// LES ÉTAGES DE LA GALERIE. Le site ne montre qu'une page (`#hermitage/cap`) là
// où le hub en a trois vues, et l'étage vit au troisième segment
// (`#hermitage/cap/projets`) : c'est donc la BARRE qui doit le nommer, sans quoi
// deux entrées de menu différentes ouvriraient un écran au même titre — le
// défaut des « trois noms pour une page » corrigé le 28 août. Les mots sont ceux
// du menu, à la lettre : un nom dans le menu et un autre en tête de page, ce
// serait deux noms pour une page.
// LES MÊMES MOTS QUE LE MENU, et ce n'est pas une coquetterie : un nom dans le
// menu et un autre en tête de page, ce sont deux noms pour une page — le défaut
// corrigé sur « Général » le 28 août. « Mes périodes » suit ses deux voisines
// bien qu'elle n'ait pas d'entrée de menu : un « Ses » resté seul entre deux
// « Mes » se lirait comme une faute de frappe.
const ETAGES_DU_CAP = { caps: 'Mes objectifs', projets: 'Mes projets', periodes: 'Mes périodes' };

// LES DEUX PAGES QUI N'ONT PAS D'ENTRÉE DE MENU. Leur adresse porte un
// identifiant, donc le menu ne peut pas les nommer — et la barre doit tout de
// même dire où l'on est. Le mot est GÉNÉRIQUE, et c'est voulu : le `h1` du
// module, juste en dessous, porte le nom du cap ou du projet, **et lui n'est pas
// masqué** (à la différence de la galerie et des tâches, dont le `h1` ne serait
// que le nom de la page). Un nom précis dans la barre le redirait quarante
// pixels plus haut.
const TITRES_DU_CAP = { objectif: 'Un objectif', projet: 'Un projet' };

function enTete(vueActive, selection = null) {
  const liens = [
    ['accueil', 'Accueil', '#hermitage'],
    // L'ONGLET DIT « Com’ », LA PAGE DIT « Communication » (16 septembre 2026,
    // décision de Noé). Ce n'est pas un second nom mais une abréviation, et
    // c'est ce qui sauve la règle des largeurs égales : à cinq onglets sur un
    // écran de 375 px, chacun reçoit 67 px et « Communication » en demandait
    // 72 — *mesuré* : le mot débordait de son onglet sur « Partenaires ».
    ['creer', 'Com’', '#hermitage/creer', 'Communication'],
    ['partenaires', 'Partenaires', '#hermitage/partenaires'],
    ['club', 'Club', '#hermitage/club'],
    ['calendrier', 'Calendrier', '#hermitage/calendrier'],
  ];
  const icones = {
    creer: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14z"/>',
    partenaires: '<path d="m3 12 5-5 4 2 4-2 5 5-8 8-4-2zM8 7l-3-2-4 6 3 3M16 7l3-2 4 6-3 3"/>',
    club: '<path d="M4 21V7l8-4 8 4v14H4zM9 21v-6h6v6M8 9h1m6 0h1M8 12h1m6 0h1"/>',
    calendrier: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M8 15h3v3H8z"/>',
  };
  const titre = (vueActive === 'projet-club' ? titreDuProjet(selection) : null)
    ?? (vueActive === 'partenaires' ? titreDuSuivi(selection?.liste ?? [], selection?.vue) : null)
    ?? (vueActive === 'cap' ? ETAGES_DU_CAP[selection] : null)
    ?? TITRES_DU_CAP[vueActive]
    ?? PAGES_DU_SITE.find((page) => page.adresse === `#hermitage/${vueActive}`)?.nom
    ?? liens.find(([vue]) => vue === vueActive)?.[3]
    ?? liens.find(([vue]) => vue === vueActive)?.[1] ?? 'FC Hermitage';
  const onglet = liens.some(([vue]) => vue === vueActive) ? vueActive : ONGLET_FCH[vueActive];
  return `
    <div class="fch-nav">
      ${boutonDuMenu('menu-fch')}
      <h1 class="fch-titre-page"><span>${titre}</span></h1>
    </div>
    <nav class="fch-dock" aria-label="Le site FC Hermitage">
      ${liens.map(([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === onglet ? 'actif' : ''}"
          ${vue === onglet ? 'aria-current="page"' : ''}>
          ${vue === 'accueil' ? '<span class="fch-logo-onglet" aria-hidden="true"></span>' :
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icones[vue]}</svg>`}
          <span>${libelle}</span>
        </a>`).join('')}
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

// --- LA CHAÎNE DES RÉUNIONS (20 septembre 2026, demande de Noé) --------------
//
// « Dans le compte rendu, lorsque je mets une date de prochaine réunion, il
// faut que ça crée l'évènement à cette date avec le même nom que la dernière
// réunion + le numéro — pour la réunion Lina du 18 septembre, j'ai mis que la
// prochaine serait le 25, donc au 25 un évènement "Réunion Lina 2" doit être
// créé, et donc être lié à la réunion du 18 pour que ma préparation soit aidée
// par le compte-rendu de la dernière réunion. »
//
// LE NUMÉRO VIENT DE LA CHAÎNE, JAMAIS DU TITRE, et c'est ce qui rend la règle
// sûre. Lire le nombre écrit à la fin d'un nom pour l'incrémenter marche sur
// « Réunion Lina 2 » et se trompe sur « Réunion CA 2026 », qui deviendrait
// « Réunion CA 2027 » — une année prise pour un rang, et personne ne le verrait
// avant d'ouvrir le calendrier. On remonte donc les maillons : le titre de la
// RACINE porte le nom, la LONGUEUR porte le rang, et aucun texte n'est
// interprété.
//
// *Conséquence assumée : renommer une suite à la main ne renomme pas celles qui
// viendront après elle — elles repartent du nom de la racine. C'est le prix de
// ne rien deviner, et il se corrige d'un titre.*
export function chaineDeLaReunion(evenements, reunion) {
  const chaine = [reunion];
  const vus = new Set([reunion.id]);
  let courant = reunion;

  // LA BORNE N'EST PAS DE LA PRUDENCE DÉCORATIVE : le CHECK de la base
  // n'interdit que le cycle à UN maillon (`suite_de_id <> id`) — un CHECK ne
  // sait pas voir plus loin. Deux réunions qui se pointeraient l'une l'autre
  // feraient tourner cette boucle pour toujours, et l'écran serait blanc.
  while (courant.suite_de_id && !vus.has(courant.suite_de_id)) {
    const mere = evenements.find((e) => e.id === courant.suite_de_id);
    if (!mere) break;
    chaine.unshift(mere);
    vus.add(mere.id);
    courant = mere;
  }

  return chaine;
}

// Le nom de la suite : celui de la racine, et son rang. La racine seule donne
// donc « Réunion Lina 2 », et « Réunion Lina 2 » donne « Réunion Lina 3 ».
export function titreDeLaSuite(evenements, reunion) {
  const chaine = chaineDeLaReunion(evenements, reunion);
  return `${chaine[0].titre} ${chaine.length + 1}`;
}

// La suite DÉJÀ POSÉE, s'il y en a une. C'est elle qui rend le geste rejouable :
// réenregistrer un compte-rendu ne pose pas une seconde réunion, il déplace
// celle qui existe. Même motif que l'index unique `(evenement_id, origine)` qui
// rend le rattrapage des tâches inoffensif à chaque ouverture.
export function suiteDeLaReunion(evenements, reunionId) {
  return evenements.find((e) => e.suite_de_id === reunionId) ?? null;
}

// LE COMPTE-RENDU DE LA PRÉCÉDENTE — l'autre moitié de la demande : « pour que
// ma préparation soit aidée par le compte-rendu de la dernière réunion ». On
// remonte d'un maillon et l'on prend sa fiche, si elle en a une.
//
// PAR LA CHAÎNE ET NON PAR L'OBJET DE RÉUNION, à la différence de
// `dernierRegardAnimation` juste en dessous : celui-ci cherche « une réunion du
// même objet », ce qui est un rapprochement flou — il rend n'importe quelle
// réunion « communication », fût-elle d'un autre cycle. Ici le lien est EXPLICITE,
// posé au moment où Noé a daté la suite. *Les deux coexistent parce qu'ils ne
// répondent pas à la même question : l'un cherche un regard sur l'animation, où
// qu'il soit ; l'autre cherche LA réunion d'avant.*
export function precedenteDeLaReunion(evenements, fiches, reunion) {
  if (!reunion?.suite_de_id) return null;
  const mere = evenements.find((e) => e.id === reunion.suite_de_id);
  if (!mere) return null;
  return { evenement: mere, fiche: ficheDeLaReunion(fiches, mere.id) };
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
// D'OÙ ELLE VIENT, ET SI ELLE EST FAITE (20 septembre 2026, demande de Noé :
// « pour le suivi des actions, je dois savoir de quelle réunion elles
// proviennent et pouvoir noter si elle a été faite »).
//
// LES DEUX EXISTAIENT DÉJÀ EN BASE et manquaient à l'ÉCRAN — `actions_club`
// porte `fiche_id` et `statut` depuis le premier jour :
//
//   — LA RÉUNION D'ORIGINE ne s'écrivait nulle part. Sur le tableau permanent,
//     qui mélange les réunions, « Créer le compte LinkedIn FCH » ne disait pas
//     d'où il sortait — et c'est la première question qu'on se pose devant un
//     engagement qu'on ne se rappelle plus avoir pris. **Elle est un LIEN** :
//     savoir d'où vient une action et pouvoir y retourner sont la même envie.
//
//   — NOTER QU'ELLE EST FAITE se faisait déjà, en pressant l'étiquette de
//     statut — mais **une étiquette ne se présente pas comme un geste**. Elle
//     a la forme d'un libellé, et Noé ne l'a pas trouvée. Le hub a pourtant
//     UN signe pour « c'est fait », qu'il emploie partout : **le rond d'une
//     tâche**. C'est celui-là, au trait près (`.tache-cercle`), comme les
//     feuilles de préparation l'ont repris avant.
//
// LES DEUX GESTES COEXISTENT, et ce n'est pas un doublon : le ROND fait
// l'aller-retour « fait / pas fait », qui est le geste quotidien ; l'ÉTIQUETTE
// garde son cycle à trois crans, seul chemin vers « en cours ». C'est déjà la
// grammaire d'une publication au calendrier — le rond avance d'un cran, la
// pastille ouvre le choix complet.
//
// `fiches` EST FACULTATIF, et c'est ce qui décide de l'affichage du nom : sur
// la fiche d'une réunion, ses PROPRES actions n'ont pas à répéter son titre
// trois fois. Les deux autres listes — le tableau permanent et « Ouvrir par le
// suivi » — mélangent les réunions et le passent.
//
// ATTENTION AUX APPELS : `.map(ligneAction)` passerait l'INDEX en second
// argument, donc un nombre là où l'on attend des fiches. Les trois appels
// écrivent leur lambda.
function ligneAction(action, fiches = null) {
  const fiche = fiches?.find((candidate) => candidate.id === action.fiche_id) ?? null;
  const faite = action.statut === 'fait';

  return `
    <li>
      <span class="tuile-entete">
        <button type="button" class="etiquette action-statut"
          data-action-statut="${echapper(action.id)}"
          title="Changer le statut"
          aria-label="Statut : ${STATUTS_ACTION[action.statut]} — changer">${
            STATUTS_ACTION[action.statut]
          }</button>
        ${
          fiche
            ? `<a class="discret action-reunion" href="#hermitage/reunions/${echapper(fiche.id)}"
                 title="Ouvrir la fiche de cette réunion">${echapper(fiche.titre)}</a>`
            : ''
        }
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
      <span class="action-corps">
        <button type="button" class="tache-cercle" data-cocher-action="${echapper(action.id)}"
          aria-pressed="${faite}"
          aria-label="${faite ? 'Rouvrir' : 'Marquer faite'} « ${echapper(action.texte)} »"></button>
        <span class="${faite ? 'action-faite' : ''}">${echapper(action.texte)}${
          action.tache_id ? ` <span class="discret">· aussi une tâche</span>` : ''
        }</span>
      </span>
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
    <section class="bloc fch-tuile">
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
    <section class="bloc fch-tuile">
      <h2>Le contrat</h2>
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
function blocOrdreDuJour(fiche, pointEnEdition = null) {
  const total = fiche.points.reduce((somme, point) => somme + (point.minutes ?? 0), 0);
  const enEdition = fiche.points.find((point) => point.id === pointEnEdition) ?? null;

  const lignes = fiche.points
    .map(
      // LA TUILE D'UN POINT, REVUE (20 septembre 2026, demande de Noé, capture
      // à l'appui) : « le nom doit être davantage mis en avant, le temps estimé
      // plus petit, la sortie attendue en dessous du titre (pas de texte
      // "sortie attendue", juste la sortie elle-même), pas de bouton traité et
      // reporté, moins d'espace entre le nom et la pastille "décider" ».
      //
      // LE NOM EST LE SUJET, TOUT LE RESTE EST DU SERVICE — c'est la règle de
      // la tuile d'un livre, et celle qu'on vient d'appliquer à la ligne d'une
      // action du suivi.
      //
      // « SORTIE ATTENDUE : » DISPARAÎT, PAS LA SORTIE. Le libellé expliquait
      // un champ dont le contenu se comprend seul — *« ce qui se montre n'a pas
      // à se nommer »*, la règle qui vient de faire tomber quatre phrases
      // d'aide de cette page. Elle se lit sous le titre, en encre discrète.
      (point) => `
    <li class="odj-point" data-modifier-point="${echapper(point.id)}">
      <span class="tuile-entete">
        ${
          point.type_point
            ? `<span class="etiquette">${TYPES_POINT[point.type_point] ?? ''}</span>`
            : ''
        }
        <button type="button" class="lien-discret bouton-mini bouton-retirer odj-croix"
          data-retirer-point="${echapper(point.id)}"
          title="Retirer" aria-label="Retirer « ${echapper(point.titre)} »">×</button>
      </span>
      <button type="button" class="odj-nom" data-modifier-point="${echapper(point.id)}"
        >${echapper(point.titre)}</button>
      ${
        // LE TEMPS SUIT LE TITRE, SUR SA LIGNE (20 septembre 2026, demande de
        // Noé : « le temps doit être sur la même ligne que le titre, en jaune
        // et italique »). Il vivait dans l'en-tête, à côté de la pastille de
        // type ; il dit maintenant ce que CE point coûte, juste après ce qu'il
        // est. *Le `<li>` enroule, donc il se pose à la suite du nom et la
        // sortie passe seule à la ligne — il n'y a pas de conteneur à ajouter.*
        point.minutes
          ? `<span class="odj-duree"><span class="chiffre">${point.minutes}</span> min</span>`
          : ''
      }
      ${point.sortie ? `<span class="discret odj-sortie">${echapper(point.sortie)}</span>` : ''}
    </li>`,
    )
    .join('');

  return `
    <section class="bloc fch-tuile">
      <h2>L'ordre du jour</h2>
      ${
        // LE TOTAL RESTE, L'AIDE PART (20 septembre 2026, demande de Noé). Il
        // vivait À LA FIN de la phrase de conseil — « chaque point commence par
        // un verbe… X min prévues » —, et la retirer l'aurait emporté avec
        // elle. Ce n'est pas du conseil : c'est ce que la réunion pèse.
        total ? `<p class="discret"><span class="chiffre">${total}</span> min prévues.</p>` : ''
      }
      ${
        // ET L'ÉCRAN VIDE AVEC : « le premier point donne le ton » était un
        // exemple, pas une porte. Le bouton « Ajouter un point » juste en
        // dessous EST la porte, et *« un espace vide ouvre une porte, il ne
        // s'excuse pas »* — il n'a pas besoin qu'on lui explique ce qu'on
        // écrira dedans.
        fiche.points.length ? `<ul class="liste-reunions">${lignes}</ul>` : ''
      }
      ${
        fiche.points.length > 3
          ? `<p class="discret">Plus de trois sujets : le guide conseille d'en garder trois —
               lesquels peuvent attendre ?</p>`
          : ''
      }
      ${
        // ON MODIFIE EN CLIQUANT SUR LA TUILE (20 septembre 2026, demande de
        // Noé), et c'est LE MÊME FORMULAIRE qui sert : un second, posé à côté,
        // finirait par ne plus demander les mêmes champs. Il change de mots et
        // reçoit l'identifiant du point ; l'écriture décide ensuite si elle
        // pose ou si elle corrige. C'est la mécanique de la tuile de capture du
        // hub — « la tuile ne sait pas si elle crée ou si elle corrige, c'est
        // l'envoi qui le sait ».
        //
        // IL RESTE VOLANT, ET C'EST TOUTE LA DEMANDE (correction de Noé :
        // « en appuyant ça doit rouvrir la tuile volante de la création afin
        // de pouvoir modifier »).
        //
        // `ouvert: true` AURAIT FAIT L'INVERSE : dans `construireFormulaire`,
        // `volant = !ouvert` — cette option sert aux formulaires qui vivent
        // DÉJÀ dans une fenêtre, et « une tuile par-dessus une fenêtre serait
        // une fenêtre de trop ». Le passer à vrai dépliait donc le formulaire
        // dans le flux, sous la liste. *Mesuré : c'est ce qui se produisait.*
        //
        // On le laisse volant et **c'est le geste qui l'ouvre**, juste après
        // le rendu — voir `data-modifier-point` dans le gestionnaire de clic.
        construireFormulaire({
          id: 'fiche-point',
          libelle: enEdition ? 'Modifier le point' : 'Ajouter un point',
          action: 'ajouter-point-reunion',
          bouton: enEdition ? 'Enregistrer' : 'Ajouter',
          extra: `<input type="hidden" name="fiche_id" value="${echapper(fiche.id)}">${
            enEdition ? `<input type="hidden" name="point_id" value="${echapper(enEdition.id)}">` : ''
          }`,
          champs: [
            {
              nom: 'titre',
              libelle: 'Le point — un verbe d\'action : décider, valider, répartir…',
              type: 'text',
              requis: true,
              valeur: enEdition?.titre ?? '',
            },
            {
              nom: 'type_point',
              libelle: 'Pour quoi faire',
              type: 'choix',
              options: { '': '—', ...TYPES_POINT },
              valeur: enEdition?.type_point ?? '',
            },
            {
              nom: 'minutes',
              libelle: 'Temps prévu (minutes)',
              type: 'number',
              valeur: enEdition?.minutes ?? '',
            },
            {
              nom: 'sortie',
              libelle: 'La sortie attendue — un résultat, pas un thème',
              type: 'text',
              valeur: enEdition?.sortie ?? '',
            },
          ],
        })
      }
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
function blocSuivi(actionsOuvertes, fiches) {
  if (!actionsOuvertes.length) return '';

  return `
    <div class="reunion-suivi">
      <p class="discret">Ce qui était prévu aux réunions d'avant — fait, en cours, bloqué ?</p>
      <ul class="liste-reunions">${actionsOuvertes
        .map((action) => ligneAction(action, fiches))
        .join('')}</ul>
    </div>`;
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
          // « COPIER LE TITRE » DEVIENT UNE ICÔNE (20 septembre 2026, demande de
          // Noé) : trois mots pour un geste qu'un dessin dit mieux, au bout
          // d'une phrase déjà longue. Le mot part dans `title` et dans le nom
          // accessible — c'est la parade du hub, celle de la ligne d'une
          // habitude et des cartes du dimanche.
          : `<p class="discret">Copier la dernière garde les couleurs du club. Renomme la
               copie « ${echapper(titreDrive(fiche))} »
               <button type="button" class="lien-discret bouton-mini bouton-copie"
                 data-copier-titre="${echapper(titreDrive(fiche))}"
                 title="Copier le titre" aria-label="Copier le titre">${COPIE}</button></p>`
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

      <h3 class="reunion-sous-titre">Les actions décidées</h3>
      ${
        actionsDeLaFiche.length
          ? `<ul class="liste-reunions">${actionsDeLaFiche.map((a) => ligneAction(a)).join('')}</ul>`
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

// --- DEUX BLOCS CÔTE À CÔTE, ET QUI SE REPLIENT (20 septembre 2026) ---------
//
// Demande de Noé : « pour la préparation, sur ordinateur il doit y avoir des
// blocs côte à côte plutôt que tout ligne par ligne. Le récap de la dernière
// réunion et les tâches du suivi doivent être en haut côte à côte et
// facilement masquables. Le contrat et l'ordre du jour côte à côte, le reste
// on est bon. »
//
// CE QUE ÇA RANGE : la fiche était une colonne de sept blocs, donc un écran et
// demi de défilement avant d'atteindre le contrat — alors qu'un ordinateur a
// de la largeur à ne plus savoir qu'en faire. Les deux blocs du haut sont de la
// RELECTURE (ce qui s'est dit, ce qui reste à tenir), les deux suivants du
// TRAVAIL (ce qu'on se donne, comment on le mène) : les apparier deux à deux,
// c'est mettre ensemble ce qui se lit ensemble.
//
// UN DUO NE SE FORME QU'À DEUX. Un seul bloc présent reste pleine largeur — une
// carte solitaire dans une grille à deux colonnes laisserait une demi-page
// vide, et c'est exactement ce que `auto-fit` fabrique quand on le laisse
// faire. La réunion à laquelle on N'ASSISTE PAS n'a pas d'ordre du jour, et une
// première réunion n'a pas de précédente : les deux cas arrivent.
const duo = (a, b) => {
  const parts = [a, b].filter((part) => part && part.trim());
  if (!parts.length) return '';
  return parts.length === 2 ? `<div class="reunion-duo">${parts.join('')}</div>` : parts[0];
};

// CE QUI VIENT D'AVANT : UNE SEULE GRANDE TUILE, UN SEUL PLI (20 septembre
// 2026, correction de Noé : *« les 2 blocs "ce que disait la précédente" et
// "ouvrir par le suivi" doivent être une grande tuile, et je dois pouvoir les
// masquer ensemble, pas l'un puis l'autre — les 2 en même temps »*).
//
// *Ce que ça renverse, et il a raison : ils ont eu un pli CHACUN pendant une
// heure, au motif qu'ils ne servent pas au même moment — le récap se lit avant,
// le suivi se coche pendant. Mais ce ne sont pas deux blocs qu'on range l'un
// après l'autre : c'est UNE chose, ce qui vient de la réunion d'avant, et on la
// range d'un geste pour atteindre le travail.*
//
// LE PLI EST UN `<details>` NATIF, et son état VIT DANS L'ÉTAT DE LA PAGE.
// C'est la différence avec le relevé d'une journée, où le hub s'en passe :
// là-bas « la tuile se redessine à l'ouverture d'un jour, pas pendant qu'on la
// lit ». Ici, **on coche une action DANS le bloc du suivi**, et cocher
// redessine la fiche entière — un `<details>` rouvert à chaque coche serait
// insupportable au moment précis où l'on s'en sert.
//
// OUVERT PAR DÉFAUT, parce que le guide du club demande qu'une réunion
// « s'ouvre par le suivi du précédent », et parce qu'un bloc qu'on ne voit pas
// ne se replie pas.
//
// LE TITRE DE LA TUILE EST LE SEUL (correction de Noé, le même jour : « enlève
// les titres "ce que disait la précédente" et "ouvrir par le suivi" »). Les
// deux colonnes en ont porté un pendant une heure ; **ce qui se montre n'a pas
// à se nommer** — c'est la règle qui a fait tomber quatre titres de la tuile
// d'une journée, le 1er septembre. Chaque colonne se dit déjà toute seule : à
// gauche le NOM de la réunion d'avant, en lien et en tête ; à droite la phrase
// qui demande « fait, en cours, bloqué ? ». Deux titres de plus auraient coûté
// deux lignes pour redire ce qui se voit.
function blocDAvant(recap, suivi, plis) {
  const parts = [recap, suivi].filter((part) => part && part.trim());
  if (!parts.length) return '';

  return `
    <details class="bloc fch-tuile reunion-pli" data-pli="avant"${plis?.avant ? '' : ' open'}>
      <summary class="reunion-pli-tete"><h2>Ce qui vient d'avant</h2></summary>
      ${parts.length === 2 ? `<div class="reunion-duo">${parts.join('')}</div>` : parts[0]}
    </details>`;
}

// CE QUE DISAIT LA PRÉCÉDENTE — la seconde moitié de la demande du
// 20 septembre 2026 : « être lié à la réunion du 18 pour que ma préparation
// soit aidée par le compte-rendu de la dernière réunion ».
//
// C'EST LE GUIDE « RÉUNIONS EFFICACES » QUI LE DEMANDAIT DÉJÀ — « chaque
// réunion s'ouvre par le suivi du précédent » (migration du 21 août 2026) —, et
// il n'y avait rien pour le faire : le tableau des actions suivait bien les
// engagements, mais les POINTS EN ATTENTE et les DÉCISIONS restaient enfermés
// dans la fiche d'avant, qu'il fallait aller rouvrir.
//
// LES POINTS EN ATTENTE D'ABORD : ce sont eux qui appellent une suite —
// « reportés, arbitrages à venir ». Les décisions viennent après, comme rappel
// de ce qui est tranché et n'a pas à être rouvert.
//
// IL NE S'AFFICHE QUE S'IL A QUELQUE CHOSE À DIRE : une réunion précédente sans
// compte-rendu ne laisse qu'un lien vers elle, et une chaîne qui commence n'a
// pas de précédente du tout. *Un bloc vide sous un titre est pire que pas de
// bloc : il se lit comme une panne.*
// LE TEXTE GARDE SES RETOURS À LA LIGNE, LE LIBELLÉ NON, et il a fallu le
// séparer pour de bon : `white-space: pre-wrap` préserve TOUT l'espace du
// gabarit — l'indentation comprise. *Mesuré à l'écran : un libellé écrit sur
// deux lignes de source s'affichait « RESTÉ » puis « EN ATTENTE » décalé de
// quinze espaces.* Le libellé vit donc hors du `pre-wrap`, et le texte dedans.
const part = (quoi, texte) =>
  texte
    ? `<p class="reunion-precedente-part"><span class="reunion-precedente-quoi">${echapper(
        quoi,
      )}</span><span class="reunion-precedente-texte">${echapper(texte)}</span></p>`
    : '';

function rappelDeLaPrecedente(etat, evenement) {
  const avant = precedenteDeLaReunion(etat.evenements, etat.fiches, evenement);
  if (!avant?.fiche) return '';

  const { evenement: mere, fiche } = avant;
  if (!fiche.cr_decisions && !fiche.cr_en_attente) return '';

  const quand = mere.date_debut
    ? echeanceLisible(new Date(mere.date_debut))
    : '';

  return `
    <div>
      <p class="reunion-precedente-titre">
        <a href="#hermitage/reunions/${echapper(fiche.id)}">${echapper(fiche.titre)}</a>
        ${quand ? `<span class="discret"> · ${echapper(quand)}</span>` : ''}
      </p>
      ${part('Resté en attente', fiche.cr_en_attente)}
      ${part('Ce qui avait été décidé', fiche.cr_decisions)}
    </div>`;
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
    ${
      // EN HAUT, CÔTE À CÔTE, ET MASQUABLES (demande de Noé, 20 septembre
      // 2026) : les deux blocs de RELECTURE. Le suivi vivait en cinquième
      // position, sous la présentation — donc après tout le travail de
      // préparation, alors que le guide du club demande qu'une réunion
      // « s'ouvre par le suivi du précédent ».
      blocDAvant(rappelDeLaPrecedente(etat, evenement), blocSuivi(suivi, etat.fiches), etat.plis)
    }
    ${
      // PUIS LES DEUX BLOCS DE TRAVAIL : ce qu'on se donne, et comment on le
      // mène. L'ordre du jour et la présentation appartiennent à qui TIENT la
      // réunion (précision de Noé, 24 août 2026) : quand il y assiste, ce ne
      // sont pas ses décisions — la fiche ne les lui demande pas, et le duo se
      // défait alors tout seul.
      duo(blocContrat(fiche, animee), animee ? blocOrdreDuJour(fiche, etat.pointEnEdition) : '')
    }
    ${animee ? blocPresentation(fiche) : ''}
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

  const vue = etat.vue;
  // LES TROIS VUES REFUSENT LA SURFACE (20 septembre 2026, défaut rapporté par
  // Noé : « il ne faut pas que ce soit une double tuile ça »).
  //
  // C'est le cas que `fch-sans-tuile` a été écrit pour, le 16 septembre, sur la
  // galerie des partenaires : ces sections ne portent QU'UNE LISTE DE TUILES,
  // et `habillerLesSections` posait dessous une seconde surface — une réunion
  // se lisait comme une tuile dans une tuile. Le titre, lui, s'habille quand
  // même : il reste le nom de la section.
  //
  // ET LA LIGNE Y GAGNE 32 px DE LARGE, ce qui n'est pas un effet de bord : une
  // tuile dans une tuile est rentrée de son rembourrage, et c'est cette largeur
  // perdue qui faisait sortir la date de son cadre. *Mesuré : 277 px de contenu
  // pour 295 demandés avant, 309 pour 309 après.*
  const contenu = vue === 'actions' ? `    <section class="bloc fch-sans-tuile">
      <h2>Le tableau des actions</h2>
      <p class="discret">Ce qui a été décidé, qui s'en charge, pour quand — le suivi
        rend les engagements visibles, il n'est pas là pour culpabiliser.</p>
      ${
        ouvertes.length
          ? `<ul class="liste-reunions">${ouvertes
              .map((action) => ligneAction(action, etat.fiches))
              .join('')}</ul>`
          : `<p class="vide">Les actions décidées en réunion s'inscriront ici.</p>`
      }
    </section>`
    : vue === 'archives' ? `<section class="bloc fch-sans-tuile"><h2>Les réunions passées</h2>
      ${passees.length ? `<ul class="liste-reunions">${passees.map((e) => ligneReunion(e, etat.fiches)).join('')}</ul>`
        : '<p class="vide">Les réunions terminées se retrouveront ici.</p>'}</section>`
    : `    <section class="bloc fch-sans-tuile">
      <h2>À préparer</h2>
      ${
        aVenir.length
          ? `<ul class="liste-reunions">${aVenir.map((e) => ligneReunion(e, etat.fiches)).join('')}</ul>`
          : `<p class="vide">Ta prochaine réunion se note au calendrier : le « + »,
              nature Événement, pastille Réunion.</p>`
      }
    </section>${portes(PAGES_REUNIONS)}`;
  return `${enTete(vue)}${contenu}
    <a class="lien-discret" href="${vue === 'reunions' ? '#hermitage/club">← Le club' : '#hermitage/reunions">← Les réunions'}</a>${pied()}`;
}

// --- L'ACCUEIL DU SITE : une carte chaude, un bloc, trois portes, le cap -----
//
// REFONDU LE 16 SEPTEMBRE 2026 (demande de Noé : « pour l'accueil du FCH, il
// faut réorganiser les infos qui doivent y être et la forme ; pour cela il faut
// s'appuyer sur ce qu'on a fait sur le hub et yuno »).
//
// LE DÉFAUT, MESURÉ AVANT DE TOUCHER À QUOI QUE CE SOIT. La page faisait
// 2 018 px et empilait CINQ blocs fixes : le temps fort (179 px), « À faire »
// (644 px — un tiers de la page), la com' à venir (376), le cap (358), les
// victoires (186). Deux d'entre eux sont du BILAN sur un écran dont la spec dit
// qu'il est l'ATELIER, et le cap s'ouvrait sur TROIS RANGÉES DE POINTS VIDES —
// ses trois objectifs portent huit jalons dont aucun n'est atteint.
//
// Et surtout : pendant ce temps, l'accueil ne disait RIEN de ce que le site
// charge déjà à l'ouverture — 65 engagements partenaires sur 69 restaient à
// tenir, 7 partenaires sur 20 n'avaient pas viré, et les 54 parutions posées
// étaient TOUTES encore « à préparer », zéro en « à programmer ». La chaîne
// éditoriale était bouchée à son premier cran et la page n'en savait rien.
//
// C'EST LE MÊME DÉFAUT QUE YUNO AVAIT LE 15 SEPTEMBRE, et la réponse est la
// sienne : une page ne change pas de FORME, elle change de CONTENU.
//
//   > L'accueil n'a qu'UN bloc fixe — le travail à faire. Le reste est un
//   > CLASSEMENT : une carte chaude tirée d'une cascade, trois portes tirées
//   > d'une réserve, et le cap en pied.
//
// CE QUE LE FCH NE COPIE PAS DE YUNO, et c'est une décision de Noé :
// « À faire » RESTE un bloc fixe et cochable, là où Yuno en a fait une porte.
// C'est juste — le site est l'atelier du club, et cocher une tâche en sortant du
// stade est le geste pour lequel on l'ouvre. Il se plafonne à TROIS lignes au
// lieu de sept, le reste se dépliant : rien n'est caché, c'est la place qui
// change de propriétaire.
//
// LES VICTOIRES ONT QUITTÉ CET ÉCRAN. Elles étaient du bilan sur l'atelier, et
// elles ont déjà DEUX pages qui les portent : `#fch`, la page bilan du hub, et
// « Le chemin », faite pour les regarder. C'est la division que la spec pose
// elle-même — « le site répond à qu'est-ce que je fais maintenant, la page du
// hub à où j'en suis » —, et Yuno n'en montre pas davantage à son accueil.

// --- LA CARTE CHAUDE ---------------------------------------------------------

// Le dessin était écrit DEUX FOIS, mot pour mot, dans la réunion du moment et
// dans le temps fort. Il sert cinq rangs maintenant : il n'a plus le droit de
// vivre en double.
function carteChaude({ etiquette, etiquettes = '', quand = '', titre, corps = '', pied: bas = '' }) {
  return `
    <section class="bloc fch-tuile fch-accueil-moment">
      <span class="tuile-entete">
        <span class="etiquette">${echapper(etiquette)}</span>
        ${etiquettes}
        ${quand ? `<span class="discret quand">${echapper(quand)}</span>` : ''}
      </span>
      <h2 class="tf-titre">${echapper(titre)}</h2>
      ${corps}
      ${bas}
    </section>`;
}

// LA PORTE D'UNE CARTE CHAUDE EST UNE TUILE (16 septembre 2026, demande de Noé
// en deux temps : « un bouton de couleur pour la tuile dynamique du haut », puis
// « non, un bouton sous forme de tuile dans le même style que ce qu'on fait chez
// Yuno »).
//
// CE QUE ÇA REMPLACE : un `lien-externe` pleine largeur, avec son filet, son
// titre et sa ligne de service — trois lignes et 70 px pour un seul geste, *soit
// autant que la carte qu'il ferme.* Or la carte chaude est la SEULE interruption
// de l'accueil : ce qu'elle propose doit se prendre d'un doigt, pas se lire.
//
// C'EST LE DESSIN DES PORTES DU SITE (`.fch-hall-porte`), en compact — celui des
// deux halls et des trois portes du jour, quarante pixels plus bas. **Une porte
// ne se dessine pas deux fois**, et la rangée du dessous l'aurait sinon
// contredite à l'écran. *Un aplat d'accent a été essayé d'abord et Noé l'a
// écarté : une pastille jaune pleine dans une carte bleue criait plus fort que
// la carte, et elle n'avait la grammaire de rien sur cette page.*
//
// LE SERVICE PART DANS LE `title`. « Poser ce qui sortira avant, pendant et
// après » expliquait un bouton qui dit déjà ce qu'il fait ; il ne coûte plus une
// ligne. C'est la parade employée sur la ligne d'une habitude et sur les cartes
// du rendez-vous du dimanche.
function porteDeCarte(adresse, titre, service) {
  return `
    <a class="fch-carte-porte" href="${adresse}" title="${echapper(service)}">
      <span class="fch-carte-porte-nom">${echapper(titre)}</span>
      <span class="fch-carte-porte-fleche" aria-hidden="true">→</span>
    </a>`;
}

// RANG 1 — LA RÉUNION DU MOMENT (21 août 2026), le pendant de « la sortie du
// moment » chez Yuno : le jour d'un conseil, ce qui compte n'est ni la com' ni
// les objectifs, c'est la fiche.
const PHASES_REUNION = { avant: 'À préparer', pendant: 'En ce moment', apres: 'À conclure' };

function carteDeLaReunion(etat, maintenant) {
  const reunions = etat.evenements.filter(estReunion);

  // LA CARTE SE TAIT QUAND LE COMPTE-RENDU EST ÉCRIT (20 septembre 2026,
  // demande de Noé : « une fois que le compte-rendu est écrit il faut aussi que
  // le message sur la page d'accueil FC Hermitage s'enlève »).
  //
  // C'EST LA MÊME RÈGLE QUE LE BANDEAU DU HUB, corrigé la veille — *la question
  // se tait quand elle a sa réponse* —, et les deux écrans la tiennent
  // désormais par la même colonne, `fiches_reunion.cr_date`. Deux écrans qui
  // poseraient la même question et cesseraient de la poser à des moments
  // différents, ce sont deux écrans dont un ment.
  //
  // ELLE SORT DE « EN COURS », ELLE NE VIDE PAS LA CARTE : la cascade retombe
  // alors sur la PROCHAINE réunion, ou sur le rang suivant s'il n'y en a pas.
  // Une réunion conclue n'a plus rien à demander, mais l'accueil a toujours
  // quelque chose à montrer.
  //
  // LA PHASE « PENDANT » EN FAIT PARTIE, et ce n'est pas un excès de zèle : une
  // réunion qui finit tôt se conclut avant l'heure de fin qu'on lui avait
  // donnée, et sa carte resterait « En ce moment » alors que tout est écrit.
  const conclue = (e) => Boolean(ficheDeLaReunion(etat.fiches, e.id)?.cr_date);

  const enCours = reunions
    .filter((e) => {
      if (conclue(e)) return false;
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

  return carteChaude({
    etiquette: PHASES_REUNION[phase],
    etiquettes: etiquettesReunion(reunion),
    quand: momentLisible(new Date(reunion.date_debut)),
    titre: reunion.titre,
    corps: `${
      fiche?.objectif
        ? `<p class="discret reunion-objectif">À la fin : ${echapper(fiche.objectif)}</p>`
        : ''
    }${
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
    }`,
    pied: boutonFiche(fiche, reunion),
  });
}

// RANG 2 — LE TEMPS FORT QUI APPROCHE (30 août 2026).
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

function carteDuTempsFort(etat, maintenant) {
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

  return carteChaude({
    etiquette: cEstAujourdhui ? "C'est aujourd'hui" : 'Temps fort',
    quand: echeanceLisible(jour),
    titre: evenement.titre,
    corps: `<p class="tf-service">
        ${evenement.lieu ? `<span>${echapper(evenement.lieu)}</span>` : ''}
        ${quoi}
      </p>`,
    // LE BOUTON MÈNE À LA PAGE DE L'ÉVÈNEMENT (16 septembre 2026, demande de
    // Noé), et non plus au calendrier éditorial : c'est là que vit sa com — son
    // calendrier, ses idées à poser, ses publications écrites. L'éditorial, lui,
    // montre TOUT le club ; il fallait y retrouver son évènement à la main.
    //
    // LE REPLI RESTE L'ÉDITORIAL quand aucune fiche ne se rapproche sans
    // ambiguïté (`ficheDeLEvenement`) : un bouton qui ne mène nulle part serait
    // pire que celui qui mène un cran trop haut.
    pied: (() => {
      const fiche = ficheDeLEvenement(evenement);
      return fiche
        ? porteDeCarte(`#hermitage/evenements/${fiche.id}`, 'Préparer sa com',
          'Son calendrier, ses idées et ce qui est déjà écrit')
        : porteDeCarte('#hermitage/editorial', 'Préparer sa com',
          'Poser ce qui sortira avant, pendant et après');
    })(),
  });
}

// RANG 3 — UNE PARUTION SORT DANS 48 H ET N'EST PAS PRÊTE.
//
// LES 48 H SONT CELLES DU SITE, et elles ne s'inventent pas ici : c'est
// `AVANT_MONTE_A` chez Yuno depuis le 26 août, le seuil à partir duquel une
// chose qui vient devient une chose à faire. Au-delà, une parution est
// programmée — c'est le calendrier éditorial qui la porte, pas une carte
// chaude.
//
// SEUL LE PREMIER CRAN DÉCLENCHE. Une parution « à programmer » a son visuel :
// il ne reste qu'à poser la date dans l'outil, et ce n'est pas une
// interruption. Une parution « à préparer » la veille de sa sortie, si.
const PARUTION_CHAUDE_HEURES = 48;

function carteDeLaParution(etat, maintenant) {
  const borne = versDateISO(new Date(maintenant.getTime() + PARUTION_CHAUDE_HEURES * 3600 * 1000));
  const aujourdhui = versDateISO(maintenant);

  const parution = etat.publications
    .filter((pub) => pub.statut === 'idee' && pub.date_prevue)
    .filter((pub) => pub.date_prevue >= aujourdhui && pub.date_prevue <= borne)
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0];

  if (!parution) return '';

  const jour = depuisDateISO(parution.date_prevue);
  const suite = etat.publications.filter(
    (pub) => pub.statut === 'idee' && pub.date_prevue
      && pub.date_prevue >= aujourdhui && pub.date_prevue <= borne,
  ).length - 1;

  return carteChaude({
    etiquette: 'À préparer',
    etiquettes: `<span class="etiquette">${echapper(RESEAUX_FCH[parution.reseau] ?? parution.reseau)}</span>`,
    quand: echeanceLisible(jour),
    titre: parution.titre,
    corps: `<p class="tf-service">
      ${parution.rubrique ? `<span>${echapper(parution.rubrique)}</span>` : ''}
      <span class="tf-posees">${
        suite > 0
          ? `<span class="chiffre">${suite}</span> autre${suite > 1 ? 's' : ''} dans les deux jours`
          : 'La seule des deux prochains jours'
      }</span></p>`,
    pied: porteDeCarte('#hermitage/editorial', 'Ouvrir le calendrier éditorial',
      'Préparer le visuel, puis la passer à programmer'),
  });
}

// RANG 4 — L'ARGENT DES PARTENAIRES QUI N'EST PAS RENTRÉ.
//
// C'EST LE SEUL CHANTIER PARTENAIRE QUI S'OUVRE ET SE FERME, et c'est pour ça
// qu'il est ici plutôt qu'un autre. Les 65 engagements qui restent à tenir sont
// une vérité PERMANENTE : une carte chaude qui les afficherait tous les jours
// pendant six mois deviendrait un meuble, et elle mangerait à jamais le rang du
// dessous — c'est exactement l'écueil que Yuno a documenté avec sa fournée du
// lundi. Un virement, lui, arrive : la carte disparaît quand l'argent est là.
// **Les engagements gardent leur porte**, qui est leur juste place — une liste
// se parcourt, elle n'interrompt pas.
//
// ELLE NE COMPTE AUCUN RETARD, et c'est ce qui la sépare d'une relance :
// l'engagement n'a pas de date d'échéance, seulement un moment de saison. Elle
// dit qui, combien, et ouvre la porte. Le club n'a pas de mauvais payeurs, il a
// des virements qui n'ont pas encore été faits.
function carteDesVirements(etat) {
  // `partenairesSuivi` ET NON `partenaires` : l'état porte les deux, et ce ne
  // sont pas les mêmes gens. `partenaires` sont les CONTACTS de type partenaire
  // (le carnet) ; `partenairesSuivi` sont les partenaires DE LA SAISON, avec
  // leur offre, leur montant et leurs engagements. Deux noms voisins pour deux
  // tables, et c'est le genre d'erreur qui ne se voit qu'à une porte muette.
  const attente = (etat.partenairesSuivi ?? []).filter((p) => p.statut === 'virement_attendu');
  if (!attente.length) return '';

  const somme = attente.reduce((total, p) => total + Number(p.montant ?? 0), 0);
  const nommes = attente.slice(0, 3).map((p) => p.nom);

  return carteChaude({
    etiquette: 'Partenaires',
    titre: somme
      ? `${somme.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € attendent`
      : `${attente.length} virement${attente.length > 1 ? 's' : ''} attendu${attente.length > 1 ? 's' : ''}`,
    corps: `<p class="tf-service"><span>${echapper(nommes.join(', '))}${
      attente.length > 3
        ? ` et ${attente.length - 3} autre${attente.length > 4 ? 's' : ''}`
        : ''
    }</span></p>`,
    pied: porteDeCarte('#hermitage/partenaires/liste', 'Voir les partenaires',
      'Leur offre, leur montant, et où en est chacun'),
  });
}

// RANG 5 — LE REPLI : OÙ EN EST LA CHAÎNE ÉDITORIALE.
//
// IL A TOUJOURS QUELQUE CHOSE À DIRE, et c'est sa fonction : le dernier rang
// d'une cascade ne peut pas être muet, sinon l'accueil l'est aussi. C'est le
// rôle que « l'idée du jour » tient chez Yuno.
//
// CE QU'IL DIT EST LE FAIT DU CLUB, et il a fallu le mesurer pour le voir : au
// 16 septembre 2026, les 54 parutions posées devant étaient TOUTES en « à
// préparer » et AUCUNE en « à programmer ». Le calendrier éditorial montre les
// parutions une à une ; il ne dit jamais que la chaîne est bouchée à son premier
// cran. Deux semaines de fenêtre : c'est ce qu'on peut préparer d'avance.
//
// AUCUN REPROCHE, AUCUNE COULEUR. « 6 posées, aucune encore prête » est un
// constat, pas un retard — la règle du hub tient ici comme partout.
const FENETRE_CHAINE_JOURS = 14;

function carteDeLaChaine(etat, maintenant) {
  const aujourdhui = versDateISO(maintenant);
  const borne = versDateISO(ajouterJours(maintenant, FENETRE_CHAINE_JOURS));
  const devant = etat.publications.filter(
    (pub) => pub.date_prevue && pub.date_prevue >= aujourdhui && pub.date_prevue <= borne
      && pub.statut !== 'publie',
  );

  const pretes = devant.filter((pub) => pub.statut === 'pret').length;
  const aPreparer = devant.length - pretes;

  return carteChaude({
    etiquette: 'La com’',
    titre: devant.length
      ? `${devant.length} parution${devant.length > 1 ? 's' : ''} sur les quinze jours`
      : 'Rien de posé sur les quinze jours',
    corps: `<p class="tf-service">${
      devant.length
        ? `<span class="tf-posees"><span class="chiffre">${aPreparer}</span> à préparer${
            pretes ? ` · <span class="chiffre">${pretes}</span> prête${pretes > 1 ? 's' : ''} à programmer` : ''
          }</span>`
        : '<span class="tf-posees tf-rien">Le calendrier attend ses premières dates</span>'
    }</p>`,
    pied: porteDeCarte('#hermitage/saison', 'Voir ce qui tourne',
      'Les rubriques du club, leurs rythmes et ce qui manque'),
  });
}

// LA CASCADE : le premier rang satisfait gagne, et il est SEUL. C'est la
// mécanique du bandeau de l'après du hub (« un seul à la fois ») — deux cartes
// chaudes empilées, ce sont deux interruptions.
//
// L'ORDRE EST CELUI QUE NOÉ A CHOISI, le 16 septembre 2026, entre trois
// propositions : LE MOMENT D'ABORD. Ce qui a une heure passe devant — une
// réunion, un temps fort —, puis ce qui part, puis l'argent. *La com' d'abord a
// été proposée et écartée : la spec dit « la communication d'abord » du SITE
// entier, pas de sa carte du jour, et le jour d'un conseil d'administration ce
// n'est pas la story du week-end qui compte.*
//
// EXPORTÉE pour être vérifiable seule, avec un état factice : cinq rangs qui se
// bousculent, c'est exactement le genre de règle qu'on ne croit pas sur parole.
export function carteDuMoment(etat, reference = new Date()) {
  return (
    carteDeLaReunion(etat, reference) ||
    carteDuTempsFort(etat, reference) ||
    carteDeLaParution(etat, reference) ||
    carteDesVirements(etat) ||
    carteDeLaChaine(etat, reference) ||
    ''
  );
}

// --- LES TROIS PORTES DU JOUR ------------------------------------------------
//
// LE DESSIN EST CELUI DES DEUX HALLS DU SITE (`porte`, js/partenaires-suivi.js),
// et il n'est pas recopié : le hall du club et celui des partenaires s'en
// servent déjà. Une porte ne se dessine pas deux fois.
//
// TROIS RÈGLES, celles de Yuno :
// — une porte qui n'a rien à dire ne monte pas. La rangée du jour est un
//   classement, pas un inventaire. **Le test porte sur les DONNÉES, jamais sur
//   la vitrine** : la frise de la semaine se dessine même vide — c'est tout son
//   intérêt —, elle ne peut donc pas servir de test à la porte qu'elle habille ;
// — jamais deux portes de la même rubrique, sinon un jour chargé aux partenaires
//   mangerait la rangée ;
// — les évènements ferment la réserve : la saison en compte neuf, c'est la seule
//   porte qui ait toujours quelque chose à montrer, donc celle qui ne doit
//   jamais passer devant une urgence.
//
// LA COM' FIGURE DEUX FOIS, et les deux entrées s'excluent : une semaine SANS
// rien de programmé est une information qui passe devant presque tout — c'est le
// trou qu'un calendrier éditorial est fait pour montrer —, une semaine pleine
// n'est qu'un rappel. Même porte, deux rangs.
const PORTES_AU_PLUS = 3;

// LA VITRINE DE LA COM' : la semaine qui vient, une marque par parution posée.
// Elle vient de js/gabarits.js — c'est celle de l'accueil Yuno, empruntée et non
// recopiée —, et elle se peint à `--accent`, c'est-à-dire au jaune du club.
function vitrineDeLaCom(publications) {
  return friseDeLaSemaine(
    publications
      .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
      .map((pub) => ({ jour: pub.date_prevue })),
  );
}

// LA VITRINE DES ÉVÈNEMENTS : le prochain de la saison et ce qui est écrit pour
// lui. Le compte des communications vient de la rubrique, comme sur sa page —
// deux façons de compter finiraient par ne plus dire le même nombre.
function vitrineDesEvenements(publications, reference) {
  const suivant = prochainEvenementClub(reference);
  if (!suivant) return '<span class="fch-hall-quoi">La saison est passée.</span>';
  const liees = publications.filter(
    (pub) => pub.rubrique === `Évènement · ${suivant.evenement.titre} · ${suivant.evenement.date}`,
  ).length;
  return `<span class="fch-hall-phrase">${echapper(suivant.evenement.titre)}</span>
    <span class="fch-hall-quoi">${echapper(suivant.evenement.date)} · ${echapper(suivant.evenement.lieu)}</span>
    <span class="fch-hall-quoi">${
      liees ? `${liees} communication${liees > 1 ? 's' : ''} écrite${liees > 1 ? 's' : ''}` : 'Communication à préparer'
    }</span>`;
}

// EXPORTÉE pour la même raison que la cascade : un classement se vérifie avec
// des données factices, pas en regardant l'écran d'un jour particulier.
export function portesDuJour(etat, reference = new Date()) {
  const aujourdhui = versDateISO(reference);
  const borne = versDateISO(ajouterJours(reference, 7));

  const partenaires = etat.partenairesSuivi ?? [];
  const engagements = partenaires.flatMap((p) => p.engagements ?? []);
  const restants = engagements.filter((e) => !e.fait_le).length;
  const lots = parChantier(partenaires).filter((l) => l.reste);

  const semaine = etat.publications.filter(
    (pub) => pub.date_prevue && pub.statut !== 'publie'
      && pub.date_prevue >= aujourdhui && pub.date_prevue <= borne,
  );

  const reunions = etat.evenements.filter(estReunion);
  const actionsOuvertes = (etat.actionsClub ?? []).filter((a) => a.statut !== 'fait');
  const prochaineReunion = reunions
    .filter((e) => finDeLaSortie(e) >= reference)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0];

  const evenementProche = prochainEvenementClub(reference);
  const dansSixSemaines = evenementProche
    && evenementProche.quand <= ajouterJours(reference, 42);

  const laCom = () =>
    porte('#hermitage/editorial', 'La com’ de la semaine',
      `${semaine.length}`,
      vitrineDeLaCom(etat.publications));

  const lesEvenements = () =>
    porte('#hermitage/evenements', 'Les évènements', `${EVENEMENTS_CLUB.length}`,
      vitrineDesEvenements(etat.publications, reference));

  const reserve = [
    {
      rubrique: 'partenaires',
      quand: restants > 0,
      porte: () => porte('#hermitage/partenaires/engagements', 'Nos engagements',
        `${restants} à faire`,
        lots.length
          ? `<ul class="fch-hall-lots">${lots.slice(0, 3).map((l) => `<li>
              <span>${echapper(l.libelle)}</span>
              <span class="fch-hall-compte">${l.reste}</span></li>`).join('')}</ul>`
          : '<span class="fch-hall-quoi">Tout est tenu.</span>'),
    },
    // Le trou de la semaine : la porte monte haut, parce que c'est ce qu'un
    // calendrier éditorial est fait pour montrer.
    { rubrique: 'com', quand: !semaine.length, porte: laCom },
    {
      rubrique: 'reunions',
      quand: Boolean(prochaineReunion) || actionsOuvertes.length > 0,
      porte: () => porteDesReunions(etat),
    },
    { rubrique: 'evenements', quand: Boolean(dansSixSemaines), porte: lesEvenements },
    // La même porte, un rang plus bas : la semaine est pleine, il n'y a qu'à
    // relire ce qui part.
    { rubrique: 'com', quand: semaine.length > 0, porte: laCom },
    { rubrique: 'evenements', quand: true, porte: lesEvenements },
  ];

  const prises = new Set();
  const retenues = [];
  for (const candidate of reserve) {
    if (retenues.length === PORTES_AU_PLUS) break;
    if (!candidate.quand || prises.has(candidate.rubrique)) continue;
    prises.add(candidate.rubrique);
    retenues.push(candidate.porte());
  }

  return retenues.join('');
}

// --- LE BLOC FIXE : À FAIRE --------------------------------------------------
//
// IL RESTE UN BLOC ET IL RESTE COCHABLE (décision de Noé, 16 septembre 2026),
// là où Yuno en a fait une porte. C'est juste : le site est l'ATELIER du club,
// et cocher une tâche en sortant du stade est le geste pour lequel on l'ouvre.
//
// TROIS LIGNES AU LIEU DE SEPT. Mesuré, il occupait 644 px — un tiers d'une page
// qui en faisait 2 018 : c'était le mur que l'espace Tâches a appris à ne pas
// dresser. Le reste se déplie, rien n'est caché ; c'est la place qui change de
// propriétaire.
//
// AJOUTER UN OBJECTIF A QUITTÉ CET ÉCRAN le 30 août 2026. Un objectif de fin
// d'alternance se décide trois fois dans une année : le formulaire pesait tous
// les jours pour un geste triennal, et il vit dans `#objectifs`, là où l'on
// décide.
const TACHES_EN_TETE = 3;

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

  // LE TITRE EST LA PORTE, et la tuile entière l'ouvre (16 septembre 2026,
  // demande de Noé : « simplement appuyer sur la tuile des tâches pour aller à
  // toutes les tâches »). Le `lien-externe` qui fermait la tuile est donc parti :
  // il pesait trois lignes pour dire ce que la tuile fait désormais d'un doigt.
  //
  // LE TITRE RESTE UN VRAI LIEN parce qu'un écouteur ne se tabule pas : le
  // clavier doit atteindre ce que la souris atteint. Voir `data-tuile-vers`, plus
  // bas dans le gestionnaire de clic.
  const titre = (compte) => `<h2 class="titre-section">
      <a class="fch-titre-porte" href="#hermitage/taches">À faire${
        compte ? ` <span class="chiffre">${compte}</span>` : ''
      }</a>
    </h2>`;

  if (!aFaire.length) {
    return `
    <section class="bloc">
      ${titre(0)}
      <div class="fch-tuile" data-tuile-vers="#hermitage/taches">
      <div data-bloc="taches">
        <p class="vide">Rien à faire pour le club. Le « + » en bas note la prochaine.</p>
      </div>
      </div>
    </section>`;
  }

  const tete = aFaire.slice(0, TACHES_EN_TETE);
  const reste = aFaire.slice(TACHES_EN_TETE);

  return `
    <section class="bloc">
      ${titre(aFaire.length)}
      <div class="fch-tuile" data-tuile-vers="#hermitage/taches">
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
      </div>
    </section>`;
}

// --- LE CAP, EN PIED ---------------------------------------------------------
//
// POURQUOI EN PIED : c'est la leçon que le hub a tranchée deux fois — le cap
// passé sous la journée le 13 août, les périodes qui ferment `#objectifs` le
// 28 — « on relit ce qui cadre quand on lève la tête, pas en ouvrant
// l'application ». Yuno l'a fait le 15 septembre ; le FCH suit.
//
// IL NOMME LA MARCHE SUIVANTE (`marquerSuivant`), et c'est ce qui le sauve :
// mesuré le 16 septembre, les trois caps du club portent huit jalons dont AUCUN
// n'est atteint. Trois rangées de points vides, c'est un accueil qui s'ouvre sur
// trois zéros. La marche à venir s'allume au jaune du club et se lit en toutes
// lettres : l'œil tombe sur ce qu'il y a à faire, pas sur ce qui manque.
//
// IL MÈNE À `#objectifs/fch` et non à `#objectifs` : on reste dans le filtre du
// club — sortir vers les quatre espaces depuis l'accueil du site serait quitter
// le site pour voir moins précis.
function blocLeCap(etat) {
  if (!etat.objectifs.length) return '';
  return `
    <section class="bloc bloc-discret fch-cap">
      <h2 class="titre-section">Le cap</h2>
      <div data-bloc="objectifs">${construireCapGrave(etat.objectifs, {
        marquerSuivant: true,
        adresse: '#hermitage/cap',
      })}</div>
    </section>`;
}

// LE SITE NE POSE QUE LE CADRE : sa barre, un hôte, son pied. Le module du hub
// écrit dedans et y pose SES écouteurs.
//
// L'HÔTE PORTE SA VUE, et ce n'est pas décoratif : c'est ce qui permet à la
// feuille de style de taire le titre du module sur les deux écrans dont le `h1`
// n'est QUE le nom de la page — la galerie et les tâches. La barre le dit déjà,
// et le redire quarante pixels plus bas, c'est deux titres pour un écran. Les
// deux autres le gardent : leur `h1` porte le nom d'un CAP ou d'un PROJET, ce que
// la barre ne dit pas.
function vueDuCap(etat) {
  return `
    ${enTete(etat.vue, etat.capOuvert)}
    <div data-hote-cap="${echapper(etat.vue)}"></div>
    ${pied()}`;
}

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}
    <div class="fch-accueil">
    ${carteDuMoment(etat)}
    ${blocAFaire(etat)}

    <section class="bloc fch-sans-tuile">
      <h2 class="titre-section">Aujourd’hui au club</h2>
      <div class="fch-hall fch-hall-jour">${portesDuJour(etat)}</div>
    </section>

    ${blocLeCap(etat)}
    </div>
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

// --- LA PAGE COMMUNICATION : UN HALL (16 septembre 2026, demande de Noé) ------
//
// « Fais une refonte de la page communication du FCH, en ajoutant un lien ou une
// page pour gérer la communication des évènements. »
//
// LE DÉFAUT, MESURÉ AVANT DE TOUCHER À QUOI QUE CE SOIT. La page portait trois
// prochaines publications, puis **quatre rectangles avec un nom et une flèche** —
// La saison, Le calendrier éditorial, La banque d'idées, Les publications parues.
// *Quatre lignes de menu redessinées, et le menu est déjà à un geste.* C'est
// exactement ce que les deux autres halls du site ont corrigé le matin même, et
// la règle est celle du hall de `#perso` : **une porte doit dire quelque chose
// qu'on IGNORE avant de l'ouvrir.**
//
// ET LES CHIFFRES ONT DONNÉ SA FORME À LA PAGE. Sur 79 publications :
//   — **ZÉRO idée sans date** : la banque est STRUCTURELLEMENT vide, et sa porte
//     ouvrait sur rien sans le dire ;
//   — **56 programmées, toutes en « à préparer », ZÉRO en « à programmer »** : la
//     chaîne est bouchée à son premier cran ;
//   — **trois séries hebdomadaires portent 48 des 79** — la com du club est
//     CYCLIQUE, c'est le fait que le dossier FCH avait révélé ;
//   — **27 sans rubrique**, soit une sur trois : c'est ce qui empêche de compter
//     par rubrique, et c'est ce que « La saison » sert à corriger ;
//   — **un seul évènement sur neuf a de la com écrite** — et rien, nulle part, ne
//     menait de la communication vers eux. C'est le manque que Noé a nommé.
//
// LE BILAN RESTE EN TÊTE, et c'est la décision que Noé a déjà prise pour le hall
// des partenaires : « on garde le dashboard de haut de page, c'est très bien ».
// On regarde, puis on entre.

// Le dessin est celui du bilan des partenaires (`suivi-bilan`), emprunté et non
// recopié : deux tableaux de chiffres dans le même site ne peuvent pas avoir deux
// dessins. Ce sont les classes du SUIVI, pas des partenaires — comme
// `fch-hall-*` sert deux halls.
function bilanDeLaCom(etat) {
  const aujourdhui = versDateISO(new Date());
  const borne = versDateISO(ajouterJours(new Date(), 7));
  const pubs = etat.publications;

  const semaine = pubs.filter(
    (p) => p.date_prevue && p.statut !== 'publie'
      && p.date_prevue >= aujourdhui && p.date_prevue <= borne,
  ).length;
  const parues = pubs.filter((p) => p.statut === 'publie').length;
  // Une publication rattachée à un ÉVÈNEMENT est rangée : sa rubrique la relie à
  // lui. Elle ne compte donc pas parmi celles « à ranger ».
  const sansRubrique = pubs.filter((p) => !(p.rubrique ?? '').trim()).length;
  // Les rythmes qui TOURNENT : une série arrêtée ne tient plus rien.
  const rythmes = (etat.series ?? []).filter(
    (serie) => serie.espace === ESPACE && serie.nature === 'publication' && !serie.arretee,
  ).length;

  const tuile = (chiffre, quoi, precision) => `<li class="suivi-bilan-tuile">
    <span class="suivi-chiffre">${echapper(String(chiffre))}</span>
    <span class="suivi-quoi">${echapper(quoi)}</span>
    ${precision ? `<span class="suivi-precision">${echapper(precision)}</span>` : ''}</li>`;

  return `<ul class="suivi-bilan">
    ${tuile(semaine, semaine > 1 ? 'parutions cette semaine' : 'parution cette semaine',
      semaine ? 'Sur les sept jours qui viennent' : 'Rien de posé pour l’instant')}
    ${tuile(rythmes, rythmes > 1 ? 'rythmes qui tournent' : 'rythme qui tourne',
      'Programmation et résultats du week-end')}
    ${tuile(parues, 'publications parues', 'Depuis le début de la saison')}
    ${tuile(sansRubrique, 'sans rubrique',
      sansRubrique ? 'À ranger depuis La saison' : 'Tout est rangé.')}
  </ul>`;
}

// LA PORTE DES ÉVÈNEMENTS — la demande de Noé, et le manque que le chiffre
// dit : **un seul évènement sur neuf a de la com écrite**, et rien ne menait de
// la communication vers eux. Ils vivaient sous « Le club », où l'on va voir ce
// que le club EST ; leur COMMUNICATION est un chantier, et elle se prend d'ici.
//
// ELLE EST UNE PORTE DU HALL, PAS UNE ENTRÉE DE MENU : le menu garde « Les
// évènements » sous « Le club », son rangement du 16 septembre. Deux entrées de
// menu pour une page, ce serait deux endroits à tenir d'accord ; une porte dans
// un hall, c'est justement ce que le second rang permet.
//
// CE QU'ELLE MONTRE : le prochain de la saison, sa date, et **combien de
// publications lui sont écrites** — la seule question qui vaille devant un
// évènement qui approche.
function porteDesEvenements(etat) {
  const suivant = prochainEvenementClub(new Date());
  const compte = (evenement) => etat.publications.filter(
    (p) => p.rubrique === `Évènement · ${evenement.titre} · ${evenement.date}`,
  ).length;
  const couverts = EVENEMENTS_CLUB.filter((e) => compte(e) > 0).length;

  // ELLE PORTE LE NOM DE SA PAGE — « Les évènements » —, et non « La com des
  // évènements » : un nom sur la porte et un autre en tête de page, ce sont deux
  // noms pour une page, le défaut corrigé dans le hub le 28 août. **C'est le
  // CONTEXTE qui dit de quoi on parle** : la porte vit dans le hall de la
  // Communication, et son aperçu ne parle que de com.
  if (!suivant) {
    return porte('#hermitage/evenements', 'Les évènements', `${EVENEMENTS_CLUB.length}`,
      '<span class="fch-hall-quoi">La saison est passée.</span>');
  }

  const n = compte(suivant.evenement);
  return porte('#hermitage/evenements', 'Les évènements',
    `${couverts}/${EVENEMENTS_CLUB.length}`,
    `<span class="fch-hall-phrase">${echapper(suivant.evenement.titre)}</span>
     <span class="fch-hall-quoi">${echapper(suivant.evenement.date)} · ${echapper(suivant.evenement.lieu)}</span>
     <span class="fch-hall-quoi">${
       n
         ? `${n} publication${n > 1 ? 's' : ''} écrite${n > 1 ? 's' : ''}`
         // Un vide ouvre une porte, il ne s'excuse pas : c'est un fait, pas un
         // reproche — et c'est justement ce qu'on vient faire ici.
         : 'Sa communication est à écrire'
     }</span>`);
}

// LE HALL DE LA COMMUNICATION. L'ordre suit ce qu'on vient faire : ce qui part,
// puis les deux chantiers (les évènements, les rythmes), puis ce qu'on relit.
function hallDeLaCom(etat) {
  const aujourdhui = versDateISO(new Date());
  const borne = versDateISO(ajouterJours(new Date(), 7));
  const pubs = etat.publications;

  const semaine = pubs
    .filter((p) => p.date_prevue && p.statut !== 'publie'
      && p.date_prevue >= aujourdhui && p.date_prevue <= borne)
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));
  const idees = pubs.filter((p) => !p.date_prevue && p.statut !== 'publie');
  const parues = pubs.filter((p) => p.statut === 'publie');
  const derniere = [...parues].sort((a, b) =>
    (b.date_prevue ?? '').localeCompare(a.date_prevue ?? ''))[0];
  // LES RUBRIQUES DU CLUB, ET PAS CELLES DES ÉVÈNEMENTS. Une rubrique d'évènement
  // (« Évènement · Concours de pétanque · 26 septembre 2026 ») n'est pas une
  // rubrique ÉDITORIALE : c'est le marqueur qui relie une publication à son
  // évènement, et la porte d'à côté le dit déjà. *Mesuré : elle s'affichait en
  // toutes lettres dans la pastille, sur trois lignes, et faisait compter 4
  // rubriques au lieu de 3.* `estRubriqueEvenement` existe exactement pour ça.
  const rubriques = new Set(
    pubs.map((p) => (p.rubrique ?? '').trim())
      .filter((rubrique) => rubrique && !estRubriqueEvenement(rubrique)),
  );

  return `<section class="fch-hall" aria-label="La communication">
    ${porte('#hermitage/editorial', 'Le calendrier éditorial', `${semaine.length}`,
      // LA FRISE ET DEUX TITRES. La frise dit la FORME de la semaine — où sont
      // les trous —, les titres disent QUOI. Deux lignes au plus : au-delà, la
      // porte redirait la page qu'elle ouvre.
      `<ul class="fch-hall-lots">${semaine.slice(0, 2).map((p) => `<li>
          <span>${echapper(p.titre)}</span>
          <span class="fch-hall-compte">${echapper(RESEAUX_FCH[p.reseau] ?? p.reseau)}</span></li>`).join('')
        || '<li><span class="fch-hall-quoi">Rien de posé cette semaine.</span></li>'}</ul>`,
      vitrineDeLaCom(pubs))}

    ${porteDesEvenements(etat)}

    ${porte('#hermitage/saison', 'La saison', `${rubriques.size}`,
      `<span class="fch-hall-quoi">Les rubriques du club, leurs rythmes et ce qui manque.</span>
       <span class="fch-hall-mots">${mots([...rubriques], 3)}</span>`)}

    ${porte('#hermitage/banque', 'La banque d’idées', `${idees.length}`,
      idees.length
        ? `<ul class="fch-hall-lots">${idees.slice(0, 2).map((p) => `<li>
            <span>${echapper(p.titre)}</span></li>`).join('')}</ul>`
        // ELLE DIT SON VIDE, et c'est une information : la banque n'a jamais rien
        // contenu — mesuré, zéro idée sans date sur 79 publications. La porte
        // invite au lieu de s'excuser, c'est la règle des écrans vides.
        : '<span class="fch-hall-quoi">Rien en réserve. Une idée notée ici attend son jour.</span>')}

    ${porte('#hermitage/publications', 'Les publications parues', `${parues.length}`,
      derniere
        ? `<span class="fch-hall-phrase">${echapper(derniere.titre)}</span>
           <span class="fch-hall-quoi">La dernière parue</span>`
        : '<span class="fch-hall-quoi">Les premières parutions s’inscriront ici.</span>')}
  </section>`;
}

function vueCreer(etat) {
  const vue = etat.vue;
  const formulaire = () => `${formulaireIdee({
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
      })}`;
  const contenus = {
    // LE BILAN, PUIS LE HALL. L'aperçu des trois prochaines publications est parti
    // avec la rangée de liens : il disait ce que la porte du calendrier éditorial
    // montre désormais — la semaine, ses trous et ses deux prochains titres —, et
    // deux endroits pour une même chose finissent par se contredire.
    creer: () => `<section class="bloc fch-sans-tuile"><h2>La communication du club</h2>
      ${bilanDeLaCom(etat)}
      ${hallDeLaCom(etat)}</section>`,
    saison: () => `<section class="bloc"><h2>La saison</h2>
      <div data-bloc="saison">${construireLaSaison(etat.series, etat.publications)}</div></section>
      <section class="bloc">${formulaire()}</section>`,
    editorial: () => `<section class="bloc"><h2>À venir</h2>
      <div data-bloc="a-venir">${construireAVenir(etat.publications, { ouvrable: true, pastille: true, series: true })}</div></section>
      <section class="bloc">${formulaire()}</section>`,
    banque: () => `<section class="bloc"><h2>Les idées à développer</h2>
      <div data-bloc="banque">${construireBanque(etat.publications)}</div></section>
      <section class="bloc">${formulaire()}</section>`,
    publications: () => `<section class="bloc"><h2>Les publications parues</h2>
      <div data-bloc="publiees">${construirePubliees(etat.publications)}</div></section>`,
  };
  return `${enTete(vue)}${contenus[vue]()}
    ${vue !== 'creer' ? '<a class="lien-discret" href="#hermitage/creer">← Communication</a>' : ''}
    ${fenetreIdee(etat)}${pied()}`;
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
       extra: `<input type="hidden" name="id" value="${echapper(pub.id)}">${estRubriqueEvenement(pub.rubrique) ? `<input type="hidden" name="rubrique" value="${echapper(pub.rubrique)}">` : ''}`,
       champs: [
         { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true,
           valeur: pub.titre },
         { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: RESEAUX_FCH,
           valeur: pub.reseau },
         // `post` a fusionné dans carrousel le 15 août : une vieille ligne se
         // présente sous le format qui reste.
         { nom: 'format', libelle: 'Format', type: 'choix', options: FORMATS,
           valeur: pub.format === 'post' ? 'carrousel' : pub.format },
         ...(!estRubriqueEvenement(pub.rubrique) ? [{ nom: 'rubrique', libelle: 'Rubrique (facultative)', type: 'text',
           valeur: pub.rubrique ?? '',
           suggestions: rubriquesProposees(etat.publications, RUBRIQUES_DEPART) }] : []),
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
    ${construireBarrePeriode(etat.vueCal, etat.ancreCal, {
      // TROIS VUES : le trimestre, né le 2 septembre 2026, est réservé aux pages
      // d'un cap et d'un projet — rien ici n'a demandé qu'il traverse.
      vues: ['mois', 'semaine', 'agenda'],
    })}
    ${construireFiltres(etat.natures, { offertes: NATURES_FCH })}
    <div data-bloc="calendrier">
      ${
        etat.vueCal === 'agenda'
          ? construireCalendrier(aVenir, etat.natures)
          : construireGrille(elements, etat.natures, etat.vueCal, etat.ancreCal, {
              selection: etat.creationCal,
              // L'EN-TÊTE D'UN JOUR OUVRE SA JOURNÉE (20 septembre 2026, demande
              // de Noé : « comme c'est fait dans la page d'accueil du hub avec la
              // vue semaine »). Les deux options sont celles de l'accueil, au mot
              // près : le gabarit sait déjà faire, il attendait qu'on le lui
              // demande. La vue mois et l'agenda n'en lisent aucune.
              titresOuvrants: true,
              jourSeul: etat.jourSemaineCal,
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

// LA PAGE EST DEVENUE UN SUIVI D'ENGAGEMENTS (16 septembre 2026, demande de
// Noé). Elle listait les contacts de type « marque » avec leur e-mail : un
// annuaire, qui ne disait rien de ce que le club DOIT à chacun.
//
// LE CARNET N'A PAS DISPARU : ces contacts vivent toujours dans le réseau de
// Yuno, qui est la même table. Ce qui change, c'est la question que cette
// page-ci pose — « qu'est-ce qu'on leur doit, et qu'est-ce qui reste à faire ».
function vuePartenaires(etat) {
  return `
    ${enTete('partenaires', { liste: etat.partenairesSuivi ?? [], vue: etat.partenaireOuvert })}
    ${construireSuiviPartenaires(etat.partenairesSuivi ?? [], etat.partenaireOuvert, etat.engagementAConfirmer)}
    ${construireFormulaire({
      id: 'partenaire',
      libelle: 'Ajouter un partenaire',
      action: 'creer-partenaire',
      champs: [
        { nom: 'nom', libelle: 'Entreprise', type: 'text', requis: true },
        {
          nom: 'offre',
          libelle: 'Offre',
          type: 'choix',
          options: OFFRES_FCH.map((offre) => [offre.id, offre.nom]),
          defaut: 'coup-denvoi',
        },
        {
          nom: 'statut',
          libelle: 'État',
          type: 'choix',
          options: ETATS_PARTENAIRE.map(([id, nom]) => [id, nom]),
          defaut: 'virement_attendu',
        },
        { nom: 'montant', libelle: 'Montant convenu (€)', type: 'number' },
        { nom: 'commune', libelle: 'Commune', type: 'text' },
        { nom: 'referents', libelle: 'Référent', type: 'text' },
        { nom: 'cerfa', libelle: 'CERFA', type: 'text' },
        { nom: 'notes', libelle: 'Notes', type: 'textarea' },
      ],
    })}
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
// L'ordre va du plus souvent consulté au plus rarement : les organigrammes d'abord
// (c'est la question qu'on se pose en semaine), la mission ensuite (on la relit
// avant d'écrire), les créneaux et les chiffres pour finir.

function construireEntrainements() {
  const iconeLieu = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  const iconeHeure = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>';
  return `<section class="entrainements" aria-label="Planning des entraînements">
    <div class="entrainements-semaine">${CRENEAUX.map(([jour, lot]) => `
      <section class="entrainements-jour" aria-label="${echapper(jour)}">
        <h3>${echapper(jour)}</h3>
        <ul>${lot.map(([categorie, lieu, heure]) => {
          const famille = categorie === 'Mam’s' ? 'mams'
            : ['U7', 'U9'].includes(categorie) ? 'jeunes'
            : ['U11', 'U13'].includes(categorie) ? 'formation' : 'competition';
          return `<li class="entrainement-carte entrainement-${famille}">
            <h4>${echapper(categorie)}</h4>
            <p>${iconeLieu}<span>${echapper(lieu)}</span></p>
            <p>${iconeHeure}<span>${echapper(heure)}</span></p>
          </li>`;
        }).join('')}</ul>
      </section>`).join('')}</div>
  </section>`;
}

// LE CLUB EST UN HALL (16 septembre 2026, demande de Noé : « modifie la forme
// des tuiles de la page club pour que ça ressemble davantage à ce style — comme
// ma bibliothèque dans perso, ou le vivier dans Yuno »).
//
// CE QUE ÇA REMPLACE, ET LA RÈGLE QUI LE CONDAMNAIT : cinq rectangles portant un
// nom et une flèche, c'est-à-dire cinq lignes de menu redessinées — et le menu
// est déjà à un geste. La règle du hall de `#perso` vaut ici mot pour mot :
// CHAQUE PORTE DOIT DIRE QUELQUE CHOSE QU'ON IGNORE AVANT DE L'OUVRIR — qui est
// là, ce qu'on s'est promis, qui s'entraîne ce soir, ce que le club pèse, qui
// n'a pas encore viré. C'est le test à repasser le jour où une sixième arrive.
//
// LA PORTE DES PARTENAIRES VIENT DU HALL DES PARTENAIRES, telle quelle : deux
// écrans qui dessineraient la même porte chacun de leur côté finiraient par ne
// plus montrer la même chose, et c'est celui qu'on regarde le moins qui mentirait.

const JOURS_SEMAINE = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// LE PROCHAIN JOUR QUI PORTE DES ENTRAÎNEMENTS, à partir d'aujourd'hui. C'est ce
// qu'on ignore en regardant la page, et c'est la seule chose de cette porte qui
// change d'un jour à l'autre. Pure : elle prend sa date, donc elle s'éprouve
// hors écran.
export function prochainEntrainement(maintenant = new Date()) {
  for (let i = 0; i < 7; i += 1) {
    const nom = JOURS_SEMAINE[(maintenant.getDay() + i) % 7];
    const jour = CRENEAUX.find(([j]) => j === nom);
    if (jour) return { quand: i === 0 ? 'Aujourd’hui' : i === 1 ? 'Demain' : nom, creneaux: jour[1] };
  }
  return null;
}

// UN REPÈRE SE COUPE À SA PREMIÈRE VIRGULE dans une porte : « licenciés, des U7
// aux vétérans » ne tient pas sur une ligne de 16 rem et s'arrêterait à une
// ellipse, ce qui fait lire une phrase inachevée là où il y a un fait entier.
// Sa page, elle, les donne en entier.
const courtRepere = (quoi) => quoi.split(/\s*[,:]\s*/)[0];

// LES VISAGES EN PILE plutôt que les noms des groupes (16 septembre 2026,
// demande de Noé : « pour les organigrammes mets des photos l'une sur l'autre
// plutôt que les pastilles présidence… »). Et il a raison : « Présidence,
// Secrétariat, Trésorerie » sont les mots du MENU de cette page, pas ce qu'on
// ignore avant de l'ouvrir — on y vient chercher des GENS.
//
// LE BUREAU D'ABORD, puis le reste : ce sont les visages qu'on cherche en
// premier, et la pile ne peut en montrer que six.
function visagesDuClub(combien) {
  const bureau = GROUPES.filter((g) => g.type === 'bureau').flatMap((g) => g.membres);
  const ordre = [...new Set([...bureau, ...Object.keys(PERSONNES)])];
  const avecPhoto = ordre.map((id) => PERSONNES[id]).filter((p) => p?.photo);
  const montres = avecPhoto.slice(0, combien);
  const reste = avecPhoto.length - montres.length;
  return `<span class="fch-hall-visages">${montres.map(portrait).join('')}${
    reste ? `<span class="fch-hall-visage-plus">+${reste}</span>` : ''}</span>`;
}

function hallDuClub(etat) {
  const bureau = GROUPES.filter((g) => g.type === 'bureau');
  const commissions = GROUPES.filter((g) => g.type === 'commissions');
  const equipes = GROUPES.filter((g) => g.type === 'sportif');
  const prochain = prochainEntrainement();
  const creneaux = CRENEAUX.reduce((total, [, lot]) => total + lot.length, 0);
  const principales = VALEURS_FCH.filter((v) => v.principale).map((v) => v.nom);

  // LE HALL EST LA SECTION, et surtout pas le contenu d'une `.bloc` : au-delà de
  // 60 rem, `.bloc ul` passe toute liste en grille de 21 rem et `.bloc li`
  // dessine chaque ligne comme une carte — les créneaux et les repères
  // s'écartaient et s'indentaient dans leur porte. Le hall des partenaires vit
  // déjà hors des blocs, et c'est pour la même raison.
  return `<section class="fch-hall" aria-label="Le club">
    ${porte('#hermitage/commissions', 'Les organigrammes', `${Object.keys(PERSONNES).length} personnes`,
      `<span class="fch-hall-quoi">${bureau.length} au bureau, ${commissions.length} commissions,
         ${equipes.length} équipes et leur encadrement</span>`,
      visagesDuClub(6))}

    ${porte('#hermitage/projet-club', 'Le projet du club', `${OBJECTIFS_FCH.length} objectifs`,
      `<span class="fch-hall-phrase">${echapper(MISSION_FCH.phrase)}</span>
       <span class="fch-hall-mots">${mots(principales, 3)}</span>`)}

    ${porte('#hermitage/entrainements', 'Les entraînements', `${creneaux} créneaux`,
      prochain
        // LE JOUR SE LIT AVANT SES CRÉNEAUX : mis en dessous, on lisait trois
        // horaires sans savoir de quel jour ils parlaient, puis le jour après
        // coup — c'est le sujet qui arrivait après son complément.
        ? `<span class="fch-hall-quoi">${echapper(prochain.quand)}${prochain.creneaux.length > 3
             ? `, et ${prochain.creneaux.length - 3} autre${prochain.creneaux.length > 4 ? 's' : ''}`
             : ''}</span>
           <ul class="fch-hall-lots">${prochain.creneaux.slice(0, 3).map(([categorie, lieu, heure]) => `<li>
            <span>${echapper(`${categorie} · ${lieu}`)}</span>
            <span class="fch-hall-compte">${echapper(heure)}</span></li>`).join('')}</ul>`
        : '<span class="fch-hall-quoi">Aucun créneau déclaré.</span>')}

    ${porte('#hermitage/chiffres', 'Le club en chiffres', `${REPERES.length} repères`,
      `<ul class="fch-hall-lots">${REPERES.slice(0, 3).map(([chiffre, quoi]) => `<li>
          <span>${echapper(courtRepere(quoi))}</span>
          <span class="fch-hall-compte">${echapper(chiffre)}</span></li>`).join('')}</ul>`)}

    ${porteDesReunions(etat)}
    ${porte('#hermitage/evenements', 'Les évènements', `${EVENEMENTS_CLUB.length}`, '<span class="fch-hall-quoi">La saison 2026/2027, la communication de chaque évènement et son rétroplanning.</span>')}
  </section>`;
}

// LA PORTE DES RÉUNIONS. Ce qu'on ignore avant de l'ouvrir : quand tombe la
// prochaine, et ce qui reste à tenir de la dernière. Son compte est celui des
// ACTIONS OUVERTES et non des réunions : le nombre de réunions passées ne
// demande rien à personne, une action qui attend si.
function porteDesReunions(etat) {
  const reunions = (etat.evenements ?? []).filter(estReunion);
  const maintenant = new Date();
  const prochaine = reunions
    .filter((e) => finDeLaSortie(e) >= maintenant)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0];
  // À DÉFAUT DE PROCHAINE, LA DERNIÈRE TENUE. « Aucune réunion au calendrier »
  // était vrai et inutile : il y en avait deux, derrière la porte, et le compte
  // à côté le disait déjà — deux lignes qui se contredisent dans la même tuile.
  const derniere = reunions
    .filter((e) => finDeLaSortie(e) < maintenant)
    .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))[0];
  const dite = prochaine ?? derniere;
  const ouvertes = (etat.actionsClub ?? []).filter((action) => action.statut !== 'fait');
  return porte('#hermitage/reunions', 'Les réunions',
    ouvertes.length ? `${ouvertes.length} à tenir` : `${reunions.length}`,
    `${dite
      ? `<span class="fch-hall-phrase">${echapper(dite.titre)}</span>
         <span class="fch-hall-quoi">${prochaine ? '' : 'La dernière · '}${
           echapper(REUNION_OBJETS[dite.reunion_objet] ?? 'Réunion')}
           · ${echapper(momentLisible(new Date(dite.date_debut)))}</span>`
      : '<span class="fch-hall-quoi">Aucune réunion notée.</span>'}
     ${ouvertes.length
      ? `<ul class="fch-hall-lots">${ouvertes.slice(0, 2).map((action) => `<li>
          <span>${echapper(action.titre)}</span>
          <span class="fch-hall-compte">${echapper(action.responsable ?? '')}</span></li>`).join('')}</ul>`
      : ''}`);
}

function vueClub(etat) {
  const vue = etat.vue ?? 'club';
  const personne = etat.personneClub ?? null;
  const contenus = {
    'commissions': () => construireOrganigramme(personne),
    'projet-club': () => construireProjetClub(personne),
    'evenements': () => construireEvenementsClub(personne, etat.publications, RESEAUX_FCH, FORMATS,
      // La GALERIE des évènements n'a pas de calendrier — il n'y a rien à
      // programmer devant neuf portes. Seule la fiche d'un évènement en porte un.
      personne ? { vue: etat.vueEvenement, ancre: etat.ancreEvenement, enMain: etat.ideeEnMain } : null),
    'entrainements': () => construireEntrainements(),
    'chiffres': () => `    <section class="bloc bloc-discret">
      <h2>Le club en chiffres</h2>
        <ul class="club-reperes">${REPERES.map(
          ([chiffre, quoi]) => `
          <li>
            <span class="club-chiffre chiffre">${echapper(chiffre)}</span>
            <span class="club-quoi">${echapper(quoi)}</span>
          </li>`,
        ).join('')}</ul>
    </section>`
  };
  // PAS DE PHRASE D'INTRODUCTION : « les personnes, le projet et les repères du
  // FC Hermitage » nommait les portes qu'on a juste en dessous, et une porte qui
  // MONTRE ce qu'il y a derrière n'a plus besoin qu'on l'annonce. C'est la forme
  // des deux autres halls du hub — `#perso` et celui des partenaires.
  return `${enTete(vue, personne)}${vue === 'club'
    ? hallDuClub(etat)
    : `${contenus[vue]()}<a class="lien-discret" href="#hermitage/club">← Le club</a>`}${vue === 'evenements' ? fenetreIdee(etat) : ''}${pied()}`;
}

// Habillage commun des sections : le titre reste au-dessus de la surface.
// Déplacer les nœuds conserve les champs, identifiants et gestes délégués.
//
// UNE SECTION PEUT REFUSER LA SURFACE (`fch-sans-tuile`, 16 septembre 2026,
// demande de Noé sur la galerie des partenaires : « enlève la tuile de fond,
// il faut que chaque tuile d'entreprise soit indépendante »). Une section qui
// ne porte QUE des tuiles n'a rien à poser dessous : les deux surfaces sont le
// même `--fond-carte`, et la galerie disparaissait dans son propre fond —
// vingt entreprises se lisaient comme un seul bloc. Le titre, lui, s'habille
// quand même : il reste le nom de la section, tuile ou pas.
function habillerLesSections(section) {
  for (const bloc of section.querySelectorAll(':scope > section.bloc:not(.fch-portes)')) {
    if (bloc.classList.contains('fch-tuile') || bloc.querySelector(':scope > .fch-tuile')) continue;
    const titre = bloc.querySelector(':scope > h2');
    titre?.classList.add('titre-section');
    if (bloc.classList.contains('fch-sans-tuile')) continue;
    const tuile = document.createElement('div');
    tuile.className = 'fch-tuile';
    for (const noeud of [...bloc.childNodes]) {
      if (noeud !== titre) tuile.append(noeud);
    }
    bloc.append(tuile);
  }
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    monterLeMenu(() => section.querySelector('.fch-nav'), {
      rubriques: RUBRIQUES_FCH,
      id: 'menu-fch',
      classe: 'menu-voile-fch',
      chemin: cheminDuMenu,
      poserLeBouton: false,
    });
    const etat = {
      objectifs: [],
      victoires: [],
      publications: [],
      taches: [],
      evenements: [],
      partenaires: [],
      partenairesSuivi: [],
      partenaireOuvert: null,
      // Le retrait d'un engagement demande un second appui : il ne se défait pas.
      engagementAConfirmer: null,
      // Les séries du club : c'est ce qui permet à « La saison » de dire quels
      // rythmes tournent. Petite table (4 lignes au 29 août 2026).
      series: [],
      fiches: [],
      actionsClub: [],
      // LES BLOCS REPLIÉS de la fiche d'une réunion (20 septembre 2026). De
      // l'état d'INTERFACE : il ne va pas au cache, et rouvrir le site retrouve
      // les blocs ouverts. Il existe parce que cocher une action du suivi
      // redessine la fiche — sans lui, le `<details>` se rouvrirait à chaque
      // coche, au moment précis où l'on s'en sert.
      plis: {},
      // LE POINT DE L'ORDRE DU JOUR qu'on est en train de modifier (20
      // septembre 2026). De l'état d'INTERFACE, comme les plis : il ne va pas
      // au cache, et rouvrir la fiche repart du formulaire vide.
      pointEnEdition: null,
      modelesPrepa: [],
      // La publication ouverte en fenêtre d'édition, sur Créer.
      ideeOuverte: null,
      vue: 'accueil',
      // La fiche de réunion ouverte : son id vient de l'adresse
      // (#hermitage/reunions/<id>), jamais d'un état d'interface.
      reunionOuverte: null,
      // L'identifiant d'un cap ou d'un projet ouvert, ou l'étage de la galerie.
      capOuvert: null,
      // LE CALENDRIER D'UN ÉVÈNEMENT a sa vue et son ancre À LUI, jamais celles
      // de la page Calendrier : programmer la com de la pétanque ne doit pas
      // déplacer le mois qu'on regardait dans l'autre onglet. C'est déjà la règle
      // de la page d'un projet. `enMain` est l'idée choisie au doigt.
      vueEvenement: 'mois',
      ancreEvenement: new Date(),
      ideeEnMain: null,
      // L'évènement sur lequel l'ancre a été calée : c'est ce qui distingue
      // « on vient d'arriver » de « on est déjà là ».
      evenementAncre: null,
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
      // LE JOUR OUVERT EN GRAND dans la vue semaine (20 septembre 2026). Il est
      // NUL le reste du temps, et c'est ce qui distingue « la semaine entière »
      // de « ce jour-là seul ».
      jourSemaineCal: null,
      // Le mot dit après une écriture qui a échoué. L'écran est déjà revenu en
      // arrière tout seul ; un geste défait en silence ressemble à une panne.
      souci: null,
    };

    // Déclarés ici parce que `rendre` s'en sert : les fonctions sont posées
    // plus bas, quand les écouteurs se branchent.
    let poserLEntreeClavier = null;
    let rafraichirLaCapture = null;

    let minuteurSouci = null;
    // RETENIR CE QUI EST REPLIÉ. `toggle` NE BULLE PAS — c'est pour ça que
    // l'écouteur est en CAPTURE, posé une fois sur la section plutôt que sur
    // chaque `<details>` : ceux-ci sont recréés à chaque rendu, et un écouteur
    // posé dessus mourrait avec eux.
    //
    // ON N'APPELLE PAS `rendre()` : le navigateur a déjà ouvert ou fermé le
    // bloc tout seul. Redessiner ne ferait que refaire ce qui est fait, en
    // perdant le focus au passage.
    section.addEventListener(
      'toggle',
      (evenement) => {
        const bloc = evenement.target;
        if (!bloc.dataset?.pli) return;
        etat.plis[bloc.dataset.pli] = !bloc.open;
      },
      true,
    );

    const dire = (message) => {
      etat.souci = message;
      rendre();
      clearTimeout(minuteurSouci);
      minuteurSouci = setTimeout(() => {
        etat.souci = null;
        rendre();
      }, 6000);
    };

    // QUEL MODULE POUR QUELLE VUE, et la route qu'il attend. Les pages du hub
    // rangent leur identifiant au NIVEAU DE LA VUE (`#objectif/<id>`) ; le site
    // le porte un cran plus bas (`#hermitage/objectif/<id>`), et c'est ici qu'on
    // traduit — plutôt que d'apprendre une seconde forme d'adresse à quatre
    // modules qui n'ont pas à connaître le site.
    const monterLeCap = () => {
      const hote = section.querySelector('[data-hote-cap]');
      if (!hote) return;

      if (etat.vue === 'taches') return pageTaches.monter(hote, { vue: ESPACE_DU_HUB });
      if (etat.vue === 'objectif') return pageObjectif.monter(hote, { vue: etat.capOuvert });
      if (etat.vue === 'projet') return pageProjet.monter(hote, { vue: etat.capOuvert });
      // La galerie, filtrée sur l'espace du site : `id` porte le filtre chez le
      // hub, et `vue` y choisit un étage. Le site les montre tous les trois quand
      // l'adresse n'en nomme aucun, et un seul quand elle le fait — l'étage vit
      // au TROISIÈME segment ici (`#hermitage/cap/projets`), là où le routeur
      // range déjà l'identifiant d'une page. Un nom d'étage inconnu ne casse
      // rien : la galerie retombe sur ses trois étages.
      return pageDuCap.monter(hote, { id: ESPACE_DU_HUB, vue: etat.capOuvert });
    };

    // OUVRIR UN JOUR NE REDESSINE RIEN, et c'est toute la finesse du geste : la
    // grille est déjà la bonne, on ne fait qu'y changer la largeur des sept
    // colonnes — de `1fr` à `0fr` pour les six autres —, et c'est le navigateur
    // qui fait glisser les traits d'une largeur à l'autre. Un `rendre()` ici
    // couperait l'animation net, faute d'un état de départ à interpoler. C'est
    // la mécanique de l'accueil du hub, reprise au trait près.
    const viserLeJourCal = (cle) => {
      etat.jourSemaineCal = cle;
      const grille = section.querySelector('[data-bloc="calendrier"] .cal-semaine');
      if (!grille) return;
      grille.classList.toggle('cal-un-jour', Boolean(cle));
      grille.style.setProperty('--cal-colonnes', colonnesDeLaSemaine(etat.ancreCal, cle));

      // LES FLÈCHES RESTENT DANS LA SEMAINE AFFICHÉE : au-delà du dimanche il
      // faudrait changer de semaine, et la semaine qu'on regarde ne serait plus
      // celle qu'on a ouverte. Aux deux bouts, la flèche s'ÉTEINT plutôt que de
      // ne rien faire — un bouton qui ne répond pas ressemble à une panne.
      const jours = [...grille.querySelectorAll('[data-ouvrir-jour]')].map(
        (bouton) => bouton.dataset.ouvrirJour,
      );
      const rang = cle ? jours.indexOf(cle) : -1;
      const fleche = (pas) => grille.querySelector(`[data-jour-pas="${pas}"]`);
      if (fleche(-1)) fleche(-1).disabled = rang <= 0;
      if (fleche(1)) fleche(1).disabled = rang < 0 || rang >= jours.length - 1;
    };

    const rendre = () => {
      if (['creer', 'saison', 'editorial', 'banque', 'publications'].includes(etat.vue)) section.innerHTML = vueCreer(etat);
      else if (['reunions', 'actions', 'archives'].includes(etat.vue)) section.innerHTML = vueReunions(etat);
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'partenaires') section.innerHTML = vuePartenaires(etat);
      else if (['club', 'commissions', 'projet-club', 'entrainements', 'chiffres', 'evenements'].includes(etat.vue)) {
        section.innerHTML = vueClub(etat);
        // LA PAGE D'UN PROJET DU CLUB se monte dans son hôte (20 septembre
        // 2026) : elle lit deux tables à elle et pose ses propres écouteurs.
        // C'est la mécanique des écrans du cap — `rendre` recrée l'hôte à chaque
        // passage, donc les écouteurs ne se doublent pas.
        const hoteProjet = section.querySelector('[data-hote-projet-club]');
        const declare = hoteProjet ? projetDeclare(etat.personneClub) : null;
        if (hoteProjet && declare) pageProjetDuClub.monter(hoteProjet, declare);
      }
      // LES ÉCRANS DU CAP : le site ne pose que le cadre, le module du hub écrit
      // dans l'hôte et y pose SES écouteurs, son propre chargement et son propre
      // « + ». Le site n'ajoute donc rien par-dessus — d'où le `return` sec.
      else if (VUES_DU_CAP.includes(etat.vue)) {
        section.innerHTML = vueDuCap(etat);
        monterLeCap();
        return;
      }
      else section.innerHTML = vueAccueil(etat);
      habillerLesSections(section);

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

      centrerActif(section.querySelector('.filtres'));
      // Le HTML redessiné porte déjà ses colonnes et sa classe ; restent les
      // flèches, qui savent seules aux deux bouts qu'elles sont éteintes.
      if (etat.jourSemaineCal) viserLeJourCal(etat.jourSemaineCal);
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
      etat.personneClub = nouvelleRoute?.id ?? null;
      etat.partenaireOuvert = nouvelleRoute?.id ?? null;
      etat.ideeOuverte = null;
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      // L'adresse porte l'id d'une FICHE — mais le bandeau de l'accueil, lui,
      // ne connaît que l'ÉVÉNEMENT : il n'a pas les préparations sous la main.
      // On accepte donc les deux, et l'événement se résout en sa fiche
      // (29 août 2026). Sans ça, « Écrire le bilan » ouvrirait la liste.
      etat.reunionOuverte =
        etat.vue === 'reunions' ? ficheDeLAdresse(nouvelleRoute?.id ?? null) : null;
      // LES ÉCRANS DU CAP rangent leur identifiant au NIVEAU DE LA VUE chez le
      // hub (`#objectif/<id>`) ; le site le porte un cran plus bas
      // (`#hermitage/objectif/<id>`), et c'est le routeur qui le lit — c'est la
      // même case que celle d'une fiche de réunion ou d'une personne du club.
      // Pour la galerie, cet identifiant est un ÉTAGE (`#hermitage/cap/projets`).
      etat.capOuvert = VUES_DU_CAP.includes(etat.vue) ? nouvelleRoute?.id ?? null : null;
      // L'ANCRE S'OUVRE SUR LE MOIS DE L'ÉVÈNEMENT, et c'est tout l'intérêt : la
      // com du Tournoi Rose se prépare autour du 17 octobre, pas autour
      // d'aujourd'hui. Sans ça, on arriverait sur le mois courant et il faudrait
      // avancer de trois crans avant de voir la date qu'on vient préparer.
      // Elle ne se repose QU'EN CHANGEANT d'évènement : revenir sur la fiche
      // après avoir promené la grille ne doit pas défaire ce qu'on regardait.
      if (etat.vue === 'evenements' && nouvelleRoute?.id && nouvelleRoute.id !== etat.evenementAncre) {
        const jour = dateDeLEvenement(EVENEMENTS_CLUB.find((e) => e.id === nouvelleRoute.id) ?? {});
        etat.ancreEvenement = jour ?? new Date();
        etat.vueEvenement = 'mois';
        etat.evenementAncre = nouvelleRoute.id;
      }
      // Ce qu'on tenait en main ne survit pas au changement de page : garder une
      // idée choisie sur un écran où l'on ne peut plus la poser est un piège.
      if (etat.vue !== 'evenements') etat.ideeEnMain = null;
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
        fiches, actionsClub, modeles, projets, series, partenairesSuivi,
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
        api.partenairesDeLaSaison(),
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
        partenairesSuivi,
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

    // PROGRAMMER UNE IDÉE : lui donner un jour, et la retirer de la main.
    //
    // L'ÉCRITURE EST OPTIMISTE (`modifierAussitot`) : l'idée quitte la colonne et
    // apparaît sur la grille sans attendre l'aller-retour. Si l'écriture échoue,
    // l'état d'avant revient ET une ligne le dit — sans ce retour en arrière,
    // l'affichage optimiste est un mensonge.
    const programmerLIdee = async (id, jour) => {
      const pub = etat.publications.find((candidat) => candidat.id === id);
      if (!pub) return;
      etat.ideeEnMain = null;
      await modifierAussitot(
        pub,
        { date_prevue: jour },
        () => api.modifierPublication(pub.id, { date_prevue: jour }),
        { rendre, echouer: () => dire("La date n'a pas pu être enregistrée.") },
      );
    };

    // UN JOUR TOUCHÉ FAIT DEUX CHOSES, jamais les deux à la fois : il POSE
    // l'idée qu'on a en main s'il y en a une, sinon il OUVRE la tuile. C'est la
    // règle de « Ma semaine », au mot près — et les deux passent par le MÊME
    // geste, parce que la sélection appelle `preventDefault` au poser du doigt et
    // avalerait le clic sur lequel un second chemin se serait appuyé.
    brancherSelection(section, ({ debut, fin }) => {
      if (etat.ideeEnMain) {
        programmerLIdee(etat.ideeEnMain, debut);
        return;
      }
      etat.detailCal = null;
      // DEPUIS LA FICHE D'UN ÉVÈNEMENT, ce qu'on pose est une PUBLICATION et elle
      // arrive DÉJÀ RATTACHÉE à sa rubrique : c'est la règle du « + » de la page
      // d'un projet — ce qu'on note depuis la page d'une chose sert cette chose.
      // Ailleurs, le défaut du site reste ce que les filtres disent.
      const evenement = etat.vue === 'evenements' && etat.personneClub
        ? EVENEMENTS_CLUB.find((item) => item.id === etat.personneClub)
        : null;
      etat.creationCal = evenement
        ? { debut, fin, nature: 'publication', rubrique: rubriqueEvenement(evenement) }
        : { debut, fin, nature: natureParDefaut(etat.natures) };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });

    // GLISSER UNE IDÉE DE LA COLONNE VERS UN JOUR, à la souris. La mécanique vit
    // dans `calendrier-commun.js` depuis le 16 septembre 2026 — elle était écrite
    // trois fois ailleurs, et la recopier ici en aurait fait un quatrième
    // exemplaire. L'écran ne dit que ce qu'il pose.
    brancherPriseEnMain(section, (cle, jour) => {
      const [, id] = cle.split(':');
      programmerLIdee(id, jour);
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
    section.addEventListener('input', (evenement) => {
      if (evenement.target.matches('[data-recherche-organigramme]')) {
        rechercherOrganigramme(section, evenement.target.value);
      }
    });

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

    // AJOUTER CE QU'ON A PROMIS EN PLUS. C'est la moitié du suivi : les
    // conditions sont souvent ajustées — une entreprise prend un pack et obtient
    // en plus le naming d'un tournoi, ou échange une ligne contre une autre. La
    // ligne naît en `ajout`, ce qui la distingue de ce que le dossier prévoit.
    //
    // CES EXEMPLES RESTENT VAGUES À DESSEIN : ce fichier part sur GitHub Pages.
    // Les noms d'entreprises et les montants convenus vivent en base, pas ici.
    section.addEventListener('submit', async (evenement) => {
      const ajout = evenement.target.closest('form[data-ajouter-engagement]');
      if (!ajout) return;
      evenement.preventDefault();
      const libelle = new FormData(ajout).get('libelle')?.toString().trim();
      if (!libelle) return;
      const id = ajout.dataset.ajouterEngagement;
      const partenaire = etat.partenairesSuivi.find((p) => p.id === id);
      if (!partenaire) return;
      try {
        const ligne = await api.ajouterEngagement({
          partenaire_id: id, cle: null, libelle, origine: 'ajout',
        });
        partenaire.engagements = [...(partenaire.engagements ?? []), ligne];
        ajout.reset();
        rendre();
      } catch (souci) {
        console.error('Engagement non ajouté', souci);
        dire("L'engagement n'a pas pu être ajouté.");
      }
    });

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

    // POSER (OU DÉPLACER) LA RÉUNION SUIVANTE, d'après le `cr_suivi` du
    // compte-rendu (20 septembre 2026, demande de Noé).
    //
    // C'EST LA RÈGLE DU HUB À LA LETTRE : « ce qu'il a DÉCLARÉ devient une
    // vraie ligne ». Poser une date de prochain point de contrôle est une
    // déclaration — personne ne la devine —, elle donne donc un VRAI évènement,
    // qui se déplace, se prépare, porte sa fiche et apparaît au calendrier.
    //
    // REJOUABLE, comme le rattrapage des séries et celui des tâches d'un
    // évènement : réenregistrer le compte-rendu ne pose pas une seconde
    // réunion. La suite se reconnaît à son `suite_de_id`, et l'on DÉPLACE au
    // lieu de recréer — sans quoi la fiche qu'on aurait déjà préparée pour elle
    // se retrouverait accrochée à un fantôme.
    //
    // ON NE SUPPRIME JAMAIS, et c'est une règle du hub, pas une paresse :
    // effacer la date d'un compte-rendu laisse la réunion au calendrier. Elle a
    // pu recevoir une fiche, des actions, une préparation ; « le hub ne
    // supprime pas ce que Noé pourrait vouloir voir ». Il la retire lui-même au
    // calendrier, où ce geste existe et demande confirmation.
    //
    // SANS ÉVÈNEMENT, PAS DE SUITE : une fiche sans réunion n'a ni heure, ni
    // objet, ni chaîne à prolonger. Le cas est marginal — une fiche naît
    // toujours d'un évènement — mais il ne doit pas fabriquer un rendez-vous
    // orphelin à minuit.
    async function poserLaSuite(fiche) {
      const mere = etat.evenements.find((e) => e.id === fiche.evenement_id);
      if (!mere || !fiche.cr_suivi) return;

      // L'HEURE ET LA DURÉE SONT CELLES DE LA PRÉCÉDENTE : un cycle de réunions
      // garde son créneau, et le compte-rendu ne demande qu'un JOUR. Lui
      // inventer 9 h du matin serait poser un horaire que personne n'a dit.
      const debutMere = new Date(mere.date_debut);
      const debut = depuisDateISO(fiche.cr_suivi);
      debut.setHours(debutMere.getHours(), debutMere.getMinutes(), 0, 0);
      const duree = mere.date_fin ? new Date(mere.date_fin) - debutMere : null;
      const fin = duree ? new Date(debut.getTime() + duree) : null;

      const suite = suiteDeLaReunion(etat.evenements, mere.id);

      try {
        if (suite) {
          // LE TITRE NE SE RÉÉCRIT PAS en déplaçant : Noé a pu le corriger, et
          // une date changée n'est pas une raison de lui reprendre son mot.
          if (new Date(suite.date_debut).getTime() === debut.getTime()) return;
          const champs = { date_debut: debut.toISOString() };
          if (fin) champs.date_fin = fin.toISOString();
          Object.assign(suite, await api.modifierEvenement(suite.id, champs));
          return;
        }

        const posee = await api.creerEvenement({
          espace: ESPACE,
          titre: titreDeLaSuite(etat.evenements, mere),
          date_debut: debut.toISOString(),
          date_fin: fin ? fin.toISOString() : null,
          lieu: mere.lieu ?? null,
          // L'OBJET SUIT, ET L'ANIMATION AUSSI : c'est le même cycle de
          // réunions. Ce sont deux pastilles qu'on décoche en un geste si la
          // suivante change de nature ; les deviner autrement demanderait de
          // poser une question à un moment où l'on écrit un compte-rendu.
          reunion_objet: mere.reunion_objet,
          reunion_animee: mere.reunion_animee,
          suite_de_id: mere.id,
        });
        etat.evenements.push(posee);
      } catch (souci) {
        // ON LE DIT, ET LE COMPTE-RENDU RESTE ENREGISTRÉ : il est déjà parti,
        // et le perdre parce qu'une seconde écriture a échoué serait le pire
        // des deux maux.
        console.error('Réunion suivante impossible', souci);
        dire("Le compte-rendu est enregistré, mais la réunion suivante n'a pas pu être posée.");
      }
    }

    async function appliquer(action, champs) {
      // La tuile du « + » : tout passe par le circuit commun, espace fch.
      if (action === 'creer-depuis-calendrier') {
        // LA RUBRIQUE SE POSE À L'ÉCRITURE, PAS DANS LA TUILE. Celle-ci n'a pas
        // de champ rubrique, et lui en ajouter un pour ce seul besoin l'aurait
        // posé aux quatre espaces — c'est déjà l'argument qui a tenu « La saison »
        // hors du « + » le 29 août. **C'est l'ÉCRAN qui sait ce qu'il crée** :
        // une publication posée depuis la fiche d'un évènement sert cet
        // évènement, sans quoi elle naîtrait orpheline et n'apparaîtrait ni dans
        // sa colonne, ni sur son calendrier, ni dans son compte.
        const rubrique = etat.creationCal?.rubrique;
        await poserAuCalendrier(
          rubrique && champs.nature === 'publication' ? { ...champs, rubrique } : champs,
          { espaceParDefaut: ESPACE },
        );
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

      // POSER OU CORRIGER, selon que le formulaire porte un `point_id` : c'est
      // l'ENVOI qui le sait, pas la tuile. Même formulaire, mêmes champs — deux
      // chemins séparés auraient fini par ne plus demander la même chose.
      if (action === 'ajouter-point-reunion') {
        const fiche = etat.fiches.find((f) => f.id === champs.fiche_id);
        if (!fiche) return;

        const valeurs = {
          titre: champs.titre.trim(),
          type_point: champs.type_point || null,
          minutes: Number(champs.minutes) || null,
          sortie: champs.sortie?.trim() || null,
        };

        if (champs.point_id) {
          const point = fiche.points.find((candidat) => candidat.id === champs.point_id);
          if (point) {
            Object.assign(point, await api.modifierPointReunion(champs.point_id, valeurs));
          }
          // ON REFERME L'ÉDITION, sans quoi le formulaire reviendrait ouvert et
          // rempli au rendu suivant — par-dessus ce qu'on vient d'enregistrer.
          // C'est le défaut que `#objectifs` a rencontré le premier.
          etat.pointEnEdition = null;
          rendre();
          return;
        }

        fiche.points.push(
          await api.ajouterPointReunion({
            fiche_id: champs.fiche_id,
            ...valeurs,
            ordre: fiche.points.length + 1,
          }),
        );
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
        await poserLaSuite(fiche);
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

      // L'OFFRE FAIT NAÎTRE SES ENGAGEMENTS, et c'est tout l'intérêt : prendre
      // un pack, c'est s'engager à une liste de choses, qu'on n'a pas à
      // retaper. Ce qui a été négocié en plus s'ajoute ensuite à la main, sur
      // la fiche — et se reconnaît à son origine.
      if (action === 'creer-partenaire') {
        const partenaire = await api.creerPartenaire(
          {
            nom: champs.nom.trim(),
            saison: SAISON_PARTENAIRES,
            offre: champs.offre || null,
            nature: offreDe(champs.offre)?.nature ?? 'autre',
            montant: champs.montant ? Number(champs.montant) : null,
            statut: champs.statut || 'virement_attendu',
            commune: champs.commune?.trim() || null,
            referents: champs.referents?.trim() || null,
            cerfa: champs.cerfa?.trim() || null,
            notes: champs.notes?.trim() || null,
          },
          engagementsDeLOffre(champs.offre),
        );
        etat.partenairesSuivi = [...etat.partenairesSuivi, partenaire]
          .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        rendre();
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

      // LA JOURNÉE OUVERTE EN PLACE : le titre du jour l'ouvre en grand et le
      // referme si c'est déjà lui — **on sort par où on est entré**, sans avoir
      // à chercher une autre commande. Les flèches passent au jour voisin.
      //
      // ELLES VIENNENT AVANT LE RESTE, et ce n'est pas indifférent : le geste
      // du jour touché (`brancherSelection`) pose une tuile de capture, et
      // l'en-tête est assez proche de la case pour qu'un doigt les rapproche.
      // L'ordre dit lequel gagne.
      const pasDeJourCal = evenement.target.closest('[data-jour-pas]');
      if (pasDeJourCal && etat.jourSemaineCal) {
        const vise = versDateISO(
          ajouterJours(depuisDateISO(etat.jourSemaineCal), Number(pasDeJourCal.dataset.jourPas)),
        );
        if (section.querySelector(`[data-ouvrir-jour="${vise}"]`)) viserLeJourCal(vise);
        return;
      }

      const enteteDuJour = evenement.target.closest('[data-ouvrir-jour]');
      if (enteteDuJour) {
        const cle = enteteDuJour.dataset.ouvrirJour;
        viserLeJourCal(cle === etat.jourSemaineCal ? null : cle);
        return;
      }

      // LA BARRE DE PÉRIODE SERT DEUX GRILLES, et c'est l'ÉCRAN qui dit
      // laquelle : la page Calendrier a la sienne, la fiche d'un évènement la
      // sienne. Un seul couple vue/ancre pour les deux ferait qu'ouvrir la
      // pétanque déplacerait le mois qu'on regardait dans l'autre onglet.
      const surUnEvenement = etat.vue === 'evenements' && Boolean(etat.personneClub);
      const litLaVue = () => (surUnEvenement ? etat.vueEvenement : etat.vueCal);

      const vueCal = evenement.target.closest('[data-vue-cal]');
      if (vueCal) {
        if (surUnEvenement) etat.vueEvenement = vueCal.dataset.vueCal;
        else etat.vueCal = vueCal.dataset.vueCal;
        // UN JOUR OUVERT NE SURVIT NI AU CHANGEMENT DE VUE NI AU CHANGEMENT DE
        // SEMAINE : il désigne une DATE, et la semaine d'à côté ne la contient
        // pas. Elle rouvrirait donc sur rien — six colonnes à zéro et une
        // septième vide —, ce qui a tout l'air d'un écran cassé.
        etat.jourSemaineCal = null;
        rendre();
        return;
      }

      const periode = evenement.target.closest('[data-periode]');
      if (periode) {
        const sens = Number(periode.dataset.periode);
        // 0 = « Aujourd'hui » : on ne se perd jamais longtemps dans un calendrier.
        const ancre = surUnEvenement ? etat.ancreEvenement : etat.ancreCal;
        const neuve = sens === 0 ? new Date() : deplacerAncre(ancre, litLaVue(), sens);
        if (surUnEvenement) etat.ancreEvenement = neuve;
        else etat.ancreCal = neuve;
        etat.jourSemaineCal = null;
        rendre();
        return;
      }

      // PRENDRE UNE IDÉE EN MAIN, puis toucher un jour. C'est le chemin TACTILE
      // de « Ma semaine » et de la page d'un projet : sur une liste verticale, un
      // glissement au doigt ne se distingue pas d'un défilement. Il marche aussi
      // à la souris, et c'est voulu — un second appui repose l'idée, car un choix
      // qu'on ne peut pas défaire est un piège.
      const choisir = evenement.target.closest('[data-choisir]');
      if (choisir) {
        const id = choisir.dataset.choisir;
        etat.ideeEnMain = etat.ideeEnMain === id ? null : id;
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

      // ── Le suivi des partenaires ────────────────────────────────────────
      // COCHER, C'EST POSER UNE DATE. L'écriture est optimiste : la coche se
      // dessine tout de suite, le réseau suit. Si elle échoue, la ligne revient
      // à son état d'avant ET un mot le dit — un geste défait en silence
      // ressemble à une panne.
      const basculer = evenement.target.closest('[data-basculer-engagement]');
      if (basculer) {
        const id = basculer.dataset.basculerEngagement;
        const partenaire = etat.partenairesSuivi.find(
          (p) => (p.engagements ?? []).some((e) => e.id === id),
        );
        const ligne = partenaire?.engagements.find((e) => e.id === id);
        if (!ligne) return;
        const fait = !ligne.fait_le;
        await modifierAussitot(
          ligne,
          { fait_le: fait ? new Date().toISOString().slice(0, 10) : null },
          () => api.marquerEngagement(id, fait),
          { rendre, echouer: dire },
        );
        return;
      }

      // Retirer un engagement : premier appui, la croix devient « Retirer ? » ;
      // second appui, la ligne part. Un clic ailleurs annule — c'est le geste
      // des menus discrets du hub.
      const retirer = evenement.target.closest('[data-retirer-engagement]');
      if (retirer) {
        const id = retirer.dataset.retirerEngagement;
        if (etat.engagementAConfirmer !== id) {
          etat.engagementAConfirmer = id;
          rendre();
          return;
        }
        etat.engagementAConfirmer = null;
        const partenaire = etat.partenairesSuivi.find(
          (p) => (p.engagements ?? []).some((e) => e.id === id),
        );
        const ligne = partenaire?.engagements.find((e) => e.id === id);
        if (!ligne) return;
        await retirerAussitot(
          partenaire.engagements,
          ligne,
          () => api.supprimerEngagement(id),
          { rendre, echouer: dire },
        );
        return;
      }
      if (etat.engagementAConfirmer) {
        etat.engagementAConfirmer = null;
        rendre();
      }

      // L'ÉTAT D'UN PARTENAIRE SE CHANGE SUR PLACE (16 septembre 2026, demande
      // de Noé) : « partenaire du club » ou « virement en attente », depuis la
      // galerie comme depuis la fiche. Le menu se referme dans tous les cas —
      // même sur l'état déjà posé : un menu qui reste ouvert après un choix
      // donne l'impression que le geste n'a pas été reçu.
      const etatPartenaire = evenement.target.closest('[data-etat-partenaire]');
      if (etatPartenaire) {
        fermerLesChoix(section);
        const { etatPartenaire: statut, partenaire: id } = etatPartenaire.dataset;
        const partenaire = etat.partenairesSuivi.find((p) => p.id === id);
        if (!partenaire || partenaire.statut === statut) {
          if (partenaire) rendre();
          return;
        }
        await modifierAussitot(
          partenaire,
          { statut },
          () => api.modifierPartenaire(id, { statut }),
          { rendre, echouer: dire },
        );
        return;
      }
      // Un clic ailleurs referme le menu : c'est le geste attendu. La garde
      // porte sur le GROUPE et non sur le déclencheur, pour ne pas refermer
      // dans le même clic celui que `brancherCapture` vient d'ouvrir.
      if (!evenement.target.closest('[data-choix-champ]')) fermerLesChoix(section);

      // LA TUILE ENTIÈRE MÈNE À LA FICHE, mais l'écouteur se retire dès que le
      // clic a touché quelque chose qui fait déjà quelque chose. LA LISTE DES
      // GESTES EST EXPLICITE, et non « tout ce qui a l'air cliquable » : un
      // sélecteur deviné sur le curseur marcherait ce soir et avalerait
      // silencieusement le prochain contrôle posé sur la tuile.
      const tuilePartenaire = evenement.target.closest('[data-tuile-partenaire]');
      if (tuilePartenaire && !evenement.target.closest(GESTES_TUILE)) {
        // Sélectionner un nom pour le copier n'est pas cliquer dessus.
        if (window.getSelection()?.toString()) return;
        location.hash = `#hermitage/partenaires/${tuilePartenaire.dataset.tuilePartenaire}`;
        return;
      }

      // TOUTE TUILE QUI MÈNE QUELQUE PART (16 septembre 2026, demande de Noé :
      // « simplement appuyer sur la tuile des tâches pour aller à toutes les
      // tâches »). C'est la MÊME mécanique que la tuile d'un partenaire juste
      // au-dessus, et que celle d'« Aujourd'hui » sur l'accueil du hub :
      //
      //   — PAS un lien qui enveloppe. La tuile des tâches porte une quinzaine
      //     de contrôles, et un `<button>` dans un `<a>` n'est ni valide ni
      //     cliquable ;
      //   — l'écouteur SE RETIRE dès que le clic a touché quelque chose qui fait
      //     déjà quelque chose, et `GESTES_TUILE` est une liste EXPLICITE : un
      //     sélecteur deviné sur le curseur marcherait ce soir et avalerait
      //     silencieusement le prochain contrôle posé sur la tuile ;
      //   — le TITRE porte le lien, sans en avoir l'air : un écouteur ne se
      //     tabule pas, et le clavier doit atteindre ce que la souris atteint.
      const tuileVers = evenement.target.closest('[data-tuile-vers]');
      if (tuileVers && !evenement.target.closest(GESTES_TUILE)) {
        if (window.getSelection()?.toString()) return;
        location.hash = tuileVers.dataset.tuileVers;
        return;
      }

      // La fiche d'un partenaire s'ouvre dans l'ADRESSE, pas dans un état :
      // un engagement qu'on vient de cocher se retrouve en revenant sur la page,
      // et le lien se partage.
      const ouvrirPartenaire = evenement.target.closest('[data-ouvrir-partenaire]');
      if (ouvrirPartenaire) {
        const id = ouvrirPartenaire.dataset.ouvrirPartenaire;
        location.hash = etat.partenaireOuvert === id
          ? '#hermitage/partenaires'
          : `#hermitage/partenaires/${id}`;
        return;
      }

      const ouvrirFiche = evenement.target.closest('[data-ouvrir-fiche]');
      if (ouvrirFiche) {
        location.hash = `#hermitage/reunions/${ouvrirFiche.dataset.ouvrirFiche}`;
        return;
      }

      // LES DEUX BOUTONS « TRAITÉ » ET « REPORTÉ » ONT QUITTÉ LA TUILE D'UN
      // POINT (20 septembre 2026, demande de Noé), et leur gestionnaire est
      // parti avec : plus rien ne l'appelait, et le garder aurait fait du code
      // mort qu'on recopie. Git en garde la trace.
      //
      // CE QUE ÇA RETIRE, ET IL FAUT LE DIRE : `fiches_reunion_points.statut`
      // ne se change plus nulle part. La colonne reste, et la carte de
      // l'accueil du club continue de la lire — elle montre « les trois points
      // qui restent », donc elle montrera désormais les trois PREMIERS, pour
      // toujours. *Si le geste manque, sa place est le menu discret de la
      // ligne, pas deux boutons dans la tuile.*
      // MODIFIER UN POINT EN TOUCHANT SA TUILE (20 septembre 2026, demande de
      // Noé). Le formulaire juste en dessous s'ouvre, rempli.
      //
      // LE NOM EST UN VRAI `<button>` ET LA TUILE UN ÉCOUTEUR : l'un pour le
      // clavier, l'autre pour le doigt. C'est la mécanique de la tuile
      // « Aujourd'hui » de l'accueil — *« un écouteur ne se tabule pas, et le
      // clavier doit atteindre ce que la souris atteint »*.
      //
      // LA CROIX EST EXCLUE, et tout ce qui fait déjà quelque chose avec :
      // sans cette garde, retirer un point ouvrirait d'abord son édition. La
      // liste est EXPLICITE plutôt que devinée sur le curseur — c'est la leçon
      // de la tuile de l'accueil, au mot près.
      const modifierPoint = evenement.target.closest('[data-modifier-point]');
      if (modifierPoint && !evenement.target.closest('a, input, select, textarea, [data-retirer-point]')) {
        // Une sélection de texte en cours n'est pas un appui : copier le nom
        // d'un point ne doit pas ouvrir son formulaire.
        if (!window.getSelection()?.toString()) {
          etat.pointEnEdition = modifierPoint.dataset.modifierPoint;
          rendre();
          // ON OUVRE LA TUILE VOLANTE, et le focus part dans le premier champ.
          // `gabarits.js` ne le fait que sur un clic du sommaire ; ici c'est
          // nous qui ouvrons. Le geste vient de l'utilisateur, donc le clavier
          // monte aussi sur iPhone — un focus posé hors d'un geste ne le lève
          // pas.
          const volante = section.querySelector('[data-ajout="fiche-point"]');
          if (volante) {
            volante.open = true;
            volante.querySelector('.champ-titre, input[name="titre"]')?.focus();
          }
          return;
        }
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

      // LE ROND D'UNE ACTION : fait ↔ à faire, l'aller-retour direct
      // (20 septembre 2026). Il ne passe PAS par `ACTION_SUIVANT` — le cycle à
      // trois crans est le geste de l'étiquette ; celui-ci répond à une seule
      // question, « est-ce fait ? », et il doit y répondre en un appui depuis
      // n'importe quel cran, « en cours » compris.
      //
      // DÉCOCHER REND « À FAIRE » et non « en cours » : on rouvre ce qu'on
      // avait fermé par erreur, on ne devine pas où ça en était.
      const cocherAction = evenement.target.closest('[data-cocher-action]');
      if (cocherAction) {
        const actionClub = etat.actionsClub.find(
          (candidat) => candidat.id === cocherAction.dataset.cocherAction,
        );
        if (!actionClub || estProvisoire(actionClub.id)) return;
        const statut = actionClub.statut === 'fait' ? 'a_faire' : 'fait';
        await modifierAussitot(
          actionClub,
          { statut },
          () => api.modifierActionClub(actionClub.id, { statut }),
          { rendre, echouer: dire },
        );
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
