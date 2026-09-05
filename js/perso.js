// Espace perso — la vie hors espaces.
//
// Ce n'est PAS un espace comme les trois autres, et il n'utilise pas leur
// fabrique : aucune
// mécanique de productivité ne s'applique ici. Ni tâches, ni jalons, ni
// échéances, ni barres de progression, ni backlog, ni notion de retard. Jamais.
//
// Il contient : des intentions (des phrases sans mesure ni date, simplement
// relues), des rendez-vous avec soi-même, des victoires, et la courbe d'humeur
// des 30 derniers jours.

import * as api from './api.js';
// Ces fonctions ne portent aucune mécanique d'espace : ce sont des gabarits
// de tuiles et de formulaires, réutilisés tels quels.
import {
  construireFormulaire,
  brancherChoix,
  flammeDeSerie,
  SIGNES as SIGNE,
} from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
import {
  RAYONS,
  construireRayon,
  construireHall,
  champsDuFormulaire,
  valeursDuFormulaire,
  imageDe,
} from './bibliotheque.js';
import {
  etatDesHabitudes,
  PALIERS_HABITUDE,
  avanceeDuLivre,
  livreEnCours,
  relecture,
  bilanDesHabitudes,
  estQuotidienne,
  FLAMME_JOURS,
  rangDeLaSerie,
  historiqueDeLHabitude,
  historiqueQuotidienDeLHabitude,
  JOURS_REGARDES,
  SEMAINES_REGARDEES,
} from './orientation.js';
import {
  versDateISO,
  ajouterJours,
  depuisDateISO,
  echapper,
  momentLisible,
  NOMS_ESPACES,
  ORDRE_ESPACES,
  FAMILLES_PERSO,
  FAMILLES_PERSO_CHOIX,
} from './format.js';

const ESPACE = 'perso';

const FRIMOUSSES = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

// L'état de l'écran, hors des données : ce qui est déplié, ce qui attend une
// confirmation, ce que la tuile volante corrige. Même trio que dans
// `#objectifs` — un écran du hub se tient de la même façon partout.
// `jour` : la journée qu'on regarde. Elle vient de l'adresse
// (`#perso/journee/2026-08-29`) pour qu'un jour précis se retrouve et se
// partage — un favori sur une journée doit rouvrir cette journée-là.
// `habitude` a disparu le 30 août 2026 : il portait l'habitude DÉPLIÉE, et la
// page n'a plus de pli — chaque carte montre son histoire (voir
// `construireHabitudes`).
const vueEtat = {
  menu: null,
  confirme: null,
  edition: null,
  jour: null,
  // LE CALENDRIER DES JOURNÉES (1er septembre 2026) : sa vue et le mois — ou la
  // semaine — qu'il montre. Le mois par défaut : c'est la vue qui donne le plus
  // à voir d'un coup, et c'est pour voir qu'on ouvre cette page.
  joursVue: 'mois',
  joursPivot: null,
  // LA BIBLIOTHÈQUE A DEUX ENTRÉES depuis le 5 septembre 2026 — les livres, les
  // films et séries — et chacune tient SON réglage. Une note ou un genre coché
  // d'un côté n'a aucun sens de l'autre : partager l'état aurait fait revenir
  // sur les livres un filtre « Drame » posé sur les films.
  rayon: 'livres',
  rayons: {
    // `affichage` : l'étagère par défaut — on ouvre cette page pour VOIR, pas
    // pour chercher. La liste s'atteint d'un geste quand on vient avec un nom en
    // tête.
    //
    // `filtres` : un TABLEAU par critère — on coche plusieurs valeurs (« les 5
    // étoiles ET les 4 »), et un critère vide ne filtre rien.
    //
    // `ouverts` : la rangée des critères est REPLIÉE par défaut.
    // `chip` : le critère dont le panneau est ouvert, un seul à la fois.
    // `cellule` : la cellule dont le menu est ouvert dans la vue liste.
    livres: {
      affichage: 'etagere',
      filtres: { mot: '', statut: [], mots: [], note: [] },
      ouverts: false,
      chip: null,
      tri: { cle: 'defaut', sens: 1 },
      cellule: null,
    },
    films: {
      affichage: 'etagere',
      filtres: { mot: '', statut: [], mots: [], note: [], nature: [] },
      ouverts: false,
      chip: null,
      tri: { cle: 'defaut', sens: 1 },
      cellule: null,
    },
  },
};

// Le réglage d'écran du rayon qu'on regarde.
// LE RAYON D'UNE FORME : « livre » ou « film ». Le hall montre les deux, si bien
// qu'une carte n'appartient pas forcément au rayon qu'on regarde — s'y fier
// aurait modifié un livre en croyant modifier un film.
const rayonDeLaForme = (forme) =>
  Object.values(RAYONS).find((R) => R.forme === forme) ?? null;
const vueDuRayon = () => vueEtat.rayons[vueEtat.rayon];

// --- Fabrication du HTML ----------------------------------------------------

// LE MENU DISCRET, celui de toute la page du cap : trois points qui ne se
// voient qu'au survol et au clavier, et qui gardent leurs 44 px de cible au
// doigt. Ce qui est irréversible demande confirmation SUR PLACE.
//
// Il remplace une croix nue qui supprimait au premier appui. Une intention est
// une phrase qu'on a mis du temps à écrire — elle mérite le second appui, et
// surtout elle mérite de pouvoir se CORRIGER, ce que la croix ne permettait
// pas : on ne pouvait que la jeter et la réécrire.
function menuDiscret(forme, id, { sansModifier = false } = {}) {
  const cle = `${forme}:${id}`;
  const confirmation = vueEtat.confirme === cle;

  // Un rendez-vous et une victoire ne se corrigent PAS ici : une date mal posée
  // se répare au calendrier, où toutes les dates du hub se réparent, et une
  // victoire est un fait — on la retire ou on la garde. Seule l'intention, qui
  // est une phrase qu'on affine, mérite son « Modifier ».
  const choix = confirmation
    ? `<button type="button" class="cap-menu-danger" data-confirmer="${cle}">Retirer vraiment</button>
       <button type="button" data-annuler-confirmation>Annuler</button>`
    : `${sansModifier ? '' : `<button type="button" data-modifier="${cle}">Modifier</button>`}
       <button type="button" data-supprimer="${cle}">Retirer</button>`;

  return `
    <span class="cap-menu${vueEtat.menu === cle ? ' ouvert' : ''}">
      <button type="button" class="cap-menu-bouton" data-menu="${cle}"
        aria-expanded="${vueEtat.menu === cle}" aria-label="Modifier ou retirer">${
        SIGNE.points
      }</button>
      <span class="cap-menu-choix" ${vueEtat.menu === cle ? '' : 'hidden'}>${choix}</span>
    </span>`;
}

// LES INTENTIONS EN GALERIE (29 août 2026, refonte demandée par Noé : « la
// forme qui correspond à comment a évolué le site »).
//
// LE PRINCIPE DE TOUTE LA PAGE : perso emprunte la GRAMMAIRE des écrans
// récents — la galerie de tuiles comparables, le titre en Clash Display, le
// menu discret, la tuile volante, l'affichage optimiste — et refuse leur
// MESURE. Pas de jauge, pas de marches, pas de pointillé, pas de pastille
// d'état, pas de compte, pas de date. C'est exactement là que la parenté
// s'arrête, et la forme doit le dire d'elle-même : une tuile d'intention est
// une tuile de cap à qui l'on a retiré tout ce qui mesure.
//
// LE POURQUOI RESTE VISIBLE, il ne se déplie pas. Un cap cache le sien parce
// qu'on vient y lire une avancée ; une intention n'a que ça à donner, et la
// philosophie dit qu'elle se relit les jours sans motivation. La cacher
// derrière un geste serait un contresens.
export function construireIntentions(intentions) {
  const ajout = `
    <button type="button" class="cap-tuile cap-tuile-ajout" data-ajout="intention">
      ${SIGNE.plus}<span>Écrire une intention</span></button>`;

  if (!intentions.length) {
    return `
      <p class="vide">Tes intentions s'écriront ici. Une phrase suffit.</p>
      <div class="perso-galerie">${ajout}</div>`;
  }

  // Pas de case à cocher, pas d'état, pas de date : une intention se relit,
  // elle ne se « termine » pas.
  return `
    <div class="perso-galerie">
      ${intentions
        .map(
          (intention) => `
        <article class="intention-tuile">
          <h3 class="intention-titre">${echapper(intention.titre)}</h3>
          ${
            intention.pourquoi
              ? `<p class="intention-pourquoi">${echapper(intention.pourquoi)}</p>`
              : ''
          }
          ${menuDiscret('intention', intention.id)}
        </article>`,
        )
        .join('')}
      ${ajout}
    </div>`;
}

// LES HABITUDES (29 août 2026, demande de Noé) — et la forme est le sujet, pas
// un détail : « propose-moi des stats qui me donnent envie de les faire comme
// si j'étais dans un jeu, mais en restant sain pour que ça ne s'écroule pas à
// la première fois que j'en saute une. »
//
// Une première maquette montrait sept points gris — les sept derniers jours. Il
// l'a écartée d'une phrase : « ça ne me donne pas envie de les faire ». Elle
// DÉCRIVAIT sans rien mettre en jeu. Ce qui est affiché ici est donc choisi
// pour donner envie, et chacune des trois mesures est incapable de s'effondrer
// (voir js/orientation.js) :
//
//   l'ÉLAN     le chiffre de tête, 0 à 100, et une jauge en dix crans
//   la SÉRIE   en SEMAINES tenues, avec le record à côté — définitivement acquis
//   le CUMUL   et surtout le PROCHAIN PALIER, un objectif proche qu'on ne peut
//              pas se faire reprendre
//
// L'habitude ouverte montre tout ; les autres tiennent en une ligne. Sans ce
// pli, cinq habitudes feraient un tableau de bord, et un tableau de bord ne
// donne envie de rien.
// Le même helper que dans js/objectifs.js. Il n'est pas importé de là : cet
// écran-ci n'a aucune raison de dépendre de la page du cap, et trois lignes
// valent mieux qu'un lien entre deux espaces qui n'ont rien à voir.
function pluriel(nombre, singulier, plurielMot = `${singulier}s`) {
  return `${nombre} ${nombre > 1 ? plurielMot : singulier}`;
}

export const TEINTES_FAMILLE = {
  corps: 'var(--famille-corps)',
  calme: 'var(--famille-calme)',
  lien: 'var(--famille-lien)',
  intendance: 'var(--famille-intendance)',
};

// L'ÉMOJI DEVANT LE NOM, et non à sa place (30 août 2026). Sur le TABLEAU DE
// BORD perso, la bande de jetons remplace le nom par l'émoji : on y reconnaît
// d'un coup d'œil ce qu'on coche. Ici, dans la page où l'on GÈRE ses habitudes,
// les mots restent nécessaires — on vient y lire une cadence, un pourquoi, un
// palier. L'émoji précède donc le nom au lieu de l'effacer.
export function signeHabitude(habitude) {
  const emoji = (habitude.emoji ?? '').trim();
  return emoji
    ? `<span class="habitude-signe" aria-hidden="true">${echapper(emoji)}</span>`
    : '';
}



// --- LA PAGE DES HABITUDES : un tableau de bord, enfin -------------------------
//
// Demande de Noé (30 août 2026) : « revois la forme d'affichage des habitudes,
// et il faut qu'il y ait des stats globales, des graphiques d'évolution ».
//
// CE QUE ÇA RENVERSE, ET IL FAUT LE DIRE. Cette page avait un PLI : une habitude
// ouverte montrait tout, les autres tenaient en une ligne, « sans ce pli, cinq
// habitudes feraient un tableau de bord, et un tableau de bord ne donne envie
// de rien ». La règle était juste tant que la page ne portait que des chiffres
// nus. Noé demande maintenant des stats et des courbes : il VEUT ce tableau de
// bord. Le pli disparaît donc, et chaque habitude montre son histoire.
//
// LA CONTRAINTE QUI TIENT TOUJOURS, elle : aucune de ces mesures ne compte un
// manque. Une première maquette montrait les sept derniers jours en points gris
// et Noé l'a écartée — « ça ne me donne pas envie de les faire ». Ici, une
// semaine sans pratique est une barre courte, jamais une alerte ; il n'y a ni
// rouge, ni taux de réussite, ni jour manqué. Ce qu'on dessine, c'est ce qui a
// été fait.

// La hauteur d'une barre, en pourcentage de la plus haute de la période. Un
// plancher à 6 % pour qu'une semaine vide reste VISIBLE : une barre de hauteur
// nulle disparaîtrait, et la courbe aurait des trous là où elle doit avoir des
// creux.
export function hauteurBarre(total, plafond) {
  return total === 0 ? 6 : Math.max(12, Math.round((total / plafond) * 100));
}

// LE GRAPHIQUE GLOBAL : une barre par semaine, douze semaines. La semaine en
// cours se distingue — elle n'est pas finie, et la comparer aux autres sans le
// dire serait une fausse baisse tous les lundis.
function courbeDesSemaines(bilan) {
  const barres = bilan.parSemaine
    .map((semaine) => {
      const jour = depuisDateISO(semaine.lundi);
      const mois = jour.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      return `<i class="${semaine.enCours ? 'en-cours' : ''}"
        style="height:${hauteurBarre(semaine.total, bilan.plafond)}%"
        title="semaine du ${mois} — ${semaine.total} ${
          semaine.total > 1 ? 'pratiques' : 'pratique'
        }"></i>`;
    })
    .join('');

  return `
    <div class="hab-courbe" role="img"
      aria-label="Pratiques des ${SEMAINES_REGARDEES} dernières semaines">${barres}</div>`;
}

// LA SPARKLINE D'UNE HABITUDE, dans sa couleur de famille. Ce qui est TENU est
// plein, ce qui est entamé est en creux — c'est la seule distinction, et elle ne
// dit jamais « raté », seulement « tenu ».
//
// SA MAILLE SUIT L'UNITÉ QUE L'HABITUDE COMPTE (2 septembre 2026, demande de
// Noé : « pour les séries journalières, le graphique doit être par jour et non
// par semaine, montre les 14 derniers jours »). Une quotidienne se compte en
// JOURS depuis le 30 août — sa série, son recul d'un cran — et son graphique
// restait hebdomadaire : il montrait « 7 sur 7 » douze fois de suite, douze
// barres pleines qui ne disaient plus rien.
//
// LE PLUS RÉCENT À GAUCHE (même jour, correction de Noé : « avec le dernier jour
// qui s'affiche à gauche, actuellement c'est à droite »). C'est le sens de
// lecture de tout le reste du hub — ce qui vient d'arriver ouvre la ligne, les
// victoires du « chemin » comme les tâches faites d'un projet.
//
// UNE SEULE FONCTION POUR LES DEUX ÉCRANS : la carte des habitudes et la page
// d'une habitude dessinaient la même chose chacune de son côté. Deux copies
// auraient fini par ne plus lire dans le même sens — ce qui a failli arriver le
// jour même.
export function sparkline(habitude, faits, jour, { classe = '' } = {}) {
  const quotidienne = estQuotidienne(habitude);
  const histoire = (quotidienne
    ? historiqueQuotidienDeLHabitude(habitude, faits, jour)
    : historiqueDeLHabitude(habitude, faits, jour)
  ).slice().reverse();
  const plafond = Math.max(1, ...histoire.map((pas) => pas.total));

  const nomme = (pas) =>
    quotidienne
      ? `${depuisDateISO(pas.jour).toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })} — ${pas.fait ? 'faite' : 'pas faite'}`
      : `${pas.total} cette semaine-là`;

  return `
    <div class="hab-spark ${classe}" role="img"
      aria-label="${
        quotidienne
          ? `${JOURS_REGARDES} derniers jours, le plus récent à gauche`
          : `${SEMAINES_REGARDEES} dernières semaines, la plus récente à gauche`
      }">${histoire
      .map((pas) => {
        const classes = [pas.tenue ? 'tenue' : '', pas.enCours ? 'en-cours' : '']
          .filter(Boolean)
          .join(' ');
        return `<i class="${classes}" style="height:${hauteurBarre(pas.total, plafond)}%"
          title="${echapper(nomme(pas))}"></i>`;
      })
      .join('')}</div>`;
}

