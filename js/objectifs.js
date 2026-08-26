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
// Le modèle de l'argent de Yuno vit avec la page qui l'a fait naître ; il
// n'est pas recopié ici.
import { argentDeYuno, enEuros } from './photo.js';
import { NOMS_PROJETS, echapper } from './format.js';

// L'espace perso n'a pas d'objectifs : il a des INTENTIONS, sans mesure ni
// date, et elles se relisent dans #perso. Cette page ne les touche jamais.
const PROJETS = ['formation', 'fch', 'photo'];

// L'objectif dont les prestations et le matériel disent la mesure. Reconnu par
// son titre, comme sur la page Yuno : c'est le seul lien entre une ligne
// d'objectif et une mécanique, et l'inscrire en dur vaut mieux qu'une colonne
// « type » que rien d'autre n'utiliserait.
const OBJECTIF_MATERIEL = 'Rembourser mon matériel';

// --- L'argent de « Rembourser mon matériel » --------------------------------
// La cible de cet objectif est la somme du matériel, sa progression la somme
// des prestations encaissées. Les deux listes se corrigent ICI, à côté de
// l'objectif qu'elles mesurent (demande de Noé, 26 août 2026) — la page Yuno,
// elle, se contente d'en afficher le total.

export function construireArgent(commandes, materiel) {
  const { encaisse, frais, achats, cible, reste } = argentDeYuno(commandes, materiel);
  const chiffrees = commandes.filter((commande) => commande.montant != null);

  // Une prestation affiche son NET, et le détail dessous quand il y a des frais :
  // c'est le net qui rembourse le matériel, mais on doit pouvoir vérifier d'où
  // il sort.
  const ligne = (entree, somme, detail, action) => `
    <li>
      <span class="argent-nom">
        ${echapper(entree.titre ?? entree.nom)}
        ${detail ? `<span class="discret argent-detail">${detail}</span>` : ''}
      </span>
      <span class="chiffre argent-somme">${enEuros(somme)}</span>
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-${action}="${echapper(entree.id)}"
        title="Retirer" aria-label="Retirer « ${echapper(entree.titre ?? entree.nom)} »">×</button>
    </li>`;

  const listePrestations = chiffrees.length
    ? `<ul class="liste-argent">${chiffrees
        .map((commande) =>
          ligne(
            commande,
            commande.montant,
            // Les frais se disent ici mais comptent en face : ils grossissent
            // ce qu'il reste à rembourser, ils n'entament pas la recette.
            commande.frais ? `${enEuros(commande.frais)} de déplacement` : '',
            'retirer-commande',
          ),
        )
        .join('')}</ul>`
    : `<p class="vide">Rien encore.</p>`;

  const listeMateriel = materiel.length
    ? `<ul class="liste-argent">${materiel
        .map((achat) => ligne(achat, achat.prix, '', 'retirer-materiel'))
        .join('')}</ul>`
    : `<p class="vide">Rien encore.</p>`;

  return `
    <div class="panneau-argent">
      <p class="argent-total">
        <span class="chiffre">${enEuros(encaisse)}</span>
        <span class="discret">encaissés sur ${enEuros(cible)} à rembourser</span>
      </p>

      <!-- Le détail de ce qu'il reste à rembourser, ici et nulle part ailleurs
           (demande de Noé, 26 août 2026) : la page Yuno n'en dit que le total,
           c'est en ouvrant l'objectif qu'on voit d'où il sort. -->
      <ul class="argent-composition">
        <li><span>Matériel</span> <span class="chiffre">${enEuros(achats)}</span></li>
        <li><span>Déplacements</span> <span class="chiffre">${enEuros(frais)}</span></li>
        <li class="argent-somme-ligne">
          <span>À rembourser</span> <span class="chiffre">${enEuros(cible)}</span>
        </li>
        <li><span>Encaissé</span> <span class="chiffre">${enEuros(encaisse)}</span></li>
        <li class="argent-somme-ligne">
          <span>${reste ? 'Il reste' : 'Remboursé'}</span>
          <span class="chiffre">${enEuros(reste)}</span>
        </li>
      </ul>

      <h3>Prestations encaissées</h3>
      ${listePrestations}
      ${construireFormulaire({
        id: 'obj-prestation',
        libelle: 'Noter une prestation',
        action: 'creer-prestation',
        champs: [
          { nom: 'titre', libelle: 'La prestation', type: 'text', requis: true },
          { nom: 'client', libelle: 'Pour qui (facultatif)', type: 'text' },
          { nom: 'montant', libelle: 'Ce que ça rapporte, en euros', type: 'number', requis: true },
          {
            nom: 'frais',
            libelle: 'Ce que le déplacement a coûté (facultatif)',
            type: 'number',
          },
        ],
      })}

      <h3>Matériel</h3>
      ${listeMateriel}
      ${construireFormulaire({
        id: 'obj-materiel',
        libelle: 'Ajouter du matériel',
        action: 'creer-materiel',
        champs: [
          { nom: 'nom', libelle: "L'appareil, l'objectif…", type: 'text', requis: true },
          { nom: 'prix', libelle: 'Prix payé en euros', type: 'number', requis: true },
          { nom: 'date_achat', libelle: "Date d'achat (facultative)", type: 'date' },
        ],
      })}
    </div>`;
}

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

    const etat = { objectifs: [], commandes: [], materiel: [] };
    const bloc = (projet) => section.querySelector(`[data-bloc="${projet}"]`);

    const duProjet = (projet) => etat.objectifs.filter((o) => o.projet === projet);

    // Le complément de l'objectif du matériel : ses deux listes, posées dans
    // son détail. Les autres objectifs n'en ont pas.
    const complements = () => {
      const objectif = etat.objectifs.find((o) => o.titre === OBJECTIF_MATERIEL);
      if (!objectif) return {};
      return { [objectif.id]: construireArgent(etat.commandes, etat.materiel) };
    };

    const rendreProjet = (projet) => {
      bloc(projet).innerHTML = construireObjectifs(duProjet(projet), {
        retraitJalon: true,
        complements: complements(),
      });
    };
    const rendreTout = () => PROJETS.forEach(rendreProjet);

    // Redessiner remplace les tuiles : celle qu'on venait d'ouvrir se
    // refermerait sans ça, en pleine saisie de son jalon suivant.
    const ouvrirObjectif = (id) => {
      const element = section.querySelector(`[data-objectif="${CSS.escape(id)}"]`);
      if (element) element.open = true;
    };

    const charger = async () => {
      const [objectifs, commandes, materiel] = await Promise.all([
        api.objectifsActifs(),
        api.commandesToutes(),
        api.materielTout(),
      ]);
      etat.objectifs = objectifs.filter((objectif) => PROJETS.includes(objectif.projet));
      etat.commandes = commandes;
      etat.materiel = materiel;
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

      if (action === 'creer-prestation') {
        // Livrée d'emblée : on note ce qu'on a ENCAISSÉ, pas ce qu'on espère.
        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: champs.client?.trim() || null,
          montant: Number(champs.montant),
          // Vide = pas de frais, et non zéro : la colonne dit alors « on n'a
          // rien noté », pas « ça n'a rien coûté ».
          frais: champs.frais ? Number(champs.frais) : null,
          statut: 'livree',
        });
        etat.commandes = [commande, ...etat.commandes];
        rendreArgent();
        return;
      }

      if (action === 'creer-materiel') {
        const achat = await api.creerMateriel({
          nom: champs.nom.trim(),
          prix: Number(champs.prix),
          date_achat: champs.date_achat || null,
        });
        etat.materiel = [achat, ...etat.materiel];
        rendreArgent();
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

      const commande = evenement.target.closest('[data-retirer-commande]');
      if (commande) {
        return retirerArgent(commande, commande.dataset.retirerCommande, 'commandes', api.supprimerCommande);
      }

      const achat = evenement.target.closest('[data-retirer-materiel]');
      if (achat) {
        return retirerArgent(achat, achat.dataset.retirerMateriel, 'materiel', api.supprimerMateriel);
      }
    });

    async function retirerArgent(bouton, id, liste, supprimer) {
      bouton.disabled = true;
      try {
        await supprimer(id);
        etat[liste] = etat[liste].filter((entree) => entree.id !== id);
        rendreArgent();
      } catch (souci) {
        console.error('Retrait impossible', souci);
        bouton.disabled = false;
      }
    }

    // Redessiner le projet photo referme sa tuile : on la rouvre, sinon noter
    // une deuxième prestation obligerait à tout redéplier.
    const rendreArgent = () => {
      const objectif = etat.objectifs.find((o) => o.titre === OBJECTIF_MATERIEL);
      if (!objectif) return;
      rendreProjet(objectif.projet);
      ouvrirObjectif(objectif.id);
    };

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
