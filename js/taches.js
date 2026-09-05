// Espace Tâches du hub — TOUT ce qu'il y a à faire, en un seul endroit.
//
// C'est la seule page du hub qui ne cache rien : datées ou non, faites ou non,
// tous espaces. Ailleurs le hub trie pour Noé — le dashboard ne montre que les
// actives du jour, un espace garde son backlog replié. Ici on vient
// justement pour voir l'ensemble, ranger, et repartir.
//
// La forme vient de Todoist (capture de Noé, 13 août 2026) : un cercle coloré
// par priorité qui coche la tâche, le titre, puis une ligne de service — la
// date à gauche, l'espace à droite.
//
// Ce qui NE vient pas de Todoist : la date passée n'est pas rouge. Todoist
// écrit « Hier » en rouge ; le hub n'a pas de couleur d'alerte et n'en aura pas
// (CLAUDE.md). Une échéance dépassée se dit du même gris que les autres.
//
// Pas de tâche perso, ici comme partout : l'espace perso n'a ni tâches, ni
// jalons, ni retard. Le sélecteur d'espace n'en propose pas.

import * as api from './api.js';
import {
  depuisDateISO,
  echeanceLisible,
  versDateISO,
  ajouterJours,
  echapper,
  NOMS_ESPACES,
  RECURRENCES,
  dureeLisible,
  FAMILLES_PERSO_CHOIX,
} from './format.js';
import { champDuree, marquerLaDuree, demanderLaDuree, fermerLaDuree } from './gabarits.js';
import { marquerLesEntrantes, animerLaCoche } from './mouvements.js';
import { ajouterAussitot, retirerAussitot, modifierAussitot } from './ecriture.js';

// Perso en fait partie depuis le 13 août 2026 (demande de Noé). C'est la seule
// entorse à la règle « pas de tâche perso » de CLAUDE.md, et elle est bornée :
// une tâche peut appartenir à la vie hors espaces, mais l'espace #perso, lui,
// n'affiche toujours ni tâche, ni jalon, ni progression. Une tâche perso se lit
// dans cette page, au calendrier et dans « Aujourd'hui ».
const ESPACES = {
  formation: 'Formation',
  photo: 'Yuno',
  fch: 'FC Hermitage',
  perso: 'Perso',
};

// 1 est le plus urgent, 4 le cas ordinaire — la convention de Todoist, et celle
// de la colonne en base. Les libellés sont courts : ils tiennent dans un
// sélecteur de ligne, à côté d'une date.
const PRIORITES = {
  1: 'P1 · urgent',
  2: 'P2 · important',
  3: 'P3 · à faire',
  4: 'P4 · sans presse',
};

// Le réglage backlog / active est MASQUÉ, et toute tâche naît active
// (décision de Noé, 13 août 2026 — « pour le moment »).
//
// Ce que ça change : `statut` ne distingue plus que « à faire » et « fait ».
// Le plafond de 3 actives par espace n'est donc plus jamais exercé — rien dans
// l'interface n'appelle `changerStatutTache`, et `creerTache` n'a jamais
// vérifié le plafond. Conséquence directe et assumée : le bloc « Aujourd'hui »
// du dashboard ne filtre plus, il montre les 9 premières tâches de la liste.
//
// La colonne, l'API et le libellé restent : c'est un réglage rangé, pas
// supprimé. Le jour où le plafond redevient utile, il n'y a qu'à réafficher la
// pastille — la règle métier, elle, est toujours en place dans `api.js`.
const STATUTS = {
  backlog: 'Backlog',
  actif: 'Active',
};

const STATUT_A_LA_CREATION = 'actif';

const FILTRES = { tout: 'Tous les espaces', ...ESPACES };

// Le glyphe de date, celui du calendrier commun — un dessin, pas un émoji.
const DATE_ICONE = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
  <path d="M3 10h18M8 3v4M16 3v4"></path>
</svg>`;

// --- Le tri ------------------------------------------------------------------
// Exporté pour être vérifiable seul : on lui donne un tableau, on lit l'ordre.
//
// Trois clés, dans cet ordre : la priorité, puis la date, puis l'ancienneté.
// Les tâches sans date passent APRÈS celles qui en ont, à priorité égale — une
// échéance est un engagement, pas une simple précision. C'est le seul endroit
// du hub où l'absence de date fait reculer quelque chose, et c'est assumé :
// cette page sert à choisir quoi faire.

export function trierTaches(taches) {
  return [...taches].sort(
    (a, b) =>
      (a.priorite ?? 4) - (b.priorite ?? 4) ||
      Number(Boolean(b.echeance)) - Number(Boolean(a.echeance)) ||
      String(a.echeance ?? '').localeCompare(String(b.echeance ?? '')) ||
      String(a.heure ?? '').localeCompare(String(b.heure ?? '')) ||
      String(a.created_at).localeCompare(String(b.created_at)),
  );
}

// Les faites se lisent à l'envers : la dernière terminée en haut, parce qu'on y
// vient pour vérifier ce qu'on vient de faire ou pour décocher une erreur.
export function trierFaites(taches) {
  return [...taches].sort((a, b) =>
    String(b.date_fait ?? b.created_at).localeCompare(String(a.date_fait ?? a.created_at)),
  );
}

export function filtrerParEspace(taches, espace) {
  return espace === 'tout' ? taches : taches.filter((tache) => tache.espace === espace);
}

// --- Le dessin ---------------------------------------------------------------

// Ce que dit la ligne de date. `heure` s'y ajoute quand la tâche en porte une —
// même convention qu'au calendrier : minuit n'existe pas, c'est « pas d'heure ».
function quandLisible(tache) {
  if (!tache.echeance) return '';
  const jour = echeanceLisible(depuisDateISO(tache.echeance));
  if (!tache.heure) return jour;

  // La durée ne se dit qu'avec une heure, et derrière elle : « jeu., 14:00 ·
  // 1 h 30 » se lit d'un trait. Sans heure elle n'existe pas — une tâche qui
  // arrive dans la journée n'occupe pas de créneau.
  const combien = dureeLisible(tache.duree);
  return `${jour}, ${tache.heure.slice(0, 5)}${combien ? ` · ${combien}` : ''}`;
}

// `ouvrable` et `supprimable` sont à faux quand la ligne est empruntée par le
// dashboard : là-bas il n'y a pas de tuile pour corriger, et supprimer une
// tâche n'a rien à faire dans un check-in du matin. Le cercle, lui, se coche
// partout — c'est le geste de la page.
// `espace` à false : le nom de l'espace ne s'écrit pas. Sur la page d'un espace,
// il serait dit à chaque ligne alors que toute la page ne parle que de lui
// (demande de Noé, 26 août 2026). Ailleurs — l'espace Tâches, l'accueil — les
// espaces se mêlent, et le nom reste indispensable.
// `titre` à false : la ligne ne dit que sa date. C'est le cas d'une occurrence
// rangée sous sa série (« Ce qui revient ») — le sommaire vient d'écrire le
// titre, et le redire quinze fois de suite ne dit rien de plus. Le nom complet
// reste dans le nom accessible du bouton, où il ne prend aucune place.
// `projets` : la liste de l'écran, pour écrire le nom du projet servi à côté de
// l'espace. Sans elle, la ligne ne dit pas ce qu'elle sert — et on ne voit pas
// d'un coup d'œil ce qui est rattaché de ce qui ne l'est pas.
// LE REPORT, en un geste (29 août 2026, demande de Noé). C'est le geste le plus
// fréquent d'un système à soixante tâches, et il n'existait pas : il fallait
// ouvrir la tuile et changer le champ.
//
// UNE SEULE SIGNIFICATION — à demain. Pour une autre date, la ligne s'ouvre
// déjà d'un doigt sur son titre : deux gestes, mais choisis. Un appui long qui
// ferait autre chose serait invisible et ne se devinerait jamais.
//
// Sur une occurrence de série, il déplace CETTE occurrence et rien d'autre —
// la règle du 27 août : « on en modifie une sans changer la série ».
const SIGNE_REPORT = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M4 12h11"></path><path d="m11 8 4 4-4 4"></path><path d="M20 5v14"></path></svg>`;

