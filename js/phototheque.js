// La photothèque de Yuno — `#yuno/phototheque` (20 novembre 2026, demande de
// Noé : « la réserve de photos doit être le réservoir principal »).
//
// ÉTAPE 1 : LA RÉSERVE ET L'IMPORT. On importe les exports retouchés d'un match,
// par lot, depuis l'ordinateur ; on les retrouve rangés par match, sur tous les
// appareils. Le tri (étoiles, étiquettes), la recherche et le lien aux parutions
// viendront ensuite — l'écran est pensé pour les recevoir.
//
// CE QUE FAIT L'IMPORT, SUR L'APPAREIL QUI IMPORTE, AVANT TOUT ENVOI :
//   — il ALLÈGE la photo à 2 160 px au plus grand côté (JPEG 92 %) : deux fois
//     ce qu'Instagram garde, environ 1 Mo au lieu de 10. Les 10 Go gratuits
//     tiennent ainsi une centaine de matchs. L'original reste sur le disque ;
//   — il LIT LA DATE DE PRISE DE VUE dans le fichier (EXIF) : c'est elle qui
//     permettra « mon mois d'octobre » ;
//   — il tire une VIGNETTE de 480 px, la seule chose que la grille charge.
// Le format (verticale, horizontale, carrée) se déduit en base des dimensions.
//
// COMMENT IL VIT DANS LE SITE : comme le carrousel, dans un hôte que le site
// réécrit à chaque rendu. L'état vit ICI, au niveau du module : un import en
// cours survit à tous les redessins.

import * as api from './api.js';
import { echapper } from './format.js';
import { bulle, messageCourt } from './bulle.js';
import { enregistrer } from './zip.js';
import { envoyerFichier, envoyerVignette, adressesDe, supprimerFichier } from './photos-cloud.js';

const COTE_MAX = 2160;
const QUALITE = 0.92;
const COTE_VIGNETTE = 480;
const ADRESSES_VALABLES_MS = 5 * 3600 * 1000;
const RELIRE_APRES_MS = 15 * 1000;
// L'adresse d'un lot sans match. Un mot, pas un identifiant : il se lit dans
// la barre d'adresse.
const SANS_MATCH = 'sans-match';

// --- L'état, qui survit aux redessins ---------------------------------------------

const etat = {
  // Chaque photo : { id, cle, nom, evenement_id, evenement, prise_le, largeur,
  //   hauteur, format, taille, vignette, url, blob,
  //   envoi: 'preparation'|'attente'|'envoi'|'fait'|'echec', progression }
  photos: null,
  chargeLe: 0,
  adressesLe: 0,
  sorties: null,         // les sorties de Yuno qu'on peut choisir à l'import
  choisirMatch: false,   // la liste montre le choix du match
  ouverte: null,         // l'identifiant de la photo dans la visionneuse
  confirmerRetrait: false,
};

let hote = null;
let vueCourante = 'liste';
let cible = null;        // le match affiché : un identifiant, ou SANS_MATCH

const photo = (id) => etat.photos?.find((p) => p.id === id);
const ordreNaturel = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
const cleDuMatch = (p) => p.evenement_id ?? SANS_MATCH;
const enRoute = (p) => ['preparation', 'attente', 'envoi'].includes(p.envoi);

// LES PHOTOS D'UN MATCH SE RANGENT PAR PRISE DE VUE, puis par nom : c'est
// l'ordre du match. Le nom départage les rafales prises à la même seconde.
function trier(liste) {
  return liste.sort((a, b) =>
    (a.prise_le ?? '').localeCompare(b.prise_le ?? '') || ordreNaturel.compare(a.nom, b.nom));
}

const photosDuMatch = (cle) => trier((etat.photos ?? []).filter((p) => cleDuMatch(p) === cle));

// --- Les icônes ---------------------------------------------------------------------

const ICONE = {
  importer: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>',
  ajouter: '<path d="M12 5v14M5 12h14"/>',
  retour: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  match: '<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/>',
  nuage: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9a4 4 0 0 1-.5 7.97"/><path d="M12 12v8M9 15l3-3 3 3"/>',
  telecharger: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  fermer: '<path d="M6 6l12 12M18 6L6 18"/>',
  gauche: '<path d="M15 6l-6 6 6 6"/>',
  droite: '<path d="M9 6l6 6-6 6"/>',
  corbeille: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3"/>',
};
const svg = (cle, taille = 18) =>
  `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONE[cle]}</svg>`;

// --- Les dates ------------------------------------------------------------------------

const jourCourt = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const momentLong = (iso) =>
  new Date(iso).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// --- Le chargement ------------------------------------------------------------------------

