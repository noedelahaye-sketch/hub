// LE SUIVI DES ENGAGEMENTS PARTENAIRES (16 septembre 2026, demande de Noé) :
// « pour un partenaire qui a pris un pack Esprit Collectif, avoir la liste des
// choses que l'on doit faire de notre côté (vignette album, panneau…) pour
// assurer un bon suivi ».
//
// LA PAGE RÉPOND À DEUX QUESTIONS, ET ELLE LES SÉPARE :
//   — « qu'est-ce qu'on doit à CETTE entreprise ? » → la liste par partenaire ;
//   — « qu'est-ce qu'il me reste à faire ? » → la même chose rangée PAR CHANTIER,
//     parce qu'on ne fait pas les vignettes d'album partenaire par partenaire :
//     on les fait toutes le même soir. **C'est la vue qui fait gagner du temps**,
//     et c'est pour ça qu'elle ouvre la page.
//
// LE CATALOGUE EST DANS LE DÉPÔT, LES ENGAGEMENTS EN BASE. Le premier est
// public — c'est le dossier qu'on envoie aux entreprises ; les seconds portent
// des montants, des CERFA et des notes de négociation, et se cochent.
import {
  ENGAGEMENTS_FCH, MOMENTS_FCH, OFFRES_FCH, ETATS_PARTENAIRE,
  offreDe, engagementsDeLOffre,
} from './partenaires-fch.js';
import { echapper } from './format.js';

const ADRESSE = '#hermitage/partenaires';
const etatDe = (cle) => ETATS_PARTENAIRE.find(([id]) => id === cle);
const euros = (n) => (n === null || n === undefined
  ? '—'
  : `${Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`);

// Un engagement dû mais pas encore fait. C'est la seule mesure de la page, et
// elle ne compte JAMAIS un retard : il n'y a pas de date d'échéance sur un
// engagement, seulement un moment de la saison.
const reste = (p) => (p.engagements ?? []).filter((e) => !e.fait_le).length;
const faits = (p) => (p.engagements ?? []).filter((e) => e.fait_le).length;

// ── LE BILAN ──────────────────────────────────────────────────────────────────

export function bilanDesPartenaires(partenaires) {
  const tous = partenaires.flatMap((p) => p.engagements ?? []);
  return {
    nombre: partenaires.length,
    signes: partenaires.filter((p) => p.statut === 'partenaire').length,
    attendus: partenaires.filter((p) => p.statut === 'virement_attendu').length,
    montant: partenaires.reduce((t, p) => t + Number(p.montant ?? 0), 0),
    encaisse: partenaires
      .filter((p) => p.statut === 'partenaire')
      .reduce((t, p) => t + Number(p.montant ?? 0), 0),
    engagements: tous.length,
    faits: tous.filter((e) => e.fait_le).length,
  };
}

function bilan(partenaires) {
  const b = bilanDesPartenaires(partenaires);
  // L'objectif de la saison est écrit dans le projet du club : 26 000 €.
  const part = Math.min(100, Math.round((b.montant / 26000) * 100));
  const tuile = (chiffre, quoi, precision) => `<li class="suivi-bilan-tuile">
    <span class="suivi-chiffre">${echapper(chiffre)}</span>
    <span class="suivi-quoi">${echapper(quoi)}</span>
    ${precision ? `<span class="suivi-precision">${echapper(precision)}</span>` : ''}</li>`;
  return `<ul class="suivi-bilan">
    ${tuile(euros(b.montant), 'engagés cette saison', `${part} % des 26 000 € visés`)}
    ${tuile(euros(b.encaisse), 'déjà signés', `${euros(b.montant - b.encaisse)} en attente de virement`)}
    ${tuile(`${b.nombre}`, 'partenaires', `${b.signes} signés · ${b.attendus} en attente`)}
    ${tuile(`${b.faits}/${b.engagements}`, 'engagements tenus', b.faits === b.engagements
      ? 'Tout est fait.' : `${b.engagements - b.faits} à faire`)}
  </ul>`;
}

