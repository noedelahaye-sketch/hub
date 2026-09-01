// LA PAGE D'UNE HABITUDE — `#habitude/<id>` (2 septembre 2026, demande de Noé).
//
// « Chaque habitude doit avoir une page dédiée également, avec toutes les stats
//   intéressantes et les détails (dont depuis quand je l'ai ajoutée/commencée)
//   + un calendrier qui permet de voir quand l'habitude a été faite ou non
//   (vue mois, 3 mois). »
//
// C'EST LE MÊME MOUVEMENT QUE LES CAPS ET LES PROJETS, un troisième étage plus
// loin : la galerie compare, la page dit tout. Ce qui change ici, c'est la
// NATURE de ce qu'on regarde — un cap a des jalons à poser, une habitude n'a
// rien à poser : elle REVIENT. Son calendrier ne sert donc pas à programmer mais
// à REGARDER EN ARRIÈRE, et c'est la seule grille du hub où l'on coche un jour
// passé plutôt que d'y déposer quelque chose.
//
// LA CONTRAINTE QUI TIENT, et elle est la même que partout où les habitudes
// parlent : **aucune mesure ne compte un manque**. Une première maquette montrait
// les sept derniers jours en points gris ; Noé l'avait écartée d'une phrase —
// « ça ne me donne pas envie de les faire ». Ici : pas de taux de réussite, pas
// de jours manqués comptés, pas de rouge. Une case vide est du vide, pas un
// reproche.

import * as api from './api.js';
import {
  FLAMME_JOURS,
  PALIERS_HABITUDE,
  cumulDeLHabitude,
  joursDAffileeDeLHabitude,
  rangDeLaSerie,
  serieDeLHabitude,
  tauxDeLHabitude,
} from './orientation.js';
// LES DESSINS VIENNENT DE LA PAGE DES HABITUDES, ils ne se recopient pas : la
// sparkline doit dire la même chose des deux côtés.
import {
  FORMULAIRES,
  TEINTES_FAMILLE,
  motDeLaSparkline,
  signeHabitude,
  sparkline,
} from './perso.js';
import { construireFormulaire, construireMenuDiscret } from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
import {
  FAMILLES_PERSO,
  ajouterJours,
  depuisDateISO,
  echapper,
  joursDEcart,
  versDateISO,
} from './format.js';
import {
  construireBarrePeriode,
  deplacerAncre,
  grilleDuMois,
  moisDuTrimestre,
  titreDePeriode,
} from './calendrier-commun.js';

const SIGNE_RETOUR = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>`;

// UNE FLAMME DESSINÉE, PAS UN ÉMOJI (2 septembre 2026, demande de Noé). Le hub
// n'écrit qu'en signes tracés : un émoji arriverait avec sa couleur et sa police
// à lui, alors qu'ici la flamme doit prendre celle de la série — elle brûle en
// vert, en bleu ou en jaune selon où l'on en est.
const FLAMME = `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"
  aria-hidden="true" focusable="false"><path d="M12 2c.6 3.2-1.2 4.6-2.6 6C7.9 9.5 6.5 11 6.5
  13.6 6.5 17.1 9 20 12 20s5.5-2.6 5.5-6.1c0-2.6-1.4-4.3-2.6-5.6-.7 1-1.4 1.6-2.2
  1.9.6-2.6.3-5.7-.7-8.2Z"/></svg>`;

const JOURS_LETTRE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Les mêmes en-têtes que partout ailleurs dans le hub : la vue mois d'une
// habitude est la vue mois du site, à la lettre.
const JOURS_COURTS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

// --- L'état -------------------------------------------------------------------

const etat = {
  id: null,
  habitude: null,
  faits: [],

  // MOIS ET 3 MOIS, c'est ce que Noé a demandé. Pas de semaine — sept cases ne
  // disent rien d'une habitude ; pas d'année — une case par semaine ne saurait
  // pas dire « faite ou non », qui est la question de cette page.
  vue: 'mois',
  ancre: new Date(),

  menu: null,
  confirme: null,
  edition: null,

  message: null,
  echec: false,
};

// --- Les mots -----------------------------------------------------------------