async function charger() {
  try {
    const lignes = await api.lirePhotos();
    const anciennes = new Map((etat.photos ?? []).map((p) => [p.id, p]));
    const distantes = lignes.map((l) => {
      const deja = anciennes.get(l.id);
      return {
        ...l,
        // Ce que cet appareil a déjà sous la main ne se redemande pas.
        vignette: deja?.vignette ?? null,
        url: deja?.url ?? null,
        blob: deja?.blob ?? null,
        envoi: 'fait',
        progression: 1,
      };
    });
    // Les photos EN ROUTE sur cet appareil ne sont pas encore en base.
    const locales = (etat.photos ?? []).filter((p) => p.envoi !== 'fait' && !distantes.some((d) => d.id === p.id));
    etat.photos = [...distantes, ...locales];
    etat.chargeLe = Date.now();
    etat.adressesLe = 0;
  } catch (e) {
    console.error('Lecture de la photothèque impossible', e);
    etat.photos = etat.photos ?? [];
    bulle("Ce n'est pas passé", "La photothèque n'a pas pu être chargée.");
  }
  dessiner();
}

// Les adresses de lecture de ce que l'écran montre — et de rien d'autre : une
// photothèque de cent matchs n'a pas à signer dix mille vignettes pour en
// afficher douze.
async function signer(liste) {
  const perimees = Date.now() - etat.adressesLe > ADRESSES_VALABLES_MS;
  const aSigner = liste.filter((p) => p.cle && p.envoi === 'fait'
    && (perimees || (!p.vignette && !p.url)) && !p.vignetteLocale);
  if (!aSigner.length) return;
  try {
    for (let i = 0; i < aSigner.length; i += 400) {
      const lot = aSigner.slice(i, i + 400);
      const adresses = await adressesDe(lot.map((p) => p.cle));
      for (const p of lot) {
        const a = adresses[p.cle];
        if (!a) continue;
        p.vignette = a.vignette;
        if (!p.blob) p.url = a.original;
      }
    }
    if (perimees) etat.adressesLe = Date.now();
    for (const p of aSigner) poserLaVignette(p);
  } catch (e) {
    console.error('Adresses des photos non obtenues', e);
  }
}

async function chargerLesSorties() {
  if (etat.sorties) return;
  const jour = 24 * 3600 * 1000;
  try {
    const sorties = await api.evenementsEntre(
      new Date(Date.now() - 365 * jour).toISOString(),
      new Date(Date.now() + 7 * jour).toISOString(),
      { espace: 'photo' },
    );
    etat.sorties = sorties
      .map((s) => ({ id: s.id, titre: s.titre, date_debut: s.date_debut }))
      .sort((a, b) => b.date_debut.localeCompare(a.date_debut));
  } catch (e) {
    console.error('Lecture des sorties impossible', e);
    etat.sorties = [];
  }
  if (etat.choisirMatch) dessiner();
}

// Le match d'une clé : depuis ses photos, sinon depuis les sorties connues.
function matchDe(cle) {
  if (cle === SANS_MATCH) return null;
  return (etat.photos ?? []).find((p) => p.evenement_id === cle)?.evenement
    ?? (etat.sorties ?? []).find((s) => s.id === cle)
    ?? null;
}

// --- La lecture de la date de prise de vue (EXIF) ---------------------------------------
//
// Une lecture à la main, sans bibliothèque : seuls trois champs nous servent, et
// ils sont toujours au même endroit — le bloc APP1 d'un JPEG, son répertoire
// principal, puis le sous-répertoire EXIF. On lit les 256 premiers ko, où il vit
// toujours.

async function lireDatePrise(fichier) {
  try {
    const v = new DataView(await fichier.slice(0, 256 * 1024).arrayBuffer());
    if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return null;
    let o = 2;
    while (o + 10 < v.byteLength) {
      const marqueur = v.getUint16(o);
      if ((marqueur & 0xff00) !== 0xff00) break;
      const longueur = v.getUint16(o + 2);
      if (marqueur === 0xffe1 && v.getUint32(o + 4) === 0x45786966) return lireTiff(v, o + 10);
      if (marqueur === 0xffda) break;
      o += 2 + longueur;
    }
  } catch {
    // Un fichier qu'on ne sait pas lire n'a simplement pas de date.
  }
  return null;
}

