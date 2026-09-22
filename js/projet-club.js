// LE PROJET DU CLUB, et la page de chacune de ses valeurs (16 septembre 2026).
//
// TROIS ÉTAGES, ET C'EST LA STRUCTURE DU CLUB LUI-MÊME : la mission dit
// POURQUOI, les valeurs disent COMMENT on se tient, les objectifs disent VERS
// QUOI on va. Le club les a construits dans cet ordre, en quatre réunions ;
// l'écran les rend dans le même.
//
// LA PAGE NE FAIT QUE LIRE — rien ne s'y coche, rien ne s'y compte. C'est la
// référence de la ligne éditoriale, et l'une des missions écrites de Noé :
// « mettre en place une ligne éditoriale cohérente avec le projet du club ».
import {
  MISSION_FCH, VALEURS_FCH, AXES_FCH, POLES_FCH, ECHEANCES_FCH,
  OBJECTIFS_FCH, PROJETS_LIBRES_FCH, AG_2026,
} from './projet-fch.js';
import { echapper } from './format.js';
import { porte } from './partenaires-suivi.js';
import { prochainEvenementClub } from './evenements-club.js';
// LE PROJET ET L'ORGANIGRAMME SE REJOIGNENT ICI (20 septembre 2026, décision de
// Noé : « il faut fusionner les 2, les pôles et les commissions c'est la même
// chose, certaines n'ont pas de responsable ni de membre mais ce n'est pas
// grave, ça arrivera plus tard »).
//
// *Ce que ça renverse : la note de `js/projet-fch.js` disait « les pôles ne
// sont PAS les commissions, même s'ils leur ressemblent ». C'était vrai des
// DONNÉES — cinq noms communs sur quatorze — et Noé tranche sur le SENS : un
// pôle et sa commission sont le même domaine du club, vu depuis le projet d'un
// côté et depuis les gens de l'autre. Les trous se rempliront.*
import { GROUPES, PERSONNES } from './organigramme-fch-data.js';
import { portrait, missionsDuPole } from './organigramme-fch.js';

const ADRESSE = '#hermitage/projet-club';
const axeDe = (id) => AXES_FCH.find((a) => a.id === id);
const poleDe = (id) => POLES_FCH.find((p) => p.id === id);
export const valeurDe = (id) => VALEURS_FCH.find((v) => v.id === id);
const objectifDe = (id) => OBJECTIFS_FCH.find((o) => `objectif-${o.id}` === id);
const slugProjet = (titre) => titre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const projetsDuClub = [
  ...OBJECTIFS_FCH.flatMap((o) => o.projets.map((titre) => ({
    id: `${o.id}-${slugProjet(titre)}`, titre, objectif: o.id, poles: o.poles, echeances: o.echeances,
  }))),
  ...PROJETS_LIBRES_FCH.map((p) => ({ ...p, id: `libre-${slugProjet(p.titre)}`, echeances: p.echeance ? [p.echeance] : [] })),
];
const projetDe = (id) => projetsDuClub.find((p) => `projet-${p.id}` === id);
const horizons = (item) => ECHEANCES_FCH.filter((e) => item.echeances.includes(e.id)).map((e) => `${e.nom} · ${e.quand}`).join(' / ');
// LA TUILE D'UN OBJECTIF DU CLUB PREND LA FORME D'UN CAP DU HUB (20 septembre
// 2026, demande de Noé : « ces tuiles objectifs doivent avoir plutôt la forme
// des objectifs du hub »).
//
// ELLE EMPRUNTE `.cap-tuile`, ELLE NE LA RECOPIE PAS — mêmes classes, même
// géométrie, même teinte de fond à 5 %. C'est la règle du site depuis qu'il
// monte les écrans du cap : *« ce sont les modules du hub, pas des copies »*.
// Deux dessins pour une même chose finiraient par ne plus se ressembler, et
// c'est toujours l'écran qu'on regarde le moins qui dérive.
//
// CE QUI CHANGE, C'EST CE QUE CHAQUE PLACE PORTE, parce que les objectifs du
// club ne sont pas ceux de la base — ils n'ont ni jalons ni échéance :
//
//   la pastille  →  l'AXE et sa couleur, à la place de l'espace. C'est le même
//                   rôle : ce à quoi l'objectif appartient, dit d'un point.
//   le pied      →  ses projets à gauche, son HORIZON à droite. L'horizon est
//                   son échéance à lui — « la saison qui vient », « dans trois
//                   ans ».
//   les marches  →  L'INDICATEUR. Un cap du hub se lit en jalons franchis ;
//                   celui-ci n'en a pas, et ce qu'il a de plus proche est ce
//                   qu'on regarde pour savoir où il en est. **Une rangée de
//                   marches vides serait un bruit permanent** — c'est déjà
//                   l'argument du pointillé d'un projet qui n'a rien déclaré.
//
// LES DEUX VARIABLES DE COULEUR SE POSENT ENSEMBLE : `--couleur-espace` tient
// la pastille, `--couleur-espace-pleine` la teinte du fond. La seconde existe
// justement parce que `color-mix` jette la déclaration entière s'il reçoit un
// dégradé — le piège documenté à sa définition.
//
// `avecHorizon` : l'horizon ne s'écrit que là où il APPREND quelque chose. Sur
// la page « Les objectifs », les colonnes SONT les horizons — « N+1 · la saison
// qui vient » est écrit en tête — et le répéter sur chaque tuile le dirait deux
// fois. *Et il le disait FAUX : un objectif porte parfois plusieurs horizons, et
// la tuile prenait toujours le premier — « la saison qui vient » s'affichait
// donc en colonne N+3.* Ce qui se montre n'a pas à se nommer.
function tuileObjectif(o, titre = o.titre, { avecHorizon = true } = {}) {
  const axe = axeDe(o.axes[0]);
  const quand = ECHEANCES_FCH.find((e) => e.id === o.echeances[0]);
  const projets = o.projets.length;

  return `
    <article class="cap-tuile"
      style="--couleur-espace:${axe.couleur};--couleur-espace-pleine:${axe.couleur}">
      <a class="cap-tuile-ouvrir" href="${ADRESSE}/objectif-${o.id}">
        <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(axe.nom)}</span>
        <h3 class="cap-tuile-titre">${echapper(titre)}</h3>
        ${o.indicateur ? `<span class="discret cap-tuile-mesure">${echapper(o.indicateur)}</span>` : ''}
        <span class="cap-tuile-pied">
          <span>${projets} projet${projets > 1 ? 's' : ''}</span>
          ${
            avecHorizon
              ? `<span class="cap-tuile-date">${echapper(quand?.quand ?? '')}</span>`
              : ''
          }
        </span>
      </a>
    </article>`;
}
function tuileProjet(p) {
  return porte(`${ADRESSE}/projet-${p.id}`, p.titre, '',
    `<span class="fch-hall-quoi">${echapper(p.objectif ? OBJECTIFS_FCH.find((o) => o.id === p.objectif).titre : 'Projet à rattacher à un objectif')}</span>`);
}
function ficheObjectif(o) {
  const projets = projetsDuClub.filter((p) => p.objectif === o.id);
  return `<article class="projet-club">
    <a class="lien-discret projet-club-retour" href="${ADRESSE}/objectifs">← Tous les objectifs</a>
    <header class="valeur-tete" style="--valeur-couleur:${axeDe(o.axes[0]).couleur}">
      <p class="valeur-rang">Objectif du club · ${echapper(horizons(o))}</p>
      <h2>${echapper(o.titre)}</h2>
      <p class="projet-club-marques">${o.poles.map(pastillePole).join('')}</p>
    </header>
    <section class="bloc"><h2>Le cap</h2>
      <p class="projet-club-marques">${o.axes.map(axeDe).map((a) => `<a class="projet-club-axe-lien"
        href="${ADRESSE}/axe-${a.id}" style="--pole-couleur:${a.couleur}">${echapper(a.nom)}</a>`).join('')}</p>
      ${o.indicateur ? `<h3>Ce qu’on regarde</h3><p>${echapper(o.indicateur)}</p>` : ''}</section>
    <section class="bloc fch-sans-tuile"><h2>Les projets associés</h2>
      ${projets.length ? `<div class="fch-hall">${projets.map(tuileProjet).join('')}</div>` : '<p class="discret">Aucun projet associé pour le moment.</p>'}</section>
    ${retourAuProjet()}</article>`;
}
// LA PAGE D'UN PROJET DU CLUB RESSEMBLE À CELLE D'UN PROJET DU HUB (20 septembre
// 2026, demande de Noé : « les pages des projets des commissions doivent
// ressembler aux pages de mes projets, donc avec des jalons, un calendrier sur
// lequel on peut poser des choses »).
//
// CE QU'ELLE DISAIT AVANT, en pied et sans détour : *« Responsable, étapes et
// dates de réalisation restent à préciser »*. C'était vrai — rien ne pouvait s'y
// écrire, le projet du club n'étant qu'une ligne de document.
//
// CE FICHIER GARDE CE QUI NE DEMANDE RIEN AU RÉSEAU — le retour, le bandeau,
// l'horizon, les pôles, l'objectif servi — et POSE UN HÔTE pour le reste.
// js/projet-club-page.js y charge la ligne du projet, ses étapes et son
// calendrier. C'est la mécanique des écrans du cap : le site pose le cadre, le
// module écrit dedans et y met ses écouteurs.
export function projetDeclare(selection) {
  const p = projetDe(selection);
  if (!p) return null;
  const o = OBJECTIFS_FCH.find((objectif) => objectif.id === p.objectif);
  return { cle: p.id, titre: p.titre, objectif: o ? o.titre : null };
}

