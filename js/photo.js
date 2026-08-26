// La page Yuno DU hub (#photo) — à ne pas confondre avec le site Yuno (#yuno,
// js/yuno.js), qui masque tout l'habillage du hub.
//
// **Le site est l'atelier, cette page est le bilan** (refonte du 26 août 2026).
// Le site répond à « qu'est-ce que je fais maintenant » ; cette page répond à
// « où j'en suis ». C'est la seule division qui justifie deux écrans, et elle
// donne son ordre à la page : ce que j'ai fait, mon cap, ce que j'ai à faire.
//
// Ce qui a disparu ce jour-là, et pourquoi : le titre et le logo (les photos
// disent « Yuno » mieux qu'un mot), la grosse carte d'entrée sur le site (on ne
// vient pas ici pour en sortir — elle est en bas, en pastille), et le bloc des
// publications en création (le site le fait mieux, avec son contexte).
//
// Aucune métrique sociale nulle part : le rendez-vous stats a été retiré le
// 15 août 2026 et la règle vaut sans exception (docs/yuno-spec.md, §4).

import * as api from './api.js';
import { construireFormulaire, construireFenetre } from './espace-projet.js';
import { construireMurPhotos } from './yuno.js';
import { construireLignesTaches, trierTaches } from './taches.js';
import { construireCapGrave } from './objectifs-commun.js';
import {
  fenetreCreation,
  brancherCapture,
  poserAuCalendrier,
} from './calendrier-commun.js';
import { versDateISO, depuisDateISO, echeanceLisible, echapper } from './format.js';

const MOIS_HISTOGRAMME = 12;

// L'objectif dont le compteur d'euros dit la progression. Reconnu par son
// titre : c'est le seul lien entre une ligne d'objectif et une mécanique, et
// l'inscrire en dur vaut mieux qu'une colonne « type » que rien d'autre
// n'utiliserait.
const OBJECTIF_MATERIEL = 'Rembourser mon matériel';

const ETATS_RESEAU = [
  ['pas_de_contact', 'sans contact'],
  ['message_envoye', 'message envoyé'],
  ['contact_etabli', 'contact établi'],
  ['bon_contact', 'bon contact'],
];

// --- Calculs ----------------------------------------------------------------
// Séparés du HTML : ils se vérifient seuls, avec des données factices.

export function sortiesVecues(evenements) {
  return evenements.filter((sortie) => sortie.vecu);
}

// Le rythme des douze derniers mois, du plus ancien au plus récent. Les mois
// vides comptent : un trou est une information, et le masquer donnerait une
// courbe qui ment sur la régularité.
export function rythmeMensuel(evenements, reference = new Date(), mois = MOIS_HISTOGRAMME) {
  const vecues = sortiesVecues(evenements);

  return Array.from({ length: mois }, (_, rang) => {
    const date = new Date(reference.getFullYear(), reference.getMonth() - (mois - 1 - rang), 1);
    const cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      cle,
      mois: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
      annee: date.getFullYear(),
      nombre: vecues.filter((sortie) => sortie.date_debut.slice(0, 7) === cle).length,
    };
  });
}

// Ce qui est encaissé, et ce qu'il reste à rembourser. Une commande sans
// montant ne compte pas : elle existe, elle n'est simplement pas chiffrée.
export function argentDeYuno(commandes, materiel) {
  const encaisse = commandes
    .filter((commande) => commande.statut === 'livree')
    .reduce((total, commande) => total + Number(commande.montant ?? 0), 0);
  const cible = materiel.reduce((total, achat) => total + Number(achat.prix ?? 0), 0);

  return { encaisse, cible, reste: Math.max(0, cible - encaisse) };
}

const EUROS = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
export const enEuros = (montant) => `${EUROS.format(Math.round(montant))} €`;

// --- Fabrication du HTML ----------------------------------------------------

