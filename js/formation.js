// Espace formation — Bac+3 Studi.
//
// Premier espace projet construit en entier. Il sert d'échantillon : photo et
// fch reprendront la même structure, une fois celle-ci validée à l'usage.
//
// L'ordre des blocs suit celui du tableau de bord — ce qui avance d'abord, ce
// qu'il reste à faire en dernier — pour qu'on ne réapprenne pas à lire la page
// en changeant d'espace. La progression des révisions est propre à la
// formation : elle vient du site Bac-3, jamais de la base du hub.

import * as api from './api.js';
import { progressionRevisions } from './revisions.js';
import { depuisDateISO, echeanceLisible, momentLisible, echapper } from './format.js';

const PROJET = 'formation';
const SITE_REVISION = 'https://noedelahaye-sketch.github.io/Bac-3/';

// --- Fabrication du HTML ----------------------------------------------------

export function construireRevisions(revisions) {
  if (revisions === null) {
    return `<p class="vide">La progression des révisions n'a pas pu être lue.</p>`;
  }

  const pourcentage = Math.round((revisions.livrables / revisions.totalLivrables) * 100);
  const chiffres = [
    [revisions.cartesVues, 'cartes vues'],
    [revisions.resumesLus, revisions.resumesLus > 1 ? 'résumés lus' : 'résumé lu'],
    [revisions.serie, revisions.serie > 1 ? "jours d'affilée" : "jour d'affilée"],
  ];

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
  `;
}

export function construireObjectifs(objectifs) {
  if (!objectifs.length) {
    return `<p class="vide">Aucun objectif pour l'instant. Le premier donne le cap.</p>`;
  }
  return objectifs.map(construireObjectif).join('');
}

function construireObjectif(objectif) {
  const jalons = [...(objectif.jalons ?? [])].sort(
    (a, b) => (a.ordre ?? 0) - (b.ordre ?? 0),
  );
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

        <ul class="liste-jalons">
          ${jalons.map((jalon) => construireJalon(jalon)).join('')}
        </ul>

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
    </details>
  `;
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

export function construireTaches(taches) {
  const actives = taches.filter((tache) => tache.statut === 'actif');
  const backlog = taches.filter((tache) => tache.statut === 'backlog');
  const complet = actives.length >= api.MAX_TACHES_ACTIVES;

  const listeActives = actives.length
    ? `<ul class="liste-taches">${actives.map(construireTacheActive).join('')}</ul>`
    : `<p class="vide">Rien d'actif. Choisis une tâche du backlog quand tu es prêt.</p>`;

  const listeBacklog = backlog.length
    ? `
      <details class="backlog">
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

  return listeActives + listeBacklog;
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
  if (!evenements.length) {
    return `<p class="vide">Rien de prévu pour l'instant.</p>`;
  }

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
      </li>`,
    )
    .join('')}</ul>`;
}

