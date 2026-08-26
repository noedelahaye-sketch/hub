// Le calendrier — tout ce qui porte une date, assemblé en une seule liste, puis
// dessiné de trois façons : en mois, en semaine, ou en agenda.
//
// Deux consommateurs : l'espace Calendrier du hub (tous projets) et l'écran
// Calendrier du site Yuno (projet photo seul). Même assemblage, même rendu,
// mêmes filtres — seules les données passées changent.
//
// Les fonctions ne font que fabriquer du HTML à partir de données déjà
// chargées, comme partout dans le hub. Seul `brancherSelection` touche au DOM,
// et il ne fait que poser des écouteurs.

import * as api from './api.js';
import { modifierAussitot } from './ecriture.js';
import {
  construireFormulaire,
  construireFenetre,
  poserLeChoix,
  basculerChoixDeFormulaire,
  fermerLesChoix,
  champDuree,
  marquerLaDuree,
} from './espace-projet.js';
import {
  depuisDateISO,
  versDateISO,
  ajouterJours,
  momentLisible,
  echeanceLisible,
  echapper,
  NOMS_PROJETS,
  RECURRENCES,
  decalerOccurrence,
  DUREES,
  dureeLisible,
  occurrencesEntre,
} from './format.js';

// Réexporté pour les espaces : refermer le menu d'une pastille d'état est le
// seul geste qu'ils empruntent aux formulaires, et ils n'importent que ce
// fichier-ci.
export { fermerLesChoix };

export const RESEAUX = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
};
// « Post et carrousel, c'est la même chose pour moi » (Noé, 15 août 2026), et
// c'est CARROUSEL qui reste : une image ou sept, c'est le même geste et la
// même préparation. Le format `post` reste ACCEPTÉ par la base — un CHECK
// s'élargit, il ne se resserre jamais — mais il n'est plus offert, et les
// publications qui le portaient sont passées en `carrousel`
// (migration 20260815100000).
export const FORMATS = { carrousel: 'Carrousel', reel: 'Réel', story: 'Story' };

// --- Le cycle éditorial ------------------------------------------------------
//
// Il vit ICI, avec les réseaux et les formats, pour la même raison qu'eux : la
// tuile du calendrier en a besoin, `publications.js` aussi — et c'est lui qui
// importe ce fichier, jamais l'inverse. Une constante posée là-bas et lue
// ici croiserait les deux imports.
//
// Le cycle n'est pas le même partout. Yuno pose cinq étapes (une idée peut
// mériter du travail avant d'être écrite) ; le FC HERMITAGE en a TROIS depuis
// le 25 août 2026 (demande de Noé) : à préparer, à programmer, publié.
//
// Ces trois-là réutilisent des valeurs que la base connaît déjà — `idee`,
// `pret`, `publie` — plutôt que d'en inventer : le CHECK de la colonne les
// accepte, aucune migration de schéma n'est nécessaire, et ce sont les mots
// affichés qui changent. `brouillon` sort du cycle du club ; la seule ligne
// qui le portait est passée en `idee` (migration 20260825090000).
export const CYCLES_PUBLICATION = {
  photo: ['idee', 'a_developper', 'brouillon', 'pret', 'publie'],
  fch: ['idee', 'pret', 'publie'],
  formation: ['idee', 'brouillon', 'pret', 'publie'],
};

const NOMS_STATUTS_BASE = {
  idee: 'idée',
  a_developper: 'à développer',
  brouillon: 'brouillon',
  pret: 'prêt',
  publie: 'publié',
};

// Le club dit les mêmes valeurs avec ses mots : « prêt » ne disait pas ce qui
// restait à faire — le programmer.
const NOMS_STATUTS_PAR_PROJET = {
  fch: { idee: 'à préparer', pret: 'à programmer', publie: 'publié' },
};

export const cyclePublication = (projet) =>
  CYCLES_PUBLICATION[projet] ?? CYCLES_PUBLICATION.formation;

export const nomDuStatut = (projet, statut) =>
  NOMS_STATUTS_PAR_PROJET[projet]?.[statut] ?? NOMS_STATUTS_BASE[statut] ?? statut;

export { NOMS_STATUTS_BASE };

// --- Faire partir une publication --------------------------------------------
//
// Ce qu'un changement d'état écrit, en un seul endroit. Quatre écrans font
// avancer une publication — la grille de l'accueil, celle de l'espace
// Calendrier, la banque de Yuno, la chaîne éditoriale du club — et la règle
// qui suit ne peut pas vivre en quatre copies.
//
// LA RÈGLE (26 août 2026) : une publication RÉCURRENTE ne se termine pas. Elle
// n'a qu'un `statut`, et le poser à « publié » marquerait toute la série pour
// toujours — « Le portrait du lundi » serait publié à jamais après un seul
// lundi. La faire partir avance donc sa date d'une occurrence et la ramène au
// PREMIER état de son cycle : la rubrique suivante attend déjà sur son jour,
// à préparer. C'est mot pour mot ce que fait une tâche répétée qu'on coche
// (`terminerTache`, js/api.js).
//
// Passé la fin déclarée, la série s'arrête et la publication se termine pour
// de bon — sinon elle reviendrait après sa propre échéance. Et rien ne compte
// les parutions manquées : c'est la règle du hub partout ailleurs.
//
// Renvoie les champs à écrire, pas une promesse : les écrans écrivent tout de
// suite à l'écran et envoient derrière (js/ecriture.js), il leur faut l'objet.
export function passageDePublication(pub, statut) {
  if (statut !== 'publie' || !pub.recurrence || !pub.date_prevue) return { statut };

  const suite = prochaineParution(pub);
  if (!suite) return { statut };

  return { statut: cyclePublication(pub.projet ?? 'photo')[0], date_prevue: suite };
}

// La parution suivante d'une série, ou `null` quand elle est finie. Le sens
// négatif ramène à celle d'avant : c'est ce qui permet à un écran d'annuler
// un départ, comme une coche de tâche s'annule.
export function prochaineParution(pub, sens = 1) {
  if (!pub.recurrence || !pub.date_prevue) return null;

  const suite = decalerOccurrence(depuisDateISO(pub.date_prevue), pub.recurrence, sens);
  if (sens > 0 && pub.recurrence_fin && suite > depuisDateISO(pub.recurrence_fin)) return null;
  return versDateISO(suite);
}

// --- Le geste, branché une seule fois ----------------------------------------
//
// Faire avancer l'état d'une publication depuis un calendrier, c'est LE MÊME
// geste sur le hub, sur le site Yuno et sur celui du FC Hermitage, en vue
// semaine comme en vue mois (demande de Noé, 27 août 2026). Il est donc écrit
// ici, une fois, et les quatre écrans l'empruntent.
//
// Avant, seul le hub le branchait. Sur les deux sites, le rond était DESSINÉ
// par la barre commune — `signeEnHtml` ne demande à personne s'il sera
// écouté — mais n'écoutait rien : l'appui traversait jusqu'à la barre et
// ouvrait la tuile. Un bouton mort, et qui avait l'air vivant.
//
// EN PHASE DE CAPTURE, et c'est la condition pour que ça tienne : le rond vit
// DANS la barre, qui porte `data-element` et ouvre le détail. En bulle, lequel
// des deux gagne dépend de qui a posé son écouteur en premier — quatre espaces,
// quatre occasions de se tromper, et c'est exactement l'erreur qui a laissé le
// rond inerte dans l'espace Calendrier du hub pendant deux jours. En capture,
// celui-ci passe d'abord partout, et `stopPropagation` garde le clic pour lui.
//
// Ce qu'attend l'appelant :
// — `publications()` : la liste VIVANTE de l'espace (celle que le rendu relit).
// — `rendre()` : appelé après le changement, et de nouveau si le serveur refuse.
// — `ouverte()` : la publication affichée dans la tuile de détail, ou rien.
//   C'est elle que règle la pastille d'état ; le rond, lui, se retrouve par son
//   identifiant.
// — `bloque(pub)` : facultatif — un espace qui pose des lignes provisoires y
//   refuse le geste tant que le serveur ne connaît pas la ligne.
export function brancherEtatPublication(
  section,
  { publications, rendre, ouverte = () => null, echouer, bloque = () => false },
) {
  // Un identifiant y reste le temps de l'aller-retour : un second appui ne doit
  // pas envoyer un ordre contraire par-dessus le premier.
  const enVol = new Set();

  const poser = async (pub, statut) => {
    if (!pub || !statut || pub.statut === statut) return;
    if (enVol.has(pub.id) || bloque(pub)) return;

    // Une publication récurrente ne se termine pas : la faire partir avance sa
    // date d'une occurrence et la ramène au premier état de son cycle.
    const champs = passageDePublication(pub, statut);

    enVol.add(pub.id);
    try {
      await modifierAussitot(pub, champs, () => api.modifierPublication(pub.id, champs), {
        rendre,
        echouer,
      });
    } finally {
      enVol.delete(pub.id);
    }
  };

  section.addEventListener(
    'click',
    async (evenement) => {
      // Le rond de la barre : il avance d'un cran, sans ouvrir la tuile.
      const rond = evenement.target.closest('[data-avancer-pub]');
      if (rond) {
        evenement.stopPropagation();
        const pub = publications().find(
          (candidate) => candidate.id === rond.dataset.avancerPub,
        );
        const cycle = pub ? cyclePublication(pub.projet) : [];
        await poser(pub, pub ? cycle[cycle.indexOf(pub.statut) + 1] : null);
        return;
      }

      // La pastille d'état de la tuile : elle sait sauter un cran et revenir en
      // arrière, ce que le rond ne fait pas. Le menu se referme dans tous les
      // cas — même sur l'état déjà posé : un menu qui reste ouvert après un
      // choix donne l'impression que le geste n'a pas été reçu. La tuile, elle,
      // reste ouverte : on vient souvent corriger deux choses de suite.
      const choix = evenement.target.closest('[data-statut-pub]');
      if (choix) {
        evenement.stopPropagation();
        fermerLesChoix(section);
        await poser(ouverte(), choix.dataset.statutPub);
      }
    },
    true,
  );
}

// Les types d'éléments datés.
const TYPES = {
  evenement: 'Événement',
  tache: 'Tâche',
  publication: 'Publication',
  objectif: 'Objectif',
  jalon: 'Jalon',
  commande: 'Commande',
  relance: 'Relance',
};

// Les natures, c'est-à-dire ce qui se coche dans les filtres. Un jalon daté est
// une étape d'objectif, pas une espèce à part ; une commande à livrer et une
// relance promise sont deux façons de tenir un engagement envers quelqu'un.
export const NATURES = {
  evenement: 'Événements',
  tache: 'Tâches',
  publication: 'Publications',
  objectif: 'Objectifs',
  relance: 'Relances/Commandes',
};

export function natureDe(element) {
  if (element.type === 'jalon') return 'objectif';
  if (element.type === 'commande') return 'relance';
  return element.type;
}

export function toutesLesNatures() {
  return new Set(Object.keys(NATURES));
}

// --- La récurrence -----------------------------------------------------------
// Les occurrences ne sont pas stockées : une ligne en base, autant de dates que
// le calendrier en montre. C'est ce qui permet de changer l'heure d'un
// entraînement hebdomadaire d'un seul geste.

// Les mots de la répétition viennent de `format.js`, où ils voisinent avec
// l'arithmétique des dates. Réexportés d'ici : plusieurs écrans les demandaient
// à ce module avant qu'ils ne déménagent.
export { RECURRENCES };

// Les durées voyagent de la même façon, et pour la même raison : la tuile les
// offre, l'espace Tâches aussi, et aucun des deux ne doit aller les chercher
// dans l'autre.
export { DUREES, dureeLisible };

// La fenêtre d'expansion est large mais bornée : un an en arrière, trois ans
// devant. Les dates elles-mêmes se calculent dans `format.js` — événements et
// tâches se répètent de la même façon, et ce serait deux fois le même pas.
function fenetreDExpansion() {
  const aujourdhui = new Date();
  return {
    plancher: ajouterJours(aujourdhui, -365),
    plafond: ajouterJours(aujourdhui, 365 * 3),
  };
}

function occurrencesDe(evenement) {
  const { plancher, plafond } = fenetreDExpansion();
  return occurrencesEntre(
    new Date(evenement.date_debut),
    evenement.recurrence,
    evenement.recurrence_fin,
    plancher,
    plafond,
  );
}

// Une tâche se déplie à partir de son ÉCHÉANCE, qui est toujours l'occurrence
// courante : cocher une tâche récurrente la fait glisser à la suivante (voir
// `terminerTache`). Le calendrier ne montre donc jamais une occurrence passée
// d'une série — elle n'existe plus, elle a été franchie.
function occurrencesDeLaTache(tache) {
  const ancre = tache.heure
    ? new Date(`${tache.echeance}T${tache.heure}`)
    : depuisDateISO(tache.echeance);

  const { plancher, plafond } = fenetreDExpansion();
  return occurrencesEntre(ancre, tache.recurrence, tache.recurrence_fin, plancher, plafond);
}

// Une publication se déplie comme une tâche, et pour la même raison : sa
// `date_prevue` est toujours l'occurrence COURANTE — la faire partir l'avance
// d'un cran (voir `passageDePublication`). Le calendrier ne montre donc jamais
// une parution passée d'une série : elle a été franchie.
function occurrencesDeLaPublication(pub) {
  const ancre = pub.heure
    ? new Date(`${pub.date_prevue}T${pub.heure}`)
    : depuisDateISO(pub.date_prevue);

  const { plancher, plafond } = fenetreDExpansion();
  return occurrencesEntre(ancre, pub.recurrence, pub.recurrence_fin, plancher, plafond);
}

// --- Assemblage --------------------------------------------------------------

