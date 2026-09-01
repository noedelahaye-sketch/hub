// LA PAGE D'UN OBJECTIF — `#objectif/<id>` (2 septembre 2026, demande de Noé).
//
// « On va faire pareil pour les objectifs : une page indépendante pour chacun
//   avec tous les détails, un calendrier qui permet de poser les jalons. Et une
//   vue (et un lien vers la page détail) des projets qui lui sont rattachés. »
//
// C'EST LA PAGE D'UN PROJET, UN ÉTAGE PLUS HAUT, et volontairement : mêmes trois
// colonnes, même geste, mêmes mots. Un cap se découpe en jalons comme un projet
// se découpe en étapes ; ce qui change, c'est ce que porte la colonne de droite
// — un projet y montre ses TÂCHES, un cap y montre ses PROJETS, parce que c'est
// l'étage en dessous de lui. Réapprendre un geste en montant d'un étage aurait
// été le pire des deux mondes.
//
// CE QU'ELLE REMPLACE : le dépliage sur place dans la galerie de `#objectifs`.
// La règle des deux rangs tranche comme pour les projets — la galerie est à deux
// gestes et ne dit que ce qui se COMPARE, la page est à trois et dit tout.
//
// UN JALON N'A EU BESOIN DE RIEN : il porte une `echeance` depuis le premier
// jour, facultative, et le calendrier sait déjà le lire, le déplacer, le
// corriger et le supprimer. C'est la seule différence avec l'étape d'un projet,
// qui a fallu doter d'une colonne — et elle dit quelque chose de vrai : un jalon
// a toujours été un point du calendrier, une étape un morceau de travail.

import * as api from './api.js';
import { avanceeDuProjet } from './orientation.js';
// LE DESSIN VIENT DE LA GALERIE, il ne se recopie pas : les marches d'un cap et
// la jauge d'un projet doivent dire la même chose sur tous les écrans.
import {
  ETATS_PROJET_LUS,
  FORMULAIRES,
  jaugeDuProjet,
  marches,
  motDeLAvancee,
} from './objectifs.js';
import {
  construireFormulaire,
  construireMenuDiscret,
  demanderLaDuree,
} from './gabarits.js';
import { modifierAussitot, retirerAussitot } from './ecriture.js';
import {
  NOMS_ESPACES,
  depuisDateISO,
  dureeLisible,
  echapper,
  echeanceLisible,
} from './format.js';
import { argentDeYuno, enEuros } from './photo.js';
import {
  appliquerAuCalendrier,
  assemblerCalendrier,
  brancherCapture,
  brancherClavier,
  brancherDeplacement,
  brancherEtatPublication,
  brancherSelection,
  champsApresDeplacement,
  construireBarrePeriode,
  construireGrille,
  corrigerDepuisLeCalendrier,
  deplacerAncre,
  effacerDepuisLeCalendrier,
  fenetreCreation,
  fenetreDetail,
  jourSousLePoint,
  poserAuCalendrier,
  prendreEnMain,
  suivreLaMain,
  toutesLesNatures,
  viserLeJour,
} from './calendrier-commun.js';

const SIGNE = {
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  retour: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6 6 6"/></svg>`,
};

const PLUS_ROND = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14"/></svg>`;

// L'objectif dont les prestations et le matériel disent la mesure. Reconnu par
// son titre : c'est le seul du hub qui se mesure en euros, et lui donner une
// colonne en base pour ça serait payer cher une exception unique.
const OBJECTIF_MATERIEL = 'Rembourser mon matériel';

// --- Les mots -----------------------------------------------------------------

const jourLisible = (iso) => (iso ? echeanceLisible(depuisDateISO(iso)) : '');

const pluriel = (nombre, singulier, plurielMot = `${singulier}s`) =>
  `${nombre} ${nombre > 1 ? plurielMot : singulier}`;

function chargeDuProjet(projet) {
  if (projet.charge_hebdo) return `${dureeLisible(projet.charge_hebdo)} par semaine`;
  if (projet.charge_minutes) return `${dureeLisible(projet.charge_minutes)} en tout`;
  return '';
}

function enMinutes(valeur) {
  const heures = Number(valeur);
  return Number.isFinite(heures) && heures > 0 ? Math.round(heures * 60) : null;
}

// --- L'état -------------------------------------------------------------------

const etat = {
  // `#objectif/<id>` : le second niveau du routeur EST l'objectif — il n'y a
  // rien d'autre à nommer sur cette page.
  id: null,
  objectif: null,
  projets: [], // tous, pour la pastille de rattachement de la tuile de capture
  taches: [],
  evenements: [],
  publications: [],
  commandes: [],
  materiel: [],
  elements: [],

  vue: 'mois',
  ancre: new Date(),

  // Le jalon ou la tâche pris en main AU DOIGT — `jalon:<id>`, `tache:<id>`.
  choisie: null,

  menu: null,
  confirme: null,
  edition: null,

  creation: null,
  detail: null,
  editionDetail: false,

  message: null,
  echec: false,
};

function menu(forme, id, options = {}) {
  return construireMenuDiscret(forme, id, {
    ...options,
    ouvert: etat.menu === `${forme}:${id}`,
    confirmation: etat.confirme === `${forme}:${id}`,
    attendrait: etat.confirme === `atteindre:${id}`,
  });
}

// --- Ce qui sert ce cap --------------------------------------------------------

const projetsDuCap = () =>
  etat.projets.filter((projet) =>
    (projet.cibles ?? []).some((cible) => cible.objectif_id === etat.id),
  );

// Les tâches rattachées au cap LUI-MÊME, sans passer par un projet. C'est de
// l'intendance, et c'est légitime : forcer un projet pour une seule action
// coûterait plus cher que le lien ne rapporte.
const tachesDuCap = () =>
  etat.taches.filter((tache) => tache.objectif_id === etat.id && !tache.projet_id);

// --- La tête : tous les détails du cap -----------------------------------------

