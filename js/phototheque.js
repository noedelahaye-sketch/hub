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
import { bulle, messageCourt, messageAnnulable } from './bulle.js';
import { enregistrer } from './zip.js';
import { envoyerFichier, envoyerVignette, adressesDe, supprimerFichier, placeOccupee } from './photos-cloud.js';
import { lirePrise } from './exif.js';
import { relireAuProchainMontage } from './carrousel.js';
import { mesurerLeFlou, estUnFile, propositionsPour, personnesDuMatch, rafalesDe, empiler, priseEnClair,
  regleDe, filtresDe, memeRegle, dansLaPeriode, PERIODES } from './tri-photos.js';

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
// Les albums par match, depuis le 21 novembre 2026 (Noé : « le premier
// affichage de la photothèque doit être l'espace Rechercher, avec toutes les
// photos, et on doit pouvoir aller dans la page des albums par match »).
const ALBUMS = 'albums';
// Une adresse qui ouvre la pile « À trier » en arrivant : c'est la porte de la
// page Créer au téléphone (21 novembre 2026).
const A_TRIER = 'a-trier';

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
  quiOuvert: false,      // le champ « Qui est dessus » est déplié
  menuOuvert: null,      // sur téléphone, la famille dont le menu est déplié
  supprimerEtiq: null,   // l'étiquette qui attend sa confirmation
  // La recherche (étape 3).
  filtres: nouveauxFiltres(),
  ordre: 'recentes',     // 'recentes' | 'anciennes' | 'notees' | 'hasard'
  // LA PAGE D'UN MATCH A SES FILTRES À ELLE (21 novembre 2026, demande de Noé :
  // « les mêmes filtres que dans la photothèque ») : filtrer un match ne doit
  // pas filtrer la photothèque derrière lui.
  filtresMatch: nouveauxFiltres(),
  ordreMatch: 'match',   // 'match' (l'ordre de prise de vue) | 'notees'
  listeVue: [],          // les photos que la visionneuse fait défiler, dans l'ordre
  filtresTel: false,     // sur téléphone, les filtres sont dépliés sous la rangée d'outils
  // La page des albums : son tri et ses filtres, à elle.
  albums: { ordre: 'recents', menuOrdre: false, panneau: false,
    filtres: { competitions: new Set(), clubs: new Set(), mois: new Set() } },
  menuOrdre: false,      // le menu du tri est ouvert
  // Les parutions (étape 4).
  collections: [],       // les filtres gardés sous un nom
  collection: null,      // la dernière ouverte, qu'on peut mettre à jour
  nommer: false,         // on écrit le nom d'une nouvelle collection
  supprimerCol: null,    // la collection qui attend sa confirmation
  parutions: null,       // les publications de Yuno : [{ id, titre, format, date_prevue, statut }]
  pour: null,            // ce dont on choisit les photos — une parution ou un carrousel —, ou null
  pourGenre: null,       // 'parution' | 'carrousel'
  pourCarrousel: null,   // le carrousel du choix : { id, nom, medias }
  // La pile « à trier » (21 novembre 2026).
  pile: false,           // la visionneuse déroule la pile
  couleursLues: false,   // le rattrapage du noir et blanc a tourné cette visite
  place: null,           // { occupe, plafond } en octets, chez Cloudflare
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
    atrier: false, depuis: null,
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
// Ce que la grille montre : un match (filtré), ou ce que la recherche trouve.
const enMatch = () => vueCourante === 'match';
const F = () => (enMatch() ? etat.filtresMatch : etat.filtres);
const photosAffichees = () => (vueCourante === 'recherche' ? resultats() : photosDuMatchFiltrees());
function photosDuMatchFiltrees() {
  const liste = photosDuMatch(cible).filter(correspond);
  // Les mieux notées d'abord, et l'ordre du match à note égale.
  if (etat.ordreMatch === 'notees') return liste.sort((a, b) => (b.note ?? 0) - (a.note ?? 0));
  return liste;
}
const sourceDesFiltres = () => (enMatch() ? photosDuMatch(cible) : (etat.photos ?? []));

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
  filtre: '<path d="M4 5h16l-6 7.5V19l-4 2v-8.5z"/>',
  ordre: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',
  choisir: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>',
  albums: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  cocheSimple: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  coupe: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM6 5H4v2a3 3 0 0 0 3 3M18 5h2v2a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4"/>',
  rebattre: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  carrousel: '<rect x="6" y="5" width="12" height="14" rx="2"/><path d="M3 7v10M21 7v10"/>',
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

// UN SEUL CHARGEMENT À LA FOIS : la page Créer demande la réserve deux fois
// d'un coup (les cinq photos et le compte « À trier »), et la photothèque une
// troisième en arrivant. Les trois attendent la même lecture.
let chargementEnCours = null;
function charger() {
  chargementEnCours ??= chargerVraiment().finally(() => { chargementEnCours = null; });
  return chargementEnCours;
}
async function chargerVraiment() {
  try {
    const [lignes, etiquettes, personnes, parutions, collections] = await Promise.all([
      api.lirePhotos(),
      api.lireEtiquettes(),
      api.lirePersonnesPossibles(),
      api.lireParutionsYuno(),
      // Sans ses collections, la photothèque marche : leur lecture ne bloque rien.
      api.lireCollections().catch((e) => { console.error('Collections non lues', e); return []; }),
    ]);
    etat.collections = collections;
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
    const partis = (p) => [...retraits].some((x) => x.ids.has(p.id));
    etat.photos = [...distantes, ...locales].filter((p) => !partis(p));
    etat.chargeLe = Date.now();
    etat.adressesLe = 0;
    // En arrière-plan, sans retarder l'écran.
    setTimeout(() => rattraperLesCouleurs().then(rattraperLeFlou), 1500);
    lireLaPlace();
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
  if (etat.choisirMatch || (lr.panneau === 'import' && enAtelier())) dessiner();
}

// Le match d'une clé : depuis ses photos, sinon depuis les sorties connues.
function matchDe(cle) {
  if (cle === SANS_MATCH) return null;
  return (etat.photos ?? []).find((p) => p.evenement_id === cle)?.evenement
    ?? (etat.sorties ?? []).find((s) => s.id === cle)
    ?? null;
}

// --- L'import ------------------------------------------------------------------------------

const EXTENSIONS_PHOTO = /\.(jpe?g|png|webp|heic|heif|avif)$/i;
const estUnePhoto = (f) => f.type.startsWith('image/') || EXTENSIONS_PHOTO.test(f.name);

function importer(fichiers) {
  if (vueCourante !== 'match' || !cible) return;
  const evenementId = cible === SANS_MATCH ? null : cible;
  // Sans la casse : un « .JPG » redéposé n'est pas une photo de plus.
  const deja = new Set(photosDuMatch(cible).map((p) => (p.nomSource ?? p.nom).normalize('NFC').toLowerCase()));
  const nouvelles = [];
  const aCompleter = [];
  for (const fichier of fichiers) {
    if (!estUnePhoto(fichier)) continue;
    // Un même fichier déposé deux fois dans un match n'y entre qu'une fois — mais
    // il peut y apporter ce qui manque : ses infos de prise de vue.
    const nomDuFichier = fichier.name.normalize('NFC').toLowerCase();
    if (deja.has(nomDuFichier)) { aCompleter.push(fichier); continue; }
    deja.add(nomDuFichier);
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
  if (aCompleter.length) completerLesPrises(aCompleter, photosDuMatch(cible), !nouvelles.length);
  if (!nouvelles.length && aCompleter.length) return;
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

// COMPLÉTER DES PHOTOS DÉJÀ LÀ (25 novembre 2026) : l'allègement avait retiré les
// infos de prise de vue. Redéposer le dossier d'origine dans son match les lit et
// les range — rien n'est renvoyé, rien n'est remplacé.
async function completerLesPrises(fichiers, photos, dire) {
  const sansExtension = (n) => String(n ?? '').replace(/\.[^.]+$/, '').normalize('NFC').toLowerCase();
  const bilan = { deja: 0, sansInfos: 0, autreDate: 0 };
  let n = 0;
  messageCourt(`Lecture de ${fichiers.length} fichier${fichiers.length > 1 ? 's' : ''}…`);
  for (const fichier of fichiers) {
    const memeNom = photos.filter((x) => x.envoi === 'fait'
      && sansExtension(x.nomSource ?? x.nom) === sansExtension(fichier.name));
    const candidates = memeNom.filter((x) => !x.prise);
    if (!candidates.length) { if (memeNom.length) bilan.deja++; continue; }
    const { date, infos } = await lirePrise(fichier);
    if (!infos) { bilan.sansInfos++; continue; }
    // Le même nom ne suffit pas : deux boîtiers numérotent pareil, et un match peut
    // porter deux fois le même. La date tranche, entre toutes.
    const p = candidates.find((x) => !date || !x.prise_le || Math.abs(Date.parse(date) - Date.parse(x.prise_le)) <= 1000);
    if (!p) { bilan.autreDate++; continue; }
    try {
      await api.garderPrise(p.id, infos);
      p.prise = infos;
      n++;
    } catch (e) {
      console.error('Infos non gardées', p.nom, e);
    }
  }
  // ON DIT POURQUOI : « rien à ajouter » laissait chercher (défaut rapporté par Noé).
  const raisons = [
    bilan.deja ? `${bilan.deja} les avai${bilan.deja > 1 ? 'en' : ''}t déjà` : null,
    bilan.sansInfos ? `${bilan.sansInfos} fichier${bilan.sansInfos > 1 ? 's' : ''} sans infos` : null,
    bilan.autreDate ? `${bilan.autreDate} d’une autre date` : null,
  ].filter(Boolean).join(', ');
  if (n) {
    messageCourt(`Infos ajoutées à ${n} photo${n > 1 ? 's' : ''}${raisons ? ` · ${raisons}` : ''}.`, 5000);
    if (!etat.ouverte) dessiner();
  } else if (dire) messageCourt(`Aucune info à ajouter${raisons ? ` : ${raisons}` : ''}.`, 5000);
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
  const [{ date, infos }, source] = await Promise.all([lirePrise(fichier), decoder(fichier)]);
  p.prise = infos;
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
  // RECONNU À L'IMPORT : la photo en noir et blanc arrive étiquetée.
  const nb = etiquetteNoirEtBlanc();
  if (nb && estNoirEtBlanc(petite)) p.etiquettes.add(nb.id);
  p.flou_mouvement = estUnFile(mesurerLeFlou(petite, petite.width, petite.height));
  p.flou_lu = true;
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
      couleurs_lues: true,
      prise: p.prise ?? null,
      flou_lu: true,
      flou_mouvement: p.flou_mouvement ?? false,
      triee: p.triee ?? false,
    });
    p.enBase = true;
    p.couleurs_lues = true;
    // Ce qui a été trié PENDANT le voyage n'avait pas encore de ligne où
    // s'écrire : on le pose maintenant.
    await Promise.all([
      ...[...p.etiquettes].map((id) => api.etiqueterPhotos([p.id], id)),
      ...[...p.personnes].map((id) => api.relierPersonne([p.id], id)),
    ]);
    p.envoi = 'fait';
    p.progression = 1;
    p.blobVignette = null;
    // Le dernier envoi d'un lot fait relire la place prise.
    if (!(etat.photos ?? []).some(enRoute)) lireLaPlace();
  } catch (e) {
    console.error('Envoi impossible', p.nom, e);
    p.envoi = 'echec';
  }
  majEnvoi(p);
}

// LA PLACE OCCUPÉE (21 novembre 2026, demande de Noé : « être au courant de la
// place utilisée par l'ensemble des photos »). C'est le Worker qui la compte, en
// parcourant le bucket : tout ce qui y est, vignettes et carrousels compris —
// c'est ce chiffre-là que le plafond de 10 Go regarde.
async function lireLaPlace() {
  try {
    etat.place = await placeOccupee();
    const el = hote?.querySelector('[data-pht-place]');
    if (el) el.outerHTML = gabaritPlace();
  } catch (e) {
    console.error('Place occupée inconnue', e);
  }
}

function enOctetsLisibles(n) {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Go`;
  return `${Math.max(1, Math.round(n / 1024 ** 2)).toLocaleString('fr-FR')} Mo`;
}

// Une jauge discrète et une phrase : ce qui est pris, sur quoi. Aucune couleur
// d'alerte — le hub n'en a pas ; passé les trois quarts, la jauge prend l'or,
// c'est tout.
function gabaritPlace() {
  const pl = etat.place;
  if (!pl) return '<span class="pht-place" data-pht-place></span>';
  const part = Math.min(1, pl.occupe / Math.max(1, pl.plafond));
  const phototheque = (etat.photos ?? []).filter((p) => p.envoi === 'fait').reduce((s, p) => s + (p.taille ?? 0), 0);
  return `<span class="pht-place${part > 0.75 ? ' pleine' : ''}" data-pht-place
      title="Dont ${enOctetsLisibles(phototheque)} pour les photos de la photothèque — le reste : vignettes et carrousels">
      <span class="pht-place-jauge" aria-hidden="true"><span style="width:${(part * 100).toFixed(1)}%"></span></span>
      <span class="pht-place-texte"><span class="chiffre">${enOctetsLisibles(pl.occupe)}</span> sur ${enOctetsLisibles(pl.plafond)}</span>
    </span>`;
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

// UNE VIGNETTE DÉJÀ VUE NE REFAIT PAS SON FONDU (21 novembre 2026, défaut
// rapporté par Noé : « pourquoi ça fait ce rechargement des aperçus quand
// j'appuie sur tri ou sélectionner ? »). La grille se réécrit à chaque geste ;
// chaque image repartait donc invisible et attendait son `onload` pour
// reparaître — un clignotement de toute la page pour un menu qu'on ouvre.
// L'image est déjà dans le cache du navigateur : on la pose visible d'emblée.
const vignettesVues = new Set();
// UNE PHOTO SE NOMME PAR CE QU'ELLE MONTRE, pas par son fichier : le match, le
// moment, ses étiquettes. C'est ce qu'un lecteur d'écran en dit.
function nomDeLaPhoto(p) {
  const mots = [...(p.etiquettes ?? [])].map((id) => (etat.etiquettes ?? []).find((e) => e.id === id)?.nom);
  const gens = [...(p.personnes ?? [])].map((id) => (etat.personnes ?? []).find((c) => c.id === id)?.nom);
  return ['Photo', p.evenement?.titre ?? matchDe(p.evenement_id)?.titre, p.prise_le ? momentLong(p.prise_le) : null,
    ...gens, ...mots, p.note ? `${p.note} étoile${p.note > 1 ? 's' : ''}` : null].filter(Boolean).join(', ');
}
const nomDeLaTuile = (p) => (etat.modeSelection ? nomDeLaPhoto(p) : `Ouvrir : ${nomDeLaPhoto(p)}`);

function tuile(p) {
  const src = p.vignette ?? '';
  const choisie = etat.selection.has(p.id);
  const vue = src && vignettesVues.has(src);
  return `<button type="button" class="pht-tuile${choisie ? ' choisie' : ''}${vue ? ' prete' : ''}" data-ouvrir="${p.id}"
      tabindex="-1" aria-label="${echapper(nomDeLaTuile(p))}"${
      etat.modeSelection ? ` aria-pressed="${choisie}"` : ''}>
      <img data-vignette="${p.id}" alt="" loading="lazy" decoding="async"${src ? ` src="${echapper(src)}"` : ''}
        onload="this.parentNode?.classList.add('prete')">
      <span class="car-envoi" data-envoi-de="${p.id}"
        data-envoi="${p.envoi === 'preparation' ? 'attente' : p.envoi}"
        style="--avance:${p.progression ?? 0}" aria-hidden="true"></span>
      ${etat.modeSelection ? `<span class="pht-coche" aria-hidden="true">${rangDansLeChoix(p)}</span>` : ''}
      ${badgeNote(p)}${badgePubliee(p)}
    </button>`;
}

// LE CHOIX DU MATCH, AVANT L'IMPORT : un menu du système posé sur une pastille,
// comme celui du carrousel. Choisir mène au match, où l'on dépose les photos.
// LA GRILLE SE POSE PAR PAQUETS (25 novembre 2026, défaut rapporté par Noé : « sur
// Safari ça me met un écran noir »). Elle posait 1 843 photos d'un coup — une page
// de 75 000 px — et forçait les déjà vues à se décoder ensemble : Safari cessait
// de peindre, les boutons restant cliquables. On pose ce qui se voit, et la suite
// en approchant du bas. Le nombre posé survit aux redessins : on ne perd pas sa
// place.
const suite = { cle: '', n: 0, pas: 120, items: [], dessin: null };

function grilleEnPaquets(items, dessin, classes, attributs = '') {
  const pas = classes.includes('lr-deux') ? 24 : 120;
  const cle = [vueCourante, cible, etat.ordre, etat.ordreMatch, classes.includes('lr-deux')].join('|');
  if (suite.cle !== cle) Object.assign(suite, { cle, n: pas });
  Object.assign(suite, { pas, items, dessin, n: Math.max(pas, suite.n) });
  return `<div class="pht-grille ${classes}"${attributs}>${items.slice(0, suite.n).map(dessin).join('')}</div>
    ${items.length > suite.n ? '<div data-pht-suite aria-hidden="true"></div>' : ''}`;
}

function poserLaSuite() {
  const grille = hote?.querySelector('.pht-grille');
  if (!grille || suite.n >= suite.items.length) return;
  grille.insertAdjacentHTML('beforeend', suite.items.slice(suite.n, suite.n + suite.pas).map(suite.dessin).join(''));
  suite.n += suite.pas;
  // Une photo posée après la signature de la grille prend son adresse ici.
  grille.querySelectorAll('img[data-vignette]:not([src]), img[data-entiere]:not([src])').forEach((img) => {
    const p = photo(img.dataset.vignette ?? img.dataset.entiere);
    const src = img.dataset.entiere ? p?.url : p?.vignette;
    if (src) img.src = src;
  });
  if (suite.n >= suite.items.length) hote.querySelector('[data-pht-suite]')?.remove();
  poserLArret();
}

let guetteur = null;
function guetterLaSuite() {
  guetteur?.disconnect();
  const borne = hote?.querySelector('[data-pht-suite]');
  if (!borne) return;
  guetteur = new IntersectionObserver((entrees) => {
    if (!entrees.some((x) => x.isIntersecting)) return;
    poserLaSuite();
    // Un paquet peut ne pas remplir l'écran : on redemande.
    const encore = hote?.querySelector('[data-pht-suite]');
    guetteur.disconnect();
    if (encore) requestAnimationFrame(() => guetteur.observe(encore));
  }, { rootMargin: '1500px 0px' });
  guetteur.observe(borne);
}

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
      ${/* LA PLACE, DÈS QU'ON APPUIE SUR « IMPORTER » (demande de Noé) : c'est
         au moment de décider d'ajouter un match qu'on veut savoir ce qui reste. */ ''}
      <div class="pht-place-import">${gabaritPlace()}</div>
    </div>`;
}

// LA PAGE DES ALBUMS PAR MATCH (21 novembre 2026, demande de Noé) : elle range,
// elle n'importe pas — l'import vit en tête de la photothèque. Elle se trie par
// date (les plus récents ou les plus anciens d'abord) et se filtre par
// compétition, par club et par mois. Comme partout, on n'offre que ce qui
// existe, avec son compte d'albums.
const clubsDu = (match) => [match?.recevant?.nom, match?.visiteur?.nom].filter(Boolean);

function albums() {
  const groupes = new Map();
  for (const p of etat.photos ?? []) {
    const cle = cleDuMatch(p);
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(p);
  }
  return [...groupes.entries()].map(([cle, photos]) => ({ cle, photos: trier(photos), match: matchDe(cle) }));
}

function albumCorrespond({ match }) {
  const f = etat.albums.filtres;
  const filtre = f.competitions.size || f.clubs.size || f.mois.size;
  // « Sans match » n'a ni compétition, ni club, ni date : un filtre l'écarte.
  if (!match) return !filtre;
  if (f.competitions.size && !f.competitions.has(match.competition ?? '')) return false;
  if (f.clubs.size && !clubsDu(match).some((c) => f.clubs.has(c))) return false;
  if (f.mois.size && !f.mois.has(moisDe(match.date_debut))) return false;
  return true;
}

function puceAlbum(famille, valeur, nom, n) {
  const pris = etat.albums.filtres[famille].has(valeur);
  return `<button type="button" class="pht-etiq" data-alb-filtre="${famille}" data-valeur="${echapper(valeur)}"
      data-etat="${pris ? 'tout' : 'rien'}" aria-pressed="${pris}">${echapper(nom)} <span class="pht-etiq-n">${n}</span></button>`;
}

function filtresDesAlbums(tous) {
  const compter = (cles) => { const m = new Map(); cles.forEach((c) => c && m.set(c, (m.get(c) ?? 0) + 1)); return m; };
  const avecMatch = tous.filter((a) => a.match);
  const comp = compter(avecMatch.map((a) => a.match.competition));
  const clubs = compter(avecMatch.flatMap((a) => clubsDu(a.match)));
  const mois = compter(avecMatch.map((a) => moisDe(a.match.date_debut)));
  return `
    ${blocFiltre('Compétition', [...comp].sort((a, b) => a[0].localeCompare(b[0], 'fr'))
      .map(([c, n]) => puceAlbum('competitions', c, c, n)).join(''))}
    ${blocFiltre('Club', [...clubs].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'))
      .map(([c, n]) => puceAlbum('clubs', c, c, n)).join(''))}
    ${blocFiltre('Mois', [...mois].sort((a, b) => b[0].localeCompare(a[0]))
      .map(([c, n]) => puceAlbum('mois', c, nomDuMois(c), n)).join(''))}`;
}

function gabaritListe() {
  if (!etat.photos) return '<p class="car-attente">Un instant…</p>';
  const A = etat.albums;
  const tous = albums();
  const liste = tous.filter(albumCorrespond).sort((a, b) => {
    // « Sans match » ferme la liste, quel que soit l'ordre.
    if (!a.match) return 1;
    if (!b.match) return -1;
    const d = (b.match.date_debut ?? '').localeCompare(a.match.date_debut ?? '');
    return A.ordre === 'anciens' ? -d : d;
  });
  const nf = A.filtres.competitions.size + A.filtres.clubs.size + A.filtres.mois.size;
  const tuiles = liste.map(({ cle, photos, match }) => {
    const n = photos.length;
    return `<a class="pht-match" href="#yuno/phototheque/${cle}">
        <span class="pht-match-photos">${photos.slice(0, 3).map((p) =>
          `<span class="pht-match-cadre"><img data-vignette="${p.id}" alt="" loading="lazy" decoding="async"${
            p.vignette ? ` src="${echapper(p.vignette)}"` : ''}></span>`).join('')}</span>
        <span class="pht-match-nom">${match ? echapper(match.titre) : 'Sans match'}</span>
        <span class="pht-match-service">${match ? `${jourCourt(match.date_debut)}${match.competition ? ` · ${echapper(match.competition)}` : ''} · ` : ''}<span class="chiffre">${n}</span> photo${n > 1 ? 's' : ''}</span>
      </a>`;
  }).join('');
  const ordres = [['recents', 'Les plus récents'], ['anciens', 'Les plus anciens']];
  return `
    <div class="car-tete">
      <a class="car-retour" href="#yuno/phototheque" aria-label="Toutes les photos" title="Toutes les photos">${svg('retour', 20)}</a>
      <div class="pht-titre"><h2 class="pht-nom">Albums par match</h2></div>
    </div>
    <div class="pht-res-tete">
      <p class="pht-res-compte pht-res-total"><span>${nf
        ? `<span class="chiffre">${liste.length}</span> sur ${tous.length}`
        : `<span class="chiffre">${tous.length}</span> album${tous.length > 1 ? 's' : ''}`}</span></p>
      <div class="pht-outils" role="toolbar" aria-label="Trier et filtrer les albums">
        <button type="button" class="car-icone pht-outil${A.panneau || nf ? ' actif' : ''}" data-alb="filtres"
          aria-expanded="${A.panneau}" aria-label="Filtres${nf ? ` (${nf})` : ''}" title="Filtres">${svg('filtre')}${nf ? `<span class="pht-outil-n">${nf}</span>` : ''}</button>
        <span class="pht-outil-ordre">
          <button type="button" class="car-icone pht-outil${A.menuOrdre ? ' actif' : ''}" data-alb="ordre-menu"
            aria-expanded="${A.menuOrdre}" aria-label="Trier par date" title="Trier par date">${svg('ordre')}</button>
          ${A.menuOrdre ? `<span class="pht-ordre-menu" role="menu">${ordres.map(([cle, nom]) =>
            `<button type="button" class="pht-menu-option" role="menuitemradio" data-alb-ordre="${cle}" data-etat="${A.ordre === cle ? 'tout' : 'rien'}"
               aria-checked="${A.ordre === cle}"><span class="pht-menu-coche" aria-hidden="true"></span><span class="pht-menu-nom">${nom}</span></button>`).join('')}</span>` : ''}
        </span>
      </div>
    </div>
    ${A.panneau ? `<div class="pht-filtres-tel pht-filtres-albums">
        ${nf ? '<button type="button" class="car-puce car-puce-mini pht-effacer" data-alb="effacer">Tout effacer</button>' : ''}
        <div class="pht-tri pht-filtres-corps">${filtresDesAlbums(tous)}</div>
      </div>` : ''}
    ${liste.length ? `<div class="pht-matchs">${tuiles}</div>`
      : `<p class="car-liste-vide">${tous.length ? 'Aucun album ne coche tout. Retire un filtre.' : 'Tes matchs et leurs photos s’afficheront ici.'}</p>`}`;
}