export function assemblerCalendrier({
  evenements = [],
  taches = [],
  objectifs = [],
  publications = [],
  commandes = [],
  relances = [],
}) {
  const elements = [];

  for (const evenement of evenements) {
    const origine = new Date(evenement.date_debut);
    // La durée est portée par la série, pas par chaque occurrence : on la
    // mesure une fois et on la reporte.
    const duree = evenement.date_fin ? new Date(evenement.date_fin) - origine : null;

    for (const date of occurrencesDe(evenement)) {
      elements.push({
        id: evenement.id,
        type: 'evenement',
        source: evenement,
        date,
        recurrent: Boolean(evenement.recurrence),
        // Le dernier jour occupé, s'il y en a plusieurs. L'agenda n'en fait
        // rien — il dirait trois fois la même chose ; la grille s'en sert pour
        // tirer une barre continue sur toute la durée.
        jusqua: duree === null ? null : versDateISO(new Date(date.getTime() + duree)),
        projet: evenement.projet,
        titre: evenement.titre,
        detail: evenement.lieu,
        notes: evenement.notes,
        quand: momentLisible(date),
      });
    }
  }

  for (const tache of taches) {
    for (const date of occurrencesDeLaTache(tache)) {
      elements.push({
        id: tache.id,
        type: 'tache',
        source: tache,
        // Avec une heure, la barre du calendrier l'écrit devant le titre ; sans,
        // elle ne dit que le jour. C'est `heureDe` qui tranche, et il ne regarde
        // que ça : minuit = pas d'heure.
        date,
        recurrent: Boolean(tache.recurrence),
        // Seule l'occurrence COURANTE porte l'état : les suivantes sont à
        // venir, et cocher se fait sur celle du jour. Sans ça, une série
        // cochée s'afficherait barrée jusqu'en 2029.
        faite: tache.statut === 'fait' && !tache.recurrence,
        projet: tache.projet,
        titre: tache.titre,
        detail: tache.statut === 'backlog' ? 'backlog' : null,
      });
    }
  }

  for (const objectif of objectifs) {
    if (objectif.echeance) {
      elements.push({
        id: objectif.id,
        type: 'objectif',
        source: objectif,
        date: depuisDateISO(objectif.echeance),
        projet: objectif.projet,
        titre: objectif.titre,
        detail: objectif.cible,
      });
    }
    for (const jalon of objectif.jalons ?? []) {
      if (jalon.echeance && !jalon.atteint) {
        elements.push({
          id: jalon.id,
          type: 'jalon',
          source: jalon,
          date: depuisDateISO(jalon.echeance),
          projet: objectif.projet,
          titre: jalon.titre,
          detail: objectif.titre,
        });
      }
    }
  }

  for (const pub of publications) {
    // Comme une tâche : avec une heure, elle l'affiche. L'heure de parution est
    // une décision éditoriale, pas un détail.
    for (const date of occurrencesDeLaPublication(pub)) {
      elements.push({
        id: pub.id,
        type: 'publication',
        source: pub,
        date,
        recurrent: Boolean(pub.recurrence),
        // Publiée = partie. Elle se barre comme une tâche faite, et pour la
        // même raison : ce qui a eu lieu reste à sa place dans la semaine.
        //
        // Une série, elle, ne se barre jamais : seule l'occurrence courante
        // porte l'état, les suivantes sont à venir. Sans cette réserve, une
        // rubrique hebdomadaire qui vient de partir s'afficherait barrée
        // jusqu'en 2029 — c'est la règle de la tâche récurrente, mot pour mot.
        faite: pub.statut === 'publie' && !pub.recurrence,
        // L'état n'est PAS écrit ici : la tuile le montre en toutes lettres
        // avec ses trois pastilles, et lui, il se relit à la source à chaque
        // rendu. Recopié dans cette ligne, il serait vrai à l'assemblage et
        // faux dès le premier appui.
        projet: pub.projet ?? 'photo',
        titre: pub.titre,
        detail: `${RESEAUX[pub.reseau] ?? pub.reseau} · ${FORMATS[pub.format] ?? pub.format}`,
      });
    }
  }

  for (const commande of commandes) {
    elements.push({
      id: commande.id,
      type: 'commande',
      source: commande,
      date: depuisDateISO(commande.echeance),
      projet: 'photo',
      titre: commande.titre,
      detail: commande.client ? `à livrer à ${commande.client}` : 'à livrer',
    });
  }

  for (const contact of relances) {
    elements.push({
      id: contact.id,
      type: 'relance',
      source: contact,
      date: depuisDateISO(contact.prochaine_action_date),
      projet: 'photo',
      titre: contact.prochaine_action || `Reprendre contact avec ${contact.nom}`,
      detail: contact.nom,
    });
  }

  return elements.sort((a, b) => a.date - b.date);
}

// --- L'onglet du calendrier ---------------------------------------------------
// Le calendrier n'est pas un lieu comme les autres : c'est l'outil qui regarde
// tous les autres. Dans les trois barres il porte donc une icône plutôt qu'un
// mot, et il se tient à part, en bout de rangée. Décision de Noé, 13 août 2026.
//
// Un dessin et non un émoji — le hub n'écrit qu'en × ↗ ‹ ›, et un émoji
// arriverait avec sa couleur et sa police à lui. `currentColor` le laisse
// suivre l'encre de l'onglet, actif comme au repos.

const ICONE_CALENDRIER = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
  <path d="M3 10h18M8 3v4M16 3v4"></path>