// Trois chiffres nus, posés sur la page et séparés par des filets — pas des
// tuiles. Le troisième s'ouvre : les victoires sont un compte qu'on interroge,
// pas une liste qui occupe le haut de l'écran (demande de Noé, 26 août 2026).
export function construireChiffres(evenements, victoires, contacts, reference = new Date()) {
  const vecues = sortiesVecues(evenements);
  const moisCourant = versDateISO(reference).slice(0, 7);
  const ceMois = vecues.filter((sortie) => sortie.date_debut.slice(0, 7) === moisCourant).length;
  const bons = contacts.filter((contact) => contact.statut === 'bon_contact').length;

  const listeVictoires = victoires.length
    ? `<ul class="liste-victoires-pliee">${victoires
        .map(
          (victoire) => `
          <li>
            <span>${echapper(victoire.titre)}</span>
            <span class="discret quand">${echapper(
              echeanceLisible(depuisDateISO(victoire.date)),
            )}</span>
          </li>`,
        )
        .join('')}</ul>`
    : `<p class="vide">Tes premières victoires Yuno s'afficheront ici.</p>`;

  return `
    <div class="chiffres-nus">
      <div class="chiffre-nu">
        <span class="chiffre">${vecues.length}</span>
        <span class="discret">sorties vécues</span>
      </div>
      <div class="chiffre-nu">
        <span class="chiffre">${ceMois}</span>
        <span class="discret">ce mois-ci</span>
      </div>
      <div class="chiffre-nu">
        <span class="chiffre">${bons}</span>
        <span class="discret">bons contacts</span>
      </div>
    </div>

    <details class="depli-victoires">
      <summary>
        <span class="chiffre">${victoires.length}</span> victoires
      </summary>
      ${listeVictoires}
    </details>`;
}

// L'histogramme du rythme. Des barres en CSS et non un dessin : la hauteur est
// une proportion, et une proportion se dit en pourcentage sans qu'on ait à
// calculer des coordonnées. Le mois courant se distingue — c'est celui qu'on
// peut encore remplir.
//
// Aucune ligne d'objectif, aucune couleur d'alerte : c'est un miroir, pas un
// juge. Un mois à zéro se voit, et c'est tout ce qu'on lui demande.
export function construireHistogramme(evenements, reference = new Date()) {
  const rythme = rythmeMensuel(evenements, reference);
  const haut = Math.max(1, ...rythme.map((mois) => mois.nombre));
  const courant = versDateISO(reference).slice(0, 7);

  const resume = rythme
    .filter((mois) => mois.nombre)
    .map((mois) => `${mois.mois} ${mois.annee} : ${mois.nombre}`)
    .join(', ');

  return `
    <div class="histogramme" role="img"
      aria-label="Sorties par mois sur ${MOIS_HISTOGRAMME} mois — ${
        resume || 'aucune sortie'
      }">
      ${rythme
        .map(
          (mois) => `
        <div class="histo-colonne${mois.cle === courant ? ' histo-courant' : ''}">
          <span class="histo-barre" style="height: ${Math.round(
            (mois.nombre / haut) * 100,
          )}%"></span>
          <span class="histo-mois" aria-hidden="true">${echapper(mois.mois)}</span>
        </div>`,
        )
        .join('')}
    </div>`;
}

// Le réseau en UNE barre segmentée : une forme qu'on ne trouve nulle part
// ailleurs dans le hub, lisible d'un coup d'œil, et qui dit la seule chose
// utile ici — la pente. Le détail des fiches vit sur le site.
export function construireReseau(contacts) {
  if (!contacts.length) {
    return `<p class="vide">Ton réseau s'écrira ici, sur le site.</p>`;
  }

  const comptes = ETATS_RESEAU.map(([cle, mot]) => ({
    cle,
    mot,
    nombre: contacts.filter((contact) => contact.statut === cle).length,
  }));

  const resume = comptes.map(({ nombre, mot }) => `${nombre} ${mot}`).join(', ');

  return `
    <div class="entonnoir" role="img" aria-label="${echapper(resume)}">
      ${comptes
        .filter(({ nombre }) => nombre)
        .map(
          ({ cle, nombre }) =>
            `<span class="entonnoir-part" data-etat="${cle}"
               style="flex-grow: ${nombre}"></span>`,
        )
        .join('')}
    </div>
    <ul class="entonnoir-legende">
      ${comptes
        .map(
          ({ cle, mot, nombre }) => `
        <li><span class="entonnoir-puce" data-etat="${cle}" aria-hidden="true"></span>
          <span class="chiffre">${nombre}</span> <span class="discret">${mot}</span></li>`,
        )
        .join('')}
    </ul>`;
}

export function construireTaches(taches) {
  const aFaire = trierTaches(taches.filter((tache) => tache.statut !== 'fait'));
  if (!aFaire.length) {
    return `<p class="vide">Rien à faire pour Yuno. Note ta prochaine tâche au-dessous.</p>`;
  }
  return construireLignesTaches(aFaire);
}

// Les raccourcis du bloc « Noter ». Tâche, événement et publication passent par
// la tuile de capture du hub ; prestation et matériel ont leur propre fenêtre,
// parce qu'aucun des deux n'a de date et qu'ils n'ont donc rien à faire dans
// une tuile de calendrier.
const RACCOURCIS = [
  { cle: 'tache', mot: 'Une tâche', voie: 'capture' },
  { cle: 'evenement', mot: 'Une sortie', voie: 'capture' },
  { cle: 'publication', mot: 'Une publication', voie: 'capture' },
  { cle: 'prestation', mot: 'Une prestation', voie: 'fenetre' },
  { cle: 'materiel', mot: 'Du matériel', voie: 'fenetre' },
];

