// Le carrousel d'après-match — `#yuno/carrousel` (19 novembre 2026, demande de
// Noé, à partir du « Kit Yuno » : l'outil « Mon carrousel » du site de livraison
// des joueurs, adapté à son usage).
//
// CE QU'IL FAIT : on importe les photos et vidéos d'un match, on compose un post
// de vingt au plus, on le voit comme sur Instagram, et on télécharge les
// fichiers numérotés dans l'ordre.
//
// IL EST GARDÉ D'UN APPAREIL À L'AUTRE depuis le 20 novembre 2026 (Noé : « pour
// pouvoir faire la sélection sur ordi et télécharger sur téléphone »). D'où deux
// réserves, et chacune garde ce qu'elle sait garder :
//   — les FICHIERS partent chez Cloudflare R2 dès l'import (js/photos-cloud.js) ;
//   — le CARROUSEL — son nom, ses médias, l'ordre du post — vit dans Supabase
//     (tables `carrousels` et `carrousels_medias`).
// L'import ne fait PAS attendre l'envoi : on compose pendant que les photos
// partent, et l'ordre s'enregistre à chaque geste.
//
// DEUX ÉCRANS : `#yuno/carrousel` liste les carrousels et en crée un ;
// `#yuno/carrousel/<id>` est l'outil.
//
// IL N'EST PAS RELIÉ À UN MATCH, et c'est voulu (Noé : « l'outil doit être
// disponible au cas où j'ai besoin pour une autre utilisation »). La table porte
// déjà la colonne ; l'écran pour la poser viendra comme une option.
//
// COMMENT IL VIT DANS LE SITE : comme les écrans du cap, il se monte dans un
// hôte que le site réécrit à chaque rendu. Son état vit donc ICI, au niveau du
// module — les fichiers en cours d'envoi survivent à tous les redessins — et
// chaque montage ne fait que redessiner depuis cet état.

import * as api from './api.js';
import { echapper } from './format.js';
import { bulle, messageCourt } from './bulle.js';
import { construireZip, enregistrer } from './zip.js';
import { envoyerFichier, envoyerVignette, adressesDe, supprimerFichier } from './photos-cloud.js';

// Instagram ne prend pas plus de vingt photos et vidéos dans un carrousel.
const MAX = 20;
const COMPTE = 'yuno_rph';
// Une adresse signée vaut six heures (cloudflare/photos) : on la renouvelle
// avant, pour ne jamais tendre une image morte.
const ADRESSES_VALABLES_MS = 5 * 3600 * 1000;
// Revenir sur l'outil relit la base, mais pas à chaque redessin du site :
// assez souvent pour retrouver sur le téléphone ce qu'on vient de faire sur
// l'ordinateur, pas assez pour qu'un geste en cours soit écrasé.
const RELIRE_APRES_MS = 15 * 1000;

// --- L'état, qui survit aux redessins ---------------------------------------------

const etat = {
  liste: null,           // les carrousels, pour l'écran de liste
  carrousel: null,       // { id, nom, evenement_id } — celui qu'on compose
  chargeLe: 0,
  adressesLe: 0,
  // Chaque média : { id, nom, genre, type, taille, cle, fichier, url, vignette,
  //   envoi: 'attente'|'envoi'|'fait'|'echec', progression }
  medias: [],
  selection: [],
  arme: -1,
  passe: [],
  futur: [],
  enCours: null,         // le téléchargement en cours
  prets: null,           // les fichiers préparés pour la feuille de partage
  confirmerSuppression: false,
  // Les sorties de Yuno qu'on peut relier, lues une fois par visite.
  sorties: null,
};

let hote = null;
let vueCourante = null;
let idDemande = null;

const media = (id) => etat.medias.find((m) => m.id === id);
const ordreNaturel = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
const trierParNom = (liste) => liste.sort((a, b) => ordreNaturel.compare(a.nom, b.nom));

// --- Les icônes, dessinées comme dans le kit ----------------------------------------

const ICONE = {
  zero: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  annuler: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  retablir: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  telecharger: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  ajouter: '<path d="M12 5v14M5 12h14"/>',
  importer: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>',
  retour: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  match: '<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/>',
  nuage: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9a4 4 0 0 1-.5 7.97"/><path d="M12 12v8M9 15l3-3 3 3"/>',
};
const svg = (cle, taille = 18) =>
  `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONE[cle]}</svg>`;
const LECTURE = `<span class="car-play" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 24 24"
  fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></span>`;
const CROIX = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

// --- Le chargement depuis la base et le stockage --------------------------------------

async function chargerLaListe() {
  try {
    const carrousels = await api.lireCarrousels();
    etat.liste = carrousels;
  } catch (e) {
    console.error('Lecture des carrousels impossible', e);
    etat.liste = etat.liste ?? [];
    bulle("Ce n'est pas passé", "Les carrousels n'ont pas pu être chargés.");
  }
  dessiner();
}

async function chargerLeCarrousel(id) {
  try {
    const c = await api.lireCarrousel(id);
    const memeCarrousel = etat.carrousel?.id === c.id;
    etat.carrousel = { id: c.id, nom: c.nom, evenement_id: c.evenement_id, evenement: c.evenement };

    // Les médias encore EN ROUTE sur cet appareil ne sont pas en base : on les
    // garde, la base ne les connaît pas encore.
    const locaux = memeCarrousel ? etat.medias.filter((m) => m.envoi !== 'fait') : [];
    const anciens = new Map(memeCarrousel ? etat.medias.map((m) => [m.id, m]) : []);
    const distants = c.medias.map((ligne) => {
      const deja = anciens.get(ligne.id);
      return {
        id: ligne.id,
        nom: ligne.nom,
        genre: ligne.genre,
        type: ligne.type,
        taille: ligne.taille,
        cle: ligne.cle,
        // Un fichier importé SUR CET APPAREIL reste sous la main : le
        // télécharger ne demandera rien au réseau.
        fichier: deja?.fichier ?? null,
        url: deja?.fichier ? deja.url : null,
        vignette: deja?.vignette ?? null,
        envoi: 'fait',
        progression: 1,
      };
    });
    etat.medias = trierParNom([...distants, ...locaux.filter((m) => !distants.some((d) => d.id === m.id))]);

    // L'ORDRE DE LA BASE FAIT FOI, sauf pour ce qui n'y est pas encore : une
    // photo choisie ici pendant son envoi garde sa place.
    const connus = new Set(etat.medias.map((m) => m.id));
    const selectionBase = (c.selection ?? []).filter((x) => connus.has(x));
    const enRoute = memeCarrousel ? etat.selection.filter((x) => locaux.some((m) => m.id === x)) : [];
    if (!memeCarrousel || !aSauver) {
      etat.selection = [...selectionBase, ...enRoute.filter((x) => !selectionBase.includes(x))].slice(0, MAX);
    }
    if (!memeCarrousel) {
      etat.passe = [];
      etat.futur = [];
      etat.arme = -1;
      etat.prets = null;
      etat.confirmerSuppression = false;
    }
    etat.chargeLe = Date.now();
    await signer();
  } catch (e) {
    console.error('Lecture du carrousel impossible', e);
    if (!etat.carrousel) {
      bulle("Ce n'est pas passé", "Ce carrousel n'a pas pu être chargé.");
    }
  }
  dessiner();
}

