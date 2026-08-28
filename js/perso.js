// Espace perso — la vie hors espaces.
//
// Ce n'est PAS un espace comme les trois autres, et il n'utilise pas leur
// fabrique : aucune
// mécanique de productivité ne s'applique ici. Ni tâches, ni jalons, ni
// échéances, ni barres de progression, ni backlog, ni notion de retard. Jamais.
//
// Il contient : des intentions (des phrases sans mesure ni date, simplement
// relues), des rendez-vous avec soi-même, des victoires, et la courbe d'humeur
// des 30 derniers jours.

import * as api from './api.js';
// Ces fonctions ne portent aucune mécanique d'espace : ce sont des gabarits
// de tuiles et de formulaires, réutilisés tels quels.
import {
  construireFormulaire,
  construireVictoires,
  construireEvenements,
} from './gabarits.js';
import {
  versDateISO,
  ajouterJours,
  depuisDateISO,
  echapper,
  FAMILLES_PERSO_CHOIX,
} from './format.js';

const ESPACE = 'perso';
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
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-intention="${echapper(intention.id)}"
          title="Retirer cette intention"
          aria-label="Retirer « ${echapper(intention.titre)} »">×</button>
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
    <h1 data-titre>Perso</h1>
    <p class="discret sous-titre" data-sous-titre>La vie hors espaces — sport, sorties, temps pour toi.</p>

    <section class="bloc" data-vue="intentions">
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

    <section class="bloc" data-vue="victoires">
      <h2>Victoires</h2>
      <div data-bloc="victoires"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'perso-victoire',
        libelle: 'Ajouter une victoire',
        action: 'creer-victoire',
        champs: [{ nom: 'titre', libelle: 'Victoire', type: 'text', requis: true }],
      })}
    </section>

    <section class="bloc" data-vue="rendez-vous">
      <h2>Rendez-vous avec toi-même</h2>
      <div data-bloc="evenements"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'perso-evenement',
        libelle: 'Ajouter un rendez-vous',
        action: 'creer-evenement',
        champs: [
          { nom: 'titre', libelle: 'Rendez-vous', type: 'text', requis: true },
          { nom: 'date_debut', libelle: 'Quand', type: 'datetime-local', requis: true },
          // Ce que ce moment sert. La même question que la pastille « Famille »
          // de la tuile de capture : un rendez-vous pris ici ne doit pas rester
          // muet là où tous les autres parlent.
          {
            nom: 'famille',
            libelle: 'Famille (facultatif)',
            type: 'choix',
            options: FAMILLES_PERSO_CHOIX,
            valeur: '',
          },
          { nom: 'lieu', libelle: 'Lieu (facultatif)', type: 'text' },
        ],
      })}
    </section>

    <section class="bloc" data-vue="humeur">
      <h2>Ton humeur</h2>
      <div data-bloc="humeur"><p class="vide">…</p></div>
    </section>
  `;
}

// LES QUATRE VUES DE PERSO (28 août 2026) — le menu les offre une à une, et
// c'est la MÊME page dont on cache trois blocs sur quatre. Ni second écran, ni
// second chargement : les écouteurs sont posés sur la section et survivent.
const VUES = {
  intentions: ['Les intentions', 'Ce que tu veux tenir, sans mesure ni date.'],
  victoires: ['Les victoires', 'Une belle séance compte autant qu\'un post réussi.'],
  'rendez-vous': ['Les rendez-vous', 'Les moments que tu te réserves.'],
  humeur: ['Ton humeur', 'Les 30 derniers jours, sans relance ni reproche.'],
};

function appliquerLaVue(section, route) {
  const vue = route?.vue in VUES ? route.vue : null;
  const [titre, sous] = VUES[vue] ?? [
    'Perso',
    'La vie hors espaces — sport, sorties, temps pour toi.',
  ];

  section.querySelector('[data-titre]').textContent = titre;
  section.querySelector('[data-sous-titre]').textContent = sous;
  for (const bloc of section.querySelectorAll('.bloc[data-vue]')) {
    bloc.hidden = Boolean(vue) && bloc.dataset.vue !== vue;
  }
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    section.innerHTML = squelette();
    appliquerLaVue(section, route);

    // Changer de vue ne relit rien et ne redessine rien : trois blocs sur
    // quatre s'effacent, le quatrième reste exactement dans l'état où on l'a
    // laissé.
    this.naviguer = (nouvelle) => appliquerLaVue(section, nouvelle);

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

    const charger = async () => {
      const depuis = versDateISO(ajouterJours(new Date(), -(JOURS_COURBE - 1)));
      const [intentions, evenements, victoires, humeur] = await Promise.all([
        api.objectifsActifs({ espace: ESPACE }),
        api.evenementsEntre(new Date().toISOString(), horizon(), { espace: ESPACE }),
        api.victoiresDeLEspace(ESPACE),
        api.humeurDepuis(depuis),
      ]);

      Object.assign(etat, { intentions, evenements, victoires });
      rendreIntentions();
      rendreVictoires();
      rendreEvenements();
      bloc('humeur').innerHTML = construireCourbeHumeur(humeur);
    };

    // Revenir sur l'espace le relit : l'humeur du jour répondue sur l'accueil
    // doit apparaître dans la courbe sans recharger la page.
    this.rafraichir = charger;

    try {
      await charger();
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
          espace: ESPACE,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
        });
        etat.intentions = [...etat.intentions, intention];
        rendreIntentions();
        return;
      }

      if (action === 'creer-victoire') {
        const victoire = await api.ajouterVictoire({
          espace: ESPACE,
          titre: champs.titre.trim(),
        });
        etat.victoires = [victoire, ...etat.victoires];
        rendreVictoires();
        return;
      }

      if (action === 'creer-evenement') {
        const rdv = await api.creerEvenement({
          espace: ESPACE,
          titre: champs.titre.trim(),
          date_debut: new Date(champs.date_debut).toISOString(),
          famille: champs.famille || null,
          lieu: champs.lieu?.trim() || null,
        });
        etat.evenements = [...etat.evenements, rdv].sort(
          (a, b) => new Date(a.date_debut) - new Date(b.date_debut),
        );
        rendreEvenements();
      }
    }

    section.addEventListener('click', async (evenement) => {
      const victoire = evenement.target.closest('[data-victoire]');
      if (victoire) {
        victoire.disabled = true;
        try {
          await api.supprimerVictoire(victoire.dataset.victoire);
          etat.victoires = etat.victoires.filter((v) => v.id !== victoire.dataset.victoire);
          rendreVictoires();
        } catch (souci) {
          console.error('Suppression de la victoire impossible', souci);
          victoire.disabled = false;
        }
        return;
      }

      // Retirer une intention, c'est juste effacer une phrase : pas de
      // confirmation, pas de cérémonie.
      const intention = evenement.target.closest('[data-intention]');
      if (intention) {
        intention.disabled = true;
        try {
          await api.supprimerObjectif(intention.dataset.intention);
          etat.intentions = etat.intentions.filter((i) => i.id !== intention.dataset.intention);
          rendreIntentions();
        } catch (souci) {
          console.error("Retrait de l'intention impossible", souci);
          intention.disabled = false;
        }
        return;
      }

      const rdv = evenement.target.closest('[data-supprimer-evenement]');
      if (rdv) {
        rdv.disabled = true;
        try {
          await api.supprimerEvenement(rdv.dataset.supprimerEvenement);
          etat.evenements = etat.evenements.filter(
            (e) => e.id !== rdv.dataset.supprimerEvenement,
          );
          rendreEvenements();
        } catch (souci) {
          console.error('Suppression du rendez-vous impossible', souci);
          rdv.disabled = false;
        }
      }
    });
  },
};

function horizon() {
  const dans3Mois = new Date();
  dans3Mois.setMonth(dans3Mois.getMonth() + 3);
  return dans3Mois.toISOString();
}