// Ce que la sparkline dit d'elle-même, sous elle. Les deux écrans l'écrivent, et
// il n'y a qu'une phrase par maille.
export function motDeLaSparkline(habitude) {
  return estQuotidienne(habitude)
    ? `Les ${JOURS_REGARDES} derniers jours, d'aujourd'hui à il y a deux semaines.
       Un jour fait est plein.`
    : `Les ${SEMAINES_REGARDEES} dernières semaines, de la plus récente à la plus
       ancienne. Une semaine tenue est pleine.`;
}

// LES QUATRE CHIFFRES DU HAUT. Aucun ne peut baisser à cause d'un oubli : trois
// ne font que monter, et le quatrième — ce qui reste à tenir cette semaine —
// est le seul qui parle du jour même, donc le seul sur lequel on peut encore
// agir avant dimanche.
function statsGlobales(bilan) {
  const cases = [
    bilan.avecCadence
      ? [`${bilan.tenues}<span class="hab-stat-sur">/${bilan.avecCadence}</span>`, 'tenues cette semaine']
      : null,
    [bilan.pratiquesCetteSemaine, 'fois cette semaine'],
    bilan.meilleureSerie
      ? [
          bilan.meilleureSerie.valeur,
          `${
            bilan.meilleureSerie.unite === 'jour'
              ? bilan.meilleureSerie.valeur > 1 ? 'jours' : 'jour'
              : bilan.meilleureSerie.valeur > 1 ? 'semaines' : 'semaine'
          } — ${echapper(bilan.meilleureSerie.emoji || bilan.meilleureSerie.nom)}`,
        ]
      : null,
    [bilan.cumul, 'depuis le début'],
  ].filter(Boolean);

  return `
    <div class="hab-stats">${cases
      .map(
        ([chiffre, mot]) => `
      <div class="hab-stat">
        <span class="hab-stat-chiffre chiffre">${chiffre}</span>
        <span class="hab-stat-mot">${mot}</span>
      </div>`,
      )
      .join('')}</div>`;
}

// La carte d'une habitude : tout ce qu'elle a à dire, sans pli.
function carteHabitude({ habitude, serie, cumul, faitAujourdhui }) {
  const couleur = TEINTES_FAMILLE[habitude.famille] ?? 'var(--accent)';

  // L'ordre des mesures suit ce qu'elles engagent : la semaine d'abord (elle
  // peut encore bouger), la série ensuite (ce qu'on ne veut pas perdre), le
  // cumul enfin (il ne bouge jamais à la baisse).
  // DEUX OU TROIS CHIFFRES, ET LES MOTS DE LA PAGE (2 septembre 2026, demande de
  // Noé : « sur cet affichage il doit donc y avoir moins d'infos, seulement
  // l'essentiel, avec le voc qu'on a corrigé »).
  //
  // La carte COMPARE, la page dit tout. Ce qui reste ici est ce qu'on regarde
  // avant de cocher ; le reste est à un clic, sur `#habitude/<id>`.
  const chiffres = [
    // Une QUOTIDIENNE ne dit pas sa semaine : le rond, à trois centimètres de
    // là, dit déjà si elle est faite aujourd'hui — et « pas encore aujourd'hui »
    // comptait un manque, ce que le hub ne fait pas. Les hebdomadaires le
    // gardent : leur rond ne peut pas dire « 2 sur 3 ».
    !habitude.cadence || estQuotidienne(habitude)
      ? null
      : `<b>${serie?.cetteSemaine ?? 0}</b>/${habitude.cadence} cette semaine`,
    // LE MOT DE LA PAGE : « série en cours », pas « jours tenus » — ce dernier
    // demandait de deviner de quoi on parlait, et il n'y a pas de raison qu'une
    // même mesure change de nom d'un écran à l'autre. L'unité part dans la
    // bulle, où elle ne coûte pas de place.
    serie && serie.semaines
      ? `<b>${serie.semaines}</b> série en cours`
      : null,
    // CE QUI A ÉTÉ FAIT, PAS CE QUI RESTE — la règle de la page, appliquée ici
    // le même jour : « encore 8 avant 10 » comptait un manque et prenait deux
    // items pour ce qu'un seul dit. Le total EST le numérateur.
    cumul?.prochain
      ? `<b>${cumul.total}</b>/${cumul.prochain} vers le palier`
      : cumul?.total
        ? `<b>${cumul.total}</b> au total`
        : null,
  ].filter(Boolean);

  return `
    <article class="hab-carte" data-habitude="${echapper(habitude.id)}"
      style="--teinte: ${couleur}">
      <div class="hab-carte-tete">
        <button type="button" class="hab-rond${faitAujourdhui ? ' faite' : ''}"
          data-faire="${echapper(habitude.id)}" aria-pressed="${faitAujourdhui}"
          aria-label="${faitAujourdhui ? 'Revenir sur' : 'Marquer'} « ${echapper(
            habitude.nom,
          )} »"></button>
        <!-- LE NOM EST UNE PORTE (2 septembre 2026) : la carte compare, la page
             dit tout — depuis quand l'habitude existe, ses paliers, son rythme,
             et le calendrier de ce qui a été fait. La carte reste : c'est un
             tableau de bord, pas un index. -->
        <a class="hab-carte-nom" href="#habitude/${encodeURIComponent(habitude.id)}">
          ${signeHabitude(habitude)}${echapper(habitude.nom)}
        </a>
        ${
          // L'ÉLAN A QUITTÉ LE HUB (2 septembre 2026, décision de Noé, en deux
          // temps : « supprime les petits ronds et en sommeil » sur la page
          // d'une habitude, puis « enlève alors en sommeil et les petits
          // points » ici). Il ne reste que le cas où il n'y a rien à mesurer —
          // une habitude sans cadence —, qui n'est pas un élan mais un réglage
          // qui manque, et qu'il faut pouvoir voir pour le corriger.
          habitude.cadence
            ? ''
            : '<span class="hab-carte-elan discret">sans cadence</span>'
        }
        ${menuDiscret('habitude', habitude.id)}
      </div>

      <!-- PAS DE GRAPHIQUE ICI (2 septembre 2026, demande de Noé). La sparkline
           répond à « comment ça a évolué » — une question qu'on se pose sur UNE
           habitude, pas sur neuf d'affilée. Elle vit sur sa page, où elle a la
           place de se lire ; ici elle prenait deux hauteurs de texte par carte,
           sa légende comprise, pour douze barres de 3 px. -->
      <p class="hab-carte-chiffres">${chiffres.join(' · ')}</p>
      ${habitude.pourquoi ? `<p class="hab-carte-pourquoi">${echapper(habitude.pourquoi)}</p>` : ''}
    </article>`;
}

export function construireHabitudes(etats, donnees = {}) {
  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="habitude">
      ${SIGNE.plus}<span>Poser une habitude</span></button>`;

  if (!etats.length) {
    return `
      <p class="vide">Tes habitudes s'écriront ici. Commence par une seule.</p>
      ${ajout}`;
  }

  const jour = new Date();
  const faits = donnees.faits ?? [];
  const bilan = bilanDesHabitudes(
    { habitudes: donnees.habitudes ?? etats.map((etat) => etat.habitude), faits },
    jour,
  );

  // TROIS GROUPES, ET NON UNE SEULE LISTE (30 août 2026, demande de Noé : « il
  // faut simplement séparer les habitudes journalières et les habitudes
  // hebdo »). Elles ne se comptent plus dans la même unité — des jours d'un
  // côté, des semaines de l'autre —, donc les aligner sans le dire ferait lire
  // « 25 » et « 9 » comme deux valeurs comparables. Elles ne le sont pas.
  //
  // Le troisième groupe est celui qui ne se compte pas du tout : « quand ça
  // vient » n'a ni cadence, ni série, ni élan. Il ferme la page, en retrait —
  // c'est ce qu'on note sans se l'imposer.
  const groupes = [
    ['Tous les jours', etats.filter((etat) => estQuotidienne(etat.habitude))],
    [
      'Chaque semaine',
      etats.filter((etat) => etat.habitude.cadence && !estQuotidienne(etat.habitude)),
    ],
    // PLUS DE GROUPE « QUAND ÇA VIENT » : l'option n'existe plus. Mais les
    // habitudes qui portent encore cette valeur ne disparaissent pas de
    // l'écran — les cacher les rendrait impossibles à corriger, ce qui est le
    // pire des deux maux. Elles attendent leur cadence, et le disent.
    ['À régler', etats.filter((etat) => !etat.habitude.cadence)],
  ].filter(([, lot]) => lot.length);

  return `
    ${statsGlobales(bilan)}
    ${courbeDesSemaines(bilan)}
    <p class="hab-courbe-mot discret">Les ${SEMAINES_REGARDEES} dernières semaines,
      toutes habitudes confondues.</p>

    ${groupes
      .map(
        ([titre, lot]) => `
      <h3 class="hab-groupe">${titre} <span class="chiffre">${lot.length}</span></h3>
      ${
        titre === 'À régler'
          ? `<p class="hab-groupe-mot discret">Sans cadence, il n’y a rien à tenir :
               donne-leur un rythme par « Modifier ».</p>`
          : ''
      }
      <div class="hab-cartes">
        ${lot.map((etat) => carteHabitude(etat)).join('')}
      </div>`,
      )
      .join('')}
    ${ajout}`;
}

export function construireHabitudesDuJour(etats = []) {
  if (!etats.length) return '';

  const ligne = ({ habitude, serie, affilee, faitAujourdhui }) => {
      const emoji = (habitude.emoji ?? '').trim();

      // LES DEUX SÉRIES, ET LE CODE COULEUR (2 septembre 2026, demande de Noé :
      // « les stats présentes doivent être série en cours et série max, avec le
      // code couleur »).
      //
      // CE QUE ÇA REMPLACE : les points de la semaine et le chiffre du prochain
      // palier — les deux mesures posées le 30 août. Le motif d'alors tient
      // toujours (« deux mesures, et pas trois »), c'est le CHOIX des deux qui
      // change : une série est ce qu'on ne veut pas perdre, et c'est ce qui fait
      // cocher un soir où l'on n'en a pas envie. Un palier à dix jours de là ne
      // pousse personne.
      //
      // LES MOTS SONT CEUX DE SA PAGE, et la couleur aussi (`rangDeLaSerie`,
      // js/orientation.js) — une même mesure ne change ni de nom ni de teinte
      // d'un écran à l'autre. Ici il n'y a la place ni pour les mots ni pour la
      // flamme : ils partent dans la bulle et le nom accessible, la parade de
      // cette ligne depuis le premier jour.
      const rang = rangDeLaSerie(serie);
      const unite = serie?.unite === 'jour' ? 'jours' : 'semaines';

      // LES DEUX CHIFFRES SONT TOUJOURS LÀ, ZÉRO COMPRIS (2 septembre 2026, deux
      // corrections de Noé : « je ne vois pas la série max là », et « si la
      // série en cours est 0 mets 0 »).
      //
      // Ce sont DEUX RÈGLES qui tombent, et il a raison sur les deux :
      //   — le record se taisait quand il égalait la série, au motif que l'or
      //     disait déjà l'égalité. Mais on ne lit pas une couleur qu'on n'a pas
      //     encore apprise, et **une colonne vide ne se lit pas comme « c'est
      //     pareil », elle se lit comme « il n'y a rien »** ;
      //   — « une série à zéro ne s'affiche pas » datait du 30 août et
      //     protégeait une habitude neuve d'un « 0 » en guise d'accueil. Dans
      //     DEUX COLONNES ALIGNÉES, la case vide était pire : elle décalait le
      //     regard, et on ne savait plus lequel des deux chiffres manquait.
      //
      // Un zéro dans une colonne qui en compte une autre n'est pas un reproche,
      // c'est une case remplie.
      // LA FLAMME SUIT LA SÉRIE EN COURS (2 septembre 2026, demande de Noé) — et
      // elle ne dit pas la même chose que le chiffre : la série RECULE d'un cran
      // quand un jour manque, donc « 7 » peut avoir deux trous dedans ; la
      // flamme, elle, dit CINQ JOURS SANS TROU. L'une protège, l'autre
      // récompense.
      //
      // Elle est dessinée et prend `currentColor`, donc la couleur du rang :
      // elle brûle en vert, en bleu, en jaune ou dans l'or de l'égalité. Même
      // dessin que sur la page d'une habitude (`flammeDeSerie`, js/gabarits.js)
      // — un feu de deux formes selon l'écran n'en serait plus un.
      const feu =
        affilee >= FLAMME_JOURS ? `<span class="hab-flamme">${flammeDeSerie(12)}</span>` : '';

      const mesure = (valeur, rangCouleur, mot, signe = '') =>
        `<span class="hab-mesure hab-serie" data-serie="${rangCouleur}"
           title="${mot} : ${valeur} ${unite}${
             signe ? ` — ${affilee} jours d'affilée, sans un trou` : ''
           }"
           aria-label="${mot} : ${valeur} ${unite}${
             signe ? `, ${affilee} jours d'affilée` : ''
           }">
           <span class="chiffre">${valeur}</span>${signe}
         </span>`;

      // À ÉGALITÉ, LES DEUX CHIFFRES SONT EN OR — la règle de la page d'une
      // habitude, où « les deux tuiles le prennent ». Sans ça, la même égalité
      // se lisait en or ici et en orange là : c'est exactement la divergence
      // qu'on vient d'éviter en sortant la règle de couleur dans l'orientation.
      const series =
        mesure(serie?.semaines ?? 0, rang, 'Série en cours', feu) +
        mesure(serie?.record ?? 0, rang === 'record' ? 'record' : 'max', 'Série max');

      // LE ROND EN PREMIER, TOUT À GAUCHE (demande de Noé, 30 août 2026). C'est
      // le geste qu'on vient faire : il se trouve sous le pouce dès qu'on ouvre
      // la page, et l'œil n'a pas à traverser la ligne pour l'atteindre. Le nom
      // et les mesures suivent — on les lit APRÈS avoir vu où cocher.
      return `
      <li class="hab-ligne${faitAujourdhui ? ' faite' : ''}"
        style="--teinte: var(--famille-${echapper(habitude.famille ?? 'intendance')})">
        <button type="button" class="hab-rond${faitAujourdhui ? ' faite' : ''}"
          data-faire-habitude="${echapper(habitude.id)}" aria-pressed="${faitAujourdhui}"
          aria-label="${faitAujourdhui ? 'Revenir sur' : 'Marquer'} « ${echapper(
            habitude.nom,
          )} »"></button>
        <span class="hab-titre">
          ${emoji ? `<span class="hab-emoji" aria-hidden="true">${echapper(emoji)}</span>` : ''}
          <span class="hab-nom">${echapper(habitude.nom)}</span>
        </span>
        ${series}
      </li>`;
  };

  // LES DEUX NATURES SE SÉPARENT ICI AUSSI (30 août 2026). Sur la page des
  // habitudes elles ont trois titres ; ici, où la place est comptée, un simple
  // filet suffit à dire que l'unité change — des jours au-dessus, des semaines
  // en dessous. Sans lui, deux séries incomparables se liraient en enfilade.
  const quotidiennes = etats.filter((etat) => estQuotidienne(etat.habitude));
  const autres = etats.filter((etat) => !estQuotidienne(etat.habitude));

  const lot = (liste, classe = '') =>
    liste.length
      ? `<ul class="hab-colonne ${classe}" role="group"
           aria-label="Tes habitudes">${liste.map(ligne).join('')}</ul>`
      : '';

  // Un seul groupe non vide : pas de filet, il ne séparerait rien.
  if (!quotidiennes.length || !autres.length) return lot([...quotidiennes, ...autres]);

  return lot(quotidiennes) + lot(autres, 'hab-colonne-suite');
}

// LE TABLEAU DE BORD PERSO (30 août 2026, demande de Noé) : « choisir ce qui
// doit rester dans la page perso et sous quelle forme — les critères sont un
// peu les mêmes que pour la page d'accueil, des données qui évoluent sur
// lesquelles on a une action à faire ».
//
// CE CRITÈRE TRIE TOUT, et il tranche dans les deux sens :
//
//   RESTENT   l'humeur (elle change chaque jour, elle se répond d'un doigt),
//             les habitudes du jour (elles se cochent), le livre en cours (des
//             pages se notent), le prochain rendez-vous, le mot du jour.
//   PARTENT   les intentions (rien n'y bouge, rien ne s'y coche — on les relit),
//             la bibliothèque entière, l'historique des journées, la courbe des
//             trente jours, la liste des victoires. Toutes ont leur page.
//
// C'est le même mouvement que l'accueil le 29 août, quand les objectifs l'ont
// quitté : ils avaient leur page à deux gestes, et l'accueil répond à « qu'est-ce
// que je fais maintenant », pas à « où je vais ». Les intentions sont le cap de
// perso — elles partent pour la même raison.
//
// MAIS UNE CHOSE LES SUIT : l'intention RELUE ferme la page, une seule, celle du
// jour. C'est ce qui distingue ce tableau de bord d'un second accueil — on vient
// ici pour se recentrer, et une phrase qu'on relit vaut mieux qu'une liste qu'on
// gère. Elle vient de `relecture` (js/orientation.js), la même qui ferme une
// journée.
function porte(adresse, mot) {
  return `<a class="perso-porte" href="${adresse}">${mot}</a>`;
}

export function construireTableauPerso(donnees) {
  const { humeurDuJour, etatsHabitudes = [], livre, seances = [], rendezVous = [], relue, mot, jour } =
    donnees;

  const avancee = livre ? avanceeDuLivre(livre, seances) : null;

  return `
    <div class="perso-tableau">
      <!-- LA QUESTION SE REDESSINE SEULE, et pas avec la tuile : celle-ci porte
           « Ce qui a compté aujourd'hui », un champ qui s'enregistre quand on
           le quitte — redessiner pendant que l'écriture est en vol y remettrait
           le texte d'avant. -->
      <div data-bloc="humeur-jour">${construireHumeurDuJour(humeurDuJour)}</div>

      <!-- DEUX COLONNES : LES HABITUDES À GAUCHE, LA LECTURE À DROITE (30 août
           2026, demande de Noé — la seconde colonne était à trouver).

           POURQUOI LA LECTURE, et pas les rendez-vous ni le mot du jour : c'est
           le SECOND GESTE QUOTIDIEN de cette page. On coche une habitude, on
           note des pages ; les deux se font en trois secondes, tous les jours,
           et font avancer quelque chose. Les rendez-vous, eux, se lisent — on
           n'agit pas dessus.

           Et surtout, les deux sont DÉJÀ LIÉES : noter des pages coche
           l'habitude de lecture (habitudes.automatique). Les poser côte à
           côte, c'est mettre ensemble ce que le hub relie déjà en base.

           LES HABITUDES RESTENT HORS DE TOUTE TUILE : posées à même le fond,
           sans carte ni bord — c'est la correction que Noé a faite le matin sur
           l'accueil, et pour la même raison. Une tuile porte ce qui est POSÉ ;
           une habitude n'est posée de rien, elle revient. -->
      <div class="perso-duo">
        <div class="duo-colonne">
          <h3 class="duo-titre">Habitudes</h3>
          ${
            // L'ÉTAT COMPLET, et non la seule liste des habitudes : la colonne
            // affiche la semaine en cours et le prochain palier, qui vivent
            // dans `serie` et `cumul`. C'est déjà calculé par
            // `etatDesHabitudes` (js/orientation.js) — rien à recompter ici.
            construireHabitudesDuJour(etatsHabitudes)
          }
        </div>

        <div class="duo-colonne">
          <h3 class="duo-titre">Ta lecture</h3>
          ${
            livre
              ? `<div class="perso-lecture">
                 <span class="perso-lecture-titre">${echapper(livre.titre)}</span>
                 ${
                   avancee.part === null
                     ? ''
                     : `<span class="livre-jauge"><i style="width:${Math.round(
                         avancee.part * 100,
                       )}%"></i></span>`
                 }
                 <span class="livre-ligne">
                   <span class="discret">${
                     livre.pages
                       ? `${avancee.lues} sur ${livre.pages} pages`
                       : pluriel(avancee.lues, 'page')
                   }</span>
                   <span class="livre-pas">
                     ${
                       // LES MÊMES ATTRIBUTS QUE L'ÉTAGÈRE (5 septembre 2026) :
                       // le geste est le même, il n'a pas à être branché deux
                       // fois. `data-rayon-de` dit à quel rayon la ligne
                       // appartient — ici toujours les livres, tandis que
                       // l'étagère suit le rayon qu'on regarde.
                       RAYONS.livres.pas.map(
                         (pas) =>
                           `<button type="button" class="livre-pas-bouton" data-pas="${pas}"
                             data-rayon-de="livres"
                             data-oeuvre-quantite="${echapper(livre.id)}">+${pas}</button>`,
                       ).join('')
                     }
                     <!-- « autre » ouvre le champ où l'on tape le nombre exact
                          (2 septembre 2026, demande de Noé). Il existait sur la
                          bibliothèque depuis le premier jour et manquait ICI,
                          c'est-à-dire sur l'écran où l'on note vraiment ses
                          pages tous les soirs : +10 et +25 ne sont que des
                          raccourcis, et une lecture fait rarement un compte
                          rond. Le geste est déjà branché pour les deux écrans —
                          rien à câbler, seulement à offrir. -->
                     <button type="button" class="livre-pas-bouton" data-rayon-de="livres"
                       data-oeuvre-autre="${echapper(livre.id)}">autre</button>
                   </span>
                 </span>
               </div>`
              // UN VIDE QUI OCCUPE SA COLONNE. Au 30 août 2026 il n'y a aucun
              // livre en base : une phrase perdue en haut d'une colonne vide,
              // à côté de cinq habitudes, aurait été un trou. La tuile
              // pointillée tient la place et invite — c'est la forme de
              // « Déclarer une période » dans #objectifs, et la règle du hub :
              // un écran vide ouvre une porte, il ne s'excuse pas.
              : `<a class="perso-lecture-vide" href="#perso/bibliotheque">
                   <span>Aucun livre en cours</span>
                   <span class="discret">Ouvrir ta bibliothèque →</span>
                 </a>`
          }
        </div>
      </div>

      <div class="tuile-jour perso-tuile">
        <h3 class="jour-groupe">Ce qui a compté aujourd'hui</h3>
        <textarea class="jour-mot-champ" data-jour-mot="${echapper(jour)}" rows="2"
          placeholder="une ligne, si tu veux">${echapper(mot ?? '')}</textarea>
      </div>

      ${
        rendezVous.length
          ? `<section class="bloc">
               <h2>Ce qui vient</h2>
               <ul class="perso-lignes">
                 ${rendezVous
                   .slice(0, 3)
                   .map(
                     (rdv) => `
                   <li class="perso-ligne">
                     <span class="perso-ligne-corps">
                       <span class="perso-ligne-titre">${echapper(rdv.titre)}</span>
                       <span class="perso-ligne-service">${echapper(
                         [
                           momentLisible(new Date(rdv.date_debut)),
                           rdv.lieu ?? '',
                           FAMILLES_PERSO[rdv.famille] ?? '',
                         ]
                           .filter(Boolean)
                           .join(' · '),
                       )}</span>
                     </span>
                   </li>`,
                   )
                   .join('')}
               </ul>
             </section>`
          : ''
      }

      ${
        relue
          ? `<p class="perso-relue">${
              relue.quoi === 'victoire'
                ? `${echapper(relue.mot)}, tu notais <b>${echapper(relue.victoire.titre)}</b>.`
                : `<b>${echapper(relue.intention.titre)}</b>${
                    relue.intention.pourquoi
                      ? `<span class="discret"> ${echapper(relue.intention.pourquoi)}</span>`
                      : ''
                  }`
            }</p>`
          : ''
      }

      <nav class="perso-portes">
        ${porte('#perso/habitudes', 'Mes habitudes')}
        ${porte('#perso/bibliotheque', 'Ma bibliothèque')}
        ${porte('#perso/journee', 'Mes journées')}
        ${porte('#perso/intentions', 'Mes intentions')}
      </nav>
    </div>`;
}

