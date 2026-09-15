// Point d'entrée : garde la session, montre le bon écran, route vers les espaces.

import {
  sessionCourante,
  connexion,
  deconnexion,
  surChangementSession,
  rafraichirLesSeries,
  poserCeQuUnEvenementFaitNaitre,
} from './api.js';
import { centrerActif, ongletCalendrier } from './calendrier-commun.js';
import { viderLesCaches } from './cache-session.js';
import { monterLeMenu } from './menu.js';
import dashboard from './dashboard.js';
import taches from './taches.js';
import semaine from './semaine.js';
import objectifs from './objectifs.js';
import habitude from './habitude.js';
import livre from './livre.js';
import film from './film.js';
import objectif from './objectif.js';
import projet from './projet.js';
import calendrier from './calendrier.js';
import formation from './formation.js';
import photo from './photo.js';
import yuno from './yuno.js';
import fch from './fch.js';
import hermitage from './hermitage.js';
import perso from './perso.js';
import chemin from './chemin.js';
import temps from './temps.js';

// `photo` est la page Yuno du hub ; `yuno` est le site Yuno, qui masque tout
// l'habillage du hub. Deux adresses, deux sensations, une seule application.
// `objectifs` n'a pas d'entrée dans la barre (demande de Noé, 25 août 2026) :
// on y vient par la porte du bloc « Tes objectifs », et rarement.
const espaces = {
  dashboard, taches, objectifs, objectif, projet, calendrier, formation, photo, yuno, fch,
  hermitage, perso, habitude, livre, film, chemin, temps, semaine,
};

// Trois pages d'entrée pour trois applications sur l'écran d'accueil :
// index.html (le hub), yuno.html, hermitage.html. Chacune a son manifeste, son
// icône et son nom ; toutes chargent le même js/app.js. L'entrée décide
// seulement de l'espace ouvert quand l'adresse ne dit rien.
const ENTREE = document.body.dataset.entree ?? 'hub';
const ESPACE_PAR_DEFAUT = ENTREE === 'hub' ? 'dashboard' : ENTREE;

// --- La barre : trois mots, puis des signes (demande de Noé, 27 août 2026)
//
// Les trois premiers onglets gardent leur MOT — ce sont les vues où Noé va
// tous les jours, et un mot se vise mieux qu'un signe qu'il faut reconnaître.
// Le reste passe en signe : ce qui a une image propre la prend (les deux
// marques, en pochoir), le reste reçoit un dessin du même trait.
//
// Un logo en POCHOIR et non en vignette : le PNG ne sert que d'alpha, l'encre
// vient de `currentColor`. Le logo suit donc la couleur de l'onglet — discret
// au repos, inversé quand il est actif — comme il le fait déjà dans la barre du
// site FCH. Une vignette carrée, elle, garderait son fond et son cadre.
//
// Chaque signe garde son nom en `title` et en `aria-label` : muet pour l'œil ne
// doit pas vouloir dire muet pour un lecteur d'écran.
const NOMS_NAV = {
  dashboard: 'Accueil',
  perso: 'Perso',
};

// Les deux vues du quotidien gardent leur mot : elles se visent mieux qu'un
// signe à reconnaître. Le calendrier a le sien (`ongletCalendrier`).
function ongletMot(espace) {
  const dessin = espace === 'dashboard'
    ? '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'
    : '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/>';
  return `<a href="#${espace}" data-nav="${espace}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dessin}</svg><span>${NOMS_NAV[espace]}</span></a>`;
}

// --- La coquille -------------------------------------------------------------
// Écrite ici et non dans les trois pages d'entrée : trois copies du même
// balisage finiraient par diverger. Les pages ne portent que ce qui les
// distingue — icône, manifeste, titre — et l'écran d'attente.

document.body.insertAdjacentHTML(
  'beforeend',
  `
  <!-- Écran de connexion : visible uniquement sans session. -->
  <div id="ecran-connexion" class="ecran-plein" hidden>
    <form id="form-connexion" class="carte carte-connexion">
      <h1>Hub</h1>
      <p class="discret">Connecte-toi pour retrouver tes espaces.</p>

      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" autocomplete="username" required>

      <label for="motdepasse">Mot de passe</label>
      <input type="password" id="motdepasse" name="motdepasse" autocomplete="current-password" required>

      <button type="submit" id="bouton-connexion">Se connecter</button>
      <p id="erreur-connexion" class="message-erreur" role="alert" hidden></p>
    </form>
  </div>

  <!-- Application : visible uniquement avec une session. -->
  <div id="app" hidden>
    <div class="haut">
      <header class="entete">
        <span class="entete-titre">Hub</span>
        <button type="button" id="bouton-deconnexion" class="lien-discret">Se déconnecter</button>
      </header>

      <!-- LE PREMIER RANG : ce qu'on regarde tous les jours sans avoir décidé
           de le regarder (28 août 2026, décision de Noé). Tout le reste — les
           tâches, le cap, les trois bilans d'espace — descend d'un rang, dans
           le menu : les ouvrir, c'est déjà avoir décidé quelque chose.
           Perso reste ici ET dans le menu, et c'est voulu : on l'ouvre sans y
           avoir pensé, mais ses pages doivent s'atteindre comme celles des
           autres espaces. Le hub existe pour servir Noé — la vie hors espaces
           ne passe pas après les espaces.
           Le bouton du menu est posé par monterLeMenu, à côté de la bande et
           non dedans : la bande défile, une chose en queue de bande n'existe
           pas. -->
    </div>

    <!-- LA BARRE EST SORTIE DE l'en-tête (29 août 2026, demande de Noé : « une
         barre fixe, qui reste lorsque l'on descend dans la page »). Elle était
         déjà collante, mais un élément collant est BORNÉ PAR SON PARENT :
         enfermée dans un en-tête haut de 100 px, elle ne pouvait coller que sur
         ces 100 px, puis elle sortait de l'écran avec lui. Mesuré : à 600 px de
         défilement, elle se trouvait à moins 553.
         Enfant direct de l'application, elle colle sur toute la page. -->
    <div class="barre-onglets">
      <div id="hub-titre-page"></div>
      <nav class="navigation hub-dock" aria-label="Espaces">
        ${['dashboard', 'perso'].map(ongletMot).join('\n        ')}
        ${ongletCalendrier('#calendrier', false).replace('</a>', '<span>Calendrier</span></a>')}
      </nav>
    </div>

    <!-- Les id sont préfixés : sans ça, \`#photo\` dans la barre d'adresse ferait
         défiler le navigateur jusqu'à l'élément \`id="photo"\`, ce qui écraserait
         la position restaurée par le routeur. -->
    <main id="vue">
      ${Object.keys(espaces)
        .map(
          (nom) =>
            `<section class="espace" id="espace-${nom}" data-espace="${nom}" hidden></section>`,
        )
        .join('\n      ')}
    </main>
  </div>`,
);