function enTete(objectif) {
  const jalons = objectif.jalons ?? [];
  const atteints = jalons.filter((jalon) => jalon.atteint).length;
  const projets = projetsDuCap();
  const taches =
    tachesDuCap().length +
    projets.reduce(
      (total, projet) =>
        total + etat.taches.filter((tache) => tache.projet_id === projet.id).length,
      0,
    );

  const service = [
    objectif.echeance ? jourLisible(objectif.echeance) : '',
    projets.length ? pluriel(projets.length, 'projet') : '',
    taches ? pluriel(taches, 'tâche') : '',
  ].filter(Boolean);

  return `
    <p class="projet-page-retour">
      <a href="#objectifs/caps">${SIGNE.retour}<span>Tous les objectifs</span></a>
    </p>

    <header class="projet-page-tete" data-espace="${echapper(objectif.espace)}">
      <span class="cap-tuile-tete">
        <span class="cap-tuile-espace"><span class="pastille"></span>${echapper(
          NOMS_ESPACES[objectif.espace] ?? objectif.espace,
        )}</span>
      </span>
      <h1>${echapper(objectif.titre)}</h1>
      <p class="discret projet-page-service">${echapper(service.join(' · '))}</p>
      ${menu('objectif', objectif.id, { atteindre: true, visible: true })}

      <!-- UN CAP NE SE LIT PAS EN POURCENTAGE, il se lit en marches franchies —
           c'est la règle du hub depuis le premier jour, et le dessin vient de la
           galerie pour que les deux écrans comptent pareil. -->
      <div class="projet-page-avancee">
        ${marches(jalons)}
        ${
          jalons.length
            ? `<span class="projet-page-avancee-mot">${atteints} sur ${echapper(
                pluriel(jalons.length, 'jalon'),
              )}</span>`
            : ''
        }
      </div>

      ${objectif.pourquoi ? `<p class="cap-pourquoi">${echapper(objectif.pourquoi)}</p>` : ''}
      ${
        objectif.cible
          ? `<p class="cap-cible"><span>À quoi je saurai</span>${echapper(objectif.cible)}</p>`
          : ''
      }
    </header>`;
}

// --- Ce qui va au calendrier ---------------------------------------------------
//
// CE QU'IL MONTRE : le cap lui-même à son échéance, ses jalons, et le TRAVAIL
// qui le sert — les tâches, événements et parutions de ses projets, plus les
// tâches accrochées au cap sans projet. C'est la réponse à « quand ce cap
// avance-t-il », et elle n'existait nulle part.
//
// Les jalons se posent À LA MAIN et non par `assemblerCalendrier` : celui-ci
// écarte les jalons ATTEINTS — juste au calendrier plein écran, où ce qui est
// fait n'a plus à occuper le regard, faux ici, où l'on vient voir le chemin
// entier. C'est le même choix que les étapes d'un projet.
function assembler() {
  const objectif = etat.objectif;
  if (!objectif) {
    etat.elements = [];
    return;
  }

  const siens = new Set(projetsDuCap().map((projet) => projet.id));
  const aLui = (ligne) =>
    siens.has(ligne.projet_id) || (ligne.objectif_id === objectif.id && !ligne.projet_id);

  etat.elements = assemblerCalendrier({
    evenements: etat.evenements.filter((ligne) => siens.has(ligne.projet_id)),
    taches: etat.taches.filter((tache) => tache.echeance && aLui(tache)),
    publications: etat.publications.filter(
      (pub) => pub.date_prevue && siens.has(pub.projet_id),
    ),
  });

  if (objectif.echeance) {
    etat.elements.push({
      id: objectif.id,
      type: 'objectif',
      source: objectif,
      date: depuisDateISO(objectif.echeance),
      espace: objectif.espace,
      titre: objectif.titre,
      detail: objectif.cible,
    });
  }

  for (const jalon of objectif.jalons ?? []) {
    if (!jalon.echeance) continue;
    etat.elements.push({
      id: jalon.id,
      type: 'jalon',
      source: jalon,
      date: depuisDateISO(jalon.echeance),
      // Atteint, il se barre comme une tâche faite : ce qui a eu lieu garde sa
      // place dans le mois.
      faite: Boolean(jalon.atteint),
      espace: objectif.espace,
      titre: jalon.titre,
    });
  }

  etat.elements.sort((a, b) => a.date - b.date);
}

// --- La colonne de gauche : ses jalons -----------------------------------------
//
// La MÊME frise que les étapes d'un projet, et pour cause : c'est elle qui est
// née la première. Le point qu'on presse pour l'atteindre, le menu qui ordonne,
// « Poser un jalon » en pied.
//
// CE QUI EST ATTEINT NE SE GLISSE PAS : sa ligne dit encore son échéance, mais
// la déplacer réécrirait une date que le cap a déjà dépassée. Même règle que
// pour une étape franchie.
function friseJalons(objectif) {
  const jalons = objectif.jalons ?? [];
  const prochain = jalons.find((jalon) => !jalon.atteint);

  if (!jalons.length) {
    return `<p class="cap-vide">Aucun jalon. Le premier dira par quoi ce cap
      commence — et c'est lui qui le mesurera.</p>`;
  }

  const lignes = jalons
    .map((jalon, rang) => {
      const cle = `jalon:${jalon.id}`;
      const prenable = !jalon.atteint;
      const choisi = etat.choisie === cle;

      return `
      <li class="cap-jalon${jalon.atteint ? ' atteint' : ''}${
        jalon === prochain ? ' prochain' : ''
      }${choisi ? ' colonne-choisie' : ''}"
        ${prenable ? `data-poser="${echapper(cle)}"` : ''}>
        <button type="button" class="cap-jalon-point" data-jalon="${echapper(jalon.id)}"
          aria-pressed="${Boolean(jalon.atteint)}"
          aria-label="${
            jalon.atteint ? 'Revenir sur ce jalon' : 'Marquer ce jalon atteint'
          }"></button>
        <span class="cap-jalon-corps">
          ${
            prenable
              ? boutonDePrise(cle, jalon.titre, 'cap-jalon-titre', choisi)
              : `<span class="cap-jalon-titre">${echapper(jalon.titre)}</span>`
          }
          ${
            jalon.echeance
              ? `<span class="cap-tache-service"><span
                  class="cap-tache-date">${echapper(jourLisible(jalon.echeance))}</span></span>`
              : ''
          }
        </span>
        ${menu('jalon', jalon.id, {
          deplacer: { haut: rang > 0, bas: rang < jalons.length - 1 },
        })}
      </li>`;
    })
    .join('');

  return `<ol class="cap-frise">${lignes}</ol>`;
}