// LA PAGE DU JOUR (29 août 2026, demande de Noé) : « un outil qui me permet de
// faire un bilan quotidien, avec une page par jour qui est construite et sur
// laquelle on peut revenir ».
//
// ELLE SE LIT PLUS QU'ELLE NE SE REMPLIT, et c'est ce qui la rend tenable : le
// hub connaît déjà l'humeur, les tâches terminées, les événements, les
// victoires, les habitudes et les pages lues. Une seule chose s'y écrit — « ce
// qui a compté » —, parce que c'est la seule à laquelle il ne peut pas répondre
// à la place de Noé.
//
// Aucun compte, aucun total, aucune comparaison avec hier. Une journée n'a pas
// de score : elle a eu lieu.
const JOURS_SEMAINE = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS_LISIBLES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function jourEnToutesLettres(iso, aujourdhui) {
  if (iso === aujourdhui) return "Aujourd'hui";
  const date = depuisDateISO(iso);
  return `${JOURS_SEMAINE[date.getDay()]} ${date.getDate()} ${MOIS_LISIBLES[date.getMonth()]}`;
}

// L'ICÔNE DU RELEVÉ : trois lignes et leurs puces, le dessin d'une liste. En
// trait plutôt qu'en glyphe, comme les autres icônes du hub — un caractère
// dépendrait d'une police de secours choisie par le navigateur.
const ICONE_RELEVE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"></path></svg>`;

function bloc_(titre, contenu) {
  return contenu ? `<div class="jour-part"><span class="jour-part-titre">${titre}</span>${contenu}</div>` : '';
}

// --- LE CALENDRIER DES JOURNÉES (1er septembre 2026) --------------------------
//
// LA DEMANDE DE NOÉ : « intègre un calendrier en vue mois et semaine où je peux
// cliquer sur un jour et voir le détail de chaque jour — habitudes, tâches
// terminées, journaling du jour, événements, humeur… »
//
// CE QU'IL RÉPARE. La page n'avait que deux flèches, un jour à la fois : pour
// retrouver le mardi d'il y a trois semaines il fallait cliquer vingt fois, et
// surtout **on ne voyait pas ce qu'il y avait à retrouver**. Une page qui
// regarde en arrière a besoin d'un dessus.
//
// CE N'EST PAS `construireGrille` DU CALENDRIER, ET C'EST VOULU : celui-là
// dessine des barres — ce qui est posé, ce qui arrive. Ici on ne pose rien, on
// CHOISIT un jour ; la case ne montre donc pas des lignes mais des SIGNES de ce
// qui s'y est passé. Deux besoins, deux dessins.
//
// LES SIGNES D'UNE CASE, et rien de plus :
//   — la FRIMOUSSE de l'humeur, quand elle a été notée. C'est le seul signe qui
//     dise comment la journée a été vécue, et c'est celui qu'on cherche ;
//   — un POINT PAR ESPACE qui a bougé — la couleur dit lequel, comme partout
//     ailleurs dans le hub. Une journée bleue est une journée de club ; on lit
//     la forme d'un mois sans lire un mot ;
//   — un point discret de plus si un MOT a été écrit ce jour-là.
//
// AUCUN COMPTE, AUCUN SCORE, AUCUNE CASE VIDE QUI S'EXCUSE. Un jour sans rien
// est un jour sans rien : il reste une case, sobre, et il se clique comme les
// autres. C'est la règle de la page — « un jour vide le dit sans reproche ».
export function resumeParJour({ humeurs = [], taches = [], evenements = [], faits = [], mots = [] }) {
  const par = new Map();
  const pour = (jour) => {
    if (!par.has(jour)) par.set(jour, { humeur: null, espaces: new Set(), mot: false });
    return par.get(jour);
  };

  for (const ligne of humeurs) pour(ligne.date).humeur = ligne.niveau;
  for (const tache of taches) {
    if (!tache.date_fait) continue;
    pour(versDateISO(new Date(tache.date_fait))).espaces.add(tache.espace);
  }
  for (const evenement of evenements) {
    pour(versDateISO(new Date(evenement.date_debut))).espaces.add(evenement.espace);
  }
  // Une habitude cochée n'a pas d'espace : elle vit dans le perso, et c'est là
  // qu'elle se compte.
  for (const fait of faits) pour(fait.jour).espaces.add('perso');
  // Un jour où l'on a écrit : le journal OU la gratitude. Le point dit qu'on a
  // posé des mots ce jour-là, pas lequel des deux champs les porte.
  for (const ligne of mots) {
    if (ligne.mot?.trim() || ligne.gratitude?.trim()) pour(ligne.jour).mot = true;
  }

  return par;
}

// Le lundi de la semaine d'un jour. Le hub commence ses semaines le lundi
// partout ailleurs ; il n'y a aucune raison que ce calendrier-ci soit le seul à
// commencer le dimanche.
function lundiDe(iso) {
  const date = depuisDateISO(iso);
  const rang = (date.getDay() + 6) % 7;
  return versDateISO(ajouterJours(date, -rang));
}

// Les jours que la vue montre : six semaines pleines pour un mois — toujours
// six, jamais cinq puis six, sinon la grille saute d'un mois à l'autre — et
// sept pour une semaine.
export function joursDeLaVue(vue, pivot) {
  if (vue === 'semaine') {
    const debut = depuisDateISO(lundiDe(pivot));
    return Array.from({ length: 7 }, (_, index) => versDateISO(ajouterJours(debut, index)));
  }
  const premier = depuisDateISO(pivot);
  premier.setDate(1);
  const debut = depuisDateISO(lundiDe(versDateISO(premier)));
  return Array.from({ length: 42 }, (_, index) => versDateISO(ajouterJours(debut, index)));
}