// « Général » s'ouvre d'emblée : c'est la rubrique du transverse et du perso,
// celle qu'on vient chercher le plus souvent.
monterLeMenu(document.querySelector('.barre-onglets'), { depliees: ['Général'] });

// Le titre suit les rendus asynchrones et les changements de sous-page.
// Le contenu reste dans son module ; seul son libellé rejoint la barre du hub.
function actualiserTitreDuHub() {
  const nom = document.body.dataset.espace;
  const destination = document.getElementById('hub-titre-page');
  const section = document.getElementById(`espace-${nom}`);
  if (!section || ['yuno', 'hermitage'].includes(nom)) {
    destination.replaceChildren();
    return;
  }
  const source = [...section.querySelectorAll('h1')].find(
    (element) => !element.closest('.fenetre, .fenetre-fond, [hidden]'),
  );
  const texte = source?.textContent.trim() ?? document.title.split(' — ')[0];
  if (source) source.classList.add('hub-titre-dans-barre');
  if (destination.textContent === texte) return;
  const titre = document.createElement('h1');
  titre.textContent = texte;
  destination.replaceChildren(titre);
}
new MutationObserver(actualiserTitreDuHub).observe(document.getElementById('vue'), {
  childList: true, subtree: true, characterData: true,
});


const TITRES = {
  dashboard: 'Accueil',
  taches: 'Mes tâches',
  objectifs: 'Mon cap',
  // Les pages d'un CAP et d'un PROJET écrivent elles-mêmes leur titre dès
  // qu'elles savent lequel : « Projet — Hub » ne dirait pas duquel. Ceux-ci ne
  // servent que le temps du chargement, et quand l'adresse ne nomme rien.
  objectif: 'Objectif',
  projet: 'Projet',
  habitude: 'Habitude',
  livre: 'Livre',
  film: 'Film',
  calendrier: 'Calendrier',
  formation: 'Formation',
  photo: 'Yuno',
  yuno: 'Yuno',
  fch: 'FC Hermitage',
  hermitage: 'FC Hermitage',
  perso: 'Perso',
  chemin: 'Mon chemin',
  temps: 'Mon temps',
  semaine: 'Ma semaine',
};
// Une vue a son propre titre quand elle est une page à elle seule : « Le cap »
// pour les trois étages ensemble, mais « Projets » quand le menu n'a ouvert que
// celui-là. Sans ça, l'onglet du navigateur mentirait sur ce qu'on regarde.
const TITRES_VUES = {
  objectifs: { caps: 'Mes objectifs', projets: 'Mes projets', periodes: 'Mes périodes' },
  perso: {
    intentions: 'Mes intentions',
    habitudes: 'Mes habitudes',
    bibliotheque: 'Ma bibliothèque',
    livres: 'Mes livres',
    films: 'Mes films et séries',
    journee: 'Mes journées',
  },
};

const TITRE_BASE = document.title;

const ecranChargement = document.getElementById('ecran-chargement');
const ecranConnexion = document.getElementById('ecran-connexion');
const app = document.getElementById('app');
const formConnexion = document.getElementById('form-connexion');
const boutonConnexion = document.getElementById('bouton-connexion');
const erreurConnexion = document.getElementById('erreur-connexion');
const boutonDeconnexion = document.getElementById('bouton-deconnexion');

// Espaces déjà affichés une fois : leur module n'est monté qu'une seule fois.
const espacesMontes = new Set();

// --- Écrans -----------------------------------------------------------------

function afficherEcran(nom) {
  ecranChargement.hidden = nom !== 'chargement';
  ecranConnexion.hidden = nom !== 'connexion';
  app.hidden = nom !== 'app';
}

// --- Navigation -------------------------------------------------------------
//
// Une adresse par écran, pour que le bouton retour du navigateur fonctionne et
// qu'un écran puisse être mis en favori. Deux niveaux prévus dès maintenant :
//
//   #formation                     l'espace
//   #formation/objectif/<id>       un écran à l'intérieur
//
// Le second niveau n'est pas encore utilisé, mais le routeur le comprend : les
// espaces pourront l'exploiter sans qu'on ait à le réécrire.

function analyserAdresse(adresse) {
  const morceaux = (adresse || '')
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((morceau) => {
      try {
        return decodeURIComponent(morceau);
      } catch {
        return morceau;
      }
    });

  const espace = morceaux[0] in espaces ? morceaux[0] : ESPACE_PAR_DEFAUT;
  return { espace, vue: morceaux[1] ?? null, id: morceaux[2] ?? null };
}

function adressePour({ espace, vue = null, id = null }) {
  return (
    `#${espace}` +
    (vue ? `/${encodeURIComponent(vue)}` : '') +
    (vue && id ? `/${encodeURIComponent(id)}` : '')
  );
}

// Position de défilement retenue par adresse : revenir sur un espace le
// retrouve là où on l'avait laissé, plutôt qu'en haut.
const defilements = new Map();
let routeCourante = null;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// --- Le fond figé sous une tuile ---------------------------------------------
//
// Sur iPhone, ouvrir le clavier fait défiler LA PAGE pour « amener le champ à
// la vue » — même quand ce champ vit dans un élément `position: fixed` déjà
// visible à l'écran. Résultat constaté par Noé : la page descendait à chaque
// appui sur « + ».
//
// `overflow: hidden` sur le corps ne suffit pas sur iOS : il faut sortir le
// document du flux. On retient donc la position, on fixe le corps décalé
// d'autant — l'écran ne bouge pas d'un pixel — et on rend la position en
// refermant.
//
// Le déclenchement est ici, dans la coquille, et non dans les quatre espaces
// qui ouvrent une tuile : quatre endroits où penser à figer ET à libérer, c'est
// trois oublis en puissance. Un observateur regarde `.capture` apparaître.
let defilementFige = 0;