function ficheProjet(p) {
  const o = OBJECTIFS_FCH.find((o) => o.id === p.objectif);
  return `<article class="projet-club">
    <a class="lien-discret projet-club-retour" href="${ADRESSE}/${o ? `objectif-${o.id}` : 'projets'}">← ${o ? 'L’objectif associé' : 'Tous les projets'}</a>
    <header class="valeur-tete" style="--valeur-couleur:${o ? axeDe(o.axes[0]).couleur : '#4070e0'}">
      <p class="valeur-rang">Projet du club</p><h2>${echapper(p.titre)}</h2>
      ${p.echeances.length ? `<p>${echapper(horizons(p))}</p>` : ''}
      <p class="projet-club-marques">${p.poles.map(pastillePole).join('')}</p></header>
    ${p.note ? `<section class="bloc"><h2>Repères</h2><p>${echapper(p.note)}</p></section>` : ''}
    <section class="bloc fch-sans-tuile"><h2>L’objectif auquel il contribue</h2>
      ${o ? tuileObjectif(o) : '<p class="discret">Ce projet n’est pas encore rattaché à un objectif.</p>'}</section>
    <div data-hote-projet-club></div>
    ${retourAuProjet()}</article>`;
}

function retourAuProjet() {
  return `<a class="lien-discret projet-club-retour" href="${ADRESSE}">← Le projet du club</a>`;
}

// La première page ne cherche plus à tout raconter. Elle donne le cap, puis
// laisse choisir le niveau de détail : pourquoi, comment, vers quoi.
function accueilDuProjet() {
  return `<div class="projet-club projet-club-accueil">
    <section class="bloc projet-club-resume">
      <p class="projet-club-surtitre">Notre cap</p>
      <p class="projet-club-phrase">${echapper(MISSION_FCH.phrase)}</p>
      <p>Le jeu nous permet de grandir et de nous épanouir. Le plaisir est au centre
        de tout, notre histoire nous rassemble et nos valeurs guident nos actions.</p>
    </section>
    <section class="bloc projet-club-essentiel">
      <h2>Les valeurs qui nous guident</h2>
      <p class="projet-club-service">★ Nos trois valeurs principales</p>
      <div class="projet-club-valeurs-resume">${VALEURS_FCH.map((v) => `
        <a href="${ADRESSE}/${v.id}" class="${v.principale ? 'principale' : ''}">
          ${v.principale ? '<span aria-label="Valeur principale">★</span> ' : ''}${echapper(v.nom)}</a>`).join('')}
      </div>
    </section>
    <section class="bloc projet-club-essentiel">
      <h2>Les trois priorités de cette saison</h2>
      <div class="cap-galerie">${AG_2026.retenus.map(([titre], i) =>
        tuileObjectif(OBJECTIFS_FCH.find((o) => o.id === ['encadrement', 'benevoles', 'sponsors'][i]), titre)).join('')}</div>
    </section>
    <nav class="fch-hall" aria-label="Le projet en détail">
      ${porte(`${ADRESSE}/mission`, 'La mission', '', '<span class="fch-hall-quoi">Transmettre l’envie de jouer et les quatre piliers qui nous guident.</span>')}
      ${porte(`${ADRESSE}/valeurs`, 'Les valeurs', '6', '<span class="fch-hall-quoi">Leur sens au club et les comportements qui les font vivre.</span>')}
      ${porte(`${ADRESSE}/axes`, 'Les axes', `${AXES_FCH.length}`, '<span class="fch-hall-quoi">Les quatre grandes familles du projet, et ce que chacune porte.</span>')}
      ${porte(`${ADRESSE}/poles`, 'Les commissions', `${DOMAINES.length}`, '<span class="fch-hall-quoi">Chaque domaine du club : ce qu’il vise, et qui le porte.</span>')}
      ${porte(`${ADRESSE}/objectifs`, 'Tous les objectifs', `${OBJECTIFS_FCH.length}`, '<span class="fch-hall-quoi">Les caps du club à un, trois et cinq ans.</span>')}
      ${porte(`${ADRESSE}/projets`, 'Les projets', `${projetsDuClub.length}`, '<span class="fch-hall-quoi">Les actions prévues pour concrétiser le projet du club.</span>')}
    </nav>
  </div>`;
}

// ── LA MISSION ────────────────────────────────────────────────────────────────

function mission() {
  const m = MISSION_FCH;
  return `<section class="bloc">
    <h2>La mission</h2>
    <p class="projet-club-phrase">${echapper(m.phrase)}</p>
    <p class="projet-club-developpee">${echapper(m.developpee)}</p>
    <ul class="projet-club-piliers">${m.piliers.map((p) => `<li>${echapper(p)}</li>`).join('')}</ul>
  </section>`;
}

// ── LES VALEURS ───────────────────────────────────────────────────────────────

