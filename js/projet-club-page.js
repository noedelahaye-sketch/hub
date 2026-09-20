// LA PAGE D'UN PROJET DU CLUB — `#hermitage/projet-club/projet-<clé>`
// (20 septembre 2026, demande de Noé : « les pages des projets des commissions
// doivent ressembler aux pages de mes projets, donc avec des jalons, un
// calendrier sur lequel on peut poser des choses »).
//
// CE QU'ELLE REMPLACE : une page qui ne faisait que LIRE le projet associatif —
// un titre, un horizon, des pôles — et qui l'avouait elle-même en pied :
// « Responsable, étapes et dates de réalisation restent à préciser ». Rien ne
// s'y posait, faute d'une ligne où l'écrire.
//
// ELLE RESSEMBLE À CELLE D'UN PROJET DU HUB, ET ELLE NE LA RECOPIE PAS : la
// colonne, la grille, la barre de période, le glissement d'une ligne vers un
// jour et la frise des étapes sont les briques communes (js/calendrier-commun.js,
// css/styles.css). Ce qui change, c'est ce qu'elle lit — deux tables à part.
//
// DEUX TABLES À PART, ET C'EST LA DÉCISION DE NOÉ : *« ça ne s'affichera pas
// dans mon calendrier, seulement dans le calendrier de la page du projet ».*
// Les projets du club ne sont pas les siens, et vingt-huit d'entre eux dans
// « Mes projets » auraient noyé son cap. Conséquence assumée, et voulue : **une
// tâche du hub ne peut pas se rattacher à un projet du club** — `taches.projet_id`
// pointe vers `projets`. Ce qu'on pose ici, ce sont ses ÉTAPES.
//
// ELLE S'OUVRE À LA DEMANDE (même décision : « un par un, à la demande »). Tant
// que le projet n'a pas été ouvert, la page montre ce que le document en dit et
// un bouton. La ligne naît au premier clic, et le geste est REJOUABLE — `cle`
// est unique en base.

import * as api from './api.js';
import {
  echapper, versDateISO, depuisDateISO, echeanceLisible, rangerParEcheance,
} from './format.js';
import {
  assemblerCalendrier,
  construireBarrePeriode,
  construireGrille,
  deplacerAncre,
  brancherPriseEnMain,
  brancherSelection,
  brancherDeplacement,
} from './calendrier-commun.js';
import { construireMenuDiscret, construireFormulaire } from './gabarits.js';
import { FORMULAIRES } from './objectifs.js';

// Le même « + » que la page d'un projet du hub. Il y est déclaré localement
// (js/projet.js) et non exporté : deux lignes de SVG recopiées valent mieux
// qu'un export ouvert pour elles seules.
const SIGNE_PLUS = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;
import { modifierAussitot, retirerAussitot } from './ecriture.js';

// La même écriture que sur la page d'un projet du hub : une échéance se lit
// « dans 4 jours », pas « 24/09 ». C'est une phrase, donc pas de chasse fixe.
const jourLisible = (iso) => (iso ? echeanceLisible(depuisDateISO(iso)) : '');

const etat = {
  declare: null,   // le projet tel que le document du club l'écrit
  projet: null,    // sa ligne, s'il a été ouvert
  etapes: [],
  elements: [],
  vue: 'mois',
  ancre: new Date(),
  choisie: null,   // l'étape prise en main, au doigt
  menu: null,
  edition: null,  // l'étape qu'on écrit : { id } ou {} pour une neuve
  souci: null,
};

// --- Ce que le calendrier porte ----------------------------------------------
//
// SEULES LES ÉTAPES DATÉES, et il n'y a rien d'autre à mettre : la page ne lit
// ni tâches ni évènements, par construction. `assemblerCalendrier` est appelé
// SANS RIEN pour que la grille reçoive la forme qu'elle attend — une liste vide
// plutôt qu'un tableau bricolé à côté.
function assembler() {
  etat.elements = assemblerCalendrier({});
  for (const etape of etat.etapes) {
    if (!etape.echeance) continue;
    etat.elements.push({
      id: etape.id,
      type: 'etape',
      source: etape,
      date: depuisDateISO(etape.echeance),
      // Franchie, elle se barre comme une tâche faite : ce qui a eu lieu garde
      // sa place dans le mois.
      faite: Boolean(etape.atteint),
      espace: 'fch',
      titre: etape.titre,
    });
  }
}