// Les adresses de lecture de tout ce qui est en ligne et n'a pas son fichier ici.
async function signer() {
  const aSigner = etat.medias.filter((m) => m.cle && (!m.fichier || !m.vignette));
  if (!aSigner.length) { etat.adressesLe = Date.now(); return; }
  const adresses = await adressesDe(aSigner.map((m) => m.cle));
  for (const m of aSigner) {
    const a = adresses[m.cle];
    if (!a) continue;
    if (!m.fichier) m.url = a.original;
    if (!m.vignette || m.vignette.startsWith('https:')) {
      m.vignette = a.vignette;
      m.vignetteDistante = true;
    }
  }
  etat.adressesLe = Date.now();
}

// --- L'enregistrement de l'ordre --------------------------------------------------------
//
// Chaque geste enregistre — un échange, un ✕, un ajout. Regroupés sur une
// demi-seconde : dix photos touchées d'affilée font une écriture, pas dix.
let minuteurSauver = null;
let aSauver = false;

function sauverPlusTard() {
  if (!etat.carrousel) return;
  aSauver = true;
  clearTimeout(minuteurSauver);
  minuteurSauver = setTimeout(sauver, 500);
}

async function sauver() {
  if (!etat.carrousel || !aSauver) return;
  aSauver = false;
  try {
    await api.modifierCarrousel(etat.carrousel.id, { selection: etat.selection });
    etat.chargeLe = Date.now();
  } catch (e) {
    console.error('Ordre du carrousel non enregistré', e);
    aSauver = true;
    bulle("Ce n'est pas enregistré", "L'ordre du carrousel n'a pas pu être gardé. Il le sera au prochain geste.");
  }
}

// --- L'import et l'envoi -----------------------------------------------------------------

const EXTENSIONS_VIDEO = /\.(mp4|mov|m4v|webm)$/i;
const EXTENSIONS_PHOTO = /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i;

function genreDe(fichier) {
  if (fichier.type.startsWith('video/') || EXTENSIONS_VIDEO.test(fichier.name)) return 'video';
  if (fichier.type.startsWith('image/') || EXTENSIONS_PHOTO.test(fichier.name)) return 'photo';
  return null;
}

// LES PHOTOS SE RANGENT PAR NOM, en ordre naturel (DSC_9 avant DSC_10) : c'est
// l'ordre de prise de vue d'un boîtier, donc l'ordre du match. La date du
// fichier ne le dit pas — un export Lightroom les date toutes de la même minute.
function importer(fichiers) {
  if (!etat.carrousel) return;
  const deja = new Set(etat.medias.map((m) => m.nom + '|' + m.taille));
  const nouveaux = [];
  for (const fichier of fichiers) {
    const genre = genreDe(fichier);
    if (!genre) continue;
    // Un même fichier déposé deux fois n'entre qu'une fois.
    if (deja.has(fichier.name + '|' + fichier.size)) continue;
    deja.add(fichier.name + '|' + fichier.size);
    const m = {
      // L'identifiant naît ICI, pas en base : la photo entre dans la sélection
      // avant d'avoir fini de partir, et il ne doit pas changer en route.
      id: crypto.randomUUID(),
      nom: fichier.name,
      genre,
      type: fichier.type,
      taille: fichier.size,
      cle: null,
      fichier,
      url: URL.createObjectURL(fichier),
      vignette: null,
      envoi: 'attente',
      progression: 0,
    };
    m.vignettePrete = new Promise((ok) => { m.vignetteFaite = ok; });
    nouveaux.push(m);
  }
  if (!nouveaux.length) {
    bulle('Rien à ajouter', 'Ces fichiers ne sont ni des photos ni des vidéos, ou ils sont déjà là.');
    return;
  }
  etat.medias = trierParNom([...etat.medias, ...nouveaux]);
  dessiner();
  for (const m of nouveaux) {
    fileDesVignettes.push(m);
    fileDesEnvois.push(m);
  }
  pomperLesVignettes();
  pomperLesEnvois();
}

// Deux envois à la fois : assez pour remplir une connexion de stade, pas assez
// pour que chaque photo traîne derrière les autres.
const fileDesEnvois = [];
let envoisEnCours = 0;

function pomperLesEnvois() {
  while (envoisEnCours < 2 && fileDesEnvois.length) {
    const m = fileDesEnvois.shift();
    envoisEnCours++;
    envoyer(m).finally(() => {
      envoisEnCours--;
      pomperLesEnvois();
    });
  }
}

async function envoyer(m) {
  const carrouselId = etat.carrousel?.id;
  m.envoi = 'envoi';
  majEnvoi(m);
  try {
    m.cle = await envoyerFichier(m.fichier, (envoyes, total) => {
      m.progression = envoyes / Math.max(1, total);
      majEnvoi(m);
    });
    const blob = await m.vignettePrete;
    if (blob) await envoyerVignette(m.cle, blob).catch((e) => console.error('Vignette non envoyée', e));
    await api.ajouterMediaDeCarrousel({
      id: m.id,
      carrousel_id: carrouselId,
      cle: m.cle,
      nom: m.nom,
      genre: m.genre,
      type: m.type || null,
      taille: m.taille,
    });
    m.envoi = 'fait';
    m.progression = 1;
    // L'ordre peut déjà contenir cette photo : il se renvoie pour que
    // l'autre appareil la trouve à sa place.
    if (etat.selection.includes(m.id)) sauverPlusTard();
  } catch (e) {
    console.error('Envoi impossible', m.nom, e);
    m.envoi = 'echec';
  }
  majEnvoi(m);
}

function relancerLesEchecs() {
  const echecs = etat.medias.filter((m) => m.envoi === 'echec' && m.fichier);
  for (const m of echecs) {
    m.envoi = 'attente';
    m.progression = 0;
    fileDesEnvois.push(m);
  }
  pomperLesEnvois();
  dessiner();
}

// L'état de l'envoi se pose sur les tuiles et dans la ligne d'état, sans
// redessiner l'écran — sinon chaque morceau de 8 Mo ferait sauter la grille.
function majEnvoi(m) {
  hote?.querySelectorAll(`[data-envoi-de="${m.id}"]`).forEach((el) => {
    el.dataset.envoi = m.envoi;
    el.style.setProperty('--avance', String(m.progression ?? 0));
  });
  majLigneDEtat();
}

