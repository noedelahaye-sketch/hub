// LA BIBLIOTHÈQUE — deux rayons, un seul code (5 septembre 2026, demande de
// Noé : « fais la même chose que les livres mais pour les films/séries, donc
// dans la page ma bibliothèque mets 2 entrées, 1 pour les livres 1 pour les
// films/séries »).
//
// CE QUI EST PARTAGÉ, ET POURQUOI. Un livre et une série se rangent exactement
// de la même façon : une étagère qu'on balaie du regard, une liste où l'on
// cherche, les mêmes filtres, le même tri, la même note, la même image, le même
// journal de séances, les mêmes phrases gardées. Recopier ces sept cents lignes
// pour changer « page » en « épisode » aurait fabriqué la divergence qu'on passe
// ensuite à rattraper — et c'est toujours l'écran qu'on regarde le moins qui
// finit par mentir.
//
// CE QUI EST PROPRE À CHAQUE RAYON tient donc dans UN objet : ses tables, ses
// mots, ses états, ses colonnes. Tout le reste est écrit une fois.
//
// LES CLASSES RESTENT `.livre-*`, et c'est assumé : ce sont les classes de
// l'ÉTAGÈRE, pas celles du livre — la tuile, la couverture, la jauge, la note.
// Les renommer aurait été une refonte de feuille de style de douze mille lignes
// pour un nom qu'on ne lit jamais.
//
// CE MODULE NE TOUCHE À RIEN : il fabrique du HTML à partir de données déjà
// chargées, comme tous les gabarits du hub. Les gestes vivent dans js/perso.js
// (l'étagère) et js/fiche-oeuvre.js (la page d'une œuvre).

import * as api from './api.js';
import { SIGNES as SIGNE } from './gabarits.js';
import { avanceeDeLOeuvre } from './orientation.js';
import { echapper } from './format.js';

// --- LES DEUX RAYONS ---------------------------------------------------------

// LES THÈMES D'UN LIVRE (2 septembre 2026). La liste vient de la bibliothèque
// Notion de Noé, où elle s'était faite d'elle-même : psycho, roman, relation
// humaine, productivité.
//
// LA BASE N'IMPOSE RIEN : pas de CHECK, pas de table. Un thème est un mot qu'on
// se donne, et cette liste n'est qu'une commodité de saisie — elle s'allonge
// sans migration.
export const THEMES_LIVRE = {
  psycho: 'Psycho',
  relation: 'Relation humaine',
  productivite: 'Productivité',
  roman: 'Roman',
  essai: 'Essai',
  biographie: 'Biographie',
  metier: 'Métier',
  autre: 'Autre',
};

// LES GENRES D'UN FILM, même statut que les thèmes : une commodité de saisie,
// rien que la base impose. Un film en porte plusieurs — un policier peut être
// historique.
// LES MOTS SONT CEUX DE SA BASE NOTION (5 septembre 2026, capture à l'appui) :
// Drame, Comédie, Thriller, Histoire, Biopic. Ce sont les genres que Noé emploie
// déjà, et importer sa table en les renommant aurait fait deux vocabulaires pour
// une même bibliothèque. Les six autres complètent, sans rien imposer.
export const GENRES_FILM = {
  comedie: 'Comédie',
  drame: 'Drame',
  thriller: 'Thriller',
  histoire: 'Histoire',
  biopic: 'Biopic',
  romance: 'Romance',
  policier: 'Policier',
  action: 'Action',
  sf: 'SF / Fantastique',
  animation: 'Animation',
  documentaire: 'Documentaire',
  sport: 'Sport',
  autre: 'Autre',
};

// LES COULEURS DISENT UNE VIE D'ŒUVRE, pas un jugement : gris tant qu'elle
// attend, bleu quand elle est ouverte, vert quand elle est finie — et le gris
// revient pour une œuvre REPOSÉE, parce que « reposé » n'est pas un échec
// (règle du 29 août) et ne prendra donc jamais une couleur d'alerte.
//
// Ce sont les trois teintes de l'état d'un projet, aux mêmes rangs : deux
// vocabulaires de couleur pour un même cycle finiraient par se contredire.
const GRIS = 'var(--texte-discret)';
const BLEU = '#5b8dd9';
const VERT = 'var(--famille-corps)';