// LE MENU À TROIS POINTS (29 août 2026, demande de Noé). Il ne porte QUE ce
// qu'on ne peut pas atteindre autrement depuis l'écran où il vit :
//
//   la PRIORITÉ — elle change souvent, et ouvrir la tuile pour un chiffre
//                 coûte trois gestes là où il en faut deux ;
//   SUPPRIMER   — depuis l'accueil, il fallait aller dans l'espace Tâches.
//
// Ce qu'il ne porte PAS, et volontairement : « rattacher à un projet ». Ce
// serait un menu qui ouvre la tuile, or la tuile s'ouvre déjà en touchant le
// titre — un raccourci vers un geste existant n'est pas un raccourci.
//
// Un `<details>` et non un état à tenir : le hub en a déjà quatorze pour ses
// formulaires, il porte son ouverture tout seul, et le sommaire est un vrai
// bouton au clavier. Ce qui EFFACE demande confirmation nulle part ici — la
// tâche revient d'un geste tant que l'écran ne l'a pas oubliée.
const SIGNE_POINTS = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"
  aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="1.6"/>
  <circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>`;

// Ce que le hub a posé lui-même, et le mot qui le dit. Rien pour le reste :
// une tâche écrite à la main n'a pas à se justifier.
const ORIGINES = {
  preparation: 'Préparation',
  tri: "Après l'événement",
};

function ligneTache(
  tache,
  {
    ouvrable = true,
    supprimable = true,
    espace = true,
    titre = true,
    projets = [],
    reportable = false,
    menu = false,
  } = {},
) {
  const projetServi = tache.projet_id
    ? projets.find((candidat) => candidat.id === tache.projet_id)
    : null;
  const faite = tache.statut === 'fait';
  const quand = quandLisible(tache);

  // La priorité se dit par la COULEUR du cercle, et Noé l'a voulue ainsi (13 août
  // 2026) : l'écrire dans la ligne redisait deux fois la même chose. Mais une
  // information portée par la seule couleur n'existe pas pour qui ne la
  // distingue pas (WCAG 1.4.1) : elle rejoint donc le nom du bouton et son
  // infobulle, où elle ne prend aucune place à l'écran.
  //
  // Rien pour une priorité 4 : c'est le cas ordinaire, et la tuile l'écrit déjà
  // « Priorité » et non « Priorité 4 ». Ne rien dire, c'est dire l'ordinaire.
  const rang = tache.priorite && tache.priorite < 4 ? ` · ${PRIORITES[tache.priorite]}` : '';

  // D'OÙ ELLE VIENT, quand ce n'est pas Noé qui l'a écrite (29 août 2026). Une
  // tâche apparue toute seule au milieu des siennes ressemblerait à une erreur ;
  // deux mots suffisent à dire que le hub l'a posée, et pourquoi.
  const venue = ORIGINES[tache.origine] ?? null;

  return `
    <li class="tache-ligne${faite ? ' tache-faite' : ''}"
      data-espace="${echapper(tache.espace)}" data-priorite="${tache.priorite ?? 4}">
      <button type="button" class="tache-cercle" data-cocher="${echapper(tache.id)}"
        aria-pressed="${faite}"
        aria-label="${faite ? 'Rouvrir' : 'Marquer comme faite'} « ${echapper(
          tache.titre,
        )} »${rang}"
        title="${faite ? 'Rouvrir' : 'Marquer comme faite'}${rang}"></button>

      <!-- Toute la ligne rouvre la tuile pour corriger (demande de Noé,
           13 août 2026). C'est un vrai bouton, pas une ligne qui écoute les
           clics : au clavier comme au lecteur d'écran, une tâche s'ouvre.
           La priorité n'est plus écrite ici — le cercle la dit par sa couleur,
           et deux fois la même information encombre la ligne de service. Elle
           se corrige dans la tuile, avec le reste. -->
      <${ouvrable ? 'button' : 'span'} class="tache-corps"
        ${ouvrable ? `type="button" data-ouvrir="${echapper(tache.id)}"` : ''}
        ${ouvrable ? `aria-label="Modifier « ${echapper(tache.titre)} »"` : ''}>
        <span class="tache-titre">${
          titre ? echapper(tache.titre) : `${DATE_ICONE}${echapper(quand || 'sans date')}`
        }</span>
        <span class="tache-service">
          ${venue ? `<span class="tache-venue">${echapper(venue)}</span>` : ''}
          ${
            titre && quand ? `<span class="tache-quand">${DATE_ICONE}${echapper(quand)}</span>` : ''
          }
          ${
            espace
              ? `<span class="tache-espace">${echapper(
                  NOMS_ESPACES[tache.espace] ?? tache.espace,
                )}</span>`
              : ''
          }
          ${
            projetServi
              ? `<span class="tache-projet">${echapper(projetServi.nom)}</span>`
              : ''
          }
        </span>
      </${ouvrable ? 'button' : 'span'}>

      ${
        menu
          ? `<details class="tache-menu">
               <summary class="tache-menu-bouton"
                 title="Priorité, supprimer"
                 aria-label="Autres gestes sur « ${echapper(tache.titre)} »"
                 >${SIGNE_POINTS}</summary>
               <div class="tache-menu-choix">
                 ${Object.entries(PRIORITES)
                   .map(
                     ([niveau, mot]) => `<button type="button"
                        data-priorite-vers="${echapper(tache.id)}:${niveau}"
                        ${Number(niveau) === (tache.priorite ?? 4) ? 'aria-current="true"' : ''}
                        >${echapper(mot)}</button>`,
                   )
                   .join('')}
                 <button type="button" class="tache-menu-retirer"
                   data-supprimer="${echapper(tache.id)}">Supprimer</button>
               </div>
             </details>`
          : ''
      }
      ${
        reportable && !faite
          ? `<button type="button" class="bouton-mini bouton-reporter"
               data-reporter="${echapper(tache.id)}"
               title="Reporter à demain"
               aria-label="Reporter « ${echapper(tache.titre)} » à demain"
               >${SIGNE_REPORT}</button>`
          : ''
      }
      ${
        supprimable
          ? `<button type="button" class="lien-discret bouton-mini bouton-retirer"
               data-supprimer="${echapper(tache.id)}"
               title="Supprimer cette tâche"
               aria-label="Supprimer « ${echapper(tache.titre)} »">×</button>`
          : ''
      }
    </li>`;
}

// La même liste, empruntable ailleurs. Le dashboard s'en sert pour son bloc
// « Aujourd'hui » : une tâche se lit pareil partout, c'est ce qui fait qu'on la
// reconnaît sans réfléchir.
export function construireLignesTaches(taches, options = {}) {
  return `<ul class="liste-taches-pleine">${taches
    .map((tache) => ligneTache(tache, options))
    .join('')}</ul>`;
}

// Cocher une tâche depuis une liste de tableau de bord — la page Yuno, celle du
// FCH, celle de la formation. Le geste est posé ICI, une fois : trois copies du
// même clic finiraient par se contredire, et la première version de ces pages
// avait justement oublié de le poser du tout — les cercles y étaient des
// boutons morts (défaut trouvé et corrigé le 26 août 2026).
//
// L'espace Tâches et l'accueil gardent le leur : ils offrent en plus la fenêtre
// d'annulation de six secondes, que ces pages n'ont pas.
export async function cocherDepuisTableauDeBord(cercle, taches, rendre) {
  const tache = taches.find((candidate) => candidate.id === cercle.dataset.cocher);
  if (!tache || tache.statut === 'fait') return;

  // COCHER EST UNE INTENTION, pas un fait acquis (demande de Noé, 27 août
  // 2026) : la fenêtre de durée s'ouvre d'abord, et rien n'est écrit tant
  // qu'elle n'est pas confirmée. La refermer laisse la tâche à faire.
  demanderLaDuree(tache, async (minutes) => {
    // On voit la coche se poser, PUIS la ligne s'en va.
    await animerLaCoche(cercle);

    const avant = { ...tache };
    const champs = { statut: 'fait', date_fait: new Date().toISOString() };
    if (minutes !== null) champs.duree = minutes;

    // Chaque occurrence d'une série est une ligne à elle : celle-ci se termine
    // comme n'importe quelle tâche, et celle de la semaine prochaine attend.
    await modifierAussitot(
      tache,
      champs,
      async () => {
        // La durée d'abord : `terminerTache` relit la ligne après coup, elle
        // repart donc complète, et un seul rendu suffit.
        if (minutes !== null) await api.modifierTache(tache.id, { duree: minutes });
        return (await api.terminerTache(avant)).tache;
      },
      { rendre },
    );
  });
}

// Exportée pour être vérifiable seule, avec des tâches factices.
// Le refus des 3 tâches actives par espace n'est pas une erreur : c'est la
// règle du hub qui parle, et elle propose une sortie. Elle se dit donc en
// ligne, du même ton que le reste — pas dans une boîte native qui bloque la
// page pour annoncer quelque chose de prévu.
function construireMessage(message) {
  return message ? `<p class="discret message-regle">${echapper(message)}</p>` : '';
}

// Une série ne se montre pas seize fois dans « À faire » (demande de Noé,
// 27 août 2026). Depuis que la répétition fabrique de vraies lignes, une
// rubrique hebdomadaire pose une occurrence par semaine sur seize semaines :
// toutes dans la même liste, elles noieraient les quatre choses qu'il y a
// vraiment à faire aujourd'hui.
//
// Seule la PROCHAINE occurrence de chaque série reste dans « À faire ». Les
// suivantes ne sont pas à faire, elles sont à venir : elles se relisent en
// dessous, rangées par série, dans un bloc qui ne s'impose pas au regard.
//
// « Prochaine » veut dire la plus proche, pas la première à venir : une
// occurrence dont le jour est passé reste devant. Le hub ne compte pas les
// retards, mais il ne les efface pas non plus — c'est la règle d'« Aujourd'hui ».
//
// Exportée pour être vérifiable seule, avec des tâches factices.
export function separerLesSeries(taches) {
  const seules = [];
  const parSerie = new Map();

  for (const tache of taches) {
    if (!tache.serie_id) {
      seules.push(tache);
      continue;
    }
    const deja = parSerie.get(tache.serie_id);
    if (deja) deja.push(tache);
    else parSerie.set(tache.serie_id, [tache]);
  }

  const prochaines = [];
  const series = [];

  for (const occurrences of parSerie.values()) {
    const triees = [...occurrences].sort((a, b) =>
      String(a.echeance ?? '').localeCompare(String(b.echeance ?? '')),
    );
    prochaines.push(triees[0]);
    if (triees.length > 1) series.push(triees.slice(1));
  }

  return { aFaire: [...seules, ...prochaines], series };
}

function blocDUneSerie(occurrences) {
  const [premiere] = occurrences;
  const rythme = RECURRENCES[premiere.recurrence];

  return `
    <details class="backlog serie-repliee">
      <summary>
        <span class="serie-titre">${echapper(premiere.titre)}</span>
        ${rythme ? `<span class="serie-rythme">${echapper(rythme.toLowerCase())}</span>` : ''}
        <span class="chiffre">${occurrences.length}</span>
      </summary>
      ${construireLignesTaches(occurrences, { titre: false, espace: false })}
    </details>`;
}

export function construireListe(taches, message = null, projets = []) {
  const { aFaire: candidates, series } = separerLesSeries(
    taches.filter((tache) => tache.statut !== 'fait'),
  );
  const aFaire = trierTaches(candidates);
  const faites = trierFaites(taches.filter((tache) => tache.statut === 'fait'));
  const aVenir = series.reduce((total, occurrences) => total + occurrences.length, 0);

  const bloc = (liste) => construireLignesTaches(liste, { projets });

  return `
    ${construireMessage(message)}
    <section class="bloc">
      <h2>À faire <span class="chiffre">${aFaire.length}</span></h2>
      ${
        aFaire.length
          ? bloc(aFaire)
          : `<p class="vide">Rien à faire ici. Note ta prochaine tâche au-dessus.</p>`
      }
    </section>

    ${
      series.length
        ? `<section class="bloc bloc-discret">
             <h2>Ce qui revient <span class="chiffre">${aVenir}</span></h2>
             <p class="discret sous-titre">La prochaine fois de chaque série est restée
               au-dessus. Voici ce qui suit.</p>
             ${series
               .sort((a, b) => String(a[0].echeance).localeCompare(String(b[0].echeance)))
               .map(blocDUneSerie)
               .join('')}
           </section>`
        : ''
    }

    ${
      faites.length
        ? `<section class="bloc bloc-discret">
             <details class="backlog">
               <summary>Faites <span class="chiffre">${faites.length}</span></summary>
               ${bloc(faites)}
             </details>
           </section>`
        : ''
    }`;
}

function construireFiltres(actif) {
  return `
    <div class="filtres" role="group" aria-label="Filtrer par espace">
      ${Object.entries(FILTRES)
        .map(
          ([valeur, libelle]) => `
        <button type="button" data-filtre-espace="${valeur}"
          aria-pressed="${valeur === actif}"
          class="${valeur === actif ? 'actif' : ''}">${echapper(libelle)}</button>`,
        )
        .join('')}
    </div>`;
}

// --- La capture --------------------------------------------------------------
// La forme vient du deuxième jeu de captures de Noé (13 août) : un « + » qui
// ouvre une tuile, le nom de la tâche qu'on écrit directement, et en dessous
// une rangée de pastilles — date, espace, priorité — dont chacune ouvre son
// choix.
//
// Pourquoi ça vaut mieux qu'un formulaire à six champs empilés : une tâche se
// note en trois secondes, entre deux choses. Le nom suffit à la créer ; le
// reste se pose quand on en a envie, et se voit d'un coup d'œil parce qu'une
// pastille renseignée affiche sa valeur.

const RACCOURCIS_DATE = () => {
  const aujourdhui = new Date();
  // Index dans une semaine qui commence le lundi : lundi 0 … samedi 5, dimanche 6.
  // (`getDay()` compte à partir du dimanche, d'où le décalage.)
  const jour = (aujourdhui.getDay() + 6) % 7;
  // « Ce week-end », c'est samedi — sauf si on y est déjà, auquel cas c'est
  // aujourd'hui : un samedi, personne n'entend « samedi prochain ».
  const joursAuSamedi = jour >= 5 ? 0 : 5 - jour;
  const joursAuLundi = (7 - jour) % 7 || 7;

  return [
    ['Aujourd’hui', versDateISO(aujourdhui)],
    ['Demain', versDateISO(ajouterJours(aujourdhui, 1))],
    ['Ce week-end', versDateISO(ajouterJours(aujourdhui, joursAuSamedi))],
    ['Semaine prochaine', versDateISO(ajouterJours(aujourdhui, joursAuLundi))],
  ];
};

// Le jour de la semaine, à droite du raccourci — comme dans la capture : on
// choisit « Ce week-end » en sachant que c'est samedi.
function jourCourt(cle) {
  return depuisDateISO(cle).toLocaleDateString('fr-FR', { weekday: 'short' });
}

const PASTILLE_DATE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path>
</svg>`;

