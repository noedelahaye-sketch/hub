// LE PROJET DU FC HERMITAGE — la matière de `#hermitage/projet-club` et des
// pages de valeur (16 septembre 2026).
//
// POURQUOI CE FICHIER ET PAS UNE TABLE, c'est l'argument de `js/club-fch.js` :
// rien ici ne change plus d'une fois par an, rien ne se coche, rien ne se
// compte. Une table aurait demandé une migration, un écran d'édition et une API
// pour des lignes que personne ne modifie.
//
// D'OÙ ÇA VIENT, et c'est ce qui le rend citable. Tout est dans
// `FCH/Communication/Club/Projet club/` :
//   — la mission, ses critères et la signification des valeurs :
//     « La Mission et les Valeurs - Réunion 2.pptx » (réunion projet n° 2) ;
//   — la définition publique de chaque valeur, ses trois idées et ses mots
//     associés : les carrousels Instagram du dossier `Valeurs/` ;
//   — les quatre piliers de la mission : `Valeurs/Valures.png` ;
//   — les objectifs, leurs pôles, leurs indicateurs et leurs projets :
//     « Les objectifs et projets du FCH.pdf », les trois tableaux ;
//   — les trois objectifs de l'AG et la priorité de chaque horizon :
//     « Réunion Projet - 20_06_26.pdf », compte-rendu du CA du 20 juin 2026.
//
// CE QUI N'EST PAS ICI, VOLONTAIREMENT : les projets du club en base
// (`projets`), qui sont ceux de NOÉ et se cochent. Ceux d'ici sont les projets
// du CLUB, écrits sur un tableau, sans porteur ni échéance de travail. Les
// mêmes mots, deux natures — et c'est pour ça qu'ils ne se mélangent pas.
//
// L'ÉCRAN QUI LES MONTRE NE FAIT QUE LIRE.

// ── LA MISSION ────────────────────────────────────────────────────────────────

export const MISSION_FCH = {
  phrase: 'Transmettre l’envie de jouer.',
  // La formulation complète, telle que la réunion n° 2 l'a arrêtée.
  developpee:
    'La mission du FC Hermitage est de transmettre l’envie de jouer grâce à ses '
    + 'valeurs singulières. Car le jeu est vu chez nous comme essentiel : il permet '
    + 'de grandir et de s’épanouir.',
  // Les quatre piliers du visuel de la mission.
  piliers: [
    'Le plaisir est au centre de tout',
    'Jouer, c’est se mettre en action',
    'On fait vivre notre histoire',
    'Nos valeurs nous guident',
  ],
  // Ce qu'une mission doit tenir — les quatre critères que le club s'est donnés
  // avant de choisir la sienne. Ils expliquent pourquoi c'est CETTE phrase.
  criteres: [
    ['Intemporelle', 'Elle reste valable dans 5, 10, 20 ans, peu importe les résultats sportifs ou la taille du club.'],
    ['Universelle', 'Elle parle à tout le monde : joueurs, parents, éducateurs, dirigeants, bénévoles, partenaires.'],
    ['Inspirante', 'Elle donne envie de s’engager et d’y croire ; ce n’est pas une simple description.'],
    ['Claire', 'Elle tient en une phrase simple, facile à retenir et à répéter.'],
  ],
  // Les quatre missions écartées, avec qui les portait. Elles disent ce que la
  // mission retenue a choisi de ne PAS être, et c'est la moitié de son sens.
  ecartees: [
    ['Priorité sportive', 'Offrir à tous une expérience de football exigeante et ambitieuse, où l’épanouissement, la formation et la vie associative soutiennent la progression sportive du club.'],
    ['Priorité associative', 'Rassembler nos communes autour d’une communauté chaleureuse et inclusive, où le football crée du lien, soutient chacun et fait vivre un esprit familial durable.'],
    ['Priorité RSE', 'Agir comme un club responsable qui utilise le football pour promouvoir le respect, la non-violence et l’engagement citoyen, au service d’un impact positif sur notre territoire.'],
    ['Priorité éducation', 'Former des jeunes et des adultes épanouis, autonomes et responsables grâce au football, en s’appuyant sur une communauté solidaire et un cadre éducatif fort.'],
  ],
};

