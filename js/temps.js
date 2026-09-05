// Le temps — où partent les heures (28 août 2026, demande de Noé).
//
// POURQUOI CETTE PAGE EXISTE. Depuis le 27 août, terminer une tâche ouvre une
// fenêtre qui demande « combien de temps ça a pris ? ». Noé répond — et RIEN
// n'a jamais rien fait de la réponse : au 28 août, 2 tâches sur 90 et
// 2 publications sur 62 portent une durée. Une question dont la réponse ne sert
// à rien finit par ne plus recevoir de réponse. Cette page est ce à quoi elle
// sert.
//
// CE QU'ELLE N'EST PAS. Ni un compteur de retard, ni un jugement : aucun rouge,
// aucun « trop », aucun seuil qui s'allume. Elle montre, et c'est tout. Le hub
// a retiré le 28 août la question du dépassement d'une période — « c'est LE BUT
// d'une période d'intensité » — et il ne la remet pas ici par la fenêtre.
//
// ELLE NE CALCULE RIEN ELLE-MÊME. Tout vient de js/orientation.js, qui ne
// touche ni au réseau, ni à la session, ni au DOM, et qui reste éprouvable hors
// écran par `node tools/essai-diagnostic.mjs`. Un diagnostic qu'on ne peut pas
// vérifier seul est un diagnostic qu'on croit sur parole.

import * as api from './api.js';
import { dureeLisible, echapper, NOMS_ESPACES, ORDRE_ESPACES } from './format.js';
import {
  chargeDeLaSemaine,
  chargeViseeDeLaPeriode,
  periodeDuJour,
  semaineDe,
} from './orientation.js';

// L'ordre des journées de Noé, partagé (js/format.js) : il était recopié ici.
const ESPACES = ORDRE_ESPACES;

const heures = (minutes) => dureeLisible(Math.round(minutes)) || '0 h';

// --- Ce que la semaine pèse ---------------------------------------------------

// Les quatre parts d'une semaine, dans l'ordre où elles se creusent : on est
// d'abord quelque part, puis on traite ce qu'on en a rapporté, puis viennent
// les rythmes tenus au forfait, et enfin ce qui a été chiffré ligne à ligne.
const PARTS = {
  evenements: 'Sur place',
  traitement: 'Traitement',
  forfait: 'Rythmes',
  declare: 'Ligne à ligne',
};

export function construireSemaine(donnees, semaine, periode) {
  const visees = chargeViseeDeLaPeriode(periode);

  const lignes = ESPACES.map((espace) => ({
    espace,
    charge: chargeDeLaSemaine(donnees, semaine, espace),
    visee: visees[espace] ?? null,
  })).filter((ligne) => ligne.charge.total || ligne.visee);

  if (!lignes.length) {
    return `<p class="vide">Rien de chiffré cette semaine. Les heures apparaîtront
      à mesure que tu répondras à « combien de temps ça a pris ? ».</p>`;
  }

  // L'échelle est COMMUNE aux quatre espaces, sinon deux barres de même longueur
  // diraient deux nombres différents et la comparaison serait un mensonge.
  const plafond = Math.max(...lignes.map((l) => Math.max(l.charge.total, l.visee ?? 0)), 60);

  return `
    <ul class="temps-espaces">
      ${lignes
        .map(({ espace, charge, visee }) => {
          const parts = Object.entries(PARTS)
            .filter(([cle]) => charge[cle] > 0)
            .map(
              ([cle, nom]) =>
                `<span class="temps-part" data-part="${cle}"
                   style="width:${(charge[cle] / plafond) * 100}%"
                   title="${nom} — ${heures(charge[cle])}"></span>`,
            )
            .join('');

          return `
          <li data-espace="${espace}">
            <div class="temps-tete">
              <span class="pastille" aria-hidden="true"></span>
              <span class="temps-nom">${echapper(NOMS_ESPACES[espace] ?? espace)}</span>
              <span class="temps-total chiffre">${heures(charge.total)}</span>
            </div>
            <div class="temps-barre">${parts}</div>
            <p class="temps-detail discret">
              ${Object.entries(PARTS)
                .filter(([cle]) => charge[cle] > 0)
                .map(([cle, nom]) => `${nom} ${heures(charge[cle])}`)
                .join(' · ') || 'Rien de chiffré'}
              ${visee ? ` · attendu <span class="chiffre">${heures(visee)}</span>` : ''}
              ${
                charge.nonChiffre
                  ? ` · <span class="temps-muet">${charge.nonChiffre} sans durée</span>`
                  : ''
              }
            </p>
          </li>`;
        })
        .join('')}
    </ul>`;
}

// --- Ce que les projets annoncent, et ce qu'ils ont coûté ---------------------