// Le drapeau de priorité, comme dans Todoist : plein et coloré de 1 à 3, vide
// pour la 4 — le cas ordinaire ne se colore pas. La hampe reste toujours un
// trait ; seule la toile se remplit.
const DRAPEAU = (rempli, taille = 18) => `<svg viewBox="0 0 24 24"
  width="${taille}" height="${taille}" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M5 22V3"></path>
  <path d="M5 3.5h13l-2.4 4.6L18 13H5z" fill="${rempli ? 'currentColor' : 'none'}"></path>
</svg>`;

const PASTILLE_PRIORITE = DRAPEAU(false, 14);

const PLUS = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
  aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>`;

const FLECHE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M12 19V5M5 12l7-7 7 7"></path>
</svg>`;

const PASTILLE_ESPACE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M10 3 8 21M16 3l-2 18M3.5 8.5h17M3 15.5h17"></path>
</svg>`;

// La flèche qui tourne : le signe de la répétition partout, y compris dans la
// tuile du calendrier — un même geste, un même dessin.
const PASTILLE_REPETITION = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M17 2l4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
  <path d="M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
</svg>`;

// `data-pastille` sur le bouton, `data-panneau` sur le panneau : les deux
// portaient le même nom d'attribut, et un sélecteur ne savait plus lequel il
// visait depuis que les panneaux vivent en permanence dans le DOM.
// `cachee` : une pastille qui n'a de sens que pour UN espace. Elle reste dans
// le DOM et suit le choix de l'espace (voir `majPastilles`) — la retirer et la
// remettre redessinerait la tuile, donc refermerait le clavier.
function pastille(nom, icone, texte, { rempli = false, priorite = null, cachee = false } = {}) {
  return `<button type="button" class="pastille-capture${rempli ? ' remplie' : ''}"
    data-pastille="${nom}" aria-expanded="false" ${cachee ? 'hidden' : ''}
    ${priorite ? `data-priorite="${priorite}"` : ''}>${icone}<span>${echapper(texte)}</span></button>`;
}

function panneauDate(capture) {
  return `
    <div class="capture-popover" data-panneau="date" hidden>
      <ul class="raccourcis-date">
        ${RACCOURCIS_DATE()
          .map(
            ([libelle, cle]) => `
          <li><button type="button" data-poser-date="${cle}">
            <span>${libelle}</span>
            <span class="discret">${echapper(jourCourt(cle))}</span>
          </button></li>`,
          )
          .join('')}
      </ul>
      <!-- Les deux champs côte à côte, et des libellés courts : empilés, ils
           poussaient les raccourcis hors de l'écran dès que le clavier montait.
           « Aujourd'hui » devenait invisible, donc intouchable. -->
      <div class="capture-deux-champs">
        <span>
          <label class="champ-capture" for="capture-date">Un autre jour</label>
          <input type="date" id="capture-date" data-champ-date value="${echapper(capture.echeance ?? '')}">
        </span>
        <span>
          <label class="champ-capture" for="capture-heure">Heure</label>
          <input type="time" id="capture-heure" data-champ-heure value="${echapper(capture.heure ?? '')}">
        </span>
      </div>
      <!-- Combien de temps la tâche prend (26 août 2026). Dans le panneau de
           la date et non dans une pastille à elle : c'est la même question que
           « quand » — un créneau, c'est un début et une longueur — et la bande
           de pastilles a sa réserve, pas son confort. Elle ne vaut qu'avec une
           heure, et le libellé le dit plutôt qu'un champ qui se grise.
           Le champ lui-même vient des gabarits communs : la tuile du calendrier
           pose exactement le même, et deux copies finiraient par ne plus
           proposer les mêmes pas. -->
      ${champDuree({ id: 'capture-duree', valeur: capture.duree })}
      ${
        capture.echeance
          ? `<button type="button" class="lien-discret" data-poser-date="">Retirer la date</button>`
          : ''
      }
    </div>`;
}