// LA COULEUR NE PORTE PAS L'IDENTITÉ, le rang et le nom la portent : les six
// couleurs du club vont par paires, et six tuiles côte à côte ne se
// distingueraient pas si la couleur devait les nommer. Elle tient donc le filet
// du haut et le chiffre, comme la tuile d'un groupe de l'organigramme.
function tuileValeur(v) {
  return `<a class="projet-club-valeur" href="${ADRESSE}/${v.id}" style="--valeur-couleur:${v.couleur}">
    <span class="projet-club-rang" aria-hidden="true">${v.rang}</span>
    <span class="projet-club-valeur-nom">${echapper(v.nom)}</span>
    <span class="projet-club-valeur-idee">${echapper(v.idees[0])}</span>
    ${v.principale ? '<span class="projet-club-etoile" title="L’une des trois valeurs principales">★ Principale</span>' : ''}
  </a>`;
}

function valeurs() {
  return `<section class="bloc">
    <h2>Les valeurs</h2>
    <p class="projet-club-service">Six valeurs, dont trois principales : ce sont celles qui portent la mission. Choisis-en une pour lire ce qu’elle veut dire au club.</p>
    <div class="projet-club-valeurs">${VALEURS_FCH.map(tuileValeur).join('')}</div>
  </section>`;
}

// ── LES OBJECTIFS ─────────────────────────────────────────────────────────────

function pastillePole(id) {
  const p = poleDe(id);
  if (!p) return '';
  return `<span class="projet-club-pole" style="--pole-couleur:${p.couleur}">${echapper(p.nom)}</span>`;
}

// LE FILET DE GAUCHE DIT L'AXE, la pastille dit le pôle. Deux canaux, chacun
// son travail : l'axe est la grande famille (quatre), le pôle est le sujet
// (neuf). Les mêler sur un seul signe aurait demandé treize couleurs.
function carteObjectif(o) {
  return `<li class="projet-club-objectif-lien">${tuileObjectif(o, o.titre, {
    avecHorizon: false,
  })}</li>`;
}

function colonneEcheance(e) {
  const retenus = OBJECTIFS_FCH.filter((o) => o.echeances.includes(e.id));
  return `<section class="projet-club-horizon">
    <h3><span class="projet-club-horizon-nom">${echapper(e.nom)}</span> ${echapper(e.quand)}</h3>
    ${e.priorite ? `<p class="projet-club-priorite">${echapper(e.priorite)}</p>` : ''}
    ${retenus.length
      ? `<ul class="projet-club-objectifs">${retenus.map(carteObjectif).join('')}</ul>`
      : '<p class="vide">Rien de visé à cet horizon pour cette commission.</p>'}
  </section>`;
}

// ON N'OFFRE QUE LES PÔLES QUI PORTENT UN OBJECTIF : un filtre sur une liste
// vide est une porte sur une pièce vide. C'est la règle des filtres de la
// bibliothèque, appliquée ici.
function filtres() {
  const vivants = POLES_FCH.filter((p) => OBJECTIFS_FCH.some((o) => o.poles.includes(p.id)));
  return `<nav class="projet-club-filtres" aria-label="Ouvrir une commission">
    ${vivants.map((p) => `<a href="${ADRESSE}/pole-${p.id}"
      style="--pole-couleur:${p.couleur}">${echapper(p.nom)}
      <span class="projet-club-compte">${OBJECTIFS_FCH.filter((o) => o.poles.includes(p.id)).length}</span></a>`).join('')}
  </nav>`;
}

// LES « FILTRES » SONT DEVENUS DES PORTES (20 septembre 2026) : ils rechargaient
// la même page en ne montrant qu'un pôle ; ils mènent maintenant à la PAGE du
// pôle, qui montre les mêmes objectifs plus son équipe, ses projets et ses
// axes. Le filtrage a donc disparu d'ici — il aurait été du code mort, et deux
// écrans pour une même liste finissent par ne plus la montrer pareil.
function objectifs() {
  return `<section class="bloc">
    <h2>Les objectifs</h2>
    <p class="projet-club-service">Chaque objectif sert un axe et une commission, et vise un horizon. Ceux de la saison qui vient portent en plus ce qu’on regarde pour savoir où l’on en est.</p>
    ${filtres()}
    <div class="projet-club-horizons">${ECHEANCES_FCH.map((e) => colonneEcheance(e)).join('')}</div>
    <details class="projet-club-repli">
      <summary>Les projets qui n’ont pas encore d’objectif <span class="projet-club-compte">${PROJETS_LIBRES_FCH.length}</span></summary>
      <p class="discret">Des idées posées au tableau, gardées telles quelles : une idée qui attend son objectif reste une idée.</p>
      <ul class="projet-club-libres">${PROJETS_LIBRES_FCH.map((p) => `
        <li class="projet-club-libres-item"><a href="${ADRESSE}/projet-libre-${slugProjet(p.titre)}">${echapper(p.titre)}</a>
          <span class="projet-club-marques">${p.poles.map(pastillePole).join('')}${
            p.echeance ? `<span class="projet-club-aussi">${echapper(ECHEANCES_FCH.find((e) => e.id === p.echeance).nom)}</span>` : ''}</span>
          ${p.note ? `<span class="discret">${echapper(p.note)}</span>` : ''}</li>`).join('')}</ul>
    </details>
  </section>`;
}

// ── LES AXES ──────────────────────────────────────────────────────────────────
//
// LES QUATRE AXES ONT LEUR PAGE (20 septembre 2026, demande de Noé : « il faut
// rajouter une page sur nos 4 axes »).
//
// CE QU'ILS SONT, ET POURQUOI ILS MÉRITAIENT UN ÉCRAN : un axe est la GRANDE
// FAMILLE du projet du club — « donner envie par le terrain », « par la vie du
// club », « par l'image », plus l'organisation qui les porte tous. Ils étaient
// partout en petit — une couleur sur une tuile, un mot dans « Le cap » — et
// nulle part en entier. *On ne pouvait pas répondre à « qu'est-ce qu'on vise
// par le terrain ? » sans relire les vingt objectifs un à un.*
//
// LA PAGE D'UN AXE RASSEMBLE CE QUI LE SERT, et rien d'autre : ses pôles, ses
// objectifs, ses projets. Elle ne mesure rien et ne coche rien — c'est la règle
// de tout le projet du club, qui est une RÉFÉRENCE, pas un tableau de bord.

const objectifsDeLAxe = (id) => OBJECTIFS_FCH.filter((o) => o.axes.includes(id));
const projetsDeLAxe = (id) => projetsDuClub.filter((p) => {
  const o = OBJECTIFS_FCH.find((c) => c.id === p.objectif);
  return o ? o.axes.includes(id) : false;
});

// LES PÔLES D'UN AXE SE DÉDUISENT DE SES OBJECTIFS, ils ne sont pas déclarés.
// Une liste écrite à la main serait un second endroit à tenir d'accord : le
// jour où un objectif change de pôle, elle mentirait sans que rien ne le dise.
// LA RELATION INVERSE, LUE DANS LA MÊME TABLE : deux listes séparées auraient
// fini par ne plus dire la même chose. Elle parcourt `DOMAINES` et non
// `POLES_FCH`, sans quoi la buvette — commission sans pôle — ne remonterait
// jamais sous son axe.
const polesDeLAxe = (id) => DOMAINES.filter((d) => AXE_DU_DOMAINE[d.id] === id);

