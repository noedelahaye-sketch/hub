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
function tuileObjectif(o, titre = o.titre) {
  return porte(`${ADRESSE}/objectif-${o.id}`, titre, `${o.projets.length} projet${o.projets.length > 1 ? 's' : ''}`,
    `<span class="fch-hall-quoi">${echapper(o.indicateur || o.axes.map(axeDe).map((a) => a.nom).join(' · '))}</span>`);
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
    <section class="bloc"><h2>Le cap</h2><p>${o.axes.map(axeDe).map((a) => echapper(a.nom)).join(' · ')}</p>
      ${o.indicateur ? `<h3>Ce qu’on regarde</h3><p>${echapper(o.indicateur)}</p>` : ''}</section>
    <section class="bloc fch-sans-tuile"><h2>Les projets associés</h2>
      ${projets.length ? `<div class="fch-hall">${projets.map(tuileProjet).join('')}</div>` : '<p class="discret">Aucun projet associé pour le moment.</p>'}</section>
    ${retourAuProjet()}</article>`;
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
    <section class="bloc"><h2>Organisation</h2><p class="discret">Responsable, étapes et dates de réalisation restent à préciser.</p></section>
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
      <div class="fch-hall">${AG_2026.retenus.map(([titre], i) =>
        tuileObjectif(OBJECTIFS_FCH.find((o) => o.id === ['encadrement', 'benevoles', 'sponsors'][i]), titre)).join('')}</div>
    </section>
    <nav class="fch-hall" aria-label="Le projet en détail">
      ${porte(`${ADRESSE}/mission`, 'La mission', '', '<span class="fch-hall-quoi">Transmettre l’envie de jouer et les quatre piliers qui nous guident.</span>')}
      ${porte(`${ADRESSE}/valeurs`, 'Les valeurs', '6', '<span class="fch-hall-quoi">Leur sens au club et les comportements qui les font vivre.</span>')}
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
  return `<li class="projet-club-objectif-lien">${tuileObjectif(o)}</li>`;
}

function colonneEcheance(e, pole) {
  const retenus = OBJECTIFS_FCH.filter((o) => o.echeances.includes(e.id)
    && (!pole || o.poles.includes(pole)));
  return `<section class="projet-club-horizon">
    <h3><span class="projet-club-horizon-nom">${echapper(e.nom)}</span> ${echapper(e.quand)}</h3>
    ${e.priorite ? `<p class="projet-club-priorite">${echapper(e.priorite)}</p>` : ''}
    ${retenus.length
      ? `<ul class="projet-club-objectifs">${retenus.map((o) => carteObjectif(o, e.id)).join('')}</ul>`
      : '<p class="vide">Rien de visé à cet horizon pour ce pôle.</p>'}
  </section>`;
}

// ON N'OFFRE QUE LES PÔLES QUI PORTENT UN OBJECTIF : un filtre sur une liste
// vide est une porte sur une pièce vide. C'est la règle des filtres de la
// bibliothèque, appliquée ici.
function filtres(pole) {
  const vivants = POLES_FCH.filter((p) => OBJECTIFS_FCH.some((o) => o.poles.includes(p.id)));
  const bouton = (id, nom, compte) => {
    const tous = id === 'objectifs';
    const actif = tous ? !pole : pole === id;
    return `<a href="${ADRESSE}/${tous ? 'objectifs' : `pole-${id}`}"
      class="${actif ? 'actif' : ''}" ${actif ? 'aria-current="page"' : ''}
      ${tous ? '' : `style="--pole-couleur:${poleDe(id).couleur}"`}>${echapper(nom)}${
      compte === null ? '' : ` <span class="projet-club-compte">${compte}</span>`}</a>`;
  };
  return `<nav class="projet-club-filtres" aria-label="Filtrer les objectifs par pôle">
    ${bouton('objectifs', 'Tous les pôles', OBJECTIFS_FCH.length)}
    ${vivants.map((p) => bouton(p.id, p.nom, OBJECTIFS_FCH.filter((o) => o.poles.includes(p.id)).length)).join('')}
  </nav>`;
}

function objectifs(pole) {
  return `<section class="bloc">
    <h2>Les objectifs</h2>
    <p class="projet-club-service">Chaque objectif sert un axe et un pôle, et vise un horizon. Ceux de la saison qui vient portent en plus ce qu’on regarde pour savoir où l’on en est.</p>
    ${filtres(pole)}
    <div class="projet-club-horizons">${ECHEANCES_FCH.map((e) => colonneEcheance(e, pole)).join('')}</div>
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
  if (!selection) return accueilDuProjet();
  if (selection === 'mission') return `<div class="projet-club">${retourAuProjet()}${mission()}</div>`;
  if (selection === 'valeurs') return `<div class="projet-club">${retourAuProjet()}${valeurs()}</div>`;
  if (selection === 'objectifs' || poleDe(pole)) {
    return `<div class="projet-club">${retourAuProjet()}${objectifs(poleDe(pole) ? pole : null)}</div>`;
  }
  return accueilDuProjet();
}

// Le titre du navigateur et celui de la barre : une valeur ouverte porte son
// nom, comme une fiche de personne porte le sien.
export function titreDuProjet(selection) {
  if (objectifDe(selection)) return 'Objectif du club';
  if (projetDe(selection)) return 'Projet du club';
  if (selection === 'projets') return 'Les projets';
  const valeur = valeurDe(selection);
  if (valeur) return valeur.nom;
  if (selection === 'mission') return 'La mission';
  if (selection === 'valeurs') return 'Les valeurs';
  if (selection === 'objectifs' || (typeof selection === 'string' && selection.startsWith('pole-'))) {
    return 'Les objectifs';
  }
  return null;
}
