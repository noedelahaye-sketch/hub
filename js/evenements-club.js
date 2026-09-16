import { echapper, versDateISO } from './format.js';
import { porte } from './partenaires-suivi.js';
import { construireFormulaire } from './gabarits.js';
import { construireAVenir, construirePubliees } from './publications.js';
import {
  assemblerCalendrier, construireBarrePeriode, construireGrille,
} from './calendrier-commun.js';

export const RETROPLANNING = 'https://docs.google.com/spreadsheets/d/1j2T9YDXAL-Wws34A1MJroRaetMOmHTzoaOeDet4Wx84/edit?usp=sharing';
// Dates et communes transcrites du planning officiel 2026/2027.
// Les alternatives restent explicites : aucune date définitive n'est déduite.
export const EVENEMENTS_CLUB = [
  { id: 'petanque-septembre-2026', titre: 'Concours de pétanque', date: '26 septembre 2026', lieu: 'Beaumont' },
  { id: 'tournoi-rose-2026', titre: 'Tournoi rose', date: '17 octobre 2026', lieu: 'Beaumont' },
  { id: 'noel-2026', titre: 'Goûter de Noël et présentation des équipes', date: '19 décembre 2026', lieu: 'Chanos' },
  { id: 'futsal-seniors-2027', titre: 'Tournoi futsal séniors', date: '9 janvier 2027', lieu: 'Mercurol' },
  { id: 'futsal-jeunes-2027', titre: 'Tournoi futsal jeunes', date: '10 janvier 2027', lieu: 'Mercurol' },
  { id: 'loto-2027', titre: 'Loto', date: '13 ou 20 février 2027', lieu: 'Mercurol', incertain: true },
  { id: 'saucisses-2027', titre: 'Matinée saucisses', date: '11 ou 18 avril 2027', lieu: 'Beaumont', incertain: true },
  { id: 'petanque-juin-2027', titre: 'Concours de pétanque', date: '12 juin 2027', lieu: 'Chanos' },
  { id: 'journee-club-2027', titre: 'Journée du club', date: '26 juin 2027', lieu: 'Beaumont' },
];
// LA DATE D'UN ÉVÈNEMENT SE LIT, ELLE N'EST PAS STOCKÉE DEUX FOIS (16 septembre
// 2026). La table ci-dessus écrit ses dates en toutes lettres — c'est la forme du
// planning officiel, et c'est ainsi qu'elles s'affichent. L'accueil du site, lui,
// a besoin de savoir LEQUEL approche : on lit donc la chaîne plutôt que d'ajouter
// une colonne ISO à côté. **Deux écritures d'une même date finissent toujours par
// se contredire**, et c'est celle qu'on regarde le moins qui ment.
//
// UNE DATE INCERTAINE PREND SON PREMIER JOUR (« 13 ou 20 février 2027 » → le 13) :
// c'est la borne la plus tôt, donc celle qui fait apparaître l'évènement à
// l'heure. Se tromper d'une semaine en avance sur un loto est sans conséquence ;
// l'annoncer une semaine trop tard l'est.
const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
  'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function dateDeLEvenement(evenement) {
  const morceaux = (evenement.date ?? '').toLowerCase().split(/\s+/);
  const jour = Number(morceaux.find((mot) => /^\d+$/.test(mot)));
  const mois = MOIS_FR.findIndex((nom) => morceaux.includes(nom));
  const annee = Number(morceaux[morceaux.length - 1]);
  if (!jour || mois === -1 || !annee) return null;
  return new Date(annee, mois, jour);
}

// LE PROCHAIN ÉVÈNEMENT DE LA SAISON, et il reste sien jusqu'au SOIR de son jour :
// la communication d'un évènement se fait aussi pendant. C'est la précaution déjà
// prise pour le temps fort de l'accueil, au mot près.
export function prochainEvenementClub(reference = new Date()) {
  // LA FIN DU JOUR SE CALCULE SUR UNE COPIE : `setHours` MUTE l'objet, et muter
  // pendant qu'on filtre revient à trier ensuite des dates qu'on vient de
  // déplacer. Ça passe tant qu'elles bougent toutes pareil, et ça casse le jour
  // où l'une d'elles ne bouge pas.
  const finDuJour = (date) => new Date(date).setHours(23, 59, 59, 999);
  return EVENEMENTS_CLUB
    .map((evenement) => ({ evenement, quand: dateDeLEvenement(evenement) }))
    .filter(({ quand }) => quand && finDuJour(quand) >= reference.getTime())
    .sort((a, b) => a.quand - b.quand)[0] ?? null;
}

