// LA FICHE D'UN LIVRE — `#livre/<id>` (2 septembre 2026, demande de Noé : « il
// faut que je puisse cliquer sur chaque livre pour avoir une fiche avec tous les
// détails, et où je peux modifier l'état et la note »).
//
// C'EST LE MÊME MOUVEMENT QUE LES CAPS, LES PROJETS ET LES HABITUDES : la
// galerie compare, la page dit tout. L'étagère ne montre qu'une couverture et un
// titre — c'est ce qui se compare d'un livre à l'autre ; le reste vit ici.
//
// CE QU'ELLE AJOUTE, ET QUI N'EXISTAIT NULLE PART : le JOURNAL DE LECTURE. Les
// séances sont en base depuis le premier jour — elles donnent les pages lues et
// le rythme — et on ne les voyait jamais. Une lecture, c'est d'abord une suite
// de soirs.
//
// L'ÉTAT ET LA NOTE SE RÈGLENT SUR PLACE, sans ouvrir la fenêtre de
// modification : ce sont les deux choses qu'on vient changer, et les enfermer
// derrière un formulaire de six champs serait leur donner le coût d'une
// correction alors que ce sont des gestes.
import * as api from './api.js';
import { ETATS_LIVRE, MOTS_STATUT, THEMES_LIVRE, FORMULAIRES } from './perso.js';
import { avanceeDuLivre } from './orientation.js';
import {
  basculerChoixDeFormulaire,
  construireFormulaire,
  construireMenuDiscret,
  fermerLesChoix,
} from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
import {
  depuisDateISO,
  echapper,
  echeanceLisible,
  versDateISO,
} from './format.js';

const etat = {
  id: null,
  livre: null,
  seances: [],
  couverture: null,
  menu: null,
  confirme: null,
  edition: null,
  citation: false,
  pages: false,
  message: null,
  echec: false,
};

const SIGNE_RETOUR = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false"><path d="M15 18l-6-6 6-6"></path></svg>`;

// Les raccourcis de pages, ceux de la bibliothèque : +10 et +25 ne sont que des
// raccourcis, et « autre » ouvre le nombre exact.
const PAS_DE_PAGES = [10, 25];

// LES COULEURS DISENT UNE VIE DE LIVRE, pas un jugement : gris tant qu'il
// attend, bleu quand il est ouvert, vert quand il est fini — et le gris revient
// pour un livre REPOSÉ, parce que « reposé » n'est pas un échec (règle du
// 29 août) et ne prendra donc jamais une couleur d'alerte.
//
// Ce sont les trois teintes de l'état d'un projet, aux mêmes rangs : « pas
// commencé », « en cours », « terminé » — un livre traverse la même vie, et deux
// vocabulaires de couleur pour un même cycle finiraient par se contredire.
const COULEURS_ETAT = {
  a_lire: 'var(--texte-discret)',
  en_cours: '#5b8dd9',
  lu: 'var(--famille-corps)',
  repose: 'var(--texte-discret)',
};

function pluriel(nombre, singulier, plurielMot = `${singulier}s`) {
  return `${nombre} ${nombre > 1 ? plurielMot : singulier}`;
}

