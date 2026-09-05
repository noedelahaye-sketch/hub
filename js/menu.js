// Le menu — le second rang de navigation (28 août 2026, décision de Noé).
//
// LA RÈGLE : le coût d'accès d'une page est proportionnel à l'intention qu'il
// faut pour la vouloir. Ce qui se voit sans geste est le fruit d'aucune envie —
// juste le récap. Tout le reste se mérite un clic de plus, et peut donc être
// aussi riche qu'on veut. Quatre rangs :
//
//   0 geste   l'accueil
//   1 geste   les onglets — accueil, perso, calendrier
//   2 gestes  le menu — quatre grands titres
//   3 gestes  la flèche — les groupes et les pages
//   4 gestes  la flèche d'un groupe — ses pages, en accès direct
//
// LE QUATRIÈME RANG EST NÉ LE 5 SEPTEMBRE 2026 (demande de Noé : « il y a un
// peu trop de sous-pages, il faudrait créer des sous-pages qui regroupent des
// sous-sous pages — enfin même pas des sous-pages, juste des titres »).
// Vingt-quatre liens sous six titres, ça ne se parcourt plus : ça se relit.
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
// LE MÊME GESTE À TOUS LES RANGS : le mot mène à la page, la flèche déplie.
// C'était déjà la règle des grands titres ; le rang des groupes la reprend
// telle quelle, plutôt que d'inventer un second geste pour un même mouvement.
//
// `entrees` porte le rang intermédiaire — des groupes qui ont leur page ET
// leurs sous-pages ; `pages` porte les feuilles. Une rubrique n'a que l'un des
// deux : les espaces vont droit à leurs pages, « Général » passe par ses
// groupes.
//
// LA PREMIÈRE PERSONNE, partout où le sujet est Noé (demande de Noé, 5
// septembre 2026) : « Mes habitudes », « Ma bibliothèque », « Mon chemin ».
// Elle s'arrête aux espaces, où « Ses objectifs » désigne l'espace et non lui.
// Ces noms sont AUSSI ceux des pages : un nom dans le menu et un autre dans le
// titre, ce serait deux noms pour une page — le défaut corrigé le 28 août.
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
    // GÉNÉRAL RÉUNIT LE TRANSVERSE ET LE PERSO (5 septembre 2026, demande de
    // Noé). Ce sont les deux rubriques qui ne sont pas des espaces — les deux
    // qui parlent de LUI plutôt que d'un domaine. Les trois autres grands
    // titres sont ses espaces ; celui-ci est lui.
    //
    // IL N'A PAS D'ADRESSE, et c'est voulu : un titre qui n'a pas de page n'est
    // pas un lien. C'est le symétrique de la règle des flèches — une flèche qui
    // ne s'ouvre sur rien est un mensonge de forme, un mot qui ne mène nulle
    // part en serait un autre.
    nom: 'Général',
    entrees: [
      {
        // « Un sous-titre déroulant "le cap" qui regroupe objectifs, projets,
        // tâches, périodes et le chemin » (Noé). Le mot s'élargit : dans le
        // hub, « Le cap » désignait l'ÉTAGE des objectifs. Il désigne
        // désormais TOUT CE QUI VISE — ce qu'on se donne, ce qui y mène, et ce
        // qu'on a franchi.
        //
        // LES INTENTIONS Y ENTRENT (même demande) : une intention est un
        // objectif dont on a retiré la mesure et la date — sa place est dans le
        // cap, pas au milieu des habitudes.
        //
        // EN DERNIER, et c'est Noé qui l'a repris : elles avaient été posées
        // juste après les objectifs, par parenté. Mais l'ordre de ce groupe
        // suit ce qu'on y FAIT — viser, découper, faire, cadrer, regarder en
        // arrière —, et une intention ne se fait pas : elle se relit. Elle
        // ferme donc la liste.
        nom: 'Mon cap',
        adresse: '#objectifs',
        nav: 'objectifs',
        pages: [
          { nom: 'Mes objectifs', adresse: '#objectifs/caps' },
          { nom: 'Mes projets', adresse: '#objectifs/projets' },
          { nom: 'Mes tâches', adresse: '#taches', nav: 'taches' },
          { nom: 'Mes périodes', adresse: '#objectifs/periodes' },
          { nom: 'Mon chemin', adresse: '#chemin', nav: 'chemin' },
          // MON TEMPS ENTRE DANS LE CAP (5 septembre 2026, demande de Noé),
          // juste après le chemin : les deux regardent en arrière — l'un ce
          // qu'on a franchi, l'autre où sont parties les heures.
          { nom: 'Mon temps', adresse: '#temps', nav: 'temps' },
          { nom: 'Mes intentions', adresse: '#perso/intentions' },
        ],
      },
      // UN SEUL GROUPE, « MON CAP » — tout le reste est une PAGE À LA SUITE
      // D'UNE PAGE (5 septembre 2026, correction de Noé : « non, pas de
      // sous-page en dessous de Ma semaine, juste page en dessous de page »).
      //
      // C'était sa demande depuis le début, et il a fallu qu'il la redise :
      // « place-les sous Ma semaine » voulait dire EN DESSOUS dans la liste, pas
      // À L'INTÉRIEUR. Un pli de plus se paie d'un geste de plus, et seul le cap
      // en portait assez pour le justifier.
      //
      // L'ORDRE DIT LE RYTHME : la semaine qu'on programme, les jours qu'on
      // relit, ce qui revient. Les journées et les habitudes venaient de
      // « Perso » ; elles sont mieux ici, à côté de la semaine, parce que ce
      // sont les trois pages du temps qui passe.
      //
      // La page du dimanche soir : l'accueil ouvre sa porte dans sa fenêtre —
      // dimanche 20 h, et le lundi ; le menu la garde ouverte le reste du temps,
      // sinon une semaine qu'on veut reprendre le mercredi n'aurait aucun
      // chemin.
      { nom: 'Ma semaine', adresse: '#semaine', nav: 'semaine' },
      { nom: 'Mes journées', adresse: '#perso/journee' },
      { nom: 'Mes habitudes', adresse: '#perso/habitudes' },
      {
        // PERSO N'A PLUS DE SOUS-PAGE (5 septembre 2026) : l'humeur, les
        // rendez-vous et les victoires ont perdu leur écran ; les journées et
        // les habitudes sont remontées à côté de la semaine ; la bibliothèque
        // aussi. Il ne reste que son tableau de bord — donc pas de flèche, et
        // c'est la règle : une flèche qui ne s'ouvre sur rien est un mensonge de
        // forme.
        nom: 'Perso',
        adresse: '#perso',
        nav: 'perso',
        espace: 'perso',
      },
      // LA BIBLIOTHÈQUE AU MÊME RANG QUE PERSO, et non dessous (demande de
      // Noé). Elle est déjà un hall à deux portes : la ranger sous un pli aurait
      // fait trois gestes pour atteindre ce qu'on lit ce soir. Ses deux rayons
      // se prennent à ses portes, jamais au menu — un même endroit ne se donne
      // pas deux chemins.
      { nom: 'Ma bibliothèque', adresse: '#perso/bibliotheque' },
    ],
  },
  // LES TROIS ESPACES GARDENT LEURS LIENS À PLAT (décision de Noé) : trois ou
  // quatre liens ne valent pas un pli de plus. Et « Ses » y désigne l'espace,
  // pas Noé — c'est pourquoi la première personne s'arrête ici.
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
];