function lireTiff(v, t) {
  const petit = v.getUint16(t) === 0x4949;
  const u16 = (p) => v.getUint16(p, petit);
  const u32 = (p) => v.getUint32(p, petit);
  const entree = (ifd, tag) => {
    if (ifd + 2 > v.byteLength) return null;
    const n = u16(ifd);
    for (let i = 0; i < n; i++) {
      const e = ifd + 2 + i * 12;
      if (e + 12 > v.byteLength) return null;
      if (u16(e) === tag) return e;
    }
    return null;
  };
  const texte = (e) => {
    if (e == null) return null;
    const n = u32(e + 4);
    const debut = n > 4 ? t + u32(e + 8) : e + 8;
    let s = '';
    for (let i = 0; i < n - 1 && debut + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(debut + i));
    return s;
  };
  const ifd0 = t + u32(t + 4);
  const pointeur = entree(ifd0, 0x8769);
  const exif = pointeur != null ? t + u32(pointeur + 8) : null;
  const brut = (exif != null && (texte(entree(exif, 0x9003)) || texte(entree(exif, 0x9004))))
    || texte(entree(ifd0, 0x0132));
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(brut ?? '');
  if (!m || m[1] === '0000') return null;
  // L'heure EXIF est celle de l'appareil, sans fuseau : on la lit comme une
  // heure locale, ce qu'elle était au bord du terrain.
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// --- L'import ------------------------------------------------------------------------------

const EXTENSIONS_PHOTO = /\.(jpe?g|png|webp|heic|heif|avif)$/i;
const estUnePhoto = (f) => f.type.startsWith('image/') || EXTENSIONS_PHOTO.test(f.name);

function importer(fichiers) {
  if (vueCourante !== 'match' || !cible) return;
  const evenementId = cible === SANS_MATCH ? null : cible;
  const deja = new Set(photosDuMatch(cible).map((p) => p.nomSource ?? p.nom));
  const nouvelles = [];
  for (const fichier of fichiers) {
    if (!estUnePhoto(fichier)) continue;
    // Un même fichier déposé deux fois dans un match n'y entre qu'une fois.
    if (deja.has(fichier.name)) continue;
    deja.add(fichier.name);
    nouvelles.push({
      id: crypto.randomUUID(),
      cle: null,
      nom: fichier.name,
      nomSource: fichier.name,
      evenement_id: evenementId,
      evenement: matchDe(cible),
      // La date se lit pendant la préparation ; d'ici là, le nom range.
      prise_le: null,
      largeur: null,
      hauteur: null,
      taille: null,
      source: fichier,
      vignette: null,
      vignetteLocale: true,
      url: null,
      blob: null,
      envoi: 'preparation',
      progression: 0,
    });
  }
  const ignorees = fichiers.length - nouvelles.length;
  if (!nouvelles.length) {
    bulle('Rien à ajouter', 'Ces fichiers ne sont pas des photos, ou ils sont déjà dans ce match.');
    return;
  }
  etat.photos = [...(etat.photos ?? []), ...nouvelles];
  dessiner();
  if (ignorees) messageCourt(`${ignorees} fichier${ignorees > 1 ? 's' : ''} déjà là ou illisible${ignorees > 1 ? 's' : ''}, laissé${ignorees > 1 ? 's' : ''} de côté.`);
  filePreparation.push(...nouvelles);
  pomperLesPreparations();
}

// DEUX PRÉPARATIONS À LA FOIS : décoder une photo de 24 Mpx occupe une centaine
// de Mo en mémoire ; à dix d'un coup, un téléphone lâcherait l'onglet.
const filePreparation = [];
let preparationsEnCours = 0;

function pomperLesPreparations() {
  while (preparationsEnCours < 2 && filePreparation.length) {
    const p = filePreparation.shift();
    preparationsEnCours++;
    preparer(p)
      .then(() => {
        p.envoi = 'attente';
        fileEnvois.push(p);
        pomperLesEnvois();
      })
      .catch((e) => {
        console.error('Photo illisible', p.nom, e);
        p.envoi = 'echec';
        p.illisible = true;
      })
      .finally(() => {
        majEnvoi(p);
        preparationsEnCours--;
        pomperLesPreparations();
        // LE LOT PRÉPARÉ SE RANGE UNE FOIS, à la fin : les dates lues dans les
        // fichiers changent l'ordre, et le redessiner photo par photo ferait
        // sauter la grille sous les yeux.
        if (!preparationsEnCours && !filePreparation.length && !etat.ouverte) dessiner();
      });
  }
}

async function decoder(fichier) {
  // `createImageBitmap` redresse la photo selon son orientation EXIF : un
  // portrait pris boîtier tourné reste un portrait.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(fichier, { imageOrientation: 'from-image' });
    } catch {
      // Safari plus ancien : on retombe sur une image.
    }
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = URL.createObjectURL(fichier);
  await img.decode();
  return img;
}

const dimensions = (source) => ({
  largeur: source.naturalWidth ?? source.width,
  hauteur: source.naturalHeight ?? source.height,
});

function toile(source, cote, largeur, hauteur) {
  const echelle = Math.min(1, cote / Math.max(largeur, hauteur));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(largeur * echelle));
  c.height = Math.max(1, Math.round(hauteur * echelle));
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

const enJpeg = (c, qualite) => new Promise((ok, ko) =>
  c.toBlob((b) => (b ? ok(b) : ko(new Error('Encodage impossible'))), 'image/jpeg', qualite));