function jourLong(iso) {
  return depuisDateISO(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function menu(forme, id, options = {}) {
  return construireMenuDiscret(forme, id, {
    ouvert: etat.menu === `${forme}:${id}`,
    confirmation: etat.confirme === `${forme}:${id}`,
    ...options,
  });
}

// --- L'ÉTAT, RÉGLABLE SUR PLACE ----------------------------------------------
//
// La forme est celle de la pastille d'état d'un projet : un point de couleur et
// un mot, qui ouvrent le menu dessiné du hub. Deux gestes identiques ne portent
// pas deux dessins.
//
// LES COULEURS DISENT UNE VIE DE LIVRE, pas un jugement : gris tant qu'il
// attend, bleu quand il est ouvert, vert quand il est fini — et le gris revient
// pour un livre reposé. **« Reposé » n'est pas un échec** (règle du 29 août), et
// il ne prendra donc jamais une couleur d'alerte.
function pastilleEtat(livre) {
  const courant = livre.statut ?? 'a_lire';
  const nom = (cle) => echapper(ETATS_LIVRE[cle] ?? cle);
  const couleur = (cle) => COULEURS_ETAT[cle] ?? 'var(--texte-discret)';

  return `
    <span class="choix-champ cap-etat" data-choix-champ="etat-${echapper(livre.id)}">
      <button type="button" class="cap-etat-mot" data-ouvrir-choix
        style="--etat: ${couleur(courant)};" aria-expanded="false" aria-haspopup="listbox"
        aria-label="État : ${nom(courant)} — changer"><span class="cap-etat-point"
        aria-hidden="true"></span>${nom(courant)}</button>
      <div class="choix-panneau" hidden>
        <ul class="choix-capture">
          ${Object.keys(ETATS_LIVRE)
            .map(
              (cle) => `
            <li><button type="button" data-etat-livre="${echapper(cle)}"
              class="${cle === courant ? 'actif' : ''}"
              aria-pressed="${cle === courant}"><span class="cap-etat-point"
                style="--etat: ${couleur(cle)};" aria-hidden="true"></span>${nom(
                  cle,
                )}</button></li>`,
            )
            .join('')}
        </ul>
      </div>
    </span>`;
}

// --- LA NOTE, RÉGLABLE SUR PLACE ---------------------------------------------
//
// Cinq étoiles qu'on touche, et la même étoile retouchée l'efface : une note
// posée par erreur doit pouvoir se retirer, et un bouton « enlever la note »
// coûterait une ligne pour un cas rare.
//
// AUCUNE NOTE N'EST BASSE : le hub ne colore pas un jugement. Les cinq étoiles
// portent la même encre, seule leur forme change — pleine ou creuse.
function notes(livre) {
  return `<span class="livre-notes" role="group" aria-label="Note du livre">
    ${[1, 2, 3, 4, 5]
      .map(
        (rang) => `<button type="button" class="livre-etoile" data-noter="${rang}"
          aria-pressed="${rang <= (livre.note ?? 0)}"
          aria-label="${rang} sur 5"
          title="${rang} sur 5">${rang <= (livre.note ?? 0) ? '★' : '☆'}</button>`,
      )
      .join('')}
  </span>`;
}

// --- LA TÊTE ------------------------------------------------------------------

function enTete(livre) {
  const service = [
    MOTS_STATUT[livre.statut] ?? livre.statut,
    livre.auteur ?? '',
  ].filter(Boolean);

  return `
    <div class="livre-page-tete">
      ${
        etat.couverture
          ? `<span class="livre-page-couverture"><img src="${echapper(etat.couverture)}"
              alt="" decoding="async"></span>`
          : '<span class="livre-page-couverture livre-page-sans"></span>'
      }
      <div class="livre-page-titres">
        <h1>${echapper(livre.titre)}</h1>
        ${livre.auteur ? `<p class="livre-page-auteur">${echapper(livre.auteur)}</p>` : ''}
        <div class="livre-page-reglages">
          ${pastilleEtat(livre)}
          ${notes(livre)}
        </div>
        <!-- LES THÈMES, TOUS (2 septembre 2026, demande de Noé). La tuile de
             l'étagère n'en montre qu'un, faute de place ; la fiche les dit tous,
             c'est son office. Ils ne se règlent PAS ici, à la différence de
             l'état et de la note : on change l'état d'un livre à chaque étape de
             sa lecture, on ne reclasse un thème qu'une fois — sa place est dans
             la fenêtre de modification, avec le titre et l'auteur. -->
        ${
          (livre.themes ?? []).length
            ? `<p class="livre-page-themes">${livre.themes
                .map(
                  (theme) => `<span class="livre-theme" data-theme="${echapper(theme)}"
                    >${echapper(THEMES_LIVRE[theme] ?? theme)}</span>`,
                )
                .join('')}</p>`
            : ''
        }
      </div>
      ${menu('livre', livre.id)}
    </div>`;
}

// --- OÙ IL EN EST -------------------------------------------------------------
//
// Les chiffres d'un livre, et AUCUN ne compte un manque : ni pages restantes, ni
// jours sans lecture, ni retard sur un quota — il n'y en a pas, et il n'y en
// aura pas (règle de la bibliothèque, 29 août 2026).
function chiffres(livre) {
  const { lues, part, jours, rythme } = avanceeDuLivre(livre, etat.seances);

  const cases = [
    livre.pages
      ? [`${lues}<span class="hab-stat-sur">/${livre.pages}</span>`, 'pages lues']
      : [lues, lues > 1 ? 'pages lues' : 'page lue'],
    part === null ? null : [`${Math.round(part * 100)}<span class="hab-stat-sur">%</span>`, 'lu'],
    jours ? [jours, jours > 1 ? 'jours de lecture' : 'jour de lecture'] : null,
    rythme ? [rythme, 'pages par jour lu'] : null,
  ].filter(Boolean);

  const dates = [
    livre.commence_le ? `Commencé le ${jourLong(livre.commence_le)}` : '',
    livre.fini_le ? `Fini le ${jourLong(livre.fini_le)}` : '',
  ].filter(Boolean);

  return `
    ${
      part === null
        ? ''
        : `<span class="livre-jauge" role="img"
            aria-label="${lues} pages sur ${livre.pages}"><i
            style="width:${Math.round(part * 100)}%"></i></span>`
    }
    <div class="hab-stats">
      ${cases
        .map(
          ([chiffre, mot]) => `
        <div class="hab-stat">
          <span class="hab-stat-chiffre chiffre">${chiffre}</span>
          <span class="hab-stat-mot">${echapper(mot)}</span>
        </div>`,
        )
        .join('')}
    </div>
    ${dates.length ? `<p class="livre-page-dates discret">${echapper(dates.join(' · '))}</p>` : ''}

    <!-- ON NOTE SES PAGES D'ICI AUSSI : c'est l'écran où l'on regarde son
         avancée, et devoir retourner à la bibliothèque pour la faire bouger
         serait un aller-retour pour trois secondes de geste. -->
    <span class="livre-pas">
      ${PAS_DE_PAGES.map(
        (pas) => `<button type="button" class="livre-pas-bouton"
          data-pages="${pas}">+${pas}</button>`,
      ).join('')}
      <button type="button" class="livre-pas-bouton" data-pages-autre>autre</button>
    </span>`;
}

// --- LE JOURNAL DE LECTURE ----------------------------------------------------
//
// Ce que la fiche apporte et qu'aucun écran ne montrait : les séances. Elles
// sont en base depuis le premier jour — elles donnent les pages lues et le
// rythme — et on ne les voyait jamais.
//
// LE PLUS RÉCENT D'ABORD : on relit une lecture par le dernier soir, pas par le
// premier. Et une séance se RETIRE — c'est le seul moyen de corriger un « +25 »
// touché deux fois.
function journal() {
  const siennes = [...etat.seances].sort((a, b) => (a.jour < b.jour ? 1 : -1));
  if (!siennes.length) {
    return `<p class="cap-vide">Aucune page notée. Le premier soir compté
      s'écrira ici.</p>`;
  }

  return `<ul class="livre-journal">${siennes
    .map(
      (seance) => `
    <li>
      <span class="livre-journal-jour">${echapper(echeanceLisible(depuisDateISO(seance.jour)))}</span>
      <span class="livre-journal-pages chiffre">${seance.pages}</span>
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-retirer-seance="${echapper(seance.id)}"
        aria-label="Retirer ces ${seance.pages} pages">×</button>
    </li>`,
    )
    .join('')}</ul>`;
}

// --- LES CITATIONS ------------------------------------------------------------
//
// « Ce qui reste d'un livre six mois après, plus que la note » — la raison
// écrite le 29 août, et la fiche est enfin l'endroit où les relire toutes. La
// bibliothèque n'en montrait que la dernière.
function citations(livre) {
  const gardees = livre.citations ?? [];

  return `
    ${
      gardees.length
        ? `<ul class="livre-citations">${gardees
            .map(
              (citation) => `
        <li>
          <p class="livre-citation">« ${echapper(citation.texte)} »${
            citation.page ? `<span class="discret"> — p. ${citation.page}</span>` : ''
          }</p>
          <button type="button" class="lien-discret bouton-mini bouton-retirer"
            data-retirer-citation="${echapper(citation.id)}"
            aria-label="Retirer cette phrase">×</button>
        </li>`,
            )
            .join('')}</ul>`
        : `<p class="cap-vide">Aucune phrase gardée. C'est ce qui reste d'un livre
           six mois après, plus que la note.</p>`
    }
    <button type="button" class="cap-ajout-discret" data-ajouter-citation>
      + <span>Garder une phrase</span></button>`;
}

// --- LES FENÊTRES -------------------------------------------------------------

function laFenetre() {
  if (etat.edition) {
    return construireFormulaire({
      id: 'modifier-livre',
      libelle: FORMULAIRES.livre.modifier,
      action: 'enregistrer-livre',
      bouton: 'Enregistrer',
      ouvert: true,
      champs: FORMULAIRES.livre.champs(etat.livre),
      extra: `<input type="hidden" name="id" value="${echapper(etat.livre.id)}">`,
    });
  }

  if (etat.citation) {
    return construireFormulaire({
      id: 'garder-phrase',
      libelle: 'Garder une phrase',
      action: 'enregistrer-citation',
      bouton: 'Garder',
      ouvert: true,
      champs: [
        { nom: 'texte', libelle: 'La phrase', type: 'textarea', requis: true },
        { nom: 'page', libelle: 'Page (facultatif)', type: 'number' },
      ],
    });
  }

  if (etat.pages) {
    return construireFormulaire({
      id: 'noter-pages',
      libelle: 'Combien de pages',
      action: 'enregistrer-pages',
      bouton: 'Ajouter',
      ouvert: true,
      champs: [{ nom: 'pages', libelle: 'Pages lues', type: 'number', requis: true }],
    });
  }

  return '';
}

function squelette() {
  if (etat.echec) {
    return `
      <h1>Livre</h1>
      <p class="vide">Le chargement n'a pas abouti.
        <button type="button" class="lien-discret" data-action="reessayer">Réessayer</button></p>`;
  }

  if (!etat.livre) {
    return `
      <h1>Livre</h1>
      <p class="vide">Ce livre n'existe plus.
        <a href="#perso/bibliotheque">Voir ta bibliothèque</a></p>`;
  }

  const livre = etat.livre;

  return `
    <p class="projet-page-retour">
      <a href="#perso/bibliotheque">${SIGNE_RETOUR}<span>Ta bibliothèque</span></a>
    </p>

    ${enTete(livre)}

    ${etat.message ? `<p class="discret message-regle">${echapper(etat.message)}</p>` : ''}

    <section class="bloc">
      <h2 class="hors-ecran">Où il en est</h2>
      ${chiffres(livre)}
    </section>

    <div class="livre-page-duo">
      <section class="bloc">
        <h2>Les phrases gardées</h2>
        ${citations(livre)}
      </section>

      <section class="bloc">
        <h2>Le journal de lecture</h2>
        ${journal()}
      </section>
    </div>

    <div class="cap-fenetre-hote">${laFenetre()}</div>`;
}

export default {
  async monter(section, route) {
    etat.id = route?.vue ?? null;

    const habiller = () => {
      if (!etat.livre || section.hidden) return;
      document.title = `${etat.livre.titre} — Hub`;
      // Un livre est du PERSO, toujours : c'est sa couleur.
      document.body.dataset.espace = 'perso';
    };

    const rendre = () => {
      section.innerHTML = squelette();
      habiller();

      const fenetre = section.querySelector('.cap-fenetre-hote .ajout-volant');
      if (fenetre) {
        fenetre.open = true;
        fenetre.querySelector('input, textarea')?.focus();
      }
    };

    const signaler = (mot) => {
      etat.message = mot;
      rendre();
    };

    const charger = async () => {
      if (!etat.id) {
        etat.livre = null;
        rendre();
        return;
      }

      try {
        const [livre, seances] = await Promise.all([
          api.livreParId(etat.id),
          api.seancesDuLivre(etat.id),
        ]);
        etat.livre = livre ?? null;
        etat.seances = seances;
        etat.echec = false;

        // La couverture arrive après : signer une adresse ne doit pas retarder
        // la fiche, et sans couverture il n'y a aucune requête.
        etat.couverture = null;
        rendre();
        if (livre?.couverture) {
          const urls = await api.urlsDesCouvertures([livre.couverture]);
          etat.couverture = urls[livre.couverture] ?? null;
        }
      } catch (erreur) {
        console.error('Chargement du livre impossible', erreur);
        etat.echec = true;
      }

      rendre();
    };

    this.rafraichir = charger;

    this.naviguer = (nouvelle) => {
      const id = nouvelle?.vue ?? null;
      if (id === etat.id) return habiller();
      Object.assign(etat, {
        id,
        livre: null,
        seances: [],
        couverture: null,
        menu: null,
        confirme: null,
        edition: null,
        citation: false,
        pages: false,
        message: null,
      });
      rendre();
      charger();
    };

    rendre();
    await charger();

    // --- Les clics ---

    section.addEventListener('click', async (evenement) => {
      const dans = (nom) => evenement.target.closest(`[data-${nom}]`);

      if (evenement.target.closest('[data-action="reessayer"]')) {
        etat.echec = false;
        rendre();
        await charger();
        return;
      }

      if (evenement.target.closest('[data-fermer-ajout]')) {
        etat.edition = null;
        etat.citation = false;
        etat.pages = false;
        rendre();
        return;
      }
      if (evenement.target.closest('.ajout-volant')) return;
      if (evenement.target.closest('.choix-panneau') && !dans('etat-livre')) return;

      // --- L'état, réglé sur place ---

      const ouvrirEtat = evenement.target.closest('[data-ouvrir-choix]');
      if (ouvrirEtat) {
        basculerChoixDeFormulaire(ouvrirEtat, section);
        return;
      }

      const poserEtat = dans('etat-livre');
      if (poserEtat) {
        fermerLesChoix(section);
        return changerEtat(poserEtat.dataset.etatLivre);
      }

      // --- La note ---

      const noter = dans('noter');
      if (noter) return changerNote(Number(noter.dataset.noter));

      // --- Les pages ---

      const pas = dans('pages');
      if (pas) return ajouterDesPages(Number(pas.dataset.pages));

      if (dans('pages-autre')) {
        etat.pages = true;
        rendre();
        return;
      }

      const retirerSeance = dans('retirer-seance');
      if (retirerSeance) {
        const seance = etat.seances.find((s) => s.id === retirerSeance.dataset.retirerSeance);
        if (!seance) return;
        return retirerAussitot(etat.seances, seance, () => api.retirerUneSeance(seance.id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être retiré — les pages sont revenues."),
        });
      }

      // --- Les citations ---

      if (dans('ajouter-citation')) {
        etat.citation = true;
        rendre();
        return;
      }

      const retirerCitation = dans('retirer-citation');
      if (retirerCitation) {
        const liste = etat.livre.citations;
        const citation = liste.find((c) => c.id === retirerCitation.dataset.retirerCitation);
        if (!citation) return;
        return retirerAussitot(liste, citation, () => api.retirerUneCitation(citation.id), {
          rendre,
          echouer: () => signaler("Ça n'a pas pu être retiré — la phrase est revenue."),
        });
      }

      // --- Le menu discret ---

      const menuTouche = dans('menu');
      if (menuTouche) {
        etat.menu = etat.menu === menuTouche.dataset.menu ? null : menuTouche.dataset.menu;
        etat.confirme = null;
        rendre();
        return;
      }

      if (dans('modifier')) {
        etat.edition = true;
        etat.menu = null;
        rendre();
        return;
      }

      const supprimer = dans('supprimer');
      if (supprimer) {
        etat.confirme = supprimer.dataset.supprimer;
        rendre();
        return;
      }

      if (dans('confirmer')) {
        etat.menu = null;
        etat.confirme = null;
        // LA PAGE N'A PLUS DE SUJET : on retourne à l'étagère.
        try {
          await api.supprimerLivre(etat.livre.id, etat.livre.couverture);
          location.hash = '#perso/bibliotheque';
        } catch (souci) {
          console.error('Livre non supprimé', souci);
          signaler("Ça n'a pas pu être supprimé.");
        }
        return;
      }

      if (dans('annuler-confirmation')) {
        etat.confirme = null;
        rendre();
        return;
      }

      fermerLesChoix(section);

      if (etat.menu || etat.confirme) {
        etat.menu = null;
        etat.confirme = null;
        rendre();
      }
    });

    section.addEventListener('keydown', (evenement) => {
      if (evenement.key !== 'Escape') return;
      if (!etat.edition && !etat.citation && !etat.pages) return;
      etat.edition = null;
      etat.citation = false;
      etat.pages = false;
      rendre();
    });

    // --- Enregistrer ---

    section.addEventListener('submit', async (evenement) => {
      const formulaire = evenement.target.closest('form[data-action]');
      if (!formulaire) return;
      evenement.preventDefault();

      const action = formulaire.dataset.action;
      const champs = Object.fromEntries(new FormData(formulaire));
      const erreur = formulaire.querySelector('[data-erreur]');
      const bouton = formulaire.querySelector('button[type="submit"]');
      if (erreur) erreur.hidden = true;
      bouton.disabled = true;

      try {
        if (action === 'enregistrer-livre') {
          const valeurs = {
            titre: champs.titre.trim(),
            auteur: champs.auteur?.trim() || null,
            pages: champs.pages ? Number(champs.pages) : null,
            statut: champs.statut,
            note: champs.note ? Number(champs.note) : null,
          };
          // Un champ vide n'efface rien : ne rien redonner, c'est garder ce qui
          // est là. Même règle que la durée qu'on passe en cochant.
          const fichier = champs.couverture;
          const ancienne = etat.livre.couverture;
          if (fichier instanceof File && fichier.size) {
            valeurs.couverture = await api.televerserCouverture(fichier);
          }
          await api.modifierLivre(etat.livre.id, valeurs);
          if (valeurs.couverture && ancienne && ancienne !== valeurs.couverture) {
            await api.supprimerCouverture(ancienne);
          }
          etat.edition = null;
        }

        if (action === 'enregistrer-citation') {
          const gardee = await api.garderUneCitation(
            etat.livre.id,
            champs.texte.trim(),
            champs.page ? Number(champs.page) : null,
          );
          etat.livre.citations = [...(etat.livre.citations ?? []), gardee];
          etat.citation = false;
        }

        if (action === 'enregistrer-pages') {
          etat.pages = false;
          rendre();
          return ajouterDesPages(Number(champs.pages));
        }

        await charger();
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        if (erreur) {
          erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
          erreur.hidden = false;
        }
        bouton.disabled = false;
      }
    });

    // --- Les trois gestes, tous optimistes ---

    async function changerEtat(statut) {
      const livre = etat.livre;
      if (!livre || statut === livre.statut) {
        etat.menu = null;
        return rendre();
      }

      const avant = { ...livre };
      // COMMENCER UN LIVRE LUI DONNE SA DATE, comme à sa création ; le finir
      // écrit la sienne. Le hub ne demande jamais une date qu'il peut poser.
      const champs = { statut };
      if (statut === 'en_cours' && !livre.commence_le) champs.commence_le = versDateISO();
      if (statut === 'lu' && !livre.fini_le) champs.fini_le = versDateISO();

      Object.assign(livre, champs);
      etat.menu = null;
      rendre();

      try {
        // TERMINER UN LIVRE ÉCRIT UNE VICTOIRE, et c'est `terminerLivre` qui le
        // sait : passer par `modifierLivre` la ferait manquer, alors que finir
        // un livre en est une (règle du 29 août).
        if (statut === 'lu') Object.assign(livre, await api.terminerLivre(avant, livre.note));
        else Object.assign(livre, await api.modifierLivre(livre.id, champs));
      } catch (souci) {
        console.error('État non enregistré', souci);
        Object.assign(livre, avant);
        signaler("Ça n'a pas pu être enregistré — l'état est revenu.");
      }
    }

    async function changerNote(rang) {
      const livre = etat.livre;
      if (!livre) return;

      // LA MÊME ÉTOILE RETOUCHÉE EFFACE LA NOTE : une note posée par erreur doit
      // pouvoir se retirer, et un bouton « enlever la note » coûterait une ligne
      // pour un cas rare.
      const note = livre.note === rang ? null : rang;
      const avant = livre.note ?? null;
      livre.note = note;
      rendre();

      try {
        Object.assign(livre, await api.modifierLivre(livre.id, { note }));
      } catch (souci) {
        console.error('Note non enregistrée', souci);
        livre.note = avant;
        signaler("Ça n'a pas pu être enregistré — la note est revenue.");
      }
    }

    async function ajouterDesPages(pages) {
      if (!pages || Number.isNaN(pages) || !etat.livre) return;

      const provisoire = {
        id: `provisoire-${Date.now()}`,
        livre_id: etat.livre.id,
        jour: versDateISO(),
        pages,
      };
      const avant = [...etat.seances];
      etat.seances = [...etat.seances, provisoire];
      rendre();

      try {
        const seance = await api.noterDesPages(etat.livre.id, pages);
        etat.seances = [...etat.seances.filter((s) => s.id !== provisoire.id), seance];
        rendre();
      } catch (souci) {
        console.error('Pages non enregistrées', souci);
        etat.seances = avant;
        signaler("Ça n'a pas pu être enregistré — les pages sont reparties.");
      }
    }
  },
};