// LA TUILE D'UN AXE emprunte `.cap-tuile` comme celle d'un objectif — même
// grammaire d'un bout à l'autre du projet du club. Son pied compte ce qu'il
// porte, ce qui est exactement ce qu'on vient chercher : lequel des quatre est
// le plus chargé.
function tuileAxe(a) {
  const objectifs = objectifsDeLAxe(a.id).length;
  const projets = projetsDeLAxe(a.id).length;
  return `
    <article class="cap-tuile"
      style="--couleur-espace:${a.couleur};--couleur-espace-pleine:${a.couleur}">
      <a class="cap-tuile-ouvrir" href="${ADRESSE}/axe-${a.id}">
        <span class="cap-tuile-espace"><span class="pastille"></span>Axe du projet</span>
        <h3 class="cap-tuile-titre">${echapper(a.nom)}</h3>
        <span class="discret cap-tuile-mesure">${polesDeLAxe(a.id).map((p) => echapper(p.nom)).join(' · ')}</span>
        <span class="cap-tuile-pied">
          <span>${objectifs} objectif${objectifs > 1 ? 's' : ''}</span>
          <span class="cap-tuile-date">${projets} projet${projets > 1 ? 's' : ''}</span>
        </span>
      </a>
    </article>`;
}

function axes() {
  return `<section class="bloc fch-sans-tuile">
    <h2>Les axes</h2>
    <p class="projet-club-service">Les quatre grandes familles du projet : trois façons de donner
      envie, et l’organisation qui les porte.</p>
    <div class="cap-galerie">${AXES_FCH.map(tuileAxe).join('')}</div>
  </section>`;
}

function ficheAxe(a) {
  const objectifs = objectifsDeLAxe(a.id);
  const projets = projetsDeLAxe(a.id);
  const poles = polesDeLAxe(a.id);

  return `<article class="projet-club">
    <a class="lien-discret projet-club-retour" href="${ADRESSE}/axes">← Les quatre axes</a>
    <header class="valeur-tete" style="--valeur-couleur:${a.couleur}">
      <p class="valeur-rang">Axe du projet</p>
      <h2>${echapper(a.nom)}</h2>
    </header>

    ${
      // LES PÔLES MÈNENT AU FILTRE QUI EXISTE DÉJÀ (`pole-<id>`) : la page des
      // objectifs sait les filtrer depuis le premier jour, et lui faire un
      // second écran serait deux endroits pour une même liste.
      poles.length
        ? `<section class="bloc"><h2>Ce qu’il recouvre</h2>
            <nav class="projet-club-filtres" aria-label="Les commissions de cet axe">
              ${poles.map((p) => {
                // AUCUN ZÉRO EN VITRINE, ici comme sur la tuile d'un domaine :
                // la buvette appartient à cet axe sans y porter d'objectif.
                const compte = objectifs.filter((o) => o.poles.includes(p.id)).length;
                return `<a href="${ADRESSE}/pole-${p.id}"
                  style="--pole-couleur:${p.couleur}">${echapper(p.nom)}${
                  compte ? ` <span class="projet-club-compte">${compte}</span>` : ''
                }</a>`;
              }).join('')}
            </nav></section>`
        : ''
    }

    <section class="bloc fch-sans-tuile"><h2>Ses objectifs</h2>
      ${objectifs.length
        ? `<div class="cap-galerie">${objectifs.map((o) => tuileObjectif(o)).join('')}</div>`
        : '<p class="discret">Aucun objectif ne porte cet axe pour le moment.</p>'}</section>

    <section class="bloc fch-sans-tuile"><h2>Ses projets</h2>
      ${projets.length
        ? `<div class="fch-hall">${projets.map(tuileProjet).join('')}</div>`
        : '<p class="discret">Aucun projet ne porte cet axe pour le moment.</p>'}</section>

    ${retourAuProjet()}</article>`;
}

// ── LES DOMAINES : un pôle et sa commission, sur une seule page ───────────────
//
// DEMANDE DE NOÉ (20 septembre 2026) : « des pages sur nos commissions avec les
// données que tu as déjà », puis, la question posée : « il faut fusionner les
// 2, les pôles et les commissions c'est la même chose ».
//
// DIX DOMAINES, et ce sont exactement les dix entrées de son arborescence : les
// NEUF pôles du projet, plus la BUVETTE — une commission qui n'a pas de pôle
// parce qu'elle ne porte aucun objectif, mais qui est un domaine du club comme
// les autres. Les trois groupes du bureau (présidence, secrétariat, trésorerie)
// n'en sont pas : ce sont des fonctions, pas des domaines.
//
// LA LISTE SE DÉDUIT DES DEUX SOURCES, elle ne se recopie pas. Une liste écrite
// à la main serait un troisième endroit à tenir d'accord — et c'est toujours
// celui qu'on oublie qui finit par mentir le jour où une commission naît.
const DOMAINES = [
  ...POLES_FCH.map((pole) => ({
    ...pole,
    groupe: GROUPES.find((g) => g.id === pole.id) ?? null,
  })),
  ...GROUPES.filter((g) => g.type === 'commissions' && !POLES_FCH.some((p) => p.id === g.id))
    .map((g) => ({ id: g.id, nom: g.nom, couleur: g.couleur, groupe: g })),
];

// L'AXE D'UN DOMAINE SE DÉCLARE, IL NE SE DÉDUIT PAS (20 septembre 2026,
// correction de Noé : « éducatif ne fait pas partie de la vie du club,
// uniquement le terrain, et cohésion l'inverse »).
//
// CE QUE ÇA RÉPARE, ET C'ÉTAIT UN DÉFAUT DE MODÈLE. Je déduisais « ce pôle
// appartient à cet axe » en CROISANT les axes et les pôles d'un même objectif.
// Or un objectif porte parfois plusieurs des deux : « Intégrer les éducateurs à
// la vie du club, cohésion Coachs-CA » sert le terrain ET la vie, et relève de
// l'éducatif ET de la cohésion. Le croisement fabriquait donc les QUATRE
// paires, dont deux qui n'existent pas. *Mesuré : onze paires produites, deux
// fausses — exactement `terrain × cohesion` et `vie × educatif`.*
//
// **UN PRODUIT CARTÉSIEN N'EST PAS UNE VÉRITÉ** : que deux listes se croisent
// dans une même ligne ne dit rien de ce qui va avec quoi.
//
// L'ARBORESCENCE DE NOÉ EST EXCLUSIVE — un pôle, un axe — et c'est elle qui
// fait foi. Elle tient en dix lignes, et elle se relit d'un coup d'œil :
// personne n'a à la recalculer pour savoir sous quel axe ranger un domaine.
//
// UN OBJECTIF, LUI, GARDE SES PLUSIEURS AXES : « la cohésion Coachs-CA sert le
// terrain ET la vie du club, et le tableau la range dans les deux » (note de
// js/projet-fch.js). Ce sont deux relations différentes — celle d'un OBJECTIF
// à ses axes, celle d'un DOMAINE au sien — et les confondre est précisément ce
// qui a produit les deux paires fausses.
const AXE_DU_DOMAINE = {
  sportif: 'terrain',
  educatif: 'terrain',
  infrastructures: 'terrain',
  manifestations: 'vie',
  cohesion: 'vie',
  buvette: 'vie',
  communication: 'image',
  identite: 'image',
  partenaires: 'image',
  organisation: 'organisation',
};

