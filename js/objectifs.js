// L'espace Objectifs — tout le cap, et le seul endroit du hub où il se règle.
//
// Le pendant de l'espace Tâches : transverse, il montre TOUS les objectifs de
// tous les espaces, groupés par espace, avec leur pourquoi, leur cible et leurs
// jalons. Ailleurs le hub GRAVE le cap, en lecture seule — l'accueil et les
// pages espace le posent dans la page, sans un geste qui le modifie. Ici on
// l'écrit : on ajoute un objectif, on le modifie, on pose ou on retire un
// jalon, on marque atteint.
//
// Aucune entrée dans la barre de navigation (demande de Noé, 25 août 2026) :
// on y vient par la porte du bloc « Tes objectifs », et rarement.
//
// Comme l'espace perso, cet espace n'utilise pas la fabrique `creerEspace`
// — elle ne sait bâtir qu'un seul espace, avec ses tâches, ses événements et
// ses victoires. Il en reprend en revanche tous les gabarits : une tuile
// d'objectif se dessine d'une seule façon dans tout le hub.

import * as api from './api.js';
import {
  REGIMES,
  chargeViseeDeLaPeriode,
  tensionDeLaPeriode,
  periodeDuJour,
  cleDArbitrage,
} from './orientation.js';
import { construireObjectifs, construireFormulaire, brancherChoix } from './gabarits.js';
import { modifierAussitot, retirerAussitot } from './ecriture.js';
// Le modèle de l'argent de Yuno vit avec la page qui l'a fait naître ; il
// n'est pas recopié ici.
import { argentDeYuno, enEuros } from './photo.js';
import {
  NOMS_ESPACES,
  echapper,
  dureeLisible,
  echeanceLisible,
  depuisDateISO,
} from './format.js';

// L'espace perso n'a pas d'objectifs : il a des INTENTIONS, sans mesure ni
// date, et elles se relisent dans #perso. Cette page ne les touche jamais.
const ESPACES = ['formation', 'fch', 'photo'];

// L'objectif dont les prestations et le matériel disent la mesure. Reconnu par
// son titre, comme sur la page Yuno : c'est le seul lien entre une ligne
// d'objectif et une mécanique, et l'inscrire en dur vaut mieux qu'une colonne
// « type » que rien d'autre n'utiliserait.
const OBJECTIF_MATERIEL = 'Rembourser mon matériel';

// --- L'argent de « Rembourser mon matériel » --------------------------------
// La cible de cet objectif est la somme du matériel, sa progression la somme
// des prestations encaissées. Les deux listes se corrigent ICI, à côté de
// l'objectif qu'elles mesurent (demande de Noé, 26 août 2026) — la page Yuno,
// elle, se contente d'en afficher le total.

