// Les gabarits partagés des espaces du hub : tuiles d'objectif, listes
// d'événements et de victoires, fenêtres volantes, et le formulaire commun avec
// ses menus dessinés.
//
// Ce module était une FABRIQUE de pages d'espace jusqu'au 26 août 2026. Elle n'a
// plus d'utilisateur : la formation, sa dernière page, est devenue un bilan à
// deux colonnes comme Yuno et le FCH, et chacune monte désormais la sienne.
// Restent ici les morceaux que tout le monde emprunte.

import {
  versDateISO,
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
// LE LOGO CALENDRIER d'une pastille de date (30 août 2026, demande de Noé). Le
// même trait que partout ailleurs — le hub en a déjà un dans la ligne d'une
// tâche et dans la tuile de capture ; c'est le troisième endroit, pas un
// troisième dessin.
export const ICONE_DATE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
  <path d="M3 10h18M8 3v4M16 3v4"></path></svg>`;

// Ce qu'une pastille de date écrit : sa valeur quand elle en a une, le nom du
// champ quand elle est vide. C'est la règle des pastilles de la tuile de
// capture, et il n'y a pas de raison qu'elle change de forme ici.
//
// Une date COURTE : « 4 sept. » et non « le 4 septembre » — la pastille tient
// dans une rangée, et l'année ne s'écrit que si ce n'est pas celle en cours.
export function dateDePastille(valeur, libelle) {
  if (!valeur) return libelle;
  const date = depuisDateISO(valeur);
  const memeAnnee = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(memeAnnee ? {} : { year: 'numeric' }),
  });
}

// LA PASTILLE SUIT SON CHAMP, posé une seule fois pour tout le document. Le
// champ natif vit SOUS la pastille, transparent : c'est lui qu'on touche, donc
// c'est le sélecteur de dates du navigateur qui s'ouvre, sans une ligne de
// JavaScript pour l'appeler — et il reste focusable, ce qui compte : un champ
// requis que le navigateur ne peut pas atteindre bloque l'envoi en silence.
//
// Posé ici et non par espace : dix-sept formulaires vivent dans ce document, et
// une pastille qui n'afficherait pas la date qu'on vient de choisir serait un
// mensonge — pas un réglage qu'on branche au cas par cas.
if (typeof document !== 'undefined') {
  document.addEventListener('change', (evenement) => {
    const champ = evenement.target;
    if (!champ.matches?.('.pastille-date input[type="date"]')) return;
    const pastille = champ.closest('.pastille-date').querySelector('.choix-declencheur');
    if (!pastille) return;

    const libelle = champ.closest('.pastille-date').dataset.libelle ?? 'Date';
    pastille.lastElementChild.textContent = dateDePastille(champ.value, libelle);
    pastille.classList.toggle('choix-vide', !champ.value);
    const nom = champ.value ? `${libelle} : ${dateDePastille(champ.value, libelle)}` : libelle;
    pastille.setAttribute('title', nom);
  });
}

// LE CLAVIER S'OUVRE AVEC LA TUILE (30 août 2026, demande de Noé : « comme pour
// les tâches, le clavier s'ouvre directement pour écrire dans cette zone »).
//
// DEUX CHEMINS, et le premier est le seul qui marche sur iPhone. Un `focus()`
// programmé HORS d'un geste de l'utilisateur ne lève pas le clavier sur iOS ; or
// l'événement `toggle` d'un `<details>` est mis en file, donc tiré du geste. On
// intercepte donc le clic sur le sommaire, on ouvre soi-même, et on donne le
// focus dans la foulée — tout dans la même impulsion.
//
// Le second chemin, `toggle` en capture (il ne remonte pas), rattrape les tuiles
// qu'un espace ouvre lui-même : là, le clavier attendra le doigt, mais le
// curseur est au bon endroit.
if (typeof document !== 'undefined') {
  const donnerLeFocus = (details) => {
    const champ = details.querySelector('.champ-titre');
    if (champ && !details.contains(document.activeElement)) champ.focus();
  };

  document.addEventListener('click', (evenement) => {
    const sommaire = evenement.target.closest?.('.ajout > summary');
    if (!sommaire) return;

    const details = sommaire.parentElement;
    // On ne touche à rien quand elle se REFERME : le geste natif suffit.
    if (details.open || !details.querySelector('.champ-titre')) return;

    evenement.preventDefault();
    details.open = true;
    donnerLeFocus(details);
  });

  document.addEventListener(
    'toggle',
    (evenement) => {
      const details = evenement.target;
      if (details?.classList?.contains('ajout') && details.open) donnerLeFocus(details);
    },
    true,
  );
}

// LE SIGNE D'UN RATTACHEMENT : UNE CIBLE (30 août 2026, demande de Noé). Elle
// dit ce qu'on vise, là où les deux maillons d'un lien ne disaient que « c'est
// attaché à quelque chose ». Un projet sert un CAP — le mot du hub pour ce
// qu'on vise — et le dessin le dit maintenant.
export const ICONE_CIBLE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle>
  <circle cx="12" cy="12" r="1.5"></circle></svg>`;

// Ce qu'une pastille de choix multiple écrit : rien de choisi, elle dit le nom
// du champ ; un seul, elle dit LEQUEL — c'est l'information la plus utile ;
// plusieurs, elle les compte. Écrire trois titres d'objectifs dans une pastille
// ferait une phrase, pas une pastille.
export function libelleMultiple(choisis, options, libelle, mot) {
  if (!choisis.length) return libelle;
  if (choisis.length === 1) {
    const trouve = options.find(([cle]) => String(cle) === String(choisis[0]));
    return trouve ? trouve[1] : `1 ${mot}`;
  }
  return `${choisis.length} ${mot}s`;
}

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

  // LE CAS MULTIPLE a son propre chemin : on bascule une option, on laisse le
  // panneau ouvert, et le déclencheur recompte. Rien d'autre ne bouge — ni la
  // teinte, ni les autres options.
  if (groupe.hasAttribute('data-multiple')) {
    basculerUnChoixMultiple(groupe, bouton);
    return;
  }

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
    // Le point de couleur d'un régime survit au choix : il dit l'espace, pas la
    // valeur, et il était emporté par la réécriture.
    const marque = declencheur.querySelector('.pastille')
      ? '<span class="pastille" aria-hidden="true"></span>'
      : '';
    declencheur.innerHTML = `${marque}${echapper(bouton.textContent.trim())}`;
    declencheur.setAttribute('aria-expanded', 'false');

    // LA COULEUR SUIT LA VALEUR. Sans ça, changer une priorité laissait la
    // pastille dans la teinte de l'ancienne jusqu'au prochain rendu — et une
    // couleur qui ment est pire que pas de couleur. `marque` marque justement
    // le cas où la teinte ne dépend PAS de la valeur (les régimes d'une
    // période, teintés par leur espace) : celle-là ne bouge pas.
    const teinte = groupe.dataset.teinte;
    if (teinte && !marque) {
      // La valeur vide POSE l'attribut au lieu de le retirer quand le groupe
      // le demande (`data-teinte-vide`) : « Sans famille » a sa couleur à lui,
      // le gris neutre, et non l'accent de la page.
      const valeur = bouton.dataset.valeur;
      if (valeur || groupe.dataset.teinteVide) {
        declencheur.setAttribute(`data-${teinte}`, valeur ?? '');
      } else {
        declencheur.removeAttribute(`data-${teinte}`);
      }
    }

    // Le nom accessible porte le libellé du champ ET sa valeur : il remplace le
    // titre qui s'écrivait au-dessus de la pastille, il doit donc suivre.
    const libelle = groupe.dataset.libelle;
    if (libelle) {
      const nom = `${libelle} : ${bouton.textContent.trim()}`;
      declencheur.setAttribute('title', nom);
      declencheur.setAttribute('aria-label', nom);
    }
  }
  groupe.querySelector('.choix-panneau').hidden = true;

  // CHANGER D'ESPACE REFILTRE CE QUI S'Y RATTACHE. C'est le seul champ d'un
  // formulaire qui en commande un autre, d'où ce branchement nommé plutôt qu'un
  // mécanisme général : un formulaire n'a pas de dépendances, il en a UNE.
  if (groupe.dataset.choixChamp === 'espace') {
    const formulaire = groupe.closest('form');
    if (formulaire) filtrerParEspace(formulaire, bouton.dataset.valeur);
  }
}

