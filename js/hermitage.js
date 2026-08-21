// Le SITE FC Hermitage (docs/fch-spec.md).
//
// À l'adresse #hermitage, tout l'habillage du hub disparaît (voir styles.css).
// La page FCH DU hub vit dans js/fch.js (#fch).
//
//   #hermitage              l'accueil : objectifs, la com' à venir, victoires
//   #hermitage/creer        le calendrier éditorial du club
//   #hermitage/calendrier   tout ce qui a une date au FCH, avec filtres
//   #hermitage/partenaires  les partenaires du club
//   #hermitage/club         l'organisation du club — attend son contenu
//
// Ce site est fait pour grandir : Noé ne sait pas encore tout ce qu'il y
// mettra. Chaque écran est une sous-adresse indépendante, on en ajoute un sans
// toucher aux autres.

import * as api from './api.js';
import {
  modifierAussitot,
  retirerAussitot,
  identifiantProvisoire,
  estProvisoire,
} from './ecriture.js';
import {
  construireFormulaire,
  construireObjectifs,
  construireVictoires,
} from './espace-projet.js';
import {
  STATUTS,
  construireAVenir,
  construireBanque,
  construirePubliees,
  construireApercuCreation,
  formulaireIdee,
} from './publications.js';
import { depuisDateISO, echeanceLisible, momentLisible, echapper, versDateISO } from './format.js';
import {
  PHASES_PREPA,
  blocPhase,
  dernierBilan,
  feuilleDeLaSortie,
  boutonPreparer,
  finDeLaSortie,
  phaseDeLaSortie,
} from './preparations-commun.js';

import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  centrerActif,
  ongletCalendrier,
  toutesLesNatures,
  fenetreCreation,
  brancherCapture,
  poserAuCalendrier,
  REUNION_OBJETS,
} from './calendrier-commun.js';

const PROJET = 'fch';

// Les réseaux du club. Facebook d'abord : c'est celui des clubs amateurs, des
// parents et des bénévoles, avant Instagram.
const RESEAUX_FCH = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

// Proposées, pas imposées : à corriger dès que Noé connaîtra son rythme réel
// (docs/fch-spec.md, §7).
const RUBRIQUES_DEPART = [
  'Avant-match',
  'Résultats',
  'Portrait de joueur',
  'Coulisses',
  'Partenaire à l’honneur',
  'Vie du club',
];

// Les partenaires sont des contacts de type 'marque' : même table que le
// réseau de Yuno, c'est la même matière (docs/fch-spec.md, §5).
const TYPE_PARTENAIRE = 'marque';

const VUES = ['accueil', 'creer', 'reunions', 'calendrier', 'partenaires', 'club'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  // Le calendrier n'est plus dans cette liste : il va en bout de barre, en
  // icône (voir `ongletCalendrier`). « Partenaires » y gagne la place qui lui
  // manquait sur 375 px.
  const liens = [
    ['accueil', 'Accueil', '#hermitage'],
    ['creer', 'Créer', '#hermitage/creer'],
    ['reunions', 'Réunions', '#hermitage/reunions'],
    ['partenaires', 'Partenaires', '#hermitage/partenaires'],
    ['club', 'Club', '#hermitage/club'],
  ];

  return `
    <header class="fch-tete">
      <img class="fch-logo" src="img/fch-logo.png" alt="FC Hermitage">
    </header>
    <nav class="fch-nav" aria-label="Le site FC Hermitage">
      ${liens
        .map(
          ([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === vueActive ? 'actif' : ''}"
          ${vue === vueActive ? 'aria-current="page"' : ''}>${libelle}</a>`,
        )
        .join('')}
      ${ongletCalendrier('#hermitage/calendrier', vueActive === 'calendrier')}
    </nav>`;
}

// La seule mention du hub sur tout le site, tout en bas.
function pied() {
  return `
    <footer class="fch-pied">
      <a class="lien-discret" href="#fch">Quitter le site</a>
    </footer>`;
}

export function construirePartenaires(partenaires) {
  if (!partenaires.length) {
    return `<p class="vide">Les partenaires du club s'ajouteront ici.</p>`;
  }

  return `<ul>${partenaires
    .map((partenaire) => {
      const liens = [
        partenaire.email
          ? `<a href="mailto:${encodeURIComponent(partenaire.email)}">${echapper(partenaire.email)}</a>`
          : null,
        partenaire.telephone
          ? `<a href="tel:${echapper(partenaire.telephone.replace(/\s/g, ''))}">${echapper(partenaire.telephone)}</a>`
          : null,
      ].filter(Boolean);

      return `
        <li>
          <span class="tuile-entete">
            <span class="etiquette">Partenaire</span>
            ${
              partenaire.structure
                ? `<span class="contact-structure">${echapper(partenaire.structure)}</span>`
                : ''
            }
            <button type="button" class="lien-discret bouton-mini bouton-retirer"
              data-supprimer-partenaire="${echapper(partenaire.id)}"
              title="Retirer"
              aria-label="Retirer ${echapper(partenaire.nom)}">×</button>
          </span>
          <span class="partenaire-nom">${echapper(partenaire.nom)}</span>
          ${liens.length ? `<span class="partenaire-liens">${liens.join('<span class="discret"> · </span>')}</span>` : ''}
          ${partenaire.notes ? `<span class="discret partenaire-notes">${echapper(partenaire.notes)}</span>` : ''}
          <span class="contact-echange">
            <label class="discret">Dernier échange
              <input type="date" class="pub-programmer" data-echange="${echapper(partenaire.id)}"
                value="${echapper(partenaire.dernier_echange ?? '')}">
            </label>
          </span>
        </li>`;
    })
    .join('')}</ul>`;
}

