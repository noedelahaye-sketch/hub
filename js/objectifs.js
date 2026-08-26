// L'espace Objectifs — tout le cap, et le seul endroit du hub où il se règle.
//
// Le pendant de l'espace Tâches : transverse, il montre TOUS les objectifs de
// tous les projets, groupés par projet, avec leur pourquoi, leur cible et leurs
// jalons. Ailleurs le hub GRAVE le cap, en lecture seule — l'accueil et les
// pages projet le posent dans la page, sans un geste qui le modifie. Ici on
// l'écrit : on ajoute un objectif, on le modifie, on pose ou on retire un
// jalon, on marque atteint.
//
// Aucune entrée dans la barre de navigation (demande de Noé, 25 août 2026) :
// on y vient par la porte du bloc « Tes objectifs », et rarement.
//
// Comme l'espace perso, cet espace n'utilise pas la fabrique `creerEspaceProjet`
// — elle ne sait bâtir qu'un seul projet, avec ses tâches, ses événements et
// ses victoires. Il en reprend en revanche tous les gabarits : une tuile
// d'objectif se dessine d'une seule façon dans tout le hub.

import * as api from './api.js';
import { construireObjectifs, construireFormulaire } from './espace-projet.js';
import { NOMS_PROJETS, echapper } from './format.js';

// L'espace perso n'a pas d'objectifs : il a des INTENTIONS, sans mesure ni
// date, et elles se relisent dans #perso. Cette page ne les touche jamais.
const PROJETS = ['formation', 'fch', 'photo'];

// --- Fabrication du HTML ----------------------------------------------------

// Le projet est porté par la SECTION, et non par chaque tuile : il n'y sert
// qu'à poser les couleurs (`--couleur-projet-pleine`), dont héritent les
// chemins de jalons. Sur une tuile, `data-projet` dessinerait en plus le
// filet coloré des listes de l'accueil — ici le titre du bloc dit déjà le
// projet, et six filets alignés seraient du bruit.
function squelette() {
  const blocs = PROJETS.map(
    (projet) => `
      <section class="bloc" data-projet="${projet}">
        <h2>${echapper(NOMS_PROJETS[projet] ?? projet)}</h2>
        <div data-bloc="${projet}"><p class="vide">…</p></div>
        ${construireFormulaire({
          id: `objectif-${projet}`,
          libelle: 'Ajouter un objectif',
          action: 'creer-objectif',
          champs: [
            { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true },
            {
              nom: 'pourquoi',
              libelle: 'Pourquoi ? (relu les jours sans motivation)',
              type: 'textarea',
            },
            { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
          ],
          extra: `<input type="hidden" name="projet" value="${projet}">`,
        })}
      </section>`,
  ).join('');

  return `
    <h1>Objectifs</h1>
    <p class="discret sous-titre">Le cap de chaque projet. C'est ici qu'il se règle.</p>
    ${blocs}`;
}

// --- L'espace ---------------------------------------------------------------