// LE FILTRE REJOUÉ QUAND L'ESPACE CHANGE (30 août 2026). Un projet du club ne
// sert pas un cap de la formation : changer la pastille d'espace masque les
// options des autres, ET DÉCOCHE celles qui viennent d'en sortir — un lien
// coché qu'on ne voit plus s'enregistrerait sans que personne l'ait voulu.
// C'est la règle de la tuile de capture, où « un projet devenu incohérent
// s'efface ».
function filtrerParEspace(formulaire, espace) {
  for (const groupe of formulaire.querySelectorAll('[data-multiple]')) {
    let aChange = false;
    let visibles = 0;

    for (const ligne of groupe.querySelectorAll('li[data-espace-cible]')) {
      const dedans = !espace || ligne.dataset.espaceCible === espace;
      ligne.hidden = !dedans;
      if (dedans) visibles += 1;

      const option = ligne.querySelector('[data-choix]');
      if (!dedans && option?.classList.contains('actif')) {
        option.classList.remove('actif');
        option.setAttribute('aria-pressed', 'false');
        aChange = true;
      }
    }

    // Une ligne le dit quand il n'y a rien : un menu vide se lit comme une
    // panne.
    const rien = groupe.querySelector('.choix-rien');
    if (rien) rien.hidden = visibles > 0;

    if (aChange) recompterUnChoixMultiple(groupe);
  }
}