// --- La frise des étapes ------------------------------------------------------
//
// LE MÊME DESSIN QUE LA PAGE D'UN PROJET DU HUB (`.cap-jalon`) : le point qu'on
// presse pour franchir, le titre qui sert de poignée, la date à droite. Un
// découpage qui se lirait autrement d'un écran à l'autre serait un geste à
// réapprendre.
//
// CE QUI EST FRANCHI NE SE GLISSE PAS : sa ligne n'affiche plus son échéance
// mais le jour où c'est arrivé, et un glissement écrirait une date qu'on ne
// verrait pas changer. **Un geste dont on ne voit pas l'effet est pire qu'un
// geste absent.**
function frise() {
  const etapes = rangerParEcheance(etat.etapes);
  const prochaine = etapes.find((etape) => !etape.atteint);

  if (!etapes.length) {
    return `<p class="cap-vide">Aucune étape. La première dira comment ce projet
      se découpe — et c'est elle qui le mesurera.</p>`;
  }

  return `<ul class="liste-jalons">${etapes
    .map((etape, rang) => {
      const cle = `etape:${etape.id}`;
      const prenable = !etape.atteint;
      const choisie = etat.choisie === cle;
      return `
      <li class="cap-jalon${etape.atteint ? ' atteint' : ''}${
        etape === prochaine ? ' prochain' : ''
      }${choisie ? ' colonne-choisie' : ''}"
        ${prenable ? `data-poser="${echapper(cle)}"` : ''}>
        <button type="button" class="cap-jalon-point" data-franchir="${echapper(etape.id)}"
          aria-pressed="${Boolean(etape.atteint)}"
          aria-label="${etape.atteint ? 'Revenir sur cette étape' : 'Marquer cette étape franchie'}"></button>
        <span class="cap-jalon-corps">
          ${prenable
            ? `<button type="button" class="cap-jalon-titre" data-choisir="${echapper(cle)}"
                aria-pressed="${choisie}"
                aria-label="${echapper(etape.titre)} — glisse-la sur un jour, ou touche-la puis touche le jour">${
                  echapper(etape.titre)}</button>`
            : `<span class="cap-jalon-titre">${echapper(etape.titre)}</span>`}
          ${etape.echeance && !etape.atteint
            ? `<span class="cap-tache-service"><span class="cap-tache-date">${
                echapper(jourLisible(etape.echeance))}</span></span>`
            : ''}
          ${etape.atteint && etape.date_atteint
            ? `<span class="cap-tache-service"><span class="cap-tache-date">Franchie le ${
                echapper(jourLisible(etape.date_atteint))}</span></span>`
            : ''}
        </span>
        ${construireMenuDiscret({
          id: `etape-${etape.id}`,
          ouvert: etat.menu === `etape-${etape.id}`,
          entrees: [
            rang > 0 ? { action: 'monter-etape', valeur: etape.id, libelle: 'Monter' } : null,
            rang < etapes.length - 1
              ? { action: 'descendre-etape', valeur: etape.id, libelle: 'Descendre' }
              : null,
            { action: 'modifier-etape', valeur: etape.id, libelle: 'Modifier' },
            { action: 'supprimer-etape', valeur: etape.id, libelle: 'Retirer', danger: true },
          ].filter(Boolean),
        })}
      </li>`;
    })
    .join('')}</ul>`;
}

