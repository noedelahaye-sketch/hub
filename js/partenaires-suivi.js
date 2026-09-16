// LE SUIVI DES ENGAGEMENTS PARTENAIRES (16 septembre 2026, demande de Noé) :
// « pour un partenaire qui a pris un pack Esprit Collectif, avoir la liste des
// choses que l'on doit faire de notre côté (vignette album, panneau…) pour
// assurer un bon suivi ».
//
// C'EST UN HALL, PAS UNE PAGE (16 septembre 2026, demande de Noé : « il faut que
// ce soit mieux organisé, pas tout sur la même page, donc des tuiles portes »).
// Le tableau de bord reste en tête — c'est ce qu'on vient voir sans y penser —
// et trois portes mènent chacune à une question :
//
//   `/liste`        « qui sont nos partenaires ? »   puis `/<id>` pour un seul
//   `/engagements`  « qu'est-ce qu'il me reste à faire ? »
//   `/offres`       « qu'est-ce qu'on promet, au juste ? »
//
// UNE PORTE MONTRE CE QU'IL Y A DERRIÈRE, c'est la règle du hall de `#perso` :
// trois rectangles nommés comme trois lignes de menu seraient un menu dessiné.
// Chacune doit dire quelque chose qu'on IGNORE avant de l'ouvrir — qui n'a pas
// encore viré, quel chantier pèse le plus, quel pack personne n'a pris.
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