// Ce que le déclencheur affiche, relu depuis le panneau — la seule source qui
// ne peut pas se désynchroniser de ce qui est coché.
function recompterUnChoixMultiple(groupe) {
  const choisis = [...groupe.querySelectorAll('[data-choix].actif')].map(
    (option) => option.dataset.valeur,
  );
  groupe.querySelector('input[type="hidden"]').value = choisis.join(',');

  const options = [...groupe.querySelectorAll('[data-choix]')].map((option) => [
    option.dataset.valeur,
    option.textContent.trim(),
  ]);
  const declencheur = groupe.querySelector('[data-ouvrir-choix]');
  declencheur.lastElementChild.textContent = libelleMultiple(
    choisis,
    options,
    groupe.dataset.libelle ?? '',
    groupe.dataset.mot ?? 'élément',
  );
  declencheur.classList.toggle('choix-vide', !choisis.length);
}

function basculerUnChoixMultiple(groupe, bouton) {
  const actif = !bouton.classList.contains('actif');
  bouton.classList.toggle('actif', actif);
  bouton.setAttribute('aria-pressed', String(actif));

  recompterUnChoixMultiple(groupe);
}

// Ouvrir un menu ferme les autres : deux panneaux ouverts se recouvriraient.
export function basculerChoixDeFormulaire(declencheur, section) {
  const groupe = declencheur.closest('[data-choix-champ]');
  const panneau = groupe.querySelector('.choix-panneau');
  const ouvert = !panneau.hidden;

  fermerLesChoix(section);
  panneau.hidden = ouvert;
  declencheur.setAttribute('aria-expanded', String(!ouvert));
  if (!ouvert) placerLePanneau(declencheur, panneau);
}