// --- Les réunions --------------------------------------------------------------
// Une réunion est un ÉVÉNEMENT fch dont `reunion_objet` est posé (demande de
// Noé, 21 août 2026). Elle se note au calendrier — le « + », nature Événement,
// pastille Réunion — et se PRÉPARE ici : la feuille de Yuno, trois phases et
// un bilan, avec des modèles selon l'objet et selon qu'on anime ou non.
//
// Le bilan n'est PAS le compte-rendu officiel : c'est ce qui concerne Noé — à
// retenir, à faire — plus, s'il animait, un regard sur le déroulé. Et chaque
// ligne « à faire » devient une tâche fch à l'enregistrement : ce qui se
// décide en réunion entre dans le circuit, au lieu de dormir dans une note.

const estReunion = (evenement) => Boolean(evenement.reunion_objet);

function etiquettesReunion(evenement) {
  return `<span class="etiquette">${echapper(
    REUNION_OBJETS[evenement.reunion_objet] ?? 'Réunion',
  )}</span>${evenement.reunion_animee ? `<span class="etiquette">J'anime</span>` : ''}`;
}

// Le modèle qui correspond le mieux à la réunion : même objet et même rôle
// d'abord, puis même objet peu importe le rôle, puis l'objet « autre », puis
// une feuille vierge. Proposé D'OFFICE : le bon réflexe ne doit rien coûter.
export function modelePourReunion(modeles, evenement) {
  const duProjet = modeles.filter((modele) => modele.projet === PROJET);
  const memeObjet = duProjet.filter((modele) => modele.objet === evenement.reunion_objet);

  return (
    memeObjet.find((modele) => modele.anime === Boolean(evenement.reunion_animee)) ??
    memeObjet.find((modele) => modele.anime === null) ??
    memeObjet[0] ??
    duProjet.find((modele) => modele.objet === 'autre') ??
    null
  );
}

function ligneReunion(evenement, preparations) {
  const feuille = feuilleDeLaSortie(preparations, 'evenement', evenement.id);

  return `
    <li>
      <span class="tuile-entete">
        ${etiquettesReunion(evenement)}
        <span class="discret quand">${echapper(
          momentLisible(new Date(evenement.date_debut)),
        )}</span>
      </span>
      <span class="reunion-titre">${echapper(evenement.titre)}</span>
      ${
        feuille?.bilan_date
          ? `<span class="discret">Bilan écrit ${echapper(
              echeanceLisible(depuisDateISO(feuille.bilan_date)),
            )}</span>`
          : ''
      }
      ${boutonPreparer(feuille, 'evenement', evenement.id)}
    </li>`;
}

// Le bilan d'une réunion. Deux questions pour tous, une troisième pour
// l'animateur — et le contrat des tâches écrit noir sur blanc sous le champ.
function blocBilanReunion(feuille, evenement) {
  const animee = Boolean(evenement?.reunion_animee);
  const pasEncore =
    evenement && new Date(evenement.date_debut) > new Date() && !feuille.bilan_date;

  if (pasEncore) {
    return `
      <section class="bloc prepa-bilan">
        <h2>Le bilan</h2>
        <p class="discret">Il s'écrira après la réunion — ce qui te concerne,
          pas le compte-rendu officiel.</p>
      </section>`;
  }

  return `
    <section class="bloc prepa-bilan">
      <h2>Le bilan</h2>
      <form data-action="noter-bilan-reunion" class="ajout">
        <input type="hidden" name="id" value="${echapper(feuille.id)}">
        <label for="reunion-bilan-retenu">Ce qu'il faut retenir — pour toi</label>
        <textarea id="reunion-bilan-retenu" name="bilan_bien" rows="3">${echapper(
          feuille.bilan_bien ?? '',
        )}</textarea>
        <label for="reunion-bilan-actions">Ce que ça te donne à faire — une ligne, une tâche</label>
        <textarea id="reunion-bilan-actions" name="bilan_mieux" rows="3">${echapper(
          feuille.bilan_mieux ?? '',
        )}</textarea>
        ${
          animee
            ? `<label for="reunion-bilan-animation">Comment la réunion s'est déroulée —
                 à refaire autrement quand tu animeras</label>
               <textarea id="reunion-bilan-animation" name="bilan_animation" rows="3">${echapper(
                 feuille.bilan_animation ?? '',
               )}</textarea>`
            : ''
        }
        <p class="discret">${
          feuille.bilan_date
            ? 'Le bilan est écrit — le corriger ne recrée pas de tâches.'
            : 'À l\'enregistrement, chaque ligne « à faire » devient une tâche FCH.'
        }</p>
        <button type="submit" class="bouton-secondaire">Enregistrer le bilan</button>
        <p class="message-erreur" data-erreur hidden></p>
      </form>
    </section>`;
}