export const RAYONS = {
  livres: {
    cle: 'livres',
    onglet: 'Livres',
    // La clé du menu discret, des formulaires et des rendus : elle distingue les
    // deux rayons partout où un geste doit savoir de quoi il parle.
    forme: 'livre',
    // `#livre/<id>` — la fiche.
    route: 'livre',
    api: api.rayonLivres,
    // LES CINQ NOMS DE COLONNES QUI CHANGENT d'un rayon à l'autre. Tout le reste
    // — titre, statut, note, commence_le, fini_le — porte le même nom des deux
    // côtés, et n'a donc rien à traduire.
    champs: {
      contributeur: 'auteur',
      total: 'pages',
      image: 'couverture',
      mots: 'themes',
      quantite: 'pages',
      parent: 'livre_id',
      repere: 'page',
    },
    mots: THEMES_LIVRE,
    // Ce que la fiche et la liste offrent à changer, dans l'ordre d'une vie de
    // livre. « Reposé » et non « abandonné » : un livre qu'on lâche n'est pas un
    // échec, et le mot compte.
    etats: { a_lire: 'À lire', en_cours: 'En cours', lu: 'Lu', repose: 'Reposé' },
    // Les mêmes états en minuscules : c'est ce que la tuile écrit à la suite de
    // son thème, dans une phrase de service.
    motsEtat: { a_lire: 'à lire', en_cours: 'en cours', lu: 'lu', repose: 'reposé' },
    couleursEtat: { a_lire: GRIS, en_cours: BLEU, lu: VERT, repose: GRIS },
    // Le tri PAR DÉFAUT : ce qu'on lit, puis ce qui attend, puis ce qui est fini.
    rangEtat: { en_cours: 0, a_lire: 1, lu: 2, repose: 3 },
    fini: 'lu',
    neuf: 'a_lire',
    // Les raccourcis de quantité. Ce ne sont QUE des raccourcis : « autre »
    // ouvre le nombre exact, et une lecture fait rarement un compte rond.
    pas: [10, 25],
    // UNE ŒUVRE SE MESURE-T-ELLE ? Un livre, toujours. Un film, non — on le voit
    // ou on ne le voit pas, il n'a pas d'étapes.
    mesurable: () => true,
    // Les critères de filtre propres au rayon, en plus de l'état, des mots et de
    // la note. Un livre n'en a pas.
    criteresEnPlus: [],
    vocabulaire: {
      un: 'un livre',
      singulier: 'livre',
      pluriel: 'livres',
      ajouter: 'Ajouter un livre',
      modifier: 'Modifier le livre',
      titrePage: 'Livre',
      introuvable: "Ce livre n'existe plus.",
      vide: "Tes livres s'écriront ici. Même ceux que tu n'as pas finis.",
      videFiltre: `Aucun livre ne répond à ça. Retire un filtre,
        ou change le mot cherché.`,
      comment: 'Comment voir tes livres',
      chercherNom: 'Chercher un livre',
      chercherInvite: 'Chercher un titre, un auteur',
      contributeur: 'Auteur',
      contributeurFacultatif: 'Auteur (facultatif)',
      unite: 'page',
      unites: 'pages',
      uniteFaite: 'page lue',
      unitesFaites: 'pages lues',
      parJour: 'par jour de lecture',
      jourDe: 'jour de lecture',
      joursDe: 'jours de lecture',
      rythme: 'pages par jour lu',
      totalLibelle: 'Nombre de pages (facultatif)',
      imagePoser: 'Couverture (facultatif)',
      imageChanger: 'Changer la couverture',
      motsLibelle: 'Thèmes',
      motSingulier: 'thème',
      motsCritere: 'Thème',
      etatLibelle: 'Où il en est',
      noteLibelle: 'Ta note (une fois lu)',
      finiGeste: "Je l'ai fini",
      journal: 'Le journal de lecture',
      journalVide: `Aucune page notée. Le premier soir compté
        s'écrira ici.`,
      citations: 'Les phrases gardées',
      citationAjouter: 'Garder une phrase',
      citationChamp: 'La phrase',
      citationVide: `Aucune phrase gardée. C'est ce qui reste d'un livre
        six mois après, plus que la note.`,
      repereLibelle: 'Page (facultatif)',
      repereType: 'number',
      // Ce qui précède le repère quand on relit une phrase : « — p. 132 ».
      reperePrefixe: 'p. ',
      quantiteTitre: 'Combien de pages',
      quantiteChamp: 'Pages lues',
      retirerQuantite: 'Retirer ces pages',
    },
  },

  films: {
    cle: 'films',
    onglet: 'Films & séries',
    forme: 'film',
    route: 'film',
    api: api.rayonFilms,
    champs: {
      contributeur: 'realisateur',
      total: 'episodes',
      image: 'affiche',
      mots: 'genres',
      quantite: 'episodes',
      parent: 'film_id',
      repere: 'repere',
    },
    mots: GENRES_FILM,
    etats: { a_voir: 'À voir', en_cours: 'En cours', vu: 'Vu', repose: 'Reposé' },
    motsEtat: { a_voir: 'à voir', en_cours: 'en cours', vu: 'vu', repose: 'reposé' },
    couleursEtat: { a_voir: GRIS, en_cours: BLEU, vu: VERT, repose: GRIS },
    rangEtat: { en_cours: 0, a_voir: 1, vu: 2, repose: 3 },
    fini: 'vu',
    neuf: 'a_voir',
    // Un épisode à la fois, ou la soirée entière : c'est le pas d'une série.
    pas: [1, 3],
    // UN FILM NE SE COMPTE PAS. Lui poser « +1 épisode » serait promettre une
    // progression qu'il n'a pas : il se voit d'un coup, et son seul geste est
    // « Je l'ai vu ». Une série, elle, se compte comme un livre.
    mesurable: (oeuvre) => oeuvre.nature === 'serie',
    natures: { film: 'Film', serie: 'Série' },
    // LA NATURE EST UN CRITÈRE, et c'est ce qui permet de tenir les deux dans un
    // seul rayon : « montre-moi mes séries » est une question qu'on se pose, et
    // deux entrées de plus dans le menu auraient coupé en deux ce qui se range
    // ensemble.
    criteresEnPlus: [{ cle: 'nature', nom: 'Nature', champ: 'nature', source: 'natures' }],
    vocabulaire: {
      un: 'un film ou une série',
      singulier: 'titre',
      pluriel: 'titres',
      ajouter: 'Ajouter un film ou une série',
      modifier: 'Modifier',
      titrePage: 'Film',
      introuvable: "Ce film n'existe plus.",
      vide: "Tes films et tes séries s'écriront ici. Même ceux que tu n'as pas finis.",
      videFiltre: `Rien ne répond à ça. Retire un filtre,
        ou change le mot cherché.`,
      comment: 'Comment voir tes films',
      chercherNom: 'Chercher un film ou une série',
      chercherInvite: 'Chercher un titre, un réalisateur',
      contributeur: 'Réalisateur',
      contributeurFacultatif: 'Réalisateur (facultatif)',
      unite: 'épisode',
      unites: 'épisodes',
      uniteFaite: 'épisode vu',
      unitesFaites: 'épisodes vus',
      parJour: 'par soirée',
      jourDe: 'soirée',
      joursDe: 'soirées',
      rythme: 'épisodes par soirée',
      totalLibelle: "Nombre d'épisodes (pour une série)",
      imagePoser: 'Affiche (facultatif)',
      imageChanger: "Changer l'affiche",
      motsLibelle: 'Genres',
      motSingulier: 'genre',
      motsCritere: 'Genre',
      etatLibelle: 'Où tu en es',
      noteLibelle: 'Ta note (une fois vu)',
      finiGeste: "Je l'ai vu",
      journal: 'Le journal de visionnage',
      journalVide: `Aucun épisode noté. La première soirée comptée
        s'écrira ici.`,
      citations: 'Les répliques gardées',
      citationAjouter: 'Garder une réplique',
      citationChamp: 'La réplique',
      citationVide: `Aucune réplique gardée. C'est ce qui reste d'un film
        six mois après, plus que la note.`,
      // Un texte libre et non un entier : une réplique ne se situe pas à une
      // page mais à un moment — « 1 h 12 », « S2E4 ».
      repereLibelle: 'Où ? (facultatif) — « 1 h 12 », « S2E4 »',
      repereType: 'text',
      reperePrefixe: '',
      quantiteTitre: "Combien d'épisodes",
      quantiteChamp: 'Épisodes vus',
      retirerQuantite: 'Retirer ces épisodes',
    },
  },
};

// --- Les petits outils du rayon ----------------------------------------------

// L'avancée d'une œuvre, dans les mots de son rayon.
export const avancee = (R, oeuvre, seances) =>
  avanceeDeLOeuvre(oeuvre, seances, {
    parent: R.champs.parent,
    quantite: R.champs.quantite,
    total: R.champs.total,
    fini: R.fini,
  });