</svg>`;

// Le lien tout fait, pour les trois barres. Sans texte, l'onglet perdrait son
// nom : `aria-label` le lui rend, et `title` le montre au survol.
export function ongletCalendrier(adresse, actif) {
  return `
    <a href="${adresse}" class="nav-calendrier${actif ? ' actif' : ''}"
      data-nav="calendrier" title="Calendrier" aria-label="Calendrier"
      ${actif ? 'aria-current="page"' : ''}>${ICONE_CALENDRIER}</a>`;
}

// --- Les périodes ------------------------------------------------------------

export const VUES_CALENDRIER = { mois: 'Mois', semaine: 'Semaine', agenda: 'Agenda' };

const JOURS_COURTS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

export function debutDeLaSemaine(date) {
  const jour = new Date(date);
  jour.setHours(0, 0, 0, 0);
  // La semaine commence le lundi : getDay() rend 0 pour dimanche.
  jour.setDate(jour.getDate() - ((jour.getDay() + 6) % 7));
  return jour;
}

function suiteDeJours(debut, nombre) {
  return Array.from({ length: nombre }, (_, ecart) => {
    const jour = new Date(debut);
    jour.setDate(jour.getDate() + ecart);
    return jour;
  });
}

// La grille d'un mois va du lundi qui précède le 1er au dimanche qui suit le
// dernier jour : cinq ou six semaines pleines, jamais de case coupée.
export function grilleDuMois(ancre) {
  const premier = new Date(ancre.getFullYear(), ancre.getMonth(), 1);
  const dernier = new Date(ancre.getFullYear(), ancre.getMonth() + 1, 0);
  const debut = debutDeLaSemaine(premier);
  const fin = debutDeLaSemaine(dernier);
  fin.setDate(fin.getDate() + 6);

  return suiteDeJours(debut, Math.round((fin - debut) / 86400000) + 1);
}

export function grilleDeLaSemaine(ancre) {
  return suiteDeJours(debutDeLaSemaine(ancre), 7);
}

export function deplacerAncre(ancre, vue, sens) {
  const suite = new Date(ancre);
  if (vue === 'semaine') suite.setDate(suite.getDate() + 7 * sens);
  else suite.setMonth(suite.getMonth() + sens);
  return suite;
}

export function titreDePeriode(ancre, vue) {
  if (vue !== 'semaine') {
    return ancre.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  const jours = grilleDeLaSemaine(ancre);
  const [premier] = jours;
  const dernier = jours[6];
  const memeMois = premier.getMonth() === dernier.getMonth();

  return `${premier.getDate()}${
    memeMois ? '' : ` ${premier.toLocaleDateString('fr-FR', { month: 'short' })}`
  } – ${dernier.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

// --- Rendu commun ------------------------------------------------------------

export function centrerActif(conteneur, selecteur = '.actif') {
  const actif = conteneur?.querySelector(selecteur);
  if (!actif || conteneur.scrollWidth <= conteneur.clientWidth) return;
  conteneur.scrollLeft = actif.offsetLeft - (conteneur.clientWidth - actif.offsetWidth) / 2;
}

// Les filtres se cochent, ils ne s'excluent plus : voir les publications ET les
// tâches sans les objectifs était impossible avec des onglets.
//
// `offertes` : les seules natures à proposer, quand l'appelant n'assemble pas
// tout — le site FCH n'a ni relance ni commande, une case sans effet ne
// mérite pas sa place (demande de Noé, 21 août 2026). Absent = toutes.
export function construireFiltres(natures, { offertes = null } = {}) {
  return `
    <div class="cal-filtres" role="group" aria-label="Ce que le calendrier montre">
      ${Object.keys(NATURES)
        .filter((nature) => !offertes || offertes.includes(nature))
        .map(
          (nature) => `
        <label class="cal-coche ${natures.has(nature) ? 'actif' : ''}">
          <input type="checkbox" data-filtre-nature="${nature}"
            ${natures.has(nature) ? 'checked' : ''}>
          <span>${echapper(NATURES[nature])}</span>
        </label>`,
        )
        .join('')}
    </div>`;
}

// `vuesEnPlus` : des vues que SEUL l'appelant connaît, ajoutées en fin de
// sélecteur — même contrat que `naturesEnPlus` pour la tuile. Le site Yuno s'en
// sert pour son week-end (les rencontres qu'il pourrait couvrir), qui n'a rien
// à faire dans le calendrier du hub. Elles portent leur propre navigation : la
// barre n'affiche la sienne que pour les vues qu'elle sait déplacer.
export function construireBarrePeriode(vue, ancre, { vuesEnPlus = null } = {}) {
  return `
    <div class="cal-barre">
      <div class="affichages" role="group" aria-label="Affichage du calendrier">
        ${Object.entries({ ...VUES_CALENDRIER, ...(vuesEnPlus ?? {}) })
          .map(
            ([valeur, libelle]) => `
          <button type="button" data-vue-cal="${valeur}"
            aria-pressed="${valeur === vue}"
            class="${valeur === vue ? 'actif' : ''}">${libelle}</button>`,
          )
          .join('')}
      </div>
      ${
        vue === 'agenda' || !(vue in VUES_CALENDRIER)
          ? ''
          : `<div class="cal-nav">
               <button type="button" class="cal-fleche" data-periode="-1"
                 aria-label="Période précédente">‹</button>
               <span class="cal-titre">${echapper(titreDePeriode(ancre, vue))}</span>
               <button type="button" class="cal-fleche" data-periode="1"
                 aria-label="Période suivante">›</button>
               <button type="button" class="lien-discret bouton-mini"
                 data-periode="0">Aujourd'hui</button>
             </div>`
      }
    </div>`;
}

function retenu(element, natures) {
  return natures.has(natureDe(element));
}

// --- La grille ---------------------------------------------------------------
// Un événement de plusieurs jours est UNE barre continue, titrée une seule
// fois — pas la même étiquette répétée dans chaque case. C'est ce qui distingue
// un calendrier d'une liste par jour, et ça oblige à placer les barres en
// couloirs pour qu'elles ne se chevauchent pas.

function segmentsDeLaSemaine(jours, elements) {
  const bordGauche = versDateISO(jours[0]);
  // Le dernier jour de la ligne, quelle qu'en soit la longueur.
  const bordDroit = versDateISO(jours[jours.length - 1]);
  const colonne = new Map(jours.map((jour, index) => [versDateISO(jour), index]));

  const segments = elements
    .map((element) => {
      const debut = versDateISO(element.date);
      const fin = element.jusqua && element.jusqua > debut ? element.jusqua : debut;
      if (fin < bordGauche || debut > bordDroit) return null;

      return {
        element,
        depuis: colonne.get(debut < bordGauche ? bordGauche : debut),
        jusqua: colonne.get(fin > bordDroit ? bordDroit : fin),
        deborde: { avant: debut < bordGauche, apres: fin > bordDroit },
      };
    })
    .filter(Boolean)
    // Trois clés, dans cet ordre. Le jour de départ. Puis les plus longues :
    // une barre de trois jours mérite le couloir du haut, sinon elle se faufile
    // sous des barres d'un jour — et une barre qui traverse la semaine n'a pas
    // d'heure qui veuille dire quelque chose. Puis l'heure : entre deux
    // éléments d'un même jour, celui de 9 h passe au-dessus de celui de 15 h.
    .sort(
      (a, b) =>
        a.depuis - b.depuis ||
        b.jusqua - b.depuis - (a.jusqua - a.depuis) ||
        a.element.date - b.element.date,
    );

  const couloirs = [];
  for (const segment of segments) {
    let rang = couloirs.findIndex((couloir) =>
      couloir.every((autre) => segment.jusqua < autre.depuis || segment.depuis > autre.jusqua),
    );
    if (rang < 0) {
      couloirs.push([]);
      rang = couloirs.length - 1;
    }
    couloirs[rang].push(segment);
    segment.couloir = rang;
  }

  return segments;
}

// La nature se lit à l'œil, pas seulement à la couleur — un projet et une
// nature sont deux informations, et la couleur n'en porte qu'une. Un événement
// n'a pas de signe : c'est le cas ordinaire, la barre pleine le dit déjà.
const SIGNES = {
  tache: '○',
  publication: '◆',
  objectif: '▲',
  jalon: '△',
  commande: '▸',
  relance: '↗',
};

// L'heure d'un élément, quand elle veut dire quelque chose. Deux réserves :
// minuit veut dire « pas d'heure » (c'est la convention d'`assemblerCalendrier`,
// où une tâche sans heure part de `depuisDateISO`), et une barre qui traverse
// plusieurs jours n'a pas d'heure à annoncer — « 19:00 » sur un trait qui court
// du lundi au jeudi ne dirait rien de vrai.
function heureDe(element) {
  const date = element.date;
  if (date.getHours() === 0 && date.getMinutes() === 0) return null;
  if (element.jusqua && element.jusqua !== versDateISO(date)) return null;
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// La hauteur d'une barre en vue semaine : sa durée, à raison de 2,5 rem par
// heure. C'est ce qui reste de la grille horaire — non plus une échelle de 24 h
// où tout se place, mais une simple proportion : un match de deux heures est
// deux fois plus haut qu'un rendez-vous d'une heure, et ça se voit sans compter.
//
// Deux natures savent dire combien de temps elles prennent, et elles le disent
// dans deux colonnes différentes : un ÉVÉNEMENT a une fin déclarée
// (`date_fin`), une TÂCHE a des minutes (`duree`, depuis le 26 août 2026 —
// « de 15 h à 16 h » n'est pas la façon dont on pense une tâche). Les deux
// arrivent ici en minutes, et la suite est la même. Ce qui n'a ni l'une ni
// l'autre garde sa hauteur de ligne : ça arrive à un moment, ça n'occupe pas
// de créneau.
const HAUTEUR_PAR_HEURE = 2.5;

function minutesDeLElement(element) {
  const ligne = element.source;
  if (!ligne) return null;

  if (ligne.date_fin) return (new Date(ligne.date_fin) - element.date) / 60000;
  return element.type === 'tache' ? (ligne.duree ?? null) : null;
}

function hauteurSelonLaDuree(element) {
  const minutes = minutesDeLElement(element);
  if (!(minutes > 0)) return null;
  return (minutes / 60) * HAUTEUR_PAR_HEURE;
}

// L'état suivant d'une publication, s'il y en a un. C'est ce que son rond
// avance d'un appui — et ce qui décide de son dessin.
function suivantDe(element) {
  if (element.type !== 'publication' || !element.source) return null;
  const cycle = cyclePublication(element.projet);
  return cycle[cycle.indexOf(element.source.statut) + 1] ?? null;
}

// Le ROND d'une publication dit où elle en est (demande de Noé, 25 août 2026 —
// un rond, comme une tâche : c'est une chose à faire partir, et elle se lit
// comme les autres choses à faire). Creux tant qu'elle est à préparer, à
// moitié plein quand elle est prête à partir, coché une fois publiée. C'est la
// seule chose que la grille peut dire sans qu'on ouvre la tuile, et c'est celle
// qu'on vient y chercher.
function signeDe(element) {
  if (element.type === 'publication') {
    const cycle = cyclePublication(element.projet);
    const rang = cycle.indexOf(element.source?.statut);
    if (rang >= cycle.length - 1) return '◉';
    return rang === cycle.length - 2 ? '◐' : '○';
  }
  return element.faite ? '◉' : SIGNES[element.type];
}

function signeEnHtml(element, signe) {
  const suivant = suivantDe(element);
  const cochable = element.type === 'tache' || element.type === 'publication';

  const titre =
    element.type === 'tache'
      ? element.faite
        ? 'Faite'
        : 'Marquer comme faite'
      : suivant
        ? `Passer en ${nomDuStatut(element.projet, suivant)}`
        : nomDuStatut(element.projet, element.source?.statut);

  return `<span class="cal-signe${cochable ? ' cal-signe-cochable' : ''}"
    ${element.type === 'tache' ? `data-cocher-tache="${echapper(element.id)}"` : ''}
    ${suivant ? `data-avancer-pub="${echapper(element.id)}"` : ''}
    ${cochable ? `title="${echapper(titre)}"` : ''}
    aria-hidden="true">${signe}</span>`;
}

function barre(segment, { montrerProjet = false, proportionnel = false, empile = false } = {}) {
  const { element, deborde } = segment;
  const projet = montrerProjet ? ` data-projet="${echapper(element.projet)}"` : '';
  const heure = heureDe(element);
  // La durée pose un PLANCHER, jamais un plafond : un titre qui passe à la
  // ligne peut le dépasser. Une barre ne coupe jamais son texte pour tenir dans
  // sa durée.
  //
  // Elle voyage en `--duree` et non en `min-height` : un style en ligne
  // l'emporte sur la feuille, et la hauteur minimale de cible imposée en vue
  // semaine était donc écrasée par un événement court — une demi-heure valait
  // 18,75 px. C'est le CSS qui arbitre entre les deux, avec `max()`.
  const hauteur = proportionnel && heure ? hauteurSelonLaDuree(element) : null;
  // Une tâche faite garde sa place et le dit : cercle coché, titre barré. La
  // faire disparaître effacerait ce qu'on a accompli, ce que ce site ne fait
  // jamais.
  const signe = signeDe(element);
  const classes = [
    'cal-barre-element',
    `cal-type-${element.type}`,
    // Sa hauteur vient de sa durée : son titre ne se limite donc pas à trois
    // lignes, il a la place que l'événement lui donne (voir styles.css).
    hauteur ? 'cal-barre-duree' : '',
    element.faite ? 'cal-faite' : '',
    deborde.avant ? 'deborde-avant' : '',
    deborde.apres ? 'deborde-apres' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<button type="button" class="${classes}"${projet}
    style="${
      empile
        ? ''
        : `grid-column: ${segment.depuis + 1} / ${segment.jusqua + 2}; grid-row: ${
            segment.couloir + 2
          };`
    }${hauteur ? ` --duree: ${hauteur.toFixed(2)}rem;` : ''}"
    ${element.recurrent ? 'data-recurrent' : ''}
    data-element="${echapper(element.type)}:${echapper(element.id)}"
    aria-label="${echapper(
      [
        TYPES[element.type],
        element.titre,
        element.quand ?? versDateISO(element.date),
        // `quand` porte déjà l'heure pour un événement ; une tâche et une
        // publication n'ont que leur date, l'heure se dit alors à part.
        element.quand ? null : heure,
      ]
        .filter(Boolean)
        .join(' · '),
    )}"
    title="${echapper(`${TYPES[element.type]} · ${element.titre}`)}">${
      // Le signe est décoratif : le titre de l'infobulle dit déjà la nature en
      // toutes lettres, pour qui n'y voit rien.
      // Sauf pour une tâche, dont le cercle se coche — et pour une publication,
      // dont le rond AVANCE D'UN CRAN (demande de Noé, 25 août 2026) : le
      // dernier état atteint, il ne bouge plus, comme le cercle d'une tâche
      // faite. On ne peut pas y mettre un vrai <button> — la barre en est déjà
      // un, et deux boutons ne s'imbriquent pas —, alors c'est le gestionnaire
      // de clics qui reconnaît la cible. Au clavier, la barre s'ouvre et la
      // fenêtre de détail porte le geste, avec ses trois pastilles.
      signe ? signeEnHtml(element, signe) : ''
    }${
      // L'heure devant le titre, en chiffres et en retrait : c'est ce qui
      // remplace la grille horaire. Elle est déjà dans l'étiquette lue à voix
      // haute, d'où l'`aria-hidden`.
      heure ? `<span class="cal-barre-heure" aria-hidden="true">${echapper(heure)}</span>` : ''
    }<span class="cal-barre-titre">${echapper(element.titre)}</span></button>`;
}

function ligneDeSemaine(jours, elements, options) {
  const { montrerProjet, proportionnel, maximum, mois, aujourdhui, selection } = options;
  const segments = segmentsDeLaSemaine(jours, elements);
  const visibles = maximum ? segments.filter((segment) => segment.couloir < maximum) : segments;
  const caches = maximum ? segments.filter((segment) => segment.couloir >= maximum) : [];

  // Ce qui ne tient pas se compte par jour : « +2 » sous la dernière barre.
  const reste = new Array(jours.length).fill(0);
  for (const segment of caches) {
    for (let index = segment.depuis; index <= segment.jusqua; index += 1) reste[index] += 1;
  }

  // EN SEMAINE, chaque jour empile ce qui lui appartient (demande de Noé,
  // 13 août 2026). Les couloirs sont des lignes de grille, donc partagées par
  // les sept jours : un match de deux heures le vendredi rendait haute la ligne
  // du jeudi, et la tâche du jeudi qui s'y trouvait était étirée à sa taille —
  // deux choses sans aucun rapport, rendues jumelles par la mise en page.
  //
  // Les barres d'UN SEUL JOUR sortent donc de la grille et vont dans une pile
  // par jour, l'une sous l'autre. Restent en couloirs celles qui traversent
  // plusieurs jours : elles n'ont pas le choix, il leur faut des colonnes.
  const empilable = proportionnel;
  const longs = empilable
    ? visibles.filter((segment) => segment.jusqua > segment.depuis)
    : visibles;
  const courts = empilable ? visibles.filter((segment) => segment.jusqua === segment.depuis) : [];

  // Les couloirs sont recalculés entre les seules barres qui restent : sans ça,
  // une pile démarrerait après des rangs vides laissés par les barres parties.
  if (empilable) {
    const rangees = [];
    for (const segment of longs) {
      let rang = rangees.findIndex((rangee) =>
        rangee.every((autre) => segment.jusqua < autre.depuis || segment.depuis > autre.jusqua),
      );
      if (rang < 0) {
        rangees.push([]);
        rang = rangees.length - 1;
      }
      rangees[rang].push(segment);
      segment.couloir = rang;
    }
  }

  const couloirs = longs.reduce((haut, segment) => Math.max(haut, segment.couloir + 1), 0);
  const aDuReste = reste.some(Boolean);
  // Les lignes de la grille sont déclarées : le numéro, un rang par couloir,
  // l'éventuel « +N », puis un rang souple qui étire les cases jusqu'en bas.
  // Sans lignes explicites, le fond d'un jour ne s'étirerait sur rien.
  const rangs = couloirs + (aDuReste ? 1 : 0) + (courts.length ? 1 : 0);

  // Une pile par jour, posée sous les barres qui traversent. Elle ne reçoit
  // aucun clic elle-même (`pointer-events` en CSS) : le vide entre deux barres
  // appartient au jour, et c'est lui qu'on glisse pour poser quelque chose.
  const piles = courts.length
    ? jours
        .map((jour, index) => {
          const dedans = courts.filter((segment) => segment.depuis === index);
          if (!dedans.length) return '';
          return `<div class="cal-pile" aria-hidden="false"
            style="grid-column: ${index + 1}; grid-row: ${couloirs + 2};">${dedans
              .map((segment) => barre(segment, { montrerProjet, proportionnel, empile: true }))
              .join('')}</div>`;
        })
        .join('')
    : '';

  const fonds = jours
    .map((jour, index) => {
      const cle = versDateISO(jour);
      const classes = [
        'cal-jour',
        mois !== null && jour.getMonth() !== mois ? 'cal-hors-mois' : '',
        cle === aujourdhui ? 'cal-aujourdhui' : '',
        selection && cle >= selection.debut && cle <= selection.fin ? 'cal-choisi' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<div class="${classes}" data-jour="${cle}" role="button" tabindex="-1"
        aria-label="${echapper(
          jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        )}"
        style="grid-column: ${index + 1};"></div>`;
    })
    .join('');

  // Le jour se marque sur son numéro, pas sur toute la case : sans tuiles, un
  // cadre autour d'une case n'aurait rien à border.
  const numeros = jours
    .map((jour, index) => {
      const cle = versDateISO(jour);
      const classes = [
        'cal-numero',
        cle === aujourdhui ? 'cal-numero-aujourdhui' : '',
        mois !== null && jour.getMonth() !== mois ? 'cal-numero-hors-mois' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `<span class="${classes}" style="grid-column: ${index + 1}; grid-row: 1;"
        aria-hidden="true">${jour.getDate()}</span>`;
    })
    .join('');

  // Le « +N » s'ouvre. Un compte qui annonce une information et refuse de la
  // donner est pire que pas de compte du tout.
  const restes = reste
    .map((nombre, index) =>
      nombre
        ? `<button type="button" class="cal-reste"
             style="grid-column: ${index + 1}; grid-row: ${
               couloirs + (courts.length ? 3 : 2)
             };"
             data-jour-complet="${versDateISO(jours[index])}"
             aria-label="Voir les ${nombre} autres">+${nombre}</button>`
        : '',
    )
    .join('');

  return `
    <div class="cal-ligne" style="grid-template-rows: auto repeat(${rangs}, auto) 1fr;">
      ${fonds}${numeros}
      ${longs.map((segment) => barre(segment, { montrerProjet, proportionnel })).join('')}
      ${piles}
      ${restes}
    </div>`;
}

// La largeur des sept colonnes. Toutes égales d'ordinaire ; une seule pleine
// quand un jour est ouvert (demande de Noé, 24 août 2026).
//
// Les sept valeurs sont écrites en toutes lettres plutôt qu'en `repeat(7, 1fr)`
// : c'est ce qui permet au navigateur de passer de l'une à l'autre en glissant.
// Le passage de la semaine au jour n'est pas un changement d'écran — ce sont
// les traits entre les jours qui s'écartent, jusqu'à ce qu'un seul jour occupe
// la grille. Deux grilles différentes n'auraient rien eu à interpoler.
export function colonnesDeLaSemaine(ancre, jourSeul = null) {
  return grilleDeLaSemaine(ancre)
    .map((jour) => (!jourSeul || versDateISO(jour) === jourSeul ? '1fr' : '0fr'))
    .join(' ');
}

const FLECHES_JOUR = `
  <button type="button" class="cal-fleche-jour cal-fleche-avant" data-jour-pas="-1"
    title="Jour précédent" aria-label="Jour précédent">‹</button>
  <button type="button" class="cal-fleche-jour cal-fleche-apres" data-jour-pas="1"
    title="Jour suivant" aria-label="Jour suivant">›</button>`;

// L'en-tête d'un jour dans la grille de la semaine. Muet par défaut — la date
// est déjà écrite, un lecteur d'écran n'a pas à la relire sept fois. Sur
// l'accueil, il devient le BOUTON qui ouvre la journée (demande de Noé,
// 24 août 2026) : c'est le mot qu'on lit pour choisir son jour, c'est donc lui
// qu'on presse pour l'ouvrir.
function enteteDeJour(jour, ouvrant) {
  const texte = `${JOURS_COURTS[(jour.getDay() + 6) % 7]} ${jour.getDate()}`;
  if (!ouvrant) return `<span>${texte}</span>`;

  const complet = jour.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `<button type="button" class="cal-entete-jour"
    data-ouvrir-jour="${versDateISO(jour)}"
    aria-label="${echapper(complet)} — voir la journée">${texte}</button>`;
}

// La phrase d'aide se dit là où on vient POUR le calendrier. L'accueil affiche
// la même grille, mais on y vient pour son check-in : `aide: false` l'y tait
// (demande de Noé, 24 août 2026) — les gestes sont les mêmes, seule la légende
// disparaît.
const AIDE = `<p class="discret cal-aide">Touche un jour — ou glisse sur une série de jours —
  pour y poser quelque chose. Clique une barre pour la voir en détail.</p>`;

