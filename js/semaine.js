// « Ma semaine » — la page du dimanche soir (30 août 2026, demande de Noé :
// « je ferai cette programmation essentiellement sur ordinateur »).
//
// ELLE S'EST APPELÉE « Programmer la semaine » pendant une heure, le nom du
// geste plutôt que celui de la chose. Noé l'a raccourci le soir même. Le VERBE
// reste sur le bouton de l'accueil — « Programmer ma semaine » —, où il est à
// sa place : un bouton dit ce qui va se passer, un titre nomme ce qu'on
// regarde.
//
// POURQUOI ELLE EXISTE. Le rendez-vous du dimanche vivait sur l'accueil, en
// bandeau : il DISAIT la semaine — le club à 26 h, la formation en grappe, rien
// pour toi — et ne permettait de rien poser. Il fallait sortir de l'accueil,
// ouvrir le calendrier, retrouver la tâche, lui donner un jour, recommencer.
// Le constat était au bon endroit, le geste nulle part.
//
// LA RÈGLE DES DEUX RANGS la sort de l'accueil : programmer sa semaine est une
// décision, pas un réflexe. L'accueil ne garde donc qu'une PORTE, ouverte dans
// la même fenêtre horaire — dimanche à partir de 20 h, et le lundi. Ce que ça
// débloque n'est pas une économie, c'est de la place : la page peut porter une
// grille, un vivier et un bilan, ce qu'un bandeau d'accueil ne pouvait pas.
//
// CE QU'ELLE FAIT, dans l'ordre où on la lit :
//   1. le bilan de la semaine passée, en quelques chiffres — le miroir d'abord ;
//   2. la grille de la semaine qui vient, et à côté les tâches sans jour, qu'on
//      GLISSE dessus pour les programmer ;
//   3. ce que le hub voit, chaque constat portant son geste ;
//   4. « C'est ma semaine », qui ferme le rendez-vous.
//
// ELLE NE CALCULE RIEN ELLE-MÊME : le diagnostic et le bilan viennent de
// js/orientation.js, qui ne touche ni au réseau ni au DOM et s'éprouve hors
// écran. Elle dessine, elle branche, elle écrit.

import * as api from './api.js';
import {
  ajouterJours,
  depuisDateISO,
  dureeLisible,
  echapper,
  NOMS_ESPACES,
  ORDRE_ESPACES,
  versDateISO,
} from './format.js';
import {
  appliquerAuCalendrier,
  assemblerCalendrier,
  brancherCapture,
  brancherClavier,
  brancherDeplacement,
  brancherSelection,
  champsApresDeplacement,
  construireGrille,
  corrigerDepuisLeCalendrier,
  effacerDepuisLeCalendrier,
  fenetreCreation,
  fenetreDetail,
  jourSousLePoint,
  natureParDefaut,
  poserAuCalendrier,
  prendreEnMain,
  suivreLaMain,
  toutesLesNatures,
  viserLeJour,
} from './calendrier-commun.js';
import { modifierAussitot } from './ecriture.js';
import { brancherChoix, construireFenetre, construireFormulaire } from './gabarits.js';
import {
  bilanDeLaSemaine,
  diagnosticDeLaSemaine,
  pivotDeLaSemaine,
  semaineDe,
  blocsDeLaSemaine,
  pauseDuMidi,
  chargeViseeDeLaPeriode,
  fondreLesVoisins,
  JOURNEE_DEBUT,
  JOURNEE_FIN,
  poserLeBloc,
  periodeDuJour,
  semainePrecedente,
} from './orientation.js';
import { construireRendezVous } from './rendez-vous.js';
import { trierTaches } from './taches.js';

const PLUS = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
  aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>`;

const ESPACES = {
  photo: 'Yuno',
  fch: 'FC Hermitage',
  formation: 'Formation',
  perso: 'Perso',
};

// L'intervalle en toutes lettres, comme le rendez-vous l'écrivait : « du 31 août
// au 6 septembre ». Le relatif d'`echeanceLisible` est juste pour une échéance
// et absurde pour une borne de calendrier.
function bornesLisibles({ debut, fin }) {
  const jour = (iso, options) =>
    depuisDateISO(iso).toLocaleDateString('fr-FR', options).replace(/^1 /, '1er ');
  const memeMois = debut.slice(0, 7) === fin.slice(0, 7);
  return `${jour(debut, memeMois ? { day: 'numeric' } : { day: 'numeric', month: 'long' })} au ${jour(
    fin,
    { day: 'numeric', month: 'long' },
  )}`;
}

// --- LE BILAN, EN QUELQUES CHIFFRES ------------------------------------------
//
// « Un bilan de la semaine qui est passée en quelques chiffres » (Noé). Ce sont
// ceux du MIROIR, et aucun ne peut baisser à cause d'un oubli : tâches
// terminées, heures mesurées, humeur, pratiques d'habitudes. Nulle part
// un taux de réussite, une tâche non faite comptée, ou une comparaison avec la
// semaine d'avant — un bilan qui note la semaine passée transformerait le
// rendez-vous du dimanche en examen.
//
// UN ZÉRO NE S'AFFICHE PAS. « 0 victoire » est la première chose qu'on lirait
// d'une semaine calme, et c'est un constat d'échec pour une information nulle.
// C'est la règle des habitudes, appliquée ici : une série à zéro se tait.
const dixieme = (nombre) => nombre.toFixed(1).replace('.', ',').replace(',0', '');

export function construireBilan(bilan) {
  // LES VICTOIRES ONT QUITTÉ LE BILAN (1er septembre 2026, demande de Noé).
  // Elles ne disaient pas grand-chose ici : terminer une tâche en écrit une, si
  // bien que « 18 victoires » et « 17 tâches terminées » se lisaient côte à côte
  // comme deux mesures alors que la première recopiait presque la seconde. Elles
  // gardent leur page — « Le chemin » —, qui est faite pour les regarder.
  const chiffres = [
    bilan.taches && {
      valeur: String(bilan.taches),
      mot: bilan.taches > 1 ? 'tâches terminées' : 'tâche terminée',
    },
    bilan.minutes && {
      valeur: dureeLisible(bilan.minutes),
      mot: 'mesurées',
      // OÙ ELLES SONT PARTIES (1er septembre 2026, demande de Noé : « ajoute un
      // détail des heures mesurées »). Un total répond à « combien » ; le
      // dimanche soir on se demande plutôt « où ». Le détail reprend la place
      // que les victoires viennent de libérer.
      parts: bilan.detail ?? [],
    },
    bilan.humeur && {
      valeur: dixieme(bilan.humeur.moyenne),
      mot: 'd’humeur en moyenne',
      precision: `${bilan.humeur.jours} ${bilan.humeur.jours > 1 ? 'jours notés' : 'jour noté'}`,
    },
    bilan.habitudes && {
      valeur: String(bilan.habitudes),
      mot: bilan.habitudes > 1 ? 'habitudes tenues' : 'habitude tenue',
    },
  ].filter(Boolean);

  if (!chiffres.length) {
    return `<p class="vide">Rien de noté la semaine dernière. Ça arrive, et la
      semaine qui vient n'en sait rien.</p>`;
  }

  return `
    <ul class="bilan-chiffres">
      ${chiffres
        .map(
          (chiffre) => `
        <li>
          <span class="bilan-valeur chiffre">${echapper(chiffre.valeur)}</span>
          <span class="bilan-mot">${echapper(chiffre.mot)}</span>
          ${
            chiffre.precision
              ? `<span class="bilan-precision">${echapper(chiffre.precision)}</span>`
              : ''
          }
          ${
            // LA PASTILLE ET LE CHIFFRE, SUR UNE SEULE LIGNE (1er septembre
            // 2026, demande de Noé : « pas besoin du titre des espaces pour les
            // heures de la semaine passée, et intègre-les mieux pour que les
            // autres tuiles voisines ne soient pas impactées par leur ajout »).
            //
            // LES DEUX MOITIÉS DE LA DEMANDE N'EN FONT QU'UNE : c'était le nom
            // qui imposait une ligne par espace, donc une tuile plus haute, donc
            // ses voisines étirées avec elle — dans une grille, tout un rang
            // prend la hauteur du plus grand. Sans les noms, tout tient sur un
            // rang, et la tuile ne grandit pas plus que celle de l'humeur, qui
            // porte déjà sa précision.
            //
            // Le sens n'est pas perdu, il est DÉPLACÉ : `title` porte le nom au
            // survol, `aria-label` le donne au lecteur d'écran — qui, lui, ne
            // voit pas la couleur. C'est la parade déjà employée sur la ligne
            // d'une habitude, et la couleur suffit ici parce que c'est la MÊME
            // pastille que le décompte des heures, trois pixels plus bas.
            chiffre.parts?.length
              ? `<ul class="bilan-detail">${chiffre.parts
                  .map((part) => {
                    const nom = NOMS_ESPACES[part.espace] ?? part.espace;
                    const duree = dureeLisible(part.minutes);
                    return `<li data-espace="${echapper(part.espace)}" title="${echapper(
                      `${nom} — ${duree}`,
                    )}">
                      <span class="compte-rond" aria-hidden="true"></span>
                      <span class="bilan-detail-valeur chiffre" aria-label="${echapper(
                        `${nom} : ${duree}`,
                      )}">${echapper(duree)}</span>
                    </li>`;
                  })
                  .join('')}</ul>`
              : ''
          }
        </li>`,
        )
        .join('')}
    </ul>
    ${
      // LE CHIFFRE QUI DIT CE QUE LE HUB IGNORE, comme la première ligne de
      // « Le temps ». Sans lui, « 2 h 30 mesurées » se lirait comme une semaine
      // légère alors qu'il ne dit que le silence des durées.
      bilan.terminees
        ? `<p class="bilan-couverture discret">
             <span class="chiffre">${bilan.chiffrees}</span> des
             <span class="chiffre">${bilan.terminees}</span> choses terminées portent une durée.</p>`
        : ''
    }`;
}

// --- LE VIVIER : ce qui attend un jour ---------------------------------------
//
// DEUX GROUPES, et le second est celui qui manquait. Les tâches sans date sont
// ce que Noé a demandé ; celles dont la date est passée sans être faites
// restent autrement coincées dans la semaine d'avant — invisibles à la grille
// de la semaine qui vient, donc absentes de la programmation. Elles ne portent
// AUCUN mot de retard : « restées ouvertes » dit ce qui est, et le hub ne
// compte pas les jours perdus.
//
// MISE DE CÔTÉ POUR LA SEMAINE (30 août 2026, demande de Noé : « pouvoir
// enlever une tâche de l'affichage, car elle ne sera pas traitée cette
// semaine »). C'est `refusee_le` qui la porte, la MÊME colonne que le « pas
// aujourd'hui » des pistes du matin : dans les deux cas elle dit la date POUR
// LAQUELLE on a dit non. L'accueil la lit au jour, cet écran la lit à la
// semaine — d'où la comparaison au lundi, et non à aujourd'hui.
//
// Elle expire d'elle-même : dimanche prochain, `semaine.debut` aura avancé
// d'une semaine et la tâche reviendra dans le vivier. Une mise de côté qui
// durerait pour toujours serait une suppression déguisée.
export function vivierDeLaSemaine(taches, semaine) {
  const ouvertes = taches.filter((tache) => tache.statut !== 'fait');
  const ecartee = (tache) => tache.refusee_le === semaine.debut;

  return {
    sansDate: trierTaches(ouvertes.filter((tache) => !tache.echeance && !ecartee(tache))),
    derriere: trierTaches(
      ouvertes.filter((tache) => tache.echeance && tache.echeance < semaine.debut && !ecartee(tache)),
    ),
    // RIEN N'EST CACHÉ, c'est la règle du hub : ce qu'on écarte se retrouve, et
    // se remet d'un geste. Un × sans retour serait un piège.
    ecartees: trierTaches(
      ouvertes.filter((tache) => ecartee(tache) && (!tache.echeance || tache.echeance < semaine.debut)),
    ),
  };
}

// La croix : « pas cette semaine ». Discrète, à droite de la tuile, et jamais
// mêlée à la prise — on la met de côté, on ne la jette pas, et le geste doit
// donc se distinguer d'un doigt du geste qui la pose sur un jour.
const CROIX = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"></path></svg>`;