export const contributeurDe = (R, oeuvre) => oeuvre[R.champs.contributeur] ?? null;
export const totalDe = (R, oeuvre) => oeuvre[R.champs.total] ?? null;
export const imageDe = (R, oeuvre) => oeuvre[R.champs.image] ?? null;
export const motsDe = (R, oeuvre) => oeuvre[R.champs.mots] ?? [];

function pluriel(nombre, singulier, plurielMot = `${singulier}s`) {
  return `${nombre} ${nombre > 1 ? plurielMot : singulier}`;
}

function etoiles(note) {
  if (!note) return '';
  return `<span class="livre-note" role="img" aria-label="${note} sur 5">${'★'.repeat(
    note,
  )}${'☆'.repeat(5 - note)}</span>`;
}

// Le dernier soir où l'on a ouvert une œuvre. Sert à ranger celles qui sont en
// cours : celle qu'on a reprise hier passe devant celle qu'on a laissée il y a
// un mois. Une chaîne vide pour une œuvre sans séance — elle ferme la marche,
// ce qui est juste.
function derniereFois(R, oeuvre, seances) {
  return seances
    .filter((seance) => seance[R.champs.parent] === oeuvre.id)
    .reduce((plus, seance) => (seance.jour > plus ? seance.jour : plus), '');
}