// RELIER UNE LIGNE DE `evenements` À SA FICHE DE SAISON (16 septembre 2026,
// demande de Noé : « le lien de préparer sa com doit mener à la page de
// l'évènement »).
//
// CE SONT DEUX CHOSES, et c'est ce qui rend le lien nécessaire : le TEMPS FORT
// est une ligne en base — elle porte `temps_fort`, elle a un créneau, elle vit au
// calendrier ; la FICHE est une entrée du planning officiel du club, écrite dans
// le dépôt, et c'est elle qui porte la communication.
//
// LE TITRE EST EXCLU COMME CLÉ, et il a fallu le MESURER pour s'en convaincre :
//
//   « Tournoi de pétanque » (base)  ≠  « Concours de pétanque » (planning)
//   « Tournoi Rose »        (base)  ≠  « Tournoi rose »         (planning)
//
// **Deviner sur un titre libre est ce que le hub refuse** — c'est la règle posée
// pour `temps_fort` le 30 août, et celle des écussons de clubs : *un rapprochement
// rejoué à chaque exécution peut changer une destination dans le dos de Noé.*
//
// LA DATE EXACTE D'ABORD. Aucune fiche de la saison ne partage son jour avec une
// autre — vérifié sur les neuf —, donc c'est une clé sûre.
//
// PUIS UNE FENÊTRE DE TROIS JOURS, MAIS SEULEMENT SI ELLE NE TROUVE QU'UNE
// SEULE FICHE. Mesuré : le goûter de Noël est au **18** décembre en base et au
// **19** dans le planning — un écart d'un jour qu'il faudra corriger, mais le
// bouton ne doit pas attendre ça pour marcher. **La garde d'unicité est ce qui
// empêche de deviner** : les deux tournois futsal tombent les 9 et 10 janvier, et
// un temps fort posé sur l'un des deux trouverait DEUX candidates dans la
// fenêtre — on rend alors `null` plutôt que de choisir à la place de Noé.
const FENETRE_FICHE_JOURS = 3;

export function ficheDeLEvenement(evenement, reference = EVENEMENTS_CLUB) {
  const jour = evenement?.date_debut ? new Date(evenement.date_debut) : null;
  if (!jour || Number.isNaN(jour.getTime())) return null;
  jour.setHours(12, 0, 0, 0);

  const ecarts = reference
    .map((fiche) => ({ fiche, quand: dateDeLEvenement(fiche) }))
    .filter(({ quand }) => quand)
    .map(({ fiche, quand }) => {
      const cible = new Date(quand);
      cible.setHours(12, 0, 0, 0);
      return { fiche, jours: Math.round(Math.abs(cible - jour) / 864e5) };
    });

  const memeJour = ecarts.find(({ jours }) => jours === 0);
  if (memeJour) return memeJour.fiche;

  const proches = ecarts.filter(({ jours }) => jours <= FENETRE_FICHE_JOURS);
  return proches.length === 1 ? proches[0].fiche : null;
}

export const rubriqueEvenement = (e) => `Évènement · ${e.titre} · ${e.date}`;
export const estRubriqueEvenement = (rubrique) => EVENEMENTS_CLUB.some((e) => rubriqueEvenement(e) === rubrique);
function repereEvenement(e) {
  const morceaux = e.date.split(' ');
  const mois = morceaux.slice(-2).join(' ');
  const jour = morceaux.slice(0, -2).join(' ');
  return `<span class="evenement-repere"><span class="evenement-jour">${jour}</span><span>${mois}</span></span>`;
}
// LE CALENDRIER D'UN ÉVÈNEMENT (16 septembre 2026, demande de Noé : « pour les
// évènements, dans leur page, je dois avoir un calendrier sur lequel je peux
// prévoir la communication »).
//
// CE QU'IL RÉPARE. La page listait ses publications en trois piles — à venir, les
// idées, les parues — et un formulaire pour en ajouter. On y voyait CE QU'IL Y A,
// jamais QUAND : or la com d'un évènement est d'abord une question de dates —
// l'annonce trois semaines avant, le rappel la veille, le bilan le lendemain. Une
// date se posait donc dans un champ, à l'aveugle, sans voir ce qui l'entoure.
//
// C'EST LA PAGE D'UN PROJET, appliquée ici : une colonne de ce qui attend un
// jour, un calendrier à côté, et l'on glisse de l'une à l'autre. Même dessin,
// même geste, mêmes classes — **un geste qui existe ne se réinvente pas.**
//
// IL NE MONTRE QUE CET ÉVÈNEMENT : ses publications, et l'évènement lui-même
// posé à sa date. Le calendrier du site montre tout le reste, à un onglet de là.
const PIVOT_EVENEMENT = 'evenement-club';

