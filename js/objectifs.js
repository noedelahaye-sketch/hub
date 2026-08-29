// L'espace « Le cap » — la galerie des objectifs, et le seul endroit du hub où
// le cap se règle.
//
// Il remplace la page Objectifs empilée (27 août 2026, demande de Noé, après un
// échantillon monté sur deux caps réels et validé — l'échantillon a été retiré
// une fois généralisé : deux copies de la même forme finissent par diverger, et
// git garde la trace. L'adresse n'a pas bougé, `#objectifs`, parce qu'un favori
// se casse et pas un nom.
//
// Ce que la forme défend, en quatre décisions :
//
// 1. LA GALERIE NE DIT QUE CE QUI SE COMPARE. Un cap, dans la grille, c'est son
//    espace, son titre, son avancée en jalons et sa date. Le pourquoi, la
//    cible, les projets, les tâches n'existent qu'une fois qu'on est entré.
//    L'écran d'avant montrait tout, tout le temps, sur une seule colonne :
//    c'est ce qui le rendait illisible, pas le nombre d'objectifs.
//
// 2. ON N'OUVRE PAS UNE AUTRE PAGE. La tuile pressée prend toute la largeur et
//    se déplie sur place — le geste que le hub fait déjà quand un jour de
//    « Ta semaine » s'ouvre en grand. On referme par le même appui.
//
// 3. LES SÉRIES SE REPLIENT. « Programmation de la semaine » porte quinze fois
//    « Visuels de la semaine » : quinze lignes identiques, c'est le mur que
//    l'espace Tâches a déjà appris à ne pas dresser. Une ligne par série, son
//    rythme, ce qui reste, et la prochaine date.
//
// 4. AJOUTER ET MODIFIER OUVRENT LA TUILE VOLANTE, AVEC TOUS LES DÉTAILS
//    (demande de Noé) : « à l'œil ça doit paraître simple, mais si je fais la
//    démarche d'ajouter ou de modifier, je dois avoir accès à tous les
//    détails ». C'est la page qui cache le plus ; la tuile est la porte qui
//    donne accès à ce qu'elle cache.
//
// Les PÉRIODES FERMENT la page, en DEUX LIGNES et en encre discrète (28 août
// 2026, demande de Noé). Elles ouvraient l'écran ; elles le cadrent mieux d'en
// bas — comme « Le cap » du tableau de bord, passé sous la journée le 13 août
// pour la même raison : on relit ce qui cadre quand on lève la tête, pas en
// ouvrant l'application. Et elles ne préviennent de rien : voir `tuilePeriode`.

import * as api from './api.js';
// `tensionDeLaPeriode` n'est plus appelée ici : le hub ne prévient plus d'un
// dépassement voulu (28 août 2026). Elle reste entière dans orientation.js —
// c'est la règle du jeu, et le diagnostic s'en sert.
import {
  REGIMES,
  chargeViseeDeLaPeriode,
  periodeDuJour,
  avanceeDuProjet,
  mouvementDuProjet,
} from './orientation.js';
import { construireFormulaire, brancherChoix, demanderLaDuree } from './gabarits.js';
import { modifierAussitot, retirerAussitot } from './ecriture.js';
// Le modèle de l'argent de Yuno vit avec la page qui l'a fait naître ; il
// n'est pas recopié ici.
import { argentDeYuno, enEuros } from './photo.js';
import {
  NOMS_ESPACES,
  RECURRENCES,
  echapper,
  dureeLisible,
  echeanceLisible,
  depuisDateISO,
} from './format.js';

// L'ORDRE DES ESPACES, et il n'est pas alphabétique : le club, la formation,
// Yuno (demande de Noé, 28 août 2026). C'est l'ordre de ses journées — le FCH
// occupe ses heures ouvrées, la formation ce qui reste, Yuno le bonus. Une
// seule liste le porte : elle range les tuiles, les choix du formulaire et les
// régimes d'une période, et il n'y a donc rien à tenir d'accord.
//
// L'espace perso n'y est pas : il n'a pas d'objectifs, il a des INTENTIONS,
// sans mesure ni date, et elles se relisent dans #perso.
const ESPACES = ['fch', 'formation', 'photo'];

const NOMS_REGIMES = Object.fromEntries(
  Object.entries(REGIMES).map(([cle, { libelle }]) => [cle, libelle]),
);

// L'ÉTAT D'UN PROJET, en trois mots (demande de Noé, 28 août 2026) : pas
// commencé, en cours, terminé. Ce sont les trois seuls qu'on offre — la base en
// accepte cinq, et elle continue : un CHECK s'élargit, il ne se resserre jamais
// (c'est déjà la règle du format `post` d'une publication). `en_pause` et
// `abandonne` se lisent donc toujours si une ligne en porte un ; rien ne les
// écrit plus.
const ETATS_PROJET = {
  actif: 'En cours',
  // « À l'année » est un SECOND ÉTAT D'EN COURS (28 août 2026, demande de Noé).
  // Certains projets ne finissent pas — « Programmation de la semaine »,
  // « Anniversaires du mois » sont des rythmes, pas des chantiers, et la table
  // le savait déjà : ils portent une charge hebdomadaire et non un total. Il
  // leur manquait le mot. Chercher ce qui est en cours les prend donc tous les
  // deux : même rang au tri, même bleu, seul le mot change.
  annuel: "À l'année",
  idee: 'Pas commencé',
  termine: 'Terminé',
};

const ETATS_PROJET_LUS = {
  ...ETATS_PROJET,
  en_pause: 'En pause',
  abandonne: 'Abandonné',
};

// L'ordre de lecture : ce qui vit d'abord, ce qui attend ensuite, ce qui est
// fini à la fin. Un projet terminé ne disparaît pas — le hub montre ce qui est
// accompli —, il descend.
const RANG_ETAT = { actif: 0, annuel: 0, idee: 1, en_pause: 2, termine: 3, abandonne: 4 };

// L'ordre de FABRICATION, qui n'est pas celui de lecture : on n'a pas commencé,
// puis on est en cours, puis c'est fini.
const CYCLE_ETAT = ['idee', 'actif', 'annuel', 'termine'];

// LEURS TROIS COULEURS (demande de Noé, 28 août 2026) : gris, bleu, vert.
//
// Pas le rouge → ambre → vert de la pastille d'une publication, essayé d'abord
// et écarté : une publication traverse un cycle de FABRICATION, où le rouge dit
// « rien n'est encore fait » ; un projet pas commencé n'est pas en défaut, il
// attend son tour. Le gris le dit sans rien reprocher — et c'est aussi ce qui
// fait ressortir le vert quand c'est fini.
//
// Le bleu est pris plus saturé que celui du club (#7ba5dc) pour qu'on ne
// confonde pas, sur une tuile du FCH, la pastille de l'espace et le point de
// l'état — deux ronds de sept pixels sur la même ligne.
const COULEURS_ETAT = {
  idee: 'var(--texte-discret)',
  actif: 'hsl(222 75% 68%)',
  // Le MÊME bleu qu'« en cours », et c'est tout le propos : ce sont deux façons
  // d'être en cours. Si la couleur les séparait, l'œil en ferait deux familles.
  annuel: 'hsl(222 75% 68%)',
  termine: 'hsl(145 55% 55%)',
};

// L'ÉTAT SE LIT ET SE CHANGE SUR LA TUILE (demande de Noé, 28 août 2026), sans
// ouvrir la fenêtre de modification : c'est le réglage qu'on touche le plus
// souvent, et le seul qui ne demande aucune saisie.
//
// À CÔTÉ DU NOM DE L'ESPACE, ET TRÈS DISCRET : un point de couleur et un mot en
// encre grise, pas l'étiquette pleine de la pastille d'une publication — douze
// tuiles portant chacune un aplat ambre, c'était douze fois plus de couleur que
// de titres. Le point garde la teinte (rouge, ambre, vert), et elle suffit : on
// balaie la galerie et on voit où en est chaque projet sans lire un mot.
//
// Sa place a coûté deux essais : dans le pied d'abord, en haut à droite
// ensuite, et enfin ici — sur la ligne de service, contre l'espace. Les deux
// signes qui CLASSENT un projet se lisent donc d'un même regard, et le titre
// garde sa ligne pour lui seul.
//
// Le menu qui s'ouvre dessous, lui, reste celui de tout le hub.
function pastilleEtat(projet) {
  const courant = projet.statut ?? 'actif';
  const nom = (etat) => echapper(ETATS_PROJET_LUS[etat] ?? etat);
  const couleur = (etat) => COULEURS_ETAT[etat] ?? 'var(--texte-discret)';

  return `
    <span class="choix-champ cap-etat" data-choix-champ="etat-${echapper(projet.id)}">
      <button type="button" class="cap-etat-mot" data-ouvrir-choix
        style="--etat: ${couleur(courant)};" aria-expanded="false" aria-haspopup="listbox"
        aria-label="État : ${nom(courant)} — changer"><span class="cap-etat-point"
        aria-hidden="true"></span>${nom(courant)}</button>
      <div class="choix-panneau" hidden>
        <ul class="choix-capture">
          ${CYCLE_ETAT.map(
            (etat) => `
            <li><button type="button" data-etat-projet="${echapper(etat)}"
              data-projet="${echapper(projet.id)}"
              class="${etat === courant ? 'actif' : ''}"
              aria-pressed="${etat === courant}"><span class="cap-etat-point"
                style="--etat: ${couleur(etat)};" aria-hidden="true"></span>${nom(
                  etat,
                )}</button></li>`,
          ).join('')}
        </ul>
      </div>
    </span>`;
}

const PRIORITES = { 1: 'Priorité 1', 2: 'Priorité 2', 3: 'Priorité 3', 4: 'Priorité 4' };

// L'objectif dont les prestations et le matériel disent la mesure. Reconnu par
// son titre, comme sur la page Yuno : c'est le seul lien entre une ligne
// d'objectif et une mécanique, et l'inscrire en dur vaut mieux qu'une colonne
// « type » que rien d'autre n'utiliserait.
const OBJECTIF_MATERIEL = 'Rembourser mon matériel';

// --- Les signes ---------------------------------------------------------------
// Dessinés, jamais des caractères : ils gardent leur épaisseur quelle que soit
// la police, et ils suivent le trait du reste du hub.

const SIGNE = {
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  points: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"
    aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/>
    <circle cx="19" cy="12" r="1.6"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6"/></svg>`,
  repetition: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
    <path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
};

// --- Les mots -----------------------------------------------------------------

