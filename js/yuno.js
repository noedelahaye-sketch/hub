// Le SITE Yuno — le quartier général du photographe (docs/yuno-spec.md).
//
// À l'adresse #yuno, tout l'habillage du hub disparaît (voir styles.css) : ni
// « Hub », ni onglets, ni autres projets. On est chez Yuno, avec son chrome à
// lui. La page Yuno DU hub, elle, vit dans js/photo.js (#photo).
//
//   #yuno              l'accueil : objectifs, aperçu création, victoires
//   #yuno/creer        l'outil phare : calendrier éditorial + banque d'idées
//   #yuno/calendrier   tout ce qui a une date chez Yuno, avec filtres
//   #yuno/reseau       le carnet réseau (à construire)
//   #yuno/commandes    le suivi des commandes (à construire)
//
// Une idée est une publication sans date : même table, deux vues.

import * as api from './api.js';
import { construireFormulaire, construireObjectifs } from './espace-projet.js';
import {
  STATUTS,
  construireAVenir,
  construireBanque,
  construirePubliees,
  construireApercuCreation,
  formulaireIdee,
} from './publications.js';
import { depuisDateISO, echeanceLisible, versDateISO, echapper } from './format.js';
import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  centrerActif,
} from './calendrier-commun.js';

// Les rubriques de départ de Noé (7 août 2026). La liste reste libre : elle
// s'enrichira de son analyse du marché, plus tard.
export const RUBRIQUES_DEPART = [
  'Raw to edit',
  'Raw vs edit',
  'No accreditation, no problem',
  'Un mois en tant que photographe sportif',
];

// Les réseaux de Yuno. Facebook et YouTube existent en base pour le FCH, mais
// n'ont pas à encombrer ce formulaire-ci.
const RESEAUX_YUNO = { instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn' };

const VUES = ['accueil', 'journal', 'creer', 'calendrier', 'reseau', 'commandes'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  const liens = [
    ['accueil', 'Accueil', '#yuno'],
    ['journal', 'Journal', '#yuno/journal'],
    ['creer', 'Créer', '#yuno/creer'],
    ['calendrier', 'Calendrier', '#yuno/calendrier'],
    ['reseau', 'Réseau', '#yuno/reseau'],
    ['commandes', 'Commandes', '#yuno/commandes'],
  ];

  return `
    <header class="yuno-site-tete">
      <!-- La signature EST le titre : ni « Yuno » en texte, ni sous-titre
           (décision de Noé, 7 août 2026). L'alt porte le nom pour l'accessibilité. -->
      <img class="yuno-signature" src="img/yuno-signature.png" alt="Yuno">
    </header>
    <nav class="yuno-nav" aria-label="Le site Yuno">
      ${liens
        .map(
          ([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === vueActive ? 'actif' : ''}"
          ${vue === vueActive ? 'aria-current="page"' : ''}>${libelle}</a>`,
        )
        .join('')}
    </nav>`;
}

// La seule mention du hub sur tout le site, tout en bas : en plein écran sur
// téléphone, sans barre d'adresse, il faut une porte de sortie.
function pied() {
  return `
    <footer class="yuno-pied">
      <a class="lien-discret" href="#photo">Quitter le site</a>
    </footer>`;
}

// --- Le Carnet de terrain ----------------------------------------------------
// L'accueil du site affiche le vécu, jamais le social : matchs couverts,
// rencontres, œuvres finies. Aucune métrique de réseau n'entre ici — la
// première chose vue en ouvrant le site dit ce qui compte.

const TYPES_MOMENT = {
  match: 'Match',
  concert: 'Concert',
  sortie: 'Sortie',
  autre: 'Autre',
};

// Ce qu'un moment devient au dashboard du hub, où il arrive sans son carnet
// autour : « Match · OM-Lyon », ou « Match » tout court si le lieu manque. Le
// point médian plutôt qu'un tiret : les lieux en contiennent souvent un.
export function titreDuMoment({ type, lieu }) {
  const quoi = TYPES_MOMENT[type] ?? TYPES_MOMENT.autre;
  return lieu?.trim() ? `${quoi} · ${lieu.trim()}` : quoi;
}

// Les trois compteurs de l'accueil. Ils se calculent, ils ne se stockent pas :
// ce sont des faits accumulés, ils ne peuvent que monter. Les rencontres se
// comptent une par une, pas par personne — revoir quelqu'un au bord du terrain
// est un moment vécu de plus, pas un doublon.
export function compteursCarnet(moments) {
  return {
    moments: moments.length,
    rencontres: moments.reduce((somme, moment) => somme + (moment.rencontres?.length ?? 0), 0),
    oeuvres: moments.filter((moment) => moment.oeuvre_finie).length,
  };
}

export function construireCompteurs(moments) {
  const { moments: vecus, rencontres, oeuvres } = compteursCarnet(moments);
  const compteur = (nombre, libelle) => `
    <li>
      <span class="chiffre">${nombre}</span>
      <span class="discret">${libelle}</span>
    </li>`;

  return `
    <ul class="compteurs">
      ${compteur(vecus, 'Moments vécus')}
      ${compteur(rencontres, 'Rencontres')}
      ${compteur(oeuvres, 'Œuvres finies')}
    </ul>`;
}

// Les noms saisis au vol retrouvent leur fiche quand elle existe — même geste
// que le carnet : une barre oblique sépare deux personnes.
export function relierRencontres(saisie, contacts) {
  return separer(saisie ?? '').map((nom) => {
    const connu = contacts.find(
      (contact) => contact.nom.toLowerCase() === nom.toLowerCase(),
    );
    return connu ? { nom: connu.nom, contact_id: connu.id } : { nom, contact_id: null };
  });
}

function ligneRencontres(moment) {
  if (!moment.rencontres?.length) return '';

  const noms = moment.rencontres
    .map((rencontre) =>
      rencontre.contact_id
        ? `<span class="tag" style="--h: ${teinte(rencontre.nom)}">${echapper(rencontre.nom)}</span>`
        : `<span class="tag tag-neutre">${echapper(rencontre.nom)}<button type="button"
             class="lien-discret ouvrir-fiche" data-ouvrir-fiche="${echapper(rencontre.id)}"
             title="Ajouter au carnet réseau"
             aria-label="Ajouter ${echapper(rencontre.nom)} au carnet réseau">+</button></span>`,
    )
    .join('');

  return `<span class="moment-rencontres"><span class="discret">Rencontré</span>${noms}</span>`;
}

// Le retrait appartient au Journal, où l'on gère. L'aperçu de l'accueil garde
// en revanche le « + » d'une rencontre : ouvrir une fiche pousse vers les gens,
// et ça vaut partout où un nom s'affiche.
function carteMoment(moment, retirable = true) {
  return `
    <li class="moment">
      <span class="tuile-entete">
        <span class="etiquette">${echapper(TYPES_MOMENT[moment.type] ?? moment.type)}</span>
        ${moment.oeuvre_finie ? '<span class="etiquette etiquette-oeuvre">Œuvre finie</span>' : ''}
        <span class="discret quand">${echapper(echeanceLisible(depuisDateISO(moment.date)))}</span>
        ${
          retirable
            ? `<button type="button" class="lien-discret bouton-mini bouton-retirer"
                 data-supprimer-moment="${echapper(moment.id)}"
                 title="Retirer ce moment"
                 aria-label="Retirer « ${echapper(titreDuMoment(moment))} »">×</button>`
            : ''
        }
      </span>
      ${moment.lieu ? `<span class="moment-lieu">${echapper(moment.lieu)}</span>` : ''}
      ${ligneRencontres(moment)}
      ${
        moment.photo_fiere
          ? `<span class="moment-photo"><span class="discret">La photo dont je suis fier</span><span>${echapper(
              moment.photo_fiere,
            )}</span></span>`
          : ''
      }
      ${moment.note ? `<span class="discret moment-note">${echapper(moment.note)}</span>` : ''}
    </li>`;
}

function carteVictoire(victoire) {
  return `
    <li>
      <span class="tuile-entete">
        <span class="discret quand">${echapper(echeanceLisible(depuisDateISO(victoire.date)))}</span>
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-victoire="${echapper(victoire.id)}"
          title="Retirer cette victoire"
          aria-label="Retirer « ${echapper(victoire.titre)} »">×</button>
      </span>
      <span class="victoire-titre">${echapper(victoire.titre)}</span>
    </li>`;
}

// L'aperçu de l'accueil : les derniers moments, et rien de plus. C'est le
// principal de la page, mais c'est une vitrine — on gère au Journal.
export function construireApercuMoments(moments, limite = 3) {
  if (!moments.length) {
    return `<p class="vide">Ton premier moment s'inscrit ici — un match, un concert, une sortie.</p>`;
  }

  return `<ul class="liste-carnet">${[...moments]
    .sort(
      (a, b) =>
        String(b.date).localeCompare(String(a.date)) ||
        String(b.created_at).localeCompare(String(a.created_at)),
    )
    .slice(0, limite)
    .map((moment) => carteMoment(moment, false))
    .join('')}</ul>`;
}

