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
// L'adresse de la recherche, sur le même étage que les matchs.
const RECHERCHE = 'recherche';

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
  // Le tri (étape 2).
  etiquettes: null,      // [{ id, famille, nom, ordre }]
  personnes: null,       // les fiches du réseau : [{ id, nom, type, structure }]
  modeSelection: false,
  selection: new Set(),
  derniereTouchee: null, // pour Maj + clic, qui sélectionne un intervalle
  fenetreTri: false,     // la fenêtre qui trie la sélection
  confirmerRetraitSel: false,
  ajout: null,           // la famille dont on écrit une nouvelle étiquette
  recherche: '',         // ce qu'on tape dans « Qui est dessus »
  gestion: null,         // la famille dont on renomme ou supprime les étiquettes
  supprimerEtiq: null,   // l'étiquette qui attend sa confirmation
  // La recherche (étape 3).
  filtres: nouveauxFiltres(),
  ordre: 'recentes',     // 'recentes' | 'notees'
  listeVue: [],          // les photos que la visionneuse fait défiler, dans l'ordre
  // Les parutions (étape 4).
  parutions: null,       // les publications de Yuno : [{ id, titre, format, date_prevue, statut }]
  pour: null,            // la parution dont on choisit les photos, ou null
  pourCharge: null,      // la parution dont le choix a été lu
};

const MAX_CARROUSEL = 20;
const parutionDe = (id) => (etat.parutions ?? []).find((x) => x.id === id) ?? null;
// UNE PHOTO EST « PUBLIÉE N FOIS » quand N parutions qui la portent sont
// parties. Rien ne se stocke : le compteur suit l'état des parutions.
const foisPubliee = (p) => (p.parutions ?? []).filter((id) => parutionDe(id)?.statut === 'publie').length;
const enAttente = (p) => (p.parutions ?? []).map(parutionDe).filter((x) => x && x.statut !== 'publie');