function jourLisible(iso) {
  return iso ? echeanceLisible(depuisDateISO(iso)) : '';
}

// `date_fait` est un timestamptz, `jourLisible` attend une date nue : sans cette
// coupe, « 2026-08-27T09:12:44+00:00 » ne se lit pas comme un jour.
function jourDuFait(tache) {
  return tache?.date_fait ? String(tache.date_fait).slice(0, 10) : null;
}

function heuresLisibles(minutes) {
  const heures = minutes / 60;
  // Virgule et non point : on écrit « 39,5 h » en français, et le point se
  // lisait comme une ponctuation au milieu du chiffre.
  const dit = Number.isInteger(heures) ? String(heures) : heures.toFixed(1).replace('.', ',');
  return `${dit} h`;
}

function chargeDuProjet(projet) {
  if (projet.charge_hebdo) return `${dureeLisible(projet.charge_hebdo)} par semaine`;
  if (projet.charge_minutes) return `${dureeLisible(projet.charge_minutes)} en tout`;
  return '';
}

function pluriel(nombre, singulier, plurielMot = `${singulier}s`) {
  return `${nombre} ${nombre > 1 ? plurielMot : singulier}`;
}

// Les heures se saisissent en heures — c'est ainsi qu'on pense un projet — et
// se rangent en minutes : c'est l'unité de `taches.duree` et des événements, et
// deux unités dans une même somme finissent toujours par se croiser.
function enMinutes(valeur) {
  const heures = Number(valeur);
  return Number.isFinite(heures) && heures > 0 ? Math.round(heures * 60) : null;
}

// --- L'état -------------------------------------------------------------------

const etat = {
  // La vue demandée par l'adresse : `null` = les trois étages, sinon un seul
  // (28 août 2026). Le menu offre « Objectifs », « Projets » et « Périodes »
  // comme trois entrées — sans ce découpage elles mèneraient au même écran, et
  // trois liens identiques ne sont pas un menu.
  vue: null,
  // L'espace demandé par l'adresse — `#objectifs/projets/fch` (28 août 2026).
  // C'est ainsi que le menu offre « ses objectifs » et « ses projets » sans
  // qu'aucun écran de plus existe : la même page, son filtre déjà posé.
  espaceFiltre: null,
  objectifs: [],
  projets: [],
  taches: [],
  periodes: [],
  commandes: [],
  materiel: [],
  faites: null, // le projet dont on relit les tâches faites
  ouvert: null, // le cap déplié
  projetOuvert: null, // le projet déplié, dans le cap ouvert
  projetGalerie: null, // le projet déplié, dans la galerie des projets
  menu: null, // `${forme}:${id}` — le menu discret ouvert
  confirme: null, // la suppression (ou l'atteinte) en attente de confirmation
  edition: null, // { forme, id, parent } — ce que la tuile volante corrige
  message: null,
};

// --- Le menu discret ----------------------------------------------------------
// Trois points qui ne se voient qu'au survol et au clavier, mais qui gardent
// leurs 44 px de cible au doigt. Ce qui est irréversible demande confirmation
// SUR PLACE — pas de fenêtre pour ça : deux appuis suffisent, et un objectif
// qui emporte ses jalons mérite le second.

function menuDiscret(forme, id, { atteindre = false, sansModifier = false, deplacer = null } = {}) {
  const cle = `${forme}:${id}`;
  const confirmation = etat.confirme === cle;
  const attendrait = etat.confirme === `atteindre:${id}`;

  // MONTER ET DESCENDRE, pour ce qui vit dans un ordre (29 août 2026, demande
  // de Noé sur les étapes d'un projet). Deux entrées et non un glisser-déposer :
  // le geste se fait au doigt comme à la souris, il s'atteint au clavier sans
  // rien réinventer, et réordonner trois étapes est un geste rare — on le fait
  // au moment où on pose le découpage, pas tous les jours.
  //
  // Les extrémités n'affichent pas l'entrée qui ne mène nulle part : une
  // commande grisée est un bouton qui ment.
  const rangs = deplacer
    ? `${
        deplacer.haut ? `<button type="button" data-monter="${cle}">Monter</button>` : ''
      }${deplacer.bas ? `<button type="button" data-descendre="${cle}">Descendre</button>` : ''}`
    : '';

  const choix = confirmation
    ? `<button type="button" class="cap-menu-danger" data-confirmer="${cle}">Supprimer vraiment</button>
       <button type="button" data-annuler-confirmation>Annuler</button>`
    : attendrait
      ? `<button type="button" data-confirmer="atteindre:${id}">C'est atteint</button>
         <button type="button" data-annuler-confirmation>Pas encore</button>`
      : `${sansModifier ? '' : `<button type="button" data-modifier="${cle}">Modifier</button>`}
         ${rangs}
         ${
           atteindre
             ? `<button type="button" data-atteindre="${id}">Marquer atteint</button>`
             : ''
         }
         <button type="button" data-supprimer="${cle}">Supprimer</button>`;

  return `
    <span class="cap-menu${etat.menu === cle ? ' ouvert' : ''}">
      <button type="button" class="cap-menu-bouton" data-menu="${cle}"
        aria-expanded="${etat.menu === cle}" aria-label="Modifier ou supprimer">${
        SIGNE.points
      }</button>
      <span class="cap-menu-choix" ${etat.menu === cle ? '' : 'hidden'}>${choix}</span>
    </span>`;
}

// --- Les périodes -------------------------------------------------------------

// UNE PÉRIODE TIENT EN DEUX LIGNES (demande de Noé, 28 août 2026) : son nom et
// son intervalle, puis ce qu'elle attend. Rien d'autre.
//
// ET AUCUN MESSAGE DE PRÉVENTION. Le hub disait « 41 h pour 35 h — qu'est-ce
// qui cède ? » ; Noé a tranché : « ça ne me sert à rien, c'est LE BUT d'une
// période d'intensité, j'en fais plus que d'habitude ». Un dépassement voulu
// n'est pas un déséquilibre à signaler, et un outil qui prévient de ce qu'on a
// décidé exprès finit par se faire ignorer.
//
// Le calcul, lui, reste entier dans `tensionDeLaPeriode` (js/orientation.js) :
// c'est la règle du jeu de l'orientation, éprouvable hors écran, et le
// diagnostic s'en sert. Ce qui a disparu, c'est le REPROCHE, pas la mesure.
//
// La ligne entière ouvre la tuile de modification — « je dois juste pouvoir
// modifier la période en cliquant quelque part ». Le menu à trois points ne
// garde que la suppression.
function tuilePeriode(periode, courante) {
  const visees = chargeViseeDeLaPeriode(periode);
  const attendus = ESPACES.filter((espace) => periode.regimes?.[espace])
    .map(
      (espace) => `<span data-espace="${espace}">${echapper(NOMS_ESPACES[espace] ?? espace)}
        ${echapper((NOMS_REGIMES[periode.regimes[espace]] ?? '').toLowerCase())}</span>`,
    )
    .join('');

  return `
    <article class="cap-periode${periode.id === courante?.id ? ' courante' : ''}"
      data-periode="${echapper(periode.id)}">
      <button type="button" class="cap-periode-ouvrir" data-modifier="periode:${echapper(
        periode.id,
      )}">
        <span class="cap-periode-tete">
          <span class="cap-periode-nom">${echapper(periode.nom)}</span>
          <span class="chiffre cap-periode-quand">${echapper(periode.debut)} → ${echapper(
            periode.fin,
          )}</span>
        </span>
        <span class="cap-periode-attendu">${attendus}<span class="cap-periode-charge">club ${echapper(heuresLisibles(visees.fch))} · formation ${echapper(heuresLisibles(visees.formation))}</span></span>
      </button>
      ${menuDiscret('periode', periode.id, { sansModifier: true })}
    </article>`;
}

