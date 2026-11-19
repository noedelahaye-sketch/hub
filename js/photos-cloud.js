// Le client du stockage des photos chez Cloudflare (cloudflare/photos).
//
// Le Worker garde les fichiers ; on lui parle avec la session du hub — c'est
// elle qui dit que c'est bien Noé. Rien ici ne touche à la base : le classement
// (quel fichier dans quel carrousel) passe par js/api.js.

import { sessionCourante } from './api.js';

// L'adresse du Worker. Publique : elle ne donne rien sans session, et les
// lectures passent par des adresses signées.
export const ADRESSE_PHOTOS = 'https://photos-yuno.yuno-rph1.workers.dev';

// R2 demande des morceaux d'AU MOINS 5 Mo (sauf le dernier) : 8 Mo laisse une
// marge, et une vidéo de 400 Mo part en cinquante envois qu'on peut suivre.
const TAILLE_MORCEAU = 8 * 1024 * 1024;

async function entetes(json = true) {
  const session = await sessionCourante();
  if (!session) throw new Error('Session absente.');
  const h = { authorization: 'Bearer ' + session.access_token };
  if (json) h['content-type'] = 'application/json';
  return h;
}

async function appeler(chemin, options = {}) {
  const r = await fetch(ADRESSE_PHOTOS + chemin, options);
  const corps = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corps.erreur || `Le stockage a répondu ${r.status}.`);
  return corps;
}

/**
 * Envoie un fichier en morceaux et rend sa clé chez R2.
 * @param {File} fichier
 * @param {(envoyes: number, total: number) => void} [progression]
 */
export async function envoyerFichier(fichier, progression) {
  const h = await entetes();
  const { cle, envoiId } = await appeler('/envoi/debut', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ nom: fichier.name, type: fichier.type, taille: fichier.size }),
  });
  try {
    const morceaux = [];
    let envoyes = 0;
    const nombre = Math.max(1, Math.ceil(fichier.size / TAILLE_MORCEAU));
    for (let n = 1; n <= nombre; n++) {
      const part = fichier.slice((n - 1) * TAILLE_MORCEAU, n * TAILLE_MORCEAU);
      const rendu = await appeler(
        `/envoi/morceau?cle=${encodeURIComponent(cle)}&envoi=${encodeURIComponent(envoiId)}&n=${n}`,
        { method: 'PUT', headers: { authorization: h.authorization }, body: part },
      );
      morceaux.push(rendu);
      envoyes += part.size;
      progression?.(envoyes, fichier.size);
    }
    await appeler('/envoi/fin', {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ cle, envoiId, morceaux }),
    });
    return cle;
  } catch (e) {
    // Un envoi à moitié ne doit pas occuper de place : on le défait. Le bucket
    // a aussi une règle qui nettoie les restes au bout d'un jour.
    fetch(ADRESSE_PHOTOS + '/envoi/annuler', {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ cle, envoiId }),
    }).catch(() => {});
    throw e;
  }
}

export async function envoyerVignette(cle, blob) {
  const h = await entetes(false);
  await appeler(`/vignette?cle=${encodeURIComponent(cle)}`, {
    method: 'PUT',
    headers: { ...h, 'content-type': 'image/jpeg' },
    body: blob,
  });
}

/** Les adresses de lecture, par lot : { [cle]: { original, vignette } }. */
export async function adressesDe(cles) {
  if (!cles.length) return {};
  const { adresses } = await appeler('/signer', {
    method: 'POST',
    headers: await entetes(),
    body: JSON.stringify({ cles }),
  });
  return adresses;
}

export async function supprimerFichier(cle) {
  await appeler(`/fichier?cle=${encodeURIComponent(cle)}`, {
    method: 'DELETE',
    headers: await entetes(false),
  });
}
