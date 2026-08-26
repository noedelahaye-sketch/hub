// La page Yuno DU hub (#photo) — à ne pas confondre avec le site Yuno (#yuno,
// js/yuno.js), qui masque tout l'habillage du hub.
//
// Ici : un tableau de bord réduit et une action rapide. On lit où en est la
// marque, on capture une idée au vol, et on entre sur le site pour le reste.
// Rien ne se gère ici — la gestion vit sur le site.

import * as api from './api.js';
import { construireFormulaire, construireVictoires } from './espace-projet.js';
import { construireApercuCreation, rubriquesProposees } from './publications.js';
import { RUBRIQUES_DEPART } from './yuno.js';
import { echapper } from './format.js';
import { construireCapGrave, PORTE_OBJECTIFS } from './objectifs-commun.js';

const MAX_VICTOIRES = 3;

// --- Fabrication du HTML ----------------------------------------------------

// Le cap, GRAVÉ : la page Yuno du hub et celle du FCH sont des tableaux de
// bord, et un tableau de bord ne règle pas le cap (demande de Noé, 25 août
// 2026). Tous les objectifs du projet, posés sans carte, sans dépliage et sans
// un geste qui les modifie — plus la porte vers #objectifs.
//
// La même fonction sert les deux pages : `js/fch.js` l'importe telle quelle.
export function construireCap(objectifs) {
  if (!objectifs.length) {
    return `<p class="vide">Ton cap s'écrira ici.</p>${PORTE_OBJECTIFS}`;
  }

  return construireCapGrave(objectifs) + PORTE_OBJECTIFS;
}

function squelette(etat) {
  return `
    <div class="yuno-tete">
      <span class="yuno-logo" aria-hidden="true"><img src="img/yuno-logo.jpg" alt=""></span>
      <div>
        <h1>Yuno</h1>
        <p class="discret sous-titre">Photographe sportif · yuno_rph</p>
      </div>
    </div>

    <section class="bloc">
      <a class="lien-externe" href="#yuno">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Entrer sur le site Yuno</span>
          <span class="discret">Calendrier éditorial, réseau, commandes</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
    </section>

    <section class="bloc">
      <h2>Le cap</h2>
      <div data-bloc="cap">${construireCap(etat.objectifs)}</div>
    </section>

    <section class="bloc">
      <h2>En création</h2>
      <div data-bloc="apercu">${construireApercuCreation(etat.publications)}</div>
      ${construireFormulaire({
        id: 'idee-rapide',
        libelle: 'Noter une idée au vol',
        action: 'noter-idee',
        champs: [
          { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true },
          {
            nom: 'rubrique',
            libelle: 'Rubrique (facultative)',
            type: 'text',
            suggestions: rubriquesProposees(etat.publications, RUBRIQUES_DEPART),
          },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>Victoires</h2>
      <div data-bloc="victoires">${construireVictoires(etat.victoires)}</div>
    </section>`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section) {
    const etat = { objectifs: [], victoires: [], publications: [] };

    const charger = async () => {
      const [objectifs, victoires, publications] = await Promise.all([
        api.objectifsActifs({ projet: 'photo' }),
        api.victoiresDuProjet('photo', MAX_VICTOIRES),
        api.publicationsToutes('photo'),
      ]);
      Object.assign(etat, { objectifs, victoires, publications });
    };

    // Revenir sur la page la relit : ce qui a été fait sur le site, ou posé
    // depuis le calendrier, doit s'y voir sans recharger.
    this.rafraichir = async () => {
      await charger();
      section.innerHTML = squelette(etat);
    };

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement de la page Yuno impossible', erreur);
      section.innerHTML = `
        <h1>Yuno</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    section.innerHTML = squelette(etat);

    const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

    // L'idée au vol : capturée depuis le hub, rangée dans la banque du site.
    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="noter-idee"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      erreur.hidden = true;
      bouton.disabled = true;

      try {
        const publication = await api.creerPublication({
          projet: 'photo',
          titre: champs.titre.trim(),
          rubrique: champs.rubrique?.trim() || null,
        });
        etat.publications = [publication, ...etat.publications];
        formulaire.reset();
        formulaire.closest('.ajout').open = false;
        bloc('apercu').innerHTML = construireApercuCreation(etat.publications);
      } catch (souci) {
        console.error("Impossible de noter l'idée", souci);
        erreur.textContent = souci.message ?? "L'ajout a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    section.addEventListener('click', async (evenement) => {
      const victoire = evenement.target.closest('[data-victoire]');
      if (!victoire) return;

      victoire.disabled = true;
      try {
        await api.supprimerVictoire(victoire.dataset.victoire);
        etat.victoires = etat.victoires.filter((v) => v.id !== victoire.dataset.victoire);
        bloc('victoires').innerHTML = construireVictoires(etat.victoires);
      } catch (souci) {
        console.error('Suppression de la victoire impossible', souci);
        victoire.disabled = false;
      }
    });
  },
};