function champCompetition(match) {
  return `<label class="car-match pht-competition${match.competition ? ' relie' : ''}">
        ${svg('coupe', 15)}
        <input data-pht-competition list="pht-competitions" value="${echapper(match.competition ?? '')}"
          placeholder="Compétition" autocomplete="off" spellcheck="false" maxlength="60"
          aria-label="Compétition de ce match">
        <datalist id="pht-competitions">${competitionsConnues().map((c) => `<option value="${echapper(c)}"></option>`).join('')}</datalist>
      </label>`;
}

function gabaritMatch() {
  const liste = photosDuMatch(cible);
  const match = matchDe(cible);
  const titre = cible === SANS_MATCH ? 'Sans match' : match?.titre ?? 'Match';
  const tete = `
    <div class="car-tete">
      <a class="car-retour" href="#yuno/phototheque/${ALBUMS}" aria-label="Les albums" title="Les albums">${svg('retour', 20)}</a>
      <div class="pht-titre">
        <h2 class="pht-nom">${echapper(titre)}</h2>
        ${match ? `<span class="discret">${jourCourt(match.date_debut)}</span>` : ''}
      </div>
    </div>
    ${match ? champCompetition(match) : ''}
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
      ${(() => {
        const n = nbFiltres();
        const montrees = photosAffichees();
        return `<div class="pht-res-tete">
            <p class="pht-res-compte pht-res-total"><span>${n
              ? `<span class="chiffre">${montrees.length}</span> sur ${liste.length}`
              : `<span class="chiffre">${liste.length}</span> photo${liste.length > 1 ? 's' : ''}`}</span></p>
            ${rangeeDOutils(montrees.length, n)}
          </div>
          ${etat.filtresTel ? `<div class="pht-filtres-tel pht-partout">
              ${n ? '<button type="button" class="car-puce car-puce-mini pht-effacer" data-pht="effacer-filtres">Tout effacer</button>' : ''}
              <div class="pht-tri pht-filtres-corps">${gabaritFiltres()}</div>
            </div>` : ''}
          ${montrees.length
            ? grilleEnPaquets(montrees, tuile, etat.modeSelection ? 'en-selection' : '')
            : '<p class="car-liste-vide">Aucune photo du match ne coche tout. Retire un filtre.</p>'}
          <button type="button" class="car-puce pht-ajouter-match" data-pht="choisir">${svg('ajouter', 14)}<span>Ajouter des photos</span></button>`;
      })()}
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
  const f = F();
  return f.mois.size + f.competitions.size + f.matchs.size + f.formats.size
    + f.etiquettes.size + f.personnes.size + (f.note ? 1 : 0) + (f.jamais ? 1 : 0)
    + (f.atrier ? 1 : 0) + (f.depuis ? 1 : 0);
};

const correspond = (p) => correspondA(p, F());
function correspondA(p, f) {
  if (f.atrier && estTriee(p)) return false;
  if (f.depuis && !dansLaPeriode(p.prise_le, f.depuis)) return false;
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

// LE HASARD EST TIRÉ UNE FOIS, AU MOMENT OÙ ON LE CHOISIT (21 novembre 2026,
// demande de Noé) : la grille se redessine à chaque geste — une note, une
// étiquette —, et des photos qui se rebattraient à chaque fois ne se
// trieraient plus. Rechoisir « Au hasard » rebat les cartes.
let tirage = new Map();
function rebattre() { tirage = new Map(); }
function auHasard(p) {
  if (!tirage.has(p.id)) tirage.set(p.id, Math.random());
  return tirage.get(p.id);
}

function resultats() {
  const liste = (etat.photos ?? []).filter(correspond);
  if (etat.ordre === 'hasard') return liste.sort((a, b) => auHasard(a) - auHasard(b));
  // Les plus récentes d'abord : un post se fait sur ce qui vient de se passer.
  // « Les mieux notées » fait remonter ses favorites, la date départage.
  // « Les plus anciennes » remonte le temps.
  const sens = etat.ordre === 'anciennes' ? -1 : 1;
  return liste.sort((a, b) =>
    (etat.ordre === 'notees' ? (b.note ?? 0) - (a.note ?? 0) : 0)
    || sens * (b.prise_le ?? '').localeCompare(a.prise_le ?? '')
    || ordreNaturel.compare(a.nom, b.nom));
}

// Les valeurs d'une famille, avec leur compte, dans un ordre qui a un sens.
function valeurs(famille) {
  const compte = new Map();
  const ajouter = (cle) => { if (cle != null && cle !== '') compte.set(cle, (compte.get(cle) ?? 0) + 1); };
  for (const p of sourceDesFiltres()) {
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
  const pris = F()[famille].has(valeur);
  return `<button type="button" class="pht-etiq" data-filtre="${famille}" data-valeur="${echapper(valeur)}"
      data-etat="${pris ? 'tout' : 'rien'}" aria-pressed="${pris}">${echapper(nom)}
      <span class="pht-etiq-n">${n}</span></button>`;
}

const OUVERTS_D_OFFICE = ['Publication et tri', 'Récemment'];
let plisLus = null;
function plis() {
  if (!plisLus) { try { plisLus = JSON.parse(localStorage.getItem('pht-plis') ?? '{}'); } catch { plisLus = {}; } }
  return plisLus;
}
function garderLePli(titre, ouvert) {
  plis()[titre] = ouvert;
  try { localStorage.setItem('pht-plis', JSON.stringify(plisLus)); } catch { /* sans mémoire, rien de grave */ }
}

// CE QUI EST POSÉ, EN TÊTE : on voit d'un regard ce qui filtre, et un toucher
// l'enlève sans aller chercher sa famille.
function filtresPoses() {
  const f = F();
  const puce = (attributs, nom) => `<button type="button" class="pht-etiq pht-pose" ${attributs} data-etat="tout"
      aria-label="Retirer le filtre ${echapper(nom)}">${echapper(nom)}${svg('fermer', 12)}</button>`;
  const nomDe = {
    mois: nomDuMois, competitions: (v) => v, formats: (v) => NOMS_FORMAT[v] ?? v,
    matchs: (v) => matchDe(v)?.titre ?? 'Sans match',
    etiquettes: (v) => (etat.etiquettes ?? []).find((e) => e.id === v)?.nom ?? 'Étiquette',
    personnes: (v) => (etat.personnes ?? []).find((c) => c.id === v)?.nom ?? 'Personne',
  };
  const puces = Object.entries(nomDe).flatMap(([cle, nom]) => [...f[cle]].map((v) =>
    puce(`data-filtre="${cle}" data-valeur="${echapper(v)}"`, nom(v))));
  if (f.atrier) puces.push(puce('data-filtre-atrier', 'Pas triée'));
  if (f.jamais) puces.push(puce('data-filtre-jamais', 'Jamais publiée'));
  if (f.depuis) puces.push(puce(`data-filtre-depuis="${f.depuis}"`, PERIODES[f.depuis]));
  if (f.note) puces.push(puce(`data-filtre-note="${f.note}"`, `${f.note} étoile${f.note > 1 ? 's' : ''} et plus`));
  return puces.length ? `<div class="pht-tri-famille"><p class="pht-tri-titre">Filtres posés</p><div class="pht-etiqs">${puces.join('')}</div></div>` : '';
}

function blocFiltre(titre, puces) {
  if (!puces) return '';
  // REPLIÉ PAR FAMILLE (25 novembre 2026, audit) : soixante-douze étiquettes
  // ouvertes d'un coup faisaient 2 900 px de panneau. S'ouvre d'elle-même la
  // famille où un filtre est posé ; sinon chacune reste comme on l'a laissée.
  const pris = puces.split('data-etat="tout"').length - 1;
  const ouvert = plis()[titre] ?? (pris > 0 || OUVERTS_D_OFFICE.includes(titre));
  return `<details class="pht-tri-famille pht-pli"${ouvert ? ' open' : ''}>
      <summary class="pht-tri-titre" data-pli="${echapper(titre)}">${svg('droite', 13)}<span>${titre}</span>${
        pris ? `<span class="pht-pli-n">${pris}</span>` : ''}</summary>
      <div class="pht-etiqs">${puces}</div></details>`;
}

// --- Les collections intelligentes (25 novembre 2026, demande de Noé) ---------------------------
//
// En tête des filtres : on ouvre une collection d'un toucher, et tout filtre posé
// peut se garder sous un nom. C'est le même panneau au téléphone et quand on
// choisit les photos d'une parution — une collection sert surtout là.
const existeEncore = (famille, id) => (famille === 'etiquettes' ? (etat.etiquettes ?? []).some((e) => e.id === id)
  : famille === 'personnes' ? (etat.personnes ?? []).some((c) => c.id === id) : true);
const filtresDeLaCollection = (c) => filtresDe(c.regle, existeEncore);
const collectionOuverte = () => (enMatch() ? null
  : etat.collections.find((c) => memeRegle(regleDe(filtresDeLaCollection(c)), regleDe(etat.filtres))) ?? null);
const compteDe = (c) => { const f = filtresDeLaCollection(c); return (etat.photos ?? []).filter((p) => correspondA(p, f)).length; };

// TROIS RÈGLES OFFERTES tant qu'il n'y en a aucune : une page vide ouvre une porte.
function collectionsOffertes() {
  const mot = (nom) => (etat.etiquettes ?? []).find((e) => sansAccent(e.nom) === nom)?.id;
  const nb = mot('noir et blanc'), flou = mot('flou de mouvement');
  return [
    { nom: 'À publier', regle: { note: 4, jamais: true } },
    nb ? { nom: 'Noir et blanc fort', regle: { etiquettes: [nb], note: 4 } } : null,
    flou ? { nom: 'Filés', regle: { etiquettes: [flou] } } : null,
    { nom: 'Ce mois-ci, pas triées', regle: { depuis: 'mois', atrier: true } },
  ].filter(Boolean);
}

const propositionsDeCollections = () => collectionsOffertes().map((c, k) =>
  `<button type="button" class="pht-prop" data-col="offerte" data-id="${k}">${svg('ajouter', 13)}<span>${echapper(c.nom)}</span></button>`).join('');

// Nommer, renommer, supprimer, mettre à jour : les mêmes gestes au téléphone et
// dans l'outil Collections de l'ordinateur.
function gestesDeCollection() {
  const ouverte = collectionOuverte();
  const derniere = etat.collections.find((c) => c.id === etat.collection) ?? null;
  const n = nbFiltres();
  return etat.nommer
    ? `<input class="pht-etiq-champ pht-col-champ" data-col-nom maxlength="60" autocomplete="off" placeholder="Nom de la collection" aria-label="Nom de la collection">`
    : ouverte
      ? `<div class="pht-gere">
          <input class="pht-etiq-champ" data-col-renommer="${ouverte.id}" value="${echapper(ouverte.nom)}" maxlength="60" autocomplete="off" aria-label="Renommer la collection">
          <button type="button" class="${etat.supprimerCol === ouverte.id ? 'car-danger' : 'car-puce'} car-puce-mini" data-col="supprimer" data-id="${ouverte.id}"
            aria-label="Supprimer la collection ${echapper(ouverte.nom)}">${etat.supprimerCol === ouverte.id ? 'Supprimer ?' : svg('corbeille', 13)}</button></div>`
      : n ? `<div class="pht-col-gestes"><button type="button" class="car-puce car-puce-mini" data-col="garder">${svg('ajouter', 13)}<span>Garder ce filtre</span></button>
          ${derniere ? `<button type="button" class="car-puce car-puce-mini" data-col="remplacer" data-id="${derniere.id}">Mettre à jour « ${echapper(derniere.nom)} »</button>` : ''}</div>` : '';
}

function blocDesCollections() {
  const ouverte = collectionOuverte();
  const puces = etat.collections.map((c) => `<button type="button" class="pht-etiq" data-col="ouvrir" data-id="${c.id}"
      data-etat="${c === ouverte ? 'tout' : 'rien'}" aria-pressed="${c === ouverte}">${echapper(c.nom)} <span class="pht-etiq-n">${compteDe(c)}</span></button>`).join('');
  const offertes = etat.collections.length ? '' : propositionsDeCollections();
  const gestes = gestesDeCollection();
  if (!puces && !offertes && !gestes) return '';
  return `<div class="pht-tri-famille pht-cols"><p class="pht-tri-titre">Collections</p>
      <div class="pht-etiqs">${puces}${offertes}</div>${gestes}</div>`;
}

async function creerUneCollection(nom, regle, ancre) {
  nom = nom.trim().replace(/\s+/g, ' ');
  etat.nommer = false;
  if (!nom) { dessiner(); return; }
  try {
    const c = await api.creerCollection({ nom, regle });
    etat.collections = [...etat.collections, c];
    etat.collection = c.id;
    messageCourt(`Collection « ${nom} » gardée.`);
  } catch (e) {
    console.error('Collection non gardée', e);
    bulle("Ce n'est pas enregistré", 'La collection n’a pas pu être gardée.', ancre);
  }
  changerFiltres(() => {});
}

// L'écran d'abord ; si l'écriture échoue, la collection reprend ce qu'elle était.
async function ecrireUneCollection(id, champs) {
  const c = etat.collections.find((x) => x.id === id);
  if (!c) return;
  const avant = { ...c };
  Object.assign(c, champs);
  changerFiltres(() => {});
  try {
    await api.modifierCollection(id, champs);
  } catch (e) {
    console.error('Collection non modifiée', e);
    Object.assign(c, avant);
    changerFiltres(() => {});
    bulle("Ce n'est pas enregistré", 'La collection n’a pas pu être modifiée.');
  }
}

async function supprimerUneCollection(id) {
  const avant = etat.collections;
  etat.collections = avant.filter((c) => c.id !== id);
  etat.supprimerCol = null;
  etat.collection = null;
  changerFiltres(() => { etat.filtres = nouveauxFiltres(); });
  try {
    await api.supprimerCollection(id);
  } catch (e) {
    console.error('Collection non supprimée', e);
    etat.collections = avant;
    changerFiltres(() => {});
    bulle("Ce n'est pas enregistré", 'La collection n’a pas pu être supprimée.');
  }
}

function ouvrirUneCollection(id) {
  const c = etat.collections.find((x) => x.id === id);
  if (!c) return;
  const deja = collectionOuverte() === c && vueCourante === 'recherche';
  etat.supprimerCol = null;
  etat.nommer = false;
  etat.collection = deja ? null : id;
  etat.filtres = deja ? nouveauxFiltres() : filtresDeLaCollection(c);
  // Depuis un match ou les albums, on revient à toutes les photos, filtrées.
  if (vueCourante !== 'recherche') { location.hash = '#yuno/phototheque'; return; }
  changerFiltres(() => {});
}

// Entrée et quitter le champ valent la même chose, une seule fois.
function validerUnNom(champ) {
  if (!champ.isConnected) return;
  if (champ.matches('[data-col-nom]')) {
    if (etat.nommer) creerUneCollection(champ.value, regleDe(etat.filtres), champ);
    return;
  }
  const nom = champ.value.trim().replace(/\s+/g, ' ');
  if (!nom) champ.value = champ.defaultValue;
  else if (nom !== champ.defaultValue) { champ.defaultValue = nom; ecrireUneCollection(champ.dataset.colRenommer, { nom }); }
}

function brancherCollections(racine) {
  racine.addEventListener('click', (e) => {
    const b = e.target.closest('[data-col]');
    if (!b) return;
    const { col: quoi, id } = b.dataset;
    if (quoi === 'ouvrir') ouvrirUneCollection(id);
    else if (quoi === 'offerte') {
      const c = collectionsOffertes()[Number(id)];
      etat.filtres = filtresDe(c.regle);
      creerUneCollection(c.nom, c.regle, b);
    } else if (quoi === 'garder') {
      etat.nommer = true;
      changerFiltres(() => {});
      racine.querySelector('[data-col-nom]')?.focus();
    } else if (quoi === 'remplacer') ecrireUneCollection(id, { regle: regleDe(etat.filtres) });
    else if (quoi === 'supprimer') {
      if (etat.supprimerCol === id) supprimerUneCollection(id);
      else { etat.supprimerCol = id; changerFiltres(() => {}); }
    }
  });
  racine.addEventListener('keydown', (e) => {
    const champ = e.target.closest?.('[data-col-nom], [data-col-renommer]');
    if (!champ) return;
    if (e.key === 'Enter') { e.preventDefault(); validerUnNom(champ); }
    else if (e.key === 'Escape') {
      e.stopPropagation();
      if (champ.matches('[data-col-nom]')) { etat.nommer = false; changerFiltres(() => {}); }
      else { champ.value = champ.defaultValue; champ.blur(); }
    }
  });
  racine.addEventListener('focusout', (e) => {
    if (e.target.matches?.('[data-col-nom], [data-col-renommer]')) validerUnNom(e.target);
  });
}

// LES FAMILLES DE FILTRES ET CE QU'ELLES OFFRENT : la même liste nourrit les puces
// du téléphone et les colonnes de l'ordinateur.
function famillesDeFiltres() {
  const m = enMatch();
  const tri = (a, b) => a[1].localeCompare(b[1], 'fr');
  const parEtiquette = new Map(valeurs('etiquettes'));
  return [
    // Dans un match, la période, la compétition et le match sont ceux du match :
    // les offrir ne filtrerait rien.
    m ? null : { cle: 'mois', nom: 'Période', options: valeurs('mois').sort((a, b) => b[0].localeCompare(a[0])).map(([c, n]) => [c, nomDuMois(c), n]) },
    m ? null : { cle: 'competitions', nom: 'Compétition', options: valeurs('competitions').map(([c, n]) => [c, c || 'Sans compétition', n]).sort(tri) },
    m ? null : { cle: 'matchs', nom: 'Match', options: valeurs('matchs')
      .sort((a, b) => (a[0] === SANS_MATCH) - (b[0] === SANS_MATCH)
        || (matchDe(b[0])?.date_debut ?? '').localeCompare(matchDe(a[0])?.date_debut ?? ''))
      .map(([c, n]) => [c, matchDe(c)?.titre ?? 'Sans match', n]) },
    ...FAMILLES.map(({ cle, nom }) => ({ cle: 'etiquettes', nom, options: (etat.etiquettes ?? [])
      .filter((e) => e.famille === cle && parEtiquette.has(e.id)).map((e) => [e.id, e.nom, parEtiquette.get(e.id)]) })),
    { cle: 'personnes', nom: 'Qui est dessus', options: valeurs('personnes')
      .map(([id, n]) => [id, (etat.personnes ?? []).find((c) => c.id === id)?.nom, n]).filter(([, nom]) => nom).sort(tri) },
    { cle: 'formats', nom: 'Format', options: valeurs('formats').sort((a, b) => b[1] - a[1]).map(([c, n]) => [c, NOMS_FORMAT[c] ?? c, n]) },
  ].filter((x) => x?.options.length);
}

function attributsDeFiltre() {
  const f = F();
  const etoiles = [1, 2, 3, 4, 5].map((k) =>
    `<button type="button" class="pht-etoile${f.note && k <= f.note ? ' pleine' : ''}" data-filtre-note="${k}"
       aria-label="${k} étoile${k > 1 ? 's' : ''} et plus" aria-pressed="${f.note === k}">
       <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>
     </button>`).join('');
  // « JAMAIS PUBLIÉE » : la question de Noé — retrouver les bonnes photos encore
  // jamais sorties. Elle s'offre dès qu'une photo l'est, comme tout filtre.
  const jamais = sourceDesFiltres().filter((p) => !foisPubliee(p)).length;
  const publication = `<button type="button" class="pht-etiq" data-filtre-jamais data-etat="${f.jamais ? 'tout' : 'rien'}"
      aria-pressed="${f.jamais}">Jamais publiée <span class="pht-etiq-n">${jamais}</span></button>`;
  const trier = sourceDesFiltres().filter((p) => !estTriee(p)).length;
  const atrier = trier || f.atrier ? `<button type="button" class="pht-etiq" data-filtre-atrier data-etat="${f.atrier ? 'tout' : 'rien'}"
      aria-pressed="${f.atrier}">Pas triée <span class="pht-etiq-n">${trier}</span></button>` : '';
  const periodes = Object.entries(PERIODES).map(([cle, nom]) => `<button type="button" class="pht-etiq" data-filtre-depuis="${cle}"
      data-etat="${f.depuis === cle ? 'tout' : 'rien'}" aria-pressed="${f.depuis === cle}">${nom}</button>`).join('');
  return { etoiles, publication: publication + atrier, periodes };
}

function gabaritFiltres() {
  const f = F();
  const m = enMatch();
  const { etoiles, publication, periodes } = attributsDeFiltre();
  const blocs = Object.fromEntries(famillesDeFiltres().map(({ cle, nom, options }) =>
    [nom, blocFiltre(nom, options.map(([v, mot, n]) => puceFiltre(cle, v, mot, n)).join(''))]));
  const bloc = (nom) => blocs[nom] ?? '';
  return `
    ${filtresPoses()}
    ${m ? '' : blocDesCollections()}
    ${blocFiltre('Publication et tri', publication)}
    ${m ? '' : blocFiltre('Récemment', periodes)}
    ${bloc('Période')}
    ${bloc('Compétition')}
    <div class="pht-tri-famille">
      <p class="pht-tri-titre">Note ${f.note ? `<span class="pht-tri-note-mixte">${f.note} et plus</span>` : ''}</p>
      <div class="pht-etoiles">${etoiles}</div>
    </div>
    ${FAMILLES.map(({ nom }) => bloc(nom)).join('')}
    ${bloc('Qui est dessus')}
    ${bloc('Format')}
    ${bloc('Match')}`;
}

// LA BARRE DE FILTRES DE L'ORDINATEUR, UNE SEULE LIGNE EN HAUT DES PHOTOS
// (25 novembre 2026, demande de Noé) : les étoiles, puis un menu déroulant par
// famille — la compétition, le match et le tri ferment la marche. Pas de
// « Période » : « Récemment » y répond. Elle ne se montre qu'au-dessus d'une
// grille.
function menusDeFiltres() {
  const f = F();
  const m = enMatch();
  const familles = famillesDeFiltres().filter((x) => x.cle !== 'mois')
    .map(({ cle, nom, options }) => ({
      nom,
      options: options.map(([v, mot, n]) => ({ attributs: `data-filtre="${cle}" data-valeur="${echapper(v)}"`, mot, n, pris: f[cle].has(v) })),
    }));
  const aLaFin = ['Compétition', 'Match'];
  const source = sourceDesFiltres();
  return [
    m ? null : { nom: 'Récemment', seul: true, options: Object.entries(PERIODES).map(([c, mot]) =>
      ({ attributs: `data-filtre-depuis="${c}"`, mot, pris: f.depuis === c })) },
    ...familles.filter((x) => !aLaFin.includes(x.nom)),
    ...aLaFin.map((nom) => familles.find((x) => x.nom === nom)),
    { nom: 'Publication et tri', options: [
      { attributs: 'data-filtre-jamais', mot: 'Jamais publiée', n: source.filter((p) => !foisPubliee(p)).length, pris: f.jamais },
      { attributs: 'data-filtre-atrier', mot: 'Pas triée', n: source.filter((p) => !estTriee(p)).length, pris: f.atrier },
    ] },
  ].filter(Boolean);
}

function barreDeFiltres() {
  if (!lr.filtres || !['grille', 'deux'].includes(lr.forme)) return '';
  const menus = menusDeFiltres();
  const boutons = menus.map(({ nom, options }) => {
    const pris = options.filter((o) => o.pris);
    // Le menu garde SON nom et compte ce qui est posé : sa largeur ne bouge pas,
    // et la ligne ne pousse personne dehors.
    return `<button type="button" class="lr-menu-bouton${pris.length ? ' pris' : ''}" data-lr="menu" data-valeur="${echapper(nom)}"
        aria-expanded="${lr.menu === nom}" aria-label="${echapper(pris.length ? `${nom} : ${pris.map((o) => o.mot).join(', ')}` : nom)}"
        title="${echapper(pris.length ? pris.map((o) => o.mot).join(', ') : nom)}"><span>${echapper(nom)}</span>${pris.length ? `<span class="pht-pli-n">${pris.length}</span>` : svg('droite', 12)}</button>`;
  }).join('');
  const ouvert = menus.find((x) => x.nom === lr.menu);
  return `<div class="lr-filtres" role="region" aria-label="Filtres">
      <div class="lr-filtres-ligne" data-lr-ligne>
        <div class="pht-etoiles" role="group" aria-label="Note">${attributsDeFiltre().etoiles}</div>
        <span class="lr-trait" aria-hidden="true"></span>
        ${boutons}
        ${nbFiltres() ? '<button type="button" class="lr-effacer" data-pht="effacer-filtres" aria-label="Effacer tous les filtres" title="Effacer tous les filtres">' + svg('fermer', 15) + '</button>' : ''}
      </div>
      ${ouvert ? `<div class="lr-menu" role="group" aria-label="${echapper(ouvert.nom)}" data-lr-colonne="${echapper(ouvert.nom)}">
          ${ouvert.options.map((o) => `<button type="button" class="pht-menu-option" ${o.attributs} data-etat="${o.pris ? 'tout' : 'rien'}"
            aria-pressed="${Boolean(o.pris)}"><span class="pht-menu-coche${ouvert.seul ? ' ronde' : ''}" aria-hidden="true"></span><span class="pht-menu-nom">${echapper(o.mot)}</span>${
            o.n === undefined ? '' : `<span class="pht-menu-n">${o.n}</span>`}</button>`).join('')}
        </div>` : ''}
    </div>`;
}

// Le menu tombe sous son bouton, sans sortir de la barre.
function placerLeMenu() {
  const menu = hote?.querySelector('.lr-menu');
  const bouton = hote?.querySelector('.lr-menu-bouton[aria-expanded="true"]');
  if (!menu || !bouton) return;
  const barre = menu.parentElement;
  const x = bouton.getBoundingClientRect().left - barre.getBoundingClientRect().left;
  menu.style.left = `${Math.max(8, Math.min(x, barre.clientWidth - menu.offsetWidth - 8))}px`;
}
function fermerLeMenu() {
  if (!lr.menu) return false;
  const nom = lr.menu;
  lr.menu = null;
  redessinerSurPlace();
  hote?.querySelector(`.lr-menu-bouton[data-valeur="${CSS.escape(nom)}"]`)?.focus({ preventScroll: true });
  return true;
}

// LES FILTRES SONT OUVERTS SUR ORDINATEUR, REPLIÉS SUR TÉLÉPHONE : à côté des
// photos ils ne cachent rien ; au-dessus, ils prendraient tout l'écran. Ensuite
// ils restent comme Noé les a laissés.
const filtresOuverts = () => etat.filtresOuverts ?? window.matchMedia('(min-width: 60rem)').matches;

// LA TÊTE DE LA PHOTOTHÈQUE : ce qu'elle contient, et ses trois portes — les
// albums, la pile à trier, l'import.
function enteteDeLaPhototheque() {
  const total = etat.photos.length;
  const aTrier = pileATrier().length;
  return `<div class="pht-tete-liste">
      ${/* Le compte et la place sont descendus sur la ligne des outils
         (demande de Noé) ; la tête ne garde que ses trois portes. */ total ? ''
        : '<p class="pht-intro">Importe les photos retouchées d’un match : elles te suivront sur tous tes appareils.</p>'}
      ${etat.choisirMatch ? '' : `<span class="pht-gestes">
        ${total ? `<a class="car-puce pht-chercher" href="#yuno/phototheque/${ALBUMS}">${svg('albums', 14)}<span>Albums</span></a>` : ''}
        ${aTrier ? `<button type="button" class="car-bouton-or" data-pht="pile"><span>À trier · <span class="chiffre">${aTrier}</span></span></button>` : ''}
        ${/* L'OR VA À CE QUI ATTEND (audit du 25 novembre) : tant qu'il reste des
           photos à trier, l'import se contente de son icône. */ aTrier
    ? `<button type="button" class="car-puce pht-importer" data-pht="importer" aria-label="Importer des photos" title="Importer des photos">${svg('importer')}</button>`
    : `<button type="button" class="car-bouton-or" data-pht="importer">${svg('importer')}<span>Importer des photos</span></button>`}
      </span>`}
    </div>`;
}

// LA RANGÉE D'OUTILS, SOUS LE COMPTE DES PHOTOS (21 novembre 2026, demande de
// Noé, Notion en référence) : trois icônes au lieu de trois rangées de mots.
//   — les FILTRES (sur téléphone seulement : sur ordinateur, ils restent dans
//     leur colonne, à gauche des photos) ; le chiffre dit combien sont posés ;
//   — le TRI, qui ouvre son menu : les plus récentes, les mieux notées ;
//   — la SÉLECTION, qui s'allume quand elle est en cours.
function rangeeDOutils(nombre, nbFiltresPoses) {
  const m = enMatch();
  const ordres = m
    ? [['match', 'L’ordre du match'], ['notees', 'Les mieux notées']]
    : [['recentes', 'Les plus récentes'], ['anciennes', 'Les plus anciennes'],
      ['notees', 'Les mieux notées'], ['hasard', 'Au hasard']];
  const ordre = m ? etat.ordreMatch : etat.ordre;
  return `<div class="pht-outils" role="toolbar" aria-label="Outils de la recherche">
      <button type="button" class="car-icone pht-outil pht-outil-filtres${m ? ' pht-partout' : ''}${etat.filtresTel || nbFiltresPoses ? ' actif' : ''}"
        data-pht="filtres-tel" aria-expanded="${etat.filtresTel}" aria-label="Filtres${nbFiltresPoses ? ` (${nbFiltresPoses})` : ''}" title="Filtres">
        ${svg('filtre')}${nbFiltresPoses ? `<span class="pht-outil-n">${nbFiltresPoses}</span>` : ''}</button>
      <span class="pht-outil-ordre">
        <button type="button" class="car-icone pht-outil${etat.menuOrdre ? ' actif' : ''}" data-pht="ordre-menu"
          aria-expanded="${etat.menuOrdre}" aria-label="Trier : ${ordres.find(([c]) => c === ordre)?.[1] ?? ''}"
          title="Trier">${svg('ordre')}</button>
        ${etat.menuOrdre ? `<span class="pht-ordre-menu" role="menu">${ordres.map(([cle, nom]) =>
          `<button type="button" class="pht-menu-option" role="menuitemradio" data-ordre="${cle}" data-etat="${ordre === cle ? 'tout' : 'rien'}"
             aria-checked="${ordre === cle}"><span class="pht-menu-coche" aria-hidden="true"></span><span class="pht-menu-nom">${nom}</span></button>`).join('')}</span>` : ''}
      </span>
      ${etat.pour ? '' : `<button type="button" class="car-icone pht-outil${etat.modeSelection ? ' actif' : ''}" data-pht="selectionner"
          aria-pressed="${etat.modeSelection}" aria-label="${etat.modeSelection ? 'Terminer la sélection' : 'Sélectionner'}"
          title="${etat.modeSelection ? 'Terminer la sélection' : 'Sélectionner'}"${nombre ? '' : ' disabled'}>${svg('choisir')}</button>
        ${etat.modeSelection ? `<button type="button" class="car-puce" data-pht="tout" data-pht-sel-compte>${toutEstChoisi() ? 'Tout désélectionner' : 'Tout sélectionner'}</button>` : ''}`}
    </div>`;
}

function gabaritRecherche() {
  if (!etat.photos) return '<p class="car-attente">Un instant…</p>';
  const liste = resultats();
  const n = nbFiltres();
  return `
    ${etat.pour
      ? `<div class="car-tete">
          <a class="car-retour" href="#yuno/phototheque" data-pht="annuler-pour" aria-label="Revenir" title="Revenir">${svg('retour', 20)}</a>
          <div class="pht-titre">${enteteDuChoix()}</div>
        </div>`
      : enteteDeLaPhototheque()}
    ${etat.pour ? '' : gabaritChoix()}
    <div class="pht-recherche">
      <details class="pht-filtres" data-pht-filtres${filtresOuverts() ? ' open' : ''}>
        <summary>
          <span>Filtres${n ? ` · <span class="chiffre">${n}</span>` : ''}</span>
          ${n ? '<button type="button" class="car-puce car-puce-mini" data-pht="effacer-filtres">Tout effacer</button>' : ''}
        </summary>
        <div class="pht-tri pht-filtres-corps">${gabaritFiltres()}</div>
      </details>
      <div class="pht-resultats">
        <div class="pht-res-tete">
          ${/* LE COMPTE ET LA PLACE, À GAUCHE DES OUTILS (demande de Noé). Filtré,
             le compte dit ce qui reste sur le total. */ etat.pour
            ? `<p class="car-petit-titre pht-res-compte"><span class="chiffre">${liste.length}</span> photo${liste.length > 1 ? 's' : ''}</p>`
            : `<p class="pht-res-compte pht-res-total">${n
                ? `<span><span class="chiffre">${liste.length}</span> sur ${etat.photos.length}</span>`
                : `<span><span class="chiffre">${etat.photos.length}</span> photo${etat.photos.length > 1 ? 's' : ''}</span>`}</p>`}
          ${rangeeDOutils(liste.length, n)}
        </div>
        ${etat.filtresTel ? `<div class="pht-filtres-tel">
            ${n ? '<button type="button" class="car-puce car-puce-mini pht-effacer" data-pht="effacer-filtres">Tout effacer</button>' : ''}
            <div class="pht-tri pht-filtres-corps">${gabaritFiltres()}</div>
          </div>` : ''}
        ${liste.length
          ? grilleEnPaquets(liste, tuile, etat.modeSelection ? 'en-selection' : '')
          : `<p class="car-liste-vide">${etat.photos.length ? 'Aucune photo ne coche tout. Retire un filtre.' : 'Importe un match : ses photos se chercheront ici.'}</p>`}
        ${gabaritBarreSelection()}
        ${/* LA PLACE PRISE, TOUT EN BAS, APRÈS LES PHOTOS (demande de Noé) : on la
           consulte, on ne la regarde pas à chaque ouverture. */ etat.pour ? '' : `<div class="pht-pied-place">${gabaritPlace()}</div>`}
      </div>
    </div>`;
}

// Un filtre touché : la grille se redessine, la sélection garde ce qui reste
// visible — une photo qu'on ne voit plus ne peut pas rester choisie.
function changerFiltres(maj) {
  maj();
  const visibles = new Set(photosAffichees().map((p) => p.id));
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
  etat.filtresMatch.etiquettes.delete(id);
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
  if (contexte === 'loupe') return [photo(lr.loupe)].filter(Boolean);
  if (contexte === 'cmp0' || contexte === 'cmp1') return [photo(lr.paire[Number(contexte[3])])].filter(Boolean);
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

function etoilesTri(contexte) {
  const cibles = ciblesDu(contexte);
  const notes = new Set(cibles.map((p) => p.note ?? null));
  const note = notes.size === 1 ? [...notes][0] : null;
  return [1, 2, 3, 4, 5].map((k) =>
    `<button type="button" class="pht-etoile${note && k <= note ? ' pleine' : ''}" data-tri-note="${k}"
       aria-label="${k} étoile${k > 1 ? 's' : ''}" aria-pressed="${note === k}">
       <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>
     </button>`).join('');
}

// LES ÉTOILES SUR LA PHOTO, en bas et centrées (21 novembre 2026, demande de
// Noé) : dans la visionneuse, la note quitte le panneau — c'est le geste le plus
// fréquent, il se fait sur ce qu'on regarde, et il rend sa place aux étiquettes.
// Une pastille sombre les porte : elles se lisent sur un ciel comme sur une nuit.
function etoilesSurLaPhoto() {
  return `<div class="pht-etoiles-sur" data-tri-etoiles="vue" role="group" aria-label="La note">${etoilesTri('vue')}</div>`;
}

// SUR TÉLÉPHONE, LES ÉTIQUETTES SONT DES MENUS DÉROULANTS (21 novembre 2026,
// demande de Noé : « inverse le style et ce que ça raconte, range les étiquettes
// en fonction de celles qui sont les plus utilisées, et ce doit être des menus
// déroulants côte à côte sur une même ligne — sur téléphone uniquement »).
//
// Une ligne de trois pastilles — ce que ça raconte, le style, qui — et, sous
// elle, la liste de la famille qu'on a ouverte. Le geste coûte un appui de plus,
// mais tout le panneau tient en une ligne : la photo garde l'écran.
const surTelephone = () => window.matchMedia('(max-width: 59.99rem)').matches;
const ouvertQui = () => Boolean(etat.quiOuvert || etat.recherche);
// Seul le style garde son menu : « ce que ça raconte » est sur sa ligne.
const FAMILLES_TELEPHONE = [
  { cle: 'style', nom: 'Le style' },
];

// Le nombre de photos qui portent chaque étiquette : c'est lui qui range.
function usages() {
  const n = new Map();
  for (const p of etat.photos ?? []) for (const id of p.etiquettes ?? []) n.set(id, (n.get(id) ?? 0) + 1);
  return n;
}

// LES DIX DERNIÈRES PHOTOS ÉTIQUETÉES (21 novembre 2026, demande de Noé : les
// plus utilisées « sur les 10 dernières photos » passent devant). Un match se
// trie en série : ce qu'on vient de poser sur les dix précédentes est ce qu'on
// va reposer sur la suivante. La liste se garde sur l'appareil, d'une visite à
// l'autre — une commodité de saisie, rien qui dise la vie de Noé.
const CLE_RECENTES = 'pht-recentes';
let recentes = (() => {
  try { return JSON.parse(localStorage.getItem(CLE_RECENTES) ?? '[]'); } catch { return []; }
})();
function noterRecentes(ids) {
  recentes = [...ids, ...recentes.filter((x) => !ids.includes(x))].slice(0, 10);
  try { localStorage.setItem(CLE_RECENTES, JSON.stringify(recentes)); } catch { /* sans mémoire, tant pis */ }
}
// Le rang d'une étiquette : son usage sur les dix dernières, puis son usage total.
function rangeurDesEtiquettes() {
  const total = usages();
  const recent = new Map();
  for (const id of recentes) {
    for (const e of photo(id)?.etiquettes ?? []) recent.set(e, (recent.get(e) ?? 0) + 1);
  }
  return (a, b) => (recent.get(b.id) ?? 0) - (recent.get(a.id) ?? 0)
    || (total.get(b.id) ?? 0) - (total.get(a.id) ?? 0)
    || a.ordre - b.ordre;
}

// L'ORDRE SE FIGE LE TEMPS D'UNE PHOTO : poser une étiquette nourrit les « dix
// dernières », et sans ce gel la ligne se réordonnerait sous le doigt à chaque
// toucher. Il se recalcule en passant à la photo suivante.
let ordreFige = { cle: null, ids: [] };

function panneauTelephone(contexte, cibles, quiOuvert) {
  const compte = usages();
  const cleCibles = cibles.map((p) => p.id).join(',');
  if (ordreFige.cle !== cleCibles) {
    const r = rangeurDesEtiquettes();
    ordreFige = { cle: cleCibles, ids: [...(etat.etiquettes ?? [])].sort(r).map((e) => e.id) };
  }
  const ranger = (a, b) => {
    const ia = ordreFige.ids.indexOf(a.id);
    const ib = ordreFige.ids.indexOf(b.id);
    // Une étiquette créée à l'instant n'est pas dans l'ordre figé : elle se
    // range en tête, là où l'œil vient de la poser.
    return (ia < 0 ? -1 : ia) - (ib < 0 ? -1 : ib);
  };
  const CHEVRON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const motsDe = (cle) => (etat.etiquettes ?? [])
    .filter((e) => e.famille === cle)
    .sort(ranger);

  // « CE QUE ÇA RACONTE », SUR UNE LIGNE QUI GLISSE (demande de Noé) : toutes
  // ses étiquettes en puces, les plus utilisées d'abord ; celles qui ne tiennent
  // pas se découvrent en faisant glisser la ligne.
  const recit = motsDe('recit').map((e) =>
    puce('tri-etiquette', e.id, e.nom, etatDans(cibles, 'etiquettes', e.id))).join('');
  const ajoutRecit = etat.ajout === 'recit'
    ? `<input class="pht-etiq-champ pht-ligne-champ" data-tri-nouvelle="recit" maxlength="40" autocomplete="off"
         placeholder="Nouvelle étiquette" aria-label="Nouvelle étiquette : ce que ça raconte">`
    : `<button type="button" class="pht-etiq pht-etiq-plus" data-tri-ajouter="recit"
         aria-label="Ajouter une étiquette : ce que ça raconte">${svg('ajouter', 14)}</button>`;

  const pastilles = FAMILLES_TELEPHONE.map(({ cle, nom }) => {
    const pris = motsDe(cle).filter((e) => etatDans(cibles, 'etiquettes', e.id) !== 'rien');
    const ouvert = etat.menuOuvert === cle;
    const libelle = pris.length ? `${pris[0].nom}${pris.length > 1 ? ` +${pris.length - 1}` : ''}` : nom;
    return `<button type="button" class="pht-menu${ouvert ? ' ouvert' : ''}${pris.length ? ' pris' : ''}" data-tri-menu="${cle}"
        aria-expanded="${ouvert}" aria-label="${echapper(nom)}${pris.length ? ` : ${echapper(pris.map((e) => e.nom).join(', '))}` : ''}">
        <span class="pht-menu-mot">${echapper(libelle)}</span>${CHEVRON}</button>`;
  }).join('');

  let liste = '';
  if (etat.menuOuvert) {
    const cle = etat.menuOuvert;
    const options = motsDe(cle).map((e) => {
      const st = etatDans(cibles, 'etiquettes', e.id);
      return `<button type="button" class="pht-menu-option" data-tri-etiquette="${e.id}" data-etat="${st}"
          aria-pressed="${st === 'tout' ? 'true' : st === 'partie' ? 'mixed' : 'false'}">
          <span class="pht-menu-coche" aria-hidden="true"></span><span class="pht-menu-nom">${echapper(e.nom)}</span>
          <span class="pht-menu-n">${compte.get(e.id) ?? 0}</span></button>`;
    }).join('');
    const ajout = etat.ajout === cle
      ? `<input class="pht-etiq-champ pht-menu-champ" data-tri-nouvelle="${cle}" maxlength="40" autocomplete="off"
           placeholder="Nouvelle étiquette" aria-label="Nouvelle étiquette">`
      : `<button type="button" class="pht-menu-option pht-menu-ajout" data-tri-ajouter="${cle}">
           ${svg('ajouter', 14)}<span class="pht-menu-nom">Nouvelle étiquette</span></button>`;
    liste = `<div class="pht-menu-liste" role="group">${options}${ajout}</div>`;
  }

  const presents = new Set(cibles.flatMap((p) => [...p.personnes]));
  const personnes = [...presents].map((id) => {
    const c = (etat.personnes ?? []).find((x) => x.id === id);
    return c ? puce('tri-personne', id, c.nom, etatDans(cibles, 'personnes', id)) : '';
  }).join('');

  return `<div class="pht-tri pht-tri-telephone${contexte === 'vue' ? ' pht-tri-vue' : ''}" data-tri-contexte="${contexte}">
      ${contexte === 'vue' ? '' : `<div class="pht-etoiles">${etoilesTri(contexte)}</div>`}
      ${rangeeDesPropositions(contexte, cibles)}
      <div class="pht-ligne-recit" role="group" aria-label="Ce que ça raconte">${recit}${ajoutRecit}</div>
      <div class="pht-tri-menus">
        ${pastilles}
        ${quiOuvert ? '' : `<button type="button" class="pht-menu pht-menu-qui" data-tri-qui-ouvrir aria-label="Ajouter un joueur ou un club">${svg('ajouter', 13)}<span class="pht-menu-mot">Qui</span></button>`}
        ${/* LES PERSONNES POSÉES PROLONGENT LA SECONDE LIGNE (demande de Noé) :
           pas de troisième ligne ; elle glisse si elle dépasse. */ personnes}
      </div>
      ${liste}
      ${quiOuvert ? `<div class="pht-qui">
          <input class="pht-etiq-champ pht-qui-champ" data-tri-qui value="${echapper(etat.recherche)}"
            autocomplete="off" spellcheck="false" placeholder="Un joueur, un club…" aria-label="Ajouter un joueur ou un club">
          <div class="pht-qui-propositions" data-tri-propositions>${propositions(contexte)}</div>
        </div>` : ''}
    </div>`;
}

// --- Les propositions, dans la pile (25 novembre 2026, demande de Noé) ------------------------
//
// Une rangée en tête du tri, en POINTILLÉ — le signe du hub pour « pas encore
// posé ». Dans la pile, une proposition SÛRE est cochée d'avance et part avec
// « Trié » ; la toucher l'écarte. Une PISTE attend qu'on la touche. Hors de la
// pile il n'y a pas de geste pour valider : toucher pose tout de suite.
const choixDesPropositions = new Map(); // photo → Map(clé → voulue ou non)
const cleProp = (s) => `${s.quoi}:${s.id}`;

function propositionsDe(p) {
  if (!p || !etat.photos) return [];
  return propositionsPour(p, { photos: etat.photos, etiquettes: etat.etiquettes ?? [], personnes: etat.personnes ?? [] });
}
const estVoulue = (p, s) => choixDesPropositions.get(p.id)?.get(cleProp(s)) ?? s.arme;
const propositionsVoulues = (p) => propositionsDe(p).filter((s) => estVoulue(p, s));

const POURQUOI = { rafale: 'Même rafale', image: 'Lu dans l’image', match: 'Vu dans ce match' };

function rangeeDesPropositions(contexte, cibles) {
  let liste = [];
  let enPile = false;
  if (contexte === 'vue' || contexte === 'loupe') {
    enPile = contexte === 'vue' && Boolean(etat.pile);
    liste = propositionsDe(cibles[0]);
  } else {
    // UN LOT : les personnes du match, si tout le lot en vient. C'est le joueur
    // proposé à l'import, dont les photos arrivent sélectionnées.
    const matchs = new Set(cibles.map((p) => p.evenement_id ?? null));
    const id = [...matchs][0];
    if (matchs.size === 1 && id) {
      liste = personnesDuMatch(id, matchDe(id)?.titre, etat.photos ?? [], etat.personnes ?? [])
        .filter((x) => !cibles.every((p) => p.personnes.has(x)))
        .map((x) => ({ quoi: 'personnes', id: x, nom: (etat.personnes ?? []).find((c) => c.id === x)?.nom ?? '', arme: false, pourquoi: 'match' }));
    }
  }
  if (!liste.length) return '';
  return `<div class="pht-props" role="group" aria-label="Propositions">
      <span class="pht-props-mot">Proposé</span>
      ${liste.map((s) => {
        const voulue = enPile && estVoulue(cibles[0], s);
        return `<button type="button" class="pht-prop${voulue ? ' voulue' : ''}" data-tri-prop="${cleProp(s)}"
          ${enPile ? `aria-pressed="${voulue}"` : ''} title="${POURQUOI[s.pourquoi]}"
          aria-label="${echapper(s.nom)}, ${POURQUOI[s.pourquoi].toLowerCase()}">${voulue ? svg('cocheSimple', 13) : svg('ajouter', 13)}<span>${echapper(s.nom)}</span></button>`;
      }).join('')}
    </div>`;
}

function toucherUneProposition(contexte, cle, ancre) {
  const [quoi, id] = [cle.slice(0, cle.indexOf(':')), cle.slice(cle.indexOf(':') + 1)];
  if (contexte === 'vue' && etat.pile) {
    const p = photo(etat.ouverte);
    const s = propositionsDe(p).find((x) => cleProp(x) === cle);
    if (!s) return;
    const choix = choixDesPropositions.get(p.id) ?? new Map();
    choix.set(cle, !estVoulue(p, s));
    choixDesPropositions.set(p.id, choix);
    redessinerTri();
    return;
  }
  if (quoi === 'personnes') poserPersonne(contexte, id, ancre);
  else basculer(contexte, 'etiquettes', id, ancre);
}

// « Trié » pose ce qui est coché. L'écran d'abord ; ce qui n'a pas pu s'écrire
// est retiré, et on le dit.
function accepterLesPropositions(p) {
  const voulues = propositionsVoulues(p);
  choixDesPropositions.delete(p.id);
  if (!voulues.length) return;
  if (voulues.some((s) => s.quoi === 'etiquettes')) noterRecentes([p.id]);
  for (const s of voulues) {
    p[s.quoi].add(s.id);
    if (!p.enBase && p.envoi !== 'fait') continue; // partira avec la photo
    const poser = s.quoi === 'etiquettes' ? api.etiqueterPhotos : api.relierPersonne;
    poser([p.id], s.id).catch((e) => {
      console.error('Proposition non gardée', e);
      p[s.quoi].delete(s.id);
      messageCourt(`« ${s.nom} » n’a pas pu être gardé sur ${p.nom}.`);
    });
  }
}

function panneauTri(contexte) {
  const cibles = ciblesDu(contexte);
  if (!cibles.length) return '';
  const notes = new Set(cibles.map((p) => p.note ?? null));
  const etoiles = etoilesTri(contexte);
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

  if (surTelephone()) return panneauTelephone(contexte, cibles, ouvertQui());

  // « QUI EST DESSUS » SE REPLIE EN UNE PUCE : le champ ne sert que le temps
  // d'une saisie, et il prenait une ligne entière sur chaque photo. Les
  // personnes déjà posées restent visibles, en puces, à côté de lui.
  const ouvert = etat.quiOuvert || etat.recherche;
  const qui = ouvert
    ? `<div class="pht-qui">
        <input class="pht-etiq-champ pht-qui-champ" data-tri-qui value="${echapper(etat.recherche)}"
          autocomplete="off" spellcheck="false" placeholder="Un joueur, un club…"
          aria-label="Ajouter un joueur ou un club">
        <div class="pht-qui-propositions" data-tri-propositions>${propositions(contexte)}</div>
      </div>`
    : '';
  return `<div class="pht-tri${contexte === 'vue' ? ' pht-tri-vue' : ''}" data-tri-contexte="${contexte}">
      ${rangeeDesPropositions(contexte, cibles)}
      <div class="pht-tri-famille">
        <p class="pht-tri-titre">La note ${melange}</p>
        <div class="pht-etoiles">${etoiles}</div>
      </div>
      ${familles}
      <div class="pht-tri-famille">
        <p class="pht-tri-titre">Qui est dessus</p>
        <div class="pht-etiqs">${puces}${ouvert ? '' : `<button type="button" class="pht-etiq pht-etiq-plus pht-etiq-qui" data-tri-qui-ouvrir
            aria-label="Ajouter un joueur ou un club">${svg('ajouter', 14)}<span>Qui</span></button>`}</div>
        ${qui}
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
    // La ligne qui glisse garde sa place : sans ça, toucher la huitième puce
    // ramènerait la ligne au début.
    const defileP = el.querySelector('.pht-props')?.scrollLeft ?? 0;
    const defile = el.querySelector('.pht-ligne-recit')?.scrollLeft ?? 0;
    const defile2 = el.querySelector('.pht-tri-menus')?.scrollLeft ?? 0;
    const champ = document.activeElement?.matches?.('[data-tri-nouvelle], [data-tri-qui]')
      && el.contains(document.activeElement) ? document.activeElement : null;
    const repere = !champ && el.contains(document.activeElement) ? repereDe(document.activeElement) : null;
    const quel = champ ? (champ.matches('[data-tri-qui]') ? '[data-tri-qui]' : `[data-tri-nouvelle="${champ.dataset.triNouvelle}"]`) : null;
    el.outerHTML = panneauTri(contexte);
    const props = document.querySelector(`[data-tri-contexte="${contexte}"] .pht-props`);
    if (props) props.scrollLeft = defileP;
    const ligne = document.querySelector(`[data-tri-contexte="${contexte}"] .pht-ligne-recit`);
    if (ligne) ligne.scrollLeft = defile;
    const ligne2 = document.querySelector(`[data-tri-contexte="${contexte}"] .pht-tri-menus`);
    if (ligne2) ligne2.scrollLeft = defile2;
    if (repere) document.querySelector(`[data-tri-contexte="${contexte}"] ${repere}`)?.focus({ preventScroll: true });
    if (quel) {
      const nouveau = document.querySelector(`[data-tri-contexte="${contexte}"] ${quel}`);
      nouveau?.focus();
      nouveau?.setSelectionRange?.(nouveau.value.length, nouveau.value.length);
    }
  });
  document.querySelectorAll('[data-tri-etoiles]').forEach((el) => {
    const repere = el.contains(document.activeElement) ? repereDe(document.activeElement) : null;
    el.innerHTML = etoilesTri(el.dataset.triEtoiles);
    if (repere) el.querySelector(repere)?.focus({ preventScroll: true });
  });
  for (const p of etat.photos ?? []) majTuile(p);
  majBarreSelection();
  // En pile, noter une photo la compte triée : le compte baisse aussitôt.
  const rang = etat.pile ? visionneuse?.querySelector('.pht-vue-rang .chiffre') : null;
  if (rang) rang.textContent = String(suivanteDansLaPile().length);
}

