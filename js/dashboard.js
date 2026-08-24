// Espace tableau de bord — la page de Noé.
//
// Ordre voulu : on commence par lui (le jour, son humeur), puis par ce qui est
// accompli (victoires, progression), et seulement à la fin par ce qu'il reste à
// faire. Rien ici ne compte les retards.
//
// Les fonctions `construire*` ne font que fabriquer du HTML à partir de données
// déjà chargées : elles sont exportées pour pouvoir être vérifiées seules.

import * as api from './api.js';
import {
  versDateISO,
  depuisDateISO,
  dateLongue,
  echeanceLisible,
  echapper,
  NOMS_PROJETS,
} from './format.js';
import {
  assemblerCalendrier,
  construireGrille,
  toutesLesNatures,
  fenetreCreation,
  fenetreDetail,
  fenetreJour,
  elementsDuJour,
  finDeLEvenement,
  brancherCapture,
  poserAuCalendrier,
  brancherDeplacement,
  appliquerAuCalendrier,
  champsApresDeplacement,
} from './calendrier-commun.js';
import { construireLignesTaches, trierTaches } from './taches.js';
import { lireCache, ecrireCache } from './cache-session.js';
import { marquerLesEntrantes, animerLaCoche } from './mouvements.js';
import { modifierAussitot } from './ecriture.js';

// Les projets offerts à la création. Les mêmes que dans l'espace Calendrier :
// 'perso' n'accepte qu'un événement, `fenetreCreation` s'en charge.
const PROJETS = {
  photo: 'Yuno',
  fch: 'FC Hermitage',
  formation: 'Formation',
  perso: 'Perso',
};

// Le « + » du dashboard ouvre sur une TÂCHE (demande de Noé, 13 août 2026) :
// depuis l'accueil, neuf fois sur dix ce qu'on note est une chose à faire.
// Les autres natures restent à une pastille.
const NATURE_PAR_DEFAUT = 'tache';

const PLUS = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
  aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>`;

const PRENOM = 'Noé';
const MAX_VICTOIRES = 5;

// Les victoires sont MASQUÉES sur l'accueil (demande de Noé, 13 août 2026 —
// « pour le moment »). Rien n'a été retiré : ce drapeau commande le bloc, sa
// source et son rendu d'un seul endroit, et le repasser à `true` rallume tout.
//
// Ce qui continue de vivre sans lui : cocher une tâche CRÉE toujours sa
// victoire en base, l'espace perso et le site du FCH les affichent, et la ligne
// « Annuler » du bloc « Aujourd'hui » sait toujours la retirer. Seul l'affichage
// de l'accueil se tait — et l'accueil économise une requête au passage.
const VICTOIRES_VISIBLES = false;
const MAX_TACHES = 9; // ce qui tient sans que « Aujourd'hui » devienne une liste

// Fenêtre pendant laquelle une tâche cochée par erreur peut être décochée.
// Même durée que dans les espaces projet.
const DUREE_ANNULATION = 6000;

const NIVEAUX_HUMEUR = [
  { niveau: 1, frimousse: '😔', mot: 'difficile' },
  { niveau: 2, frimousse: '😕', mot: 'bof' },
  { niveau: 3, frimousse: '😐', mot: 'ça va' },
  { niveau: 4, frimousse: '🙂', mot: 'bien' },
  { niveau: 5, frimousse: '😄', mot: 'super' },
];

// --- Fabrication du HTML ----------------------------------------------------

// Sur le tableau de bord les projets se mélangent : chaque tuile porte la
// couleur du sien en barre, et son nom écrit — jamais la couleur seule.
// L'en-tête d'une tuile : le projet à gauche, la date à droite. Les mettre sur
// la même ligne garde les tuiles régulières, quelle que soit la longueur du
// titre en dessous.
function enTeteTuile(projet, quand, bouton = '') {
  return `<span class="tuile-entete">
    <span class="tuile-projet">${echapper(NOMS_PROJETS[projet] ?? projet)}</span>
    <span class="discret quand">${echapper(quand)}</span>
    ${bouton}
  </span>`;
}

export function construireEnTete(maintenant = new Date()) {
  const salutation = maintenant.getHours() >= 18 ? 'Bonsoir' : 'Bonjour';
  return `
    <h1>${salutation} ${PRENOM}</h1>
    <p class="discret date-du-jour">${echapper(dateLongue(maintenant))}</p>
  `;
}

export function construireHumeur(humeur) {
  if (!humeur) {
    const boutons = NIVEAUX_HUMEUR.map(
      ({ niveau, frimousse, mot }) => `
        <button type="button" class="bouton-humeur" data-niveau="${niveau}"
          aria-label="${mot}" title="${mot}">${frimousse}</button>`,
    ).join('');

    return `
      <p class="question-humeur">Comment tu te sens ?</p>
      <div class="echelle-humeur">${boutons}</div>
    `;
  }

  const choisi = NIVEAUX_HUMEUR.find((n) => n.niveau === humeur.niveau);
  return `
    <p class="humeur-repondue discret">
      <span class="frimousse-choisie">${choisi?.frimousse ?? ''}</span>
      Noté, merci.
      <button type="button" class="lien-discret" data-action="rouvrir-humeur">changer</button>
    </p>
    <!-- L'étiquette est hors écran, pas absente : le champ n'a qu'un texte
         d'invite, et une invite disparaît dès qu'on écrit. Elle ne dit donc
         rien à qui revient dessus au lecteur d'écran (WCAG 1.3.1 et 3.3.2).
         À l'œil, rien ne change : la tuile de l'humeur garde sa ligne nue. -->
    <label class="hors-ecran" for="note-humeur">Un mot sur ta journée
      (facultatif)</label>
    <input type="text" id="note-humeur" class="note-humeur" maxlength="140"
      placeholder="un mot sur ta journée ? (facultatif)"
      value="${echapper(humeur.note ?? '')}">
  `;
}

export function construireVictoires(victoires) {
  if (!victoires.length) {
    return `<p class="vide">Tes premières victoires s'afficheront ici.</p>`;
  }

  const lignes = victoires
    .map(
      (victoire) => `
      <li data-projet="${echapper(victoire.projet)}">
        ${enTeteTuile(
          victoire.projet,
          echeanceLisible(depuisDateISO(victoire.date)),
          `<button type="button" class="lien-discret bouton-mini bouton-retirer"
             data-victoire="${echapper(victoire.id)}"
             title="Retirer cette victoire"
             aria-label="Retirer « ${echapper(victoire.titre)} »">×</button>`,
        )}
        <span class="victoire-titre">${echapper(victoire.titre)}</span>
      </li>`,
    )
    .join('');

  return `<ul class="liste-victoires">${lignes}</ul>`;
}

