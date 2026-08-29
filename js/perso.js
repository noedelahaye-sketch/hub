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
import { etatDesHabitudes, motDeLElan, PALIERS_HABITUDE } from './orientation.js';
import {
  versDateISO,
  ajouterJours,
  depuisDateISO,
  echapper,
  momentLisible,
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
const vueEtat = { menu: null, confirme: null, edition: null, habitude: null };

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

    <section class="bloc" data-vue="intentions">
      <h2>Intentions</h2>
      <div data-bloc="intentions"><p class="vide">…</p></div>
    </section>

    <section class="bloc" data-vue="habitudes">
      <h2>Tes habitudes</h2>
      <div data-bloc="habitudes"><p class="vide">…</p></div>
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
    extra: `<input type="hidden" name="forme" value="${echapper(forme)}">
            <input type="hidden" name="id" value="${echapper(id ?? '')}">`,
  });
}

// LES QUATRE VUES DE PERSO (28 août 2026) — le menu les offre une à une, et
// c'est la MÊME page dont on cache trois blocs sur quatre. Ni second écran, ni
// second chargement : les écouteurs sont posés sur la section et survivent.
const VUES = {
  intentions: ['Les intentions', 'Ce que tu veux tenir, sans mesure ni date.'],
  habitudes: ['Tes habitudes', "Le rythme que tu tiens, et rien qui puisse s'écrouler."],
  victoires: ['Les victoires', 'Une belle séance compte autant qu\'un post réussi.'],
  'rendez-vous': ['Les rendez-vous', 'Les moments que tu te réserves.'],
  humeur: ['Ton humeur', 'Les 30 derniers jours, sans relance ni reproche.'],
};

function appliquerLaVue(section, route) {
  const vue = route?.vue in VUES ? route.vue : null;
  const [titre, sous] = VUES[vue] ?? [
    'Perso',
    'La vie hors espaces — sport, sorties, temps pour toi.',
  ];

  section.querySelector('[data-titre]').textContent = titre;
  section.querySelector('[data-sous-titre]').textContent = sous;
  for (const bloc of section.querySelectorAll('.bloc[data-vue]')) {
    bloc.hidden = Boolean(vue) && bloc.dataset.vue !== vue;
    // UNE VUE SEULE NE RÉPÈTE PAS SON NOM. Le grand titre dit déjà « Tes
    // habitudes » ; le libellé du bloc juste dessous le disait une seconde
    // fois. C'est le défaut que `#objectifs` a corrigé le 28 août — trois noms
    // pour une page est un défaut, pas un choix.
    const nom = bloc.querySelector('h2');
    if (nom) nom.hidden = Boolean(vue) && bloc.dataset.vue === vue;
  }

  // La colonne de droite se retire quand elle ne porte plus rien : sans ça,
  // demander `#perso/rendez-vous` laisserait une piste de grille vide à côté,
  // et le bloc restant n'occuperait que la moitié de l'écran pour rien.
  const colonne = section.querySelector('.perso-colonne');
  if (colonne) {
    colonne.hidden = [...colonne.querySelectorAll('.bloc[data-vue]')].every((b) => b.hidden);
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

    const etat = { intentions: [], evenements: [], victoires: [], humeurDuJour: null, habitudes: [], faits: [] };
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
      habitude: () => rendreHabitudes(),
      intention: () => rendreIntentions(),
      'rendez-vous': () => rendreEvenements(),
      victoire: () => rendreVictoires(),
    };

    const charger = async () => {
      const depuis = versDateISO(ajouterJours(new Date(), -(JOURS_COURBE - 1)));
      // Un an de faits : l'élan n'en demande que soixante jours, la série en
      // veut cinquante-deux semaines. C'est quelques centaines de lignes au
      // plus, et le calcul n'a alors plus rien à redemander.
      const [intentions, evenements, victoires, humeur, humeurDuJour, habitudes, faits] =
        await Promise.all([
          api.objectifsActifs({ espace: ESPACE }),
          api.evenementsEntre(new Date().toISOString(), horizon(), { espace: ESPACE }),
          api.victoiresDeLEspace(ESPACE),
          api.humeurDepuis(depuis),
          api.humeurDuJour(versDateISO()),
          api.habitudesToutes(),
          api.habitudesFaitsDepuis(versDateISO(ajouterJours(new Date(), -366))),
        ]);

      Object.assign(etat, { intentions, evenements, victoires, humeurDuJour, habitudes, faits });
      rendreHabitudes();
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
        const source =
          forme === 'habitude'
            ? etat.habitudes.find((h) => h.id === id)
            : etat.intentions.find((i) => i.id === id);
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
