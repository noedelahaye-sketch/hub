// Espace Yuno — le quartier général du photographe (docs/yuno-spec.md).
//
// Il ne reprend pas la fabrique des espaces projet : sa structure est la
// sienne — le cap d'abord, la création ensuite — et il a ses propres écrans,
// servis par le second niveau du routeur :
//
//   #photo              l'accueil : objectifs, aperçu création, victoires
//   #photo/calendrier   l'outil phare : calendrier éditorial + banque d'idées
//   #photo/reseau       le carnet réseau (à construire)
//   #photo/commandes    le suivi des commandes (à construire)
//
// Une idée est une publication sans date : même table, deux vues.

import * as api from './api.js';
import {
  construireFormulaire,
  construireObjectifs,
  construireVictoires,
} from './espace-projet.js';
import { depuisDateISO, echeanceLisible, echapper } from './format.js';

const RESEAUX = { instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn' };
const FORMATS = { post: 'Post', carrousel: 'Carrousel', reel: 'Réel', story: 'Story' };

// L'ordre du cycle. Chaque statut connaît son suivant ; « publié » n'en a pas.
const STATUTS = ['idee', 'brouillon', 'pret', 'publie'];
const NOMS_STATUTS = { idee: 'idée', brouillon: 'brouillon', pret: 'prêt', publie: 'publié' };

// Les rubriques de départ de Noé (7 août 2026). La liste reste libre : elle
// s'enrichira de son analyse du marché, plus tard.
const RUBRIQUES_DEPART = [
  'Raw to edit',
  'Raw vs edit',
  'No accreditation, no problem',
  'Un mois en tant que photographe sportif',
];

const VUES = ['accueil', 'calendrier', 'reseau', 'commandes'];

// --- Fabrication du HTML ----------------------------------------------------

function enTete(vueActive) {
  const liens = [
    ['accueil', 'Accueil', '#photo'],
    ['calendrier', 'Calendrier', '#photo/calendrier'],
    ['reseau', 'Réseau', '#photo/reseau'],
    ['commandes', 'Commandes', '#photo/commandes'],
  ];

  return `
    <div class="yuno-tete">
      <span class="yuno-logo" aria-hidden="true"><img src="img/yuno-logo.jpg" alt=""></span>
      <div>
        <h1>Yuno</h1>
        <p class="discret sous-titre">Photographe sportif · yuno_rph</p>
      </div>
    </div>
    <nav class="yuno-nav" aria-label="Outils Yuno">
      ${liens
        .map(
          ([vue, libelle, adresse]) => `
        <a href="${adresse}" class="${vue === vueActive ? 'actif' : ''}"
          ${vue === vueActive ? 'aria-current="page"' : ''}>${libelle}</a>`,
        )
        .join('')}
    </nav>`;
}

function etiquettes(pub) {
  return `
    <span class="etiquette etiquette-reseau">${echapper(RESEAUX[pub.reseau] ?? pub.reseau)}</span>
    <span class="etiquette">${echapper(FORMATS[pub.format] ?? pub.format)}</span>`;
}

export function construirePublication(pub) {
  const suivant = STATUTS[STATUTS.indexOf(pub.statut) + 1];
  const datee = Boolean(pub.date_prevue);

  return `
    <li>
      <span class="tuile-entete">
        ${etiquettes(pub)}
        ${pub.rubrique ? `<span class="pub-rubrique">${echapper(pub.rubrique)}</span>` : ''}
        ${
          datee
            ? `<span class="discret quand">${echapper(
                echeanceLisible(depuisDateISO(pub.date_prevue)),
              )}</span>`
            : ''
        }
      </span>
      <span class="pub-titre">${echapper(pub.titre)}</span>
      ${pub.notes ? `<span class="discret pub-notes">${echapper(pub.notes)}</span>` : ''}
      <span class="pub-actions">
        <span class="pub-statut">statut : <strong>${NOMS_STATUTS[pub.statut]}</strong></span>
        ${
          suivant
            ? `<button type="button" class="bouton-secondaire bouton-mini"
                 data-avancer="${echapper(pub.id)}">Passer en ${NOMS_STATUTS[suivant]}</button>`
            : pub.lien_publie
              ? `<a class="discret" href="${echapper(pub.lien_publie)}" target="_blank" rel="noopener">voir ↗</a>`
              : ''
        }
        ${
          datee
            ? pub.statut !== 'publie'
              ? `<button type="button" class="lien-discret bouton-mini"
                   data-deprogrammer="${echapper(pub.id)}"
                   title="Retirer la date : la publication redevient une idée">Repasser en idée</button>`
              : ''
            : `<input type="date" class="pub-programmer" data-programmer="${echapper(pub.id)}"
                 title="Programmer cette idée" aria-label="Programmer « ${echapper(pub.titre)} »">`
        }
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-supprimer-pub="${echapper(pub.id)}"
          title="Supprimer"
          aria-label="Supprimer « ${echapper(pub.titre)} »">×</button>
      </span>
    </li>`;
}

export function construireAVenir(publications) {
  const datees = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue));

  if (!datees.length) {
    return `<p class="vide">Rien de programmé. Une idée de la banque n'attend qu'une date.</p>`;
  }
  return `<ul>${datees.map(construirePublication).join('')}</ul>`;
}