function squelette(etat) {
  return `
    <!-- Le nom de la page ne s'écrit plus : les photos le disent (26 août
         2026). Il reste ici pour les lecteurs d'écran, et l'onglet du
         navigateur le porte déjà. -->
    <h1 class="hors-ecran">Yuno</h1>

    <!-- La bande est la SEULE chose hors panneau : elle touche les bords et
         ouvre la page, à la place du logo retiré. -->
    <div class="bloc mur-accueil" data-bloc="mur">${construireMurPhotos(
      etat.evenements,
      etat.photos,
    )}</div>

    <!-- L'ORDRE (demande de Noé, 26 août 2026) : le cap et ce qu'il y a à faire
         d'abord, les raccourcis au milieu, le bilan ensuite. Le rythme dit d'où
         l'on vient — c'est bon à voir, ce n'est pas ce qu'on ouvre la page pour
         savoir. L'ordre du balisage est celui du téléphone ; la grille se
         contente de le disposer. -->
    <div class="grille-yuno">
      <!-- La tuile ENTIÈRE mène au détail des objectifs (demande de Noé,
           26 août 2026) : c'est une tuile-bouton, on la presse n'importe où.
           Elle ne peut donc contenir aucun autre contrôle — le compteur
           d'euros est descendu dans « Le rythme », avec le reste du bilan. -->
      <section class="bloc panneau panneau-lien" style="--place: cap">
        <h2>Le cap</h2>
        <div data-bloc="cap">${construireCap(etat.objectifs, etat.commandes, etat.materiel)}</div>
      </section>

      <section class="bloc panneau" style="--place: faire">
        <h2>À faire</h2>
        <div data-bloc="taches">${construireTaches(etat.taches)}</div>
      </section>

      <section class="bloc panneau" style="--place: rythme">
        <h2>Le rythme</h2>
        <div data-bloc="chiffres">${construireChiffres(
          etat.evenements,
          etat.victoires,
          etat.contacts,
        )}</div>
        <div data-bloc="histogramme">${construireHistogramme(etat.evenements)}</div>
      </section>

      <section class="bloc panneau" style="--place: reseau">
        <h2>Le réseau</h2>
        <div data-bloc="reseau">${construireReseau(etat.contacts)}</div>
      </section>
    </div>

    <div id="bloc-creation-yuno"></div>
    <div id="bloc-fenetre-yuno">${fenetreSaisie(etat.saisie)}</div>

    <!-- Les raccourcis en PIED DE PAGE, hors panneau (demande de Noé, 26 août
         2026) : ce sont des commandes, pas une section à lire. Ils ferment la
         page avec la porte du site, sur la même ligne — celle-ci poussée à
         droite, parce qu'elle n'est pas du même ordre : les cinq notent ici, la
         sixième s'en va. -->
    <div class="pied-yuno">
      ${RACCOURCIS.map(
        ({ cle, mot }) => `
        <button type="button" class="bouton-noter" data-noter="${cle}">
          <span aria-hidden="true">+</span> ${echapper(mot)}
        </button>`,
      ).join('')}

      <a class="pastille-porte" href="#yuno">
        <span>Ouvrir le site Yuno</span>
        <span class="lien-externe-fleche" aria-hidden="true">↗</span>
      </a>
    </div>`;
}

// Les deux saisies qui n'ont pas de date : une prestation encaissée, un achat
// de matériel. Une fenêtre plutôt qu'un pli sous la page — c'est un geste rare
// et court, et il ne doit pas pousser le reste vers le bas.
function fenetreSaisie(quoi) {
  if (quoi === 'prestation') {
    return construireFenetre(
      'Noter une prestation',
      `<h3 class="fenetre-titre">Noter une prestation</h3>
       ${construireFormulaire({
         id: 'yuno-prestation',
         libelle: 'Noter une prestation',
         action: 'creer-prestation',
         avecPli: false,
         bouton: 'Noter',
         champs: [
           { nom: 'titre', libelle: 'La prestation', type: 'text', requis: true },
           { nom: 'client', libelle: 'Pour qui (facultatif)', type: 'text' },
           { nom: 'montant', libelle: 'Montant en euros', type: 'number', requis: true },
         ],
       })}`,
    );
  }

  if (quoi === 'materiel') {
    return construireFenetre(
      'Ajouter du matériel',
      `<h3 class="fenetre-titre">Ajouter du matériel</h3>
       ${construireFormulaire({
         id: 'yuno-materiel',
         libelle: 'Ajouter du matériel',
         action: 'creer-materiel',
         avecPli: false,
         bouton: 'Ajouter',
         champs: [
           { nom: 'nom', libelle: "L'appareil, l'objectif…", type: 'text', requis: true },
           { nom: 'prix', libelle: 'Prix payé en euros', type: 'number', requis: true },
           { nom: 'date_achat', libelle: "Date d'achat (facultative)", type: 'date' },
         ],
       })}`,
    );
  }

  return '';
}

