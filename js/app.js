// Point d'entrée : garde la session, montre le bon écran, route vers les espaces.

import { sessionCourante, connexion, deconnexion, surChangementSession } from './api.js';
import dashboard from './dashboard.js';
import formation from './formation.js';
import photo from './photo.js';
import fch from './fch.js';
import perso from './perso.js';

const espaces = { dashboard, formation, photo, fch, perso };
const ESPACE_PAR_DEFAUT = 'dashboard';

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

function espaceDemande() {
  const nom = location.hash.replace('#', '');
  return nom in espaces ? nom : ESPACE_PAR_DEFAUT;
}

function afficherEspace() {
  const nom = espaceDemande();

  for (const section of document.querySelectorAll('.espace')) {
    section.hidden = section.id !== nom;
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
    Promise.resolve(espaces[nom].monter(document.getElementById(nom))).catch((erreur) => {
      console.error(`Montage de l'espace ${nom} impossible`, erreur);
      espacesMontes.delete(nom);
    });
  }

  document.getElementById('vue').scrollTo?.(0, 0);
  window.scrollTo(0, 0);
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