export default {
  async monter(section) {
    section.innerHTML = squelette();

    const etat = { objectifs: [] };
    const bloc = (projet) => section.querySelector(`[data-bloc="${projet}"]`);

    const duProjet = (projet) => etat.objectifs.filter((o) => o.projet === projet);

    const rendreProjet = (projet) => {
      bloc(projet).innerHTML = construireObjectifs(duProjet(projet), { retraitJalon: true });
    };
    const rendreTout = () => PROJETS.forEach(rendreProjet);

    // Redessiner remplace les tuiles : celle qu'on venait d'ouvrir se
    // refermerait sans ça, en pleine saisie de son jalon suivant.
    const ouvrirObjectif = (id) => {
      const element = section.querySelector(`[data-objectif="${CSS.escape(id)}"]`);
      if (element) element.open = true;
    };

    const charger = async () => {
      const objectifs = await api.objectifsActifs();
      etat.objectifs = objectifs.filter((objectif) => PROJETS.includes(objectif.projet));
      rendreTout();
    };

    this.rafraichir = charger;

    try {
      await charger();
    } catch (erreur) {
      console.error("Chargement de l'espace Objectifs impossible", erreur);
      section.innerHTML = `
        <h1>Objectifs</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    // --- Ajouts et modifications ---
    //
    // Un formulaire garde sa saisie quand l'écriture échoue et a un endroit
    // pour le dire : c'est l'une des deux exceptions à l'affichage optimiste.

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
        await appliquer(formulaire.dataset.action, champs);
        formulaire.reset();
        formulaire.closest('.ajout').open = false;
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    async function appliquer(action, champs) {
      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          projet: champs.projet,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        etat.objectifs = [...etat.objectifs, { ...objectif, jalons: objectif.jalons ?? [] }];
        rendreProjet(champs.projet);
        return;
      }

      if (action === 'modifier-objectif') {
        const objectif = etat.objectifs.find((o) => o.id === champs.objectif_id);
        const misAJour = await api.modifierObjectif(champs.objectif_id, {
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        // La mise à jour ne renvoie que les colonnes : les jalons déjà chargés
        // restent en place.
        Object.assign(objectif, misAJour);
        rendreProjet(objectif.projet);
        ouvrirObjectif(objectif.id);
        return;
      }

      if (action === 'creer-jalon') {
        const objectif = etat.objectifs.find((o) => o.id === champs.objectif_id);
        const jalon = await api.creerJalon({
          objectif_id: champs.objectif_id,
          titre: champs.titre.trim(),
          echeance: champs.echeance || null,
          ordre: (objectif?.jalons?.length ?? 0) + 1,
        });
        objectif.jalons = [...(objectif.jalons ?? []), jalon];
        rendreProjet(objectif.projet);
        ouvrirObjectif(objectif.id);
      }
    }

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) return marquerJalon(jalon);

      const supprJalon = evenement.target.closest('[data-supprimer-jalon]');
      if (supprJalon) return supprimerJalon(supprJalon);

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) return atteindreObjectif(atteindre);

      const supprObjectif = evenement.target.closest('[data-supprimer-objectif]');
      if (supprObjectif) return supprimerObjectif(supprObjectif);
    });

    const objectifPortant = (idJalon) =>
      etat.objectifs.find((candidat) => candidat.jalons?.some((j) => j.id === idJalon));

    async function marquerJalon(bouton) {
      bouton.disabled = true;
      try {
        const objectif = objectifPortant(bouton.dataset.jalon);
        const jalon = objectif.jalons.find((j) => j.id === bouton.dataset.jalon);
        // Un jalon atteint écrit sa victoire : elle s'affichera dans l'espace
        // du projet, cette page-ci ne montre que le cap.
        const { jalon: atteint } = await api.atteindreJalon(jalon, objectif.projet);
        Object.assign(jalon, atteint);
        rendreProjet(objectif.projet);
        ouvrirObjectif(objectif.id);
      } catch (souci) {
        console.error('Impossible de marquer le jalon', souci);
        bouton.disabled = false;
      }
    }

    async function supprimerJalon(bouton) {
      const objectif = objectifPortant(bouton.dataset.supprimerJalon);
      const jalon = objectif?.jalons.find((j) => j.id === bouton.dataset.supprimerJalon);
      if (!jalon) return;
      if (!confirm(`Retirer le jalon « ${jalon.titre} » ?`)) return;

      bouton.disabled = true;
      try {
        await api.supprimerJalon(jalon.id);
        objectif.jalons = objectif.jalons.filter((j) => j.id !== jalon.id);
        rendreProjet(objectif.projet);
        ouvrirObjectif(objectif.id);
      } catch (souci) {
        console.error('Retrait du jalon impossible', souci);
        bouton.disabled = false;
      }
    }

    // Atteindre un objectif est rare et engageant : on demande une fois.
    async function atteindreObjectif(bouton) {
      const objectif = etat.objectifs.find((o) => o.id === bouton.dataset.atteindre);
      if (!objectif) return;
      if (!confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;

      bouton.disabled = true;
      try {
        await api.atteindreObjectif(objectif);
        etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
        rendreProjet(objectif.projet);
      } catch (souci) {
        console.error("Impossible de marquer l'objectif atteint", souci);
        bouton.disabled = false;
      }
    }

    async function supprimerObjectif(bouton) {
      const objectif = etat.objectifs.find((o) => o.id === bouton.dataset.supprimerObjectif);
      if (!objectif) return;
      if (
        !confirm(
          `Supprimer « ${objectif.titre} » et ses jalons ? Les tâches liées sont conservées.`,
        )
      ) {
        return;
      }

      bouton.disabled = true;
      try {
        await api.supprimerObjectif(objectif.id);
        etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
        rendreProjet(objectif.projet);
      } catch (souci) {
        console.error("Suppression de l'objectif impossible", souci);
        bouton.disabled = false;
      }
    }
  },
};