// Le cap, en lecture seule. L'objectif du matériel y porte ses euros : la cible
// est la somme du matériel, la progression celle des prestations encaissées.
// Rien ne s'y règle — on ajoute par les raccourcis du pied de page.
export function construireCap(objectifs, commandes = [], materiel = []) {
  if (!objectifs.length) {
    return `<p class="vide">Ton cap s'écrira ici.</p>`;
  }
  return construireCapGrave(objectifs, { mesures: mesuresDuCap(objectifs, commandes, materiel) });
}

export function mesuresDuCap(objectifs, commandes, materiel) {
  const objectif = objectifs.find((candidat) => candidat.titre === OBJECTIF_MATERIEL);
  if (!objectif) return {};

  const { encaisse, cible } = argentDeYuno(commandes, materiel);
  // Rien encaissé et rien acheté : l'objectif n'a pas encore de chiffre à dire,
  // et « 0 € sur 0 € » n'en est pas un.
  if (!encaisse && !cible) return {};

  const texte = cible
    ? `<span class="chiffre">${enEuros(encaisse)}</span> sur <span class="chiffre">${enEuros(
        cible,
      )}</span>`
    : `<span class="chiffre">${enEuros(encaisse)}</span> encaissés`;

  return { [objectif.id]: texte };
}

// --- Montage ----------------------------------------------------------------