const FLECHE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="m6 9 6 6 6-6"></path></svg>`;

// Ce qui est déplié, à tous les rangs. La clé d'un groupe porte sa rubrique
// (« Général/Mon cap ») : deux groupes de deux rubriques pourraient partager un
// nom, et se déplieraient alors ensemble.
//
// Retenu d'une ouverture à l'autre : rouvrir le menu pour retrouver tout replié
// ferait refaire le même geste à chaque fois.
const depliees = new Set(['Général']);

// LE MOT ET LA FLÈCHE, à n'importe quel rang. Le mot mène à la page quand il y
// en a une ; sinon c'est un simple titre — un mot qui ne mène nulle part ne se
// présente pas comme un lien.
function tete(item, cle, classe) {
  const enfants = item.entrees ?? item.pages ?? [];

  const fleche = enfants.length
    ? `<button type="button" class="menu-fleche" data-deplier="${cle}"
         aria-label="Déplier ${item.nom}" aria-expanded="false">${FLECHE}</button>`
    : '';

  const mot = item.adresse
    ? `<a href="${item.adresse}"${item.nav ? ` data-nav="${item.nav}"` : ''} data-menu-lien>
         <span class="menu-pastille" aria-hidden="true"></span>${item.nom}</a>`
    : `<span class="menu-titre-seul">
         <span class="menu-pastille" aria-hidden="true"></span>${item.nom}</span>`;

  return `<div class="${classe}">${mot}${fleche}</div>`;
}

// UNE FEUILLE PORTE SA PASTILLE SI ELLE A UNE COULEUR (5 septembre 2026,
// demande de Noé : « garde la petite pastille violette devant Perso »). Perso a
// perdu ses sous-pages, donc son rang de groupe ; il n'a pas perdu son espace,
// et sa couleur est ce qui le fait retrouver du regard dans une liste de sept
// lignes grises.
function feuille(page) {
  const teinte = page.espace ? ` data-espace="${page.espace}"` : '';
  const pastille = page.espace
    ? '<span class="menu-pastille" aria-hidden="true"></span>'
    : '';
  return `<a href="${page.adresse}"${page.nav ? ` data-nav="${page.nav}"` : ''}${teinte}
     data-menu-lien>${pastille}${page.nom}</a>`;
}

function groupe(item, cleParente) {
  const cle = `${cleParente}/${item.nom}`;
  const teinte = item.espace ? ` data-espace="${item.espace}"` : '';
  const sous = (item.pages ?? []).length
    ? `<div class="menu-sous">${item.pages.map(feuille).join('')}</div>`
    : '';

  // Un groupe SANS sous-page est une feuille : lui donner l'habillage d'un
  // groupe promettrait un pli qui n'existe pas.
  if (!sous) return feuille(item);

  return `
    <div class="menu-groupe" data-rubrique="${cle}"${teinte}>
      ${tete(item, cle, 'menu-moyen')}
      ${sous}
    </div>`;
}

function rubrique(item) {
  const teinte = item.espace ? ` data-espace="${item.espace}"` : '';

  const dedans = item.entrees
    ? item.entrees.map((entree) => groupe(entree, item.nom)).join('')
    : (item.pages ?? []).map(feuille).join('');

  const sous = dedans ? `<div class="menu-sous">${dedans}</div>` : '';

  return `
    <div class="menu-rubrique" data-rubrique="${item.nom}"${teinte}>
      ${tete(item, item.nom, 'menu-grand')}
      ${sous}
    </div>`;
}

// LE CHEMIN JUSQU'À UN ESPACE, pour que le menu s'ouvre déjà déplié dessus.
// Perso vit maintenant sous « Général » : sans ce chemin, ouvrir le menu depuis
// perso ne montrerait rien de perso.
function cheminVers(nav) {
  for (const item of RUBRIQUES) {
    if (item.nav === nav) return (item.pages ?? []).length ? [item.nom] : [];
    for (const entree of item.entrees ?? []) {
      if (entree.nav !== nav) continue;
      // La rubrique s'ouvre toujours — sinon l'entrée resterait cachée ; le
      // groupe ne s'ouvre que s'il a quelque chose à montrer.
      return (entree.pages ?? []).length
        ? [item.nom, `${item.nom}/${entree.nom}`]
        : [item.nom];
    }
  }
  return [];
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
    // `.menu-rubrique` et `.menu-groupe` portent tous deux `data-rubrique` :
    // un seul balayage pour les deux rangs, et un pli se comporte partout de la
    // même façon.
    for (const bloc of voile.querySelectorAll('[data-rubrique]')) {
      const ouvert = depliees.has(bloc.dataset.rubrique);
      bloc.classList.toggle('ouverte', ouvert);
      // `:scope >` : sans lui, un groupe déplié volerait la flèche de sa
      // rubrique — `querySelector` descend dans tout l'arbre.
      bloc
        .querySelector(':scope > .menu-grand > .menu-fleche, :scope > .menu-moyen > .menu-fleche')
        ?.setAttribute('aria-expanded', String(ouvert));
    }
  }

  function ouvrir() {
    // La rubrique de l'espace où l'on est se déplie d'elle-même, ET tout le
    // chemin qui y mène : ouvrir le menu depuis Yuno doit montrer les pages de
    // Yuno, pas les faire chercher. Depuis perso, il faut ouvrir « Général »
    // puis « Perso » — deux plis, pas un.
    for (const cle of cheminVers(document.body.dataset.espace)) depliees.add(cle);

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