function vueFeuilleReunion(etat, feuille) {
  const evenement = etat.evenements.find((e) => e.id === feuille.evenement_id) ?? null;
  const precedent = feuille.bilan_date ? null : dernierBilan(etat.preparations, feuille);
  const auModele = etat.modelesPrepa.some((modele) => modele.id === feuille.modele_id);

  return `
    ${enTete('reunions')}
    <h2 class="titre-page">${echapper(feuille.titre)}</h2>
    <p class="discret prepa-date">
      ${feuille.date ? echapper(echeanceLisible(depuisDateISO(feuille.date))) : ''}
      ${evenement ? `· ${echapper(REUNION_OBJETS[evenement.reunion_objet] ?? 'Réunion')}${
        evenement.reunion_animee ? " · j'anime" : ''
      }` : ''}
    </p>
    ${
      precedent
        ? `<p class="discret prepa-rappel">Ton dernier bilan — à refaire autrement :
             « ${echapper(precedent.bilan_animation ?? precedent.bilan_mieux)} »</p>`
        : ''
    }
    <div class="prepa-phases">
      ${blocPhase(feuille, 'avant', { auModele })}
      ${blocPhase(feuille, 'pendant', { auModele })}
      ${blocPhase(feuille, 'apres', { auModele })}
    </div>
    ${blocBilanReunion(feuille, evenement)}
    <p><button type="button" class="lien-discret" data-supprimer-prepa="${echapper(feuille.id)}">
      Supprimer la préparation</button></p>
    ${pied()}`;
}

function vueReunions(etat) {
  if (etat.reunionOuverte) {
    const feuille = etat.preparations.find((f) => f.id === etat.reunionOuverte);
    if (feuille) return vueFeuilleReunion(etat, feuille);
  }

  const reunions = etat.evenements.filter(estReunion);
  const maintenant = new Date();
  const aVenir = reunions
    .filter((e) => finDeLaSortie(e) >= maintenant)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
  const passees = reunions
    .filter((e) => finDeLaSortie(e) < maintenant)
    .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut));

  return `
    ${enTete('reunions')}

    <section class="bloc">
      <h2>À préparer</h2>
      ${
        aVenir.length
          ? `<ul>${aVenir.map((e) => ligneReunion(e, etat.preparations)).join('')}</ul>`
          : `<p class="vide">Ta prochaine réunion se note au calendrier : le « + »,
              nature Événement, pastille Réunion.</p>`
      }
    </section>

    ${
      passees.length
        ? `<section class="bloc">
             <h2>Passées</h2>
             <ul>${passees.map((e) => ligneReunion(e, etat.preparations)).join('')}</ul>
           </section>`
        : ''
    }
    ${pied()}`;
}