export function construireArgent(commandes, materiel) {
  const { encaisse, frais, achats, cible, reste } = argentDeYuno(commandes, materiel);
  const chiffrees = commandes.filter((commande) => commande.montant != null);

  // Une prestation affiche son NET, et le détail dessous quand il y a des frais :
  // c'est le net qui rembourse le matériel, mais on doit pouvoir vérifier d'où
  // il sort.
  const ligne = (entree, somme, detail, action) => `
    <li>
      <span class="argent-nom">
        ${echapper(entree.titre ?? entree.nom)}
        ${detail ? `<span class="discret argent-detail">${detail}</span>` : ''}
      </span>
      <span class="chiffre argent-somme">${enEuros(somme)}</span>
      <button type="button" class="lien-discret bouton-mini bouton-retirer"
        data-${action}="${echapper(entree.id)}"
        title="Retirer" aria-label="Retirer « ${echapper(entree.titre ?? entree.nom)} »">×</button>
    </li>`;

  const listePrestations = chiffrees.length
    ? `<ul class="liste-argent">${chiffrees
        .map((commande) =>
          ligne(
            commande,
            commande.montant,
            // Les frais se disent ici mais comptent en face : ils grossissent
            // ce qu'il reste à rembourser, ils n'entament pas la recette.
            commande.frais ? `${enEuros(commande.frais)} de déplacement` : '',
            'retirer-commande',
          ),
        )
        .join('')}</ul>`
    : `<p class="vide">Rien encore.</p>`;

  const listeMateriel = materiel.length
    ? `<ul class="liste-argent">${materiel
        .map((achat) => ligne(achat, achat.prix, '', 'retirer-materiel'))
        .join('')}</ul>`
    : `<p class="vide">Rien encore.</p>`;

  return `
    <div class="panneau-argent">
      <p class="argent-total">
        <span class="chiffre">${enEuros(encaisse)}</span>
        <span class="discret">encaissés sur ${enEuros(cible)} à rembourser</span>
      </p>

      <!-- Le détail de ce qu'il reste à rembourser, ici et nulle part ailleurs
           (demande de Noé, 26 août 2026) : la page Yuno n'en dit que le total,
           c'est en ouvrant l'objectif qu'on voit d'où il sort. -->
      <ul class="argent-composition">
        <li><span>Matériel</span> <span class="chiffre">${enEuros(achats)}</span></li>
        <li><span>Déplacements</span> <span class="chiffre">${enEuros(frais)}</span></li>
        <li class="argent-somme-ligne">
          <span>À rembourser</span> <span class="chiffre">${enEuros(cible)}</span>
        </li>
        <li><span>Encaissé</span> <span class="chiffre">${enEuros(encaisse)}</span></li>
        <li class="argent-somme-ligne">
          <span>${reste ? 'Il reste' : 'Remboursé'}</span>
          <span class="chiffre">${enEuros(reste)}</span>
        </li>
      </ul>

      <h3>Prestations encaissées</h3>
      ${listePrestations}
      ${construireFormulaire({
        id: 'obj-prestation',
        libelle: 'Noter une prestation',
        action: 'creer-prestation',
        champs: [
          { nom: 'titre', libelle: 'La prestation', type: 'text', requis: true },
          { nom: 'client', libelle: 'Pour qui (facultatif)', type: 'text' },
          { nom: 'montant', libelle: 'Ce que ça rapporte, en euros', type: 'number', requis: true },
          {
            nom: 'frais',
            libelle: 'Ce que le déplacement a coûté (facultatif)',
            type: 'number',
          },
        ],
      })}

      <h3>Matériel</h3>
      ${listeMateriel}
      ${construireFormulaire({
        id: 'obj-materiel',
        libelle: 'Ajouter du matériel',
        action: 'creer-materiel',
        champs: [
          { nom: 'nom', libelle: "L'appareil, l'objectif…", type: 'text', requis: true },
          { nom: 'prix', libelle: 'Prix payé en euros', type: 'number', requis: true },
          { nom: 'date_achat', libelle: "Date d'achat (facultative)", type: 'date' },
        ],
      })}
    </div>`;
}

// --- Fabrication du HTML ----------------------------------------------------

