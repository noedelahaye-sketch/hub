// La page FC Hermitage DU hub (#fch) — à ne pas confondre avec le site
// (#hermitage, js/hermitage.js), qui masque tout l'habillage du hub.
//
// **Le site est l'atelier, cette page est le bilan** (refonte du 26 août 2026,
// après celle de la page Yuno). Le site répond à « qu'est-ce que je fais
// maintenant » ; cette page répond à « où j'en suis ». D'où son ordre : le cap
// et ce qu'il y a à faire d'abord, le bilan ensuite.
//
// Elle ne décalque PAS la page Yuno, parce que la matière n'est pas la même.
// Le FCH n'a ni photos ni prestations, et ses partenaires ne sont pas en base —
// ils vivent dans le tableur du club. Ce qu'il a en propre : un calendrier
// éditorial à trois états, des réunions, et une alternance qui finit le
// 31 décembre. La page dit ça, et rien qu'elle ne puisse tenir.

import * as api from './api.js';
import { construireApercuCreation } from './publications.js';
import {
  construireLignesTaches,
  trierTaches,
  cocherDepuisTableauDeBord,
} from './taches.js';
import { construireCapGrave } from './objectifs-commun.js';
import {
  fenetreCreation,
  brancherCapture,
  poserAuCalendrier,
  nomDuStatut,
  CYCLES_PUBLICATION,
} from './calendrier-commun.js';
import { versDateISO, depuisDateISO, momentLisible, echapper } from './format.js';
import { finDeLaSortie } from './preparations-commun.js';

const MAX_VICTOIRES = 20;

// Les raccourcis du pied de page. Une réunion est un événement : c'est la
// pastille « Réunion » de la tuile qui la distingue, et elle n'existe qu'au FCH.
const RACCOURCIS = [
  { cle: 'tache', mot: 'Une tâche' },
  { cle: 'publication', mot: 'Une publication' },
  { cle: 'evenement', mot: 'Une réunion' },
];

// --- Calculs ----------------------------------------------------------------

// Une réunion est un événement qui porte un objet (docs/fch-spec.md, §5).
//
// On compare à sa FIN, pas à son début : une réunion notée aujourd'hui sans
// heure tombe à minuit, et se serait crue passée dès la première heure du jour.
// `finDeLaSortie` porte déjà la convention du hub — minuit veut dire « pas
// d'heure », et l'événement tient alors jusqu'au bout de sa journée.
export function prochaineReunion(evenements, reference = new Date()) {
  return (
    evenements
      .filter((e) => e.reunion_objet && finDeLaSortie(e) >= reference)
      .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0] ?? null
  );
}

// --- Fabrication du HTML ----------------------------------------------------

// Le calendrier éditorial en une barre : combien à préparer, à programmer,
// publié. Le club n'a que trois états (25 août 2026), ce qui en fait une vraie
// chaîne — on voit d'un regard où le travail s'accumule.
export function construireChaine(publications) {
  const etats = CYCLES_PUBLICATION.fch;
  const datees = publications.filter((pub) => pub.date_prevue || pub.statut === 'publie');

  const comptes = etats.map((statut) => ({
    statut,
    mot: nomDuStatut('fch', statut),
    nombre: datees.filter((pub) => pub.statut === statut).length,
  }));

  const idees = publications.filter((pub) => !pub.date_prevue && pub.statut === 'idee').length;

  if (!datees.length) {
    return `<p class="vide">Tes publications s'afficheront ici.${
      idees ? ` <span class="chiffre">${idees}</span> idées attendent une date.` : ''
    }</p>`;
  }

  const resume = comptes.map(({ nombre, mot }) => `${nombre} ${mot}`).join(', ');

  return `
    <div class="entonnoir" role="img" aria-label="${echapper(resume)}">
      ${comptes
        .filter(({ nombre }) => nombre)
        .map(
          ({ statut, nombre }) =>
            `<span class="entonnoir-part" data-chaine="${statut}"
               style="flex-grow: ${nombre}"></span>`,
        )
        .join('')}
    </div>
    <ul class="entonnoir-legende">
      ${comptes
        .map(
          ({ statut, mot, nombre }) => `
        <li><span class="entonnoir-puce" data-chaine="${statut}" aria-hidden="true"></span>
          <span class="chiffre">${nombre}</span> <span class="discret">${echapper(mot)}</span></li>`,
        )
        .join('')}
      ${
        idees
          ? `<li><span class="entonnoir-puce entonnoir-vide" aria-hidden="true"></span>
              <span class="chiffre">${idees}</span>
              <span class="discret">en banque, sans date</span></li>`
          : ''
      }
    </ul>`;
}