export function construireObjectifs(objectifs) {
  if (!objectifs.length) {
    return `<p class="vide">Aucun objectif actif pour l'instant.</p>`;
  }

  return objectifs.map(construireObjectif).join('');
}

function construireObjectif(objectif) {
  const jalons = objectif.jalons ?? [];
  const atteints = jalons.filter((jalon) => jalon.atteint).length;
  const pourcentage = jalons.length ? Math.round((atteints / jalons.length) * 100) : 0;

  const barre = jalons.length
    ? `<div class="barre" role="img"
         aria-label="${atteints} jalon${atteints > 1 ? 's' : ''} sur ${jalons.length}">
         <span style="width: ${pourcentage}%"></span>
       </div>
       <p class="discret progression-legende"><span class="chiffre">${atteints}/${jalons.length}</span> jalons · <span class="chiffre">${pourcentage}</span>&nbsp;%</p>`
    : `<p class="discret progression-legende">Pas encore de jalons.</p>`;

  const listeJalons = jalons.length
    ? `<ul class="liste-jalons">${jalons
        .map(
          (jalon) => `
          <li class="${jalon.atteint ? 'jalon-atteint' : ''}">
            <span class="marque-jalon" aria-hidden="true">${jalon.atteint ? '✓' : '○'}</span>
            <span>${echapper(jalon.titre)}</span>
            ${
              jalon.echeance && !jalon.atteint
                ? `<span class="discret quand">${echapper(
                    echeanceLisible(depuisDateISO(jalon.echeance)),
                  )}</span>`
                : ''
            }
          </li>`,
        )
        .join('')}</ul>`
    : '';

  return `
    <details class="objectif" data-projet="${echapper(objectif.projet)}">
      <summary>
        ${enTeteTuile(
          objectif.projet,
          objectif.echeance ? echeanceLisible(depuisDateISO(objectif.echeance)) : '',
        )}
        <span class="objectif-tete">
          <span class="objectif-titre">${echapper(objectif.titre)}</span>
        </span>
        ${barre}
      </summary>
      <div class="objectif-detail">
        ${objectif.pourquoi ? `<p class="pourquoi">${echapper(objectif.pourquoi)}</p>` : ''}
        ${objectif.cible ? `<p class="discret cible">Réussite : ${echapper(objectif.cible)}</p>` : ''}
        ${listeJalons}
      </div>
    </details>
  `;
}

// La semaine est un APERÇU DU CALENDRIER, plus une liste (demande de Noé,
// 13 août 2026) : la vraie grille de la semaine, tous projets et toutes natures
// confondus — événements, tâches, publications, objectifs, jalons, commandes,
// relances. C'est la même fonction que l'espace Calendrier, avec la même vue
// « semaine » : une seule façon de dessiner une semaine dans tout le hub.
//
// `montrerProjet` colore les barres par projet, puisque tout s'y mélange ici.
export function construireSemaine(elements, ancre = new Date()) {
  return construireGrille(elements, toutesLesNatures(), 'semaine', ancre, {
    montrerProjet: true,
  });
}

// Les tâches du jour, dans la forme EXACTE de l'espace Tâches (demande de Noé,
// 13 août 2026) : cercle coloré par priorité, titre, puis la date et le projet.
// Une tâche se lit pareil partout, c'est ce qui fait qu'on la reconnaît sans
// réfléchir. Deux réglages en moins ici : pas de tuile pour corriger sur cette
// page, et supprimer une tâche n'a rien à faire dans un check-in du matin.
export function construireTaches(taches, annulation = null) {
  // Une tâche vient d'être cochée : on laisse une porte de sortie quelques
  // secondes, sans rien demander à qui ne s'est pas trompé.
  const ligneAnnulation = annulation
    ? `<p class="annulation">
         <span>Fait ✓ · <span class="discret">${echapper(annulation.tache.titre)}</span></span>
         <button type="button" class="lien-discret" data-annuler>Annuler</button>
       </p>`
    : '';

  if (!taches.length) {
    return `${ligneAnnulation}<p class="vide">Rien à faire aujourd'hui.</p>`;
  }

  // Ouvrables depuis le 14 août 2026 (demande de Noé) : appuyer sur une tâche
  // la rouvre dans la tuile, ici comme dans l'espace Tâches. Elle ne se
  // supprime toujours pas d'ici — effacer n'a rien à faire dans un check-in du
  // matin, et le geste existe deux onglets plus loin.
  return `${ligneAnnulation}${construireLignesTaches(taches.slice(0, MAX_TACHES), {
    ouvrable: true,
    supprimable: false,
  })}`;
}

// --- Le démarrage ------------------------------------------------------------
//
// Repris du site Yuno (13 août 2026) et porté ici : c'est la page du check-in
// matinal, celle qu'on ouvre le plus, et elle partait sur neuf requêtes avant
// d'afficher quoi que ce soit.
//
// Trois mécaniques, les mêmes que là-bas :
//   1. le chrome d'abord — il était déjà là ;
//   2. le dernier état de l'onglet, ressorti du cache et affiché tout de suite ;
//   3. le chargement morceau par morceau — chaque bloc se dessine dès que SES
//      données arrivent, sans attendre celles des autres.

const CLE_CACHE = 'dashboard';