function majLigneDEtat() {
  const ligne = hote?.querySelector('[data-car-etat]');
  if (!ligne) return;
  const total = etat.medias.length;
  // Rien d'importé : la ligne se tait, « 0 fichier en ligne » ne dirait rien.
  if (!total) { ligne.innerHTML = ''; return; }
  const faits = etat.medias.filter((m) => m.envoi === 'fait').length;
  const echecs = etat.medias.filter((m) => m.envoi === 'echec').length;
  const enCours = etat.medias.filter((m) => m.envoi === 'envoi' || m.envoi === 'attente');
  if (echecs) {
    ligne.innerHTML = `${echecs} ${echecs > 1 ? 'envois ont' : 'envoi a'} échoué
      <button type="button" class="car-puce car-puce-mini" data-car="relancer">Réessayer</button>`;
  } else if (enCours.length) {
    const octets = enCours.reduce((s, m) => s + m.taille, 0);
    const envoyes = enCours.reduce((s, m) => s + m.taille * (m.progression ?? 0), 0);
    ligne.innerHTML = `${svg('nuage', 14)}<span>En ligne : ${faits} / ${total} ·
      ${Math.floor((envoyes / Math.max(1, octets)) * 100)} % de la suite</span>`;
  } else {
    ligne.innerHTML = `${svg('nuage', 14)}<span>${total} ${total > 1 ? 'fichiers' : 'fichier'} en ligne — retrouve-les sur tes autres appareils</span>`;
  }
}