export function construireGrille(
  elements,
  natures,
  vue,
  ancre,
  {
    montrerProjet = false,
    selection = null,
    aide = true,
    titresOuvrants = false,
    jourSeul = null,
  } = {},
) {
  const retenus = elements.filter((element) => retenu(element, natures));
  const jours = vue === 'semaine' ? grilleDeLaSemaine(ancre) : grilleDuMois(ancre);

  const options = {
    montrerProjet,
    // Une barre haute comme sa durée : seulement en semaine. En mois, une case
    // fait 7 rem — un match de deux heures y prendrait les trois quarts de sa
    // journée et écraserait tout le reste.
    proportionnel: vue === 'semaine',
    // En vue mois une ligne ne peut pas tout montrer : trois couloirs, puis un
    // reste. La semaine n'a qu'une ligne et toute la hauteur : on montre tout.
    maximum: vue === 'semaine' ? 0 : 3,
    mois: vue === 'semaine' ? null : ancre.getMonth(),
    aujourdhui: versDateISO(new Date()),
    selection,
  };

  // La semaine est un mois d'une seule ligne (décision de Noé, 13 août 2026).
  // Elle a porté une grille de 24 h où chaque élément occupait sa vraie durée ;
  // c'était beaucoup de hauteur pour peu de choses — une semaine à trois
  // rendez-vous, c'est vingt-quatre cases vides pour trois pleines, et il
  // fallait faire défiler pour trouver ce qu'on cherchait. Une case par jour,
  // l'heure écrite devant le titre, l'ordre chronologique : la même information
  // se lit d'un coup d'œil.
  if (vue === 'semaine') {
    return `
      <div class="cal-grille cal-semaine${jourSeul ? ' cal-un-jour' : ''}" role="group"
        style="--cal-colonnes: ${colonnesDeLaSemaine(ancre, jourSeul)};"
        aria-label="${echapper(`Calendrier, semaine du ${titreDePeriode(ancre, 'semaine')}`)}">
        <div class="cal-entetes"${titresOuvrants ? '' : ' aria-hidden="true"'}>
          ${jours.map((jour) => enteteDeJour(jour, titresOuvrants)).join('')}
        </div>
        ${ligneDeSemaine(jours, retenus, options)}
        ${titresOuvrants ? FLECHES_JOUR : ''}
      </div>
      ${aide ? AIDE : ''}`;
  }

  const lignes = [];
  for (let debut = 0; debut < jours.length; debut += 7) {
    lignes.push(ligneDeSemaine(jours.slice(debut, debut + 7), retenus, options));
  }

  return `
    <div class="cal-grille cal-mois" role="group"
      aria-label="${echapper(`Calendrier, ${titreDePeriode(ancre, 'mois')}`)}">
      <div class="cal-entetes" aria-hidden="true">
        ${JOURS_COURTS.map((nom) => `<span>${nom}</span>`).join('')}
      </div>
      ${lignes.join('')}
    </div>
    ${aide ? AIDE : ''}`;
}

// Quand un événement finit, selon ce que le formulaire a reçu. Trois cas :
//   — une date de fin plus tardive : l'événement tient plusieurs jours, sa
//     barre les traverse et il finit au soir du dernier ;
//   — une heure et une durée : la fin s'en déduit, et la fiche de détail la dit ;
//   — ni l'un ni l'autre : il tient la journée, sans fin déclarée.
export function finDeLEvenement(debut, champs) {
  if (champs.fin && champs.fin !== champs.debut) return new Date(`${champs.fin}T23:59`);
  if (!champs.heure) return null;

  const minutes = Number(champs.duree) || 60;
  return new Date(debut.getTime() + minutes * 60000);
}

// --- L'agenda ----------------------------------------------------------------

export function construireCalendrier(elements, natures, { montrerProjet = false } = {}) {
  const retenus = elements.filter((element) => retenu(element, natures));

  if (!retenus.length) {
    return `<p class="vide">Rien de daté ici pour l'instant.</p>`;
  }

  const groupes = new Map();
  for (const element of retenus) {
    const cle = element.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(element);
  }

  return [...groupes.entries()]
    .map(
      ([mois, liste]) => `
      <section class="bloc bloc-mois">
        <h2>${echapper(mois)}</h2>
        <ul>
          ${liste
            .map(
              (element) => `
            <li ${montrerProjet ? `data-projet="${echapper(element.projet)}"` : ''}>
              <span class="tuile-entete">
                <span class="etiquette">${TYPES[element.type]}</span>
                ${
                  montrerProjet
                    ? `<span class="tuile-projet">${echapper(
                        NOMS_PROJETS[element.projet] ?? element.projet,
                      )}</span>`
                    : ''
                }
                <span class="discret quand">${echapper(
                  element.quand ??
                    element.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                )}</span>
              </span>
              <button type="button" class="semaine-titre cal-lien-detail"
                data-element="${echapper(element.type)}:${echapper(element.id)}">${echapper(
                  element.titre,
                )}</button>
              ${element.detail ? `<span class="discret calendrier-detail">${echapper(element.detail)}</span>` : ''}
            </li>`,
            )
            .join('')}
        </ul>
      </section>`,
    )
    .join('');
}

// --- Le glissement de sélection ----------------------------------------------
// Sur écran tactile, `pointerover` ne visite pas les cases voisines pendant un
// glissement : un doigt choisit donc un seul jour. Ce n'est pas un manque — la
// fenêtre porte les deux dates, une plage reste atteignable partout.

export function brancherSelection(section, quandChoisi) {
  let depuis = null;

  const peindre = (a, b) => {
    const [min, max] = [a, b].sort();
    for (const cellule of section.querySelectorAll('.cal-jour')) {
      cellule.classList.toggle(
        'cal-choisi',
        Boolean(min) && cellule.dataset.jour >= min && cellule.dataset.jour <= max,
      );
    }
  };

  section.addEventListener('pointerdown', (evenement) => {
    // Une barre se clique pour son détail ou se glisse pour changer de jour ;
    // un « +N » déplie sa journée. Ni l'un ni l'autre n'ouvre une sélection.
    if (evenement.target.closest('.cal-barre-element, .cal-reste')) return;
    const cellule = evenement.target.closest('.cal-jour');
    if (!cellule) return;
    // Sans ça, le navigateur sélectionne le texte des cases traversées.
    evenement.preventDefault();
    depuis = cellule.dataset.jour;
    peindre(depuis, depuis);
  });

  section.addEventListener('pointerover', (evenement) => {
    if (!depuis) return;
    const cellule = evenement.target.closest('.cal-jour');
    if (cellule) peindre(depuis, cellule.dataset.jour);
  });

  section.addEventListener('pointerup', (evenement) => {
    if (!depuis) return;
    const jusqua = evenement.target.closest('.cal-jour')?.dataset.jour ?? depuis;
    const [debut, fin] = [depuis, jusqua].sort();
    depuis = null;
    quandChoisi({ debut, fin });
  });

  section.addEventListener('pointercancel', () => {
    depuis = null;
    peindre('', '');
  });
}

// --- Le clavier --------------------------------------------------------------
// Une seule tabulation entre dans la grille, puis les flèches s'y déplacent :
// c'est le motif d'un composant à plusieurs cases. Quarante-deux arrêts de
// tabulation pour un mois, personne ne veut ça.
//
// La grille n'est PAS déclarée `role="grid"`, et c'est délibéré : les barres
// sont des sœurs des cases, pas des cellules d'une ligne. Annoncer un tableau
// puis n'en fournir la structure qu'à moitié est pire que ne rien annoncer.

export function brancherClavier(section, quandJourChoisi) {
  const cases = () => [...section.querySelectorAll('.cal-jour')];

  // Une case porte la tabulation, une seule : aujourd'hui si elle est là,
  // sinon la première du mois affiché.
  const poserLEntree = () => {
    const toutes = cases();
    if (!toutes.length) return;
    if (toutes.some((cellule) => cellule.tabIndex === 0)) return;

    const entree =
      toutes.find((cellule) => cellule.classList.contains('cal-aujourdhui')) ??
      toutes.find((cellule) => !cellule.classList.contains('cal-hors-mois')) ??
      toutes[0];
    entree.tabIndex = 0;
  };

  const DEPLACEMENTS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

  section.addEventListener('keydown', (evenement) => {
    const cellule = evenement.target.closest?.('.cal-jour');
    if (!cellule) return;

    if (evenement.key === 'Enter' || evenement.key === ' ') {
      evenement.preventDefault();
      quandJourChoisi(cellule.dataset.jour);
      return;
    }

    const pas = DEPLACEMENTS[evenement.key];
    if (!pas) return;

    const toutes = cases();
    const suivante = toutes[toutes.indexOf(cellule) + pas];
    if (!suivante) return;

    evenement.preventDefault();
    cellule.tabIndex = -1;
    suivante.tabIndex = 0;
    suivante.focus();
  });

  // Après chaque redessin, la grille a perdu son point d'entrée.
  return poserLEntree;
}

// --- Le déplacement d'une barre ----------------------------------------------
// Reporter est l'action la plus fréquente après créer. Un glissement plutôt que
// quatre gestes par le formulaire.
//
// À la souris seulement : au doigt, capturer le glissement obligerait à
// neutraliser le défilement de la page sur chaque barre, et une grille en est
// couverte. Sur téléphone, on passe par « Modifier ».

// La barre est posée PAR-DESSUS les cases : `closest` ne trouverait rien. On
// regarde donc ce qu'il y a sous le point, et on prend la première case.
function jourSousLePoint(x, y) {
  return document
    .elementsFromPoint(x, y)
    .find((element) => element.classList?.contains('cal-jour'))?.dataset.jour;
}

export function brancherDeplacement(section, quandDeplace) {
  let prise = null;

  const viser = (cle) => {
    for (const cellule of section.querySelectorAll('.cal-jour')) {
      cellule.classList.toggle('cal-cible', Boolean(cle) && cellule.dataset.jour === cle);
    }
  };

  // Ce qu'on a dans la main (demande de Noé, 14 août 2026). Sans lui, un
  // déplacement n'était qu'une barre pâlie et une case teintée : on devinait
  // qu'il se passait quelque chose, on ne voyait pas QUOI on déplaçait.
  //
  // C'est une copie de la barre, en `position: fixed`, qui suit le pointeur.
  // Une copie et non l'original : l'original vit dans une grille dont il occupe
  // une colonne et une ligne — le sortir du flux ferait sauter tout le reste.
  const prendreEnMain = (barre, x, y) => {
    const boite = barre.getBoundingClientRect();
    const fantome = barre.cloneNode(true);
    fantome.classList.add('cal-fantome');
    fantome.removeAttribute('id');
    fantome.style.width = `${boite.width}px`;
    // La barre reste sous le doigt là où on l'a saisie, pas centrée dessus :
    // c'est ce décalage qui donne l'impression de tenir l'objet.
    fantome.dataset.decalageX = String(boite.left - x);
    fantome.dataset.decalageY = String(boite.top - y);
    document.body.append(fantome);
    return fantome;
  };

  const suivreLaMain = (fantome, x, y) => {
    fantome.style.transform = `translate(${x + Number(fantome.dataset.decalageX)}px, ${
      y + Number(fantome.dataset.decalageY)
    }px)`;
  };

  const lacher = () => {
    prise?.barre.classList.remove('en-deplacement');
    prise?.fantome?.remove();
    viser(null);
    prise = null;
  };

  section.addEventListener('pointerdown', (evenement) => {
    const barre = evenement.target.closest('.cal-barre-element');
    // Une série ne se déplace pas au glissement : décaler une occurrence
    // décalerait toutes les autres, ce que personne n'attend d'un geste.
    if (!barre || barre.hasAttribute('data-recurrent')) return;

    const jour = jourSousLePoint(evenement.clientX, evenement.clientY);
    if (!jour) return;

    // À la souris, on empêche tout de suite la sélection du texte traversé. Au
    // DOIGT, non : tant qu'on ne sait pas si c'est un glissement ou un
    // défilement, il faut laisser la page libre de défiler.
    if (evenement.pointerType !== 'touch') evenement.preventDefault();
    prise = {
      barre,
      jour,
      x: evenement.clientX,
      y: evenement.clientY,
      bouge: false,
      fantome: null,
      tactile: evenement.pointerType === 'touch',
      pointeur: evenement.pointerId,
    };
  });

  section.addEventListener('pointermove', (evenement) => {
    if (!prise) return;

    // Quelques pixels de tolérance : un clic tremblant reste un clic.
    if (!prise.bouge) {
      const dx = evenement.clientX - prise.x;
      const dy = evenement.clientY - prise.y;
      if (Math.hypot(dx, dy) < 5) return;

      // AU DOIGT, seul un mouvement franchement horizontal saisit la barre. Le
      // vertical appartient au défilement de la page — c'est ce que dit
      // `touch-action: pan-y` sur la barre, et il faut le dire aussi ici :
      // sinon le premier pixel de travers déclencherait un déplacement au
      // milieu d'un défilement. Conséquence assumée : en vue MOIS, changer de
      // semaine au doigt ne se fait pas au glissement ; en vue semaine, où les
      // jours sont côte à côte, tout est horizontal.
      if (prise.tactile && Math.abs(dx) <= Math.abs(dy)) {
        prise = null;
        return;
      }

      prise.bouge = true;
      prise.barre.classList.add('en-deplacement');
      prise.fantome = prendreEnMain(prise.barre, evenement.clientX, evenement.clientY);
      // Le pointeur est capturé : la barre continue de recevoir ses
      // déplacements même quand le doigt sort d'elle, ce qui est le cas dès le
      // premier pixel. Sous `try` parce que la capture LÈVE quand le pointeur
      // n'est plus valide — et une capture ratée ne doit pas emporter le
      // déplacement avec elle.
      try {
        prise.barre.setPointerCapture(prise.pointeur);
      } catch {
        // Tant pis : le glissement marche encore, il perd juste le suivi hors
        // de la barre.
      }
    }

    suivreLaMain(prise.fantome, evenement.clientX, evenement.clientY);
    viser(jourSousLePoint(evenement.clientX, evenement.clientY));
  });

  section.addEventListener('pointerup', (evenement) => {
    if (!prise) return;

    const { barre, jour, bouge, pointeur } = prise;
    // Même précaution qu'à la prise, et elle compte double ici : cette ligne
    // est la PREMIÈRE du relâchement. Si elle lève, tout ce qui suit — le
    // report lui-même — ne se fait pas, et le geste est perdu sans un mot.
    try {
      barre.releasePointerCapture(pointeur);
    } catch {
      // Le pointeur n'était plus à capturer : rien à relâcher.
    }
    const arrivee = jourSousLePoint(evenement.clientX, evenement.clientY);
    lacher();

    if (!bouge) return;

    // Un vrai glissement ne doit pas ouvrir le détail derrière lui : on avale
    // le clic qui suit, et lui seul. Le désarmement différé est une ceinture :
    // si aucun clic ne vient — relâchement hors fenêtre, geste avorté — le
    // piège ne doit pas rester tendu pour le clic d'après.
    const avaler = (clic) => {
      clic.stopPropagation();
      clic.preventDefault();
    };
    section.addEventListener('click', avaler, { capture: true, once: true });
    setTimeout(() => section.removeEventListener('click', avaler, { capture: true }), 400);

    if (!arrivee || arrivee === jour) return;

    const ecart = Math.round(
      (depuisDateISO(arrivee) - depuisDateISO(jour)) / 86400000,
    );
    quandDeplace({ element: barre.dataset.element, ecart });
  });

  section.addEventListener('pointercancel', lacher);
}

