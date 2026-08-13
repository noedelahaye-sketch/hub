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
import { construireLignesTaches } from './taches.js';

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

// --- Montage ----------------------------------------------------------------

function squelette() {
  return `
    <header class="jour" id="bloc-jour"></header>

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
      taches: [],
      humeurOuverte: false,
      annulation: null,
      creation: null,
    };
    let minuteurAnnulation = null;
    let rafraichirLaCapture = null;
    const aujourdhui = versDateISO();

    const cible = (id) => section.querySelector(`#${id}`);

    // La tuile se redessine seule, dans son propre bloc : le reste de l'accueil
    // ne bouge pas quand on ouvre le « + ».
    function rendreCreation() {
      cible('bloc-creation').innerHTML = etat.creation
        ? fenetreCreation({ ...etat.creation, projets: PROJETS })
        : '';
      if (etat.creation) rafraichirLaCapture?.();
    }

    function rendreHumeur() {
      cible('bloc-humeur').innerHTML = construireHumeur(
        etat.humeurOuverte ? null : etat.humeur,
      );
    }

    function rendreVictoires() {
      cible('bloc-victoires').innerHTML = construireVictoires(
        etat.victoires.slice(0, MAX_VICTOIRES),
      );
    }

    function rendreTaches() {
      cible('bloc-taches').innerHTML = construireTaches(etat.taches, etat.annulation);
    }

    async function charger() {
      // La semaine montre TOUT ce qui a une date, comme l'espace Calendrier :
      // c'est la même grille, elle demande donc les mêmes sources. Les
      // événements sans borne — une grille de semaine peut afficher un
      // événement commencé avant elle.
      const [
        humeur,
        victoires,
        objectifs,
        evenements,
        tachesDatees,
        duJour,
        publications,
        commandes,
        contacts,
      ] = await Promise.all([
        api.humeurDuJour(aujourdhui),
        api.dernieresVictoires(MAX_VICTOIRES),
        api.objectifsActifs(),
        api.evenementsTous(),
        api.tachesDatees(),
        // « Aujourd'hui » = ce qui est à faire aujourd'hui ou l'était déjà.
        // Sans borne basse, volontairement : une échéance passée reste visible
        // plutôt que de disparaître — le hub ne compte pas les retards, il ne
        // les efface pas non plus.
        api.tachesEcheanceJusqua(aujourdhui),
        api.publicationsDatees(),
        api.commandesToutes(),
        api.contactsTous(),
      ]);

      etat.humeur = humeur;
      etat.victoires = victoires;
      etat.taches = duJour;

      rendreHumeur();
      rendreVictoires();
      rendreTaches();

      // Les intentions perso n'ont ni mesure ni date : elles n'ont donc pas leur
      // place dans un bloc de progression. Elles se relisent dans #perso.
      cible('bloc-objectifs').innerHTML = construireObjectifs(
        objectifs.filter((objectif) => objectif.projet !== 'perso'),
      );

      cible('bloc-semaine').innerHTML = construireSemaine(
        assemblerCalendrier({
          evenements,
          taches: tachesDatees,
          objectifs: objectifs.filter((objectif) => objectif.projet !== 'perso'),
          publications,
          commandes: commandes.filter(
            (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
          ),
          relances: contacts.filter((contact) => contact.prochaine_action_date),
        }),
      );
    }

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement du tableau de bord impossible', erreur);
      section.innerHTML = `
        ${construireEnTete()}
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>
      `;
      section.querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

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

      // Le cercle de la tâche, comme dans l'espace Tâches : c'est un bouton et
      // non une case à cocher depuis que les deux listes partagent leur forme.
      const cercle = evenement.target.closest('[data-cocher]');
      if (cercle) {
        const tache = etat.taches.find((candidate) => candidate.id === cercle.dataset.cocher);
        if (!tache) return;

        cercle.disabled = true;
        try {
          // Terminer une tâche crée sa victoire : elle quitte le bas de la page
          // pour rejoindre le haut.
          const { tache: faite, victoire } = await api.terminerTache(tache);
          etat.taches = etat.taches.filter((candidate) => candidate.id !== tache.id);
          etat.victoires = [victoire, ...etat.victoires];
          ouvrirAnnulation({ tache: faite, victoire });
          rendreVictoires();
          rendreTaches();
        } catch (erreur) {
          console.error('Impossible de terminer la tâche', erreur);
          cercle.disabled = false;
        }
        return;
      }

      const retirer = evenement.target.closest('[data-victoire]');
      if (retirer) {
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

    async function annulerDerniereTache() {
      const annulation = etat.annulation;
      if (!annulation) return;

      clearTimeout(minuteurAnnulation);
      etat.annulation = null;
      try {
        // La victoire part d'abord : si la suite échoue, il vaut mieux une
        // tâche encore cochée qu'une victoire qui n'a pas eu lieu.
        await api.supprimerVictoire(annulation.victoire.id);
        const tache = await api.rouvrirTache(annulation.tache);
        etat.victoires = etat.victoires.filter((v) => v.id !== annulation.victoire.id);
        etat.taches = [...etat.taches, tache];
      } catch (erreur) {
        console.error('Annulation impossible', erreur);
      }
      rendreTaches();
      rendreVictoires();
    }
  },
};