async function preparer(p) {
  const fichier = p.source;
  const [date, source] = await Promise.all([lireDatePrise(fichier), decoder(fichier)]);
  // Sans date dans le fichier, celle du fichier lui-même : c'est mieux que rien
  // pour « mon mois d'octobre », et un export la porte au jour près.
  p.prise_le = date ?? new Date(fichier.lastModified || Date.now()).toISOString();
  const { largeur, hauteur } = dimensions(source);
  const echelle = Math.min(1, COTE_MAX / Math.max(largeur, hauteur));

  // UN JPEG DÉJÀ À LA BONNE TAILLE PART TEL QUEL : le réencoder lui ferait
  // perdre un peu de qualité pour rien.
  const tel = echelle === 1 && /jpe?g$/i.test(fichier.type || fichier.name);
  const grande = tel ? null : toile(source, COTE_MAX, largeur, hauteur);
  p.largeur = grande ? grande.width : largeur;
  p.hauteur = grande ? grande.height : hauteur;
  p.blob = tel ? fichier : await enJpeg(grande, QUALITE);
  if (!tel) p.nom = fichier.name.replace(/\.[^.]+$/, '') + '.jpg';
  p.taille = p.blob.size;

  const petite = toile(source, COTE_VIGNETTE, largeur, hauteur);
  p.blobVignette = await enJpeg(petite, 0.82);
  p.vignette = URL.createObjectURL(p.blobVignette);
  source.close?.();
  if (grande) { grande.width = 0; grande.height = 0; }
  p.source = null;
  poserLaVignette(p);
}

const fileEnvois = [];
let envoisEnCours = 0;

function pomperLesEnvois() {
  while (envoisEnCours < 2 && fileEnvois.length) {
    const p = fileEnvois.shift();
    envoisEnCours++;
    envoyer(p).finally(() => {
      envoisEnCours--;
      pomperLesEnvois();
    });
  }
}

async function envoyer(p) {
  p.envoi = 'envoi';
  majEnvoi(p);
  try {
    if (!p.cle) {
      p.cle = await envoyerFichier(new File([p.blob], p.nom, { type: 'image/jpeg' }), (envoyes, total) => {
        p.progression = envoyes / Math.max(1, total);
        majEnvoi(p);
      });
      if (p.blobVignette) {
        await envoyerVignette(p.cle, p.blobVignette).catch((e) => console.error('Vignette non envoyée', e));
      }
    }
    await api.ajouterPhoto({
      id: p.id,
      cle: p.cle,
      nom: p.nom,
      evenement_id: p.evenement_id,
      prise_le: p.prise_le,
      largeur: p.largeur,
      hauteur: p.hauteur,
      taille: p.taille,
    });
    p.envoi = 'fait';
    p.progression = 1;
    p.blobVignette = null;
  } catch (e) {
    console.error('Envoi impossible', p.nom, e);
    p.envoi = 'echec';
  }
  majEnvoi(p);
}

function relancerLesEchecs() {
  for (const p of etat.photos ?? []) {
    if (p.envoi !== 'echec' || p.illisible || !p.blob) continue;
    p.envoi = 'attente';
    p.progression = 0;
    fileEnvois.push(p);
  }
  pomperLesEnvois();
  dessiner();
}

// L'état de l'envoi se pose sur la tuile et dans la ligne d'état, sans
// redessiner l'écran — sinon chaque morceau ferait sauter la grille.
function majEnvoi(p) {
  hote?.querySelectorAll(`[data-envoi-de="${p.id}"]`).forEach((el) => {
    el.dataset.envoi = p.envoi === 'preparation' ? 'attente' : p.envoi;
    el.style.setProperty('--avance', String(p.progression ?? 0));
  });
  majLigneDEtat();
}

function majLigneDEtat() {
  const ligne = hote?.querySelector('[data-pht-etat]');
  if (!ligne) return;
  const liste = photosDuMatch(cible);
  const total = liste.length;
  if (!total) { ligne.innerHTML = ''; return; }
  const faites = liste.filter((p) => p.envoi === 'fait').length;
  const illisibles = liste.filter((p) => p.illisible).length;
  const echecs = liste.filter((p) => p.envoi === 'echec' && !p.illisible).length;
  const enCours = liste.filter(enRoute).length;
  if (echecs) {
    ligne.innerHTML = `${echecs} ${echecs > 1 ? 'envois ont' : 'envoi a'} échoué
      <button type="button" class="car-puce car-puce-mini" data-pht="relancer">Réessayer</button>`;
  } else if (enCours) {
    const preparees = liste.filter((p) => p.envoi !== 'preparation').length;
    ligne.innerHTML = `${svg('nuage', 14)}<span>En ligne : ${faites} / ${total}${
      preparees < total ? ` · ${total - preparees} à alléger` : ''}</span>`;
  } else {
    ligne.innerHTML = `${svg('nuage', 14)}<span>${faites} photo${faites > 1 ? 's' : ''} en ligne${
      illisibles ? ` · ${illisibles} illisible${illisibles > 1 ? 's' : ''} sur cet appareil` : ''}</span>`;
  }
}

