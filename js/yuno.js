// Le SITE Yuno — le quartier général du photographe (docs/yuno-spec.md).
//
// À l'adresse #yuno, tout l'habillage du hub disparaît (voir styles.css) : ni
// « Hub », ni onglets, ni autres projets. On est chez Yuno, avec son chrome à
// lui. La page Yuno DU hub, elle, vit dans js/photo.js (#photo).
//
//   #yuno              l'accueil : l'invite, les compteurs, le mur de photos
//   #yuno/journal      le carnet de terrain : le mur entier et le fil des moments
//   #yuno/creer        l'atelier — banque d'idées et calendrier éditorial
//   #yuno/calendrier   tout ce qui a une date chez Yuno, avec filtres
//   #yuno/reseau       la Passerelle — l'onglet Réseau ouvre le rituel
//                      (refonte du 21 août 2026 : le palier-couloir a disparu,
//                      une sous-navigation relie les cinq pages du réseau)
//   #yuno/commandes    les commandes — leur page depuis la même refonte
//
// Une idée est une publication sans date : même table, deux vues.

import * as api from './api.js';
import {
  construireFormulaire,
  construireFenetre,
  construireObjectifs,
  CHEVRON,
} from './espace-projet.js';
import {
  STATUTS_YUNO,
  NOMS_STATUTS,
  construireBanque,
  construirePubliees,
  construireApercuCreation,
  corpsPublication,
} from './publications.js';
import {
  depuisDateISO,
  echeanceLisible,
  momentLisible,
  dateLongue,
  versDateISO,
  ajouterJours,
  echapper,
} from './format.js';
import {
  FORMATS,
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  construireBarrePeriode,
  construireGrille,
  fenetreCreation,
  fenetreDetail,
  fenetreJour,
  elementsDuJour,
  finDeLEvenement,
  brancherSelection,
  brancherClavier,
  brancherDeplacement,
  appliquerAuCalendrier,
  brancherCapture,
  champsApresDeplacement,
  deplacerAncre,
  toutesLesNatures,
  natureParDefaut,
  centrerActif,
  ongletCalendrier,
} from './calendrier-commun.js';
import { lireCache, ecrireCache } from './cache-session.js';
import { animerLaCoche } from './mouvements.js';
import {
  modifierAussitot,
  retirerAussitot,
  ajouterAussitot,
  identifiantProvisoire,
  estProvisoire,
} from './ecriture.js';
import { LOGOS_CLUBS } from './logos-clubs.js';
import {
  PHASES_PREPA,
  blocPhase,
  dernierBilan,
  feuilleDeLaSortie,
  boutonPreparer,
  finDeLaSortie,
  phaseDeLaSortie,
} from './preparations-commun.js';

// L'écusson d'un club, s'il en a un (demande de Noé, 15 août 2026). Les images
// sont dans le dépôt — jamais un CDN, comme les polices et supabase-js — et
// rapatriées par `tools/telecharger-logos.py`.
//
// Un club sans écusson ne laisse RIEN : pas de cadre vide, pas d'image cassée.
// La table générée dit avant de dessiner ce qui existe, et le nom du club porte
// déjà son identité — l'écusson la double, il ne la remplace pas. D'où
// `aria-hidden` : un lecteur d'écran lirait deux fois le même club.
// `grand` : 28 px en tête d'une fiche, où l'écusson tient compagnie au nom ;
// 20 px dans une liste, où il ne fait qu'accrocher l'œil. La taille vit en CSS
// (`.club-ecusson-grand`), les fichiers font 64 px et servent les deux.
export function ecussonDuClub(nom, { grand = false } = {}) {
  const fichier = LOGOS_CLUBS[nom];
  if (!fichier) return '';
  const cote = grand ? 28 : 20;
  return `<img class="club-ecusson${grand ? ' club-ecusson-grand' : ''}"
    src="img/clubs/${fichier}" alt="" aria-hidden="true" loading="lazy"
    width="${cote}" height="${cote}">`;
}

// Les rubriques de départ de Noé (7 août 2026). La liste reste libre : elle
// s'enrichira de son analyse du marché, plus tard.
export const RUBRIQUES_DEPART = [
  'Raw to edit',
  'Raw vs edit',
  'No accreditation, no problem',
  'Un mois en tant que photographe sportif',
];