// Le titre EST la poignée : le glissement est un geste de souris, et sans ce
// bouton le clavier n'aurait aucun moyen de prendre une ligne en main.
function boutonDePrise(cle, titre, classe, choisie) {
  return `<button type="button" class="${classe} colonne-prise"
    data-choisir="${echapper(cle)}" aria-pressed="${choisie}"
    title="Glisse-le sur un jour, ou touche-le puis touche le jour"
    aria-label="${echapper(titre)} — glisse-le sur un jour, ou touche-le puis touche le jour"
    >${echapper(titre)}</button>`;
}

// --- LE RAIL DES PROJETS, SOUS LE CALENDRIER (2 septembre 2026) ---------------
//
// Demande de Noé, en deux temps : *« les projets ne sont pas à "poser", donc
// mets-les côte à côte sur une même ligne, dans une forme similaire à comment
// sont affichés les projets dans la page d'accueil ; ça peut en afficher plus
// qu'un, c'est juste que s'il y a trop de projets on voit la suite en slide sur
// le côté »* — puis : *« finalement en dessous du calendrier »*.
//
// IL A RAISON SUR LE FOND, ET C'EST CE QUI COMMANDE LA PLACE. Les deux colonnes
// qui encadrent un calendrier sont une RÉSERVE : ce qu'elles portent se glisse
// sur un jour. Un projet ne se pose pas — il n'a pas d'échéance qu'on déplace du
// doigt, il a une page. Le mettre là promettait un geste qui n'existe pas.
//
// D'où un RAIL, et le rail est celui de l'accueil : même tuile, même
// glissement, même mask sur les bords. Ce qui change, c'est sa largeur — sur
// l'accueil il vit dans une colonne étroite et montre une tuile à la fois ; ici
// il a toute la page, et en montre autant qu'il y a de place.
//
// PAS DE POINTS SOUS LE RAIL, à la différence de l'accueil : là-bas une seule
// tuile se voit, et sans compteur on ne sait pas où l'on est dedans. Ici la
// tuile suivante dépasse — c'est ce qui dit qu'il y en a d'autres, mieux qu'une
// rangée de points, et c'est déjà l'argument de la colonne « À poser » de la
// page d'un projet.
//
// TOUTE LA TUILE MÈNE À SA PAGE (« et un lien vers la page détail ») : c'est là
// que vivent ses étapes, ses tâches et son calendrier, et les redire ici en
// ferait deux endroits à tenir d'accord.
function railDesProjets() {
  const projets = projetsDuCap();

  if (!projets.length) {
    return `<p class="cap-vide">Aucun projet ne le sert encore. Un projet, c'est le
      <em>comment</em> : l'album, la rubrique, le dossier — ce qui porte les tâches
      et la charge.</p>
      <button type="button" class="cap-ajout-discret" data-ajout="projet">
        ${SIGNE.plus}<span>Poser un projet</span></button>`;
  }

  const tuiles = projets
    .map((projet) => {
      const avancee = avanceeDuProjet(projet, etat.taches);
      const porte = [
        motDeLAvancee(avancee),
        avancee.total ? pluriel(avancee.total, 'tâche') : 'Aucune tâche',
        avancee.mesure === 'charge' ? '' : chargeDuProjet(projet),
      ].filter(Boolean);

      return `
      <article class="projet-tuile" data-espace="${echapper(projet.espace)}">
        <a class="projet-ouvrir" href="#projet/${encodeURIComponent(projet.id)}"
          aria-label="Ouvrir ${echapper(projet.nom)}">
          <span class="projet-tete">
            <span class="pastille"></span>
            <span class="projet-espace">${echapper(
              ETATS_PROJET_LUS[projet.statut ?? 'actif'] ?? projet.statut,
            )}</span>
          </span>
          <span class="projet-nom">${echapper(projet.nom)}</span>
          ${jaugeDuProjet(avancee)}
          <span class="projet-compte">${echapper(porte.join(' · '))}</span>
        </a>
      </article>`;
    })
    .join('');

  return `
    <div class="projet-rail objectif-page-rail">${tuiles}</div>
    <button type="button" class="cap-ajout-discret" data-ajout="projet">
      ${SIGNE.plus}<span>Poser un projet</span></button>`;
}

