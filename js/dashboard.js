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
  brancherCapture,
  poserAuCalendrier,
} from './calendrier-commun.js';
import { construireLignesTaches, trierTaches } from './taches.js';
import { lireCache, ecrireCache } from './cache-session.js';

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

  return `${ligneAnnulation}${construireLignesTaches(taches.slice(0, MAX_TACHES), {
    ouvrable: false,
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
  victoires: async () => ({ victoires: await api.dernieresVictoires(MAX_VICTOIRES) }),
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
  victoires: ['victoires'],
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

    <section class="bloc">
      <h2>Victoires récentes</h2>
      <div id="bloc-victoires"><p class="vide">…</p></div>
    </section>

    <section class="bloc">
      <h2>Tes objectifs</h2>
      <div id="bloc-objectifs"><p class="vide">…</p></div>
    </section>

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

    <!-- Le même « + » que l'espace Tâches, au même endroit : depuis l'accueil
         aussi, on doit pouvoir noter quelque chose sans changer de page. Il
         ouvre la tuile du calendrier — donc tout ce qui a une date, pas
         seulement une tâche. -->
    <button type="button" class="ouvrir-capture" data-ouvrir-creation
      title="Ajouter au calendrier" aria-label="Ajouter au calendrier">${PLUS}</button>

    <div id="bloc-creation"></div>
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

    function rendreHumeur() {
      if (!pret('humeur')) return;
      cible('bloc-humeur').innerHTML = construireHumeur(
        etat.humeurOuverte ? null : etat.humeur,
      );
    }

    function rendreVictoires() {
      if (!pret('victoires')) return;
      cible('bloc-victoires').innerHTML = construireVictoires(
        etat.victoires.slice(0, MAX_VICTOIRES),
      );
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
      cible('bloc-taches').innerHTML = construireTaches(tachesDuJour(), etat.annulation);
    }

    // La semaine montre TOUT ce qui a une date, comme l'espace Calendrier :
    // c'est la même grille, elle demande donc les mêmes sources. Elle les
    // attend toutes plutôt que de se dessiner amputée puis de se recomposer
    // sous les yeux — une grille qui gagne des barres une à une, c'est le
    // sautillement qu'on cherche justement à éviter.
    function rendreSemaine() {
      if (!pret('taches', 'semaine', 'objectifs')) return;
      cible('bloc-semaine').innerHTML = construireSemaine(
        assemblerCalendrier({
          evenements: etat.evenements,
          taches: etat.tachesDatees,
          objectifs: objectifsDesProjets(),
          publications: etat.publications,
          commandes: etat.commandes.filter(
            (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
          ),
          relances: etat.contacts.filter((contact) => contact.prochaine_action_date),
        }),
      );
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

    const fermerLaCreation = () => {
      etat.creation = null;
      rendreCreation();
    };

    // Échap ferme la tuile — le geste attendu partout ailleurs dans le hub.
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && etat.creation) fermerLaCreation();
    });

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="creer-depuis-calendrier"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        await poserAuCalendrier(champs);
        etat.creation = null;
        rendreCreation();
        // Ce qu'on vient de poser doit se voir : la semaine et les tâches du
        // jour se relisent, sinon on écrit dans le vide.
        await charger();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    section.addEventListener('click', async (evenement) => {
      if (evenement.target.closest('[data-ouvrir-creation]')) {
        etat.creation = { debut: aujourdhui, fin: aujourdhui, nature: NATURE_PAR_DEFAUT };
        rendreCreation();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) {
        fermerLaCreation();
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

      const bouton = evenement.target.closest('.bouton-humeur');
      if (bouton) {
        const niveau = Number(bouton.dataset.niveau);
        bouton.classList.add('en-cours');
        try {
          etat.humeur = await api.enregistrerHumeur(
            aujourdhui,
            niveau,
            etat.humeur?.note ?? null,
          );
          etat.humeurOuverte = false;
          rendreHumeur();
        } catch (erreur) {
          console.error("Enregistrement de l'humeur impossible", erreur);
          bouton.classList.remove('en-cours');
        }
        return;
      }

      if (evenement.target.closest('[data-action="rouvrir-humeur"]')) {
        etat.humeurOuverte = true;
        rendreHumeur();
        return;
      }

      if (evenement.target.closest('[data-annuler]')) return annulerDerniereTache();

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
        retirer.disabled = true;
        try {
          await api.supprimerVictoire(retirer.dataset.victoire);
          etat.victoires = etat.victoires.filter((v) => v.id !== retirer.dataset.victoire);
          rendreVictoires();
        } catch (erreur) {
          console.error('Suppression de la victoire impossible', erreur);
          retirer.disabled = false;
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