// LE FORMULAIRE EST CELUI DU HUB (`FORMULAIRES.etape`, js/objectifs.js), et il
// ne se réécrit pas : une étape se demande de la même façon partout — un titre,
// et un jour facultatif. *Une invite du navigateur (`prompt`) a servi une heure
// ici : elle n'existe nulle part ailleurs dans le dépôt, elle ne sait pas
// demander une date, et elle a l'allure du système et non du hub.*
function laFenetre() {
  if (!etat.edition) return '';
  const etape = etat.edition.id
    ? etat.etapes.find((e) => e.id === etat.edition.id) ?? {}
    : {};
  return construireFormulaire({
    id: 'projet-club-etape',
    libelle: etat.edition.id ? FORMULAIRES.etape.modifier : FORMULAIRES.etape.ajouter,
    action: 'enregistrer-etape-club',
    bouton: etat.edition.id ? 'Enregistrer' : 'Ajouter',
    champs: FORMULAIRES.etape.champs(etape, []),
    extra: `<input type="hidden" name="id" value="${echapper(etat.edition.id ?? '')}">`,
  });
}

// --- L'écran -----------------------------------------------------------------

// LE TITRE N'EST PAS RÉÉCRIT ICI : le site le pose déjà dans le bandeau de la
// page, avec l'horizon et les pôles. Ce module n'ajoute que ce qu'il est seul à
// savoir — où en est le découpage.
function service() {
  if (!etat.projet) return '';
  const faites = etat.etapes.filter((e) => e.atteint).length;
  return `<p class="projet-page-service">${
    etat.etapes.length
      ? `<span class="chiffre">${faites}</span> étape${faites > 1 ? 's' : ''} franchie${
          faites > 1 ? 's' : ''} sur <span class="chiffre">${etat.etapes.length}</span>`
      : 'Aucune étape posée'}</p>`;
}

// LE PROJET QUI N'EST PAS ENCORE OUVERT n'a pas de page vide : il a ce que le
// document en dit, et une porte. C'est le « un par un, à la demande » de Noé,
// rendu visible — rien n'est créé tant qu'il n'a pas décidé que celui-ci compte.
function avantOuverture() {
  return `<section class="bloc">
    <h2>Ouvrir ce projet</h2>
    <p class="discret">Il est écrit dans le projet associatif du club. L'ouvrir lui
      donne un découpage en étapes et un calendrier où les poser — et ça ne
      touchera pas à tes projets à toi.</p>
    <p><button type="button" class="bouton" data-ouvrir-projet>Ouvrir ce projet</button></p>
  </section>`;
}

function programmation() {
  return `
    <div class="projet-page-programmation projet-club-page-programmation${
      etat.choisie ? ' en-main' : ''}">
      <section class="bloc projet-page-colonne projet-page-etapes">
        <h2>Ses étapes</h2>
        <div class="projet-page-liste">${frise()}</div>
        <button type="button" class="cap-ajout-discret" data-ajout-etape>
          ${SIGNE_PLUS}<span>Poser une étape</span></button>
        ${laFenetre()}
      </section>

      <section class="bloc projet-page-grille">
        <h2>Son calendrier</h2>
        ${construireBarrePeriode(etat.vue, etat.ancre, {
          vues: ['semaine', 'mois', 'trimestre', 'annee'],
        })}
        <div id="projet-club-grille">
          ${construireGrille(etat.elements, new Set(['etape']), etat.vue, etat.ancre, {
            montrerEspace: true,
            aide: false,
          })}
        </div>
      </section>
    </div>`;
}

export function construire() {
  if (!etat.declare) return '';
  return `${service()}
    ${etat.souci ? `<p class="vide">${echapper(etat.souci)}</p>` : ''}
    ${etat.projet ? programmation() : avantOuverture()}`;
}

// --- Le montage ---------------------------------------------------------------
//
// LE SITE POSE UN HÔTE, LE MODULE ÉCRIT DEDANS, exactement comme pour les écrans
// du cap : `hermitage.js` réécrit sa section à chaque changement d'état, donc il
// RECRÉE l'hôte — et les écouteurs posés dessus meurent avec lui. C'est ce qui
// garantit qu'ils ne se doublent pas, sans avoir à compter les montages.
let hote = null;

function redessiner() {
  if (!hote) return;
  hote.innerHTML = construire();
}