// ── CE QU'IL RESTE À FAIRE, PAR CHANTIER ──────────────────────────────────────

// LA VUE QUI FAIT GAGNER DU TEMPS : on ne fait pas les vignettes d'album une
// par une en rouvrant chaque fiche, on les fait toutes ensemble. Les engagements
// se regroupent donc par CLÉ, et les clés par moment de la saison.
export function parChantier(partenaires) {
  const lots = new Map();
  for (const p of partenaires) {
    for (const e of p.engagements ?? []) {
      const cle = e.cle ?? `libre:${e.libelle}`;
      if (!lots.has(cle)) {
        lots.set(cle, {
          cle,
          libelle: ENGAGEMENTS_FCH[e.cle]?.libelle ?? e.libelle,
          aide: ENGAGEMENTS_FCH[e.cle]?.aide ?? null,
          quand: ENGAGEMENTS_FCH[e.cle]?.quand ?? 'saison',
          lignes: [],
        });
      }
      lots.get(cle).lignes.push({ ...e, partenaire: p });
    }
  }
  // Ce qui reste à faire passe devant : un chantier terminé n'a plus rien à
  // demander, il n'a plus qu'à se relire.
  return [...lots.values()]
    .map((l) => ({ ...l, reste: l.lignes.filter((x) => !x.fait_le).length }))
    .sort((a, b) => b.reste - a.reste || a.libelle.localeCompare(b.libelle, 'fr'));
}

// LA CROIX NE S'OFFRE QUE SUR LA FICHE, pas dans les chantiers : on retire un
// engagement en regardant CE partenaire, pas en balayant une liste de douze
// vignettes où un doigt qui dérape efface la mauvaise. Et elle demande
// confirmation sur place — c'est la règle du hub pour ce qui ne se défait pas.
function ligneEngagement(e, avecPartenaire, aConfirmer) {
  const nom = avecPartenaire ? e.partenaire.nom : null;
  return `<li class="suivi-ligne${e.fait_le ? ' est-fait' : ''}">
    <button type="button" class="suivi-coche" data-basculer-engagement="${e.id}"
      aria-pressed="${e.fait_le ? 'true' : 'false'}"
      aria-label="${echapper(`${e.fait_le ? 'Fait' : 'À faire'} : ${e.libelle}${nom ? ` · ${nom}` : ''}`)}">
      <span aria-hidden="true"></span></button>
    <span class="suivi-ligne-texte">
      ${nom ? `<strong>${echapper(nom)}</strong>` : echapper(e.libelle)}
      ${e.detail ? `<span class="suivi-detail">${echapper(e.detail)}</span>` : ''}
      ${e.origine === 'ajout' ? '<span class="suivi-ajout" title="Négocié en plus de l’offre">négocié</span>' : ''}
    </span>
    ${e.fait_le ? `<span class="suivi-date">${echapper(quandFait(e.fait_le))}</span>` : ''}
    ${avecPartenaire ? '' : aConfirmer === e.id
      ? `<button type="button" class="suivi-retirer est-sure" data-retirer-engagement="${e.id}"
          >Retirer ?</button>`
      : `<button type="button" class="suivi-retirer" data-retirer-engagement="${e.id}"
          aria-label="${echapper(`Retirer : ${e.libelle}`)}" title="Retirer">×</button>`}
  </li>`;
}

const quandFait = (jour) => new Date(`${jour}T12:00:00`)
  .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