// --- L'ARGENT DE « REMBOURSER MON MATÉRIEL » -----------------------------------
//
// La cible de cet objectif est la somme du matériel et des frais, sa progression
// la somme des prestations encaissées. Les deux listes se corrigent ICI, à côté
// de l'objectif qu'elles mesurent (demande de Noé, 26 août 2026) — la page Yuno,
// elle, se contente d'en afficher le total.
export function construireArgent(commandes, materiel) {
  const { encaisse, frais, achats, cible, reste } = argentDeYuno(commandes, materiel);
  const chiffrees = commandes.filter((commande) => commande.montant != null);

  const ligne = (entree, somme, detail, action) => `
    <li>
      <span class="argent-nom">
        ${echapper(entree.titre ?? entree.nom)}
        ${detail ? `<span class="discret argent-detail">${detail}</span>` : ''}
      </span>
      <span class="argent-somme chiffre">${echapper(enEuros(somme))}</span>
      <button type="button" class="argent-retirer" ${action}
        aria-label="Retirer « ${echapper(entree.titre ?? entree.nom)} »">×</button>
    </li>`;

  return `
    <div class="argent">
      <p class="argent-total">
        <span class="chiffre">${echapper(enEuros(encaisse))}</span> encaissés sur
        <span class="chiffre">${echapper(enEuros(cible))}</span>
        ${
          reste > 0
            ? `— il reste <span class="chiffre">${echapper(enEuros(reste))}</span>`
            : '— le matériel est remboursé.'
        }
      </p>
      <p class="discret argent-detail-total">${echapper(
        `${enEuros(achats)} de matériel${frais ? ` + ${enEuros(frais)} de frais` : ''}`,
      )}</p>

      <h4 class="cap-etage-titre">Les prestations</h4>
      ${
        chiffrees.length
          ? `<ul class="argent-liste">${chiffrees
              .map((commande) =>
                ligne(
                  commande,
                  commande.montant,
                  commande.frais ? `${enEuros(commande.frais)} de frais` : '',
                  `data-retirer-commande="${echapper(commande.id)}"`,
                ),
              )
              .join('')}</ul>`
          : `<p class="cap-vide">Aucune prestation notée.</p>`
      }
      <button type="button" class="cap-ajout-discret" data-ajout="prestation">
        ${SIGNE.plus}<span>Noter une prestation</span></button>

      <h4 class="cap-etage-titre">Le matériel</h4>
      ${
        materiel.length
          ? `<ul class="argent-liste">${materiel
              .map((achat) =>
                ligne(
                  achat,
                  achat.prix,
                  achat.date_achat ? jourLisible(achat.date_achat) : '',
                  `data-retirer-materiel="${echapper(achat.id)}"`,
                ),
              )
              .join('')}</ul>`
          : `<p class="cap-vide">Aucun achat noté.</p>`
      }
      <button type="button" class="cap-ajout-discret" data-ajout="materiel">
        ${SIGNE.plus}<span>Noter un achat</span></button>
    </div>`;
}

// --- La tuile volante ----------------------------------------------------------

function laFenetre() {
  if (!etat.edition) return '';
  const { forme, id } = etat.edition;
  const modele = FORMULAIRES[forme];
  const valeurs = id ? (trouver(`${forme}:${id}`) ?? {}) : {};

  return construireFormulaire({
    id: `objectif-${forme}`,
    libelle: id ? modele.modifier : modele.ajouter,
    action: 'enregistrer-objectif',
    bouton: id ? 'Enregistrer' : 'Ajouter',
    // Un projet posé depuis un cap arrive avec l'espace de ce cap, et il le
    // sert d'office : le lien se fait tout seul.
    champs: modele.champs(
      forme === 'projet' && !id ? { espace: etat.objectif?.espace } : valeurs,
      etat.objectif ? [etat.objectif] : [],
    ),
    extra: `<input type="hidden" name="forme" value="${echapper(forme)}">
            <input type="hidden" name="id" value="${echapper(id ?? '')}">`,
  });
}

function trouver(cle) {
  const [forme, id] = cle.split(':');
  if (forme === 'objectif') return etat.objectif;
  if (forme === 'tache') return etat.taches.find((tache) => tache.id === id);
  if (forme === 'jalon') return (etat.objectif?.jalons ?? []).find((jalon) => jalon.id === id);
  return null;
}

// --- L'écran -------------------------------------------------------------------

function squelette() {
  if (etat.echec) {
    return `
      <h1>Objectif</h1>
      <p class="vide">Les données n'ont pas pu être chargées.
        <button type="button" class="lien-discret" data-action="reessayer">Réessayer</button></p>`;
  }

  const objectif = etat.objectif;
  if (!objectif) {
    return `
      <h1>Objectif</h1>
      <p class="vide">${
        etat.id ? "Ce cap n'existe plus, ou il est atteint." : 'Aucun objectif choisi.'
      } <a href="#objectifs/caps">Voir tous les objectifs</a></p>`;
  }

  return `
    ${enTete(objectif)}

    ${etat.message ? `<p class="discret message-regle">${echapper(etat.message)}</p>` : ''}

    <!-- TROIS COLONNES, comme la page d'un projet : ce qu'on pose, l'endroit où
         on le pose, et l'étage en dessous. -->
    <!-- DEUX COLONNES, ET PAS TROIS (2 septembre 2026, décision de Noé :
         « supprime la colonne de droite »). Un cap n'a qu'une chose à poser sur
         son calendrier — ses jalons —, et une seconde réserve vide de l'autre
         côté ne disait rien. Le calendrier prend la place qu'elle rendait. -->
    <div class="objectif-page-programmation${etat.choisie ? ' en-main' : ''}">
      <section class="bloc projet-page-colonne projet-page-etapes">
        <h2>Ses jalons</h2>
        <div class="projet-page-liste">${friseJalons(objectif)}</div>
        <button type="button" class="cap-ajout-discret" data-ajout="jalon">
          ${SIGNE.plus}<span>Poser un jalon</span></button>
      </section>

      <section class="bloc projet-page-grille">
        <h2>Son calendrier</h2>
        ${construireBarrePeriode(etat.vue, etat.ancre, {
          // SEMAINE, MOIS, 3 MOIS, ANNÉE (2 septembre 2026, demandes de Noé) : les
          // jalons d'un cap tombent à des mois de distance, et une vue mois n'en
          // montrait jamais que le premier. Pas d'agenda — il répéterait la
          // liste qui vit juste à côté.
          vues: ['semaine', 'mois', 'trimestre', 'annee'],
        })}
        <div id="objectif-page-grille">
          ${construireGrille(etat.elements, toutesLesNatures(), etat.vue, etat.ancre, {
            montrerEspace: true,
            aide: false,
          })}
        </div>
      </section>

    </div>

    <!-- LES PROJETS SOUS LE CALENDRIER (2 septembre 2026, demande de Noé) : ils
         ne sont pas à POSER — ils n'ont pas d'échéance qu'on déplace du doigt,
         ils ont une page —, donc ils n'ont rien à faire dans une colonne qui est
         une réserve. Un rail pleine largeur, celui de l'accueil. -->
    <section class="bloc objectif-page-projets">
      <h2>Ses projets</h2>
      ${railDesProjets()}
    </section>

    ${
      objectif.titre === OBJECTIF_MATERIEL
        ? `<section class="bloc objectif-page-argent">
             <h2>Ce qui le mesure</h2>
             ${construireArgent(etat.commandes, etat.materiel)}
           </section>`
        : ''
    }

    <button type="button" class="ouvrir-capture" data-ouvrir-creation
      title="Ajouter au calendrier" aria-label="Ajouter au calendrier">${PLUS_ROND}</button>

    <div class="cap-fenetre-hote">${laFenetre()}</div>
    <div id="objectif-creation">${
      etat.creation
        ? fenetreCreation({
            ...etat.creation,
            espaces: { [objectif.espace]: NOMS_ESPACES[objectif.espace] ?? objectif.espace },
            projets: etat.projets,
            valeurs: { espace: objectif.espace },
          })
        : ''
    }</div>
    <div id="objectif-detail">${
      etat.detail
        ? fenetreDetail(etat.detail, { edition: etat.editionDetail, statutModifiable: true })
        : ''
    }</div>`;
}

