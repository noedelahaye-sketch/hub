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
import { echapper } from './format.js';
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

const VUES = ['accueil', 'creer', 'calendrier', 'reseau', 'commandes'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  const liens = [
    ['accueil', 'Accueil', '#yuno'],
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

// --- Les vues ----------------------------------------------------------------

function vueAccueil(etat) {
  return `
    ${enTete('accueil')}

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
  marque: 'Marque',
  autre: 'Autre',
};

// L'identifiant peut être saisi avec ou sans arobase, ou collé en URL entière.
function pseudoInstagram(valeur) {
  return valeur
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
}

export function construireContacts(contacts, recherche = '', type = 'tout') {
  const terme = recherche.trim().toLowerCase();
  const retenus = contacts.filter((contact) => {
    if (type !== 'tout' && contact.type !== type) return false;
    if (!terme) return true;
    return `${contact.nom} ${contact.structure ?? ''}`.toLowerCase().includes(terme);
  });

  if (!retenus.length) {
    return contacts.length
      ? `<p class="vide">Personne ne correspond à cette recherche.</p>`
      : `<p class="vide">Ton carnet démarre ici — joueurs, médias, clubs.</p>`;
  }

  return `<ul class="liste-contacts">${retenus
    .map((contact) => {
      const pseudo = contact.instagram ? pseudoInstagram(contact.instagram) : null;
      const liens = [
        pseudo
          ? `<a href="https://instagram.com/${encodeURIComponent(pseudo)}"
               target="_blank" rel="noopener">@${echapper(pseudo)}</a>`
          : null,
        contact.email
          ? `<a href="mailto:${encodeURIComponent(contact.email)}">${echapper(contact.email)}</a>`
          : null,
        contact.telephone
          ? `<a href="tel:${echapper(contact.telephone.replace(/\s/g, ''))}">${echapper(contact.telephone)}</a>`
          : null,
      ].filter(Boolean);

      return `
        <li>
          <span class="tuile-entete">
            <span class="etiquette">${TYPES_CONTACT[contact.type] ?? contact.type}</span>
            ${
              contact.structure
                ? `<span class="contact-structure">${echapper(contact.structure)}</span>`
                : ''
            }
            <button type="button" class="lien-discret bouton-mini bouton-retirer"
              data-supprimer-contact="${echapper(contact.id)}"
              title="Retirer du carnet"
              aria-label="Retirer ${echapper(contact.nom)}">×</button>
          </span>
          <span class="contact-nom">${echapper(contact.nom)}</span>
          ${liens.length ? `<span class="contact-liens">${liens.join('<span class="discret"> · </span>')}</span>` : ''}
          ${contact.notes ? `<span class="discret contact-notes">${echapper(contact.notes)}</span>` : ''}
          <span class="contact-echange">
            <label class="discret">Dernier échange
              <input type="date" class="pub-programmer" data-echange="${echapper(contact.id)}"
                value="${echapper(contact.dernier_echange ?? '')}">
            </label>
          </span>
        </li>`;
    })
    .join('')}</ul>`;
}

function vueReseau(etat) {
  const filtres = [['tout', 'Tout'], ...Object.entries(TYPES_CONTACT)];

  return `
    ${enTete('reseau')}

    <section class="bloc">
      <input type="search" id="recherche-contact" class="recherche"
        placeholder="Chercher un nom, un club, un média…"
        value="${echapper(etat.rechercheContact)}">
      <div class="filtres" role="group" aria-label="Filtrer le carnet">
        ${filtres
          .map(
            ([valeur, libelle]) => `
          <button type="button" data-type-contact="${valeur}"
            aria-pressed="${valeur === etat.typeContact}"
            class="${valeur === etat.typeContact ? 'actif' : ''}">${libelle}</button>`,
          )
          .join('')}
      </div>
      <div data-bloc="contacts">
        ${construireContacts(etat.contacts, etat.rechercheContact, etat.typeContact)}
      </div>
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
          { nom: 'notes', libelle: 'Notes', type: 'textarea' },
        ],
      })}
    </section>
    ${pied()}`;
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
      publications: [],
      taches: [],
      evenements: [],
      contacts: [],
      commandes: [],
      vue: 'accueil',
      filtre: 'tout',
      rechercheContact: '',
      typeContact: 'tout',
    };

    const rendre = () => {
      if (etat.vue === 'creer') section.innerHTML = vueCreer(etat);
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
        cible.innerHTML = construireContacts(
          etat.contacts,
          etat.rechercheContact,
          etat.typeContact,
        );
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
      const [objectifs, victoires, publications, taches, evenements, contacts, commandes] =
        await Promise.all([
          api.objectifsActifs({ projet: 'photo' }),
          api.victoiresDuProjet('photo'),
          api.publicationsToutes('photo'),
          api.tachesDatees({ projet: 'photo' }),
          api.evenementsDepuis(new Date().toISOString(), { projet: 'photo' }),
          api.contactsTous(),
          api.commandesToutes(),
        ]);
      Object.assign(etat, {
        objectifs,
        victoires,
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

      const typeContact = evenement.target.closest('[data-type-contact]');
      if (typeContact) {
        etat.typeContact = typeContact.dataset.typeContact;
        rendre();
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
      const echange = evenement.target.closest('[data-echange]');
      if (echange) {
        const contact = etat.contacts.find((c) => c.id === echange.dataset.echange);
        if (!contact) return;
        try {
          Object.assign(
            contact,
            await api.modifierContact(contact.id, { dernier_echange: echange.value || null }),
          );
        } catch (souci) {
          console.error("Enregistrement du dernier échange impossible", souci);
        }
      }
    });
  },
};
