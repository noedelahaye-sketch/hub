// LA FICHE D'UNE ŒUVRE — `#livre/<id>` et `#film/<id>` (2 septembre 2026 pour
// les livres, 5 septembre pour les films et les séries).
//
// C'EST LE MÊME MOUVEMENT QUE LES CAPS, LES PROJETS ET LES HABITUDES : la
// galerie compare, la page dit tout. L'étagère ne montre qu'une image et un
// titre — c'est ce qui se compare d'une œuvre à l'autre ; le reste vit ici.
//
// CE QU'ELLE AJOUTE, ET QUI N'EXISTE NULLE PART AILLEURS : le JOURNAL. Les
// séances sont en base depuis le premier jour — elles donnent les pages lues, les
// épisodes vus et le rythme — et on ne les voyait jamais. Une lecture, c'est
// d'abord une suite de soirs ; une série aussi.
//
// L'ÉTAT ET LA NOTE SE RÈGLENT SUR PLACE, sans ouvrir la fenêtre de
// modification : ce sont les deux choses qu'on vient changer, et les enfermer
// derrière un formulaire de six champs serait leur donner le coût d'une
// correction alors que ce sont des gestes.
//
// UNE SEULE FICHE POUR LES DEUX RAYONS. `js/livre.js` et `js/film.js` ne font
// que la fabriquer avec leur rayon : deux copies auraient fini par ne plus
// montrer les mêmes chiffres, et c'est toujours celle qu'on regarde le moins qui
// se met à mentir.
import {
  avancee,
  champsDuFormulaire,
  contributeurDe,
  imageDe,
  motsDe,
  totalDe,
  valeursDuFormulaire,
} from './bibliotheque.js';
import {
  basculerChoixDeFormulaire,
  construireFormulaire,
  construireMenuDiscret,
  fermerLesChoix,
} from './gabarits.js';
import { retirerAussitot } from './ecriture.js';
import { depuisDateISO, echapper, echeanceLisible, versDateISO } from './format.js';

const SIGNE_RETOUR = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false"><path d="M15 18l-6-6 6-6"></path></svg>`;

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