// Un DOSSIER déposé se parcourt en entier, sous-dossiers compris : c'est ce
// qu'on fait en sortant d'un match — on prend le dossier de l'export.
async function fichiersDuDepot(transfert) {
  const entrees = [...(transfert.items ?? [])]
    .map((item) => item.webkitGetAsEntry?.())
    .filter(Boolean);
  if (!entrees.length) return [...(transfert.files ?? [])];

  const sortie = [];
  const parcourir = async (entree) => {
    if (entree.isFile) {
      sortie.push(await new Promise((ok, ko) => entree.file(ok, ko)));
    } else if (entree.isDirectory) {
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

// --- Les vignettes : légères, faites sur l'appareil qui importe ----------------------
//
// VIGNETTE D'ABORD, PLEINE QUALITÉ ENSUITE (règle du kit). On en tire une de
// 480 px, trois à la fois ; elle part chez Cloudflare avec l'original, et les
// autres appareils n'ont plus que celle-là à charger pour remplir la grille.

const fileDesVignettes = [];
let vignettesEnCours = 0;

function pomperLesVignettes() {
  while (vignettesEnCours < 3 && fileDesVignettes.length) {
    const m = fileDesVignettes.shift();
    vignettesEnCours++;
    (m.genre === 'video' ? vignetteDeVideo(m.url) : vignetteDePhoto(m.url))
      .catch(() => null)
      .then((blob) => {
        m.vignetteFaite?.(blob);
        if (!blob) return;
        m.vignette = URL.createObjectURL(blob);
        poserLaVignette(m);
      })
      .finally(() => {
        vignettesEnCours--;
        pomperLesVignettes();
      });
  }
}

function poserLaVignette(m) {
  hote?.querySelectorAll(`img[data-vignette="${m.id}"]`).forEach((img) => {
    img.src = m.vignette;
  });
}

const COTE_VIGNETTE = 480;

function reduire(source, largeur, hauteur) {
  const echelle = Math.min(1, COTE_VIGNETTE / Math.max(largeur, hauteur));
  const toile = document.createElement('canvas');
  toile.width = Math.max(1, Math.round(largeur * echelle));
  toile.height = Math.max(1, Math.round(hauteur * echelle));
  toile.getContext('2d').drawImage(source, 0, 0, toile.width, toile.height);
  return toile;
}

const enJpeg = (toile) => new Promise((ok) => toile.toBlob(ok, 'image/jpeg', 0.82));

async function vignetteDePhoto(url) {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  return enJpeg(reduire(img, img.naturalWidth, img.naturalHeight));
}

// LA VIGNETTE D'UNE VIDÉO EST PRISE AU MILIEU (règle du kit) ; si l'image est
// noire — un fondu, un plan de transition —, on essaie à 35 %, 65 %, 20 % puis 80 %.
async function vignetteDeVideo(url) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;
  await new Promise((ok, ko) => {
    video.onloadedmetadata = ok;
    video.onerror = ko;
  });
  let derniere = null;
  for (const part of [0.5, 0.35, 0.65, 0.2, 0.8]) {
    await new Promise((ok) => {
      video.onseeked = ok;
      video.currentTime = Math.max(0, (video.duration || 0) * part);
      setTimeout(ok, 3000);
    });
    const toile = reduire(video, video.videoWidth || 480, video.videoHeight || 640);
    derniere = toile;
    if (!estNoire(toile)) break;
  }
  video.removeAttribute('src');
  video.load();
  return derniere ? enJpeg(derniere) : null;
}

function estNoire(toile) {
  const petit = document.createElement('canvas');
  petit.width = 16;
  petit.height = 16;
  const ctx = petit.getContext('2d');
  ctx.drawImage(toile, 0, 0, 16, 16);
  const { data } = ctx.getImageData(0, 0, 16, 16);
  let somme = 0;
  for (let i = 0; i < data.length; i += 4) somme += data[i] + data[i + 1] + data[i + 2];
  return somme / (data.length / 4) / 3 < 14;
}

// --- Annuler / Rétablir ---------------------------------------------------------------

function changer(nouvelle) {
  if (nouvelle.join('|') === etat.selection.join('|')) return;
  etat.passe.push(etat.selection);
  if (etat.passe.length > 50) etat.passe.shift();
  etat.futur = [];
  etat.selection = nouvelle;
  etat.prets = null;
  sauverPlusTard();
}

function annuler() {
  if (!etat.passe.length) return;
  etat.futur.push(etat.selection);
  etat.selection = etat.passe.pop();
  etat.arme = -1;
  etat.prets = null;
  sauverPlusTard();
  dessiner();
}

function retablir() {
  if (!etat.futur.length) return;
  etat.passe.push(etat.selection);
  etat.selection = etat.futur.pop();
  etat.arme = -1;
  etat.prets = null;
  sauverPlusTard();
  dessiner();
}

// --- La première utilisation d'un bouton icône ---------------------------------------
//
// Règle du kit : la première fois qu'on touche un bouton qui n'a pas de mot, une
// bulle dit ce qu'il fait, et l'action n'a lieu qu'au toucher suivant.
function premiereFois(cle, bouton, titre, phrase) {
  try {
    if (localStorage.getItem(cle)) return false;
    localStorage.setItem(cle, '1');
  } catch {
    return false;
  }
  bulle(titre, phrase, bouton);
  return true;
}

// --- Le dessin ------------------------------------------------------------------------

function vignette(m, { charge = 'lazy' } = {}) {
  // Une vignette pas encore faite sur l'appareil qui importe, ou absente en
  // ligne : une photo montre son original en attendant, une vidéo le fond.
  const src = m.vignette ?? (m.genre === 'photo' && !m.fichier ? m.url : null);
  return `<span class="car-vignette">
      <img data-vignette="${m.id}" alt="" loading="${charge}" decoding="async"${src ? ` src="${src}"` : ''}
        onload="this.parentNode.classList.add('prete')">
    </span>${m.genre === 'video' ? LECTURE : ''}`;
}

// L'anneau d'envoi d'une tuile : il se remplit pendant que le fichier part, et
// disparaît quand il est en ligne. Un envoi raté le dit d'un point.
function anneauDEnvoi(m) {
  return `<span class="car-envoi" data-envoi-de="${m.id}" data-envoi="${m.envoi}"
    style="--avance:${m.progression ?? 0}" aria-hidden="true"></span>`;
}

function gabaritListe() {
  const liste = etat.liste;
  if (!liste) return '<p class="car-attente">Un instant…</p>';
  const tuiles = liste.map((c) => {
    const n = c.medias?.[0]?.count ?? 0;
    return `<a class="car-liste-tuile" href="#yuno/carrousel/${c.id}">
        <span class="car-liste-nom">${echapper(c.nom)}</span>
        ${c.evenement ? `<span class="car-liste-match">${svg('match', 13)}${echapper(c.evenement.titre)} · ${jourCourt(c.evenement.date_debut)}</span>` : ''}
        <span class="car-liste-compte">${n} ${n > 1 ? 'fichiers' : 'fichier'} · ${(c.selection ?? []).length} dans le post</span>
      </a>`;
  }).join('');
  return `
    <div class="car-liste-tete">
      <p class="car-liste-intro">Compose sur l'ordinateur, télécharge sur le téléphone : chaque carrousel
        et ses photos te suivent d'un appareil à l'autre.</p>
      <button type="button" class="car-bouton-or" data-car="nouveau">${svg('ajouter')}<span>Nouveau carrousel</span></button>
    </div>
    ${liste.length ? `<div class="car-liste">${tuiles}</div>`
      : '<p class="car-liste-vide">Tes carrousels s’afficheront ici.</p>'}`;
}

function gabaritTete() {
  const c = etat.carrousel;
  return `
    <div class="car-tete">
      <a class="car-retour" href="#yuno/carrousel" aria-label="Mes carrousels" title="Mes carrousels">${svg('retour', 20)}</a>
      <input class="car-nom" data-car-nom value="${echapper(c?.nom ?? '')}" aria-label="Nom du carrousel"
        maxlength="80" autocomplete="off" spellcheck="false">
    </div>
    ${gabaritMatch()}
    <p class="car-etat" data-car-etat></p>`;
}

// --- Le match relié (20 novembre 2026, demande de Noé) -----------------------------
//
// UNE PASTILLE, PAS UN FORMULAIRE : on relie un carrousel à une sortie de Yuno
// d'un geste, et on peut le défaire. Le menu est celui du SYSTÈME (un `<select>`
// posé, invisible, sur la pastille) : c'est lui qui s'ouvre au doigt sur
// l'iPhone, en roue, et il n'y a rien à dessiner de plus.
//
// LES SORTIES PROPOSÉES : celles de Yuno des quatre derniers mois et du mois qui
// vient, la plus récente en tête — un carrousel d'après-match se compose dans
// les jours qui suivent. Un match plus ancien déjà relié reste dans la liste.

const jourCourt = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

function gabaritMatch() {
  const c = etat.carrousel;
  const relie = c?.evenement;
  const sorties = [...(etat.sorties ?? [])];
  if (relie && !sorties.some((s) => s.id === relie.id)) sorties.unshift(relie);
  const options = sorties.map((s) =>
    `<option value="${s.id}"${s.id === c?.evenement_id ? ' selected' : ''}>${echapper(s.titre)} · ${jourCourt(s.date_debut)}</option>`,
  ).join('');
  return `
    <label class="car-match${relie ? ' relie' : ''}">
      ${svg('match', 15)}
      <span class="car-match-texte">${relie
        ? `${echapper(relie.titre)} · ${jourCourt(relie.date_debut)}`
        : 'Relier à un match'}</span>
      <select data-car-match aria-label="Match relié à ce carrousel">
        <option value=""${relie ? '' : ' selected'}>${relie ? 'Délier du match' : 'Aucun match'}</option>
        ${options}
      </select>
    </label>`;
}

async function chargerLesSorties() {
  if (etat.sorties) return;
  const jour = 24 * 3600 * 1000;
  const debut = new Date(Date.now() - 120 * jour).toISOString();
  const fin = new Date(Date.now() + 30 * jour).toISOString();
  try {
    const sorties = await api.evenementsEntre(debut, fin, { espace: 'photo' });
    etat.sorties = sorties
      .map((s) => ({ id: s.id, titre: s.titre, date_debut: s.date_debut }))
      .sort((a, b) => b.date_debut.localeCompare(a.date_debut));
    redessinerLeMatch();
  } catch (e) {
    console.error('Lecture des sorties impossible', e);
    etat.sorties = [];
  }
}

function redessinerLeMatch() {
  const ancien = hote?.querySelector('.car-match');
  if (ancien) ancien.replaceWith(document.createRange().createContextualFragment(gabaritMatch()));
}

// RELIER UN MATCH NOMME LE CARROUSEL, s'il porte encore son nom par défaut :
// « Carrousel du 20 novembre » ne dit rien, le nom du match dit tout. Un nom que
// Noé a écrit lui-même n'est jamais touché.
async function relier(id) {
  const c = etat.carrousel;
  if (!c) return;
  const sortie = id ? (etat.sorties ?? []).find((s) => s.id === id) ?? c.evenement : null;
  const avant = { evenement_id: c.evenement_id, evenement: c.evenement, nom: c.nom };
  const champs = { evenement_id: id || null };
  if (sortie && /^Carrousel du /.test(c.nom)) champs.nom = sortie.titre;

  c.evenement_id = champs.evenement_id;
  c.evenement = sortie ?? null;
  if (champs.nom) {
    c.nom = champs.nom;
    const nom = hote?.querySelector('[data-car-nom]');
    if (nom) nom.value = c.nom;
  }
  redessinerLeMatch();
  try {
    await api.modifierCarrousel(c.id, champs);
  } catch (e) {
    console.error('Match non relié', e);
    Object.assign(c, avant);
    const nom = hote?.querySelector('[data-car-nom]');
    if (nom) nom.value = c.nom;
    redessinerLeMatch();
    bulle("Ce n'est pas enregistré", "Le match n'a pas pu être relié.", hote?.querySelector('.car-match'));
  }
}

function gabaritVide() {
  return `
    ${gabaritTete()}
    <div class="car-import" data-depot>
      <p class="car-import-titre">Compose ton carrousel d'après-match</p>
      <p class="car-import-texte">Choisis les photos et vidéos du match — ou glisse ici le dossier
        entier. Elles partent en ligne pour te suivre sur ton téléphone.</p>
      <button type="button" class="car-bouton-or" data-car="choisir">
        ${svg('importer')}<span>Choisir des photos</span>
      </button>
    </div>
    ${gabaritPied()}
    <input type="file" class="car-fichier" accept="image/*,video/*" multiple hidden data-car-fichier>`;
}

function gabaritPied() {
  return `
    <div class="car-pied">
      ${etat.confirmerSuppression
        ? `<span class="car-pied-question">Supprimer ce carrousel et ses ${etat.medias.length} fichiers en ligne ?
             C'est définitif.</span>
           <button type="button" class="car-puce" data-car="garder">Garder</button>
           <button type="button" class="car-danger" data-car="supprimer-oui">Supprimer</button>`
        : `<button type="button" class="car-puce" data-car="supprimer">Supprimer ce carrousel</button>`}
    </div>`;
}

function gabaritOutil() {
  return `
    ${gabaritTete()}
    <div class="car-layout">
      <div class="car-cote">
        <div class="igpost">
          <div class="ig-tete"><span class="ig-avatar" aria-hidden="true">Y</span><b>${COMPTE}</b></div>
          <div class="ig-cadre">
            <div class="ig-piste" data-car-piste></div>
            <span class="ig-compte" data-car-compte hidden></span>
            <p class="ig-vide" data-car-vide>Touche des photos ci-dessous pour composer ton carrousel.</p>
          </div>
          <div class="ig-points" data-car-points aria-hidden="true"></div>
        </div>
      </div>
      <div class="car-droite">
        <div class="car-actions">
          <button type="button" class="car-icone" data-car="zero"
            aria-label="Partir de zéro" title="Partir de zéro">${svg('zero')}</button>
          <button type="button" class="car-bouton-or" data-car="telecharger">
            ${svg('telecharger')}<span data-car-libelle></span>
          </button>
          <span class="car-historique">
            <button type="button" class="car-fleche" data-car="annuler"
              aria-label="Annuler la dernière action" title="Annuler">${svg('annuler')}</button>
            <button type="button" class="car-fleche" data-car="retablir"
              aria-label="Rétablir" title="Rétablir">${svg('retablir')}</button>
          </span>
        </div>
        <div class="car-sel-boite" data-car-sel-boite>
          <p class="car-petit-titre">Ma sélection · <span data-car-sel-n></span></p>
          <p class="car-consigne" data-car-consigne></p>
          <div class="car-sel" data-car-sel></div>
        </div>
      </div>
    </div>
    <div class="car-tout" data-depot>
      <div class="car-tout-tete">
        <p class="car-petit-titre"><span data-car-tout-titre></span> · <span data-car-n></span></p>
        <button type="button" class="car-puce" data-car="choisir">${svg('ajouter', 14)}<span>Ajouter des photos</span></button>
      </div>
      <div class="car-grille" data-car-grille></div>
    </div>
    ${gabaritPied()}
    <input type="file" class="car-fichier" accept="image/*,video/*" multiple hidden data-car-fichier>`;
}

function dessiner(focus = -1) {
  if (!hote?.isConnected) return;

  if (vueCourante === 'liste') {
    hote.dataset.carEcran = 'liste';
    hote.innerHTML = gabaritListe();
    return;
  }
  if (!etat.carrousel || etat.carrousel.id !== idDemande) {
    hote.dataset.carEcran = 'attente';
    hote.innerHTML = '<p class="car-attente">Un instant…</p>';
    return;
  }

  const ecran = etat.medias.length ? 'outil' : 'vide';
  // La charpente ne se réécrit que si l'écran change de nature : sinon on garde
  // la piste, la sélection, leur défilement — et le champ du nom, où l'on
  // écrit peut-être.
  if (hote.dataset.carEcran !== ecran) {
    hote.dataset.carEcran = ecran;
    hote.innerHTML = ecran === 'outil' ? gabaritOutil() : gabaritVide();
    if (ecran === 'outil') {
      rendreTriable(hote.querySelector('[data-car-sel]'), '.car-sel-item');
      rendreTriable(hote.querySelector('[data-car-grille]'), '.car-tuile.choisie');
    }
  } else {
    // Le match peut avoir été relié sur un autre appareil : sa pastille suit
    // la base à chaque relecture.
    redessinerLeMatch();
    hote.querySelector('.car-pied')?.replaceWith(
      document.createRange().createContextualFragment(gabaritPied()),
    );
  }
  majLigneDEtat();
  if (ecran === 'vide') return;

  dessinerApercu(focus);
  dessinerActions();
  dessinerSelection();
  dessinerGrille();
}

function dessinerApercu(focus) {
  const piste = hote.querySelector('[data-car-piste]');
  const points = hote.querySelector('[data-car-points]');
  const position = focus >= 0 ? focus : Math.round(piste.scrollLeft / Math.max(1, piste.clientWidth));

  piste.innerHTML = etat.selection.map((id) => {
    const m = media(id);
    if (!m?.url) return `<span class="ig-attente"></span>`;
    return m.genre === 'video'
      ? `<video src="${m.url}" muted loop playsinline preload="metadata"${m.vignette ? ` poster="${m.vignette}"` : ''}></video>`
      : `<img src="${m.url}" alt="" decoding="async">`;
  }).join('');
  points.innerHTML = etat.selection.map(() => '<span></span>').join('');
  hote.querySelector('[data-car-vide]').hidden = etat.selection.length > 0;

  piste.scrollLeft = Math.min(position, etat.selection.length - 1) * piste.clientWidth;
  pointActif();
}

// Le compteur « 3/12 », le point bleu, et SEULE LA VIDÉO AFFICHÉE JOUE, sans le son.
function pointActif() {
  const piste = hote?.querySelector('[data-car-piste]');
  if (!piste) return;
  const n = etat.selection.length;
  const i = n ? Math.min(n - 1, Math.round(piste.scrollLeft / Math.max(1, piste.clientWidth))) : 0;
  [...piste.children].forEach((el, k) => {
    if (el.tagName !== 'VIDEO') return;
    if (k === i) el.play?.().catch(() => {});
    else if (!el.paused) el.pause();
  });
  const compte = hote.querySelector('[data-car-compte]');
  compte.hidden = n < 2;
  compte.textContent = `${i + 1}/${n}`;
  [...hote.querySelector('[data-car-points]').children].forEach((p, k) => p.classList.toggle('actif', k === i));
}

function libelleDuBouton() {
  const n = etat.selection.length;
  if (etat.prets) return `Enregistrer mon carrousel (${etat.prets.length})`;
  return n ? `Télécharger (${n})` : 'Télécharger';
}

function dessinerActions() {
  const n = etat.selection.length;
  hote.querySelector('[data-car="telecharger"]').disabled = !n || !!etat.enCours;
  if (!etat.enCours) hote.querySelector('[data-car-libelle]').textContent = libelleDuBouton();
  hote.querySelector('[data-car="zero"]').disabled = !n;
  hote.querySelector('[data-car="annuler"]').disabled = !etat.passe.length;
  hote.querySelector('[data-car="retablir"]').disabled = !etat.futur.length;
}

function dessinerSelection() {
  const boite = hote.querySelector('[data-car-sel-boite]');
  const sel = hote.querySelector('[data-car-sel]');
  const defilement = sel.scrollLeft;
  const defilementV = sel.scrollTop;
  if (etat.arme >= etat.selection.length) etat.arme = -1;

  boite.hidden = !etat.selection.length;
  hote.querySelector('[data-car-sel-n]').textContent = `${etat.selection.length} / ${MAX}`;
  hote.querySelector('[data-car-consigne]').textContent = etat.arme >= 0
    ? `Touche maintenant la photo avec laquelle échanger la n°${etat.arme + 1}.`
    : "Pour changer l'ordre, touche une photo puis celle avec laquelle l'échanger.";
  hote.querySelector('[data-car-consigne]').classList.toggle('active', etat.arme >= 0);
  sel.classList.toggle('montre-n', etat.arme >= 0);

  sel.innerHTML = etat.selection.map((id, k) => {
    const m = media(id);
    return `<button type="button" class="car-sel-item${k === etat.arme ? ' arme' : ''}" data-k="${k}"
        aria-pressed="${k === etat.arme}" aria-label="Photo n°${k + 1} du carrousel">
        ${vignette(m, { charge: 'eager' })}<span class="car-n">${k + 1}</span>
        <span class="car-x" role="button" tabindex="0" data-retirer="${k}"
          aria-label="Retirer la photo n°${k + 1} du carrousel">${CROIX}</span>
      </button>`;
  }).join('');
  sel.scrollLeft = defilement;
  sel.scrollTop = defilementV;
}

function dessinerGrille() {
  const grille = hote.querySelector('[data-car-grille]');
  grille.classList.toggle('arme', etat.arme >= 0);
  hote.querySelector('[data-car-tout-titre]').textContent = etat.arme >= 0
    ? `Touche la photo qui prendra la place n°${etat.arme + 1}`
    : 'Touche une photo pour l’ajouter ou la retirer';
  hote.querySelector('[data-car-n]').textContent = `${etat.selection.length} / ${MAX}`;

  // LES PHOTOS CHOISIES REMONTENT EN TÊTE, dans l'ordre du carrousel, puis les
  // autres dans l'ordre du match.
  const choisies = etat.selection.map(media);
  const autres = etat.medias.filter((m) => !etat.selection.includes(m.id));
  grille.innerHTML = [...choisies, ...autres].map((m) => {
    const k = etat.selection.indexOf(m.id);
    return `<button type="button" class="car-tuile${k >= 0 ? ' choisie' : ''}" data-id="${m.id}"
        ${k >= 0 ? `data-k="${k}"` : ''} aria-pressed="${k >= 0}"
        aria-label="${echapper(m.nom)}${k >= 0 ? `, n°${k + 1} du carrousel` : ''}" title="${echapper(m.nom)}">
        ${vignette(m)}<span class="car-n">${k >= 0 ? k + 1 : ''}</span>${anneauDEnvoi(m)}
      </button>`;
  }).join('');
}

// --- Les gestes ---------------------------------------------------------------------------

function toucherSelection(k) {
  if (etat.arme < 0) etat.arme = k;
  else if (etat.arme === k) etat.arme = -1;
  else {
    const nouvelle = [...etat.selection];
    [nouvelle[etat.arme], nouvelle[k]] = [nouvelle[k], nouvelle[etat.arme]];
    etat.arme = -1;
    changer(nouvelle);
  }
  dessiner(k);
}

function retirer(k) {
  const nouvelle = [...etat.selection];
  nouvelle.splice(k, 1);
  etat.arme = -1;
  changer(nouvelle);
  dessiner();
}

function toucherTuile(id, bouton) {
  const nouvelle = [...etat.selection];
  const deja = nouvelle.indexOf(id);
  let focus = -1;

  if (etat.arme >= 0) {
    // La place armée prend cette photo ; si elle était déjà dans le carrousel,
    // les deux échangent leur place.
    focus = etat.arme;
    if (deja >= 0) nouvelle[deja] = nouvelle[etat.arme];
    nouvelle[etat.arme] = id;
    etat.arme = -1;
    messageCourt(`Place n°${focus + 1} mise à jour`);
  } else if (deja >= 0) {
    nouvelle.splice(deja, 1);
  } else if (nouvelle.length >= MAX) {
    bulle('Vingt au plus', 'Instagram limite un carrousel à 20 photos et vidéos.', bouton);
    return;
  } else {
    nouvelle.push(id);
    focus = nouvelle.length - 1;
  }
  changer(nouvelle);
  dessiner(focus);
}

function partirDeZero(bouton) {
  if (premiereFois('yuno-tip-car-zero', bouton, 'Partir de zéro',
    'Retire toutes les photos du carrousel pour le composer toi-même. Touche à nouveau pour confirmer.')) return;
  etat.arme = -1;
  changer([]);
  dessiner();
}

async function nouveauCarrousel(bouton) {
  const jour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  bouton.disabled = true;
  try {
    const c = await api.creerCarrousel({ nom: `Carrousel du ${jour}` });
    location.hash = `#yuno/carrousel/${c.id}`;
  } catch (e) {
    console.error('Création du carrousel impossible', e);
    bouton.disabled = false;
    bulle("Ce n'est pas passé", "Le carrousel n'a pas pu être créé.", bouton);
  }
}

async function renommer(champ) {
  const nom = champ.value.trim();
  if (!etat.carrousel || !nom || nom === etat.carrousel.nom) {
    if (!nom && etat.carrousel) champ.value = etat.carrousel.nom;
    return;
  }
  const avant = etat.carrousel.nom;
  etat.carrousel.nom = nom;
  try {
    await api.modifierCarrousel(etat.carrousel.id, { nom });
  } catch (e) {
    console.error('Nom non enregistré', e);
    etat.carrousel.nom = avant;
    champ.value = avant;
    bulle("Ce n'est pas enregistré", "Le nouveau nom n'a pas pu être gardé.", champ);
  }
}

// SUPPRIMER EMPORTE LES FICHIERS EN LIGNE, et c'est dit avant : c'est ce qui
// libère la place chez Cloudflare une fois le carrousel publié.
async function supprimerLeCarrousel(bouton) {
  const c = etat.carrousel;
  if (!c) return;
  bouton.disabled = true;
  try {
    const enLigne = etat.medias.filter((m) => m.cle);
    for (const m of enLigne) await supprimerFichier(m.cle);
    await api.supprimerCarrousel(c.id);
    etat.carrousel = null;
    etat.medias = [];
    etat.selection = [];
    etat.liste = (etat.liste ?? []).filter((x) => x.id !== c.id);
    messageCourt('Carrousel supprimé');
    location.hash = '#yuno/carrousel';
  } catch (e) {
    console.error('Suppression impossible', e);
    bouton.disabled = false;
    bulle("Ce n'est pas passé", "Le carrousel n'a pas pu être supprimé en entier. Réessaie.", bouton);
  }
}

// --- Le téléchargement ----------------------------------------------------------------------
//
// NUMÉROTÉ DANS L'ORDRE : 01-nom.jpg, 02-nom.mp4…
//   — sur téléphone, la feuille de partage, pour tout « Enregistrer dans
//     Photos » d'un coup. Les fichiers viennent souvent d'en ligne : premier
//     toucher, on les PRÉPARE (le pourcentage sur le bouton) ; second toucher,
//     la feuille s'ouvre — l'iPhone refuse de l'ouvrir après une longue attente,
//     il lui faut un geste frais (règle du kit) ;
//   — sur ordinateur, un ZIP — ou le fichier seul s'il n'y en a qu'un.

async function fichierDe(m, nom) {
  if (m.fichier) return new File([m.fichier], nom, { type: m.fichier.type });
  const r = await fetch(m.url);
  if (!r.ok) throw new Error(`${m.nom} : ${r.status}`);
  const blob = await r.blob();
  return new File([blob], nom, { type: blob.type || m.type || '' });
}

async function telecharger(bouton) {
  if (!etat.selection.length || etat.enCours) return;
  const auDoigt = window.matchMedia('(pointer: coarse)').matches && !!navigator.canShare;

  // Second toucher sur téléphone : tout est prêt, la feuille s'ouvre.
  if (etat.prets && auDoigt) {
    try {
      await navigator.share({ files: etat.prets });
    } catch (e) {
      if (e?.name !== 'AbortError') bulle("Ce n'est pas passé", "Le partage n'a pas pu s'ouvrir.", bouton);
    }
    return;
  }

  const ordre = etat.selection.map((id, k) => ({
    m: media(id),
    nom: `${String(k + 1).padStart(2, '0')}-${media(id).nom}`,
  }));
  if (ordre.some(({ m }) => !m.fichier && !m.url)) {
    bulle('Pas encore prêt', 'Certaines photos sont encore en route. Réessaie dans un instant.', bouton);
    return;
  }
  // Des adresses qui vont expirer se renouvellent avant de servir.
  if (Date.now() - etat.adressesLe > ADRESSES_VALABLES_MS) await signer().catch(() => {});

  const libelle = () => hote?.querySelector('[data-car-libelle]');
  const total = ordre.reduce((s, { m }) => s + (m.taille || 0), 0);
  let recus = 0;
  etat.enCours = true;
  dessinerActions();
  try {
    const fichiers = [];
    for (const { m, nom } of ordre) {
      if (!m.fichier && libelle()) {
        libelle().textContent = `Préparation… ${Math.floor((recus / Math.max(1, total)) * 100)} %`;
      }
      fichiers.push(await fichierDe(m, nom));
      recus += m.taille || 0;
    }

    if (auDoigt && navigator.canShare({ files: fichiers })) {
      // Tout venait de l'appareil : le geste est encore frais, on partage
      // tout de suite. Sinon on attend le second toucher.
      if (ordre.every(({ m }) => m.fichier)) {
        etat.enCours = null;
        dessinerActions();
        await navigator.share({ files: fichiers }).catch((e) => {
          if (e?.name !== 'AbortError') throw e;
        });
        return;
      }
      etat.prets = fichiers;
      messageCourt('Carrousel prêt : touche à nouveau pour l’enregistrer.');
      return;
    }

    if (fichiers.length === 1) {
      enregistrer(fichiers[0], fichiers[0].name);
      return;
    }
    const zip = await construireZip(
      fichiers.map((f) => ({ nom: f.name, fichier: f })),
      (lus, t) => { if (libelle()) libelle().textContent = `ZIP… ${Math.floor((lus / Math.max(1, t)) * 100)} %`; },
    );
    const nomZip = (etat.carrousel?.nom ?? 'carrousel')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '');
    enregistrer(zip, `${nomZip || 'carrousel'}-yuno.zip`);
  } catch (e) {
    console.error('Téléchargement impossible', e);
    bulle("Ce n'est pas passé", 'Le téléchargement n’a pas marché. Réessaie.', bouton);
  } finally {
    etat.enCours = null;
    if (hote?.isConnected && hote.dataset.carEcran === 'outil') dessinerActions();
  }
}

// --- Glisser-déposer pour changer l'ordre ----------------------------------------------
//
// À la souris on glisse ; au doigt, appui long puis on glisse (fonction
// `carSortable` du kit). Un fantôme suit le pointeur, la liste se réordonne
// sous lui, et le carrousel prend l'ordre au relâchement.

let prise = null;
let glisseLe = 0;
const vientDeGlisser = () => Date.now() - glisseLe < 450;

const elementsTriables = (boite, selecteur) => [...boite.querySelectorAll(selecteur)];

function commencer() {
  const { el } = prise;
  const r = el.getBoundingClientRect();
  prise.actif = true;
  prise.dx = prise.sx - r.left;
  prise.dy = prise.sy - r.top;
  const fantome = el.cloneNode(true);
  fantome.classList.add('car-fantome');
  fantome.style.width = r.width + 'px';
  fantome.style.height = r.height + 'px';
  document.body.appendChild(fantome);
  prise.fantome = fantome;
  el.classList.add('car-deplace');
  document.documentElement.classList.add('car-en-tri');
  try { navigator.vibrate?.(12); } catch {}
  placer();
  prise.raf = requestAnimationFrame(defiler);
}

function placer() {
  const { x, y, el, boite, selecteur } = prise;
  prise.fantome.style.transform = `translate(${x - prise.dx}px, ${y - prise.dy}px) scale(1.06)`;
  let meilleur = null;
  let distance = Infinity;
  for (const it of elementsTriables(boite, selecteur)) {
    if (it === el) continue;
    const r = it.getBoundingClientRect();
    const ecartV = Math.max(0, Math.abs(y - (r.top + r.height / 2)) - r.height / 2);
    const d = ecartV * 1000 + Math.abs(x - (r.left + r.width / 2));
    if (d < distance) { distance = d; meilleur = it; }
  }
  if (!meilleur) return;
  const r = meilleur.getBoundingClientRect();
  const apres = x > r.left + r.width / 2;
  const repere = apres ? meilleur.nextSibling : meilleur;
  if (repere !== el && el.nextSibling !== repere) {
    boite.insertBefore(el, repere);
    elementsTriables(boite, selecteur).forEach((it, i) => {
      const n = it.querySelector('.car-n');
      if (n) n.textContent = i + 1;
    });
  }
}

// Près d'un bord, la liste défile d'elle-même : on doit pouvoir porter la
// vingtième photo jusqu'à la première place.
function defiler() {
  if (!prise?.actif) return;
  const { boite, x, y } = prise;
  const r = boite.getBoundingClientRect();
  const bord = 48;
  if (boite.scrollWidth > boite.clientWidth + 1) {
    let v = 0;
    if (x < r.left + bord) v = -Math.ceil((r.left + bord - x) / 3);
    else if (x > r.right - bord) v = Math.ceil((x - (r.right - bord)) / 3);
    if (v) { boite.scrollLeft += v; placer(); }
  }
  if (boite.scrollHeight > boite.clientHeight + 1) {
    let v = 0;
    if (y < r.top + bord) v = -Math.ceil((r.top + bord - y) / 3);
    else if (y > r.bottom - bord) v = Math.ceil((y - (r.bottom - bord)) / 3);
    if (v) { boite.scrollTop += v; placer(); }
  } else {
    let v = 0;
    if (y < 80) v = -Math.ceil((80 - y) / 4);
    else if (y > window.innerHeight - 80) v = Math.ceil((y - (window.innerHeight - 80)) / 4);
    if (v) { window.scrollBy(0, v); placer(); }
  }
  prise.raf = requestAnimationFrame(defiler);
}

function terminer(annule) {
  if (!prise) return;
  const p = prise;
  prise = null;
  clearTimeout(p.minuteur);
  if (!p.actif) return;
  cancelAnimationFrame(p.raf);
  p.fantome.remove();
  p.el.classList.remove('car-deplace');
  document.documentElement.classList.remove('car-en-tri');
  glisseLe = Date.now();
  const liste = elementsTriables(p.boite, p.selecteur);
  const ordre = liste.map((it) => etat.selection[Number(it.dataset.k)]);
  if (annule || ordre.join('|') === etat.selection.join('|')) {
    dessiner();
    return;
  }
  etat.arme = -1;
  changer(ordre);
  dessiner(liste.indexOf(p.el));
}

function rendreTriable(boite, selecteur) {
  boite.addEventListener('mousedown', (e) => {
    const el = e.button === 0 && e.target.closest(selecteur);
    if (!el || e.target.closest('.car-x')) return;
    e.preventDefault();
    prise = { el, boite, selecteur, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, souris: true };
  });
  boite.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { terminer(true); return; }
    const el = e.target.closest(selecteur);
    if (!el || e.target.closest('.car-x')) return;
    const t = e.touches[0];
    prise = { el, boite, selecteur, x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY };
    prise.minuteur = setTimeout(() => { if (prise && !prise.actif) commencer(); }, 300);
  }, { passive: true });
  boite.addEventListener('touchmove', (e) => {
    if (!prise || prise.souris) return;
    const t = e.touches[0];
    prise.x = t.clientX;
    prise.y = t.clientY;
    if (!prise.actif) {
      // Un doigt qui bouge avant l'appui long fait défiler : on le laisse faire.
      if (Math.abs(prise.x - prise.sx) + Math.abs(prise.y - prise.sy) > 10) {
        clearTimeout(prise.minuteur);
        prise = null;
      }
      return;
    }
    e.preventDefault();
    placer();
  }, { passive: false });
  boite.addEventListener('touchend', () => { if (prise && !prise.souris) terminer(false); });
  boite.addEventListener('touchcancel', () => { if (prise && !prise.souris) terminer(true); });
  boite.addEventListener('contextmenu', (e) => { if (e.target.closest(selecteur)) e.preventDefault(); });
}