// Ce qu'un déplacement change, par nature. Un événement garde sa durée et son
// heure : on décale ses deux bornes du même nombre de jours.
// Où écrire, par nature. Recopiée à l'identique dans l'espace Calendrier et
// dans le site Yuno, elle allait l'être une troisième fois pour l'accueil : le
// même motif que `poserAuCalendrier`, et la même leçon — c'est dans la copie
// oubliée qu'un champ finit par manquer.
export async function appliquerAuCalendrier(type, id, champs) {
  if (type === 'evenement') return api.modifierEvenement(id, champs);
  if (type === 'publication') return api.modifierPublication(id, champs);
  if (type === 'objectif') return api.modifierObjectif(id, champs);
  if (type === 'commande') return api.modifierCommande(id, champs);
  if (type === 'relance') return api.modifierContact(id, champs);
  if (type === 'jalon') return api.modifierJalon(id, champs);
  return api.modifierTache(id, champs);
}

export function champsApresDeplacement(element, ecart) {
  const ligne = element.source ?? {};
  const decaler = (iso) => versDateISO(ajouterJours(depuisDateISO(iso), ecart));

  if (element.type === 'evenement') {
    const champs = {
      date_debut: new Date(
        new Date(ligne.date_debut).setDate(new Date(ligne.date_debut).getDate() + ecart),
      ).toISOString(),
    };
    if (ligne.date_fin) {
      champs.date_fin = new Date(
        new Date(ligne.date_fin).setDate(new Date(ligne.date_fin).getDate() + ecart),
      ).toISOString();
    }
    return champs;
  }

  if (element.type === 'publication') return { date_prevue: decaler(ligne.date_prevue) };
  if (element.type === 'relance') {
    return { prochaine_action_date: decaler(ligne.prochaine_action_date) };
  }

  // Tâche, jalon, objectif, commande : tous rangent leur date dans `echeance`.
  return { echeance: decaler(ligne.echeance) };
}

// --- Les fenêtres volantes ---------------------------------------------------
// Une fenêtre par-dessus la grille, comme dans un agenda : on pose une chose
// sans quitter la vue d'ensemble, et on la referme d'un geste.

// Ce que perso sait recevoir. Un rendez-vous avec soi-même a toute sa place au
// calendrier, et depuis le 13 août 2026 une tâche aussi (demande de Noé).
// Restent dehors : la publication — l'espace perso ne publie pas, et sa table
// n'accepte pas la valeur — et l'objectif, parce qu'un objectif perso est une
// INTENTION : sans mesure ni date, donc rien qu'on pose sur un calendrier.
export const NATURES_PERSO = new Set(['evenement', 'tache']);

const NATURES_CREABLES = {
  evenement: 'Événement',
  tache: 'Tâche',
  publication: 'Publication',
  objectif: 'Objectif',
};

// Quand une seule nature est cochée, c'est elle qu'on vient poser : le filtre
// dit déjà ce qu'on est en train de faire, autant ne pas le redemander. Une
// relance fait exception — elle ne se crée pas d'ici, c'est une date qu'on
// pose sur une fiche du carnet — alors on retombe sur l'événement.
export function natureParDefaut(natures) {
  if (natures.size !== 1) return 'evenement';
  const [seule] = natures;
  return seule in NATURES_CREABLES ? seule : 'evenement';
}

// --- Poser au calendrier : la tuile ------------------------------------------
//
// Même mécanique que la capture de l'espace Tâches (13 août 2026, demande de
// Noé) : une tuile volante sur fond assombri, le titre écrit directement, une
// bande de pastilles qui défile sans jamais passer à la ligne, et la flèche
// d'envoi qui garde sa place.
//
// Ce qui change ici, et c'est tout l'objet : **les pastilles s'adaptent à la
// nature** de ce qu'on pose. Un événement a une durée et se répète ; une tâche
// a une priorité ; une publication a un réseau et un format ; un objectif a un
// pourquoi. Chacun ne montre que ce qu'il demande.
//
// Le contrat avec les espaces qui l'appellent n'a pas bougé d'un pouce : les
// champs gardent leurs `name`, le formulaire son `data-action`, et les natures
// leur `data-nature-creation`. Ni `calendrier.js` ni `yuno.js` n'ont eu à
// changer leur façon de lire ce qui est posé — c'est la présentation qui a été
// refaite, pas les données.
//
// Les panneaux sont TOUS dans le DOM, masqués : les valeurs vivent donc dans
// leurs champs, pas dans un état à part, et ouvrir une pastille ne redessine
// rien. C'est ce qui permet de garder la fenêtre de création telle qu'elle
// était côté espaces — une fonction pure appelée au rendu.

// Les objets de réunion du FCH (demande de Noé, 21 août 2026). L'objet est le
// MARQUEUR : un événement fch dont `reunion_objet` est non nul est une réunion,
// comme une publication sans date est une idée. La liste s'élargira si le
// besoin vient — le CHECK en base est déjà posé pour ces cinq-là.
export const REUNION_OBJETS = {
  // « CA » tel quel (demande de Noé, 21 août 2026) : c'est le mot qu'il dit,
  // et le libellé long mangeait la pastille comme les lignes de réunion.
  ca: 'CA',
  alternance: 'Alternance',
  communication: 'Communication',
  partenariat: 'Partenariat',
  autre: 'Autre',
};