// ── LES VALEURS ───────────────────────────────────────────────────────────────

// LES COULEURS SONT CELLES DU CLUB, relevées dans ses propres carrousels. Elles
// vont par paires — deux bleus, deux rouges, deux ors — parce que le club les a
// voulues ainsi : sur Instagram les valeurs passent une par une, la répétition
// ne se voit pas. Ici six tuiles se regardent ensemble, donc **la couleur ne
// porte pas l'identité** : le rang et le nom le font, la couleur rappelle le
// carrousel. Seul l'esprit collectif est ÉCLAIRCI (le club a #003090, plus
// sombre que le fond du site, où il aurait disparu).
//
// `principale` : les trois valeurs que la réunion n° 2 a retenues comme
// principales, celles qui portent la mission.
export const VALEURS_FCH = [
  {
    id: 'collectif',
    rang: 1,
    nom: 'Esprit collectif',
    avecArticle: 'L’esprit collectif',
    couleur: '#1a44c8',
    principale: true,
    idees: ['Âme du club', 'Le groupe avant l’individu', 'Crée une dynamique solide'],
    definition: [
      'Au FC Hermitage, l’esprit collectif est l’âme du club.',
      'Nous ne faisons qu’un : joueurs, éducateurs, bénévoles, dirigeants et familles avancent ensemble dans une logique d’union, de cohésion et de solidarité.',
      'Nous plaçons l’intérêt du groupe avant l’individualisme pour avancer plus loin, ensemble, dans un esprit populaire et accessible à tous.',
      'Cette solidarité démultiplie la motivation de chacun et crée la dynamique nécessaire pour passer de spectateur à acteur.',
    ],
    mots: ['Solidarité', 'Entraide', 'Cohésion', 'Diversité', 'Ouverture', 'Tolérance'],
    comportement: 'Tout le monde range le matériel.',
    famille: 'Pour tout le monde',
  },
  {
    id: 'transmission',
    rang: 2,
    nom: 'Transmission',
    avecArticle: 'La transmission',
    couleur: '#e62822',
    principale: true,
    idees: ['Lien entre passé et futur', 'Partage entre générations', 'Incarner nos valeurs'],
    // La définition vient de la réunion n° 2 : le carrousel de cette valeur
    // n'a pas été exporté en image, à la différence des cinq autres.
    definition: [
      'La transmission au FC Hermitage se caractérise par l’écoute, l’ouverture et la bienveillance de chacun.',
      'Elle permet de grandir en tant que club et en tant que personne : tout le monde doit apprendre de tout le monde, et chaque jour est une opportunité d’apprendre.',
      'La transmission de nos valeurs par les plus anciens permet au club de perdurer et de garder son identité.',
    ],
    mots: ['Partage', 'Écoute', 'Ouverture', 'Bienveillance', 'Communion'],
    comportement: 'Incarner les valeurs.',
    famille: 'Grandir ensemble',
  },
  {
    id: 'respect',
    rang: 3,
    nom: 'Respect',
    avecArticle: 'Le respect',
    couleur: '#f8c000',
    principale: false,
    idees: ['Socle commun indispensable', 'Considération de chacun', 'Permet la confiance'],
    definition: [
      'Au FC Hermitage, le respect est le socle sur lequel repose tout notre projet.',
      'Il se traduit par la considération portée à chaque personne, sur le terrain comme en dehors. Nous défendons une pratique guidée par la bienveillance, le fair-play et la non-violence envers les coéquipiers, les adversaires, les arbitres, les éducateurs et les règles.',
      'Ce cadre sain et sécurisant est essentiel pour que chacun se sente en confiance. C’est cette sécurité qui donne à tous le droit de se tromper, la liberté d’essayer et l’assurance nécessaire pour oser s’impliquer.',
    ],
    mots: ['Considération', 'Fair-play', 'Bienveillance', 'Écoute', 'Non-violence'],
    comportement: 'Être à l’heure.',
    famille: 'Vivre ensemble',
  },
  {
    id: 'chaleur',
    rang: 4,
    nom: 'Chaleur humaine',
    avecArticle: 'La chaleur humaine',
    couleur: '#e83840',
    principale: false,
    idees: ['Ciment de notre convivialité', 'Qualité d’accueil', 'Se sentir à sa place'],
    definition: [
      'Au FC Hermitage, la chaleur humaine est le ciment de notre convivialité.',
      'Elle se traduit par une qualité d’accueil attentive, une proximité sincère et une bonne humeur partagée. La positivité et la simplicité font partie intégrante de la vie du club pour que chacun puisse s’y sentir à l’aise et à sa place.',
      'Ce climat serein et humain fait du FCH un lieu où il fait bon venir et rester. C’est cette ambiance qui donne l’envie de s’engager, de s’impliquer et de passer de spectateur à acteur de notre dynamique.',
    ],
    mots: ['Accueil', 'Convivialité', 'Proximité', 'Bonne humeur', 'Simplicité', 'Positivité'],
    comportement: 'Saluer les gens, sourire.',
    famille: 'Se sentir à sa place',
  },
  {
    id: 'emotions',
    rang: 5,
    nom: 'Émotions',
    avecArticle: 'Les émotions',
    couleur: '#4070e0',
    principale: false,
    idees: ['Raison d’engagement', 'Apprendre à les gérer', 'Donne sens à nos actions'],
    definition: [
      'Au FC Hermitage, les émotions sont le moteur de notre passion et la raison de notre engagement.',
      'Elles sont le fil conducteur qui nous fait vibrer, sur le terrain comme en dehors. La joie d’une victoire, la fierté d’un effort ou la déception d’une défaite : toutes les émotions ont leur importance.',
      'Notre rôle est de les reconnaître, de les partager et d’apprendre à les gérer.',
      'Vivre des émotions authentiques est ce qui nous fait nous sentir pleinement vivants. C’est cette intensité partagée qui donne tout son sens à nos actions.',
    ],
    mots: ['Plaisir', 'Passion', 'Intensité', 'Fierté'],
    comportement: 'Sauter au plafond.',
    famille: 'Vivre des émotions',
  },
  {
    id: 'investissement',
    rang: 6,
    nom: 'Investissement',
    avecArticle: 'L’investissement',
    couleur: '#d8a800',
    principale: true,
    idees: ['Énergie du club', 'Chaque contribution compte', 'Permet au club d’évoluer'],
    definition: [
      'Au FC Hermitage, l’investissement est l’énergie vitale qui fait tourner le club.',
      'Il représente le don volontaire de temps, d’énergie et de compétences pour faire vivre et évoluer notre projet.',
      'Chaque contribution compte, qu’elle soit sportive, éducative, associative ou organisationnelle : il n’y a pas de petit investissement.',
      'Sans cet effort partagé, le club ne peut ni fonctionner, ni se projeter dans l’avenir.',
    ],
    mots: ['Engagement', 'Énergie', 'Volontariat', 'Initiative', 'Dynamisme'],
    comportement: 'Se rendre disponible, venir aux manifestations.',
    famille: 'Se mettre en action',
  },
];