// Le mesuré d'un projet : la durée de ses tâches TERMINÉES. Celles qui restent
// à faire portent une estimation, pas un temps passé — les additionner ferait
// passer une intention pour un fait.
export function construireProjets(projets, taches) {
  const vivants = projets.filter(
    (projet) => projet.statut !== 'termine' && projet.statut !== 'abandonne',
  );
  if (!vivants.length) return `<p class="vide">Aucun projet en cours.</p>`;

  const mesure = (projet) =>
    taches
      .filter((tache) => tache.projet_id === projet.id && tache.statut === 'fait')
      .reduce((somme, tache) => somme + (tache.duree ?? 0), 0);

  const lignes = vivants
    .map((projet) => ({ projet, declare: projet.charge_minutes ?? 0, fait: mesure(projet) }))
    .filter((ligne) => ligne.declare || ligne.fait || ligne.projet.charge_hebdo)
    .sort((a, b) => b.declare - a.declare || b.fait - a.fait);

  const plafond = Math.max(...lignes.map((l) => Math.max(l.declare, l.fait)), 60);

  return `
    <ul class="temps-projets">
      ${lignes
        .map(({ projet, declare, fait }) => {
          // Un projet à l'année n'a pas de ligne d'arrivée : sa barre reste en
          // pointillé, comme dans la galerie des projets. Une barre qui se
          // remplit promettrait une fin qui n'existe pas.
          const annuel = !declare && projet.charge_hebdo;
          const dit = annuel
            ? `${heures(projet.charge_hebdo)} par semaine`
            : `${heures(declare)} annoncées`;

          return `
          <li data-espace="${projet.espace}">
            <div class="temps-tete">
              <span class="pastille" aria-hidden="true"></span>
              <span class="temps-nom">${echapper(projet.nom)}</span>
              <span class="temps-total chiffre">${fait ? heures(fait) : '—'}</span>
            </div>
            <div class="temps-barre temps-barre-projet${annuel ? ' temps-barre-annuelle' : ''}">
              ${
                annuel
                  ? '<span class="temps-part temps-part-annuelle" style="width:100%"></span>'
                  : `<span class="temps-part temps-part-annonce"
                       style="width:${(declare / plafond) * 100}%"></span>
                     <span class="temps-part temps-part-fait"
                       style="width:${(fait / plafond) * 100}%"></span>`
              }
            </div>
            <p class="temps-detail discret">${dit}${fait ? ` · ${heures(fait)} mesurées` : ''}</p>
          </li>`;
        })
        .join('')}
    </ul>`;
}

// --- Ce que le hub sait, et ce qu'il ignore -----------------------------------
//
// Le chiffre le plus important de la page. Sans lui, un total bas se lirait
// comme une semaine légère, alors qu'il ne dit que le silence des durées.
export function construireCouverture(taches, publications) {
  const faites = taches.filter((tache) => tache.statut === 'fait');
  const parties = publications.filter((publication) => publication.statut === 'publie');
  const avec = faites.filter((t) => t.duree).length + parties.filter((p) => p.duree).length;
  const total = faites.length + parties.length;
  if (!total) return '';

  return `
    <p class="temps-couverture discret">
      <span class="chiffre">${avec}</span> des <span class="chiffre">${total}</span> choses
      terminées portent une durée. Le reste est passé sans être compté — ce n'est
      pas une faute, c'est ce que cette page ne peut pas montrer.
    </p>`;
}

function squelette(donnees, semaine, periode) {
  return `
    <h1>Mon temps</h1>
    <p class="discret sous-titre">Où partent tes heures. Rien ici ne juge :
      un écart entre ce qui est annoncé et ce qui est mesuré est une information.</p>

    ${construireCouverture(donnees.taches, donnees.publications)}

    <section class="bloc">
      <h2>Cette semaine</h2>
      ${
        periode
          ? `<p class="discret">Sous la période « ${echapper(periode.nom)} ».</p>`
          : ''
      }
      ${construireSemaine(donnees, semaine, periode)}
    </section>

    <section class="bloc">
      <h2>Projet par projet</h2>
      <p class="discret">Le trait creux dit ce qui est annoncé, le trait plein ce
        qui a été mesuré sur les tâches terminées.</p>
      ${construireProjets(donnees.projets, donnees.taches)}
    </section>`;
}

// --- L'espace -----------------------------------------------------------------

export default {
  async monter(section) {
    const charger = async () => {
      const semaine = semaineDe(new Date());
      // Une semaine large de part et d'autre : un événement du dimanche soir
      // qui déborde sur lundi doit être vu par la borne, pas coupé par elle.
      const [evenements, taches, publications, projets, periodes] = await Promise.all([
        api.evenementsEntre(`${semaine.debut}T00:00:00`, `${semaine.fin}T23:59:59`),
        api.tachesToutes(),
        api.publicationsToutes(),
        api.projetsTous(),
        api.periodesToutes(),
      ]);

      const donnees = { evenements, taches, publications, projets };
      section.innerHTML = squelette(donnees, semaine, periodeDuJour(periodes, new Date()));
    };

    this.rafraichir = charger;

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement du temps impossible', erreur);
      section.innerHTML = `
        <h1>Mon temps</h1>
        <p class="vide">Les heures n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
    }
  },
};