// LE PANNEAU SE RETOURNE PLUTÔT QUE DE SE FAIRE COUPER (30 août 2026). Depuis
// que les choix se rangent en fin de formulaire, le dernier d'entre eux tombe
// juste au-dessus du bouton d'envoi : son panneau s'ouvrait dans le bord de la
// tuile, qui défile — donc le découpait. Mesuré sur « Déclarer une période » :
// la troisième option restait invisible.
//
// On mesure APRÈS avoir montré le panneau — un élément caché n'a pas de boîte —
// et on regarde le cadre qui le découpe, la tuile volante ou la fenêtre, à
// défaut l'écran.
function placerLePanneau(declencheur, panneau) {
  panneau.classList.remove('choix-panneau-haut', 'choix-panneau-droite');

  const cadre = declencheur.closest('.ajout-tuile, .fenetre');
  const bord = cadre
    ? cadre.getBoundingClientRect()
    : { bottom: window.innerHeight, right: window.innerWidth };
  const boite = panneau.getBoundingClientRect();

  // Huit pixels de garde : un panneau qui affleure le bord a l'air coupé même
  // quand il ne l'est pas.
  if (boite.bottom > bord.bottom - 8) panneau.classList.add('choix-panneau-haut');
  if (boite.right > bord.right - 8) panneau.classList.add('choix-panneau-droite');
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

// D'où vient la couleur d'une pastille de choix (30 août 2026). Elle se DÉDUIT
// des options, elle ne se déclare pas : les dix-sept formulaires du hub n'ont
// pas à apprendre un réglage de plus, et un champ qui offre les espaces se
// reconnaît à ses clés. Trois vocabulaires, ceux que le hub emploie déjà.
//
// Une valeur vide ne pose rien : « Sans famille » n'a pas de couleur, et une
// pastille teintée dirait qu'un choix a été fait.
const CLES_ESPACES = new Set(['fch', 'formation', 'photo', 'perso']);
const CLES_FAMILLES = new Set(['corps', 'calme', 'lien', 'intendance']);

function teinteDuChoix(champ, options) {
  if (champ.marqueEspace) return { nom: 'espace', fixe: champ.marqueEspace };

  const cles = options.map(([cle]) => String(cle)).filter(Boolean);
  const toutes = (ensemble) => cles.length > 0 && cles.every((cle) => ensemble.has(cle));

  if (toutes(CLES_ESPACES)) return { nom: 'espace' };
  if (champ.nom === 'priorite') return { nom: 'priorite' };
  // LA CADENCE D'UNE HABITUDE, en nuances de bleu (30 août 2026, demande de
  // Noé) : la pastille pâlit à une fois par semaine et se sature à sept. La
  // couleur dit donc l'exigence de l'habitude avant même qu'on lise le chiffre.
  if (champ.nom === 'cadence') return { nom: 'cadence' };
  // `vide: true` : la famille pose son attribut MÊME sans valeur. « Sans
  // famille » a besoin d'un accroche-CSS à lui — c'est le seul moyen de lui
  // donner le gris neutre plutôt que l'accent de la page, qui le faisait
  // ressembler à un choix fait.
  if (toutes(CLES_FAMILLES)) return { nom: 'famille', vide: true };
  return null;
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
  // L'espace choisi dans CE formulaire, s'il en a un. Il filtre les options des
  // champs qui s'y rattachent — voir `choix-multiple`.
  const espaceActif = champs.find((champ) => champ.nom === 'espace')?.valeur ?? null;

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
    // ET C'EST UNE PASTILLE, PLUS UN CHAMP (30 août 2026, demande de Noé :
    // « les menus déroulants doivent être des pastilles de manière à être
    // différentes de l'espace qui note du texte, et elles doivent toutes être
    // côte à côte s'il y en a plusieurs sur la tuile »). Le déclencheur avait
    // jusqu'ici l'allure des autres champs — même hauteur, même cadre, même
    // rayon — au motif que « dans un formulaire, un choix est un champ comme un
    // autre ». C'est ce motif qui est renversé : on n'ÉCRIT pas dans un choix,
    // on y prend. Deux gestes différents ne portent pas la même forme.
    //
    // Le regroupement se fait plus bas (`rendreLigne` les met de côté), et la
    // pastille elle-même est habillée par le CSS.
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

      // LE LIBELLÉ NE S'ÉCRIT PLUS AU-DESSUS (30 août 2026, demande de Noé :
      // « sans leur titre »). C'est le geste qu'il avait déjà fait sur la ligne
      // d'une habitude — « le texte n'est pas nécessaire une fois que je sais à
      // quoi les chiffres correspondent » —, et la parade est la même : le sens
      // n'est pas perdu, il est DÉPLACÉ. `title` le donne au survol,
      // `aria-label` au lecteur d'écran, qui lui ne sait pas de quoi « Normal »
      // est la valeur.
      const nomComplet = `${champ.libelle} : ${choisi?.[1] ?? 'à choisir'}`;

      // LE POINT DE COULEUR, quand plusieurs pastilles d'un même formulaire
      // partagent leurs options : les trois régimes d'une période disent tous
      // « Normal » et, sans titre au-dessus d'eux, ne se distinguaient plus.
      // C'est la couleur de l'espace qui les sépare — la même que sa pastille
      // partout ailleurs —, et non un mot revenu par la fenêtre. Noé a tranché
      // en le voyant : « t'as rajouté le rond de couleur, donc on peut enlever
      // le titre aussi ».
      const marque = champ.marqueEspace
        ? '<span class="pastille" aria-hidden="true"></span>'
        : '';

      // ET LA PASTILLE PORTE UNE COULEUR (demande de Noé : « avec des
      // couleurs »). Pas une teinte décorative : celle que le hub emploie déjà
      // pour cette valeur-là — la couleur de l'espace, celle de la priorité,
      // celle de la famille. Une pastille sans vocabulaire connu garde
      // l'accent. La couleur se pose par un attribut, comme partout ailleurs,
      // et le CSS fait le reste.
      const teinte = teinteDuChoix(champ, options);
      const valeurTeintee = teinte?.fixe ?? String(valeur);
      const attribut =
        teinte && (valeurTeintee || teinte.vide)
          ? `data-${teinte.nom}="${echapper(valeurTeintee)}"`
          : '';

      return `<span class="choix-champ" data-choix-champ="${champ.nom}"
        ${teinte && !teinte.fixe ? `data-teinte="${teinte.nom}"` : ''}
        ${teinte?.vide ? 'data-teinte-vide' : ''}
        data-libelle="${echapper(champ.libelle ?? '')}">
        <input type="hidden" name="${champ.nom}" value="${echapper(valeur)}">
        <button type="button" id="${idChamp}" class="choix-declencheur" data-ouvrir-choix
          aria-expanded="false" aria-haspopup="listbox"
          ${attribut}
          title="${echapper(nomComplet)}" aria-label="${echapper(nomComplet)}"
          >${marque}${echapper(choisi?.[1] ?? 'Choisir')}</button>
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

    // UNE DATE EST UNE PASTILLE, elle aussi (30 août 2026, demande de Noé :
    // « la date sur ces tuiles peut se mettre à la suite des pastilles, sous
    // la forme d'une pastille aussi »). Elle porte le logo du calendrier, et
    // dit « Échéance » ou « Du » tant qu'elle est vide — le nom du champ —,
    // puis la date choisie.
    //
    // Le champ natif reste, invisible, PAR-DESSUS la pastille : c'est lui qu'on
    // touche. Le navigateur ouvre donc son sélecteur tout seul, la validation
    // d'un champ requis peut l'atteindre, et `FormData` le lit comme avant.
    if (champ.type === 'date') {
      // LE MOT SEUL, PAS SON EXPLICATION. « Jusqu'au (vide = un seul jour) »
      // était un bon libellé au-dessus d'un champ ; dans une pastille, il tient
      // une ligne à lui tout seul. La parenthèse est une explication, pas un
      // nom : elle part vers le `title`, où elle ne coûte rien. Fait ici, une
      // fois, plutôt que dans les huit formulaires qui écrivent une date.
      const court = champ.libelle.replace(/\s*\([^)]*\)\s*$/, '');
      const texte = dateDePastille(champ.valeur, court);
      const nom = champ.valeur ? `${champ.libelle} : ${texte}` : champ.libelle;

      return `<span class="choix-champ pastille-date" data-libelle="${echapper(court)}">
        <span class="choix-declencheur${champ.valeur ? '' : ' choix-vide'}"
          title="${echapper(nom)}">${ICONE_DATE}<span>${echapper(texte)}</span></span>
        <input id="${idChamp}" name="${champ.nom}" type="date" ${requis}
          aria-label="${echapper(champ.libelle)}"
          value="${echapper(champ.valeur ?? '')}">
      </span>`;
    }

    // UN CHOIX MULTIPLE : la même pastille, mais on en coche plusieurs et le
    // panneau NE SE REFERME PAS (30 août 2026 — rattacher un projet à ses
    // objectifs). Un menu qui se referme à chaque option obligerait à le
    // rouvrir autant de fois qu'on veut de liens.
    //
    // La valeur voyage en une chaîne d'identifiants séparés par des virgules :
    // `FormData` ne sait pas transporter un tableau, et l'appelant n'a pas à
    // savoir comment la pastille s'y est prise.
    if (champ.type === 'choix-multiple') {
      const options = Object.entries(champ.options ?? {});
      const mot = champ.mot ?? 'élément';
      // LES OPTIONS D'UN AUTRE ESPACE NE S'AFFICHENT PAS (30 août 2026, demande
      // de Noé) : un projet du club ne sert pas un cap de la formation. Le
      // filtre se pose ici pour le premier rendu, et `filtrerParEspace` le
      // rejoue à chaque fois que la pastille d'espace change.
      const horsEspace = (cle) =>
        champ.espaces && espaceActif && champ.espaces[cle] !== espaceActif;
      // Ce qui est coché mais hors de l'espace ne compte plus : la valeur doit
      // dire ce que l'écran montre, sinon on enregistre un lien invisible.
      const choisis = (champ.valeur ?? []).map(String).filter((cle) => !horsEspace(cle));

      return `<span class="choix-champ" data-choix-champ="${champ.nom}" data-multiple
        data-libelle="${echapper(champ.libelle)}" data-mot="${echapper(mot)}">
        <input type="hidden" name="${champ.nom}" value="${echapper(choisis.join(','))}">
        <button type="button" id="${idChamp}" class="choix-declencheur${
          choisis.length ? '' : ' choix-vide'
        }" data-ouvrir-choix aria-expanded="false" aria-haspopup="listbox"
          title="${echapper(champ.libelle)}"
          >${ICONE_CIBLE}<span>${echapper(
            libelleMultiple(choisis, options, champ.libelle, mot),
          )}</span></button>
        <div class="choix-panneau" hidden>
          <ul class="choix-capture">
            ${options
              .map(([cle, texte]) => {
                const actif = choisis.includes(String(cle));
                return `<li${horsEspace(cle) ? ' hidden' : ''}
                  ${champ.espaces?.[cle] ? `data-espace-cible="${echapper(champ.espaces[cle])}"` : ''}
                  ><button type="button" data-choix="${champ.nom}"
                  data-valeur="${echapper(String(cle))}"
                  class="${actif ? 'actif' : ''}" aria-pressed="${actif}"
                  ${champ.espaces?.[cle] ? `data-espace="${echapper(champ.espaces[cle])}"` : ''}
                  >${
                    champ.espaces?.[cle]
                      ? '<span class="choix-pastille" aria-hidden="true"></span>'
                      : ''
                  }<span>${echapper(texte)}</span></button></li>`;
              })
              .join('')}
            <li class="choix-rien" hidden>Aucun dans cet espace</li>
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

  // TOUS LES CHOIX DANS UNE SEULE RANGÉE, EN TÊTE DE FORMULAIRE (30 août 2026,
  // demande de Noé). Il faut les sortir du fil plutôt que de les habiller sur
  // place : « côte à côte » ne se fait pas si chacun reste coincé entre deux
  // champs de texte pleine largeur.
  //
  // EN TÊTE et non en pied — la rangée a passé une heure en bas, par analogie
  // avec la tuile de capture où l'on écrit d'abord et où l'on règle ensuite.
  // Noé a tranché l'inverse, et c'est cohérent avec ce que les formulaires
  // faisaient déjà : « Espace » ouvrait le formulaire d'objectif, « Où il en
  // est » celui d'un livre. Ce qui CADRE se pose avant ce qu'on écrit.
  //
  // AUCUNE ÉTIQUETTE AU-DESSUS D'ELLES (30 août 2026, demande de Noé : « sans
  // leur titre ») : ce sont des pastilles, et une pastille se lit par sa
  // valeur. Le libellé vit dans le `title` et le nom accessible de chacune.
  //
  // Le cas qui reste à surveiller : les trois régimes d'une période disent tous
  // « Normal » et ne se distinguent plus qu'au survol. Si ça gêne à l'usage,
  // c'est le libellé des OPTIONS qu'il faudra revoir, pas remettre les titres.
  //
  // LES DATES SUIVENT LES CHOIX dans la même rangée (30 août 2026, demande de
  // Noé : « à la suite des pastilles »). Elles se règlent, elles ne s'écrivent
  // pas : elles sont de la même nature que les choix, et leur champ natif
  // pleine largeur cassait la bande en deux.
  const estChoix = (champ) => champ.type === 'choix' || champ.type === 'choix-multiple';
  const estPastille = (champ) => estChoix(champ) || champ.type === 'date';
  const choix = champs.filter(estChoix);
  const dates = champs.filter((champ) => champ.type === 'date');

  // LE TEXTE PRINCIPAL N'A NI ÉTIQUETTE NI CADRE (30 août 2026, demande de Noé,
  // la tuile de capture en main) : « un texte en gris qui décrit ce qu'il y a à
  // écrire, qui se remplace dès qu'on commence à noter ». C'est le
  // « Nom de la tâche » de la capture, et c'est la première chose qu'on voit
  // d'une tuile d'ajout — l'encadrer, c'est en faire un champ parmi six.
  //
  // C'est le PREMIER champ de texte EXIGÉ qui joue ce rôle : le titre d'un
  // objectif, le nom d'un projet, celui d'une période. Un formulaire qui n'en
  // a pas garde tous ses champs étiquetés — mieux vaut pas de vedette qu'une
  // vedette choisie au hasard.
  const principal = champs.find((champ) => champ.type === 'text' && champ.requis);
  const autres = champs.filter((champ) => !estPastille(champ) && champ !== principal);

  const rangeeDeChoix = choix.length || dates.length
    ? `<div class="formulaire-choix">${[...choix, ...dates].map(rendreChamp).join('')}</div>`
    : '';

  // L'ORDRE, ARRÊTÉ APRÈS TROIS ESSAIS (30 août 2026) : le TEXTE, puis les
  // pastilles, puis les détails. C'est celui de la tuile de capture, et Noé y
  // revient en le précisant : « les pastilles en dessous du titre, mais avec un
  // espace un peu plus important pour que le texte soit un peu isolé, et
  // qu'ensuite il y ait tous les détails ».
  //
  // C'est l'ISOLEMENT qui fait tenir cet ordre — un blanc plus large sous le
  // texte. Sans lui, la vedette se noyait dans la rangée qui la suivait, et
  // c'est ce qui avait fait remonter les pastilles au-dessus d'elle.
  //
  // *Les deux ordres essayés avant, pour ne pas les refaire :* la rangée en
  // pied (après tous les champs), puis la rangée en tête (avant le texte).
  const champPrincipal = principal
    ? `<input class="champ-titre" id="${id}-${principal.nom}" name="${principal.nom}"
         type="text" required
         placeholder="${echapper(principal.libelle)}"
         aria-label="${echapper(principal.libelle)}"
         value="${echapper(principal.valeur ?? '')}">`
    : '';

  const corps = `
    <form data-action="${action}">
      ${extra}
      ${champPrincipal}
      ${rangeeDeChoix}
      ${autres.map(rendreLigne).join('')}
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

// `construireHabitudesDuJour` a QUITTÉ ce fichier le 30 août 2026. Il y vivait
// parce que l'accueil et le tableau de bord perso le partageaient — « deux
// écrans qui montreraient les mêmes habitudes de deux façons finiraient par se
// contredire ». Les habitudes ont quitté l'accueil le soir même : le gabarit
// n'a plus qu'un appelant, et n'a donc plus rien à faire parmi les morceaux que
// tout le monde emprunte. Il vit dans js/perso.js, sous le nom
// `construireHabitudesDuJour`.