const jourLong = (iso) =>
  depuisDateISO(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const pluriel = (nombre, singulier, plurielMot = `${singulier}s`) =>
  `${nombre} ${nombre > 1 ? plurielMot : singulier}`;

// « il y a 4 jours », « il y a 3 semaines », « il y a 2 mois ». Le hub écrit ses
// durées en toutes lettres dès qu'elles se lisent comme une phrase.
function ilYA(iso, jour) {
  const jours = Math.max(0, joursDEcart(depuisDateISO(iso), jour) * -1);
  if (jours === 0) return "aujourd'hui";
  if (jours === 1) return 'hier';
  if (jours < 14) return `il y a ${pluriel(jours, 'jour')}`;
  if (jours < 60) return `il y a ${pluriel(Math.round(jours / 7), 'semaine')}`;
  if (jours < 365) return `il y a ${pluriel(Math.round(jours / 30), 'mois', 'mois')}`;
  return `il y a ${pluriel(Math.round(jours / 365), 'an')}`;
}

const NOMS_CADENCE = {
  1: '1 fois par semaine',
  2: '2 fois par semaine',
  3: '3 fois par semaine',
  4: '4 fois par semaine',
  5: '5 fois par semaine',
  6: '6 fois par semaine',
  7: 'Tous les jours',
};

// --- La tête ------------------------------------------------------------------

// LA TÊTE NE PORTE PLUS DE DATE (2 septembre 2026, deux corrections de Noé) :
// d'abord « enlève le "posé le…", la donnée 1ère fois est plus intéressante » —
// la date où l'on a TAPÉ une habitude ne dit rien, on peut la poser un dimanche
// soir et ne commencer que trois semaines plus tard —, puis « remets la 1ère
// fois à la place qu'elle était au début, en dessous des stats, en petit comme
// dernière fois ».
//
// Elle est donc redescendue dans la ligne de rythme, à côté de la dernière fois
// et de la moyenne : trois faits de même nature, à la même taille, sur la même
// ligne. En tête, elle pesait autant que le pourquoi de l'habitude.
function enTete(habitude, jour) {
  const service = [
    NOMS_CADENCE[habitude.cadence] ?? 'Sans cadence',
    FAMILLES_PERSO[habitude.famille] ?? '',
  ].filter(Boolean);

  return `
    <p class="projet-page-retour">
      <a href="#perso/habitudes">${SIGNE_RETOUR}<span>Toutes tes habitudes</span></a>
    </p>

    <header class="projet-page-tete" data-espace="perso">
      <h1>${signeHabitude(habitude)}${echapper(habitude.nom)}</h1>
      <p class="discret projet-page-service">${echapper(service.join(' · '))}</p>
      ${construireMenuDiscret('habitude', habitude.id, {
        ouvert: etat.menu === `habitude:${habitude.id}`,
        confirmation: etat.confirme === `habitude:${habitude.id}`,
        visible: true,
      })}

      ${habitude.pourquoi ? `<p class="cap-pourquoi">${echapper(habitude.pourquoi)}</p>` : ''}
    </header>`;
}

// --- LES CHIFFRES -------------------------------------------------------------
//
// Chacun est là pour ce qu'il DONNE ENVIE DE FAIRE, jamais pour ce qu'il
// reproche. Trois ne peuvent que monter ; le quatrième — ce qui reste à tenir
// cette semaine — est le seul qui parle du jour même, donc le seul sur lequel on
// puisse encore agir avant dimanche.
function chiffres(habitude, faits, jour) {
  const serie = serieDeLHabitude(habitude, faits, jour);
  const cumul = cumulDeLHabitude(habitude, faits);
  const affilee = joursDAffileeDeLHabitude(habitude, faits, jour);
  const taux = tauxDeLHabitude(habitude, faits, jour);

  // L'ÉCHELLE DE LA SÉRIE EN COURS (2 septembre 2026, règle de Noé) : « vert au
  // début, puis bleu après 3 jours, et jaune lorsque l'on est à 2 jours près de
  // la série max ».
  //
  // L'ORDRE DES TESTS EST LA RÈGLE. Le vert passe en premier, et ça règle tout
  // seul le cas idiot qu'un seuil aurait fallu écrire : au tout début, série et
  // record valent tous deux 1 — « à 2 près du record » serait vrai, et un jaune
  // « tu approches ton meilleur » sur une habitude d'un jour ne veut rien dire.
  // En dessous de trois, c'est vert, un point.
  //
  // AUCUN DE CES TROIS N'EST UN AVERTISSEMENT : ils marquent où l'on en est, pas
  // ce qui manque. Le hub n'a pas de couleur d'alerte, et il n'en aura pas ici.
  //
  // ET L'ÉGALITÉ PASSE AVANT TOUT (2 septembre 2026 : « lorsque série max et
  // série en cours sont égales, la même couleur », puis « un dégradé qui rend le
  // chiffre couleur or »). C'est le seul moment où les deux tuiles disent la même
  // chose ; leur donner la même encre, c'est le dire sans un mot — **on est à
  // son meilleur**, et c'est le seul endroit du hub où un chiffre brille.
  //
  // LA RÈGLE VIT DANS `rangDeLaSerie` (js/orientation.js) depuis que la colonne
  // du tableau de bord perso l'affiche aussi : deux copies d'une règle à seuils
  // finissent par ne plus colorer pareil, et ça ne se voit qu'à côté.
  const rang = rangDeLaSerie(serie);
  const aEgalite = rang === 'record';

  const uniteSerie = (valeur) =>
    serie?.unite === 'jour'
      ? valeur > 1
        ? 'jours tenus'
        : 'jour tenu'
      : valeur > 1
        ? 'semaines tenues'
        : 'semaine tenue';

  // LES DEUX SÉRIES, ET DEUX COULEURS (2 septembre 2026, demande de Noé, puis
  // trois corrections : « au lieu de "jours tenus" dis "série en cours", et au
  // lieu de "au mieux" dis "série max" ; la tuile ne doit pas être de couleur,
  // seulement le numéro, et ça ne doit pas être la même couleur entre les 2 » —
  // puis « n'utilise pas le violet »).
  //
  // LE RECORD ÉTAIT DÉJÀ CALCULÉ ET NE S'AFFICHAIT NULLE PART :
  // `serieDeLHabitude` le rend depuis le premier jour, sous le même réglage que
  // la série en cours — un jour manqué coûte UN, jamais tout. Il n'y avait rien
  // à recalculer, seulement à le montrer.
  //
  // LES MOTS DISENT CE QUE C'EST, pas ce qu'on compte. « 2 jours tenus » et « 2
  // au mieux » demandaient de deviner que la seconde était un record ; « série
  // en cours » et « série max » se lisent sans rien savoir. L'unité — jours ou
  // semaines — part dans la bulle, où elle ne coûte pas une ligne.
  //
  // ET LA COULEUR NE VIENT PAS DE LA FAMILLE. Elle en venait, au motif que
  // c'était déjà celle de sa jauge et de ses jours cochés ; mais deux tuiles
  // voisines de la même couleur ne se distinguent pas, et « calme » EST un
  // violet — que Noé a écarté. Les deux couleurs sont donc fixes, les mêmes sur
  // toutes les habitudes, et choisies pour ce qu'elles disent (voir le CSS).
  const cases = [
    habitude.cadence && serie
      ? [
          `${serie.cetteSemaine ?? 0}<span class="hab-stat-sur">/${habitude.cadence}</span>`,
          'cette semaine',
          null,
          null,
        ]
      : null,
    serie && serie.semaines
      ? [
          // LA FLAMME SUIT LE CHIFFRE, et elle ne dit pas la même chose que lui :
          // la série peut valoir sept avec deux trous dedans — c'est tout
          // l'intérêt du recul d'un cran —, la flamme dit CINQ JOURS SANS TROU.
          // Deux mesures, deux signes : l'une protège, l'autre récompense.
          `${serie.semaines}${
            affilee >= FLAMME_JOURS
              ? `<span class="hab-flamme" title="${echapper(
                  `${affilee} jours d'affilée`,
                )}">${FLAMME}</span>`
              : ''
          }`,
          'série en cours',
          `${serie.semaines} ${uniteSerie(serie.semaines)}. Un ${
            serie.unite === 'jour' ? 'jour' : 'semaine'
          } manqué la fait reculer d'un cran, jamais tomber à zéro.${
            affilee >= FLAMME_JOURS ? ` Et ${affilee} jours d'affilée, sans un trou.` : ''
          }`,
          rang,
        ]
      : null,
    // LE RECORD NE S'AFFICHE PAS À ZÉRO, comme la série : « 0 au mieux » sur une
    // habitude neuve est la première chose qu'on lirait, et c'est un constat
    // d'échec pour une information nulle.
    serie && serie.record
      ? [
          serie.record,
          // PAS DE « TU Y ES » (2 septembre 2026, correction de Noé : « c'est les
          // couleurs qui me le disent »). L'or des deux chiffres dit déjà
          // l'égalité, et un mot qui redit ce qu'une couleur montre est un mot
          // de trop — il ne s'affiche que là où la couleur ne va pas, dans la
          // bulle et pour le lecteur d'écran.
          'série max',
          `${serie.record} ${uniteSerie(serie.record)}${
            serie.record === serie.semaines ? ' — et tu y es en ce moment.' : '.'
          }`,
          aEgalite ? 'record' : 'max',
        ]
      : null,
    // CE QUI A ÉTÉ FAIT, PAS CE QUI RESTE (2 septembre 2026, correction de Noé :
    // « plutôt que "8 avant 10", montre ce que j'ai fait, donc 2/10 »).
    //
    // Et c'est la philosophie n° 1 du hub, appliquée là où je l'avais oubliée :
    // *« le dashboard est d'abord un miroir de ce qui a été accompli, pas une
    // liste de ce qui reste »*. « 8 avant 10 » comptait un manque ; « 2/10 »
    // compte un acquis, et dit le palier au passage.
    //
    // LES DEUX TUILES N'EN FONT PLUS QU'UNE : le total EST le numérateur, et
    // l'afficher à côté aurait écrit deux fois le même chiffre. Une fois tous
    // les paliers franchis, il n'y a plus de dénominateur — reste le total seul.
    // LE POURCENTAGE DE FOIS COMPLÉTÉES (2 septembre 2026, demande de Noé), la
    // première pratique servant de référence. Voir `tauxDeLHabitude` — c'est le
    // SEUL chiffre de la page qui compte un manque, et le CLAUDE.md l'interdisait
    // jusqu'à ce que Noé le redemande : il vit ici parce qu'il est un parmi cinq,
    // à côté de quatre qui ne peuvent que monter.
    taux
      ? [
          `${Math.round(taux.part * 100)}<span class="hab-stat-sur">%</span>`,
          'complétée',
          `${taux.faites} fois sur ${taux.attendu} attendues, depuis la première le ${jourLong(
            taux.depuis,
          )}.`,
          null,
        ]
      : null,
    cumul.total
      ? cumul.prochain
        ? [
            `${cumul.total}<span class="hab-stat-sur">/${cumul.prochain}</span>`,
            'vers le palier',
            null,
            null,
          ]
        : [cumul.total, 'depuis le début', null, null]
      : null,
  ].filter(Boolean);

  return `
    <div class="hab-stats">${cases
      .map(
        ([chiffre, mot, phrase, serieDe]) => `
      <div class="hab-stat"${serieDe ? ` data-serie="${serieDe}"` : ''}
        ${phrase ? `title="${echapper(phrase)}"` : ''}>
        <span class="hab-stat-chiffre chiffre">${chiffre}</span>
        <span class="hab-stat-mot">${echapper(mot)}</span>
      </div>`,
      )
      .join('')}</div>`;
}

// CE QUE LE RYTHME RACONTE, en trois lignes d'encre discrète : la première fois,
// la dernière, et la moyenne. La MOYENNE se compte depuis la première pratique
// et non depuis la naissance de l'habitude : les semaines d'avant le premier
// jour ne sont pas des semaines ratées, ce sont des semaines où elle n'existait
// pas encore.
function rythme(habitude, faits, jour) {
  const siens = faits
    .filter((fait) => fait.habitude_id === habitude.id)
    .map((fait) => fait.jour)
    .sort();
  if (!siens.length) return '';

  const derniere = siens[siens.length - 1];
  const semaines = Math.max(1, Math.round((joursDEcart(depuisDateISO(siens[0]), jour) * -1) / 7));
  const moyenne = (siens.length / semaines).toFixed(1).replace('.', ',').replace(',0', '');

  const lignes = [
    `Première fois le ${jourLong(siens[0])}`,
    `Dernière fois ${ilYA(derniere, jour)}`,
    `${moyenne} par semaine en moyenne`,
  ];

  return `<p class="discret hab-page-rythme">${echapper(lignes.join(' · '))}</p>`;
}

// LES PALIERS, ET CEUX QUI SONT FRANCHIS. C'est le seul endroit du hub où on les
// voit tous : ailleurs on ne lit que le prochain. Ils ne redescendent jamais —
// c'est tout leur intérêt.
function paliers(habitude, faits) {
  const { total } = cumulDeLHabitude(habitude, faits);
  return `
    <ul class="hab-page-paliers">
      ${PALIERS_HABITUDE.map(
        (palier) => `
        <li class="${total >= palier ? 'franchi' : ''}"
          aria-label="${palier} fois — ${total >= palier ? 'franchi' : 'à venir'}">
          <span class="chiffre">${palier}</span>
        </li>`,
      ).join('')}
    </ul>`;
}

// --- LE CALENDRIER DES FAITS ---------------------------------------------------
//
// « Un calendrier qui permet de voir quand l'habitude a été faite ou non (vue
// mois, 3 mois) » (Noé). C'est la grille compacte du trimestre — un mois ou
// trois, collés dans un seul cadre —, mais la case ne porte plus des points :
// elle est PLEINE ou vide.
//
// ET ELLE SE COCHE. Un calendrier de coches qu'on ne pourrait pas corriger
// serait une frustration à chaque oubli, et le hub sait déjà rattraper un jour
// passé — c'est ce que fait la tuile d'une journée depuis le 1er septembre. La
// coche vaut pour CE jour-là : le bouton porte sa date.
//
// TROIS ÉTATS, ET AUCUN N'EST UN REPROCHE : faite (pleine), pas faite (vide),
// et hors de portée — avant qu'elle existe, ou après aujourd'hui. Les jours hors
// de portée ne se cochent pas : on ne tient pas une habitude avant de l'avoir
// posée, et on ne coche pas demain.
function calendrierDesFaits(habitude, faits, jour) {
  const faitsDuJour = new Set(
    faits.filter((fait) => fait.habitude_id === habitude.id).map((fait) => fait.jour),
  );
  const aujourdhui = versDateISO(jour);
  const naissance = habitude.created_at ? versDateISO(new Date(habitude.created_at)) : null;
  const couleur = TEINTES_FAMILLE[habitude.famille] ?? 'var(--accent)';

  // CE QU'UNE CASE SAIT D'ELLE-MÊME, dit une seule fois : les deux vues s'en
  // servent, et deux copies auraient fini par ne plus mettre le même jour hors
  // de portée.
  const etatDuJour = (jourGrille, moisRef) => {
    const cle = versDateISO(jourGrille);
    const sien = jourGrille.getMonth() === moisRef.getMonth();
    const fait = sien && faitsDuJour.has(cle);
    const portee = sien && cle <= aujourdhui && (!naissance || cle >= naissance);
    const quand = jourGrille.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return {
      cle,
      sien,
      fait,
      portee,
      quand,
      dit: `${quand} — ${fait ? 'faite' : 'pas faite'}`,
      // Ce qui se coche porte sa date et son état ; ce qui est hors de portée
      // n'est qu'une case, et n'annonce donc rien qu'on pourrait lui demander.
      gestes: portee
        ? `data-basculer-jour="${cle}" role="button" tabindex="0"
           title="${echapper(`${quand} — ${fait ? 'faite' : 'pas faite'}`)}"
           aria-pressed="${fait}"`
        : '',
    };
  };

  // LA VUE MOIS EST CELLE DU SITE, à la lettre (2 septembre 2026, demande de
  // Noé : « la vue mois doit prendre toute la largeur… comme les autres vues
  // mois utilisées sur le site, la même forme »).
  //
  // > *Ce que ça remplace.* Le mois empruntait la grille COMPACTE du trimestre,
  // > bornée à 24 rem pour que la case ne change pas de taille d'une vue à
  // > l'autre. Le motif se tenait, mais il faisait de la vue mois une chose que
  // > le hub n'a nulle part ailleurs — et une page qui a de la place n'a aucune
  // > raison de la laisser vide.
  //
  // Mêmes classes, même géométrie, mêmes en-têtes que `#calendrier` : les cases
  // font 7 rem, le numéro est en haut, la semaine est une ligne. Ce qui change
  // est le SEUL point que ce calendrier a à dire — la case est pleine ou vide.
  if (etat.vue === 'mois') {
    const jours = grilleDuMois(etat.ancre);
    const lignes = [];

    for (let debut = 0; debut < jours.length; debut += 7) {
      const semaine = jours.slice(debut, debut + 7);

      const fonds = semaine
        .map((jourGrille, rang) => {
          const { cle, sien, fait, portee, quand, dit, gestes } = etatDuJour(
            jourGrille,
            etat.ancre,
          );
          const classes = [
            'cal-jour',
            'hab-jour',
            sien ? '' : 'cal-hors-mois',
            fait ? 'hab-jour-fait' : '',
            portee ? '' : 'hab-jour-hors',
          ]
            .filter(Boolean)
            .join(' ');

          return `<div class="${classes}" ${gestes}
            ${cle < aujourdhui ? 'data-passe' : ''}
            aria-label="${echapper(portee ? dit : quand)}"
            style="grid-column: ${rang + 1};"></div>`;
        })
        .join('');

      const numeros = semaine
        .map((jourGrille, rang) => {
          const cle = versDateISO(jourGrille);
          const classes = [
            'cal-numero',
            cle === aujourdhui ? 'cal-numero-aujourdhui' : '',
            jourGrille.getMonth() === etat.ancre.getMonth() ? '' : 'cal-numero-hors-mois',
          ]
            .filter(Boolean)
            .join(' ');

          return `<span class="${classes}" style="grid-column: ${rang + 1}; grid-row: 1;"
            aria-hidden="true">${jourGrille.getDate()}</span>`;
        })
        .join('');

      // Deux rangs : le numéro, puis un rang souple qui étire les cases jusqu'en
      // bas. Sans rangs déclarés, le fond d'un jour ne s'étirerait sur rien —
      // c'est le même réglage que `ligneDeSemaine`, sans les couloirs de barres
      // qu'un calendrier d'habitude n'a pas.
      lignes.push(
        `<div class="cal-ligne" style="grid-template-rows: auto 1fr;">${fonds}${numeros}</div>`,
      );
    }

    return `<div class="cal-grille cal-mois hab-calendrier" data-mois="1"
      style="--teinte: ${couleur}" role="group"
      aria-label="${echapper(`Quand « ${habitude.nom} » a été faite`)}">
      <div class="cal-entetes" aria-hidden="true">
        ${JOURS_COURTS.map((nom) => `<span>${nom}</span>`).join('')}
      </div>
      ${lignes.join('')}
    </div>`;
  }

  const colonnes = moisDuTrimestre(etat.ancre)
    .map((debutMois) => {
      const cases = grilleDuMois(debutMois)
        .map((jourGrille) => {
          const { cle, sien, fait, portee, quand, dit, gestes } = etatDuJour(
            jourGrille,
            debutMois,
          );
          const classes = [
            'cal-jour',
            'cal-tri-jour',
            'hab-jour',
            sien ? '' : 'cal-hors-mois',
            fait ? 'hab-jour-fait' : '',
            portee ? '' : 'hab-jour-hors',
            cle === aujourdhui ? 'cal-aujourdhui' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return `<div class="${classes}" ${gestes}
            aria-label="${echapper(portee ? dit : quand)}">
            <span class="cal-tri-numero" aria-hidden="true">${jourGrille.getDate()}</span>
          </div>`;
        })
        .join('');

      return `
        <section class="cal-tri-mois" aria-label="${echapper(
          titreDePeriode(debutMois, 'mois'),
        )}">
          <p class="cal-tri-titre">${echapper(titreDePeriode(debutMois, 'mois'))}</p>
          <div class="cal-tri-grille">
            <div class="cal-tri-entetes" aria-hidden="true">
              ${JOURS_LETTRE.map((nom) => `<span>${nom}</span>`).join('')}
            </div>
            ${cases}
          </div>
        </section>`;
    })
    .join('');

  return `<div class="cal-grille cal-trimestre hab-calendrier" data-mois="3"
    style="--teinte: ${couleur}" role="group"
    aria-label="${echapper(`Quand « ${habitude.nom} » a été faite`)}">${colonnes}</div>`;
}