const JOURS_COURTS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function construireCalendrierDesJournees(vue, pivot, resumes, choisi) {
  const jours = joursDeLaVue(vue, pivot);
  const aujourdhui = versDateISO();
  const moisPivot = pivot.slice(0, 7);
  const pas = vue === 'semaine' ? 7 : 0;

  const recule = pas
    ? versDateISO(ajouterJours(depuisDateISO(pivot), -7))
    : (() => {
        const d = depuisDateISO(pivot);
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        return versDateISO(d);
      })();
  const avance = pas
    ? versDateISO(ajouterJours(depuisDateISO(pivot), 7))
    : (() => {
        const d = depuisDateISO(pivot);
        d.setDate(1);
        d.setMonth(d.getMonth() + 1);
        return versDateISO(d);
      })();

  const titre =
    vue === 'semaine'
      ? `Semaine du ${depuisDateISO(jours[0]).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        })}`
      : depuisDateISO(pivot).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const case_ = (jour) => {
    const resume = resumes.get(jour);
    const niveau = resume?.humeur
      ? NIVEAUX_HUMEUR.find((n) => n.niveau === resume.humeur)
      : null;
    // Les points suivent l'ordre des journées de Noé, comme partout ailleurs.
    const espaces = [...(resume?.espaces ?? [])].sort(
      (a, b) => ORDRE_ESPACES.indexOf(a) - ORDRE_ESPACES.indexOf(b),
    );

    const classes = [
      'jours-case',
      jour === choisi ? 'jours-choisi' : '',
      jour === aujourdhui ? 'jours-aujourdhui' : '',
      // Un jour d'un autre mois reste cliquable — il a eu lieu comme les
      // autres —, il s'estompe seulement pour que le mois se lise.
      vue === 'mois' && jour.slice(0, 7) !== moisPivot ? 'jours-hors' : '',
      jour > aujourdhui ? 'jours-avenir' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // UN JOUR À VENIR NE S'OUVRE PAS. La flèche du détail refuse déjà le
    // lendemain depuis le 29 août — « une flèche qui ne mène nulle part est un
    // bouton qui ment » —, et une case qui ouvrirait une journée vide dirait la
    // même chose autrement. Elle reste dessinée : le mois doit garder sa forme.
    const aVenir = jour > aujourdhui;

    return `<button type="button" class="${classes}" data-jour-vers="${echapper(jour)}"
      ${aVenir ? 'disabled' : ''}
      aria-current="${jour === choisi}"
      aria-label="${echapper(jourEnToutesLettres(jour, aujourdhui))}">
      <span class="jours-numero">${Number(jour.slice(8))}</span>
      ${niveau ? `<span class="jours-frimousse">${niveau.frimousse}</span>` : ''}
      <span class="jours-points">
        ${espaces
          .map((espace) => `<span class="jours-point" data-espace="${echapper(espace)}"></span>`)
          .join('')}
        ${resume?.mot ? '<span class="jours-point jours-mot"></span>' : ''}
      </span>
    </button>`;
  };

  return `
    <div class="jours-tete">
      <div class="jours-navigation">
        <button type="button" class="jour-fleche" data-jours-pivot="${echapper(
          recule,
        )}" aria-label="Avant">‹</button>
        <span class="jours-titre">${echapper(titre)}</span>
        <button type="button" class="jour-fleche" data-jours-pivot="${echapper(
          avance,
        )}" aria-label="Après">›</button>
      </div>
      <!-- LA BASCULE REPREND .affichages (1er septembre 2026, forme montrée par
           Noé), le groupe de boutons du calendrier : une piste arrondie, l'actif
           en pastille pleine et l'encre inversée. C'est le MÊME geste — choisir
           ce que la grille montre —, il n'a aucune raison de se présenter
           autrement ici, et « Ma semaine » l'avait déjà repris pour la même
           raison. Écrire un troisième dessin pour un geste qui en a déjà un,
           c'est fabriquer la divergence qu'on passe ensuite à rattraper. -->
      <div class="affichages" role="group" aria-label="La vue du calendrier">
        <button type="button" class="${vue === 'mois' ? 'actif' : ''}"
          aria-pressed="${vue === 'mois'}" data-jours-vue="mois">Mois</button>
        <button type="button" class="${vue === 'semaine' ? 'actif' : ''}"
          aria-pressed="${vue === 'semaine'}" data-jours-vue="semaine">Semaine</button>
      </div>
    </div>

    <div class="jours-grille${vue === 'semaine' ? ' jours-grille-semaine' : ''}">
      ${JOURS_COURTS.map((lettre) => `<span class="jours-entete">${lettre}</span>`).join('')}
      ${jours.map(case_).join('')}
    </div>`;
}

// LA NOTE D'UNE JOURNÉE : les cinq frimousses, et celle qui a été choisie.
//
// LE JOUR EST PORTÉ PAR CHAQUE BOUTON, et c'est ce qui permet de noter une
// journée passée : `enregistrerHumeur` prend déjà une date, seul l'écran ne
// savait parler que d'aujourd'hui. On peut donc revenir sur hier soir sans
// mentir sur la date.
// LES PASTILLES D'HABITUDE D'UNE JOURNÉE (1er septembre 2026).
//
// `construirePastillesHabitudes` ET NON `construireHabitudesDuJour` : ce
// nom-là était DÉJÀ PRIS, par les jetons du tableau de bord. Le module se
// chargeait avec « Identifier has already been declared » et emportait tout
// l'écran. C'est la règle du dépôt appliquée aux fonctions comme aux classes
// CSS : le grep de trois secondes n'est pas facultatif.
//
// UNE FABRIQUE À PART, parce que le clic la rappelle : le tri est DYNAMIQUE
// (demande de Noé) — décocher une habitude la renvoie à la fin, avec celles qui
// n'ont pas été faites. Un tri figé au rendu aurait laissé une habitude
// « faite » en tête alors qu'elle ne l'était plus.
//
// TOUTES LES HABITUDES SONT LÀ, celles du jour comme les autres : c'est la liste
// qu'on parcourt le soir. Le bloc ne montrait que les cochées, en pastilles
// muettes — il disait ce qui avait été fait sans permettre de le corriger, et
// surtout il ne disait rien de ce qui restait. On ne fait pas un bilan sur une
// liste qui cache la moitié de ses lignes.
//
// LES FAITES D'ABORD : un bilan se lit dans ce sens — ce qui a été tenu, puis ce
// qui reste. `sort` est stable, donc deux habitudes faites gardent l'ordre où
// Noé les a posées.
//
// LA COCHE VAUT POUR CE JOUR-LÀ : chaque bouton porte sa date, donc on rattrape
// hier sans mentir sur aujourd'hui.
export function construirePastillesHabitudes(jour, habitudes = [], faits = []) {
  if (!habitudes.length) return '';

  const rangees = habitudes
    .map((habitude) => ({
      habitude,
      fait: faits.some((f) => f.habitude_id === habitude.id && f.jour === jour),
    }))
    .sort((a, b) => Number(b.fait) - Number(a.fait));

  return `<span class="jour-pastilles" data-bloc-habitudes>${rangees
    .map(
      ({ habitude, fait }) => `<button type="button" class="jour-pastille${
        fait ? ' faite' : ''
      }" data-faire-habitude="${echapper(habitude.id)}"
        data-jour="${echapper(jour)}" aria-pressed="${fait}">${
        habitude.emoji ? `${echapper(habitude.emoji)} ` : ''
      }${echapper(habitude.nom)}</button>`,
    )
    .join('')}</span>`;
}

export function construireNoteDuJour(jour, humeur) {
  const choisi = humeur ? NIVEAUX_HUMEUR.find((n) => n.niveau === humeur.niveau) : null;

  // SANS TITRE NON PLUS (1er septembre 2026, demande de Noé). Cinq frimousses
  // en haut d'une journée ne demandent pas qu'on explique ce qu'elles sont. Le
  // nom du groupe le dit au lecteur d'écran, qui lui ne les voit pas.
  return `
    <span class="echelle-humeur" role="group" aria-label="Comment était cette journée ?">
      ${NIVEAUX_HUMEUR.map(
        ({ niveau, frimousse, mot }) => `
        <button type="button" class="bouton-humeur${
          choisi?.niveau === niveau ? ' choisi' : ''
        }" data-niveau="${niveau}" data-jour="${echapper(jour)}"
          aria-pressed="${choisi?.niveau === niveau}"
          title="${mot}" aria-label="${mot}">${frimousse}</button>`,
      ).join('')}
    </span>
    ${
      humeur?.note ? `<p class="jour-note-mot">« ${echapper(humeur.note)} »</p>` : ''
    }`;
}

export function construireLaJournee(jour, donnees, contexte = {}) {
  const aujourdhui = versDateISO();
  const {
    humeur, taches = [], evenements = [], victoires = [], faits = [], seances = [], mot, gratitude,
  } = donnees ?? {};
  const { habitudes = [], livres = [], relue = null, faits: tousLesFaits = [] } = contexte;

  const nomDe = (id, liste, cle = 'nom') => liste.find((x) => x.id === id)?.[cle] ?? '';
  const pagesLues = seances.reduce((somme, seance) => somme + seance.pages, 0);

  const rien =
    !humeur && !taches.length && !evenements.length && !victoires.length && !faits.length &&
    !seances.length && !mot;

  return `
    <div class="jour-page">
      <div class="jour-navigation">
        <button type="button" class="jour-fleche" data-jour-vers="${echapper(
          versDateISO(ajouterJours(depuisDateISO(jour), -1)),
        )}" aria-label="Le jour d'avant">‹</button>
        <span class="jour-nom">${echapper(jourEnToutesLettres(jour, aujourdhui))}</span>
        <!-- LA NOTE SUR LA LIGNE DU JOUR (1er septembre 2026, demande de Noé).
             Elle avait sa propre ligne, puis son propre bloc : deux rangs pour
             cinq frimousses. Le jour et la note qu'on lui donne sont la même
             information — quel jour, et comment il était —, et ils se lisent
             ensemble. Ça rend une ligne entière au journal. -->
        <div class="jour-note" data-note-jour>
          ${construireNoteDuJour(jour, humeur)}
        </div>
        <button type="button" class="jour-fleche" data-jour-vers="${echapper(
          versDateISO(ajouterJours(depuisDateISO(jour), 1)),
        )}" ${jour >= aujourdhui ? 'disabled' : ''} aria-label="Le jour d'après">›</button>
      </div>

      <!-- LES DÉTAILS EN HAUT, ET REPLIABLES (1er septembre 2026, demande de
           Noé : « les autres — habitudes, tâches… — sont des détails qui
           doivent s'afficher en haut, et qu'on peut masquer si envie »).

           CE QUE ÇA RENVERSE : l'écriture fermait la page, après six blocs de
           relevés. Elle était donc la dernière chose qu'on voyait, alors que
           c'est la SEULE que le hub ne puisse pas remplir à la place de Noé —
           tout le reste, il le sait déjà. Le rang disait l'inverse de la règle
           de la page.

           UN details NATIF, ouvert par défaut : le repli est un geste rare, et
           il n'a pas besoin d'état à tenir — la tuile se redessine à
           l'ouverture d'un jour, pas pendant qu'on la lit. -->
      <!-- LES HABITUDES SORTENT DU REPLI (1er septembre 2026, demande de Noé :
           « sors les habitudes de ce bloc, elles apparaissent constamment sur
           la page »).

           ET C'EST LA BONNE PLACE : le repli contient ce que le hub RELÈVE —
           des faits déjà écrits ailleurs, qu'on regarde. Les habitudes, elles,
           sont la seule chose de ce bloc qu'on vient COCHER. Les ranger avec ce
           qui se lit, c'était demander un geste avant d'ouvrir un tiroir. -->
      <!-- LES HABITUDES ET L'ICÔNE DU RELEVÉ PARTAGENT UNE LIGNE (1er septembre
           2026, demande de Noé : « déplace l'icône pour qu'elle ne fasse pas
           une ligne entière à elle seule, à droite, sur la même ligne que les
           habitudes »).

           LE SOMMAIRE NE PEUT PAS SORTIR DE SON TIROIR — c'est lui qui
           bascule le tiroir, et tout ce qui le suit disparaît quand il est
           fermé : y glisser les habitudes les ferait disparaître avec. On garde
           donc la structure et on POSE l'icône, en absolu, dans le coin haut
           droit d'un cadre qui enveloppe les deux. Les pastilles lui réservent
           sa place par une marge à droite, pour qu'aucune ne passe dessous. -->
      <div class="jour-cocher">
      ${
        // SANS TITRE (1er septembre 2026, demande de Noé). Neuf pastilles qui
        // se cochent n'ont pas besoin qu'on annonce que ce sont des habitudes :
        // on les reconnaît à ce qu'elles sont — les seules choses de cette tuile
        // sur lesquelles on appuie. C'est le quatrième titre qui tombe dans
        // cette journée, et pour la même raison : ce qui se montre n'a pas à se
        // nommer.
        (() => {
          const pastilles = construirePastillesHabitudes(jour, habitudes, tousLesFaits);
          return pastilles ? `<div class="jour-part">${pastilles}</div>` : '';
        })()
      }

      <details class="jour-releve" open>
        <!-- UNE ICÔNE, SANS FLÈCHE (1er septembre 2026, demande de Noé). Le
             libellé nommait un tiroir dont le contenu se voit dès qu'il est
             ouvert — et il l'est par défaut. L'icône dit « il y a un relevé
             ici » sans occuper une ligne de titre ; son nom accessible garde la
             phrase, pour qui ne voit pas le dessin. La flèche disait le sens du
             geste ; l'icône s'allume quand le tiroir est ouvert, ce qui le dit
             aussi bien avec un signe de moins. -->
        <summary aria-label="Ce que dit la journée" title="Ce que dit la journée">
          ${ICONE_RELEVE}
        </summary>
        <div class="jour-releve-corps">
          <div class="jour-releve-colonnes">
          ${bloc_(
            'Terminé',
            taches.length
              ? `<ul class="jour-liste">${taches
                  .map(
                    (tache) =>
                      `<li><span class="jour-coche">✓</span><span class="jour-liste-texte"
                       >${echapper(tache.titre)}
                       <span class="discret">${echapper(NOMS_ESPACES[tache.espace] ?? '')}</span></span></li>`,
                  )
                  .join('')}</ul>`
              : '',
          )}

          ${bloc_(
            'Ce jour-là',
            evenements.length
              ? `<ul class="jour-liste">${evenements
                  .map(
                    (evenement) =>
                      `<li>${echapper(evenement.titre)}
                       <span class="discret">${echapper(
                         [evenement.lieu, FAMILLES_PERSO[evenement.famille] ?? ''].filter(Boolean).join(' · '),
                       )}</span></li>`,
                  )
                  .join('')}</ul>`
              : '',
          )}

          ${bloc_(
            'Lecture',
            pagesLues
              ? `<p class="jour-lecture">${pluriel(pagesLues, 'page')}${
                  seances.length === 1 && nomDe(seances[0].livre_id, livres, 'titre')
                    ? ` — ${echapper(nomDe(seances[0].livre_id, livres, 'titre'))}`
                    : ''
                }</p>`
              : '',
          )}

          ${bloc_(
            'Victoires',
            // LES VICTOIRES NÉES D'UNE TÂCHE NE SE RÉPÈTENT PAS : elles sont déjà
            // dans « Terminé » juste au-dessus, mot pour mot. Restent celles qui
            // disent autre chose — un jalon franchi, une étape, un palier
            // d'habitude, une victoire écrite à la main.
            (() => {
              const autres = victoires.filter((victoire) => victoire.source !== 'tache');
              return autres.length
                ? `<ul class="jour-liste">${autres
                    .map((victoire) => `<li>${echapper(victoire.titre)}</li>`)
                    .join('')}</ul>`
                : '';
            })(),
          )}


          ${rien ? `<p class="vide">Rien de noté ce jour-là. Ça arrive, et ce n'est pas grave.</p>` : ''}
          </div>
        </div>
      </details>
      </div>

      <!-- L'ÉCRITURE EST L'ÉLÉMENT PRINCIPAL (même demande : « l'espace pour
           écrire du texte doit être plus grand, et pouvoir conserver un texte
           long, ça doit être l'élément principal de la page »).

           La colonne journees.mot est du texte libre : elle n'a jamais eu de
           limite. Ce qui bridait, c'était le CHAMP — deux lignes, une invite
           qui disait « une ligne, si tu veux ». On n'écrit pas un bilan dans un
           champ qui annonce qu'il n'en attend pas. -->
      <!-- UNE CHOSE DONT JE SUIS RECONNAISSANT (1er septembre 2026, demande de
           Noé, qui a montré la page de journal dont elle vient).

           ELLE VIENT AVANT LE JOURNAL, et c'est l'ordre de son exemple : c'est
           une QUESTION posée, toujours la même, à laquelle on répond en une
           phrase — on y répond mieux avant d'avoir écrit dix lignes. Le journal,
           lui, n'attend rien de précis et peut prendre tout le temps qu'il veut.

           ELLE GARDE SON CADRE, à la différence du journal : c'est une case à
           remplir, et une case doit se voir. Un aplat chaud, pas un contour —
           c'est le seul endroit du hub qui invite plutôt qu'il ne range. -->
      <!-- SANS TITRE, L'INVITE LE DIT (1er septembre 2026, demande de Noé).
           Deux fois la même phrase — un libellé au-dessus, une invite dedans —
           ne disait rien de plus et coûtait une ligne à chacun des deux champs.
           C'est l'invite qui reste : elle est DANS le champ, à l'endroit exact
           où l'on va écrire.

           L'attribut aria-label PREND LE RELAIS, et ce n'est pas optionnel : le libellé
           était le nom accessible du champ, et une invite disparaît dès qu'on
           tape. Sans lui, un lecteur d'écran annoncerait deux zones de texte
           anonymes. -->
      <div class="jour-gratitude">
        <div class="jour-gratitude-champ">
          <span class="jour-gratitude-signe" aria-hidden="true">⭐</span>
          <textarea class="jour-champ" data-jour-champ="gratitude" data-jour-mot="${echapper(jour)}"
            rows="2" aria-label="Une chose dont je suis reconnaissant"
            placeholder="Une chose dont je suis reconnaissant">${echapper(gratitude ?? '')}</textarea>
        </div>
      </div>

      <!-- LE JOURNAL N'A PAS DE RECTANGLE (même demande : « pas de rectangle
           visible dans lequel mettre le texte »). Un champ encadré dit « remplis
           ce formulaire » ; on n'écrit pas sa journée dans un formulaire. Il
           reste un textarea — donc tout ce qu'un champ sait faire — mais il
           n'en porte plus l'habit : pas de fond, pas de contour, le texte posé
           sur la page comme dans un carnet. -->
      <div class="jour-mot">
        <textarea class="jour-champ jour-mot-long" data-jour-champ="mot"
          data-jour-mot="${echapper(jour)}" rows="12"
          aria-label="Ma journée en quelques mots"
          placeholder="Ma journée en quelques mots"
          >${echapper(mot ?? '')}</textarea>
      </div>

      ${
        relue
          ? `<p class="jour-relecture">${
              relue.quoi === 'victoire'
                ? `${echapper(relue.mot)}, tu notais <b>${echapper(relue.victoire.titre)}</b>.`
                : `Tu écrivais : <b>${echapper(relue.intention.titre)}</b>.`
            }</p>`
          : ''
      }
    </div>`;
}

// L'ÉCHELLE DE L'HUMEUR, celle de l'accueil au glyphe près — cinq frimousses,
// puis la seule choisie une fois répondu. Une question posée de deux façons
// selon l'écran deviendrait deux questions.
//
// Elle sert la tête du tableau de bord, la tuile d'une journée et le calendrier
// des journées : c'est le seul endroit qui la déclare.
const NIVEAUX_HUMEUR = [
  { niveau: 1, frimousse: '😔', mot: 'difficile' },
  { niveau: 2, frimousse: '😕', mot: 'bof' },
  { niveau: 3, frimousse: '😐', mot: 'ça va' },
  { niveau: 4, frimousse: '🙂', mot: 'bien' },
  { niveau: 5, frimousse: '😄', mot: 'très bien' },
];

export function construireHumeurDuJour(humeur) {
  if (humeur) {
    const choisi = NIVEAUX_HUMEUR.find((n) => n.niveau === humeur.niveau);
    return `
      <p class="humeur-jour">
        <span class="humeur-jour-frimousse">${choisi?.frimousse ?? ''}</span>
        <span>Aujourd'hui, ${echapper(choisi?.mot ?? '')}${
          humeur.note ? ` — ${echapper(humeur.note)}` : ''
        }</span>
        <button type="button" class="lien-discret" data-rouvrir-humeur>Changer</button>
      </p>`;
  }

  return `
    <p class="humeur-jour">
      <span>Comment tu te sens ?</span>
      <span class="echelle-humeur" role="group" aria-label="Comment tu te sens ?">
        ${NIVEAUX_HUMEUR.map(
          ({ niveau, frimousse, mot }) => `
          <button type="button" class="bouton-humeur" data-niveau="${niveau}"
            title="${mot}" aria-label="${mot}">${frimousse}</button>`,
        ).join('')}
      </span>
    </p>`;
}

// LA PAGE ET SES VUES. Le tableau de bord est ce qu'on voit sans avoir rien
// demandé ; les autres blocs sont des VUES que le menu offre une à une, et
// `#perso` seul n'en montre aucune.
//
// TROIS BLOCS SONT PARTIS LE 5 SEPTEMBRE 2026 — les rendez-vous, la courbe
// d'humeur, les victoires — parce que Noé a retiré leurs pages du menu, et
// qu'un bloc sans porte est du code mort. Ce qu'ils portaient existe ailleurs :
// l'humeur se répond en tête de ce tableau de bord, un rendez-vous se pose au
// calendrier, et « Mon chemin » est la page des victoires.
//
// *Ce qui disparaît vraiment : la COURBE des 30 jours, qu'aucun autre écran ne
// dessine, et le bouton qui ajoutait une victoire à la main.*
function squelette() {
  return `
    <h1 data-titre>Perso</h1>
    <p class="discret sous-titre" data-sous-titre>La vie hors espaces — sport, sorties, temps pour toi.</p>

    <!-- LE TABLEAU DE BORD : ce qu'on voit sans avoir rien demandé. Il ne porte
         que ce qui évolue et sur quoi on agit — voir construireTableauPerso.
         Les blocs suivants sont des VUES : le menu les offre une à une, et
         l'adresse #perso seule ne montre que celui-ci. -->
    <div data-bloc="tableau" data-vue="tableau"></div>

    <section class="bloc" data-vue="intentions">
      <h2>Mes intentions</h2>
      <div data-bloc="intentions"><p class="vide">…</p></div>
    </section>

    <section class="bloc" data-vue="habitudes">
      <h2>Mes habitudes</h2>
      <div data-bloc="habitudes"><p class="vide">…</p></div>
    </section>

    <section class="bloc" data-vue="journee">
      <h2>Mes journées</h2>
      <div data-bloc="jours-calendrier"></div>
      <!-- LE DÉTAIL D'UN JOUR EST UNE TUILE VOLANTE (1er septembre 2026,
           demande de Noé : « ça doit ouvrir une tuile volante »). La page ne
           montre plus que son calendrier ; le jour s'ouvre PAR-DESSUS, comme
           tout ce qu'on ouvre dans le hub — le fond s'assombrit, la tuile se
           centre, et on la referme par la croix, le fond ou Échap.

           CE QUE ÇA REMPLACE : le détail vivait à demeure sous la grille, et
           l'un poussait l'autre hors de l'écran. Un calendrier sert à CHOISIR ;
           ce qu'on a choisi n'a pas à occuper la page en permanence. -->
      <div data-bloc="journee"></div>
    </section>

    <!-- LE HALL, PUIS DEUX SALLES (5 septembre 2026, demande de Noé : « je
         préférerais que ce soit vraiment 2 portes, donc 2 tuiles cliquables qui
         nous permettent d'aller sur la page des livres ou la page des
         films/séries, avec un livre en cours sur cette page »).

         #perso/bibliotheque ne montre plus d'inventaire : ce qu'on lit ou
         regarde en ce moment, et deux portes. Les étagères vivent une porte plus
         loin, #perso/livres et #perso/films — c'est la règle des deux rangs,
         appliquée dans une page : on va voir sa bibliothèque quand on veut la
         voir, on ouvre celle-ci pour noter ses pages du soir. -->
    <section class="bloc" data-vue="bibliotheque">
      <h2>Ma bibliothèque</h2>
      <div data-bloc="bibliotheque"><p class="vide">…</p></div>
    </section>

    <section class="bloc" data-vue="livres">
      <h2>Mes livres</h2>
      <div data-bloc="rayon-livres"><p class="vide">…</p></div>
    </section>

    <section class="bloc" data-vue="films">
      <h2>Mes films et séries</h2>
      <div data-bloc="rayon-films"><p class="vide">…</p></div>
    </section>

    <!-- La tuile volante vit HORS des blocs : elle survit au filtre des vues,
         et une fenêtre cachée par un bloc masqué serait un piège. -->
    <div class="cap-fenetre-hote" data-fenetre></div>
  `;
}