const ICONE = {
  nature: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"></path>
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"></circle></svg>`,
  quand: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>`,
  projet: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10 3 8 21M16 3l-2 18M3.5 8.5h17M3 15.5h17"></path></svg>`,
  priorite: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 22V3"></path><path d="M5 3.5h13l-2.4 4.6L18 13H5z"></path></svg>`,
  repetition: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17 2l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
  reseau: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"></path></svg>`,
  texte: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h10"></path></svg>`,
  duree: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>`,
  format: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <path d="M3 15l5-5 4 4 3-3 6 6"></path></svg>`,
  moment: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 8h3l2-3h6l2 3h3v12H4z"></path>
    <circle cx="12" cy="13" r="3.5"></circle></svg>`,
  reunion: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3.2"></circle>
    <path d="M3.5 19c.7-3 2.7-4.5 5.5-4.5s4.8 1.5 5.5 4.5"></path>
    <circle cx="17" cy="9" r="2.6"></circle>
    <path d="M15.5 14.6c2.4.2 4.1 1.6 4.9 4"></path></svg>`,
  // Quatre colonnes : les quatre piliers éditoriaux de Yuno.
  pilier: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 20V9M9.3 20V9M14.7 20V9M20 20V9"></path>
    <path d="M2.5 20h19M12 3 2.5 7.5h19z"></path></svg>`,
};

// Le type du moment qui naîtra d'un événement Yuno — les mêmes quatre valeurs
// que le Carnet de terrain (TYPES_MOMENT dans yuno.js, qui importe ce
// fichier-ci : la constante vit donc ici pour ne pas croiser les imports).
const TYPES_MOMENT_CAL = {
  match: 'Match',
  concert: 'Concert',
  sortie: 'Sortie',
  autre: 'Autre',
};

const FLECHE_ENVOI = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>`;

// Ce que le titre demande, selon ce qu'on pose. « Quoi » convenait à tout et ne
// disait rien : le mot juste rappelle à lui seul ce qu'on est en train de créer.
const INVITE_TITRE = {
  evenement: "Nom de l'événement",
  tache: 'Nom de la tâche',
  publication: "L'idée, en une phrase",
  objectif: "L'objectif, formulé de façon mesurable",
};

const PRIORITES_CAL = {
  1: 'Priorité 1',
  2: 'Priorité 2',
  3: 'Priorité 3',
  4: 'Priorité 4',
};

// `suggestions` : une liste d'appui derrière un champ de texte libre (même
// mécanique que les formulaires, `datalist`). On écrit ce qu'on veut, la liste
// évite d'avoir à l'orthographier de mémoire.
function champCapture({ nom, libelle, type, valeur = '', requis = false, suggestions = null }) {
  const id = `cal-${nom}`;
  const liste = suggestions?.length
    ? `<datalist id="${id}-liste">${suggestions
        .map((suggestion) => `<option value="${echapper(suggestion)}"></option>`)
        .join('')}</datalist>`
    : '';

  const controle =
    type === 'textarea'
      ? `<textarea id="${id}" name="${nom}" rows="2">${echapper(valeur)}</textarea>`
      : `<input id="${id}" name="${nom}" type="${type}" value="${echapper(valeur)}" ${
          requis ? 'required' : ''
        } ${liste ? `list="${id}-liste"` : ''}>${liste}`;

  return `<label class="champ-capture" for="${id}">${echapper(libelle)}</label>${controle}`;
}

// Le drapeau de priorité, comme dans l'espace Tâches : plein et coloré de 1 à 3,
// vide pour la 4 — le cas ordinaire ne se colore pas.
const DRAPEAU_CAL = (rempli) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  <path d="M5 22V3"></path>
  <path d="M5 3.5h13l-2.4 4.6L18 13H5z" fill="${rempli ? 'currentColor' : 'none'}"></path>
</svg>`;

// Un choix se fait dans une LISTE, jamais dans un `<select>` natif.
//
// C'était l'erreur de la première version : un menu déroulant du système, avec
// son cadre bleu et son chevron, au milieu d'une tuile dessinée. Laid, et
// surtout pénible — au doigt il faut viser un contrôle de 30 px puis une ligne
// dans une roue. Ici chaque option est une ligne pleine largeur, avec son
// drapeau ou sa pastille de projet, exactement comme dans l'espace Tâches.
//
// La valeur voyage dans un champ caché : les espaces lisent toujours le
// formulaire avec `FormData`, ils n'ont pas à savoir comment on l'a saisie.
function champChoix({ nom, options, valeur, decor = null }) {
  const ligne = ([cle, texte]) => {
    const choisi = String(cle) === String(valeur);
    const signe =
      decor === 'priorite'
        ? `<span class="choix-drapeau">${DRAPEAU_CAL(String(cle) !== '4')}</span>`
        : decor === 'projet'
          ? '<span class="choix-pastille" aria-hidden="true"></span>'
          : '';

    return `
      <li><button type="button" data-choix="${nom}" data-valeur="${echapper(String(cle))}"
        aria-pressed="${choisi}"
        ${decor === 'priorite' ? `data-priorite="${echapper(String(cle))}"` : ''}
        ${decor === 'projet' ? `data-projet="${echapper(String(cle))}"` : ''}
        class="${choisi ? 'actif' : ''}">${signe}<span>${echapper(texte)}</span></button></li>`;
  };

  return `
    <input type="hidden" name="${nom}" value="${echapper(String(valeur))}">
    <ul class="choix-capture">${Object.entries(options).map(ligne).join('')}</ul>`;
}

// Une pastille et son panneau, rendus SÉPARÉMENT. La pastille part dans la
// bande qui défile ; le panneau, lui, se pose hors d'elle — sinon l'`overflow`
// de la bande le découperait net. Ils se retrouvent par leur nom.
//
// `source` dit quel champ relire pour écrire le libellé de la pastille : une
// pastille renseignée affiche sa valeur, c'est ce qui permet de relire toute la
// fiche sans ouvrir un seul panneau.
function pastilleCapture({
  nom,
  icone,
  defaut,
  source = null,
  sourceHeure = null,
  // Le champ dont la valeur s'ajoute au libellé en toutes lettres, derrière
  // l'heure : « jeudi, 14:30 · 1 h 30 ».
  sourceDuree = null,
  // La valeur qui ne compte pas pour renseignée. Une priorité 4 est le cas
  // ordinaire : la pastille doit dire « Priorité », pas « Priorité 4 ».
  neutre = null,
  contenu,
  rempli = false,
  // Une pastille qui n'existe que pour UN projet : elle porte le sien, et
  // `brancherCapture` la montre ou la masque quand le choix du projet change.
  // `cachee` dit son état au premier rendu.
  siProjet = null,
  cachee = false,
}) {
  return {
    pastille: `<button type="button" class="pastille-capture${rempli ? ' remplie' : ''}"
      data-pastille="${nom}" aria-expanded="false"
      ${source ? `data-source="${source}"` : ''}
      ${sourceHeure ? `data-source-heure="${sourceHeure}"` : ''}
      ${sourceDuree ? `data-source-duree="${sourceDuree}"` : ''}
      ${neutre !== null ? `data-neutre="${echapper(String(neutre))}"` : ''}
      ${siProjet ? `data-si-projet="${echapper(siProjet)}"` : ''}
      ${cachee ? 'hidden' : ''}
      data-defaut="${echapper(defaut)}">${icone}<span data-libelle>${echapper(defaut)}</span></button>`,
    panneau: `<div class="capture-popover" data-panneau="${nom}" hidden>${contenu}</div>`,
  };
}

export function fenetreCreation({
  debut,
  fin,
  nature = 'evenement',
  heure = '',
  projets = null,
  // Une nature que SEUL l'appelant connaît, ajoutée en fin de liste. Le site
  // Yuno s'en sert pour son « moment » : il n'a rien à faire dans le calendrier
  // du hub — un moment n'est pas une date qu'on pose, c'est un vécu qu'on
  // raconte — mais tout à faire dans le « + » de Yuno, où l'on note ce qu'on
  // vient de vivre aussi souvent qu'un rendez-vous à venir.
  naturesEnPlus = null,
  // La pastille de nature en DERNIER au lieu d'en tête. Sur la page Créer de
  // Yuno, on vient poster : la nature est le réglage qu'on change le moins, et
  // ce qui compte — la date, le réseau, le format — mérite la première place
  // (demande de Noé, 13 août 2026).
  natureEnDernier = false,
  // Le type du moment (match · concert…) sur un événement. Le site Yuno le
  // passe à vrai — chez lui tout est photo. Le hub n'a pas besoin de l'écrire :
  // dès que ses projets offrent 'photo', la pastille existe, révélée quand le
  // projet choisi est photo (demande de Noé, 14 août 2026).
  typeMoment = false,
  // La pastille « Réunion » sur un événement, offerte quand le projet est fch
  // (demande de Noé, 21 août 2026). Le site FCH la passe à vrai — chez lui
  // tout est club ; dans le hub elle se révèle quand le projet choisi est fch,
  // exactement comme `type_moment` avec photo.
  reunion = false,
  // Les noms des clubs du vivier, pour relier un événement à son affiche. Yuno
  // les apporte ; le hub n'a pas de vivier et ne voit donc pas la pastille.
  clubs = null,
  // Les piliers éditoriaux, sur une publication. Ils appartiennent à Yuno — le
  // hub et le FCH n'en ont pas — et c'est donc l'appelant qui les apporte, déjà
  // aplatis en { rang: libellé }. Sans eux, pas de pastille.
  piliers = null,
  // La pastille de notes, sur une publication. Depuis que « Noter une idée » a
  // disparu de Créer (demande de Noé, 15 août 2026), la tuile est le seul
  // endroit où l'on écrit une idée : ce qu'on avait à dire de plus doit tenir
  // ici, sinon il ne se dit nulle part.
  notes = false,
  // Ce que la tuile porte DÉJÀ. Vide à la création — c'est le cas ordinaire —,
  // rempli quand on rouvre une ligne pour la corriger : le titre dans le champ,
  // le projet et la priorité sur leurs pastilles. La tuile ne sait pas si elle
  // crée ou si elle corrige ; c'est l'espace qui le sait, à l'envoi.
  valeurs = {},
}) {
  const memeJour = debut === fin;
  const jourLisible = (cle) =>
    depuisDateISO(cle).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Seul un événement s'étend. Une tâche, une publication ou un objectif porte
  // une date unique : on prend le premier jour, et on le dit.
  const surLePremierJour = !memeJour && nature !== 'evenement';

  const projetsOfferts =
    projets &&
    Object.fromEntries(
      Object.entries(projets).filter(([cle]) => cle !== 'perso' || NATURES_PERSO.has(nature)),
    );

  const pastilles = [];

  // 1. La nature. En tête d'ordinaire — c'est elle qui commande tout le reste —
  // et en queue quand l'appelant sait déjà ce qu'on vient poser.
  const pastilleNature =
    pastilleCapture({
      nom: 'nature',
      icone: ICONE.nature,
      defaut: { ...NATURES_CREABLES, ...(naturesEnPlus ?? {}) }[nature],
      rempli: true,
      contenu: `<ul class="choix-capture">${Object.entries({
        ...NATURES_CREABLES,
        ...(naturesEnPlus ?? {}),
      })
        .map(
          ([valeur, libelle]) => `
        <li><button type="button" data-nature-creation="${valeur}"
          aria-pressed="${valeur === nature}"
          class="${valeur === nature ? 'actif' : ''}">${libelle}</button></li>`,
        )
        .join('')}</ul>`,
    });

  if (!natureEnDernier) pastilles.push(pastilleNature);

  // 2. Quand. Les dates se montrent et se corrigent : le glissement les
  // pré-remplit, il ne les impose pas — sans ça, un événement de plusieurs
  // jours ne pourrait naître que d'un geste de souris, impossible au doigt.
  //
  // **La date peut être absente**, et la tuile s'ouvre alors sur « Quand » à
  // remplir plutôt que sur aujourd'hui : c'est ainsi qu'on note une idée dans
  // la banque, où une publication SANS date est justement ce qu'on cherche à
  // créer (demande de Noé, 14 août 2026). Seul un événement exige sa date —
  // `date_debut` est NOT NULL, et un événement sans jour n'existe pas.
  const dateFournie = Boolean(debut);
  const dateRequise = nature === 'evenement' || dateFournie;

  const champsQuand =
    nature === 'evenement'
      ? `<div class="capture-deux-champs">
           <span>${champCapture({ nom: 'debut', libelle: 'Du', type: 'date', valeur: debut, requis: true })}</span>
           <span>${champCapture({ nom: 'heure', libelle: 'À quelle heure', type: 'time', valeur: heure })}</span>
         </div>
         ${champCapture({ nom: 'fin', libelle: "Jusqu'au (vide = un seul jour)", type: 'date', valeur: memeJour ? '' : fin })}`
      : nature === 'objectif'
        ? champCapture({ nom: 'debut', libelle: 'Échéance', type: 'date', valeur: debut, requis: dateRequise })
        : `<div class="capture-deux-champs">
             <span>${champCapture({ nom: 'debut', libelle: 'Quand', type: 'date', valeur: debut, requis: dateRequise })}</span>
             <!-- L'heure était le seul champ de la tuile à ne pas être
                  pré-rempli : rouvrir une tâche de 18 h et l'enregistrer sans
                  y toucher lui retirait son heure — et depuis le 26 août, sa
                  durée avec. -->
             <span>${champCapture({ nom: 'heure', libelle: 'Heure', type: 'time', valeur: heure })}</span>
           </div>
           ${
             // La durée d'une TÂCHE est ICI, sous son heure, et non dans une
             // pastille à elle (27 août 2026). Deux raisons, et la seconde est
             // celle qui a décidé : une durée n'a de sens qu'avec une heure —
             // les deux se règlent donc du même geste ; et la bande de
             // pastilles DÉFILE — sixième sur six, « Durée » vivait hors de
             // l'écran, donc n'existait pas. C'est aussi la place qu'elle a
             // dans l'espace Tâches : la même question au même endroit.
             nature === 'tache'
               ? champDuree({ id: 'cal-duree-tache', valeur: valeurs.duree ?? null })
               : ''
           }`;

  pastilles.push(
    pastilleCapture({
      nom: 'quand',
      icone: ICONE.quand,
      // Sans date, la pastille dit ce qu'elle attend au lieu d'afficher un
      // jour que personne n'a choisi — et elle reste en encre discrète.
      defaut: dateFournie ? jourLisible(debut) : 'Quand',
      source: 'debut',
      sourceHeure: nature === 'objectif' ? null : 'heure',
      // « jeudi, 14:30 · 1 h 30 » : la pastille dit le créneau entier, sans
      // qu'on ait à rouvrir le panneau pour vérifier.
      sourceDuree: nature === 'tache' ? 'duree' : null,
      rempli: dateFournie,
      contenu: `${champsQuand}${
        surLePremierJour
          ? `<p class="discret cal-note-nature">Posé sur le ${echapper(
              jourLisible(debut),
            )} — seul un événement s'étend sur plusieurs jours.</p>`
          : ''
      }`,
    }),
  );

  // 3. Le projet, quand l'espace en offre le choix. Le site Yuno n'en propose
  // pas : on y est déjà chez Yuno.
  const projetInitial = projetsOfferts
    ? valeurs.projet && valeurs.projet in projetsOfferts
      ? valeurs.projet
      : 'photo' in projetsOfferts
        ? 'photo'
        : Object.keys(projetsOfferts)[0]
    : null;

  if (projetsOfferts) {
    pastilles.push(
      pastilleCapture({
        nom: 'projet',
        icone: ICONE.projet,
        defaut: projetsOfferts.photo ?? Object.values(projetsOfferts)[0],
        source: 'projet',
        rempli: true,
        contenu: champChoix({
          nom: 'projet',
          options: projetsOfferts,
          valeur: projetInitial,
          decor: 'projet',
        }),
      }),
    );
  }

  // 4. Ce que cette nature-là demande, et rien d'autre.
  if (nature === 'evenement') {
    pastilles.push(
      pastilleCapture({
        nom: 'duree',
        icone: ICONE.duree,
        defaut: '2 heures',
        source: 'duree',
        contenu: champChoix({ nom: 'duree', options: DUREES, valeur: '120' }),
      }),
      pastilleCapture({
        nom: 'repetition',
        icone: ICONE.repetition,
        defaut: 'Une seule fois',
        source: 'recurrence',
        contenu: `${champChoix({ nom: 'recurrence', options: RECURRENCES, valeur: '' })}
          ${champCapture({ nom: 'recurrence_fin', libelle: "Jusqu'au (facultatif)", type: 'date' })}`,
      }),
      pastilleCapture({
        nom: 'lieu',
        icone: ICONE.texte,
        defaut: 'Lieu et notes',
        source: 'lieu',
        contenu: `${champCapture({ nom: 'lieu', libelle: 'Où', type: 'text' })}
          ${champCapture({ nom: 'notes', libelle: 'Notes', type: 'textarea' })}`,
      }),
    );

    // Le type du moment qui naîtra de cette sortie — c'est le bilan de la
    // préparation qui s'en servira pour inscrire le vécu au carnet. Yuno
    // seulement : dans le hub, la pastille attend que le projet choisi soit
    // photo (elle porte data-si-projet, brancherCapture la révèle et la cache).
    if (typeMoment || projetsOfferts?.photo) {
      pastilles.push(
        pastilleCapture({
          nom: 'type_moment',
          icone: ICONE.moment,
          defaut: TYPES_MOMENT_CAL.match,
          source: 'type_moment',
          rempli: true,
          siProjet: projetsOfferts ? 'photo' : null,
          cachee: Boolean(projetsOfferts) && projetInitial !== 'photo',
          contenu: champChoix({
            nom: 'type_moment',
            options: TYPES_MOMENT_CAL,
            valeur: valeurs.type_moment ?? 'match',
          }),
        }),
      );
    }

    // La réunion : son objet — qui est le marqueur — et « j'anime ». Une seule
    // pastille pour les deux réglages : ils se décident ensemble, en posant la
    // réunion, pas en deux visites de panneaux.
    if (reunion || projetsOfferts?.fch) {
      pastilles.push(
        pastilleCapture({
          nom: 'reunion',
          icone: ICONE.reunion,
          defaut: 'Réunion',
          source: 'reunion_objet',
          neutre: '',
          siProjet: projetsOfferts ? 'fch' : null,
          cachee: Boolean(projetsOfferts) && projetInitial !== 'fch',
          contenu: `${champChoix({
            nom: 'reunion_objet',
            options: { '': 'Pas une réunion', ...REUNION_OBJETS },
            valeur: valeurs.reunion_objet ?? '',
          })}
          <label class="capture-case">
            <input type="checkbox" name="reunion_animee" value="oui"
              ${valeurs.reunion_animee ? 'checked' : ''}> J'anime la réunion
          </label>`,
        }),
      );
    }

    // Les deux clubs de l'affiche (demande de Noé, 15 août au soir). Un match
    // posé depuis le vivier arrive relié tout seul ; un match noté à la main —
    // et surtout un match PASSÉ qu'on inscrit après coup — ne l'était pas, et
    // sans lien il ne compte au bilan d'aucun club.
    //
    // On écrit le NOM, comme au formulaire de modification et comme « Rattaché
    // à » sur une fiche du réseau : même geste, même règle — le nom exact relie,
    // autre chose délie. La liste du vivier est en appui derrière le champ.
    //
    // Yuno seulement : c'est lui qui apporte les noms, le hub n'a pas de vivier.
    if (clubs?.length) {
      pastilles.push(
        pastilleCapture({
          nom: 'clubs',
          icone: ICONE.moment,
          defaut: 'Clubs',
          source: 'club_recevant',
          contenu: `
            ${champCapture({
              nom: 'club_recevant',
              libelle: 'Club qui reçoit (son nom au vivier)',
              type: 'text',
              valeur: valeurs.club_recevant ?? '',
              suggestions: clubs,
            })}
            ${champCapture({
              nom: 'club_visiteur',
              libelle: 'Club qui se déplace',
              type: 'text',
              valeur: valeurs.club_visiteur ?? '',
              suggestions: clubs,
            })}`,
        }),
      );
    }
  }

  if (nature === 'tache') {
    pastilles.push(
      pastilleCapture({
        nom: 'priorite',
        icone: ICONE.priorite,
        defaut: 'Priorité',
        source: 'priorite',
        neutre: '4',
        contenu: champChoix({
          nom: 'priorite',
          options: PRIORITES_CAL,
          valeur: String(valeurs.priorite ?? '4'),
          decor: 'priorite',
        }),
      }),
      // La répétition, la MÊME que celle d'un événement (demande de Noé,
      // 26 août 2026) : mêmes mots, même pastille, même colonne en base. Ce qui
      // diffère est ailleurs — une tâche récurrente ne se termine pas, elle
      // glisse à l'occurrence suivante (voir `terminerTache`, js/api.js).
      pastilleCapture({
        nom: 'repetition',
        icone: ICONE.repetition,
        defaut: 'Une seule fois',
        source: 'recurrence',
        contenu: `${champChoix({
          nom: 'recurrence',
          options: RECURRENCES,
          valeur: valeurs.recurrence ?? '',
        })}
          ${champCapture({
            nom: 'recurrence_fin',
            libelle: "Jusqu'au (facultatif)",
            type: 'date',
            valeur: valeurs.recurrence_fin ?? '',
          })}`,
      }),
    );
  }

  if (nature === 'publication') {
    pastilles.push(
      // Deux pastilles, pas deux listes dans une : neuf lignes empilées
      // dépasseraient l'écran, et « où je poste » n'est pas « sous quelle
      // forme » — ce sont deux décisions.
      pastilleCapture({
        nom: 'reseau',
        icone: ICONE.reseau,
        defaut: RESEAUX.instagram,
        source: 'reseau',
        rempli: true,
        contenu: champChoix({ nom: 'reseau', options: RESEAUX, valeur: 'instagram' }),
      }),
      pastilleCapture({
        nom: 'format',
        icone: ICONE.format,
        defaut: FORMATS.carrousel,
        source: 'format',
        rempli: true,
        contenu: champChoix({ nom: 'format', options: FORMATS, valeur: 'carrousel' }),
      }),
      // La répétition, la même que partout (demande de Noé, 26 août 2026) :
      // une rubrique qui revient chaque lundi se pose une fois. Elle n'a de
      // sens qu'avec une date — une idée sans jour reste dans la banque —, et
      // l'écriture l'écarte d'elle-même le cas échéant.
      pastilleCapture({
        nom: 'repetition',
        icone: ICONE.repetition,
        defaut: 'Une seule fois',
        source: 'recurrence',
        contenu: `${champChoix({
          nom: 'recurrence',
          options: RECURRENCES,
          valeur: valeurs.recurrence ?? '',
        })}
          ${champCapture({
            nom: 'recurrence_fin',
            libelle: "Jusqu'au (facultatif)",
            type: 'date',
            valeur: valeurs.recurrence_fin ?? '',
          })}`,
      }),
    );

    // Le pilier ferme un débat : « ça rentre dans un pilier ? oui → je crée ».
    // Il est facultatif — une idée sans pilier reste une idée, et proposer vaut
    // mieux que renvoyer à un classement pas fait.
    if (piliers) {
      pastilles.push(
        pastilleCapture({
          nom: 'pilier',
          icone: ICONE.pilier,
          defaut: 'Pilier',
          source: 'pilier',
          neutre: '',
          contenu: champChoix({
            nom: 'pilier',
            options: { '': 'Sans pilier', ...piliers },
            valeur: '',
          }),
        }),
      );
    }

    if (notes) {
      pastilles.push(
        pastilleCapture({
          nom: 'notes',
          icone: ICONE.texte,
          defaut: 'Notes',
          source: 'notes',
          contenu: champCapture({
            nom: 'notes',
            libelle: "Ce qu'il faut se rappeler de l'idée",
            type: 'textarea',
          }),
        }),
      );
    }
  }

  if (nature === 'objectif') {
    pastilles.push(
      pastilleCapture({
        nom: 'pourquoi',
        icone: ICONE.texte,
        defaut: 'Le pourquoi',
        source: 'cible',
        contenu: `${champCapture({ nom: 'pourquoi', libelle: 'Pourquoi ? (relu les jours sans motivation)', type: 'textarea' })}
          ${champCapture({ nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' })}`,
      }),
    );
  }

  return `
    <div class="fenetre-fond capture-fond" data-fermer-fenetre></div>
    <form class="capture" data-action="creer-depuis-calendrier" role="dialog" aria-modal="true"
      aria-label="Poser au calendrier">
      <input type="hidden" name="nature" value="${echapper(nature)}">
      <input type="text" id="cal-titre" name="titre" required class="capture-titre"
        value="${echapper(valeurs.titre ?? '')}"
        placeholder="${echapper(INVITE_TITRE[nature])}" autocomplete="off"
        aria-label="${echapper(INVITE_TITRE[nature])}">

      <div class="capture-pastilles">
        <div class="capture-pastilles-liste">${[
          ...pastilles,
          ...(natureEnDernier ? [pastilleNature] : []),
        ]
          .map((p) => p.pastille)
          .join('')}</div>
        <button type="submit" class="capture-envoyer" aria-label="Poser au calendrier"
          title="Poser au calendrier">${FLECHE_ENVOI}</button>
      </div>

      <!-- Les panneaux vivent ici, hors de la bande : elle défile, et son
           débordement masqué les découperait. Ils se posent au-dessus. -->
      ${[...pastilles, ...(natureEnDernier ? [pastilleNature] : [])]
        .map((p) => p.panneau)
        .join('')}

      <p class="message-erreur" data-erreur hidden></p>
    </form>`;
}