// --- CE QU'ON EST EN TRAIN DE LIRE OU DE REGARDER ----------------------------
//
// C'est le seul endroit de la page où l'on AGIT — noter des pages, garder une
// phrase, déclarer fini —, et ce sont les seules œuvres sur lesquelles ces
// gestes aient un sens. Les mettre en tête, c'est mettre le geste avant
// l'inventaire.
export function oeuvreDuHaut(R, oeuvre, seances, urls = {}, menuDiscret) {
  const V = R.vocabulaire;
  const { lues, part, rythme } = avancee(R, oeuvre, seances);
  const citation = (oeuvre.citations ?? []).at(-1);
  const chemin = imageDe(R, oeuvre);
  const url = chemin ? urls[chemin] : null;
  const total = totalDe(R, oeuvre);
  const contributeur = contributeurDe(R, oeuvre);
  const compte = R.mesurable(oeuvre);

  return `
    <article class="livre-encours${url ? ' avec-couverture' : ''}"
      data-oeuvre="${echapper(oeuvre.id)}">
      ${
        // L'ŒUVRE EN COURS PORTE SON IMAGE EN GRAND, à gauche de tout le reste :
        // c'est celle qu'on ouvre ce soir, et la seule image de la page qui
        // mérite d'occuper de la place. Les autres tiennent en vignette dans
        // l'étagère.
        url
          ? `<span class="livre-encours-couverture"><img src="${echapper(url)}"
              alt="" loading="lazy" decoding="async"></span>`
          : ''
      }
      <!-- TOUT LE RESTE DANS UNE ENVELOPPE, et pas seulement quand il y a une
           image : deux structures selon les données finissent par diverger.
           Sans elle, les six enfants du bloc étaient six éléments de grille — la
           couverture ne pouvait pas se poser À CÔTÉ d'eux, seulement à côté du
           PREMIER, et un blanc de cent pixels s'ouvrait sous le titre. -->
      <div class="livre-encours-corps">
      <a class="livre-titre livre-titre-porte"
        href="#${R.route}/${encodeURIComponent(oeuvre.id)}">${echapper(oeuvre.titre)}</a>
      ${contributeur ? `<span class="livre-auteur">${echapper(contributeur)}</span>` : ''}

      ${
        part === null
          ? ''
          : `<span class="livre-jauge" role="img" aria-label="${lues} ${echapper(
              V.unites,
            )} sur ${total}"><i style="width:${Math.round(part * 100)}%"></i></span>`
      }

      <span class="livre-ligne">
        <span class="discret">${
          compte
            ? `${
                total ? `${lues} sur ${total} ${V.unites}` : pluriel(lues, V.unite)
              }${rythme ? ` · ${rythme} ${V.parJour}` : ''}`
            : echapper(R.natures?.[oeuvre.nature] ?? '')
        }</span>
        ${
          // UN FILM NE SE COMPTE PAS : lui poser « +1 » promettrait une
          // progression qu'il n'a pas. Son seul geste est « Je l'ai vu ».
          compte
            ? `<span class="livre-pas">
                ${R.pas
                  .map(
                    (pas) =>
                      `<button type="button" class="livre-pas-bouton" data-pas="${pas}"
                        data-rayon-de="${R.cle}"
                        data-oeuvre-quantite="${echapper(oeuvre.id)}">+${pas}</button>`,
                  )
                  .join('')}
                <button type="button" class="livre-pas-bouton" data-rayon-de="${R.cle}"
                  data-oeuvre-autre="${echapper(oeuvre.id)}">autre</button>
              </span>`
            : ''
        }
      </span>

      ${
        citation
          ? `<p class="livre-citation">« ${echapper(citation.texte)} »${
              citation[R.champs.repere]
                ? `<span class="discret"> — ${echapper(
                    V.reperePrefixe + citation[R.champs.repere],
                  )}</span>`
                : ''
            }</p>`
          : ''
      }

      <span class="livre-gestes">
        <button type="button" class="lien-discret" data-rayon-de="${R.cle}"
          data-oeuvre-citation="${echapper(oeuvre.id)}"
          >${echapper(V.citationAjouter)}</button>
        <button type="button" class="lien-discret" data-rayon-de="${R.cle}"
          data-oeuvre-fini="${echapper(oeuvre.id)}"
          >${echapper(V.finiGeste)}</button>
      </span>
      </div>
      <!-- L'ŒUVRE EN COURS A SON MENU (2 septembre 2026) : c'est celle qu'on
           voudrait illustrer en premier, et elle était la seule qu'on ne pouvait
           ni modifier ni retirer sans la finir d'abord. -->
      ${menuDiscret(R.forme, oeuvre.id)}
    </article>`;
}

// --- L'ÉTAGÈRE ---------------------------------------------------------------
//
// UNE IMAGE SE RECONNAÎT AVANT DE SE LIRE, et c'est tout l'objet de la forme :
// une liste de titres se parcourt mot à mot, une étagère se balaie du regard.
// C'est le seul écran du hub où l'image passe devant le texte.
//
// UNE ŒUVRE SANS IMAGE GARDE SA PLACE, en tuile pointillée avec son titre — le
// pointillé est déjà le signe du hub pour « déclaré, pas encore rempli », et une
// étagère à trous se lirait comme une bibliothèque incomplète plutôt que comme
// des couvertures qui manquent.
function tuile(R, oeuvre, urls, service, menuDiscret) {
  const chemin = imageDe(R, oeuvre);
  const url = chemin ? urls[chemin] : null;
  const mots = motsDe(R, oeuvre);

  return `
    <li class="livre-tuile${url ? '' : ' livre-sans-couverture'}"
      data-oeuvre="${echapper(oeuvre.id)}">
      <!-- TOUTE LA TUILE MÈNE À SA FICHE : l'étagère COMPARE, la fiche dit tout
           — le journal, les phrases gardées, l'état et la note qu'on y règle.
           C'est la règle des deux rangs, un étage plus bas que les caps. -->
      <a class="livre-tuile-ouvrir" href="#${R.route}/${encodeURIComponent(oeuvre.id)}"
        aria-label="Ouvrir « ${echapper(oeuvre.titre)} »"></a>
      <span class="livre-couverture">
        ${
          url
            // `loading="lazy"` : une étagère de trente titres ne descend pas
            // trente images pour en montrer six.
            ? `<img src="${echapper(url)}" alt="" loading="lazy" decoding="async">`
            : `<span class="livre-couverture-mot">${echapper(oeuvre.titre)}</span>`
        }
      </span>
      <span class="livre-tuile-titre">${echapper(oeuvre.titre)}</span>
      <!-- LE THÈME (OU LE GENRE) SUR LA TUILE. Il passe AVANT l'état et l'auteur :
           c'est ce qui distingue deux œuvres qu'on balaie du regard — on cherche
           « un roman », rarement « un livre à lire ». Un seul s'affiche quand il
           y en a plusieurs, avec leur compte : la tuile fait 109 px, et deux
           pastilles y tiendraient à peine l'une des deux.

           LA PLACE EXISTE TOUJOURS, même vide : les tuiles partagent leurs
           rangées, et une œuvre sans thème ferait remonter son état d'un cran —
           les colonnes ne tomberaient plus en face les unes des autres. -->
      <span class="livre-tuile-theme-place">${
        mots.length
          ? `<span class="livre-theme"
              data-theme="${echapper(mots[0])}"
              title="${echapper(mots.map((m) => R.mots[m] ?? m).join(' · '))}"
              >${echapper(R.mots[mots[0]] ?? mots[0])}${
                mots.length > 1 ? ` +${mots.length - 1}` : ''
              }</span>`
          : ''
      }</span>
      <span class="livre-tuile-service">${echapper(service)}</span>
      ${etoiles(oeuvre.note)}
      ${menuDiscret(R.forme, oeuvre.id)}
    </li>`;
}

// --- LA VUE LISTE : chercher une œuvre précise -------------------------------
//
// DEUX VUES POUR DEUX QUESTIONS, et c'est ce qui justifie la bascule : l'étagère
// répond à « qu'est-ce que j'ai lu » — on la balaie du regard, sans rien
// chercher ; la liste répond à « où est CE titre » — on y vient avec un nom ou
// un critère en tête. Une seule vue aurait mal servi les deux.
//
// LA BASCULE REPREND `.affichages`, le groupe de boutons du calendrier : c'est
// le MÊME geste — choisir ce que la liste montre —, et écrire un troisième
// dessin pour un geste qui en a déjà deux, c'est fabriquer la divergence qu'on
// passe ensuite à rattraper.

// LES CRITÈRES, déduits de ce qui existe. ON N'OFFRE QUE CE QU'ON A : un filtre
// « Biographie » sur une bibliothèque qui n'en compte aucune est une porte sur
// une pièce vide.
function criteresDuRayon(R, oeuvres) {
  const compte = (cle, valeur) =>
    oeuvres.filter((o) =>
      cle === 'mots'
        ? motsDe(R, o).includes(valeur)
        : String(o[cle === 'statut' ? 'statut' : cle] ?? '') === String(valeur),
    ).length;

  const mots = [...new Set(oeuvres.flatMap((o) => motsDe(R, o)))].sort((a, b) =>
    (R.mots[a] ?? a).localeCompare(R.mots[b] ?? b),
  );

  return [
    {
      cle: 'statut',
      nom: 'État',
      options: Object.entries(R.etats)
        .map(([v, mot]) => [v, mot, compte('statut', v)])
        .filter(([, , n]) => n),
    },
    ...R.criteresEnPlus.map((c) => ({
      cle: c.cle,
      nom: c.nom,
      options: Object.entries(R[c.source] ?? {})
        .map(([v, mot]) => [v, mot, compte(c.champ, v)])
        .filter(([, , n]) => n),
    })),
    {
      cle: 'mots',
      nom: R.vocabulaire.motsCritere,
      options: mots.map((v) => [v, R.mots[v] ?? v, compte('mots', v)]),
    },
    {
      cle: 'note',
      nom: 'Note',
      options: [5, 4, 3, 2, 1]
        .map((r) => [String(r), '★'.repeat(r), compte('note', r)])
        .filter(([, , n]) => n),
    },
  ];
}

// CE QU'ON PEUT DEMANDER AU TRI. Chacun rend une clé comparable ; le sens se
// retourne d'un second appui sur la même ligne. « Par défaut » garde l'ordre du
// hub — ce n'est pas une absence de tri, c'est l'ordre de la bibliothèque : ce
// qu'on lit, puis ce qui attend, puis ce qui est fini, la note départageant.
export function trisDuRayon(R) {
  return {
    defaut: { nom: 'Par défaut', cle: null },
    titre: { nom: 'Titre', cle: (o) => o.titre.toLowerCase() },
    contributeur: {
      nom: R.vocabulaire.contributeur,
      cle: (o) => (contributeurDe(R, o) ?? 'zzz').toLowerCase(),
    },
    note: { nom: 'Note', cle: (o) => o.note ?? 0 },
    statut: { nom: 'État', cle: (o) => R.rangEtat[o.statut] ?? 9 },
    mots: {
      nom: R.vocabulaire.motsCritere,
      cle: (o) => motsDe(R, o).map((m) => R.mots[m] ?? m).sort()[0] ?? 'zzz',
    },
  };
}

export function construireBarre(
  R,
  vue,
  filtres,
  oeuvres,
  ouverts = false,
  chip = null,
  tri = { cle: 'defaut', sens: 1 },
) {
  const V = R.vocabulaire;
  const CRITERES = criteresDuRayon(R, oeuvres);
  const TRIS = trisDuRayon(R);

  // CE QU'UN CRITÈRE DIT QUAND IL EST REPLIÉ : son nom seul tant qu'il ne filtre
  // rien, et sinon ce qu'il retient — un seul en toutes lettres, les suivants
  // comptés. Trois valeurs écrites dans une pastille feraient une phrase, et une
  // pastille n'est pas une phrase.
  const resume = (critere) => {
    const choisis = filtres[critere.cle] ?? [];
    if (!choisis.length) return critere.nom;
    const premier = critere.options.find(([v]) => v === choisis[0]);
    const mot = premier ? premier[1] : choisis[0];
    return `${critere.nom} : ${mot}${choisis.length > 1 ? ` +${choisis.length - 1}` : ''}`;
  };

  const actifs = CRITERES.filter((c) => (filtres[c.cle] ?? []).length).length;

  // UNE PASTILLE PAR CRITÈRE, ET SON PANNEAU À COCHER (2 septembre 2026, forme
  // montrée par Noé, Notion à l'appui). ON COCHE PLUSIEURS VALEURS — « les 5
  // étoiles ET les 4 » est une question qu'on se pose, et un choix unique ne
  // savait pas y répondre.
  const critere = (c) => {
    const choisis = filtres[c.cle] ?? [];
    const ouvert = chip === c.cle;
    if (!c.options.length) return '';

    return `<span class="livres-critere">
      <button type="button" class="livres-critere-bouton${choisis.length ? ' actif' : ''}"
        data-critere="${c.cle}" aria-expanded="${ouvert}" aria-haspopup="listbox"
        >${echapper(resume(c))}${SIGNE.chevron}</button>
      ${
        ouvert
          ? `<div class="choix-panneau livres-panneau">
              <ul class="choix-capture">
                ${c.options
                  .map(
                    ([valeur, mot, n]) => `
                  <li><button type="button" data-filtre-oeuvre="${c.cle}"
                    data-valeur="${echapper(valeur)}"
                    class="${choisis.includes(valeur) ? 'actif' : ''}"
                    aria-pressed="${choisis.includes(valeur)}"
                    ><span class="livres-coche" aria-hidden="true">${
                      choisis.includes(valeur) ? SIGNE.coche : ''
                    }</span><span>${echapper(mot)}</span>
                    <span class="discret">${n}</span></button></li>`,
                  )
                  .join('')}
              </ul>
            </div>`
          : ''
      }
    </span>`;
  };

  // LE TRI, DANS LA MÊME RANGÉE : c'est la même question posée deux fois — QUE
  // montre-t-on, et dans QUEL ordre —, et on les règle dans le même mouvement.
  const triChoisi = TRIS[tri.cle] ?? TRIS.defaut;
  const chipTri = `<span class="livres-critere">
    <button type="button" class="livres-critere-bouton${
      tri.cle === 'defaut' ? '' : ' actif'
    }" data-critere="tri" aria-expanded="${chip === 'tri'}" aria-haspopup="listbox"
      >${tri.cle === 'defaut' ? '' : SIGNE[tri.sens > 0 ? 'monte' : 'descend']}${echapper(
        triChoisi.nom,
      )}${SIGNE.chevron}</button>
    ${
      chip === 'tri'
        ? `<div class="choix-panneau livres-panneau">
            <ul class="choix-capture">
              ${Object.entries(TRIS)
                .map(
                  ([cle, { nom }]) => `
                <li><button type="button" data-trier="${cle}"
                  class="${cle === tri.cle ? 'actif' : ''}"
                  aria-pressed="${cle === tri.cle}"
                  ><span class="livres-coche" aria-hidden="true">${
                    cle === tri.cle ? SIGNE.coche : ''
                  }</span><span>${echapper(nom)}</span>${
                    cle === tri.cle && cle !== 'defaut'
                      ? `<span class="discret">${SIGNE[tri.sens > 0 ? 'monte' : 'descend']}</span>`
                      : ''
                  }</button></li>`,
                )
                .join('')}
            </ul>
          </div>`
        : ''
    }
  </span>`;

  return `
    <div class="livres-barre">
      <span class="affichages" role="group" aria-label="${echapper(V.comment)}">
        <button type="button" class="${vue === 'etagere' ? 'actif' : ''}"
          data-vue-oeuvres="etagere" aria-pressed="${vue === 'etagere'}">Étagère</button>
        <button type="button" class="${vue === 'liste' ? 'actif' : ''}"
          data-vue-oeuvres="liste" aria-pressed="${vue === 'liste'}">Liste</button>
      </span>

      <!-- LA RECHERCHE EST TOUJOURS LÀ, dans les deux vues : chercher un titre
           qu'on a en tête n'a pas à commencer par changer de vue.

           PAS D'ÉTIQUETTE AUTOUR (2 septembre 2026) : l'enveloppe était
           l'élément de la rangée, et c'est ELLE qui s'alignait — le champ
           flottait dix pixels plus haut que la bascule d'à côté. -->
      <input type="search" class="livres-recherche" data-recherche-oeuvre
        value="${echapper(filtres.mot ?? '')}" aria-label="${echapper(V.chercherNom)}"
        placeholder="${echapper(V.chercherInvite)}" autocomplete="off">

      <!-- L'ICÔNE OUVRE LA RANGÉE DES CRITÈRES, elle ne les contient pas. **Le
           coût d'accès suit l'intention** : c'est la règle des deux rangs du hub,
           appliquée dans une page. Le COMPTE reste dehors — un filtre posé qu'on
           ne voit plus est une bibliothèque qui ment sur ce qu'elle contient. -->
      <button type="button" class="livres-reglages-bouton${
        actifs || ouverts ? ' actif' : ''
      }" data-ouvrir-filtres aria-expanded="${Boolean(ouverts)}"
        title="Filtrer" aria-label="Filtrer${
          actifs ? ` — ${actifs} critère${actifs > 1 ? 's' : ''} posé${actifs > 1 ? 's' : ''}` : ''
        }">${SIGNE.filtre}${
          actifs ? `<span class="livres-reglages-compte">${actifs}</span>` : ''
        }</button>

      <button type="button" class="livres-reglages-bouton${
        tri.cle === 'defaut' && !ouverts ? '' : ' actif'
      }" data-ouvrir-tri aria-expanded="${chip === 'tri'}"
        title="Trier" aria-label="Trier${
          tri.cle === 'defaut' ? '' : ` — par ${triChoisi.nom.toLowerCase()}`
        }">${SIGNE.tri}</button>
    </div>

    ${
      ouverts
        ? `<div class="livres-criteres">
            ${chipTri}
            <span class="livres-separateur" aria-hidden="true"></span>
            ${CRITERES.map(critere).join('')}
            ${
              actifs
                ? `<button type="button" class="lien-discret livres-tout-voir"
                    data-vider-filtres>Tout revoir</button>`
                : ''
            }
          </div>`
        : ''
    }`;
}

export function oeuvresFiltrees(R, oeuvres, filtres, tri = { cle: 'defaut', sens: 1 }) {
  const TRIS = trisDuRayon(R);
  const mot = (filtres.mot ?? '').trim().toLowerCase();
  // PLUSIEURS VALEURS PAR CRITÈRE : un critère vide ne filtre rien — c'est ce
  // qui permet de les cumuler sans jamais tout écarter.
  const retient = (cle, valeur) => {
    const choisis = filtres[cle] ?? [];
    return !choisis.length || choisis.includes(String(valeur ?? ''));
  };

  return oeuvres
    .filter((o) => {
      if (!retient('statut', o.statut)) return false;
      if (!retient('note', o.note)) return false;
      for (const c of R.criteresEnPlus) if (!retient(c.cle, o[c.champ])) return false;
      if ((filtres.mots ?? []).length && !motsDe(R, o).some((m) => filtres.mots.includes(m))) {
        return false;
      }
      if (!mot) return true;
      // Le titre ET l'auteur : on cherche « Marc Levy » aussi souvent qu'un
      // titre, et demander lequel des deux serait une question de plus.
      return `${o.titre} ${contributeurDe(R, o) ?? ''}`.toLowerCase().includes(mot);
    })
    .sort((a, b) => {
      const choisi = TRIS[tri.cle]?.cle;
      if (choisi) {
        const ga = choisi(a);
        const gb = choisi(b);
        const ecart = typeof ga === 'number' ? ga - gb : String(ga).localeCompare(String(gb));
        // À valeur égale, le titre départage : sans lui, deux œuvres notées 4
        // changeraient de place d'un rendu à l'autre.
        if (ecart) return ecart * tri.sens;
        return a.titre.localeCompare(b.titre);
      }
      return (
        (R.rangEtat[a.statut] ?? 9) - (R.rangEtat[b.statut] ?? 9) ||
        (b.note ?? 0) - (a.note ?? 0) ||
        a.titre.localeCompare(b.titre)
      );
    });
}

// LES COLONNES DE LA LISTE, NOMMÉES ET TRIABLES (2 septembre 2026).
//
// UN EN-TÊTE EST LE TRI À PORTÉE DE COLONNE : le panneau de tri couvre les mêmes
// clés, mais on ne va pas le chercher pour dire « range-moi par auteur » quand le
// mot est là, en face de la colonne. Les deux chemins écrivent le MÊME état — un
// tri qui se réglerait à deux endroits sans s'accorder serait pire que pas
// d'en-tête.
function enTetes(R, tri) {
  const colonnes = [
    { cle: 'titre', nom: 'Nom' },
    { cle: 'mots', nom: R.vocabulaire.motsCritere },
    { cle: 'statut', nom: 'État' },
    { cle: 'note', nom: 'Note' },
    { cle: 'contributeur', nom: R.vocabulaire.contributeur },
  ];

  return `<div class="livres-entetes" role="row">
    ${colonnes
      .map(
        ({ cle, nom }) => `<button type="button" class="livres-entete${
          tri.cle === cle ? ' actif' : ''
        }" data-trier="${cle}"
        aria-label="Trier par ${nom.toLowerCase()}"
        >${echapper(nom)}${
          tri.cle === cle ? SIGNE[tri.sens > 0 ? 'monte' : 'descend'] : ''
        }</button>`,
      )
      .join('')}
    <span class="livres-entete-vide" aria-hidden="true"></span>
  </div>`;
}

// LA LISTE : une ligne par œuvre, les colonnes de la base Notion de Noé — le
// nom, ses thèmes, son état, sa note, son auteur.
//
// TROIS COLONNES SE RÈGLENT SUR PLACE (2 septembre 2026 : « je dois également
// pouvoir modifier directement depuis la vue liste, l'état, la note et le type
// de livre »). Ce sont exactement les trois que la fiche laisse changer d'un
// geste, et pour la même raison : on les corrige souvent, et ouvrir une fiche
// pour chacune ferait vingt allers-retours.
function ligne(R, oeuvre, menuOuvert, menuDiscret) {
  const mots = motsDe(R, oeuvre);
  const courant = oeuvre.statut;

  return `
    <li class="livre-ligne-liste" data-oeuvre="${echapper(oeuvre.id)}">
      <a class="livre-ligne-nom" href="#${R.route}/${encodeURIComponent(oeuvre.id)}"
        >${echapper(oeuvre.titre)}</a>

      <span class="livre-ligne-cellule livre-ligne-themes">
        <button type="button" class="livre-cellule-bouton"
          data-cellule="mots:${echapper(oeuvre.id)}"
          aria-expanded="${menuOuvert === `mots:${oeuvre.id}`}" aria-haspopup="listbox"
          aria-label="${echapper(R.vocabulaire.motsLibelle)} de « ${echapper(oeuvre.titre)} »">${
            mots.length
              ? mots
                  .map(
                    (m) => `<span class="livre-theme" data-theme="${echapper(m)}"
                      >${echapper(R.mots[m] ?? m)}</span>`,
                  )
                  .join('')
              : '<span class="discret">—</span>'
          }</button>
        ${
          menuOuvert === `mots:${oeuvre.id}`
            ? `<div class="choix-panneau livres-panneau">
                <ul class="choix-capture">
                  ${Object.entries(R.mots)
                    .map(
                      ([cle, nom]) => `
                    <li><button type="button" data-poser-mot="${echapper(oeuvre.id)}"
                      data-valeur="${echapper(cle)}"
                      class="${mots.includes(cle) ? 'actif' : ''}"
                      aria-pressed="${mots.includes(cle)}"
                      ><span class="livres-coche" aria-hidden="true">${
                        mots.includes(cle) ? SIGNE.coche : ''
                      }</span><span>${echapper(nom)}</span></button></li>`,
                    )
                    .join('')}
                </ul>
              </div>`
            : ''
        }
      </span>

      <span class="livre-ligne-cellule">
        <!-- LA COULEUR DE L'ÉTAT EST POSÉE EN LIGNE, et non par une règle CSS
             par valeur (5 septembre 2026) : les deux rayons n'ont pas les mêmes
             états — « lu » d'un côté, « vu » de l'autre —, et une feuille de
             style qui les énumère se met à mentir au premier rayon ajouté. La
             table des teintes vit dans le rayon, à côté des mots qu'elle
             colore. -->
        <button type="button" class="livre-cellule-bouton livre-ligne-etat"
          data-cellule="etat:${echapper(oeuvre.id)}" data-etat="${echapper(courant)}"
          aria-expanded="${menuOuvert === `etat:${oeuvre.id}`}" aria-haspopup="listbox"
          aria-label="État de « ${echapper(oeuvre.titre)} »"
          ><span class="cap-etat-point" aria-hidden="true"
            style="--etat: ${R.couleursEtat[courant] ?? GRIS};"></span>${echapper(
            R.etats[courant] ?? courant,
          )}</button>
        ${
          menuOuvert === `etat:${oeuvre.id}`
            ? `<div class="choix-panneau livres-panneau">
                <ul class="choix-capture">
                  ${Object.entries(R.etats)
                    .map(
                      ([cle, nom]) => `
                    <li><button type="button" data-poser-etat="${echapper(oeuvre.id)}"
                      data-valeur="${echapper(cle)}"
                      class="${cle === courant ? 'actif' : ''}"
                      aria-pressed="${cle === courant}"
                      ><span class="livre-ligne-etat" data-etat="${echapper(cle)}"
                        ><span class="cap-etat-point" aria-hidden="true"
                          style="--etat: ${R.couleursEtat[cle] ?? GRIS};"></span></span>${echapper(
                          nom,
                        )}</button></li>`,
                    )
                    .join('')}
                </ul>
              </div>`
            : ''
        }
      </span>

      <!-- LA NOTE SE POSE À L'ÉTOILE, sans menu : cinq cibles valent mieux qu'un
           panneau pour un réglage qui tient sur une ligne. La même étoile
           retouchée l'efface, comme sur la fiche. -->
      <span class="livre-ligne-note" role="group"
        aria-label="Note de « ${echapper(oeuvre.titre)} »">
        ${[1, 2, 3, 4, 5]
          .map(
            (rang) => `<button type="button" class="livre-etoile-ligne"
              data-noter-oeuvre="${echapper(oeuvre.id)}" data-rang="${rang}"
              aria-pressed="${rang <= (oeuvre.note ?? 0)}"
              aria-label="${rang} sur 5">${rang <= (oeuvre.note ?? 0) ? '★' : '☆'}</button>`,
          )
          .join('')}
      </span>

      <span class="livre-ligne-auteur discret">${echapper(contributeurDe(R, oeuvre) ?? '')}</span>
      ${menuDiscret(R.forme, oeuvre.id)}
    </li>`;
}

// --- LE RAYON ENTIER ----------------------------------------------------------

export function construireRayon(R, { oeuvres, seances, urls = {} }, vue, menuDiscret) {
  const V = R.vocabulaire;
  const {
    affichage = 'etagere',
    filtres = {},
    ouverts = false,
    chip = null,
    tri = { cle: 'defaut', sens: 1 },
    cellule = null,
  } = vue;

  const ajout = `
    <button type="button" class="cap-ajout-discret" data-ajout="${R.forme}">
      ${SIGNE.plus}<span>${echapper(V.ajouter)}</span></button>`;

  // LE RETOUR VERS LE HALL : on entre ici par une porte, on doit pouvoir en
  // ressortir. C'est le lien de la fiche d'une œuvre, au trait près — cette page
  // est au troisième rang, et la barre d'onglets n'en dit rien.
  const retour = `
    <p class="projet-page-retour biblio-retour">
      <a href="#perso/bibliotheque">${SIGNE.retour}<span>Ma bibliothèque</span></a>
    </p>`;

  if (!oeuvres.length) {
    return `
      ${retour}
      <p class="vide">${echapper(V.vide)}</p>
      ${ajout}`;
  }

  const barre = construireBarre(R, affichage, filtres, oeuvres, ouverts, chip, tri);
  const retenus = oeuvresFiltrees(R, oeuvres, filtres, tri);

  // CE QUI EST EN COURS OUVRE LES DEUX VUES (2 septembre 2026, demande de Noé :
  // « les livres en cours doivent apparaître au-dessus de l'étagère et la
  // liste ; ils réapparaissent dans l'étagère et dans la liste sous la forme de
  // chacune »).
  //
  // ILS NE SORTENT PAS DU RANG : une bibliothèque doit être COMPLÈTE là où on la
  // parcourt — chercher un titre et ne pas le trouver dans la liste parce qu'il
  // est en haut, c'est un titre manquant.
  const enCours = retenus
    .filter((o) => o.statut === 'en_cours')
    .sort((a, b) => derniereFois(R, b, seances).localeCompare(derniereFois(R, a, seances)));

  const etagere = retenus
    .map((o) => {
      const { lues } = avancee(R, o, seances);
      const service = [
        // LA NATURE NE S'ÉCRIT QUE POUR CE QUI N'EST PAS LE CAS ORDINAIRE :
        // « Série » se dit, « Film » se tait. Mesuré sur les seize films
        // importés le 5 septembre 2026 — le mot s'affichait seize fois et ne
        // distinguait rien, tout en poussant le réalisateur hors de la ligne.
        // C'est la leçon de « en sommeil » sur les habitudes : un mot identique
        // partout est un mot qui occupe de la place.
        o.nature === 'serie' ? R.natures.serie : '',
        R.motsEtat[o.statut] ?? o.statut,
        contributeurDe(R, o) ?? '',
        o.statut === 'repose' && lues ? `${lues} ${V.unitesFaites}` : '',
      ].filter(Boolean);

      return tuile(R, o, urls, service.join(' · '), menuDiscret);
    })
    .join('');

  // LES CARTES PASSENT DEVANT LA BARRE (2 septembre 2026, correction de Noé) :
  // la barre est un RÉGLAGE — comment je veux voir mes livres —, les cartes sont
  // ce qu'on vient FAIRE. On ne met pas le mode d'emploi avant l'objet.
  return `
    ${retour}
    ${enCours.map((o) => oeuvreDuHaut(R, o, seances, urls, menuDiscret)).join('')}
    ${barre}
    ${
      retenus.length
        ? affichage === 'liste'
          ? `${enTetes(R, tri)}
             <ul class="livres-liste-table">${retenus
               .map((o) => ligne(R, o, cellule, menuDiscret))
               .join('')}</ul>`
          : `<ul class="livres-etagere">${etagere}</ul>`
        : `<p class="cap-vide">${echapper(V.videFiltre)}</p>`
    }
    ${ajout}`;
}

// --- LE HALL : ce qu'on lit, puis deux portes ---------------------------------
//
// « Je préférerais que ce soit vraiment 2 portes, donc 2 tuiles cliquables qui
// nous permettent d'aller sur la page des livres ou la page des films/séries.
// Avec un livre en cours sur cette page. » (Noé, 5 septembre 2026.)
//
// CE QUE ÇA RENVERSE, ET IL A RAISON. Les deux rayons ont vécu une heure en
// BASCULE, dans la grammaire de `.affichages` : le geste du calendrier, celui
// qui choisit ce qu'un écran montre. Mais une bascule dit « la même chose, vue
// autrement » — l'étagère et la liste, le mois et la semaine. Or ce ne sont pas
// deux vues d'une même chose : ce sont DEUX BIBLIOTHÈQUES. Une porte le dit,
// une bascule le cachait.
//
// ET ÇA REND SA PLACE À CE QU'ON FAIT. La page ne s'ouvre plus sur un inventaire
// de trente-six titres mais sur ce qu'on lit ce soir — le seul endroit où l'on
// AGIT. Le reste est à un geste de là, ce qui est exactement son rang : on va
// voir sa bibliothèque quand on veut la voir.
export function construireHall(rayons, menuDiscret) {
  // CE QUI EST EN COURS, DES DEUX RAYONS. Noé a écrit « un livre en cours » ;
  // c'est la même carte et le même geste pour une série qu'on suit, et une
  // bibliothèque qui cacherait la série en cours mentirait sur ce qu'elle
  // contient. Les livres passent devant — c'est le rayon nommé.
  const enCours = Object.values(RAYONS).flatMap((R) => {
    const { oeuvres, seances, urls } = rayons[R.cle];
    return oeuvres
      .filter((o) => o.statut === 'en_cours')
      .sort((a, b) => derniereFois(R, b, seances).localeCompare(derniereFois(R, a, seances)))
      .map((o) => oeuvreDuHaut(R, o, seances, urls, menuDiscret));
  });

  return `
    ${
      enCours.length
        ? enCours.join('')
        : // UN VIDE QUI OUVRE UNE PORTE, il ne s'excuse pas : c'est la règle des
          // écrans vides du hub.
          `<p class="cap-vide">Rien en cours. Ouvre un rayon et reprends quelque chose.</p>`
    }

    <div class="biblio-portes">
      ${Object.values(RAYONS).map((R) => porte(R, rayons[R.cle])).join('')}
    </div>`;
}

// UNE PORTE MONTRE CE QU'IL Y A DERRIÈRE : quatre images en pile, le nom du
// rayon, et ce qu'il contient. Sans elles, deux rectangles nommés « Livres » et
// « Films » ne diraient rien de plus qu'une ligne de menu — et le menu est déjà
// à un geste.
//
// LES IMAGES SONT DÉCORATIVES et n'ont pas de texte de remplacement : le nom du
// rayon et son compte disent tout, et six titres annoncés à un lecteur d'écran
// avant le mot « Livres » seraient du bruit.
function porte(R, { oeuvres, urls }) {
  const V = R.vocabulaire;
  const apercu = oeuvres
    .map((o) => urls[imageDe(R, o)])
    .filter(Boolean)
    .slice(0, 4);

  const enCours = oeuvres.filter((o) => o.statut === 'en_cours').length;
  const compte = [
    oeuvres.length ? `${oeuvres.length} ${oeuvres.length > 1 ? V.pluriel : V.singulier}` : '',
    enCours ? `${enCours} en cours` : '',
  ].filter(Boolean);

  return `
    <a class="biblio-porte" href="#perso/${R.cle}">
      <span class="biblio-porte-pile" aria-hidden="true">
        ${
          apercu.length
            ? apercu
                .map(
                  (url, rang) => `<span class="biblio-porte-vignette" style="--rang: ${rang}"
                    ><img src="${echapper(url)}" alt="" loading="lazy" decoding="async"></span>`,
                )
                .join('')
            : // Sans image, le pointillé du hub : « déclaré, pas encore rempli ».
              '<span class="biblio-porte-vignette biblio-porte-vide"></span>'
        }
      </span>
      <span class="biblio-porte-nom">${echapper(R.onglet)}</span>
      <span class="biblio-porte-compte">${
        compte.length ? echapper(compte.join(' · ')) : 'Rien encore'
      }</span>
    </a>`;
}

// --- LE FORMULAIRE D'UNE ŒUVRE ------------------------------------------------
//
// Les champs sont les mêmes des deux côtés, aux mots près — et la NATURE en plus
// pour les films : c'est elle qui dit si « 8 épisodes » veut dire quelque chose.
export function champsDuFormulaire(R, v = {}) {
  const V = R.vocabulaire;

  return [
    { nom: 'titre', libelle: 'Titre', type: 'text', requis: true, valeur: v.titre },
    {
      nom: 'contributeur',
      libelle: V.contributeurFacultatif,
      type: 'text',
      valeur: contributeurDe(R, v) ?? '',
    },
    // L'IMAGE — une photo qu'on prend, jamais un lien collé : elle vit dans le
    // hub, elle ne peut pas disparaître, et regarder sa bibliothèque ne prévient
    // personne.
    //
    // `capture` n'est PAS posé : sur téléphone il forcerait l'appareil photo,
    // alors qu'une couverture se prend aussi bien dans la pellicule.
    {
      nom: 'image',
      libelle: imageDe(R, v) ? V.imageChanger : V.imagePoser,
      type: 'file',
      accepte: 'image/*',
    },
    ...(R.natures
      ? [
          {
            nom: 'nature',
            libelle: 'Nature',
            type: 'choix',
            options: R.natures,
            valeur: v.nature ?? 'film',
          },
        ]
      : []),
    { nom: 'total', libelle: V.totalLibelle, type: 'number', valeur: totalDe(R, v) ?? '' },
    {
      nom: 'mots',
      libelle: V.motsLibelle,
      mot: V.motSingulier,
      type: 'choix-multiple',
      options: R.mots,
      valeur: motsDe(R, v),
    },
    {
      nom: 'statut',
      libelle: V.etatLibelle,
      type: 'choix',
      options: R.etats,
      valeur: v.statut ?? 'en_cours',
    },
    {
      nom: 'note',
      libelle: V.noteLibelle,
      type: 'choix',
      options: { '': 'Pas encore', 1: '★', 2: '★★', 3: '★★★', 4: '★★★★', 5: '★★★★★' },
      valeur: v.note ? String(v.note) : '',
    },
  ];
}

// CE QUE LE FORMULAIRE ÉCRIT, dans les colonnes du rayon. Les noms génériques du
// formulaire (`contributeur`, `total`, `mots`) reprennent ici ceux de la table :
// un seul endroit qui traduit, plutôt qu'un champ nommé différemment sur chaque
// écran.
export function valeursDuFormulaire(R, champs) {
  const valeurs = {
    titre: champs.titre.trim(),
    [R.champs.contributeur]: champs.contributeur?.trim() || null,
    [R.champs.total]: champs.total ? Number(champs.total) : null,
    statut: champs.statut,
    note: champs.note ? Number(champs.note) : null,
    // Le champ caché d'un choix multiple porte ses clés séparées par des
    // virgules : c'est la forme que `FormData` sait transporter.
    [R.champs.mots]: (champs.mots ?? '').split(',').filter(Boolean),
  };
  if (R.natures) valeurs.nature = champs.nature || 'film';
  return valeurs;
}