// Trois chiffres nus, et les victoires qu'on ouvre. Le FCH ne mesure pas des
// sorties comme Yuno : il mesure ce qui est sorti, ce qui est fait, ce qui a
// compté.
export function construireBilan(publications, taches, victoires) {
  const publiees = publications.filter((pub) => pub.statut === 'publie').length;
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
    : `<p class="vide">Tes premières victoires au club s'afficheront ici.</p>`;

  return `
    <div class="chiffres-nus">
      <div class="chiffre-nu">
        <span class="chiffre">${publiees}</span>
        <span class="discret">publications sorties</span>
      </div>
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

export function construireTaches(taches, evenements) {
  const aFaire = trierTaches(taches.filter((tache) => tache.statut !== 'fait'));
  const reunion = prochaineReunion(evenements);

  // Ni ouvrable ni supprimable : corriger et supprimer une tâche vivent dans
  // l'espace Tâches. Ici on la coche, et c'est tout — offrir les deux autres
  // gestes sans les traiter ferait des boutons morts.
  const lignes = aFaire.length
    ? construireLignesTaches(aFaire, { ouvrable: false, supprimable: false, projet: false })
    : `<p class="vide">Rien à faire pour le club. Note ta prochaine tâche au-dessous.</p>`;

  // La réunion qui vient, sur une ligne. Sa préparation vit sur le site — ici
  // on rappelle seulement qu'elle approche.
  const suite = reunion
    ? `<p class="prochaine-reunion">
         <span class="etiquette">Réunion</span>
         <span>${echapper(reunion.titre)}</span>
         <span class="discret quand">${echapper(
           momentLisible(new Date(reunion.date_debut)),
         )}</span>
       </p>`
    : '';

  return lignes + suite;
}

export function construireCap(objectifs) {
  if (!objectifs.length) {
    return `<p class="vide">Ton cap s'écrira ici.</p>`;
  }
  return construireCapGrave(objectifs);
}

