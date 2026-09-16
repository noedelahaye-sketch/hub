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

const ADRESSE = '#hermitage/projet-club';
const axeDe = (id) => AXES_FCH.find((a) => a.id === id);
const poleDe = (id) => POLES_FCH.find((p) => p.id === id);
export const valeurDe = (id) => VALEURS_FCH.find((v) => v.id === id);

// ── LA MISSION ────────────────────────────────────────────────────────────────

function mission() {
  const m = MISSION_FCH;
  return `<section class="bloc">
    <h2>La mission</h2>
    <p class="projet-club-phrase">${echapper(m.phrase)}</p>
    <p class="projet-club-developpee">${echapper(m.developpee)}</p>
    <ul class="projet-club-piliers">${m.piliers.map((p) => `<li>${echapper(p)}</li>`).join('')}</ul>
    <details class="projet-club-repli">
      <summary>Pourquoi cette phrase-là</summary>
      <dl class="projet-club-criteres">${m.criteres.map(([nom, quoi]) => `
        <div><dt>${echapper(nom)}</dt><dd>${echapper(quoi)}</dd></div>`).join('')}</dl>
      <p class="discret">Trois autres missions étaient en balance, une par priorité possible :</p>
      <dl class="projet-club-criteres">${m.ecartees.filter((e) => !e[0].includes('associative')).map(([nom, quoi]) => `
        <div><dt>${echapper(nom)}</dt><dd>${echapper(quoi)}</dd></div>`).join('')}</dl>
    </details>
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
function carteObjectif(o, echeance) {
  const axes = o.axes.map(axeDe).filter(Boolean);
  const autres = o.echeances.filter((e) => e !== echeance);
  const horizon = ECHEANCES_FCH.filter((e) => autres.includes(e.id)).map((e) => e.nom);
  return `<li class="projet-club-objectif" style="--axe-couleur:${axes[0]?.couleur ?? '#8d93a3'}">
    <p class="projet-club-objectif-titre">${o.emoji ? `<span aria-hidden="true">${o.emoji}</span> ` : ''}${echapper(o.titre)}</p>
    <p class="projet-club-marques">${o.poles.map(pastillePole).join('')}${
      horizon.length ? `<span class="projet-club-aussi">aussi à ${echapper(horizon.join(' et '))}</span>` : ''}</p>
    <p class="projet-club-axe">${axes.map((a) => echapper(a.nom)).join(' · ')}</p>
    ${o.indicateur ? `<p class="projet-club-indicateur"><span>Ce qu’on regarde</span> ${echapper(o.indicateur)}</p>` : ''}
    ${o.projets.length ? `<ul class="projet-club-projets">${
      o.projets.map((p) => `<li>${echapper(p)}</li>`).join('')}</ul>` : ''}
  </li>`;
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
  const bouton = (id, nom, compte) => `<a href="${ADRESSE}${id ? `/pole-${id}` : ''}"
      class="${pole === id ? 'actif' : ''}" ${pole === id ? 'aria-current="page"' : ''}
      ${id ? `style="--pole-couleur:${poleDe(id).couleur}"` : ''}>${echapper(nom)}${
      compte === null ? '' : ` <span class="projet-club-compte">${compte}</span>`}</a>`;
  return `<nav class="projet-club-filtres" aria-label="Filtrer les objectifs par pôle">
    ${bouton(null, 'Tous les pôles', OBJECTIFS_FCH.length)}
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
      <summary>Les trois objectifs présentés à l’assemblée générale</summary>
      <p class="discret">${echapper(AG_2026.quand)}.</p>
      <ul class="projet-club-ag">${AG_2026.retenus.map(([titre, axe]) => `
        <li style="--axe-couleur:${axeDe(axe).couleur}"><strong>${echapper(titre)}</strong>
        <span class="projet-club-axe">${echapper(axeDe(axe).nom)}</span></li>`).join('')}</ul>
    </details>
    <details class="projet-club-repli">
      <summary>Les projets qui n’ont pas encore d’objectif <span class="projet-club-compte">${PROJETS_LIBRES_FCH.length}</span></summary>
      <p class="discret">Des idées posées au tableau, gardées telles quelles : une idée qui attend son objectif reste une idée.</p>
      <ul class="projet-club-libres">${PROJETS_LIBRES_FCH.map((p) => `
        <li class="projet-club-libres-item">${p.emoji ? `<span aria-hidden="true">${p.emoji}</span> ` : ''}${echapper(p.titre)}
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
  const v = valeurDe(selection);
  if (v) return ficheValeur(v);
  const pole = typeof selection === 'string' && selection.startsWith('pole-')
    ? selection.slice(5) : null;
  return `<div class="projet-club">
    ${mission()}
    ${valeurs()}
    ${objectifs(poleDe(pole) ? pole : null)}
  </div>`;
}

// Le titre du navigateur et celui de la barre : une valeur ouverte porte son
// nom, comme une fiche de personne porte le sien.
export function titreDuProjet(selection) {
  return valeurDe(selection)?.nom ?? null;
}
