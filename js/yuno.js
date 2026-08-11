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
  STATUTS_YUNO,
  NOMS_STATUTS,
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

// --- Les quatre piliers ------------------------------------------------------
// La boussole éditoriale. Ils existent pour FERMER un débat, pas pour ajouter
// une contrainte : la question du matin devient binaire — « ça rentre dans un
// pilier ? oui → je crée » — au lieu de rouvrir la stratégie à chaque idée.

export const PILIERS = {
  1: { nom: 'Les Léopards & le foot africain', role: 'la portée' },
  2: { nom: 'Bord terrain', role: 'le portfolio' },
  3: { nom: "Dans l'œil du photographe", role: 'la conversion' },
  4: { nom: 'Carte blanche', role: 'la différence' },
};

function construirePiliers() {
  return `
    <div class="piliers">
      <ul class="liste-piliers">
        ${Object.entries(PILIERS)
          .map(
            ([rang, { nom, role }]) => `
          <li>
            <span class="pilier-rang chiffre">${rang}</span>
            <span class="pilier-nom">${echapper(nom)}</span>
            <span class="discret pilier-role">${echapper(role)}</span>
          </li>`,
          )
          .join('')}
      </ul>
      <p class="discret piliers-test">Ça rentre dans un pilier ? Oui → je crée.
        Plancher : 2 publications par semaine. Les stories restent une zone franche.</p>
    </div>`;
}