// --- L'écran -------------------------------------------------------------------

function laFenetre() {
  if (!etat.edition) return '';
  return construireFormulaire({
    id: 'habitude-page',
    libelle: FORMULAIRES.habitude.modifier,
    action: 'enregistrer-habitude',
    bouton: 'Enregistrer',
    champs: FORMULAIRES.habitude.champs(etat.habitude ?? {}),
    extra: `<input type="hidden" name="id" value="${echapper(etat.habitude?.id ?? '')}">`,
  });
}

function squelette() {
  if (etat.echec) {
    return `
      <h1>Habitude</h1>
      <p class="vide">Les données n'ont pas pu être chargées.
        <button type="button" class="lien-discret" data-action="reessayer">Réessayer</button></p>`;
  }

  const habitude = etat.habitude;
  if (!habitude) {
    return `
      <h1>Habitude</h1>
      <p class="vide">${
        etat.id ? "Cette habitude n'existe plus." : 'Aucune habitude choisie.'
      } <a href="#perso/habitudes">Voir toutes tes habitudes</a></p>`;
  }

  const jour = new Date();

  return `
    ${enTete(habitude, jour)}

    ${etat.message ? `<p class="discret message-regle">${echapper(etat.message)}</p>` : ''}

    <section class="bloc">
      <h2 class="hors-ecran">Où elle en est</h2>
      ${chiffres(habitude, etat.faits, jour)}
      ${rythme(habitude, etat.faits, jour)}
      ${sparkline(habitude, etat.faits, jour, { classe: 'hab-page-spark' })}
      <p class="discret hab-courbe-mot">${motDeLaSparkline(habitude)}</p>
      ${paliers(habitude, etat.faits)}
    </section>

    <section class="bloc hab-page-calendrier">
      <h2>Quand elle a été faite</h2>
      ${construireBarrePeriode(etat.vue, etat.ancre, { vues: ['mois', 'trimestre'] })}
      ${calendrierDesFaits(habitude, etat.faits, jour)}
      <p class="discret hab-courbe-mot">Touche un jour pour le cocher ou le décocher.</p>
    </section>

    <div class="cap-fenetre-hote">${laFenetre()}</div>`;
}

