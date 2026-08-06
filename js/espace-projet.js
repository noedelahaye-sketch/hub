// Un espace projet — la structure commune à formation, yuno et fch.
//
// Construite d'abord pour la formation, puis extraite ici une fois validée à
// l'usage. Les trois projets partagent exactement les mêmes blocs : objectifs
// avec progression, victoires, événements à venir, tâches. Seuls le titre, le
// sous-titre et un éventuel bloc d'en-tête changent.
//
// L'espace perso n'utilise PAS ce module : il n'a ni tâches, ni jalons, ni
// progression, et aucune mécanique de productivité ne s'y applique.
//
// L'ordre des blocs suit celui du tableau de bord — ce qui avance d'abord, ce
// qu'il reste à faire en dernier — pour qu'on ne réapprenne pas à lire la page
// en changeant d'espace.

import * as api from './api.js';
import { depuisDateISO, echeanceLisible, momentLisible, echapper } from './format.js';

// Fenêtre pendant laquelle une tâche cochée par erreur peut être décochée.
// Assez longue pour voir son erreur, assez courte pour ne pas encombrer.
const DUREE_ANNULATION = 6000;

// --- Fabrication du HTML ----------------------------------------------------

export function construireObjectifs(objectifs) {
  if (!objectifs.length) {
    return `<p class="vide">Aucun objectif pour l'instant. Le premier donne le cap.</p>`;
  }
  return objectifs.map(construireObjectif).join('');
}

function construireObjectif(objectif) {
  const jalons = [...(objectif.jalons ?? [])].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  const atteints = jalons.filter((jalon) => jalon.atteint).length;
  const pourcentage = jalons.length ? Math.round((atteints / jalons.length) * 100) : 0;

  const progression = jalons.length
    ? `<div class="barre" role="img"
         aria-label="${atteints} jalon${atteints > 1 ? 's' : ''} sur ${jalons.length}">
         <span style="width: ${pourcentage}%"></span>
       </div>
       <p class="discret progression-legende"><span class="chiffre">${atteints}/${jalons.length}</span> jalons · <span class="chiffre">${pourcentage}</span>&nbsp;%</p>`
    : `<p class="discret progression-legende">Pas encore de jalons.</p>`;

  return `
    <details class="objectif" data-objectif="${echapper(objectif.id)}">
      <summary>
        <span class="objectif-tete">
          <span class="objectif-titre">${echapper(objectif.titre)}</span>
          ${
            objectif.echeance
              ? `<span class="discret echeance">${echapper(
                  echeanceLisible(depuisDateISO(objectif.echeance)),
                )}</span>`
              : ''
          }
        </span>
        ${progression}
      </summary>

      <div class="objectif-detail">
        ${objectif.pourquoi ? `<p class="pourquoi">${echapper(objectif.pourquoi)}</p>` : ''}
        ${objectif.cible ? `<p class="discret cible">Réussite : ${echapper(objectif.cible)}</p>` : ''}

        <ul class="liste-jalons">${jalons.map(construireJalon).join('')}</ul>

        ${construireFormulaire({
          id: `jalon-${objectif.id}`,
          libelle: 'Ajouter un jalon',
          action: 'creer-jalon',
          champs: [
            { nom: 'titre', libelle: 'Jalon', type: 'text', requis: true },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
          ],
          extra: `<input type="hidden" name="objectif_id" value="${echapper(objectif.id)}">`,
        })}
      </div>
    </details>`;
}

function construireJalon(jalon) {
  if (jalon.atteint) {
    return `
      <li class="jalon-atteint">
        <span class="marque-jalon" aria-hidden="true">✓</span>
        <span>${echapper(jalon.titre)}</span>
      </li>`;
  }

  return `
    <li>
      <button type="button" class="marque-jalon bouton-jalon"
        data-jalon="${echapper(jalon.id)}"
        title="Marquer ce jalon comme atteint"
        aria-label="Marquer « ${echapper(jalon.titre)} » comme atteint">○</button>
      <span>${echapper(jalon.titre)}</span>
      ${
        jalon.echeance
          ? `<span class="discret quand">${echapper(
              echeanceLisible(depuisDateISO(jalon.echeance)),
            )}</span>`
          : ''
      }
    </li>`;
}