function squelette(etat) {
  return `
    <!-- Le nom et l'écusson ne s'écrivent plus (26 août 2026) : l'onglet de la
         barre dit déjà FCH, et la page a mieux à faire de sa première ligne.
         Le titre reste pour les lecteurs d'écran. -->
    <h1 class="hors-ecran">FC Hermitage</h1>

    <div class="grille-yuno">
      <!-- La tuile ENTIÈRE mène au détail des objectifs : on la presse
           n'importe où. Elle ne peut donc contenir aucun autre contrôle. -->
      <section class="bloc panneau panneau-lien" style="--place: cap">
        <h2>Le cap</h2>
        <div data-bloc="cap">${construireCap(etat.objectifs)}</div>
      </section>

      <section class="bloc panneau" style="--place: faire">
        <h2>À faire</h2>
        <div data-bloc="taches">${construireTaches(etat.taches, etat.evenements)}</div>
      </section>

      <section class="bloc panneau" style="--place: rythme">
        <h2>La com'</h2>
        <div data-bloc="chaine">${construireChaine(etat.publications)}</div>
        <div data-bloc="apercu">${construireApercuCreation(etat.publications, {
          idees: false,
        })}</div>
      </section>

      <section class="bloc panneau" style="--place: reseau">
        <h2>Le bilan</h2>
        <div data-bloc="bilan">${construireBilan(
          etat.publications,
          etat.taches,
          etat.victoires,
        )}</div>
      </section>
    </div>

    <div id="bloc-creation-fch"></div>

    <div class="pied-yuno">
      ${RACCOURCIS.map(
        ({ cle, mot }) => `
        <button type="button" class="bouton-noter" data-noter="${cle}">
          <span aria-hidden="true">+</span> ${echapper(mot)}
        </button>`,
      ).join('')}

      <a class="pastille-porte" href="#hermitage">
        <span>Ouvrir le site FC Hermitage</span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
    </div>`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section) {
    const etat = {
      creation: null,
      objectifs: [],
      taches: [],
      publications: [],
      evenements: [],
      victoires: [],
    };

    const charger = async () => {
      // Les tâches FAITES comptent dans le bilan : `tachesEnCours` ne les
      // rendrait pas. On prend tout le projet, la page trie ensuite.
      // Depuis le DÉBUT du jour, pas depuis maintenant : une réunion notée pour
      // aujourd'hui sans heure tombe à minuit, et une borne à l'heure courante
      // l'aurait laissée hors de la requête — elle n'aurait jamais atteint le
      // filtre qui, lui, sait qu'elle tient jusqu'au soir.
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);

      const horizon = new Date();
      horizon.setMonth(horizon.getMonth() + 6);

      const [objectifs, taches, publications, evenements, victoires] = await Promise.all([
        api.objectifsActifs({ projet: 'fch' }),
        api.tachesDuProjet('fch'),
        api.publicationsToutes('fch'),
        api.evenementsEntre(debut.toISOString(), horizon.toISOString(), { projet: 'fch' }),
        api.victoiresDuProjet('fch', MAX_VICTOIRES),
      ]);

      Object.assign(etat, { objectifs, taches, publications, evenements, victoires });
    };

    const redessiner = () => {
      section.innerHTML = squelette(etat);
    };

    this.rafraichir = async () => {
      await charger();
      redessiner();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement de la page FC Hermitage impossible', erreur);
      section.innerHTML = `
        <h1>FC Hermitage</h1>
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
    // Celle du « + » de l'accueil. `reunion: true` : au FCH, un événement peut
    // porter un objet de réunion, et c'est la pastille qui le dit.

    const rendreCreation = () => {
      const hote = section.querySelector('#bloc-creation-fch');
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
        const nature = noter.dataset.noter;
        const jour = versDateISO();
        etat.creation = {
          nature,
          debut: jour,
          fin: jour,
          reunion: true,
          // Le bouton dit « Une réunion », pas « Un événement » : l'objet est
          // donc posé d'avance. Sans lui, `reunion_objet` resterait nul, la
          // ligne ne serait pas une réunion, et elle disparaîtrait de la page
          // sitôt notée. La pastille reste là pour préciser lequel.
          valeurs: nature === 'evenement' ? { reunion_objet: 'autre' } : {},
        };
        rendreCreation();
        return;
      }

      const cercle = evenement.target.closest('[data-cocher]');
      if (cercle) {
        return cocherDepuisTableauDeBord(cercle, etat.taches, () => {
          bloc('taches').innerHTML = construireTaches(etat.taches, etat.evenements);
        });
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) return fermerLaCreation();
    });

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="creer-depuis-calendrier"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      erreur.hidden = true;

      try {
        const pose = await poserAuCalendrier(champs, { projetParDefaut: 'fch' });
        fermerLaCreation();

        if (champs.nature === 'tache') etat.taches = [...etat.taches, pose];
        if (champs.nature === 'publication') etat.publications = [pose, ...etat.publications];
        if (champs.nature === 'evenement') etat.evenements = [...etat.evenements, pose];
        redessiner();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
        erreur.hidden = false;
      }
    });
  },
};
