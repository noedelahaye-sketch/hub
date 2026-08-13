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

        ${construireFormulaire({
          id: `modif-${objectif.id}`,
          libelle: "Modifier l'objectif",
          action: 'modifier-objectif',
          bouton: 'Enregistrer',
          champs: [
            { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true, valeur: objectif.titre },
            { nom: 'pourquoi', libelle: 'Pourquoi ?', type: 'textarea', valeur: objectif.pourquoi },
            { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text', valeur: objectif.cible },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date', valeur: objectif.echeance },
          ],
          extra: `<input type="hidden" name="objectif_id" value="${echapper(objectif.id)}">`,
        })}

        <div class="objectif-actions">
          <button type="button" class="bouton-secondaire bouton-mini"
            data-atteindre="${echapper(objectif.id)}">Marquer l'objectif atteint</button>
          <button type="button" class="lien-discret bouton-mini"
            data-supprimer-objectif="${echapper(objectif.id)}">Supprimer</button>
        </div>
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
    : `<p class="vide">Rien à faire ici. Note ta prochaine tâche au-dessous.</p>`;

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
              <button type="button" class="lien-discret bouton-mini bouton-retirer"
                data-supprimer-tache="${echapper(tache.id)}"
                title="Supprimer cette tâche"
                aria-label="Supprimer « ${echapper(tache.titre)} »">×</button>
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
      <!-- Le « ↓ » qui renvoyait au backlog est retiré (13 août 2026) : c'est
           LE réglage que Noé a demandé de masquer. Le backlog reste lisible
           s'il contient encore quelque chose d'avant — il se replie tout seul
           quand il est vide, c'est-à-dire toujours désormais. -->
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-supprimer-tache="${echapper(tache.id)}"
        title="Supprimer cette tâche"
        aria-label="Supprimer « ${echapper(tache.titre)} »">×</button>
    </li>`;
}

export function construireEvenements(evenements) {
  if (!evenements.length) return `<p class="vide">Rien de prévu pour l'instant.</p>`;

  return `<ul class="liste-semaine">${evenements
    .map(
      (evenement) => `
      <li>
        <span class="tuile-entete">
          <span class="discret">${
            evenement.lieu ? echapper(evenement.lieu) : ''
          }</span>
          <span class="discret quand">${echapper(
            momentLisible(new Date(evenement.date_debut)),
          )}</span>
          <button type="button" class="lien-discret bouton-mini bouton-retirer"
            data-supprimer-evenement="${echapper(evenement.id)}"
            title="Supprimer cet événement"
            aria-label="Supprimer « ${echapper(evenement.titre)} »">×</button>
        </span>
        <span class="semaine-titre">${echapper(evenement.titre)}</span>
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
        <span class="tuile-entete">
          <span class="discret quand">${echapper(
            echeanceLisible(depuisDateISO(victoire.date)),
          )}</span>
          <button type="button" class="lien-discret bouton-mini bouton-retirer"
            data-victoire="${echapper(victoire.id)}"
            title="Retirer cette victoire"
            aria-label="Retirer « ${echapper(victoire.titre)} »">×</button>
        </span>
        <span class="victoire-titre">${echapper(victoire.titre)}</span>
      </li>`,
    )
    .join('')}</ul>`;
}

// Un formulaire replié par défaut : la page sert d'abord à lire ce qui avance,
// pas à saisir. `valeur` pré-remplit un champ — c'est ce qui fait qu'un même
// gabarit sert à l'ajout comme à la modification. Un champ peut être un
// `select` (avec `options: { valeur: libellé }`), une `checkbox`, ou porter des
// `suggestions` (saisie libre + liste d'appui, via datalist).
// Une fenêtre par-dessus la page : on pose une chose sans quitter la vue
// d'ensemble, et on la referme d'un geste. `data-fermer-fenetre` est le seul
// crochet à brancher — le fond comme la croix le portent.
export function construireFenetre(titre, contenu) {
  return `
    <div class="fenetre-fond" data-fermer-fenetre></div>
    <div class="fenetre" role="dialog" aria-modal="true" aria-label="${echapper(titre)}">
      <button type="button" class="fenetre-fermer" data-fermer-fenetre
        aria-label="Fermer">×</button>
      ${contenu}
    </div>`;
}

// `avecPli` à false rend le formulaire nu, sans son dépliant : dans une
// fenêtre, le titre est déjà dit par la fenêtre elle-même.
// Un choix dans un formulaire : le bouton touché devient l'actif, et la valeur
// va dans le champ caché de son groupe. Rien n'est redessiné — le formulaire
// garde ce qui est déjà saisi ailleurs, curseur compris.
export function poserLeChoix(bouton) {
  const groupe = bouton.closest('[data-choix-champ]');
  if (!groupe) return;

  groupe.querySelector('input[type="hidden"]').value = bouton.dataset.valeur;
  for (const autre of groupe.querySelectorAll('button')) {
    const actif = autre === bouton;
    autre.classList.toggle('actif', actif);
    autre.setAttribute('aria-pressed', String(actif));
  }
}

