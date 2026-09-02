// LA PAGE D'UN PROJET — `#projet/<id>` (2 septembre 2026, demande de Noé).
//
// « Pour les projets, chacun d'eux doit avoir sa propre page (à ouvrir depuis
//   la page projet) dans laquelle un calendrier en vue mois et semaine et une
//   colonne pour les tâches et étapes que l'on pourra glisser dans le
//   calendrier pour les programmer. La page doit contenir tous les détails du
//   projet également. »
//
// CE QU'ELLE REMPLACE, ET IL FAUT LE DIRE. Un projet se dépliait SUR PLACE dans
// la galerie de `#objectifs/projets` — la tuile prenait toute la largeur et
// montrait ses étapes, ses tâches, ce qu'il sert. La règle des deux rangs
// tranche autrement dès qu'il y a une page : la galerie est à deux gestes, elle
// ne dit que ce qui se COMPARE ; la page est à trois, et elle dit tout. Deux
// endroits qui montrent la même chose finissent par se contredire, et c'est
// toujours celui qu'on regarde le moins qui ment. Le dépliage est donc parti
// avec ce fichier — git en garde la trace.
//
// CE QU'ELLE AJOUTE, et qui n'existait nulle part : le TEMPS d'un projet. Le
// hub savait qu'un projet portait quatorze tâches ; il ne montrait pas QUAND
// elles tombaient, ni les trous entre elles. Le calendrier de la page ne montre
// que ce qui sert ce projet-là — ses tâches, ses événements, ses parutions, ses
// étapes — et la colonne d'à côté porte ce qui n'a pas encore de jour.
//
// LA COLONNE ET LA GRILLE VIENNENT DE « MA SEMAINE », mise en page comprise :
// c'est le même geste — la chose à poser et l'endroit où la poser doivent se
// voir ensemble —, et il n'y avait aucune raison de le redessiner. Ce qui
// change, c'est la portée : là-bas une semaine, tous espaces ; ici un projet,
// tout le temps qu'il occupe.
//
// UNE ÉTAPE PORTE UN JOUR DEPUIS CE JOUR-LÀ (décision de Noé, entre deux
// options). Elle n'en avait pas — « une étape découpe le TRAVAIL, pas le
// calendrier » (29 août) —, et c'est ce qui la distinguait d'un jalon. L'autre
// réponse possible était de fabriquer une tâche en glissant l'étape ; Noé a
// choisi que ce qu'on glisse soit ce qu'on retrouve. La colonne `echeance`
// reste facultative : un découpage sans jour est un découpage, pas un retard.

import * as api from './api.js';
import { avanceeDuProjet, mouvementDuProjet } from './orientation.js';
// LE DESSIN VIENT DE LA GALERIE, il ne se recopie pas : la jauge d'un projet
// doit dire la même chose sur les deux écrans, sans quoi c'est celui qu'on
// regarde le plus qu'on croira. Même chose pour ce qu'un formulaire demande et
// pour la façon dont les tâches se groupent.
import {
  FORMULAIRES,
  grouperLesTaches,
  jaugeDuProjet,
  motDeLAvancee,
  motDuMouvement,
  pastilleEtat,
} from './objectifs.js';
import {
  construireFormulaire,
  construireMenuDiscret,
  demanderLaDuree,
} from './gabarits.js';
import { modifierAussitot, retirerAussitot } from './ecriture.js';
import {
  NOMS_ESPACES,
  RECURRENCES,
  depuisDateISO,
  dureeLisible,
  echapper,
  echeanceLisible,
  rangerParEcheance,
} from './format.js';
import {
  appliquerAuCalendrier,
  assemblerCalendrier,
  brancherCapture,
  brancherClavier,
  brancherDeplacement,
  brancherEtatPublication,
  brancherSelection,
  champsApresDeplacement,
  construireBarrePeriode,
  construireGrille,
  corrigerDepuisLeCalendrier,
  deplacerAncre,
  effacerDepuisLeCalendrier,
  fenetreCreation,
  fenetreDetail,
  jourSousLePoint,
  poserAuCalendrier,
  prendreEnMain,
  suivreLaMain,
  toutesLesNatures,
  viserLeJour,
} from './calendrier-commun.js';

// Les signes du hub : un dessin et non un émoji, qui arriverait avec sa couleur
// et sa police à lui.
const SIGNE = {
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6"/></svg>`,
  repetition: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
    <path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
  retour: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6 6 6"/></svg>`,
};

const PLUS_ROND = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14"/></svg>`;

// --- Les mots -----------------------------------------------------------------

const jourLisible = (iso) => (iso ? echeanceLisible(depuisDateISO(iso)) : '');

// `date_fait` est un timestamptz, `jourLisible` attend une date nue.
const jourDuFait = (tache) => (tache?.date_fait ? String(tache.date_fait).slice(0, 10) : null);

const pluriel = (nombre, singulier, plurielMot = `${singulier}s`) =>
  `${nombre} ${nombre > 1 ? plurielMot : singulier}`;

function heuresLisibles(minutes) {
  const heures = minutes / 60;
  const dit = Number.isInteger(heures) ? String(heures) : heures.toFixed(1).replace('.', ',');
  return `${dit} h`;
}

function chargeDuProjet(projet) {
  if (projet.charge_hebdo) return `${dureeLisible(projet.charge_hebdo)} par semaine`;
  if (projet.charge_minutes) return `${dureeLisible(projet.charge_minutes)} en tout`;
  return '';
}

// Les heures se saisissent en heures — c'est ainsi qu'on pense un projet — et
// se rangent en minutes, l'unité de `taches.duree` et des événements.
function enMinutes(valeur) {
  const heures = Number(valeur);
  return Number.isFinite(heures) && heures > 0 ? Math.round(heures * 60) : null;
}

// --- L'état -------------------------------------------------------------------

const etat = {
  // L'identifiant venu de l'adresse. `#projet/<id>` : le second niveau du
  // routeur EST le projet — il n'y a rien d'autre à nommer sur cette page, et
  // `#projet/fiche/<id>` aurait mis un mot vide entre l'adresse et son sujet.
  id: null,
  projet: null,
  projets: [], // tous, pour la pastille de rattachement de la tuile de capture
  objectifs: [],
  taches: [], // toutes : les orphelines à rattacher en font partie
  evenements: [],
  publications: [],
  elements: [],

  vue: 'mois',
  ancre: new Date(),

  // La chose prise en main AU DOIGT — `tache:<id>` ou `etape:<id>`. On la
  // choisit, puis on touche un jour : sur une liste verticale, un glissement ne
  // se distingue pas d'un défilement.
  choisie: null,

  // CE QUE LA COLONNE DE DROITE MONTRE — « à poser », « à faire », « faites »
  // (2 septembre 2026, demande de Noé). « À poser » est le défaut : c'est la
  // page où l'on place, et c'est la seule des trois listes dont chaque ligne
  // appelle un geste ; les deux autres se relisent.
  filtreTaches: 'poser',
  rattache: false, // le repli des orphelines à rattacher
  menu: null,
  confirme: null,
  edition: null, // { forme, id } — ce que la tuile volante corrige ou crée

  creation: null,
  detail: null,
  editionDetail: false,

  message: null,
  echec: false,
};

function menu(forme, id, options = {}) {
  return construireMenuDiscret(forme, id, {
    ...options,
    ouvert: etat.menu === `${forme}:${id}`,
    confirmation: etat.confirme === `${forme}:${id}`,
  });
}

