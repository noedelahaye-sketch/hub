// Espace perso — la vie hors projets.
//
// Ce n'est PAS un espace projet, et il n'utilise pas leur fabrique : aucune
// mécanique de productivité ne s'applique ici. Ni tâches, ni jalons, ni
// échéances, ni barres de progression, ni backlog, ni notion de retard. Jamais.
//
// Il contient : des intentions (des phrases sans mesure ni date, simplement
// relues), des rendez-vous avec soi-même, des victoires, et la courbe d'humeur
// des 30 derniers jours.

import * as api from './api.js';
// Ces fonctions ne portent aucune mécanique de projet : ce sont des gabarits
// de tuiles et de formulaires, réutilisés tels quels.
import {
  construireFormulaire,
  construireVictoires,
  construireEvenements,
} from './espace-projet.js';
import { versDateISO, ajouterJours, depuisDateISO, echapper } from './format.js';

const PROJET = 'perso';
const JOURS_COURBE = 30;

const FRIMOUSSES = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

// --- Fabrication du HTML ----------------------------------------------------

export function construireIntentions(intentions) {
  if (!intentions.length) {
    return `<p class="vide">Tes intentions s'écriront ici. Une phrase suffit.</p>`;
  }

  // Pas de case à cocher, pas d'état, pas de date : une intention se relit,
  // elle ne se « termine » pas.
  return `<ul class="liste-intentions">${intentions
    .map(
      (intention) => `
      <li>
        <span class="intention-titre">${echapper(intention.titre)}</span>
        ${
          intention.pourquoi
            ? `<span class="discret intention-pourquoi">${echapper(intention.pourquoi)}</span>`
            : ''
        }
      </li>`,
    )
    .join('')}</ul>`;
}

// La courbe des 30 derniers jours. Un trait, des points, deux frimousses en
// guise d'échelle — pas d'axe chiffré, pas de moyenne, pas de verdict : la
// courbe se regarde, elle ne se note pas.
export function construireCourbeHumeur(entrees, maintenant = new Date()) {
  if (!entrees.length) {
    return `<p class="vide">Ta courbe se dessinera au fil des matins.</p>`;
  }

  const largeur = 320;
  const hauteur = 96;
  const gauche = 28; // place des frimousses d'échelle
  const droite = 8;
  const pas = (largeur - gauche - droite) / (JOURS_COURBE - 1);

  const debut = ajouterJours(maintenant, -(JOURS_COURBE - 1));
  debut.setHours(0, 0, 0, 0);

  const points = entrees
    .map((entree) => {
      const jour = Math.round((depuisDateISO(entree.date) - debut) / 86400000);
      if (jour < 0 || jour >= JOURS_COURBE) return null;
      return {
        x: gauche + jour * pas,
        y: 84 - (entree.niveau - 1) * 18,
        entree,
      };
    })
    .filter(Boolean);

  if (!points.length) {
    return `<p class="vide">Ta courbe se dessinera au fil des matins.</p>`;
  }

  const trait =
    points.length > 1
      ? `<polyline points="${points.map((p) => `${p.x},${p.y}`).join(' ')}"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linejoin="round" stroke-linecap="round" opacity="0.5" />`
      : '';

  const ronds = points
    .map(
      (p) => `
      <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="currentColor">
        <title>${echapper(p.entree.date)} — ${FRIMOUSSES[p.entree.niveau] ?? ''}${
          p.entree.note ? ` · ${echapper(p.entree.note)}` : ''
        }</title>
      </circle>`,
    )
    .join('');

  return `
    <svg class="courbe-humeur" viewBox="0 0 ${largeur} ${hauteur}"
      role="img" aria-label="Ton humeur sur les ${JOURS_COURBE} derniers jours">
      <text x="0" y="20" font-size="12">${FRIMOUSSES[5]}</text>
      <text x="0" y="90" font-size="12">${FRIMOUSSES[1]}</text>
      ${trait}
      ${ronds}
    </svg>
    <p class="discret note-courbe">Les ${JOURS_COURBE} derniers jours. Les jours sans réponse restent vides, et c'est très bien comme ça.</p>
  `;
}