export async function monter(element, declare) {
  hote = element;
  // On repart de zéro à chaque montage : l'hôte est neuf, l'état doit l'être
  // aussi — sinon on afficherait le découpage du projet précédent le temps d'un
  // aller-retour réseau.
  Object.assign(etat, {
    declare, projet: null, etapes: [], elements: [],
    choisie: null, menu: null, souci: null,
  });
  assembler();
  redessiner();
  brancher(element);

  try {
    etat.projet = await api.projetDuClub(declare.cle);
    if (etat.projet) etat.etapes = await api.etapesDuProjetDuClub(etat.projet.id);
  } catch {
    etat.souci = "Le projet n'a pas pu être chargé — vérifie ta connexion.";
  }
  assembler();
  redessiner();
}

// ÉCRIRE PUIS REDESSINER, et dire quand ça a raté : c'est la règle du hub
// (js/ecriture.js). L'écran revient en arrière tout seul ; un geste défait en
// silence ressemblerait à une panne.
function signaler(message) {
  etat.souci = message;
  redessiner();
  setTimeout(() => {
    if (etat.souci !== message) return;
    etat.souci = null;
    redessiner();
  }, 6000);
}

async function poserSurUnJour(cle, jour) {
  const id = cle.slice('etape:'.length);
  const etape = etat.etapes.find((e) => e.id === id);
  if (!etape) return;
  await modifierAussitot(
    etape,
    { echeance: jour },
    () => api.modifierEtapeDuClub(id, { echeance: jour }),
    { rendre: () => { assembler(); redessiner(); },
      signaler: () => signaler("Ça n'a pas pu être enregistré — vérifie ta connexion.") },
  );
}