export function construireTaches(taches, annulation = null) {
  const actives = taches.filter((tache) => tache.statut === 'actif');
  const backlog = taches.filter((tache) => tache.statut === 'backlog');
  const complet = actives.length >= api.MAX_TACHES_ACTIVES;

  // Une tâche vient d'être cochée : on laisse une porte de sortie quelques
  // secondes, sans rien demander à qui ne s'est pas trompé.
  const ligneAnnulation = annulation
    ? `<p class="annulation">
         <span>Fait ✓ · <span class="discret">${echapper(annulation.tache.titre)}</span></span>
         <button type="button" class="lien-discret" data-annuler>Annuler</button>
       </p>`
    : '';

  const listeActives = actives.length
    ? `<ul class="liste-taches">${actives.map(construireTacheActive).join('')}</ul>`
    : `<p class="vide">Rien d'actif. Choisis une tâche du backlog quand tu es prêt.</p>`;

  const listeBacklog = backlog.length
    ? `<details class="backlog">
        <summary>Backlog <span class="chiffre">${backlog.length}</span></summary>
        <ul class="liste-backlog">
          ${backlog
            .map(
              (tache) => `
            <li>
              <span class="tache-titre">${echapper(tache.titre)}</span>
              ${
                tache.echeance
                  ? `<span class="discret quand">${echapper(
                      echeanceLisible(depuisDateISO(tache.echeance)),
                    )}</span>`
                  : ''
              }
              <button type="button" class="bouton-secondaire bouton-mini"
                data-activer="${echapper(tache.id)}" ${complet ? 'disabled' : ''}
                title="${
                  complet
                    ? `Déjà ${api.MAX_TACHES_ACTIVES} tâches actives`
                    : 'Rendre cette tâche active'
                }">Activer</button>
            </li>`,
            )
            .join('')}
        </ul>
        ${
          complet
            ? `<p class="discret note-regle">Trois tâches actives, c'est le maximum.
                 Termines-en une pour en activer une autre.</p>`
            : ''
        }
      </details>`
    : '';

  return ligneAnnulation + listeActives + listeBacklog;
}

function construireTacheActive(tache) {
  return `
    <li>
      <label>
        <input type="checkbox" data-tache="${echapper(tache.id)}">
        <span class="tache-titre">${echapper(tache.titre)}</span>
        ${
          tache.echeance
            ? `<span class="discret quand">${echapper(
                echeanceLisible(depuisDateISO(tache.echeance)),
              )}</span>`
            : ''
        }
      </label>
      <button type="button" class="lien-discret bouton-mini"
        data-backlog="${echapper(tache.id)}"
        title="Renvoyer cette tâche au backlog">↓</button>
    </li>`;
}

export function construireEvenements(evenements) {
  if (!evenements.length) return `<p class="vide">Rien de prévu pour l'instant.</p>`;

  return `<ul class="liste-semaine">${evenements
    .map(
      (evenement) => `
      <li>
        <span class="semaine-titre">${echapper(evenement.titre)}${
          // Espace insécable après le point médian : le lieu ne doit pas se
          // détacher du séparateur en fin de ligne.
          evenement.lieu ? ` <span class="discret">·&nbsp;${echapper(evenement.lieu)}</span>` : ''
        }</span>
        <span class="discret quand">${echapper(momentLisible(new Date(evenement.date_debut)))}</span>
      </li>`,
    )
    .join('')}</ul>`;
}

export function construireVictoires(victoires) {
  if (!victoires.length) {
    return `<p class="vide">Tes premières victoires s'afficheront ici.</p>`;
  }

  return `<ul class="liste-victoires">${victoires
    .map(
      (victoire) => `
      <li>
        <span class="victoire-titre">${echapper(victoire.titre)}</span>
        <span class="discret quand">${echapper(
          echeanceLisible(depuisDateISO(victoire.date)),
        )}</span>
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-victoire="${echapper(victoire.id)}"
          title="Retirer cette victoire"
          aria-label="Retirer « ${echapper(victoire.titre)} »">×</button>
      </li>`,
    )
    .join('')}</ul>`;
}

// Un formulaire d'ajout, replié par défaut : la page sert d'abord à lire ce qui
// avance, pas à saisir.
export function construireFormulaire({ id, libelle, action, champs, extra = '' }) {
  return `
    <details class="ajout" data-ajout="${id}">
      <summary>${libelle}</summary>
      <form data-action="${action}">
        ${extra}
        ${champs
          .map(
            (champ) => `
          <label for="${id}-${champ.nom}">${champ.libelle}</label>
          ${
            champ.type === 'textarea'
              ? `<textarea id="${id}-${champ.nom}" name="${champ.nom}" rows="2" ${
                  champ.requis ? 'required' : ''
                }></textarea>`
              : `<input id="${id}-${champ.nom}" name="${champ.nom}" type="${champ.type}" ${
                  champ.requis ? 'required' : ''
                }>`
          }`,
          )
          .join('')}
        <button type="submit" class="bouton-secondaire">Ajouter</button>
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </details>`;
}