// Un formulaire d'ajout, replié. Replié par défaut : la page sert d'abord à
// lire ce qui avance, pas à saisir.
function construireFormulaire({ id, libelle, action, champs, extra = '' }) {
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

function squelette() {
  return `
    <h1>Formation</h1>
    <p class="discret sous-titre">Bac+3 marketing et communication · Studi</p>

    <section class="bloc">
      <h2>Réviser</h2>
      <a class="lien-externe" href="${SITE_REVISION}" target="_blank" rel="noopener">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Ouvrir le site Bac+3</span>
          <span class="discret">Dossiers, cours, flashcards et quiz</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
      <div id="bloc-revisions"><p class="vide">…</p></div>
    </section>

    <section class="bloc">
      <h2>Objectifs</h2>
      <div id="bloc-objectifs"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'objectif',
        libelle: 'Ajouter un objectif',
        action: 'creer-objectif',
        champs: [
          { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true },
          { nom: 'pourquoi', libelle: 'Pourquoi ? (relu les jours sans motivation)', type: 'textarea' },
          { nom: 'cible', libelle: 'À quoi tu sauras que c\'est réussi', type: 'text' },
          { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>Victoires</h2>
      <div id="bloc-victoires"><p class="vide">…</p></div>
    </section>

    <section class="bloc">
      <h2>À venir</h2>
      <div id="bloc-evenements"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'evenement',
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
      <div id="bloc-taches"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'tache',
        libelle: 'Ajouter une tâche',
        action: 'creer-tache',
        champs: [
          { nom: 'titre', libelle: 'Tâche (commence par un verbe)', type: 'text', requis: true },
          { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
        ],
      })}
    </section>
  `;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section) {
    section.innerHTML = squelette();

    const etat = { objectifs: [], taches: [], evenements: [], victoires: [] };
    const cible = (id) => section.querySelector(`#${id}`);

    const rendreObjectifs = () => {
      cible('bloc-objectifs').innerHTML = construireObjectifs(etat.objectifs);
    };
    const rendreTaches = () => {
      cible('bloc-taches').innerHTML = construireTaches(etat.taches);
    };
    const rendreVictoires = () => {
      cible('bloc-victoires').innerHTML = construireVictoires(etat.victoires);
    };
    const rendreEvenements = () => {
      cible('bloc-evenements').innerHTML = construireEvenements(etat.evenements);
    };

    try {
      const [objectifs, taches, evenements, victoires] = await Promise.all([
        api.objectifsActifs({ projet: PROJET }),
        api.tachesEnCours(PROJET),
        api.evenementsEntre(new Date().toISOString(), horizon(), { projet: PROJET }),
        api.victoiresDuProjet(PROJET),
      ]);

      Object.assign(etat, { objectifs, taches, evenements, victoires });
      rendreObjectifs();
      rendreTaches();
      rendreEvenements();
      rendreVictoires();
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

    // Les révisions viennent d'ailleurs (GitHub) : leur échec ne doit pas
    // emporter le reste de la page.
    progressionRevisions()
      .then((revisions) => {
        cible('bloc-revisions').innerHTML = construireRevisions(revisions);
      })
      .catch((erreur) => {
        console.error('Lecture des révisions impossible', erreur);
        cible('bloc-revisions').innerHTML = construireRevisions(null);
      });

    // --- Interactions ---

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
        console.error("Ajout impossible", souci);
        erreur.textContent = souci.message ?? "L'ajout a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    async function appliquerAjout(action, champs) {
      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          projet: PROJET,
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
        section.querySelector(`[data-objectif="${CSS.escape(champs.objectif_id)}"]`).open = true;
        return;
      }

      if (action === 'creer-tache') {
        const tache = await api.creerTache({
          projet: PROJET,
          titre: champs.titre.trim(),
          echeance: champs.echeance || null,
        });
        etat.taches = [...etat.taches, tache];
        rendreTaches();
        return;
      }

      if (action === 'creer-evenement') {
        const evenement = await api.creerEvenement({
          projet: PROJET,
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

    section.addEventListener('click', async (evenement) => {
      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) {
        jalon.disabled = true;
        try {
          const objectif = etat.objectifs.find((candidat) =>
            candidat.jalons?.some((j) => j.id === jalon.dataset.jalon),
          );
          const cible_ = objectif.jalons.find((j) => j.id === jalon.dataset.jalon);
          const { jalon: atteint, victoire } = await api.atteindreJalon(cible_, PROJET);
          Object.assign(cible_, atteint);
          etat.victoires = [victoire, ...etat.victoires];
          rendreObjectifs();
          rendreVictoires();
          section.querySelector(`[data-objectif="${CSS.escape(objectif.id)}"]`).open = true;
        } catch (souci) {
          console.error('Impossible de marquer le jalon', souci);
          jalon.disabled = false;
        }
        return;
      }

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

    section.addEventListener('change', async (evenement) => {
      const case_ = evenement.target.closest('[data-tache]');
      if (!case_ || !case_.checked) return;

      const tache = etat.taches.find((candidate) => candidate.id === case_.dataset.tache);
      if (!tache) return;

      case_.disabled = true;
      try {
        const { victoire } = await api.terminerTache(tache);
        etat.taches = etat.taches.filter((candidate) => candidate.id !== tache.id);
        etat.victoires = [victoire, ...etat.victoires];
        rendreTaches();
        rendreVictoires();
      } catch (souci) {
        console.error('Impossible de terminer la tâche', souci);
        case_.checked = false;
        case_.disabled = false;
      }
    });
  },
};

// Les événements affichés vont jusqu'à trois mois : un espace projet regarde
// plus loin que la semaine du tableau de bord.
function horizon() {
  const dans3Mois = new Date();
  dans3Mois.setMonth(dans3Mois.getMonth() + 3);
  return dans3Mois.toISOString();
}
