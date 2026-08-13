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
import { depuisDateISO, echeanceLisible, echapper, versDateISO } from './format.js';
import {
  assemblerCalendrier,
  construireCalendrier,
  construireFiltres,
  centrerActif,
  ongletCalendrier,
  toutesLesNatures,
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

const VUES = ['accueil', 'creer', 'calendrier', 'partenaires', 'club'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  // Le calendrier n'est plus dans cette liste : il va en bout de barre, en
  // icône (voir `ongletCalendrier`). « Partenaires » y gagne la place qui lui
  // manquait sur 375 px.
  const liens = [
    ['accueil', 'Accueil', '#hermitage'],
    ['creer', 'Créer', '#hermitage/creer'],
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

// --- Les vues ----------------------------------------------------------------

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}

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
  const elements = assemblerCalendrier({
    evenements: etat.evenements,
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
      vue: 'accueil',
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
      else if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'partenaires') section.innerHTML = vuePartenaires(etat);
      else if (etat.vue === 'club') section.innerHTML = vueClub();
      else section.innerHTML = vueAccueil(etat);

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
      rendre();
    };

    const charger = async () => {
      const [objectifs, victoires, publications, taches, evenements, contacts] =
        await Promise.all([
          api.objectifsActifs({ projet: PROJET }),
          api.victoiresDuProjet(PROJET),
          api.publicationsToutes(PROJET),
          api.tachesDatees({ projet: PROJET }),
          api.evenementsDepuis(new Date().toISOString(), { projet: PROJET }),
          api.contactsTous(),
        ]);

      Object.assign(etat, {
        objectifs,
        victoires,
        publications,
        taches,
        evenements,
        partenaires: contacts.filter((contact) => contact.type === TYPE_PARTENAIRE),
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
