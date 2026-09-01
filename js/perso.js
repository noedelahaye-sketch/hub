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
import { construireFormulaire, brancherChoix } from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
import {
  etatDesHabitudes,
  motDeLElan,
  PALIERS_HABITUDE,
  avanceeDuLivre,
  livreEnCours,
  relecture,
  bilanDesHabitudes,
  estQuotidienne,
  historiqueDeLHabitude,
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
const CRANS_ELAN = 10;

// Le même helper que dans js/objectifs.js. Il n'est pas importé de là : cet
// écran-ci n'a aucune raison de dépendre de la page du cap, et trois lignes
// valent mieux qu'un lien entre deux espaces qui n'ont rien à voir.
function pluriel(nombre, singulier, plurielMot = `${singulier}s`) {
  return `${nombre} ${nombre > 1 ? plurielMot : singulier}`;
}

function jaugeElan(elan, couleur) {
  const pleins = Math.round((elan / 100) * CRANS_ELAN);
  return `<span class="elan-jauge" role="img" aria-label="élan ${elan} sur 100">${Array.from(
    { length: CRANS_ELAN },
    (_, rang) =>
      `<i class="${rang < pleins ? 'plein' : ''}"${
        rang < pleins && rang === pleins - 1 ? ' data-tete' : ''
      } style="--teinte: ${couleur}"></i>`,
  ).join('')}</span>`;
}

const TEINTES_FAMILLE = {
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
function signeHabitude(habitude) {
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
function hauteurBarre(total, plafond) {
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

// LA SPARKLINE D'UNE HABITUDE : ses douze semaines, dans sa couleur de famille.
// Une semaine TENUE est pleine, une semaine entamée est en creux — c'est la
// seule distinction, et elle ne dit jamais « raté », seulement « tenu ».
function sparkline(habitude, faits, jour) {
  const histoire = historiqueDeLHabitude(habitude, faits, jour);
  const plafond = Math.max(1, ...histoire.map((semaine) => semaine.total));

  return `
    <div class="hab-spark" role="img"
      aria-label="${SEMAINES_REGARDEES} dernières semaines">${histoire
      .map((semaine) => {
        const classes = [semaine.tenue ? 'tenue' : '', semaine.enCours ? 'en-cours' : '']
          .filter(Boolean)
          .join(' ');
        return `<i class="${classes}" style="height:${hauteurBarre(semaine.total, plafond)}%"
          title="${semaine.total} cette semaine-là"></i>`;
      })
      .join('')}</div>`;
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
function carteHabitude({ habitude, elan, serie, cumul, faitAujourdhui }, faits, jour) {
  const couleur = TEINTES_FAMILLE[habitude.famille] ?? 'var(--accent)';

  // L'ordre des mesures suit ce qu'elles engagent : la semaine d'abord (elle
  // peut encore bouger), la série ensuite (ce qu'on ne veut pas perdre), le
  // cumul enfin (il ne bouge jamais à la baisse).
  const chiffres = [
    // Une QUOTIDIENNE se lit au jour : « 5/7 cette semaine » dirait juste, mais
    // ce n'est pas la question qu'on se pose devant elle — c'est « est-ce que
    // je l'ai faite aujourd'hui ». Les hebdomadaires gardent leur compte.
    !habitude.cadence
      ? null
      : estQuotidienne(habitude)
        ? serie?.faitAujourdhui
          ? 'faite aujourd’hui'
          : 'pas encore aujourd’hui'
        : `<b>${serie?.cetteSemaine ?? 0}</b>/${habitude.cadence} cette semaine`,
    // Le mot suit l'UNITÉ : une quotidienne compte des jours, une hebdo des
    // semaines. Écrire « semaines » sur les deux aurait fait mentir la moitié
    // des cartes le jour où le compte est devenu quotidien.
    serie && serie.semaines
      ? `<b>${serie.semaines}</b> ${
          serie.unite === 'jour'
            ? serie.semaines > 1 ? 'jours tenus' : 'jour tenu'
            : serie.semaines > 1 ? 'semaines tenues' : 'semaine tenue'
        }`
      : null,
    // Quand rien n'a été fait, reste ET palier valent le même nombre :
    // « encore 10 avant 10 » est juste et illisible. Même garde que la colonne
    // du tableau de bord — la formulation vit à deux endroits, la règle aussi.
    cumul?.prochain
      ? cumul.total
        ? `encore <b>${cumul.reste}</b> avant ${cumul.prochain}`
        : `encore <b>${cumul.reste}</b>`
      : null,
    // « 0 au total » sur une habitude qu'on vient de poser n'apprend rien et
    // ressemble à un constat d'échec. Elle se tait jusqu'à la première fois.
    cumul?.total ? `<b>${cumul.total}</b> au total` : null,
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
        <span class="hab-carte-nom">
          ${signeHabitude(habitude)}${echapper(habitude.nom)}
        </span>
        ${
          // L'élan se dit en MOT avant de se dire en jauge : « solide » se lit
          // plus vite qu'un 98, et aucun de ces mots n'est un reproche — une
          // habitude en sommeil est une habitude qui attend.
          elan === null
            // « Quand ça vient » ne se dit plus (30 août 2026) : l'option
            // n'existe plus, et le mot désignait une nature d'habitude que Noé
            // a écartée. Ce qui reste est un état transitoire — une habitude
            // qui n'a pas encore sa cadence.
            ? '<span class="hab-carte-elan discret">sans cadence</span>'
            : `<span class="hab-carte-elan">${motDeLElan(elan)}</span>`
        }
        ${menuDiscret('habitude', habitude.id)}
      </div>

      ${elan === null ? '' : jaugeElan(elan, couleur)}
      ${sparkline(habitude, faits, jour)}

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
        ${lot.map((etat) => carteHabitude(etat, faits, jour)).join('')}
      </div>`,
      )
      .join('')}
    ${ajout}`;
}

// Un point par pratique visée dans la semaine, plein quand elle est faite. Le
// motif des jalons du hub : « il en reste un » se voit sans compter.
function pointsDeLaSemaine(fait, cadence) {
  const points = Array.from({ length: cadence }, (_, i) =>
    `<i${i < fait ? ' class="tenu"' : ''}></i>`,
  ).join('');
  return `<span class="hab-points" aria-hidden="true">${points}</span>`;
}

export function construireHabitudesDuJour(etats = []) {
  if (!etats.length) return '';

  const ligne = ({ habitude, serie, cumul, faitAujourdhui }) => {
      const emoji = (habitude.emoji ?? '').trim();
      const cadence = habitude.cadence ?? 0;
      const cetteSemaine = serie?.cetteSemaine ?? 0;

      // LES POINTS SEULS, SANS LÉGENDE (30 août 2026, demande de Noé : « les
      // stats doivent prendre moins de place »). « 1 sur 3 cette semaine »
      // répétait en dix-huit caractères ce que trois points disaient déjà — et
      // c'est ce texte qui rognait les noms : « Poser le téléphone avant de
      // dormir » tombait à « Poser le télépho… » sur grand écran.
      //
      // La phrase complète n'est pas perdue : elle passe en `title`, pour qui
      // la cherche. Ce qui se lit d'un coup d'œil n'a pas besoin d'être écrit.
      // SANS CADENCE, PAS DE POINTS — ET RIEN D'AUTRE. L'absence de points dit
      // déjà qu'aucune cible n'est posée. Depuis le 30 août 2026, ce cas est
      // TRANSITOIRE : on ne peut plus créer d'habitude sans cadence, seules
      // celles d'avant en portent encore une, et la page les range dans
      // « À régler ».
      const semaine = cadence
        ? `<span class="hab-mesure hab-semaine"
             title="${cetteSemaine} sur ${cadence} cette semaine">
             ${pointsDeLaSemaine(cetteSemaine, cadence)}
           </span>`
        : '<span class="hab-mesure" title="sans cadence — à régler"></span>';

      // LE PALIER TIENT EN DEUX MOTS : « encore 9 ». Il disait « encore 9 avant
      // 10 » — le palier visé est le seul détail qu'on perde, et il part en
      // `title` avec le reste. Ce qui donne envie, c'est le nombre qui descend,
      // pas la borne qu'il vise ; et il descend toujours vers un palier proche,
      // c'est la règle même des paliers.
      //
      // Le dernier franchi se dit aussi : arriver à 365 n'est pas une raison de
      // n'avoir plus rien à lire sur sa ligne.
      // LE CHIFFRE NU (30 août 2026, demande de Noé : « le texte n'est pas
      // nécessaire une fois que je sais à quoi les chiffres correspondent »).
      // C'est son écran, il le lit tous les jours : « encore » ne lui apprenait
      // plus rien et coûtait sept caractères sur chaque ligne.
      //
      // Le sens n'est pas perdu, il est DÉPLACÉ : le `title` porte la phrase
      // entière, et `aria-label` la donne au lecteur d'écran — qui, lui, ne
      // sait pas à quoi le chiffre correspond.
      const total = cumul?.total ?? 0;
      const palier = cumul?.prochain
        ? `<span class="hab-mesure hab-palier"
             title="encore ${cumul.reste} avant le palier ${cumul.prochain} — ${total} au total"
             aria-label="encore ${cumul.reste} avant le palier ${cumul.prochain}">
             <span class="chiffre">${cumul.reste}</span>
           </span>`
        : `<span class="hab-mesure hab-palier" title="tous les paliers franchis"
             aria-label="${total} fois au total">
             <span class="chiffre">${total}</span>
           </span>`;

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
        ${semaine}${palier}
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

const MOTS_STATUT = { a_lire: 'à lire', en_cours: 'en cours', lu: 'lu', repose: 'reposé' };

function livreDuHaut(livre, seances) {
  const { lues, part, rythme } = avanceeDuLivre(livre, seances);
  const citation = (livre.citations ?? []).at(-1);

  return `
    <article class="livre-encours" data-livre="${echapper(livre.id)}">
      <span class="livre-titre">${echapper(livre.titre)}</span>
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
    </article>`;
}

export function construireBibliotheque(livres, seances) {
  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="livre">
      ${SIGNE.plus}<span>Ajouter un livre</span></button>`;

  if (!livres.length) {
    return `
      <p class="vide">Tes livres s'écriront ici. Même ceux que tu n'as pas finis.</p>
      ${ajout}`;
  }

  const encours = livreEnCours(livres, seances);
  const autres = livres.filter((livre) => livre.id !== encours?.id);

  return `
    ${encours ? livreDuHaut(encours, seances) : ''}
    ${
      autres.length
        ? `<ul class="perso-lignes livres-liste">${autres
            .map((livre) => {
              const { lues } = avanceeDuLivre(livre, seances);
              const service = [
                MOTS_STATUT[livre.statut] ?? livre.statut,
                livre.auteur ?? '',
                livre.statut === 'repose' && lues ? `${lues} pages lues` : '',
              ].filter(Boolean);

              return `
        <li class="perso-ligne" data-livre="${echapper(livre.id)}">
          <span class="perso-ligne-corps">
            <span class="perso-ligne-titre">${echapper(livre.titre)}</span>
            <span class="perso-ligne-service">${echapper(service.join(' · '))}</span>
          </span>
          ${etoiles(livre.note)}
          ${menuDiscret('livre', livre.id)}
        </li>`;
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

  return `
    <span class="jour-part-titre">${
      choisi ? 'Ta note du jour' : 'Comment était cette journée ?'
    }</span>
    <span class="echelle-humeur" role="group" aria-label="La note de cette journée">
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
        <button type="button" class="jour-fleche" data-jour-vers="${echapper(
          versDateISO(ajouterJours(depuisDateISO(jour), 1)),
        )}" ${jour >= aujourdhui ? 'disabled' : ''} aria-label="Le jour d'après">›</button>
      </div>

      <!-- LA NOTE DE LA JOURNÉE (1er septembre 2026, demande de Noé : « il
           manque l'humeur du jour, et cette humeur doit être notée en fin de
           journée plutôt qu'au début — une note de la journée en quelque
           sorte »).

           ELLE EST EN HAUT (correction de Noé le même jour : « la note du
           jour doit être en haut »). Elle avait fermé la tuile une heure,
           au motif qu'une humeur demandée après avoir écrit sa journée la
           RÉSUME au lieu de dire comment on s'est réveillé. Ce motif tient
           toujours — c'est la QUESTION qui a changé, pas le rang : « comment
           était cette journée ? » se pose du même endroit qu'on la relit, et
           on ne fait pas défiler une page entière pour répondre d'un doigt.

           Elle remplace la ligne muette que le relevé portait : l'humeur s'y
           LISAIT sans pouvoir s'y écrire, alors que c'est le seul relevé de la
           tuile que Noé pose lui-même. Tout le reste, le hub le sait déjà. -->
      <div class="jour-note" data-note-jour>
        ${construireNoteDuJour(jour, humeur)}
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
      <details class="jour-releve" open>
        <summary>Ce que dit la journée</summary>
        <div class="jour-releve-corps">
          <!-- LES HABITUDES SONT UNE LIGNE, AU-DESSUS DES COLONNES (1er
               septembre 2026, demande de Noé : « les habitudes ne doivent pas
               être dans le même bloc de colonnes que les tâches, événements et
               publications ; ce doit être une ligne au-dessus de ces
               colonnes »).

               Et c'est plus juste : les habitudes sont une CHECK-LIST qu'on
               parcourt en entier, les autres blocs des relevés qu'on lit. Deux
               natures, deux mises en page — la ligne prend la largeur dont ses
               neuf pastilles ont besoin, les colonnes se partagent le reste.

               Elles ont eu leur colonne pendant une heure : elle bridait la
               largeur des pastilles à la moitié de la tuile, pour rien. -->
          <div class="jour-releve-ligne">
          ${bloc_('Habitudes', construirePastillesHabitudes(jour, habitudes, tousLesFaits))}
          </div>

          <div class="jour-releve-colonnes">
          ${bloc_(
            'Terminé',
            taches.length
              ? `<ul class="jour-liste">${taches
                  .map(
                    (tache) =>
                      `<li><span class="jour-coche">✓</span>${echapper(tache.titre)}
                       <span class="discret">${echapper(NOMS_ESPACES[tache.espace] ?? '')}</span></li>`,
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
      <div class="jour-gratitude">
        <span class="jour-part-titre">Une chose dont je suis reconnaissant</span>
        <div class="jour-gratitude-champ">
          <span class="jour-gratitude-signe" aria-hidden="true">⭐</span>
          <textarea class="jour-champ" data-jour-champ="gratitude" data-jour-mot="${echapper(jour)}"
            rows="2" placeholder="Écris quelque chose…">${echapper(gratitude ?? '')}</textarea>
        </div>
      </div>

      <!-- LE JOURNAL N'A PAS DE RECTANGLE (même demande : « pas de rectangle
           visible dans lequel mettre le texte »). Un champ encadré dit « remplis
           ce formulaire » ; on n'écrit pas sa journée dans un formulaire. Il
           reste un textarea — donc tout ce qu'un champ sait faire — mais il
           n'en porte plus l'habit : pas de fond, pas de contour, le texte posé
           sur la page comme dans un carnet. -->
      <div class="jour-mot">
        <span class="jour-part-titre">Ce qui a compté</span>
        <textarea class="jour-champ jour-mot-long" data-jour-champ="mot"
          data-jour-mot="${echapper(jour)}" rows="12"
          placeholder="Ce que tu veux garder de ce jour-là."
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
const FORMULAIRES = {
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
      {
        nom: 'emoji',
        // Le mot « émoji » suffit à dire quoi y mettre ; la phrase dit à quoi
        // il SERT, parce que ce n'est pas un ornement — c'est ce que l'accueil
        // affichera à la place du nom.
        libelle: 'Émoji (facultatif — il remplace le nom sur l’accueil)',
        type: 'text',
        valeur: v.emoji ?? '',
      },
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
      {
        nom: 'pages',
        libelle: 'Nombre de pages (facultatif)',
        type: 'number',
        valeur: v.pages ?? '',
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

    const etat = { intentions: [], evenements: [], victoires: [], humeurDuJour: null, habitudes: [], faits: [], livres: [], seances: [] };
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

    const rendreBibliotheque = () => {
      bloc('bibliotheque').innerHTML = construireBibliotheque(etat.livres, etat.seances);
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
        };

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

        return retirerAussitot(liste, liste.find((l) => l.id === id), () => effacer(id), {
          rendre: RENDUS[forme],
        });
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