export default function fabriquerFiche(R) {
  const V = R.vocabulaire;

  const etat = {
    id: null,
    oeuvre: null,
    seances: [],
    image: null,
    menu: null,
    confirme: null,
    edition: false,
    citation: false,
    quantite: false,
    message: null,
    echec: false,
  };

  function menu(forme, id, options = {}) {
    return construireMenuDiscret(forme, id, {
      ouvert: etat.menu === `${forme}:${id}`,
      confirmation: etat.confirme === `${forme}:${id}`,
      ...options,
    });
  }

  // --- L'ÉTAT, RÉGLABLE SUR PLACE --------------------------------------------
  //
  // La forme est celle de la pastille d'état d'un projet : un point de couleur
  // et un mot, qui ouvrent le menu dessiné du hub. Deux gestes identiques ne
  // portent pas deux dessins.
  //
  // LES COULEURS DISENT UNE VIE D'ŒUVRE, pas un jugement : gris tant qu'elle
  // attend, bleu quand elle est ouverte, vert quand elle est finie — et le gris
  // revient pour une œuvre reposée. « Reposé » n'est pas un échec (règle du
  // 29 août), et il ne prendra donc jamais une couleur d'alerte.
  function pastilleEtat(oeuvre) {
    const courant = oeuvre.statut ?? R.neuf;
    const nom = (cle) => echapper(R.etats[cle] ?? cle);
    const couleur = (cle) => R.couleursEtat[cle] ?? 'var(--texte-discret)';

    return `
      <span class="choix-champ cap-etat" data-choix-champ="etat-${echapper(oeuvre.id)}">
        <button type="button" class="cap-etat-mot" data-ouvrir-choix
          style="--etat: ${couleur(courant)};" aria-expanded="false" aria-haspopup="listbox"
          aria-label="État : ${nom(courant)} — changer"><span class="cap-etat-point"
          aria-hidden="true"></span>${nom(courant)}</button>
        <div class="choix-panneau" hidden>
          <ul class="choix-capture">
            ${Object.keys(R.etats)
              .map(
                (cle) => `
              <li><button type="button" data-etat-oeuvre="${echapper(cle)}"
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

  // --- LA NOTE, RÉGLABLE SUR PLACE -------------------------------------------
  //
  // Cinq étoiles qu'on touche, et la même étoile retouchée l'efface : une note
  // posée par erreur doit pouvoir se retirer, et un bouton « enlever la note »
  // coûterait une ligne pour un cas rare.
  //
  // AUCUNE NOTE N'EST BASSE : le hub ne colore pas un jugement. Les cinq étoiles
  // portent la même encre, seule leur forme change — pleine ou creuse.
  function notes(oeuvre) {
    return `<span class="livre-notes" role="group" aria-label="Note">
      ${[1, 2, 3, 4, 5]
        .map(
          (rang) => `<button type="button" class="livre-etoile" data-noter="${rang}"
            aria-pressed="${rang <= (oeuvre.note ?? 0)}"
            aria-label="${rang} sur 5"
            title="${rang} sur 5">${rang <= (oeuvre.note ?? 0) ? '★' : '☆'}</button>`,
        )
        .join('')}
    </span>`;
  }

  // --- LA TÊTE ----------------------------------------------------------------

  function enTete(oeuvre) {
    const contributeur = contributeurDe(R, oeuvre);
    const mots = motsDe(R, oeuvre);

    return `
      <div class="livre-page-tete">
        ${
          etat.image
            ? `<span class="livre-page-couverture"><img src="${echapper(etat.image)}"
                alt="" decoding="async"></span>`
            : '<span class="livre-page-couverture livre-page-sans"></span>'
        }
        <div class="livre-page-titres">
          <h1>${echapper(oeuvre.titre)}</h1>
          ${
            // LA NATURE SE LIT À CÔTÉ DU RÉALISATEUR, en encre discrète : « Série
            // · Vince Gilligan ». C'est elle qui dit si « 62 épisodes » veut dire
            // quelque chose — et « Film » se tait, comme sur l'étagère : c'est le
            // cas ordinaire, et un mot identique partout ne distingue rien.
            [oeuvre.nature === 'serie' ? R.natures.serie : '', contributeur ?? '']
              .filter(Boolean).length
              ? `<p class="livre-page-auteur">${echapper(
                  [oeuvre.nature === 'serie' ? R.natures.serie : '', contributeur ?? '']
                    .filter(Boolean)
                    .join(' · '),
                )}</p>`
              : ''
          }
          <div class="livre-page-reglages">
            ${pastilleEtat(oeuvre)}
            ${notes(oeuvre)}
          </div>
          <!-- LES THÈMES (OU LES GENRES), TOUS. La tuile de l'étagère n'en montre
               qu'un, faute de place ; la fiche les dit tous, c'est son office.
               Ils ne se règlent PAS ici, à la différence de l'état et de la
               note : on change l'état à chaque étape, on ne reclasse un genre
               qu'une fois — sa place est dans la fenêtre de modification. -->
          ${
            mots.length
              ? `<p class="livre-page-themes">${mots
                  .map(
                    (m) => `<span class="livre-theme" data-theme="${echapper(m)}"
                      >${echapper(R.mots[m] ?? m)}</span>`,
                  )
                  .join('')}</p>`
              : ''
          }
        </div>
        ${menu(R.forme, oeuvre.id)}
      </div>`;
  }

  // --- OÙ ELLE EN EST ---------------------------------------------------------
  //
  // Les chiffres d'une œuvre, et AUCUN ne compte un manque : ni pages restantes,
  // ni jours sans lecture, ni retard sur un quota — il n'y en a pas, et il n'y en
  // aura pas (règle de la bibliothèque, 29 août 2026).
  function chiffres(oeuvre) {
    const { lues, part, jours, rythme } = avancee(R, oeuvre, etat.seances);
    const total = totalDe(R, oeuvre);
    const compte = R.mesurable(oeuvre);

    // UN FILM NE SE COMPTE PAS : ni chiffres, ni jauge, ni raccourcis. Lui en
    // poser promettrait une progression qu'il n'a pas — il se voit d'un coup, et
    // c'est son état qui le dit.
    if (!compte) {
      const dates = [
        oeuvre.commence_le ? `Commencé le ${jourLong(oeuvre.commence_le)}` : '',
        oeuvre.fini_le ? `Vu le ${jourLong(oeuvre.fini_le)}` : '',
      ].filter(Boolean);
      return dates.length
        ? `<p class="livre-page-dates discret">${echapper(dates.join(' · '))}</p>`
        : '';
    }

    const cases = [
      total
        ? [`${lues}<span class="hab-stat-sur">/${total}</span>`, V.unitesFaites]
        : [lues, lues > 1 ? V.unitesFaites : V.uniteFaite],
      part === null ? null : [`${Math.round(part * 100)}<span class="hab-stat-sur">%</span>`, R.fini],
      jours ? [jours, jours > 1 ? V.joursDe : V.jourDe] : null,
      rythme ? [rythme, V.rythme] : null,
    ].filter(Boolean);

    const dates = [
      oeuvre.commence_le ? `Commencé le ${jourLong(oeuvre.commence_le)}` : '',
      oeuvre.fini_le ? `Fini le ${jourLong(oeuvre.fini_le)}` : '',
    ].filter(Boolean);

    return `
      ${
        part === null
          ? ''
          : `<span class="livre-jauge" role="img"
              aria-label="${lues} ${echapper(V.unites)} sur ${total}"><i
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
        ${R.pas
          .map(
            (pas) => `<button type="button" class="livre-pas-bouton"
              data-pas="${pas}">+${pas}</button>`,
          )
          .join('')}
        <button type="button" class="livre-pas-bouton" data-quantite-autre>autre</button>
      </span>`;
  }

  // --- LE JOURNAL -------------------------------------------------------------
  //
  // Ce que la fiche apporte et qu'aucun écran ne montrait : les séances. Elles
  // sont en base depuis le premier jour et on ne les voyait jamais.
  //
  // LE PLUS RÉCENT D'ABORD : on relit une lecture par le dernier soir, pas par le
  // premier. Et une séance se RETIRE — c'est le seul moyen de corriger un « +25 »
  // touché deux fois.
  function journal() {
    const siennes = [...etat.seances].sort((a, b) => (a.jour < b.jour ? 1 : -1));
    if (!siennes.length) return `<p class="cap-vide">${echapper(V.journalVide)}</p>`;

    return `<ul class="livre-journal">${siennes
      .map(
        (seance) => `
      <li>
        <span class="livre-journal-jour">${echapper(
          echeanceLisible(depuisDateISO(seance.jour)),
        )}</span>
        <span class="livre-journal-pages chiffre">${seance[R.champs.quantite]}</span>
        <button type="button" class="lien-discret bouton-mini bouton-retirer"
          data-retirer-seance="${echapper(seance.id)}"
          aria-label="${echapper(V.retirerQuantite)}">×</button>
      </li>`,
      )
      .join('')}</ul>`;
  }

  // --- LES CITATIONS ----------------------------------------------------------
  //
  // « Ce qui reste d'un livre six mois après, plus que la note » — la raison
  // écrite le 29 août, et elle vaut mot pour mot pour une réplique de film. La
  // fiche est le seul endroit où on les relit toutes.
  function citations(oeuvre) {
    const gardees = oeuvre.citations ?? [];

    return `
      ${
        gardees.length
          ? `<ul class="livre-citations">${gardees
              .map(
                (citation) => `
          <li>
            <p class="livre-citation">« ${echapper(citation.texte)} »${
              citation[R.champs.repere]
                ? `<span class="discret"> — ${echapper(
                    V.reperePrefixe + citation[R.champs.repere],
                  )}</span>`
                : ''
            }</p>
            <button type="button" class="lien-discret bouton-mini bouton-retirer"
              data-retirer-citation="${echapper(citation.id)}"
              aria-label="Retirer">×</button>
          </li>`,
              )
              .join('')}</ul>`
          : `<p class="cap-vide">${echapper(V.citationVide)}</p>`
      }
      <button type="button" class="cap-ajout-discret" data-ajouter-citation>
        + <span>${echapper(V.citationAjouter)}</span></button>`;
  }

  // --- LES FENÊTRES -----------------------------------------------------------

  function laFenetre() {
    if (etat.edition) {
      return construireFormulaire({
        id: `modifier-${R.forme}`,
        libelle: V.modifier,
        action: 'enregistrer-oeuvre',
        bouton: 'Enregistrer',
        ouvert: true,
        champs: champsDuFormulaire(R, etat.oeuvre),
        extra: `<input type="hidden" name="id" value="${echapper(etat.oeuvre.id)}">`,
      });
    }

    if (etat.citation) {
      return construireFormulaire({
        id: 'garder-phrase',
        libelle: V.citationAjouter,
        action: 'enregistrer-citation',
        bouton: 'Garder',
        ouvert: true,
        champs: [
          { nom: 'texte', libelle: V.citationChamp, type: 'textarea', requis: true },
          { nom: 'repere', libelle: V.repereLibelle, type: V.repereType },
        ],
      });
    }

    if (etat.quantite) {
      return construireFormulaire({
        id: 'noter-quantite',
        libelle: V.quantiteTitre,
        action: 'enregistrer-quantite',
        bouton: 'Ajouter',
        ouvert: true,
        champs: [{ nom: 'combien', libelle: V.quantiteChamp, type: 'number', requis: true }],
      });
    }

    return '';
  }

  function squelette() {
    if (etat.echec) {
      return `
        <h1>${echapper(V.titrePage)}</h1>
        <p class="vide">Le chargement n'a pas abouti.
          <button type="button" class="lien-discret" data-action="reessayer">Réessayer</button></p>`;
    }

    if (!etat.oeuvre) {
      return `
        <h1>${echapper(V.titrePage)}</h1>
        <p class="vide">${echapper(V.introuvable)}
          <a href="#perso/bibliotheque">Voir ma bibliothèque</a></p>`;
    }

    const oeuvre = etat.oeuvre;

    return `
      <p class="projet-page-retour">
        <a href="#perso/bibliotheque">${SIGNE_RETOUR}<span>Ma bibliothèque</span></a>
      </p>

      ${enTete(oeuvre)}

      ${etat.message ? `<p class="discret message-regle">${echapper(etat.message)}</p>` : ''}

      <section class="bloc">
        <h2 class="hors-ecran">Où elle en est</h2>
        ${chiffres(oeuvre)}
      </section>

      <div class="livre-page-duo">
        <section class="bloc">
          <h2>${echapper(V.citations)}</h2>
          ${citations(oeuvre)}
        </section>

        ${
          // PAS DE JOURNAL POUR UN FILM : il ne se compte pas, donc rien ne peut
          // jamais s'y écrire. Un bloc vide qu'aucun geste ne peut remplir est
          // une promesse qu'on ne tient pas — et le hub n'affiche pas de porte
          // sur une pièce vide. Les RÉPLIQUES restent : elles valent pour un film
          // autant que pour une série.
          R.mesurable(oeuvre)
            ? `<section class="bloc">
                <h2>${echapper(V.journal)}</h2>
                ${journal()}
              </section>`
            : ''
        }
      </div>

      <div class="cap-fenetre-hote">${laFenetre()}</div>`;
  }

  return {
    async monter(section, route) {
      etat.id = route?.vue ?? null;

      const habiller = () => {
        if (!etat.oeuvre || section.hidden) return;
        document.title = `${etat.oeuvre.titre} — Hub`;
        // Une œuvre est du PERSO, toujours : c'est sa couleur.
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
          etat.oeuvre = null;
          rendre();
          return;
        }

        try {
          const [oeuvre, seances] = await Promise.all([
            R.api.parId(etat.id),
            R.api.seancesDe(etat.id),
          ]);
          etat.oeuvre = oeuvre ?? null;
          etat.seances = seances;
          etat.echec = false;

          // L'image arrive après : signer une adresse ne doit pas retarder la
          // fiche, et sans image il n'y a aucune requête.
          etat.image = null;
          rendre();
          const chemin = oeuvre ? imageDe(R, oeuvre) : null;
          if (chemin) {
            const urls = await R.api.urlsDesImages([chemin]);
            etat.image = urls[chemin] ?? null;
          }
        } catch (erreur) {
          console.error('Chargement impossible', erreur);
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
          oeuvre: null,
          seances: [],
          image: null,
          menu: null,
          confirme: null,
          edition: false,
          citation: false,
          quantite: false,
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
          etat.edition = false;
          etat.citation = false;
          etat.quantite = false;
          rendre();
          return;
        }
        if (evenement.target.closest('.ajout-volant')) return;
        if (evenement.target.closest('.choix-panneau') && !dans('etat-oeuvre')) return;

        // --- L'état, réglé sur place ---

        const ouvrirEtat = evenement.target.closest('[data-ouvrir-choix]');
        if (ouvrirEtat) {
          basculerChoixDeFormulaire(ouvrirEtat, section);
          return;
        }

        const poserEtat = dans('etat-oeuvre');
        if (poserEtat) {
          fermerLesChoix(section);
          return changerEtat(poserEtat.dataset.etatOeuvre);
        }

        // --- La note ---

        const noter = dans('noter');
        if (noter) return changerNote(Number(noter.dataset.noter));

        // --- Les pages, les épisodes ---

        const pas = dans('pas');
        if (pas) return ajouterUneQuantite(Number(pas.dataset.pas));

        if (dans('quantite-autre')) {
          etat.quantite = true;
          rendre();
          return;
        }

        const retirerSeance = dans('retirer-seance');
        if (retirerSeance) {
          const seance = etat.seances.find((s) => s.id === retirerSeance.dataset.retirerSeance);
          if (!seance) return;
          return retirerAussitot(etat.seances, seance, () => R.api.retirerSeance(seance.id), {
            rendre,
            echouer: () => signaler("Ça n'a pas pu être retiré — la séance est revenue."),
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
          const liste = etat.oeuvre.citations;
          const citation = liste.find((c) => c.id === retirerCitation.dataset.retirerCitation);
          if (!citation) return;
          return retirerAussitot(liste, citation, () => R.api.retirerCitation(citation.id), {
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
            await R.api.supprimer(etat.oeuvre.id, imageDe(R, etat.oeuvre));
            location.hash = '#perso/bibliotheque';
          } catch (souci) {
            console.error('Suppression impossible', souci);
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
        if (!etat.edition && !etat.citation && !etat.quantite) return;
        etat.edition = false;
        etat.citation = false;
        etat.quantite = false;
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
          if (action === 'enregistrer-oeuvre') {
            const valeurs = valeursDuFormulaire(R, champs);
            // Un champ vide n'efface rien : ne rien redonner, c'est garder ce
            // qui est là. Même règle que la durée qu'on passe en cochant.
            const fichier = champs.image;
            const ancienne = imageDe(R, etat.oeuvre);
            if (fichier instanceof File && fichier.size) {
              valeurs[R.champs.image] = await R.api.televerserImage(fichier);
            }
            await R.api.modifier(etat.oeuvre.id, valeurs);
            const posee = valeurs[R.champs.image];
            if (posee && ancienne && ancienne !== posee) await R.api.supprimerImage(ancienne);
            etat.edition = false;
          }

          if (action === 'enregistrer-citation') {
            const gardee = await R.api.garderCitation(
              etat.oeuvre.id,
              champs.texte.trim(),
              V.repereType === 'number'
                ? (champs.repere ? Number(champs.repere) : null)
                : (champs.repere?.trim() || null),
            );
            etat.oeuvre.citations = [...(etat.oeuvre.citations ?? []), gardee];
            etat.citation = false;
          }

          if (action === 'enregistrer-quantite') {
            etat.quantite = false;
            rendre();
            return ajouterUneQuantite(Number(champs.combien));
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
        const oeuvre = etat.oeuvre;
        if (!oeuvre || statut === oeuvre.statut) {
          etat.menu = null;
          return rendre();
        }

        const avant = { ...oeuvre };
        // COMMENCER UNE ŒUVRE LUI DONNE SA DATE, comme à sa création ; la finir
        // écrit la sienne. Le hub ne demande jamais une date qu'il peut poser.
        const champs = { statut };
        if (statut === 'en_cours' && !oeuvre.commence_le) champs.commence_le = versDateISO();
        if (statut === R.fini && !oeuvre.fini_le) champs.fini_le = versDateISO();

        Object.assign(oeuvre, champs);
        etat.menu = null;
        rendre();

        try {
          // TERMINER ÉCRIT UNE VICTOIRE, et c'est `terminer` qui le sait : passer
          // par `modifier` la ferait manquer, alors que finir un livre — ou un
          // film — en est une (règle du 29 août).
          if (statut === R.fini) Object.assign(oeuvre, await R.api.terminer(avant, oeuvre.note));
          else Object.assign(oeuvre, await R.api.modifier(oeuvre.id, champs));
        } catch (souci) {
          console.error('État non enregistré', souci);
          Object.assign(oeuvre, avant);
          signaler("Ça n'a pas pu être enregistré — l'état est revenu.");
        }
      }

      async function changerNote(rang) {
        const oeuvre = etat.oeuvre;
        if (!oeuvre) return;

        // LA MÊME ÉTOILE RETOUCHÉE EFFACE LA NOTE : une note posée par erreur
        // doit pouvoir se retirer, et un bouton « enlever la note » coûterait une
        // ligne pour un cas rare.
        const note = oeuvre.note === rang ? null : rang;
        const avant = oeuvre.note ?? null;
        oeuvre.note = note;
        rendre();

        try {
          Object.assign(oeuvre, await R.api.modifier(oeuvre.id, { note }));
        } catch (souci) {
          console.error('Note non enregistrée', souci);
          oeuvre.note = avant;
          signaler("Ça n'a pas pu être enregistré — la note est revenue.");
        }
      }

      async function ajouterUneQuantite(combien) {
        if (!combien || Number.isNaN(combien) || !etat.oeuvre) return;

        const provisoire = {
          id: `provisoire-${Date.now()}`,
          [R.champs.parent]: etat.oeuvre.id,
          jour: versDateISO(),
          [R.champs.quantite]: combien,
        };
        const avant = [...etat.seances];
        etat.seances = [...etat.seances, provisoire];
        rendre();

        try {
          const seance = await R.api.noter(etat.oeuvre.id, combien);
          etat.seances = [...etat.seances.filter((s) => s.id !== provisoire.id), seance];
          rendre();
        } catch (souci) {
          console.error('Séance non enregistrée', souci);
          etat.seances = avant;
          signaler("Ça n'a pas pu être enregistré — la séance est repartie.");
        }
      }
    },
  };
}