function nouveauxFiltres() {
  return {
    mois: new Set(), competitions: new Set(), matchs: new Set(), formats: new Set(),
    etiquettes: new Set(), personnes: new Set(), note: 0, jamais: false,
  };
}

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
// Ce que la grille montre : un match, ou ce que la recherche trouve.
const photosAffichees = () => (vueCourante === 'recherche' ? resultats() : photosDuMatch(cible));

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
  chercher: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  coupe: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM6 5H4v2a3 3 0 0 0 3 3M18 5h2v2a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4"/>',
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
    const [lignes, etiquettes, personnes, parutions] = await Promise.all([
      api.lirePhotos(),
      api.lireEtiquettes(),
      api.lirePersonnesPossibles(),
      api.lireParutionsYuno(),
    ]);
    etat.parutions = parutions;
    etat.etiquettes = etiquettes;
    etat.personnes = personnes;
    const anciennes = new Map((etat.photos ?? []).map((p) => [p.id, p]));
    const distantes = lignes.map((l) => {
      const deja = anciennes.get(l.id);
      return {
        ...l,
        etiquettes: new Set((l.etiquettes ?? []).map((e) => e.etiquette_id)),
        personnes: new Set((l.personnes ?? []).map((e) => e.contact_id)),
        parutions: (l.parutions ?? []).map((e) => e.publication_id),
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
      .map((s) => ({ id: s.id, titre: s.titre, date_debut: s.date_debut, competition: s.competition }))
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
      note: null,
      parutions: [],
      etiquettes: new Set(),
      personnes: new Set(),
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
  // LE LOT IMPORTÉ ARRIVE SÉLECTIONNÉ (choix de Noé : étiqueter « à l'import,
  // par lot ») : ce qu'un match a en commun se pose d'un geste, avant même que
  // les photos aient fini de partir.
  etat.modeSelection = true;
  etat.selection = new Set(nouvelles.map((p) => p.id));
  etat.confirmerRetraitSel = false;
  dessiner();
  messageCourt(`${nouvelles.length} photo${nouvelles.length > 1 ? 's' : ''} sélectionnée${nouvelles.length > 1 ? 's' : ''} : trie-les d'un coup.`);
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
    if (!p.enBase) await api.ajouterPhoto({
      id: p.id,
      cle: p.cle,
      nom: p.nom,
      evenement_id: p.evenement_id,
      prise_le: p.prise_le,
      largeur: p.largeur,
      hauteur: p.hauteur,
      taille: p.taille,
      note: p.note ?? null,
    });
    p.enBase = true;
    // Ce qui a été trié PENDANT le voyage n'avait pas encore de ligne où
    // s'écrire : on le pose maintenant.
    await Promise.all([
      ...[...p.etiquettes].map((id) => api.etiqueterPhotos([p.id], id)),
      ...[...p.personnes].map((id) => api.relierPersonne([p.id], id)),
    ]);
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
  const choisie = etat.selection.has(p.id);
  return `<button type="button" class="pht-tuile${choisie ? ' choisie' : ''}" data-ouvrir="${p.id}"
      aria-label="${etat.modeSelection ? 'Sélectionner' : 'Ouvrir'} ${echapper(p.nom)}"${
      etat.modeSelection ? ` aria-pressed="${choisie}"` : ''}>
      <img data-vignette="${p.id}" alt="" loading="lazy" decoding="async"${src ? ` src="${echapper(src)}"` : ''}
        onload="this.parentNode.classList.add('prete')">
      <span class="car-envoi" data-envoi-de="${p.id}"
        data-envoi="${p.envoi === 'preparation' ? 'attente' : p.envoi}"
        style="--avance:${p.progression ?? 0}" aria-hidden="true"></span>
      ${etat.modeSelection ? `<span class="pht-coche" aria-hidden="true">${rangDansLeChoix(p)}</span>` : ''}
      ${badgeNote(p)}${badgePubliee(p)}
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
      ${etat.choisirMatch ? '' : `<span class="pht-gestes">
        ${total ? `<a class="car-puce pht-chercher" href="#yuno/phototheque/${RECHERCHE}">${svg('chercher', 14)}<span>Rechercher</span></a>` : ''}
        <button type="button" class="car-bouton-or" data-pht="importer">${svg('importer')}<span>Importer des photos</span></button>
      </span>`}
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
    ${match ? `<label class="car-match pht-competition${match.competition ? ' relie' : ''}">
        ${svg('coupe', 15)}
        <input data-pht-competition list="pht-competitions" value="${echapper(match.competition ?? '')}"
          placeholder="Compétition" autocomplete="off" spellcheck="false" maxlength="60"
          aria-label="Compétition de ce match">
        <datalist id="pht-competitions">${competitionsConnues().map((c) => `<option value="${echapper(c)}"></option>`).join('')}</datalist>
      </label>` : ''}
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
        <span class="pht-gestes">${etat.modeSelection
          ? `<button type="button" class="car-puce" data-pht="tout" data-pht-sel-compte>${toutEstChoisi() ? 'Tout désélectionner' : 'Tout sélectionner'}</button>
             <button type="button" class="car-puce" data-pht="fin-selection">Terminé</button>`
          : `<button type="button" class="car-puce" data-pht="selectionner">Sélectionner</button>
             <button type="button" class="car-puce" data-pht="choisir">${svg('ajouter', 14)}<span>Ajouter des photos</span></button>`}</span>
      </div>
      <div class="pht-grille${etat.modeSelection ? ' en-selection' : ''}">${liste.map(tuile).join('')}</div>
      ${gabaritBarreSelection()}
    </div>${fichier}`;
}

// --- La recherche (étape 3) ------------------------------------------------------------------
//
// LA QUESTION DE NOÉ : « tout dépend du post » — un match, une date (« mon mois
// d'octobre »), une compétition, un style, les favorites. Les filtres se
// COMBINENT, et deux règles disent comment :
//   — dans une famille de valeurs qui s'excluent (un mois, une compétition, un
//     match, un format), cocher deux valeurs ÉLARGIT : octobre OU novembre ;
//   — dans les étiquettes et les personnes, qu'une photo peut porter ensemble,
//     cocher deux valeurs RESSERRE : noir et blanc ET émotion.
// Entre familles, tout se cumule. C'est ce qui fait que « noir et blanc +
// émotion + 4 étoiles » ne montre que ce qui coche tout.
//
// ON N'OFFRE QUE CE QUI EXISTE, avec son compte : un filtre « Coupe de France »
// sur une photothèque qui n'en a aucune serait une porte sur une pièce vide.
// (« Jamais publiée » viendra avec l'étape 4 : le compteur n'existe pas encore.)

const NOMS_FORMAT = { verticale: 'Verticales', horizontale: 'Horizontales', carree: 'Carrées' };

function moisDe(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
const nomDuMois = (cle) => {
  const [a, m] = cle.split('-').map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};
const formatDe = (p) => p.format ?? (p.largeur && p.hauteur
  ? (Math.abs(p.largeur - p.hauteur) <= Math.max(p.largeur, p.hauteur) * 0.03 ? 'carree'
    : p.hauteur > p.largeur ? 'verticale' : 'horizontale')
  : null);

const nbFiltres = () => {
  const f = etat.filtres;
  return f.mois.size + f.competitions.size + f.matchs.size + f.formats.size
    + f.etiquettes.size + f.personnes.size + (f.note ? 1 : 0) + (f.jamais ? 1 : 0);
};

function correspond(p) {
  const f = etat.filtres;
  if (f.mois.size && !f.mois.has(moisDe(p.prise_le))) return false;
  if (f.competitions.size && !f.competitions.has(p.evenement?.competition ?? '')) return false;
  if (f.matchs.size && !f.matchs.has(cleDuMatch(p))) return false;
  if (f.formats.size && !f.formats.has(formatDe(p))) return false;
  if (f.note && !((p.note ?? 0) >= f.note)) return false;
  if (f.jamais && foisPubliee(p) > 0) return false;
  for (const id of f.etiquettes) if (!p.etiquettes?.has(id)) return false;
  for (const id of f.personnes) if (!p.personnes?.has(id)) return false;
  return true;
}

function resultats() {
  const liste = (etat.photos ?? []).filter(correspond);
  // Les plus récentes d'abord : un post se fait sur ce qui vient de se passer.
  // « Les mieux notées » fait remonter ses favorites, la date départage.
  return liste.sort((a, b) =>
    (etat.ordre === 'notees' ? (b.note ?? 0) - (a.note ?? 0) : 0)
    || (b.prise_le ?? '').localeCompare(a.prise_le ?? '')
    || ordreNaturel.compare(a.nom, b.nom));
}

// Les valeurs d'une famille, avec leur compte, dans un ordre qui a un sens.
function valeurs(famille) {
  const compte = new Map();
  const ajouter = (cle) => { if (cle != null && cle !== '') compte.set(cle, (compte.get(cle) ?? 0) + 1); };
  for (const p of etat.photos ?? []) {
    if (famille === 'mois') ajouter(moisDe(p.prise_le));
    else if (famille === 'competitions') ajouter(p.evenement?.competition);
    else if (famille === 'matchs') ajouter(cleDuMatch(p));
    else if (famille === 'formats') ajouter(formatDe(p));
    else if (famille === 'etiquettes') (p.etiquettes ?? []).forEach(ajouter);
    else if (famille === 'personnes') (p.personnes ?? []).forEach(ajouter);
  }
  return [...compte.entries()];
}

function puceFiltre(famille, valeur, nom, n) {
  const pris = etat.filtres[famille].has(valeur);
  return `<button type="button" class="pht-etiq" data-filtre="${famille}" data-valeur="${echapper(valeur)}"
      data-etat="${pris ? 'tout' : 'rien'}" aria-pressed="${pris}">${echapper(nom)}
      <span class="pht-etiq-n">${n}</span></button>`;
}

function blocFiltre(titre, puces) {
  if (!puces) return '';
  return `<div class="pht-tri-famille"><p class="pht-tri-titre">${titre}</p><div class="pht-etiqs">${puces}</div></div>`;
}

function gabaritFiltres() {
  const f = etat.filtres;
  const mois = valeurs('mois').sort((a, b) => b[0].localeCompare(a[0]))
    .map(([cle, n]) => puceFiltre('mois', cle, nomDuMois(cle), n)).join('');
  const competitions = valeurs('competitions').sort((a, b) => a[0].localeCompare(b[0], 'fr'))
    .map(([cle, n]) => puceFiltre('competitions', cle, cle, n)).join('');
  const matchs = valeurs('matchs')
    .sort((a, b) => (a[0] === SANS_MATCH) - (b[0] === SANS_MATCH)
      || (matchDe(b[0])?.date_debut ?? '').localeCompare(matchDe(a[0])?.date_debut ?? ''))
    .map(([cle, n]) => puceFiltre('matchs', cle, matchDe(cle)?.titre ?? 'Sans match', n)).join('');
  const parEtiquette = new Map(valeurs('etiquettes'));
  const familles = FAMILLES.map(({ cle, nom }) => blocFiltre(nom, (etat.etiquettes ?? [])
    .filter((e) => e.famille === cle && parEtiquette.has(e.id))
    .map((e) => puceFiltre('etiquettes', e.id, e.nom, parEtiquette.get(e.id))).join(''))).join('');
  const personnes = valeurs('personnes')
    .map(([id, n]) => [((etat.personnes ?? []).find((c) => c.id === id)), n])
    .filter(([c]) => c)
    .sort((a, b) => a[0].nom.localeCompare(b[0].nom, 'fr'))
    .map(([c, n]) => puceFiltre('personnes', c.id, c.nom, n)).join('');
  const formats = valeurs('formats').sort((a, b) => b[1] - a[1])
    .map(([cle, n]) => puceFiltre('formats', cle, NOMS_FORMAT[cle] ?? cle, n)).join('');
  const etoiles = [1, 2, 3, 4, 5].map((k) =>
    `<button type="button" class="pht-etoile${f.note && k <= f.note ? ' pleine' : ''}" data-filtre-note="${k}"
       aria-label="${k} étoile${k > 1 ? 's' : ''} et plus" aria-pressed="${f.note === k}">
       <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>
     </button>`).join('');
  // « JAMAIS PUBLIÉE » : la question de Noé — retrouver les bonnes photos encore
  // jamais sorties. Elle s'offre dès qu'une photo l'est, comme tout filtre.
  const jamais = (etat.photos ?? []).filter((p) => !foisPubliee(p)).length;
  const publication = `<button type="button" class="pht-etiq" data-filtre-jamais data-etat="${f.jamais ? 'tout' : 'rien'}"
      aria-pressed="${f.jamais}">Jamais publiée <span class="pht-etiq-n">${jamais}</span></button>`;
  return `
    ${blocFiltre('Publication', publication)}
    ${blocFiltre('Période', mois)}
    ${blocFiltre('Compétition', competitions)}
    <div class="pht-tri-famille">
      <p class="pht-tri-titre">Note ${f.note ? `<span class="pht-tri-note-mixte">${f.note} et plus</span>` : ''}</p>
      <div class="pht-etoiles">${etoiles}</div>
    </div>
    ${familles}
    ${blocFiltre('Qui est dessus', personnes)}
    ${blocFiltre('Format', formats)}
    ${blocFiltre('Match', matchs)}`;
}

// LES FILTRES SONT OUVERTS SUR ORDINATEUR, REPLIÉS SUR TÉLÉPHONE : à côté des
// photos ils ne cachent rien ; au-dessus, ils prendraient tout l'écran. Ensuite
// ils restent comme Noé les a laissés.
const filtresOuverts = () => etat.filtresOuverts ?? window.matchMedia('(min-width: 60rem)').matches;

function gabaritRecherche() {
  if (!etat.photos) return '<p class="car-attente">Un instant…</p>';
  const liste = resultats();
  const n = nbFiltres();
  return `
    <div class="car-tete">
      <a class="car-retour" href="#yuno/phototheque" aria-label="La photothèque" title="La photothèque">${svg('retour', 20)}</a>
      <div class="pht-titre">${etat.pour ? enteteDuChoix() : '<h2 class="pht-nom">Rechercher</h2>'}</div>
    </div>
    <div class="pht-recherche">
      <details class="pht-filtres" data-pht-filtres${filtresOuverts() ? ' open' : ''}>
        <summary>
          <span>Filtres${n ? ` · <span class="chiffre">${n}</span>` : ''}</span>
          ${n ? '<button type="button" class="car-puce car-puce-mini" data-pht="effacer-filtres">Tout effacer</button>' : ''}
        </summary>
        <div class="pht-tri pht-filtres-corps">${gabaritFiltres()}</div>
      </details>
      <div class="pht-resultats">
        <div class="car-tout-tete">
          <p class="car-petit-titre"><span class="chiffre">${liste.length}</span> photo${liste.length > 1 ? 's' : ''}</p>
          <span class="pht-gestes">
            <span class="pht-ordre" role="group" aria-label="Ordre">
              <button type="button" class="car-puce${etat.ordre === 'recentes' ? ' actif' : ''}" data-ordre="recentes" aria-pressed="${etat.ordre === 'recentes'}">Récentes</button>
              <button type="button" class="car-puce${etat.ordre === 'notees' ? ' actif' : ''}" data-ordre="notees" aria-pressed="${etat.ordre === 'notees'}">Mieux notées</button>
            </span>
            ${etat.pour ? '' : etat.modeSelection
              ? `<button type="button" class="car-puce" data-pht="tout" data-pht-sel-compte>${toutEstChoisi() ? 'Tout désélectionner' : 'Tout sélectionner'}</button>
                 <button type="button" class="car-puce" data-pht="fin-selection">Terminé</button>`
              : `<button type="button" class="car-puce" data-pht="selectionner"${liste.length ? '' : ' disabled'}>Sélectionner</button>`}
          </span>
        </div>
        ${liste.length
          ? `<div class="pht-grille${etat.modeSelection ? ' en-selection' : ''}">${liste.map(tuile).join('')}</div>`
          : `<p class="car-liste-vide">${etat.photos.length ? 'Aucune photo ne coche tout. Retire un filtre.' : 'Importe un match : ses photos se chercheront ici.'}</p>`}
        ${gabaritBarreSelection()}
      </div>
    </div>`;
}

// Un filtre touché : la grille se redessine, la sélection garde ce qui reste
// visible — une photo qu'on ne voit plus ne peut pas rester choisie.
function changerFiltres(maj) {
  maj();
  const visibles = new Set(resultats().map((p) => p.id));
  for (const id of [...etat.selection]) if (!visibles.has(id)) etat.selection.delete(id);
  const ouvert = hote?.querySelector('[data-pht-filtres]')?.open;
  etat.filtresOuverts = ouvert ?? true;
  const defile = window.scrollY;
  dessiner();
  window.scrollTo(0, defile);
}

// --- La compétition d'un match ---------------------------------------------------------------

function competitionsConnues() {
  const toutes = new Set();
  for (const p of etat.photos ?? []) if (p.evenement?.competition) toutes.add(p.evenement.competition);
  for (const s of etat.sorties ?? []) if (s.competition) toutes.add(s.competition);
  return [...toutes].sort((a, b) => a.localeCompare(b, 'fr'));
}

async function poserCompetition(champ) {
  const match = matchDe(cible);
  if (!match) return;
  const valeur = champ.value.trim().replace(/\s+/g, ' ') || null;
  // Une compétition déjà écrite autrement (casse, accents) prend sa forme
  // connue : deux orthographes feraient deux filtres.
  const connue = valeur && competitionsConnues().find((c) => sansAccent(c) === sansAccent(valeur));
  const finale = connue ?? valeur;
  if ((match.competition ?? null) === finale) { champ.value = finale ?? ''; return; }
  const avant = match.competition ?? null;
  const appliquer = (v) => {
    for (const p of etat.photos ?? []) if (p.evenement_id === cible && p.evenement) p.evenement.competition = v;
    const s = (etat.sorties ?? []).find((x) => x.id === cible);
    if (s) s.competition = v;
    match.competition = v;
  };
  appliquer(finale);
  champ.value = finale ?? '';
  champ.closest('.pht-competition')?.classList.toggle('relie', Boolean(finale));
  try {
    await api.poserCompetition(cible, finale);
    if (finale) messageCourt(`Toutes les photos du match comptent en ${finale}.`);
  } catch (e) {
    console.error('Compétition non enregistrée', e);
    appliquer(avant);
    champ.value = avant ?? '';
    bulle("Ce n'est pas enregistré", 'La compétition n’a pas pu être gardée.', champ);
  }
}

// --- Renommer et supprimer une étiquette ----------------------------------------------------

async function renommer(champ) {
  const id = champ.dataset.etiqRenommer;
  const e = (etat.etiquettes ?? []).find((x) => x.id === id);
  if (!e) return;
  const nom = champ.value.trim().replace(/\s+/g, ' ');
  if (!nom || nom === e.nom) { champ.value = e.nom; return; }
  const doublon = (etat.etiquettes ?? []).some((x) => x.id !== id && x.famille === e.famille && sansAccent(x.nom) === sansAccent(nom));
  if (doublon) {
    champ.value = e.nom;
    bulle('Elle existe déjà', `« ${nom} » est déjà une étiquette de cette famille.`, champ);
    return;
  }
  const avant = e.nom;
  e.nom = nom;
  try {
    await api.renommerEtiquette(id, nom);
  } catch (err) {
    console.error('Étiquette non renommée', err);
    e.nom = avant;
    champ.value = avant;
    bulle("Ce n'est pas enregistré", 'L’étiquette n’a pas pu être renommée.', champ);
  }
}

async function supprimerUneEtiquette(id, bouton) {
  const e = (etat.etiquettes ?? []).find((x) => x.id === id);
  if (!e) return;
  const avantListe = [...etat.etiquettes];
  const portees = (etat.photos ?? []).filter((p) => p.etiquettes?.has(id));
  etat.etiquettes = etat.etiquettes.filter((x) => x.id !== id);
  portees.forEach((p) => p.etiquettes.delete(id));
  etat.filtres.etiquettes.delete(id);
  etat.supprimerEtiq = null;
  redessinerTri();
  try {
    await api.supprimerEtiquette(id);
  } catch (err) {
    console.error('Étiquette non supprimée', err);
    etat.etiquettes = avantListe;
    portees.forEach((p) => p.etiquettes.add(id));
    redessinerTri();
    bulle("Ce n'est pas passé", 'L’étiquette n’a pas pu être supprimée.', bouton);
  }
}

// --- Le tri (étape 2) ---------------------------------------------------------------------
//
// UN SEUL PANNEAU POUR TOUT TRIER, une photo ou toute une sélection : les
// étoiles, les deux familles d'étiquettes, et qui est dessus. Il vit dans la
// visionneuse (au fil de l'eau, photo par photo) et dans la fenêtre de la
// sélection (par lot). Deux écrans, un seul geste — et un seul code.
//
// SUR UNE SÉLECTION, UNE ÉTIQUETTE A TROIS ÉTATS : toutes l'ont (pleine),
// certaines l'ont (à moitié), aucune (vide). Presser la pose sur toutes, sauf
// si toutes l'ont déjà : elle s'en va alors de toutes. C'est le geste d'une
// case « tout cocher ».

const FAMILLES = [
  { cle: 'style', nom: 'Le style' },
  { cle: 'recit', nom: 'Ce que ça raconte' },
];
const TYPES_PERSONNE = { joueur: 'Joueur', club: 'Club' };

function ciblesDu(contexte) {
  if (contexte === 'vue') return [photo(etat.ouverte)].filter(Boolean);
  return [...etat.selection].map(photo).filter(Boolean);
}

// 'tout' | 'partie' | 'rien'
function etatDans(cibles, cleDuSet, id) {
  const n = cibles.filter((p) => p[cleDuSet].has(id)).length;
  return n === 0 ? 'rien' : n === cibles.length ? 'tout' : 'partie';
}

function puce(attribut, id, nom, etatPuce, titre = '') {
  return `<button type="button" class="pht-etiq" data-${attribut}="${id}" data-etat="${etatPuce}"
      aria-pressed="${etatPuce === 'tout' ? 'true' : etatPuce === 'partie' ? 'mixed' : 'false'}"${
      titre ? ` title="${echapper(titre)}"` : ''}>${echapper(nom)}</button>`;
}

function panneauTri(contexte) {
  const cibles = ciblesDu(contexte);
  if (!cibles.length) return '';
  const notes = new Set(cibles.map((p) => p.note ?? null));
  const note = notes.size === 1 ? [...notes][0] : null;
  const etoiles = [1, 2, 3, 4, 5].map((k) =>
    `<button type="button" class="pht-etoile${note && k <= note ? ' pleine' : ''}" data-tri-note="${k}"
       aria-label="${k} étoile${k > 1 ? 's' : ''}" aria-pressed="${note === k}">
       <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>
     </button>`).join('');
  const melange = notes.size > 1 ? '<span class="pht-tri-note-mixte">notes différentes</span>' : '';

  const familles = FAMILLES.map(({ cle, nom }) => {
    const mots = (etat.etiquettes ?? []).filter((e) => e.famille === cle);
    const puces = mots.map((e) => puce('tri-etiquette', e.id, e.nom, etatDans(cibles, 'etiquettes', e.id))).join('');
    if (etat.gestion === cle) {
      const lignes = mots.map((e) => {
        const n = (etat.photos ?? []).filter((p) => p.etiquettes?.has(e.id)).length;
        const confirmer = etat.supprimerEtiq === e.id;
        return `<div class="pht-gere">
            <input class="pht-etiq-champ" data-etiq-renommer="${e.id}" value="${echapper(e.nom)}" maxlength="40"
              autocomplete="off" aria-label="Renommer ${echapper(e.nom)}">
            <span class="pht-gere-n discret">${n} photo${n > 1 ? 's' : ''}</span>
            <button type="button" class="${confirmer ? 'car-danger' : 'car-puce'} car-puce-mini" data-etiq-supprimer="${e.id}"
              aria-label="Supprimer ${echapper(e.nom)}">${confirmer ? 'Supprimer ?' : svg('corbeille', 13)}</button>
          </div>`;
      }).join('');
      return `<div class="pht-tri-famille">
          <p class="pht-tri-titre">${nom}
            <button type="button" class="pht-tri-gerer" data-tri-gerer="">Terminé</button></p>
          <div class="pht-gere-liste">${lignes}</div>
        </div>`;
    }
    const ajout = etat.ajout === cle
      ? `<input class="pht-etiq-champ" data-tri-nouvelle="${cle}" maxlength="40" autocomplete="off"
           placeholder="Nouvelle étiquette" aria-label="Nouvelle étiquette : ${echapper(nom)}">`
      : `<button type="button" class="pht-etiq pht-etiq-plus" data-tri-ajouter="${cle}"
           aria-label="Ajouter une étiquette : ${echapper(nom)}">${svg('ajouter', 14)}</button>`;
    return `<div class="pht-tri-famille">
        <p class="pht-tri-titre">${nom}
          ${mots.length ? `<button type="button" class="pht-tri-gerer" data-tri-gerer="${cle}">Modifier</button>` : ''}</p>
        <div class="pht-etiqs">${puces}${ajout}</div>
      </div>`;
  }).join('');

  // Qui est dessus : celles et ceux déjà posés sur au moins une photo.
  const presents = new Set(cibles.flatMap((p) => [...p.personnes]));
  const puces = [...presents].map((id) => {
    const c = (etat.personnes ?? []).find((x) => x.id === id);
    return c ? puce('tri-personne', id, c.nom, etatDans(cibles, 'personnes', id),
      [TYPES_PERSONNE[c.type] ?? null, c.structure].filter(Boolean).join(' · ')) : '';
  }).join('');

  return `<div class="pht-tri" data-tri-contexte="${contexte}">
      <div class="pht-tri-famille">
        <p class="pht-tri-titre">La note ${melange}</p>
        <div class="pht-etoiles">${etoiles}</div>
      </div>
      ${familles}
      <div class="pht-tri-famille">
        <p class="pht-tri-titre">Qui est dessus</p>
        ${puces ? `<div class="pht-etiqs">${puces}</div>` : ''}
        <div class="pht-qui">
          <input class="pht-etiq-champ pht-qui-champ" data-tri-qui value="${echapper(etat.recherche)}"
            autocomplete="off" spellcheck="false" placeholder="Un joueur, un club…"
            aria-label="Ajouter un joueur ou un club">
          <div class="pht-qui-propositions" data-tri-propositions>${propositions(contexte)}</div>
        </div>
      </div>
    </div>`;
}

const sansAccent = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// LES PROPOSITIONS DU RÉSEAU : joueurs et clubs d'abord, puis le reste. Un nom
// qu'on ne trouve pas devient une fiche — joueur ou club, au choix.
function propositions(contexte) {
  const q = etat.recherche.trim();
  if (!q) return '';
  const cibles = ciblesDu(contexte);
  const deja = new Set(cibles.flatMap((p) => [...p.personnes]));
  const rang = (c) => (c.type === 'joueur' ? 0 : c.type === 'club' ? 1 : 2);
  const trouves = (etat.personnes ?? [])
    .filter((c) => sansAccent(`${c.nom} ${c.structure ?? ''}`).includes(sansAccent(q)))
    .sort((a, b) => rang(a) - rang(b) || a.nom.localeCompare(b.nom, 'fr'))
    .slice(0, 6);
  const exact = trouves.some((c) => sansAccent(c.nom) === sansAccent(q));
  return `${trouves.map((c) => `<button type="button" class="pht-proposition" data-tri-poser="${c.id}"${
      deja.has(c.id) ? ' data-deja' : ''}>
      <span>${echapper(c.nom)}</span>
      <span class="discret">${echapper([TYPES_PERSONNE[c.type] ?? 'Réseau', c.structure].filter(Boolean).join(' · '))}</span>
    </button>`).join('')}${exact ? '' : `
    <div class="pht-proposition-nouvelle">
      <span class="discret">Créer « ${echapper(q)} » :</span>
      <button type="button" class="car-puce car-puce-mini" data-tri-creer="joueur">Joueur</button>
      <button type="button" class="car-puce car-puce-mini" data-tri-creer="club">Club</button>
    </div>`}`;
}

// Tout ce qui montre le tri se redessine ensemble : le panneau ouvert, la
// pastille des tuiles. Jamais la photo de la visionneuse — elle clignoterait.
function redessinerTri() {
  document.querySelectorAll('[data-tri-contexte]').forEach((el) => {
    const contexte = el.dataset.triContexte;
    const champ = document.activeElement?.matches?.('[data-tri-nouvelle], [data-tri-qui]')
      && el.contains(document.activeElement) ? document.activeElement : null;
    const quel = champ ? (champ.matches('[data-tri-qui]') ? '[data-tri-qui]' : `[data-tri-nouvelle="${champ.dataset.triNouvelle}"]`) : null;
    el.outerHTML = panneauTri(contexte);
    if (quel) {
      const nouveau = document.querySelector(`[data-tri-contexte="${contexte}"] ${quel}`);
      nouveau?.focus();
      nouveau?.setSelectionRange?.(nouveau.value.length, nouveau.value.length);
    }
  });
  for (const p of etat.photos ?? []) majTuile(p);
  majBarreSelection();
}

const rangDansLeChoix = (p) => {
  if (!etat.pour || !etat.selection.has(p.id)) return '';
  return String([...etat.selection].indexOf(p.id) + 1);
};
const badgePubliee = (p) => {
  const n = foisPubliee(p);
  return n ? `<span class="pht-publiee" title="Publiée ${n} fois" aria-label="Publiée ${n} fois">↗${n > 1 ? ` ${n}` : ''}</span>` : '';
};

function majTuile(p) {
  hote?.querySelectorAll(`[data-ouvrir="${p.id}"]`).forEach((t) => {
    t.querySelector('.pht-note')?.remove();
    if (p.note) t.insertAdjacentHTML('beforeend', badgeNote(p));
    const coche = t.querySelector('.pht-coche');
    if (coche) coche.textContent = rangDansLeChoix(p);
    t.classList.toggle('choisie', etat.selection.has(p.id));
  });
}

const badgeNote = (p) => (p.note
  ? `<span class="pht-note" aria-label="${p.note} étoile${p.note > 1 ? 's' : ''}">★ ${p.note}</span>` : '');

// L'ÉCRAN D'ABORD, LE RÉSEAU ENSUITE, et l'état d'avant revient si l'écriture
// échoue. On n'écrit en base que les photos qui y sont déjà : les autres
// reprendront leur tri en arrivant (voir `envoyer`).
async function ecrire({ cibles, appliquer, defaire, appel, ancre, message }) {
  appliquer();
  redessinerTri();
  const ids = cibles.filter((p) => p.enBase || p.envoi === 'fait').map((p) => p.id);
  if (!ids.length) return;
  try {
    await appel(ids);
  } catch (e) {
    console.error(message, e);
    defaire();
    redessinerTri();
    bulle("Ce n'est pas enregistré", message, ancre);
  }
}

function noter(contexte, k, ancre) {
  const cibles = ciblesDu(contexte);
  if (!cibles.length) return;
  const avant = cibles.map((p) => p.note);
  // La même étoile retouchée efface la note — comme sur la fiche d'un livre.
  const nouvelle = cibles.every((p) => p.note === k) ? null : k;
  return ecrire({
    cibles,
    appliquer: () => cibles.forEach((p) => { p.note = nouvelle; }),
    defaire: () => cibles.forEach((p, i) => { p.note = avant[i]; }),
    appel: (ids) => api.noterPhotos(ids, nouvelle),
    ancre,
    message: 'La note n’a pas pu être gardée.',
  });
}

function basculer(contexte, cleDuSet, id, ancre) {
  const cibles = ciblesDu(contexte);
  if (!cibles.length) return;
  const retirer = cibles.every((p) => p[cleDuSet].has(id));
  const avant = cibles.map((p) => p[cleDuSet].has(id));
  const poser = cleDuSet === 'etiquettes' ? api.etiqueterPhotos : api.relierPersonne;
  const oter = cleDuSet === 'etiquettes' ? api.desetiqueterPhotos : api.delierPersonne;
  return ecrire({
    cibles,
    appliquer: () => cibles.forEach((p) => (retirer ? p[cleDuSet].delete(id) : p[cleDuSet].add(id))),
    defaire: () => cibles.forEach((p, i) => (avant[i] ? p[cleDuSet].add(id) : p[cleDuSet].delete(id))),
    appel: (ids) => (retirer ? oter(ids, id) : poser(ids, id)),
    ancre,
    message: cleDuSet === 'etiquettes' ? 'L’étiquette n’a pas pu être gardée.' : 'Le lien au réseau n’a pas pu être gardé.',
  });
}

// Poser (jamais retirer) : c'est le geste d'une proposition qu'on choisit.
function poserPersonne(contexte, id, ancre) {
  const cibles = ciblesDu(contexte);
  if (cibles.every((p) => p.personnes.has(id))) return;
  const avant = cibles.map((p) => p.personnes.has(id));
  return ecrire({
    cibles,
    appliquer: () => cibles.forEach((p) => p.personnes.add(id)),
    defaire: () => cibles.forEach((p, i) => { if (!avant[i]) p.personnes.delete(id); }),
    appel: (ids) => api.relierPersonne(ids, id),
    ancre,
    message: 'Le lien au réseau n’a pas pu être gardé.',
  });
}

async function nouvelleEtiquette(contexte, famille, nom, ancre) {
  nom = nom.trim().replace(/\s+/g, ' ');
  etat.ajout = null;
  if (!nom) { redessinerTri(); return; }
  // Un mot qui existe déjà dans la famille se pose, il ne se double pas.
  const existante = (etat.etiquettes ?? []).find((e) => e.famille === famille && sansAccent(e.nom) === sansAccent(nom));
  if (existante) {
    if (!ciblesDu(contexte).every((p) => p.etiquettes.has(existante.id))) basculer(contexte, 'etiquettes', existante.id, ancre);
    else redessinerTri();
    return;
  }
  try {
    const ordre = Math.max(0, ...(etat.etiquettes ?? []).filter((e) => e.famille === famille).map((e) => e.ordre)) + 1;
    const e = await api.creerEtiquette({ famille, nom: nom[0].toUpperCase() + nom.slice(1), ordre });
    etat.etiquettes = [...(etat.etiquettes ?? []), e];
    basculer(contexte, 'etiquettes', e.id, ancre);
  } catch (err) {
    console.error('Étiquette non créée', err);
    redessinerTri();
    bulle("Ce n'est pas enregistré", 'L’étiquette n’a pas pu être créée.', ancre);
  }
}

async function nouvellePersonne(contexte, type, ancre) {
  const nom = etat.recherche.trim();
  if (!nom) return;
  try {
    const c = await api.creerContact({ nom, type });
    etat.personnes = [...(etat.personnes ?? []), c];
    etat.recherche = '';
    poserPersonne(contexte, c.id, ancre);
    messageCourt(`${nom} a sa fiche dans le réseau.`);
  } catch (err) {
    console.error('Fiche non créée', err);
    bulle("Ce n'est pas enregistré", 'La fiche n’a pas pu être créée.', ancre);
  }
}

// Les écouteurs du panneau, posés sur une racine qui le contient — la
// visionneuse ou la fenêtre de la sélection.
function brancherTri(racine) {
  racine.addEventListener('click', (e) => {
    const gerer = e.target.closest('[data-tri-gerer]');
    if (gerer) {
      etat.gestion = gerer.dataset.triGerer || null;
      etat.supprimerEtiq = null;
      etat.ajout = null;
      redessinerTri();
      return;
    }
    const suppr = e.target.closest('[data-etiq-supprimer]');
    if (suppr) {
      const id = suppr.dataset.etiqSupprimer;
      // Le second appui confirme : une étiquette emporte ses liens avec elle.
      if (etat.supprimerEtiq === id) supprimerUneEtiquette(id, suppr);
      else { etat.supprimerEtiq = id; redessinerTri(); }
      return;
    }
    const el = e.target.closest('[data-tri-note], [data-tri-etiquette], [data-tri-personne], [data-tri-ajouter], [data-tri-poser], [data-tri-creer]');
    if (!el) return;
    const contexte = el.closest('[data-tri-contexte]')?.dataset.triContexte;
    if (!contexte) return;
    if (el.dataset.triNote) noter(contexte, Number(el.dataset.triNote), el);
    else if (el.dataset.triEtiquette) basculer(contexte, 'etiquettes', el.dataset.triEtiquette, el);
    else if (el.dataset.triPersonne) basculer(contexte, 'personnes', el.dataset.triPersonne, el);
    else if (el.dataset.triAjouter) {
      etat.ajout = el.dataset.triAjouter;
      redessinerTri();
      racine.querySelector(`[data-tri-nouvelle="${etat.ajout}"]`)?.focus();
    } else if (el.dataset.triPoser) {
      etat.recherche = '';
      poserPersonne(contexte, el.dataset.triPoser, el);
    } else if (el.dataset.triCreer) nouvellePersonne(contexte, el.dataset.triCreer, el);
  });
  racine.addEventListener('change', (e) => {
    if (e.target.matches?.('[data-etiq-renommer]')) renommer(e.target);
  });
  racine.addEventListener('keydown', (e) => {
    if (e.target.matches?.('[data-etiq-renommer]') && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
      return;
    }
    const champ = e.target.closest?.('[data-tri-nouvelle]');
    if (champ && e.key === 'Enter') {
      e.preventDefault();
      const contexte = champ.closest('[data-tri-contexte]').dataset.triContexte;
      nouvelleEtiquette(contexte, champ.dataset.triNouvelle, champ.value, champ);
    } else if (champ && e.key === 'Escape') {
      e.stopPropagation();
      etat.ajout = null;
      redessinerTri();
    }
    const qui = e.target.closest?.('[data-tri-qui]');
    if (qui && e.key === 'Enter') {
      // Entrée prend la première proposition : c'est le chemin du clavier.
      e.preventDefault();
      qui.closest('.pht-qui').querySelector('[data-tri-poser]:not([data-deja])')?.click();
    } else if (qui && e.key === 'Escape' && etat.recherche) {
      e.stopPropagation();
      etat.recherche = '';
      redessinerTri();
    }
  });
  racine.addEventListener('input', (e) => {
    const qui = e.target.closest?.('[data-tri-qui]');
    if (!qui) return;
    etat.recherche = qui.value;
    // Seules les propositions se redessinent : le champ garde son curseur.
    const contexte = qui.closest('[data-tri-contexte]').dataset.triContexte;
    const boite = qui.closest('.pht-qui').querySelector('[data-tri-propositions]');
    if (boite) boite.innerHTML = propositions(contexte);
  });
  // Quitter le champ d'une nouvelle étiquette l'enregistre, comme le nom d'un
  // carrousel ; vide, il se referme simplement.
  racine.addEventListener('focusout', (e) => {
    const champ = e.target.closest?.('[data-tri-nouvelle]');
    if (!champ || !champ.isConnected || etat.ajout !== champ.dataset.triNouvelle) return;
    const contexte = champ.closest('[data-tri-contexte]').dataset.triContexte;
    nouvelleEtiquette(contexte, champ.dataset.triNouvelle, champ.value, champ);
  });
}

// --- La sélection multiple ----------------------------------------------------------------

function toucherEnSelection(id, intervalle) {
  if (intervalle && etat.derniereTouchee) {
    // Maj + clic : tout ce qui est entre les deux, dans l'ordre de la grille.
    const liste = photosAffichees().map((p) => p.id);
    const [a, b] = [liste.indexOf(etat.derniereTouchee), liste.indexOf(id)].sort((x, y) => x - y);
    if (a >= 0 && b >= 0) liste.slice(a, b + 1).forEach((x) => etat.selection.add(x));
  } else if (etat.selection.has(id)) etat.selection.delete(id);
  else {
    // INSTAGRAM NE PREND PAS PLUS DE VINGT IMAGES DANS UN CARROUSEL.
    const pub = etat.pour ? parutionDe(etat.pour) : null;
    if (pub?.format === 'carrousel' && etat.selection.size >= MAX_CARROUSEL) {
      bulle('C’est complet', `Un carrousel prend ${MAX_CARROUSEL} photos au plus. Retires-en une pour en choisir une autre.`,
        hote?.querySelector(`[data-ouvrir="${id}"]`));
      return;
    }
    etat.selection.add(id);
  }
  etat.derniereTouchee = id;
  etat.confirmerRetraitSel = false;
  majTuile(photo(id) ?? { id });
  // Pour une parution, la coche porte le RANG : retirer la 3e renumérote tout.
  if (intervalle || etat.pour) for (const p of photosAffichees()) majTuile(p);
  majBarreSelection();
}

const toutEstChoisi = () => {
  const liste = photosAffichees();
  return liste.length > 0 && liste.every((p) => etat.selection.has(p.id));
};

function quitterLaSelection() {
  etat.modeSelection = false;
  etat.selection = new Set();
  etat.derniereTouchee = null;
  etat.fenetreTri = false;
  etat.confirmerRetraitSel = false;
  dessinerFenetreTri();
  dessiner();
}

function gabaritBarreSelection() {
  if (!etat.modeSelection) return '';
  const n = etat.selection.size;
  if (etat.pour) {
    const pub = parutionDe(etat.pour);
    const max = pub?.format === 'carrousel' ? MAX_CARROUSEL : null;
    return `<div class="pht-barre-sel" data-pht-barre>
        <span class="pht-barre-texte"><span class="chiffre">${n}</span>${max ? ` / ${max}` : ''} choisie${n > 1 ? 's' : ''}</span>
        <button type="button" class="car-puce" data-pht="annuler-pour">Annuler</button>
        <button type="button" class="car-bouton-or" data-pht="garder-pour">Garder</button>
      </div>`;
  }
  return `<div class="pht-barre-sel" data-pht-barre>
      ${etat.confirmerRetraitSel
        ? `<span class="pht-barre-texte">Retirer ${n} photo${n > 1 ? 's' : ''} ? C'est définitif.</span>
           <button type="button" class="car-puce" data-pht="garder-sel">Garder</button>
           <button type="button" class="car-danger" data-pht="retirer-sel-oui">Retirer</button>`
        : `<span class="pht-barre-texte"><span class="chiffre">${n}</span> sélectionnée${n > 1 ? 's' : ''}</span>
           <button type="button" class="car-icone" data-pht="retirer-sel" aria-label="Retirer la sélection"
             title="Retirer"${n ? '' : ' disabled'}>${svg('corbeille')}</button>
           ${menuDesParutions(n)}
           <button type="button" class="car-bouton-or" data-pht="trier-sel"${n ? '' : ' disabled'}>Trier</button>`}
    </div>`;
}

function majBarreSelection() {
  const barre = hote?.querySelector('[data-pht-barre]');
  if (barre) barre.outerHTML = gabaritBarreSelection();
  const compte = hote?.querySelector('[data-pht-sel-compte]');
  if (compte) compte.textContent = toutEstChoisi() ? 'Tout désélectionner' : 'Tout sélectionner';
}

// La fenêtre qui trie la sélection : le même panneau que la visionneuse.
let fenetre = null;

function dessinerFenetreTri() {
  if (!etat.fenetreTri || !etat.selection.size) {
    fenetre?.remove();
    fenetre = null;
    if (!etat.ouverte) document.body.classList.remove('pht-vue-ouverte');
    return;
  }
  if (!fenetre) {
    fenetre = document.createElement('div');
    fenetre.className = 'pht-fen-hote';
    document.body.appendChild(fenetre);
    brancherTri(fenetre);
    fenetre.addEventListener('click', (e) => {
      if (e.target.closest('[data-pht="fermer-tri"]') || e.target.classList.contains('pht-fen-fond')) {
        etat.fenetreTri = false;
        etat.ajout = null;
        etat.recherche = '';
        etat.gestion = null;
        dessinerFenetreTri();
        // Dans la recherche, ce qu'on vient de trier peut changer les résultats.
        if (vueCourante === 'recherche') dessiner();
      }
    });
  }
  const n = etat.selection.size;
  const vignettes = [...etat.selection].slice(0, 6).map(photo).filter(Boolean)
    .map((p) => `<span class="pht-fen-vignette">${p.vignette ? `<img src="${echapper(p.vignette)}" alt="">` : ''}</span>`).join('');
  fenetre.innerHTML = `
    <div class="pht-fen-fond">
      <div class="pht-fen" role="dialog" aria-modal="true" aria-label="Trier ${n} photos">
        <div class="pht-fen-tete">
          <span class="pht-fen-vignettes">${vignettes}</span>
          <p class="pht-fen-titre">Trier <span class="chiffre">${n}</span> photo${n > 1 ? 's' : ''}</p>
          <button type="button" class="car-icone" data-pht="fermer-tri" aria-label="Fermer">${svg('fermer')}</button>
        </div>
        ${panneauTri('selection')}
      </div>
    </div>`;
  document.body.classList.add('pht-vue-ouverte');
}

async function retirerLaSelection(bouton) {
  const cibles = [...etat.selection].map(photo).filter(Boolean);
  if (!cibles.length) return;
  const avant = [...etat.photos];
  const ids = new Set(cibles.map((p) => p.id));
  etat.photos = etat.photos.filter((p) => !ids.has(p.id));
  etat.selection = new Set();
  etat.confirmerRetraitSel = false;
  dessiner();
  try {
    const enBase = cibles.filter((p) => p.enBase || p.envoi === 'fait').map((p) => p.id);
    if (enBase.length) await api.supprimerPhotos(enBase);
    for (const p of cibles) {
      if (p.cle) supprimerFichier(p.cle).catch((e) => console.error('Fichier non supprimé', e));
    }
    messageCourt(`${cibles.length} photo${cibles.length > 1 ? 's' : ''} retirée${cibles.length > 1 ? 's' : ''}.`);
  } catch (e) {
    console.error('Photos non retirées', e);
    etat.photos = avant;
    dessiner();
    bulle("Ce n'est pas passé", 'Les photos n’ont pas pu être retirées.', bouton);
  }
}

// --- Les photos d'une parution (étape 4) ------------------------------------------------------
//
// LE BUT FINAL DE LA PHOTOTHÈQUE : choisir les photos d'un post parmi toutes
// celles du site. Deux chemins y mènent, et ils écrivent la même table :
//   — depuis la FICHE d'une idée ou d'une parution, « Choisir les photos »
//     ouvre la recherche en mode choix (`#yuno/phototheque/pour-<id>`) : on
//     filtre, on touche dans l'ordre du post, on garde ;
//   — depuis une SÉLECTION de la photothèque, « Pour une parution » ajoute les
//     photos choisies à la suite d'une parution existante.

const PREFIXE_POUR = 'pour-';

function libelleParution(pub) {
  const quand = pub.date_prevue
    ? new Date(`${pub.date_prevue}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'idée';
  return `${pub.titre} · ${quand}`;
}

function enteteDuChoix() {
  const pub = parutionDe(etat.pour);
  return `<p class="pht-pour-sur">Photos pour</p>
    <h2 class="pht-nom">${pub ? echapper(pub.titre) : 'Une parution'}</h2>
    ${pub ? `<span class="discret">${echapper([pub.format === 'carrousel' ? 'Carrousel' : pub.format === 'reel' ? 'Reel' : pub.format === 'story' ? 'Story' : null,
      pub.date_prevue ? jourCourt(`${pub.date_prevue}T12:00:00`) : 'Dans la banque d’idées'].filter(Boolean).join(' · '))}
      · touche les photos dans l'ordre du post</span>` : ''}`;
}

// LE MENU DES PARUTIONS, sur la barre d'une sélection : celles qui ne sont pas
// encore parties, les programmées d'abord (la plus proche en tête), puis les
// idées. Le menu du système, posé sur une pastille, comme le choix du match.
function menuDesParutions(n) {
  const ouvertes = (etat.parutions ?? []).filter((x) => x.statut !== 'publie');
  if (!ouvertes.length || !n) return '';
  const datees = ouvertes.filter((x) => x.date_prevue).sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));
  const idees = ouvertes.filter((x) => !x.date_prevue);
  const options = (liste) => liste.map((x) => `<option value="${x.id}">${echapper(libelleParution(x))}</option>`).join('');
  return `<label class="car-puce pht-pour-menu">
      <span>Pour une parution</span>
      <select data-pht-parution aria-label="Ajouter la sélection à une parution">
        <option value="" selected disabled>Pour une parution</option>
        ${datees.length ? `<optgroup label="Programmées">${options(datees)}</optgroup>` : ''}
        ${idees.length ? `<optgroup label="Idées">${options(idees)}</optgroup>` : ''}
      </select>
    </label>`;
}

// Ce que la visionneuse dit de la vie d'une photo : où elle est partie, où elle
// attend de partir. Un fait, jamais un reproche — une photo jamais publiée ne
// porte aucune mention.
function vieDeLaPhoto(p) {
  const n = foisPubliee(p);
  const attente = enAttente(p);
  const morceaux = [];
  if (n) morceaux.push(`Publiée ${n} fois`);
  if (attente.length === 1) morceaux.push(`choisie pour « ${echapper(attente[0].titre)} »`);
  else if (attente.length > 1) morceaux.push(`choisie pour ${attente.length} parutions`);
  if (!morceaux.length) return '';
  const phrase = morceaux.join(', ');
  return `<span class="pht-vie">${phrase[0].toUpperCase()}${phrase.slice(1)}</span>`;
}

// UNE SEULE LECTURE À LA FOIS : le site monte l'écran deux fois de suite à
// l'ouverture, et une seconde lecture arrivée APRÈS les premières touches
// effaçait l'ordre qu'on venait de composer (mesuré : le post gardé était
// l'ancien).
let choixEnLecture = null;

async function chargerLeChoix() {
  const id = etat.pour;
  if (!id || etat.pourCharge === id || choixEnLecture === id) return;
  choixEnLecture = id;
  try {
    const lignes = await api.photosDeLaParution(id);
    if (etat.pour !== id || etat.pourCharge === id) return;
    etat.selection = new Set(lignes.map((l) => l.photo_id));
    etat.pourCharge = id;
    etat.modeSelection = true;
    dessiner();
  } catch (e) {
    console.error('Choix de la parution non lu', e);
    bulle("Ce n'est pas passé", 'Les photos de cette parution n’ont pas pu être lues.');
  } finally {
    if (choixEnLecture === id) choixEnLecture = null;
  }
}

function revenir() {
  // On est venu de la fiche : on y retourne. Sans histoire (lien ouvert seul),
  // la photothèque est le repli.
  if (history.length > 1) history.back();
  else location.hash = '#yuno/phototheque';
}

async function garderLeChoix(bouton) {
  const id = etat.pour;
  if (!id) return;
  const ids = [...etat.selection];
  bouton.disabled = true;
  try {
    await api.garderLesPhotosDeLaParution(id, ids);
    const choisies = new Set(ids);
    for (const p of etat.photos ?? []) {
      const avait = p.parutions.includes(id);
      if (choisies.has(p.id) && !avait) p.parutions = [...p.parutions, id];
      if (!choisies.has(p.id) && avait) p.parutions = p.parutions.filter((x) => x !== id);
    }
    const pub = parutionDe(id);
    messageCourt(ids.length
      ? `${ids.length} photo${ids.length > 1 ? 's' : ''} pour « ${pub?.titre ?? 'la parution'} ».`
      : 'La parution n’a plus de photos.');
    etat.pourCharge = null;
    revenir();
  } catch (e) {
    console.error('Choix non gardé', e);
    bouton.disabled = false;
    bulle("Ce n'est pas enregistré", 'Le choix des photos n’a pas pu être gardé.', bouton);
  }
}

async function ajouterAUneParution(select) {
  const id = select.value;
  const pub = parutionDe(id);
  const cibles = [...etat.selection].map(photo).filter((p) => p && (p.enBase || p.envoi === 'fait'));
  select.value = '';
  if (!pub || !cibles.length) return;
  const nouvelles = cibles.filter((p) => !p.parutions.includes(id));
  if (!nouvelles.length) { messageCourt(`Elles sont déjà dans « ${pub.titre} ».`); return; }
  const deja = (etat.photos ?? []).filter((p) => p.parutions.includes(id)).length;
  if (pub.format === 'carrousel' && deja + nouvelles.length > MAX_CARROUSEL) {
    bulle('C’est trop', `« ${pub.titre} » est un carrousel : ${MAX_CARROUSEL} photos au plus, il en a déjà ${deja}.`, select);
    return;
  }
  nouvelles.forEach((p) => { p.parutions = [...p.parutions, id]; });
  try {
    await api.ajouterPhotosALaParution(id, nouvelles.map((p) => p.id), deja);
    messageCourt(`${nouvelles.length} photo${nouvelles.length > 1 ? 's' : ''} ajoutée${nouvelles.length > 1 ? 's' : ''} à « ${pub.titre} ».`);
  } catch (e) {
    console.error('Photos non ajoutées', e);
    nouvelles.forEach((p) => { p.parutions = p.parutions.filter((x) => x !== id); });
    bulle("Ce n'est pas enregistré", 'Les photos n’ont pas pu être ajoutées.', select);
  }
}

// L'APERÇU DANS LA FICHE D'UNE PARUTION (site Yuno) : la rangée de ses photos,
// dans l'ordre du post, et la porte pour les choisir. La fiche n'en sait rien
// d'autre : elle pose un `[data-photos-pub]`, ce module le remplit.
export async function apercuParution(element) {
  const id = element.dataset.photosPub;
  if (!id || element.dataset.rempli === id) return;
  element.dataset.rempli = id;
  const lien = (texte) => `<a class="car-puce pht-apercu-lien" href="#yuno/phototheque/${PREFIXE_POUR}${id}">${svg('ajouter', 14)}<span>${texte}</span></a>`;
  element.innerHTML = `<p class="pht-apercu-titre">Les photos</p>${lien('Choisir les photos')}`;
  try {
    const [lignes] = await Promise.all([api.photosDeLaParution(id), etat.photos ? null : chargerEnSilence()]);
    const photos = lignes.map((l) => photo(l.photo_id)).filter(Boolean);
    if (!photos.length) return;
    await signer(photos);
    if (!element.isConnected) return;
    const montrees = photos.slice(0, 8);
    element.innerHTML = `
      <p class="pht-apercu-titre">Les photos · <span class="chiffre">${photos.length}</span></p>
      <div class="pht-apercu">${montrees.map((p, k) => `<span class="pht-apercu-cadre">
          ${p.vignette ? `<img src="${echapper(p.vignette)}" alt="" loading="lazy" decoding="async">` : ''}
          <span class="pht-apercu-n">${k + 1}</span></span>`).join('')}
        ${photos.length > montrees.length ? `<span class="pht-apercu-plus">+${photos.length - montrees.length}</span>` : ''}
      </div>
      ${lien('Changer le choix')}`;
  } catch (e) {
    console.error('Aperçu des photos impossible', e);
  }
}

// Le chargement, sans écran derrière : la fiche lit la photothèque sans l'ouvrir.
async function chargerEnSilence() {
  const ancien = hote;
  if (!hote?.isConnected) hote = null;
  await charger();
  if (!hote) hote = ancien;
}

// --- La visionneuse ---------------------------------------------------------------------------

function gabaritVisionneuse() {
  const p = photo(etat.ouverte);
  if (!p) return '';
  const liste = listeDeLaVue();
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
      <div class="pht-vue-corps">
        <div class="pht-vue-scene">
          <button type="button" class="pht-vue-fleche" data-pht="precedente" aria-label="Photo précédente"${k > 0 ? '' : ' disabled'}>${svg('gauche', 22)}</button>
          <img class="pht-vue-image" src="${echapper(src)}" alt="">
          <button type="button" class="pht-vue-fleche" data-pht="suivante" aria-label="Photo suivante"${k < liste.length - 1 ? '' : ' disabled'}>${svg('droite', 22)}</button>
        </div>
        <aside class="pht-vue-cote" aria-label="Trier cette photo">${panneauTri('vue')}</aside>
      </div>
      <div class="pht-vue-pied">
        <p class="pht-vue-infos">
          <span>${p.prise_le ? echapper(momentLong(p.prise_le)) : 'Date inconnue'}</span>
          <span class="discret">${[format ? formats[format] : null, p.largeur ? `${p.largeur} × ${p.hauteur}` : null, echapper(p.nom)].filter(Boolean).join(' · ')}</span>
          ${vieDeLaPhoto(p)}
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

// LA VISIONNEUSE FAIT DÉFILER CE QU'ON REGARDAIT : un match, ou les résultats
// d'une recherche — figés à l'ouverture, pour qu'une photo dont on retire
// l'étiquette cherchée ne disparaisse pas sous les doigts.
const listeDeLaVue = () => etat.listeVue.map(photo).filter(Boolean);

function ouvrir(id) {
  if (!etat.listeVue.includes(id)) etat.listeVue = photosAffichees().map((p) => p.id);
  etat.ouverte = id;
  etat.confirmerRetrait = false;
  etat.ajout = null;
  etat.recherche = '';
  etat.gestion = null;
  etat.supprimerEtiq = null;
  dessinerVisionneuse();
  prechargerAutour();
}

function fermer() {
  etat.ouverte = null;
  etat.listeVue = [];
  // Ce qu'on a retouché dans la visionneuse peut changer les résultats.
  if (vueCourante === 'recherche') dessiner();
  etat.confirmerRetrait = false;
  dessinerVisionneuse();
}

function voisine(pas) {
  const p = photo(etat.ouverte);
  if (!p) return;
  const liste = listeDeLaVue();
  const suivante = liste[liste.indexOf(p) + pas];
  if (suivante) ouvrir(suivante.id);
}

// LA PHOTO OUVERTE SE GARDE EN MÉMOIRE, et ses deux voisines avec : télécharger
// sur l'iPhone ouvre la feuille de partage, qui ne s'ouvre que dans la foulée
// d'un geste — un fichier qu'il faudrait encore aller chercher la ferait rater.
function prechargerAutour() {
  const p = photo(etat.ouverte);
  if (!p) return;
  const liste = listeDeLaVue();
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
  const liste = listeDeLaVue();
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
  brancherTri(racine);
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
    // Le balayage vit sur la PHOTO : dans le panneau de tri, un doigt qui
    // glisse fait défiler les étiquettes, il ne change pas de photo.
    if (e.pointerType !== 'touch' || !e.target.closest('.pht-vue-scene')) return;
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
    // On écrit une étiquette ou un nom : les touches sont à lui.
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName ?? '')) return;
    // LES CHIFFRES NOTENT (1 à 5, 0 efface) : on trie un match au clavier sans
    // lâcher les flèches — c'est le geste de Lightroom.
    if (/^[0-5]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const k = Number(e.key);
      const p = photo(etat.ouverte);
      if (k === 0) { if (p?.note) noter('vue', p.note); }
      else noter('vue', k);
      return;
    }
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
  hote.innerHTML = vueCourante === 'match' ? gabaritMatch()
    : vueCourante === 'recherche' ? gabaritRecherche() : gabaritListe();
  majLigneDEtat();
  if (!etat.photos) return;
  const montrees = vueCourante !== 'liste'
    ? photosAffichees()
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
      else if (quoi === 'selectionner') { etat.modeSelection = true; dessiner(); }
      else if (quoi === 'fin-selection') quitterLaSelection();
      else if (quoi === 'tout') {
        etat.selection = toutEstChoisi() ? new Set() : new Set(photosAffichees().map((p) => p.id));
        etat.confirmerRetraitSel = false;
        redessinerTri();
      } else if (quoi === 'trier-sel') { etat.fenetreTri = true; etat.ajout = null; etat.recherche = ''; dessinerFenetreTri(); }
      else if (quoi === 'retirer-sel') { etat.confirmerRetraitSel = true; majBarreSelection(); }
      else if (quoi === 'garder-sel') { etat.confirmerRetraitSel = false; majBarreSelection(); }
      else if (quoi === 'retirer-sel-oui') retirerLaSelection(action);
      else if (quoi === 'garder-pour') garderLeChoix(action);
      else if (quoi === 'annuler-pour') { etat.pourCharge = null; revenir(); }
      else if (quoi === 'effacer-filtres') {
        e.preventDefault();
        changerFiltres(() => { etat.filtres = nouveauxFiltres(); });
      }
      return;
    }
    const filtre = e.target.closest('[data-filtre]');
    if (filtre) {
      const { filtre: famille, valeur } = filtre.dataset;
      changerFiltres(() => {
        const ens = etat.filtres[famille];
        if (ens.has(valeur)) ens.delete(valeur); else ens.add(valeur);
      });
      return;
    }
    if (e.target.closest('[data-filtre-jamais]')) {
      changerFiltres(() => { etat.filtres.jamais = !etat.filtres.jamais; });
      return;
    }
    const note = e.target.closest('[data-filtre-note]');
    if (note) {
      const k = Number(note.dataset.filtreNote);
      changerFiltres(() => { etat.filtres.note = etat.filtres.note === k ? 0 : k; });
      return;
    }
    const ordre = e.target.closest('[data-ordre]');
    if (ordre) {
      changerFiltres(() => { etat.ordre = ordre.dataset.ordre; });
      return;
    }
    const t = e.target.closest('[data-ouvrir]');
    if (!t) return;
    // Cmd, Ctrl ou Maj + clic sélectionnent d'emblée : le geste du Finder.
    if (!etat.modeSelection && (e.metaKey || e.ctrlKey || e.shiftKey)) {
      etat.modeSelection = true;
      etat.selection.add(t.dataset.ouvrir);
      etat.derniereTouchee = t.dataset.ouvrir;
      dessiner();
      return;
    }
    if (etat.modeSelection) toucherEnSelection(t.dataset.ouvrir, e.shiftKey);
    else ouvrir(t.dataset.ouvrir);
  });

  racine.addEventListener('change', (e) => {
    if (e.target.matches('[data-pht-competition]')) {
      poserCompetition(e.target);
      return;
    }
    if (e.target.matches('[data-pht-parution]')) {
      ajouterAUneParution(e.target);
      return;
    }
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

  racine.addEventListener('keydown', (e) => {
    if (e.target.matches?.('[data-pht-competition]') && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
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
    const pour = id?.startsWith(PREFIXE_POUR) ? id.slice(PREFIXE_POUR.length) : null;
    vueCourante = id === RECHERCHE || pour ? 'recherche' : id ? 'match' : 'liste';
    if (cible !== id) {
      etat.modeSelection = false;
      etat.selection = new Set();
      etat.fenetreTri = false;
      etat.pourCharge = null;
      dessinerFenetreTri();
    }
    // CHOISIR POUR UNE PARUTION : la recherche, en sélection, avec ce qui est
    // déjà choisi — on part de là.
    etat.pour = pour;
    if (pour) { etat.modeSelection = true; chargerLeChoix(); }
    cible = id;
    if (id) { etat.choisirMatch = false; chargerLesSorties(); }
    if (id === RECHERCHE || pour) cible = id;
    dessiner();
    const enCours = (etat.photos ?? []).some(enRoute);
    if (!etat.photos || (!enCours && Date.now() - etat.chargeLe > RELIRE_APRES_MS)) charger();
  },
};