// Le menu de priorité de Todoist, au plus près : un drapeau coloré, le libellé
// en toutes lettres, et un filet entre les lignes. Rien d'autre — pas de coche,
// pas d'accent : c'est le drapeau qui dit lequel est choisi, et le fond de la
// ligne survolée qui dit où l'on est.
function panneauPriorite(valeurCourante) {
  return `
    <div class="capture-popover capture-popover-etroit" data-panneau="priorite" hidden>
      <ul class="choix-capture">
        ${[1, 2, 3, 4]
          .map(
            (rang) => `
          <li><button type="button" data-poser-priorite="${rang}" data-priorite="${rang}"
            aria-pressed="${rang === Number(valeurCourante)}"
            class="${rang === Number(valeurCourante) ? 'actif' : ''}">
            <span class="choix-drapeau">${DRAPEAU(rang !== 4)}</span>
            <span>Priorité ${rang}</span>
          </button></li>`,
          )
          .join('')}
      </ul>
    </div>`;
}

// La répétition d'une tâche (26 août 2026) — mêmes mots que pour un événement.
// Elle n'a de sens qu'avec une date : sans échéance, il n'y a rien à répéter.
// La pastille reste offerte, et c'est l'écriture qui l'ignore le cas échéant.
function panneauRepetition(valeurCourante) {
  return `
    <div class="capture-popover capture-popover-etroit" data-panneau="repetition" hidden>
      <ul class="choix-capture">
        ${Object.entries(RECURRENCES)
          .map(
            ([valeur, libelle]) => `
          <li><button type="button" data-poser-repetition="${valeur}"
            aria-pressed="${valeur === (valeurCourante ?? '')}"
            class="${valeur === (valeurCourante ?? '') ? 'actif' : ''}">
            <span>${echapper(libelle)}</span>
          </button></li>`,
          )
          .join('')}
      </ul>
    </div>`;
}

// Le PROJET d'une tâche : l'étage entre le jalon et l'action (27 août 2026).
// Il n'est jamais obligatoire — une tâche sans projet reste légitime, c'est de
// l'intendance, et bloquer la capture pour ça serait payer très cher un lien
// qu'on peut poser après. Seuls les projets de l'espace choisi sont proposés :
// une tâche du club n'a rien à faire dans un projet de Yuno.
const PASTILLE_PROJET = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 12l9 4 9-4"/>
  <path d="M3 17l9 4 9-4"/></svg>`;

// La famille d'un moment perso : ce que ce moment sert — le corps, le calme,
// le lien, ou rien de tout ça (l'intendance). Une feuille pour signe : ce n'est
// pas du travail qu'on range là.
const PASTILLE_FAMILLE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M4 21c0-9 5.5-14.5 16-15 .7 9.5-4.5 15-13 15z"></path>
  <path d="M4 21c1.5-5 4.5-8.5 9-10.5"></path>
</svg>`;

function panneauFamille(valeurCourante) {
  return `
    <div class="capture-popover capture-popover-etroit" data-panneau="famille" hidden>
      <ul class="choix-capture">
        ${Object.entries(FAMILLES_PERSO_CHOIX)
          .map(
            ([valeur, libelle]) => `
          <li><button type="button" data-poser-famille="${valeur}"
            aria-pressed="${valeur === (valeurCourante ?? '')}"
            class="${valeur === (valeurCourante ?? '') ? 'actif' : ''}">
            <span>${echapper(libelle)}</span>
          </button></li>`,
          )
          .join('')}
      </ul>
      <p class="discret cal-note-nature">L'intendance ne repose de rien : elle se
        fait, elle ne remplace ni une séance, ni un moment de calme, ni
        quelqu'un de vu.</p>
    </div>`;
}

function panneauProjet(projets, valeurCourante) {
  const offerts = projets.filter((projet) => projet.statut === 'actif' || projet.id === valeurCourante);

  return `
    <div class="capture-popover capture-popover-etroit" data-panneau="projet" hidden>
      <ul class="choix-capture">
        <li><button type="button" data-poser-projet=""
          aria-pressed="${!valeurCourante}" class="${!valeurCourante ? 'actif' : ''}">
          <span>Aucun projet</span>
        </button></li>
        ${offerts
          .map(
            (projet) => `
          <li><button type="button" data-poser-projet="${echapper(projet.id)}"
            aria-pressed="${projet.id === valeurCourante}"
            class="${projet.id === valeurCourante ? 'actif' : ''}">
            <span>${echapper(projet.nom)}</span>
          </button></li>`,
          )
          .join('')}
        ${
          offerts.length
            ? ''
            : `<li><p class="vide">Aucun projet dans cet espace. Ils se créent
                 dans « Le cap ».</p></li>`
        }
      </ul>
    </div>`;
}

function panneauEspace(valeurCourante) {
  return `
    <div class="capture-popover capture-popover-etroit" data-panneau="espace" hidden>
      <ul class="choix-capture">
        ${Object.entries(ESPACES)
          .map(
            ([valeur, libelle]) => `
          <li><button type="button" data-poser-espace="${valeur}" data-espace="${valeur}"
            aria-pressed="${valeur === valeurCourante}"
            class="${valeur === valeurCourante ? 'actif' : ''}">
            <span class="choix-pastille" aria-hidden="true"></span>
            <span>${echapper(libelle)}</span>
          </button></li>`,
          )
          .join('')}
      </ul>
    </div>`;
}

// Ce que la pastille de date affiche une fois remplie : le mot du jour plutôt
// que la date brute, comme partout dans le hub.
function dateLisible(capture) {
  if (!capture.echeance) return 'Date';
  const jour = echeanceLisible(depuisDateISO(capture.echeance));
  if (!capture.heure) return jour;

  const combien = dureeLisible(capture.duree);
  return `${jour}, ${capture.heure.slice(0, 5)}${combien ? ` · ${combien}` : ''}`;
}

export function construireCapture(capture, projets = []) {
  // Le « + » reste en place quand la tuile s'ouvre : elle vole au-dessus de la
  // page, elle ne la remplace pas. Sans lui, la liste remonterait d'un cran à
  // chaque ouverture et redescendrait à la fermeture.
  // Le bouton flotte en bas à droite de l'écran, dans un rond plein (demande de
  // Noé, 13 août 2026). Il ne porte plus son libellé en toutes lettres : à cette
  // place et sous cette forme, un « + » est compris — le nom passe dans
  // l'infobulle et dans l'étiquette lue à voix haute.
  const bouton = `<button type="button" class="ouvrir-capture" data-ouvrir-capture
    title="Ajouter une tâche" aria-label="Ajouter une tâche">${PLUS}</button>`;

  if (!capture.ouverte) return bouton;

  return `
    ${bouton}
    <div class="fenetre-fond capture-fond" data-fermer-capture></div>
    <form class="capture" data-action="creer-tache" role="dialog" aria-modal="true"
      aria-label="Ajouter une tâche">
      <input type="text" id="capture-titre" name="titre" required
        class="capture-titre" placeholder="Nom de la tâche" autocomplete="off"
        aria-label="Nom de la tâche" value="${echapper(capture.titre)}">

      <div class="capture-pastilles">
        <!-- Les pastilles vivent dans une bande qui défile latéralement, jamais
             sur deux lignes : c'est le bouton d'envoi qui prime, il ne bouge
             pas d'un pixel quelle que soit leur nombre ou leur longueur. -->
        <div class="capture-pastilles-liste">
          ${pastille('date', PASTILLE_DATE, dateLisible(capture), { rempli: Boolean(capture.echeance) })}
          ${pastille('espace', PASTILLE_ESPACE, ESPACES[capture.espace], { rempli: true })}
          <!-- La famille ne se demande QUE dans l'espace perso : ailleurs, la
               question n'a pas de sens. Elle apparaît et disparaît avec le
               choix de l'espace, sans que la tuile se redessine.
               Juste derrière l'espace, et non en queue : la bande DÉFILE,
               une pastille sixième sur six vit hors de l'écran. -->
          ${pastille(
            'famille',
            PASTILLE_FAMILLE,
            capture.famille ? FAMILLES_PERSO_CHOIX[capture.famille] : 'Famille',
            { rempli: Boolean(capture.famille), cachee: capture.espace !== 'perso' },
          )}
          ${pastille('priorite', PASTILLE_PRIORITE, capture.priorite === 4 ? 'Priorité' : `P${capture.priorite}`, {
            rempli: capture.priorite !== 4,
            priorite: capture.priorite,
          })}
          ${pastille('repetition', PASTILLE_REPETITION, RECURRENCES[capture.recurrence ?? ''], {
            rempli: Boolean(capture.recurrence),
          })}
          ${pastille(
            'projet',
            PASTILLE_PROJET,
            projets.find((projet) => projet.id === capture.projet_id)?.nom ?? 'Projet',
            { rempli: Boolean(capture.projet_id) },
          )}
        </div>
        <!-- Une flèche dans un rond plutôt qu'un mot (demande de Noé, sur le
             modèle) : la tuile n'a qu'une action, elle n'a pas besoin d'être
             nommée. Éteinte tant qu'il n'y a pas de titre — c'est la seule
             chose que la tâche exige. -->
        <button type="submit" class="capture-envoyer" ${capture.titre.trim() ? '' : 'disabled'}
          aria-label="Ajouter la tâche" title="Ajouter la tâche">${FLECHE}</button>
      </div>

      <!-- Les trois panneaux sont TOUJOURS dans le DOM, masqués. C'est ce qui
           permet d'ouvrir une pastille sans redessiner la tuile — et donc sans
           détruire le champ du titre. Sur téléphone, détruire ce champ referme
           le clavier : la tuile se replaçait alors au milieu d'un écran soudain
           plus grand, et sautait à chaque pastille touchée. -->
      ${panneauDate(capture)}
      ${panneauEspace(capture.espace)}
      ${panneauPriorite(capture.priorite)}
      ${panneauRepetition(capture.recurrence)}
      ${panneauProjet(projets.filter((projet) => projet.espace === capture.espace), capture.projet_id)}
      ${panneauFamille(capture.famille)}

      ${
        capture.confirmationSortie
          ? `<p class="capture-confirmation">
               <span>Abandonner cette tâche ?</span>
               <span class="capture-confirmation-choix">
                 <button type="button" class="lien-discret" data-continuer-capture>Continuer</button>
                 <button type="button" class="bouton-secondaire bouton-mini"
                   data-abandonner-capture>Abandonner</button>
               </span>
             </p>`
          : ''
      }

      <p class="message-erreur" data-erreur hidden></p>
    </form>`;
}