function bandePeriodes(seule = false) {
  const courante = periodeDuJour(etat.periodes, new Date());
  const tuiles = etat.periodes.map((periode) => tuilePeriode(periode, courante)).join('');

  return `
    <section class="cap-bande">
      ${seule ? '' : '<h2 class="cap-etage-titre">Ce que tu attends des mois qui viennent</h2>'}
      <div class="cap-periodes">
        ${tuiles}
        <button type="button" class="cap-tuile-ajout cap-periode-ajout"
          data-ajout="periode:rien">${SIGNE.plus}<span>Déclarer une période</span></button>
      </div>
      ${
        etat.periodes.length
          ? ''
          : `<p class="cap-vide">Aucune période déclarée. La première dira ce que tu
             attends du mois qui vient — et le hub posera sa question tout de suite,
             pendant qu'une réponse coûte encore peu.</p>`
      }
    </section>`;
}

// --- La galerie des caps ------------------------------------------------------

// L'avancée d'un cap : un segment par jalon, pleins jusqu'à celui qu'on tient.
// Pas de pourcentage — un cap ne se lit pas en chiffres, il se lit en marches
// franchies. Et pas de barre continue : quatre jalons font quatre segments, on
// compte du regard sans lire.
function marches(jalons = []) {
  if (!jalons.length) return '<span class="cap-marches cap-marches-vide"></span>';
  const atteints = jalons.filter((jalon) => jalon.atteint).length;
  return `<span class="cap-marches" role="img"
    aria-label="${atteints} jalon(s) atteint(s) sur ${jalons.length}">${jalons
    .map((jalon) => `<span class="cap-marche${jalon.atteint ? ' atteint' : ''}"></span>`)
    .join('')}</span>`;
}

function projetsDuCap(objectif) {
  return etat.projets.filter((projet) =>
    (projet.cibles ?? []).some((cible) => cible.objectif_id === objectif.id),
  );
}

function tachesDuProjet(projet) {
  return etat.taches.filter((tache) => tache.projet_id === projet.id);
}

// Les tâches rattachées au cap lui-même, sans passer par un projet. Le cas
// ordinaire aujourd'hui, et il doit rester lisible — sinon on force un projet
// pour une seule action.
function tachesDuCap(objectif) {
  return etat.taches.filter(
    (tache) => tache.objectif_id === objectif.id && !tache.projet_id,
  );
}

function comptesDuCap(objectif) {
  const projets = projetsDuCap(objectif);
  const taches =
    tachesDuCap(objectif).length +
    projets.reduce((total, projet) => total + tachesDuProjet(projet).length, 0);

  const morceaux = [];
  if (projets.length) morceaux.push(pluriel(projets.length, 'projet'));
  if (taches) morceaux.push(pluriel(taches, 'tâche'));
  // Un cap que rien ne sert le dit lui-même : c'est l'information la plus utile
  // de la tuile, et la seule qui appelle un geste.
  return morceaux.length ? morceaux.join(' · ') : 'Rien ne le sert encore';
}

function tuileObjectif(objectif) {
  return `
    <article class="cap-tuile" data-espace="${objectif.espace}"
      data-objectif="${echapper(objectif.id)}">
      <button type="button" class="cap-tuile-ouvrir" data-ouvrir="${echapper(objectif.id)}">
        <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(
          NOMS_ESPACES[objectif.espace] ?? objectif.espace,
        )}</span>
        <h3 class="cap-tuile-titre">${echapper(objectif.titre)}</h3>
        ${marches(objectif.jalons)}
        <span class="cap-tuile-pied">
          <span>${echapper(comptesDuCap(objectif))}</span>
          <span class="cap-tuile-date">${echapper(jourLisible(objectif.echeance))}</span>
        </span>
      </button>
      ${menuDiscret('objectif', objectif.id, { atteindre: true })}
    </article>`;
}

// --- Le détail d'un cap -------------------------------------------------------

function frise(objectif) {
  const jalons = objectif.jalons ?? [];
  const prochain = jalons.find((jalon) => !jalon.atteint);

  const lignes = jalons
    .map(
      (jalon, rang) => `
      <li class="cap-jalon${jalon.atteint ? ' atteint' : ''}${
        jalon === prochain ? ' prochain' : ''
      }">
        <button type="button" class="cap-jalon-point" data-jalon="${echapper(jalon.id)}"
          aria-pressed="${Boolean(jalon.atteint)}"
          aria-label="${
            jalon.atteint ? 'Revenir sur ce jalon' : 'Marquer ce jalon atteint'
          }"></button>
        <span class="cap-jalon-corps">
          <span class="cap-jalon-titre">${echapper(jalon.titre)}</span>
          ${
            jalon.echeance
              ? `<span class="cap-jalon-date">${echapper(jourLisible(jalon.echeance))}</span>`
              : ''
          }
        </span>
        ${menuDiscret('jalon', jalon.id, {
          deplacer: { haut: rang > 0, bas: rang < jalons.length - 1 },
        })}
      </li>`,
    )
    .join('');

  return `
    ${jalons.length ? `<ol class="cap-frise">${lignes}</ol>` : ''}
    <button type="button" class="cap-ajout-discret" data-ajout="jalon:${echapper(objectif.id)}">
      ${SIGNE.plus}<span>Poser un jalon</span></button>`;
}

// Une série ne s'écrit qu'une fois. Quinze « Visuels de la semaine » alignés,
// c'est le mur que l'espace Tâches a appris à ne pas dresser : on montre la
// prochaine, son rythme, et combien il en reste.
// Le tri d'une liste par série : ce qui n'en a pas d'un côté, un groupe par
// série de l'autre. Les deux moitiés d'un projet — ce qui reste et ce qui est
// fait — s'y prennent de la même façon, et c'est pour ça que ça vit à part :
// deux copies auraient fini par replier les séries d'un côté seulement.
function parSeries(taches) {
  const groupes = new Map();
  const seules = [];
  for (const tache of taches) {
    if (!tache.serie_id) {
      seules.push(tache);
      continue;
    }
    const groupe = groupes.get(tache.serie_id) ?? [];
    groupe.push(tache);
    groupes.set(tache.serie_id, groupe);
  }
  return { groupes, seules };
}

function grouperLesTaches(taches) {
  const restantes = taches.filter((tache) => tache.statut !== 'fait');
  const terminees = taches.filter((tache) => tache.statut === 'fait');
  const faites = terminees.length;

  const { groupes: parSerie, seules } = parSeries(restantes);

  const lignes = seules.map((tache) => ({ tache, serie: null }));
  for (const groupe of parSerie.values()) {
    const triees = [...groupe].sort((a, b) =>
      String(a.echeance ?? '').localeCompare(String(b.echeance ?? '')),
    );
    lignes.push({
      tache: triees[0],
      serie: { restantes: triees.length, prochaine: triees[0].echeance },
    });
  }

  lignes.sort((a, b) =>
    String(a.tache.echeance ?? '9999').localeCompare(String(b.tache.echeance ?? '9999')),
  );

  // CE QUI EST FAIT SE LIT AUSSI (29 août 2026, demande de Noé : « dans le
  // détail du projet, je dois pouvoir voir les tâches faites »). Le compte seul
  // — « 3 faites. » — disait qu'il s'était passé quelque chose sans jamais dire
  // quoi, dans un hub dont la première règle est d'être un miroir de ce qui a
  // été accompli.
  //
  // LE PLUS RÉCENT D'ABORD, à l'inverse de ce qui reste : ce qui reste se lit
  // par ce qui arrive, ce qui est fait se relit par ce qu'on vient de finir.
  // Et les séries s'y replient pareil — douze « Visuels de la semaine » faits
  // dresseraient le mur que l'espace Tâches a appris à ne pas dresser.
  const { groupes: faitesParSerie, seules: faitesSeules } = parSeries(terminees);
  const quand = (tache) => String(tache.date_fait ?? '');

  const lignesFaites = faitesSeules.map((tache) => ({ tache, serie: null }));
  for (const groupe of faitesParSerie.values()) {
    const triees = [...groupe].sort((a, b) => quand(b).localeCompare(quand(a)));
    lignesFaites.push({
      tache: triees[0],
      serie: { faites: triees.length, derniere: triees[0].date_fait },
    });
  }
  lignesFaites.sort((a, b) => quand(b.tache).localeCompare(quand(a.tache)));

  return { lignes, faites, lignesFaites };
}

// LE COMPTE DEVIENT UNE PORTE (29 août 2026, demande de Noé). Il reste un
// compte au repos — « 3 faites » — et se déplie sur la liste : les tâches faites
// sont ce que le hub est censé montrer en premier, mais un projet de quinze
// tâches terminées ne doit pas repousser ce qui reste hors de l'écran.
//
// Les lignes dépliées sont les MÊMES que celles d'en haut : leur cercle se
// décoche, leur menu supprime. Rouvrir une tâche depuis là où on la relit est
// le geste attendu, et il n'a rien coûté à brancher — `ligneTache` le portait
// déjà.
function blocDesFaites(projet, faites, lignesFaites) {
  if (!faites) return '';
  const ouvert = etat.faites === projet.id;

  return `
    <button type="button" class="cap-taches-faites" data-faites="${echapper(projet.id)}"
      aria-expanded="${ouvert}">
      <span class="cap-faites-chevron${ouvert ? ' ouvert' : ''}">${SIGNE.chevron}</span>
      <span>${echapper(pluriel(faites, 'faite'))}</span>
    </button>
    ${
      ouvert
        ? `<ul class="cap-taches cap-taches-terminees">${lignesFaites
            .map(ligneTache)
            .join('')}</ul>`
        : ''
    }`;
}

function ligneTache({ tache, serie }) {
  // Une série repliée ne dit pas la même chose selon le côté où elle tombe :
  // devant soi on compte ce qui reste, derrière soi ce qui a été fait. Le même
  // mot pour les deux aurait fait lire « 12 fois à venir » sous un titre barré.
  const repetition = (mot, date) =>
    `<span class="cap-tache-serie">${SIGNE.repetition}${echapper(
      (RECURRENCES[tache.recurrence] ?? 'Se répète').toLowerCase(),
    )} · ${echapper(mot)}</span>
     <span class="cap-tache-date">${echapper(jourLisible(date))}</span>`;

  const service = !serie
    ? `<span class="cap-tache-date">${echapper(
        jourLisible(tache.statut === 'fait' ? jourDuFait(tache) : tache.echeance),
      )}</span>`
    : serie.faites !== undefined
      ? repetition(`${serie.faites} fois faites`, jourDuFait({ date_fait: serie.derniere }))
      : repetition(`${serie.restantes} fois à venir`, serie.prochaine);

  return `
    <li class="cap-tache tache-ligne${tache.statut === 'fait' ? ' tache-faite' : ''}"
      data-priorite="${tache.priorite ?? 4}">
      <button type="button" class="tache-cercle" data-tache="${echapper(tache.id)}"
        aria-pressed="${tache.statut === 'fait'}" aria-label="Terminer"></button>
      <span class="cap-tache-corps">
        <span class="cap-tache-titre tache-titre">${echapper(tache.titre)}</span>
        <span class="cap-tache-service">${service}</span>
      </span>
      ${menuDiscret('tache', tache.id)}
    </li>`;
}

function tuileProjet(projet) {
  const ouvert = etat.projetOuvert === projet.id;
  const taches = tachesDuProjet(projet);
  const { lignes, faites, lignesFaites } = grouperLesTaches(taches);
  const charge = chargeDuProjet(projet);

  // Les orphelines de son espace se rattachent d'un bouton : c'est la seule
  // façon raisonnable de rattraper les dizaines de tâches écrites avant qu'il
  // existe un étage projet.
  const orphelines = etat.taches.filter(
    (tache) => tache.espace === projet.espace && !tache.projet_id && tache.statut !== 'fait',
  );

  return `
    <article class="cap-projet${ouvert ? ' ouvert' : ''}" data-projet="${echapper(projet.id)}">
      <button type="button" class="cap-projet-ouvrir" data-ouvrir-projet="${echapper(projet.id)}"
        aria-expanded="${ouvert}">
        <span class="cap-projet-chevron">${SIGNE.chevron}</span>
        <span class="cap-projet-corps">
          <span class="cap-projet-nom">${echapper(projet.nom)}</span>
          ${
            projet.resultat
              ? `<span class="cap-projet-resultat">${echapper(projet.resultat)}</span>`
              : ''
          }
          <span class="cap-projet-pied">
            <span>${
              taches.length ? echapper(pluriel(taches.length, 'tâche')) : 'Aucune tâche'
            }</span>
            ${charge ? `<span class="cap-projet-charge">${echapper(charge)}</span>` : ''}
            ${
              projet.echeance
                ? `<span class="cap-projet-charge">${echapper(jourLisible(projet.echeance))}</span>`
                : ''
            }
            ${
              projet.statut && projet.statut !== 'actif'
                ? `<span class="cap-projet-charge">${echapper(
                    ETATS_PROJET_LUS[projet.statut] ?? projet.statut,
                  )}</span>`
                : ''
            }
          </span>
        </span>
      </button>
      ${menuDiscret('projet', projet.id)}
      <div class="cap-projet-taches">
        <div class="cap-projet-taches-dedans">
          <ul class="cap-taches">${lignes.map(ligneTache).join('')}</ul>
          ${blocDesFaites(projet, faites, lignesFaites)}
          <span class="cap-projet-gestes">
            <button type="button" class="cap-ajout-discret"
              data-ajout="tache:${echapper(projet.id)}">
              ${SIGNE.plus}<span>Ajouter une tâche</span></button>
            ${
              orphelines.length
                ? `<button type="button" class="cap-ajout-discret"
                     data-rattacher-vers="${echapper(projet.id)}">
                     <span>Rattacher une tâche</span>
                     <span class="chiffre">${orphelines.length}</span></button>`
                : ''
            }
          </span>
          ${
            etat.rattache === projet.id
              ? `<ul class="cap-orphelines">${orphelines
                  .map(
                    (tache) => `
                  <li>
                    <span>${echapper(tache.titre)}</span>
                    <button type="button" class="lien-discret bouton-mini"
                      data-rattacher="${echapper(tache.id)}"
                      data-vers="${echapper(projet.id)}">Rattacher</button>
                  </li>`,
                  )
                  .join('')}</ul>`
              : ''
          }
        </div>
      </div>
    </article>`;
}

// --- La galerie des projets ---------------------------------------------------
//
// LA MÊME FORME QUE LES CAPS, un étage plus bas (demande de Noé, 28 août 2026).
// Un projet se compare à un projet comme un cap se compare à un cap : son
// espace, son nom, son avancée, ce qu'il porte. Et on y entre du même geste.
//
// Ce que cette galerie montre et que le dépliage d'un cap ne montrait PAS : les
// projets qui ne servent aucun cap. Ils existent — « Album du club », « Suivi
// de l'alternance » — et ils étaient invisibles, donc oubliés.
//
// L'AVANCÉE SE LIT DANS LA FORME DE SA JAUGE (29 août 2026, décision de Noé).
// Trois mesures, trois dessins, et le dessin dit lequel des trois on regarde :
//
//   des MARCHES    ses étapes déclarées — comme les jalons d'un cap, et pour la
//                  même raison : ça se franchit, ça se compte du regard
//   une BARRE      sa charge — des heures se remplissent, elles ne se franchissent
//                  pas ; une barre continue est le bon signe pour ça
//   un POINTILLÉ   il n'a rien déclaré, donc le hub ne mesure rien et le dit
//
// Ce qui a disparu : la proportion de tâches faites. Elle mentait dans les deux
// sens — « Deuxième dossier » affichait 100 % (3 tâches sur 3) sur un projet de
// 25 h à peine commencé, et « Album du club » reculait à chaque tâche écrite.
// La règle vit dans `avanceeDuProjet` (js/orientation.js), pour rester
// éprouvable hors écran ; ici on ne fait que la dessiner.
function jaugeDuProjet(avancee) {
  if (avancee.mesure === 'declaree') {
    return `<span class="cap-avancee" role="img" aria-label="Terminé"><span
      style="width: 100%"></span></span>`;
  }

  if (avancee.mesure === 'etapes') {
    return `<span class="cap-marches" role="img"
      aria-label="${avancee.franchies} étape(s) franchie(s) sur ${avancee.marches}">${(
      avancee.etapes ?? []
    )
      .map((etape) => `<span class="cap-marche${etape.atteint ? ' atteint' : ''}"></span>`)
      .join('')}</span>`;
  }

  if (avancee.mesure === 'charge') {
    // Une charge dont aucune durée n'a été notée ne se dessine pas en barre à
    // zéro : ce serait affirmer que rien n'a été fait. Le pointillé dit la
    // bonne chose — le hub ne sait pas.
    if (avancee.sansDuree) return '<span class="cap-avancee cap-marches-vide"></span>';
    return `<span class="cap-avancee" role="img"
      aria-label="${heuresLisibles(avancee.minutes)} sur ${heuresLisibles(
        avancee.annonce,
      )} annoncées"><span
      style="width: ${Math.round(avancee.part * 100)}%"></span></span>`;
  }

  return '<span class="cap-avancee cap-marches-vide"></span>';
}

// Ce que la jauge ne peut pas dire : sur quoi elle est assise. Une barre à
// moitié pleine ne vaut rien si l'on ne sait pas si c'est la moitié des étapes
// ou la moitié des heures.
function motDeLAvancee(avancee) {
  if (avancee.mesure === 'etapes') {
    return `${avancee.franchies} sur ${pluriel(avancee.marches, 'étape')}`;
  }
  if (avancee.mesure === 'charge') {
    if (avancee.sansDuree) return `${heuresLisibles(avancee.annonce)}, aucune durée notée`;
    // Le dépassement se dit tel quel : « 28 h sur 25 h ». C'est une
    // information, pas une faute — le hub n'a pas de couleur d'alerte.
    return `${heuresLisibles(avancee.minutes)} sur ${heuresLisibles(avancee.annonce)}`;
  }
  return '';
}

// LE MOUVEMENT, à côté de l'avancée et jamais à sa place (demande de Noé) : un
// projet peut être à 2 étapes sur 5 depuis trois semaines. L'une répond à « où
// j'en suis », l'autre à « est-ce que ça bouge », et aucune ne coûte de saisie.
//
// LA NAISSANCE N'EST PAS DU MOUVEMENT, et elle reste donc DANS LE DÉTAIL
// (29 août 2026, correction de Noé : « le "posé il y a" n'a pas besoin d'être
// visible sur la tuile, uniquement dans son détail »). Six de ses dix projets
// l'affichaient — une ligne identique partout ne dit plus rien, et la galerie
// ne montre que ce qui se compare. Un projet qui n'a rien vu se terminer se
// tait donc sur sa tuile : son pointillé le dit déjà.
function motDuMouvement({ dormance, cetteSemaine, commence }, { tuile = false } = {}) {
  if (cetteSemaine) return `${pluriel(cetteSemaine, 'faite')} cette semaine`;
  if (!commence) {
    if (tuile) return '';
    return dormance ? `Posé il y a ${dormance} j` : "Posé aujourd'hui";
  }
  if (dormance === 0) return "Bougé aujourd'hui";
  if (dormance === 1) return 'Bougé hier';
  return `Rien depuis ${dormance} j`;
}

function capsServis(projet) {
  return (projet.cibles ?? [])
    .map((cible) => etat.objectifs.find((objectif) => objectif.id === cible.objectif_id)?.titre)
    .filter(Boolean);
}

function tuileProjetGalerie(projet) {
  const avancee = avanceeDuProjet(projet, etat.taches);
  const mouvement = mouvementDuProjet(projet, etat.taches);

  // LE PIED DIT SUR QUOI LA JAUGE EST ASSISE, puis ce que le projet porte. Le
  // décompte des tâches faites en est parti : il ressemblait trop à une mesure
  // d'avancée, et c'est précisément ce qu'il n'est pas.
  const porte = [
    motDeLAvancee(avancee),
    avancee.total ? pluriel(avancee.total, 'tâche') : 'Aucune tâche',
    avancee.mesure === 'charge' ? '' : chargeDuProjet(projet),
  ].filter(Boolean);

  return `
    <article class="cap-tuile cap-tuile-projet" data-espace="${projet.espace}"
      data-projet-tuile="${echapper(projet.id)}">
      <span class="cap-tuile-tete">
        <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(
          NOMS_ESPACES[projet.espace] ?? projet.espace,
        )}</span>
        ${pastilleEtat(projet)}
      </span>
      <button type="button" class="cap-tuile-ouvrir"
        data-ouvrir-projet-galerie="${echapper(projet.id)}">
        <h3 class="cap-tuile-titre">${echapper(projet.nom)}</h3>
        ${jaugeDuProjet(avancee)}
        <span class="cap-tuile-pied">
          <span>${echapper(porte.join(' · '))}</span>
          <span class="cap-tuile-date">${echapper(jourLisible(projet.echeance))}</span>
        </span>
        ${
          motDuMouvement(mouvement, { tuile: true })
            ? `<span class="cap-tuile-trace">${echapper(
                motDuMouvement(mouvement, { tuile: true }),
              )}</span>`
            : ''
        }
      </button>
      ${menuDiscret('projet', projet.id)}
    </article>`;
}

// LA FRISE DES ÉTAPES, exactement celle des jalons d'un cap : même dessin,
// mêmes gestes, même point qu'on presse. C'est le même motif un étage plus bas,
// et deux formes différentes pour deux choses identiques auraient demandé de
// réapprendre le geste en descendant d'un étage.
function friseEtapes(projet) {
  const etapes = projet.etapes ?? [];
  const prochaine = etapes.find((etape) => !etape.atteint);

  const lignes = etapes
    .map(
      (etape, rang) => `
      <li class="cap-jalon${etape.atteint ? ' atteint' : ''}${
        etape === prochaine ? ' prochain' : ''
      }">
        <button type="button" class="cap-jalon-point" data-etape="${echapper(etape.id)}"
          aria-pressed="${Boolean(etape.atteint)}"
          aria-label="${
            etape.atteint ? 'Revenir sur cette étape' : 'Marquer cette étape franchie'
          }"></button>
        <span class="cap-jalon-corps">
          <span class="cap-jalon-titre">${echapper(etape.titre)}</span>
        </span>
        ${menuDiscret('etape', etape.id, {
          deplacer: { haut: rang > 0, bas: rang < etapes.length - 1 },
        })}
      </li>`,
    )
    .join('');

  return `
    ${etapes.length ? `<ol class="cap-frise">${lignes}</ol>` : ''}
    <button type="button" class="cap-ajout-discret" data-ajout="etape:${echapper(projet.id)}">
      ${SIGNE.plus}<span>Poser une étape</span></button>`;
}

// CE QUI MESURE CE PROJET, dit en toutes lettres dans son détail. Sans cette
// ligne, un projet à jauge pointillée laisse croire qu'il n'avance pas, alors
// qu'il n'a simplement rien déclaré à mesurer — et rien à l'écran ne dirait
// comment y remédier.
function surQuoiIlSeMesure(avancee, projet) {
  if (avancee.mesure === 'etapes') return '';
  if (avancee.mesure === 'declaree') return 'Tu l\'as déclaré terminé.';
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
  return "Rien ne le mesure encore. Pose des étapes, ou annonce une charge en heures.";
}

function detailProjet(projet) {
  const { lignes, faites, lignesFaites } = grouperLesTaches(tachesDuProjet(projet));
  const caps = capsServis(projet);
  const charge = chargeDuProjet(projet);
  const avancee = avanceeDuProjet(projet, etat.taches);
  const mesure = surQuoiIlSeMesure(avancee, projet);
  // Le mouvement ENTIER vit ici, naissance comprise : la tuile ne montre que ce
  // qui se compare, le détail répond à tout ce qu'on peut se demander une fois
  // entré (demande de Noé, 29 août 2026).
  const trace = motDuMouvement(mouvementDuProjet(projet, etat.taches));
  const orphelines = etat.taches.filter(
    (tache) => tache.espace === projet.espace && !tache.projet_id && tache.statut !== 'fait',
  );

  return `
    <div class="cap-detail">
      <div class="cap-detail-tete">
        <span class="cap-tuile-tete">
          <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(
            NOMS_ESPACES[projet.espace] ?? projet.espace,
          )}</span>
          ${pastilleEtat(projet)}
        </span>
        <h3 class="cap-detail-titre">${echapper(projet.nom)}</h3>
        <p class="cap-detail-date"><span>${echapper(
          [charge, projet.echeance ? jourLisible(projet.echeance) : '', trace]
            .filter(Boolean)
            .join(' · '),
        )}</span></p>
        ${menuDiscret('projet', projet.id)}
        <button type="button" class="cap-refermer" data-refermer-projet
          aria-label="Refermer ce projet">Refermer</button>
      </div>

      ${projet.resultat ? `<p class="cap-pourquoi">${echapper(projet.resultat)}</p>` : ''}
      <p class="cap-cible"><span>Ce qu'il sert</span>${
        caps.length
          ? echapper(caps.join(' · '))
          : "Aucun cap déclaré — c'est de l'intendance, et c'est légitime."
      }</p>

      <div class="cap-etages">
        <section class="cap-etage">
          <h4 class="cap-etage-titre">Ses étapes</h4>
          ${mesure ? `<p class="cap-vide">${echapper(mesure)}</p>` : ''}
          ${friseEtapes(projet)}
        </section>

        <section class="cap-etage cap-etage-large">
          <h4 class="cap-etage-titre">Ses tâches</h4>
          ${
            lignes.length
              ? `<ul class="cap-taches">${lignes.map(ligneTache).join('')}</ul>`
              : `<p class="cap-vide">Rien encore. La première dira par où ça commence.</p>`
          }
          ${blocDesFaites(projet, faites, lignesFaites)}
          <span class="cap-projet-gestes">
            <button type="button" class="cap-ajout-discret"
              data-ajout="tache:${echapper(projet.id)}">
              ${SIGNE.plus}<span>Ajouter une tâche</span></button>
            ${
              orphelines.length
                ? `<button type="button" class="cap-ajout-discret"
                     data-rattacher-vers="${echapper(projet.id)}">
                     <span>Rattacher une tâche</span>
                     <span class="chiffre">${orphelines.length}</span></button>`
                : ''
            }
          </span>
          ${
            etat.rattache === projet.id
              ? `<ul class="cap-orphelines">${orphelines
                  .map(
                    (tache) => `
                  <li>
                    <span>${echapper(tache.titre)}</span>
                    <button type="button" class="lien-discret bouton-mini"
                      data-rattacher="${echapper(tache.id)}"
                      data-vers="${echapper(projet.id)}">Rattacher</button>
                  </li>`,
                  )
                  .join('')}</ul>`
              : ''
          }
        </section>
      </div>
    </div>`;
}

// Par espace d'abord, comme les caps ; PUIS PAR ÉTAT — ce qui est en cours, ce
// qui n'a pas commencé, ce qui est fini. C'est le tri que Noé a demandé, et il
// tient sans filtre : les trois familles se suivent, on ne cherche pas.
function projetsAffiches() {
  const rangEspace = (projet) => ESPACES.indexOf(projet.espace);
  const rangEtat = (projet) => RANG_ETAT[projet.statut] ?? 0;
  return [...etat.projets]
    .filter((projet) => !etat.espaceFiltre || projet.espace === etat.espaceFiltre)
    .sort(
    (a, b) =>
      rangEspace(a) - rangEspace(b) ||
      rangEtat(a) - rangEtat(b) ||
      String(a.echeance ?? '9999-99-99').localeCompare(String(b.echeance ?? '9999-99-99')) ||
      a.nom.localeCompare(b.nom),
  );
}

function galerieProjets(seule = false) {
  const projets = projetsAffiches();
  const de = etat.espaceFiltre ? ` pour ${NOMS_ESPACES[etat.espaceFiltre]}` : '';

  return `
    <section class="cap-bande">
      ${seule ? '' : '<h2 class="cap-etage-titre">Les projets — le comment</h2>'}
      <div class="cap-galerie">
        ${projets
          .map((projet) =>
            etat.projetGalerie === projet.id
              ? `<article class="cap-tuile cap-tuile-ouverte" data-espace="${projet.espace}"
                   data-projet-tuile="${echapper(projet.id)}">${detailProjet(projet)}</article>`
              : tuileProjetGalerie(projet),
          )
          .join('')}
        <button type="button" class="cap-tuile cap-tuile-ajout" data-ajout="projet:rien">
          ${SIGNE.plus}<span>Poser un projet</span></button>
      </div>

      ${
        projets.length
          ? ''
          : `<p class="cap-vide">Aucun projet${de}. Un projet dit COMMENT on
              atteint un cap — et il peut n'en servir aucun : de l'intendance,
              ça existe.</p>`
      }
    </section>`;
}

// --- L'argent de « Rembourser mon matériel » ----------------------------------
// La cible de cet objectif est la somme du matériel et des frais, sa
// progression la somme des prestations encaissées. Les deux listes se corrigent
// ICI, à côté de l'objectif qu'elles mesurent (demande de Noé, 26 août 2026) —
// la page Yuno, elle, se contente d'en afficher le total.

export function construireArgent(commandes, materiel) {
  const { encaisse, frais, achats, cible, reste } = argentDeYuno(commandes, materiel);
  const chiffrees = commandes.filter((commande) => commande.montant != null);

  const ligne = (entree, somme, detail, action) => `
    <li>
      <span class="argent-nom">
        ${echapper(entree.titre ?? entree.nom)}
        ${detail ? `<span class="discret argent-detail">${detail}</span>` : ''}
      </span>
      <span class="chiffre argent-somme">${enEuros(somme)}</span>
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-${action}="${echapper(entree.id)}"
        title="Retirer" aria-label="Retirer « ${echapper(entree.titre ?? entree.nom)} »">×</button>
    </li>`;

  return `
    <div class="cap-argent">
      <p class="cap-argent-total">
        <span class="chiffre">${enEuros(encaisse)}</span> encaissés sur
        <span class="chiffre">${enEuros(cible)}</span> —
        il reste <span class="chiffre">${enEuros(reste)}</span>.
        ${
          frais
            ? `<span class="discret">Dont ${enEuros(
                achats,
              )} de matériel et ${enEuros(frais)} de déplacements.</span>`
            : ''
        }
      </p>

      <h5 class="cap-argent-titre">Les prestations</h5>
      ${
        chiffrees.length
          ? `<ul class="liste-argent">${chiffrees
              .map((commande) =>
                ligne(
                  commande,
                  commande.montant,
                  // Les frais se disent ici mais comptent en face : ils
                  // grossissent ce qu'il reste à rembourser, ils n'entament pas
                  // la recette.
                  commande.frais ? `${enEuros(commande.frais)} de déplacement` : '',
                  'retirer-commande',
                ),
              )
              .join('')}</ul>`
          : '<p class="vide">Rien encore.</p>'
      }
      <button type="button" class="cap-ajout-discret" data-ajout="prestation:rien">
        ${SIGNE.plus}<span>Noter une prestation</span></button>

      <h5 class="cap-argent-titre">Le matériel</h5>
      ${
        materiel.length
          ? `<ul class="liste-argent">${materiel
              .map((achat) =>
                ligne(
                  achat,
                  achat.prix,
                  achat.date_achat ? jourLisible(achat.date_achat) : '',
                  'retirer-materiel',
                ),
              )
              .join('')}</ul>`
          : '<p class="vide">Rien encore.</p>'
      }
      <button type="button" class="cap-ajout-discret" data-ajout="materiel:rien">
        ${SIGNE.plus}<span>Noter un achat</span></button>
    </div>`;
}

function detail(objectif) {
  const projets = projetsDuCap(objectif);
  const directes = grouperLesTaches(tachesDuCap(objectif));
  const argent = objectif.titre === OBJECTIF_MATERIEL;

  return `
    <div class="cap-detail">
      <div class="cap-detail-tete">
        <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(
          NOMS_ESPACES[objectif.espace] ?? objectif.espace,
        )}</span>
        <h3 class="cap-detail-titre">${echapper(objectif.titre)}</h3>
        ${
          objectif.echeance
            ? `<p class="cap-detail-date">${echapper(jourLisible(objectif.echeance))}</p>`
            : ''
        }
        ${menuDiscret('objectif', objectif.id, { atteindre: true })}
        <button type="button" class="cap-refermer" data-refermer aria-label="Refermer ce cap">
          Refermer
        </button>
      </div>

      ${objectif.pourquoi ? `<p class="cap-pourquoi">${echapper(objectif.pourquoi)}</p>` : ''}
      ${
        objectif.cible
          ? `<p class="cap-cible"><span>À quoi je saurai</span>${echapper(objectif.cible)}</p>`
          : ''
      }

      <div class="cap-etages">
        <section class="cap-etage">
          <h4 class="cap-etage-titre">Les jalons</h4>
          ${frise(objectif)}
        </section>

        <section class="cap-etage">
          <h4 class="cap-etage-titre">Les projets</h4>
          <div class="cap-projets">
            ${
              projets.length
                ? projets.map(tuileProjet).join('')
                : `<p class="cap-vide">Aucun projet ne le sert encore. Un projet, c'est le
                   <em>comment</em> : l'album, la rubrique, le dossier — ce qui porte les
                   tâches et la charge.</p>`
            }
          </div>
          <button type="button" class="cap-ajout-discret"
            data-ajout="projet:${echapper(objectif.id)}">
            ${SIGNE.plus}<span>Poser un projet</span></button>
        </section>

        ${
          directes.lignes.length
            ? `<section class="cap-etage">
                 <h4 class="cap-etage-titre">Rattachées au cap, sans projet</h4>
                 <ul class="cap-taches">${directes.lignes.map(ligneTache).join('')}</ul>
               </section>`
            : ''
        }

        ${
          argent
            ? `<section class="cap-etage">
                 <h4 class="cap-etage-titre">Ce qui le mesure</h4>
                 ${construireArgent(etat.commandes, etat.materiel)}
               </section>`
            : ''
        }
      </div>
    </div>`;
}

// --- Les formulaires de la tuile volante --------------------------------------
//
// Un formulaire par étage, dans la forme exacte du hub : `construireFormulaire`
// pose la tuile, le fond assombri, la croix et le menu dessiné ; `app.js` la
// referme du fond, de la croix ou d'Échap. Rien à réapprendre, rien à recopier.

const FORMULAIRES = {
  objectif: {
    ajouter: 'Poser un objectif',
    modifier: "Modifier l'objectif",
    champs: (v) => [
      {
        nom: 'espace',
        libelle: 'Espace',
        type: 'choix',
        options: Object.fromEntries(ESPACES.map((espace) => [espace, NOMS_ESPACES[espace]])),
        valeur: v.espace ?? ESPACES[0],
      },
      {
        nom: 'titre',
        libelle: 'Objectif, formulé de façon mesurable',
        type: 'text',
        requis: true,
        valeur: v.titre,
      },
      {
        nom: 'pourquoi',
        libelle: 'Pourquoi ? (relu les jours sans motivation)',
        type: 'textarea',
        valeur: v.pourquoi,
      },
      { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text', valeur: v.cible },
      { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date', valeur: v.echeance },
    ],
  },
  jalon: {
    ajouter: 'Poser un jalon',
    modifier: 'Modifier le jalon',
    champs: (v) => [
      { nom: 'titre', libelle: 'Jalon', type: 'text', requis: true, valeur: v.titre },
      { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date', valeur: v.echeance },
    ],
  },
  etape: {
    ajouter: 'Poser une étape',
    modifier: "Modifier l'étape",
    // Pas d'échéance, à la différence d'un jalon : une étape découpe le
    // TRAVAIL, pas le calendrier. Ce sont les tâches qui portent les dates.
    champs: (v) => [
      { nom: 'titre', libelle: 'Étape', type: 'text', requis: true, valeur: v.titre },
    ],
  },
  projet: {
    ajouter: 'Poser un projet',
    modifier: 'Modifier le projet',
    champs: (v) => [
      // L'espace est demandé MÊME quand le projet naît sous un cap : il arrive
      // alors pré-rempli avec celui du cap, et il reste corrigeable. Un projet
      // posé depuis la galerie, lui, n'a que ce champ pour dire d'où il vient.
      {
        nom: 'espace',
        libelle: 'Espace',
        type: 'choix',
        options: Object.fromEntries(ESPACES.map((espace) => [espace, NOMS_ESPACES[espace]])),
        valeur: v.espace ?? ESPACES[0],
      },
      { nom: 'nom', libelle: 'Projet', type: 'text', requis: true, valeur: v.nom },
      {
        nom: 'resultat',
        libelle: "À quoi tu sauras qu'il est fini",
        type: 'text',
        valeur: v.resultat,
      },
      // Deux charges, deux natures de projet : celui qui finit porte un total,
      // celui qui ne finit pas porte un rythme.
      {
        nom: 'charge_heures',
        libelle: "Combien d'heures en tout (s'il finit)",
        type: 'number',
        valeur: v.charge_minutes ? v.charge_minutes / 60 : '',
      },
      {
        nom: 'charge_hebdo_heures',
        libelle: "Ou combien d'heures par semaine",
        type: 'number',
        valeur: v.charge_hebdo ? v.charge_hebdo / 60 : '',
      },
      { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date', valeur: v.echeance },
      {
        nom: 'statut',
        libelle: 'Où il en est',
        type: 'choix',
        options: ETATS_PROJET,
        valeur: v.statut ?? 'actif',
      },
    ],
  },
  tache: {
    ajouter: 'Ajouter une tâche',
    modifier: 'Modifier la tâche',
    champs: (v) => [
      { nom: 'titre', libelle: 'Nom de la tâche', type: 'text', requis: true, valeur: v.titre },
      { nom: 'echeance', libelle: 'Quand', type: 'date', valeur: v.echeance },
      {
        nom: 'heure',
        libelle: 'Heure (facultative)',
        type: 'time',
        valeur: v.heure ? String(v.heure).slice(0, 5) : '',
      },
      {
        nom: 'duree',
        libelle: 'Combien de temps, en minutes',
        type: 'number',
        valeur: v.duree ?? '',
      },
      {
        nom: 'priorite',
        libelle: 'Priorité',
        type: 'choix',
        options: PRIORITES,
        valeur: String(v.priorite ?? 4),
      },
      {
        nom: 'recurrence',
        libelle: 'Se répète',
        type: 'choix',
        options: RECURRENCES,
        valeur: v.recurrence ?? '',
      },
    ],
  },
  periode: {
    ajouter: 'Déclarer une période',
    modifier: 'Modifier la période',
    champs: (v) => [
      { nom: 'nom', libelle: 'Période', type: 'text', requis: true, valeur: v.nom },
      { nom: 'debut', libelle: 'Du', type: 'date', requis: true, valeur: v.debut },
      { nom: 'fin', libelle: 'Au', type: 'date', requis: true, valeur: v.fin },
      {
        nom: 'regime_fch',
        libelle: 'FC Hermitage',
        type: 'choix',
        options: NOMS_REGIMES,
        valeur: v.regimes?.fch ?? 'normal',
      },
      {
        nom: 'regime_formation',
        libelle: 'Formation',
        type: 'choix',
        options: NOMS_REGIMES,
        valeur: v.regimes?.formation ?? 'normal',
      },
      {
        nom: 'regime_photo',
        libelle: 'Yuno',
        type: 'choix',
        options: NOMS_REGIMES,
        valeur: v.regimes?.photo ?? 'normal',
      },
    ],
  },
  prestation: {
    ajouter: 'Noter une prestation',
    modifier: 'Modifier la prestation',
    champs: () => [
      { nom: 'titre', libelle: 'Prestation', type: 'text', requis: true },
      { nom: 'client', libelle: 'Client (facultatif)', type: 'text' },
      { nom: 'montant', libelle: 'Encaissé, en euros', type: 'number', requis: true },
      { nom: 'frais', libelle: 'Frais de déplacement (facultatif)', type: 'number' },
    ],
  },
  materiel: {
    ajouter: 'Noter un achat',
    modifier: "Modifier l'achat",
    champs: () => [
      { nom: 'nom', libelle: 'Matériel', type: 'text', requis: true },
      { nom: 'prix', libelle: 'Prix, en euros', type: 'number', requis: true },
      { nom: 'date_achat', libelle: "Date d'achat (facultative)", type: 'date' },
    ],
  },
};

function laFenetre() {
  if (!etat.edition) return '';
  const { forme, id, parent } = etat.edition;
  const modele = FORMULAIRES[forme];
  // Ce que la tuile porte déjà : la ligne qu'on corrige, ou — pour un projet posé
  // depuis un cap — l'espace de ce cap, pour que le champ arrive juste.
  const valeurs = id
    ? (trouver(`${forme}:${id}`).cible ?? {})
    : forme === 'projet' && parent
      ? { espace: trouver(`objectif:${parent}`).cible?.espace }
      : {};

  return construireFormulaire({
    id: `cap-${forme}`,
    libelle: id ? modele.modifier : modele.ajouter,
    action: 'enregistrer-cap',
    bouton: id ? 'Enregistrer' : 'Ajouter',
    champs: modele.champs(valeurs),
    extra: `<input type="hidden" name="forme" value="${echapper(forme)}">
            <input type="hidden" name="id" value="${echapper(id ?? '')}">
            <input type="hidden" name="parent" value="${echapper(parent ?? '')}">`,
  });
}

// --- Trouver ------------------------------------------------------------------

function trouver(cle) {
  const [forme, id] = cle.split(':');
  if (forme === 'objectif') return { cible: etat.objectifs.find((o) => o.id === id) };
  if (forme === 'periode') return { cible: etat.periodes.find((p) => p.id === id) };
  if (forme === 'projet') return { cible: etat.projets.find((p) => p.id === id) };
  if (forme === 'tache') return { cible: etat.taches.find((t) => t.id === id) };
  if (forme === 'jalon') {
    for (const objectif of etat.objectifs) {
      const jalon = (objectif.jalons ?? []).find((j) => j.id === id);
      if (jalon) return { cible: jalon, objectif };
    }
  }
  if (forme === 'etape') {
    for (const projet of etat.projets) {
      const etape = (projet.etapes ?? []).find((e) => e.id === id);
      if (etape) return { cible: etape, projet };
    }
  }
  return {};
}

// --- La page ------------------------------------------------------------------

// PAR ESPACE D'ABORD, dans l'ordre des journées de Noé ; à l'intérieur, le plus
// proche en tête. Ce qui n'a pas de date ferme la marche — un cap sans échéance
// n'est pas en retard, il n'est simplement pas daté.
//
// Il n'y a PLUS DE FILTRE par espace (28 août 2026, demande de Noé) : depuis
// que les caps arrivent groupés, il ne cachait rien qu'on ne voyait déjà. Six
// tuiles tiennent sur un écran — un filtre au-dessus d'une liste qu'on embrasse
// du regard est un contrôle qui coûte sans rien rendre.
function capsAffiches() {
  const rang = (objectif) => ESPACES.indexOf(objectif.espace);
  return [...etat.objectifs]
    .filter((objectif) => !etat.espaceFiltre || objectif.espace === etat.espaceFiltre)
    .sort(
    (a, b) =>
      rang(a) - rang(b) ||
      String(a.echeance ?? '9999-99-99').localeCompare(String(b.echeance ?? '9999-99-99')),
  );
}

function lireLAdresse(route) {
  etat.vue = route?.vue ?? null;
  etat.espaceFiltre = ESPACES.includes(route?.id) ? route.id : null;
}

const VUES = {
  caps: 'Les objectifs — le cap',
  projets: 'Les projets — le comment',
  periodes: 'Ce que tu attends des mois qui viennent',
};

function etageCaps() {
  const caps = capsAffiches();

  return `
    <div class="cap-galerie">
      ${caps
        .map((objectif) =>
          etat.ouvert === objectif.id
            ? `<article class="cap-tuile cap-tuile-ouverte" data-espace="${objectif.espace}"
                 data-objectif="${echapper(objectif.id)}">${detail(objectif)}</article>`
            : tuileObjectif(objectif),
        )
        .join('')}
      <button type="button" class="cap-tuile cap-tuile-ajout" data-ajout="objectif:rien">
        ${SIGNE.plus}<span>Poser un objectif</span></button>
    </div>

    ${
      caps.length
        ? ''
        : `<p class="cap-vide">Aucun cap encore. Le premier dira où tu vas.</p>`
    }`;
}

function squelette() {
  const vue = etat.vue in VUES ? etat.vue : null;
  const de = etat.espaceFiltre ? ` — ${NOMS_ESPACES[etat.espaceFiltre]}` : '';

  // Une vue seule porte son propre titre : sans lui, « Les projets » ouvrirait
  // sur une galerie sans nom. Les trois ensemble gardent « Le cap », et ce sont
  // les titres d'étage qui les séparent.
  const titre = `<h1>${vue ? VUES[vue] + de : 'Général' + de}</h1>`;

  const etages = vue
    ? { caps: etageCaps(), projets: galerieProjets(true), periodes: bandePeriodes(true) }[vue]
    : `${etageCaps()}\n${galerieProjets()}\n${bandePeriodes()}`;

  return `
    ${titre}

    ${etages}

    ${etat.message ? `<p class="message-erreur">${echapper(etat.message)}</p>` : ''}

    <div class="cap-fenetre-hote">${laFenetre()}</div>`;
}

// --- L'espace -----------------------------------------------------------------

export default {
  async monter(section, route) {
    lireLAdresse(route);

    // Les menus dessinés des formulaires ne sont branchés nulle part ailleurs :
    // cet espace n'a pas de tuile de capture, il pose donc son propre écouteur —
    // comme le site du FCH, et pour la même raison.
    brancherChoix(section);

    const rendre = () => {
      section.innerHTML = squelette();
      // La tuile volante n'a pas de sommaire à presser ici : c'est une pastille
      // ou un menu qui l'ouvre. On la déplie donc à la main, juste après le
      // rendu — `app.js` la referme comme toutes les autres.
      const fenetre = section.querySelector('.cap-fenetre-hote .ajout-volant');
      if (fenetre) {
        fenetre.open = true;
        fenetre.querySelector('input, textarea')?.focus();
      }
    };

    // Le seul moment animé de l'écran : la tuile devient le détail, et le détail
    // redevient la tuile. Les navigateurs qui ne savent pas le faire changent
    // simplement de contenu — rien ne dépend de l'animation.
    const rendreAnime = () => {
      const bouge =
        document.startViewTransition &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!bouge) return rendre();

      // Les TROIS promesses d'une transition peuvent échouer — deux gestes trop
      // rapprochés, et la précédente est abandonnée. Ce n'est pas une erreur :
      // l'écran est déjà juste. Sans ces `catch`, la console en garde la trace
      // comme d'un défaut, et `finished` seule ne suffit pas (`ready` rejette
      // de son côté quand la transition est sautée).
      const passage = document.startViewTransition(() => rendre());
      passage.finished.catch(() => {});
      passage.ready.catch(() => {});
      passage.updateCallbackDone.catch(() => {});
    };

    const charger = async () => {
      const [objectifs, projets, taches, periodes, commandes, materiel] = await Promise.all([
        api.objectifsActifs(),
        api.projetsTous(),
        api.tachesToutes(),
        api.periodesToutes(),
        api.commandesToutes(),
        api.materielTout(),
      ]);

      etat.objectifs = objectifs.filter((objectif) => ESPACES.includes(objectif.espace));
      etat.projets = projets;
      etat.taches = taches;
      etat.periodes = periodes;
      etat.commandes = commandes;
      etat.materiel = materiel;
      rendre();
    };

    this.rafraichir = charger;

    // Changer de vue ne relit rien : les trois étages viennent du même
    // chargement, seule change la part qu'on en montre.
    this.naviguer = (nouvelle) => {
      const avant = `${etat.vue}/${etat.espaceFiltre}`;
      lireLAdresse(nouvelle);
      if (`${etat.vue}/${etat.espaceFiltre}` !== avant) rendre();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error("Chargement de l'espace Le cap impossible", erreur);
      section.innerHTML = `
        <h1>Général</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    // --- Enregistrer, depuis la tuile volante ---
    //
    // Un formulaire garde sa saisie quand l'écriture échoue et a un endroit pour
    // le dire : c'est l'une des deux exceptions à l'affichage optimiste.

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="enregistrer-cap"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        await enregistrer(champs);
        etat.edition = null;
        rendre();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    async function enregistrer(champs) {
      const { forme, id, parent } = champs;

      if (forme === 'objectif') {
        const valeurs = {
          espace: champs.espace,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        };
        if (id) {
          const objectif = trouver(`objectif:${id}`).cible;
          Object.assign(objectif, await api.modifierObjectif(id, valeurs));
        } else {
          const objectif = await api.creerObjectif(valeurs);
          etat.objectifs = [...etat.objectifs, { ...objectif, jalons: objectif.jalons ?? [] }];
        }
        return;
      }

      if (forme === 'jalon') {
        const valeurs = { titre: champs.titre.trim(), echeance: champs.echeance || null };
        if (id) {
          const jalon = trouver(`jalon:${id}`).cible;
          Object.assign(jalon, await api.modifierJalon(id, valeurs));
        } else {
          const objectif = trouver(`objectif:${parent}`).cible;
          const jalon = await api.creerJalon({
            objectif_id: parent,
            ...valeurs,
            ordre: (objectif?.jalons?.length ?? 0) + 1,
          });
          objectif.jalons = [...(objectif.jalons ?? []), jalon];
        }
        return;
      }

      if (forme === 'etape') {
        const valeurs = { titre: champs.titre.trim() };
        if (id) {
          const etape = trouver(`etape:${id}`).cible;
          Object.assign(etape, await api.modifierEtape(id, valeurs));
        } else {
          const projet = trouver(`projet:${parent}`).cible;
          const etape = await api.creerEtape({
            projet_id: parent,
            ...valeurs,
            ordre: (projet?.etapes?.length ?? 0) + 1,
          });
          projet.etapes = [...(projet.etapes ?? []), etape];
        }
        return;
      }

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
        if (id) {
          const projet = trouver(`projet:${id}`).cible;
          Object.assign(projet, await api.modifierProjet(id, valeurs));
        } else {
          const projet = await api.creerProjet(valeurs);
          // Un projet posé DEPUIS un cap sert ce cap : le lien se fait tout
          // seul, sinon il faudrait le refaire à la main juste après. Posé
          // depuis la galerie, il ne sert rien pour l'instant — et c'est
          // légitime : de l'intendance, ça existe.
          const cible = parent ? await api.lierProjet(projet.id, { objectif_id: parent }) : null;
          etat.projets = [...etat.projets, { ...projet, cibles: cible ? [cible] : [] }];
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
        if (id) {
          const tache = trouver(`tache:${id}`).cible;
          Object.assign(tache, await api.modifierTache(id, valeurs));
        } else {
          const projet = trouver(`projet:${parent}`).cible;
          const tache = await api.creerTache({
            espace: projet.espace,
            projet_id: projet.id,
            statut: 'actif',
            ...valeurs,
          });
          etat.taches = [...etat.taches, tache];
        }
        return;
      }

      if (forme === 'periode') {
        const valeurs = {
          nom: champs.nom.trim(),
          debut: champs.debut,
          fin: champs.fin,
          // Seuls les régimes qui s'écartent du normal sont retenus : une
          // période qui ne dit rien d'un espace ne doit pas donner l'illusion
          // d'en avoir décidé quelque chose.
          regimes: Object.fromEntries(
            ESPACES.map((espace) => [espace, champs[`regime_${espace}`]]).filter(
              ([, regime]) => regime && regime !== 'normal',
            ),
          ),
        };
        if (id) {
          const periode = trouver(`periode:${id}`).cible;
          Object.assign(periode, await api.modifierPeriode(id, valeurs));
        } else {
          etat.periodes = [...etat.periodes, await api.creerPeriode(valeurs)].sort((a, b) =>
            String(a.debut).localeCompare(String(b.debut)),
          );
        }
        return;
      }

      if (forme === 'prestation') {
        // Livrée d'emblée : on note ce qu'on a ENCAISSÉ, pas ce qu'on espère.
        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: champs.client?.trim() || null,
          montant: Number(champs.montant),
          // Vide = pas de frais, et non zéro : la colonne dit alors « on n'a
          // rien noté », pas « ça n'a rien coûté ».
          frais: champs.frais ? Number(champs.frais) : null,
          statut: 'livree',
        });
        etat.commandes = [commande, ...etat.commandes];
        return;
      }

      if (forme === 'materiel') {
        const achat = await api.creerMateriel({
          nom: champs.nom.trim(),
          prix: Number(champs.prix),
          date_achat: champs.date_achat || null,
        });
        etat.materiel = [achat, ...etat.materiel];
      }
    }

    // --- Les gestes ---

    section.addEventListener('click', async (evenement) => {
      const dans = (nom) => evenement.target.closest(`[data-${nom}]`);

      // REFERMER LA TUILE VOLANTE EFFACE AUSSI SON ÉTAT. `app.js` retire
      // l'attribut `open` — cela suffit aux dix-sept formulaires qui vivent
      // dans la page, pas à celui-ci : il est REDESSINÉ à chaque rendu, et
      // reviendrait donc ouvert au premier geste suivant. C'est ce qui s'est
      // produit la première fois : la tuile refermée réapparaissait par-dessus
      // le cap qu'on venait d'ouvrir.
      if (evenement.target.closest('[data-fermer-ajout]')) {
        etat.edition = null;
        rendre();
        return;
      }

      // Le reste de la tuile volante est géré par `brancherChoix` et par
      // `app.js` : on ne fait que l'ignorer ici.
      if (evenement.target.closest('.ajout-volant')) return;

      // CHANGER L'ÉTAT D'UN PROJET depuis sa tuile. L'écran d'abord : la
      // pastille change de mot et de couleur, le projet reprend sa place dans
      // le tri, et l'écriture part derrière.
      const etatChoisi = dans('etat-projet');
      if (etatChoisi) {
        const projet = trouver(`projet:${etatChoisi.dataset.projet}`).cible;
        if (!projet) return;
        const modifs = { statut: etatChoisi.dataset.etatProjet };
        await modifierAussitot(projet, modifs, () => api.modifierProjet(projet.id, modifs), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être enregistré — l'état est revenu."),
        });
        return;
      }

      // Ouvrir un menu dessiné : `brancherChoix` s'en charge, et surtout il ne
      // faut RIEN redessiner ici — le rendu emporterait le panneau qui vient de
      // s'ouvrir.
      if (evenement.target.closest('[data-ouvrir-choix], .choix-panneau')) return;

      const ouvrir = dans('ouvrir');
      if (ouvrir) {
        const id = ouvrir.dataset.ouvrir;
        etat.ouvert = etat.ouvert === id ? null : id;
        etat.projetOuvert = null;
        etat.menu = null;
        rendreAnime();
        return;
      }

      if (dans('refermer')) {
        etat.ouvert = null;
        etat.menu = null;
        rendreAnime();
        return;
      }

      const galerie = dans('ouvrir-projet-galerie');
      if (galerie) {
        const id = galerie.dataset.ouvrirProjetGalerie;
        etat.projetGalerie = etat.projetGalerie === id ? null : id;
        etat.rattache = null;
        etat.faites = null;
        etat.menu = null;
        rendreAnime();
        return;
      }

      if (dans('refermer-projet')) {
        etat.projetGalerie = null;
        etat.menu = null;
        rendreAnime();
        return;
      }

      const projet = dans('ouvrir-projet');
      if (projet) {
        const id = projet.dataset.ouvrirProjet;
        etat.projetOuvert = etat.projetOuvert === id ? null : id;
        etat.rattache = null;
        etat.faites = null;
        etat.menu = null;
        rendre();
        return;
      }

      // --- Ce qui s'écrit d'un doigt ---

      const jalon = dans('jalon');
      if (jalon) return basculerJalon(jalon.dataset.jalon);

      const etape = dans('etape');
      if (etape) return basculerEtape(etape.dataset.etape);

      // Réordonner les étapes. LE MENU RESTE OUVERT après le déplacement : une
      // étape qui doit remonter de trois rangs se déplace alors en trois appuis
      // et non en neuf. Il est attaché à l'identifiant de l'étape, pas à sa
      // position, donc il suit celle qui bouge.
      const monter = dans('monter');
      const descendre = dans('descendre');
      if (monter || descendre) {
        const [forme, id] = (monter ?? descendre).dataset[
          monter ? 'monter' : 'descendre'
        ].split(':');
        const pas = monter ? -1 : 1;
        return forme === 'jalon' ? deplacerJalon(id, pas) : deplacerEtape(id, pas);
      }

      const tache = dans('tache');
      if (tache) return basculerTache(tache.dataset.tache);

      const relire = dans('faites');
      if (relire) {
        const id = relire.dataset.faites;
        etat.faites = etat.faites === id ? null : id;
        rendre();
        return;
      }

      const rattacherVers = dans('rattacher-vers');
      if (rattacherVers) {
        const id = rattacherVers.dataset.rattacherVers;
        etat.rattache = etat.rattache === id ? null : id;
        rendre();
        return;
      }

      const rattacher = dans('rattacher');
      if (rattacher) {
        const cible = etat.taches.find((t) => t.id === rattacher.dataset.rattacher);
        if (!cible) return;
        const modifs = { projet_id: rattacher.dataset.vers };
        await modifierAussitot(cible, modifs, () => api.modifierTache(cible.id, modifs), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être rattaché."),
        });
        return;
      }

      // --- Les périodes ---

      // --- L'argent ---

      const commande = dans('retirer-commande');
      if (commande) {
        const id = commande.dataset.retirerCommande;
        const cible = etat.commandes.find((c) => c.id === id);
        return retirerAussitot(etat.commandes, cible, () => api.supprimerCommande(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être retiré."),
        });
      }

      const achat = dans('retirer-materiel');
      if (achat) {
        const id = achat.dataset.retirerMateriel;
        const cible = etat.materiel.find((m) => m.id === id);
        return retirerAussitot(etat.materiel, cible, () => api.supprimerMateriel(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être retiré."),
        });
      }

      // --- Le menu discret ---

      const menu = dans('menu');
      if (menu) {
        etat.menu = etat.menu === menu.dataset.menu ? null : menu.dataset.menu;
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

      const atteindre = dans('atteindre');
      if (atteindre) {
        etat.confirme = `atteindre:${atteindre.dataset.atteindre}`;
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
        const [forme, parent] = ajout.dataset.ajout.split(':');
        etat.edition = { forme, parent: parent === 'rien' ? null : parent };
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

    // Échap referme la tuile volante — et efface son état, pour la même raison
    // que la croix et le fond assombri.
    section.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && etat.edition) {
        etat.edition = null;
        rendre();
      }
    });

    function signaler(mot) {
      etat.message = mot;
      rendre();
    }

    // Marquer un jalon atteint écrit sa victoire ; revenir dessus la retire —
    // sinon le hub garderait la trace d'un travail défait.
    async function basculerJalon(id) {
      const { cible: jalon, objectif } = trouver(`jalon:${id}`);
      if (!jalon) return;

      const avant = { ...jalon };
      Object.assign(jalon, {
        atteint: !jalon.atteint,
        date_atteint: jalon.atteint ? null : new Date().toISOString().slice(0, 10),
      });
      rendre();

      try {
        if (avant.atteint) {
          Object.assign(jalon, await api.modifierJalon(id, { atteint: false, date_atteint: null }));
          await api.supprimerVictoireDuJalon(id);
        } else {
          const { jalon: atteint } = await api.atteindreJalon(avant, objectif.espace);
          Object.assign(jalon, atteint);
        }
      } catch (souci) {
        console.error('Jalon non modifié', souci);
        Object.assign(jalon, avant);
        signaler("Ça n'a pas pu être enregistré — le jalon est revenu.");
      }
    }

    // Franchir une étape écrit sa victoire ; revenir dessus la retire. Même
    // mécanique que le jalon, au mot près — c'est le même geste un étage plus
    // bas, et il ne doit pas s'apprendre deux fois.
    async function basculerEtape(id) {
      const { cible: etape, projet } = trouver(`etape:${id}`);
      if (!etape) return;

      const avant = { ...etape };
      Object.assign(etape, {
        atteint: !etape.atteint,
        date_atteint: etape.atteint ? null : new Date().toISOString().slice(0, 10),
      });
      rendre();

      try {
        if (avant.atteint) {
          Object.assign(etape, await api.modifierEtape(id, { atteint: false, date_atteint: null }));
          await api.supprimerVictoireDeLEtape(id);
        } else {
          const { etape: franchie } = await api.franchirEtape(avant, projet.espace);
          Object.assign(etape, franchie);
        }
      } catch (souci) {
        console.error('Étape non modifiée', souci);
        Object.assign(etape, avant);
        signaler("Ça n'a pas pu être enregistré — l'étape est revenue.");
      }
    }

    // L'ORDRE SE CHANGE — pour les jalons d'un cap comme pour les étapes d'un
    // projet (29 août 2026, demande de Noé). Un découpage ne se pense pas dans
    // le bon ordre du premier coup : on pose les marches comme elles viennent,
    // puis on les range.
    //
    // UNE SEULE MÉCANIQUE POUR LES DEUX ÉTAGES. Elles portent la même colonne
    // `ordre`, le même menu et le même geste ; deux copies de ce code auraient
    // fini par diverger, et c'est le genre d'écart qu'on ne voit qu'une fois
    // qu'un des deux écrans s'est mis à mentir.
    //
    // L'écran d'abord, l'écriture derrière — et la liste reprend son ordre
    // d'avant si ça n'a pas pu s'enregistrer, sans quoi l'affichage optimiste
    // serait un mensonge.
    async function deplacerDans(liste, id, pas, ecrire, quoi) {
      const rang = liste.findIndex((ligne) => ligne.id === id);
      const vers = rang + pas;
      if (rang === -1 || vers < 0 || vers >= liste.length) return;

      // Sur place, jamais par remplacement : c'est le tableau que tout le monde
      // regarde, et un retour en arrière écrirait dans un tableau orphelin.
      // C'est la règle de js/ecriture.js.
      const avant = [...liste];
      liste.splice(vers, 0, ...liste.splice(rang, 1));
      rendre();

      try {
        await ecrire(liste);
      } catch (souci) {
        console.error('Ordre non enregistré', souci);
        liste.splice(0, liste.length, ...avant);
        signaler(`Ça n'a pas pu être enregistré — l'ordre ${quoi} est revenu.`);
      }
    }

    function deplacerEtape(id, pas) {
      const projet = etat.projets.find((p) => (p.etapes ?? []).some((e) => e.id === id));
      if (!projet) return;
      return deplacerDans(projet.etapes, id, pas, api.reordonnerEtapes, 'des étapes');
    }

    function deplacerJalon(id, pas) {
      const { objectif } = trouver(`jalon:${id}`);
      if (!objectif) return;
      return deplacerDans(objectif.jalons, id, pas, api.reordonnerJalons, 'des jalons');
    }

    // Cocher est une intention, pas un fait acquis : la fenêtre demande combien
    // de temps ça a pris, et rien n'est écrit tant qu'on n'a pas confirmé.
    async function basculerTache(id) {
      const tache = etat.taches.find((t) => t.id === id);
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
      rendre();

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

      if (forme === 'atteindre') {
        const objectif = trouver(`objectif:${id}`).cible;
        if (!objectif) return;
        etat.objectifs = etat.objectifs.filter((o) => o.id !== id);
        etat.ouvert = null;
        rendre();
        try {
          await api.atteindreObjectif(objectif);
        } catch (souci) {
          console.error("Objectif non marqué atteint", souci);
          etat.objectifs = [...etat.objectifs, objectif];
          signaler("Ça n'a pas pu être enregistré — l'objectif est revenu.");
        }
        return;
      }

      if (forme === 'objectif') {
        const objectif = trouver('objectif:' + id).cible;
        etat.ouvert = null;
        return retirerAussitot(etat.objectifs, objectif, () => api.supprimerObjectif(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

      if (forme === 'jalon') {
        const { cible: jalon, objectif } = trouver(cle);
        if (!jalon) return;
        return retirerAussitot(objectif.jalons, jalon, () => api.supprimerJalon(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

      if (forme === 'etape') {
        const { cible: etape, projet } = trouver(cle);
        if (!etape) return;
        return retirerAussitot(projet.etapes, etape, () => api.supprimerEtape(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

      if (forme === 'projet') {
        const projet = trouver(cle).cible;
        etat.projetOuvert = null;
        etat.projetGalerie = null;
        return retirerAussitot(etat.projets, projet, () => api.supprimerProjet(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

      if (forme === 'tache') {
        const tache = trouver(cle).cible;
        return retirerAussitot(etat.taches, tache, () => api.supprimerTache(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

      if (forme === 'periode') {
        const periode = trouver(cle).cible;
        return retirerAussitot(etat.periodes, periode, () => api.supprimerPeriode(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }
    }
  },
};