// --- Fabrique d'espace ------------------------------------------------------

export function creerEspaceProjet({ projet, titre, sousTitre, blocEnTete = null }) {
  function squelette() {
    return `
      <h1>${echapper(titre)}</h1>
      <p class="discret sous-titre">${echapper(sousTitre)}</p>

      ${
        blocEnTete
          ? `<section class="bloc">
               <h2>${echapper(blocEnTete.titre)}</h2>
               ${blocEnTete.html}
             </section>`
          : ''
      }

      <section class="bloc">
        <h2>Objectifs</h2>
        <div data-bloc="objectifs"><p class="vide">…</p></div>
        ${construireFormulaire({
          id: `${projet}-objectif`,
          libelle: 'Ajouter un objectif',
          action: 'creer-objectif',
          champs: [
            { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true },
            { nom: 'pourquoi', libelle: 'Pourquoi ? (relu les jours sans motivation)', type: 'textarea' },
            { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
          ],
        })}
      </section>

      <section class="bloc">
        <h2>Victoires</h2>
        <div data-bloc="victoires"><p class="vide">…</p></div>
      </section>

      <section class="bloc">
        <h2>À venir</h2>
        <div data-bloc="evenements"><p class="vide">…</p></div>
        ${construireFormulaire({
          id: `${projet}-evenement`,
          libelle: 'Ajouter un événement',
          action: 'creer-evenement',
          champs: [
            { nom: 'titre', libelle: 'Événement', type: 'text', requis: true },
            { nom: 'date_debut', libelle: 'Quand', type: 'datetime-local', requis: true },
            { nom: 'lieu', libelle: 'Lieu (facultatif)', type: 'text' },
          ],
        })}
      </section>

      <section class="bloc">
        <h2>Tâches</h2>
        <div data-bloc="taches"><p class="vide">…</p></div>
        ${construireFormulaire({
          id: `${projet}-tache`,
          libelle: 'Ajouter une tâche',
          action: 'creer-tache',
          champs: [
            { nom: 'titre', libelle: 'Tâche (commence par un verbe)', type: 'text', requis: true },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
          ],
        })}
      </section>`;
  }

  return {
    async monter(section) {
      section.innerHTML = squelette();

      const etat = {
        objectifs: [],
        taches: [],
        evenements: [],
        victoires: [],
        annulation: null,
      };
      let minuteurAnnulation = null;
      const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

      const rendreObjectifs = () => {
        bloc('objectifs').innerHTML = construireObjectifs(etat.objectifs);
      };
      const rendreTaches = () => {
        bloc('taches').innerHTML = construireTaches(etat.taches, etat.annulation);
      };
      const rendreVictoires = () => {
        bloc('victoires').innerHTML = construireVictoires(etat.victoires);
      };
      const rendreEvenements = () => {
        bloc('evenements').innerHTML = construireEvenements(etat.evenements);
      };

      const ouvrirObjectif = (id) => {
        const element = section.querySelector(`[data-objectif="${CSS.escape(id)}"]`);
        if (element) element.open = true;
      };

      try {
        const [objectifs, taches, evenements, victoires] = await Promise.all([
          api.objectifsActifs({ projet }),
          api.tachesEnCours(projet),
          api.evenementsEntre(new Date().toISOString(), horizon(), { projet }),
          api.victoiresDuProjet(projet),
        ]);

        Object.assign(etat, { objectifs, taches, evenements, victoires });
        rendreObjectifs();
        rendreTaches();
        rendreEvenements();
        rendreVictoires();
      } catch (erreur) {
        console.error(`Chargement de l'espace ${projet} impossible`, erreur);
        section.innerHTML = `
          <h1>${echapper(titre)}</h1>
          <p class="vide">Les données n'ont pas pu être chargées.</p>
          <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
        section
          .querySelector('[data-action="reessayer"]')
          ?.addEventListener('click', () => this.monter(section));
        return;
      }

      // Le bloc d'en-tête charge ce qui lui est propre, à part : son échec ne
      // doit pas emporter le reste de la page.
      blocEnTete?.apresMontage?.(section);

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
        if (action === 'creer-objectif') {
          const objectif = await api.creerObjectif({
            projet,
            titre: champs.titre.trim(),
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
            echeance: champs.echeance || null,
          });
          etat.objectifs = [...etat.objectifs, { ...objectif, jalons: objectif.jalons ?? [] }];
          rendreObjectifs();
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
          rendreObjectifs();
          // Le formulaire vient d'être remplacé : on rouvre l'objectif concerné.
          ouvrirObjectif(champs.objectif_id);
          return;
        }

        if (action === 'creer-tache') {
          const tache = await api.creerTache({
            projet,
            titre: champs.titre.trim(),
            echeance: champs.echeance || null,
          });
          etat.taches = [...etat.taches, tache];
          rendreTaches();
          return;
        }

        if (action === 'creer-evenement') {
          const evenement = await api.creerEvenement({
            projet,
            titre: champs.titre.trim(),
            // `datetime-local` rend une heure locale sans fuseau : `new Date` la
            // lit comme locale, `toISOString` la convertit pour Postgres.
            date_debut: new Date(champs.date_debut).toISOString(),
            lieu: champs.lieu?.trim() || null,
          });
          etat.evenements = [...etat.evenements, evenement].sort(
            (a, b) => new Date(a.date_debut) - new Date(b.date_debut),
          );
          rendreEvenements();
        }
      }

      // --- Clics ---

      section.addEventListener('click', async (evenement) => {
        const jalon = evenement.target.closest('[data-jalon]');
        if (jalon) return marquerJalon(jalon);

        if (evenement.target.closest('[data-annuler]')) return annulerDerniereTache();

        const victoire = evenement.target.closest('[data-victoire]');
        if (victoire) return retirerVictoire(victoire);

        const activer = evenement.target.closest('[data-activer]');
        const versBacklog = evenement.target.closest('[data-backlog]');
        const bouton = activer ?? versBacklog;
        if (!bouton) return;

        const id = activer ? activer.dataset.activer : versBacklog.dataset.backlog;
        const tache = etat.taches.find((candidate) => candidate.id === id);
        if (!tache) return;

        bouton.disabled = true;
        try {
          const misAJour = await api.changerStatutTache(tache, activer ? 'actif' : 'backlog');
          Object.assign(tache, misAJour);
          rendreTaches();
        } catch (souci) {
          console.error('Changement de statut impossible', souci);
          bouton.disabled = false;
          alert(souci.message);
        }
      });

      async function marquerJalon(bouton) {
        bouton.disabled = true;
        try {
          const objectif = etat.objectifs.find((candidat) =>
            candidat.jalons?.some((j) => j.id === bouton.dataset.jalon),
          );
          const jalon = objectif.jalons.find((j) => j.id === bouton.dataset.jalon);
          const { jalon: atteint, victoire } = await api.atteindreJalon(jalon, projet);
          Object.assign(jalon, atteint);
          etat.victoires = [victoire, ...etat.victoires];
          rendreObjectifs();
          rendreVictoires();
          ouvrirObjectif(objectif.id);
        } catch (souci) {
          console.error('Impossible de marquer le jalon', souci);
          bouton.disabled = false;
        }
      }

      async function retirerVictoire(bouton) {
        const id = bouton.dataset.victoire;
        bouton.disabled = true;
        try {
          await api.supprimerVictoire(id);
          etat.victoires = etat.victoires.filter((victoire) => victoire.id !== id);
          rendreVictoires();
        } catch (souci) {
          console.error('Suppression de la victoire impossible', souci);
          bouton.disabled = false;
        }
      }

      // --- Terminer une tâche, et pouvoir se raviser ---

      section.addEventListener('change', async (evenement) => {
        const case_ = evenement.target.closest('[data-tache]');
        if (!case_ || !case_.checked) return;

        const tache = etat.taches.find((candidate) => candidate.id === case_.dataset.tache);
        if (!tache) return;

        case_.disabled = true;
        try {
          const { tache: faite, victoire } = await api.terminerTache(tache);
          etat.taches = etat.taches.filter((candidate) => candidate.id !== tache.id);
          etat.victoires = [victoire, ...etat.victoires];
          ouvrirAnnulation({ tache: faite, victoire });
          rendreTaches();
          rendreVictoires();
        } catch (souci) {
          console.error('Impossible de terminer la tâche', souci);
          case_.checked = false;
          case_.disabled = false;
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
        } catch (souci) {
          console.error("Annulation impossible", souci);
        }
        rendreTaches();
        rendreVictoires();
      }
    },
  };
}

// Les événements affichés vont jusqu'à trois mois : un espace projet regarde
// plus loin que la semaine du tableau de bord.
function horizon() {
  const dans3Mois = new Date();
  dans3Mois.setMonth(dans3Mois.getMonth() + 3);
  return dans3Mois.toISOString();
}