function figerLeFond() {
  if (document.body.classList.contains('fond-fige')) return;
  defilementFige = window.scrollY;
  // LE HAUT DE LA PAGE, et pas l'endroit où l'on était (demande de Noé,
  // 13 août 2026). Derrière la tuile on doit continuer à voir « Hub » et les
  // onglets : c'est ce qui dit où l'on est en train d'écrire.
  //
  // La première version gardait la position (`top: -Ypx`) pour que le fond ne
  // bouge pas d'un pixel. Mais l'en-tête n'est pas collant : depuis le milieu
  // d'une liste, geler sur place ne montrait qu'un morceau de liste sombre, et
  // l'application semblait vidée de sa tête le temps qu'on écrive.
  document.body.style.top = '0px';
  document.body.classList.add('fond-fige');
}

function libererLeFond() {
  if (!document.body.classList.contains('fond-fige')) return;
  document.body.classList.remove('fond-fige');
  document.body.style.top = '';
  // On rend sa place à Noé : refermer la tuile le ramène là où il lisait.
  window.scrollTo(0, defilementFige);
}

// Le réglage système « réduire les animations ». Déclaré ICI et non plus bas,
// avec le balayage : le morph du « + » s'en sert et le précède dans le fichier —
// un `const` lu avant sa déclaration est une zone morte, et le dépôt a déjà payé
// ce piège une fois (la marge des blocs de « Ma semaine », 31 août 2026).
const sansAnimation = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- LE « + » SE MÉTAMORPHOSE EN TUILE (15 septembre 2026, demande de Noé) ----
//
// LA DEMANDE, une vidéo à l'appui : « pour le bouton d'ajout (le + de bas de
// page sur la page hub et les autres sites) j'aimerais que ce soit cette
// animation lorsque l'on appuie dessus, qu'on valide une tâche. »
//
// CE QUE LA VIDÉO MONTRE : le rond flottant ne disparaît pas pour laisser place
// à une tuile — **il DEVIENT la tuile.** Il s'étire depuis son coin jusqu'à la
// barre de saisie, le contenu s'allume dedans, et au moment où la tâche part le
// mouvement se rejoue à l'envers : la barre se rétracte en rond.
//
// RIEN À DÉPLACER, ET C'EST CE QUI REND L'EFFET PEU COÛTEUX : la tuile du hub
// est DÉJÀ en bas de l'écran, collée au clavier, depuis le 13 août 2026. Il ne
// manquait que le trajet entre les deux formes.
//
// C'EST UN FLIP, pas une transition de vue. On mesure la forme de départ, on
// pose la forme d'arrivée, et l'on anime l'écart en `transform` — donc sur le
// compositeur, sans recalcul de mise en page à chaque image. `startViewTransition`
// aurait fait le même travail en deux lignes, mais en fondu croisé entre deux
// images figées : ici les deux formes n'ont ni la même couleur ni le même
// contenu, et c'est le TRAJET qu'on veut voir, pas un fondu.
//
// POSÉ ICI, UNE FOIS, comme l'éclair et le fond figé — et pour la raison déjà
// écrite au-dessus : dix écrans ouvrent cette tuile (l'accueil, les Tâches, Ma
// semaine, le calendrier, la page d'un cap, celle d'un projet, les deux sites),
// et dix endroits où penser à l'animer, ce sont neuf oublis en puissance.
// Aucun d'eux n'a une ligne à changer.

// La géométrie du rond, prise AVANT que le rendu de l'espace ne l'efface. En
// capture sur `click` : l'écouteur de l'espace écoute en remontée sur sa
// section, il passe donc après nous. Et `click` plutôt que `pointerdown`, pour
// que le clavier — qui n'émet pas de pointeur — ouvre la tuile de la même façon.
let formeDuPlus = null;
// La géométrie de la tuile, prise à l'ouverture : une fois retirée du DOM, elle
// n'a plus de forme à donner, et c'est d'elle que part le mouvement inverse.
let formeDeLaTuile = null;
// LA TUILE ÉTAIT-ELLE DÉJÀ LÀ AU TOUR D'AVANT ? C'est la seule façon de
// distinguer une OUVERTURE d'un simple redessin : les écrans réécrivent leur
// section à chaque geste, et la tuile qui en ressort est un élément NEUF. Un
// marqueur posé dessus ne survit pas à un `innerHTML` — *mesuré : la tuile se
// remorphait à chaque frappe, donc restait à la taille d'un rond.*
let tuileOuverte = false;

// LA GÉOMÉTRIE DE MISE EN PAGE, ET SURTOUT PAS `getBoundingClientRect` — deux
// pièges se sont payés comptant avec lui, et tous deux faussaient le repère
// ENTRE les deux mesures d'un même mouvement :
//
// — LE DÉFILEMENT DU FOCUS. Donner le focus au champ fait défiler la page, et ce
//   défilement arrive APRÈS le clic mais AVANT le rendu qu'on observe. *Mesuré :
//   le rond partait de 1038 px sous la tuile, alors qu'ils sont à 18 px l'un de
//   l'autre.*
// — L'ANCÊTRE TRANSFORMÉ. Un `transform` sur une section fait d'elle le bloc
//   conteneur de ses descendants `position: fixed` : ils cessent d'être ancrés à
//   la fenêtre et suivent la page. L'animation d'entrée d'un espace en pose un.
//
// `offsetLeft/Top/Width/Height` ignorent l'un et l'autre : ils décrivent la
// boîte dans son bloc conteneur, avant toute transformation. Il faut donc que
// les deux formes partagent ce conteneur — sinon on ne compare rien, et l'on
// préfère ne pas animer du tout.
// ELLE REND LE CENTRE, pas le coin, et elle a besoin qu'on lui dise où tombe ce
// centre dans la boîte : `offsetLeft` ignore les transformations, y compris
// celle que l'élément porte À DEMEURE. La tuile est centrée par un
// `left: 50%` + `translateX(-50%)` — son centre visuel tombe donc EXACTEMENT sur
// `offsetLeft`, pas à `offsetLeft + largeur / 2`. *Sans cette part, le rond
// partait de 33 px à gauche de la tuile alors qu'il vit à sa droite.*
const formeDeMiseEnPage = (element, partX = 0.5) => ({
  hote: element.offsetParent,
  centreX: element.offsetLeft + element.offsetWidth * partX,
  centreY: element.offsetTop + element.offsetHeight / 2,
  width: element.offsetWidth,
  height: element.offsetHeight,
});

