// Photos Yuno — le stockage des photos du hub (Cloudflare Worker + R2).
//
// POURQUOI UN WORKER, ET PAS LE STOCKAGE DE SUPABASE (19 novembre 2026,
// décision de Noé) : une photothèque de matchs en pleine qualité dépasse vite
// le 1 Go gratuit de Supabase, alors que R2 en offre 10 et ne fait jamais payer
// la lecture. Ce compte Cloudflare est À PART de celui de la livraison des
// joueurs : deux usages, deux réserves, et 10 Go gratuits de chaque côté.
//
// CE QUE LE WORKER FAIT, ET RIEN DE PLUS :
//   — il garde les FICHIERS (l'original et sa vignette) ;
//   — il vérifie que c'est bien Noé, par la session Supabase du hub ;
//   — il donne des adresses de lecture signées, valables un temps.
// Le CLASSEMENT des photos (match, tri, ordre d'un carrousel) vit dans Supabase,
// pas ici : R2 ne sait pas chercher, une base si.
//
// Même mécanique que le Worker de la livraison : la liaison directe au bucket
// (`env.BUCKET`), donc aucune clé d'API R2 à garder nulle part, et l'envoi en
// morceaux pour qu'une vidéo de 400 Mo passe sur une connexion de stade.

const DUREE_SIGNATURE_S = 6 * 3600;   // une adresse de lecture vaut six heures
const DUREE_JETON_MS = 60 * 1000;     // une session vérifiée est crue une minute
const TAILLE_MAX_VIGNETTE = 2 * 1024 * 1024;

const enc = new TextEncoder();

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = entetesCors(req, env);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (!env.BUCKET) return json({ erreur: 'Le stockage R2 n’est pas relié (liaison BUCKET).' }, 500, cors);
      if (!env.SIGNATURE_SECRET) return json({ erreur: 'Le secret SIGNATURE_SECRET manque.' }, 500, cors);

      // La LECTURE n'a pas de session : une balise <img> ne sait pas envoyer
      // d'en-tête. C'est la signature de l'adresse qui l'autorise.
      if (url.pathname.startsWith('/f/') && ['GET', 'HEAD'].includes(req.method)) {
        return await lire(req, env, url, cors);
      }

      const utilisateur = await verifierSession(req, env);
      if (!utilisateur) return json({ erreur: 'Session absente ou expirée.' }, 401, cors);

      return await api(req, env, url, cors);
    } catch (e) {
      return json({ erreur: 'Erreur du stockage : ' + (e?.message || e) }, 500, cors);
    }
  },
};

// --- La session ---------------------------------------------------------------
// On demande à Supabase QUI porte ce jeton, plutôt que de vérifier sa signature
// soi-même : une requête de plus, mais aucune clé à recopier ni à faire tourner.
// La réponse est gardée une minute, le temps d'un envoi de cinquante photos.

const sessionsCrues = new Map();

async function verifierSession(req, env) {
  const jeton = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jeton) return null;

  const deja = sessionsCrues.get(jeton);
  if (deja && deja.jusqua > Date.now()) return deja.utilisateur;

  const r = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: 'Bearer ' + jeton },
  });
  if (!r.ok) return null;
  const utilisateur = await r.json();

  // Un seul compte a le droit d'entrer, si on l'a nommé. Les inscriptions sont
  // déjà fermées côté Supabase ; c'est une seconde serrure, pas la première.
  if (env.UTILISATEUR_ID && utilisateur.id !== env.UTILISATEUR_ID) return null;

  if (sessionsCrues.size > 50) sessionsCrues.clear();
  sessionsCrues.set(jeton, { utilisateur, jusqua: Date.now() + DUREE_JETON_MS });
  return utilisateur;
}

// --- Les routes ----------------------------------------------------------------

