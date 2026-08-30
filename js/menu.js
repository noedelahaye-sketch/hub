// Le menu — le second rang de navigation (28 août 2026, décision de Noé).
//
// LA RÈGLE : le coût d'accès d'une page est proportionnel à l'intention qu'il
// faut pour la vouloir. Ce qui se voit sans geste est le fruit d'aucune envie —
// juste le récap. Tout le reste se mérite un clic de plus, et peut donc être
// aussi riche qu'on veut. Quatre rangs :
//
//   0 geste   l'accueil
//   1 geste   les onglets — accueil, perso, calendrier
//   2 gestes  le menu — six grands titres
//   3 gestes  la flèche — les sous-pages, en accès direct
//
// C'est ce second rang qui permet aux pages du dessus de MAIGRIR : l'accueil
// portait tout parce qu'il n'y avait nulle part où poser le reste.
//
// Ce que le menu ne fait PAS : il ne perce pas les deux sites. Yuno et le FC
// Hermitage sont indépendants et s'ouvrent par leur propre application —
// « si je clique sur le hub ce n'est pas pour atteindre le site Yuno » (Noé).
// Chaque espace n'offre donc que sa porte, jamais les écrans qu'il y a
// derrière.

// Les rubriques, dans l'ordre des journées de Noé après le titre transverse :
// FCH, formation, Yuno — le même ordre que la galerie du cap (`ESPACES`,
// js/objectifs.js). Une rubrique sans `pages` n'a pas de flèche : une flèche
// qui ne s'ouvrirait sur rien serait un mensonge de forme.
//
// `nav` sert au marquage de l'onglet actif (`[data-nav]`, app.js) : c'est le
// nom de l'espace, pas l'adresse.
// « Ses objectifs », « ses projets », « ses tâches » ne sont PAS de nouvelles
// pages : c'est la page transverse avec son filtre déjà posé, porté par
// l'adresse (`#objectifs/projets/fch`, `#taches/photo`). Un seul écran à tenir,
// plusieurs portes pour y entrer — cinq listes de tâches finiraient par ne plus
// dire la même chose.
export const RUBRIQUES = [
  {
    nom: 'Général',
    nav: 'objectifs',
    adresse: '#objectifs',
    pages: [
      { nom: 'Objectifs', adresse: '#objectifs/caps' },
      { nom: 'Projets', adresse: '#objectifs/projets' },
      { nom: 'Tâches', adresse: '#taches', nav: 'taches' },
      { nom: 'Périodes', adresse: '#objectifs/periodes' },
      // La page du dimanche soir (30 août 2026). L'accueil ouvre sa porte dans
      // sa fenêtre — dimanche 20 h, et le lundi ; le menu la garde ouverte le
      // reste du temps, sinon une semaine qu'on veut reprendre le mercredi
      // n'aurait aucun chemin.
      { nom: 'Ma semaine', adresse: '#semaine', nav: 'semaine' },
      { nom: 'Le chemin', adresse: '#chemin', nav: 'chemin' },
    ],
  },
  {
    nom: 'FC Hermitage',
    nav: 'fch',
    espace: 'fch',
    adresse: '#fch',
    pages: [
      { nom: 'Ses objectifs', adresse: '#objectifs/caps/fch' },
      { nom: 'Ses projets', adresse: '#objectifs/projets/fch' },
      { nom: 'Ses tâches', adresse: '#taches/fch' },
      { nom: 'Le site', adresse: '#hermitage', nav: 'hermitage' },
    ],
  },
  {
    nom: 'Formation',
    nav: 'formation',
    espace: 'formation',
    adresse: '#formation',
    pages: [
      { nom: 'Ses objectifs', adresse: '#objectifs/caps/formation' },
      { nom: 'Ses projets', adresse: '#objectifs/projets/formation' },
      { nom: 'Ses tâches', adresse: '#taches/formation' },
    ],
  },
  {
    nom: 'Yuno',
    nav: 'photo',
    espace: 'photo',
    adresse: '#photo',
    pages: [
      { nom: 'Ses objectifs', adresse: '#objectifs/caps/photo' },
      { nom: 'Ses projets', adresse: '#objectifs/projets/photo' },
      { nom: 'Ses tâches', adresse: '#taches/photo' },
      { nom: 'Le site', adresse: '#yuno', nav: 'yuno' },
    ],
  },
  {
    // Ni objectifs ni projets : l'espace perso ne mesure rien, jamais. Ses
    // tâches se lisent dans l'espace Tâches comme toutes les autres — les
    // ranger ici en ferait une cinquième chose à suivre.
    nom: 'Perso',
    nav: 'perso',
    espace: 'perso',
    adresse: '#perso',
    // SEPT SOUS-PAGES depuis le 30 août 2026, contre quatre avant. Les trois
    // neuves — habitudes, bibliothèque, journées — sont assez grandes pour
    // avoir leur écran : les laisser dans la page perso en aurait fait une
    // liste de sept blocs qu'on fait défiler, c'est-à-dire l'inverse d'un lieu
    // où l'on vient se recentrer.
    //
    // L'ordre suit ce qu'on ouvre le plus souvent, pas l'ordre d'arrivée.
    pages: [
      { nom: 'Les habitudes', adresse: '#perso/habitudes' },
      { nom: 'La bibliothèque', adresse: '#perso/bibliotheque' },
      { nom: 'Les journées', adresse: '#perso/journee' },
      { nom: 'Les intentions', adresse: '#perso/intentions' },
      { nom: 'Les rendez-vous', adresse: '#perso/rendez-vous' },
      { nom: "L'humeur", adresse: '#perso/humeur' },
      { nom: 'Les victoires', adresse: '#perso/victoires' },
    ],
  },
  {
    nom: 'Le temps',
    nav: 'temps',
    adresse: '#temps',
  },
];

