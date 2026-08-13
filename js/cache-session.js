// Le dernier état d'un espace, gardé le temps de l'onglet.
//
// Rouvrir l'application affiche immédiatement ce qu'on avait sous les yeux, et
// les données fraîches viennent le remplacer une fraction de seconde plus tard.
// C'est du papier peint, jamais une source : rien ici n'est lu pour décider
// quoi que ce soit, tout est réécrit dès la première réponse du serveur.
//
// `sessionStorage` et non `localStorage`, en connaissance de cause : ce sont les
// contacts de Noé, avec leurs numéros. Fermer l'onglet les efface, et la
// déconnexion aussi (voir `viderLesCaches`, appelé depuis app.js).

const PREFIXE = 'hub:cache:';

// Au-delà, le cache n'a plus d'intérêt : on ne « rouvre » plus l'app, on y
// revient. Autant montrer un squelette honnête qu'un état d'hier.
const AGE_MAX = 6 * 60 * 60 * 1000;

// `sessionStorage` tient quelques mégaoctets. On refuse bien avant : un cache
// qui déborde ferait échouer l'écriture à chaque visite, silencieusement.
const POIDS_MAX = 1_000_000;

export function lireCache(nom) {
  try {
    const brut = sessionStorage.getItem(PREFIXE + nom);
    if (!brut) return null;

    const { _ts, donnees } = JSON.parse(brut);
    if (!donnees || Date.now() - (_ts ?? 0) > AGE_MAX) {
      sessionStorage.removeItem(PREFIXE + nom);
      return null;
    }
    return donnees;
  } catch {
    // Un cache illisible n'est pas un incident : on repart des données.
    return null;
  }
}

export function ecrireCache(nom, donnees) {
  try {
    const brut = JSON.stringify({ _ts: Date.now(), donnees });
    if (brut.length > POIDS_MAX) return;
    sessionStorage.setItem(PREFIXE + nom, brut);
  } catch {
    // Quota plein, mode privé, stockage refusé : tant pis, la visite suivante
    // repassera par le squelette. Rien ne dépend de ce cache.
  }
}

export function viderLesCaches() {
  try {
    for (const cle of Object.keys(sessionStorage)) {
      if (cle.startsWith(PREFIXE)) sessionStorage.removeItem(cle);
    }
  } catch {
    // Idem : rien à rattraper.
  }
}