// Où chaque bloc va chercher ses données. Une source rend l'objet à fondre dans
// l'état, pas une liste nue : la semaine ramène ses quatre tables ensemble, et
// le reste du code n'a pas à savoir qu'elles voyagent de concert.
const SOURCES = {
  humeur: async () => ({ humeur: await api.humeurDuJour(versDateISO()) }),
  ...(VICTOIRES_VISIBLES
    ? { victoires: async () => ({ victoires: await api.dernieresVictoires(MAX_VICTOIRES) }) }
    : {}),
  objectifs: async () => ({ objectifs: await api.objectifsActifs() }),
  // Toutes les tâches datées, les faites comprises — le calendrier les garde
  // barrées. « Aujourd'hui » se déduit de cette même liste : une lecture au lieu
  // de deux, et une seule vérité sur ce qui est coché. Cocher une tâche la barre
  // donc aussi dans la semaine, ce qui n'était pas le cas avant.
  taches: async () => ({ tachesDatees: await api.tachesDatees() }),
  semaine: async () => {
    const [evenements, publications, commandes, contacts] = await Promise.all([
      // Les événements sans borne : une grille de semaine peut afficher un
      // événement commencé avant elle.
      api.evenementsTous(),
      api.publicationsDatees(),
      api.commandesToutes(),
      api.contactsTous(),
    ]);
    return { evenements, publications, commandes, contacts };
  },
};

// Ce que chaque source pose dans l'état. Le cache relit cette table pour ne
// garder que des données — et pour garder l'état VIVANT (une tâche cochée, une
// victoire retirée) plutôt que ce que le serveur avait répondu.
const DONNEES = {
  humeur: ['humeur'],
  ...(VICTOIRES_VISIBLES ? { victoires: ['victoires'] } : {}),
  objectifs: ['objectifs'],
  taches: ['tachesDatees'],
  semaine: ['evenements', 'publications', 'commandes', 'contacts'],
};

// --- Montage ----------------------------------------------------------------

function squelette() {
  return `
    <header class="jour" id="bloc-jour"></header>

    <!-- L'échec de chargement se dit sous l'en-tête, sur une ligne : le reste
         de la page tient, et ce qui était déjà affiché le reste. -->
    <div id="bloc-erreur"></div>

    <section class="bloc" id="bloc-humeur"></section>

    ${
      // Masqué pour le moment (demande de Noé, 13 août 2026) — voir
      // VICTOIRES_VISIBLES. Le bloc disparaît en entier plutôt que de rester
      // vide : un titre sans contenu se lit comme une panne.
      VICTOIRES_VISIBLES
        ? `<section class="bloc">
             <h2>Victoires récentes</h2>
             <div id="bloc-victoires"><p class="vide">…</p></div>
           </section>`
        : ''
    }

    <!-- « Aujourd'hui » passe AVANT « Ta semaine » (demande de Noé, 13 août
         2026). Ce qui se fait dans la journée vient avant ce qui se prépare —
         et il n'est plus « discret, en bas » : c'est devenu la liste des
         tâches, pas un pense-bête. -->
    <section class="bloc">
      <h2>Aujourd'hui</h2>
      <div id="bloc-taches"><p class="vide">…</p></div>
    </section>

    <section class="bloc">
      <h2>Ta semaine</h2>
      <div id="bloc-semaine"><p class="vide">…</p></div>
    </section>

    <!-- Les objectifs FERMENT la page (demande de Noé, 13 août 2026). Ils
         disent le cap, pas la journée : on les relit quand on lève la tête, pas
         en ouvrant l'application. Ce qui se fait maintenant — l'humeur, les
         tâches du jour, la semaine — passe devant. -->
    <section class="bloc">
      <h2>Tes objectifs</h2>
      <div id="bloc-objectifs"><p class="vide">…</p></div>
    </section>

    <!-- Le même « + » que l'espace Tâches, au même endroit : depuis l'accueil
         aussi, on doit pouvoir noter quelque chose sans changer de page. Il
         ouvre la tuile du calendrier — donc tout ce qui a une date, pas
         seulement une tâche. -->
    <button type="button" class="ouvrir-capture" data-ouvrir-creation
      title="Ajouter au calendrier" aria-label="Ajouter au calendrier">${PLUS}</button>

    <div id="bloc-creation"></div>
    <div id="bloc-detail"></div>
  `;
}