// À poser une fois par espace qui affiche un formulaire à choix. Les espaces
// qui branchent déjà la tuile de capture n'en ont pas besoin — elle s'en
// charge —, mais le site du FCH, lui, a des formulaires sans tuile.
export function brancherChoix(section) {
  section.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-choix-champ] [data-choix]');
    if (bouton) poserLeChoix(bouton);
  });
}

export function construireFormulaire({
  id,
  libelle,
  action,
  champs,
  extra = '',
  bouton = 'Ajouter',
  ouvert = false,
  avecPli = true,
}) {
  const rendreChamp = (champ) => {
    const idChamp = `${id}-${champ.nom}`;
    const requis = champ.requis ? 'required' : '';

    if (champ.type === 'textarea') {
      return `<textarea id="${idChamp}" name="${champ.nom}" rows="2" ${requis}>${echapper(
        champ.valeur ?? '',
      )}</textarea>`;
    }

    // Un choix qui se TOUCHE, pas un menu déroulant. Le hub a banni le
    // `<select>` natif de sa tuile de capture le 13 août 2026 (« le rectangle
    // bleu avec un menu déroulant, c'est très laid et pas agréable ») ; les
    // formulaires de modification l'ont gardé jusqu'au soir, et l'incohérence
    // se voyait. Chaque option est un bouton, la valeur voyage dans un champ
    // caché — le formulaire se lit toujours avec `FormData`, il n'a pas à
    // savoir comment on a saisi.
    if (champ.type === 'choix') {
      // Le choix VIDE passe devant. JavaScript énumère les clés numériques
      // d'abord, quel que soit l'ordre d'écriture : `{ '': 'Sans pilier', 1: … }`
      // ressortait « 1, 2, 3, 4, Sans pilier », et la valeur par défaut se
      // retrouvait en queue. Invisible dans un menu déroulant, voyant dès que
      // les options deviennent des pastilles alignées.
      const options = Object.entries(champ.options).sort(
        ([a], [b]) => (a === '' ? -1 : 0) - (b === '' ? -1 : 0),
      );

      // Sans valeur donnée, la PREMIÈRE option est choisie — c'est ce que fait
      // un `<select>`, et plusieurs formulaires comptaient dessus sans le dire.
      // Sans ça, « Noter une idée » repartait avec un réseau vide, et la base
      // refusait la ligne. Un `??` et non un `||` : une valeur explicitement
      // vide (« Sans pilier ») est un choix, pas une absence.
      const valeur = champ.valeur ?? options[0]?.[0] ?? '';

      return `<span class="choix-champ" data-choix-champ="${champ.nom}">
        <input type="hidden" name="${champ.nom}" value="${echapper(valeur)}">
        ${options
          .map(
            ([cle, libelleOption]) => `
          <button type="button" data-choix="${champ.nom}" data-valeur="${echapper(cle)}"
            class="${String(cle) === String(valeur) ? 'actif' : ''}"
            aria-pressed="${String(cle) === String(valeur)}"
            >${echapper(libelleOption)}</button>`,
          )
          .join('')}
      </span>`;
    }

    if (champ.type === 'select') {
      return `<select id="${idChamp}" name="${champ.nom}" ${requis}>${Object.entries(
        champ.options,
      )
        .map(
          ([valeur, libelleOption]) =>
            `<option value="${echapper(valeur)}" ${
              valeur === champ.valeur ? 'selected' : ''
            }>${echapper(libelleOption)}</option>`,
        )
        .join('')}</select>`;
    }

    // Un champ fichier n'a pas de valeur qu'on puisse écrire : le navigateur
    // refuse qu'on la lui impose, et c'est heureux.
    if (champ.type === 'file') {
      return `<input id="${idChamp}" name="${champ.nom}" type="file" ${requis}
        ${champ.accepte ? `accept="${champ.accepte}"` : ''} class="champ-fichier">`;
    }

    const datalist = champ.suggestions
      ? `<datalist id="${idChamp}-liste">${champ.suggestions
          .map((suggestion) => `<option value="${echapper(suggestion)}"></option>`)
          .join('')}</datalist>`
      : '';

    return `<input id="${idChamp}" name="${champ.nom}" type="${champ.type}" ${requis}
      ${champ.suggestions ? `list="${idChamp}-liste"` : ''}
      value="${echapper(champ.valeur ?? '')}">${datalist}`;
  };

  // Une case à cocher porte son libellé à côté d'elle, pas au-dessus : c'est
  // toute la ligne qui devient la cible tactile, une case seule fait 16 px.
  const rendreLigne = (champ) =>
    champ.type === 'checkbox'
      ? `<label class="champ-case" for="${id}-${champ.nom}">
           <input id="${id}-${champ.nom}" name="${champ.nom}" type="checkbox" value="oui"
             ${champ.valeur ? 'checked' : ''}>
           <span>${champ.libelle}</span>
         </label>`
      : `<label for="${id}-${champ.nom}">${champ.libelle}</label>
         ${rendreChamp(champ)}`;

  const corps = `
    <form data-action="${action}">
      ${extra}
      ${champs.map(rendreLigne).join('')}
      <button type="submit" class="bouton-secondaire">${echapper(bouton)}</button>
      <p class="message-erreur" data-erreur hidden></p>
    </form>`;

  if (!avecPli) return `<div class="ajout" data-ajout="${id}">${corps}</div>`;

  return `
    <details class="ajout" data-ajout="${id}" ${ouvert ? 'open' : ''}>
      <summary>${libelle}</summary>
      ${corps}
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
            // « Quand » et non « Échéance » : une échéance est une date qu'on
            // subit — c'est le mot des objectifs et des commandes. Une tâche,
            // on choisit le moment où on la fait.
            { nom: 'echeance', libelle: 'Quand (facultatif)', type: 'date' },
            { nom: 'heure', libelle: 'À quelle heure (vide = dans la journée)', type: 'time' },
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

      const charger = async () => {
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
      };

      // Revenir sur l'espace le relit : une tâche du projet posée depuis le
      // calendrier ou cochée sur l'accueil doit s'y voir sans recharger.
      this.rafraichir = charger;

      try {
        await charger();
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
        if (action === 'modifier-objectif') {
          const objectif = etat.objectifs.find((o) => o.id === champs.objectif_id);
          const misAJour = await api.modifierObjectif(champs.objectif_id, {
            titre: champs.titre.trim(),
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
            echeance: champs.echeance || null,
          });
          // La mise à jour ne renvoie que les colonnes : les jalons déjà
          // chargés restent en place.
          Object.assign(objectif, misAJour);
          rendreObjectifs();
          ouvrirObjectif(objectif.id);
          return;
        }

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
          // Active d'emblée, comme partout depuis le 13 août : le réglage
          // backlog / active est masqué, une tâche notée est une tâche à faire.
          const tache = await api.creerTache({
            projet,
            titre: champs.titre.trim(),
            statut: 'actif',
            echeance: champs.echeance || null,
            // Une heure sans jour ne veut rien dire : elle est ignorée.
            heure: (champs.echeance && champs.heure) || null,
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

        const atteindre = evenement.target.closest('[data-atteindre]');
        if (atteindre) return atteindreObjectif(atteindre);

        const supprObjectif = evenement.target.closest('[data-supprimer-objectif]');
        if (supprObjectif) return supprimerObjectif(supprObjectif);

        const supprTache = evenement.target.closest('[data-supprimer-tache]');
        if (supprTache) return supprimerTache(supprTache);

        const supprEvenement = evenement.target.closest('[data-supprimer-evenement]');
        if (supprEvenement) return supprimerEvenement(supprEvenement);

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

      // Atteindre un objectif est rare et engageant : on demande une fois.
      // Cocher une tâche, geste quotidien, n'a pas cette friction — lui a
      // l'annulation de six secondes à la place.
      async function atteindreObjectif(bouton) {
        const objectif = etat.objectifs.find((o) => o.id === bouton.dataset.atteindre);
        if (!objectif) return;
        if (!confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;

        bouton.disabled = true;
        try {
          const { victoire } = await api.atteindreObjectif(objectif);
          etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
          etat.victoires = [victoire, ...etat.victoires];
          rendreObjectifs();
          rendreVictoires();
        } catch (souci) {
          console.error("Impossible de marquer l'objectif atteint", souci);
          bouton.disabled = false;
        }
      }

      async function supprimerObjectif(bouton) {
        const objectif = etat.objectifs.find((o) => o.id === bouton.dataset.supprimerObjectif);
        if (!objectif) return;
        if (!confirm(`Supprimer « ${objectif.titre} » et ses jalons ? Les tâches liées sont conservées.`)) {
          return;
        }

        bouton.disabled = true;
        try {
          await api.supprimerObjectif(objectif.id);
          etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
          rendreObjectifs();
        } catch (souci) {
          console.error("Suppression de l'objectif impossible", souci);
          bouton.disabled = false;
        }
      }

      async function supprimerTache(bouton) {
        const id = bouton.dataset.supprimerTache;
        bouton.disabled = true;
        try {
          await api.supprimerTache(id);
          etat.taches = etat.taches.filter((tache) => tache.id !== id);
          rendreTaches();
        } catch (souci) {
          console.error('Suppression de la tâche impossible', souci);
          bouton.disabled = false;
        }
      }

      async function supprimerEvenement(bouton) {
        const id = bouton.dataset.supprimerEvenement;
        bouton.disabled = true;
        try {
          await api.supprimerEvenement(id);
          etat.evenements = etat.evenements.filter((e) => e.id !== id);
          rendreEvenements();
        } catch (souci) {
          console.error("Suppression de l'événement impossible", souci);
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