function squelette() {
  return `
    <h1>Perso</h1>
    <p class="discret sous-titre">La vie hors projets — sport, sorties, temps pour toi.</p>

    <section class="bloc">
      <h2>Intentions</h2>
      <div data-bloc="intentions"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'perso-intention',
        libelle: 'Écrire une intention',
        action: 'creer-intention',
        champs: [
          { nom: 'titre', libelle: 'Intention', type: 'text', requis: true },
          { nom: 'pourquoi', libelle: 'Pourquoi ? (facultatif)', type: 'textarea' },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>Victoires</h2>
      <div data-bloc="victoires"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'perso-victoire',
        libelle: 'Ajouter une victoire',
        action: 'creer-victoire',
        champs: [{ nom: 'titre', libelle: 'Victoire', type: 'text', requis: true }],
      })}
    </section>

    <section class="bloc">
      <h2>Rendez-vous avec toi-même</h2>
      <div data-bloc="evenements"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'perso-evenement',
        libelle: 'Ajouter un rendez-vous',
        action: 'creer-evenement',
        champs: [
          { nom: 'titre', libelle: 'Rendez-vous', type: 'text', requis: true },
          { nom: 'date_debut', libelle: 'Quand', type: 'datetime-local', requis: true },
          { nom: 'lieu', libelle: 'Lieu (facultatif)', type: 'text' },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>Ton humeur</h2>
      <div data-bloc="humeur"><p class="vide">…</p></div>
    </section>
  `;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section) {
    section.innerHTML = squelette();

    const etat = { intentions: [], evenements: [], victoires: [] };
    const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

    const rendreIntentions = () => {
      bloc('intentions').innerHTML = construireIntentions(etat.intentions);
    };
    const rendreVictoires = () => {
      bloc('victoires').innerHTML = construireVictoires(etat.victoires);
    };
    const rendreEvenements = () => {
      bloc('evenements').innerHTML = construireEvenements(etat.evenements);
    };

    try {
      const depuis = versDateISO(ajouterJours(new Date(), -(JOURS_COURBE - 1)));
      const [intentions, evenements, victoires, humeur] = await Promise.all([
        api.objectifsActifs({ projet: PROJET }),
        api.evenementsEntre(new Date().toISOString(), horizon(), { projet: PROJET }),
        api.victoiresDuProjet(PROJET),
        api.humeurDepuis(depuis),
      ]);

      Object.assign(etat, { intentions, evenements, victoires });
      rendreIntentions();
      rendreVictoires();
      rendreEvenements();
      bloc('humeur').innerHTML = construireCourbeHumeur(humeur);
    } catch (erreur) {
      console.error("Chargement de l'espace perso impossible", erreur);
      section.innerHTML = `
        <h1>Perso</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    // --- Ajouts ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        await appliquerAjout(formulaire.dataset.action, champs);
        formulaire.reset();
        formulaire.closest('.ajout').open = false;
      } catch (souci) {
        console.error('Ajout impossible', souci);
        erreur.textContent = souci.message ?? "L'ajout a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    async function appliquerAjout(action, champs) {
      if (action === 'creer-intention') {
        // Une intention est un objectif sans cible ni échéance — et le restera :
        // le formulaire ne propose ni l'une ni l'autre.
        const intention = await api.creerObjectif({
          projet: PROJET,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
        });
        etat.intentions = [...etat.intentions, intention];
        rendreIntentions();
        return;
      }

      if (action === 'creer-victoire') {
        const victoire = await api.ajouterVictoire({
          projet: PROJET,
          titre: champs.titre.trim(),
        });
        etat.victoires = [victoire, ...etat.victoires];
        rendreVictoires();
        return;
      }

      if (action === 'creer-evenement') {
        const rdv = await api.creerEvenement({
          projet: PROJET,
          titre: champs.titre.trim(),
          date_debut: new Date(champs.date_debut).toISOString(),
          lieu: champs.lieu?.trim() || null,
        });
        etat.evenements = [...etat.evenements, rdv].sort(
          (a, b) => new Date(a.date_debut) - new Date(b.date_debut),
        );
        rendreEvenements();
      }
    }

    section.addEventListener('click', async (evenement) => {
      const bouton = evenement.target.closest('[data-victoire]');
      if (!bouton) return;

      bouton.disabled = true;
      try {
        await api.supprimerVictoire(bouton.dataset.victoire);
        etat.victoires = etat.victoires.filter((v) => v.id !== bouton.dataset.victoire);
        rendreVictoires();
      } catch (souci) {
        console.error('Suppression de la victoire impossible', souci);
        bouton.disabled = false;
      }
    });
  },
};

function horizon() {
  const dans3Mois = new Date();
  dans3Mois.setMonth(dans3Mois.getMonth() + 3);
  return dans3Mois.toISOString();
}