// ── LES OBJECTIFS ─────────────────────────────────────────────────────────────

// LES QUATRE AXES : les grands ensembles sortis du tri des idées, tous
// formulés depuis la mission — « donner envie par… ». Leurs couleurs sont
// celles du tableau du club.
export const AXES_FCH = [
  { id: 'terrain', nom: 'Donner envie par le terrain', couleur: '#5aa66f' },
  { id: 'vie', nom: 'Donner envie par la vie du club', couleur: '#c98a4b' },
  { id: 'image', nom: 'Donner envie par l’image du club', couleur: '#548fce' },
  { id: 'organisation', nom: 'Organisation du club', couleur: '#8d93a3' },
];

// LES PÔLES — ce dont on parle, et DEPUIS LE 20 SEPTEMBRE 2026 la même chose
// qu'une commission (décision de Noé : « il faut fusionner les 2, les pôles et
// les commissions c'est la même chose, certaines n'ont pas de responsable ni de
// membre mais ce n'est pas grave, ça arrivera plus tard »).
//
// *Ce que ça renverse : cette note disait « ce ne sont PAS les commissions ».
// C'était vrai des DONNÉES — cinq noms communs sur quatorze —, et Noé tranche
// sur le SENS. Un pôle et sa commission sont le même DOMAINE du club, vu depuis
// le projet d'un côté et depuis les gens de l'autre.*
//
// LES DEUX LISTES RESTENT SÉPARÉES, et c'est voulu : celle-ci porte ce qu'on
// VISE, `organigramme-fch-data.js` porte QUI le porte. Elles se rejoignent à
// l'écran — `DOMAINES` (js/projet-club.js) les marie par leur identifiant — et
// nulle part ailleurs. Les fondre en base demanderait de décider aujourd'hui
// ce que Noé a dit qui viendrait plus tard.
//
// CE QUI MANQUE DE CHAQUE CÔTÉ, sans que ce soit un défaut : l'éducatif, la
// cohésion, l'identité et l'organisation n'ont pas encore de commission ; la
// buvette n'a pas d'objectif ; le secrétariat, la trésorerie et la présidence
// sont des fonctions du bureau et ne sont pas des domaines.
//
// Les cinq qui portent le même nom qu'une commission en reprennent la couleur,
// pour qu'un pôle se reconnaisse d'un écran à l'autre.
export const POLES_FCH = [
  { id: 'sportif', nom: 'Sportif', couleur: '#dfba18' },
  { id: 'educatif', nom: 'Éducatif', couleur: '#5aa66f' },
  { id: 'infrastructures', nom: 'Infrastructures', couleur: '#cf8c4d' },
  { id: 'manifestations', nom: 'Manifestations', couleur: '#d59f55' },
  { id: 'cohesion', nom: 'Cohésion', couleur: '#c9564e' },
  { id: 'communication', nom: 'Communication', couleur: '#9580d5' },
  { id: 'partenaires', nom: 'Partenaires', couleur: '#548fce' },
  { id: 'identite', nom: 'Identité et valeurs', couleur: '#c77fa8' },
  { id: 'organisation', nom: 'Organisation du club', couleur: '#8d93a3' },
];

