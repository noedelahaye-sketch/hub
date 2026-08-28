// Le chemin — le miroir de ce qui a été accompli (28 août 2026).
//
// La philosophie du hub dit que le tableau de bord est « d'abord un miroir de
// ce qui a été accompli, pas une liste de ce qui reste ». Les victoires ont
// pourtant quitté l'accueil le 13 août : elles encombraient le check-in du
// matin, et Noé les a masquées. Le miroir n'existait donc plus nulle part.
//
// Il a maintenant sa page, au second rang : on l'ouvre quand on en a besoin,
// pas tous les matins. C'est exactement le genre de page que la barre ne doit
// pas porter — le fruit d'une envie, jamais de rien.
//
// LA SOURCE EST UNIQUE : la table `victoires`. Terminer une tâche, franchir un
// jalon, atteindre un objectif, vivre une sortie — tout y écrit déjà. Recompter
// les tâches faites à côté donnerait deux chiffres pour un seul fait.
//
// Rien ne s'y modifie. Une victoire se crée là où le travail se fait, et se
// retire là où elle a été écrite : cette page ne fait que regarder en arrière.

import * as api from './api.js';
import { depuisDateISO, echapper, NOMS_ESPACES } from './format.js';

const ORDRE_ESPACES = ['fch', 'formation', 'photo', 'perso'];

// D'où vient la victoire. Le mot est au singulier et en encre discrète : il
// explique la ligne, il ne la commente pas.
const SOURCES = {
  tache: 'tâche terminée',
  jalon: 'jalon franchi',
  objectif: 'objectif atteint',
  moment: 'sortie vécue',
  manuel: null, // écrite à la main : rien à expliquer.
};

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function moisDe(dateISO) {
  const date = depuisDateISO(dateISO);
  return { cle: dateISO.slice(0, 7), nom: `${MOIS[date.getMonth()]} ${date.getFullYear()}` };
}

// --- Le rendu -----------------------------------------------------------------

export function construireBilan(victoires) {
  if (!victoires.length) return '';

  const parEspace = ORDRE_ESPACES.map((espace) => ({
    espace,
    combien: victoires.filter((victoire) => victoire.espace === espace).length,
  })).filter((ligne) => ligne.combien);

  // La plus ancienne dit depuis quand le fil court. Les victoires arrivent
  // triées du plus récent au plus ancien : c'est la dernière du tableau.
  const depuis = moisDe(victoires[victoires.length - 1].date).nom;

  return `
    <div class="chemin-bilan">
      <p class="chemin-total"><span class="chiffre">${victoires.length}</span>
        victoire${victoires.length > 1 ? 's' : ''} depuis ${echapper(depuis)}</p>
      <ul class="chemin-parts">
        ${parEspace
          .map(
            ({ espace, combien }) => `
          <li data-espace="${espace}"><span class="pastille" aria-hidden="true"></span>
            ${echapper(NOMS_ESPACES[espace] ?? espace)}
            <span class="chiffre">${combien}</span></li>`,
          )
          .join('')}
      </ul>
    </div>`;
}

export function construireFil(victoires) {
  if (!victoires.length) {
    return `<p class="vide">Tes premières victoires s'afficheront ici.</p>`;
  }

  // Groupées par mois, du plus récent au plus ancien. Un fil sans repère de
  // temps se lit comme une liste ; avec les mois, il se lit comme un chemin.
  const mois = [];
  for (const victoire of victoires) {
    const { cle, nom } = moisDe(victoire.date);
    if (mois.at(-1)?.cle !== cle) mois.push({ cle, nom, lignes: [] });
    mois.at(-1).lignes.push(victoire);
  }

  return mois
    .map(
      ({ cle, nom, lignes }) => `
      <section class="bloc chemin-mois">
        <h2 class="chemin-mois-titre">${echapper(nom)}
          <span class="chiffre">${lignes.length}</span></h2>
        <ul class="chemin-liste">
          ${lignes
            .map((victoire) => {
              const jour = depuisDateISO(victoire.date).getDate();
              const source = SOURCES[victoire.source] ?? null;
              return `
              <li data-espace="${victoire.espace}" data-victoire="${echapper(victoire.id)}">
                <span class="chemin-jour chiffre">${jour}</span>
                <span class="chemin-titre">${echapper(victoire.titre)}</span>
                ${source ? `<span class="chemin-source discret">${source}</span>` : ''}
              </li>`;
            })
            .join('')}
        </ul>
      </section>`,
    )
    .join('');
}

function squelette(victoires) {
  return `
    <h1>Le chemin</h1>
    <p class="discret sous-titre">Ce que tu as fait, tous espaces confondus.
      Le perso au même rang que le reste.</p>

    ${construireBilan(victoires)}
    <div data-bloc="fil">${construireFil(victoires)}</div>`;
}

// --- L'espace -----------------------------------------------------------------

export default {
  async monter(section) {
    const charger = async () => {
      section.innerHTML = squelette(await api.victoiresToutes());
    };

    this.rafraichir = charger;

    try {
      await charger();
    } catch (erreur) {
      console.error('Chargement du chemin impossible', erreur);
      section.innerHTML = `
        <h1>Le chemin</h1>
        <p class="vide">Les victoires n'ont pas pu être chargées.</p>
        <button type="button" class="bouton-secondaire" data-action="reessayer">Réessayer</button>`;
      section
        .querySelector('[data-action="reessayer"]')
        ?.addEventListener('click', () => this.monter(section));
    }
  },
};
