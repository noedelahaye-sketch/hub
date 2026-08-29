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
import { construireFormulaire } from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
import {
  etatDesHabitudes,
  motDeLElan,
  PALIERS_HABITUDE,
  avanceeDuLivre,
  livreEnCours,
  relecture,
} from './orientation.js';
import {
  versDateISO,
  ajouterJours,
  depuisDateISO,
  echapper,
  momentLisible,
  NOMS_ESPACES,
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
const vueEtat = { menu: null, confirme: null, edition: null, habitude: null, jour: null };

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

function habitudeDepliee({ habitude, elan, serie, cumul, faitAujourdhui }) {
  const couleur = TEINTES_FAMILLE[habitude.famille] ?? 'var(--accent)';

  return `
    <article class="habitude habitude-ouverte" data-habitude="${echapper(habitude.id)}">
      <button type="button" class="habitude-tete" data-ouvrir-habitude="${echapper(habitude.id)}">
        <span class="habitude-nom">${echapper(habitude.nom)}</span>
        ${
          elan === null
            ? '<span class="habitude-elan discret">quand ça vient</span>'
            : `<span class="habitude-elan" style="--teinte: ${couleur}">élan ${elan}</span>`
        }
      </button>
      ${elan === null ? '' : jaugeElan(elan, couleur)}

      ${
        // UNE SÉRIE À ZÉRO NE S'AFFICHE PAS. « 0 semaine tenue d'affilée » est la
        // première chose que voyait une habitude neuve : un zéro pour accueillir
        // quelqu'un qui commence. Elle apparaît à la première semaine tenue,
        // c'est-à-dire au moment où elle dit quelque chose.
        serie && (serie.semaines || serie.record)
          ? `<p class="habitude-ligne">
               <span class="habitude-serie">${pluriel(serie.semaines, 'semaine')} ${
                 serie.semaines > 1 ? 'tenues' : 'tenue'
               } d'affilée</span>
               ${
                 serie.record > serie.semaines
                   ? `<span class="discret">record ${serie.record}</span>`
                   : ''
               }
             </p>`
          : ''
      }

      <p class="habitude-ligne">
        <span class="habitude-cumul">${pluriel(cumul.total, 'fois')} au total</span>
        ${
          cumul.prochain
            ? `<span class="discret">${cumul.reste} avant le palier de ${cumul.prochain}</span>`
            : ''
        }
      </p>

      ${habitude.pourquoi ? `<p class="habitude-pourquoi">${echapper(habitude.pourquoi)}</p>` : ''}

      <div class="habitude-pied">
        ${
          serie
            ? `<span class="discret">cette semaine ${serie.cetteSemaine} sur ${habitude.cadence}</span>`
            : '<span></span>'
        }
        <button type="button" class="habitude-faire${faitAujourdhui ? ' faite' : ''}"
          data-faire="${echapper(habitude.id)}" aria-pressed="${faitAujourdhui}"
          style="--teinte: ${couleur}">${faitAujourdhui ? "c'est fait" : "je l'ai fait"}</button>
      </div>
      ${menuDiscret('habitude', habitude.id)}
    </article>`;
}

function habitudeRepliee({ habitude, elan, serie, faitAujourdhui }) {
  const couleur = TEINTES_FAMILLE[habitude.famille] ?? 'var(--accent)';

  return `
    <article class="habitude" data-habitude="${echapper(habitude.id)}">
      <button type="button" class="habitude-tete" data-ouvrir-habitude="${echapper(habitude.id)}">
        <span class="habitude-nom">${echapper(habitude.nom)}</span>
        ${
          serie && serie.semaines
            ? `<span class="discret habitude-semaines">${serie.semaines} sem.</span>`
            : ''
        }
        ${elan === null ? '' : jaugeElan(elan, couleur)}
      </button>
      <button type="button" class="habitude-rond${faitAujourdhui ? ' faite' : ''}"
        data-faire="${echapper(habitude.id)}" aria-pressed="${faitAujourdhui}"
        style="--teinte: ${couleur}"
        aria-label="${faitAujourdhui ? 'Revenir sur' : 'Marquer'} « ${echapper(habitude.nom)} »"></button>
    </article>`;
}

export function construireHabitudes(etats, ouverte) {
  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="habitude">
      ${SIGNE.plus}<span>Poser une habitude</span></button>`;

  if (!etats.length) {
    return `
      <p class="vide">Tes habitudes s'écriront ici. Commence par une seule.</p>
      ${ajout}`;
  }

  return `
    <div class="habitudes">
      ${etats
        .map((etat) =>
          etat.habitude.id === ouverte ? habitudeDepliee(etat) : habitudeRepliee(etat),
        )
        .join('')}
    </div>
    ${ajout}`;
}

// LA BIBLIOTHÈQUE (29 août 2026, demande de Noé) : « un espace qui m'encourage
// à lire ». Le mot compte — encourager, pas mesurer.
//
// D'où ce qui n'y est PAS : aucun objectif annuel, aucun nombre de livres à
// atteindre. « 24 livres cette année » transforme la lecture en course et pousse
// à choisir des livres courts. Le hub montre où l'on en est et à quel rythme on
// avance, et le rythme se compte PAR JOUR DE LECTURE — sauter trois jours ne
// doit pas faire chuter un chiffre.
//
// Le livre en cours occupe le haut, avec les deux gestes qui comptent : noter
// des pages, et garder une phrase. Le reste de la bibliothèque tient en lignes.
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

      <div class="tuile-jour perso-tuile">
        ${
          etatsHabitudes.length
            ? `<h3 class="jour-groupe">Tes habitudes</h3>
               <div class="habitudes-bande">
                 ${etatsHabitudes
                   .map(({ habitude, elan, faitAujourdhui }) => {
                     const couleur = TEINTES_FAMILLE[habitude.famille] ?? 'var(--accent)';
                     return `
                     <button type="button" class="habitude-pastille${faitAujourdhui ? ' faite' : ''}"
                       data-faire="${echapper(habitude.id)}" aria-pressed="${faitAujourdhui}"
                       style="--teinte: ${couleur}">${echapper(habitude.nom)}${
                       // Un élan à zéro ne s'affiche pas : c'est le cas de
                       // toute habitude neuve, et cinq zéros pour accueillir
                       // quelqu'un qui commence est le contraire de l'effet
                       // voulu. Il apparaît au premier point gagné.
                       elan ? `<span class="pastille-elan">${elan}</span>` : ''
                     }</button>`;
                   })
                   .join('')}
               </div>`
            : ''
        }

        ${
          livre
            ? `<h3 class="jour-groupe">Ta lecture</h3>
               <div class="perso-lecture">
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
            : ''
        }

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
        ${porte('#perso/journee', 'Tes journées')}
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

export function construireLaJournee(jour, donnees, contexte = {}) {
  const aujourdhui = versDateISO();
  const { humeur, taches = [], evenements = [], victoires = [], faits = [], seances = [], mot } =
    donnees ?? {};
  const { habitudes = [], livres = [], relue = null } = contexte;

  const niveau = humeur ? NIVEAUX_HUMEUR.find((n) => n.niveau === humeur.niveau) : null;
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

      ${
        humeur
          ? `<p class="jour-humeur"><span class="jour-frimousse">${niveau?.frimousse ?? ''}</span>
             <span>${echapper(niveau?.mot ?? '')}${
               humeur.note ? ` — « ${echapper(humeur.note)} »` : ''
             }</span></p>`
          : ''
      }

      ${bloc_(
        'Habitudes',
        faits.length
          ? `<span class="jour-pastilles">${faits
              .map(
                (fait) =>
                  `<span class="jour-pastille">${echapper(
                    nomDe(fait.habitude_id, habitudes),
                  )}</span>`,
              )
              .join('')}</span>`
          : '',
      )}

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

      <div class="jour-mot">
        <span class="jour-part-titre">Ce qui a compté</span>
        <textarea class="jour-mot-champ" data-jour-mot="${echapper(jour)}" rows="2"
          placeholder="une ligne, si tu veux">${echapper(mot ?? '')}</textarea>
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
      <h2>Tes journées</h2>
      <div data-bloc="journee"><p class="vide">…</p></div>
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
        nom: 'cadence',
        libelle: 'Combien de fois par semaine',
        type: 'choix',
        // « Quand ça vient » n'est pas un pis-aller : c'est la cadence des
        // choses qu'on veut noter sans se les imposer. Elle vaut NULL, donc ni
        // élan ni série — seulement le cumul.
        options: {
          '': 'Quand ça vient',
          1: '1 fois', 2: '2 fois', 3: '3 fois', 4: '4 fois',
          5: '5 fois', 6: '6 fois', 7: 'Tous les jours',
        },
        valeur: v.cadence ? String(v.cadence) : '',
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
  journee: ['Tes journées', "Ce qu'il s'est passé, jour après jour. Rien à remplir."],
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
    this.naviguer = (nouvelle) => appliquerLaVue(section, nouvelle);

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

    const rendreJournee = () => {
      const jour = vueEtat.jour ?? versDateISO();
      bloc('journee').innerHTML = construireLaJournee(jour, journeesVues.get(jour), {
        habitudes: etat.habitudes,
        livres: etat.livres,
        relue: relecture({ victoires: etat.victoires, intentions: etat.intentions }, depuisDateISO(jour)),
      });
    };

    async function ouvrirLaJournee(jour) {
      vueEtat.jour = jour;
      rendreJournee();
      if (journeesVues.has(jour)) return;
      try {
        journeesVues.set(jour, await api.journeeDe(jour));
        if (vueEtat.jour === jour) rendreJournee();
      } catch (souci) {
        console.error('Journée non chargée', souci);
      }
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
        vueEtat.habitude,
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
      // que vient le mot du jour.
      await ouvrirLaJournee(vueEtat.jour ?? versDateISO());
      rendreTableau();
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
        const mot = champ.value.trim() || null;
        const gardee = journeesVues.get(jour);
        if (gardee && gardee.mot === mot) return;

        try {
          await api.noterLeMot(jour, mot);
          if (gardee) gardee.mot = mot;
        } catch (souci) {
          console.error('Mot du jour non enregistré', souci);
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
      if (evenement.target.closest('.ajout-volant')) return;

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
      const faire = dans('faire');
      if (faire) {
        const id = faire.dataset.faire;
        const habitude = etat.habitudes.find((h) => h.id === id);
        const jour = versDateISO();
        const dejaFait = etat.faits.some((f) => f.habitude_id === id && f.jour === jour);

        const avant = [...etat.faits];
        if (dejaFait) {
          etat.faits = etat.faits.filter((f) => !(f.habitude_id === id && f.jour === jour));
        } else {
          etat.faits = [...etat.faits, { habitude_id: id, jour }];
        }
        rendreHabitudes();

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
        }
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

      const ouvrirHabitude = dans('ouvrir-habitude');
      if (ouvrirHabitude) {
        const id = ouvrirHabitude.dataset.ouvrirHabitude;
        vueEtat.habitude = vueEtat.habitude === id ? null : id;
        vueEtat.menu = null;
        rendreHabitudes();
        return;
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
        const avant = etat.humeurDuJour;
        etat.humeurDuJour = { niveau: Number(niveau.dataset.niveau), note: avant?.note ?? null };
        rendreHumeurDuJour();
        try {
          etat.humeurDuJour = await api.enregistrerHumeur(
            versDateISO(),
            Number(niveau.dataset.niveau),
            avant?.note ?? null,
          );
          // La courbe gagne son point du jour sans recharger la page.
          bloc('humeur').innerHTML = construireCourbeHumeur(
            await api.humeurDepuis(versDateISO(ajouterJours(new Date(), -(JOURS_COURBE - 1)))),
          );
        } catch (souci) {
          console.error('Humeur non enregistrée', souci);
          etat.humeurDuJour = avant;
        }
        rendreHumeurDuJour();
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