function poserLaVignette(p) {
  if (!p.vignette) return;
  hote?.querySelectorAll(`img[data-vignette="${p.id}"]`).forEach((img) => {
    if (img.getAttribute('src') !== p.vignette) img.src = p.vignette;
  });
}

// Un DOSSIER déposé se parcourt en entier : c'est ce qu'on fait en sortant d'un
// match — on prend le dossier de l'export.
async function fichiersDuDepot(transfert) {
  const entrees = [...(transfert.items ?? [])].map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
  if (!entrees.length) return [...(transfert.files ?? [])];
  const sortie = [];
  const parcourir = async (entree) => {
    if (entree.isFile) sortie.push(await new Promise((ok, ko) => entree.file(ok, ko)));
    else if (entree.isDirectory) {
      const lecteur = entree.createReader();
      for (;;) {
        const paquet = await new Promise((ok, ko) => lecteur.readEntries(ok, ko));
        if (!paquet.length) break;
        for (const e of paquet) await parcourir(e);
      }
    }
  };
  for (const e of entrees) await parcourir(e);
  return sortie;
}

// --- Les gabarits ---------------------------------------------------------------------------

function tuile(p) {
  const src = p.vignette ?? '';
  return `<button type="button" class="pht-tuile" data-ouvrir="${p.id}"
      aria-label="Ouvrir ${echapper(p.nom)}">
      <img data-vignette="${p.id}" alt="" loading="lazy" decoding="async"${src ? ` src="${echapper(src)}"` : ''}
        onload="this.parentNode.classList.add('prete')">
      <span class="car-envoi" data-envoi-de="${p.id}"
        data-envoi="${p.envoi === 'preparation' ? 'attente' : p.envoi}"
        style="--avance:${p.progression ?? 0}" aria-hidden="true"></span>
    </button>`;
}

// LE CHOIX DU MATCH, AVANT L'IMPORT : un menu du système posé sur une pastille,
// comme celui du carrousel. Choisir mène au match, où l'on dépose les photos.
function gabaritChoix() {
  if (!etat.choisirMatch) return '';
  const sorties = etat.sorties;
  const options = (sorties ?? []).map((s) =>
    `<option value="${s.id}">${echapper(s.titre)} · ${jourCourt(s.date_debut)}</option>`).join('');
  return `
    <div class="pht-choix">
      <p class="pht-choix-titre">De quel match viennent ces photos ?</p>
      <label class="car-match">
        ${svg('match', 15)}
        <span class="car-match-texte">${sorties ? 'Choisir le match' : 'Un instant…'}</span>
        <select data-pht-match aria-label="Match des photos à importer"${sorties ? '' : ' disabled'}>
          <option value="" selected disabled>Choisir le match</option>
          ${options}
          <option value="${SANS_MATCH}">Sans match</option>
        </select>
      </label>
      <button type="button" class="car-puce" data-pht="annuler-choix">Annuler</button>
    </div>`;
}

function gabaritListe() {
  if (!etat.photos) return '<p class="car-attente">Un instant…</p>';
  const groupes = new Map();
  for (const p of etat.photos) {
    const cle = cleDuMatch(p);
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(p);
  }
  // Le match le plus récent d'abord ; « sans match » ferme la liste.
  const cles = [...groupes.keys()].sort((a, b) => {
    if (a === SANS_MATCH) return 1;
    if (b === SANS_MATCH) return -1;
    return (matchDe(b)?.date_debut ?? '').localeCompare(matchDe(a)?.date_debut ?? '');
  });
  const tuiles = cles.map((cle) => {
    const liste = trier(groupes.get(cle));
    const match = matchDe(cle);
    const couverture = liste.slice(0, 3);
    const n = liste.length;
    return `<a class="pht-match" href="#yuno/phototheque/${cle}">
        <span class="pht-match-photos">${couverture.map((p) =>
          `<span class="pht-match-cadre"><img data-vignette="${p.id}" alt="" loading="lazy" decoding="async"${
            p.vignette ? ` src="${echapper(p.vignette)}"` : ''}></span>`).join('')}</span>
        <span class="pht-match-nom">${match ? echapper(match.titre) : 'Sans match'}</span>
        <span class="pht-match-service">${match ? `${jourCourt(match.date_debut)} · ` : ''}<span class="chiffre">${n}</span> photo${n > 1 ? 's' : ''}</span>
      </a>`;
  }).join('');
  const total = etat.photos.length;
  return `
    <div class="pht-tete-liste">
      <p class="pht-intro">${total
        ? `<span class="chiffre">${total}</span> photo${total > 1 ? 's' : ''} rangée${total > 1 ? 's' : ''} par match`
        : 'Importe les photos retouchées d’un match : elles te suivront sur tous tes appareils.'}</p>
      ${etat.choisirMatch ? '' : `<button type="button" class="car-bouton-or" data-pht="importer">${svg('importer')}<span>Importer des photos</span></button>`}
    </div>
    ${gabaritChoix()}
    ${cles.length ? `<div class="pht-matchs">${tuiles}</div>`
      : etat.choisirMatch ? '' : '<p class="car-liste-vide">Tes matchs et leurs photos s’afficheront ici.</p>'}`;
}