// Le comportement des pastilles, branché une fois par espace. Il ne touche
// qu'au DOM : ouvrir un panneau n'écrit rien dans l'état de l'espace, donc rien
// ne se redessine et aucune saisie ne se perd.
export function brancherCapture(section) {
  const panneaux = () => [...section.querySelectorAll('.capture-popover')];

  const fermerLesPanneaux = () => {
    for (const panneau of panneaux()) {
      panneau.hidden = true;
      section
        .querySelector(`[data-pastille="${panneau.dataset.panneau}"]`)
        ?.setAttribute('aria-expanded', 'false');
    }
  };

  // Le libellé d'une pastille EST la valeur de son champ, quand il y en a une.
  // C'est ce qui permet de relire toute la fiche sans ouvrir un seul panneau.
  const rafraichirLesLibelles = () => {
    for (const pastille of section.querySelectorAll('.capture-pastilles [data-pastille]')) {
      const source = pastille.dataset.source;
      if (!source) continue;

      const champ = section.querySelector(`.capture [name="${source}"]`);
      const libelle = pastille.querySelector('[data-libelle]');
      if (!champ || !libelle) continue;

      // La valeur neutre ne compte pas pour renseignée : la pastille garde son
      // libellé, et son encre discrète.
      const neutre = pastille.dataset.neutre;
      let texte = '';
      if (neutre !== undefined && champ.value === neutre) {
        texte = '';
      } else if (champ.type === 'hidden') {
        // Un champ caché ne porte qu'une clé : son libellé se relit dans la
        // liste de choix, là où il est écrit en toutes lettres. Une valeur vide
        // (« Une seule fois ») vaut le libellé par défaut de la pastille.
        texte = champ.value
          ? section
              .querySelector(
                `[data-choix="${source}"][data-valeur="${CSS.escape(champ.value)}"] span:last-child`,
              )
              ?.textContent.trim() ?? ''
          : '';
      } else if (champ.type === 'date') {
        texte = champ.value ? echeanceLisible(depuisDateISO(champ.value)) : '';
      } else if (champ.dataset.formatDuree !== undefined) {
        // Un nombre de minutes se relit en heures : la pastille dit « 1 h 30 »,
        // pas « 90 ».
        texte = dureeLisible(champ.value);
      } else {
        texte = champ.value.trim();
      }

      const heure = pastille.dataset.sourceHeure
        ? section.querySelector(`.capture [name="${pastille.dataset.sourceHeure}"]`)?.value
        : '';
      if (texte && heure) texte = `${texte}, ${heure}`;

      // La durée se dit derrière l'heure, et seulement derrière elle : sans
      // heure, il n'y a pas de créneau, et l'écriture l'écarte de toute façon.
      const combien = pastille.dataset.sourceDuree
        ? dureeLisible(
            section.querySelector(`.capture [name="${pastille.dataset.sourceDuree}"]`)?.value,
          )
        : '';
      if (texte && heure && combien) texte = `${texte} · ${combien}`;

      libelle.textContent = texte || pastille.dataset.defaut;
      pastille.classList.toggle('remplie', Boolean(texte));
    }
    marquerLeDebordement();
  };

  // De quel côté la bande a-t-elle encore de la réserve ? La feuille de style
  // pose un fondu du bon côté, et seulement là où il reste à voir.
  const marquerLeDebordement = () => {
    const bande = section.querySelector('.capture-pastilles-liste');
    if (!bande) return;
    bande.classList.toggle('deborde-avant', bande.scrollLeft > 1);
    bande.classList.toggle(
      'deborde-apres',
      bande.scrollLeft + bande.clientWidth < bande.scrollWidth - 1,
    );
  };

  // Toucher une pastille ou un choix ne doit pas retirer le curseur du titre :
  // c'est ce qui referme le clavier du téléphone, et la tuile se replace alors
  // dans un écran redevenu grand — elle saute. `pointerdown` est le moment où
  // le navigateur décide de déplacer le focus ; l'annuler suffit, le clic suit
  // son cours. Les champs de date et d'heure ne sont pas dans la liste : eux
  // ont besoin du focus.
  section.addEventListener('pointerdown', (evenement) => {
    const garderLeClavier = evenement.target.closest(
      '.capture [data-pastille], .capture [data-choix], .capture [data-nature-creation],\n       .capture [data-poser-duree], .capture-envoyer',
    );
    if (garderLeClavier) evenement.preventDefault();
  });

  section.addEventListener('click', (evenement) => {
    // Les menus DÉROULANTS DES FORMULAIRES, d'abord : ils n'ont rien à voir
    // avec les pastilles de la tuile, mais c'est le même écouteur qui reçoit
    // leurs clics. Un espace n'appelle `brancherChoix` que s'il n'a pas de
    // tuile — le site du FCH est le seul dans ce cas.
    const declencheurChoix = evenement.target.closest('[data-ouvrir-choix]');
    if (declencheurChoix) {
      basculerChoixDeFormulaire(declencheurChoix, section);
      return;
    }

    // Une proposition de durée écrit dans le champ en minutes, et rien de plus :
    // le panneau RESTE ouvert, parce qu'on vient souvent d'un raccourci qu'on
    // corrige ensuite à la main (« 2 h » puis 105). C'est l'inverse d'un choix
    // dans une liste, qui referme parce qu'il n'y a plus rien à dire.
    const proposition = evenement.target.closest('[data-poser-duree]');
    if (proposition) {
      const champ = section.querySelector('.capture [data-champ-duree]');
      if (champ) {
        champ.value = proposition.dataset.poserDuree;
        marquerLaDuree(section, champ.value);
        rafraichirLesLibelles();
      }
      return;
    }

    // Un choix dans une liste : il écrit dans son champ caché, marque la ligne,
    // referme le panneau. Le formulaire n'a jamais su qu'il y avait autre chose
    // qu'un champ derrière.
    const choix = evenement.target.closest('[data-choix]');
    if (choix) {
      // Deux endroits portent des choix, et ils ne rangent pas leur valeur au
      // même endroit : la tuile a UN champ caché par pastille, quelque part
      // dans le formulaire ; un champ de formulaire porte le sien dans son
      // propre groupe. On reconnaît le second à son enveloppe.
      if (choix.closest('[data-choix-champ]')) {
        poserLeChoix(choix);
        return;
      }

      const { choix: nom, valeur } = choix.dataset;
      const champ = section.querySelector(`.capture [name="${nom}"]`);
      if (champ) champ.value = valeur;

      for (const frere of section.querySelectorAll(`[data-choix="${nom}"]`)) {
        const actif = frere === choix;
        frere.classList.toggle('actif', actif);
        frere.setAttribute('aria-pressed', String(actif));
      }

      // Les pastilles qui n'existent que pour un projet suivent le choix : le
      // type de moment apparaît quand on pose l'événement chez Yuno, et
      // disparaît sinon. Sa valeur reste dans son champ caché — les lecteurs
      // du formulaire l'ignorent quand le projet n'est pas le sien.
      if (nom === 'projet') {
        for (const conditionnelle of section.querySelectorAll('.capture [data-si-projet]')) {
          conditionnelle.hidden = valeur !== conditionnelle.dataset.siProjet;
        }
      }

      fermerLesPanneaux();
      rafraichirLesLibelles();
      return;
    }

    const pastille = evenement.target.closest('.capture-pastilles [data-pastille]');
    if (pastille) {
      const panneau = section.querySelector(
        `.capture-popover[data-panneau="${pastille.dataset.pastille}"]`,
      );
      const ouvert = !panneau.hidden;
      fermerLesPanneaux();
      panneau.hidden = ouvert;
      pastille.setAttribute('aria-expanded', String(!ouvert));
      if (!ouvert) panneau.querySelector('input, select, textarea')?.focus();
      return;
    }

    // Un clic ailleurs dans la tuile referme le panneau ouvert. Les boutons des
    // panneaux se sont déjà servis — ils portent leurs propres écouteurs dans
    // l'espace, et ce clic-ci arrive après eux.
    if (evenement.target.closest('.capture') && !evenement.target.closest('.capture-popover')) {
      fermerLesPanneaux();
    }
  });

  // Taper une durée à la main éteint la proposition qui était allumée : le
  // bouton « 2 h » ne doit pas rester marqué quand le champ dit 105.
  const suivreLaDuree = (evenement) => {
    if (evenement.target.closest?.('[data-champ-duree]')) {
      marquerLaDuree(section, evenement.target.value);
    }
    rafraichirLesLibelles();
  };

  section.addEventListener('input', suivreLaDuree);
  section.addEventListener('change', suivreLaDuree);
  section.addEventListener(
    'scroll',
    (evenement) => {
      if (evenement.target.closest?.('.capture-pastilles-liste')) marquerLeDebordement();
    },
    true,
  );
  window.addEventListener('resize', marquerLeDebordement);

  // Appelé après chaque rendu de l'espace : la tuile vient d'être réécrite.
  return () => {
    rafraichirLesLibelles();
    section.querySelector('#cal-titre')?.focus();
  };
}

// Ce qu'un élément devient quand on le supprime, dit par son verbe. Une relance
// n'est pas une ligne à effacer : c'est une date qu'on retire d'une fiche.
const VERBE_SUPPRESSION = {
  evenement: "Supprimer l'événement",
  tache: 'Supprimer la tâche',
  publication: 'Supprimer la publication',
  objectif: "Supprimer l'objectif et ses jalons",
  jalon: 'Supprimer le jalon',
  commande: 'Supprimer la commande',
  relance: 'Retirer du calendrier',
};