// L'espace est porté par la SECTION, et non par chaque tuile : il n'y sert
// qu'à poser les couleurs (`--couleur-espace-pleine`), dont héritent les
// chemins de jalons. Sur une tuile, `data-espace` dessinerait en plus le
// filet coloré des listes de l'accueil — ici le titre du bloc dit déjà le
// espace, et six filets alignés seraient du bruit.
// LES PROJETS d'un espace : le comment des caps qui sont juste au-dessus
// (27 août 2026). Ils vivent ici et pas ailleurs pour une raison simple —
// c'est la page où l'on décide, et un projet est une décision : ce qu'on va
// faire pour y arriver, et combien de temps on est prêt à y mettre.
//
// Ils n'affichent AUCUNE progression, volontairement. Celle d'un objectif
// reste jalons atteints / jalons totaux ; deux caps servis par un même projet
// ne doivent pas le compter deux fois. Un projet porte la charge, pas le score.
export function construireProjets(projets, objectifs = [], taches = []) {
  if (!projets.length) {
    return `<p class="vide">Aucun projet ici. Le premier dira comment tu comptes
      t'y prendre.</p>`;
  }

  const nomDuCap = (cible) =>
    objectifs.find((objectif) => objectif.id === cible.objectif_id)?.titre ?? null;

  return `<ul class="liste-projets">${projets
    .map((projet) => {
      const caps = (projet.cibles ?? []).map(nomDuCap).filter(Boolean);
      const charge = projet.charge_hebdo
        ? `${dureeLisible(projet.charge_hebdo)} par semaine`
        : dureeLisible(projet.charge_minutes);

      // CE QU'IL PORTE, et ce qui pourrait le porter. Sans ce compte, un projet
      // reste une intention : on ne voit pas s'il a commencé. Et les orphelines
      // de son espace se rattachent d'un bouton — c'est la seule façon
      // raisonnable de rattraper quarante-huit tâches écrites avant qu'il
      // existe un étage projet.
      const portees = taches.filter((tache) => tache.projet_id === projet.id);
      const orphelines = taches.filter(
        (tache) => tache.espace === projet.espace && !tache.projet_id && tache.statut !== 'fait',
      );

      return `
        <li class="projet-ligne" data-projet="${echapper(projet.id)}">
          <span class="projet-nom">${echapper(projet.nom)}</span>
          <span class="projet-service">
            ${charge ? `<span class="chiffre">${echapper(charge)}</span>` : ''}
            ${
              projet.echeance
                ? `<span>${echapper(echeanceLisible(depuisDateISO(projet.echeance)))}</span>`
                : ''
            }
          </span>
          ${
            caps.length
              ? `<span class="projet-caps">sert ${caps.map(echapper).join(' · ')}</span>`
              : `<span class="projet-caps discret">ne sert aucun cap déclaré</span>`
          }
          ${projet.resultat ? `<span class="projet-resultat">${echapper(projet.resultat)}</span>` : ''}
          <span class="projet-porte">
            ${
              portees.length
                ? `${portees.length} tâche${portees.length > 1 ? 's' : ''} rattachée${
                    portees.length > 1 ? 's' : ''
                  }`
                : 'Aucune tâche rattachée'
            }
          </span>
          ${
            orphelines.length
              ? `<details class="backlog projet-rattacher">
                   <summary>Rattacher une tâche <span class="chiffre">${
                     orphelines.length
                   }</span></summary>
                   <ul class="liste-orphelines">
                     ${orphelines
                       .map(
                         (tache) => `
                       <li>
                         <span>${echapper(tache.titre)}</span>
                         <button type="button" class="lien-discret bouton-mini"
                           data-rattacher="${echapper(tache.id)}"
                           data-vers="${echapper(projet.id)}">Rattacher</button>
                       </li>`,
                       )
                       .join('')}
                   </ul>
                 </details>`
              : ''
          }
        </li>`;
    })
    .join('')}</ul>`;
}

// LES PÉRIODES. Elles ouvrent la page, avant les caps : on ne règle pas un cap
// sans savoir quelle forme a le mois où il tombe. Et surtout, c'est ici que
// l'arbitrage a lieu — pendant qu'on écrit « septembre est intense », pas un
// dimanche soir où il ne reste que de mauvaises options.
const NOMS_REGIMES = Object.fromEntries(
  Object.entries(REGIMES).map(([cle, { libelle }]) => [cle, libelle]),
);

const ESPACES_REGLES = ['fch', 'formation', 'photo'];

function heuresLisibles(minutes) {
  const heures = minutes / 60;
  // Virgule et non point : on écrit « 39,5 h » en français, et le point se
  // lisait comme une ponctuation au milieu du chiffre.
  const dit = Number.isInteger(heures) ? String(heures) : heures.toFixed(1).replace('.', ',');
  return `${dit} h`;
}