// Les écouteurs de la FENÊTRE se posent une fois pour toutes : l'hôte, lui,
// change à chaque rendu du site.
let fenetreBranchee = false;
function brancherLaFenetre() {
  if (fenetreBranchee) return;
  fenetreBranchee = true;
  window.addEventListener('mousemove', (e) => {
    if (!prise?.souris) return;
    prise.x = e.clientX;
    prise.y = e.clientY;
    if (!prise.actif && Math.abs(prise.x - prise.sx) + Math.abs(prise.y - prise.sy) > 6) commencer();
    else if (prise.actif) placer();
  });
  window.addEventListener('mouseup', () => { if (prise?.souris) terminer(false); });
  // Ctrl/Cmd+Z annule, Ctrl+Maj+Z et Ctrl+Y rétablissent — tant que l'outil
  // est à l'écran et qu'on n'écrit pas dans un champ.
  document.addEventListener('keydown', (e) => {
    if (!hote?.isConnected || hote.dataset.carEcran !== 'outil' || !(e.ctrlKey || e.metaKey)) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName ?? '')) return;
    const k = (e.key ?? '').toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); annuler(); }
    else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); retablir(); }
  });
  // UN ENVOI EN COURS NE SE PERD PAS EN SILENCE : fermer l'onglet pendant que
  // les photos partent les laisserait à moitié en ligne.
  window.addEventListener('beforeunload', (e) => {
    if (etat.medias.some((m) => m.envoi === 'envoi' || m.envoi === 'attente')) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// --- Le montage ---------------------------------------------------------------------------

function brancher(racine) {
  racine.addEventListener('click', (e) => {
    const action = e.target.closest('[data-car]');
    if (action) {
      const quoi = action.dataset.car;
      if (quoi === 'choisir') racine.querySelector('[data-car-fichier]')?.click();
      else if (quoi === 'zero') partirDeZero(action);
      else if (quoi === 'telecharger') telecharger(action);
      else if (quoi === 'annuler') annuler();
      else if (quoi === 'retablir') retablir();
      else if (quoi === 'nouveau') nouveauCarrousel(action);
      else if (quoi === 'relancer') relancerLesEchecs();
      else if (quoi === 'supprimer') { etat.confirmerSuppression = true; dessiner(); }
      else if (quoi === 'garder') { etat.confirmerSuppression = false; dessiner(); }
      else if (quoi === 'supprimer-oui') supprimerLeCarrousel(action);
      return;
    }
    if (vientDeGlisser()) return;
    const croix = e.target.closest('[data-retirer]');
    if (croix) {
      e.preventDefault();
      e.stopPropagation();
      retirer(Number(croix.dataset.retirer));
      return;
    }
    const item = e.target.closest('.car-sel-item');
    if (item) { toucherSelection(Number(item.dataset.k)); return; }
    const tuile = e.target.closest('.car-tuile');
    if (tuile) toucherTuile(tuile.dataset.id, tuile);
  });

  racine.addEventListener('keydown', (e) => {
    const croix = e.target.closest?.('[data-retirer]');
    if (croix && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      retirer(Number(croix.dataset.retirer));
    }
    if (e.target.matches?.('[data-car-nom]') && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  });

  // Le nom s'enregistre quand on quitte le champ, sans bouton — comme le mot
  // d'une journée.
  racine.addEventListener('focusout', (e) => {
    if (e.target.matches?.('[data-car-nom]')) renommer(e.target);
  });

  racine.addEventListener('change', (e) => {
    if (e.target.matches('[data-car-match]')) {
      relier(e.target.value);
      return;
    }
    if (!e.target.matches('[data-car-fichier]')) return;
    importer([...e.target.files]);
    e.target.value = '';
  });

  // Glisser des fichiers — ou un dossier — sur l'outil depuis le Finder.
  racine.addEventListener('dragover', (e) => {
    if (!etat.carrousel || ![...(e.dataTransfer?.types ?? [])].includes('Files')) return;
    e.preventDefault();
    racine.classList.add('car-depot-survol');
  });
  racine.addEventListener('dragleave', (e) => {
    if (!racine.contains(e.relatedTarget)) racine.classList.remove('car-depot-survol');
  });
  racine.addEventListener('drop', async (e) => {
    if (!etat.carrousel || ![...(e.dataTransfer?.types ?? [])].includes('Files')) return;
    e.preventDefault();
    racine.classList.remove('car-depot-survol');
    importer(await fichiersDuDepot(e.dataTransfer));
  });

  racine.addEventListener('scroll', (e) => {
    if (e.target.matches?.('[data-car-piste]')) pointActif();
  }, { capture: true, passive: true });
}

export default {
  /** @param {HTMLElement} element @param {{ id?: string|null }} route */
  monter(element, { id = null } = {}) {
    hote = element;
    hote.classList.add('car-hote');
    brancherLaFenetre();
    brancher(hote);

    if (!id) {
      vueCourante = 'liste';
      idDemande = null;
      dessiner();
      chargerLaListe();
      return;
    }

    vueCourante = 'outil';
    chargerLesSorties();
    const autre = idDemande !== id;
    idDemande = id;
    dessiner();
    const enEnvoi = etat.medias.some((m) => m.envoi === 'envoi' || m.envoi === 'attente');
    if (autre || (!enEnvoi && Date.now() - etat.chargeLe > RELIRE_APRES_MS)) chargerLeCarrousel(id);
  },
};