document.addEventListener(
  'click',
  (evenement) => {
    const plus = evenement.target.closest('.ouvrir-capture');
    if (plus) formeDuPlus = formeDeMiseEnPage(plus);
  },
  true,
);

const COURBE_MORPH = 'cubic-bezier(0.2, 0.9, 0.25, 1)';
const DUREE_MORPH = 260;

// Le morph d'une boîte vers une autre. `avant` est le transform que l'élément
// porte déjà et qu'il faut garder — la tuile est centrée par un
// `translateX(-50%)`, et l'écraser la ferait partir d'un demi-écran à droite.
//
// LE RAYON PART DE 50 %, et c'est ce qui donne le rond sans calcul : un rayon
// en pourcentage suit la boîte, donc une fois celle-ci mise à l'échelle du
// bouton, l'ellipse tombe exactement sur son cercle. Un rayon en pixels aurait
// été mis à l'échelle lui aussi, et le départ n'aurait pas été rond.
// Elle REND la forme d'arrivée, mesurée avant d'animer : c'est la seule fenêtre
// où l'élément est encore au repos, et c'est de cette forme-là que partira le
// mouvement inverse. *Mesurée pendant l'animation, la tuile rend sa boîte
// ÉCRASÉE — `getBoundingClientRect` compte les transformations : 53 px de large
// au lieu de 510, et le retour partait donc d'un rond posé sur un rond.*
function morpherDepuis(element, depart, { avant = '', partX = 0.5 } = {}) {
  const arrivee = formeDeMiseEnPage(element, partX);
  if (sansAnimation() || !depart || !depart.width) return arrivee;
  if (!arrivee.width || !arrivee.height) return arrivee;
  // Deux boîtes qui ne pendent pas du même conteneur ne se comparent pas.
  if (depart.hote !== arrivee.hote) return arrivee;

  const echelleX = depart.width / arrivee.width;
  const echelleY = depart.height / arrivee.height;
  const ecartX = depart.centreX - arrivee.centreX;
  const ecartY = depart.centreY - arrivee.centreY;

  element.animate(
    [
      {
        transform: `${avant} translate(${ecartX}px, ${ecartY}px) scale(${echelleX}, ${echelleY})`,
        borderRadius: '50%',
      },
      { transform: avant || 'none', borderRadius: getComputedStyle(element).borderRadius },
    ],
    { duration: DUREE_MORPH, easing: COURBE_MORPH },
  );

  // LE CONTENU NE S'ÉTIRE PAS AVEC LA BOÎTE, IL S'ALLUME DEDANS. Un champ et
  // cinq pastilles écrasés à un sixième de leur largeur puis relâchés, c'est
  // un accordéon de texte — on le voit, et c'est laid. Ils restent invisibles
  // le temps que la forme se fasse, et arrivent sur la fin.
  for (const enfant of element.children) {
    enfant.animate([{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], {
      duration: DUREE_MORPH,
      easing: 'linear',
    });
  }

  return arrivee;
}

new MutationObserver(() => {
  // Une tuile qui vit dans un espace MASQUÉ ne compte pas. La capture des
  // Tâches reste ouverte après un envoi — c'est voulu, on en note rarement une
  // seule — et son élément survit dans le DOM quand on change d'onglet. Sans
  // ce `:not([hidden])`, la page entière restait figée sur tous les autres
  // espaces : plus moyen de faire défiler l'accueil après avoir noté une tâche.
  const tuile = document.querySelector('.espace:not([hidden]) .capture');

  // LE MORPH PASSE AVANT LE FIGEAGE DU FOND, et l'ordre n'est pas indifférent :
  // `figerLeFond` sort le corps du flux et `libererLeFond` lui rend son
  // défilement, ce qui DÉPLACE le repère entre deux mesures. *Mesuré : le retour
  // partait 1083 px trop bas — exactement le défilement rendu à la page.* Les
  // deux formes d'un même mouvement se mesurent dans le même repère, donc des
  // deux côtés de cette bascule, jamais à cheval dessus.
  morpherLaCapture(tuile);

  if (tuile || document.querySelector('.menu-voile:not([hidden])')) figerLeFond();
  else libererLeFond();
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['hidden'],
});

function morpherLaCapture(tuile) {
  // L'ALLER : le rond vient d'être remplacé par la tuile.
  if (tuile) {
    if (!tuileOuverte) {
      tuileOuverte = true;
      // PAS D'ALLER, PAS DE RETOUR. La tuile s'ouvre aussi en touchant un jour
      // du calendrier ou une case de « Ma semaine » — le rond n'y est pour rien,
      // et la voir se refermer en rond serait un mouvement venu de nulle part.
      formeDeLaTuile = formeDuPlus
        ? morpherDepuis(tuile, formeDuPlus, { avant: 'translateX(-50%)', partX: 0 })
        : null;
      formeDuPlus = null;
      // LA TUILE REMONTE ENSUITE AVEC LE CLAVIER (`--bas-clavier`, une
      // transition sur `bottom`), et le retour doit partir d'où elle est
      // VRAIMENT au moment de l'envoi. Sur ordinateur il n'y a pas de clavier
      // virtuel, la transition ne joue pas, et la première mesure suffit.
      if (formeDeLaTuile) {
        tuile.addEventListener('transitionend', (evenement) => {
          if (evenement.propertyName === 'bottom' && evenement.target === tuile) {
            formeDeLaTuile = formeDeMiseEnPage(tuile, 0);
          }
        });
      }
    }
    return;
  }

  // LE RETOUR : la tuile est partie — la tâche vient d'être envoyée, ou la
  // tuile refermée — et le rond réapparaît. Il se rétracte depuis la barre.
  //
  // On ne peut pas animer la tuile elle-même : au moment où on l'apprend, elle
  // n'est plus dans le document. C'est donc le rond qui joue le trajet, et le
  // mouvement se lit pareil — une forme qui se referme sur l'autre.
  if (!tuileOuverte) return;
  tuileOuverte = false;
  if (!formeDeLaTuile) return;
  const depart = formeDeLaTuile;
  formeDeLaTuile = null;

  // LE ROND EST PARFOIS TOUJOURS LÀ, et c'est voulu : sur l'espace Tâches, le
  // « + » reste en place pendant qu'on écrit — « elle vole au-dessus de la page,
  // elle ne la remplace pas ». Le mouvement se lit pareil dans les deux cas :
  // qu'il vienne de réapparaître ou qu'il n'ait jamais bougé, on le voit se
  // rétracter depuis la barre.
  const plus = document.querySelector('.espace:not([hidden]) .ouvrir-capture');
  if (plus) morpherDepuis(plus, depart);
}

// --- La surbrillance d'un bouton -----------------------------------------
//
// Un éclair très court sous le doigt (demande de Noé, 13 août 2026). Posé ici,
// une fois, plutôt que dans chaque écran : tous les boutons du hub et des deux
// sites vivent dans ce document, et un effet de cette nature n'a pas à être
// rebranché à chaque espace.
//
// `pointerdown` et non `click` : c'est l'instant du toucher qui doit répondre,
// pas celui du relâchement. Les pastilles de la tuile annulent leur
// `pointerdown` pour ne pas voler le focus — `preventDefault` n'empêche pas cet
// écouteur-ci de s'exécuter, elles s'éclairent donc comme les autres.
document.addEventListener(
  'pointerdown',
  (evenement) => {
    // Le cercle d'une tâche a sa propre animation, plus parlante : la coche qui
    // se dessine. Deux effets sur le même geste se gêneraient.
    // `nav a` en plus des boutons : les onglets du hub et ceux des deux sites
    // sont des liens, mais ils se touchent comme des boutons. Les trois barres
    // sont des `<nav>`, la règle vaut donc pour les trois d'un coup.
    const bouton = evenement.target.closest('button, [role="button"], nav a');
    if (!bouton || bouton.classList.contains('tache-cercle') || bouton.disabled) return;

    bouton.classList.remove('eclair');
    void bouton.offsetWidth; // relance l'animation sur deux appuis rapprochés
    bouton.classList.add('eclair');
    bouton.addEventListener('animationend', () => bouton.classList.remove('eclair'), {
      once: true,
    });
  },
  // En capture : un écouteur qui appelle `stopPropagation` plus bas dans
  // l'arbre — le calendrier en a — priverait sinon son bouton de l'effet.
  true,
);

// --- LE BALAYAGE ENTRE ONGLETS ------------------------------------------------
//
// Demande de Noé (29 août 2026) : « pouvoir slider, essentiellement sur
// téléphone, pour passer d'un onglet à un autre, EN PLUS de la possibilité
// d'appuyer sur leur boutons ». Le geste s'ajoute, il ne remplace rien — un
// geste invisible ne s'apprend pas tout seul.
//
// LA PAGE SUIT LE DOIGT (29 août au soir, seconde demande : « le slide n'est
// pas fluide du tout »). La première version naviguait au relâchement et
// l'écran basculait d'un coup : rien ne suivait la main, donc rien ne disait
// que le geste avait pris. C'est ça qu'on lit comme « pas fluide » — pas la
// durée de l'animation, l'absence de prise.
//
// Il ne vaut QUE POUR LES TROIS ONGLETS. Depuis `#objectifs` ou `#taches`, un
// balayage ne fait rien : ces pages sont au second rang, on y est entré par une
// décision, et en sortir par un geste involontaire annulerait cette décision.
// Les sites Yuno et FCH n'y sont pas non plus, et cela découle de la même liste.
const ONGLETS_BALAYABLES = ['dashboard', 'perso', 'calendrier'];

const BALAYAGE = {
  reconnu: 12, // px : en deçà, on ne sait pas encore ce que le doigt veut
  distance: 60, // px : sous ce seuil au relâchement, c'est un appui qui a glissé
  pente: 2, // le geste doit être 2× plus horizontal que vertical
  duree: 600, // ms : un doigt posé puis déplacé n'est pas un balayage
  prise: 0.9, // ce que l'écran suit du doigt — presque tout, donc « collé »
  plafond: 0.26, // au plus, une fraction de la largeur : la page ne sort pas
  voile: 0.45, // ce que la page perd d'opacité au bout de sa course
  bord: 0.16, // au bout de la série, l'écran résiste et revient : « il n'y a rien »
  sortie: 190, // ms de l'animation qui achève le geste
};

// UN ANCÊTRE QUI DÉFILE HORIZONTALEMENT NE GARDE LE GESTE QUE S'IL PEUT ENCORE
// DÉFILER DE CE CÔTÉ-LÀ (29 août 2026, correction de Noé : « que je puisse
// slider depuis partout sur l'écran, actuellement ce n'est que aux
// extrémités »).
//
// La première version refusait le geste dès qu'un défileur se trouvait sous le
// doigt, quel que soit le sens. Sur l'accueil, le rail des projets et la grille
// de la semaine occupent le milieu de l'écran : il ne restait que les marges,
// ce qui revenait à ne pas avoir le geste du tout.
//
// La règle juste est celle des carrousels imbriqués : le rail garde le geste
// tant qu'il lui reste des tuiles de ce côté, et le rend à la page quand il est
// au bout. C'est ce que fait le doigt naturellement — on pousse le rail jusqu'à
// sa fin, puis on continue et c'est la page qui tourne. La décision se prend
// donc au PREMIER MOUVEMENT et non au poser du doigt : avant, on ne connaît pas
// encore le sens.
function unDefileurGardeLeGeste(depuis, dx) {
  for (let noeud = depuis; noeud && noeud !== document.body; noeud = noeud.parentElement) {
    if (noeud.scrollWidth <= noeud.clientWidth + 1) continue;
    const mode = getComputedStyle(noeud).overflowX;
    if (mode !== 'auto' && mode !== 'scroll') continue;

    // Le doigt va vers la GAUCHE : on veut voir ce qui est à droite, donc le
    // conteneur augmenterait son défilement. L'inverse pour l'autre sens.
    const reste =
      dx < 0
        ? noeud.scrollLeft < noeud.scrollWidth - noeud.clientWidth - 1
        : noeud.scrollLeft > 1;
    if (reste) return true;
  }
  return false;
}


let balayage = null;
// UN GESTE À LA FOIS. Entre le relâchement et la navigation, il s'écoule le
// temps de l'animation ; un second balayage lancé dans cet intervalle repartait
// du MÊME onglet — `routeCourante` n'avait pas encore changé — et faisait
// sauter deux crans. C'est ce qui ramenait à l'accueil depuis le calendrier.
let passageEnCours = false;
// La direction du dernier passage, lue par `afficherEspace` pour que l'écran
// entrant arrive du côté d'où le doigt l'a appelé. Sans elle, on glisserait
// dehors pour réapparaître par le bas, et le mouvement se contredirait.
let entreeDepuis = 0;

function sectionDe(nom) {
  return document.getElementById(`espace-${nom}`);
}

// Le suivi vit sur la SECTION de l'espace courant. Elle porte tout ce que la
// page montre, elle est déjà un bloc de composition, et la translation reste
// donc au GPU — c'est ce qui fait la différence entre « ça colle au doigt » et
// « ça saccade ».
function tenirLaPage(section, decalage, part = 0) {
  section.style.transition = 'none';
  section.style.transform = decalage ? `translateX(${decalage}px)` : '';
  section.style.willChange = decalage ? 'transform, opacity' : '';
  // LA PAGE S'ESTOMPE À MESURE QU'ELLE S'ÉLOIGNE. Ce qu'elle libère est du vide
  // — on ne montre pas l'écran voisin, qui n'est pas forcément monté — et un
  // bord net contre ce vide se lit comme un trou. En s'effaçant, elle dit
  // qu'elle s'en va, et l'arrivée de l'autre écran enchaîne sur la même idée.
  section.style.opacity = part ? String(1 - Math.min(1, part) * BALAYAGE.voile) : '';
}

function lacherLaPage(section, { anime = true } = {}) {
  if (!section) return;
  section.style.transition = anime
    ? 'transform 190ms cubic-bezier(0.2, 0, 0, 1), opacity 190ms ease-out'
    : 'none';
  section.style.transform = '';
  section.style.willChange = '';
  section.style.opacity = '';
  document.body.classList.remove('balaye');
}

document.addEventListener(
  'pointerdown',
  (evenement) => {
    // LE TACTILE SEULEMENT. Une souris qu'on traîne sur 60 px en sélectionnant
    // du texte est un geste ordinaire sur ordinateur ; le lire comme un
    // changement de page ferait perdre la sélection ET la page.
    balayage =
      evenement.pointerType === 'touch' && !passageEnCours
        ? { x: evenement.clientX, y: evenement.clientY, debut: performance.now(), pris: false }
        : null;
  },
  { passive: true },
);

document.addEventListener(
  'pointermove',
  (evenement) => {
    if (!balayage) return;
    const dx = evenement.clientX - balayage.x;
    const dy = evenement.clientY - balayage.y;

    if (!balayage.pris) {
      // Un geste vertical n'est pas à nous : on se retire pour de bon, sinon on
      // reprendrait la main au milieu d'un défilement.
      if (Math.abs(dy) > BALAYAGE.reconnu && Math.abs(dy) > Math.abs(dx)) {
        balayage = null;
        return;
      }
      if (Math.abs(dx) < BALAYAGE.reconnu) return;

      // C'est ici, et pas au poser du doigt, qu'on sait de quel côté il va.
      if (unDefileurGardeLeGeste(evenement.target, dx)) {
        balayage = null;
        return;
      }
      // UNE COUCHE VISIBLE garde le geste : il appartient à ce qu'elle contient,
      // pas à la page qu'elle recouvre. On regarde ce qui est RÉELLEMENT
      // déplié, et non `body.fond-fige` : celui-ci reste posé tant qu'une tuile
      // de capture existe dans l'espace courant, même repliée, et il coupait
      // donc le balayage sur des écrans entiers — le calendrier le premier.
      if (document.querySelector('#menu-voile:not([hidden])')) return void (balayage = null);
      if (document.querySelector('.espace:not([hidden]) .capture:not([hidden])'))
        return void (balayage = null);
      if (document.querySelector('.ajout-volant[open]')) return void (balayage = null);

      const rang = ONGLETS_BALAYABLES.indexOf(routeCourante?.espace);
      if (rang === -1) return void (balayage = null);

      balayage.pris = true;
      balayage.rang = rang;
      balayage.section = sectionDe(routeCourante.espace);
      if (sansAnimation()) return;
      document.body.classList.add('balaye');
    }

    if (sansAnimation() || !balayage.section) return;

    // AU BOUT DE LA SÉRIE, L'ÉCRAN RÉSISTE au lieu de refuser en silence : il
    // suit d'un sixième et revient. C'est la seule façon de dire « il n'y a
    // rien de ce côté » sans écrire un mot ni bloquer le doigt.
    const vers = balayage.rang + (dx < 0 ? 1 : -1);
    const auBord = vers < 0 || vers >= ONGLETS_BALAYABLES.length;
    const largeur = window.innerWidth;
    const brut = dx * (auBord ? BALAYAGE.bord : BALAYAGE.prise);
    const limite = largeur * (auBord ? BALAYAGE.bord : BALAYAGE.plafond);

    const decalage = Math.max(-limite, Math.min(limite, brut));
    tenirLaPage(
      balayage.section,
      decalage,
      auBord ? 0 : Math.abs(decalage) / (largeur * BALAYAGE.plafond),
    );
  },
  { passive: true },
);

// Un scroll vertical fait annuler le pointeur par le navigateur : `pointerup`
// n'arrive alors jamais, et la page doit reprendre sa place.
document.addEventListener(
  'pointercancel',
  (evenement) => {
    const depart = balayage;
    balayage = null;
    if (!depart) return;

    // LE NAVIGATEUR PEUT NOUS COUPER EN PLEIN GESTE, et c'est fréquent sur
    // téléphone : il reprend le pointeur dès qu'il croit à un défilement, et
    // `pointerup` n'arrive alors jamais. Si le geste était DÉJÀ pris et déjà
    // franc, l'intention était claire — on le mène à son terme plutôt que de
    // laisser la page revenir en arrière sous le doigt. `touch-action: pan-y`
    // (css/styles.css) rend le cas rare ; ce filet le rend inoffensif.
    const dx = evenement.clientX - depart.x;
    if (depart.pris && Math.abs(dx) >= BALAYAGE.distance) return acheverLeBalayage(depart, dx);
    lacherLaPage(depart.section);
  },
  { passive: true },
);

// LA CONCLUSION DU GESTE, partagée par le relâchement et par l'annulation du
// navigateur : deux chemins mènent ici, et un seul décide.
function acheverLeBalayage(depart, dx) {
  const section = depart.section;

  // Vers la gauche, on avance — le geste de tourner une page. Aux deux bouts,
  // il ne se passe rien : boucler du calendrier à l'accueil ferait passer deux
  // écrans d'un coup sans qu'on l'ait demandé.
  const vers = depart.rang + (dx < 0 ? 1 : -1);
  if (vers < 0 || vers >= ONGLETS_BALAYABLES.length) return lacherLaPage(section);

  const sens = dx < 0 ? -1 : 1;
  if (sansAnimation()) {
    lacherLaPage(section, { anime: false });
    location.hash = `#${ONGLETS_BALAYABLES[vers]}`;
    return;
  }

  // ON ACHÈVE LE MOUVEMENT AVANT DE NAVIGUER : la page finit de sortir du côté
  // où le doigt l'emmenait, puis l'écran suivant arrive de l'autre bord.
  // Naviguer tout de suite ferait disparaître la page au milieu de son geste —
  // c'est exactement ce qui manquait à la première version.
  section.style.transition = `transform ${BALAYAGE.sortie}ms cubic-bezier(0.4, 0, 1, 1),
    opacity ${BALAYAGE.sortie}ms ease-out`;
  section.style.transform = `translateX(${sens * window.innerWidth * BALAYAGE.plafond}px)`;
  section.style.opacity = '0';

  entreeDepuis = sens;
  passageEnCours = true;
  setTimeout(() => {
    // Les styles partent AVANT la navigation : une section laissée translatée
    // reviendrait de travers au prochain passage sur cet onglet.
    section.style.cssText = '';
    document.body.classList.remove('balaye');
    location.hash = `#${ONGLETS_BALAYABLES[vers]}`;
    // Levé APRÈS la navigation, le temps que `routeCourante` se mette à jour :
    // le geste suivant repart alors du bon onglet.
    //
    // PAR UN DÉLAI ET NON PAR `requestAnimationFrame` : celui-ci ne s'exécute
    // pas quand la page est masquée — écran verrouillé, application passée en
    // arrière-plan. Le verrou serait resté posé pour toujours, et plus aucun
    // balayage n'aurait fonctionné jusqu'au rechargement. Trouvé en mesurant,
    // parce que le panneau d'essai était caché.
    setTimeout(() => { passageEnCours = false; }, 50);
  }, BALAYAGE.sortie);
}

document.addEventListener(
  'pointerup',
  (evenement) => {
    const depart = balayage;
    balayage = null;
    if (!depart?.pris) return;

    const dx = evenement.clientX - depart.x;
    const dy = evenement.clientY - depart.y;

    const franc =
      Math.abs(dx) >= BALAYAGE.distance &&
      Math.abs(dx) >= Math.abs(dy) * BALAYAGE.pente &&
      performance.now() - depart.debut <= BALAYAGE.duree;

    if (!franc) return lacherLaPage(depart.section);
    acheverLeBalayage(depart, dx);
  },
  { passive: true },
);

function afficherEspace() {
  const route = analyserAdresse(location.hash);
  const nom = route.espace;

  if (routeCourante) defilements.set(adressePour(routeCourante), window.scrollY);
  const memeEspace = routeCourante?.espace === nom;
  routeCourante = route;

  // Sur les sites Yuno et FCH, le titre ne mentionne pas le hub : on en est sorti.
  const TITRES_SITES = { yuno: 'Yuno · yuno_rph', hermitage: 'FC Hermitage' };
  const titre = TITRES_VUES[nom]?.[route.vue] ?? TITRES[nom];
  document.title = TITRES_SITES[nom] ?? `${titre} — ${TITRE_BASE}`;

  for (const section of document.querySelectorAll('.espace')) {
    section.hidden = section.dataset.espace !== nom;
  }

  // Un fondu très court à l'arrivée sur un espace. Sans lui, changer d'onglet
  // est un `hidden` qui bascule : l'écran CLAQUE d'un état à l'autre, et c'est
  // ce que l'œil lit comme « pas fluide ». 130 ms et 4 px suffisent à le lire
  // comme un mouvement plutôt que comme un remplacement. Le site Yuno a le sien
  // depuis toujours (`vue-entre`), le hub n'avait rien.
  //
  // Seulement au CHANGEMENT D'ESPACE : `afficherEspace` est aussi appelé quand
  // on navigue à l'intérieur d'un espace, et faire respirer la page entière à
  // chaque écran ouvert serait pire que pas d'animation du tout.
  //
  // La classe est retirée à la fin : `both` la ferait durer, et un élément dont
  // la transformation est animée devient le repère de ses descendants en
  // `position: fixed` — c'est le bug qui décalait toutes les fenêtres de Yuno.
  if (!memeEspace) {
    const entrant = document.getElementById(`espace-${nom}`);
    // L'ÉCRAN ARRIVE DU CÔTÉ D'OÙ LE DOIGT L'A APPELÉ (29 août 2026). Après un
    // balayage, le fondu vertical se contredisait avec le geste : la page
    // sortait par la droite et la suivante remontait par le bas. `entreeDepuis`
    // porte le sens du dernier balayage, et rien d'autre ne le pose — un clic
    // d'onglet garde donc le fondu d'origine.
    const glisse =
      entreeDepuis < 0 ? 'espace-entre-droite' : entreeDepuis > 0 ? 'espace-entre-gauche' : '';
    const classe = glisse || 'espace-entre';
    entreeDepuis = 0;

    entrant.classList.remove('espace-entre', 'espace-entre-droite', 'espace-entre-gauche');
    void entrant.offsetWidth; // redémarre l'animation si on revient très vite
    entrant.classList.add(classe);
    entrant.addEventListener(
      'animationend',
      () => entrant.classList.remove(classe),
      { once: true },
    );
  }
  for (const lien of document.querySelectorAll('[data-nav]')) {
    const actif = lien.dataset.nav === nom;
    lien.classList.toggle('actif', actif);
    if (actif) {
      lien.setAttribute('aria-current', 'page');
    } else {
      lien.removeAttribute('aria-current');
    }
  }

  // Le thème de l'espace courant colore l'ensemble de la page.
  document.body.dataset.espace = nom;
  actualiserTitreDuHub();

  // Six onglets ne tiennent pas sur 375 px : la barre défile, et on ramène
  // l'onglet actif dans le champ pour qu'il ne reste jamais hors écran.
  centrerActif(document.querySelector('.navigation'));

  if (!espacesMontes.has(nom)) {
    espacesMontes.add(nom);
    // Un espace peut charger ses données de façon asynchrone. S'il échoue sans
    // le rattraper lui-même, on le démonte pour qu'un retour sur l'onglet
    // rejoue la tentative.
    const section = document.getElementById(`espace-${nom}`);
    Promise.resolve(espaces[nom].monter(section, route)).catch(
      (erreur) => {
        console.error(`Montage de l'espace ${nom} impossible`, erreur);
        espacesMontes.delete(nom);
      },
    );
  } else if (memeEspace) {
    // Déjà monté et on reste dedans : l'espace n'a qu'à changer d'écran.
    espaces[nom].naviguer?.(route);
  } else {
    // On REVIENT sur un espace déjà monté. Il n'est pas remonté — ses écouteurs
    // sont posés sur la section, qui survit à `innerHTML`, et un second montage
    // les doublerait — mais il relit ses données. Sans ça, une tâche créée
    // depuis le calendrier restait invisible sur l'accueil jusqu'au prochain
    // rechargement de la page.
    //
    // `rafraichir` est facultatif : un espace qui ne lit rien n'en a pas besoin.
    // S'il échoue, on garde ce qui est affiché — c'est périmé, pas cassé.
    espaces[nom].naviguer?.(route);
    Promise.resolve(espaces[nom].rafraichir?.()).catch((erreur) => {
      console.error(`Rafraîchissement de l'espace ${nom} impossible`, erreur);
    });
  }

  // On revient à la position quittée, ou en haut pour une adresse nouvelle.
  window.scrollTo(0, defilements.get(adressePour(route)) ?? 0);
}

// --- Connexion --------------------------------------------------------------

formConnexion.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  erreurConnexion.hidden = true;
  boutonConnexion.disabled = true;
  boutonConnexion.textContent = 'Connexion…';

  try {
    await connexion(
      document.getElementById('email').value.trim(),
      document.getElementById('motdepasse').value,
    );
    // La suite est prise en charge par surChangementSession.
  } catch (erreur) {
    erreurConnexion.textContent = messageErreur(erreur);
    erreurConnexion.hidden = false;
  } finally {
    boutonConnexion.disabled = false;
    boutonConnexion.textContent = 'Se connecter';
  }
});