// LES TROIS FORMULAIRES DE LA PAGE, dans la même tuile volante — celle du
// hub entier. Ils étaient dépliés dans le flux, sous leur bloc : six champs qui
// poussaient la page vers le bas et faisaient perdre de vue ce qu'on regardait.
//
// La tuile SERT AUSSI À CORRIGER une intention, ce que la page ne savait pas
// faire : on ne pouvait que la jeter et la réécrire.
// EXPORTÉ le 2 septembre 2026 : la page d'une habitude pose le même formulaire,
// et deux listes de champs auraient fini par ne plus demander la même chose.
export const FORMULAIRES = {
  intention: {
    ajouter: 'Écrire une intention',
    modifier: "Modifier l'intention",
    champs: (v) => [
      { nom: 'titre', libelle: 'Intention', type: 'text', requis: true, valeur: v.titre },
      {
        nom: 'pourquoi',
        libelle: 'Pourquoi ? (relu les jours sans motivation)',
        type: 'textarea',
        valeur: v.pourquoi,
      },
    ],
  },
  habitude: {
    ajouter: 'Poser une habitude',
    modifier: "Modifier l'habitude",
    champs: (v) => [
      { nom: 'nom', libelle: 'Habitude', type: 'text', requis: true, valeur: v.nom },
      // LE CARRÉ, À GAUCHE DU NOM (2 septembre 2026). Il ne descend pas dans la
      // rangée de pastilles : c'est l'image de la chose qu'on nomme, pas un
      // réglage. Voir `type: 'emoji'` dans js/gabarits.js.
      { nom: 'emoji', libelle: 'Émoji', type: 'emoji', valeur: v.emoji ?? '' },
      {
        nom: 'cadence',
        libelle: 'Combien de fois par semaine',
        type: 'choix',
        // « QUAND ÇA VIENT » A DISPARU (30 août 2026, décision de Noé : « quand
        // ça vient ne doit pas exister, c'est pas une habitude »). Et il a
        // raison sur le fond : sans cadence, il n'y a ni élan ni série — rien à
        // tenir, donc rien qui puisse se tenir. C'était un compteur, pas une
        // habitude.
        //
        // Ce que ça remplace : l'option valait NULL et se disait « la cadence
        // des choses qu'on veut noter sans se les imposer ». L'idée était
        // juste, l'endroit non — une chose qu'on note sans se l'imposer est une
        // victoire ou un rendez-vous, pas une habitude.
        options: {
          1: '1 fois', 2: '2 fois', 3: '3 fois', 4: '4 fois',
          5: '5 fois', 6: '6 fois', 7: 'Tous les jours',
        },
        valeur: v.cadence ? String(v.cadence) : '3',
      },
      {
        nom: 'famille',
        libelle: 'Ce que ça sert',
        type: 'choix',
        options: FAMILLES_PERSO_CHOIX,
        valeur: v.famille ?? '',
      },
      { nom: 'pourquoi', libelle: 'Pourquoi ? (facultatif)', type: 'textarea', valeur: v.pourquoi },
    ],
  },
};

// LES FORMULAIRES DE LA BIBLIOTHÈQUE, tirés du rayon lui-même (5 septembre
// 2026). Ils ne vivent pas dans `FORMULAIRES` : leurs mots changent d'un rayon à
// l'autre — « Pages lues » ou « Épisodes vus », « La phrase » ou « La réplique »
// —, et une entrée figée par rayon aurait fait quatre listes de champs à tenir
// d'accord au lieu d'une.
function modeleDOeuvre(forme, cleRayon) {
  const R = RAYONS[cleRayon] ?? RAYONS.livres;
  const V = R.vocabulaire;

  if (forme === R.forme) {
    return {
      ajouter: V.ajouter,
      modifier: V.modifier,
      champs: (v) => champsDuFormulaire(R, v),
    };
  }

  if (forme === 'citation') {
    return {
      ajouter: V.citationAjouter,
      champs: () => [
        { nom: 'texte', libelle: V.citationChamp, type: 'textarea', requis: true },
        // Une page pour un livre, un moment pour un film : le type suit.
        { nom: 'repere', libelle: V.repereLibelle, type: V.repereType },
      ],
    };
  }

  if (forme === 'quantite') {
    return {
      ajouter: V.quantiteTitre,
      champs: () => [
        { nom: 'combien', libelle: V.quantiteChamp, type: 'number', requis: true },
      ],
    };
  }

  return null;
}

function laFenetre() {
  if (!vueEtat.edition) return '';
  const { forme, id, rayon } = vueEtat.edition;
  const modele = FORMULAIRES[forme] ?? modeleDOeuvre(forme, rayon);
  if (!modele) return '';

  return construireFormulaire({
    id: `perso-${forme}`,
    libelle: id ? modele.modifier : modele.ajouter,
    action: 'enregistrer-perso',
    bouton: id ? 'Enregistrer' : 'Ajouter',
    champs: modele.champs(vueEtat.edition.valeurs ?? {}),
    // `parent` porte ce à quoi la fenêtre se rattache : le livre d'une citation
    // ou d'un nombre de pages. Sans lui, la ligne partait sans son livre — et
    // Postgres refusait, ce qui valait mieux qu'une citation orpheline.
    extra: `<input type="hidden" name="forme" value="${echapper(forme)}">
            <input type="hidden" name="id" value="${echapper(id ?? '')}">
            <input type="hidden" name="rayon" value="${echapper(rayon ?? '')}">
            <input type="hidden" name="parent" value="${echapper(vueEtat.edition.parent ?? '')}">`,
  });
}

// LES QUATRE VUES DE PERSO (28 août 2026) — le menu les offre une à une, et
// c'est la MÊME page dont on cache trois blocs sur quatre. Ni second écran, ni
// second chargement : les écouteurs sont posés sur la section et survivent.
// LES VUES DE PERSO, à la première personne depuis le 5 septembre 2026 (demande
// de Noé) : ce sont AUSSI les mots du menu, et un nom dans le menu avec un autre
// en tête de page ferait deux noms pour une page.
//
// TROIS VUES SONT PARTIES le même jour (« pas besoin de la page l'humeur, tu
// peux supprimer ; les rendez-vous tu peux supprimer, les victoires aussi ») :
// l'humeur se répond depuis l'accueil, depuis ce tableau de bord et depuis la
// tuile d'une journée ; un rendez-vous se pose au calendrier ; et « Mon chemin »
// est la page des victoires, tous espaces confondus. Aucune des trois n'avait
// d'écran à elle.
//
// LES INTENTIONS RESTENT une vue de perso — c'est ici qu'elles vivent —, mais le
// menu les offre depuis « Mon cap » : une intention est un objectif dont on a
// retiré la mesure.
const VUES = {
  intentions: ['Mes intentions', 'Ce que tu veux tenir, sans mesure ni date.'],
  habitudes: ['Mes habitudes', "Le rythme que tu tiens, et rien qui puisse s'écrouler."],
  bibliotheque: ['Ma bibliothèque', 'Ce que tu lis et ce que tu regardes en ce moment.'],
  livres: ['Mes livres', 'À ton rythme, et sans quota.'],
  films: ['Mes films et séries', 'Ce que tu as vu, et ce que tu regardes.'],
  journee: ['Mes journées', "Ce qu'il s'est passé, jour après jour. Rien à remplir."],
};