export function construirePeriodes(periodes, aujourdhui = new Date(), arbitrages = []) {
  if (!periodes.length) {
    return `<p class="vide">Aucune période déclarée. La première dira ce que tu
      attends du mois qui vient.</p>`;
  }

  const courante = periodeDuJour(periodes, aujourdhui);

  return `<ul class="liste-periodes">${periodes
    .map((periode) => {
      const tension = tensionDeLaPeriode(periode, arbitrages, aujourdhui);
      const visees = chargeViseeDeLaPeriode(periode);
      const regimes = ESPACES_REGLES.filter((espace) => periode.regimes?.[espace])
        .map(
          (espace) =>
            `<span data-espace="${espace}">${echapper(NOMS_ESPACES[espace] ?? espace)}
              ${echapper((NOMS_REGIMES[periode.regimes[espace]] ?? '').toLowerCase())}</span>`,
        )
        .join('');

      return `
        <li class="periode-ligne${periode.id === courante?.id ? ' periode-courante' : ''}"
          data-periode="${echapper(periode.id)}">
          <span class="periode-nom">${echapper(periode.nom)}</span>
          <span class="periode-quand chiffre">${echapper(periode.debut)} → ${echapper(periode.fin)}</span>
          ${regimes ? `<span class="periode-regimes">${regimes}</span>` : ''}
          <span class="periode-charge">club ${echapper(
            heuresLisibles(visees.fch),
          )} · formation ${echapper(heuresLisibles(visees.formation))} · <span
            class="chiffre">${echapper(heuresLisibles(visees.total))}</span> pour ${echapper(
              heuresLisibles(tension.capacite),
            )}</span>
          ${
            // TRANCHÉ. La question ne revient pas ; ce que Noé a décidé, si.
            // Une décision qu'on ne peut pas relire est une décision qu'on
            // reprend sans le savoir — et « revenir dessus » est le seul geste
            // qui la rende révisable en connaissance de cause.
            tension.tranche
              ? `<span class="periode-tranche">
                   <span>${echapper(tension.tranche.reponse)}</span>
                   <button type="button" class="lien-discret bouton-mini"
                     data-rouvrir-arbitrage="${echapper(tension.tranche.id)}"
                     >Revenir dessus</button>
                 </span>`
              : ''
          }
          ${
            tension.tendue
              ? `<span class="periode-question">
                   ${echapper(tension.question)}
                   ${tension.issues
                     .map(
                       (issue) => `<button type="button" class="bouton-secondaire bouton-mini"
                         data-detendre="${echapper(periode.id)}"
                         data-espace-cible="${echapper(issue.espace)}"
                         data-regime-cible="${echapper(issue.regime)}">${echapper(
                           issue.phrase,
                         )}</button>`,
                     )
                     .join('')}
                 </span>`
              : ''
          }
          <button type="button" class="lien-discret bouton-mini bouton-retirer"
            data-retirer-periode="${echapper(periode.id)}"
            title="Retirer cette période"
            aria-label="Retirer « ${echapper(periode.nom)} »">×</button>
        </li>`;
    })
    .join('')}</ul>`;
}

function squelette() {
  const blocs = ESPACES.map(
    (espace) => `
      <section class="bloc" data-espace="${espace}">
        <h2>${echapper(NOMS_ESPACES[espace] ?? espace)}</h2>
        <div data-bloc="${espace}"><p class="vide">…</p></div>

        ${construireFormulaire({
          id: `objectif-${espace}`,
          libelle: 'Ajouter un objectif',
          action: 'creer-objectif',
          champs: [
            { nom: 'titre', libelle: 'Objectif', type: 'text', requis: true },
            {
              nom: 'pourquoi',
              libelle: 'Pourquoi ? (relu les jours sans motivation)',
              type: 'textarea',
            },
            { nom: 'cible', libelle: "À quoi tu sauras que c'est réussi", type: 'text' },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
          ],
          extra: `<input type="hidden" name="espace" value="${espace}">`,
        })}

        <h3 class="titre-projets">Projets</h3>
        <p class="discret sous-titre">Le comment. Ce qu'on va faire pour y arriver.</p>
        <div data-projets="${espace}"><p class="vide">…</p></div>
        ${construireFormulaire({
          id: `projet-${espace}`,
          libelle: 'Ajouter un projet',
          action: 'creer-projet',
          champs: [
            { nom: 'nom', libelle: 'Projet', type: 'text', requis: true },
            { nom: 'resultat', libelle: "À quoi tu sauras qu'il est fini", type: 'text' },
            { nom: 'charge_heures', libelle: 'Combien d\'heures en tout (facultatif)', type: 'number' },
            { nom: 'charge_hebdo_heures', libelle: "Ou combien d'heures par semaine", type: 'number' },
            { nom: 'echeance', libelle: 'Échéance (facultative)', type: 'date' },
          ],
          extra: `<input type="hidden" name="espace" value="${espace}">`,
        })}
      </section>`,
  ).join('');

  return `
    <h1>Objectifs</h1>
    <p class="discret sous-titre">Le cap de chaque espace. C'est ici qu'il se règle.</p>

    <section class="bloc">
      <h2>Les périodes</h2>
      <p class="discret sous-titre">Ce que tu attends d'un mois, espace par espace.
        Le régler ici, c'est arbitrer avant le mur plutôt qu'un dimanche soir.</p>
      <div data-bloc="periodes"><p class="vide">…</p></div>
      ${construireFormulaire({
        id: 'periode',
        libelle: 'Déclarer une période',
        action: 'creer-periode',
        champs: [
          { nom: 'nom', libelle: 'Période', type: 'text', requis: true },
          { nom: 'debut', libelle: 'Du', type: 'date', requis: true },
          { nom: 'fin', libelle: 'Au', type: 'date', requis: true },
          { nom: 'regime_fch', libelle: 'FC Hermitage', type: 'choix',
            options: NOMS_REGIMES, valeur: 'normal' },
          { nom: 'regime_formation', libelle: 'Formation', type: 'choix',
            options: NOMS_REGIMES, valeur: 'normal' },
          { nom: 'regime_photo', libelle: 'Yuno', type: 'choix',
            options: NOMS_REGIMES, valeur: 'normal' },
        ],
      })}
    </section>

    ${blocs}`;
}