function gabaritMatch() {
  const liste = photosDuMatch(cible);
  const match = matchDe(cible);
  const titre = cible === SANS_MATCH ? 'Sans match' : match?.titre ?? 'Match';
  const tete = `
    <div class="car-tete">
      <a class="car-retour" href="#yuno/phototheque" aria-label="La photothèque" title="La photothèque">${svg('retour', 20)}</a>
      <div class="pht-titre">
        <h2 class="pht-nom">${echapper(titre)}</h2>
        ${match ? `<span class="discret">${jourCourt(match.date_debut)}</span>` : ''}
      </div>
    </div>
    <p class="car-etat" data-pht-etat></p>`;
  const fichier = '<input type="file" class="car-fichier" accept="image/*" multiple hidden data-pht-fichier>';
  if (!liste.length) {
    return `${tete}
      <div class="car-import" data-depot>
        <p class="car-import-titre">Les photos de ce match</p>
        <p class="car-import-texte">Choisis tes exports retouchés — ou glisse ici le dossier entier.
          Ils sont allégés pour Instagram avant de partir en ligne.</p>
        <button type="button" class="car-bouton-or" data-pht="choisir">${svg('importer')}<span>Choisir des photos</span></button>
      </div>${fichier}`;
  }
  return `${tete}
    <div class="car-tout" data-depot>
      <div class="car-tout-tete">
        <p class="car-petit-titre">Photos · <span class="chiffre">${liste.length}</span></p>
        <button type="button" class="car-puce" data-pht="choisir">${svg('ajouter', 14)}<span>Ajouter des photos</span></button>
      </div>
      <div class="pht-grille">${liste.map(tuile).join('')}</div>
    </div>${fichier}`;
}

// --- La visionneuse ---------------------------------------------------------------------------

function gabaritVisionneuse() {
  const p = photo(etat.ouverte);
  if (!p) return '';
  const liste = photosDuMatch(cleDuMatch(p));
  const k = liste.indexOf(p);
  const src = p.blob ? (p.urlLocale ??= URL.createObjectURL(p.blob)) : p.url ?? p.vignette ?? '';
  const formats = { verticale: 'Verticale', horizontale: 'Horizontale', carree: 'Carrée' };
  const format = p.format ?? (p.largeur && p.hauteur
    ? (Math.abs(p.largeur - p.hauteur) <= Math.max(p.largeur, p.hauteur) * 0.03 ? 'carree'
      : p.hauteur > p.largeur ? 'verticale' : 'horizontale')
    : null);
  return `
    <div class="pht-vue" role="dialog" aria-modal="true" aria-label="${echapper(p.nom)}">
      <div class="pht-vue-barre">
        <span class="pht-vue-rang"><span class="chiffre">${k + 1}</span> / ${liste.length}</span>
        <button type="button" class="car-icone" data-pht="fermer" aria-label="Fermer" title="Fermer (Échap)">${svg('fermer')}</button>
      </div>
      <div class="pht-vue-scene">
        <button type="button" class="pht-vue-fleche" data-pht="precedente" aria-label="Photo précédente"${k > 0 ? '' : ' disabled'}>${svg('gauche', 22)}</button>
        <img class="pht-vue-image" src="${echapper(src)}" alt="">
        <button type="button" class="pht-vue-fleche" data-pht="suivante" aria-label="Photo suivante"${k < liste.length - 1 ? '' : ' disabled'}>${svg('droite', 22)}</button>
      </div>
      <div class="pht-vue-pied">
        <p class="pht-vue-infos">
          <span>${p.prise_le ? echapper(momentLong(p.prise_le)) : 'Date inconnue'}</span>
          <span class="discret">${[format ? formats[format] : null, p.largeur ? `${p.largeur} × ${p.hauteur}` : null, echapper(p.nom)].filter(Boolean).join(' · ')}</span>
        </p>
        <div class="pht-vue-actions">
          ${etat.confirmerRetrait
            ? `<span class="pht-vue-question">Retirer cette photo de la photothèque ?</span>
               <button type="button" class="car-puce" data-pht="garder">Garder</button>
               <button type="button" class="car-danger" data-pht="retirer-oui">Retirer</button>`
            : `<button type="button" class="car-icone" data-pht="retirer" aria-label="Retirer cette photo" title="Retirer">${svg('corbeille')}</button>
               <button type="button" class="car-bouton-or" data-pht="telecharger"${enRoute(p) && !p.blob ? ' disabled' : ''}>${svg('telecharger')}<span>Télécharger</span></button>`}
        </div>
      </div>
    </div>`;
}