// L'ÉVÈNEMENT SE POSE SUR SA PROPRE GRILLE, et il faut le fabriquer à la main :
// `assemblerCalendrier` ne connaît que les tables du hub, et un évènement de
// saison vit dans une table ÉCRITE (`EVENEMENTS_CLUB`) — c'est le planning
// officiel du club, pas une ligne de base. Sans lui, on programmerait autour d'un
// jour qu'on ne voit pas.
function barreDeLEvenement(evenement) {
  const jour = dateDeLEvenement(evenement);
  if (!jour) return [];
  return [{
    type: PIVOT_EVENEMENT,
    id: evenement.id,
    date: jour,
    titre: evenement.titre,
    espace: 'fch',
    // Ni cochable, ni déplaçable : c'est une date du club, elle ne se glisse pas.
    // `source` absent suffit — `brancherDeplacement` abandonne sans elle.
  }];
}

export function calendrierDeLEvenement(evenement, publications, vue, ancre) {
  const liees = publications.filter((p) => p.rubrique === rubriqueEvenement(evenement));
  const posees = liees.filter((p) => p.date_prevue);
  const elements = [
    ...barreDeLEvenement(evenement),
    ...assemblerCalendrier({ publications: posees }),
  ];

  return `
    ${construireBarrePeriode(vue, ancre, {
      // SEMAINE, MOIS, 3 MOIS. Pas d'année : la com d'un évènement se joue sur
      // quelques semaines autour de lui, et une case par semaine ne saurait pas
      // dire lequel des trois posts du samedi on regarde. Pas d'agenda non plus
      // — il répéterait la liste qui vit juste à côté.
      vues: ['semaine', 'mois', 'trimestre'],
    })}
    <div id="evenement-calendrier">
      ${construireGrille(
        elements,
        new Set(['publication', PIVOT_EVENEMENT]),
        vue,
        ancre,
        { montrerEspace: false, aide: false },
      )}
    </div>`;
}

// CE QUI ATTEND UN JOUR. Les idées de l'évènement, et elles seules : une
// publication déjà datée est SUR la grille, la redire dans la colonne ferait
// deux endroits pour une même chose.
//
// `data-poser` EST CE QUI SE GLISSE, et l'attribut ne se pose que là : c'est lui
// que `brancherPriseEnMain` cherche. Une publication parue ne l'a pas — sa date
// est un fait, pas un projet.
export function colonneAProgrammer(evenement, publications, enMain = null) {
  const idees = publications.filter(
    (p) => p.rubrique === rubriqueEvenement(evenement) && !p.date_prevue && p.statut !== 'publie',
  );

  if (!idees.length) {
    return `<p class="vide">Tout est posé sur le calendrier. Le « + » en note une autre.</p>`;
  }

  return `<ul class="evenement-vivier">${idees.map((idee) => `
    <li class="evenement-tuile${enMain === idee.id ? ' choisie' : ''}"
      data-poser="publication:${echapper(idee.id)}">
      <button type="button" class="evenement-tuile-prendre" data-choisir="${echapper(idee.id)}"
        aria-pressed="${enMain === idee.id ? 'true' : 'false'}">
        <span class="evenement-tuile-titre">${echapper(idee.titre)}</span>
        <span class="discret">Glisse-la sur un jour, ou touche-la puis touche le jour.</span>
      </button>
    </li>`).join('')}</ul>`;
}

