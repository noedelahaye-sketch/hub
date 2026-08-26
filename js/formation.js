// Espace formation — Bac+3 Studi.
//
// **Un bilan, comme les pages Yuno et FCH** (refonte du 26 août 2026). Le cap
// et ce qu'il y a à faire d'abord, les révisions et le bilan ensuite, les
// raccourcis en pied de page.
//
// C'est la dernière page à quitter la fabrique `creerEspaceProjet`, qui n'avait
// plus qu'elle : la fabrique est partie avec. Ce que la formation a en propre
// et que les deux autres n'ont pas — la progression des révisions, lue dans le
// gist public du site Bac-3 — occupe le panneau que Yuno donne à son rythme.
//
// Elle n'a AUCUN événement en base, et n'a donc pas de bloc « À venir » : un
// panneau qui serait vide en permanence vaut moins que pas de panneau. Ses
// échéances sont ses jalons, et ils vivent dans le cap.

import * as api from './api.js';
import { construireLignesTaches, trierTaches, cocherDepuisTableauDeBord } from './taches.js';
import { construireCapGrave } from './objectifs-commun.js';
import {
  fenetreCreation,
  brancherCapture,
  poserAuCalendrier,
} from './calendrier-commun.js';
import { versDateISO, depuisDateISO, momentLisible, echapper } from './format.js';
import { progressionRevisions } from './revisions.js';

const SITE_REVISION = 'https://noedelahaye-sketch.github.io/Bac-3/';

const pluriel = (nombre, singulier, plurielMot) => (nombre > 1 ? plurielMot : singulier);

export function construireRevisions(revisions) {
  if (revisions === null) {
    return `<p class="vide">La progression des révisions n'a pas pu être lue.</p>`;
  }

  const pourcentage = Math.round((revisions.livrables / revisions.totalLivrables) * 100);

  // Pas de dénominateur pour les cartes ni les résumés : leur total vit dans le
  // contenu généré de Bac-3, pas dans le gist. Inventer une base donnerait un
  // chiffre différent de celui affiché là-bas.
  const chiffres = [
    [revisions.cartesVues, pluriel(revisions.cartesVues, 'carte vue', 'cartes vues')],
    [revisions.cartesMaitrisees, pluriel(revisions.cartesMaitrisees, 'maîtrisée', 'maîtrisées')],
    [revisions.resumesLus, pluriel(revisions.resumesLus, 'résumé lu', 'résumés lus')],
    [revisions.serie, pluriel(revisions.serie, "jour d'affilée", "jours d'affilée")],
  ];

  const enPlus = [
    revisions.resumesEnCours
      ? `${revisions.resumesEnCours} ${pluriel(
          revisions.resumesEnCours,
          'résumé en cours',
          'résumés en cours',
        )}`
      : null,
    revisions.scoreQuiz !== null ? `score quiz moyen ${revisions.scoreQuiz}&nbsp;%` : null,
  ].filter(Boolean);

  return `
    <div class="barre" role="img"
      aria-label="${revisions.livrables} livrables sur ${revisions.totalLivrables}">
      <span style="width: ${pourcentage}%"></span>
    </div>
    <p class="discret progression-legende"><span class="chiffre">${revisions.livrables}/${revisions.totalLivrables}</span> livrables rédigés</p>

    <ul class="chiffres-cles">
      ${chiffres
        .map(
          ([valeur, libelle]) => `
        <li><span class="chiffre chiffre-cle">${valeur}</span> <span class="discret">${libelle}</span></li>`,
        )
        .join('')}
    </ul>

    ${enPlus.length ? `<p class="discret note-regle">${enPlus.join(' · ')}</p>` : ''}`;
}

const RACCOURCIS = [
  { cle: 'tache', mot: 'Une tâche' },
  { cle: 'evenement', mot: 'Un événement' },
];

export function construireCap(objectifs) {
  if (!objectifs.length) {
    return `<p class="vide">Ton cap s'écrira ici.</p>`;
  }
  return construireCapGrave(objectifs);
}

export function construireTaches(taches) {
  const aFaire = trierTaches(taches.filter((tache) => tache.statut !== 'fait'));
  if (!aFaire.length) {
    return `<p class="vide">Rien à faire pour la formation. Note ta prochaine tâche au-dessous.</p>`;
  }
  // Ni ouvrable ni supprimable : corriger et supprimer une tâche vivent dans
  // l'espace Tâches. Ici on la coche, et c'est tout.
  return construireLignesTaches(aFaire, { ouvrable: false, supprimable: false });
}

export function construireBilan(taches, victoires) {
  const faites = taches.filter((tache) => tache.statut === 'fait').length;

  const liste = victoires.length
    ? `<ul class="liste-victoires-pliee">${victoires
        .map(
          (victoire) => `
          <li>
            <span>${echapper(victoire.titre)}</span>
            <span class="discret quand">${echapper(
              momentLisible(depuisDateISO(victoire.date)),
            )}</span>
          </li>`,
        )
        .join('')}</ul>`
    : `<p class="vide">Tes premières victoires de formation s'afficheront ici.</p>`;

  return `
    <div class="chiffres-nus">
      <div class="chiffre-nu">
        <span class="chiffre">${faites}</span>
        <span class="discret">tâches faites</span>
      </div>
      <div class="chiffre-nu">
        <span class="chiffre">${victoires.length}</span>
        <span class="discret">victoires</span>
      </div>
    </div>

    <details class="depli-victoires">
      <summary>Voir les victoires</summary>
      ${liste}
    </details>`;
}