// La réunion du moment, en tête de l'accueil (demande de Noé, 21 août 2026) —
// le pendant de « la sortie du moment » chez Yuno : le jour d'un conseil, ce
// qui compte n'est ni la com' ni les objectifs, c'est ce qu'il reste à faire.
function blocReunionDuMoment(etat) {
  const maintenant = new Date();
  const reunions = etat.evenements.filter(estReunion);

  const enCours = reunions
    .filter((e) => {
      const phase = phaseDeLaSortie(e, maintenant);
      return phase === 'pendant' || phase === 'apres';
    })
    .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))[0];
  const prochaine = reunions
    .filter((e) => new Date(e.date_debut) > maintenant)
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0];

  const reunion = enCours ?? prochaine;
  if (!reunion) return '';

  const phase = phaseDeLaSortie(reunion, maintenant) ?? 'avant';
  const feuille = feuilleDeLaSortie(etat.preparations, 'evenement', reunion.id);
  const restent = feuille
    ? feuille.items.filter((item) => item.phase === phase && !item.fait)
    : [];

  return `
    <section class="bloc">
      <span class="tuile-entete">
        <span class="etiquette">${PHASES_PREPA[phase]}</span>
        ${etiquettesReunion(reunion)}
        <span class="discret quand">${echapper(
          momentLisible(new Date(reunion.date_debut)),
        )}</span>
      </span>
      <h2 class="reunion-moment-titre">${echapper(reunion.titre)}</h2>
      ${
        feuille
          ? `${
              restent.length
                ? `<ul class="liste-taches-pleine prepa-liste">${restent
                    .slice(0, 3)
                    .map(
                      (item) => `
                  <li class="tache-ligne">
                    <button type="button" class="tache-cercle" data-cocher-prepa="${echapper(item.id)}"
                      aria-pressed="false"
                      aria-label="Cocher « ${echapper(item.texte)} »"></button>
                    <span class="tache-corps"><span class="tache-titre">${echapper(item.texte)}</span></span>
                  </li>`,
                    )
                    .join('')}</ul>`
                : `<p class="discret">Tout est coché pour cette phase.</p>`
            }
            <a class="lien-discret" href="#hermitage/reunions/${echapper(feuille.id)}">Ouvrir la
              préparation${restent.length > 3 ? ` · ${restent.length} lignes à faire` : ''}</a>`
          : boutonPreparer(null, 'evenement', reunion.id)
      }
    </section>`;
}