export default {
  async monter(section) {
    const etat = {
      // La tuile de capture, quand elle est ouverte. `null` le reste du temps.
      creation: null,
      // La fenêtre de saisie sans date : 'prestation', 'materiel' ou null.
      saisie: null,
      objectifs: [],
      victoires: [],
      evenements: [],
      taches: [],
      contacts: [],
      commandes: [],
      materiel: [],
      photos: {},
    };

    const charger = async () => {
      // Sept lectures là où la page en faisait trois. C'est le prix d'un bilan
      // plutôt que d'un aperçu, sur un écran qu'on ouvre une fois par jour.
      const debut = new Date();
      debut.setMonth(debut.getMonth() - MOIS_HISTOGRAMME);

      const [objectifs, victoires, evenements, taches, contacts, commandes, materiel] =
        await Promise.all([
          api.objectifsActifs({ projet: 'photo' }),
          api.victoiresDuProjet('photo', 50),
          api.evenementsEntre(debut.toISOString(), new Date().toISOString(), { projet: 'photo' }),
          api.tachesEnCours('photo'),
          api.contactsTous(),
          api.commandesToutes(),
          api.materielTout(),
        ]);

      Object.assign(etat, {
        objectifs,
        victoires,
        evenements,
        taches,
        contacts,
        commandes,
        materiel,
      });

      // Les photos se signent à part : leur échec ne doit pas emporter la page.
      // Un mur vide se lit ; une page blanche, non.
      try {
        const chemins = sortiesVecues(evenements)
          .map((sortie) => sortie.photo_chemin)
          .filter(Boolean);
        etat.photos = await api.urlsDesPhotos(chemins);
      } catch (souci) {
        console.error('Signature des photos impossible', souci);
        etat.photos = {};
      }
    };

    const redessiner = () => {
      section.innerHTML = squelette(etat);
    };

    this.rafraichir = async () => {
      await charger();
      redessiner();
    };

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement de la page Yuno impossible', erreur);
      section.innerHTML = `
        <h1>Yuno</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    redessiner();

    const bloc = (nom) => section.querySelector(`[data-bloc="${nom}"]`);

    // --- La tuile de capture ---
    // Celle du « + » de l'accueil, à l'identique : on ne note pas d'une façon
    // ici et d'une autre là. `projets` n'est pas passé — sur cette page tout
    // est Yuno, et une pastille de projet à une seule valeur ne sert à rien.

    const rendreCreation = () => {
      const hote = section.querySelector('#bloc-creation-yuno');
      hote.innerHTML = etat.creation ? fenetreCreation(etat.creation) : '';
      if (etat.creation) {
        rafraichirLaCapture?.();
        hote.querySelector('#cal-titre')?.focus();
      }
    };

    const rendreSaisie = () => {
      const hote = section.querySelector('#bloc-fenetre-yuno');
      hote.innerHTML = fenetreSaisie(etat.saisie);
      hote.querySelector('input')?.focus();
    };

    // Les deux se ferment ensemble : elles portent le même `data-fermer-fenetre`
    // et jamais toutes les deux à la fois.
    const fermerLaCreation = () => {
      etat.creation = null;
      etat.saisie = null;
      rendreCreation();
      rendreSaisie();
    };

    const rafraichirLaCapture = brancherCapture(section);

    // Échap referme la tuile — le geste attendu partout ailleurs dans le hub.
    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && (etat.creation || etat.saisie)) fermerLaCreation();
    });

    // Redessiner referme les plis : on note lesquels étaient ouverts pour les
    // rouvrir. Sans ça, noter une prestation refermerait la liste des victoires
    // qu'on était en train de lire.
    const ouverts = () =>
      [...section.querySelectorAll('details[class^="depli-"]')]
        .filter((pli) => pli.open)
        .map((pli) => pli.className);

    const redessinerEnGardantLesPlis = () => {
      const memoire = ouverts();
      redessiner();
      for (const classe of memoire) {
        const pli = section.querySelector(`details.${classe.split(' ')[0]}`);
        if (pli) pli.open = true;
      }
    };

    // --- Les formulaires ---

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
        console.error('Ajout impossible', souci);
        erreur.textContent = souci.message ?? "L'ajout a échoué.";
        erreur.hidden = false;
        bouton.disabled = false;
      }
    });

    async function appliquer(action, champs) {
      if (action === 'creer-prestation') {
        // Livrée d'emblée : on note ce qu'on a ENCAISSÉ, pas ce qu'on espère.
        // Une commande en cours se suit sur le site, avec son échéance.
        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: champs.client?.trim() || null,
          montant: Number(champs.montant),
          statut: 'livree',
        });
        etat.commandes = [commande, ...etat.commandes];
        etat.saisie = null;
        redessinerEnGardantLesPlis();
        return;
      }

      if (action === 'creer-materiel') {
        const achat = await api.creerMateriel({
          nom: champs.nom.trim(),
          prix: Number(champs.prix),
          date_achat: champs.date_achat || null,
        });
        etat.materiel = [achat, ...etat.materiel];
        etat.saisie = null;
        redessinerEnGardantLesPlis();
        return;
      }

    }

    // --- Les clics ---

    section.addEventListener('click', async (evenement) => {
      const noter = evenement.target.closest('[data-noter]');
      if (noter) {
        const quoi = noter.dataset.noter;
        const voie = RACCOURCIS.find((r) => r.cle === quoi)?.voie;

        if (voie === 'fenetre') {
          etat.saisie = quoi;
          rendreSaisie();
          return;
        }

        const jour = versDateISO();
        etat.creation = {
          nature: quoi,
          debut: jour,
          fin: jour,
          // Le type de moment n'a de sens que chez Yuno, et ici tout l'est.
          typeMoment: true,
        };
        rendreCreation();
        return;
      }

      if (evenement.target.closest('[data-fermer-fenetre]')) return fermerLaCreation();

      // Une vignette du mur porte `data-ouvrir-moment` : c'est le geste du
      // SITE, qui ouvre la fiche du moment. Ici cette fenêtre n'existe pas —
      // sans cette ligne, la photo serait un bouton mort. Elle mène donc au
      // Carnet de terrain, l'endroit où ce moment se lit vraiment.
      if (evenement.target.closest('[data-ouvrir-moment]')) {
        location.hash = '#yuno/journal';
        return;
      }

    });

    // La tuile écrit par le chemin commun du hub : une seule fonction sait
    // quelle nature va dans quelle table.
    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action="creer-depuis-calendrier"]');
      if (!formulaire) return;
      evenement.preventDefault();

      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      erreur.hidden = true;

      try {
        const pose = await poserAuCalendrier(champs, { projetParDefaut: 'photo' });
        fermerLaCreation();

        // Seule une tâche se voit sur cette page ; une publication rejoint la
        // banque du site, et il n'y a rien à redessiner ici.
        if (champs.nature === 'tache') {
          etat.taches = [...etat.taches, pose];
          bloc('taches').innerHTML = construireTaches(etat.taches);
        }
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "Ça n'a pas pu être enregistré.";
        erreur.hidden = false;
      }
    });

  },
};