const rangDansLeChoix = (p) => {
  if (etat.pourGenre !== 'parution' || !etat.selection.has(p.id)) return '';
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
    if (p.prise_le !== undefined) t.setAttribute('aria-label', nomDeLaTuile(p));
    if (etat.modeSelection) t.setAttribute('aria-pressed', String(etat.selection.has(p.id)));
    else t.removeAttribute('aria-pressed');
  });
}

const badgeNote = (p) => (p.note
  ? `<span class="pht-note" aria-label="${p.note} étoile${p.note > 1 ? 's' : ''}">★ ${p.note}</span>` : '');

// --- Annuler (⌘Z) — les vingt derniers gestes (25 novembre 2026, audit) --------
//
// On ne retient pas les GESTES mais ce qu'ils ont CHANGÉ : la note, le tri, les
// étiquettes et les personnes de chaque photo, avant et après. Une seule
// mécanique annule donc une étoile, un collage sur quarante photos ou un « Trié »
// et ses propositions. Elle vaut pour la visite, rien n'est gardé au-delà.
const historique = [];
const cliche = (photos) => photos.map((p) => ({
  id: p.id, note: p.note ?? null, triee: Boolean(p.triee),
  etiquettes: new Set(p.etiquettes), personnes: new Set(p.personnes),
}));