// --- Les vues ----------------------------------------------------------------

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}
    ${blocReunionDuMoment(etat)}

    <section class="bloc">
      <h2>Objectifs de fin d'alternance</h2>
      <div data-bloc="objectifs">${construireObjectifs(etat.objectifs)}</div>
      ${construireFormulaire({
        id: 'fch-objectif',
        libelle: 'Ajouter un objectif',
        action: 'creer-objectif',
        champs: [
          { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true },
          { nom: 'pourquoi', libelle: 'Pourquoi ?', type: 'textarea' },
          { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' },
          { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
        ],
      })}
    </section>

    <section class="bloc">
      <h2>La com' à venir</h2>
      <div data-bloc="apercu">${construireApercuCreation(etat.publications)}</div>
      <a class="lien-externe" href="#hermitage/creer">
        <span class="lien-externe-texte">
          <span class="lien-externe-titre">Ouvrir le calendrier éditorial</span>
          <span class="discret">Programmer, piocher dans la banque d'idées</span>
        </span>
        <span class="lien-externe-fleche" aria-hidden="true">→</span>
      </a>
    </section>

    <section class="bloc">
      <h2>Victoires</h2>
      <div data-bloc="victoires">${construireVictoires(etat.victoires)}</div>
    </section>
    ${pied()}`;
}

function vueCreer(etat) {
  return `
    ${enTete('creer')}

    <section class="bloc">
      <h2>Calendrier éditorial</h2>
      ${formulaireIdee({
        id: 'fch-pub',
        publications: etat.publications,
        rubriquesDepart: RUBRIQUES_DEPART,
        reseaux: RESEAUX_FCH,
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
  // L'état porte aussi le passé depuis que les réunions ont leurs bilans ; le
  // calendrier du site, lui, continue de ne montrer que ce qui vient.
  const maintenant = new Date();
  const elements = assemblerCalendrier({
    evenements: etat.evenements.filter((e) => new Date(e.date_debut) >= maintenant),
    taches: etat.taches,
    objectifs: etat.objectifs,
    publications: etat.publications.filter(
      (pub) => pub.date_prevue && pub.statut !== 'publie',
    ),
  });

  return `
    ${enTete('calendrier')}
    ${construireFiltres(etat.natures)}
    <div data-bloc="calendrier">
      ${construireCalendrier(elements, etat.natures)}
    </div>
    ${pied()}`;
}

function vuePartenaires(etat) {
  return `
    ${enTete('partenaires')}

    <section class="bloc">
      <h2>Partenaires</h2>
      <div data-bloc="partenaires">${construirePartenaires(etat.partenaires)}</div>
      ${construireFormulaire({
        id: 'partenaire',
        libelle: 'Ajouter un partenaire',
        action: 'creer-partenaire',
        champs: [
          { nom: 'structure', libelle: 'Entreprise', type: 'text', requis: true },
          { nom: 'nom', libelle: 'Interlocuteur', type: 'text', requis: true },
          { nom: 'email', libelle: 'E-mail', type: 'text' },
          { nom: 'telephone', libelle: 'Téléphone', type: 'text' },
          { nom: 'notes', libelle: 'Notes — où en est la discussion', type: 'textarea' },
        ],
      })}
    </section>
    ${pied()}`;
}

// L'écran qui attend son contenu. Il dit ce qu'il attend plutôt que de faire
// semblant : Noé ne sait pas encore ce qu'il y mettra, et inventer à sa place
// serait le pire service à lui rendre.
function vueClub() {
  return `
    ${enTete('club')}

    <section class="bloc">
      <h2>Organisation du club</h2>
      <div class="a-venir-bloc">
        <p>Cet écran attend de savoir à quoi il sert.</p>
        <p class="discret">Effectifs, plannings, licences, réunions, matériel —
          dis-moi ce que tu as besoin de retrouver ici, et on le construit.</p>
      </div>
    </section>
    ${pied()}`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    const etat = {
      objectifs: [],
      victoires: [],
      publications: [],
      taches: [],
      evenements: [],
      partenaires: [],
      preparations: [],
      modelesPrepa: [],
      vue: 'accueil',
      // La feuille de réunion ouverte : son id vient de l'adresse
      // (#hermitage/reunions/<id>), jamais d'un état d'interface.
      reunionOuverte: null,
      // La tuile de capture du « + » : le site en a une depuis le 21 août 2026
      // (décision de Noé) — une réunion se note en sortant de la salle.
      creationCal: null,
      // `filtre` est celui des publications ; `natures` celui du calendrier.
      // Les deux ont longtemps été confondus — `vueCalendrier` passait `filtre`
      // (la chaîne « tout ») là où le calendrier attend un Set, et l'écran
      // levait `natures.has is not a function` sans que rien ne s'affiche.
      filtre: 'tout',
      natures: toutesLesNatures(),
      // Le mot dit après une écriture qui a échoué. L'écran est déjà revenu en
      // arrière tout seul ; un geste défait en silence ressemble à une panne.
      souci: null,
    };

    let minuteurSouci = null;
    const dire = (message) => {
      etat.souci = message;
      rendre();
      clearTimeout(minuteurSouci);
      minuteurSouci = setTimeout(() => {
        etat.souci = null;
        rendre();
      }, 6000);
    };

    const rendre = () => {
      if (etat.vue === 'creer') section.innerHTML = vueCreer(etat);
      else if (etat.vue === 'reunions') section.innerHTML = vueReunions(etat);
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'partenaires') section.innerHTML = vuePartenaires(etat);
      else if (etat.vue === 'club') section.innerHTML = vueClub();
      else section.innerHTML = vueAccueil(etat);

      // Le « + » flottant suit toutes les vues (décision de Noé, 21 août
      // 2026) : une réunion se note en sortant de la salle, pas en pensant à
      // revenir sur la bonne page. La tuile est celle du hub — nature
      // Événement d'abord, la pastille Réunion toujours offerte.
      section.insertAdjacentHTML(
        'beforeend',
        `<button type="button" class="ouvrir-capture" data-ouvrir-plus
           title="Ajouter" aria-label="Ajouter">+</button>`,
      );
      if (etat.creationCal) {
        section.insertAdjacentHTML(
          'beforeend',
          fenetreCreation({ ...etat.creationCal, reunion: true }),
        );
      }

      if (etat.souci) {
        section
          .querySelector('.fch-nav')
          ?.insertAdjacentHTML('afterend', `<p class="vide">${echapper(etat.souci)}</p>`);
      }

      centrerActif(section.querySelector('.fch-nav'));
      centrerActif(section.querySelector('.filtres'));
    };

    // Une victoire qui n'existe pas encore en base : elle s'affiche pendant
    // l'aller-retour, puis cède la place à la vraie — ou disparaît si
    // l'écriture a échoué. Le mur des victoires ne peut que monter, il ne doit
    // donc jamais garder un accomplissement qui n'a pas eu lieu.
    const victoireProvisoire = (titre) => ({
      id: identifiantProvisoire(),
      projet: PROJET,
      titre,
      date: versDateISO(),
    });

    const remplacerVictoire = (provisoire, vraie) => {
      const rang = etat.victoires.indexOf(provisoire);
      if (rang !== -1 && vraie) etat.victoires[rang] = vraie;
    };

    const retirerVictoire = (provisoire) => {
      const rang = etat.victoires.indexOf(provisoire);
      if (rang !== -1) etat.victoires.splice(rang, 1);
      rendre();
    };

    const rendrePartenaires = () => {
      const cible = section.querySelector('[data-bloc="partenaires"]');
      if (cible) cible.innerHTML = construirePartenaires(etat.partenaires);
    };

    this.naviguer = (nouvelleRoute) => {
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      etat.reunionOuverte = etat.vue === 'reunions' ? nouvelleRoute?.id ?? null : null;
      rendre();
    };

    const charger = async () => {
      const [objectifs, victoires, publications, taches, evenements, contacts, feuilles, modeles] =
        await Promise.all([
          api.objectifsActifs({ projet: PROJET }),
          api.victoiresDuProjet(PROJET),
          api.publicationsToutes(PROJET),
          api.tachesDatees({ projet: PROJET }),
          // TOUS les événements depuis le 21 août 2026, plus seulement ceux à
          // venir : les réunions passées portent leurs bilans. Le calendrier,
          // lui, refiltre l'avenir — son affichage n'a pas bougé.
          api.evenementsTous({ projet: PROJET }),
          api.contactsTous(),
          api.preparationsToutes(),
          api.modelesPreparationTous(),
        ]);

      Object.assign(etat, {
        objectifs,
        victoires,
        publications,
        taches,
        evenements,
        partenaires: contacts.filter((contact) => contact.type === TYPE_PARTENAIRE),
        // Les feuilles des autres projets ne gênent pas : elles ne se
        // rattachent à aucun événement fch, rien ne les affiche. Les modèles,
        // eux, sont filtrés : la liste de choix ne doit dire que le club.
        preparations: feuilles,
        modelesPrepa: modeles.filter((modele) => modele.projet === PROJET),
      });
    };

    // Revenir sur le site le relit : ce qui a été posé depuis le hub doit s'y
    // voir sans recharger la page.
    this.rafraichir = async () => {
      await charger();
      rendre();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement du site FC Hermitage impossible', erreur);
      section.innerHTML = `
        ${enTete('accueil')}
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section, route));
      return;
    }

    // La tuile de capture : le site a son « + » depuis le 21 août 2026
    // (décision de Noé). `brancherCapture` branche AUSSI les menus déroulants
    // des formulaires — `brancherChoix`, qui servait quand ce site n'avait pas
    // de tuile, est parti avec : les deux ensemble traitaient chaque clic deux
    // fois, et un panneau basculé deux fois reste fermé.
    brancherCapture(section);

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
      // La tuile du « + » : tout passe par le circuit commun, projet fch.
      if (action === 'creer-depuis-calendrier') {
        await poserAuCalendrier(champs, { projetParDefaut: PROJET });
        etat.creationCal = null;
        await charger();
        rendre();
        return;
      }

      if (action === 'ajouter-item-prepa') {
        const feuille = etat.preparations.find((f) => f.id === champs.preparation_id);
        if (!feuille) return;
        const item = await api.ajouterItemPreparation({
          preparation_id: champs.preparation_id,
          phase: champs.phase,
          texte: champs.texte.trim(),
        });
        feuille.items.push(item);
        // La boucle d'apprentissage : l'item peut entrer au modèle d'origine.
        if (champs.au_modele === 'oui' && feuille.modele_id) {
          await api.ajouterItemModele({
            modele_id: feuille.modele_id,
            phase: champs.phase,
            texte: champs.texte.trim(),
          });
        }
        rendre();
        return;
      }

      if (action === 'noter-bilan-reunion') {
        const feuille = etat.preparations.find((f) => f.id === champs.id);
        if (!feuille) return;

        const evenement = etat.evenements.find((e) => e.id === feuille.evenement_id);
        // Les tâches ne naissent qu'à la PREMIÈRE écriture : corriger un bilan
        // ne doit pas les recréer en double.
        const premiereEcriture = !feuille.bilan_date;

        const misAJour = await api.noterBilan(champs.id, {
          bilan_bien: champs.bilan_bien?.trim() || null,
          bilan_mieux: champs.bilan_mieux?.trim() || null,
          ...(evenement?.reunion_animee
            ? { bilan_animation: champs.bilan_animation?.trim() || null }
            : {}),
        });
        Object.assign(feuille, misAJour);

        if (premiereEcriture) {
          const actions = (champs.bilan_mieux ?? '')
            .split('\n')
            .map((ligne) => ligne.trim())
            .filter(Boolean);
          for (const titre of actions) {
            etat.taches.push(
              await api.creerTache({ projet: PROJET, titre, statut: 'actif', priorite: 4 }),
            );
          }
          if (actions.length) {
            dire(
              `${actions.length} tâche${actions.length > 1 ? 's' : ''} créée${
                actions.length > 1 ? 's' : ''
              } depuis le bilan — elles t'attendent au hub.`,
            );
          }
        }

        rendre();
        return;
      }

      if (action === 'noter-idee') {
        const publication = await api.creerPublication({
          projet: PROJET,
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

      if (action === 'creer-partenaire') {
        const partenaire = await api.creerContact({
          nom: champs.nom.trim(),
          type: TYPE_PARTENAIRE,
          structure: champs.structure.trim(),
          email: champs.email?.trim() || null,
          telephone: champs.telephone?.trim() || null,
          notes: champs.notes?.trim() || null,
        });
        etat.partenaires = [...etat.partenaires, partenaire].sort((a, b) =>
          (a.structure ?? '').localeCompare(b.structure ?? ''),
        );
        rendrePartenaires();
        return;
      }

      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          projet: PROJET,
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
        Object.assign(
          objectif,
          await api.modifierObjectif(champs.objectif_id, {
            titre: champs.titre.trim(),
            pourquoi: champs.pourquoi?.trim() || null,
            cible: champs.cible?.trim() || null,
            echeance: champs.echeance || null,
          }),
        );
        rendre();
        ouvrirObjectif(objectif.id);
      }
    }

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      // Le « + » ouvre la tuile, sur un événement : c'est pour noter une
      // réunion que ce site l'a gagnée. Le fond assombri la referme.
      if (evenement.target.closest('[data-ouvrir-plus]')) {
        etat.creationCal = { debut: versDateISO(), nature: 'evenement' };
        rendre();
        section.querySelector('#cal-titre')?.focus();
        return;
      }
      if (evenement.target.closest('[data-fermer-fenetre]')) {
        etat.creationCal = null;
        rendre();
        return;
      }

      // « Préparer » : la feuille naît du modèle qui correspond — même objet,
      // même rôle — proposé d'office. Le bon réflexe ne doit rien coûter.
      const preparer = evenement.target.closest('[data-preparer]');
      if (preparer) {
        const [, id] = preparer.dataset.preparer.split(':');
        const reunion = etat.evenements.find((e) => e.id === id);
        if (!reunion) return;
        try {
          const feuille = await api.creerPreparation({
            modele: modelePourReunion(etat.modelesPrepa, reunion),
            evenement_id: reunion.id,
            titre: reunion.titre,
            date: versDateISO(new Date(reunion.date_debut)),
          });
          etat.preparations.unshift(feuille);
          location.hash = `#hermitage/reunions/${feuille.id}`;
        } catch (souci) {
          console.error('Création de la préparation impossible', souci);
          dire("La préparation n'a pas pu être créée.");
        }
        return;
      }

      const ouvrirPrepa = evenement.target.closest('[data-ouvrir-preparation]');
      if (ouvrirPrepa) {
        location.hash = `#hermitage/reunions/${ouvrirPrepa.dataset.ouvrirPreparation}`;
        return;
      }

      // Cocher une ligne — depuis la feuille comme depuis l'accueil. L'écran
      // d'abord, l'écriture derrière, le retour en arrière si elle échoue.
      const cocherPrepa = evenement.target.closest('[data-cocher-prepa]');
      if (cocherPrepa) {
        const id = cocherPrepa.dataset.cocherPrepa;
        for (const feuille of etat.preparations) {
          const item = feuille.items.find((candidat) => candidat.id === id);
          if (!item) continue;
          await modifierAussitot(
            item,
            { fait: !item.fait },
            () => api.modifierItemPreparation(id, { fait: !item.fait }),
            { rendre, echouer: dire },
          );
          return;
        }
        return;
      }

      const retirerPrepa = evenement.target.closest('[data-retirer-prepa]');
      if (retirerPrepa) {
        const id = retirerPrepa.dataset.retirerPrepa;
        for (const feuille of etat.preparations) {
          const rang = feuille.items.findIndex((candidat) => candidat.id === id);
          if (rang === -1) continue;
          await retirerAussitot(
            feuille.items,
            feuille.items[rang],
            () => api.supprimerItemPreparation(id),
            { rendre, echouer: dire },
          );
          return;
        }
        return;
      }

      const supprimerPrepa = evenement.target.closest('[data-supprimer-prepa]');
      if (supprimerPrepa) {
        const id = supprimerPrepa.dataset.supprimerPrepa;
        try {
          await api.supprimerPreparation(id);
          etat.preparations = etat.preparations.filter((f) => f.id !== id);
          location.hash = '#hermitage/reunions';
        } catch (souci) {
          console.error('Suppression impossible', souci);
          dire("La préparation n'a pas pu être supprimée.");
        }
        return;
      }

      const filtre = evenement.target.closest('[data-filtre]');
      if (filtre) {
        etat.filtre = filtre.dataset.filtre;
        rendre();
        return;
      }

      // Les cases du calendrier : une nature qu'on décoche disparaît de la
      // liste. Même geste que dans l'espace Calendrier du hub.
      const filtreNature = evenement.target.closest('[data-filtre-nature]');
      if (filtreNature) {
        const suite = new Set(etat.natures);
        const cle = filtreNature.dataset.filtreNature;
        if (suite.has(cle)) suite.delete(cle);
        else suite.add(cle);
        etat.natures = suite;
        rendre();
        return;
      }

      const supprimerPartenaire = evenement.target.closest('[data-supprimer-partenaire]');
      if (supprimerPartenaire) {
        const partenaire = etat.partenaires.find(
          (p) => p.id === supprimerPartenaire.dataset.supprimerPartenaire,
        );
        if (!partenaire || estProvisoire(partenaire.id)) return;
        await retirerAussitot(
          etat.partenaires,
          partenaire,
          () => api.supprimerContact(partenaire.id),
          { rendre: rendrePartenaires, echouer: dire },
        );
        return;
      }

      const avancer = evenement.target.closest('[data-avancer]');
      if (avancer) {
        const pub = trouverPub(avancer.dataset.avancer);
        const suivant = STATUTS[STATUTS.indexOf(pub.statut) + 1];
        if (!suivant || estProvisoire(pub.id)) return;
        await modifierAussitot(
          pub,
          { statut: suivant },
          () => api.modifierPublication(pub.id, { statut: suivant }),
          { rendre, echouer: dire },
        );
        return;
      }

      const deprogrammer = evenement.target.closest('[data-deprogrammer]');
      if (deprogrammer) {
        const pub = trouverPub(deprogrammer.dataset.deprogrammer);
        if (!pub || estProvisoire(pub.id)) return;
        await modifierAussitot(
          pub,
          { date_prevue: null },
          () => api.modifierPublication(pub.id, { date_prevue: null }),
          { rendre, echouer: dire },
        );
        return;
      }

      const supprimerPub = evenement.target.closest('[data-supprimer-pub]');
      if (supprimerPub) {
        const pub = trouverPub(supprimerPub.dataset.supprimerPub);
        if (!pub || estProvisoire(pub.id)) return;
        await retirerAussitot(etat.publications, pub, () => api.supprimerPublication(pub.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      // Cocher un jalon fait deux choses : la barre avance, et la victoire
      // monte. Les deux se voient tout de suite ; la victoire provisoire part
      // si l'écriture échoue, sinon le mur garderait un accomplissement qui
      // n'a pas eu lieu.
      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) {
        const objectif = etat.objectifs.find((candidat) =>
          candidat.jalons?.some((j) => j.id === jalon.dataset.jalon),
        );
        const cible = objectif?.jalons.find((j) => j.id === jalon.dataset.jalon);
        if (!cible || estProvisoire(cible.id)) return;

        const avantJalon = { ...cible };
        const provisoire = victoireProvisoire(cible.titre);
        etat.victoires.unshift(provisoire);

        const atteint = await modifierAussitot(
          cible,
          { atteint: true, date_atteint: versDateISO() },
          async () => {
            const { jalon: fait, victoire } = await api.atteindreJalon(avantJalon, PROJET);
            remplacerVictoire(provisoire, victoire);
            return fait;
          },
          {
            rendre: () => {
              rendre();
              ouvrirObjectif(objectif.id);
            },
            echouer: dire,
          },
        );
        if (!atteint) retirerVictoire(provisoire);
        return;
      }

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) {
        const objectif = etat.objectifs.find((o) => o.id === atteindre.dataset.atteindre);
        if (!objectif || estProvisoire(objectif.id)) return;
        if (!confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;

        const provisoire = victoireProvisoire(objectif.titre);
        etat.victoires.unshift(provisoire);

        const fait = await retirerAussitot(
          etat.objectifs,
          objectif,
          async () => {
            const { victoire } = await api.atteindreObjectif(objectif);
            remplacerVictoire(provisoire, victoire);
          },
          { rendre, echouer: dire },
        );
        if (!fait) retirerVictoire(provisoire);
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
        if (estProvisoire(objectif.id)) return;
        await retirerAussitot(etat.objectifs, objectif, () => api.supprimerObjectif(objectif.id), {
          rendre,
          echouer: dire,
        });
        return;
      }

      const victoire = evenement.target.closest('[data-victoire]');
      if (victoire) {
        const ligne = etat.victoires.find((v) => v.id === victoire.dataset.victoire);
        if (!ligne || estProvisoire(ligne.id)) return;
        await retirerAussitot(etat.victoires, ligne, () => api.supprimerVictoire(ligne.id), {
          rendre,
          echouer: dire,
        });
      }
    });

    section.addEventListener('change', async (evenement) => {
      const programmer = evenement.target.closest('[data-programmer]');
      if (programmer && programmer.value) {
        const pub = trouverPub(programmer.dataset.programmer);
        if (!pub || estProvisoire(pub.id)) return;
        const jour = programmer.value;
        await modifierAussitot(
          pub,
          { date_prevue: jour },
          () => api.modifierPublication(pub.id, { date_prevue: jour }),
          { rendre, echouer: dire },
        );
        return;
      }

      const echange = evenement.target.closest('[data-echange]');
      if (echange) {
        const partenaire = etat.partenaires.find((p) => p.id === echange.dataset.echange);
        if (!partenaire || estProvisoire(partenaire.id)) return;
        const jour = echange.value || null;
        // Sans redessin : la date est déjà dans le champ, sous les yeux. Le
        // retour en arrière, lui, doit se voir.
        await modifierAussitot(
          partenaire,
          { dernier_echange: jour },
          () => api.modifierContact(partenaire.id, { dernier_echange: jour }),
          { echouer: (message) => { rendrePartenaires(); dire(message); } },
        );
      }
    });
  },
};