const FLECHE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="m6 9 6 6 6-6"></path></svg>`;

// Les rubriques dépliées. Retenu d'une ouverture à l'autre : rouvrir le menu
// pour retrouver tout replié ferait refaire le même geste à chaque fois.
const depliees = new Set(['Général']);

function rubrique(item) {
  const pages = item.pages ?? [];
  const teinte = item.espace ? ` data-espace="${item.espace}"` : '';

  const fleche = pages.length
    ? `<button type="button" class="menu-fleche" data-deplier="${item.nom}"
         aria-label="Déplier ${item.nom}" aria-expanded="false">${FLECHE}</button>`
    : '';

  const sous = pages.length
    ? `<div class="menu-sous">${pages
        .map(
          (page) =>
            `<a href="${page.adresse}"${page.nav ? ` data-nav="${page.nav}"` : ''}
               data-menu-lien>${page.nom}</a>`,
        )
        .join('')}</div>`
    : '';

  return `
    <div class="menu-rubrique" data-rubrique="${item.nom}"${teinte}>
      <div class="menu-grand">
        <a href="${item.adresse}" data-nav="${item.nav}" data-menu-lien>
          <span class="menu-pastille" aria-hidden="true"></span>${item.nom}</a>
        ${fleche}
      </div>
      ${sous}
    </div>`;
}

// --- Le montage ---------------------------------------------------------------
//
// Le menu vit dans la coquille, hors des espaces : il survit aux changements
// d'écran, ses écouteurs sont donc posés une seule fois.

export function monterLeMenu(barre) {
  barre.insertAdjacentHTML(
    'afterbegin',
    `<button type="button" id="bouton-menu" class="bouton-menu"
       aria-label="Toutes les pages" aria-expanded="false" aria-controls="menu-voile">
       <span></span><span></span><span></span>
     </button>`,
  );

  document.getElementById('app').insertAdjacentHTML(
    'beforeend',
    `<div id="menu-voile" class="menu-voile" hidden>
       <nav class="menu" aria-label="Toutes les pages">
         ${RUBRIQUES.map(rubrique).join('')}
       </nav>
     </div>`,
  );

  const bouton = document.getElementById('bouton-menu');
  const voile = document.getElementById('menu-voile');

  function appliquerLesPlis() {
    for (const bloc of voile.querySelectorAll('.menu-rubrique')) {
      const ouvert = depliees.has(bloc.dataset.rubrique);
      bloc.classList.toggle('ouverte', ouvert);
      bloc
        .querySelector('.menu-fleche')
        ?.setAttribute('aria-expanded', String(ouvert));
    }
  }

  function ouvrir() {
    // La rubrique de l'espace où l'on est se déplie d'elle-même : ouvrir le
    // menu depuis Yuno doit montrer les pages de Yuno, pas les faire chercher.
    const ici = RUBRIQUES.find((item) => item.nav === document.body.dataset.espace);
    if (ici?.pages?.length) depliees.add(ici.nom);

    appliquerLesPlis();
    // Le panneau tombe sous la barre, mesurée à l'instant. Le fond est figé au
    // HAUT de la page dès que le menu s'ouvre (`figerLeFond`) : la mesure est
    // donc stable tant qu'il est ouvert.
    voile.style.setProperty(
      '--sous-la-barre',
      `${Math.round(barre.getBoundingClientRect().bottom)}px`,
    );
    voile.hidden = false;
    bouton.classList.add('ouvert');
    bouton.setAttribute('aria-expanded', 'true');
    bouton.setAttribute('aria-label', 'Fermer le menu');
  }

  function fermer() {
    voile.hidden = true;
    bouton.classList.remove('ouvert');
    bouton.setAttribute('aria-expanded', 'false');
    bouton.setAttribute('aria-label', 'Toutes les pages');
  }

  bouton.addEventListener('click', () => {
    if (voile.hidden) ouvrir();
    else fermer();
  });

  voile.addEventListener('click', (evenement) => {
    // Le fond referme, comme sous une tuile de capture.
    if (evenement.target === voile) return fermer();

    const fleche = evenement.target.closest('.menu-fleche');
    if (fleche) {
      const nom = fleche.dataset.deplier;
      if (depliees.has(nom)) depliees.delete(nom);
      else depliees.add(nom);
      appliquerLesPlis();
      return;
    }

    // Un lien mène quelque part : le menu n'a plus de raison d'être ouvert.
    if (evenement.target.closest('[data-menu-lien]')) fermer();
  });

  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape' && !voile.hidden) {
      fermer();
      bouton.focus();
    }
  });

  appliquerLesPlis();
}
