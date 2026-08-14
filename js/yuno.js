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
//   #yuno/reseau       la Passerelle, le réseau et les commandes
//
// Une idée est une publication sans date : même table, deux vues.

import * as api from './api.js';
import {
  construireFormulaire,
  construireFenetre,
  construireObjectifs,
} from './espace-projet.js';
import {
  STATUTS_YUNO,
  NOMS_STATUTS,
  construireAVenir,
  construireBanque,
  construirePubliees,
  construireApercuCreation,
  corpsPublication,
  formulaireIdee,
} from './publications.js';
import {
  depuisDateISO,
  echeanceLisible,
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
      <p class="discret piliers-test">Ça rentre dans un pilier ? Oui → je crée.
        Plancher : 2 publications par semaine. Les stories restent une zone franche.</p>
    </div>`;
}

const VUES = [
  'accueil', 'journal', 'creer', 'banque', 'editorial',
  'calendrier', 'reseau', 'passerelle', 'carnet', 'preparations',
];

// La banque est une pièce de l'atelier : elle n'a pas son onglet, elle garde
// celui de Créer allumé. Une barre de navigation ne doit pas grandir à chaque
// écran qu'on ajoute.
const ONGLET_DE_LA_VUE = {
  banque: 'creer',
  editorial: 'creer',
  passerelle: 'reseau',
  carnet: 'reseau',
  // Préparer et vivre sont les deux faces du même axe terrain : les feuilles
  // de préparation gardent l'onglet Journal allumé.
  preparations: 'journal',
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

function enTete(vue) {
  const vueActive = ONGLET_DE_LA_VUE[vue] ?? vue;
  // Le calendrier n'est plus dans cette liste : il va en bout de barre, en
  // icône (voir `ongletCalendrier`). Ce sont les lieux du site qui se nomment.
  const liens = [
    ['accueil', 'Accueil', '#yuno'],
    ['journal', 'Journal', '#yuno/journal'],
    ['creer', 'Créer', '#yuno/creer'],
    ['reseau', 'Réseau', '#yuno/reseau'],
  ];

  return `
    <header class="yuno-site-tete">
      <!-- La signature EST le titre : ni « Yuno » en texte, ni sous-titre
           (décision de Noé, 7 août 2026). L'alt porte le nom pour l'accessibilité. -->
      <img class="yuno-signature" src="img/yuno-signature.png" alt="Yuno">
    </header>
    <nav class="yuno-nav" aria-label="Le site Yuno">
      ${liens
        .map(
          ([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === vueActive ? 'actif' : ''}"
          ${vue === vueActive ? 'aria-current="page"' : ''}>${libelle}</a>`,
        )
        .join('')}
      ${ongletCalendrier('#yuno/calendrier', vueActive === 'calendrier')}
    </nav>`;
}

// La seule mention du hub sur tout le site, tout en bas : en plein écran sur
// téléphone, sans barre d'adresse, il faut une porte de sortie.
function pied() {
  return `
    <footer class="yuno-pied">
      <a class="lien-discret" href="#photo">Quitter le site</a>
    </footer>`;
}

// --- Le Carnet de terrain ----------------------------------------------------
// L'accueil du site affiche le vécu, jamais le social : matchs couverts,
// rencontres, œuvres finies. Aucune métrique de réseau n'entre ici — la
// première chose vue en ouvrant le site dit ce qui compte.

// Le même signe que le « + » du hub : un dessin, pas un caractère — il garde
// son épaisseur et son centrage quelle que soit la police.
const PLUS = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
  aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>`;

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

// Ce qu'un moment devient au dashboard du hub, où il arrive sans son carnet
// autour : « Match · OM-Lyon », ou « Match » tout court si le lieu manque. Le
// point médian plutôt qu'un tiret : les lieux en contiennent souvent un.
export function titreDuMoment({ type, lieu }) {
  const quoi = TYPES_MOMENT[type] ?? TYPES_MOMENT.autre;
  return lieu?.trim() ? `${quoi} · ${lieu.trim()}` : quoi;
}

// Les trois compteurs de l'accueil. Ils se calculent, ils ne se stockent pas :
// ce sont des faits accumulés, ils ne peuvent que monter. Les rencontres se
// comptent une par une, pas par personne — revoir quelqu'un au bord du terrain
// est un moment vécu de plus, pas un doublon.
export function compteursCarnet(moments) {
  return {
    moments: moments.length,
    rencontres: moments.reduce((somme, moment) => somme + (moment.rencontres?.length ?? 0), 0),
    oeuvres: moments.filter((moment) => moment.oeuvre_finie).length,
  };
}

export function construireCompteurs(moments) {
  const { moments: vecus, rencontres, oeuvres } = compteursCarnet(moments);
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
      ${compteur(oeuvres, 'Œuvres finies')}
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

function ligneRencontres(moment) {
  if (!moment.rencontres?.length) return '';

  const noms = moment.rencontres
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

// Le détail d'un moment, sans son enveloppe : le carnet l'enferme dans un
// <li>, la fenêtre ouverte depuis une vignette le pose tel quel.
// `fenetre` : dans une fenêtre volante, la croix de retrait tomberait juste
// sous celle qui ferme, au même bord — deux « × » dont l'un est irréversible.
// Le geste s'écrit alors, comme pour les idées de la banque.
function corpsMoment(moment, photos = {}, { fenetre = false } = {}) {
  const photo = moment.photo_chemin ? photos[moment.photo_chemin] : null;

  return `
      <span class="tuile-entete">
        <span class="etiquette">${echapper(TYPES_MOMENT[moment.type] ?? moment.type)}</span>
        ${moment.oeuvre_finie ? '<span class="etiquette etiquette-oeuvre">Œuvre finie</span>' : ''}
        <span class="discret quand">${echapper(echeanceLisible(depuisDateISO(moment.date)))}</span>
        ${
          fenetre
            ? ''
            : `<button type="button" class="lien-discret bouton-mini bouton-retirer"
                 data-supprimer-moment="${echapper(moment.id)}"
                 title="Retirer ce moment"
                 aria-label="Retirer « ${echapper(titreDuMoment(moment))} »">×</button>`
        }
      </span>
      ${moment.lieu ? `<span class="moment-lieu">${echapper(moment.lieu)}</span>` : ''}
      ${ligneRencontres(moment)}
      ${
        // La photo n'est plus dans la fiche du carnet : elle est déjà dans la
        // frise, juste au-dessus, et la fiche la répétait en grand. Elle reste
        // dans la fenêtre, qui est justement l'endroit où on l'a demandée.
        fenetre && photo
          ? `<a class="moment-image" href="${echapper(photo)}" target="_blank" rel="noopener">
               <img src="${echapper(photo)}" alt="La photo dont je suis fier"
                 loading="lazy"></a>`
          : ''
      }
      ${
        // Une phrase écrite avant que la photo puisse être jointe : elle reste.
        !photo && moment.photo_fiere
          ? `<span class="moment-photo"><span class="discret">La photo dont je suis fier</span><span>${echapper(
              moment.photo_fiere,
            )}</span></span>`
          : ''
      }
      ${moment.note ? `<span class="discret moment-note">${echapper(moment.note)}</span>` : ''}
      ${
        fenetre
          ? `<span class="moment-actions">
               <button type="button" class="bouton-icone"
                 data-modifier-moment="${echapper(moment.id)}"
                 title="Modifier ce moment"
                 aria-label="Modifier « ${echapper(titreDuMoment(moment))} »">${CRAYON}</button>
               <button type="button" class="lien-discret bouton-mini bouton-retirer"
                 data-supprimer-moment="${echapper(moment.id)}"
                 aria-label="Retirer « ${echapper(titreDuMoment(moment))} »"
                 >Retirer du carnet</button>
             </span>`
          : ''
      }`;
}

// Le formulaire de correction, dans la même fenêtre que la fiche. Il ne touche
// ni à la photo ni aux rencontres : l'une vit dans le stockage, les autres dans
// leur table, et chacune demande son propre geste. Corriger une date ou un lieu
// mal tapé est le besoin courant ; le reste attend d'être demandé.
function formulaireModifierMoment(moment) {
  return construireFormulaire({
    id: 'moment-edition',
    action: 'modifier-moment',
    bouton: 'Enregistrer',
    avecPli: false,
    extra: `<input type="hidden" name="id" value="${echapper(moment.id)}">`,
    champs: [
      { nom: 'date', libelle: 'Quand', type: 'date', valeur: moment.date, requis: true },
      { nom: 'type', libelle: 'Quoi', type: 'choix', options: TYPES_MOMENT, valeur: moment.type },
      { nom: 'lieu', libelle: 'Événement ou lieu', type: 'text', valeur: moment.lieu ?? '' },
      { nom: 'note', libelle: 'Note', type: 'textarea', valeur: moment.note ?? '' },
      {
        nom: 'photo',
        // Un champ fichier ne peut pas afficher son contenu actuel : le libellé
        // dit donc s'il y a déjà une photo, et ce qu'un nouveau fichier fera.
        libelle: moment.photo_chemin
          ? 'Remplacer la photo (laisser vide pour garder celle-ci)'
          : 'Ajouter une photo',
        type: 'file',
        accepte: 'image/*',
      },
      { nom: 'oeuvre_finie', libelle: 'Œuvre finie', type: 'checkbox', valeur: moment.oeuvre_finie },
    ],
  });
}

// La fiche complète d'un moment. Elle ne sert plus qu'au Journal — l'accueil
// est passé au mur de photos — donc le retrait y est toujours offert : c'est là
// qu'on gère.
function carteMoment(moment, photos = {}) {
  return `<li class="moment">${corpsMoment(moment, photos)}</li>`;
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

  const tirees = [...liste];
  for (let i = tirees.length - 1; i > 0; i -= 1) {
    const j = Math.floor(suivant() * (i + 1));
    [tirees[i], tirees[j]] = [tirees[j], tirees[i]];
  }
  return tirees;
}

// Les moments qui portent une photo dont l'adresse est déjà signée. Un moment
// sans photo n'a rien à faire dans un mur de photos.
function momentsIllustres(moments, photos) {
  return moments.filter((moment) => moment.photo_chemin && photos[moment.photo_chemin]);
}

// Le dessin d'un mur, une fois l'ordre décidé. Les deux murs du site — le
// tirage de l'accueil et la frise complète du Journal — n'en diffèrent que par
// cet ordre et par ce que la feuille de style laisse voir.
function vignettes(moments, photos, classes = 'mur-photos') {
  return `<ul class="${classes}">${moments
    .map((moment) => {
      const photo = photos[moment.photo_chemin];
      // Un bouton, pas un lien vers le fichier : le clic ouvre le moment —
      // son lieu, sa date, ses rencontres, sa note — et pas une image nue
      // dans un onglet vide.
      return `
        <li>
          <button type="button" data-ouvrir-moment="${echapper(moment.id)}"
            aria-label="Ouvrir « ${echapper(titreDuMoment(moment))} »">
            <img src="${echapper(photo)}" alt="${echapper(titreDuMoment(moment))}"
              loading="lazy" decoding="async">
          </button>
        </li>`;
    })
    .join('')}</ul>`;
}

const MUR_VIDE = `<p class="vide">Tes photos s'afficheront ici — joins-en une à ton prochain moment.</p>`;

// L'accueil ne montre plus des fiches de moments : il montre des photos. Une
// frise sur une seule ligne sous les compteurs — la preuve de ce qui a été
// vécu, pas son compte rendu. Le détail (lieu, rencontres, note) reste au
// Journal. Dix sont montées ; la feuille de style en laisse voir cinq ou dix
// selon la largeur.
export function construireMurPhotos(moments, photos = {}, jour = versDateISO(), limite = 10) {
  const avecPhoto = momentsIllustres(moments, photos);
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

  const moment = etat.moments.find((candidat) => candidat.id === etat.momentOuvert);
  if (!moment) return '';

  const contenu = etat.editionMoment
    ? `<h3 class="fenetre-titre">Modifier le moment</h3>${formulaireModifierMoment(moment)}`
    : `<div class="moment moment-complet">${corpsMoment(moment, etat.photos, { fenetre: true })}</div>`;

  return construireFenetre(titreDuMoment(moment), contenu);
}

export function construireMurComplet(moments, photos = {}) {
  const avecPhoto = momentsIllustres(moments, photos);
  if (!avecPhoto.length) return MUR_VIDE;

  const duPlusRecent = [...avecPhoto].sort(
    (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      String(b.created_at).localeCompare(String(a.created_at)),
  );

  return vignettes(duPlusRecent, photos, 'mur-photos mur-complet');
}

// Le Journal : le fil des moments, et rien d'autre (décision de Noé, 13 août
// 2026). Il portait aussi les victoires nées ailleurs — une tâche terminée, une
// commande livrée, un jalon atteint — et une ligne « Publier trois reels » au
// milieu des matchs couverts n'est pas du terrain. Un carnet de terrain se
// remplit dehors ; ce qui se coche à l'écran remonte au dashboard du hub, qui
// est fait pour ça, et se retire de là.
export function construireCarnet(moments, photos = {}) {
  if (!moments.length) {
    return `<p class="vide">Ton premier moment s'inscrit ici — un match, un concert, une sortie.</p>`;
  }

  const duPlusRecent = [...moments].sort(
    (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      String(b.created_at).localeCompare(String(a.created_at)),
  );

  return `<ul class="liste-carnet">${duPlusRecent.map((moment) => carteMoment(moment, photos)).join('')}</ul>`;
}

// La capture : deux champs suffisent, le reste attend qu'on ait envie. Ce qui
// compte est qu'elle se remplisse debout, en sortant du stade.
// `prefill` arrive quand l'invite du calendrier a été acceptée : la date et le
// lieu de l'événement sont déjà là, il ne reste qu'à raconter.
function formulaireMoment(contacts, prefill = null) {
  return construireFenetre(
    'Ajouter un moment',
    `<h3 class="fenetre-titre">Ajouter un moment</h3>
     ${construireFormulaire({
       id: 'moment',
       action: 'ajouter-moment',
       bouton: 'Inscrire au carnet',
       // Dans une fenêtre, le titre est déjà dit : le formulaire se rend nu.
       avecPli: false,
       champs: [
         { nom: 'date', libelle: 'Quand', type: 'date', valeur: prefill?.date ?? versDateISO() },
         { nom: 'type', libelle: 'Quoi', type: 'choix', options: TYPES_MOMENT, valeur: 'match' },
         { nom: 'lieu', libelle: 'Événement ou lieu', type: 'text', valeur: prefill?.lieu ?? '' },
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
         { nom: 'oeuvre_finie', libelle: 'Une œuvre finie', type: 'checkbox' },
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
  journal: { nature: 'tache' },
  creer: { nature: 'publication', natureEnDernier: true },
  banque: { nature: 'publication', natureEnDernier: true },
  editorial: { nature: 'publication', natureEnDernier: true },
  calendrier: { nature: 'evenement' },
  reseau: { contact: true },
  passerelle: { contact: true },
  carnet: { contact: true },
};

// Sur la page Créer, la nature passe en DERNIER : on vient y poster, et le
// réglage qu'on change le moins n'a pas à occuper la première place.
const reglagesDuPlus = (vue) => PLUS_PAR_VUE[vue] ?? { nature: 'tache' };

// Le bouton qui ouvre la capture. Il reste à sa place, à gauche des compteurs ;
// c'est la fenêtre qui vient par-dessus.
function boutonCapture() {
  return `
    <button type="button" class="bouton-capture" data-ouvrir-capture>
      <span class="bouton-capture-signe" aria-hidden="true">+</span> Ajouter un moment
    </button>`;
}

// --- Le rendez-vous stats ----------------------------------------------------
// On ne supprime pas un réflexe, on le remplace par un rituel. Les chiffres des
// réseaux n'existent nulle part ailleurs dans le site : ici, un jour par
// semaine, et le reste du temps un compte à rebours et rien d'autre.

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const CLE_JOUR_RDV = 'yuno-jour-rendez-vous';

export function jourRendezVousEnregistre() {
  try {
    const brut = localStorage.getItem(CLE_JOUR_RDV);
    const jour = Number(brut);
    return brut !== null && jour >= 0 && jour <= 6 ? jour : 0;
  } catch {
    return 0;
  }
}

function retenirJourRendezVous(jour) {
  try {
    localStorage.setItem(CLE_JOUR_RDV, String(jour));
  } catch {
    // Navigation privée : le réglage tient pour la visite.
  }
}

export function estJourDeRendezVous(jour, reference = new Date()) {
  return reference.getDay() === jour;
}

// 0 le jour même, 7 jamais : le rendez-vous suivant est toujours dans la semaine.
export function joursAvantRendezVous(jour, reference = new Date()) {
  return (jour - reference.getDay() + 7) % 7;
}

// Une courbe par mesure, jamais deux échelles sur un même axe : des abonnés et
// une portée hebdomadaire ne se comparent pas. Une seule série, donc pas de
// légende — le titre la nomme. Deux points minimum, sinon il n'y a pas de
// courbe, juste un chiffre.
export function construireCourbe(stats, cle, titre) {
  const points = stats.filter((ligne) => ligne[cle] !== null && ligne[cle] !== undefined);

  if (points.length < 2) {
    return `<p class="vide">${echapper(titre)} — la courbe se dessine à partir du deuxième rendez-vous.</p>`;
  }

  const largeur = 320;
  const hauteur = 72;
  const marge = 10;
  const valeurs = points.map((ligne) => Number(ligne[cle]));
  const bas = Math.min(...valeurs);
  const haut = Math.max(...valeurs);
  const etendue = haut - bas || 1;

  const abscisse = (index) => marge + (index * (largeur - 2 * marge)) / (points.length - 1);
  const ordonnee = (valeur) =>
    hauteur - marge - ((valeur - bas) / etendue) * (hauteur - 2 * marge);

  const chemin = points
    .map((ligne, index) => `${index ? 'L' : 'M'}${abscisse(index).toFixed(1)} ${ordonnee(Number(ligne[cle])).toFixed(1)}`)
    .join(' ');

  const pastilles = points
    .map(
      (ligne, index) => `
      <circle cx="${abscisse(index).toFixed(1)}" cy="${ordonnee(Number(ligne[cle])).toFixed(1)}" r="4"
        class="courbe-point"><title>${echapper(
          `${ligne.date} — ${ligne[cle]}`,
        )}</title></circle>`,
    )
    .join('');

  const premier = valeurs[0];
  const dernier = valeurs[valeurs.length - 1];

  return `
    <figure class="courbe">
      <figcaption>${echapper(titre)}</figcaption>
      <svg viewBox="0 0 ${largeur} ${hauteur}" class="courbe-dessin" role="img"
        aria-label="${echapper(`${titre} : de ${premier} à ${dernier} sur ${points.length} rendez-vous.`)}">
        <path d="${chemin}" class="courbe-trait" fill="none"/>
        ${pastilles}
      </svg>
      <span class="discret courbe-bornes">
        <span class="chiffre">${premier}</span> au premier rendez-vous ·
        <span class="chiffre">${dernier}</span> au dernier
      </span>
    </figure>`;
}

function formulaireStats() {
  return construireFormulaire({
    id: 'stats',
    libelle: 'Remplir le rendez-vous',
    action: 'noter-stats',
    bouton: 'Enregistrer et refermer',
    ouvert: true,
    champs: [
      { nom: 'abonnes', libelle: 'Abonnés', type: 'number' },
      { nom: 'reach', libelle: 'Portée de la semaine', type: 'number' },
      { nom: 'top_post', libelle: 'Le post qui a le mieux marché', type: 'text' },
      {
        nom: 'reponse_rituelle',
        libelle: "Est-ce que ça change quelque chose à mes actions cette semaine ? (« non » est une réponse)",
        type: 'textarea',
        requis: true,
      },
    ],
  });
}

export function construireRendezVous(etat, reference = new Date()) {
  const jour = etat.jourRdv;

  const reglage = `
    <label class="rdv-reglage">
      <span class="discret">Jour du rendez-vous</span>
      <select data-jour-rdv>
        ${JOURS.map(
          (nom, index) =>
            `<option value="${index}" ${index === jour ? 'selected' : ''}>${nom}</option>`,
        ).join('')}
      </select>
    </label>`;

  if (!estJourDeRendezVous(jour, reference)) {
    const reste = joursAvantRendezVous(jour, reference);
    // Rien d'autre ici : pas un chiffre, pas une courbe, pas un aperçu.
    return `
      <div class="rdv-ferme">
        <p class="rdv-attente">Rendez-vous <strong>${JOURS[jour]}</strong> —
          ${reste === 1 ? 'demain' : `dans <strong>${reste} jours</strong>`}.</p>
        <p class="discret">Les chiffres attendent là. D'ici là, la suite se passe dehors.</p>
        ${reglage}
      </div>`;
  }

  const dejaFait = etat.stats.some((ligne) => ligne.date === versDateISO(reference));

  return `
    <div class="rdv-ouvert">
      ${
        dejaFait
          ? `<p class="rdv-attente">C'est fait pour cette semaine. À ${JOURS[jour]} prochain.</p>`
          : formulaireStats()
      }
      <div class="rdv-historique">
        ${construireCourbe(etat.stats, 'abonnes', 'Abonnés')}
        ${construireCourbe(etat.stats, 'reach', 'Portée hebdomadaire')}
      </div>
      ${reglage}
    </div>`;
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
export function evenementsARattraper(evenements, moments, ecartes = [], reference = new Date()) {
  const debut = versDateISO(ajouterJours(reference, -7));
  const jaLogue = new Set(moments.map((moment) => moment.date));

  return evenements
    .filter((evenement) => {
      const quand = new Date(evenement.date_debut);
      const jour = versDateISO(quand);
      return quand <= reference && jour >= debut && !jaLogue.has(jour) && !ecartes.includes(evenement.id);
    })
    .sort((a, b) => String(b.date_debut).localeCompare(String(a.date_debut)));
}

function construireInvite(etat) {
  // Une seule à la fois : trois invites empilées, c'est une liste de reproches.
  const [evenement] = evenementsARattraper(etat.evenements, etat.moments, etat.ecartes);
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

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}

    <section class="bloc">
      ${construireInvite(etat)}
      <div class="carnet-entete">
        ${boutonCapture()}
        ${construireCompteurs(etat.moments)}
      </div>
      <!-- Le mur suit les compteurs sans titre au-dessus : dix photos n'ont
           besoin de personne pour dire ce qu'elles sont. Pas de porte vers le
           Journal non plus — il est dans la barre, comme Créer. -->
      <div data-bloc="mur-photos">${construireMurPhotos(etat.moments, etat.photos)}</div>
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
    ${enTete('journal')}

    <section class="bloc">
      ${construireInvite(etat)}
      <div class="carnet-entete">
        ${boutonCapture()}
        ${construireCompteurs(etat.moments)}
      </div>
      <!-- Le même mur qu'à l'accueil, mais entier et dans l'ordre du temps :
           ici on cherche une photo qu'on a prise, on ne se laisse pas
           surprendre par un tirage. -->
      <div data-bloc="mur-complet">${construireMurComplet(etat.moments, etat.photos)}</div>
    </section>

    <section class="bloc">
      <h2>Le carnet de terrain</h2>
      <div data-bloc="carnet">${construireCarnet(etat.moments, etat.photos)}</div>
    </section>
    ${fenetreMoment(etat)}
    ${pied()}`;
}

// Le tirage de la semaine. Avec match, le terrain est là : on le montre
// (piliers 1 et 2). Sans match, l'éducatif ne dépend d'aucun calendrier, il
// passe devant (pilier 3). `hasard` est un paramètre pour que le tirage se
// vérifie sans dépendre de la chance.
export function tirerIdee(publications, { avecMatch = true } = {}, hasard = Math.random) {
  const banque = publications.filter((pub) => !pub.date_prevue && pub.statut !== 'publie');
  if (!banque.length) return null;

  const prefere = avecMatch ? [1, 2] : [3];
  const prefereesDabord = [
    banque.filter((pub) => prefere.includes(pub.pilier)),
    // À défaut, n'importe quel autre pilier — sans ordre entre eux.
    banque.filter((pub) => pub.pilier && !prefere.includes(pub.pilier)),
  ];

  for (const lot of prefereesDabord) {
    if (lot.length) return lot[Math.floor(hasard() * lot.length)];
  }

  // Aucune idée n'a encore de pilier : on tire quand même. Proposer quelque
  // chose vaut mieux que renvoyer à un classement pas fait.
  return banque[Math.floor(hasard() * banque.length)];
}

export function filtrerBanque(publications, { pilier = 'tout', statutIdee = 'tout' } = {}) {
  return publications.filter((pub) => {
    if (pilier !== 'tout' && String(pub.pilier ?? '') !== pilier) return false;
    if (statutIdee !== 'tout' && pub.statut !== statutIdee) return false;
    return true;
  });
}

function etiquettePilier(rang) {
  return `<span class="etiquette etiquette-pilier">${echapper(
    `${rang}. ${PILIERS[rang]?.nom ?? ''}`,
  )}</span>`;
}

export function construireTirage(tirage) {
  if (!tirage) return '';
  if (!tirage.idee) {
    return `<p class="vide">La banque est vide pour l'instant. Note une idée, même bancale.</p>`;
  }

  const { idee } = tirage;
  return `
    <div class="tirage-idee">
      <span class="tuile-entete">
        ${idee.pilier ? etiquettePilier(idee.pilier) : ''}
        <span class="discret quand">${tirage.avecMatch ? 'semaine avec match' : 'semaine sans match'}</span>
      </span>
      <span class="pub-titre">${echapper(idee.titre)}</span>
      ${idee.preuve ? `<span class="discret pub-preuve">${echapper(idee.preuve)}</span>` : ''}
    </div>`;
}

function blocTirage(etat) {
  return `
    <details class="tirage" ${etat.tirage ? 'open' : ''}>
      <summary>Je ne sais pas quoi poster</summary>
      <p class="discret">Cette semaine, il y a un match ?</p>
      <div class="tirage-choix">
        <button type="button" class="bouton-secondaire bouton-mini" data-tirer="avec">
          Oui, il y a un match</button>
        <button type="button" class="bouton-secondaire bouton-mini" data-tirer="sans">
          Non, pas de match</button>
      </div>
      <div data-bloc="tirage">${construireTirage(etat.tirage)}</div>
    </details>`;
}

// Noter une idée s'ouvre en fenêtre volante, comme la capture d'un moment : le
// geste est le même partout dans le site. Le formulaire sort de son dépliant —
// dans une fenêtre, le titre est déjà dit.
function fenetreNoterIdee(etat) {
  return construireFenetre(
    'Noter une idée',
    `<h3 class="fenetre-titre">Noter une idée</h3>
     ${formulaireIdee({
       publications: etat.publications,
       rubriquesDepart: RUBRIQUES_DEPART,
       reseaux: RESEAUX_YUNO,
       avecPli: false,
       champsEnPlus: [
         {
           nom: 'pilier',
           libelle: 'Pilier',
           type: 'choix',
           options: {
             '': 'Sans pilier',
             ...Object.fromEntries(
               Object.entries(PILIERS).map(([rang, { nom }]) => [rang, `${rang}. ${nom}`]),
             ),
           },
           valeur: '',
         },
         { nom: 'preuve', libelle: 'Preuve — pourquoi ce format marche déjà (facultatif)', type: 'text' },
         { nom: 'pourquoi_moi', libelle: 'Pourquoi chez moi (facultatif)', type: 'text' },
       ],
     })}`,
  );
}

function vueCreer(etat) {
  // Ce qui distingue Créer chez Yuno : son cycle, sa checklist, ses piliers.
  const options = { cycle: STATUTS_YUNO, checklist: true, piliers: PILIERS };

  return `
    ${enTete('creer')}
    ${
      etat.cloture
        ? `<p class="note-cloture">C'est posté. Ferme l'app, la suite se passe dehors.</p>`
        : ''
    }

    <section class="bloc">
      <h2>Les quatre piliers</h2>
      ${construirePiliers()}
    </section>

    <section class="bloc">
      <!-- Les deux façons d'attaquer : j'ai une idée, ou je n'en ai pas. Elles
           se valent, donc elles sont côte à côte et de la même taille. Noter
           passe par une fenêtre volante, comme la capture d'un moment — le
           geste est le même partout dans le site. -->
      <div class="deux-gestes">
        <button type="button" class="bouton-geste" data-ouvrir-note-idee>Noter une idée</button>
        ${blocTirage(etat)}
      </div>

      <!-- Les deux lieux de l'atelier, côte à côte et sans titre au-dessus :
           une icône et deux mots disent déjà où l'on va. Un libellé de section
           qui répète le nom de la porte n'ajoute rien. -->
      <div class="grandes-portes">
        <a class="grande-porte" href="#yuno/editorial">
          <span class="grande-porte-icone" aria-hidden="true">${CALENDRIER}</span>
          <span class="grande-porte-titre">Calendrier<br>éditorial</span>
        </a>
        <a class="grande-porte" href="#yuno/banque">
          <span class="grande-porte-icone" aria-hidden="true">${AMPOULE}</span>
          <span class="grande-porte-titre">Banque<br>d'idées</span>
        </a>
      </div>
    </section>
    ${etat.noteIdeeOuverte ? fenetreNoterIdee(etat) : ''}

    <section class="bloc">
      <h2>À venir</h2>
      <div data-bloc="a-venir">${construireAVenir(etat.publications, options)}</div>
    </section>

    <section class="bloc bloc-discret">
      <h2>Rendez-vous stats</h2>
      <div data-bloc="rendez-vous">${construireRendezVous(etat)}</div>
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
    ${enTete('banque')}

    <section class="bloc">
      <h2>Banque d'idées</h2>
      <p class="discret banque-intro">Le backlog créatif. Il ne se vide jamais,
        et il ne réclame rien.</p>

      <div class="barre-banque">
        <label>
          <span class="discret">Pilier</span>
          <select data-filtre-pilier>
            <option value="tout" ${etat.pilier === 'tout' ? 'selected' : ''}>Tous</option>
            ${Object.entries(PILIERS)
              .map(
                ([rang, { nom }]) =>
                  `<option value="${rang}" ${etat.pilier === rang ? 'selected' : ''}>${rang}. ${echapper(nom)}</option>`,
              )
              .join('')}
            <option value="" ${etat.pilier === '' ? 'selected' : ''}>Sans pilier</option>
          </select>
        </label>
        <label>
          <span class="discret">Statut</span>
          <select data-filtre-statut-idee>
            <option value="tout" ${etat.statutIdee === 'tout' ? 'selected' : ''}>Tous</option>
            ${STATUTS_YUNO.filter((statut) => statut !== 'publie')
              .map(
                (statut) =>
                  `<option value="${statut}" ${etat.statutIdee === statut ? 'selected' : ''}>${NOMS_STATUTS[statut]}</option>`,
              )
              .join('')}
          </select>
        </label>
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
    ${enTete('editorial')}
    <h2 class="titre-page">Calendrier éditorial</h2>
    ${construireBarrePeriode(etat.vueCal, etat.ancreCal)}

    <div class="editorial">
      <div class="editorial-grille" data-bloc="calendrier">
        ${
          etat.vueCal === 'agenda'
            ? construireCalendrier(programmees, natures)
            : construireGrille(programmees, natures, etat.vueCal, etat.ancreCal, {
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
                        ? `<span class="etiquette etiquette-pilier">${echapper(
                            String(pub.pilier),
                          )}</span>`
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

function vueCalendrier(etat) {
  const elements = elementsDuCalendrier(etat);

  return `
    ${enTete('calendrier')}
    ${construireBarrePeriode(etat.vueCal, etat.ancreCal)}
    ${construireFiltres(etat.natures)}
    <div data-bloc="calendrier">
      ${
        etat.vueCal === 'agenda'
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

const PHASES_PREPA = { avant: 'Avant', pendant: 'Pendant', apres: 'Après' };

// La ligne reprend la forme des tâches — même cercle, même coche : un geste se
// reconnaît sans réfléchir. Pas de priorité ici, le cercle reste gris.
function lignePreparation(item) {
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
function blocPhase(feuille, phase) {
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
          placeholder="${phase === 'pendant' ? 'Ajouter un plan…' : 'Ajouter…'}">
        <button type="submit" class="bouton-secondaire bouton-mini">Ajouter</button>
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

// Le bilan attend que la sortie soit vécue : avant sa date, la feuille dit
// juste qu'il viendra. Une feuille sans date l'offre tout de suite.
function blocBilan(feuille) {
  const ouvert = !feuille.date || feuille.date <= versDateISO();

  if (!ouvert) {
    return `
      <section class="bloc prepa-bilan">
        <h2>Bilan</h2>
        <p class="vide">Il s'écrira une fois la sortie vécue.</p>
      </section>`;
  }

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
        <button type="submit">${feuille.bilan_date ? 'Mettre à jour le bilan' : 'Enregistrer le bilan'}</button>
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </section>`;
}

function vueFeuille(etat, feuille) {
  const precedent = feuille.bilan_date ? null : dernierBilan(etat.preparations, feuille);

  return `
    ${enTete('preparations')}
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
    <div class="prepa-phases">
      ${blocPhase(feuille, 'avant')}
      ${blocPhase(feuille, 'pendant')}
      ${blocPhase(feuille, 'apres')}
    </div>
    ${blocBilan(feuille)}
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
    ${enTete('preparations')}
    <h2 class="titre-page">Préparations</h2>
    <section class="bloc">
      ${
        etat.preparations.length
          ? `<ul class="liste-preparations">${etat.preparations
              .map(
                (candidat) => `
              <li><a class="prepa-ligne" href="#yuno/preparations/${echapper(candidat.id)}">
                <span class="prepa-ligne-titre">${echapper(candidat.titre)}</span>
                <span class="discret">${
                  candidat.date
                    ? echapper(echeanceLisible(depuisDateISO(candidat.date)))
                    : ''
                }</span>
              </a></li>`,
              )
              .join('')}</ul>`
          : `<p class="vide">Ta première préparation s'ouvrira ici — depuis un événement
               du calendrier, touche « Préparer ».</p>`
      }
    </section>
    ${pied()}`;
}

// Ce que la fenêtre de détail d'un événement propose en plus : le préparer, ou
// rouvrir sa feuille si elle existe déjà.
function actionsPreparation(etat) {
  const element = etat.detailCal;
  if (!element || element.type !== 'evenement') return '';

  const feuille = etat.preparations.find((candidat) => candidat.evenement_id === element.id);
  return feuille
    ? `<button type="button" class="bouton-secondaire bouton-mini"
         data-ouvrir-preparation="${echapper(feuille.id)}">Ouvrir la préparation</button>`
    : `<button type="button" class="bouton-secondaire bouton-mini"
         data-preparer-evenement="${echapper(element.id)}">Préparer</button>`;
}

// --- Le réseau --------------------------------------------------------
// Ce qu'une fiche doit rendre en trois secondes : le contact, et à qui la
// personne est rattachée (docs/yuno-spec.md, §4).

const TYPES_CONTACT = {
  joueur: 'Joueur',
  club: 'Club',
  media: 'Média',
  agence: 'Agence',
  marque: 'Marque',
  autre: 'Autre',
};

// Où en est la relation. Repris du tableau Notion de Noé, dans son ordre de
// progression : c'est lui qui fait du carnet un CRM plutôt qu'un annuaire.
// Chaque statut a sa teinte fixe — aucune ne signale une alerte.
const STATUTS_CONTACT = {
  pas_de_contact: { nom: 'Pas de contact', teinte: null },
  message_envoye: { nom: 'Message envoyé', teinte: 215 },
  relance: { nom: 'Relancé', teinte: 255 },
  repondu: { nom: 'Répondu', teinte: 195 },
  // Doré pour « établi », vert pour « bon » — l'ordre du tableau Notion de Noé.
  contact_etabli: { nom: 'Contact établi', teinte: 42 },
  bon_contact: { nom: 'Bon contact', teinte: 152 },
  opportunite: { nom: 'Opportunité', teinte: 310 },
};

// Les trois micro-doses de l'aller-vers, de la plus sûre à la plus grande. La
// peur du rejet ne se contourne pas, elle s'entraîne : d'où la gradation.
const NIVEAUX = {
  1: { nom: 'Répondre', aide: 'Des messages reçus qui attendent.' },
  2: { nom: 'Relancer', aide: 'Des relations vivantes, à entretenir.' },
  3: { nom: 'Ouvrir', aide: 'Des portes à pousser. Le plus grand pas.' },
};

// Où va la relation après un envoi de plus. Une relation vivante ne redescend
// jamais : écrire à quelqu'un qui a répondu ne le ramène pas à « relancé ».
export function statutApresEnvoi(statut) {
  if (!statut || statut === 'pas_de_contact') return 'message_envoye';
  if (statut === 'message_envoye' || statut === 'relance') return 'relance';
  return statut;
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
    texte: (contact) => (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? '',
    cellule: (contact) => {
      const statut = STATUTS_CONTACT[contact.statut] ?? { nom: contact.statut, teinte: null };
      // Sans teinte, une classe plutôt qu'une variable : une règle de classe se
      // laisse porter à la bonne spécificité sur les sites, pas une variable.
      const habillage =
        statut.teinte === null
          ? 'class="choix-statut choix-statut-neutre"'
          : `class="choix-statut" style="--h: ${statut.teinte}"`;

      return `<select ${habillage} data-statut="${echapper(contact.id)}"
        aria-label="Relation avec ${echapper(contact.nom)}">
        ${Object.entries(STATUTS_CONTACT)
          .map(
            ([valeur, { nom }]) =>
              `<option value="${valeur}" ${valeur === contact.statut ? 'selected' : ''}>${nom}</option>`,
          )
          .join('')}
      </select>`;
    },
    filtre: {
      cle: (contact) => contact.statut ?? '',
      libelle: (contact) => (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? contact.statut ?? '',
      // Les statuts se rangent dans leur progression, pas par ordre alphabétique.
      ordre: (contact) => Object.keys(STATUTS_CONTACT).indexOf(contact.statut),
    },
  },
  {
    cle: 'niveau',
    titre: 'Niveau',
    // Le niveau se trie sur la gradation : 1 est plus proche que 3.
    valeur: (contact) => (contact.niveau ? String(contact.niveau) : ''),
    texte: (contact) => (NIVEAUX[contact.niveau] ?? {}).nom ?? '',
    cellule: (contact) => `<select class="choix-niveau" data-niveau="${echapper(contact.id)}"
      aria-label="Niveau d'aller-vers pour ${echapper(contact.nom)}">
      <option value="">—</option>
      ${Object.entries(NIVEAUX)
        .map(
          ([valeur, { nom }]) =>
            `<option value="${valeur}" ${
              String(contact.niveau) === valeur ? 'selected' : ''
            }>${valeur} ${nom}</option>`,
        )
        .join('')}
    </select>`,
    filtre: {
      cle: (contact) => (contact.niveau ? String(contact.niveau) : ''),
      libelle: (contact) =>
        contact.niveau ? `${contact.niveau} ${NIVEAUX[contact.niveau].nom}` : 'Hors file',
      // Les sans-niveau en dernier : ils ne sont pas un quatrième niveau.
      ordre: (contact) => contact.niveau ?? 9,
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

      return `
        <span class="puce-filtre ${choisi === 'tout' ? '' : 'actif'}">
          <label>
            <span class="discret">${echapper(colonne.titre)}</span>
            <select data-filtre-colonne="${colonne.cle}">
              <option value="tout">Tous</option>
              ${choix
                .map(
                  ({ cle, libelle, compte }) =>
                    `<option value="${echapper(cle)}" ${cle === choisi ? 'selected' : ''}>${echapper(
                      libelle,
                    )} (${compte})</option>`,
                )
                .join('')}
            </select>
          </label>
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
              (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? contact.statut,
              (STATUTS_CONTACT[contact.statut] ?? {}).teinte,
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
// Un troisième dessin de la même base, pas un module à part : la file d'action
// de la semaine, groupée par micro-dose. La métrique est le nombre de messages
// ENVOYÉS — ce que Noé contrôle. Ni taux de réponse, ni compte de silences :
// si le compteur dépendait des réponses, chaque silence deviendrait un rejet
// mesuré.

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

// Dans la file, une case vide passe DEVANT — au rebours du tableau. « Jamais
// écrit » est ce qui attend le plus, pas ce qui est le plus ancien.
function ordreDeLaFile(a, b) {
  const da = a.date_dernier_envoi ?? '';
  const db = b.date_dernier_envoi ?? '';
  if (da === db) return a.nom.localeCompare(b.nom, 'fr');
  if (!da) return -1;
  if (!db) return 1;
  return da.localeCompare(db);
}

function carteFile(contact) {
  const liens = [lienInstagram(contact), lienEmail(contact), lienTelephone(contact)].filter(
    Boolean,
  );
  const statut = STATUTS_CONTACT[contact.statut] ?? { nom: contact.statut, teinte: null };

  return `
    <li>
      <span class="tuile-entete">
        ${
          contact.structure
            ? `<span class="contact-structure">${echapper(contact.structure)}</span>`
            : ''
        }
        ${pastilleTexte(statut.nom, statut.teinte)}
        ${
          contact.date_dernier_envoi
            ? `<span class="discret quand">écrit ${echapper(
                echeanceLisible(depuisDateISO(contact.date_dernier_envoi)),
              )}</span>`
            : ''
        }
      </span>
      <span class="contact-nom">${echapper(contact.nom)}</span>
      <input class="champ-vif" type="text" data-objectif-contact="${echapper(contact.id)}"
        value="${echapper(contact.objectif ?? '')}" placeholder="Pourquoi ce contact ?"
        aria-label="Objectif pour ${echapper(contact.nom)}">
      <span class="file-suite">
        <input class="champ-vif" type="text" data-prochaine-action="${echapper(contact.id)}"
          value="${echapper(contact.prochaine_action ?? '')}" placeholder="Prochaine action"
          aria-label="Prochaine action pour ${echapper(contact.nom)}">
        <input class="champ-vif champ-date" type="date" data-prochaine-date="${echapper(contact.id)}"
          value="${echapper(contact.prochaine_action_date ?? '')}"
          aria-label="Quand, pour ${echapper(contact.nom)}">
      </span>
      <span class="pub-actions">
        ${liens.length ? `<span class="contact-liens">${joindre(liens)}</span>` : ''}
        <button type="button" class="bouton-secondaire bouton-mini bouton-envoye"
          data-envoye="${echapper(contact.id)}">Envoyé ✓</button>
      </span>
    </li>`;
}

export function construireMetrique(envois, objectifDoux, reference = new Date()) {
  const semaine = envoisDeLaSemaine(envois, reference);

  return `
    <div class="passerelle-metrique">
      <span class="metrique">
        <span class="chiffre">${envois.length}</span>
        <span class="discret">messages envoyés</span>
      </span>
      <span class="metrique">
        <span class="chiffre">${semaine}</span>
        <span class="discret">cette semaine</span>
      </span>
      <label class="metrique-objectif">
        <span class="discret">Objectif doux</span>
        <select data-objectif-doux>
          ${[1, 2, 3, 5]
            .map(
              (valeur) =>
                `<option value="${valeur}" ${valeur === objectifDoux ? 'selected' : ''}>${valeur} / semaine</option>`,
            )
            .join('')}
        </select>
      </label>
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

export function construirePasserelle(contacts, { envois = [], objectifDoux = 1, modeles = [] } = {}) {
  const groupes = Object.entries(NIVEAUX)
    .map(([niveau, { nom, aide }]) => ({
      niveau,
      nom,
      aide,
      dedans: contacts.filter((contact) => String(contact.niveau) === niveau).sort(ordreDeLaFile),
    }))
    .map(
      ({ niveau, nom, aide, dedans }) => `
      <section class="file-niveau">
        <h3><span class="file-rang chiffre">${niveau}</span> ${echapper(nom)}
          ${dedans.length ? `<span class="discret file-compte chiffre">${dedans.length}</span>` : ''}
        </h3>
        <p class="discret file-aide">${echapper(aide)}</p>
        ${
          dedans.length
            ? `<ul>${dedans.map(carteFile).join('')}</ul>`
            : `<p class="vide">Personne ici pour l'instant.</p>`
        }
      </section>`,
    )
    .join('');

  return `
    ${construireMetrique(envois, objectifDoux)}
    <div class="passerelle-file">${groupes}</div>
    <p class="discret note-file">Un contact entre dans la file quand tu lui donnes un niveau —
      depuis la colonne « Niveau » du tableau.</p>
    ${construireModeles(modeles)}`;
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
           { nom: 'structure', libelle: 'Structure', type: 'text', valeur: contact.structure ?? '' },
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
           (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? contact.statut,
           (STATUTS_CONTACT[contact.statut] ?? {}).teinte,
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
function vueReseau(etat) {
  const dansLaFile = etat.contacts.filter((contact) => contact.niveau).length;

  return `
    ${enTete('reseau')}

    <section class="bloc">
      <h2>Le réseau</h2>
      <div class="portes">
        <a class="lien-externe" href="#yuno/passerelle">
          <span class="lien-externe-texte">
            <span class="lien-externe-titre">La Passerelle</span>
            <span class="discret">${
              dansLaFile
                ? `<span class="chiffre">${dansLaFile}</span> dans la file · <span class="chiffre">${etat.envois.length}</span> messages envoyés`
                : "La file d'aller-vers, à remplir depuis le réseau"
            }</span>
          </span>
        </a>

        <a class="lien-externe" href="#yuno/carnet">
          <span class="lien-externe-texte">
            <span class="lien-externe-titre">CRM</span>
            <span class="discret"><span class="chiffre">${etat.contacts.length}</span> fiches ·
              tableau, fiches, filtres</span>
          </span>
        </a>
      </div>
    </section>

    ${blocCommandes(etat)}
    ${pied()}`;
}

// La Passerelle : la file d'action, et rien d'autre. Pas de panneau de
// colonnes ici — on n'y range pas, on y écrit.
function vuePasserelle(etat) {
  return `
    ${enTete('passerelle')}

    <section class="bloc">
      <h2>La Passerelle</h2>
      <input type="search" id="recherche-contact" class="recherche"
        placeholder="Chercher dans la file…"
        value="${echapper(etat.rechercheContact)}">
      <div data-bloc="contacts">${construirePasserelle(
        baseContacts(etat.contacts, optionsBase(etat)),
        optionsBase(etat),
      )}</div>
    </section>
    ${pied()}`;
}

function vueCarnet(etat) {
  return `
    ${enTete('carnet')}

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

      ${construireFormulaire({
        id: 'contact',
        libelle: 'Ajouter au réseau',
        action: 'creer-contact',
        champs: CHAMPS_CONTACT,
      })}
    </section>
    ${pied()}`;
}

// Les champs d'une fiche du réseau, écrits une fois : le pli du bas de la page
// et la fenêtre du « + » posent les mêmes.
function champsContact() {
  return [
    { nom: 'nom', libelle: 'Nom', type: 'text', requis: true },
    { nom: 'type', libelle: 'Type', type: 'choix', options: TYPES_CONTACT, valeur: 'joueur' },
    { nom: 'structure', libelle: 'Rattaché à (FC Lorient, OM, La Provence…)', type: 'text' },
    { nom: 'instagram', libelle: 'Instagram', type: 'text' },
    { nom: 'email', libelle: 'E-mail', type: 'text' },
    { nom: 'telephone', libelle: 'Téléphone', type: 'text' },
    { nom: 'statut', libelle: 'Relation', type: 'choix',
      options: Object.fromEntries(
        Object.entries(STATUTS_CONTACT).map(([v, { nom }]) => [v, nom]),
      ),
      valeur: 'pas_de_contact' },
    { nom: 'objectif', libelle: 'Pourquoi ce contact ? (facultatif)', type: 'text' },
    { nom: 'niveau', libelle: "Dans la file d'aller-vers ?", type: 'choix',
      options: {
        '': 'Pas dans la file',
        ...Object.fromEntries(
          Object.entries(NIVEAUX).map(([v, { nom }]) => [v, `${v} ${nom}`]),
        ),
      },
      valeur: '' },
    { nom: 'notes', libelle: 'Notes', type: 'textarea' },
  ];
}

const CHAMPS_CONTACT = champsContact();

// La fenêtre du « + » sur les pages du réseau : la même fiche, dans une fenêtre
// volante. L'identifiant du formulaire diffère de celui du pli — deux mêmes
// `id` sur une page, ce sont des étiquettes qui désignent le mauvais champ.
function formulaireNouveauContact() {
  return construireFenetre(
    'Ajouter au réseau',
    `<h3 class="fenetre-titre">Ajouter au réseau</h3>
     ${construireFormulaire({
       id: 'contact-nouveau',
       action: 'creer-contact',
       bouton: 'Ajouter au réseau',
       avecPli: false,
       champs: CHAMPS_CONTACT,
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

export function construireCommandes(commandes) {
  const ouvertes = commandes.filter((commande) => ['devis', 'en_cours'].includes(commande.statut));
  const closes = commandes.filter((commande) => ['livree', 'payee'].includes(commande.statut));

  const tuile = (commande) => {
    const suivant = CYCLE_COMMANDE[CYCLE_COMMANDE.indexOf(commande.statut) + 1];

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

function blocCommandes(etat) {
  return `
    <section class="bloc">
      <h2>Commandes</h2>
      <div data-bloc="commandes">${construireCommandes(etat.commandes)}</div>
      ${construireFormulaire({
        id: 'commande',
        libelle: 'Ajouter une commande',
        action: 'creer-commande',
        champs: [
          { nom: 'titre', libelle: 'Commande', type: 'text', requis: true },
          // Le client se relie au carnet quand le nom y figure — même geste que
          // les rencontres du Journal, et le carnet reste la source des noms.
          {
            nom: 'client',
            libelle: 'Client',
            type: 'text',
            suggestions: etat.contacts.map((contact) => contact.nom),
          },
          { nom: 'statut', libelle: 'Où en est-elle', type: 'choix',
            options: STATUTS_COMMANDE, valeur: 'devis' },
          { nom: 'echeance', libelle: 'À livrer pour (facultatif)', type: 'date' },
          { nom: 'montant', libelle: 'Montant en euros (facultatif)', type: 'number' },
          { nom: 'lien_livrable', libelle: 'Lien du livrable (facultatif)', type: 'text' },
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>`;
}

// --- Montage ----------------------------------------------------------------

// Où chaque morceau de l'état va se chercher. Une source rend l'objet à fondre
// dans l'état, pas une liste nue : les moments ramènent leurs photos avec eux,
// et le reste du code n'a pas à savoir que ces deux-là voyagent ensemble.
const SOURCES = {
  objectifs: async () => ({ objectifs: await api.objectifsActifs({ projet: 'photo' }) }),
  publications: async () => ({ publications: await api.publicationsToutes('photo') }),
  taches: async () => ({ taches: await api.tachesDatees({ projet: 'photo' }) }),
  // Tous les événements : la grille se promène dans le passé, et l'invite du
  // Carnet y puise la semaine écoulée.
  evenements: async () => ({ evenements: await api.evenementsTous({ projet: 'photo' }) }),
  contacts: async () => ({ contacts: await api.contactsTous() }),
  commandes: async () => ({ commandes: await api.commandesToutes() }),
  envois: async () => ({ envois: await api.envoisTous() }),
  modeles: async () => ({ modeles: await api.modelesTous() }),
  stats: async () => ({ stats: await api.statsHebdoTous() }),
  preparations: async () => ({ preparations: await api.preparationsToutes() }),
  moments: async () => {
    const moments = await api.momentsTous();
    // Les photos vivent dans un bucket privé : leurs adresses se signent à la
    // lecture, toutes ensemble.
    const chemins = moments.map((moment) => moment.photo_chemin).filter(Boolean);
    return {
      moments,
      photos: chemins.length ? await api.urlsDesPhotos(chemins) : {},
      photosLe: Date.now(),
    };
  },
};

// Ce dont chaque vue a besoin pour se dessiner — et rien de plus. Les onze
// requêtes partaient ensemble à l'ouverture ; l'accueil en demande cinq, la
// banque une seule. Le reste arrive quand on va le voir.
//
// Une clé qui manque ici, c'est un écran vide affiché à la place de données qui
// existent : quand une vue gagne un bloc, sa ligne se relit.
const BESOINS = {
  accueil: ['moments', 'evenements', 'objectifs', 'publications', 'contacts'],
  journal: ['moments', 'evenements', 'contacts'],
  creer: ['publications', 'stats'],
  banque: ['publications'],
  editorial: ['publications'],
  // Le calendrier lit aussi les préparations : la fenêtre d'un événement doit
  // savoir s'il a déjà sa feuille pour dire « Préparer » ou « Ouvrir ».
  calendrier: ['evenements', 'taches', 'objectifs', 'publications', 'commandes', 'contacts', 'preparations'],
  reseau: ['contacts', 'envois', 'commandes'],
  passerelle: ['contacts', 'envois', 'modeles'],
  carnet: ['contacts', 'envois', 'modeles'],
  preparations: ['preparations'],
};

const CLE_CACHE = 'yuno';

// Les adresses des photos sont signées une heure (api.urlsDesPhotos). Passé ce
// délai on ne ressort pas le mur du cache : un mur d'images mortes vaut moins
// qu'un écran qui attend. La marge couvre l'onglet resté ouvert.
const SIGNATURE_UTILE = 45 * 60 * 1000;

// Le chrome d'abord. La signature, la barre et le pied se posent tout de suite,
// et le contenu vient dedans — on peut changer d'onglet avant même que les
// données soient arrivées. Les points de suspension sont ceux du reste du hub
// (dashboard.js, perso.js) : un bloc qui attend, pas un bloc vide.
function squelette(vue) {
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
      moments: [],
      publications: [],
      taches: [],
      evenements: [],
      contacts: [],
      commandes: [],
      envois: [],
      modeles: [],
      stats: [],
      preparations: [],
      // L'identifiant de la feuille ouverte — il vient de l'adresse
      // (#yuno/preparations/<id>), jamais d'un état d'interface.
      feuilleOuverte: null,
      ecartes: evenementsEcartes(),
      // Le mot dit après une écriture qui a échoué. Il vit dans l'état comme
      // le reste : `rendre()` le pose sous la barre, quelle que soit la vue.
      souci: null,
      prefillMoment: null,
      captureOuverte: false,
      // La fiche du carnet ouverte par le « + » des pages du réseau.
      contactNouveau: false,
      // Les identifiants de ce qui est ouvert en fenêtre, jamais leur copie.
      ideeOuverte: null,
      momentOuvert: null,
      editionMoment: false,
      noteIdeeOuverte: false,
      contactOuvert: null,
      editionContact: false,
      photos: {},
      jourRdv: jourRendezVousEnregistre(),
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
      tirage: null,
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
        // Les moments partent avec leurs photos : des moments sans adresses
        // valides, c'est le mur vide affiché à tort.
        delete restaure.moments;
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
      if (affichables.has('moments')) {
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
      else if (etat.vue === 'reseau') section.innerHTML = vueReseau(etat);
      else if (etat.vue === 'passerelle') section.innerHTML = vuePasserelle(etat);
      else if (etat.vue === 'carnet') section.innerHTML = vueCarnet(etat);
      else if (etat.vue === 'preparations') section.innerHTML = vuePreparations(etat);
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
        section.insertAdjacentHTML('beforeend', boutonPlusFlottant());
        // La tuile n'est plus écrite par les vues du calendrier : elle suit le
        // « + », donc toutes les vues. Une seule ligne à tenir à jour.
        if (etat.creationCal) {
          section.insertAdjacentHTML(
            'beforeend',
            fenetreCreation({
              ...etat.creationCal,
              naturesEnPlus: NATURE_MOMENT,
              natureEnDernier: reglagesDuPlus(etat.vue).natureEnDernier ?? false,
            }),
          );
        }
        if (etat.contactNouveau) {
          section.insertAdjacentHTML('beforeend', formulaireNouveauContact());
        }
        if (etat.captureOuverte) {
          section.insertAdjacentHTML(
            'beforeend',
            formulaireMoment(etat.contacts, etat.prefillMoment),
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
    };

    // Ne redessine que la liste des contacts : réécrire la vue entière ferait
    // perdre le curseur du champ de recherche à chaque lettre.
    const rendreContacts = () => {
      const cible = section.querySelector('[data-bloc="contacts"]');
      if (!cible) return;

      // Les deux outils partagent la base et le bloc, pas le dessin.
      cible.innerHTML =
        etat.vue === 'passerelle'
          ? construirePasserelle(baseContacts(etat.contacts, optionsBase(etat)), optionsBase(etat))
          : construireContacts(etat.contacts, optionsBase(etat));
    };

    const rendreCommandes = () => {
      const cible = section.querySelector('[data-bloc="commandes"]');
      if (cible) cible.innerHTML = construireCommandes(etat.commandes);
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
      rendre();
      if (await charger(BESOINS[etat.vue])) rendre();
    };

    // Revenir sur le site le relit. Ici « relire » veut dire OUBLIER ce qui a
    // été chargé : `fraiches` est ce qui empêche de redemander deux fois la
    // même table pendant une visite, et c'est justement lui qu'il faut vider.
    // Les données restent affichables entre-temps — `affichables` n'est pas
    // touché — donc rien ne clignote, l'écran se met à jour quand ça revient.
    this.rafraichir = async () => {
      fraiches.clear();
      if (await charger(BESOINS[etat.vue])) rendre();
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
        // On revient à la fiche : la correction se voit avant de refermer.
        etat.editionContact = false;
        rendre();
        return;
      }

      if (action === 'modifier-moment') {
        const ancien = etat.moments.find((candidat) => candidat.id === champs.id);
        const fichier = champs.photo;
        // La nouvelle photo part AVANT l'écriture : si l'envoi échoue, rien
        // n'est modifié et le formulaire reste ouvert, rempli.
        const nouveauChemin =
          fichier instanceof File && fichier.size
            ? await api.televerserPhotoMoment(fichier)
            : null;

        const modifs = {
          date: champs.date,
          type: champs.type,
          lieu: champs.lieu?.trim() || null,
          note: champs.note?.trim() || null,
          oeuvre_finie: champs.oeuvre_finie === 'oui',
          ...(nouveauChemin ? { photo_chemin: nouveauChemin } : {}),
        };

        const modifie = await api.modifierMoment(champs.id, modifs, titreDuMoment(modifs));

        // Les rencontres ne sont pas renvoyées par la mise à jour : on garde
        // celles qu'on avait, sans quoi la ligne « Rencontré » disparaîtrait.
        etat.moments = etat.moments.map((candidat) =>
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
        // La photo part avant le moment : si le téléversement échoue, rien
        // n'est écrit et le formulaire reste rempli.
        const fichier = champs.photo;
        const chemin =
          fichier instanceof File && fichier.size ? await api.televerserPhotoMoment(fichier) : null;

        const moment = {
          date: champs.date || versDateISO(),
          type: champs.type,
          lieu: champs.lieu?.trim() || null,
          photo_chemin: chemin,
          note: champs.note?.trim() || null,
          oeuvre_finie: champs.oeuvre_finie === 'oui',
        };

        const { moment: logue } = await api.creerMoment({
          moment,
          rencontres: relierRencontres(champs.rencontres, etat.contacts),
          titre: titreDuMoment(moment),
        });

        if (chemin) Object.assign(etat.photos, await api.urlsDesPhotos([chemin]));

        etat.moments = [logue, ...etat.moments];
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
              date_prevue: champs.debut,
              heure: champs.heure || null,
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
              lieu: champs.lieu?.trim() || null,
              notes: champs.notes?.trim() || null,
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

      if (action === 'noter-stats') {
        const ligne = await api.enregistrerStats({
          date: versDateISO(),
          abonnes: champs.abonnes ? Number(champs.abonnes) : null,
          reach: champs.reach ? Number(champs.reach) : null,
          top_post: champs.top_post?.trim() || null,
          reponse_rituelle: champs.reponse_rituelle.trim(),
        });
        etat.stats = [...etat.stats.filter((s) => s.date !== ligne.date), ligne].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
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
        etat.noteIdeeOuverte = false;
        rendre();
        return;
      }

      if (action === 'creer-contact') {
        // Ouverte par le « + », la fenêtre se referme une fois la fiche posée :
        // on n'enchaîne pas des fiches comme on enchaîne des notes. Il faut
        // alors redessiner la VUE, et pas seulement la liste des contacts —
        // sans quoi la fenêtre resterait affichée par-dessus.
        const venaitDuPlus = etat.contactNouveau;
        etat.contactNouveau = false;
        const contact = await api.creerContact({
          nom: champs.nom.trim(),
          type: champs.type,
          structure: champs.structure?.trim() || null,
          instagram: champs.instagram?.trim() || null,
          email: champs.email?.trim() || null,
          telephone: champs.telephone?.trim() || null,
          statut: champs.statut,
          objectif: champs.objectif?.trim() || null,
          niveau: champs.niveau ? Number(champs.niveau) : null,
          notes: champs.notes?.trim() || null,
        });
        etat.contacts.push(contact);
        etat.contacts.sort((a, b) => a.nom.localeCompare(b.nom));
        if (venaitDuPlus) rendre();
        else rendreContacts();
        return;
      }

      if (action === 'creer-commande') {
        const nomClient = champs.client?.trim() || null;
        const connu = nomClient
          ? etat.contacts.find((contact) => contact.nom.toLowerCase() === nomClient.toLowerCase())
          : null;

        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: connu?.nom ?? nomClient,
          client_id: connu?.id ?? null,
          statut: champs.statut,
          echeance: champs.echeance || null,
          montant: champs.montant ? Number(champs.montant) : null,
          lien_livrable: champs.lien_livrable?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.commandes = [commande, ...etat.commandes];
        rendreCommandes();
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
        rendre();
        // On en ajoute rarement un seul : le champ de la même phase reprend la
        // main, vide (le redessin l'a réécrit).
        section
          .querySelector(`form[data-phase="${champs.phase}"] input[name="texte"]`)
          ?.focus();
        return;
      }

      if (action === 'noter-bilan') {
        const feuille = etat.preparations.find((f) => f.id === champs.id);
        if (!feuille) return;

        const misAJour = await api.noterBilan(feuille.id, {
          bilan_bien: champs.bilan_bien?.trim() || null,
          bilan_mieux: champs.bilan_mieux?.trim() || null,
        });
        // `misAJour` ne porte pas les items : Object.assign les laisse en place.
        Object.assign(feuille, misAJour);
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

      if (evenement.target.closest('[data-ouvrir-note-idee]')) {
        etat.noteIdeeOuverte = true;
        rendre();
        section.querySelector('#pub-titre')?.focus();
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

        const jour = versDateISO();
        etat.creationCal = { debut: jour, fin: jour, nature: reglages.nature };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-ouvrir-capture]')) {
        etat.captureOuverte = true;
        rendre();
        section.querySelector('#moment-lieu')?.focus();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        etat.creationCal = null;
        etat.detailCal = null;
        etat.editionCal = false;
        etat.jourOuvertCal = null;
        etat.captureOuverte = false;
        etat.contactNouveau = false;
        etat.prefillMoment = null;
        etat.ideeOuverte = null;
        etat.momentOuvert = null;
        etat.editionMoment = false;
        etat.noteIdeeOuverte = false;
        etat.contactOuvert = null;
        etat.editionContact = false;
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

      // Une vignette du mur ouvre son moment : le lieu, la date, les
      // rencontres, la note. La photo en grand est dedans.
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
        etat.prefillMoment = { date: jour, lieu: titre };
        etat.captureOuverte = true;
        rendre();
        section.querySelector('#moment-lieu')?.focus();
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
        //
        // Le statut suivant se calcule AVANT : `modifierAussitot` a déjà changé
        // la fiche quand la requête part, et relire `contact.statut` là-dedans
        // ferait avancer d'un cran de trop (« message envoyé » deviendrait
        // « relance » sans qu'on ait relancé).
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
        etat.prefillMoment = {
          date: versDateISO(new Date(passe.date_debut)),
          lieu: passe.titre,
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

      const tirer = evenement.target.closest('[data-tirer]');
      if (tirer) {
        const avecMatch = tirer.dataset.tirer === 'avec';
        etat.tirage = { avecMatch, idee: tirerIdee(etat.publications, { avecMatch }) };
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

      const supprimerMoment = evenement.target.closest('[data-supprimer-moment]');
      if (supprimerMoment) {
        const id = supprimerMoment.dataset.supprimerMoment;
        const moment = etat.moments.find((candidat) => candidat.id === id);
        if (!moment || !confirm(`Retirer « ${titreDuMoment(moment)} » du carnet ?`)) return;
        if (estProvisoire(id)) return;
        // Retiré depuis sa propre fenêtre : elle n'a plus de sujet.
        if (etat.momentOuvert === id) etat.momentOuvert = null;
        await retirerAussitot(
          etat.moments,
          moment,
          () => api.supprimerMoment(id, moment.photo_chemin),
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

      // « Préparer » depuis la fenêtre d'un événement : la feuille se crée en
      // copiant le modèle, et la page s'ouvre dessus. Les modèles se lisent au
      // moment du geste — c'est une création, elle attend le serveur de toute
      // façon, et rien d'autre dans le site n'en a besoin.
      const preparerEvenement = evenement.target.closest('[data-preparer-evenement]');
      if (preparerEvenement) {
        const cible = etat.evenements.find(
          (candidat) => candidat.id === preparerEvenement.dataset.preparerEvenement,
        );
        if (!cible) return;
        preparerEvenement.disabled = true;

        try {
          const modeles = await api.modelesPreparationTous();
          const feuille = await api.creerPreparation({
            // Un seul modèle aujourd'hui (« Match ») : on le prend. Le choix
            // viendra avec le deuxième modèle.
            modele: modeles[0] ?? null,
            evenement_id: cible.id,
            titre: cible.titre,
            date: versDateISO(new Date(cible.date_debut)),
          });
          etat.preparations.unshift(feuille);
          fraiches.add('preparations');
          affichables.add('preparations');
          etat.detailCal = null;
          location.hash = `#yuno/preparations/${feuille.id}`;
        } catch (souci) {
          console.error('Création de la préparation impossible', souci);
          preparerEvenement.disabled = false;
          dire("La préparation n'a pas pu être créée.");
        }
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
      const ouvrirFiche = evenement.target.closest('[data-ouvrir-fiche]');
      if (ouvrirFiche) {
        const id = ouvrirFiche.dataset.ouvrirFiche;
        const moment = etat.moments.find((candidat) =>
          candidat.rencontres?.some((rencontre) => rencontre.id === id),
        );
        const rencontre = moment?.rencontres.find((candidat) => candidat.id === id);
        if (!rencontre) return;
        ouvrirFiche.disabled = true;
        try {
          const { contact, rencontre: liee } = await api.ouvrirFichePourRencontre(rencontre);
          Object.assign(rencontre, liee);
          etat.contacts = [...etat.contacts, contact].sort((a, b) => a.nom.localeCompare(b.nom));
          rendre();
        } catch (souci) {
          console.error("Ouverture de la fiche impossible", souci);
          ouvrirFiche.disabled = false;
        }
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
          etat.jourOuvertCal ||
          etat.ideeOuverte ||
          etat.momentOuvert ||
          etat.noteIdeeOuverte ||
          etat.contactOuvert
        )
      ) {
        return;
      }
      etat.creationCal = null;
      etat.detailCal = null;
      etat.jourOuvertCal = null;
      etat.captureOuverte = false;
      etat.contactNouveau = false;
      etat.prefillMoment = null;
      etat.ideeOuverte = null;
      etat.momentOuvert = null;
      etat.editionMoment = false;
      etat.noteIdeeOuverte = false;
      etat.contactOuvert = null;
      etat.editionContact = false;
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
      const filtreColonne = evenement.target.closest('[data-filtre-colonne]');
      if (filtreColonne) {
        etat.filtresContact = {
          ...etat.filtresContact,
          [filtreColonne.dataset.filtreColonne]: filtreColonne.value,
        };
        rendre();
        return;
      }

      // Le niveau se change au même geste que le statut : c'est lui qui fait
      // entrer un contact dans la file, ou l'en sort.
      const niveau = evenement.target.closest('[data-niveau]');
      if (niveau) {
        const contact = etat.contacts.find((c) => c.id === niveau.dataset.niveau);
        if (!contact) return;
        const valeurNiveau = niveau.value ? Number(niveau.value) : null;
        await modifierAussitot(
          contact,
          { niveau: valeurNiveau },
          () => api.modifierContact(contact.id, { niveau: valeurNiveau }),
          { rendre: rendreContacts, echouer: dire },
        );
        return;
      }

      // Les champs vifs de la Passerelle s'enregistrent en quittant le champ,
      // sans rien redessiner : la valeur est déjà sous les yeux, et un
      // redessin ferait sauter la page sous le doigt.
      const champVif =
        evenement.target.closest('[data-objectif-contact]') ??
        evenement.target.closest('[data-prochaine-action]') ??
        evenement.target.closest('[data-prochaine-date]');

      if (champVif) {
        const { objectifContact, prochaineAction, prochaineDate } = champVif.dataset;
        const contact = etat.contacts.find(
          (c) => c.id === (objectifContact ?? prochaineAction ?? prochaineDate),
        );
        if (!contact) return;

        const valeur = champVif.value.trim() || null;
        const colonne = objectifContact
          ? 'objectif'
          : prochaineAction
            ? 'prochaine_action'
            : 'prochaine_action_date';

        // Sans redessin : la valeur est déjà dans le champ, sous les yeux. Le
        // retour en arrière, lui, doit se voir — d'où le rendu au seul échec.
        await modifierAussitot(
          contact,
          { [colonne]: valeur },
          () => api.modifierContact(contact.id, { [colonne]: valeur }),
          { echouer: (message) => { rendreContacts(); dire(message); } },
        );
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

      const jourRdv = evenement.target.closest('[data-jour-rdv]');
      if (jourRdv) {
        etat.jourRdv = Number(jourRdv.value);
        retenirJourRendezVous(etat.jourRdv);
        rendre();
        return;
      }

      const filtrePilier = evenement.target.closest('[data-filtre-pilier]');
      if (filtrePilier) {
        etat.pilier = filtrePilier.value;
        rendre();
        return;
      }

      const filtreStatutIdee = evenement.target.closest('[data-filtre-statut-idee]');
      if (filtreStatutIdee) {
        etat.statutIdee = filtreStatutIdee.value;
        rendre();
        return;
      }

      const objectifDoux = evenement.target.closest('[data-objectif-doux]');
      if (objectifDoux) {
        etat.objectifDoux = Number(objectifDoux.value);
        retenirObjectifDoux(etat.objectifDoux);
        rendreContacts();
        return;
      }

      // Le statut se change dans la cellule : c'est le geste le plus fréquent
      // d'un CRM, il ne mérite pas un formulaire.
      const statut = evenement.target.closest('[data-statut]');
      if (statut) {
        const contact = etat.contacts.find((c) => c.id === statut.dataset.statut);
        if (!contact || estProvisoire(contact.id)) return;
        await modifierAussitot(
          contact,
          { statut: statut.value },
          () => api.modifierContact(contact.id, { statut: statut.value }),
          { rendre: rendreContacts, echouer: dire },
        );
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