export default {
  async monter(section, route) {
    etat.id = route?.vue ?? null;

    const habiller = () => {
      if (!etat.habitude || section.hidden) return;
      document.title = `${etat.habitude.nom} — Hub`;
      // Une habitude est du PERSO, toujours : c'est sa couleur.
      document.body.dataset.espace = 'perso';
    };

    const rendre = () => {
      section.innerHTML = squelette();
      habiller();

      const fenetre = section.querySelector('.cap-fenetre-hote .ajout-volant');
      if (fenetre) {
        fenetre.open = true;
        fenetre.querySelector('input, textarea')?.focus();
      }
    };

    const signaler = (mot) => {
      etat.message = mot;
      rendre();
    };

    const charger = async () => {
      if (!etat.id) {
        etat.habitude = null;
        rendre();
        return;
      }

      try {
        const [habitudes, faits] = await Promise.all([
          api.habitudesToutes(),
          api.faitsDeLHabitude(etat.id),
        ]);
        etat.habitude = habitudes.find((habitude) => habitude.id === etat.id) ?? null;
        etat.faits = faits;
        etat.echec = false;
      } catch (erreur) {
        console.error("Chargement de l'habitude impossible", erreur);
        etat.echec = true;
      }

      rendre();
    };

    this.rafraichir = charger;

    this.naviguer = (nouvelle) => {
      const id = nouvelle?.vue ?? null;
      if (id === etat.id) return habiller();
      etat.id = id;
      etat.habitude = null;
      etat.faits = [];
      etat.menu = null;
      etat.confirme = null;
      etat.edition = null;
      etat.message = null;
      // L'ancre revient à aujourd'hui : on ouvre une autre habitude pour la
      // voir maintenant, pas là où on avait laissé la précédente.
      etat.ancre = new Date();
      rendre();
      charger();
    };

    rendre();
    await charger();

    // --- Les clics ---

    section.addEventListener('click', async (evenement) => {
      const dans = (nom) => evenement.target.closest(`[data-${nom}]`);

      if (evenement.target.closest('[data-action="reessayer"]')) {
        etat.echec = false;
        rendre();
        await charger();
        return;
      }

      if (evenement.target.closest('[data-fermer-ajout]')) {
        etat.edition = null;
        rendre();
        return;
      }
      if (evenement.target.closest('.ajout-volant')) return;
      if (evenement.target.closest('[data-ouvrir-choix], .choix-panneau')) return;

      // --- Le calendrier ---

      const jourCoche = dans('basculer-jour');
      if (jourCoche) return basculerJour(jourCoche.dataset.basculerJour);

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

      // --- Le menu discret ---

      const menuTouche = dans('menu');
      if (menuTouche) {
        etat.menu = etat.menu === menuTouche.dataset.menu ? null : menuTouche.dataset.menu;
        etat.confirme = null;
        rendre();
        return;
      }

      if (dans('modifier')) {
        etat.edition = true;
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

      if (dans('confirmer')) {
        etat.menu = null;
        etat.confirme = null;
        // LA PAGE N'A PLUS DE SUJET : on retourne à la liste.
        try {
          await api.supprimerHabitude(etat.habitude.id);
          location.hash = '#perso/habitudes';
        } catch (souci) {
          console.error('Habitude non supprimée', souci);
          signaler("Ça n'a pas pu être supprimé.");
        }
        return;
      }

      if (dans('annuler-confirmation')) {
        etat.confirme = null;
        rendre();
        return;
      }

      if (etat.menu || etat.confirme) {
        etat.menu = null;
        etat.confirme = null;
        rendre();
      }
    });

    // Entrée ou Espace sur une case atteinte au clavier la coche : le clavier ne
    // doit pas être un second jeu de règles.
    section.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && etat.edition) {
        etat.edition = null;
        rendre();
        return;
      }
      if (evenement.key !== 'Enter' && evenement.key !== ' ') return;
      const jourCoche = evenement.target.closest('[data-basculer-jour]');
      if (!jourCoche) return;
      evenement.preventDefault();
      basculerJour(jourCoche.dataset.basculerJour);
    });

    // --- Enregistrer ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="enregistrer-habitude"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        await api.modifierHabitude(champs.id, {
          nom: champs.nom.trim(),
          emoji: champs.emoji?.trim() || null,
          cadence: Number(champs.cadence) || null,
          famille: champs.famille || null,
          pourquoi: champs.pourquoi?.trim() || null,
        });
        etat.edition = null;
        await charger();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    // --- Cocher un jour ---
    //
    // L'écran d'abord, le réseau ensuite, comme partout : la case se remplit
    // tout de suite, et si l'écriture échoue on la vide en le disant.
    async function basculerJour(cle) {
      const habitude = etat.habitude;
      if (!habitude) return;

      const dejaFait = etat.faits.some(
        (fait) => fait.habitude_id === habitude.id && fait.jour === cle,
      );
      etat.message = null;

      if (dejaFait) {
        const fait = etat.faits.find(
          (candidat) => candidat.habitude_id === habitude.id && candidat.jour === cle,
        );
        return retirerAussitot(etat.faits, fait, () => api.demarquerHabitude(habitude.id, cle), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être enregistré — la coche est revenue."),
        });
      }

      const avant = [...etat.faits];
      etat.faits.push({ habitude_id: habitude.id, jour: cle });
      rendre();

      try {
        await api.marquerHabitude(habitude.id, cle);
      } catch (souci) {
        console.error('Habitude non cochée', souci);
        etat.faits.splice(0, etat.faits.length, ...avant);
        signaler("Ça n'a pas pu être enregistré — la coche est repartie.");
      }
    }
  },
};