// --- L'espace ---------------------------------------------------------------

export default {
  async monter(section) {
    section.innerHTML = squelette();

    // Les menus dessinés des formulaires (les régimes d'une période) n'étaient
    // branchés nulle part ici : les boutons existaient et ne répondaient pas.
    // Cet espace n'a pas de tuile de capture, il pose donc son propre écouteur —
    // comme le site du FCH, et pour la même raison.
    brancherChoix(section);

    const etat = {
      objectifs: [],
      commandes: [],
      materiel: [],
      projets: [],
      periodes: [],
      arbitrages: [],
      taches: [],
    };
    const bloc = (espace) => section.querySelector(`[data-bloc="${espace}"]`);
    const blocProjets = (espace) => section.querySelector(`[data-projets="${espace}"]`);
    const blocPeriodes = () => section.querySelector('[data-bloc="periodes"]');

    const deLEspace = (espace) => etat.objectifs.filter((o) => o.espace === espace);

    // Le complément de l'objectif du matériel : ses deux listes, posées dans
    // son détail. Les autres objectifs n'en ont pas.
    const complements = () => {
      const objectif = etat.objectifs.find((o) => o.titre === OBJECTIF_MATERIEL);
      if (!objectif) return {};
      return { [objectif.id]: construireArgent(etat.commandes, etat.materiel) };
    };

    const rendreEspace = (espace) => {
      bloc(espace).innerHTML = construireObjectifs(deLEspace(espace), {
        retraitJalon: true,
        complements: complements(),
      });
    };
    const rendreProjets = (espace) => {
      blocProjets(espace).innerHTML = construireProjets(
        etat.projets.filter((projet) => projet.espace === espace),
        etat.objectifs,
        etat.taches,
      );
    };

    const rendrePeriodes = () => {
      blocPeriodes().innerHTML = construirePeriodes(etat.periodes, new Date(), etat.arbitrages);
    };

    const rendreTout = () => {
      rendrePeriodes();
      ESPACES.forEach((espace) => {
        rendreEspace(espace);
        rendreProjets(espace);
      });
    };

    // Redessiner remplace les tuiles : celle qu'on venait d'ouvrir se
    // refermerait sans ça, en pleine saisie de son jalon suivant.
    const ouvrirObjectif = (id) => {
      const element = section.querySelector(`[data-objectif="${CSS.escape(id)}"]`);
      if (element) element.open = true;
    };

    const charger = async () => {
      const [objectifs, commandes, materiel, projets, periodes, arbitrages, taches] =
        await Promise.all([
        api.objectifsActifs(),
        api.commandesToutes(),
        api.materielTout(),
        api.projetsTous(),
        api.periodesToutes(),
        api.arbitragesTous(),
        api.tachesToutes(),
      ]);
      etat.projets = projets;
      etat.periodes = periodes;
      etat.arbitrages = arbitrages;
      etat.taches = taches;
      etat.objectifs = objectifs.filter((objectif) => ESPACES.includes(objectif.espace));
      etat.commandes = commandes;
      etat.materiel = materiel;
      rendreTout();
    };

    this.rafraichir = charger;

    try {
      await charger();
    } catch (erreur) {
      console.error("Chargement de l'espace Objectifs impossible", erreur);
      section.innerHTML = `
        <h1>Objectifs</h1>
        <p class="vide">Les données n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
      return;
    }

    // --- Ajouts et modifications ---
    //
    // Un formulaire garde sa saisie quand l'écriture échoue et a un endroit
    // pour le dire : c'est l'une des deux exceptions à l'affichage optimiste.

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
        formulaire.reset();
        formulaire.closest('.ajout').open = false;
      } catch (souci) {
        console.error('Enregistrement impossible', souci);
        erreur.textContent = souci.message ?? "L'enregistrement a échoué.";
        erreur.hidden = false;
      } finally {
        bouton.disabled = false;
      }
    });

    // Répondre à la question d'une période : un geste, et le régime redescend.
    // C'est Noé qui tranche — le hub n'a fait que poser les deux portes.
    section.addEventListener('click', async (evenement) => {
      const detendre = evenement.target.closest('[data-detendre]');
      if (detendre) {
        const periode = etat.periodes.find((p) => p.id === detendre.dataset.detendre);
        if (!periode) return;
        const cible = detendre.dataset.espaceCible;
        const regimes = { ...periode.regimes, [cible]: detendre.dataset.regimeCible };
        if (regimes[cible] === 'normal') delete regimes[cible];

        // PRENDRE UNE PORTE, C'EST TRANCHER. On garde la question AVEC la
        // réponse : relire « le club cède, la formation porte septembre » six
        // semaines plus tard ne vaut que si l'on se rappelle ce qui était en
        // balance. Et tant que cette trace couvre le jour, le hub ne repose
        // pas la question.
        const tension = tensionDeLaPeriode(periode, etat.arbitrages, new Date());
        const autre = ['fch', 'formation'].find((espace) => espace !== cible);
        const nom = (espace) => (espace === 'fch' ? 'le club' : 'la formation');

        await modifierAussitot(periode, { regimes }, () =>
          api.modifierPeriode(periode.id, { regimes }), { rendre: rendrePeriodes });

        try {
          const trace = await api.trancher({
            cle: cleDArbitrage(periode),
            question: tension.question ?? 'Le club et la formation demandaient plus que 35 h.',
            portee_debut: periode.debut,
            portee_fin: periode.fin,
            reponse: `${nom(autre)[0].toUpperCase()}${nom(autre).slice(1)} porte « ${periode.nom} » ;`
              + ` ${nom(cible)} passe ${detendre.dataset.regimeCible === 'normal' ? 'au normal' : 'au ralenti'}.`,
            espace_retenu: autre,
            espace_cede: cible,
          });
          etat.arbitrages = [trace, ...etat.arbitrages];
        } catch (erreur) {
          // La trace a manqué, le réglage est passé : le hub reposera la
          // question, ce qui est le moindre mal — l'inverse serait d'appliquer
          // en silence une décision dont il ne reste rien.
          console.error('Arbitrage non enregistré', erreur);
        }
        rendrePeriodes();
        return;
      }

      // Revenir sur un arbitrage : la question redevient posable. C'est la
      // seule façon de changer d'avis sans que le hub fasse comme si de rien
      // n'était.
      // Rattacher une tâche orpheline : l'écran d'abord, l'écriture derrière.
      const rattacher = evenement.target.closest('[data-rattacher]');
      if (rattacher) {
        const tache = etat.taches.find((candidate) => candidate.id === rattacher.dataset.rattacher);
        if (!tache) return;
        const espace = tache.espace;
        await modifierAussitot(
          tache,
          { projet_id: rattacher.dataset.vers },
          () => api.modifierTache(tache.id, { projet_id: rattacher.dataset.vers }),
          { rendre: () => rendreProjets(espace) },
        );
        return;
      }

      const rouvrir = evenement.target.closest('[data-rouvrir-arbitrage]');
      if (rouvrir) {
        const id = rouvrir.dataset.rouvrirArbitrage;
        const avant = etat.arbitrages;
        etat.arbitrages = etat.arbitrages.filter((a) => a.id !== id);
        rendrePeriodes();
        try {
          await api.rouvrirArbitrage(id);
        } catch (erreur) {
          console.error('Arbitrage non rouvert', erreur);
          etat.arbitrages = avant;
          rendrePeriodes();
        }
        return;
      }

      const retirer = evenement.target.closest('[data-retirer-periode]');
      if (retirer) {
        const periode = etat.periodes.find((p) => p.id === retirer.dataset.retirerPeriode);
        if (!periode || !confirm(`Retirer la période « ${periode.nom} » ?`)) return;
        await retirerAussitot(etat.periodes, periode, () => api.supprimerPeriode(periode.id), {
          rendre: rendrePeriodes,
        });
      }
    });

    async function appliquer(action, champs) {
      if (action === 'creer-objectif') {
        const objectif = await api.creerObjectif({
          espace: champs.espace,
          titre: champs.titre.trim(),
          pourquoi: champs.pourquoi?.trim() || null,
          cible: champs.cible?.trim() || null,
          echeance: champs.echeance || null,
        });
        etat.objectifs = [...etat.objectifs, { ...objectif, jalons: objectif.jalons ?? [] }];
        rendreEspace(champs.espace);
        return;
      }

      if (action === 'creer-periode') {
        const periode = await api.creerPeriode({
          nom: champs.nom.trim(),
          debut: champs.debut,
          fin: champs.fin,
          // Seuls les régimes qui s'écartent du normal sont retenus : une
          // période qui ne dit rien d'un espace ne doit pas donner l'illusion
          // d'en avoir décidé quelque chose.
          regimes: Object.fromEntries(
            ESPACES_REGLES.map((espace) => [espace, champs[`regime_${espace}`]]).filter(
              ([, regime]) => regime && regime !== 'normal',
            ),
          ),
        });
        etat.periodes = [...etat.periodes, periode].sort((a, b) =>
          String(a.debut).localeCompare(String(b.debut)),
        );
        rendrePeriodes();
        return;
      }

      if (action === 'creer-projet') {
        // Les heures se saisissent en heures — c'est ainsi qu'on pense un
        // projet —, et se rangent en minutes : c'est l'unité de `taches.duree`
        // et des événements, et deux unités dans une même somme finissent
        // toujours par se croiser.
        const enMinutes = (valeur) => {
          const heures = Number(valeur);
          return Number.isFinite(heures) && heures > 0 ? Math.round(heures * 60) : null;
        };

        const projet = await api.creerProjet({
          espace: champs.espace,
          nom: champs.nom.trim(),
          resultat: champs.resultat?.trim() || null,
          charge_minutes: enMinutes(champs.charge_heures),
          charge_hebdo: enMinutes(champs.charge_hebdo_heures),
          echeance: champs.echeance || null,
        });
        etat.projets = [...etat.projets, { ...projet, cibles: projet.cibles ?? [] }];
        rendreProjets(champs.espace);
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
        // La mise à jour ne renvoie que les colonnes : les jalons déjà chargés
        // restent en place.
        Object.assign(objectif, misAJour);
        rendreEspace(objectif.espace);
        ouvrirObjectif(objectif.id);
        return;
      }

      if (action === 'creer-prestation') {
        // Livrée d'emblée : on note ce qu'on a ENCAISSÉ, pas ce qu'on espère.
        const commande = await api.creerCommande({
          titre: champs.titre.trim(),
          client: champs.client?.trim() || null,
          montant: Number(champs.montant),
          // Vide = pas de frais, et non zéro : la colonne dit alors « on n'a
          // rien noté », pas « ça n'a rien coûté ».
          frais: champs.frais ? Number(champs.frais) : null,
          statut: 'livree',
        });
        etat.commandes = [commande, ...etat.commandes];
        rendreArgent();
        return;
      }

      if (action === 'creer-materiel') {
        const achat = await api.creerMateriel({
          nom: champs.nom.trim(),
          prix: Number(champs.prix),
          date_achat: champs.date_achat || null,
        });
        etat.materiel = [achat, ...etat.materiel];
        rendreArgent();
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
        rendreEspace(objectif.espace);
        ouvrirObjectif(objectif.id);
      }
    }

    // --- Clics ---

    section.addEventListener('click', async (evenement) => {
      const jalon = evenement.target.closest('[data-jalon]');
      if (jalon) return marquerJalon(jalon);

      const supprJalon = evenement.target.closest('[data-supprimer-jalon]');
      if (supprJalon) return supprimerJalon(supprJalon);

      const atteindre = evenement.target.closest('[data-atteindre]');
      if (atteindre) return atteindreObjectif(atteindre);

      const supprObjectif = evenement.target.closest('[data-supprimer-objectif]');
      if (supprObjectif) return supprimerObjectif(supprObjectif);

      const commande = evenement.target.closest('[data-retirer-commande]');
      if (commande) {
        return retirerArgent(commande, commande.dataset.retirerCommande, 'commandes', api.supprimerCommande);
      }

      const achat = evenement.target.closest('[data-retirer-materiel]');
      if (achat) {
        return retirerArgent(achat, achat.dataset.retirerMateriel, 'materiel', api.supprimerMateriel);
      }
    });

    async function retirerArgent(bouton, id, liste, supprimer) {
      bouton.disabled = true;
      try {
        await supprimer(id);
        etat[liste] = etat[liste].filter((entree) => entree.id !== id);
        rendreArgent();
      } catch (souci) {
        console.error('Retrait impossible', souci);
        bouton.disabled = false;
      }
    }

    // Redessiner l'espace photo referme sa tuile : on la rouvre, sinon noter
    // une deuxième prestation obligerait à tout redéplier.
    const rendreArgent = () => {
      const objectif = etat.objectifs.find((o) => o.titre === OBJECTIF_MATERIEL);
      if (!objectif) return;
      rendreEspace(objectif.espace);
      ouvrirObjectif(objectif.id);
    };

    const objectifPortant = (idJalon) =>
      etat.objectifs.find((candidat) => candidat.jalons?.some((j) => j.id === idJalon));

    async function marquerJalon(bouton) {
      bouton.disabled = true;
      try {
        const objectif = objectifPortant(bouton.dataset.jalon);
        const jalon = objectif.jalons.find((j) => j.id === bouton.dataset.jalon);
        // Un jalon atteint écrit sa victoire : elle s'affichera dans l'espace
        // de l'espace, cette page-ci ne montre que le cap.
        const { jalon: atteint } = await api.atteindreJalon(jalon, objectif.espace);
        Object.assign(jalon, atteint);
        rendreEspace(objectif.espace);
        ouvrirObjectif(objectif.id);
      } catch (souci) {
        console.error('Impossible de marquer le jalon', souci);
        bouton.disabled = false;
      }
    }

    async function supprimerJalon(bouton) {
      const objectif = objectifPortant(bouton.dataset.supprimerJalon);
      const jalon = objectif?.jalons.find((j) => j.id === bouton.dataset.supprimerJalon);
      if (!jalon) return;
      if (!confirm(`Retirer le jalon « ${jalon.titre} » ?`)) return;

      bouton.disabled = true;
      try {
        await api.supprimerJalon(jalon.id);
        objectif.jalons = objectif.jalons.filter((j) => j.id !== jalon.id);
        rendreEspace(objectif.espace);
        ouvrirObjectif(objectif.id);
      } catch (souci) {
        console.error('Retrait du jalon impossible', souci);
        bouton.disabled = false;
      }
    }

    // Atteindre un objectif est rare et engageant : on demande une fois.
    async function atteindreObjectif(bouton) {
      const objectif = etat.objectifs.find((o) => o.id === bouton.dataset.atteindre);
      if (!objectif) return;
      if (!confirm(`Marquer « ${objectif.titre} » comme atteint ?`)) return;

      bouton.disabled = true;
      try {
        await api.atteindreObjectif(objectif);
        etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
        rendreEspace(objectif.espace);
      } catch (souci) {
        console.error("Impossible de marquer l'objectif atteint", souci);
        bouton.disabled = false;
      }
    }

    async function supprimerObjectif(bouton) {
      const objectif = etat.objectifs.find((o) => o.id === bouton.dataset.supprimerObjectif);
      if (!objectif) return;
      if (
        !confirm(
          `Supprimer « ${objectif.titre} » et ses jalons ? Les tâches liées sont conservées.`,
        )
      ) {
        return;
      }

      bouton.disabled = true;
      try {
        await api.supprimerObjectif(objectif.id);
        etat.objectifs = etat.objectifs.filter((o) => o.id !== objectif.id);
        rendreEspace(objectif.espace);
      } catch (souci) {
        console.error("Suppression de l'objectif impossible", souci);
        bouton.disabled = false;
      }
    }
  },
};