// L'ÉCHÉANCE DE LA SAISON QUI VIENT — le premier des trois horizons du club.
// Lue dans la table plutôt qu'écrite en dur : le jour où les colonnes du
// document glissent d'un cran, elles glissent ici aussi.
const ECHEANCE_SAISON = ECHEANCES_FCH[0].id;

const domaineDe = (id) => DOMAINES.find((d) => d.id === id) ?? null;
const objectifsDuDomaine = (id) => OBJECTIFS_FCH.filter((o) => o.poles.includes(id));
const projetsDuDomaine = (id) => projetsDuClub.filter((p) => (p.poles ?? []).includes(id));

// LES AXES D'UN DOMAINE se déduisent de ses objectifs, comme les pôles d'un axe
// se déduisent des siens : la relation est la MÊME, lue dans l'autre sens, et
// la déclarer deux fois serait la déclarer une fois de trop.
const axeDuDomaine = (id) => axeDe(AXE_DU_DOMAINE[id]) ?? null;

// LES VISAGES D'ABORD, LE NOM ENSUITE (20 septembre 2026, demande de Noé :
// « pour les tuiles des pôles, mets les photos des personnes qui y participent
// avec le responsable en 1er et un peu plus gros que les autres, puis en
// dessous le titre de la commission »).
//
// CE QUE ÇA CHANGE POUR LA TUILE : elle disait un domaine, elle dit maintenant
// UNE ÉQUIPE. On reconnaît un visage avant de lire un mot — c'est le même
// argument que l'étagère de la bibliothèque, *« le seul écran du hub où l'image
// passe devant le texte »*, et il vaut ici pour la même raison : on cherche
// « qui s'occupe de ça », et un portrait y répond plus vite qu'un nom de pôle.
//
// LE RESPONSABLE EST PLUS GROS, ET C'EST LE SEUL SIGNE : pas d'étiquette, pas
// de couronne. La taille suffit à dire le rang dans une rangée de trois — c'est
// la règle de l'onglet actif du dock, où « le fond, l'encre, la taille et la
// graisse » disent la même chose et où la TAILLE est celle qui se voit de loin.
//
// SIX AU PLUS, et le reste se compte. Les manifestations en réunissent huit :
// alignés, ils tomberaient à la taille d'un bouton et la tuile cesserait de se
// lire d'un coup d'œil. C'est déjà la coupe du « +N » d'un jour trop chargé.
const VISAGES_AU_PLUS = 6;

// LA RANGÉE GARDE SA PLACE, MÊME VIDE (20 septembre 2026, demande de Noé :
// « aligne les titres des tuiles n'ayant pas de personnes assignées avec celles
// qui en ont, garde de l'espace donc pour de potentielles futures personnes
// dans ces commissions qui sont vides pour le moment »).
//
// C'est la règle de l'étagère de la bibliothèque, au mot près : *« chaque bloc
// RÉSERVE sa hauteur, si bien qu'un titre court et un titre long laissent
// l'état et la note sur la même horizontale »*. Ici les quatre domaines sans
// équipe remontaient leur nom de cinquante pixels, et dix tuiles ne se lisaient
// plus sur une ligne commune.
//
// ET LE VIDE DIT QUELQUE CHOSE DE VRAI : la place attend quelqu'un. C'est
// exactement ce que Noé a écrit — « ça arrivera plus tard ».
function visagesDuDomaine(groupe) {
  if (!groupe?.membres.length) return '<span class="pole-visages" aria-hidden="true"></span>';

  const responsables = groupe.membres.filter((id) => groupe.responsables.includes(id));
  const autres = groupe.membres.filter((id) => !groupe.responsables.includes(id));
  const ranges = [...responsables, ...autres];
  const montres = ranges.slice(0, VISAGES_AU_PLUS);
  const reste = ranges.length - montres.length;

  return `<span class="pole-visages">${montres.map((id) => {
    const p = PERSONNES[id];
    if (!p) return '';
    const chef = groupe.responsables.includes(id);
    return `<span class="pole-visage${chef ? ' pole-visage-chef' : ''}"
      title="${echapper(p.nom)}${chef ? ' · responsable' : ''}">${portrait(p)}</span>`;
  }).join('')}${reste ? `<span class="pole-visages-reste">+${reste}</span>` : ''}</span>`;
}

function tuileDomaine(d) {
  const objectifs = objectifsDuDomaine(d.id).length;

  // LA TUILE SE DÉPOUILLE (20 septembre 2026, demande de Noé) : « enlève le
  // "pôle et commission", mets la pastille de couleur devant le nom de la
  // commission, resserre les textes d'en dessous, enlève le nombre de
  // personnes, augmente un peu la taille du nom, enlève le texte détail ».
  //
  // CE QUI PART, ET POURQUOI CHACUN SE JUSTIFIE :
  //   « Pôle et commission »  →  neuf tuiles sur dix le disaient, et ce qui ne
  //                              distingue rien occupe de la place. *C'est la
  //                              leçon de « en sommeil » sur les habitudes.*
  //   la mission              →  une ligne de texte par tuile, qu'on ne lit
  //                              qu'une fois ; elle reste sur la page du pôle.
  //   le nombre de personnes  →  les VISAGES le disent, et mieux : on les
  //                              compte du regard. Deux façons de dire la même
  //                              chose sur trois centimètres.
  //
  // LA PASTILLE MIGRE DANS LE TITRE. Elle portait la couleur à côté d'un mot
  // qui disparaît ; elle la porte maintenant à côté du nom, qui est le sujet.
  // *Un signe suit ce qu'il qualifie.*
  return `
    <article class="cap-tuile pole-tuile"
      style="--couleur-espace:${d.couleur};--couleur-espace-pleine:${d.couleur}">
      <a class="cap-tuile-ouvrir" href="${ADRESSE}/pole-${d.id}">
        ${visagesDuDomaine(d.groupe)}
        <h3 class="cap-tuile-titre pole-tuile-nom"><span class="pastille"></span><span
          >${echapper(d.nom)}</span></h3>
        ${
          // AUCUN ZÉRO EN VITRINE : la buvette ne porte aucun objectif, ce
          // n'est pas un manque à afficher. C'est la règle du hub, celle qui
          // fait taire une série à zéro sur une habitude neuve.
          objectifs
            ? `<span class="cap-tuile-pied"><span>${objectifs} objectif${
                objectifs > 1 ? 's' : ''
              }</span></span>`
            : ''
        }
      </a>
    </article>`;
}

// LES PÔLES SE RANGENT PAR AXE (20 septembre 2026, demande de Noé : « trie par
// axe en rajoutant un petit titre en dehors des tuiles, donc 4 blocs de
// tuiles »).
//
// C'EST L'ARBORESCENCE DE SON DOCUMENT, RENDUE TELLE QUELLE : dix tuiles à la
// suite étaient un inventaire ; quatre blocs de deux ou trois sont une
// STRUCTURE — celle du projet du club, qu'on lit sans avoir à la reconstituer.
//
// LE TITRE EST UN LIEN VERS L'AXE, et c'est gratuit : la page existe, et
// nommer une famille sans pouvoir l'ouvrir serait une porte peinte. *Il reste
// DEHORS, au-dessus des tuiles* — un titre de bloc n'entre pas dans ce qu'il
// coiffe.
//
// AUCUN AXE NE SE TAIT : les quatre ont au moins deux domaines, et la table
// `AXE_DU_DOMAINE` les couvre tous les dix. Un bloc vide se saurait — mais on
// ne l'affiche pas, par la même règle qui ferme une porte sur une pièce vide.
function poles() {
  return `<section class="bloc fch-sans-tuile">
    <h2>Les commissions</h2>
    <p class="projet-club-service">Chaque domaine du club : ce qu’il vise, et qui le porte.</p>
    ${AXES_FCH.map((a) => {
      const retenus = polesDeLAxe(a.id);
      if (!retenus.length) return '';
      return `<h3 class="pole-axe-titre">
          <a href="${ADRESSE}/axe-${a.id}" style="--pole-couleur:${a.couleur}">${echapper(a.nom)}</a>
        </h3>
        <div class="cap-galerie">${retenus.map(tuileDomaine).join('')}</div>`;
    }).join('')}
  </section>`;
}