// Le Journal : le fil complet, et le mur des victoires. Les moments et les
// victoires d'avant le carnet s'y mêlent. Les victoires nées d'un moment sont
// écartées — le moment est déjà là, et plus riche que son reflet.
export function construireCarnet(moments, victoires) {
  const entrees = [
    ...moments.map((moment) => ({
      date: moment.date,
      created_at: moment.created_at,
      html: carteMoment(moment),
    })),
    ...victoires
      .filter((victoire) => victoire.source !== 'moment')
      .map((victoire) => ({
        date: victoire.date,
        created_at: victoire.created_at,
        html: carteVictoire(victoire),
      })),
  ].sort(
    (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      String(b.created_at).localeCompare(String(a.created_at)),
  );

  if (!entrees.length) {
    return `<p class="vide">Ton premier moment s'inscrit ici — un match, un concert, une sortie.</p>`;
  }

  return `<ul class="liste-carnet">${entrees.map((entree) => entree.html).join('')}</ul>`;
}

// La capture : deux champs suffisent, le reste attend qu'on ait envie. Ce qui
// compte est qu'elle se remplisse debout, en sortant du stade.
function formulaireMoment(contacts) {
  return construireFormulaire({
    id: 'moment',
    libelle: 'Loguer un moment',
    action: 'loguer-moment',
    bouton: 'Inscrire au carnet',
    champs: [
      { nom: 'date', libelle: 'Quand', type: 'date', valeur: versDateISO() },
      { nom: 'type', libelle: 'Quoi', type: 'select', options: TYPES_MOMENT, valeur: 'match' },
      { nom: 'lieu', libelle: 'Événement ou lieu', type: 'text' },
      {
        nom: 'rencontres',
        libelle: "Qui j'ai rencontré (sépare par une barre oblique)",
        type: 'text',
        suggestions: contacts.map((contact) => contact.nom),
      },
      { nom: 'photo_fiere', libelle: 'La photo dont je suis fier', type: 'text' },
      { nom: 'note', libelle: 'Note libre', type: 'textarea' },
      { nom: 'oeuvre_finie', libelle: 'Une œuvre finie', type: 'checkbox' },
    ],
  });
}

// --- Les vues ----------------------------------------------------------------

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}

    <section class="bloc">
      ${construireCompteurs(etat.moments)}
      ${formulaireMoment(etat.contacts)}
    </section>

    <section class="bloc">
      <h2>Derniers moments</h2>
      <div data-bloc="apercu-moments">${construireApercuMoments(etat.moments)}</div>
      <a class="lien-externe" href="#yuno/journal">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Ouvrir le journal</span>
          <span class="discret">Tous tes moments, tes rencontres, tes œuvres</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>

    <section class="bloc">
      <h2>Objectifs</h2>
      <div data-bloc="objectifs">${construireObjectifs(etat.objectifs)}</div>
      ${construireFormulaire({
        id: 'photo-objectif',
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
      <h2>En création</h2>
      <div data-bloc="apercu">${construireApercuCreation(etat.publications)}</div>
      <a class="lien-externe" href="#yuno/creer">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Ouvrir l'atelier Créer</span>
          <span class="discret">Calendrier éditorial, banque d'idées</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>
    ${pied()}`;
}

// Le Journal — la page source du carnet de terrain : tous les moments, la
// capture, et le retrait. L'accueil n'en montre que les derniers.
function vueJournal(etat) {
  return `
    ${enTete('journal')}

    <section class="bloc">
      ${construireCompteurs(etat.moments)}
      ${formulaireMoment(etat.contacts)}
    </section>

    <section class="bloc">
      <h2>Le carnet de terrain</h2>
      <div data-bloc="carnet">${construireCarnet(etat.moments, etat.victoires)}</div>
    </section>
    ${pied()}`;
}

function vueCreer(etat) {
  return `
    ${enTete('creer')}

    <section class="bloc">
      <h2>Calendrier éditorial</h2>
      ${formulaireIdee({
        publications: etat.publications,
        rubriquesDepart: RUBRIQUES_DEPART,
        reseaux: RESEAUX_YUNO,
      })}
    </section>

    <section class="bloc">
      <h2>À venir</h2>
      <div data-bloc="a-venir">${construireAVenir(etat.publications)}</div>
    </section>

    <section class="bloc">
      <h2>Banque d'idées</h2>
      <div data-bloc="banque">${construireBanque(etat.publications)}</div>
      <div data-bloc="publiees">${construirePubliees(etat.publications)}</div>
    </section>
    ${pied()}`;
}

function vueCalendrier(etat) {
  const elements = assemblerCalendrier({
    evenements: etat.evenements,
    taches: etat.taches,
    objectifs: etat.objectifs,
    publications: etat.publications.filter(
      (pub) => pub.date_prevue && pub.statut !== 'publie',
    ),
    commandes: etat.commandes.filter(
      (commande) => commande.echeance && commande.statut === 'en_cours',
    ),
  });

  return `
    ${enTete('calendrier')}
    ${construireFiltres(etat.filtre)}
    <div data-bloc="calendrier">
      ${construireCalendrier(elements, etat.filtre)}
    </div>
    ${pied()}`;
}

// --- Le carnet réseau --------------------------------------------------------
// Ce qu'une fiche doit rendre en trois secondes : le contact, et à qui la
// personne est rattachée (docs/yuno-spec.md, §4).

const TYPES_CONTACT = {
  joueur: 'Joueur',
  club: 'Club',
  media: 'Média',
  agence: 'Agence',
  marque: 'Marque',
  autre: 'Autre',
};

// Où en est la relation. Repris du tableau Notion de Noé, dans son ordre de
// progression : c'est lui qui fait du carnet un CRM plutôt qu'un annuaire.
// Chaque statut a sa teinte fixe — aucune ne signale une alerte.
const STATUTS_CONTACT = {
  pas_de_contact: { nom: 'Pas de contact', teinte: null },
  message_envoye: { nom: 'Message envoyé', teinte: 215 },
  // Doré pour « établi », vert pour « bon » — l'ordre du tableau Notion de Noé.
  contact_etabli: { nom: 'Contact établi', teinte: 42 },
  bon_contact: { nom: 'Bon contact', teinte: 152 },
};

// Une teinte stable par valeur : « Rennes » garde la même couleur d'une visite
// à l'autre, comme les étiquettes de Notion. Douze teintes bien réparties, et
// une somme des caractères pour choisir — il ne s'agit que de distinguer.
const TEINTES = [8, 30, 45, 90, 150, 175, 195, 215, 255, 280, 310, 335];

function teinte(texte) {
  let somme = 0;
  for (const caractere of String(texte)) somme += caractere.codePointAt(0);
  return TEINTES[somme % TEINTES.length];
}

function pastilleTexte(valeur, teinteChoisie) {
  if (teinteChoisie === null) {
    return `<span class="tag tag-neutre">${echapper(valeur)}</span>`;
  }
  return `<span class="tag" style="--h: ${teinteChoisie ?? teinte(valeur)}">${echapper(valeur)}</span>`;
}

// L'identifiant peut être saisi avec ou sans arobase, ou collé en URL entière.
function pseudoInstagram(valeur) {
  return valeur
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
}

// Le carnet est une BASE : une liste de fiches, et plusieurs façons de la
// regarder. Le tri, la recherche et le filtre agissent sur la base ; l'affichage
// (tableau ou fiches) ne fait que la dessiner. Ajouter une vue plus tard —
// groupée par structure, par exemple — ne demandera que d'ajouter un dessin.

// Les colonnes de la base. Une colonne sait quatre choses, et rien d'autre :
//   `valeur`  — se comparer, pour le tri
//   `texte`   — se chercher, quand ça diffère du tri (le statut se trie sur son
//               rang mais se cherche sur son libellé)
//   `cellule` — se dessiner
//   `filtre`  — se filtrer, pour les colonnes à valeurs limitées. Les choix
//               proposés se déduisent des données présentes, comme dans Notion :
//               un club qui n'est dans le carnet de personne n'a pas à figurer
//               dans la liste.
// Ajouter une colonne filtrable ne demande donc rien d'autre que de la décrire.
const COLONNES = [
  {
    cle: 'nom',
    titre: 'Nom',
    valeur: (contact) => contact.nom ?? '',
    cellule: (contact) => `<strong>${echapper(contact.nom)}</strong>`,
  },
  {
    cle: 'type',
    titre: 'Type',
    valeur: (contact) => TYPES_CONTACT[contact.type] ?? contact.type ?? '',
    cellule: (contact) =>
      pastilleTexte(TYPES_CONTACT[contact.type] ?? contact.type),
    filtre: {
      cle: (contact) => contact.type ?? '',
      libelle: (contact) => TYPES_CONTACT[contact.type] ?? contact.type ?? '',
    },
  },
  {
    cle: 'statut',
    titre: 'Relation',
    valeur: (contact) => {
      // Le tri suit la progression, pas l'alphabet : « Bon contact » est un
      // aboutissement, pas un début.
      const ordre = Object.keys(STATUTS_CONTACT).indexOf(contact.statut);
      return ordre < 0 ? '' : String(ordre);
    },
    texte: (contact) => (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? '',
    cellule: (contact) => {
      const statut = STATUTS_CONTACT[contact.statut] ?? { nom: contact.statut, teinte: null };
      // Sans teinte, une classe plutôt qu'une variable : une règle de classe se
      // laisse porter à la bonne spécificité sur les sites, pas une variable.
      const habillage =
        statut.teinte === null
          ? 'class="choix-statut choix-statut-neutre"'
          : `class="choix-statut" style="--h: ${statut.teinte}"`;

      return `<select ${habillage} data-statut="${echapper(contact.id)}"
        aria-label="Relation avec ${echapper(contact.nom)}">
        ${Object.entries(STATUTS_CONTACT)
          .map(
            ([valeur, { nom }]) =>
              `<option value="${valeur}" ${valeur === contact.statut ? 'selected' : ''}>${nom}</option>`,
          )
          .join('')}
      </select>`;
    },
    filtre: {
      cle: (contact) => contact.statut ?? '',
      libelle: (contact) => (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? contact.statut ?? '',
      // Les statuts se rangent dans leur progression, pas par ordre alphabétique.
      ordre: (contact) => Object.keys(STATUTS_CONTACT).indexOf(contact.statut),
    },
  },
  {
    cle: 'structure',
    titre: 'Rattaché à',
    valeur: (contact) => contact.structure ?? '',
    cellule: (contact) =>
      contact.structure
        ? pastilleTexte(contact.structure)
        : '<span class="discret">—</span>',
    filtre: {
      cle: (contact) => contact.structure ?? '',
      libelle: (contact) => contact.structure || 'Sans rattachement',
    },
  },
  {
    cle: 'telephone',
    titre: 'Téléphone',
    valeur: (contact) => contact.telephone ?? '',
    cellule: (contact) => lienTelephone(contact) ?? '<span class="discret">—</span>',
  },
  {
    cle: 'instagram',
    titre: 'Instagram',
    valeur: (contact) => contact.instagram ?? '',
    cellule: (contact) => lienInstagram(contact) ?? '<span class="discret">—</span>',
  },
  {
    cle: 'email',
    titre: 'E-mail',
    valeur: (contact) => contact.email ?? '',
    cellule: (contact) => lienEmail(contact) ?? '<span class="discret">—</span>',
  },
];

export const AFFICHAGES = { tableau: 'Tableau', fiches: 'Fiches' };

// Un contact peut avoir deux comptes ou deux adresses — le carnet de Noé en
// contient, séparés par une barre oblique. Chacun devient son propre lien.
function separer(valeur) {
  return String(valeur)
    .split(/\s*[/,]\s*/)
    .map((morceau) => morceau.trim())
    .filter(Boolean);
}

function joindre(liens) {
  return liens.join('<span class="discret"> · </span>');
}

function lienInstagram(contact) {
  if (!contact.instagram) return null;
  return joindre(
    separer(contact.instagram).map((brut) => {
      const pseudo = pseudoInstagram(brut);
      return `<a href="https://instagram.com/${encodeURIComponent(pseudo)}"
        target="_blank" rel="noopener">@${echapper(pseudo)}</a>`;
    }),
  );
}

function lienEmail(contact) {
  if (!contact.email) return null;
  return joindre(
    separer(contact.email).map(
      (adresse) =>
        `<a href="mailto:${encodeURIComponent(adresse)}">${echapper(adresse)}</a>`,
    ),
  );
}

function lienTelephone(contact) {
  if (!contact.telephone) return null;
  return joindre(
    separer(contact.telephone).map(
      (numero) =>
        `<a href="tel:${echapper(numero.replace(/\s/g, ''))}">${echapper(numero)}</a>`,
    ),
  );
}

function boutonRetirer(contact) {
  return `<button type="button" class="lien-discret bouton-mini bouton-retirer"
    data-supprimer-contact="${echapper(contact.id)}"
    title="Retirer du carnet"
    aria-label="Retirer ${echapper(contact.nom)}">×</button>`;
}

// Les colonnes qui savent se filtrer.
export const COLONNES_FILTRABLES = COLONNES.filter((colonne) => colonne.filtre);

// --- L'ordre des colonnes ----------------------------------------------------
// C'est une préférence d'affichage, pas une donnée : elle vit dans le
// navigateur, pas en base. Un ordre qui se perdrait au rechargement ne servirait
// à rien, d'où la persistance ; mais il n'a rien à faire dans Supabase.

const CLE_ORDRE = 'yuno-ordre-colonnes';

export function ordreEnregistre() {
  try {
    const brut = localStorage.getItem(CLE_ORDRE);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
}

function retenirOrdre(ordre) {
  try {
    localStorage.setItem(CLE_ORDRE, JSON.stringify(ordre));
  } catch {
    // Navigation privée, quota plein : l'ordre tient pour la visite, tant pis.
  }
}

// Les colonnes dans l'ordre demandé. Toute colonne absente de l'ordre est
// ajoutée à la fin : ajouter une colonne au code ne doit pas la faire
// disparaître chez qui a déjà un ordre enregistré.
export function colonnesOrdonnees(ordre) {
  if (!Array.isArray(ordre) || !ordre.length) return COLONNES;

  const connues = ordre
    .map((cle) => COLONNES.find((colonne) => colonne.cle === cle))
    .filter(Boolean);
  const nouvelles = COLONNES.filter((colonne) => !ordre.includes(colonne.cle));
  return [...connues, ...nouvelles];
}

// Déplacer une colonne d'un cran, ou la poser à une place précise.
export function deplacerColonne(ordre, cle, versIndex) {
  const actuel = colonnesOrdonnees(ordre).map((colonne) => colonne.cle);
  const depuis = actuel.indexOf(cle);
  if (depuis < 0) return actuel;

  const cible = Math.max(0, Math.min(actuel.length - 1, versIndex));
  const suite = [...actuel];
  suite.splice(depuis, 1);
  suite.splice(cible, 0, cle);
  retenirOrdre(suite);
  return suite;
}

// Les choix d'un filtre, déduits des données présentes et comptés — un filtre
// qui propose « Rennes (9) » dit déjà quelque chose du carnet.
export function choixDuFiltre(contacts, colonne) {
  const vus = new Map();
  for (const contact of contacts) {
    const cle = colonne.filtre.cle(contact);
    if (!vus.has(cle)) {
      vus.set(cle, {
        cle,
        libelle: colonne.filtre.libelle(contact),
        ordre: colonne.filtre.ordre ? colonne.filtre.ordre(contact) : null,
        compte: 0,
      });
    }
    vus.get(cle).compte += 1;
  }

  return [...vus.values()].sort((a, b) => {
    if (a.ordre !== null && b.ordre !== null) return a.ordre - b.ordre;
    // Les sans-valeur en dernier : « Sans rattachement » n'est pas un club.
    if (!a.cle) return 1;
    if (!b.cle) return -1;
    return a.libelle.localeCompare(b.libelle, 'fr');
  });
}

// La base : filtrée, cherchée, triée. Sans aucune idée de son affichage.
// `filtres` est un objet { cleDeColonne: valeur }, où 'tout' ne filtre rien.
export function baseContacts(contacts, { recherche = '', filtres = {}, tri = 'nom', sens = 1 } = {}) {
  const terme = recherche.trim().toLowerCase();
  const colonne = COLONNES.find((c) => c.cle === tri) ?? COLONNES[0];

  return contacts
    .filter((contact) => {
      // Les filtres se cumulent : un ET, pas un OU. Choisir « Joueur » puis
      // « Rennes » donne les joueurs de Rennes.
      for (const filtrable of COLONNES_FILTRABLES) {
        const choisi = filtres[filtrable.cle];
        if (choisi === undefined || choisi === 'tout') continue;
        if (filtrable.filtre.cle(contact) !== choisi) return false;
      }

      if (!terme) return true;
      // La recherche porte sur toutes les colonnes : chercher « lorient » doit
      // trouver aussi bien un nom qu'une structure, et « établi » un statut.
      return COLONNES.some((c) =>
        (c.texte ?? c.valeur)(contact).toLowerCase().includes(terme),
      );
    })
    .sort((a, b) => {
      // Les cases vides finissent en bas quel que soit le sens : une fiche sans
      // date n'est pas « la plus ancienne ».
      const va = colonne.valeur(a);
      const vb = colonne.valeur(b);
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      return va.localeCompare(vb, 'fr', { numeric: true }) * sens;
    });
}

// La barre de filtres, sur le modèle de Notion : discrète tant qu'on ne s'en
// sert pas, dépliable, et composée à la demande — on ajoute les filtres dont on
// a besoin, on retire les autres. Trois choses distinctes :
//
//   `filtresOuverts`  la barre est-elle dépliée
//   `filtresAjoutes`  quelles colonnes ont leur filtre posé dans la barre
//   `filtres`         la valeur choisie pour chacune ('tout' = ne filtre rien)
//
// Replier la barre n'annule rien : les filtres restent appliqués, et le compte
// sur le bouton le dit. Sans ça, on cacherait la raison d'une liste courte.

function compterFiltresActifs(filtres = {}) {
  return COLONNES_FILTRABLES.filter(
    (colonne) => filtres[colonne.cle] && filtres[colonne.cle] !== 'tout',
  ).length;
}

const ICONE_FILTRE = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"
  fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
  <path d="M2 4h12M4 8h8M6.5 12h3"/></svg>`;

const ICONE_COLONNES = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"
  fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
  <rect x="2" y="3" width="4" height="10" rx="1"/>
  <rect x="10" y="3" width="4" height="10" rx="1"/></svg>`;

export function construireBarreFiltres(contacts, etat) {
  const filtres = etat.filtresContact ?? {};
  const ajoutes = etat.filtresAjoutes ?? [];
  const actifs = compterFiltresActifs(filtres);
  const disponibles = COLONNES_FILTRABLES.filter((colonne) => !ajoutes.includes(colonne.cle));

  const bouton = `
    <button type="button" class="outil ${etat.filtresOuverts || actifs ? 'actif' : ''}"
      data-basculer-filtres aria-expanded="${Boolean(etat.filtresOuverts)}">
      ${ICONE_FILTRE} Filtrer${
        actifs ? ` <span class="compte-actifs chiffre">${actifs}</span>` : ''
      }
    </button>`;

  const boutonColonnes = `
    <button type="button" class="outil ${etat.colonnesOuvertes ? 'actif' : ''}"
      data-basculer-colonnes aria-expanded="${Boolean(etat.colonnesOuvertes)}">
      ${ICONE_COLONNES} Colonnes
    </button>`;

  const panneau = etat.colonnesOuvertes ? construirePanneauColonnes(etat.ordreColonnes) : '';

  if (!etat.filtresOuverts) {
    return `<div class="barre-outils">${bouton}${boutonColonnes}</div>${panneau}`;
  }

  const puces = ajoutes
    .map((cle) => COLONNES_FILTRABLES.find((colonne) => colonne.cle === cle))
    .filter(Boolean)
    .map((colonne) => {
      const choisi = filtres[colonne.cle] ?? 'tout';
      const choix = choixDuFiltre(contacts, colonne);

      return `
        <span class="puce-filtre ${choisi === 'tout' ? '' : 'actif'}">
          <label>
            <span class="discret">${echapper(colonne.titre)}</span>
            <select data-filtre-colonne="${colonne.cle}">
              <option value="tout">Tous</option>
              ${choix
                .map(
                  ({ cle, libelle, compte }) =>
                    `<option value="${echapper(cle)}" ${cle === choisi ? 'selected' : ''}>${echapper(
                      libelle,
                    )} (${compte})</option>`,
                )
                .join('')}
            </select>
          </label>
          <button type="button" class="lien-discret retirer-filtre"
            data-retirer-filtre="${colonne.cle}"
            title="Retirer ce filtre"
            aria-label="Retirer le filtre ${echapper(colonne.titre)}">×</button>
        </span>`;
    })
    .join('');

  const ajout = disponibles.length
    ? `<details class="ajout-filtre">
         <summary>+ Filtrer</summary>
         <div class="menu-filtre">
           ${disponibles
             .map(
               (colonne) =>
                 `<button type="button" data-ajouter-filtre="${colonne.cle}">${echapper(
                   colonne.titre,
                 )}</button>`,
             )
             .join('')}
         </div>
       </details>`
    : '';

  return `
    <div class="barre-outils">${bouton}${boutonColonnes}</div>
    ${panneau}
    <div class="barre-filtres">
      ${puces}
      ${ajout}
      ${
        actifs
          ? `<button type="button" class="lien-discret" data-vider-filtres>Tout afficher</button>`
          : ''
      }
    </div>`;
}

function messageVide(contacts) {
  return contacts.length
    ? `<p class="vide">Personne ne correspond à cette recherche.</p>`
    : `<p class="vide">Ton carnet démarre ici — joueurs, médias, clubs.</p>`;
}

export function construireTableauContacts(retenus, contacts, { tri = 'nom', sens = 1, ordre = null } = {}) {
  if (!retenus.length) return messageVide(contacts);

  const colonnes = colonnesOrdonnees(ordre);

  return `
    <div class="tableau-cadre">
      <table class="tableau">
        <thead>
          <tr>
            ${colonnes
              .map(
                (colonne, index) => `
              <th scope="col" aria-sort="${
                colonne.cle === tri ? (sens === 1 ? 'ascending' : 'descending') : 'none'
              }"
                draggable="true"
                data-colonne="${colonne.cle}" data-index="${index}">
                <button type="button" data-trier="${colonne.cle}">
                  <span class="poignee" aria-hidden="true">⠿</span>
                  ${colonne.titre}
                  <span class="tri-marque" aria-hidden="true">${
                    colonne.cle === tri ? (sens === 1 ? '↑' : '↓') : ''
                  }</span>
                </button>
              </th>`,
              )
              .join('')}
            <th scope="col"><span class="hors-ecran">Retirer</span></th>
          </tr>
        </thead>
        <tbody>
          ${retenus
            .map(
              (contact) => `
            <tr>
              ${colonnes.map((colonne) => `<td>${colonne.cellule(contact)}</td>`).join('')}
              <td>${boutonRetirer(contact)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

// Le panneau des colonnes : le même ordre, aux flèches. C'est lui qui sert sur
// téléphone, où l'on ne tire pas un en-tête de tableau.
export function construirePanneauColonnes(ordre) {
  const colonnes = colonnesOrdonnees(ordre);

  return `
    <div class="panneau-colonnes">
      <p class="discret">Glisse un en-tête du tableau, ou déplace-les ici.</p>
      <ol>
        ${colonnes
          .map(
            (colonne, index) => `
          <li>
            <span>${echapper(colonne.titre)}</span>
            <button type="button" class="lien-discret" data-monter-colonne="${colonne.cle}"
              ${index === 0 ? 'disabled' : ''}
              aria-label="Monter ${echapper(colonne.titre)}">↑</button>
            <button type="button" class="lien-discret" data-descendre-colonne="${colonne.cle}"
              ${index === colonnes.length - 1 ? 'disabled' : ''}
              aria-label="Descendre ${echapper(colonne.titre)}">↓</button>
          </li>`,
          )
          .join('')}
      </ol>
    </div>`;
}

export function construireFichesContacts(retenus, contacts) {
  if (!retenus.length) return messageVide(contacts);

  return `<ul class="liste-contacts">${retenus
    .map((contact) => {
      const liens = [lienInstagram(contact), lienEmail(contact), lienTelephone(contact)]
        .filter(Boolean);

      return `
        <li>
          <span class="tuile-entete">
            ${pastilleTexte(TYPES_CONTACT[contact.type] ?? contact.type)}
            ${contact.structure ? pastilleTexte(contact.structure) : ''}
            ${pastilleTexte(
              (STATUTS_CONTACT[contact.statut] ?? {}).nom ?? contact.statut,
              (STATUTS_CONTACT[contact.statut] ?? {}).teinte,
            )}
            ${boutonRetirer(contact)}
          </span>
          <span class="contact-nom">${echapper(contact.nom)}</span>
          ${liens.length ? `<span class="contact-liens">${liens.join('<span class="discret"> · </span>')}</span>` : ''}
          ${contact.notes ? `<span class="discret contact-notes">${echapper(contact.notes)}</span>` : ''}
        </li>`;
    })
    .join('')}</ul>`;
}

// Le point d'entrée : on lit la base, puis on la dessine selon l'affichage.
export function construireContacts(contacts, options = {}) {
  const retenus = baseContacts(contacts, options);
  const compte = `<p class="discret compte-base"><span class="chiffre">${retenus.length}</span> sur <span class="chiffre">${contacts.length}</span></p>`;

  const dessin =
    options.affichage === 'fiches'
      ? construireFichesContacts(retenus, contacts)
      : construireTableauContacts(retenus, contacts, options);

  return compte + dessin;
}

function vueReseau(etat) {
  return `
    ${enTete('reseau')}

    <section class="bloc">
      <div class="barre-base">
        <input type="search" id="recherche-contact" class="recherche"
          placeholder="Chercher partout dans le carnet…"
          value="${echapper(etat.rechercheContact)}">
        <div class="affichages" role="group" aria-label="Affichage du carnet">
          ${Object.entries(AFFICHAGES)
            .map(
              ([valeur, libelle]) => `
            <button type="button" data-affichage="${valeur}"
              aria-pressed="${valeur === etat.affichageContact}"
              class="${valeur === etat.affichageContact ? 'actif' : ''}">${libelle}</button>`,
            )
            .join('')}
        </div>
      </div>

      ${construireBarreFiltres(etat.contacts, etat)}

      <div data-bloc="contacts">${construireContacts(etat.contacts, optionsBase(etat))}</div>

      ${construireFormulaire({
        id: 'contact',
        libelle: 'Ajouter au carnet',
        action: 'creer-contact',
        champs: [
          { nom: 'nom', libelle: 'Nom', type: 'text', requis: true },
          { nom: 'type', libelle: 'Type', type: 'select', options: TYPES_CONTACT, valeur: 'joueur' },
          { nom: 'structure', libelle: 'Rattaché à (FC Lorient, OM, La Provence…)', type: 'text' },
          { nom: 'instagram', libelle: 'Instagram', type: 'text' },
          { nom: 'email', libelle: 'E-mail', type: 'text' },
          { nom: 'telephone', libelle: 'Téléphone', type: 'text' },
          { nom: 'statut', libelle: 'Relation', type: 'select',
            options: Object.fromEntries(
              Object.entries(STATUTS_CONTACT).map(([v, { nom }]) => [v, nom]),
            ),
            valeur: 'pas_de_contact' },
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>
    ${pied()}`;
}

// Ce que l'état dit à la base : ce qu'on cherche, ce qu'on garde, comment on
// trie, et comment on dessine.
function optionsBase(etat) {
  return {
    recherche: etat.rechercheContact,
    filtres: etat.filtresContact,
    tri: etat.triContact,
    sens: etat.sensContact,
    affichage: etat.affichageContact,
    ordre: etat.ordreColonnes,
  };
}

// --- Les commandes -----------------------------------------------------------

export function construireCommandes(commandes) {
  const enCours = commandes.filter((commande) => commande.statut === 'en_cours');
  const livrees = commandes.filter((commande) => commande.statut === 'livree');

  const tuile = (commande) => `
    <li>
      <span class="tuile-entete">
        ${
          commande.client
            ? `<span class="contact-structure">${echapper(commande.client)}</span>`
            : '<span class="discret">sans client</span>'
        }
        ${
          commande.echeance
            ? `<span class="discret quand">${echapper(
                echeanceLisible(depuisDateISO(commande.echeance)),
              )}</span>`
            : ''
        }
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-supprimer-commande="${echapper(commande.id)}"
          title="Supprimer"
          aria-label="Supprimer « ${echapper(commande.titre)} »">×</button>
      </span>
      <span class="pub-titre">${echapper(commande.titre)}</span>
      ${commande.notes ? `<span class="discret pub-notes">${echapper(commande.notes)}</span>` : ''}
      <span class="pub-actions">
        ${
          commande.statut === 'en_cours'
            ? `<button type="button" class="bouton-secondaire bouton-mini"
                 data-livrer="${echapper(commande.id)}">Marquer livrée</button>`
            : '<span class="pub-statut">statut : <strong>livrée</strong></span>'
        }
        ${
          commande.lien_livrable
            ? `<a class="discret" href="${echapper(commande.lien_livrable)}"
                 target="_blank" rel="noopener">voir la galerie ↗</a>`
            : ''
        }
      </span>
    </li>`;

  return `
    ${
      enCours.length
        ? `<ul>${enCours.map(tuile).join('')}</ul>`
        : `<p class="vide">Aucune commande en cours.</p>`
    }
    ${
      livrees.length
        ? `<details class="backlog">
             <summary>Livrées <span class="chiffre">${livrees.length}</span></summary>
             <ul>${livrees.map(tuile).join('')}</ul>
           </details>`
        : ''
    }`;
}

function vueCommandes(etat) {
  return `
    ${enTete('commandes')}

    <section class="bloc">
      <h2>Commandes</h2>
      <div data-bloc="commandes">${construireCommandes(etat.commandes)}</div>
      ${construireFormulaire({
        id: 'commande',
        libelle: 'Ajouter une commande',
        action: 'creer-commande',
        champs: [
          { nom: 'titre', libelle: 'Commande', type: 'text', requis: true },
          { nom: 'client', libelle: 'Client', type: 'text' },
          { nom: 'echeance', libelle: 'À livrer pour (facultatif)', type: 'date' },
          { nom: 'lien_livrable', libelle: 'Lien du livrable (facultatif)', type: 'text' },
          { nom: 'statut', libelle: 'Relation', type: 'select',
            options: Object.fromEntries(
              Object.entries(STATUTS_CONTACT).map(([v, { nom }]) => [v, nom]),
            ),
            valeur: 'pas_de_contact' },
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>
    ${pied()}`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    const etat = {
      objectifs: [],
      victoires: [],
      moments: [],
      publications: [],
      taches: [],
      evenements: [],
      contacts: [],
      commandes: [],
      vue: 'accueil',
      filtre: 'tout',
      rechercheContact: '',
      filtresOuverts: false,
      filtresAjoutes: [],
      filtresContact: {},
      colonnesOuvertes: false,
      ordreColonnes: ordreEnregistre(),
      triContact: 'nom',
      sensContact: 1,
      affichageContact: 'tableau',
    };

    const rendre = () => {
      if (etat.vue === 'journal') section.innerHTML = vueJournal(etat);
      else if (etat.vue === 'creer') section.innerHTML = vueCreer(etat);
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'reseau') section.innerHTML = vueReseau(etat);
      else if (etat.vue === 'commandes') section.innerHTML = vueCommandes(etat);
      else section.innerHTML = vueAccueil(etat);

      centrerActif(section.querySelector('.yuno-nav'));
      centrerActif(section.querySelector('.filtres'));
    };

    // Ne redessine que la liste des contacts : réécrire la vue entière ferait
    // perdre le curseur du champ de recherche à chaque lettre.
    const rendreContacts = () => {
      const cible = section.querySelector('[data-bloc="contacts"]');
      if (cible) {
        cible.innerHTML = construireContacts(etat.contacts, optionsBase(etat));
      }
    };

    const rendreCommandes = () => {
      const cible = section.querySelector('[data-bloc="commandes"]');
      if (cible) cible.innerHTML = construireCommandes(etat.commandes);
    };

    // Le routeur rappelle `naviguer` à chaque changement de hash dans l'espace.
    this.naviguer = (nouvelleRoute) => {
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      rendre();
    };

    try {
      const [objectifs, victoires, moments, publications, taches, evenements, contacts, commandes] =
        await Promise.all([
          api.objectifsActifs({ projet: 'photo' }),
          api.victoiresDuProjet('photo', 10, { sauf: 'moment' }),
          api.momentsTous(),
          api.publicationsToutes('photo'),
          api.tachesDatees({ projet: 'photo' }),
          api.evenementsDepuis(new Date().toISOString(), { projet: 'photo' }),
          api.contactsTous(),
          api.commandesToutes(),
        ]);
      Object.assign(etat, {
        objectifs,
        victoires,
        moments,
        publications,
        taches,
        evenements,
        contacts,
        commandes,
      });
    } catch (erreur) {
      console.error("Chargement de l'espace Yuno impossible", erreur);
      section.innerHTML = `
        ${enTete('accueil')}
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section, route));
      return;
    }

    this.naviguer(route);

    const trouverPub = (id) => etat.publications.find((pub) => pub.id === id);
    const ouvrirObjectif = (id) => {
      const element = section.querySelector(`[data-objectif="${CSS.escape(id)}"]`);
      if (element) element.open = true;
    };

    // --- Formulaires ---

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
      } catch (souci) {
        console.error('Action impossible', souci);
        erreur.textContent = souci.message ?? "L'action a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    async function appliquer(action, champs) {
      if (action === 'loguer-moment') {
        const moment = {
          date: champs.date || versDateISO(),
          type: champs.type,
          lieu: champs.lieu?.trim() || null,
          photo_fiere: champs.photo_fiere?.trim() || null,
          note: champs.note?.trim() || null,
          oeuvre_finie: champs.oeuvre_finie === 'oui',
        };

        const { moment: logue } = await api.creerMoment({
          moment,
          rencontres: relierRencontres(champs.rencontres, etat.contacts),
          titre: titreDuMoment(moment),
        });

        etat.moments = [logue, ...etat.moments];
        rendre();
        // C'est fait : la capture se referme, le moment est au carnet. Le site
        // réussit quand on le quitte, pas quand il retient.
        const capture = section.querySelector('[data-ajout="moment"]');
        if (capture) capture.open = false;
        return;
      }

      if (action === 'noter-idee') {
        const publication = await api.creerPublication({
          projet: 'photo',
          titre: champs.titre.trim(),
          reseau: champs.reseau,
          format: champs.format,
          rubrique: champs.rubrique?.trim() || null,
          notes: champs.notes?.trim() || null,
          date_prevue: champs.date_prevue || null,
        });
        etat.publications = [publication, ...etat.publications];
        rendre();
        return;
      }

      if (action === 'creer-contact') {
        const contact = await api.creerContact({
          nom: champs.nom.trim(),
          type: champs.type,
          structure: champs.structure?.trim() || null,
          instagram: champs.instagram?.trim() || null,
          email: champs.email?.trim() || null,
          telephone: champs.telephone?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.contacts = [...etat.contacts, contact].sort((a, b) => a.nom.localeCompare(b.nom));
        rendreContacts();
        return;
      }

      if (action === 'creer-commande') {
        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: champs.client?.trim() || null,
          echeance: champs.echeance || null,
          lien_livrable: champs.lien_livrable?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.commandes = [commande, ...etat.commandes];
        rendreCommandes();
        return;
      }

      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          projet: 'photo',
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        etat.objectifs = [...etat.objectifs, { ...objectif, jalons: objectif.jalons ?? [] }];
        rendre();
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
        rendre();
        ouvrirObjectif(champs.objectif_id);
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
        Object.assign(objectif, misAJour);
        rendre();
        ouvrirObjectif(objectif.id);
      }
    }

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      const filtre = evenement.target.closest('[data-filtre]');
      if (filtre) {
        etat.filtre = filtre.dataset.filtre;
        rendre();
        return;
      }

      if (evenement.target.closest('[data-basculer-colonnes]')) {
        etat.colonnesOuvertes = !etat.colonnesOuvertes;
        rendre();
        return;
      }

      const monter = evenement.target.closest('[data-monter-colonne]');
      const descendre = evenement.target.closest('[data-descendre-colonne]');
      if (monter || descendre) {
        const cle = (monter ?? descendre).dataset[monter ? 'monterColonne' : 'descendreColonne'];
        const actuel = colonnesOrdonnees(etat.ordreColonnes).map((c) => c.cle);
        const index = actuel.indexOf(cle);
        etat.ordreColonnes = deplacerColonne(
          etat.ordreColonnes,
          cle,
          index + (monter ? -1 : 1),
        );
        rendre();
        return;
      }

      if (evenement.target.closest('[data-basculer-filtres]')) {
        etat.filtresOuverts = !etat.filtresOuverts;
        // Première ouverture : on pose un filtre pour ne pas montrer une barre
        // vide. Le premier de la liste est le plus courant.
        if (etat.filtresOuverts && !etat.filtresAjoutes.length) {
          etat.filtresAjoutes = [COLONNES_FILTRABLES[0].cle];
        }
        rendre();
        return;
      }

      const ajouterFiltre = evenement.target.closest('[data-ajouter-filtre]');
      if (ajouterFiltre) {
        const cle = ajouterFiltre.dataset.ajouterFiltre;
        if (!etat.filtresAjoutes.includes(cle)) {
          etat.filtresAjoutes = [...etat.filtresAjoutes, cle];
        }
        rendre();
        return;
      }

      const retirerFiltre = evenement.target.closest('[data-retirer-filtre]');
      if (retirerFiltre) {
        const cle = retirerFiltre.dataset.retirerFiltre;
        etat.filtresAjoutes = etat.filtresAjoutes.filter((c) => c !== cle);
        // Retirer la puce retire aussi sa valeur : laisser un filtre invisible
        // agir serait le meilleur moyen de ne plus rien comprendre à la liste.
        const { [cle]: _, ...reste } = etat.filtresContact;
        etat.filtresContact = reste;
        rendre();
        return;
      }

      if (evenement.target.closest('[data-vider-filtres]')) {
        etat.filtresContact = {};
        rendre();
        return;
      }

      const affichage = evenement.target.closest('[data-affichage]');
      if (affichage) {
        etat.affichageContact = affichage.dataset.affichage;
        rendre();
        return;
      }

      // Cliquer une colonne trie dessus ; la recliquer inverse le sens.
      const trier = evenement.target.closest('[data-trier]');
      if (trier) {
        const cle = trier.dataset.trier;
        etat.sensContact = etat.triContact === cle ? -etat.sensContact : 1;
        etat.triContact = cle;
        rendreContacts();
        return;
      }

      const supprimerContact = evenement.target.closest('[data-supprimer-contact]');
      if (supprimerContact) {
        supprimerContact.disabled = true;
        try {
          await api.supprimerContact(supprimerContact.dataset.supprimerContact);
          etat.contacts = etat.contacts.filter(
            (contact) => contact.id !== supprimerContact.dataset.supprimerContact,
          );
          rendreContacts();
        } catch (souci) {
          console.error('Suppression du contact impossible', souci);
          supprimerContact.disabled = false;
        }
        return;
      }

      const livrer = evenement.target.closest('[data-livrer]');
      if (livrer) {
        const commande = etat.commandes.find((c) => c.id === livrer.dataset.livrer);
        if (!commande) return;
        livrer.disabled = true;
        try {
          // Livrer crée une victoire : c'en est une.
          const { commande: livree, victoire } = await api.livrerCommande(commande);
          Object.assign(commande, livree);
          etat.victoires = [victoire, ...etat.victoires];
          rendreCommandes();
        } catch (souci) {
          console.error('Impossible de marquer la commande livrée', souci);
          livrer.disabled = false;
        }
        return;
      }

      const supprimerCommande = evenement.target.closest('[data-supprimer-commande]');
      if (supprimerCommande) {
        supprimerCommande.disabled = true;
        try {
          await api.supprimerCommande(supprimerCommande.dataset.supprimerCommande);
          etat.commandes = etat.commandes.filter(
            (commande) => commande.id !== supprimerCommande.dataset.supprimerCommande,
          );
          rendreCommandes();
        } catch (souci) {
          console.error('Suppression de la commande impossible', souci);
          supprimerCommande.disabled = false;
        }
        return;
      }

      const avancer = evenement.target.closest('[data-avancer]');
      if (avancer) {
        const pub = trouverPub(avancer.dataset.avancer);
        const suivant = STATUTS[STATUTS.indexOf(pub.statut) + 1];
        if (!suivant) return;
        avancer.disabled = true;
        try {
          Object.assign(pub, await api.modifierPublication(pub.id, { statut: suivant }));
          rendre();
        } catch (souci) {
          console.error('Changement de statut impossible', souci);
          avancer.disabled = false;
        }
        return;
      }

      const deprogrammer = evenement.target.closest('[data-deprogrammer]');
      if (deprogrammer) {
        const pub = trouverPub(deprogrammer.dataset.deprogrammer);
        deprogrammer.disabled = true;
        try {
          Object.assign(pub, await api.modifierPublication(pub.id, { date_prevue: null }));
          rendre();
        } catch (souci) {
          console.error('Déprogrammation impossible', souci);
          deprogrammer.disabled = false;
        }
        return;
      }

      const supprimerPub = evenement.target.closest('[data-supprimer-pub]');
      if (supprimerPub) {
        supprimerPub.disabled = true;
        try {
          await api.supprimerPublication(supprimerPub.dataset.supprimerPub);
          etat.publications = etat.publications.filter(
            (pub) => pub.id !== supprimerPub.dataset.supprimerPub,
          );
          rendre();
        } catch (souci) {
          console.error('Suppression impossible', souci);
          supprimerPub.disabled = false;
        }
        return;
      }

      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) {
        jalon.disabled = true;
        try {
          const objectif = etat.objectifs.find((candidat) =>
            candidat.jalons?.some((j) => j.id === jalon.dataset.jalon),
          );
          const cible = objectif.jalons.find((j) => j.id === jalon.dataset.jalon);
          const { jalon: atteint, victoire } = await api.atteindreJalon(cible, 'photo');
          Object.assign(cible, atteint);
          etat.victoires = [victoire, ...etat.victoires];
          rendre();
          ouvrirObjectif(objectif.id);
        } catch (souci) {
          console.error('Impossible de marquer le jalon', souci);
          jalon.disabled = false;
        }
        return;
      }

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) {
        const objectif = etat.objectifs.find((o) => o.id === atteindre.dataset.atteindre);
        if (!objectif || !confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;
        atteindre.disabled = true;
        try {
          const { victoire } = await api.atteindreObjectif(objectif);
          etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
          etat.victoires = [victoire, ...etat.victoires];
          rendre();
        } catch (souci) {
          console.error("Impossible de marquer l'objectif atteint", souci);
          atteindre.disabled = false;
        }
        return;
      }

      const supprimerObjectif = evenement.target.closest('[data-supprimer-objectif]');
      if (supprimerObjectif) {
        const objectif = etat.objectifs.find(
          (o) => o.id === supprimerObjectif.dataset.supprimerObjectif,
        );
        if (!objectif) return;
        if (!confirm(`Supprimer « ${objectif.titre} » et ses jalons ? Les tâches liées sont conservées.`)) {
          return;
        }
        supprimerObjectif.disabled = true;
        try {
          await api.supprimerObjectif(objectif.id);
          etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
          rendre();
        } catch (souci) {
          console.error("Suppression de l'objectif impossible", souci);
          supprimerObjectif.disabled = false;
        }
        return;
      }

      const supprimerMoment = evenement.target.closest('[data-supprimer-moment]');
      if (supprimerMoment) {
        const id = supprimerMoment.dataset.supprimerMoment;
        const moment = etat.moments.find((candidat) => candidat.id === id);
        if (!moment || !confirm(`Retirer « ${titreDuMoment(moment)} » du carnet ?`)) return;
        supprimerMoment.disabled = true;
        try {
          await api.supprimerMoment(id);
          etat.moments = etat.moments.filter((candidat) => candidat.id !== id);
          rendre();
        } catch (souci) {
          console.error('Suppression du moment impossible', souci);
          supprimerMoment.disabled = false;
        }
        return;
      }

      // Une rencontre notée au vol devient une fiche : le carnet réseau se
      // remplit du terrain, sans qu'il ait fallu y penser sur le moment.
      const ouvrirFiche = evenement.target.closest('[data-ouvrir-fiche]');
      if (ouvrirFiche) {
        const id = ouvrirFiche.dataset.ouvrirFiche;
        const moment = etat.moments.find((candidat) =>
          candidat.rencontres?.some((rencontre) => rencontre.id === id),
        );
        const rencontre = moment?.rencontres.find((candidat) => candidat.id === id);
        if (!rencontre) return;
        ouvrirFiche.disabled = true;
        try {
          const { contact, rencontre: liee } = await api.ouvrirFichePourRencontre(rencontre);
          Object.assign(rencontre, liee);
          etat.contacts = [...etat.contacts, contact].sort((a, b) => a.nom.localeCompare(b.nom));
          rendre();
        } catch (souci) {
          console.error("Ouverture de la fiche impossible", souci);
          ouvrirFiche.disabled = false;
        }
        return;
      }

      const victoire = evenement.target.closest('[data-victoire]');
      if (victoire) {
        victoire.disabled = true;
        try {
          await api.supprimerVictoire(victoire.dataset.victoire);
          etat.victoires = etat.victoires.filter((v) => v.id !== victoire.dataset.victoire);
          rendre();
        } catch (souci) {
          console.error('Suppression de la victoire impossible', souci);
          victoire.disabled = false;
        }
      }
    });

    // Tirer un en-tête de colonne pour la déplacer — le geste de Notion. Sur
    // téléphone on ne tire pas un tableau : c'est le panneau « Colonnes » qui
    // sert, avec ses flèches. Les deux écrivent le même ordre.
    let colonneTiree = null;

    section.addEventListener('dragstart', (evenement) => {
      const entete = evenement.target.closest('th[data-colonne]');
      if (!entete) return;
      colonneTiree = entete.dataset.colonne;
      evenement.dataTransfer.effectAllowed = 'move';
      // Firefox n'amorce pas le glissement sans données transférées.
      evenement.dataTransfer.setData('text/plain', colonneTiree);
      entete.classList.add('en-deplacement');
    });

    section.addEventListener('dragover', (evenement) => {
      const entete = evenement.target.closest('th[data-colonne]');
      if (!entete || !colonneTiree || entete.dataset.colonne === colonneTiree) return;
      // Sans preventDefault, le navigateur refuse le dépôt.
      evenement.preventDefault();
      entete.classList.add('cible-depot');
    });

    section.addEventListener('dragleave', (evenement) => {
      evenement.target.closest('th[data-colonne]')?.classList.remove('cible-depot');
    });

    section.addEventListener('drop', (evenement) => {
      const entete = evenement.target.closest('th[data-colonne]');
      if (!entete || !colonneTiree) return;
      evenement.preventDefault();
      etat.ordreColonnes = deplacerColonne(
        etat.ordreColonnes,
        colonneTiree,
        Number(entete.dataset.index),
      );
      colonneTiree = null;
      rendre();
    });

    section.addEventListener('dragend', () => {
      colonneTiree = null;
      section.querySelectorAll('.en-deplacement, .cible-depot').forEach((element) => {
        element.classList.remove('en-deplacement', 'cible-depot');
      });
    });

    // La recherche du carnet filtre à la frappe, sans bouton.
    section.addEventListener('input', (evenement) => {
      const recherche = evenement.target.closest('#recherche-contact');
      if (!recherche) return;
      etat.rechercheContact = recherche.value;
      rendreContacts();
    });

    section.addEventListener('change', async (evenement) => {
      // Programmer une idée : choisir une date suffit, pas de bouton de plus.
      const programmer = evenement.target.closest('[data-programmer]');
      if (programmer && programmer.value) {
        const pub = trouverPub(programmer.dataset.programmer);
        programmer.disabled = true;
        try {
          Object.assign(
            pub,
            await api.modifierPublication(pub.id, { date_prevue: programmer.value }),
          );
          rendre();
        } catch (souci) {
          console.error('Programmation impossible', souci);
          programmer.disabled = false;
        }
        return;
      }

      // Dater le dernier échange d'un contact, au même geste.
      const filtreColonne = evenement.target.closest('[data-filtre-colonne]');
      if (filtreColonne) {
        etat.filtresContact = {
          ...etat.filtresContact,
          [filtreColonne.dataset.filtreColonne]: filtreColonne.value,
        };
        rendre();
        return;
      }

      // Le statut se change dans la cellule : c'est le geste le plus fréquent
      // d'un CRM, il ne mérite pas un formulaire.
      const statut = evenement.target.closest('[data-statut]');
      if (statut) {
        const contact = etat.contacts.find((c) => c.id === statut.dataset.statut);
        if (!contact) return;
        statut.disabled = true;
        try {
          Object.assign(
            contact,
            await api.modifierContact(contact.id, { statut: statut.value }),
          );
          rendreContacts();
        } catch (souci) {
          console.error('Enregistrement du statut impossible', souci);
          statut.disabled = false;
        }
      }
    });
  },
};