function squelette(etat) {
  return `
    <!-- Le nom ne s'écrit plus : l'onglet de la barre le dit déjà. Il reste ici
         pour les lecteurs d'écran. -->
    <h1 class="hors-ecran">Formation</h1>

    <div class="grille-yuno">
      <!-- La tuile ENTIÈRE mène au détail des objectifs. -->
      <section class="bloc panneau panneau-lien" style="--place: cap">
        <h2>Le cap</h2>
        <div data-bloc="cap">${construireCap(etat.objectifs)}</div>
      </section>

      <section class="bloc panneau" style="--place: faire">
        <h2>À faire</h2>
        <div data-bloc="taches">${construireTaches(etat.taches)}</div>
      </section>

      <section class="bloc panneau" style="--place: rythme">
        <h2>Les révisions</h2>
        <div data-bloc="revisions"><p class="vide">…</p></div>
      </section>

      <section class="bloc panneau" style="--place: reseau">
        <h2>Le bilan</h2>
        <div data-bloc="bilan">${construireBilan(etat.taches, etat.victoires)}</div>
      </section>
    </div>

    <div id="bloc-creation-formation"></div>

    <div class="pied-yuno">
      ${RACCOURCIS.map(
        ({ cle, mot }) => `
        <button type="button" class="bouton-noter" data-noter="${cle}">
          <span aria-hidden="true">+</span> ${echapper(mot)}
        </button>`,
      ).join('')}

      <!-- La seule porte du hub qui sorte du hub : le site de révision est un
           autre site, d'où l'onglet neuf. -->
      <a class="pastille-porte" href="${SITE_REVISION}" target="_blank" rel="noopener">
        <span>Ouvrir le site Bac+3</span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
    </div>`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section) {
    const etat = { creation: null, objectifs: [], taches: [], victoires: [] };

    const charger = async () => {
      const [objectifs, taches, victoires] = await Promise.all([
        api.objectifsActifs({ projet: 'formation' }),
        api.tachesDuProjet('formation'),
        api.victoiresDuProjet('formation', 20),
      ]);
      Object.assign(etat, { objectifs, taches, victoires });
    };

    // Les révisions viennent d'ailleurs (GitHub) : leur échec ne doit pas
    // emporter le reste de la page, et elles se lisent après elle.
    const chargerLesRevisions = () => {
      const cible = section.querySelector('[data-bloc="revisions"]');
      if (!cible) return;
      progressionRevisions()
        .then((revisions) => {
          cible.innerHTML = construireRevisions(revisions);
        })
        .catch((erreur) => {
          console.error('Lecture des révisions impossible', erreur);
          cible.innerHTML = construireRevisions(null);
        });
    };

    const redessiner = () => {
      section.innerHTML = squelette(etat);
      chargerLesRevisions();
    };

    this.rafraichir = async () => {
      await charger();
      redessiner();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error("Chargement de l'espace formation impossible", erreur);
      section.innerHTML = `
        <h1>Formation</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    redessiner();

    const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

    // --- La tuile de capture ---

    const rendreCreation = () => {
      const hote = section.querySelector('#bloc-creation-formation');
      hote.innerHTML = etat.creation ? fenetreCreation(etat.creation) : '';
      if (etat.creation) {
        rafraichirLaCapture?.();
        hote.querySelector('#cal-titre')?.focus();
      }
    };

    const fermerLaCreation = () => {
      etat.creation = null;
      rendreCreation();
    };

    const rafraichirLaCapture = brancherCapture(section);

    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && etat.creation) fermerLaCreation();
    });

    section.addEventListener('click', async (evenement) => {
      const noter = evenement.target.closest('[data-noter]');
      if (noter) {
        const jour = versDateISO();
        etat.creation = { nature: noter.dataset.noter, debut: jour, fin: jour };
        rendreCreation();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) return fermerLaCreation();

      const cercle = evenement.target.closest('[data-cocher]');
      if (cercle) {
        return cocherDepuisTableauDeBord(cercle, etat.taches, () => {
          bloc('taches').innerHTML = construireTaches(etat.taches);
          bloc('bilan').innerHTML = construireBilan(etat.taches, etat.victoires);
        });
      }
    });

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="creer-depuis-calendrier"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      erreur.hidden = true;

      try {
        const pose = await poserAuCalendrier(champs, { projetParDefaut: 'formation' });
        fermerLaCreation();
        if (champs.nature === 'tache') {
          etat.taches = [...etat.taches, pose];
          bloc('taches').innerHTML = construireTaches(etat.taches);
        }
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
        erreur.hidden = false;
      }
    });
  },
};