function ouvrir(id) {
  etat.ouverte = id;
  etat.confirmerRetrait = false;
  dessinerVisionneuse();
  prechargerAutour();
}

function fermer() {
  etat.ouverte = null;
  etat.confirmerRetrait = false;
  dessinerVisionneuse();
}

function voisine(pas) {
  const p = photo(etat.ouverte);
  if (!p) return;
  const liste = photosDuMatch(cleDuMatch(p));
  const suivante = liste[liste.indexOf(p) + pas];
  if (suivante) ouvrir(suivante.id);
}

// LA PHOTO OUVERTE SE GARDE EN MÉMOIRE, et ses deux voisines avec : télécharger
// sur l'iPhone ouvre la feuille de partage, qui ne s'ouvre que dans la foulée
// d'un geste — un fichier qu'il faudrait encore aller chercher la ferait rater.
function prechargerAutour() {
  const p = photo(etat.ouverte);
  if (!p) return;
  const liste = photosDuMatch(cleDuMatch(p));
  const k = liste.indexOf(p);
  for (const q of [liste[k], liste[k + 1], liste[k - 1]]) {
    if (!q || q.blob || q.prechargement || !q.url) continue;
    q.prechargement = fetch(q.url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => { q.blob = b; })
      .catch((e) => console.error('Photo non préchargée', q.nom, e))
      .finally(() => { q.prechargement = null; });
  }
}

let visionneuse = null;

function dessinerVisionneuse() {
  const html = gabaritVisionneuse();
  if (!html) {
    visionneuse?.remove();
    visionneuse = null;
    document.body.classList.remove('pht-vue-ouverte');
    return;
  }
  if (!visionneuse) {
    visionneuse = document.createElement('div');
    visionneuse.className = 'pht-vue-hote';
    document.body.appendChild(visionneuse);
    brancherVisionneuse(visionneuse);
  }
  visionneuse.innerHTML = html;
  document.body.classList.add('pht-vue-ouverte');
}

async function telecharger(bouton) {
  const p = photo(etat.ouverte);
  if (!p) return;
  try {
    if (!p.blob) {
      if (p.prechargement) await p.prechargement;
      if (!p.blob && p.url) {
        const r = await fetch(p.url);
        if (!r.ok) throw new Error(String(r.status));
        p.blob = await r.blob();
      }
    }
    if (!p.blob) throw new Error('Photo absente');
    const fichier = new File([p.blob], p.nom, { type: 'image/jpeg' });
    const auDoigt = window.matchMedia('(pointer: coarse)').matches && !!navigator.canShare;
    if (auDoigt && navigator.canShare({ files: [fichier] })) {
      await navigator.share({ files: [fichier] }).catch((e) => {
        if (e?.name !== 'AbortError') throw e;
      });
    } else {
      enregistrer(fichier, p.nom);
    }
  } catch (e) {
    console.error('Téléchargement impossible', e);
    bulle("Ce n'est pas passé", 'La photo n’a pas pu être téléchargée. Réessaie.', bouton);
  }
}

async function retirer(bouton) {
  const p = photo(etat.ouverte);
  if (!p) return;
  const liste = photosDuMatch(cleDuMatch(p));
  const suivante = liste[liste.indexOf(p) + 1] ?? liste[liste.indexOf(p) - 1] ?? null;
  const avant = [...etat.photos];
  // L'écran d'abord : la photo s'en va, la suivante s'ouvre.
  etat.photos = etat.photos.filter((q) => q.id !== p.id);
  etat.ouverte = suivante?.id ?? null;
  etat.confirmerRetrait = false;
  dessinerVisionneuse();
  dessiner();
  try {
    if (p.envoi === 'fait') await api.supprimerPhoto(p.id);
    // Le fichier en ligne part ensuite : un fichier que plus personne ne
    // référence est payé sans jamais être revu.
    if (p.cle) supprimerFichier(p.cle).catch((e) => console.error('Fichier non supprimé', e));
  } catch (e) {
    console.error('Photo non retirée', e);
    etat.photos = avant;
    dessiner();
    bulle("Ce n'est pas passé", 'La photo n’a pas pu être retirée.', bouton);
  }
}