function squelette(etat) {
  return `
    <h1>Mes tâches</h1>
    <p class="discret sous-titre">Tout ce qu'il y a à faire, tous espaces — daté ou non.</p>
    <div data-bloc="capture">${construireCapture(etat.capture, etat.projets)}</div>
    ${construireFiltres(etat.espace)}
    <div data-bloc="liste"><p class="vide">…</p></div>`;
}

// --- Montage -----------------------------------------------------------------

export default {
  async monter(section, route) {
    const captureVierge = (espace) => ({
      ouverte: false,
      // L'identifiant de la tâche qu'on corrige. `null` = on en crée une.
      // La tuile est la même dans les deux cas : c'est le seul écran où une
      // tâche se décrit, autant s'en servir aussi pour la reprendre.
      id: null,
      titre: '',
      echeance: null,
      heure: null,
      // Combien de temps elle prend, en minutes. `null` = sans durée, et c'est
      // le cas ordinaire : la plupart des tâches arrivent à un moment sans
      // occuper de créneau. Elle ne s'écrit qu'avec une heure.
      duree: null,
      // L'espace suit le filtre courant : sur « Formation », la tâche qu'on
      // note est presque toujours une tâche de formation. Sur « Tous », le FCH
      // par défaut — c'est là que le travail quotidien de Noé se passe.
      espace: ESPACES[espace] ? espace : 'fch',
      priorite: 4,
      // Le projet servi, ou rien. Voir `panneauProjet`.
      projet_id: null,
      // La famille d'un moment perso — corps, calme, lien, intendance. Nulle
      // partout ailleurs : l'écriture l'écarte quand l'espace n'est pas perso.
      famille: null,
      // Nulle = une seule fois. Voir `terminerTache` (js/api.js) : une tâche
      // répétée ne se termine pas, elle glisse à l'occurrence suivante.
      recurrence: null,
      panneau: null,
      confirmationSortie: false,
    });

    // Y a-t-il quelque chose à perdre ? Le titre vit dans le champ tant qu'on
    // tape, d'où la lecture du DOM. L'espace ne compte pas : il a un défaut,
    // le laisser tel quel n'est pas un travail commencé.
    const captureRemplie = () =>
      Boolean(
        (section.querySelector('#capture-titre')?.value ?? etat.capture.titre).trim() ||
          etat.capture.echeance ||
          etat.capture.priorite !== 4,
      );

    // Fermer, en demandant seulement s'il y a de quoi regretter. Confirmer
    // l'abandon d'une tuile vide serait une question pour rien.
    const quitterLaCapture = () => {
      if (!captureRemplie()) {
        etat.capture = captureVierge(etat.espace);
        rendreCapture();
        oublierLeClavier();
        return;
      }
      etat.capture.titre = section.querySelector('#capture-titre')?.value ?? etat.capture.titre;
      etat.capture.panneau = null;
      etat.capture.confirmationSortie = true;
      rendreCapture();
    };

    const etat = {
      taches: [],
      projets: [],
      // Le filtre vient de l'adresse : `#taches/fch` (28 août 2026). C'est
      // ainsi que le menu offre « ses tâches » à chaque espace — la même page,
      // son filtre déjà posé, et non un cinquième écran de liste.
      espace: ESPACES[route?.vue] ? route.vue : 'tout',
      message: null,
      capture: captureVierge(ESPACES[route?.vue] ? route.vue : 'tout'),
    };

    // Les tâches dont une écriture optimiste est en vol : l'écran a déjà
    // changé, le serveur pas encore. Un identifiant y reste le temps de
    // l'aller-retour, pour qu'un second appui n'envoie pas d'ordre contraire.
    const ecrituresEnVol = new Set();

    section.innerHTML = squelette(etat);

    // Ce qui a déjà été vu à l'écran : une ligne absente de cette mémoire vient
    // d'arriver, et elle seule fait son entrée en fondu.
    const lignesVues = new Set();

    const rendreListe = () => {
      const cible = section.querySelector('[data-bloc="liste"]');
      if (cible) {
        cible.innerHTML = construireListe(
          filtrerParEspace(etat.taches, etat.espace),
          etat.message,
          etat.projets,
        );
        marquerLesEntrantes(cible, lignesVues, {
          selecteur: '.tache-ligne',
          cle: (ligne) => ligne.querySelector('[data-cocher]')?.dataset.cocher,
        });
      }
    };

    // De quel côté la bande de pastilles a-t-elle encore de la réserve ? La
    // feuille de style s'en sert pour poser un fondu du bon côté, et seulement
    // là où il reste quelque chose à voir.
    const marquerLeDebordement = () => {
      const bande = section.querySelector('.capture-pastilles-liste');
      if (!bande) return;
      // Un pixel de marge : les navigateurs rendent des largeurs fractionnaires,
      // et une bande qui tient pile se déclarerait débordante.
      bande.classList.toggle('deborde-avant', bande.scrollLeft > 1);
      bande.classList.toggle(
        'deborde-apres',
        bande.scrollLeft + bande.clientWidth < bande.scrollWidth - 1,
      );
    };

    section.addEventListener(
      'scroll',
      (evenement) => {
        if (evenement.target.closest?.('.capture-pastilles-liste')) marquerLeDebordement();
      },
      // En phase de capture : un défilement ne remonte pas les bulles.
      true,
    );

    // --- La tuile, sans jamais la redessiner ---
    //
    // Tout ce qui suit modifie le DOM en place. C'est la règle de cette tuile
    // depuis le 13 août : sur téléphone, redessiner détruit le champ du titre,
    // ce qui referme le clavier, ce qui agrandit la zone visible, ce qui
    // replace la tuile — elle sautait à chaque pastille touchée.

    const fermerLesPanneaux = () => {
      for (const panneau of section.querySelectorAll('.capture-popover')) {
        panneau.hidden = true;
        section
          .querySelector(`[data-pastille="${panneau.dataset.panneau}"]`)
          ?.setAttribute('aria-expanded', 'false');
      }
    };

    const basculerPanneau = (nom) => {
      const panneau = section.querySelector(`.capture-popover[data-panneau="${nom}"]`);
      if (!panneau) return;
      const ouvert = !panneau.hidden;
      fermerLesPanneaux();
      panneau.hidden = ouvert;
      section.querySelector(`[data-pastille="${nom}"]`)?.setAttribute('aria-expanded', String(!ouvert));
    };

    // La ligne choisie se marque dans sa liste, comme le ferait un redessin.
    const marquerLeChoix = (attribut, valeur) => {
      for (const bouton of section.querySelectorAll(`[data-${attribut}]`)) {
        const actif = bouton.dataset[attribut.replace(/-(.)/g, (_, l) => l.toUpperCase())] === valeur;
        bouton.classList.toggle('actif', actif);
        bouton.setAttribute('aria-pressed', String(actif));
      }
    };

    // Les libellés des trois pastilles, relus depuis l'état.
    // Terminer une tâche ou la rouvrir. Écrit ici pour les deux chemins, parce
    // que la seule différence entre eux est le SENS — et la durée, que seule la
    // coche apporte.
    async function basculer(tache, cercle, versFait, minutes) {
      if (ecrituresEnVol.has(tache.id)) return;
      const avant = { ...tache };

      // On voit la coche se poser, PUIS la ligne s'en va. L'écriture, elle,
      // n'attend pas : elle part juste après, pendant que l'œil finit.
      if (versFait) await animerLaCoche(cercle);

      const champs = versFait
        ? { statut: 'fait', date_fait: new Date().toISOString() }
        : { statut: 'actif', date_fait: null };
      if (versFait && minutes !== null) champs.duree = minutes;

      Object.assign(tache, champs);
      rendreListe();

      ecrituresEnVol.add(tache.id);
      try {
        if (versFait) {
          if (minutes !== null) await api.modifierTache(tache.id, { duree: minutes });
          // `avant` et pas `tache` : l'API relit le statut pour savoir quoi
          // faire, elle doit recevoir la tâche telle qu'elle était.
          const { tache: faite } = await api.terminerTache(avant);
          Object.assign(tache, faite);
        } else {
          Object.assign(tache, await api.rouvrirTache(avant));
          await api.supprimerVictoireDeLaTache(tache.id);
        }
        // Pas de nouveau rendu : l'écran a déjà raison, le serveur n'a fait
        // que confirmer (à l'horodatage près).
      } catch (souci) {
        console.error('Tâche non mise à jour', souci);
        Object.assign(tache, avant);
        etat.message = "Ça n'a pas pu être enregistré — la tâche est revenue.";
        rendreListe();
      } finally {
        ecrituresEnVol.delete(tache.id);
      }
    }

    const majPastilles = () => {
      const ecrire = (nom, texte, rempli) => {
        const pastille = section.querySelector(`[data-pastille="${nom}"]`);
        if (!pastille) return;
        pastille.querySelector('span').textContent = texte;
        pastille.classList.toggle('remplie', rempli);
      };

      ecrire('date', dateLisible(etat.capture), Boolean(etat.capture.echeance));
      ecrire('espace', ESPACES[etat.capture.espace], true);
      ecrire(
        'priorite',
        etat.capture.priorite === 4 ? 'Priorité' : `P${etat.capture.priorite}`,
        etat.capture.priorite !== 4,
      );
      ecrire(
        'repetition',
        RECURRENCES[etat.capture.recurrence ?? ''],
        Boolean(etat.capture.recurrence),
      );
      ecrire(
        'projet',
        etat.projets.find((projet) => projet.id === etat.capture.projet_id)?.nom ?? 'Projet',
        Boolean(etat.capture.projet_id),
      );
      ecrire(
        'famille',
        etat.capture.famille ? FAMILLES_PERSO_CHOIX[etat.capture.famille] : 'Famille',
        Boolean(etat.capture.famille),
      );
      // Elle n'existe que dans l'espace perso, et suit donc le choix de
      // l'espace sans que la tuile se redessine.
      const familleOfferte = section.querySelector('[data-pastille="famille"]');
      if (familleOfferte) familleOfferte.hidden = etat.capture.espace !== 'perso';
      section
        .querySelector('[data-pastille="priorite"]')
        ?.setAttribute('data-priorite', String(etat.capture.priorite));
      marquerLeDebordement();
    };

    // Toucher une pastille ne doit pas retirer le curseur du titre : c'est ce
    // qui referme le clavier. `pointerdown` est le moment où le navigateur
    // décide de déplacer le focus — l'annuler suffit, le clic suit son cours.
    // Les champs de date et d'heure, eux, ont besoin du focus : ils ne sont pas
    // dans la liste.
    section.addEventListener('pointerdown', (evenement) => {
      const garderLeClavier = evenement.target.closest(
        '[data-pastille], [data-poser-date], [data-poser-espace], [data-poser-priorite],\n         [data-poser-repetition], [data-poser-duree], [data-poser-famille],\n         .capture-envoyer',
      );
      if (garderLeClavier) evenement.preventDefault();
    });

    // La capture se redessine seule, et il faut y prendre soin : le titre vit
    // dans le champ, pas dans l'état, tant qu'on tape. On le récupère avant de
    // réécrire, et on rend le curseur à la fin — sinon ouvrir la pastille de
    // date effacerait ce qu'on vient d'écrire.
    const rendreCapture = ({ focus = false } = {}) => {
      const champ = section.querySelector('#capture-titre');
      if (champ) etat.capture.titre = champ.value;

      section.querySelector('[data-bloc="capture"]').innerHTML = construireCapture(
        etat.capture,
        etat.projets,
      );
      marquerLeDebordement();

      if (focus) {
        const nouveau = section.querySelector('#capture-titre');
        nouveau?.focus();
        nouveau?.setSelectionRange(nouveau.value.length, nouveau.value.length);
      }
    };

    // Seuls les filtres et la liste se redessinent : réécrire la page entière
    // refermerait la capture à chaque case cochée.
    const rendre = () => {
      section.querySelector('.filtres')?.replaceWith(
        document.createRange().createContextualFragment(construireFiltres(etat.espace))
          .firstElementChild,
      );
      rendreListe();
    };

    const charger = async () => {
      const [taches, projets] = await Promise.all([api.tachesToutes(), api.projetsTous()]);
      etat.taches = taches;
      etat.projets = projets;
      rendreListe();
    };

    // Revenir sur la liste la relit : une tâche posée depuis le calendrier ou
    // cochée sur l'accueil doit s'y voir sans recharger la page. La tuile
    // ouverte n'est pas touchée — elle vit dans son propre bloc.
    this.rafraichir = charger;

    // Revenir sur l'espace avec une autre adresse repose le filtre. Rien n'est
    // relu : la page a déjà toutes les tâches, c'est la part montrée qui change.
    this.naviguer = (nouvelle) => {
      const voulu = ESPACES[nouvelle?.vue] ? nouvelle.vue : 'tout';
      if (voulu === etat.espace) return;
      etat.espace = voulu;
      if (!etat.capture.ouverte) etat.capture = captureVierge(voulu);
      rendre();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement des tâches impossible', erreur);
      section.innerHTML = `
        <h1>Mes tâches</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    // `trouver` ignore les tâches encore en vol : leur identifiant est
    // provisoire, le serveur ne les connaît pas, et toute écriture qui les
    // viserait échouerait. Cocher, ouvrir ou supprimer l'une d'elles ne fait
    // donc rien — le temps d'un aller-retour, jamais plus.
    const trouver = (id) => etat.taches.find((tache) => tache.id === id && !tache.enVol);

    // --- Le clavier du téléphone ---
    //
    // Sur mobile la tuile est collée en bas, et le clavier viendrait la couvrir.
    // `visualViewport` est le seul moyen fiable de savoir combien de place il
    // prend : la fenêtre de mise en page (`innerHeight`) ne bouge pas quand le
    // clavier monte, seule la fenêtre VISUELLE rétrécit. La différence entre
    // les deux EST la hauteur du clavier.
    //
    // Le résultat sort en variable CSS plutôt qu'en style direct : c'est la
    // feuille de style qui décide quoi en faire, et sur grand écran elle n'en
    // fait rien — la tuile y est centrée, un clavier physique ne prend pas de
    // place.
    const fenetreVisuelle = window.visualViewport;

    const mesurerLeClavier = () => {
      if (!fenetreVisuelle) return;
      const pris = window.innerHeight - (fenetreVisuelle.height + fenetreVisuelle.offsetTop);
      // Arrondi et plancher à zéro : les navigateurs rendent des fractions, et
      // une valeur négative (barre d'adresse qui se replie) n'a pas de sens ici.
      document.documentElement.style.setProperty('--bas-clavier', `${Math.max(Math.round(pris), 0)}px`);
    };

    const oublierLeClavier = () => {
      document.documentElement.style.removeProperty('--bas-clavier');
    };

    // Écoutés en permanence, mais ils ne coûtent rien tant que la tuile est
    // fermée : sans elle, la variable ne sert à personne.
    fenetreVisuelle?.addEventListener('resize', () => {
      if (etat.capture.ouverte) mesurerLeClavier();
    });
    fenetreVisuelle?.addEventListener('scroll', () => {
      if (etat.capture.ouverte) mesurerLeClavier();
    });

    // La bande de pastilles déborde ou non selon la largeur : ses fondus se
    // recalculent donc quand la fenêtre change de taille, sinon ils restent
    // figés sur l'état d'avant — une pastille estompée alors que tout tient.
    window.addEventListener('resize', () => {
      if (etat.capture.ouverte) marquerLeDebordement();
    });

    // Échap referme — d'abord le panneau ouvert, ensuite la tuile. Deux coups
    // plutôt qu'un : refermer toute la capture parce qu'on a renoncé à choisir
    // une priorité ferait perdre le titre déjà écrit.
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key !== 'Escape' || !etat.capture.ouverte) return;
      if (etat.capture.panneau) {
        etat.capture.panneau = null;
        rendreCapture({ focus: true });
      } else if (etat.capture.confirmationSortie) {
        // Échap sur la question vaut « non » : le geste d'annulation ne peut
        // pas être celui qui détruit.
        etat.capture.confirmationSortie = false;
        rendreCapture({ focus: true });
      } else {
        quitterLaCapture();
      }
    });

    // --- Création ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="creer-tache"]');
      if (!formulaire) return;
      evenement.preventDefault();

      // UN TITRE MANQUANT SE DIT (2 septembre 2026). Il repartait en silence, et
      // le bouton d'envoi étant grisé, rien à l'écran n'expliquait pourquoi rien
      // ne se passait — c'est le cul-de-sac que Noé décrit sur téléphone. On
      // ramène le curseur là où il manque quelque chose.
      const champTitre = formulaire.querySelector('#capture-titre');
      const titre = champTitre.value.trim();
      if (!titre) {
        champTitre.focus();
        const erreur = formulaire.querySelector('[data-erreur]');
        if (erreur) {
          erreur.textContent = 'Il lui manque son nom.';
          erreur.hidden = false;
        }
        return;
      }

      const bouton = formulaire.querySelector('button[type="submit"]');
      formulaire.querySelector('[data-erreur]').hidden = true;

      // L'ÉCRAN D'ABORD, LE RÉSEAU ENSUITE. La tuile se vide et la ligne
      // apparaît tout de suite ; l'écriture part derrière. C'est le geste qu'on
      // enchaîne — on note rarement une seule tâche —, donc celui où attendre
      // se paie le plus cher.
      const champs = {
        espace: etat.capture.espace,
        titre,
        echeance: etat.capture.echeance,
        heure: etat.capture.heure,
        // Une durée sans heure ne mesure rien : `creerTache` l'écarte de son
        // côté, on ne la lui envoie pas non plus.
        duree: etat.capture.heure ? etat.capture.duree : null,
        priorite: etat.capture.priorite,
        // Sans date, rien à répéter : `creerTache` l'écarte de son côté, on ne
        // la lui envoie pas non plus.
        recurrence: etat.capture.echeance ? etat.capture.recurrence : null,
        projet_id: etat.capture.projet_id,
        // La famille ne veut rien dire hors de l'espace perso : la pastille y
        // est cachée, et l'écriture l'écarte pour de bon — sans quoi une tâche
        // passée de perso au club emporterait son classement avec elle.
        famille: etat.capture.espace === 'perso' ? etat.capture.famille : null,
      };

      // Corriger une tâche existante : la tuile se referme, le travail est
      // fini. On n'enchaîne pas des corrections comme on enchaîne des notes.
      if (etat.capture.id) {
        const tache = trouver(etat.capture.id);
        const avant = { ...tache };
        Object.assign(tache, champs);
        etat.capture = captureVierge(etat.espace);
        etat.message = null;
        rendreCapture();
        oublierLeClavier();
        rendreListe();

        try {
          Object.assign(tache, await api.modifierTache(avant.id, champs));
        } catch (souci) {
          console.error('Tâche non modifiée', souci);
          Object.assign(tache, avant);
          etat.message = "Ça n'a pas pu être enregistré — la tâche est revenue.";
          rendreListe();
        }
        return;
      }

      // La capture reste ouverte, vidée, avec l'espace et la priorité qu'on
      // vient de choisir. Elle se vide EN PLACE, sans redessin — sinon le champ
      // serait détruit et le clavier se refermerait entre deux notes, ce qui
      // est tout ce qu'on cherche à éviter.
      const champ = formulaire.querySelector('#capture-titre');
      champ.value = '';
      etat.capture = {
        ...etat.capture,
        titre: '',
        echeance: null,
        heure: null,
        duree: null,
        recurrence: null,
        // L'espace et la priorité restent — ils valent pour la note suivante.
        // La famille, non : « Courses » écrite après « Courir » hériterait du
        // corps sans qu'on l'ait dit, et fausserait le plancher en silence.
        famille: null,
      };

      const champDate = section.querySelector('[data-champ-date]');
      if (champDate) champDate.value = '';
      const champHeure = section.querySelector('[data-champ-heure]');
      if (champHeure) champHeure.value = '';
      const champDuree = section.querySelector('[data-champ-duree]');
      if (champDuree) champDuree.value = '';
      marquerLaDuree(section, '');

      fermerLesPanneaux();
      majPastilles();
      bouton.disabled = true;
      champ.focus();
      etat.message = null;

      // La ligne existe à l'écran avant d'exister en base, avec un identifiant
      // provisoire. Tout ce qui la vise (cocher, ouvrir, supprimer) le refuse
      // tant qu'elle le porte — voir `trouver` : agir sur une tâche que le
      // serveur ne connaît pas encore n'a pas de sens.
      await ajouterAussitot(
        etat.taches,
        { ...champs, statut: STATUT_A_LA_CREATION, created_at: new Date().toISOString() },
        () => api.creerTache({ ...champs, statut: STATUT_A_LA_CREATION }),
        {
          rendre: rendreListe,
          echouer: () => {
            etat.message = `« ${titre} » n'a pas pu être enregistrée.`;
            rendreListe();
          },
        },
      );
    });

    // --- Réglages de ligne ---

    // La flèche s'allume dès qu'il y a un titre. Elle se règle ici plutôt qu'au
    // redessin : redessiner à chaque lettre ferait perdre le curseur.
    section.addEventListener('input', (evenement) => {
      // La durée tapée à la main : elle se relit à la frappe, pas au relâchement
      // du champ — la pastille dit « 1 h 45 » pendant qu'on tape, et la
      // proposition allumée s'éteint dès que le nombre ne lui correspond plus.
      const duree = evenement.target.closest('[data-champ-duree]');
      if (duree) {
        etat.capture.duree = Number(duree.value) || null;
        marquerLaDuree(section, etat.capture.duree ?? '');
        majPastilles();
        return;
      }

      const champ = evenement.target.closest('#capture-titre');
      if (!champ) return;
      const envoyer = section.querySelector('.capture-envoyer');
      if (envoyer) envoyer.disabled = !champ.value.trim();
    });

    section.addEventListener('change', async (evenement) => {
      // Les deux champs natifs du panneau de date. Ils ne referment pas le
      // panneau — on y règle souvent le jour PUIS l'heure — et surtout ils ne
      // le REDESSINENT pas : recréer un `<input type="date">` pendant qu'on
      // s'en sert referme le sélecteur natif du téléphone. Seule l'étiquette de
      // la pastille est réécrite.
      const champDate = evenement.target.closest('[data-champ-date]');
      const champHeure = evenement.target.closest('[data-champ-heure]');
      // Et la durée, qui vit dans le même panneau : c'est la même question que
      // « quand », et elle se règle sans le refermer non plus.
      const champDuree = evenement.target.closest('[data-champ-duree]');
      if (champDate || champHeure || champDuree) {
        if (champDate) {
          etat.capture.echeance = champDate.value || null;
          if (!etat.capture.echeance) {
            etat.capture.heure = null;
            etat.capture.duree = null;
            const heure = section.querySelector('[data-champ-heure]');
            if (heure) heure.value = '';
            const duree = section.querySelector('[data-champ-duree]');
            // VIDE, ET NON ZÉRO (2 septembre 2026) : le champ porte min="5", donc
            // « 0 » le rend INVALIDE — et il vit dans un panneau replié, que le
            // navigateur ne sait pas atteindre pour y montrer sa bulle. Il aurait
            // refusé l'envoi sans un mot, exactement comme le champ de date de la
            // tuile du calendrier. Une durée qu'on retire est une durée absente.
            if (duree) duree.value = '';
          }
        } else if (champHeure) {
          etat.capture.heure = champHeure.value || null;
        } else {
          etat.capture.duree = Number(champDuree.value) || null;
          marquerLaDuree(section, etat.capture.duree ?? '');
        }

        majPastilles();
        return;
      }

      // Les lignes de la liste n'ont plus de réglage en propre : la priorité
      // comme le reste se corrigent dans la tuile, qu'un appui sur la tâche
      // rouvre. Le statut, lui, est masqué (voir `STATUT_A_LA_CREATION`).
    });

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      // Le rappel de la règle ne vaut que pour le geste qui l'a déclenché :
      // au geste suivant, quel qu'il soit, il s'efface. Le laisser traîner en
      // ferait un reproche affiché en permanence.
      etat.message = null;

      // --- La capture ---

      if (evenement.target.closest('[data-ouvrir-capture]')) {
        etat.capture = { ...captureVierge(etat.espace), ouverte: true };
        rendreCapture({ focus: true });
        mesurerLeClavier();
        return;
      }

      // Une ligne de la liste rouvre la tuile, remplie de ce qu'elle contient.
      const ouvrirTache = evenement.target.closest('[data-ouvrir]');
      if (ouvrirTache) {
        const tache = trouver(ouvrirTache.dataset.ouvrir);
        if (!tache) return;
        etat.capture = {
          ...captureVierge(tache.espace),
          ouverte: true,
          id: tache.id,
          titre: tache.titre,
          echeance: tache.echeance,
          // La base rend « 18:00:00 » ; le champ n'en veut que les heures et
          // les minutes, sans quoi il refuse la valeur et s'affiche vide.
          heure: tache.heure ? tache.heure.slice(0, 5) : null,
          duree: tache.duree ?? null,
          espace: tache.espace,
          priorite: tache.priorite ?? 4,
          // La répétition était oubliée à la réouverture : la tuile est le seul
          // écran où elle se corrige, et elle y revenait vide — enregistrer
          // sans y toucher effaçait la série.
          recurrence: tache.recurrence ?? null,
          projet_id: tache.projet_id ?? null,
          famille: tache.famille ?? null,
        };
        rendreCapture({ focus: true });
        mesurerLeClavier();
        return;
      }

      // Un appui hors de la tuile la quitte — il n'y a plus de bouton
      // « Annuler » (demande de Noé). La confirmation tient lieu de garde-fou.
      if (evenement.target.closest('[data-fermer-capture]')) {
        quitterLaCapture();
        return;
      }

      if (evenement.target.closest('[data-abandonner-capture]')) {
        etat.capture = captureVierge(etat.espace);
        rendreCapture();
        oublierLeClavier();
        return;
      }

      if (evenement.target.closest('[data-continuer-capture]')) {
        etat.capture.confirmationSortie = false;
        rendreCapture({ focus: true });
        return;
      }

      // Une pastille ouvre son panneau, et referme celui d'à côté : deux choix
      // ouverts en même temps, c'est un formulaire, pas une capture.
      //
      // Tout ce qui suit ne touche QUE le DOM. Rien ne redessine la tuile, donc
      // le champ du titre n'est jamais détruit — et sur téléphone, le clavier
      // ne se referme pas. C'est ce qui faisait sauter la tuile à chaque
      // pastille touchée : elle se replaçait au milieu d'un écran redevenu
      // grand, puis remontait quand le clavier revenait.
      const pastilleOuverte = evenement.target.closest('[data-pastille]');
      if (pastilleOuverte) {
        basculerPanneau(pastilleOuverte.dataset.pastille);
        return;
      }

      const poserDate = evenement.target.closest('[data-poser-date]');
      if (poserDate) {
        etat.capture.echeance = poserDate.dataset.poserDate || null;
        // Retirer la date retire l'heure avec elle : une heure sans jour ne
        // veut rien dire, et la colonne resterait seule en base.
        if (!etat.capture.echeance) {
          etat.capture.heure = null;
          etat.capture.duree = null;
          const champHeure = section.querySelector('[data-champ-heure]');
          if (champHeure) champHeure.value = '';
          const champDuree = section.querySelector('[data-champ-duree]');
          if (champDuree) champDuree.value = '';
          marquerLaDuree(section, '');
        }
        const champDate = section.querySelector('[data-champ-date]');
        if (champDate) champDate.value = etat.capture.echeance ?? '';
        fermerLesPanneaux();
        majPastilles();
        return;
      }

      // Une proposition de durée écrit dans le champ en minutes. Le panneau
      // RESTE ouvert : on choisit souvent « 2 h » puis on corrige à 105.
      const poserDuree = evenement.target.closest('[data-poser-duree]');
      if (poserDuree) {
        etat.capture.duree = Number(poserDuree.dataset.poserDuree) || null;
        const champ = section.querySelector('[data-champ-duree]');
        if (champ) champ.value = etat.capture.duree ?? '';
        marquerLaDuree(section, etat.capture.duree ?? '');
        majPastilles();
        return;
      }

      const poserEspace = evenement.target.closest('[data-poser-espace]');
      if (poserEspace) {
        etat.capture.espace = poserEspace.dataset.poserEspace;
        marquerLeChoix('poser-espace', etat.capture.espace);
        // Le panneau des projets ne montre que ceux de l'espace choisi : il se
        // redessine ici, et le projet retenu s'efface s'il appartenait à
        // l'espace d'avant. Une tâche du club dans un projet de Yuno n'aurait
        // aucun sens, et le lien serait invisible à l'écran.
        const projetsDIci = etat.projets.filter(
          (projet) => projet.espace === etat.capture.espace,
        );
        if (!projetsDIci.some((projet) => projet.id === etat.capture.projet_id)) {
          etat.capture.projet_id = null;
        }
        const panneau = section.querySelector('[data-panneau="projet"]');
        if (panneau) {
          panneau.outerHTML = panneauProjet(projetsDIci, etat.capture.projet_id);
        }
        fermerLesPanneaux();
        majPastilles();
        return;
      }

      const poserRepetition = evenement.target.closest('[data-poser-repetition]');
      if (poserRepetition) {
        etat.capture.recurrence = poserRepetition.dataset.poserRepetition || null;
        marquerLeChoix('poser-repetition', etat.capture.recurrence ?? '');
        fermerLesPanneaux();
        majPastilles();
        return;
      }

      const poserProjet = evenement.target.closest('[data-poser-projet]');
      if (poserProjet) {
        etat.capture.projet_id = poserProjet.dataset.poserProjet || null;
        marquerLeChoix('poser-projet', etat.capture.projet_id ?? '');
        fermerLesPanneaux();
        majPastilles();
        return;
      }

      const poserFamille = evenement.target.closest('[data-poser-famille]');
      if (poserFamille) {
        etat.capture.famille = poserFamille.dataset.poserFamille || null;
        marquerLeChoix('poser-famille', etat.capture.famille ?? '');
        fermerLesPanneaux();
        majPastilles();
        return;
      }

      const poserPriorite = evenement.target.closest('[data-poser-priorite]');
      if (poserPriorite) {
        etat.capture.priorite = Number(poserPriorite.dataset.poserPriorite);
        marquerLeChoix('poser-priorite', String(etat.capture.priorite));
        fermerLesPanneaux();
        majPastilles();
        return;
      }

      // Un clic ailleurs dans la tuile referme le panneau ouvert. Il arrive en
      // dernier, quand rien d'autre n'a répondu : les boutons du panneau se
      // sont déjà servis au-dessus.
      if (evenement.target.closest('.capture') && !evenement.target.closest('.capture-popover')) {
        fermerLesPanneaux();
      }

      const filtre = evenement.target.closest('[data-filtre-espace]');
      if (filtre) {
        etat.espace = filtre.dataset.filtreEspace;
        // L'espace de la capture suit le filtre, tant qu'on n'a pas commencé
        // à écrire : changer de filtre après avoir tapé un titre ne doit pas
        // déplacer la tâche sous le nez de Noé.
        if (etat.capture.ouverte && !section.querySelector('#capture-titre')?.value) {
          etat.capture.espace = captureVierge(etat.espace).espace;
          rendreCapture();
        }
        rendre();
        return;
      }

      // Le cercle coche et décoche. Terminer crée une victoire ; rouvrir la
      // retire, sinon le dashboard garderait la trace d'un travail défait.
      //
      // L'ÉCRAN D'ABORD, LE RÉSEAU ENSUITE (optimiste). La tâche change et la
      // liste se redessine au moment où le doigt touche ; l'écriture part en
      // arrière-plan. Avant, le geste attendait deux requêtes en séquence —
      // 300 à 800 ms de cercle grisé sur téléphone. Si l'écriture échoue
      // (rare), la tâche revient et la règle le dit en ligne.
      const cercle = evenement.target.closest('[data-cocher]');
      if (cercle) {
        const tache = trouver(cercle.dataset.cocher);
        // Une écriture à la fois par tâche : un second appui pendant qu'elle
        // vole ferait se croiser deux ordres contraires sur la même ligne.
        if (!tache || ecrituresEnVol.has(tache.id)) return;

        const versFait = tache.statut !== 'fait';

        // Rouvrir ne demande rien : on ne déclare pas le temps passé sur une
        // tâche qu'on vient de remettre à faire. Cocher, si — et la fenêtre
        // doit être confirmée avant que quoi que ce soit ne s'écrive.
        if (versFait) {
          demanderLaDuree(tache, (minutes) => basculer(tache, cercle, true, minutes));
        } else {
          fermerLaDuree();
          await basculer(tache, cercle, false, null);
        }
        return;
      }

      const supprimer = evenement.target.closest('[data-supprimer]');
      if (supprimer) {
        const tache = trouver(supprimer.dataset.supprimer);
        if (!tache || !confirm(`Supprimer « ${tache.titre} » ?`)) return;

        // La ligne part tout de suite : la question a déjà été posée, attendre
        // le serveur après un « oui » n'ajoute aucune sécurité. Elle revient à
        // SA place si l'écriture échoue.
        await retirerAussitot(etat.taches, tache, () => api.supprimerTache(tache.id), {
          rendre: rendreListe,
          echouer: () => {
            etat.message = `« ${tache.titre} » n'a pas pu être supprimée.`;
            rendreListe();
          },
        });
      }
    });
  },
};