export default {
  async monter(section, route) {
    etat.id = route?.vue ?? null;

    let poserLEntreeClavier = null;
    let rafraichirLaCapture = null;

    // Le nom de la page EST le nom du cap, et sa couleur celle de son espace.
    // Les deux se REPOSENT à chaque passage du routeur : `app.js` les écrit dans
    // `afficherEspace`, qu'il appelle une seconde fois au démarrage.
    const habiller = () => {
      if (!etat.objectif || section.hidden) return;
      document.title = `${etat.objectif.titre} — Hub`;
      document.body.dataset.espace = etat.objectif.espace;
    };

    const rendre = () => {
      section.innerHTML = squelette();
      habiller();

      const fenetre = section.querySelector('.cap-fenetre-hote .ajout-volant');
      if (fenetre) {
        fenetre.open = true;
        fenetre.querySelector('input, textarea')?.focus();
      }

      poserLEntreeClavier?.();
      if (etat.creation) rafraichirLaCapture?.();
    };

    const signaler = (mot) => {
      etat.message = mot;
      rendre();
    };

    function rendreTout() {
      assembler();
      rendre();
    }

    const charger = async () => {
      if (!etat.id) {
        etat.objectif = null;
        rendre();
        return;
      }

      try {
        const [objectifs, projets, taches, evenements, publications, commandes, materiel] =
          await Promise.all([
            api.objectifsActifs(),
            api.projetsTous(),
            api.tachesToutes(),
            api.evenementsTous(),
            api.publicationsToutes(),
            api.commandesToutes(),
            api.materielTout(),
          ]);

        etat.objectif = objectifs.find((objectif) => objectif.id === etat.id) ?? null;
        etat.projets = projets;
        etat.taches = taches;
        etat.evenements = evenements;
        etat.publications = publications;
        etat.commandes = commandes;
        etat.materiel = materiel;
        etat.echec = false;
      } catch (erreur) {
        console.error("Chargement de l'objectif impossible", erreur);
        etat.echec = true;
      }

      assembler();
      rendre();
    };

    this.rafraichir = charger;

    this.naviguer = (nouvelle) => {
      const id = nouvelle?.vue ?? null;
      // Le même cap : rien à relire, mais il faut rendre à la page son nom et sa
      // couleur — `afficherEspace` vient de les remplacer par ceux de l'écran.
      if (id === etat.id) return habiller();
      etat.id = id;
      etat.objectif = null;
      etat.choisie = null;
      etat.menu = null;
      etat.confirme = null;
      etat.edition = null;
      etat.detail = null;
      etat.creation = null;
      etat.message = null;
      rendre();
      charger();
    };

    rendre();
    await charger();

    // `brancherCapture` SEUL, jamais avec `brancherChoix` : les deux écoutent
    // `[data-ouvrir-choix]`, et un menu ouvert puis refermé dans le même clic ne
    // s'ouvre jamais.
    rafraichirLaCapture = brancherCapture(section, { projets: () => etat.projets });

    // --- Poser ce qu'on tient sur un jour ---

    async function programmer(cle, jour) {
      const [forme, id] = cle.split(':');
      etat.choisie = null;
      etat.message = null;

      const ligne = trouver(cle);
      if (!ligne) return;

      const champs = { echeance: jour };
      await modifierAussitot(
        ligne,
        champs,
        () => (forme === 'jalon' ? api.modifierJalon(id, champs) : api.modifierTache(id, champs)),
        { rendre: rendreTout, echouer: signaler },
      );
    }

    // Elle reçoit la CLÉ, pas un objet : c'est ce que `zone.quand` passe.
    async function deprogrammer(cle) {
      const [forme, id] = cle.split(':');
      if (forme !== 'tache' && forme !== 'jalon') {
        signaler('Seuls un jalon et une tâche se déprogramment d’ici.');
        return;
      }

      const ligne = trouver(cle);
      if (!ligne) return;

      etat.message = null;
      const champs = forme === 'jalon' ? { echeance: null } : { echeance: null, heure: null };
      await modifierAussitot(
        ligne,
        champs,
        () => (forme === 'jalon' ? api.modifierJalon(id, champs) : api.modifierTache(id, champs)),
        { rendre: rendreTout, echouer: signaler },
      );
    }

    // --- Glisser une barre déjà posée ---

    brancherDeplacement(
      section,
      async ({ element: cle, ecart }) => {
        const [type, id] = cle.split(':');
        const element = etat.elements.find(
          (candidat) => candidat.type === type && String(candidat.id) === id,
        );
        if (!element?.source) return;

        const champs = champsApresDeplacement(element, ecart);
        etat.message = null;
        await modifierAussitot(
          element.source,
          champs,
          () => appliquerAuCalendrier(type, id, champs),
          { rendre: rendreTout, echouer: signaler },
        );
      },
      // Les deux colonnes déprogramment : ce qui décide est la CHOSE qu'on
      // lâche, pas l'endroit où on la lâche.
      { zones: [{ selecteur: '.projet-page-colonne', quand: deprogrammer }] },
    );

    // --- Glisser une ligne d'une colonne vers un jour ---
    //
    // À LA SOURIS SEULEMENT : au doigt, une liste verticale ne distingue pas un
    // glissement d'un défilement. Le toucher a son chemin — on touche le titre,
    // puis le jour.
    let prise = null;

    const lacher = () => {
      prise?.ligne.classList.remove('en-deplacement');
      prise?.fantome?.remove();
      viserLeJour(section, null);
      prise = null;
    };

    section.addEventListener('pointerdown', (evenement) => {
      const ligne = evenement.target.closest('[data-poser]');
      if (!ligne || evenement.pointerType === 'touch') return;
      if (evenement.target.closest('button:not([data-choisir])')) return;

      evenement.preventDefault();
      prise = {
        ligne,
        cle: ligne.dataset.poser,
        x: evenement.clientX,
        y: evenement.clientY,
        bouge: false,
        fantome: null,
        pointeur: evenement.pointerId,
      };
    });

    section.addEventListener('pointermove', (evenement) => {
      if (!prise) return;

      if (!prise.bouge) {
        if (Math.hypot(evenement.clientX - prise.x, evenement.clientY - prise.y) < 5) return;
        prise.bouge = true;
        prise.ligne.classList.add('en-deplacement');
        prise.fantome = prendreEnMain(prise.ligne, evenement.clientX, evenement.clientY);
        try {
          prise.ligne.setPointerCapture(prise.pointeur);
        } catch {
          // Une capture ratée ne doit pas emporter le glissement avec elle.
        }
      }

      suivreLaMain(prise.fantome, evenement.clientX, evenement.clientY);
      viserLeJour(section, jourSousLePoint(evenement.clientX, evenement.clientY));
    });

    section.addEventListener('pointerup', (evenement) => {
      if (!prise) return;

      const { ligne, cle, bouge, pointeur } = prise;
      try {
        ligne.releasePointerCapture(pointeur);
      } catch {
        // Le pointeur n'était plus à capturer : rien à relâcher.
      }
      const arrivee = jourSousLePoint(evenement.clientX, evenement.clientY);
      lacher();

      if (!bouge) return;

      const avaler = (clic) => {
        clic.stopPropagation();
        clic.preventDefault();
      };
      section.addEventListener('click', avaler, { capture: true, once: true });
      setTimeout(() => section.removeEventListener('click', avaler, { capture: true }), 400);

      if (arrivee) programmer(cle, arrivee);
    });

    section.addEventListener('pointercancel', lacher);

    // --- Toucher un jour ---

    const ouvrirLaCapture = ({ debut, fin }) => {
      etat.detail = null;
      etat.creation = { debut, fin, nature: 'tache' };
      rendre();
      section.querySelector('#cal-titre')?.focus();
    };

    const surUnJour = ({ debut, fin }) => {
      if (etat.choisie) {
        programmer(etat.choisie, debut);
        return;
      }
      // DANS L'ANNÉE, UNE SEMAINE S'OUVRE au lieu de se remplir (2 septembre
      // 2026, demande de Noé : « quand j'appuie sur une semaine ça doit me mener
      // à sa vue semaine »). C'est la seule vue du hub où un appui n'ouvre pas
      // la tuile de capture, et c'est cohérent : on ne pose pas une chose
      // « dans une semaine », on descend d'un cran pour voir où.
      if (etat.vue === 'annee') {
        etat.vue = 'semaine';
        etat.ancre = depuisDateISO(debut);
        rendre();
        return;
      }
      ouvrirLaCapture({ debut, fin });
    };

    brancherSelection(section, surUnJour);
    poserLEntreeClavier = brancherClavier(section, (jour) =>
      surUnJour({ debut: jour, fin: jour }),
    );
    poserLEntreeClavier();

    brancherEtatPublication(section, {
      publications: () => etat.publications,
      ouverte: () => (etat.detail?.type === 'publication' ? etat.detail.source : null),
      rendre: rendreTout,
      echouer: signaler,
    });

    // --- Les clics ---

    section.addEventListener('click', async (evenement) => {
      const dans = (nom) => evenement.target.closest(`[data-${nom}]`);

      if (evenement.target.closest('[data-action="reessayer"]')) {
        etat.echec = false;
        rendre();
        await charger();
        return;
      }

      if (evenement.target.closest('[data-fermer-ajout]')) {
        etat.edition = null;
        rendre();
        return;
      }
      if (evenement.target.closest('.ajout-volant')) return;

      // --- Les fenêtres du calendrier ---

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        etat.creation = null;
        etat.detail = null;
        etat.editionDetail = false;
        rendre();
        return;
      }

      const nature = evenement.target.closest('[data-nature-creation]');
      if (nature) {
        etat.creation = {
          ...etat.creation,
          debut: section.querySelector('#cal-debut')?.value || etat.creation.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creation.fin,
          nature: nature.dataset.natureCreation,
        };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }

      if (dans('ouvrir-creation')) {
        const aujourdhui = new Date().toISOString().slice(0, 10);
        ouvrirLaCapture({ debut: aujourdhui, fin: aujourdhui });
        return;
      }

      // Le rond d'une barre se coche, AVANT l'ouverture de son détail : il vit
      // DANS la barre, qui est elle-même le bouton d'ouverture, et c'est l'ordre
      // des tests qui tranche.
      const cercleBarre = evenement.target.closest('[data-cocher-tache]');
      if (cercleBarre) {
        evenement.stopPropagation();
        return basculerTache(cercleBarre.dataset.cocherTache);
      }

      const ouvrir = evenement.target.closest('[data-element]');
      if (ouvrir) {
        const [type, id] = ouvrir.dataset.element.split(':');
        etat.creation = null;
        etat.editionDetail = false;
        etat.detail = etat.elements.find(
          (element) => element.type === type && String(element.id) === id,
        );
        rendre();
        return;
      }

      if (dans('modifier-element')) {
        etat.editionDetail = true;
        rendre();
        section.querySelector('#cal-edition-titre')?.focus();
        return;
      }

      if (dans('annuler-edition')) {
        etat.editionDetail = false;
        rendre();
        return;
      }

      const supprimerElement = evenement.target.closest('[data-supprimer-element]');
      if (supprimerElement) {
        const [type, id] = supprimerElement.dataset.supprimerElement.split(':');
        if (!confirm(`Supprimer « ${etat.detail?.titre} » ?`)) return;
        supprimerElement.disabled = true;
        try {
          await effacerDepuisLeCalendrier(type, id);
          etat.detail = null;
          await charger();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerElement.disabled = false;
        }
        return;
      }

      // LE NOM D'UN MOIS, DANS L'ANNÉE : il descend d'un cran, comme une semaine
      // pressée. Même geste, un étage au-dessus.
      const zoom = dans('zoom-mois');
      if (zoom) {
        etat.vue = 'mois';
        etat.ancre = depuisDateISO(zoom.dataset.zoomMois);
        rendre();
        return;
      }

      const vue = evenement.target.closest('[data-vue-cal]');
      if (vue) {
        etat.vue = vue.dataset.vueCal;
        rendre();
        return;
      }

      const periode = evenement.target.closest('[data-periode]');
      if (periode) {
        const sens = Number(periode.dataset.periode);
        etat.ancre = sens === 0 ? new Date() : deplacerAncre(etat.ancre, etat.vue, sens);
        rendre();
        return;
      }

      // --- Les colonnes ---

      const choix = evenement.target.closest('[data-choisir]');
      if (choix) {
        etat.choisie = etat.choisie === choix.dataset.choisir ? null : choix.dataset.choisir;
        etat.message = null;
        rendre();
        return;
      }

      if (evenement.target.closest('[data-ouvrir-choix], .choix-panneau')) return;

      // --- Ce qui s'écrit d'un doigt ---

      const jalon = dans('jalon');
      if (jalon) return basculerJalon(jalon.dataset.jalon);

      const monter = dans('monter');
      const descendre = dans('descendre');
      if (monter || descendre) {
        const [, id] = (monter ?? descendre).dataset[monter ? 'monter' : 'descendre'].split(':');
        return deplacerJalon(id, monter ? -1 : 1);
      }

      // --- L'argent ---

      const commande = dans('retirer-commande');
      if (commande) {
        const id = commande.dataset.retirerCommande;
        const cible = etat.commandes.find((ligne) => ligne.id === id);
        return retirerAussitot(etat.commandes, cible, () => api.supprimerCommande(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être retiré."),
        });
      }

      const achat = dans('retirer-materiel');
      if (achat) {
        const id = achat.dataset.retirerMateriel;
        const cible = etat.materiel.find((ligne) => ligne.id === id);
        return retirerAussitot(etat.materiel, cible, () => api.supprimerMateriel(id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être retiré."),
        });
      }

      // --- Le menu discret ---

      const menuTouche = dans('menu');
      if (menuTouche) {
        etat.menu = etat.menu === menuTouche.dataset.menu ? null : menuTouche.dataset.menu;
        etat.confirme = null;
        rendre();
        return;
      }

      const modifier = dans('modifier');
      if (modifier) {
        const [forme, id] = modifier.dataset.modifier.split(':');
        etat.edition = { forme, id };
        etat.menu = null;
        rendre();
        return;
      }

      const supprimer = dans('supprimer');
      if (supprimer) {
        etat.confirme = supprimer.dataset.supprimer;
        rendre();
        return;
      }

      const atteindre = dans('atteindre');
      if (atteindre) {
        etat.confirme = `atteindre:${atteindre.dataset.atteindre}`;
        rendre();
        return;
      }

      const confirmer = dans('confirmer');
      if (confirmer) return executer(confirmer.dataset.confirmer);

      if (dans('annuler-confirmation')) {
        etat.confirme = null;
        rendre();
        return;
      }

      const ajout = dans('ajout');
      if (ajout) {
        etat.edition = { forme: ajout.dataset.ajout, id: null };
        etat.menu = null;
        rendre();
        return;
      }

      if (etat.menu || etat.confirme) {
        etat.menu = null;
        etat.confirme = null;
        rendre();
      }
    });

    document.addEventListener('keydown', (evenement) => {
      if (evenement.key !== 'Escape') return;
      if (section.hidden) return;

      if (etat.edition) {
        etat.edition = null;
        rendre();
      } else if (etat.creation || etat.detail) {
        etat.creation = null;
        etat.detail = null;
        etat.editionDetail = false;
        rendre();
      } else if (etat.choisie) {
        etat.choisie = null;
        rendre();
      }
    });

    // --- Enregistrer ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      const action = formulaire.dataset.action;
      if (
        action !== 'enregistrer-objectif' &&
        action !== 'creer-depuis-calendrier' &&
        action !== 'modifier-depuis-calendrier'
      ) {
        return;
      }
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        if (action === 'creer-depuis-calendrier') {
          await poserAuCalendrier(champs, { espaceParDefaut: etat.objectif.espace });
        } else if (action === 'modifier-depuis-calendrier') {
          await corrigerDepuisLeCalendrier(champs);
        } else {
          await enregistrer(champs);
        }

        etat.edition = null;
        etat.creation = null;
        etat.detail = null;
        etat.editionDetail = false;
        await charger();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    async function enregistrer(champs) {
      const { forme, id } = champs;
      const objectif = etat.objectif;

      if (forme === 'objectif') {
        await api.modifierObjectif(id, {
          espace: champs.espace,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        return;
      }

      if (forme === 'jalon') {
        const valeurs = { titre: champs.titre.trim(), echeance: champs.echeance || null };
        if (id) await api.modifierJalon(id, valeurs);
        else {
          await api.creerJalon({
            objectif_id: objectif.id,
            ...valeurs,
            ordre: (objectif.jalons?.length ?? 0) + 1,
          });
        }
        return;
      }

      if (forme === 'projet') {
        const valeurs = {
          espace: champs.espace,
          nom: champs.nom.trim(),
          resultat: champs.resultat?.trim() || null,
          charge_minutes: enMinutes(champs.charge_heures),
          charge_hebdo: enMinutes(champs.charge_hebdo_heures),
          echeance: champs.echeance || null,
          statut: champs.statut,
        };
        const projet = await api.creerProjet(valeurs);
        // Un projet posé DEPUIS un cap sert ce cap : le lien se fait tout seul,
        // sinon il faudrait le refaire à la main juste après. Il s'ajoute à ce
        // que la pastille a coché, sans se compter deux fois.
        const voulus = (champs.objectifs ?? '').split(',').filter(Boolean);
        for (const cible of new Set([objectif.id, ...voulus])) {
          await api.lierProjet(projet.id, { objectif_id: cible });
        }
        return;
      }

      if (forme === 'prestation') {
        // Livrée d'emblée : on note ce qu'on a ENCAISSÉ, pas ce qu'on espère.
        await api.creerCommande({
          titre: champs.titre.trim(),
          client: champs.client?.trim() || null,
          montant: Number(champs.montant),
          // Vide = pas de frais, et non zéro : la colonne dit alors « on n'a
          // rien noté », pas « ça n'a rien coûté ».
          frais: champs.frais ? Number(champs.frais) : null,
          statut: 'livree',
        });
        return;
      }

      if (forme === 'materiel') {
        await api.creerMateriel({
          nom: champs.nom.trim(),
          prix: Number(champs.prix),
          date_achat: champs.date_achat || null,
        });
      }
    }

    // --- Les gestes qui écrivent ---

    // Marquer un jalon atteint écrit sa victoire ; revenir dessus la retire —
    // sinon le hub garderait la trace d'un travail défait.
    async function basculerJalon(id) {
      const jalon = trouver(`jalon:${id}`);
      if (!jalon) return;

      const avant = { ...jalon };
      Object.assign(jalon, {
        atteint: !jalon.atteint,
        date_atteint: jalon.atteint ? null : new Date().toISOString().slice(0, 10),
      });
      rendreTout();

      try {
        if (avant.atteint) {
          Object.assign(jalon, await api.modifierJalon(id, { atteint: false, date_atteint: null }));
          await api.supprimerVictoireDuJalon(id);
        } else {
          const { jalon: atteint } = await api.atteindreJalon(avant, etat.objectif.espace);
          Object.assign(jalon, atteint);
        }
      } catch (souci) {
        console.error('Jalon non modifié', souci);
        Object.assign(jalon, avant);
        signaler("Ça n'a pas pu être enregistré — le jalon est revenu.");
      }
    }

    // L'ordre se change. `reordonnerJalons` renumérote la liste entière : deux
    // jalons peuvent porter le même rang, et un échange de valeurs jumelles ne
    // changerait rien.
    async function deplacerJalon(id, pas) {
      const liste = etat.objectif?.jalons;
      if (!liste) return;

      const rang = liste.findIndex((jalon) => jalon.id === id);
      const vers = rang + pas;
      if (rang === -1 || vers < 0 || vers >= liste.length) return;

      // Sur place, jamais par remplacement : c'est le tableau que tout le monde
      // regarde, et un retour en arrière écrirait dans un tableau orphelin.
      const avant = [...liste];
      liste.splice(vers, 0, ...liste.splice(rang, 1));
      rendre();

      try {
        await api.reordonnerJalons(liste);
      } catch (souci) {
        console.error('Ordre non enregistré', souci);
        liste.splice(0, liste.length, ...avant);
        signaler("Ça n'a pas pu être enregistré — l'ordre des jalons est revenu.");
      }
    }

    // Cocher est une intention, pas un fait acquis : la fenêtre demande combien
    // de temps ça a pris, et rien n'est écrit tant qu'on n'a pas confirmé.
    function basculerTache(id) {
      const tache = etat.taches.find((ligne) => ligne.id === id);
      if (!tache) return;

      if (tache.statut === 'fait') return terminerTache(tache, false, null);
      demanderLaDuree(tache, (minutes) => terminerTache(tache, true, minutes));
    }

    async function terminerTache(tache, versFait, minutes) {
      const avant = { ...tache };
      Object.assign(tache, {
        statut: versFait ? 'fait' : 'actif',
        date_fait: versFait ? new Date().toISOString() : null,
        duree: minutes ?? tache.duree,
      });
      rendreTout();

      try {
        if (versFait) {
          if (minutes !== null) await api.modifierTache(tache.id, { duree: minutes });
          const { tache: faite } = await api.terminerTache(avant);
          Object.assign(tache, faite);
        } else {
          Object.assign(tache, await api.rouvrirTache(avant));
          await api.supprimerVictoireDeLaTache(tache.id);
        }
      } catch (souci) {
        console.error('Tâche non mise à jour', souci);
        Object.assign(tache, avant);
        signaler("Ça n'a pas pu être enregistré — la tâche est revenue.");
      }
    }

    // Ce qui est irréversible passe par ici, et seulement après confirmation.
    async function executer(cle) {
      const [forme, id] = cle.split(':');
      etat.menu = null;
      etat.confirme = null;

      // ATTEINT OU SUPPRIMÉ, LA PAGE N'A PLUS DE SUJET : on retourne à la
      // galerie. Un cap atteint quitte `objectifsActifs`, et rester sur une page
      // qui dirait « ce cap n'existe plus » serait une mauvaise nouvelle pour
      // une bonne action.
      if (forme === 'atteindre' || forme === 'objectif') {
        const objectif = etat.objectif;
        if (!objectif) return;
        try {
          if (forme === 'atteindre') await api.atteindreObjectif(objectif);
          else await api.supprimerObjectif(id);
          location.hash = '#objectifs/caps';
        } catch (souci) {
          console.error('Objectif non modifié', souci);
          signaler("Ça n'a pas pu être enregistré.");
        }
        return;
      }

      if (forme === 'jalon') {
        const jalon = trouver(cle);
        if (!jalon) return;
        return retirerAussitot(etat.objectif.jalons, jalon, () => api.supprimerJalon(id), {
          rendre: rendreTout,
          echouer: () => signaler("Ça n'a pas pu être supprimé."),
        });
      }

    }
  },
};