// L'ÉQUIPE D'UN DOMAINE : les responsables d'abord, nommés comme tels. C'est la
// carte de l'organigramme, empruntée et non recopiée — `portrait` en vient, et
// le lien mène à la fiche de la personne, là où elle vit déjà.
function equipeDuDomaine(groupe) {
  if (!groupe?.membres.length) {
    return `<p class="discret">Personne n’y est encore nommé — ça viendra.</p>`;
  }
  const role = (id) => (groupe.responsables.includes(id) ? 'Responsable' : 'Membre');
  const ranges = [
    ...groupe.membres.filter((id) => groupe.responsables.includes(id)),
    ...groupe.membres.filter((id) => !groupe.responsables.includes(id)),
  ];
  return `<div class="orga-personnes">${ranges.map((id) => {
    const p = PERSONNES[id];
    if (!p) return '';
    const morceaux = p.nom.split(' ');
    return `<a class="orga-personne" href="#hermitage/commissions/${echapper(id)}">
      ${portrait(p)}<span class="orga-nom">${echapper(morceaux.shift())}
        <strong>${echapper(morceaux.join(' '))}</strong></span>
      <span class="orga-role">${echapper(role(id))}</span></a>`;
  }).join('')}</div>`;
}

// CE QU'ON IGNORE AVANT DE L'OUVRIR : lequel, quand, où. Une porte qui ne
// dirait que « Les évènements » ne vaudrait pas la ligne qu'elle prend — c'est
// la règle des portes du site depuis le hall de `#perso`.
function prochainEvenement() {
  const prochain = prochainEvenementClub();
  if (!prochain) {
    return `<section class="bloc fch-sans-tuile"><h2>Le prochain évènement</h2>
      <p class="discret">Aucun évènement à venir au calendrier de la saison.</p></section>`;
  }
  const { evenement } = prochain;
  return `<section class="bloc fch-sans-tuile"><h2>Le prochain évènement</h2>
    ${porte(`#hermitage/evenements/${evenement.id}`, evenement.titre, '',
      `<span class="fch-hall-quoi">${echapper(evenement.date)}${
        evenement.lieu ? ` · ${echapper(evenement.lieu)}` : ''}${
        evenement.incertain ? ' · date à confirmer' : ''}</span>`)}</section>`;
}

function ficheDomaine(d) {
  const objectifs = objectifsDuDomaine(d.id);
  const deLaSaison = objectifs.filter((o) => o.echeances.includes(ECHEANCE_SAISON));
  const plusLoin = objectifs.filter((o) => !o.echeances.includes(ECHEANCE_SAISON));
  const projets = projetsDuDomaine(d.id);
  const axe = axeDuDomaine(d.id);

  return `<article class="projet-club">
    <a class="lien-discret projet-club-retour" href="${ADRESSE}/poles">← Toutes les commissions</a>
    ${/* L'AXE MONTE DANS LA TÊTE, AU-DESSUS DU NOM (20 septembre 2026, demande
          de Noé : « ça doit monter dans la tuile du nom de la commission, après
          pôle et commission »).

          IL AVAIT UNE SECTION À LUI — « Ce qu'il sert » —, un titre de bloc et
          une pastille : trois lignes et une respiration de section pour DIRE UN
          MOT. Or ce mot est de la même nature que le rang qu'il remplace : il
          dit CE QU'EST ce domaine, pas ce qu'il contient. Sa place est donc dans
          la tête, et non dans le corps de la page avec les gens et les projets.

          ET IL A PRIS LA LIGNE, PLUS SEULEMENT SA MOITIÉ (même jour, demande de
          Noé : « enlève pôle et commission »). Les deux étiquettes ont cohabité
          une heure ; « Pôle et commission » disait ce que la page entière dit
          déjà — le menu y mène sous ce mot, l'onglet le porte —, tandis que
          l'axe est la seule chose qu'on IGNORE en arrivant. **Une étiquette qui
          nomme l'écran où l'on est n'apprend rien.**

          SANS AXE, PAS DE LIGNE : une ligne vide au-dessus du nom ouvrirait un
          blanc que rien ne justifie. */''}
    <header class="valeur-tete" style="--valeur-couleur:${d.couleur}">
      ${axe
        ? `<p class="pole-tete-rang"><a class="projet-club-axe-lien"
            href="${ADRESSE}/axe-${axe.id}"
            style="--pole-couleur:${axe.couleur}">${echapper(axe.nom)}</a></p>`
        : ''}
      <h2>${echapper(d.nom)}</h2>
      ${d.groupe?.aide ? `<p class="projet-club-phrase">${echapper(d.groupe.aide)}</p>` : ''}
    </header>

    ${/* DEUX BLOCS CÔTE À CÔTE (20 septembre 2026, demande de Noé : « utilise des
          blocs côte à côte plutôt que tout mettre ligne par ligne — par exemple
          qui le porte peut avoir un autre bloc à sa droite »).

          LES GENS À GAUCHE, CE QU'ILS FONT À DROITE. Le premier bloc est court
          par nature — une à huit personnes — et laissait la moitié droite de
          l'écran vide sur toute sa hauteur. La colonne de droite porte donc ce
          que le pôle a en tête : son cap, puis ses chantiers.

          LES OBJECTIFS SONT REMONTÉS AU-DESSUS DES PROJETS (20 septembre 2026,
          demande de Noé : « le ou les objectifs de l'année doivent apparaître
          plus haut dans la page, mets-les au-dessus de "ses projets" »). Ils
          FERMAIENT la page, sous les missions — donc sous deux écrans de
          défilement, et **c'est le cap qui se lisait en dernier**. L'ordre de la
          colonne dit maintenant ce que le pôle vise avant ce qu'il mène : un
          projet ne se comprend qu'une fois qu'on sait vers quoi il pousse.

          *Ce que ça renverse : « les objectifs ferment la page — c'est le cap,
          on le lit après », écrit le matin même. L'argument valait pour un ordre
          de LECTURE ; il ne valait pas la place où il les mettait.*

          ILS GLISSENT plutôt que de s'empiler (même demande, « comme dans la
          page d'accueil du hub ») : c'est `.projet-rail`, le rail du tableau de
          bord, repris tel quel — une tuile se lit à la fois, les voisines
          dépassent d'un liseré. **Un second rail écrit à côté aurait fini par ne
          plus glisser pareil.** Sans projet, pas de rail : la phrase le dit, et
          une piste vide se lirait comme une panne. */''}
    <div class="pole-duo">
      <section class="bloc fch-sans-tuile"><h2>Qui le porte</h2>
        ${equipeDuDomaine(d.groupe)}</section>

      <div class="pole-colonne">
        ${d.id === 'manifestations' ? prochainEvenement() : ''}
        ${/* SEULEMENT CEUX DE LA SAISON, ET EN RAIL (20 septembre 2026, demande
              de Noé : « non seulement les objectifs de cette saison, et de la
              même manière que les projets côte à côte que l'on puisse
              slider »).

              LE CLUB POSE SES OBJECTIFS SUR TROIS COLONNES — N+1, N+3, N+5 —,
              et cette page répond à « qu'est-ce qu'on fait CETTE ANNÉE ». Un
              cap à cinq ans n'y change rien : il se lit sur la page des
              objectifs et sur celle de son axe, où les trois horizons se
              comparent. *Mesuré : le pôle sportif en affichait cinq, dont un
              seul de la saison — les quatre autres repoussaient les projets
              hors de l'écran.*

              L'HORIZON NE S'ÉCRIT PLUS SUR LES TUILES : elles sont toutes de
              la même saison, et le titre du bloc le dit. C'est déjà l'argument
              d'`avecHorizon` sur la page des objectifs — ce qui se montre n'a
              pas à se nommer, et une mention identique partout ne distingue
              rien.

              LE MÊME RAIL QUE LES PROJETS, à trois centimètres de là : deux
              listes voisines qui glissent de deux façons, ce serait deux gestes
              pour une même colonne. `.pole-rail` connaît les deux formes depuis
              ce matin.

              SANS OBJECTIF DE SAISON, LA PHRASE DIT LEQUEL DES DEUX CAS : un
              pôle dont tous les caps sont à trois ans n'est pas un pôle sans
              cap. */''}
        <section class="bloc fch-sans-tuile"><h2>Ses objectifs de la saison</h2>
          ${deLaSaison.length
            ? `<div class="projet-rail pole-rail">${
                deLaSaison.map((o) => tuileObjectif(o, o.titre, { avecHorizon: false })).join('')}</div>`
            : `<p class="discret">${objectifs.length
                ? 'Aucun objectif cette saison — ses caps sont posés plus loin.'
                : 'Aucun objectif ne lui est rattaché pour le moment.'}</p>`}</section>
        <section class="bloc fch-sans-tuile"><h2>Ses projets</h2>
          ${projets.length
            ? `<div class="projet-rail pole-rail">${projets.map(tuileProjet).join('')}</div>`
            : '<p class="discret">Aucun projet rattaché pour le moment.</p>'}</section>
      </div>
    </div>

    ${/* LE RÉCAPITULATIF DES RESPONSABILITÉS ET MISSIONS (20 septembre 2026,
         demande de Noé : « un récap des responsabilités et missions comme dans
         le document, joint aux missions de chacun — si l'un change ça change
         sur l'autre page », puis « c'est dans ces pages là que je veux que ça
         apparaisse »).

         IL EST DÉPLIÉ ICI, et replié dans l'onglet du bureau : cette page ne
         parle QUE de ce domaine, donc ce qu'elle a à dire n'a pas à se demander.
         Le repli sert là où neuf commissions se suivent.

         IL SUIT LE DUO ET PRÉCÈDE LES OBJECTIFS, et l'ordre se lit : qui tient
         le pôle, ce qu'il fait, ce qu'il tient au quotidien, puis où il va. Les
         missions sont le PRÉSENT du pôle, les objectifs son cap.

         C'EST LA MÊME SOURCE QUE LA FICHE D'UNE PERSONNE : une mission corrigée
         dans js/missions-fch.js bouge des deux côtés à la fois. */''}
    ${/* `d.id` ET NON `d.groupe.id` : « Organisation du club » est un pôle SANS
          groupe d'organigramme — il rassemble la présidence, le secrétariat et
          la trésorerie —, et le lire par son groupe l'aurait laissé muet.
          La couleur du pôle descend aux cartes (voir `--recap-couleur`). */''}
    ${missionsDuPole(d.id)
      ? `<section class="bloc fch-sans-tuile" style="--pole-couleur:${d.couleur}">
          <h2>Ses responsabilités et missions</h2>
          ${missionsDuPole(d.id)}</section>`
      : ''}

    ${/* LE PROCHAIN ÉVÈNEMENT, SUR LA PAGE DES MANIFESTATIONS (20 septembre 2026,
          demande de Noé : « pour la page de la commission manifestations, au
          dessus du bloc ses projets, il doit y avoir le prochain évènement, avec
          un lien qui permet d'aller sur la page de l'évènement »).

          SUR CETTE PAGE ET SUR ELLE SEULE : c'est la commission qui organise les
          évènements du club, et la question « c'est quand le prochain ? » ne se
          pose nulle part ailleurs. Une porte identique sur les huit autres
          pôles serait un meuble.

          EN TÊTE DE LA COLONNE DE DROITE, avant les objectifs et les projets
          (20 septembre 2026, demande de Noé : « pour la commission manif, entre
          le prochain évènement et ses projets »). C'est la seule chose de cette
          page qui porte une DATE : elle passe devant ce qui n'en a pas.

          LA DATE VIENT DU DOCUMENT, pas d'une colonne : `EVENEMENTS_CLUB` écrit
          ses dates en toutes lettres, et `prochainEvenementClub` les lit. Deux
          écritures d'une même date finiraient par se contredire. */''}
    ${/* ET CE QUI VIENT APRÈS FERME LA PAGE (20 septembre 2026, demande de Noé :
          « les objectifs à plus long terme doivent être retrouvés en bas de page
          comme avant »).

          LES DEUX BLOCS NE RÉPONDENT PAS À LA MÊME QUESTION, et c'est ce qui
          justifie de les séparer plutôt que de choisir : la colonne de droite
          dit ce qu'on fait CETTE SAISON — on la lit avec les projets qui la
          servent —, et ce bloc dit où va le pôle ensuite. **Le second se relit,
          il ne se travaille pas** : sa place est donc en bas, pleine largeur,
          après les missions.

          AUCUN OBJECTIF NE FIGURE DEUX FOIS : un cap posé à la fois sur N+1 et
          sur N+5 est sur la table cette saison, donc il reste en haut. Ce bloc
          ne prend que ce qui n'y est PAS — sans quoi sa tuile, qui n'écrit que
          le PREMIER horizon, dirait « la saison qui vient » sous un titre qui
          annonce le contraire.

          ET IL SE TAIT QUAND IL N'A RIEN À DIRE : « aucun objectif à plus long
          terme » sous un cap qu'on vient de lire n'apprend rien. La galerie, et
          non le rail : ici la page est entière, les tuiles se comparent côte à
          côte. */''}
    ${plusLoin.length
      ? `<section class="bloc fch-sans-tuile"><h2>Ses objectifs à plus long terme</h2>
          <div class="cap-galerie">${plusLoin.map((o) => tuileObjectif(o)).join('')}</div>
        </section>`
      : ''}

    ${retourAuProjet()}</article>`;
}

// ── LA PAGE D'UNE VALEUR ──────────────────────────────────────────────────────

// LA COULEUR PEUT ÊTRE FRANCHE ICI, et c'est toute la différence avec la
// galerie : une valeur à la fois, donc rien à confondre. La tête reprend la
// forme du carrousel du club — le rang, le nom en grand, les trois idées.
function ficheValeur(v) {
  return `<article class="valeur-fiche" style="--valeur-couleur:${v.couleur}">
    <a class="lien-discret" href="${ADRESSE}">← Le projet du club</a>
    <header class="valeur-tete">
      <p class="valeur-rang">${v.rang}<sup>${v.rang === 1 ? 're' : 'e'}</sup> valeur${
        v.principale ? ' · <span class="valeur-principale">★ principale</span>' : ''}</p>
      <h2>${echapper(v.avecArticle)}</h2>
    </header>
    <ul class="valeur-idees">${v.idees.map((i) => `<li>${echapper(i)}</li>`).join('')}</ul>
    <h3 class="titre-section">Qu’est-ce que ça veut dire au FCH ?</h3>
    <div class="valeur-definition">${v.definition.map((p) => `<p>${echapper(p)}</p>`).join('')}</div>
    <div class="valeur-bas">
      <section class="fch-tuile">
        <h4>Un comportement</h4>
        <p class="valeur-comportement">${echapper(v.comportement)}</p>
        <p class="discret">L’exemple que le club s’est donné pour la reconnaître dans les faits.</p>
      </section>
      <section class="fch-tuile">
        <h4>Mots associés</h4>
        <ul class="valeur-mots">${v.mots.map((m) => `<li>${echapper(m)}</li>`).join('')}</ul>
        <p class="discret">Née de la famille « ${echapper(v.famille)} » lors du tri des mots.</p>
      </section>
    </div>
    <nav class="valeur-suite" aria-label="Les autres valeurs">
      ${VALEURS_FCH.filter((a) => a.id !== v.id).map((a) => `<a href="${ADRESSE}/${a.id}"
        style="--valeur-couleur:${a.couleur}">${echapper(a.nom)}</a>`).join('')}
    </nav>
    <details class="orga-sources"><summary>Documents de référence</summary>
      <p>La Mission et les Valeurs, réunion projet n° 2 · le carrousel de la valeur, dossier Valeurs.</p>
    </details>
  </article>`;
}

// ── L'ASSEMBLAGE ──────────────────────────────────────────────────────────────

// LES OBJECTIFS DE LA SAISON, EN RAIL, EN TÊTE DE LA PAGE « CLUB » (20 septembre
// 2026, demande de Noé : « dans la page "club" on doit avoir en haut les
// objectifs de la saison à venir à pouvoir slider »).
//
// ILS ONT PASSÉ UNE HEURE EN LISTE COMPACTE dans le tableau de bord (22 septembre
// 2026), trois lignes et « et 4 autres ». Noé les a fait revenir : *« je préfère
// quand c'est davantage comme avant, en haut de page et les tuiles côte à côte
// qu'on peut slider, 3 objectifs visibles minimum en vue ordinateur »*. Le cap
// n'est pas une information parmi d'autres : c'est ce vers quoi tout le reste de
// la page travaille, et il se lit en tête.
//
// SEPT SUR DIX-HUIT : les onze autres visent trois ou cinq ans et se comparent
// sur la page des objectifs. L'horizon ne s'écrit pas sur les tuiles — elles
// sont toutes de la même saison, et le titre du bloc le dit.
//
// LES TROIS PRIORITÉS VOTÉES À L'AG PASSENT DEVANT, et c'est ce qui reste de la
// liste compacte : sur un rail où l'on n'en voit que trois de front, les trois
// premières doivent être celles que le club a choisies.
const PRIORITES_AG = ['encadrement', 'benevoles', 'sponsors'];

export function railDesObjectifsDeLaSaison() {
  const retenus = OBJECTIFS_FCH.filter((o) => o.echeances.includes(ECHEANCE_SAISON));
  if (!retenus.length) return '';
  const rang = (o) => (PRIORITES_AG.includes(o.id) ? PRIORITES_AG.indexOf(o.id) : PRIORITES_AG.length);
  const ordonnes = retenus
    .map((o, i) => ({ o, i }))
    .sort((a, b) => rang(a.o) - rang(b.o) || a.i - b.i)
    .map(({ o }) => o);
  return `<section class="bloc fch-sans-tuile"><h2>Les objectifs de la saison qui vient</h2>
    <div class="projet-rail pole-rail club-rail">${
      ordonnes.map((o) => tuileObjectif(o, o.titre, { avecHorizon: false })).join('')}</div>
  </section>`;
}

export function construireProjetClub(selection) {
  const objectif = objectifDe(selection);
  if (objectif) return ficheObjectif(objectif);
  const projet = projetDe(selection);
  if (projet) return ficheProjet(projet);
  if (selection === 'projets') return `<div class="projet-club">${retourAuProjet()}
    <section class="bloc fch-sans-tuile"><h2>Les projets du club</h2><div class="fch-hall">${projetsDuClub.map(tuileProjet).join('')}</div></section></div>`;
  const v = valeurDe(selection);
  if (v) return ficheValeur(v);
  const pole = typeof selection === 'string' && selection.startsWith('pole-')
    ? selection.slice(5) : null;
  const axe = typeof selection === 'string' && selection.startsWith('axe-')
    ? axeDe(selection.slice(4)) : null;
  if (axe) return ficheAxe(axe);
  if (selection === 'axes') return `<div class="projet-club">${retourAuProjet()}${axes()}</div>`;
  // `pole-<id>` OUVRE DÉSORMAIS LA PAGE DU DOMAINE, et non plus la page des
  // objectifs filtrée (20 septembre 2026). L'adresse ne change pas — un favori
  // se casse, pas un nom —, mais ce qu'elle montre est plus complet : la page
  // porte les mêmes objectifs PLUS l'équipe, les projets et les axes servis.
  // Garder le filtre à côté aurait fait deux écrans pour une même chose.
  const domaine = domaineDe(pole);
  if (domaine) return ficheDomaine(domaine);
  if (selection === 'poles') return `<div class="projet-club">${retourAuProjet()}${poles()}</div>`;
  if (!selection) return accueilDuProjet();
  if (selection === 'mission') return `<div class="projet-club">${retourAuProjet()}${mission()}</div>`;
  if (selection === 'valeurs') return `<div class="projet-club">${retourAuProjet()}${valeurs()}</div>`;
  if (selection === 'objectifs') {
    return `<div class="projet-club">${retourAuProjet()}${objectifs()}</div>`;
  }
  return accueilDuProjet();
}

// Le titre du navigateur et celui de la barre : une valeur ouverte porte son
// nom, comme une fiche de personne porte le sien.
export function titreDuProjet(selection) {
  if (typeof selection === 'string' && selection.startsWith('axe-') && axeDe(selection.slice(4))) {
    return 'Axe du projet';
  }
  if (selection === 'axes') return 'Les axes';
  if (selection === 'poles') return 'Les commissions';
  if (typeof selection === 'string' && selection.startsWith('pole-')
    && domaineDe(selection.slice(5))) {
    return domaineDe(selection.slice(5)).nom;
  }
  if (objectifDe(selection)) return 'Objectif du club';
  if (projetDe(selection)) return 'Projet du club';
  if (selection === 'projets') return 'Les projets';
  const valeur = valeurDe(selection);
  if (valeur) return valeur.nom;
  if (selection === 'mission') return 'La mission';
  if (selection === 'valeurs') return 'Les valeurs';
  if (selection === 'objectifs') return 'Les objectifs';
  return null;
}
