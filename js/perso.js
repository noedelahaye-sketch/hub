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
import { construireFormulaire, brancherChoix, flammeDeSerie } from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
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
const JOURS_COURBE = 30;

const FRIMOUSSES = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

// Les mêmes signes que la galerie du cap, dessinés et non écrits : le hub ne
// mélange pas les glyphes de police et les icônes.
const SIGNE = {
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  points: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"
    aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/>
    <circle cx="19" cy="12" r="1.6"/></svg>`,
};

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
  // LA BIBLIOTHÈQUE A DEUX VUES (2 septembre 2026) : l'étagère par défaut — on
  // ouvre cette page pour VOIR ses livres, pas pour en chercher un. La liste
  // s'atteint d'un geste quand on vient avec un nom en tête.
  vueLivres: 'etagere',
  filtresLivres: { mot: '', statut: null, theme: null, note: null },
};

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

const PAS_DE_PAGES = [10, 25];

function etoiles(note) {
  if (!note) return '';
  return `<span class="livre-note" role="img" aria-label="${note} sur 5">${'★'.repeat(
    note,
  )}${'☆'.repeat(5 - note)}</span>`;
}

// LES MOTS D'UN LIVRE, exportés depuis le 2 septembre 2026 : sa fiche les dit
// aussi, et deux listes finiraient par ne plus nommer le même état. « Reposé » et
// non « abandonné » — un livre qu'on lâche n'est pas un échec, et le mot compte.
export const MOTS_STATUT = { a_lire: 'à lire', en_cours: 'en cours', lu: 'lu', repose: 'reposé' };

// Ce que la fiche offre à changer, dans l'ordre d'une vie de livre.
export const ETATS_LIVRE = {
  a_lire: 'À lire',
  en_cours: 'En cours',
  lu: 'Lu',
  repose: 'Reposé',
};

// LES THÈMES (2 septembre 2026, demande de Noé : « filtrer selon la note, l'état
// ou le type de livre »). La liste vient de sa bibliothèque Notion, où elle
// s'était faite d'elle-même : psycho, roman, relation humaine, productivité.
//
// UN LIVRE EN PORTE PLUSIEURS — « The good life » est psycho ET relation
// humaine —, d'où un `text[]` en base et une pastille à choix multiple au
// formulaire. Une colonne texte aurait obligé à choisir, et on aurait choisi
// mal.
//
// LA BASE N'IMPOSE RIEN : pas de CHECK, pas de table. Un thème est un mot qu'on
// se donne, et la liste ci-dessous n'est qu'une commodité de saisie — elle
// s'allonge sans migration.
export const THEMES_LIVRE = {
  psycho: 'Psycho',
  relation: 'Relation humaine',
  productivite: 'Productivité',
  roman: 'Roman',
  essai: 'Essai',
  biographie: 'Biographie',
  metier: 'Métier',
  autre: 'Autre',
};

function livreDuHaut(livre, seances, urls = {}) {
  const { lues, part, rythme } = avanceeDuLivre(livre, seances);
  const citation = (livre.citations ?? []).at(-1);
  const url = livre.couverture ? urls[livre.couverture] : null;

  return `
    <article class="livre-encours${url ? ' avec-couverture' : ''}"
      data-livre="${echapper(livre.id)}">
      ${
        // LE LIVRE EN COURS PORTE SA COUVERTURE EN GRAND, à gauche de tout le
        // reste : c'est celui qu'on ouvre ce soir, et c'est la seule image de la
        // page qui mérite d'occuper de la place. Les autres tiennent en vignette
        // dans l'étagère.
        url
          ? `<span class="livre-encours-couverture"><img src="${echapper(url)}"
              alt="" loading="lazy" decoding="async"></span>`
          : ''
      }
      <!-- TOUT LE RESTE DANS UNE ENVELOPPE, et pas seulement quand il y a une
           couverture : deux structures selon les données finissent par diverger.
           Sans elle, les six enfants du bloc étaient six éléments de grille — la
           couverture ne pouvait pas se poser À CÔTÉ d'eux, seulement à côté du
           PREMIER, et un blanc de cent pixels s'ouvrait sous le titre. -->
      <div class="livre-encours-corps">
      <a class="livre-titre livre-titre-porte"
        href="#livre/${encodeURIComponent(livre.id)}">${echapper(livre.titre)}</a>
      ${livre.auteur ? `<span class="livre-auteur">${echapper(livre.auteur)}</span>` : ''}

      ${
        part === null
          ? ''
          : `<span class="livre-jauge" role="img" aria-label="${lues} pages sur ${livre.pages}"><i
               style="width:${Math.round(part * 100)}%"></i></span>`
      }

      <span class="livre-ligne">
        <span class="discret">${
          livre.pages ? `${lues} sur ${livre.pages} pages` : pluriel(lues, 'page')
        }${rythme ? ` · ${rythme} par jour de lecture` : ''}</span>
        <span class="livre-pas">
          ${PAS_DE_PAGES.map(
            (pas) =>
              `<button type="button" class="livre-pas-bouton" data-pages="${pas}"
                data-livre-pages="${echapper(livre.id)}">+${pas}</button>`,
          ).join('')}
          <button type="button" class="livre-pas-bouton" data-livre-autre="${echapper(livre.id)}"
            >autre</button>
        </span>
      </span>

      ${
        citation
          ? `<p class="livre-citation">« ${echapper(citation.texte)} »${
              citation.page ? `<span class="discret"> — p. ${citation.page}</span>` : ''
            }</p>`
          : ''
      }

      <span class="livre-gestes">
        <button type="button" class="lien-discret" data-livre-citation="${echapper(livre.id)}"
          >Garder une phrase</button>
        <button type="button" class="lien-discret" data-livre-fini="${echapper(livre.id)}"
          >Je l'ai fini</button>
      </span>
      </div>
      <!-- LE LIVRE EN COURS N'AVAIT PAS DE MENU (2 septembre 2026), et les
           couvertures l'ont rendu visible : c'est le livre qu'on voudrait
           illustrer en premier, et il était le seul qu'on ne pouvait ni modifier
           ni retirer sans le finir d'abord. Tous les autres l'ont depuis le
           29 août. -->
      ${menuDiscret('livre', livre.id)}
    </article>`;
}

// L'ÉTAGÈRE (2 septembre 2026, demande de Noé : « j'aimerais pouvoir rajouter la
// couverture du livre, ce qui permettrait d'avoir un aperçu visuel dans la
// bibliothèque »).
//
// UNE COUVERTURE SE RECONNAÎT AVANT DE SE LIRE, et c'est tout l'objet de la
// demande : une liste de titres se parcourt mot à mot, une étagère se balaie du
// regard. C'est le seul écran du hub où l'image passe devant le texte.
//
// UN LIVRE SANS COUVERTURE GARDE SA PLACE, en tuile pointillée avec son titre —
// le pointillé est déjà le signe du hub pour « déclaré, pas encore rempli », et
// une étagère à trous se lirait comme une bibliothèque incomplète plutôt que
// comme des couvertures qui manquent.
function tuileDeLivre(livre, urls, service) {
  const url = livre.couverture ? urls[livre.couverture] : null;

  return `
    <li class="livre-tuile${url ? '' : ' livre-sans-couverture'}"
      data-livre="${echapper(livre.id)}">
      <!-- TOUTE LA TUILE MÈNE À SA FICHE (2 septembre 2026, demande de Noé) :
           l'étagère COMPARE, la fiche dit tout — le journal de lecture, les
           citations, l'état et la note qu'on y règle. C'est la règle des deux
           rangs, appliquée un étage plus bas que les caps et les projets. -->
      <a class="livre-tuile-ouvrir" href="#livre/${encodeURIComponent(livre.id)}"
        aria-label="Ouvrir « ${echapper(livre.titre)} »"></a>
      <span class="livre-couverture">
        ${
          url
            // `loading="lazy"` : une étagère de trente livres ne descend pas
            // trente images pour en montrer six.
            ? `<img src="${echapper(url)}" alt="" loading="lazy" decoding="async">`
            : `<span class="livre-couverture-mot">${echapper(livre.titre)}</span>`
        }
      </span>
      <span class="livre-tuile-titre">${echapper(livre.titre)}</span>
      <span class="livre-tuile-service">${echapper(service)}</span>
      ${etoiles(livre.note)}
      ${menuDiscret('livre', livre.id)}
    </li>`;
}

// --- LA VUE LISTE : chercher un livre précis --------------------------------
//
// Demande de Noé (2 septembre 2026, une capture de sa base Notion à l'appui) :
// *« il faudrait que je puisse avoir une vue de ce type également pour pouvoir
// chercher un livre précis et filtrer selon la note, l'état ou le type de
// livre »*.
//
// DEUX VUES POUR DEUX QUESTIONS, et c'est ce qui justifie la bascule : l'étagère
// répond à « qu'est-ce que j'ai lu » — on la balaie du regard, sans rien
// chercher ; la liste répond à « où est CE livre » — on y vient avec un nom ou
// un critère en tête. Une seule vue aurait mal servi les deux.
//
// LA BASCULE REPREND `.affichages`, le groupe de boutons du calendrier : c'est
// le MÊME geste — choisir ce que la liste montre —, et écrire un troisième
// dessin pour un geste qui en a déjà deux, c'est fabriquer la divergence qu'on
// passe ensuite à rattraper.
export function construireFiltresLivres(vue, filtres, livres) {
  const compte = (cle, valeur) =>
    livres.filter((livre) =>
      cle === 'theme' ? (livre.themes ?? []).includes(valeur) : livre[cle] === valeur,
    ).length;

  // ON N'OFFRE QUE CE QUI EXISTE : un filtre « Biographie » sur une bibliothèque
  // qui n'en compte aucune est une porte sur une pièce vide. La liste des thèmes
  // se déduit donc des livres, et non de la liste de saisie.
  const themes = [...new Set(livres.flatMap((livre) => livre.themes ?? []))].sort(
    (a, b) => (THEMES_LIVRE[a] ?? a).localeCompare(THEMES_LIVRE[b] ?? b),
  );

  const groupe = (nom, cle, options, courant) =>
    options.length
      ? `<span class="livres-filtre" role="group" aria-label="${echapper(nom)}">
          <button type="button" class="livres-filtre-bouton${courant ? '' : ' actif'}"
            data-filtre-livre="${cle}" data-valeur=""
            aria-pressed="${!courant}">Tous</button>
          ${options
            .map(
              ([valeur, mot, n]) => `<button type="button"
                class="livres-filtre-bouton${courant === valeur ? ' actif' : ''}"
                data-filtre-livre="${cle}" data-valeur="${echapper(valeur)}"
                aria-pressed="${courant === valeur}"
                >${echapper(mot)} <span class="discret">${n}</span></button>`,
            )
            .join('')}
        </span>`
      : '';

  return `
    <div class="livres-barre">
      <span class="affichages" role="group" aria-label="Comment voir tes livres">
        <button type="button" class="${vue === 'etagere' ? 'actif' : ''}"
          data-vue-livres="etagere" aria-pressed="${vue === 'etagere'}">Étagère</button>
        <button type="button" class="${vue === 'liste' ? 'actif' : ''}"
          data-vue-livres="liste" aria-pressed="${vue === 'liste'}">Liste</button>
      </span>

      <!-- LA RECHERCHE EST TOUJOURS LÀ, dans les deux vues : chercher un titre
           qu'on a en tête n'a pas à commencer par changer de vue. -->
      <label class="livres-recherche">
        <span class="hors-ecran">Chercher un livre</span>
        <input type="search" data-recherche-livre value="${echapper(filtres.mot ?? '')}"
          placeholder="Chercher un titre, un auteur" autocomplete="off">
      </label>
    </div>

    ${
      vue === 'liste'
        ? `<div class="livres-filtres">
            ${groupe(
              'État',
              'statut',
              Object.entries(ETATS_LIVRE)
                .map(([cle, mot]) => [cle, mot, compte('statut', cle)])
                .filter(([, , n]) => n),
              filtres.statut,
            )}
            ${groupe(
              'Thème',
              'theme',
              themes.map((cle) => [cle, THEMES_LIVRE[cle] ?? cle, compte('theme', cle)]),
              filtres.theme,
            )}
            ${groupe(
              'Note',
              'note',
              [5, 4, 3, 2, 1]
                .map((rang) => [String(rang), '★'.repeat(rang), compte('note', rang)])
                .filter(([, , n]) => n),
              filtres.note,
            )}
          </div>`
        : ''
    }`;
}

// Le tri d'une liste : l'état d'abord — ce qu'on lit, puis ce qui attend, puis
// ce qui est fini —, la note ensuite, le titre enfin. On cherche rarement un
// livre par sa date de saisie.
const RANG_STATUT = { en_cours: 0, a_lire: 1, lu: 2, repose: 3 };

export function livresFiltres(livres, filtres) {
  const mot = (filtres.mot ?? '').trim().toLowerCase();

  return livres
    .filter((livre) => {
      if (filtres.statut && livre.statut !== filtres.statut) return false;
      if (filtres.theme && !(livre.themes ?? []).includes(filtres.theme)) return false;
      if (filtres.note && livre.note !== Number(filtres.note)) return false;
      if (!mot) return true;
      // Le titre ET l'auteur : on cherche « Marc Levy » aussi souvent qu'un
      // titre, et demander lequel des deux serait une question de plus.
      return `${livre.titre} ${livre.auteur ?? ''}`.toLowerCase().includes(mot);
    })
    .sort(
      (a, b) =>
        (RANG_STATUT[a.statut] ?? 9) - (RANG_STATUT[b.statut] ?? 9) ||
        (b.note ?? 0) - (a.note ?? 0) ||
        a.titre.localeCompare(b.titre),
    );
}

// LA LISTE : une ligne par livre, les colonnes de sa base Notion — le titre, ses
// thèmes, son état, sa note, son auteur. Toute la ligne mène à sa fiche.
function ligneDeLivre(livre) {
  return `
    <li class="livre-ligne-liste">
      <a class="livre-ligne-ouvrir" href="#livre/${encodeURIComponent(livre.id)}">
        <span class="livre-ligne-nom">${echapper(livre.titre)}</span>
        <span class="livre-ligne-themes">${(livre.themes ?? [])
          .map(
            (theme) => `<span class="livre-theme" data-theme="${echapper(theme)}"
              >${echapper(THEMES_LIVRE[theme] ?? theme)}</span>`,
          )
          .join('')}</span>
        <span class="livre-ligne-etat" data-etat="${echapper(livre.statut)}">
          <span class="cap-etat-point" aria-hidden="true"></span>${echapper(
            ETATS_LIVRE[livre.statut] ?? livre.statut,
          )}</span>
        <span class="livre-ligne-note">${
          livre.note ? etoiles(livre.note) : '<span class="discret">—</span>'
        }</span>
        <span class="livre-ligne-auteur discret">${echapper(livre.auteur ?? '')}</span>
      </a>
      ${menuDiscret('livre', livre.id)}
    </li>`;
}

export function construireBibliotheque(livres, seances, urls = {}, vue = 'etagere', filtres = {}) {
  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="livre">
      ${SIGNE.plus}<span>Ajouter un livre</span></button>`;

  if (!livres.length) {
    return `
      <p class="vide">Tes livres s'écriront ici. Même ceux que tu n'as pas finis.</p>
      ${ajout}`;
  }

  const barre = construireFiltresLivres(vue, filtres, livres);

  // LA LISTE NE MET PERSONNE EN VEDETTE : on y vient avec un nom en tête, et
  // sortir le livre en cours du rang le rendrait introuvable là où on le
  // cherche. L'étagère, elle, le montre en grand — c'est celui qu'on ouvre ce
  // soir.
  if (vue === 'liste') {
    const retenus = livresFiltres(livres, filtres);
    return `
      ${barre}
      ${
        retenus.length
          ? `<ul class="livres-liste-table">${retenus.map(ligneDeLivre).join('')}</ul>`
          : `<p class="cap-vide">Aucun livre ne répond à ça. Retire un filtre,
             ou change le mot cherché.</p>`
      }
      ${ajout}`;
  }

  // L'étagère respecte la recherche, elle : chercher un titre n'a pas à obliger
  // de changer de vue. Les filtres, eux, n'existent que dans la liste — c'est là
  // qu'on trie, pas là qu'on regarde.
  const vus = livresFiltres(livres, { mot: filtres.mot });
  const encours = livreEnCours(vus, seances);
  const autres = vus.filter((livre) => livre.id !== encours?.id);

  return `
    ${barre}
    ${encours ? livreDuHaut(encours, seances, urls) : ''}
    ${
      autres.length
        ? `<ul class="livres-etagere">${autres
            .map((livre) => {
              const { lues } = avanceeDuLivre(livre, seances);
              const service = [
                MOTS_STATUT[livre.statut] ?? livre.statut,
                livre.auteur ?? '',
                livre.statut === 'repose' && lues ? `${lues} pages lues` : '',
              ].filter(Boolean);

              return tuileDeLivre(livre, urls, service.join(' · '));
            })
            .join('')}</ul>`
        : ''
    }
    ${ajout}`;
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
      ${construireHumeurDuJour(humeurDuJour)}

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
                     ${PAS_DE_PAGES.map(
                       (pas) =>
                         `<button type="button" class="livre-pas-bouton" data-pages="${pas}"
                           data-livre-pages="${echapper(livre.id)}">+${pas}</button>`,
                     ).join('')}
                     <!-- « autre » ouvre le champ où l'on tape le nombre exact
                          (2 septembre 2026, demande de Noé). Il existait sur la
                          bibliothèque depuis le premier jour et manquait ICI,
                          c'est-à-dire sur l'écran où l'on note vraiment ses
                          pages tous les soirs : +10 et +25 ne sont que des
                          raccourcis, et une lecture fait rarement un compte
                          rond. Le geste est déjà branché pour les deux écrans —
                          rien à câbler, seulement à offrir. -->
                     <button type="button" class="livre-pas-bouton"
                       data-livre-autre="${echapper(livre.id)}">autre</button>
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
        ${porte('#perso/habitudes', 'Tes habitudes')}
        ${porte('#perso/bibliotheque', 'Ta bibliothèque')}
        ${porte('#perso/journee', 'Mes journées')}
        ${porte('#perso/intentions', 'Tes intentions')}
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

// LES RENDEZ-VOUS AVEC SOI-MÊME, en lignes et non en cartes. Ils n'ont pas
// besoin d'une tuile : ce qu'on vient y lire tient en une ligne — quoi, quand,
// où. Ce sont les intentions qui portent des tuiles, parce qu'elles portent une
// phrase à relire.
//
// LA FAMILLE S'AFFICHE ENFIN (29 août 2026). Le formulaire la demandait depuis
// le 27 août et la page ne la rendait jamais : on posait une question dont on
// ne faisait rien, ce qui est la meilleure façon d'obtenir des réponses vides.
// Elle reste en encre discrète, à côté du lieu — un rendez-vous se lit d'abord
// par son nom.
//
// Elle ne compte RIEN, et ne comptera rien ici : les planchers qu'elle alimente
// sont calculés en interne et ne s'affichent nulle part. Voir `PLANCHER_PERSO`
// (js/orientation.js) — l'espace perso ne mesure pas.
export function construireRendezVous(evenements) {
  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="rendez-vous">
      ${SIGNE.plus}<span>Ajouter un rendez-vous</span></button>`;

  if (!evenements.length) {
    return `
      <p class="vide">Rien de prévu. Le premier moment que tu te réserves s'écrira ici.</p>
      ${ajout}`;
  }

  return `
    <ul class="perso-lignes">
      ${evenements
        .map((rdv) => {
          const service = [
            momentLisible(new Date(rdv.date_debut)),
            rdv.lieu ?? '',
            FAMILLES_PERSO[rdv.famille] ?? '',
          ].filter(Boolean);

          return `
        <li class="perso-ligne">
          <span class="perso-ligne-corps">
            <span class="perso-ligne-titre">${echapper(rdv.titre)}</span>
            <span class="perso-ligne-service">${echapper(service.join(' · '))}</span>
          </span>
          ${menuDiscret('rendez-vous', rdv.id, { sansModifier: true })}
        </li>`;
        })
        .join('')}
    </ul>
    ${ajout}`;
}

// LES VICTOIRES, en lignes elles aussi. Elles tenaient dans des cartes hautes
// de trois lignes pour un mot — « Courir » —, avec leur date perdue en haut à
// droite. Une victoire perso est courte par nature ; sa forme doit l'être.
//
// La date passe À DROITE SUR LA MÊME LIGNE, comme partout ailleurs dans le hub.
// Et une porte s'ouvre vers « Le chemin » : cette page-là n'existait pas quand
// ce bloc a été écrit, et elle montre les mêmes victoires au milieu de toutes
// les autres — le perso au même rang que le pro, ce que la philosophie demande.
export function construireVictoiresPerso(victoires) {
  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="victoire">
      ${SIGNE.plus}<span>Ajouter une victoire</span></button>`;

  if (!victoires.length) {
    return `
      <p class="vide">Tes premières victoires s'afficheront ici. Une belle séance en est une.</p>
      ${ajout}`;
  }

  return `
    <ul class="perso-lignes">
      ${victoires
        .map(
          (victoire) => `
        <li class="perso-ligne">
          <span class="perso-ligne-corps">
            <span class="perso-ligne-titre">${echapper(victoire.titre)}</span>
          </span>
          <span class="perso-ligne-date">${echapper(jourCourt(victoire.date))}</span>
          ${menuDiscret('victoire', victoire.id, { sansModifier: true })}
        </li>`,
        )
        .join('')}
    </ul>
    <span class="perso-gestes">
      ${ajout}
      <a class="cap-ajout-discret" href="#chemin"><span>Tout le chemin</span></a>
    </span>`;
}

function jourCourt(iso) {
  if (!iso) return '';
  const date = depuisDateISO(iso);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// L'HUMEUR, ET ON PEUT ENFIN Y RÉPONDRE ICI (29 août 2026, choix de Noé). La
// page montrait la courbe sans permettre d'y ajouter un point : pour répondre,
// il fallait passer par l'accueil. C'est la page de l'humeur, la question doit
// s'y poser.
//
// L'échelle est celle de l'accueil, au glyphe près — cinq frimousses, puis la
// seule choisie une fois répondu. Une question posée de deux façons selon
// l'écran deviendrait deux questions.
const NIVEAUX_HUMEUR = [
  { niveau: 1, frimousse: '😔', mot: 'difficile' },
  { niveau: 2, frimousse: '😕', mot: 'bof' },
  { niveau: 3, frimousse: '😐', mot: 'ça va' },
  { niveau: 4, frimousse: '🙂', mot: 'bien' },
  { niveau: 5, frimousse: '😄', mot: 'super' },
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

// La courbe des 30 derniers jours. Un trait, des points, deux frimousses en
// guise d'échelle — pas d'axe chiffré, pas de moyenne, pas de verdict : la
// courbe se regarde, elle ne se note pas.
//
// ELLE OCCUPE VRAIMENT SA PLACE depuis le 29 août : elle tenait dans 320 px de
// large et 96 de haut, perdue dans une colonne qui en faisait le double. La
// géométrie est la même, à l'échelle près — un `viewBox` plus grand et une
// amplitude verticale qui suit, sinon la ligne s'aplatit à mesure qu'on
// l'agrandit et cesse de dire quoi que ce soit.
export function construireCourbeHumeur(entrees, maintenant = new Date()) {
  if (!entrees.length) {
    return `<p class="vide">Ta courbe se dessinera au fil des matins.</p>`;
  }

  const largeur = 560;
  const hauteur = 168;
  const gauche = 34; // place des frimousses d'échelle
  const droite = 12;
  const haut = 22;
  const bas = 146;
  const pas = (largeur - gauche - droite) / (JOURS_COURBE - 1);
  const marche = (bas - haut) / 4; // quatre intervalles pour cinq niveaux

  const debut = ajouterJours(maintenant, -(JOURS_COURBE - 1));
  debut.setHours(0, 0, 0, 0);

  const points = entrees
    .map((entree) => {
      const jour = Math.round((depuisDateISO(entree.date) - debut) / 86400000);
      if (jour < 0 || jour >= JOURS_COURBE) return null;
      return {
        x: gauche + jour * pas,
        y: bas - (entree.niveau - 1) * marche,
        entree,
      };
    })
    .filter(Boolean);

  if (!points.length) {
    return `<p class="vide">Ta courbe se dessinera au fil des matins.</p>`;
  }

  const trait =
    points.length > 1
      ? `<polyline points="${points.map((p) => `${p.x},${p.y}`).join(' ')}"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linejoin="round" stroke-linecap="round" opacity="0.5" />`
      : '';

  const ronds = points
    .map(
      (p) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="currentColor">
        <title>${echapper(p.entree.date)} — ${FRIMOUSSES[p.entree.niveau] ?? ''}${
          p.entree.note ? ` · ${echapper(p.entree.note)}` : ''
        }</title>
      </circle>`,
    )
    .join('');

  return `
    <svg class="courbe-humeur" viewBox="0 0 ${largeur} ${hauteur}"
      role="img" aria-label="Ton humeur sur les ${JOURS_COURBE} derniers jours">
      <text x="0" y="${haut + 6}" font-size="16">${FRIMOUSSES[5]}</text>
      <text x="0" y="${bas + 6}" font-size="16">${FRIMOUSSES[1]}</text>
      ${trait}
      ${ronds}
    </svg>
    <p class="discret note-courbe">Les ${JOURS_COURBE} derniers jours. Les jours sans réponse restent vides, et c'est très bien comme ça.</p>
  `;
}

// LA PAGE EN DEUX TEMPS (29 août 2026, choix de Noé) : la galerie d'intentions
// prend toute la largeur, puis deux colonnes.
//
// LES INTENTIONS GARDENT LA LARGEUR parce qu'elles sont le cap de perso — ce
// qu'on relit quand on ne sait plus pourquoi on fait les choses. Les mettre en
// colonne les aurait rangées au même rang que le reste, or elles ne le sont
// pas.
//
// Dessous : ce qui VIENT à gauche (les rendez-vous), ce qui EST PASSÉ à droite
// (l'humeur, les victoires). C'est la seule division qui tienne ici — il n'y a
// rien à faire dans cet espace, donc rien à ranger par urgence.
//
// Les quatre blocs empilés pleine largeur laissaient les deux tiers de l'écran
// vides sur ordinateur, et une courbe de 320 px flottait dans une colonne qui
// en faisait 750.
function squelette() {
  return `
    <h1 data-titre>Perso</h1>
    <p class="discret sous-titre" data-sous-titre>La vie hors espaces — sport, sorties, temps pour toi.</p>

    <!-- LE TABLEAU DE BORD : ce qu'on voit sans avoir rien demandé. Il ne porte
         que ce qui évolue et sur quoi on agit — voir construireTableauPerso.
         Les six autres blocs sont des VUES : le menu les offre une à une, et
         l'adresse #perso seule ne montre que celui-ci. -->
    <div data-bloc="tableau" data-vue="tableau"></div>

    <section class="bloc" data-vue="intentions">
      <h2>Intentions</h2>
      <div data-bloc="intentions"><p class="vide">…</p></div>
    </section>

    <section class="bloc" data-vue="habitudes">
      <h2>Tes habitudes</h2>
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

    <section class="bloc" data-vue="bibliotheque">
      <h2>Ta bibliothèque</h2>
      <div data-bloc="bibliotheque"><p class="vide">…</p></div>
    </section>

    <div class="perso-colonnes">
      <section class="bloc" data-vue="rendez-vous">
        <h2>Rendez-vous avec toi-même</h2>
        <div data-bloc="evenements"><p class="vide">…</p></div>
      </section>

      <div class="perso-colonne">
        <section class="bloc" data-vue="humeur">
          <h2>Ton humeur</h2>
          <div data-bloc="humeur-jour"></div>
          <div data-bloc="humeur"><p class="vide">…</p></div>
        </section>

        <section class="bloc" data-vue="victoires">
          <h2>Victoires</h2>
          <div data-bloc="victoires"><p class="vide">…</p></div>
        </section>
      </div>
    </div>

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
  'rendez-vous': {
    ajouter: 'Ajouter un rendez-vous',
    champs: () => [
      { nom: 'titre', libelle: 'Rendez-vous', type: 'text', requis: true },
      { nom: 'date_debut', libelle: 'Quand', type: 'datetime-local', requis: true },
      // Ce que ce moment sert. La même question que la pastille « Famille » de
      // la tuile de capture : un rendez-vous pris ici ne doit pas rester muet
      // là où tous les autres parlent.
      {
        nom: 'famille',
        libelle: 'Famille (facultatif)',
        type: 'choix',
        options: FAMILLES_PERSO_CHOIX,
        valeur: '',
      },
      { nom: 'lieu', libelle: 'Lieu (facultatif)', type: 'text' },
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
  livre: {
    ajouter: 'Ajouter un livre',
    modifier: 'Modifier le livre',
    champs: (v) => [
      { nom: 'titre', libelle: 'Titre', type: 'text', requis: true, valeur: v.titre },
      { nom: 'auteur', libelle: 'Auteur (facultatif)', type: 'text', valeur: v.auteur },
      // LA COUVERTURE (2 septembre 2026, demande de Noé) — une photo qu'on
      // prend, jamais un lien collé : l'image vit dans le hub, elle ne peut pas
      // disparaître, et regarder sa bibliothèque ne prévient personne.
      //
      // `capture` n'est PAS posé : sur téléphone il forcerait l'appareil photo,
      // alors qu'une couverture se prend aussi bien dans la pellicule. Le
      // navigateur offre les deux quand on ne choisit pas à sa place.
      {
        nom: 'couverture',
        libelle: v.couverture ? 'Changer la couverture' : 'Couverture (facultatif)',
        type: 'file',
        accepte: 'image/*',
      },
      {
        nom: 'pages',
        libelle: 'Nombre de pages (facultatif)',
        type: 'number',
        valeur: v.pages ?? '',
      },
      {
        nom: 'themes',
        libelle: 'Thèmes',
        mot: 'thème',
        type: 'choix-multiple',
        options: THEMES_LIVRE,
        valeur: v.themes ?? [],
      },
      {
        nom: 'statut',
        libelle: 'Où il en est',
        type: 'choix',
        // « Reposé » et non « abandonné » : un livre qu'on lâche n'est pas un
        // échec, et le mot compte.
        options: { a_lire: 'À lire', en_cours: 'En cours', lu: 'Lu', repose: 'Reposé' },
        valeur: v.statut ?? 'en_cours',
      },
      {
        nom: 'note',
        libelle: 'Ta note (une fois lu)',
        type: 'choix',
        options: { '': 'Pas encore', 1: '★', 2: '★★', 3: '★★★', 4: '★★★★', 5: '★★★★★' },
        valeur: v.note ? String(v.note) : '',
      },
    ],
  },
  citation: {
    ajouter: 'Garder une phrase',
    champs: () => [
      { nom: 'texte', libelle: 'La phrase', type: 'textarea', requis: true },
      { nom: 'page', libelle: 'Page (facultatif)', type: 'number' },
    ],
  },
  pages: {
    ajouter: 'Combien de pages',
    champs: () => [{ nom: 'pages', libelle: 'Pages lues', type: 'number', requis: true }],
  },
  victoire: {
    ajouter: 'Ajouter une victoire',
    champs: () => [{ nom: 'titre', libelle: 'Victoire', type: 'text', requis: true }],
  },
};

function laFenetre() {
  if (!vueEtat.edition) return '';
  const { forme, id } = vueEtat.edition;
  const modele = FORMULAIRES[forme];
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
            <input type="hidden" name="parent" value="${echapper(vueEtat.edition.parent ?? '')}">`,
  });
}

// LES QUATRE VUES DE PERSO (28 août 2026) — le menu les offre une à une, et
// c'est la MÊME page dont on cache trois blocs sur quatre. Ni second écran, ni
// second chargement : les écouteurs sont posés sur la section et survivent.
const VUES = {
  intentions: ['Les intentions', 'Ce que tu veux tenir, sans mesure ni date.'],
  habitudes: ['Tes habitudes', "Le rythme que tu tiens, et rien qui puisse s'écrouler."],
  bibliotheque: ['Ta bibliothèque', 'Ce que tu lis, à ton rythme et sans quota.'],
  journee: ['Mes journées', "Ce qu'il s'est passé, jour après jour. Rien à remplir."],
  victoires: ['Les victoires', 'Une belle séance compte autant qu\'un post réussi.'],
  'rendez-vous': ['Les rendez-vous', 'Les moments que tu te réserves.'],
  humeur: ['Ton humeur', 'Les 30 derniers jours, sans relance ni reproche.'],
};

function appliquerLaVue(section, route) {
  const vue = route?.vue in VUES ? route.vue : null;
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

  // La colonne de droite se retire quand elle ne porte plus rien : sans ça,
  // demander `#perso/rendez-vous` laisserait une piste de grille vide à côté,
  // et le bloc restant n'occuperait que la moitié de l'écran pour rien.
  const colonne = section.querySelector('.perso-colonne');
  if (colonne) {
    colonne.hidden = [...colonne.querySelectorAll('[data-vue]')].every((b) => b.hidden);
  }
  const colonnes = section.querySelector('.perso-colonnes');
  if (colonnes) {
    colonnes.hidden = [...colonnes.querySelectorAll('[data-vue]')].every((b) => b.hidden);
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
    // regarnissent d'un chargement à l'autre (voir `urlsDesCouvertures`).
    const etat = { intentions: [], evenements: [], victoires: [], humeurDuJour: null, habitudes: [], faits: [], livres: [], seances: [], couvertures: {} };
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
    const rendreVictoires = () => {
      bloc('victoires').innerHTML = construireVictoiresPerso(etat.victoires);
    };
    const rendreEvenements = () => {
      bloc('evenements').innerHTML = construireRendezVous(etat.evenements);
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

    const rendreBibliotheque = ({ focusRecherche = false } = {}) => {
      const hote = bloc('bibliotheque');
      hote.innerHTML = construireBibliotheque(
        etat.livres,
        etat.seances,
        etat.couvertures,
        vueEtat.vueLivres,
        vueEtat.filtresLivres,
      );
      // LE CURSEUR RESTE DANS LA RECHERCHE : on redessine à chaque lettre, et
      // sans ça le champ perdait le focus au premier caractère. Il revient au
      // BOUT du mot, jamais au début — sinon on taperait à l'envers.
      if (focusRecherche) {
        const champ = hote.querySelector('[data-recherche-livre]');
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
      intention: () => rendreIntentions(),
      'rendez-vous': () => rendreEvenements(),
      victoire: () => rendreVictoires(),
    };

    const charger = async () => {
      const depuis = versDateISO(ajouterJours(new Date(), -(JOURS_COURBE - 1)));
      // Un an de faits : l'élan n'en demande que soixante jours, la série en
      // veut cinquante-deux semaines. C'est quelques centaines de lignes au
      // plus, et le calcul n'a alors plus rien à redemander.
      const [intentions, evenements, victoires, humeur, humeurDuJour, habitudes, faits, livres, seances] =
        await Promise.all([
          api.objectifsActifs({ espace: ESPACE }),
          api.evenementsEntre(new Date().toISOString(), horizon(), { espace: ESPACE }),
          api.victoiresDeLEspace(ESPACE),
          api.humeurDepuis(depuis),
          api.humeurDuJour(versDateISO()),
          api.habitudesToutes(),
          api.habitudesFaitsDepuis(versDateISO(ajouterJours(new Date(), -366))),
          api.livresTous(),
          // Sans borne : l'avancée d'un livre commencé il y a un an doit rester
          // juste, et il n'y en aura jamais des milliers.
          api.livresSeancesDepuis('2000-01-01'),
        ]);

      Object.assign(etat, {
        intentions, evenements, victoires, humeurDuJour, habitudes, faits, livres, seances,
      });
      rendreHabitudes();
      rendreBibliotheque();

      // LES COUVERTURES ARRIVENT APRÈS, et l'étagère se redessine quand elles
      // sont là : signer une poignée d'adresses ne doit pas retarder la page
      // entière. Sans couverture, pas de requête du tout.
      const chemins = livres.map((livre) => livre.couverture).filter(Boolean);
      if (chemins.length) {
        api
          .urlsDesCouvertures(chemins)
          .then((urls) => {
            Object.assign(etat.couvertures, urls);
            rendreBibliotheque();
            rendreTableau();
          })
          .catch((souci) => console.error('Couvertures non signées', souci));
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
      rendreVictoires();
      rendreEvenements();
      rendreHumeurDuJour();
      bloc('humeur').innerHTML = construireCourbeHumeur(humeur);
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
    async function noterDesPages(livreId, pages) {
      if (!pages || Number.isNaN(pages)) return;
      const provisoire = {
        id: `provisoire-${livreId}`,
        livre_id: livreId,
        jour: versDateISO(),
        pages,
      };
      const avant = [...etat.seances];
      etat.seances = [...etat.seances, provisoire];
      vueEtat.edition = null;
      rendreFenetre();
      rendreBibliotheque();

      try {
        const seance = await api.noterDesPages(livreId, pages);
        etat.seances = [...etat.seances.filter((s) => s.id !== provisoire.id), seance];
        // La lecture coche l'habitude : le bloc des habitudes doit le montrer
        // sans qu'on ait à recharger la page.
        etat.faits = await api.habitudesFaitsDepuis(versDateISO(ajouterJours(new Date(), -366)));
        rendreHabitudes();
        rendreBibliotheque();
      } catch (souci) {
        console.error('Pages non enregistrées', souci);
        etat.seances = avant;
        rendreBibliotheque();
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

      if (forme === 'livre') {
        const valeurs = {
          titre: champs.titre.trim(),
          auteur: champs.auteur?.trim() || null,
          pages: champs.pages ? Number(champs.pages) : null,
          statut: champs.statut,
          note: champs.note ? Number(champs.note) : null,
          // Le champ caché d'un choix multiple porte ses clés séparées par des
          // virgules : c'est la forme que `FormData` sait transporter.
          themes: (champs.themes ?? '').split(',').filter(Boolean),
        };

        // L'ENVOI D'UN FICHIER N'EST PAS OPTIMISTE, et c'est l'exception écrite
        // dans les conventions : on ne peut pas afficher une image qu'on n'a pas
        // encore. Le formulaire attend donc, comme celui du Carnet de terrain.
        //
        // Un champ vide n'efface rien : ne rien redonner, c'est garder ce qui
        // est là. C'est la règle de la durée qu'on passe au moment de cocher.
        const fichier = champs.couverture;
        const ancienne = id ? etat.livres.find((l) => l.id === id)?.couverture : null;
        if (fichier instanceof File && fichier.size) {
          valeurs.couverture = await api.televerserCouverture(fichier);
        }

        if (id) {
          const livre = etat.livres.find((l) => l.id === id);
          Object.assign(livre, await api.modifierLivre(id, valeurs));
        } else {
          etat.livres = [
            await api.creerLivre({
              ...valeurs,
              commence_le: valeurs.statut === 'en_cours' ? versDateISO() : null,
            }),
            ...etat.livres,
          ];
        }

        if (valeurs.couverture) {
          Object.assign(etat.couvertures, await api.urlsDesCouvertures([valeurs.couverture]));
          // L'ancienne n'est plus référencée par personne : elle part, sinon on
          // paie un fichier qu'on ne reverra jamais.
          if (ancienne && ancienne !== valeurs.couverture) await api.supprimerCouverture(ancienne);
        }
        rendreBibliotheque();
      }

      if (forme === 'pages') {
        await noterDesPages(champs.parent, Number(champs.pages));
      }

      if (forme === 'citation') {
        const livre = etat.livres.find((l) => l.id === champs.parent);
        const gardee = await api.garderUneCitation(
          champs.parent,
          champs.texte.trim(),
          champs.page ? Number(champs.page) : null,
        );
        livre.citations = [...(livre.citations ?? []), gardee];
        rendreBibliotheque();
      }

      if (forme === 'victoire') {
        etat.victoires = [
          await api.ajouterVictoire({ espace: ESPACE, titre: champs.titre.trim() }),
          ...etat.victoires,
        ];
        rendreVictoires();
      }

      if (forme === 'rendez-vous') {
        const rdv = await api.creerEvenement({
          espace: ESPACE,
          titre: champs.titre.trim(),
          date_debut: new Date(champs.date_debut).toISOString(),
          famille: champs.famille || null,
          lieu: champs.lieu?.trim() || null,
        });
        etat.evenements = [...etat.evenements, rdv].sort(
          (a, b) => new Date(a.date_debut) - new Date(b.date_debut),
        );
        rendreEvenements();
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
      const champ = evenement.target.closest('[data-recherche-livre]');
      if (!champ) return;
      vueEtat.filtresLivres.mot = champ.value;
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
        vueEtat.edition = { forme: ajout.dataset.ajout, id: null };
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
      // --- LES DEUX VUES DE LA BIBLIOTHÈQUE ---

      const vueLivres = dans('vue-livres');
      if (vueLivres) {
        vueEtat.vueLivres = vueLivres.dataset.vueLivres;
        rendreBibliotheque();
        return;
      }

      const filtreLivre = dans('filtre-livre');
      if (filtreLivre) {
        const { filtreLivre: cle, valeur } = filtreLivre.dataset;
        // Retoucher un filtre déjà posé l'enlève : c'est le geste attendu d'une
        // pastille, et ça évite un « Tous » qu'il faudrait viser.
        vueEtat.filtresLivres[cle] =
          vueEtat.filtresLivres[cle] === valeur || !valeur ? null : valeur;
        rendreBibliotheque();
        return;
      }

      const pages = dans('livre-pages');
      if (pages) return noterDesPages(pages.dataset.livrePages, Number(pages.dataset.pages));

      const autre = dans('livre-autre');
      if (autre) {
        vueEtat.edition = { forme: 'pages', id: null, parent: autre.dataset.livreAutre };
        rendreFenetre();
        return;
      }

      const citation = dans('livre-citation');
      if (citation) {
        vueEtat.edition = { forme: 'citation', id: null, parent: citation.dataset.livreCitation };
        rendreFenetre();
        return;
      }

      const fini = dans('livre-fini');
      if (fini) {
        const livre = etat.livres.find((l) => l.id === fini.dataset.livreFini);
        if (!livre) return;
        Object.assign(livre, { statut: 'lu', fini_le: versDateISO() });
        rendreBibliotheque();
        try {
          Object.assign(livre, await api.terminerLivre(livre, livre.note));
        } catch (souci) {
          console.error('Livre non terminé', souci);
          Object.assign(livre, { statut: 'en_cours', fini_le: null });
          rendreBibliotheque();
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
          intention: () => etat.intentions.find((i) => i.id === id),
        };
        const source = (SOURCES_EDITION[forme] ?? SOURCES_EDITION.intention)();
        vueEtat.edition = { forme, id, valeurs: source };
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
          livre: [etat.livres, api.supprimerLivre],
          intention: [etat.intentions, api.supprimerObjectif],
          'rendez-vous': [etat.evenements, api.supprimerEvenement],
          victoire: [etat.victoires, api.supprimerVictoire],
        };
        const [liste, effacer] = RETRAITS[forme] ?? [];
        if (!liste) return;

        const ligne = liste.find((l) => l.id === id);

        // LA COUVERTURE SE LIT AVANT, PAS DANS LE RAPPEL (2 septembre 2026).
        // `retirerAussitot` sort la ligne de la liste TOUT DE SUITE — c'est le
        // principe de l'écriture optimiste —, si bien qu'un `liste.find()` fait
        // au moment de l'écriture ne trouve plus rien : le chemin partait à
        // `undefined` et le fichier restait dans le stockage, payé et invisible.
        // *Mesuré : le livre supprimé, son image encore là.*
        const couverture = forme === 'livre' ? (ligne?.couverture ?? null) : null;

        return retirerAussitot(
          liste,
          ligne,
          () => (forme === 'livre' ? effacer(id, couverture) : effacer(id)),
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
          // La courbe gagne son point sans recharger la page.
          bloc('humeur').innerHTML = construireCourbeHumeur(
            await api.humeurDepuis(versDateISO(ajouterJours(new Date(), -(JOURS_COURBE - 1)))),
          );
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
