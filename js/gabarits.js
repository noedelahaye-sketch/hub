// Les gabarits partagés des espaces du hub : tuiles d'objectif, listes
// d'événements et de victoires, fenêtres volantes, et le formulaire commun avec
// ses menus dessinés.
//
// Ce module était une FABRIQUE de pages d'espace jusqu'au 26 août 2026. Elle n'a
// plus d'utilisateur : la formation, sa dernière page, est devenue un bilan à
// deux colonnes comme Yuno et le FCH, et chacune monte désormais la sienne.
// Restent ici les morceaux que tout le monde emprunte.

import {
  depuisDateISO,
  echeanceLisible,
  momentLisible,
  echapper,
  DUREES_PROPOSEES,
  DUREES_FAITES,
  dureeLisible,
} from './format.js';
import { construireProgression } from './objectifs-commun.js';

// --- Fabrication du HTML ----------------------------------------------------

// `retraitJalon` n'est pas un réglage de goût : la croix appelle un gestionnaire
// que tout le monde n'a pas. Les deux sites retirent un jalon par leur propre
// chemin (la fenêtre de détail) ; leur poser cette croix ferait un bouton mort.
// Elle est donc demandée, jamais offerte d'office.
// `complements` : du HTML propre à un objectif, glissé dans son détail, par
// identifiant. L'espace Objectifs s'en sert pour poser les prestations et le
// matériel à côté de « Rembourser mon matériel » — ce qui mesure un objectif se
// corrige là où l'objectif se règle (demande de Noé, 26 août 2026).
export function construireObjectifs(objectifs, { retraitJalon = false, complements = {} } = {}) {
  if (!objectifs.length) {
    return `<p class="vide">Aucun objectif pour l'instant. Le premier donne le cap.</p>`;
  }
  return `<div class="grille-objectifs">${objectifs
    .map((objectif) =>
      construireObjectif(objectif, { retraitJalon, complement: complements[objectif.id] }),
    )
    .join('')}</div>`;
}