async function api(req, env, url, cors) {
  const p = url.pathname;
  const m = req.method;

  // Commencer un envoi : le Worker choisit la clé, jamais le navigateur.
  if (p === '/envoi/debut' && m === 'POST') {
    const b = await lireJson(req);
    const taille = Number(b.taille) || 0;
    const libre = await placeLibre(env);
    if (taille > libre) {
      return json({ erreur: 'Le stockage est plein : plus de place pour ce fichier.' }, 507, cors);
    }
    const cle = nouvelleCle(String(b.nom || 'fichier'));
    const mpu = await env.BUCKET.createMultipartUpload(cle, {
      httpMetadata: { contentType: texte(b.type, 100) || 'application/octet-stream' },
      customMetadata: { nom: texte(b.nom, 200) },
    });
    return json({ cle, envoiId: mpu.uploadId }, 200, cors);
  }

  if (p === '/envoi/morceau' && m === 'PUT') {
    const cle = url.searchParams.get('cle') || '';
    const envoiId = url.searchParams.get('envoi') || '';
    const n = parseInt(url.searchParams.get('n') || '', 10);
    if (!estUneCle(cle) || !envoiId || !(n >= 1 && n <= 10000) || !req.body) {
      return json({ erreur: 'Paramètres invalides.' }, 400, cors);
    }
    const morceau = await env.BUCKET.resumeMultipartUpload(cle, envoiId).uploadPart(n, req.body);
    return json({ n: morceau.partNumber, etag: morceau.etag }, 200, cors);
  }

  if (p === '/envoi/fin' && m === 'POST') {
    const b = await lireJson(req);
    if (!estUneCle(b.cle) || !b.envoiId || !Array.isArray(b.morceaux)) {
      return json({ erreur: 'Paramètres invalides.' }, 400, cors);
    }
    const morceaux = b.morceaux
      .map((x) => ({ partNumber: parseInt(x.n, 10), etag: String(x.etag) }))
      .sort((a, c) => a.partNumber - c.partNumber);
    const objet = await env.BUCKET.resumeMultipartUpload(b.cle, b.envoiId).complete(morceaux);
    return json({ cle: b.cle, taille: objet.size }, 200, cors);
  }

  if (p === '/envoi/annuler' && m === 'POST') {
    const b = await lireJson(req);
    if (estUneCle(b.cle) && b.envoiId) {
      try { await env.BUCKET.resumeMultipartUpload(b.cle, b.envoiId).abort(); } catch {}
    }
    return json({ ok: true }, 200, cors);
  }

  // La vignette est faite DANS LE NAVIGATEUR (le Worker ne sait pas réduire une
  // image) et rangée à côté de son original, sous le même nom.
  if (p === '/vignette' && m === 'PUT') {
    const cle = url.searchParams.get('cle') || '';
    if (!estUneCle(cle)) return json({ erreur: 'Paramètres invalides.' }, 400, cors);
    const octets = await req.arrayBuffer();
    if (!octets.byteLength || octets.byteLength > TAILLE_MAX_VIGNETTE) {
      return json({ erreur: 'Vignette vide ou trop lourde.' }, 400, cors);
    }
    await env.BUCKET.put(cleDeVignette(cle), octets, { httpMetadata: { contentType: 'image/jpeg' } });
    return json({ ok: true }, 200, cors);
  }

  // Des adresses de lecture, par lot : une galerie en demande cent d'un coup.
  if (p === '/signer' && m === 'POST') {
    const b = await lireJson(req);
    const cles = Array.isArray(b.cles) ? b.cles.filter(estUneCle).slice(0, 500) : [];
    const exp = Math.floor(Date.now() / 1000) + DUREE_SIGNATURE_S;
    const base = url.origin;
    const adresses = {};
    for (const cle of cles) {
      adresses[cle] = {
        original: await adresseSignee(env, base, cle, exp),
        vignette: await adresseSignee(env, base, cleDeVignette(cle), exp),
      };
    }
    return json({ adresses, expire: exp }, 200, cors);
  }

  if (p === '/fichier' && m === 'DELETE') {
    const cle = url.searchParams.get('cle') || '';
    if (!estUneCle(cle)) return json({ erreur: 'Paramètres invalides.' }, 400, cors);
    await env.BUCKET.delete([cle, cleDeVignette(cle)]);
    return json({ ok: true }, 200, cors);
  }

  // Ce qui est occupé, pour qu'un écran puisse le dire avant qu'il soit trop tard.
  if (p === '/place' && m === 'GET') {
    const occupe = await placeOccupee(env);
    return json({ occupe, plafond: plafond(env) }, 200, cors);
  }

  return json({ erreur: 'Adresse inconnue.' }, 404, cors);
}

// --- La lecture signée ----------------------------------------------------------