export default {
  async monter(section) {
    section.innerHTML = squelette();
    section.querySelector('#bloc-jour').innerHTML = construireEnTete();

    // L'état gardé entre deux rendus : ce que l'utilisateur peut modifier sans
    // recharger la page.
    const etat = {
      humeur: null,
      victoires: [],
      objectifs: [],
      tachesDatees: [],
      evenements: [],
      publications: [],
      commandes: [],
      contacts: [],
      humeurOuverte: false,
      annulation: null,
      creation: null,
      // La barre de la semaine touchée, sa fenêtre de détail (demande de Noé,
      // 14 août 2026) : la même que l'espace Calendrier — on modifie sans
      // quitter l'accueil, comme on y reporte déjà en glissant.
      detail: null,
      edition: false,
      jourOuvert: null,
    };
    let minuteurAnnulation = null;
    let rafraichirLaCapture = null;
    const aujourdhui = versDateISO();

    // Les tâches dont une écriture optimiste est en vol : l'écran a déjà
    // changé, le serveur pas encore. L'identifiant y reste le temps de
    // l'aller-retour, pour qu'un second appui n'envoie pas d'ordre contraire.
    const ecrituresEnVol = new Set();

    const cible = (id) => section.querySelector(`#${id}`);

    // --- Le chargement, morceau par morceau ---
    //
    // `affichables` dit ce qu'on peut dessiner — venu du serveur ou sorti du
    // cache. Un bloc dont la source manque garde ses points de suspension
    // plutôt que d'afficher un vide qui aurait l'air d'une réponse.
    const affichables = new Set();
    const enVol = new Map();
    let echec = false;
    const pret = (...cles) => cles.every((cle) => affichables.has(cle));

    // Le cache de session : le dernier état de l'onglet, affiché tout de suite.
    // C'est du papier peint, jamais une source — tout est redemandé au serveur
    // juste après, et réécrit dès la première réponse.
    const restaure = lireCache(CLE_CACHE);
    if (restaure) {
      // L'humeur est datée du jour. Un cache écrit hier soir dirait « Noté,
      // merci » pour une question qui n'a pas encore été posée aujourd'hui —
      // et la question du matin serait perdue. Elle repart donc du serveur.
      if (restaure.jour !== aujourdhui) delete restaure.humeur;

      for (const [cle, champs] of Object.entries(DONNEES)) {
        if (!champs.every((champ) => champ in restaure)) continue;
        for (const champ of champs) etat[champ] = restaure[champ];
        affichables.add(cle);
      }
    }

    // Ce qu'on remet en cache : les données, jamais l'état d'interface (la
    // tuile ouverte, l'humeur rouverte, la ligne d'annulation). Rouvrir
    // l'application doit retrouver le contenu, pas une fenêtre de la veille.
    const aGarder = () => {
      const garde = { jour: aujourdhui };
      for (const cle of affichables) {
        for (const champ of DONNEES[cle]) garde[champ] = etat[champ];
      }
      return garde;
    };

    // La tuile se redessine seule, dans son propre bloc : le reste de l'accueil
    // ne bouge pas quand on ouvre le « + ».
    function rendreCreation() {
      cible('bloc-creation').innerHTML = etat.creation
        ? fenetreCreation({ ...etat.creation, projets: PROJETS })
        : '';
      if (etat.creation) rafraichirLaCapture?.();
    }

    // Rouvrir une tâche de « Aujourd'hui » : la même tuile que le « + », mais
    // remplie de ce qu'elle contient. `id` est ce qui distingue les deux — la
    // tuile ne sait pas si elle crée ou si elle corrige, c'est l'envoi qui le
    // sait.
    function ouvrirLaTache(id) {
      const tache = etat.tachesDatees.find((candidate) => candidate.id === id);
      if (!tache) return;

      etat.creation = {
        id: tache.id,
        nature: 'tache',
        debut: tache.echeance,
        fin: tache.echeance,
        // La base rend « 18:00:00 » ; le champ n'en veut que les heures et les
        // minutes, sans quoi il refuse la valeur et s'affiche vide.
        heure: tache.heure ? tache.heure.slice(0, 5) : '',
        valeurs: { titre: tache.titre, projet: tache.projet, priorite: tache.priorite },
      };
      rendreCreation();
      cible('bloc-creation').querySelector('#cal-titre')?.focus();
    }

    // La fenêtre de détail d'une barre de la semaine, ou la journée dépliée
    // (le « +N ») : les mêmes fenêtres que l'espace Calendrier, dans leur
    // propre bloc — ouvrir un détail ne redessine rien d'autre.
    function rendreDetail() {
      cible('bloc-detail').innerHTML = etat.detail
        ? fenetreDetail(etat.detail, { montrerProjet: true, edition: etat.edition })
        : etat.jourOuvert
          ? fenetreJour(etat.jourOuvert, elementsDuJour(elementsDeLaSemaine, etat.jourOuvert), {
              montrerProjet: true,
            })
          : '';
    }

    const fermerLeDetail = () => {
      etat.detail = null;
      etat.edition = false;
      etat.jourOuvert = null;
      rendreDetail();
    };

    function rendreHumeur() {
      if (!pret('humeur')) return;
      cible('bloc-humeur').innerHTML = construireHumeur(
        etat.humeurOuverte ? null : etat.humeur,
      );
    }

    // Ce qui a déjà été vu à l'écran : une ligne absente de ces mémoires vient
    // d'arriver, et elle seule fait son entrée en fondu.
    const victoiresVues = new Set();
    const tachesVues = new Set();

    function rendreVictoires() {
      const bloc = cible('bloc-victoires');
      if (!bloc || !pret('victoires')) return;
      bloc.innerHTML = construireVictoires(etat.victoires.slice(0, MAX_VICTOIRES));
      marquerLesEntrantes(bloc, victoiresVues, {
        selecteur: '.liste-victoires > li',
        cle: (ligne) => ligne.querySelector('[data-victoire]')?.dataset.victoire,
      });
    }

    // Les intentions perso n'ont ni mesure ni date : elles n'ont donc pas leur
    // place dans un bloc de progression. Elles se relisent dans #perso.
    const objectifsDesProjets = () =>
      etat.objectifs.filter((objectif) => objectif.projet !== 'perso');

    function rendreObjectifs() {
      if (!pret('objectifs')) return;
      cible('bloc-objectifs').innerHTML = construireObjectifs(objectifsDesProjets());
    }

    // « Aujourd'hui » = ce qui est à faire aujourd'hui ou l'était déjà. Sans
    // borne basse, volontairement : une échéance passée reste visible plutôt
    // que de disparaître — le hub ne compte pas les retards, il ne les efface
    // pas non plus.
    //
    // Le tri est celui de l'espace Tâches (priorité, date, ancienneté) : cette
    // liste en a déjà la forme, elle en prend l'ordre. Il était jusqu'ici celui
    // de la base — donc indécis entre deux tâches du même jour, et changeant
    // d'un chargement à l'autre.
    const tachesDuJour = () =>
      trierTaches(
        etat.tachesDatees.filter(
          (tache) => tache.statut !== 'fait' && tache.echeance <= aujourdhui,
        ),
      );

    function rendreTaches() {
      if (!pret('taches')) return;
      const bloc = cible('bloc-taches');
      bloc.innerHTML = construireTaches(tachesDuJour(), etat.annulation);
      marquerLesEntrantes(bloc, tachesVues, {
        selecteur: '.tache-ligne',
        cle: (ligne) => ligne.querySelector('[data-cocher]')?.dataset.cocher,
      });
    }

    // La semaine montre TOUT ce qui a une date, comme l'espace Calendrier :
    // c'est la même grille, elle demande donc les mêmes sources. Elle les
    // attend toutes plutôt que de se dessiner amputée puis de se recomposer
    // sous les yeux — une grille qui gagne des barres une à une, c'est le
    // sautillement qu'on cherche justement à éviter.
    // Ce que la semaine a assemblé, gardé sous la main : glisser une barre a
    // besoin de retrouver l'élément saisi ET sa ligne d'origine, pour savoir
    // quelle colonne décaler en base.
    let elementsDeLaSemaine = [];

    function rendreSemaine() {
      if (!pret('taches', 'semaine', 'objectifs')) return;
      elementsDeLaSemaine = assemblerCalendrier({
        evenements: etat.evenements,
        taches: etat.tachesDatees,
        objectifs: objectifsDesProjets(),
        publications: etat.publications,
        commandes: etat.commandes.filter(
          (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
        ),
        relances: etat.contacts.filter((contact) => contact.prochaine_action_date),
      });
      cible('bloc-semaine').innerHTML = construireSemaine(elementsDeLaSemaine);
    }

    function rendreEchec() {
      cible('bloc-erreur').innerHTML = echec
        ? `<p class="vide">Les données n'ont pas pu être chargées.
             <button type="button" class="lien-discret"
               data-action="reessayer">Réessayer</button></p>`
        : '';
    }

    // Une écriture optimiste a échoué : l'écran est revenu en arrière, et il
    // faut le dire — un geste défait en silence ressemblerait à un bug. La
    // ligne s'efface seule, puis `rendreEchec` reprend la main sur le bloc.
    let minuteurSignal = null;
    function signalerEcriture() {
      cible('bloc-erreur').innerHTML =
        `<p class="vide">Ça n'a pas pu être enregistré — vérifie ta connexion.</p>`;
      clearTimeout(minuteurSignal);
      minuteurSignal = setTimeout(rendreEchec, 6000);
    }

    // Ce que l'arrivée d'une source redessine — et rien d'autre. Redessiner
    // toute la page à chaque réponse ferait perdre le curseur de la note
    // d'humeur à qui écrit pendant que le reste charge.
    const APRES = {
      humeur: rendreHumeur,
      victoires: rendreVictoires,
      // (`victoires` n'est appelé que si la source existe — voir
      // VICTOIRES_VISIBLES.)
      objectifs: () => {
        rendreObjectifs();
        rendreSemaine();
      },
      taches: () => {
        rendreTaches();
        rendreSemaine();
      },
      semaine: rendreSemaine,
    };

    const lancer = (cle) => {
      const promesse = SOURCES[cle]()
        .then((donnees) => {
          Object.assign(etat, donnees);
          affichables.add(cle);
          APRES[cle]();
        })
        .finally(() => enVol.delete(cle));
      enVol.set(cle, promesse);
      return promesse;
    };

    // Une source déjà en vol n'est pas relancée : revenir sur l'accueil pendant
    // qu'il charge ne double pas ses requêtes.
    async function charger() {
      try {
        await Promise.all(
          Object.keys(SOURCES).map((cle) => enVol.get(cle) ?? lancer(cle)),
        );
        echec = false;
      } catch (erreur) {
        console.error('Chargement du tableau de bord impossible', erreur);
        echec = true;
      }
      rendreEchec();
      ecrireCache(CLE_CACHE, aGarder());
    }

    // Revenir sur l'accueil le relit : une tâche posée depuis le calendrier ou
    // cochée dans l'espace Tâches doit s'y voir sans recharger la page.
    this.rafraichir = charger;

    // --- Interactions, par délégation sur la section entière ---

    // Les pastilles de la tuile, comme dans l'espace Calendrier.
    rafraichirLaCapture = brancherCapture(section);

    // Glisser une barre de la semaine la reporte, sans quitter l'accueil
    // (demande de Noé, 14 août 2026). C'est la même grille que l'espace
    // Calendrier, donc le même geste — il n'y avait aucune raison qu'il
    // s'arrête à la porte du tableau de bord.
    //
    // L'écriture est optimiste comme le reste : la barre change de jour tout de
    // suite, et revient si le serveur refuse.
    brancherDeplacement(section, async ({ element: cle, ecart }) => {
      const [type, id] = cle.split(':');
      const element = elementsDeLaSemaine.find(
        (candidat) => candidat.type === type && String(candidat.id) === id,
      );
      if (!element?.source) return;

      const champs = champsApresDeplacement(element, ecart);
      await modifierAussitot(element.source, champs, () => appliquerAuCalendrier(type, id, champs), {
        rendre: () => {
          rendreSemaine();
          rendreTaches();
        },
        echouer: signalerEcriture,
      });
    });

    const fermerLaCreation = () => {
      etat.creation = null;
      rendreCreation();
    };

    // Échap ferme la tuile ou la fenêtre — le geste attendu partout ailleurs.
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key !== 'Escape') return;
      if (etat.creation) fermerLaCreation();
      if (etat.detail || etat.jourOuvert) fermerLeDetail();
    });

    // Corriger sur place ce qui a une date, depuis la fenêtre de détail de la
    // semaine — le même aiguillage que l'espace Calendrier : `debut` est le nom
    // du champ à l'écran, chaque nature range sa date dans sa propre colonne.
    async function corriger(champs) {
      const { type, id } = champs;
      const titre = champs.titre.trim();

      if (type === 'evenement') {
        const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
        const fin = finDeLEvenement(debut, champs);
        return appliquerAuCalendrier(type, id, {
          titre,
          date_debut: debut.toISOString(),
          date_fin: fin ? fin.toISOString() : null,
          recurrence: champs.recurrence || null,
          recurrence_fin: champs.recurrence_fin || null,
          lieu: champs.lieu?.trim() || null,
          notes: champs.notes?.trim() || null,
          // Le champ n'existe que sur un événement photo (champsDeModification).
          ...(champs.type_moment !== undefined
            ? { type_moment: champs.type_moment || null }
            : {}),
          // Et ceux-ci que sur un événement fch. Le checkbox décoché est absent
          // du formulaire : c'est l'objet, toujours présent, qui dit que la
          // face réunion voyageait. Sans objet, pas d'animation qui tienne.
          ...(champs.reunion_objet !== undefined
            ? {
                reunion_objet: champs.reunion_objet || null,
                reunion_animee: champs.reunion_objet
                  ? champs.reunion_animee === 'oui'
                  : false,
              }
            : {}),
        });
      }

      if (type === 'publication') {
        return appliquerAuCalendrier(type, id, {
          titre,
          date_prevue: champs.debut,
          reseau: champs.reseau,
          format: champs.format,
        });
      }

      if (type === 'objectif') {
        return appliquerAuCalendrier(type, id, {
          titre,
          echeance: champs.debut,
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
        });
      }

      if (type === 'commande') {
        return appliquerAuCalendrier(type, id, {
          titre,
          echeance: champs.debut,
          client: champs.client?.trim() || null,
        });
      }

      if (type === 'relance') {
        return appliquerAuCalendrier(type, id, {
          prochaine_action: titre,
          prochaine_action_date: champs.debut,
        });
      }

      // Tâche et jalon : un titre et une échéance.
      return appliquerAuCalendrier(type, id, { titre, echeance: champs.debut });
    }

    // Chaque nature se supprime là où elle vit ; une relance n'est pas une
    // ligne à effacer, c'est une date qu'on retire d'une fiche.
    async function effacer(type, id) {
      if (type === 'evenement') return api.supprimerEvenement(id);
      if (type === 'tache') return api.supprimerTache(id);
      if (type === 'publication') return api.supprimerPublication(id);
      if (type === 'objectif') return api.supprimerObjectif(id);
      if (type === 'jalon') return api.supprimerJalon(id);
      if (type === 'commande') return api.supprimerCommande(id);
      if (type === 'relance') return api.modifierContact(id, { prochaine_action_date: null });
      throw new Error(`Nature inconnue : ${type}`);
    }

    section.addEventListener('submit', async (evenement) => {
      const modification = evenement.target.closest(
        'form[data-action="modifier-depuis-calendrier"]',
      );
      if (modification) {
        evenement.preventDefault();
        const champs = Object.fromEntries(new FormData(modification));
        const erreur = modification.querySelector('[data-erreur]');
        erreur.hidden = true;

        try {
          await corriger(champs);
          fermerLeDetail();
          // La correction peut toucher n'importe quel bloc : on relit tout,
          // comme le fait l'espace Calendrier après le même geste.
          await charger();
        } catch (souci) {
          console.error('Enregistrement impossible', souci);
          erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
          erreur.hidden = false;
        }
        return;
      }

      const formulaire = evenement.target.closest('form[data-action="creer-depuis-calendrier"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      formulaire.querySelector('[data-erreur]').hidden = true;

      // Corriger une tâche rouverte, ou en poser une neuve : `id` tranche.
      const corrige = etat.creation?.id
        ? etat.tachesDatees.find((tache) => tache.id === etat.creation.id)
        : null;

      // La tuile se referme tout de suite, et ce qu'on vient de poser s'installe
      // dans l'état sans rien redemander au serveur. Avant, chaque ligne notée
      // depuis l'accueil relançait les HUIT requêtes de la page — alors qu'on
      // connaît déjà la réponse : c'est ce qu'on vient d'écrire.
      etat.creation = null;
      rendreCreation();

      if (corrige) {
        const modifs = {
          titre: champs.titre.trim(),
          projet: champs.projet,
          echeance: champs.debut,
          heure: champs.heure || null,
          priorite: Number(champs.priorite) || 4,
        };
        await modifierAussitot(corrige, modifs, () => api.modifierTache(corrige.id, modifs), {
          rendre: () => {
            rendreTaches();
            rendreSemaine();
          },
          echouer: signalerEcriture,
        });
        return;
      }

      try {
        rangerLaCreation(champs.nature, await poserAuCalendrier(champs));
        rendreTaches();
        rendreObjectifs();
        rendreSemaine();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        signalerEcriture();
      }
    });

    // Où va ce qui vient d'être posé. La tuile pose les quatre natures ; chacune
    // rejoint la liste dont elle vient, et les blocs se redessinent à partir de
    // là — la semaine sait déjà assembler tout ça.
    function rangerLaCreation(nature, ligne) {
      if (!ligne) return;
      if (nature === 'tache') etat.tachesDatees = [...etat.tachesDatees, ligne];
      else if (nature === 'publication') etat.publications = [...etat.publications, ligne];
      else if (nature === 'objectif') etat.objectifs = [...etat.objectifs, ligne];
      else etat.evenements = [...etat.evenements, ligne];
    }

    section.addEventListener('click', async (evenement) => {
      if (evenement.target.closest('[data-ouvrir-creation]')) {
        etat.creation = { debut: aujourdhui, fin: aujourdhui, nature: NATURE_PAR_DEFAUT };
        rendreCreation();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        fermerLaCreation();
        fermerLeDetail();
        return;
      }

      const nature = evenement.target.closest('[data-nature-creation]');
      if (nature) {
        // Les dates sont éditables : on garde ce qui vient d'être saisi plutôt
        // que de revenir à ce que la tuile avait posé en s'ouvrant.
        etat.creation = {
          ...etat.creation,
          debut: section.querySelector('#cal-debut')?.value || etat.creation.debut,
          fin: section.querySelector('#cal-fin')?.value || etat.creation.fin,
          nature: nature.dataset.natureCreation,
        };
        rendreCreation();
        return;
      }

      // Le cercle d'une tâche DANS LA SEMAINE : il coche sans ouvrir le
      // détail, comme au calendrier — il passe donc avant l'ouverture. Le
      // décochage, lui, garde le chemin de la fenêtre ou de l'espace Tâches.
      const cercleSemaine = evenement.target.closest('[data-cocher-tache]');
      if (cercleSemaine) {
        evenement.stopPropagation();
        const tache = etat.tachesDatees.find(
          (candidate) => candidate.id === cercleSemaine.dataset.cocherTache,
        );
        if (!tache || tache.statut === 'fait' || ecrituresEnVol.has(tache.id)) return;

        await animerLaCoche(cercleSemaine);
        const avant = { ...tache };
        ecrituresEnVol.add(tache.id);
        try {
          // `avant` part à l'API : elle relit le statut pour créer la victoire.
          await modifierAussitot(
            tache,
            { statut: 'fait', date_fait: new Date().toISOString() },
            async () => (await api.terminerTache(avant)).tache,
            {
              rendre: () => {
                rendreTaches();
                rendreSemaine();
              },
              echouer: signalerEcriture,
            },
          );
        } finally {
          ecrituresEnVol.delete(tache.id);
        }
        return;
      }

      // Toucher une barre de la semaine ouvre son détail — la même fenêtre que
      // l'espace Calendrier, d'où l'on modifie et supprime (demande de Noé,
      // 14 août 2026).
      const ouvrirElement = evenement.target.closest('[data-element]');
      if (ouvrirElement) {
        const [type, id] = ouvrirElement.dataset.element.split(':');
        etat.detail =
          elementsDeLaSemaine.find(
            (candidat) => candidat.type === type && String(candidat.id) === id,
          ) ?? null;
        etat.edition = false;
        etat.jourOuvert = null;
        rendreDetail();
        return;
      }

      const journeeComplete = evenement.target.closest('[data-jour-complet]');
      if (journeeComplete) {
        etat.detail = null;
        etat.jourOuvert = journeeComplete.dataset.jourComplet;
        rendreDetail();
        return;
      }

      if (evenement.target.closest('[data-modifier-element]')) {
        etat.edition = true;
        rendreDetail();
        cible('bloc-detail').querySelector('#cal-edition-titre')?.focus();
        return;
      }

      if (evenement.target.closest('[data-annuler-edition]')) {
        etat.edition = false;
        rendreDetail();
        return;
      }

      const supprimerElement = evenement.target.closest('[data-supprimer-element]');
      if (supprimerElement) {
        const [type, id] = supprimerElement.dataset.supprimerElement.split(':');
        if (!confirm(`Supprimer « ${etat.detail?.titre} » ?`)) return;
        supprimerElement.disabled = true;
        try {
          await effacer(type, id);
          fermerLeDetail();
          await charger();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerElement.disabled = false;
          signalerEcriture();
        }
        return;
      }

      // La question du matin doit se répondre en un clic et se refermer aussi
      // vite : le « Noté, merci » ne passe donc plus par le réseau non plus.
      const bouton = evenement.target.closest('.bouton-humeur');
      if (bouton) {
        const niveau = Number(bouton.dataset.niveau);
        const avant = etat.humeur;
        etat.humeur = { date: aujourdhui, niveau, note: avant?.note ?? null };
        etat.humeurOuverte = false;
        rendreHumeur();

        try {
          etat.humeur = await api.enregistrerHumeur(aujourdhui, niveau, avant?.note ?? null);
        } catch (erreur) {
          console.error("Enregistrement de l'humeur impossible", erreur);
          etat.humeur = avant;
          // La question revient telle quelle : mieux vaut la reposer que
          // laisser croire qu'elle est enregistrée.
          rendreHumeur();
          signalerEcriture();
        }
        return;
      }

      if (evenement.target.closest('[data-action="rouvrir-humeur"]')) {
        etat.humeurOuverte = true;
        rendreHumeur();
        return;
      }

      if (evenement.target.closest('[data-annuler]')) return annulerDerniereTache();

      // Appuyer sur une tâche la rouvre pour la corriger (demande de Noé,
      // 14 août 2026). C'est un vrai bouton, pas une ligne qui écoute les
      // clics : au clavier comme au lecteur d'écran, une tâche s'ouvre.
      const ouvrir = evenement.target.closest('[data-ouvrir]');
      if (ouvrir) {
        ouvrirLaTache(ouvrir.dataset.ouvrir);
        return;
      }

      if (evenement.target.closest('[data-action="reessayer"]')) {
        echec = false;
        rendreEchec();
        await charger();
        return;
      }

      // Le cercle de la tâche, comme dans l'espace Tâches : c'est un bouton et
      // non une case à cocher depuis que les deux listes partagent leur forme.
      //
      // L'ÉCRAN D'ABORD, LE RÉSEAU ENSUITE (optimiste) : la tâche quitte
      // « Aujourd'hui », se barre dans la semaine, la victoire monte en tête et
      // la ligne d'annulation s'affiche au moment où le doigt touche. Les deux
      // requêtes partent en arrière-plan. Avant, le geste du matin attendait
      // leur aller-retour — 300 à 800 ms de cercle grisé sur téléphone.
      const cercle = evenement.target.closest('[data-cocher]');
      if (cercle) {
        const tache = tachesDuJour().find((candidate) => candidate.id === cercle.dataset.cocher);
        if (!tache || ecrituresEnVol.has(tache.id)) return;

        // On voit la coche se poser, PUIS la tâche quitte « Aujourd'hui ».
        await animerLaCoche(cercle);

        const avant = { ...tache };
        const faite = { ...tache, statut: 'fait', date_fait: new Date().toISOString() };
        // La victoire n'a pas encore d'identifiant serveur : celui-ci est
        // provisoire, remplacé par le vrai dès que l'écriture répond.
        const provisoire = {
          id: `provisoire-${tache.id}`,
          projet: tache.projet,
          titre: tache.titre,
          date: aujourdhui,
          source: 'tache',
          source_id: tache.id,
        };
        const annulation = {
          tache: faite,
          victoire: provisoire,
          ecriture: null,
          confirmee: false,
          annulee: false,
        };

        remplacerTache(faite);
        etat.victoires = [provisoire, ...etat.victoires];
        ouvrirAnnulation(annulation);
        rendreVictoires();
        rendreTaches();
        // La tâche est datée : elle est aussi dans la semaine, où elle devient
        // barrée. Sans ce rendu, la même tâche s'y afficherait encore à faire
        // deux blocs plus bas.
        rendreSemaine();

        ecrituresEnVol.add(tache.id);
        annulation.ecriture = (async () => {
          try {
            // `avant` et pas `faite` : l'API doit recevoir la tâche telle
            // qu'elle était, pas l'état que l'écran a pris de l'avance.
            const { tache: confirmee, victoire } = await api.terminerTache(avant);
            remplacerTache(confirmee);
            annulation.tache = confirmee;
            annulation.victoire = victoire;
            annulation.confirmee = true;
            etat.victoires = etat.victoires.map((v) =>
              v.id === provisoire.id ? victoire : v,
            );
            // La croix « retirer » porte maintenant le vrai identifiant.
            rendreVictoires();
          } catch (erreur) {
            console.error('Impossible de terminer la tâche', erreur);
            remplacerTache(avant);
            etat.victoires = etat.victoires.filter((v) => v.id !== provisoire.id);
            if (etat.annulation === annulation) {
              clearTimeout(minuteurAnnulation);
              etat.annulation = null;
            }
            rendreVictoires();
            rendreTaches();
            rendreSemaine();
            // Sauf si Noé avait déjà annulé : l'écran montre alors exactement
            // ce qu'il voulait — une tâche active — et il n'y a rien à signaler.
            if (!annulation.annulee) signalerEcriture();
          } finally {
            ecrituresEnVol.delete(tache.id);
          }
        })();
        return;
      }

      const retirer = evenement.target.closest('[data-victoire]');
      if (retirer) {
        // Une victoire encore provisoire n'a pas d'identifiant serveur : sa
        // croix attend la confirmation — une seconde au plus.
        if (retirer.dataset.victoire.startsWith('provisoire-')) return;

        const id = retirer.dataset.victoire;
        const rang = etat.victoires.findIndex((v) => v.id === id);
        if (rang === -1) return;
        const victoire = etat.victoires[rang];

        etat.victoires = etat.victoires.filter((v) => v.id !== id);
        rendreVictoires();

        try {
          await api.supprimerVictoire(id);
        } catch (erreur) {
          console.error('Suppression de la victoire impossible', erreur);
          // Remise à SA place dans le fil, qui est chronologique : la faire
          // réapparaître en tête donnerait une victoire du jour.
          etat.victoires = [
            ...etat.victoires.slice(0, rang),
            victoire,
            ...etat.victoires.slice(rang),
          ];
          rendreVictoires();
          signalerEcriture();
        }
      }
    });

    // La note s'enregistre 400 ms après la dernière frappe, comme sur Bac-3 :
    // on écrit une fois la phrase finie, pas une fois par lettre.
    let minuteurNote = null;
    async function enregistrerNote(valeur) {
      if (!etat.humeur) return;
      try {
        etat.humeur = await api.enregistrerHumeur(
          aujourdhui,
          etat.humeur.niveau,
          valeur.trim() || null,
        );
      } catch (erreur) {
        console.error('Enregistrement de la note impossible', erreur);
      }
    }

    section.addEventListener('input', (evenement) => {
      const note = evenement.target.closest('#note-humeur');
      if (!note) return;
      clearTimeout(minuteurNote);
      const valeur = note.value;
      minuteurNote = setTimeout(() => enregistrerNote(valeur), 400);
    });

    section.addEventListener('change', async (evenement) => {
      const note = evenement.target.closest('#note-humeur');
      if (note) {
        // Sortie du champ : on n'attend pas le minuteur.
        clearTimeout(minuteurNote);
        await enregistrerNote(note.value);
        return;
      }

    });

    function ouvrirAnnulation(annulation) {
      clearTimeout(minuteurAnnulation);
      etat.annulation = annulation;
      minuteurAnnulation = setTimeout(() => {
        etat.annulation = null;
        rendreTaches();
      }, DUREE_ANNULATION);
    }

    // Une tâche vient d'être cochée ou rouverte : elle reprend sa place dans la
    // liste des tâches datées, qui est la seule à les tenir. « Aujourd'hui » et
    // la semaine se déduisent de là, et disent donc la même chose.
    function remplacerTache(tache) {
      etat.tachesDatees = etat.tachesDatees.map((candidate) =>
        candidate.id === tache.id ? tache : candidate,
      );
    }

    async function annulerDerniereTache() {
      const annulation = etat.annulation;
      if (!annulation) return;

      clearTimeout(minuteurAnnulation);
      etat.annulation = null;
      annulation.annulee = true;

      // L'écran revient tout de suite ; le serveur suit.
      remplacerTache({ ...annulation.tache, statut: 'actif', date_fait: null });
      etat.victoires = etat.victoires.filter((v) => v.id !== annulation.victoire.id);
      rendreTaches();
      rendreVictoires();
      rendreSemaine();

      try {
        // La coche doit avoir fini de s'écrire avant d'être défaite. Cette
        // promesse ne rejette jamais — l'échec se lit dans `confirmee`, et
        // s'il n'y a rien eu d'écrit, il n'y a rien à défaire.
        await annulation.ecriture;
        if (!annulation.confirmee) return;
        // La victoire part d'abord : si la suite échoue, il vaut mieux une
        // tâche encore cochée qu'une victoire qui n'a pas eu lieu.
        await api.supprimerVictoire(annulation.victoire.id);
        remplacerTache(await api.rouvrirTache(annulation.tache));
      } catch (erreur) {
        console.error('Annulation impossible', erreur);
        // Le serveur dit « fait » : l'écran y revient plutôt que de mentir.
        remplacerTache(annulation.tache);
        etat.victoires = [
          annulation.victoire,
          ...etat.victoires.filter((v) => v.id !== annulation.victoire.id),
        ];
        rendreTaches();
        rendreVictoires();
        rendreSemaine();
        signalerEcriture();
      }
    }

    // Le cache est écrit à chaque chargement, mais l'état bouge aussi entre
    // deux : une tâche cochée, une humeur donnée, une victoire retirée. On le
    // reprend donc au moment où la page s'efface — le seul instant garanti sur
    // iOS, où une application ajoutée à l'écran d'accueil n'est jamais
    // « fermée », seulement mise de côté.
    const garderLEtat = () => ecrireCache(CLE_CACHE, aGarder());
    window.addEventListener('pagehide', garderLEtat);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') garderLEtat();
    });

    // Le premier rendu vient en dernier, une fois tout branché : sans quoi un
    // clic pendant le chargement tomberait dans le vide. Il ne coûte rien — il
    // sort du cache, ou ce sont les points de suspension du squelette.
    rendreHumeur();
    rendreVictoires();
    rendreObjectifs();
    rendreTaches();
    rendreSemaine();

    await charger();
  },
};