function garderLeGeste(avant, mot) {
  const geste = { mot, avant, apres: cliche(avant.map((a) => photo(a.id)).filter(Boolean)), ecriture: null };
  historique.push(geste);
  if (historique.length > 20) historique.shift();
  return geste;
}
const oublierLeGeste = (geste) => {
  const k = historique.indexOf(geste);
  if (k >= 0) historique.splice(k, 1);
};

// Poser sur les photos l'écart entre deux clichés, et rendre ce qu'il faut écrire.
function poserLEcart(depart, arrivee) {
  const groupes = new Map();
  const noter = (cle, faire, p) => {
    if (!p.enBase && p.envoi !== 'fait') return;
    if (!groupes.has(cle)) groupes.set(cle, { faire, ids: [] });
    groupes.get(cle).ids.push(p.id);
  };
  for (const d of depart) {
    const a = arrivee.find((x) => x.id === d.id);
    const p = photo(d.id);
    if (!a || !p) continue;
    if (a.note !== d.note) { p.note = a.note; noter(`n${a.note}`, (ids) => api.noterPhotos(ids, a.note), p); }
    if (a.triee !== d.triee) { p.triee = a.triee; noter(`t${a.triee}`, (ids) => api.marquerTriees(ids, a.triee), p); }
    for (const [quoi, poser, oter] of [['etiquettes', api.etiqueterPhotos, api.desetiqueterPhotos],
      ['personnes', api.relierPersonne, api.delierPersonne]]) {
      for (const id of a[quoi]) if (!d[quoi].has(id)) { p[quoi].add(id); noter(`+${id}`, (ids) => poser(ids, id), p); }
      for (const id of d[quoi]) if (!a[quoi].has(id)) { p[quoi].delete(id); noter(`-${id}`, (ids) => oter(ids, id), p); }
    }
  }
  return [...groupes.values()];
}

async function annulerLeDernier() {
  const geste = historique.pop();
  if (!geste) { messageCourt('Rien à annuler.'); return; }
  if (geste.rendre) { geste.rendre(); return; }
  const ecritures = poserLEcart(geste.apres, geste.avant);
  // Une photo marquée « triée » revient devant, dans la pile.
  const revenue = etat.pile ? geste.avant.find((a, k) => geste.apres[k]?.triee && !a.triee) : null;
  if (revenue) {
    etat.listeVue = [revenue.id, ...etat.listeVue.filter((id) => id !== revenue.id)];
    ouvrir(revenue.id);
  }
  redessinerTri();
  messageCourt(`Annulé : ${geste.mot}.`);
  try {
    await geste.ecriture;
    await Promise.all(ecritures.map(({ faire, ids }) => faire(ids)));
  } catch (e) {
    console.error('Annulation non gardée', e);
    poserLEcart(geste.avant, geste.apres);
    redessinerTri();
    bulle("Ce n'est pas enregistré", 'L’annulation n’a pas pu être gardée.');
  }
}

// --- Retirer, avec huit secondes pour revenir ----------------------------------
//
// L'écran d'abord ; la base et le fichier en ligne n'apprennent le retrait
// qu'ensuite. Fermer la page avant laisse la photo en place : dans le doute, on
// garde.
const retraits = new Set();
function retirerAvecRetour(cibles, ancre) {
  const ids = new Set(cibles.map((p) => p.id));
  const places = cibles.map((p) => [etat.photos.indexOf(p), p]).sort((a, b) => a[0] - b[0]);
  etat.photos = etat.photos.filter((p) => !ids.has(p.id));
  const n = cibles.length;
  const mot = `le retrait de ${n} photo${n > 1 ? 's' : ''}`;
  const remettre = () => {
    const liste = [...etat.photos];
    for (const [k, p] of places) if (!liste.some((q) => q.id === p.id)) liste.splice(Math.min(k, liste.length), 0, p);
    etat.photos = liste;
    retraits.delete(retrait);
    oublierLeGeste(retrait);
    dessiner();
  };
  const retrait = { mot, ids, avant: [], apres: [] };
  const message = messageAnnulable(`${n} photo${n > 1 ? 's' : ''} retirée${n > 1 ? 's' : ''}`, 8000, () => retrait.rendre());
  const minuterie = setTimeout(async () => {
    oublierLeGeste(retrait);
    try {
      const enBase = cibles.filter((p) => p.enBase || p.envoi === 'fait').map((p) => p.id);
      if (enBase.length) await api.supprimerPhotos(enBase);
      retraits.delete(retrait);
      for (const p of cibles) if (p.cle) supprimerFichier(p.cle).catch((e) => console.error('Fichier non supprimé', e));
    } catch (e) {
      console.error('Photos non retirées', e);
      remettre();
      bulle("Ce n'est pas passé", n > 1 ? 'Les photos n’ont pas pu être retirées.' : 'La photo n’a pas pu être retirée.', ancre);
    }
  }, 8000);
  retrait.rendre = () => {
    clearTimeout(minuterie);
    message.remove();
    remettre();
    if (n === 1 && etat.ouverte && etat.listeVue.includes(cibles[0].id)) ouvrir(cibles[0].id);
    messageCourt(`Annulé : ${mot}.`);
  };
  retraits.add(retrait);
  historique.push(retrait);
}

// --- Les fenêtres tiennent le focus --------------------------------------------
//
// Elles s'annonçaient modales sans l'être : le clavier restait sur la page du
// dessous. Le reste de la page devient inerte, le focus entre dans la fenêtre, y
// retrouve sa place à chaque redessin, et revient d'où il venait. Un `<dialog>`
// natif aurait caché les messages, qui vivent sur le corps de la page.
function repereDe(el) {
  const c = el?.closest?.('button, a, summary, [data-lr], [data-lr-taille]');
  const attributs = [...(c?.attributes ?? [])].filter((a) => a.name.startsWith('data-') && !['data-etat', 'data-deja'].includes(a.name));
  return attributs.length ? attributs.map((a) => `[${a.name}="${CSS.escape(a.value)}"]`).join('') : null;
}
function isolerLaFenetre() {
  const dessus = [fenetreCarnet, fenetre, visionneuse].find((el) => el?.isConnected) ?? null;
  for (const el of document.body.children) {
    if (el.matches('script, style, .message-court, .bulle-kit')) continue;
    const derriere = Boolean(dessus) && el !== dessus;
    if (derriere && !el.inert) { el.inert = true; el.dataset.phtInerte = ''; }
    else if (!derriere && 'phtInerte' in el.dataset) { el.inert = false; delete el.dataset.phtInerte; }
  }
}
function remplirLaFenetre(el, html) {
  if (el.phtRetour === undefined) el.phtRetour = repereDe(document.activeElement);
  const repere = el.contains(document.activeElement) ? repereDe(document.activeElement) : null;
  el.innerHTML = html;
  isolerLaFenetre();
  const dialogue = el.querySelector('[role="dialog"]');
  if (!dialogue) return;
  dialogue.tabIndex = -1;
  if (repere) el.querySelector(repere)?.focus({ preventScroll: true });
  if (!el.contains(document.activeElement)) dialogue.focus({ preventScroll: true });
}
function quitterLaFenetre(el, prefere = null) {
  el?.remove();
  isolerLaFenetre();
  const cible = (prefere && hote?.querySelector(prefere)) || (el?.phtRetour && document.querySelector(el.phtRetour));
  cible?.focus();
}

// L'ÉCRAN D'ABORD, LE RÉSEAU ENSUITE, et l'état d'avant revient si l'écriture
// échoue. On n'écrit en base que les photos qui y sont déjà : les autres
// reprendront leur tri en arrivant (voir `envoyer`).
async function ecrire({ cibles, appliquer, defaire, appel, ancre, message, mot }) {
  const avant = cliche(cibles);
  appliquer();
  const geste = garderLeGeste(avant, mot ?? 'le dernier geste');
  redessinerTri();
  const ids = cibles.filter((p) => p.enBase || p.envoi === 'fait').map((p) => p.id);
  if (!ids.length) return;
  try {
    geste.ecriture = appel(ids);
    await geste.ecriture;
  } catch (e) {
    console.error(message, e);
    oublierLeGeste(geste);
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
    mot: 'la note',
  });
}

function basculer(contexte, cleDuSet, id, ancre) {
  const cibles = ciblesDu(contexte);
  if (!cibles.length) return;
  const retirer = cibles.every((p) => p[cleDuSet].has(id));
  const avant = cibles.map((p) => p[cleDuSet].has(id));
  const poser = cleDuSet === 'etiquettes' ? api.etiqueterPhotos : api.relierPersonne;
  if (cleDuSet === 'etiquettes' && !retirer) noterRecentes(cibles.map((p) => p.id));
  const oter = cleDuSet === 'etiquettes' ? api.desetiqueterPhotos : api.delierPersonne;
  return ecrire({
    cibles,
    appliquer: () => cibles.forEach((p) => (retirer ? p[cleDuSet].delete(id) : p[cleDuSet].add(id))),
    defaire: () => cibles.forEach((p, i) => (avant[i] ? p[cleDuSet].add(id) : p[cleDuSet].delete(id))),
    appel: (ids) => (retirer ? oter(ids, id) : poser(ids, id)),
    ancre,
    mot: cleDuSet === 'etiquettes' ? `« ${(etat.etiquettes ?? []).find((e) => e.id === id)?.nom ?? 'étiquette'} »` : 'la personne',
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
    const menu = e.target.closest('[data-tri-menu]');
    if (menu) {
      etat.menuOuvert = etat.menuOuvert === menu.dataset.triMenu ? null : menu.dataset.triMenu;
      etat.ajout = null;
      etat.quiOuvert = false;
      redessinerTri();
      return;
    }
    if (e.target.closest('[data-tri-qui-ouvrir]')) {
      etat.menuOuvert = null;
      etat.quiOuvert = true;
      redessinerTri();
      racine.querySelector('[data-tri-qui]')?.focus();
      return;
    }
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
    const prop = e.target.closest('[data-tri-prop]');
    if (prop) {
      toucherUneProposition(prop.closest('[data-tri-contexte]').dataset.triContexte, prop.dataset.triProp, prop);
      return;
    }
    const el = e.target.closest('[data-tri-note], [data-tri-etiquette], [data-tri-personne], [data-tri-ajouter], [data-tri-poser], [data-tri-creer]');
    if (!el) return;
    const porteur = el.closest('[data-tri-contexte], [data-tri-etoiles]');
    const contexte = porteur?.dataset.triContexte ?? porteur?.dataset.triEtoiles;
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
    const pub = etat.pourGenre === 'parution' ? parutionDe(etat.pour) : null;
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
    const pub = etat.pourGenre === 'parution' ? parutionDe(etat.pour) : null;
    const max = pub?.format === 'carrousel' ? MAX_CARROUSEL : null;
    return `<div class="pht-barre-sel" data-pht-barre>
        <span class="pht-barre-texte"><span class="chiffre">${n}</span>${max ? ` / ${max}` : ''} choisie${n > 1 ? 's' : ''}</span>
        <button type="button" class="car-puce" data-pht="annuler-pour">Annuler</button>
        <button type="button" class="car-bouton-or" data-pht="garder-pour">Garder</button>
      </div>`;
  }
  return `<div class="pht-barre-sel" data-pht-barre>
      ${etat.confirmerRetraitSel
        ? `<span class="pht-barre-texte">Retirer ${n} photo${n > 1 ? 's' : ''} ?</span>
           <button type="button" class="car-puce" data-pht="garder-sel">Garder</button>
           <button type="button" class="car-danger" data-pht="retirer-sel-oui">Retirer</button>`
        : `<span class="pht-barre-texte"><span class="chiffre">${n}</span> sélectionnée${n > 1 ? 's' : ''}</span>
           <button type="button" class="car-icone" data-pht="retirer-sel" aria-label="Retirer la sélection"
             title="Retirer"${n ? '' : ' disabled'}>${svg('corbeille')}</button>
           ${n === 1 ? `<button type="button" class="car-icone" data-pht="copier" aria-label="Copier les étiquettes" title="Copier les étiquettes">${svgLr('copier', 17)}</button>` : ''}
           ${n && lr.presse ? `<button type="button" class="car-icone" data-pht="coller" aria-label="Coller les étiquettes : ${echapper(motDeLaPresse())}" title="Coller : ${echapper(motDeLaPresse())}">${svgLr('coller', 17)}</button>` : ''}
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

function fermerFenetreTri() {
  etat.fenetreTri = false;
  etat.ajout = null;
  etat.recherche = '';
  etat.gestion = null;
  // Dans la recherche, ce qu'on vient de trier peut changer les résultats.
  if (vueCourante === 'recherche') dessiner();
  dessinerFenetreTri();
}

function dessinerFenetreTri() {
  if (!etat.fenetreTri || !etat.selection.size) {
    if (fenetre) {
      const el = fenetre;
      fenetre = null;
      quitterLaFenetre(el, '[data-pht="trier-sel"]');
    }
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
        fermerFenetreTri();
      }
    });
  }
  const n = etat.selection.size;
  const vignettes = [...etat.selection].slice(0, 6).map(photo).filter(Boolean)
    .map((p) => `<span class="pht-fen-vignette">${p.vignette ? `<img src="${echapper(p.vignette)}" alt="">` : ''}</span>`).join('');
  remplirLaFenetre(fenetre, `
    <div class="pht-fen-fond">
      <div class="pht-fen" role="dialog" aria-modal="true" aria-label="Trier ${n} photos">
        <div class="pht-fen-tete">
          <span class="pht-fen-vignettes">${vignettes}</span>
          <p class="pht-fen-titre">Trier <span class="chiffre">${n}</span> photo${n > 1 ? 's' : ''}</p>
          <button type="button" class="car-icone" data-pht="fermer-tri" aria-label="Fermer">${svg('fermer')}</button>
        </div>
        ${panneauTri('selection')}
      </div>
    </div>`);
  document.body.classList.add('pht-vue-ouverte');
}