export function construireBanque(publications) {
  const idees = publications
    .filter((pub) => !pub.date_prevue)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (!idees.length) {
    return `<p class="vide">Ta banque d'idées démarre ici. Note tout, tri ensuite.</p>`;
  }
  return `<ul>${idees.map(construirePublication).join('')}</ul>`;
}

export function construirePubliees(publications) {
  const publiees = publications
    .filter((pub) => pub.statut === 'publie')
    .sort((a, b) => (b.date_prevue ?? '').localeCompare(a.date_prevue ?? ''));

  if (!publiees.length) return '';
  return `
    <details class="backlog">
      <summary>Publiées <span class="chiffre">${publiees.length}</span></summary>
      <ul>${publiees.map(construirePublication).join('')}</ul>
    </details>`;
}

// L'aperçu de l'accueil : de quoi savoir où en est la création sans ouvrir
// l'outil — trois programmées, trois idées fraîches.
export function construireApercuCreation(publications) {
  const prochaines = publications
    .filter((pub) => pub.date_prevue && pub.statut !== 'publie')
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))
    .slice(0, 3);
  const idees = publications
    .filter((pub) => !pub.date_prevue)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3);

  const lignes = [...prochaines, ...idees];
  if (!lignes.length) {
    return `<p class="vide">Tes prochaines publications et idées s'afficheront ici.</p>`;
  }

  return `<ul>${lignes
    .map(
      (pub) => `
      <li>
        <span class="tuile-entete">
          ${etiquettes(pub)}
          <span class="discret quand">${
            pub.date_prevue
              ? echapper(echeanceLisible(depuisDateISO(pub.date_prevue)))
              : 'idée'
          }</span>
        </span>
        <span class="pub-titre">${echapper(pub.titre)}</span>
      </li>`,
    )
    .join('')}</ul>`;
}

function formulaireIdee(publications) {
  const rubriques = [
    ...new Set([
      ...RUBRIQUES_DEPART,
      ...publications.map((pub) => pub.rubrique).filter(Boolean),
    ]),
  ];

  return construireFormulaire({
    id: 'pub',
    libelle: 'Noter une idée',
    action: 'noter-idee',
    champs: [
      { nom: 'titre', libelle: "L'idée, en une phrase", type: 'text', requis: true },
      { nom: 'reseau', libelle: 'Réseau', type: 'select', options: RESEAUX },
      { nom: 'format', libelle: 'Format', type: 'select', options: FORMATS },
      { nom: 'rubrique', libelle: 'Rubrique (libre)', type: 'text', suggestions: rubriques },
      { nom: 'date_prevue', libelle: 'Date prévue (facultative — sans date, ça reste une idée)', type: 'date' },
      { nom: 'notes', libelle: 'Notes — légende, plan, références (facultatif)', type: 'textarea' },
    ],
  });
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
      <a class="lien-externe" href="#photo/calendrier">
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
    </section>`;
}

function vueCalendrier(etat) {
  return `
    ${enTete('calendrier')}

    <section class="bloc">
      <h2>Calendrier éditorial</h2>
      ${formulaireIdee(etat.publications)}
    </section>

    <section class="bloc">
      <h2>À venir</h2>
      <div data-bloc="a-venir">${construireAVenir(etat.publications)}</div>
    </section>

    <section class="bloc">
      <h2>Banque d'idées</h2>
      <div data-bloc="banque">${construireBanque(etat.publications)}</div>
      <div data-bloc="publiees">${construirePubliees(etat.publications)}</div>
    </section>`;
}

function vueAConstruire(nom, description) {
  return `
    ${enTete(nom)}
    <section class="bloc">
      <p class="vide">${description}</p>
    </section>`;
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section, route) {
    const etat = { objectifs: [], victoires: [], publications: [], vue: 'accueil' };

    const rendre = () => {
      if (etat.vue === 'calendrier') section.innerHTML = vueCalendrier(etat);
      else if (etat.vue === 'reseau') {
        section.innerHTML = vueAConstruire(
          'reseau',
          'Le carnet réseau arrive : joueurs, médias, clubs — le contact et le rattachement en trois secondes.',
        );
      } else if (etat.vue === 'commandes') {
        section.innerHTML = vueAConstruire(
          'commandes',
          'Le suivi des commandes arrive.',
        );
      } else section.innerHTML = vueAccueil(etat);
    };

    // Le routeur rappelle `naviguer` à chaque changement de hash dans l'espace.
    this.naviguer = (nouvelleRoute) => {
      etat.vue = VUES.includes(nouvelleRoute?.vue) ? nouvelleRoute.vue : 'accueil';
      rendre();
    };

    try {
      const [objectifs, victoires, publications] = await Promise.all([
        api.objectifsActifs({ projet: 'photo' }),
        api.victoiresDuProjet('photo'),
        api.publicationsToutes(),
      ]);
      Object.assign(etat, { objectifs, victoires, publications });
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

    // Programmer une idée : choisir une date suffit, pas de bouton de plus.
    section.addEventListener('change', async (evenement) => {
      const programmer = evenement.target.closest('[data-programmer]');
      if (!programmer || !programmer.value) return;

      const pub = trouverPub(programmer.dataset.programmer);
      programmer.disabled = true;
      try {
        Object.assign(pub, await api.modifierPublication(pub.id, { date_prevue: programmer.value }));
        rendre();
      } catch (souci) {
        console.error('Programmation impossible', souci);
        programmer.disabled = false;
      }
    });
  },
};
