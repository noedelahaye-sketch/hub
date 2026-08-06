// Point d'entrée : garde la session, montre le bon écran, route vers les espaces.

import { sessionCourante, connexion, deconnexion, surChangementSession } from './api.js';
import dashboard from './dashboard.js';
import formation from './formation.js';
import photo from './photo.js';
import yuno from './yuno.js';
import fch from './fch.js';
import perso from './perso.js';

// `photo` est la page Yuno du hub ; `yuno` est le site Yuno, qui masque tout
// l'habillage du hub. Deux adresses, deux sensations, une seule application.
const espaces = { dashboard, formation, photo, yuno, fch, perso };
const ESPACE_PAR_DEFAUT = 'dashboard';

const TITRES = {
  dashboard: 'Accueil',
  formation: 'Formation',
  photo: 'Yuno',
  yuno: 'Yuno',
  fch: 'FC Hermitage',
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

function afficherEspace() {
  const route = analyserAdresse(location.hash);
  const nom = route.espace;

  if (routeCourante) defilements.set(adressePour(routeCourante), window.scrollY);
  const memeEspace = routeCourante?.espace === nom;
  routeCourante = route;

  // Sur le site Yuno, le titre ne mentionne pas le hub : on en est sorti.
  document.title = nom === 'yuno' ? 'Yuno · yuno_rph' : `${TITRES[nom]} — ${TITRE_BASE}`;

  for (const section of document.querySelectorAll('.espace')) {
    section.hidden = section.dataset.espace !== nom;
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

function appliquerSession(session) {
  if (session) {
    afficherEcran('app');
    afficherEspace();
  } else {
    // À la déconnexion, on vide les espaces : ni données affichées derrière
    // l'écran de connexion, ni contenu périmé à la reconnexion suivante.
    for (const section of document.querySelectorAll('.espace')) {
      section.innerHTML = '';
    }
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
  appliquerSession(await sessionCourante());
} catch (erreur) {
  console.error('Lecture de la session impossible', erreur);
  appliquerSession(null);
}

surChangementSession(appliquerSession);