function messageErreur(erreur) {
  const code = erreur?.code ?? '';
  if (code === 'invalid_credentials') return 'E-mail ou mot de passe incorrect.';
  if (code === 'email_not_confirmed') return "Cette adresse n'est pas confirmée.";
  if (erreur?.name === 'AuthRetryableFetchError') {
    return 'Connexion au serveur impossible. Vérifie ta connexion internet.';
  }
  return erreur?.message ?? 'La connexion a échoué.';
}

boutonDeconnexion.addEventListener('click', async () => {
  await deconnexion();
});

// --- Démarrage --------------------------------------------------------------

async function appliquerSession(session) {
  if (session) {
    // Les séries rattrapent leur retard AVANT le premier affichage : une
    // rubrique hebdomadaire dont l'occurrence du jour n'existe pas encore
    // manquerait à l'appel, et « Aujourd'hui » mentirait. La lecture est d'une
    // ligne ; l'écriture n'a lieu que si des occurrences manquent vraiment.
    try {
      await rafraichirLesSeries();
      // Les tâches que les événements font naître : la préparation à J-2, le
      // tri des photos à J+1. Même moment et même raison que les séries — une
      // chose qui devrait exister aujourd'hui doit exister AVANT le premier
      // affichage, sinon « Aujourd'hui » ment. Rejouable : l'index unique fait
      // que poser deux fois ne pose qu'une ligne.
      await poserCeQuUnEvenementFaitNaitre();
    } catch (erreur) {
      console.error('Génération des occurrences impossible', erreur);
    }
    afficherEcran('app');
    afficherEspace();
  } else {
    // À la déconnexion, on vide les espaces : ni données affichées derrière
    // l'écran de connexion, ni contenu périmé à la reconnexion suivante.
    // Le cache de session part avec eux — il porte les mêmes données, et un
    // écran de connexion devant un carnet de contacts encore en mémoire
    // n'aurait aucun sens.
    for (const section of document.querySelectorAll('.espace')) {
      section.innerHTML = '';
    }
    viderLesCaches();
    espacesMontes.clear();
    defilements.clear();
    routeCourante = null;
    document.title = TITRE_BASE;
    formConnexion.reset();
    afficherEcran('connexion');
  }
}