function brancherVisionneuse(racine) {
  racine.addEventListener('click', (e) => {
    const action = e.target.closest('[data-pht]');
    if (!action) {
      // Un clic sur le fond referme, comme toutes les fenêtres du hub.
      if (e.target.classList.contains('pht-vue-scene')) fermer();
      return;
    }
    const quoi = action.dataset.pht;
    if (quoi === 'fermer') fermer();
    else if (quoi === 'precedente') voisine(-1);
    else if (quoi === 'suivante') voisine(1);
    else if (quoi === 'telecharger') telecharger(action);
    else if (quoi === 'retirer') { etat.confirmerRetrait = true; dessinerVisionneuse(); }
    else if (quoi === 'garder') { etat.confirmerRetrait = false; dessinerVisionneuse(); }
    else if (quoi === 'retirer-oui') retirer(action);
  });

  // AU DOIGT, ON BALAIE : vers la gauche la suivante, vers la droite la
  // précédente — le geste de l'application Photos.
  let depart = null;
  racine.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    depart = { x: e.clientX, y: e.clientY };
  });
  racine.addEventListener('pointerup', (e) => {
    if (!depart || e.pointerType !== 'touch') return;
    const dx = e.clientX - depart.x;
    const dy = e.clientY - depart.y;
    depart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) voisine(dx < 0 ? 1 : -1);
  });
}

let fenetreBranchee = false;

function brancherLaFenetre() {
  if (fenetreBranchee) return;
  fenetreBranchee = true;
  document.addEventListener('keydown', (e) => {
    if (!etat.ouverte) return;
    if (e.key === 'Escape') { e.preventDefault(); fermer(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); voisine(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); voisine(1); }
  });
  // UN IMPORT EN COURS NE SE PERD PAS EN SILENCE.
  window.addEventListener('beforeunload', (e) => {
    if ((etat.photos ?? []).some(enRoute)) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  // Quitter la photothèque referme la visionneuse : elle vit sur le corps de la
  // page, pas dans l'hôte que le site réécrit.
  window.addEventListener('hashchange', () => {
    if (etat.ouverte && !location.hash.startsWith('#yuno/phototheque')) fermer();
  });
}

// --- Le dessin ---------------------------------------------------------------------------------

function dessiner() {
  if (!hote?.isConnected) return;
  hote.dataset.phtEcran = vueCourante;
  hote.innerHTML = vueCourante === 'match' ? gabaritMatch() : gabaritListe();
  majLigneDEtat();
  if (!etat.photos) return;
  const montrees = vueCourante === 'match'
    ? photosDuMatch(cible)
    : [...new Set((etat.photos ?? []).map(cleDuMatch))].flatMap((cle) => photosDuMatch(cle).slice(0, 3));
  signer(montrees);
}

function brancher(racine) {
  racine.addEventListener('click', (e) => {
    const action = e.target.closest('[data-pht]');
    if (action) {
      const quoi = action.dataset.pht;
      if (quoi === 'importer') {
        etat.choisirMatch = true;
        chargerLesSorties();
        dessiner();
        racine.querySelector('[data-pht-match]')?.focus();
      } else if (quoi === 'annuler-choix') { etat.choisirMatch = false; dessiner(); }
      else if (quoi === 'choisir') racine.querySelector('[data-pht-fichier]')?.click();
      else if (quoi === 'relancer') relancerLesEchecs();
      return;
    }
    const t = e.target.closest('[data-ouvrir]');
    if (t) ouvrir(t.dataset.ouvrir);
  });

  racine.addEventListener('change', (e) => {
    if (e.target.matches('[data-pht-match]')) {
      const valeur = e.target.value;
      if (!valeur) return;
      etat.choisirMatch = false;
      location.hash = `#yuno/phototheque/${valeur}`;
      return;
    }
    if (!e.target.matches('[data-pht-fichier]')) return;
    importer([...e.target.files]);
    e.target.value = '';
  });

  const accepte = (e) => vueCourante === 'match' && [...(e.dataTransfer?.types ?? [])].includes('Files');
  racine.addEventListener('dragover', (e) => {
    if (!accepte(e)) return;
    e.preventDefault();
    racine.classList.add('car-depot-survol');
  });
  racine.addEventListener('dragleave', (e) => {
    if (!racine.contains(e.relatedTarget)) racine.classList.remove('car-depot-survol');
  });
  racine.addEventListener('drop', async (e) => {
    if (!accepte(e)) return;
    e.preventDefault();
    racine.classList.remove('car-depot-survol');
    importer(await fichiersDuDepot(e.dataTransfer));
  });
}

export default {
  /** @param {HTMLElement} element @param {{ id?: string|null }} route */
  monter(element, { id = null } = {}) {
    hote = element;
    hote.classList.add('car-hote', 'pht-hote');
    brancherLaFenetre();
    brancher(hote);
    vueCourante = id ? 'match' : 'liste';
    cible = id;
    if (id) { etat.choisirMatch = false; chargerLesSorties(); }
    dessiner();
    const enCours = (etat.photos ?? []).some(enRoute);
    if (!etat.photos || (!enCours && Date.now() - etat.chargeLe > RELIRE_APRES_MS)) charger();
  },
};