function construireObjectif(objectif, { retraitJalon = false, complement = '' } = {}) {
  const jalons = [...(objectif.jalons ?? [])].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  const progression = construireProgression(jalons);

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
        ${complement}

        <ul class="liste-jalons">${jalons
          .map((jalon) => construireJalon(jalon, { retraitJalon }))
          .join('')}</ul>

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

function construireJalon(jalon, { retraitJalon = false } = {}) {
  // Le retrait vaut pour tous les jalons, atteints compris : un jalon mal
  // découpé se corrige, même après coup.
  const retirer = retraitJalon
    ? `<button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-supprimer-jalon="${echapper(jalon.id)}"
        title="Retirer ce jalon"
        aria-label="Retirer « ${echapper(jalon.titre)} »">×</button>`
    : '';

  if (jalon.atteint) {
    return `
      <li class="jalon-atteint">
        <span class="marque-jalon" aria-hidden="true">✓</span>
        <span>${echapper(jalon.titre)}</span>
        ${retirer}
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
      ${retirer}
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
// `large` : une fenêtre de 48 rem au lieu de 28. Réservée aux formulaires qui
// ont beaucoup à dire — la fiche d'une sortie Yuno en a douze champs, et à
// 28 rem ils s'empilaient sur deux écrans de défilement (demande de Noé,
// 26 août 2026).
export function construireFenetre(titre, contenu, { large = false } = {}) {
  return `
    <div class="fenetre-fond" data-fermer-fenetre></div>
    <div class="fenetre${large ? ' fenetre-large' : ''}"
      role="dialog" aria-modal="true" aria-label="${echapper(titre)}">
      <button type="button" class="fenetre-fermer" data-fermer-fenetre
        aria-label="Fermer">×</button>
      ${contenu}
    </div>`;
}

// `avecPli` à false rend le formulaire nu, sans son dépliant : dans une
// fenêtre, le titre est déjà dit par la fenêtre elle-même.
// Le chevron du menu : un dessin, pas un caractère — il garde son épaisseur et
// son alignement quelle que soit la police.
export const CHEVRON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"></path></svg>`;

// Un choix dans un formulaire : le bouton touché devient l'actif, la valeur va
// dans le champ caché de son groupe, le libellé du déclencheur suit, et le
// panneau se referme. Rien n'est redessiné — le formulaire
// garde ce qui est déjà saisi ailleurs, curseur compris.
export function poserLeChoix(bouton) {
  const groupe = bouton.closest('[data-choix-champ]');
  if (!groupe) return;

  groupe.querySelector('input[type="hidden"]').value = bouton.dataset.valeur;
  for (const autre of groupe.querySelectorAll('[data-choix]')) {
    const actif = autre === bouton;
    autre.classList.toggle('actif', actif);
    autre.setAttribute('aria-pressed', String(actif));
  }

  // Le déclencheur porte la valeur : c'est ce qui permet de relire tout le
  // formulaire sans ouvrir un seul menu.
  const declencheur = groupe.querySelector('[data-ouvrir-choix]');
  if (declencheur) {
    declencheur.innerHTML = `${bouton.textContent.trim()}${CHEVRON}`;
    declencheur.setAttribute('aria-expanded', 'false');
  }
  groupe.querySelector('.choix-panneau').hidden = true;
}

// Ouvrir un menu ferme les autres : deux panneaux ouverts se recouvriraient.
export function basculerChoixDeFormulaire(declencheur, section) {
  const groupe = declencheur.closest('[data-choix-champ]');
  const panneau = groupe.querySelector('.choix-panneau');
  const ouvert = !panneau.hidden;

  fermerLesChoix(section);
  panneau.hidden = ouvert;
  declencheur.setAttribute('aria-expanded', String(!ouvert));
}

export function fermerLesChoix(section) {
  for (const panneau of section.querySelectorAll('.choix-panneau')) panneau.hidden = true;
  for (const declencheur of section.querySelectorAll('[data-ouvrir-choix]')) {
    declencheur.setAttribute('aria-expanded', 'false');
  }
}

// À poser une fois par espace qui affiche un formulaire à choix. Les espaces
// qui branchent déjà la tuile de capture n'en ont pas besoin — elle s'en
// charge —, mais le site du FCH, lui, a des formulaires sans tuile.
export function brancherChoix(section) {
  section.addEventListener('click', (evenement) => {
    const declencheur = evenement.target.closest('[data-ouvrir-choix]');
    if (declencheur) {
      basculerChoixDeFormulaire(declencheur, section);
      return;
    }

    const bouton = evenement.target.closest('[data-choix-champ] [data-choix]');
    if (bouton) {
      poserLeChoix(bouton);
      return;
    }

    // Un clic ailleurs referme : c'est le geste attendu d'un menu.
    fermerLesChoix(section);
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
  // `grille` : chaque champ est enveloppé, ce qui permet de les ranger en
  // colonnes dans une fenêtre large. Sans enveloppe, l'étiquette et son champ
  // sont deux éléments de grille et se retrouvent dans deux colonnes
  // différentes. Réservé aux formulaires qui le demandent : l'envelopper
  // partout changerait la mise en page de tous les autres.
  grille = false,
}) {
  const rendreChamp = (champ) => {
    const idChamp = `${id}-${champ.nom}`;
    const requis = champ.requis ? 'required' : '';

    if (champ.type === 'textarea') {
      return `<textarea id="${idChamp}" name="${champ.nom}" rows="2" ${requis}>${echapper(
        champ.valeur ?? '',
      )}</textarea>`;
    }

    // Un menu déroulant DESSINÉ, jamais le `<select>` du système. Le hub l'a
    // banni de sa tuile le 13 août 2026 (« le rectangle bleu avec un menu
    // déroulant, c'est très laid et pas agréable ») ; les formulaires l'ont
    // gardé jusqu'au lendemain.
    //
    // La forme est celle de la pastille « Priorité » de la tuile, et Noé l'a
    // redemandée telle quelle : un contrôle qui montre la valeur choisie, et
    // qui ouvre au toucher un panneau de lignes pleine largeur. Pas une rangée
    // d'options toutes visibles — un formulaire de dix champs deviendrait un
    // mur de pastilles.
    //
    // La valeur voyage dans un champ caché : le formulaire se lit toujours
    // avec `FormData`, il n'a pas à savoir comment on a saisi.
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

      const choisi = options.find(([cle]) => String(cle) === String(valeur));

      return `<span class="choix-champ" data-choix-champ="${champ.nom}">
        <input type="hidden" name="${champ.nom}" value="${echapper(valeur)}">
        <button type="button" class="choix-declencheur" data-ouvrir-choix
          aria-expanded="false" aria-haspopup="listbox"
          >${echapper(choisi?.[1] ?? 'Choisir')}${CHEVRON}</button>
        <div class="choix-panneau" hidden>
          <ul class="choix-capture">
            ${options
              .map(
                ([cle, libelleOption]) => `
              <li><button type="button" data-choix="${champ.nom}" data-valeur="${echapper(cle)}"
                class="${String(cle) === String(valeur) ? 'actif' : ''}"
                aria-pressed="${String(cle) === String(valeur)}"
                >${echapper(libelleOption)}</button></li>`,
              )
              .join('')}
          </ul>
        </div>
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
  const rendreLigne = (champ) => {
    // Un intertitre, pas un champ : il annonce un groupe et n'a rien à envoyer.
    if (champ.type === 'titre') {
      return `<p class="separateur-champs">${echapper(champ.libelle)}</p>`;
    }

    const corps =
      champ.type === 'checkbox'
        ? `<label class="champ-case" for="${id}-${champ.nom}">
             <input id="${id}-${champ.nom}" name="${champ.nom}" type="checkbox" value="oui"
               ${champ.valeur ? 'checked' : ''}>
             <span>${champ.libelle}</span>
           </label>`
        : `<label for="${id}-${champ.nom}">${champ.libelle}</label>
           ${rendreChamp(champ)}`;

    if (!grille) return corps;
    return `<div class="champ${champ.large ? ' champ-large' : ''}">${corps}</div>`;
  };

  const corps = `
    <form data-action="${action}">
      ${extra}
      ${champs.map(rendreLigne).join('')}
      <button type="submit" class="bouton-secondaire">${echapper(bouton)}</button>
      <p class="message-erreur" data-erreur hidden></p>
    </form>`;

  if (!avecPli) return `<div class="ajout" data-ajout="${id}">${corps}</div>`;

  // AJOUTER DU CONTENU OUVRE UNE TUILE VOLANTE (demande de Noé, 27 août 2026).
  // C'est le geste de la capture des tâches, étendu à tout ce qui ajoute
  // quelque chose : un objectif, un projet, une période, un jalon, une idée.
  // Déplié sur place, un formulaire de six champs poussait la page entière vers
  // le bas et faisait perdre ce qu'on était en train de regarder.
  //
  // Le `<details>` RESTE, et ce n'est pas un vestige : c'est lui qui porte
  // l'état ouvert/fermé, il donne au sommaire un rôle de bouton sans qu'on ait
  // rien à brancher, et les écrans qui referment le formulaire après coup
  // écrivent déjà `.closest('.ajout').open = false`. Le rendre volant ne change
  // donc que sa mise en forme — dix-sept formulaires basculent sans qu'aucun
  // écran ne bouge.
  //
  // `ouvert: true` reste INLINE : ce sont les formulaires déjà dépliés dans une
  // fenêtre (la modification depuis le calendrier). Une tuile par-dessus une
  // fenêtre serait une fenêtre de trop.
  const volant = !ouvert;

  return `
    <details class="ajout${volant ? ' ajout-volant' : ''}" data-ajout="${id}"
      ${ouvert ? 'open' : ''}>
      <summary>${libelle}</summary>
      ${
        volant
          ? `<div class="ajout-fond" data-fermer-ajout></div>
             <div class="ajout-tuile">
               <p class="ajout-titre">
                 <span>${echapper(libelle)}</span>
                 <button type="button" class="lien-discret bouton-mini bouton-retirer"
                   data-fermer-ajout title="Fermer" aria-label="Fermer">×</button>
               </p>
               ${corps}
             </div>`
          : corps
      }
    </details>`;
}

// --- Fabrique d'espace ------------------------------------------------------

// --- Combien de temps ça prend -----------------------------------------------
//
// La durée d'une TÂCHE se tape en minutes (demande de Noé, 26 août 2026) : une
// liste fermée ne peut pas dire « vingt minutes » ni « une heure et quart », et
// une tâche dure ce qu'elle dure. Les propositions — de 1 h à 3 h — ne sont
// qu'un raccourci pour les cas fréquents ; elles écrivent dans le même champ.
//
// Un seul endroit pour ce morceau, parce qu'il sert dans DEUX tuiles qui n'ont
// rien d'autre en commun : celle de l'espace Tâches et celle du calendrier.
// Deux copies, et l'une des deux finirait par ne plus proposer les mêmes pas.
//
// Le champ porte `data-format-duree` : c'est ce qui dit à la tuile du
// calendrier d'écrire « 1 h 30 » sur sa pastille plutôt que « 90 ».
//
// `step="1"` et non 5 : un pas de 5 rendrait « 7 minutes » invalide aux yeux
// du navigateur, qui refuserait alors d'envoyer tout le formulaire pour une
// durée. Les bornes, elles, sont celles de la colonne (5 à 1440).
export function champDuree({
  id = 'champ-duree',
  nom = 'duree',
  valeur = null,
  libelle = 'Combien de temps (avec une heure)',
} = {}) {
  const minutes = Number(valeur) > 0 ? String(Number(valeur)) : '';

  return `
    <label class="champ-capture" for="${echapper(id)}">${echapper(libelle)}</label>
    <div class="duree-champ">
      <span class="duree-propositions">
        ${DUREES_PROPOSEES.map(
          (pas) => `<button type="button" data-poser-duree="${pas}"
            aria-pressed="${String(pas) === minutes}"
            class="${String(pas) === minutes ? 'actif' : ''}">${echapper(
              dureeLisible(pas),
            )}</button>`,
        ).join('')}
      </span>
      <span class="duree-libre">
        <input type="number" id="${echapper(id)}" name="${echapper(nom)}"
          data-champ-duree data-format-duree
          min="5" max="1440" step="1" inputmode="numeric"
          value="${echapper(minutes)}"
          aria-label="Durée en minutes">
        <span aria-hidden="true">min</span>
      </span>
    </div>`;
}

// La proposition qui correspond à la valeur courante se marque, les autres se
// démarquent. Les deux tuiles s'en servent après un appui ou une frappe : le
// bouton « 1 h 30 » doit s'éteindre dès qu'on tape 95 à la main.
export function marquerLaDuree(racine, minutes) {
  for (const bouton of racine.querySelectorAll('[data-poser-duree]')) {
    const actif = bouton.dataset.poserDuree === String(minutes ?? '');
    bouton.classList.toggle('actif', actif);
    bouton.setAttribute('aria-pressed', String(actif));
  }
}


// --- « Combien de temps ça a pris ? » ----------------------------------------
//
// La question se pose au moment où on coche (demande de Noé, 27 août 2026), et
// elle est la seule source d'heures du hub : sans elle, le compte courant du
// club et la courbe de la formation n'ont rien à compter.
//
// C'EST UNE FENÊTRE, PAS UNE INCRUSTATION (demande de Noé, même jour). Même
// mécanique que la tuile du « + » : le fond s'assombrit, et RIEN N'EST ÉCRIT
// tant qu'on n'a pas confirmé. Cocher devient donc une intention, pas un fait
// acquis — refermer sans confirmer laisse la tâche exactement où elle était.
//
// La première version posait la question APRÈS coup, sans fond ni bouton, et
// s'effaçait au bout de dix secondes. Elle avait le défaut de sa discrétion :
// on cochait, on ne répondait pas, et le hub n'apprenait rien.
//
// La durée déjà connue est reprise et pré-sélectionnée : Noé l'a demandé ainsi —
// « soit on confirme, soit on modifie si finalement ce ne fut pas cette durée ».
// Les raccourcis ne valident donc rien, ils CHOISISSENT ; c'est le bouton qui
// valide. Une seule colonne, corrigée, et non deux qui se contrediraient.

const COCHE = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true"><path d="M4 12.5l5.5 5.5L20 7"/></svg>`;

export function tuileDureeFaite({ titre, duree = null }) {
  const minutes = Number(duree) > 0 ? String(Number(duree)) : '';

  return `
    <div class="fenetre-fond capture-fond" data-duree-annuler></div>
    <div class="tuile-duree" role="dialog" aria-modal="true"
      aria-label="Combien de temps ça a pris ?">
      <p class="tuile-duree-quoi">
        <span>Combien de temps&nbsp;?</span>
        <span class="discret">${echapper(titre)}</span>
      </p>
      <div class="duree-champ">
        <span class="duree-propositions">
          ${DUREES_FAITES.map(
            (pas) => `<button type="button" data-poser-duree="${pas}"
              class="${String(pas) === minutes ? 'actif' : ''}"
              aria-pressed="${String(pas) === minutes}">${echapper(dureeLisible(pas))}</button>`,
          ).join('')}
        </span>
        <span class="duree-libre">
          <input type="number" data-duree-libre data-champ-duree min="5" max="1440" step="1"
            inputmode="numeric" value="${echapper(minutes)}"
            aria-label="Durée en minutes">
          <span aria-hidden="true">min</span>
        </span>
      </div>
      <!-- Trois issues, et elles ne disent pas la même chose :
           « Annuler » n'écrit rien du tout — la tâche reste à faire ;
           « Passer » la termine SANS toucher à sa durée — on n'est jamais
           obligé d'en donner une (demande de Noé), et une durée inventée vaut
           moins que pas de durée ;
           la coche la termine avec la durée affichée. -->
      <div class="tuile-duree-pied">
        <button type="button" class="lien-discret" data-duree-annuler>Annuler</button>
        <span class="tuile-duree-valider">
          <button type="button" class="lien-discret" data-duree-passer>Passer</button>
          <button type="button" class="capture-envoyer" data-duree-confirmer
            aria-label="Marquer comme faite" title="Marquer comme faite">${COCHE}</button>
        </span>
      </div>
    </div>`;
}

// Poser la question. `confirmer` n'est appelé QUE si Noé confirme ou passe, et
// reçoit les minutes — ou `null` s'il n'en a pas donné. Une tâche peut se
// terminer sans qu'on sache combien de temps elle a pris : forcer un chiffre
// ferait inventer des heures fausses, ce qui vaut moins que pas d'heures.
// `null` ne remet pas la durée à zéro non plus — passer, c'est ne rien dire,
// pas effacer ce qui était déjà noté.
export function demanderLaDuree(cible, confirmer) {
  fermerLaDuree();

  const enveloppe = document.createElement('div');
  enveloppe.className = 'tuile-duree-hote';
  enveloppe.innerHTML = tuileDureeFaite({ titre: cible.titre, duree: cible.duree });
  document.body.append(enveloppe);

  const libre = enveloppe.querySelector('[data-duree-libre]');

  const fermer = () => {
    enveloppe.remove();
    document.removeEventListener('keydown', surTouche);
  };

  function surTouche(evenement) {
    if (evenement.key === 'Escape') fermer();
    if (evenement.key === 'Enter' && evenement.target === libre) {
      evenement.preventDefault();
      valider();
    }
  }

  function valider() {
    const minutes = Number(libre.value);
    const retenue = Number.isFinite(minutes) && minutes >= 5 && minutes <= 1440
      ? Math.round(minutes)
      : null;
    fermer();
    confirmer(retenue);
  }

  enveloppe.addEventListener('click', (evenement) => {
    // Un raccourci CHOISIT une durée, il ne valide pas : on peut se reprendre
    // avant de confirmer, et c'est tout l'intérêt d'une valeur pré-remplie.
    const raccourci = evenement.target.closest('[data-poser-duree]');
    if (raccourci) {
      libre.value = raccourci.dataset.poserDuree;
      marquerLaDuree(enveloppe, libre.value);
      return;
    }
    if (evenement.target.closest('[data-duree-confirmer]')) return valider();
    if (evenement.target.closest('[data-duree-passer]')) {
      fermer();
      return confirmer(null);
    }
    if (evenement.target.closest('[data-duree-annuler]')) fermer();
  });

  // Le champ des minutes reste libre : taper 47 doit éteindre le raccourci qui
  // était allumé, sinon deux durées s'affichent choisies en même temps.
  libre.addEventListener('input', () => marquerLaDuree(enveloppe, libre.value));

  // On ne vise PAS le champ : sur téléphone, ouvrir le clavier par surprise
  // devant une question à laquelle on répond d'un doigt est une gêne pure.
  // C'est le bouton de confirmation qui prend le focus — au clavier, Entrée
  // termine donc la tâche.
  enveloppe.querySelector('[data-duree-confirmer]').focus();
  document.addEventListener('keydown', surTouche);
  return fermer;
}

export function fermerLaDuree() {
  for (const ancienne of document.querySelectorAll('.tuile-duree-hote')) ancienne.remove();
}
