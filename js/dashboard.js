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
  ajouterJours,
  dateLongue,
  echeanceLisible,
  momentLisible,
  echapper,
  NOMS_PROJETS,
} from './format.js';

const PRENOM = 'Noé';
const MAX_VICTOIRES = 5;
const MAX_TACHES = 9; // 3 projets x 3 tâches actives
const JOURS_SEMAINE = 7;

const NIVEAUX_HUMEUR = [
  { niveau: 1, frimousse: '😔', mot: 'difficile' },
  { niveau: 2, frimousse: '😕', mot: 'bof' },
  { niveau: 3, frimousse: '😐', mot: 'ça va' },
  { niveau: 4, frimousse: '🙂', mot: 'bien' },
  { niveau: 5, frimousse: '😄', mot: 'super' },
];

// --- Fabrication du HTML ----------------------------------------------------

function pastille(projet) {
  return `<span class="pastille" data-projet="${echapper(projet)}"
    title="${echapper(NOMS_PROJETS[projet] ?? projet)}"></span>`;
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
      <li>
        ${pastille(victoire.projet)}
        <span class="victoire-titre">${echapper(victoire.titre)}</span>
        <span class="discret quand">${echapper(
          echeanceLisible(depuisDateISO(victoire.date)),
        )}</span>
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

  const echeance = objectif.echeance
    ? `<span class="discret echeance">${echapper(
        echeanceLisible(depuisDateISO(objectif.echeance)),
      )}</span>`
    : '';

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
    <details class="objectif">
      <summary>
        <span class="objectif-tete">
          ${pastille(objectif.projet)}
          <span class="objectif-titre">${echapper(objectif.titre)}</span>
          ${echeance}
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

export function construireSemaine(elements) {
  if (!elements.length) {
    return `<p class="vide">Rien de prévu dans les sept prochains jours.</p>`;
  }

  const lignes = elements
    .map(
      (element) => `
      <li>
        ${pastille(element.projet)}
        <span class="semaine-titre">${echapper(element.titre)}</span>
        <span class="discret quand">${echapper(element.quand)}</span>
      </li>`,
    )
    .join('');

  return `<ul class="liste-semaine">${lignes}</ul>`;
}

export function construireTaches(taches) {
  if (!taches.length) {
    return `<p class="vide">Rien d'actif en ce moment.</p>`;
  }

  const lignes = taches
    .slice(0, MAX_TACHES)
    .map(
      (tache) => `
      <li>
        <label>
          <input type="checkbox" data-tache="${echapper(tache.id)}">
          ${pastille(tache.projet)}
          <span class="tache-titre">${echapper(tache.titre)}</span>
          ${
            tache.echeance
              ? `<span class="discret quand">${echapper(
                  echeanceLisible(depuisDateISO(tache.echeance)),
                )}</span>`
              : ''
          }
        </label>
      </li>`,
    )
    .join('');

  return `<ul class="liste-taches">${lignes}</ul>`;
}

// Fusionne événements et échéances de tâches en une seule liste ordonnée.
export function assemblerSemaine(evenements, taches, maintenant = new Date()) {
  const elements = [
    ...evenements.map((evenement) => {
      const date = new Date(evenement.date_debut);
      return {
        date,
        projet: evenement.projet,
        titre: evenement.titre,
        quand: momentLisible(date),
      };
    }),
    ...taches.map((tache) => {
      const date = depuisDateISO(tache.echeance);
      return {
        date,
        projet: tache.projet,
        titre: tache.titre,
        quand: `à rendre ${echeanceLisible(date, maintenant)}`,
      };
    }),
  ];

  return elements.sort((a, b) => a.date - b.date);
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

    <section class="bloc">
      <h2>Ta semaine</h2>
      <div id="bloc-semaine"><p class="vide">…</p></div>
    </section>

    <section class="bloc bloc-discret">
      <h2>Aujourd'hui</h2>
      <div id="bloc-taches"><p class="vide">…</p></div>
    </section>
  `;
}

export default {
  async monter(section) {
    section.innerHTML = squelette();
    section.querySelector('#bloc-jour').innerHTML = construireEnTete();

    // L'état gardé entre deux rendus : ce que l'utilisateur peut modifier sans
    // recharger la page.
    const etat = { humeur: null, victoires: [], taches: [], humeurOuverte: false };
    const aujourdhui = versDateISO();
    const finSemaine = ajouterJours(new Date(), JOURS_SEMAINE);

    const cible = (id) => section.querySelector(`#${id}`);

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
      cible('bloc-taches').innerHTML = construireTaches(etat.taches);
    }

    try {
      const [humeur, victoires, objectifs, evenements, echeances, taches] =
        await Promise.all([
          api.humeurDuJour(aujourdhui),
          api.dernieresVictoires(MAX_VICTOIRES),
          api.objectifsActifs(),
          api.evenementsEntre(new Date().toISOString(), finSemaine.toISOString()),
          api.tachesEcheanceJusqua(versDateISO(finSemaine)),
          api.tachesActives(),
        ]);

      etat.humeur = humeur;
      etat.victoires = victoires;
      etat.taches = taches;

      rendreHumeur();
      rendreVictoires();
      rendreTaches();

      // Les intentions perso n'ont ni mesure ni date : elles n'ont donc pas leur
      // place dans un bloc de progression. Elles se relisent dans #perso.
      cible('bloc-objectifs').innerHTML = construireObjectifs(
        objectifs.filter((objectif) => objectif.projet !== 'perso'),
      );

      cible('bloc-semaine').innerHTML = construireSemaine(
        assemblerSemaine(evenements, echeances),
      );
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

    section.addEventListener('click', async (evenement) => {
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

      const case_ = evenement.target.closest('[data-tache]');
      if (!case_ || !case_.checked) return;

      const tache = etat.taches.find((candidate) => candidate.id === case_.dataset.tache);
      if (!tache) return;

      case_.disabled = true;
      try {
        // Terminer une tâche crée sa victoire : elle quitte le bas de la page
        // pour rejoindre le haut.
        const { victoire } = await api.terminerTache(tache);
        etat.taches = etat.taches.filter((candidate) => candidate.id !== tache.id);
        etat.victoires = [victoire, ...etat.victoires];
        rendreVictoires();
        rendreTaches();
      } catch (erreur) {
        console.error('Impossible de terminer la tâche', erreur);
        case_.checked = false;
        case_.disabled = false;
      }
    });
  },
};