function chantiers(partenaires) {
  const lots = parChantier(partenaires);
  const parMoment = MOMENTS_FCH
    .map(([id, nom]) => [nom, lots.filter((l) => l.quand === id)])
    .filter(([, l]) => l.length);
  return `<section class="bloc">
    <h2>Ce qu’on doit faire</h2>
    <p class="suivi-service">Rangé par chantier, pas par partenaire : les vignettes de l’album se font toutes le même soir, pas une par une.</p>
    ${parMoment.map(([moment, lot]) => `
      <h3 class="suivi-moment">${echapper(moment)}</h3>
      <div class="suivi-chantiers">${lot.map((l) => `
        <section class="suivi-chantier${l.reste ? '' : ' est-boucle'}">
          <h4>${echapper(l.libelle)}
            <span class="suivi-compte">${l.reste ? `${l.reste} à faire` : 'bouclé'}</span></h4>
          ${l.aide ? `<p class="discret">${echapper(l.aide)}</p>` : ''}
          <ul class="suivi-lignes">${l.lignes
            .slice()
            .sort((a, b) => Number(!!a.fait_le) - Number(!!b.fait_le)
              || a.partenaire.nom.localeCompare(b.partenaire.nom, 'fr'))
            .map((e) => ligneEngagement(e, true)).join('')}</ul>
        </section>`).join('')}</div>`).join('')}
  </section>`;
}

// ── LES PARTENAIRES ───────────────────────────────────────────────────────────

function pastilleEtat(statut) {
  const [, nom, couleur] = etatDe(statut) ?? [null, statut, '#8d93a3'];
  return `<span class="suivi-etat" style="--etat-couleur:${couleur}">${echapper(nom)}</span>`;
}

function carteP(p, ouvert, aConfirmer) {
  const offre = offreDe(p.offre);
  const a = reste(p);
  return `<li class="suivi-partenaire" id="partenaire-${p.id}">
    <button type="button" class="suivi-tete" data-ouvrir-partenaire="${p.id}"
      aria-expanded="${ouvert ? 'true' : 'false'}">
      <span class="suivi-nom">${echapper(p.nom)}</span>
      <span class="suivi-offre">${echapper(offre?.nom ?? 'Offre à préciser')}</span>
      <span class="suivi-montant chiffre">${echapper(euros(p.montant))}</span>
      ${pastilleEtat(p.statut)}
      <span class="suivi-avancee">${a ? `${a} à faire` : `${faits(p)} tenus`}</span>
    </button>
    ${ouvert ? detailP(p, offre, aConfirmer) : ''}
  </li>`;
}

function detailP(p, offre, aConfirmer) {
  const eng = (p.engagements ?? []).slice().sort((a, b) =>
    Number(!!a.fait_le) - Number(!!b.fait_le) || a.libelle.localeCompare(b.libelle, 'fr'));
  // L'ÉCART AVEC LE TARIF SE DIT, parce que c'est ce qu'on oublie : un montant
  // convenu est souvent négocié, au-dessus ou en dessous du tarif du dossier.
  // Sans un mot, on croit chaque fois à une erreur de saisie.
  const ecart = offre?.montant != null && p.montant != null
    && Number(p.montant) !== offre.montant
    ? `Tarif de l’offre : ${euros(offre.montant)}.` : null;
  return `<div class="suivi-detail-partenaire">
    <dl class="suivi-faits">
      ${p.commune ? `<div><dt>Commune</dt><dd>${echapper(p.commune)}</dd></div>` : ''}
      ${p.referents ? `<div><dt>Référent</dt><dd>${echapper(p.referents)}</dd></div>` : ''}
      ${p.cerfa ? `<div><dt>CERFA</dt><dd>${echapper(p.cerfa)}</dd></div>` : ''}
      ${ecart ? `<div><dt>Montant</dt><dd>${echapper(ecart)}</dd></div>` : ''}
    </dl>
    ${p.discret ? `<p class="suivi-discret">Ne souhaite pas être mentionné : pas de publication, pas de vignette, pas de panneau.</p>` : ''}
    ${p.notes ? `<p class="suivi-notes">${echapper(p.notes)}</p>` : ''}
    ${eng.length
      ? `<ul class="suivi-lignes">${eng.map((e) => ligneEngagement(e, false, aConfirmer)).join('')}</ul>`
      : '<p class="vide">Rien n’est dû : un mécénat est un don sans contrepartie. Ajoute une ligne si quelque chose a été promis.</p>'}
    <form class="suivi-ajouter" data-ajouter-engagement="${p.id}">
      <input type="text" name="libelle" placeholder="Ajouter ce qu’on lui a promis en plus" required
        aria-label="Ce qu’on lui a promis en plus">
      <button type="submit">Ajouter</button>
    </form>
  </div>`;
}