function appliquerLaVue(section, route) {
  const vue = route?.vue in VUES ? route.vue : null;
  // LE RAYON VIENT DE L'ADRESSE : `#perso/livres` et `#perso/films` sont deux
  // pages, et c'est l'adresse qui dit laquelle — un favori doit rouvrir la
  // bonne. Le hall, lui, ne change rien : on y revient sans perdre le réglage du
  // rayon qu'on regardait.
  if (vue === 'livres' || vue === 'films') vueEtat.rayon = vue;
  // `#perso/journee/2026-08-29` : le troisième niveau du routeur porte le jour.
  if (/^\d{4}-\d{2}-\d{2}$/.test(route?.id ?? '')) vueEtat.jour = route.id;
  const [titre, sous] = VUES[vue] ?? [
    'Perso',
    'La vie hors espaces — sport, sorties, temps pour toi.',
  ];

  section.querySelector('[data-titre]').textContent = titre;
  section.querySelector('[data-sous-titre]').textContent = sous;
  // `#perso` SEUL NE MONTRE QUE LE TABLEAU DE BORD (30 août 2026). Avant, il
  // montrait les sept blocs à la suite — une page qu'on faisait défiler, donc
  // l'inverse d'un lieu où l'on vient se recentrer. Chaque bloc a désormais sa
  // page dans le menu, et celle-ci ne garde que ce qui bouge.
  const montre = vue ?? 'tableau';
  for (const bloc of section.querySelectorAll('[data-vue]')) {
    bloc.hidden = bloc.dataset.vue !== montre;
    // UNE VUE SEULE NE RÉPÈTE PAS SON NOM. Le grand titre dit déjà « Tes
    // habitudes » ; le libellé du bloc juste dessous le disait une seconde
    // fois. C'est le défaut que `#objectifs` a corrigé le 28 août — trois noms
    // pour une page est un défaut, pas un choix.
    const nom = bloc.querySelector('h2');
    if (nom) nom.hidden = true;
  }
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    section.innerHTML = squelette();
    appliquerLaVue(section, route);

    // Changer de vue ne relit rien et ne redessine rien : trois blocs sur
    // quatre s'effacent, le quatrième reste exactement dans l'état où on l'a
    // laissé.
    this.naviguer = (nouvelle) => {
      appliquerLaVue(section, nouvelle);
      // UNE ADRESSE QUI PORTE UN JOUR L'OUVRE. Sans ça, coller
      // `#perso/journee/2026-08-20` depuis la page elle-même changeait l'état
      // sans rien redessiner : le lien menait au bon jour et montrait l'autre.
      if (/^\d{4}-\d{2}-\d{2}$/.test(nouvelle?.id ?? '')) ouvrirLaJournee(nouvelle.id);
    };

    // `couvertures` : les adresses SIGNÉES des couvertures, par chemin. Elles ne
    // vivent pas sur le livre — une adresse expire, un chemin non — et se
    // regarnissent d'un chargement à l'autre (voir `urlsDesImages` du rayon).
    const etat = {
      intentions: [], evenements: [], victoires: [], humeurDuJour: null,
      habitudes: [], faits: [],
      // LES DEUX RAYONS DE LA BIBLIOTHÈQUE, chacun avec son journal de séances et
      // ses adresses signées. `couvertures` et `affiches` ne vivent pas sur
      // l'œuvre — une adresse expire, un chemin non — et se regarnissent d'un
      // chargement à l'autre.
      livres: [], seances: [], couvertures: {},
      films: [], seancesFilms: [], affiches: {},
    };
    const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

    const rendreIntentions = () => {
      bloc('intentions').innerHTML = construireIntentions(etat.intentions);
    };

    // La tuile volante est REDESSINÉE à chaque fois, comme dans `#objectifs` :
    // elle n'a pas de sommaire à presser ici, c'est une tuile ou un menu qui
    // l'ouvre. On la déplie donc à la main juste après — `app.js` la referme
    // comme toutes les autres.
    const rendreFenetre = () => {
      const hote = section.querySelector('[data-fenetre]');
      hote.innerHTML = laFenetre();
      const fenetre = hote.querySelector('.ajout-volant');
      if (!fenetre) return;
      fenetre.open = true;
      fenetre.querySelector('input, textarea')?.focus();

      // REFERMER LA TUILE EFFACE SON ÉTAT, quel que soit le chemin — la croix,
      // le fond assombri ou Échap, tous trois tenus par `app.js`. On écoute
      // donc la FERMETURE elle-même plutôt que chacun des trois gestes : c'est
      // le seul point par où ils passent tous.
      //
      // Sans ça, `vueEtat.edition` restait posé et la fenêtre revenait au geste
      // suivant, par-dessus ce qu'on venait d'ouvrir. C'est le défaut exact que
      // `#objectifs` a rencontré le premier, et il ne se voit pas au moment où
      // on referme : il se voit au clic d'après.
      fenetre.addEventListener('toggle', () => {
        if (!fenetre.open) vueEtat.edition = null;
      });
    };
    // LA JOURNÉE SE CHARGE À LA DEMANDE, et se garde. Naviguer de jour en jour ne
    // redemande pas ce qui a déjà été lu — on remonte souvent plusieurs jours
    // d'affilée, et chaque aller-retour coûterait sept requêtes.
    const journeesVues = new Map();

    // LE CALENDRIER DES JOURNÉES. Ses résumés se gardent PAR INTERVALLE : revenir
    // sur un mois déjà lu ne redemande rien, et l'on remonte souvent plusieurs
    // mois d'affilée. C'est la même précaution que `journeesVues` pour le
    // détail d'un jour.
    const resumesVus = new Map();
    let resumes = new Map();

    const rendreCalendrierDesJournees = () => {
      const jour = vueEtat.jour ?? versDateISO();
      bloc('jours-calendrier').innerHTML = construireCalendrierDesJournees(
        vueEtat.joursVue,
        vueEtat.joursPivot ?? jour,
        resumes,
        jour,
      );
    };

    async function chargerLesResumes() {
      const jours = joursDeLaVue(vueEtat.joursVue, vueEtat.joursPivot ?? vueEtat.jour ?? versDateISO());
      const cle = `${jours[0]}..${jours[jours.length - 1]}`;
      if (resumesVus.has(cle)) {
        resumes = resumesVus.get(cle);
        rendreCalendrierDesJournees();
        return;
      }
      try {
        const brut = await api.resumeDesJournees(jours[0], jours[jours.length - 1]);
        const par = resumeParJour(brut);
        resumesVus.set(cle, par);
        resumes = par;
        rendreCalendrierDesJournees();
      } catch (souci) {
        console.error('Résumé des journées non chargé', souci);
      }
    }

    // LE DÉTAIL D'UN JOUR EST UNE TUILE VOLANTE (1er septembre 2026, demande de
    // Noé). Le gabarit est celui de tout le hub — `.ajout-volant` avec son fond
    // assombri et sa croix —, et `app.js` tient déjà ses trois fermetures : la
    // croix, le fond, Échap. Rien à rebrancher.
    //
    // ELLE EST REDESSINÉE À CHAQUE FOIS et dépliée à la main, comme la fenêtre
    // d'édition juste au-dessus : ici non plus il n'y a pas de sommaire à
    // presser — c'est une case du calendrier qui l'ouvre.
    const rendreJournee = () => {
      rendreCalendrierDesJournees();

      const hote = bloc('journee');
      if (!vueEtat.jour) {
        hote.innerHTML = '';
        return;
      }

      const jour = vueEtat.jour;
      const corps = construireLaJournee(jour, journeesVues.get(jour), {
        habitudes: etat.habitudes,
        // LES FAITS VIENNENT D'`etat.faits`, la MÊME source que la page des
        // habitudes et que le tableau de bord — jamais de ceux que `journeeDe`
        // rapporte pour ce jour-là. Deux sources pour une même coche finissent
        // par se contredire au premier clic, et c'est celle qu'on regarde qui
        // aurait tort. Ils couvrent 366 jours : le calendrier n'en montre pas
        // davantage.
        faits: etat.faits,
        livres: etat.livres,
        relue: relecture({ victoires: etat.victoires, intentions: etat.intentions }, depuisDateISO(jour)),
      });

      hote.innerHTML = `
        <details class="ajout ajout-volant jour-volant">
          <summary hidden></summary>
          <div class="ajout-fond" data-fermer-ajout></div>
          <div class="ajout-tuile jour-tuile">
            <p class="ajout-titre">
              <span>La journée</span>
              <button type="button" class="lien-discret bouton-mini bouton-retirer"
                data-fermer-ajout title="Fermer" aria-label="Fermer">×</button>
            </p>
            ${corps}
          </div>
        </details>`;

      const tuile = hote.querySelector('.ajout-volant');
      tuile.open = true;
      // REFERMER OUBLIE LE JOUR, quel que soit le chemin. Sans ça, rouvrir une
      // autre case rendrait d'abord l'ancienne — c'est le défaut que la fenêtre
      // d'édition de cette page a déjà rencontré, et il ne se voit qu'au geste
      // suivant.
      tuile.addEventListener('toggle', () => {
        if (tuile.open) return;
        vueEtat.jour = null;
        if (location.hash.startsWith('#perso/journee/')) {
          history.replaceState(null, '', '#perso/journee');
        }
        rendreCalendrierDesJournees();
      });
    };

    // CHARGER N'EST PAS OUVRIR (1er septembre 2026). Le tableau de bord a besoin
    // de la journée d'aujourd'hui — c'est de là que vient le mot du jour — sans
    // pour autant qu'une tuile s'ouvre sur l'écran au montage.
    async function chargerLaJournee(jour) {
      if (journeesVues.has(jour)) return;
      try {
        journeesVues.set(jour, await api.journeeDe(jour));
        if (vueEtat.jour === jour) rendreJournee();
      } catch (souci) {
        console.error('Journée non chargée', souci);
      }
    }

    async function ouvrirLaJournee(jour) {
      vueEtat.jour = jour;
      // LE JOUR VIT DANS L'ADRESSE (règle de la page depuis le 29 août : « une
      // journée se retrouve et se partage »). Elle était LUE — le routeur pose
      // `vueEtat.jour` depuis `#perso/journee/2026-08-29` — mais jamais ÉCRITE :
      // ni les flèches ni, maintenant, le calendrier ne la mettaient à jour. On
      // pouvait donc arriver sur un jour par un lien, pas en repartir avec.
      //
      // `replaceState` et NON `location.hash` : celui-ci relancerait le routeur
      // pour un jour qu'on vient déjà d'ouvrir, et chaque case cliquée
      // empilerait une entrée d'historique. L'adresse doit être partageable, pas
      // bavarde.
      //
      // Seulement DEPUIS la page des journées : `ouvrirLaJournee` sert aussi le
      // tableau de bord au montage — c'est de là que vient le mot du jour —, et
      // réécrire l'adresse à ce moment-là ferait changer de page tout seul.
      if (location.hash.startsWith('#perso/journee')) {
        history.replaceState(null, '', `#perso/journee/${jour}`);
      }
      // LE CALENDRIER SUIT LE JOUR CHOISI, mais ne saute pas de mois pour rien :
      // il ne se recale que si le jour sort de ce qu'il montre. Sans ça, ouvrir
      // le 31 août depuis la grille de septembre ramènerait tout en arrière.
      const montres = joursDeLaVue(vueEtat.joursVue, vueEtat.joursPivot ?? jour);
      if (!montres.includes(jour)) vueEtat.joursPivot = jour;
      rendreJournee();
      chargerLesResumes();
      return chargerLaJournee(jour);
    }

    const rendreTableau = () => {
      const jour = versDateISO();
      bloc('tableau').innerHTML = construireTableauPerso({
        jour,
        humeurDuJour: etat.humeurDuJour,
        etatsHabitudes: etatDesHabitudes({ habitudes: etat.habitudes, faits: etat.faits }),
        livre: livreEnCours(etat.livres, etat.seances),
        seances: etat.seances,
        rendezVous: etat.evenements,
        mot: journeesVues.get(jour)?.mot ?? null,
        relue: relecture(
          { victoires: etat.victoires, intentions: etat.intentions },
          new Date(),
        ),
      });
    };

    // CE QUE PORTE CHAQUE RAYON : ses œuvres, son journal, ses images signées.
    // Un seul endroit qui le dit — deux listes cherchées à la main dans chaque
    // geste auraient fini par se croiser.
    const donneesDuRayon = (cle) =>
      cle === 'films'
        ? { oeuvres: etat.films, seances: etat.seancesFilms, urls: etat.affiches }
        : { oeuvres: etat.livres, seances: etat.seances, urls: etat.couvertures };

    // LES TROIS ÉCRANS DE LA BIBLIOTHÈQUE SE REDESSINENT ENSEMBLE, et c'est
    // voulu : le hall montre ce qui est en cours dans les DEUX rayons, si bien
    // que noter des pages depuis l'étagère doit bouger le hall aussi. Trois
    // rendus séparés auraient fait trois occasions d'en oublier un.
    const rendreBibliotheque = ({ focusRecherche = false } = {}) => {
      bloc('bibliotheque').innerHTML = construireHall(
        { livres: donneesDuRayon('livres'), films: donneesDuRayon('films') },
        menuDiscret,
      );

      for (const cle of ['livres', 'films']) {
        bloc(`rayon-${cle}`).innerHTML = construireRayon(
          RAYONS[cle],
          donneesDuRayon(cle),
          vueEtat.rayons[cle],
          menuDiscret,
        );
      }

      // LE CURSEUR RESTE DANS LA RECHERCHE : on redessine à chaque lettre, et
      // sans ça le champ perdait le focus au premier caractère. Il revient au
      // BOUT du mot, jamais au début — sinon on taperait à l'envers. On le
      // cherche dans le rayon qu'on regarde : les deux étagères existent dans le
      // DOM, une seule est visible.
      if (focusRecherche) {
        const champ = bloc(`rayon-${vueEtat.rayon}`).querySelector('[data-recherche-oeuvre]');
        if (champ) {
          champ.focus();
          champ.setSelectionRange(champ.value.length, champ.value.length);
        }
      }
    };
    const rendreHabitudes = () => {
      bloc('habitudes').innerHTML = construireHabitudes(
        etatDesHabitudes({ habitudes: etat.habitudes, faits: etat.faits }),
        // Les faits BRUTS en plus : les graphiques regardent douze semaines en
        // arrière, ce que l'état d'une habitude — qui ne décrit que
        // l'aujourd'hui — ne porte pas.
        { habitudes: etat.habitudes, faits: etat.faits },
      );
    };
    const rendreHumeurDuJour = () => {
      bloc('humeur-jour').innerHTML = construireHumeurDuJour(etat.humeurDuJour);
    };

    // Quelle liste redessiner après un geste : la clé du menu discret porte
    // déjà la forme, il n'y a donc rien à deviner.
    const RENDUS = {
      habitude: () => { rendreHabitudes(); rendreTableau(); },
      livre: () => { rendreBibliotheque(); rendreTableau(); },
      film: () => { rendreBibliotheque(); rendreTableau(); },
      intention: () => rendreIntentions(),
    };

    const charger = async () => {
      // Un an de faits : l'élan n'en demande que soixante jours, la série en
      // veut cinquante-deux semaines. C'est quelques centaines de lignes au
      // plus, et le calcul n'a alors plus rien à redemander.
      //
      // LA COURBE DES 30 JOURS A DISPARU avec sa page (5 septembre 2026), et sa
      // requête avec elle : `humeurDepuis` n'était lue que par elle ici. Les
      // VICTOIRES et les ÉVÉNEMENTS restent chargés — les premières nourrissent
      // la relecture du jour, les seconds le prochain rendez-vous du tableau de
      // bord.
      const [
        intentions, evenements, victoires, humeurDuJour, habitudes, faits,
        livres, seances, films, seancesFilms,
      ] = await Promise.all([
          api.objectifsActifs({ espace: ESPACE }),
          api.evenementsEntre(new Date().toISOString(), horizon(), { espace: ESPACE }),
          api.victoiresDeLEspace(ESPACE),
          api.humeurDuJour(versDateISO()),
          api.habitudesToutes(),
          api.habitudesFaitsDepuis(versDateISO(ajouterJours(new Date(), -366))),
          api.rayonLivres.tous(),
          // Sans borne : l'avancée d'un livre commencé il y a un an doit rester
          // juste, et il n'y en aura jamais des milliers.
          api.rayonLivres.seancesDepuis('2000-01-01'),
          api.rayonFilms.tous(),
          api.rayonFilms.seancesDepuis('2000-01-01'),
        ]);

      Object.assign(etat, {
        intentions, evenements, victoires, humeurDuJour, habitudes, faits,
        livres, seances, films, seancesFilms,
      });
      rendreHabitudes();
      rendreBibliotheque();

      // LES IMAGES ARRIVENT APRÈS, et l'étagère se redessine quand elles sont
      // là : signer une poignée d'adresses ne doit pas retarder la page entière.
      // Sans image, pas de requête du tout — et une requête par RÉSERVE, jamais
      // par œuvre : la clé du garde-manger porte son bucket, sans quoi une
      // affiche ressortirait l'adresse d'une couverture.
      for (const [cle, oeuvres, garde] of [
        ['livres', livres, etat.couvertures],
        ['films', films, etat.affiches],
      ]) {
        const R = RAYONS[cle];
        const chemins = oeuvres.map((o) => imageDe(R, o)).filter(Boolean);
        if (!chemins.length) continue;
        R.api
          .urlsDesImages(chemins)
          .then((urls) => {
            Object.assign(garde, urls);
            rendreBibliotheque();
            rendreTableau();
          })
          .catch((souci) => console.error('Images non signées', souci));
      }
      rendreTableau();
      // La journée d'aujourd'hui nourrit AUSSI le tableau de bord : c'est de là
      // que vient le mot du jour. On la CHARGE sans l'ouvrir — depuis que le
      // détail est une tuile volante, l'ouvrir ferait s'afficher une fenêtre que
      // personne n'a demandée en arrivant sur la page.
      await chargerLaJournee(versDateISO());
      rendreTableau();
      // Une adresse qui porte un jour l'ouvre ; `#perso/journee` seul montre son
      // calendrier et attend qu'on choisisse.
      if (vueEtat.jour) await ouvrirLaJournee(vueEtat.jour);
      else {
        rendreCalendrierDesJournees();
        chargerLesResumes();
      }
      rendreIntentions();
    };

    // Revenir sur l'espace le relit : l'humeur du jour répondue sur l'accueil
    // doit apparaître dans la courbe sans recharger la page.
    this.rafraichir = charger;

    try {
      await charger();
    } catch (erreur) {
      console.error("Chargement de l'espace perso impossible", erreur);
      section.innerHTML = `
        <h1>Perso</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    // --- Ajouts ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        await appliquerAjout(formulaire.dataset.action, champs);
        // Les formulaires encore posés dans la page se referment eux-mêmes ;
        // la tuile volante, elle, a déjà été redessinée — son `<form>` est
        // détaché, et `closest` y répondrait `null`.
        formulaire.reset();
        formulaire.closest('.ajout')?.removeAttribute('open');
      } catch (souci) {
        console.error('Ajout impossible', souci);
        erreur.textContent = souci.message ?? "L'ajout a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    // LE MOT DU JOUR S'ENREGISTRE QUAND ON QUITTE LE CHAMP. Pas de bouton
    // « enregistrer » : c'est une ligne qu'on écrit en passant, et lui demander
    // un geste de plus la ferait ne jamais s'écrire.
    section.addEventListener(
      'blur',
      async (evenement) => {
        const champ = evenement.target.closest('[data-jour-mot]');
        if (!champ) return;
        const jour = champ.dataset.jourMot;
        // La colonne que ce champ écrit. `mot` par défaut : le tableau de bord
        // n'en a qu'un, et il ne dit pas son nom.
        const colonne = champ.dataset.jourChamp ?? 'mot';
        const valeur = champ.value.trim() || null;
        const gardee = journeesVues.get(jour);
        if (gardee && gardee[colonne] === valeur) return;

        try {
          await api.noterLaJournee(jour, colonne, valeur);
          if (gardee) gardee[colonne] = valeur;
        } catch (souci) {
          console.error('Journée non enregistrée', souci);
        }
      },
      // En capture : `blur` ne remonte pas.
      true,
    );

    // NOTER DES PAGES : l'écran d'abord, l'écriture derrière. La séance est
    // ajoutée à la liste locale, donc l'avancée et le rythme se recalculent
    // tout seuls — ils ne sont stockés nulle part.
    // --- LES TROIS ÉCRITURES DE LA LISTE ---
    //
    // L'écran d'abord, le réseau ensuite, et la valeur d'avant revient si
    // l'écriture échoue : la règle du hub (js/ecriture.js). Elles ne passent pas
    // par `modifierAussitot` parce qu'elles touchent un objet, pas une liste.
    const ecrireOeuvre = async (R, oeuvre, champs, mot) => {
      const avant = { ...oeuvre };
      Object.assign(oeuvre, champs);
      rendreBibliotheque();
      rendreTableau();

      try {
        // TERMINER UNE ŒUVRE ÉCRIT UNE VICTOIRE, et c'est `terminer` qui le
        // sait : passer par `modifier` la ferait manquer, alors que finir un
        // livre — ou un film — en est une. Même règle que sur sa fiche.
        if (champs.statut === R.fini) Object.assign(oeuvre, await R.api.terminer(avant, oeuvre.note));
        else Object.assign(oeuvre, await R.api.modifier(oeuvre.id, champs));
      } catch (souci) {
        console.error('Œuvre non modifiée', souci);
        Object.assign(oeuvre, avant);
        etat.message = `Ça n'a pas pu être enregistré — ${mot} est revenu${
          mot.startsWith('la') ? 'e' : ''
        }.`;
        rendreBibliotheque();
        rendreTableau();
      }
    };

    // L'œuvre qu'un geste vise : toujours celle du rayon qu'on regarde, sauf
    // quand le bouton dit le sien (la colonne « Ta lecture » du tableau de bord,
    // qui ne parle que de livres).
    const oeuvreVisee = (id, cleRayon = vueEtat.rayon) => {
      const R = RAYONS[cleRayon] ?? RAYONS.livres;
      return [R, donneesDuRayon(R.cle).oeuvres.find((o) => o.id === id)];
    };

    async function changerEtatDeLOeuvre(id, statut) {
      const [R, oeuvre] = oeuvreVisee(id);
      if (!oeuvre || statut === oeuvre.statut) return rendreBibliotheque();

      // Le hub pose les dates qu'il peut poser : commencer une œuvre écrit son
      // `commence_le`, la finir son `fini_le`.
      const champs = { statut };
      if (statut === 'en_cours' && !oeuvre.commence_le) champs.commence_le = versDateISO();
      if (statut === R.fini && !oeuvre.fini_le) champs.fini_le = versDateISO();
      return ecrireOeuvre(R, oeuvre, champs, "l'état");
    }

    async function basculerMotDeLOeuvre(id, mot) {
      const [R, oeuvre] = oeuvreVisee(id);
      if (!oeuvre) return;
      const poses = oeuvre[R.champs.mots] ?? [];
      return ecrireOeuvre(
        R,
        oeuvre,
        {
          [R.champs.mots]: poses.includes(mot)
            ? poses.filter((m) => m !== mot)
            : [...poses, mot],
        },
        `le ${R.vocabulaire.motSingulier}`,
      );
    }

    async function noterUneOeuvre(id, rang) {
      const [R, oeuvre] = oeuvreVisee(id);
      if (!oeuvre) return;
      // La même étoile retouchée efface la note, comme sur la fiche.
      return ecrireOeuvre(R, oeuvre, { note: oeuvre.note === rang ? null : rang }, 'la note');
    }

    // NOTER UNE QUANTITÉ — des pages, des épisodes. L'écran d'abord, l'écriture
    // derrière : la séance est ajoutée à la liste locale, donc l'avancée et le
    // rythme se recalculent tout seuls, puisqu'ils ne sont stockés nulle part.
    async function noterUneQuantite(cleRayon, id, combien) {
      if (!combien || Number.isNaN(combien)) return;
      const R = RAYONS[cleRayon] ?? RAYONS.livres;
      const journal = R.cle === 'films' ? 'seancesFilms' : 'seances';

      const provisoire = {
        id: `provisoire-${id}`,
        [R.champs.parent]: id,
        jour: versDateISO(),
        [R.champs.quantite]: combien,
      };
      const avant = [...etat[journal]];
      etat[journal] = [...etat[journal], provisoire];
      vueEtat.edition = null;
      rendreFenetre();
      rendreBibliotheque();
      rendreTableau();

      try {
        const seance = await R.api.noter(id, combien);
        etat[journal] = [...etat[journal].filter((s) => s.id !== provisoire.id), seance];
        // La lecture coche l'habitude : le bloc des habitudes doit le montrer
        // sans qu'on ait à recharger la page. Aucune habitude ne se déclare pour
        // les films — la relecture ne coûte alors qu'une requête de plus, une
        // fois par soirée.
        etat.faits = await api.habitudesFaitsDepuis(versDateISO(ajouterJours(new Date(), -366)));
        rendreHabitudes();
        rendreBibliotheque();
        rendreTableau();
      } catch (souci) {
        console.error('Séance non enregistrée', souci);
        etat[journal] = avant;
        rendreBibliotheque();
        rendreTableau();
      }
    }

    async function appliquerAjout(action, champs) {
      if (action !== 'enregistrer-perso') return;
      const { forme, id } = champs;

      if (forme === 'intention') {
        // Une intention est un objectif sans cible ni échéance — et le restera :
        // le formulaire ne propose ni l'une ni l'autre.
        const valeurs = {
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
        };

        if (id) {
          const intention = etat.intentions.find((i) => i.id === id);
          Object.assign(intention, await api.modifierObjectif(id, valeurs));
        } else {
          etat.intentions = [
            ...etat.intentions,
            await api.creerObjectif({ espace: ESPACE, ...valeurs }),
          ];
        }
        rendreIntentions();
      }

      if (forme === 'habitude') {
        const valeurs = {
          nom: champs.nom.trim(),
          // L'ÉMOJI NE S'ENREGISTRAIT PAS (2 septembre 2026, panne rapportée par
          // Noé : « ajouter un émoji ne fonctionne pas »). Le formulaire le
          // demandait depuis le 30 août, la base a sa colonne, et cet objet-ci
          // ne le reprenait pas : la valeur partait à la poubelle en silence,
          // sans erreur ni signe. Huit unités UTF-16 au plus — un émoji composé
          // en occupe plusieurs, une famille tient sur huit.
          emoji: champs.emoji?.trim().slice(0, 8) || null,
          cadence: champs.cadence ? Number(champs.cadence) : null,
          famille: champs.famille || null,
          pourquoi: champs.pourquoi?.trim() || null,
        };

        if (id) {
          const habitude = etat.habitudes.find((h) => h.id === id);
          Object.assign(habitude, await api.modifierHabitude(id, valeurs));
        } else {
          etat.habitudes = [
            ...etat.habitudes,
            await api.creerHabitude({ ...valeurs, ordre: etat.habitudes.length + 1 }),
          ];
        }
        rendreHabitudes();
      }

      // --- LA BIBLIOTHÈQUE : un seul chemin pour les deux rayons ---
      //
      // `forme` vaut « livre » ou « film » et dit lequel ; le reste est écrit
      // une fois. Deux branches jumelles auraient fini par ne plus enregistrer
      // les mêmes champs, et c'est dans la copie oubliée qu'un champ manque.
      if (forme === 'livre' || forme === 'film') {
        const R = RAYONS[champs.rayon] ?? RAYONS.livres;
        const valeurs = valeursDuFormulaire(R, champs);
        const donnees = donneesDuRayon(R.cle);

        // L'ENVOI D'UN FICHIER N'EST PAS OPTIMISTE, et c'est l'exception écrite
        // dans les conventions : on ne peut pas afficher une image qu'on n'a pas
        // encore. Le formulaire attend donc, comme celui du Carnet de terrain.
        //
        // Un champ vide n'efface rien : ne rien redonner, c'est garder ce qui
        // est là. C'est la règle de la durée qu'on passe au moment de cocher.
        const fichier = champs.image;
        const ancienne = id ? imageDe(R, donnees.oeuvres.find((o) => o.id === id) ?? {}) : null;
        if (fichier instanceof File && fichier.size) {
          valeurs[R.champs.image] = await R.api.televerserImage(fichier);
        }

        if (id) {
          const oeuvre = donnees.oeuvres.find((o) => o.id === id);
          Object.assign(oeuvre, await R.api.modifier(id, valeurs));
        } else {
          const posee = await R.api.creer({
            ...valeurs,
            commence_le: valeurs.statut === 'en_cours' ? versDateISO() : null,
          });
          if (R.cle === 'films') etat.films = [posee, ...etat.films];
          else etat.livres = [posee, ...etat.livres];
        }

        const posee = valeurs[R.champs.image];
        if (posee) {
          Object.assign(donnees.urls, await R.api.urlsDesImages([posee]));
          // L'ancienne n'est plus référencée par personne : elle part, sinon on
          // paie un fichier qu'on ne reverra jamais.
          if (ancienne && ancienne !== posee) await R.api.supprimerImage(ancienne);
        }
        rendreBibliotheque();
      }

      if (forme === 'quantite') {
        await noterUneQuantite(champs.rayon, champs.parent, Number(champs.combien));
      }

      if (forme === 'citation') {
        const R = RAYONS[champs.rayon] ?? RAYONS.livres;
        const oeuvre = donneesDuRayon(R.cle).oeuvres.find((o) => o.id === champs.parent);
        const gardee = await R.api.garderCitation(
          champs.parent,
          champs.texte.trim(),
          // Un entier pour une page, un texte libre pour un moment de film.
          R.vocabulaire.repereType === 'number'
            ? (champs.repere ? Number(champs.repere) : null)
            : (champs.repere?.trim() || null),
        );
        oeuvre.citations = [...(oeuvre.citations ?? []), gardee];
        rendreBibliotheque();
      }

      vueEtat.edition = null;
      rendreFenetre();
    }

    // LES MENUS DÉROULANTS DES FORMULAIRES (30 août 2026, après un rapport de
    // Noé : « je ne peux plus modifier une habitude »).
    //
    // Le défaut était PLUS LARGE que le symptôme, et plus ancien : perso
    // n'appelait `brancherChoix` nulle part. Ses champs de type « choix » —
    // la cadence et la famille d'une habitude, le statut d'un livre — sont un
    // input CACHÉ doublé d'un bouton et d'un panneau ; sans ce branchement, le
    // panneau ne s'ouvre pas et la valeur ne se pose jamais. Mesuré : cliquer
    // « 4 fois » laissait la cadence à 3, et le formulaire s'enregistrait
    // proprement — avec l'ancienne valeur. Aucune erreur, aucun signe.
    //
    // Perso n'a PAS de tuile de capture : `brancherChoix` est donc seul, sans
    // le risque de double traitement qui a fait retirer cet appel du site FCH
    // (deux gestionnaires basculent le panneau deux fois, il reste fermé).
    brancherChoix(section);

    // LA RECHERCHE FILTRE À LA LETTRE, sans bouton : une bibliothèque tient en
    // mémoire, il n'y a rien à demander au réseau, et un « Chercher » à presser
    // ferait payer un aller-retour à ce qui doit répondre sous le doigt.
    section.addEventListener('input', (evenement) => {
      const champ = evenement.target.closest('[data-recherche-oeuvre]');
      if (!champ) return;
      vueDuRayon().filtres.mot = champ.value;
      rendreBibliotheque({ focusRecherche: true });
    });

    section.addEventListener('click', async (evenement) => {
      const dans = (nom) => evenement.target.closest(`[data-${nom}]`);

      // Refermer la tuile volante efface AUSSI son état : elle est redessinée à
      // chaque rendu, et reviendrait donc ouverte au premier geste suivant.
      // C'est le défaut que `#objectifs` a rencontré le premier.
      if (evenement.target.closest('[data-fermer-ajout]')) {
        vueEtat.edition = null;
        rendreFenetre();
        return;
      }
      // LA TUILE D'UNE JOURNÉE N'EST PAS UNE TUILE D'AJOUT (1er septembre 2026,
      // défaut rapporté par Noé : « les flèches pour changer de jour sont
      // dysfonctionnelles »).
      //
      // Cette garde existe parce qu'une tuile volante ne contenait qu'un
      // FORMULAIRE : il se gère par son `submit` et par `brancherChoix`, et
      // laisser les clics tomber dans les branches ci-dessous en aurait fait
      // ouvrir d'autres. Depuis que le détail d'une journée vit lui aussi dans
      // une tuile, elle avalait ses flèches ET ses frimousses — tout ce qui s'y
      // clique passait à la trappe, sans un mot.
      //
      // La tuile de la journée est donc exclue par sa classe. Elle ne porte pas
      // non plus `data-ajout` : la branche juste en dessous y aurait vu une
      // demande d'ouvrir un formulaire « journee » qui n'existe pas.
      if (evenement.target.closest('.ajout-volant:not(.jour-volant)')) return;

      const ajout = dans('ajout');
      if (ajout) {
        // Le rayon voyage avec la fenêtre : c'est lui qui décide des mots du
        // formulaire et de la table où l'on écrit.
        vueEtat.edition = {
          forme: ajout.dataset.ajout,
          id: null,
          rayon: rayonDeLaForme(ajout.dataset.ajout)?.cle ?? vueEtat.rayon,
        };
        vueEtat.menu = null;
        rendreFenetre();
        RENDUS[ajout.dataset.ajout]?.();
        return;
      }

      // COCHER UNE HABITUDE. L'écran d'abord, l'écriture derrière — et l'élan,
      // la série et le palier se recalculent tout seuls, puisqu'ils ne sont
      // stockés nulle part : ils se déduisent des faits.
      // Deux attributs pour un même geste : `data-faire` sur la page des
      // habitudes, `data-faire-habitude` sur les jetons partagés avec l'accueil.
      // Le gabarit commun ne va pas renommer le sien pour cet écran-ci.
      const faire = dans('faire') ?? dans('faire-habitude');
      if (faire) {
        const id = faire.dataset.faire ?? faire.dataset.faireHabitude;
        const habitude = etat.habitudes.find((h) => h.id === id);
        // LE JOUR VIENT DU BOUTON quand il en porte un (1er septembre 2026) :
        // la tuile d'une journée coche POUR CETTE JOURNÉE-LÀ. Partout ailleurs
        // — la page des habitudes, le tableau de bord — c'est aujourd'hui, et
        // le bouton se tait.
        const jour = faire.dataset.jour ?? versDateISO();
        const cejour = jour === versDateISO();
        const dejaFait = etat.faits.some((f) => f.habitude_id === id && f.jour === jour);

        const avant = [...etat.faits];
        if (dejaFait) {
          etat.faits = etat.faits.filter((f) => !(f.habitude_id === id && f.jour === jour));
        } else {
          etat.faits = [...etat.faits, { habitude_id: id, jour }];
        }
        rendreHabitudes();
        rendreTableau();
        // SEUL LE BLOC DES HABITUDES SE REDESSINE, pas la tuile : le journal
        // vient peut-être de s'enregistrer sur son `blur`, et l'écriture est
        // encore en vol. C'est la même précaution que pour la note du jour.
        // LE TRI EST DYNAMIQUE (1er septembre 2026, demande de Noé) : décocher
        // une habitude la renvoie à la fin, avec celles qui n'ont pas été
        // faites. On redessine donc TOUT le bandeau, pas seulement le bouton —
        // mais toujours le bandeau SEUL, jamais la tuile : le journal vient
        // peut-être de s'enregistrer sur son `blur` et l'écriture est en vol.
        const redessinerLesHabitudes = () => {
          const bandeau = section.querySelector('[data-bloc-habitudes]');
          if (!bandeau) return;
          bandeau.outerHTML = construirePastillesHabitudes(jour, etat.habitudes, etat.faits);
        };
        redessinerLesHabitudes();

        try {
          if (dejaFait) {
            await api.demarquerHabitude(id, jour);
          } else {
            await api.marquerHabitude(id, jour);
            // LE PALIER S'ÉCRIT AU MOMENT OÙ ON LE FRANCHIT, et une seule fois.
            // On compare le total d'avant et celui d'après : si un palier est
            // passé entre les deux, il est franchi maintenant.
            const avantTotal = avant.filter((f) => f.habitude_id === id).length;
            const palier = PALIERS_HABITUDE.find(
              (p) => p > avantTotal && p <= avantTotal + 1,
            );
            if (palier) await api.victoireDePalier(habitude, palier);
          }
        } catch (souci) {
          console.error('Habitude non enregistrée', souci);
          etat.faits = avant;
          rendreHabitudes();
          rendreTableau();
          redessinerLesHabitudes();
        }
        // Le calendrier porte un point par espace : cocher une habitude en
        // allume un pour le perso.
        resumesVus.clear();
        chargerLesResumes();
        return;
      }

      // NOTER DES PAGES, le geste du livre en cours. Il coche aussi l'habitude de
      // lecture — noter des pages EST la preuve qu'on a lu, et redemander de
      // cocher juste après serait demander deux fois la même chose.
      // --- LES DEUX ENTRÉES, PUIS LES DEUX VUES DE LA BIBLIOTHÈQUE ---

      const rayon = dans('rayon');
      if (rayon) {
        vueEtat.rayon = rayon.dataset.rayon;
        rendreBibliotheque();
        return;
      }

      const vueOeuvres = dans('vue-oeuvres');
      if (vueOeuvres) {
        vueDuRayon().affichage = vueOeuvres.dataset.vueOeuvres;
        rendreBibliotheque();
        return;
      }

      if (dans('ouvrir-filtres')) {
        const vue = vueDuRayon();
        vue.ouverts = !vue.ouverts;
        vue.chip = null;
        rendreBibliotheque();
        return;
      }

      // L'ICÔNE DE TRI OUVRE SON PANNEAU DIRECTEMENT : c'est un réglage unique,
      // et le faire chercher dans une rangée qu'on vient d'ouvrir serait deux
      // gestes pour un.
      if (dans('ouvrir-tri')) {
        const vue = vueDuRayon();
        vue.ouverts = true;
        vue.chip = vue.chip === 'tri' ? null : 'tri';
        rendreBibliotheque();
        return;
      }

      const critere = dans('critere');
      if (critere) {
        const vue = vueDuRayon();
        vue.chip = vue.chip === critere.dataset.critere ? null : critere.dataset.critere;
        rendreBibliotheque();
        return;
      }

      // --- LES TROIS COLONNES QUI SE RÈGLENT SUR PLACE ---

      const cellule = dans('cellule');
      if (cellule) {
        const vue = vueDuRayon();
        vue.cellule = vue.cellule === cellule.dataset.cellule ? null : cellule.dataset.cellule;
        vue.chip = null;
        rendreBibliotheque();
        return;
      }

      const poserEtat = dans('poser-etat');
      if (poserEtat) {
        vueDuRayon().cellule = null;
        return changerEtatDeLOeuvre(poserEtat.dataset.poserEtat, poserEtat.dataset.valeur);
      }

      const poserMot = dans('poser-mot');
      if (poserMot) {
        // Le panneau RESTE ouvert : une œuvre porte souvent deux thèmes, et le
        // rouvrir à chaque coche serait un geste pour rien.
        return basculerMotDeLOeuvre(poserMot.dataset.poserMot, poserMot.dataset.valeur);
      }

      const noterOeuvre = dans('noter-oeuvre');
      if (noterOeuvre) {
        return noterUneOeuvre(noterOeuvre.dataset.noterOeuvre, Number(noterOeuvre.dataset.rang));
      }

      const trier = dans('trier');
      if (trier) {
        const cle = trier.dataset.trier;
        const vue = vueDuRayon();
        // LE MÊME TRI RETOUCHÉ SE RETOURNE : c'est le geste d'un en-tête de
        // colonne, et il évite un second bouton pour le sens.
        vue.tri =
          vue.tri.cle === cle
            ? { cle, sens: -vue.tri.sens }
            : { cle, sens: cle === 'note' ? -1 : 1 };
        rendreBibliotheque();
        return;
      }

      if (dans('vider-filtres')) {
        const vue = vueDuRayon();
        // Le mot cherché SURVIT : on vient de retirer des critères, pas de
        // renoncer à sa recherche.
        vue.filtres = { ...vue.filtres, statut: [], mots: [], note: [], nature: [] };
        rendreBibliotheque();
        return;
      }

      const filtreOeuvre = dans('filtre-oeuvre');
      if (filtreOeuvre) {
        const { filtreOeuvre: cle, valeur } = filtreOeuvre.dataset;
        const vue = vueDuRayon();
        const choisis = vue.filtres[cle] ?? [];
        // On coche et on décoche : le panneau RESTE ouvert, parce qu'on en
        // choisit souvent deux d'affilée.
        vue.filtres[cle] = choisis.includes(valeur)
          ? choisis.filter((v) => v !== valeur)
          : [...choisis, valeur];
        rendreBibliotheque();
        return;
      }

      // Un clic AILLEURS referme le panneau ouvert — jamais la rangée, qu'on
      // vient d'ouvrir exprès. Il arrive APRÈS les gestes ci-dessus : ceux-ci se
      // sont déjà servis.
      const vueBiblio = vueDuRayon();
      if (
        (vueBiblio.chip && !evenement.target.closest('.livres-critere')) ||
        (vueBiblio.cellule && !evenement.target.closest('.livre-ligne-cellule'))
      ) {
        vueBiblio.chip = null;
        vueBiblio.cellule = null;
        rendreBibliotheque();
      }

      // NOTER UNE QUANTITÉ, le geste de ce qu'on lit ou regarde. Côté livres il
      // coche aussi l'habitude de lecture — noter des pages EST la preuve qu'on a
      // lu, et redemander de cocher juste après serait demander deux fois la même
      // chose. `data-rayon-de` désigne le rayon quand le bouton ne vit pas dans
      // l'étagère : la colonne « Ta lecture » du tableau de bord ne parle que de
      // livres, quel que soit le rayon qu'on regardait en dernier.
      const quantite = dans('oeuvre-quantite');
      if (quantite) {
        return noterUneQuantite(
          quantite.dataset.rayonDe ?? vueEtat.rayon,
          quantite.dataset.oeuvreQuantite,
          Number(quantite.dataset.pas),
        );
      }

      const autre = dans('oeuvre-autre');
      if (autre) {
        vueEtat.edition = {
          forme: 'quantite',
          id: null,
          rayon: autre.dataset.rayonDe ?? vueEtat.rayon,
          parent: autre.dataset.oeuvreAutre,
        };
        rendreFenetre();
        return;
      }

      const citation = dans('oeuvre-citation');
      if (citation) {
        vueEtat.edition = {
          forme: 'citation',
          id: null,
          rayon: citation.dataset.rayonDe ?? vueEtat.rayon,
          parent: citation.dataset.oeuvreCitation,
        };
        rendreFenetre();
        return;
      }

      const fini = dans('oeuvre-fini');
      if (fini) {
        const [R, oeuvre] = oeuvreVisee(
          fini.dataset.oeuvreFini,
          fini.dataset.rayonDe ?? vueEtat.rayon,
        );
        if (!oeuvre) return;
        const avant = { statut: oeuvre.statut, fini_le: oeuvre.fini_le ?? null };
        Object.assign(oeuvre, { statut: R.fini, fini_le: versDateISO() });
        rendreBibliotheque();
        rendreTableau();
        try {
          Object.assign(oeuvre, await R.api.terminer(oeuvre, oeuvre.note));
        } catch (souci) {
          console.error('Œuvre non terminée', souci);
          Object.assign(oeuvre, avant);
          rendreBibliotheque();
          rendreTableau();
        }
        return;
      }

      const versUnJour = dans('jour-vers');
      if (versUnJour) return ouvrirLaJournee(versUnJour.dataset.jourVers);

      // CHANGER DE MOIS OU DE SEMAINE ne change PAS le jour ouvert : on regarde
      // ailleurs sans perdre ce qu'on lisait. C'est ce qui distingue une
      // navigation d'un choix — le détail ne bouge que lorsqu'on touche un jour.
      const versUnPivot = dans('jours-pivot');
      if (versUnPivot) {
        vueEtat.joursPivot = versUnPivot.dataset.joursPivot;
        rendreCalendrierDesJournees();
        return chargerLesResumes();
      }

      const versUneVue = dans('jours-vue');
      if (versUneVue) {
        vueEtat.joursVue = versUneVue.dataset.joursVue;
        // On repart du jour ouvert : passer du mois à la semaine doit montrer
        // LA semaine de ce jour-là, pas celle d'aujourd'hui.
        vueEtat.joursPivot = vueEtat.jour ?? versDateISO();
        rendreCalendrierDesJournees();
        return chargerLesResumes();
      }

      const menu = dans('menu');
      if (menu) {
        const [forme] = menu.dataset.menu.split(':');
        vueEtat.menu = vueEtat.menu === menu.dataset.menu ? null : menu.dataset.menu;
        vueEtat.confirme = null;
        RENDUS[forme]?.();
        return;
      }

      const modifier = dans('modifier');
      if (modifier) {
        const [forme, id] = modifier.dataset.modifier.split(':');
        const SOURCES_EDITION = {
          habitude: () => etat.habitudes.find((h) => h.id === id),
          livre: () => etat.livres.find((l) => l.id === id),
          film: () => etat.films.find((f) => f.id === id),
          intention: () => etat.intentions.find((i) => i.id === id),
        };
        const source = (SOURCES_EDITION[forme] ?? SOURCES_EDITION.intention)();
        vueEtat.edition = {
          forme,
          id,
          rayon: rayonDeLaForme(forme)?.cle ?? vueEtat.rayon,
          valeurs: source,
        };
        vueEtat.menu = null;
        rendreFenetre();
        RENDUS[forme]?.();
        return;
      }

      const supprimer = dans('supprimer');
      if (supprimer) {
        const [forme] = supprimer.dataset.supprimer.split(':');
        vueEtat.confirme = supprimer.dataset.supprimer;
        RENDUS[forme]?.();
        return;
      }

      if (dans('annuler-confirmation')) {
        const [forme] = (vueEtat.confirme ?? '').split(':');
        vueEtat.confirme = null;
        RENDUS[forme]?.();
        return;
      }

      // RETIRER, POUR LES TROIS FORMES : l'écran d'abord, l'écriture derrière,
      // et la ligne revient à sa place si ça n'a pas pu s'enregistrer. C'est la
      // mécanique du hub (js/ecriture.js) ; la page attendait l'aller-retour
      // Supabase en désactivant son bouton, ce qui fige le doigt 300 à 800 ms.
      const confirmer = dans('confirmer');
      if (confirmer) {
        const [forme, id] = confirmer.dataset.confirmer.split(':');
        vueEtat.menu = null;
        vueEtat.confirme = null;

        const RETRAITS = {
          habitude: [etat.habitudes, api.supprimerHabitude],
          livre: [etat.livres, api.rayonLivres.supprimer],
          film: [etat.films, api.rayonFilms.supprimer],
          intention: [etat.intentions, api.supprimerObjectif],
          'rendez-vous': [etat.evenements, api.supprimerEvenement],
          victoire: [etat.victoires, api.supprimerVictoire],
        };
        const [liste, effacer] = RETRAITS[forme] ?? [];
        if (!liste) return;

        const ligne = liste.find((l) => l.id === id);

        // L'IMAGE SE LIT AVANT, PAS DANS LE RAPPEL (2 septembre 2026).
        // `retirerAussitot` sort la ligne de la liste TOUT DE SUITE — c'est le
        // principe de l'écriture optimiste —, si bien qu'un `liste.find()` fait
        // au moment de l'écriture ne trouve plus rien : le chemin partait à
        // `undefined` et le fichier restait dans le stockage, payé et invisible.
        // *Mesuré : le livre supprimé, son image encore là.*
        const sonRayon = rayonDeLaForme(forme);
        const image = sonRayon && ligne ? imageDe(sonRayon, ligne) : null;

        return retirerAussitot(
          liste,
          ligne,
          () => (sonRayon ? effacer(id, image) : effacer(id)),
          { rendre: RENDUS[forme] },
        );
      }

      // RÉPONDRE À L'HUMEUR ICI (29 août 2026) : c'est la page de l'humeur, la
      // question doit pouvoir s'y poser. Elle passait uniquement par l'accueil.
      const niveau = dans('niveau');
      if (niveau) {
        // LE JOUR VIENT DU BOUTON (1er septembre 2026) : la note d'une journée
        // se pose depuis sa tuile, donc pour un jour qui n'est pas forcément
        // aujourd'hui. Sans `data-jour`, on écrivait la note d'hier sur la date
        // du jour — un défaut qui ne se voit qu'en relisant la courbe.
        const jour = niveau.dataset.jour ?? versDateISO();
        const cejour = jour === versDateISO();
        const gardee = journeesVues.get(jour);
        const avant = cejour ? etat.humeurDuJour : (gardee?.humeur ?? null);
        const pose = { niveau: Number(niveau.dataset.niveau), note: avant?.note ?? null };

        // L'écran d'abord, aux deux endroits qui la montrent.
        if (cejour) {
          etat.humeurDuJour = pose;
          rendreHumeurDuJour();
        }
        if (gardee) gardee.humeur = pose;
        // SEULE LA NOTE SE REDESSINE, pas la tuile entière : le journal juste
        // au-dessus vient de s'enregistrer sur son `blur`, et l'écriture est
        // encore en vol. Redessiner remettrait le texte d'avant dans le champ.
        const cadre = section.querySelector('[data-note-jour]');
        if (cadre) cadre.innerHTML = construireNoteDuJour(jour, pose);

        try {
          const ecrite = await api.enregistrerHumeur(jour, pose.niveau, avant?.note ?? null);
          if (cejour) etat.humeurDuJour = ecrite;
          if (gardee) gardee.humeur = ecrite;
          // Le calendrier des journées porte la frimousse : elle doit suivre.
          resumesVus.clear();
          chargerLesResumes();
        } catch (souci) {
          console.error('Humeur non enregistrée', souci);
          if (cejour) etat.humeurDuJour = avant;
          if (gardee) gardee.humeur = avant;
          if (cadre) cadre.innerHTML = construireNoteDuJour(jour, avant);
        }
        if (cejour) rendreHumeurDuJour();
        return;
      }

      if (dans('rouvrir-humeur')) {
        etat.humeurDuJour = null;
        rendreHumeurDuJour();
        return;
      }

      // Un appui ailleurs referme ce qui traîne.
      if (vueEtat.menu || vueEtat.confirme) {
        const [forme] = (vueEtat.menu ?? vueEtat.confirme).split(':');
        vueEtat.menu = null;
        vueEtat.confirme = null;
        RENDUS[forme]?.();
      }

    });
  },
};

function horizon() {
  const dans3Mois = new Date();
  dans3Mois.setMonth(dans3Mois.getMonth() + 3);
  return dans3Mois.toISOString();
}