// --- Ce qui mesure ce projet ---------------------------------------------------
// Sans cette ligne, un projet à jauge pointillée laisse croire qu'il n'avance
// pas, alors qu'il n'a simplement rien déclaré à mesurer — et rien à l'écran ne
// dirait comment y remédier.
function surQuoiIlSeMesure(avancee, projet) {
  if (avancee.mesure === 'etapes') return '';
  if (avancee.mesure === 'declaree') return "Tu l'as déclaré terminé.";
  if (avancee.mesure === 'charge') {
    if (avancee.sansDuree) {
      return `${heuresLisibles(
        avancee.annonce,
      )} annoncées, mais aucune durée notée sur ce qui est fait — le hub ne peut rien en dire. Des étapes le mesureraient sans rien demander de plus.`;
    }
    return `Mesuré à l'heure : ${heuresLisibles(avancee.minutes)} notées sur ${heuresLisibles(
      avancee.annonce,
    )} annoncées. Poser des étapes le mesurerait plus finement.`;
  }
  if (projet.statut === 'annuel') {
    return "Un projet à l'année ne se mesure pas : il tourne, il n'avance pas vers une fin.";
  }
  return 'Rien ne le mesure encore. Pose des étapes, ou annonce une charge en heures.';
}

function capsServis(projet) {
  return (projet.cibles ?? [])
    .map((cible) => etat.objectifs.find((objectif) => objectif.id === cible.objectif_id)?.titre)
    .filter(Boolean);
}

// --- La tête : tous les détails du projet --------------------------------------
//
// ELLE OUVRE LA PAGE, avant le calendrier. C'est la réponse à « où j'en suis » ;
// le calendrier répond à « quand ». On lit l'une avant l'autre.
function enTete(projet) {
  const avancee = avanceeDuProjet(projet, etat.taches);
  const mesure = surQuoiIlSeMesure(avancee, projet);
  const caps = capsServis(projet);
  const service = [
    chargeDuProjet(projet),
    projet.echeance ? jourLisible(projet.echeance) : '',
    motDuMouvement(mouvementDuProjet(projet, etat.taches)),
  ].filter(Boolean);

  return `
    <p class="projet-page-retour">
      <a href="#objectifs/projets">${SIGNE.retour}<span>Tous les projets</span></a>
    </p>

    <header class="projet-page-tete" data-espace="${echapper(projet.espace)}">
      <span class="cap-tuile-tete">
        <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(
          NOMS_ESPACES[projet.espace] ?? projet.espace,
        )}</span>
        ${pastilleEtat(projet)}
      </span>
      <!-- LE CAP QUE CE PROJET SERT, À CÔTÉ DE SON TITRE (2 septembre 2026,
           demande de Noé) : en plus petite police et en encre discrète. Les
           deux réponses à « où je suis » se lisent alors d'un seul regard — ce
           projet-ci, et ce vers quoi il pousse.
           « Sert : » est HORS ÉCRAN et non supprimé : à l'œil, deux textes
           voisins de deux tailles se comprennent sans mot de liaison ; à
           l'oreille, « Album du club 1 000 abonnés » n'en aurait aucun. -->
      <h1>${echapper(projet.nom)}${
        caps.length
          ? `<span class="projet-page-cap"><span class="hors-ecran">Sert : </span>${echapper(
              caps.join(' · '),
            )}</span>`
          : ''
      }</h1>
      <p class="discret projet-page-service">${echapper(service.join(' · '))}</p>
      ${menu('projet', projet.id, { visible: true })}

      <div class="projet-page-avancee">
        ${jaugeDuProjet(avancee)}
        ${
          motDeLAvancee(avancee)
            ? `<span class="projet-page-avancee-mot">${echapper(motDeLAvancee(avancee))}</span>`
            : ''
        }
      </div>
      ${mesure ? `<p class="discret projet-page-mesure">${echapper(mesure)}</p>` : ''}

      ${projet.resultat ? `<p class="cap-pourquoi">${echapper(projet.resultat)}</p>` : ''}
    </header>`;
}

// --- Ce qui va au calendrier ---------------------------------------------------
//
// Les étapes s'ajoutent À LA MAIN, comme « Ma semaine » ajoute ses blocs :
// `assemblerCalendrier` ne connaît que les six natures du hub, et une étape n'en
// est pas une — elle n'existe qu'ici. Le reste de la grille ne s'en aperçoit
// pas : `champsApresDeplacement` range déjà toute date inconnue dans `echeance`,
// et `appliquerAuCalendrier` sait maintenant écrire une étape.
function assembler() {
  const projet = etat.projet;
  if (!projet) {
    etat.elements = [];
    return;
  }

  etat.elements = assemblerCalendrier({
    evenements: etat.evenements,
    // Seules les datées entrent au calendrier : sans échéance il n'y a pas de
    // jour où poser la barre, et c'est justement ce que la colonne répare.
    taches: etat.taches.filter((tache) => tache.projet_id === projet.id && tache.echeance),
    publications: etat.publications.filter((pub) => pub.date_prevue),
  });

  for (const etape of projet.etapes ?? []) {
    if (!etape.echeance) continue;
    etat.elements.push({
      id: etape.id,
      type: 'etape',
      source: etape,
      date: depuisDateISO(etape.echeance),
      // Franchie, elle se barre comme une tâche faite : ce qui a eu lieu garde
      // sa place dans le mois.
      faite: Boolean(etape.atteint),
      espace: projet.espace,
      titre: etape.titre,
    });
  }

  etat.elements.sort((a, b) => a.date - b.date);
}

// --- LES DEUX COLONNES, DE PART ET D'AUTRE DU CALENDRIER (2 septembre 2026) ---
//
// Demande de Noé : *« plutôt qu'une répétition des étapes et des tâches, faisons
// une colonne à gauche du calendrier pour les étapes comme elles sont affichées
// actuellement, et que l'on peut glisser-déposer à une date du calendrier ; et à
// droite pareil, une colonne pour les tâches que l'on peut filtrer par les
// tâches à poser, celles à faire, celles faites. »*
//
// CE QUE ÇA REMPLACE, ET IL A RAISON : la page portait TROIS listes — une
// colonne « À poser » qui ne montrait que ce qui n'avait pas de jour, puis, sous
// le calendrier, la frise entière des étapes et la liste entière des tâches. Une
// étape sans date s'affichait donc DEUX fois, à deux endroits qui ne se
// ressemblaient pas. La réserve et le découpage étaient la même chose vue sous
// deux angles ; il n'en reste qu'un.
//
// CE QUE ÇA CHANGE POUR LE GESTE : on ne glisse plus seulement ce qui n'a pas de
// jour. N'importe quelle étape, n'importe quelle tâche ouverte se pose ou se
// REPOSE d'un glissement, depuis la même liste qu'on relit.
//
// CE QUI EST FAIT NE SE GLISSE PAS — une étape franchie, une tâche terminée. Ce
// n'est pas une prudence : leur ligne n'affiche plus `echeance` mais le jour où
// c'est arrivé, et un glissement écrirait une date qu'on ne verrait pas changer.
// Un geste dont on ne voit pas l'effet est pire qu'un geste absent.