function partenaires(liste, ouvert, filtre, aConfirmer) {
  const vus = filtre ? liste.filter((p) => p.statut === filtre) : liste;
  // Ce qui reste à faire d'abord : la page sert le suivi, pas l'annuaire.
  const ranges = vus.slice().sort((a, b) => reste(b) - reste(a)
    || a.nom.localeCompare(b.nom, 'fr'));
  const onglet = (id, nom, n) => `<a href="${ADRESSE}${id ? `/etat-${id}` : ''}"
    class="${filtre === id ? 'actif' : ''}" ${filtre === id ? 'aria-current="page"' : ''}
    >${echapper(nom)} <span class="suivi-compte">${n}</span></a>`;
  return `<section class="bloc">
    <h2>Les partenaires</h2>
    <nav class="suivi-filtres" aria-label="Filtrer les partenaires">
      ${onglet(null, 'Tous', liste.length)}
      ${ETATS_PARTENAIRE.map(([id, nom]) =>
        onglet(id, nom, liste.filter((p) => p.statut === id).length)).join('')}
    </nav>
    ${ranges.length
      ? `<ul class="suivi-partenaires">${ranges.map((p) => carteP(p, p.id === ouvert, aConfirmer)).join('')}</ul>`
      : '<p class="vide">Aucun partenaire dans cet état.</p>'}
  </section>`;
}

// ── LE CATALOGUE ──────────────────────────────────────────────────────────────

// LE DOSSIER, EN PIED ET REPLIÉ : on vient ici pour suivre, pas pour relire
// l'offre. Mais il faut pouvoir la relire — c'est ce qui permet de vérifier
// qu'un engagement négocié est bien un ajout et non un oubli.
function catalogue() {
  return `<details class="suivi-repli">
    <summary>Ce que contient chaque offre</summary>
    <p class="discret">Dossier partenaires 2026-2027. Les conditions sont parfois ajustées : c’est la fiche du partenaire qui fait foi.</p>
    <div class="suivi-offres">${OFFRES_FCH.map((o) => `
      <section class="suivi-offre-carte">
        <h4>${echapper(o.nom)} <span class="chiffre">${echapper(o.montant ? euros(o.montant) : 'libre')}</span></h4>
        ${o.apresImpot ? `<p class="discret">Environ ${echapper(euros(o.apresImpot))} après réduction d’impôt.</p>` : ''}
        ${o.detail ? `<p class="discret">${echapper(o.detail)}</p>` : ''}
        ${o.engagements.length
          ? `<ul>${engagementsDeLOffre(o.id).map((e) => `<li>${echapper(e.libelle)}${
              e.detail ? ` <span class="suivi-detail">${echapper(e.detail)}</span>` : ''}</li>`).join('')}</ul>`
          : ''}
      </section>`).join('')}</div>
  </details>`;
}

// ── L'ASSEMBLAGE ──────────────────────────────────────────────────────────────

export function construireSuiviPartenaires(liste, selection, aConfirmer = null) {
  const ouvert = typeof selection === 'string' && !selection.startsWith('etat-')
    ? selection : null;
  const filtre = typeof selection === 'string' && selection.startsWith('etat-')
    ? selection.slice(5) : null;
  if (!liste.length) {
    return `<p class="vide">Les partenaires du club s’ajouteront ici.</p>`;
  }
  return `<div class="suivi-partenaires-page">
    ${bilan(liste)}
    ${chantiers(liste)}
    ${partenaires(liste, ouvert, etatDe(filtre) ? filtre : null, aConfirmer)}
    ${catalogue()}
  </div>`;
}

// Les engagements que l'offre choisie fait naître — c'est `engagementsDeLOffre`,
// réexporté pour que l'écran qui crée un partenaire n'ait pas à connaître le
// catalogue.
export { engagementsDeLOffre, OFFRES_FCH };