export function construireEvenementsClub(selection, publications, reseaux, formats, calendrier = null) {
  const e = EVENEMENTS_CLUB.find((e) => e.id === selection);
  if (!e) return `<section class="bloc fch-sans-tuile"><h2>Les évènements · 2026/2027</h2>
    <div class="fch-hall evenements-galerie">${EVENEMENTS_CLUB.map((item) => {
      const nombre = publications.filter((p) => p.rubrique === rubriqueEvenement(item)).length;
      return porte(`#hermitage/evenements/${item.id}`, item.titre, '',
        `<span class="fch-hall-quoi">${item.lieu}${item.incertain ? ' · Date à confirmer' : ''}</span><span class="fch-hall-quoi">${nombre ? `${nombre} communication${nombre > 1 ? 's' : ''}` : 'Communication à préparer'}</span>`, repereEvenement(item));
    }).join('')}</div></section>`;
  const liees = publications.filter((p) => p.rubrique === rubriqueEvenement(e));
  const idees = liees.filter((p) => !p.date_prevue && p.statut !== 'publie');
  const prevues = liees.filter((p) => p.date_prevue && p.statut !== 'publie');
  const publiees = liees.filter((p) => p.statut === 'publie');
  return `<article class="evenement-fiche">
    <a class="lien-discret projet-club-retour" href="#hermitage/evenements">← Tous les évènements</a>
    <header class="evenement-entete">${repereEvenement(e)}<div>
      <h2>${echapper(e.titre)}</h2><p>${e.lieu}${e.incertain ? ' · Date à confirmer' : ''}</p></div></header>
    <div class="fch-hall evenement-outils">
      <div class="fch-hall-porte"><span class="fch-hall-tete"><span class="fch-hall-nom">La communication</span><span class="fch-hall-compte">${liees.length}</span></span>
        <div class="evenement-bilan"><span><strong>${idees.length}</strong> idées</span><span><strong>${prevues.length}</strong> prévues</span><span><strong>${publiees.length}</strong> publiées</span></div></div>
      <a class="fch-hall-porte" href="${RETROPLANNING}" target="_blank" rel="noopener noreferrer"><span class="fch-hall-tete"><span class="fch-hall-nom">Le rétroplanning</span><span aria-hidden="true">↗</span></span><span class="fch-hall-quoi">Organisation et échéances de l’évènement</span><span class="fch-hall-compte">Google Drive</span></a>
    </div>
    <!-- PROGRAMMER : la colonne de ce qui attend, et la grille. C'est la mise en
         page de la page d'un projet, et l'ORDRE DU DOM est l'ordre de lecture à
         toutes les largeurs — ce qui attend, puis quand. On aurait pu remonter la
         grille sur téléphone, mais il aurait fallu la déplacer par la mise en
         page, et le clavier serait passé dans un ordre que l'œil ne voit pas. -->
    <div class="evenement-programmation${calendrier?.enMain ? ' en-main' : ''}">
      <section class="bloc evenement-colonne">
        <h2>À programmer</h2>
        <div class="evenement-liste">${colonneAProgrammer(e, publications, calendrier?.enMain)}</div>
      </section>

      <section class="bloc evenement-calendrier">
        <h2>Son calendrier</h2>
        ${calendrier
          ? calendrierDeLEvenement(e, publications, calendrier.vue, calendrier.ancre)
          : ''}
      </section>
    </div>

    <section class="bloc evenement-communication"><h2>Préparer la communication</h2>
      <p class="discret">De l’annonce au bilan, toutes les publications de l’évènement.</p>
      ${construireFormulaire({ id: `communication-${e.id}`, action: 'noter-idee', libelle: 'Ajouter une communication', bouton: 'Enregistrer',
        extra: `<input type="hidden" name="rubrique" value="${echapper(rubriqueEvenement(e))}">`,
        champs: [
          { nom: 'titre', libelle: 'Publication à prévoir', type: 'text', requis: true, valeur: `${e.titre} — ` },
          { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: reseaux, valeur: 'instagram' },
          { nom: 'format', libelle: 'Format', type: 'choix', options: formats, valeur: 'carrousel' },
          { nom: 'date_prevue', libelle: 'Date de publication (facultative)', type: 'date' },
          { nom: 'notes', libelle: 'Message, visuels et informations à préparer', type: 'textarea' },
        ] })}
      <!-- LES IDÉES NE SE REDISENT PAS ICI : elles sont dans la colonne « À
           programmer », où elles se posent. Deux listes pour une même chose
           finissent par se contredire, et c'est celle qu'on regarde le moins qui
           ment. Restent ce qui est DATÉ et ce qui est PARU — deux choses que la
           grille montre sans les nommer. -->
      <div class="evenement-publications">${prevues.length || publiees.length
        ? `${prevues.length ? `<h3>À venir</h3>${construireAVenir(prevues, { ouvrable: true, pastille: true })}` : ''}${construirePubliees(publiees, { ouvrable: true })}`
        : '<p class="discret evenement-vide">La première publication commence ici : une annonce, un rappel ou une idée à garder pour plus tard.</p>'}</div>
    </section></article>`;
}