function retirerLaSelection(bouton) {
  const cibles = [...etat.selection].map(photo).filter(Boolean);
  if (!cibles.length) return;
  etat.selection = new Set();
  etat.confirmerRetraitSel = false;
  retirerAvecRetour(cibles, bouton);
  dessiner();
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
const PREFIXE_CARROUSEL = 'carrousel-';

function libelleParution(pub) {
  const quand = pub.date_prevue
    ? new Date(`${pub.date_prevue}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'idée';
  return `${pub.titre} · ${quand}`;
}

function enteteDuChoix() {
  if (etat.pourGenre === 'carrousel') {
    return `<p class="pht-pour-sur">Photos pour le carrousel</p>
      <h2 class="pht-nom">${echapper(etat.pourCarrousel?.nom ?? '…')}</h2>
      <span class="discret">Ce que tu coches entre dans le carrousel — l'ordre du post se fait là-bas</span>`;
  }
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
    let ids;
    if (etat.pourGenre === 'carrousel') {
      const c = await api.lireCarrousel(id);
      etat.pourCarrousel = { id: c.id, nom: c.nom, medias: c.medias ?? [] };
      ids = etat.pourCarrousel.medias.map((m) => m.photo_id).filter(Boolean);
    } else {
      ids = (await api.photosDeLaParution(id)).map((l) => l.photo_id);
    }
    if (etat.pour !== id || etat.pourCharge === id) return;
    etat.selection = new Set(ids);
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
  if (etat.pourGenre === 'carrousel') return garderPourLeCarrousel(bouton);
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

// LE CARROUSEL REPREND LE FICHIER, IL N'EN FAIT PAS DE COPIE : un média qui
// porte `photo_id` montre une photo de la photothèque. Le choix ACCORDE — ce qui
// est coché entre, ce qui est décoché sort, les fichiers propres au carrousel ne
// sont jamais touchés.
async function garderPourLeCarrousel(bouton) {
  const c = etat.pourCarrousel;
  if (!c) return;
  const avant = new Set(c.medias.map((m) => m.photo_id).filter(Boolean));
  const apres = new Set(etat.selection);
  const entrees = [...apres].filter((x) => !avant.has(x)).map(photo).filter((p) => p?.cle);
  const sorties = [...avant].filter((x) => !apres.has(x));
  bouton.disabled = true;
  try {
    await api.ajouterMediasDeCarrousel(entrees.map((p) => ({
      id: crypto.randomUUID(),
      carrousel_id: c.id,
      cle: p.cle,
      nom: p.nom,
      genre: 'photo',
      type: 'image/jpeg',
      taille: p.taille,
      photo_id: p.id,
    })));
    if (sorties.length) await api.retirerPhotosDuCarrousel(c.id, sorties);
    relireAuProchainMontage();
    messageCourt(entrees.length || sorties.length
      ? [entrees.length ? `${entrees.length} ajoutée${entrees.length > 1 ? 's' : ''}` : null,
        sorties.length ? `${sorties.length} retirée${sorties.length > 1 ? 's' : ''}` : null]
        .filter(Boolean).join(', ') + ` dans « ${c.nom} ».`
      : 'Rien n’a changé.');
    etat.pourCharge = null;
    revenir();
  } catch (e) {
    console.error('Carrousel non nourri', e);
    bouton.disabled = false;
    bulle("Ce n'est pas enregistré", 'Les photos n’ont pas pu entrer dans le carrousel.', bouton);
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

// --- La photo du Carnet, choisie dans la photothèque (étape 4b) --------------------------------
//
// La fiche d'une sortie au Carnet de terrain garde UNE photo, « celle dont je
// suis fier ». Elle se choisit maintenant dans la photothèque, parmi celles du
// match — ou parmi toutes, si le match n'en a pas.
//
// LE CARNET NE CHANGE PAS : la photo choisie lui est remise comme un FICHIER,
// posé dans son champ, et c'est son enregistrement à lui qui la réduit et la
// garde (bucket `moments`). Toutes les pages qui montrent la photo d'une sortie
// — le mur de l'accueil, la matière, la vitrine du carrousel — continuent de la
// lire là où elles la lisaient. Une seconde source pour la même photo aurait été
// trente endroits à reprendre.

let choixCarnet = null;

/**
 * Ouvre le choix et rend le fichier de la photo choisie, ou `null`.
 * @param {{ evenementId?: string|null }} options
 * @returns {Promise<File|null>}
 */
export async function choisirUnePhoto({ evenementId = null } = {}) {
  if (!etat.photos) await chargerEnSilence();
  const duMatch = evenementId ? photosDuMatch(evenementId) : [];
  return new Promise((resoudre) => {
    choixCarnet = { evenementId, tout: !duMatch.length, resoudre, enCours: null };
    dessinerChoixCarnet();
  });
}

function photosDuChoixCarnet() {
  const c = choixCarnet;
  if (!c) return [];
  if (!c.tout && c.evenementId) {
    // Les mieux notées d'abord : la photo du carnet est celle dont on est fier.
    return photosDuMatch(c.evenementId).sort((a, b) => (b.note ?? 0) - (a.note ?? 0));
  }
  return [...(etat.photos ?? [])]
    .sort((a, b) => (b.note ?? 0) - (a.note ?? 0) || (b.prise_le ?? '').localeCompare(a.prise_le ?? ''));
}

let fenetreCarnet = null;

function fermerChoixCarnet(fichier = null) {
  const c = choixCarnet;
  choixCarnet = null;
  if (fenetreCarnet) {
    const el = fenetreCarnet;
    fenetreCarnet = null;
    quitterLaFenetre(el);
  }
  if (!etat.ouverte && !etat.fenetreTri) document.body.classList.remove('pht-vue-ouverte');
  c?.resoudre(fichier);
}

async function dessinerChoixCarnet() {
  const c = choixCarnet;
  if (!c) return;
  if (!fenetreCarnet) {
    fenetreCarnet = document.createElement('div');
    fenetreCarnet.className = 'pht-fen-hote';
    document.body.appendChild(fenetreCarnet);
    fenetreCarnet.addEventListener('click', async (e) => {
      if (e.target.closest('[data-carnet-fermer]') || e.target.classList.contains('pht-fen-fond')) {
        fermerChoixCarnet(null);
        return;
      }
      if (e.target.closest('[data-carnet-tout]')) {
        choixCarnet.tout = !choixCarnet.tout;
        dessinerChoixCarnet();
        return;
      }
      const t = e.target.closest('[data-carnet-photo]');
      if (!t || choixCarnet?.enCours) return;
      const p = photo(t.dataset.carnetPhoto);
      if (!p) return;
      choixCarnet.enCours = p.id;
      t.classList.add('choisie');
      try {
        if (!p.blob) {
          if (!p.url) {
            const a = (await adressesDe([p.cle]))[p.cle];
            p.url = a?.original ?? null;
            if (!p.url) throw new Error('Adresse absente');
          }
          const r = await fetch(p.url);
          if (!r.ok) throw new Error(String(r.status));
          p.blob = await r.blob();
        }
        fermerChoixCarnet(new File([p.blob], p.nom, { type: p.blob.type || 'image/jpeg' }));
      } catch (err) {
        console.error('Photo non récupérée', err);
        if (choixCarnet) choixCarnet.enCours = null;
        t.classList.remove('choisie');
        bulle("Ce n'est pas passé", 'Cette photo n’a pas pu être récupérée. Réessaie.', t);
      }
    });
  }
  const liste = photosDuChoixCarnet();
  const match = c.evenementId ? matchDe(c.evenementId) : null;
  const aDuMatch = c.evenementId && photosDuMatch(c.evenementId).length;
  remplirLaFenetre(fenetreCarnet, `
    <div class="pht-fen-fond">
      <div class="pht-fen pht-fen-large" role="dialog" aria-modal="true" aria-label="Choisir la photo du carnet">
        <div class="pht-fen-tete">
          <p class="pht-fen-titre">La photo du carnet</p>
          <button type="button" class="car-icone" data-carnet-fermer aria-label="Fermer">${svg('fermer')}</button>
        </div>
        <p class="pht-carnet-sous discret">${c.tout
          ? (aDuMatch ? 'Toute la photothèque, les mieux notées d’abord.' : 'Ce match n’a pas encore de photos : voici toute la photothèque.')
          : `Les photos de ${echapper(match?.titre ?? 'ce match')}, les mieux notées d’abord.`}
          ${aDuMatch ? `<button type="button" class="car-puce car-puce-mini" data-carnet-tout>${c.tout ? 'Ce match seulement' : 'Toute la photothèque'}</button>` : ''}</p>
        ${liste.length
          ? `<div class="pht-grille">${liste.map((p) => `<button type="button" class="pht-tuile" data-carnet-photo="${p.id}"
                aria-label="Choisir : ${echapper(nomDeLaPhoto(p))}">
                <img data-vignette="${p.id}" alt="" loading="lazy" decoding="async"${p.vignette ? ` src="${echapper(p.vignette)}"` : ''}
                  onload="this.parentNode?.classList.add('prete')">${badgeNote(p)}</button>`).join('')}</div>`
          : '<p class="car-liste-vide">La photothèque est vide. Importe un match d’abord.</p>'}
      </div>
    </div>`);
  document.body.classList.add('pht-vue-ouverte');
  // Les vignettes se signent après coup, et se posent sans redessiner.
  const sans = liste.filter((p) => !p.vignette);
  if (sans.length) {
    await signer(sans);
    for (const p of sans) {
      fenetreCarnet?.querySelectorAll(`img[data-vignette="${p.id}"]`).forEach((img) => { if (p.vignette) img.src = p.vignette; });
    }
  }
}

// --- Le noir et blanc, reconnu (21 novembre 2026) --------------------------------------------
//
// Noé : « est-ce possible de reconnaître à l'import une photo en noir et blanc
// pour la catégoriser directement ? » Oui, et sans rien envoyer à personne : on
// regarde la VIGNETTE, réduite à 48 × 48, et l'on mesure l'écart entre la plus
// forte et la plus faible des trois couleurs de chaque point. Une photo en noir
// et blanc a ses trois couleurs presque égales PARTOUT.
//
// DEUX SEUILS, ET IL FAUT LES DEUX : la moyenne doit être basse (pas de couleur
// en général), ET presque aucun point ne doit en avoir franchement — un maillot
// rouge sur un fond gris ferait sinon passer une photo couleur pour une photo
// en noir et blanc. Un virage sépia léger passe pour du noir et blanc ; une
// photo franchement teintée, non.

const COTE_ANALYSE = 48;

function estNoirEtBlanc(source) {
  const c = document.createElement('canvas');
  c.width = COTE_ANALYSE;
  c.height = COTE_ANALYSE;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, COTE_ANALYSE, COTE_ANALYSE);
  const { data } = ctx.getImageData(0, 0, COTE_ANALYSE, COTE_ANALYSE);
  let somme = 0;
  let colores = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const ecart = Math.max(r, g, b) - Math.min(r, g, b);
    somme += ecart;
    if (ecart > 28) colores++;
  }
  return somme / n < 8 && colores / n < 0.02;
}

// L'étiquette « Noir et blanc » de la famille du style, si Noé ne l'a ni
// renommée ni supprimée. Sans elle, le hub ne pose rien.
const etiquetteNoirEtBlanc = () => (etat.etiquettes ?? [])
  .find((e) => e.famille === 'style' && sansAccent(e.nom) === 'noir et blanc') ?? null;

// LE RATTRAPAGE : les photos importées avant le 21 novembre n'ont jamais été
// regardées. Une fois, en arrière-plan, on lit leurs vignettes — puis
// `couleurs_lues` les sort du lot pour toujours.
async function rattraperLesCouleurs() {
  if (etat.couleursLues) return;
  etat.couleursLues = true;
  const nb = etiquetteNoirEtBlanc();
  const aLire = (etat.photos ?? []).filter((p) => p.envoi === 'fait' && !p.couleurs_lues && p.cle);
  if (!aLire.length) return;
  const lues = [];
  const reconnues = [];
  try {
    const adresses = {};
    for (let i = 0; i < aLire.length; i += 400) {
      Object.assign(adresses, await adressesDe(aLire.slice(i, i + 400).map((p) => p.cle)));
    }
    const file = [...aLire];
    const ouvrier = async () => {
      for (let p = file.shift(); p; p = file.shift()) {
        const adresse = adresses[p.cle]?.vignette;
        if (!adresse) continue;
        try {
          const r = await fetch(adresse);
          if (!r.ok) continue;
          const image = await createImageBitmap(await r.blob());
          if (estNoirEtBlanc(image)) reconnues.push(p);
          image.close?.();
          lues.push(p);
        } catch {
          // Une vignette illisible se relira à la prochaine visite.
        }
      }
    };
    await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
    const aPoser = nb ? reconnues.filter((p) => !p.etiquettes.has(nb.id)) : [];
    if (aPoser.length) {
      await api.etiqueterPhotos(aPoser.map((p) => p.id), nb.id);
      aPoser.forEach((p) => p.etiquettes.add(nb.id));
    }
    if (lues.length) {
      await api.marquerCouleursLues(lues.map((p) => p.id));
      lues.forEach((p) => { p.couleurs_lues = true; });
    }
    if (aPoser.length) {
      messageCourt(`${aPoser.length} photo${aPoser.length > 1 ? 's' : ''} reconnue${aPoser.length > 1 ? 's' : ''} en noir et blanc.`);
      redessinerTri();
      if (vueCourante === 'recherche' && !etat.ouverte) dessiner();
    }
  } catch (e) {
    console.error('Rattrapage du noir et blanc interrompu', e);
    etat.couleursLues = false;
  }
}

// LE FLOU DE MOUVEMENT, MÊME RATTRAPAGE (25 novembre 2026) : une fois, en
// arrière-plan, les vignettes jamais regardées. Rien n'est étiqueté : on note ce
// que l'image a l'air d'être, et la pile le PROPOSE (js/tri-photos.js).
async function rattraperLeFlou() {
  if (etat.flouLu) return;
  etat.flouLu = true;
  const file = (etat.photos ?? []).filter((p) => p.envoi === 'fait' && !p.flou_lu && p.cle);
  if (!file.length) return;
  try {
    const adresses = {};
    for (let i = 0; i < file.length; i += 400) {
      Object.assign(adresses, await adressesDe(file.slice(i, i + 400).map((p) => p.cle)));
    }
    const lues = { true: [], false: [] };
    const ouvrier = async () => {
      for (let p = file.shift(); p; p = file.shift()) {
        const adresse = adresses[p.cle]?.vignette;
        if (!adresse) continue;
        try {
          const r = await fetch(adresse);
          if (!r.ok) continue;
          const image = await createImageBitmap(await r.blob());
          lues[estUnFile(mesurerLeFlou(image, image.width, image.height))].push(p);
          image.close?.();
        } catch {
          // Une vignette illisible se relira à la prochaine visite.
        }
      }
    };
    await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
    for (const flou of [true, false]) {
      if (!lues[flou].length) continue;
      await api.marquerFlouLu(lues[flou].map((p) => p.id), flou);
      lues[flou].forEach((p) => { p.flou_lu = true; p.flou_mouvement = flou; });
    }
    if (lues.true.length && etat.ouverte) redessinerTri();
  } catch (e) {
    console.error('Lecture du flou interrompue', e);
    etat.flouLu = false;
  }
}

// --- La pile « à trier » (21 novembre 2026) ----------------------------------------------------
//
// Noé : « un outil qui nous montre une photo, à laquelle on affecte les tris,
// et on peut passer à une suivante qui n'a pas encore été triée en swipant à
// droite — une pile de photos à trier, pour être à jour dans le tri. »
//
// C'EST LA VISIONNEUSE, EN MODE PILE : la même photo en grand, le même panneau
// de tri. Ce qui change, c'est ce que veut dire le geste :
//   — vers la DROITE (ou → , ou « Trié ») : la photo est triée, elle sort de la
//     pile, la suivante arrive ;
//   — vers la GAUCHE (ou ←, ou « Plus tard ») : elle repasse sous la pile.
// La carte suit le doigt, penche, et s'envole du côté choisi : on voit la pile
// baisser.
//
// UNE PHOTO TRIÉE L'EST PAR UN GESTE, pas par ce qu'on lui a posé : une photo
// sans rien à en dire est triée aussi. C'est `photos.triee`.

// TRIÉE = NOTÉE, OU PASSÉE PAR LA PILE (règle de Noé, 21 novembre 2026 : « une
// photo doit compter comme triée à partir du moment où elle a une note »).
// Noter une photo, où que ce soit, la sort donc de la pile.
const estTriee = (p) => Boolean(p.triee) || p.note != null;

const pileATrier = () => trier((etat.photos ?? []).filter((p) => !estTriee(p) && !p.illisible))
  // Les plus récentes d'abord : le match qu'on vient d'importer est celui
  // qu'on veut trier.
  .sort((a, b) => (b.evenement?.date_debut ?? b.prise_le ?? '').slice(0, 10)
    .localeCompare((a.evenement?.date_debut ?? a.prise_le ?? '').slice(0, 10)));

function ouvrirLaPile() {
  const pile = pileATrier();
  if (!pile.length) return;
  etat.pile = true;
  etat.listeVue = pile.map((p) => p.id);
  ouvrir(pile[0].id);
}

function suivanteDansLaPile() {
  const restantes = listeDeLaVue().filter((p) => !estTriee(p));
  return restantes;
}

async function marquerTriee(sens) {
  const p = photo(etat.ouverte);
  if (!p) return;
  if (sens === 'trie') {
    const avant = cliche([p]);
    accepterLesPropositions(p);
    p.triee = true;
    garderLeGeste(avant, 'le tri de cette photo');
    if (p.enBase || p.envoi === 'fait') {
      api.marquerTriees([p.id], true).catch((e) => {
        console.error('Tri non gardé', e);
        p.triee = false;
        bulle("Ce n'est pas enregistré", 'Cette photo n’a pas pu être marquée triée. Elle reviendra dans la pile.');
      });
    }
  } else {
    // PLUS TARD : elle repasse sous la pile, sans rien perdre.
    etat.listeVue = [...etat.listeVue.filter((id) => id !== p.id), p.id];
  }
  const restantes = suivanteDansLaPile();
  const k = restantes.findIndex((q) => q.id === p.id);
  const suivante = sens === 'trie'
    ? restantes[0]
    : restantes.find((q, i) => i !== k) ?? null;
  if (suivante && suivante.id !== p.id) ouvrir(suivante.id);
  else { etat.ouverte = estTriee(p) ? null : p.id; dessinerVisionneuse(); }
}

// L'écran de fin : la pile est vide, et c'est une victoire.
function gabaritFinDeLaPile() {
  return `
    <div class="pht-vue pht-vue-fin" role="dialog" aria-modal="true" aria-label="Tout est trié">
      <div class="pht-vue-barre"><span></span>
        <button type="button" class="car-icone" data-pht="fermer" aria-label="Fermer">${svg('fermer')}</button>
      </div>
      <div class="pht-fin">
        <p class="pht-fin-titre">Tout est trié.</p>
        <p class="discret">Tu es à jour — les prochaines photos importées arriveront ici.</p>
        <button type="button" class="car-bouton-or" data-pht="fermer">Revenir aux photos</button>
      </div>
    </div>`;
}

// LA CARTE SUIT LE DOIGT — à la souris aussi : sur ordinateur, glisser la photo
// fait le même geste, et les flèches du clavier le font sans la toucher.
function brancherLaCarte(racine) {
  // CE QUI RENDAIT LE GLISSEMENT CAPRICIEUX (21 novembre 2026, Noé : « le
  // glissement vers la droite ne fonctionne pas très bien ») :
  //   — la scène laissait au navigateur le défilement VERTICAL : un geste un
  //     peu en biais devenait un défilement, le navigateur annulait le doigt, et
  //     la carte revenait en place à quelques pixels du but ;
  //   — il fallait parcourir 90 px quoi qu'il arrive : un petit coup de pouce
  //     franc, le geste naturel d'une pile, ne suffisait pas.
  // Désormais la scène garde TOUT le geste (`touch-action: none`), le doigt est
  // capturé, et la carte part soit à un quart de largeur, soit sur un coup sec.
  let prise = null;
  const image = () => racine.querySelector('.pht-vue-image');
  racine.addEventListener('pointerdown', (e) => {
    // Les étoiles posées sur la photo se touchent, elles ne se prennent pas.
    if (!etat.pile || !e.target.closest('.pht-vue-scene') || e.target.closest('.pht-etoiles-sur') || e.button > 0) return;
    const scene = e.target.closest('.pht-vue-scene');
    prise = {
      x: e.clientX, y: e.clientY, id: e.pointerId, dx: 0,
      largeur: scene.clientWidth, t: performance.now(), vitesse: 0, dernier: { x: e.clientX, t: performance.now() },
    };
    try { scene.setPointerCapture(e.pointerId); } catch { /* sans capture, ça marche quand même */ }
    image()?.classList.add('en-main');
  });
  racine.addEventListener('pointermove', (e) => {
    if (!prise || e.pointerId !== prise.id) return;
    e.preventDefault();
    prise.dx = e.clientX - prise.x;
    const t = performance.now();
    const dt = Math.max(1, t - prise.dernier.t);
    // La vitesse des derniers instants, lissée : c'est elle qui dit le « coup sec ».
    prise.vitesse = 0.7 * ((e.clientX - prise.dernier.x) / dt) + 0.3 * prise.vitesse;
    prise.dernier = { x: e.clientX, t };
    const img = image();
    if (!img) return;
    img.style.transform = `translateX(${prise.dx}px) rotate(${prise.dx / 28}deg)`;
    const seuil = seuilDeLaCarte(prise.largeur);
    racine.querySelector('.pht-vue-scene')?.setAttribute('data-sens',
      prise.dx > seuil * 0.6 ? 'trie' : prise.dx < -seuil * 0.6 ? 'plus-tard' : '');
  });
  const lacher = (e) => {
    if (!prise || e.pointerId !== prise.id) return;
    const { dx, vitesse, largeur } = prise;
    prise = null;
    const img = image();
    img?.classList.remove('en-main');
    racine.querySelector('.pht-vue-scene')?.removeAttribute('data-sens');
    const loin = Math.abs(dx) > seuilDeLaCarte(largeur);
    const sec = Math.abs(dx) > 30 && Math.abs(vitesse) > 0.5 && Math.sign(vitesse) === Math.sign(dx);
    if (loin || sec) envoler(dx > 0 ? 'trie' : 'plus-tard');
    else if (img) img.style.transform = '';
  };
  racine.addEventListener('pointerup', lacher);
  racine.addEventListener('pointercancel', lacher);
}

// Un quart de la largeur de la photo, entre 60 et 110 px.
const seuilDeLaCarte = (largeur) => Math.max(60, Math.min(110, (largeur || 320) * 0.25));

// La carte s'en va du côté choisi, puis la suivante arrive.
function envoler(sens) {
  const img = visionneuse?.querySelector('.pht-vue-image');
  if (!img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    marquerTriee(sens);
    return;
  }
  img.classList.add('s-envole');
  img.style.transform = `translateX(${sens === 'trie' ? 120 : -120}vw) rotate(${sens === 'trie' ? 18 : -18}deg)`;
  setTimeout(() => marquerTriee(sens), 220);
}

// --- La visionneuse ---------------------------------------------------------------------------

function gabaritVisionneuse() {
  if (etat.pile && !etat.ouverte) return gabaritFinDeLaPile();
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
    <div class="pht-vue${etat.pile ? ' pht-vue-pile' : ''}" role="dialog" aria-modal="true" aria-label="${echapper(nomDeLaPhoto(p))}">
      <div class="pht-vue-barre">
        ${etat.pile
          ? `<span class="pht-vue-rang">À trier · <span class="chiffre">${suivanteDansLaPile().length}</span></span>`
          : `<span class="pht-vue-rang"><span class="chiffre">${k + 1}</span> / ${liste.length}</span>`}
        ${/* LES INFOS DE LA PHOTO, EN HAUT (21 novembre 2026, demande de Noé) :
          elles disent ce qu'on regarde avant qu'on la trie, et le bas de
          l'écran ne garde que les gestes. */ ''}
        <p class="pht-vue-infos">
          <span>${p.prise_le ? echapper(momentLong(p.prise_le)) : 'Date inconnue'}</span>
          <span class="discret">${[format ? formats[format] : null, p.largeur ? `${p.largeur} × ${p.hauteur}` : null, echapper(p.nom)].filter(Boolean).join(' · ')}</span>
          ${vieDeLaPhoto(p)}
        </p>
        <button type="button" class="car-icone" data-pht="fermer" aria-label="Fermer" title="Fermer (Échap)">${svg('fermer')}</button>
      </div>
      <div class="pht-vue-corps">
        <div class="pht-vue-scene${etat.pile ? ' en-pile' : ''}">
          ${etat.pile ? '<span class="pht-sens pht-sens-plus-tard" aria-hidden="true">Plus tard</span>'
            : `<button type="button" class="pht-vue-fleche" data-pht="precedente" aria-label="Photo précédente"${k > 0 ? '' : ' disabled'}>${svg('gauche', 22)}</button>`}
          <img class="pht-vue-image" src="${echapper(src)}" alt="${echapper(nomDeLaPhoto(p))}" draggable="false">
          ${/* Sur la photo au téléphone seulement : sur ordinateur, la note reste
             dans la colonne, au-dessus du style (demande de Noé). */ surTelephone() ? etoilesSurLaPhoto() : ''}
          ${etat.pile ? '<span class="pht-sens pht-sens-trie" aria-hidden="true">Trié</span>'
            : `<button type="button" class="pht-vue-fleche" data-pht="suivante" aria-label="Photo suivante"${k < liste.length - 1 ? '' : ' disabled'}>${svg('droite', 22)}</button>`}
        </div>
        <aside class="pht-vue-cote" aria-label="Trier cette photo">${panneauTri('vue')}</aside>
      </div>
      <div class="pht-vue-pied">
        <div class="pht-vue-actions">
          ${etat.confirmerRetrait
            ? `<span class="pht-vue-question">Retirer cette photo de la photothèque ?</span>
               <button type="button" class="car-puce" data-pht="garder">Garder</button>
               <button type="button" class="car-danger" data-pht="retirer-oui">Retirer</button>`
            : etat.pile
              ? `<button type="button" class="car-icone" data-pht="retirer" aria-label="Retirer cette photo" title="Retirer">${svg('corbeille')}</button>
                 <button type="button" class="car-puce" data-pht="plus-tard" title="Plus tard (←)">${svg('gauche', 14)}<span>Plus tard</span></button>
                 <button type="button" class="car-bouton-or" data-pht="trie" title="Triée (→)"><span>Trié</span>${svg('droite')}</button>`
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
  etat.quiOuvert = false;
  etat.menuOuvert = null;
  dessinerVisionneuse();
  prechargerAutour();
  adresserAutour(id);
}

// OUVERTE AVANT D'AVOIR SON ADRESSE (25 novembre 2026) : la porte « À trier » de
// la page Créer ouvre la pile sans passer par la grille, qui signait les photos.
// La première restait vide. On signe celle qu'on ouvre et les cinq suivantes.
async function adresserAutour(id) {
  const liste = listeDeLaVue();
  const k = liste.findIndex((p) => p.id === id);
  const sans = liste.slice(Math.max(0, k), k + 6).filter((p) => p.cle && !p.url && !p.blob);
  if (!sans.length) return;
  await signer(sans);
  const p = photo(id);
  const img = visionneuse?.querySelector('.pht-vue-image');
  if (etat.ouverte !== id || !img || !p?.url) return;
  if (!img.getAttribute('src')) img.src = p.url;
  prechargerAutour();
}

function fermer() {
  const etaitPile = etat.pile;
  etat.pile = false;
  etat.ouverte = null;
  etat.listeVue = [];
  // La pile a baissé : le compte « À trier » de la tête aussi.
  if (etaitPile) dessiner();
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

let dernierVu = null;
function dessinerVisionneuse() {
  const html = gabaritVisionneuse();
  if (!html) {
    if (visionneuse) {
      const el = visionneuse;
      visionneuse = null;
      quitterLaFenetre(el, dernierVu ? `[data-ouvrir="${dernierVu}"]` : null);
    }
    dernierVu = null;
    document.body.classList.remove('pht-vue-ouverte');
    return;
  }
  if (!visionneuse) {
    visionneuse = document.createElement('div');
    visionneuse.className = 'pht-vue-hote';
    document.body.appendChild(visionneuse);
    brancherVisionneuse(visionneuse);
  }
  // Depuis la pile, on revient au bouton ; depuis la grille, à la dernière photo vue.
  dernierVu = etat.pile ? null : etat.ouverte;
  remplirLaFenetre(visionneuse, html);
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

function retirer(bouton) {
  const p = photo(etat.ouverte);
  if (!p) return;
  const liste = listeDeLaVue();
  // En pile, la suivante est la prochaine photo PAS ENCORE triée.
  const suivante = etat.pile
    ? liste.find((q) => q.id !== p.id && !estTriee(q)) ?? null
    : liste[liste.indexOf(p) + 1] ?? liste[liste.indexOf(p) - 1] ?? null;
  retirerAvecRetour([p], bouton);
  etat.ouverte = suivante?.id ?? null;
  etat.confirmerRetrait = false;
  dessinerVisionneuse();
  dessiner();
}

function brancherVisionneuse(racine) {
  brancherTri(racine);
  brancherLaCarte(racine);
  racine.addEventListener('click', (e) => {
    const action = e.target.closest('[data-pht]');
    if (!action) {
      // Un clic sur le fond referme, comme toutes les fenêtres du hub.
      if (e.target.classList.contains('pht-vue-scene') && !etat.pile) fermer();
      return;
    }
    const quoi = action.dataset.pht;
    if (quoi === 'fermer') fermer();
    else if (quoi === 'trie') envoler('trie');
    else if (quoi === 'plus-tard') envoler('plus-tard');
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
    if (etat.pile || e.pointerType !== 'touch' || !e.target.closest('.pht-vue-scene') || e.target.closest('.pht-etoiles-sur')) return;
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
    if (choixCarnet && e.key === 'Escape') { e.preventDefault(); fermerChoixCarnet(null); return; }
    if (e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey
      && (hote?.isConnected || etat.ouverte) && !choixCarnet
      && !e.target.closest?.('input:not([type="range"]), textarea, select, [contenteditable="true"]')) {
      e.preventDefault();
      annulerLeDernier();
      return;
    }
    if (etat.fenetreTri && e.key === 'Escape') { e.preventDefault(); fermerFenetreTri(); return; }
    if (e.key === '?' && hote?.isConnected && !etat.fenetreTri && !choixCarnet
      && !e.target.closest?.('input, textarea, select')) {
      e.preventDefault();
      montrerLesRaccourcis();
      return;
    }
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
    else if (etat.pile && e.key === 'ArrowRight') { e.preventDefault(); envoler('trie'); }
    else if (etat.pile && e.key === 'ArrowLeft') { e.preventDefault(); envoler('plus-tard'); }
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

// --- LA PHOTOTHÈQUE SUR ORDINATEUR (25 novembre 2026, demande de Noé) ----------------------------
//
// « On va essayer de se rapprocher un peu plus de ce que propose Lightroom » :
//   — un RAIL d'outils à gauche, et le panneau de l'outil choisi à côté ;
//   — la BIBLIOTHÈQUE : les matchs en arbre, par compétition ou par date ;
//   — les FILTRES et l'IMPORT, dans le même panneau ;
//   — en pied, la BARRE qui dit comment on regarde : en grille (dont on règle la
//     taille), deux par deux et sans recadrage, ou une photo en grand avec sa
//     pellicule et son tri.
//
// LE TÉLÉPHONE N'EN VOIT RIEN : ses écrans sont faits pour le pouce, et l'import
// comme le classement se font à l'ordinateur (choix de Noé). Le choix des photos
// d'une parution garde son écran à lui.
const ORDI = window.matchMedia('(min-width: 60rem)');
const CLE_LR = 'pht-ordi';
const lr = {
  panneau: 'biblio',          // 'biblio' | 'collections' | 'import' | null
  filtres: false,             // la barre de filtres, en haut des photos
  rangement: 'competition',   // 'competition' | 'date'
  plies: [],                  // les groupes refermés
  forme: 'grille',            // 'grille' | 'deux' | 'une'
  avant: 'grille',            // la forme d'où l'on est entré dans une photo
  taille: 170,
  piles: true,                // les rafales repliées
  loupe: null,
  ...(() => { try { return JSON.parse(localStorage.getItem(CLE_LR) ?? '{}'); } catch { return {}; } })(),
};
if (lr.panneau === 'filtres') { lr.panneau = 'biblio'; lr.filtres = true; }
lr.loupe = null;
lr.menu = null;                // le menu de filtres ouvert
lr.paire = [null, null];      // les deux photos comparées
lr.ouvertes = new Set();      // les piles dépliées
lr.zoom = null;               // { x, y } : le point regardé à 100 %, ou rien
lr.presse = null;             // les étiquettes copiées
if (lr.forme === 'comparer') lr.forme = 'grille';
if (lr.forme === 'une') lr.forme = lr.avant === 'deux' ? 'deux' : 'grille';
const garderLr = () => {
  const { panneau, filtres, rangement, plies, forme, avant, taille, piles } = lr;
  try { localStorage.setItem(CLE_LR, JSON.stringify({ panneau, filtres, rangement, plies, forme, avant, taille, piles })); } catch { /* une commodité */ }
};
const enAtelier = () => ORDI.matches && !etat.pour && Boolean(etat.photos);
ORDI.addEventListener('change', () => { if (hote?.isConnected && !etat.ouverte) dessiner(); });

const ICONE_LR = {
  biblio: '<path d="M4 6a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>',
  grille: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  deux: '<rect x="3" y="5" width="8" height="14" rx="1"/><rect x="13" y="5" width="8" height="14" rx="1"/>',
  une: '<rect x="4" y="4" width="16" height="16" rx="1.5"/>',
  pile: '<rect x="6" y="7" width="14" height="13" rx="1.5"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/><path d="M10 13.5l2.2 2.2 4-4.2"/>',
  comparer: '<rect x="2.5" y="6" width="8" height="12" rx="1"/><rect x="13.5" y="6" width="8" height="12" rx="1"/><path d="M12 3v18"/>',
  piles: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M6.5 6h11M9 3h6"/>',
  echanger: '<path d="M4 8h15l-4-4M20 16H5l4 4"/>',
  collection: '<path d="M12 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.3l5-.7z"/>',
  copier: '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4"/>',
  coller: '<rect x="5" y="5" width="14" height="16" rx="1.5"/><path d="M9 5V3h6v2M9 13l2 2 4-4"/>',
  aide: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8M12 16.6v.1"/>',
  plein: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
};
const svgLr = (cle, taille = 20) => `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONE_LR[cle] ?? ICONE[cle]}</svg>`;

function boutonDuRail(cle, nom, icone, n = 0) {
  const actif = lr.panneau === cle;
  return `<button type="button" class="lr-outil${actif ? ' actif' : ''}" data-lr="panneau" data-valeur="${cle}"
      aria-pressed="${actif}" aria-label="${nom}${n ? ` (${n})` : ''}" title="${nom}">${svgLr(icone)}${
      n ? `<span class="lr-outil-n">${n}</span>` : ''}</button>`;
}

// LES FILTRES NE SONT PLUS UN PANNEAU : leur bouton ouvre la barre du haut, et la
// bibliothèque reste à côté.
function boutonDesFiltres() {
  const n = nbFiltres();
  const actif = lr.filtres && ['grille', 'deux'].includes(lr.forme);
  return `<button type="button" class="lr-outil${actif ? ' actif' : ''}" data-lr="filtres" data-valeur="" aria-pressed="${actif}"
      aria-label="Filtres${n ? ` (${n})` : ''}" title="Filtres (F)">${svgLr('filtre')}${n ? `<span class="lr-outil-n">${n}</span>` : ''}</button>`;
}
function basculerLesFiltres() {
  const enGrille = ['grille', 'deux'].includes(lr.forme);
  lr.filtres = enGrille ? !lr.filtres : true;
  lr.menu = null;
  garderLr();
  if (enGrille) redessinerSurPlace(); else changerDeForme(lr.avant);
}

function railDOutils() {
  const aTrier = pileATrier().length;
  return `<nav class="lr-rail" aria-label="Outils de la photothèque">
      ${boutonDuRail('biblio', 'Bibliothèque', 'biblio')}
      ${vueCourante === 'liste' ? '' : boutonDesFiltres()}
      ${boutonDuRail('collections', 'Collections intelligentes', 'collection')}
      ${boutonDuRail('import', 'Importer des photos', 'importer')}
      <span class="lr-filet" aria-hidden="true"></span>
      ${aTrier ? `<button type="button" class="lr-outil" data-pht="pile" aria-label="Trier les ${aTrier} photos de la pile"
        title="À trier · ${aTrier}">${svgLr('pile')}<span class="lr-outil-point" aria-hidden="true"></span></button>` : ''}
      <a class="lr-outil${vueCourante === 'liste' ? ' actif' : ''}" href="#yuno/phototheque/${ALBUMS}"
        aria-label="Les albums en images" title="Les albums en images">${svgLr('albums')}</a>
      <button type="button" class="lr-outil" data-pht="raccourcis" aria-label="Les raccourcis" title="Les raccourcis (?)">${svgLr('aide')}</button>
    </nav>`;
}

function arbreDesAlbums() {
  const groupes = new Map();
  const poser = (cle, nom, ordre, album) => {
    if (!groupes.has(cle)) groupes.set(cle, { cle, nom, ordre, albums: [] });
    groupes.get(cle).albums.push(album);
  };
  for (const a of albums()) {
    if (!a.match) poser('sans', 'Sans match', '', a);
    else if (lr.rangement === 'date') {
      const m = moisDe(a.match.date_debut);
      poser(`m-${m}`, nomDuMois(m), m, a);
    } else poser(`c-${a.match.competition ?? ''}`, a.match.competition || 'Sans compétition', '', a);
  }
  const dernier = (g) => (g.cle === 'sans' ? 2 : g.cle === 'c-' ? 1 : 0);
  const liste = [...groupes.values()].sort((a, b) => dernier(a) - dernier(b)
    || (lr.rangement === 'date' ? b.ordre.localeCompare(a.ordre) : a.nom.localeCompare(b.nom, 'fr')));
  return liste.map((g) => {
    g.albums.sort((a, b) => (b.match?.date_debut ?? '').localeCompare(a.match?.date_debut ?? ''));
    const n = g.albums.reduce((s, a) => s + a.photos.length, 0);
    const lien = (a) => `<a class="lr-album" href="#yuno/phototheque/${a.cle}"${cible === a.cle && enMatch() ? ' aria-current="page"' : ''}
        title="${echapper(a.match ? `${a.match.titre} · ${jourCourt(a.match.date_debut)}` : 'Sans match')}">
        <span class="lr-album-nom">${echapper(a.match?.titre ?? 'Sans match')}</span><span class="lr-n">${a.photos.length}</span></a>`;
    if (g.cle === 'sans') return lien(g.albums[0]);
    return `<details class="lr-groupe" data-lr-groupe="${echapper(g.cle)}"${lr.plies.includes(g.cle) ? '' : ' open'}>
        <summary>${svgLr('droite', 13)}${svgLr('biblio', 16)}<span class="lr-album-nom">${echapper(g.nom)}</span><span class="lr-n">${n}</span></summary>
        ${g.albums.map(lien).join('')}
      </details>`;
  }).join('');
}

function panneauOutil() {
  if (lr.panneau === 'biblio') {
    const bascule = [['competition', 'Compétition'], ['date', 'Date']].map(([cle, nom]) =>
      `<button type="button" data-lr="rangement" data-valeur="${cle}" aria-pressed="${lr.rangement === cle}"
         class="${lr.rangement === cle ? 'actif' : ''}">${nom}</button>`).join('');
    return `<div class="lr-panneau-tete"><h2>Bibliothèque</h2></div>
      <div class="lr-bascule" role="group" aria-label="Ranger les albums par">${bascule}</div>
      <a class="lr-album lr-toutes" href="#yuno/phototheque"${vueCourante === 'recherche' && !collectionOuverte() ? ' aria-current="page"' : ''} data-lr="toutes" data-valeur="">
        <span class="lr-album-nom">Toutes les photos</span><span class="lr-n">${etat.photos.length}</span></a>
      ${arbreDesAlbums()}
      <div class="lr-place">${gabaritPlace()}</div>`;
  }
  // L'OUTIL DES COLLECTIONS INTELLIGENTES (25 novembre 2026, demande de Noé) : à
  // part de la bibliothèque et des filtres.
  if (lr.panneau === 'collections') {
    const ouverte = vueCourante === 'recherche' ? collectionOuverte() : null;
    const lignes = etat.collections.map((c) => `<button type="button" class="lr-album lr-collection" data-col="ouvrir" data-id="${c.id}"
        aria-pressed="${c === ouverte}"${c === ouverte ? ' aria-current="true"' : ''}>
        ${svgLr('collection', 15)}<span class="lr-album-nom">${echapper(c.nom)}</span><span class="lr-n">${compteDe(c)}</span></button>`).join('');
    return `<div class="lr-panneau-tete"><h2>Collections</h2></div>
      ${lignes}
      ${vueCourante === 'recherche' ? `<div class="pht-cols">${gestesDeCollection()}</div>` : ''}
      ${vueCourante === 'recherche' && !nbFiltres() ? `<p class="lr-aide">Pose des filtres (F) : tu pourras les garder ici sous un nom. La collection se remplit toute seule.</p>` : ''}
      ${etat.collections.length ? '' : `<div class="pht-etiqs pht-cols">${propositionsDeCollections()}</div>`}`;
  }
  if (lr.panneau === 'import') {
    const ici = enMatch() && cible;
    const sorties = etat.sorties;
    return `<div class="lr-panneau-tete"><h2>Importer</h2></div>
      ${ici ? `<p class="lr-aide">Vers « ${echapper(matchDe(cible)?.titre ?? 'Sans match')} ».</p>
        <button type="button" class="car-bouton-or" data-pht="choisir">${svg('importer')}<span>Choisir des photos</span></button>
        <p class="lr-aide">Ou glisse un dossier d'exports sur les photos.</p>
        <p class="lr-aide">Pour un autre match :</p>` : '<p class="lr-aide">De quel match viennent ces photos ?</p>'}
      <label class="car-match">
        ${svg('match', 15)}<span class="car-match-texte">${sorties ? 'Choisir le match' : 'Un instant…'}</span>
        <select data-pht-match aria-label="Match des photos à importer"${sorties ? '' : ' disabled'}>
          <option value="" selected disabled>Choisir le match</option>
          ${(sorties ?? []).map((s) => `<option value="${s.id}">${echapper(s.titre)} · ${jourCourt(s.date_debut)}</option>`).join('')}
          <option value="${SANS_MATCH}">Sans match</option>
        </select>
      </label>
      <div class="lr-place">${gabaritPlace()}</div>`;
  }
  return '';
}

// DEUX PAR DEUX : la photo entière, pas sa vignette carrée. C'est là qu'on juge
// un cadrage et une netteté.
function tuileEntiere(p) {
  const choisie = etat.selection.has(p.id);
  const src = p.blob ? (p.urlLocale ??= URL.createObjectURL(p.blob)) : p.url ?? p.vignette ?? '';
  return `<button type="button" class="pht-tuile lr-entiere prete${choisie ? ' choisie' : ''}" data-ouvrir="${p.id}"
      tabindex="-1" aria-label="${echapper(nomDeLaTuile(p))}"${etat.modeSelection ? ` aria-pressed="${choisie}"` : ''}>
      <img data-entiere="${p.id}" alt="" loading="lazy" decoding="async"${src ? ` src="${echapper(src)}"` : ''}>
      ${etat.modeSelection ? `<span class="pht-coche" aria-hidden="true">${rangDansLeChoix(p)}</span>` : ''}
      ${badgeNote(p)}${badgePubliee(p)}
    </button>`;
}

function gabaritLoupe(liste) {
  if (!liste.some((p) => p.id === lr.loupe)) lr.loupe = liste[0]?.id ?? null;
  const p = photo(lr.loupe);
  if (!p) return '';
  const k = liste.indexOf(p);
  const debut = Math.max(0, Math.min(k - 8, liste.length - 17));
  return `<div class="lr-loupe">
      <div class="lr-scene">
        <button type="button" class="pht-vue-fleche" data-lr="voisine" data-valeur="-1" aria-label="Photo précédente"${k > 0 ? '' : ' disabled'}>${svg('gauche', 22)}</button>
        ${cadre(p)}
        <button type="button" class="pht-vue-fleche" data-lr="voisine" data-valeur="1" aria-label="Photo suivante"${k < liste.length - 1 ? '' : ' disabled'}>${svg('droite', 22)}</button>
      </div>
      <aside class="lr-cote" aria-label="Trier cette photo">
        <p class="lr-infos"><span>${p.prise_le ? echapper(momentLong(p.prise_le)) : 'Date inconnue'}</span>
          <span class="discret">${[p.largeur ? `${p.largeur} × ${p.hauteur}` : null, echapper(p.nom)].filter(Boolean).join(' · ')}</span>
          ${priseEnClair(p.prise).map((l) => `<span class="lr-prise">${echapper(l)}</span>`).join('')}</p>
        ${panneauTri('loupe')}
        <div class="lr-presse">
          <button type="button" class="car-puce" data-pht="copier" title="Copier les étiquettes et les personnes (Maj + C)">${svgLr('copier', 15)}<span>Copier</span></button>
          <button type="button" class="car-puce" data-pht="coller" title="${echapper(motDeLaPresse())}"${lr.presse ? '' : ' disabled'}>${svgLr('coller', 15)}<span>Coller</span></button>
        </div>
        <button type="button" class="car-puce" data-lr="plein">${svgLr('plein', 15)}<span>Plein écran, télécharger, retirer</span></button>
      </aside>
      <div class="lr-pellicule" role="group" aria-label="Les photos autour">${liste.slice(debut, debut + 17).map((q) =>
        `<button type="button" class="lr-vue${q === p ? ' active' : ''}" data-lr="voir" data-valeur="${q.id}"
          aria-label="${echapper(nomDeLaPhoto(q))}"${q === p ? ' aria-current="true"' : ''}><img data-vignette="${q.id}" alt="" decoding="async"${
          q.vignette ? ` src="${echapper(q.vignette)}"` : ''}></button>`).join('')}</div>
    </div>`;
}

// LE CADRE D'UNE PHOTO QU'ON PEUT GROSSIR : un clic va à 100 % sur le point
// touché, un second revient ; à 100 %, on la tire. Les deux cadres d'une
// comparaison regardent le MÊME point : c'est ce qui permet de juger la netteté.
function cadre(p) {
  const src = p.blob ? (p.urlLocale ??= URL.createObjectURL(p.blob)) : p.url ?? p.vignette ?? '';
  return `<div class="lr-cadre${lr.zoom ? ' grossi' : ''}" data-lr-cadre data-l="${p.largeur ?? 0}" data-h="${p.hauteur ?? 0}"
      role="img" aria-label="${echapper(nomDeLaPhoto(p))}${lr.zoom ? ', à 100 %' : ''}" title="${lr.zoom ? 'Cliquer pour voir en entier (Z)' : 'Cliquer pour voir à 100 % (Z)'}">
      <img class="lr-photo" data-entiere="${p.id}" src="${echapper(src)}" alt="" draggable="false">
    </div>`;
}

function mesuresDuCadre(el) {
  const img = el.querySelector('img');
  const l = Number(el.dataset.l) || img.naturalWidth;
  const h = Number(el.dataset.h) || img.naturalHeight;
  const L = el.clientWidth, H = el.clientHeight;
  if (!l || !h || !L || !H) return null;
  const ajuste = Math.min(L / l, H / h);
  // 100 % : un pixel de la photo pour un pixel de l'ÉCRAN. Si elle y tient déjà
  // presque, on double — un clic qui ne change rien n'est pas un zoom.
  let k = 1 / (window.devicePixelRatio || 1);
  if (k < ajuste * 1.25) k = Math.max(1, ajuste * 2);
  return { img, l, h, L, H, ajuste, k };
}
const borner = (v, vue, total) => (total <= vue ? 0.5 : Math.min(1 - vue / 2 / total, Math.max(vue / 2 / total, v)));

function poserLeZoom() {
  hote?.querySelectorAll('[data-lr-cadre]').forEach((el) => {
    const img = el.querySelector('img');
    el.classList.toggle('grossi', Boolean(lr.zoom));
    const m = lr.zoom && mesuresDuCadre(el);
    if (!m) { img.style.transform = ''; return; }
    const x = borner(lr.zoom.x, m.L, m.l * m.k);
    const y = borner(lr.zoom.y, m.H, m.h * m.k);
    const s = m.k / m.ajuste;
    const px = m.L / 2 + (x - 0.5) * m.l * m.ajuste;
    const py = m.H / 2 + (y - 0.5) * m.h * m.ajuste;
    img.style.transform = `translate(${m.L / 2 - s * px}px, ${m.H / 2 - s * py}px) scale(${s})`;
  });
}

function brancherLeZoom(racine) {
  let prise = null;
  racine.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('[data-lr-cadre]');
    if (!el || e.button) return;
    e.preventDefault();
    const m = mesuresDuCadre(el);
    if (!m) return;
    prise = { el, m, x: e.clientX, y: e.clientY, bouge: false,
      depart: lr.zoom && { x: borner(lr.zoom.x, m.L, m.l * m.k), y: borner(lr.zoom.y, m.H, m.h * m.k) } };
    el.setPointerCapture?.(e.pointerId);
  });
  racine.addEventListener('pointermove', (e) => {
    if (!prise) return;
    const dx = e.clientX - prise.x, dy = e.clientY - prise.y;
    if (Math.hypot(dx, dy) > 4) prise.bouge = true;
    if (!prise.bouge || !prise.depart) return;
    const { m } = prise;
    lr.zoom = { x: borner(prise.depart.x - dx / (m.l * m.k), m.L, m.l * m.k), y: borner(prise.depart.y - dy / (m.h * m.k), m.H, m.h * m.k) };
    poserLeZoom();
  });
  racine.addEventListener('pointerup', (e) => {
    if (!prise) return;
    const { el, m, bouge } = prise;
    prise = null;
    if (bouge) return;
    if (lr.zoom) lr.zoom = null;
    else {
      const r = el.getBoundingClientRect();
      const serre = (v) => Math.min(1, Math.max(0, v));
      lr.zoom = { x: serre(0.5 + (e.clientX - r.left - m.L / 2) / (m.l * m.ajuste)), y: serre(0.5 + (e.clientY - r.top - m.H / 2) / (m.h * m.ajuste)) };
    }
    poserLeZoom();
  });
  racine.addEventListener('pointercancel', () => { prise = null; });
}

// COMPARER DEUX PHOTOS : celle de gauche tient, celle de droite avance. On note
// sous chacune, et « Garder celle-ci » fait passer la droite à gauche.
function gabaritComparer(liste) {
  const ids = new Set(liste.map((p) => p.id));
  if (!ids.has(lr.paire[0])) lr.paire[0] = liste[0]?.id ?? null;
  if (!ids.has(lr.paire[1]) || lr.paire[1] === lr.paire[0]) {
    const k = liste.findIndex((p) => p.id === lr.paire[0]);
    lr.paire[1] = (liste[k + 1] ?? liste[k - 1])?.id ?? null;
  }
  const deux = lr.paire.map(photo);
  if (!deux[1]) return '<p class="car-liste-vide">Il faut deux photos pour comparer.</p>';
  const k = liste.indexOf(deux[1]);
  const volet = (p, i) => `<figure class="lr-volet">
      ${cadre(p)}
      <figcaption>
        <div class="pht-etoiles" data-tri-etoiles="cmp${i}">${etoilesTri(`cmp${i}`)}</div>
        <span class="lr-volet-infos discret">${[p.prise_le ? echapper(momentLong(p.prise_le)) : null, priseEnClair(p.prise)[0] ?? null].filter(Boolean).join(' · ')}</span>
        ${i ? `<button type="button" class="car-icone" data-lr="cmp-voisine" data-valeur="-1" aria-label="Photo précédente à droite" title="Précédente (←)"${k > 0 ? '' : ' disabled'}>${svg('gauche')}</button>
          <button type="button" class="car-icone" data-lr="cmp-voisine" data-valeur="1" aria-label="Photo suivante à droite" title="Suivante (→)"${k < liste.length - 1 ? '' : ' disabled'}>${svg('droite')}</button>
          <button type="button" class="car-puce" data-lr="cmp-garder" title="Elle passe à gauche">Garder celle-ci</button>`
        : `<button type="button" class="car-icone" data-lr="cmp-echanger" aria-label="Échanger les deux photos" title="Échanger">${svgLr('echanger', 17)}</button>`}
      </figcaption></figure>`;
  return `<div class="lr-comparer">${deux.map(volet).join('')}</div>`;
}

function avancerLaComparaison(pas) {
  const liste = photosAffichees();
  let k = liste.findIndex((p) => p.id === lr.paire[1]) + pas;
  if (liste[k]?.id === lr.paire[0]) k += pas;
  if (!liste[k]) return;
  lr.paire[1] = liste[k].id;
  dessiner();
}

// --- Copier les étiquettes -----------------------------------------------------------------------
//
// Les mots et les personnes, jamais la note : elle juge UNE photo. Ni le noir et
// blanc ni le flou, qui se lisent dans l'image. Coller AJOUTE, sans rien retirer.
function copierLesEtiquettes(p) {
  if (!p) return;
  const lues = (etat.etiquettes ?? []).filter((e) => ['noir et blanc', 'flou de mouvement'].includes(sansAccent(e.nom))).map((e) => e.id);
  lr.presse = { etiquettes: [...p.etiquettes].filter((id) => !lues.includes(id)), personnes: [...p.personnes] };
  if (!lr.presse.etiquettes.length && !lr.presse.personnes.length) {
    lr.presse = null;
    messageCourt('Cette photo n’a rien à copier.');
    return;
  }
  messageCourt(`Copié : ${motDeLaPresse()}.`);
  majBarreSelection();
  hote?.querySelectorAll('.lr-presse [data-pht="coller"]').forEach((b) => { b.disabled = false; b.title = motDeLaPresse(); });
}

function motDeLaPresse() {
  if (!lr.presse) return 'Rien de copié';
  return [...lr.presse.etiquettes.map((id) => (etat.etiquettes ?? []).find((e) => e.id === id)?.nom),
    ...lr.presse.personnes.map((id) => (etat.personnes ?? []).find((c) => c.id === id)?.nom)].filter(Boolean).join(', ');
}

function collerLesEtiquettes(cibles, ancre) {
  if (!lr.presse || !cibles.length) return;
  const ajouts = [];
  for (const quoi of ['etiquettes', 'personnes']) {
    for (const id of lr.presse[quoi]) {
      const sans = cibles.filter((p) => !p[quoi].has(id));
      if (sans.length) ajouts.push({ quoi, id, sans });
    }
  }
  if (!ajouts.length) { messageCourt('Tout y est déjà.'); return; }
  if (lr.presse.etiquettes.length) noterRecentes(cibles.map((p) => p.id).slice(0, 10));
  messageCourt(`Collé sur ${cibles.length} photo${cibles.length > 1 ? 's' : ''} : ${motDeLaPresse()}.`);
  ecrire({
    cibles,
    appliquer: () => ajouts.forEach(({ quoi, id, sans }) => sans.forEach((p) => p[quoi].add(id))),
    defaire: () => ajouts.forEach(({ quoi, id, sans }) => sans.forEach((p) => p[quoi].delete(id))),
    appel: (ids) => Promise.all(ajouts.map(({ quoi, id, sans }) => {
      const eux = sans.map((p) => p.id).filter((x) => ids.includes(x));
      return eux.length ? (quoi === 'etiquettes' ? api.etiqueterPhotos : api.relierPersonne)(eux, id) : null;
    })),
    ancre,
    message: 'Les étiquettes n’ont pas pu être collées.',
    mot: 'le collage',
  });
}

// --- Les piles -----------------------------------------------------------------------------------

function tuileEmpilee({ p, rafale, cle, ouverte }, dessin) {
  if (!rafale) return dessin(p);
  return `<div class="lr-pile${ouverte ? ' ouverte' : ''}">${dessin(p)}
      ${!ouverte || rafale[0] === p ? `<button type="button" class="lr-pile-n" tabindex="-1" data-lr="pile" data-valeur="${cle}" aria-expanded="${ouverte}"
        aria-label="${ouverte ? 'Replier' : 'Déplier'} la rafale de ${rafale.length} photos" title="${ouverte ? 'Replier' : 'Déplier'} la rafale">${svgLr('piles', 13)}${rafale.length}</button>` : ''}
    </div>`;
}

function barreDeVue(nombre) {
  const formes = [['grille', 'Grille (G)'], ['deux', 'Deux par deux (D)'], ['une', 'Une photo (E)'], ['comparer', 'Comparer deux photos (C)']].map(([cle, nom]) =>
    `<button type="button" class="lr-forme${lr.forme === cle ? ' actif' : ''}" data-lr="forme" data-valeur="${cle}"
       aria-pressed="${lr.forme === cle}" aria-label="${nom}" title="${nom}"${nombre ? '' : ' disabled'}>${svgLr(cle, 18)}</button>`).join('');
  return `<div class="lr-barre">
      <div class="lr-formes" role="group" aria-label="Mise en forme">${formes}</div>
      ${lr.forme === 'grille' ? `<label class="lr-taille"><span class="hors-ecran">Taille des vignettes</span>
        <input type="range" min="90" max="420" step="10" value="${lr.taille}" data-lr-taille></label>` : ''}
      ${['grille', 'deux'].includes(lr.forme) ? `<button type="button" class="lr-forme lr-piles${lr.piles ? ' actif' : ''}" data-lr="piles" data-valeur=""
        aria-pressed="${lr.piles}" aria-label="Empiler les rafales" title="Empiler les rafales (S)">${svgLr('piles', 18)}</button>` : ''}
      ${rangeeDOutils(nombre, 0)}
    </div>`;
}

function centreOrdi() {
  if (vueCourante === 'liste') return gabaritListe();
  const m = enMatch();
  const total = m ? photosDuMatch(cible).length : etat.photos.length;
  const liste = photosAffichees();
  const match = m ? matchDe(cible) : null;
  const n = nbFiltres();
  const titre = !m ? collectionOuverte()?.nom ?? 'Toutes les photos' : cible === SANS_MATCH ? 'Sans match' : match?.titre ?? 'Match';
  const corps = !total
    ? (m ? `<div class="car-import" data-depot>
          <p class="car-import-titre">Les photos de ce match</p>
          <p class="car-import-texte">Choisis tes exports retouchés — ou glisse ici le dossier entier.</p>
          <button type="button" class="car-bouton-or" data-pht="choisir">${svg('importer')}<span>Choisir des photos</span></button>
        </div>` : '<p class="car-liste-vide">Importe un match : ses photos se chercheront ici.</p>')
    : !liste.length ? '<p class="car-liste-vide">Aucune photo ne coche tout. Retire un filtre.</p>'
      : lr.forme === 'une' ? gabaritLoupe(liste)
      : lr.forme === 'comparer' ? gabaritComparer(liste)
        : (() => {
          const dessin = lr.forme === 'deux' ? tuileEntiere : tuile;
          return grilleEnPaquets(lr.piles ? empiler(liste, lr.ouvertes) : liste,
            lr.piles ? (x) => tuileEmpilee(x, dessin) : dessin,
            `lr-${lr.forme}${etat.modeSelection ? ' en-selection' : ''}`, ` style="--lr-taille:${lr.taille}px" data-depot`);
        })();
  return `<header class="lr-tete">
      <h2 class="lr-titre">${echapper(titre)}</h2>
      <span class="lr-compte">${n ? `<span class="chiffre">${liste.length}</span> sur ${total}` : `<span class="chiffre">${total}</span> photo${total > 1 ? 's' : ''}`}</span>
      ${match ? `<span class="lr-compte">${jourCourt(match.date_debut)}</span>${champCompetition(match)}` : ''}
      ${m ? '<p class="car-etat" data-pht-etat></p>' : ''}
    </header>
    ${total ? barreDeFiltres() : ''}
    ${corps}
    ${gabaritBarreSelection()}
    ${total ? barreDeVue(liste.length) : ''}
    ${m ? '<input type="file" class="car-fichier" accept="image/*" multiple hidden data-pht-fichier>' : ''}`;
}

function gabaritOrdi() {
  const panneau = panneauOutil();
  return `<div class="lr${panneau ? '' : ' sans-panneau'}">
      ${railDOutils()}
      ${panneau ? `<aside class="lr-panneau" data-lr-defile aria-label="Panneau">${panneau}</aside>` : ''}
      <section class="lr-centre">${centreOrdi()}</section>
    </div>`;
}

function changerDeForme(forme, id = null) {
  if (forme === 'comparer') {
    const [a, b] = [...etat.selection];
    const un = a ?? lr.loupe;
    if (un) lr.paire = [un, b ?? null];
    if (['grille', 'deux'].includes(lr.forme)) lr.avant = lr.forme;
    etat.modeSelection = false;
    etat.selection = new Set();
  }
  if (forme === 'grille' || forme === 'deux') lr.zoom = null;
  if (forme === 'une') {
    if (lr.forme === 'comparer') id ??= lr.paire[1];
    if (['grille', 'deux'].includes(lr.forme)) lr.avant = lr.forme;
    lr.loupe = id ?? lr.loupe ?? [...etat.selection][0] ?? null;
    if (etat.modeSelection) { etat.modeSelection = false; etat.selection = new Set(); }
  }
  lr.forme = forme;
  etat.menuOrdre = false;
  etat.ajout = null;
  etat.recherche = '';
  etat.quiOuvert = false;
  garderLr();
  dessiner();
  if (forme === 'une' || forme === 'comparer') window.scrollTo(0, 0);
  else if (lr.loupe) {
    const k = suite.items.findIndex((x) => (x.p ?? x).id === lr.loupe);
    while (k >= suite.n) poserLaSuite();
    hote.querySelector(`[data-ouvrir="${lr.loupe}"]`)?.scrollIntoView({ block: 'center' });
  }
}

function voisineDeLaLoupe(pas) {
  const liste = photosAffichees();
  const k = liste.findIndex((p) => p.id === lr.loupe);
  const suivante = liste[k + pas];
  if (!suivante) return;
  lr.loupe = suivante.id;
  etat.ajout = null;
  etat.recherche = '';
  etat.quiOuvert = false;
  dessiner();
}

function brancherOrdi(racine) {
  brancherTri(racine);
  brancherLeZoom(racine);
  racine.addEventListener('load', (e) => { if (e.target.matches?.('.lr-photo')) poserLeZoom(); }, true);
  racine.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lr]');
    if (!b) return;
    const { lr: quoi, valeur } = b.dataset;
    if (quoi === 'panneau') {
      lr.panneau = lr.panneau === valeur ? null : valeur;
      if (lr.panneau === 'import') { chargerLesSorties(); lireLaPlace(); }
      garderLr();
      dessiner();
    } else if (quoi === 'filtres') basculerLesFiltres();
    else if (quoi === 'menu') { lr.menu = lr.menu === valeur ? null : valeur; redessinerSurPlace(); }
    else if (quoi === 'rangement') { lr.rangement = valeur; garderLr(); dessiner(); }
    else if (quoi === 'toutes') {
      // « Toutes » veut dire toutes : une collection ouverte se referme.
      if (collectionOuverte()) { etat.filtres = nouveauxFiltres(); etat.collection = null; if (vueCourante === 'recherche') dessiner(); }
    } else if (quoi === 'forme') changerDeForme(valeur);
    else if (quoi === 'voisine') voisineDeLaLoupe(Number(valeur));
    else if (quoi === 'pile') {
      if (lr.ouvertes.has(valeur)) lr.ouvertes.delete(valeur); else lr.ouvertes.add(valeur);
      redessinerSurPlace();
    } else if (quoi === 'piles') { lr.piles = !lr.piles; garderLr(); dessiner(); }
    else if (quoi === 'cmp-voisine') avancerLaComparaison(Number(valeur));
    else if (quoi === 'cmp-echanger') { lr.paire.reverse(); dessiner(); }
    else if (quoi === 'cmp-garder') { lr.paire.reverse(); avancerApresChoix(); }
    else if (quoi === 'voir') { lr.loupe = valeur; dessiner(); }
    else if (quoi === 'plein' && lr.loupe) { etat.listeVue = photosAffichees().map((p) => p.id); ouvrir(lr.loupe); }
  });
  racine.addEventListener('toggle', (e) => {
    const cle = e.target.dataset?.lrGroupe;
    if (!cle) return;
    lr.plies = e.target.open ? lr.plies.filter((x) => x !== cle) : [...new Set([...lr.plies, cle])];
    garderLr();
  }, true);
  racine.addEventListener('input', (e) => {
    if (!e.target.matches?.('[data-lr-taille]')) return;
    lr.taille = Number(e.target.value);
    racine.querySelector('.lr-grille')?.style.setProperty('--lr-taille', `${lr.taille}px`);
    garderLr();
  });
}

// UNE PILE REPLIÉE SE SÉLECTIONNE EN ENTIER : la barre dit le compte, et c'est ce
// qui permet d'étiqueter une rafale d'un geste.
function toucherUnePile(pile, id) {
  const tout = pile.every((p) => etat.selection.has(p.id));
  for (const p of pile) { if (tout) etat.selection.delete(p.id); else etat.selection.add(p.id); }
  etat.derniereTouchee = id;
  etat.confirmerRetraitSel = false;
  pile.forEach(majTuile);
  majBarreSelection();
}

function redessinerSurPlace() {
  const y = window.scrollY;
  dessiner();
  window.scrollTo(0, y);
}

// La gagnante tient la gauche ; la droite reprend après elle.
function avancerApresChoix() {
  const liste = photosAffichees();
  const k = liste.findIndex((p) => p.id === lr.paire[0]);
  const suite = liste.slice(k + 1).find((p) => p.id !== lr.paire[1]);
  if (suite) lr.paire[1] = suite.id;
  dessiner();
}
window.addEventListener('resize', () => { if (lr.zoom) poserLeZoom(); });

let clavierOrdiBranche = false;
function brancherClavierOrdi() {
  if (clavierOrdiBranche) return;
  clavierOrdiBranche = true;
  document.addEventListener('pointerdown', (e) => {
    if (lr.menu && hote?.isConnected && !e.target.closest?.('.lr-menu, .lr-menu-bouton')) {
      lr.menu = null;
      hote.querySelector('.lr-menu')?.remove();
      hote.querySelector('.lr-menu-bouton[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!hote?.isConnected || !enAtelier() || vueCourante === 'liste' || etat.ouverte || etat.pile || etat.fenetreTri) return;
    if (e.key === 'Escape' && fermerLeMenu()) { e.preventDefault(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    if (e.target.closest?.('input, textarea, select, dialog, [role="dialog"]')) return;
    if (e.shiftKey && /^[cv]$/i.test(e.key)) {
      const cibles = etat.modeSelection ? ciblesDu('selection') : lr.forme === 'une' ? ciblesDu('loupe') : [];
      if (!cibles.length) return;
      e.preventDefault();
      if (e.key.toLowerCase() === 'c') copierLesEtiquettes(cibles[0]); else collerLesEtiquettes(cibles, null);
      return;
    }
    if (e.key.toLowerCase() === 'f') { e.preventDefault(); basculerLesFiltres(); return; }
    if (e.key.toLowerCase() === 's' && ['grille', 'deux'].includes(lr.forme)) { lr.piles = !lr.piles; garderLr(); dessiner(); return; }
    if (e.key.toLowerCase() === 'z' && ['une', 'comparer'].includes(lr.forme)) { lr.zoom = lr.zoom ? null : { x: 0.5, y: 0.5 }; poserLeZoom(); return; }
    if (lr.forme === 'comparer') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); avancerLaComparaison(e.key === 'ArrowLeft' ? -1 : 1); return; }
      if (e.key === 'Escape') { changerDeForme(lr.avant); return; }
    }
    const forme = { g: 'grille', d: 'deux', e: 'une', c: 'comparer' }[e.key.toLowerCase()];
    if (forme) { e.preventDefault(); if (photosAffichees().length) changerDeForme(forme); return; }
    if (lr.forme !== 'une') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); voisineDeLaLoupe(e.key === 'ArrowLeft' ? -1 : 1); }
    else if (e.key === 'Escape') changerDeForme(lr.avant);
    else if (/^[0-5]$/.test(e.key)) {
      const p = photo(lr.loupe);
      if (!p) return;
      if (e.key !== '0') { if (p.note !== Number(e.key)) noter('loupe', Number(e.key), null); }
      else if (p.note) noter('loupe', p.note, null);
    }
  });
}

function dessiner() {
  if (!hote?.isConnected) return;
  hote.dataset.phtEcran = vueCourante;
  const ordi = enAtelier();
  const defile = ordi ? hote.querySelector('[data-lr-defile]')?.scrollTop ?? 0 : 0;
  // Les colonnes de filtres restent où on les a fait défiler.
  const ligne = hote.querySelector('[data-lr-ligne]')?.scrollLeft ?? 0;
  const colonnes = [...hote.querySelectorAll('[data-lr-colonne]')].map((c) => [c.dataset.lrColonne, c.scrollTop]);
  // Un bouton du rail ou de la barre garde le focus d'un rendu à l'autre.
  const repere = hote.contains(document.activeElement) ? repereDe(document.activeElement) : null;
  // LES IMAGES DÉJÀ CHARGÉES PASSENT D'UN RENDU À L'AUTRE : c'est le même élément,
  // déjà décodé, donc ni clignotement ni décodage à refaire.
  const anciennes = new Map([...hote.querySelectorAll('.pht-tuile img[data-vignette], .pht-tuile img[data-entiere]')]
    .filter((img) => img.complete && img.naturalWidth)
    .map((img) => [`${img.dataset.vignette ?? `e${img.dataset.entiere}`}`, img]));
  hote.innerHTML = ordi ? gabaritOrdi() : vueCourante === 'match' ? gabaritMatch()
    : vueCourante === 'recherche' ? gabaritRecherche() : gabaritListe();
  hote.querySelectorAll('.pht-tuile img[data-vignette], .pht-tuile img[data-entiere]').forEach((img) => {
    const ancienne = anciennes.get(`${img.dataset.vignette ?? `e${img.dataset.entiere}`}`);
    if (!ancienne || ancienne.getAttribute('src') !== img.getAttribute('src')) return;
    img.replaceWith(ancienne);
    ancienne.parentNode?.classList.add('prete');
  });
  guetterLaSuite();
  if (ordi) {
    const haut = document.querySelector('.yuno-nav');
    hote.style.setProperty('--pht-haut', `${haut && getComputedStyle(haut).position === 'sticky' ? haut.offsetHeight : 0}px`);
    const panneau = hote.querySelector('[data-lr-defile]');
    if (panneau) panneau.scrollTop = defile;
    const barre = hote.querySelector('[data-lr-ligne]');
    if (barre) barre.scrollLeft = ligne;
    placerLeMenu();
    for (const [cle, y] of colonnes) {
      const c = hote.querySelector(`[data-lr-colonne="${CSS.escape(cle)}"]`);
      if (c) c.scrollTop = y;
    }
    poserLeZoom();
  }
  poserLArret();
  if (repere) hote.querySelector(repere)?.focus({ preventScroll: true });
  majLigneDEtat();
  if (!etat.photos) return;
  const montrees = vueCourante !== 'liste'
    ? photosAffichees()
    : [...new Set((etat.photos ?? []).map(cleDuMatch))].flatMap((cle) => photosDuMatch(cle).slice(0, 3));
  signer(montrees).then(() => {
    // Les photos entières attendaient leur adresse.
    hote?.querySelectorAll('img[data-entiere]:not([src]), img[data-entiere][src=""]').forEach((img) => {
      const p = photo(img.dataset.entiere);
      if (p?.url) img.src = p.url;
    });
  });
}

// --- La grille au clavier (25 novembre 2026, audit) -----------------------------
//
// UN SEUL ARRÊT de tabulation pour toute la grille, puis les flèches : 188 arrêts
// séparaient la tête de la page de son pied. Entrée ouvre, R déplie la rafale.
let arret = null;
const tuilesDeLaGrille = () => [...(hote?.querySelectorAll('[data-ouvrir]') ?? [])];
function poserLArret() {
  const tuiles = tuilesDeLaGrille();
  const elue = tuiles.find((t) => t.dataset.ouvrir === arret) ?? tuiles[0];
  for (const t of tuiles) t.tabIndex = t === elue ? 0 : -1;
}
function deplacerDansLaGrille(t, touche) {
  let tuiles = tuilesDeLaGrille();
  const k = tuiles.indexOf(t);
  if (k === tuiles.length - 1 && suite.n < suite.items.length) { poserLaSuite(); tuiles = tuilesDeLaGrille(); }
  let cible = null;
  if (touche === 'ArrowRight') cible = tuiles[k + 1];
  else if (touche === 'ArrowLeft') cible = tuiles[k - 1];
  else if (touche === 'Home') cible = tuiles[0];
  else if (touche === 'End') cible = tuiles.at(-1);
  else {
    // La ligne d'à côté, au plus près de la même colonne.
    const r = t.getBoundingClientRect();
    const bas = touche === 'ArrowDown';
    const rang = bas ? tuiles.slice(k + 1) : tuiles.slice(0, k).reverse();
    let haut = null;
    let ecart = Infinity;
    for (const x of rang) {
      const b = x.getBoundingClientRect();
      if (bas ? b.top < r.bottom - 2 : b.bottom > r.top + 2) continue;
      if (haut !== null && Math.abs(b.top - haut) > 2) break;
      haut = b.top;
      if (Math.abs(b.left - r.left) < ecart) { ecart = Math.abs(b.left - r.left); cible = x; }
    }
  }
  if (!cible) return;
  arret = cible.dataset.ouvrir;
  poserLArret();
  cible.focus({ preventScroll: true });
  cible.scrollIntoView({ block: 'nearest' });
}

// --- Les raccourcis, en un seul endroit : « ? » ---------------------------------
function montrerLesRaccourcis() {
  if (document.querySelector('.pht-aide')) return;
  const ordi = enAtelier();
  const groupes = [
    ['Voir', ordi ? [['G', 'La grille'], ['D', 'Deux par deux'], ['E', 'Une photo'], ['C', 'Comparer deux photos'], ['Z', 'À 100 %'], ['F', 'Les filtres'], ['S', 'Empiler les rafales'], ['R', 'Déplier la rafale']] : []],
    ['Se déplacer', [['← ↑ ↓ →', 'D’une photo à l’autre'], ['Entrée', 'Ouvrir ou sélectionner'], ['Échap', 'Revenir']]],
    ['Trier', [['1 à 5', 'Noter'], ['0', 'Effacer la note'], ['→', 'Dans la pile : triée'], ['←', 'Dans la pile : plus tard'],
      ...(ordi ? [['⇧ C', 'Copier les étiquettes'], ['⇧ V', 'Coller les étiquettes']] : []), ['⌘ Z', 'Annuler']]],
    ['Sélectionner', [['⇧ clic', 'Jusqu’à cette photo'], ['⌘ clic', 'Une photo de plus']]],
  ].filter(([, lignes]) => lignes.length);
  const aide = document.createElement('dialog');
  aide.className = 'pht-aide';
  aide.setAttribute('aria-label', 'Les raccourcis');
  aide.innerHTML = `<div class="pht-fen-tete"><p class="pht-fen-titre">Les raccourcis</p>
      <button type="button" class="car-icone" aria-label="Fermer">${svg('fermer')}</button></div>
    <div class="pht-aide-corps">${groupes.map(([nom, lignes]) => `<section><h3>${nom}</h3><dl>${lignes.map(([k, mot]) =>
      `<div><dt>${k}</dt><dd>${mot}</dd></div>`).join('')}</dl></section>`).join('')}</div>`;
  aide.addEventListener('click', (e) => { if (e.target === aide || e.target.closest('button')) aide.close(); });
  aide.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === '?') aide.close(); });
  aide.addEventListener('close', () => aide.remove());
  document.body.append(aide);
  aide.showModal();
}