// --- La colonne de gauche : ses étapes -----------------------------------------
//
// La MÊME frise que les jalons d'un cap : même dessin, mêmes gestes, même point
// qu'on presse. C'est le même motif un étage plus bas, et deux formes pour deux
// choses identiques auraient demandé de réapprendre le geste en descendant.
function friseEtapes(projet) {
  // L'ORDRE CHRONOLOGIQUE (2 septembre 2026) : voir `rangerParEcheance`. La date
  // range, `ordre` range ce qui n'en a pas — et ce qui n'en a pas ferme la
  // marche. C'est la même règle que les jalons d'un cap, un étage plus haut.
  const etapes = rangerParEcheance(projet.etapes ?? []);
  const prochaine = etapes.find((etape) => !etape.atteint);

  if (!etapes.length) {
    return `<p class="cap-vide">Aucune étape. La première dira comment ce projet
      se découpe — et c'est elle qui le mesurera.</p>`;
  }

  const lignes = etapes
    .map((etape, rang) => {
      const cle = `etape:${etape.id}`;
      const prenable = !etape.atteint;
      const choisie = etat.choisie === cle;

      return `
      <li class="cap-jalon${etape.atteint ? ' atteint' : ''}${
        etape === prochaine ? ' prochain' : ''
      }${choisie ? ' colonne-choisie' : ''}"
        ${prenable ? `data-poser="${echapper(cle)}"` : ''}>
        <button type="button" class="cap-jalon-point" data-etape="${echapper(etape.id)}"
          aria-pressed="${Boolean(etape.atteint)}"
          aria-label="${
            etape.atteint ? 'Revenir sur cette étape' : 'Marquer cette étape franchie'
          }"></button>
        <span class="cap-jalon-corps">
          ${prenable ? boutonDePrise(cle, etape.titre, 'cap-jalon-titre', choisie) : `<span class="cap-jalon-titre">${echapper(etape.titre)}</span>`}
          ${
            // LA MÊME FORME QUE LA DATE D'UNE TÂCHE (2 septembre 2026, correction
            // de Noé). `.cap-tache-date` n'a AUCUN style à lui : son corps et son
            // encre discrète viennent entièrement de `.cap-tache-service`, qui
            // l'entoure sur une ligne de tâche. Posée nue dans la frise, elle
            // héritait du corps de la page — 1 rem en encre pleine, donc PLUS
            // GROSSE que le titre de l'étape, qui vaut 0,875 rem.
            etape.echeance
              ? `<span class="cap-tache-service"><span
                  class="cap-tache-date">${echapper(jourLisible(etape.echeance))}</span></span>`
              : ''
          }
        </span>
        ${menu('etape', etape.id, {
          // DEUX MARCHES DATÉES NE S'ÉCHANGENT PAS À LA MAIN : c'est leur date
          // qui les range l'une par rapport à l'autre, et le rendu suivant les
          // remettrait où elles étaient — un bouton dont l'effet s'annule tout
          // seul est un bouton qui ment. Pour changer leur ordre, on change une
          // date, d'un glissement sur le calendrier d'à côté.
          deplacer: {
            haut: rang > 0 && !(etape.echeance && etapes[rang - 1].echeance),
            bas: rang < etapes.length - 1 && !(etape.echeance && etapes[rang + 1].echeance),
          },
        })}
      </li>`;
    })
    .join('');

  return `<ol class="cap-frise">${lignes}</ol>`;
}

// LE TITRE DEVIENT LE BOUTON DE PRISE, et c'est ce qui rend le chemin du doigt
// atteignable AU CLAVIER : le glissement est un geste de souris, et sans lui il
// ne resterait rien. Un vrai `<button>` et non un `role` posé sur un span — il
// se tabule, il porte son état, et le hub ne fabrique pas de faux boutons.
//
// Il ne change pas l'allure de la ligne : le CSS lui retire tout ce qu'un
// navigateur ajoute à un bouton, et il garde la classe de son titre.
function boutonDePrise(cle, titre, classe, choisie) {
  return `<button type="button" class="${classe} colonne-prise"
    data-choisir="${echapper(cle)}" aria-pressed="${choisie}"
    title="Glisse-la sur un jour, ou touche-la puis touche le jour"
    aria-label="${echapper(titre)} — glisse-la sur un jour, ou touche-la puis touche le jour"
    >${echapper(titre)}</button>`;
}

// --- La colonne de droite : ses tâches -----------------------------------------
//
// TROIS FILTRES, ET UN SEUL À LA FOIS (demande de Noé). Ce sont trois QUESTIONS
// différentes — qu'est-ce qui n'a pas de jour, qu'est-ce qu'il me reste, qu'est-ce
// que j'ai fait —, pas trois cases à combiner : « à poser » est déjà contenu dans
// « à faire », et les cocher ensemble ne dirait rien de plus.
//
// Le dessin est celui des `.affichages` du calendrier — la piste arrondie, l'actif
// en pastille pleine. C'est le MÊME geste, choisir ce qu'une liste montre, et
// écrire un troisième dessin pour un geste qui en a déjà un, c'est fabriquer la
// divergence qu'on passe ensuite à rattraper.
// LES TROIS SE PARTAGENT LES TÂCHES SANS SE RECOUVRIR (2 septembre 2026,
// correction de Noé : « plutôt que "à faire" pour le filtre des tâches, c'est
// les tâches programmées »). Et c'est plus juste : « à faire » CONTENAIT « à
// poser », si bien que passer de l'un à l'autre ne retirait rien — on ne voyait
// pas ce que le filtre faisait. Ce qui n'a pas de jour, ce qui en a un, ce qui
// est fait : trois listes qui, mises bout à bout, font exactement le projet.
const FILTRES_TACHES = {
  poser: 'À poser',
  programmees: 'Programmées',
  faites: 'Faites',
};

// « À POSER » EST LE DÉFAUT : c'est la page où l'on place, et c'est la seule des
// trois listes dont chaque ligne appelle un geste. Les deux autres se relisent.
function lignesDeLaColonne(projet) {
  const siennes = etat.taches.filter((tache) => tache.projet_id === projet.id);

  if (etat.filtreTaches === 'faites') return grouperLesTaches(siennes).lignesFaites;
  // `grouperLesTaches` met déjà ce qui est fait à part : filtrer sur la date
  // suffit à séparer les deux autres.
  const datee = etat.filtreTaches === 'programmees';
  return grouperLesTaches(siennes.filter((tache) => Boolean(tache.echeance) === datee)).lignes;
}

// TROIS FILTRES, QUATRE PHRASES : un projet qui n'a AUCUNE tâche ne dit pas la
// même chose qu'un filtre qui n'en trouve pas. « Tout a déjà son jour » sur un
// projet vide serait faux, et surtout ça n'ouvrirait aucune porte — un écran
// vide en ouvre une, il ne s'excuse pas.
const RIEN_A_MONTRER = {
  aucune: 'Rien encore. La première dira par où ça commence.',
  poser: 'Tout ce que ce projet porte a déjà son jour.',
  programmees: 'Rien de posé sur un jour. Glisse une tâche depuis « À poser ».',
  faites: 'Les premières tâches terminées de ce projet s’afficheront ici.',
};

function construireFiltreTaches() {
  return `
    <div class="affichages" role="group" aria-label="Ce que la colonne montre">
      ${Object.entries(FILTRES_TACHES)
        .map(
          ([cle, libelle]) => `
        <button type="button" data-filtre-taches="${cle}"
          aria-pressed="${cle === etat.filtreTaches}"
          class="${cle === etat.filtreTaches ? 'actif' : ''}">${libelle}</button>`,
        )
        .join('')}
    </div>`;
}

