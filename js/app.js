// Point d'entrée : garde la session, montre le bon écran, route vers les espaces.

import {
  sessionCourante,
  connexion,
  deconnexion,
  surChangementSession,
  rafraichirLesSeries,
} from './api.js';
import { centrerActif, ongletCalendrier } from './calendrier-commun.js';
import { viderLesCaches } from './cache-session.js';
import dashboard from './dashboard.js';
import taches from './taches.js';
import objectifs from './objectifs.js';
import calendrier from './calendrier.js';
import formation from './formation.js';
import photo from './photo.js';
import yuno from './yuno.js';
import fch from './fch.js';
import hermitage from './hermitage.js';
import perso from './perso.js';

// `photo` est la page Yuno du hub ; `yuno` est le site Yuno, qui masque tout
// l'habillage du hub. Deux adresses, deux sensations, une seule application.
// `objectifs` n'a pas d'entrée dans la barre (demande de Noé, 25 août 2026) :
// on y vient par la porte du bloc « Tes objectifs », et rarement.
const espaces = {
  dashboard, taches, objectifs, calendrier, formation, photo, yuno, fch, hermitage, perso,
};

// Trois pages d'entrée pour trois applications sur l'écran d'accueil :
// index.html (le hub), yuno.html, hermitage.html. Chacune a son manifeste, son
// icône et son nom ; toutes chargent le même js/app.js. L'entrée décide
// seulement de l'espace ouvert quand l'adresse ne dit rien.
const ENTREE = document.body.dataset.entree ?? 'hub';
const ESPACE_PAR_DEFAUT = ENTREE === 'hub' ? 'dashboard' : ENTREE;

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

      <!-- Tâches en deuxième position, juste après l'accueil (demande de Noé,
           13 août 2026) : c'est l'écran où l'on va le plus souvent après le
           check-in, il n'a pas à se gagner au bout de la rangée.
           Perso suit : le hub existe pour servir Noé, la vie hors espaces ne
           passe pas après les espaces.
           Le calendrier, lui, reste tout à droite et en icône : ce n'est pas un
           espace de plus, c'est la vue qui les traverse tous. -->
      <nav class="navigation" aria-label="Espaces">
        <a href="#dashboard" data-nav="dashboard">Accueil</a>
        <a href="#taches" data-nav="taches">Tâches</a>
        <a href="#perso" data-nav="perso">Perso</a>
        <a href="#fch" data-nav="fch">FCH</a>
        <a href="#formation" data-nav="formation">Formation</a>
        <a href="#photo" data-nav="photo">Yuno</a>
        ${ongletCalendrier('#calendrier', false)}
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

const TITRES = {
  dashboard: 'Accueil',
  taches: 'Tâches',
  objectifs: 'Objectifs',
  calendrier: 'Calendrier',
  formation: 'Formation',
  photo: 'Yuno',
  yuno: 'Yuno',
  fch: 'FC Hermitage',
  hermitage: 'FC Hermitage',
  perso: 'Perso',
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

new MutationObserver(() => {
  // Une tuile qui vit dans un espace MASQUÉ ne compte pas. La capture des
  // Tâches reste ouverte après un envoi — c'est voulu, on en note rarement une
  // seule — et son élément survit dans le DOM quand on change d'onglet. Sans
  // ce `:not([hidden])`, la page entière restait figée sur tous les autres
  // espaces : plus moyen de faire défiler l'accueil après avoir noté une tâche.
  if (document.querySelector('.espace:not([hidden]) .capture')) figerLeFond();
  else libererLeFond();
  // `attributes` en plus de `childList` : changer d'espace ne crée ni ne
  // détruit de tuile, ça bascule un `hidden` — et c'est justement ce qui doit
  // libérer le fond.
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['hidden'],
});

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

function afficherEspace() {
  const route = analyserAdresse(location.hash);
  const nom = route.espace;

  if (routeCourante) defilements.set(adressePour(routeCourante), window.scrollY);
  const memeEspace = routeCourante?.espace === nom;
  routeCourante = route;

  // Sur les sites Yuno et FCH, le titre ne mentionne pas le hub : on en est sorti.
  const TITRES_SITES = { yuno: 'Yuno · yuno_rph', hermitage: 'FC Hermitage' };
  document.title = TITRES_SITES[nom] ?? `${TITRES[nom]} — ${TITRE_BASE}`;

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
    entrant.classList.remove('espace-entre');
    void entrant.offsetWidth; // redémarre l'animation si on revient très vite
    entrant.classList.add('espace-entre');
    entrant.addEventListener(
      'animationend',
      () => entrant.classList.remove('espace-entre'),
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