// Les réseaux de Yuno. Facebook et YouTube existent en base pour le FCH, mais
// n'ont pas à encombrer ce formulaire-ci.
const RESEAUX_YUNO = { instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn' };

// --- Les quatre piliers ------------------------------------------------------
// La boussole éditoriale. Ils existent pour FERMER un débat, pas pour ajouter
// une contrainte : la question du matin devient binaire — « ça rentre dans un
// pilier ? oui → je crée » — au lieu de rouvrir la stratégie à chaque idée.

export const PILIERS = {
  1: { nom: 'Les Léopards & le foot africain', role: 'la portée' },
  2: { nom: 'Bord terrain', role: 'le portfolio' },
  3: { nom: "Dans l'œil du photographe", role: 'la conversion' },
  4: { nom: 'Carte blanche', role: 'la différence' },
};

function construirePiliers() {
  return `
    <div class="piliers">
      <ul class="liste-piliers">
        ${Object.entries(PILIERS)
          .map(
            ([rang, { nom, role }]) => `
          <li data-pilier="${rang}">
            <span class="pilier-rang chiffre">${rang}</span>
            <span class="pilier-nom">${echapper(nom)}</span>
            <span class="discret pilier-role">${echapper(role)}</span>
          </li>`,
          )
          .join('')}
      </ul>
      <p class="discret piliers-test">Plancher : 2 publications par semaine.
        Les stories restent une zone franche.</p>
    </div>`;
}

const VUES = [
  'accueil', 'journal', 'creer', 'banque', 'editorial',
  'calendrier', 'reseau', 'passerelle', 'vivier', 'messages', 'carnet', 'missions',
  'commandes', 'preparations', 'modeles',
];

// La banque est une pièce de l'atelier : elle n'a pas son onglet, elle garde
// celui de Créer allumé. Une barre de navigation ne doit pas grandir à chaque
// écran qu'on ajoute.
const ONGLET_DE_LA_VUE = {
  banque: 'creer',
  editorial: 'creer',
  passerelle: 'reseau',
  vivier: 'reseau',
  // Les modèles de messages : « messages » et non « modeles », déjà pris par
  // les modèles de préparation. Leur page est une arrière-boutique sans
  // entrée de navigation — elle garde l'onglet Réseau allumé, c'est de là
  // qu'on y vient.
  messages: 'reseau',
  carnet: 'reseau',
  // MISSIONS depuis le 21 août 2026 au soir (demande de Noé) : le travail
  // concret — préparer un événement, livrer une commande. L'onglet ouvre le
  // tableau de bord `#yuno/missions` (option A validée) ; `commandes` reste
  // une adresse qui y mène, et les préparations avec leurs modèles gardent
  // leur page à part entière.
  commandes: 'missions',
  preparations: 'missions',
  modeles: 'missions',
};

// --- Les trois mouvements du site --------------------------------------------
// Trois, et pas un de plus. Chacun sert à quelque chose : dire qu'on a changé
// de lieu, éviter que dix photos surgissent d'un coup, et faire d'un compteur
// un petit moment plutôt qu'une donnée.
// Tous passent par des transitions et des animations CSS, donc la règle
// `prefers-reduced-motion` de styles.css les neutralise déjà — sauf le comptage,
// qui est du JS et vérifie donc lui-même.

const MOUVEMENT_REFUSE = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Le fondu d'entrée d'une vue. `#vue` n'est pas recréé — seul son contenu
// change — donc l'animation ne repartirait pas toute seule : on retire la
// classe, on force un recalcul, on la remet.
function animerLEntreeDeLaVue(section) {
  if (MOUVEMENT_REFUSE()) return;
  section.classList.remove('vue-entre');
  void section.offsetWidth;
  section.classList.add('vue-entre');

  // La classe part dès l'animation finie, et ce n'est pas du ménage : tant
  // qu'elle est là, l'animation porte sur `transform`, et un élément dont la
  // transformation est animée devient le REPÈRE de ses descendants en
  // `position: fixed`. Résultat mesuré : une tuile censée être centrée sur
  // l'écran (391 px) se calait à 496 px, sur le centre de la section. Le
  // `fill-mode: both` de la règle CSS faisait durer l'effet indéfiniment.
  section.addEventListener('animationend', () => section.classList.remove('vue-entre'), {
    once: true,
  });
}

// Les photos arrivent une à une, chacune quand elle est prête, au lieu de
// clignoter toutes ensemble. Celles que le navigateur a déjà en cache sont
// marquées tout de suite : sans ça, elles resteraient invisibles.
function reveletLesPhotos(section) {
  for (const image of section.querySelectorAll('.mur-photos img')) {
    if (image.complete) {
      image.classList.add('chargee');
      continue;
    }
    image.addEventListener('load', () => image.classList.add('chargee'), { once: true });
    // Une photo qui échoue ne doit pas rester à zéro : on la montre quand même,
    // le navigateur affichera son icône de fichier cassé.
    image.addEventListener('error', () => image.classList.add('chargee'), { once: true });
  }
}

// Le comptage. Ces chiffres ne peuvent que monter, c'est tout leur sens : les
// voir monter est la traduction visuelle de ce qu'ils disent.
// Une seule fois par visite — un compteur qui repart de zéro à chaque case
// cochée deviendrait un tic.
let comptageFait = false;

// Exportée pour être vérifiable seule : on lui donne un bout de DOM fabriqué,
// et on regarde le chiffre monter. `remise` remet le garde-fou à zéro.
export function animerLesCompteurs(section, { remise = false } = {}) {
  if (remise) comptageFait = false;
  const chiffres = [...section.querySelectorAll('.compteurs .chiffre[data-vers]')];
  if (!chiffres.length || comptageFait) return;
  comptageFait = true;
  if (MOUVEMENT_REFUSE()) return;

  const DUREE = 400;
  for (const chiffre of chiffres) {
    const cible = Number(chiffre.dataset.vers);
    if (!Number.isFinite(cible) || cible === 0) continue;

    const depart = performance.now();
    chiffre.textContent = '0';

    const avancer = (maintenant) => {
      const part = Math.min((maintenant - depart) / DUREE, 1);
      // Décélération : le chiffre s'installe au lieu de s'arrêter net.
      const adouci = 1 - (1 - part) ** 3;
      chiffre.textContent = String(Math.round(cible * adouci));
      if (part < 1) requestAnimationFrame(avancer);
    };
    requestAnimationFrame(avancer);
  }
}

// --- Fabrication du HTML ----------------------------------------------------

// `etat` : la barre porte la LOUPE depuis le 21 août 2026 au soir (demande de
// Noé) — visible sur toutes les pages, tout à droite, et elle ne cherche pour
// l'instant que les clubs du vivier. Ouverte, la barre de recherche prend la
// ligne des onglets (ils s'effacent le temps de chercher — Échap ou la loupe
// les ramènent), et les résultats se posent sous la barre. Le squelette la
// montre fermée : `zoneLoupeClubs` a un défaut pour ça.
function enTete(vue, etat = null) {
  const vueActive = ONGLET_DE_LA_VUE[vue] ?? vue;
  const rechercheOuverte = Boolean(etat) && etat.rechercheClub !== null;
  // Le calendrier n'est plus dans cette liste : il va en bout de barre, en
  // icône (voir `ongletCalendrier`). Ce sont les lieux du site qui se nomment.
  const liens = [
    ['accueil', 'Accueil', '#yuno'],
    ['journal', 'Journal', '#yuno/journal'],
    ['creer', 'Créer', '#yuno/creer'],
    // MISSIONS (nom validé par Noé, 21 août 2026) : préparer un événement et
    // livrer une commande, le même axe du métier. L'onglet ouvre le tableau
    // de bord — à préparer, puis le pipeline des commandes.
    ['missions', 'Missions', '#yuno/missions'],
    ['reseau', 'Réseau', '#yuno/reseau'],
  ];

  return `
    <!-- Plus de signature en tête (demande de Noé, 14 août 2026) : elle
         occupait le haut de chaque page pour redire ce qu'on sait déjà. Le
         site s'ouvre sur sa barre ; le titre de l'onglet dit « Yuno · yuno_rph »,
         et la signature reste sur la page #photo du hub, à la porte d'entrée. -->
    <nav class="yuno-nav" aria-label="Le site Yuno">
      ${
        rechercheOuverte
          ? ''
          : `${liens
              .map(
                ([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === vueActive ? 'actif' : ''}"
          ${vue === vueActive ? 'aria-current="page"' : ''}>${libelle}</a>`,
              )
              .join('')}
      ${ongletCalendrier('#yuno/calendrier', vueActive === 'calendrier')}`
      }
      ${zoneLoupeClubs(etat ?? undefined)}
    </nav>
    ${etat ? listeResultatsClubs(etat) : ''}`;
}

// La seule mention du hub sur tout le site, tout en bas : en plein écran sur
// téléphone, sans barre d'adresse, il faut une porte de sortie.
function pied() {
  return `
    <footer class="yuno-pied">
      <a class="lien-discret" href="#photo">Quitter le site</a>
    </footer>`;
}

// Pas de sous-navigation en pastilles : essayée le 21 août 2026, retirée le
// soir même (« pas trop fan », Noé). La famille du réseau se relie autrement —
// des TUILES en fin de page (CRM et vivier sous la Passerelle), et le bandeau
// lui-même est cliquable : « clubs contactés » ouvre le vivier, « entrés au
// réseau » ouvre le CRM. Les modèles de messages n'ont plus d'entrée de
// navigation : un lien discret là où l'on s'en sert (Passerelle, CRM), la
// page `#yuno/messages` restant leur arrière-boutique.

// --- Le Carnet de terrain ----------------------------------------------------
// L'accueil du site affiche le vécu, jamais le social : matchs couverts,
// rencontres, œuvres finies. Aucune métrique de réseau n'entre ici — la
// première chose vue en ouvrant le site dit ce qui compte.

// Le même signe que le « + » du hub : un dessin, pas un caractère — il garde
// son épaisseur et son centrage quelle que soit la police.
const PLUS = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
  aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>`;

// « Œuvre finie » est MASQUÉE (demande de Noé, 15 août 2026 — « l'utilisation me
// paraît très futile »). Elle comptait le travail d'atelier mené jusqu'au bout :
// une série triée, retouchée, achevée. C'était le troisième terme du principe
// fondateur (« matchs couverts, rencontres, œuvres finies ») et le seul des
// trois qui demandait de revenir cocher une case des jours après la sortie —
// c'est probablement ce qui l'a rendue futile à l'usage : elle est restée à 0
// sur treize sorties.
//
// Rien n'est détruit : la colonne `oeuvre_finie` garde ses valeurs, et ce
// drapeau commande d'un seul endroit le compteur, les deux formulaires,
// l'étiquette de la fiche et la marque du carnet. Le repasser à `true` rallume
// tout. Même façon de faire que `VICTOIRES_VISIBLES` dans js/dashboard.js.
const OEUVRE_VISIBLE = false;

const TYPES_MOMENT = {
  match: 'Match',
  concert: 'Concert',
  sortie: 'Sortie',
  autre: 'Autre',
};

// Un crayon dessiné, pas un émoji : le site n'écrit qu'en × + ↗ ‹ ›, et un
// émoji y arriverait avec sa couleur et sa police à lui. `currentColor` le
// laisse suivre l'encre du bouton, y compris au survol.
const CALENDRIER = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"
  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
  <path d="M3 10h18M8 3v4M16 3v4"></path>
</svg>`;

const AMPOULE = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none"
  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M9 18h6M10 21h4"></path>
  <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .9 1.6l.1.6h5.2l.1-.6c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z"></path>
</svg>`;

const CRAYON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M12 20h9"></path>
  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
</svg>`;

// --- Une sortie vécue EST un événement (fusion du 14 août 2026) --------------
//
// Avant, un moment doublait son événement : même date, même lieu, même type.
// L'événement porte maintenant les deux faces — ce qui est prévu, et ce qui a
// été vécu (`vecu`, la photo, la note, l'œuvre finie, ses rencontres).
//
// Le VOCABULAIRE ne bouge pas : l'écran dit toujours « Moments vécus » et
// « Carnet de terrain ». C'est la donnée qui a fusionné, pas les mots.
//
// `vecu` ne se pose jamais tout seul au passage de la date (décision de Noé) :
// un match où l'on n'est pas allé compterait, et le compteur cesserait de dire
// du vrai. Il se pose par un geste — le bilan, l'invite, ou la capture.

export const estVecue = (evenement) => Boolean(evenement.vecu);

export function sortiesVecues(evenements) {
  return evenements.filter(estVecue);
}

// Le jour d'une sortie, en date nue : la victoire, le tri et l'affichage n'ont
// que faire de l'heure. `date_debut` est un timestamptz, `date` était une date.
export const jourDeLaSortie = (evenement) => versDateISO(new Date(evenement.date_debut));

// Ce qu'une sortie devient au dashboard du hub, où elle arrive sans son carnet
// autour : « Match · OM-Lyon », ou « Match » tout court si le titre manque. Le
// point médian plutôt qu'un tiret : les intitulés en contiennent souvent un.
export function titreDuMoment({ type_moment, titre, lieu }) {
  const quoi = TYPES_MOMENT[type_moment] ?? TYPES_MOMENT.autre;
  const nom = (titre ?? lieu ?? '').trim();
  return nom ? `${quoi} · ${nom}` : quoi;
}

// Les trois compteurs de l'accueil. Ils se calculent, ils ne se stockent pas :
// ce sont des faits accumulés, ils ne peuvent que monter. Les rencontres se
// comptent une par une, pas par personne — revoir quelqu'un au bord du terrain
// est un moment vécu de plus, pas un doublon.
export function compteursCarnet(sorties) {
  return {
    moments: sorties.length,
    rencontres: sorties.reduce((somme, sortie) => somme + (sortie.rencontres?.length ?? 0), 0),
    oeuvres: sorties.filter((sortie) => sortie.oeuvre_finie).length,
  };
}

export function construireCompteurs(sorties) {
  const { moments: vecus, rencontres, oeuvres } = compteursCarnet(sorties);
  // `data-vers` porte la valeur d'arrivée : le compteur part de 0 et y monte
  // au premier rendu. Le texte est écrit d'emblée à sa valeur finale — si le
  // script ne tourne pas, ou si l'on refuse le mouvement, le chiffre est juste.
  const compteur = (nombre, libelle) => `
    <li>
      <span class="chiffre" data-vers="${nombre}">${nombre}</span>
      <span class="discret">${libelle}</span>
    </li>`;

  return `
    <ul class="compteurs">
      ${compteur(vecus, 'Moments vécus')}
      ${compteur(rencontres, 'Rencontres')}
      ${OEUVRE_VISIBLE ? compteur(oeuvres, 'Œuvres finies') : ''}
    </ul>`;
}

// Les noms saisis au vol retrouvent leur fiche quand elle existe — même geste
// que le réseau : une barre oblique sépare deux personnes.
export function relierRencontres(saisie, contacts) {
  return separer(saisie ?? '').map((nom) => {
    const connu = contacts.find(
      (contact) => contact.nom.toLowerCase() === nom.toLowerCase(),
    );
    return connu ? { nom: connu.nom, contact_id: connu.id } : { nom, contact_id: null };
  });
}

function ligneRencontres(sortie) {
  if (!sortie.rencontres?.length) return '';

  const noms = sortie.rencontres
    .map((rencontre) =>
      rencontre.contact_id
        ? `<span class="tag" style="--h: ${teinte(rencontre.nom)}">${echapper(rencontre.nom)}</span>`
        : `<span class="tag tag-neutre">${echapper(rencontre.nom)}<button type="button"
             class="lien-discret ouvrir-fiche" data-ouvrir-fiche="${echapper(rencontre.id)}"
             title="Ajouter au réseau"
             aria-label="Ajouter ${echapper(rencontre.nom)} au réseau">+</button></span>`,
    )
    .join('');

  return `<span class="moment-rencontres"><span class="discret">Rencontré</span>${noms}</span>`;
}

// Le bilan de la sortie, tel qu'il a été écrit sur sa feuille de préparation.
// Il vit dans la fiche depuis la fusion (demande de Noé, 14 août 2026) : ce
// qu'on a préparé et ce qu'on a vécu sont deux faces d'une même sortie, et
// c'est ici qu'on vient les relire.
function bilanDeLaSortie(sortie, preparations = []) {
  const feuille = preparations.find((candidat) => candidat.evenement_id === sortie.id);
  if (!feuille) return '';

  const aUnBilan = feuille.bilan_bien || feuille.bilan_mieux;

  return `
      <span class="sortie-bilan">
        ${
          aUnBilan
            ? `${
                feuille.bilan_bien
                  ? `<span class="sortie-bilan-ligne">
                       <span class="discret">Ce qui a marché</span>
                       <span>${echapper(feuille.bilan_bien)}</span></span>`
                  : ''
              }
              ${
                feuille.bilan_mieux
                  ? `<span class="sortie-bilan-ligne">
                       <span class="discret">À refaire autrement</span>
                       <span>${echapper(feuille.bilan_mieux)}</span></span>`
                  : ''
              }`
            : ''
        }
        <a class="lien-discret" href="#yuno/preparations/${echapper(feuille.id)}">${
          aUnBilan ? 'Voir la préparation' : 'Écrire le bilan'
        }</a>
      </span>`;
}

// Le détail d'une sortie, sans son enveloppe : le carnet l'enferme dans un
// <li>, la fenêtre ouverte depuis une vignette le pose tel quel.
// `fenetre` : dans une fenêtre volante, la croix de retrait tomberait juste
// sous celle qui ferme, au même bord — deux « × » dont l'un est irréversible.
// Le geste s'écrit alors, comme pour les idées de la banque.
function corpsMoment(sortie, photos = {}, { fenetre = false, preparations = [] } = {}) {
  const photo = sortie.photo_chemin ? photos[sortie.photo_chemin] : null;
  // Le titre porte le nom de la sortie ; le lieu ne se répète que s'il dit
  // autre chose (« Stade Bauer » sous « Red Star - Sochaux »).
  const lieuUtile = sortie.lieu && sortie.lieu.trim() !== (sortie.titre ?? '').trim()
    ? sortie.lieu
    : null;

  return `
      <span class="tuile-entete">
        <span class="etiquette">${echapper(
          TYPES_MOMENT[sortie.type_moment] ?? TYPES_MOMENT.autre,
        )}</span>
        ${OEUVRE_VISIBLE && sortie.oeuvre_finie ? '<span class="etiquette etiquette-oeuvre">Œuvre finie</span>' : ''}
        <span class="discret quand">${echapper(
          echeanceLisible(depuisDateISO(jourDeLaSortie(sortie))),
        )}</span>
      </span>
      ${
        // La photo EN PREMIER, juste sous l'en-tête (demande de Noé, 15 août
        // 2026) : c'est elle qu'on vient revoir, et la faire attendre sous le
        // titre, le lieu et les rencontres revenait à la traiter comme une
        // pièce jointe. Le reste se lit dessous, dans l'ordre du récit.
        fenetre && photo
          ? `<a class="moment-image" href="${echapper(photo)}" target="_blank" rel="noopener">
               <img src="${echapper(photo)}" alt="La photo dont je suis fier"
                 loading="lazy"></a>`
          : ''
      }
      ${sortie.titre ? `<span class="moment-titre">${echapper(sortie.titre)}</span>` : ''}
      ${lieuUtile ? `<span class="moment-lieu">${echapper(lieuUtile)}</span>` : ''}
      ${ligneRencontres(sortie)}
      ${sortie.note ? `<span class="discret moment-note">${echapper(sortie.note)}</span>` : ''}
      ${fenetre ? bilanDeLaSortie(sortie, preparations) : ''}
      ${
        // La fiche ne porte plus QUE le crayon (demande de Noé, 15 août 2026) :
        // on vient y lire une sortie et parfois la corriger, jamais l'effacer.
        // Le retrait vit au carnet, sur la ligne — c'est là qu'on range, et
        // c'est le seul écran où l'on voit ce qu'on est en train de retirer au
        // milieu du reste.
        fenetre
          ? `<span class="moment-actions">
               <button type="button" class="bouton-icone"
                 data-modifier-moment="${echapper(sortie.id)}"
                 title="Modifier cette sortie"
                 aria-label="Modifier « ${echapper(titreDuMoment(sortie))} »">${CRAYON}</button>
             </span>`
          : ''
      }`;
}

// Les deux clubs de l'affiche, tels qu'ils s'offrent dans un formulaire du
// carnet (demande de Noé, 15 août au soir). C'est ICI qu'une sortie devient un
// match couvert : le lien doit pouvoir se poser au moment où l'on raconte, pas
// seulement au calendrier.
//
// On écrit le NOM, avec la liste du vivier en appui — même geste et même règle
// que « Rattaché à » sur une fiche du réseau, et que les deux autres endroits
// où ce lien se pose : le nom exact relie, autre chose délie, un champ vide
// délie.
function champsClubsDeLaSortie(sortie, pistes) {
  const nomDe = (id) => pistes.find((piste) => piste.id === id)?.nom ?? '';
  const noms = nomsDesClubs(pistes);

  return [
    {
      nom: 'club_recevant',
      libelle: 'Club qui reçoit (son nom au vivier)',
      type: 'text',
      valeur: nomDe(sortie?.club_recevant),
      suggestions: noms,
    },
    {
      nom: 'club_visiteur',
      libelle: 'Club qui se déplace',
      type: 'text',
      valeur: nomDe(sortie?.club_visiteur),
      suggestions: noms,
    },
  ];
}

// Le formulaire de correction, dans la même fenêtre que la fiche. Il ne touche
// ni à la photo ni aux rencontres : l'une vit dans le stockage, les autres dans
// leur table, et chacune demande son propre geste. Corriger une date ou un lieu
// mal tapé est le besoin courant ; le reste attend d'être demandé.
function formulaireModifierMoment(sortie, pistes = []) {
  return construireFormulaire({
    id: 'moment-edition',
    action: 'modifier-moment',
    bouton: 'Enregistrer',
    avecPli: false,
    extra: `<input type="hidden" name="id" value="${echapper(sortie.id)}">`,
    champs: [
      { nom: 'date', libelle: 'Quand', type: 'date', valeur: jourDeLaSortie(sortie), requis: true },
      {
        nom: 'type_moment',
        libelle: 'Quoi',
        type: 'choix',
        options: TYPES_MOMENT,
        valeur: sortie.type_moment ?? 'match',
      },
      { nom: 'titre', libelle: 'La sortie', type: 'text', valeur: sortie.titre ?? '', requis: true },
      { nom: 'lieu', libelle: 'Où (facultatif)', type: 'text', valeur: sortie.lieu ?? '' },
      ...champsClubsDeLaSortie(sortie, pistes),
      { nom: 'note', libelle: 'Note', type: 'textarea', valeur: sortie.note ?? '' },
      {
        nom: 'photo',
        // Un champ fichier ne peut pas afficher son contenu actuel : le libellé
        // dit donc s'il y a déjà une photo, et ce qu'un nouveau fichier fera.
        libelle: sortie.photo_chemin
          ? 'Remplacer la photo (laisser vide pour garder celle-ci)'
          : 'Ajouter une photo',
        type: 'file',
        accepte: 'image/*',
      },
      ...(OEUVRE_VISIBLE
        ? [{ nom: 'oeuvre_finie', libelle: 'Œuvre finie', type: 'checkbox', valeur: sortie.oeuvre_finie }]
        : []),
    ],
  });
}

// La fiche d'une sortie au Journal. Elle ne sert plus qu'ici — l'accueil est
// passé au mur de photos — donc le retrait y est toujours offert : c'est là
// qu'on gère.
//
// Elle s'ouvre en grand au clic, comme une vignette du mur : une sortie SANS
// photo n'a pas de vignette, et son bilan serait alors inatteignable.
// Deux marques minuscules, en trait : une photo jointe, des gens rencontrés.
// Des dessins et non des émojis — un émoji arriverait avec sa couleur et sa
// police à lui, au milieu d'une ligne qui doit rester grise.
const MARQUE_PHOTO = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M4 8h3l2-3h6l2 3h3v12H4z"></path><circle cx="12" cy="13" r="3.2"></circle></svg>`;

const MARQUE_GENS = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <circle cx="9" cy="8" r="3.2"></circle>
  <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"></path>
  <path d="M16 5.5a3.2 3.2 0 0 1 0 6M17.5 14.8c2.1.6 3.5 2.4 3.5 5.2"></path></svg>`;

// Une ligne, pas une carte (demande de Noé, 14 août 2026). Le carnet est fait
// pour s'allonger : cinquante sorties en cinquante cartes deviennent un mur
// qu'on ne parcourt plus. La ligne dit le nécessaire — quand, quoi, et trois
// marques — et le clic ouvre la fiche entière, comme la banque d'idées et le
// réseau le font déjà. Le retrait vit dans la fenêtre : une croix par ligne,
// sur cinquante lignes, c'est cinquante occasions de se tromper.
// La date d'une ligne du carnet. **Écrite en toutes lettres pour l'année en
// cours** — « 05 août » — et **en chiffres pour les années d'avant** —
// « 05/08/25 » (demande de Noé, 14 août 2026). C'est l'année qui manque qui
// décide : dans l'année courante elle ne dit rien, et une date lisible vaut
// mieux ; passé le 31 décembre, elle devient l'information principale, et la
// forme chiffrée la porte sans allonger la ligne.
//
// La police suit la règle des trois leviers : Geist Mono (`.chiffre`) est pour
// ce qui se lit comme un code, pas pour une date en toutes lettres — « 05 août »
// est une phrase, elle reste en Gilroy.
export function quandDeLaLigne(jour, reference = new Date()) {
  const memeAnnee = jour.getFullYear() === reference.getFullYear();
  return {
    texte: memeAnnee
      ? jour.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
      : jour.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    enChiffres: !memeAnnee,
  };
}

function ligneCarnet(sortie, photos = {}, reference = new Date()) {
  const rencontres = sortie.rencontres?.length ?? 0;
  const aUnePhoto = Boolean(sortie.photo_chemin && photos[sortie.photo_chemin]);
  const jour = depuisDateISO(jourDeLaSortie(sortie));
  const quand = quandDeLaLigne(jour, reference);

  return `
    <li>
      <button type="button" class="sortie-ligne" data-ouvrir-sortie="${echapper(sortie.id)}"
        aria-label="Ouvrir « ${echapper(titreDuMoment(sortie))} »">
        <span class="sortie-ligne-quand${quand.enChiffres ? ' chiffre' : ''}">${echapper(
          quand.texte,
        )}</span>
        <span class="sortie-ligne-titre">${echapper(sortie.titre ?? titreDuMoment(sortie))}</span>
        <span class="sortie-ligne-marques">
          ${
            OEUVRE_VISIBLE && sortie.oeuvre_finie
              ? '<span class="etiquette etiquette-oeuvre" title="Œuvre finie">Œuvre</span>'
              : ''
          }
          <span class="etiquette">${echapper(
            TYPES_MOMENT[sortie.type_moment] ?? TYPES_MOMENT.autre,
          )}</span>
          ${aUnePhoto ? `<span class="sortie-marque" title="Une photo">${MARQUE_PHOTO}</span>` : ''}
          ${
            rencontres
              ? `<span class="sortie-marque" title="${rencontres} rencontre${
                  rencontres > 1 ? 's' : ''
                }">${MARQUE_GENS}<span class="chiffre">${rencontres}</span></span>`
              : ''
          }
        </span>
      </button>
      <!-- La croix vit À CÔTÉ de la ligne, pas dedans : la ligne est déjà un
           bouton, et deux boutons ne s'imbriquent pas — c'est le même piège
           qu'au calendrier, où le cercle d'une tâche a dû sortir de sa barre.
           (Et le mot « bouton » s'écrit ici sans accents graves ni chevrons :
           dans un commentaire de gabarit, ils ferment la chaîne.)
           C'est ici, et nulle part ailleurs, qu'on retire une sortie du carnet
           (demande de Noé, 15 août 2026) : la fiche se lit et se corrige, le
           carnet est l'écran où l'on range. -->
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-supprimer-moment="${echapper(sortie.id)}"
        title="Retirer du carnet"
        aria-label="Retirer « ${echapper(titreDuMoment(sortie))} » du carnet">×</button>
    </li>`;
}

// Le tirage est au hasard, mais il tient la journée : sans ça le mur se
// rebattrait à chaque retour sur l'accueil, et regarder ses photos deviendrait
// un jeu de machine à sous. La date sert de graine — le mur change à minuit,
// tout seul, sans rien à stocker.
function tirageDuJour(liste, jour) {
  let graine = [...jour].reduce((somme, lettre) => (somme * 31 + lettre.charCodeAt(0)) >>> 0, 7);
  // Congruence linéaire : de quoi mélanger honnêtement dix photos, et rien de
  // plus — ce n'est pas de la cryptographie.
  const suivant = () => {
    graine = (graine * 1664525 + 1013904223) >>> 0;
    return graine / 4294967296;
  };

  // Huit tours à vide, et ils ne sont pas décoratifs. Deux dates voisines
  // donnent deux graines voisines — « 15 » et « 16 » ne diffèrent que d'une
  // unité — et un générateur congruentiel garde cette proximité sur son premier
  // tirage. Mesuré avant : sur quinze jours et cinq idées, deux d'entre elles ne
  // sortaient JAMAIS, et deux jours de suite rendaient souvent la même. Le
  // brassage décorrèle les graines proches ; le tirage reste stable dans la
  // journée, puisqu'il part toujours de la même date.
  for (let tour = 0; tour < 8; tour += 1) suivant();

  const tirees = [...liste];
  for (let i = tirees.length - 1; i > 0; i -= 1) {
    const j = Math.floor(suivant() * (i + 1));
    [tirees[i], tirees[j]] = [tirees[j], tirees[i]];
  }
  return tirees;
}

// Les sorties VÉCUES qui portent une photo dont l'adresse est déjà signée. Une
// sortie sans photo n'a rien à faire dans un mur de photos, et un événement à
// venir non plus — le mur montre ce qui a été vécu.
function momentsIllustres(evenements, photos) {
  return sortiesVecues(evenements).filter(
    (sortie) => sortie.photo_chemin && photos[sortie.photo_chemin],
  );
}

// Le dessin d'un mur, une fois l'ordre décidé. Les deux murs du site — le
// tirage de l'accueil et la frise complète du Journal — n'en diffèrent que par
// cet ordre et par ce que la feuille de style laisse voir.
function vignettes(sorties, photos, classes = 'mur-photos') {
  return `<ul class="${classes}">${sorties
    .map((sortie) => {
      const photo = photos[sortie.photo_chemin];
      // Un bouton, pas un lien vers le fichier : le clic ouvre la sortie — son
      // lieu, sa date, ses rencontres, sa note, son bilan — et pas une image
      // nue dans un onglet vide.
      return `
        <li>
          <button type="button" data-ouvrir-moment="${echapper(sortie.id)}"
            aria-label="Ouvrir « ${echapper(titreDuMoment(sortie))} »">
            <img src="${echapper(photo)}" alt="${echapper(titreDuMoment(sortie))}"
              loading="lazy" decoding="async">
          </button>
        </li>`;
    })
    .join('')}</ul>`;
}

const MUR_VIDE = `<p class="vide">Tes photos s'afficheront ici — joins-en une à ta prochaine sortie.</p>`;

// L'accueil ne montre plus des fiches de moments : il montre des photos. Une
// frise sur une seule ligne sous les compteurs — la preuve de ce qui a été
// vécu, pas son compte rendu. Le détail (lieu, rencontres, note) reste au
// Journal. Dix sont montées ; la feuille de style en laisse voir cinq ou dix
// selon la largeur.
export function construireMurPhotos(evenements, photos = {}, jour = versDateISO(), limite = 10) {
  const avecPhoto = momentsIllustres(evenements, photos);
  if (!avecPhoto.length) return MUR_VIDE;

  return vignettes(tirageDuJour(avecPhoto, jour).slice(0, limite), photos);
}

// Le mur du Journal : le même principe, mais rien n'est tiré au sort et rien
// n'est caché. Toutes les photos, de la plus récente à la plus ancienne — le
// Journal est l'archive, on y descend dans le temps. `mur-complet` dit à la
// feuille de style de ne rien masquer et de laisser la frise passer à la ligne.
// Le moment ouvert depuis une vignette. Comme pour les idées, on le retrouve
// par son identifiant à chaque rendu : la fenêtre suit l'état, elle n'en garde
// pas une copie figée.
function fenetreMoment(etat) {
  if (!etat.momentOuvert) return '';

  const sortie = etat.evenements.find((candidat) => candidat.id === etat.momentOuvert);
  if (!sortie) return '';

  const contenu = etat.editionMoment
    ? `<h3 class="fenetre-titre">Modifier la sortie</h3>${formulaireModifierMoment(
        sortie,
        etat.pistes,
      )}`
    : `<div class="moment moment-complet">${corpsMoment(sortie, etat.photos, {
        fenetre: true,
        preparations: etat.preparations,
      })}</div>`;

  return construireFenetre(titreDuMoment(sortie), contenu);
}

// Le plus récent d'abord — le Journal est l'archive, on y descend dans le temps.
function duPlusRecent(sorties) {
  return [...sorties].sort(
    (a, b) =>
      String(b.date_debut).localeCompare(String(a.date_debut)) ||
      String(b.created_at).localeCompare(String(a.created_at)),
  );
}

export function construireMurComplet(evenements, photos = {}) {
  const avecPhoto = momentsIllustres(evenements, photos);
  if (!avecPhoto.length) return MUR_VIDE;

  return vignettes(duPlusRecent(avecPhoto), photos, 'mur-photos mur-complet');
}

// Le Journal : le fil des moments, et rien d'autre (décision de Noé, 13 août
// 2026). Il portait aussi les victoires nées ailleurs — une tâche terminée, une
// commande livrée, un jalon atteint — et une ligne « Publier trois reels » au
// milieu des matchs couverts n'est pas du terrain. Un carnet de terrain se
// remplit dehors ; ce qui se coche à l'écran remonte au dashboard du hub, qui
// est fait pour ça, et se retire de là.
export function construireCarnet(evenements, photos = {}, reference = new Date()) {
  const sorties = sortiesVecues(evenements);
  if (!sorties.length) {
    return `<p class="vide">Ta première sortie s'inscrit ici — un match, un concert, une sortie.</p>`;
  }

  return `<ul class="liste-carnet">${duPlusRecent(sorties)
    .map((sortie) => ligneCarnet(sortie, photos, reference))
    .join('')}</ul>`;
}

// La capture : deux champs suffisent, le reste attend qu'on ait envie. Ce qui
// compte est qu'elle se remplisse debout, en sortant du stade.
//
// DEUX cas depuis la fusion, et ils ne demandent pas la même chose :
//   — une sortie qui n'était pas au calendrier : elle y entre, déjà vécue, et
//     il faut donc son nom et sa date ;
//   — une sortie DÉJÀ au calendrier (l'invite acceptée) : elle porte son nom et
//     sa date, il ne reste qu'à RACONTER — rencontres, photo, note. Redemander
//     ce qui est déjà écrit serait un formulaire pour rien, et changer la date
//     ici écraserait l'heure du match.
function formulaireMoment(contacts, prefill = null, pistes = []) {
  const surUnEvenement = Boolean(prefill?.evenement_id);
  const titre = surUnEvenement ? `Raconter « ${prefill.titre} »` : 'Ajouter une sortie';

  const champsDeLaSortie = surUnEvenement
    ? []
    : [
        { nom: 'date', libelle: 'Quand', type: 'date', valeur: prefill?.date ?? versDateISO() },
        {
          nom: 'type_moment',
          libelle: 'Quoi',
          type: 'choix',
          options: TYPES_MOMENT,
          valeur: 'match',
        },
        {
          nom: 'titre',
          libelle: 'La sortie',
          type: 'text',
          valeur: prefill?.lieu ?? '',
          requis: true,
        },
        { nom: 'lieu', libelle: 'Où (facultatif)', type: 'text' },
      ];

  // Les clubs s'offrent dans les DEUX cas. Sur une sortie déjà au calendrier
  // (« Raconter … »), le reste du formulaire se tait parce que l'événement le
  // sait déjà — mais justement pas ses clubs si personne ne les a posés : c'est
  // le seul champ de la sortie qui a encore quelque chose à apprendre.
  const clubs = champsClubsDeLaSortie(prefill?.sortie ?? null, pistes);

  return construireFenetre(
    titre,
    `<h3 class="fenetre-titre">${echapper(titre)}</h3>
     ${construireFormulaire({
       id: 'moment',
       action: 'ajouter-moment',
       bouton: 'Inscrire au carnet',
       // Dans une fenêtre, le titre est déjà dit : le formulaire se rend nu.
       avecPli: false,
       // La sortie déjà au calendrier voyage par son identifiant : c'est lui
       // qui fait qu'on la marque vécue au lieu d'en créer une seconde.
       extra: surUnEvenement
         ? `<input type="hidden" name="evenement_id" value="${echapper(prefill.evenement_id)}">`
         : '',
       champs: [
         ...champsDeLaSortie,
         ...clubs,
         {
           nom: 'rencontres',
           libelle: "Qui j'ai rencontré (sépare par une barre oblique)",
           type: 'text',
           suggestions: contacts.map((contact) => contact.nom),
         },
         {
           nom: 'photo',
           libelle: 'La photo dont je suis fier',
           type: 'file',
           accepte: 'image/*',
         },
         { nom: 'note', libelle: 'Note libre', type: 'textarea' },
         ...(OEUVRE_VISIBLE
           ? [{ nom: 'oeuvre_finie', libelle: 'Une œuvre finie', type: 'checkbox' }]
           : []),
       ],
     })}`,
  );
}

// Le « + » flottant du site : LA MÊME TUILE que dans le hub (demande de Noé,
// 13 août 2026). Elle pose un événement, une tâche, une publication, un
// objectif — et, par une cinquième nature propre à Yuno, un moment du carnet.
//
// Il suit toutes les vues : ce qu'on note se note en sortant du stade, pas
// quand on pense à revenir sur la bonne page. Le pouce le trouve toujours au
// même endroit, exactement comme dans le hub.
function boutonPlusFlottant() {
  return `
    <button type="button" class="ouvrir-capture" data-ouvrir-plus
      title="Ajouter" aria-label="Ajouter">${PLUS}</button>`;
}

// La cinquième nature de la tuile, ici seulement. Elle ne se pose pas comme les
// autres : la choisir ferme la tuile et ouvre la fenêtre du moment, qui demande
// une photo, des rencontres et une note — rien qui tienne dans une rangée de
// pastilles. C'est une porte dans la liste, pas une ligne de plus à écrire.
const NATURE_MOMENT = { moment: 'Moment' };

// Ce que le « + » propose, page par page (demande de Noé, 13 août 2026). Le
// bouton est au même endroit partout ; ce qu'il ouvre, non — sur une page on
// vient poster, sur une autre on vient noter un nom.
//
// Les sous-pages suivent leur onglet, comme la barre le fait déjà : la banque
// et l'éditorial appartiennent à Créer, la Passerelle et les fiches à Réseau.
//
// `contact` n'est pas une nature de la tuile : c'est la fiche du réseau, et
// elle s'ouvre seule — « toutes les autres possibilités sont cachées ».
const PLUS_PAR_VUE = {
  accueil: { nature: 'tache' },
  // Le Journal EST la page du carnet : son « + » ouvre directement « Ajouter
  // une sortie » (demande de Noé, 14 août 2026), et remplace le bouton dédié
  // qui vivait au-dessus des compteurs. Comme `contact`, ce n'est pas une
  // nature de la tuile : la fenêtre de la sortie s'ouvre seule.
  journal: { sortie: true },
  // Sur Créer et dans la banque, le « + » note une IDÉE : il s'ouvre donc sans
  // date (demande de Noé, 14 août 2026). Une idée est une publication sans
  // date — l'ouvrir sur aujourd'hui la programmait pour le jour même, et il
  // fallait ensuite la déprogrammer pour qu'elle rejoigne la banque.
  // L'éditorial garde sa date : c'est un calendrier, on y pose sur un jour.
  creer: { nature: 'publication', natureEnDernier: true, sansDate: true },
  banque: { nature: 'publication', natureEnDernier: true, sansDate: true },
  editorial: { nature: 'publication', natureEnDernier: true },
  calendrier: { nature: 'evenement' },
  reseau: { contact: true },
  passerelle: { contact: true },
  carnet: { contact: true },
  // Chez les Missions, le « + » ouvre une commande — en fenêtre volante,
  // comme tous les ajouts du site (demande de Noé, 21 août au soir).
  missions: { commande: true },
  commandes: { commande: true },
};

// Sur la page Créer, la nature passe en DERNIER : on vient y poster, et le
// réglage qu'on change le moins n'a pas à occuper la première place.
const reglagesDuPlus = (vue) => PLUS_PAR_VUE[vue] ?? { nature: 'tache' };

// --- La préparation écartée de l'accueil -------------------------------------
// La sortie du moment tient le haut de l'accueil avec sa préparation. Une croix
// la retire quand Noé n'en veut plus là (demande de Noé, 15 août au soir) : la
// feuille n'est PAS supprimée — elle vit à sa page, et le bloc reviendra pour
// la sortie suivante. C'est un choix d'écran, pas un fait sur la sortie, donc il
// vit dans le `localStorage` comme celui de l'invite, et non en base.
//
// Sa propre clé : écarter la préparation de l'accueil ne veut pas dire la même
// chose qu'écarter l'invite du carnet, et l'une ne doit pas emporter l'autre.

const CLE_PREPAS_ECARTEES = 'yuno-prepas-ecartees';

export function prepasEcartees() {
  try {
    const brut = localStorage.getItem(CLE_PREPAS_ECARTEES);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

function ecarterPrepa(id) {
  const suite = [...new Set([...prepasEcartees(), id])];
  try {
    localStorage.setItem(CLE_PREPAS_ECARTEES, JSON.stringify(suite));
  } catch {
    // Tant pis : le bloc reviendra à la prochaine visite.
  }
  return suite;
}

// --- L'invite du calendrier --------------------------------------------------
// Un événement passé propose de devenir un moment : le pont entre l'agenda et
// le Carnet, pour que le vécu se capture sans discipline en plus. Écartée, elle
// ne revient pas — le système ne relance jamais.

const CLE_EVENEMENTS_ECARTES = 'yuno-evenements-ecartes';

export function evenementsEcartes() {
  try {
    const brut = localStorage.getItem(CLE_EVENEMENTS_ECARTES);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

function ecarterEvenement(id) {
  const suite = [...new Set([...evenementsEcartes(), id])];
  try {
    localStorage.setItem(CLE_EVENEMENTS_ECARTES, JSON.stringify(suite));
  } catch {
    // Tant pis : l'invite reviendra à la prochaine visite.
  }
  return suite;
}

// Les sept derniers jours seulement : passé ce délai, l'invite n'est plus une
// aide, c'est un reproche. Un jour déjà logué ne redemande rien.
// Depuis la fusion, la question est simple : quels événements sont passés sans
// avoir été marqués vécus ? Plus de rapprochement par date entre deux tables —
// c'est la même ligne qui porte la sortie et son vécu.
export function evenementsARattraper(evenements, ecartes = [], reference = new Date()) {
  const debut = versDateISO(ajouterJours(reference, -7));

  return evenements
    .filter((evenement) => {
      const quand = new Date(evenement.date_debut);
      const jour = versDateISO(quand);
      return (
        !evenement.vecu &&
        quand <= reference &&
        jour >= debut &&
        !ecartes.includes(evenement.id)
      );
    })
    .sort((a, b) => String(b.date_debut).localeCompare(String(a.date_debut)));
}

function construireInvite(etat) {
  // Une seule à la fois : trois invites empilées, c'est une liste de reproches.
  const [evenement] = evenementsARattraper(etat.evenements, etat.ecartes);
  if (!evenement) return '';

  return `
    <div class="invite-moment">
      <p>Tu as couvert <strong>${echapper(evenement.titre)}</strong> —
        tu le notes au carnet ?</p>
      <span class="invite-choix">
        <button type="button" class="bouton-secondaire bouton-mini"
          data-loguer-evenement="${echapper(evenement.id)}">Oui, le noter</button>
        <button type="button" class="lien-discret bouton-mini"
          data-ecarter-evenement="${echapper(evenement.id)}">Plus tard</button>
      </span>
    </div>`;
}

// --- Les vues ----------------------------------------------------------------

// Le bloc de l'accueil : la sortie du moment, sa phase, et ce qu'il y reste à
// faire. Exportée pour être vérifiable seule, avec des sorties factices.
//
// Ce qu'il montre dépend de l'heure — avant on prépare, pendant on photographie,
// après on trie —, et il peut ne rien montrer du tout : une sortie ne monte ici
// qu'à deux jours de son début. C'est le seul endroit du site où le temps qui
// passe change ce qui s'affiche, et c'est justement ce qu'on lui demande.
export function construireSortieDuMoment(
  evenements,
  preparations,
  reference = new Date(),
  ecartees = [],
) {
  const sortie = sortieDuMoment(evenements, reference);
  if (!sortie) return '';
  // Écartée d'ici : l'accueil se tait sur cette sortie-là. La feuille n'est pas
  // touchée, et la sortie suivante reprendra la place.
  if (ecartees.includes(sortie.id)) return '';

  const phase = phaseDeLaSortie(sortie, reference);
  const feuille = feuilleDeLaSortie(preparations, 'evenement', sortie.id);

  const tete = `
    <span class="tuile-entete">
      <span class="etiquette">${PHASES_PREPA[phase]}</span>
      <span class="discret quand">${echapper(momentLisible(new Date(sortie.date_debut)))}</span>
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-ecarter-prepa="${echapper(sortie.id)}"
        title="Retirer de l'accueil"
        aria-label="Retirer « ${echapper(sortie.titre)} » de l'accueil">×</button>
    </span>
    <h2 class="sortie-moment-titre">${echapper(sortie.titre)}</h2>`;

  // Pas encore de feuille : la porte est celle qui en crée une. Le bloc reste,
  // parce que la sortie, elle, est bien là.
  if (!feuille) {
    return `
      <section class="bloc sortie-moment">
        ${tete}
        ${boutonPreparer(null, 'evenement', sortie.id)}
      </section>`;
  }

  const items = feuille.items.filter((item) => item.phase === phase);
  const restent = items.filter((item) => !item.fait);

  // Ce qu'il RESTE, jamais ce qui manque : on montre les trois premières lignes
  // à faire, et le compte dit le reste sans en faire une dette.
  //
  // Elles se cochent d'ici (demande de Noé, 14 août 2026). C'est la seule chose
  // que l'accueil laisse faire, et elle se défend : au bord du terrain on n'a
  // pas le temps d'ouvrir une page pour dire qu'on a chargé les batteries. Le
  // cercle est le même bouton que partout — `data-cocher-prepa` est déjà écouté
  // sur la section entière, l'accueil n'a rien à brancher.
  const apercu = restent.length
    ? `<ul class="apercu-phase">${restent
        .slice(0, 3)
        .map(
          (item) => `
        <li class="tache-ligne">
          <button type="button" class="tache-cercle" data-cocher-prepa="${echapper(item.id)}"
            aria-pressed="false"
            aria-label="Cocher « ${echapper(item.texte)} »"></button>
          <span class="tache-corps"><span class="tache-titre">${echapper(item.texte)}</span></span>
        </li>`,
        )
        .join('')}</ul>`
    : `<p class="discret">Tout est coché pour cette phase.</p>`;

  return `
    <section class="bloc sortie-moment">
      ${tete}
      ${apercu}
      <a class="lien-discret" href="#yuno/preparations/${echapper(feuille.id)}">Ouvrir la
        préparation${restent.length > 3 ? ` · ${restent.length} lignes à faire` : ''}</a>
    </section>`;
}

function vueAccueil(etat) {
  return `
    ${enTete('accueil', etat)}
    ${construireSortieDuMoment(
      etat.evenements,
      etat.preparations,
      new Date(),
      etat.prepasEcartees,
    )}

    <!-- Ni compteurs, ni bouton de capture ici (demande de Noé, 14 août 2026) :
         l'accueil s'ouvre directement sur le mur. Les trois compteurs et
         « Ajouter un moment » restent au Journal, qui EST la page du carnet —
         et la capture s'atteint toujours de l'accueil par l'invite ou par le
         « + » flottant, dont la tuile porte la nature Moment. -->
    <section class="bloc">
      ${construireInvite(etat)}
      <!-- Le mur ouvre la page, sans titre au-dessus : dix photos n'ont besoin
           de personne pour dire ce qu'elles sont. Pas de porte vers le Journal
           non plus — il est dans la barre, comme Créer. -->
      <div data-bloc="mur-photos">${construireMurPhotos(etat.evenements, etat.photos)}</div>
    </section>

    <section class="bloc">
      <h2>Objectifs</h2>
      <div data-bloc="objectifs">${construireObjectifs(etat.objectifs)}</div>
      ${construireFormulaire({
        id: 'photo-objectif',
        libelle: 'Ajouter un objectif',
        action: 'creer-objectif',
        champs: [
          { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true },
          { nom: 'pourquoi', libelle: 'Pourquoi ? (relu les jours sans motivation)', type: 'textarea' },
          { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' },
          { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
        ],
      })}
    </section>

    <!-- Ni banque d'idées, ni porte vers Créer : la banque a sa page, et
         l'onglet Créer est dans la barre. L'accueil ne montre que ce qui est
         déjà programmé. -->
    <section class="bloc">
      <h2>En création</h2>
      <div data-bloc="apercu">${construireApercuCreation(etat.publications, { idees: false })}</div>
    </section>
    ${fenetreMoment(etat)}
    ${pied()}`;
}

// Le Journal — la page source du carnet de terrain : tous les moments, la
// capture, et le retrait. L'accueil n'en montre que les derniers.
function vueJournal(etat) {
  return `
    ${enTete('journal', etat)}

    <section class="bloc">
      ${construireInvite(etat)}
      <!-- Plus de bouton « Ajouter une sortie » ici (demande de Noé, 14 août
           2026) : c'est le « + » flottant qui l'ouvre, et il est là où le
           pouce arrive. Les compteurs restent — le Journal est leur page. -->
      ${construireCompteurs(sortiesVecues(etat.evenements))}
      <!-- Le même mur qu'à l'accueil, mais entier et dans l'ordre du temps :
           ici on cherche une photo qu'on a prise, on ne se laisse pas
           surprendre par un tirage. -->
      <div data-bloc="mur-complet">${construireMurComplet(etat.evenements, etat.photos)}</div>
    </section>

    <section class="bloc">
      <h2>Le carnet de terrain</h2>
      <div data-bloc="carnet">${construireCarnet(etat.evenements, etat.photos)}</div>
    </section>

    <!-- Plus de porte vers les préparations (demande de Noé, 21 août au
         soir) : elles vivent chez les Missions désormais — le Journal garde
         le vécu, l'avant se prépare ailleurs. -->
    ${fenetreMoment(etat)}
    ${pied()}`;
}

export function filtrerBanque(publications, { pilier = 'tout', statutIdee = 'tout' } = {}) {
  return publications.filter((pub) => {
    if (pilier !== 'tout' && String(pub.pilier ?? '') !== pilier) return false;
    if (statutIdee !== 'tout' && pub.statut !== statutIdee) return false;
    return true;
  });
}

// `data-pilier` est ce qui ALLUME la couleur : la cascade de styles.css pose
// `--pilier` et son encre dessus. Sans lui, la pastille restait un contour
// gris — le système de couleurs existait, personne ne l'appelait.
function etiquettePilier(rang) {
  return `<span class="etiquette etiquette-pilier" data-pilier="${echapper(String(rang))}">${echapper(
    `${rang}. ${PILIERS[rang]?.nom ?? ''}`,
  )}</span>`;
}

// --- L'idée du jour -----------------------------------------------------------
// Une idée de la banque, tirée au sort une fois par jour, offerte en arrivant
// sur Créer (demande de Noé, 14 août 2026). Elle ne demande rien : elle est là,
// on la lit, on la garde ou on passe. C'est le pendant du mur de photos — même
// tirage à graine, même stabilité dans la journée, même changement à minuit.
//
// Elle ne remplace pas « Je ne sais pas quoi poster », qui répond à une autre
// question : celle-là est contextuelle (« y a-t-il un match cette semaine ? »)
// et se déplie quand on la cherche.
export function ideeDuJour(publications, jour = versDateISO()) {
  const banque = publications.filter((pub) => !pub.date_prevue && pub.statut !== 'publie');
  return tirageDuJour(banque, jour)[0] ?? null;
}

// Programmer : un calendrier avec un « + ». Un dessin, pas un caractère — le
// site n'écrit qu'en × + ↗ ‹ ›, et un émoji arriverait avec sa police à lui.
const PROGRAMMER = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M21 11.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6.5"></path>
  <path d="M3 10h18M8 2v4M16 2v4"></path>
  <path d="M18 15v6M15 18h6"></path></svg>`;

// Le re-tirage à la main a disparu le 15 août 2026 (demande de Noé) : le coin
// de la carte porte désormais le geste de programmer, qui vaut mieux qu'un
// second tirage. L'idée du jour reste tirée une fois par jour, et change à
// minuit — c'est ce qui en fait une carte qu'on tire, pas une roue qu'on
// tourne.
export function construireIdeeDuJour(publications, { jour = versDateISO() } = {}) {
  const idee = ideeDuJour(publications, jour);

  if (!idee) {
    return `
      <section class="bloc idee-jour">
        <h2><span class="etape chiffre">01</span>L'idée du jour</h2>
        <p class="vide">Ta banque est vide — note une idée, même bancale, et elle reviendra
          t'inspirer un matin.</p>
      </section>`;
  }

  // La CARTE DU JOUR (forme validée par Noé, 15 août 2026) : la seule carte
  // chaude de la page — un souffle d'or dans le fond, la date du jour en tête,
  // le re-tirage dans son coin, et le geste de programmer DANS la carte. C'est
  // l'objet qu'on vient tirer chaque matin, il ne ressemble à rien d'autre.
  return `
    <section class="bloc idee-jour">
      <div class="idee-jour-tete">
        <h2><span class="etape chiffre">01</span>L'idée du jour</h2>
        <span class="discret idee-jour-date">le ${echapper(
          depuisDateISO(jour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
        )}</span>
      </div>
      <div class="carte-jour">
        <!-- Programmer tient dans le coin (demande de Noé, 15 août 2026), à la
             place du re-tirage : une icône, et la ligne « La programmer » qui
             traînait sous la carte disparaît.
             Le champ date est TRANSPARENT PAR-DESSUS l'icône, et non déclenché
             en JS : le clic tombe directement sur lui, donc le sélecteur natif
             s'ouvre partout, sans dépendre de la méthode showPicker que
             Safari n'a eu que tard (et qui s'écrit ici sans accents graves :
             dans un commentaire de gabarit, ils ferment la chaîne). HORS du bouton du corps — deux contrôles ne s'imbriquent
             pas. -->
        <span class="carte-jour-geste">
          <span class="carte-jour-icone" aria-hidden="true">${PROGRAMMER}</span>
          <input type="date" class="carte-jour-date" data-programmer="${echapper(idee.id)}"
            title="Programmer cette idée"
            aria-label="Programmer « ${echapper(idee.titre)} »">
        </span>
        <button type="button" class="idee-jour-corps" data-ouvrir-pub="${echapper(idee.id)}"
          aria-label="Ouvrir « ${echapper(idee.titre)} »">
          <span class="tuile-entete">
            ${idee.pilier ? etiquettePilier(idee.pilier) : ''}
            <span class="etiquette">${echapper(FORMATS[idee.format] ?? idee.format)}</span>
          </span>
          <span class="pub-titre">${echapper(idee.titre)}</span>
          ${idee.preuve ? `<span class="discret pub-preuve">${echapper(idee.preuve)}</span>` : ''}
        </button>
      </div>
    </section>`;
}

// --- Le pipeline de Créer -----------------------------------------------------
// La page raconte le chemin d'une idée : l'étincelle (l'idée du jour), le
// chantier (ce qu'on fabrique), ce qui part (cette semaine), où fouiller (les
// portes). Réorganisée le 15 août 2026 : les données disaient 18 idées, zéro
// programmée, zéro publiée — la page savait collecter, rien n'y faisait
// avancer.

// Ce qui est daté, coupé en deux : la semaine qui vient, et le reste. Pas de
// borne basse — une publication datée d'hier et pas encore publiée reste dans
// la semaine, sobrement : le hub ne compte pas les retards, il ne les efface
// pas non plus.
export function partagerLAVenir(publications, reference = new Date()) {
  const datees = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));
  const borne = versDateISO(ajouterJours(reference, 7));

  return {
    semaine: datees.filter((pub) => pub.date_prevue <= borne),
    plusTard: datees.filter((pub) => pub.date_prevue > borne),
  };
}

// L'établi : les idées qu'on fait avancer, pas encore posées sur un jour. Une
// idée datée vit dans le flux du calendrier — c'est « Cette semaine » qui la
// montre, avec son statut sur la tuile ; la faire figurer deux fois sur la
// même page ne dirait rien de plus.
export function enChantier(publications) {
  return publications.filter(
    (pub) => !pub.date_prevue && ['a_developper', 'brouillon', 'pret'].includes(pub.statut),
  );
}

// Une ligne du flux : la date quand elle existe, le pilier en point coloré, le
// titre, le statut. Le clic ouvre la fiche — corrections et avancées y vivent.
function lignePublication(pub, { avecDate = true } = {}) {
  return `
    <li><button type="button" class="pub-ligne" data-ouvrir-pub="${echapper(pub.id)}"
      aria-label="Ouvrir « ${echapper(pub.titre)} »">
      ${
        avecDate && pub.date_prevue
          ? `<span class="pub-ligne-quand">${echapper(
              echeanceLisible(depuisDateISO(pub.date_prevue)),
            )}</span>`
          : ''
      }
      ${
        pub.pilier
          ? `<span class="point-pilier" data-pilier="${echapper(String(pub.pilier))}"
               aria-hidden="true"></span>`
          : ''
      }
      <span class="pub-ligne-titre">${echapper(pub.titre)}</span>
      <span class="etiquette">${NOMS_STATUTS[pub.statut] ?? pub.statut}</span>
    </button></li>`;
}

function vueCreer(etat) {
  const { semaine, plusTard } = partagerLAVenir(etat.publications);
  const chantier = enChantier(etat.publications);
  const idees = etat.publications.filter(
    (pub) => !pub.date_prevue && pub.statut !== 'publie',
  ).length;

  // Le flux se lit en LIGNES, pas en tuiles (forme validée par Noé, 15 août
  // 2026) : date, point de pilier, titre, statut — et le clic ouvre la fiche,
  // où tous les gestes vivent déjà. Trois familles de formes sur la page :
  // la carte pour le contenu, la ligne pour le flux, la tuile pour les portes.
  const lignes = (liste, reglages = {}) =>
    `<ul class="liste-flux">${liste
      .map((pub) => lignePublication(pub, reglages))
      .join('')}</ul>`;

  // Un vide qui montre son lieu : l'icône du bloc, grande et pâle, au-dessus
  // de la phrase. Une promesse dessinée, pas une ligne d'excuse.
  const videDessine = (icone, phrase) => `
    <p class="vide vide-dessine">
      <span class="vide-icone" aria-hidden="true">${icone}</span>
      <span>${phrase}</span>
    </p>`;

  return `
    ${enTete('creer', etat)}
    ${
      etat.cloture
        ? `<p class="note-cloture">C'est posté. Ferme l'app, la suite se passe dehors.</p>`
        : ''
    }

    ${construireIdeeDuJour(etat.publications)}

    <!-- « Cette semaine » remplace « À venir » (15 août 2026) : c'est le seul
         bloc qui serve le plancher des 2 publications par semaine — en montrant
         CE QUI EST PRÉVU, un effort que Noé contrôle, jamais un compteur de
         manque. Le reste du daté attend replié : la semaine d'abord. -->
    <section class="bloc">
      <h2><span class="etape chiffre">02</span>Cette semaine</h2>
      <div data-bloc="semaine">
        ${
          semaine.length
            ? lignes(semaine)
            : videDessine(
                CALENDRIER,
                `Rien cette semaine — <a href="#yuno/editorial">pose une idée sur un jour</a>.`,
              )
        }
      </div>
      ${
        plusTard.length
          ? `<details class="backlog">
               <summary>Plus tard <span class="chiffre">${plusTard.length}</span></summary>
               ${lignes(plusTard)}
             </details>`
          : ''
      }
    </section>

    <!-- L'établi : le chaînon qui manquait entre la banque et le calendrier.
         C'est lui qui donne un usage aux statuts intermédiaires (à développer,
         brouillon, prêt) — jamais exercés jusqu'ici. Une idée qu'on avance
         depuis sa fiche vient ici, puis se pose sur un jour. -->
    <section class="bloc">
      <h2><span class="etape chiffre">03</span>En chantier</h2>
      <div data-bloc="chantier">
        ${
          chantier.length
            ? lignes(chantier, { avecDate: false })
            : videDessine(
                AMPOULE,
                `L'établi est vide. Fais avancer une idée de la banque :
                 elle passe ici, puis au calendrier.`,
              )
        }
      </div>
    </section>

    <!-- Les deux lieux de l'atelier, chacun avec son métier écrit : la
         distinction (poser sur les jours / fouiller le fonds) ne se lisait pas
         depuis cette page. Le compte d'idées rend la porte vivante. -->
    <section class="bloc">
      <div class="grandes-portes">
        <a class="grande-porte" href="#yuno/editorial">
          <span class="grande-porte-icone" aria-hidden="true">${CALENDRIER}</span>
          <span class="grande-porte-titre">Calendrier<br>éditorial</span>
          <span class="discret grande-porte-sous">Poser sur les jours</span>
        </a>
        <a class="grande-porte" href="#yuno/banque">
          <span class="grande-porte-icone" aria-hidden="true">${AMPOULE}</span>
          <span class="grande-porte-titre">Banque<br>d'idées</span>
          <span class="discret grande-porte-sous"><span class="chiffre">${idees}</span>
            idée${idees > 1 ? 's' : ''} à fouiller</span>
        </a>
      </div>
    </section>

    ${
      // La fiche d'une idée, ouverte depuis la carte du jour ou une ligne du
      // flux. Elle était rendue par la seule banque : depuis Créer, le clic ne
      // menait nulle part (signalé par Noé, 15 août 2026).
      fenetreIdee(etat, { cycle: STATUTS_YUNO, checklist: true, piliers: PILIERS })
    }

    <!-- Les piliers, repliés et en bas de page (15 août 2026) : c'est la
         stratégie de Noé, il la connaît par cœur. La phrase-test suffit au
         quotidien ; le tableau des rôles se relit les jours de doute, pas à
         chaque visite. Un écran entier rendu à l'action. -->
    <section class="bloc piliers-repli">
      <details>
        <summary>Ça rentre dans un pilier ?
          <span class="points-piliers" aria-hidden="true">${[1, 2, 3, 4]
            .map((rang) => `<span class="point-pilier" data-pilier="${rang}"></span>`)
            .join('')}</span>
          Oui → je crée.</summary>
        ${construirePiliers()}
      </details>
    </section>

    ${pied()}`;
}

// La banque a sa page : c'est un fonds où l'on fouille, pas une liste qu'on
// dépasse pour atteindre autre chose. Elle garde l'onglet Créer allumé —
// c'est une pièce de l'atelier, pas un lieu de plus.
function vueBanque(etat) {
  const options = { cycle: STATUTS_YUNO, checklist: true, piliers: PILIERS };
  const retenues = filtrerBanque(etat.publications, etat);

  return `
    ${enTete('banque', etat)}

    <section class="bloc">
      <h2>Banque d'idées</h2>
      <p class="discret banque-intro">Le backlog créatif. Il ne se vide jamais,
        et il ne réclame rien.</p>

      <div class="barre-banque">
        <!-- En listes depuis le 15 août 2026 : les deux derniers menus natifs
             de l'atelier. Comme au CRM, choisir AGIT — la valeur vit sur
             l'option, pas dans un champ. -->
        <span class="filtre-banque">
          <span class="discret">Pilier</span>
          ${menuChoix({
            nom: 'filtre-pilier',
            libelle: 'Filtrer par pilier',
            options: [
              ['tout', 'Tous'],
              ...Object.entries(PILIERS).map(([rang, { nom }]) => [rang, `${rang}. ${nom}`]),
              ['', 'Sans pilier'],
            ],
            valeur: etat.pilier,
            attribut: 'data-filtre-pilier-valeur',
          })}
        </span>
        <span class="filtre-banque">
          <span class="discret">Statut</span>
          ${menuChoix({
            nom: 'filtre-statut-idee',
            libelle: 'Filtrer par statut',
            options: [
              ['tout', 'Tous'],
              ...STATUTS_YUNO.filter((statut) => statut !== 'publie').map((statut) => [
                statut,
                NOMS_STATUTS[statut],
              ]),
            ],
            valeur: etat.statutIdee,
            attribut: 'data-filtre-statut-idee-valeur',
          })}
        </span>
        <span class="discret compte-base"><span class="chiffre">${retenues.length}</span> sur
          <span class="chiffre">${etat.publications.length}</span></span>
      </div>

      <div data-bloc="banque">${construireBanque(retenues, options)}</div>
      <div data-bloc="publiees">${construirePubliees(etat.publications, options)}</div>
    </section>
    ${fenetreIdee(etat, options)}
    ${pied()}`;
}

// La fiche d'une idée, en fenêtre volante : tout ce que l'aperçu ne dit pas —
// la preuve, le « pourquoi chez moi », les notes, la checklist — et tous les
// gestes. On la retrouve par son identifiant à chaque rendu plutôt que de la
// garder en copie : après « Passer en à développer », la fenêtre doit montrer
// le nouveau statut, pas celui d'avant le clic.
function fenetreIdee(etat, options) {
  if (!etat.ideeOuverte) return '';

  const pub = etat.publications.find((idee) => idee.id === etat.ideeOuverte);
  if (!pub) return '';

  return construireFenetre(
    pub.titre,
    `<div class="idee-complete">${corpsPublication(pub, { ...options, fenetre: true })}</div>`,
  );
}

// La même liste sert à dessiner le calendrier et à retrouver un élément quand
// on clique sa barre : elle se fabrique donc une fois, ici.
function elementsDuCalendrier(etat) {
  return assemblerCalendrier({
    evenements: etat.evenements,
    taches: etat.taches,
    objectifs: etat.objectifs,
    publications: etat.publications.filter(
      (pub) => pub.date_prevue && pub.statut !== 'publie',
    ),
    // Une commande livrée n'a plus d'échéance à tenir ; un devis, si.
    commandes: etat.commandes.filter(
      (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
    ),
    relances: etat.contacts.filter((contact) => contact.prochaine_action_date),
  });
}

// Le calendrier éditorial : la même grille que `#yuno/calendrier`, mais elle ne
// porte QUE des publications — ni tâche, ni objectif, ni relance. Poser un mois
// de publications demande de voir les trous, et un trou ne se voit pas si trois
// autres natures les bouchent. D'où aussi l'absence de filtres : il n'y a rien
// à filtrer, la page est son propre filtre.
// À droite, la banque : on ne programme pas en inventant, on programme en
// piochant dans ce qui est déjà noté.
function vueEditorial(etat) {
  const programmees = assemblerCalendrier({
    publications: etat.publications.filter((pub) => pub.date_prevue && pub.statut !== 'publie'),
  });
  // Un Set, pas un tableau : c'est ce qu'attend la grille (`natures.has`).
  const natures = new Set(['publication']);
  const idees = etat.publications
    .filter((pub) => !pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return `
    ${enTete('editorial', etat)}
    <h2 class="titre-page">Calendrier éditorial</h2>
    <!-- Pas de vue « Week-end » ici : l'éditorial programme des publications,
         il n'a rien à faire des rencontres à couvrir. -->
    ${construireBarrePeriode(etat.vueCal, etat.ancreCal)}

    <div class="editorial">
      <div class="editorial-grille" data-bloc="calendrier">
        ${
          etat.vueCal === 'agenda'
            ? construireCalendrier(programmees, natures)
            : construireGrille(programmees, natures,
                // « Week-end » n'existe que du côté du calendrier : ici, le
                // choix retombe sur le mois.
                etat.vueCal === 'weekend' ? 'mois' : etat.vueCal,
                etat.ancreCal, {
                selection: etat.creationCal,
              })
        }
      </div>

      <aside class="editorial-banque" aria-label="Banque d'idées">
        <h3>Banque d'idées <span class="chiffre">${idees.length}</span></h3>
        <p class="discret file-aide">Glisse une idée sur un jour pour la programmer.</p>
        ${
          idees.length
            ? `<ul class="liste-idees-a-poser">${idees
                .map(
                  (pub) => `
                <li class="idee-a-poser" data-poser-idee="${echapper(pub.id)}"
                  title="Glisse-la sur un jour du calendrier">
                  <span class="tuile-entete">
                    ${
                      pub.pilier
                        ? `<span class="etiquette etiquette-pilier" data-pilier="${echapper(
                            String(pub.pilier),
                          )}">${echapper(String(pub.pilier))}</span>`
                        : ''
                    }
                    <span class="etiquette">${echapper(FORMATS[pub.format] ?? pub.format)}</span>
                  </span>
                  <span class="pub-titre">${echapper(pub.titre)}</span>
                </li>`,
                )
                .join('')}</ul>`
            : `<p class="vide">Ta banque est vide. Note une idée depuis Créer.</p>`
        }
      </aside>
    </div>


    ${etat.detailCal ? fenetreDetail(etat.detailCal, { edition: etat.editionCal }) : ''}
    ${
      etat.jourOuvertCal
        ? fenetreJour(etat.jourOuvertCal, elementsDuJour(programmees, etat.jourOuvertCal))
        : ''
    }
    ${pied()}`;
}

// --- Le week-end -------------------------------------------------------------
// Ce que le calendrier ne peut pas montrer : les matchs qu'on POURRAIT couvrir.
// Du vendredi au dimanche, toutes divisions confondues (demande de Noé, 15 août
// 2026) — c'est le rythme du football, et celui d'un photographe qui prépare sa
// semaine.

// Le vendredi de la semaine d'une date. La semaine commence le lundi, le
// week-end s'ouvre donc quatre jours plus tard.
export function vendrediDeLaSemaine(reference = new Date()) {
  return ajouterJours(debutDeSemaine(reference), 4);
}

function construireWeekend(etat) {
  const vendredi = etat.ancreWeekend;
  const dimanche = ajouterJours(vendredi, 2);
  const tous = etat.matchsWeekend;
  const competition = etat.competitionWeekend;

  // La division d'une rencontre vient de son club recevant : le calendrier
  // officiel ne la porte pas, le vivier oui.
  const divisionDe = (match) =>
    etat.pistes.find((piste) => piste.id === match.piste_id)?.division;

  const matchs = !tous
    ? tous
    : competition === 'tout'
      ? tous
      : tous.filter((match) => divisionDe(match) === competition);

  // Un week-end de football, ce sont huit championnats à la fois : le filtre
  // ramène la colonne à une seule compétition (demande de Noé, 15 août 2026).
  // Seules les compétitions qui jouent ce week-end sont offertes — plus celle
  // qui est choisie, même vide, sinon on ne pourrait plus la relâcher.
  const compte = (cle) =>
    !tous ? 0 : cle === 'tout' ? tous.length : tous.filter((m) => divisionDe(m) === cle).length;

  const filtres = [
    ['tout', 'Tout'],
    ...Object.entries(DIVISIONS).filter(
      ([cle]) => compte(cle) > 0 || cle === competition,
    ),
  ]
    .map(
      ([cle, nom]) => `
      <button type="button" data-competition="${cle}"
        aria-pressed="${cle === competition}" class="${cle === competition ? 'actif' : ''}"
        >${echapper(nom)} <span class="chiffre">${compte(cle)}</span></button>`,
    )
    .join('');

  const titre = `${vendredi.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
    → ${dimanche.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;

  // Trois colonnes, une par jour (demande de Noé, 15 août 2026), et les trois
  // toujours là : un vendredi sans match laisse sa colonne vide plutôt que de
  // décaler les deux autres.
  const corps = !matchs
    ? `<p class="vide">…</p>`
    : `<div class="weekend-grille">${[0, 1, 2]
        .map((decalage) => {
          const jour = versDateISO(ajouterJours(vendredi, decalage));
          const dedans = matchs.filter((match) => match.date === jour);

          // Une teinte par jour (demande de Noé, 15 août 2026) : le week-end
          // se lit d'un coup d'œil, on sait dans quelle colonne on est sans
          // relire l'en-tête. Bleu, or, violet — les trois couleurs de Yuno.
          return `
        <section class="weekend-jour" style="--h: ${[222, 45, 280][decalage]}">
          <h4>${echapper(dateLongue(depuisDateISO(jour)))}
            ${dedans.length ? `<span class="discret chiffre">${dedans.length}</span>` : ''}
          </h4>
          ${
            dedans.length
              ? `<ul class="club-matchs">${dedans
            .map((match) => {
              const recevant = etat.pistes.find((piste) => piste.id === match.piste_id);
              if (!recevant) return '';
              const pose = etat.evenements.find(
                (evenement) =>
                  versDateISO(new Date(evenement.date_debut)) === match.date &&
                  (evenement.club_recevant === recevant.id ||
                    evenement.club_visiteur === recevant.id),
              );

              // Une ligne par rencontre, et rien qu'une : la division, l'affiche,
              // la journée, et le calendrier au bout. Vingt matchs par colonne
              // ne tiennent pas autrement (demande de Noé, 15 août 2026).
              return `
                <li>
                  ${pastilleTexte(DIVISIONS[recevant.division] ?? recevant.division)}
                  <span class="contact-nom">${echapper(
                    afficheDuMatch(recevant, match),
                  )}</span>
                  <span class="discret weekend-journee">J${match.journee}</span>
                  ${
                    pose
                      ? `<span class="match-pose" title="Déjà au calendrier"
                          aria-label="Déjà au calendrier">${ICONES_PORTES.matchs}</span>`
                      : `<button type="button" class="poser-match"
                          data-poser-match="${echapper(recevant.id)}"
                          data-match-journee="${match.journee}"
                          data-match-date="${echapper(match.date)}"
                          title="Poser au calendrier"
                          aria-label="Poser ${echapper(
                            afficheDuMatch(recevant, match),
                          )} au calendrier">${ICONES_PORTES.matchs}</button>`
                  }
                </li>`;
                  })
                  .join('')}</ul>`
              : `<p class="vide">Pas de rencontre.</p>`
          }
        </section>`;
        })
        .join('')}</div>`;

  return `
    <div class="cal-nav weekend-nav">
      <button type="button" class="cal-fleche" data-weekend="-1"
        aria-label="Week-end précédent">‹</button>
      <span class="cal-titre">${echapper(titre)}</span>
      <button type="button" class="cal-fleche" data-weekend="1"
        aria-label="Week-end suivant">›</button>
      ${matchs?.length ? `<span class="discret chiffre">${matchs.length}</span>` : ''}
    </div>
    ${tous?.length ? `<div class="filtres" role="group" aria-label="Compétition">${filtres}</div>` : ''}
    ${corps}`;
}

// Les deux clubs de l'affiche, ajoutés au formulaire de modification d'un
// événement (demande de Noé, 15 août 2026). Un match posé depuis le vivier
// arrive déjà relié ; un match noté à la main, ou vécu avant que le lien
// n'existe, ne l'est pas — et sans lien, il ne compte nulle part.
//
// On écrit le NOM du club, comme « Rattaché à » sur une fiche du réseau : même
// geste, même règle — le nom exact relie, autre chose délie —, avec la liste du
// vivier en appui pour ne pas avoir à l'orthographier de mémoire.
export function champsDesClubs(element, pistes = []) {
  if (element?.type !== 'evenement') return [];

  const noms = [...pistes]
    .map((piste) => piste.nom)
    .sort((a, b) => a.localeCompare(b, 'fr'));
  const nomDe = (id) => pistes.find((piste) => piste.id === id)?.nom ?? '';

  return [
    {
      nom: 'club_recevant',
      libelle: 'Club qui reçoit (son nom au vivier)',
      type: 'text',
      suggestions: noms,
      valeur: nomDe(element.source?.club_recevant),
    },
    {
      nom: 'club_visiteur',
      libelle: 'Club qui se déplace',
      type: 'text',
      suggestions: noms,
      valeur: nomDe(element.source?.club_visiteur),
    },
  ];
}

function vueCalendrier(etat) {
  const elements = elementsDuCalendrier(etat);

  return `
    ${enTete('calendrier', etat)}
    ${construireBarrePeriode(etat.vueCal, etat.ancreCal, {
      // Les rencontres qu'on POURRAIT couvrir : une vue de Yuno seul, le hub
      // n'a pas de vivier.
      vuesEnPlus: { weekend: 'Week-end' },
    })}
    ${etat.vueCal === 'weekend' ? '' : construireFiltres(etat.natures)}
    <div data-bloc="calendrier">
      ${
        etat.vueCal === 'weekend'
          ? construireWeekend(etat)
          : etat.vueCal === 'agenda'
            ? construireCalendrier(elements, etat.natures)
            : construireGrille(elements, etat.natures, etat.vueCal, etat.ancreCal, {
                selection: etat.creationCal,
              })
      }
    </div>

    ${
      etat.detailCal
        ? fenetreDetail(etat.detailCal, {
            edition: etat.editionCal,
            actions: actionsPreparation(etat),
            champsEnPlus: champsDesClubs(etat.detailCal, etat.pistes),
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

// --- Les préparations --------------------------------------------------------
// La feuille d'une sortie : trois phases de cases à cocher, copiées d'un
// modèle, puis un bilan en deux questions. Un item non coché n'est JAMAIS un
// raté : rien ici ne compte les manqués, le bilan dit d'abord l'obtenu.

// La sortie de cette feuille, si elle est déjà au carnet. Depuis la fusion,
// c'est l'événement lui-même qui le dit : `vecu`. Une feuille de commande n'a
// pas d'événement — la case du bilan ne s'y offre qu'une fois, ce qui suffit à
// interdire le doublon.
export function momentDeLaFeuille(evenements, feuille) {
  if (!feuille.evenement_id) return null;
  const sortie = evenements.find((candidat) => candidat.id === feuille.evenement_id);
  return sortie?.vecu ? sortie : null;
}

// Le bilan attend que la sortie soit vécue : avant sa date, la feuille dit
// juste qu'il viendra. Une feuille sans date l'offre tout de suite.
//
// Au PREMIER enregistrement, il propose d'inscrire le moment au carnet — la
// photo, les rencontres, et la case « Noter ce moment au carnet », cochée
// d'avance : le chemin normal ne demande rien de plus, mais Noé reste l'auteur
// (décision du 14 août 2026). La proposition disparaît si le moment existe
// déjà ; ensuite, le moment se corrige au Journal, pas d'ici.
function blocBilan(etat, feuille) {
  const ouvert = !feuille.date || feuille.date <= versDateISO();

  if (!ouvert) {
    return `
      <section class="bloc prepa-bilan">
        <h2>Bilan</h2>
        <p class="vide">Il s'écrira une fois la sortie vécue.</p>
      </section>`;
  }

  const dejaAuCarnet = momentDeLaFeuille(etat.evenements, feuille);
  const proposerLeMoment = !feuille.bilan_date && !dejaAuCarnet;

  return `
    <section class="bloc prepa-bilan">
      <h2>Bilan</h2>
      ${
        feuille.bilan_date
          ? `<p class="discret">Noté le ${echapper(
              depuisDateISO(feuille.bilan_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              }),
            )}.</p>`
          : ''
      }
      ${dejaAuCarnet ? `<p class="discret">Ce moment est au carnet.</p>` : ''}
      <form data-action="noter-bilan" class="ajout">
        <input type="hidden" name="id" value="${echapper(feuille.id)}">
        <label for="prepa-bilan-bien">Ce qui a marché</label>
        <textarea id="prepa-bilan-bien" name="bilan_bien" rows="3">${echapper(
          feuille.bilan_bien ?? '',
        )}</textarea>
        <label for="prepa-bilan-mieux">À refaire autrement</label>
        <textarea id="prepa-bilan-mieux" name="bilan_mieux" rows="3">${echapper(
          feuille.bilan_mieux ?? '',
        )}</textarea>
        ${
          proposerLeMoment
            ? `
        <label for="prepa-bilan-photo">La photo dont je suis fier</label>
        <input type="file" id="prepa-bilan-photo" name="photo" accept="image/*">
        <label for="prepa-bilan-rencontres">Qui j'ai rencontré (sépare par une barre oblique)</label>
        <input type="text" id="prepa-bilan-rencontres" name="rencontres" autocomplete="off"
          list="prepa-rencontres-connues">
        <datalist id="prepa-rencontres-connues">${etat.contacts
          .map((contact) => `<option value="${echapper(contact.nom)}"></option>`)
          .join('')}</datalist>
        <label class="prepa-au-modele">
          <input type="checkbox" name="carnet" value="oui" checked>
          Noter ce moment au carnet</label>`
            : ''
        }
        <button type="submit">${feuille.bilan_date ? 'Mettre à jour le bilan' : 'Enregistrer le bilan'}</button>
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </section>`;
}

// Le modèle se choisit AUSSI depuis la feuille (demande de Noé, 24 août
// 2026) : avec un seul modèle, « Préparer » l'applique d'office — il faut
// pouvoir corriger le tir, ou compléter la feuille d'un autre modèle.
// Appliquer AJOUTE les lignes manquantes (même phase et même texte = déjà
// là) : rien de coché ne bouge — la feuille ne perd jamais ce qui est fait —
// et une ligne en trop se retire d'une croix, comme n'importe laquelle. La
// feuille retient le modèle appliqué : c'est lui qui sert au rappel du
// dernier bilan et à « aussi au modèle ».
function blocModeleFeuille(etat, feuille) {
  if (!etat.modelesPrepa.length) return '';

  const actuel = etat.modelesPrepa.find((modele) => modele.id === feuille.modele_id) ?? null;

  return `
    <details class="ajout prepa-changer-modele">
      <summary>${
        actuel
          ? `Modèle : ${echapper(actuel.nom)} — changer ou compléter`
          : 'Appliquer un modèle'
      }</summary>
      <p class="discret">Appliquer un modèle ajoute ses lignes manquantes — rien de
        coché ne bouge, et une ligne en trop se retire de sa croix.</p>
      <ul class="liste-choix-modeles">
        ${etat.modelesPrepa
          .map(
            (modele) => `
          <li><button type="button" class="choix-modele"
            data-appliquer-modele="${echapper(modele.id)}">
            <span>${echapper(modele.nom)}${
              modele.id === feuille.modele_id ? ' · le modèle de la feuille' : ''
            }</span>
            <span class="discret"><span class="chiffre">${modele.items.length}</span> lignes</span>
          </button></li>`,
          )
          .join('')}
      </ul>
    </details>`;
}

function vueFeuille(etat, feuille) {
  const precedent = feuille.bilan_date ? null : dernierBilan(etat.preparations, feuille);
  const auModele = etat.modelesPrepa.some((modele) => modele.id === feuille.modele_id);

  return `
    ${enTete('preparations', etat)}
    <h2 class="titre-page">${echapper(feuille.titre)}</h2>
    ${
      feuille.date
        ? `<p class="discret prepa-date">${echapper(
            echeanceLisible(depuisDateISO(feuille.date)),
          )}</p>`
        : ''
    }
    ${
      precedent
        ? `<p class="discret prepa-rappel">Ton dernier bilan — à refaire autrement :
             « ${echapper(precedent.bilan_mieux)} »</p>`
        : ''
    }
    ${blocModeleFeuille(etat, feuille)}
    <div class="prepa-phases">
      ${blocPhase(feuille, 'avant', { auModele })}
      ${blocPhase(feuille, 'pendant', { auModele, invitePendant: 'Ajouter un plan…' })}
      ${blocPhase(feuille, 'apres', { auModele })}
    </div>
    ${blocBilan(etat, feuille)}
    <p><button type="button" class="lien-discret" data-supprimer-prepa="${echapper(feuille.id)}">
      Supprimer la préparation</button></p>
    ${pied()}`;
}

function vuePreparations(etat) {
  // Une adresse qui pointe une feuille connue ouvre la feuille ; sinon, la
  // liste — un identifiant périmé ne mérite pas un écran cassé.
  const feuille = etat.feuilleOuverte
    ? etat.preparations.find((candidat) => candidat.id === etat.feuilleOuverte)
    : null;
  if (feuille) return vueFeuille(etat, feuille);

  return `
    ${enTete('preparations', etat)}
    <h2 class="titre-page">Préparations</h2>
    <section class="bloc">
      ${
        // En tuiles compactes, plus hautes que larges, côte à côte (demande
        // de Noé, 21 août 2026 au soir) : une rangée de feuilles se parcourt
        // d'un coup d'œil, là où les lignes empilées mangeaient la page.
        etat.preparations.length
          ? `<ul class="tuiles-preparations">${etat.preparations
              .map(
                (candidat) => `
              <li><a class="tuile-prepa" href="#yuno/preparations/${echapper(candidat.id)}">
                <span class="tuile-prepa-titre">${echapper(candidat.titre)}</span>
                <span class="discret tuile-prepa-date">${
                  candidat.date
                    ? echapper(echeanceLisible(depuisDateISO(candidat.date)))
                    : ''
                }</span>
                ${candidat.bilan_date ? '<span class="etiquette">Bilan écrit</span>' : ''}
              </a></li>`,
              )
              .join('')}</ul>`
          : `<p class="vide">Ta première préparation s'ouvrira ici — depuis un événement
               du calendrier, touche « Préparer ».</p>`
      }
    </section>

    <section class="bloc">
      <h2>Modèles</h2>
      ${
        etat.modelesPrepa.length
          ? `<ul class="liste-preparations">${etat.modelesPrepa
              .map(
                (modele) => `
              <li><a class="prepa-ligne" href="#yuno/modeles/${echapper(modele.id)}">
                <span class="prepa-ligne-titre">${echapper(modele.nom)}</span>
                <span class="discret"><span class="chiffre">${modele.items.length}</span> lignes</span>
              </a></li>`,
              )
              .join('')}</ul>`
          : ''
      }
      <form data-action="creer-modele-prepa" class="prepa-ajout">
        <input type="text" name="nom" autocomplete="off" required
          aria-label="Nom du nouveau modèle" placeholder="Nouveau modèle — son nom…">
        <button type="submit" class="bouton-secondaire bouton-mini">Créer</button>
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </section>

    ${pied()}`;
}

// --- L'éditeur d'un modèle ---
// Les items s'éditent en place, comme les modèles de messages de la
// Passerelle : le texte se corrige dans son champ et s'enregistre en le
// quittant, sans bouton. Modifier un modèle ne touche aucune feuille passée.

function blocPhaseModele(modele, phase) {
  const items = modele.items.filter((item) => item.phase === phase);

  return `
    <section class="bloc prepa-phase">
      <h2>${PHASES_PREPA[phase]}</h2>
      ${
        items.length
          ? `<ul class="liste-taches-pleine prepa-liste">${items
              .map(
                (item) => `
            <li class="tache-ligne">
              <input type="text" class="modele-item" data-item-modele="${echapper(item.id)}"
                value="${echapper(item.texte)}" aria-label="Texte de la ligne">
              <button type="button" class="lien-discret bouton-mini bouton-retirer"
                data-retirer-item-modele="${echapper(item.id)}"
                title="Retirer cette ligne"
                aria-label="Retirer « ${echapper(item.texte)} »">×</button>
            </li>`,
              )
              .join('')}</ul>`
          : ''
      }
      <form data-action="ajouter-item-modele" data-phase="${phase}" class="prepa-ajout">
        <input type="hidden" name="modele_id" value="${echapper(modele.id)}">
        <input type="hidden" name="phase" value="${phase}">
        <input type="text" name="texte" autocomplete="off" required
          aria-label="Ajouter à « ${PHASES_PREPA[phase]} »"
          placeholder="${phase === 'pendant' ? 'Ajouter un plan…' : 'Ajouter…'}">
        <button type="submit" class="bouton-secondaire bouton-mini">Ajouter</button>
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </section>`;
}

function vueModele(etat) {
  const modele = etat.modelesPrepa.find((candidat) => candidat.id === etat.feuilleOuverte);
  // Modèle inconnu (supprimé, adresse périmée) : la liste, pas un écran cassé.
  if (!modele) return vuePreparations({ ...etat, feuilleOuverte: null });

  return `
    ${enTete('modeles', etat)}
    <h2 class="titre-page">Modèle</h2>
    <input type="text" class="prepa-modele-nom" data-nom-modele="${echapper(modele.id)}"
      value="${echapper(modele.nom)}" aria-label="Nom du modèle">
    <p class="discret">Il se copie dans chaque nouvelle feuille — le modifier ne
      change pas les feuilles déjà créées.</p>
    <div class="prepa-phases">
      ${blocPhaseModele(modele, 'avant')}
      ${blocPhaseModele(modele, 'pendant')}
      ${blocPhaseModele(modele, 'apres')}
    </div>
    <p><button type="button" class="lien-discret" data-supprimer-modele-prepa="${echapper(modele.id)}">
      Supprimer le modèle</button></p>
    ${pied()}`;
}

// Le bouton d'une sortie : la préparer, ou rouvrir sa feuille si elle existe.
// Il sert à la fenêtre de détail du calendrier ET aux tuiles de commandes.
// --- La sortie du moment, sur l'accueil ---------------------------------------
// Le jour d'un match, ce qui compte n'est ni le mur ni les objectifs : c'est ce
// qu'il reste à faire avant de partir, puis sur place, puis au retour. L'accueil
// montre donc la phase courante de la feuille et ouvre la porte vers elle.

// Combien de temps À L'AVANCE une sortie monte sur l'accueil (demande de Noé,
// 26 août 2026). Sans cette borne, un match posé trois semaines plus tôt
// occupait le haut de l'accueil pendant trois semaines — et une préparation
// qu'on ne peut pas encore faire n'est pas un rappel, c'est du décor. Deux
// jours, c'est le moment où charger les batteries et vider les cartes devient
// une vraie tâche.
//
// La feuille, elle, n'attend pas : elle se crée et se remplit quand on veut,
// depuis le calendrier ou l'espace des missions. C'est l'ACCUEIL qui se tait.
const AVANT_MONTE_A = 48 * 60 * 60 * 1000;

// La sortie dont on parle sur l'accueil : celle qui est en cours, celle qui
// vient de finir (moins de 24 h), ou la prochaine si elle est à moins de deux
// jours — dans cet ordre, qui est simplement l'ordre du temps. Une sortie
// commencée passe donc devant une sortie à venir, y compris le lendemain d'un
// match : pendant ces 24 h, ce qu'on a à faire, c'est trier et retoucher.
//
// Les répétitions ne sont pas dépliées : une feuille de préparation appartient
// à un événement, pas à une occurrence, et chez Yuno un match ne se répète pas.
export function sortieDuMoment(evenements, reference = new Date()) {
  const assezProche = (sortie) =>
    new Date(sortie.date_debut) - reference <= AVANT_MONTE_A;

  return (
    evenements
      .filter((sortie) => {
        const phase = phaseDeLaSortie(sortie, reference);
        if (phase === null) return false;
        // Seul « avant » attend son tour : une sortie en cours ou qui vient de
        // finir est là, quelle que soit la date à laquelle on l'avait posée.
        return phase === 'avant' ? assezProche(sortie) : true;
      })
      .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0] ?? null
  );
}

// Ce que la fenêtre de détail du calendrier propose en plus, pour ce qui se
// prépare : un événement ou une commande.
function actionsPreparation(etat) {
  const element = etat.detailCal;
  if (!element || !['evenement', 'commande'].includes(element.type)) return '';

  return boutonPreparer(
    feuilleDeLaSortie(etat.preparations, element.type, element.id),
    element.type,
    element.id,
  );
}

// Plusieurs modèles : le choix se fait dans une LISTE, en fenêtre volante —
// jamais dans un menu natif. Un seul modèle ne pose pas de question.
function fenetreChoixModele(etat) {
  return construireFenetre(
    'Préparer',
    `
    <h3 class="fenetre-titre">Préparer « ${echapper(etat.choixPrepa.titre)} »</h3>
    <p class="discret">Avec quel modèle ?</p>
    <ul class="liste-choix-modeles">
      ${etat.modelesPrepa
        .map(
          (modele) => `
        <li><button type="button" class="choix-modele" data-modele-choisi="${echapper(modele.id)}">
          <span>${echapper(modele.nom)}</span>
          <span class="discret"><span class="chiffre">${modele.items.length}</span> lignes</span>
        </button></li>`,
        )
        .join('')}
      <li><button type="button" class="choix-modele" data-modele-choisi="">
        <span>Feuille vierge</span>
        <span class="discret">sans modèle</span>
      </button></li>
    </ul>`,
  );
}

// --- Le réseau --------------------------------------------------------
// Ce qu'une fiche doit rendre en trois secondes : le contact, et à qui la
// personne est rattachée (docs/yuno-spec.md, §4).

// --- Un choix en liste, hors formulaire -------------------------------------
// « Un choix se fait dans une LISTE, jamais dans un `select` natif » — la règle
// du 13 août valait pour la tuile de capture ; le CRM gardait deux menus du
// système (les filtres et la relation d'un contact), que Noé a fait passer à la
// liste le 15 août 2026.
//
// La différence avec les choix de formulaire (`espace-projet.js`) : ici rien
// n'est saisi pour être envoyé plus tard — choisir AGIT tout de suite. Il n'y a
// donc pas de champ caché, et les options portent l'attribut de leur geste
// (`data-filtre-colonne`, `data-statut`) que l'espace écoute déjà.
//
// L'ouverture, la fermeture et « un seul panneau à la fois » viennent du
// composant commun : c'est `data-choix-champ` + `data-ouvrir-choix` qui les
// apportent, et `brancherCapture` les branche déjà dans cet espace.
// `couleurDe(cle)` rend la classe et la teinte d'une valeur, quand elles en ont
// une. Elle habille l'option DANS le menu et la valeur choisie sur le
// déclencheur : une relation se reconnaît à sa couleur avant de se lire.
//
// La classe et le style sont fusionnés dans les attributs du bouton, jamais
// ajoutés à côté : **deux attributs `class` sur un même élément, et le second
// est ignoré en silence** — c'est ce qui avait éteint la couleur du statut en
// passant du menu natif à la liste.
// `tete` habille le déclencheur autrement que la valeur choisie : sur une carte
// de la Passerelle, la pastille montre le NOM de la personne et la couleur de
// son type, et c'est le panneau qui parle de la relation. Sans elle, le
// déclencheur dit la valeur, comme partout ailleurs.
function menuChoix({ nom, libelle, options, valeur, attribut, couleurDe = null, tete = null }) {
  const choisi = options.find(([cle]) => String(cle) === String(valeur));

  const habiller = (cle) => {
    const couleur = couleurDe?.(cle);
    if (!couleur) return { classe: '', style: '' };
    return {
      classe: couleur.teinte === null ? 'choix-statut choix-statut-neutre' : 'choix-statut',
      style: couleur.teinte === null ? '' : ` style="--h: ${couleur.teinte}"`,
    };
  };

  const apparence = tete
    ? {
        classe: tete.teinte === null || tete.teinte === undefined
          ? 'choix-statut choix-statut-neutre'
          : 'choix-statut',
        style: tete.teinte === null || tete.teinte === undefined ? '' : ` style="--h: ${tete.teinte}"`,
      }
    : habiller(choisi?.[0]);

  return `
    <span class="choix-champ choix-en-place" data-choix-champ="${echapper(nom)}">
      <button type="button" class="choix-declencheur ${apparence.classe}" data-ouvrir-choix
        aria-expanded="false" aria-haspopup="listbox"${apparence.style}
        ${libelle ? `aria-label="${echapper(libelle)}"` : ''}
        >${echapper(tete?.texte ?? choisi?.[1] ?? 'Choisir')}${CHEVRON}</button>
      <div class="choix-panneau" hidden>
        <ul class="choix-capture">
          ${options
            .map(([cle, texte]) => {
              const { classe, style } = habiller(cle);
              return `
            <li><button type="button" ${attribut}="${echapper(String(cle))}"
              aria-pressed="${String(cle) === String(valeur)}"
              class="${String(cle) === String(valeur) ? 'actif' : ''}"
              ><span class="${classe}"${style}>${echapper(texte)}</span></button></li>`;
            })
            .join('')}
        </ul>
      </div>
    </span>`;
}

const TYPES_CONTACT = {
  joueur: 'Joueur',
  // Les confrères du bord terrain (14 août 2026) : ce sont eux qu'on croise le
  // plus en couvrant un match, et « autre » ne les rangeait pas.
  photographe: 'Photographe',
  club: 'Club',
  media: 'Média',
  agence: 'Agence',
  marque: 'Marque',
  autre: 'Autre',
};

// La teinte d'un type vient de la MÊME règle que le CRM — le hachage de son
// libellé (`teinte`) — pour qu'un joueur soit du même violet des deux côtés du
// site, et une personne du club du même turquoise. Une seule source, pas une
// table parallèle qui divergerait au premier type ajouté.
function teinteDuType(type) {
  return teinte(TYPES_CONTACT[type] ?? type ?? 'Autre');
}

// Où en est la relation. Repris du tableau Notion de Noé, dans son ordre de
// progression : c'est lui qui fait du carnet un CRM plutôt qu'un annuaire.
// Chaque statut a sa teinte fixe — aucune ne signale une alerte.
// L'échelle des relations. « À relancer » est entré le 15 août 2026 entre le
// message et la relance : un message resté sans suite à la fin de la semaine
// n'est pas un échec, c'est une relance due. « Répondu » est parti le même
// jour — la valeur reste acceptée en base (un CHECK s'élargit, il ne se
// resserre jamais) mais l'interface ne l'offre plus.
const STATUTS_CONTACT = {
  pas_de_contact: { nom: 'Pas de contact', teinte: null },
  message_envoye: { nom: 'Message envoyé', teinte: 215 },
  a_relancer: { nom: 'À relancer', teinte: 30 },
  relance: { nom: 'Relancé', teinte: 255 },
  // Doré pour « établi », vert pour « bon » — l'ordre du tableau Notion de Noé.
  contact_etabli: { nom: 'Contact établi', teinte: 42 },
  bon_contact: { nom: 'Bon contact', teinte: 152 },
  opportunite: { nom: 'Opportunité', teinte: 310 },
};

// Un statut qui n'est plus offert reste lisible : une fiche ancienne ne doit
// pas afficher sa clé brute.
const STATUTS_RETIRES = { repondu: { nom: 'Répondu', teinte: 195 } };

function statutLisible(cle) {
  return STATUTS_CONTACT[cle] ?? STATUTS_RETIRES[cle] ?? { nom: cle ?? '', teinte: null };
}

// Les trois niveaux d'aller-vers (1 Répondre · 2 Relancer · 3 Ouvrir) sont
// partis le 15 août 2026 avec la file qu'ils rangeaient : la Passerelle v2 ne
// s'en sert plus, et la colonne du CRM ne faisait plus que la demander. La
// colonne `contacts.niveau` RESTE en base, avec ses valeurs — on ne détruit
// pas des données pour retirer un écran.

// Où va la relation après un envoi de plus. Une relation vivante ne redescend
// jamais : écrire à quelqu'un qui a répondu ne le ramène pas à « relancé ».
export function statutApresEnvoi(statut) {
  if (!statut || statut === 'pas_de_contact') return 'message_envoye';
  // Écrire à quelqu'un qu'on devait relancer, c'est l'avoir relancé.
  if (statut === 'message_envoye' || statut === 'a_relancer' || statut === 'relance') {
    return 'relance';
  }
  return statut;
}

// Le lundi, un message resté sans suite devient une relance due. Le site est
// statique : la bascule se fait à l'ouverture de la Passerelle, sur les fiches
// écrites AVANT la semaine en cours. Sans date d'envoi, on ne touche à rien —
// on ne sait pas quand le message est parti, et on n'invente pas un retard.
export function fichesABasculer(contacts, reference = new Date()) {
  const debut = versDateISO(debutDeSemaine(reference));
  return contacts.filter(
    (contact) =>
      contact.statut === 'message_envoye' &&
      contact.date_dernier_envoi &&
      contact.date_dernier_envoi < debut,
  );
}

// Une teinte stable par valeur : « Rennes » garde la même couleur d'une visite
// à l'autre, comme les étiquettes de Notion. Douze teintes bien réparties, et
// une somme des caractères pour choisir — il ne s'agit que de distinguer.
const TEINTES = [8, 30, 45, 90, 150, 175, 195, 215, 255, 280, 310, 335];

function teinte(texte) {
  let somme = 0;
  for (const caractere of String(texte)) somme += caractere.codePointAt(0);
  return TEINTES[somme % TEINTES.length];
}

function pastilleTexte(valeur, teinteChoisie) {
  if (teinteChoisie === null) {
    return `<span class="tag tag-neutre">${echapper(valeur)}</span>`;
  }
  return `<span class="tag" style="--h: ${teinteChoisie ?? teinte(valeur)}">${echapper(valeur)}</span>`;
}

// L'identifiant peut être saisi avec ou sans arobase, ou collé en URL entière.
function pseudoInstagram(valeur) {
  return valeur
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
}

// Le carnet est une BASE : une liste de fiches, et plusieurs façons de la
// regarder. Le tri, la recherche et le filtre agissent sur la base ; l'affichage
// (tableau ou fiches) ne fait que la dessiner. Ajouter une vue plus tard —
// groupée par structure, par exemple — ne demandera que d'ajouter un dessin.

// Les colonnes de la base. Une colonne sait quatre choses, et rien d'autre :
//   `valeur`  — se comparer, pour le tri
//   `texte`   — se chercher, quand ça diffère du tri (le statut se trie sur son
//               rang mais se cherche sur son libellé)
//   `cellule` — se dessiner
//   `filtre`  — se filtrer, pour les colonnes à valeurs limitées. Les choix
//               proposés se déduisent des données présentes, comme dans Notion :
//               un club qui n'est dans le carnet de personne n'a pas à figurer
//               dans la liste.
// Ajouter une colonne filtrable ne demande donc rien d'autre que de la décrire.
const COLONNES = [
  {
    cle: 'nom',
    titre: 'Nom',
    valeur: (contact) => contact.nom ?? '',
    cellule: (contact) => `<strong>${echapper(contact.nom)}</strong>`,
  },
  {
    cle: 'type',
    titre: 'Type',
    valeur: (contact) => TYPES_CONTACT[contact.type] ?? contact.type ?? '',
    cellule: (contact) =>
      pastilleTexte(TYPES_CONTACT[contact.type] ?? contact.type),
    filtre: {
      cle: (contact) => contact.type ?? '',
      libelle: (contact) => TYPES_CONTACT[contact.type] ?? contact.type ?? '',
    },
  },
  {
    cle: 'statut',
    titre: 'Relation',
    valeur: (contact) => {
      // Le tri suit la progression, pas l'alphabet : « Bon contact » est un
      // aboutissement, pas un début.
      const ordre = Object.keys(STATUTS_CONTACT).indexOf(contact.statut);
      return ordre < 0 ? '' : String(ordre);
    },
    texte: (contact) => statutLisible(contact.statut).nom,
    cellule: (contact) => {
      // Le geste vit sur chaque option (`data-statut`), pas sur un menu du
      // système : l'espace écoute déjà cet attribut, il n'a rien changé.
      // L'identifiant du contact voyage sur le conteneur, que le gestionnaire
      // relit — une option ne peut pas porter à la fois sa valeur et son sujet.
      return `<span data-statut-de="${echapper(contact.id)}">${menuChoix({
        nom: `statut-${contact.id}`,
        libelle: `Relation avec ${contact.nom}`,
        options: Object.entries(STATUTS_CONTACT).map(([valeur, { nom }]) => [valeur, nom]),
        valeur: contact.statut,
        attribut: 'data-statut',
        // Chaque relation porte sa teinte, sur le déclencheur comme dans le
        // menu (demande de Noé, 15 août 2026) : sept valeurs qui se suivent se
        // distinguent mieux par la couleur que par la lecture.
        couleurDe: statutLisible,
      })}</span>`;
    },
    filtre: {
      cle: (contact) => contact.statut ?? '',
      libelle: (contact) => statutLisible(contact.statut).nom,
      // Les statuts se rangent dans leur progression, pas par ordre alphabétique.
      ordre: (contact) => Object.keys(STATUTS_CONTACT).indexOf(contact.statut),
    },
  },
  {
    cle: 'objectif',
    titre: 'Objectif',
    valeur: (contact) => contact.objectif ?? '',
    cellule: (contact) =>
      contact.objectif
        ? echapper(contact.objectif)
        : '<span class="discret">—</span>',
  },
  {
    cle: 'structure',
    titre: 'Rattaché à',
    valeur: (contact) => contact.structure ?? '',
    cellule: (contact) =>
      contact.structure
        ? pastilleTexte(contact.structure)
        : '<span class="discret">—</span>',
    filtre: {
      cle: (contact) => contact.structure ?? '',
      libelle: (contact) => contact.structure || 'Sans rattachement',
    },
  },
  {
    cle: 'telephone',
    titre: 'Téléphone',
    valeur: (contact) => contact.telephone ?? '',
    cellule: (contact) => lienTelephone(contact) ?? '<span class="discret">—</span>',
  },
  {
    cle: 'instagram',
    titre: 'Instagram',
    valeur: (contact) => contact.instagram ?? '',
    cellule: (contact) => lienInstagram(contact) ?? '<span class="discret">—</span>',
  },
  {
    cle: 'email',
    titre: 'E-mail',
    valeur: (contact) => contact.email ?? '',
    cellule: (contact) => lienEmail(contact) ?? '<span class="discret">—</span>',
  },
];

export const AFFICHAGES = { tableau: 'Tableau', fiches: 'Fiches' };

// Un contact peut avoir deux comptes ou deux adresses — le carnet de Noé en
// contient, séparés par une barre oblique. Chacun devient son propre lien.
function separer(valeur) {
  return String(valeur)
    .split(/\s*[/,]\s*/)
    .map((morceau) => morceau.trim())
    .filter(Boolean);
}

function joindre(liens) {
  return liens.join('<span class="discret"> · </span>');
}

function lienInstagram(contact) {
  if (!contact.instagram) return null;
  return joindre(
    separer(contact.instagram).map((brut) => {
      const pseudo = pseudoInstagram(brut);
      return `<a href="https://instagram.com/${encodeURIComponent(pseudo)}"
        target="_blank" rel="noopener">@${echapper(pseudo)}</a>`;
    }),
  );
}

function lienEmail(contact) {
  if (!contact.email) return null;
  return joindre(
    separer(contact.email).map(
      (adresse) =>
        `<a href="mailto:${encodeURIComponent(adresse)}">${echapper(adresse)}</a>`,
    ),
  );
}

function lienTelephone(contact) {
  if (!contact.telephone) return null;
  return joindre(
    separer(contact.telephone).map(
      (numero) =>
        `<a href="tel:${echapper(numero.replace(/\s/g, ''))}">${echapper(numero)}</a>`,
    ),
  );
}

function boutonRetirer(contact) {
  return `<button type="button" class="lien-discret bouton-mini bouton-retirer"
    data-supprimer-contact="${echapper(contact.id)}"
    title="Retirer du réseau"
    aria-label="Retirer ${echapper(contact.nom)}">×</button>`;
}

// Les colonnes qui savent se filtrer.
export const COLONNES_FILTRABLES = COLONNES.filter((colonne) => colonne.filtre);

// --- L'ordre des colonnes ----------------------------------------------------
// C'est une préférence d'affichage, pas une donnée : elle vit dans le
// navigateur, pas en base. Un ordre qui se perdrait au rechargement ne servirait
// à rien, d'où la persistance ; mais il n'a rien à faire dans Supabase.

const CLE_ORDRE = 'yuno-ordre-colonnes';

// L'objectif doux suit la même règle que l'ordre des colonnes : c'est un
// réglage personnel, pas une donnée. Il vit dans le navigateur.
const CLE_OBJECTIF_DOUX = 'yuno-objectif-doux';

export function objectifDouxEnregistre() {
  try {
    const brut = Number(localStorage.getItem(CLE_OBJECTIF_DOUX));
    return brut > 0 ? brut : 1;
  } catch {
    return 1;
  }
}

function retenirObjectifDoux(valeur) {
  try {
    localStorage.setItem(CLE_OBJECTIF_DOUX, String(valeur));
  } catch {
    // Navigation privée, quota plein : le réglage tient pour la visite.
  }
}

// Les pistes « passées » de la semaine. Passer un club est un choix d'écran,
// pas un fait sur le club — il vit dans le navigateur, jamais en base, et
// s'efface de lui-même au changement de semaine.
const CLE_PISTES_PASSEES = 'yuno-pistes-passees';

function pistesPasseesEnregistrees() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_PISTES_PASSEES));
    return brut?.semaine === versDateISO(debutDeSemaine()) ? (brut.ids ?? []) : [];
  } catch {
    return [];
  }
}

function retenirPistesPassees(ids) {
  try {
    localStorage.setItem(
      CLE_PISTES_PASSEES,
      JSON.stringify({ semaine: versDateISO(debutDeSemaine()), ids }),
    );
  } catch {
    // Navigation privée, quota plein : les passages tiennent pour la visite.
  }
}

export function ordreEnregistre() {
  try {
    const brut = localStorage.getItem(CLE_ORDRE);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
}

function retenirOrdre(ordre) {
  try {
    localStorage.setItem(CLE_ORDRE, JSON.stringify(ordre));
  } catch {
    // Navigation privée, quota plein : l'ordre tient pour la visite, tant pis.
  }
}

// Les colonnes dans l'ordre demandé. Toute colonne absente de l'ordre est
// ajoutée à la fin : ajouter une colonne au code ne doit pas la faire
// disparaître chez qui a déjà un ordre enregistré.
export function colonnesOrdonnees(ordre) {
  if (!Array.isArray(ordre) || !ordre.length) return COLONNES;

  const connues = ordre
    .map((cle) => COLONNES.find((colonne) => colonne.cle === cle))
    .filter(Boolean);
  const nouvelles = COLONNES.filter((colonne) => !ordre.includes(colonne.cle));
  return [...connues, ...nouvelles];
}

// Déplacer une colonne d'un cran, ou la poser à une place précise.
export function deplacerColonne(ordre, cle, versIndex) {
  const actuel = colonnesOrdonnees(ordre).map((colonne) => colonne.cle);
  const depuis = actuel.indexOf(cle);
  if (depuis < 0) return actuel;

  const cible = Math.max(0, Math.min(actuel.length - 1, versIndex));
  const suite = [...actuel];
  suite.splice(depuis, 1);
  suite.splice(cible, 0, cle);
  retenirOrdre(suite);
  return suite;
}

// Les choix d'un filtre, déduits des données présentes et comptés — un filtre
// qui propose « Rennes (9) » dit déjà quelque chose du carnet.
export function choixDuFiltre(contacts, colonne) {
  const vus = new Map();
  for (const contact of contacts) {
    const cle = colonne.filtre.cle(contact);
    if (!vus.has(cle)) {
      vus.set(cle, {
        cle,
        libelle: colonne.filtre.libelle(contact),
        ordre: colonne.filtre.ordre ? colonne.filtre.ordre(contact) : null,
        compte: 0,
      });
    }
    vus.get(cle).compte += 1;
  }

  return [...vus.values()].sort((a, b) => {
    if (a.ordre !== null && b.ordre !== null) return a.ordre - b.ordre;
    // Les sans-valeur en dernier : « Sans rattachement » n'est pas un club.
    if (!a.cle) return 1;
    if (!b.cle) return -1;
    return a.libelle.localeCompare(b.libelle, 'fr');
  });
}

// La base : filtrée, cherchée, triée. Sans aucune idée de son affichage.
// `filtres` est un objet { cleDeColonne: valeur }, où 'tout' ne filtre rien.
export function baseContacts(contacts, { recherche = '', filtres = {}, tri = 'nom', sens = 1 } = {}) {
  const terme = recherche.trim().toLowerCase();
  const colonne = COLONNES.find((c) => c.cle === tri) ?? COLONNES[0];

  return contacts
    .filter((contact) => {
      // Les filtres se cumulent : un ET, pas un OU. Choisir « Joueur » puis
      // « Rennes » donne les joueurs de Rennes.
      for (const filtrable of COLONNES_FILTRABLES) {
        const choisi = filtres[filtrable.cle];
        if (choisi === undefined || choisi === 'tout') continue;
        if (filtrable.filtre.cle(contact) !== choisi) return false;
      }

      if (!terme) return true;
      // La recherche porte sur toutes les colonnes : chercher « lorient » doit
      // trouver aussi bien un nom qu'une structure, et « établi » un statut.
      return COLONNES.some((c) =>
        (c.texte ?? c.valeur)(contact).toLowerCase().includes(terme),
      );
    })
    .sort((a, b) => {
      // Les cases vides finissent en bas quel que soit le sens : une fiche sans
      // date n'est pas « la plus ancienne ».
      const va = colonne.valeur(a);
      const vb = colonne.valeur(b);
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      return va.localeCompare(vb, 'fr', { numeric: true }) * sens;
    });
}

// La barre de filtres, sur le modèle de Notion : discrète tant qu'on ne s'en
// sert pas, dépliable, et composée à la demande — on ajoute les filtres dont on
// a besoin, on retire les autres. Trois choses distinctes :
//
//   `filtresOuverts`  la barre est-elle dépliée
//   `filtresAjoutes`  quelles colonnes ont leur filtre posé dans la barre
//   `filtres`         la valeur choisie pour chacune ('tout' = ne filtre rien)
//
// Replier la barre n'annule rien : les filtres restent appliqués, et le compte
// sur le bouton le dit. Sans ça, on cacherait la raison d'une liste courte.

function compterFiltresActifs(filtres = {}) {
  return COLONNES_FILTRABLES.filter(
    (colonne) => filtres[colonne.cle] && filtres[colonne.cle] !== 'tout',
  ).length;
}

const ICONE_FILTRE = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"
  fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
  <path d="M2 4h12M4 8h8M6.5 12h3"/></svg>`;

const ICONE_COLONNES = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"
  fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
  <rect x="2" y="3" width="4" height="10" rx="1"/>
  <rect x="10" y="3" width="4" height="10" rx="1"/></svg>`;

export function construireBarreFiltres(contacts, etat) {
  const filtres = etat.filtresContact ?? {};
  const ajoutes = etat.filtresAjoutes ?? [];
  const actifs = compterFiltresActifs(filtres);
  const disponibles = COLONNES_FILTRABLES.filter((colonne) => !ajoutes.includes(colonne.cle));

  const bouton = `
    <button type="button" class="outil ${etat.filtresOuverts || actifs ? 'actif' : ''}"
      data-basculer-filtres aria-expanded="${Boolean(etat.filtresOuverts)}">
      ${ICONE_FILTRE} Filtrer${
        actifs ? ` <span class="compte-actifs chiffre">${actifs}</span>` : ''
      }
    </button>`;

  const boutonColonnes = `
    <button type="button" class="outil ${etat.colonnesOuvertes ? 'actif' : ''}"
      data-basculer-colonnes aria-expanded="${Boolean(etat.colonnesOuvertes)}">
      ${ICONE_COLONNES} Colonnes
    </button>`;

  const panneau = etat.colonnesOuvertes ? construirePanneauColonnes(etat.ordreColonnes) : '';

  if (!etat.filtresOuverts) {
    return `<div class="barre-outils">${bouton}${boutonColonnes}</div>${panneau}`;
  }

  const puces = ajoutes
    .map((cle) => COLONNES_FILTRABLES.find((colonne) => colonne.cle === cle))
    .filter(Boolean)
    .map((colonne) => {
      const choisi = filtres[colonne.cle] ?? 'tout';
      const choix = choixDuFiltre(contacts, colonne);

      // Le compte de chaque valeur reste dans le libellé : c'est lui qui dit
      // s'il vaut la peine de filtrer là-dessus. « Tous » n'en porte pas — il
      // ne filtre rien, il annule.
      const options = [
        ['tout', 'Tous'],
        ...choix.map(({ cle, libelle, compte }) => [cle, `${libelle} (${compte})`]),
      ];

      return `
        <span class="puce-filtre ${choisi === 'tout' ? '' : 'actif'}"
          data-filtre-de="${colonne.cle}">
          <span class="discret">${echapper(colonne.titre)}</span>
          ${menuChoix({
            nom: `filtre-${colonne.cle}`,
            libelle: `Filtrer par ${colonne.titre}`,
            options,
            valeur: choisi,
            attribut: 'data-filtre-colonne-valeur',
          })}
          <button type="button" class="lien-discret retirer-filtre"
            data-retirer-filtre="${colonne.cle}"
            title="Retirer ce filtre"
            aria-label="Retirer le filtre ${echapper(colonne.titre)}">×</button>
        </span>`;
    })
    .join('');

  const ajout = disponibles.length
    ? `<details class="ajout-filtre">
         <summary>+ Filtrer</summary>
         <div class="menu-filtre">
           ${disponibles
             .map(
               (colonne) =>
                 `<button type="button" data-ajouter-filtre="${colonne.cle}">${echapper(
                   colonne.titre,
                 )}</button>`,
             )
             .join('')}
         </div>
       </details>`
    : '';

  return `
    <div class="barre-outils">${bouton}${boutonColonnes}</div>
    ${panneau}
    <div class="barre-filtres">
      ${puces}
      ${ajout}
      ${
        actifs
          ? `<button type="button" class="lien-discret" data-vider-filtres>Tout afficher</button>`
          : ''
      }
    </div>`;
}

function messageVide(contacts) {
  return contacts.length
    ? `<p class="vide">Personne ne correspond à cette recherche.</p>`
    : `<p class="vide">Ton réseau démarre ici — joueurs, médias, clubs.</p>`;
}

export function construireTableauContacts(retenus, contacts, { tri = 'nom', sens = 1, ordre = null } = {}) {
  if (!retenus.length) return messageVide(contacts);

  const colonnes = colonnesOrdonnees(ordre);

  return `
    <div class="tableau-cadre">
      <table class="tableau">
        <thead>
          <tr>
            ${colonnes
              .map(
                (colonne, index) => `
              <th scope="col" aria-sort="${
                colonne.cle === tri ? (sens === 1 ? 'ascending' : 'descending') : 'none'
              }"
                draggable="true"
                data-colonne="${colonne.cle}" data-index="${index}">
                <button type="button" data-trier="${colonne.cle}">
                  <span class="poignee" aria-hidden="true">⠿</span>
                  ${colonne.titre}
                  <span class="tri-marque" aria-hidden="true">${
                    colonne.cle === tri ? (sens === 1 ? '↑' : '↓') : ''
                  }</span>
                </button>
              </th>`,
              )
              .join('')}
            <th scope="col"><span class="hors-ecran">Retirer</span></th>
          </tr>
        </thead>
        <tbody>
          ${retenus
            .map(
              (contact) => `
            <tr class="ligne-ouvrable" data-ouvrir-contact="${echapper(contact.id)}">
              ${colonnes.map((colonne) => `<td>${colonne.cellule(contact)}</td>`).join('')}
              <td>${boutonRetirer(contact)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

// Le panneau des colonnes : le même ordre, aux flèches. C'est lui qui sert sur
// téléphone, où l'on ne tire pas un en-tête de tableau.
export function construirePanneauColonnes(ordre) {
  const colonnes = colonnesOrdonnees(ordre);

  return `
    <div class="panneau-colonnes">
      <p class="discret">Glisse un en-tête du tableau, ou déplace-les ici.</p>
      <ol>
        ${colonnes
          .map(
            (colonne, index) => `
          <li>
            <span>${echapper(colonne.titre)}</span>
            <button type="button" class="lien-discret" data-monter-colonne="${colonne.cle}"
              ${index === 0 ? 'disabled' : ''}
              aria-label="Monter ${echapper(colonne.titre)}">↑</button>
            <button type="button" class="lien-discret" data-descendre-colonne="${colonne.cle}"
              ${index === colonnes.length - 1 ? 'disabled' : ''}
              aria-label="Descendre ${echapper(colonne.titre)}">↓</button>
          </li>`,
          )
          .join('')}
      </ol>
    </div>`;
}

export function construireFichesContacts(retenus, contacts) {
  if (!retenus.length) return messageVide(contacts);

  return `<ul class="liste-contacts">${retenus
    .map((contact) => {
      const liens = [lienInstagram(contact), lienEmail(contact), lienTelephone(contact)]
        .filter(Boolean);

      // La fiche entière s'ouvre, sauf les liens : cliquer une adresse doit
      // ouvrir Instagram ou le courrier, pas une fenêtre par-dessus.
      return `
        <li class="tuile-apercu" role="button" tabindex="0"
          data-ouvrir-contact="${echapper(contact.id)}"
          aria-label="Ouvrir la fiche de ${echapper(contact.nom)}">
          <span class="tuile-entete">
            ${pastilleTexte(TYPES_CONTACT[contact.type] ?? contact.type)}
            ${contact.structure ? pastilleTexte(contact.structure) : ''}
            ${pastilleTexte(
              statutLisible(contact.statut).nom,
              statutLisible(contact.statut).teinte,
            )}
            ${boutonRetirer(contact)}
          </span>
          <span class="contact-nom">${echapper(contact.nom)}</span>
          ${liens.length ? `<span class="contact-liens">${liens.join('<span class="discret"> · </span>')}</span>` : ''}
          ${contact.notes ? `<span class="discret contact-notes">${echapper(contact.notes)}</span>` : ''}
        </li>`;
    })
    .join('')}</ul>`;
}

// --- La Passerelle -----------------------------------------------------------
// Réécrite le 15 août 2026 (demande de Noé) : l'ancienne file par niveaux
// (Répondre · Relancer · Ouvrir) le perdait — elle ne savait parler que des
// fiches déjà au réseau, alors que l'objectif premier est de contacter des
// clubs JAMAIS contactés. La Passerelle est désormais le rituel de la
// semaine : elle propose une dizaine de clubs du vivier (table `pistes`,
// 97 clubs définis avec Noé), Noé choisit les siens selon leurs matchs à
// venir — le site est statique, il ne lit aucun calendrier : il les met à un
// clic, et Noé juge — puis chaque club choisi porte ses portes de recherche,
// la capture de la personne trouvée, et « Envoyé ✓ ». Le réseau devient le
// résultat de la Passerelle, plus son préalable.
//
// La métrique, elle, ne change pas : le nombre de messages ENVOYÉS — ce que
// Noé contrôle. Ni taux de réponse, ni compte de silences : si le compteur
// dépendait des réponses, chaque silence deviendrait un rejet mesuré.

// La semaine commence le lundi.
export function debutDeSemaine(reference = new Date()) {
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function envoisDeLaSemaine(envois, reference = new Date()) {
  const debut = versDateISO(debutDeSemaine(reference));
  return envois.filter((envoi) => envoi.date >= debut).length;
}

// Les huit championnats du vivier, en deux familles (décision de Noé, 15 août
// 2026) : la France est le FIL ROUGE de la saison, Ligue 1 en tête ;
// l'étranger est un objectif second — aller shooter dehors — qui demande moins
// de régularité. La dizaine proposée s'en souvient : environ 70 % de clubs
// français, et les pays étrangers tournent d'une semaine à l'autre.
export const DIVISIONS = {
  ligue1: 'Ligue 1',
  ligue2: 'Ligue 2',
  ligue3: 'Ligue 3',
  belgique: 'Belgique',
  suisse: 'Suisse',
  allemagne: 'Allemagne',
  italie: 'Italie',
  espagne: 'Espagne',
};

const DIVISIONS_FRANCAISES = ['ligue1', 'ligue2', 'ligue3'];
const DIVISIONS_ETRANGERES = ['belgique', 'suisse', 'allemagne', 'italie', 'espagne'];
const PART_FRANCAISE = 0.7;

// Un mélange SEMÉ (mulberry32 + Fisher-Yates) : la même graine redonne le même
// tirage, pour que la dizaine proposée ne bouge pas sous les yeux à chaque
// redessin. Seuls deux gestes changent la graine : « Proposer d'autres clubs »,
// et le passage à une nouvelle semaine.
function melangeSeme(liste, graine) {
  let a = graine >>> 0 || 1;
  const alea = () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// Un tour par paquet, jusqu'au nombre demandé ou l'épuisement.
function tirer(paquets, nombre) {
  const choix = [];
  for (let tour = 0; choix.length < nombre; tour++) {
    const avant = choix.length;
    for (const paquet of paquets) {
      if (paquet[tour] && choix.length < nombre) choix.push(paquet[tour]);
    }
    if (choix.length === avant) break;
  }
  return choix;
}

// La dizaine proposée : des clubs jamais contactés, hors fournée. Environ 70 %
// de français — un tour par division, la Ligue 1 ouvre chaque tour, elle prend
// donc les places restantes — et le solde à l'étranger, où l'ORDRE DES PAYS
// est lui-même mélangé par la graine : trois pays différents d'une semaine à
// l'autre, à la mesure d'un objectif qui demande moins de régularité.
// Un club dont la fiche attend une relance revient dans les propositions. Le
// drapeau se pose sur la piste au chargement (`piste.aRelancer`), comme le
// prochain match : le tirage n'a pas à connaître les contacts.
export const RELANCES_MAX = 3;

export function pistesProposees(pistes, graine, nombre = 10, passees = []) {
  const ecartees = new Set(passees);

  // Les relances passent devant : une relance est due, une porte neuve est
  // offerte. Trois au plus, pour que le rituel continue d'ouvrir.
  const relances = pistes
    .filter((piste) => piste.aRelancer && !piste.en_fournee && !ecartees.has(piste.id))
    .sort((a, b) => (a.date_contacte ?? '').localeCompare(b.date_contacte ?? ''))
    .slice(0, RELANCES_MAX);

  const libres = pistes.filter(
    (piste) => !piste.en_fournee && !piste.date_contacte && !ecartees.has(piste.id),
  );
  const paquets = (divisions, decalage) =>
    divisions.map((division, rang) =>
      melangeSeme(
        libres.filter((piste) => piste.division === division),
        graine + decalage + rang,
      ),
    );

  const francaises = paquets(DIVISIONS_FRANCAISES, 0);
  const etrangeres = melangeSeme(paquets(DIVISIONS_ETRANGERES, 10), graine + 20);

  // Les relances prises, le tirage remplit le reste de la dizaine.
  const places = Math.max(0, nombre - relances.length);
  const partFrancaise = Math.round(places * PART_FRANCAISE);
  let francais = tirer(francaises, partFrancaise);
  let etrangers = tirer(etrangeres, places - partFrancaise);

  // Un vivier qui s'épuise ne raccourcit pas la dizaine : l'autre complète.
  if (francais.length < partFrancaise) {
    etrangers = tirer(etrangeres, places - francais.length);
  } else if (etrangers.length < places - partFrancaise) {
    francais = tirer(francaises, places - etrangers.length);
  }

  return [...relances, ...francais, ...etrangers];
}

// Chercher ne part jamais d'une page blanche : quatre portes par club,
// fabriquées depuis son nom. « Matchs à venir » d'abord — c'est le critère de
// choix de Noé — puis les trois chemins vers la bonne personne.
function portesPiste(piste) {
  const chercher = (texte) =>
    `https://www.google.com/search?q=${encodeURIComponent(texte)}`;

  return [
    ['matchs', 'Matchs à venir', chercher(`${piste.nom} calendrier prochains matchs`)],
    ['presse', 'Contact presse', chercher(`${piste.nom} contact presse accréditation`)],
    [
      'linkedin',
      'LinkedIn',
      `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
        `responsable communication ${piste.nom}`,
      )}`,
    ],
    ['instagram', 'Instagram', chercher(`${piste.nom} instagram officiel`)],
  ];
}

// Les portes d'une carte de fournée sont des ICÔNES (demande de Noé, 15 août
// au soir) : calendrier, planète pour la presse, LinkedIn, Instagram. Des SVG
// intégrés, comme le chevron des formulaires — jamais un fichier distant.
const ICONES_PORTES = {
  matchs: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    focusable="false"><rect x="3" y="4" width="18" height="18" rx="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  presse: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    focusable="false"><circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  // Les deux marques portent leur VRAI logo, couleurs comprises (demande de
  // Noé) : le carré bleu « in », le carré dégradé à l'appareil photo. Dessinés
  // en SVG dans le fichier — jamais une image distante. Le dégradé Instagram
  // porte un id : il se répète d'une carte à l'autre, et c'est voulu — tous
  // identiques, le navigateur prend le premier.
  linkedin: `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    <rect width="24" height="24" rx="5" fill="#0a66c2"></rect>
    <circle cx="6.8" cy="6.9" r="1.9" fill="#fff"></circle>
    <rect x="5.1" y="9.9" width="3.4" height="9" fill="#fff"></rect>
    <path fill="#fff" d="M10.9 9.9h3.3v1.3c.5-.8 1.6-1.6 3.2-1.6 2.6 0 4 1.7 4 4.7v4.6H18v-4.2c0-1.4-.6-2.3-1.8-2.3-1.1 0-1.9.8-1.9 2.3v4.2h-3.4z"></path></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    <defs><linearGradient id="degrade-instagram" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#fdc468"></stop>
      <stop offset="0.4" stop-color="#f65c8a"></stop>
      <stop offset="0.7" stop-color="#c74dbe"></stop>
      <stop offset="1" stop-color="#5a63d8"></stop>
    </linearGradient></defs>
    <rect width="24" height="24" rx="6" fill="url(#degrade-instagram)"></rect>
    <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"></rect>
    <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" stroke-width="1.8"></circle>
    <circle cx="16.4" cy="7.6" r="1.1" fill="#fff"></circle></svg>`,
};

function liensPiste(piste) {
  return portesPiste(piste).map(
    ([cle, nom, url]) =>
      `<a class="piste-porte" data-porte="${cle}" href="${url}" target="_blank" rel="noopener"
        title="${echapper(nom)}" aria-label="${echapper(nom)} — ${echapper(piste.nom)}"
        >${ICONES_PORTES[cle]}</a>`,
  );
}

// Les deux pastilles d'une piste : son championnat (une teinte stable par
// division), et l'international congolais qui y joue — l'accroche toute
// trouvée, et le pont vers le fil rouge CAN 2027.
function pastillesPiste(piste) {
  return `
    ${pastilleTexte(DIVISIONS[piste.division] ?? piste.division)}
    ${
      // La relance se signale : ce club a déjà reçu un message, on ne repart
      // pas de zéro en lui écrivant.
      piste.aRelancer ? `<span class="tag tag-relance">Relance</span>` : ''
    }
    ${
      piste.leopard
        ? `<span class="tag tag-leopard">Léopard · ${echapper(piste.leopard)}</span>`
        : ''
    }`;
}

// Une carte de la fournée : les portes de recherche, la personne trouvée (ou
// le bouton pour la noter), et « Envoyé ✓ ». La croix repose le club au
// vivier — c'est un choix, pas un échec, et rien ne le compte.
// Tous ceux qu'on connaît dans ce club (demande de Noé, 15 août 2026) : les
// fiches dont « rattaché à » porte son nom, plus celle née de la piste si elle
// ne l'a pas encore écrit. Un club, ce n'est pas une personne — au service
// presse s'ajoutent un joueur, un confrère, un attaché.
export function contactsDuClub(piste, contacts = []) {
  const cherche = piste.nom.toLocaleLowerCase('fr');
  const dedans = contacts.filter(
    (contact) => (contact.structure ?? '').trim().toLocaleLowerCase('fr') === cherche,
  );
  const nee = contacts.find((contact) => contact.id === piste.contact_id);
  if (nee && !dedans.includes(nee)) dedans.unshift(nee);
  // Le contact du club passe devant (demande de Noé, 15 août 2026) : c'est la
  // porte officielle, celle par où l'on entre. Le tri est stable, donc les
  // autres gardent leur ordre.
  return dedans.sort((a, b) => (b.type === 'club') - (a.type === 'club'));
}

// Les gens du club, en bande qui défile — la forme des pastilles de la tuile de
// capture (demande de Noé, 15 août 2026), un petit « + » à droite pour en
// ajouter, et SOUS la bande le menu de relation de celui qu'on regarde.
// Chaque pastille porte la couleur de son type : Ewan Schnell est doré parce
// qu'il est rattaché au type « club ».
function bandeContacts(piste, dedans, choisiId) {
  const choisi = dedans.find((contact) => contact.id === choisiId) ?? dedans[0];

  const pastilles = dedans
    .map(
      (contact) => `
        <button type="button" class="pastille-personne${contact === choisi ? ' actif' : ''}"
          style="--h: ${teinteDuType(contact.type)}"
          data-contact-actif="${echapper(contact.id)}"
          data-piste-du-contact="${echapper(piste.id)}"
          aria-pressed="${contact === choisi}"
          title="${echapper(TYPES_CONTACT[contact.type] ?? contact.type ?? '')}"
          ><span>${echapper(contact.nom)}</span></button>`,
    )
    .join('');

  // Sans personne au club, le geste reprend sa pleine forme — un bouton bleu du
  // volume d'« Envoyé ✓ » (demande de Noé, 15 août au soir) : c'est ALORS le
  // geste de la carte, et un « + » seul au bout d'une bande vide ne se voyait
  // pas. Dès qu'il y a quelqu'un, il redevient le petit « + » qui prolonge la
  // bande : la carte parle des gens, pas du bouton qui les ajoute.
  if (!dedans.length) {
    return `
      <button type="button" class="bouton-secondaire bouton-mini bouton-trouve"
        data-trouve-piste="${echapper(piste.id)}"
        aria-label="Ajouter un contact à ${echapper(piste.nom)}"
        >Ajouter un contact</button>`;
  }

  return `
    <span class="fournee-bande">
      <span class="fournee-bande-liste">${pastilles}</span>
      <button type="button" class="pastille-ajout" data-trouve-piste="${echapper(piste.id)}"
        title="Ajouter un contact"
        aria-label="Ajouter un contact à ${echapper(piste.nom)}">+</button>
    </span>
    ${
      choisi
        ? `<span class="fournee-relation" data-statut-de="${echapper(choisi.id)}">${menuChoix({
            nom: `relation-${choisi.id}`,
            libelle: `Relation avec ${choisi.nom}`,
            options: Object.entries(STATUTS_CONTACT).map(([valeur, { nom }]) => [valeur, nom]),
            valeur: choisi.statut,
            attribut: 'data-statut',
            couleurDe: statutLisible,
          })}</span>`
        : ''
    }`;
}

function carteFournee(piste, contacts, choisiId = null) {
  // Les fiches encore à « pas de contact » restent en dehors (demande de Noé,
  // 15 août 2026) : la carte montre les gens qu'on a touchés, pas les noms
  // qu'on a notés. Elles sont au carnet, et le « + » les y rejoint.
  const dedans = contactsDuClub(piste, contacts).filter(
    (contact) => contact.statut !== 'pas_de_contact',
  );

  // Les gestes vivent en colonne (demandes de Noé, 15 août au soir) : plus de
  // rangée d'en-tête, la pastille du championnat suit le nom — la carte tient en
  // trois lignes. La croix, elle, a quitté la colonne : elle ne parle pas du
  // club mais de la carte, et se range au coin haut droit de la tuile.
  return `
    <li>
      <span class="fournee-corps">
        <button type="button" class="lien-discret bouton-mini bouton-retirer fournee-reposer"
          data-reposer-piste="${echapper(piste.id)}"
          title="Reposer au vivier"
          aria-label="Reposer ${echapper(piste.nom)} au vivier">×</button>
        <span class="fournee-infos">
          <span class="fournee-nom">
            ${ecussonDuClub(piste.nom, { grand: true })}
            <span class="contact-nom">${echapper(piste.nom)}</span>
            ${pastillesPiste(piste)}
          </span>
          ${
            piste.prochain
              ? `<span class="discret piste-match">${echapper(texteProchainMatch(piste))}
                  — ${echapper(echeanceLisible(depuisDateISO(piste.prochain.date)))}</span>`
              : ''
          }
          <span class="piste-liens">${liensPiste(piste).join('')}</span>
        </span>
        <span class="fournee-actions">
          ${bandeContacts(piste, dedans, choisiId)}
          ${
            // Sans personne connue, la date de l'envoi dit ce qui a été fait :
            // le message est parti au compte du club.
            !dedans.length && piste.date_contacte
              ? `<span class="discret fournee-envoye">✓ écrit ${echapper(
                  echeanceLisible(depuisDateISO(piste.date_contacte)),
                )}</span>`
              : ''
          }
          ${
            // Le bouton d'envoi revient pour une relance : le message est de
            // nouveau dû, et « Envoyé ✓ » le comptera comme tel.
            !piste.date_contacte || piste.aRelancer
              ? `<button type="button" class="bouton-secondaire bouton-mini bouton-envoye"
                  data-envoye-piste="${echapper(piste.id)}">${
                    piste.aRelancer ? 'Relancé ✓' : 'Envoyé ✓'
                  }</button>`
              : ''
          }
        </span>
      </span>
    </li>`;
}

// Les paliers de l'objectif doux. Le réglage tourne d'un toucher plutôt que de
// dérouler un menu : un `select` natif est banni du site depuis le 13 août, et
// quatre paliers ne valent pas un panneau.
export const PALIERS_OBJECTIF = [1, 2, 3, 5];

export function objectifSuivant(objectifDoux) {
  const rang = PALIERS_OBJECTIF.indexOf(objectifDoux);
  return PALIERS_OBJECTIF[(rang + 1) % PALIERS_OBJECTIF.length];
}

// Trois chiffres, trois échelles de temps (refonte du 15 août 2026, demande de
// Noé) : la semaine (le rituel), le vivier (la saison), le réseau (le fruit).
//
// Le cumul des envois a disparu : « 47 messages » ne situe rien, là où « 12
// clubs sur 97 » dit le chemin dans un ensemble fini. Rien ici ne compte les
// réponses ni les silences — un taux ferait de chaque non-réponse un échec
// mesuré, et c'est le principe fondateur de la Passerelle.
export function construireMetrique({
  envois = [],
  pistes = [],
  contacts = [],
  objectifDoux = 1,
  reference = new Date(),
} = {}) {
  const semaine = envoisDeLaSemaine(envois, reference);
  const contactees = pistes.filter((piste) => piste.date_contacte).length;
  // Un club est entré au réseau dès qu'on y connaît quelqu'un — pas seulement
  // la fiche née de la piste : « rattaché à » en amène d'autres.
  const auReseau = pistes.filter((piste) => contactsDuClub(piste, contacts).length).length;

  return `
    <div class="passerelle-metrique">
      <span class="metrique">
        <span class="chiffre">${semaine}</span>
        <span class="discret">cette semaine</span>
        <button type="button" class="metrique-reglage" data-objectif-doux="${objectifDoux}"
          title="Changer l'objectif de la semaine">objectif&nbsp;: ${objectifDoux}/semaine</button>
      </span>
      ${
        // Les deux chiffres suivants sont des PORTES (demande de Noé, 21 août
        // au soir) : « clubs contactés » ouvre le vivier qu'il compte,
        // « entrés au réseau » ouvre le CRM où ils vivent. Le chiffre dit
        // l'état ET mène au fonds — pas de sous-navigation pour ça.
        pistes.length
          ? `<a class="metrique" href="#yuno/vivier" title="Ouvrir le vivier">
              <span class="chiffre">${contactees}<span class="metrique-sur">/${pistes.length}</span></span>
              <span class="discret">clubs contactés</span>
            </a>`
          : ''
      }
      ${
        // À zéro, il ne s'affiche pas : un compteur vide serait un reproche,
        // et l'écran a mieux à dire.
        auReseau
          ? `<a class="metrique" href="#yuno/carnet" title="Ouvrir le CRM">
              <span class="chiffre">${auReseau}</span>
              <span class="discret">entré${auReseau > 1 ? 's' : ''} au réseau</span>
            </a>`
          : ''
      }
    </div>
    ${
      // Un plancher rassurant, jamais une dette : atteint, on le dit ; en
      // dessous, on ne dit rien du tout.
      semaine >= objectifDoux
        ? `<p class="discret note-atteint">C'est fait pour cette semaine. La suite se passe dehors.</p>`
        : ''
    }`;
}

export function construireModeles(modeles = []) {
  const corps = modeles.length
    ? `<ul class="liste-modeles">${modeles
        .map(
          (modele) => `
        <li>
          <span class="tuile-entete">
            <input class="champ-vif modele-titre" type="text" data-modele-titre="${echapper(modele.id)}"
              value="${echapper(modele.titre)}" aria-label="Titre du modèle">
            <button type="button" class="lien-discret bouton-mini" data-copier-modele="${echapper(
              modele.id,
            )}">Copier</button>
            <button type="button" class="lien-discret bouton-mini bouton-retirer"
              data-supprimer-modele="${echapper(modele.id)}"
              title="Retirer ce modèle" aria-label="Retirer « ${echapper(modele.titre)} »">×</button>
          </span>
          <textarea class="champ-vif modele-corps" rows="3" data-modele-corps="${echapper(modele.id)}"
            aria-label="Texte du modèle">${echapper(modele.corps)}</textarea>
        </li>`,
        )
        .join('')}</ul>`
    : `<p class="vide">Un premier message coûte moins cher quand la phrase existe déjà.</p>`;

  return `
    <details class="backlog bloc-modeles">
      <summary>Modèles de messages ${
        modeles.length ? `<span class="chiffre">${modeles.length}</span>` : ''
      }</summary>
      ${corps}
      ${construireFormulaire({
        id: 'modele',
        libelle: 'Écrire un modèle',
        action: 'creer-modele',
        bouton: 'Garder ce modèle',
        champs: [
          { nom: 'titre', libelle: 'Pour quoi ? (accréditation concert, premier contact club…)', type: 'text', requis: true },
          { nom: 'corps', libelle: 'Le message, à personnaliser à chaque envoi', type: 'textarea', requis: true },
        ],
      })}
    </details>`;
}

// Le prochain match d'une piste, en une phrase courte : « J1 · reçoit LOSC
// Lille ». L'adversaire et la journée sont sûrs ; la date, indicative, se lit
// au survol. Sans calendrier chargé (championnats étrangers pour l'instant),
// on retombe sur le lien générique.
function texteProchainMatch(piste) {
  if (!piste.prochain) return null;
  const { journee, adversaire, domicile } = piste.prochain;
  return `J${journee} · ${domicile ? 'reçoit' : 'chez'} ${adversaire}`;
}

function lienMatchs(piste) {
  const texte = texteProchainMatch(piste);
  const quand = piste.prochain
    ? ` title="${echapper(echeanceLisible(depuisDateISO(piste.prochain.date)))}"`
    : '';
  return `<a class="quand" href="${portesPiste(piste)[0][2]}"
    target="_blank" rel="noopener"${quand}>${echapper(texte ?? 'Matchs à venir')}</a>`;
}

// Une proposition en LIGNE : la division, le nom, le prochain match à un clic,
// et un « + » à droite. La même ligne partout — la porte du haut de page y
// ajoute une croix pour passer (demande de Noé, 15 août au soir).
function lignePiste(piste, { passer = false } = {}) {
  return `
    <li class="proposition">
      ${pastillesPiste(piste)}
      ${ecussonDuClub(piste.nom)}
      <span class="contact-nom">${echapper(piste.nom)}</span>
      ${lienMatchs(piste)}
      <button type="button" class="proposition-choisir"
        data-choisir-piste="${echapper(piste.id)}"
        title="Ajouter à la fournée"
        aria-label="Ajouter ${echapper(piste.nom)} à la fournée">+</button>
      ${
        passer
          ? `<button type="button" class="proposition-choisir proposition-passer"
              data-passer-piste="${echapper(piste.id)}"
              title="Passer — le suivant prend sa place"
              aria-label="Passer ${echapper(piste.nom)}">×</button>`
          : ''
      }
    </li>`;
}

// UNE porte à la fois (demande de Noé, 15 août au soir) : dix clubs affichés
// d'un coup faisaient un mur à lire — un seul appelle un geste. Le club en
// tête de la dizaine se traite (ajouter, ou passer — le suivant prend sa
// place), et la dizaine complète attend dans une fenêtre volante, pour les
// semaines où l'on préfère composer d'un coup d'œil.
function construirePropositions(pistes, graine, passees, fenetreOuverte) {
  const propositions = pistesProposees(pistes, graine, 10, passees);

  if (!propositions.length) {
    return passees.length
      ? `<p class="vide">Toute la dizaine est passée en revue.</p>
         <p class="note-file">
           <button type="button" class="lien-discret" data-proposer-autres>
             Proposer d'autres clubs</button>
         </p>`
      : `<p class="vide">Tout le vivier a été contacté. Le réseau a grandi —
          la suite se passe dans le carnet.</p>`;
  }

  const [premiere] = propositions;

  // La même ligne compacte que dans la fenêtre, croix de passage en plus —
  // « Passer » ne s'enregistre pas en base : c'est un choix d'écran, pas un
  // fait sur le club, il reviendra une autre semaine. « Toute la dizaine »
  // vit HORS de la tuile : c'est une porte vers la fenêtre, pas un geste sur
  // ce club-là.
  // Pas de titre dans la fenêtre : le bouton qui l'ouvre vient de le dire
  // (demande de Noé, 15 août au soir). L'aria-label de la fenêtre le garde
  // pour les lecteurs d'écran.
  const fenetre = fenetreOuverte
    ? construireFenetre(
        // Le nom que porte le bouton qui l'ouvre, au mot près : c'est lui qui
        // sert de titre pour les lecteurs d'écran, la fenêtre n'en affichant
        // aucun.
        'Propositions de la semaine',
        `<ul class="liste-propositions">${propositions
           .map((piste) => lignePiste(piste))
           .join('')}</ul>
         <p class="note-file">
           <button type="button" class="lien-discret" data-proposer-autres>
             Proposer d'autres clubs</button>
         </p>`,
      )
    : '';

  // La porte et sa voisine : un bouton-tuile qui ouvre la fenêtre des dix, et
  // le club à traiter (demande de Noé, 15 août au soir) — deux tuiles de même
  // rang, pas un lien caché sous la carte. Le bouton passe DEVANT le 15 août au
  // soir (demande de Noé) : on choisit d'abord dans quelle liste on pioche, le
  // club proposé vient après et prend toute la largeur qui reste.
  return `
    <div class="porte-rangee">
      <button type="button" class="porte-dizaine" data-voir-propositions>
        Propositions de la semaine</button>
      <ul class="porte-liste">${lignePiste(premiere, { passer: true })}</ul>
    </div>
    ${fenetre}`;
}

// --- Le vivier ---------------------------------------------------------------
// Le pendant du carnet, côté clubs (demande de Noé, 15 août 2026) : la
// Passerelle est un rituel où l'on agit — elle sert UNE porte à la fois — et
// le vivier un fonds où l'on cherche, les 97 clubs à portée, triés par
// compétition. Le chantier y a déménagé : le chemin parcouru et le fonds
// parlent de la même chose, ils vivent au même endroit.

// L'état d'une piste, en un mot. L'ordre compte : contactée d'abord, c'est un
// fait acquis qui prime sur tout le reste.
function etatDeLaPiste(piste) {
  if (piste.en_fournee) return 'fournee';
  // Une relance due se rechoisit : le club est contacté, mais le message est
  // de nouveau à écrire. Elle passe donc devant « contactée ».
  if (piste.aRelancer) return 'libre';
  if (piste.date_contacte) return 'contactee';
  return 'libre';
}

// `match: false` : la recherche s'en passe (demande de Noé, 21 août 2026) —
// on y vient pour un nom, l'affiche du week-end prenait la place du nom.
function ligneVivier(piste, { match = true } = {}) {
  const etat = etatDeLaPiste(piste);

  // La ligne entière ouvre la fiche du club — sauf ses commandes, qui gardent
  // leur geste (le « + » choisit, le lien du match mène dehors).
  return `
    <li class="proposition proposition-${etat}" data-ouvrir-club="${echapper(piste.id)}">
      ${pastillesPiste(piste)}
      ${ecussonDuClub(piste.nom)}
      <span class="contact-nom">${echapper(piste.nom)}</span>
      ${match ? lienMatchs(piste) : ''}
      ${
        etat === 'contactee'
          ? `<span class="discret vivier-etat">✓ contacté</span>`
          : etat === 'fournee'
            ? `<span class="discret vivier-etat">dans ta fournée</span>`
            : `<button type="button" class="proposition-choisir"
                data-choisir-piste="${echapper(piste.id)}"
                title="Ajouter à la fournée"
                aria-label="Ajouter ${echapper(piste.nom)} à la fournée">+</button>`
      }
    </li>`;
}

// L'affiche d'un match, telle qu'elle s'écrit : le club qui reçoit d'abord.
// C'est ce texte que l'événement copiera pour titre — et qu'il gardera même si
// Noé le réécrit ensuite.
export function afficheDuMatch(piste, match) {
  return match.domicile
    ? `${piste.nom} – ${match.adversaire}`
    : `${match.adversaire} – ${piste.nom}`;
}

// Les prochains matchs d'un club **qui restent à poser**, trois au plus
// (demande de Noé, 15 août 2026) : la fiche PROPOSE, elle ne récite pas un
// calendrier. Celui qui est déjà au calendrier sort de la liste — il n'y a plus
// rien à en faire ici, et il occupait une des trois places.
//
// Posé ? On le reconnaît à la date et au club, pas au titre : celui-ci a pu être
// réécrit, et c'est justement ce qu'on lui permet.
const PROPOSITIONS_MATCHS = 3;

function construireMatchsDuClub(piste, etat) {
  const matchs = etat.matchsDuClub[piste.id];
  if (!matchs) return `<p class="vide">…</p>`;

  const aPoser = matchs
    .filter(
      (match) =>
        !etat.evenements.some(
          (evenement) =>
            versDateISO(new Date(evenement.date_debut)) === match.date &&
            (evenement.club_recevant === piste.id ||
              evenement.club_visiteur === piste.id),
        ),
    )
    .slice(0, PROPOSITIONS_MATCHS);

  if (!aPoser.length) {
    return `<p class="vide">${
      matchs.length ? 'Ses prochains matchs sont déjà à ton calendrier.' : 'Plus de match à son calendrier.'
    }</p>`;
  }

  // Les dates viennent du calendrier publié : la journée et l'affiche sont
  // sûres, le jour exact et l'horaire ne le sont pas encore. On le dit, plutôt
  // que de laisser croire à une heure qui n'existe pas.
  const avertissement = `<p class="discret club-approx">Le jour et l'heure se
    précisent plus tard : la tuile s'ouvre, tu corriges avant de poser.</p>`;

  // Une tuile par match, celle du week-end : l'affiche, la date, et le
  // calendrier au bout en guise de geste (demande de Noé, 15 août 2026 —
  // « Poser au calendrier… » écrivait en toutes lettres ce qu'une icône dit).
  return `${avertissement}<ul class="club-matchs club-matchs-tuiles">${aPoser
    .map((match) => {
      const affiche = afficheDuMatch(piste, match);

      return `
        <li>
          <span class="discret club-match-journee">J${match.journee}</span>
          <span class="contact-nom">${echapper(affiche)}</span>
          <span class="discret club-match-quand">${echapper(
            echeanceLisible(depuisDateISO(match.date)),
          )}</span>
          <button type="button" class="poser-match"
            data-poser-match="${echapper(piste.id)}"
            data-match-journee="${match.journee}"
            data-match-date="${echapper(match.date)}"
            title="Poser au calendrier"
            aria-label="Poser ${echapper(affiche)} au calendrier"
            >${ICONES_PORTES.matchs}</button>
        </li>`;
    })
    .join('')}</ul>`;
}

// Les matchs de ce club que Noé a couverts (demande de Noé, 15 août 2026). Un
// seul chiffre : « au calendrier » et « rencontres » ont été retirés le jour
// même — la fiche dit ce qui a été fait avec ce club, le reste est déjà plus bas
// ou ailleurs.
//
// Un événement appartient au club dès qu'il le porte d'un côté ou de l'autre de
// l'affiche : c'est le LIEN qui fait le match, pas le titre ni `type_moment`. Et
// « couvert » veut dire VÉCU — la face vécue de l'événement, posée par un geste.
// Un match posé au calendrier où Noé n'est pas allé ne compte pas : sans quoi le
// compteur cesserait de dire du vrai.
//
// Calculée sur les événements déjà en mémoire, sans une lecture de plus, et
// exportée pour être vérifiable seule : deux tableaux suffisent, ni session ni
// réseau.
export function matchsCouverts(piste, evenements) {
  return evenements.filter(
    (evenement) =>
      estVecue(evenement) &&
      (evenement.club_recevant === piste.id || evenement.club_visiteur === piste.id),
  ).length;
}

// La fiche d'un club : tout ce qu'on sait de lui sur un écran (demande de Noé,
// 15 août 2026). Elle s'ouvre en touchant sa ligne au vivier, et montre ce que
// les listes abrègent — les quatre portes en toutes lettres, et TOUS ses
// contacts, « pas de contact » compris : ici on cherche, on n'agit pas.
function fenetreClub(etat) {
  if (!etat.clubOuvert) return '';
  const piste = etat.pistes.find((candidat) => candidat.id === etat.clubOuvert);
  if (!piste) return '';

  const dedans = contactsDuClub(piste, etat.contacts);
  const couverts = matchsCouverts(piste, etat.evenements);
  const etatDuClub = piste.date_contacte
    ? `Écrit ${echeanceLisible(depuisDateISO(piste.date_contacte))}`
    : piste.en_fournee
      ? 'Dans ta fournée de la semaine'
      : 'Jamais contacté';

  const gens = dedans.length
    ? `<ul class="club-contacts">${dedans
        .map((contact) => {
          const statut = statutLisible(contact.statut);
          return `
          <li>
            <button type="button" class="club-contact" data-ouvrir-contact="${echapper(contact.id)}">
              <span class="contact-nom">${echapper(contact.nom)}</span>
              ${pastilleTexte(
                TYPES_CONTACT[contact.type] ?? contact.type ?? 'Autre',
                teinteDuType(contact.type),
              )}
              ${pastilleTexte(statut.nom, statut.teinte)}
            </button>
          </li>`;
        })
        .join('')}</ul>`
    : `<p class="vide">Personne ici pour l'instant. Le « + » ouvre une fiche.</p>`;

  return construireFenetre(
    piste.nom,
    `<h3 class="fenetre-titre titre-club">
       ${ecussonDuClub(piste.nom, { grand: true })}${echapper(piste.nom)}
     </h3>

     <!-- Les infos du club à gauche, ce qu'on a fait avec lui à droite (demande
          de Noé, 15 août 2026). Un seul chiffre, et il tient dans la hauteur
          des deux lignes qu'il longe : la fiche dit l'obtenu sans y consacrer
          une rangée. Un zéro n'est pas une faute — c'est un club qui attend. -->
     <div class="club-tete">
       <div class="club-tete-infos">
         <p class="club-entete">
           ${pastillesPiste(piste)}
           <span class="discret">${echapper(etatDuClub)}</span>
         </p>
         ${
           piste.prochain
             ? `<p class="discret club-match">${echapper(texteProchainMatch(piste))} —
                 ${echapper(echeanceLisible(depuisDateISO(piste.prochain.date)))}</p>`
             : ''
         }
       </div>
       <p class="club-bilan">
         <span class="chiffre">${couverts}</span>
         <span class="discret">Match${couverts > 1 ? 's' : ''} couvert${
           couverts > 1 ? 's' : ''
         }</span>
       </p>
     </div>

     <!-- Les portes en icônes, sous les infos du club : la même rangée que sur
          une carte de la fournée (demande de Noé, 15 août 2026). Quatre lignes
          titrées prenaient la moitié de la fiche pour dire ce que quatre
          symboles disent aussi bien. -->
     <span class="piste-liens">${liensPiste(piste).join('')}</span>

     <h4 class="club-titre">Ses matchs</h4>
     ${construireMatchsDuClub(piste, etat)}

     <h4 class="club-titre">Les contacts
       ${dedans.length ? `<span class="chiffre">${dedans.length}</span>` : ''}
       <button type="button" class="pastille-ajout" data-trouve-piste="${echapper(piste.id)}"
         title="Ajouter un contact" aria-label="Ajouter un contact à ${echapper(piste.nom)}"
         >+</button>
     </h4>
     ${gens}

     ${
       piste.en_fournee
         ? ''
         : `<button type="button" class="bouton-secondaire" data-choisir-piste="${echapper(piste.id)}"
             >Ajouter à ma fournée</button>`
     }`,
  );
}

// --- La recherche d'un club ---------------------------------------------------
// Une loupe sur les trois pages où l'on pense clubs — Réseau, Passerelle,
// vivier (demande de Noé, 21 août 2026) : taper trois lettres et ajouter le
// club à la fournée de la semaine, sans parcourir les 97 lignes ni changer de
// page. La fenêtre resservit la LIGNE DU VIVIER telle quelle : même écusson,
// même état, même « + » — un seul geste à connaître, un seul code à tenir.

const LOUPE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <circle cx="11" cy="11" r="7"></circle>
  <path d="m21 21-4.3-4.3"></path></svg>`;

// Fermée : la loupe seule au bord droit du titre. Ouverte : la barre se
// déploie À SA GAUCHE, sur la même ligne, et la loupe en fait partie — à
// gauche du champ, comme l'icône d'un champ de recherche (demande de Noé,
// 21 août 2026). Le fondu vient de la droite : la barre naît de la loupe.
function zoneLoupeClubs(etat = { rechercheClub: null }) {
  const loupe = `
    <button type="button" class="loupe-clubs" data-ouvrir-recherche
      title="${etat.rechercheClub === null ? 'Chercher un club' : 'Fermer la recherche'}"
      aria-expanded="${etat.rechercheClub !== null}"
      aria-label="${etat.rechercheClub === null ? 'Chercher un club' : 'Fermer la recherche'}">${LOUPE}</button>`;

  if (etat.rechercheClub === null) return loupe;

  // La loupe ne bouge pas d'un pixel : elle reste au bord droit, et c'est le
  // champ qui se déploie à sa gauche — elle finit donc à DROITE de la barre
  // (précision de Noé, 21 août 2026). Un contrôle qui saute de place au clic
  // ferait chercher des yeux ce qu'on vient de toucher.
  return `
    <span class="barre-loupe">
      <input type="text" class="recherche-club" data-recherche-club
        value="${echapper(etat.rechercheClub)}"
        placeholder="Chercher un club…" autocomplete="off"
        aria-label="Chercher un club du vivier">
      ${loupe}
    </span>`;
}

// Sans accents ni casse : « seville » trouve Séville, « bale » trouve Bâle.
function normalPourRecherche(texte) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Le corps de la liste, seul : c'est lui — et lui seulement — qui se redessine
// à chaque frappe, pour que le champ garde son curseur.
export function construireResultatsClubs(pistes, contacts = [], texte = '') {
  // Champ vide : rien. On est venu TAPER un nom, pas relire les 97 lignes —
  // le vivier existe pour ça (demande de Noé, 21 août 2026).
  const cherche = normalPourRecherche(texte.trim());
  if (!cherche) return '';

  marquerLesRelances(pistes, contacts);
  const dedans = [...pistes]
    .filter((piste) => normalPourRecherche(piste.nom).includes(cherche))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

  return dedans.length
    ? dedans.map((piste) => ligneVivier(piste, { match: false })).join('')
    : `<li class="vide">Aucun club de ce nom au vivier.</li>`;
}

// À PLAT dans la page, jamais dans une fenêtre (correction de Noé, 21 août
// 2026) : les résultats suivent le titre dans le flux — les mêmes lignes que
// le vivier, en lignes à filets.
function listeResultatsClubs(etat) {
  if (etat.rechercheClub === null) return '';
  return `
    <ul class="recherche-clubs" data-bloc="resultats-clubs">
      ${construireResultatsClubs(etat.pistes, etat.contacts, etat.rechercheClub)}
    </ul>`;
}

export function construireVivier(pistes, division = 'tout', contacts = []) {
  marquerLesRelances(pistes, contacts);

  const dedans = division === 'tout'
    ? pistes
    : pistes.filter((piste) => piste.division === division);

  const compte = (cles) => pistes.filter((p) => cles === 'tout' || p.division === cles).length;
  const filtres = [['tout', 'Tout'], ...Object.entries(DIVISIONS)]
    .map(
      ([cle, nom]) => `
      <button type="button" data-division="${cle}"
        aria-pressed="${cle === division}" class="${cle === division ? 'actif' : ''}"
        >${echapper(nom)} <span class="chiffre">${compte(cle)}</span></button>`,
    )
    .join('');

  // Le chemin parcouru, en tête : le vivier dit d'abord l'obtenu.
  const contactees = pistes.filter((piste) => piste.date_contacte).length;

  return `
    <p class="discret vivier-chemin">
      <span class="chiffre">${contactees}</span> club${contactees > 1 ? 's' : ''}
      contacté${contactees > 1 ? 's' : ''} sur <span class="chiffre">${pistes.length}</span>.
      ${contactees ? '' : 'Le premier ouvre la saison.'}
    </p>
    <div class="filtres" role="group" aria-label="Compétition">${filtres}</div>
    ${
      dedans.length
        ? `<ul>${[...dedans]
            .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
            .map(ligneVivier)
            .join('')}</ul>`
        : `<p class="vide">Aucun club dans cette compétition.</p>`
    }`;
}

// Le chantier Clubs, replié : le chemin parcouru, division par division. Un
// club contacté est un fait acquis — il ne redescend pas, et rien ici ne
// parle de ce qui « reste » : on dit l'obtenu.
function construireChantier(pistes) {
  const contactees = pistes.filter((piste) => piste.date_contacte);

  const lignes = Object.entries(DIVISIONS)
    .map(([division, nom]) => {
      const dedans = pistes.filter((piste) => piste.division === division);
      if (!dedans.length) return '';
      const faites = dedans.filter((piste) => piste.date_contacte);

      return `
        <li>
          <span class="contact-nom">${echapper(nom)}</span>
          <span class="discret"><span class="chiffre">${faites.length}</span>
            club${faites.length > 1 ? 's' : ''} contacté${faites.length > 1 ? 's' : ''}
            sur <span class="chiffre">${dedans.length}</span></span>
          ${
            faites.length
              ? `<span class="discret chantier-noms">✓ ${faites
                  .map((piste) => echapper(piste.nom))
                  .join(' · ')}</span>`
              : ''
          }
        </li>`;
    })
    .join('');

  return `
    <details class="backlog bloc-chantier">
      <summary>Le chantier Clubs
        <span class="chiffre">${contactees.length}/${pistes.length}</span>
      </summary>
      <ul>${lignes}</ul>
    </details>`;
}

// Le drapeau de relance vit sur la piste, comme le prochain match : le tirage
// et les cartes n'ont pas à connaître la base de contacts. Posé à chaque
// dessin, il suit le statut de la fiche sans rien mémoriser.
export function marquerLesRelances(pistes, contacts) {
  const parId = new Map(contacts.map((contact) => [contact.id, contact]));
  for (const piste of pistes) {
    piste.aRelancer = parId.get(piste.contact_id)?.statut === 'a_relancer';
  }
  return pistes;
}

export function construirePasserelle({
  pistes = [],
  contacts = [],
  envois = [],
  objectifDoux = 1,
  grainePropositions = 1,
  pistesPassees = [],
  propositionsOuvertes = false,
  // Quelle personne du club est regardée, par piste. Un état d'écran : la
  // bande garde son premier venu tant qu'on n'en touche pas une autre.
  contactChoisi = {},
} = {}) {
  marquerLesRelances(pistes, contacts);

  // La fournée garde ses clubs écrits (demande de Noé, 15 août 2026) : la carte
  // ne s'évapore pas au moment où l'on vient d'agir dessus, elle change de
  // geste. Elle se vide au changement de semaine, quand la fournée se refait.
  const fournee = pistes.filter((piste) => piste.en_fournee);

  return `
    ${construireMetrique({ envois, pistes, contacts, objectifDoux })}

    <!-- UN seul titre depuis le 15 août 2026 (demande de Noé) : il chapeaute
         tout ce sur quoi on agit — le club proposé et la fournée. Les
         sous-titres explicatifs ont sauté, et les formes disent ce qu'ils
         disaient : une ligne compacte pour le club proposé, des cartes pour
         ceux qu'on a pris. -->
    <h3 class="titre-semaine">Les messages de la semaine</h3>

    <section class="file-niveau file-porte">
      ${construirePropositions(pistes, grainePropositions, pistesPassees, propositionsOuvertes)}
    </section>

    <section class="file-niveau">
      ${
        fournee.length
          ? `<ul class="fournee-liste">${fournee
              .map((piste) => carteFournee(piste, contacts, contactChoisi[piste.id]))
              .join('')}</ul>`
          : `<p class="vide">Choisis ci-dessus les clubs de ta semaine,
              selon leurs matchs à venir.</p>`
      }
      <!-- Plus de rappel « Cette semaine : ✓ … » : il disait ce qui venait de
           disparaître de l'écran. Les cartes restent, il n'a plus d'objet. -->
    </section>
    <!-- Les deux portes en pied (vivier, modèles) sont parties le 21 août
         2026 avec le palier : la sous-navigation du réseau les rend
         redondantes — chaque page de la famille est à un clic, d'en haut. -->`;
}

// Le point d'entrée : on lit la base, puis on la dessine selon l'affichage.
// La fiche d'un contact, en fenêtre volante : tout ce qu'on sait de lui, et le
// crayon pour le corriger. Même geste que pour un moment ou une idée — le CRM
// n'a pas de raison d'avoir le sien.
function fenetreContact(etat) {
  if (!etat.contactOuvert) return '';

  const contact = etat.contacts.find((candidat) => candidat.id === etat.contactOuvert);
  if (!contact) return '';

  if (etat.editionContact) {
    return construireFenetre(
      contact.nom,
      `<h3 class="fenetre-titre">Modifier la fiche</h3>
       ${construireFormulaire({
         id: 'contact-edition',
         action: 'modifier-contact',
         bouton: 'Enregistrer',
         avecPli: false,
         extra: `<input type="hidden" name="id" value="${echapper(contact.id)}">`,
         champs: [
           { nom: 'nom', libelle: 'Nom', type: 'text', valeur: contact.nom, requis: true },
           { nom: 'type', libelle: 'Type', type: 'choix', options: TYPES_CONTACT, valeur: contact.type },
           { nom: 'structure', libelle: 'Rattaché à', type: 'text',
             valeur: contact.structure ?? '', suggestions: nomsDesClubs(etat.pistes) },
           {
             nom: 'statut',
             libelle: 'Où en est la relation',
             type: 'choix',
             options: Object.fromEntries(
               Object.entries(STATUTS_CONTACT).map(([cle, { nom }]) => [cle, nom]),
             ),
             valeur: contact.statut,
           },
           { nom: 'instagram', libelle: 'Instagram', type: 'text', valeur: contact.instagram ?? '' },
           { nom: 'email', libelle: 'E-mail', type: 'text', valeur: contact.email ?? '' },
           { nom: 'telephone', libelle: 'Téléphone', type: 'text', valeur: contact.telephone ?? '' },
           { nom: 'notes', libelle: 'Notes', type: 'textarea', valeur: contact.notes ?? '' },
         ],
       })}`,
    );
  }

  const liens = [lienInstagram(contact), lienEmail(contact), lienTelephone(contact)].filter(Boolean);
  const ligne = (libelle, valeur) =>
    valeur ? `<span class="contact-ligne"><span class="discret">${libelle}</span>${valeur}</span>` : '';

  return construireFenetre(
    contact.nom,
    `<div class="contact-complet">
       <span class="tuile-entete">
         ${pastilleTexte(TYPES_CONTACT[contact.type] ?? contact.type)}
         ${pastilleTexte(
           statutLisible(contact.statut).nom,
           statutLisible(contact.statut).teinte,
         )}
       </span>
       <span class="contact-nom">${echapper(contact.nom)}</span>
       ${ligne('Structure', contact.structure ? echapper(contact.structure) : '')}
       ${ligne('Contacts', liens.length ? liens.join('<span class="discret"> · </span>') : '')}
       ${ligne(
         'Dernier échange',
         contact.dernier_echange
           ? echapper(echeanceLisible(depuisDateISO(contact.dernier_echange)))
           : '',
       )}
       ${ligne('Objectif', contact.objectif ? echapper(contact.objectif) : '')}
       ${ligne(
         'Prochaine action',
         contact.prochaine_action ? echapper(contact.prochaine_action) : '',
       )}
       ${contact.notes ? `<span class="discret contact-notes">${echapper(contact.notes)}</span>` : ''}
       <span class="moment-actions">
         <button type="button" class="lien-discret bouton-mini"
           data-nouvelle-commande="${echapper(contact.nom)}">Nouvelle commande</button>
         <button type="button" class="bouton-icone"
           data-modifier-contact="${echapper(contact.id)}"
           title="Modifier cette fiche"
           aria-label="Modifier la fiche de ${echapper(contact.nom)}">${CRAYON}</button>
       </span>
     </div>`,
  );
}

export function construireContacts(contacts, options = {}) {
  const retenus = baseContacts(contacts, options);

  const compte = `<p class="discret compte-base"><span class="chiffre">${retenus.length}</span> sur <span class="chiffre">${contacts.length}</span></p>`;

  const dessin =
    options.affichage === 'fiches'
      ? construireFichesContacts(retenus, contacts)
      : construireTableauContacts(retenus, contacts, options);

  return compte + dessin;
}

// Réseau est devenu un palier : deux outils qui partagent la même base mais
// pas le même geste. Le carnet est un fonds où l'on cherche ; la Passerelle est
// une file où l'on agit. Les mêler sur un écran obligeait à basculer entre les
// deux pour rien.
// La Passerelle : le rituel de la semaine — et, depuis la refonte du 21 août
// 2026, LA page de l'onglet Réseau : cliquer « Réseau » ouvre le bandeau et
// la fournée, pas un couloir. `#yuno/passerelle` reste une adresse valide qui
// montre la même page — renommer une adresse casserait un favori.
function vuePasserelle(etat) {
  return `
    ${enTete('reseau', etat)}

    <section class="bloc">
      <!-- Plus de titre « La Passerelle » (demande de Noé, 21 août au soir) :
           le bandeau ouvre la page. La loupe vit désormais dans la barre
           d'onglets, comme partout — plus de rangée à elle ici. -->
      <div data-bloc="contacts">${construirePasserelle(etat)}</div>
    </section>

    <!-- Les deux fonds, en tuiles de fin de page (demande de Noé, 21 août au
         soir — les pastilles de sous-navigation n'ont pas pris) : le CRM et le
         vivier, côte à côte. Les modèles de messages n'ont qu'un lien discret,
         leur page est une arrière-boutique. -->
    <div class="portes">
      <a class="lien-externe" href="#yuno/carnet">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">CRM</span>
          <span class="discret"><span class="chiffre">${etat.contacts.length}</span> fiches ·
            tableau, fiches, filtres</span>
        </span>
      </a>

      <a class="lien-externe" href="#yuno/vivier">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Le vivier</span>
          <span class="discret">Les <span class="chiffre">${etat.pistes.length}</span> clubs,
            par compétition</span>
        </span>
      </a>
    </div>
    <p><a class="lien-discret" href="#yuno/messages">Modèles de messages</a></p>
    ${pied()}`;
}

// Le vivier : les 97 clubs, filtrés par compétition. On y cherche un club
// précis ou l'on parcourt une division entière — la Passerelle, elle, ne sert
// qu'une porte à la fois.
function vueVivier(etat) {
  return `
    ${enTete('vivier', etat)}

    <section class="bloc">
      <h2>Le vivier</h2>
      <div data-bloc="contacts">${construireVivier(etat.pistes, etat.divisionVivier, etat.contacts)}</div>
    </section>
    ${pied()}`;
}

// Les modèles de messages ont leur page depuis le 15 août 2026 (demande de
// Noé) : la friction du premier message se traite à froid, en amont du
// rituel — pas au bas de l'écran où l'on agit.
function vueMessages(etat) {
  return `
    ${enTete('messages', etat)}

    <section class="bloc">
      <h2>Les modèles de messages</h2>
      <p class="discret file-aide">La friction du premier message est le principal
        mur de l'aller-vers : une phrase déjà écrite en abaisse le coût.</p>
      <div data-bloc="contacts">${construireModeles(etat.modeles)}</div>
    </section>
    ${pied()}`;
}

// MISSIONS — le tableau de bord du travail concret (option A, validée par Noé
// le 21 août 2026 au soir). L'ÉVÉNEMENT est le pivot : une commande le vise
// (`commandes.evenement_id`), une préparation le précède, le Journal en garde
// le vécu. D'où une seule liste « À préparer » — les prochains événements,
// qu'ils portent une commande ou non — puis le pipeline des commandes, et la
// tuile vers la page des préparations. Pas de total encaissé : l'argent est
// une conséquence, pas un juge (retranché par Noé, « pas pour le moment »).

// Les 30 prochains jours, commandes en premier (chacun chronologique) : le
// travail payé passe devant, mais rien ne se cache — une sortie libre se
// prépare aussi.
const HORIZON_A_PREPARER = 30;

function blocAPreparer(etat) {
  const maintenant = new Date();
  const horizon = ajouterJours(maintenant, HORIZON_A_PREPARER);
  const commandeDe = new Map(
    etat.commandes
      .filter((c) => c.evenement_id && ['devis', 'en_cours'].includes(c.statut))
      .map((c) => [c.evenement_id, c]),
  );

  const aVenir = etat.evenements
    .filter((e) => {
      const debut = new Date(e.date_debut);
      return debut >= maintenant && debut <= horizon;
    })
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
  const lignes = [
    ...aVenir.filter((e) => commandeDe.has(e.id)),
    ...aVenir.filter((e) => !commandeDe.has(e.id)),
  ];

  if (!lignes.length) {
    return `<p class="vide">Tes événements des <span class="chiffre">${HORIZON_A_PREPARER}</span>
      prochains jours s'afficheront ici, prêts à préparer — ils se notent au calendrier.</p>`;
  }

  return `<ul>${lignes
    .map((evenement) => {
      const commande = commandeDe.get(evenement.id);
      return `
    <li>
      <span class="tuile-entete">
        ${
          commande
            ? `<span class="etiquette">Commande</span>${
                commande.client
                  ? `<span class="contact-structure">${echapper(commande.client)}</span>`
                  : ''
              }`
            : `<span class="etiquette">${TYPES_MOMENT[evenement.type_moment] ?? 'Sortie'}</span>`
        }
        <span class="discret quand">${echapper(momentLisible(new Date(evenement.date_debut)))}</span>
      </span>
      <span class="pub-titre">${echapper(evenement.titre)}</span>
      ${evenement.lieu ? `<span class="discret">${echapper(evenement.lieu)}</span>` : ''}
      ${boutonPreparer(
        feuilleDeLaSortie(etat.preparations, 'evenement', evenement.id),
        'evenement',
        evenement.id,
      )}
    </li>`;
    })
    .join('')}</ul>`;
}

function vueMissions(etat) {
  return `
    ${enTete('missions', etat)}

    <section class="bloc">
      <h2>À préparer</h2>
      <div data-bloc="a-preparer">${blocAPreparer(etat)}</div>
    </section>

    <section class="bloc">
      <h2>Les commandes</h2>
      <div data-bloc="commandes">${construireCommandes(
        etat.commandes,
        etat.preparations,
        etat.evenements,
      )}</div>
    </section>

    <div class="portes">
      <a class="lien-externe" href="#yuno/preparations">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Préparations</span>
          <span class="discret">Toutes les feuilles, et leurs modèles</span>
        </span>
      </a>
    </div>
    ${pied()}`;
}

// La commande s'ajoute en FENÊTRE VOLANTE, comme tous les ajouts du site
// (demande de Noé, 21 août au soir) : le « + » des pages Missions l'ouvre, et
// « Nouvelle commande » depuis une fiche du CRM arrive ici, client déjà écrit.
function fenetreCommande(etat) {
  // Les événements à venir en appui du champ : écrire le titre exact relie la
  // commande à son événement — même geste que « Rattaché à » pour les clubs.
  // La saisie reste libre : une commande sans événement est possible.
  const aVenir = etat.evenements
    .filter((e) => new Date(e.date_debut) >= new Date())
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
    .map((e) => e.titre);

  return construireFenetre(
    'Nouvelle commande',
    `<h3 class="fenetre-titre">Nouvelle commande</h3>
     ${construireFormulaire({
       id: 'commande',
       action: 'creer-commande',
       bouton: 'Ajouter la commande',
       avecPli: false,
       champs: [
         { nom: 'titre', libelle: 'Commande', type: 'text', requis: true },
         {
           nom: 'client',
           libelle: 'Client',
           type: 'text',
           valeur: etat.prefillCommande ?? '',
           suggestions: etat.contacts.map((contact) => contact.nom),
         },
         {
           nom: 'evenement',
           libelle: "L'événement visé (son titre au calendrier)",
           type: 'text',
           suggestions: aVenir,
         },
         { nom: 'statut', libelle: 'Où en est-elle', type: 'choix',
           options: STATUTS_COMMANDE, valeur: 'devis' },
         { nom: 'echeance', libelle: 'À livrer pour (facultatif)', type: 'date' },
         { nom: 'montant', libelle: 'Montant en euros (facultatif)', type: 'number' },
         { nom: 'lien_livrable', libelle: 'Lien du livrable (facultatif)', type: 'text' },
         { nom: 'notes', libelle: 'Notes', type: 'textarea' },
       ],
     })}`,
  );
}

function vueCarnet(etat) {
  return `
    ${enTete('carnet', etat)}

    <section class="bloc">
      <h2>Le réseau</h2>
      <div class="barre-base">
        <input type="search" id="recherche-contact" class="recherche"
          placeholder="Chercher partout dans le réseau…"
          value="${echapper(etat.rechercheContact)}">
        <div class="affichages" role="group" aria-label="Affichage du réseau">
          ${Object.entries(AFFICHAGES)
            .map(
              ([valeur, libelle]) => `
            <button type="button" data-affichage="${valeur}"
              aria-pressed="${valeur === etat.affichageContact}"
              class="${valeur === etat.affichageContact ? 'actif' : ''}">${libelle}</button>`,
            )
            .join('')}
        </div>
      </div>

      ${construireBarreFiltres(etat.contacts, etat)}

      <div data-bloc="contacts">${construireContacts(etat.contacts, optionsBase(etat))}</div>
      ${fenetreContact(etat)}
      <!-- Plus de pli « Ajouter au réseau » en fin de page (demande de Noé,
           15 août 2026) : le « + » flottant ouvre la même fiche, en fenêtre, et
           il est là où le pouce arrive. Deux chemins vers le même formulaire,
           c'était un de trop — et celui du bas obligeait à parcourir 47 lignes
           pour l'atteindre. -->
    </section>
    <!-- Les modèles de messages, à portée d'ici aussi (demande de Noé, 21 août
         au soir) : on écrit depuis une fiche autant que depuis le rituel. -->
    <p><a class="lien-discret" href="#yuno/messages">Modèles de messages</a></p>
    ${pied()}`;
}

// Les champs d'une fiche du réseau. Ils ne servent plus qu'à la fenêtre du
// « + » depuis que le pli du bas de page a disparu (15 août 2026).
// `prefill` : ce que la fiche sait déjà d'elle-même. Vide au cas ordinaire ;
// rempli quand elle naît d'une rencontre notée au vol — le nom est écrit, et
// la relation part de « contact établi » (ils se sont vus en vrai).
function champsContact(prefill = {}, clubs = []) {
  return [
    { nom: 'nom', libelle: 'Nom', type: 'text', requis: true, valeur: prefill.nom ?? '' },
    {
      nom: 'type',
      libelle: 'Type',
      type: 'choix',
      options: TYPES_CONTACT,
      valeur: prefill.type ?? 'joueur',
    },
    // Les 97 clubs du vivier se proposent ici (demande de Noé, 15 août 2026) :
    // écrire le nom exact d'un club RELIE la fiche à sa piste. Le champ reste
    // libre — « La Provence » n'est pas au vivier et doit pouvoir s'écrire.
    { nom: 'structure', libelle: 'Rattaché à (FC Lorient, OM, La Provence…)', type: 'text',
      valeur: prefill.structure ?? '', suggestions: clubs },
    { nom: 'instagram', libelle: 'Instagram', type: 'text' },
    { nom: 'email', libelle: 'E-mail', type: 'text' },
    { nom: 'telephone', libelle: 'Téléphone', type: 'text' },
    { nom: 'statut', libelle: 'Relation', type: 'choix',
      options: Object.fromEntries(
        Object.entries(STATUTS_CONTACT).map(([v, { nom }]) => [v, nom]),
      ),
      valeur: prefill.statut ?? 'pas_de_contact' },
    { nom: 'objectif', libelle: 'Pourquoi ce contact ? (facultatif)', type: 'text' },
    { nom: 'notes', libelle: 'Notes', type: 'textarea' },
  ];
}

// Les noms du vivier, pour les suggestions du champ « rattaché à ».
function nomsDesClubs(pistes = []) {
  return [...pistes].map((piste) => piste.nom).sort((a, b) => a.localeCompare(b, 'fr'));
}

// La piste dont le nom est celui écrit dans « rattaché à ». La comparaison
// ignore la casse et les espaces de bord : on relie ce que Noé a voulu écrire,
// pas ce qu'il a tapé au caractère près.
export function pisteDeLaStructure(structure, pistes = []) {
  const cherche = (structure ?? '').trim().toLocaleLowerCase('fr');
  if (!cherche) return null;
  return pistes.find((piste) => piste.nom.toLocaleLowerCase('fr') === cherche) ?? null;
}

// La fenêtre du « + » sur les pages du réseau : la même fiche, dans une fenêtre
// volante. L'identifiant du formulaire diffère de celui du pli — deux mêmes
// `id` sur une page, ce sont des étiquettes qui désignent le mauvais champ.
// `prefill` arrive quand la fiche naît d'une rencontre : le nom est déjà
// écrit, la relation part de « contact établi », et `rencontre_id` voyage dans
// un champ caché pour que la rencontre se relie à la fiche une fois posée.
// Sans lui, la fenêtre est celle du « + » des pages du réseau, telle quelle.
function formulaireNouveauContact(prefill = null, pistes = []) {
  return construireFenetre(
    'Ajouter au réseau',
    `<h3 class="fenetre-titre">Ajouter au réseau</h3>
     ${
       prefill?.quand
         ? `<p class="discret">Rencontré ${echapper(prefill.quand)}.</p>`
         : ''
     }
     ${construireFormulaire({
       id: 'contact-nouveau',
       action: 'creer-contact',
       bouton: 'Ajouter au réseau',
       avecPli: false,
       extra: [
         prefill?.rencontre_id
           ? `<input type="hidden" name="rencontre_id" value="${echapper(prefill.rencontre_id)}">`
           : '',
         // La fiche naît d'une piste de la Passerelle : l'identifiant voyage
         // pour que la piste se relie à la fiche une fois posée.
         prefill?.piste_id
           ? `<input type="hidden" name="piste_id" value="${echapper(prefill.piste_id)}">`
           : '',
       ].join(''),
       champs: champsContact(prefill ?? {}, nomsDesClubs(pistes)),
     })}`,
  );
}

// Ce que l'état dit à la base : ce qu'on cherche, ce qu'on garde, comment on
// trie, et comment on dessine.
function optionsBase(etat) {
  return {
    recherche: etat.rechercheContact,
    filtres: etat.filtresContact,
    tri: etat.triContact,
    sens: etat.sensContact,
    affichage: etat.affichageContact,
    ordre: etat.ordreColonnes,
    envois: etat.envois,
    objectifDoux: etat.objectifDoux,
    modeles: etat.modeles,
  };
}

// --- Les commandes -----------------------------------------------------------
// Elles vivent dans Réseau : une commande naît d'une relation, elle n'a pas
// besoin d'un onglet à elle.

export const CYCLE_COMMANDE = ['devis', 'en_cours', 'livree', 'payee'];

const STATUTS_COMMANDE = {
  devis: 'Devis',
  en_cours: 'En cours',
  livree: 'Livrée',
  payee: 'Payée',
};

// Un bouton dit ce qui va se passer.
const AVANCER_COMMANDE = {
  en_cours: 'Démarrer',
  livree: 'Marquer livrée',
  payee: 'Marquer payée',
};

// `preparations` est facultatif : une commande se prépare comme un match, et
// sa tuile porte le bouton — mais le site du FCH ou un essai isolé peuvent
// dessiner des commandes sans connaître les feuilles.
export function construireCommandes(commandes, preparations = [], evenements = []) {
  const ouvertes = commandes.filter((commande) => ['devis', 'en_cours'].includes(commande.statut));
  const closes = commandes.filter((commande) => ['livree', 'payee'].includes(commande.statut));

  const tuile = (commande) => {
    const suivant = CYCLE_COMMANDE[CYCLE_COMMANDE.indexOf(commande.statut) + 1];
    // L'événement visé (21 août 2026 au soir) : une commande de terrain a
    // presque toujours un match ou un concert au bout.
    const evenementLie = commande.evenement_id
      ? evenements.find((candidat) => candidat.id === commande.evenement_id) ?? null
      : null;

    return `
    <li>
      <span class="tuile-entete">
        ${
          commande.client
            ? `<span class="contact-structure">${echapper(commande.client)}</span>`
            : '<span class="discret">sans client</span>'
        }
        ${
          commande.montant
            ? `<span class="chiffre commande-montant">${echapper(commande.montant)} €</span>`
            : ''
        }
        ${
          commande.echeance
            ? `<span class="discret quand">${echapper(
                echeanceLisible(depuisDateISO(commande.echeance)),
              )}</span>`
            : ''
        }
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-supprimer-commande="${echapper(commande.id)}"
          title="Supprimer"
          aria-label="Supprimer « ${echapper(commande.titre)} »">×</button>
      </span>
      <span class="pub-titre">${echapper(commande.titre)}</span>
      ${
        evenementLie
          ? `<span class="discret">Pour ${echapper(evenementLie.titre)} ·
              ${echapper(momentLisible(new Date(evenementLie.date_debut)))}</span>`
          : ''
      }
      ${commande.notes ? `<span class="discret pub-notes">${echapper(commande.notes)}</span>` : ''}
      <span class="pub-actions">
        <span class="pub-statut">statut : <strong>${echapper(
          (STATUTS_COMMANDE[commande.statut] ?? commande.statut).toLowerCase(),
        )}</strong></span>
        ${
          suivant
            ? `<button type="button" class="bouton-secondaire bouton-mini"
                 data-avancer-commande="${echapper(commande.id)}">${AVANCER_COMMANDE[suivant]}</button>`
            : ''
        }
        ${boutonPreparer(feuilleDeLaSortie(preparations, 'commande', commande.id), 'commande', commande.id)}
        ${
          commande.lien_livrable
            ? `<a class="discret" href="${echapper(commande.lien_livrable)}"
                 target="_blank" rel="noopener">voir la galerie ↗</a>`
            : ''
        }
      </span>
    </li>`;
  };

  return `
    ${
      ouvertes.length
        ? `<ul>${ouvertes.map(tuile).join('')}</ul>`
        : `<p class="vide">Tes commandes se suivront ici, du devis au paiement.</p>`
    }
    ${
      closes.length
        ? `<details class="backlog">
             <summary>Livrées et payées <span class="chiffre">${closes.length}</span></summary>
             <ul>${closes.map(tuile).join('')}</ul>
           </details>`
        : ''
    }`;
}

// Le formulaire plié « Ajouter une commande » est parti le 21 août au soir :
// la commande s'ajoute en fenêtre volante (`fenetreCommande`), comme tout le
// reste du site.

// --- Montage ----------------------------------------------------------------

// Où chaque morceau de l'état va se chercher. Une source rend l'objet à fondre
// dans l'état, pas une liste nue : les moments ramènent leurs photos avec eux,
// et le reste du code n'a pas à savoir que ces deux-là voyagent ensemble.
const SOURCES = {
  objectifs: async () => ({ objectifs: await api.objectifsActifs({ projet: 'photo' }) }),
  publications: async () => ({ publications: await api.publicationsToutes('photo') }),
  taches: async () => ({ taches: await api.tachesDatees({ projet: 'photo' }) }),
  // Tous les événements, avec leur face vécue : la grille se promène dans le
  // passé, l'invite du Carnet y puise la semaine écoulée, et le carnet lui-même
  // n'a plus d'autre source depuis la fusion — les sorties vécues SONT des
  // événements. D'où les rencontres et les photos qui voyagent avec.
  evenements: async () => {
    const evenements = await api.evenementsTous({ projet: 'photo', avecRencontres: true });
    // Les photos vivent dans un bucket privé : leurs adresses se signent à la
    // lecture, toutes ensemble.
    const chemins = evenements.map((evenement) => evenement.photo_chemin).filter(Boolean);
    return {
      evenements,
      photos: chemins.length ? await api.urlsDesPhotos(chemins) : {},
      photosLe: Date.now(),
    };
  },
  contacts: async () => ({ contacts: await api.contactsTous() }),
  commandes: async () => ({ commandes: await api.commandesToutes() }),
  envois: async () => ({ envois: await api.envoisTous() }),
  modeles: async () => ({ modeles: await api.modelesTous() }),
  // Le prochain match voyage SUR sa piste (`piste.prochain`) : il suit le club
  // partout — cartes, lignes, cache de session — sans clé d'état à part.
  pistes: async () => {
    const [pistes, prochains] = await Promise.all([
      api.pistesToutes(),
      api.prochainsMatchsParPiste(),
    ]);
    const parPiste = new Map(prochains.map((match) => [match.piste_id, match]));
    for (const piste of pistes) piste.prochain = parPiste.get(piste.id) ?? null;

    // La fournée est HEBDOMADAIRE (décision de Noé, 21 août 2026) : un club
    // choisi en semaine N ne s'affiche plus en semaine N+1. Le site n'a pas de
    // minuit à lui — c'est ce chargement-ci qui fait le ménage, à la première
    // visite de la semaine. L'écran d'abord (les pistes arrivent déjà vidées),
    // l'écriture derrière ; si elle échoue, le prochain chargement retentera —
    // rien à remettre en arrière, l'état vrai est « plus en fournée ».
    // Une piste sans semaine (donnée d'avant la migration) est traitée comme
    // finie : pas de preuve de fraîcheur, pas de place dans la fournée.
    const lundi = versDateISO(debutDeSemaine());
    const finies = pistes.filter(
      (piste) => piste.en_fournee && (piste.fournee_semaine ?? '') < lundi,
    );
    if (finies.length) {
      for (const piste of finies) piste.en_fournee = false;
      api.viderLaFournee(finies.map((piste) => piste.id)).catch((souci) => {
        console.error('Vidage de la fournée impossible', souci);
      });
    }

    return { pistes };
  },
  // Les préparations et modèles du FCH restent chez le club (demande de Noé,
  // 21 août 2026 au soir) : une feuille de réunion et ses six modèles n'ont
  // rien à faire dans les listes de Yuno. Une feuille sans événement (une
  // commande, ou un événement disparu) est de Yuno par nature — le FCH n'en
  // crée plus depuis que ses réunions ont leur fiche.
  preparations: async () => ({
    preparations: (await api.preparationsToutes()).filter(
      (feuille) => !feuille.evenement || feuille.evenement.projet === 'photo',
    ),
  }),
  modelesPrepa: async () => ({
    modelesPrepa: (await api.modelesPreparationTous()).filter(
      (modele) => modele.projet === 'photo',
    ),
  }),
};

// Ce dont chaque vue a besoin pour se dessiner — et rien de plus. Les onze
// requêtes partaient ensemble à l'ouverture ; l'accueil en demande cinq, la
// banque une seule. Le reste arrive quand on va le voir.
//
// Une clé qui manque ici, c'est un écran vide affiché à la place de données qui
// existent : quand une vue gagne un bloc, sa ligne se relit.
const BESOINS = {
  // L'accueil et le Journal montrent le vécu : c'est `evenements` qui le porte
  // depuis la fusion, avec ses photos et ses rencontres. Les préparations
  // viennent avec — la fiche d'une sortie montre son bilan.
  // `modelesPrepa` sert au bloc de la sortie du moment : quand elle n'a pas
  // encore sa feuille, il porte le bouton « Préparer », qui doit savoir combien
  // de modèles offrir. Sans cette lecture, il créerait une feuille vierge.
  accueil: ['evenements', 'objectifs', 'publications', 'contacts', 'preparations', 'modelesPrepa'],
  journal: ['evenements', 'contacts', 'preparations'],
  creer: ['publications'],
  banque: ['publications'],
  editorial: ['publications'],
  // Le calendrier et le réseau lisent aussi les préparations et leurs
  // modèles : un événement ou une commande doit savoir s'il a déjà sa feuille
  // (« Préparer » ou « Ouvrir »), et combien de modèles le choix offrira.
  calendrier: ['evenements', 'taches', 'objectifs', 'publications', 'commandes', 'contacts', 'preparations', 'modelesPrepa', 'pistes'],
  // L'onglet Réseau ouvre la Passerelle depuis le 21 août 2026 : les deux
  // adresses lisent la même chose. Les commandes, parties sur leur page,
  // ont emporté leurs lectures — la page d'arrivée du réseau en fait quatre.
  reseau: ['contacts', 'envois', 'pistes'],
  passerelle: ['contacts', 'envois', 'pistes'],
  vivier: ['pistes', 'contacts', 'evenements'],
  messages: ['modeles'],
  carnet: ['contacts', 'envois', 'modeles', 'pistes'],
  // Le tableau de bord des Missions lit les événements (la liste « À
  // préparer » et le lien commande → événement), les commandes, et les
  // feuilles avec leurs modèles — « Préparer / Ouvrir » doit savoir si une
  // feuille existe et combien de modèles le choix offrira.
  missions: ['evenements', 'commandes', 'contacts', 'preparations', 'modelesPrepa'],
  commandes: ['evenements', 'commandes', 'contacts', 'preparations', 'modelesPrepa'],
  // La feuille lit aussi les sorties : le bilan propose d'inscrire celle-ci au
  // carnet (l'événement dit s'il est déjà vécu et de quel type ; les contacts
  // relient les rencontres).
  preparations: ['preparations', 'modelesPrepa', 'contacts', 'evenements'],
  modeles: ['preparations', 'modelesPrepa'],
};

const CLE_CACHE = 'yuno';

// Les adresses des photos sont signées un mois et réutilisées 25 jours
// (api.urlsDesPhotos, 21 août 2026). Passé ce délai on ne ressort pas le mur du
// cache : un mur d'images mortes vaut moins qu'un écran qui attend. La MÊME
// constante que le garde-manger d'api.js — deux durées écrites à deux endroits
// finiraient par diverger, et c'est l'écart entre elles qui ferait le bug.
const SIGNATURE_UTILE = api.REUTILISATION_PHOTOS;

// Le chrome d'abord. La signature, la barre et le pied se posent tout de suite,
// et le contenu vient dedans — on peut changer d'onglet avant même que les
// données soient arrivées. Les points de suspension sont ceux du reste du hub
// (dashboard.js, perso.js) : un bloc qui attend, pas un bloc vide.
function squelette(vue) {
  // Pas d'état ici : la loupe se montre fermée, c'est son défaut.
  return `
    ${enTete(vue)}
    <section class="bloc"><p class="vide">…</p></section>
    <section class="bloc"><p class="vide">…</p></section>
    ${pied()}`;
}

export default {
  async monter(section, route) {
    const etat = {
      objectifs: [],
      publications: [],
      taches: [],
      evenements: [],
      contacts: [],
      commandes: [],
      envois: [],
      modeles: [],
      pistes: [],
      // La graine du tirage des propositions : celle de la semaine par défaut
      // — la dizaine change donc chaque lundi toute seule — et « Proposer
      // d'autres clubs » en prend une neuve.
      grainePropositions: Number(versDateISO(debutDeSemaine()).replaceAll('-', '')),
      // Les clubs passés cette semaine (choix d'écran, localStorage), et la
      // fenêtre de la dizaine.
      pistesPassees: pistesPasseesEnregistrees(),
      propositionsOuvertes: false,
      // La compétition regardée au vivier. État d'écran, pas un réglage : on
      // rouvre la page sur tout le vivier.
      divisionVivier: 'tout',
      // La recherche d'un club : null fenêtre fermée, sinon le texte tapé.
      rechercheClub: null,
      // La personne regardée sur chaque carte de la fournée, par piste.
      contactChoisi: {},
      // Le week-end regardé au calendrier : son vendredi, ses rencontres, et
      // le pli ouvert ou non. Un état d'écran — on rouvre le calendrier sur le
      // week-end qui vient, pas sur celui qu'on regardait hier.
      ancreWeekend: vendrediDeLaSemaine(),
      matchsWeekend: null,
      // La compétition regardée au week-end. Elle SURVIT au changement de
      // week-end : on suit une division de semaine en semaine, on ne la
      // rechoisit pas à chaque coup de flèche.
      competitionWeekend: 'tout',
      // Le club dont la fiche est ouverte, au vivier, et ses matchs à venir —
      // chargés à l'ouverture, gardés ensuite : on rouvre souvent la même
      // fiche, et le calendrier d'un club ne bouge pas dans la journée.
      clubOuvert: null,
      matchsDuClub: {},
      preparations: [],
      modelesPrepa: [],
      // L'identifiant de la feuille (ou du modèle) ouvert — il vient de
      // l'adresse (#yuno/preparations/<id>, #yuno/modeles/<id>), jamais d'un
      // état d'interface.
      feuilleOuverte: null,
      // La sortie en attente d'un modèle, quand il y en a plusieurs : la
      // fenêtre de choix est ouverte tant que c'est posé.
      choixPrepa: null,
      ecartes: evenementsEcartes(),
      // Les sorties dont la préparation ne s'affiche plus à l'accueil.
      prepasEcartees: prepasEcartees(),
      // Le mot dit après une écriture qui a échoué. Il vit dans l'état comme
      // le reste : `rendre()` le pose sous la barre, quelle que soit la vue.
      souci: null,
      prefillMoment: null,
      // La fenêtre « Nouvelle commande », et le client qu'elle porte déjà
      // quand elle naît d'une fiche du CRM. Effacés en quittant les Missions.
      commandeNouvelle: false,
      prefillCommande: null,
      captureOuverte: false,
      // La fiche du carnet ouverte par le « + » des pages du réseau.
      contactNouveau: false,
      // Les identifiants de ce qui est ouvert en fenêtre, jamais leur copie.
      ideeOuverte: null,
      momentOuvert: null,
      editionMoment: false,
      contactOuvert: null,
      editionContact: false,
      photos: {},
      objectifDoux: objectifDouxEnregistre(),
      vue: 'accueil',
      natures: toutesLesNatures(),
      vueCal: 'mois',
      ancreCal: new Date(),
      creationCal: null,
      detailCal: null,
      editionCal: false,
      jourOuvertCal: null,
      pilier: 'tout',
      statutIdee: 'tout',
      cloture: false,
      rechercheContact: '',
      filtresOuverts: false,
      filtresAjoutes: [],
      filtresContact: {},
      colonnesOuvertes: false,
      ordreColonnes: ordreEnregistre(),
      triContact: 'nom',
      sensContact: 1,
      affichageContact: 'tableau',
    };

    // --- Le chargement, morceau par morceau ---
    //
    // Trois ensembles, et ils ne disent pas la même chose :
    //   `affichables` — ce qu'on peut dessiner, cache compris ;
    //   `fraiches`    — ce qui vient du serveur pendant cette visite ;
    //   `enVol`       — ce qui est parti et n'est pas revenu.
    // Sans cette distinction, une donnée sortie du cache passerait pour à jour
    // et ne serait jamais rechargée.
    const affichables = new Set();
    const fraiches = new Set();
    const enVol = new Map();
    let echecChargement = false;

    // Comment le site dit qu'une écriture a échoué. Le message s'efface seul :
    // il parle du geste qui vient d'avoir lieu, pas de l'état du site.
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

    // Le cache de session : le dernier état de l'onglet, affiché tout de suite.
    const restaure = lireCache(CLE_CACHE);
    if (restaure) {
      if (Date.now() - (restaure.photosLe ?? 0) > SIGNATURE_UTILE) {
        // Les événements partent avec leurs photos : des sorties sans adresses
        // valides, c'est le mur vide affiché à tort.
        delete restaure.evenements;
        delete restaure.photos;
      }
      for (const [cle, valeur] of Object.entries(restaure)) {
        if (!(cle in SOURCES) && cle !== 'photos' && cle !== 'photosLe') continue;
        etat[cle] = valeur;
        if (cle in SOURCES) affichables.add(cle);
      }
    }

    // Ce qu'on remet en cache : les données, jamais l'état d'interface (les
    // fenêtres ouvertes, les filtres, la vue). Rouvrir l'app doit retrouver le
    // contenu, pas une fenêtre volante restée ouverte la veille.
    const aGarder = () => {
      const garde = {};
      for (const cle of affichables) garde[cle] = etat[cle];
      if (affichables.has('evenements')) {
        garde.photos = etat.photos;
        garde.photosLe = etat.photosLe ?? 0;
      }
      return garde;
    };

    const lancer = (cle) => {
      const promesse = SOURCES[cle]()
        .then((donnees) => {
          Object.assign(etat, donnees);
          fraiches.add(cle);
          affichables.add(cle);
        })
        .finally(() => enVol.delete(cle));
      enVol.set(cle, promesse);
      return promesse;
    };

    // Rend `true` si quelque chose est arrivé — pour ne pas redessiner la page
    // quand tout était déjà là.
    const charger = async (cles) => {
      const aFaire = cles.filter((cle) => !fraiches.has(cle));
      if (!aFaire.length) return false;

      try {
        await Promise.all(aFaire.map((cle) => enVol.get(cle) ?? lancer(cle)));
        echecChargement = false;
        ecrireCache(CLE_CACHE, aGarder());
      } catch (erreur) {
        console.error("Chargement de l'espace Yuno impossible", erreur);
        echecChargement = true;
      }
      return true;
    };

    const pretPour = (vue) => (BESOINS[vue] ?? []).every((cle) => affichables.has(cle));

    // Déclaré ici parce que `rendre` s'en sert : la fonction est posée plus
    // bas, quand les écouteurs se branchent.
    let poserLEntreeClavier = null;
    let rafraichirLaCapture = null;
    // La vue précédemment dessinée. Le fondu ne joue qu'au CHANGEMENT DE LIEU :
    // `rendre()` est appelé à chaque geste — cocher une case, ouvrir une
    // fenêtre — et faire respirer la page entière à chaque fois serait pire
    // que pas d'animation du tout.
    let vueDessinee = null;

    const rendre = () => {
      const pret = pretPour(etat.vue);

      if (!pret) section.innerHTML = squelette(etat.vue);
      else if (etat.vue === 'journal') section.innerHTML = vueJournal(etat);
      else if (etat.vue === 'creer') section.innerHTML = vueCreer(etat);
      else if (etat.vue === 'banque') section.innerHTML = vueBanque(etat);
      else if (etat.vue === 'editorial') section.innerHTML = vueEditorial(etat);
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      // Deux adresses, une même page : l'onglet Réseau ouvre la Passerelle.
      else if (etat.vue === 'reseau' || etat.vue === 'passerelle')
        section.innerHTML = vuePasserelle(etat);
      // « commandes » est une adresse de la même page : le tableau de bord.
      else if (etat.vue === 'missions' || etat.vue === 'commandes')
        section.innerHTML = vueMissions(etat);
      else if (etat.vue === 'vivier') section.innerHTML = vueVivier(etat);
      else if (etat.vue === 'messages') section.innerHTML = vueMessages(etat);
      else if (etat.vue === 'carnet') section.innerHTML = vueCarnet(etat);
      else if (etat.vue === 'preparations') section.innerHTML = vuePreparations(etat);
      else if (etat.vue === 'modeles') section.innerHTML = vueModele(etat);
      else section.innerHTML = vueAccueil(etat);

      // Le message d'échec se pose sous la barre, quelle que soit la vue : les
      // fonctions de vue n'ont pas à connaître l'état du réseau.
      if (echecChargement) {
        section.querySelector('.yuno-nav')?.insertAdjacentHTML(
          'afterend',
          `<p class="vide">Les données n'ont pas pu être chargées.
             <button type="button" class="lien-discret"
               data-action="reessayer">Réessayer</button></p>`,
        );
      }

      // Une écriture qui a échoué : l'écran est revenu en arrière tout seul, et
      // il faut le dire — un geste défait en silence ressemble à une panne. Au
      // même endroit que l'échec de chargement, et effacé au bout de quelques
      // secondes : le laisser traîner en ferait un reproche.
      if (etat.souci) {
        section.querySelector('.yuno-nav')?.insertAdjacentHTML(
          'afterend',
          `<p class="vide">${echapper(etat.souci)}</p>`,
        );
      }

      // Le « + » et la fenêtre du moment suivent toutes les vues. Posés ici
      // plutôt que dans chacune : neuf gabarits à tenir à jour, c'est huit
      // oublis en puissance. Pas sur le squelette — un bouton qui ouvre une
      // fenêtre sur des données absentes ne mènerait à rien.
      if (pret) {
        // Le « + » se retire dès qu'une fenêtre est ouverte (demande de Noé,
        // 15 août au soir) : son gros rond doré flottait par-dessus la fiche
        // d'un club, au coin où l'on ne peut rien en faire. Une fenêtre est un
        // moment où l'on regarde UNE chose ; rien n'a à s'ajouter par-dessus.
        // La tuile de capture, elle, garde son fond assombri, qui le couvrait
        // déjà.
        const fenetreOuverte =
          etat.clubOuvert ||
          etat.contactOuvert ||
          etat.contactNouveau ||
          etat.commandeNouvelle ||
          etat.momentOuvert ||
          etat.ideeOuverte ||
          etat.detailCal ||
          etat.jourOuvertCal ||
          etat.choixPrepa ||
          etat.captureOuverte;

        if (!fenetreOuverte) section.insertAdjacentHTML('beforeend', boutonPlusFlottant());
        // La tuile n'est plus écrite par les vues du calendrier : elle suit le
        // « + », donc toutes les vues. Une seule ligne à tenir à jour.
        if (etat.creationCal) {
          section.insertAdjacentHTML(
            'beforeend',
            fenetreCreation({
              ...etat.creationCal,
              naturesEnPlus: NATURE_MOMENT,
              natureEnDernier: reglagesDuPlus(etat.vue).natureEnDernier ?? false,
              // Chez Yuno tout est photo : un événement porte toujours sa
              // pastille de type de moment.
              typeMoment: true,
              // Et sa pastille de clubs : c'est ce lien qui fait compter un
              // match au bilan d'un club, et il doit pouvoir se poser à la
              // main — sur une sortie passée qu'on inscrit après coup, en
              // particulier (demande de Noé, 15 août au soir).
              clubs: nomsDesClubs(etat.pistes),
              // Et une publication porte son pilier et ses notes : depuis que
              // « Noter une idée » a disparu de Créer, la tuile est le seul
              // endroit où une idée s'écrit.
              piliers: Object.fromEntries(
                Object.entries(PILIERS).map(([rang, { nom }]) => [rang, `${rang}. ${nom}`]),
              ),
              notes: true,
            }),
          );
        }
        // La fiche d'un contact suit les pages qui en montrent : la Passerelle
        // l'ouvre depuis une pastille de sa bande. Le carnet, lui, la pose
        // déjà dans sa propre vue — l'ajouter ici la doublerait.
        if (etat.contactOuvert && etat.vue !== 'carnet') {
          section.insertAdjacentHTML('beforeend', fenetreContact(etat));
        }
        if (etat.clubOuvert) {
          section.insertAdjacentHTML('beforeend', fenetreClub(etat));
        }
        if (etat.contactNouveau) {
          // `true` = le « + » des pages du réseau ; un objet = la fiche naît
          // d'une rencontre, et porte ce qu'on sait déjà d'elle.
          section.insertAdjacentHTML(
            'beforeend',
            formulaireNouveauContact(
              typeof etat.contactNouveau === 'object' ? etat.contactNouveau : null,
              etat.pistes,
            ),
          );
        }
        if (etat.choixPrepa) {
          section.insertAdjacentHTML('beforeend', fenetreChoixModele(etat));
        }
        if (etat.commandeNouvelle) {
          section.insertAdjacentHTML('beforeend', fenetreCommande(etat));
        }
        if (etat.captureOuverte) {
          section.insertAdjacentHTML(
            'beforeend',
            formulaireMoment(etat.contacts, etat.prefillMoment, etat.pistes),
          );
        }
      }

      centrerActif(section.querySelector('.yuno-nav'));
      centrerActif(section.querySelector('.filtres'));
      poserLEntreeClavier?.();
      // La tuile vient d'être réécrite : ses pastilles reprennent le libellé de
      // leurs champs, et le curseur va au titre.
      if (etat.creationCal) rafraichirLaCapture?.();

      // Le fondu attend le contenu : l'animer sur le squelette puis le refuser
      // au vrai contenu ferait entrer une page vide et apparaître l'autre d'un
      // coup — exactement l'inverse de ce qu'on cherche.
      if (pret && etat.vue !== vueDessinee) {
        vueDessinee = etat.vue;
        animerLEntreeDeLaVue(section);
      }
      reveletLesPhotos(section);
      animerLesCompteurs(section);
      marquerLesDebordements();
    };

    // De quel côté une bande de contacts a-t-elle encore de la réserve ? La
    // feuille de style pose un fondu du bon côté, et seulement là où il reste à
    // voir — une pastille tranchée net sans rien après ressemblerait à un
    // défaut de mise en page. Même mécanique que la tuile de capture, mais sur
    // plusieurs bandes : une par carte de la fournée.
    const marquerLesDebordements = () => {
      for (const bande of section.querySelectorAll('.fournee-bande-liste')) {
        bande.classList.toggle('deborde-avant', bande.scrollLeft > 1);
        bande.classList.toggle(
          'deborde-apres',
          bande.scrollLeft + bande.clientWidth < bande.scrollWidth - 1,
        );
      }
    };

    // Ne redessine que la liste des contacts : réécrire la vue entière ferait
    // perdre le curseur du champ de recherche à chaque lettre.
    const rendreContacts = () => {
      const cible = section.querySelector('[data-bloc="contacts"]');
      if (!cible) return;

      // Les pages du Réseau partagent le bloc vif, pas le dessin : la
      // Passerelle lit le vivier, le vivier le filtre, les modèles se lisent
      // seuls, et le carnet lit la base de contacts.
      cible.innerHTML =
        etat.vue === 'passerelle' || etat.vue === 'reseau'
          ? construirePasserelle(etat)
          : etat.vue === 'vivier'
            ? construireVivier(etat.pistes, etat.divisionVivier, etat.contacts)
            : etat.vue === 'messages'
              ? construireModeles(etat.modeles)
              : construireContacts(etat.contacts, optionsBase(etat));
      marquerLesDebordements();
    };

    // La liste des résultats, SEULE : le champ garde son curseur à la frappe.
    const remplirLaRecherche = () => {
      const cible = section.querySelector('[data-bloc="resultats-clubs"]');
      if (cible) {
        cible.innerHTML = construireResultatsClubs(
          etat.pistes,
          etat.contacts,
          etat.rechercheClub ?? '',
        );
      }
    };

    const rendreCommandes = () => {
      const cible = section.querySelector('[data-bloc="commandes"]');
      if (cible) {
        cible.innerHTML = construireCommandes(etat.commandes, etat.preparations, etat.evenements);
      }
    };

    const rendreWeekend = () => {
      const cible = section.querySelector('[data-bloc="calendrier"]');
      if (cible && etat.vueCal === 'weekend') cible.innerHTML = construireWeekend(etat);
    };

    // Les rencontres du week-end regardé. Chargées à la demande — l'ouverture
    // du pli, un coup de flèche — et jamais avec le calendrier : on ne paie pas
    // une lecture pour un bloc qu'on n'a pas ouvert.
    const chargerLeWeekend = async () => {
      const vendredi = versDateISO(etat.ancreWeekend);
      const dimanche = versDateISO(ajouterJours(etat.ancreWeekend, 2));
      try {
        etat.matchsWeekend = await api.matchsEntre(vendredi, dimanche);
      } catch (souci) {
        console.error('Lecture des matchs du week-end impossible', souci);
        etat.matchsWeekend = [];
      }
      rendreWeekend();
    };

    // « Rattaché à » relie la fiche au vivier (demande de Noé, 15 août 2026) :
    // écrire le nom d'un club y attache la personne, et la Passerelle la
    // retrouve sur la carte de ce club. Écrire autre chose détache.
    //
    // Une piste ne garde qu'UNE fiche — la carte n'en montre qu'une —, donc on
    // ne prend pas la place d'une autre : le premier rattaché reste le contact
    // de référence du club, et le second garde simplement sa structure écrite.
    // Le lien se déplace en revanche quand la personne change de club.
    const relierAuVivier = async (contact) => {
      const cible = pisteDeLaStructure(contact.structure, etat.pistes);
      const ancienne = etat.pistes.find((piste) => piste.contact_id === contact.id);
      if (cible === ancienne) return;

      const aEcrire = [];
      if (ancienne) aEcrire.push([ancienne, null]);
      if (cible && !cible.contact_id) aEcrire.push([cible, contact.id]);
      if (!aEcrire.length) return;

      try {
        await Promise.all(
          aEcrire.map(([piste, valeur]) => api.modifierPiste(piste.id, { contact_id: valeur })),
        );
        for (const [piste, valeur] of aEcrire) piste.contact_id = valeur;
      } catch (souci) {
        console.error('Lien au vivier impossible', souci);
        dire('La fiche est enregistrée, mais le lien au club n’a pas pu se faire.');
      }
    };

    // Un envoi de plus pour une fiche : la ligne au journal, et la fiche qui
    // avance. Partagé entre le carnet (« Envoyé ✓ » d'une fiche) et la
    // Passerelle (« Envoyé ✓ » d'une piste qui a sa fiche).
    //
    // Le statut suivant se calcule AVANT : `modifierAussitot` a déjà changé la
    // fiche quand la requête part, et relire `contact.statut` là-dedans ferait
    // avancer d'un cran de trop (« message envoyé » deviendrait « relance »
    // sans qu'on ait relancé).
    const enregistrerLEnvoi = async (contact) => {
      const date = versDateISO();
      const suivant = statutApresEnvoi(contact.statut);

      // L'envoi provisoire est retiré si l'écriture échoue — sans quoi le
      // compteur, qui ne peut que monter, garderait un envoi qui n'a pas eu
      // lieu.
      const envoiProvisoire = { id: identifiantProvisoire(), contact_id: contact.id, date };
      etat.envois = [envoiProvisoire, ...etat.envois];

      const misAJour = await modifierAussitot(
        contact,
        { statut: suivant, date_dernier_envoi: date },
        async () =>
          (await api.enregistrerEnvoi({ contact: { id: contact.id }, statut: suivant })).contact,
        { rendre: rendreContacts, echouer: dire },
      );

      if (!misAJour) {
        etat.envois = etat.envois.filter((envoi) => envoi.id !== envoiProvisoire.id);
        rendreContacts();
      }
      return misAJour;
    };

    // Le routeur rappelle `naviguer` à chaque changement de hash dans l'espace.
    // Tout ce que le calendrier peut montrer se recharge d'un coup : la grille
    // se promène dans le passé, et une suppression peut toucher n'importe quoi.
    const rechargerCalendrier = async () => {
      const [evenements, taches, objectifs, publications, contacts, commandes] = await Promise.all([
        api.evenementsTous({ projet: 'photo' }),
        api.tachesDatees({ projet: 'photo' }),
        api.objectifsActifs({ projet: 'photo' }),
        api.publicationsToutes('photo'),
        api.contactsTous(),
        api.commandesToutes(),
      ]);
      Object.assign(etat, { evenements, taches, objectifs, publications, contacts, commandes });
      // Ces six-là viennent d'être relues : elles sont fraîches, et affichables
      // même si la vue courante ne les avait pas demandées.
      for (const cle of ['evenements', 'taches', 'objectifs', 'publications', 'contacts', 'commandes']) {
        fraiches.add(cle);
        affichables.add(cle);
      }
    };

    // Où écrire, par nature. Le formulaire de modification et le glissement
    // passent tous deux par ici — seuls les champs changent.
    // Chaque nature se supprime là où elle vit. Une relance n'est pas une ligne
    // à effacer : c'est une date qu'on retire d'une fiche du carnet.
    async function effacerDuCalendrier(type, id) {
      if (type === 'evenement') return api.supprimerEvenement(id);
      if (type === 'tache') return api.supprimerTache(id);
      if (type === 'publication') return api.supprimerPublication(id);
      if (type === 'objectif') return api.supprimerObjectif(id);
      if (type === 'jalon') return api.supprimerJalon(id);
      if (type === 'commande') return api.supprimerCommande(id);
      if (type === 'relance') return api.modifierContact(id, { prochaine_action_date: null });
      throw new Error(`Nature inconnue : ${type}`);
    }

    // Créer une feuille et l'ouvrir. Pas d'écriture optimiste ici : la page de
    // la feuille a besoin du vrai identifiant pour être son adresse.
    const creerFeuille = async (cible, modele, bouton) => {
      bouton.disabled = true;
      try {
        const feuille = await api.creerPreparation({ modele, ...cible });
        etat.preparations.unshift(feuille);
        fraiches.add('preparations');
        affichables.add('preparations');
        etat.detailCal = null;
        location.hash = `#yuno/preparations/${feuille.id}`;
      } catch (souci) {
        console.error('Création de la préparation impossible', souci);
        bouton.disabled = false;
        // `dire` redessine : le bouton est recréé actif, la ligne dit l'échec.
        dire("La préparation n'a pas pu être créée.");
      }
    };

    // Dessiner, puis charger ce qui manque, puis redessiner. Le premier rendu
    // ne coûte rien : il sort du cache, ou c'est le squelette.
    this.naviguer = async (nouvelleRoute) => {
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      etat.feuilleOuverte = nouvelleRoute?.id ?? null;
      // Le mot de clôture ne vaut que pour l'instant où l'on vient de poster :
      // changer de page l'efface, il n'a pas à traîner. La capture pré-remplie
      // non plus — on la reprend depuis l'invite si besoin.
      etat.cloture = false;
      etat.prefillMoment = null;
      // La fenêtre de commande et son client pré-rempli n'ont de sens que
      // chez les Missions : ailleurs, on les referme.
      if (etat.vue !== 'missions' && etat.vue !== 'commandes') {
        etat.commandeNouvelle = false;
        etat.prefillCommande = null;
      }
      rendre();
      if (await charger(BESOINS[etat.vue])) rendre();
      if (await leverLesRelances()) rendre();
    };

    // Revenir sur le site le relit. Ici « relire » veut dire OUBLIER ce qui a
    // été chargé : `fraiches` est ce qui empêche de redemander deux fois la
    // même table pendant une visite, et c'est justement lui qu'il faut vider.
    // Les données restent affichables entre-temps — `affichables` n'est pas
    // touché — donc rien ne clignote, l'écran se met à jour quand ça revient.
    this.rafraichir = async () => {
      fraiches.clear();
      if (await charger(BESOINS[etat.vue])) rendre();
      if (await leverLesRelances()) rendre();
    };

    // Le lundi venu, les messages restés sans suite deviennent des relances
    // dues. Le site est statique : la bascule se fait ici, à l'ouverture de la
    // Passerelle, en une écriture groupée et silencieuse — c'est un rappel qui
    // se lève, pas un geste de Noé, et il n'a pas à s'annoncer.
    //
    // L'écriture précède l'affichage, au rebours du reste du site : rien ne
    // presse ici, et montrer « à relancer » avant que la base l'ait accepté
    // serait afficher un état que personne n'a demandé.
    const leverLesRelances = async () => {
      // « reseau » EST la Passerelle depuis le 21 août 2026 : la bascule du
      // lundi doit se lever aussi quand on arrive par l'onglet.
      if (etat.vue !== 'passerelle' && etat.vue !== 'reseau' && etat.vue !== 'vivier') {
        return false;
      }
      const aBasculer = fichesABasculer(etat.contacts);
      if (!aBasculer.length) return false;

      try {
        await Promise.all(
          aBasculer.map((contact) => api.modifierContact(contact.id, { statut: 'a_relancer' })),
        );
        for (const contact of aBasculer) contact.statut = 'a_relancer';
        return true;
      } catch (souci) {
        console.error('Bascule des relances impossible', souci);
        return false;
      }
    };

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
      } catch (souci) {
        console.error('Action impossible', souci);
        erreur.textContent = souci.message ?? "L'action a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    async function appliquer(action, champs) {
      if (action === 'modifier-contact') {
        const modifie = await api.modifierContact(champs.id, {
          nom: champs.nom.trim(),
          type: champs.type,
          structure: champs.structure?.trim() || null,
          statut: champs.statut,
          instagram: champs.instagram?.trim() || null,
          email: champs.email?.trim() || null,
          telephone: champs.telephone?.trim() || null,
          notes: champs.notes?.trim() || null,
        });

        etat.contacts = etat.contacts.map((candidat) =>
          candidat.id === champs.id ? { ...candidat, ...modifie } : candidat,
        );
        await relierAuVivier(etat.contacts.find((c) => c.id === champs.id));
        // On revient à la fiche : la correction se voit avant de refermer.
        etat.editionContact = false;
        rendre();
        return;
      }

      if (action === 'modifier-moment') {
        const ancien = etat.evenements.find((candidat) => candidat.id === champs.id);
        const fichier = champs.photo;
        // La nouvelle photo part AVANT l'écriture : si l'envoi échoue, rien
        // n'est modifié et le formulaire reste ouvert, rempli.
        const nouveauChemin =
          fichier instanceof File && fichier.size
            ? await api.televerserPhotoMoment(fichier)
            : null;

        // L'HEURE DE LA SORTIE EST CONSERVÉE. Le carnet ne demande qu'un jour ;
        // recomposer `date_debut` à minuit effacerait le coup d'envoi de 19 h.
        const ancienDebut = new Date(ancien.date_debut);
        const heure = ancienDebut.getHours() || ancienDebut.getMinutes()
          ? `${String(ancienDebut.getHours()).padStart(2, '0')}:${String(
              ancienDebut.getMinutes(),
            ).padStart(2, '0')}`
          : '00:00';

        const modifs = {
          date_debut: new Date(`${champs.date}T${heure}`).toISOString(),
          type_moment: champs.type_moment,
          titre: champs.titre.trim(),
          lieu: champs.lieu?.trim() || null,
          note: champs.note?.trim() || null,
          oeuvre_finie: champs.oeuvre_finie === 'oui',
          // Les deux clubs de l'affiche, par leur nom : c'est ce lien qui fait
          // compter la sortie au bilan d'un club.
          club_recevant: pisteDeLaStructure(champs.club_recevant, etat.pistes)?.id ?? null,
          club_visiteur: pisteDeLaStructure(champs.club_visiteur, etat.pistes)?.id ?? null,
          ...(nouveauChemin ? { photo_chemin: nouveauChemin } : {}),
        };

        const modifie = await api.modifierSortie(
          champs.id,
          modifs,
          titreDuMoment(modifs),
          champs.date,
        );

        // Les rencontres ne sont pas renvoyées par la mise à jour : on garde
        // celles qu'on avait, sans quoi la ligne « Rencontré » disparaîtrait.
        etat.evenements = etat.evenements.map((candidat) =>
          candidat.id === champs.id
            ? { ...candidat, ...modifie, rencontres: candidat.rencontres }
            : candidat,
        );
        if (nouveauChemin) {
          Object.assign(etat.photos, await api.urlsDesPhotos([nouveauChemin]));
          // L'ancienne n'est plus référencée nulle part : elle part du stockage.
          // Après l'écriture, jamais avant — une suppression ne se rattrape pas.
          if (ancien?.photo_chemin) await api.supprimerPhotoMoment(ancien.photo_chemin);
        }

        // On revient à la fiche, dans la même fenêtre : la correction se voit.
        etat.editionMoment = false;
        rendre();
        return;
      }

      if (action === 'ajouter-moment') {
        // La photo part avant la sortie : si le téléversement échoue, rien
        // n'est écrit et le formulaire reste rempli.
        const fichier = champs.photo;
        const chemin =
          fichier instanceof File && fichier.size ? await api.televerserPhotoMoment(fichier) : null;

        const vecu = {
          photo_chemin: chemin,
          note: champs.note?.trim() || null,
          oeuvre_finie: champs.oeuvre_finie === 'oui',
          // Les deux clubs, dans les deux chemins : c'est ici qu'une sortie
          // devient le match couvert d'un club, qu'elle entre au carnet ou
          // qu'elle y gagne seulement sa face vécue.
          club_recevant: pisteDeLaStructure(champs.club_recevant, etat.pistes)?.id ?? null,
          club_visiteur: pisteDeLaStructure(champs.club_visiteur, etat.pistes)?.id ?? null,
        };
        const rencontres = relierRencontres(champs.rencontres, etat.contacts);

        // Deux chemins depuis la fusion : la sortie était déjà au calendrier
        // (l'invite) — elle gagne sa face vécue —, ou elle n'y était pas — elle
        // y entre, déjà vécue.
        let logue;
        if (champs.evenement_id) {
          const deja = etat.evenements.find((e) => e.id === champs.evenement_id);
          ({ evenement: logue } = await api.marquerSortieVecue(champs.evenement_id, vecu, {
            rencontres,
            titre: titreDuMoment(deja ?? {}),
          }));
        } else {
          const nouvelle = {
            titre: champs.titre.trim(),
            // Sans heure : minuit local, la convention du hub pour « pas
            // d'heure » — la sortie est déjà passée, son horaire n'importe plus.
            date_debut: new Date(`${champs.date || versDateISO()}T00:00`).toISOString(),
            lieu: champs.lieu?.trim() || null,
            type_moment: champs.type_moment,
            ...vecu,
          };
          ({ evenement: logue } = await api.creerSortieVecue({
            evenement: nouvelle,
            rencontres,
            titre: titreDuMoment(nouvelle),
          }));
        }

        if (chemin) Object.assign(etat.photos, await api.urlsDesPhotos([chemin]));

        etat.evenements = [
          logue,
          ...etat.evenements.filter((candidat) => candidat.id !== logue.id),
        ];
        etat.prefillMoment = null;
        etat.captureOuverte = false;
        rendre();
        // C'est fait : la capture se referme, le moment est au carnet. Le site
        // réussit quand on le quitte, pas quand il retient.
        const capture = section.querySelector('[data-ajout="moment"]');
        if (capture) capture.open = false;
        return;
      }

      // Corriger sur place ce qui a une date. `debut` est le nom du champ à
      // l'écran ; chaque nature range sa date dans sa propre colonne.
      if (action === 'modifier-depuis-calendrier') {
        const { type, id } = champs;
        const titre = champs.titre.trim();

        if (type === 'evenement') {
          const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
          const fin = finDeLEvenement(debut, champs);
          await api.modifierEvenement(id, {
            titre,
            date_debut: debut.toISOString(),
            date_fin: fin ? fin.toISOString() : null,
            recurrence: champs.recurrence || null,
            recurrence_fin: champs.recurrence_fin || null,
            lieu: champs.lieu?.trim() || null,
            notes: champs.notes?.trim() || null,
            ...(champs.type_moment !== undefined
              ? { type_moment: champs.type_moment || null }
              : {}),
            // Les deux clubs de l'affiche, par leur nom. C'est ce lien — et lui
            // seul — qui fait compter un match dans le bilan d'un club : un
            // titre n'est pas une preuve, deux clubs peuvent porter le même mot
            // et une affiche se réécrit.
            //
            // Comme `type_moment` : on n'écrit ces colonnes que si le
            // formulaire les portait. Un formulaire sans ces champs ne doit pas
            // délier un match au passage.
            ...(champs.club_recevant !== undefined
              ? {
                  club_recevant:
                    pisteDeLaStructure(champs.club_recevant, etat.pistes)?.id ?? null,
                }
              : {}),
            ...(champs.club_visiteur !== undefined
              ? {
                  club_visiteur:
                    pisteDeLaStructure(champs.club_visiteur, etat.pistes)?.id ?? null,
                }
              : {}),
          });
        } else if (type === 'publication') {
          await api.modifierPublication(id, {
            titre,
            date_prevue: champs.debut,
            reseau: champs.reseau,
            format: champs.format,
          });
        } else if (type === 'objectif') {
          await api.modifierObjectif(id, {
            titre,
            echeance: champs.debut,
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
          });
        } else if (type === 'commande') {
          await api.modifierCommande(id, {
            titre,
            echeance: champs.debut,
            client: champs.client?.trim() || null,
          });
        } else if (type === 'relance') {
          await api.modifierContact(id, {
            prochaine_action: titre,
            prochaine_action_date: champs.debut,
          });
        } else if (type === 'jalon') {
          await api.modifierJalon(id, { titre, echeance: champs.debut });
        } else {
          await api.modifierTache(id, { titre, echeance: champs.debut });
        }

        etat.detailCal = null;
        etat.editionCal = false;
        await rechargerCalendrier();
        rendre();
        return;
      }

      if (action === 'creer-depuis-calendrier') {
        const titre = champs.titre.trim();

        if (champs.nature === 'tache') {
          // Active d'emblée, comme partout depuis le 13 août : le réglage
          // backlog / active est masqué, une tâche notée est une tâche à faire.
          etat.taches.push(
            await api.creerTache({
              projet: 'photo',
              titre,
              statut: 'actif',
              echeance: champs.debut,
              heure: champs.heure || null,
              priorite: Number(champs.priorite) || 4,
            }),
          );
        } else if (champs.nature === 'publication') {
          etat.publications.unshift(
            await api.creerPublication({
              projet: 'photo',
              titre,
              reseau: champs.reseau,
              format: champs.format,
              // Sans date, c'est une idée : elle rejoint la banque. Une heure
              // sans date ne veut rien dire, elle part avec.
              date_prevue: champs.debut || null,
              heure: (champs.debut && champs.heure) || null,
              // Depuis que « Noter une idée » a disparu, la tuile est le seul
              // endroit où l'on écrit une idée : elle porte le pilier et les
              // notes, et ils doivent donc arriver jusqu'ici.
              pilier: champs.pilier ? Number(champs.pilier) : null,
              notes: champs.notes?.trim() || null,
            }),
          );
        } else if (champs.nature === 'objectif') {
          const objectif = await api.creerObjectif({
            projet: 'photo',
            titre,
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
            echeance: champs.debut,
          });
          etat.objectifs.push({ ...objectif, jalons: objectif.jalons ?? [] });
        } else {
          // Sans heure, l'événement tient le jour entier : minuit local, et
          // `momentLisible` s'abstient alors d'afficher 00:00.
          const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
          const fin = finDeLEvenement(debut, champs);

          etat.evenements.push(
            await api.creerEvenement({
              projet: 'photo',
              titre,
              date_debut: debut.toISOString(),
              date_fin: fin ? fin.toISOString() : null,
              recurrence: champs.recurrence || null,
              recurrence_fin: champs.recurrence_fin || null,
              lieu: champs.lieu?.trim() || etat.creationCal?.clubs?.lieu || null,
              notes: champs.notes?.trim() || null,
              type_moment: champs.type_moment || null,
              // Les deux clubs de l'affiche, par leur nom — la pastille
              // « Clubs » de la tuile, pré-remplie quand le geste vient du
              // vivier. C'est ce lien qui fait compter un match au bilan d'un
              // club ; le titre, lui, reste ce que Noé a laissé dans le champ.
              club_recevant: pisteDeLaStructure(champs.club_recevant, etat.pistes)?.id ?? null,
              club_visiteur: pisteDeLaStructure(champs.club_visiteur, etat.pistes)?.id ?? null,
            }),
          );
        }

        // Ce qu'on vient d'écrire prend sa place dans l'état, au lieu de
        // relancer les six lectures du calendrier : on connaît déjà la réponse.
        // Les listes sont modifiées SUR PLACE, comme partout depuis
        // `js/ecriture.js`.
        etat.creationCal = null;
        rendre();
        return;
      }

      if (action === 'noter-idee') {
        const publication = await api.creerPublication({
          projet: 'photo',
          titre: champs.titre.trim(),
          reseau: champs.reseau,
          format: champs.format,
          rubrique: champs.rubrique?.trim() || null,
          notes: champs.notes?.trim() || null,
          date_prevue: champs.date_prevue || null,
          // Une heure sans date ne veut rien dire : une idée n'a pas d'horaire.
          heure: (champs.date_prevue && champs.heure) || null,
          pilier: champs.pilier ? Number(champs.pilier) : null,
          preuve: champs.preuve?.trim() || null,
          pourquoi_moi: champs.pourquoi_moi?.trim() || null,
        });
        etat.publications = [publication, ...etat.publications];
        // L'idée est notée : la fenêtre se referme. On note et on repart.
        rendre();
        return;
      }

      if (action === 'creer-contact') {
        // Ouverte par le « + », la fenêtre se referme une fois la fiche posée :
        // on n'enchaîne pas des fiches comme on enchaîne des notes. Il faut
        // alors redessiner la VUE, et pas seulement la liste des contacts —
        // sans quoi la fenêtre resterait affichée par-dessus.
        const venaitDuPlus = Boolean(etat.contactNouveau);
        const depuisRencontre =
          typeof etat.contactNouveau === 'object' ? etat.contactNouveau : null;

        const contact = await api.creerContact({
          nom: champs.nom.trim(),
          type: champs.type,
          structure: champs.structure?.trim() || null,
          instagram: champs.instagram?.trim() || null,
          email: champs.email?.trim() || null,
          telephone: champs.telephone?.trim() || null,
          statut: champs.statut,
          objectif: champs.objectif?.trim() || null,
          notes: champs.notes?.trim() || null,
          dernier_echange: depuisRencontre?.dernier_echange ?? null,
        });

        // La piste pointe désormais sa fiche : la carte de la fournée montre
        // la personne, et son « Envoyé ✓ » fera avancer la relation. Si cette
        // seconde écriture échoue, la fiche existe quand même — le dire suffit.
        //
        // Deux chemins mènent ici : la Passerelle, qui désigne sa piste dans un
        // champ caché, et le carnet, où c'est « rattaché à » qui la nomme.
        if (champs.piste_id) {
          const piste = etat.pistes.find((p) => p.id === champs.piste_id);
          if (piste) {
            try {
              await api.modifierPiste(piste.id, { contact_id: contact.id });
              piste.contact_id = contact.id;
            } catch (souci) {
              console.error('Lien de la piste impossible', souci);
              dire('La fiche est créée, mais la piste n’a pas pu être reliée.');
            }
          }
        } else {
          await relierAuVivier(contact);
        }

        // La rencontre pointe désormais sa fiche : le « + » disparaît, le nom
        // devient une étiquette reliée.
        if (champs.rencontre_id) {
          await api.relierRencontreAuContact(champs.rencontre_id, contact.id);
          for (const sortie of etat.evenements) {
            const rencontre = sortie.rencontres?.find(
              (candidat) => candidat.id === champs.rencontre_id,
            );
            if (rencontre) {
              rencontre.contact_id = contact.id;
              break;
            }
          }
        }

        etat.contacts.push(contact);
        etat.contacts.sort((a, b) => a.nom.localeCompare(b.nom));
        // La fenêtre ne se ferme qu'une fois la fiche écrite : si le serveur
        // refuse, l'erreur s'affiche dedans et la saisie reste — c'est
        // l'exception des formulaires à l'écriture optimiste, et elle compte
        // d'autant plus ici qu'on vient de remplir huit champs.
        etat.contactNouveau = false;
        if (venaitDuPlus) rendre();
        else rendreContacts();
        return;
      }

      if (action === 'creer-commande') {
        const nomClient = champs.client?.trim() || null;
        const connu = nomClient
          ? etat.contacts.find((contact) => contact.nom.toLowerCase() === nomClient.toLowerCase())
          : null;
        // L'événement visé se relie par son titre exact — même règle que
        // « Rattaché à » pour les clubs : le nom exact relie, autre chose
        // laisse la commande libre.
        const nomEvenement = champs.evenement?.trim() || null;
        const evenementLie = nomEvenement
          ? etat.evenements.find(
              (candidat) => candidat.titre.trim().toLowerCase() === nomEvenement.toLowerCase(),
            )
          : null;

        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: connu?.nom ?? nomClient,
          client_id: connu?.id ?? null,
          evenement_id: evenementLie?.id ?? null,
          statut: champs.statut,
          echeance: champs.echeance || null,
          montant: champs.montant ? Number(champs.montant) : null,
          lien_livrable: champs.lien_livrable?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.commandes = [commande, ...etat.commandes];
        // La fenêtre volante se referme sur le geste accompli, et le tableau
        // de bord entier se redessine — « À préparer » peut avoir changé.
        etat.commandeNouvelle = false;
        etat.prefillCommande = null;
        rendre();
        return;
      }

      if (action === 'creer-modele') {
        const modele = await api.creerModele({
          titre: champs.titre.trim(),
          corps: champs.corps.trim(),
          ordre: etat.modeles.length + 1,
        });
        etat.modeles = [...etat.modeles, modele];
        rendreContacts();
        return;
      }

      // Un item ajouté sur le moment — au stade, debout. Il n'entre que dans
      // cette feuille : le modèle s'édite à part, pas d'un geste de terrain.
      if (action === 'ajouter-item-prepa') {
        const feuille = etat.preparations.find((f) => f.id === champs.preparation_id);
        const texte = champs.texte.trim();
        if (!feuille || !texte) return;

        const freres = feuille.items.filter((item) => item.phase === champs.phase);
        const item = await api.ajouterItemPreparation({
          preparation_id: feuille.id,
          phase: champs.phase,
          texte,
          ordre: Math.max(0, ...freres.map((frere) => frere.ordre ?? 0)) + 1,
        });
        feuille.items.push(item);

        // « Aussi au modèle » : la boucle d'apprentissage. Si cette seconde
        // écriture échoue, l'item de la feuille reste — le dire suffit.
        if (champs.au_modele === 'oui') {
          const modele = etat.modelesPrepa.find((m) => m.id === feuille.modele_id);
          if (modele) {
            try {
              const freresModele = modele.items.filter((i) => i.phase === champs.phase);
              const itemModele = await api.ajouterItemModele({
                modele_id: modele.id,
                phase: champs.phase,
                texte,
                ordre: Math.max(0, ...freresModele.map((f) => f.ordre ?? 0)) + 1,
              });
              modele.items.push(itemModele);
            } catch (souci) {
              console.error('Ajout au modèle impossible', souci);
              dire('Ajouté à la feuille, mais pas au modèle.');
            }
          }
        }

        rendre();
        // On en ajoute rarement un seul : le champ de la même phase reprend la
        // main, vide (le redessin l'a réécrit).
        section
          .querySelector(`form[data-phase="${champs.phase}"] input[name="texte"]`)
          ?.focus();
        return;
      }

      if (action === 'creer-modele-prepa') {
        const nom = champs.nom.trim();
        if (!nom) return;
        const modele = await api.creerModelePreparation({ nom });
        etat.modelesPrepa.push(modele);
        // On va le remplir : l'éditeur s'ouvre, c'est lui la suite du geste.
        location.hash = `#yuno/modeles/${modele.id}`;
        return;
      }

      if (action === 'ajouter-item-modele') {
        const modele = etat.modelesPrepa.find((m) => m.id === champs.modele_id);
        const texte = champs.texte.trim();
        if (!modele || !texte) return;

        const freres = modele.items.filter((item) => item.phase === champs.phase);
        const item = await api.ajouterItemModele({
          modele_id: modele.id,
          phase: champs.phase,
          texte,
          ordre: Math.max(0, ...freres.map((frere) => frere.ordre ?? 0)) + 1,
        });
        modele.items.push(item);
        rendre();
        section
          .querySelector(`form[data-phase="${champs.phase}"] input[name="texte"]`)
          ?.focus();
        return;
      }

      if (action === 'noter-bilan') {
        const feuille = etat.preparations.find((f) => f.id === champs.id);
        if (!feuille) return;

        // Le moment ne s'inscrit que si la case l'a dit ET qu'il n'existe pas
        // déjà : le compteur « moments vécus » ne doit dire que du vrai, et un
        // renvoi du formulaire après un échec ne crée jamais de doublon.
        const inscrire = champs.carnet === 'oui' && !momentDeLaFeuille(etat.evenements, feuille);

        // La photo part en premier, comme au carnet : si l'envoi échoue, rien
        // n'est écrit et le formulaire reste rempli.
        const fichier = champs.photo;
        const chemin =
          inscrire && fichier instanceof File && fichier.size
            ? await api.televerserPhotoMoment(fichier)
            : null;

        const misAJour = await api.noterBilan(feuille.id, {
          bilan_bien: champs.bilan_bien?.trim() || null,
          bilan_mieux: champs.bilan_mieux?.trim() || null,
        });
        // `misAJour` ne porte pas les items : Object.assign les laisse en place.
        Object.assign(feuille, misAJour);

        if (inscrire) {
          const rencontres = relierRencontres(champs.rencontres, etat.contacts);
          const vecu = { photo_chemin: chemin, note: null, oeuvre_finie: false };
          const existant = etat.evenements.find((e) => e.id === feuille.evenement_id);

          // La feuille d'un ÉVÉNEMENT marque sa sortie vécue — la même ligne,
          // rien de nouveau. Celle d'une commande (ou sans sortie) en crée une :
          // il n'y a rien au calendrier à marquer.
          let logue;
          if (existant) {
            ({ evenement: logue } = await api.marquerSortieVecue(existant.id, vecu, {
              rencontres,
              titre: titreDuMoment(existant),
            }));
          } else {
            const nouvelle = {
              titre: feuille.titre,
              date_debut: new Date(`${feuille.date ?? versDateISO()}T00:00`).toISOString(),
              // Une commande livrée n'est ni un match ni un concert.
              type_moment: feuille.commande_id ? 'autre' : 'match',
              ...vecu,
            };
            ({ evenement: logue } = await api.creerSortieVecue({
              evenement: nouvelle,
              rencontres,
              titre: titreDuMoment(nouvelle),
            }));
          }

          if (chemin) Object.assign(etat.photos, await api.urlsDesPhotos([chemin]));
          etat.evenements = [
            logue,
            ...etat.evenements.filter((candidat) => candidat.id !== logue.id),
          ];
        }

        rendre();
        return;
      }

      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          projet: 'photo',
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
        const misAJour = await api.modifierObjectif(champs.objectif_id, {
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        Object.assign(objectif, misAJour);
        rendre();
        ouvrirObjectif(objectif.id);
      }
    }

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      if (evenement.target.closest('[data-action="reessayer"]')) {
        echecChargement = false;
        rendre();
        if (await charger(BESOINS[etat.vue])) rendre();
        return;
      }

      // Le « + » flottant : ce qu'il ouvre dépend de la page (PLUS_PAR_VUE).
      if (evenement.target.closest('[data-ouvrir-plus]')) {
        const reglages = reglagesDuPlus(etat.vue);
        etat.detailCal = null;

        if (reglages.contact) {
          etat.contactNouveau = true;
          rendre();
          section.querySelector('#contact-nouveau-nom')?.focus();
          return;
        }

        if (reglages.commande) {
          etat.commandeNouvelle = true;
          rendre();
          section.querySelector('#commande-titre')?.focus();
          return;
        }

        // Au Journal, le « + » ouvre la sortie elle-même : on vient y raconter
        // ce qu'on a vécu, pas poser une date.
        if (reglages.sortie) {
          etat.captureOuverte = true;
          rendre();
          section.querySelector('#moment-titre')?.focus();
          return;
        }

        const jour = reglages.sansDate ? '' : versDateISO();
        etat.creationCal = { debut: jour, fin: jour, nature: reglages.nature };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        etat.creationCal = null;
        etat.detailCal = null;
        etat.editionCal = false;
        etat.jourOuvertCal = null;
        etat.captureOuverte = false;
        etat.contactNouveau = false;
        etat.commandeNouvelle = false;
        etat.prefillCommande = null;
        etat.prefillMoment = null;
        etat.ideeOuverte = null;
        etat.momentOuvert = null;
        etat.editionMoment = false;
        etat.contactOuvert = null;
        etat.editionContact = false;
        etat.choixPrepa = null;
        etat.propositionsOuvertes = false;
        etat.clubOuvert = null;
        rendre();
        return;
      }

      // Ouvrir la fiche d'une idée depuis son aperçu. La tuile entière est le
      // bouton : rien d'autre n'est cliquable dedans, l'aperçu ne porte plus
      // aucun geste.
      const apercuIdee = evenement.target.closest('[data-ouvrir-pub]');
      if (apercuIdee) {
        etat.ideeOuverte = apercuIdee.dataset.ouvrirPub;
        rendre();
        section.querySelector('.fenetre-fermer')?.focus();
        return;
      }

      if (evenement.target.closest('[data-modifier-contact]')) {
        etat.editionContact = true;
        rendre();
        section.querySelector('#contact-edition-nom')?.focus();
        return;
      }

      // « Nouvelle commande » depuis une fiche : c'est le sens naturel du
      // geste — une commande naît d'une relation. La page Missions s'ouvre
      // avec la fenêtre volante, le client déjà écrit.
      const nouvelleCommande = evenement.target.closest('[data-nouvelle-commande]');
      if (nouvelleCommande) {
        etat.prefillCommande = nouvelleCommande.dataset.nouvelleCommande;
        etat.commandeNouvelle = true;
        etat.contactOuvert = null;
        etat.editionContact = false;
        location.hash = '#yuno/missions';
        return;
      }

      // Une fiche du carnet s'ouvre au clic, en tuile comme en ligne de
      // tableau. Sauf par ses commandes : un lien mène dehors, une liste de
      // statut se déroule, une croix retire. Chacun garde son geste.
      const ficheContact = evenement.target.closest('[data-ouvrir-contact]');
      if (ficheContact && !evenement.target.closest('a, button, input, select, textarea, label')) {
        etat.contactOuvert = ficheContact.dataset.ouvrirContact;
        etat.editionContact = false;
        rendre();
        section.querySelector('.fenetre-fermer')?.focus();
        return;
      }

      // Le crayon retourne la fenêtre : la fiche laisse la place au formulaire,
      // sans changer de fenêtre ni de contexte.
      if (evenement.target.closest('[data-modifier-moment]')) {
        etat.editionMoment = true;
        rendre();
        section.querySelector('#moment-edition-lieu')?.focus();
        return;
      }

      // Une fiche du carnet s'ouvre en grand au clic — sauf par ses commandes :
      // la croix retire, le « + » d'une rencontre lui ouvre une fiche. Chacun
      // garde son geste, comme dans le CRM.
      const ficheSortie = evenement.target.closest('[data-ouvrir-sortie]');
      if (ficheSortie) {
        // Ce qui porte son propre geste à l'intérieur d'une ligne — un lien, une
        // croix — le garde. Mais depuis que la ligne du carnet EST un bouton,
        // elle se trouve elle-même dans cette recherche : sans la seconde
        // condition, plus aucune fiche ne s'ouvrait.
        const interne = evenement.target.closest('a, button, input, select, textarea, label');
        if (!interne || interne === ficheSortie) {
          etat.momentOuvert = ficheSortie.dataset.ouvrirSortie;
          etat.editionMoment = false;
          rendre();
          section.querySelector('.fenetre-fermer')?.focus();
          return;
        }
      }

      // Une vignette du mur ouvre sa sortie : le lieu, la date, les
      // rencontres, la note, le bilan. La photo en grand est dedans.
      const vignette = evenement.target.closest('[data-ouvrir-moment]');
      if (vignette) {
        etat.momentOuvert = vignette.dataset.ouvrirMoment;
        etat.editionMoment = false;
        rendre();
        section.querySelector('.fenetre-fermer')?.focus();
        return;
      }

      const journeeComplete = evenement.target.closest('[data-jour-complet]');
      if (journeeComplete) {
        etat.creationCal = null;
        etat.detailCal = null;
        etat.jourOuvertCal = journeeComplete.dataset.jourComplet;
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

      // « Moment » n'est pas une nature qu'on pose : c'est une porte. La tuile
      // se ferme et la fenêtre du carnet s'ouvre, avec la date déjà choisie —
      // ce qui a été saisi dans la tuile n'est pas perdu pour autant.
      const versLeMoment = evenement.target.closest('[data-nature-creation="moment"]');
      if (versLeMoment) {
        const jour = section.querySelector('#cal-debut')?.value || etat.creationCal?.debut;
        const titre = section.querySelector('#cal-titre')?.value.trim() || '';
        etat.creationCal = null;
        // `lieu` porte ici le NOM de la sortie : la capture le pose dans son
        // champ « La sortie », qui est le titre de l'événement à naître.
        etat.prefillMoment = { date: jour, lieu: titre };
        etat.captureOuverte = true;
        rendre();
        section.querySelector('#moment-titre')?.focus();
        return;
      }

      const natureCreation = evenement.target.closest('[data-nature-creation]');
      if (natureCreation) {
        // Les dates sont éditables : on garde ce qui vient d'être saisi plutôt
        // que de revenir à ce que le glissement avait posé.
        etat.creationCal = {
          ...etat.creationCal,
          debut: section.querySelector('#cal-debut')?.value || etat.creationCal.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creationCal.fin,
          nature: natureCreation.dataset.natureCreation,
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      // Le cercle d'une tâche se coche depuis le calendrier, sans ouvrir son
      // détail : c'est le geste le plus fréquent, il ne mérite pas une fenêtre.
      // Il passe AVANT l'ouverture du détail — le cercle est dans la barre, et
      // sans cette priorité le clic ouvrirait la fenêtre par-dessus.
      const cercle = evenement.target.closest('[data-cocher-tache]');
      if (cercle) {
        evenement.stopPropagation();
        const tache = etat.taches.find((candidat) => candidat.id === cercle.dataset.cocherTache);
        if (!tache || tache.statut === 'fait') return;

        // La victoire est bien créée en base — elle remonte au dashboard du
        // hub. Elle n'est simplement plus tenue ici : le Journal ne montre que
        // des moments. `avant` part à l'API, pas la tâche déjà cochée : elle
        // relit le statut pour savoir quoi faire.
        const avant = { ...tache };
        await modifierAussitot(
          tache,
          { statut: 'fait', date_fait: new Date().toISOString() },
          async () => (await api.terminerTache(avant)).tache,
          { rendre, echouer: dire },
        );
        return;
      }

      const ouvrirDetail = evenement.target.closest('[data-element]');
      if (ouvrirDetail) {
        const [type, id] = ouvrirDetail.dataset.element.split(':');
        etat.creationCal = null;
        etat.editionCal = false;
        etat.jourOuvertCal = null;
        etat.detailCal = elementsDuCalendrier(etat).find(
          (element) => element.type === type && String(element.id) === id,
        );
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
          await rechargerCalendrier();
          rendre();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerElement.disabled = false;
        }
        return;
      }

      const filtreNature = evenement.target.closest('[data-filtre-nature]');
      if (filtreNature) {
        const cle = filtreNature.dataset.filtreNature;
        const suite = new Set(etat.natures);
        if (suite.has(cle)) suite.delete(cle);
        else suite.add(cle);
        etat.natures = suite;
        rendre();
        return;
      }

      const vueCal = evenement.target.closest('[data-vue-cal]');
      if (vueCal) {
        etat.vueCal = vueCal.dataset.vueCal;
        rendre();
        // Les rencontres du week-end ne se lisent qu'en arrivant sur leur vue :
        // les trois autres n'en ont pas besoin.
        if (etat.vueCal === 'weekend' && !etat.matchsWeekend) await chargerLeWeekend();
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

      if (evenement.target.closest('[data-annuler-creation]')) {
        etat.creationCal = null;
        rendre();
        return;
      }

      if (evenement.target.closest('[data-basculer-colonnes]')) {
        etat.colonnesOuvertes = !etat.colonnesOuvertes;
        rendre();
        return;
      }

      const monter = evenement.target.closest('[data-monter-colonne]');
      const descendre = evenement.target.closest('[data-descendre-colonne]');
      if (monter || descendre) {
        const cle = (monter ?? descendre).dataset[monter ? 'monterColonne' : 'descendreColonne'];
        const actuel = colonnesOrdonnees(etat.ordreColonnes).map((c) => c.cle);
        const index = actuel.indexOf(cle);
        etat.ordreColonnes = deplacerColonne(
          etat.ordreColonnes,
          cle,
          index + (monter ? -1 : 1),
        );
        rendre();
        return;
      }

      if (evenement.target.closest('[data-basculer-filtres]')) {
        etat.filtresOuverts = !etat.filtresOuverts;
        // Première ouverture : on pose un filtre pour ne pas montrer une barre
        // vide. Le premier de la liste est le plus courant.
        if (etat.filtresOuverts && !etat.filtresAjoutes.length) {
          etat.filtresAjoutes = [COLONNES_FILTRABLES[0].cle];
        }
        rendre();
        return;
      }

      const ajouterFiltre = evenement.target.closest('[data-ajouter-filtre]');
      if (ajouterFiltre) {
        const cle = ajouterFiltre.dataset.ajouterFiltre;
        if (!etat.filtresAjoutes.includes(cle)) {
          etat.filtresAjoutes = [...etat.filtresAjoutes, cle];
        }
        rendre();
        return;
      }

      const retirerFiltre = evenement.target.closest('[data-retirer-filtre]');
      if (retirerFiltre) {
        const cle = retirerFiltre.dataset.retirerFiltre;
        etat.filtresAjoutes = etat.filtresAjoutes.filter((c) => c !== cle);
        // Retirer la puce retire aussi sa valeur : laisser un filtre invisible
        // agir serait le meilleur moyen de ne plus rien comprendre à la liste.
        const { [cle]: _, ...reste } = etat.filtresContact;
        etat.filtresContact = reste;
        rendre();
        return;
      }

      if (evenement.target.closest('[data-vider-filtres]')) {
        etat.filtresContact = {};
        rendre();
        return;
      }

      const affichage = evenement.target.closest('[data-affichage]');
      if (affichage) {
        etat.affichageContact = affichage.dataset.affichage;
        rendre();
        return;
      }

      // Les filtres de la banque : la valeur vit sur l'option choisie.
      const choixPilier = evenement.target.closest('[data-filtre-pilier-valeur]');
      if (choixPilier) {
        etat.pilier = choixPilier.dataset.filtrePilierValeur;
        rendre();
        return;
      }

      const choixStatutIdee = evenement.target.closest('[data-filtre-statut-idee-valeur]');
      if (choixStatutIdee) {
        etat.statutIdee = choixStatutIdee.dataset.filtreStatutIdeeValeur;
        rendre();
        return;
      }

      // Un filtre du CRM : la valeur est sur l'option, la colonne sur la puce.
      const choixFiltre = evenement.target.closest('[data-filtre-colonne-valeur]');
      if (choixFiltre) {
        const cle = choixFiltre.closest('[data-filtre-de]')?.dataset.filtreDe;
        if (!cle) return;
        etat.filtresContact = {
          ...etat.filtresContact,
          [cle]: choixFiltre.dataset.filtreColonneValeur,
        };
        rendre();
        return;
      }

      // Le statut se change dans la cellule : c'est le geste le plus fréquent
      // d'un CRM, il ne mérite pas un formulaire. Depuis le 15 août 2026 c'est
      // une liste et non plus un menu du système — la valeur est sur l'option,
      // le contact sur le conteneur.
      const choixStatut = evenement.target.closest('[data-statut]');
      if (choixStatut) {
        const id = choixStatut.closest('[data-statut-de]')?.dataset.statutDe;
        const contact = etat.contacts.find((c) => c.id === id);
        if (!contact || estProvisoire(contact.id)) return;
        const valeur = choixStatut.dataset.statut;
        await modifierAussitot(
          contact,
          { statut: valeur },
          () => api.modifierContact(contact.id, { statut: valeur }),
          { rendre: rendreContacts, echouer: dire },
        );
        return;
      }

      // Cliquer une colonne trie dessus ; la recliquer inverse le sens.
      const trier = evenement.target.closest('[data-trier]');
      if (trier) {
        const cle = trier.dataset.trier;
        etat.sensContact = etat.triContact === cle ? -etat.sensContact : 1;
        etat.triContact = cle;
        rendreContacts();
        return;
      }

      const supprimerContact = evenement.target.closest('[data-supprimer-contact]');
      if (supprimerContact) {
        const contact = etat.contacts.find(
          (c) => c.id === supprimerContact.dataset.supprimerContact,
        );
        if (!contact || estProvisoire(contact.id)) return;
        await retirerAussitot(etat.contacts, contact, () => api.supprimerContact(contact.id), {
          rendre: rendreContacts,
          echouer: dire,
        });
        return;
      }

      const avancerCommande = evenement.target.closest('[data-avancer-commande]');
      if (avancerCommande) {
        const commande = etat.commandes.find(
          (c) => c.id === avancerCommande.dataset.avancerCommande,
        );
        const suivant = CYCLE_COMMANDE[CYCLE_COMMANDE.indexOf(commande?.statut) + 1];
        if (!commande || !suivant || estProvisoire(commande.id)) return;

        // Livrer crée une victoire : c'en est une. Être payé, non. `avant` part
        // à l'API — elle lit le statut pour savoir s'il faut la victoire.
        const avant = { ...commande };
        await modifierAussitot(
          commande,
          { statut: suivant },
          async () => (await api.avancerCommande(avant, suivant)).commande,
          { rendre: rendreCommandes, echouer: dire },
        );
        return;
      }

      // « Envoyé ✓ » — le seul compteur de la Passerelle. Il monte parce que
      // Noé a écrit, pas parce qu'on lui a répondu.
      const envoye = evenement.target.closest('[data-envoye]');
      if (envoye) {
        const contact = etat.contacts.find((c) => c.id === envoye.dataset.envoye);
        if (!contact || estProvisoire(contact.id)) return;
        // Deux effets pour un geste : la fiche avance, et le compteur monte.
        await enregistrerLEnvoi(contact);
        return;
      }

      // La loupe déplie la recherche sur la ligne des onglets — et la replie
      // si elle est déjà là. Le focus va droit au champ : on est venu taper.
      // Elle vit sur TOUTES les pages depuis le 21 août au soir (demande de
      // Noé) : celles qui ne lisent pas le vivier le chargent au premier clic,
      // et la liste se remplit quand il arrive — le champ garde son curseur.
      if (evenement.target.closest('[data-ouvrir-recherche]')) {
        etat.rechercheClub = etat.rechercheClub === null ? '' : null;
        rendre();
        section.querySelector('[data-recherche-club]')?.focus();
        if (etat.rechercheClub !== null && (await charger(['pistes', 'contacts']))) {
          remplirLaRecherche();
        }
        return;
      }


      // Un club de la dizaine proposée rejoint la fournée. Un geste, pas de
      // panier : toucher, c'est choisir.
      const choisirPiste = evenement.target.closest('[data-choisir-piste]');
      if (choisirPiste) {
        const piste = etat.pistes.find((p) => p.id === choisirPiste.dataset.choisirPiste);
        if (!piste || estProvisoire(piste.id)) return;
        // La semaine part avec le choix, dans le MÊME geste : c'est elle qui
        // dira au prochain lundi que cette fournée est finie.
        const choix = { en_fournee: true, fournee_semaine: versDateISO(debutDeSemaine()) };
        await modifierAussitot(
          piste,
          choix,
          () => api.modifierPiste(piste.id, choix),
          // La recherche, si elle est ouverte, voit la ligne changer d'état
          // (« dans ta fournée ») sans perdre ni le champ ni le curseur.
          { rendre: () => { rendreContacts(); remplirLaRecherche(); }, echouer: dire },
        );
        return;
      }

      // Reposer un club au vivier : le seul retour en arrière d'une piste, et
      // c'est un choix de Noé — rien ne le compte, rien ne le reproche.
      const reposerPiste = evenement.target.closest('[data-reposer-piste]');
      if (reposerPiste) {
        const piste = etat.pistes.find((p) => p.id === reposerPiste.dataset.reposerPiste);
        if (!piste || estProvisoire(piste.id)) return;
        await modifierAussitot(
          piste,
          { en_fournee: false },
          () => api.modifierPiste(piste.id, { en_fournee: false }),
          { rendre: rendreContacts, echouer: dire },
        );
        return;
      }

      // Passer le club proposé : le suivant prend sa place. Un choix d'écran,
      // jamais écrit en base — le club reviendra une autre semaine.
      const passerPiste = evenement.target.closest('[data-passer-piste]');
      if (passerPiste) {
        etat.pistesPassees = [...etat.pistesPassees, passerPiste.dataset.passerPiste];
        retenirPistesPassees(etat.pistesPassees);
        rendreContacts();
        return;
      }

      // La dizaine complète, en fenêtre volante — pour composer d'un coup
      // d'œil les semaines où une porte à la fois ne suffit pas.
      if (evenement.target.closest('[data-voir-propositions]')) {
        etat.propositionsOuvertes = true;
        rendreContacts();
        section.querySelector('.fenetre-fermer')?.focus();
        return;
      }

      // Toucher la ligne d'un club, au vivier, ouvre sa fiche — sauf par ses
      // commandes : le « + » choisit, le lien du match mène dehors.
      const ouvrirClub = evenement.target.closest('[data-ouvrir-club]');
      if (ouvrirClub && !evenement.target.closest('a, button')) {
        const id = ouvrirClub.dataset.ouvrirClub;
        etat.clubOuvert = id;
        rendre();
        section.querySelector('.fenetre-fermer')?.focus();

        // Les matchs du club ne se chargent qu'ici, et qu'une fois : la fiche
        // s'ouvre tout de suite avec ses points de suspension, ils arrivent
        // derrière.
        if (!etat.matchsDuClub[id]) {
          try {
            etat.matchsDuClub[id] = await api.matchsAVenirDUnClub(id);
          } catch (souci) {
            console.error('Lecture des matchs impossible', souci);
            etat.matchsDuClub[id] = [];
          }
          if (etat.clubOuvert === id) rendre();
        }
        return;
      }

      // Le week-end d'avant, celui d'après : sept jours à chaque fois.
      const flecheWeekend = evenement.target.closest('[data-weekend]');
      if (flecheWeekend) {
        etat.ancreWeekend = ajouterJours(
          etat.ancreWeekend,
          7 * Number(flecheWeekend.dataset.weekend),
        );
        etat.matchsWeekend = null;
        rendreWeekend();
        await chargerLeWeekend();
        return;
      }

      // Le filtre du week-end : une compétition à la fois, « Tout » compris.
      // Rien à relire — les rencontres sont déjà là, on ne fait que trier.
      const competition = evenement.target.closest('[data-competition]');
      if (competition) {
        etat.competitionWeekend = competition.dataset.competition;
        rendreWeekend();
        centrerActif(section.querySelector('.filtres'));
        return;
      }

      // Un match du calendrier officiel n'a souvent PAS d'horaire, et son jour
      // peut encore glisser (demande de Noé, 15 août 2026) : le geste n'écrit
      // donc rien tout de suite, il OUVRE la tuile déjà remplie — titre, date
      // approchée, type « match », les deux clubs — et Noé corrige le jour et
      // l'heure avant de valider. Poser directement aurait inventé une heure.
      const poserMatch = evenement.target.closest('[data-poser-match]');
      if (poserMatch) {
        const piste = etat.pistes.find((p) => p.id === poserMatch.dataset.poserMatch);
        const match = etat.matchsDuClub[piste?.id]?.find(
          (candidat) =>
            candidat.date === poserMatch.dataset.matchDate &&
            String(candidat.journee) === poserMatch.dataset.matchJournee,
        );
        if (!piste || !match) return;

        const adversaire = etat.pistes.find((candidat) => candidat.nom === match.adversaire);
        const recevant = match.domicile ? piste : adversaire;
        const visiteur = match.domicile ? adversaire : piste;

        etat.clubOuvert = null;
        etat.creationCal = {
          debut: match.date,
          fin: match.date,
          nature: 'evenement',
          valeurs: {
            titre: afficheDuMatch(piste, match),
            type_moment: 'match',
            // La pastille « Clubs » s'ouvre déjà remplie : le geste vient du
            // vivier, les deux noms sont connus. Ce sont ces champs-là qui font
            // foi à l'envoi — Noé peut donc encore corriger l'affiche.
            club_recevant: recevant?.nom ?? '',
            club_visiteur: visiteur?.nom ?? '',
          },
          // Le lieu voyage à part : il ne s'écrit dans aucun champ de la tuile,
          // il sert de valeur par défaut si Noé n'en donne pas.
          clubs: { lieu: recevant?.nom ?? null },
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      // Depuis la fiche d'un club, une ligne de contact ouvre la sienne : une
      // fenêtre remplace l'autre, on ne les empile pas.
      const ouvrirContactDuClub = evenement.target.closest('.club-contact[data-ouvrir-contact]');
      if (ouvrirContactDuClub) {
        etat.clubOuvert = null;
        etat.contactOuvert = ouvrirContactDuClub.dataset.ouvrirContact;
        etat.editionContact = false;
        rendre();
        section.querySelector('.fenetre-fermer')?.focus();
        return;
      }

      // Toucher une pastille de la bande change la personne regardée : c'est
      // sa relation qui s'affiche dessous. La toucher une SECONDE fois — elle
      // est alors déjà choisie — ouvre sa fiche (demande de Noé, 15 août
      // 2026) : on regarde, puis on veut en savoir plus. La classe dit l'état
      // affiché mieux que l'état lui-même, dont le premier contact est absent
      // tant qu'on n'a rien touché.
      const contactActif = evenement.target.closest('[data-contact-actif]');
      if (contactActif) {
        if (contactActif.classList.contains('actif')) {
          etat.contactOuvert = contactActif.dataset.contactActif;
          etat.editionContact = false;
          rendre();
          section.querySelector('.fenetre-fermer')?.focus();
          return;
        }
        etat.contactChoisi = {
          ...etat.contactChoisi,
          [contactActif.dataset.pisteDuContact]: contactActif.dataset.contactActif,
        };
        rendreContacts();
        return;
      }

      // Le filtre du vivier : une compétition à la fois, « Tout » compris.
      const division = evenement.target.closest('[data-division]');
      if (division) {
        etat.divisionVivier = division.dataset.division;
        rendreContacts();
        centrerActif(section.querySelector('.filtres'));
        return;
      }

      // L'objectif de la semaine tourne d'un toucher : 1 → 2 → 3 → 5 → 1.
      const objectifDoux = evenement.target.closest('[data-objectif-doux]');
      if (objectifDoux) {
        etat.objectifDoux = objectifSuivant(Number(objectifDoux.dataset.objectifDoux));
        retenirObjectifDoux(etat.objectifDoux);
        rendreContacts();
        return;
      }

      // Une autre dizaine : graine neuve, passages remis à zéro — c'est une
      // nouvelle donne, pas la même relue.
      const proposerAutres = evenement.target.closest('[data-proposer-autres]');
      if (proposerAutres) {
        etat.grainePropositions = Date.now();
        etat.pistesPassees = [];
        retenirPistesPassees([]);
        rendreContacts();
        return;
      }

      // La personne trouvée pour un club : la fiche s'ouvre, structure déjà
      // remplie, et `piste_id` voyage pour que la piste se relie à la fiche.
      const trouvePiste = evenement.target.closest('[data-trouve-piste]');
      if (trouvePiste) {
        const piste = etat.pistes.find((p) => p.id === trouvePiste.dataset.trouvePiste);
        if (!piste || estProvisoire(piste.id)) return;
        etat.contactNouveau = { structure: piste.nom, type: 'club', piste_id: piste.id };
        rendre();
        return;
      }

      // « Envoyé ✓ » d'une piste : l'envoi compte, et le club est contacté —
      // un fait daté, qui ne redescend jamais. Avec une fiche, la relation
      // avance aussi ; sans fiche, le message est parti au compte du club, et
      // l'effort compte quand même.
      const envoyePiste = evenement.target.closest('[data-envoye-piste]');
      if (envoyePiste) {
        const piste = etat.pistes.find((p) => p.id === envoyePiste.dataset.envoyePiste);
        if (!piste || estProvisoire(piste.id)) return;

        const fiche = etat.contacts.find((contact) => contact.id === piste.contact_id);
        if (fiche && !estProvisoire(fiche.id)) {
          await enregistrerLEnvoi(fiche);
        } else {
          const envoiProvisoire = {
            id: identifiantProvisoire(),
            contact_id: null,
            date: versDateISO(),
          };
          etat.envois = [envoiProvisoire, ...etat.envois];
          try {
            const envoi = await api.enregistrerEnvoiLibre();
            const rang = etat.envois.indexOf(envoiProvisoire);
            if (rang !== -1) etat.envois[rang] = envoi;
          } catch (souci) {
            console.error("Enregistrement de l'envoi impossible", souci);
            etat.envois = etat.envois.filter((envoi) => envoi.id !== envoiProvisoire.id);
            dire("L'envoi n'a pas pu être enregistré.");
          }
        }

        await modifierAussitot(
          piste,
          { date_contacte: versDateISO() },
          () => api.modifierPiste(piste.id, { date_contacte: versDateISO() }),
          { rendre: rendreContacts, echouer: dire },
        );
        return;
      }

      const copierModele = evenement.target.closest('[data-copier-modele]');
      if (copierModele) {
        const modele = etat.modeles.find((m) => m.id === copierModele.dataset.copierModele);
        if (!modele) return;
        try {
          await navigator.clipboard.writeText(modele.corps);
          copierModele.textContent = 'Copié';
          setTimeout(() => {
            copierModele.textContent = 'Copier';
          }, 1500);
        } catch (souci) {
          console.error('Copie impossible', souci);
        }
        return;
      }

      const supprimerModele = evenement.target.closest('[data-supprimer-modele]');
      if (supprimerModele) {
        const modele = etat.modeles.find((m) => m.id === supprimerModele.dataset.supprimerModele);
        if (!modele || estProvisoire(modele.id)) return;
        await retirerAussitot(etat.modeles, modele, () => api.supprimerModele(modele.id), {
          rendre: rendreContacts,
          echouer: dire,
        });
        return;
      }

      const supprimerCommande = evenement.target.closest('[data-supprimer-commande]');
      if (supprimerCommande) {
        const commande = etat.commandes.find(
          (c) => c.id === supprimerCommande.dataset.supprimerCommande,
        );
        if (!commande || estProvisoire(commande.id)) return;
        await retirerAussitot(etat.commandes, commande, () => api.supprimerCommande(commande.id), {
          rendre: rendreCommandes,
          echouer: dire,
        });
        return;
      }

      // L'invite acceptée : la capture s'ouvre, date et lieu déjà remplis.
      const loguerEvenement = evenement.target.closest('[data-loguer-evenement]');
      if (loguerEvenement) {
        const passe = etat.evenements.find(
          (candidat) => candidat.id === loguerEvenement.dataset.loguerEvenement,
        );
        if (!passe) return;
        // La sortie est déjà au calendrier : la capture ne redemandera ni son
        // nom ni sa date, seulement ce qui s'y est vécu.
        etat.prefillMoment = {
          date: versDateISO(new Date(passe.date_debut)),
          titre: passe.titre,
          evenement_id: passe.id,
          // La sortie elle-même voyage : ses clubs sont les seuls champs que le
          // formulaire redemande, et ils doivent s'ouvrir sur ce qui est déjà
          // posé plutôt que vides.
          sortie: passe,
        };
        etat.captureOuverte = true;
        etat.ecartes = ecarterEvenement(passe.id);
        rendre();
        return;
      }

      const ecarterInvite = evenement.target.closest('[data-ecarter-evenement]');
      if (ecarterInvite) {
        etat.ecartes = ecarterEvenement(ecarterInvite.dataset.ecarterEvenement);
        rendre();
        return;
      }

      // La préparation quitte l'accueil, et rien d'autre : la feuille reste
      // entière à sa page, la sortie reste au calendrier. C'est la place à
      // l'écran qu'on reprend, pas le travail qu'on efface.
      const ecarterLaPrepa = evenement.target.closest('[data-ecarter-prepa]');
      if (ecarterLaPrepa) {
        etat.prepasEcartees = ecarterPrepa(ecarterLaPrepa.dataset.ecarterPrepa);
        rendre();
        return;
      }

      const avancer = evenement.target.closest('[data-avancer]');
      if (avancer) {
        const pub = trouverPub(avancer.dataset.avancer);
        const suivant = STATUTS_YUNO[STATUTS_YUNO.indexOf(pub.statut) + 1];
        if (!suivant || estProvisoire(pub.id)) return;

        // Poster, c'est déposer l'œuvre et repartir : le site le dit, puis se
        // tait. Le mot de clôture part avec le geste, pas avec la réponse.
        etat.cloture = suivant === 'publie';
        await modifierAussitot(
          pub,
          { statut: suivant },
          () => api.modifierPublication(pub.id, { statut: suivant }),
          { rendre, echouer: dire },
        );
        return;
      }

      const deprogrammer = evenement.target.closest('[data-deprogrammer]');
      if (deprogrammer) {
        const pub = trouverPub(deprogrammer.dataset.deprogrammer);
        if (estProvisoire(pub.id)) return;
        await modifierAussitot(
          pub,
          { date_prevue: null },
          () => api.modifierPublication(pub.id, { date_prevue: null }),
          { rendre, echouer: dire },
        );
        return;
      }

      const supprimerPub = evenement.target.closest('[data-supprimer-pub]');
      if (supprimerPub) {
        const pub = trouverPub(supprimerPub.dataset.supprimerPub);
        if (!pub || estProvisoire(pub.id)) return;
        // Supprimée depuis sa propre fiche : la fenêtre n'a plus de sujet.
        if (etat.ideeOuverte === pub.id) etat.ideeOuverte = null;
        await retirerAussitot(etat.publications, pub, () => api.supprimerPublication(pub.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) {
        const objectif = etat.objectifs.find((candidat) =>
          candidat.jalons?.some((j) => j.id === jalon.dataset.jalon),
        );
        const cible = objectif?.jalons.find((j) => j.id === jalon.dataset.jalon);
        if (!cible || estProvisoire(cible.id)) return;

        // La barre de progression avance sous le doigt. `avant` part à l'API :
        // elle relit le jalon pour savoir s'il y a une victoire à créer.
        const avantJalon = { ...cible };
        await modifierAussitot(
          cible,
          { atteint: true, date_atteint: versDateISO() },
          async () => (await api.atteindreJalon(avantJalon, 'photo')).jalon,
          {
            rendre: () => {
              rendre();
              ouvrirObjectif(objectif.id);
            },
            echouer: dire,
          },
        );
        return;
      }

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) {
        const objectif = etat.objectifs.find((o) => o.id === atteindre.dataset.atteindre);
        if (!objectif || estProvisoire(objectif.id)) return;
        if (!confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;

        // Un objectif atteint quitte la liste des actifs : il a sa victoire.
        await retirerAussitot(etat.objectifs, objectif, () => api.atteindreObjectif(objectif), {
          rendre,
          echouer: dire,
        });
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

      // « Retirer du carnet » ne supprime plus rien depuis la fusion : la
      // sortie a bien eu lieu, elle reste au calendrier à sa date. C'est sa
      // FACE VÉCUE qui s'efface — photo, note, œuvre finie, rencontres, et la
      // victoire qui n'en était que le reflet.
      const supprimerMoment = evenement.target.closest('[data-supprimer-moment]');
      if (supprimerMoment) {
        const id = supprimerMoment.dataset.supprimerMoment;
        const sortie = etat.evenements.find((candidat) => candidat.id === id);
        if (!sortie || !confirm(`Retirer « ${titreDuMoment(sortie)} » du carnet ?`)) return;
        if (estProvisoire(id)) return;
        // Retirée depuis sa propre fenêtre : elle n'a plus de sujet.
        if (etat.momentOuvert === id) etat.momentOuvert = null;

        const chemin = sortie.photo_chemin;
        await modifierAussitot(
          sortie,
          { vecu: false, photo_chemin: null, note: null, oeuvre_finie: false, rencontres: [] },
          () => api.retirerDuCarnet(id, chemin),
          { rendre, echouer: dire },
        );
        return;
      }

      // Cocher un item de préparation. Cocher dessine la coche puis écrit ;
      // décocher écrit tout de suite — on ne célèbre pas un retour en arrière.
      // Pas de victoire ici : la victoire d'une sortie, c'est le moment logué.
      const cocherPrepa = evenement.target.closest('[data-cocher-prepa]');
      if (cocherPrepa) {
        const id = cocherPrepa.dataset.cocherPrepa;
        const feuille = etat.preparations.find((f) => f.items?.some((item) => item.id === id));
        const item = feuille?.items.find((candidat) => candidat.id === id);
        if (!item || estProvisoire(item.id)) return;

        const fait = !item.fait;
        if (fait) await animerLaCoche(cocherPrepa);
        await modifierAussitot(
          item,
          { fait },
          () => api.modifierItemPreparation(item.id, { fait }),
          { rendre, echouer: dire },
        );
        return;
      }

      const retirerPrepa = evenement.target.closest('[data-retirer-prepa]');
      if (retirerPrepa) {
        const id = retirerPrepa.dataset.retirerPrepa;
        const feuille = etat.preparations.find((f) => f.items?.some((item) => item.id === id));
        const item = feuille?.items.find((candidat) => candidat.id === id);
        if (!item || estProvisoire(item.id)) return;

        await retirerAussitot(feuille.items, item, () => api.supprimerItemPreparation(item.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      // « Préparer » sur un événement ou une commande. Avec un seul modèle (ou
      // aucun), la feuille se crée tout de suite ; avec plusieurs, la fenêtre
      // de choix s'ouvre — une liste, jamais un menu natif.
      const preparer = evenement.target.closest('[data-preparer]');
      if (preparer) {
        const [type, id] = preparer.dataset.preparer.split(':');
        let cible = null;
        if (type === 'evenement') {
          const source = etat.evenements.find((candidat) => candidat.id === id);
          if (source) {
            cible = {
              evenement_id: source.id,
              titre: source.titre,
              date: versDateISO(new Date(source.date_debut)),
            };
          }
        } else {
          const source = etat.commandes.find((candidat) => candidat.id === id);
          if (source && !estProvisoire(source.id)) {
            cible = { commande_id: source.id, titre: source.titre, date: source.echeance ?? null };
          }
        }
        if (!cible) return;

        if (etat.modelesPrepa.length > 1) {
          etat.detailCal = null;
          etat.choixPrepa = cible;
          rendre();
          section.querySelector('.fenetre-fermer')?.focus();
          return;
        }
        await creerFeuille(cible, etat.modelesPrepa[0] ?? null, preparer);
        return;
      }

      // Le modèle choisi dans la fenêtre. Un attribut vide dit « feuille
      // vierge » : le bouton existe, le modèle non.
      const modeleChoisi = evenement.target.closest('[data-modele-choisi]');
      if (modeleChoisi) {
        const cible = etat.choixPrepa;
        if (!cible) return;
        const modele =
          etat.modelesPrepa.find(
            (candidat) => candidat.id === modeleChoisi.dataset.modeleChoisi,
          ) ?? null;
        etat.choixPrepa = null;
        await creerFeuille(cible, modele, modeleChoisi);
        return;
      }

      const ouvrirPreparation = evenement.target.closest('[data-ouvrir-preparation]');
      if (ouvrirPreparation) {
        // La fenêtre du détail se ferme AVANT de partir : au retour sur le
        // calendrier, elle n'a pas à réapparaître par-dessus la grille.
        etat.detailCal = null;
        location.hash = `#yuno/preparations/${ouvrirPreparation.dataset.ouvrirPreparation}`;
        return;
      }

      const retirerItemModele = evenement.target.closest('[data-retirer-item-modele]');
      if (retirerItemModele) {
        const id = retirerItemModele.dataset.retirerItemModele;
        const modele = etat.modelesPrepa.find((m) => m.items?.some((item) => item.id === id));
        const item = modele?.items.find((candidat) => candidat.id === id);
        if (!item || estProvisoire(item.id)) return;

        await retirerAussitot(modele.items, item, () => api.supprimerItemModele(item.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      const supprimerModelePrepa = evenement.target.closest('[data-supprimer-modele-prepa]');
      if (supprimerModelePrepa) {
        const modele = etat.modelesPrepa.find(
          (candidat) => candidat.id === supprimerModelePrepa.dataset.supprimerModelePrepa,
        );
        if (!modele || estProvisoire(modele.id)) return;
        if (
          !confirm(
            `Supprimer le modèle « ${modele.nom} » ? Les feuilles déjà créées gardent leurs copies.`,
          )
        ) {
          return;
        }

        const retire = await retirerAussitot(
          etat.modelesPrepa,
          modele,
          () => api.supprimerModelePreparation(modele.id),
          { rendre, echouer: dire },
        );
        if (retire) location.hash = '#yuno/preparations';
        return;
      }

      // Appliquer un modèle à la feuille OUVERTE (demande de Noé, 24 août
      // 2026) : ses lignes manquantes s'ajoutent — même phase et même texte,
      // c'est déjà là, on ne double pas — et la feuille retient ce modèle.
      // Pas d'écriture optimiste : plusieurs insertions, et une liste à
      // moitié appliquée serait pire qu'une attente d'une seconde.
      const appliquerModele = evenement.target.closest('[data-appliquer-modele]');
      if (appliquerModele) {
        const feuille = etat.preparations.find((f) => f.id === etat.feuilleOuverte);
        const modele = etat.modelesPrepa.find(
          (candidat) => candidat.id === appliquerModele.dataset.appliquerModele,
        );
        if (!feuille || !modele) return;
        appliquerModele.disabled = true;

        try {
          const cle = (item) => `${item.phase}|${item.texte.trim().toLowerCase()}`;
          const dejaLa = new Set(feuille.items.map(cle));
          const nouveaux = [];
          for (const item of modele.items.filter((candidat) => !dejaLa.has(cle(candidat)))) {
            nouveaux.push(
              await api.ajouterItemPreparation({
                preparation_id: feuille.id,
                phase: item.phase,
                texte: item.texte,
                ordre: item.ordre,
              }),
            );
          }
          if (feuille.modele_id !== modele.id) {
            // La réponse ne porte que les colonnes de la table : les items de
            // la feuille ne sont pas écrasés par l'assignation.
            Object.assign(
              feuille,
              await api.modifierPreparation(feuille.id, { modele_id: modele.id }),
            );
          }
          feuille.items.push(...nouveaux);
          rendre();
        } catch (souci) {
          console.error('Application du modèle impossible', souci);
          appliquerModele.disabled = false;
          dire("Le modèle n'a pas pu être appliqué en entier — rouvre la feuille pour voir où il en est.");
        }
        return;
      }

      const supprimerPrepa = evenement.target.closest('[data-supprimer-prepa]');
      if (supprimerPrepa) {
        const feuille = etat.preparations.find(
          (candidat) => candidat.id === supprimerPrepa.dataset.supprimerPrepa,
        );
        if (!feuille || estProvisoire(feuille.id)) return;
        if (!confirm(`Supprimer la préparation « ${feuille.titre} » ?`)) return;

        const retiree = await retirerAussitot(
          etat.preparations,
          feuille,
          () => api.supprimerPreparation(feuille.id),
          { rendre, echouer: dire },
        );
        if (retiree) location.hash = '#yuno/preparations';
        return;
      }

      // Une rencontre notée au vol devient une fiche : le réseau se
      // remplit du terrain, sans qu'il ait fallu y penser sur le moment.
      //
      // Le « + » OUVRE LA FICHE au lieu de l'écrire (demande de Noé, 14 août
      // 2026). Avant, il créait en base une fiche qui ne portait qu'un nom, et
      // il fallait aller la retrouver dans le réseau pour dire qui était cette
      // personne. Maintenant tout se remplit au moment où l'on s'en souvient —
      // c'est-à-dire tout de suite après la sortie.
      const ouvrirFiche = evenement.target.closest('[data-ouvrir-fiche]');
      if (ouvrirFiche) {
        const id = ouvrirFiche.dataset.ouvrirFiche;
        const sortie = etat.evenements.find((candidat) =>
          candidat.rencontres?.some((rencontre) => rencontre.id === id),
        );
        const rencontre = sortie?.rencontres.find((candidat) => candidat.id === id);
        if (!rencontre || estProvisoire(rencontre.id)) return;

        etat.contactNouveau = {
          nom: rencontre.nom,
          // Ils se sont vus en vrai : la relation ne part pas de zéro.
          statut: 'contact_etabli',
          rencontre_id: rencontre.id,
          // Le dernier échange EST le jour de la sortie, pas celui où l'on
          // remplit la fiche : le carnet se souvient de quand on s'est vus.
          dernier_echange: versDateISO(new Date(sortie.date_debut)),
          quand: echeanceLisible(depuisDateISO(versDateISO(new Date(sortie.date_debut)))),
        };
        rendre();
        section.querySelector('#contact-nouveau-nom')?.focus();
        return;
      }

    });

    // Glisser sur les jours du calendrier ouvre le formulaire, rempli de la
    // plage choisie.
    // Les pastilles de la tuile « Poser au calendrier », comme dans l'espace
    // Calendrier du hub : tout se joue dans le DOM, rien ne se redessine.
    rafraichirLaCapture = brancherCapture(section);

    // Ce qu'on pose par défaut. Le calendrier éditorial ne montre QUE des
    // publications : y poser un événement par défaut serait absurde, la page
    // ne saurait même pas l'afficher. Ailleurs, c'est le filtre qui décide —
    // une seule nature cochée dit déjà ce qu'on est en train de faire.
    const natureCreable = () =>
      etat.vue === 'editorial' ? 'publication' : natureParDefaut(etat.natures);

    poserLEntreeClavier = brancherClavier(section, (jour) => {
      etat.detailCal = null;
      etat.creationCal = { debut: jour, fin: jour, nature: natureCreable() };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });
    poserLEntreeClavier();

    brancherSelection(section, ({ debut, fin }) => {
      etat.detailCal = null;
      etat.creationCal = { debut, fin, nature: natureCreable() };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });

    // Glisser une barre la reporte : l'action la plus fréquente après créer.
    brancherDeplacement(section, async ({ element: cle, ecart }) => {
      const [type, id] = cle.split(':');
      const element = elementsDuCalendrier(etat).find(
        (candidat) => candidat.type === type && String(candidat.id) === id,
      );
      if (!element) return;

      try {
        await appliquerAuCalendrier(type, id, champsApresDeplacement(element, ecart));
        await rechargerCalendrier();
        rendre();
      } catch (souci) {
        console.error('Déplacement impossible', souci);
      }
    });

    // Glisser une idée de la colonne sur un jour la programme. Même mécanique
    // que le déplacement d'une barre dans le calendrier : on regarde ce qu'il y
    // a sous le pointeur plutôt que d'utiliser l'API drag-and-drop, qui ne se
    // comporte pas pareil d'un navigateur à l'autre et ne dessine rien de
    // convenable. À la souris seulement — au doigt, le geste entrerait en
    // conflit avec le défilement de la page.
    let ideePrise = null;

    const viserLeJour = (cle) => {
      for (const cellule of section.querySelectorAll('.cal-jour')) {
        cellule.classList.toggle('cal-cible', Boolean(cle) && cellule.dataset.jour === cle);
      }
    };

    const jourSousLePointeur = (x, y) =>
      document.elementsFromPoint(x, y).find((e) => e.classList?.contains('cal-jour'))?.dataset
        .jour;

    const lacherLIdee = () => {
      ideePrise?.tuile.classList.remove('en-deplacement');
      viserLeJour(null);
      ideePrise = null;
    };

    // La bande s'élargit avec l'écran : ce qui débordait sur téléphone tient
    // parfois d'un bloc sur ordinateur, et le fondu doit disparaître avec le
    // débordement. Sans ça, il annoncerait une réserve qui n'existe plus.
    window.addEventListener('resize', marquerLesDebordements);

    // Le fondu suit le doigt : `scroll` ne remonte pas, on l'écoute donc à la
    // capture, sur la section entière.
    section.addEventListener(
      'scroll',
      (evenement) => {
        if (evenement.target.classList?.contains('fournee-bande-liste')) {
          marquerLesDebordements();
        }
      },
      true,
    );

    section.addEventListener('pointerdown', (evenement) => {
      if (evenement.pointerType === 'touch') return;
      const tuile = evenement.target.closest('[data-poser-idee]');
      if (!tuile) return;
      evenement.preventDefault();
      ideePrise = { tuile, x: evenement.clientX, y: evenement.clientY, bouge: false };
    });

    section.addEventListener('pointermove', (evenement) => {
      if (!ideePrise) return;
      if (!ideePrise.bouge) {
        if (Math.hypot(evenement.clientX - ideePrise.x, evenement.clientY - ideePrise.y) < 5) return;
        ideePrise.bouge = true;
        ideePrise.tuile.classList.add('en-deplacement');
      }
      viserLeJour(jourSousLePointeur(evenement.clientX, evenement.clientY));
    });

    section.addEventListener('pointerup', async (evenement) => {
      if (!ideePrise) return;
      const { tuile, bouge } = ideePrise;
      const jour = jourSousLePointeur(evenement.clientX, evenement.clientY);
      lacherLIdee();
      if (!bouge || !jour) return;

      // L'idée se pose sur le jour où le doigt l'a lâchée, sans attendre : le
      // glissement vient de se terminer, la voir sauter en arrière puis revenir
      // serait le contraire du geste.
      const pub = trouverPub(tuile.dataset.poserIdee);
      if (!pub || estProvisoire(pub.id)) return;
      await modifierAussitot(
        pub,
        { date_prevue: jour },
        () => api.modifierPublication(pub.id, { date_prevue: jour }),
        { rendre, echouer: dire },
      );
    });

    section.addEventListener('pointercancel', lacherLIdee);

    // Échap ferme la fenêtre — c'est le geste attendu partout ailleurs.
    document.addEventListener('keydown', (touche) => {
      if (touche.key !== 'Escape') return;
      if (
        !(
          etat.creationCal ||
          etat.detailCal ||
          etat.captureOuverte ||
          etat.contactNouveau ||
          etat.commandeNouvelle ||
          etat.jourOuvertCal ||
          etat.ideeOuverte ||
          etat.momentOuvert ||
          etat.contactOuvert ||
          etat.choixPrepa ||
          etat.rechercheClub !== null
        )
      ) {
        return;
      }
      etat.creationCal = null;
      etat.detailCal = null;
      etat.jourOuvertCal = null;
      etat.captureOuverte = false;
      etat.contactNouveau = false;
      etat.commandeNouvelle = false;
      etat.prefillCommande = null;
      etat.prefillMoment = null;
      etat.ideeOuverte = null;
      etat.momentOuvert = null;
      etat.editionMoment = false;
      etat.contactOuvert = null;
      etat.editionContact = false;
      etat.choixPrepa = null;
      etat.rechercheClub = null;
      rendre();
    });

    // Une tuile d'aperçu est un bouton : elle doit s'ouvrir à l'Entrée et à
    // l'Espace, comme un vrai. L'Espace fait défiler la page par défaut.
    section.addEventListener('keydown', (touche) => {
      if (touche.key !== 'Enter' && touche.key !== ' ') return;
      const apercu = touche.target.closest('[data-ouvrir-pub]');
      if (!apercu) return;
      touche.preventDefault();
      etat.ideeOuverte = apercu.dataset.ouvrirPub;
      rendre();
      section.querySelector('.fenetre-fermer')?.focus();
    });

    // Tirer un en-tête de colonne pour la déplacer — le geste de Notion. Sur
    // téléphone on ne tire pas un tableau : c'est le panneau « Colonnes » qui
    // sert, avec ses flèches. Les deux écrivent le même ordre.
    let colonneTiree = null;

    section.addEventListener('dragstart', (evenement) => {
      const entete = evenement.target.closest('th[data-colonne]');
      if (!entete) return;
      colonneTiree = entete.dataset.colonne;
      evenement.dataTransfer.effectAllowed = 'move';
      // Firefox n'amorce pas le glissement sans données transférées.
      evenement.dataTransfer.setData('text/plain', colonneTiree);
      entete.classList.add('en-deplacement');
    });

    section.addEventListener('dragover', (evenement) => {
      const entete = evenement.target.closest('th[data-colonne]');
      if (!entete || !colonneTiree || entete.dataset.colonne === colonneTiree) return;
      // Sans preventDefault, le navigateur refuse le dépôt.
      evenement.preventDefault();
      entete.classList.add('cible-depot');
    });

    section.addEventListener('dragleave', (evenement) => {
      evenement.target.closest('th[data-colonne]')?.classList.remove('cible-depot');
    });

    section.addEventListener('drop', (evenement) => {
      const entete = evenement.target.closest('th[data-colonne]');
      if (!entete || !colonneTiree) return;
      evenement.preventDefault();
      etat.ordreColonnes = deplacerColonne(
        etat.ordreColonnes,
        colonneTiree,
        Number(entete.dataset.index),
      );
      colonneTiree = null;
      rendre();
    });

    section.addEventListener('dragend', () => {
      colonneTiree = null;
      section.querySelectorAll('.en-deplacement, .cible-depot').forEach((element) => {
        element.classList.remove('en-deplacement', 'cible-depot');
      });
    });

    // La recherche du carnet filtre à la frappe, sans bouton.
    section.addEventListener('input', (evenement) => {
      const rechercheDeClub = evenement.target.closest('[data-recherche-club]');
      if (rechercheDeClub) {
        etat.rechercheClub = rechercheDeClub.value;
        remplirLaRecherche();
        return;
      }

      const recherche = evenement.target.closest('#recherche-contact');
      if (!recherche) return;
      etat.rechercheContact = recherche.value;
      rendreContacts();
    });

    section.addEventListener('change', async (evenement) => {
      // Programmer une idée : choisir une date suffit, pas de bouton de plus.
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

      // Dater le dernier échange d'un contact, au même geste.

      // Les champs vifs « pourquoi ce contact » et « prochaine action » de
      // l'ancienne file par niveaux sont partis avec elle (15 août 2026) : ces
      // colonnes s'éditent depuis la fiche du carnet, et la relance datée
      // continue d'apparaître au calendrier.

      // L'éditeur de modèles : le nom et les items se corrigent en place, sans
      // redessin — la valeur est déjà sous les yeux, comme les modèles de
      // messages. Un champ vidé reprend son texte : une ligne sans texte
      // n'existe pas, elle se RETIRE (la croix est à côté).
      const nomModele = evenement.target.closest('[data-nom-modele]');
      if (nomModele) {
        const modele = etat.modelesPrepa.find((m) => m.id === nomModele.dataset.nomModele);
        if (!modele || estProvisoire(modele.id)) return;
        const nom = nomModele.value.trim();
        if (!nom) {
          nomModele.value = modele.nom;
          return;
        }
        await modifierAussitot(
          modele,
          { nom },
          () => api.modifierModelePreparation(modele.id, { nom }),
          { echouer: (message) => { rendre(); dire(message); } },
        );
        return;
      }

      const itemModele = evenement.target.closest('[data-item-modele]');
      if (itemModele) {
        const id = itemModele.dataset.itemModele;
        const modele = etat.modelesPrepa.find((m) => m.items?.some((item) => item.id === id));
        const item = modele?.items.find((candidat) => candidat.id === id);
        if (!item || estProvisoire(item.id)) return;
        const texte = itemModele.value.trim();
        if (!texte) {
          itemModele.value = item.texte;
          return;
        }
        await modifierAussitot(item, { texte }, () => api.modifierItemModele(item.id, { texte }), {
          echouer: (message) => { rendre(); dire(message); },
        });
        return;
      }

      const modeleTitre = evenement.target.closest('[data-modele-titre]');
      const modeleCorps = evenement.target.closest('[data-modele-corps]');
      if (modeleTitre || modeleCorps) {
        const champ = modeleTitre ?? modeleCorps;
        const id = champ.dataset.modeleTitre ?? champ.dataset.modeleCorps;
        const modele = etat.modeles.find((m) => m.id === id);
        if (!modele || estProvisoire(modele.id)) return;

        const champs = { [modeleTitre ? 'titre' : 'corps']: champ.value.trim() };
        await modifierAussitot(modele, champs, () => api.modifierModele(id, champs), {
          echouer: (message) => { rendre(); dire(message); },
        });
        return;
      }

    });

    // Le cache est écrit à chaque chargement, mais l'état bouge aussi entre
    // deux : une idée notée, un statut changé, un moment logué. On le reprend
    // donc au moment où la page s'efface — c'est le seul instant garanti sur
    // iOS, où une application ajoutée à l'écran d'accueil n'est jamais
    // « fermée », seulement mise de côté.
    const garderLEtat = () => ecrireCache(CLE_CACHE, aGarder());
    window.addEventListener('pagehide', garderLEtat);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') garderLEtat();
    });

    // Le premier rendu vient en dernier, après que tout est branché : sans
    // quoi un clic pendant le chargement tomberait dans le vide.
    await this.naviguer(route);
  },
};