function brancher(section) {
  // LA SOURIS GLISSE, LE DOIGT CHOISIT PUIS TOUCHE. C'est la règle du hub depuis
  // « Ma semaine » : sur une liste verticale, un glissement au doigt ne se
  // distingue pas d'un défilement.
  brancherPriseEnMain(section, (cle, jour) => { poserSurUnJour(cle, jour); });

  // DÉPLACER UNE BARRE DÉJÀ POSÉE, et la ramener dans la colonne pour la
  // déprogrammer : les deux gestes de la page d'un projet, au trait près.
  brancherDeplacement(
    section,
    async (element, jour) => {
      if (element.type !== 'etape') return;
      await poserSurUnJour(`etape:${element.id}`, jour);
    },
    () => etat.elements,
    {
      zones: [{
        selecteur: '.projet-page-colonne',
        quand: async (element) => {
          if (element.type !== 'etape') return;
          const etape = etat.etapes.find((e) => e.id === element.id);
          if (!etape) return;
          await modifierAussitot(
            etape,
            { echeance: null },
            () => api.modifierEtapeDuClub(etape.id, { echeance: null }),
            { rendre: () => { assembler(); redessiner(); },
              signaler: () => signaler("Ça n'a pas pu être enregistré.") },
          );
        },
      }],
    },
  );

  // TOUCHER UN JOUR POSE CE QU'ON TIENT, et rien d'autre : la page ne crée ni
  // tâche ni évènement, donc un jour touché à vide n'a rien à ouvrir.
  //
  // `{ debut, fin }` ET NON UN JOUR : la sélection rend un INTERVALLE — on peut
  // glisser sur une série de jours —, et c'est son début qui date l'étape.
  // *Passé tel quel, l'objet finissait dans `echeance` et rien ne se posait.*
  //
  // DANS LA VUE ANNÉE, UNE SEMAINE S'OUVRE au lieu de se remplir : on ne pose
  // pas une chose « dans une semaine », on descend d'un cran pour voir où. C'est
  // la règle de la page d'un projet du hub.
  brancherSelection(section, ({ debut }) => {
    if (etat.choisie) {
      const cle = etat.choisie;
      etat.choisie = null;
      poserSurUnJour(cle, debut);
      return;
    }
    if (etat.vue === 'annee') {
      etat.vue = 'semaine';
      etat.ancre = depuisDateISO(debut);
      redessiner();
    }
  });

  // L'ENREGISTREMENT PASSE PAR LE FORMULAIRE, donc par son `submit` : c'est
  // l'exception écrite dans les conventions à l'écriture optimiste — un
  // formulaire a un endroit où dire l'échec, et il garde la saisie.
  section.addEventListener('submit', async (evenement) => {
    const formulaire = evenement.target.closest('[data-action="enregistrer-etape-club"]');
    if (!formulaire) return;
    evenement.preventDefault();
    evenement.stopPropagation();
    const champs = Object.fromEntries(new FormData(formulaire));
    const titre = (champs.titre ?? '').trim();
    if (!titre) return;
    const valeurs = { titre, echeance: champs.echeance || null };
    try {
      if (champs.id) {
        const etape = etat.etapes.find((e) => e.id === champs.id);
        Object.assign(etape, await api.modifierEtapeDuClub(champs.id, valeurs));
      } else {
        etat.etapes.push(await api.creerEtapeDuClub({
          projet_id: etat.projet.id, ordre: etat.etapes.length + 1, ...valeurs,
        }));
      }
      etat.edition = null;
      assembler();
      redessiner();
    } catch {
      signaler("L'étape n'a pas pu être enregistrée — vérifie ta connexion.");
    }
  });

  // LES GESTES DE CETTE PAGE NE REMONTENT PAS AU SITE, et c'est ce qui la fait
  // marcher du tout. `hermitage.js` écoute les clics de SA section — et il
  // connaît déjà `data-choisir` (l'idée qu'on prend en main au calendrier
  // éditorial), `data-vue-cal` et `data-periode` (la barre de son propre
  // calendrier). Les miens portent les mêmes noms, parce que ce sont les mêmes
  // briques : sans cette garde, choisir une étape faisait remonter le clic,
  // `rendre()` redessinait la page du site, `monter` repartait de zéro — et
  // l'étape qu'on venait de prendre en main était reposée avant qu'on ait touché
  // un jour. *Mesuré : l'échéance restait nulle, sans la moindre erreur.*
  //
  // L'HÔTE EST À L'INTÉRIEUR DE LA SECTION DU SITE, donc mon écouteur voit le
  // clic AVANT lui : arrêter la remontée ici suffit, et n'ôte rien au site — ce
  // qui est dans l'hôte appartient à cette page.
  const AMOI = '[data-ouvrir-projet], [data-choisir], [data-franchir], [data-ajout-etape],'
    + ' [data-menu], [data-action], [data-vue-cal], [data-periode]';

  section.addEventListener('click', async (evenement) => {
    if (evenement.target.closest(AMOI)) evenement.stopPropagation();

    const ouvrir = evenement.target.closest('[data-ouvrir-projet]');
    if (ouvrir) {
      ouvrir.disabled = true;
      try {
        etat.projet = await api.ouvrirProjetDuClub({
          cle: etat.declare.cle,
          titre: etat.declare.titre,
          objectif: etat.declare.objectif ?? null,
        });
        etat.etapes = [];
        assembler();
        redessiner();
      } catch {
        ouvrir.disabled = false;
        signaler("Le projet n'a pas pu être ouvert — vérifie ta connexion.");
      }
      return;
    }

    const choisir = evenement.target.closest('[data-choisir]');
    if (choisir) {
      const cle = choisir.dataset.choisir;
      etat.choisie = etat.choisie === cle ? null : cle;
      redessiner();
      return;
    }

    const franchir = evenement.target.closest('[data-franchir]');
    if (franchir) {
      const etape = etat.etapes.find((e) => e.id === franchir.dataset.franchir);
      if (!etape) return;
      const atteint = !etape.atteint;
      await modifierAussitot(
        etape,
        { atteint, date_atteint: atteint ? versDateISO(new Date()) : null },
        () => api.modifierEtapeDuClub(etape.id, {
          atteint, date_atteint: atteint ? versDateISO(new Date()) : null,
        }),
        { rendre: () => { assembler(); redessiner(); },
          signaler: () => signaler("Ça n'a pas pu être enregistré.") },
      );
      return;
    }

    if (evenement.target.closest('[data-ajout-etape]')) {
      etat.edition = {};
      redessiner();
      hote?.querySelector('#projet-club-etape-titre')?.focus();
      return;
    }

    // LE MENU RESTE OUVERT après un déplacement : une étape qui doit remonter de
    // trois rangs se déplace en trois appuis et non en neuf.
    const menu = evenement.target.closest('[data-menu]');
    if (menu) {
      etat.menu = etat.menu === menu.dataset.menu ? null : menu.dataset.menu;
      redessiner();
      return;
    }

    const bouger = evenement.target.closest('[data-action="monter-etape"], [data-action="descendre-etape"]');
    if (bouger) {
      // ON DÉPLACE DANS L'ORDRE AFFICHÉ, pas dans celui de la table : la date
      // range ce qui en a une, et « Monter » aurait échangé l'étape avec une
      // voisine que Noé ne voit pas à côté d'elle.
      const rangees = rangerParEcheance(etat.etapes);
      const i = rangees.findIndex((e) => e.id === bouger.dataset.valeur);
      const j = bouger.dataset.action === 'monter-etape' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= rangees.length) return;
      [rangees[i], rangees[j]] = [rangees[j], rangees[i]];
      etat.etapes = rangees;
      redessiner();
      try {
        await api.reordonnerEtapesDuClub(rangees);
      } catch {
        signaler("L'ordre n'a pas pu être enregistré.");
      }
      return;
    }

    const retirer = evenement.target.closest('[data-action="supprimer-etape"]');
    if (retirer) {
      const etape = etat.etapes.find((e) => e.id === retirer.dataset.valeur);
      if (!etape) return;
      etat.menu = null;
      await retirerAussitot(
        etat.etapes,
        etape,
        () => api.supprimerEtapeDuClub(etape.id),
        { rendre: () => { assembler(); redessiner(); },
          signaler: () => signaler("L'étape n'a pas pu être retirée.") },
      );
      return;
    }

    const modifier = evenement.target.closest('[data-action="modifier-etape"]');
    if (modifier) {
      etat.menu = null;
      etat.edition = { id: modifier.dataset.valeur };
      redessiner();
      return;
    }

    const vue = evenement.target.closest('[data-vue-cal]');
    if (vue) {
      etat.vue = vue.dataset.vueCal;
      redessiner();
      return;
    }

    const periode = evenement.target.closest('[data-periode]');
    if (periode) {
      const sens = Number(periode.dataset.periode);
      etat.ancre = sens === 0 ? new Date() : deplacerAncre(etat.ancre, etat.vue, sens);
      redessiner();
    }
  });

  // ET LES ÉVÈNEMENTS DE POINTEUR NON PLUS NE REMONTENT PAS, ce qui est le
  // second étage du même problème — et le plus retors, parce qu'il ne se voit
  // pas. `hermitage.js` appelle `brancherSelection` sur SA section : les cases
  // de MON calendrier sont dedans, donc toucher un jour ouvrait aussi la tuile
  // de capture du site, qui appelle `rendre()`, qui remonte cette page et
  // remplace `etat.etapes` par un tableau neuf. *L'écriture partait bien — la
  // base recevait l'échéance — mais l'objet qu'on venait de modifier n'était
  // plus celui de la liste, donc ni la frise ni la barre ne bougeaient. Un
  // rechargement montrait le bon résultat, ce qui est la pire façon de
  // s'apercevoir d'un défaut.*
  //
  // POSÉ EN DERNIER, DONC EXÉCUTÉ EN DERNIER : les écouteurs d'un même élément
  // partent dans l'ordre où on les pose, et ceux de cette page — la sélection,
  // la prise en main — doivent tourner AVANT qu'on coupe la remontée.
  for (const nom of ['pointerdown', 'pointerup', 'pointermove', 'pointercancel']) {
    section.addEventListener(nom, (evenement) => {
      if (evenement.target.closest('.cal-jour, .cal-barre-element, [data-poser]')) {
        evenement.stopPropagation();
      }
    });
  }
}