async function lire(req, env, url, cors) {
  const cle = decodeURIComponent(url.pathname.slice(3));
  const exp = parseInt(url.searchParams.get('exp') || '', 10);
  const sig = url.searchParams.get('sig') || '';
  if (!(estUneCle(cle) || estUneVignette(cle)) || !(exp > Date.now() / 1000)) {
    return new Response('Lien expiré.', { status: 403, headers: cors });
  }
  if (!egal(sig, await signer(env, cle + ':' + exp))) {
    return new Response('Lien invalide.', { status: 403, headers: cors });
  }

  // La plage d'octets compte pour les vidéos : sans elle, un navigateur ne peut
  // pas avancer dans un film sans tout télécharger.
  const objet = req.headers.has('range')
    ? await env.BUCKET.get(cle, { range: req.headers })
    : await env.BUCKET.get(cle);
  if (!objet) return new Response('Introuvable.', { status: 404, headers: cors });

  const h = new Headers(cors);
  objet.writeHttpMetadata(h);
  h.set('etag', objet.httpEtag);
  h.set('accept-ranges', 'bytes');
  // Une adresse signée ne change jamais de contenu : le navigateur peut la
  // garder jusqu'à son expiration.
  h.set('cache-control', 'private, max-age=' + DUREE_SIGNATURE_S);
  // R2 remplit `objet.range` même sans plage demandée : c'est la REQUÊTE qui
  // dit s'il faut répondre en partiel, pas l'objet. *Mesuré : une lecture
  // simple répondait 206.*
  if (req.headers.has('range') && objet.range) {
    const debut = objet.range.offset ?? 0;
    const longueur = objet.range.length ?? objet.size - debut;
    h.set('content-range', `bytes ${debut}-${debut + longueur - 1}/${objet.size}`);
    h.set('content-length', String(longueur));
    return new Response(req.method === 'HEAD' ? null : objet.body, { status: 206, headers: h });
  }
  h.set('content-length', String(objet.size));
  return new Response(req.method === 'HEAD' ? null : objet.body, { status: 200, headers: h });
}

async function adresseSignee(env, base, cle, exp) {
  const sig = await signer(env, cle + ':' + exp);
  return `${base}/f/${encodeURIComponent(cle).replace(/%2F/g, '/')}?exp=${exp}&sig=${sig}`;
}

let cleHmac = null;
async function signer(env, message) {
  if (!cleHmac || cleHmac.secret !== env.SIGNATURE_SECRET) {
    const k = await crypto.subtle.importKey(
      'raw', enc.encode(env.SIGNATURE_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    cleHmac = { secret: env.SIGNATURE_SECRET, k };
  }
  const brut = new Uint8Array(await crypto.subtle.sign('HMAC', cleHmac.k, enc.encode(message)));
  return btoa(String.fromCharCode(...brut)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Comparaison à temps constant : une signature ne se devine pas lettre à lettre.
function egal(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// --- Le rangement ----------------------------------------------------------------
// originaux/2026/11/<aléa>-<nom>     le fichier tel qu'il est arrivé
// vignettes/2026/11/<aléa>-<nom>.jpg sa vignette
// Le mois de l'ENVOI, pas celui de la prise de vue : il sert à ranger le bucket,
// pas à classer les photos — ça, c'est le travail de la base.

function nouvelleCle(nom) {
  const d = new Date();
  const mois = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  const alea = crypto.randomUUID().slice(0, 12);
  return `originaux/${mois}/${alea}-${propre(nom)}`;
}

const cleDeVignette = (cle) => cle.replace(/^originaux\//, 'vignettes/') + '.jpg';
const estUneCle = (c) => typeof c === 'string' && /^originaux\/\d{4}\/\d{2}\/[a-z0-9-]+-[a-z0-9._-]{1,120}$/.test(c);
const estUneVignette = (c) => typeof c === 'string' && /^vignettes\/\d{4}\/\d{2}\/[a-z0-9-]+-[a-z0-9._-]{1,120}\.jpg$/.test(c);

function propre(nom) {
  const point = nom.lastIndexOf('.');
  const ext = point > 0 ? nom.slice(point + 1).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) : '';
  const base = (point > 0 ? nom.slice(0, point) : nom)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'fichier';
  return ext ? `${base}.${ext}` : base;
}

// --- Le plafond --------------------------------------------------------------------
// Au-delà, plus aucun envoi : on ne paie pas sans l'avoir décidé. Réglé sur les
// 10 Go gratuits du compte.

const plafond = (env) => Math.round(parseFloat(env.MAX_TOTAL_GB || '10') * 1024 ** 3);

async function placeOccupee(env) {
  let total = 0;
  let curseur;
  do {
    const r = await env.BUCKET.list({ cursor: curseur, limit: 1000 });
    for (const o of r.objects) total += o.size;
    curseur = r.truncated ? r.cursor : undefined;
  } while (curseur);
  return total;
}

async function placeLibre(env) {
  return plafond(env) - (await placeOccupee(env));
}

// --- Les petits outils ----------------------------------------------------------------

function entetesCors(req, env) {
  const origine = req.headers.get('origin') || '';
  const permises = String(env.ORIGINES || '').split(',').map((s) => s.trim()).filter(Boolean);
  const h = {
    'access-control-allow-methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type, range',
    'access-control-expose-headers': 'content-range, content-length, etag',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
  if (permises.includes(origine)) h['access-control-allow-origin'] = origine;
  return h;
}

async function lireJson(req) {
  try { return await req.json(); } catch { return {}; }
}

const texte = (v, max) => String(v ?? '').slice(0, max);

function json(corps, statut = 200, entetes = {}) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...entetes, 'content-type': 'application/json; charset=utf-8' },
  });
}