const VUES = ['accueil', 'journal', 'creer', 'calendrier', 'reseau'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  const liens = [
    ['accueil', 'Accueil', '#yuno'],
    ['journal', 'Journal', '#yuno/journal'],
    ['creer', 'Créer', '#yuno/creer'],
    ['calendrier', 'Calendrier', '#yuno/calendrier'],
    ['reseau', 'Réseau', '#yuno/reseau'],
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

// Le tirage de la semaine. Avec match, le terrain est là : on le montre
// (piliers 1 et 2). Sans match, l'éducatif ne dépend d'aucun calendrier, il
// passe devant (pilier 3). `hasard` est un paramètre pour que le tirage se
// vérifie sans dépendre de la chance.
export function tirerIdee(publications, { avecMatch = true } = {}, hasard = Math.random) {
  const banque = publications.filter((pub) => !pub.date_prevue && pub.statut !== 'publie');
  if (!banque.length) return null;

  const prefere = avecMatch ? [1, 2] : [3];
  const prefereesDabord = [
    banque.filter((pub) => prefere.includes(pub.pilier)),
    // À défaut, n'importe quel autre pilier — sans ordre entre eux.
    banque.filter((pub) => pub.pilier && !prefere.includes(pub.pilier)),
  ];

  for (const lot of prefereesDabord) {
    if (lot.length) return lot[Math.floor(hasard() * lot.length)];
  }

  // Aucune idée n'a encore de pilier : on tire quand même. Proposer quelque
  // chose vaut mieux que renvoyer à un classement pas fait.
  return banque[Math.floor(hasard() * banque.length)];
}

export function filtrerBanque(publications, { pilier = 'tout', statutIdee = 'tout' } = {}) {
  return publications.filter((pub) => {
    if (pilier !== 'tout' && String(pub.pilier ?? '') !== pilier) return false;
    if (statutIdee !== 'tout' && pub.statut !== statutIdee) return false;
    return true;
  });
}

function etiquettePilier(rang) {
  return `<span class="etiquette etiquette-pilier">${echapper(
    `${rang}. ${PILIERS[rang]?.nom ?? ''}`,
  )}</span>`;
}

export function construireTirage(tirage) {
  if (!tirage) return '';
  if (!tirage.idee) {
    return `<p class="vide">La banque est vide pour l'instant. Note une idée, même bancale.</p>`;
  }

  const { idee } = tirage;
  return `
    <div class="tirage-idee">
      <span class="tuile-entete">
        ${idee.pilier ? etiquettePilier(idee.pilier) : ''}
        <span class="discret quand">${tirage.avecMatch ? 'semaine avec match' : 'semaine sans match'}</span>
      </span>
      <span class="pub-titre">${echapper(idee.titre)}</span>
      ${idee.preuve ? `<span class="discret pub-preuve">${echapper(idee.preuve)}</span>` : ''}
    </div>`;
}

function blocTirage(etat) {
  return `
    <details class="tirage" ${etat.tirage ? 'open' : ''}>
      <summary>Je ne sais pas quoi poster</summary>
      <p class="discret">Cette semaine, il y a un match ?</p>
      <div class="tirage-choix">
        <button type="button" class="bouton-secondaire bouton-mini" data-tirer="avec">
          Oui, il y a un match</button>
        <button type="button" class="bouton-secondaire bouton-mini" data-tirer="sans">
          Non, pas de match</button>
      </div>
      <div data-bloc="tirage">${construireTirage(etat.tirage)}</div>
    </details>`;
}

function vueCreer(etat) {
  // Ce qui distingue Créer chez Yuno : son cycle, sa checklist, ses piliers.
  const options = { cycle: STATUTS_YUNO, checklist: true, piliers: PILIERS };

  return `
    ${enTete('creer')}
    ${
      etat.cloture
        ? `<p class="note-cloture">C'est posté. Ferme l'app, la suite se passe dehors.</p>`
        : ''
    }

    <section class="bloc">
      <h2>Les quatre piliers</h2>
      ${construirePiliers()}
    </section>

    <section class="bloc">
      <h2>Calendrier éditorial</h2>
      ${formulaireIdee({
        publications: etat.publications,
        rubriquesDepart: RUBRIQUES_DEPART,
        reseaux: RESEAUX_YUNO,
        champsEnPlus: [
          {
            nom: 'pilier',
            libelle: 'Pilier',
            type: 'select',
            options: {
              '': 'Sans pilier',
              ...Object.fromEntries(
                Object.entries(PILIERS).map(([rang, { nom }]) => [rang, `${rang}. ${nom}`]),
              ),
            },
            valeur: '',
          },
          { nom: 'preuve', libelle: 'Preuve — pourquoi ce format marche déjà (facultatif)', type: 'text' },
          { nom: 'pourquoi_moi', libelle: 'Pourquoi chez moi (facultatif)', type: 'text' },
        ],
      })}
      ${blocTirage(etat)}
    </section>

    <section class="bloc">
      <h2>À venir</h2>
      <div data-bloc="a-venir">${construireAVenir(etat.publications, options)}</div>
    </section>

    <section class="bloc">
      <h2>Banque d'idées</h2>
      <div class="barre-banque">
        <label>
          <span class="discret">Pilier</span>
          <select data-filtre-pilier>
            <option value="tout" ${etat.pilier === 'tout' ? 'selected' : ''}>Tous</option>
            ${Object.entries(PILIERS)
              .map(
                ([rang, { nom }]) =>
                  `<option value="${rang}" ${etat.pilier === rang ? 'selected' : ''}>${rang}. ${echapper(nom)}</option>`,
              )
              .join('')}
            <option value="" ${etat.pilier === '' ? 'selected' : ''}>Sans pilier</option>
          </select>
        </label>
        <label>
          <span class="discret">Statut</span>
          <select data-filtre-statut-idee>
            <option value="tout" ${etat.statutIdee === 'tout' ? 'selected' : ''}>Tous</option>
            ${STATUTS_YUNO.filter((statut) => statut !== 'publie')
              .map(
                (statut) =>
                  `<option value="${statut}" ${etat.statutIdee === statut ? 'selected' : ''}>${NOMS_STATUTS[statut]}</option>`,
              )
              .join('')}
          </select>
        </label>
      </div>
      <div data-bloc="banque">${construireBanque(
        filtrerBanque(etat.publications, etat),
        options,
      )}</div>
      <div data-bloc="publiees">${construirePubliees(etat.publications, options)}</div>
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
    // Une commande livrée n'a plus d'échéance à tenir ; un devis, si.
    commandes: etat.commandes.filter(
      (commande) => commande.echeance && ['devis', 'en_cours'].includes(commande.statut),
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
  relance: { nom: 'Relancé', teinte: 255 },
  repondu: { nom: 'Répondu', teinte: 195 },
  // Doré pour « établi », vert pour « bon » — l'ordre du tableau Notion de Noé.
  contact_etabli: { nom: 'Contact établi', teinte: 42 },
  bon_contact: { nom: 'Bon contact', teinte: 152 },
  opportunite: { nom: 'Opportunité', teinte: 310 },
};

// Les trois micro-doses de l'aller-vers, de la plus sûre à la plus grande. La
// peur du rejet ne se contourne pas, elle s'entraîne : d'où la gradation.
const NIVEAUX = {
  1: { nom: 'Répondre', aide: 'Des messages reçus qui attendent.' },
  2: { nom: 'Relancer', aide: 'Des relations vivantes, à entretenir.' },
  3: { nom: 'Ouvrir', aide: 'Des portes à pousser. Le plus grand pas.' },
};

// Où va la relation après un envoi de plus. Une relation vivante ne redescend
// jamais : écrire à quelqu'un qui a répondu ne le ramène pas à « relancé ».
export function statutApresEnvoi(statut) {
  if (!statut || statut === 'pas_de_contact') return 'message_envoye';
  if (statut === 'message_envoye' || statut === 'relance') return 'relance';
  return statut;
}

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
    cle: 'niveau',
    titre: 'Niveau',
    // Le niveau se trie sur la gradation : 1 est plus proche que 3.
    valeur: (contact) => (contact.niveau ? String(contact.niveau) : ''),
    texte: (contact) => (NIVEAUX[contact.niveau] ?? {}).nom ?? '',
    cellule: (contact) => `<select class="choix-niveau" data-niveau="${echapper(contact.id)}"
      aria-label="Niveau d'aller-vers pour ${echapper(contact.nom)}">
      <option value="">—</option>
      ${Object.entries(NIVEAUX)
        .map(
          ([valeur, { nom }]) =>
            `<option value="${valeur}" ${
              String(contact.niveau) === valeur ? 'selected' : ''
            }>${valeur} ${nom}</option>`,
        )
        .join('')}
    </select>`,
    filtre: {
      cle: (contact) => (contact.niveau ? String(contact.niveau) : ''),
      libelle: (contact) =>
        contact.niveau ? `${contact.niveau} ${NIVEAUX[contact.niveau].nom}` : 'Hors file',
      // Les sans-niveau en dernier : ils ne sont pas un quatrième niveau.
      ordre: (contact) => contact.niveau ?? 9,
    },
  },
  {
    cle: 'objectif',
    titre: 'Objectif',
    valeur: (contact) => contact.objectif ?? '',
    cellule: (contact) =>
      contact.objectif
        ? echapper(contact.objectif)
        : '<span class="discret">—</span>',
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

export const AFFICHAGES = { tableau: 'Tableau', fiches: 'Fiches', passerelle: 'Passerelle' };

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

// L'objectif doux suit la même règle que l'ordre des colonnes : c'est un
// réglage personnel, pas une donnée. Il vit dans le navigateur.
const CLE_OBJECTIF_DOUX = 'yuno-objectif-doux';

export function objectifDouxEnregistre() {
  try {
    const brut = Number(localStorage.getItem(CLE_OBJECTIF_DOUX));
    return brut > 0 ? brut : 1;
  } catch {
    return 1;
  }
}

function retenirObjectifDoux(valeur) {
  try {
    localStorage.setItem(CLE_OBJECTIF_DOUX, String(valeur));
  } catch {
    // Navigation privée, quota plein : le réglage tient pour la visite.
  }
}

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

// --- La Passerelle -----------------------------------------------------------
// Un troisième dessin de la même base, pas un module à part : la file d'action
// de la semaine, groupée par micro-dose. La métrique est le nombre de messages
// ENVOYÉS — ce que Noé contrôle. Ni taux de réponse, ni compte de silences :
// si le compteur dépendait des réponses, chaque silence deviendrait un rejet
// mesuré.

// La semaine commence le lundi.
export function debutDeSemaine(reference = new Date()) {
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function envoisDeLaSemaine(envois, reference = new Date()) {
  const debut = versDateISO(debutDeSemaine(reference));
  return envois.filter((envoi) => envoi.date >= debut).length;
}

// Dans la file, une case vide passe DEVANT — au rebours du tableau. « Jamais
// écrit » est ce qui attend le plus, pas ce qui est le plus ancien.
function ordreDeLaFile(a, b) {
  const da = a.date_dernier_envoi ?? '';
  const db = b.date_dernier_envoi ?? '';
  if (da === db) return a.nom.localeCompare(b.nom, 'fr');
  if (!da) return -1;
  if (!db) return 1;
  return da.localeCompare(db);
}

function carteFile(contact) {
  const liens = [lienInstagram(contact), lienEmail(contact), lienTelephone(contact)].filter(
    Boolean,
  );
  const statut = STATUTS_CONTACT[contact.statut] ?? { nom: contact.statut, teinte: null };

  return `
    <li>
      <span class="tuile-entete">
        ${
          contact.structure
            ? `<span class="contact-structure">${echapper(contact.structure)}</span>`
            : ''
        }
        ${pastilleTexte(statut.nom, statut.teinte)}
        ${
          contact.date_dernier_envoi
            ? `<span class="discret quand">écrit ${echapper(
                echeanceLisible(depuisDateISO(contact.date_dernier_envoi)),
              )}</span>`
            : ''
        }
      </span>
      <span class="contact-nom">${echapper(contact.nom)}</span>
      <input class="champ-vif" type="text" data-objectif-contact="${echapper(contact.id)}"
        value="${echapper(contact.objectif ?? '')}" placeholder="Pourquoi ce contact ?"
        aria-label="Objectif pour ${echapper(contact.nom)}">
      <span class="file-suite">
        <input class="champ-vif" type="text" data-prochaine-action="${echapper(contact.id)}"
          value="${echapper(contact.prochaine_action ?? '')}" placeholder="Prochaine action"
          aria-label="Prochaine action pour ${echapper(contact.nom)}">
        <input class="champ-vif champ-date" type="date" data-prochaine-date="${echapper(contact.id)}"
          value="${echapper(contact.prochaine_action_date ?? '')}"
          aria-label="Quand, pour ${echapper(contact.nom)}">
      </span>
      <span class="pub-actions">
        ${liens.length ? `<span class="contact-liens">${joindre(liens)}</span>` : ''}
        <button type="button" class="bouton-secondaire bouton-mini bouton-envoye"
          data-envoye="${echapper(contact.id)}">Envoyé ✓</button>
      </span>
    </li>`;
}

export function construireMetrique(envois, objectifDoux, reference = new Date()) {
  const semaine = envoisDeLaSemaine(envois, reference);

  return `
    <div class="passerelle-metrique">
      <span class="metrique">
        <span class="chiffre">${envois.length}</span>
        <span class="discret">messages envoyés</span>
      </span>
      <span class="metrique">
        <span class="chiffre">${semaine}</span>
        <span class="discret">cette semaine</span>
      </span>
      <label class="metrique-objectif">
        <span class="discret">Objectif doux</span>
        <select data-objectif-doux>
          ${[1, 2, 3, 5]
            .map(
              (valeur) =>
                `<option value="${valeur}" ${valeur === objectifDoux ? 'selected' : ''}>${valeur} / semaine</option>`,
            )
            .join('')}
        </select>
      </label>
    </div>
    ${
      // Un plancher rassurant, jamais une dette : atteint, on le dit ; en
      // dessous, on ne dit rien du tout.
      semaine >= objectifDoux
        ? `<p class="discret note-atteint">C'est fait pour cette semaine. La suite se passe dehors.</p>`
        : ''
    }`;
}

export function construireModeles(modeles = []) {
  const corps = modeles.length
    ? `<ul class="liste-modeles">${modeles
        .map(
          (modele) => `
        <li>
          <span class="tuile-entete">
            <input class="champ-vif modele-titre" type="text" data-modele-titre="${echapper(modele.id)}"
              value="${echapper(modele.titre)}" aria-label="Titre du modèle">
            <button type="button" class="lien-discret bouton-mini" data-copier-modele="${echapper(
              modele.id,
            )}">Copier</button>
            <button type="button" class="lien-discret bouton-mini bouton-retirer"
              data-supprimer-modele="${echapper(modele.id)}"
              title="Retirer ce modèle" aria-label="Retirer « ${echapper(modele.titre)} »">×</button>
          </span>
          <textarea class="champ-vif modele-corps" rows="3" data-modele-corps="${echapper(modele.id)}"
            aria-label="Texte du modèle">${echapper(modele.corps)}</textarea>
        </li>`,
        )
        .join('')}</ul>`
    : `<p class="vide">Un premier message coûte moins cher quand la phrase existe déjà.</p>`;

  return `
    <details class="backlog bloc-modeles">
      <summary>Modèles de messages ${
        modeles.length ? `<span class="chiffre">${modeles.length}</span>` : ''
      }</summary>
      ${corps}
      ${construireFormulaire({
        id: 'modele',
        libelle: 'Écrire un modèle',
        action: 'creer-modele',
        bouton: 'Garder ce modèle',
        champs: [
          { nom: 'titre', libelle: 'Pour quoi ? (accréditation concert, premier contact club…)', type: 'text', requis: true },
          { nom: 'corps', libelle: 'Le message, à personnaliser à chaque envoi', type: 'textarea', requis: true },
        ],
      })}
    </details>`;
}

export function construirePasserelle(contacts, { envois = [], objectifDoux = 1, modeles = [] } = {}) {
  const groupes = Object.entries(NIVEAUX)
    .map(([niveau, { nom, aide }]) => ({
      niveau,
      nom,
      aide,
      dedans: contacts.filter((contact) => String(contact.niveau) === niveau).sort(ordreDeLaFile),
    }))
    .map(
      ({ niveau, nom, aide, dedans }) => `
      <section class="file-niveau">
        <h3><span class="file-rang chiffre">${niveau}</span> ${echapper(nom)}
          ${dedans.length ? `<span class="discret file-compte chiffre">${dedans.length}</span>` : ''}
        </h3>
        <p class="discret file-aide">${echapper(aide)}</p>
        ${
          dedans.length
            ? `<ul>${dedans.map(carteFile).join('')}</ul>`
            : `<p class="vide">Personne ici pour l'instant.</p>`
        }
      </section>`,
    )
    .join('');

  return `
    ${construireMetrique(envois, objectifDoux)}
    <div class="passerelle-file">${groupes}</div>
    <p class="discret note-file">Un contact entre dans la file quand tu lui donnes un niveau —
      depuis la colonne « Niveau » du tableau.</p>
    ${construireModeles(modeles)}`;
}

// Le point d'entrée : on lit la base, puis on la dessine selon l'affichage.
export function construireContacts(contacts, options = {}) {
  const retenus = baseContacts(contacts, options);

  // La Passerelle est un dessin de la base comme les autres — la recherche et
  // les filtres agissent dessus aussi. Elle n'affiche pas « 4 sur 12 » : une
  // file d'action n'est pas un inventaire.
  if (options.affichage === 'passerelle') return construirePasserelle(retenus, options);

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
          { nom: 'objectif', libelle: 'Pourquoi ce contact ? (facultatif)', type: 'text' },
          { nom: 'niveau', libelle: "Dans la file d'aller-vers ?", type: 'select',
            options: {
              '': 'Pas dans la file',
              ...Object.fromEntries(
                Object.entries(NIVEAUX).map(([v, { nom }]) => [v, `${v} ${nom}`]),
              ),
            },
            valeur: '' },
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>

    ${blocCommandes(etat)}
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
    envois: etat.envois,
    objectifDoux: etat.objectifDoux,
    modeles: etat.modeles,
  };
}

// --- Les commandes -----------------------------------------------------------
// Elles vivent dans Réseau : une commande naît d'une relation, elle n'a pas
// besoin d'un onglet à elle.

export const CYCLE_COMMANDE = ['devis', 'en_cours', 'livree', 'payee'];

const STATUTS_COMMANDE = {
  devis: 'Devis',
  en_cours: 'En cours',
  livree: 'Livrée',
  payee: 'Payée',
};

// Un bouton dit ce qui va se passer.
const AVANCER_COMMANDE = {
  en_cours: 'Démarrer',
  livree: 'Marquer livrée',
  payee: 'Marquer payée',
};

export function construireCommandes(commandes) {
  const ouvertes = commandes.filter((commande) => ['devis', 'en_cours'].includes(commande.statut));
  const closes = commandes.filter((commande) => ['livree', 'payee'].includes(commande.statut));

  const tuile = (commande) => {
    const suivant = CYCLE_COMMANDE[CYCLE_COMMANDE.indexOf(commande.statut) + 1];

    return `
    <li>
      <span class="tuile-entete">
        ${
          commande.client
            ? `<span class="contact-structure">${echapper(commande.client)}</span>`
            : '<span class="discret">sans client</span>'
        }
        ${
          commande.montant
            ? `<span class="chiffre commande-montant">${echapper(commande.montant)} €</span>`
            : ''
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
        <span class="pub-statut">statut : <strong>${echapper(
          (STATUTS_COMMANDE[commande.statut] ?? commande.statut).toLowerCase(),
        )}</strong></span>
        ${
          suivant
            ? `<button type="button" class="bouton-secondaire bouton-mini"
                 data-avancer-commande="${echapper(commande.id)}">${AVANCER_COMMANDE[suivant]}</button>`
            : ''
        }
        ${
          commande.lien_livrable
            ? `<a class="discret" href="${echapper(commande.lien_livrable)}"
                 target="_blank" rel="noopener">voir la galerie ↗</a>`
            : ''
        }
      </span>
    </li>`;
  };

  return `
    ${
      ouvertes.length
        ? `<ul>${ouvertes.map(tuile).join('')}</ul>`
        : `<p class="vide">Tes commandes se suivront ici, du devis au paiement.</p>`
    }
    ${
      closes.length
        ? `<details class="backlog">
             <summary>Livrées et payées <span class="chiffre">${closes.length}</span></summary>
             <ul>${closes.map(tuile).join('')}</ul>
           </details>`
        : ''
    }`;
}

function blocCommandes(etat) {
  return `
    <section class="bloc">
      <h2>Commandes</h2>
      <div data-bloc="commandes">${construireCommandes(etat.commandes)}</div>
      ${construireFormulaire({
        id: 'commande',
        libelle: 'Ajouter une commande',
        action: 'creer-commande',
        champs: [
          { nom: 'titre', libelle: 'Commande', type: 'text', requis: true },
          // Le client se relie au carnet quand le nom y figure — même geste que
          // les rencontres du Journal, et le carnet reste la source des noms.
          {
            nom: 'client',
            libelle: 'Client',
            type: 'text',
            suggestions: etat.contacts.map((contact) => contact.nom),
          },
          { nom: 'statut', libelle: 'Où en est-elle', type: 'select',
            options: STATUTS_COMMANDE, valeur: 'devis' },
          { nom: 'echeance', libelle: 'À livrer pour (facultatif)', type: 'date' },
          { nom: 'montant', libelle: 'Montant en euros (facultatif)', type: 'number' },
          { nom: 'lien_livrable', libelle: 'Lien du livrable (facultatif)', type: 'text' },
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>`;
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
      envois: [],
      modeles: [],
      objectifDoux: objectifDouxEnregistre(),
      vue: 'accueil',
      filtre: 'tout',
      pilier: 'tout',
      statutIdee: 'tout',
      tirage: null,
      cloture: false,
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
      // Le mot de clôture ne vaut que pour l'instant où l'on vient de poster :
      // changer de page l'efface, il n'a pas à traîner.
      etat.cloture = false;
      rendre();
    };

    try {
      const [objectifs, victoires, moments, publications, taches, evenements, contacts, commandes, envois, modeles] =
        await Promise.all([
          api.objectifsActifs({ projet: 'photo' }),
          api.victoiresDuProjet('photo', 10, { sauf: 'moment' }),
          api.momentsTous(),
          api.publicationsToutes('photo'),
          api.tachesDatees({ projet: 'photo' }),
          api.evenementsDepuis(new Date().toISOString(), { projet: 'photo' }),
          api.contactsTous(),
          api.commandesToutes(),
          api.envoisTous(),
          api.modelesTous(),
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
        envois,
        modeles,
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
          pilier: champs.pilier ? Number(champs.pilier) : null,
          preuve: champs.preuve?.trim() || null,
          pourquoi_moi: champs.pourquoi_moi?.trim() || null,
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
          statut: champs.statut,
          objectif: champs.objectif?.trim() || null,
          niveau: champs.niveau ? Number(champs.niveau) : null,
          notes: champs.notes?.trim() || null,
        });
        etat.contacts = [...etat.contacts, contact].sort((a, b) => a.nom.localeCompare(b.nom));
        rendreContacts();
        return;
      }

      if (action === 'creer-commande') {
        const nomClient = champs.client?.trim() || null;
        const connu = nomClient
          ? etat.contacts.find((contact) => contact.nom.toLowerCase() === nomClient.toLowerCase())
          : null;

        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: connu?.nom ?? nomClient,
          client_id: connu?.id ?? null,
          statut: champs.statut,
          echeance: champs.echeance || null,
          montant: champs.montant ? Number(champs.montant) : null,
          lien_livrable: champs.lien_livrable?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.commandes = [commande, ...etat.commandes];
        rendreCommandes();
        return;
      }

      if (action === 'creer-modele') {
        const modele = await api.creerModele({
          titre: champs.titre.trim(),
          corps: champs.corps.trim(),
          ordre: etat.modeles.length + 1,
        });
        etat.modeles = [...etat.modeles, modele];
        rendreContacts();
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

      const avancerCommande = evenement.target.closest('[data-avancer-commande]');
      if (avancerCommande) {
        const commande = etat.commandes.find(
          (c) => c.id === avancerCommande.dataset.avancerCommande,
        );
        const suivant = CYCLE_COMMANDE[CYCLE_COMMANDE.indexOf(commande?.statut) + 1];
        if (!commande || !suivant) return;
        avancerCommande.disabled = true;
        try {
          // Livrer crée une victoire : c'en est une. Être payé, non.
          const { commande: misAJour, victoire } = await api.avancerCommande(commande, suivant);
          Object.assign(commande, misAJour);
          if (victoire) etat.victoires = [victoire, ...etat.victoires];
          rendreCommandes();
        } catch (souci) {
          console.error("Impossible de faire avancer la commande", souci);
          avancerCommande.disabled = false;
        }
        return;
      }

      // « Envoyé ✓ » — le seul compteur de la Passerelle. Il monte parce que
      // Noé a écrit, pas parce qu'on lui a répondu.
      const envoye = evenement.target.closest('[data-envoye]');
      if (envoye) {
        const contact = etat.contacts.find((c) => c.id === envoye.dataset.envoye);
        if (!contact) return;
        envoye.disabled = true;
        try {
          const { envoi, contact: misAJour } = await api.enregistrerEnvoi({
            contact,
            statut: statutApresEnvoi(contact.statut),
          });
          Object.assign(contact, misAJour);
          etat.envois = [envoi, ...etat.envois];
          rendreContacts();
        } catch (souci) {
          console.error("Impossible d'enregistrer l'envoi", souci);
          envoye.disabled = false;
        }
        return;
      }

      const copierModele = evenement.target.closest('[data-copier-modele]');
      if (copierModele) {
        const modele = etat.modeles.find((m) => m.id === copierModele.dataset.copierModele);
        if (!modele) return;
        try {
          await navigator.clipboard.writeText(modele.corps);
          copierModele.textContent = 'Copié';
          setTimeout(() => {
            copierModele.textContent = 'Copier';
          }, 1500);
        } catch (souci) {
          console.error('Copie impossible', souci);
        }
        return;
      }

      const supprimerModele = evenement.target.closest('[data-supprimer-modele]');
      if (supprimerModele) {
        supprimerModele.disabled = true;
        try {
          await api.supprimerModele(supprimerModele.dataset.supprimerModele);
          etat.modeles = etat.modeles.filter(
            (m) => m.id !== supprimerModele.dataset.supprimerModele,
          );
          rendreContacts();
        } catch (souci) {
          console.error('Suppression du modèle impossible', souci);
          supprimerModele.disabled = false;
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

      const tirer = evenement.target.closest('[data-tirer]');
      if (tirer) {
        const avecMatch = tirer.dataset.tirer === 'avec';
        etat.tirage = { avecMatch, idee: tirerIdee(etat.publications, { avecMatch }) };
        rendre();
        return;
      }

      const avancer = evenement.target.closest('[data-avancer]');
      if (avancer) {
        const pub = trouverPub(avancer.dataset.avancer);
        const suivant = STATUTS_YUNO[STATUTS_YUNO.indexOf(pub.statut) + 1];
        if (!suivant) return;
        avancer.disabled = true;
        try {
          Object.assign(pub, await api.modifierPublication(pub.id, { statut: suivant }));
          // Poster, c'est déposer l'œuvre et repartir : le site le dit, puis
          // se tait.
          etat.cloture = suivant === 'publie';
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

      // Le niveau se change au même geste que le statut : c'est lui qui fait
      // entrer un contact dans la file, ou l'en sort.
      const niveau = evenement.target.closest('[data-niveau]');
      if (niveau) {
        const contact = etat.contacts.find((c) => c.id === niveau.dataset.niveau);
        if (!contact) return;
        niveau.disabled = true;
        try {
          Object.assign(
            contact,
            await api.modifierContact(contact.id, {
              niveau: niveau.value ? Number(niveau.value) : null,
            }),
          );
          rendreContacts();
        } catch (souci) {
          console.error('Enregistrement du niveau impossible', souci);
          niveau.disabled = false;
        }
        return;
      }

      // Les champs vifs de la Passerelle s'enregistrent en quittant le champ,
      // sans rien redessiner : la valeur est déjà sous les yeux, et un
      // redessin ferait sauter la page sous le doigt.
      const champVif =
        evenement.target.closest('[data-objectif-contact]') ??
        evenement.target.closest('[data-prochaine-action]') ??
        evenement.target.closest('[data-prochaine-date]');

      if (champVif) {
        const { objectifContact, prochaineAction, prochaineDate } = champVif.dataset;
        const contact = etat.contacts.find(
          (c) => c.id === (objectifContact ?? prochaineAction ?? prochaineDate),
        );
        if (!contact) return;

        const valeur = champVif.value.trim() || null;
        const colonne = objectifContact
          ? 'objectif'
          : prochaineAction
            ? 'prochaine_action'
            : 'prochaine_action_date';

        try {
          Object.assign(contact, await api.modifierContact(contact.id, { [colonne]: valeur }));
        } catch (souci) {
          console.error("Enregistrement du champ impossible", souci);
        }
        return;
      }

      const modeleTitre = evenement.target.closest('[data-modele-titre]');
      const modeleCorps = evenement.target.closest('[data-modele-corps]');
      if (modeleTitre || modeleCorps) {
        const champ = modeleTitre ?? modeleCorps;
        const id = champ.dataset.modeleTitre ?? champ.dataset.modeleCorps;
        const modele = etat.modeles.find((m) => m.id === id);
        if (!modele) return;
        try {
          Object.assign(
            modele,
            await api.modifierModele(id, {
              [modeleTitre ? 'titre' : 'corps']: champ.value.trim(),
            }),
          );
        } catch (souci) {
          console.error('Enregistrement du modèle impossible', souci);
        }
        return;
      }

      const filtrePilier = evenement.target.closest('[data-filtre-pilier]');
      if (filtrePilier) {
        etat.pilier = filtrePilier.value;
        rendre();
        return;
      }

      const filtreStatutIdee = evenement.target.closest('[data-filtre-statut-idee]');
      if (filtreStatutIdee) {
        etat.statutIdee = filtreStatutIdee.value;
        rendre();
        return;
      }

      const objectifDoux = evenement.target.closest('[data-objectif-doux]');
      if (objectifDoux) {
        etat.objectifDoux = Number(objectifDoux.value);
        retenirObjectifDoux(etat.objectifDoux);
        rendreContacts();
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