function brancher(racine) {
  racine.addEventListener('focusin', (e) => {
    const t = e.target.closest?.('[data-ouvrir]');
    if (t && arret !== t.dataset.ouvrir) { arret = t.dataset.ouvrir; poserLArret(); }
  });
  racine.addEventListener('keydown', (e) => {
    const t = e.target.closest?.('[data-ouvrir]');
    if (!t || e.metaKey || e.ctrlKey || e.altKey) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      deplacerDansLaGrille(t, e.key);
    } else if (e.key.toLowerCase() === 'r') {
      t.closest('.lr-pile')?.querySelector('.lr-pile-n')?.click();
    }
  });
  racine.addEventListener('click', (e) => {
    const pli = e.target.closest('summary[data-pli]');
    if (pli) garderLePli(pli.dataset.pli, !pli.parentElement.open);
  });
  // `load` ne remonte pas : on l'écoute en capture, une fois pour l'hôte.
  racine.addEventListener('load', (e) => {
    if (e.target.matches?.('img[data-vignette]')) vignettesVues.add(e.target.getAttribute('src'));
  }, true);
  racine.addEventListener('click', (e) => {
    const action = e.target.closest('[data-pht]');
    if (action) {
      const quoi = action.dataset.pht;
      if (quoi === 'importer') {
        etat.choisirMatch = true;
        chargerLesSorties();
        lireLaPlace();
        dessiner();
        racine.querySelector('[data-pht-match]')?.focus();
      } else if (quoi === 'annuler-choix') { etat.choisirMatch = false; dessiner(); }
      else if (quoi === 'choisir') racine.querySelector('[data-pht-fichier]')?.click();
      else if (quoi === 'relancer') relancerLesEchecs();
      else if (quoi === 'selectionner') {
        // L'icône bascule : elle ouvre la sélection, et la referme.
        if (etat.modeSelection) quitterLaSelection();
        else { etat.modeSelection = true; dessiner(); }
      } else if (quoi === 'filtres-tel') { etat.filtresTel = !etat.filtresTel; etat.menuOrdre = false; dessiner(); }
      else if (quoi === 'ordre-menu') { etat.menuOrdre = !etat.menuOrdre; dessiner(); }
      else if (quoi === 'pile') ouvrirLaPile();
      else if (quoi === 'raccourcis') montrerLesRaccourcis();
      else if (quoi === 'fin-selection') quitterLaSelection();
      else if (quoi === 'tout') {
        etat.selection = toutEstChoisi() ? new Set() : new Set(photosAffichees().map((p) => p.id));
        etat.confirmerRetraitSel = false;
        redessinerTri();
      } else if (quoi === 'trier-sel') { etat.fenetreTri = true; etat.ajout = null; etat.recherche = ''; dessinerFenetreTri(); }
      else if (quoi === 'retirer-sel') { etat.confirmerRetraitSel = true; majBarreSelection(); }
      else if (quoi === 'garder-sel') { etat.confirmerRetraitSel = false; majBarreSelection(); }
      else if (quoi === 'copier') copierLesEtiquettes(etat.modeSelection ? photo([...etat.selection][0]) : photo(lr.loupe));
      else if (quoi === 'coller') collerLesEtiquettes(etat.modeSelection ? ciblesDu('selection') : ciblesDu('loupe'), action);
      else if (quoi === 'retirer-sel-oui') retirerLaSelection(action);
      else if (quoi === 'garder-pour') garderLeChoix(action);
      else if (quoi === 'annuler-pour') { e.preventDefault(); etat.pourCharge = null; revenir(); }
      else if (quoi === 'effacer-filtres') {
        e.preventDefault();
        changerFiltres(() => {
          if (enMatch()) etat.filtresMatch = nouveauxFiltres();
          else etat.filtres = nouveauxFiltres();
        });
      }
      return;
    }
    const alb = e.target.closest('[data-alb], [data-alb-filtre], [data-alb-ordre]');
    if (alb) {
      const A = etat.albums;
      if (alb.dataset.alb === 'filtres') { A.panneau = !A.panneau; A.menuOrdre = false; }
      else if (alb.dataset.alb === 'ordre-menu') A.menuOrdre = !A.menuOrdre;
      else if (alb.dataset.alb === 'effacer') A.filtres = { competitions: new Set(), clubs: new Set(), mois: new Set() };
      else if (alb.dataset.albOrdre) { A.ordre = alb.dataset.albOrdre; A.menuOrdre = false; }
      else if (alb.dataset.albFiltre) {
        const ens = A.filtres[alb.dataset.albFiltre];
        if (ens.has(alb.dataset.valeur)) ens.delete(alb.dataset.valeur); else ens.add(alb.dataset.valeur);
      }
      const defile = window.scrollY;
      dessiner();
      window.scrollTo(0, defile);
      return;
    }
    const filtre = e.target.closest('[data-filtre]');
    if (filtre) {
      const { filtre: famille, valeur } = filtre.dataset;
      changerFiltres(() => {
        const ens = F()[famille];
        if (ens.has(valeur)) ens.delete(valeur); else ens.add(valeur);
      });
      return;
    }
    if (e.target.closest('[data-filtre-atrier]')) {
      changerFiltres(() => { F().atrier = !F().atrier; });
      return;
    }
    const depuis = e.target.closest('[data-filtre-depuis]')?.dataset.filtreDepuis;
    if (depuis) {
      lr.menu = null; // un seul choix : le menu se referme
      changerFiltres(() => { F().depuis = F().depuis === depuis ? null : depuis; });
      return;
    }
    if (e.target.closest('[data-filtre-jamais]')) {
      changerFiltres(() => { F().jamais = !F().jamais; });
      return;
    }
    const note = e.target.closest('[data-filtre-note]');
    if (note) {
      const k = Number(note.dataset.filtreNote);
      changerFiltres(() => { F().note = F().note === k ? 0 : k; });
      return;
    }
    const ordre = e.target.closest('[data-ordre]');
    if (ordre) {
      changerFiltres(() => {
        if (enMatch()) etat.ordreMatch = ordre.dataset.ordre; else etat.ordre = ordre.dataset.ordre;
        if (ordre.dataset.ordre === 'hasard') rebattre();
        etat.menuOrdre = false;
      });
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
    if (etat.modeSelection) {
      const pile = t.closest('.lr-pile:not(.ouverte)') && rafalesDe(photosAffichees()).get(t.dataset.ouvrir);
      if (pile && !e.shiftKey) toucherUnePile(pile, t.dataset.ouvrir);
      else toucherEnSelection(t.dataset.ouvrir, e.shiftKey);
    } else if (enAtelier()) changerDeForme('une', t.dataset.ouvrir);
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

// --- DE QUOI PARTIR : CINQ PHOTOS SUR LA PAGE CRÉER (21 novembre 2026) --------
//
// La demande de Noé : « mettre en avant 5 photos aléatoires… retomber sur une
// photo et y voir un potentiel pour un style de publication ». La page Créer
// pose un `[data-inspiration]`, ce module le remplit — comme l'aperçu d'une
// parution.
//
// UN HASARD QUI SERT, PAS UN HASARD PUR. Sur mille deux cents photos, un tirage
// uniforme ressortirait surtout des photos moyennes :
//   — JAMAIS PUBLIÉES d'abord : c'est la matière qui dort ;
//   — LES BIEN NOTÉES pèsent plus, une non notée garde sa chance (la pépite
//     qu'on n'avait pas vue), une photo à 1 ou 2 étoiles presque aucune ;
//   — CINQ MATCHS DIFFÉRENTS : sinon cinq photos de la même rafale ;
//   — DES ANCIENNES ET DES RÉCENTES, trois au plus de chaque moitié : c'est le
//     « retomber sur » de la demande.
//
// LE TIRAGE TIENT LA JOURNÉE, comme l'idée du jour, et change à minuit ;
// « Rebattre » en tire cinq autres. Rien n'est stocké.
const INSPIRATION_MONTREE = 5;
let graineInspiration = null;
let derniereInspiration = '';

function alea(graine) {
  let a = graine >>> 0 || 1;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poidsDInspiration(p) {
  if (!p.note) return 1;
  return p.note >= 3 ? p.note : 0.15;
}

function tirerLInspiration() {
  const jour = new Date().toISOString().slice(0, 10);
  const graine = graineInspiration ?? [...jour].reduce((g, c) => (g * 31 + c.charCodeAt(0)) >>> 0, 11);
  const hasard = alea(graine);
  const pretes = (etat.photos ?? []).filter((p) => p.cle && p.envoi === 'fait');
  const neuves = pretes.filter((p) => !p.parutions?.length);
  const viviers = neuves.length >= INSPIRATION_MONTREE ? neuves : pretes;
  // La moitié ancienne et la moitié récente, coupées à la date médiane.
  const dates = viviers.map((p) => p.prise_le ?? '').sort();
  const mediane = dates[Math.floor(dates.length / 2)] ?? '';
  // Tirage pondéré sans remise (Efraimidis–Spirakis) : chaque photo reçoit une
  // clé hasard^(1/poids), on garde les plus fortes.
  const classees = viviers
    .map((p) => ({ p, cle: hasard() ** (1 / poidsDInspiration(p)) }))
    .sort((a, b) => b.cle - a.cle);
  const tirees = [];
  const matchs = new Set();
  const moities = { ancienne: 0, recente: 0 };
  for (const passe of [true, false]) {
    for (const { p } of classees) {
      if (tirees.length >= INSPIRATION_MONTREE) break;
      if (tirees.includes(p)) continue;
      const m = cleDuMatch(p);
      const moitie = (p.prise_le ?? '') < mediane ? 'ancienne' : 'recente';
      // Première passe stricte ; la seconde comble si la réserve est petite.
      if (passe && (matchs.has(m) || moities[moitie] >= 3)) continue;
      tirees.push(p);
      matchs.add(m);
      moities[moitie] += 1;
    }
  }
  return tirees;
}

function legendeDInspiration(p) {
  const ev = p.evenement;
  const quand = ev?.date_debut ?? p.prise_le;
  const date = quand ? new Date(quand).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const match = [ev?.titre, date].filter(Boolean).join(' · ');
  const mots = (etat.etiquettes ?? [])
    .filter((e) => p.etiquettes?.has(e.id))
    .sort((a, b) => (a.famille === b.famille ? a.ordre - b.ordre : a.famille === 'recit' ? -1 : 1))
    .map((e) => e.nom);
  return { match, mots };
}

function gabaritInspiration(tirees) {
  if (!tirees.length) {
    return `<p class="vide insp-vide">Tes photos arriveront ici — importe ton prochain match dans la
      <a href="#yuno/phototheque">photothèque</a>.</p>`;
  }
  return `<div class="insp-mosaique">${tirees.map((p) => {
    const { match, mots } = legendeDInspiration(p);
    // CINQ DE MÊME TAILLE, côte à côte (correction de Noé) : la légende ne
    // garde que ce que la photo raconte ; le match se lit en l'ouvrant.
    return `<button type="button" class="insp-photo" data-insp="${p.id}"
        aria-label="Ouvrir la photo${match ? ` de ${echapper(match)}` : ''}"${match ? ` title="${echapper(match)}"` : ''}>
        ${p.vignette ? `<img src="${echapper(p.vignette)}" alt="" decoding="async">` : ''}
        <span class="insp-legende">${mots.length ? `<span class="insp-mots">${echapper(mots.slice(0, 2).join(' · '))}</span>` : ''}</span>
      </button>`;
  }).join('')}</div>
    <button type="button" class="insp-rebattre" data-insp-rebattre aria-label="Tirer cinq autres photos"
      title="Tirer cinq autres photos">${svg('rebattre', 16)}</button>`;
}

// LE COMPTE « À TRIER » DE LA PAGE CRÉER : la tuile pose un [data-a-trier],
// ce module y écrit le nombre.
export async function compteATrier(element) {
  if (!etat.photos) {
    try { await chargerEnSilence(); } catch { return; }
  }
  if (!element.isConnected) return;
  const n = pileATrier().length;
  element.textContent = String(n);
  element.closest('a')?.setAttribute('aria-label', `${n} photo${n > 1 ? 's' : ''} à trier`);
}

export async function inspiration(element) {
  if (!element.dataset.branche) {
    element.dataset.branche = 'oui';
    element.addEventListener('click', (e) => {
      if (e.target.closest('[data-insp-rebattre]')) {
        graineInspiration = Math.floor(Math.random() * 4294967296);
        inspiration(element);
        return;
      }
      const t = e.target.closest('[data-insp]');
      if (t) ouvrirLInspiration(photo(t.dataset.insp));
    });
  }
  // Le dernier tirage se repose tout de suite : la page Créer se redessine à
  // chaque geste, et cinq cases vides qui se remplissent à chaque fois
  // clignoteraient.
  if (derniereInspiration) element.innerHTML = derniereInspiration;
  else element.innerHTML = '<div class="insp-mosaique insp-attente">' + '<span class="insp-photo"></span>'.repeat(5) + '</div>';
  try {
    if (!etat.photos) await chargerEnSilence();
    const tirees = tirerLInspiration();
    await signer(tirees);
    const html = gabaritInspiration(tirees);
    derniereInspiration = html;
    if (element.isConnected && element.innerHTML !== html) element.innerHTML = html;
  } catch (e) {
    console.error('Photos de Créer non tirées', e);
  }
}

// LA PHOTO EN GRAND, ET DEUX GESTES : en faire un carrousel, voir son match.
let fenetreInspiration = null;

// UN VRAI `dialog` (25 novembre 2026, audit Apple) : le navigateur garde le
// focus dedans, rend la page derrière inerte et ferme à Échap. On rend le focus
// à la photo d'où l'on vient — par son identifiant, la mosaïque ayant pu être
// redessinée entre-temps.
function fermerLInspiration() {
  const fenetre = fenetreInspiration;
  if (!fenetre) return;
  fenetreInspiration = null;
  fenetre.close();
  fenetre.remove();
  document.querySelector(`[data-insp="${fenetre.dataset.de}"]`)?.focus({ preventScroll: true });
}

function ouvrirLInspiration(p) {
  if (!p) return;
  fermerLInspiration();
  const { match, mots } = legendeDInspiration(p);
  const etoiles = p.note ? '★'.repeat(p.note) : '';
  fenetreInspiration = document.createElement('dialog');
  fenetreInspiration.className = 'insp-fenetre';
  fenetreInspiration.dataset.de = p.id;
  fenetreInspiration.setAttribute('aria-label', match ? `Photo, ${match}` : 'Photo');
  fenetreInspiration.innerHTML = `
    <div class="insp-fenetre-cadre">
      <button type="button" class="insp-fermer" data-insp-fermer aria-label="Fermer">${svg('fermer', 18)}</button>
      <img src="${echapper(p.vignette ?? p.url ?? '')}" alt="">
      <div class="insp-fenetre-pied">
        <p class="insp-fenetre-legende">${match ? `<span>${echapper(match)}</span>` : ''}${
          etoiles ? `<span class="insp-etoiles">${etoiles}</span>` : ''}${
          mots.length ? `<span class="insp-mots">${echapper(mots.join(' · '))}</span>` : ''}</p>
        <div class="insp-gestes">
          <button type="button" class="car-puce" data-insp-carrousel>${svg('carrousel', 15)}<span>En faire un carrousel</span></button>
          ${p.evenement_id ? `<a class="car-puce" href="#yuno/phototheque/${echapper(p.evenement_id)}" data-insp-fermer>${svg('match', 15)}<span>Voir son match</span></a>` : ''}
        </div>
      </div>
    </div>`;
  fenetreInspiration.addEventListener('click', (e) => {
    if (e.target === fenetreInspiration || e.target.closest('[data-insp-fermer]')) { fermerLInspiration(); return; }
    const b = e.target.closest('[data-insp-carrousel]');
    if (b) carrouselDepuis(p, b);
  });
  fenetreInspiration.addEventListener('cancel', (e) => { e.preventDefault(); fermerLInspiration(); });
  document.body.append(fenetreInspiration);
  fenetreInspiration.showModal();
  fenetreInspiration.querySelector('[data-insp-carrousel]')?.focus();
  // La vignette s'affiche tout de suite, l'original la remplace une fois là.
  if (p.url && p.url !== p.vignette) {
    const original = new Image();
    original.onload = () => {
      const img = fenetreInspiration?.querySelector('.insp-fenetre-cadre img');
      if (img) img.src = p.url;
    };
    original.src = p.url;
  }
}

// Un carrousel neuf, cette photo dedans, et l'on y va.
async function carrouselDepuis(p, bouton) {
  bouton.disabled = true;
  try {
    const jour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const c = await api.creerCarrousel({ nom: `Carrousel du ${jour}` });
    await api.ajouterMediasDeCarrousel([{
      id: crypto.randomUUID(),
      carrousel_id: c.id,
      cle: p.cle,
      nom: p.nom,
      genre: 'photo',
      type: 'image/jpeg',
      taille: p.taille,
      photo_id: p.id,
    }]);
    relireAuProchainMontage();
    fermerLInspiration();
    location.hash = `#yuno/carrousel/${c.id}`;
  } catch (e) {
    console.error('Carrousel non créé', e);
    // La bulle vit dans la page, sous la fenêtre : on ferme pour qu'elle se lise.
    fermerLInspiration();
    messageCourt("Le carrousel n'a pas pu être créé.");
  }
}

export default {
  /** @param {HTMLElement} element @param {{ id?: string|null }} route */
  monter(element, { id = null } = {}) {
    hote = element;
    hote.classList.add('car-hote', 'pht-hote');
    brancherLaFenetre();
    brancher(hote);
    brancherOrdi(hote);
    brancherCollections(hote);
    brancherClavierOrdi();
    // DEUX CHOIX POSSIBLES, une même recherche : pour une parution
    // (`pour-<id>`) ou pour un carrousel (`carrousel-<id>`).
    const genre = id?.startsWith(PREFIXE_POUR) ? 'parution'
      : id?.startsWith(PREFIXE_CARROUSEL) ? 'carrousel' : null;
    const pour = genre ? id.slice((genre === 'parution' ? PREFIXE_POUR : PREFIXE_CARROUSEL).length) : null;
    // LA PHOTOTHÈQUE S'OUVRE SUR TOUTES SES PHOTOS : c'est la recherche,
    // sans filtre. Les albums par match sont une page à côté.
    const pileDemandee = id === A_TRIER;
    if (pileDemandee) {
      id = RECHERCHE;
      // L'adresse redevient celle de la photothèque : refermer la pile ne doit
      // pas la rouvrir.
      history.replaceState(null, '', '#yuno/phototheque');
    }
    const versRecherche = !id || id === RECHERCHE || pour;
    vueCourante = versRecherche ? 'recherche' : id === ALBUMS ? 'liste' : 'match';
    if (versRecherche && !pour) id = RECHERCHE;
    if (cible !== id) {
      etat.modeSelection = false;
      etat.selection = new Set();
      etat.fenetreTri = false;
      etat.pourCharge = null;
      etat.filtresMatch = nouveauxFiltres();
      etat.ordreMatch = 'match';
      etat.filtresTel = false;
      etat.menuOrdre = false;
      dessinerFenetreTri();
    }
    // CHOISIR POUR UNE PARUTION : la recherche, en sélection, avec ce qui est
    // déjà choisi — on part de là.
    etat.pour = pour;
    etat.pourGenre = genre;
    if (!pour) etat.pourCarrousel = null;
    if (pour) { etat.modeSelection = true; chargerLeChoix(); }
    cible = id;
    // Le choix du match d'un import se referme en entrant dans un match — pas
    // à chaque redessin de la photothèque, où il est en train de servir.
    if (vueCourante === 'match') { etat.choisirMatch = false; chargerLesSorties(); }
    if (id === RECHERCHE || pour) cible = id;
    if (lr.panneau === 'import' && ORDI.matches) chargerLesSorties();
    dessiner();
    const enCours = (etat.photos ?? []).some(enRoute);
    if (!etat.photos || (!enCours && Date.now() - etat.chargeLe > RELIRE_APRES_MS)) charger();
    if (pileDemandee) (chargementEnCours ?? Promise.resolve()).then(() => ouvrirLaPile());
  },
};