function ligneTache({ tache, serie }) {
  // Une série repliée ne dit pas la même chose selon le côté où elle tombe :
  // devant soi on compte ce qui reste, derrière soi ce qui a été fait.
  const repetition = (mot, date) =>
    `<span class="cap-tache-serie">${SIGNE.repetition}${echapper(
      (RECURRENCES[tache.recurrence] ?? 'Se répète').toLowerCase(),
    )} · ${echapper(mot)}</span>
     <span class="cap-tache-date">${echapper(jourLisible(date))}</span>`;

  const faite = tache.statut === 'fait';
  const service = !serie
    ? `<span class="cap-tache-date">${echapper(
        jourLisible(faite ? jourDuFait(tache) : tache.echeance),
      )}</span>`
    : serie.faites !== undefined
      ? repetition(`${serie.faites} fois faites`, jourDuFait({ date_fait: serie.derniere }))
      : repetition(`${serie.restantes} fois à venir`, serie.prochaine);

  // UNE OCCURRENCE DE SÉRIE NE SE GLISSE PAS, et c'est la règle du hub :
  // décaler l'une décalerait ce que la ligne repliée représente. Le calendrier
  // refuse déjà le glissement d'une barre récurrente, pour la même raison.
  const cle = `tache:${tache.id}`;
  const prenable = !faite && !serie;
  const choisie = etat.choisie === cle;

  return `
    <li class="cap-tache tache-ligne${faite ? ' tache-faite' : ''}${
      choisie ? ' colonne-choisie' : ''
    }" data-priorite="${tache.priorite ?? 4}"
      ${prenable ? `data-poser="${echapper(cle)}"` : ''}>
      <button type="button" class="tache-cercle" data-tache="${echapper(tache.id)}"
        aria-pressed="${faite}" aria-label="Terminer"></button>
      <span class="cap-tache-corps">
        ${
          prenable
            ? boutonDePrise(cle, tache.titre, 'cap-tache-titre tache-titre', choisie)
            : `<span class="cap-tache-titre tache-titre">${echapper(tache.titre)}</span>`
        }
        <span class="cap-tache-service">${service}</span>
      </span>
      ${menu('tache', tache.id)}
    </li>`;
}

function listeDesTaches(projet) {
  const lignes = lignesDeLaColonne(projet);
  const aucune = !etat.taches.some((tache) => tache.projet_id === projet.id);

  // Les orphelines de son espace se rattachent d'un bouton : c'est la seule
  // façon raisonnable de rattraper les tâches écrites avant qu'il existe.
  const orphelines = etat.taches.filter(
    (tache) => tache.espace === projet.espace && !tache.projet_id && tache.statut !== 'fait',
  );

  return `
    ${construireFiltreTaches()}
    <div class="projet-page-liste">
      ${
        lignes.length
          ? `<ul class="cap-taches">${lignes.map(ligneTache).join('')}</ul>`
          : `<p class="cap-vide">${echapper(
              RIEN_A_MONTRER[aucune ? 'aucune' : etat.filtreTaches],
            )}</p>`
      }
    </div>
    <span class="cap-projet-gestes">
      <button type="button" class="cap-ajout-discret" data-ajout="tache">
        ${SIGNE.plus}<span>Ajouter une tâche</span></button>
      ${
        orphelines.length
          ? `<button type="button" class="cap-ajout-discret" data-rattacher-vers>
               <span>Rattacher une tâche</span>
               <span class="chiffre">${orphelines.length}</span></button>`
          : ''
      }
    </span>
    ${
      etat.rattache
        ? `<ul class="cap-orphelines">${orphelines
            .map(
              (tache) => `
            <li>
              <span>${echapper(tache.titre)}</span>
              <button type="button" class="lien-discret bouton-mini"
                data-rattacher="${echapper(tache.id)}">Rattacher</button>
            </li>`,
            )
            .join('')}</ul>`
        : ''
    }`;
}

// --- La tuile volante : poser, corriger ----------------------------------------
//
// Les mêmes trois formulaires que `#objectifs` — le projet, son étape, sa tâche
// — et ils viennent de là-bas : deux listes de champs auraient fini par ne plus
// demander la même chose.
function laFenetre() {
  if (!etat.edition) return '';
  const { forme, id } = etat.edition;
  const modele = FORMULAIRES[forme];
  const valeurs = id ? (trouver(`${forme}:${id}`) ?? {}) : {};

  return construireFormulaire({
    id: `projet-${forme}`,
    libelle: id ? modele.modifier : modele.ajouter,
    action: 'enregistrer-projet',
    bouton: id ? 'Enregistrer' : 'Ajouter',
    // Le contexte du formulaire d'un projet : les objectifs qu'il peut servir.
    champs: modele.champs(valeurs, etat.objectifs),
    extra: `<input type="hidden" name="forme" value="${echapper(forme)}">
            <input type="hidden" name="id" value="${echapper(id ?? '')}">`,
  });
}

function trouver(cle) {
  const [forme, id] = cle.split(':');
  if (forme === 'projet') return etat.projet;
  if (forme === 'tache') return etat.taches.find((tache) => tache.id === id);
  if (forme === 'etape') return (etat.projet?.etapes ?? []).find((etape) => etape.id === id);
  return null;
}

// --- L'écran -------------------------------------------------------------------

function squelette() {
  if (etat.echec) {
    return `
      <h1>Projet</h1>
      <p class="vide">Les données n'ont pas pu être chargées.
        <button type="button" class="lien-discret" data-action="reessayer">Réessayer</button></p>`;
  }

  const projet = etat.projet;
  if (!projet) {
    // Deux absences, deux phrases : arriver ici sans identifiant — par le menu,
    // par une adresse tapée à la main — n'est pas la même chose que suivre un
    // lien vers un projet supprimé depuis. Un seul message pour les deux dirait
    // « disparu » à quelqu'un qui n'a rien demandé.
    return `
      <h1>Projet</h1>
      <p class="vide">${
        etat.id
          ? "Ce projet n'existe plus."
          : 'Aucun projet choisi.'
      } <a href="#objectifs/projets">Voir tous les projets</a></p>`;
  }

  return `
    ${enTete(projet)}

    ${etat.message ? `<p class="discret message-regle">${echapper(etat.message)}</p>` : ''}

    <!-- TROIS COLONNES : LES ÉTAPES, LE CALENDRIER, LES TÂCHES (2 septembre
         2026, demande de Noé). Ce qu'on pose et l'endroit où on le pose doivent
         se voir ENSEMBLE — c'est un geste, pas une lecture —, et chaque liste
         n'existe qu'une fois : la réserve et le découpage étaient la même chose
         vue sous deux angles.

         L'ORDRE DU DOM EST L'ORDRE DE LECTURE, à toutes les largeurs : étapes,
         calendrier, tâches. On aurait pu remonter la grille en premier sur
         téléphone — c'est ce que fait « Ma semaine » —, mais il aurait fallu la
         déplacer par la mise en page, et le clavier serait alors passé dans un
         ordre que l'œil ne voit pas. La colonne des étapes est la plus courte
         des trois ; la lire avant le calendrier n'est pas absurde : elle dit ce
         que le projet contient, la grille dit quand.

         PAS DE FILTRES DE NATURE sur la grille : la page ne montre qu'un projet,
         et cacher une part de si peu n'ajouterait qu'une rangée de cases. -->
    <div class="projet-page-programmation${etat.choisie ? ' en-main' : ''}">
      <section class="bloc projet-page-colonne projet-page-etapes">
        <h2>Ses étapes</h2>
        <div class="projet-page-liste">${friseEtapes(projet)}</div>
        <button type="button" class="cap-ajout-discret" data-ajout="etape">
          ${SIGNE.plus}<span>Poser une étape</span></button>
      </section>

      <section class="bloc projet-page-grille">
        <h2>Son calendrier</h2>
        ${construireBarrePeriode(etat.vue, etat.ancre, {
          // SEMAINE, MOIS, 3 MOIS, ANNÉE (2 septembre 2026, demandes de Noé) : les
          // jalons d'un projet tombent à des mois de distance, et une vue mois n'en
          // montrait jamais que le premier. Pas d'agenda — il répéterait la
          // liste qui vit juste à côté.
          vues: ['semaine', 'mois', 'trimestre', 'annee'],
        })}
        <div id="projet-page-grille">
          ${construireGrille(
            etat.elements,
            // « étape » s'ajoute ICI et pas dans `NATURES` : le calendrier plein
            // écran n'en affiche pas, et lui donner une case à cocher
            // promettrait quelque chose qui n'existe que sur cette page.
            new Set([...toutesLesNatures(), 'etape']),
            etat.vue,
            etat.ancre,
            { montrerEspace: true, aide: false },
          )}
        </div>
      </section>

      <section class="bloc projet-page-colonne projet-page-taches">
        <h2>Ses tâches</h2>
        ${listeDesTaches(projet)}
      </section>
    </div>

    <!-- LE MÊME « + » QU'AILLEURS, et il arrive DÉJÀ RATTACHÉ : ce qu'on note
         depuis la page d'un projet sert ce projet. -->
    <button type="button" class="ouvrir-capture" data-ouvrir-creation
      title="Ajouter à ce projet" aria-label="Ajouter à ce projet">${PLUS_ROND}</button>

    <div class="cap-fenetre-hote">${laFenetre()}</div>
    <div id="projet-creation">${
      etat.creation
        ? fenetreCreation({
            ...etat.creation,
            espaces: { [projet.espace]: NOMS_ESPACES[projet.espace] ?? projet.espace },
            projets: etat.projets,
            valeurs: { espace: projet.espace, projet_id: projet.id },
          })
        : ''
    }</div>
    <div id="projet-detail">${
      etat.detail
        ? fenetreDetail(etat.detail, {
            edition: etat.editionDetail,
            statutModifiable: true,
          })
        : ''
    }</div>`;
}