// LES TROIS HORIZONS. « N » est la saison en cours : N+1 est l'année qui vient,
// N+5 le cap lointain. Le club a donné une priorité à chacun des deux derniers
// lors du CA du 20 juin 2026 ; N+1 n'en a pas, c'est l'année où tout avance.
export const ECHEANCES_FCH = [
  { id: 'n1', nom: 'N+1', quand: 'La saison qui vient', priorite: null },
  { id: 'n3', nom: 'N+3', quand: 'Dans trois ans', priorite: 'Priorité éducatif' },
  { id: 'n5', nom: 'N+5', quand: 'Dans cinq ans', priorite: 'Priorité infrastructures' },
];

// UN OBJECTIF PORTE PLUSIEURS ÉCHÉANCES quand le club l'a posé sur plusieurs
// colonnes de son tableau : « augmenter le nombre de bénévoles » est visé à
// N+1, N+3 et N+5 — c'est un objectif qui court, pas trois objectifs.
// De même pour les axes : la cohésion Coachs-CA sert le terrain ET la vie du
// club, et le tableau la range dans les deux.
//
// `indicateur` n'existe que sur les objectifs de N+1 : ce sont les seuls que le
// club ait outillés. Ne pas en inventer pour les autres — un indicateur non
// décidé est un indicateur que personne ne relèvera.
export const OBJECTIFS_FCH = [
  {
    id: 'encadrement',
    emoji: '👩‍🏫',
    titre: 'Améliorer l’encadrement de nos jeunes',
    axes: ['terrain'],
    poles: ['sportif'],
    echeances: ['n1'],
    indicateur: 'Formation des éducateurs',
    projets: ['Suivi technique pour chaque catégorie'],
  },
  {
    id: 'cohesion-coachs',
    emoji: '🗣',
    titre: 'Intégrer les éducateurs à la vie du club, cohésion Coachs-CA',
    axes: ['terrain', 'vie'],
    poles: ['educatif', 'cohesion'],
    echeances: ['n1'],
    indicateur: 'Présence aux réunions et aux évènements',
    projets: ['Secret Santa Coach-CA', 'Équipe CA-Coachs au tournoi futsal'],
  },
  {
    id: 'terrains',
    emoji: '🏟',
    titre: 'Améliorer l’état des terrains',
    axes: ['terrain'],
    poles: ['infrastructures'],
    echeances: ['n1'],
    indicateur: 'Nombre de matchs et d’entraînements annulés, et leur cause',
    projets: [],
  },
  {
    id: 'benevoles',
    emoji: '👥',
    titre: 'Augmenter le nombre de bénévoles et de participants aux évènements',
    axes: ['vie'],
    poles: ['manifestations'],
    echeances: ['n1', 'n3', 'n5'],
    indicateur: 'Nombre de bénévoles et taux de présence aux évènements',
    projets: ['Créer une fiche action par évènement', 'Boucler l’administratif mairie pour les évènements'],
  },
  {
    id: 'identite',
    emoji: '🆔',
    titre: 'Développer l’identité du club pour améliorer le sentiment d’appartenance',
    axes: ['image'],
    poles: ['communication'],
    echeances: ['n1'],
    indicateur: 'Taux d’engagement sur les réseaux, nombre de présences aux matchs et aux évènements',
    projets: ['Valoriser ce que l’on fait', 'Faire participer les joueurs à la com sur les réseaux', 'Perdurer les témoignages'],
  },
  {
    id: 'sponsors',
    emoji: '📈',
    titre: 'Augmenter les revenus sponsors de 25 %, atteindre 26 K€',
    axes: ['image'],
    poles: ['partenaires'],
    echeances: ['n1'],
    indicateur: 'Chiffre des revenus sponsors',
    projets: ['Créer un dossier sponsors complet', 'Fixer 10 panneaux partenaires autour du stade'],
  },
  {
    id: 'organisation-vivante',
    emoji: '🗂',
    titre: 'Faire vivre l’organisation mise en place',
    axes: ['organisation'],
    poles: ['organisation'],
    echeances: ['n1'],
    indicateur: 'Réussite des missions des fiches de poste',
    projets: [
      '(Re)mettre en place un système de groupe WhatsApp par commission',
      'Organiser des réunions régulières par pôle',
      'Maintenir des réunions projets régulières',
    ],
  },
  {
    id: 'publics',
    titre: 'Attirer des publics plus variés',
    axes: ['terrain'],
    poles: ['sportif'],
    echeances: ['n3'],
    indicateur: null,
    projets: ['Proposer des nouvelles pratiques (foot en marchant…)'],
  },
  {
    id: 'garder',
    titre: 'Garder nos joueurs d’une catégorie à une autre',
    axes: ['terrain'],
    poles: ['sportif'],
    echeances: ['n3'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'valeurs-terrain',
    titre: 'Enseigner nos valeurs, le respect des règles et la dédramatisation du résultat, aux joueurs et aux parents',
    axes: ['terrain'],
    poles: ['educatif'],
    echeances: ['n3'],
    indicateur: null,
    projets: ['Créer et faire respecter des chartes joueurs, éducateurs et parents', 'Réaliser des actions PEF'],
  },
  {
    id: 'inter-categories',
    titre: 'Améliorer la cohésion inter-catégories',
    axes: ['vie'],
    poles: ['cohesion'],
    echeances: ['n3'],
    indicateur: null,
    projets: ['Mise en place du parrainage', 'Mettre en place la remise de maillots (un ancien pour les petits, un petit qui remet au senior…)'],
  },
  {
    id: 'label',
    titre: 'Se faire labelliser par le district',
    axes: ['image'],
    poles: ['identite'],
    echeances: ['n3'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'partenaires-fideles',
    titre: 'Avoir des partenaires fidèles et engagés sur le long terme',
    axes: ['image'],
    poles: ['partenaires'],
    echeances: ['n3'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'organigramme-sportif',
    titre: 'Améliorer la structure de l’organigramme sportif',
    axes: ['organisation'],
    poles: ['organisation'],
    echeances: ['n3'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'ecole-foot',
    titre: 'Bien gérer et former l’école de foot pour l’avenir',
    axes: ['terrain'],
    poles: ['sportif'],
    echeances: ['n5'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'd2',
    titre: 'Montée en D2 senior',
    axes: ['terrain'],
    poles: ['sportif'],
    echeances: ['n5'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'synthetique',
    titre: 'Construire un terrain synthétique',
    axes: ['terrain'],
    poles: ['infrastructures'],
    echeances: ['n5'],
    indicateur: null,
    projets: [],
  },
  {
    id: 'temps-plein',
    titre: 'Avoir au moins une personne à temps plein',
    axes: ['organisation'],
    poles: ['organisation'],
    echeances: ['n5'],
    indicateur: null,
    projets: [],
  },
];

// LES PROJETS QUE LE CLUB A POSÉS SANS LES RATTACHER À UN OBJECTIF. Ils sont
// gardés tels quels : une idée qui attend son objectif est une idée, pas une
// erreur, et la ranger de force sous un objectif serait décider à la place du
// club. Les deux dernières viennent du tableau par axe, où elles figurent sous
// un axe mais sous aucun objectif.
export const PROJETS_LIBRES_FCH = [
  { titre: 'Planifier les évènements en fonction de ceux des autres associations et de la mairie', echeance: null, poles: [] },
  { titre: 'Créer des documents structurants', echeance: 'n1', poles: [] },
  { titre: 'Mettre en place un cycle de foot à l’école', echeance: 'n1', poles: [] },
  { titre: 'Organiser 2 évènements CA, éducateurs et bénévoles', echeance: 'n1', poles: ['educatif', 'cohesion'] },
  { titre: 'Affichage Bungalow', emoji: '🖼', echeance: null, poles: ['communication'] },
  { titre: 'Travailler sur la signification de nos valeurs, avec le CA puis les coachs', echeance: 'n3', poles: [] },
  { titre: 'Organiser des stages et des tournois pour toutes les catégories', echeance: 'n3', poles: [] },
  { titre: 'Créer des (mini)évènements autour des anniversaires', echeance: 'n3', poles: [] },
  { titre: 'Créer un groupe de supporters', echeance: 'n3', poles: [] },
  { titre: 'Avoir un mini-bus pour les trajets du club', emoji: '🚌', echeance: null, poles: [], note: 'Aides du département' },
];

// LES TROIS OBJECTIFS PRÉSENTÉS À L'AG — un par axe, choisis au CA du 20 juin
// 2026. Ce sont les mots du compte-rendu, qui ne sont pas toujours ceux du
// tableau : « anticiper davantage nos manifestations » y devient « augmenter le
// nombre de bénévoles et de participants ». On garde les deux — l'un est ce qui
// a été DIT à l'assemblée, l'autre ce qui est SUIVI.
export const AG_2026 = {
  quand: 'CA du 20 juin 2026, pour l’assemblée générale du 27 juin',
  retenus: [
    ['Améliorer l’encadrement des jeunes', 'terrain'],
    ['Anticiper davantage nos manifestations', 'vie'],
    ['Augmenter nos revenus partenaires de 25 %', 'image'],
  ],
};
