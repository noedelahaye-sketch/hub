// Le SITE Yuno — le quartier général du photographe (docs/yuno-spec.md).
//
// À l'adresse #yuno, tout l'habillage du hub disparaît (voir styles.css) : ni
// « Hub », ni onglets, ni autres projets. On est chez Yuno, avec son chrome à
// lui. La page Yuno DU hub, elle, vit dans js/photo.js (#photo).
//
//   #yuno              l'accueil : objectifs, aperçu création, victoires
//   #yuno/creer        l'outil phare : calendrier éditorial + banque d'idées
//   #yuno/calendrier   tout ce qui a une date chez Yuno, avec filtres
//   #yuno/reseau       le carnet réseau (à construire)
//   #yuno/commandes    le suivi des commandes (à construire)
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
  heureSousLePoint,
  cadrerLesHeures,
  brancherSelection,
  brancherClavier,
  brancherDeplacement,
  champsApresDeplacement,
  deplacerAncre,
  toutesLesNatures,
  natureParDefaut,
  centrerActif,
} from './calendrier-commun.js';

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
          <li>
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
  'calendrier', 'reseau', 'passerelle', 'carnet',
];

// La banque est une pièce de l'atelier : elle n'a pas son onglet, elle garde
// celui de Créer allumé. Une barre de navigation ne doit pas grandir à chaque
// écran qu'on ajoute.
const ONGLET_DE_LA_VUE = {
  banque: 'creer',
  editorial: 'creer',
  passerelle: 'reseau',
  carnet: 'reseau',
};

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vue) {
  const vueActive = ONGLET_DE_LA_VUE[vue] ?? vue;
  const liens = [
    ['accueil', 'Accueil', '#yuno'],
    ['journal', 'Journal', '#yuno/journal'],
    ['creer', 'Créer', '#yuno/creer'],
    ['calendrier', 'Calendrier', '#yuno/calendrier'],
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
  const compteur = (nombre, libelle) => `
    <li>
      <span class="chiffre">${nombre}</span>
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
// que le carnet : une barre oblique sépare deux personnes.
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
             title="Ajouter au carnet réseau"
             aria-label="Ajouter ${echapper(rencontre.nom)} au carnet réseau">+</button></span>`,
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
      { nom: 'type', libelle: 'Quoi', type: 'select', options: TYPES_MOMENT, valeur: moment.type },
      { nom: 'lieu', libelle: 'Événement ou lieu', type: 'text', valeur: moment.lieu ?? '' },
      { nom: 'note', libelle: 'Note', type: 'textarea', valeur: moment.note ?? '' },
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

function carteVictoire(victoire) {
  return `
    <li>
      <span class="tuile-entete">
        <span class="discret quand">${echapper(echeanceLisible(depuisDateISO(victoire.date)))}</span>
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-victoire="${echapper(victoire.id)}"
          title="Retirer cette victoire"
          aria-label="Retirer « ${echapper(victoire.titre)} »">×</button>
      </span>
      <span class="victoire-titre">${echapper(victoire.titre)}</span>
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
              loading="lazy">
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

// Le Journal : le fil complet, et le mur des victoires. Les moments et les
// victoires d'avant le carnet s'y mêlent. Les victoires nées d'un moment sont
// écartées — le moment est déjà là, et plus riche que son reflet.
export function construireCarnet(moments, victoires, photos = {}) {
  const entrees = [
    ...moments.map((moment) => ({
      date: moment.date,
      created_at: moment.created_at,
      html: carteMoment(moment, photos),
    })),
    ...victoires
      .filter((victoire) => victoire.source !== 'moment')
      .map((victoire) => ({
        date: victoire.date,
        created_at: victoire.created_at,
        html: carteVictoire(victoire),
      })),
  ].sort(
    (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      String(b.created_at).localeCompare(String(a.created_at)),
  );

  if (!entrees.length) {
    return `<p class="vide">Ton premier moment s'inscrit ici — un match, un concert, une sortie.</p>`;
  }

  return `<ul class="liste-carnet">${entrees.map((entree) => entree.html).join('')}</ul>`;
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
         { nom: 'type', libelle: 'Quoi', type: 'select', options: TYPES_MOMENT, valeur: 'match' },
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
    ${etat.captureOuverte ? formulaireMoment(etat.contacts, etat.prefillMoment) : ''}
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
      <div data-bloc="carnet">${construireCarnet(etat.moments, etat.victoires, etat.photos)}</div>
    </section>
    ${fenetreMoment(etat)}
    ${etat.captureOuverte ? formulaireMoment(etat.contacts, etat.prefillMoment) : ''}
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
           type: 'select',
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

    ${etat.creationCal ? fenetreCreation(etat.creationCal) : ''}
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
    ${etat.creationCal ? fenetreCreation(etat.creationCal) : ''}
    ${etat.detailCal ? fenetreDetail(etat.detailCal, { edition: etat.editionCal }) : ''}
    ${
      etat.jourOuvertCal
        ? fenetreJour(etat.jourOuvertCal, elementsDuJour(elements, etat.jourOuvertCal))
        : ''
    }
    ${pied()}`;
}

// --- Le carnet réseau --------------------------------------------------------
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
    title="Retirer du carnet"
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
    : `<p class="vide">Ton carnet démarre ici — joueurs, médias, clubs.</p>`;
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
           { nom: 'type', libelle: 'Type', type: 'select', options: TYPES_CONTACT, valeur: contact.type },
           { nom: 'structure', libelle: 'Structure', type: 'text', valeur: contact.structure ?? '' },
           {
             nom: 'statut',
             libelle: 'Où en est la relation',
             type: 'select',
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
                : "La file d'aller-vers, à remplir depuis le carnet"
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
      <h2>Le carnet</h2>
      <div class="barre-base">
        <input type="search" id="recherche-contact" class="recherche"
          placeholder="Chercher partout dans le carnet…"
          value="${echapper(etat.rechercheContact)}">
        <div class="affichages" role="group" aria-label="Affichage du carnet">
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
        libelle: 'Ajouter au carnet',
        action: 'creer-contact',
        champs: [
          { nom: 'nom', libelle: 'Nom', type: 'text', requis: true },
          { nom: 'type', libelle: 'Type', type: 'select', options: TYPES_CONTACT, valeur: 'joueur' },
          { nom: 'structure', libelle: 'Rattaché à (FC Lorient, OM, La Provence…)', type: 'text' },
          { nom: 'instagram', libelle: 'Instagram', type: 'text' },
          { nom: 'email', libelle: 'E-mail', type: 'text' },
          { nom: 'telephone', libelle: 'Téléphone', type: 'text' },
          { nom: 'statut', libelle: 'Relation', type: 'select',
            options: Object.fromEntries(
              Object.entries(STATUTS_CONTACT).map(([v, { nom }]) => [v, nom]),
            ),
            valeur: 'pas_de_contact' },
          { nom: 'objectif', libelle: 'Pourquoi ce contact ? (facultatif)', type: 'text' },
          { nom: 'niveau', libelle: "Dans la file d'aller-vers ?", type: 'select',
            options: {
              '': 'Pas dans la file',
              ...Object.fromEntries(
                Object.entries(NIVEAUX).map(([v, { nom }]) => [v, `${v} ${nom}`]),
              ),
            },
            valeur: '' },
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>
    ${pied()}`;
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
          { nom: 'statut', libelle: 'Où en est-elle', type: 'select',
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

export default {
  async monter(section, route) {
    const etat = {
      objectifs: [],
      victoires: [],
      moments: [],
      publications: [],
      taches: [],
      evenements: [],
      contacts: [],
      commandes: [],
      envois: [],
      modeles: [],
      stats: [],
      ecartes: evenementsEcartes(),
      prefillMoment: null,
      captureOuverte: false,
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

    // Déclaré ici parce que `rendre` s'en sert : la fonction est posée plus
    // bas, quand les écouteurs se branchent.
    let poserLEntreeClavier = null;

    const rendre = () => {
      if (etat.vue === 'journal') section.innerHTML = vueJournal(etat);
      else if (etat.vue === 'creer') section.innerHTML = vueCreer(etat);
      else if (etat.vue === 'banque') section.innerHTML = vueBanque(etat);
      else if (etat.vue === 'editorial') section.innerHTML = vueEditorial(etat);
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'reseau') section.innerHTML = vueReseau(etat);
      else if (etat.vue === 'passerelle') section.innerHTML = vuePasserelle(etat);
      else if (etat.vue === 'carnet') section.innerHTML = vueCarnet(etat);
      else section.innerHTML = vueAccueil(etat);

      centrerActif(section.querySelector('.yuno-nav'));
      centrerActif(section.querySelector('.filtres'));
      cadrerLesHeures(section);
      poserLEntreeClavier?.();
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
    };

    // Où écrire, par nature. Le formulaire de modification et le glissement
    // passent tous deux par ici — seuls les champs changent.
    async function appliquerAuCalendrier(type, id, champs) {
      if (type === 'evenement') return api.modifierEvenement(id, champs);
      if (type === 'publication') return api.modifierPublication(id, champs);
      if (type === 'objectif') return api.modifierObjectif(id, champs);
      if (type === 'commande') return api.modifierCommande(id, champs);
      if (type === 'relance') return api.modifierContact(id, champs);
      if (type === 'jalon') return api.modifierJalon(id, champs);
      return api.modifierTache(id, champs);
    }

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

    this.naviguer = (nouvelleRoute) => {
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      // Le mot de clôture ne vaut que pour l'instant où l'on vient de poster :
      // changer de page l'efface, il n'a pas à traîner. La capture pré-remplie
      // non plus — on la reprend depuis l'invite si besoin.
      etat.cloture = false;
      etat.prefillMoment = null;
      rendre();
    };

    try {
      const [objectifs, victoires, moments, publications, taches, evenements, contacts, commandes, envois, modeles, stats] =
        await Promise.all([
          api.objectifsActifs({ projet: 'photo' }),
          api.victoiresDuProjet('photo', 10, { sauf: 'moment' }),
          api.momentsTous(),
          api.publicationsToutes('photo'),
          api.tachesDatees({ projet: 'photo' }),
          // Tous les événements : la grille se promène dans le passé, et
          // l'invite du Carnet y puise la semaine écoulée.
          api.evenementsTous({ projet: 'photo' }),
          api.contactsTous(),
          api.commandesToutes(),
          api.envoisTous(),
          api.modelesTous(),
          api.statsHebdoTous(),
        ]);
      Object.assign(etat, {
        objectifs,
        victoires,
        moments,
        publications,
        taches,
        evenements,
        contacts,
        commandes,
        envois,
        modeles,
        stats,
      });

      // Les photos vivent dans un bucket privé : leurs adresses se signent à la
      // lecture, toutes ensemble.
      const chemins = moments.map((moment) => moment.photo_chemin).filter(Boolean);
      if (chemins.length) etat.photos = await api.urlsDesPhotos(chemins);
    } catch (erreur) {
      console.error("Chargement de l'espace Yuno impossible", erreur);
      section.innerHTML = `
        ${enTete('accueil')}
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section, route));
      return;
    }

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
        const modifs = {
          date: champs.date,
          type: champs.type,
          lieu: champs.lieu?.trim() || null,
          note: champs.note?.trim() || null,
          oeuvre_finie: champs.oeuvre_finie === 'oui',
        };

        const modifie = await api.modifierMoment(champs.id, modifs, titreDuMoment(modifs));

        // Les rencontres ne sont pas renvoyées par la mise à jour : on garde
        // celles qu'on avait, sans quoi la ligne « Rencontré » disparaîtrait.
        etat.moments = etat.moments.map((candidat) =>
          candidat.id === champs.id
            ? { ...candidat, ...modifie, rencontres: candidat.rencontres }
            : candidat,
        );
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
          await api.creerTache({ projet: 'photo', titre, echeance: champs.debut });
        } else if (champs.nature === 'publication') {
          await api.creerPublication({
            projet: 'photo',
            titre,
            reseau: champs.reseau,
            format: champs.format,
            date_prevue: champs.debut,
          });
        } else if (champs.nature === 'objectif') {
          await api.creerObjectif({
            projet: 'photo',
            titre,
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
            echeance: champs.debut,
          });
        } else {
          // Sans heure, l'événement tient le jour entier : minuit local, et
          // `momentLisible` s'abstient alors d'afficher 00:00.
          const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
          const fin = finDeLEvenement(debut, champs);

          await api.creerEvenement({
            projet: 'photo',
            titre,
            date_debut: debut.toISOString(),
            date_fin: fin ? fin.toISOString() : null,
            recurrence: champs.recurrence || null,
            recurrence_fin: champs.recurrence_fin || null,
            lieu: champs.lieu?.trim() || null,
            notes: champs.notes?.trim() || null,
          });
        }

        etat.creationCal = null;
        await rechargerCalendrier();
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
        etat.contacts = [...etat.contacts, contact].sort((a, b) => a.nom.localeCompare(b.nom));
        rendreContacts();
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
      if (evenement.target.closest('[data-ouvrir-note-idee]')) {
        etat.noteIdeeOuverte = true;
        rendre();
        section.querySelector('#pub-titre')?.focus();
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

      // Cliquer dans la grille horaire pose un événement à cette heure-là.
      const creneau = evenement.target.closest('.cal-colonne-jour');
      if (creneau && !evenement.target.closest('.cal-bloc')) {
        const jour = creneau.dataset.jour;
        etat.detailCal = null;
        etat.creationCal = {
          debut: jour,
          fin: jour,
          nature: 'evenement',
          heure: heureSousLePoint(creneau, evenement.clientY),
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
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
        try {
          const { tache: faite, victoire } = await api.terminerTache(tache);
          etat.taches = etat.taches.map((candidat) =>
            candidat.id === faite.id ? faite : candidat,
          );
          if (victoire) etat.victoires = [victoire, ...etat.victoires];
          rendre();
        } catch (souci) {
          console.error('Tâche non terminée', souci);
        }
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
        supprimerContact.disabled = true;
        try {
          await api.supprimerContact(supprimerContact.dataset.supprimerContact);
          etat.contacts = etat.contacts.filter(
            (contact) => contact.id !== supprimerContact.dataset.supprimerContact,
          );
          rendreContacts();
        } catch (souci) {
          console.error('Suppression du contact impossible', souci);
          supprimerContact.disabled = false;
        }
        return;
      }

      const avancerCommande = evenement.target.closest('[data-avancer-commande]');
      if (avancerCommande) {
        const commande = etat.commandes.find(
          (c) => c.id === avancerCommande.dataset.avancerCommande,
        );
        const suivant = CYCLE_COMMANDE[CYCLE_COMMANDE.indexOf(commande?.statut) + 1];
        if (!commande || !suivant) return;
        avancerCommande.disabled = true;
        try {
          // Livrer crée une victoire : c'en est une. Être payé, non.
          const { commande: misAJour, victoire } = await api.avancerCommande(commande, suivant);
          Object.assign(commande, misAJour);
          if (victoire) etat.victoires = [victoire, ...etat.victoires];
          rendreCommandes();
        } catch (souci) {
          console.error("Impossible de faire avancer la commande", souci);
          avancerCommande.disabled = false;
        }
        return;
      }

      // « Envoyé ✓ » — le seul compteur de la Passerelle. Il monte parce que
      // Noé a écrit, pas parce qu'on lui a répondu.
      const envoye = evenement.target.closest('[data-envoye]');
      if (envoye) {
        const contact = etat.contacts.find((c) => c.id === envoye.dataset.envoye);
        if (!contact) return;
        envoye.disabled = true;
        try {
          const { envoi, contact: misAJour } = await api.enregistrerEnvoi({
            contact,
            statut: statutApresEnvoi(contact.statut),
          });
          Object.assign(contact, misAJour);
          etat.envois = [envoi, ...etat.envois];
          rendreContacts();
        } catch (souci) {
          console.error("Impossible d'enregistrer l'envoi", souci);
          envoye.disabled = false;
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
        supprimerModele.disabled = true;
        try {
          await api.supprimerModele(supprimerModele.dataset.supprimerModele);
          etat.modeles = etat.modeles.filter(
            (m) => m.id !== supprimerModele.dataset.supprimerModele,
          );
          rendreContacts();
        } catch (souci) {
          console.error('Suppression du modèle impossible', souci);
          supprimerModele.disabled = false;
        }
        return;
      }

      const supprimerCommande = evenement.target.closest('[data-supprimer-commande]');
      if (supprimerCommande) {
        supprimerCommande.disabled = true;
        try {
          await api.supprimerCommande(supprimerCommande.dataset.supprimerCommande);
          etat.commandes = etat.commandes.filter(
            (commande) => commande.id !== supprimerCommande.dataset.supprimerCommande,
          );
          rendreCommandes();
        } catch (souci) {
          console.error('Suppression de la commande impossible', souci);
          supprimerCommande.disabled = false;
        }
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
        if (!suivant) return;
        avancer.disabled = true;
        try {
          Object.assign(pub, await api.modifierPublication(pub.id, { statut: suivant }));
          // Poster, c'est déposer l'œuvre et repartir : le site le dit, puis
          // se tait.
          etat.cloture = suivant === 'publie';
          rendre();
        } catch (souci) {
          console.error('Changement de statut impossible', souci);
          avancer.disabled = false;
        }
        return;
      }

      const deprogrammer = evenement.target.closest('[data-deprogrammer]');
      if (deprogrammer) {
        const pub = trouverPub(deprogrammer.dataset.deprogrammer);
        deprogrammer.disabled = true;
        try {
          Object.assign(pub, await api.modifierPublication(pub.id, { date_prevue: null }));
          rendre();
        } catch (souci) {
          console.error('Déprogrammation impossible', souci);
          deprogrammer.disabled = false;
        }
        return;
      }

      const supprimerPub = evenement.target.closest('[data-supprimer-pub]');
      if (supprimerPub) {
        supprimerPub.disabled = true;
        try {
          await api.supprimerPublication(supprimerPub.dataset.supprimerPub);
          etat.publications = etat.publications.filter(
            (pub) => pub.id !== supprimerPub.dataset.supprimerPub,
          );
          // Supprimée depuis sa propre fiche : la fenêtre n'a plus de sujet.
          if (etat.ideeOuverte === supprimerPub.dataset.supprimerPub) {
            etat.ideeOuverte = null;
          }
          rendre();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerPub.disabled = false;
        }
        return;
      }

      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) {
        jalon.disabled = true;
        try {
          const objectif = etat.objectifs.find((candidat) =>
            candidat.jalons?.some((j) => j.id === jalon.dataset.jalon),
          );
          const cible = objectif.jalons.find((j) => j.id === jalon.dataset.jalon);
          const { jalon: atteint, victoire } = await api.atteindreJalon(cible, 'photo');
          Object.assign(cible, atteint);
          etat.victoires = [victoire, ...etat.victoires];
          rendre();
          ouvrirObjectif(objectif.id);
        } catch (souci) {
          console.error('Impossible de marquer le jalon', souci);
          jalon.disabled = false;
        }
        return;
      }

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) {
        const objectif = etat.objectifs.find((o) => o.id === atteindre.dataset.atteindre);
        if (!objectif || !confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;
        atteindre.disabled = true;
        try {
          const { victoire } = await api.atteindreObjectif(objectif);
          etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
          etat.victoires = [victoire, ...etat.victoires];
          rendre();
        } catch (souci) {
          console.error("Impossible de marquer l'objectif atteint", souci);
          atteindre.disabled = false;
        }
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
        supprimerObjectif.disabled = true;
        try {
          await api.supprimerObjectif(objectif.id);
          etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
          rendre();
        } catch (souci) {
          console.error("Suppression de l'objectif impossible", souci);
          supprimerObjectif.disabled = false;
        }
        return;
      }

      const supprimerMoment = evenement.target.closest('[data-supprimer-moment]');
      if (supprimerMoment) {
        const id = supprimerMoment.dataset.supprimerMoment;
        const moment = etat.moments.find((candidat) => candidat.id === id);
        if (!moment || !confirm(`Retirer « ${titreDuMoment(moment)} » du carnet ?`)) return;
        supprimerMoment.disabled = true;
        try {
          await api.supprimerMoment(id, moment.photo_chemin);
          etat.moments = etat.moments.filter((candidat) => candidat.id !== id);
          // Retiré depuis sa propre fenêtre : elle n'a plus de sujet.
          if (etat.momentOuvert === id) etat.momentOuvert = null;
          rendre();
        } catch (souci) {
          console.error('Suppression du moment impossible', souci);
          supprimerMoment.disabled = false;
        }
        return;
      }

      // Une rencontre notée au vol devient une fiche : le carnet réseau se
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

      const victoire = evenement.target.closest('[data-victoire]');
      if (victoire) {
        victoire.disabled = true;
        try {
          await api.supprimerVictoire(victoire.dataset.victoire);
          etat.victoires = etat.victoires.filter((v) => v.id !== victoire.dataset.victoire);
          rendre();
        } catch (souci) {
          console.error('Suppression de la victoire impossible', souci);
          victoire.disabled = false;
        }
      }
    });

    // Glisser sur les jours du calendrier ouvre le formulaire, rempli de la
    // plage choisie.
    poserLEntreeClavier = brancherClavier(section, (jour) => {
      etat.detailCal = null;
      etat.creationCal = { debut: jour, fin: jour, nature: natureParDefaut(etat.natures) };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    });
    poserLEntreeClavier();

    brancherSelection(section, ({ debut, fin }) => {
      etat.detailCal = null;
      etat.creationCal = { debut, fin, nature: natureParDefaut(etat.natures) };
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

      const id = tuile.dataset.poserIdee;
      try {
        const modifiee = await api.modifierPublication(id, { date_prevue: jour });
        etat.publications = etat.publications.map((pub) => (pub.id === id ? modifiee : pub));
        rendre();
      } catch (souci) {
        console.error("Programmation de l'idée impossible", souci);
      }
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
        programmer.disabled = true;
        try {
          Object.assign(
            pub,
            await api.modifierPublication(pub.id, { date_prevue: programmer.value }),
          );
          rendre();
        } catch (souci) {
          console.error('Programmation impossible', souci);
          programmer.disabled = false;
        }
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
        niveau.disabled = true;
        try {
          Object.assign(
            contact,
            await api.modifierContact(contact.id, {
              niveau: niveau.value ? Number(niveau.value) : null,
            }),
          );
          rendreContacts();
        } catch (souci) {
          console.error('Enregistrement du niveau impossible', souci);
          niveau.disabled = false;
        }
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

        try {
          Object.assign(contact, await api.modifierContact(contact.id, { [colonne]: valeur }));
        } catch (souci) {
          console.error("Enregistrement du champ impossible", souci);
        }
        return;
      }

      const modeleTitre = evenement.target.closest('[data-modele-titre]');
      const modeleCorps = evenement.target.closest('[data-modele-corps]');
      if (modeleTitre || modeleCorps) {
        const champ = modeleTitre ?? modeleCorps;
        const id = champ.dataset.modeleTitre ?? champ.dataset.modeleCorps;
        const modele = etat.modeles.find((m) => m.id === id);
        if (!modele) return;
        try {
          Object.assign(
            modele,
            await api.modifierModele(id, {
              [modeleTitre ? 'titre' : 'corps']: champ.value.trim(),
            }),
          );
        } catch (souci) {
          console.error('Enregistrement du modèle impossible', souci);
        }
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
        if (!contact) return;
        statut.disabled = true;
        try {
          Object.assign(
            contact,
            await api.modifierContact(contact.id, { statut: statut.value }),
          );
          rendreContacts();
        } catch (souci) {
          console.error('Enregistrement du statut impossible', souci);
          statut.disabled = false;
        }
      }
    });
  },
};