// Ce qui se corrige depuis le calendrier, par nature. Une date mal posée se
// répare : la supprimer pour la recréer ferait perdre tout le reste de la
// fiche. Les champs qui n'ont pas de sens ici — le statut d'une tâche, le
// pourquoi d'un objectif — restent gérés dans leur espace.
function champsDeModification(element) {
  const ligne = element.source ?? {};

  if (element.type === 'evenement') {
    const debut = new Date(ligne.date_debut);
    const sansHeure = debut.getHours() === 0 && debut.getMinutes() === 0;
    return [
      { nom: 'titre', libelle: 'Quoi', type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'Du', type: 'date', requis: true, valeur: versDateISO(debut) },
      {
        nom: 'heure',
        libelle: 'À quelle heure (vide = toute la journée)',
        type: 'time',
        valeur: sansHeure
          ? ''
          : `${String(debut.getHours()).padStart(2, '0')}:${String(debut.getMinutes()).padStart(2, '0')}`,
      },
      {
        nom: 'fin',
        libelle: "Jusqu'au (vide = un seul jour)",
        type: 'date',
        valeur: ligne.date_fin ? versDateISO(new Date(ligne.date_fin)) : '',
      },
      {
        nom: 'duree',
        libelle: 'Combien de temps (si une heure est donnée)',
        type: 'choix',
        options: DUREES,
        valeur: String(
          ligne.date_fin && versDateISO(new Date(ligne.date_fin)) === versDateISO(debut)
            ? Math.round((new Date(ligne.date_fin) - debut) / 60000)
            : 120,
        ),
      },
      {
        nom: 'recurrence',
        libelle: 'Se répète',
        type: 'choix',
        options: RECURRENCES,
        valeur: ligne.recurrence ?? '',
      },
      {
        nom: 'recurrence_fin',
        libelle: 'Se répète jusqu\'au (facultatif)',
        type: 'date',
        valeur: ligne.recurrence_fin ?? '',
      },
      // Un événement photo porte le type du moment qui en naîtra ; les autres
      // projets n'ont pas ce champ, et le corriger n'a de sens que chez Yuno.
      ...(element.projet === 'photo'
        ? [{
            nom: 'type_moment',
            libelle: 'Type de moment',
            type: 'choix',
            options: TYPES_MOMENT_CAL,
            valeur: ligne.type_moment ?? 'match',
          }]
        : []),
      // Et un événement fch porte sa face réunion : l'objet — vide = pas une
      // réunion — et qui l'anime (demande de Noé, 21 août 2026).
      ...(element.projet === 'fch'
        ? [
            {
              nom: 'reunion_objet',
              libelle: 'Réunion (son objet)',
              type: 'choix',
              options: { '': 'Pas une réunion', ...REUNION_OBJETS },
              valeur: ligne.reunion_objet ?? '',
            },
            {
              nom: 'reunion_animee',
              libelle: "J'anime la réunion",
              type: 'checkbox',
              valeur: Boolean(ligne.reunion_animee),
            },
          ]
        : []),
      { nom: 'lieu', libelle: 'Où', type: 'text', valeur: ligne.lieu ?? '' },
      { nom: 'notes', libelle: 'Notes', type: 'textarea', valeur: ligne.notes ?? '' },
    ];
  }

  if (element.type === 'publication') {
    return [
      { nom: 'titre', libelle: "L'idée", type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'Prévue le', type: 'date', requis: true, valeur: ligne.date_prevue },
      { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: RESEAUX, valeur: ligne.reseau },
      { nom: 'format', libelle: 'Format', type: 'choix', options: FORMATS, valeur: ligne.format },
      {
        nom: 'recurrence',
        libelle: 'Se répète',
        type: 'choix',
        options: RECURRENCES,
        valeur: ligne.recurrence ?? '',
      },
      {
        nom: 'recurrence_fin',
        libelle: "Se répète jusqu'au (facultatif)",
        type: 'date',
        valeur: ligne.recurrence_fin ?? '',
      },
    ];
  }

  if (element.type === 'objectif') {
    return [
      { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'Échéance', type: 'date', requis: true, valeur: ligne.echeance },
      { nom: 'pourquoi', libelle: 'Pourquoi ?', type: 'textarea', valeur: ligne.pourquoi ?? '' },
      { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text', valeur: ligne.cible ?? '' },
    ];
  }

  if (element.type === 'commande') {
    return [
      { nom: 'titre', libelle: 'Commande', type: 'text', requis: true, valeur: ligne.titre },
      { nom: 'debut', libelle: 'À livrer pour', type: 'date', requis: true, valeur: ligne.echeance },
      { nom: 'client', libelle: 'Client', type: 'text', valeur: ligne.client ?? '' },
    ];
  }

  if (element.type === 'relance') {
    return [
      {
        nom: 'titre',
        libelle: `Prochaine action avec ${ligne.nom ?? ''}`,
        type: 'text',
        requis: true,
        valeur: ligne.prochaine_action ?? '',
      },
      { nom: 'debut', libelle: 'Quand', type: 'date', requis: true, valeur: ligne.prochaine_action_date },
    ];
  }

  // Tâche et jalon : un titre et une échéance, rien de plus ici.
  return [
    { nom: 'titre', libelle: 'Quoi', type: 'text', requis: true, valeur: ligne.titre },
    { nom: 'debut', libelle: 'Échéance', type: 'date', requis: true, valeur: ligne.echeance },
  ];
}

// Tout ce qui occupe un jour, y compris ce qui ne fait qu'y passer : un
// événement de trois jours appartient à chacun des trois.
export function elementsDuJour(elements, cle) {
  return elements.filter((element) => {
    const debut = versDateISO(element.date);
    const fin = element.jusqua && element.jusqua > debut ? element.jusqua : debut;
    return cle >= debut && cle <= fin;
  });
}

// Ce qu'un jour contient, ligne à ligne. Chaque ligne mène au détail de son
// élément — c'est le chemin qu'on cherchait en cliquant. Deux écrans s'en
// servent : la fenêtre du « +N » et la journée de l'accueil.
function lignesDuJour(elements, montrerProjet) {
  if (!elements.length) return `<p class="vide">Rien ce jour-là.</p>`;

  return `<ul class="cal-journee">${elements
    .map(
      (element) => `
    <li>
      <button type="button" class="cal-journee-ligne"
        data-element="${echapper(element.type)}:${echapper(element.id)}"
        ${montrerProjet ? `data-projet="${echapper(element.projet)}"` : ''}>
        <span class="etiquette">${TYPES[element.type]}</span>
        <span class="cal-journee-titre">${echapper(element.titre)}</span>
        ${
          element.quand
            ? `<span class="discret cal-journee-quand">${echapper(element.quand)}</span>`
            : ''
        }
      </button>
    </li>`,
    )
    .join('')}</ul>`;
}

// La journée dépliée, quand le « +N » est ouvert.
export function fenetreJour(cle, elements, { montrerProjet = false } = {}) {
  const jour = depuisDateISO(cle);
  const lisible = jour.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return construireFenetre(
    lisible,
    `<h3 class="fenetre-titre">${echapper(lisible)}</h3>${lignesDuJour(elements, montrerProjet)}`,
  );
}

// L'état d'une publication se règle DEPUIS LA TUILE (demande de Noé, 25 août
// 2026) : le calendrier de l'accueil montre ce qui part cette semaine, c'est là
// qu'on constate qu'un visuel est prêt ou qu'un post est sorti.
//
// C'est une PASTILLE, à la suite de celles de l'en-tête — nature, projet, état
// (Noé, le même jour) : les trois disent ce QU'EST la publication, elles se
// lisent ensemble. Celle-ci s'ouvre en menu déroulant, dessiné comme tous les
// choix du hub depuis le 14 août 2026 (jamais le `<select>` du système), et le
// même écouteur l'ouvre (`data-ouvrir-choix`, brancherCapture).
//
// Pas de case à cocher : elle ne dit que fait/pas fait, et le club a trois
// états. Cocher ferait sauter « à programmer », le seul qui distingue un visuel
// qui attend sa date d'un visuel qui n'existe pas encore. Le rond de la barre,
// lui, avance d'un cran : c'est le geste rapide ; celui-ci est le geste complet
// — n'importe quel état, y compris en arrière.

// La couleur de l'étape. Trois arrêts — rouge, ambre, vert — et ce qu'il y a
// entre eux si le cycle compte plus de trois pas (Yuno en a cinq). Seule la
// TEINTE voyage jusqu'au CSS : la saturation et la clarté y sont réglées une
// fois par thème, sinon la même pastille serait illisible en clair ou en
// sombre.
//
// Rouge et vert dans un hub qui refuse les couleurs d'alerte : ce n'est pas
// une contradiction. Ces couleurs ne jugent pas une échéance et ne bougent pas
// toutes seules — elles disent une étape de fabrication, celle que Noé a posée
// lui-même. Aucune date, aucun compteur ne les porte.
const TEINTES_ETAPE = [8, 38, 145];

function teinteDeLEtape(rang, total) {
  if (total <= 1) return TEINTES_ETAPE[TEINTES_ETAPE.length - 1];

  const place = (rang / (total - 1)) * (TEINTES_ETAPE.length - 1);
  const bas = Math.floor(place);
  const haut = Math.min(bas + 1, TEINTES_ETAPE.length - 1);
  return Math.round(TEINTES_ETAPE[bas] + (TEINTES_ETAPE[haut] - TEINTES_ETAPE[bas]) * (place - bas));
}

function reglageStatut(element) {
  const pub = element.source;
  if (element.type !== 'publication' || !pub) return '';

  const cycle = cyclePublication(element.projet);
  const rang = Math.max(cycle.indexOf(pub.statut), 0);
  const nom = (statut) => echapper(nomDuStatut(element.projet, statut));
  const teinte = (etape) => teinteDeLEtape(etape, cycle.length);

  return `
    <span class="choix-champ cal-statut" data-choix-champ="statut-publication">
      <button type="button" class="etiquette cal-statut-pastille" data-ouvrir-choix
        style="--teinte: ${teinte(rang)};"
        aria-expanded="false" aria-haspopup="listbox"
        aria-label="État : ${nom(pub.statut)} — changer"
        >${nom(pub.statut)}</button>
      <div class="choix-panneau" hidden>
        <ul class="choix-capture">
          ${cycle
            .map(
              (statut, etape) => `
            <li><button type="button" data-statut-pub="${echapper(statut)}"
              class="${statut === pub.statut ? 'actif' : ''}"
              aria-pressed="${statut === pub.statut}"
              ><span class="cal-statut-point" style="--teinte: ${teinte(etape)};"
                aria-hidden="true"></span>${nom(statut)}</button></li>`,
            )
            .join('')}
        </ul>
      </div>
    </span>`;
}

// Les deux gestes de la fenêtre de détail sont des DESSINS depuis le 24 août
// 2026 (demande de Noé) : « Modifier » et « Supprimer l'événement » écrits en
// toutes lettres pesaient plus lourd que ce qu'ils faisaient, dans une fenêtre
// dont le sujet est le titre. Le mot n'est pas perdu — il reste dans `title` au
// survol et dans `aria-label` pour qui écoute.
const CRAYON_DETAIL = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M12 20h9"></path>
  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
</svg>`;

const CORBEILLE = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M4 7h16M10 4h4M9 7v12M15 7v12"></path>
  <path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13"></path>
</svg>`;

// `actions` : du HTML ajouté en tête des boutons du détail. C'est ainsi que le
// site Yuno pose « Préparer » sur un événement — la fenêtre reste commune, et
// le hub comme le FCH ne passent rien.
//
// `champsEnPlus` : des champs ajoutés au formulaire de modification, même
// contrat que `vuesEnPlus` au calendrier. Yuno y met les deux clubs de
// l'affiche, qu'il est le seul à connaître — le hub n'a pas de vivier, il ne
// les voit pas.
export function fenetreDetail(
  element,
  {
    montrerProjet = false,
    edition = false,
    actions = '',
    champsEnPlus = [],
    // Le réglage d'état ne se dessine QUE là où un espace l'écoute — le hub,
    // pour l'instant (accueil et Calendrier). Les deux sites gèrent leur
    // éditorial sur leur propre page ; un bouton sans effet vaut moins que pas
    // de bouton du tout.
    statutModifiable = false,
  } = {},
) {
  const enTete = `
    <span class="tuile-entete">
      <span class="etiquette">${TYPES[element.type]}</span>
      ${
        montrerProjet
          ? `<span class="tuile-projet">${echapper(
              NOMS_PROJETS[element.projet] ?? element.projet,
            )}</span>`
          : ''
      }
      ${statutModifiable ? reglageStatut(element) : ''}
    </span>`;

  if (edition) {
    const contenu = `
      ${enTete}
      ${construireFormulaire({
        id: 'cal-edition',
        libelle: 'Modifier',
        action: 'modifier-depuis-calendrier',
        bouton: 'Enregistrer',
        ouvert: true,
        extra: `<input type="hidden" name="type" value="${echapper(element.type)}">
                <input type="hidden" name="id" value="${echapper(element.id)}">`,
        champs: [...champsDeModification(element), ...champsEnPlus],
      })}
      <button type="button" class="lien-discret bouton-mini" data-annuler-edition>Annuler</button>`;

    return construireFenetre(`Modifier ${element.titre}`, contenu);
  }

  const finit =
    element.jusqua && element.jusqua > versDateISO(element.date)
      ? ` — jusqu'au ${depuisDateISO(element.jusqua).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}`
      : '';

  const contenu = `
    ${enTete}
    <h3 class="cal-detail-titre">${echapper(element.titre)}</h3>
    ${
      element.recurrent
        ? `<p class="discret cal-detail-serie">${echapper(
            RECURRENCES[element.source?.recurrence] ?? 'Se répète',
          )} — modifier ou supprimer agit sur toute la série.</p>`
        : ''
    }
    <p class="discret cal-fenetre-quand">${echapper(
      element.quand ??
        element.date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
    )}${echapper(finit)}</p>
    ${element.detail ? `<p class="cal-detail-ligne">${echapper(element.detail)}</p>` : ''}
    ${element.notes ? `<p class="discret cal-detail-ligne">${echapper(element.notes)}</p>` : ''}
    <div class="cal-detail-actions">
      ${actions}
      <button type="button" class="bouton-icone" data-modifier-element
        title="Modifier" aria-label="Modifier">${CRAYON_DETAIL}</button>
      <button type="button" class="bouton-icone"
        data-supprimer-element="${echapper(element.type)}:${echapper(element.id)}"
        title="${echapper(VERBE_SUPPRESSION[element.type] ?? 'Supprimer')}"
        aria-label="${echapper(
          VERBE_SUPPRESSION[element.type] ?? 'Supprimer',
        )}">${CORBEILLE}</button>
    </div>`;

  return construireFenetre(element.titre, contenu);
}

// --- Écrire ce qu'on vient de poser ------------------------------------------
//
// La tuile est la même partout ; ce qu'elle écrit doit l'être aussi. Cette
// fonction était recopiée dans l'espace Calendrier, et une troisième copie
// allait naître avec le « + » du dashboard — trois endroits où oublier de faire
// suivre un champ. (C'est exactement ce qui s'était produit avec l'heure et la
// priorité d'une tâche : offertes à l'écran, jetées à l'écriture.)
//
// `projetParDefaut` sert aux espaces qui ne demandent pas le projet : le site
// Yuno sait qu'il est chez lui.
export async function poserAuCalendrier(champs, { projetParDefaut = 'photo' } = {}) {
  const titre = champs.titre.trim();
  const projet = champs.projet ?? projetParDefaut;

  if (champs.nature === 'tache') {
    return api.creerTache({
      projet,
      titre,
      recurrence: champs.recurrence || null,
      // Une fin de répétition sans répétition ne veut rien dire.
      recurrence_fin: (champs.recurrence && champs.recurrence_fin) || null,
      // Active d'emblée : le réglage backlog / active est masqué depuis le
      // 13 août, une tâche notée est une tâche à faire.
      statut: 'actif',
      echeance: champs.debut,
      heure: champs.heure || null,
      // Une durée sans heure ne mesure rien : la tâche tient la journée.
      duree: (champs.heure && Number(champs.duree)) || null,
      priorite: Number(champs.priorite) || 4,
    });
  }

  if (champs.nature === 'publication') {
    return api.creerPublication({
      projet,
      titre,
      reseau: champs.reseau,
      format: champs.format,
      // Sans date, c'est une idée : elle rejoint la banque. Une heure sans
      // date ne veut rien dire, elle part avec.
      date_prevue: champs.debut || null,
      heure: (champs.debut && champs.heure) || null,
      // Sans date non plus, rien à répéter — et une fin de répétition sans
      // répétition ne veut rien dire.
      recurrence: (champs.debut && champs.recurrence) || null,
      recurrence_fin: (champs.debut && champs.recurrence && champs.recurrence_fin) || null,
      // Les deux pastilles de Yuno. Le hub ne les offre pas : `champs` ne les
      // porte alors pas, et les colonnes restent nulles.
      pilier: champs.pilier ? Number(champs.pilier) : null,
      notes: champs.notes?.trim() || null,
    });
  }

  if (champs.nature === 'objectif') {
    return api.creerObjectif({
      projet,
      titre,
      pourquoi: champs.pourquoi?.trim() || null,
      cible: champs.cible?.trim() || null,
      echeance: champs.debut,
    });
  }

  // Sans heure, l'événement tient le jour entier : minuit local, et
  // `momentLisible` s'abstient alors d'afficher 00:00.
  const debut = new Date(`${champs.debut}T${champs.heure || '00:00'}`);
  const fin = finDeLEvenement(debut, champs);

  return api.creerEvenement({
    projet,
    titre,
    date_debut: debut.toISOString(),
    date_fin: fin ? fin.toISOString() : null,
    recurrence: champs.recurrence || null,
    recurrence_fin: champs.recurrence_fin || null,
    lieu: champs.lieu?.trim() || null,
    notes: champs.notes?.trim() || null,
    // Le champ existe même quand sa pastille est cachée : seul un événement
    // photo le garde — ailleurs, un type de moment ne veut rien dire.
    type_moment: projet === 'photo' ? champs.type_moment || null : null,
    // Même règle pour la réunion : elle n'existe qu'au FCH. L'objet vide dit
    // « pas une réunion », et l'animation ne survit pas sans objet.
    reunion_objet: projet === 'fch' ? champs.reunion_objet || null : null,
    reunion_animee:
      projet === 'fch' && champs.reunion_objet ? champs.reunion_animee === 'oui' : false,
  });
}
