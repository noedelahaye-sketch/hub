// La coquille en cache — le service worker des trois applications.
//
// Ouvrir le hub sur le téléphone ne doit rien attendre du réseau : HTML, CSS,
// JS, polices et icônes sont servis depuis l'appareil, puis remis à jour en
// arrière-plan. Les DONNÉES ne passent jamais par ici — tout ce qui va vers
// Supabase (tables comme photos signées) et vers l'API GitHub (le gist Bac-3)
// est laissé au réseau. Le cache de session (sessionStorage) joue déjà le rôle
// de « dernier état affiché », et un service worker qui garderait des données
// deviendrait une seconde source de vérité, exactement ce qu'on s'interdit.
//
// Le prix, assumé : après un déploiement, le téléphone peut montrer UNE FOIS la
// version précédente — la fraîche se télécharge pendant ce temps et sera là à
// l'ouverture suivante. C'est ce qui rend l'ouverture instantanée.
//
// En local, la stratégie S'INVERSE : le réseau d'abord, le cache en secours.
// Sans ça, chaque session de travail verrait une fois ses modifications
// ignorées — le piège classique du service worker en développement.

const CACHE = 'hub-coquille-v9';

const EN_LOCAL = ['localhost', '127.0.0.1'].includes(self.location.hostname);

// De quoi ouvrir les trois applications sans réseau. supabase-js en fait partie
// — sans lui, app.js ne démarre pas — et il vit maintenant dans le dépôt, donc
// il est garanti comme le reste : plus rien ici ne dépend d'un CDN.
const COQUILLE = [
  './',
  'index.html',
  'yuno.html',
  'hermitage.html',
  'manifest.json',
  'manifest-yuno.json',
  'manifest-fch.json',
  'css/styles.css',
  'css/yuno.css',
  'css/fch.css',
  'js/api.js',
  'js/app.js',
  'js/cache-session.js',
  'js/calendrier-commun.js',
  'js/club-fch.js',
  'js/calendrier.js',
  'js/dashboard.js',
  'js/ecriture.js',
  'js/gabarits.js',
  'js/fch.js',
  'js/format.js',
  'js/formation.js',
  'js/hermitage.js',
  // La table des écussons, oui ; les 97 images, non. Elles se mettent en cache
  // toutes seules à la première visite du vivier (le `fetch` ci-dessous garde
  // tout ce qui vient de chez nous), là où les précharger allongerait
  // l'installation de 800 Ko — et un seul fichier manquant ferait échouer le
  // `addAll` en entier, donc l'installation.
  'js/logos-clubs.js',
  'js/chemin.js',
  'js/menu.js',
  'js/mouvements.js',
  'js/perso.js',
  'js/temps.js',
  'js/preparations-commun.js',
  'js/photo.js',
  'js/publications.js',
  'js/objectifs.js',
  'js/objectifs-commun.js',
  'js/orientation.js',
  'js/rendez-vous.js',
  'js/revisions.js',
  'js/taches.js',
  'js/yuno.js',
  'js/vendor/supabase-js.js',
  'js/vendor/node-buffer.js',
  'js/vendor/node-process.js',
  'js/vendor/node-events.js',
  'js/vendor/node-tty.js',
  'js/vendor/node-async-hooks.js',
  'fonts/ClashDisplay-600.woff2',
  'fonts/ClashDisplay-700.woff2',
  'fonts/InstrumentSans-Variable.woff2',
  'fonts/GeistMono-Variable.woff2',
  'fonts/CanelaDeck-Regular.otf',
  'fonts/CanelaDeck-Bold.otf',
  'fonts/CanelaDeck-RegularItalic.otf',
  'fonts/CanelaDeck-BoldItalic.otf',
  'fonts/Gilroy-Regular.woff2',
  'fonts/Gilroy-Medium.woff2',
  'fonts/Gilroy-SemiBold.woff2',
  'fonts/Gilroy-Bold.woff2',
  'fonts/Gilroy-Heavy.woff2',
  'img/apple-touch-icon.png',
  'img/icone-512.png',
  'img/icone-yuno-180.png',
  'img/icone-yuno-512.png',
  'img/icone-fch-180.png',
  'img/icone-fch-512.png',
  'img/yuno-signature.png',
  'img/yuno-logo.jpg',
  'img/fch-logo.png',
  // Le pochoir de l'écusson : depuis que la barre du hub porte des signes, il
  // n'est plus seulement au site du club (27 août 2026).
  'img/fch-logo-pochoir.png',
];

self.addEventListener('install', (evenement) => {
  evenement.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(COQUILLE))
      // Le nouveau service worker prend la main sans attendre que tous les
      // onglets ferment : c'est une application personnelle, pas un site où
      // deux versions cohabiteraient longtemps.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    (async () => {
      // Un seul cache à la fois : changer son nom (v1 → v2) jette l'ancien.
      for (const nom of await caches.keys()) {
        if (nom !== CACHE) await caches.delete(nom);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evenement) => {
  const requete = evenement.request;
  if (requete.method !== 'GET') return;

  // Les données restent au réseau, toujours : Supabase (tables, auth, photos
  // signées) et l'API GitHub. En les laissant passer sans `respondWith`, le
  // navigateur fait exactement ce qu'il faisait avant ce fichier. Le hub
  // n'ayant plus aucune dépendance externe, la règle tient en une ligne : ce
  // qui n'est pas de chez nous ne nous regarde pas.
  if (new URL(requete.url).origin !== self.location.origin) return;

  evenement.respondWith(
    EN_LOCAL ? reseauPuisCache(requete) : cachePuisReseau(evenement, requete),
  );
});

// En production : ce qui est en cache part tout de suite, et la version
// fraîche se télécharge en arrière-plan pour l'ouverture suivante.
async function cachePuisReseau(evenement, requete) {
  const cache = await caches.open(CACHE);
  const gardee = await cache.match(requete);

  const revalidation = fetch(requete)
    .then((reponse) => {
      if (reponse.ok) cache.put(requete, reponse.clone());
      return reponse;
    })
    .catch(() => null);

  if (gardee) {
    // `waitUntil` : la revalidation a le droit de finir après la réponse.
    evenement.waitUntil(revalidation);
    return gardee;
  }

  const fraiche = await revalidation;
  if (fraiche) return fraiche;
  return secoursNavigation(cache, requete);
}

// En local : le réseau d'abord — le fichier qu'on vient de modifier — et le
// cache seulement quand le serveur est coupé (c'est le test hors ligne).
async function reseauPuisCache(requete) {
  const cache = await caches.open(CACHE);
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  } catch {
    const gardee = await cache.match(requete);
    if (gardee) return gardee;
    return secoursNavigation(cache, requete);
  }
}

// Hors ligne, et jamais vue : pour une navigation, la page d'entrée vaut mieux
// que l'écran d'erreur du navigateur. Pour le reste, une erreur honnête.
async function secoursNavigation(cache, requete) {
  if (requete.mode === 'navigate') {
    const entree = await cache.match('index.html');
    if (entree) return entree;
  }
  return Response.error();
}