function pageEngagements(partenaires) {
  const lots = parChantier(partenaires);
  const parMoment = MOMENTS_FCH
    .map(([id, nom]) => [nom, lots.filter((l) => l.quand === id)])
    .filter(([, l]) => l.length);
  // `fch-sans-tuile`, comme la galerie et le catalogue : la section ne porte que
  // des cartes de chantier, et une surface de la même couleur sous elles les y
  // noyait (demande de Noé, 16 septembre 2026).
  return `${retour()}
  <section class="bloc fch-sans-tuile">
    <h2>Nos engagements</h2>
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

// L'ÉTAT SE CHANGE SUR PLACE (16 septembre 2026, demande de Noé). Un virement
// arrive, on le note d'un doigt : ouvrir la fiche pour un seul mot donnerait à
// ce geste le coût d'une correction. C'est le raisonnement déjà tenu pour l'état
// d'un PROJET, et c'est donc son dessin — le menu dessiné du hub, ouvert par
// `data-ouvrir-choix`, que `brancherCapture` écoute déjà sur ce site.
//
// LA PASTILLE GARDE SON APLAT, elle ne devient pas le mot gris d'un projet :
// il n'y a ici que DEUX états, et c'est la couleur qui les sépare d'un coup
// d'œil dans une galerie de vingt tuiles. Elle change de nature, pas d'allure —
// un span qui disait, un bouton qui règle.
function pastilleEtat(p) {
  const courant = p.statut;
  const nomDe = (cle) => etatDe(cle)?.[1] ?? cle ?? 'État à préciser';
  const couleurDe = (cle) => etatDe(cle)?.[2] ?? '#8d93a3';
  return `<span class="choix-champ suivi-etat-champ" data-choix-champ="etat-${echapper(p.id)}">
    <button type="button" class="suivi-etat" data-ouvrir-choix
      style="--etat-couleur:${couleurDe(courant)}"
      aria-expanded="false" aria-haspopup="listbox"
      aria-label="${echapper('État : ' + nomDe(courant) + ' — changer')}"
      >${echapper(nomDe(courant))}</button>
    <div class="choix-panneau" hidden>
      <ul class="choix-capture">
        ${ETATS_PARTENAIRE.map(([cle, nom, couleur]) => `
          <li><button type="button" data-etat-partenaire="${echapper(cle)}"
            data-partenaire="${echapper(p.id)}"
            class="${cle === courant ? 'actif' : ''}"
            aria-pressed="${cle === courant}"><span class="cap-etat-point"
              style="--etat:${couleur}" aria-hidden="true"></span>${echapper(nom)}</button></li>`).join('')}
      </ul>
    </div>
  </span>`;
}

// LA CARTE EST UN LIEN, plus un dépliage (demande de Noé) : la fiche a sa page.
// C'est la règle des deux rangs du hub — la liste ne dit que ce qui se COMPARE,
// la page dit tout.
// LE LOGO SUR UNE PLAQUE BLANCHE : ceux du club sont dessinés pour du papier,
// fond clair et encre sombre. Posés à même le bleu du site, la moitié
// disparaîtrait. C'est le même choix que les écussons du vivier de Yuno.
function logo(p) {
  return p.logo
    ? `<span class="suivi-logo"><img src="${echapper(p.logo)}" alt="" loading="lazy"></span>`
    : '';
}

// UNE TUILE PAR ENTREPRISE, EN GALERIE (demande de Noé). Une liste de lignes se
// parcourt mot à mot ; une galerie de logos se balaie du regard — c'est
// l'argument de l'étagère de la bibliothèque, et il vaut ici pour la même
// raison : on reconnaît un partenaire à son logo bien avant de lire son nom.
//
// SANS LOGO, LA TUILE GARDE SA PLACE, en plaque pointillée avec le nom dedans :
// le pointillé est déjà le signe du hub pour « déclaré, pas encore rempli », et
// une galerie à trous se lirait comme une liste incomplète.
// « 0 tenus » n'est pas une réponse pour un mécène qui ne doit rien : c'est un
// compte, là où il faudrait une phrase. Un don est sans contrepartie, et
// l'écran doit le dire.
function motDeLAvancee(p) {
  const total = (p.engagements ?? []).length;
  if (!total) return 'Rien n’est dû';
  const a = reste(p);
  return a ? `${a} à faire` : 'Tout est tenu';
}

// PLUS UN LIEN QUI ENVELOPPE, depuis que la pastille d'état se règle sur la
// tuile : un bouton dans un lien n'est ni valide ni cliquable. C'est donc un
// écouteur qui se retire dès que le clic a touché quelque chose qui fait déjà
// quelque chose — la mécanique de la tuile « Aujourd'hui » de l'accueil.
// ET LE NOM EST UN LIEN : un écouteur ne se tabule pas, et le clavier doit
// atteindre ce que la souris atteint.
function carteP(p) {
  const offre = offreDe(p.offre);
  return `<li class="suivi-partenaire">
    <div class="suivi-tuile" data-tuile-partenaire="${echapper(p.id)}">
      ${p.logo
        ? `<span class="suivi-logo"><img src="${echapper(p.logo)}" alt="" loading="lazy"></span>`
        : `<span class="suivi-logo est-vide">${echapper(p.nom)}</span>`}
      <span class="suivi-nom"><a href="${ADRESSE}/${p.id}">${echapper(p.nom)}</a></span>
      <span class="suivi-offre">${echapper(offre?.nom ?? 'Offre à préciser')}</span>
      <span class="suivi-bas">
        <span class="suivi-montant chiffre">${echapper(euros(p.montant))}</span>
        ${pastilleEtat(p)}
      </span>
      <span class="suivi-avancee">${motDeLAvancee(p)}</span>
    </div>
  </li>`;
}

function pageFiche(p, aConfirmer) {
  const offre = offreDe(p.offre);
  return `${retour()}
    <header class="suivi-fiche-tete">
      ${logo(p)}
      <div class="suivi-fiche-texte">
        <h2>${echapper(p.nom)}</h2>
        <p>${echapper(offre?.nom ?? 'Offre à préciser')} · <span class="chiffre">${echapper(euros(p.montant))}</span></p>
        ${pastilleEtat(p)}
      </div>
    </header>
    <section class="bloc">
      <h3>Ce qu’on lui doit</h3>
      ${detailP(p, offre, aConfirmer)}
    </section>`;
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

const retour = () => `<a class="lien-discret" href="${ADRESSE}">← Les partenaires</a>`;

function pageListe(liste, filtre) {
  const vus = filtre ? liste.filter((p) => p.statut === filtre) : liste;
  // Ce qui reste à faire d'abord : la page sert le suivi, pas l'annuaire.
  const ranges = vus.slice().sort((a, b) => reste(b) - reste(a)
    || a.nom.localeCompare(b.nom, 'fr'));
  const onglet = (id, nom, n) => `<a href="${ADRESSE}/liste${id ? `-${id}` : ''}"
    class="${filtre === id ? 'actif' : ''}" ${filtre === id ? 'aria-current="page"' : ''}
    >${echapper(nom)} <span class="suivi-compte">${n}</span></a>`;
  // `fch-sans-tuile` : la galerie ne porte QUE des tuiles, et les poser sur une
  // surface de la même couleur les y noyait — vingt entreprises se lisaient
  // comme un seul bloc (défaut vu par Noé, 16 septembre 2026).
  return `${retour()}
  <section class="bloc fch-sans-tuile">
    <h2>Tous les partenaires</h2>
    <nav class="suivi-filtres" aria-label="Filtrer les partenaires">
      ${onglet(null, 'Tous', liste.length)}
      ${ETATS_PARTENAIRE.map(([id, nom]) =>
        onglet(id, nom, liste.filter((p) => p.statut === id).length)).join('')}
    </nav>
    ${ranges.length
      ? `<ul class="suivi-partenaires">${ranges.map(carteP).join('')}</ul>`
      : '<p class="vide">Aucun partenaire dans cet état.</p>'}
  </section>`;
}

// ── LE CATALOGUE ──────────────────────────────────────────────────────────────

// LE DOSSIER A SA PAGE : on ne vient pas ici pour suivre, mais pour vérifier ce
// qu'on a promis — et c'est ce qui permet de savoir qu'un engagement négocié est
// bien un ajout et non un oubli. Chaque offre dit COMBIEN de partenaires l'ont
// prise : c'est ce qu'on ne sait pas en lisant le dossier.
function pageOffres(liste) {
  const pris = (id) => liste.filter((p) => p.offre === id).length;
  // `fch-sans-tuile`, comme la galerie des partenaires : une carte de pack et la
  // surface qui la portait ont la même couleur, et les sept packs se lisaient
  // comme un seul bloc (demande de Noé, 16 septembre 2026).
  return `${retour()}
  <section class="bloc fch-sans-tuile">
    <h2>Nos offres</h2>
    <p class="suivi-service">Dossier partenaires 2026-2027. Les conditions sont parfois ajustées : c’est la fiche du partenaire qui fait foi.</p>
    <div class="suivi-offres">${OFFRES_FCH.map((o) => `
      <section class="suivi-offre-carte">
        <h4>${echapper(o.nom)} <span class="chiffre">${echapper(o.montant ? euros(o.montant) : 'libre')}</span></h4>
        ${o.apresImpot ? `<p class="discret">Environ ${echapper(euros(o.apresImpot))} après réduction d’impôt.</p>` : ''}
        ${o.detail ? `<p class="discret">${echapper(o.detail)}</p>` : ''}
        ${o.engagements.length
          ? `<ul>${engagementsDeLOffre(o.id).map((e) => `<li>${echapper(e.libelle)}${
              e.detail ? ` <span class="suivi-detail">${echapper(e.detail)}</span>` : ''}</li>`).join('')}</ul>`
          : ''}
        <p class="suivi-pris">${pris(o.id)
          ? `${pris(o.id)} partenaire${pris(o.id) > 1 ? 's' : ''} l’${pris(o.id) > 1 ? 'ont' : 'a'} prise`
          : 'Personne ne l’a prise cette saison'}</p>
      </section>`).join('')}</div>
  </section>`;
}

// ── LE HALL ───────────────────────────────────────────────────────────────────

// CHAQUE PORTE DIT CE QU'ON IGNORE AVANT DE L'OUVRIR, c'est l'exigence du hall
// de `#perso` : qui n'a pas encore viré, quel chantier pèse le plus, quel pack
// personne n'a pris. Trois rectangles nommés seraient un menu dessiné.
// TROIS ÉTAGES, ET L'ILLUSTRATION EST LE PREMIER (16 septembre 2026, demande de
// Noé en deux temps : d'abord « inverse l'illustration et le titre », puis « par
// contre le titre de la tuile est au-dessus des autres textes »). C'est l'ordre
// d'une tuile de livre : on voit, on lit son nom, on lit le reste.
//
// L'ILLUSTRATION EST DÉCLARÉE À PART et non glissée en tête de l'aperçu : sans
// ce troisième emplacement, le nom ne pourrait pas se poser ENTRE les deux.
//
// ET L'ORDRE DU DOM NE BOUGE PAS, ce n'est pas un détail : le nom accessible
// d'un lien est la suite de son contenu dans l'ordre du DOM. L'illustration
// posée là, la porte des partenaires s'annoncerait par ses cinq logos avant de
// dire ce qu'elle ouvre. Rien ne se tabule à l'intérieur d'un lien, donc l'écart
// entre l'ordre lu et l'ordre vu ne coûte rien.
export function porte(adresse, titre, compte, apercu, illustration = '') {
  return `<a class="fch-hall-porte" href="${adresse}">
    <span class="fch-hall-tete">
      <span class="fch-hall-nom">${echapper(titre)}</span>
      <span class="fch-hall-compte">${echapper(compte)}</span>
    </span>
    ${illustration ? `<span class="fch-hall-illustration">${illustration}</span>` : ''}
    <span class="fch-hall-apercu">${apercu}</span>
  </a>`;
}

export const mots = (liste, n) => liste.slice(0, n).map((t) => `<span>${echapper(t)}</span>`).join('')
  + (liste.length > n ? `<span class="fch-hall-plus">+${liste.length - n}</span>` : '');

// LA PORTE DES PARTENAIRES SE DESSINE UNE FOIS, et deux halls s'en servent : le
// leur, et celui du club. Elle ne prend l'adresse et le nom en paramètre que
// parce que ce ne sont pas les mêmes des deux côtés — d'un hall on descend vers
// la liste, du club on entre dans le hall. Ce qu'elle MONTRE, lui, ne change
// pas : les logos qu'on a, et qui n'a pas encore viré.
export function porteDesPartenaires(liste, adresse = `${ADRESSE}/liste`, titre = 'Tous les partenaires') {
  const attente = liste.filter((p) => p.statut === 'virement_attendu');
  const avecLogo = liste.filter((p) => p.logo);
  return porte(adresse, titre, `${liste.length}`,
    attente.length
      ? `<span class="fch-hall-quoi">${echapper(attente.map((p) => p.nom).slice(0, 3).join(', '))}${
          attente.length > 3 ? ` et ${attente.length - 3} autre${attente.length > 4 ? 's' : ''}` : ''
        } n’${attente.length > 1 ? 'ont' : 'a'} pas encore viré</span>`
      : '<span class="fch-hall-quoi">Tout est encaissé.</span>',
    avecLogo.length ? `<span class="fch-hall-logos">${avecLogo.slice(0, 5).map(logo).join('')}</span>` : '');
}

function hall(liste) {
  const lots = parChantier(liste).filter((l) => l.reste);
  const prises = OFFRES_FCH.filter((o) => liste.some((p) => p.offre === o.id));
  const jamais = OFFRES_FCH.filter((o) => !liste.some((p) => p.offre === o.id));
  return `<div class="fch-hall">
    ${porteDesPartenaires(liste)}
    ${porte(`${ADRESSE}/engagements`, 'Nos engagements',
      `${liste.flatMap((p) => p.engagements ?? []).filter((e) => !e.fait_le).length} à faire`,
      lots.length
        ? `<ul class="fch-hall-lots">${lots.slice(0, 3).map((l) => `<li>
            <span>${echapper(l.libelle)}</span>
            <span class="fch-hall-compte">${l.reste}</span></li>`).join('')}</ul>`
        : '<span class="fch-hall-quoi">Tout est tenu.</span>')}
    ${porte(`${ADRESSE}/offres`, 'Nos offres', `${OFFRES_FCH.length}`,
      `<span class="fch-hall-mots">${mots(prises.map((o) => o.nom), 4)}</span>
       <span class="fch-hall-quoi">${jamais.length
         ? `${jamais.length} offre${jamais.length > 1 ? 's' : ''} que personne n’a prise${jamais.length > 1 ? 's' : ''}`
         : 'Toutes ont trouvé preneur.'}</span>`)}
  </div>`;
}

// ── L'AIGUILLAGE ──────────────────────────────────────────────────────────────

export function construireSuiviPartenaires(liste, selection, aConfirmer = null) {
  if (!liste.length) {
    return `<p class="vide">Les partenaires du club s’ajouteront ici.</p>`;
  }
  const vue = typeof selection === 'string' ? selection : null;
  if (vue === 'engagements') return pageEngagements(liste);
  if (vue === 'offres') return pageOffres(liste);
  if (vue === 'liste' || vue?.startsWith('liste-')) {
    const filtre = vue.startsWith('liste-') ? vue.slice(6) : null;
    return pageListe(liste, etatDe(filtre) ? filtre : null);
  }
  const p = liste.find((candidat) => candidat.id === vue);
  if (p) return pageFiche(p, aConfirmer);
  // LE TABLEAU DE BORD RESTE EN TÊTE (demande de Noé) : c'est ce qu'on vient
  // voir sans y penser, et il ne coûte rien — les données sont déjà là.
  return `<div class="suivi-partenaires-page">
    ${bilan(liste)}
    ${hall(liste)}
  </div>`;
}

// LE NOM DE LA PAGE OUVERTE, pour le grand titre du site : une page, un nom.
export function titreDuSuivi(liste, selection) {
  if (selection === 'engagements') return 'Nos engagements';
  if (selection === 'offres') return 'Nos offres';
  if (selection === 'liste' || selection?.startsWith?.('liste-')) return 'Tous les partenaires';
  return liste.find((p) => p.id === selection)?.nom ?? null;
}

// Les engagements que l'offre choisie fait naître — c'est `engagementsDeLOffre`,
// réexporté pour que l'écran qui crée un partenaire n'ait pas à connaître le
// catalogue.
export { engagementsDeLOffre, OFFRES_FCH };
