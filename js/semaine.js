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
import { depuisDateISO, dureeLisible, echapper, NOMS_ESPACES } from './format.js';
import {
  appliquerAuCalendrier,
  assemblerCalendrier,
  brancherCapture,
  brancherClavier,
  brancherDeplacement,
  brancherSelection,
  champsApresDeplacement,
  construireGrille,
  fenetreCreation,
  jourSousLePoint,
  natureParDefaut,
  poserAuCalendrier,
  prendreEnMain,
  suivreLaMain,
  toutesLesNatures,
  viserLeJour,
} from './calendrier-commun.js';
import { modifierAussitot } from './ecriture.js';
import {
  bilanDeLaSemaine,
  diagnosticDeLaSemaine,
  pivotDeLaSemaine,
  semaineDe,
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
// ceux du MIROIR, et aucun ne peut baisser à cause d'un oubli : victoires,
// tâches terminées, heures mesurées, humeur, pratiques d'habitudes. Nulle part
// un taux de réussite, une tâche non faite comptée, ou une comparaison avec la
// semaine d'avant — un bilan qui note la semaine passée transformerait le
// rendez-vous du dimanche en examen.
//
// UN ZÉRO NE S'AFFICHE PAS. « 0 victoire » est la première chose qu'on lirait
// d'une semaine calme, et c'est un constat d'échec pour une information nulle.
// C'est la règle des habitudes, appliquée ici : une série à zéro se tait.
const dixieme = (nombre) => nombre.toFixed(1).replace('.', ',').replace(',0', '');

export function construireBilan(bilan) {
  const chiffres = [
    bilan.victoires && {
      valeur: String(bilan.victoires),
      mot: bilan.victoires > 1 ? 'victoires' : 'victoire',
    },
    bilan.taches && {
      valeur: String(bilan.taches),
      mot: bilan.taches > 1 ? 'tâches terminées' : 'tâche terminée',
    },
    bilan.minutes && { valeur: dureeLisible(bilan.minutes), mot: 'mesurées' },
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
      // La tâche prise en main AU DOIGT : on la choisit, puis on touche un
      // jour. Le glissement est un geste de souris — sur une liste verticale,
      // au doigt, il ne se distingue pas d'un défilement.
      choisie: null,
      // Le repli des mises de côté, retenu d'un rendu à l'autre.
      ecarteesOuvertes: false,
      validee: false,
      creation: null,
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

        <!-- LA GRILLE ET LE VIVIER CÔTE À CÔTE, et c'est tout l'objet de la
             page : la chose à poser et l'endroit où la poser doivent se voir
             ensemble. Sur téléphone ils s'empilent, la grille d'abord — c'est
             pour elle qu'on est venu. -->
        <div class="semaine-programmation">
          <section class="bloc semaine-grille">
            <h2>Jour par jour</h2>
            <div id="bloc-grille"><p class="vide">…</p></div>
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

        <!-- CE QUE LE HUB VOIT, après la grille et non avant : on lit un
             constat mieux une fois qu'on a vu la semaine qu'il décrit. Chaque
             ligne porte sa porte de sortie — c'est la règle du rendez-vous, et
             elle n'a pas d'exception. -->
        <section class="bloc">
          <h2>Ce que je vois</h2>
          <div id="bloc-lignes"><p class="vide">…</p></div>
        </section>

        <div id="bloc-fin"></div>

        <!-- LE MÊME « + » QU'AILLEURS (30 août 2026, demande de Noé). Une page
             où l'on programme sa semaine doit permettre d'y AJOUTER, pas
             seulement d'y ranger ce qui existe : le rendez-vous qu'on se
             rappelle en regardant le jeudi n'a pas à faire changer de page. -->
        <button type="button" class="ouvrir-capture" data-ouvrir-creation
          title="Ajouter au calendrier" aria-label="Ajouter au calendrier">${PLUS}</button>

        <div id="bloc-creation"></div>`;
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
    function rendreProgrammation() {
      assembler();
      cible('bloc-grille').innerHTML = construireGrille(
        etat.elements,
        toutesLesNatures(),
        'semaine',
        etat.pivot,
        { montrerEspace: true, aide: false },
      );
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
      // Les jours s'allument quand une tâche est choisie : sans ce signe, le
      // second geste du toucher ne se devinerait pas.
      section.querySelector('.semaine-programmation')?.classList
        .toggle('semaine-en-main', Boolean(etat.choisie));
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

    function rendreTout() {
      rendreMessage();
      rendreBilan();
      rendreProgrammation();
      rendreLignes();
      rendreFin();
      rendreCreation();
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
    async function programmer(id, jour) {
      const tache = etat.sources.taches.find((candidate) => candidate.id === id);
      if (!tache || tache.echeance === jour) return;

      etat.choisie = null;
      etat.message = null;
      await modifierAussitot(
        tache,
        { echeance: jour },
        () => api.modifierTache(tache.id, { echeance: jour }),
        { rendre: rendreProgrammation, echouer: signaler },
      );
    }

    // La ramener au vivier. `heure` part avec la date : une heure sans jour ne
    // veut rien dire, c'est la règle de la tuile de capture.
    async function deprogrammer(cle) {
      const [type, id] = cle.split(':');
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
      async ({ element: cle, ecart }) => {
        const [type, id] = cle.split(':');
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
      { zones: [{ selecteur: '.semaine-vivier', quand: deprogrammer }] },
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