// LA DATE OÙ ELLE ÉTAIT POSÉE, à droite de la tuile (30 août 2026, demande de
// Noé). Une vraie date et non un relatif : « il y a 4 jours » compte les jours
// perdus, ce que le hub ne fait pas, et on reprogramme mieux en sachant quel
// jour on avait choisi. C'est aussi ce qui distingue, sans titre de groupe, une
// tâche qui a glissé d'une tâche qui n'a jamais eu de jour.
const jourPose = (iso) =>
  depuisDateISO(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

function ligneVivier(tache, projets, choisie) {
  const projet = tache.projet_id ? projets.find((candidat) => candidat.id === tache.projet_id) : null;
  const service = [NOMS_ESPACES[tache.espace] ?? tache.espace, projet?.nom].filter(Boolean);

  return `
    <li class="vivier-tache${choisie === tache.id ? ' vivier-choisie' : ''}"
      data-tache="${echapper(tache.id)}" data-espace="${echapper(tache.espace)}"
      data-priorite="${tache.priorite ?? 4}">
      <button type="button" class="vivier-prise" data-choisir="${echapper(tache.id)}"
        aria-pressed="${choisie === tache.id}"
        aria-label="${echapper(tache.titre)}${
          tache.echeance ? `, était posée le ${jourPose(tache.echeance)}` : ''
        } — poser sur un jour">
        <span class="vivier-corps">
          <span class="vivier-nom">${echapper(tache.titre)}</span>
          <span class="vivier-service">
            <span class="pastille" aria-hidden="true"></span>
            ${echapper(service.join(' · '))}
          </span>
        </span>
        ${
          tache.echeance
            ? `<span class="vivier-quand chiffre">${echapper(jourPose(tache.echeance))}</span>`
            : ''
        }
      </button>
      <button type="button" class="vivier-croix" data-ecarter="${echapper(tache.id)}"
        title="Pas cette semaine"
        aria-label="Mettre « ${echapper(tache.titre)} » de côté pour cette semaine"
        >${CROIX}</button>
    </li>`;
}

// Une tâche mise de côté : la même tuile, en retrait, et le geste inverse à la
// place de la croix. Elle ne se prend plus en main — la reprendre, c'est
// d'abord la remettre dans la liste.
function ligneEcartee(tache, projets) {
  const projet = tache.projet_id ? projets.find((candidat) => candidat.id === tache.projet_id) : null;
  const service = [NOMS_ESPACES[tache.espace] ?? tache.espace, projet?.nom].filter(Boolean);

  return `
    <li class="vivier-tache vivier-ecartee" data-espace="${echapper(tache.espace)}">
      <span class="vivier-prise">
        <span class="vivier-corps">
          <span class="vivier-nom">${echapper(tache.titre)}</span>
          <span class="vivier-service">
            <span class="pastille" aria-hidden="true"></span>
            ${echapper(service.join(' · '))}
          </span>
        </span>
        ${
          tache.echeance
            ? `<span class="vivier-quand chiffre">${echapper(jourPose(tache.echeance))}</span>`
            : ''
        }
      </span>
      <button type="button" class="lien-discret vivier-remettre"
        data-remettre="${echapper(tache.id)}"
        aria-label="Remettre « ${echapper(tache.titre)} » dans la liste">Remettre</button>
    </li>`;
}

export function construireVivier(vivier, projets, choisie = null, ecarteesOuvertes = false) {
  if (!vivier.sansDate.length && !vivier.derriere.length && !vivier.ecartees.length) {
    return `<p class="vide">Tout ce que tu as noté porte déjà un jour.</p>`;
  }

  // UNE SEULE LISTE, ET LES GLISSÉES EN TÊTE (30 août 2026, demande de Noé).
  // Elle en portait deux, sous « Sans date » et « Restées ouvertes » : deux
  // titres pour dire ce que la date à droite dit déjà, dans une colonne où
  // chaque ligne compte. Ce qui était posé et n'a pas été fait passe devant —
  // c'est ce qu'on reprogramme en premier.
  const aPoser = [...vivier.derriere, ...vivier.sansDate];

  const misesDeCote = vivier.ecartees.length
    ? `<details class="vivier-ecartees"${ecarteesOuvertes ? ' open' : ''}>
         <summary>${vivier.ecartees.length} ${
           vivier.ecartees.length > 1 ? 'mises' : 'mise'
         } de côté cette semaine</summary>
         <ul class="vivier-liste">${vivier.ecartees
           .map((tache) => ligneEcartee(tache, projets))
           .join('')}</ul>
       </details>`
    : '';

  return `
    ${
      aPoser.length
        ? `<ul class="vivier-liste">${aPoser
            .map((tache) => ligneVivier(tache, projets, choisie))
            .join('')}</ul>`
        : `<p class="vide">Plus rien à poser — tout est daté ou mis de côté.</p>`
    }
    ${misesDeCote}`;
}

// --- L'espace -----------------------------------------------------------------

export default {
  async monter(section) {
    const etat = {
      sources: {
        evenements: [],
        taches: [],
        objectifs: [],
        publications: [],
        commandes: [],
        contacts: [],
        projets: [],
        periodes: [],
        series: [],
        arbitrages: [],
        victoires: [],
        humeurs: [],
        habitudesFaits: [],
      },
      elements: [],
      semaine: semaineDe(pivotDeLaSemaine()),
      pivot: pivotDeLaSemaine(),
      diagnostic: null,
      bilan: null,
      // LES BLOCS DE LA SEMAINE — une proposition, et RIEN D'AUTRE (31 août
      // 2026, décision de Noé : « les blocs ne doivent être que de l'affichage,
      // pas besoin qu'ils soient enregistrés »). Ils vivent ici, dans l'état de
      // la page, et disparaissent au rechargement. Ce qui reste d'une
      // programmation, ce sont les TÂCHES qu'on a posées dedans.
      blocs: [],
      // Le bloc qu'on est en train de régler, s'il y en a un.
      blocRegle: null,
      // DEUX INTERRUPTEURS, ET PAS TROIS VUES (31 août 2026, Noé : « c'est le
      // foutoir complet ; plutôt que d'avoir trois options, donne-moi l'option
      // d'activer la vision des blocs et la vision de ce qui est posé, du style
      // case à cocher »).
      //
      // Ce que ça remplace : une bascule à trois positions — les blocs, ce qui
      // est posé, les deux —, dont la troisième superposait les barres à leurs
      // blocs et devenait illisible. Deux cases indépendantes disent la même
      // chose sans la troisième combinaison à nommer, et surtout : quand les
      // deux sont cochées, ce qui est posé s'écrit DANS le bloc au lieu de se
      // dessiner par-dessus.
      voirBlocs: true,
      voirPose: false,
      // DEUX GRILLES PLUTÔT QU'UNE SUPERPOSITION (1er septembre 2026, demande
      // de Noé : « j'aimerais avoir la possibilité d'avoir un affichage avec le
      // calendrier des blocs et le calendrier de ce qui est posé, mais pas
      // superposé »). Elle ne veut dire quelque chose que si les DEUX couches
      // sont demandées : il n'y a rien à séparer quand on n'en montre qu'une.
      separes: false,
      // La tâche prise en main AU DOIGT : on la choisit, puis on touche un
      // jour. Le glissement est un geste de souris — sur une liste verticale,
      // au doigt, il ne se distingue pas d'un défilement.
      choisie: null,
      // Le repli des mises de côté, retenu d'un rendu à l'autre.
      ecarteesOuvertes: false,
      validee: false,
      creation: null,
      // La barre touchée, et si l'on est en train de la corriger.
      detail: null,
      edition: false,
      message: null,
      echec: false,
    };

    let rafraichirLaCapture = null;
    // Posés plus bas, avec les écouteurs ; déclarés ici parce que les fonctions
    // de rendu s'en servent.
    let poserLEntreeClavier = null;

    const cible = (id) => section.querySelector(`#${id}`);

    const signaler = (message) => {
      etat.message = message;
      rendreMessage();
    };

    // L'ÉCHELLE VAUT DEUX REM PAR HEURE, ANCRÉE EN HAUT — et surtout PAS la
    // hauteur mesurée de la pile (1er septembre 2026). C'est ce que dit le CSS :
    // la graduation se répète toutes les 4 rem depuis le haut, et la hauteur
    // d'un bloc vaut sa durée en rem. Or la LIGNE a un plancher de 25 rem quand
    // l'échelle en fait 24 : une pile mesure 376 px là où la journée en vaut
    // 360, et prendre la mesure pour l'échelle décalait tout de 4 % — jusqu'à
    // une demi-heure au bas de la journée, sur la page dont le seul objet est de
    // placer. Le jour où « deux rem par heure » changera, c'est ici et dans le
    // CSS que ça se change ; rien n'est écrit en pixels.
    const pixelsParHeure = () =>
      2 * parseFloat(getComputedStyle(document.documentElement).fontSize);

    // GARDER L'ARRANGEMENT (1er septembre 2026, demande de Noé). Un seul chemin
    // pour les quatre gestes qui touchent aux blocs — glisser, régler, ajouter,
    // retirer : quatre appels recopiés auraient fini par ne plus enregistrer la
    // même chose, et c'est dans la copie oubliée qu'un geste cesse d'être gardé.
    //
    // L'ÉCRAN D'ABORD, LE RÉSEAU ENSUITE, comme partout — mais SANS retour en
    // arrière, et c'est une exception assumée : l'arrangement est déjà à
    // l'écran et il vaut pour la session entière. Défaire le geste de Noé parce
    // que le réseau a hoqueté serait pire que de lui dire. On lui dit.
    const garderLesBlocs = () => {
      const aGarder = etat.blocs.map((bloc) => ({ ...bloc }));
      api.garderLesBlocs(etat.semaine.debut, aGarder).catch((erreur) => {
        console.error('Blocs non gardés', erreur);
        signaler("L’arrangement des blocs n’a pas pu être enregistré.");
      });
    };

    // L'HEURE SOUS LE POINT. La colonne étant graduée de 10 h à 22 h, la hauteur
    // du lâcher se lit directement comme une heure.
    const heureSousLePoint = (jourISO, y) => {
      const index = Math.round(
        (depuisDateISO(jourISO) - depuisDateISO(etat.semaine.debut)) / 86400000,
      );
      const pile = section.querySelectorAll('#bloc-grille .cal-pile')[index];
      if (!pile) return JOURNEE_DEBUT;

      const boite = pile.getBoundingClientRect();
      const minutes = JOURNEE_DEBUT + ((y - boite.top) / pixelsParHeure()) * 60;
      return Math.max(JOURNEE_DEBUT, Math.min(minutes, JOURNEE_FIN));
    };

    // LE REPÈRE, pendant le geste : un trait à l'heure ronde où le bloc va se
    // poser, avec cette heure écrite. Sans lui, « à quelle heure ça tombe »
    // resterait un pari qu'on ne découvre qu'au lâcher — et depuis que le
    // calage se fait à l'heure et non plus au rang, c'est la seule chose que le
    // geste ait besoin de dire.
    const viserLHeure = (jourISO, minutes) => {
      section.querySelector('.cal-visee')?.remove();
      if (!jourISO) return;

      const index = Math.round(
        (depuisDateISO(jourISO) - depuisDateISO(etat.semaine.debut)) / 86400000,
      );
      const pile = section.querySelectorAll('#bloc-grille .cal-pile')[index];
      if (!pile) return;

      const ronde = Math.max(
        JOURNEE_DEBUT,
        Math.min(Math.round(minutes / 60) * 60, JOURNEE_FIN),
      );
      const trait = document.createElement('span');
      trait.className = 'cal-visee';
      trait.style.top = `${((ronde - JOURNEE_DEBUT) / 60) * 2}rem`;
      trait.textContent = `${String(Math.floor(ronde / 60)).padStart(2, '0')}:00`;
      pile.append(trait);
    };

    section.addEventListener('pointermove', (evenement) => {
      const tenu = section.querySelector('.cal-type-bloc.en-deplacement');
      if (!tenu) return;

      const jourISO = jourSousLePoint(evenement.clientX, evenement.clientY);
      viserLHeure(jourISO, jourISO ? heureSousLePoint(jourISO, evenement.clientY) : 0);
    });

    // COMBIEN D'HEURES SONT PLACÉES (31 août 2026, demande de Noé : « il manque
    // un compteur des heures pour que je sache combien on a placé »). Une
    // pastille par espace, dans l'ordre des journées, avec le VISÉ en regard
    // quand il y en a un : « 26 h / 26 h » dit en trois signes que le club est
    // servi, ce qu'aucune lecture de la grille ne donne d'un coup d'œil.
    //
    // Yuno et le perso n'ont pas de quota — leur chiffre est seul, et c'est
    // exact : leur temps ne se déduit d'aucun objectif.
    function construireCompteur() {
      if (!etat.blocs.length) return '';

      const visees = chargeViseeDeLaPeriode(periodeDuJour(etat.sources.periodes, etat.pivot));
      const total = {};
      for (const bloc of etat.blocs) {
        total[bloc.espace] = (total[bloc.espace] ?? 0) + bloc.minutes;
      }

      // PAS DE COMPTEUR POUR LE PERSO (31 août 2026, correction de Noé), et
      // c'est la philosophie du hub qui parle : l'espace perso ne mesure rien.
      // Compter ses heures en ferait un quatrième chantier à tenir, alors que
      // ses blocs sont du temps gardé — le seul dont on ne demande jamais de
      // comptes.
      const lignes = ORDRE_ESPACES.filter(
        (espace) => espace !== 'perso' && total[espace],
      ).map((espace) => {
        const vise = visees[espace];
        const nom = NOMS_ESPACES[espace] ?? espace;
        const valeur = `${dureeLisible(total[espace])}${vise ? ` / ${dureeLisible(vise)}` : ''}`;

        // LE NOM DE L'ESPACE NE S'ÉCRIT PLUS (31 août 2026, demande de Noé) :
        // un rond de sa couleur le dit, et c'est la couleur qu'on lit de toute
        // façon en premier. Le sens n'est pas perdu, il est DÉPLACÉ — le nom
        // passe au survol et au lecteur d'écran, comme sur la ligne d'une
        // habitude ou la pastille d'un formulaire.
        return `
          <li data-espace="${echapper(espace)}" title="${echapper(`${nom} — ${valeur}`)}">
            <span class="compte-rond" aria-hidden="true"></span>
            <span class="compte-valeur chiffre"
              aria-label="${echapper(`${nom} : ${valeur}`)}">${echapper(valeur)}</span>
          </li>`;
      });

      return `<ul class="semaine-compteur">${lignes.join('')}</ul>`;
    }

    // À QUEL BLOC UNE TÂCHE APPARTIENT (31 août 2026, Noé explique sa logique, et
    // elle renverse le modèle) :
    //
    //   « L'horaire que je mets à mes tâches, c'est l'heure à laquelle je
    //     souhaite les avoir finies — je ne veux pas que ce soit trop rigide,
    //     j'ai juste ces tâches-là à faire avant cette heure, ce bloc. Donc ça
    //     n'a pas forcément de sens de respecter l'horaire dans l'affichage :
    //     elles appartiennent à ce bloc, c'est une LISTE dans le bloc, je peux
    //     les faire dans l'ordre que je veux. Il y a juste les événements et les
    //     publications qui respectent un horaire strict. »
    //
    // Une tâche « avant 13 h » appartient donc au bloc qui se termine à 13 h ou
    // avant — le dernier —, et non à celui qui contiendrait 13 h. C'est ce qui
    // manquait : le hub la cherchait DANS un créneau, et une tâche du matin
    // notée « 13 h » ne tombait dans aucun.
    // À QUEL BLOC UNE TÂCHE APPARTIENT — et seulement à un bloc DE SON ESPACE
    // (31 août 2026, dernière règle de Noé) :
    //
    //   « Les blocs Yuno et perso ne doivent pas être proposés par
    //     l'algorithme, il gère seulement FCH et formation. Les tâches Yuno et
    //     perso déjà posées se rangeront donc en fonction de leur horaire, et
    //     si elles n'en ont pas, dans un espace vide. »
    //
    // Une tâche Yuno ne se range donc plus dans un bloc du club faute de mieux :
    // elle n'a pas de cadre, et c'est exact — le hub ne programme pas son temps.
    // Elle se dessine à son heure, ou sous la journée si elle n'en a pas.
    //
    // L'HEURE D'UNE TÂCHE RESTE UNE ÉCHÉANCE : « ces tâches-là à faire avant
    // cette heure, ce bloc ». Elle appartient donc au bloc qui se termine à
    // cette heure ou avant — le dernier —, et non à celui qui la contiendrait.
    const blocDeLaTache = (element) => {
      const jour = versDateISO(element.date);
      const heure = element.date.getHours() * 60 + element.date.getMinutes();

      const siens = etat.blocs
        .filter((bloc) => bloc.jour === jour && bloc.espace === element.espace)
        .sort((a, b) => a.debut - b.debut);

      // SANS BLOC DE SON ESPACE — le cas de Yuno et du perso, que l'algorithme
      // ne programme plus — elle rejoint le bloc qui CONTIENT son heure, quel
      // qu'il soit (31 août 2026, règle de Noé : « si elles ont un horaire,
      // elles s'intègrent à un bloc qui correspond à leur horaire ; et si elles
      // en ont un et qu'il n'y a pas de bloc associé, elles se placent
      // simplement à leur horaire »).
      if (!siens.length) {
        if (!heure) return null;
        return (
          etat.blocs.find(
            (bloc) =>
              bloc.jour === jour &&
              heure >= bloc.debut &&
              heure < bloc.debut + bloc.minutes,
          ) ?? null
        );
      }

      // Sans heure, le premier bloc de son espace : c'est le seul lien qui
      // reste quand le temps ne dit rien.
      if (!heure) return siens[0];

      const dedans = siens.find(
        (bloc) => heure > bloc.debut && heure <= bloc.debut + bloc.minutes,
      );
      if (dedans) return dedans;

      const avant = siens.filter((bloc) => bloc.debut + bloc.minutes <= heure);
      return avant[avant.length - 1] ?? siens[0];
    };

    // LES TÂCHES SE POSENT DANS LEUR BLOC, EN VRAIES BARRES (31 août 2026,
    // corrections successives de Noé : « enlève le texte à l'intérieur des blocs
    // lorsque les 2 cases sont cochées… les éléments doivent être dans le bloc,
    // donc entre les pointillés, pas collés aux pointillés, et bien centrés »).
    //
    // CE QUE ÇA REMPLACE : une liste ÉCRITE dans le bloc, en texte nu. Elle
    // disait ce qu'il y avait, mais on ne pouvait rien en faire — pas de rond à
    // cocher, pas de menu, pas d'ouverture. Ce sont les barres elles-mêmes qui
    // entrent dans le cadre, avec tous leurs gestes.
    //
    // Elles ne peuvent pas être ENFANTS du bloc : un bouton ne s'imbrique pas
    // dans un bouton. Elles restent donc ses voisines dans la pile, et c'est
    // leur position qui les met dedans.
    function poserDansLesBlocs() {
      const hautDe = (element) => element.getBoundingClientRect().top;

      for (const barre of section.querySelectorAll('#bloc-grille .cal-type-bloc')) {
        const [, id] = barre.dataset.element.split(':');
        const bloc = etat.blocs.find((candidat) => candidat.id === id);
        if (!bloc) continue;

        const pile = barre.closest('.cal-pile');

        // MARGE INTÉRIEURE : rien ne touche le pointillé, ni sur les côtés ni
        // en haut ni en bas. Un cadre dont le contenu colle aux bords ne se lit
        // plus comme un cadre.
        //
        // ELLE SE DÉCLARE ICI, avant tout usage : posée plus bas, elle laissait
        // la zone morte d'un `const` derrière elle — la fonction levait une
        // ReferenceError au premier bloc, sans un mot à l'écran, et six barres
        // gardaient l'ancien placement. Un défaut muet de plus.
        // LA MÊME MARGE POUR TOUT LE MONDE (31 août 2026, Noé : « mets la même
        // marge qu'ont les tâches »). Elle est passée à 12 px pour les
        // événements le temps de comprendre qu'ils ne se détachaient pas — le
        // vrai défaut était ailleurs : ils restaient en position relative, où
        // `left` décale sans rétrécir. Une fois corrigé, six pixels suffisent.
        const MARGE = 6;
        const MARGE_STRICTE = MARGE;

        // TOUT CE QUI APPARTIENT AU BLOC SE RANGE DEDANS, centré avec le reste
        // (31 août 2026, Noé : « le placement des événements et des
        // publications n'est toujours pas bon, ce n'est pas centré »).
        //
        // Leur HEURE reste ce qui les rattache — un événement de 17 h 15 tombe
        // dans le bloc de 14 h–18 h et non ailleurs —, mais elle ne décide plus
        // de leur hauteur dans le cadre : deux règles de placement dans un même
        // rectangle, c'était le désordre qu'on voyait. Ce qui n'appartient à
        // aucun bloc, lui, garde sa place sur l'échelle.
        // LES TÂCHES DU BLOC, et elles seules : ce qui tient un horaire strict
        // garde sa hauteur — voir plus bas.
        const dedans = [...pile.querySelectorAll('.cal-type-tache')].filter((barreFille) => {
          const [, cle] = barreFille.dataset.element.split(':');
          const element = etat.elements.find(
            (candidat) => candidat.type === 'tache' && String(candidat.id) === cle,
          );
          return element && blocDeLaTache(element)?.id === bloc.id;
        });

        // TOUT CE QUI EST DANS LE CADRE EST CENTRÉ EN LARGEUR (31 août 2026,
        // correction de Noé : « il faut que ce soit centré dans la largeur du
        // bloc, pas dans la longueur ; il doit garder sa place par rapport à
        // l'horaire qu'il a »). La marge est la même des deux côtés — un cadre
        // dont le contenu s'appuie sur un seul bord ne se lit pas comme un
        // cadre.
        const strictsDuCadre = [...pile.querySelectorAll('.cal-type-evenement, .cal-type-publication')]
          .filter((barreFille) => {
            const [type, cle] = barreFille.dataset.element.split(':');
            const element = etat.elements.find(
              (candidat) => candidat.type === type && String(candidat.id) === cle,
            );
            if (!element || versDateISO(element.date) !== bloc.jour) return false;
            // CHEVAUCHER SUFFIT, il n'est pas besoin de commencer dedans
            // (31 août 2026, défaut mesuré : un entraînement de 17 h 15 dans un
            // bloc de 18 h 45 n'appartenait à aucun des deux, restait à son
            // heure, et venait mordre le cadre voisin de 6 px). Ce qui touche
            // un cadre est borné par lui.
            const debut = element.date.getHours() * 60 + element.date.getMinutes();
            const fin = debut + (element.minutes ?? 60);
            return debut < bloc.debut + bloc.minutes && fin > bloc.debut;
          });

        // ILS NE TOUCHENT JAMAIS LE POINTILLÉ (31 août 2026, demande de Noé) —
        // ni sur les côtés, ni en haut, ni en bas. Un événement porte SA durée
        // depuis ce jour-là : un match de deux heures dans un bloc de deux
        // heures viendrait sinon s'appuyer exactement sur le cadre, et l'on ne
        // verrait plus qu'un trait pour deux choses.
        //
        // On borne sa position et sa hauteur VISIBLE, jamais sa durée : c'est
        // le cadre qu'on respecte, pas le fait qu'on rogne.
        const cadreStrict = barre.getBoundingClientRect();
        const hautDeLaPile = pile.getBoundingClientRect().top;
        for (const strict of strictsDuCadre) {
          // MARQUÉ : la passe qui range sous l'échelle ne doit pas le
          // repositionner ensuite. C'est ce qui venait de casser le bornage —
          // elle le renvoyait à son heure, contre le pointillé.
          strict.dataset.dansBloc = '1';
          const r = strict.getBoundingClientRect();
          // EN ABSOLU, sans quoi `left`/`right` ne font que DÉCALER la barre :
          // en position relative, sa largeur ne change pas et elle sort du
          // cadre par la droite d'exactement ce qu'on lui a donné à gauche.
          // Mesuré : 12 px de marge à gauche, 12 px de débordement à droite.
          strict.style.position = 'absolute';
          const haut = Math.max(r.top, cadreStrict.top + MARGE_STRICTE) - hautDeLaPile;
          const basMax = cadreStrict.bottom - MARGE_STRICTE - hautDeLaPile;
          strict.style.left = `${MARGE_STRICTE}px`;
          strict.style.right = `${MARGE_STRICTE}px`;
          strict.style.top = `${haut}px`;
          // `height` et `min-height: 0`, PAS `max-height` : en CSS, un
          // `min-height` l'emporte sur un `max-height`, et celui de la barre
          // vaut sa durée. Mesuré : l'événement dépassait encore de 6 px du
          // cadre, exactement la marge qu'on venait de lui poser.
          strict.style.minHeight = '0';
          strict.style.height = `${Math.max(16, basMax - haut)}px`;
        }

        if (!dedans.length) continue;

        const cadre = cadreStrict;
        const hautPile = hautDeLaPile;

        // On mesure d'abord, on place ensuite : la hauteur totale sert à
        // CENTRER le groupe dans le cadre.
        for (const tache of dedans) {
          tache.dataset.dansBloc = '1';
          tache.style.position = 'absolute';
          tache.style.left = `${MARGE}px`;
          tache.style.right = `${MARGE}px`;
          tache.style.zIndex = '2';
        }

        // RIEN NE DÉPASSE DU CADRE (31 août 2026, demande de Noé : « ça ne doit
        // pas dépasser du bloc, s'il y en a trop mets un plus »). On garde ce
        // qui tient, on cache le reste, et on le COMPTE — un aperçu qui tronque
        // sans le dire ment sur ce qu'il montre.
        // LES TÂCHES COMMENCENT SOUS CE QUI TIENT UN HORAIRE STRICT : celui-ci
        // garde sa hauteur — c'est un fait posé —, elles n'ont qu'une limite.
        const plancher = strictsDuCadre.reduce((bas, strict) => {
          const r = strict.getBoundingClientRect();
          return Math.max(bas, r.bottom - hautPile + 2);
        }, cadre.top - hautPile + MARGE);

        const place = cadre.bottom - hautPile - MARGE - plancher;
        const hauteurs = dedans.map((barreFille) => barreFille.getBoundingClientRect().height);
        const pas = (hauteurs[0] ?? 18) + 2;

        let tiennent = Math.max(0, Math.floor((place + 2) / pas));
        tiennent = Math.min(tiennent, dedans.length);
        const reste = dedans.length - tiennent;

        for (const cachee of dedans.slice(tiennent)) cachee.style.display = 'none';

        const montres = dedans.slice(0, tiennent);
        let haut = plancher;

        for (const barreFille of montres) {
          barreFille.style.top = `${haut}px`;
          haut += pas;
        }

        if (reste > 0) {
          const compte = document.createElement('span');
          compte.className = 'bloc-deborde';
          compte.textContent = `+${reste}`;
          barre.append(compte);
        }
      }
    }

    // CE QU'AUCUN BLOC NE PORTE SE RANGE SOUS L'ÉCHELLE (31 août 2026, Noé :
    // « c'est le foutoir complet… retravaille l'intégration de ce qui est posé
    // dans les blocs »).
    //
    // DEUX SYSTÈMES DE PLACEMENT NE TIENNENT PAS DANS UNE COLONNE DE 130 px.
    // Poser ces barres à leur heure, comme les blocs, a été essayé et repris :
    // elles se couvraient entre elles — trois tâches de 13 h —, puis, une fois
    // décalées, débordaient sur le bloc suivant. Une barre de texte est plus
    // haute que la durée qu'elle occupe, et aucun réglage ne rattrape ça.
    //
    // Elles descendent donc sous la journée graduée, l'une après l'autre, avec
    // un filet pour dire où l'échelle s'arrête. La question qu'on se pose en
    // cochant les deux cases est « qu'est-ce qui n'est couvert par aucun
    // bloc ? » — et une liste y répond mieux qu'une superposition.
    function rangerSousLEchelle() {
      const piles = [...section.querySelectorAll('#bloc-grille .cal-pile')];
      for (const [rang, pile] of piles.entries()) {
        pile.style.minHeight = '';
        pile.querySelector('.separateur-hors-bloc')?.remove();

        // L'HEURE QU'ON A POSÉE PASSE AVANT TOUT (1er septembre 2026, règle de
        // Noé : « le critère n° 1 des tâches, c'est l'horaire fixé lorsqu'elle a
        // été posée ; puis si elles n'ont pas d'horaire elles doivent être
        // placées dans les espaces vides »).
        //
        // UNE TÂCHE EN FAIT PARTIE dès lors qu'aucun bloc ne la porte. C'est ce
        // qui manquait : un événement et une publication restaient à leur heure,
        // une tâche non — elle était glissée dans un trou, et la tâche Yuno de
        // 13 h se retrouvait à 16 h 42. Yuno et le perso n'ont pas de bloc, donc
        // AUCUNE de leurs tâches n'était jamais à l'heure prévue.
        //
        // Ça ne contredit pas la règle du 31 août — « l'heure d'une tâche est une
        // échéance, pas un créneau » : celle-là vaut DANS un bloc, où la tâche
        // est une liste qu'on fait dans l'ordre qu'on veut. Hors de tout bloc, il
        // n'y a plus de contenant pour dire quand ; il ne reste que l'heure, et
        // l'effacer serait perdre la seule chose que Noé ait dite.
        const stricts = [
          ...pile.querySelectorAll('.cal-type-evenement, .cal-type-publication, .cal-type-tache'),
        ].filter((barre) => barre.style.getPropertyValue('--depuis') && !barre.dataset.dansBloc);

        for (const barre of stricts) {
          barre.style.position = 'absolute';
          // LES DEUX BORDS À ZÉRO (1er septembre 2026, correction de Noé :
          // « l'événement perso n'est pas placé correctement, trop à droite,
          // pas centré »). Il portait `left: 10px; right: 0` : dix pixels d'un
          // côté et rien de l'autre, donc une colonne dont le contenu ne tombe
          // pas sur la même verticale que ce qui l'entoure. Ce qui est DANS un
          // cadre porte la même marge des deux côtés depuis le 31 août ; ce qui
          // est dehors n'a pas de cadre, donc pas de marge — comme les barres
          // sans heure juste en dessous.
          barre.style.left = '0';
          barre.style.right = '0';
          barre.style.top = barre.style.getPropertyValue('--depuis');
          barre.style.zIndex = '2';
        }

        // DEUX HORAIRES STRICTS À LA MÊME HEURE NE SE COUVRENT PAS non plus :
        // deux publications de 10 h tombent au même endroit. La seconde descend
        // sous la première — le fait le plus tôt garde sa place.
        let plafond = -Infinity;
        const hautDeLaPile = pile.getBoundingClientRect().top;
        for (const barre of stricts.sort(
          (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
        )) {
          const boite = barre.getBoundingClientRect();
          const depuis = boite.top - hautDeLaPile;
          const cale = Math.max(depuis, plafond);
          if (cale !== depuis) barre.style.top = `${cale}px`;
          plafond = cale + boite.height + 2;
        }

        // CE QUI RESTE SANS HEURE SE GLISSE DANS LES VIDES (31 août 2026, règle
        // de Noé : « les tâches perso et Yuno doivent s'intégrer dans les
        // espaces vides si elles n'ont pas d'horaire »). Les trous d'une
        // journée sont ce qu'aucun bloc n'occupe : c'est là qu'il reste du
        // temps, et c'est donc là qu'elles vont.
        // UN VIDE EST CE QUE RIEN N'OCCUPE — les blocs, mais aussi ce qui vient
        // d'être posé à son heure : sans ça, une tâche sans heure se glisserait
        // par-dessus la tâche Yuno de 13 h.
        const cadres = [
          ...pile.querySelectorAll('.cal-type-bloc'),
          ...stricts,
        ].map((b) => b.getBoundingClientRect());
        const hautPile = pile.getBoundingClientRect().top;

        // LA PAUSE DU MIDI N'EST PAS UN VIDE (1er septembre 2026, défaut trouvé
        // par Noé : « étant donné qu'il doit y avoir 1 h de libre entre 12 h et
        // 14 h, la tâche perso du mardi 1 ne peut pas être ici »).
        //
        // C'est la règle qui n'avait pas été mise à jour. L'algorithme garde une
        // heure libre entre 12 h et 14 h, et n'y pose aucun bloc ; la grille, qui
        // glisse dans les trous ce qui n'a pas d'heure, ne connaissait pas cette
        // décision et y voyait un trou comme un autre. Une heure gardée libre
        // qu'un autre écran remplit n'est plus une heure gardée libre.
        const jourDeLaPile = versDateISO(
          ajouterJours(depuisDateISO(etat.semaine.debut), rang),
        );
        const midi = pauseDuMidi(
          jourDeLaPile,
          etat.sources,
          etat.blocs.filter((bloc) => bloc.jour === jourDeLaPile),
        );
        if (midi) {
          // Deux rem par heure depuis le haut, comme le CSS et comme les blocs
          // — jamais la hauteur mesurée de la pile, qui la dépasse.
          const versHaut = (minutes) =>
            hautPile + ((minutes - JOURNEE_DEBUT) / 60) * pixelsParHeure();
          cadres.push({ top: versHaut(midi[0]), bottom: versHaut(midi[1]) });
        }

        cadres.sort((a, b) => a.top - b.top);
        const vides = [];
        let curseur = 0;
        for (const c of cadres) {
          const haut = c.top - hautPile;
          if (haut - curseur >= 18) vides.push([curseur, haut]);
          curseur = Math.max(curseur, c.bottom - hautPile);
        }
        vides.push([curseur, pile.getBoundingClientRect().height]);

        // ET SOUS L'ÉCHELLE, CE QUI N'APPARTIENT À AUCUN BLOC : les tâches sans
        // heure, celles d'un jour sans bloc. Elles n'ont pas de moment, elles
        // ont un jour.
        const barres = [...pile.querySelectorAll('.cal-barre-element:not(.cal-type-bloc)')].filter(
          (barre) =>
            !barre.dataset.dansBloc && getComputedStyle(barre).position !== 'absolute',
        );
        if (!barres.length) continue;

        const echelle = pile.getBoundingClientRect().height;
        const filet = document.createElement('span');
        filet.className = 'separateur-hors-bloc';
        filet.style.top = `${echelle + 4}px`;
        pile.append(filet);

        let bas = echelle + 8;
        let vide = 0;
        let dansLeVide = vides[0]?.[0] ?? 0;

        for (const barre of barres) {
          barre.style.position = 'absolute';
          barre.style.left = '0';
          barre.style.right = '0';

          // Un trou d'abord, le bas de la journée ensuite : une tâche sans
          // heure appartient au jour, et il vaut mieux la voir dans le temps
          // qui reste que reléguée sous l'échelle.
          const hauteur = barre.getBoundingClientRect().height;
          while (vide < vides.length && dansLeVide + hauteur > vides[vide][1]) {
            vide += 1;
            dansLeVide = vides[vide]?.[0] ?? Infinity;
          }

          if (vide < vides.length) {
            barre.style.top = `${dansLeVide}px`;
            dansLeVide += hauteur + 2;
          } else {
            barre.style.top = `${bas}px`;
            bas += hauteur + 2;
          }
        }

        // LA COLONNE S'ÉTEND POUR LES PORTER : posées en absolu, ces barres ne
        // poussent rien — sans cette hauteur, elles sortaient de la case du
        // jour et flottaient sous le calendrier.
        pile.style.minHeight = `${bas}px`;
      }
    }

    // APRÈS CHAQUE GESTE, ON RANGE. Un bloc déplacé sur un jour qui en porte
    // déjà un du même espace doit fondre avec lui — sinon deux blocs identiques
    // se superposent, et le second est invisible sous le premier. C'est la même
    // règle qu'au calcul, appliquée à la main de Noé : elle vit dans
    // `js/orientation.js`, elle ne se recopie pas ici.
    const ranger = (blocs) =>
      fondreLesVoisins(
        [...blocs].sort((a, b) => (a.jour < b.jour ? -1 : a.jour > b.jour ? 1 : a.debut - b.debut)),
      );

    // UN BLOC SE DESSINE COMME UNE BARRE, et c'est ce qui le rend compatible
    // avec la grille existante : elle range ses barres par heure, un bloc de
    // 9 h se pose donc de lui-même avant une tâche de 13 h. Il n'a fallu ni axe
    // horaire ni calque — ce que Noé se demandait en posant la question.
    //
    // Ce n'est PAS une ligne de base de données : `id` est fabriqué, et rien
    // n'ira le chercher. Le détail qu'on ouvre dessus est le sien.
    const elementDeBloc = (bloc) => ({
      id: bloc.id,
      type: 'bloc',
      source: bloc,
      date: new Date(`${bloc.jour}T${String(Math.floor(bloc.debut / 60)).padStart(2, '0')}:${String(
        bloc.debut % 60,
      ).padStart(2, '0')}`),
      espace: bloc.espace,
      // Sa durée, que la barre traduit en hauteur.
      minutes: bloc.minutes,
      // SON TITRE NE DIT PLUS « avec X » (31 août 2026) : ce qu'il englobe est
      // désormais ÉCRIT DEDANS, ligne par ligne. Le répéter en tête faisait
      // deux fois la même chose, et volait la place au nom de l'espace.
      titre: `${NOMS_ESPACES[bloc.espace] ?? bloc.espace} · ${dureeLisible(bloc.minutes)}`,
    });

    function assembler() {
      const { evenements, taches, objectifs, publications, commandes, contacts } = etat.sources;
      etat.elements = assemblerCalendrier({
        evenements,
        // Seules les tâches datées entrent au calendrier : sans échéance, il
        // n'y a pas de jour où poser la barre — c'est justement ce que le
        // vivier sert à réparer.
        taches: taches.filter((tache) => tache.echeance),
        objectifs: objectifs.filter((objectif) => objectif.espace !== 'perso'),
        publications: publications.filter((publication) => publication.date_prevue),
        commandes: commandes.filter(
          (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
        ),
        relances: contacts.filter((contact) => contact.prochaine_action_date),
      });
      // UN ÉVÉNEMENT PORTE SA DURÉE (31 août 2026, demande de Noé : « les
      // événements doivent avoir la taille de leur réelle durée »). La barre en
      // fait une hauteur (`--duree`), comme pour un bloc.
      //
      // POSÉ ICI ET NON DANS `assemblerCalendrier` : la hauteur proportionnelle
      // a été retirée de TOUS les calendriers le 27 août 2026 — « supprime
      // l'affichage de la durée dans le calendrier, il ne faut pas qu'il y ait
      // trop d'info ». Elle revient sur cette grille-là, qui est une journée à
      // l'échelle, et sur elle seule.
      for (const element of etat.elements) {
        if (element.type !== 'evenement' || !element.source?.date_fin) continue;
        const minutes = (new Date(element.source.date_fin) - element.date) / 60000;
        if (minutes > 0) element.minutes = minutes;
      }

      etat.elements.push(...etat.blocs.map(elementDeBloc));
    }

    function squelette() {
      return `
        <h1>Ma semaine</h1>
        <p class="discret sous-titre">Du ${echapper(bornesLisibles(etat.semaine))}.
          Regarde ce qui vient, pose ce qui attend.</p>

        <div id="bloc-message"></div>

        <!-- LE MIROIR D'ABORD (philosophie n° 1) : on ouvre sur ce qui a été
             fait, jamais sur ce qui reste. -->
        <section class="bloc">
          <h2>La semaine passée</h2>
          <div id="bloc-bilan"><p class="vide">…</p></div>
        </section>

        <!-- CE QUE LE HUB VOIT, ENTRE LE BILAN ET LA SEMAINE (31 août 2026,
             demande de Noé). Il fermait la page depuis le 30 août, au motif
             qu'on lit un constat mieux après avoir vu la semaine qu'il décrit ;
             c'était vrai d'un paragraphe, ça ne l'est plus d'une carte de deux
             lignes. Ces constats servent à décider de ce qu'on va poser : ils
             doivent être sous les yeux AU MOMENT où l'on pose, pas après.
             Chaque carte porte sa porte de sortie — la règle du rendez-vous n'a
             pas d'exception. -->
        <section class="bloc bloc-vue">
          <h2>Ce que je vois</h2>
          <div id="bloc-lignes"><p class="vide">…</p></div>
        </section>

        <!-- LA GRILLE ET LE VIVIER CÔTE À CÔTE, et c'est tout l'objet de la
             page : la chose à poser et l'endroit où la poser doivent se voir
             ensemble. Sur téléphone ils s'empilent, la grille d'abord — c'est
             pour elle qu'on est venu. -->
        <div class="semaine-programmation">
          <section class="bloc semaine-grille">
            <h2>Jour par jour</h2>
            <!-- LE DÉCOMPTE, LES CASES ET LES DEUX GESTES SUR UNE MÊME LIGNE
                 (31 août 2026, demande de Noé). Ce sont les commandes de la
                 grille : les séparer en deux rangs laissait croire à deux
                 étages de réglage là où il n'y en a qu'un.
                 LE TITRE, LUI, RESTE AU-DESSUS (même jour) : il nomme la
                 section, il n'est pas une commande. -->
            <div class="semaine-tete">
              <div id="bloc-compteur"></div>
              <div class="cal-filtres" role="group" aria-label="Ce que montre la grille">
                <label class="cal-coche"><input type="checkbox" data-voir="blocs">
                  <span>Les blocs</span></label>
                <label class="cal-coche"><input type="checkbox" data-voir="pose">
                  <span>Ce qui est posé</span></label>
                <!-- SÉPARÉS : les deux couches, mais chacune sur sa grille. Elle
                     reste visible quand elle n'a rien à séparer — une case qui
                     apparaît et disparaît réorganiserait la ligne autour
                     d'elle, et c'est ce qu'on refuse depuis le 31 août. -->
                <label class="cal-coche"><input type="checkbox" data-voir="separes">
                  <span>Séparés</span></label>
              </div>
              <!-- LE FILET DU « RIEN NE S'ENREGISTRE » : les blocs se
                   recalculent, donc on peut tout bouger sans rien risquer. Sans
                   cette porte, un bloc retiré par erreur ne reviendrait qu'en
                   rechargeant la page. -->
              <button type="button" class="lien-discret" data-ajouter-bloc>
                Ajouter un bloc
              </button>
              <button type="button" class="lien-discret" data-reproposer-blocs>
                Reproposer les blocs
              </button>
            </div>
            <p class="discret grille-legende" id="bloc-legende-blocs" hidden>Les blocs</p>
            <div id="bloc-grille"><p class="vide">…</p></div>
            <!-- LA SECONDE GRILLE, vide et masquée tant qu'on ne demande pas
                 « Séparés ». Elle porte son propre identifiant, et ce n'est pas
                 cosmétique : heureSousLePoint, poserDansLesBlocs et
                 rangerSousLEchelle cherchent tous les piles de #bloc-grille. Un
                 même identifiant leur donnerait quatorze colonnes pour sept
                 jours. -->
            <p class="discret grille-legende" id="bloc-legende-pose" hidden>Ce qui est posé</p>
            <div id="bloc-grille-pose" hidden></div>
          </section>

          <section class="bloc semaine-vivier">
            <!-- LE TITRE, ET RIEN D'AUTRE (30 août 2026, demande de Noé). La
                 colonne portait sous lui une phrase d'aide — « glisse une tâche
                 sur un jour ; au doigt, touche-la puis touche le jour ». Elle
                 coûtait deux lignes en permanence pour un geste qu'on
                 n'apprend qu'une fois. Il reste dans le nom accessible de
                 chaque tuile, où il ne prend aucune place. -->
            <h2>À poser</h2>
            <div id="bloc-vivier" class="vivier"><p class="vide">…</p></div>
          </section>
        </div>

        <div id="bloc-fin"></div>

        <!-- LE MÊME « + » QU'AILLEURS (30 août 2026, demande de Noé). Une page
             où l'on programme sa semaine doit permettre d'y AJOUTER, pas
             seulement d'y ranger ce qui existe : le rendez-vous qu'on se
             rappelle en regardant le jeudi n'a pas à faire changer de page. -->
        <button type="button" class="ouvrir-capture" data-ouvrir-creation
          title="Ajouter au calendrier" aria-label="Ajouter au calendrier">${PLUS}</button>

        <div id="bloc-creation"></div>
        <div id="bloc-detail"></div>
        <div id="bloc-reglage"></div>`;
    }

    function rendreMessage() {
      cible('bloc-message').innerHTML = etat.echec
        ? `<p class="vide">Les données n'ont pas pu être chargées.
             <button type="button" class="lien-discret" data-action="reessayer">Réessayer</button></p>`
        : etat.message
          ? `<p class="discret message-regle">${echapper(etat.message)}</p>`
          : '';
    }

    function rendreBilan() {
      cible('bloc-bilan').innerHTML = etat.bilan ? construireBilan(etat.bilan) : '';
    }

    // La grille et le vivier se redessinent ENSEMBLE : programmer une tâche la
    // retire de l'un et la pose dans l'autre, et deux rendus séparés
    // laisseraient une demi-seconde où elle serait aux deux endroits.
    // CE QUE MONTRE UNE GRILLE, selon les deux couches qu'on lui demande.
    //
    // PAS DE PUBLICATIONS AVEC LES BLOCS (31 août 2026, demande de Noé). Cette
    // grille sert à placer du TEMPS — ce qu'on va faire, et quand. Une parution
    // n'occupe pas de temps : elle part. Elle reste entière sur la vue de ce qui
    // est posé, où l'on regarde la semaine telle qu'elle est — et donc, une fois
    // les deux grilles séparées, sur la seconde.
    const elementsMontres = (avecBlocs, avecPose) =>
      etat.elements.filter((element) => {
        if (element.type === 'bloc') return avecBlocs;
        if (!avecPose) return false;
        return !(avecBlocs && element.type === 'publication');
      });

    function rendreProgrammation() {
      assembler();
      // CHAQUE VUE NE MONTRE QUE SA MOITIÉ : les blocs d'un côté, ce qui est
      // posé de l'autre. C'est le tri qu'on ne pouvait pas faire du regard
      // quand les deux partageaient la même pile.
      // CE QUE LA GRILLE MONTRE, selon les deux interrupteurs.
      //
      // QUAND LES DEUX SONT COCHÉS, CE QUI EST DANS UN BLOC N'EST PAS DESSINÉ À
      // CÔTÉ : il est écrit DEDANS (voir `garnirLesBlocs`). C'est ce qui a
      // remplacé la superposition, illisible — une barre posée par-dessus son
      // bloc masquait le cadre qu'elle était censée occuper, et deux barres à
      // la même heure se couvraient l'une l'autre. Reste dessiné en barre ce
      // qu'aucun bloc ne porte : c'est justement ce qu'on cherche du regard.
      // UNE TÂCHE QUI A TROUVÉ SON BLOC N'EST PAS DESSINÉE À CÔTÉ : elle est
      // écrite dedans. Les événements et les publications, eux, restent des
      // barres — ils respectent un horaire strict, et c'est là leur différence.
      // SÉPARÉS : chaque couche a sa grille, et aucune ne connaît l'autre
      // (1er septembre 2026, demande de Noé). Il n'y a rien de neuf à dessiner —
      // ce sont les deux vues à une couche que la page sait déjà faire, rendues
      // l'une sous l'autre. Rien à garnir, rien à ranger sous l'échelle : ces
      // deux passes n'existent que pour faire tenir les deux couches dans une
      // seule colonne, et c'est justement ce qu'on ne fait plus ici.
      const separes = etat.voirBlocs && etat.voirPose && etat.separes;

      const montres = elementsMontres(etat.voirBlocs, separes ? false : etat.voirPose);

      // LA VUE DES BLOCS EST GRADUÉE, l'autre non : dans l'une, la colonne EST
      // la journée de 10 h à 22 h ; dans l'autre, les barres s'empilent comme
      // partout ailleurs dans le hub.
      // La colonne n'est graduée que si l'on montre les blocs : sans eux, il n'y
      // a pas d'échelle à tenir, et les barres reprennent l'empilement de
      // partout ailleurs dans le hub.
      cible('bloc-grille').classList.toggle('grille-blocs', etat.voirBlocs);
      // LES LÉGENDES N'APPARAISSENT QU'UNE FOIS SÉPARÉES : dans la vue mêlée,
      // une seule grille porte tout et la nommer deux fois n'apprendrait rien.
      cible('bloc-legende-blocs').hidden = !separes;
      cible('bloc-legende-pose').hidden = !separes;
      // DÈS QUE CE QUI EST POSÉ EST COCHÉ, LES BLOCS PERDENT LEUR TEXTE (31 août
      // 2026, demande de Noé) : heure, espace, durée. Ils redeviennent ce qu'ils
      // sont — un cadre —, et tout ce qui se lit dans la colonne est ce qui est
      // vraiment posé. Leur nom reste au survol, et revient dès qu'on décoche.
      cible('bloc-grille').classList.toggle('blocs-nus', !separes && etat.voirBlocs && etat.voirPose);
      cible('bloc-grille').innerHTML = construireGrille(
        montres,
        // « bloc » s'ajoute ICI et pas dans `NATURES` : le calendrier plein
        // écran n'en affiche pas, et lui donner une case à cocher promettrait
        // quelque chose qui n'existe que sur cette page.
        new Set([...toutesLesNatures(), 'bloc']),
        'semaine',
        etat.pivot,
        { montrerEspace: true, aide: false },
      );
      // ON NE GARNIT QUE SI L'ON DEMANDE LES DEUX : les blocs seuls montrent la
      // FORME de la semaine, et y écrire leur contenu serait répondre à une
      // question qu'on n'a pas posée.
      // UN BLOC DE 30 MIN TIENT SUR UNE LIGNE (31 août 2026, demande de Noé :
      // « l'heure, l'espace et la durée alignés »). Sa hauteur vaut sa durée —
      // une demi-heure fait 15 px, deux lignes n'y entrent pas. La classe se
      // pose ici plutôt qu'en CSS : aucune règle ne sait comparer `--duree` à
      // un seuil.
      for (const barre of section.querySelectorAll('#bloc-grille .cal-type-bloc')) {
        const [, id] = barre.dataset.element.split(':');
        const bloc = etat.blocs.find((candidat) => candidat.id === id);
        if (!bloc) continue;
        barre.classList.toggle('bloc-court', bloc.minutes <= 30);

        // SA HAUTEUR EST SA DURÉE, POSÉE EN STYLE (31 août 2026, Noé : « aucun
        // bloc ne doit se superposer »). En CSS, la règle ne passait pas : la
        // barre garde un plancher de 24 px — une taille de cible — que la
        // cascade rendait indéboulonnable, et une demi-heure occupait 29 px là
        // où l'échelle lui en donne 15. Elle mordait sur le bloc suivant.
        //
        // Un style inline tranche sans avoir à compter les sélecteurs. Ce qu'on
        // y perd : sur cette grille, un bloc court n'est plus une cible de
        // 24 px — mais on y programme à la souris, devant un écran.
        if (etat.voirBlocs) {
          barre.style.minHeight = '0';
          barre.style.height = `${(bloc.minutes / 60) * 2}rem`;
        }
      }

      // AUCUN BLOC NE DÉPASSE LE BAS DE LA JOURNÉE (31 août 2026, Noé : « ce
      // bloc est coupé en fin de calendrier »). Un bloc de 30 min posé à
      // 21 h 15 finit à 21 h 45 sur l'échelle, mais sa hauteur MINIMALE — celle
      // d'une cible qu'on peut viser — l'emmène plus bas que 22 h. Il remonte
      // d'autant : mieux vaut un bloc légèrement en avance qu'un bloc tronqué.
      for (const barre of section.querySelectorAll('#bloc-grille .cal-type-bloc')) {
        const pile = barre.closest('.cal-pile');
        if (!pile) continue;
        const trop = barre.getBoundingClientRect().bottom - pile.getBoundingClientRect().bottom;
        if (trop <= 0) continue;
        const haut = parseFloat(getComputedStyle(barre).top) || 0;
        barre.style.top = `${Math.max(0, haut - trop)}px`;
      }

      // LA SECONDE GRILLE : ce qui est posé, tout seul, empilé comme partout
      // ailleurs dans le hub. Elle n'est jamais graduée — il n'y a pas d'échelle
      // à tenir sans blocs — et ne porte aucun bloc, ce qui garde les gestes
      // (glisser un bloc, viser une heure) au premier `#bloc-grille`.
      const seconde = cible('bloc-grille-pose');
      seconde.hidden = !separes;
      seconde.innerHTML = separes
        ? construireGrille(
            elementsMontres(false, true),
            new Set([...toutesLesNatures(), 'bloc']),
            'semaine',
            etat.pivot,
            { montrerEspace: true, aide: false },
          )
        : '';

      if (!separes && etat.voirBlocs && etat.voirPose) {
        // DANS CET ORDRE (31 août 2026, corrigé) : on range D'ABORD ce qui va
        // dans un cadre, et SEULEMENT ENSUITE ce qu'aucun bloc ne porte.
        //
        // L'inverse laissait des traces : `rangerSousLEchelle` descendait tout
        // sous la journée et réservait la hauteur qu'il fallait, puis
        // `poserDansLesBlocs` remontait presque tout dans les cadres — la
        // hauteur, elle, restait. Mesuré : 219 px de vide au bas de la grille et
        // trois filets qui ne séparaient plus rien. « Il y a des lignes à la fin
        // du tableau qui ne servent plus à rien », a dit Noé.
        poserDansLesBlocs();
        rangerSousLEchelle();
      }

      // LE DÉFILEMENT DE LA COLONNE SURVIT AU RENDU. Programmer la douzième
      // tâche la fait quitter la liste, donc redessiner : sans cette ligne, la
      // colonne remonterait en haut à chaque geste et il faudrait redescendre
      // — précisément dans le seul usage où l'on en pose plusieurs d'affilée.
      // Le repli des mises de côté se garde pour la même raison.
      const colonne = cible('bloc-vivier');
      const defilement = colonne.scrollTop;
      etat.ecarteesOuvertes = colonne.querySelector('.vivier-ecartees')?.open ?? etat.ecarteesOuvertes;
      colonne.innerHTML = construireVivier(
        vivierDeLaSemaine(etat.sources.taches, etat.semaine),
        etat.sources.projets,
        etat.choisie,
        etat.ecarteesOuvertes,
      );
      colonne.scrollTop = defilement;
      // La grille vient d'être réécrite : sa case d'entrée au clavier est
      // partie avec. Sans ce rappel, la tabulation ne trouve plus le calendrier
      // dès qu'on a posé une seule tâche.
      poserLEntreeClavier?.();
      // LE DÉCOMPTE RESTE, QUOI QU'ON COCHE (31 août 2026, Noé : « ce n'est pas
      // une page différente, c'est juste du contenu qui est ajouté ou enlevé ;
      // seul l'affichage du calendrier doit être modifié »). Il compte les
      // heures des blocs proposés, qui existent que la grille les montre ou
      // non — le masquer faisait bouger la page autour d'une case à cocher.
      cible('bloc-compteur').innerHTML = construireCompteur();

      for (const boite of section.querySelectorAll('[data-voir]')) {
        const coche =
          boite.dataset.voir === 'blocs'
            ? etat.voirBlocs
            : boite.dataset.voir === 'pose'
              ? etat.voirPose
              : etat.separes;
        boite.checked = coche;
        boite.closest('.cal-coche')?.classList.toggle('actif', coche);
      }
      // LES DEUX GESTES RESTENT EUX AUSSI : ajouter un bloc coche « Les blocs »
      // au passage, et reproposer agit sur ce qu'on affichera. Les faire
      // disparaître était la même erreur — une case à cocher ne doit pas
      // réorganiser la page autour d'elle.

      // Les jours s'allument quand une tâche est choisie : sans ce signe, le
      // second geste du toucher ne se devinerait pas.
      section.querySelector('.semaine-programmation')?.classList
        .toggle('semaine-en-main', Boolean(etat.choisie));
    }

    // LE RÉGLAGE D'UN BLOC — jour, début, durée, espace, et la porte pour le
    // retirer. Quatre champs natifs plutôt qu'un formulaire du hub : un bloc
    // n'existe qu'en mémoire, il n'a ni pastille d'espace à teinter ni
    // enregistrement à confirmer. Ce qu'on règle ici ne quitte pas la page.
    const JOURS_LISIBLES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

    function rendreReglage() {
      const conteneur = cible('bloc-reglage');
      const bloc = etat.blocRegle;
      if (!bloc) {
        conteneur.innerHTML = '';
        document.body.classList.remove('fond-fige');
        return;
      }

      // LES GABARITS DU HUB, ET PAS DES CHAMPS NATIFS (31 août 2026, correction
      // de Noé : « la tuile d'ajout ne respecte pas les critères qu'on a faits
      // hier, les pastilles pour les menus déroulants »). Cette fenêtre était
      // écrite à la main — quatre `<label>`, deux `<select>` du système —, ce
      // qui la mettait hors de la grammaire posée la veille : un choix est une
      // PASTILLE, jamais un champ ; les pastilles vont côte à côte, en tête ;
      // aucune ne porte son titre. `construireFormulaire` fait tout cela pour
      // les dix-sept formulaires du hub, et il n'y avait aucune raison que
      // celui-ci soit le dix-huitième à part.
      const jours = Object.fromEntries(
        JOURS_LISIBLES.map((nom, index) => [
          versDateISO(ajouterJours(depuisDateISO(etat.semaine.debut), index)),
          nom,
        ]),
      );

      const heure = `${String(Math.floor(bloc.debut / 60)).padStart(2, '0')}:${String(
        bloc.debut % 60,
      ).padStart(2, '0')}`;

      // LE PERSO EST OFFERT ICI, alors que le plan ne le donne qu'au jour de
      // repos : le hub ne se propose pas de planifier la vie de Noé, mais Noé
      // a le droit de se réserver un mardi soir.
      const espaces = Object.fromEntries(
        ORDRE_ESPACES.map((espace) => [espace, NOMS_ESPACES[espace] ?? espace]),
      );

      // Les durées en toutes lettres : un bloc se pense en heures, et le champ
      // « nombre » demandait des minutes qu'il fallait convertir de tête.
      const durees = {};
      for (let minutes = 60; minutes <= 720; minutes += 30) {
        durees[minutes] = dureeLisible(minutes);
      }

      const neuf = !bloc.id;
      conteneur.innerHTML = construireFenetre(
        neuf ? 'Ajouter un bloc' : 'Régler ce bloc',
        construireFormulaire({
          id: 'bloc-reglage',
          libelle: neuf ? 'Ajouter un bloc' : 'Régler ce bloc',
          action: 'regler-bloc',
          bouton: neuf ? 'Ajouter' : 'Régler',
          ouvert: true,
          avecPli: false,
          champs: [
            { nom: 'espace', libelle: 'Espace', type: 'choix', options: espaces, valeur: bloc.espace },
            { nom: 'jour', libelle: 'Jour', type: 'choix', options: jours, valeur: bloc.jour },
            {
              nom: 'minutes',
              libelle: 'Durée',
              type: 'choix',
              options: durees,
              valeur: String(bloc.minutes),
            },
            { nom: 'debut', libelle: 'Début', type: 'time', valeur: heure },
          ],
          extra: neuf
            ? ''
            : `<button type="button" class="lien-discret" data-retirer-bloc>
                 Retirer ce bloc
               </button>`,
        }),
      );

      // SANS CET APPEL, LES PASTILLES NE POSENT RIEN. C'est le défaut trouvé
      // dans perso.js le 30 août : un champ « choix » est un input caché doublé
      // d'un bouton et d'un panneau, et le branchement est ce qui relie les
      // deux. Il s'enregistrait proprement avec l'ancienne valeur, sans erreur
      // ni signe.
      brancherChoix(conteneur);
      document.body.classList.add('fond-fige');
    }

    function rendreLignes() {
      cible('bloc-lignes').innerHTML = etat.diagnostic
        ? construireRendezVous(etat.diagnostic, { intro: false, valider: false })
        : '';
    }

    // « C'EST MA SEMAINE » ferme le rendez-vous, et c'est le seul geste de fin
    // de la page. Une fois donné, il ne se redemande pas : la semaine validée
    // est celle qui vient, donc le lundi matin ne repose pas la question.
    function rendreFin() {
      cible('bloc-fin').innerHTML = etat.validee
        ? `<p class="discret semaine-validee">C’est noté. Bonne semaine.</p>`
        : `<button type="button" class="bouton-secondaire rdv-valider" data-valider-semaine>
             C’est ma semaine
           </button>`;
    }

    function rendreCreation() {
      cible('bloc-creation').innerHTML = etat.creation
        ? fenetreCreation({ ...etat.creation, espaces: ESPACES, projets: etat.sources.projets })
        : '';
      if (etat.creation) rafraichirLaCapture?.();
    }

    // LA MÊME FENÊTRE QUE PARTOUT AILLEURS (30 août 2026, demande de Noé :
    // « il faut que je puisse modifier aussi en appuyant sur une tâche
    // posée »). La grille n'est donc plus seulement une surface de placement :
    // ce qu'on y a posé se rouvre, se corrige et se supprime, sans changer de
    // page — et par le même geste qu'à l'accueil et au calendrier.
    function rendreDetail() {
      cible('bloc-detail').innerHTML = etat.detail
        ? fenetreDetail(etat.detail, {
            montrerEspace: true,
            edition: etat.edition,
            statutModifiable: true,
          })
        : '';
    }

    const fermerLeDetail = () => {
      etat.detail = null;
      etat.edition = false;
      rendreDetail();
    };

    function rendreTout() {
      rendreMessage();
      rendreBilan();
      rendreProgrammation();
      rendreLignes();
      rendreFin();
      rendreCreation();
      rendreDetail();
    }

    // TREIZE REQUÊTES, ET C'EST ASSUMÉ. Cette page s'ouvre une fois par
    // semaine, sur décision, devant un ordinateur : elle a le droit de coûter
    // ce qu'un check-in de mardi matin n'aurait pas le droit de coûter. C'est
    // même l'inverse d'avant — l'accueil du dimanche payait huit requêtes pour
    // un bandeau, il n'en paie plus qu'une pour savoir s'il ouvre sa porte.
    async function charger() {
      const passee = semainePrecedente(etat.semaine);

      try {
        const [
          evenements,
          taches,
          publications,
          objectifs,
          projets,
          periodes,
          series,
          arbitrages,
          commandes,
          contacts,
          victoires,
          humeurs,
          habitudesFaits,
          validees,
          gardes,
        ] = await Promise.all([
          api.evenementsTous(),
          api.tachesToutes(),
          api.publicationsToutes(),
          api.objectifsActifs(),
          api.projetsTous(),
          api.periodesToutes(),
          api.chargerLesSeries(),
          api.arbitragesTous(),
          api.commandesToutes(),
          api.contactsTous(),
          api.victoiresToutes(),
          api.humeurDepuis(passee.debut),
          api.habitudesFaitsDepuis(passee.debut),
          api.semainesValidees(),
          api.blocsGardes(etat.semaine.debut),
        ]);

        etat.sources = {
          evenements,
          taches,
          publications,
          objectifs,
          projets,
          periodes,
          series,
          arbitrages,
          commandes,
          contacts,
          victoires,
          humeurs,
          habitudesFaits,
        };
        etat.validee = validees.some((ligne) => ligne.debut === etat.semaine.debut);

        // LE DIAGNOSTIC SE CALCULE SUR LE PIVOT, pas sur maintenant : c'est la
        // semaine qui vient qu'on regarde, y compris le dimanche soir.
        etat.diagnostic = diagnosticDeLaSemaine(etat.sources, etat.pivot);
        etat.bilan = bilanDeLaSemaine(etat.sources, passee);
        // CE QUE NOÉ A ARRANGÉ PASSE DEVANT LA PROPOSITION (1er septembre 2026,
        // demande de Noé : « il faut que la disposition des blocs soit
        // sauvegardée entre 2 chargements de page »).
        //
        // CE QUE ÇA RENVERSE : depuis le 31 août, « un bloc ne s'enregistre
        // pas, les blocs ne doivent être que de l'affichage ». Le motif était
        // juste — rien à maintenir, rien qui périme — mais il avait un prix que
        // l'usage a révélé : une semaine réorganisée à la main se retrouvait
        // reproposée telle quelle au rechargement.
        //
        // La table ne garde QUE ce que Noé a touché. Sans ligne, le hub propose,
        // et la période du jour donne les heures visées — un mois « intense »
        // propose plus de blocs, sans qu'on ait à le dire.
        etat.blocs = Array.isArray(gardes) && gardes.length
          ? gardes
          : blocsDeLaSemaine(etat.sources, etat.semaine, periodeDuJour(periodes, etat.pivot));
        etat.echec = false;
      } catch (erreur) {
        console.error('Chargement de la semaine impossible', erreur);
        etat.echec = true;
      }

      rendreTout();
    }

    // Revenir dessus le relit : une tâche cochée ailleurs ne doit pas
    // réapparaître dans le vivier.
    this.rafraichir = () => {
      etat.semaine = semaineDe(pivotDeLaSemaine());
      etat.pivot = pivotDeLaSemaine();
      etat.choisie = null;
      return charger();
    };

    // LE SQUELETTE ET LES ÉCOUTEURS D'ABORD, LES DONNÉES ENSUITE. Branchés
    // après le chargement, ils n'existaient pas pendant les treize requêtes —
    // la page était dessinée, les tâches visibles, et les toucher ne faisait
    // rien. Mesuré : un clic sur une tâche du vivier restait sans effet tant
    // que `charger` n'avait pas rendu la main. Un écran qui s'affiche avant de
    // répondre doit au moins répondre dès qu'il s'affiche.
    section.innerHTML = squelette();
    rendreTout();

    // --- Programmer : l'écriture -----------------------------------------------

    // Poser une tâche sur un jour. L'écran d'abord, le réseau ensuite — et si
    // l'écriture échoue, la tâche retourne dans le vivier ET une ligne le dit.
    // `heure` arrive quand la tâche a été posée DANS un bloc (31 août 2026,
    // demande de Noé : « puis ajouter des tâches qui correspondent »). C'est là
    // que la proposition laisse une trace : le bloc s'évapore au rechargement,
    // l'heure de la tâche reste.
    async function programmer(id, jour, heure = null) {
      const tache = etat.sources.taches.find((candidate) => candidate.id === id);
      if (!tache) return;
      if (tache.echeance === jour && (!heure || tache.heure === heure)) return;

      const champs = heure ? { echeance: jour, heure } : { echeance: jour };

      etat.choisie = null;
      etat.message = null;
      await modifierAussitot(
        tache,
        champs,
        () => api.modifierTache(tache.id, champs),
        { rendre: rendreProgrammation, echouer: signaler },
      );
    }

    // LE BLOC SOUS LE POINT, s'il y en a un. Une tâche lâchée dessus prend son
    // jour ET son heure ; lâchée à côté, elle ne prend que le jour — le bloc
    // est une cible plus fine dans la même surface, pas un second geste.
    const heureDuBlocSousLePoint = (x, y) => {
      const barre = document.elementFromPoint(x, y)?.closest('.cal-type-bloc');
      const id = barre?.dataset.element?.split(':')[1];
      const bloc = id ? etat.blocs.find((candidat) => candidat.id === id) : null;
      if (!bloc) return null;
      return {
        jour: bloc.jour,
        heure: `${String(Math.floor(bloc.debut / 60)).padStart(2, '0')}:${String(
          bloc.debut % 60,
        ).padStart(2, '0')}`,
      };
    };

    // La ramener au vivier. `heure` part avec la date : une heure sans jour ne
    // veut rien dire, c'est la règle de la tuile de capture.
    async function deprogrammer(cle) {
      const [type, id] = cle.split(':');
      if (type === 'bloc') {
        signaler('Un bloc ne se déprogramme pas : il se retire depuis son réglage.');
        return;
      }
      if (type !== 'tache') {
        signaler('Seule une tâche se déprogramme d’ici. Le reste se règle au calendrier.');
        return;
      }

      const tache = etat.sources.taches.find((candidate) => String(candidate.id) === id);
      if (!tache) return;

      etat.message = null;
      const champs = { echeance: null, heure: null };
      await modifierAussitot(tache, champs, () => api.modifierTache(tache.id, champs), {
        rendre: rendreProgrammation,
        echouer: signaler,
      });
    }

    // METTRE DE CÔTÉ, ET REMETTRE. `refusee_le` porte le lundi de la semaine
    // qu'on programme : c'est la date POUR LAQUELLE on a dit non, exactement
    // comme le « pas aujourd'hui » des pistes du matin porte le jour même.
    async function ecarter(id, pourLaSemaine) {
      const tache = etat.sources.taches.find((candidate) => candidate.id === id);
      if (!tache) return;

      if (etat.choisie === id) etat.choisie = null;
      etat.message = null;
      const champs = { refusee_le: pourLaSemaine ? etat.semaine.debut : null };
      await modifierAussitot(tache, champs, () => api.modifierTache(tache.id, champs), {
        rendre: rendreProgrammation,
        echouer: signaler,
      });
    }

    // --- Glisser une barre déjà posée -------------------------------------------
    //
    // Le même geste que partout ailleurs dans le hub, et il vient du même
    // endroit. La ZONE en plus est propre à cette page : ramener une barre dans
    // le vivier la déprogramme — le geste inverse de celui qu'on vient de
    // faire, et il se devine parce qu'il est symétrique.
    brancherDeplacement(
      section,
      async ({ element: cle, ecart, arrivee, point }) => {
        const [type, id] = cle.split(':');

        // UN BLOC SE GLISSE COMME LE RESTE, mais il n'a rien à écrire (31 août
        // 2026, Noé : « il faut que je puisse déplacer les blocs en les
        // glissant, ce n'est pas le cas actuellement »). Le geste était déjà
        // branché — `brancherDeplacement` prend toute `.cal-barre-element` —,
        // il mourait plus bas : `champsApresDeplacement` range une date dans la
        // colonne de sa nature, et un bloc n'a ni colonne ni table. Il se
        // décale donc ICI, dans l'état de la page, et rien ne part au réseau.
        if (type === 'bloc') {
          // À L'HEURE OÙ ON LE LÂCHE (31 août 2026, demande de Noé). La
          // colonne étant graduée, la hauteur du lâcher se lit comme une
          // heure ; `poserLeBloc` fait le reste — il arrondit à l'heure ronde,
          // garde les durées, et pousse ce que le bloc rencontre sans jamais
          // en superposer deux.
          etat.blocs = ranger(
            poserLeBloc(etat.blocs, id, arrivee, heureSousLePoint(arrivee, point.y)),
          );
          viserLHeure(null);
          garderLesBlocs();
          rendreProgrammation();
          return;
        }

        const element = etat.elements.find(
          (candidat) => candidat.type === type && String(candidat.id) === id,
        );
        if (!element?.source) return;

        const champs = champsApresDeplacement(element, ecart);
        etat.message = null;
        await modifierAussitot(
          element.source,
          champs,
          () => appliquerAuCalendrier(type, id, champs),
          { rendre: rendreProgrammation, echouer: signaler },
        );
      },
      {
        zones: [{ selecteur: '.semaine-vivier', quand: deprogrammer }],
        // Un bloc se réordonne dans sa propre journée : c'est même le geste le
        // plus courant, « entre quels blocs je le place ».
        memeJour: (barre) => barre.classList.contains('cal-type-bloc'),
      },
    );

    // --- Glisser une tâche du vivier vers un jour -------------------------------
    //
    // À LA SOURIS SEULEMENT. Au doigt, une liste verticale ne peut pas
    // distinguer un glissement d'un défilement : le toucher a son chemin à lui,
    // deux appuis — la tâche, puis le jour. C'est la même prudence que le
    // glissement des barres, qui n'accepte au doigt que l'horizontale.
    let prise = null;

    const lacher = () => {
      prise?.ligne.classList.remove('en-deplacement');
      prise?.fantome?.remove();
      viserLeJour(section, null);
      prise = null;
    };

    section.addEventListener('pointerdown', (evenement) => {
      const ligne = evenement.target.closest('.vivier-tache');
      // La croix et « Remettre » sont des gestes à eux : les saisir comme une
      // poignée avalerait leur clic au premier tremblement de main. Et une
      // tâche mise de côté ne se pose pas sur un jour — elle se remet d'abord.
      if (!ligne || ligne.classList.contains('vivier-ecartee')) return;
      if (evenement.target.closest('button:not([data-choisir])')) return;
      if (evenement.pointerType === 'touch') return;

      evenement.preventDefault();
      prise = {
        ligne,
        id: ligne.dataset.tache,
        x: evenement.clientX,
        y: evenement.clientY,
        bouge: false,
        fantome: null,
        pointeur: evenement.pointerId,
      };
    });

    section.addEventListener('pointermove', (evenement) => {
      if (!prise) return;

      if (!prise.bouge) {
        // Quelques pixels de tolérance : un clic tremblant reste un clic, et
        // c'est lui qui choisit la tâche.
        if (Math.hypot(evenement.clientX - prise.x, evenement.clientY - prise.y) < 5) return;
        prise.bouge = true;
        prise.ligne.classList.add('en-deplacement');
        prise.fantome = prendreEnMain(prise.ligne, evenement.clientX, evenement.clientY);
        try {
          prise.ligne.setPointerCapture(prise.pointeur);
        } catch {
          // Une capture ratée ne doit pas emporter le glissement avec elle : il
          // marche encore, il perd seulement le suivi hors de la ligne.
        }
      }

      suivreLaMain(prise.fantome, evenement.clientX, evenement.clientY);
      viserLeJour(section, jourSousLePoint(evenement.clientX, evenement.clientY));
    });

    section.addEventListener('pointerup', (evenement) => {
      if (!prise) return;

      const { ligne, id, bouge, pointeur } = prise;
      try {
        ligne.releasePointerCapture(pointeur);
      } catch {
        // Le pointeur n'était plus à capturer : rien à relâcher.
      }
      const dansUnBloc = heureDuBlocSousLePoint(evenement.clientX, evenement.clientY);
      const arrivee = jourSousLePoint(evenement.clientX, evenement.clientY);
      lacher();

      if (!bouge) return;

      // Un vrai glissement ne doit pas choisir la tâche derrière lui : on avale
      // le clic qui suit, et lui seul. Le désarmement différé est une ceinture,
      // pour que le piège ne reste pas tendu si aucun clic ne vient.
      const avaler = (clic) => {
        clic.stopPropagation();
        clic.preventDefault();
      };
      section.addEventListener('click', avaler, { capture: true, once: true });
      setTimeout(() => section.removeEventListener('click', avaler, { capture: true }), 400);

      if (dansUnBloc) {
        programmer(id, dansUnBloc.jour, dansUnBloc.heure);
        return;
      }
      if (arrivee) programmer(id, arrivee);
    });

    section.addEventListener('pointercancel', lacher);

    // --- Poser quelque chose sur un jour -----------------------------------------
    //
    // UN JOUR TOUCHÉ FAIT DEUX CHOSES, et jamais les deux à la fois : il POSE
    // la tâche qu'on a en main s'il y en a une, sinon il OUVRE la tuile de
    // capture sur ce jour-là (30 août 2026, demande de Noé — « depuis la page
    // ma semaine je dois pouvoir ajouter événement, publication et tâche via le
    // calendrier »).
    //
    // Les deux passent par le MÊME geste, celui du calendrier : c'est ce qui
    // évite qu'un appui veuille dire une chose ici et une autre là-bas. Et
    // c'est aussi ce qui règle un conflit qui serait sinon invisible — la
    // sélection appelle `preventDefault` au poser du doigt, ce qui peut avaler
    // le clic sur lequel le placement s'appuyait.
    const ouvrirLaCapture = ({ debut, fin }) => {
      etat.creation = { debut, fin, nature: natureParDefaut(toutesLesNatures()) };
      rendreCreation();
      cible('bloc-creation').querySelector('#cal-titre')?.focus();
    };

    const surUnJour = ({ debut, fin }) => {
      if (etat.choisie) {
        programmer(etat.choisie, debut);
        return;
      }
      ouvrirLaCapture({ debut, fin });
    };

    brancherSelection(section, surUnJour);

    // Entrée ou Espace sur une case posée au clavier fait la même chose qu'un
    // doigt : le clavier ne doit pas être un second jeu de règles.
    poserLEntreeClavier = brancherClavier(section, (jour) =>
      surUnJour({ debut: jour, fin: jour }),
    );
    poserLEntreeClavier();

    // --- Les clics ---------------------------------------------------------------

    rafraichirLaCapture = brancherCapture(section, { projets: () => etat.sources.projets });

    document.addEventListener('keydown', (evenement) => {
      if (evenement.key !== 'Escape') return;
      if (etat.creation) {
        etat.creation = null;
        rendreCreation();
      } else if (etat.detail) {
        fermerLeDetail();
      } else if (etat.choisie) {
        etat.choisie = null;
        rendreProgrammation();
      }
    });

    section.addEventListener('click', async (evenement) => {
      if (evenement.target.closest('[data-action="reessayer"]')) {
        etat.echec = false;
        rendreMessage();
        await charger();
        return;
      }

      // Choisir une tâche, puis toucher un jour : le chemin du doigt. Un second
      // appui sur la même la repose — un choix qu'on ne peut pas défaire est un
      // piège.
      const choix = evenement.target.closest('[data-choisir]');
      if (choix) {
        etat.choisie = etat.choisie === choix.dataset.choisir ? null : choix.dataset.choisir;
        etat.message = null;
        rendreProgrammation();
        return;
      }

      // UNE TÂCHE EN MAIN, TOUCHÉE SUR UN BLOC : elle s'y pose, avec son heure.
      // C'est le chemin du doigt, celui qui ne glisse pas — sans cette
      // interception, le geste retomberait sur la sélection du jour et la tâche
      // perdrait l'heure que le bloc lui donnait.
      const blocVise = evenement.target.closest('.cal-type-bloc');
      if (blocVise && etat.choisie) {
        const bloc = etat.blocs.find(
          (candidat) => candidat.id === blocVise.dataset.element?.split(':')[1],
        );
        if (bloc) {
          const heure = `${String(Math.floor(bloc.debut / 60)).padStart(2, '0')}:${String(
            bloc.debut % 60,
          ).padStart(2, '0')}`;
          programmer(etat.choisie, bloc.jour, heure);
          return;
        }
      }

      // TOUCHER UNE BARRE OUVRE SON DÉTAIL. Sauf quand une tâche est en main :
      // à ce moment-là le geste veut dire « pose-la ici », et c'est la
      // sélection du jour qui s'en charge — ouvrir une fenêtre par-dessus
      // ferait deux réponses pour un seul appui.
      const ouvrirElement = evenement.target.closest('[data-element]');
      if (ouvrirElement && !etat.choisie) {
        const [type, id] = ouvrirElement.dataset.element.split(':');
        // UN BLOC N'A PAS DE DÉTAIL À CHARGER : il n'existe qu'ici. Son appui
        // ouvre son réglage — jour, début, durée, espace —, et le détail
        // générique irait chercher en base une ligne qui n'y est pas.
        if (type === 'bloc') {
          etat.blocRegle = etat.blocs.find((bloc) => bloc.id === id) ?? null;
          rendreReglage();
          return;
        }
        etat.detail =
          etat.elements.find(
            (candidat) => candidat.type === type && String(candidat.id) === id,
          ) ?? null;
        etat.edition = false;
        rendreDetail();
        return;
      }

      if (evenement.target.closest('[data-modifier-element]')) {
        etat.edition = true;
        rendreDetail();
        cible('bloc-detail').querySelector('#cal-edition-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-annuler-edition]')) {
        etat.edition = false;
        rendreDetail();
        return;
      }

      const supprimerElement = evenement.target.closest('[data-supprimer-element]');
      if (supprimerElement) {
        const [type, id] = supprimerElement.dataset.supprimerElement.split(':');
        if (!confirm(`Supprimer « ${etat.detail?.titre} » ?`)) return;
        supprimerElement.disabled = true;
        try {
          await effacerDepuisLeCalendrier(type, id);
          fermerLeDetail();
          await charger();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerElement.disabled = false;
          signaler("Ça n'a pas pu être supprimé.");
        }
        return;
      }

      const ecart = evenement.target.closest('[data-ecarter]');
      if (ecart) {
        await ecarter(ecart.dataset.ecarter, true);
        return;
      }

      const remise = evenement.target.closest('[data-remettre]');
      if (remise) {
        await ecarter(remise.dataset.remettre, false);
        return;
      }

      // LE « + » OUVRE SUR LE LUNDI DE LA SEMAINE PROGRAMMÉE, et non sur
      // aujourd'hui : ce qu'on pose depuis cette page appartient à la semaine
      // qu'on est en train de remplir. C'est la même règle que les propositions.
      if (evenement.target.closest('[data-ouvrir-creation]')) {
        ouvrirLaCapture({ debut: etat.semaine.debut, fin: etat.semaine.debut });
        return;
      }

      if (evenement.target.closest('[data-valider-semaine]')) {
        etat.validee = true;
        etat.message = null;
        rendreFin();
        try {
          await api.validerLaSemaine(etat.semaine.debut);
        } catch (erreur) {
          console.error('Semaine non validée', erreur);
          etat.validee = false;
          rendreFin();
          signaler("Ça n'a pas pu être enregistré.");
        }
        return;
      }

      // Une proposition ouvre la tuile de capture déjà remplie : accepter doit
      // coûter UN geste, sinon ce n'est pas une proposition, c'est un constat.
      const proposition = evenement.target.closest('[data-rdv-creer]');
      if (proposition) {
        const voulu = JSON.parse(proposition.dataset.rdvCreer);
        // Le premier jour de la semaine qu'on programme, et non aujourd'hui :
        // ce qu'on pose ici appartient à la semaine qui vient.
        const jour = etat.semaine.debut;
        etat.creation = {
          nature: voulu.nature ?? 'tache',
          debut: jour,
          fin: jour,
          heure: '',
          valeurs: {
            titre: voulu.titre ?? '',
            espace: voulu.espace ?? 'fch',
            priorite: 4,
            duree: 0,
            recurrence: '',
            recurrence_fin: '',
            famille: voulu.famille ?? '',
          },
        };
        rendreCreation();
        cible('bloc-creation').querySelector('#cal-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        etat.creation = null;
        rendreCreation();
        fermerLeDetail();
        etat.blocRegle = null;
        rendreReglage();
        return;
      }

      // AJOUTER UN BLOC SOI-MÊME (31 août 2026, demande de Noé). Il naît sur le
      // premier jour de la semaine, à 14 h et pour deux heures : des valeurs
      // qu'on change dans la foulée, mais qui font que la fenêtre s'ouvre déjà
      // remplie plutôt que vide.
      if (evenement.target.closest('[data-ajouter-bloc]')) {
        etat.voirBlocs = true;
        etat.blocRegle = {
          id: null,
          jour: etat.semaine.debut,
          debut: 14 * 60,
          minutes: 120,
          espace: 'fch',
        };
        rendreReglage();
        rendreProgrammation();
        return;
      }

      const coche = evenement.target.closest('[data-voir]');
      if (coche) {
        if (coche.dataset.voir === 'blocs') etat.voirBlocs = coche.checked;
        else if (coche.dataset.voir === 'pose') etat.voirPose = coche.checked;
        else etat.separes = coche.checked;
        rendreProgrammation();
        return;
      }

      // RETIRER UN BLOC. Pas de confirmation, et c'est toujours vrai depuis que
      // l'arrangement se garde : « Reproposer » le fait revenir. Ce qui est
      // irréversible demande un second appui ; ceci ne l'est pas.
      if (evenement.target.closest('[data-retirer-bloc]')) {
        etat.blocs = etat.blocs.filter((bloc) => bloc.id !== etat.blocRegle?.id);
        garderLesBlocs();
        etat.blocRegle = null;
        rendreReglage();
        rendreProgrammation();
        return;
      }

      // REPROPOSER : on jette ce qu'on a arrangé et le hub recalcule. C'est le
      // filet — sans lui, un bloc supprimé par erreur ne reviendrait pas.
      //
      // IL EFFACE LA LIGNE au lieu d'en écrire une neuve, et ce n'est pas un
      // détail : la table ne garde que ce que Noé a DÉCIDÉ. Sans ligne, le hub
      // reproposera — donc si les données ont bougé d'ici la prochaine visite,
      // il proposera mieux. Y écrire la proposition du jour la figerait.
      if (evenement.target.closest('[data-reproposer-blocs]')) {
        etat.blocs = blocsDeLaSemaine(
          etat.sources,
          etat.semaine,
          periodeDuJour(etat.sources.periodes, etat.pivot),
        );
        api.oublierLesBlocs(etat.semaine.debut).catch((erreur) => {
          console.error('Arrangement non oublié', erreur);
          signaler("L’arrangement n’a pas pu être oublié.");
        });
        rendreProgrammation();
        return;
      }

      const nature = evenement.target.closest('[data-nature-creation]');
      if (nature) {
        etat.creation = {
          ...etat.creation,
          debut: section.querySelector('#cal-debut')?.value || etat.creation.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creation.fin,
          nature: nature.dataset.natureCreation,
        };
        rendreCreation();
      }
    });

    section.addEventListener('submit', async (evenement) => {
      // RÉGLER UN BLOC. Depuis le 1er septembre 2026, l'arrangement PART au
      // réseau — il se garde d'une visite à l'autre (`garderLesBlocs`). Ce qui
      // n'a pas changé : un bloc reste une PROPOSITION, pas une donnée. On
      // n'enregistre pas un bloc, on enregistre la forme que Noé a donnée à sa
      // semaine, et « Reproposer » l'efface d'un geste.
      const reglage = evenement.target.closest('form[data-action="regler-bloc"]');
      if (reglage) {
        evenement.preventDefault();
        const champs = Object.fromEntries(new FormData(reglage));
        const [heures, minutes] = String(champs.debut || '10:00').split(':');
        const regle = {
          jour: champs.jour,
          debut: Number(heures) * 60 + Number(minutes),
          minutes: Math.max(30, Number(champs.minutes) || 60),
          espace: champs.espace,
        };

        // ON PASSE PAR LE MÊME CHEMIN QUE LE GLISSEMENT (`poserLeBloc`) : régler
        // un bloc à la main ou le lâcher sur une heure, c'est le même fait — il
        // veut cette heure-là, et ce qu'il rencontre recule. Sans ce passage, un
        // bloc créé à 16 h se posait PAR-DESSUS celui de 14 h à 16 h 30 : la
        // fusion des voisins ne règle que les chevauchements d'un même espace.
        const id = etat.blocRegle?.id ?? `main-${crypto.randomUUID()}`;
        const avecLui = etat.blocRegle?.id
          ? etat.blocs.map((bloc) => (bloc.id === id ? { ...bloc, ...regle } : bloc))
          : [...etat.blocs, { ...regle, id }];

        etat.blocs = ranger(poserLeBloc(avecLui, id, regle.jour, regle.debut));
        garderLesBlocs();
        etat.blocRegle = null;
        rendreReglage();
        rendreProgrammation();
        return;
      }

      // CORRIGER PASSE PAR LE MÊME CHEMIN QUE PARTOUT (`corrigerDepuisLeCalendrier`,
      // js/calendrier-commun.js) : chaque nature range sa date dans sa propre
      // colonne, et cette table de correspondance n'existe qu'une fois.
      const modification = evenement.target.closest(
        'form[data-action="modifier-depuis-calendrier"]',
      );
      if (modification) {
        evenement.preventDefault();
        const champs = Object.fromEntries(new FormData(modification));
        const erreur = modification.querySelector('[data-erreur]');
        erreur.hidden = true;

        try {
          await corrigerDepuisLeCalendrier(champs);
          fermerLeDetail();
          // La correction peut toucher n'importe quelle nature : on relit tout,
          // comme le font l'accueil et l'espace Calendrier après ce geste.
          await charger();
        } catch (souci) {
          console.error('Enregistrement impossible', souci);
          erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
          erreur.hidden = false;
        }
        return;
      }

      const formulaire = evenement.target.closest('form[data-action="creer-depuis-calendrier"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      formulaire.querySelector('[data-erreur]').hidden = true;

      etat.creation = null;
      rendreCreation();

      try {
        const ligne = await poserAuCalendrier(champs);
        if (ligne) {
          if (champs.nature === 'tache') etat.sources.taches = [...etat.sources.taches, ligne];
          else if (champs.nature === 'publication') {
            etat.sources.publications = [...etat.sources.publications, ligne];
          } else if (champs.nature === 'objectif') {
            etat.sources.objectifs = [...etat.sources.objectifs, ligne];
          } else etat.sources.evenements = [...etat.sources.evenements, ligne];
        }
        rendreProgrammation();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        signaler("Ça n'a pas pu être enregistré.");
      }
    });

    await charger();
  },
};