export default {
  async monter(section, route) {
    etat.id = route?.vue ?? null;

    let poserLEntreeClavier = null;
    let rafraichirLaCapture = null;

    // CE QUE LA PAGE DIT D'ELLE-MÊME — son nom dans l'onglet, sa couleur sur le
    // corps —, et il faut le REPOSER à chaque passage du routeur, pas seulement
    // au chargement. `app.js` écrit les deux dans `afficherEspace`, et il
    // l'appelle une seconde fois au démarrage : Supabase rend un événement de
    // session juste après qu'on s'y abonne. Mesuré — l'onglet repassait à
    // « Projet — Hub » et l'accent au gris neutre une fois la page déjà
    // affichée, sans que rien à l'écran ne bouge.
    //
    // Le nom du projet EST le nom de la page : « Projet — Hub » ne dirait pas
    // lequel. Et la couleur est celle de SON espace : « projet » est le nom d'un
    // écran, pas d'un espace de Noé — un projet, lui, appartient à un espace, et
    // c'est celui qu'on doit sentir, comme dans la galerie d'où l'on vient.
    //
    // SEULEMENT SI L'ON EST ENCORE DESSUS : un chargement qui se termine après
    // qu'on a changé d'onglet repeindrait l'écran d'à côté aux couleurs d'un
    // projet qu'on ne regarde plus.
    const habiller = () => {
      if (!etat.projet || section.hidden) return;
      document.title = `${etat.projet.nom} — Hub`;
      document.body.dataset.espace = etat.projet.espace;
    };

    const rendre = () => {
      section.innerHTML = squelette();
      habiller();

      // La tuile volante n'a pas de sommaire à presser : c'est une pastille ou
      // un menu qui l'ouvre. On la déplie donc à la main.
      const fenetre = section.querySelector('.cap-fenetre-hote .ajout-volant');
      if (fenetre) {
        fenetre.open = true;
        fenetre.querySelector('input, textarea')?.focus();
      }

      poserLEntreeClavier?.();
      if (etat.creation) rafraichirLaCapture?.();
    };

    const signaler = (mot) => {
      etat.message = mot;
      rendre();
    };

    const charger = async () => {
      if (!etat.id) {
        etat.projet = null;
        rendre();
        return;
      }

      try {
        const [projets, objectifs, taches, evenements, publications] = await Promise.all([
          api.projetsTous(),
          api.objectifsActifs(),
          api.tachesToutes(),
          api.evenementsTous(),
          api.publicationsToutes(),
        ]);

        etat.projets = projets;
        etat.projet = projets.find((projet) => projet.id === etat.id) ?? null;
        // LES TROIS ESPACES QUI ONT DES CAPS, et pas le perso : ses « objectifs »
        // sont des INTENTIONS — sans mesure ni date —, et un projet ne les sert
        // pas. Sans ce filtre, la pastille « Objectifs servis » les offrait,
        // masqués certes, mais présents dans la liste.
        etat.objectifs = objectifs.filter((objectif) =>
          ['fch', 'formation', 'photo'].includes(objectif.espace),
        );
        etat.taches = taches;
        etat.evenements = evenements.filter((ligne) => ligne.projet_id === etat.id);
        etat.publications = publications.filter((ligne) => ligne.projet_id === etat.id);
        etat.echec = false;
      } catch (erreur) {
        console.error("Chargement du projet impossible", erreur);
        etat.echec = true;
      }

      assembler();
      rendre();
    };

    this.rafraichir = charger;

    // CHANGER DE PROJET RELIT TOUT : deux projets n'ont ni les mêmes tâches ni
    // les mêmes étapes, et il n'y a rien à garder d'un écran à l'autre. Revenir
    // sur le MÊME projet ne relit rien ici — `rafraichir` s'en charge.
    //
    // LE FILTRE DES TÂCHES SURVIT, LUI, et c'est voulu : c'est une façon de
    // regarder, pas une donnée du projet. Qui relit ce qui est fait sur un
    // projet le relit souvent sur le suivant, et redemander le même clic à
    // chaque page ferait de ce filtre une corvée.
    this.naviguer = (nouvelle) => {
      const id = nouvelle?.vue ?? null;
      // Le même projet : rien à relire, mais il FAUT rendre à la page son nom et
      // sa couleur — `afficherEspace` vient de les remplacer par ceux de l'écran.
      if (id === etat.id) return habiller();
      etat.id = id;
      etat.projet = null;
      etat.choisie = null;
      etat.menu = null;
      etat.confirme = null;
      etat.edition = null;
      etat.detail = null;
      etat.creation = null;
      etat.message = null;
      rendre();
      charger();
    };

    rendre();
    await charger();

    // --- Les pastilles de la tuile de capture ---
    //
    // `brancherCapture` SEUL, jamais avec `brancherChoix` : les deux écoutent
    // `[data-ouvrir-choix]`, et un menu ouvert puis refermé dans le même clic
    // ne s'ouvre jamais. C'est le double traitement qui a fait retirer l'appel
    // du site FCH.
    rafraichirLaCapture = brancherCapture(section, { projets: () => etat.projets });

    // --- Poser ce qu'on tient sur un jour ---

    async function programmer(cle, jour) {
      const [forme, id] = cle.split(':');
      etat.choisie = null;
      etat.message = null;

      const ligne = trouver(cle);
      if (!ligne) return;

      const champs = { echeance: jour };
      await modifierAussitot(
        ligne,
        champs,
        () => (forme === 'etape' ? api.modifierEtape(id, champs) : api.modifierTache(id, champs)),
        { rendre: rendreTout, echouer: signaler },
      );
    }

    // DÉPROGRAMMER : ramener une barre dans la colonne. Le geste inverse de
    // celui qu'on vient de faire, et il se devine parce qu'il est symétrique.
    // Une tâche rend aussi son heure — sans jour, un créneau ne veut rien dire.
    // Elle reçoit la CLÉ, pas un objet : c'est ce que `zone.quand` passe
    // (`barre.dataset.element`), et rien d'autre.
    async function deprogrammer(cle) {
      const [forme, id] = cle.split(':');
      if (forme !== 'tache' && forme !== 'etape') {
        signaler('Seules une tâche et une étape se déprogramment d’ici.');
        return;
      }

      const ligne = trouver(cle);
      if (!ligne) return;

      etat.message = null;
      const champs = forme === 'etape' ? { echeance: null } : { echeance: null, heure: null };
      await modifierAussitot(
        ligne,
        champs,
        () => (forme === 'etape' ? api.modifierEtape(id, champs) : api.modifierTache(id, champs)),
        { rendre: rendreTout, echouer: signaler },
      );
    }

    // Le calendrier vit de `etat.elements` : le réassembler avant de redessiner
    // est ce qui fait qu'une tâche posée quitte la colonne et apparaît dans la
    // grille du même geste.
    function rendreTout() {
      assembler();
      rendre();
    }

    // --- Glisser une barre déjà posée ---

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
          { rendre: rendreTout, echouer: signaler },
        );
      },
      // LES DEUX COLONNES DÉPROGRAMMENT, et c'est voulu qu'elles le fassent
      // toutes les deux : ce qui décide est la CHOSE qu'on lâche, pas l'endroit
      // où on la lâche. Une étape ramenée sur la colonne des tâches perd son
      // jour comme si elle était rentrée chez elle — se tromper de colonne ne
      // doit pas annuler le geste.
      { zones: [{ selecteur: '.projet-page-colonne', quand: deprogrammer }] },
    );

    // --- Glisser une tuile de la colonne vers un jour ---
    //
    // À LA SOURIS SEULEMENT. Au doigt, une liste verticale ne distingue pas un
    // glissement d'un défilement : le toucher a son chemin à lui — on choisit,
    // puis on touche le jour.
    let prise = null;

    const lacher = () => {
      prise?.ligne.classList.remove('en-deplacement');
      prise?.fantome?.remove();
      viserLeJour(section, null);
      prise = null;
    };

    section.addEventListener('pointerdown', (evenement) => {
      // `[data-poser]` et non une classe : c'est l'attribut que les deux
      // colonnes posent sur ce qui se glisse, et ELLES SEULES le posent — une
      // étape franchie et une tâche faite ne l'ont pas.
      const ligne = evenement.target.closest('[data-poser]');
      if (!ligne || evenement.pointerType === 'touch') return;
      // Le point d'une étape, le cercle d'une tâche, le menu à trois points :
      // ce sont des gestes à eux, et les saisir comme une poignée avalerait
      // leur clic au premier tremblement de main.
      if (evenement.target.closest('button:not([data-choisir])')) return;

      evenement.preventDefault();
      prise = {
        ligne,
        cle: ligne.dataset.poser,
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
        // c'est lui qui choisit la tuile.
        if (Math.hypot(evenement.clientX - prise.x, evenement.clientY - prise.y) < 5) return;
        prise.bouge = true;
        prise.ligne.classList.add('en-deplacement');
        prise.fantome = prendreEnMain(prise.ligne, evenement.clientX, evenement.clientY);
        try {
          prise.ligne.setPointerCapture(prise.pointeur);
        } catch {
          // Une capture ratée ne doit pas emporter le glissement : il marche
          // encore, il perd seulement le suivi hors de la ligne.
        }
      }

      suivreLaMain(prise.fantome, evenement.clientX, evenement.clientY);
      viserLeJour(section, jourSousLePoint(evenement.clientX, evenement.clientY));
    });

    section.addEventListener('pointerup', (evenement) => {
      if (!prise) return;

      const { ligne, cle, bouge, pointeur } = prise;
      try {
        ligne.releasePointerCapture(pointeur);
      } catch {
        // Le pointeur n'était plus à capturer : rien à relâcher.
      }
      const arrivee = jourSousLePoint(evenement.clientX, evenement.clientY);
      lacher();

      if (!bouge) return;

      // Un vrai glissement ne doit pas choisir la tuile derrière lui : on avale
      // le clic qui suit, et lui seul. Le désarmement différé est une ceinture,
      // pour que le piège ne reste pas tendu si aucun clic ne vient.
      const avaler = (clic) => {
        clic.stopPropagation();
        clic.preventDefault();
      };
      section.addEventListener('click', avaler, { capture: true, once: true });
      setTimeout(() => section.removeEventListener('click', avaler, { capture: true }), 400);

      if (arrivee) programmer(cle, arrivee);
    });

    section.addEventListener('pointercancel', lacher);

    // --- Toucher un jour ---
    //
    // UN JOUR TOUCHÉ FAIT DEUX CHOSES, jamais les deux à la fois : il POSE ce
    // qu'on a en main s'il y a quelque chose, sinon il ouvre la tuile de
    // capture sur ce jour-là. Les deux passent par le geste du calendrier —
    // c'est ce qui évite qu'un appui veuille dire une chose ici et une autre
    // là-bas, et ce qui règle un conflit autrement invisible : la sélection
    // appelle `preventDefault` au poser du doigt.
    const ouvrirLaCapture = ({ debut, fin }) => {
      etat.detail = null;
      etat.creation = { debut, fin, nature: 'tache' };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    };

    const surUnJour = ({ debut, fin }) => {
      if (etat.choisie) {
        programmer(etat.choisie, debut);
        return;
      }
      // DANS L'ANNÉE, UNE SEMAINE S'OUVRE au lieu de se remplir (2 septembre
      // 2026, demande de Noé : « quand j'appuie sur une semaine ça doit me mener
      // à sa vue semaine »). C'est la seule vue du hub où un appui n'ouvre pas
      // la tuile de capture, et c'est cohérent : on ne pose pas une chose
      // « dans une semaine », on descend d'un cran pour voir où.
      if (etat.vue === 'annee') {
        etat.vue = 'semaine';
        etat.ancre = depuisDateISO(debut);
        rendre();
        return;
      }
      ouvrirLaCapture({ debut, fin });
    };

    brancherSelection(section, surUnJour);
    poserLEntreeClavier = brancherClavier(section, (jour) =>
      surUnJour({ debut: jour, fin: jour }),
    );
    poserLEntreeClavier();

    // L'état d'une publication, par son rond ou par la pastille de sa fenêtre.
    brancherEtatPublication(section, {
      publications: () => etat.publications,
      ouverte: () => (etat.detail?.type === 'publication' ? etat.detail.source : null),
      rendre: rendreTout,
      echouer: signaler,
    });

    // --- Les clics ---

    section.addEventListener('click', async (evenement) => {
      const dans = (nom) => evenement.target.closest(`[data-${nom}]`);

      // `[data-action="reessayer"]` et non `[data-action]` : les formulaires de
      // la page en portent un aussi, et un sélecteur trop large avalerait leur
      // envoi avant qu'il n'atteigne le `submit`.
      if (evenement.target.closest('[data-action="reessayer"]')) {
        etat.echec = false;
        rendre();
        await charger();
        return;
      }

      // REFERMER LA TUILE VOLANTE EFFACE AUSSI SON ÉTAT : `app.js` retire
      // l'attribut `open`, ce qui ne suffit pas à un formulaire redessiné à
      // chaque rendu — il reviendrait ouvert au premier geste suivant.
      if (evenement.target.closest('[data-fermer-ajout]')) {
        etat.edition = null;
        rendre();
        return;
      }
      if (evenement.target.closest('.ajout-volant')) return;

      // --- Les fenêtres du calendrier ---

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        etat.creation = null;
        etat.detail = null;
        etat.editionDetail = false;
        rendre();
        return;
      }

      const nature = evenement.target.closest('[data-nature-creation]');
      if (nature) {
        // Les dates sont éditables : on garde ce qui vient d'être saisi plutôt
        // que de revenir à ce que la sélection avait posé.
        etat.creation = {
          ...etat.creation,
          debut: section.querySelector('#cal-debut')?.value || etat.creation.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creation.fin,
          nature: nature.dataset.natureCreation,
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      if (dans('ouvrir-creation')) {
        const aujourdhui = new Date().toISOString().slice(0, 10);
        ouvrirLaCapture({ debut: aujourdhui, fin: aujourdhui });
        return;
      }

      // LE ROND D'UNE BARRE SE COCHE, et il passe AVANT l'ouverture du détail :
      // le rond vit DANS la barre, qui est elle-même le bouton d'ouverture, et
      // c'est l'ordre des tests qui tranche — pas la bulle.
      const cercleBarre = evenement.target.closest('[data-cocher-tache]');
      if (cercleBarre) {
        evenement.stopPropagation();
        return basculerTache(cercleBarre.dataset.cocherTache);
      }

      const ouvrir = evenement.target.closest('[data-element]');
      if (ouvrir) {
        const [type, id] = ouvrir.dataset.element.split(':');
        etat.creation = null;
        etat.editionDetail = false;
        etat.detail = etat.elements.find(
          (element) => element.type === type && String(element.id) === id,
        );
        rendre();
        return;
      }

      if (dans('modifier-element')) {
        etat.editionDetail = true;
        rendre();
        section.querySelector('#cal-edition-titre')?.focus();
        return;
      }

      if (dans('annuler-edition')) {
        etat.editionDetail = false;
        rendre();
        return;
      }

      const supprimerElement = evenement.target.closest('[data-supprimer-element]');
      if (supprimerElement) {
        const [type, id] = supprimerElement.dataset.supprimerElement.split(':');
        if (!confirm(`Supprimer « ${etat.detail?.titre} » ?`)) return;
        supprimerElement.disabled = true;
        try {
          await effacerDepuisLeCalendrier(type, id);
          etat.detail = null;
          await charger();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerElement.disabled = false;
        }
        return;
      }

      // LE NOM D'UN MOIS, DANS L'ANNÉE : il descend d'un cran, comme une semaine
      // pressée. Même geste, un étage au-dessus.
      const zoom = dans('zoom-mois');
      if (zoom) {
        etat.vue = 'mois';
        etat.ancre = depuisDateISO(zoom.dataset.zoomMois);
        rendre();
        return;
      }

      const vue = evenement.target.closest('[data-vue-cal]');
      if (vue) {
        etat.vue = vue.dataset.vueCal;
        rendre();
        return;
      }

      const periode = evenement.target.closest('[data-periode]');
      if (periode) {
        const sens = Number(periode.dataset.periode);
        etat.ancre = sens === 0 ? new Date() : deplacerAncre(etat.ancre, etat.vue, sens);
        rendre();
        return;
      }

      // --- La colonne ---

      // Choisir, puis toucher un jour : le chemin du doigt. Un second appui sur
      // la même la repose — un choix qu'on ne peut pas défaire est un piège.
      const choix = evenement.target.closest('[data-choisir]');
      if (choix) {
        etat.choisie = etat.choisie === choix.dataset.choisir ? null : choix.dataset.choisir;
        etat.message = null;
        rendre();
        return;
      }

      // --- L'état du projet, sur sa pastille ---

      const etatChoisi = dans('etat-projet');
      if (etatChoisi) {
        const modifs = { statut: etatChoisi.dataset.etatProjet };
        await modifierAussitot(
          etat.projet,
          modifs,
          () => api.modifierProjet(etat.projet.id, modifs),
          { rendre, echouer: () => signaler("Ça n'a pas pu être enregistré — l'état est revenu.") },
        );
        return;
      }

      // Ouvrir un menu dessiné : `brancherCapture` s'en charge, et surtout il ne
      // faut RIEN redessiner ici — le rendu emporterait le panneau qui vient de
      // s'ouvrir.
      if (evenement.target.closest('[data-ouvrir-choix], .choix-panneau')) return;

      // --- Ce qui s'écrit d'un doigt ---

      const etape = dans('etape');
      if (etape) return basculerEtape(etape.dataset.etape);

      const monter = dans('monter');
      const descendre = dans('descendre');
      if (monter || descendre) {
        const [, id] = (monter ?? descendre).dataset[monter ? 'monter' : 'descendre'].split(':');
        return deplacerEtape(id, monter ? -1 : 1);
      }

      const tache = dans('tache');
      if (tache) return basculerTache(tache.dataset.tache);

      const filtre = dans('filtre-taches');
      if (filtre) {
        etat.filtreTaches = filtre.dataset.filtreTaches;
        // Ce qu'on tenait n'est peut-être plus dans la liste : le reposer vaut
        // mieux que de garder en main une chose qu'on ne voit plus.
        etat.choisie = null;
        rendre();
        return;
      }

      if (dans('rattacher-vers')) {
        etat.rattache = !etat.rattache;
        rendre();
        return;
      }

      const rattacher = dans('rattacher');
      if (rattacher) {
        const cible = etat.taches.find((ligne) => ligne.id === rattacher.dataset.rattacher);
        if (!cible) return;
        const modifs = { projet_id: etat.projet.id };
        await modifierAussitot(cible, modifs, () => api.modifierTache(cible.id, modifs), {
          rendre: rendreTout,
          echouer: () => signaler("Ça n'a pas pu être rattaché."),
        });
        return;
      }

      // --- Le menu discret ---

      const menuTouche = dans('menu');
      if (menuTouche) {
        etat.menu = etat.menu === menuTouche.dataset.menu ? null : menuTouche.dataset.menu;
        etat.confirme = null;
        rendre();
        return;
      }

      const modifier = dans('modifier');
      if (modifier) {
        const [forme, id] = modifier.dataset.modifier.split(':');
        etat.edition = { forme, id };
        etat.menu = null;
        rendre();
        return;
      }

      const supprimer = dans('supprimer');
      if (supprimer) {
        etat.confirme = supprimer.dataset.supprimer;
        rendre();
        return;
      }

      const confirmer = dans('confirmer');
      if (confirmer) return executer(confirmer.dataset.confirmer);

      if (dans('annuler-confirmation')) {
        etat.confirme = null;
        rendre();
        return;
      }

      const ajout = dans('ajout');
      if (ajout) {
        etat.edition = { forme: ajout.dataset.ajout, id: null };
        etat.menu = null;
        rendre();
        return;
      }

      // Un appui ailleurs referme ce qui traîne.
      if (etat.menu || etat.confirme) {
        etat.menu = null;
        etat.confirme = null;
        rendre();
      }
    });

    document.addEventListener('keydown', (evenement) => {
      if (evenement.key !== 'Escape') return;
      if (section.hidden) return;

      if (etat.edition) {
        etat.edition = null;
        rendre();
      } else if (etat.creation || etat.detail) {
        etat.creation = null;
        etat.detail = null;
        etat.editionDetail = false;
        rendre();
      } else if (etat.choisie) {
        etat.choisie = null;
        rendre();
      }
    });

    // --- Enregistrer ---
    //
    // Un formulaire garde sa saisie quand l'écriture échoue et a un endroit pour
    // le dire : c'est l'une des deux exceptions à l'affichage optimiste.

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      const action = formulaire.dataset.action;
      if (
        action !== 'enregistrer-projet' &&
        action !== 'creer-depuis-calendrier' &&
        action !== 'modifier-depuis-calendrier'
      ) {
        return;
      }
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        if (action === 'creer-depuis-calendrier') {
          await poserAuCalendrier(champs, { espaceParDefaut: etat.projet.espace });
        } else if (action === 'modifier-depuis-calendrier') {
          await corrigerDepuisLeCalendrier(champs);
        } else {
          await enregistrer(champs);
        }

        etat.edition = null;
        etat.creation = null;
        etat.detail = null;
        etat.editionDetail = false;
        await charger();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    async function enregistrer(champs) {
      const { forme, id } = champs;
      const projet = etat.projet;

      if (forme === 'projet') {
        const valeurs = {
          espace: champs.espace,
          nom: champs.nom.trim(),
          resultat: champs.resultat?.trim() || null,
          charge_minutes: enMinutes(champs.charge_heures),
          charge_hebdo: enMinutes(champs.charge_hebdo_heures),
          echeance: champs.echeance || null,
          statut: champs.statut,
        };
        // CE QUE LA PASTILLE A COCHÉ : une chaîne d'identifiants séparés par des
        // virgules — `FormData` ne transporte pas de tableau.
        const voulus = (champs.objectifs ?? '').split(',').filter(Boolean);
        await api.modifierProjet(id, valeurs);
        await accorderLesCibles(projet, voulus);
        return;
      }

      if (forme === 'etape') {
        const valeurs = { titre: champs.titre.trim(), echeance: champs.echeance || null };
        if (id) await api.modifierEtape(id, valeurs);
        else {
          await api.creerEtape({
            projet_id: projet.id,
            ...valeurs,
            ordre: (projet.etapes?.length ?? 0) + 1,
          });
        }
        return;
      }

      if (forme === 'tache') {
        const valeurs = {
          titre: champs.titre.trim(),
          echeance: champs.echeance || null,
          heure: champs.heure || null,
          // Une durée sans heure ne mesure rien ; une répétition sans date n'a
          // rien à répéter. Mêmes réserves que partout ailleurs dans le hub.
          duree: (champs.heure && Number(champs.duree)) || null,
          priorite: Number(champs.priorite) || 4,
          recurrence: (champs.echeance && champs.recurrence) || null,
        };
        if (id) await api.modifierTache(id, valeurs);
        else {
          await api.creerTache({
            espace: projet.espace,
            projet_id: projet.id,
            statut: 'actif',
            ...valeurs,
          });
        }
      }
    }

    // ACCORDER LES LIENS D'UN PROJET AVEC CE QUI VIENT D'ÊTRE COCHÉ. On ne
    // réécrit pas la table : on retire ce qui a été décoché, on ajoute ce qui a
    // été coché, et on laisse le reste tranquille. LES LIENS VERS UN JALON NE
    // SONT PAS TOUCHÉS — la pastille ne parle que des objectifs, et effacer ce
    // qu'un écran n'offre pas serait le pire des défauts : invisible au moment
    // où il se produit.
    async function accorderLesCibles(projet, voulus) {
      const versObjectif = (projet.cibles ?? []).filter(
        (cible) => cible.objectif_id && !cible.jalon_id,
      );

      for (const cible of versObjectif.filter((cible) => !voulus.includes(cible.objectif_id))) {
        await api.delierProjet(cible.id);
      }
      for (const objectif of voulus.filter(
        (objectif) => !versObjectif.some((cible) => cible.objectif_id === objectif),
      )) {
        await api.lierProjet(projet.id, { objectif_id: objectif });
      }
    }

    // --- Les gestes qui écrivent ---

    // Franchir une étape écrit sa victoire ; revenir dessus la retire — sinon le
    // hub garderait la trace d'un travail défait.
    async function basculerEtape(id) {
      const etape = trouver(`etape:${id}`);
      if (!etape) return;

      const avant = { ...etape };
      Object.assign(etape, {
        atteint: !etape.atteint,
        date_atteint: etape.atteint ? null : new Date().toISOString().slice(0, 10),
      });
      rendreTout();

      try {
        if (avant.atteint) {
          Object.assign(
            etape,
            await api.modifierEtape(id, { atteint: false, date_atteint: null }),
          );
          await api.supprimerVictoireDeLEtape(id);
        } else {
          const { etape: franchie } = await api.franchirEtape(avant, etat.projet.espace);
          Object.assign(etape, franchie);
        }
      } catch (souci) {
        console.error('Étape non modifiée', souci);
        Object.assign(etape, avant);
        signaler("Ça n'a pas pu être enregistré — l'étape est revenue.");
      }
    }

    // L'ORDRE SE CHANGE. `reordonnerEtapes` RENUMÉROTE la liste entière : `ordre`
    // naît de la longueur de la liste au moment où l'étape est posée, donc une
    // étape supprimée au milieu laisse un trou et deux étapes peuvent porter le
    // même numéro — un échange de deux valeurs jumelles ne changerait rien.
    //
    // L'écran d'abord, l'écriture derrière — et la liste reprend son ordre
    // d'avant si ça n'a pas pu s'enregistrer, sans quoi l'affichage optimiste
    // serait un mensonge.
    async function deplacerEtape(id, pas) {
      const liste = etat.projet?.etapes;
      if (!liste) return;

      // ON DÉPLACE DANS L'ORDRE AFFICHÉ, pas dans celui du tableau : depuis que
      // la date range la frise, les deux ne coïncident plus, et « Monter » aurait
      // échangé l'étape avec une voisine que Noé ne voit pas à côté d'elle.
      const rangees = rangerParEcheance(liste);
      const rang = rangees.findIndex((etape) => etape.id === id);
      const vers = rang + pas;
      if (rang === -1 || vers < 0 || vers >= rangees.length) return;

      // Sur place, jamais par remplacement : c'est le tableau que tout le monde
      // regarde, et un retour en arrière écrirait dans un tableau orphelin.
      const avant = [...liste];
      rangees.splice(vers, 0, ...rangees.splice(rang, 1));
      // Le tableau prend l'ordre affiché : c'est lui que `reordonnerEtapes`
      // renumérote, si bien qu'`ordre` finit par dire ce que l'écran montre.
      liste.splice(0, liste.length, ...rangees);
      rendre();

      try {
        await api.reordonnerEtapes(liste);
      } catch (souci) {
        console.error('Ordre non enregistré', souci);
        liste.splice(0, liste.length, ...avant);
        signaler("Ça n'a pas pu être enregistré — l'ordre des étapes est revenu.");
      }
    }

    // Cocher est une intention, pas un fait acquis : la fenêtre demande combien
    // de temps ça a pris, et rien n'est écrit tant qu'on n'a pas confirmé.
    function basculerTache(id) {
      const tache = etat.taches.find((ligne) => ligne.id === id);
      if (!tache) return;

      if (tache.statut === 'fait') return terminerTache(tache, false, null);
      demanderLaDuree(tache, (minutes) => terminerTache(tache, true, minutes));
    }

    async function terminerTache(tache, versFait, minutes) {
      const avant = { ...tache };
      Object.assign(tache, {
        statut: versFait ? 'fait' : 'actif',
        date_fait: versFait ? new Date().toISOString() : null,
        duree: minutes ?? tache.duree,
      });
      rendreTout();

      try {
        if (versFait) {
          if (minutes !== null) await api.modifierTache(tache.id, { duree: minutes });
          const { tache: faite } = await api.terminerTache(avant);
          Object.assign(tache, faite);
        } else {
          Object.assign(tache, await api.rouvrirTache(avant));
          await api.supprimerVictoireDeLaTache(tache.id);
        }
      } catch (souci) {
        console.error('Tâche non mise à jour', souci);
        Object.assign(tache, avant);
        signaler("Ça n'a pas pu être enregistré — la tâche est revenue.");
      }
    }

    // Ce qui est irréversible passe par ici, et seulement après confirmation.
    async function executer(cle) {
      const [forme, id] = cle.split(':');
      etat.menu = null;
      etat.confirme = null;

      if (forme === 'projet') {
        // Supprimer un projet ne supprime rien d'autre : ses tâches perdent leur
        // rattachement et restent à faire. On quitte la page — elle n'a plus de
        // sujet.
        try {
          await api.supprimerProjet(id);
          location.hash = '#objectifs/projets';
        } catch (souci) {
          console.error('Projet non supprimé', souci);
          signaler("Ça n'a pas pu être supprimé.");
        }
        return;
      }

      if (forme === 'etape') {
        const etape = trouver(cle);
        if (!etape) return;
        return retirerAussitot(etat.projet.etapes, etape, () => api.supprimerEtape(id), {
          rendre: rendreTout,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

      if (forme === 'tache') {
        const tache = trouver(cle);
        if (!tache) return;
        return retirerAussitot(etat.taches, tache, () => api.supprimerTache(id), {
          rendre: rendreTout,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }
    }
  },
};