// Refermer une tuile d'ajout : le fond, la croix, ou Échap. Posé UNE FOIS pour
// tout le site — dix-sept formulaires sur cinq écrans s'ouvrent en tuile, et
// dix-sept copies du même geste finiraient par se contredire. Le `<details>`
// porte l'état : le refermer suffit, il n'y a rien d'autre à défaire.
document.addEventListener('click', (evenement) => {
  const fermeture = evenement.target.closest('[data-fermer-ajout]');
  if (fermeture) fermeture.closest('.ajout-volant')?.removeAttribute('open');
});

document.addEventListener('keydown', (evenement) => {
  if (evenement.key !== 'Escape') return;
  for (const tuile of document.querySelectorAll('.ajout-volant[open]')) {
    tuile.removeAttribute('open');
  }
});

window.addEventListener('hashchange', () => {
  if (!app.hidden) afficherEspace();
});

// La session en localStorage est relue au démarrage : rester connecté d'une
// visite à l'autre ne demande rien de plus.
try {
  await appliquerSession(await sessionCourante());
} catch (erreur) {
  console.error('Lecture de la session impossible', erreur);
  appliquerSession(null);
}

surChangementSession(appliquerSession);

// La coquille se met en cache pour les prochaines ouvertures : un service
// worker sert HTML, CSS, JS et polices depuis l'appareil (voir sw.js — les
// données Supabase, elles, ne passent jamais par lui). Enregistré après le
// démarrage pour ne rien lui coûter ; s'il échoue (navigation privée, vieux
// navigateur), le hub marche exactement comme avant.
//
// `import.meta.url` et pas un chemin nu : depuis un module, une adresse
// relative se résout contre le module — `'sw.js'` chercherait `js/sw.js`.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(new URL('../sw.js', import.meta.url))
    .catch((erreur) => console.error('Service worker non enregistré', erreur));
}
